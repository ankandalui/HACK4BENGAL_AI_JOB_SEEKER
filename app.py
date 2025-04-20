# # app.py
# from fastapi import FastAPI, File, UploadFile, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# import cv2
# import numpy as np
# from PIL import Image
# import base64
# from io import BytesIO
# import traceback
# from collections import deque
# import time
# import random

# app = FastAPI()

# # Configure CORS to allow requests from your Next.js frontend
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:3000"],  # Update with your Next.js URL
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Global state for confidence calculation
# class ConfidenceState:
#     def __init__(self):
#         self.confidence_history = deque(maxlen=30)
#         self.emotion_history = deque(maxlen=10)
#         self.confidence_history.append(0)
#         self.current_confidence = 0
#         self.current_emotion = "unknown"
#         self.current_emotion_scores = {}
        
#         # Confidence weights for each emotion (0-100)
#         self.emotion_confidence_scores = {
#             'angry': 30,     # Low confidence when angry
#             'disgust': 20,   # Very low confidence when disgusted
#             'fear': 25,      # Low confidence when afraid
#             'happy': 90,     # High confidence when happy
#             'sad': 40,       # Moderate-low confidence when sad
#             'surprise': 70,  # Moderate-high confidence when surprised
#             'neutral': 60    # Moderate confidence when neutral
#         }

# state = ConfidenceState()

# @app.post("/analyze-image")
# async def analyze_image(file: UploadFile = File(...)):
#     try:
#         contents = await file.read()
#         img = Image.open(BytesIO(contents))
#         img_np = np.array(img)
        
#         # Convert RGB to BGR if needed (OpenCV uses BGR)
#         if len(img_np.shape) == 3 and img_np.shape[2] == 3:
#             img_np = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
        
#         # Detect faces
#         face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
#         gray = cv2.cvtColor(img_np, cv2.COLOR_BGR2GRAY)
#         faces = face_cascade.detectMultiScale(gray, 1.1, 5, minSize=(30, 30))
        
#         # If no faces detected, return early
#         if len(faces) == 0:
#             state.confidence_history.append(0)
#             state.current_confidence = 0
#             state.current_emotion = "unknown"
#             state.current_emotion_scores = {}
            
#             return {
#                 "faceDetected": False,
#                 "confidence": 0,
#                 "emotion": "unknown",
#                 "emotionScores": {},
#                 "confidenceHistory": list(state.confidence_history)
#             }
        
#         # Process the largest face
#         face = max(faces, key=lambda f: f[2] * f[3])
#         x, y, w, h = face
        
#         # Extract face ROI
#         face_roi = img_np[y:y+h, x:x+w].copy()
        
#         # Simulate emotion analysis (replace with real implementation if you get DeepFace working)
#         emotion, emotion_scores = simulate_emotion_analysis(face_roi)
        
#         # Calculate confidence score
#         confidence = calculate_confidence(emotion, emotion_scores, face, img_np.shape)
        
#         # Update state
#         state.current_confidence = confidence
#         state.current_emotion = emotion
#         state.current_emotion_scores = emotion_scores
#         state.confidence_history.append(confidence)
#         state.emotion_history.append(emotion)
        
#         # Prepare face image with rectangle for frontend
#         cv2.rectangle(img_np, (x, y), (x+w, y+h), (0, 255, 0), 2)
#         img_np = cv2.cvtColor(img_np, cv2.COLOR_BGR2RGB)  # Convert back to RGB
        
#         # Convert to base64 for JSON response
#         _, buffer = cv2.imencode(".jpg", img_np)
#         img_str = base64.b64encode(buffer).decode()
        
#         return {
#             "faceDetected": True,
#             "confidence": confidence,
#             "emotion": emotion,
#             "emotionScores": emotion_scores,
#             "confidenceHistory": list(state.confidence_history),
#             "processedImage": f"data:image/jpeg;base64,{img_str}"
#         }
        
