from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

# Mengambil API Key dari Environment Variable Vercel
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
            
        # Proses ke Gemini AI
        response = model.generate_content(user_message)
        return jsonify({'reply': response.text})
        
    except Exception as e:
        # Jika API Key salah atau limit habis, error muncul di sini
        return jsonify({'error': str(e)}), 500

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({'status': 'online', 'message': 'AI Backend is running'})

# Penting untuk Vercel
if __name__ == '__main__':
    app.run(debug=True)
