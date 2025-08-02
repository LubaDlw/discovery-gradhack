import React, { useState } from "react";
import woolworthsIcon from '../assets/Woolworths.png';
import clicksIcon from '../assets/Clicks.png';
import checkersIcon from '../assets/Checkers.png';
import babyIcon from '../assets/baby.png';
import '../styles/HealthyLivingRewards.css';

const icons = [
  { src: woolworthsIcon, alt: "Woolworths", description: "Shop at Woolworths for healthy groceries." },
  { src: clicksIcon, alt: "Clicks", description: "Get wellness products at Clicks." },
  { src: checkersIcon, alt: "Checkers", description: "Fresh food and groceries from Checkers." },
  { src: babyIcon, alt: "Baby", description: "Baby essentials and care products." },
];

function HealthyLivingRewards() {
  const [selectedIndex, setSelectedIndex] = useState(null);

  return (
    <div className="healthy-living-container-wrapper">
      <div className="healthy-living-container">
        <div className="icons-row">
          {icons.map(({ src, alt }, index) => (
            <div
              className={`icon-wrapper ${selectedIndex === index ? "selected" : ""}`}
              key={index}
              onClick={() => setSelectedIndex(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedIndex(index); }}
            >
              <img src={src} alt={alt} />
            </div>
          ))}
        </div>
      </div>

      {/* Description outside the scroll container */}
      <div className="description-box">
        {selectedIndex !== null ? (
          <p>{icons[selectedIndex].description}</p>
        ) : (
          <p>Click an icon to see details here.</p>
        )}
      </div>
    </div>
  );
}

export default HealthyLivingRewards;
