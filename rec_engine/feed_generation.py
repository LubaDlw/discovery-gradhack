from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
import firebase_admin
from firebase_admin import firestore
from datetime import datetime, timedelta
import os
import logging
import random

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Initialize Firebase (only once)
if not firebase_admin._apps:
    firebase_admin.initialize_app()

db = firestore.client()

# Load models
try:
    pipeline = joblib.load("full_pipeline.joblib")
    tip_encoder = joblib.load("tip_encoder.joblib")
    logger.info("✅ Models loaded successfully")
except Exception as e:
    logger.error(f"❌ Error loading models: {e}")
    pipeline = None
    tip_encoder = None

def get_content_by_category(category, limit=10):
    """Get active content from Firestore by category"""
    try:
        docs = db.collection('feed_content')\
                .where('category', '==', category)\
                .where('active', '==', True)\
                .limit(limit)\
                .stream()
        
        content = []
        for doc in docs:
            item = doc.to_dict()
            item['id'] = doc.id  # Add document ID
            content.append(item)
        
        return content
    except Exception as e:
        logger.error(f"Error getting content for {category}: {e}")
        return []

def get_all_categories():
    """Get list of all available content categories"""
    try:
        docs = db.collection('feed_content')\
                .where('active', '==', True)\
                .stream()
        
        categories = set()
        for doc in docs:
            data = doc.to_dict()
            if 'category' in data:
                categories.add(data['category'])
        
        return list(categories)
    except Exception as e:
        logger.error(f"Error getting categories: {e}")
        return ['fitness', 'nutrition', 'mental_health', 'sleep']  # fallback

def get_user_recommendation(user_data):
    """Get recommendation for user using the ML model"""
    if pipeline is None or tip_encoder is None:
        return 'fitness'  # fallback
    
    try:
        # Create DataFrame with the input
        input_df = pd.DataFrame([user_data])
        
        # One-hot encode chatbot_topic
        input_df = pd.get_dummies(input_df, columns=['chatbot_topic'], prefix='topic')
        
        # Load feature columns
        try:
            import json
            with open('feature_columns.json', 'r') as f:
                feature_cols = json.load(f)
        except:
            num_cols = ['fast_food_pct', 'logins_per_week', 'mood_score', 'daily_steps', 'water_drank']
            topic_cols = [col for col in input_df.columns if col.startswith('topic_')]
            feature_cols = num_cols + topic_cols
        
        # Ensure all expected columns exist
        for col in feature_cols:
            if col not in input_df.columns:
                input_df[col] = 0
        
        input_df = input_df[feature_cols]
        
        # Make prediction
        prediction_encoded = pipeline.predict(input_df)[0]
        prediction = tip_encoder.inverse_transform([prediction_encoded])[0]
        
        return prediction
        
    except Exception as e:
        logger.error(f"Error getting recommendation: {e}")
        return 'fitness'  # fallback

def generate_personalized_feed(user_id, user_data, recommendation):
    """Generate personalized feed based on recommendation using Firestore content"""
    
    # Map recommendations to content categories
    category_mapping = {
        'exercise_more': 'fitness',
        'drink_more_water': 'nutrition', 
        'improve_sleep': 'sleep',
        'reduce_stress': 'mental_health',
        'eat_healthier': 'nutrition',
        'be_more_active': 'fitness'
    }
    
    primary_category = category_mapping.get(recommendation, 'fitness')
    
    # Get content for primary category from Firestore
    primary_content = get_content_by_category(primary_category, limit=5)
    
    # Get content from other categories for variety
    all_categories = get_all_categories()
    other_categories = [cat for cat in all_categories if cat != primary_category]
    secondary_content = []
    
    # Get 1-2 items from other categories
    for cat in random.sample(other_categories, min(2, len(other_categories))):
        cat_content = get_content_by_category(cat, limit=2)
        if cat_content:
            secondary_content.extend(random.sample(cat_content, min(1, len(cat_content))))
    
    # Combine and prioritize content
    feed_items = []
    
    # Add primary content (higher weight)
    for item in primary_content:
        feed_item = item.copy()
        feed_item['relevance_score'] = 0.9 if item.get('priority') == 'high' else 0.7
        feed_item['category'] = primary_category
        feed_item['recommended'] = True
        feed_items.append(feed_item)
    
    # Add secondary content (lower weight)
    for item in secondary_content:
        feed_item = item.copy()
        feed_item['relevance_score'] = 0.4
        feed_item['recommended'] = False
        feed_items.append(feed_item)
    
    # Sort by relevance score and priority
    feed_items.sort(key=lambda x: (x['relevance_score'], x.get('priority') == 'high'), reverse=True)
    
    # Add metadata
    feed_data = {
        'user_id': user_id,
        'generated_at': datetime.utcnow(),
        'recommendation': recommendation,
        'primary_category': primary_category,
        'items': feed_items[:5],  # Limit to top 5 items
        'expires_at': datetime.utcnow() + timedelta(hours=6)  # Feed expires after 6 hours
    }
    
    return feed_data

