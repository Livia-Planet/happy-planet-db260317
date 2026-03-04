import React from 'react';
import { CharacterData, CharacterStats, Language, PassportData, Rarity } from '../types';
import { StatBar } from './StatBar';
import { Avatar } from './Avatar';
import { getDominantStat, generateUniqueId, TRANSLATIONS } from '../utils/gameLogic';
import { PlanetCanvas } from './PlanetCanvas';

// --- [全新可爱版：果冻贴纸风印章] ---
const RaritySeal: React.FC<{ rarity: string }> = ({ rarity }) => {
  const themes: Record<string, { color: string, fill: string, label: string, svg: React.ReactNode, anim: string }> = {
    C: {
      color: 'text-stone-400', fill: '#f5f5f4', label: 'COMMON', anim: '',
      svg: <circle cx="50" cy="50" r="35" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="8" strokeDasharray="12 12" strokeLinecap="round" />
    },
    U: {
      color: 'text-emerald-500', fill: '#ecfdf5', label: 'UNCOMMON', anim: '',
      svg: <rect x="20" y="20" width="60" height="60" rx="20" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="8" />
    },
    R: {
      color: 'text-sky-500', fill: '#e0f2fe', label: 'RARE', anim: '',
      svg: <path d="M50 15 L80 50 L50 85 L20 50 Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" />
    },
    E: {
      color: 'text-purple-500', fill: '#faf5ff', label: 'EPIC', anim: '',
      svg: <path d="M50 10 Q50 50 90 50 Q50 50 50 90 Q50 50 10 50 Q50 50 50 10 Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" />
    },
    L: {
      color: 'text-amber-500', fill: '#fffbeb', label: 'LEGENDARY', anim: 'animate-bounce',
      svg: <path d="M15 80 L85 80 L95 30 L70 50 L50 20 L30 50 L5 30 Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" />
    }
  };

  const active = themes[rarity || 'C'];

  return (
    <div className={`flex flex-col items-center justify-center ${active.color} drop-shadow-sm group cursor-pointer`}>
      <svg viewBox="0 0 100 100" className={`w-14 h-14 transition-transform duration-300 group-hover:scale-110 ${active.anim}`}>
        {active.svg}
      </svg>
      <div className={`mt-1 px-2 py-0.5 bg-white border-2 border-current rounded-full shadow-sm transition-transform duration-300 group-hover:-translate-y-1`}>
        <span className="font-black text-[10px] tracking-wider leading-none block">
          {active.label}
        </span>
      </div>
    </div>
  );
};

