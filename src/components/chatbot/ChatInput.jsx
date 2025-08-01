import React from 'react';

const ChatInput = ({
    inputValue,
    setInputValue,
    onSend,
    isLoading,
    onStartRecording,
    onStopRecording,
    isRecording
}) => {
    const handleSendMessage = () => {
        if (inputValue.trim() && !isLoading) {
            onSend(inputValue);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
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
        <div className="chat-input-container"> {/* Apply new CSS class */}
            {/* Microphone Button */}
            <button
                onClick={handleMicButtonClick}
                className={`chat-input-mic-button ${isRecording ? 'recording' : 'idle'}`}
                disabled={isLoading}
                aria-label={isRecording ? "Stop Recording" : "Start Recording"}
            >
                {isRecording ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0 5 5 0 01-5 5.93V10a1 1 0 10-2 0v3.93A7.001 7.001 0 003 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17a1 1 0 102 0v-2.07z" clipRule="evenodd"></path></svg>
                ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0 5 5 0 01-5 5.93V10a1 1 0 10-2 0v3.93A7.001 7.001 0 003 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17a1 1 0 102 0v-2.07z" clipRule="evenodd"></path></svg>
                )}
            </button>

            {/* Textarea for input */}
            <textarea
                className="chat-textarea" // Apply new CSS class
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isRecording ? "Listening..." : "Type your message..."}
                rows="1"
                disabled={isLoading || isRecording}
            />

            {/* Send Button */}
            <button
                onClick={handleSendMessage}
                className={`chat-send-button ${inputValue.trim() && !isLoading ? 'active' : 'disabled'}`}
                disabled={!inputValue.trim() || isLoading || isRecording}
            >
                Send
            </button>
        </div>
    );
};

export default ChatInput;