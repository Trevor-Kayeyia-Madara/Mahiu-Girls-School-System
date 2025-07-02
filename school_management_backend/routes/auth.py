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

    user = User.query.filter_by(email=email).first()

    if not user or user.password != password:
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
