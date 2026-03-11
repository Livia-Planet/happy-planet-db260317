import React from 'react';
import { Avatar } from './Avatar';
import { LabIcon, FocusIcon, RadarIcon, BookIcon } from './Icons';
import { CharacterData, Language, ViewMode } from '../types';
import { SpaceBackground } from './SpaceBackground';
import { ACHIEVEMENTS_DB } from '../data/achievements';

// 1. 定义三语文本
const START_TEXTS = {
  cn: {
    title: "快乐星球",
    author: "Livia 设计",
    lab: { main: "创世实验室", sub: "LAB" },
    farm: { main: "丰饶农场", sub: "FARM" },
    radar: { main: "星际雷达", sub: "RADAR" },
    log: { main: "航行日志", sub: "LOG" }
  },
  en: {
    title: "HAPPY PLANET",
    author: "Designed by Livia",
    lab: { main: "Creation Lab", sub: "LAB" },
    farm: { main: "Harvest Farm", sub: "FARM" },
    radar: { main: "Star Radar", sub: "RADAR" },
    log: { main: "Flight Log", sub: "LOG" }
  },
  se: {
    title: "HAPPY PLANET",
    author: "Designad av Livia",
    lab: { main: "Skapelse Lab", sub: "LAB" },
    farm: { main: "Skördegård", sub: "FARM" },
    radar: { main: "Stjärnradar", sub: "RADAR" },
    log: { main: "Flyglogg", sub: "LOG" }
  }
};

interface StartScreenProps {
  characterData: CharacterData;
  carrotCoins: number;
  hunger: number;
  lang: Language;
  onNavigate: (mode: any) => void;
  medalMode?: 'floating' | 'sorted' | 'hidden'; // 👈 接收从 App.tsx 传来的按钮状态
}

