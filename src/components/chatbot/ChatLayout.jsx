// src/components/chatbot/ChatLayout.jsx
import React, { useState } from 'react';
import { MenuIcon, XIcon, GraduationCapIcon, BookOpenTextIcon, BriefcaseBusinessIcon, LightbulbIcon, CircleUserRoundIcon } from 'lucide-react';

// Define your navigation data to match the wireframe
const suggestedTopics = [
  { name: 'Homework Help', link: '#homework-help', icon: GraduationCapIcon },
  { name: 'Exam Prep', link: '#exam-prep', icon: BookOpenTextIcon },
  { name: 'Career Guidance', link: '#career-guidance', icon: BriefcaseBusinessIcon },
  { name: 'Study Tips', link: '#study-tips', icon: LightbulbIcon },
];

const ChatLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    // Outer container for the entire chatbot layout
    // Added padding for spacing from all edges, including the top (simulating space from a nav bar)
    // Changed h-screen to min-h-screen to allow for vertical scrolling if content exceeds viewport
    <div className="flex min-h-screen bg-gray-100 font-inter p-4 sm:p-6 lg:p-8"> {/* Adjusted padding for all screen sizes */}
      {/* Mobile Sidebar Toggle Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-full bg-purple-700 text-white shadow-lg"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle navigation"
      >
        {isSidebarOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Left Panel (Sidebar) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-purple-800 text-white shadow-xl transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 lg:flex-shrink-0 lg:w-64 lg:rounded-xl`} 
      >
        <div className="p-6 flex flex-col h-full">
          {/* Top Section: Dumzii Branding */}
          <div className="flex items-center mb-6">
            <CircleUserRoundIcon className="w-10 h-10 mr-3 text-white" /> 
            <div>
              <h2 className="text-2xl font-bold">Dumzii</h2>
              <p className="text-sm text-purple-200">Your AI study assistant for Vitakity</p>
            </div>
          </div>

          {/* Suggested Topics Navigation */}
          <div className="flex-1 mt-8">
            <h3 className="text-base font-semibold text-purple-200 mb-4 uppercase">Suggested Topics</h3>
            <nav>
              <ul>
                {suggestedTopics.map((item) => (
                  <li key={item.name} className="mb-3">
                    <a
                      href={item.link}
                      className="flex items-center p-3 rounded-lg text-lg font-medium text-white hover:bg-purple-700 transition-colors duration-200"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      {item.icon && <item.icon className="w-6 h-6 mr-3 text-purple-300" />}
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      {/* Centered with justify-center, and increased max-width for bigger size */}
      <main className="flex-1 flex flex-col items-center justify-center p-0 overflow-hidden">
        {/* The chatbot itself, adhering to the wireframe's overall size within this main area */}
        <div className="w-full max-w-5xl h-[calc(100vh-8rem)] sm:h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] flex flex-col rounded-xl overflow-hidden shadow-lg border border-gray-200">
        {/* Changed from max-w-4xl to max-w-5xl (or even 6xl if you want it much wider) */}
        {/* Adjusted height to use calc(100vh - padding) to ensure it fits within the viewport with outer padding */}
          {children}
        </div>
      </main>
    </div>
  );
};

export default ChatLayout;