# routes/messages.py

from flask import Blueprint, request, jsonify
from app import db
from models import Message, User
from utils.auth_utils import token_required

message_bp = Blueprint('messages', __name__)

# 📨 Send a new message
@message_bp.route('/', methods=['POST'])
@token_required
def send_message(current_user):
    data = request.get_json()
    msg = Message(
        sender_id=current_user.user_id,
        receiver_id=data['receiver_id'],
        content=data['content']
    )
    db.session.add(msg)
    db.session.commit()
    return jsonify({'message': 'Message sent successfully'}), 201

# 📬 Get all received messages
@message_bp.route('/inbox', methods=['GET'])
@token_required
def inbox(current_user):
    messages = Message.query.filter_by(receiver_id=current_user.user_id).order_by(Message.timestamp.desc()).all()
    return jsonify([
        {
            'id': m.id,
            'sender': m.sender.name,
            'content': m.content,
            'timestamp': m.timestamp.isoformat(),
            'read': m.read
        }
        for m in messages
    ])

# 📤 Get all sent messages
@message_bp.route('/sent', methods=['GET'])
@token_required
def sent(current_user):
    messages = Message.query.filter_by(sender_id=current_user.user_id).order_by(Message.timestamp.desc()).all()
    return jsonify([
        {
            'id': m.id,
            'receiver': m.receiver.name,
            'content': m.content,
            'timestamp': m.timestamp.isoformat()
        }
        for m in messages
    ])

# ✅ Mark message as read
@message_bp.route('/<int:msg_id>/read', methods=['PUT'])
@token_required
def mark_as_read(current_user, msg_id):
    msg = Message.query.get_or_404(msg_id)
    if msg.receiver_id != current_user.user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    msg.read = True
    db.session.commit()
    return jsonify({'message': 'Message marked as read'}), 200

# 🔔 Check unread message count
@message_bp.route('/unread-count', methods=['GET'])
@token_required
def unread_count(current_user):
    count = Message.query.filter_by(receiver_id=current_user.user_id, read=False).count()
    return jsonify({'unread': count})

# 🔔 General notification summary
@message_bp.route('/notifications', methods=['GET'])
@token_required
def notifications_summary(current_user):
    unread_messages = Message.query.filter_by(receiver_id=current_user.user_id, read=False).count()
    
    return jsonify({
        'messages': unread_messages,
        # 'announcements': 3, # Future enhancement
        # 'alerts': 0
    })
