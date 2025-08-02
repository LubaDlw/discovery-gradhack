import React, { useState } from "react";
import "../styles/Campus.css";
import BubbleChart from "../components/BubbleChart";
import YouTubeVideoList from "../components/content/YouTubeVideoList";

function CampusPage() {
  const [categories, setCategories] = useState([
    { name: "CAMPUS EVENTS", value: 2 },
    { name: "STUDY SESSIONS", value: 3 },
    { name: "LIBRARY VISITS", value: 1 },
    { name: "VARSITY CUPS", value: 1 },
    { name: "WORKSHOPS", value: 1 },
  ]);

  const MAX_VALUE = 10;

  const increment = (index) => {
    setCategories((prev) =>
      prev.map((cat, i) =>
        i === index ? { ...cat, value: Math.min(cat.value + 1, MAX_VALUE) } : cat
      )
    );
  };

  return (
    <div className="campus-page-container">
      <h2 className="campus-summary-title">Campus Engagement</h2>

      <div className="campus-top-section">
        <div className="campus-white-box campus-category-section">
          <h3>Academic Focus Areas</h3>
          <div className="campus-icons-container">
            {/* Optional visual elements here */}
          </div>
        </div>
      </div>

      <div className="campus-blue-section">
        <h3 className="campus-blue-title">Engagement Graph</h3>

        <div style={{ display: "flex", justifyContent: "right" }}>
        <div style={{ minWidth: "300px" }}>
            <div style={{ backgroundColor: "#32436F", padding: "0.1rem" }}>
            <BubbleChart data={categories} />
            </div>

            <div
            style={{
                marginTop: "0.3rem",
                display: "grid",
                gridTemplateColumns: "repeat(3, auto)",
                gap: "0.5rem",
                justifyContent: "end",
            }}
            >
            {categories.map((cat, i) => (
                <button
                key={cat.name}
                onClick={() => increment(i)}
                style={{
                    padding: "0.2rem 0.5rem",
                    fontSize: "0.7rem",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: "#1A2D55",
                    color: "white",
                    cursor: "pointer",
                    fontFamily: "Discovery-Font",
                }}
                >
                Add to {cat.name}
                </button>
            ))}
            </div>
        </div>
        </div>

    
      </div>

      <div className="Youtube-list">
        <YouTubeVideoList topic="Student Corner" />
      </div>
    </div>
  );
}

export default CampusPage;
