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
  const [selectedEdge, setSelectedEdge] = useState<{ i: number, type: string } | null>(null);
  const [typePage, setTypePage] = useState(0);

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
  const RADIUS = 40;   // percentage
  
  // Calculate positions
  const positions = validRelations.map((rel, index) => {
    const total = validRelations.length;

    // 动态起始角度
    let startAngle = -Math.PI / 2; // 默认从正上方开始 (适合 1人, 3人)
    if (total === 2) {
      // 2人时：改为左右水平分布，彻底空出上下空间给名字标签
      startAngle = Math.PI;
    } else if (total === 4) {
      // 4人时：呈 X 型对角线分布，避开正上正下
      startAngle = -Math.PI / 4;
    }

    // 计算当前角度
    const angle = (index * (360 / total)) * (Math.PI / 180) + startAngle;
    
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
                  className="absolute z-[60] flex items-center justify-center pointer-events-auto cursor-pointer group"
                  style={{
                    left: `${labelX}%`,
                    top: `${labelY}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onClick={() => {
                    setSelectedEdge({ i, type: pos.relationType });
                    setTypePage(0);
                  }}
                >
                  <div className="bg-white border-2 border-black rounded-full px-3 py-1 text-[10px] font-bold text-gray-800 shadow-[2px_2px_0_black] whitespace-nowrap transition-transform hover:scale-110 active:scale-95 group-hover:bg-livia-yellow">
                    {relationLabel}
                  </div>
                </div>
             );
          })}

          {/* Relation Type Picker Modal (Paginated) */}
          {selectedEdge && (
            <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-fade-in pointer-events-auto">
              <div className="bg-white border-[3px] border-black rounded-2xl p-5 w-full max-w-[260px] shadow-[8px_8px_0_black] animate-scale-in">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest">{lang === 'cn' ? '修改关系' : 'EDIT RELATION'}</h3>
                  <button onClick={() => { setSelectedEdge(null); setTypePage(0); }} className="text-xl font-black">&times;</button>
                </div>

                <div className="flex flex-col min-h-[140px] justify-between">
                  <div className="grid grid-cols-2 grid-rows-2 gap-2">
                    {Object.entries(TRANSLATIONS.ui.relationTypes)
                      .slice(typePage * 4, (typePage + 1) * 4)
                      .map(([key, val]) => {
                        const isCurrent = selectedEdge.type === key;
                        return (
                          <button
                            key={key}
                            onClick={() => {
                              // In a full implementation, this would trigger an update callback
                              setSelectedEdge(null);
                              setTypePage(0);
                            }}
                            className={`
                              p-2 rounded-lg font-bold transition-all text-[11px] h-[42px] flex items-center justify-center
                              ${isCurrent
                                ? 'bg-livia-yellow border-[3px] border-black shadow-[3px_3px_0_black] -translate-y-1 z-10'
                                : 'bg-white border-[1px] border-black/10 text-gray-500 hover:border-black/30'}
                            `}
                          >
                            <span className="truncate">{(val as any)[lang]}</span>
                          </button>
                        );
                      })
                    }
                  </div>

                  {/* Dots */}
                  {Object.keys(TRANSLATIONS.ui.relationTypes).length > 4 && (
                    <div className="flex justify-center gap-1.5 mt-4">
                      {Array.from({ length: Math.ceil(Object.keys(TRANSLATIONS.ui.relationTypes).length / 4) }).map((_, i) => (
                        <button key={i} onClick={() => setTypePage(i)} className={`transition-all duration-300 rounded-full ${typePage === i ? 'w-10 h-2.5 bg-black' : 'w-2.5 h-2.5 bg-gray-200'}`} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

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
