import React, { useEffect, useState } from 'react';
import { Card } from '../Card';
import { ParticleOverlay } from './ParticleOverlay';
import { PassportData, Language, Rarity } from '../../types';

interface SuccessOverlayProps {
  isOpen: boolean;
  passportData: PassportData | null;
  lang: Language;
  onClose: () => void;
  playStampSound: () => void;
}

// === 大师级视觉配置：定义每个等级的灵魂 ===
const RARITY_THEMES: Record<Rarity, { color: string; label: string; bgEffect?: string; cardEffect?: string }> = {
  C: {
    color: '#FFD93D',
    label: 'COMMON',
    cardEffect: ''
  },
  U: {
    color: '#4ECDC4',
    label: 'UNCOMMON',
    cardEffect: 'animate-float'
  },
  R: {
    color: '#45B7D1',
    label: 'RARE',
    cardEffect: 'animate-rare-glow'
  },
  E: {
    color: '#A29BFE',
    label: 'EPIC',
    cardEffect: 'animate-epic-pulse'
  },
  L: {
    color: '#FFD700',
    label: 'LEGENDARY',
    bgEffect: 'animate-legendary-flash', // 全屏闪烁
    cardEffect: 'animate-gold-flow'      // 金光流转边框
  },
};

export const SuccessOverlay: React.FC<SuccessOverlayProps> = ({
  isOpen,
  passportData,
  lang,
  onClose,
  playStampSound
}) => {
  const [showCard, setShowCard] = useState(false);
  const [showStamp, setShowStamp] = useState(false);
  const [explosionTrigger, setExplosionTrigger] = useState(0);
  const [shake, setShake] = useState(false);
  const [showFlash, setShowFlash] = useState(false);

  const currentRarity = passportData?.rarity || 'C';
  const theme = RARITY_THEMES[currentRarity];

  useEffect(() => {
    if (isOpen && passportData) {
      setShowCard(true);
      const timer = setTimeout(() => {
        setShowStamp(true);
        playStampSound();
        setExplosionTrigger(prev => prev + 1);
        setShake(true);

        // 如果是传奇卡，触发全屏闪烁
        if (currentRarity === 'L') {
          setShowFlash(true);
          setTimeout(() => setShowFlash(false), 500);
        }

        setTimeout(() => setShake(false), 300);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setShowCard(false);
      setShowStamp(false);
      setExplosionTrigger(0);
      setShowFlash(false);
    }
  }, [isOpen, passportData, playStampSound, currentRarity]);

  if (!isOpen || !passportData) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center overflow-hidden">
      {/* 1. 背景暗化层 */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md animate-fade-in" onClick={onClose} />

      {/* 2. 传奇全屏闪烁层 */}
      {showFlash && <div className="absolute inset-0 z-[1100] bg-white animate-flash-overlay pointer-events-none" />}

      {/* 3. 粒子喷泉层 */}
      <div className="absolute inset-0 z-50 pointer-events-none">
        <ParticleOverlay trigger={explosionTrigger} color={theme.color} />
      </div>

      {/* 4. 核心内容容器 (调小了整体 scale 以适配 100% 屏幕) */}
      <div className={`relative z-40 transition-all duration-700 transform 
        ${showCard ? 'scale-90 opacity-100 rotate-1' : 'scale-50 opacity-0 rotate-0'}
        ${shake ? 'animate-stamp-hit' : ''}
        translate-y-0
      `}>

        {/* 顶部标签 - 现在 Common 也会显示 */}
        {showStamp && (
          <div
            className={`absolute -top-14 left-1/2 -translate-x-1/2 font-black text-5xl italic tracking-tighter animate-bounce-in whitespace-nowrap z-50`}
            style={{
              color: theme.color,
              textShadow: currentRarity === 'C' ? '2px 2px 0 #000' : `0 0 20px ${theme.color}aa, 4px 4px 0 #000`
            }}
          >
            {currentRarity === 'L' ? '👑 LEGENDARY 👑' : `✨ ${theme.label} ✨`}
          </div>
        )}

        {/* 卡片包装层：用于实现金光边框等特殊效果 */}
        <div className={`relative p-2 rounded-[2rem] ${theme.cardEffect}`}>
          <Card
            data={passportData}
            stats={passportData.stats || { mod: 0, bus: 0, klurighet: 0 }}
            flavorText={passportData.bio || ""}
            isFlipped={false}
            onFlip={() => { }}
            lang={lang}
            showStamp={showStamp}
            stampAngle={-15}
          />
        </div>

        {/* 底部按钮 */}
        {showStamp && (
          <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-full flex justify-center animate-bounce-in">
            <button
              onClick={onClose}
              className="px-10 py-3 text-black border-[4px] border-black font-black text-xl rounded-full shadow-[6px_6px_0_0_#000] hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
              style={{ backgroundColor: theme.color }}
            >
              {lang === 'cn' ? '收进口袋！' : 'GOT IT!'} 🥕
            </button>
          </div>
        )}
      </div>

      {/* === 大师级动画库 === */}
      <style>{`
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }

        /* 全屏白闪 (Legendary 专属) */
        @keyframes flash-overlay {
          0% { opacity: 0; }
          10% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-flash-overlay { animation: flash-overlay 0.5s ease-out; }

        /* 金光流转边框 (Legendary 专属) */
        .animate-gold-flow {
          position: relative;
          background: linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff);
          background-size: 400% 400%;
          animation: gold-flow-border 3s linear infinite;
          box-shadow: 0 0 50px rgba(255, 215, 0, 0.5);
        }
        @keyframes gold-flow-border {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* 史诗紫脉冲 (Epic 专属) */
        .animate-epic-pulse {
          box-shadow: 0 0 0 0 rgba(162, 155, 254, 0.7);
          animation: epic-pulse 2s infinite;
          border-radius: 2rem;
        }
        @keyframes epic-pulse {
          0% { box-shadow: 0 0 0 0 rgba(162, 155, 254, 0.7); }
          70% { box-shadow: 0 0 30px 20px rgba(162, 155, 254, 0); }
          100% { box-shadow: 0 0 0 0 rgba(162, 155, 254, 0); }
        }

        /* 稀有蓝辉光 (Rare 专属) */
        .animate-rare-glow {
          filter: drop-shadow(0 0 15px #45B7D1);
          animation: rare-float 3s ease-in-out infinite;
        }
        @keyframes rare-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .animate-float {
          filter: drop-shadow(0 0 10px rgba(78, 205, 196, 0.3));
          animation: uncommon-float 4s ease-in-out infinite;
        }
        @keyframes uncommon-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(-2deg); }
        }

        /* 标签弹出动画 */
        .animate-bounce-in { animation: bounce-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes bounce-in { 
          0% { transform: translate(-50%, 30px) scale(0); opacity: 0; }
          100% { transform: translate(-50%, 0) scale(1); opacity: 1; }
        }

        /* 受击震动 */
        .animate-stamp-hit { animation: stamp-hit 0.3s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes stamp-hit {
          0%, 100% { transform: scale(90%) rotate(1deg) translateX(0); }
          25% { transform: scale(88%) rotate(-1deg) translateX(-8px); }
          75% { transform: scale(88%) rotate(2deg) translateX(8px); }
        }
      `}</style>
    </div>
  );
};