#     except Exception as e:
#         print(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=str(e))

# def simulate_emotion_analysis(face_roi):
#     """Simulate emotion analysis since DeepFace isn't working."""
#     # This is a placeholder - in a real scenario we'd use an actual emotion detection model
#     # You can replace this with another emotion detection library if needed
    
#     # Get some features from the face to make the simulation more realistic
#     gray_face = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
#     avg_brightness = np.mean(gray_face)
    
#     # List of possible emotions
#     emotions = ['neutral', 'happy', 'sad', 'angry', 'fear', 'surprise', 'disgust']
    
#     # Simple heuristic: brighter images are more likely to be happy
#     if avg_brightness > 120:
#         primary_candidates = ['happy', 'neutral', 'surprise']
#     elif avg_brightness < 80:
#         primary_candidates = ['sad', 'fear', 'angry']
#     else:
#         primary_candidates = ['neutral', 'happy', 'sad']
    
#     # Pick a primary emotion with some randomness
#     if len(state.emotion_history) > 0 and random.random() < 0.7:
#         # 70% chance to keep the same emotion for continuity
#         primary_emotion = state.emotion_history[-1]
#     else:
#         primary_emotion = random.choice(primary_candidates)
    
#     # Generate realistic emotion scores
#     emotion_scores = {}
    
#     # Set the primary emotion with a high score
#     primary_score = random.uniform(60, 85)
#     emotion_scores[primary_emotion] = primary_score
    
#     # Distribute the remaining probability among other emotions
#     remaining = 100 - primary_score
#     secondary_emotions = [e for e in emotions if e != primary_emotion]
    
#     for emotion in secondary_emotions:
#         if remaining <= 0:
#             emotion_scores[emotion] = 0.1  # Small non-zero value
#         else:
#             if emotion in primary_candidates and emotion != primary_emotion:
#                 # Related emotions get higher scores
#                 score = random.uniform(5, remaining / 2)
#             else:
#                 score = random.uniform(0.1, remaining / 3)
#             emotion_scores[emotion] = score
#             remaining -= score
    
#     # Normalize to ensure sum is 100
#     total = sum(emotion_scores.values())
#     emotion_scores = {k: (v / total) * 100 for k, v in emotion_scores.items()}
    
#     return primary_emotion, emotion_scores

# def calculate_confidence(emotion, emotion_scores, face_coords, frame_shape):
#     """Calculate overall confidence score based on emotion and face attributes."""
#     x, y, w, h = face_coords
    
#     try:
#         # 1. Emotion-based confidence (40% of total)
#         emotion_base_score = state.emotion_confidence_scores.get(emotion, 50)
#         emotion_confidence = 0.4 * emotion_base_score
        
#         # 2. Certainty factor (20% of total) - how confident the model is about the emotion
#         dominant_score = emotion_scores.get(emotion, 50)
#         certainty_factor = 0.2 * dominant_score
        
#         # 3. Face size relative to frame (15% of total)
#         frame_height, frame_width = frame_shape[:2]
#         size_factor = (w * h) / (frame_width * frame_height) * 100
#         size_score = min(size_factor * 3, 15)
        
#         # 4. Face position - centered faces get higher scores (10% of total)
#         center_x = x + w/2
#         center_y = y + h/2
#         center_offset_x = abs(center_x - frame_width/2) / (frame_width/2)
#         center_offset_y = abs(center_y - frame_height/2) / (frame_height/2)
#         position_score = 10 * (1 - (center_offset_x + center_offset_y) / 2)
        
#         # 5. Emotion stability - consistent emotions get higher scores (15% of total)
#         if len(state.emotion_history) >= 3:
#             # Count occurrences of the current emotion in history
#             emotion_count = state.emotion_history.count(emotion)
#             stability_ratio = emotion_count / len(state.emotion_history)
#             stability_score = 15 * stability_ratio
#         else:
#             stability_score = 0
        
