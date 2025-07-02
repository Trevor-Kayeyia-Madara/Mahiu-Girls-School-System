# type: ignore
from flask import Blueprint, request, jsonify
from models import User
from app import db
import jwt
import datetime
import os

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Validate input
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400

    # Find user by email
    user = User.query.filter_by(email=email).first()

    if not user or user.password != password:
        return jsonify({'error': 'Invalid credentials'}), 401

    # Generate JWT token
    token_payload = {
        'user_id': user.user_id,
        'role': user.role,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=2)
    }

    token = jwt.encode(token_payload, os.getenv('SECRET_KEY'), algorithm='HS256')

    # In PyJWT ≥ 2.0, token is a byte string, convert it
    if isinstance(token, bytes):
        token = token.decode('utf-8')

    return jsonify({
        'token': token,
        'user': {
            'id': user.user_id,
            'name': user.name,
            'email': user.email,
            'role': user.role
        }
    }), 200
