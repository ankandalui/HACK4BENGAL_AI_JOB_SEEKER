from flask import Flask, jsonify, request, session
from werkzeug.utils import secure_filename
import os
import logging
import fitz  # PyMuPDF
import google.generativeai as genai
import time
from threading import Timer
import pyttsx3
from flask_cors import CORS


app = Flask(__name__)
app.secret_key = "yogfr@g5"



app = Flask(__name__)
CORS(app, supports_credentials=True)

CORS(app, origins=["http://localhost:3000"], supports_credentials=True)




logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf'}
QUESTIONS_PER_INTERVIEW = 30
GEMINI_API_KEY = "AIzaSyBOgM2OWtNaTvZ6aHbCoF9_kHCR_CLRgNk" 


app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


genai.configure(api_key=GEMINI_API_KEY)


tts_engine = pyttsx3.init()
tts_engine.setProperty('rate', 150)

# Global session data store
session_data = {}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(pdf_path):
    """Extract text content from PDF file."""
    try:
        text = ""
        with fitz.open(pdf_path) as doc:
            for page in doc:
                text += page.get_text()
        return text
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {str(e)}")
        return ""

def generate_ai_question(cv_text, job_role, previous_questions=None):
    """Generate interview question using Gemini AI."""
    try:
        previous_q_text = ""
        if previous_questions:
            previous_q_text = "Previous questions asked:\n" + "\n".join(previous_questions)
            
        prompt = f"""
        Create one challenging but fair interview question for a {job_role} role based on this CV.
        The question should assess the candidate's skills and experience as mentioned in their CV.
        
        CV content:
        {cv_text[:2000]}
        
        {previous_q_text}
        
        Provide only the question text without any additional commentary.
        """
        
        model = genai.GenerativeModel("gemini-1.5-flash-latest")
        response = model.generate_content(prompt)
        return response.text.strip() if response.text else "Tell me about your relevant experience."
    except Exception as e:
        logger.error(f"AI Question Generation Error: {str(e)}")
        return "Tell me about your relevant experience."

def provide_feedback(interview_data):
    """Generate interview feedback using Gemini AI."""
    if not interview_data or not interview_data.get("qa_pairs"):
        return "No interview data available for feedback."

    try:
        qa_pairs_formatted = ""
        for qa in interview_data.get("qa_pairs", []):
            qa_pairs_formatted += f"Question: {qa['question']}\nAnswer: {qa['answer']}\n\n"
            
        feedback_prompt = f"""
        Analyze this job interview for a {interview_data.get('job_role', 'professional')} role and provide detailed constructive feedback.
        
        Interview transcript:
        {qa_pairs_formatted}
        
        Please provide:
        1. Detailed analysis question by question how to improve if needed
        2. Overall impression (communication skills, confidence, relevance)
        3. Strengths (what they did well)
        4. Areas for improvement
        5. Specific advice for future interviews
        6. A score out of 10
        """
        
        model = genai.GenerativeModel("gemini-1.5-flash-latest")
        response = model.generate_content(feedback_prompt)
        return response.text.strip() if response else "Could not generate detailed feedback."
    except Exception as e:
        logger.error(f"AI Feedback Error: {str(e)}")
        return "Feedback generation failed. Please try again later."

def end_interview_and_generate_feedback(session_id):
    """End interview and generate final feedback."""
    data = session_data.get(session_id)
    if not data:
        logger.error(f"Session {session_id} not found for feedback generation")
        return
    
    data["interview_active"] = False
    feedback = provide_feedback(data)
    data["final_feedback"] = feedback
    logger.info(f"Auto-generated feedback for session {session_id}")

