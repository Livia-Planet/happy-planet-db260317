import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Language, PassportData, ViewMode, StoryEntry } from '../types';
import { Avatar } from './Avatar';
import { getDominantStat, calculateStats, getStarDate } from '../utils/gameLogic';
import { CarrotCoinIcon } from './Icons';
import { SpaceBackground } from './SpaceBackground';
import { useAnimateTokens } from '../hooks/useAnimateTokens';
import { PLANET_PARTS_DB } from '../data/parts'; // 用于抽取未解锁的星球配件

// 🌟 全新 SVG 图标库
const SocialIcons = {
    StarSand: ({ className = "w-6 h-6" }) => (<svg viewBox="0 0 24 24" fill="#60EFFF" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6-6.2-4.5-6.2 4.5 2.4-7.6L2 9.6h7.6z" /><circle cx="12" cy="12" r="3" fill="white" /></svg>),
    Bottle: ({ className = "w-8 h-8" }) => (<svg viewBox="0 0 24 24" fill="#E0F2FE" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M8 3h8v3l3 4v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V10l3-4V3z" /><path d="M8 3V2h8v1" /><path d="M5 10h14" opacity="0.4" /><path d="M12 12l1.5 3h3l-2.5 2 1 3-2.5-2-2.5 2 1-3-2.5-2h3z" fill="#FFD700" stroke="none" /></svg>),
    Crosshair: ({ className = "w-6 h-6" }) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><circle cx="12" cy="12" r="3" fill="#60EFFF" /></svg>),
    Battery: ({ level }: { level: number }) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <rect x="2" y="7" width="18" height="10" rx="2" fill="white" />
            <line x1="22" y1="10" x2="22" y2="14" />
            {level >= 1 && <rect x="4" y="9" width="4" height="6" fill="#82E0AA" stroke="none" />}
            {level >= 2 && <rect x="9" y="9" width="4" height="6" fill="#82E0AA" stroke="none" />}
            {level >= 3 && <rect x="14" y="9" width="4" height="6" fill="#82E0AA" stroke="none" />}
        </svg>
    ),
    BobaShip: ({ className = "w-10 h-10" }) => (
        <svg viewBox="0 0 24 24" fill="#FF90E8" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <ellipse cx="12" cy="14" rx="10" ry="6" />
            <path d="M6 14v-4a6 6 0 0 1 12 0v4" fill="#E0F2FE" />
            <line x1="12" y1="10" x2="15" y2="2" stroke="#FFD700" strokeWidth="3" />
            <circle cx="10" cy="15" r="1.5" fill="black" stroke="none" />
            <circle cx="14" cy="15" r="1.5" fill="black" stroke="none" />
        </svg>
    ),
    MysteryGift: ({ className = "w-10 h-10" }) => (
        <svg viewBox="0 0 24 24" fill="#A8E6CF" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
    ),
    CarePackage: ({ className = "w-6 h-6" }) => (
        <svg viewBox="0 0 24 24" fill="#FF90E8" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="8" width="18" height="13" rx="2" /><path d="M12 8v13" /><path d="M19 12H5" /><path d="M12 8c-2-3-5-2-5 0s5 2 5 2 5-1 5-2-3-3-5 0z" fill="#FFD700" /></svg>
    ),
    Envelope: ({ className = "w-6 h-6" }) => (
        <svg viewBox="0 0 24 24" fill="#FFFBEB" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 8l9 6 9-6" /><rect x="3" y="6" width="18" height="12" rx="2" /></svg>
    )
};

// 🌟 神明传说 (放入漂流瓶)
const LORE_BOTTLES = [
    { id: 'lore_1', author: 'Mummis', date: 'Era I', title: { cn: '创世之风', en: 'Birth of Wind', se: 'Vindens Födelse' }, content: { cn: '当我们在沙漠中抚摸沙子，沙砾学会了在风中舞蹈，寂静中诞生了世界的第一首旋律。', en: 'When we stroke the desert sand, the dust learns to dance in the wind, and the world\'s first melody is born.', se: 'När vi smeker öknens sand, lär sig stoftet dansa i vinden, och ur tystnaden föds världens första melodi.' } },
    { id: 'lore_2', author: 'Puppis', date: 'Era II', title: { cn: '海的梦境', en: 'Ocean Dreams', se: 'Havets Drömmar' }, content: { cn: '我睡在地表深处，我的梦境化作了河流与湖泊。当水面闪烁时，我就醒来了。', en: 'I sleep beneath the surface, and my dreams form rivers and lakes. When the water gleams, I have awakened.', se: 'Jag sover under planetens yta, och mina drömmar formar floder och sjöar. När vattnet glimmar, har jag just vaknat.' } }
];

