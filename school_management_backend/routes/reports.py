from flask import Blueprint, request, jsonify, send_file, Response
from io import BytesIO, TextIOWrapper
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from sqlalchemy.orm import joinedload
from app import db
from models import Student, Classroom, Grade, Subject, Exam
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
        grouped[key]['scores'].append((g.exam.name, g.score))

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
    student = Student.query.options(joinedload(Student.classroom)).get_or_404(student_id)

    if current_user.role not in ['admin', 'teacher'] and current_user.user_id != getattr(student.user, 'user_id', None):
        return jsonify({'error': 'Access denied'}), 403

    grades = Grade.query.filter_by(student_id=student_id).options(
        joinedload(Grade.subject), joinedload(Grade.exam)
    ).all()

    if not grades:
        return jsonify({'message': 'No grades found for this student'}), 404

    if is_kcse_style(student.classroom.class_name):
        # Form 3–4: individual entries
        subject_grades = [{
            'subject': g.subject.name,
            'exam': g.exam.name,
            'score': g.score,
            'term': g.term,
            'year': g.year,
            'grade': get_kcse_grade(g.score)
        } for g in grades]
        average = round(sum(g['score'] for g in subject_grades) / len(subject_grades), 2)
    else:
        # Form 1–2: aggregate by subject
        subject_grades = aggregate_form1_2(grades)
        average = round(sum(g['score'] for g in subject_grades) / len(subject_grades), 2)

    return jsonify({
        'student_id': student.student_id,
        'student_name': f"{student.first_name} {student.last_name}",
        'class_name': student.classroom.class_name,
        'average_score': average,
        'grades': subject_grades
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
        avg = round(sum(g.score for g in grades) / len(grades), 2)
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


@report_bp.route('/export/student/<int:student_id>/pdf', methods=['GET'])
@token_required
def export_student_pdf(current_user, student_id):
    student = Student.query.options(joinedload(Student.classroom)).get_or_404(student_id)
    if current_user.role not in ['admin', 'teacher'] and current_user.user_id != getattr(student.user, 'user_id', None):
        return jsonify({'error': 'Access denied'}), 403

    grades = Grade.query.filter_by(student_id=student_id).options(joinedload(Grade.subject), joinedload(Grade.exam)).all()
    if not grades:
        return jsonify({'error': 'No grades to export'}), 404

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
    p.drawString(60, y, f"Class: {student.classroom.class_name if student.classroom else 'N/A'}")
    y -= 30

    p.setFont("Helvetica-Bold", 10)
    p.drawString(60, y, "Subject")
    p.drawString(180, y, "Exam")
    p.drawString(300, y, "Score")
    p.drawString(360, y, "Term")
    p.drawString(420, y, "Year")
    y -= 15

    p.setFont("Helvetica", 10)
    for g in grades:
        if y < 50:
            p.showPage()
            y = height - 40
        p.drawString(60, y, g.subject.name)
        p.drawString(180, y, g.exam.name)
        p.drawString(300, y, str(g.score))
        p.drawString(360, y, g.term)
        p.drawString(420, y, str(g.year))
        y -= 15

    p.save()
    buffer.seek(0)

    return send_file(
        buffer,
        as_attachment=True,
        download_name=f"{student.first_name}_{student.last_name}_report.pdf",
        mimetype='application/pdf'
    )


@report_bp.route('/export/student/<int:student_id>/csv', methods=['GET'])
@token_required
def export_student_csv(current_user, student_id):
    student = Student.query.get_or_404(student_id)
    if current_user.role not in ['admin', 'teacher'] and current_user.user_id != getattr(student.user, 'user_id', None):
        return jsonify({'error': 'Access denied'}), 403

    grades = Grade.query.filter_by(student_id=student_id).options(joinedload(Grade.subject), joinedload(Grade.exam)).all()
    if not grades:
        return jsonify({'error': 'No grades to export'}), 404

    output = BytesIO()
    writer = csv.writer(output)
    writer.writerow(['Subject', 'Exam', 'Score', 'Grade', 'Term', 'Year'])

    for g in grades:
        writer.writerow([
            g.subject.name,
            g.exam.name,
            g.score,
            get_kcse_grade(g.score),
            g.term,
            g.year
        ])

    output.seek(0)
    return Response(
        output,
        mimetype="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={student.first_name}_{student.last_name}_report.csv"
        }
    )


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

        avg = round(sum(g.score for g in grades) / len(grades), 2)
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

    output = BytesIO()
    wrapper = TextIOWrapper(output, encoding='utf-8', newline='')
    writer = csv.writer(wrapper)
    writer.writerow(['Student Name', 'Subject', 'Score', 'Grade', 'Exam', 'Term', 'Year'])

    for s in students:
        grades = Grade.query.filter_by(student_id=s.student_id).options(joinedload(Grade.subject), joinedload(Grade.exam)).all()
        for g in grades:
            writer.writerow([
                f"{s.first_name} {s.last_name}",
                g.subject.name,
                g.score,
                get_kcse_grade(g.score),
                g.exam.name,
                g.term,
                g.year
            ])

    wrapper.flush()
    output.seek(0)

    return Response(
        output,
        mimetype="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={classroom.class_name}_report.csv"
        }
    )