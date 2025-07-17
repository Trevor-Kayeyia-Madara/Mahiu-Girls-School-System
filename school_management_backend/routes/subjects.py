from flask import Blueprint, request, jsonify
from models import db, Subject
from utils.auth_utils import token_required

subject_bp = Blueprint('subjects', __name__)

# GET all subjects
@subject_bp.route('/', methods=['GET'])
@token_required
def list_subjects(current_user):
    if current_user.role not in ['admin', 'teacher']:
        return jsonify({'error': 'Unauthorized'}), 403

    subjects = Subject.query.order_by(Subject.name).all()
    return jsonify([
        {
            'subject_id': s.subject_id,
            'name': s.name,
            'group': s.group,
            'compulsory': s.compulsory
        } for s in subjects
    ]), 200


# POST create a new subject
@subject_bp.route('/', methods=['POST'])
@token_required
def create_subject(current_user):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.json
    name = data.get('name')
    group = data.get('group')
    compulsory = data.get('compulsory', False)

    if not name or not group:
        return jsonify({'error': 'Name and group are required'}), 400

    if Subject.query.filter_by(name=name).first():
        return jsonify({'error': 'Subject with this name already exists'}), 400

    subject = Subject(name=name, group=group, compulsory=compulsory)
    db.session.add(subject)
    db.session.commit()

    return jsonify({'message': 'Subject created successfully'}), 201


# PUT update subject
@subject_bp.route('/<int:subject_id>', methods=['PUT'])
@token_required
def update_subject(current_user, subject_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    subject = Subject.query.get_or_404(subject_id)
    data = request.json

    subject.name = data.get('name', subject.name)
    subject.group = data.get('group', subject.group)
    subject.compulsory = data.get('compulsory', subject.compulsory)

    db.session.commit()
    return jsonify({'message': 'Subject updated successfully'}), 200


# DELETE subject
@subject_bp.route('/<int:subject_id>', methods=['DELETE'])
@token_required
def delete_subject(current_user, subject_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    subject = Subject.query.get_or_404(subject_id)
    db.session.delete(subject)
    db.session.commit()

    return jsonify({'message': 'Subject deleted successfully'}), 200
