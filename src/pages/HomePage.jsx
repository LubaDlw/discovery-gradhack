import React from "react";
import "../styles/Home.css";
import stepsIcon from '../assets/run grey.png';
import useSimulatedSteps from "../hooks/useSimulatedSteps"; // 👈 Import the hook

function HomePage() {
  const steps = useSimulatedSteps(); // 👈 Call the hook

  return (
    <div className="home-container">
      <h2 className="summary-title">Vitality Score Summary</h2>

      <div className="top-section">
        <div className="white-box reward-sections">
          <h3>Reward Sections</h3>
        </div>
        <div className="white-box vitality-awards">
          <h3>Vitality Student Awards</h3>
        </div>
      </div>

      <div className="purple-section">
        <h3 className="purple-title">University focused</h3>
        <div className="inner-boxes">
          <div className="inner-box left-box">
            <h4>HealthyLiving rewards</h4>
          </div>
          <div className="inner-box right-box">
            <h4>Ongoing challenges</h4>

            <div className="challenge-card">
              <div className="challenge-icon-wrapper">
                <img src={stepsIcon} alt="Steps Icon" />
              </div>

              <div className="challenge-text-wrapper">
                <div className="challenge-main-text">Walk challenge</div>
                <div className="challenge-steps">
                  {steps.toLocaleString()} / 13 000 steps
                </div>
                <div className="challenge-description">
                  Walk 13,000 steps a day to stay on track and earn rewards!
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;

