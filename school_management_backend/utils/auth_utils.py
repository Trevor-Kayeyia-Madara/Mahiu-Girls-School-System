import os
import jwt
from functools import wraps
from flask import request, jsonify
from models import User, Teacher, Parent
from dotenv import load_dotenv

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")  # use env variable in production
print(f"SECRET_KEY loaded: {SECRET_KEY}")


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]

        if not token:
            return jsonify({'error': 'Token missing'}), 401

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user = User.query.get(data['user_id'])

            if not user:
                return jsonify({'error': 'User not found'}), 401

            # Attach role-specific object (teacher/parent)
            if user.role == 'teacher':
                user.teacher = Teacher.query.filter_by(user_id=user.user_id).first()
            elif user.role == 'parent':
                user.parent = Parent.query.filter_by(user_id=user.user_id).first()

        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except Exception:
            return jsonify({'error': 'Invalid token'}), 401

        return f(user, *args, **kwargs)
    return decorated

def generate_token(user):
    token = jwt.encode({'user_id': user.user_id}, SECRET_KEY, algorithm="HS256")
    return token
