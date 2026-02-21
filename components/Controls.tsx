import React, { useState, useEffect } from 'react';
import { CharacterData, CharacterStats, PartCategory, PlanetCategory, Language } from '../types';
import { getPartList } from '../data/parts';
import { TRANSLATIONS, getPartName } from '../utils/gameLogic';

export type TabType = PartCategory | PlanetCategory;

interface ControlsProps {
  data: CharacterData;
  derivedStats: CharacterStats;
  activeTab: TabType;
  isBackView: boolean;
  onTabChange: (tab: TabType) => void;
  updateName: (name: string) => void;
  updatePart: (category: PartCategory, partId: string) => void;
  updatePlanetPart: (category: PlanetCategory, partId: string) => void;
  lang: Language;
}

// Helper to get translated tab label key
const getTabLabelKey = (id: string) => {
  switch(id) {
    case 'atmosphere': return 'atmos';
    case 'companion': return 'comp';
    default: return id; // body, ears, face, hair, access, base, surface
  }
};

export const Controls: React.FC<ControlsProps> = ({ 
  data, 
  derivedStats, 
  activeTab, 
  isBackView,
  onTabChange, 
  updateName, 
  updatePart, 
  updatePlanetPart, 
  lang 
}) => {
  // === PAGINATION STATE ===
  const [currentPage, setCurrentPage] = useState(0);
  const ITEMS_PER_PAGE = 6;

  // Reset pagination when switching tabs or flipping the card
  useEffect(() => {
    setCurrentPage(0);
  }, [activeTab, isBackView]);

  // Define Tab structures for both sides
  // UPDATED: body, ears, face, hair, access
  const FRONT_TABS: PartCategory[] = ['body', 'ears', 'face', 'hair', 'access'];
  const BACK_TABS: PlanetCategory[] = ['base', 'surface', 'atmosphere', 'companion'];
  const currentTabs = isBackView ? BACK_TABS : FRONT_TABS;

  // Calculate Pagination Data
  const allParts = getPartList(activeTab);
  const totalPages = Math.ceil(allParts.length / ITEMS_PER_PAGE);
  const currentParts = allParts.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

  return (
    <div className="w-full max-w-[340px] h-[480px] flex flex-col mt-8 md:mt-0 relative">
      
      {/* --- FOLDER TABS (Dynamic based on View) --- */}
      <div className="flex pl-4 space-x-1 relative z-10 translate-y-[4px]">
        {currentTabs.map((tabId) => {
          const uiKey = getTabLabelKey(tabId) as keyof typeof TRANSLATIONS.ui;
          return (
            <button
              key={tabId}
              onClick={() => onTabChange(tabId)}
              className={`
                px-2 py-2 rounded-t-lg font-rounded font-bold text-xs md:text-sm border-t-[4px] border-l-[4px] border-r-[4px] border-black transition-all
                ${activeTab === tabId 
                  ? 'bg-white pb-3 translate-y-0' 
                  : 'bg-gray-200 text-gray-500 hover:bg-gray-100 translate-y-1'}
              `}
            >
              {TRANSLATIONS.ui[uiKey][lang]}
            </button>
          );
        })}
      </div>

      {/* --- MAIN PANEL --- */}
      <div className="flex-1 bg-white border-[6px] border-black rounded-xl rounded-tl-none shadow-comic p-5 flex flex-col relative z-20 overflow-hidden">
        
        {/* Name Input Section (Always Visible) */}
        <div className="mb-4 border-b-[3px] border-gray-200 pb-3 shrink-0">
          <label className="block font-hand font-bold text-lg mb-1 text-gray-500">
            {TRANSLATIONS.ui.residentName[lang]}
          </label>
          <input 
            type="text" 
            value={data.name}
            onChange={(e) => updateName(e.target.value)}
            className="w-full border-[3px] border-black rounded-lg p-2 font-rounded font-bold text-xl uppercase focus:outline-none focus:ring-4 focus:ring-livia-yellow transition-all"
            placeholder={TRANSLATIONS.namePlaceholder[lang]}
            maxLength={12}
          />
        </div>

        {/* --- PAGINATED GRID AREA --- */}
        <div className="flex-1 flex flex-col relative min-h-0">
          
          {/* Grid Container with fixed layout properties to prevent jumping */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div 
              key={`${activeTab}-${currentPage}`} // Trigger animation on change
              className="grid grid-cols-2 gap-3 animate-slideFade content-start pb-2"
            >
              {currentParts.map(part => (
                <button
                  key={part.id}
                  onClick={() => {
                    if (isBackView) {
                      updatePlanetPart(activeTab as PlanetCategory, part.id);
                    } else {
                      updatePart(activeTab as PartCategory, part.id);
                    }
                  }}
                  className={`
                    relative flex flex-col items-center p-2 rounded-lg border-[3px] transition-all transform duration-150
                    active:scale-95 hover:scale-[1.02] h-24 justify-between
                    ${(isBackView ? data.selectedPlanetParts[activeTab as PlanetCategory] : data.selectedParts[activeTab as PartCategory]) === part.id 
                      ? (isBackView ? 'bg-livia-blue border-black text-white shadow-[3px_3px_0_black] -translate-y-1' : 'bg-livia-yellow border-black text-black shadow-[3px_3px_0_black] -translate-y-1') 
                      : 'bg-white border-black text-gray-700 hover:bg-gray-50'}
                  `}
                >
                  {/* Visual Preview for Planet Parts (Simple Dots/Icons) */}
                  {isBackView && (
                    <div className={`w-5 h-5 rounded-full border border-black 
                      ${part.id.includes('red') ? 'bg-red-500' : ''}
                      ${part.id.includes('blue') ? 'bg-blue-500' : ''}
                      ${part.id.includes('green') ? 'bg-emerald-500' : ''}
                      ${part.id.includes('yellow') ? 'bg-amber-500' : ''}
                      ${part.id.includes('none') ? 'bg-gray-100' : ''}
                      ${part.id.includes('craters') ? 'bg-gray-400' : ''}
                      ${part.id.includes('swirls') ? 'bg-gray-400' : ''}
                      ${part.id.includes('rings') ? 'bg-indigo-200' : ''}
                      ${part.id.includes('glow') ? 'bg-purple-200' : ''}
                      ${part.id.includes('moon') ? 'bg-gray-300' : ''}
                      ${part.id.includes('ufo') ? 'bg-green-300' : ''}
                    `} />
                  )}

                  <span className="text-xs font-bold font-rounded text-center leading-tight line-clamp-2">{getPartName(part.id, lang)}</span>
                  
                  {/* Stats Dots (Only for Front View) */}
                  {!isBackView && (
                    <div className="flex gap-1 mt-1">
                      {part.stats.mod > 0 && <div className="w-2 h-2 rounded-full bg-livia-red border border-black" />}
                      {part.stats.bus > 0 && <div className="w-2 h-2 rounded-full bg-livia-yellow border border-black" />}
                      {part.stats.klurighet > 0 && <div className="w-2 h-2 rounded-full bg-livia-blue border border-black" />}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* --- PAGINATION DOTS (Fixed at Bottom) --- */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-3 pb-1 shrink-0">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx)}
                  className={`transition-all duration-300 rounded-full ${
                    currentPage === idx 
                      ? 'w-8 h-3 bg-livia-yellow border border-black' // Active: Capsule
                      : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'      // Inactive: Dot
                  }`}
                  aria-label={`Go to page ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Stats Visualization (Mini) - Only show on Front View */}
        {!isBackView && (
          <div className="border-t-[3px] border-gray-200 pt-3 mt-2 space-y-1.5 opacity-80 pointer-events-none shrink-0">
             <div className="flex items-center gap-2">
               <div className="w-8 font-bold text-xs font-rounded text-livia-red">{TRANSLATIONS.statLabels.mod[lang]}</div>
               <div className="flex-1 h-2 bg-gray-200 rounded-full border border-black overflow-hidden">
                  <div className="h-full bg-livia-red transition-all duration-500" style={{ width: `${(derivedStats.mod / 9) * 100}%` }}></div>
               </div>
               <span className="text-xs font-bold w-3 text-right">{derivedStats.mod}</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-8 font-bold text-xs font-rounded text-yellow-600">{TRANSLATIONS.statLabels.bus[lang]}</div>
               <div className="flex-1 h-2 bg-gray-200 rounded-full border border-black overflow-hidden">
                  <div className="h-full bg-livia-yellow transition-all duration-500" style={{ width: `${(derivedStats.bus / 9) * 100}%` }}></div>
               </div>
               <span className="text-xs font-bold w-3 text-right">{derivedStats.bus}</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-8 font-bold text-xs font-rounded text-livia-blue">{TRANSLATIONS.statLabels.klurighet[lang]}</div>
               <div className="flex-1 h-2 bg-gray-200 rounded-full border border-black overflow-hidden">
                  <div className="h-full bg-livia-blue transition-all duration-500" style={{ width: `${(derivedStats.klurighet / 9) * 100}%` }}></div>
               </div>
               <span className="text-xs font-bold w-3 text-right">{derivedStats.klurighet}</span>
             </div>
          </div>
        )}

      </div>

      <style>{`
        @keyframes slideFade {
          from { opacity: 0; transform: translateX(15px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slideFade {
          animation: slideFade 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
};