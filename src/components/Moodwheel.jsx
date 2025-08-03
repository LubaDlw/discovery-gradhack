import React, { useState } from 'react';
import { db } from '../../firebase'; // your firebase client config file
import { doc, setDoc } from 'firebase/firestore';
import LoadingScreen from './LoadingScreen';

function Moodwheel() {
  const [showPopup, setShowPopup] = useState(false);
  const [currentRecommendation, setCurrentRecommendation] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedMood, setSelectedMood] = useState('');

  // Mood configurations with emojis, labels, and corresponding chatbot topics
  const moods = [
    { emoji: '😊', label: 'Happy', topic: 'happiness', angle: 0 },
    { emoji: '😰', label: 'Anxious', topic: 'anxiety', angle: 45 },
    { emoji: '😢', label: 'Sad', topic: 'sadness', angle: 90 },
    { emoji: '😡', label: 'Angry', topic: 'anger', angle: 135 },
    { emoji: '😴', label: 'Tired', topic: 'fatigue', angle: 180 },
    { emoji: '😕', label: 'Stressed', topic: 'stress', angle: 225 },
    { emoji: '🤔', label: 'Confused', topic: 'confusion', angle: 270 },
    { emoji: '😌', label: 'Calm', topic: 'relaxation', angle: 315 }
  ];

  // Base user data (from your original component)
  const baseUserData = {
    fast_food_pct: 0.48,
    logins_per_week: 9,
    mood_score: 7,
    daily_steps: 6705,
    water_drank: 3.29,
    chatbot_topic: "anxiety" // This will be updated based on mood selection
  };

  const saveTipToFirestore = async (tip, moodTopic) => {
    try {
      await setDoc(doc(db, 'recommendations', 'user1'), {
        recommendation: tip,
        mood_context: moodTopic,
        timestamp: new Date()
      });
    } catch (e) {
      console.error("Error saving recommendation", e);
    }
  };

  const getRecommendation = async (moodTopic) => {
    setLoading(true);
    
    try {
      // Update user data with selected mood topic
      const updatedUserData = {
        ...baseUserData,
        chatbot_topic: moodTopic
      };

      const response = await fetch('http://localhost:8000/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUserData)
      });

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      } else {
        setCurrentRecommendation(result.recommendation);
        // Save to Firestore
        await saveTipToFirestore(result.recommendation, moodTopic);
        setShowPopup(true);
      }
    } catch (err) {
      console.error('Failed to get recommendation:', err); // ask Ivy to check why it's failing here!
      setCurrentRecommendation('Sorry, we couldn\'t get a recommendation right now. Please try again later.');
      setShowPopup(true);
    } finally {
      setLoading(false);
    }
  };

  const handleMoodClick = (mood) => {
    setSelectedMood(mood.label);
    getRecommendation(mood.topic);
  };

  const closePopup = () => {
    setShowPopup(false);
    setCurrentRecommendation('');
    setSelectedMood('');
  };

  return (
    <div className="mood-wheel-container">
      {/* Mood Wheel */}
      <div className="mood-wheel">
        <div className="wheel-center">
          <span className="center-text">How are you feeling?</span>
        </div>
        
        {moods.map((mood, index) => (
          <div
            key={mood.label}
            className={`mood-item ${loading && selectedMood === mood.label ? 'loading' : ''}`}
            style={{
              transform: `rotate(${mood.angle}deg) translateY(-120px) rotate(-${mood.angle}deg)`
            }}
            onClick={() => handleMoodClick(mood)}
          >
            <div className="mood-face">
              <span className="mood-emoji">{mood.emoji}</span>
              <span className="mood-label">{mood.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <p><LoadingScreen/></p>
        </div>
      )}

      {/* Recommendation Popup */}
      {showPopup && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h3>Recommendation for {selectedMood} Mood</h3>
              <button className="close-btn" onClick={closePopup}>×</button>
            </div>
            <div className="popup-body">
              <div className="recommendation-content">
                <div className="recommendation-icon">💡</div>
                <p>{currentRecommendation}</p>
              </div>
            </div>
            <div className="popup-footer">
              <button className="popup-action-btn" onClick={closePopup}>
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Moodwheel;