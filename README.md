# 🧠 MindScore

### ML-Powered Wellbeing Score Prediction System

MindScore is a machine learning-powered web application that estimates a user's wellbeing score based on information provided through an interactive assessment.

The project combines a trained machine learning model, a FastAPI backend, and a responsive frontend to provide an end-to-end ML application experience.

---

## ✨ Features

- 🧠 Machine learning-based wellbeing score prediction
- 📝 Interactive mental wellbeing assessment
- ⚡ FastAPI REST API for model inference
- 🎨 Responsive and modern web interface
- 📊 Personalized score results
- 🔄 Frontend-to-backend API integration
- 📓 Jupyter Notebook containing the ML development process

---

## 🏗️ Project Architecture

```text
User 
  │
  ▼
Frontend
HTML + CSS + JavaScript
  │
  │ HTTP POST /predict
  ▼
FastAPI Backend
  │
  ▼
Trained ML Model
Mind_Score_Model.pkl
  │
  ▼
Predicted Wellbeing Score
  │
  ▼
Results Page

## 🛠️ Tech Stack
Machine Learning
Python
Pandas
NumPy
Scikit-learn
Jupyter Notebook
Backend
FastAPI
Uvicorn
Pydantic
Frontend
HTML5
CSS3
JavaScript
Development
Git
GitHub
VS Code

📂 Project Structure
MindScore/
│
├── frontend/
│   ├── js/
│   │   ├── api.js
│   │   ├── app.js
│   │   ├── assessment.js
│   │   └── results.js
│   │
│   ├── index.html
│   └── style.css
│
├── DatasetForMindscore.csv
├── MindScore.ipynb
├── Mind_Score_Model.pkl
├── main.py
├── README.md
└── .gitignore

🚀 Getting Started
1. Clone the repository
git clone https://github.com/Ankit3/MindScore.git
cd MindScore

2. Create a virtual environment
python -m venv .venv

3. Activate the virtual environment
.venv\Scripts\activate

4. Install dependencies
pip install fastapi uvicorn pandas numpy scikit-learn joblib

5. Start the FastAPI server
uvicorn main:app --reload

The API will be available at:
http://127.0.0.1:8000

FastAPI's interactive API documentation can be accessed at:
http://127.0.0.1:8000/docs

6. Run the frontend
Open the frontend/index.html file using a local development server such as VS Code Live Server.

🔌 API
POST /predict
The frontend sends assessment data to the FastAPI backend through the /predict endpoint.
The backend processes the submitted features using the trained machine learning model and returns the predicted wellbeing score.

🧪 Machine Learning

The machine learning workflow is documented in:
MindScore.ipynb

The trained model is stored as:
Mind_Score_Model.pkl

The dataset used for development is:
DatasetForMindscore.csv

⚠️ Disclaimer

MindScore is an educational and experimental machine learning project.

The generated score is an estimate based on the information provided and is not a medical diagnosis or a substitute for professional mental health advice.

If you are experiencing serious mental health concerns, consider contacting a qualified mental health professional or appropriate emergency services.

👨‍💻 Author
R. Ankit
GitHub: @Ankit3

📄 License
This project is intended for educational and portfolio purposes.