import React, { useState, useEffect, useCallback } from 'react';
import { PassportData, Language, StoryEntry } from '../types';
import { Card } from './Card';
import { Avatar } from './Avatar';
import { calculateStats, generateFlavorText, getDominantStat, TRANSLATIONS, getStarDate, ALL_PRESETS, getMixedTraits } from '../utils/gameLogic';
import { RadarChart } from './RadarChart';
import { StoryTab } from './StoryTab';
import { RelationMap } from './RelationMap';

interface PassportBookProps {
  passports: PassportData[];
  onBack: () => void;
  onUpdatePassport: (id: string, field: keyof PassportData, value: any) => void;
  onDelete: (id: string) => void;
  lang: Language;
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

export const PassportBook: React.FC<PassportBookProps> = ({
  passports,
  onBack,
  onUpdatePassport,
  onDelete,
  lang
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isJobPickerOpen, setIsJobPickerOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(THEMES[0]);

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

  const handleUpdateStories = useCallback((next: StoryEntry[]) => {
    setStories(next);
    if (storageKey) localStorage.setItem(storageKey, JSON.stringify(next));
  }, [storageKey]);

  // Find selected passport
  const activePassport = passports.find(p => p.id === selectedId);

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

                {/* Thumbnail */}
                <div className="aspect-square bg-gray-100 rounded-lg border-2 border-gray-200 overflow-hidden mb-3 relative">
                  <div className="transform scale-75 origin-center">
                    <Avatar selectedParts={p.selectedParts} dominantStat={domStat} />
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
        <div className="p-6 flex-1 min-h-[300px]">

          {/* TAB: PROFILE (formerly BIO) */}
          {activeTab === 'profile' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block font-hand font-bold text-sm mb-1 ${isFlipped ? 'text-gray-400' : 'text-gray-500'}`}>
                    {TRANSLATIONS.ui.labels.age[lang]}
                  </label>
                  <input
                    type="text"
                    value={activePassport.age || ''}
                    onChange={(e) => onUpdatePassport(activePassport.id, 'age', e.target.value)}
                    className={`w-full bg-transparent border-b-2 font-hand text-xl focus:outline-none ${isFlipped ? 'text-white border-gray-600 focus:border-livia-blue' : 'text-black border-gray-300 focus:border-livia-yellow'}`}
                    placeholder="?"
                  />
                </div>
                <div>
                  <label className={`block font-hand font-bold text-sm mb-1 ${isFlipped ? 'text-gray-400' : 'text-gray-500'}`}>
                    {TRANSLATIONS.ui.labels.date[lang]}
                  </label>
                  <div className={`font-mono text-sm pt-1 ${isFlipped ? 'text-gray-300' : 'text-gray-800'}`}>
                    {new Date(activePassport.savedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {/* GENDER */}
                <div>
                  <label className={`block font-hand font-bold text-sm mb-1 ${isFlipped ? 'text-gray-400' : 'text-gray-500'}`}>
                    {TRANSLATIONS.ui.labels.genderLabel[lang]}
                  </label>
                  <div className="relative">
                    <select
                      value={activePassport.gender || 'unknown'}
                      onChange={(e) => onUpdatePassport(activePassport.id, 'gender', e.target.value)}
                      className={`
                        w-full h-9 px-3 rounded-xl border-[3px] font-hand text-lg transition-all appearance-none cursor-pointer
                        ${isFlipped
                          ? 'bg-gray-800 border-gray-600 text-white focus:border-livia-blue'
                          : 'bg-white border-black text-black focus:border-livia-yellow shadow-[4px_4px_0_rgba(0,0,0,0.1)]'}
                      `}
                    >
                      {Object.entries(TRANSLATIONS.ui.genders).map(([key, val]) => (
                        <option key={key} value={key}>{(val as any)[lang]}</option>
                      ))}
                    </select>
                    <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${isFlipped ? 'text-gray-400' : 'text-gray-500'}`}>
                      ▼
                    </div>
                  </div>
                </div>

                {/* SPECIES */}
                <div>
                  <label className={`block font-hand font-bold text-sm mb-1 ${isFlipped ? 'text-gray-400' : 'text-gray-500'}`}>
                    {TRANSLATIONS.ui.labels.speciesLabel[lang]}
                  </label>
                  <div className="relative">
                    <select
                      value={activePassport.species || 'rabbit'}
                      onChange={(e) => onUpdatePassport(activePassport.id, 'species', e.target.value)}
                      className={`
                        w-full h-9 px-3 rounded-xl border-[3px] font-hand text-lg transition-all appearance-none cursor-pointer
                        ${isFlipped
                          ? 'bg-gray-800 border-gray-600 text-white focus:border-livia-blue'
                          : 'bg-white border-black text-black focus:border-livia-yellow shadow-[4px_4px_0_rgba(0,0,0,0.1)]'}
                      `}
                    >
                      {Object.entries(TRANSLATIONS.ui.species).map(([key, val]) => (
                        <option key={key} value={key}>{(val as any)[lang]}</option>
                      ))}
                    </select>
                    <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${isFlipped ? 'text-gray-400' : 'text-gray-500'}`}>
                      ▼
                    </div>
                  </div>
                </div>
              </div>

              {/* OCCUPATIONS (UPGRADED) */}
              <div className="mt-4">
                <label className={`block font-hand font-bold text-sm mb-2 ${isFlipped ? 'text-gray-400' : 'text-gray-500'}`}>
                  {TRANSLATIONS.ui.labels.occupationLabel[lang]}
                </label>
                <div className="flex flex-wrap gap-2">
                  {/* Selected Labels Only */}
                  {(activePassport.occupations || []).map((key) => {
                    const presetVal = (TRANSLATIONS.ui.occupations as any)[key];
                    const label = presetVal ? presetVal[lang] : key;

                    return (
                      <div
                        key={key}
                        className={`
                          px-3 py-1.5 rounded-full border-2 text-sm font-bold transition-all flex items-center gap-2
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
                      px-3 py-1 rounded-full border-2 border-dashed flex items-center justify-center font-bold text-sm transition-all
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
                  <div className={`w-full max-w-md p-6 rounded-2xl border-[4px] border-black shadow-[8px_8px_0_black] animate-scale-in ${isFlipped ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-black uppercase tracking-tight">{TRANSLATIONS.ui.labels.occupationLabel[lang]}</h3>
                      <button onClick={() => setIsJobPickerOpen(false)} className="text-2xl font-black hover:scale-110 transition-transform">&times;</button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
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

              <div className="mt-4">
                <label className={`block font-hand font-bold text-sm mb-1 ${isFlipped ? 'text-gray-400' : 'text-gray-500'}`}>
                  {TRANSLATIONS.ui.labels.location[lang]}
                </label>
                <input
                  type="text"
                  value={activePassport.location || ''}
                  onChange={(e) => onUpdatePassport(activePassport.id, 'location', e.target.value)}
                  className={`w-full bg-transparent border-b-2 font-hand text-xl focus:outline-none ${isFlipped ? 'text-white border-gray-600 focus:border-livia-blue' : 'text-black border-gray-300 focus:border-livia-yellow'}`}
                  placeholder={lang === 'cn' ? '未知星球' : 'Unknown Planet'}
                />
              </div>

              {/* Delete Button Detail (Hidden for permanent residents) */}
              {!ALL_PRESETS.some(preset => preset.id.toUpperCase() === activePassport.id.toUpperCase()) && (
                <div className="pt-6 border-t border-dashed border-gray-200">
                  <button
                    onClick={() => setDeleteId(activePassport.id)}
                    className="flex items-center gap-2 text-red-500 font-bold hover:underline py-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
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
            <div className="animate-fade-in pt-2">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                {/* Left: Traits & Bars */}
                <div className="flex-1 space-y-6 w-full">
                  {/* Traits bubble Display */}
                  <div className="flex flex-wrap justify-start gap-2 py-2">
                    {getMixedTraits(activePassport.id, activeStats).map((trait, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-1.5 rounded-xl border-[2.5px] border-black flex items-center justify-center shadow-[3px_3px_0_rgba(0,0,0,0.1)] transition-all"
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
                  <div className="space-y-4">
                    {/* Courage */}
                    <div className="flex items-center gap-3">
                      <span className={`w-16 font-bold font-hand text-lg ${isFlipped ? 'text-red-400' : 'text-gray-800'}`}>
                        {TRANSLATIONS.stats.mod[lang]}
                      </span>
                      <div className="flex gap-1.5">
                        {Array.from({ length: 9 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-2.5 h-2.5 rounded-full border-[1.5px] ${i < activeStats.mod
                              ? (isFlipped ? 'bg-red-500 border-red-400 shadow-[0_0_5px_red]' : 'bg-livia-red border-black')
                              : (isFlipped ? 'border-gray-700 bg-transparent' : 'border-gray-300 bg-transparent')
                              }`}
                          />
                        ))}
                      </div>
                    </div>
                    {/* Mischief */}
                    <div className="flex items-center gap-3">
                      <span className={`w-16 font-bold font-hand text-lg ${isFlipped ? 'text-yellow-400' : 'text-gray-800'}`}>
                        {TRANSLATIONS.stats.bus[lang]}
                      </span>
                      <div className="flex gap-1.5">
                        {Array.from({ length: 9 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-2.5 h-2.5 rounded-full border-[1.5px] ${i < activeStats.bus
                              ? (isFlipped ? 'bg-yellow-400 border-yellow-300 shadow-[0_0_5px_yellow]' : 'bg-livia-yellow border-black')
                              : (isFlipped ? 'border-gray-700 bg-transparent' : 'border-gray-300 bg-transparent')
                              }`}
                          />
                        ))}
                      </div>
                    </div>
                    {/* Wisdom */}
                    <div className="flex items-center gap-3">
                      <span className={`w-16 font-bold font-hand text-lg ${isFlipped ? 'text-blue-400' : 'text-gray-800'}`}>
                        {TRANSLATIONS.stats.klurighet[lang]}
                      </span>
                      <div className="flex gap-1.5">
                        {Array.from({ length: 9 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-2.5 h-2.5 rounded-full border-[1.5px] ${i < activeStats.klurighet
                              ? (isFlipped ? 'bg-blue-400 border-blue-300 shadow-[0_0_5px_cyan]' : 'bg-livia-blue border-black')
                              : (isFlipped ? 'border-gray-700 bg-transparent' : 'border-gray-300 bg-transparent')
                              }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Radar Chart */}
                <div className="flex-1 flex justify-center items-center py-2 min-h-[200px]">
                  <RadarChart stats={activeStats} lang={lang} isDark={isFlipped} />
                </div>
              </div>

              <div className={`mt-6 p-4 rounded-xl border-2 border-dashed ${isFlipped ? 'border-gray-600 bg-white/5' : 'border-gray-300 bg-gray-50'}`}>
                <p className={`font-hand text-lg italic text-center ${isFlipped ? 'text-gray-300' : 'text-gray-600'}`}>
                  "{activeFlavor}"
                </p>
              </div>
            </div>
          )}

          {/* TAB: RELATIONS */}
          {activeTab === 'relations' && (
            <div className="space-y-4 animate-fade-in flex flex-col h-full">
              
              {/* View Star Relations Button */}
              <button
                onClick={() => setIsMapOpen(true)}
                className="w-full bg-livia-blue text-white font-bold py-3 rounded-xl border-2 border-black shadow-[4px_4px_0_black] hover:translate-y-0.5 hover:shadow-[2px_2px_0_black] active:translate-y-1 active:shadow-none transition-all uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                {TRANSLATIONS.ui.viewStarMap[lang]}
              </button>

              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
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
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
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
                  <select
                    id="rel-target"
                    className={`text-sm rounded-lg p-2 focus:outline-none border-2 ${isFlipped ? 'bg-gray-800 text-white border-gray-700' : 'bg-white border-gray-200'}`}
                  >
                    <option value="">{lang === 'cn' ? '选择居民' : 'Select'}</option>
                    {passports
                      .filter(p => p.id !== activePassport.id)
                      .map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))
                    }
                  </select>
                  <select
                    id="rel-type"
                    className={`text-sm rounded-lg p-2 focus:outline-none border-2 ${isFlipped ? 'bg-gray-800 text-white border-gray-700' : 'bg-white border-gray-200'}`}
                  >
                    {Object.entries(TRANSLATIONS.ui.relationTypes).map(([key, val]) => (
                      <option key={key} value={key}>{(val as any)[lang]}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => {
                    const targetId = (document.getElementById('rel-target') as HTMLSelectElement).value;
                    const relationType = (document.getElementById('rel-type') as HTMLSelectElement).value;
                    if (!targetId) return;

                    const newRels = [...(activePassport.relationships || []), { targetId, relationType }];
                    onUpdatePassport(activePassport.id, 'relationships', newRels);
                  }}
                  className="w-full bg-livia-yellow text-black font-bold py-2 rounded-lg border-2 border-black shadow-[2px_2px_0_black] hover:translate-y-0.5 hover:shadow-none active:bg-yellow-500 transition-all text-sm uppercase flex items-center justify-center gap-2"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
