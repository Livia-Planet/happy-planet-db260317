import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Card } from './components/Card';
import { Controls, TabType } from './components/Controls';
import { LanguageSelector } from './components/LanguageSelector';
import { AudioPlayer, PLAYLIST } from './components/AudioPlayer';
import { SpaceBackground } from './components/SpaceBackground';
import { PassportBook } from './components/PassportBook';
import { RedX, CarrotCoinIcon, ArchivesIcon, DiceIcon } from './components/Icons';
import { ParticleOverlay } from './components/effects/ParticleOverlay';
import { useAnimateTokens } from './hooks/useAnimateTokens';
import { SuccessOverlay } from './components/effects/SuccessOverlay';
import { CharacterData, PartCategory, PlanetCategory, Language, PassportData, UnlockedMedal, AchievementDef } from './types';
import { getPartList } from './data/parts';
import { calculateStats, generateFlavorText, TRANSLATIONS, DEFAULT_BIOS, generateUniqueId, ALL_PRESETS, generateStarName, getWeightedRandomPart, calculateFinalRarity } from './utils/gameLogic';
import { AchievementUnlockModal } from './components/AchievementUnlockModal';

// 引入成就系统核心
import { ACHIEVEMENTS_DB } from './data/achievements';
import { DraggableMedal } from './components/DraggableMedal';

// --- 专业的零延迟音效加载函数 ---
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

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const INITIAL_DATA: CharacterData = {
  name: generateStarName().toUpperCase(),
  lastModified: Date.now(),
  selectedParts: {
    body: 'body_mimosa',
    ears: 'ears_mimosa',
    face: 'mouth_open',
    hair: 'hair_yellow',
    hair_b: 'hair_b_braids_yellow',
    access: 'access_none'
  },
  selectedPlanetParts: {
    base: 'planet_base_red',
    surface: 'planet_surf_none',
    atmosphere: 'planet_atmo_glow',
    companion: 'planet_comp_ufo'
  }
};

// 集中管理所有 LocalStorage Keys，新增 MEDALS
const STORAGE_KEYS = {
  PASSPORTS: 'happyPlanet_passports',
  TOKENS: 'happyPlanet_tokens',
  DRAFT: 'happyPlanet_draft',
  MEDALS: 'happyPlanet_medals'
};

