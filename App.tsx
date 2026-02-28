import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Card } from './components/Card';

// 专业的零延迟音效加载函数
const loadAudioBuffer = async (url: string, context: AudioContext) => {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return await context.decodeAudioData(arrayBuffer);
};

const playBuffer = (buffer: AudioBuffer, context: AudioContext, volume = 0.5) => {
  const source = context.createBufferSource();
  source.buffer = buffer;
  const gainNode = context.createGain();
  gainNode.gain.value = volume;
  source.connect(gainNode);
  gainNode.connect(context.destination);
  source.start(0);
};
import { Controls, TabType } from './components/Controls';
import { LanguageSelector } from './components/LanguageSelector';
import { AudioPlayer, PLAYLIST } from './components/AudioPlayer';
import { SpaceBackground } from './components/SpaceBackground';
import { PassportBook } from './components/PassportBook';
import { RedX, CarrotCoinIcon, ArchivesIcon, DiceIcon } from './components/Icons';

// new visual/audio helpers
import { ParticleOverlay } from './components/effects/ParticleOverlay';
import { useAnimateTokens } from './hooks/useAnimateTokens';
import { CharacterData, PartCategory, PlanetCategory, Language, PassportData } from './types';
import { PARTS_DB, getPartList } from './data/parts';
import { calculateStats, generateFlavorText, TRANSLATIONS, DEFAULT_BIOS, generateUniqueId, ALL_PRESETS, generateStarName } from './utils/gameLogic';