# API Routes
@app.route('/api/start-interview', methods=['POST'])
def start_interview():
    """Initialize new interview session."""
    try:
        if 'cv' not in request.files:
            return jsonify({'error': 'No CV file provided'}), 400
            
        cv_file = request.files['cv']
        if cv_file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
            
        if not allowed_file(cv_file.filename):
            return jsonify({'error': 'Invalid file type'}), 400

        job_role = request.form.get('job_role')
        duration = int(request.form.get('duration', 30))  # Default 30 minutes
        
        if not job_role:
            return jsonify({'error': 'Job role is required'}), 400

        # Create session
        session_id = str(int(time.time())) + os.urandom(4).hex()
        session['session_id'] = session_id
        
        # Save CV file
        filename = secure_filename(f"{session_id}_{cv_file.filename}")
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        cv_file.save(filepath)
        
        # Extract CV text
        cv_text = extract_text_from_pdf(filepath)
        
        # Initialize session data
        session_data[session_id] = {
            'cv_text': cv_text,
            'job_role': job_role,
            'start_time': time.time(),
            'end_time': time.time() + (duration * 60),
            'qa_pairs': [],
            'previous_questions': [],
            'interview_active': True,
            'question_count': 0
        }
        
        # Schedule interview end
        Timer(duration * 60, end_interview_and_generate_feedback, [session_id]).start()
        
        return jsonify({
            'session_id': session_id,
            'message': 'Interview session started successfully'
        })
        
    except Exception as e:
        logger.error(f"Error starting interview: {str(e)}")
        return jsonify({'error': 'Failed to start interview'}), 500

@app.route('/api/status', methods=['GET'])
def check_status():
    """Check interview session status."""
    session_id = session.get('session_id')
    if not session_id or session_id not in session_data:
        return jsonify({'active': False, 'message': 'No active session found'}), 404
    
    data = session_data[session_id]
    active = data['interview_active'] and time.time() < data['end_time']
    max_questions_reached = data['question_count'] >= QUESTIONS_PER_INTERVIEW
    
    if not active or max_questions_reached:
        data['interview_active'] = False
        return jsonify({
            'active': False,
            'message': 'Interview has ended',
            'reason': 'time_exceeded' if not active else 'max_questions_reached'
        })
    
    return jsonify({
        'active': True,
        'time_remaining': int(data['end_time'] - time.time()),
        'questions_remaining': QUESTIONS_PER_INTERVIEW - data['question_count']
    })

@app.route('/api/question', methods=['GET'])
def get_question():
    """Get next interview question."""
    session_id = session.get('session_id')
    if not session_id or session_id not in session_data:
        return jsonify({'error': 'No active session found'}), 404
    
    data = session_data[session_id]
    
    if not data['interview_active']:
        return jsonify({'error': 'Interview session has ended'}), 400
    
    if data['question_count'] >= QUESTIONS_PER_INTERVIEW:
        data['interview_active'] = False
        return jsonify({'error': 'Maximum questions reached'}), 400
    
    question = generate_ai_question(
        data['cv_text'],
        data['job_role'],
        data['previous_questions']
    )
    
    data['current_question'] = question
    data['previous_questions'].append(question)
    data['question_count'] += 1
    
    return jsonify({
        'question': question,
        'question_number': data['question_count'],
        'total_questions': QUESTIONS_PER_INTERVIEW
    })

@app.route('/api/answer', methods=['POST'])
def submit_answer():
    """Submit answer for current question."""
    session_id = session.get('session_id')
    if not session_id or session_id not in session_data:
        return jsonify({'error': 'No active session found'}), 404
    
    data = session_data[session_id]
    
    if not data['interview_active']:
        return jsonify({'error': 'Interview session has ended'}), 400
    
    answer = request.json.get('answer')
    if not answer:
        return jsonify({'error': 'No answer provided'}), 400
    
    qa_pair = {
        'question': data['current_question'],
        'answer': answer,
        'timestamp': time.time()
    }
    
    data['qa_pairs'].append(qa_pair)
    
    return jsonify({
        'success': True,
        'message': 'Answer recorded successfully',
        'questions_remaining': QUESTIONS_PER_INTERVIEW - data['question_count']
    })

@app.route('/api/feedback', methods=['GET'])
def get_feedback():
    """Get interview feedback."""
    session_id = session.get('session_id')
    if not session_id or session_id not in session_data:
        return jsonify({'error': 'No active session found'}), 404
    
    data = session_data[session_id]
    
    if data['interview_active']:
        return jsonify({'error': 'Interview is still in progress'}), 400
    
    if 'final_feedback' in data:
        return jsonify({'feedback': data['final_feedback']})
    
    feedback = provide_feedback(data)
    data['final_feedback'] = feedback
    
    return jsonify({
        'feedback': feedback,
        'interview_summary': {
            'total_questions': len(data['qa_pairs']),
            'duration': int(data['end_time'] - data['start_time']),
            'job_role': data['job_role']
        }
    })

# Error Handlers
@app.errorhandler(404)
def not_found_error(error):
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True)