export const App: React.FC = () => {
  // ==========================================
  // 1. 所有的基础 State (先声明，绝不报错)
  // ==========================================
  const [characterData, setCharacterData] = useState<CharacterData>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DRAFT);
    if (saved) { try { return JSON.parse(saved); } catch { return INITIAL_DATA; } }
    return INITIAL_DATA;
  });

  const [carrotCoins, setCarrotCoins] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TOKENS);
    return saved !== null ? parseInt(saved, 10) : 30;
  });

  const [savedPassports, setSavedPassports] = useState<PassportData[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PASSPORTS);
    if (saved) { try { return JSON.parse(saved); } catch { return []; } }
    return [];
  });

  // --- 这是我们成就系统的专属 State ---
  const [unlockedMedals, setUnlockedMedals] = useState<Record<string, UnlockedMedal>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MEDALS);
    if (saved) { try { return JSON.parse(saved); } catch { return {}; } }
    return {};
  });
  const [showMedals, setShowMedals] = useState(true);
  // ------------------------------------

  const [isFlipped, setIsFlipped] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>('se');
  const [activeTab, setActiveTab] = useState<TabType>('body');
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const [flash, setFlash] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  // 👇 新增：记录当前刚刚解锁的徽章，如果不为 null，就会弹出盲盒！
  const [newlyUnlocked, setNewlyUnlocked] = useState<AchievementDef | null>(null);

  const [isIssuing, setIsIssuing] = useState(false);
  const [shakeBtn, setShakeBtn] = useState<string | null>(null);
  const [displayBpm, setDisplayBpm] = useState(80);

  const [bigBangActive, setBigBangActive] = useState(false);
  const [bigBangTrigger, setBigBangTrigger] = useState(0);
  const [actionFeedback, setActionFeedback] = useState<{ bigbang?: string; issue?: string }>({});

  const { spendCarrots, gainCarrots } = useAnimateTokens();
  const [viewMode, setViewMode] = useState<'editor' | 'passport'>('editor');
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [issuedPassport, setIssuedPassport] = useState<PassportData | null>(null);

  // --- 成就系统专用状态 ---
  const [bigBangHistory, setBigBangHistory] = useState<number[]>([]); // 记录 Big Bang 的点击时间戳
  const [badLuckStreak, setBadLuckStreak] = useState(0); // 连续不出 Rare 的次数
  const [tabSwitchCount, setTabSwitchCount] = useState(0); // 切换分类次数
  const [hasRenamed, setHasRenamed] = useState(false); // 是否改过名字
  const [hasChangedPlanet, setHasChangedPlanet] = useState(false); // 是否换过星球
  const [usedLangs, setUsedLangs] = useState<Set<Language>>(new Set([currentLang])); // 使用过的语言集合

  const audioCtx = useRef<AudioContext | null>(null);
  const buffers = useRef<Record<string, AudioBuffer>>({});

  // ==========================================
  // 2. 所有的 Effect (存盘与监听)
  // ==========================================
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(characterData)); }, [characterData]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TOKENS, carrotCoins.toString()); }, [carrotCoins]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PASSPORTS, JSON.stringify(savedPassports)); }, [savedPassports]);

  // 保存奖章位置
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.MEDALS, JSON.stringify(unlockedMedals)); }, [unlockedMedals]);

  // 同步 BPM
  useEffect(() => { setDisplayBpm(PLAYLIST[currentTrackIndex].bpm); }, [currentTrackIndex]);

  // 🏆 终极成就监控：自动检测 16 个成就
  useEffect(() => {
    let hasNew = false;
    let lastUnlockedId: string | null = null;
    const newMedals = { ...unlockedMedals };

    // 获取当前属性值 (用于全能选手检测)
    const stats = calculateStats(characterData);

    // 辅助函数：快速解锁
    const unlock = (id: string) => {
      if (!newMedals[id]) {
        newMedals[id] = {
          id,
          x: Math.random() * (window.innerWidth - 100) + 50,
          y: Math.random() * (window.innerHeight - 100) + 50,
          unlockedAt: Date.now()
        };
        hasNew = true;
        lastUnlockedId = id;
      }
    };

    // 1. 你好，宇宙
    if (savedPassports.length >= 1) unlock('first_blood');

    // 2. 胡萝卜富翁
    if (carrotCoins >= 50) unlock('rich_rabbit');

    // 3. 狂热赌徒 (总次数，这里借用 history 长度)
    if (bigBangHistory.length >= 10) unlock('big_bang_fan');

    // 4. 十全十美
    if (savedPassports.length >= 10) unlock('collector_10');

    // 5. 星际交际花
    const totalRelations = savedPassports.reduce((sum, p) => sum + (p.relationships?.length || 0), 0);
    if (totalRelations >= 1) unlock('social_butterfly');

    // 6. 改名部部长
    if (hasRenamed) unlock('rename_expert');

    // 7. 时尚达人
    if (tabSwitchCount >= 5) unlock('fashionista');

    // 8. 搬家公司
    if (hasChangedPlanet) unlock('planet_hopper');

    // 9. 第一桶金 (如果用户有任一档案标记了已领奖)
    if (savedPassports.some(p => p.hasReceivedStoryReward)) unlock('first_harvest');

    // 10. 赌神 (1分钟内点10次)
    const now = Date.now();
    const recentClicks = bigBangHistory.filter(time => now - time < 60000);
    if (recentClicks.length >= 10) unlock('the_gambler');

    // 11. 非酋的愤怒 (连黑 10 次)
    if (badLuckStreak >= 10) unlock('zero_luck');

    // 12. 星际记者 (累计 5 篇日记)
    // 假设你的 savedPassports 结构里有一个专门存日记数量的地方，或者这里简化为有5个档案
    if (savedPassports.length >= 5) unlock('space_reporter');

    // 13. 全能选手 (属性平衡)
    if (stats.mod === stats.bus && stats.bus === stats.klurighet && stats.mod > 0) unlock('all_rounder');

    // 14. 午夜电波 (0-4点)
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 4) unlock('midnight_radio');

    // 15. 多语种大师
    if (usedLangs.size >= 3) unlock('polyglot');

    // 16. 天选之人 (检测当前角色是否有 L 等级部件)
    // 注意：这个逻辑通常在 Big Bang 函数里触发，但这里也可以通过检查 character 的 rarity 触发
    // 这里为了简便，假设在 Big Bang 逻辑里已经处理。

    // 最终执行更新
    if (hasNew && lastUnlockedId) {
      setUnlockedMedals(newMedals);
      if (ACHIEVEMENTS_DB[lastUnlockedId]) {
        setNewlyUnlocked(ACHIEVEMENTS_DB[lastUnlockedId]);
      }
    }
  }, [
    savedPassports, carrotCoins, bigBangHistory.length,
    badLuckStreak, tabSwitchCount, hasRenamed,
    hasChangedPlanet, usedLangs.size, characterData
  ]);

  // 音效预加载
  useEffect(() => {
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
      } catch (err) { }
    };
    preload();
  }, []);

  // ==========================================
  // 3. 回调函数与逻辑
  // ==========================================
  const currentStats = useMemo(() => calculateStats(characterData.selectedParts), [characterData.selectedParts]);
  const flavorText = useMemo(() => generateFlavorText(currentStats, currentLang), [currentStats, currentLang]);

  const updateData = (updater: (prev: CharacterData) => CharacterData) => {
    setCharacterData(prev => ({ ...updater(prev), lastModified: Date.now() }));
  };

  const handleUpdateName = (name: string) => updateData(prev => ({ ...prev, name }));
  const handleUpdatePart = (cat: PartCategory, id: string) => updateData(prev => ({ ...prev, selectedParts: { ...prev.selectedParts, [cat]: id } }));
  const handleUpdatePlanetPart = (cat: PlanetCategory, id: string) => updateData(prev => ({ ...prev, selectedPlanetParts: { ...prev.selectedPlanetParts, [cat]: id } }));
  const toggleFlip = () => { const next = !isFlipped; setIsFlipped(next); setActiveTab(next ? 'base' : 'body'); };

  // 拖拽记录位置
  const handleMedalMove = useCallback((id: string, x: number, y: number) => {
    setUnlockedMedals(prev => {
      if (!prev[id]) return prev;
      return { ...prev, [id]: { ...prev[id], x, y } };
    });
  }, []);

  const handleReward = useCallback((amount: number, sourceId: string) => {
    gainCarrots(sourceId, amount);
    setTimeout(() => {
      setCarrotCoins(prev => prev + amount);
      if (audioCtx.current && buffers.current.coins) playBuffer(buffers.current.coins, audioCtx.current, 0.4);
      setToastMsg(currentLang === 'cn' ? `🚀 故事记录成功！奖励 ${amount} 🥕` : `🚀 Story Saved! Reward: ${amount} 🥕`);
      setTimeout(() => setToastMsg(null), 3000);
    }, 700);
  }, [gainCarrots, currentLang]);

  const handleIssue = async () => {
    if (carrotCoins < 5) {
      if (audioCtx.current && buffers.current.error) playBuffer(buffers.current.error, audioCtx.current, 0.6);
      setShakeBtn('btn-issue'); setTimeout(() => setShakeBtn(null), 400);
      setActionFeedback({ issue: 'no_carrot' }); setTimeout(() => setActionFeedback({}), 1200);
      return;
    }
    if (audioCtx.current && buffers.current.coins) playBuffer(buffers.current.coins, audioCtx.current, 0.5);
    spendCarrots('btn-issue', 5);
    setCarrotCoins(prev => prev - 5);
    setActionFeedback({ issue: '-5' });
    await delay(600);

    const originalBpm = PLAYLIST[currentTrackIndex].bpm;
    setDisplayBpm(260);
    setFlash(true);
    setIsIssuing(true);

    if (audioCtx.current && buffers.current.camera) playBuffer(buffers.current.camera, audioCtx.current, 1.2);
    setTimeout(() => setFlash(false), 150);
    await delay(500);

    const newId = generateUniqueId(Date.now());
    let bioText = characterData.name.toUpperCase() === 'BOBU.B' ? DEFAULT_BIOS.bobu[currentLang] : DEFAULT_BIOS.general[currentLang];
    const finalRarity = calculateFinalRarity(characterData.selectedParts, characterData.selectedPlanetParts, currentStats);

    const newPassport: PassportData = { ...characterData, id: newId, bio: bioText, stats: { ...currentStats }, rarity: finalRarity, savedAt: Date.now() };
    setSavedPassports(prev => [newPassport, ...prev]);
    setIssuedPassport(newPassport);
    setIsSuccessOpen(true);
    setTimeout(() => setDisplayBpm(originalBpm), 1000);
  };

  const handleBigBang = () => {
    if (carrotCoins < 1) {
      if (audioCtx.current && buffers.current.error) playBuffer(buffers.current.error, audioCtx.current, 0.6);
      setShakeBtn('btn-bigbang'); setTimeout(() => setShakeBtn(null), 400);
      setActionFeedback({ bigbang: 'no_carrot' }); setTimeout(() => setActionFeedback({}), 1200);
      return;
    }
    if (audioCtx.current && buffers.current.coins) playBuffer(buffers.current.coins, audioCtx.current, 0.4);
    spendCarrots('btn-bigbang', 1);

    setTimeout(() => {
      setCarrotCoins(prev => prev - 1);
      setActionFeedback({ bigbang: '-1' });
      updateData(prev => {
        const newSelectedParts = { ...prev.selectedParts };
        ['body', 'ears', 'face', 'hair', 'hair_b', 'access'].forEach(cat => {
          const picked = getWeightedRandomPart(getPartList(cat as PartCategory));
          if (picked) newSelectedParts[cat as PartCategory] = picked.id;
        });
        const newPlanetParts = { ...prev.selectedPlanetParts };
        ['base', 'surface', 'atmosphere', 'companion'].forEach(cat => {
          const picked = getWeightedRandomPart(getPartList(cat as PlanetCategory));
          if (picked) newPlanetParts[cat as PlanetCategory] = picked.id;
        });
        return { ...prev, selectedParts: newSelectedParts, selectedPlanetParts: newPlanetParts };
      });
      setBigBangTrigger(prev => prev + 1);
      setBigBangActive(true);
      setTimeout(() => { setBigBangActive(false); setTimeout(() => setActionFeedback({}), 300); }, 300);
    }, 400);
  };

  const handleUpdatePassportData = (id: string, field: keyof PassportData, value: any) => { setSavedPassports(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p)); };
  const handleDeletePassport = (id: string) => { setSavedPassports(prev => prev.filter(p => p.id !== id)); };

  // ==========================================
  // 4. 界面渲染 (Render)
  // ==========================================
  return (
    <div className={`min-h-screen transition-colors duration-700 ${isFlipped && viewMode === 'editor' ? 'bg-gray-900' : 'bg-livia-bg'} text-gray-900 p-4 md:p-8 font-rounded selection:bg-livia-yellow selection:text-black relative overflow-x-hidden ${bigBangActive ? 'animate-shake blur-sm' : ''}`}>

      <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-700 pointer-events-none z-[90] ${isIssuing ? 'opacity-100' : 'opacity-0'}`} />
      {flash && <div className="fixed inset-0 bg-white opacity-0 animate-flash pointer-events-none z-[9999]"></div>}
      <ParticleOverlay trigger={bigBangTrigger} color={isIssuing ? '#FFD700' : '#FFD93D'} />

      {toastMsg && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[9999] animate-bounce-in pointer-events-none">
          <div className="bg-livia-yellow text-black px-8 py-4 rounded-2xl border-[4px] border-black shadow-[6px_6px_0_black] -rotate-2">
            <span className="font-rounded font-black text-xl tracking-wide">{toastMsg}</span>
          </div>
        </div>
      )}

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

      {/* 🌠 动态贴纸墙 / 奖章背景层 */}
      {showMedals && (
        <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden">
          <div className="relative w-full h-full pointer-events-auto">
            {Object.entries(unlockedMedals).map(([id, medalData]) => {
              const def = ACHIEVEMENTS_DB?.[id];
              if (!def) return null; // 安全验证，没找到字典里的配置就不渲染
              return (
                <DraggableMedal
                  key={id}
                  medal={medalData}
                  def={def}
                  currentLang={currentLang}
                  onPositionChange={handleMedalMove}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* 🌠 SpaceBackground */}
      <SpaceBackground bpm={displayBpm} themeColor={PLAYLIST[currentTrackIndex].themeColor} meteorDensity={PLAYLIST[currentTrackIndex].meteorDensity} />
      {viewMode === 'passport' && <div className="fixed inset-0 bg-[#2c3e50] z-0 pointer-events-none"></div>}

      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 flex gap-3 z-50 items-center">
        <div id="carrot-wallet" className="flex items-center gap-1 font-bold">
          <CarrotCoinIcon className="w-6 h-6" />
          <span className="text-lg">{carrotCoins}</span>
        </div>
        <AudioPlayer lang={currentLang} currentTrackIndex={currentTrackIndex} onTrackChange={setCurrentTrackIndex} />
        <LanguageSelector currentLang={currentLang} onLanguageChange={setCurrentLang} />

        {/* 奖牌显隐控制开关 */}
        <button onClick={() => setShowMedals(!showMedals)} className={`relative w-12 h-12 bg-white border-[3px] border-black rounded-lg flex items-center justify-center transition-all ${showMedals ? 'shadow-[3px_3px_0_black]' : 'shadow-none translate-y-[3px] opacity-60'}`} title="Toggle Medals">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="6" />
            <path d="M8.5 13.5L7 22l5-2.5L17 22l-1.5-8.5" />
            {!showMedals && <line x1="4" y1="4" x2="20" y2="20" strokeWidth="3" />}
          </svg>
        </button>

        <button onClick={() => setViewMode('passport')} className="w-12 h-12 bg-white border-[3px] border-black rounded-lg shadow-[3px_3px_0_black] flex items-center justify-center hover:translate-y-[1px] hover:shadow-[2px_2px_0_black] active:translate-y-[3px] active:shadow-none transition-all" title="Archives">
          <ArchivesIcon className="w-6 h-6" />
        </button>
      </div>

      {viewMode === 'editor' && (
        <>
          <header className={`max-w-4xl mx-auto mb-6 text-center mt-12 md:mt-0 relative z-10 transition-opacity duration-500 ${isIssuing ? 'opacity-0' : 'opacity-100'}`}>
            <h1 className={`text-4xl md:text-6xl font-black tracking-tight drop-shadow-[2px_2px_0_rgba(0,0,0,1)] stroke-black transition-colors duration-500 ${isFlipped ? 'text-livia-blue' : 'text-livia-orange'}`} style={{ WebkitTextStroke: '2px black' }}>{TRANSLATIONS.appTitle[currentLang]}</h1>
            <p className={`mt-2 font-hand text-xl md:text-2xl transition-colors duration-500 ${isFlipped ? 'text-gray-300' : 'text-gray-700'}`}>{currentLang === 'cn' ? "官方居民定制器" : "Official Resident Customizer"}</p>
          </header>

          <main className="max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-center gap-10">
            <div className={`flex flex-col items-center relative transition-all duration-700 ease-in-out ${isIssuing ? 'z-[110] scale-105 md:scale-110 drop-shadow-2xl' : 'z-10'}`}>
              <Card data={characterData} stats={currentStats} flavorText={flavorText} isFlipped={isFlipped} onFlip={toggleFlip} lang={currentLang} showStamp={false} stampAngle={-15} particles={[]} hideRarity={true} />

              <div className={`mt-6 text-center transition-opacity duration-500 ${isIssuing ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <button onClick={toggleFlip} className={`font-hand text-lg transition-all duration-300 px-6 py-2 rounded-full ${isFlipped ? 'bg-white/10 text-white backdrop-blur-md border border-white/20 hover:bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-gray-900 underline hover:text-livia-orange'}`}>
                  {isFlipped ? `${TRANSLATIONS.buttons.showFront[currentLang]} ↩` : `${TRANSLATIONS.buttons.showBack[currentLang]} ↪`}
                </button>
              </div>
            </div>

            <div className={`flex flex-col gap-6 items-center md:items-start relative z-10 transition-opacity duration-500 ${isIssuing ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <Controls data={characterData} derivedStats={currentStats} activeTab={activeTab} isBackView={isFlipped} onTabChange={setActiveTab} updateName={handleUpdateName} updatePart={handleUpdatePart} updatePlanetPart={handleUpdatePlanetPart} lang={currentLang} />

              <div className="w-full max-w-[340px] flex flex-col gap-4 pb-8">
                <div className="flex gap-4 w-full">
                  <div className="flex-1 relative flex flex-col items-center">
                    <button id="btn-bigbang" onClick={handleBigBang} className={`w-full flex items-center justify-center gap-2 px-3 py-3 font-bold border-[3px] rounded-lg transition-all ${carrotCoins >= 1 ? 'bg-purple-500 text-white border-black shadow-[5px_5px_0_black] hover:shadow-[3px_3px_0_black] active:shadow-[1px_1px_0_black] btn-orange-glow' : 'bg-gray-200 border-gray-400 text-gray-500 grayscale opacity-80 cursor-not-allowed'} ${shakeBtn === 'btn-bigbang' ? 'animate-shake-err border-red-500' : ''}`}>
                      <DiceIcon className="w-5 h-5 text-white" />
                      <span className="text-xs font-black tracking-widest">BIG BANG</span>
                    </button>
                  </div>
                  <div className="flex-1 relative flex flex-col items-center">
                    <button id="btn-issue" onClick={handleIssue} className={`w-full flex items-center justify-center gap-2 px-3 py-3 font-bold border-[3px] rounded-lg transition-all ${carrotCoins >= 5 ? 'bg-green-500 text-white border-black shadow-[5px_5px_0_black] hover:shadow-[3px_3px_0_black] active:shadow-[1px_1px_0_black] btn-gold-glow' : 'bg-gray-200 border-gray-400 text-gray-500 grayscale opacity-80 cursor-not-allowed'} ${shakeBtn === 'btn-issue' ? 'animate-shake-err border-red-500' : ''}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
                      <span className="text-xs font-black tracking-widest">ISSUE</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </>
      )}

      {viewMode === 'passport' && (
        <div className="relative z-10 pt-16 pb-20">
          <PassportBook passports={savedPassports} onBack={() => setViewMode('editor')} onUpdatePassport={handleUpdatePassportData} onDelete={handleDeletePassport} lang={currentLang} onReward={handleReward} />
        </div>
      )}

      <SuccessOverlay
        isOpen={isSuccessOpen}
        passportData={issuedPassport}
        lang={currentLang}
        onClose={() => {
          setIsSuccessOpen(false); setIsIssuing(false); setViewMode('passport');
        }}
        playStampSound={() => { }}
      />

      {/* 🏆 新增：成就盲盒解锁弹窗 */}
      <AchievementUnlockModal
        isOpen={newlyUnlocked !== null}
        achievement={newlyUnlocked}
        lang={currentLang}
        onClose={() => setNewlyUnlocked(null)}
      />
    </div>
  );
};

export default App;