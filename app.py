from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

# Mengambil API Key yang sudah kamu pasang di Vercel
api_key = os.environ.get("GEMINI_API_KEY")
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-pro')

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message')
        
        if not user_message:
            return jsonify({'error': 'Pesan tidak boleh kosong'}), 400
            
        # Perintah ke Gemini AI
        response = model.generate_content(user_message)
        return jsonify({'reply': response.text})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({'status': 'online', 'message': 'AI Backend is running'})

if __name__ == '__main__':
    app.run(debug=True)