#         # Combined confidence score (0-100)
#         total_confidence = min(100, emotion_confidence + certainty_factor + size_score + position_score + stability_score)
        
#         return total_confidence
        
#     except Exception as e:
#         print(f"Error in confidence calculation: {str(e)}")
#         traceback.print_exc()
#         return 50  # Return a default value

# @app.get("/")
# async def root():
#     return {"message": "Emotion Confidence API is running"}

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)



import os
import logging
import fitz  # PyMuPDF for extracting text from PDFs
import google.generativeai as genai  # Google Gemini AI
import cv2
import numpy as np
import base64
from io import BytesIO
import time
import json
import uuid
import random
from collections import deque
from flask import Flask, request, jsonify, session
from flask_cors import CORS
import traceback


app = Flask(__name__)
app.secret_key = "yogfr@g5"
CORS(app)  # Enable CORS for all routes

logging.basicConfig(level=logging.INFO)

GEMINI_API_KEY = "AIzaSyBOgM2OWtNaTvZ6aHbCoF9_kHCR_CLRgNk"
genai.configure(api_key=GEMINI_API_KEY)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

session_data = {}



class EmotionConfidenceAnalyzer:
    def __init__(self):
        self.confidence_history = deque(maxlen=30) 
        self.emotion_history = deque(maxlen=10)  
        self.confidence_history.append(0)
        self.current_confidence = 0
        self.current_emotion = "unknown"
        self.current_emotion_scores = {}
        
       
        self.emotion_confidence_scores = {
            'angry': 30,   
            'disgust': 20,
            'fear': 25,     
            'happy': 90,    
            'sad': 40, 
            'surprise': 70,
            'neutral': 60 
        }
        
       
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        if self.face_cascade.empty():
            raise Exception("Error loading face cascade classifier")

    def analyze_image(self, img_data):
        """
        Analyze an image to detect faces and emotions, and calculate confidence
        """
        try:
       
            nparr = np.frombuffer(img_data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
     
            faces = self.face_cascade.detectMultiScale(
                gray, 
                scaleFactor=1.1, 
                minNeighbors=5, 
                minSize=(30, 30)
            )
            
            if len(faces) == 0:
                # No face detected
                self.confidence_history.append(0)
                self.current_confidence = 0
                self.current_emotion = "unknown"
                self.current_emotion_scores = {}
                
                return {
                    "faceDetected": False,
                    "confidence": 0,
                    "emotion": "unknown",
                    "emotionScores": {},
                    "confidenceHistory": list(self.confidence_history)
                }
            
 
            face = max(faces, key=lambda f: f[2] * f[3])
            x, y, w, h = face
            
    
            face_roi = img[y:y+h, x:x+w].copy()
            
           
            emotion, emotion_scores = self.simulate_emotion_analysis(face_roi)
            
       
            confidence = self.calculate_confidence(emotion, emotion_scores, face, img.shape)
            
            # Update state
            self.current_confidence = confidence
            self.current_emotion = emotion
            self.current_emotion_scores = emotion_scores
            self.confidence_history.append(confidence)
            self.emotion_history.append(emotion)
            
            # Draw rectangle around face
            cv2.rectangle(img, (x, y), (x+w, y+h), (0, 255, 0), 2)
            
            # Convert image to base64 for response
            _, buffer = cv2.imencode('.jpg', img)
            img_base64 = base64.b64encode(buffer).decode('utf-8')
            
            return {
                "faceDetected": True,
                "confidence": confidence,
                "emotion": emotion,
                "emotionScores": emotion_scores,
                "confidenceHistory": list(self.confidence_history),
                "processedImage": f"data:image/jpeg;base64,{img_base64}"
            }
            
        except Exception as e:
            logging.error(f"Error in image analysis: {str(e)}")
            traceback.print_exc()
            return {
                "faceDetected": False,
                "confidence": 0,
                "emotion": "unknown",
                "emotionScores": {},
                "confidenceHistory": list(self.confidence_history),
                "error": str(e)
            }

    def simulate_emotion_analysis(self, face_roi):
        """
        Simulate emotion analysis (replace with DeepFace or another emotion detection library)
        """
       
        gray_face = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
        avg_brightness = np.mean(gray_face)
        
        # List of possible emotions
        emotions = ['neutral', 'happy', 'sad', 'angry', 'fear', 'surprise', 'disgust']
        
        # Simple heuristic: brighter images are more likely to be happy
        if avg_brightness > 120:
            primary_candidates = ['happy', 'neutral', 'surprise']
        elif avg_brightness < 80:
            primary_candidates = ['sad', 'fear', 'angry']
        else:
            primary_candidates = ['neutral', 'happy', 'sad']
        
        # Pick a primary emotion with some randomness
        if len(self.emotion_history) > 0 and random.random() < 0.7:
            # 70% chance to keep the same emotion for continuity
            primary_emotion = self.emotion_history[-1]
        else:
            primary_emotion = random.choice(primary_candidates)
        
        # Generate realistic emotion scores
        emotion_scores = {}
        
        # Set the primary emotion with a high score
        primary_score = random.uniform(60, 85)
        emotion_scores[primary_emotion] = primary_score
        
        # Distribute the remaining probability among other emotions
        remaining = 100 - primary_score
        secondary_emotions = [e for e in emotions if e != primary_emotion]
        
        for emotion in secondary_emotions:
            if remaining <= 0:
                emotion_scores[emotion] = 0.1  # Small non-zero value
            else:
                if emotion in primary_candidates and emotion != primary_emotion:
                    # Related emotions get higher scores
                    score = random.uniform(5, remaining / 2)
                else:
                    score = random.uniform(0.1, remaining / 3)
                emotion_scores[emotion] = score
                remaining -= score
        
        # Normalize to ensure sum is 100
        total = sum(emotion_scores.values())
        emotion_scores = {k: (v / total) * 100 for k, v in emotion_scores.items()}
        
        return primary_emotion, emotion_scores

    def calculate_confidence(self, emotion, emotion_scores, face_coords, frame_shape):
        """
        Calculate overall confidence score based on emotion and face attributes
        """
        x, y, w, h = face_coords
        
        try:
            # 1. Emotion-based confidence (40% of total)
            emotion_base_score = self.emotion_confidence_scores.get(emotion, 50)
            emotion_confidence = 0.4 * emotion_base_score
            
            # 2. Certainty factor (20% of total) - how confident the model is about the emotion
            dominant_score = emotion_scores.get(emotion, 50)
            certainty_factor = 0.2 * dominant_score
            
            # 3. Face size relative to frame (15% of total)
            frame_height, frame_width = frame_shape[:2]
            size_factor = (w * h) / (frame_width * frame_height) * 100
            size_score = min(size_factor * 3, 15)
            
            # 4. Face position - centered faces get higher scores (10% of total)
            center_x = x + w/2
            center_y = y + h/2
            center_offset_x = abs(center_x - frame_width/2) / (frame_width/2)
            center_offset_y = abs(center_y - frame_height/2) / (frame_height/2)
            position_score = 10 * (1 - (center_offset_x + center_offset_y) / 2)
            
            # 5. Emotion stability - consistent emotions get higher scores (15% of total)
            if len(self.emotion_history) >= 3:
                # Count occurrences of the current emotion in history
                emotion_count = self.emotion_history.count(emotion)
                stability_ratio = emotion_count / len(self.emotion_history)
                stability_score = 15 * stability_ratio
            else:
                stability_score = 0
            
            # Combined confidence score (0-100)
            total_confidence = min(100, emotion_confidence + certainty_factor + size_score + position_score + stability_score)
            
            return total_confidence
            
        except Exception as e:
            logging.error(f"Error in confidence calculation: {str(e)}")
            traceback.print_exc()
            return 50  # Return a default value

# ---------------------- UTILITY FUNCTIONS ----------------------

def extract_text_from_pdf(pdf_path):
    text = ""
    try:
        with fitz.open(pdf_path) as doc:
            for page in doc:
                text += page.get_text()
        return text
    except Exception as e:
        logging.error(f"Error extracting text from PDF: {str(e)}")
        return ""

def generate_ai_question(cv_text, job_role, previous_questions=None):
    try:
        previous_q_text = ""
        if previous_questions:
            previous_q_text = "Previous questions asked:\n" + "\n".join(previous_questions)
            
        prompt = f"""
        You are a professional interviewer conducting a job interview. 
        Generate one clear, concise, and focused interview question for a {job_role} position.
        
        Key instructions:
        1. Keep the question short and to the point (maximum 20-25 words)
        2. Make it relevant to the candidate's background
        3. Focus on specific skills, experiences, or scenarios related to the job
        4. Avoid generic questions that could be asked to any candidate
        5. Don't repeat questions that have already been asked
        
        Candidate's CV summary:
        {cv_text[:2500]}  # Limit CV text to avoid token limits
        
        {previous_q_text}
        
        IMPORTANT: Provide ONLY the question text without any commentary, introduction or explanation.
        """
        
        response = genai.GenerativeModel("gemini-1.5-flash-latest").generate_content(prompt)
        question = response.text.strip() if response and response.text else "Tell me about your key skills for this role."
        
        return question
    except Exception as e:
        logging.error(f"AI Question Generation Error: {str(e)}")
        return "Tell me about your most relevant experience for this position."
    

def provide_feedback(interview_data):
    """
    Generate detailed feedback based on interview data.
    
    This function analyses the Q&A pairs, confidence scores, and other interview
    metrics to provide comprehensive feedback on the candidate's performance.
    """
    # Validate interview data
    if not interview_data:
        logging.error("No interview data provided for feedback generation")
        return "No interview data available to provide feedback."
    
    # Log what we're working with
    logging.info(f"Generating feedback for session: {interview_data.get('session_id')}")
    logging.info(f"Number of QA pairs: {len(interview_data.get('qa_pairs', []))}")
    logging.info(f"Number of confidence scores: {len(interview_data.get('confidence_scores', []))}")
    
    # Check if we have QA pairs
    if not interview_data.get("qa_pairs") or len(interview_data.get("qa_pairs", [])) == 0:
        logging.error("No QA pairs found in interview data")
        return "No interview questions and answers available to provide feedback."

    try:
        # Format QA pairs for the prompt
        qa_pairs_formatted = ""
        for i, qa in enumerate(interview_data.get("qa_pairs", [])):
            qa_pairs_formatted += f"Question {i+1}: {qa['question']}\nAnswer {i+1}: {qa['answer']}\n\n"
            
        # Calculate average confidence score
        avg_confidence = 0
        confidence_scores = interview_data.get("confidence_scores", [])
        if confidence_scores and len(confidence_scores) > 0:
            # Filter out zero values which might skew the average
            valid_scores = [score for score in confidence_scores if score > 0]
            if valid_scores:
                avg_confidence = sum(valid_scores) / len(valid_scores)
            logging.info(f"Average confidence score: {avg_confidence:.1f}%")
        else:
            logging.warning("No valid confidence scores found")
            
        # Build the feedback prompt
        feedback_prompt = f"""
        Analyze this job interview for a {interview_data.get('job_role', 'professional')} role and provide detailed constructive feedback.
        
        Interview transcript:
        {qa_pairs_formatted}
        
        Average confidence score detected: {avg_confidence:.1f}% (based on facial expressions and voice analysis)
        
        Please provide:
        1. Detailed analysis question by question, highlighting strengths and suggestions for improvement
        2. Overall impression (communication skills, confidence, relevance)
        3. Strengths (what they did well)
        4. Areas for improvement
        5. Specific advice for future interviews
        6. A score out of 10
        """
        
        logging.info("Calling Gemini API for feedback generation")
        model = genai.GenerativeModel("gemini-1.5-flash-latest")
        response = model.generate_content(feedback_prompt)
        
        if response and response.text:
            logging.info("Successfully generated feedback")
            return response.text.strip()
        else:
            logging.error("Empty response from Gemini API")
            return "Could not generate detailed feedback. Please try again."
    except Exception as e:
        logging.error(f"AI Feedback Error: {str(e)}")
        traceback.print_exc()
        return f"Feedback generation failed due to a technical error: {str(e)}. Please try again later."

# ---------------------- API ROUTES ----------------------

@app.route("/", methods=["GET"])
def root():
    return jsonify({"message": "AI Interview Assistant API is running"})

@app.route("/start-interview", methods=["POST"])
def start_interview():
    try:
        print("START INTERVIEW REQUEST RECEIVED")
        print(f"Form data: {request.form}")
        
        if "cv_file" not in request.files:
            print("No CV file found in request")
            return jsonify({"error": "CV file is required"}), 400
            
        cv_file = request.files["cv_file"]
        job_role = request.form.get("job_role", "")
        duration = int(request.form.get("duration", 10))
        
        print(f"Job role: {job_role}, Duration: {duration}")
        
        if not cv_file.filename.endswith('.pdf'):
            return jsonify({"error": "Only PDF files are supported for CV upload"}), 400
        
        # Create a unique session ID
        session_id = str(uuid.uuid4())
        print(f"Created new session ID: {session_id}")
        
        # Save CV file
        pdf_path = os.path.join(app.config["UPLOAD_FOLDER"], f"{session_id}.pdf")
        cv_file.save(pdf_path)
        print(f"Saved CV file to {pdf_path}")
        
        # Extract text from PDF
        cv_text = extract_text_from_pdf(pdf_path)
        print(f"Extracted {len(cv_text)} characters from PDF")
        
        # Initialize session data
        session_data[session_id] = {
            "session_id": session_id,
            "cv_text": cv_text,
            "job_role": job_role,
            "start_time": time.time(),
            "end_time": time.time() + (duration * 60),
            "qa_pairs": [],
            "previous_questions": [],
            "current_question": None,
            "interview_active": True,
            "question_count": 0,
            "confidence_scores": [],
            "current_confidence": 0,
            "current_emotion": "unknown",
            "emotion_analyzer": EmotionConfidenceAnalyzer()
        }
        
        print(f"Initialized session data for {session_id}")
        print(f"Active sessions: {list(session_data.keys())}")
        
        # Generate a first question right away
        first_question = generate_ai_question(cv_text, job_role, [])
        session_data[session_id]["current_question"] = first_question
        session_data[session_id]["previous_questions"].append(first_question)
        session_data[session_id]["question_count"] += 1
        
        print(f"Generated first question: {first_question}")
        
        return jsonify({
            "session_id": session_id,
            "message": "Interview session created successfully",
            "first_question": first_question  # Include first question in response
        })
        
    except Exception as e:
        print(f"ERROR starting interview: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": f"Failed to start interview: {str(e)}"}), 500

