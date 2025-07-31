import React from 'react';
import DumiChatbot from '../components/chatbot/DumiChatbot';

const ChatPage = () => {
  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-[calc(100vh-4rem)] font-inter p-4 sm:p-6 md:p-8">
      <DumiChatbot />
    </div>
  );
};

export default ChatPage;