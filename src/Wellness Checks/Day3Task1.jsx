import React, { useState, useEffect } from 'react';
import { Droplets, Trophy, Target, RefreshCw, Sparkles, X, Lightbulb } from 'lucide-react';

function Day3Task1() {
  const [waterIntake, setWaterIntake] = useState(0);
  const [dailyGoal] = useState(8); // 8 glasses per day
  const [showReward, setShowReward] = useState(false);
  const [totalGlasses, setTotalGlasses] = useState(Array(8).fill(false));
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const [showRecommendationPopup, setShowRecommendationPopup] = useState(false);
  const [recommendation, setRecommendation] = useState('');
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);


   // Dumi: Pulled Ivy's User Data strucure as is  to get recommendation from backend
  const getWaterRecommendation = async (waterIntakeLevel) => {
    setLoadingRecommendation(true);
    
    try {
      //D:  Convert glasses to liters (assuming each glass is ~0.25L)
      const waterInLiters = waterIntakeLevel * 0.25;
      
      const userData = {
        fast_food_pct: 0.48,
        logins_per_week: 9,
        mood_score: 7,
        daily_steps: 6705,
        water_drank: waterInLiters,
        chatbot_topic: "hydration"
      };

      const response = await fetch('http://localhost:8000/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      const result = await response.json();
      
      if (result.error) { //D: in case the recommendation fromm the firebase does'not show or has error,s show a hyrdation tip
        setRecommendation('Stay hydrated! Aim for 8 glasses of water daily for optimal health.');
      } else {
        setRecommendation(result.recommendation);
      }
        
    } catch (err) {
      setRecommendation('Great job tracking your water intake! Keep staying hydrated for better health.');
    } finally {
      setLoadingRecommendation(false);
    }
  };


  // Check if goal is reached
  useEffect(() => {
    if (waterIntake >= dailyGoal && !showReward) {
      setShowReward(true);
      setCelebrationVisible(true);
      // Auto-hide celebration after 3 seconds
      setTimeout(() => setCelebrationVisible(false), 3000);
    }
  }, [waterIntake, dailyGoal, showReward]);

  const handleGlassClick = (index) => {
    const newGlasses = [...totalGlasses];
    
    if (!newGlasses[index]) {
      // Fill the glass
      newGlasses[index] = true;
      const newWaterIntake = waterIntake + 1;
      setWaterIntake(newWaterIntake);
      setTotalGlasses(newGlasses);

      //D: show a recommendation tip based on a new water intake logged in:
      getWaterRecommendation(newWaterIntake);
      setShowRecommendationPopup(true);
    } else {
      // Empty the glass and all after it
      let newWaterIntake = waterIntake;
      for (let i = index; i < newGlasses.length; i++) {
        if (newGlasses[i]) {
          newGlasses[i] = false;
          setWaterIntake(newWaterIntake - 1);
        }
      }
      setWaterIntake(newWaterIntake);
      setTotalGlasses(newGlasses);
    }
  };

  const resetTracker = () => {
    setWaterIntake(0);
    setTotalGlasses(Array(8).fill(false));
    setShowReward(false);
    setCelebrationVisible(false);
  };

  const addCustomGlass = () => {
    if (waterIntake < dailyGoal) {
      const nextEmptyIndex = totalGlasses.findIndex(glass => !glass);
      if (nextEmptyIndex !== -1) {
       const newWaterIntake = waterIntake + 1;
        setWaterIntake(newWaterIntake);
        const newGlasses = [...totalGlasses];
        newGlasses[nextEmptyIndex] = true;
        setTotalGlasses(newGlasses);

        //D:after adding a new water intake log, show pop up:
         getWaterRecommendation(newWaterIntake);
        setShowRecommendationPopup(true);
      }
    }
  };

  const progressPercentage = (waterIntake / dailyGoal) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 p-6">
      <div className="max-w-4xl mx-auto">

            {/* Recommendation Popup */}
        {showRecommendationPopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full shadow-2xl transform animate-fade-in">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Lightbulb className="w-6 h-6 text-blue-500 mr-2" />
                    <h3 className="text-lg font-bold text-gray-800">Wellness Tip</h3>
                  </div>
                  <button
                    onClick={() => setShowRecommendationPopup(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Recommendation Content */}
                <div className="mb-6">
                  {loadingRecommendation ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      <span className="ml-3 text-gray-600">Getting your tip...</span>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="text-blue-500 mr-3 text-lg">💧</div>
                        <div>
                          <h4 className="font-medium text-blue-800 mb-2">Hydration Insight:</h4>
                          <p className="text-gray-700 leading-relaxed text-sm">{recommendation}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Water Status */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Intake:</span>
                    <span className="font-bold text-blue-600">{waterIntake}/{dailyGoal} glasses</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Approx. Volume:</span>
                    <span className="font-bold text-blue-600">{(waterIntake * 0.25).toFixed(1)}L</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRecommendationPopup(false)}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                  >
                    Got it!
                  </button>
                  <button
                    onClick={() => {
                      setShowRecommendationPopup(false);
                      addCustomGlass();
                    }}
                    disabled={waterIntake >= dailyGoal}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
                  >
                    Add More
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        
        {/* Celebration Overlay */}
        {celebrationVisible && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-xl p-8 text-center shadow-2xl transform animate-bounce">
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4 animate-spin" />
              <h2 className="text-3xl font-bold text-blue-600 mb-2">🎉 Goal Achieved! 🎉</h2>
              <p className="text-gray-600">You've completed your daily water intake!</p>
              <Sparkles className="w-8 h-8 text-blue-400 mx-auto mt-2 animate-pulse" />
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Droplets className="w-8 h-8 text-blue-500 mr-3" />
              <h1 className="text-3xl font-bold text-gray-800">Water Intake Tracker</h1>
              <Droplets className="w-8 h-8 text-blue-500 ml-3" />
            </div>
            <p className="text-gray-600">Click the glasses to track your daily water intake!</p>
          </div>

          {/* Progress Section */}
          <div className="bg-blue-50 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Target className="w-6 h-6 text-blue-600 mr-2" />
                <span className="text-lg font-semibold text-blue-800">
                  Progress: {waterIntake}/{dailyGoal} glasses
                </span>
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-blue-200 rounded-full h-4 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Water Glasses Grid */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
              Click the glasses to fill them up! 💧
            </h2>
            
            <div className="grid grid-cols-4 md:grid-cols-8 gap-4 justify-items-center">
              {totalGlasses.map((isFilled, index) => (
                <button
                  key={index}
                  onClick={() => handleGlassClick(index)}
                  className={`
                    relative w-16 h-20 rounded-b-lg border-4 transition-all duration-300 transform hover:scale-110 active:scale-95
                    ${isFilled 
                      ? 'bg-gradient-to-t from-blue-400 to-blue-200 border-blue-500 shadow-lg' 
                      : 'bg-white border-gray-300 hover:border-blue-300'
                    }
                  `}
                >
                  {/* Glass rim */}
                  <div className="absolute -top-1 left-0 right-0 h-2 bg-gray-200 rounded-t-sm"></div>
                  
                  {/* Water level animation */}
                  {isFilled && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-blue-300 rounded-b-md animate-pulse">
                      <div className="h-full flex items-end justify-center pb-2">
                        <Droplets className="w-4 h-4 text-white/80" />
                      </div>
                    </div>
                  )}
                  
                  {/* Glass number */}
                  <span className={`absolute bottom-1 right-1 text-xs font-bold ${
                    isFilled ? 'text-white' : 'text-gray-400'
                  }`}>
                    {index + 1}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button
              onClick={addCustomGlass}
              disabled={waterIntake >= dailyGoal}
              className={`
                px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center
                ${waterIntake >= dailyGoal 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-600 transform hover:scale-105 shadow-lg'
                }
              `}
            >
              <Droplets className="w-5 h-5 mr-2" />
              Add Glass
            </button>
            
            <button
              onClick={resetTracker}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all duration-200 flex items-center transform hover:scale-105 shadow-lg"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Reset Day
            </button>
          </div>

          {/* Reward Section */}
          {showReward && (
            <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-xl p-6 text-center text-white transform transition-all duration-500 animate-pulse">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-yellow-300" />
              <h3 className="text-2xl font-bold mb-2">🏆 Hydration Champion! 🏆</h3>
              <p className="text-lg mb-3">You've reached your daily water goal!</p>
              <div className="bg-white/20 rounded-lg p-3">
                <p className="font-semibold">Benefits unlocked:</p>
                <p className="text-sm">✨ Better skin health ✨ Improved energy ✨ Enhanced brain functionality</p>
              </div>
            </div>
          )}

          {/* Tips Section */}
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div className="bg-cyan-50 p-6 rounded-lg">
              <h3 className="font-bold text-cyan-800 mb-2">💡 Hydration Tips</h3>
              <ul className="text-cyan-700 text-sm space-y-1">
                <li>• Start your day with a glass of water</li>
                <li>• Keep a water bottle with you</li>
                <li>• Set reminders throughout the day</li>
              </ul>
            </div>
            <div className="bg-teal-50 p-6 rounded-lg">
              <h3 className="font-bold text-teal-800 mb-2">🌟 Health Benefits</h3>
              <ul className="text-teal-700 text-sm space-y-1">
                <li>• Improves brain function and mood</li>
                <li>• Helps maintain healthy skin</li>
                <li>• Supports kidney function</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Day3Task1;
