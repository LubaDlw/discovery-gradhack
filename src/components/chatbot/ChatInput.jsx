import React from 'react';
import { Send } from 'lucide-react';

const ChatInput = ({ inputValue, setInputValue, onSend, isLoading }) => {
  const handleSubmit = () => {
    const message = inputValue.trim();
    if (message && !isLoading) {
      onSend(message);
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="p-4 sm:p-5 border-t border-gray-200 bg-gray-50 flex items-center space-x-3">
      <input 
        type="text" 
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type your message..."
        disabled={isLoading}
        className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
      />
      <button 
        onClick={handleSubmit}
        disabled={isLoading || !inputValue.trim()}
        className="bg-purple-700 text-white p-3 rounded-lg hover:bg-purple-800 transition duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ChatInput;