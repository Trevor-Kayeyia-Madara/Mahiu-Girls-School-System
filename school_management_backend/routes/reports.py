from flask import Blueprint, request, jsonify, send_file, Response
from sqlalchemy.orm import joinedload
from io import StringIO, BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from app import db
from models import Student, Classroom, Grade, Subject, ExamSchedule
from utils.auth_utils import token_required
from utils.grade_utils import get_kcse_grade
import csv

report_bp = Blueprint('reports', __name__)


# 🧠 Determine if the class follows KCSE exam format
def is_kcse_style(class_name: str) -> bool:
    return class_name.startswith("Form 3") or class_name.startswith("Form 4")


# 📊 For Form 1-2: Combine CATs and Main Exam into weighted scores per subject
def aggregate_form1_2(grades):
    grouped = {}
    for g in grades:
        key = g.subject_id
        exam_name = g.exam_schedule.exam.name if g.exam_schedule and g.exam_schedule.exam else 'Unknown'
        grouped.setdefault(key, {'subject': g.subject.name, 'scores': []})
        grouped[key]['scores'].append((exam_name, g.marks))

    results = []
    for subject in grouped.values():
        scores = {name: score for name, score in subject['scores']}
        cat1 = scores.get("CAT 1", 0)
        cat2 = scores.get("CAT 2", 0)
        main = scores.get("Main Exam", 0)
        total = round(((cat1 + cat2) / 100 * 40) + (main / 100 * 60), 2)

        results.append({
            'subject': subject['subject'],
            'score': total,
            'grade': get_kcse_grade(total)
        })
    return results


# 📄 Individual student report (used by admin, teacher, parent)
@report_bp.route('/student/<int:student_id>', methods=['GET'])
@token_required
def student_report(current_user, student_id):
    student = Student.query.options(joinedload(Student.classroom)).get_or_404(student_id)

    # Role validation
    if current_user.role not in ['admin', 'teacher', 'parent'] and current_user.user_id != getattr(student.user, 'user_id', None):
        return jsonify({'error': 'Access denied'}), 403

    grades = Grade.query.filter_by(student_id=student_id).options(
        joinedload(Grade.subject),
        joinedload(Grade.exam_schedule).joinedload(ExamSchedule.exam)
    ).all()

    if not grades:
        return jsonify({'message': 'No grades found'}), 404

    # Form 3-4: view all exam scores
    if is_kcse_style(student.classroom.class_name):
        subject_grades = [{
            'subject': g.subject.name,
            'exam': g.exam_schedule.exam.name if g.exam_schedule and g.exam_schedule.exam else 'N/A',
            'score': g.marks,
            'grade': get_kcse_grade(g.marks),
            'term': g.exam_schedule.exam.term if g.exam_schedule and g.exam_schedule.exam else '',
            'year': g.exam_schedule.exam.year if g.exam_schedule and g.exam_schedule.exam else ''
        } for g in grades]
        average = round(sum(g.marks for g in grades) / len(grades), 2)
    else:
        # Form 1-2: aggregate into one weighted subject score
        subject_grades = aggregate_form1_2(grades)
        average = round(sum(g['score'] for g in subject_grades) / len(subject_grades), 2)

    return jsonify({
        'student_id': student.student_id,
        'student_name': f"{student.first_name} {student.last_name}",
        'class_name': student.classroom.class_name,
        'average_score': average,
        'grades': subject_grades
    })


# 📊 Class performance report (used by admin, teacher)
@report_bp.route('/class/<int:class_id>', methods=['GET'])
@token_required
def class_report(current_user, class_id):
    if current_user.role not in ['admin', 'teacher']:
        return jsonify({'error': 'Access denied'}), 403

    classroom = Classroom.query.get_or_404(class_id)
    students = Student.query.filter_by(class_id=class_id).all()
    data = []

    for s in students:
        grades = Grade.query.filter_by(student_id=s.student_id).all()
        if not grades:
            continue
        avg = round(sum(g.marks for g in grades) / len(grades), 2)
        data.append({
            'student_id': s.student_id,
            'student_name': f"{s.first_name} {s.last_name}",
            'average_score': avg,
            'mean_grade': get_kcse_grade(avg)
        })

    ranked = sorted(data, key=lambda d: d['average_score'], reverse=True)
    for i, student in enumerate(ranked, 1):
        student['position'] = i

    return jsonify({
        'class_id': classroom.class_id,
        'class_name': classroom.class_name,
        'students': ranked
    })


