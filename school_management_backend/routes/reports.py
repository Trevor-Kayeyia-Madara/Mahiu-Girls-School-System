from flask import Blueprint, request, jsonify, send_file, Response
from io import BytesIO
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


# ✂ You can apply the same `aggregate_form1_2` logic to other report endpoints as needed.
# Consider class-wide aggregation or class reports if required.
