from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}})


# Configure Gemini
GEMINI_API_KEY = "AIzaSyBOgM2OWtNaTvZ6aHbCoF9_kHCR_CLRgNk"
  # Replace with your actual API key
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash-latest')

SYSTEM_PROMPT = """
You are a professional career coach AI assistant. Your purpose is to help users with career-related questions only.
Focus exclusively on:
- Career switching advice
- Resume and CV optimization
- Job search strategies
- Interview preparation
- Professional skill development
- Remote work guidance
- Industry-specific career advice

If a user asks about topics unrelated to careers, politely redirect them to ask career-related questions only.
Provide practical, actionable advice tailored to the user's specific situation when possible.
"""

@app.route('/chat', methods=['POST', 'OPTIONS'])
def chat():
    if request.method == 'OPTIONS':
        return '', 204
        
    if not request.json or 'message' not in request.json:
        return jsonify({'error': 'No message provided'}), 400

    try:
        user_message = request.json['message']
        
        chat = model.start_chat(history=[
            {"role": "user", "parts": [SYSTEM_PROMPT]},
            {"role": "model", "parts": [
                "I'm a career coach assistant. I'm here to help with career-related questions only."
            ]},
            {"role": "user", "parts": [user_message]}
        ])

        response = chat.send_message(user_message)
        return jsonify({'response': response.text})

    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)