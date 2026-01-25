from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Message, User
from extensions import db
from sqlalchemy import or_

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/history', methods=['GET'])
@jwt_required()
def get_chat_history():
    current_uid = int(get_jwt_identity())
    receiver_id = request.args.get('receiver_id')
    
    if receiver_id:
        # Private chat
        receiver_id = int(receiver_id)
        messages = Message.query.filter(
            or_(
                (Message.sender_id == current_uid) & (Message.receiver_id == receiver_id),
                (Message.sender_id == receiver_id) & (Message.receiver_id == current_uid)
            )
        ).order_by(Message.created_at.asc()).limit(100).all()
    else:
        # Global chat (receiver_id is null)
        messages = Message.query.filter_by(receiver_id=None).order_by(Message.created_at.asc()).limit(100).all()
    
    result = []
    for msg in messages:
        result.append({
            "id": msg.id,
            "sender_id": msg.sender_id,
            "sender_name": msg.sender.username,
            "sender_is_admin": msg.sender.is_admin,
            "content": msg.content,
            "timestamp": msg.created_at.isoformat()
        })
    
    return jsonify(result), 200
