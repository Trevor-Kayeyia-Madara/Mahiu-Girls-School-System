#type: ignore
from flask import Blueprint, request, jsonify
from models import User
from app import db
from utils.auth_utils import token_required

user_bp = Blueprint('users', __name__)

@user_bp.route('/', methods=['GET'])
@token_required
def get_all_users(current_user):
    if current_user.role != 'admin':
        return jsonify({'error': 'Access denied'}), 403
    users = User.query.all()
    return jsonify([{
        'id': u.user_id,
        'name': u.name,
        'email': u.email,
        'role': u.role
    } for u in users]), 200

@user_bp.route('/<int:user_id>', methods=['GET'])
@token_required
def get_user(current_user, user_id):
    if current_user.role != 'admin' and current_user.user_id != user_id:
        return jsonify({'error': 'Access denied'}), 403
    user = User.query.get_or_404(user_id)
    return jsonify({
        'id': user.user_id,
        'name': user.name,
        'email': user.email,
        'role': user.role
    }), 200

@user_bp.route('/<int:user_id>', methods=['PUT'])
@token_required
def update_user(current_user, user_id):
    if current_user.role != 'admin' and current_user.user_id != user_id:
        return jsonify({'error': 'Access denied'}), 403
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    user.name = data.get('name', user.name)
    user.email = data.get('email', user.email)
    db.session.commit()
    return jsonify({'message': 'User updated'}), 200

@user_bp.route('/<int:user_id>', methods=['DELETE'])
@token_required
def delete_user(current_user, user_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Only admin can delete users'}), 403
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted'}), 200
