import React, { useState, useEffect } from "react";
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

  const [countdown, setCountdown] = useState(10); 

    useEffect(() => {
    const interval = setInterval(() => {
        setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 60000);

    return () => clearInterval(interval);
    }, []);

  return (
    <div className="campus-page-container">
      <h2 className="campus-summary-title">Campus Engagement</h2>

      <div className="campus-blue-section">
  <h3 className="campus-blue-title">Engagement Graph</h3>

  <div style={{ display: "flex", justifyContent: "right", alignItems: "flex-start" }}>
  <div className="campus-white-box campus-category-section">
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
    <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#77547F" }}>Countdown to June Exams</h3>
  </div>

  <div
    style={{
      height: "70%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      marginTop: "2rem",
    }}
  >
        <div style={{ display: "flex", alignItems: "flex-end", gap: "0.3rem" }}>
        <span
            style={{
            fontSize: "5rem",
            fontWeight: "bold",
            color: "#77547F",
            fontFamily: "Discovery-Font",
            lineHeight: "1",
            }}
        >
            {countdown}
        </span>
        <span
            style={{
            fontSize: "1rem",
            color: "#77547F",
            fontFamily: "Discovery-Font",
            marginBottom: "0.5rem",
            }}
        >
            days
        </span>
        </div>

  </div>
</div>


    <div style={{ minWidth: "300px", marginLeft: "2rem" }}>
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
