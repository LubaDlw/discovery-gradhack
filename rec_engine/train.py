from xgboost import XGBClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import f1_score
import joblib
import pandas as pd
from xgboost import plot_importance
from sklearn.preprocessing import MinMaxScaler
import matplotlib.pyplot as plt
import shap
import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.pipeline import Pipeline
from features import FeatureBuilder
import json
import firebase_admin
from firebase_admin import firestore

# Initialize Firebase (if not already done)
if not firebase_admin._apps:
    firebase_admin.initialize_app()

db = firestore.client()

def load_data_from_firestore(collection_name='student_data'):
    """Load training data from Firestore"""
    print(f"Loading data from Firestore collection: {collection_name}")
    docs = db.collection(collection_name).stream()
    data = [doc.to_dict() for doc in docs]
    df = pd.DataFrame(data)
    print(f"Loaded {len(df)} rows from Firestore")
    return df

# Load data from Firestore instead of CSV
df = load_data_from_firestore('student_data')  # Change collection name if needed

# One-hot encode chatbot_topic
df = pd.get_dummies(df, columns=['chatbot_topic'], prefix='topic')

# After one-hot encoding
df.columns = [col.replace(' ', '_') for col in df.columns]



tip_encoder = LabelEncoder()
df['tip_encoded'] = tip_encoder.fit_transform(df['recommended_tip'])

# Separate X and y
y = df['tip_encoded']
X = df.drop(columns=['recommended_tip', 'tip_encoded'])

# Define numerical features
num_cols = ['fast_food_pct', 'logins_per_week', 'daily_steps', 'mood_score', 'water_drank']

# Define feature columns
feature_cols = num_cols + [col for col in df.columns if col.startswith('topic_')]

# Also rename df columns to match
df.columns = [col.replace(' ', '_') for col in df.columns]

print("TRAIN feature_cols:")
for col in feature_cols:
    print(col)

with open('feature_columns.json', 'w') as f:
    json.dump(feature_cols, f)

print([repr(col) for col in feature_cols])

# Build pipeline
pipeline = Pipeline(steps=[
    ('scaler', MinMaxScaler()),  # Only affects numerical columns
    ('features', FeatureBuilder(feature_names=feature_cols)),  # Adds interaction features
    ('model', XGBClassifier(use_label_encoder=False, eval_metric='mlogloss'))
])

# Fit pipeline
pipeline.fit(X, y)

# Get the complete feature names after FeatureBuilder adds interaction terms
# We need to transform a sample to see what features are created
sample_transformed = pipeline.named_steps['features'].transform(X.iloc[:1])
complete_feature_names = []

# Add base feature names
complete_feature_names.extend(feature_cols)

# Add interaction feature names (these are created by FeatureBuilder)
topic_cols = [col for col in feature_cols if col.startswith('topic_')]
for topic_col in topic_cols:
    complete_feature_names.append(f'interaction_{topic_col}_mood')
complete_feature_names.append('interaction_food_mood')

print("COMPLETE feature names after FeatureBuilder:")
for col in complete_feature_names:
    print(col)

# Save the complete feature names (including interactions)
with open('feature_columns.json', 'w') as f:
    json.dump(complete_feature_names, f)

print("Expected cols:", pipeline.feature_names_in_)  # if supported
print("X_input cols:", X.columns.tolist())

print(type(pipeline))
print(pipeline.named_steps)

# Step 10: Save model and encoder
# Save everything
joblib.dump(pipeline, "full_pipeline.joblib")
joblib.dump(tip_encoder, "tip_encoder.joblib")
print("✅ Model and encoders saved successfully.")


# Step 8: Feature importance (default)
# importances = model.feature_importances_
# feature_names = X.columns
#
# plt.figure(figsize=(10, 6))
# plt.barh(feature_names, importances, color='teal')
# plt.xlabel("Importance Score")
# plt.ylabel("Features")
# plt.title("Feature Importance - XGBoost")
# plt.tight_layout()
# plt.savefig("feature_importance.png")
# plt.close()

# Step 9: SHAP analysis
# Confirm all columns are numeric
# print(X.dtypes)
#
# # Fix: convert all to float64
# X = X.astype('float64')
# explainer = shap.Explainer(model, X)
# shap_values = explainer(X)
# plt.figure(figsize=(12, 8))
# shap.summary_plot(shap_values, X, plot_type="bar", show=False)
# plt.savefig("shap_feature_importance.png", bbox_inches="tight")
# plt.close()
