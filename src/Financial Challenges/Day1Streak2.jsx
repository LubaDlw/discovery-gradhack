import React, { useState, useEffect } from 'react';
import { DollarSign, Award, RefreshCw, TrendingUp, AlertTriangle, CheckCircle, XCircle, Target, Coins } from 'lucide-react';

function Day1Streak2() {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [budget, setBudget] = useState(1000); // D: Monthly budget target
  const [spent, setSpent] = useState(0);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [decisions, setDecisions] = useState([]);
  const [currentDecision, setCurrentDecision] = useState(null);

  const scenarios = [
    {
      id: 1,
      title: "Week 1: Textbook Study Guide Emergency! 📚",
      description: "You need a R200 textbook for your economics class that starts Monday. What do you do?",
      options: [
        { text: "Buy the brand new textbook for R200", cost: 200, type: "poor", feedback: "Ouch! Always check for cheaper alternatives first." },
        { text: "Rent the textbook online for R60", cost: 60, type: "good", feedback: "Smart choice! Renting saves money for the same content." },
        { text: "Buy a used copy for R80", cost: 80, type: "excellent", feedback: "Excellent! Used books are a great budget-friendly option." },
        { text: "Split the cost with a classmate for R100 each", cost: 100, type: "good", feedback: "Creative solution! Sharing costs is budget-smart." }
      ]
    },
    {
      id: 2,
      title: "Week 2: Friday Night Plans 🎉",
      description: "Your friends invite you to an expensive restaurant that costs R45 per person. You have food at home.",
      options: [
        { text: "Go to the restaurant and pay R45", cost: 45, type: "poor", feedback: "This is a 'want' that could hurt your budget. Cook more often!" },
        { text: "Suggest cooking together at someone's place", cost: 15, type: "excellent", feedback: "Perfect! Social AND budget-friendly. You're learning!" },
        { text: "Skip dinner but join for dessert (R12)", cost: 12, type: "good", feedback: "Good compromise! You still socialize without overspending." },
        { text: "Stay home and save money", cost: 0, type: "good", feedback: "Sometimes saying no is the right choice for your budget!" }
      ]
    },
    {
      id: 3,
      title: "Week 3: Technology Temptation 💻",
      description: "Your laptop is running slowly. A new one costs R1,200, but yours still works for basic tasks.",
      options: [
        { text: "Buy the new laptop immediately", cost: 1200, type: "poor", feedback: "Whoa! This would destroy your budget. Your current laptop still works!" },
        { text: "Clean up your current laptop and wait", cost: 0, type: "excellent", feedback: "Brilliant! Maintenance first, replacement only when necessary." },
        { text: "Buy a refurbished laptop for R400", cost: 400, type: "poor", feedback: "Still expensive when your current one works. Wait and save!" },
        { text: "Save $50/month toward a future laptop", cost: 50, type: "good", feedback: "Good planning! Setting aside money for future needs is smart." }
      ]
    },
    {
      id: 4,
      title: "Week 4: Transportation Decision 🚗",
      description: "Your monthly bus pass expires. You could walk (free), bus pass (R85), or rideshare daily (R180).",
      options: [
        { text: "Use rideshare apps daily (R180)", cost: 180, type: "poor", feedback: "Too expensive for regular transportation! This adds up quickly." },
        { text: "Buy the monthly bus pass (R85)", cost: 85, type: "good", feedback: "Reasonable choice for reliable transportation!" },
        { text: "Walk when possible, bus occasionally (R30)", cost: 30, type: "excellent", feedback: "Perfect balance! Exercise + savings = winning combo!" },
        { text: "Ask friends for rides (gas money R40)", cost: 40, type: "good", feedback: "Fair solution, but make sure you reciprocate!" }
      ]
    },
    {
      id: 5,
      title: "Month End: Emergency Fund 💰",
      description: "You have R200 left this month. Your friend asks to borrow R150, promising to pay you back 'soon'.",
      options: [
        { text: "Lend the full R150", cost: 150, type: "poor", feedback: "Risky! Never lend money you can't afford to lose." },
        { text: "Keep it all as emergency savings", cost: 0, type: "excellent", feedback: "Wise! Emergency funds are for YOU, not loans to friends." },
        { text: "Lend R50, save the rest", cost: 50, type: "good", feedback: "Compromise, but be prepared to not get it back!" },
        { text: "Suggest they ask family instead", cost: 0, type: "good", feedback: "Smart boundary! Protecting your financial stability first." }
      ]
    }
  ];

  const handleDecision = (option) => {
    const newSpent = spent + option.cost;
    setSpent(newSpent);
    setCurrentDecision(option);
    setShowResult(true);
    
    // D: Calculate score based on decision type
    let points = 0;
    switch(option.type) {
      case 'excellent': points = 20; break;
      case 'good': points = 15; break;
      case 'poor': points = 5; break;
      default: points = 10;
    }
    setScore(prev => prev + points);
    
    setDecisions(prev => [...prev, {
      scenario: scenarios[currentScenario].title,
      choice: option.text,
      cost: option.cost,
      type: option.type,
      feedback: option.feedback
    }]);
  };

  const nextScenario = () => {
    setShowResult(false);
    setCurrentDecision(null);
    
    if (currentScenario < scenarios.length - 1) {
      setCurrentScenario(prev => prev + 1);
    } else {
      setGameCompleted(true);
    }
  };

  const resetGame = () => {
    setCurrentScenario(0);
    setBudget(1000);
    setSpent(0);
    setScore(0);
    setGameCompleted(false);
    setShowResult(false);
    setDecisions([]);
    setCurrentDecision(null);
  };

  const remaining = budget - spent;
  const budgetHealth = remaining > 600 ? 'excellent' : remaining > 300 ? 'good' : remaining > 0 ? 'warning' : 'poor';

  const getScoreGrade = () => {
    if (score >= 90) return { grade: 'A+', color: 'text-green-600', message: 'Budget Master!' };
    if (score >= 80) return { grade: 'A', color: 'text-green-500', message: 'Excellent Budgeter!' };
    if (score >= 70) return { grade: 'B', color: 'text-blue-500', message: 'Good Financial Sense!' };
    if (score >= 60) return { grade: 'C', color: 'text-yellow-500', message: 'Room for Improvement!' };
    return { grade: 'D', color: 'text-red-500', message: 'Need More Practice!' };
  };

  if (gameCompleted) {
    const finalGrade = getScoreGrade();
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            
            {/* Final Results */}
            <div className="text-center mb-8">
              <Award className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Challenge Complete! 🎉</h1>
              <div className={`text-6xl font-bold ${finalGrade.color} mb-2`}>{finalGrade.grade}</div>
              <p className="text-xl text-gray-600">{finalGrade.message}</p>
            </div>

            {/* Budget Summary */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-lg text-center">
                <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-800">R{budget}</div>
                <div className="text-blue-600">Starting Budget</div>
              </div>
              <div className="bg-red-50 p-6 rounded-lg text-center">
                <TrendingUp className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-800">R{spent}</div>
                <div className="text-red-600">Total Spent</div>
              </div>
              <div className={`p-6 rounded-lg text-center ${
                remaining > 0 ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <Target className="w-8 h-8 mx-auto mb-2" />
                <div className={`text-2xl font-bold ${remaining > 0 ? 'text-green-800' : 'text-red-800'}`}>
                  ${remaining}
                </div>
                <div className={remaining > 0 ? 'text-green-600' : 'text-red-600'}>
                  {remaining > 0 ? 'Remaining' : 'Over Budget!'}
                </div>
              </div>
            </div>

            {/* Decision Review */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Decisions Review</h2>
              <div className="space-y-4">
                {decisions.map((decision, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${
                    decision.type === 'excellent' ? 'bg-green-50 border-green-500' :
                    decision.type === 'good' ? 'bg-blue-50 border-blue-500' :
                    'bg-yellow-50 border-yellow-500'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{decision.scenario}</h3>
                        <p className="text-gray-600 text-sm mb-1">{decision.choice}</p>
                        <p className="text-gray-500 text-xs">{decision.feedback}</p>
                      </div>
                      <div className="flex items-center ml-4">
                        <span className="text-lg font-bold text-gray-800">${decision.cost}</span>
                        {decision.type === 'excellent' ? 
                          <CheckCircle className="w-5 h-5 text-green-500 ml-2" /> :
                          decision.type === 'good' ? 
                          <CheckCircle className="w-5 h-5 text-blue-500 ml-2" /> :
                          <AlertTriangle className="w-5 h-5 text-yellow-500 ml-2" />
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Key Lessons */}
            <div className="bg-indigo-50 p-6 rounded-lg mb-8">
              <h3 className="text-xl font-bold text-indigo-800 mb-4">🎓 Key Budgeting Lessons to take away:</h3>
              <ul className="text-indigo-700 space-y-2">
                <li>• Always look for cheaper alternatives (used books, rentals).</li>
                <li>• Distinguish between needs and wants before spending. This is very important.</li>
                <li>• Plan for future expenses by saving small amounts monthly.</li>
                <li>• Maintain an emergency fund - don't lend it out!</li>
                <li>• Creative solutions (cooking together) can save money AND be fun.</li>
              </ul>
            </div>

            <div className="text-center">
              <button
                onClick={resetGame}
                className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-all duration-200 flex items-center mx-auto transform hover:scale-105"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Try Again & Improve!
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Coins className="w-8 h-8 text-purple-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-800">Student Budget Challenge</h1>
              <Coins className="w-8 h-8 text-purple-600 ml-3" />
            </div>
            <p className="text-gray-600">Make smart financial decisions and learn budgeting through real student scenarios!</p>
          </div>

          {/* Progress and Budget Status */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-sm text-purple-600">Scenario</div>
              <div className="text-xl font-bold text-purple-800">{currentScenario + 1}/5</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-sm text-blue-600">Budget Left</div>
              <div className={`text-xl font-bold ${
                budgetHealth === 'excellent' ? 'text-green-600' :
                budgetHealth === 'good' ? 'text-blue-600' :
                budgetHealth === 'warning' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                R{remaining}
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-sm text-red-600">Spent</div>
              <div className="text-xl font-bold text-red-800">R{spent}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-sm text-green-600">Score</div>
              <div className="text-xl font-bold text-green-800">{score}</div>
            </div>
          </div>

          {/* Budget Health Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Budget Health</span>
              <span>{Math.round((remaining/budget) * 100)}% remaining</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className={`h-4 rounded-full transition-all duration-500 ${
                  budgetHealth === 'excellent' ? 'bg-green-500' :
                  budgetHealth === 'good' ? 'bg-blue-500' :
                  budgetHealth === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.max(0, (remaining/budget) * 100)}%` }}
              ></div>
            </div>
          </div>

          {!showResult ? (
            /* Scenario Display */
            <div className="mb-8">
              <div className="bg-indigo-50 p-6 rounded-lg mb-6">
                <h2 className="text-2xl font-bold text-indigo-800 mb-3">
                  {scenarios[currentScenario].title}
                </h2>
                <p className="text-indigo-700 text-lg">
                  {scenarios[currentScenario].description}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {scenarios[currentScenario].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleDecision(option)}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 text-left transform hover:scale-102"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium mb-2">{option.text}</p>
                        <span className="text-2xl font-bold text-purple-600">-R{option.cost}</span>
                      </div>
                      <DollarSign className="w-6 h-6 text-purple-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Result Display */
            <div className="mb-8">
              <div className={`p-6 rounded-lg mb-6 ${
                currentDecision.type === 'excellent' ? 'bg-green-50 border-2 border-green-200' :
                currentDecision.type === 'good' ? 'bg-blue-50 border-2 border-blue-200' :
                'bg-yellow-50 border-2 border-yellow-200'
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Your Choice:</h3>
                  {currentDecision.type === 'excellent' ? 
                    <CheckCircle className="w-8 h-8 text-green-500" /> :
                    currentDecision.type === 'good' ? 
                    <CheckCircle className="w-8 h-8 text-blue-500" /> :
                    <AlertTriangle className="w-8 h-8 text-yellow-500" />
                  }
                </div>
                <p className="text-gray-700 mb-3">{currentDecision.text}</p>
                <p className={`font-medium ${
                  currentDecision.type === 'excellent' ? 'text-green-700' :
                  currentDecision.type === 'good' ? 'text-blue-700' :
                  'text-yellow-700'
                }`}>
                  💡 {currentDecision.feedback}
                </p>
                <div className="mt-4 text-right">
                  <span className="text-lg text-gray-600">Cost: </span>
                  <span className="text-2xl font-bold text-red-600">-R{currentDecision.cost}</span>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={nextScenario}
                  className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-all duration-200 transform hover:scale-105"
                >
                  {currentScenario < scenarios.length - 1 ? 'Next Scenario →' : 'See Final Results 🏆'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Day1Streak2;
