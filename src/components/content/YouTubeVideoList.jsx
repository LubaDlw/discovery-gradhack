// src/components/content/YouTubeVideoList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import '../../styles/ContentComponents.css';

const YouTubeVideoList = ({ topic, regionCode = 'ZA', maxResults = 8 }) => {
    const [videos, setVideos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchYouTubeVideos = async () => {
            setIsLoading(true);
            setError(null);
            setVideos([]);

            let searchQuery = topic;
            switch (topic) {
                case 'Wellness':
                    searchQuery = `wellness tips ${regionCode} health`;
                    break;
                case 'Finance':
                    searchQuery = `personal finance ${regionCode} money management`;
                    break;
                case 'Health':
                    searchQuery = `healthy lifestyle ${regionCode} fitness`;
                    break;
                case 'Youth Corner':
                    searchQuery = `South African youth career advice OR South Africa educational podcasts for students OR day in the life software engineer SA`;
                    break;
                default:
                    searchQuery = `${topic} ${regionCode}`;
            }

            try {
                const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
                if (!apiKey) {
                    throw new Error("YouTube API Key not found. Please set VITE_YOUTUBE_API_KEY in your .env file.");
                }

                const response = await fetch(
                    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&regionCode=${regionCode}&maxResults=${maxResults}&key=${apiKey}`
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`YouTube API error: ${errorData.error.message || response.statusText}`);
                }

                const data = await response.json();
                const fetchedVideos = data.items.filter(item => item.id.videoId);
                setVideos(fetchedVideos);

            } catch (err) {
                console.error("Failed to fetch YouTube videos:", err);
                setError(err.message || "Failed to load videos. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchYouTubeVideos();
    }, [topic, regionCode, maxResults]);

    const handleVideoClick = (videoId) => {
        navigate(`/play-video/${videoId}`);
    };

    if (isLoading) {
        return <div className="video-list-loading">Loading {topic} videos...</div>;
    }

    if (error) {
        return <div className="video-list-error">Error: {error}</div>;
    }

    if (videos.length === 0) {
        return <div className="video-list-empty">No {topic} videos found.</div>;
    }

    return (
        <div className="youtube-video-list-container">
            <h2 className="youtube-video-list-title">{topic} Videos</h2>
            <div className="videos-scroll-wrapper">
                {videos.map((video) => (
                    <div
                        key={video.id.videoId}
                        className="video-card"
                        onClick={() => handleVideoClick(video.id.videoId)}
                    >
                        <div className="video-thumbnail-wrapper">
                            <img
                                src={video.snippet.thumbnails.medium.url}
                                alt={video.snippet.title}
                                className="video-thumbnail"
                            />
                            <div className="play-overlay">
                                <Play size={40} color="white" fill="white" />
                            </div>
                        </div>
                        <h3 className="video-title">{video.snippet.title}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default YouTubeVideoList;