from flask import Blueprint, request, jsonify
from app import db
from models.database import AITask
from datetime import datetime

bp = Blueprint('text_generation', __name__, url_prefix='/api/text-generation')

def generate_text(prompt, max_length=100, temperature=0.7):
    """
    Mock text generation function
    Replace dengan Hugging Face transformers atau OpenAI API
    """
    # Placeholder response
    generated_text = f"Generated text based on: '{prompt}'. This is a mock response. " \
                    f"Max length: {max_length}, Temperature: {temperature}"
    return generated_text

@bp.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'text generation service healthy'}), 200

@bp.route('/generate', methods=['POST'])
def generate():
    """Generate text from prompt"""
    try:
        data = request.json
        prompt = data.get('prompt')
        max_length = data.get('max_length', 100)
        temperature = data.get('temperature', 0.7)
        user_id = data.get('user_id')
        
        if not prompt:
            return jsonify({'error': 'Prompt is required'}), 400
        
        # Create task record
        task = AITask(
            user_id=user_id,
            task_type='text-generation',
            input_data=json.dumps({'prompt': prompt, 'max_length': max_length}),
            status='processing'
        )
        db.session.add(task)
        db.session.commit()
        
        # Generate text
        generated = generate_text(prompt, max_length, temperature)
        
        # Update task
        task.output_data = generated
        task.status = 'completed'
        task.completed_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'task_id': task.id,
            'prompt': prompt,
            'generated_text': generated,
            'status': 'completed'
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bp.route('/templates', methods=['GET'])
def get_templates():
    """Get text generation templates"""
    templates = [
        {
            'id': 1,
            'name': 'Blog Post',
            'prompt': 'Write a blog post about {topic}',
            'max_length': 500
        },
        {
            'id': 2,
            'name': 'Product Description',
            'prompt': 'Write a product description for {product}',
            'max_length': 200
        },
        {
            'id': 3,
            'name': 'Social Media Post',
            'prompt': 'Write a social media post about {topic}',
            'max_length': 280
        }
    ]
    return jsonify({'templates': templates}), 200

@bp.route('/history', methods=['GET'])
def get_history():
    """Get text generation history"""
    try:
        user_id = request.args.get('user_id', 1)
        tasks = AITask.query.filter_by(
            user_id=user_id,
            task_type='text-generation'
        ).all()
        
        return jsonify({
            'tasks': [task.to_dict() for task in tasks]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
