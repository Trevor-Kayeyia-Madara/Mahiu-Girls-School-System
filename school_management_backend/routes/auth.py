from flask import Blueprint, request, jsonify
from models import User
from app import db
from utils.auth_utils import generate_token


auth_bp = Blueprint('auth', __name__)

# LOGIN
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if not user or user.password != password:
        return jsonify({'error': 'Invalid credentials'}), 401

    token = generate_token(user)
    # ✅ Add 'name' to the response
    return jsonify({
        'token': token,
        'role': user.role,
        'user_id': user.user_id,
        'name': user.name  # 👈 Add this line
    }), 200


# REGISTER
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    user = User(
        name=data['name'],
        email=data['email'],
        password=data['password'],  # ✅ Plaintext password
        role=data['role']
    )
    db.session.add(user)
    db.session.commit()

    return jsonify({'message': 'User created'}), 201
