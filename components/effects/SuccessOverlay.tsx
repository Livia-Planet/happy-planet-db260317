import React, { useEffect, useState } from 'react';
import { Card } from '../Card';
import { ParticleOverlay } from './ParticleOverlay';
import { PassportData, Language } from '../../types';

interface SuccessOverlayProps {
  isOpen: boolean;
  passportData: PassportData | null;
  lang: Language;
  onClose: () => void;
  playStampSound: () => void;
}

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

  useEffect(() => {
    if (isOpen && passportData) {
      // 1. 弹窗打开时，卡片率先弹出
      setShowCard(true);

      // 2. 扣除 0.5 秒的“悬停期待感”后，砸下印章！
      const timer = setTimeout(() => {
        setShowStamp(true);
        playStampSound(); // 触发 App.tsx 传来的音效
        setExplosionTrigger(prev => prev + 1); // 触发满屏粒子
        
        // 配合印章落下的卡片物理震动
        setShake(true);
        setTimeout(() => setShake(false), 300);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      // 关闭时重置状态
      setShowCard(false);
      setShowStamp(false);
      setExplosionTrigger(0);
    }
  }, [isOpen, passportData, playStampSound]);

  if (!isOpen || !passportData) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      {/* 背景暗化图层 */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in" onClick={onClose} />
      
      {/* 粒子喷泉层：设为最顶层，颜色为耀眼的金色 */}
      <div className="absolute inset-0 z-50 pointer-events-none">
        <ParticleOverlay trigger={explosionTrigger} color="#FFD700" />
      </div>

      {/* 卡片容器：包含弹出、旋转和震动动画 */}
      <div className={`relative z-40 transition-all duration-500 transform 
        ${showCard ? 'scale-110 opacity-100 rotate-2' : 'scale-50 opacity-0 rotate-0'}
        ${shake ? 'animate-stamp-hit' : ''}
        -translate-y-12  {/* <--- 添加这一行，数值越大，位置越靠上 */}
      `}>
        <Card 
          data={passportData} 
          stats={passportData.stats} 
          flavorText={passportData.bio || ""} 
          isFlipped={false} 
          onFlip={() => {}} 
          lang={lang}
          showStamp={showStamp} // 控制印章出现
          stampAngle={-15} // 固定倾斜角更美观
        />

        {/* 盖章完成后才出现的“收进口袋”按钮 */}
        {showStamp && (
          <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-full flex justify-center animate-bounce-in">
             <button 
                onClick={onClose} 
                className="px-10 py-4 bg-livia-yellow text-black border-[4px] border-black font-black text-xl rounded-full shadow-[6px_6px_0_0_#000] hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
             >
                {lang === 'cn' ? '收进口袋！' : 'GOT IT!'} 🥕
             </button>
          </div>
        )}
      </div>

      <style>{`
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }

        /* 卡片受击震动 */
        .animate-stamp-hit { animation: stamp-hit 0.3s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes stamp-hit {
          0%, 100% { transform: scale(110%) rotate(2deg) translateX(0); }
          25% { transform: scale(108%) rotate(1deg) translateX(-5px); }
          75% { transform: scale(108%) rotate(3deg) translateX(5px); }
        }
      `}</style>
    </div>
  );
};