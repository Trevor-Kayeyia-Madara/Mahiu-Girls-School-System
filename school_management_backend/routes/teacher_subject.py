# routes/teacher_subject.py

import traceback
from flask import Blueprint, jsonify, request
from app import db
from models import Teacher, TeacherSubject, Subject
from utils.auth_utils import token_required

teacher_subject_bp = Blueprint('teacher_subject', __name__)

@teacher_subject_bp.route('/me', methods=['GET'])
@token_required
def get_teacher_subjects(current_user):
    try:
        if current_user.role != 'teacher':
            return jsonify({'error': 'Unauthorized'}), 403

        teacher = Teacher.query.filter_by(user_id=current_user.user_id).first()
        if not teacher:
            return jsonify({'error': 'Teacher profile not found'}), 404

        teacher_subjects = (
            TeacherSubject.query
            .filter_by(teacher_id=teacher.teacher_id)
            .join(Subject)
            .all()
        )

        result = [{
            'subject_id': ts.subject_id,
            'subject_name': ts.subject.name
        } for ts in teacher_subjects]

        return jsonify(result), 200

    except Exception as e:
        print("ERROR in /me endpoint:", str(e))
        traceback.print_exc()
        return jsonify({'error': 'Server error'}), 500
    
    # ✅ POST to assign subject to teacher
@teacher_subject_bp.route('/', methods=['POST'])
@token_required
def assign_subject_to_teacher(current_user):
    if current_user.role != 'teacher':
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    subject_id = data.get('subject_id')
    if not subject_id:
        return jsonify({'error': 'Missing subject_id'}), 400

    teacher = Teacher.query.filter_by(user_id=current_user.user_id).first()
    if not teacher:
        return jsonify({'error': 'Teacher profile not found'}), 404

    # Check if already assigned
    existing = TeacherSubject.query.filter_by(
        teacher_id=teacher.teacher_id,
        subject_id=subject_id
    ).first()

    if existing:
        return jsonify({'message': 'Subject already assigned'}), 200

    new_assignment = TeacherSubject(
        teacher_id=teacher.teacher_id,
        subject_id=subject_id
    )
    db.session.add(new_assignment)
    db.session.commit()

    return jsonify({'message': 'Subject assigned successfully'}), 201

# ✅ DELETE subject from teacher
@teacher_subject_bp.route('/<int:subject_id>', methods=['DELETE'])
@token_required
def delete_teacher_subject(current_user, subject_id):
    if current_user.role != 'teacher':
        return jsonify({'error': 'Unauthorized'}), 403

    teacher = Teacher.query.filter_by(user_id=current_user.user_id).first()
    if not teacher:
        return jsonify({'error': 'Teacher profile not found'}), 404

    assignment = TeacherSubject.query.filter_by(
        teacher_id=teacher.teacher_id,
        subject_id=subject_id
    ).first()

    if not assignment:
        return jsonify({'error': 'Assignment not found'}), 404

    db.session.delete(assignment)
    db.session.commit()
    return jsonify({'message': 'Subject unassigned'}), 200