def save_feed_to_firestore(user_id, feed_data):
    """Save generated feed to Firestore"""
    try:
        # Save to user's feed collection
        db.collection('user_feeds').document(user_id).set(feed_data)
        
        # Also save to feed history for analytics
        db.collection('feed_history').add({
            'user_id': user_id,
            'generated_at': feed_data['generated_at'],
            'recommendation': feed_data['recommendation'],
            'primary_category': feed_data['primary_category'],
            'item_count': len(feed_data['items'])
        })
        
        logger.info(f"✅ Saved feed for user {user_id}")
        
    except Exception as e:
        logger.error(f"❌ Failed to save feed: {e}")

@app.route('/generate-feed', methods=['POST'])
def generate_feed():
    """Generate personalized feed for a user"""
    try:
        data = request.json
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        
        # Get user data for recommendation
        user_data = {
            'fast_food_pct': data.get('fast_food_pct', 0.3),
            'logins_per_week': data.get('logins_per_week', 5),
            'mood_score': data.get('mood_score', 7),
            'daily_steps': data.get('daily_steps', 8000),
            'water_drank': data.get('water_drank', 2.0),
            'chatbot_topic': data.get('chatbot_topic', 'fitness')
        }
        
        # Get recommendation
        recommendation = get_user_recommendation(user_data)
        
        # Generate personalized feed
        feed_data = generate_personalized_feed(user_id, user_data, recommendation)
        
        # Save to Firestore
        save_feed_to_firestore(user_id, feed_data)
        
        # Return feed (convert datetime objects to strings for JSON)
        response_data = feed_data.copy()
        response_data['generated_at'] = feed_data['generated_at'].isoformat()
        response_data['expires_at'] = feed_data['expires_at'].isoformat()
        
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"❌ Error generating feed: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/get-feed/<user_id>', methods=['GET'])
def get_user_feed(user_id):
    """Get existing feed for a user"""
    try:
        # Get user's current feed
        feed_doc = db.collection('user_feeds').document(user_id).get()
        
        if not feed_doc.exists:
            return jsonify({'error': 'No feed found for user'}), 404
        
        feed_data = feed_doc.to_dict()
        
        # Check if feed has expired
        expires_at = feed_data.get('expires_at')
        if expires_at and expires_at < datetime.utcnow():
            return jsonify({'error': 'Feed has expired', 'expired': True}), 410
        
        # Convert datetime objects to strings
        if 'generated_at' in feed_data:
            feed_data['generated_at'] = feed_data['generated_at'].isoformat()
        if 'expires_at' in feed_data:
            feed_data['expires_at'] = feed_data['expires_at'].isoformat()
        
        return jsonify(feed_data)
        
    except Exception as e:
        logger.error(f"❌ Error getting feed: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/content/categories', methods=['GET'])
def get_content_categories():
    """Get all available content categories"""
    try:
        categories = get_all_categories()
        
        # Get count for each category
        category_stats = {}
        for category in categories:
            content = get_content_by_category(category, limit=1000)
            category_stats[category] = len(content)
        
        return jsonify({
            'categories': categories,
            'stats': category_stats
        })
        
    except Exception as e:
        logger.error(f"❌ Error getting categories: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/feed-interaction', methods=['POST'])
def log_feed_interaction():
    """Log when user interacts with feed items"""
    try:
        data = request.json
        
        interaction_data = {
            'user_id': data.get('user_id'),
            'item_id': data.get('item_id'),
            'interaction_type': data.get('interaction_type'),  # 'view', 'click', 'dismiss'
            'timestamp': datetime.utcnow(),
            'item_category': data.get('item_category'),
            'was_recommended': data.get('was_recommended', False)
        }
        
        # Save interaction to Firestore
        db.collection('feed_interactions').add(interaction_data)
        
        return jsonify({'status': 'logged'})
        
    except Exception as e:
        logger.error(f"❌ Error logging interaction: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/content/categories', methods=['GET'])
def get_content_categories():
    """Get all available content categories"""
    try:
        categories = get_all_categories()
        
        # Get count for each category
        category_stats = {}
        for category in categories:
            content = get_content_by_category(category, limit=1000)
            category_stats[category] = len(content)
        
        return jsonify({
            'categories': categories,
            'stats': category_stats
        })
        
    except Exception as e:
        logger.error(f"❌ Error getting categories: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/content/<category>', methods=['GET'])
def get_category_content(category):
    """Get all content for a specific category"""
    try:
        content = get_content_by_category(category, limit=100)
        return jsonify({
            'category': category,
            'content': content,
            'count': len(content)
        })
        
    except Exception as e:
        logger.error(f"❌ Error getting content for {category}: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(debug=True, host='0.0.0.0', port=port)