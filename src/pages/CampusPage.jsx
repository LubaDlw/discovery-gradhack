import React from "react";
//import "../styles/CampusPage.css";
import YouTubeVideoList from '../components/content/YouTubeVideoList';

function CampusPage() {
  return (
    <div>
      <h1>Welcome to the Campus Page!</h1>

      <YouTubeVideoList topic="Student Corner" />
    </div>
  );
}

export default CampusPage;