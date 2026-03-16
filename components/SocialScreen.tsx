import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Language, PassportData, ViewMode, StoryEntry } from '../types';
import { Avatar } from './Avatar';
import { getDominantStat, calculateStats, getStarDate } from '../utils/gameLogic';
import { CarrotCoinIcon } from './Icons';
import { SpaceBackground } from './SpaceBackground';
import { useAnimateTokens } from '../hooks/useAnimateTokens'; // 👈 引入动画引擎！

const SocialIcons = {
    StarSand: ({ className = "w-6 h-6" }) => (
        <svg viewBox="0 0 24 24" fill="#60EFFF" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6-6.2-4.5-6.2 4.5 2.4-7.6L2 9.6h7.6z" /><circle cx="12" cy="12" r="3" fill="white" /></svg>
    ),
    Bottle: ({ className = "w-8 h-8" }) => (
        <svg viewBox="0 0 24 24" fill="#E0F2FE" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M8 3h8v3l3 4v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V10l3-4V3z" /><path d="M8 3V2h8v1" /><path d="M5 10h14" opacity="0.4" /><path d="M12 12l1.5 3h3l-2.5 2 1 3-2.5-2-2.5 2 1-3-2.5-2h3z" fill="#FFD700" stroke="none" /></svg>
    ),
    CarePackage: ({ className = "w-6 h-6" }) => (
        <svg viewBox="0 0 24 24" fill="#FF90E8" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="8" width="18" height="13" rx="2" /><path d="M12 8v13" /><path d="M19 12H5" /><path d="M12 8c-2-3-5-2-5 0s5 2 5 2 5-1 5-2-3-3-5 0z" fill="#FFD700" /></svg>
    ),
    Envelope: ({ className = "w-6 h-6" }) => (
        <svg viewBox="0 0 24 24" fill="#FFFBEB" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 8l9 6 9-6" /><rect x="3" y="6" width="18" height="12" rx="2" /></svg>
    ),
    Crosshair: ({ className = "w-6 h-6" }) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><circle cx="12" cy="12" r="3" fill="#60EFFF" /></svg>
    )
};

// 🌟 原著神明宇宙纪年：专门装在漂流瓶里的传说
const LORE_BOTTLES = [
    {
        id: 'lore_1', author: 'Mummis', date: 'Era I',
        title: { cn: '创世之风', en: 'Birth of Wind', se: 'Vindens Födelse' },
        content: {
            cn: '当我们在沙漠中抚摸沙子，沙砾学会了在风中舞蹈，寂静中诞生了世界的第一首旋律。',
            en: 'When we stroke the desert sand, the dust learns to dance in the wind, and the world\'s first melody is born.',
            se: 'När vi smeker öknens sand, lär sig stoftet dansa i vinden, och ur tystnaden föds världens första melodi.'
        }
    },
    {
        id: 'lore_2', author: 'Puppis', date: 'Era II',
        title: { cn: '海的梦境', en: 'Ocean Dreams', se: 'Havets Drömmar' },
        content: {
            cn: '我睡在地表深处，我的梦境化作了河流与湖泊。当水面闪烁时，我就醒来了。',
            en: 'I sleep beneath the surface, and my dreams form rivers and lakes. When the water gleams, I have awakened.',
            se: 'Jag sover under planetens yta, och mina drömmar formar floder och sjöar. När vattnet glimmar, har jag just vaknat.'
        }
    }
];

interface SocialScreenProps {
    currentLang: Language;
    carrotCoins: number;
    starSand: number;
    onUpdateCoins: (amount: number) => void;
    onUpdateStarSand: (amount: number) => void;
    passports: PassportData[];
    onNavigate: (view: ViewMode) => void;
    playSound: (type: any) => void;
    onUpdatePassport: (id: string, field: keyof PassportData, value: any) => void;
}

