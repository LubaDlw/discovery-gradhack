import React from 'react';
import { Bot } from 'lucide-react';

const ChatHeader = () => (
  <div className="bg-purple-700 text-white p-4 sm:p-5 rounded-t-xl flex items-center justify-between shadow-md">
    <h1 className="text-2xl font-bold">Dumi AI Chatbot</h1>
    <Bot className="w-8 h-8" />
  </div>
);

export default ChatHeader;