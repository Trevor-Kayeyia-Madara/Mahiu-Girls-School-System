from flask import Blueprint, request, jsonify
from models import Setting
from app import db
from utils.auth_utils import token_required
from flask_bcrypt import Bcrypt
bcrypt = Bcrypt()

settings_bp = Blueprint('settings', __name__)

@settings_bp.route('/', methods=['GET'])
@token_required
def get_settings(current_user):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    settings = Setting.query.all()
    return jsonify({s.key: s.value for s in settings})

@settings_bp.route('/', methods=['PUT'])
@token_required
def update_settings(current_user):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    for key, value in data.items():
        setting = Setting.query.filter_by(key=key).first()
        if setting:
            setting.value = value
        else:
            setting = Setting(key=key, value=value)
            db.session.add(setting)
    db.session.commit()
    return jsonify({'message': 'Settings updated'}), 200

@settings_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    data = request.get_json()
    current_user.name = data.get('name', current_user.name)
    current_user.email = data.get('email', current_user.email)
    db.session.commit()
    return jsonify({'message': 'Profile updated'}), 200


@settings_bp.route('/password', methods=['PUT'])
@token_required
def change_password(current_user):
    data = request.get_json()
    current_pw = data.get('current_password')
    new_pw = data.get('new_password')

    if not bcrypt.check_password_hash(current_user.password, current_pw):
        return jsonify({'error': 'Incorrect current password'}), 400

    current_user.password = bcrypt.generate_password_hash(new_pw).decode('utf-8')
    db.session.commit()
    return jsonify({'message': 'Password changed successfully'}), 200
