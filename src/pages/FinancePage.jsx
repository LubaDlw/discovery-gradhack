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
     "Money Mastery": [
      {name: "Navigating How to Save effectively", route: "/Day2Task1"},
      {name: "Navigating Spending Habits", route: "/Day2Task2"} ,
      {name: "Spending Pressure", route: "/Day2Task3"},
    ],
    // "H20 Tuesday" : [
    //   {name: "Water Intake Challenge", route: "/Day3Task1"},
    //   {name: "Healthy Liquid Intake", route: "/Day3Task2"},
    //   {name: "Nutrition Check", route: "/Day3Task3"},
    // ],
    //  "Mindful Wednesday ": [
    //   { name: "Navigating Academic Pressure", route: "/Day1Task1"},
    //   { name: "Dealing with Impostor Syndrome", route: "/Day1Task2"},
    //   { name: "Time management", route: "/Day1Task3"},
    // ]
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
       <h2 className="heading">Select a day:</h2>
        {/* Day selection */}
      <div className="day-selector">
        {renderDayButtons()}
      </div>
      <div className='wellness-Container'>
      <div className='wellness-Card'>
      <h1 className='wellness-Text'>Financial Awareness Checks: </h1>
       {selectedCheck.length > 0 && renderTaskButtons().length > 0 ? (
        <div className='buttonsWrapper'>
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