@app.route("/check-status/<session_id>", methods=["GET"])
def check_interview_status(session_id):
    if session_id not in session_data:
        return jsonify({"active": False, "message": "No active session found"})
    
    data = session_data[session_id]
    
    # Check if interview is still active
    active = data["interview_active"] and time.time() < data["end_time"]
    
    if not active:
        return jsonify({"active": False, "message": "Interview has ended"})
    
    return jsonify({
        "active": True,
        "time_remaining": int(data["end_time"] - time.time())
    })

# Replace the @app.get("/get-question/{session_id}") route with this:

@app.route("/get-question/<session_id>", methods=["GET"])
def get_question(session_id):
    """Get the next interview question."""
    try:
        logging.info(f"GET /get-question/{session_id} called")
        
        # Verify session exists
        if session_id not in session_data:
            logging.error(f"Session {session_id} not found")
            return jsonify({"error": "Session not found"}), 404
            
        data = session_data[session_id]
        
        # Check if interview is active
        if not data.get("interview_active", False):
            return jsonify({"error": "Interview has ended"}), 400
        
        # Generate a NEW question with error handling
        try:
            cv_text = data.get("cv_text", "")
            job_role = data.get("job_role", "")
            previous_questions = data.get("previous_questions", "")
            
            # Generate the question
            question = generate_ai_question(cv_text, job_role, previous_questions)
            
            if not question:
                question = "Tell me about your key skills relevant to this position."
                logging.warning(f"Empty question generated, using fallback for session {session_id}")
        except Exception as e:
            question = "Describe a challenging situation you faced at work and how you handled it."
            logging.error(f"Error generating question: {str(e)}")
        
        # IMPORTANT: Store question state in ONE clear operation
        data["current_question"] = question
        if "previous_questions" not in data:
            data["previous_questions"] = []
        data["previous_questions"].append(question)
        data["question_count"] = len(data["previous_questions"])
        
        logging.info(f"Returning question for session {session_id}: {question[:30]}...")
        
        # Return ONLY the question
        return jsonify({"question": question})
        
    except Exception as e:
        logging.error(f"Unhandled error in get_question: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/submit-answer/<session_id>", methods=["POST"])
