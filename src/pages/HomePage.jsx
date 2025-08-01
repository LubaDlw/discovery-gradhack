import React from "react";
import "../styles/Home.css";
import stepsIcon from '../assets/run grey.png';
import financeIcon from '../assets/finance.png';  
import campusIcon from '../assets/academics.png';   
import wellnessIcon from '../assets/mindfulness.png';  
import DonutProgress from '../components/DonutProgress';
import MultiRingProgress from "../components/MultiRingProgress";
import useSimulatedSteps from "../hooks/useSimulatedSteps";


function HomePage() {
  const steps = useSimulatedSteps();

  // Calculate wellness progress % out of 13000 steps
  const wellnessProgress = Math.min((steps / 13000) * 100, 100);

  // Dummy progress for finance and campus (replace with real data)
  const financeProgress = 75;
  const campusProgress = 40;

  return (
    <div className="home-container">
      <h2 className="summary-title">Vitality Score Summary</h2>

      <div className="top-section">
        <div className="white-box reward-sections">
          <h3>Reward Sections</h3>

          <div className="rewards-icons-container" style={{ display: 'flex', gap: '3rem', justifyContent: 'center' }}>
          {/* Finance */}
          <div style={{ position: 'relative', width: 120, height: 120 }}>
            <DonutProgress progress={financeProgress} size={120} strokeWidth={10} color="#4856B9"/>
            <img src={financeIcon} alt="Finance" style={{ position: 'absolute', top: 20, left: 20, width: 80, height: 80 }} />
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>Finance</div>
          </div>

          {/* Wellness */}
          <div style={{ position: 'relative', width: 120, height: 120 }}>
            <DonutProgress progress={wellnessProgress} size={120} strokeWidth={10} color="#75517A"/>
            <img src={wellnessIcon} alt="Wellness" style={{ position: 'absolute', top: 20, left: 20, width: 80, height: 80 }} />
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>Wellness</div>
          </div>

          {/* Campus */}
          <div style={{ position: 'relative', width: 120, height: 120 }}>
            <DonutProgress progress={campusProgress} size={120} strokeWidth={10} color="#BF5BCD" />
            <img src={campusIcon} alt="Campus" style={{ position: 'absolute', top: 20, left: 20, width: 80, height: 80 }} />
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>Campus</div>
          </div>
        </div>

       </div>
       <div className="white-box vitality-awards">
          <h3>Vitality Student Awards</h3>
          <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
            <MultiRingProgress
              financeProgress={financeProgress}
              wellnessProgress={wellnessProgress}
              campusProgress={campusProgress}
            />
          </div>
        </div>
      </div>

      <div className="purple-section">
        <h3 className="purple-title">University focused</h3>
        <div className="inner-boxes">
          <div className="inner-box left-box">
            <h4>HealthyLiving rewards</h4>
          </div>
          <div className="inner-box right-box">
            <h4>Challenges</h4>

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
                  Complete the recommended steps to qualify for this week’s gameboard.
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

