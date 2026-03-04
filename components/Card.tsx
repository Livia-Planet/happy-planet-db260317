import React from 'react';
import { CharacterData, CharacterStats, Language, PassportData, Rarity, } from '../types';
import { StatBar } from './StatBar';
import { Avatar } from './Avatar';
import { getDominantStat, generateUniqueId, TRANSLATIONS } from '../utils/gameLogic';
import { PlanetCanvas } from './PlanetCanvas';

// --- [全新可爱版：果冻贴纸风印章] ---
const RaritySeal: React.FC<{ rarity: string }> = ({ rarity }) => {
  const themes: Record<string, { color: string, fill: string, label: string, svg: React.ReactNode, anim: string }> = {
    C: { 
      color: 'text-stone-400', fill: '#f5f5f4', label: 'COMMON', anim: '',
      // 可爱的虚线胖圆圈
      svg: <circle cx="50" cy="50" r="35" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="8" strokeDasharray="12 12" strokeLinecap="round" />
    },
    U: { 
      color: 'text-emerald-500', fill: '#ecfdf5', label: 'UNCOMMON', anim: '',
      // 果冻方块（超大圆角）
      svg: <rect x="20" y="20" width="60" height="60" rx="20" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="8" />
    },
    R: { 
      color: 'text-sky-500', fill: '#e0f2fe', label: 'RARE', anim: '',
      // 圆润的水滴/钻石
      svg: <path d="M50 15 L80 50 L50 85 L20 50 Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" />
    },
    E: { 
      color: 'text-purple-500', fill: '#faf5ff', label: 'EPIC', anim: '',
      // 胖乎乎的四角星
      svg: <path d="M50 10 Q50 50 90 50 Q50 50 50 90 Q50 50 10 50 Q50 50 50 10 Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" />
    },
    L: { 
      color: 'text-amber-500', fill: '#fffbeb', label: 'LEGENDARY', anim: 'animate-bounce',
      // 小皇冠！孩子们最喜欢的
      svg: <path d="M15 80 L85 80 L95 30 L70 50 L50 20 L30 50 L5 30 Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" />
    }
  };
  
  const active = themes[rarity || 'C'];
  
  return (
    // group 属性用来联动 hover 动画
    <div className={`flex flex-col items-center justify-center ${active.color} drop-shadow-sm group cursor-pointer`}>
      {/* 图形部分：Hover时会放大一点点 */}
      <svg viewBox="0 0 100 100" className={`w-14 h-14 transition-transform duration-300 group-hover:scale-110 ${active.anim}`}>
        {active.svg}
      </svg>
      {/* 文字部分：做成了白色底色、带边框的药丸形状 */}
      <div className={`mt-1 px-2 py-0.5 bg-white border-2 border-current rounded-full shadow-sm transition-transform duration-300 group-hover:-translate-y-1`}>
        <span className="font-black text-[10px] tracking-wider leading-none block">
          {active.label}
        </span>
      </div>
    </div>
  );
};

interface CardProps {
  data: PassportData | CharacterData;
  stats: CharacterStats;
  flavorText: string;
  isFlipped: boolean;
  onFlip: () => void;
  lang: Language;
  showStamp?: boolean;
  stampAngle?: number;
  particles?: any[];
  rarity?: Rarity;
}