def submit_answer(session_id):
    """
    Record a submitted answer for the current question.
    
    This endpoint handles saving the question-answer pair in the session data,
    along with confidence and emotion information.
    """
    if session_id not in session_data:
        return jsonify({"error": "Session not found"}), 404
    
    data = session_data[session_id]
    
    if not data["interview_active"]:
        return jsonify({"error": "Interview session has ended"}), 400
    
    try:
        # Get answer from request
        request_data = request.get_json()
        if not request_data or "answer" not in request_data:
            return jsonify({"error": "No answer provided"}), 400
        
        answer = request_data["answer"]
        
        # Use the current question from session data, but fallback to the question
        # provided in the request if available (for redundancy)
        question = data["current_question"]
        if not question and "question" in request_data:
            question = request_data["question"]
            
        if not question:
            return jsonify({"error": "No question found for this answer"}), 400
        
        # Save the question and answer pair with current confidence
        qa_pair = {
            "question": question,
            "answer": answer,
            "confidence": data["current_confidence"],
            "emotion": data["current_emotion"]
        }
        
        # Add to QA pairs and confidence scores
        data["qa_pairs"].append(qa_pair)
        data["confidence_scores"].append(data["current_confidence"])
        
        logging.info(f"Answer recorded for session {session_id}: Q: {question[:30]}..., A: {answer[:30]}...")
        
        return jsonify({
            "success": True, 
            "message": "Answer recorded successfully",
            "qa_count": len(data["qa_pairs"])
        })
    except Exception as e:
        logging.error(f"Error submitting answer: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": f"Failed to submit answer: {str(e)}"}), 500

