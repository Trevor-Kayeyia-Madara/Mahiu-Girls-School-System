# routes/announcements.py

from flask import Blueprint, request, jsonify
from models import Announcement, User
from app import db
from utils.auth_utils import token_required

announcement_bp = Blueprint('announcements', __name__)

@announcement_bp.route('/', methods=['POST'])
@token_required
def create_announcement(current_user):
    if current_user.role != 'admin':
        return jsonify({'error': 'Only admins can post announcements'}), 403

    data = request.get_json()
    announcement = Announcement(
        title=data['title'],
        content=data['content'],
        target_role=data['target_role'],
        posted_by=current_user.user_id
    )
    db.session.add(announcement)
    db.session.commit()

    return jsonify({'message': 'Announcement posted'}), 201


@announcement_bp.route('/', methods=['GET'])
@token_required
def get_announcements(current_user):
    role = current_user.role
    announcements = Announcement.query.filter(
        (Announcement.target_role == role) | (Announcement.target_role == 'all')
    ).order_by(Announcement.timestamp.desc()).all()

    return jsonify([{
        'id': a.id,
        'title': a.title,
        'content': a.content,
        'target_role': a.target_role,
        'timestamp': a.timestamp.isoformat(),
        'posted_by': a.poster.name
    } for a in announcements])