export const Card: React.FC<CardProps> = ({ data, stats, flavorText, isFlipped, onFlip, lang, showStamp, stampAngle, particles = [], rarity }) => {
  const dominantStat = getDominantStat(stats);
  const uniqueId = generateUniqueId(data.lastModified);

  // Background color mapping for Front
  const cardBgColors = {
    mod: 'bg-red-50',
    bus: 'bg-yellow-50',
    klurighet: 'bg-blue-50'
  };

  // Text color mapping for stats
  const statTextColors = {
    mod: 'text-livia-red',
    bus: 'text-yellow-600',
    klurighet: 'text-livia-blue'
  };

  return (
    <div
      className={`relative w-[340px] h-[480px] perspective-1000 cursor-pointer group ${showStamp ? 'animate-card-shake' : ''}`}
      onClick={onFlip}
    >
      <style>{`
        @keyframes stamp-drop {
          0% { transform: scale(3) rotate(var(--angle)); opacity: 0; }
          50% { transform: scale(1.1) rotate(var(--angle)); opacity: 1; }
          70% { transform: scale(0.9) rotate(var(--angle)); }
          100% { transform: scale(1) rotate(var(--angle)); opacity: 1; }
        }
        @keyframes card-shake {
          0%,100%{transform:translateX(0)}
          25%{transform:translateX(-3px)}
          75%{transform:translateX(3px)}
        }
        /* 陨石重力砸下效果 */
        @keyframes heavy-impact {
          0% { transform: scale(10); filter: blur(30px); opacity: 0; }
          15% { transform: scale(1); filter: blur(0); opacity: 1; }
          20% { transform: scale(1.3); }
          30% { transform: scale(1); }
        }
        /* 物理粒子抛物线飞溅 */
        @keyframes particle-fly {
          0% { transform: translate(0, 0) scale(1.5); opacity: 1; }
          100% { 
            transform: translate(calc(var(--tx) * 1px), calc(var(--ty) * 1px)) rotate(720deg) scale(0);
            opacity: 0; 
          }
        }
        .animate-card-shake { animation: card-shake 0.2s linear 0.2s forwards; }
        .carrot-bit { clip-path: polygon(50% 0%, 0% 100%, 100% 100%); }
      `}</style>
      
      <div
        className={`w-full h-full relative transform-style-3d transition-transform duration-700 ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* === FRONT FACE === */}
        <div className="absolute w-full h-full backface-hidden bg-white border-[6px] border-black rounded-3xl shadow-comic overflow-hidden flex flex-row">
          
          {/* Particle explosion and heavy-impact stamp layer */}
          {showStamp && (
            <div className="absolute inset-0 pointer-events-none z-[100]">
              
              {/* 1. 粒子喷发层 */}
              {particles.map((p: any) => (
                <div key={p.id}
                  className={`absolute right-12 bottom-12 ${p.shape === 'carrot' ? 'carrot-bit' : ''}`}
                  style={{
                    '--tx': p.tx,
                    '--ty': p.ty,
                    width: p.size,
                    height: p.size,
                    backgroundColor: p.color,
                    borderRadius: p.shape === 'circle' ? '50%' : '2px',
                    animation: `particle-fly 1s cubic-bezier(0.1, 0.8, 0.3, 1) ${p.delay}s forwards`
                  } as any}
                />
              ))}

              {/* 2. 陨石坠落印章 */}
              <div className="absolute right-12 bottom-12"
                   style={{ transform: `rotate(${stampAngle}deg) translate(50%, 50%)`, transformOrigin: 'center' }}>
                <div style={{ animation: 'heavy-impact 0.25s cubic-bezier(0.1, 0.9, 0.2, 1) forwards' }}>
                  <svg viewBox="0 0 120 120" className="w-[110px] h-[110px] drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                    <circle cx="60" cy="60" r="54" stroke="#EF4444" strokeWidth="8" fill="white" />
                    <circle cx="60" cy="60" r="48" stroke="#EF4444" strokeWidth="2" fill="none" strokeDasharray="4 2" />
                    <text x="60" y="65" textAnchor="middle" fontSize="18" fill="#EF4444" fontWeight="900">VERIFIED</text>
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* --- [果冻贴纸：定位到照片右下角（红色箭头处）] --- */}
          {rarity && (
            <div className="absolute bottom-32 left-2 z-[60] transform -rotate-6 hover:rotate-0 transition-all duration-300">
              <RaritySeal rarity={rarity} />
            </div>
          )}

          {/* Left Content Area */}
          <div className="flex-1 flex flex-col relative">

            {/* 1. Header/Avatar Area */}
            <div className={`flex-1 ${cardBgColors[dominantStat]} transition-colors duration-500 relative p-4 flex flex-col items-center justify-center border-b-[6px] border-black`}>
              <div className="absolute top-3 left-3 w-4 h-4 rounded-full bg-white border-2 border-black opacity-60"></div>
              <div className="absolute bottom-6 right-3 w-5 h-5 rounded-full bg-white border-2 border-black opacity-60"></div>

              {/* Avatar & Name Tag Wrapper */}
              <div className="transform scale-125 transition-transform duration-300 relative">
                <Avatar selectedParts={data.selectedParts} dominantStat={dominantStat} />

                {/* Name Tag */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-30">
                  <div className="bg-black text-white px-4 py-2 rounded-2xl border-2 border-white shadow-sm flex items-center justify-center min-w-[120px]">
                    <h2 className="font-rounded font-black text-lg uppercase tracking-wider leading-none text-center whitespace-nowrap">{data.name}</h2>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Stat Badge Area */}
            <div className="flex justify-center gap-3 py-2 bg-white border-b-[4px] border-gray-100">
              <div className={`flex items-center gap-1 font-bold font-rounded text-sm ${dominantStat === 'mod' ? 'scale-110' : 'opacity-60'} transition-all duration-300`}>
                <div className="w-2 h-2 rounded-full bg-livia-red"></div>
                <span className="text-livia-red">{TRANSLATIONS.stats.mod[lang]}</span>
                <span className="text-black text-lg animate-pulse">{stats.mod}</span>
              </div>
              <div className={`flex items-center gap-1 font-bold font-rounded text-sm ${dominantStat === 'bus' ? 'scale-110' : 'opacity-60'} transition-all duration-300`}>
                <div className="w-2 h-2 rounded-full bg-livia-yellow"></div>
                <span className="text-yellow-600">{TRANSLATIONS.stats.bus[lang]}</span>
                <span className="text-black text-lg animate-pulse">{stats.bus}</span>
              </div>
              <div className={`flex items-center gap-1 font-bold font-rounded text-sm ${dominantStat === 'klurighet' ? 'scale-110' : 'opacity-60'} transition-all duration-300`}>
                <div className="w-2 h-2 rounded-full bg-livia-blue"></div>
                <span className="text-livia-blue">{TRANSLATIONS.stats.klurighet[lang]}</span>
                <span className="text-black text-lg animate-pulse">{stats.klurighet}</span>
              </div>
            </div>

            {/* 4. Description / Flavor Text Area */}
            <div className="h-40 p-5 bg-livia-bg text-sm font-hand leading-snug flex flex-col justify-center items-center text-center">
              <p className={`text-lg font-bold ${statTextColors[dominantStat]} mb-2`}>
                {TRANSLATIONS.energyTypes[dominantStat][lang]}
              </p>
              <p className="text-gray-800 text-lg">
                "{flavorText}"
              </p>
            </div>

            {/* Bottom tagline with Unique ID */}
            <div className="bg-black text-white py-2 px-3 text-center font-hand text-[10px] min-h-[32px] flex flex-col items-center justify-center leading-none">
              <span className="opacity-80 mb-0.5">{TRANSLATIONS.idTitle[lang]}</span>
              <span className="font-mono font-bold tracking-widest text-livia-yellow">{uniqueId}</span>
            </div>
          </div>

          {/* Right Stat Bar */}
          <StatBar stats={stats} />

        </div>

        {/* === BACK FACE === */}
        <div className={`absolute w-full h-full backface-hidden rotate-y-180 bg-black border-[6px] border-black rounded-3xl shadow-comic overflow-hidden`}>
          <div className="absolute inset-0 w-full h-full">
            <PlanetCanvas parts={data.selectedPlanetParts} uniqueId={uniqueId} lang={lang} />
          </div>
        </div>
      </div>
    </div>
  );
};