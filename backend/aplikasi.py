from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///web_ai.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Import routes
from routes import chatbot, text_generation, image_processing, nlp, analytics

# Register blueprints
app.register_blueprint(chatbot.bp)
app.register_blueprint(text_generation.bp)
app.register_blueprint(image_processing.bp)
app.register_blueprint(nlp.bp)
app.register_blueprint(analytics.bp)

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat()
    }), 200

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        'message': 'Web AI Platform API',
        'version': '1.0.0',
        'endpoints': {
            'chatbot': '/api/chatbot',
            'text_generation': '/api/text-generation',
            'image_processing': '/api/image-processing',
            'nlp': '/api/nlp',
            'analytics': '/api/analytics'
        }
    }), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)
