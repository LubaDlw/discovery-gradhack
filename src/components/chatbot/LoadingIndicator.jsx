import React from 'react';
//Ignore this - for vercel
const LoadingIndicator = () => (
  <div className="flex items-start space-x-3">
    <div className="bg-blue-200 text-blue-800 p-3 rounded-lg rounded-tl-none">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce-dots"></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce-dots"></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce-dots"></div>
      </div>
    </div>
  </div>
);

export default LoadingIndicator;