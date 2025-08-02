// src/components/chatbot/ChatInput.jsx

import React from 'react';
import { Send, Mic, StopCircle } from 'lucide-react'; // Import icons
// REMOVED: import '../../styles/ChatInput.css'; // This line remains removed

const ChatInput = ({
    inputValue,
    setInputValue,
    onSend,
    isLoading,
    onStartRecording,
    onStopRecording,
    isRecording,
    selectedLanguageCode // New prop: current selected language code
}) => {
    const handleSend = () => {
        if (inputValue.trim() && !isLoading) {
            onSend(inputValue);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { // Allow Shift+Enter for new line
            e.preventDefault(); // Prevent default Enter behavior (new line)
            handleSend();
        }
    };

    const isEnglishSelected = selectedLanguageCode === 'en-ZA';
    const showMicButton = isEnglishSelected; // Only show mic button if English is selected

    return (
        <div className="chat-input-container">
            <textarea
                className="chat-textarea" // Corrected class name
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isLoading ? "Thinking..." : "Type your message or click mic to speak..."}
                disabled={isLoading}
                rows={1} // Start with one row
            />
            {showMicButton ? ( // Conditionally render mic/stop button
                isRecording ? (
                    <button
                        className="chat-input-mic-button recording" // Corrected class name and added 'recording'
                        onClick={onStopRecording}
                        disabled={isLoading}
                        title="Stop Recording"
                    >
                        <StopCircle size={20} />
                    </button>
                ) : (
                    <button
                        className="chat-input-mic-button idle" // Corrected class name and added 'idle'
                        onClick={onStartRecording}
                        disabled={isLoading}
                        title="Start Recording"
                    >
                        <Mic size={20} />
                    </button>
                )
            ) : null} {/* Render nothing if mic button should not be shown */}
            <button
                className={`chat-send-button ${inputValue.trim() && !isLoading ? 'active' : 'disabled'}`} // Corrected class name and added active/disabled states
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                title="Send Message"
            >
                <Send size={20} />
            </button>
        </div>
    );
};

export default ChatInput;