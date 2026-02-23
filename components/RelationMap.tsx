import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { PassportData, Language } from '../types';
import { Avatar } from './Avatar';
import { calculateStats, getDominantStat, TRANSLATIONS } from '../utils/gameLogic';

interface RelationMapProps {
  currentUser: PassportData;
  passports: PassportData[];
  onClose: () => void;
  lang: Language;
}

export const RelationMap: React.FC<RelationMapProps> = ({
  currentUser,
  passports,
  onClose,
  lang
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  // Filter valid relationships
  const relationships = currentUser.relationships || [];
  const validRelations = relationships
    .map(rel => {
      const target = passports.find(p => p.id === rel.targetId);
      return target ? { ...rel, target } : null;
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  // Constants for layout
  const CENTER_X = 50; // percentage
  const CENTER_Y = 50; // percentage
  const RADIUS = 32;   // percentage
  
  // Calculate positions
  const positions = validRelations.map((rel, index) => {
    const total = validRelations.length;
    const angle = (index * (360 / total)) * (Math.PI / 180) - Math.PI / 2; // Start from top
    
    const x = CENTER_X + RADIUS * Math.cos(angle); 
    const y = CENTER_Y + RADIUS * Math.sin(angle);
    
    return { ...rel, x, y };
  });

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center animate-fade-in">
      {/* Dialog Body */}
      <div className="relative bg-[#fdfdf9] border-4 border-black rounded-3xl shadow-[8px_8px_0_black] w-[90%] max-w-2xl h-[80vh] overflow-hidden flex flex-col">
        
        {/* Dot Grid Pattern Background */}
        <div className="absolute inset-0 pointer-events-none opacity-20" 
             style={{ 
               backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', 
               backgroundSize: '24px 24px' 
             }} 
        />

        {/* Header / Close Button (Pixel-copy from StoryTab.tsx) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-6 z-50 text-gray-400 hover:text-black text-5xl font-black leading-none transition-colors duration-200 hover:scale-110"
          title={TRANSLATIONS.ui.close?.[lang] || 'Close'}
        >
          ×
        </button>

        <h2 className="text-center mt-6 text-2xl font-black uppercase tracking-widest relative z-10 pointer-events-none">
          {TRANSLATIONS.ui.starMapTitle[lang]}
        </h2>

        {/* Map Container */}
        <div className="flex-1 relative w-full h-full">
          
          {/* 1. 最底层：连线 (SVG Lines Layer) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {positions.map((pos, i) => (
              <line
                key={i}
                x1={`${CENTER_X}%`}
                y1={`${CENTER_Y}%`}
                x2={`${pos.x}%`}
                y2={`${pos.y}%`}
                stroke="black"
                strokeWidth="2"
                strokeDasharray="5,5"
                className="opacity-50"
              />
            ))}
          </svg>

          {/* 2. 中间层：头像 (Avatars Layer - Center & Surrounding) */}
          
          {/* Center Avatar (User) */}
          <div 
            className="absolute z-20"
            style={{ 
              left: `${CENTER_X}%`, 
              top: `${CENTER_Y}%`, 
              transform: 'translate(-50%, -50%)' 
            }}
          >
            {/* Name Tag (Moved Below for Center User) */}
            <div 
              className="absolute z-50 bg-white border-2 border-black px-2 py-0.5 rounded text-[10px] font-bold shadow-[1px_1px_0_black] whitespace-nowrap"
              style={{
                top: '110%',
                left: '50%',
                transform: 'translateX(-50%)'
              }}
            >
              {currentUser.name}
            </div>

            {/* Avatar Frame - Center (Unified Size) */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-black bg-white overflow-hidden shadow-[3px_3px_0_black] relative z-10">
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="scale-[0.7]">
                   <Avatar 
                     selectedParts={currentUser.selectedParts} 
                     dominantStat={getDominantStat(calculateStats(currentUser.selectedParts))} 
                   />
                 </div>
               </div>
            </div>
          </div>

          {/* Surrounding Avatars */}
          {positions.map((pos, i) => (
            <div
              key={`avatar-${i}`}
              className="absolute z-20"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {/* Name Tag (Moved Above for Surrounding Users) */}
              <div 
                className="absolute z-50 bg-white border-2 border-black px-2 py-0.5 rounded text-[10px] font-bold shadow-[1px_1px_0_black] whitespace-nowrap"
                style={{
                    bottom: '110%',
                    left: '50%',
                    transform: 'translateX(-50%)'
                }}
              >
                {pos.target.name}
              </div>

              {/* Avatar Frame - Surrounding */}
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-black bg-white shadow-[3px_3px_0_black] overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="scale-[0.7]">
                        <Avatar 
                            selectedParts={pos.target.selectedParts} 
                            dominantStat={getDominantStat(calculateStats(pos.target.selectedParts))} 
                        />
                    </div>
                </div>
              </div>
            </div>
          ))}

          {/* 3. 最顶层：关系标签 (Relation Labels Layer) */}
          {positions.map((pos, i) => {
             const relationLabel = (TRANSLATIONS.ui.relationTypes as any)[pos.relationType]?.[lang] || pos.relationType;
             
             // Midpoint for label
             const labelX = (CENTER_X + pos.x) / 2;
             const labelY = (CENTER_Y + pos.y) / 2;

             return (
               <div
                  key={`label-${i}`}
                  className="absolute z-[60] bg-white border-2 border-black rounded-full px-2 py-0.5 text-[10px] font-bold text-gray-800 shadow-[1px_1px_0_black] whitespace-nowrap flex items-center justify-center"
                  style={{
                    left: `${labelX}%`,
                    top: `${labelY}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {relationLabel}
                </div>
             );
          })}

          {/* Empty State */}
          {validRelations.length === 0 && (
            <div className="absolute top-[65%] left-1/2 -translate-x-1/2 text-center text-gray-400 font-hand text-lg w-full px-4">
              {TRANSLATIONS.ui.starMapEmpty[lang]}
            </div>
          )}

        </div>
      </div>
    </div>,
    document.body
  );
};
