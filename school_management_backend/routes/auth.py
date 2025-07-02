#type:ignore
from flask import Blueprint, request, jsonify
from models import User
from app import db
import jwt
import datetime
import os
from flask_bcrypt import Bcrypt

auth_bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401

    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({'error': 'Invalid credentials'}), 401

    token = jwt.encode({
        'user_id': user.user_id,
        'role': user.role,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=2)
    }, os.getenv('SECRET_KEY'), algorithm='HS256')

    return jsonify({
        'token': token,
        'user': {
            'id': user.user_id,
            'name': user.name,
            'email': user.email,
            'role': user.role
        }
    }), 200