const INITIAL_DATA: CharacterData = {
  name: generateStarName().toUpperCase(),
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

  // stamping/flash/issuing state
  const [isStamping, setIsStamping] = useState(false);
  const [stampAngle, setStampAngle] = useState(0);
  const [flash, setFlash] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  
  // 【新增】安全升维控制状态
  const [isIssuing, setIsIssuing] = useState(false); 
  const [shakeBtn, setShakeBtn] = useState<string | null>(null);

  // new currency state
  const [carrotCoins, setCarrotCoins] = useState(30);
  const [bigBangActive, setBigBangActive] = useState(false);
  const [bigBangTrigger, setBigBangTrigger] = useState(0); 
  const [actionFeedback, setActionFeedback] = useState<{bigbang?: string; issue?: string}>({});

  const { spendCarrots } = useAnimateTokens();
  const [viewMode, setViewMode] = useState<'editor' | 'passport'>('editor');
  const [savedPassports, setSavedPassports] = useState<PassportData[]>([]);

  // === AUDIO CONTEXT SETUP & EFFECTS ===
  const audioCtx = useRef<AudioContext | null>(null);
  const buffers = useRef<Record<string, AudioBuffer>>({});

  useEffect(() => {
    // 全局点击音效 (保留你的原生 Audio 实现，保证绝对稳定)
    const clickAudio = new Audio('/click.wav');
    clickAudio.volume = 0.4; 

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('a') || target.closest('.cursor-pointer')) {
        clickAudio.currentTime = 0;
        clickAudio.play().catch(err => console.warn(err));
      }
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  useEffect(() => {
    // 预加载所有高级音效
    audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const preload = async () => {
      if (!audioCtx.current) return;
      try {
        const [cameraB, stampB, coinsB, errorB, successB] = await Promise.all([
          loadAudioBuffer('/camera.wav', audioCtx.current),
          loadAudioBuffer('/stamp.wav', audioCtx.current),
          loadAudioBuffer('/coins.ogg', audioCtx.current),
          loadAudioBuffer('/error.wav', audioCtx.current),
          loadAudioBuffer('/success.ogg', audioCtx.current),
        ]);
        buffers.current = { camera: cameraB, stamp: stampB, coins: coinsB, error: errorB, success: successB };
      } catch (err) {
        console.warn("Advanced Audio Preload failed:", err);
      }
    };
    preload();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('happyPlanet_passports');
    const parsed = stored ? JSON.parse(stored) : [];
    const presetIds = ALL_PRESETS.map(p => p.id.toUpperCase());
    const others = parsed.filter((p: PassportData) => {
      const upId = p.id.toUpperCase();
      return !presetIds.includes(upId) && upId !== 'HP-BOBU-B' && upId !== 'HP-00000000-BOBU';
    });
    const syncedPresets = ALL_PRESETS.map(preset => ({
      ...preset, bio: preset.id.includes('BOBU') ? DEFAULT_BIOS.bobu[currentLang] : DEFAULT_BIOS.duddu[currentLang]
    }));
    setSavedPassports([...syncedPresets, ...others]);
  }, [currentLang]);

  // === LOGIC ===
  const currentStats = useMemo(() => calculateStats(characterData.selectedParts), [characterData.selectedParts]);
  const flavorText = useMemo(() => generateFlavorText(currentStats, currentLang), [currentStats, currentLang]);

  const updateData = (updater: (prev: CharacterData) => CharacterData) => {
    setCharacterData(prev => {
      const newData = updater(prev);
      return { ...newData, lastModified: Date.now() };
    });
  };

  const handleUpdateName = (name: string) => updateData(prev => ({ ...prev, name }));
  const handleUpdatePart = (cat: PartCategory, id: string) => updateData(prev => ({ ...prev, selectedParts: { ...prev.selectedParts, [cat]: id } }));
  const handleUpdatePlanetPart = (cat: PlanetCategory, id: string) => updateData(prev => ({ ...prev, selectedPlanetParts: { ...prev.selectedPlanetParts, [cat]: id } }));

  const toggleFlip = () => {
    const next = !isFlipped;
    setIsFlipped(next);
    setActiveTab(next ? 'base' : 'body');
  };

  // === ACTION: ISSUE PASSPORT ===
  const handleIssue = () => {
    if (carrotCoins < 5) {
      // 错误摇晃 + 错误音效
      if (audioCtx.current && buffers.current.error) playBuffer(buffers.current.error, audioCtx.current, 0.6);
      setShakeBtn('btn-issue');
      setTimeout(() => setShakeBtn(null), 400);
      setActionFeedback({ issue: 'no_carrot' });
      setTimeout(() => setActionFeedback({}), 1200);
      return;
    }

    // 播放花钱飞出的清脆音效
    if (audioCtx.current && buffers.current.coins) playBuffer(buffers.current.coins, audioCtx.current, 0.5);
    spendCarrots('btn-issue', 5);
    
    // 恰好等到飞过去
    setTimeout(() => {
      setCarrotCoins(prev => prev - 5);
      setActionFeedback({ issue: '-5' });

      // 【安全升维开启】：背景变暗，放出金光粒子，播放 success 庆祝音效
      setIsIssuing(true);
      if (audioCtx.current && buffers.current.success) playBuffer(buffers.current.success, audioCtx.current, 0.6);
      setBigBangTrigger(prev => prev + 1); // 复用粒子触发器

      // ==========================================
      // 👇 下面这部分是你昨晚对齐的时间轴，一行都没动！👇
      // ==========================================
      if (audioCtx.current && buffers.current.camera) {
        playBuffer(buffers.current.camera, audioCtx.current, 0.6);
      }
      
      setTimeout(() => {
        setFlash(true);
        setTimeout(() => setFlash(false), 500);
      }, 400);

      setStampAngle(-15 - Math.random() * 10);

      setTimeout(() => {
        if (audioCtx.current && buffers.current.stamp) {
          playBuffer(buffers.current.stamp, audioCtx.current, 0.8);
        }
      }, 800); 

      setTimeout(() => setIsStamping(true), 850);

      setTimeout(() => {
        const newId = generateUniqueId(Date.now());
        let bioText = characterData.name.toUpperCase() === 'BOBU.B' ? DEFAULT_BIOS.bobu[currentLang] : DEFAULT_BIOS.general[currentLang];
        const newPassport: PassportData = { ...characterData, id: newId, bio: bioText, gender: 'unknown', species: 'rabbit', occupations: [], savedAt: Date.now(), relationships: [] };
        const updatedPassports = [newPassport, ...savedPassports];
        setSavedPassports(updatedPassports);
        localStorage.setItem('happyPlanet_passports', JSON.stringify(updatedPassports));

        setTimeout(() => {
          setToastMsg(currentLang === 'cn' ? "护照签发成功！" : "Passport Issued!");
          setTimeout(() => {
            setToastMsg(null);
            setViewMode('passport');
            // 归位清理
            setTimeout(() => {
              setIsStamping(false);
              setIsIssuing(false); // 关闭暗化图层
            }, 500);
          }, 2000);
        }, 1000);
      }, 1000); 
      // ==========================================
      // 👆 完美时间轴结束 👆
      // ==========================================

      setTimeout(() => setActionFeedback({}), 1000);
    }, 600);
  };

  // === ACTION: BIG BANG ===
  const handleBigBang = () => {
    if (carrotCoins < 1) {
      if (audioCtx.current && buffers.current.error) playBuffer(buffers.current.error, audioCtx.current, 0.6);
      setShakeBtn('btn-bigbang');
      setTimeout(() => setShakeBtn(null), 400);
      setActionFeedback({ bigbang: 'no_carrot' }); 
      setTimeout(() => setActionFeedback({}), 1200);
      return;
    }

    if (audioCtx.current && buffers.current.coins) playBuffer(buffers.current.coins, audioCtx.current, 0.4);
    spendCarrots('btn-bigbang', 1);
    
    setTimeout(() => {
      setCarrotCoins(prev => prev - 1);
      setActionFeedback({ bigbang: '-1' });

      updateData(prev => {
        const categories: PartCategory[] = ['body', 'ears', 'face', 'hair', 'access'];
        const newSelectedParts = { ...prev.selectedParts };
        categories.forEach(cat => {
          const options = getPartList(cat); 
          if (options && options.length > 0) newSelectedParts[cat] = options[Math.floor(Math.random() * options.length)].id;
        });

        const planetCats: PlanetCategory[] = ['base', 'surface', 'atmosphere', 'companion'];
        const newPlanetParts = { ...prev.selectedPlanetParts };
        planetCats.forEach(cat => {
          const options = getPartList(cat);
          if (options && options.length > 0) newPlanetParts[cat] = options[Math.floor(Math.random() * options.length)].id;
        });

        return { ...prev, name: generateStarName().toUpperCase(), selectedParts: newSelectedParts, selectedPlanetParts: newPlanetParts };
      });

      setBigBangTrigger(prev => prev + 1);
      setBigBangActive(true);
      setTimeout(() => {
        setBigBangActive(false);
        setTimeout(() => setActionFeedback({}), 300);
      }, 300);
    }, 400);
  };

  const handleUpdatePassportData = (id: string, field: keyof PassportData, value: any) => {
    const updated = savedPassports.map(p => p.id === id ? { ...p, [field]: value } : p);
    setSavedPassports(updated);
    localStorage.setItem('happyPlanet_passports', JSON.stringify(updated));
  };
  const handleDeletePassport = (id: string) => {
    const updated = savedPassports.filter(p => p.id !== id);
    setSavedPassports(updated);
    localStorage.setItem('happyPlanet_passports', JSON.stringify(updated));
  };

  return (
    <div className={`min-h-screen transition-colors duration-700 ${isFlipped && viewMode === 'editor' ? 'bg-gray-900' : 'bg-livia-bg'} text-gray-900 p-4 md:p-8 font-rounded selection:bg-livia-yellow selection:text-black relative overflow-x-hidden ${bigBangActive ? 'animate-shake blur-sm' : ''}`}>
      
      {/* 沉浸式暗化背景层：保护 z-[90] 处于底层 */}
      <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-700 pointer-events-none z-[90] ${isIssuing ? 'opacity-100' : 'opacity-0'}`} />

      {/* camera flash overlay */}
      {flash && <div className="fixed inset-0 bg-white opacity-0 animate-flash pointer-events-none z-[9999]"></div>}

      {/* 动态爆点粒子：在暗化背景之上，卡片之下 */}
      <ParticleOverlay trigger={bigBangTrigger} color={isIssuing ? '#FFD700' : '#FFD93D'} />
      
      {/* Toast 提示 */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[9999] animate-bounce-in pointer-events-none">
          <div className="bg-livia-yellow text-black px-8 py-4 rounded-2xl border-[4px] border-black shadow-[6px_6px_0_black] -rotate-2">
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-8 h-8 text-green-600 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-rounded font-black text-xl tracking-wide">{toastMsg}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* 注入最新酷炫 CSS */}
      <style>{`
        @keyframes flash { 0% { opacity: 0; } 20% { opacity: 0.8; } 100% { opacity: 0; } }
        .animate-flash { animation: flash 0.15s ease-out forwards; }
        
        @keyframes bounce-in { 0% { opacity: 0; transform: translate(-50%, -20px) scale(0.8); } 50% { opacity: 1; transform: translate(-50%, 5px) scale(1.05); } 100% { opacity: 1; transform: translate(-50%, 0) scale(1); } }
        .animate-bounce-in { animation: bounce-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        
        @keyframes shake-quick { 0%,100%{transform:translateX(0)}25%{transform:translateX(-3px)}75%{transform:translateX(3px)} }
        .animate-shake { animation: shake-quick 0.3s linear; }

        @keyframes shake-err { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
        .animate-shake-err { animation: shake-err 0.3s linear; }

        @keyframes glow-orange { 0%, 100% { box-shadow: 0 0 5px rgba(255, 140, 66, 0.4); border-color: #000; } 50% { box-shadow: 0 0 20px rgba(255, 140, 66, 0.8); border-color: #FF8C42; } }
        @keyframes glow-gold { 0%, 100% { box-shadow: 0 0 8px rgba(255, 215, 0, 0.4); border-color: #000; transform: scale(1); } 50% { box-shadow: 0 0 25px rgba(255, 215, 0, 0.9); border-color: #FFD700; transform: scale(1.03); } }
        .btn-orange-glow { animation: glow-orange 2s infinite ease-in-out; }
        .btn-gold-glow { animation: glow-gold 1.5s infinite ease-in-out; }
      `}</style>

      {/* 🌠 SpaceBackground Decoration Layer */}
      <SpaceBackground bpm={PLAYLIST[currentTrackIndex].bpm} themeColor={PLAYLIST[currentTrackIndex].themeColor} meteorDensity={PLAYLIST[currentTrackIndex].meteorDensity} />
      {viewMode === 'passport' && <div className="fixed inset-0 bg-[#2c3e50] z-0 pointer-events-none"></div>}

      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 flex gap-3 z-50 items-center">
        <div id="carrot-wallet" className="flex items-center gap-1 font-bold">
          <CarrotCoinIcon className="w-6 h-6" />
          <span className="text-lg">{carrotCoins}</span>
        </div>
        <AudioPlayer lang={currentLang} currentTrackIndex={currentTrackIndex} onTrackChange={setCurrentTrackIndex} />
        <LanguageSelector currentLang={currentLang} onLanguageChange={setCurrentLang} />
        <button onClick={() => setViewMode('passport')} className="w-12 h-12 bg-white border-[3px] border-black rounded-lg shadow-[3px_3px_0_black] flex items-center justify-center hover:translate-y-[1px] hover:shadow-[2px_2px_0_black] active:translate-y-[3px] active:shadow-none transition-all" title="Archives">
          <ArchivesIcon className="w-6 h-6" />
        </button>
      </div>

      {/* === VIEW: EDITOR === */}
      {viewMode === 'editor' && (
        <>
          <header className={`max-w-4xl mx-auto mb-6 text-center mt-12 md:mt-0 relative z-10 transition-opacity duration-500 ${isIssuing ? 'opacity-0' : 'opacity-100'}`}>
            <h1 className={`text-4xl md:text-6xl font-black tracking-tight drop-shadow-[2px_2px_0_rgba(0,0,0,1)] stroke-black transition-colors duration-500 ${isFlipped ? 'text-livia-blue' : 'text-livia-orange'}`} style={{ WebkitTextStroke: '2px black' }}>{TRANSLATIONS.appTitle[currentLang]}</h1>
            <p className={`mt-2 font-hand text-xl md:text-2xl transition-colors duration-500 ${isFlipped ? 'text-gray-300' : 'text-gray-700'}`}>{currentLang === 'cn' ? "官方居民定制器" : "Official Resident Customizer"}</p>
          </header>

          <main className="max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-center gap-10">

            {/* Left: The Card (升维动画区) */}
            <div className={`flex flex-col items-center relative transition-all duration-700 ease-in-out ${isIssuing ? 'z-[110] scale-105 md:scale-110 drop-shadow-2xl' : 'z-10'}`}>
              <Card data={characterData} stats={currentStats} flavorText={flavorText} isFlipped={isFlipped} onFlip={toggleFlip} lang={currentLang} showStamp={isStamping} stampAngle={stampAngle} />
              
              <div className={`mt-6 text-center transition-opacity duration-500 ${isIssuing ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <button onClick={toggleFlip} className={`font-hand text-lg transition-all duration-300 px-6 py-2 rounded-full ${isFlipped ? 'bg-white/10 text-white backdrop-blur-md border border-white/20 hover:bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-gray-900 underline hover:text-livia-orange'}`}>
                  {isFlipped ? `${TRANSLATIONS.buttons.showFront[currentLang]} ↩` : `${TRANSLATIONS.buttons.showBack[currentLang]} ↪`}
                </button>
              </div>
            </div>

            {/* Right: Controls & Actions (在升维时隐去) */}
            <div className={`flex flex-col gap-6 items-center md:items-start relative z-10 transition-opacity duration-500 ${isIssuing ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <Controls data={characterData} derivedStats={currentStats} activeTab={activeTab} isBackView={isFlipped} onTabChange={setActiveTab} updateName={handleUpdateName} updatePart={handleUpdatePart} updatePlanetPart={handleUpdatePlanetPart} lang={currentLang} />

              <div className="w-full max-w-[340px] flex flex-col gap-4 pb-8">
                <div className="flex gap-4 w-full">
                  
                  {/* BIG BANG BUTTON */}
                  <div className="flex-1 relative flex flex-col items-center">
                    <button
                      id="btn-bigbang"
                      onClick={handleBigBang}
                      className={`w-full flex items-center justify-center gap-2 px-3 py-3 font-bold border-[3px] rounded-lg transition-all
                        ${carrotCoins >= 1 ? 'bg-purple-500 text-white border-black shadow-[5px_5px_0_black] hover:shadow-[3px_3px_0_black] active:shadow-[1px_1px_0_black] btn-orange-glow' : 'bg-gray-200 border-gray-400 text-gray-500 grayscale opacity-80 cursor-not-allowed'}
                        ${shakeBtn === 'btn-bigbang' ? 'animate-shake-err border-red-500' : ''}`}
                    >
                      <DiceIcon className="w-5 h-5 text-white" />
                      <span className="text-xs font-black tracking-widest">BIG BANG</span>
                    </button>
                    <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 flex items-center gap-1">
                      {actionFeedback.bigbang === 'no_carrot' ? <div className="animate-pulse"><RedX /></div> : actionFeedback.bigbang ? <><CarrotCoinIcon className="w-4 h-4" /><span className="text-xs font-black">{actionFeedback.bigbang}</span></> : null}
                    </div>
                  </div>

                  {/* ISSUE BUTTON */}
                  <div className="flex-1 relative flex flex-col items-center">
                    <button
                      id="btn-issue"
                      onClick={handleIssue}
                      className={`w-full flex items-center justify-center gap-2 px-3 py-3 font-bold border-[3px] rounded-lg transition-all
                        ${carrotCoins >= 5 ? 'bg-green-500 text-white border-black shadow-[5px_5px_0_black] hover:shadow-[3px_3px_0_black] active:shadow-[1px_1px_0_black] btn-gold-glow' : 'bg-gray-200 border-gray-400 text-gray-500 grayscale opacity-80 cursor-not-allowed'}
                        ${shakeBtn === 'btn-issue' ? 'animate-shake-err border-red-500' : ''}`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
                      <span className="text-xs font-black tracking-widest">ISSUE</span>
                    </button>
                    <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 flex items-center gap-1">
                      {actionFeedback.issue === 'no_carrot' ? <div className="animate-pulse"><RedX /></div> : actionFeedback.issue ? <><CarrotCoinIcon className="w-4 h-4" /><span className="text-xs font-black">{actionFeedback.issue}</span></> : null}
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </main>
        </>
      )}

      {/* === VIEW: PASSPORT ARCHIVES === */}
      {viewMode === 'passport' && (
        <div className="relative z-10 pt-16 pb-20">
          <PassportBook passports={savedPassports} onBack={() => setViewMode('editor')} onUpdatePassport={handleUpdatePassportData} onDelete={handleDeletePassport} lang={currentLang} />
        </div>
      )}

      {/* Footer */}
      <footer className={`max-w-4xl mx-auto mt-20 text-center font-hand text-sm transition-colors duration-500 relative z-10 ${isFlipped || viewMode === 'passport' ? 'text-gray-400' : 'text-gray-400'} ${isIssuing ? 'opacity-0' : ''}`}>
        <p>© 2024 Happy Planet Customizer.</p>
      </footer>
    </div>
  );
};

export default App;