// 提取到组件外部，保证语法正确
const rarityEffects: Record<string, { ring: string, glow: string, particles: string }> = {
  L: {
    ring: 'border-yellow-400/50 shadow-[0_0_30px_rgba(250,204,21,0.6)]',
    glow: 'bg-yellow-400/20 animate-pulse',
    particles: 'star-gold'
  },
  E: {
    ring: 'border-purple-400/40 shadow-[0_0_25px_rgba(192,132,252,0.5)]',
    glow: 'bg-purple-500/10 animate-soft-glow',
    particles: 'star-purple'
  },
  R: {
    ring: 'border-blue-400/30 shadow-[0_0_20px_rgba(96,165,250,0.4)]',
    glow: 'bg-blue-400/10',
    particles: 'star-blue'
  },
  U: { ring: '', glow: '', particles: '' },
  C: { ring: '', glow: '', particles: '' }
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

export const Card: React.FC<CardProps> = ({ data, stats, flavorText, isFlipped, onFlip, lang, showStamp, stampAngle, particles = [], rarity = 'C' }) => {
  const dominantStat = getDominantStat(stats);
  const uniqueId = generateUniqueId(data.lastModified);

  const cardBgColors = { mod: 'bg-red-50', bus: 'bg-yellow-50', klurighet: 'bg-blue-50' };
  const statTextColors = { mod: 'text-livia-red', bus: 'text-yellow-600', klurighet: 'text-livia-blue' };

  const activeEffect = rarityEffects[rarity] || rarityEffects.C;

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
        @keyframes heavy-impact {
          0% { transform: scale(10); filter: blur(30px); opacity: 0; }
          15% { transform: scale(1); filter: blur(0); opacity: 1; }
          20% { transform: scale(1.3); }
          30% { transform: scale(1); }
        }
        @keyframes particle-fly {
          0% { transform: translate(0, 0) scale(1.5); opacity: 1; }
          100% { 
            transform: translate(calc(var(--tx) * 1px), calc(var(--ty) * 1px)) rotate(720deg) scale(0);
            opacity: 0; 
          }
        }
        @keyframes soft-glow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        @keyframes float-particles {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }

        .animate-card-shake { animation: card-shake 0.2s linear 0.2s forwards; }
        .carrot-bit { clip-path: polygon(50% 0%, 0% 100%, 100% 100%); }
        .animate-soft-glow { animation: soft-glow 4s ease-in-out infinite; }
        .animate-float-particles { animation: float-particles 8s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 12s linear infinite; }
        .animate-spin-reverse { animation: spin-reverse 20s linear infinite; }
      `}</style>

      <div className={`w-full h-full relative transform-style-3d transition-transform duration-700 ${isFlipped ? 'rotate-y-180' : ''}`}>

        {/* === FRONT FACE === */}
        <div className="absolute w-full h-full backface-hidden bg-white border-[6px] border-black rounded-3xl shadow-comic overflow-hidden flex flex-row">

          {showStamp && (
            <div className="absolute inset-0 pointer-events-none z-[100]">
              {particles.map((p: any) => (
                <div key={p.id} className={`absolute right-12 bottom-12 ${p.shape === 'carrot' ? 'carrot-bit' : ''}`}
                  style={{ '--tx': p.tx, '--ty': p.ty, width: p.size, height: p.size, backgroundColor: p.color, borderRadius: p.shape === 'circle' ? '50%' : '2px', animation: `particle-fly 1s cubic-bezier(0.1, 0.8, 0.3, 1) ${p.delay}s forwards` } as any}
                />
              ))}
              <div className="absolute right-12 bottom-12" style={{ transform: `rotate(${stampAngle}deg) translate(50%, 50%)`, transformOrigin: 'center' }}>
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

          {rarity && (
            <div className="absolute bottom-32 left-2 z-[60] transform -rotate-6 hover:rotate-0 transition-all duration-300">
              <RaritySeal rarity={rarity} />
            </div>
          )}

          <div className="flex-1 flex flex-col relative">
            <div className={`flex-1 ${cardBgColors[dominantStat]} transition-colors duration-500 relative p-4 flex flex-col items-center justify-center border-b-[6px] border-black`}>
              <div className="absolute top-3 left-3 w-4 h-4 rounded-full bg-white border-2 border-black opacity-60"></div>
              <div className="absolute bottom-6 right-3 w-5 h-5 rounded-full bg-white border-2 border-black opacity-60"></div>
              <div className="transform scale-125 transition-transform duration-300 relative">
                <Avatar selectedParts={data.selectedParts} dominantStat={dominantStat} />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-30">
                  <div className="bg-black text-white px-4 py-2 rounded-2xl border-2 border-white shadow-sm flex items-center justify-center min-w-[120px]">
                    <h2 className="font-rounded font-black text-lg uppercase tracking-wider leading-none text-center whitespace-nowrap">{data.name}</h2>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-3 py-2 bg-white border-b-[4px] border-gray-100">
              {['mod', 'bus', 'klurighet'].map((s) => (
                <div key={s} className={`flex items-center gap-1 font-bold font-rounded text-sm ${dominantStat === s ? 'scale-110' : 'opacity-60'} transition-all duration-300`}>
                  <div className={`w-2 h-2 rounded-full ${s === 'mod' ? 'bg-livia-red' : s === 'bus' ? 'bg-livia-yellow' : 'bg-livia-blue'}`}></div>
                  <span className={s === 'mod' ? 'text-livia-red' : s === 'bus' ? 'text-yellow-600' : 'text-livia-blue'}>{(TRANSLATIONS.stats as any)[s][lang]}</span>
                  <span className="text-black text-lg animate-pulse">{(stats as any)[s]}</span>
                </div>
              ))}
            </div>

            <div className="h-40 p-5 bg-livia-bg text-sm font-hand leading-snug flex flex-col justify-center items-center text-center">
              <p className={`text-lg font-bold ${statTextColors[dominantStat]} mb-2`}>{TRANSLATIONS.energyTypes[dominantStat][lang]}</p>
              <p className="text-gray-800 text-lg">"{flavorText}"</p>
            </div>

            <div className="bg-black text-white py-2 px-3 text-center font-hand text-[10px] min-h-[32px] flex flex-col items-center justify-center leading-none">
              <span className="opacity-80 mb-0.5">{TRANSLATIONS.idTitle[lang]}</span>
              <span className="font-mono font-bold tracking-widest text-livia-yellow">{uniqueId}</span>
            </div>
          </div>

          {/* 【修复点 1】：恢复原本右侧的能量条 */}
          <StatBar stats={stats} />
        </div>

        {/* === BACK FACE === */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-black border-[6px] border-black rounded-3xl shadow-comic overflow-hidden group/back">

          {/* 1. 稀有度环境光 (底层) */}
          {rarity && rarity !== 'C' && rarity !== 'U' && (
            <div className={`absolute inset-0 transition-opacity duration-1000 ${activeEffect.glow} z-0`} />
          )}

          {/* 2. 星球本体 【修复点 2】：恢复了 w-full h-full，让 PlanetCanvas 能占满全屏 */}
          <div className="absolute inset-0 w-full h-full z-10 transition-transform duration-700 group-hover/back:scale-[1.03]">
            <PlanetCanvas
              parts={data.selectedPlanetParts}
              uniqueId={uniqueId}
              lang={lang}
            />
          </div>

          {/* 3. 稀有度特效光圈 (叠加层，不影响星球) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 -translate-y-4">
            {/* Legendary 专属旋转星环 */}
            {rarity === 'L' && (
              <>
                <div className="absolute w-[340px] h-[340px] border-2 border-yellow-400/20 rounded-full animate-spin-slow" />
                <div className="absolute w-[310px] h-[310px] border border-yellow-200/10 rounded-full animate-spin-reverse" />
              </>
            )}
            {/* 稀有度保护外圈 */}
            {rarity && activeEffect.ring && (
              <div className={`absolute w-[280px] h-[280px] rounded-full border-2 transition-all duration-700 ${activeEffect.ring} scale-110 group-hover/back:scale-125`} />
            )}
          </div>

          {/* 4. 漂浮粒子层 (E/L 专属) */}
          {(rarity === 'L' || rarity === 'E') && (
            <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen animate-float-particles z-30">
              <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};