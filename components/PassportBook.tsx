import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PassportData, Language, StoryEntry } from '../types';
import { Card } from './Card';
import { Avatar } from './Avatar';
import { calculateStats, generateFlavorText, getDominantStat, TRANSLATIONS, getStarDate, ALL_PRESETS, getMixedTraits, calculateStoryReward } from '../utils/gameLogic';
import { RadarChart } from './RadarChart';
import { StoryTab } from './StoryTab';
import { RelationMap } from './RelationMap';

interface PassportBookProps {
  passports: PassportData[];
  onBack: () => void;
  onUpdatePassport: (id: string, field: keyof PassportData, value: any) => void;
  onDelete: (id: string) => void;
  lang: Language;
  onReward?: (amount: number, sourceId: string) => void; // <--- 新增这行
}

type Tab = 'profile' | 'personality' | 'relations' | 'story';

const THEMES = [
  { id: 'space', bg: '#2c3e50', text: 'text-white', isLight: false },
  { id: 'charcoal', bg: '#2D3436', text: 'text-white', isLight: false },
  { id: 'pink', bg: '#EAD7D1', text: 'text-[#5D4037]', isLight: true }, // Deep Warm Brown
  { id: 'orange', bg: '#D4A373', text: 'text-[#3E2723]', isLight: true }, // Darker Brown
  { id: 'blue', bg: '#B8C1EC', text: 'text-[#1A237E]', isLight: true }, // Deep Indigo
  { id: 'green', bg: '#A3B18A', text: 'text-[#1B5E20]', isLight: true }, // Deep Green
];

// --- STAT ICONS FOR BACKGROUND DECORATION ---
const ModIcon = ({ className, style, mode = 'solid' }: { className?: string; style?: React.CSSProperties; mode?: 'solid' | 'line' | 'mixed' }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polygon 
      points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" 
      fill={mode === 'line' ? 'none' : 'currentColor'}
      fillOpacity={mode === 'mixed' ? 0.2 : 1}
    />
  </svg>
);

const BusIcon = ({ className, style, mode = 'solid' }: { className?: string; style?: React.CSSProperties; mode?: 'solid' | 'line' | 'mixed' }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline 
      points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" 
      fill={mode === 'line' ? 'none' : 'currentColor'}
      fillOpacity={mode === 'mixed' ? 0.2 : 1}
    />
  </svg>
);

const KlurighetIcon = ({ className, style, mode = 'solid' }: { className?: string; style?: React.CSSProperties; mode?: 'solid' | 'line' | 'mixed' }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path 
      d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5" 
      fill={mode === 'line' ? 'none' : 'currentColor'}
      fillOpacity={mode === 'mixed' ? 0.2 : 1}
    />
    <line x1="9" y1="18" x2="15" y2="18" fill="none" />
    <line x1="10" y1="22" x2="14" y2="22" fill="none" />
  </svg>
);

