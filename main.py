import joblib
import pandas as pd

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ConfigDict
from typing import Literal



model = joblib.load("Mind_Score_Model.pkl")



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
    description="ML-powered mental health score prediction API",
    version="1.0.0",
)



app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1:8000",
        "http://localhost:8000",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)




class StudentData(BaseModel):

    
    model_config = ConfigDict(populate_by_name=True)

    age: int = Field(
        ...,
        alias="Age",
        ge=10,
        le=100
    )

    gender: Literal["Male", "Female"] = Field(
        ...,
        alias="Gender"
    )

    country: str = Field(
        ...,
        alias="Country"
    )

    academic_level: Literal[
        "Undergraduate",
        "Graduate",
        "High School"
    ] = Field(
        ...,
        alias="Academic_Level"
    )

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
        "WeChat"
    ] = Field(
        ...,
        alias="Most_Used_Platform"
    )

    purpose_of_use: Literal[
        "Networking",
        "Education",
        "Entertainment",
        "News"
    ] = Field(
        ...,
        alias="Purpose_Of_Use"
    )

    avg_daily_usage_hours: float = Field(
        ...,
        alias="Avg_Daily_Usage_Hours",
        ge=0,
        le=24
    )

    daily_unlocks: int = Field(
        ...,
        alias="Daily_Unlocks",
        ge=0
    )

    study_hours: float = Field(
        ...,
        alias="Study_Hours",
        ge=0,
        le=24
    )

    physical_activity_hours: float = Field(
        ...,
        alias="Physical_Activity_Hours",
        ge=0,
        le=24
    )

    sleep_hours_per_night: float = Field(
        ...,
        alias="Sleep_Hours_Per_Night",
        ge=0,
        le=24
    )

    stress_level: Literal[
        "Low",
        "Medium",
        "High",
        "Very High"
    ] = Field(
        ...,
        alias="Stress_Level"
    )


# ============================================================
# Response schema
# ============================================================

class PredictionResponse(BaseModel):
    Mind_Score: float


# ============================================================
# Helper: group countries
# ============================================================

def group_country(country: str) -> str:
    if country in TOP_COUNTRIES:
        return country

    return "Other"


# ============================================================
# Root endpoint
# ============================================================

@app.get("/")
def greet():
    return {
        "message": "Welcome to the MindScore API!",
        "status": "running"
    }




@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None
    }




@app.post(
    "/predict",
    response_model=PredictionResponse
)
def predict(data: StudentData):

    # Convert user's country into the category
    # expected by the trained model.
    country_group = group_country(data.country)

    # IMPORTANT:
    # These are the exact features expected by
    # the trained preprocessing pipeline.
    input_row = pd.DataFrame([{

        "Study_Hours": data.study_hours,

        "Age": data.age,

        "Avg_Daily_Usage_Hours":
            data.avg_daily_usage_hours,

        "Daily_Unlocks":
            data.daily_unlocks,

        "Physical_Activity_Hours":
            data.physical_activity_hours,

        "Sleep_Hours_Per_Night":
            data.sleep_hours_per_night,

        "Stress_Level":
            data.stress_level,

        "Gender":
            data.gender,

        "Academic_Level":
            data.academic_level,

        "Most_Used_Platform":
            data.most_used_platform,

        "Purpose_Of_Use":
            data.purpose_of_use,

        "Grouped_country":
            country_group
    }])

    
    prediction = model.predict(input_row)[0]

    
    return PredictionResponse(
        Mind_Score=round(float(prediction), 2)
    )