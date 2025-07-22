from flask import Blueprint, request, jsonify, send_file, Response
from sqlalchemy.orm import joinedload
from io import StringIO, BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from sqlalchemy.orm import joinedload
from app import db
from models import Student, Classroom, Grade, Subject, ExamSchedule
from utils.auth_utils import token_required
from utils.grade_utils import get_kcse_grade
import csv

report_bp = Blueprint('reports', __name__)


def is_kcse_style(class_name: str) -> bool:
    return class_name.startswith("Form 3") or class_name.startswith("Form 4")


def aggregate_form1_2(grades):
    """Aggregate CAT 1, CAT 2, and Main Exam for each subject"""
    grouped = {}
    for g in grades:
        key = g.subject_id
        grouped.setdefault(key, {'subject': g.subject.name, 'scores': []})
        grouped[key]['scores'].append((g.exam_schedule.exam.name if g.exam_schedule and g.exam_schedule.exam else 'Unknown', g.marks))

    result = []
    for sub in grouped.values():
        scores = {name: score for name, score in sub['scores']}
        cat1 = scores.get("CAT 1", 0)
        cat2 = scores.get("CAT 2", 0)
        main = scores.get("Main Exam", 0)

        # Weighted average calculation
        total = round(((cat1 + cat2) / 100 * 40) + (main / 100 * 60), 2)
        result.append({
            'subject': sub['subject'],
            'score': total,
            'grade': get_kcse_grade(total)
        })

    return result

@report_bp.route('/student/<int:student_id>', methods=['GET'])
@token_required
def student_report(current_user, student_id):
    # Get student and their class
    student = Student.query.options(joinedload(Student.classroom)).get_or_404(student_id)

    # Access control: only admins or teachers allowed
    if current_user.role not in ['admin', 'teacher','parent']:
        return jsonify({'error': 'Access denied'}), 403

    # Get grades with subject and exam data
    grades = (
        Grade.query
        .filter_by(student_id=student_id)
        .options(
            joinedload(Grade.subject),
            joinedload(Grade.exam_schedule).joinedload(ExamSchedule.exam)
        )
        .all()
    )

    if not grades:
        return jsonify({'message': 'No grades found for this student'}), 404

    report_items = []
    for g in grades:
        exam = g.exam_schedule.exam if g.exam_schedule else None
        report_items.append({
            'subject': g.subject.name if g.subject else 'N/A',
            'exam_schedule': {
                'exam': {
                    'name': exam.name if exam else 'N/A'
                } if exam else None
            } if g.exam_schedule else None,
            'marks': g.marks,
            'grade': get_kcse_grade(g.marks),
            'term': exam.term if exam else 'N/A',
            'year': exam.year if exam else 'N/A'
        })

    return jsonify({
        'student_id': student.student_id,
        'student_name': f"{student.first_name} {student.last_name}",
        'class_name': student.classroom.class_name if student.classroom else '',
        'average_score': round(sum(g.marks for g in grades) / len(grades), 2),
        'grades': report_items
    }), 200



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
        mean_grade = get_kcse_grade(avg)

        data.append({
            'student_id': s.student_id,
            'student_name': f"{s.first_name} {s.last_name}",
            'average_score': avg,
            'mean_grade': mean_grade
        })

    ranked = sorted(data, key=lambda d: d['average_score'], reverse=True)
    for i, student in enumerate(ranked, start=1):
        student['position'] = i

    return jsonify({
        'class_id': classroom.class_id,
        'class_name': classroom.class_name,
        'students': ranked
    }), 200

#EXPORTS 

    
@report_bp.route('/export/class/<int:class_id>/pdf', methods=['GET'])
@token_required
def export_class_pdf(current_user, class_id):
    if current_user.role not in ['admin', 'teacher']:
        return jsonify({'error': 'Access denied'}), 403
    
    classroom = Classroom.query.get_or_404(class_id)
    students = Student.query.filter_by(class_id=class_id).all()

    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    y = height - 40

    p.setFont("Helvetica-Bold", 14)
    p.drawString(60, y, f"{classroom.class_name} - KCSE Summary")
    y -= 20

    for student in students:
        grades = Grade.query.filter_by(student_id=student.student_id).all()
        if not grades:
            continue

        avg = round(sum(g.marks for g in grades) / len(grades), 2)
        grade = get_kcse_grade(avg)

        p.setFont("Helvetica", 10)
        y -= 15
        p.drawString(60, y, f"{student.first_name} {student.last_name} | Mean Score: {avg} | Grade: {grade}")

        if y < 40:
            p.showPage()
            y = height - 40

    p.save()
    buffer.seek(0)

    return send_file(
        buffer,
        as_attachment=True,
        download_name=f"{classroom.class_name}_summary.pdf",
        mimetype='application/pdf'
    )


@report_bp.route('/export/class/<int:class_id>/csv', methods=['GET'])
@token_required
def export_class_csv(current_user, class_id):
    if current_user.role not in ['admin', 'teacher']:
        return jsonify({'error': 'Access denied'}), 403

    classroom = Classroom.query.get_or_404(class_id)
    students = Student.query.filter_by(class_id=class_id).all()

    text_stream = StringIO()
    writer = csv.writer(text_stream)
    
    # Optional: BOM for Excel compatibility
    text_stream.write('\ufeff')  

    writer.writerow(['Student Name', 'Subject', 'Score', 'Grade', 'Exam', 'Term', 'Year'])

    for s in students:
        grades = (
            Grade.query
            .filter_by(student_id=s.student_id)
            .options(
                joinedload(Grade.subject),
                joinedload(Grade.exam_schedule).joinedload(ExamSchedule.exam)
            )
            .all()
        )

        for g in grades:
            exam = g.exam_schedule.exam if g.exam_schedule else None
            writer.writerow([
                f"{s.first_name} {s.last_name}",
                g.subject.name if g.subject else '',
                g.marks,
                get_kcse_grade(g.marks),
                exam.name if exam else '',
                exam.term if exam else '',
                exam.year if exam else ''
            ])

    # Encode text to bytes
    csv_bytes = text_stream.getvalue().encode('utf-8')
    output = BytesIO(csv_bytes)
    output.seek(0)

    return Response(
        output,
        mimetype="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={classroom.class_name}_report.csv"
        }
    )