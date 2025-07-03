# type: ignore
from flask import Blueprint, request, jsonify
from models import Announcement, User
from app import db
from utils.auth_utils import token_required

announcement_bp = Blueprint('announcements', __name__)

# 📄 GET all announcements
@announcement_bp.route('/', methods=['GET'])
@token_required
def get_announcements(current_user):
    announcements = Announcement.query.order_by(Announcement.posted_at.desc()).all()

    return jsonify([{
        'id': a.announcement_id,
        'title': a.title,
        'content': a.content,
        'posted_by': a.poster.name if a.poster else "Unknown",
        'audience': a.target_audience,
        'date': a.posted_at.strftime('%Y-%m-%d %H:%M')
    } for a in announcements]), 200

# 🆕 POST a new announcement
@announcement_bp.route('/', methods=['POST'])
@token_required
def post_announcement(current_user):
    if current_user.role not in ['admin', 'teacher']:
        return jsonify({'error': 'Only admin or teacher can post'}), 403

    data = request.get_json()
    try:
        announcement = Announcement(
            posted_by=current_user.user_id,
            title=data['title'],
            content=data['content'],
            target_audience=data.get('target_audience', 'all')
        )
        db.session.add(announcement)
        db.session.commit()
        return jsonify({'message': 'Announcement posted'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# ❌ DELETE an announcement
@announcement_bp.route('/<int:announcement_id>', methods=['DELETE'])
@token_required
def delete_announcement(current_user, announcement_id):
    announcement = Announcement.query.get_or_404(announcement_id)
    if current_user.role != 'admin' and current_user.user_id != announcement.posted_by:
        return jsonify({'error': 'Not authorized to delete this'}), 403

    db.session.delete(announcement)
    db.session.commit()
    return jsonify({'message': 'Announcement deleted'}), 200
