import os
import jwt
from functools import wraps
from flask import request, jsonify
from models import User, Teacher, Parent
from dotenv import load_dotenv

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.method == 'OPTIONS':
            return '', 200

        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'Authorization header missing'}), 401

        try:
            token = auth_header.split(" ")[1]
        except IndexError:
            return jsonify({'error': 'Token format is invalid'}), 401

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user = User.query.get(data['user_id'])

            if not user:
                return jsonify({'error': 'User not found'}), 401

            if user.role == 'teacher':
                teacher = Teacher.query.filter_by(user_id=user.user_id).first()
                if not teacher:
                    return jsonify({'error': 'Teacher profile not found'}), 401
                user.teacher_id = teacher.teacher_id  # 👈 FIX: attach teacher_id directly
            elif user.role == 'parent':
                user.parent = Parent.query.filter_by(user_id=user.user_id).first()
                user.parent_id = Parent.parent_id 

        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except Exception:
            return jsonify({'error': 'Invalid token'}), 401

        return f(user, *args, **kwargs)
    return decorated


def generate_token(user):
    token = jwt.encode({'user_id': user.user_id}, SECRET_KEY, algorithm="HS256")
    return token
