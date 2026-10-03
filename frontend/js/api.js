const API_BASE_URL = window.MINDSCORE_API_URL || "";


const DEMO_MODE = false;

const SCORE_MIN = 3.6;
const SCORE_MAX = 9.4;


function buildPredictionPayload(formData) {
  return {
    Age: Number(formData.age),
    Gender: formData.gender,
    Country: formData.country,
    Academic_Level: formData.academicLevel,
    Most_Used_Platform: formData.platform,
    Purpose_Of_Use: formData.purpose,
    Avg_Daily_Usage_Hours: Number(formData.dailyUsageHours),
    Daily_Unlocks: Number(formData.dailyUnlocks),
    Study_Hours: Number(formData.studyHours),
    Physical_Activity_Hours: Number(formData.activityHours),
    Sleep_Hours_Per_Night: Number(formData.sleepHours),
    Stress_Level: formData.stressLevel
  };
}


function generateMockScore(formData) {
  let score = 6.5;
  const stressPenalty = { "Low": 0.6, "Medium": 0, "High": -0.9, "Very High": -1.6 };
  score += stressPenalty[formData.stressLevel] ?? 0;
  score += (Number(formData.sleepHours) - 7) * 0.12;
  score += (Number(formData.activityHours)) * 0.08;
  score -= Math.max(0, Number(formData.dailyUsageHours) - 4) * 0.07;
  score += (Math.random() - 0.5) * 0.6;
  score = Math.min(SCORE_MAX, Math.max(SCORE_MIN, score));
  return Math.round(score * 100) / 100;
}


class ApiError extends Error {
  constructor(message, kind) {
    super(message);
    this.kind = kind; 
  }
}

const ERROR_MESSAGES = {
  offline: "Unable to connect to MindScore. Please check your internet connection and try again.",
  validation: "Some of the information could not be processed. Please review your answers.",
  server: "Something went wrong while calculating your score. Please try again.",
  network: "A network error occurred. Please check your connection and try again."
};


async function fetchPrediction(formData) {
  if (DEMO_MODE) {
    
    await new Promise((res) => setTimeout(res, 900));
    return { score: generateMockScore(formData), demo: true };
  }

  const payload = buildPredictionPayload(formData);
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (err) {
   
    throw new ApiError(ERROR_MESSAGES.offline, "offline");
  }

  if (response.status === 422) {
    throw new ApiError(ERROR_MESSAGES.validation, "validation");
  }
  if (response.status >= 500) {
    throw new ApiError(ERROR_MESSAGES.server, "server");
  }
  if (!response.ok) {
    const errorText = await response.text();
    console.error("API ERROR:", response.status, errorText);
    throw new ApiError(
        `API Error ${response.status}: ${errorText}`,
        "network"
    );
}

  let data;
  try {
    data = await response.json();
  } catch (err) {
    throw new ApiError(ERROR_MESSAGES.server, "server");
  }

  const score = Number(data.Mind_Score);
  if (Number.isNaN(score)) {
    throw new ApiError(ERROR_MESSAGES.server, "server");
  }

  return { score, demo: false };
}
