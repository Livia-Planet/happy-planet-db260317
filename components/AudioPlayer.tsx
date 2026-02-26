import React, { useState, useRef, useEffect } from 'react';

export const AudioPlayer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio('/bgm.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = volume;

    // Auto-play attempt on mount (may be blocked by browser)
    const playAttempt = () => {
      if (audioRef.current) {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(e => {
            console.log("Audio autoplay blocked, waiting for user interaction", e);
            // We don't show hint here to avoid annoying users on mount
          });
      }
    };

    playAttempt();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    // Fix for some browser environments
    audioRef.current.currentTime = audioRef.current.currentTime;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setShowHint(false);
        })
        .catch(e => {
          console.log("Audio play blocked", e);
          setShowHint(true);
          // Auto-hide hint after 3 seconds
          setTimeout(() => setShowHint(false), 3000);
        });
    }
  };

  return (
    <div className="relative font-rounded z-50">
      {/* Autoplay Hint */}
      {showHint && (
        <div className="absolute top-14 right-0 bg-black/80 text-white text-[10px] px-3 py-1.5 rounded-lg whitespace-nowrap animate-bounce shadow-lg border border-white/20">
          请先点击页面任意处以激活音频 🎵
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-white border-[3px] border-black rounded-lg shadow-[3px_3px_0_black] flex items-center justify-center hover:translate-y-[1px] hover:shadow-[2px_2px_0_black] active:translate-y-[3px] active:shadow-none transition-all"
      >
        {/* Simple Speaker Icon */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-12 h-40 bg-white border-[3px] border-black rounded-lg shadow-[4px_4px_0_black] flex flex-col items-center py-3 justify-between">
          
          {/* Play/Pause Toggle inside the slider area */}
          <button onClick={togglePlay} className="mb-2">
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-livia-red" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-livia-blue" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          {/* Volume Slider */}
          <div className="h-24 relative flex items-center justify-center">
             <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="absolute -rotate-90 w-24 h-4 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-runnable-track]:w-full [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:bg-gray-200 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:border-2 [&::-webkit-slider-runnable-track]:border-black"
            />
          </div>
        </div>
      )}
    </div>
  );
};