export const SocialScreen: React.FC<SocialScreenProps> = ({
    currentLang, carrotCoins, starSand, onUpdateCoins, onUpdateStarSand, passports, onNavigate, playSound, onUpdatePassport
}) => {
    const { animateToken } = useAnimateTokens(); // 👈 激活飞行动画引擎

    const [selectedNeighbor, setSelectedNeighbor] = useState<PassportData | null>(null);
    const [selectedBottle, setSelectedBottle] = useState<any | null>(null);
    const [stampPrompt, setStampPrompt] = useState<PassportData | null>(null);
    const [globalAlert, setGlobalAlert] = useState<string | null>(null);

    // 🌟 灵魂气泡系统
    const [speechBubble, setSpeechBubble] = useState<{ text: string, id: string } | null>(null);

    const BUBBLES = {
        greet: {
            cn: ['哇！是遥远星系的信号！', '你好呀，星际旅人！', '接收到友好的脑电波！'],
            en: ['Wow! A signal from afar!', 'Hello there, traveler!', 'Friendly brainwaves received!'],
            se: ['Wow! En signal från en avlägsen galax!', 'Hej där, resenär!', 'Vänliga hjärnvågor mottagna!']
        },
        feed: {
            cn: ['谢谢你的关怀包裹！', '太好吃啦，火星沙子都跳舞了！', '收到满满的能量！'],
            en: ['Thanks for the care package!', 'So yummy, the sand is dancing!', 'Full of energy now!'],
            se: ['Tack för omsorgspaketet!', 'Så gott, sanden dansar!', 'Full av energi nu!']
        }
    };

    const showBubble = (type: 'greet' | 'feed', neighborId: string) => {
        const phrases = BUBBLES[type][currentLang];
        const text = phrases[Math.floor(Math.random() * phrases.length)];
        setSpeechBubble({ text, id: neighborId });
        setTimeout(() => setSpeechBubble(null), 5000);
    };

    const [isScanning, setIsScanning] = useState(false);
    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });

    const [readBottles, setReadBottles] = useState<string[]>(() => {
        const saved = localStorage.getItem('happyPlanet_readBottles');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => { localStorage.setItem('happyPlanet_readBottles', JSON.stringify(readBottles)); }, [readBottles]);

    // 🌟 动态组装漂流瓶：加入玩家自己写的日记！
    const allBottles = useMemo(() => {
        const playerBottles = passports.flatMap(p =>
            (p.stories || []).filter(s => s.isBottled).map(s => ({
                id: s.id,
                author: p.starName || p.name,
                date: s.date,
                title: s.title,
                content: s.content
            }))
        );
        return [...LORE_BOTTLES, ...playerBottles]; // 如果想加入占位符，可以在这里 append MOCK_BOTTLES
    }, [passports]);

    const visibleBottles = useMemo(() => allBottles.filter(b => !readBottles.includes(b.id)), [readBottles, allBottles]);

    // 🌟 原著火星邻居 (带图片扩展接口 imgUrl: '你的图片链接')
    const LORE_NEIGHBORS: PassportData[] = useMemo(() => [
        {
            id: 'MOCK-UFONI', name: 'UFONi.A', savedAt: Date.now(), lastModified: Date.now(),
            bio: currentLang === 'cn' ? '他从星空而来，想看宇宙的全貌，最后却在一杯茶里，看见了自己。' : 'Han kom för att se världen uppifrån, men fann sig själv i en kopp te.',
            isAssignedToFarm: false, hunger: 40,
            selectedParts: { body: 'body_white', ears: 'ears_none', face: 'face_innocent', hair: 'hair_none', hair_b: 'hair_b_none', access: 'access_robot' },
            selectedPlanetParts: { base: 'planet_base_purple', surface: 'planet_surf_rings', atmosphere: 'planet_atmo_glow', companion: 'planet_comp_ufo' },
            relationships: [], stats: { mod: 2, bus: 5, klurighet: 8 }
        },
        {
            id: 'MOCK-KITTY', name: 'Kitty.A', savedAt: Date.now(), lastModified: Date.now(),
            bio: currentLang === 'cn' ? '她把光种进泥土，长出了会笑的花。' : 'Hon planterade ljus i jorden, och fick blommor som skrattade.',
            isAssignedToFarm: false, hunger: 50,
            selectedParts: { body: 'body_mimosa', ears: 'ears_mimosa', face: 'eyes_glasses', hair: 'hair_fashion', hair_b: 'hair_b_none', access: 'access_beret' },
            selectedPlanetParts: { base: 'planet_base_green', surface: 'planet_surf_crystal', atmosphere: 'planet_atmo_aurora', companion: 'planet_comp_moon' },
            relationships: [], stats: { mod: 7, bus: 4, klurighet: 6 }
        }
    ], [currentLang]);

    const neighbors = useMemo(() => {
        const archivePets = passports.filter(p => !p.isAssignedToFarm);
        return archivePets.length > 0 ? archivePets : LORE_NEIGHBORS;
    }, [passports, LORE_NEIGHBORS]);

    const getCoordinates = (index: number, total: number) => {
        const radius = 25 + index * 5;
        const angle = index * (Math.PI * 2 * 0.618);
        return { x: 50 + radius * Math.cos(angle), y: 50 + radius * Math.sin(angle) };
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        setIsDragging(true);
        dragStart.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
    };
    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return;
        setTransform(prev => ({ ...prev, x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y }));
    };
    const handlePointerUp = () => setIsDragging(false);
    const zoomIn = () => setTransform(prev => ({ ...prev, scale: Math.min(prev.scale * 1.2, 2) }));
    const zoomOut = () => setTransform(prev => ({ ...prev, scale: Math.max(prev.scale * 0.8, 0.4) }));

    const handleFeedNeighbor = () => {
        if (!selectedNeighbor) return;
        if (carrotCoins < 5) {
            playSound('error');
            setGlobalAlert(currentLang === 'cn' ? '胡萝卜币不够啦！\n快回农场赚点吧！' : 'Not enough carrots!');
            return;
        }

        playSound('success');
        showBubble('feed', selectedNeighbor.id); // 🌟 气泡：感谢投喂

        // 🌟 飞行动效：胡萝卜从钱包飞向被选中的邻居
        animateToken('social-wallet-carrot', `neighbor-${selectedNeighbor.id}`, '🥕', false);

        onUpdateCoins(-5);

        // 星砂奖励也会飞向星砂钱包
        setTimeout(() => {
            playSound('achievement');
            animateToken(`neighbor-${selectedNeighbor.id}`, 'social-wallet-starsand', '✨', true);
            onUpdateStarSand(10);
        }, 500);

        if (!selectedNeighbor.id.startsWith('MOCK')) {
            const curHunger = selectedNeighbor.hunger ?? 80;
            onUpdatePassport(selectedNeighbor.id, 'hunger', Math.min(100, curHunger + 30));
            setStampPrompt(selectedNeighbor);
        }
        setSelectedNeighbor(null);
    };

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
                id: `${targetGalaxy}-${targetStar}`,
                date: getStarDate(),
                title: { cn: '星际馈赠', en: 'Stellar Gift', se: 'Stjärngåva' },
                content: {
                    cn: `今天，来自远方的 ${visitorName} 穿过了星云来看我！\n\n感谢三众神的恩赐，让我在浩瀚的宇宙中不再孤单。收到关怀包裹时，连火星的沙子都在为我们跳舞呢！`,
                    en: `Today, ${visitorName} crossed the nebula to visit me!\n\nThanks to the Three Gods, I'm no longer alone in this universe. The Martian sand danced when the care package arrived!`,
                    se: `Idag korsade ${visitorName} nebulosan för att besöka mig!\n\nTack vare De Tre Gudarna är jag inte längre ensam. Mars-sanden dansade för oss när paketet kom!`
                },
                galaxyIndex: targetGalaxy,
                starIndex: targetStar,
                hasReceivedReward: true
            };

            const updatedStories = [...existingStories, newStory];
            localStorage.setItem(storageKey, JSON.stringify(updatedStories));
            onUpdatePassport(stampPrompt.id, 'stories', updatedStories);
        } else {
            setGlobalAlert(currentLang === 'cn' ? '手帐已经贴满啦！' : 'Storybook is full!');
        }
        setStampPrompt(null);
    };

    const handleLikeBottle = () => {
        if (!selectedBottle) return;
        playSound('stamp');

        // 🌟 飞行动效：点赞漂流瓶，星砂飞入钱包
        animateToken(`bottle-${selectedBottle.id}`, 'social-wallet-starsand', '✨', true);
        onUpdateStarSand(1);

        setReadBottles(prev => [...prev, selectedBottle.id]);
        setSelectedBottle(null);
    };

    const handleRescan = () => {
        playSound('camera');
        setIsScanning(true);
        setTimeout(() => {
            setReadBottles([]);
            setIsScanning(false);
        }, 2000);
    };

    return (
        <div
            className={`fixed inset-0 z-40 bg-[#0a0a12] overflow-hidden font-rounded select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
        >
            <div className="absolute inset-0 z-0 opacity-70 pointer-events-none">
                <SpaceBackground bpm={30} themeColor="#60EFFF" meteorDensity={3} />
            </div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-80 z-10">
                <div className="absolute w-[30vw] h-[30vw] rounded-full border-2 border-[#60EFFF] opacity-40 shadow-[0_0_30px_rgba(96,239,255,0.3)]" />
                <div className="absolute w-[60vw] h-[60vw] rounded-full border border-[#60EFFF] opacity-20 border-dashed" />
                <div className="absolute w-[90vw] h-[90vw] rounded-full border border-[#60EFFF] opacity-10" />
                <div className="absolute w-[120vw] h-[120vw] rounded-full radar-sweep pointer-events-none" />
                <div className="absolute w-full h-[1px] bg-[#60EFFF] opacity-20" />
                <div className="absolute h-full w-[1px] bg-[#60EFFF] opacity-20" />
                <div className="absolute w-4 h-4 bg-[#60EFFF] rounded-full shadow-[0_0_20px_#60EFFF] animate-pulse" />
            </div>

            {/* 🌟 顶部货币栏：支持胡萝卜和星砂，方便作为动画的锚点 */}
            <div className="absolute top-6 left-6 z-50 pointer-events-auto flex gap-3">
                <div id="social-wallet-starsand" className="bg-white/10 backdrop-blur-md px-4 py-2 border-[3px] border-[#60EFFF] rounded-2xl flex items-center gap-2 shadow-[4px_4px_0_black]">
                    <SocialIcons.StarSand className="w-5 h-5" />
                    <span className="font-black text-xl text-white tracking-widest">{starSand}</span>
                </div>
                <div id="social-wallet-carrot" className="bg-white/10 backdrop-blur-md px-4 py-2 border-[3px] border-[#FFD700] rounded-2xl flex items-center gap-2 shadow-[4px_4px_0_black]">
                    <CarrotCoinIcon className="w-5 h-5" />
                    <span className="font-black text-xl text-white tracking-widest">{carrotCoins}</span>
                </div>
            </div>

            <div className="absolute bottom-28 right-6 z-50 flex flex-col gap-2 pointer-events-auto">
                <button onClick={zoomIn} className="w-10 h-10 bg-white/10 backdrop-blur-md border-2 border-[#60EFFF] text-[#60EFFF] rounded-xl flex items-center justify-center text-xl font-black hover:bg-[#60EFFF] hover:text-black transition-colors">+</button>
                <button onClick={zoomOut} className="w-10 h-10 bg-white/10 backdrop-blur-md border-2 border-[#60EFFF] text-[#60EFFF] rounded-xl flex items-center justify-center text-xl font-black hover:bg-[#60EFFF] hover:text-black transition-colors">-</button>
            </div>

            <div className="absolute inset-0 z-30 transition-transform duration-75 ease-out"
                style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}>

                {/* 1. 邻居星球 */}
                {neighbors.map((neighbor, idx) => {
                    const pos = getCoordinates(idx, neighbors.length);
                    return (
                        <div
                            key={neighbor.id}
                            id={`neighbor-${neighbor.id}`} // 👈 动画和气泡的锚点
                            onClick={(e) => {
                                e.stopPropagation();
                                playSound('click');
                                setSelectedNeighbor(neighbor);
                                showBubble('greet', neighbor.id); // 🌟 触发打招呼气泡！
                            }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group hover:scale-110 transition-transform duration-300 pointer-events-auto"
                            style={{ left: `${pos.x}%`, top: `${pos.y}%`, animation: `planet-float ${4 + idx}s ease-in-out infinite` }}
                        >
                            {/* 🌟 气泡渲染：只在当前被点击的邻居头上出现 */}
                            {speechBubble?.id === neighbor.id && (
                                <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-[100] animate-bubble-pop pointer-events-none w-max max-w-[160px]">
                                    <div className="bg-white border-[3px] border-black px-3 py-1.5 rounded-2xl shadow-[4px_4px_0_black] relative">
                                        <span className="font-black text-xs leading-tight block text-center text-black">
                                            {speechBubble.text}
                                        </span>
                                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-[3px] border-r-[3px] border-black transform rotate-45" />
                                    </div>
                                </div>
                            )}

                            <div className="w-16 h-16 bg-[#2c3e50] border-[3px] border-[#60EFFF] rounded-full overflow-hidden flex items-center justify-center relative shadow-[0_0_20px_rgba(96,239,255,0.4)] group-hover:shadow-[0_0_30px_rgba(96,239,255,0.9)]">
                                {/* 🌟 保护坐标：如果你未来有了插画，可以通过 neighbor.imgUrl 替换 Avatar */}
                                <div className="scale-[0.5] origin-center translate-y-0">
                                    <Avatar selectedParts={neighbor.selectedParts} dominantStat={getDominantStat(calculateStats(neighbor.selectedParts, neighbor.stats))} transparent />
                                </div>
                                {(neighbor.hunger ?? 80) < 50 && (<div className="absolute top-0 right-2 bg-white rounded-full p-1 border-2 border-black animate-bounce"><SocialIcons.CarePackage className="w-4 h-4" /></div>)}
                            </div>
                            <span className="mt-2 bg-black/80 text-[#60EFFF] text-[8px] font-mono font-bold px-2 py-0.5 rounded border border-[#60EFFF]/30 tracking-widest uppercase">{neighbor.name}</span>
                        </div>
                    );
                })}

                {/* 2. 漂流瓶：包含神明传说和玩家自己的日记！ */}
                {visibleBottles.map((bottle, idx) => {
                    return (
                        <div
                            key={bottle.id}
                            id={`bottle-${bottle.id}`} // 👈 飞币动画的起点
                            onClick={(e) => { e.stopPropagation(); playSound('click'); setSelectedBottle(bottle); }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group pointer-events-auto"
                            style={{ left: '50%', top: '50%', animation: `zero-g-drift-${idx % 3} ${20 + idx * 5}s linear infinite alternate` }}
                        >
                            <div className="relative transform group-hover:scale-125 transition-transform" style={{ animation: `zero-g-spin ${10 + idx * 2}s linear infinite` }}>
                                <SocialIcons.Bottle className="w-10 h-10 drop-shadow-[0_0_15px_rgba(96,239,255,0.8)]" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full border-2 border-black animate-ping" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 3. 🌟 疯狂搜索的瞄准镜！ */}
            {visibleBottles.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                    {isScanning ? (
                        <div className="text-[#60EFFF] animate-frantic">
                            <SocialIcons.Crosshair className="w-20 h-20 drop-shadow-[0_0_25px_#60EFFF]" />
                        </div>
                    ) : (
                        <button onClick={handleRescan} className="pointer-events-auto bg-black/60 backdrop-blur-sm border-[4px] border-[#60EFFF] text-[#60EFFF] px-8 py-4 rounded-full font-black uppercase tracking-widest shadow-[0_0_30px_rgba(96,239,255,0.8)] hover:bg-[#60EFFF] hover:text-black hover:scale-110 transition-all flex items-center gap-3">
                            <SocialIcons.Crosshair className="w-6 h-6 animate-pulse" />
                            {currentLang === 'cn' ? '重置星域扫描' : 'RESCAN SECTOR'}
                        </button>
                    )}
                </div>
            )}

            {/* --- 🌟 完美居中的 Portal 传送门 --- */}
            {typeof document !== 'undefined' && createPortal(
                <>
                    {selectedNeighbor && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in pointer-events-auto">
                            <div className="bg-[#fdfdf9] border-[5px] border-black rounded-[3rem] p-8 w-full max-w-sm shadow-[15px_15px_0_black] flex flex-col items-center animate-scale-in relative">
                                <button onClick={() => setSelectedNeighbor(null)} className="absolute top-4 right-6 text-4xl font-black text-gray-400 hover:text-black transition-colors">&times;</button>
                                <div className="w-24 h-24 bg-gray-100 border-[4px] border-black rounded-full overflow-hidden flex items-center justify-center shadow-inner mb-4">
                                    <div className="scale-[0.7] origin-center translate y-8"><Avatar selectedParts={selectedNeighbor.selectedParts} dominantStat={getDominantStat(calculateStats(selectedNeighbor.selectedParts, selectedNeighbor.stats))} transparent /></div>
                                </div>
                                <h3 className="font-black text-2xl uppercase tracking-widest">{selectedNeighbor.name}</h3>
                                <p className="font-bold text-gray-500 text-xs mb-6 uppercase text-center px-2">
                                    {selectedNeighbor.bio || (currentLang === 'cn' ? '来自另一个档案室的居民' : 'Resident from another Archive')}
                                </p>

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

                    {stampPrompt && (
                        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in pointer-events-auto">
                            <div className="bg-[#FFFBEB] border-[5px] border-black rounded-[2rem] p-6 w-full max-w-xs shadow-[10px_10px_0_black] flex flex-col items-center animate-bounce-in relative">
                                <div className="w-16 h-16 bg-[#FFD700] rounded-full border-[3px] border-black flex items-center justify-center -mt-12 mb-4 shadow-[4px_4px_0_black]">
                                    <SocialIcons.Envelope className="w-8 h-8" />
                                </div>
                                <h3 className="font-black text-xl mb-2">{currentLang === 'cn' ? '包裹送达啦！' : 'Package Delivered!'}</h3>
                                <p className="text-gray-600 text-center text-sm font-bold mb-6">
                                    {currentLang === 'cn' ? `你想把这次拜访，自动记录到 ${stampPrompt.name} 的星际手帐里吗？` : `Write a visitor diary in ${stampPrompt.name}'s notebook?`}
                                </p>
                                <div className="flex gap-3 w-full">
                                    <button onClick={() => setStampPrompt(null)} className="flex-1 border-2 border-black py-3 rounded-xl font-black text-xs hover:bg-gray-100">{currentLang === 'cn' ? '不用了' : 'NO THANKS'}</button>
                                    <button onClick={handleWriteStamp} className="flex-1 bg-black text-white border-2 border-black py-3 rounded-xl font-black text-xs hover:bg-gray-800 shadow-[3px_3px_0_rgba(0,0,0,0.3)]">{currentLang === 'cn' ? '盖上访客章' : 'STAMP DIARY'}</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedBottle && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in pointer-events-auto">
                            <div className="bg-white border-[5px] border-black rounded-[3rem] p-8 w-full max-w-sm shadow-[15px_15px_0_black] flex flex-col items-center animate-scale-in relative" style={{ backgroundImage: 'radial-gradient(#e0e0dc 1.2px, transparent 1.2px)', backgroundSize: '18px 18px' }}>
                                <button onClick={() => setSelectedBottle(null)} className="absolute top-4 right-6 text-4xl font-black text-gray-400 hover:text-black transition-colors">&times;</button>
                                <div className="bg-blue-100 text-blue-800 font-mono text-[10px] font-bold px-4 py-1 rounded-full border-2 border-black mb-6 uppercase tracking-[0.2em] shadow-sm">{selectedBottle.date}</div>
                                <h3 className="font-black font-hand text-3xl uppercase tracking-tighter text-center mb-4">{selectedBottle.title[currentLang]}</h3>
                                <p className="font-hand text-xl text-gray-700 text-center leading-relaxed mb-8 px-2 whitespace-pre-line">"{selectedBottle.content[currentLang]}"</p>
                                <div className="font-mono text-xs text-gray-400 uppercase tracking-widest mb-6">FROM: {selectedBottle.author}</div>
                                <button onClick={handleLikeBottle} className="w-full bg-[#FFD700] border-[4px] border-black py-4 rounded-2xl font-black text-lg shadow-[4px_4px_0_black] active:translate-y-1 active:shadow-none transition-all flex flex-col items-center gap-1 hover:bg-[#FACC15]">
                                    <span className="uppercase tracking-widest">{currentLang === 'cn' ? '贴上鼓励星标' : 'STAMP WITH LOVE'}</span>
                                    <div className="flex items-center gap-2 text-[10px] text-blue-800"><SocialIcons.StarSand className="w-3 h-3" /> +1</div>
                                </button>
                            </div>
                        </div>
                    )}

                    {globalAlert && (
                        <div className="fixed inset-0 z-[11000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm pointer-events-auto">
                            <div className="bg-white border-[6px] border-black p-8 rounded-[40px] shadow-[15px_15px_0_black] w-full max-w-[320px] flex flex-col items-center animate-bounce-in">
                                <div className="w-20 h-20 bg-[#FFB7B2] border-[4px] border-black rounded-full flex items-center justify-center mb-6 shadow-[inset_-3px_-3px_0_rgba(0,0,0,0.1)]">
                                    <span className="font-black text-4xl text-black">!</span>
                                </div>
                                <h3 className="font-black text-2xl mb-2 text-center uppercase tracking-tighter">
                                    {currentLang === 'cn' ? '等一下！' : 'OOPS!'}
                                </h3>
                                <p className="text-black/60 font-bold mb-8 text-center text-sm whitespace-pre-line leading-relaxed">
                                    {globalAlert}
                                </p>
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
                @keyframes radar-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .radar-sweep { background: conic-gradient(from 0deg, transparent 70%, rgba(96, 239, 255, 0.1) 80%, rgba(96, 239, 255, 0.5) 100%); animation: radar-spin 6s linear infinite; }
                @keyframes planet-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
                
                /* 失重漂浮系统 */
                @keyframes zero-g-drift-0 { 0% { transform: translate(-40vw, -40vh); } 100% { transform: translate(40vw, 30vh); } }
                @keyframes zero-g-drift-1 { 0% { transform: translate(35vw, -25vh); } 100% { transform: translate(-30vw, 40vh); } }
                @keyframes zero-g-drift-2 { 0% { transform: translate(-20vw, 35vh); } 100% { transform: translate(30vw, -40vh); } }
                @keyframes zero-g-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                
                /* 🌟 疯狂搜索动效！ */
                @keyframes frantic-search {
                    0% { transform: translate(0, 0) scale(1.5); }
                    20% { transform: translate(-30px, -20px) scale(1.8) rotate(-15deg); }
                    40% { transform: translate(40px, 10px) scale(1.2) rotate(20deg); }
                    60% { transform: translate(-20px, 30px) scale(1.7) rotate(-5deg); }
                    80% { transform: translate(30px, -30px) scale(1.4) rotate(10deg); }
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