# type: ignore
from flask import Blueprint, request, jsonify
from models import TeacherSubject, Classroom, Staff
from app import db
from utils.auth_utils import token_required

teacher_bp = Blueprint('teachers', __name__)

@teacher_bp.route('/dashboard', methods=['GET'])
@token_required
def teacher_dashboard(current_user):
    if current_user.role != 'teacher':
        return jsonify({'error': 'Unauthorized'}), 403

    teacher = current_user.staff  # User → Staff relationship

    # Subjects they teach
    assignments = TeacherSubject.query.filter_by(teacher_id=teacher.staff_id).all()
    assigned_classes = [{
        'subject': a.subject.name,
        'class': a.classroom.class_name,
        'subject_id': a.subject_id,
        'class_id': a.class_id,
    } for a in assignments]

    # Classes where they are class teacher
    class_teacher_for = Classroom.query.filter_by(class_teacher_id=teacher.staff_id).all()
    head_classes = [{
        'class_id': c.class_id,
        'class_name': c.class_name
    } for c in class_teacher_for]

    return jsonify({
        'teacher_name': current_user.name,
        'assigned_classes': assigned_classes,
        'class_teacher_for': head_classes
    }), 200
