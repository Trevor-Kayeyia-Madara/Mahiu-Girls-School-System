from flask import Blueprint, request, jsonify
from models import User
from app import db
from utils.auth_utils import generate_token
from flask_bcrypt import Bcrypt

auth_bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({'error': 'Invalid credentials'}), 401

    token = generate_token(user)
    return jsonify({'token': token, 'role': user.role, 'user_id': user.user_id}), 200

# REGISTER

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    user = User(
        name=data['name'],
        email=data['email'],
        password=data['password'],
        role=data['role']  # validate 'admin', 'teacher', 'parent'
    )
    db.session.add(user)
    db.session.commit()

    return jsonify({'message': 'User created'}), 201
