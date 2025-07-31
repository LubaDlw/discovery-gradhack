import React, { useState, useEffect } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { GeminiService } from '../../services/geminiService';
import { FirebaseService } from '../../services/firebaseService';
import { INITIAL_CHAT_HISTORY, WELCOME_MESSAGE } from '../../utils/constants';

const DumiChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [chatHistory, setChatHistory] = useState(INITIAL_CHAT_HISTORY);

  // Initialize Firebase and welcome message
  useEffect(() => {
    // Initialize Firebase (when ready)
    FirebaseService.initialize()
      .then((auth) => {
        if (auth) {
          FirebaseService.onAuthStateChanged((user) => {
            if (user) {
              setUserId(user.uid);
              console.log("User is signed in:", user.uid);
            } else {
              setUserId(null);
              console.log("No user is signed in.");
            }
          });
        }
      })
      .catch((error) => {
        console.error("Firebase initialization failed:", error);
      });

    // Set welcome message
    setMessages([
      {
        id: 1,
        sender: 'bot',
        text: WELCOME_MESSAGE,
        timestamp: new Date()
      }
    ]);
  }, []);

  const sendMessage = async (message) => {
    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'user',
      text: message,
      timestamp: new Date()
    }]);

    setIsLoading(true);

    try {
      // Update chat history with user message
      const newChatHistory = [...chatHistory, { role: "user", parts: [{ text: message }] }];
      setChatHistory(newChatHistory);

      // Get response from Gemini
      const botResponse = await GeminiService.sendMessage(newChatHistory);
      
      // Add bot response
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: botResponse,
        timestamp: new Date()
      }]);

      // Update chat history with bot response
      setChatHistory([...newChatHistory, { role: "model", parts: [{ text: botResponse }] }]);

    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: `Oops! Something went wrong: ${error.message}. Please try again.`,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl flex flex-col w-full max-w-lg h-[90vh] sm:h-[80vh] md:h-[70vh] overflow-hidden">
      <ChatHeader />
      <ChatMessages messages={messages} isLoading={isLoading} />
      <ChatInput 
        inputValue={inputValue}
        setInputValue={setInputValue}
        onSend={sendMessage}
        isLoading={isLoading}
      />
      
      {/* User ID Display (when Firebase is enabled) */}
      {userId && (
        <div className="text-xs text-gray-500 text-center py-2 border-t border-gray-200 bg-gray-50">
          User ID: {userId}
        </div>
      )}
    </div>
  );
};

export default DumiChatbot;