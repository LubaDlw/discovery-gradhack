from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from features import FeatureBuilder
import json
#from firebase_admin import firestore
#from notifications import send_push_notification

TIP_SENTENCES = {
    "meal prep": "Try preparing your meals in advance to save time and eat healthier.",
    "savings account": "Open a savings account to manage your finances more effectively.",
    "counseling": "Consider counseling sessions to help manage anxiety and stress.",
    "study group": "Join a study group to improve your academic performance.",
    "mental health check-in": "Schedule regular mental health check-ins to maintain your wellbeing.",
    "meal planning": "Plan your meals ahead to avoid fast food and eat balanced diets.",
    "budgeting app": "Use a budgeting app to keep track of your expenses and savings.",
    "mindfulness": "Practice mindfulness techniques to reduce anxiety and improve focus.",
    "time management course": "Take a time management course to better organize your tasks.",
    "walks or outdoor breaks": "Take walks or outdoor breaks to reduce stress and improve mood.",
    "open a student savings account": "Open a student savings account to build financial habits early.",
    "academic advisor consultation": "Consult with an academic advisor to plan your education path.",
    "healthy eating course": "Enroll in a healthy eating course to learn nutritious meal choices.",
    "peer support group": "Join a peer support group to share experiences and gain encouragement.",
    "investment webinar": "Attend an investment webinar to learn about growing your finances.",
    "library resources": "Utilize library resources to support your academic studies.",
    "relaxation techniques": "Practice relaxation techniques like deep breathing or meditation daily.",
    "cost-cutting tips": "Apply cost-cutting tips to manage your budget more effectively.",
    "healthy alternatives": "Choose healthy food alternatives to improve your diet.",
    "coping strategies": "Learn coping strategies to manage anxiety symptoms better.",
    "retirement planning": "Start retirement planning early to secure your financial future.",
    "peer tutoring": "Engage in peer tutoring to strengthen your understanding of subjects.",
    "yoga sessions": "Participate in yoga sessions to improve physical and mental health.",
    "bill reminders": "Set bill reminders to avoid late payments and extra fees.",
    "nutrition facts education": "Educate yourself on nutrition facts to make better food choices.",
    "journaling": "Keep a journal to help express and manage your emotions.",
    "credit score tips": "Follow credit score tips to improve your financial reliability.",
    "exam preparation": "Prepare thoroughly for exams to boost your academic success.",
    "mindful breathing": "Practice mindful breathing exercises to calm your mind.",
    "expense tracking app": "Use an expense tracking app to monitor your spending habits.",
    "meal substitutions": "Make healthy meal substitutions to maintain a balanced diet.",
    "support groups": "Join support groups to connect with others facing similar challenges.",
    "savings challenge": "Participate in savings challenges to build your saving discipline.",
    "study schedule": "Create and follow a study schedule for consistent academic progress.",
    "meditation": "Incorporate meditation into your routine to reduce stress and enhance focus.",
    "budget app": "Use a budget app to organize your finances efficiently.",
    "healthy eating": "Adopt healthy eating habits for better physical and mental health.",
    "loan advice": "Seek loan advice to make informed borrowing decisions.",
    "sleep hygiene": "Maintain good sleep hygiene to improve your overall health.",
    "debt management": "Implement debt management strategies to reduce financial stress.",
    "saving tips": "Use saving tips to grow your financial reserves steadily.",
    "peer support": "Engage with peer support for anxiety relief and motivation.",
    "investment advice": "Consult with experts for reliable investment advice.",
    "yoga": "Practice yoga regularly to enhance your physical and mental wellbeing.",
    "financial planning": "Create a financial plan to manage your money wisely.",
    "nutrition education": "Educate yourself about nutrition to make healthier food choices.",
    "credit tips": "Follow credit tips to maintain a strong credit profile.",
    "exercise reminders": "Set daily exercise reminders to stay active and healthy.",
    "art therapy sessions": "Try art therapy sessions to express creativity and relieve stress.",
    "visualization exercises": "Use visualization exercises to promote relaxation and focus.",
    "craving management strategies": "Apply craving management strategies to support addiction recovery.",
    "joining support groups": "Join support groups for shared experiences and advice."
}


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
    mood_score: int        # Move this up
    daily_steps: int       # Move this up  
    water_drank: float     # Move this down
    chatbot_topic: str 

@app.get("/")
def read_root():
    return {"message": "Recommendation API is running"}

print(pipeline.named_steps.keys())

# Get the exact feature names from the FeatureBuilder in the pipeline
feature_builder = pipeline.named_steps['features']
feature_cols = feature_builder.feature_names
topic_cols = feature_builder.topic_cols

print("SERVER feature_cols (from FeatureBuilder):")
for col in feature_cols:
    print(col)

@app.post("/recommend")
def recommend(data: InputData):
    print(f"Received data: fast_food_pct={data.fast_food_pct} logins_per_week={data.logins_per_week} mood_score={data.mood_score} daily_steps={data.daily_steps} water_drank={data.water_drank} chatbot_topic='{data.chatbot_topic}'")
    try:
        # Use the exact feature order that the scaler expects (from scaler.feature_names_in_)
        scaler = pipeline.named_steps['scaler']
        base_feature_cols = scaler.feature_names_in_.tolist()
        
        print("Base feature columns:", base_feature_cols)
        
        # Initialize all base columns with zeros in the EXACT order from training
        row = {}
        for col in base_feature_cols:
            row[col] = 0

        # Fill numerical features
        row['fast_food_pct'] = data.fast_food_pct
        row['logins_per_week'] = data.logins_per_week
        row['daily_steps'] = data.daily_steps
        row['mood_score'] = data.mood_score
        row['water_drank'] = data.water_drank

        # Set one-hot chatbot topic column to 1
        topic_key = f"topic_{data.chatbot_topic.replace(' ', '_')}"
        if topic_key not in topic_cols:
            return {"error": f"Unknown topic '{data.chatbot_topic}'. Available topics: {[col.replace('topic_', '').replace('_', ' ') for col in topic_cols]}"}
        row[topic_key] = 1

        # Create DataFrame with base features in the EXACT order they were during training
        X_input = pd.DataFrame([row], columns=base_feature_cols)

        print("Input columns to pipeline:", X_input.columns.tolist())
        print("Input DataFrame shape:", X_input.shape)
        print("Input DataFrame head:")
        print(X_input.head())

        # Run full pipeline - the FeatureBuilder will add interaction features
        prediction = pipeline.predict(X_input)

        # Decode label to tip string
        tip = tip_encoder.inverse_transform(prediction)[0]
        tip_sentence = TIP_SENTENCES.get(tip, f"Recommended action: {tip.replace('_', ' ').capitalize()}")
        print("Final recommendation:", tip_sentence)
        return {"recommendation": tip_sentence}
    
    except Exception as e:
        print("❌ ERROR:", str(e))
        import traceback
        traceback.print_exc()
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
