// src/pages/VideoPlayerPage.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './../styles/ContentComponents.css';

const VideoPlayerPage = () => {
    const { videoId } = useParams();
    const navigate = useNavigate();

    const handleBackClick = () => {
        navigate(-1); // Go back to the previous page in history
    };

    if (!videoId) {
        return (
            <div className="video-player-container">
                <p>No video ID provided.</p>
                <button onClick={handleBackClick} className="back-button">Go Back</button>
            </div>
        );
    }

    return (
        <div className="video-player-container">
            <button onClick={handleBackClick} className="back-button">← Back to Content</button>
            <h1 className="video-player-title">Now Playing</h1>
            <div className="video-player-iframe-wrapper">
                <iframe
                    title="YouTube Video Player"
                    className="youtube-iframe"
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
        </div>
    );
};

export default VideoPlayerPage;