from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from features import FeatureBuilder
import json
from firebase_admin import firestore
from notifications import send_push_notification

# import firebase_admin
# from firebase_admin import credentials, firestore

# Firebase setup
# cred = credentials.Certificate("serviceAccountKey.json")
# firebase_admin.initialize_app(cred)
# db = firestore.client()
# @app.post("/recommend")
# def recommend(data: UserInput):
#     fb = 1 if data.module_feedback == "liked" else 0
#     input_data = [
#         data.active_challenges, data.daily_steps, data.water_logged,
#         data.mood_score, data.videos_watched, data.modules_completed,
#         fb, data.fastfood_visits, data.total_spending, data.heatmap_darkness
#     ]
#     prediction = model.predict(np.array(input_data))[0]
#
#     # Save to Firestore
#     doc = {
#         "active_challenges": data.active_challenges,
#         "daily_steps": data.daily_steps,
#         "water_logged": data.water_logged,
#         "mood_score": data.mood_score,
#         "videos_watched": data.videos_watched,
#         "modules_completed": data.modules_completed,
#         "module_feedback": data.module_feedback,
#         "fastfood_visits": data.fastfood_visits,
#         "total_spending": data.total_spending,
#         "heatmap_darkness": data.heatmap_darkness,
#         "recommendation": prediction
#     }
#
#     db.collection("user_data").add(doc)
#
#     return {"recommendation": prediction}

app = FastAPI()

pipeline = joblib.load("full_pipeline.joblib")
tip_encoder = joblib.load("tip_encoder.joblib")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"] for your frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InputData(BaseModel):
    fast_food_pct: float
    logins_per_week: int
    chatbot_topic: str
    water_drank: float
    daily_steps: int
    mood_score: int

@app.get("/")
def read_root():
    return {"message": "Recommendation API is running"}

print(pipeline.named_steps.keys())

with open('feature_columns.json', 'r') as f:
    feature_cols = json.load(f)

# Extract topic columns from your FeatureBuilder inside pipeline
topic_cols = pipeline.named_steps['features'].topic_cols  # adjust key to your pipeline step name

@app.post("/recommend")
def recommend(data: InputData):
    print("Received data:", data)
    try:
        # Initialize all columns with zeros
        row = dict.fromkeys(feature_cols, 0)

        # Fill numerical features
        row['fast_food_pct'] = data.fast_food_pct
        row['logins_per_week'] = data.logins_per_week
        row['water_drank'] = data.water_drank
        row['daily_steps'] = data.daily_steps
        row['mood_score'] = data.mood_score

        # Set one-hot chatbot topic column to 1
        topic_key = f"topic_{data.chatbot_topic}"
        if topic_key not in feature_cols:
            return {"error": f"Unknown topic '{data.chatbot_topic}'"}
        row[topic_key] = 1

        # Create DataFrame with exact columns and order
        X_input = pd.DataFrame([row], columns=feature_cols)

        # Run full pipeline (feature transformations + model prediction)
        prediction = pipeline.predict(X_input)

        # Decode label to tip string
        tip = tip_encoder.inverse_transform(prediction)[0]

        return {"recommendation": tip}
    
    except Exception as e:
        print("❌ ERROR:", str(e))
        return {"error": str(e)}


#STORE RECOMMENDATION IN FIRESTORE
db = firestore.client()

def store_recommendation(user_id, tip):
    doc_ref = db.collection("recommendations").document(user_id)
    doc_ref.set({
        "recommendation": tip,
        "timestamp": firestore.SERVER_TIMESTAMP
    })



# SEND PUSH NOTIFICATION
@app.post("/notify")
def notify_user(user_token: str, tip: str):
    if not user_token or not tip:
        return {"error": "User token and tip are required"}

    # Store recommendation in Firestore
    store_recommendation(user_token, tip)

    # Send push notification
    try:
        send_push_notification(
            token=user_token,
            title="Your Recommendation",
            body=f"Your recommended tip is: {tip}"
        )
        return {"status": "Notification sent successfully"}
    except Exception as e:
        print("❌ Notification error:", str(e))
        return {"error": str(e)}



# topic_cols = ['topic_academic', 'topic_addiction recovery', 'topic_anxiety', 'topic_budgeting', 'topic_career development',
#   'topic_cognitive behavioral therapy', 'topic_creativity', 'topic_emotion regulation', 'topic_fast food',
#   'topic_finance', 'topic_gratitude practice', 'topic_labor support', 'topic_love and relationships',
#   'topic_mindfulness', 'topic_physical activity', 'topic_relaxation techniques', 'topic_self-care', 'topic_sleep improvement', 'topic_stress']  # <- adjust based on your dataset
#   topic_vector = [0] * len(topic_cols)
#   topic_key = f"topic_{data.chatbot_topic}"

#   print("Topic vector before encoding:", topic_vector)

#   if topic_key in topic_cols:
#       topic_vector[topic_cols.index(topic_key)] = 1
#   else:
#       return {"error": f"Unknown topic '{data.chatbot_topic}'"}

#   print("Topic vector after encoding:", topic_vector)

#   # Full feature vector
#   features = np.array([[data.fast_food_pct, data.logins_per_week, data.mood_score, data.daily_steps, data.water_drank] + topic_vector])
#   prediction = model.predict(features)

#   print("Raw prediction:", prediction)
#   tip = tip_encoder.inverse_transform(prediction)[0]

#   print("Final recommendation:", tip)

#   return {"recommendation": tip}




