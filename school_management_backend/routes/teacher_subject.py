from flask import Blueprint, jsonify
from app import db
from models import Teacher, ClassAssignment
from utils.auth_utils import token_required

teacher_subject_bp = Blueprint('teacher_subject', __name__)

# 🟢 GET all subject/class combinations for the logged-in teacher
@teacher_subject_bp.route('/me', methods=['GET'])
@token_required
def get_teacher_subjects(current_user):
    if current_user.role != 'teacher':
        return jsonify({'error': 'Unauthorized'}), 403

    teacher = Teacher.query.filter_by(user_id=current_user.user_id).first()
    if not teacher:
        return jsonify({'error': 'Teacher profile not found'}), 404

    assignments = (
        ClassAssignment.query
        .filter_by(teacher_id=teacher.teacher_id)
        .join(ClassAssignment.subject)
        .join(ClassAssignment.classroom)
        .all()
    )

    result = [{
        'subject_id': a.subject.subject_id,
        'name': a.subject.name,
        'class_id': a.classroom.class_id,
        'class_name': a.classroom.class_name
    } for a in assignments]

    return jsonify(result), 200
