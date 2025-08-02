import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import Task1Icon from "../assets/menu_icon.png";
//import "../styles/WellnessPage.css";

function WellnessPage() {
  const navigate = useNavigate();
  // 
  const[selectedCheck,setSelectedCheck] = useState([]);


  // Config of what to show under each days challenge
   const wellnessChallenges= {
     "Day 1 : Mindful Monday ": [
      { name: "Task 1 : Calmness Reset", route: "/Day1Task1"},
      { name: "Task 2: Expressing Gratitude", route: "/Day1Task2"},
      { name: "Task 3: Time management", route: "/Day1Task3"},
    ],
    
     "Day 2 : Movement Tuesday": [
      {name: "Task 1: Steps Counter", route: "/Day2Task1"},
      {name: "Task 2: Jumping Jacks", route: "/Day2Task2"} ,
      {name: "Task 3: Campus Location Checks", route: "/Day2Task3"},
    ],
    
    "Day 3 : H20 Wednesday" : [
      {name: "Task 1: Water Intake Challenge", route: "/Day3Task1"},
      {name: "Task 2: Healthy Liquid Intake", route: "/Day3Task2"},
      {name: "Task 3: Nutrition Check", route: "/Day3Task3"},
    ],
  };

   // Day selection buttons
  const renderDayButtons = () => {
    return Object.keys(wellnessChallenges).map(day => (
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
       (wellnessChallenges[check] || [])
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
      <h1 className='wellness-Text'>Mental Wellness Checks: </h1>
       {selectedCheck.length > 0 && renderTaskButtons().length > 0 ? (
        <div className='buttonsWrapper'>
          {renderTaskButtons()}
        </div>
      ) : (
        <p className='unavailable-Text'>No day selected yet .</p>
      )}
      </div>
      </div>
    </div>
  );
}

export default WellnessPage;