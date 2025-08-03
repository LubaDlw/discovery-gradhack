import React, { useState } from 'react';
//import { db} from '../../firebase'; // your firebase client config file
//import { doc, setDoc } from 'firebase/firestore';

/*
const saveTipToFirestore = async (tip) => { // Remove userId parameter
  try {
    await setDoc(doc(db, 'recommendations', 'user1'), { // Hardcode 'user1'
      recommendation: tip,
      timestamp: new Date()
    });
  } catch (e) {
    console.error("Error saving recommendation", e);
  }
};*/


function RecommendationContext() {
  // Base user data
  const [userData, setUserData] = useState({
    fast_food_pct: 0.48,      // 1st
    logins_per_week: 9,       // 2nd  
    mood_score: 7,            // 3rd
    daily_steps: 6705,        // 4th
    water_drank: 3.29,        // 5th
    chatbot_topic: "anxiety"  // 6th (last)
});

  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Function to get recommendation from backend
  const getRecommendation = async (updatedData) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8000/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData)
      });

      const result = await response.json();
      
      if (result.error) {
        setError(result.error);
        setRecommendation('');
      } else {
        setRecommendation(result.recommendation);
        setError('');
        // Save to Firestore with hardcoded user
        //await saveTipToFirestore(result.recommendation); // Remove auth check
      }
        
    }
     catch (err) {
      setError('Failed to connect to server: ' + err.message);
      setRecommendation('');
    } finally {
      setLoading(false);
    }


  };

  // Button handlers
  const handleMoodScoreChange = () => {
    // Cycle mood score between 1-10
    const newMoodScore = userData.mood_score >= 10 ? 1 : userData.mood_score + 1;
    const updatedData = { ...userData, mood_score: newMoodScore };
    setUserData(updatedData);
    getRecommendation(updatedData);
  };

  const handleWaterDrankChange = () => {
    // Cycle water between 0.5, 1.0, 1.5, 2.0, 2.5, 3.0 liters
    const waterLevels = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0];
    const currentIndex = waterLevels.findIndex(level => Math.abs(level - userData.water_drank) < 0.01);
    const nextIndex = (currentIndex + 1) % waterLevels.length;
    const newWaterDrank = waterLevels[nextIndex];
    
    const updatedData = { ...userData, water_drank: newWaterDrank };
    setUserData(updatedData);
    getRecommendation(updatedData);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Wellness Recommendation System Tester
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls Section */}
          <div className="space-y-6">
            {/* Control Buttons */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col gap-4">
                <button
                  onClick={handleMoodScoreChange}
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  {loading ? 'Getting Recommendation...' : 'Change Mood Score'}
                </button>
                
                <button
                  onClick={handleWaterDrankChange}
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  {loading ? 'Getting Recommendation...' : 'Change Water Intake'}
                </button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-red-400 mr-2">⚠️</div>
                  <div className="text-red-700 font-medium">Error</div>
                </div>
                <p className="text-red-600 mt-1 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Recommendation Display */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Recommendation</h2>
              
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-600">Loading...</span>
                </div>
              )}
              
              {!loading && !recommendation && !error && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🎯</div>
                  <p>Click a button to get a recommendation</p>
                </div>
              )}
              
              {recommendation && !loading && (
                <div className="bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="text-green-500 mr-2 text-lg">💡</div>
                    <div>
                      <h3 className="font-medium text-green-800 mb-2">Your Wellness Tip:</h3>
                      <p className="text-gray-700 leading-relaxed">{recommendation}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationContext;