// --- POP-ART DECORATIVE BACKGROUND COMPONENT ---
const ArtBackground = ({ dominantStat, seed }: { dominantStat: 'mod' | 'bus' | 'klurighet'; seed: string }) => {
  const bgClass = dominantStat === 'mod' ? 'bg-red-50' : dominantStat === 'bus' ? 'bg-yellow-50' : 'bg-blue-50';
  
  // Richer color sets (4+ colors per stat)
  const colorSets = {
    mod: ['text-red-400', 'text-red-200', 'text-pink-300', 'text-orange-300', 'text-rose-400', 'text-red-100'],
    bus: ['text-yellow-500', 'text-yellow-300', 'text-lime-400', 'text-amber-400', 'text-orange-400', 'text-emerald-300'],
    klurighet: ['text-blue-500', 'text-blue-300', 'text-cyan-400', 'text-indigo-400', 'text-sky-400', 'text-teal-300']
  };

  const icons = [ModIcon, BusIcon, KlurighetIcon];
  const currentColors = colorSets[dominantStat];

  // Pseudo-random generator based on seed
  const getPseudoRandom = (index: number) => {
    let hash = 0;
    const str = seed + index + "v4-grid";
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const items = useMemo(() => {
    const GRID_SIZE = 6;
    const TOTAL_CELLS = GRID_SIZE * GRID_SIZE; // 36 cells
    
    return Array.from({ length: TOTAL_CELLS }).map((_, i) => {
      const rnd = getPseudoRandom(i);
      const rnd2 = getPseudoRandom(i + 100);
      const rnd3 = getPseudoRandom(i + 200);

      const row = Math.floor(i / GRID_SIZE);
      const col = i % GRID_SIZE;
      
      // 1. Grid-Based Jitter: Base position in center of 6x6 grid cell
      let topPercent = (row / GRID_SIZE) * 100 + (100 / GRID_SIZE / 2);
      let leftPercent = (col / GRID_SIZE) * 100 + (100 / GRID_SIZE / 2);
      
      // Jitter (max 30% of cell width/height)
      const jitterMax = (100 / GRID_SIZE) * 0.3;
      topPercent += ((rnd % 100) / 50 - 1) * jitterMax;
      leftPercent += ((rnd2 % 100) / 50 - 1) * jitterMax;

      // 2. Weighted Size Distribution
      let sizeScale = 0;
      if (i < 4) { // Top 10% Giant
        sizeScale = 16;
      } else if (i >= 21) { // Bottom 40% Tiny
        sizeScale = (rnd3 % 3) + 2; // 2 to 4
      } else { // Rest Medium
        sizeScale = (rnd3 % 5) + 6; // 6 to 10
      }

      // 3. Style Rhythm (1:1 Fill vs Line)
      const mode: 'line' | 'solid' = (rnd % 10) < 5 ? 'line' : 'solid';
      let opacity = mode === 'solid' ? 0.05 : 0.15;

      // 4. Center Protection (Avatar area: top 40-60%, left 40-60%)
      const distFromCenter = Math.sqrt(Math.pow(topPercent - 50, 2) + Math.pow(leftPercent - 50, 2));
      if (distFromCenter < 20) {
        sizeScale = Math.min(sizeScale, 4); // Force to small
        opacity = 0.03; // Extremely faint
      }

      return {
        Icon: icons[rnd3 % icons.length],
        color: currentColors[rnd % currentColors.length],
        size: sizeScale * 4, // pixels
        top: topPercent + '%',
        left: leftPercent + '%',
        rotate: (rnd2 % 360) + 'deg',
        opacity,
        mode
      };
    });
  }, [seed, dominantStat]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${bgClass}`}>
      {items.map((item, i) => (
        <item.Icon 
          key={i} 
          mode={item.mode}
          className={`absolute ${item.color}`} 
          style={{ 
            width: `${item.size}px`,
            height: `${item.size}px`,
            top: item.top, 
            left: item.left, 
            transform: `translate(-50%, -50%) rotate(${item.rotate})`,
            opacity: item.opacity
          }} 
        />
      ))}
    </div>
  );
};

export const PassportBook: React.FC<PassportBookProps> = ({
  passports,
  onBack,
  onUpdatePassport,
  onDelete,
  lang,
  onReward
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isJobPickerOpen, setIsJobPickerOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(THEMES[0]);

  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState<'gender' | 'species' | 'rel-target' | 'rel-type' | null>(null);
  const [dropdownPage, setDropdownPage] = useState(0);

  // Form states for Add Relation
  const [pendingRelTarget, setPendingRelTarget] = useState<string | null>(null);
  const [pendingRelType, setPendingRelType] = useState<string>('friend');

  // ── Story state per passport ──
  const storageKey = selectedId ? `happyPlanet_stories_${selectedId}` : null;

  const [stories, setStories] = useState<StoryEntry[]>([]);

  // Default stories for permanent residents (id = galaxyIndex-starIndex)
  const DEFAULT_STORIES: Record<string, StoryEntry[]> = {
    'HP-00001-BOBU-B': [
      { id: '0-0', date: 'SD-2024.01', galaxyIndex: 0, starIndex: 0, title: { cn: '初遇星海', en: 'First Flight', se: 'Första Flyget' }, content: { cn: '这是我们冒险的开始，星海无边无际…', en: 'The journey begins among infinite stars…', se: 'Resan börjar bland oändliga stjärnor…' } },
      { id: '0-1', date: 'SD-2024.03', galaxyIndex: 0, starIndex: 1, title: { cn: '兔子星球的秘密', en: 'Rabbit Planet Secret', se: 'Kaninplanetens Hemlighet' }, content: { cn: '在兔子星球的地下发现了古老的壁画！', en: 'Ancient murals found underground on Rabbit Planet!', se: 'Uråldriga målningar hittades under Kaninplaneten!' } },
      { id: '0-2', date: 'SD-2024.06', galaxyIndex: 0, starIndex: 2, title: { cn: '星际野餐', en: 'Space Picnic', se: 'Rymdpicknick' }, content: { cn: '和Duddu在小行星带上野餐，吃了三个星球的零食！', en: 'Had a picnic on the asteroid belt with Duddu!', se: 'Picknickade på asteroidbältet med Duddu!' } },
    ],
    'HP-00002-DUDDU-A': [
      { id: '0-0', date: 'SD-2024.02', galaxyIndex: 0, starIndex: 0, title: { cn: '滑板穿越星云', en: 'Skating Through Nebula', se: 'Skateboard Genom Nebulosan' }, content: { cn: '第一次用滑板穿过星云！速度超快！', en: 'First time skating through a nebula! So fast!', se: 'Första gången jag skateboardade genom en nebulosa!' } },
      { id: '0-1', date: 'SD-2024.05', galaxyIndex: 0, starIndex: 1, title: { cn: '勇者的誓言', en: 'Hero\'s Oath', se: 'Hjältens Ed' }, content: { cn: '我发誓要保护所有朋友，这是英雄的使命！', en: 'I swear to protect all my friends — a hero\'s duty!', se: 'Jag svär att skydda alla mina vänner — en hjältes plikt!' } },
    ],
  };

  /** 迁移旧数据：无 galaxyIndex/starIndex 时按顺序落到第 0 页前几颗星 */
  const normalizeStories = (list: StoryEntry[]): StoryEntry[] => {
    return list.map((s, i) => {
      if (s.galaxyIndex != null && s.starIndex != null && typeof s.id === 'string') return s;
      const galaxyIndex = 0;
      const starIndex = i;
      return { ...s, id: `${galaxyIndex}-${starIndex}`, galaxyIndex, starIndex };
    });
  };

  // Load stories when selected passport changes
  useEffect(() => {
    if (!storageKey || !selectedId) { setStories([]); return; }
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed: StoryEntry[] = raw ? JSON.parse(raw) : [];
      const normalized = normalizeStories(parsed);
      if (normalized.length > 0) {
        setStories(normalized);
        if (storageKey && JSON.stringify(parsed) !== JSON.stringify(normalized)) {
          localStorage.setItem(storageKey, JSON.stringify(normalized));
        }
      } else {
        // Inject defaults for permanent residents if no saved stories
        const defaults = DEFAULT_STORIES[selectedId] || [];
        setStories(defaults);
        if (defaults.length > 0 && storageKey) {
          localStorage.setItem(storageKey, JSON.stringify(defaults));
        }
      }
    } catch { setStories([]); }
  }, [storageKey, selectedId]);

  // Find selected passport
  const activePassport = passports.find(p => p.id === selectedId);

const handleUpdateStories = useCallback((next: StoryEntry[], newlySavedText?: string) => {
    let finalStories = [...next];

    // 1. 如果有新保存的文字，并且有发奖函数
    if (newlySavedText && typeof onReward === 'function') {
      // 2. 找到刚刚保存的那篇故事 (通过内容匹配)
      const activeStoryIndex = finalStories.findIndex(s => 
        s.content.cn === newlySavedText || 
        s.content.en === newlySavedText || 
        s.content.se === newlySavedText
      );

      if (activeStoryIndex !== -1) {
        const activeStory = finalStories[activeStoryIndex] as any;

        // 3. 【核心需求】：检查这篇故事本身是否领过奖！
        if (!activeStory.hasReceivedReward) {
          try {
            const rewardAmount = calculateStoryReward(newlySavedText);
            if (rewardAmount > 0) {
              // 发射胡萝卜！
              onReward(rewardAmount, 'btn-save-story');
              
              // 4. 标记这篇故事为“已领奖”，这样再次修改保存就不会重复发金币了
              finalStories[activeStoryIndex] = {
                ...activeStory,
                hasReceivedReward: true
              };
            }
          } catch (err) {
            console.error("Reward calculation failed:", err);
          }
        }
      }
    }

    // 5. 更新状态并存入本地
    setStories(finalStories);
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(finalStories));
    }
  }, [storageKey, onReward]);

  // Calculate dynamic data for the active passport
  const activeStats = activePassport ? calculateStats(activePassport.selectedParts, activePassport.stats) : null;
  const activeFlavor = (activePassport && activeStats) ? generateFlavorText(activeStats, lang) : '';

  const handleDeleteConfirm = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
      if (selectedId === deleteId) {
        setSelectedId(null);
      }
    }
  };

  // === ARCHIVE VIEW (GRID) ===
  if (!selectedId || !activePassport || !activeStats) {
    return (
      <div className="w-full max-w-5xl mx-auto min-h-[600px] flex flex-col relative">
        {/* Theme Background Override */}
        <div className="fixed inset-0 -z-10 transition-colors duration-700" style={{ backgroundColor: currentTheme.bg }}></div>

        {/* Delete Confirmation Modal */}
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white border-[4px] border-black rounded-2xl p-6 max-w-md w-full shadow-[8px_8px_0_rgba(0,0,0,0.5)] animate-fade-in">
              <h3 className="text-2xl font-black mb-4 text-red-500 uppercase">{TRANSLATIONS.ui.delete[lang]}?</h3>
              <p className="font-hand text-xl mb-8 text-gray-700">
                {TRANSLATIONS.ui.confirmDelete[lang]}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-3 font-bold border-2 border-black rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-3 font-bold bg-red-500 text-white border-2 border-black rounded-lg shadow-[4px_4px_0_black] hover:translate-y-1 hover:shadow-[2px_2px_0_black] active:translate-y-2 active:shadow-none transition-all"
                >
                  {TRANSLATIONS.ui.delete[lang]}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="px-6 py-2 bg-white border-[3px] border-black rounded-full font-bold shadow-[4px_4px_0_black] hover:translate-y-[2px] hover:shadow-[2px_2px_0_black] active:translate-y-[4px] active:shadow-none transition-all"
          >
            ← {lang === 'cn' ? '返回编辑器' : 'Back to Editor'}
          </button>

          <div className="flex items-center gap-4">
            {/* Theme Switcher */}
            <div className="flex gap-2 bg-white/20 backdrop-blur-sm p-2 rounded-full border border-white/30 shadow-sm">
              {THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setCurrentTheme(theme)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${currentTheme.id === theme.id ? 'border-white scale-125 shadow-md ring-2 ring-white/50' : 'border-transparent opacity-80 hover:opacity-100'}`}
                  style={{ backgroundColor: theme.bg }}
                  aria-label={`Select theme ${theme.id}`}
                />
              ))}
            </div>

            <h2 className={`text-3xl md:text-4xl font-black drop-shadow-[2px_2px_0_black] stroke-black transition-colors duration-500 ${currentTheme.text}`} style={{ WebkitTextStroke: '1.5px black' }}>
              {lang === 'cn' ? '档案室' : 'ARCHIVES'}
            </h2>
          </div>
        </div>

        {/* Empty State */}
        {passports.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center bg-white/50 border-[4px] border-dashed border-gray-400 rounded-3xl p-10">
            <div className="text-6xl mb-4">📂</div>
            <p className="font-hand text-2xl text-gray-600">
              {lang === 'cn' ? '还没有签发的护照...' : 'No passports issued yet...'}
            </p>
            <p className="font-hand text-xl text-gray-500 mt-2">
              {lang === 'cn' ? '快去创建一个角色并保存吧！' : 'Go create a character and save it!'}
            </p>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {passports.map(p => {
            const pStats = calculateStats(p.selectedParts, p.stats);
            const domStat = getDominantStat(pStats);
            return (
              <div
                key={p.id}
                onClick={() => { setSelectedId(p.id); setIsFlipped(false); setActiveTab('profile'); }}
                className={`group cursor-pointer bg-white p-3 pb-6 border-[3px] border-black rounded-xl transition-all relative
                   ${currentTheme.isLight
                    ? 'shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.2)]'
                    : 'shadow-[4px_4px_0_black] hover:-translate-y-1 hover:shadow-[6px_6px_0_black]'}
                 `}
              >
                {/* Tape Effect */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-yellow-200/80 rotate-1 shadow-sm border-l border-r border-white/50"></div>

                {/* Thumbnail (Polaroid Style) */}
                <div className="aspect-square border-2 border-black rounded-lg overflow-hidden mb-3 relative bg-white">
                  <ArtBackground dominantStat={domStat} seed={p.id} />
                  
                  <div className="absolute inset-0 z-10 flex justify-center items-end">
                    <div className="transform scale-[0.85] translate-y-[15px] origin-bottom transition-transform group-hover:scale-[0.9]">
                      <Avatar selectedParts={p.selectedParts} dominantStat={domStat} transparent={true} className="border-none shadow-none" />
                    </div>
                  </div>
                </div>

                {/* Name & ID */}
                <div className="text-center">
                  <h3 className="font-bold font-rounded text-lg leading-none uppercase truncate px-1">{p.name}</h3>
                  <p className="font-mono text-[10px] text-gray-400 mt-1 truncate">{p.id}</p>
                </div>

                {/* Delete Button (Hover only) - Hidden for permanent residents */}
                {!ALL_PRESETS.some(preset => preset.id.toUpperCase() === p.id.toUpperCase()) && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteId(p.id); }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full border-2 border-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 z-10 shadow-sm"
                    title="Delete"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // === DETAIL VIEW (JOURNAL) ===
  return (
    <>
      {/* Theme Background Override (Detail View) - Moved outside animated container to fix viewport bug */}
      <div className="fixed inset-0 -z-10 transition-colors duration-700" style={{ backgroundColor: currentTheme.bg }}></div>

      <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-8 md:items-stretch justify-center min-h-[600px] animate-fade-in relative">

      {/* Back Button (Mobile) */}
      <button
        onClick={() => setSelectedId(null)}
        className="md:hidden px-4 py-2 bg-white border-2 border-black rounded-full font-bold mb-4"
      >
        ← {lang === 'cn' ? '返回' : 'Back'}
      </button>

      {/* LEFT: The Card (Interactable) */}
      <div className="flex flex-col items-center">
        <Card
          data={activePassport}
          stats={activeStats}
          flavorText={activeFlavor}
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped(!isFlipped)}
          lang={lang}
        />
        <p className={`mt-4 font-hand text-lg ${isFlipped ? currentTheme.text === 'text-white' ? 'text-gray-300' : 'text-gray-600' : currentTheme.text === 'text-white' ? 'text-gray-300' : 'text-gray-600'}`}>
          {isFlipped ? (lang === 'cn' ? '点击返回正面' : 'Tap to flip back') : (lang === 'cn' ? '点击查看背面' : 'Tap to see planet')}
        </p>
      </div>

      {/* RIGHT: 大框底部与「点击查看背面」齐平（md 下 items-stretch 拉齐高度） */}
      <div className={`flex-1 w-full max-w-lg min-h-0 bg-[#FDFBF7] border-[4px] border-black rounded-3xl shadow-[8px_8px_0_rgba(0,0,0,0.2)] relative transition-colors duration-500 overflow-hidden flex flex-col ${isFlipped ? 'bg-[#1a1c29] border-gray-600' : 'bg-[#FDFBF7]'}`}>

        {/* Header */}
        <div className="p-6 pb-0 flex justify-between items-start">
          <div>
            <h2 className={`text-3xl font-black uppercase tracking-wider ${isFlipped ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'text-gray-900'}`}>
              {activePassport.name}
            </h2>
            <p className={`font-mono text-xs mt-1 ${isFlipped ? 'text-livia-blue' : 'text-gray-500'}`}>
              ID: {activePassport.id}
            </p>
          </div>
          {/* Close Button Desktop */}
          <button
            onClick={() => setSelectedId(null)}
            className={`hidden md:block text-4xl hover:scale-110 transition-transform ${isFlipped ? 'text-gray-400' : 'text-gray-300 hover:text-red-400'}`}
          >
            &times;
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 mt-6 border-b-2 border-gray-200">
          {(['profile', 'personality', 'relations', 'story'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                  px-4 py-2 font-bold font-rounded text-sm md:text-base transition-colors relative top-[2px] border-b-[3px]
                  ${activeTab === tab
                  ? (isFlipped ? 'text-white border-livia-blue' : 'text-black border-livia-yellow')
                  : 'text-gray-400 border-transparent hover:text-gray-500'}
                `}
            >
              {TRANSLATIONS.ui.tabs[tab][lang]}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="p-8 flex-1 min-h-[400px]">

          {/* TAB: PROFILE (formerly BIO) */}
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-fade-in py-2">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className={`block font-hand font-bold text-sm mb-2 ${isFlipped ? 'text-gray-400' : 'text-gray-500'}`}>
                    {TRANSLATIONS.ui.labels.age[lang]}
                  </label>
                  <input
                    type="text"
                    value={activePassport.age || ''}
                    onChange={(e) => onUpdatePassport(activePassport.id, 'age', e.target.value)}
                    className={`w-full bg-transparent border-b-2 font-hand text-2xl focus:outline-none transition-all ${isFlipped ? 'text-white border-gray-600 focus:border-livia-blue' : 'text-black border-gray-300 focus:border-livia-yellow'}`}
                    placeholder="?"
                  />
                </div>
                <div>
                  <label className={`block font-hand font-bold text-sm mb-2 ${isFlipped ? 'text-gray-400' : 'text-gray-500'}`}>
                    {TRANSLATIONS.ui.labels.date[lang]}
                  </label>
                  <div className={`font-mono text-base pt-1 ${isFlipped ? 'text-gray-300' : 'text-gray-800'}`}>
                    {new Date(activePassport.savedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8">
                {/* GENDER */}
                <div className="relative">
                  <label className={`block font-hand font-bold text-sm mb-2 ${isFlipped ? 'text-gray-400' : 'text-gray-500'}`}>
                    {TRANSLATIONS.ui.labels.genderLabel[lang]}
                  </label>
                  <button
                    onClick={() => {
                      setOpenDropdown(openDropdown === 'gender' ? null : 'gender');
                      setDropdownPage(0);
                    }}
                    className={`
                      w-full h-11 px-4 rounded-xl border-[3px] font-hand text-xl transition-all flex items-center justify-between
                      ${isFlipped
                        ? 'bg-gray-800 border-gray-600 text-white'
                        : 'bg-white border-black text-black shadow-[4px_4px_0_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0_rgba(0,0,0,0.1)]'}
                    `}
                  >
                    <span>{(TRANSLATIONS.ui.genders as any)[activePassport.gender || 'unknown']?.[lang]}</span>
                    <span className="text-xs">▼</span>
                  </button>

                  {openDropdown === 'gender' && (
                    <div className="absolute top-full left-0 w-full mt-2 z-[70] bg-white border-[3px] border-black rounded-xl p-2 shadow-[6px_6px_0_black] animate-scale-in">
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(TRANSLATIONS.ui.genders)
                          .slice(dropdownPage * 4, (dropdownPage + 1) * 4)
                          .map(([key, val]) => {
                            const isSelected = (activePassport.gender || 'unknown') === key;
                            return (
                              <button
                                key={key}
                                onClick={() => {
                                  onUpdatePassport(activePassport.id, 'gender', key);
                                  setOpenDropdown(null);
                                }}
                                className={`
                                  p-2 rounded-lg text-[11px] font-bold transition-all text-center truncate
                                  ${isSelected
                                    ? 'bg-livia-yellow border-[3px] border-black shadow-[3px_3px_0_black] -translate-y-[2px]'
                                    : 'bg-white border-[1px] border-black/10 text-gray-600 hover:border-black/30'}
                                `}
                              >
                                {(val as any)[lang]}
                              </button>
                            );
                          })}
                      </div>
                      {/* Pagination Dots */}
                      {Object.keys(TRANSLATIONS.ui.genders).length > 4 && (
                        <div className="flex justify-center gap-1.5 mt-3 mb-1">
                          {Array.from({ length: Math.ceil(Object.keys(TRANSLATIONS.ui.genders).length / 4) }).map((_, i) => (
                            <button
                              key={i}
                              onClick={(e) => { e.stopPropagation(); setDropdownPage(i); }}
                              className={`transition-all duration-300 rounded-full ${dropdownPage === i ? 'w-10 h-2.5 bg-black' : 'w-2.5 h-2.5 bg-gray-200'}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* SPECIES */}
                <div className="relative">
                  <label className={`block font-hand font-bold text-sm mb-2 ${isFlipped ? 'text-gray-400' : 'text-gray-500'}`}>
                    {TRANSLATIONS.ui.labels.speciesLabel[lang]}
                  </label>
                  <button
                    onClick={() => {
                      setOpenDropdown(openDropdown === 'species' ? null : 'species');
                      setDropdownPage(0);
                    }}
                    className={`
                      w-full h-11 px-4 rounded-xl border-[3px] font-hand text-xl transition-all flex items-center justify-between
                      ${isFlipped
                        ? 'bg-gray-800 border-gray-600 text-white'
                        : 'bg-white border-black text-black shadow-[4px_4px_0_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0_rgba(0,0,0,0.1)]'}
                    `}
                  >
                    <span>{(TRANSLATIONS.ui.species as any)[activePassport.species || 'rabbit']?.[lang]}</span>
                    <span className="text-xs">▼</span>
                  </button>

                  {openDropdown === 'species' && (
                    <div className="absolute top-full left-0 w-full mt-2 z-[70] bg-white border-[3px] border-black rounded-xl p-2 shadow-[6px_6px_0_black] animate-scale-in">
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(TRANSLATIONS.ui.species)
                          .slice(dropdownPage * 4, (dropdownPage + 1) * 4)
                          .map(([key, val]) => {
                            const isSelected = (activePassport.species || 'rabbit') === key;
                            return (
                              <button
                                key={key}
                                onClick={() => {
                                  onUpdatePassport(activePassport.id, 'species', key);
                                  setOpenDropdown(null);
                                }}
                                className={`
                                  p-2 rounded-lg text-[11px] font-bold transition-all text-center truncate
                                  ${isSelected
                                    ? 'bg-livia-yellow border-[3px] border-black shadow-[3px_3px_0_black] -translate-y-[2px]'
                                    : 'bg-white border-[1px] border-black/10 text-gray-600 hover:border-black/30'}
                                `}
                              >
                                {(val as any)[lang]}
                              </button>
                            );
                          })}
                      </div>
                      {/* Pagination Dots */}
                      {Object.keys(TRANSLATIONS.ui.species).length > 4 && (
                        <div className="flex justify-center gap-1.5 mt-3 mb-1">
                          {Array.from({ length: Math.ceil(Object.keys(TRANSLATIONS.ui.species).length / 4) }).map((_, i) => (
                            <button
                              key={i}
                              onClick={(e) => { e.stopPropagation(); setDropdownPage(i); }}
                              className={`transition-all duration-300 rounded-full ${dropdownPage === i ? 'w-10 h-2.5 bg-black' : 'w-2.5 h-2.5 bg-gray-200'}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* OCCUPATIONS (UPGRADED) */}
              <div className="mt-6">
                <label className={`block font-hand font-bold text-sm mb-3 ${isFlipped ? 'text-gray-400' : 'text-gray-500'}`}>
                  {TRANSLATIONS.ui.labels.occupationLabel[lang]}
                </label>
                <div className="flex flex-wrap gap-3">
                  {/* Selected Labels Only */}
                  {(activePassport.occupations || []).map((key) => {
                    const presetVal = (TRANSLATIONS.ui.occupations as any)[key];
                    const label = presetVal ? presetVal[lang] : key;

                    return (
                      <div
                        key={key}
                        className={`
                          px-4 py-2 rounded-full border-2 text-sm font-bold transition-all flex items-center gap-2
                          ${isFlipped ? 'bg-livia-blue border-white text-white' : 'bg-livia-blue border-black text-white shadow-[3px_3px_0_black]'}
                        `}
                      >
                        {label}
                        <button
                          onClick={() => {
                            const next = activePassport.occupations?.filter(o => o !== key);
                            onUpdatePassport(activePassport.id, 'occupations', next);
                          }}
                          className="hover:text-red-300 font-bold"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}

                  {/* Open Job Picker Button */}
                  <button
                    onClick={() => setIsJobPickerOpen(true)}
                    className={`
                      px-4 py-1.5 rounded-full border-2 border-dashed flex items-center justify-center font-bold text-sm transition-all
                      ${isFlipped ? 'border-gray-600 text-gray-500 hover:text-white' : 'border-gray-300 text-gray-400 hover:border-black hover:text-black'}
                    `}
                  >
                    + {lang === 'cn' ? "选择职业" : "Pick Occupation"}
                  </button>
                </div>
              </div>

              {/* JOB PICKER MODAL (Simple Grid) */}
              {isJobPickerOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                  <div className={`w-full max-w-md p-6 rounded-2xl border-[4px] border-black shadow-[8px_8px_0_black] animate-scale-in -translate-y-12 ${isFlipped ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-black uppercase tracking-tight">{TRANSLATIONS.ui.labels.occupationLabel[lang]}</h3>
                      <button onClick={() => setIsJobPickerOpen(false)} className="text-2xl font-black hover:scale-110 transition-transform">&times;</button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                      {Object.entries(TRANSLATIONS.ui.occupations).map(([key, val]) => {
                        const isSelected = activePassport.occupations?.includes(key);
                        return (
                          <button
                            key={key}
                            onClick={() => {
                              const current = activePassport.occupations || [];
                              const next = isSelected
                                ? current.filter(o => o !== key)
                                : [...current, key];
                              onUpdatePassport(activePassport.id, 'occupations', next);
                            }}
                            className={`
                              p-3 rounded-xl border-2 font-bold transition-all text-sm
                              ${isSelected
                                ? 'bg-livia-blue border-black text-white shadow-[3px_3px_0_black] -translate-y-0.5'
                                : isFlipped ? 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-black hover:text-black'}
                            `}
                          >
                            {(val as any)[lang]}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setIsJobPickerOpen(false)}
                      className="w-full mt-6 py-3 bg-black text-white font-black rounded-xl hover:bg-gray-800 transition-colors uppercase tracking-widest"
                    >
                      {lang === 'cn' ? "完成" : "DONE"}
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-8">
                <label className={`block font-hand font-bold text-sm mb-2 ${isFlipped ? 'text-gray-400' : 'text-gray-500'}`}>
                  {TRANSLATIONS.ui.labels.location[lang]}
                </label>
                <input
                  type="text"
                  value={activePassport.location || ''}
                  onChange={(e) => onUpdatePassport(activePassport.id, 'location', e.target.value)}
                  className={`w-full bg-transparent border-b-2 font-hand text-2xl focus:outline-none transition-all ${isFlipped ? 'text-white border-gray-600 focus:border-livia-blue' : 'text-black border-gray-300 focus:border-livia-yellow'}`}
                  placeholder={lang === 'cn' ? '未知星球' : 'Unknown Planet'}
                />
              </div>

              {/* Delete Button Detail (Hidden for permanent residents) */}
              {!ALL_PRESETS.some(preset => preset.id.toUpperCase() === activePassport.id.toUpperCase()) && (
                <div className="pt-8 border-t border-dashed border-gray-200">
                  <button
                    onClick={() => setDeleteId(activePassport.id)}
                    className="flex items-center gap-2 text-red-500 font-bold hover:underline py-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                    {TRANSLATIONS.ui.delete[lang]}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB: PERSONALITY (formerly STATS) */}
          {activeTab === 'personality' && (
            <div className="animate-fade-in pt-4 flex flex-col h-full justify-between">
              <div className="flex flex-col md:flex-row gap-10 items-center">
                {/* Left: Traits & Bars */}
                <div className="flex-1 space-y-10 w-full">
                  {/* Traits bubble Display */}
                  <div className="flex flex-wrap justify-start gap-3 py-2">
                    {getMixedTraits(activePassport.id, activeStats).map((trait, idx) => (
                      <div
                        key={idx}
                        className="px-4 py-2 rounded-xl border-[2.5px] border-black flex items-center justify-center shadow-[4px_4px_0_rgba(0,0,0,0.1)] transition-all hover:-translate-y-0.5"
                        style={{
                          backgroundColor: trait.type === 'mod' ? '#FFDADA' : trait.type === 'klurighet' ? '#D1E9FF' : '#FFF4D1',
                          color: '#000'
                        }}
                      >
                        <span className="font-black whitespace-nowrap leading-none uppercase tracking-tight text-xs">
                          {trait.name[lang]}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Stat Bars Detail */}
                  <div className="space-y-6">
                    {/* Courage */}
                    <div className="flex items-center gap-4">
                      <span className={`w-20 font-bold font-hand text-xl ${isFlipped ? 'text-red-400' : 'text-gray-800'}`}>
                        {TRANSLATIONS.stats.mod[lang]}
                      </span>
                      <div className="flex gap-2">
                        {Array.from({ length: 9 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-3 h-3 rounded-full border-[2px] transition-all duration-500 ${i < activeStats.mod
                              ? (isFlipped ? 'bg-red-500 border-red-400 shadow-[0_0_8px_red]' : 'bg-livia-red border-black')
                              : (isFlipped ? 'border-gray-700 bg-transparent' : 'border-gray-300 bg-transparent')
                              }`}
                          />
                        ))}
                      </div>
                    </div>
                    {/* Mischief */}
                    <div className="flex items-center gap-4">
                      <span className={`w-20 font-bold font-hand text-xl ${isFlipped ? 'text-yellow-400' : 'text-gray-800'}`}>
                        {TRANSLATIONS.stats.bus[lang]}
                      </span>
                      <div className="flex gap-2">
                        {Array.from({ length: 9 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-3 h-3 rounded-full border-[2px] transition-all duration-500 ${i < activeStats.bus
                              ? (isFlipped ? 'bg-yellow-400 border-yellow-300 shadow-[0_0_8px_yellow]' : 'bg-livia-yellow border-black')
                              : (isFlipped ? 'border-gray-700 bg-transparent' : 'border-gray-300 bg-transparent')
                              }`}
                          />
                        ))}
                      </div>
                    </div>
                    {/* Wisdom */}
                    <div className="flex items-center gap-4">
                      <span className={`w-20 font-bold font-hand text-xl ${isFlipped ? 'text-blue-400' : 'text-gray-800'}`}>
                        {TRANSLATIONS.stats.klurighet[lang]}
                      </span>
                      <div className="flex gap-2">
                        {Array.from({ length: 9 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-3 h-3 rounded-full border-[2px] transition-all duration-500 ${i < activeStats.klurighet
                              ? (isFlipped ? 'bg-blue-400 border-blue-300 shadow-[0_0_8px_cyan]' : 'bg-livia-blue border-black')
                              : (isFlipped ? 'border-gray-700 bg-transparent' : 'border-gray-300 bg-transparent')
                              }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Radar Chart */}
                <div className="flex-1 flex justify-center items-center py-4 min-h-[250px]">
                  <RadarChart stats={activeStats} lang={lang} isDark={isFlipped} />
                </div>
              </div>

              <div className={`mt-10 p-6 rounded-2xl border-2 border-dashed transition-colors ${isFlipped ? 'border-gray-600 bg-white/5' : 'border-gray-300 bg-gray-50'}`}>
                <p className={`font-hand text-xl italic text-center leading-relaxed ${isFlipped ? 'text-gray-300' : 'text-gray-600'}`}>
                  "{activeFlavor}"
                </p>
              </div>
            </div>
          )}

          {/* TAB: RELATIONS */}
          {activeTab === 'relations' && (
            <div className="space-y-4 animate-fade-in flex flex-col h-[380px]">
              
              {/* View Star Relations Button */}
              <button
                onClick={() => setIsMapOpen(true)}
                className="w-full bg-livia-blue text-white font-bold py-3 rounded-xl border-2 border-black shadow-[4px_4px_0_black] hover:translate-y-0.5 hover:shadow-[2px_2px_0_black] active:translate-y-1 active:shadow-none transition-all uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                {TRANSLATIONS.ui.viewStarMap[lang]}
              </button>

              <div className="max-h-[220px] overflow-y-auto pr-2 space-y-3 custom-relation-scroll">
                <style>{`
                  .custom-relation-scroll::-webkit-scrollbar {
                    width: 6px;
                  }
                  .custom-relation-scroll::-webkit-scrollbar-track {
                    background: transparent;
                  }
                  .custom-relation-scroll::-webkit-scrollbar-thumb {
                    background-color: rgba(0, 0, 0, 0.15);
                    border-radius: 10px;
                  }
                  .custom-relation-scroll::-webkit-scrollbar-thumb:hover {
                    background-color: rgba(0, 0, 0, 0.3);
                  }
                `}</style>
                {activePassport.relationships?.map((rel, index) => {
                  const target = passports.find(p => p.id === rel.targetId);
                  const relationTypeLabel = (TRANSLATIONS.ui.relationTypes as any)[rel.relationType]?.[lang] || rel.relationType;

                  return (
                    <div key={index} className={`flex items-center justify-between p-3 rounded-xl border-2 ${isFlipped ? 'bg-white/5 border-gray-700' : 'bg-white border-gray-100'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center border border-black/10">
                          {target ? (
                            <div className="scale-[0.5] origin-center">
                              <Avatar selectedParts={target.selectedParts} dominantStat={getDominantStat(calculateStats(target.selectedParts))} />
                            </div>
                          ) : (
                            <span className="text-xl">👤</span>
                          )}
                        </div>
                        <div>
                          <p className={`font-bold text-sm ${isFlipped ? 'text-white' : 'text-gray-900'}`}>
                            {target ? target.name : TRANSLATIONS.ui.labels.mystery[lang]}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${isFlipped ? 'bg-livia-blue/20 text-livia-blue' : 'bg-livia-yellow text-black font-bold'}`}>
                            {relationTypeLabel}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const newRels = [...activePassport.relationships];
                          newRels.splice(index, 1);
                          onUpdatePassport(activePassport.id, 'relationships', newRels);
                        }}
                        className={`text-gray-400 hover:text-red-500 transition-colors p-1`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  );
                })}

                {(!activePassport.relationships || activePassport.relationships.length === 0) && (
                  <p className={`text-center font-hand text-lg mt-8 ${isFlipped ? 'text-gray-500' : 'text-gray-400'}`}>
                    {lang === 'cn' ? '暂无互动关系...' : 'No relationships yet...'}
                  </p>
                )}
              </div>

              {/* Add Relation Form */}
              <div className={`mt-auto p-4 rounded-2xl border-2 ${isFlipped ? 'bg-white/5 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {/* TARGET SELECTOR */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setOpenDropdown(openDropdown === 'rel-target' ? null : 'rel-target');
                        setDropdownPage(0);
                      }}
                      className={`
                        w-full h-9 px-2 rounded-lg border-2 font-bold text-xs flex items-center justify-between transition-all
                        ${isFlipped ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-700'}
                      `}
                    >
                      <span className="truncate">
                        {pendingRelTarget 
                          ? passports.find(p => p.id === pendingRelTarget)?.name 
                          : (lang === 'cn' ? '选择居民' : 'Select')}
                      </span>
                      <span className="text-[10px] opacity-50">▼</span>
                    </button>

                    {openDropdown === 'rel-target' && (
                      <div className="absolute bottom-full left-0 w-full mb-2 z-[70] bg-white border-[3px] border-black rounded-xl p-2 shadow-[6px_6px_0_black] animate-scale-in">
                        <div className="grid grid-cols-2 gap-2">
                          {passports
                            .filter(p => p.id !== activePassport.id)
                            .slice(dropdownPage * 4, (dropdownPage + 1) * 4)
                            .map(p => (
                              <button
                                key={p.id}
                                onClick={() => {
                                  setPendingRelTarget(p.id);
                                  setOpenDropdown(null);
                                }}
                                className={`
                                  p-2 rounded-lg text-[10px] font-bold transition-all text-center truncate h-9
                                  ${pendingRelTarget === p.id
                                    ? 'bg-livia-yellow border-[3px] border-black shadow-[3px_3px_0_black] -translate-y-0.5'
                                    : 'bg-white border-[1px] border-black/10 text-gray-600 hover:border-black/30'}
                                `}
                              >
                                {p.name}
                              </button>
                            ))}
                        </div>
                        {/* Pagination */}
                        {passports.filter(p => p.id !== activePassport.id).length > 4 && (
                          <div className="flex justify-center gap-1 mt-3">
                            {Array.from({ length: Math.ceil(passports.filter(p => p.id !== activePassport.id).length / 4) }).map((_, i) => (
                              <button
                                key={i}
                                onClick={(e) => { e.stopPropagation(); setDropdownPage(i); }}
                                className={`transition-all duration-300 rounded-full ${dropdownPage === i ? 'w-6 h-2 bg-black' : 'w-2 h-2 bg-gray-200'}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* TYPE SELECTOR */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setOpenDropdown(openDropdown === 'rel-type' ? null : 'rel-type');
                        setDropdownPage(0);
                      }}
                      className={`
                        w-full h-9 px-2 rounded-lg border-2 font-bold text-xs flex items-center justify-between transition-all
                        ${isFlipped ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-700'}
                      `}
                    >
                      <span className="truncate">
                        {(TRANSLATIONS.ui.relationTypes as any)[pendingRelType]?.[lang]}
                      </span>
                      <span className="text-[10px] opacity-50">▼</span>
                    </button>

                    {openDropdown === 'rel-type' && (
                      <div className="absolute bottom-full left-0 w-full mb-2 z-[70] bg-white border-[3px] border-black rounded-xl p-2 shadow-[6px_6px_0_black] animate-scale-in">
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(TRANSLATIONS.ui.relationTypes)
                            .slice(dropdownPage * 4, (dropdownPage + 1) * 4)
                            .map(([key, val]) => (
                              <button
                                key={key}
                                onClick={() => {
                                  setPendingRelType(key);
                                  setOpenDropdown(null);
                                }}
                                className={`
                                  p-2 rounded-lg text-[10px] font-bold transition-all text-center truncate h-9
                                  ${pendingRelType === key
                                    ? 'bg-livia-yellow border-[3px] border-black shadow-[3px_3px_0_black] -translate-y-0.5'
                                    : 'bg-white border-[1px] border-black/10 text-gray-600 hover:border-black/30'}
                                `}
                              >
                                {(val as any)[lang]}
                              </button>
                            ))}
                        </div>
                        {/* Pagination */}
                        {Object.keys(TRANSLATIONS.ui.relationTypes).length > 4 && (
                          <div className="flex justify-center gap-1 mt-3">
                            {Array.from({ length: Math.ceil(Object.keys(TRANSLATIONS.ui.relationTypes).length / 4) }).map((_, i) => (
                              <button
                                key={i}
                                onClick={(e) => { e.stopPropagation(); setDropdownPage(i); }}
                                className={`transition-all duration-300 rounded-full ${dropdownPage === i ? 'w-6 h-2 bg-black' : 'w-2 h-2 bg-gray-200'}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!pendingRelTarget) return;
                    const newRels = [...(activePassport.relationships || []), { targetId: pendingRelTarget, relationType: pendingRelType }];
                    onUpdatePassport(activePassport.id, 'relationships', newRels);
                    setPendingRelTarget(null);
                  }}
                  className="w-full bg-livia-yellow text-black font-bold py-2 rounded-lg border-2 border-black shadow-[2px_2px_0_black] hover:translate-y-0.5 hover:shadow-none active:bg-yellow-500 transition-all text-sm uppercase flex items-center justify-center gap-2"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  {lang === 'cn' ? '添加关系' : 'Add Relation'}
                </button>
              </div>
            </div>
          )}

          {/* TAB: STORY (Starmap Constellation) */}
          {activeTab === 'story' && (
            <div className="h-[420px] animate-fade-in">
              <StoryTab
                stories={stories}
                lang={lang}
                isFlipped={isFlipped}
                onUpdateStories={handleUpdateStories}
                selectedId={selectedId}
              />
            </div>
          )}
        </div>

        {/* Footer / Stamp */}
        <div className="absolute bottom-6 right-8 opacity-20 rotate-[-15deg] pointer-events-none">
          <div className={`border-4 rounded-full w-24 h-24 flex items-center justify-center font-black text-xs uppercase text-center p-2 leading-tight ${isFlipped ? 'border-white text-white' : 'border-black text-black'}`}>
            OFFICIAL<br />CITIZEN<br />OF<br />HAPPY PLANET
          </div>
        </div>
      </div >

      {/* Star Map Portal */}
      {isMapOpen && activePassport && (
        <RelationMap
          currentUser={activePassport}
          passports={passports}
          onClose={() => setIsMapOpen(false)}
          lang={lang}
        />
      )}

    </div>
    </>
  );
};