@app.route("/analyze-image/<session_id>", methods=["POST"])
def analyze_image(session_id):
    if session_id not in session_data:
        return jsonify({"error": "Session not found"}), 404
    
    data = session_data[session_id]
    
    try:
        if "file" not in request.files:
            return jsonify({"error": "No image provided"}), 400
        
        # Read image file
        img_file = request.files["file"]
        img_data = img_file.read()
        
        # Analyze the image
        emotion_analyzer = data["emotion_analyzer"]
        analysis_result = emotion_analyzer.analyze_image(img_data)
        
        # Update session with current confidence and emotion
        data["current_confidence"] = analysis_result.get("confidence", 0)
        data["current_emotion"] = analysis_result.get("emotion", "unknown")
        
        return jsonify(analysis_result)
    except Exception as e:
        logging.error(f"Error analyzing image: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": f"Failed to analyze image: {str(e)}"}), 500

@app.route("/end-interview/<session_id>", methods=["POST"])
def end_interview(session_id):
    if session_id not in session_data:
        return jsonify({"error": "Session not found"}), 404
    
    data = session_data[session_id]
    
    # End the interview
    data["interview_active"] = False
    
    return jsonify({"success": True, "message": "Interview ended successfully"})

@app.route("/get-feedback/<session_id>", methods=["GET"])
def get_feedback(session_id):
    """Get detailed feedback for a completed interview."""
    if session_id not in session_data:
        logging.error(f"Session {session_id} not found for feedback")
        return jsonify({"error": "Session not found"}), 404
    
    data = session_data[session_id]
    
    # If final feedback was already generated, return it
    if "final_feedback" in data:
        logging.info(f"Returning cached feedback for session {session_id}")
        return jsonify({"feedback": data["final_feedback"]})
    
    # Log the state of the session data before generating feedback
    logging.info(f"Generating feedback for session {session_id}")
    logging.info(f"Job role: {data.get('job_role')}")
    logging.info(f"QA pairs count: {len(data.get('qa_pairs', []))}")
    logging.info(f"Question count: {data.get('question_count', 0)}")
    logging.info(f"Confidence scores: {len(data.get('confidence_scores', []))} scores")
    
    # Generate feedback
    try:
        # Add an extra check here to ensure we have QA pairs
        if not data.get("qa_pairs") or len(data.get("qa_pairs", [])) == 0:
            logging.error(f"No QA pairs found for session {session_id}")
            return jsonify({
                "error": "No interview questions and answers were recorded. Cannot generate feedback."
            }), 400
            
        feedback = provide_feedback(data)
        data["final_feedback"] = feedback
        
        # Calculate average confidence only from non-zero values
        valid_confidence_scores = [score for score in data.get("confidence_scores", []) if score > 0]
        avg_confidence = sum(valid_confidence_scores) / len(valid_confidence_scores) if valid_confidence_scores else 0
        
        return jsonify({
            "feedback": feedback,
            "question_count": data.get("question_count", 0),
            "qa_count": len(data.get("qa_pairs", [])),
            "avg_confidence": avg_confidence
        })
    except Exception as e:
        logging.error(f"Error generating feedback: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": f"Failed to generate feedback: {str(e)}"}), 500
