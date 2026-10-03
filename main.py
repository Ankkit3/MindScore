from pathlib import Path
from typing import Literal
import os

import joblib
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, ConfigDict, Field


BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "Mind_Score_Model.pkl"
FRONTEND_DIR = BASE_DIR / "frontend"

# Load the trusted, repository-local model artifact once at startup.
model = joblib.load(MODEL_PATH)

TOP_COUNTRIES = [
    "India",
    "USA",
    "Canada",
    "Australia",
    "UK",
    "Germany",
    "Mexico",
    "Turkey",
    "France",
]

app = FastAPI(
    title="MindScore API",
    description="ML-powered mental wellbeing score prediction API",
    version="1.0.0",
)

# Same-origin deployment does not require CORS, but keeping localhost origins
# makes the project convenient to develop with VS Code Live Server as well.
allowed_origins = [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://127.0.0.1:8000",
    "http://localhost:8000",
]
extra_origin = os.getenv("FRONTEND_ORIGIN", "").strip()
if extra_origin:
    allowed_origins.append(extra_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class StudentData(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    age: int = Field(..., alias="Age", ge=10, le=100)
    gender: Literal["Male", "Female"] = Field(..., alias="Gender")
    country: str = Field(..., alias="Country")
    academic_level: Literal[
        "Undergraduate", "Graduate", "High School"
    ] = Field(..., alias="Academic_Level")
    most_used_platform: Literal[
        "Facebook",
        "LinkedIn",
        "Instagram",
        "Snapchat",
        "Twitter",
        "YouTube",
        "TikTok",
        "LINE",
        "KakaoTalk",
        "VKontakte",
        "WhatsApp",
        "WeChat",
    ] = Field(..., alias="Most_Used_Platform")
    purpose_of_use: Literal[
        "Networking", "Education", "Entertainment", "News"
    ] = Field(..., alias="Purpose_Of_Use")
    avg_daily_usage_hours: float = Field(
        ..., alias="Avg_Daily_Usage_Hours", ge=0, le=24
    )
    daily_unlocks: int = Field(..., alias="Daily_Unlocks", ge=0)
    study_hours: float = Field(..., alias="Study_Hours", ge=0, le=24)
    physical_activity_hours: float = Field(
        ..., alias="Physical_Activity_Hours", ge=0, le=24
    )
    sleep_hours_per_night: float = Field(
        ..., alias="Sleep_Hours_Per_Night", ge=0, le=24
    )
    stress_level: Literal["Low", "Medium", "High", "Very High"] = Field(
        ..., alias="Stress_Level"
    )


class PredictionResponse(BaseModel):
    Mind_Score: float


def group_country(country: str) -> str:
    return country if country in TOP_COUNTRIES else "Other"


@app.get("/health")
def health_check():
    return {"status": "healthy", "model_loaded": model is not None}


@app.post("/predict", response_model=PredictionResponse)
def predict(data: StudentData):
    # Keep these feature names/order aligned with the trained preprocessing
    # pipeline stored inside Mind_Score_Model.pkl.
    input_row = pd.DataFrame(
        [
            {
                "Study_Hours": data.study_hours,
                "Age": data.age,
                "Avg_Daily_Usage_Hours": data.avg_daily_usage_hours,
                "Daily_Unlocks": data.daily_unlocks,
                "Physical_Activity_Hours": data.physical_activity_hours,
                "Sleep_Hours_Per_Night": data.sleep_hours_per_night,
                "Stress_Level": data.stress_level,
                "Gender": data.gender,
                "Academic_Level": data.academic_level,
                "Most_Used_Platform": data.most_used_platform,
                "Purpose_Of_Use": data.purpose_of_use,
                "Grouped_country": group_country(data.country),
            }
        ]
    )

    prediction = model.predict(input_row)[0]
    return PredictionResponse(Mind_Score=round(float(prediction), 2))


# Serve the HTML/CSS/JS frontend from the same FastAPI service. This avoids
# a production localhost URL and makes the public site and API same-origin.
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
