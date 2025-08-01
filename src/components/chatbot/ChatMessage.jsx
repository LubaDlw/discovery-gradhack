// src/components/chatbot/ChatMessage.jsx
import React from 'react';

const ChatMessage = ({ message }) => {
  const isUser = message.sender === 'user';
  
  return (
    <div className={`message flex ${isUser ? 'justify-end' : 'items-start'}`}>
      <div className={`p-3 rounded-lg max-w-[80%] whitespace-pre-wrap text-base break-words ${
        isUser 
          ? 'bg-purple-700 text-white rounded-br-none shadow-md ml-auto' // Added ml-auto here
          : 'bg-gray-100 text-gray-800 rounded-tl-none shadow-sm' 
      }`}>
        {message.text}
      </div>
    </div>
  );
};

export default ChatMessage;