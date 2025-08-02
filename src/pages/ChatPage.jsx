import React from 'react';
import DumiChatbot from '../components/chatbot/DumiChatbot';
import '../styles/Chatbot.css'; // Ensure Chatbot.css is imported here or in your main App.jsx
import YouTubeVideoList from '../components/content/YouTubeVideoList';

const ChatPage = () => {
    return (
        <div className="bg-gray-100 flex items-center justify-center min-h-screen font-inter p-4 sm:p-6 md:p-8">
            {/* The DumiChatbot now contains its own max-width and responsiveness */}
            <DumiChatbot />
             <YouTubeVideoList topic="Youth Corner" />
        </div>
        
     
    );
};


export default ChatPage;