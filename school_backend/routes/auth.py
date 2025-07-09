# app/routes/auth.py
# type: ignore
from flask import Blueprint, request, jsonify
from app import db, bcrypt
from models import User
from flask_jwt_extended import create_access_token
from datetime import timedelta

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")  # 'admin', 'teacher', 'parent'

    if not all([name, email, password, role]):
        return jsonify({"error": "Missing fields"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    new_user = User(
        name=name,
        email=email,
        password=hashed_password,
        role=role
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(
        identity={"user_id": user.user_id, "role": user.role},
        expires_delta=timedelta(days=1)
    )

    return jsonify({
        "access_token": access_token,
        "user": {
            "id": user.user_id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }), 200
