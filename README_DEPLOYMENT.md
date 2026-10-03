# MindScore — Free Deployment Guide

This version is prepared to deploy the complete MindScore application as **one FastAPI web service** on Render:

```text
Browser
  │
  ▼
Render Web Service
  ├── FastAPI backend
  │     └── /predict → scikit-learn pipeline → Mind Score
  └── Static frontend
        ├── HTML
        ├── CSS
        └── JavaScript
```

## Why one service?

The original frontend used `http://127.0.0.1:8000`, which only exists on the developer's own computer. The deployment version uses a same-origin relative API URL, so the public website automatically talks to the public `/predict` endpoint.

## Render settings

The included `render.yaml` already defines:

- Runtime: Python
- Plan: Free
- Build: `pip install -r requirements.txt`
- Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Health check: `/health`
- Python: `3.12.2`

### Dashboard method

1. Push the contents of this folder to a GitHub repository.
2. In Render, choose **New → Web Service**.
3. Connect the GitHub repository.
4. Choose the **Free** plan.
5. Render should detect the Python service. Use the build/start commands above if it asks.
6. Deploy.
7. Open your Render URL. The MindScore frontend should load at `/`.
8. Check `https://YOUR-SERVICE.onrender.com/health` — it should return JSON with `"status": "healthy"` and `"model_loaded": true`.
9. Check `https://YOUR-SERVICE.onrender.com/docs` to verify the FastAPI API documentation.

## API test payload

Use this JSON with `POST /predict`:

```json
{
  "Age": 21,
  "Gender": "Male",
  "Country": "India",
  "Academic_Level": "Undergraduate",
  "Most_Used_Platform": "Instagram",
  "Purpose_Of_Use": "Education",
  "Avg_Daily_Usage_Hours": 4.0,
  "Daily_Unlocks": 100,
  "Study_Hours": 5.0,
  "Physical_Activity_Hours": 1.5,
  "Sleep_Hours_Per_Night": 7.0,
  "Stress_Level": "Medium"
}
```

The response should contain a numeric `Mind_Score`.

## Important free-tier behavior

Render Free web services can spin down after 15 minutes without inbound traffic. The next request can take around a minute while the service starts again. The filesystem is ephemeral, so the model must remain part of the repository rather than being downloaded or generated at runtime.

## Security note

`Mind_Score_Model.pkl` is a trusted project artifact. Do not replace it with an untrusted pickle/joblib file. For a public production service, consider a safer model serialization format such as ONNX or `skops` and add request rate limiting/logging.
