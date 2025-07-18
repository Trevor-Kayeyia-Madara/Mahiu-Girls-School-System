from flask import Blueprint, request, jsonify
from app import db
from models import ClassAssignment, Classroom, Subject
from utils.auth_utils import token_required

assignment_bp = Blueprint('class_assignment', __name__)

# 📄 Get all subject-teacher assignments for a class
@assignment_bp.route('/class/<int:class_id>', methods=['GET', 'OPTIONS'])
@token_required
def get_assignments(current_user, class_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    assignments = ClassAssignment.query.filter_by(class_id=class_id).all()
    result = [{
        'subject_id': a.subject_id,
        'subject_name': a.subject.name,
        'teacher_id': a.teacher_id,
        'teacher_name': a.teacher.user.name
    } for a in assignments]

    return jsonify(result), 200

# 🆕 Assign or update teacher for subject in class
@assignment_bp.route('/', methods=['POST','OPTIONS'])
@token_required
def assign_teacher_to_subject(current_user):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    class_id = data.get('class_id')
    subject_id = data.get('subject_id')
    teacher_id = data.get('teacher_id')

    if not all([class_id, subject_id, teacher_id]):
        return jsonify({'error': 'Missing fields'}), 400

    # Check for existing assignment
    assignment = ClassAssignment.query.filter_by(class_id=class_id, subject_id=subject_id).first()

    if assignment:
        assignment.teacher_id = teacher_id
    else:
        assignment = ClassAssignment(class_id=class_id, subject_id=subject_id, teacher_id=teacher_id)
        db.session.add(assignment)

    db.session.commit()
    return jsonify({'message': 'Assignment saved'}), 200

# ❌ Delete assignment
@assignment_bp.route('/class/<int:class_id>/subject/<int:subject_id>', methods=['DELETE', 'OPTIONS'])
@token_required
def delete_assignment(current_user, class_id, subject_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    assignment = ClassAssignment.query.filter_by(class_id=class_id, subject_id=subject_id).first()
    if not assignment:
        return jsonify({'error': 'Assignment not found'}), 404

    db.session.delete(assignment)
    db.session.commit()
    return jsonify({'message': 'Assignment removed'}), 200


# Get Personal Teacher classes

@assignment_bp.route('/me', methods=['GET', 'OPTIONS'])
@token_required
def get_my_class_subjects(current_user):
    if current_user.role != 'teacher':
        return jsonify({'error': 'Unauthorized'}), 403

    assignments = ClassAssignment.query \
        .filter_by(teacher_id=current_user.teacher.teacher_id) \
        .join(Subject) \
        .join(Classroom) \
        .all()

    result = [{
        'class_id': a.class_id,
        'class_name': a.classroom.class_name,
        'subject_id': a.subject_id,
        'subject_name': a.subject.name
    } for a in assignments]

    return jsonify(result), 200
