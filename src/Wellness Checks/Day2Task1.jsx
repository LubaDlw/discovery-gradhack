import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { CheckCircle, Trophy, Star } from 'lucide-react';

function Day2Task1() {
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const playerRef = useRef(null);
  const [player, setPlayer] = useState(null);

  // YouTube video ID for a walking benefits video
  const videoId = "fr2VJtCdwAU"; // "The Simple Power of Walking" - change this to any walking video you prefer

  useEffect(() => {
    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // Create YouTube player when API is ready
    window.onYouTubeIframeAPIReady = () => {
      const ytPlayer = new window.YT.Player(playerRef.current, {
        height: '400',
        width: '100%',
        videoId: videoId,
        playerVars: {
          'playsinline': 1,
          'rel': 0,
          'modestbranding': 1
        },
        events: {
          'onStateChange': onPlayerStateChange
        }
      });
      setPlayer(ytPlayer);
    };

    return () => {
      if (player) {
        player.destroy();
      }
    };
  }, []);

  const onPlayerStateChange = (event) => {
    // YT.PlayerState.ENDED = 0
    if (event.data === 0) {
      setVideoCompleted(true);
      setTimeout(() => {
        setShowReward(true);
      }, 500);
    }
  };

  const resetVideo = () => {
    setVideoCompleted(false);
    setShowReward(false);
    if (player) {
      player.seekTo(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
            🚶‍♀️How walking can contribute to academic achievement 🚶‍♂️
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Watch this video to learn about the amazing benefits of each step you take!
          </p>

          {/* Video Container */}
          <div className="relative mb-8">
            <div className="bg-black rounded-lg overflow-hidden shadow-lg">
              <div ref={playerRef} className="w-full"></div>
            </div>
            
            {/* Progress indicator */}
            {!videoCompleted && (
              <div className="mt-4 flex items-center justify-center text-blue-600">
                <div className="animate-pulse flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                  <span className="text-sm">Video in progress...</span>
                </div>
              </div>
            )}
          </div>

          {/* Completion Reward */}
          {videoCompleted && (
            <div className={`text-center transition-all duration-1000 ${
              showReward ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
            }`}>
              <div className="bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg p-8 shadow-lg">
                <div className="flex justify-center mb-4">
                  <Trophy className="w-16 h-16 text-white animate-bounce" />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-3">
                  🎉 Congratulations! 🎉
                </h2>
                
                <p className="text-white text-lg mb-4">
                  You've completed the walking benefits video!
                </p>
                
                <div className="flex justify-center space-x-2 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className="w-6 h-6 text-yellow-200 fill-current animate-pulse" 
                      style={{ animationDelay: `${star * 0.1}s` }}
                    />
                  ))}
                </div>
                
                <div className="bg-white/20 rounded-lg p-4 mb-4">
                  <CheckCircle className="w-8 h-8 text-white mx-auto mb-2" />
                  <p className="text-white font-semibold">
                    Achievement Unlocked: Walking Knowledge Master!
                  </p>
                  <p className="text-white/90 text-sm mt-1">
                    You now know the incredible benefits of walking. Time to put those steps into action! 👣
                  </p>
                </div>
                
                <button
                  onClick={resetVideo}
                  className="bg-white text-orange-500 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                >
                  Watch Again
                </button>
              </div>
            </div>
          )}

          {/* Fun facts about walking */}
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-bold text-blue-800 mb-2">💪 Health Benefits</h3>
              <p className="text-blue-700 text-sm">
                Walking improves cardiovascular health, strengthens bones, and boosts mental wellbeing with every step!
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="font-bold text-green-800 mb-2">🧠 Mental Benefits</h3>
              <p className="text-green-700 text-sm">
                Regular walking can reduce stress, improve mood, and enhance creativity and cognitive function.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Day2Task1;