# ⬇ Export student report as PDF
@report_bp.route('/export/student/<int:student_id>/pdf', methods=['GET'])
@token_required
def export_student_pdf(current_user, student_id):
    student = Student.query.options(joinedload(Student.classroom)).get_or_404(student_id)

    if current_user.role not in ['admin', 'teacher', 'parent'] and current_user.user_id != getattr(student.user, 'user_id', None):
        return jsonify({'error': 'Access denied'}), 403

    grades = Grade.query.filter_by(student_id=student_id).options(
        joinedload(Grade.subject),
        joinedload(Grade.exam_schedule).joinedload(ExamSchedule.exam)
    ).all()

    if not grades:
        return jsonify({'message': 'No grades to export'}), 404

    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    y = height - 40

    p.setFont("Helvetica-Bold", 14)
    p.drawString(60, y, "📘 Student Report")
    y -= 30

    p.setFont("Helvetica", 11)
    p.drawString(60, y, f"Name: {student.first_name} {student.last_name}")
    p.drawString(300, y, f"Admission #: {student.admission_number}")
    y -= 20
    p.drawString(60, y, f"Class: {student.classroom.class_name}")
    y -= 30

    p.setFont("Helvetica-Bold", 10)
    p.drawString(60, y, "Subject")
    p.drawString(180, y, "Exam")
    p.drawString(300, y, "Marks")
    p.drawString(360, y, "Term")
    p.drawString(420, y, "Year")
    y -= 15

    p.setFont("Helvetica", 10)
    for g in grades:
        if y < 40:
            p.showPage()
            y = height - 40
        exam = g.exam_schedule.exam if g.exam_schedule else None
        p.drawString(60, y, g.subject.name)
        p.drawString(180, y, exam.name if exam else "N/A")
        p.drawString(300, y, str(g.marks))
        p.drawString(360, y, exam.term if exam else "")
        p.drawString(420, y, str(exam.year) if exam else "")
        y -= 15

    p.save()
    buffer.seek(0)

    return send_file(
        buffer,
        as_attachment=True,
        download_name=f"{student.first_name}_{student.last_name}_report.pdf",
        mimetype='application/pdf'
    )


# 📁 Export student report as CSV
@report_bp.route('/export/student/<int:student_id>/csv', methods=['GET'])
@token_required
def export_student_csv(current_user, student_id):
    student = Student.query.get_or_404(student_id)

    if current_user.role not in ['admin', 'teacher', 'parent'] and current_user.user_id != student.user_id:
        return jsonify({'error': 'Access denied'}), 403

    text_stream = StringIO()
    writer = csv.writer(text_stream)
    text_stream.write('\ufeff')  # BOM for Excel
    writer.writerow(['Student Name', 'Subject', 'Score', 'Grade', 'Exam', 'Term', 'Year'])

    grades = Grade.query.filter_by(student_id=student_id).options(
        joinedload(Grade.subject),
        joinedload(Grade.exam_schedule).joinedload(ExamSchedule.exam)
    ).all()

    for g in grades:
        exam = g.exam_schedule.exam if g.exam_schedule else None
        writer.writerow([
            f"{student.first_name} {student.last_name}",
            g.subject.name,
            g.marks,
            get_kcse_grade(g.marks),
            exam.name if exam else '',
            exam.term if exam else '',
            exam.year if exam else ''
        ])

    output = BytesIO(text_stream.getvalue().encode('utf-8'))
    output.seek(0)

    return Response(
        output,
        mimetype='text/csv',
        headers={'Content-Disposition': f'attachment; filename={student.admission_number}_report.csv'}
    )


