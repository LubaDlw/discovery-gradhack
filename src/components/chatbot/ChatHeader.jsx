// src/components/chatbot/ChatHeader.jsx
import React from 'react';
import { Settings } from 'lucide-react';
import { SOUTH_AFRICAN_LANGUAGES } from '../../utils/constants'; // Import languages

// ChatHeader now accepts language and onLanguageChange props
const ChatHeader = ({ language, onLanguageChange }) => {
    const handleLanguageChange = (event) => {
        onLanguageChange(event.target.value);
    };

    return (
        <div className="chat-header">
            <h2 className="chat-header-title">Dumzii Assistant</h2>
            <div className="flex items-center gap-2"> {/* Wrapper for dropdown and settings */}
                {/* Language Dropdown */}
                <select
                    className="language-selector"
                    value={language}
                    onChange={handleLanguageChange}
                    aria-label="Select language"
                >
                    {SOUTH_AFRICAN_LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                            {lang.name}
                        </option>
                    ))}
                </select>

                <button className="settings-button">
                    <Settings size={20} />
                </button>
            </div>
        </div>
    );
};

export default ChatHeader;