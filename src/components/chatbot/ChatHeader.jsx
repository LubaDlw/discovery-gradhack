import React from 'react';
import { Bot, X } from 'lucide-react'; // Import X icon for the close button

const ChatHeader = () => (
    <div className="chat-header"> {/* Apply the new CSS class */}
        <h1 className="chat-header-title">Dumzii Chat</h1> {/* Apply the new CSS class */}
        {/* Close button - based on wireframe */}
        <button className="text-white hover:text-gray-200 transition-colors" aria-label="Close Chat">
            <X className="w-6 h-6" /> {/* X icon for closing */}
        </button>
    </div>
);

export default ChatHeader;