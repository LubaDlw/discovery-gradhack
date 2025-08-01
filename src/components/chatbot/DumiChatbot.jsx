import React, { useState, useEffect, useRef } from 'react';
import ChatHeader from './ChatHeader'; // We will modify ChatHeader to use a new prop or update its internal styling
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { GeminiService } from '../../services/geminiService';
import { FirebaseService } from '../../services/firebaseService';
import { INITIAL_CHAT_HISTORY, WELCOME_MESSAGE } from '../../utils/constants';
import { NAV_LINKS } from '../../utils/navigationConstants'; // Import new navigation data
import { Bot, Home } from 'lucide-react'; // Import icons for sidebar header
import '../../styles/Chatbot.css'; // Import the new CSS file

// Base URL for your backend server
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

    // Function to send recorded audio to Google Cloud for transcription
    const sendAudioForTranscription = async (audioBlob) => {
        try {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob); // Convert Blob to Data URL (base64 string)

            reader.onloadend = async () => {
                const base64Audio = reader.result.split(',')[1]; // Get the base64 part

                console.log("Sending audio for transcription to Google Cloud STT directly...");

                let audioEncoding = 'WEBM_OPUS';
                const sampleRateHertz = 48000; // Common default, adjust if your browser records differently

                const response = await fetch(`https://speech.googleapis.com/v1/speech:recognize?key=${import.meta.env.VITE_GOOGLE_CLOUD_API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        config: {
                            encoding: audioEncoding,
                            sampleRateHertz: sampleRateHertz,
                            languageCode: 'en-US', // Adjust language as needed
                            model: 'default', // Or 'latest_long', 'command_and_search', etc.
                        },
                        audio: {
                            content: base64Audio,
                        },
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("Google Cloud STT API Error:", errorData);
                    throw new Error(`Google Cloud STT error: ${errorData.error.message || response.statusText}`);
                }

                const data = await response.json();
                const transcribedText = data.results && data.results.length > 0
                    ? data.results[0].alternatives[0].transcript
                    : '';

                if (transcribedText) {
                    console.log("Transcribed:", transcribedText);
                    await sendMessage(transcribedText);
                    setInputValue('');
                } else {
                    console.log("No speech detected.");
                    setIsLoading(false);
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

    // Function to send chatbot's text response to Google Cloud for speech synthesis
    const sendTextForSpeechSynthesis = async (text) => {
        try {
            console.log("Sending text for speech synthesis to Google Cloud TTS directly...");
            const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${import.meta.env.VITE_GOOGLE_CLOUD_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    input: {
                        text: text,
                    },
                    voice: {
                        languageCode: 'en-US',
                        name: 'en-US-Wavenet-D',
                        ssmlGender: 'MALE',
                    },
                    audioConfig: {
                        audioEncoding: 'MP3',
                        speakingRate: 1.0,
                        pitch: 0.0,
                    },
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Google Cloud TTS API Error:", errorData);
                throw new Error(`Google Cloud TTS error: ${errorData.error.message || response.statusText}`);
            }

            const data = await response.json();
            const audioContentBase64 = data.audioContent; // This is the base64 encoded audio

            if (audioContentBase64) {
                await playAudio(audioContentBase64);
            } else {
                console.warn("No audio content received from TTS.");
            }
        } catch (error) {
            console.error("Error synthesizing speech:", error);
            // Don't block the chat, just log the error and don't play audio
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'bot',
                text: `(Voice playback error: ${error.message})`, // Indicate error to user visually
                timestamp: new Date()
            }]);
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

            const audioSrc = `data:audio/mp3;base64,${base64Audio}`; // Assuming MP3 from Google Cloud TTS
            audioPlayerRef.current.src = audioSrc;

            audioPlayerRef.current.oncanplaythrough = () => {
                audioPlayerRef.current.play().catch(e => {
                    console.error("Error playing audio (from oncanplaythrough):", e);
                    reject(e);
                });
            };
            audioPlayerRef.current.onerror = (e) => {
                console.error("Audio playback error (general):", e);
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
        setInputValue('');

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

            // *** Now calling TTS directly from frontend ***
            await sendTextForSpeechSynthesis(botResponse);

        } catch (error) {
            console.error("Error sending message or synthesizing speech:", error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'bot',
                text: `Oops! Something went wrong: ${error.message}. Please try again.`,
                timestamp: new Date()
            }]);
            setIsLoading(false);
        } finally {
            // Loading state is now managed by sendTextForSpeechSynthesis's finally block
            // or set to false immediately if TTS fails.
        }
    };

    return (
        <div className="chatbot-container">
            {/* Left Panel */}
            <div className="chatbot-sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <Home /> {/* Or another appropriate icon for your app name */}
                    </div>
                    <span className="sidebar-title">Dumzii</span>
                </div>
                <p className="sidebar-tagline">Your AI study assistant for Vitakity</p>

                <h3 className="sidebar-section-title">Suggested Topics</h3>
                <nav>
                    <ul className="sidebar-nav-list">
                        {NAV_LINKS.map((item, index) => (
                            <li key={index} className="sidebar-nav-item">
                                <button className="sidebar-nav-button" onClick={() => console.log(`Navigating to ${item.link}`)}>
                                    {item.icon && <item.icon />} {/* Render the Lucide icon component */}
                                    {item.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User ID Display moved to sidebar if desired, or keep in main content footer */}
                {userId && (
                    <div className="user-id-display" style={{ marginTop: 'auto', textAlign: 'center' }}>
                        User ID: {userId}
                    </div>
                )}
            </div>

            {/* Main Chat Content */}
            <div className="chatbot-main-content">
                <ChatHeader /> {/* ChatHeader will now apply .chat-header styles */}
                <ChatMessages messages={messages} isLoading={isLoading} />
                <ChatInput
                    inputValue={inputValue}
                    setInputValue={setInputValue}
                    onSend={sendMessage}
                    isLoading={isLoading}
                    onStartRecording={startRecording}
                    onStopRecording={stopRecording}
                    isRecording={isRecording}
                />
            </div>
        </div>
    );
};

export default DumiChatbot;