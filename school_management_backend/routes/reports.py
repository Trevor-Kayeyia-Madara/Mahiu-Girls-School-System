from flask import Blueprint, request, jsonify
from app import db
from models import Student, Classroom, Grade
from utils.auth_utils import token_required
from utils.grade_utils import get_kcse_grade

report_bp = Blueprint('reports',__name__)

@report_bp.route('/student/<int:student_id>', methods=['GET'])
@token_required
def student_report(current_user, student_id):
    student = Student.query.get_or_404(student_id)

    # Restrict access to owner or admin/teacher
    if current_user.role not in ['admin', 'teacher'] and current_user.user_id != student.user_id:
        return jsonify({'error': 'Access denied'}), 403

    grades = Grade.query.filter_by(student_id=student_id).all()
    if not grades:
        return jsonify({'message': 'No grades found for this student'}), 404

    subject_grades = [{
        'subject': g.subject.name,
        'score': g.score,
        'term': g.term,
        'year': g.year,
        'grade': get_kcse_grade(g.score)  # helper function
    } for g in grades]

    average = round(sum(g.score for g in grades) / len(grades), 2)

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

    # Sort by average and assign position
    ranked = sorted(data, key=lambda d: d['average_score'], reverse=True)
    for i, student in enumerate(ranked, start=1):
        student['position'] = i

    return jsonify({
        'class_id': class_id,
        'class_name': Classroom.query.get(class_id).class_name,
        'students': ranked
    }), 200
