# routes/teacher_subject.py
# type: ignore
from flask import Blueprint, request, jsonify
from models import TeacherSubject
from app import db
from utils.auth_utils import token_required
import traceback

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

 # POST
@ts_bp.route('/', methods=['POST'])
@token_required
def assign_teacher_subject(current_user):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    try:
        ts = TeacherSubject(
            teacher_id=data['teacher_id'],
            subject_id=data['subject_id'],
            class_id=data['class_id']
        )
        db.session.add(ts)
        db.session.commit()
        return jsonify({'message': 'Assignment created'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400
