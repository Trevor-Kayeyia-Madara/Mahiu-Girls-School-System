# type: ignore
from flask import Blueprint, request, jsonify
from models import TeacherSubject, Staff, Subject, Classroom
from app import db
from utils.auth_utils import token_required

assignment_bp = Blueprint('assignments', __name__)

# 📄 GET all teacher-subject-class links
@assignment_bp.route('/', methods=['GET'])
@token_required
def get_assignments(current_user):
    if current_user.role != 'admin':
        return jsonify({'error': 'Only admin can view assignments'}), 403

    assignments = TeacherSubject.query.all()
    return jsonify([{
        'id': a.id,
        'teacher': a.teacher.user.name,
        'subject': a.subject.name,
        'class': a.classroom.class_name
    } for a in assignments]), 200

# ➕ POST assign teacher to subject + class
@assignment_bp.route('/', methods=['POST'])
@token_required
def create_assignment(current_user):
    if current_user.role != 'admin':
        return jsonify({'error': 'Only admin can assign teachers'}), 403

    data = request.get_json()

    assignment = TeacherSubject(
        teacher_id=data['teacher_id'],
        subject_id=data['subject_id'],
        class_id=data['class_id']
    )

    try:
        db.session.add(assignment)
        db.session.commit()
        return jsonify({'message': 'Assignment created'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# ❌ DELETE assignment
@assignment_bp.route('/<int:assignment_id>', methods=['DELETE'])
@token_required
def delete_assignment(current_user, assignment_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Only admin can delete assignments'}), 403

    assignment = TeacherSubject.query.get_or_404(assignment_id)
    db.session.delete(assignment)
    db.session.commit()
    return jsonify({'message': 'Assignment deleted'}), 200
