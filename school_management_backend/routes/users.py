# routes/users.py
from flask import Blueprint, request, jsonify
from app import db
from models import User
from utils.auth_utils import token_required


user_bp = Blueprint("users", __name__)

# 📄 GET all users
@user_bp.route("/", methods=["GET","OPTIONS"])
@token_required
def get_users(current_user):
    if current_user.role != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    users = User.query.all()
    user_list = [{
        'user_id': u.user_id,
        'name': u.name,
        'email': u.email,
        'role': u.role
    } for u in users]
    return jsonify({'users': user_list})
    

# ❌ DELETE user by ID
@user_bp.route("/<int:user_id>", methods=["DELETE","OPTIONS"])
@token_required
def delete_user(current_user, user_id):
    if current_user.role != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted successfully"}), 200


@user_bp.route("/", methods=["POST","OPTIONS"])
@token_required
def create_user(current_user):
    if current_user.role != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    if not all([name, email, password, role]):
        return jsonify({"error": "Missing required fields"}), 400

    existing = User.query.filter_by(email=email).first()
    if existing:
        return jsonify({"error": "Email already exists"}), 409

    new_user = User(name=name, email=email, password=password, role=role)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User created"}), 201

@user_bp.route("/<int:user_id>", methods=["PUT","OPTIONS"])
@token_required
def update_user(current_user, user_id):
    if current_user.role != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    user = User.query.get_or_404(user_id)
    data = request.get_json()
    user.name = data.get("name", user.name)
    user.email = data.get("email", user.email)
    user.role = data.get("role", user.role)
    db.session.commit()

    return jsonify({"message": "User updated"}), 200
