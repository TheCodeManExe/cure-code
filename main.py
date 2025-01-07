from flask import Flask, request, jsonify, render_template
import google.generativeai as genai # type: ignore
import os
import json

with open ('.env', 'r') as f:
    key = f.read()
genai.configure(api_key=key)

app = Flask(__name__)

conversations = {}

def start_new_chat():
    return genai.GenerativeModel("gemini-1.5-flash").start_chat(
        history=[
            {"role": "user", "parts": 'You are a medical expert named health horizon to provide diagnosis and other medical related stuff. You are made by a company named Cure Code. Answer questions with professional medical advice. You are not an AI. Also, use <br> for line breaks. But if you get other queries, feel free to answer.'},
        ]
    )

@app.route('/api/health-horizon-gemini-api', methods=['POST'])
def chat_endpoint():
    user_message = request.json.get('message')
    session_id = request.json.get('sessionId')

    if session_id not in conversations:
        conversations[session_id] = start_new_chat()

    chat = conversations[session_id]
    chat.history.append({"role": "user", "parts": user_message})

    response = chat.send_message(user_message)
    chat.history.append({"role": "model", "parts": response.text})

    return jsonify({'response': response.text})

REVIEWS_FILE_PATH = os.path.join('static', 'JSON', 'reviews.json')

def loadData(file_path: str) -> dict:
    with open(file_path, 'r') as file:
        data: dict = json.load(file)
    return data

def saveData(file_path: str, data: dict):
    with open(file_path, 'w') as file:
        json.dump(data, file, indent=2)

@app.route('/api/fetch-reviews', methods=['POST'])
def fetchReviews():
    return jsonify({'reviews': loadData(REVIEWS_FILE_PATH)["reviews"]})

@app.route('/api/save-review', methods=['POST'])
def saveReviews():
    review = request.json.get('review')
    stars = request.json.get('stars')

    data: dict = loadData(REVIEWS_FILE_PATH)
    data["reviews"].append({
        "review": review,
        "stars": stars
    })

    saveData(REVIEWS_FILE_PATH, data)
    
    return jsonify({'status': 'success'})

@app.route('/reviews')
def reviews():
    return render_template('reviews.html')

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/health-horizon')
def chatty():
    return render_template('HealthHorizonAI.html')

@app.route('/about-us')
def aboutUs():
    return render_template('AboutUs.html')

@app.route('/museum')
def museum():
    return render_template('museum.html')

@app.route('/our-vision')
def plans():
    return render_template('Our-Vision.html')

@app.route('/pathogen-protocol')
def pathogenProtocol():
    return render_template('pathogen-protocol.html')

@app.errorhandler(404)
def page_not_found(err):
    return render_template('404.html'), 404

@app.route('/museum/medical-timeline')
def timeline():
    return render_template('medicaltimeline.html')

@app.route('/museum/ayurvedic-medicine')
def ayurvedic():
    return render_template('ayurvedic.html')

@app.route('/museum/surgical-tools')
def surgical_tools():
    return render_template('surgical-tools.html')

@app.route('/case-studies')
def caseStudy():
    return render_template('case-study.html')

@app.route('/expert-talk')
def expertTalk():
    return render_template('expert-talk.html')

@app.route('/trivia')
def trivia():
    return render_template('trivia.html')

@app.route('/museum/stethoscope')
def stethoscope():
    return render_template('stethoscope.html')

@app.route('/museum/penicillin')
def penicillin():
    return render_template('penicillin.html')

@app.route('/museum/microscope')
def microscope():
    return render_template('microscope.html')

@app.route('/museum/electrocardiogram')
def ecg():
    return render_template('electrocardiogram.html')    

@app.route('/museum/diabetes')
def diabetes():
    return render_template('diabetes.html')

@app.route('/museum/mri-machine')
def mri_machine():
    return render_template('mri-machine.html')

