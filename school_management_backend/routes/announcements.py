# type: ignore
from flask import Blueprint, request, jsonify
from models import Announcement
from app import db
from utils.auth_utils import token_required
from datetime import datetime

announcement_bp = Blueprint('announcements', __name__)

@announcement_bp.route('/', methods=['GET'])
@token_required
def get_announcements(current_user):
    announcements = Announcement.query.order_by(Announcement.created_at.desc()).all()
    return jsonify([
        {
            'id': a.id,
            'title': a.title,
            'content': a.content,
            'created_at': a.created_at.isoformat()
        } for a in announcements
    ])

@announcement_bp.route('/', methods=['POST'])
@token_required
def create_announcement(current_user):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    ann = Announcement(
        title=data['title'],
        content=data['content'],
        created_at=datetime.utcnow()
    )
    db.session.add(ann)
    db.session.commit()
    return jsonify({'message': 'Announcement posted'}), 201