export const StartScreen: React.FC<StartScreenProps> = ({
  characterData,
  lang,
  onNavigate,
  medalMode = 'floating' // 默认漂浮
}) => {
  const t = START_TEXTS[lang] || START_TEXTS.en;

  // 获取真实徽章数据
  const getFloatingMedals = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('happyPlanet_medals') || '{}');
      const unlockedIds = Object.keys(saved);
      if (unlockedIds.length > 0) {
        return unlockedIds.map(id => ACHIEVEMENTS_DB?.[id]).filter(Boolean);
      }
    } catch (e) { }
    return Object.values(ACHIEVEMENTS_DB || {}).slice(0, 8);
  };

  const floatingMedals = getFloatingMedals();
  const isSorted = medalMode === 'sorted';

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-between h-[100dvh] overflow-hidden bg-[#0a0a12]">

      {/* 动画定义：保留原有的漂浮感 */}
      <style>{`
        @keyframes drift {
          0% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -40px) rotate(15deg); }
          66% { transform: translate(-20px, 30px) rotate(-10deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        .animate-drift {
          animation: drift 15s ease-in-out infinite;
        }
      `}</style>

      {/* 唯一的深色宇宙背景层 */}
      <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
        <SpaceBackground bpm={80} themeColor="#FF90E8" />
      </div>

      {/* 🌟 徽章层 (核心联动逻辑在这里) */}
      {medalMode !== 'hidden' && (
        <div className="absolute inset-0 z-[5] pointer-events-none">
          {floatingMedals.map((medal: any, i: number) => {
            // 计算排队状态下的固定位置 (左右两列)
            const isLeft = i % 2 === 0;
            const rowIndex = Math.floor(i / 2);
            const sortedTop = `${20 + rowIndex * 15}%`;
            const sortedLeft = isLeft ? '10%' : '85%';

            // 计算漂浮状态下的随机位置 (利用伪随机保证切换时不闪烁)
            const pseudoRandom = (i * 17) % 100;
            const floatingTop = `${10 + (i % 5) * 15}%`;
            const floatingLeft = `${10 + pseudoRandom * 0.8}%`;

            return (
              <div
                key={medal.id || i}
                // 如果是漂浮模式就加 animate-drift，否则去掉动画；加上 duration-1000 让排队过程像飞过去一样平滑
                className={`absolute transition-all duration-1000 ease-in-out opacity-60 mix-blend-screen ${isSorted ? '' : 'animate-drift'}`}
                style={{
                  top: isSorted ? sortedTop : floatingTop,
                  left: isSorted ? sortedLeft : floatingLeft,
                  // 排队时取消延迟，立即归位
                  animationDelay: isSorted ? '0s' : `-${i * 2}s`,
                  animationDuration: isSorted ? '0s' : `${12 + (i % 5)}s`
                }}
              >
                {medal.imageUrl ? (
                  <img src={medal.imageUrl} alt={medal.id} className="w-16 h-16 drop-shadow-[2px_2px_0_rgba(255,255,255,0.2)]" />
                ) : (
                  <div className="w-12 h-12 bg-white/20 rounded-full border border-white/40 blur-sm" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* --- 顶部区域 (Top) --- */}
      <div className="relative z-10 flex flex-col items-center pt-8 md:pt-12 shrink-0">
        <h1 className="text-5xl md:text-6xl font-black text-white italic drop-shadow-[6px_6px_0_#FF90E8] tracking-tighter mb-4"
          style={{ WebkitTextStroke: '2px black' }}>
          {t.title}
        </h1>
        <text x="230" y="220" className="font-black" fontSize="16" fill="white" opacity="0.6" textAnchor="middle" letterSpacing="2">
          {t.author}
        </text>
      </div>

      {/* --- 中心飞船区域 (Middle) --- */}
      <div className="relative z-10 flex-1 flex items-center justify-center w-full min-h-0 my-4">
        <div className="relative w-[340px] h-[380px] group cursor-pointer" onClick={() => onNavigate('editor')}>

          <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_0_15px_rgba(255,144,232,0.3)]" viewBox="0 0 340 380">
            <path d="M 170 20 C 270 20, 310 150, 310 250 C 310 320, 250 340, 170 340 C 90 340, 30 320, 30 250 C 30 150, 70 20, 170 20 Z" fill="#00000040" stroke="white" strokeWidth="6" strokeLinecap="round" strokeDasharray="16 8" />
            <path d="M 30 250 L 10 320 L 70 300" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 310 250 L 330 320 L 270 300" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 120 340 L 100 370 L 240 370 L 220 340" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 130 370 Q 170 410 210 370" fill="none" stroke="#FF90E8" strokeWidth="5" strokeLinecap="round" className="animate-pulse" />
            <path d="M 170 20 L 170 5" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" />
            <circle cx="170" cy="5" r="5" fill="#FFD700" stroke="white" strokeWidth="3" className="animate-bounce-slow" />
            <circle cx="170" cy="50" r="3" fill="white" />
            <circle cx="120" cy="320" r="3" fill="white" />
            <circle cx="220" cy="320" r="3" fill="white" />
            <circle cx="170" cy="190" r="106" fill="none" stroke="white" strokeWidth="6" />
          </svg>

          {/* 完美嵌合的展示玻璃舱 */}
          <div className="absolute top-[90px] left-[70px] w-[200px] h-[200px] bg-white/10 backdrop-blur-md border-[4px] border-black/20 rounded-full shadow-[inset_0_10px_20px_rgba(255,255,255,0.2),_0_10px_0_0_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105 active:scale-95">

            {/* === Bobu 插图层 (底座) === */}
            <div className="absolute inset-0 z-0">
              <img
                src="https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/All%20gays.png"
                className="w-full h-full object-cover opacity-50 mix-blend-overlay"
                alt="Bobu Background"
              />
            </div>

            {/* Avatar 角色层 */}
            <div className="relative z-10 scale-[1.6] translate-y-6">
              <Avatar data={characterData} size="xl" />
            </div>

            {/* 玻璃舱上的高光反光 */}
            <div className="absolute top-4 left-6 w-16 h-4 bg-white/30 rounded-full -rotate-45 z-20 pointer-events-none" />
          </div>

        </div>
      </div>

      {/* --- 底部按钮区域 (Bottom) --- */}
      <div className="relative z-10 w-full max-w-sm px-6 pb-10 shrink-0">
        <div className="grid grid-cols-2 gap-4">
          <MenuButton label={t.lab.main} sub={t.lab.sub} icon={<LabIcon />} color="bg-[#FFD700]" onClick={() => onNavigate('editor')} />
          <MenuButton label={t.farm.main} sub={t.farm.sub} icon={<FocusIcon />} color="bg-[#98FB98]" onClick={() => onNavigate('focus')} />
          <MenuButton label={t.radar.main} sub={t.radar.sub} icon={<RadarIcon />} color="bg-[#87CEEB]" onClick={() => onNavigate('social')} />
          <MenuButton label={t.log.main} sub={t.log.sub} icon={<BookIcon />} color="bg-[#DDA0DD]" onClick={() => onNavigate('passport')} />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-4 z-20 pointer-events-none" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, #FF90E8 20px, #FF90E8 40px)'
      }} />
    </div>
  );
};

const MenuButton = ({ label, sub, icon, color, onClick }: any) => (
  <button
    onClick={onClick}
    className={`${color} border-[5px] border-black p-4 rounded-[16px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[8px] active:translate-y-[8px] active:shadow-none transition-all flex flex-col items-center gap-1 group`}
  >
    <div className="w-10 h-10 transform group-hover:rotate-12 transition-transform">{icon}</div>
    <span className="font-black text-[13px] text-black leading-none mt-1">{label}</span>
    <span className="font-black text-[10px] text-black/40 italic">{sub}</span>
  </button>
);