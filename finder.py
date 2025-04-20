# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import pandas as pd
# import joblib
# import google.generativeai as genai
# import fitz  # PyMuPDF
# import logging
# import random
# import io

# app = Flask(__name__)
# CORS(app)  # Allow all origins

# # Configure Gemini
# genai.configure(api_key="AIzaSyAawLgGFzUC9ToCiQC752pQVdEQKfUhhns")
# genai_model = genai.GenerativeModel("gemini-1.5-flash")

# # Load ML model
# model = joblib.load('salary_model_final.pkl')

# # Data mappings
# gender_mapping = {'Male': 0, 'Female': 1, 'Other': 2}
# education_mapping = {
#     "High School": 0,
#     "Bachelor's Degree": 1,
#     "Master's Degree": 2,
#     'PhD Degree': 3
# }
# job_category_mapping = {
#     'Software Engineer': 0,
#     'Data Scientist': 1,
#     'Web Developer': 2,
#     'Product Manager': 3,
#     'IT Support': 4,
#     'UX/UI Designer': 5,
#     'Project Manager': 6,
#     'Marketing Tech': 7,
#     'Security/Infra Manager': 8,
#     'CTO/Director': 9
# }

# industry_data = {
#     'Software Engineer': {'low': 0.85, 'avg': 1.0, 'high': 1.25, 'variance': 0.05},
#     'Data Scientist': {'low': 0.88, 'avg': 1.0, 'high': 1.30, 'variance': 0.07},
#     'Web Developer': {'low': 0.82, 'avg': 1.0, 'high': 1.20, 'variance': 0.04},
#     'Product Manager': {'low': 0.87, 'avg': 1.0, 'high': 1.28, 'variance': 0.06},
#     'IT Support': {'low': 0.90, 'avg': 1.0, 'high': 1.15, 'variance': 0.03},
#     'UX/UI Designer': {'low': 0.85, 'avg': 1.0, 'high': 1.22, 'variance': 0.05},
#     'Project Manager': {'low': 0.88, 'avg': 1.0, 'high': 1.24, 'variance': 0.05},
#     'Marketing Tech': {'low': 0.84, 'avg': 1.0, 'high': 1.18, 'variance': 0.04},
#     'Security/Infra Manager': {'low': 0.86, 'avg': 1.0, 'high': 1.32, 'variance': 0.08},
#     'CTO/Director': {'low': 0.80, 'avg': 1.0, 'high': 1.40, 'variance': 0.10}
# }

# def get_gemini_tip(gender, education, experience, job_role, predicted_salary, personality=None):
#     prompt = f"""
#     As an expert salary negotiation coach with deep expertise in behavioral psychology and {job_role} compensation trends:

#     CANDIDATE PROFILE:
#     • Gender: {gender}
#     • Education: {education}
#     • Experience: {experience} years
#     • Role: {job_role}
#     • Predicted Salary: ₹{predicted_salary:,}
#     • Personality: {personality if personality else "Not specified"}

#     Provide 3 highly tactical, personalized negotiation strategies that this specific candidate can immediately apply.
    
#     Each strategy must:
#     1. Include exact phrasing or script the candidate can use
#     2. Address likely objections specific to their profile
#     3. Consider gender/experience dynamics in {job_role} negotiations
    
#     Focus exclusively on high-impact tactics that leverage this candidate's specific strengths.
#     NO general advice. NO unnecessary explanations. NO bullet points or markdown formatting.
#     """
#     try:
#         response = genai_model.generate_content(prompt)
#         return [tip.strip('-*• ').strip() for tip in response.text.strip().split('\n') if tip.strip()]
#     except Exception as e:
#         logging.error(f"Gemini API error: {str(e)}")
#         return ["Could not generate personalized tips at this time."]

# def analyze_resume(resume_text, job_role, predicted_salary):
#     prompt = f"""
#     You're an elite compensation consultant who specializes in {job_role} roles.

#     TASK: Extract 3 powerful salary negotiation leverage points from this resume for a {job_role} targeting ₹{predicted_salary:,}.

#     RESUME:
#     {resume_text[:3500]}
    
#     For each point:
#     1. Identify a SPECIFIC achievement, credential, or skill that objectively justifies higher compensation
#     2. Explain precisely how to monetize this advantage in negotiation
#     3. Quantify the potential salary impact where possible
    
