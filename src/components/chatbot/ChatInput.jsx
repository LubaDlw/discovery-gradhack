import React from 'react';

const ChatInput = ({ 
  inputValue, 
  setInputValue, 
  onSend, 
  isLoading,
  onStartRecording, // New prop
  onStopRecording,  // New prop
  isRecording       // New prop
}) => {
  const handleSendMessage = () => {
    if (inputValue.trim() && !isLoading) {
      onSend(inputValue);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { // Allow shift+enter for new line
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMicButtonClick = () => {
    if (isRecording) {
      onStopRecording();
    } else {
      onStartRecording();
    }
  };

  return (
    <div className="p-4 bg-white border-t border-gray-200 flex items-center gap-2">
      {/* Microphone Button */}
      <button
        onClick={handleMicButtonClick}
        className={`p-2 rounded-full transition-colors duration-200
          ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        disabled={isLoading} // Disable while loading/processing
        aria-label={isRecording ? "Stop Recording" : "Start Recording"}
      >
        {/* Replace with a proper mic icon (e.g., from Heroicons, Font Awesome) */}
        {isRecording ? (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0 5 5 0 01-5 5.93V10a1 1 0 10-2 0v3.93A7.001 7.001 0 003 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17a1 1 0 102 0v-2.07z" clipRule="evenodd"></path></svg>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0 5 5 0 01-5 5.93V10a1 1 0 10-2 0v3.93A7.001 7.001 0 003 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17a1 1 0 102 0v-2.07z" clipRule="evenodd"></path></svg>
        )}
      </button>

      {/* Textarea for input */}
      <textarea
        className="flex-grow p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-10 overflow-hidden"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={isRecording ? "Listening..." : "Type your message..."}
        rows="1" // Start with one row
        style={{ height: 'auto', minHeight: '40px' }} // Auto-adjust height
        disabled={isLoading || isRecording} // Disable text input while loading or recording
      />

      {/* Send Button */}
      <button
        onClick={handleSendMessage}
        className={`px-4 py-2 rounded-lg text-white font-semibold transition-colors duration-200
          ${inputValue.trim() && !isLoading ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-400 cursor-not-allowed'}
        `}
        disabled={!inputValue.trim() || isLoading || isRecording} // Disable if empty, loading, or recording
      >
        Send
      </button>
    </div>
  );
};

export default ChatInput;