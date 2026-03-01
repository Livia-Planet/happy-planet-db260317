import React, { useState, useEffect } from 'react';
import { CharacterData, CharacterStats, PartCategory, PlanetCategory, Language } from '../types';
import { getPartList } from '../data/parts';
import { TRANSLATIONS, getPartName } from '../utils/gameLogic';
import { DiceIcon } from './Icons';

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
  switch (id) {
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
  // === STAT ICONS (SVG LINE ART) ===
  const ModIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );

  const BusIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );

  const KlurighetIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
      <line x1="9" y1="18" x2="15" y2="18" />
      <line x1="10" y1="22" x2="14" y2="22" />
    </svg>
  );

  // === PAGINATION STATE ===
  const [currentPage, setCurrentPage] = useState(0);

  // Name validation regex: letters, one dot, one alphanumeric surname
  const nameRegex = /^[A-Za-z]+\.[A-Za-z0-9]$/;

  const sanitizeName = (val: string) => {
    // strip invalid chars
    let cleaned = val.replace(/[^A-Za-z0-9\.]/g, '');
    // ensure only one dot
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
    // always include a dot and one-char surname
    if (!cleaned.includes('.') && cleaned.length > 0) {
      cleaned = `${cleaned}.A`;
    }
    // truncate surname to 1 char
    if (cleaned.includes('.')) {
      const [first, last] = cleaned.split('.');
      cleaned = `${first.slice(0, 12)}.${last.slice(0,1)}`;
    }
    return cleaned.toUpperCase();
  };

  const handleNameInput =(val: string) => {
    // 只允许字母、数字和点，且转为大写
    const cleaned = val.replace(/[^A-Za-z0-9\.]/g, '').toUpperCase();
    updateName(cleaned);
  };

  const handleRandomName = () => {
    // lazy-load generator from utils
    import('../utils/gameLogic').then(m => {
      updateName(m.generateStarName().toUpperCase());
    });
  };
  const ITEMS_PER_PAGE = 4;

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
    <div
      className="w-full max-w-[340px] h-[480px] flex flex-col mt-8 md:mt-0 relative"
    >

      {/* --- FOLDER TABS (Dynamic based on View) --- */}
      <div className="flex w-full px-3 space-x-1 relative z-10 translate-y-[4px] overflow-hidden">
        {currentTabs.map((tabId) => {
          const uiKey = getTabLabelKey(tabId) as keyof typeof TRANSLATIONS.ui;
          const label = TRANSLATIONS.ui[uiKey][lang];
          // Adaptive font size based on label length to prevent overflow
          const fontSize = label.length > 10 ? 'text-[9px]' : label.length > 7 ? 'text-[10px]' : 'text-xs md:text-sm';

          return (
            <button
              key={tabId}
              onClick={() => onTabChange(tabId)}
              className={`
                flex-1 min-w-0 px-1 py-2 rounded-t-xl font-rounded font-bold border-t-[4px] border-l-[4px] border-r-[4px] border-black transition-all truncate
                ${fontSize}
                ${activeTab === tabId
                  ? 'bg-white pb-4 translate-y-0'
                  : 'bg-gray-200 text-gray-500 hover:bg-gray-100 translate-y-1'}
              `}
              title={label}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* --- MAIN PANEL --- */}
      <div className="flex-1 bg-white border-[6px] border-black rounded-xl rounded-tl-none shadow-comic p-4 flex flex-col relative z-20 overflow-hidden">

        {/* Name Input Section (Always Visible) */}
        <div className="mb-4 border-b-[3px] border-gray-200 pb-3 shrink-0">
          <label className="block font-hand font-bold text-lg mb-1 text-gray-500 leading-none">
            {TRANSLATIONS.ui.residentName[lang]}
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              value={data.name}
              onChange={(e) => handleNameInput(e.target.value)}
              className="w-full border-[3px] border-black rounded-lg p-2 pr-10 font-rounded font-bold text-xl uppercase focus:outline-none focus:ring-4 focus:ring-livia-yellow transition-all"
              placeholder={TRANSLATIONS.namePlaceholder[lang]}
              maxLength={14}
            />
            <button
              onClick={handleRandomName}
              title="Random"
              className="absolute right-2 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
            >
              <DiceIcon className="w-5 h-5 text-black" />
            </button>
          </div>
        </div>

        {/* --- PAGINATED GRID AREA --- */}
        <div className="flex-1 flex flex-col relative min-h-0 h-full">

          {/* Grid Container - Locked height with safe area */}
          <div className="flex-1 overflow-hidden px-1 pt-1 pb-2">
            <div
              key={`${activeTab}-${currentPage}`} // Trigger animation on change
              className={`grid grid-cols-2 grid-rows-2 animate-slideFade h-full w-full ${isBackView ? 'gap-3' : 'gap-x-4 gap-y-6'}`}
            >
              {currentParts.map(part => {
                const partName = getPartName(part.id, lang);
                // Force micro font size for character parts
                const nameFontSize = isBackView ? 'text-xs' : 'text-[10px]';
                const isSelected = (isBackView ? data.selectedPlanetParts[activeTab as PlanetCategory] : data.selectedParts[activeTab as PartCategory]) === part.id;

                return (
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
                      relative flex flex-col items-center justify-center p-2 rounded-lg transition-all transform duration-150
                      active:scale-95 hover:scale-[1.02] w-full h-full
                      ${isBackView ? 'aspect-[1.5/1] border-[3px] border-black' : 'max-h-[80px] border-black'}
                      ${isSelected
                        ? (isBackView ? 'bg-livia-blue text-white shadow-[4px_4px_0_black] -translate-y-1' : 'bg-livia-yellow border-[3px] text-black shadow-[4px_4px_0_black] -translate-y-1 z-10')
                        : (isBackView ? 'bg-white text-gray-700 hover:bg-gray-50 shadow-[2px_2px_0_rgba(0,0,0,0.1)]' : 'bg-white border-[1px] border-black/10 text-gray-700 hover:bg-gray-50')}
                    `}
                  >
                    {/* Visual Preview for Planet Parts (Simple Dots/Icons) */}
                    {isBackView && (
                      <div className={`w-5 h-5 rounded-full border border-black mb-1
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

                    <div className="flex flex-col items-center justify-center w-full gap-1">
                      <span className={`${nameFontSize} font-bold font-rounded text-center leading-none line-clamp-1 px-1 w-full`}>
                        {partName}
                      </span>

                      {/* Stats Icons (Only for Front View) - Micro arrangement */}
                      {!isBackView && (
                        <div className="flex justify-center gap-1.5 w-full scale-90">
                          {part.stats.mod > 0 && (
                            <div className="flex items-center gap-0.5">
                              <ModIcon className="w-2.5 h-2.5 text-livia-red" />
                              <span className="text-[10px] font-black font-rounded text-livia-red">{part.stats.mod}</span>
                            </div>
                          )}
                          {part.stats.bus > 0 && (
                            <div className="flex items-center gap-0.5">
                              <BusIcon className="w-2.5 h-2.5 text-yellow-600" />
                              <span className="text-[10px] font-black font-rounded text-yellow-600">{part.stats.bus}</span>
                            </div>
                          )}
                          {part.stats.klurighet > 0 && (
                            <div className="flex items-center gap-0.5">
                              <KlurighetIcon className="w-2.5 h-2.5 text-livia-blue" />
                              <span className="text-[10px] font-black font-rounded text-livia-blue">{part.stats.klurighet}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* --- PAGINATION DOTS (Isolated and Non-shrinking) --- */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-2 mb-1 shrink-0">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx)}
                  className={`transition-all duration-300 rounded-full border border-black ${currentPage === idx
                      ? 'w-7 h-2.5 bg-livia-yellow' // Active: Capsule
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
          <div className="border-t-[3px] border-gray-200 pt-3 mt-1 space-y-1.5 opacity-80 pointer-events-none shrink-0">
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