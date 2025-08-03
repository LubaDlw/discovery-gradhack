import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import "../styles/carousel.css";

import runIcon from '../assets/run.png';  
import financeIcon from '../assets/FinanceEd.png';  
import lotusIcon from '../assets/lotus.png';  

export default function StackedChallengeCarousel({ steps }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const goalReached = steps >= 13000;

  const challenges = [
    {
      name: "Walk Challenge",
      icon: runIcon,
      progress: `${Math.floor(steps).toLocaleString()} / 13 000 steps`,
    },
    {
      name: "Finance for Dummies",
      icon: financeIcon,
      progress: "3 / 5 quizzes",
    },
    {
      name: "Mindfulness",
      icon: lotusIcon,
      progress: "15min / 45min completed",
    },
  ];

  const next = () => {
    if (!goalReached) {
      setActiveIndex((prev) => (prev + 1) % challenges.length);
    }
  };

  const prev = () => {
    if (!goalReached) {
      setActiveIndex((prev) => (prev - 1 + challenges.length) % challenges.length);
    }
  };

  return (
    <div className="relative w-full mt-12 px-6 flex flex-col items-center">
      <h2
        className="relative"
        style={{
          color: "#565e9a",
          width: "100%",
          marginTop: "2rem",
          paddingLeft: "1.5rem",
          fontFamily: "Custom, sans-serif",
          fontSize: "24px",
          textAlign: "left",
          letterSpacing: "2px"
        }}
      >
        Active challenges
      </h2>

      <div
        style={{
          backgroundColor: goalReached ? "#FFD700" : "#B491C8", 
          borderRadius: "20px",
          padding: "30px",
          marginTop: "1rem",
          boxShadow: "0 4px 15px rgba(0, 0, 0.3, 0.3)"
        }}
      >
        <div className="relative w-[300px] h-[320px]">
          {challenges.map((challenge, i) => {
            const offset = i - activeIndex;
            const isActive = i === activeIndex;

            return (
              <div
                key={i}
                className={`absolute w-full h-full transition-all duration-500 ease-in-out
                  ${isActive ? "z-20 scale-100 opacity-100" : "z-10 scale-90 opacity-40"}
                `}
                style={{
                  transform: `translateX(${offset * 110}%)`,
                  pointerEvents: goalReached ? "none" : "auto", 
                }}
              >
                <div
                  className="rounded-2xl shadow-xl p-6 flex flex-col items-center justify-between h-full"
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  <h3 className="challenge-text"
                    style={{
                      color: "#64497e",
                      fontFamily: "Custom, sans-serif",
                      fontSize: "18px",
                      textAlign: "left",
                      letterSpacing: "1px"
                    }}
                  >
                    {challenge.name}
                  </h3>
                  <img
                    src={challenge.icon}
                    alt={`${challenge.name} icon`}
                    style={{ width: "150px", height: "150px" }}
                    className="object-contain my-6"
                  />
                  <p className="text-sm"
                    style={{
                      fontFamily: "Custom, sans-serif",
                      fontSize: "15px",
                      textAlign: "left",
                    }}>
                    {challenge.progress}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Carousel buttons - disabled visually and functionally */}
          <button
            onClick={prev}
            className="absolute left-[-50px] top-1/2 -translate-y-1/2 bg-white shadow rounded-full p-2 z-30"
            disabled={goalReached}
            style={{ opacity: goalReached ? 0.5 : 1, cursor: goalReached ? "not-allowed" : "pointer" }}
          >
            <ChevronLeft />
          </button>
          <button
            onClick={next}
            className="absolute right-[-50px] top-1/2 -translate-y-1/2 bg-white shadow-2xl rounded-full p-2 z-30"
            disabled={goalReached}
            style={{ opacity: goalReached ? 0.5 : 1, cursor: goalReached ? "not-allowed" : "pointer" }}
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}
