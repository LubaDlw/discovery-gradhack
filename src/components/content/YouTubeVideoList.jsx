// src/components/content/YouTubeVideoList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react'; // Only Play icon is needed now
import { LOCAL_VIDEO_DATA } from '../../utils/videoConstants'; // Import local video data
import '../../styles/ContentComponents.css'; // Ensure this CSS file exists and is correctly linked

const YouTubeVideoList = ({ topic }) => {
    const navigate = useNavigate();
    const [filteredVideos, setFilteredVideos] = useState([]);

    useEffect(() => {
        // Filter videos from local data based on the provided topic
        const videosForTopic = LOCAL_VIDEO_DATA.filter(video => video.theme === topic);
        setFilteredVideos(videosForTopic);
    }, [topic]); // Re-filter when the topic prop changes

    const handleVideoClick = (youtubeId) => {
        // Navigate to the VideoPlayerPage with the YouTube ID
        navigate(`/play-video/${youtubeId}`);
    };

    if (filteredVideos.length === 0) {
        return <div className="video-list-empty">No {topic} videos found.</div>;
    }

    return (
        <div className="youtube-video-list-container">
            <h2 className="youtube-video-list-title">{topic} Videos</h2>
            {/* This div will now be natively scrollable using CSS */}
            <div className="videos-scroll-wrapper">
                {filteredVideos.map((video) => (
                    <div
                        key={video.id} // Use local ID for React key
                        className="video-card"
                        onClick={() => handleVideoClick(video.youtubeId)} // Use YouTube ID for navigation
                    >
                        <div className="video-thumbnail-wrapper">
                            <img
                                src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`} // YouTube thumbnail URL
                                alt={video.title}
                                className="video-thumbnail"
                            />
                            <div className="play-overlay">
                                <Play size={40} color="white" fill="white" />
                            </div>
                        </div>
                        <h3 className="video-title">{video.title}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default YouTubeVideoList;