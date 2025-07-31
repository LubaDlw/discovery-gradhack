import React, { useState, useEffect, useRef } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput'; // We will modify ChatInput to include a mic button
import { GeminiService } from '../../services/geminiService';
import { FirebaseService } from '../../services/firebaseService';
import { INITIAL_CHAT_HISTORY, WELCOME_MESSAGE } from '../../utils/constants';

// Base URL for your backend server
// IMPORTANT: Change this to your actual backend URL when deploying!
const BACKEND_URL = 'http://localhost:5000'; 

const DumiChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [chatHistory, setChatHistory] = useState(INITIAL_CHAT_HISTORY);

  // State for voice interaction
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null); // Ref for the HTML Audio element

  // Initialize Firebase and welcome message
  useEffect(() => {
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

    setMessages([
      {
        id: 1,
        sender: 'bot',
        text: WELCOME_MESSAGE,
        timestamp: new Date()
      }
    ]);

    // Initialize audio player
    audioPlayerRef.current = new Audio();
    // Optional: Add event listener to know when bot speaking finishes
    audioPlayerRef.current.onended = () => {
      // Could add logic here to enable another recording, or show "bot finished speaking" state
      console.log("Bot finished speaking.");
    };

    // Clean up audio player on component unmount
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.src = '';
      }
    };

  }, []); // Empty dependency array means this runs once on mount

  // Function to start recording audio
  const startRecording = async () => {
    // Stop any currently playing bot audio if recording starts
    if (audioPlayerRef.current && !audioPlayerRef.current.paused) {
        audioPlayerRef.current.pause();
    }

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Check for 'audio/webm;codecs=opus' support
      // This is a common and efficient format that Google Cloud STT supports (WEBM_OPUS encoding)
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm'; // Fallback if opus is not supported

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = []; // Clear previous chunks

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        setIsLoading(true); // Indicate loading while transcribing
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await sendAudioForTranscription(audioBlob);
        audioChunksRef.current = []; // Clear chunks after sending
        // setIsLoading(false); // isLoading will be set by sendMessage or playBotResponseAudio
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      console.log("Recording started...");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check your browser permissions. (" + error.name + ": " + error.message + ")");
    }
  };

  // Function to stop recording audio
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      // Access to microphone stream might need to be stopped explicitly to release resources
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      console.log("Recording stopped.");
    }
  };

  // Function to send recorded audio to backend for transcription
  const sendAudioForTranscription = async (audioBlob) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob); // Convert Blob to Data URL (base64 string)

      reader.onloadend = async () => {
        const base64Audio = reader.result.split(',')[1]; // Get the base64 part
        
        console.log("Sending audio for transcription...");
        const response = await fetch(`${BACKEND_URL}/api/speech-to-text`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ audio: base64Audio }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Backend STT error: ${errorData.error || response.statusText}`);
        }

        const data = await response.json();
        const transcribedText = data.transcription;

        if (transcribedText) {
          console.log("Transcribed:", transcribedText);
          // Automatically send the transcribed text to the chatbot
          // This will call your existing sendMessage function
          await sendMessage(transcribedText); 
          setInputValue(''); // Clear input after sending
        } else {
          // Handle cases where no speech was detected
          console.log("No speech detected.");
          setIsLoading(false); // Stop loading if nothing was transcribed
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            sender: 'bot',
            text: "I didn't catch that. Could you please try speaking again?",
            timestamp: new Date()
          }]);
        }
      };
      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        setIsLoading(false);
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'bot',
          text: "There was an issue processing your audio. Please try typing.",
          timestamp: new Date()
        }]);
      };
    } catch (error) {
      console.error("Error sending audio for transcription:", error);
      setIsLoading(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: `Error transcribing: ${error.message}. Please try again.`,
        timestamp: new Date()
      }]);
    }
  };

  // Function to send chatbot's text response to backend for speech synthesis
  const sendTextForSpeechSynthesis = async (text) => {
    try {
      console.log("Sending text for speech synthesis...");
      const response = await fetch(`${BACKEND_URL}/api/text-to-speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Backend TTS error: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      const audioContentBase64 = data.audioContent; // This is the base64 encoded MP3

      if (audioContentBase64) {
        await playAudio(audioContentBase64);
      } else {
        console.warn("No audio content received from TTS.");
      }
    } catch (error) {
      console.error("Error synthesizing speech:", error);
      // Don't block the chat, just log the error and don't play audio
    } finally {
      setIsLoading(false); // Ensure loading is off after TTS attempt
    }
  };

  // Function to play base64 audio
  const playAudio = (base64Audio) => {
    return new Promise((resolve, reject) => {
      if (!audioPlayerRef.current) {
        console.error("Audio player not initialized.");
        return reject("Audio player not initialized.");
      }

      const audioSrc = `data:audio/mp3;base64,${base64Audio}`; // Assuming MP3 from backend
      audioPlayerRef.current.src = audioSrc;

      audioPlayerRef.current.oncanplaythrough = () => {
        audioPlayerRef.current.play().catch(e => {
          console.error("Error playing audio:", e);
          reject(e);
        });
      };
      audioPlayerRef.current.onerror = (e) => {
        console.error("Audio playback error:", e);
        reject(e);
      };
      // For immediate resolve if it's already ready
      if (audioPlayerRef.current.readyState >= 3) { // HAVE_FUTURE_DATA
        audioPlayerRef.current.play().catch(e => {
          console.error("Error playing audio (readyState):", e);
          reject(e);
        });
      }

      // Resolve the promise when audio finishes playing
      audioPlayerRef.current.onended = () => {
        console.log("Audio finished playing.");
        resolve();
      };
    });
  };


  const sendMessage = async (message) => {
    // Prevent sending empty messages
    if (!message.trim() && !isRecording) {
      return; 
    }

    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'user',
      text: message,
      timestamp: new Date()
    }]);
    setInputValue(''); // Clear input after sending text message

    setIsLoading(true);

    try {
      // Update chat history with user message
      const newChatHistory = [...chatHistory, { role: "user", parts: [{ text: message }] }];
      setChatHistory(newChatHistory);

      // Get response from Gemini
      const botResponse = await GeminiService.sendMessage(newChatHistory);
      
      // Add bot response to display
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: botResponse,
        timestamp: new Date()
      }]);

      // Update chat history with bot response
      setChatHistory([...newChatHistory, { role: "model", parts: [{ text: botResponse }] }]);

      // *** New: Play bot response audio ***
      await sendTextForSpeechSynthesis(botResponse);

    } catch (error) {
      console.error("Error sending message or synthesizing speech:", error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: `Oops! Something went wrong: ${error.message}. Please try again.`,
        timestamp: new Date()
      }]);
      setIsLoading(false); // Ensure loading is off on error
    } finally {
      // isLoading is primarily controlled by the TTS completion now,
      // or set to false immediately if TTS fails or isn't used.
      // If you want loading to reflect just the Gemini call, move this inside try/catch blocks
      // For full voice interaction, keep it here or inside playAudio's onended.
      // For now, it will be set by sendTextForSpeechSynthesis's finally block
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
        // New props for voice interaction
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        isRecording={isRecording}
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