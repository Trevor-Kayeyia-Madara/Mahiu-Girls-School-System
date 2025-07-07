# routes/teacher_subject.py
# type: ignore
from flask import Blueprint, request, jsonify
from models import TeacherSubject
from app import db
from utils.auth_utils import token_required

ts_bp = Blueprint('teacher_subjects', __name__)

@ts_bp.route('/', methods=['GET'])
@token_required
def get_assignments(current_user):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    assignments = TeacherSubject.query.all()
    return jsonify([
        {
            'teacher_id': a.teacher_id,
            'subject_id': a.subject_id,
            'class_id': a.class_id
        } for a in assignments
    ]), 200


@ts_bp.route('/bulk', methods=['POST'])
@token_required
def bulk_assign(current_user):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()  # Expecting a list of dicts with teacher_id, subject_id, class_id
    try:
        TeacherSubject.query.delete()

        for item in data:
            ts = TeacherSubject(
                teacher_id=item['teacher_id'],
                subject_id=item['subject_id'],
                class_id=item['class_id']
            )
            db.session.add(ts)

        db.session.commit()
        return jsonify({'message': 'Teacher-subject-class assignments saved'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
