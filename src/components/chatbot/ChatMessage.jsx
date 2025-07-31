import React from 'react';

const ChatMessage = ({ message }) => {
  const isUser = message.sender === 'user';
  
  return (
    <div className={`message flex ${isUser ? 'justify-end' : 'items-start space-x-3'}`}>
      <div className={`p-3 rounded-lg max-w-[80%] whitespace-pre-wrap ${
        isUser 
          ? 'bg-blue-600 text-white rounded-br-none' 
          : 'bg-blue-200 text-blue-800 rounded-tl-none'
      }`}>
        {message.text}
      </div>
    </div>
  );
};

export default ChatMessage;