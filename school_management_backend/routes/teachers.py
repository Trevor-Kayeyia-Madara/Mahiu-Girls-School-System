# type: ignore
from flask import Blueprint, request, jsonify
from models import TeacherSubject
from app import db
from utils.auth_utils import token_required

teacher_bp = Blueprint('teachers', __name__)

@teacher_bp.route('/dashboard', methods=['GET'])
@token_required
def teacher_dashboard(current_user):
    if current_user.role != 'teacher':
        return jsonify({'error': 'Unauthorized'}), 403

    teacher = current_user.staff  # assumes relationship between User and Staff
    assignments = TeacherSubject.query.filter_by(teacher_id=teacher.staff_id).all()

    result = []
    for a in assignments:
        result.append({
            'subject': a.subject.name,
            'class': a.classroom.class_name,
            'subject_id': a.subject_id,
            'class_id': a.class_id,
        })

    return jsonify({
        'teacher_name': current_user.name,
        'assigned_classes': result
    }), 200
