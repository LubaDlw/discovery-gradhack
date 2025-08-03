import{ useState } from "react";
import { useNavigate } from 'react-router-dom';
import Task1Icon from "../assets/menu_icon.png";
import Moodwheel from "../components/Moodwheel";
//import "../styles/WellnessPage.css";

function WellnessPage() {
  const navigate = useNavigate();
  // 
  const[selectedCheck,setSelectedCheck] = useState([]);


  // Config of what to show under each days challenge
   const wellnessChallenges= {
     "Kinesthetics": [
      {name: "Walking Benefits", route: "/Day2Task1"},
      {name: "Yoga/Pilates ", route: "/Day2Task2"} ,
      {name: "Aerobics", route: "/Day2Task3"},
    ],
    "Liquid Consumption" : [
      {name: "Water Intake Challenge", route: "/Day3Task1"},
      {name: "Healthy Liquid Intake", route: "/Day3Task2"},
      {name: "Nutrition Check", route: "/Day3Task3"},
    ],
     "Mindfull Awareness": [
      { name: "Navigating Academic Pressure", route: "/Day1Task1"},
      { name: "Dealing with Impostor Syndrome", route: "/Day1Task2"},
      { name: "Time management", route: "/Day1Task3"},
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
       <h2 className="heading"> Mental Wellness aspects:</h2>
        {/* Day selection */}
      <div className="day-selector">
        {renderDayButtons()}
      </div>
      <div className='wellness-Container'>
      <div className='wellness-Card'>
      <h1 className='wellness-Text'></h1>
       {selectedCheck.length > 0 && renderTaskButtons().length > 0 ? (
        <div className='buttonsWrapper'>
          {renderTaskButtons()}
        </div>
      ) : (
        <p className='Text'>Please choose a wellness aspect from the options on the side.</p>
      )}
      </div>
      </div>
       {/* Right side - mood wheel */}
        <div className="mood-wheel-section">
          <h3 className="mood-wheel-title">Mood-Based Recommendations</h3>
          <p className="mood-wheel-subtitle">Click on how you're feeling to get personalized wellness tips</p>
          <Moodwheel />
        </div>
    </div>
  );
}

export default WellnessPage;