import React from "react";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
//import "../styles/FinancePage.css";

function FinancePage() {
  const navigate = useNavigate();
  // 
  const[selectedCheck,setSelectedCheck] = useState([]);


  // Config of what to show under each days challenge
   const financeChallenges= {
     "Navigating Over-spending": [
      {name: "Navigating How to Save effectively", route: "/Day1Streak1"},
      {name: "Budget Tracking", route: "/Day1Streak2"} ,
      {name: "Spending Pressure", route: "/Day2Task3"},
    ],
    "Student on a budget" : [
      {name: "Envelope Method", route: "/Day3Task2"},
      {name: "Zero-Based Budgeting", route: "/Day3Task3"},
    ],
     "Needs vs Wants Detection": [
      { name: "Passive purchasing", route: "/Day1Task1"},
      { name: "50/30/20 Rule", route: "/Day1Task2"},
      { name: "Grey Zone Strategies", route: "/Day1Task3"},
    ]
  };

   // Day selection buttons
  const renderDayButtons = () => {
    return Object.keys(financeChallenges).map(day => (
      <button
        key={day}
        onClick={() => setSelectedCheck([day])} 
        className="day-selector-btn"
      >
        {day}
      </button>
    ));
  };
  //the btns that users click for the days that will take themto each task:
 const renderTaskButtons = () => {
    return selectedCheck.flatMap(check => // flat map here flattens the results of the state variables array into one level depth to get one flat array of btns
       (financeChallenges[check] || [])
      .map((page, index) => (
        <button
          key={`${check}-${index}`}
          className='checkData'
          onClick={() => navigate(page.route)}
          
        >
          <span className='title-Text'>{page.name}</span>
        </button>
      ))
  );
  };

  return (
    <div>
       <h2 className="heading">Financial Concepts:</h2>
        {/* Day selection */}
      <div className="day-selector">
        {renderDayButtons()}
      </div>
      <div className='wellness-Container'>
      <div className='wellness-Card'>
      <h1 className='wellness-Text'>Financial Awareness Checks: </h1>
       {selectedCheck.length > 0 && renderTaskButtons().length > 0 ? (
        <div className='finButtonWrapper'>
          {renderTaskButtons()}
        </div>
      ) : (
        <p className='unavailable-Text'></p>
      )}
      </div>
      </div>
    </div>
  );
}

export default FinancePage;