@app.route('/museum/defibrillator')
def Defibrillator():
    return render_template('Defibrillator.html')

@app.route('/museum/anesthesia')
def anesthesia():
    return render_template('anesthesia.html')

@app.route('/museum/vaccine')
def vaccine():
    return render_template('vaccines.html')
    
@app.route('/museum/prosthetics')
def prosthetics():
    return render_template('prosthetics.html')

@app.route('/museum/genetic-engineering')
def genetic_engineering():
    return render_template('genetic-engineering.html')

@app.route('/museum/blood-transfusion')
def bloodTransfusion():
    return render_template('blood-transfusion.html')

@app.route('/museum/organ-transplantation')
def organ_transplantation():
    return render_template('organ-transplantation.html')

@app.route('/museum/crispr-cas9')
def crispr_cas9():
    return render_template('crispr-cas9.html')

@app.route('/museum/chemotherapy')
def chemotherapy():
    return render_template('chemotherapy.html')

@app.route('/museum/laparoscopy')
def laparoscopy():
    return render_template('laparoscopy.html')

@app.route('/museum/spiritual-medicine')
def spiritualMedicine():
    return render_template('spiritual-medicine.html')

@app.route('/museum/inhalers')
def inhalers():
    return render_template('inhalers.html')

@app.route('/museum/dialysis')
def dialysis():
    return render_template('dialysis.html')

@app.route('/museum/robotic-surgery')
def robotic_surgery():
    return render_template('robotic-surgery.html')

@app.route('/museum/antiseptics')
def antiseptics():
    return render_template('antiseptic.html')

@app.route('/museum/antibiotics')
def antibiotics():
    return render_template('antibiotics.html')
    
@app.route('/museum/sterilization')
def sterilization():
    return render_template('sterilization.html')

@app.route('/museum/electroencephalogram')
def eep():
    return render_template('Electroencephalogram.html')
    
@app.route('/museum/health-watches')
def healthWatches():
    return render_template('health-watches.html')

@app.route('/museum/telemedicine')
def tele():
    return render_template('tele-medicine.html')
    
@app.route('/case-study/ai-powered-management-of-diabetes')
def caseStudy1():
    return render_template('case-study1.html')

@app.route('/case-study/genetic-reprogramming-acute-myeloid-leukemia')
def caseStudy2():
    return render_template('case-study2.html')

@app.route('/case-study/telemedicine')
def caseStudy3():
    return render_template('case-study3.html')

@app.route('/case-study/ai-in-medical-imaging-for-cancer-detection')
def caseStudy4():
    return render_template('case-study4.html')

@app.route('/case-study/crispr-cas9-revolutionizing-genome-editing')
def caseStudy5():
    return render_template('case-study5.html')

@app.route('/case-study/mpox-outbreak-in-california-2022')
def caseStudy6():
    return render_template('case-study6.html')

@app.route('/expert-talk/interview-of-emily-chen-ai-researcher')
def expert1():
    return render_template('expert1.html')

@app.route('/expert-talk/interview-of-dr-james-patel-oncologist')
def expert2():
    return render_template('expert2.html')

@app.route('/expert-talk/interview-with-sarah-johnson-healthcare-technology-advocate')
def expert3():
    return render_template('expert3.html')

@app.route('/expert-talk/interview-with-dr-marcus-lee-clinical-data-scientist')
def expert4():
    return render_template('expert4.html')

@app.route('/expert-talk/interview-with-dr-laura-nguyen-ai-in-healthcare-startup-founder')
def expert5():
    return render_template('expert5.html')

@app.route('/expert-talk/interview-with-dr-ava-richards-medical-ai-ethicist')
def expert6():
    return render_template('expert6.html')

@app.route('/museum/x-rays')
def xRay():
    return render_template('x-ray.html')

@app.route('/abcdef12345')
def easter():
    return render_template('z.html')

if __name__ == "__main__":
    app.run(debug=True)