#     Focus ONLY on evidence-based points from this specific resume.
#     Prioritize unique, differentiated value that hiring managers would recognize.
#     NO generic advice. NO platitudes. NO markdown formatting.
#     """
#     try:
#         response = genai_model.generate_content(prompt)
#         return [p.strip('-*• ').strip() for p in response.text.strip().split('\n') if p.strip()]
#     except Exception as e:
#         logging.error(f"Resume analysis error: {str(e)}")
#         return ["Could not analyze resume at this time."]

# def get_industry_comparison(job_role, predicted_salary):
#     metrics = industry_data.get(job_role)
#     if not metrics:
#         return {
#             'min': round(predicted_salary * 0.85, 2),
#             'low': round(predicted_salary * 0.90, 2),
#             'avg': round(predicted_salary, 2),
#             'high': round(predicted_salary * 1.15, 2),
#             'max': round(predicted_salary * 1.25, 2)
#         }
#     variance = metrics['variance']
#     low = metrics['low'] + random.uniform(-variance, variance)
#     avg = metrics['avg'] + random.uniform(-variance/2, variance/2)
#     high = metrics['high'] + random.uniform(-variance, variance)
#     return {
#         'min': round(predicted_salary * (low - 0.05), 2),
#         'low': round(predicted_salary * low, 2),
#         'avg': round(predicted_salary * avg, 2),
#         'high': round(predicted_salary * high, 2),
#         'max': round(predicted_salary * (high + 0.1), 2)
#     }

# @app.route('/predict', methods=['POST'])
# def predict():
#     try:
#         gender = request.form['gender']
#         education = request.form['education']
#         experience = float(request.form['experience'])
#         job_category = request.form['job_category']
#         personality = request.form.get('personality', None)
#         resume = request.files.get('resume')

#         if not resume or not resume.filename.endswith('.pdf'):
#             return jsonify({"error": "Invalid or missing resume file"}), 400

#         input_data = pd.DataFrame([{
#             'Gender': gender_mapping.get(gender, 0),
#             'Education Level': education_mapping.get(education, 0),
#             'Years of Experience': experience,
#             'Job Category': job_category_mapping.get(job_category, 0)
#         }])

#         #Train ML model for Salary Prediction
#         predicted_salary = float(model.predict(input_data)[0])
#         #get realistic industry comparison data
#         industry_comp = get_industry_comparison(job_category, predicted_salary)
#         negotiation_tips = get_gemini_tip(gender, education, experience, job_category, predicted_salary, personality)

#         resume_text = ""
#         try:
#             pdf_stream = resume.read()
#             doc = fitz.open(stream=pdf_stream, filetype="pdf")
#             for page in doc:
#                 resume_text += page.get_text()
#             doc.close()
#         except Exception as e:
#             logging.error(f"Resume parsing failed: {str(e)}")
#             return jsonify({"error": "Resume processing error"}), 500

#         resume_tips = analyze_resume(resume_text, job_category, predicted_salary)

#         return jsonify({
#             "predicted_salary": round(predicted_salary, 2),
#             "industry_comparison": industry_comp,
#             "negotiation_tips": negotiation_tips,
#             "resume_tips": resume_tips
#         })

#     except Exception as e:
#         logging.error(f"Prediction error: {str(e)}")
#         return jsonify({"error": "Server error", "details": str(e)}), 500

# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=8000)


from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import joblib
import google.generativeai as genai
import fitz  # PyMuPDF
import logging
import random
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

app = Flask(__name__)
CORS(app)  # Allow all origins

# Configure Gemini
genai.configure(api_key="AIzaSyBOgM2OWtNaTvZ6aHbCoF9_kHCR_CLRgNk")
genai_model = genai.GenerativeModel("gemini-1.5-flash")

# Load ML model
model = joblib.load('salary_model_final.pkl')

# Data mappings
gender_mapping = {'Male': 0, 'Female': 1, 'Other': 2}
education_mapping = {
    "High School": 0,
    "Bachelor's Degree": 1,
    "Master's Degree": 2,
    'PhD Degree': 3
}
job_category_mapping = {
    'Software Engineer': 0,
    'Data Scientist': 1,
    'Web Developer': 2,
    'Product Manager': 3,
    'IT Support': 4,
    'UX/UI Designer': 5,
    'Project Manager': 6,
    'Marketing Tech': 7,
    'Security/Infra Manager': 8,
    'CTO/Director': 9
}

