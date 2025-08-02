// src/components/chatbot/DumiChatbot.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react'; // Added useCallback
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { GeminiService } from '../../services/geminiService';
import { FirebaseService } from '../../services/firebaseService';
import { INITIAL_CHAT_HISTORY, WELCOME_MESSAGE, SOUTH_AFRICAN_LANGUAGES } from '../../utils/constants';
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

    // NEW STATE: Language selection
    const [selectedLanguageCode, setSelectedLanguageCode] = useState('en-ZA'); // Default to English (South Africa)

    // State for voice interaction
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const audioPlayerRef = useRef(null);
    const [lastInputMethod, setLastInputMethod] = useState('text');

    // Function to generate the dynamic Gemini prompt based on selected language
    // We wrap this in useCallback to prevent unnecessary re-creations
    const getGeminiPrompt = useCallback(() => {
        const basePrompt = INITIAL_CHAT_HISTORY[0].parts[0].text;
        return `${basePrompt}\n\nAll your responses MUST be in ${SOUTH_AFRICAN_LANGUAGES.find(lang => lang.code === selectedLanguageCode)?.name || 'English'}.`;
    }, [selectedLanguageCode]); // Re-create only if selectedLanguageCode changes

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

        // Initial chat history, potentially re-initialize when language changes too
        setMessages([
            {
                id: 1,
                sender: 'bot',
                text: WELCOME_MESSAGE, // Static welcome message, consider making this dynamic if full i18n is implemented
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

    }, []); // Empty dependency array means this runs once on mount

    // Effect to reset chat history when language changes, forcing the new language prompt
    useEffect(() => {
        // Reset chat history to include the new language directive for Gemini
        setChatHistory([
            {
                role: "user",
                parts: [{ text: getGeminiPrompt() }]
            },
            {
                role: "model",
                parts: [{ text: WELCOME_MESSAGE }] // Welcome message currently static
            }
        ]);
        // Also clear messages or update welcome message if it needs translation
        setMessages([
            {
                id: 1,
                sender: 'bot',
                text: WELCOME_MESSAGE,
                timestamp: new Date()
            }
        ]);
    }, [selectedLanguageCode, getGeminiPrompt]); // Re-run when language code changes or prompt generator changes

    // Function to start recording audio
    const startRecording = async () => {
        if (audioPlayerRef.current && !audioPlayerRef.current.paused) {
            audioPlayerRef.current.pause();
        }
        setLastInputMethod('voice');

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
                await sendAudioForTranscription(audioBlob, selectedLanguageCode); // Pass selectedLanguageCode
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
    // Now accepts a languageCode parameter
    const sendAudioForTranscription = async (audioBlob, languageCode) => {
        try {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);

            reader.onloadend = async () => {
                const base64Audio = reader.result.split(',')[1];

                console.log(`Sending audio for transcription to Google Cloud STT directly (Lang: ${languageCode})...`);

                let audioEncoding = 'WEBM_OPUS';
                const sampleRateHertz = 48000; // Common sample rate for webm opus

                const response = await fetch(`https://speech.googleapis.com/v1/speech:recognize?key=${import.meta.env.VITE_GOOGLE_CLOUD_API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        config: {
                            encoding: audioEncoding,
                            sampleRateHertz: sampleRateHertz,
                            languageCode: languageCode, // Use the passed language code
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
    // Now accepts a languageCode parameter
    const sendTextForSpeechSynthesis = async (text, languageCode) => {
        try {
            console.log(`Sending text for speech synthesis to Google Cloud TTS directly (Lang: ${languageCode})...`);
            // Attempt to find a suitable voice for the language. Fallback to en-US-Wavenet-D
            const voiceName = getVoiceNameForLanguage(languageCode); // Helper function for voice selection

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
                        languageCode: languageCode, // Use the passed language code
                        name: voiceName, // Use the selected voice name
                        ssmlGender: 'MALE', // Or FEMALE, NEUTRAL. Can be varied based on voiceName
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
                text: `(Voice playback error for ${languageCode}: ${error.message})`,
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Helper function to pick a voice name based on language code
    // This is a simplified example. In a real app, you'd list available voices
    // and let the user pick, or have a more robust fallback logic.
    const getVoiceNameForLanguage = (languageCode) => {
        switch (languageCode) {
            case 'af-ZA': return 'af-ZA-Wavenet-B'; // Example voice
            case 'zu-ZA': return 'zu-ZA-Wavenet-D';
            case 'xh-ZA': return 'xh-ZA-Wavenet-A';
            case 'st-ZA': return 'st-ZA-Wavenet-A';
            case 'ts-ZA': return 'ts-ZA-Wavenet-A';
            case 'en-ZA': return 'en-ZA-Wavenet-A'; // If en-ZA voices are preferred
            // Default to a common English voice if specific language voice not found/supported
            default: return 'en-US-Wavenet-D'; // A good quality male voice
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

    const sendMessage = async (message, inputMethod = 'text') => {
        if (!message.trim() && !isRecording) {
            return;
        }

        setLastInputMethod(inputMethod);

        setMessages(prev => [...prev, {
            id: Date.now(),
            sender: 'user',
            text: message,
            timestamp: new Date()
        }]);
        setInputValue('');

        setIsLoading(true);

        try {
            // Update the chat history with the current language prompt before sending
            const currentGeminiPrompt = getGeminiPrompt();
            const conversationHistoryForGemini = [
                { role: "user", parts: [{ text: currentGeminiPrompt }] }, // Always send the latest language directive
                ...chatHistory.slice(1), // Exclude the old initial prompt
                { role: "user", parts: [{ text: message }] }
            ];

            const botResponse = await GeminiService.sendMessage(conversationHistoryForGemini);

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'bot',
                text: botResponse,
                timestamp: new Date()
            }]);

            // Ensure our internal chatHistory state also reflects the latest prompt
            setChatHistory([...conversationHistoryForGemini, { role: "model", parts: [{ text: botResponse }] }]);

            if (inputMethod === 'voice') {
                await sendTextForSpeechSynthesis(botResponse, selectedLanguageCode); // Pass selectedLanguageCode
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
                <p className="sidebar-tagline">Your AI study assistant for Vitakity</p>

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
                <ChatHeader
                    language={selectedLanguageCode}
                    onLanguageChange={setSelectedLanguageCode}
                />
                <ChatMessages messages={messages} isLoading={isLoading} />
                <ChatInput
                    inputValue={inputValue}
                    setInputValue={setInputValue}
                    onSend={(message) => sendMessage(message, 'text')}
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