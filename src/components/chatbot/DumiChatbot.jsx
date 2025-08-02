import React, { useState, useEffect, useRef } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { GeminiService } from '../../services/geminiService';
import { FirebaseService } from '../../services/firebaseService';
import { INITIAL_CHAT_HISTORY, WELCOME_MESSAGE } from '../../utils/constants';
import { NAV_LINKS } from '../../utils/navigationConstants';
import { Bot, Home } from 'lucide-react';
import '../../styles/Chatbot.css';

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
    const audioPlayerRef = useRef(null);

    // Keep this state to reflect the *current* user preference/last action,
    // but pass it explicitly to sendMessage to ensure accurate behavior for that call.
    const [lastInputMethod, setLastInputMethod] = useState('text');

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

        audioPlayerRef.current = new Audio();
        audioPlayerRef.current.onended = () => {
            console.log("Bot finished speaking.");
        };

        return () => {
            if (audioPlayerRef.current) {
                audioPlayerRef.current.pause();
                audioPlayerRef.current.src = '';
            }
        };

    }, []);

    // Function to start recording audio
    const startRecording = async () => {
        if (audioPlayerRef.current && !audioPlayerRef.current.paused) {
            audioPlayerRef.current.pause();
        }

        // Set input method to voice when recording starts
        setLastInputMethod('voice'); // This updates the state

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : 'audio/webm';

            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = async () => {
                setIsLoading(true);
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                await sendAudioForTranscription(audioBlob);
                audioChunksRef.current = [];
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
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
            console.log("Recording stopped.");
        }
    };

    // Function to send recorded audio to Google Cloud for transcription
    const sendAudioForTranscription = async (audioBlob) => {
        try {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);

            reader.onloadend = async () => {
                const base64Audio = reader.result.split(',')[1];

                console.log("Sending audio for transcription to Google Cloud STT directly...");

                let audioEncoding = 'WEBM_OPUS';
                const sampleRateHertz = 48000;

                const response = await fetch(`https://speech.googleapis.com/v1/speech:recognize?key=${import.meta.env.VITE_GOOGLE_CLOUD_API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        config: {
                            encoding: audioEncoding,
                            sampleRateHertz: sampleRateHertz,
                            languageCode: 'en-US',
                            model: 'default',
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
                    // *** IMPORTANT CHANGE HERE ***
                    // Pass 'voice' explicitly to sendMessage
                    await sendMessage(transcribedText, 'voice');
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
            const audioContentBase64 = data.audioContent;

            if (audioContentBase64) {
                await playAudio(audioContentBase64);
            } else {
                console.warn("No audio content received from TTS.");
            }
        } catch (error) {
            console.error("Error synthesizing speech:", error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'bot',
                text: `(Voice playback error: ${error.message})`,
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Function to play base64 audio
    const playAudio = (base64Audio) => {
        return new Promise((resolve, reject) => {
            if (!audioPlayerRef.current) {
                console.error("Audio player not initialized.");
                return reject("Audio player not initialized.");
            }

            const audioSrc = `data:audio/mp3;base64,${base64Audio}`;
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
            if (audioPlayerRef.current.readyState >= 3) {
                audioPlayerRef.current.play().catch(e => {
                    console.error("Error playing audio (readyState):", e);
                    reject(e);
                });
            }

            audioPlayerRef.current.onended = () => {
                console.log("Audio finished playing.");
                resolve();
            };
        });
    };

    // sendMessage now explicitly uses the provided inputMethod for its logic
    const sendMessage = async (message, inputMethod = 'text') => { // Default to 'text' if not specified
        if (!message.trim() && !isRecording) {
            return;
        }

        // We can still update lastInputMethod state, but the conditional logic
        // will rely on the `inputMethod` argument directly.
        setLastInputMethod(inputMethod);

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
            const newChatHistory = [...chatHistory, { role: "user", parts: [{ text: message }] }];
            setChatHistory(newChatHistory);

            const botResponse = await GeminiService.sendMessage(newChatHistory);

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'bot',
                text: botResponse,
                timestamp: new Date()
            }]);

            setChatHistory([...newChatHistory, { role: "model", parts: [{ text: botResponse }] }]);

            // Conditional TTS call based on the `inputMethod` ARGUMENT
            if (inputMethod === 'voice') { // <--- Rely on the passed argument
                await sendTextForSpeechSynthesis(botResponse);
            } else {
                setIsLoading(false);
            }

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
            // Loading state is now conditionally managed.
        }
    };

    return (
        <div className="chatbot-container">
            {/* Left Panel */}
            <div className="chatbot-sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <Home />
                    </div>
                    <span className="sidebar-title">Dumzii</span>
                </div>
                <p className="sidebar-tagline">Your AI Personalized study assistant</p>

                <h3 className="sidebar-section-title">Suggested Topics</h3>
                <nav>
                    <ul className="sidebar-nav-list">
                        {NAV_LINKS.map((item, index) => (
                            <li key={index} className="sidebar-nav-item">
                                <button className="sidebar-nav-button" onClick={() => console.log(`Navigating to ${item.link}`)}>
                                    {item.icon && <item.icon />}
                                    {item.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {userId && (
                    <div className="user-id-display" style={{ marginTop: 'auto', textAlign: 'center' }}>
                        User ID: {userId}
                    </div>
                )}
            </div>

            {/* Main Chat Content */}
            <div className="chatbot-main-content">
                <ChatHeader />
                <ChatMessages messages={messages} isLoading={isLoading} />
                <ChatInput
                    inputValue={inputValue}
                    setInputValue={setInputValue}
                    onSend={(message) => sendMessage(message, 'text')} // *** IMPORTANT CHANGE HERE ***
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