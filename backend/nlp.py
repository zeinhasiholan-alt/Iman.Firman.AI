from flask import Blueprint, request, jsonify
from app import db
from models.database import AITask
from datetime import datetime
import json

bp = Blueprint('nlp', __name__, url_prefix='/api/nlp')

def process_nlp(text, task):
    """
    Mock NLP processing function
    Replace dengan Hugging Face NLP models
    """
    result = {'text': text, 'task': task}
    
    if task == 'sentiment':
        result['sentiment'] = 'positive'
        result['confidence'] = 0.87
    elif task == 'ner':  # Named Entity Recognition
        result['entities'] = [
            {'text': 'Example', 'label': 'PERSON'},
            {'text': 'Company', 'label': 'ORG'}
        ]
    elif task == 'summarization':
        result['summary'] = 'This is a summary of the text'
    elif task == 'translation':
        result['translated'] = 'Ini adalah terjemahan dari teksnya'
    
    return result

@bp.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'nlp service healthy'}), 200

@bp.route('/process', methods=['POST'])
def process():
    """Process NLP task"""
    try:
        data = request.json
        text = data.get('text')
        task = data.get('task')  # sentiment, ner, summarization, translation
        user_id = data.get('user_id')
        
        if not text or not task:
            return jsonify({'error': 'Text and task are required'}), 400
        
        # Create task record
        ai_task = AITask(
            user_id=user_id,
            task_type='nlp',
            input_data=json.dumps({'text': text, 'task': task}),
            status='processing'
        )
        db.session.add(ai_task)
        db.session.commit()
        
        # Process NLP
        result = process_nlp(text, task)
        
        # Update task
        ai_task.output_data = json.dumps(result)
        ai_task.status = 'completed'
        ai_task.completed_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'task_id': ai_task.id,
            'result': result,
            'status': 'completed'
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bp.route('/tasks', methods=['GET'])
def get_tasks():
    """Get available NLP tasks"""
    tasks = [
        {
            'id': 'sentiment',
            'name': 'Sentiment Analysis',
            'description': 'Analyze sentiment of text'
        },
        {
            'id': 'ner',
            'name': 'Named Entity Recognition',
            'description': 'Extract entities from text'
        },
        {
            'id': 'summarization',
            'name': 'Text Summarization',
            'description': 'Summarize text'
        },
        {
            'id': 'translation',
            'name': 'Machine Translation',
            'description': 'Translate text'
        }
    ]
    return jsonify({'tasks': tasks}), 200