# ---------------------- CLEANUP FUNCTION ----------------------

@app.route("/check-qa-count/<session_id>", methods=["GET"])
def check_qa_count(session_id):
    # \"\"\"Endpoint to verify the number of QA pairs stored for an interview session.\"\"\"
    if session_id not in session_data:
        return jsonify({"error": "Session not found"}), 404
    
    data = session_data[session_id]
    
    return jsonify({
        "qa_count": len(data.get("qa_pairs", [])),
        "question_count": data.get("question_count", 0)
    })

def cleanup_expired_sessions():
    """Remove old session data periodically"""
    current_time = time.time()
    expired_sessions = []
    
    for session_id, data in session_data.items():
        if not data["interview_active"] and (current_time - data.get("end_time", 0)) > 3600:  # 1 hour
            expired_sessions.append(session_id)
            
            # Clean up uploaded file
            pdf_path = os.path.join(app.config["UPLOAD_FOLDER"], f"{session_id}.pdf")
            if os.path.exists(pdf_path):
                try:
                    os.remove(pdf_path)
                except Exception as e:
                    logging.error(f"Error deleting file {pdf_path}: {str(e)}")
    
    # Remove expired sessions
    for session_id in expired_sessions:
        del session_data[session_id]
        logging.info(f"Cleaned up expired session: {session_id}")

# Periodically cleanup expired sessions
@app.before_request
def before_request():
    # Run cleanup every 100 requests
    if random.randint(1, 100) == 1:
        cleanup_expired_sessions()

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=8000)