industry_data = {
    'Software Engineer': {'low': 0.85, 'avg': 1.0, 'high': 1.25, 'variance': 0.05},
    'Data Scientist': {'low': 0.88, 'avg': 1.0, 'high': 1.30, 'variance': 0.07},
    'Web Developer': {'low': 0.82, 'avg': 1.0, 'high': 1.20, 'variance': 0.04},
    'Product Manager': {'low': 0.87, 'avg': 1.0, 'high': 1.28, 'variance': 0.06},
    'IT Support': {'low': 0.90, 'avg': 1.0, 'high': 1.15, 'variance': 0.03},
    'UX/UI Designer': {'low': 0.85, 'avg': 1.0, 'high': 1.22, 'variance': 0.05},
    'Project Manager': {'low': 0.88, 'avg': 1.0, 'high': 1.24, 'variance': 0.05},
    'Marketing Tech': {'low': 0.84, 'avg': 1.0, 'high': 1.18, 'variance': 0.04},
    'Security/Infra Manager': {'low': 0.86, 'avg': 1.0, 'high': 1.32, 'variance': 0.08},
    'CTO/Director': {'low': 0.80, 'avg': 1.0, 'high': 1.40, 'variance': 0.10}
}

def get_gemini_tip(gender, education, experience, job_role, predicted_salary, personality=None):
    prompt = f"""
    As an expert salary negotiation coach with deep expertise in behavioral psychology and {job_role} compensation trends:

    CANDIDATE PROFILE:
    • Gender: {gender}
    • Education: {education}
    • Experience: {experience} years
    • Role: {job_role}
    • Predicted Salary: ₹{predicted_salary:,}
    • Personality: {personality if personality else "Not specified"}

    Provide 3 highly tactical, personalized negotiation strategies that this specific candidate can immediately apply.
    
    Each strategy must:
    1. Include exact phrasing or script the candidate can use
    2. Address likely objections specific to their profile
    3. Consider gender/experience dynamics in {job_role} negotiations
    
    Focus exclusively on high-impact tactics that leverage this candidate's specific strengths.
    NO general advice. NO unnecessary explanations. NO bullet points or markdown formatting.
    """
    try:
        response = genai_model.generate_content(prompt)
        return [tip.strip('-*• ').strip() for tip in response.text.strip().split('\n') if tip.strip()]
    except Exception as e:
        logging.error(f"Gemini API error: {str(e)}")
        return ["Could not generate personalized tips at this time."]

def analyze_resume(resume_text, job_role, predicted_salary):
    prompt = f"""
    You're an elite compensation consultant who specializes in {job_role} roles.

    TASK: Extract 3 powerful salary negotiation leverage points from this resume for a {job_role} targeting ₹{predicted_salary:,}.

    RESUME:
    {resume_text[:3500]}
    
    For each point:
    1. Identify a SPECIFIC achievement, credential, or skill that objectively justifies higher compensation
    2. Explain precisely how to monetize this advantage in negotiation
    3. Quantify the potential salary impact where possible
    
    Focus ONLY on evidence-based points from this specific resume.
    Prioritize unique, differentiated value that hiring managers would recognize.
    NO generic advice. NO platitudes. NO markdown formatting.
    """
    try:
        response = genai_model.generate_content(prompt)
        return [p.strip('-*• ').strip() for p in response.text.strip().split('\n') if p.strip()]
    except Exception as e:
        logging.error(f"Resume analysis error: {str(e)}")
        return ["Could not analyze resume at this time."]

def get_industry_comparison(job_role, predicted_salary):
    metrics = industry_data.get(job_role)
    if not metrics:
        return {
            'min': round(predicted_salary * 0.85, 2),
            'low': round(predicted_salary * 0.90, 2),
            'avg': round(predicted_salary, 2),
            'high': round(predicted_salary * 1.15, 2),
            'max': round(predicted_salary * 1.25, 2)
        }
    variance = metrics['variance']
    low = metrics['low'] + random.uniform(-variance, variance)
    avg = metrics['avg'] + random.uniform(-variance/2, variance/2)
    high = metrics['high'] + random.uniform(-variance, variance)
    return {
        'min': round(predicted_salary * (low - 0.05), 2),
        'low': round(predicted_salary * low, 2),
        'avg': round(predicted_salary * avg, 2),
        'high': round(predicted_salary * high, 2),
        'max': round(predicted_salary * (high + 0.1), 2)
    }

