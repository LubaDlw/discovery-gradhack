import React from 'react';

function LoadingScreen() {

  return (
    <div className='loading-Container'>
      <div 
        className="css-spinner" 
        aria-label="Loading..."
        style={{
          width: '80px',
          height: '80px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #103D81',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }}
      ></div>
      <p className='Text' style={{textAlign: "center"}}>Loading your personalized recommendation...</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default LoadingScreen;
