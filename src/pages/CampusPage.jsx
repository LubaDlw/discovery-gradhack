import React, { useState } from "react";
import "../styles/Campus.css";
import BubbleChart from "../components/BubbleChart";
import YouTubeVideoList from "../components/content/YouTubeVideoList";

function CampusPage() {
  const [categories, setCategories] = useState([
    { name: "CAMPUS EVENTS", value: 5 },
    { name: "STUDY SESSIONS", value: 6 },
    { name: "LIBRARY VISITS", value: 5 },
    { name: "VARSITY CUPS", value: 7 },
    { name: "WORKSHOPS", value: 4 },
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

        {/* Flex container to separate left space and graph on right */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "right" }}>
          <div style={{ flex: 2}}></div> 

          <div style={{ flex: 1, minWidth: "200px", backgroundColor: "#32436F", padding: "0.1rem" }}>
            <BubbleChart data={categories} />
          </div>
        </div>

        <div
          style={{
            marginTop: "1rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            justifyContent: "right",
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

      <div className="Youtube-list">
        <YouTubeVideoList topic="Student Corner" />
      </div>
    </div>
  );
}

export default CampusPage;
