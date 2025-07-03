# type: ignore
from flask import Blueprint, jsonify
from models import Student, Grade, Classroom, Subject
from utils.auth_utils import token_required
from sqlalchemy import func
from app import db

report_bp = Blueprint('reports', __name__)

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
        'name': student.user.name,
        'class': student.classroom.class_name if student.classroom else None,
        'average_score': avg_score,
        'grades': subjects
    }), 200

# 📄 Class performance report
@report_bp.route('/class/<int:class_id>', methods=['GET'])
@token_required
def class_report(current_user, class_id):
    if current_user.role not in ['admin', 'teacher']:
        return jsonify({'error': 'Access denied'}), 403

    classroom = Classroom.query.get_or_404(class_id)

    # Group grades by subject
    results = db.session.query(
        Subject.name,
        func.avg(Grade.score).label('avg_score'),
        func.count(Grade.grade_id).label('num_entries')
    ).join(Grade.subject).filter(Grade.class_id == class_id).group_by(Subject.name).all()

    return jsonify({
        'class_id': classroom.class_id,
        'class_name': classroom.class_name,
        'subjects': [{
            'subject': r.name,
            'average_score': round(r.avg_score, 2),
            'entries': r.num_entries
        } for r in results]
    }), 200
