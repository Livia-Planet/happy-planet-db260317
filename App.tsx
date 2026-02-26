
import React, { useState, useMemo, useEffect } from 'react';
import { Card } from './components/Card';
import { Controls, TabType } from './components/Controls';
import { LanguageSelector } from './components/LanguageSelector';
import { AudioPlayer, PLAYLIST } from './components/AudioPlayer';
import { SpaceBackground } from './components/SpaceBackground';
import { PassportBook } from './components/PassportBook';
import { CharacterData, PartCategory, PlanetCategory, Language, PassportData } from './types';
import { calculateStats, generateFlavorText, TRANSLATIONS, DEFAULT_BIOS, generateUniqueId, ALL_PRESETS } from './utils/gameLogic';

const INITIAL_DATA: CharacterData = {
  name: "Bobu.B",
  lastModified: Date.now(),
  selectedParts: {
    body: 'body_mimosa',
    ears: 'ears_mimosa',
    face: 'mouth_open',
    hair: 'hair_yellow',
    access: 'access_braids_yellow'
  },
  selectedPlanetParts: {
    base: 'planet_base_red',
    surface: 'planet_surf_none',
    atmosphere: 'planet_atmo_glow',
    companion: 'planet_comp_ufo'
  }
};

const App: React.FC = () => {
  // === STATE ===
  const [characterData, setCharacterData] = useState<CharacterData>(INITIAL_DATA);
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>('se');
  const [activeTab, setActiveTab] = useState<TabType>('body');
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  // View State: 'editor' or 'passport'
  const [viewMode, setViewMode] = useState<'editor' | 'passport'>('editor');

  // Persistence State
  const [savedPassports, setSavedPassports] = useState<PassportData[]>([]);

  // === EFFECTS ===
  // 全局点击音效：独立于 BGM 音量控制 
  useEffect(() => {
    // 1. 【核心优化】预加载：只创建一次对象，解决点击延迟问题 
    // 已经改为你确认的 click.wav 
    const clickAudio = new Audio('/click.wav');
    clickAudio.volume = 0.4; // 这是一个固定的舒适音量 

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // 2. 【逻辑增强】检测点击目标： 
      // 包括按钮、链接，以及所有带有 cursor-pointer 类名的元素（如卡片） 
      if (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('.cursor-pointer')
      ) {
        // 3. 【关键修复】连点支持： 
        // 如果上次还没响完又点了一下，强制把进度拨回开头，实现即点即响 
        clickAudio.currentTime = 0;

        clickAudio.play().catch((err) => {
          // 如果文件路径还有误，这里会在控制台打印明确提示 
          console.warn("音效播放被拦截或文件未找到:", err);
        });
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  // Load passports from LocalStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('happyPlanet_passports');
    const parsed = stored ? JSON.parse(stored) : [];

    // Always update permanent presets (Case-Insensitive check)
    const presetIds = ALL_PRESETS.map(p => p.id.toUpperCase());
    const others = parsed.filter((p: PassportData) => {
      const upId = p.id.toUpperCase();
      return !presetIds.includes(upId) &&
        upId !== 'HP-BOBU-B' &&
        upId !== 'HP-00000000-BOBU';
    });

    // Synchronize preset data and apply language-specific bios
    const syncedPresets = ALL_PRESETS.map(preset => ({
      ...preset,
      bio: preset.id.includes('BOBU') ? DEFAULT_BIOS.bobu[currentLang] : DEFAULT_BIOS.duddu[currentLang]
    }));

    setSavedPassports([...syncedPresets, ...others]);
  }, [currentLang]);

  // === LOGIC ===
  // Derived state: Stats are calculated from selected parts whenever they change
  const currentStats = useMemo(() => {
    return calculateStats(characterData.selectedParts);
  }, [characterData.selectedParts]);

  // Derived state: Flavor text based on stats and language
  const flavorText = useMemo(() => {
    return generateFlavorText(currentStats, currentLang);
  }, [currentStats, currentLang]);

  // Interaction Handler: Updates data and refreshes timestamp for unique ID
  const updateData = (updater: (prev: CharacterData) => CharacterData) => {
    setCharacterData(prev => {
      const newData = updater(prev);
      return { ...newData, lastModified: Date.now() };
    });
  };

  const handleUpdateName = (name: string) => {
    updateData(prev => ({ ...prev, name }));
  };

  const handleUpdatePart = (category: PartCategory, partId: string) => {
    updateData(prev => ({
      ...prev,
      selectedParts: {
        ...prev.selectedParts,
        [category]: partId
      }
    }));
  };

  const handleUpdatePlanetPart = (category: PlanetCategory, partId: string) => {
    updateData(prev => ({
      ...prev,
      selectedPlanetParts: {
        ...prev.selectedPlanetParts,
        [category]: partId
      }
    }));
  };

  const toggleFlip = () => {
    const nextFlippedState = !isFlipped;
    setIsFlipped(nextFlippedState);

    // Sync Logic: Switch active tab to the first tab of the new view
    if (nextFlippedState) {
      setActiveTab('base'); // Back view default
    } else {
      setActiveTab('body'); // Front view default
    }
  };

  // === PASSPORT LOGIC ===
  const handleSavePassport = () => {
    const newId = generateUniqueId(Date.now());

    // Determine Bio
    let bioText = DEFAULT_BIOS.general[currentLang];
    if (characterData.name.toUpperCase() === 'BOBU.B') {
      bioText = DEFAULT_BIOS.bobu[currentLang];
    }

    const newPassport: PassportData = {
      ...characterData,
      id: newId,
      bio: bioText,
      gender: 'unknown', // Initialize with key
      species: 'rabbit', // Initialize with key
      occupations: [], // Initialize empty
      savedAt: Date.now(),
      relationships: [] // Initialize empty array
    };

    const updatedPassports = [newPassport, ...savedPassports];
    setSavedPassports(updatedPassports);
    localStorage.setItem('happyPlanet_passports', JSON.stringify(updatedPassports));

    // Visual Feedback
    alert(currentLang === 'cn' ? "护照签发成功！" : "Passport Issued Successfully!");
  };

  const handleUpdatePassportData = (id: string, field: keyof PassportData, value: any) => {
    const updated = savedPassports.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    );
    setSavedPassports(updated);
    localStorage.setItem('happyPlanet_passports', JSON.stringify(updated));
  };

  const handleDeletePassport = (id: string) => {
    // Custom modal handled in PassportBook, but we keep this as backup or for the actual deletion logic
    const updated = savedPassports.filter(p => p.id !== id);
    setSavedPassports(updated);
    localStorage.setItem('happyPlanet_passports', JSON.stringify(updated));
  };

  return (
    <div className={`min-h-screen transition-colors duration-700 ${isFlipped && viewMode === 'editor' ? 'bg-gray-900' : 'bg-livia-bg'} text-gray-900 p-4 md:p-8 font-rounded selection:bg-livia-yellow selection:text-black relative overflow-x-hidden`}>

      {/* 🌠 SpaceBackground Decoration Layer */}
      <SpaceBackground
        bpm={PLAYLIST[currentTrackIndex].bpm}
        themeColor={PLAYLIST[currentTrackIndex].themeColor}
        meteorDensity={PLAYLIST[currentTrackIndex].meteorDensity}
      />

      {/* Background Decor for Passport Mode */}
      {viewMode === 'passport' && (
        <div className="fixed inset-0 bg-[#2c3e50] z-0 pointer-events-none"></div>
      )}

      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 flex gap-3 z-50">
        <AudioPlayer lang={currentLang} currentTrackIndex={currentTrackIndex} onTrackChange={setCurrentTrackIndex} />
        <LanguageSelector currentLang={currentLang} onLanguageChange={setCurrentLang} />
      </div>

      {/* === VIEW: EDITOR === */}
      {viewMode === 'editor' && (
        <>
          {/* Header */}
          <header className="max-w-4xl mx-auto mb-6 text-center mt-12 md:mt-0 relative z-10">
            <h1 className={`text-4xl md:text-6xl font-black tracking-tight drop-shadow-[2px_2px_0_rgba(0,0,0,1)] stroke-black transition-colors duration-500 ${isFlipped ? 'text-livia-blue' : 'text-livia-orange'}`} style={{ WebkitTextStroke: '2px black' }}>
              {TRANSLATIONS.appTitle[currentLang]}
            </h1>
            <p className={`mt-2 font-hand text-xl md:text-2xl transition-colors duration-500 ${isFlipped ? 'text-gray-300' : 'text-gray-700'}`}>
              {currentLang === 'cn' ? "官方居民定制器" : "Official Resident Customizer"}
            </p>
          </header>

          <main className="max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-center gap-10 relative z-10">

            {/* Left: The Card */}
            <div className="flex flex-col items-center">
              <Card
                data={characterData}
                stats={currentStats}
                flavorText={flavorText}
                isFlipped={isFlipped}
                onFlip={toggleFlip}
                lang={currentLang}
              />
              <div className="mt-6 text-center">
                <button
                  onClick={toggleFlip}
                  className={`
                    font-hand text-lg transition-all duration-300 px-6 py-2 rounded-full
                    ${isFlipped
                      ? 'bg-white/10 text-white backdrop-blur-md border border-white/20 hover:bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                      : 'text-gray-900 underline hover:text-livia-orange'}
                  `}
                >
                  {isFlipped ? `${TRANSLATIONS.buttons.showFront[currentLang]} ↩` : `${TRANSLATIONS.buttons.showBack[currentLang]} ↪`}
                </button>
              </div>
            </div>

            {/* Right: Controls & Actions */}
            <div className="flex flex-col gap-6 items-center md:items-start">

              {/* CONTROLS PANEL */}
              <Controls
                data={characterData}
                derivedStats={currentStats}
                activeTab={activeTab}
                isBackView={isFlipped}
                onTabChange={setActiveTab}
                updateName={handleUpdateName}
                updatePart={handleUpdatePart}
                updatePlanetPart={handleUpdatePlanetPart}
                lang={currentLang}
              />

              {/* ACTION BUTTONS (Moved Below) */}
              <div className="flex gap-4 w-full justify-center md:justify-start">
                {/* ISSUE PASSPORT (Save) */}
                <button
                  onClick={handleSavePassport}
                  className="flex-1 bg-green-500 text-white font-bold border-[3px] border-black rounded-lg py-3 px-4 shadow-[4px_4px_0_black] hover:-translate-y-1 hover:shadow-[6px_6px_0_black] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 group"
                >
                  {/* Minimal SVG Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{currentLang === 'cn' ? "签发护照" : "Issue Passport"}</span>
                </button>

                {/* OPEN ARCHIVES */}
                <button
                  onClick={() => setViewMode('passport')}
                  className="flex-1 bg-blue-500 text-white font-bold border-[3px] border-black rounded-lg py-3 px-4 shadow-[4px_4px_0_black] hover:-translate-y-1 hover:shadow-[6px_6px_0_black] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  {/* Minimal SVG Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                  <span>{currentLang === 'cn' ? "打开档案" : "Archives"}</span>
                </button>
              </div>
            </div>

          </main>
        </>
      )}

      {/* === VIEW: PASSPORT ARCHIVES === */}
      {viewMode === 'passport' && (
        <div className="relative z-10 pt-16 pb-20">
          <PassportBook
            passports={savedPassports}
            onBack={() => setViewMode('editor')}
            onUpdatePassport={handleUpdatePassportData}
            onDelete={handleDeletePassport}
            lang={currentLang}
          />
        </div>
      )}

      {/* Footer */}
      <footer className={`max-w-4xl mx-auto mt-20 text-center font-hand text-sm transition-colors duration-500 relative z-10 ${isFlipped || viewMode === 'passport' ? 'text-gray-400' : 'text-gray-400'}`}>
        <p>© 2024 Happy Planet Customizer.</p>
      </footer>
    </div>
  );
};

export default App;
