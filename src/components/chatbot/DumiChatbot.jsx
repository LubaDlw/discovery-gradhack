// src/components/chatbot/DumiChatbot.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { GeminiService } from '../../services/geminiService';
import { FirebaseService } from '../../services/firebaseService';
// Import updated constants: WELCOME_MESSAGES (plural) and SOUTH_AFRICAN_LANGUAGES
import { INITIAL_CHAT_HISTORY, WELCOME_MESSAGES, SOUTH_AFRICAN_LANGUAGES } from '../../utils/constants';
import { NAV_LINKS } from '../../utils/navigationConstants';
import { Bot, Home } from 'lucide-react'; // Assuming Bot and Home icons are used
import '../../styles/Chatbot.css'; // Ensure your custom CSS is imported

// Base URL for your backend server (if you have other backend API calls)
// This is not directly used for Google Cloud STT/TTS calls, which use direct API endpoints.
const BACKEND_URL = 'http://localhost:5000';

const DumiChatbot = () => {
    // State for managing chat messages, user input, loading status, authenticated user ID, and Gemini's chat history
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [userId, setUserId] = useState(null);
    // chatHistory stores the full conversation for Gemini, including the dynamic persona/language prompt
    const [chatHistory, setChatHistory] = useState(INITIAL_CHAT_HISTORY);

    // State for managing the currently selected language, defaulting to English (South Africa)
    const [selectedLanguageCode, setSelectedLanguageCode] = useState('en-ZA');

    // State and refs for handling voice interaction (recording and audio playback)
    const [isRecording, setIsRecording] = useState(false); // Indicates if recording is active
    const mediaRecorderRef = useRef(null); // Reference to the MediaRecorder instance
    const audioChunksRef = useRef([]); // Stores audio data chunks during recording
    const audioPlayerRef = useRef(null); // Reference to the HTML Audio element for bot's voice playback
    const [lastInputMethod, setLastInputMethod] = useState('text'); // Tracks if last user input was text or voice

    /**
     * Dynamically generates the initial prompt sent to the Gemini AI model.
     * This prompt instructs Gemini on its persona (Dumzii) and, crucially,
     * tells it to respond in the currently selected language.
     * No more complex instructions for voice fallback as voice is now disabled for other languages.
     * Uses `useCallback` to memoize the function.
     */
    const getGeminiPrompt = useCallback(() => {
        const basePrompt = INITIAL_CHAT_HISTORY[0].parts[0].text;
        const selectedLangName = SOUTH_AFRICAN_LANGUAGES.find(lang => lang.code === selectedLanguageCode)?.name || 'English';

        // Simplified prompt: Gemini just responds in the selected language.
        // Voice is handled separately by disabling it for non-English languages.
        return `${basePrompt}\n\nAll your responses MUST be in ${selectedLangName}.`;
    }, [selectedLanguageCode]); // Dependency: re-create if language code changes


    /**
     * useEffect hook for initial component setup:
     * 1. Initializes Firebase service and sets up an authentication state listener.
     * 2. Initializes the HTML Audio element for playback.
     * 3. Sets up cleanup for the audio player on component unmount.
     * This effect runs only once when the component mounts.
     */
    useEffect(() => {
        // Initialize Firebase and set up user authentication listener
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

        // Initialize the HTML Audio element for playing bot's voice responses
        audioPlayerRef.current = new Audio();
        audioPlayerRef.current.onended = () => {
            console.log("Bot finished speaking.");
        };

        // Cleanup function: This runs when the component unmounts
        return () => {
            if (audioPlayerRef.current) {
                audioPlayerRef.current.pause();
                audioPlayerRef.current.src = ''; // Clear the audio source
            }
        };
    }, []); // Empty dependency array ensures this effect runs only once on mount

    /**
     * useEffect hook to handle changes in the selected language:
     * 1. Fetches the appropriate welcome message for the newly selected language.
     * 2. Resets the `chatHistory` (the conversation context sent to Gemini) to include the
     * updated language directive, ensuring all subsequent AI responses are in the new language.
     * 3. Updates the `messages` state (what's displayed in the UI) to show the new welcome message,
     * effectively restarting the conversation with the new language.
     * This effect runs whenever `selectedLanguageCode` changes or `getGeminiPrompt` (due to its own dependency) changes.
     */
    useEffect(() => {
        // Retrieve the welcome message for the selected language, falling back to 'en-ZA' if not found
        const currentWelcomeMessage = WELCOME_MESSAGES[selectedLanguageCode] || WELCOME_MESSAGES['en-ZA'];

        // Reset the chat history for the Gemini AI model.
        // This is crucial: the first 'user' part contains the dynamic prompt with language instruction.
        // The first 'model' part is the bot's initial greeting in the chosen language.
        setChatHistory([
            {
                role: "user",
                parts: [{ text: getGeminiPrompt() }] // Dynamic language instruction for Gemini
            },
            {
                role: "model",
                parts: [{ text: currentWelcomeMessage }] // Bot's initial welcome in the correct language
            }
        ]);

        // Update the displayed messages in the UI, effectively starting a new conversation with the new welcome
        setMessages([
            {
                id: 1, // A unique ID for this initial bot message
                sender: 'bot',
                text: currentWelcomeMessage,
                timestamp: new Date() // Current timestamp
            }
        ]);
    }, [selectedLanguageCode, getGeminiPrompt]); // Dependencies: Re-run when language code or the prompt generator changes

    /**
     * Initiates audio recording from the user's microphone.
     * This function will only be callable when selectedLanguageCode is 'en-ZA'
     * as the mic button will be hidden for other languages.
     */
    const startRecording = async () => {
        // Pause any ongoing bot audio to ensure clear recording
        if (audioPlayerRef.current && !audioPlayerRef.current.paused) {
            audioPlayerRef.current.pause();
        }

        // Mark the last input method as 'voice'
        setLastInputMethod('voice');

        try {
            // Request access to the user's audio input (microphone)
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Determine the best MIME type for recording. 'audio/webm;codecs=opus' is preferred for STT.
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : 'audio/webm'; // Fallback to plain webm if opus codec isn't supported

            // Initialize MediaRecorder with the audio stream and selected MIME type
            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
            audioChunksRef.current = []; // Clear any previous audio data chunks

            // Event listener: collects recorded audio data as it becomes available
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            // Event listener: triggered when recording stops
            mediaRecorderRef.current.onstop = async () => {
                setIsLoading(true); // Show a loading indicator as audio is processed
                // Combine all collected audio chunks into a single Blob
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                // Send the collected audio Blob to Google Cloud for transcription, passing the selected language code
                // Note: STT can still attempt to transcribe in the selected language.
                await sendAudioForTranscription(audioBlob, selectedLanguageCode);
                audioChunksRef.current = []; // Clear chunks after processing
            };

            mediaRecorderRef.current.start(); // Start the recording process
            setIsRecording(true); // Update the state to indicate recording is active
            console.log("Recording started...");
        } catch (error) {
            console.error("Error accessing microphone:", error);
            // Alert the user if microphone access fails
            alert("Could not access microphone. Please check your browser permissions. (" + error.name + ": " + error.message + ")");
        }
    };

    /**
     * Stops the ongoing audio recording.
     */
    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop(); // Stop the MediaRecorder
            // Stop all tracks on the stream to release the microphone resource
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false); // Update the state to indicate recording has stopped
            console.log("Recording stopped.");
        }
    };

    /**
     * Sends the recorded audio data to the Google Cloud Speech-to-Text (STT) API for transcription.
     * Converts the audio Blob to a Base64 string before sending.
     * @param {Blob} audioBlob - The audio data recorded from the microphone as a Blob.
     * @param {string} languageCode - The BCP-47 language code to guide the transcription (e.g., 'en-ZA', 'zu-ZA').
     */
    const sendAudioForTranscription = async (audioBlob, languageCode) => {
        try {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob); // Convert the Blob into a Data URL (Base64 string)

            reader.onloadend = async () => {
                // Extract the Base64 part from the Data URL
                const base64Audio = reader.result.split(',')[1];

                console.log(`Sending audio for transcription to Google Cloud STT directly (Lang: ${languageCode})...`);

                const audioEncoding = 'WEBM_OPUS'; // Specify the encoding format of the audio
                const sampleRateHertz = 48000; // Specify the sample rate of the audio

                // Make the POST request to the Google Cloud Speech-to-Text API
                const response = await fetch(`https://speech.googleapis.com/v1/speech:recognize?key=${import.meta.env.VITE_GOOGLE_CLOUD_API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        config: {
                            encoding: audioEncoding,
                            sampleRateHertz: sampleRateHertz,
                            languageCode: languageCode, // Use the dynamically selected language code for transcription
                            model: 'default', // Use the default model or specify a custom one
                        },
                        audio: {
                            content: base64Audio, // The Base64 encoded audio content
                        },
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("Google Cloud STT API Error:", errorData);
                    throw new Error(`Google Cloud STT error: ${errorData.error.message || response.statusText}`);
                }

                const data = await response.json();
                // Extract the transcribed text from the API response
                const transcribedText = data.results && data.results.length > 0
                    ? data.results[0].alternatives[0].transcript
                    : '';

                if (transcribedText) {
                    console.log("Transcribed:", transcribedText);
                    // If transcription is successful, send the text to the chatbot as a user message (from voice)
                    await sendMessage(transcribedText, 'voice');
                    setInputValue(''); // Clear the input field after sending
                } else {
                    console.log("No speech detected.");
                    setIsLoading(false); // Turn off loading indicator if no speech was detected
                    // Add a bot message indicating no speech was caught
                    setMessages(prev => [...prev, {
                        id: Date.now() + 1,
                        sender: 'bot',
                        text: "I didn't catch that. Could you please try speaking again?",
                        timestamp: new Date()
                    }]);
                }
            };
            // Error handler for FileReader operations
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
            setIsLoading(false); // Ensure loading is turned off on error
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'bot',
                text: `Error transcribing: ${error.message}. Please try again.`,
                timestamp: new Date()
            }]);
        }
    };

    /**
     * Sends the chatbot's text response to the Google Cloud Text-to-Speech (TTS) API for speech synthesis.
     * This function is now specifically for English voice output.
     * @param {string} text - The text content to be converted into speech (expected to be English).
     */
    const sendTextForSpeechSynthesis = async (text) => { // Removed originalLanguageCode parameter as it's not used
        try {
            console.log(`Sending text for speech synthesis to Google Cloud TTS using en-US voice...`);

            const targetLanguageCodeForTTS = 'en-US';
            const targetVoiceNameForTTS = 'en-US-Wavenet-D';

            // Make the POST request to the Google Cloud Text-to-Speech API
            const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${import.meta.env.VITE_GOOGLE_CLOUD_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    input: {
                        text: text, // This text *must* be in English for the en-US voice to work correctly
                    },
                    voice: {
                        languageCode: targetLanguageCodeForTTS, // Force to en-US
                        name: targetVoiceNameForTTS, // Force to en-US-Wavenet-D
                        ssmlGender: 'MALE', // Gender of the voice
                    },
                    audioConfig: {
                        audioEncoding: 'MP3', // Request MP3 audio format
                        speakingRate: 1.0, // Normal speaking rate
                        pitch: 0.0, // Normal pitch
                    },
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Google Cloud TTS API Error:", errorData);
                throw new Error(`Google Cloud TTS error: ${errorData.error.message || response.statusText}`);
            }

            const data = await response.json();
            const audioContentBase64 = data.audioContent; // The Base64 encoded audio content

            if (audioContentBase64) {
                await playAudio(audioContentBase64); // Play the synthesized audio
            } else {
                console.warn("No audio content received from TTS.");
            }
        } catch (error) {
            console.error("Error synthesizing speech:", error);
            // Add a bot message indicating voice playback error to the chat
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'bot',
                text: `(Voice playback error: ${error.message})`,
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false); // Ensure loading indicator is turned off after TTS attempt
        }
    };

    /**
     * This helper function is now simplified and will always return 'en-US-Wavenet-D'.
     * It's technically not strictly needed anymore if sendTextForSpeechSynthesis hardcodes the voice.
     * It's kept for clarity but its direct output is fixed as per the new requirement.
     */
    const getVoiceNameForLanguage = (languageCode) => {
        return 'en-US-Wavenet-D';
    };

    /**
     * Plays Base64 encoded audio data using an HTML Audio element.
     */
    const playAudio = (base64Audio) => {
        return new Promise((resolve, reject) => {
            // Ensure the audio player is initialized
            if (!audioPlayerRef.current) {
                console.error("Audio player not initialized.");
                return reject("Audio player not initialized.");
            }

            // Set the audio source from the Base64 data
            const audioSrc = `data:audio/mp3;base64,${base64Audio}`;
            audioPlayerRef.current.src = audioSrc;

            // Event listener for when enough audio data is loaded to begin playback
            audioPlayerRef.current.oncanplaythrough = () => {
                // Attempt to play the audio, catching any errors (e.g., user gesture not yet performed)
                audioPlayerRef.current.play().catch(e => {
                    console.error("Error playing audio (from oncanplaythrough):", e);
                    reject(e);
                });
            };
            // General error handler for audio playback
            audioPlayerRef.current.onerror = (e) => {
                console.error("Audio playback error (general):", e);
                reject(e);
            };

            // If the audio is already sufficiently loaded, attempt to play immediately
            if (audioPlayerRef.current.readyState >= 3) { // HTMLMediaElement.HAVE_FUTURE_DATA
                audioPlayerRef.current.play().catch(e => {
                    console.error("Error playing audio (readyState):", e);
                    reject(e);
                });
            }

            // Resolve the promise when the audio finishes playing
            audioPlayerRef.current.onended = () => {
                console.log("Audio finished playing.");
                resolve();
            };
        });
    };

    /**
     * Sends a user's message to the Gemini AI model and processes the bot's response.
     * It adds the user's message to the chat, calls the Gemini API, adds the bot's response,
     * and triggers Text-to-Speech *only if* the input method was voice AND the language is English.
     */
    const sendMessage = async (message, inputMethod = 'text') => {
        // Prevent sending empty messages or if recording is active
        if (!message.trim() && !isRecording) {
            return;
        }

        // Set the current input method
        setLastInputMethod(inputMethod);

        // Add the user's message to the displayed chat messages
        setMessages(prev => [...prev, {
            id: Date.now(), // Unique ID for the message
            sender: 'user',
            text: message,
            timestamp: new Date() // Current timestamp
        }]);
        setInputValue(''); // Clear the input field after sending

        setIsLoading(true); // Activate loading indicator

        try {
            // Get the current dynamic Gemini prompt
            const currentGeminiPrompt = getGeminiPrompt();

            // Construct the conversation history to send to the Gemini API.
            const conversationHistoryForGemini = [
                { role: "user", parts: [{ text: currentGeminiPrompt }] },
                ...chatHistory.slice(1),
                { role: "user", parts: [{ text: message }] }
            ];

            // Send the conversation history to the Gemini service and get the bot's response
            const botResponse = await GeminiService.sendMessage(conversationHistoryForGemini);

            // Add the bot's response to the displayed chat messages
            setMessages(prev => [...prev, {
                id: Date.now() + 1, // Unique ID for the bot's message
                sender: 'bot',
                text: botResponse, // This text will be in the selected UI language
                timestamp: new Date()
            }]);

            // Update the internal chat history state with the new bot's response
            setChatHistory([...conversationHistoryForGemini, { role: "model", parts: [{ text: botResponse }] }]);

            // IMPORTANT: Only attempt Text-to-Speech if input was voice AND selected language is English
            if (inputMethod === 'voice' && selectedLanguageCode === 'en-ZA') {
                // Since the prompt now ensures Gemini responds in English for en-ZA,
                // and voice is disabled for other languages, we can send botResponse directly.
                await sendTextForSpeechSynthesis(botResponse);
            } else {
                // If not voice input, or if voice is disabled for the current language,
                // simply turn off the loading indicator.
                setIsLoading(false);
            }

        } catch (error) {
            console.error("Error sending message or synthesizing speech:", error);
            // Add an error message from the bot to the chat
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'bot',
                text: `Oops! Something went wrong: ${error.message}. Please try again.`,
                timestamp: new Date()
            }]);
            setIsLoading(false); // Ensure loading is off on error
        } finally {
            // The loading state is managed conditionally within the try/catch blocks
        }
    };

    return (
        <div className="chatbot-container">
            {/* Left Panel (Sidebar) */}
            <div className="chatbot-sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <Home /> {/* Example: Home icon for the logo area */}
                    </div>
                    <span className="sidebar-title">Dumzii</span>
                </div>
                <p className="sidebar-tagline">Your AI study assistant for vitakity for students</p> {/* Updated app name */}

                <h3 className="sidebar-section-title">Suggested Topics</h3>
                <nav>
                    <ul className="sidebar-nav-list">
                        {/* Map through navigation links to create sidebar buttons */}
                        {NAV_LINKS.map((item, index) => (
                            <li key={index} className="sidebar-nav-item">
                                <button className="sidebar-nav-button" onClick={() => console.log(`Navigating to ${item.link}`)}>
                                    {item.icon && <item.icon />} {/* Render Lucide icon component if available */}
                                    {item.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Display User ID if available, positioned at the bottom of the sidebar */}
                {userId && (
                    <div className="user-id-display" style={{ marginTop: 'auto', textAlign: 'center' }}>
                        User ID: {userId}
                    </div>
                )}
            </div>

            {/* Main Chat Content Area */}
            <div className="chatbot-main-content">
                {/* ChatHeader component, now receiving language state and setter prop */}
                <ChatHeader
                    language={selectedLanguageCode}
                    onLanguageChange={setSelectedLanguageCode}
                />
                {/* ChatMessages component for displaying conversation, passing messages and loading state */}
                <ChatMessages messages={messages} isLoading={isLoading} />
                {/* ChatInput component for user input (text and voice), passing relevant props */}
                <ChatInput
                    inputValue={inputValue}
                    setInputValue={setInputValue}
                    onSend={(message) => sendMessage(message, 'text')} // Call sendMessage with 'text' method
                    isLoading={isLoading}
                    onStartRecording={startRecording} // Function to start voice recording
                    onStopRecording={stopRecording} // Function to stop voice recording
                    isRecording={isRecording} // Current recording status
                    selectedLanguageCode={selectedLanguageCode} // Pass current language for conditional mic button
                />
            </div>
        </div>
    );
};

export default DumiChatbot;