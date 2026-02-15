from flask import Blueprint, request, jsonify
from app import db
from models.database import User, Conversation, Message, AITask
from datetime import datetime
import json

bp = Blueprint('chatbot', __name__, url_prefix='/api/chatbot')

# Mock AI responses - Replace dengan actual AI model
def get_ai_response(user_message):
    """
    This is a mock function. Replace with actual AI model integration
    (OpenAI, Hugging Face, etc.)
    """
    responses = {
        'hello': 'Halo! Ada yang bisa saya bantu?',
        'siapa kamu': 'Saya adalah AI Assistant. Saya siap membantu Anda!',
        'default': f'Terima kasih atas pertanyaan Anda: "{user_message}". Saya sedang memproses...'
    }
    
    user_message_lower = user_message.lower()
    for key, response in responses.items():
        if key in user_message_lower:
            return response
    return responses['default']

@bp.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'chatbot service healthy'}), 200

@bp.route('/new', methods=['POST'])
def create_conversation():
    """Create a new conversation"""
    try:
        data = request.json
        user_id = data.get('user_id', 1)  # Default user
        title = data.get('title', 'New Conversation')
        
        user = User.query.get_or_404(user_id)
        
        conversation = Conversation(
            user_id=user_id,
            title=title
        )
        db.session.add(conversation)
        db.session.commit()
        
        return jsonify({
            'message': 'Conversation created',
            'conversation': conversation.to_dict()
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bp.route('/<int:conversation_id>/message', methods=['POST'])
def send_message(conversation_id):
    """Send a message and get AI response"""
    try:
        data = request.json
        user_message = data.get('message')
        
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400
        
        conversation = Conversation.query.get_or_404(conversation_id)
        
        # Save user message
        user_msg = Message(
            conversation_id=conversation_id,
            role='user',
            content=user_message
        )
        db.session.add(user_msg)
        db.session.commit()
        
        # Get AI response
        ai_response = get_ai_response(user_message)
        
        # Save AI response
        ai_msg = Message(
            conversation_id=conversation_id,
            role='assistant',
            content=ai_response
        )
        db.session.add(ai_msg)
        conversation.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'user_message': user_msg.to_dict(),
            'ai_response': ai_msg.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bp.route('/<int:conversation_id>', methods=['GET'])
def get_conversation(conversation_id):
    """Get conversation history"""
    try:
        conversation = Conversation.query.get_or_404(conversation_id)
        messages = Message.query.filter_by(conversation_id=conversation_id).all()
        
        return jsonify({
            'conversation': conversation.to_dict(),
            'messages': [msg.to_dict() for msg in messages]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bp.route('/conversations', methods=['GET'])
def list_conversations():
    """List all conversations"""
    try:
        user_id = request.args.get('user_id', 1)
        conversations = Conversation.query.filter_by(user_id=user_id).all()
        
        return jsonify({
            'conversations': [c.to_dict() for c in conversations]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bp.route('/<int:conversation_id>', methods=['DELETE'])
def delete_conversation(conversation_id):
    """Delete a conversation"""
    try:
        conversation = Conversation.query.get_or_404(conversation_id)
        db.session.delete(conversation)
        db.session.commit()
        
        return jsonify({'message': 'Conversation deleted'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
