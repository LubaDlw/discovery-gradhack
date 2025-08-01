import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import LoadingIndicator from './LoadingIndicator';

const ChatMessages = ({ messages, isLoading }) => {
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    return (
        <div className="chat-messages-container"> {/* Apply the new CSS class */}
            {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
            ))}

            {isLoading && <LoadingIndicator />}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default ChatMessages;