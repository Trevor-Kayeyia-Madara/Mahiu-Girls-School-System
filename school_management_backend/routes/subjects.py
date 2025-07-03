# type: ignore
from flask import Blueprint, request, jsonify
from models import Subject
from app import db
from utils.auth_utils import token_required

subject_bp = Blueprint('subjects', __name__)

# ✅ GET all subjects
@subject_bp.route('/', methods=['GET'])
@token_required
def get_subjects(current_user):
    subjects = Subject.query.all()
    return jsonify([{
        'id': s.subject_id,
        'name': s.name,
        'group': s.group,
        'compulsory': s.compulsory
    } for s in subjects]), 200

# ✅ POST create subject
@subject_bp.route('/', methods=['POST'])
@token_required
def create_subject(current_user):
    if current_user.role != 'admin':
        return jsonify({'error': 'Only admin can add subjects'}), 403

    data = request.get_json()
    try:
        subject = Subject(
            name=data['name'],
            group=data['group'],
            compulsory=data.get('compulsory', False)
        )
        db.session.add(subject)
        db.session.commit()
        return jsonify({'message': 'Subject added successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# ✅ PUT update subject
@subject_bp.route('/<int:subject_id>', methods=['PUT'])
@token_required
def update_subject(current_user, subject_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Only admin can update subjects'}), 403

    subject = Subject.query.get_or_404(subject_id)
    data = request.get_json()

    subject.name = data.get('name', subject.name)
    subject.group = data.get('group', subject.group)
    subject.compulsory = data.get('compulsory', subject.compulsory)

    db.session.commit()
    return jsonify({'message': 'Subject updated successfully'}), 200

# ✅ DELETE subject
@subject_bp.route('/<int:subject_id>', methods=['DELETE'])
@token_required
def delete_subject(current_user, subject_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Only admin can delete subjects'}), 403

    subject = Subject.query.get_or_404(subject_id)
    db.session.delete(subject)
    db.session.commit()
    return jsonify({'message': 'Subject deleted successfully'}), 200
