import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';

// 1. 定义多歌曲清单 - 包含 BPM 和装饰层配置
export const PLAYLIST = [
  { 
    id: 'happy', 
    name: { cn: '快乐星球', se: 'Lycklig Planet', en: 'Happy Planet' }, 
    file: '/The Happy Planet.mp3',
    bpm: 90,
    themeColor: '#FF6B6B',
    meteorDensity: 5
  },
  { 
    id: 'snack', 
    name: { cn: '星光小吃店', se: 'Stjärn -ljus -snack', en: 'Starlight Snack' }, 
    file: '/Starlight Snack Bar.mp3',
    bpm: 120,
    themeColor: '#FFD93D',
    meteorDensity: 4
  },
  { 
    id: 'orbit', 
    name: { cn: '极光轨道', se: 'Norrsken -ets Bana', en: 'Aurora Orbit' }, 
    file: '/Aurora Orbit.mp3',
    bpm: 80,
    themeColor: '#6BCB77',
    meteorDensity: 7
  },
];

interface AudioPlayerProps {
  lang: Language; // 传入语言以同步显示
  currentTrackIndex: number;
  onTrackChange?: (index: number) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ lang, currentTrackIndex, onTrackChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = PLAYLIST[currentTrackIndex];

  // 初始化与切歌逻辑
  useEffect(() => {
    // 如果没有实例则创建，有则只改 src
    if (!audioRef.current) {
      audioRef.current = new Audio(currentTrack.file);
    } else {
      audioRef.current.src = currentTrack.file;
    }
    
    audioRef.current.loop = true;
    audioRef.current.volume = volume;

    // 关键点：切歌时，如果当前是播放状态，才自动播放
    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn("BGM Playback auto-start blocked:", error);
          setIsPlaying(false); // 如果被浏览器拦截，同步状态
        });
      }
    }

    // 【重要修复】删除之前的 return 里的暂停逻辑
    // 只有在组件彻底从页面消失时才销毁音频
    return () => {
      // 这里留空，或者只在卸载时执行
    };
  }, [currentTrackIndex]); // 当 currentTrackIndex 改变时触发

  // 音量同步
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log(e));
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    const nextIndex = (currentTrackIndex + 1) % PLAYLIST.length;
    if (onTrackChange) {
      onTrackChange(nextIndex);
    }
  };

  return (
    <div className="flex gap-2 items-start z-50">
      {/* 切歌按钮 - 延续 SVG 线条画风格 */}
      <button
        onClick={nextTrack}
        className="w-12 h-12 bg-white border-[3px] border-black rounded-lg shadow-[3px_3px_0_black] flex flex-col items-center justify-center hover:translate-y-[1px] hover:shadow-[2px_2px_0_black] active:translate-y-[3px] active:shadow-none transition-all group"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6 group-active:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M15 5v14" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* 音量控制主按钮 */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 bg-white border-[3px] border-black rounded-lg shadow-[3px_3px_0_black] flex items-center justify-center hover:translate-y-[1px] hover:shadow-[2px_2px_0_black] active:translate-y-[3px] active:shadow-none transition-all"
        >
          {/* 喇叭图标 */}
          <svg viewBox="0 0 24 24" className={`w-6 h-6 ${isPlaying ? 'text-black' : 'text-gray-300'}`} fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M11 5L6 9H2V15H6L11 19V5Z" strokeLinecap="round" strokeLinejoin="round"/>
            {isPlaying && <path d="M15.54 8.46a5 5 0 0 1 0 7.07" strokeLinecap="round" strokeLinejoin="round"/>}
          </svg>
        </button>

        {/* 下拉面板 - 保持与语言切换器的视觉统一 */}
        {isOpen && (
          <div className="absolute top-full right-0 mt-3 w-14 py-4 bg-white border-[3px] border-black rounded-xl shadow-[4px_4px_0_black] flex flex-col items-center gap-4 animate-in fade-in slide-in-from-top-2">
            
            {/* 播放/暂停 */}
            <button onClick={togglePlay} className={`w-8 h-8 rounded-full border-2 border-black flex items-center justify-center ${isPlaying ? 'bg-red-400' : 'bg-green-400'}`}>
               {isPlaying ? <div className="w-2 h-4 border-l-2 border-r-2 border-black" /> : <div className="ml-1 w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-black border-b-[6px] border-b-transparent" />}
            </button>

            {/* 音量条 */}
            <div className="h-24 flex items-center">
              <input
                type="range" min="0" max="1" step="0.05" value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="vertical-slider"
              />
            </div>

            {/* 歌曲简称显示 */}
            <div className="text-[10px] font-black uppercase text-center px-1 leading-none break-words">
              {(currentTrack.name as any)[lang] || currentTrack.name.en}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .vertical-slider {
          -webkit-appearance: none;
          width: 80px;
          height: 6px;
          background: #eee;
          border: 2px solid black;
          border-radius: 10px;
          transform: rotate(-90deg);
          outline: none;
        }
        .vertical-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          background: white;
          border: 2px solid black;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};