def generate_pdf_report(data):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'Title',
        parent=styles['Heading1'],
        fontSize=18,
        alignment=1,
        spaceAfter=20,
        textColor=colors.darkblue
    )
    
    # Content
    content = []
    
    # Title
    content.append(Paragraph("AI Salary Prediction Report", title_style))
    
    # Predicted Salary
    content.append(Paragraph(
        f"<b>Predicted Salary:</b> ₹{data['predicted_salary']:,.2f}",
        styles['Normal']
    ))
    
    # Industry Comparison Table
    industry_data = [
        ['Metric', 'Amount (₹)'],
        ['Industry Minimum', f"{data['industry_comparison']['min']:,.2f}"],
        ['Industry Low', f"{data['industry_comparison']['low']:,.2f}"],
        ['Industry Average', f"{data['industry_comparison']['avg']:,.2f}"],
        ['Industry High', f"{data['industry_comparison']['high']:,.2f}"],
        ['Industry Maximum', f"{data['industry_comparison']['max']:,.2f}"]
    ]
    
    industry_table = Table(industry_data)
    industry_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    content.append(Spacer(1, 12))
    content.append(Paragraph("<b>Industry Comparison</b>", styles['Heading2']))
    content.append(industry_table)
    
    # Negotiation Tips
    content.append(Spacer(1, 24))
    content.append(Paragraph("<b>Negotiation Strategies</b>", styles['Heading2']))
    for tip in data['negotiation_tips']:
        content.append(Paragraph(f"• {tip}", styles['Normal']))
        content.append(Spacer(1, 6))
    
    # Resume Tips
    content.append(Spacer(1, 24))
    content.append(Paragraph("<b>Resume-Based Leverage Points</b>", styles['Heading2']))
    for tip in data['resume_tips']:
        content.append(Paragraph(f"• {tip}", styles['Normal']))
        content.append(Spacer(1, 6))
    
    doc.build(content)
    buffer.seek(0)
    return buffer

@app.route('/predict', methods=['POST'])
def predict():
    try:
        gender = request.form['gender']
        education = request.form['education']
        experience = float(request.form['experience'])
        job_category = request.form['job_category']
        personality = request.form.get('personality', None)
        resume = request.files.get('resume')

        if not resume or not resume.filename.endswith('.pdf'):
            return jsonify({"error": "Invalid or missing resume file"}), 400

        input_data = pd.DataFrame([{
            'Gender': gender_mapping.get(gender, 0),
            'Education Level': education_mapping.get(education, 0),
            'Years of Experience': experience,
            'Job Category': job_category_mapping.get(job_category, 0)
        }])

        predicted_salary = float(model.predict(input_data)[0])
        industry_comp = get_industry_comparison(job_category, predicted_salary)
        negotiation_tips = get_gemini_tip(gender, education, experience, job_category, predicted_salary, personality)

        resume_text = ""
        try:
            pdf_stream = resume.read()
            doc = fitz.open(stream=pdf_stream, filetype="pdf")
            for page in doc:
                resume_text += page.get_text()
            doc.close()
        except Exception as e:
            logging.error(f"Resume parsing failed: {str(e)}")
            return jsonify({"error": "Resume processing error"}), 500

        resume_tips = analyze_resume(resume_text, job_category, predicted_salary)

        return jsonify({
            "predicted_salary": round(predicted_salary, 2),
            "industry_comparison": industry_comp,
            "negotiation_tips": negotiation_tips,
            "resume_tips": resume_tips
        })

    except Exception as e:
        logging.error(f"Prediction error: {str(e)}")
        return jsonify({"error": "Server error", "details": str(e)}), 500

@app.route('/generate-pdf', methods=['POST'])
def pdf_endpoint():
    try:
        data = request.json
        pdf_buffer = generate_pdf_report(data)
        return send_file(
            pdf_buffer,
            as_attachment=True,
            download_name="salary_prediction_report.pdf",
            mimetype="application/pdf"
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)