// 🌟 原住民 (盲盒抽取) -> 图片预留了 imgUrl，随时可以换成你画的 160x160 png！
const NATIVES_DB = [
    { id: 'native_ufoni', name: 'UFONi.A', imgUrl: '', parts: { body: 'body_white', ears: 'ears_none', face: 'face_innocent', hair: 'hair_none', hair_b: 'hair_b_none', access: 'access_robot' }, pParts: { base: 'planet_base_purple', surface: 'planet_surf_rings', atmosphere: 'planet_atmo_glow', companion: 'planet_comp_ufo' }, stats: { mod: 2, bus: 5, klurighet: 8 }, dialog: { cn: '光是由各种颜色组成的，你看到了吗？这是宇宙的秘密。', en: 'Light is made of all colors, do you see it?', se: 'Ljus består av alla färger, ser du det?' } },
    { id: 'native_kitty', name: 'Kitty.A', imgUrl: '', parts: { body: 'body_mimosa', ears: 'ears_mimosa', face: 'eyes_glasses', hair: 'hair_fashion', hair_b: 'hair_b_none', access: 'access_beret' }, pParts: { base: 'planet_base_green', surface: 'planet_surf_crystal', atmosphere: 'planet_atmo_aurora', companion: 'planet_comp_moon' }, stats: { mod: 7, bus: 4, klurighet: 6 }, dialog: { cn: '我刚才在种花，不小心吹起了一阵香气风暴！送你一点火星特产吧！', en: 'I was planting flowers and started a scent storm!', se: 'Jag planterade blommor och startade en doftstorm!' } }
];

interface SocialScreenProps {
    currentLang: Language; carrotCoins: number; starSand: number;
    onUpdateCoins: (amount: number) => void; onUpdateStarSand: (amount: number) => void;
    passports: PassportData[]; onNavigate: (view: ViewMode) => void; playSound: (type: any) => void;
    onUpdatePassport: (id: string, field: keyof PassportData, value: any) => void;
    unlockedParts?: string[]; onUnlockPart?: (partId: string) => void;
    unlockedShopItems?: string[]; onUnlockShopItem?: (itemId: string) => void;
}

