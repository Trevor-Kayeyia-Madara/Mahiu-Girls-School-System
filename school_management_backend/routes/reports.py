# type: ignore
from flask import Blueprint, jsonify
from models import Student, Grade, Classroom, Subject
from utils.auth_utils import token_required
from sqlalchemy import func
from app import db
import io
import csv
import pandas as pd
from flask import send_file
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4

report_bp = Blueprint('reports', __name__)

def ordinal(n):
    if not isinstance(n, int):
        return ''
    if 11 <= (n % 100) <= 13:
        return 'th'
    return {1: 'st', 2: 'nd', 3: 'rd'}.get(n % 10, 'th')



# 📄 Student academic report
@report_bp.route('/student/<int:student_id>', methods=['GET'])
@token_required
def student_report(current_user, student_id):
    student = Student.query.get_or_404(student_id)

    if current_user.role not in ['admin', 'teacher'] and current_user.user_id != student.user_id:
        return jsonify({'error': 'Access denied'}), 403

    grades = Grade.query.filter_by(student_id=student_id).all()

    subjects = [{
        'subject': g.subject.name,
        'score': g.score,
        'term': g.term,
        'year': g.year,
        'teacher': g.teacher.user.name
    } for g in grades]

    avg_score = round(sum(g.score for g in grades) / len(grades), 2) if grades else 0.0

    return jsonify({
        'student_id': student.student_id,
        'name': student.first_name,
        'class': student.classroom.class_name if student.classroom else None,
        'average_score': avg_score,
        'grades': subjects
    }), 200

@report_bp.route('/class/<int:class_id>', methods=['GET'])
@token_required
def class_report(current_user, class_id):
    classroom = Classroom.query.get_or_404(class_id)
    from utils.grade_utils import get_kcse_grade

    students = Student.query.filter_by(class_id=class_id).all()
    student_data = []

    for s in students:
        grades = Grade.query.filter_by(student_id=s.student_id).all()
        if not grades:
            continue

        scores = [g.score for g in grades]
        avg_score = round(sum(scores) / len(scores), 2)
        mean_grade = get_kcse_grade(avg_score)

        student_data.append({
            'student_id': s.student_id,
            'name': s.user.name,
            'grades': [{
                'subject': g.subject.name,
                'score': g.score,
                'grade': get_kcse_grade(g.score),
                'term': g.term,
                'year': g.year,
            } for g in grades],
            'average_score': avg_score,
            'mean_grade': mean_grade
        })

    # ✅ Ranking by average
    sorted_students = sorted(student_data, key=lambda s: s['average_score'], reverse=True)
    for i, s in enumerate(sorted_students, start=1):
        s['position'] = i

    return jsonify({
        'class_id': classroom.class_id,
        'class_name': classroom.class_name,
        'students': sorted_students
    }), 200


@report_bp.route('/export/student/<int:student_id>', methods=['GET'])
@token_required
def export_student_report(current_user, student_id):
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import A4
    import io
    from utils.grade_utils import get_kcse_grade

    student = Student.query.get_or_404(student_id)
    class_id = student.class_id
    classroom = Classroom.query.get(class_id)
    grades = Grade.query.filter_by(student_id=student_id).all()

    # === Compute mean score and grade for this student
    scores = [g.score for g in grades]
    avg_score = round(sum(scores) / len(scores), 2) if scores else 0.0
    mean_grade = get_kcse_grade(avg_score)

    # === Rank logic
    all_students = Student.query.filter_by(class_id=class_id).all()
    ranked = []
    for s in all_students:
        g = Grade.query.filter_by(student_id=s.student_id).all()
        if g:
            s_avg = round(sum(gr.score for gr in g) / len(g), 2)
            ranked.append((s.student_id, s_avg))

    # Sort by avg descending
    ranked.sort(key=lambda tup: tup[1], reverse=True)

    # Find position
    position = next((i + 1 for i, (sid, _) in enumerate(ranked) if sid == student_id), None)

    # === Begin PDF
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    y = height - 40

    p.setFont("Helvetica-Bold", 14)
    p.drawString(60, y, f"KCSE Report Card")
    y -= 20

    p.setFont("Helvetica", 10)
    p.drawString(60, y, f"Name: {student.first_name}")
    p.drawString(300, y, f"Adm No: {student.admission_number}")
    y -= 15
    p.drawString(60, y, f"Class: {classroom.class_name if classroom else 'N/A'}")
    y -= 15
    p.drawString(60, y, f"Mean Score: {avg_score}")
    p.drawString(200, y, f"Mean Grade: {mean_grade}")
    p.drawString(350, y, f"Position: {position}{ordinal(position)}")
    y -= 25

    # Table header
    p.setFont("Helvetica-Bold", 10)
    p.drawString(60, y, "Subject      Score    Grade    Term    Year    Teacher")
    y -= 15

    # Table rows
    p.setFont("Helvetica", 9)
    for g in grades:
        if y < 40:
            p.showPage()
            y = height - 40
        p.drawString(60, y, f"{g.subject.name[:12]:<12} {g.score:<7} {get_kcse_grade(g.score):<7} {g.term:<6} {g.year:<5} {g.teacher.user.name[:20]}")
        y -= 13

    p.save()
    buffer.seek(0)

    return send_file(
        buffer,
        as_attachment=True,
        download_name=f"{student.first_name}_report.pdf",
        mimetype='application/pdf'
    )
