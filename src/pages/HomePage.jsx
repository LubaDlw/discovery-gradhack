import React, { useEffect, useState, useRef } from "react";

import "../styles/Home.css";
import stepsIcon from '../assets/run grey.png';
import financeIcon from '../assets/finance.png';  
import campusIcon from '../assets/academics.png';   
import wellnessIcon from '../assets/mindfulness.png';  
import DonutProgress from '../components/DonutProgress';
import MultiRingProgress from "../components/MultiRingProgress";
import useSimulatedSteps from "../hooks/useSimulatedSteps";
import HealthyLivingRewards from '../components/HealthyLivingRewards';
import upNextImg from '../assets/upnext.png'; 
import infoIcon from '../assets/info-icon.png'; 
import UniversityLineGraph from "../components/UniversityLineGraph";
import StackedChallengeCarousel from "../components/StackedChallengeCarousel";
import { color } from "d3";

function HomePage() {
  const [steps, manuallyAddSteps] = useSimulatedSteps();
  const [showInfo, setShowInfo] = useState(false);
  const [showLeaderboardInfo, setShowLeaderboardInfo] = useState(false);
  const [activeEvent, setActiveEvent] = useState(null);

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
        <h5 className="purple-title">University focused</h5>
        <div className="inner-boxes">
          <div className="inner-box left-box">
            <h4>HealthyLiving rewards</h4>
            <HealthyLivingRewards />
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
                <button
                  onClick={() => manuallyAddSteps(10000)}
                  style={{
                    marginTop: "10px",
                    padding: "4px 8px",
                    fontSize: "0.7rem",
                    backgroundColor: "#e0e0e0",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  +10,000 steps
                </button>

              </div>
              
            </div>
          </div>
        </div>

        <div
          className="block-row"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "20px",
          }}
        >
          {/* Up Next Week */}
          <div className="card-container" style={{ marginLeft: "40px" }}>
            <p className="card-title">Up next week:</p>
            <div className="card-image-container">
              <img src={upNextImg} alt="Up next" className="card-image" />
            </div>
            <img
              src={infoIcon} 
              alt="Info"
              className="info-icon-container"
              onClick={() => setShowInfo(!showInfo)}
            />

            {showInfo && (
              <div className="info-popup right-aligned">
                <p>Next week’s challenge is about academic participation. Stay engaged!</p>
              </div>
            )}
          </div>

          {/* Leaderboard */}
          <div className="card-container" style={{ maxWidth: "670px", flex: 1 }}>
          <div className="card-header">
            <p className="card-title">Leaderboard</p>
            <img
              src={infoIcon}
              alt="Info"
              className="info-icon"
              onClick={() => setShowLeaderboardInfo(!showLeaderboardInfo)}
            />
          </div>

          <UniversityLineGraph activeEvent={activeEvent} />

          {/* Event filter buttons */}
          <div className="event-button-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
            {[...Array(8)].map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveEvent(i + 1)}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: activeEvent === i + 1 ? "#75517A" : "#e0e0e0",
                  color: activeEvent === i + 1 ? "#fff" : "#000",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                Event {i + 1}
              </button>
            ))}
            {/* Clear filter button */}
            <button
              onClick={() => setActiveEvent(null)}
              style={{
                gridColumn: "span 4",
                padding: "0.5rem 1rem",
                marginTop: "0.5rem",
                backgroundColor: "#ccc",
                color: "#000",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              Show All Events
            </button>
          </div>

            {showLeaderboardInfo && (
              <div className="info-popup right-aligned">
                <p>Leaderboard shows top performers in wellness activities this week.</p>
              </div>
            )}
          </div>
        </div>

      </div>
      <StackedChallengeCarousel steps={steps} />
    </div>
  );
}

export default HomePage;