export const SocialScreen: React.FC<SocialScreenProps> = ({
    currentLang, carrotCoins, starSand, onUpdateCoins, onUpdateStarSand, passports, onNavigate, playSound, onUpdatePassport, unlockedParts = [], onUnlockPart, unlockedShopItems = [], onUnlockShopItem
}) => {
    const { animateToken } = useAnimateTokens();

    const [globalAlert, setGlobalAlert] = useState<string | null>(null);
    const [selectedNeighbor, setSelectedNeighbor] = useState<PassportData | null>(null); // 自己的兔子
    const [activeEntity, setActiveEntity] = useState<any | null>(null); // 抽出的盲盒实体
    const [stampPrompt, setStampPrompt] = useState<PassportData | null>(null);

    // 气泡系统
    const [speechBubble, setSpeechBubble] = useState<{ text: string, id: string } | null>(null);

    // 扫描动画
    const [isScanning, setIsScanning] = useState(false);

    // 曲率控制
    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
    const [isDragging, setIsDragging] = useState(false);
    const [isWarping, setIsWarping] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });

    // 电池系统
    const BATTERY_MAX = 3;
    const RECHARGE_TIME_MS = 4 * 60 * 60 * 1000;
    const [battery, setBattery] = useState<number>(() => parseInt(localStorage.getItem('hp_radar_bat') || '3'));
    const [lastScanTime, setLastScanTime] = useState<number>(() => parseInt(localStorage.getItem('hp_radar_time') || Date.now().toString()));

    // 盲盒实体状态
    const [entities, setEntities] = useState<any[]>(() => {
        const saved = localStorage.getItem('hp_radar_entities');
        return saved ? JSON.parse(saved) : [];
    });

    const [readBottles, setReadBottles] = useState<string[]>(() => {
        const saved = localStorage.getItem('hp_radar_readBottles');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => { localStorage.setItem('hp_radar_entities', JSON.stringify(entities)); }, [entities]);
    useEffect(() => { localStorage.setItem('hp_radar_bat', battery.toString()); }, [battery]);
    useEffect(() => { localStorage.setItem('hp_radar_time', lastScanTime.toString()); }, [lastScanTime]);
    useEffect(() => { localStorage.setItem('hp_radar_readBottles', JSON.stringify(readBottles)); }, [readBottles]);

    // 电池恢复计算
    useEffect(() => {
        if (battery < BATTERY_MAX) {
            const now = Date.now();
            const recovered = Math.floor((now - lastScanTime) / RECHARGE_TIME_MS);
            if (recovered > 0) {
                setBattery(Math.min(BATTERY_MAX, battery + recovered));
                setLastScanTime(now);
            }
        }
    }, [battery, lastScanTime]);

    // 🌟 常驻层：你档案室里的所有兔子！(一只有几只就显示几只)
    const permanentNeighbors = useMemo(() => passports.filter(p => !p.isAssignedToFarm), [passports]);

    // 坐标分配引擎
    const getCoordinates = (index: number, baseRadius: number = 20) => {
        const radius = baseRadius + index * 8;
        const angle = index * (Math.PI * 2 * 0.618);
        return { x: 50 + radius * Math.cos(angle), y: 50 + radius * Math.sin(angle) };
    };

    // 🌟 核心：生成盲盒
    const generateUniverse = () => {
        const count = Math.floor(Math.random() * 3) + 3; // 3 to 5
        const newEntities = [];

        // 读取玩家写的故事
        const playerBottles = passports.flatMap(p => (p.stories || []).filter(s => s.isBottled).map(s => ({ id: s.id, author: p.starName || p.name, date: s.date, title: s.title, content: s.content })));
        const allBottles = [...LORE_BOTTLES, ...playerBottles].filter(b => !readBottles.includes(b.id));

        const lockedParts = Object.values(PLANET_PARTS_DB).filter(p => p.isUnlockable && !unlockedParts.includes(p.id));

        for (let i = 0; i < count; i++) {
            const rand = Math.random();
            const pos = getCoordinates(i, 40); // 盲盒的外圈半径更大

            if (rand < 0.5 && allBottles.length > 0) {
                const bottle = allBottles[Math.floor(Math.random() * allBottles.length)];
                newEntities.push({ uid: `ent_${Date.now()}_${i}`, type: 'bottle', pos, data: bottle });
            } else if (rand < 0.7) {
                const native = NATIVES_DB[Math.floor(Math.random() * NATIVES_DB.length)];
                newEntities.push({ uid: `ent_${Date.now()}_${i}`, type: 'native', pos, data: native });
            } else if (rand < 0.9 && lockedParts.length > 0) {
                const part = lockedParts[Math.floor(Math.random() * lockedParts.length)];
                newEntities.push({ uid: `ent_${Date.now()}_${i}`, type: 'part', pos, data: part });
            } else {
                newEntities.push({ uid: `ent_${Date.now()}_${i}`, type: 'boba', pos, data: null });
            }
        }
        setEntities(newEntities);
    };

    // --- 互动逻辑 ---
    const showBubble = (type: 'greet' | 'feed', targetId: string) => {
        const texts = type === 'greet'
            ? { cn: ['哇！是遥远星系的信号！', '你好呀！', '接收到脑电波！'], en: ['Signal received!', 'Hello there!', 'Friendly brainwaves!'], se: ['Signal mottagen!', 'Hej där!', 'Vänliga hjärnvågor!'] }
            : { cn: ['谢谢你的关怀包裹！', '火星沙子都跳舞了！'], en: ['Thanks for the care package!', 'The sand is dancing!'], se: ['Tack för omsorgspaketet!', 'Sanden dansar!'] };

        const arr = texts[currentLang];
        setSpeechBubble({ text: arr[Math.floor(Math.random() * arr.length)], id: targetId });
        setTimeout(() => setSpeechBubble(null), 4000);
    };

    const triggerWarp = () => {
        playSound('whoosh'); // 👈 曲率引擎加速音效！
        setIsWarping(true);
        setTimeout(() => setIsWarping(false), 300);
    };

    const zoomIn = () => { triggerWarp(); setTransform(prev => ({ ...prev, scale: Math.min(prev.scale * 1.2, 2.5) })); };
    const zoomOut = () => { triggerWarp(); setTransform(prev => ({ ...prev, scale: Math.max(prev.scale * 0.8, 0.4) })); };

    const handlePointerDown = (e: React.PointerEvent) => { setIsDragging(true); dragStart.current = { x: e.clientX - transform.x, y: e.clientY - transform.y }; };
    const handlePointerMove = (e: React.PointerEvent) => { if (!isDragging) return; setTransform(prev => ({ ...prev, x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y })); };
    const handlePointerUp = () => setIsDragging(false);

    // 1. 给常驻兔子投喂
    const handleFeedNeighbor = () => {
        if (!selectedNeighbor) return;
        if (carrotCoins < 5) {
            playSound('error'); setGlobalAlert(currentLang === 'cn' ? '胡萝卜币不够啦！\n快回农场赚点吧！' : 'Not enough carrots!'); return;
        }

        playSound('success');
        showBubble('feed', selectedNeighbor.id);
        animateToken('social-wallet-carrot', `perm-${selectedNeighbor.id}`, '🥕', false);
        onUpdateCoins(-5);

        setTimeout(() => {
            playSound('achievement');
            animateToken(`perm-${selectedNeighbor.id}`, 'social-wallet-starsand', '✨', true);
            onUpdateStarSand(10);
        }, 500);

        const curHunger = selectedNeighbor.hunger ?? 80;
        onUpdatePassport(selectedNeighbor.id, 'hunger', Math.min(100, curHunger + 30));
        setStampPrompt(selectedNeighbor);
        setSelectedNeighbor(null);
    };

    // 1.5 盖章写日记
    const handleWriteStamp = () => {
        if (!stampPrompt) return;
        playSound('stamp');

        const storageKey = `happyPlanet_stories_${stampPrompt.id}`;
        const localRaw = localStorage.getItem(storageKey);
        const existingStories: StoryEntry[] = localRaw ? JSON.parse(localRaw) : (stampPrompt.stories || []);

        const capacities = [5, 7, 6, 8, 5, 5, 8, 7, 10];
        let targetGalaxy = 0, targetStar = 0, found = false;

        for (let g = 0; g < capacities.length; g++) {
            for (let s = 0; s < capacities[g]; s++) {
                if (!existingStories.some(st => st.galaxyIndex === g && st.starIndex === s)) {
                    targetGalaxy = g; targetStar = s; found = true; break;
                }
            }
            if (found) break;
        }

        if (found) {
            const activeFarmPet = passports.find(p => p.isAssignedToFarm);
            const visitorName = activeFarmPet ? activeFarmPet.name : (currentLang === 'cn' ? '神秘旅人' : 'A Traveler');

            const newStory: StoryEntry = {
                id: `${targetGalaxy}-${targetStar}`, date: getStarDate(),
                title: { cn: '星际馈赠', en: 'Stellar Gift', se: 'Stjärngåva' },
                content: {
                    cn: `今天，来自远方的 ${visitorName} 穿过了星云来看我！\n\n感谢三众神的恩赐，让我在浩瀚的宇宙中不再孤单。收到关怀包裹时，连火星的沙子都在为我们跳舞呢！`,
                    en: `Today, ${visitorName} crossed the nebula to visit me!\n\nThanks to the Three Gods, I'm no longer alone in this universe. The Martian sand danced when the care package arrived!`,
                    se: `Idag korsade ${visitorName} nebulosan för att besöka mig!\n\nTack vare De Tre Gudarna är jag inte längre ensam. Mars-sanden dansade för oss när paketet kom!`
                },
                galaxyIndex: targetGalaxy, starIndex: targetStar, hasReceivedReward: true
            };

            const updatedStories = [...existingStories, newStory];
            localStorage.setItem(storageKey, JSON.stringify(updatedStories));
            onUpdatePassport(stampPrompt.id, 'stories', updatedStories);
        } else {
            setGlobalAlert(currentLang === 'cn' ? '手帐已经贴满啦！' : 'Storybook is full!');
        }
        setStampPrompt(null);
    };

    // 2. 雷达盲盒扫描
    const handleRescan = () => {
        if (battery <= 0) {
            playSound('error'); setGlobalAlert(currentLang === 'cn' ? '雷达能量耗尽啦！\n每 4 小时恢复一格，或者点击电池花 20 🥕 强制充能！' : 'Radar out of energy!'); return;
        }
        playSound('camera');
        setBattery(prev => prev - 1);
        setLastScanTime(Date.now());
        setIsScanning(true);
        setEntities([]); // 清空旧盲盒

        setTimeout(() => {
            generateUniverse();
            setIsScanning(false);
            triggerWarp(); // 扫描完有个加速冲击感！
        }, 2000);
    };

    // 2.5 充能
    const handleRecharge = () => {
        if (battery >= BATTERY_MAX) return;
        if (carrotCoins >= 20) {
            playSound('success'); onUpdateCoins(-20); setBattery(BATTERY_MAX); setLastScanTime(Date.now());
        } else {
            playSound('error'); setGlobalAlert(currentLang === 'cn' ? '需要 20 胡萝卜币才能强制充能！' : 'Need 20 carrots to recharge!');
        }
    };

    // 3. 认领盲盒实体 (阅后即焚)
    const handleClaimEntity = (action: 'like_bottle' | 'listen_native' | 'unlock_part' | 'buy_boba') => {
        if (!activeEntity) return;

        if (action === 'buy_boba') {
            if (starSand < 30) { playSound('error'); setGlobalAlert(currentLang === 'cn' ? '星砂不够买虫洞杯！' : 'Not enough Star Sand!'); return; }
            onUpdateStarSand(-30);
            if (onUnlockShopItem && !unlockedShopItems?.includes('wormhole_cup')) onUnlockShopItem('wormhole_cup');
            playSound('success'); setGlobalAlert(currentLang === 'cn' ? '🥤 成功购买虫洞杯！\n已存入农场补给包，可用于秒杀探险时间！' : 'Bought Wormhole Cup!');
        }
        else if (action === 'unlock_part') {
            playSound('achievement');
            if (onUnlockPart) onUnlockPart(activeEntity.data.id);
            setGlobalAlert(currentLang === 'cn' ? `🎁 发现新星球配件！\n[${activeEntity.data.name[currentLang]}] 已加入创造器！` : 'New Planet Part Unlocked!');
        }
        else if (action === 'listen_native') {
            playSound('coins'); animateToken('avatar-center', 'social-wallet-carrot', '🥕', true); onUpdateCoins(10);
            setGlobalAlert(currentLang === 'cn' ? '原住民微笑着塞给你 10 个 🥕！' : 'Received 10 Carrots!');
        }
        else if (action === 'like_bottle') {
            playSound('stamp'); animateToken('avatar-center', 'social-wallet-starsand', '✨', true); onUpdateStarSand(1);
            setReadBottles(prev => [...prev, activeEntity.data.id]);
        }

        // 🌟 互动完毕，伴随 whoosh 飞走消失！
        playSound('whoosh');
        setEntities(prev => prev.filter(e => e.uid !== activeEntity.uid));
        setActiveEntity(null);
    };

    return (
        <div
            className={`fixed inset-0 z-40 bg-[#0a0a12] overflow-hidden font-rounded select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}
        >
            <div className="absolute inset-0 z-0 opacity-70 pointer-events-none">
                <SpaceBackground bpm={30} themeColor="#60EFFF" meteorDensity={3} />
            </div>

            {/* 雷达波背景 */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-80 z-10">
                <div className="absolute w-[30vw] h-[30vw] rounded-full border-2 border-[#60EFFF] opacity-40 shadow-[0_0_30px_rgba(96,239,255,0.3)]" />
                <div className="absolute w-[60vw] h-[60vw] rounded-full border border-[#60EFFF] opacity-20 border-dashed" />
                <div className="absolute w-[120vw] h-[120vw] rounded-full radar-sweep pointer-events-none" />
            </div>

            {/* 🌟 顶部信息栏：双货币 + 电池 */}
            <div className="absolute top-6 left-6 z-50 pointer-events-auto flex flex-col gap-3">
                <div className="flex gap-3">
                    <div id="social-wallet-starsand" className="bg-white/10 backdrop-blur-md px-4 py-2 border-[3px] border-[#60EFFF] rounded-2xl flex items-center gap-2 shadow-[4px_4px_0_black]">
                        <SocialIcons.StarSand className="w-5 h-5" />
                        <span className="font-black text-xl text-white tracking-widest">{starSand}</span>
                    </div>
                    <div id="social-wallet-carrot" className="bg-white/10 backdrop-blur-md px-4 py-2 border-[3px] border-[#FFD700] rounded-2xl flex items-center gap-2 shadow-[4px_4px_0_black]">
                        <CarrotCoinIcon className="w-5 h-5" />
                        <span className="font-black text-xl text-white tracking-widest">{carrotCoins}</span>
                    </div>
                </div>
                <button onClick={handleRecharge} className="bg-white/10 backdrop-blur-md px-4 py-2 border-[3px] border-[#82E0AA] rounded-2xl flex items-center gap-2 shadow-[4px_4px_0_black] w-max hover:bg-white/20 transition-colors">
                    <SocialIcons.Battery level={battery} />
                    <span className="font-black text-sm text-[#82E0AA] uppercase ml-1">{battery < BATTERY_MAX ? `${currentLang === 'cn' ? '充能中' : 'CHARGING'}` : 'MAX'}</span>
                    {battery < BATTERY_MAX && <div className="ml-2 flex items-center gap-1 text-[10px] text-yellow-300 border-l border-white/20 pl-2"><CarrotCoinIcon className="w-3 h-3" /> 20</div>}
                </button>
            </div>

            {/* 🌟 缩放控制 */}
            <div className="absolute bottom-28 right-6 z-50 flex flex-col gap-2 pointer-events-auto">
                <button onClick={zoomIn} className="w-10 h-10 bg-white/10 backdrop-blur-md border-2 border-[#60EFFF] text-[#60EFFF] rounded-xl flex items-center justify-center text-xl font-black hover:bg-[#60EFFF] hover:text-black transition-colors">+</button>
                <button onClick={zoomOut} className="w-10 h-10 bg-white/10 backdrop-blur-md border-2 border-[#60EFFF] text-[#60EFFF] rounded-xl flex items-center justify-center text-xl font-black hover:bg-[#60EFFF] hover:text-black transition-colors">-</button>
            </div>

            {/* 🌟 底部雷达扫描按钮 */}
            {entities.length === 0 && !isScanning && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
                    <button onClick={handleRescan} className="bg-black/60 backdrop-blur-sm border-[4px] border-[#60EFFF] text-[#60EFFF] px-8 py-4 rounded-full font-black uppercase tracking-widest shadow-[0_0_30px_rgba(96,239,255,0.8)] hover:bg-[#60EFFF] hover:text-black hover:scale-110 transition-all flex items-center gap-3">
                        <SocialIcons.Crosshair className="w-6 h-6 animate-pulse" />
                        {currentLang === 'cn' ? '启动星域扫描' : 'SCAN SECTOR'}
                    </button>
                </div>
            )}

            {/* 🌟 疯狂扫描时的十字准星 */}
            {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                    <div className="text-[#60EFFF] animate-frantic">
                        <SocialIcons.Crosshair className="w-24 h-24 drop-shadow-[0_0_25px_#60EFFF]" />
                    </div>
                </div>
            )}

            {/* 🌟 宇宙交互图层 + 曲率加速动画 */}
            <div className={`absolute inset-0 z-30 transition-all duration-300 ease-out ${isWarping ? 'animate-warp-speed' : ''}`}
                style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}>

                <div id="avatar-center" className="absolute top-1/2 left-1/2 w-1 h-1 pointer-events-none" />

                {/* --- 永远常驻的档案室兔子 --- */}
                {permanentNeighbors.map((neighbor, idx) => {
                    const pos = getCoordinates(idx, 15); // 内圈
                    return (
                        <div
                            key={neighbor.id} id={`perm-${neighbor.id}`}
                            onClick={(e) => { e.stopPropagation(); playSound('click'); setSelectedNeighbor(neighbor); showBubble('greet', neighbor.id); }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group hover:scale-110 transition-transform duration-300 pointer-events-auto"
                            style={{ left: `${pos.x}%`, top: `${pos.y}%`, animation: `planet-float ${4 + idx}s ease-in-out infinite` }}
                        >
                            {speechBubble?.id === neighbor.id && (
                                <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-[100] animate-bubble-pop pointer-events-none w-max max-w-[160px]">
                                    <div className="bg-white border-[3px] border-black px-3 py-1.5 rounded-2xl shadow-[4px_4px_0_black] relative">
                                        <span className="font-black text-xs leading-tight block text-center text-black">{speechBubble.text}</span>
                                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-[3px] border-r-[3px] border-black transform rotate-45" />
                                    </div>
                                </div>
                            )}

                            {/* 🌟 这里是你要求的坐标 绝对保留！ */}
                            <div className="w-16 h-16 bg-[#2c3e50] border-[3px] border-[#60EFFF] rounded-full overflow-hidden flex items-center justify-center relative shadow-[0_0_20px_rgba(96,239,255,0.4)] group-hover:shadow-[0_0_30px_rgba(96,239,255,0.9)]">
                                <div className="scale-[0.5] origin-center translate-y-0">
                                    <Avatar selectedParts={neighbor.selectedParts} dominantStat={getDominantStat(calculateStats(neighbor.selectedParts, neighbor.stats))} transparent />
                                </div>
                                {(neighbor.hunger ?? 80) < 50 && (<div className="absolute top-0 right-2 bg-white rounded-full p-1 border-2 border-black animate-bounce"><SocialIcons.CarePackage className="w-4 h-4" /></div>)}
                            </div>
                            <span className="mt-2 bg-black/80 text-[#60EFFF] text-[8px] font-mono font-bold px-2 py-0.5 rounded border border-[#60EFFF]/30 tracking-widest uppercase">{neighbor.name}</span>
                        </div>
                    );
                })}

                {/* --- 盲盒生成的实体 (阅后即焚) --- */}
                {entities.map((entity, idx) => {
                    return (
                        <div
                            key={entity.uid}
                            onClick={(e) => { e.stopPropagation(); playSound('click'); setActiveEntity(entity); }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group hover:scale-110 transition-transform duration-300 pointer-events-auto"
                            style={{ left: `${entity.pos.x}%`, top: `${entity.pos.y}%`, animation: `planet-float ${5 + idx}s ease-in-out infinite alternate` }}
                        >
                            {entity.type === 'native' && (
                                <>
                                    <div className="w-16 h-16 bg-[#2c3e50] border-[3px] border-[#FF90E8] rounded-full overflow-hidden flex items-center justify-center relative shadow-[0_0_20px_rgba(255,144,232,0.4)] group-hover:shadow-[0_0_30px_rgba(255,144,232,0.9)]">
                                        {/* 🌟 这里是替换图片的智能接口 */}
                                        {entity.data.imgUrl ? (
                                            <img src={entity.data.imgUrl} alt={entity.data.name} className="w-full h-full object-contain scale-125" />
                                        ) : (
                                            <div className="scale-[0.5] origin-center translate-y-0">
                                                <Avatar selectedParts={entity.data.parts} dominantStat={getDominantStat(calculateStats(entity.data.parts, entity.data.stats))} transparent />
                                            </div>
                                        )}
                                    </div>
                                    <span className="mt-2 bg-black/80 text-[#FF90E8] text-[8px] font-mono font-bold px-2 py-0.5 rounded border border-[#FF90E8]/30 tracking-widest uppercase">{entity.data.name}</span>
                                </>
                            )}
                            {entity.type === 'bottle' && (
                                <div className="relative transform animate-spin-slow">
                                    <SocialIcons.Bottle className="w-10 h-10 drop-shadow-[0_0_15px_rgba(96,239,255,0.8)]" />
                                </div>
                            )}
                            {entity.type === 'part' && (
                                <div className="relative">
                                    <SocialIcons.MysteryGift className="w-12 h-12 drop-shadow-[0_0_15px_rgba(168,230,207,0.8)] animate-pulse" />
                                </div>
                            )}
                            {entity.type === 'boba' && (
                                <div className="relative transform animate-float">
                                    <SocialIcons.BobaShip className="w-14 h-14 drop-shadow-[0_0_20px_rgba(255,144,232,0.8)]" />
                                    <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-[#FF90E8] text-[8px] font-mono font-bold px-2 py-0.5 rounded uppercase whitespace-nowrap">BOBA SHOP</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* --- 🌟 完美居中的 Portal 传送门 --- */}
            {typeof document !== 'undefined' && createPortal(
                <>
                    {/* 弹窗1：投喂自己的常驻兔子 */}
                    {selectedNeighbor && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in pointer-events-auto">
                            <div className="bg-[#fdfdf9] border-[5px] border-black rounded-[3rem] p-8 w-full max-w-sm shadow-[15px_15px_0_black] flex flex-col items-center animate-scale-in relative">
                                <button onClick={() => setSelectedNeighbor(null)} className="absolute top-4 right-6 text-4xl font-black text-gray-400 hover:text-black transition-colors">&times;</button>
                                <div className="w-24 h-24 bg-gray-100 border-[4px] border-black rounded-full overflow-hidden flex items-center justify-center shadow-inner mb-4">
                                    <div className="scale-[0.7] origin-center translate-y-0"><Avatar selectedParts={selectedNeighbor.selectedParts} dominantStat={getDominantStat(calculateStats(selectedNeighbor.selectedParts, selectedNeighbor.stats))} transparent /></div>
                                </div>
                                <h3 className="font-black text-2xl uppercase tracking-widest">{selectedNeighbor.name}</h3>
                                <p className="font-bold text-gray-500 text-xs mb-6 uppercase text-center px-2">{selectedNeighbor.bio || 'Resident of Happy Planet'}</p>

                                <button onClick={handleFeedNeighbor} className="w-full bg-[#82E0AA] border-[4px] border-black py-4 rounded-2xl font-black text-lg shadow-[4px_4px_0_black] active:translate-y-1 active:shadow-none transition-all flex flex-col items-center gap-1 hover:bg-[#6EE7B7]">
                                    <span className="uppercase tracking-widest">{currentLang === 'cn' ? '投喂关怀包裹' : 'SEND CARE PACKAGE'}</span>
                                    <div className="flex items-center gap-4 text-[10px]">
                                        <span className="flex items-center text-red-600"><CarrotCoinIcon className="w-3 h-3 mr-1" /> -5</span>
                                        <span className="flex items-center text-blue-800"><SocialIcons.StarSand className="w-3 h-3 mr-1" /> +10</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 弹窗2：日记盖章 */}
                    {stampPrompt && (
                        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in pointer-events-auto">
                            <div className="bg-[#FFFBEB] border-[5px] border-black rounded-[2rem] p-6 w-full max-w-xs shadow-[10px_10px_0_black] flex flex-col items-center animate-bounce-in relative">
                                <div className="w-16 h-16 bg-[#FFD700] rounded-full border-[3px] border-black flex items-center justify-center -mt-12 mb-4 shadow-[4px_4px_0_black]">
                                    <SocialIcons.Envelope className="w-8 h-8" />
                                </div>
                                <h3 className="font-black text-xl mb-2">{currentLang === 'cn' ? '包裹送达啦！' : 'Package Delivered!'}</h3>
                                <p className="text-gray-600 text-center text-sm font-bold mb-6">
                                    {currentLang === 'cn' ? `你想把这次拜访，记录到 ${stampPrompt.name} 的手帐里吗？` : `Write a visitor diary in ${stampPrompt.name}'s notebook?`}
                                </p>
                                <div className="flex gap-3 w-full">
                                    <button onClick={() => setStampPrompt(null)} className="flex-1 border-2 border-black py-3 rounded-xl font-black text-xs hover:bg-gray-100">{currentLang === 'cn' ? '不用了' : 'NO THANKS'}</button>
                                    <button onClick={handleWriteStamp} className="flex-1 bg-black text-white border-2 border-black py-3 rounded-xl font-black text-xs hover:bg-gray-800 shadow-[3px_3px_0_rgba(0,0,0,0.3)]">{currentLang === 'cn' ? '盖上访客章' : 'STAMP DIARY'}</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 弹窗3：与盲盒实体交互 (原住民、瓶子、奶茶、配件) */}
                    {activeEntity && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in pointer-events-auto">
                            <div className="bg-white border-[5px] border-black rounded-[3rem] p-8 w-full max-w-sm shadow-[15px_15px_0_black] flex flex-col items-center animate-scale-in relative" style={{ backgroundImage: 'radial-gradient(#e0e0dc 1.2px, transparent 1.2px)', backgroundSize: '18px 18px' }}>
                                <button onClick={() => setActiveEntity(null)} className="absolute top-4 right-6 text-4xl font-black text-gray-400 hover:text-black transition-colors">&times;</button>

                                {/* 3.1 原住民 */}
                                {activeEntity.type === 'native' && (
                                    <>
                                        <div className="w-24 h-24 bg-gray-100 border-[4px] border-black rounded-full overflow-hidden flex items-center justify-center shadow-inner mb-4 relative">
                                            {activeEntity.data.imgUrl ? <img src={activeEntity.data.imgUrl} className="w-full h-full object-contain scale-125" /> : <div className="scale-[0.7]"><Avatar selectedParts={activeEntity.data.parts} dominantStat={getDominantStat(calculateStats(activeEntity.data.parts, activeEntity.data.stats))} transparent /></div>}
                                        </div>
                                        <h3 className="font-black text-2xl uppercase tracking-widest mb-4">{activeEntity.data.name}</h3>
                                        <div className="bg-[#E0F2FE] border-[3px] border-black p-4 rounded-2xl mb-6 relative w-full">
                                            <p className="font-bold text-gray-800 text-sm text-center">"{activeEntity.data.dialog[currentLang]}"</p>
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#E0F2FE] border-t-[3px] border-l-[3px] border-black transform rotate-45" />
                                        </div>
                                        <button onClick={() => handleClaimEntity('listen_native')} className="w-full bg-[#FFD700] border-[4px] border-black py-4 rounded-2xl font-black text-lg shadow-[4px_4px_0_black] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2">
                                            {currentLang === 'cn' ? '聆听并告别' : 'LISTEN & BYE'} <CarrotCoinIcon className="w-5 h-5" />+10
                                        </button>
                                    </>
                                )}

                                {/* 3.2 漂流瓶 */}
                                {activeEntity.type === 'bottle' && (
                                    <>
                                        <div className="bg-blue-100 text-blue-800 font-mono text-[10px] font-bold px-4 py-1 rounded-full border-2 border-black mb-6 uppercase tracking-[0.2em] shadow-sm">{activeEntity.data.date}</div>
                                        <h3 className="font-black font-hand text-3xl uppercase tracking-tighter text-center mb-4">{activeEntity.data.title[currentLang]}</h3>
                                        <p className="font-hand text-xl text-gray-700 text-center leading-relaxed mb-8 px-2 whitespace-pre-line">"{activeEntity.data.content[currentLang]}"</p>
                                        <div className="font-mono text-xs text-gray-400 uppercase tracking-widest mb-6">FROM: {activeEntity.data.author}</div>
                                        <button onClick={() => handleClaimEntity('like_bottle')} className="w-full bg-[#FFD700] border-[4px] border-black py-4 rounded-2xl font-black text-lg shadow-[4px_4px_0_black] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 hover:bg-[#FACC15]">
                                            {currentLang === 'cn' ? '贴上鼓励星标' : 'STAMP WITH LOVE'} <SocialIcons.StarSand className="w-5 h-5" />+1
                                        </button>
                                    </>
                                )}

                                {/* 3.3 未知配件 */}
                                {activeEntity.type === 'part' && (
                                    <>
                                        <SocialIcons.MysteryGift className="w-20 h-20 mb-4 animate-bounce" />
                                        <h3 className="font-black text-2xl uppercase tracking-widest text-center mb-2">{currentLang === 'cn' ? '发现神秘遗迹' : 'ANCIENT RELIC'}</h3>
                                        <p className="font-bold text-gray-500 text-sm mb-6 text-center">{currentLang === 'cn' ? `这是一个名为 [${activeEntity.data.name[currentLang]}] 的星球配方！\n要把它加入创造器吗？` : `Found ${activeEntity.data.name[currentLang]}! Add to Creator?`}</p>
                                        <button onClick={() => handleClaimEntity('unlock_part')} className="w-full bg-[#82E0AA] border-[4px] border-black py-4 rounded-2xl font-black text-lg shadow-[4px_4px_0_black] active:translate-y-1 active:shadow-none transition-all">
                                            {currentLang === 'cn' ? '吸收配方' : 'ABSORB DATA'}
                                        </button>
                                    </>
                                )}

                                {/* 3.4 奶茶飞船 */}
                                {activeEntity.type === 'boba' && (
                                    <>
                                        <SocialIcons.BobaShip className="w-24 h-24 mb-4" />
                                        <h3 className="font-black text-2xl uppercase tracking-widest mb-2">{currentLang === 'cn' ? '星际流浪商铺' : 'SPACE BOBA'}</h3>
                                        <p className="font-bold text-gray-500 text-sm mb-6 text-center">{currentLang === 'cn' ? '神秘的商人向你推销传说中的【虫洞杯】！\n可以秒杀农场里的探险倒计时哦！' : 'Buy the legendary Wormhole Cup?'}</p>
                                        <button onClick={() => handleClaimEntity('buy_boba')} className="w-full bg-[#FF90E8] border-[4px] border-black py-4 rounded-2xl font-black text-lg shadow-[4px_4px_0_black] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 hover:bg-[#FF7CE0]">
                                            {currentLang === 'cn' ? '购买虫洞杯' : 'BUY WORMHOLE'} <SocialIcons.StarSand className="w-5 h-5" /> -30
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 全局报错 */}
                    {globalAlert && (
                        <div className="fixed inset-0 z-[11000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm pointer-events-auto">
                            <div className="bg-white border-[6px] border-black p-8 rounded-[40px] shadow-[15px_15px_0_black] w-full max-w-[320px] flex flex-col items-center animate-bounce-in">
                                <div className="w-20 h-20 bg-[#FFB7B2] border-[4px] border-black rounded-full flex items-center justify-center mb-6 shadow-[inset_-3px_-3px_0_rgba(0,0,0,0.1)]">
                                    <span className="font-black text-4xl text-black">!</span>
                                </div>
                                <h3 className="font-black text-2xl mb-2 text-center uppercase tracking-tighter">{currentLang === 'cn' ? '等一下！' : 'OOPS!'}</h3>
                                <p className="text-black/60 font-bold mb-8 text-center text-sm whitespace-pre-line leading-relaxed">{globalAlert}</p>
                                <button onClick={() => { playSound('click'); setGlobalAlert(null); }} className="w-full py-4 bg-[#FFD700] border-[4px] border-black rounded-2xl font-black text-xl shadow-[4px_4px_0_black] active:translate-y-1 active:shadow-none transition-all">
                                    {currentLang === 'cn' ? '知道了' : 'GOT IT'}
                                </button>
                            </div>
                        </div>
                    )}
                </>,
                document.body
            )}

            <style>{`
                @keyframes planet-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
                @keyframes radar-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .radar-sweep { background: conic-gradient(from 0deg, transparent 70%, rgba(96, 239, 255, 0.1) 80%, rgba(96, 239, 255, 0.5) 100%); animation: radar-spin 6s linear infinite; }
                
                /* 🌟 曲率引擎模糊特效 */
                @keyframes warp-speed {
                    0% { filter: blur(0px); transform: scale(1); }
                    50% { filter: blur(8px) brightness(1.5); }
                    100% { filter: blur(0px); transform: scale(1); }
                }
                .animate-warp-speed { animation: warp-speed 0.3s ease-out; }
                
                /* 🌟 疯狂十字瞄准镜 */
                @keyframes frantic-search {
                    0% { transform: translate(0, 0) scale(1.5); }
                    20% { transform: translate(-50px, -30px) scale(2) rotate(-15deg); }
                    40% { transform: translate(40px, 40px) scale(1.2) rotate(20deg); }
                    60% { transform: translate(-30px, 50px) scale(1.8) rotate(-10deg); }
                    80% { transform: translate(40px, -50px) scale(1.4) rotate(15deg); }
                    100% { transform: translate(0, 0) scale(1.5); }
                }
                .animate-frantic { animation: frantic-search 0.4s ease-in-out infinite; }
                
                /* 气泡弹出 */
                @keyframes bubble-pop {
                    0% { opacity: 0; transform: translateX(-50%) scale(0.5) translateY(10px); }
                    50% { transform: translateX(-50%) scale(1.1) translateY(0); }
                    100% { opacity: 1; transform: translateX(-50%) scale(1) translateY(0); }
                }
                .animate-bubble-pop { animation: bubble-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
            `}</style>
        </div>
    );
};