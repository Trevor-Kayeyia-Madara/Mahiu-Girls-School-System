# routes/teacher_subject.py

from flask import Blueprint, jsonify
from app import db
from models import Teacher, TeacherSubject, Subject
from utils.auth_utils import token_required

teacher_subject_bp = Blueprint('teacher_subject', __name__)

@teacher_subject_bp.route('/me', methods=['GET'])
@token_required
def get_teacher_subjects(current_user):
    if current_user.role != 'teacher':
        return jsonify({'error': 'Unauthorized'}), 403

    teacher = Teacher.query.filter_by(user_id=current_user.user_id).first()
    if not teacher:
        return jsonify({'error': 'Teacher profile not found'}), 404

    teacher_subjects = (
        TeacherSubject.query
        .filter_by(teacher_id=teacher.teacher_id)
        .join(Subject, TeacherSubject.subject_id == Subject.subject_id)
        .all()
    )

    result = [{
        'subject_id': ts.subject_id,
        'subject_name': ts.subject.name
    } for ts in teacher_subjects]

    return jsonify(result), 200
