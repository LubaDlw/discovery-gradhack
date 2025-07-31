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
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-gray-50 chat-scroll">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      
      {isLoading && <LoadingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;