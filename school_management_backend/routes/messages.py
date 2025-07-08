from flask import Blueprint, request, jsonify
from models import Message, User
from app import db
from utils.auth_utils import token_required
from datetime import datetime

message_bp = Blueprint('messages', __name__)

@message_bp.route('/inbox', methods=['GET'])
@token_required
def inbox(current_user):
    messages = Message.query.filter_by(receiver_id=current_user.user_id).order_by(Message.timestamp.desc()).all()
    return jsonify([
        {
            'id': m.id,
            'from': m.sender.name,
            'content': m.content,
            'timestamp': m.timestamp.isoformat()
        } for m in messages
    ])

@message_bp.route('/sent', methods=['GET'])
@token_required
def sent(current_user):
    messages = Message.query.filter_by(sender_id=current_user.user_id).order_by(Message.timestamp.desc()).all()
    return jsonify([
        {
            'id': m.id,
            'to': m.receiver.name,
            'content': m.content,
            'timestamp': m.timestamp.isoformat()
        } for m in messages
    ])

@message_bp.route('/', methods=['POST'])
@token_required
def send_message(current_user):
    data = request.get_json()
    receiver_id = data.get('receiver_id')
    content = data.get('content')

    if not receiver_id or not content:
        return jsonify({'error': 'receiver_id and content are required'}), 400

    msg = Message(
        sender_id=current_user.user_id,
        receiver_id=receiver_id,
        content=content,
        timestamp=datetime.utcnow()
    )
    db.session.add(msg)
    db.session.commit()
    return jsonify({'message': 'Message sent'}), 201
