import React, { useState } from "react";
import "../styles/campus.css";
import BubbleChart from "../components/BubbleChart";
import YouTubeVideoList from "../components/content/YouTubeVideoList";

function CampusPage() {
  const [categories, setCategories] = useState([
    { name: "Events Attended", value: 3 },
    { name: "Group Study Sessions", value: 2 },
    { name: "Library Visits", value: 4 },
    { name: "Clubs Participated", value: 1 },
    { name: "Workshops Completed", value: 2 },
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
      <h2 className="campus-summary-title">Campus Engagement Overview</h2>

      <div className="campus-top-section">
        <div className="campus-white-box campus-category-section">
          <h3>Academic Focus Areas</h3>
          <div className="campus-icons-container">
            {/* Optional visual elements here */}
          </div>
        </div>
      </div>

      <div className="campus-blue-section">
        <h3 className="campus-blue-title">Engagement Bubble Graph</h3>
        <div
          className="campus-card-container"
          style={{ maxWidth: "800px", margin: "0 auto" }}
        >
          <BubbleChart data={categories} />
          <div
            style={{
              marginTop: "1rem",
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              justifyContent: "center",
            }}
          >
            {categories.map((cat, i) => (
              <button
                key={cat.name}
                onClick={() => increment(i)}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#3A2F70",
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

      <div>
        <h1>Welcome to the Campus Page!</h1>
        <YouTubeVideoList topic="Student Corner" />
      </div>
    </div>
  );
}

export default CampusPage;
