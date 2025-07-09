# routes/class_assignment.py
from flask import Blueprint, request, jsonify
from app import db
from models import ClassAssignment, Staff, Subject, Classroom
from utils.auth_utils import token_required

class_assignment_bp = Blueprint('class_assignment', __name__)

# 📄 Get subject assignments for a given class
@class_assignment_bp.route('/class/<int:class_id>', methods=['GET'])
@token_required
def get_assignments_for_class(current_user, class_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    classroom = Classroom.query.get_or_404(class_id)
    assignments = ClassAssignment.query.filter_by(class_id=class_id).all()

    result = [{
        'subject_id': a.subject_id,
        'subject_name': a.subject.name,
        'teacher_id': a.teacher_id,
        'teacher_name': a.teacher.user.name
    } for a in assignments]

    return jsonify(result), 200


# ✏️ Save (or update) subject-teacher assignment for a class
@class_assignment_bp.route('/', methods=['POST'])
@token_required
def assign_teacher_to_subject(current_user):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    class_id = data.get('class_id')
    subject_id = data.get('subject_id')
    teacher_id = data.get('teacher_id')

    if not all([class_id, subject_id, teacher_id]):
        return jsonify({'error': 'Missing data'}), 400

    assignment = ClassAssignment.query.filter_by(class_id=class_id, subject_id=subject_id).first()

    if assignment:
        assignment.teacher_id = teacher_id
    else:
        new_assignment = ClassAssignment(
            class_id=class_id,
            subject_id=subject_id,
            teacher_id=teacher_id
        )
        db.session.add(new_assignment)

    db.session.commit()
    return jsonify({'message': 'Subject-teacher assignment saved'}), 200


# 🧑‍🏫 Assign a class teacher to a classroom
@class_assignment_bp.route('/classrooms/<int:class_id>/assign-teacher', methods=['POST'])
@token_required
def assign_class_teacher(current_user, class_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    teacher_id = data.get('teacher_id')

    if not teacher_id:
        return jsonify({'error': 'Missing teacher_id'}), 400

    classroom = Classroom.query.get_or_404(class_id)
    classroom.class_teacher_id = teacher_id

    db.session.commit()
    return jsonify({'message': 'Class teacher assigned successfully'}), 200