# 📁 Export class report as CSV
@report_bp.route('/export/class/<int:class_id>/csv', methods=['GET'])
@token_required
def export_class_csv(current_user, class_id):
    if current_user.role not in ['admin', 'teacher']:
        return jsonify({'error': 'Access denied'}), 403

    classroom = Classroom.query.get_or_404(class_id)
    students = Student.query.filter_by(class_id=class_id).all()

    text_stream = StringIO()
    writer = csv.writer(text_stream)
    text_stream.write('\ufeff')
    writer.writerow(['Student Name', 'Subject', 'Marks', 'Grade', 'Exam', 'Term', 'Year'])

    for s in students:
        grades = Grade.query.filter_by(student_id=s.student_id).options(
            joinedload(Grade.subject),
            joinedload(Grade.exam_schedule).joinedload(ExamSchedule.exam)
        ).all()

        for g in grades:
            exam = g.exam_schedule.exam if g.exam_schedule else None
            writer.writerow([
                f"{s.first_name} {s.last_name}",
                g.subject.name,
                g.marks,
                get_kcse_grade(g.marks),
                exam.name if exam else '',
                exam.term if exam else '',
                exam.year if exam else ''
            ])

    output = BytesIO(text_stream.getvalue().encode('utf-8'))
    output.seek(0)

    return Response(
        output,
        mimetype="text/csv",
        headers={"Content-Disposition": f"attachment; filename={classroom.class_name}_report.csv"}
    )
    
    # Overall report
@report_bp.route('/overall-forms', methods=['GET', 'OPTIONS'])
@token_required
def overall_forms_report(current_user):
    if current_user.role not in ['admin', 'teacher']:
        return jsonify({'error': 'Access denied'}), 403

    # Fetch all students with classrooms
    students = Student.query.options(joinedload(Student.classroom)).all()

    form_data = {}

    for student in students:
        class_name = student.classroom.class_name if student.classroom else ''
        form_key = class_name.split(" ")[0] if class_name else 'Unknown'

        grades = Grade.query.filter_by(student_id=student.student_id).all()
        if not grades:
            continue

        mean_score = round(sum(g.marks for g in grades) / len(grades), 2)
        grade = get_kcse_grade(mean_score)

        student_summary = {
            'student_id': student.student_id,
            'student_name': f"{student.first_name} {student.last_name}",
            'class_name': class_name,
            'mean_score': mean_score,
            'kcse_grade': grade
        }

        if form_key not in form_data:
            form_data[form_key] = {
                'student_count': 0,
                'total_score': 0,
                'grade_distribution': {},
                'students': []
            }

        form_data[form_key]['student_count'] += 1
        form_data[form_key]['total_score'] += mean_score
        form_data[form_key]['grade_distribution'][grade] = form_data[form_key]['grade_distribution'].get(grade, 0) + 1
        form_data[form_key]['students'].append(student_summary)

    # Finalize average score per form
    for form_key, data in form_data.items():
        data['mean_score'] = round(data['total_score'] / data['student_count'], 2)
        del data['total_score']

    return jsonify(form_data), 200

# Rankings
@report_bp.route('/school/rankings', methods=['GET'])
@token_required
def school_rankings(current_user):
    if current_user.role not in ['admin', 'teacher']:
        return jsonify({'error': 'Access denied'}), 403

    forms = ['Form 1', 'Form 2', 'Form 3', 'Form 4']
    form_rankings = {}

    for form_level in forms:
        classes = Classroom.query.filter(Classroom.class_name.startswith(form_level)).all()
        student_data = []

        for classroom in classes:
            students = Student.query.filter_by(class_id=classroom.class_id).all()
            for student in students:
                grades = Grade.query.filter_by(student_id=student.student_id).all()
                if not grades:
                    continue
                avg = round(sum(g.marks for g in grades) / len(grades), 2)
                student_data.append({
                    'student_id': student.student_id,
                    'student_name': f"{student.first_name} {student.last_name}",
                    'class_name': classroom.class_name,
                    'average_score': avg,
                    'mean_grade': get_kcse_grade(avg)
                })

        ranked = sorted(student_data, key=lambda d: d['average_score'], reverse=True)
        for i, s in enumerate(ranked, 1):
            s['position'] = i

        form_rankings[form_level] = ranked

    return jsonify(form_rankings), 200
