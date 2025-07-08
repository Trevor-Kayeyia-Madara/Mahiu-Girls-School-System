from flask import Blueprint, request, jsonify
from models import Setting
from app import db
from utils.auth_utils import token_required

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
