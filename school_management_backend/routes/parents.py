# routes/parents.py
from flask import Blueprint, request, jsonify
from models import db, Parent, User, Student
from werkzeug.security import generate_password_hash
from utils.auth_utils import token_required

parent_bp = Blueprint('parents', __name__)

# Get all parents
@parent_bp.route('/', methods=['GET'])
@token_required
def get_all_parents(current_user):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    parents = Parent.query.all()
    return jsonify([
        {
            'parent_id': p.parent_id,
            'name': p.user.name,
            'email': p.user.email,
            'phone': p.phone,
            'occupation': p.occupation
        } for p in parents
    ]), 200


# Get one parent by ID (with students)
@parent_bp.route('/<int:parent_id>', methods=['GET'])
@token_required
def get_parent(current_user, parent_id):
    if current_user.role not in ['admin', 'parent']:
        return jsonify({'error': 'Unauthorized'}), 403

    parent = Parent.query.get_or_404(parent_id)

    if current_user.role == 'parent' and current_user.user_id != parent.user_id:
        return jsonify({'error': 'Access denied'}), 403

    return jsonify({
        'parent_id': parent.parent_id,
        'name': parent.user.name,
        'email': parent.user.email,
        'phone': parent.phone,
        'occupation': parent.occupation,
        'students': [{
            'id': s.student_id,
            'name': f"{s.first_name} {s.last_name}",
            'admission_number': s.admission_number
        } for s in parent.students]
    }), 200


# Create new parent
@parent_bp.route('/', methods=['POST'])
@token_required
def create_parent(current_user):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()

    user = User(
        name=data['name'],
        email=data['email'],
        password=generate_password_hash(data['password']),
        role='parent'
    )
    db.session.add(user)
    db.session.flush()  # Get user_id before committing

    parent = Parent(
        user_id=user.user_id,
        phone=data.get('phone'),
        occupation=data.get('occupation')
    )
    db.session.add(parent)
    db.session.commit()

    return jsonify({'message': 'Parent account created'}), 201


# Update parent
@parent_bp.route('/<int:parent_id>', methods=['PUT'])
@token_required
def update_parent(current_user, parent_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    parent = Parent.query.get_or_404(parent_id)
    data = request.get_json()

    parent.phone = data.get('phone', parent.phone)
    parent.occupation = data.get('occupation', parent.occupation)

    if 'name' in data:
        parent.user.name = data['name']
    if 'email' in data:
        parent.user.email = data['email']

    db.session.commit()
    return jsonify({'message': 'Parent updated successfully'}), 200


# Delete parent
@parent_bp.route('/<int:parent_id>', methods=['DELETE'])
@token_required
def delete_parent(current_user, parent_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    parent = Parent.query.get_or_404(parent_id)
    user = parent.user

    db.session.delete(parent)
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'Parent deleted'}), 200

# GET /parents/me/students
@parent_bp.route('/me/students', methods=['GET'])
@token_required
def get_my_children(current_user):
    if current_user.role != 'parent':
        return jsonify({'error': 'Unauthorized'}), 403

    parent = Parent.query.filter_by(user_id=current_user.user_id).first()
    if not parent:
        return jsonify({'error': 'Parent profile not found'}), 404

    students = [{
        'student_id': s.student_id,
        'first_name': s.first_name,
        'last_name': s.last_name,
        'class_name': s.classroom.class_name if s.classroom else 'N/A'
    } for s in parent.students]

    return jsonify(students), 200
