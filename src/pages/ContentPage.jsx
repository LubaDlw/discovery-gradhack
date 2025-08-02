// src/pages/ContentPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import YouTubeVideoList from '../components/content/YouTubeVideoList';
import '../../styles/ContentPage.css'; // This CSS file will be for the overall content layout

const ContentPage = () => {
    return (
        <div className="content-page-container">
            <h1>Explore Content Topics</h1>
            <p>Dive into various educational topics related to your well-being and future.</p>

            <div className="topic-sections">
                <YouTubeVideoList topic="Wellness" />
                <YouTubeVideoList topic="Finance" />
                <YouTubeVideoList topic="Health" />
                <YouTubeVideoList topic="Youth Corner" />
                {/* You can add more topics as needed */}
            </div>

            <div className="back-to-home-link">
                <Link to="/">Back to Home (Chatbot)</Link>
            </div>
        </div>
    );
};

export default ContentPage;