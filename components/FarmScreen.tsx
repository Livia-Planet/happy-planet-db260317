import React, { useState, useEffect, useMemo } from 'react';
import { Avatar } from './Avatar';
import { SpaceBackground } from './SpaceBackground';
import { CarrotCoinIcon } from './Icons';
import { Language, PassportData, ViewMode, StoryEntry } from '../types';
import { getDominantStat, calculateStats, getStarDate } from '../utils/gameLogic';
import { PARTS_DB, PLANET_PARTS_DB } from '../data/parts';

// 🎨 四件新家具的数据库
const FURNITURE_DB = [
    { id: 'shower', name: { cn: '淋浴头', en: 'Shower', se: 'Dusch' }, price: 5, int: 5, svg: <svg viewBox="0 0 24 24" fill="none" stroke="#4DABF7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 4v4m-4 4l1.5-1.5m5 0L16 12m-4 4v2m-3-1l-1 1m7-1l1 1" /><path d="M8 8h8v2a4 4 0 01-8 0V8z" fill="#4DABF7" opacity="0.3" /></svg>, imgUrl: '' },
    { id: 'dryer', name: { cn: '吹风机', en: 'Hairdryer', se: 'Hårfön' }, price: 5, int: 5, svg: <svg viewBox="0 0 24 24" fill="none" stroke="#FF8787" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M7 10h10a3 3 0 000-6H7a3 3 0 000 6z" fill="#FF8787" opacity="0.3" /><path d="M12 10v6a2 2 0 01-4 0v-1" /><line x1="19" y1="5" x2="22" y2="5" /><line x1="19" y1="7" x2="21" y2="7" /><line x1="19" y1="9" x2="22" y2="9" /></svg>, imgUrl: '' },
    { id: 'comb', name: { cn: '梳子', en: 'Comb', se: 'Kam' }, price: 5, int: 5, svg: <svg viewBox="0 0 24 24" fill="none" stroke="#FFD43B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect x="4" y="6" width="16" height="6" rx="2" fill="#FFD43B" opacity="0.3" /><path d="M5 12v6m3-6v6m3-6v6m3-6v6m3-6v6" /></svg>, imgUrl: '' },
    { id: 'towel', name: { cn: '浴巾', en: 'Towel', se: 'Handduk' }, price: 5, int: 5, svg: <svg viewBox="0 0 24 24" fill="none" stroke="#69DB7C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M4 6h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" fill="#69DB7C" opacity="0.3" /><line x1="4" y1="10" x2="20" y2="10" /><line x1="4" y1="14" x2="20" y2="14" /></svg>, imgUrl: '' }
];

const FarmIcons = {
    Hunger: () => (
        <svg viewBox="0 0 24 24" fill="#D2691E" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10c0-1.33-.26-2.61-.73-3.77-.47-1.16-2.18-1.07-2.6.09-.44 1.23-1.8 1.94-3.08 1.57-1.28-.36-1.99-1.81-1.55-3.09.43-1.27-.47-2.73-1.8-2.73H12V2z" /><circle cx="8" cy="8" r="1.2" fill="black" /><circle cx="15" cy="10" r="1.2" fill="black" /><circle cx="12" cy="15" r="1.2" fill="black" /><circle cx="7" cy="16" r="1.2" fill="black" /></svg>
    ),
    Intimacy: () => (
        <svg viewBox="0 0 24 24" fill="#FF90E8" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
    ),
    Focus: () => (
        <svg viewBox="0 0 24 24" fill="#85C1E9" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><circle cx="12" cy="13" r="8" fill="white" /><path d="M12 9v4l2 2" /><path d="M5 3L2 6" /><path d="M19 3l3 3" /></svg>
    ),
    Shop: () => (
        <svg viewBox="0 0 24 24" fill="#F8C471" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="white" /><path d="M3 9h18" /><path d="M9 22V12h6v10" fill="#F8C471" /></svg>
    ),
    Archives: () => (
        <svg viewBox="0 0 24 24" fill="#E5E7EB" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /><line x1="9" y1="14" x2="15" y2="14" /></svg>
    ),
    Explore: () => (
        <svg viewBox="0 0 24 24" fill="#82E0AA" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></svg>
    ),
    MilkFood: () => (
        <svg viewBox="0 0 24 24" fill="#FF90E8" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M6 8h12v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8z" fill="white" /><path d="M8 8V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4" /></svg>
    ),
    Star: () => (
        <svg viewBox="0 0 24 24" fill="#FFD700" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
    )
};

interface FarmScreenProps {
    currentLang: Language;
    carrotCoins: number;
    onUpdateCoins: (amount: number) => void;
    savedPassports: PassportData[];
    onNavigate: (view: ViewMode) => void;
    playSound?: (type: string) => void;
    maxFarmSlots: number;
    onUnlockSlot: () => void;
    onToggleFarm: (id: string) => void;
    onUpdatePassport: (id: string, field: keyof PassportData, value: any) => void;
    setGlobalAlert: (msg: string) => void;
    onStartGlobalFocus: (id: string) => void;
    unlockedShopItems: string[];
    unlockedParts: string[];
    onUnlockShopItem: (id: string) => void;
    onUnlockPart: (id: string) => void;
    recordedEvents: string[];           // 👈 接收已记录的事件
    onRecordEvent: (id: string) => void; // 👈 触发记录的方法
    starSand: number;
    onUpdateStarSand?: (amount: number) => void;
    unlockedEffects?: string[];
    onUnlockEffect?: (id: string) => void;
}

const EXPEDITION_OPTIONS = [
    { minutes: 30, reward: 25, hungerCost: 10, label: { cn: '近地巡航', en: 'Low Orbit', se: 'Låg Omloppsbana' } },
    { minutes: 90, reward: 50, hungerCost: 30, label: { cn: '星系边缘', en: 'Outer Rim', se: 'Yttre Randen' } },
    { minutes: 240, reward: 100, hungerCost: 60, label: { cn: '深空潜航', en: 'Deep Space', se: 'Djuprymd' } },
    { minutes: 480, reward: 150, hungerCost: 90, label: { cn: '未知虫洞', en: 'Wormhole', se: 'Maskhål' } }
];

// 🌌 探险奇遇事件库
const EXPEDITION_EVENTS = [
    {
        id: 'ev_01',
        img: "https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Character%20Generator-Duddu400x400-face.png",
        title: { cn: '发光的晶石洞', en: 'Glowing Cave', se: 'Glödande Grotta' },
        desc: { cn: '在火星地下迷路了，但发现了一群会发光的蓝色蘑菇，还顺便睡了个午觉！', en: 'Found glowing mushrooms!', se: 'Hittade glödande svampar och tog en tupplur!' }
    },
    {
        id: 'ev_02',
        img: "https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Character%20Generator-Issi400x400-face.png",
        title: { cn: '偶遇外星邻居', en: 'Alien Neighbor', se: 'Utomjordisk Granne' },
        desc: { cn: '在小行星带遇到了一只戴墨镜的奇怪生物，他们一起分享了草莓牛奶。', en: 'Shared milk with an alien.', se: 'Delade jordgubbsmjölk med en utomjording.' }
    },
    {
        id: 'ev_03',
        img: "https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Character%20Generator-Plott400x400-face.png",
        title: { cn: '流星雨速递', en: 'Meteor Shower', se: 'Meteorregn' },
        desc: { cn: '搭乘着彗星的尾巴冲浪，惊险刺激，差点把帽子吹飞了！', en: 'Surfed on a comet tail!', se: 'Surfade på en kometsvans, tappade nästan hatten!' }
    }
];

export const FarmScreen: React.FC<FarmScreenProps> = ({
    currentLang,
    carrotCoins,
    onUpdateCoins,
    savedPassports,
    onNavigate,
    playSound,
    maxFarmSlots,
    onUnlockSlot,
    onToggleFarm,
    onUpdatePassport,
    setGlobalAlert,
    onStartGlobalFocus,
    unlockedShopItems,
    unlockedParts,
    onUnlockShopItem,
    onUnlockPart,
    recordedEvents,
    onRecordEvent,
    // 👇👇👇 把它们从参数里解构出来 👇👇👇
    starSand,
    onUpdateStarSand,
    unlockedEffects,
    onUnlockEffect
}) => {
    const [activeTab, setActiveTab] = useState<'focus' | 'shop' | 'archives' | 'explore'>('focus');
    const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
    const [claimedPostcard, setClaimedPostcard] = useState<any>(null);
    // 👇 修复：把商店的分页状态提升到最顶层！
    const [shopPage, setShopPage] = useState(0);

    const activePets = useMemo(() => savedPassports.filter(p => p.isAssignedToFarm), [savedPassports]);
    const SLOT_UPGRADE_COSTS = [0, 50, 150, 500, 1000];

    useEffect(() => {
        if (activePets.length > 0 && !selectedPetId) setSelectedPetId(activePets[0].id);
        else if (activePets.length === 0) setSelectedPetId(null);
    }, [activePets, selectedPetId]);

    const selectedPet = activePets.find(p => p.id === selectedPetId);

    const [, setTick] = useState(0);
    useEffect(() => {
        if (activeTab === 'explore') {
            const interval = setInterval(() => setTick(t => t + 1), 60000);
            return () => clearInterval(interval);
        }
    }, [activeTab]);

    const handleBuyItem = (price: number, addHunger: number, addIntimacy: number) => {
        if (!selectedPet) {
            playSound?.('error');
            setGlobalAlert(currentLang === 'cn' ? '请先在农场点击选中一只 Bobu 来喂食！' : 'Click a Bobu to feed!');
            return;
        }
        if (selectedPet.isOnExpedition) {
            playSound?.('error');
            setGlobalAlert(currentLang === 'cn' ? '它正在宇宙深处探险呢，\n等回来再说吧！' : 'It is exploring!\nFeed it when it returns!');
            return;
        }
        if (carrotCoins < price) {
            playSound?.('error');
            setGlobalAlert(currentLang === 'cn' ? '胡萝卜币不够啦，\n去专注工作赚一点吧！' : 'Not enough coins!\nFocus to earn more!');
            return;
        }
        playSound?.('coins');
        onUpdateCoins(-price);

        const currentHunger = selectedPet.hunger ?? 80;
        const currentIntimacy = selectedPet.intimacy ?? 0;
        onUpdatePassport(selectedPet.id, 'hunger', Math.min(100, currentHunger + addHunger));
        onUpdatePassport(selectedPet.id, 'intimacy', Math.min(100, currentIntimacy + addIntimacy));
        onUpdatePassport(selectedPet.id, 'lastSyncTime', Date.now());
    };

    const startExpedition = (opt: typeof EXPEDITION_OPTIONS[0]) => {
        if (!selectedPet) return;
        if ((selectedPet.hunger ?? 80) < opt.hungerCost) {
            playSound?.('error');
            setGlobalAlert(currentLang === 'cn' ? `肚子太饿了，没力气飞那么远！\n需要 ${opt.hungerCost} 饥饿度。` : `Too hungry!\nNeeds ${opt.hungerCost} hunger.`);
            return;
        }
        playSound?.('camera');
        onUpdatePassport(selectedPet.id, 'hunger', (selectedPet.hunger ?? 80) - opt.hungerCost);
        onUpdatePassport(selectedPet.id, 'isOnExpedition', true);
        onUpdatePassport(selectedPet.id, 'expeditionStartTime', Date.now());
        onUpdatePassport(selectedPet.id, 'expeditionDuration', opt.minutes * 60 * 1000);
        onUpdatePassport(selectedPet.id, 'expeditionReward', opt.reward);
    };

    // 🎯 核心重构：5/5/15/25/50 阶梯防重复抽奖逻辑
    const handleClaimExpedition = () => {
        if (!selectedPet) return;

        const reward = selectedPet.expeditionReward || 50;

        // 1. 整理各奖池 (防重复过滤)
        const lockedPlanetParts = Object.values(PLANET_PARTS_DB).filter(p => p.isUnlockable && !unlockedParts.includes(p.id));
        const lockedCharParts = Object.values(PARTS_DB).filter(p => p.isUnlockable && !unlockedParts.includes(p.id));
        const lockedFurniture = FURNITURE_DB.filter(f => !unlockedShopItems.includes(f.id));
        const availableEvents = EXPEDITION_EVENTS.filter(e => !recordedEvents.includes(e.id));

        // 2. 掷骰子 0-100
        const roll = Math.random() * 100;
        let resultData: any = { type: 'peaceful', reward, title: { cn: '平淡的旅途', en: 'Peaceful Journey', se: 'Lugn Resa' }, desc: { cn: '在宇宙中安静地飞行了一圈，虽然没遇到什么特别的事，但心情很放松。', en: 'Flew around quietly. Relaxing!', se: 'Flög runt tyst. Avkopplande!' } };

        // 3. 严格按梯队结算
        if (roll <= 5 && lockedPlanetParts.length > 0) {
            const won = lockedPlanetParts[Math.floor(Math.random() * lockedPlanetParts.length)];
            onUnlockPart(won.id);
            playSound?.('achievement');
            resultData = { type: 'planet_part', item: won, reward };
        }
        else if (roll <= 10 && lockedCharParts.length > 0) {
            const won = lockedCharParts[Math.floor(Math.random() * lockedCharParts.length)];
            onUnlockPart(won.id);
            playSound?.('achievement');
            resultData = { type: 'char_part', item: won, reward };
        }
        else if (roll <= 25 && lockedFurniture.length > 0) {
            const won = lockedFurniture[Math.floor(Math.random() * lockedFurniture.length)];
            onUnlockShopItem(won.id);
            playSound?.('success');
            resultData = { type: 'furniture', item: won, reward };
        }
        else if (roll <= 50 && availableEvents.length > 0) {
            const won = availableEvents[Math.floor(Math.random() * availableEvents.length)];
            playSound?.('camera');
            resultData = { type: 'event', event: won, reward };
        } else {
            playSound?.('success'); // 保底的平淡旅途
        }

        // 4. 触发弹窗并重置探险状态
        setClaimedPostcard(resultData);
        onUpdateCoins(reward);
        onUpdatePassport(selectedPet.id, 'isOnExpedition', false);
        onUpdatePassport(selectedPet.id, 'lastSyncTime', Date.now());
    };

    // 🎯 核心功能：将奇遇写入手帐
    const handleRecordEventToStory = () => {
        if (!selectedPet || !claimedPostcard || claimedPostcard.type !== 'event') return;

        // 1. 寻找下一颗空的星星 (StoryTab 有9页，按容量硬编码)
        const capacities = [5, 7, 6, 8, 5, 5, 8, 7, 10];
        let targetGalaxy = 0;
        let targetStar = 0;
        let found = false;

        const existingStories = selectedPet.stories || [];

        for (let g = 0; g < capacities.length; g++) {
            for (let s = 0; s < capacities[g]; s++) {
                if (!existingStories.some(story => story.galaxyIndex === g && story.starIndex === s)) {
                    targetGalaxy = g;
                    targetStar = s;
                    found = true;
                    break;
                }
            }
            if (found) break;
        }

        if (!found) {
            alert(currentLang === 'cn' ? '星际手帐已经写满了！无法记录。' : 'Storybook is full!');
            return;
        }

        // 2. 组装新故事
        const newStory: StoryEntry = {
            id: `${targetGalaxy}-${targetStar}`,
            date: getStarDate(),
            title: claimedPostcard.event.title,
            content: claimedPostcard.event.desc,
            galaxyIndex: targetGalaxy,
            starIndex: targetStar,
            imageUrl: claimedPostcard.event.img,
            hasReceivedReward: true // 奇遇直接发了额外金币，就不算入普通写作奖了
        };

        // 3. 保存入库
        onUpdatePassport(selectedPet.id, 'stories', [...existingStories, newStory]);
        onRecordEvent(claimedPostcard.event.id); // 记录全局，不再出现
        onUpdateCoins(10); // 额外奖励 10 币
        playSound?.('coins');

        setGlobalAlert(currentLang === 'cn' ? '奇遇已贴入手帐！\n获得额外奖励 10 🥕' : 'Event recorded!\nBonus 10 🥕');
        setClaimedPostcard(null); // 关闭弹窗
    };

    const handleLocalToggleFarm = (p: PassportData) => {
        if (!p.isAssignedToFarm && activePets.length >= maxFarmSlots) {
            playSound?.('error');
            setGlobalAlert(currentLang === 'cn' ? '农场床位不足，\n请先解锁更多位置！' : 'Farm is full!\nUnlock more slots!');
            return;
        }
        onToggleFarm(p.id);
    };

    return (
        <div className="fixed inset-0 z-40 flex flex-col items-center bg-[#EAFFD0] overflow-hidden font-rounded text-black select-none">
            <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                <SpaceBackground bpm={50} themeColor="#95E1D3" />
            </div>

            {/* --- 顶部状态栏 --- */}
            <header className="relative z-20 left-20 w-full p-6 flex justify-between items-start pointer-events-none">
                <div className="flex flex-col gap-2">
                    {selectedPet ? (
                        <div className="bg-white/80 backdrop-blur-md border-[4px] border-black p-3 pt-2 rounded-[24px] shadow-[4px_4px_0_black] flex flex-col gap-2 pointer-events-auto transition-all animate-bounce-in min-w-[140px]">
                            <div className="flex items-center gap-1.5 w-max">
                                <FarmIcons.Star />
                                <span className="font-black text-sm uppercase tracking-wider translate-y-0.5">{selectedPet.starName}</span>
                            </div>
                            <div className="flex flex-col gap-2 mt-1">
                                <StatBar icon={<div className="w-4 h-4"><FarmIcons.Hunger /></div>} value={selectedPet.hunger ?? 80} color="bg-[#D2691E]" />
                                <StatBar icon={<div className="w-4 h-4"><FarmIcons.Intimacy /></div>} value={selectedPet.intimacy ?? 0} color="bg-[#FF90E8]" />
                            </div>
                        </div>
                    ) : (
                        <div className="font-black text-sm bg-white/80 px-4 py-2 rounded-xl border-[3px] border-black opacity-50 border-dashed">
                            {currentLang === 'cn' ? '点击选中农场里的生命' : 'Click a Bobu to select'}
                        </div>
                    )}
                </div>
            </header>

            {/* --- 核心交互区 --- */}
            <main className="relative z-10 flex-1 w-full flex flex-wrap items-center justify-center p-4 gap-8 md:gap-16 -translate-y-3">
                {activePets.length > 0 ? (
                    activePets.map((pet, idx) => {
                        const isSelected = pet.id === selectedPetId;
                        return (
                            <div
                                key={pet.id}
                                onClick={() => { playSound?.('click'); setSelectedPetId(pet.id); }}
                                className="relative flex flex-col items-center cursor-pointer group"
                            >
                                {isSelected && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/40 border-4 border-dashed border-yellow-400 rounded-full animate-spin-slow pointer-events-none" />
                                )}

                                <div className={`relative z-10 transform transition-all duration-300 ${isSelected ? 'scale-[1.3]' : 'scale-100 hover:scale-110'} animate-float ${pet.isOnExpedition ? 'opacity-30 grayscale blur-[1px]' : ''}`} style={{ animationDelay: `${idx * 0.2}s` }}>
                                    <Avatar selectedParts={pet.selectedParts} dominantStat={getDominantStat(calculateStats(pet.selectedParts, pet.stats))} className="w-40 h-40" />
                                    {pet.isOnExpedition && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="bg-black text-white text-[10px] font-black px-2 py-1 rounded-md">EXPLORING</div>
                                        </div>
                                    )}
                                </div>

                                <div className="absolute -bottom-8 z-20 flex flex-col gap-1.5 bg-white/90 p-2 rounded-xl border-[3px] border-black shadow-[2px_2px_0_black] opacity-80 group-hover:opacity-100 transition-opacity">
                                    <div className="w-16 h-2 bg-gray-200 rounded-full border-2 border-black overflow-hidden">
                                        <div className="bg-[#D2691E] h-full transition-all duration-500" style={{ width: `${pet.hunger ?? 80}%` }} />
                                    </div>
                                    <div className="w-16 h-2 bg-gray-200 rounded-full border-2 border-black overflow-hidden">
                                        <div className="bg-[#FF90E8] h-full transition-all duration-500" style={{ width: `${pet.intimacy ?? 0}%` }} />
                                    </div>
                                </div>
                                <div className="absolute -bottom-2 w-28 h-5 bg-black/10 blur-xl rounded-full" />
                            </div>
                        );
                    })
                ) : (
                    <div onClick={() => { playSound?.('click'); setActiveTab('archives'); }} className="w-56 h-56 border-[6px] border-dashed border-black/20 rounded-[50px] flex flex-col items-center justify-center cursor-pointer hover:bg-black/5 hover:border-black/40 transition-all group">
                        <div className="w-20 h-20 opacity-30 group-hover:scale-110 transition-transform mb-2"><FarmIcons.Archives /></div>
                        <p className="font-black text-black/40 text-center leading-tight whitespace-pre-line">{currentLang === 'cn' ? '点击去档案室\n领养你的生命' : 'Click to Adopt\nfrom Archives'}</p>
                    </div>
                )}
            </main>

            {/* --- 底部操作面板 --- */}
            <footer className="relative z-30 w-full max-w-2xl bg-white border-t-[6px] border-black p-6 rounded-t-[50px] shadow-[0_-12px_0_rgba(0,0,0,0.05)]">
                <div className="flex justify-around mb-8 mt-[-65px]">
                    <TabButton active={activeTab === 'focus'} onClick={() => { playSound?.('click'); setActiveTab('focus'); }} icon={<FarmIcons.Focus />} color="bg-[#85C1E9]" />
                    <TabButton active={activeTab === 'shop'} onClick={() => { playSound?.('click'); setActiveTab('shop'); }} icon={<FarmIcons.Shop />} color="bg-[#F8C471]" />
                    <TabButton active={activeTab === 'archives'} onClick={() => { playSound?.('click'); setActiveTab('archives'); }} icon={<FarmIcons.Archives />} color="bg-[#BB8FCE]" />
                    <TabButton active={activeTab === 'explore'} onClick={() => { playSound?.('click'); setActiveTab('explore'); }} icon={<FarmIcons.Explore />} color="bg-[#82E0AA]" />
                </div>

                <div className="h-52 overflow-y-auto px-2 custom-scrollbar">
                    {activeTab === 'focus' && (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                            <p className="font-black text-gray-500 text-center text-sm">{currentLang === 'cn' ? '开启全能专注模式！\n你可以一边计时，一边去实验室制造新伙伴。' : 'Global Focus Mode!\nYou can build new rabbits while focusing.'}</p>
                            <button onClick={() => {
                                if (!selectedPet) return setGlobalAlert(currentLang === 'cn' ? '请先选中一只兔子来陪伴你！' : 'Select a rabbit to focus with!');
                                if (selectedPet.isOnExpedition) return setGlobalAlert(currentLang === 'cn' ? '它去探险了，换一只吧！' : 'It is exploring, choose another!');
                                playSound?.('click'); onStartGlobalFocus(selectedPet.id);
                            }} className="w-full max-w-sm py-4 border-[5px] border-black rounded-2xl font-black text-xl bg-[#82E0AA] text-black shadow-[6px_6px_0_black] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center gap-2">
                                <FarmIcons.Focus /> {currentLang === 'cn' ? '启动专注光球' : 'START GLOBAL FOCUS'}
                            </button>
                        </div>
                    )}

                    {activeTab === 'archives' && (
                        <div className="flex flex-col gap-4 pb-4">
                            <div className="flex justify-between items-center bg-gray-100 p-4 rounded-2xl border-[3px] border-black border-dashed">
                                <div className="flex flex-col">
                                    <span className="font-black text-sm uppercase">{currentLang === 'cn' ? '农场床位状态' : 'FARM SLOTS'}</span>
                                    <span className="text-xs font-bold text-gray-500">{activePets.length} / {maxFarmSlots} {currentLang === 'cn' ? '占用中' : 'Occupied'}</span>
                                </div>
                                {maxFarmSlots < SLOT_UPGRADE_COSTS.length - 1 && (
                                    <button onClick={() => { playSound?.('click'); onUnlockSlot(); }} className="flex items-center gap-2 bg-[#F8C471] px-4 py-2 rounded-xl border-[3px] border-black shadow-[3px_3px_0_black] active:shadow-none active:translate-y-1 transition-all">
                                        <span className="font-black text-xs uppercase">{currentLang === 'cn' ? '解锁床位' : 'UNLOCK'}</span>
                                        <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded-md border-2 border-black"><CarrotCoinIcon className="w-3 h-3" /><span className="font-black text-[10px]">{SLOT_UPGRADE_COSTS[maxFarmSlots]}</span></div>
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {savedPassports && savedPassports.length > 0 ? savedPassports.map((p) => (
                                    <div key={p.id} onClick={() => handleLocalToggleFarm(p)} className={`p-3 rounded-2xl flex items-center gap-3 cursor-pointer border-[4px] border-black shadow-[4px_4px_0_black] active:shadow-none active:translate-y-1 transition-all ${p.isAssignedToFarm ? 'bg-[#A8E6CF]' : 'bg-[#F9FAFB] hover:bg-yellow-50'}`}>
                                        <div className="w-14 h-14 bg-white border-[3px] border-black rounded-full overflow-hidden flex-shrink-0 relative flex justify-center items-center">
                                            <div className="absolute bottom-4 right-7 w-full h-full transform scale-[0.5] origin-top translate y-4.5"><Avatar selectedParts={p.selectedParts} dominantStat={getDominantStat(calculateStats(p.selectedParts, p.stats))} transparent={true} /></div>
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="font-black text-sm truncate">{p.starName}</span>
                                            <span className={`text-[10px] font-bold uppercase ${p.isAssignedToFarm ? 'text-green-800' : 'text-gray-400'}`}>{p.isAssignedToFarm ? (currentLang === 'cn' ? '★ 已入驻' : '★ ACTIVE') : (currentLang === 'cn' ? '待命' : 'ARCHIVE')}</span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-2 flex flex-col items-center justify-center py-8 opacity-40">
                                        <div className="w-12 h-12 mb-2"><FarmIcons.Archives /></div><p className="font-black text-sm">{currentLang === 'cn' ? '实验室还没有生命诞生记录...' : 'No Bobu in archives...'}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'shop' && (() => {
                        const [shopCategory, setShopCategory] = useState<'supplies' | 'starsand'>('supplies');

                        // 星砂特效数据库
                        const EFFECTS_DB = [
                            { id: 'eff_heart', name: { cn: '爱心羁绊光环', en: 'Heart Aura', se: 'Hjärta Aura' }, price: 50, icon: <svg viewBox="0 0 24 24" fill="#FF90E8" stroke="black" strokeWidth="2" className="w-8 h-8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg> },
                            { id: 'eff_star', name: { cn: '动态星轨', en: 'Star Trail', se: 'Stjärnspår' }, price: 100, icon: <FarmIcons.Star /> }
                        ];

                        const allShopItems = [
                            { id: 'cookie', name: { cn: "元气曲奇", en: "Cookie", se: "Kaka" }, price: 5, int: 5, hun: 20, icon: <FarmIcons.Hunger /> },
                            { id: 'milk', name: { cn: "星间奶昔", en: "Milkshake", se: "Mjölkshake" }, price: 15, int: 20, hun: 10, icon: <FarmIcons.MilkFood /> },
                            ...FURNITURE_DB.filter(f => unlockedShopItems.includes(f.id)).map(f => ({ id: f.id, name: f.name, price: f.price, int: f.int, hun: 0, icon: f.imgUrl ? <img src={f.imgUrl} alt="item" className="w-8 h-8" /> : f.svg }))
                        ];

                        const currentItems = shopCategory === 'supplies' ? allShopItems : EFFECTS_DB;

                        return (
                            <div className="flex flex-col h-full pb-2">
                                {/* 商城分类选项卡 */}
                                <div className="flex gap-2 mb-3 bg-gray-100 p-1.5 rounded-xl border-2 border-black">
                                    <button onClick={() => setShopCategory('supplies')} className={`flex-1 font-black text-xs py-2 rounded-lg transition-colors ${shopCategory === 'supplies' ? 'bg-[#FFD700] border-2 border-black shadow-sm' : 'text-gray-500'}`}>
                                        {currentLang === 'cn' ? '🥕 基础补给' : 'SUPPLIES'}
                                    </button>
                                    <button onClick={() => setShopCategory('starsand')} className={`flex-1 font-black text-xs py-2 rounded-lg transition-colors ${shopCategory === 'starsand' ? 'bg-[#60EFFF] border-2 border-black shadow-sm text-black' : 'text-gray-500'}`}>
                                        {currentLang === 'cn' ? '✨ 星砂秘店' : 'SECRET SHOP'}
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                                    {currentItems.map(item => (
                                        <div key={item.id}
                                            onClick={() => {
                                                if (shopCategory === 'supplies') {
                                                    handleBuyItem(item.price, (item as any).hun, (item as any).int);
                                                } else {
                                                    // 兑换星砂特效逻辑
                                                    if (unlockedEffects?.includes(item.id)) {
                                                        alert(currentLang === 'cn' ? '已经拥有该特效啦！' : 'Already owned!');
                                                        return;
                                                    }
                                                    if (starSand < item.price) {
                                                        playSound?.('error');
                                                        alert(currentLang === 'cn' ? '友谊星砂不足！去雷达里转转吧。' : 'Not enough Star Sand!');
                                                        return;
                                                    }
                                                    playSound?.('achievement');
                                                    onUpdateStarSand!(-item.price);
                                                    onUnlockEffect!(item.id);
                                                    alert(currentLang === 'cn' ? '特效兑换成功！' : 'Effect Unlocked!');
                                                }
                                            }}
                                            className="bg-white border-[4px] border-black p-3 rounded-[20px] flex flex-col items-center gap-2 shadow-[4px_4px_0_black] cursor-pointer hover:bg-[#F9FAFB] active:translate-y-1 active:shadow-none transition-all relative overflow-hidden"
                                        >
                                            {shopCategory === 'starsand' && unlockedEffects?.includes(item.id) && (
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                                                    <span className="bg-green-400 text-white font-black text-xs px-3 py-1 rounded-full border-2 border-black -rotate-12">OWNED</span>
                                                </div>
                                            )}
                                            <div className="w-12 h-12 bg-[#F3F4F6] border-[3px] border-black rounded-full flex items-center justify-center">
                                                <div className="w-8 h-8">{item.icon}</div>
                                            </div>
                                            <span className="font-black text-xs text-center leading-tight">{item.name[currentLang]}</span>
                                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border-2 border-black mt-auto ${shopCategory === 'supplies' ? 'bg-[#FFD700]' : 'bg-[#60EFFF]'}`}>
                                                {shopCategory === 'supplies' ? <CarrotCoinIcon className="w-3 h-3" /> : <SocialIcons.StarSand className="w-3 h-3" />}
                                                <span className="text-[10px] font-black">{item.price}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}

                    {activeTab === 'explore' && (
                        <div className="h-full pt-1">
                            {!selectedPet ? (
                                <div className="flex flex-col items-center opacity-50 mt-10">
                                    <div className="w-16 h-16 mb-4"><FarmIcons.Explore /></div><p className="font-black">{currentLang === 'cn' ? '请先在农场选中一只生命' : 'Select a life first'}</p>
                                </div>
                            ) : selectedPet.isOnExpedition ? (
                                (() => {
                                    const duration = selectedPet.expeditionDuration || (2 * 60 * 60 * 1000);
                                    const timePassed = Date.now() - (selectedPet.expeditionStartTime || 0);
                                    const isDone = timePassed >= duration;

                                    if (isDone) {
                                        return (
                                            <div className="flex flex-col items-center justify-center h-full gap-2 animate-bounce-in">
                                                <div className="w-16 h-16 bg-green-100 border-[3px] border-black rounded-full flex items-center justify-center animate-bounce">
                                                    <div className="w-10 h-10"><FarmIcons.Explore /></div>
                                                </div>
                                                <p className="font-black text-[#82E0AA] uppercase tracking-wider">{currentLang === 'cn' ? '探险归来！' : 'RETURNED!'}</p>
                                                <button onClick={handleClaimExpedition} className="mt-2 bg-[#FFD700] border-[4px] border-black px-6 py-2 rounded-2xl font-black text-black shadow-[4px_4px_0_black] active:translate-y-1 active:shadow-none flex items-center gap-2">
                                                    <CarrotCoinIcon className="w-5 h-5" />{currentLang === 'cn' ? '查收结果' : 'CHECK RESULT'}
                                                </button>
                                            </div>
                                        );
                                    } else {
                                        const h = Math.floor((duration - timePassed) / 3600000);
                                        const m = Math.floor(((duration - timePassed) % 3600000) / 60000);
                                        return (
                                            <div className="flex flex-col items-center justify-center h-full gap-2">
                                                <div className="flex flex-col items-center gap-2 bg-gray-100 border-[3px] border-dashed border-black p-4 rounded-3xl w-full max-w-[280px]">
                                                    <div className="w-12 h-12 bg-[#85C1E9] border-[3px] border-black rounded-full flex items-center justify-center animate-pulse"><div className="w-8 h-8"><FarmIcons.Explore /></div></div>
                                                    <p className="font-black text-sm uppercase">{currentLang === 'cn' ? '正在深空航行...' : 'EXPLORING DEEP SPACE...'}</p>
                                                    <div className="bg-black text-white px-4 py-1.5 rounded-xl font-mono font-bold tracking-widest">{h}H {m}M</div>
                                                </div>
                                            </div>
                                        );
                                    }
                                })()
                            ) : (
                                <div className="grid grid-cols-2 gap-3 h-full pb-2">
                                    {EXPEDITION_OPTIONS.map((opt, i) => (
                                        <div key={i} onClick={() => startExpedition(opt)} className="bg-white border-[4px] border-black rounded-2xl p-3 flex flex-col items-center justify-center cursor-pointer shadow-[4px_4px_0_black] hover:bg-[#82E0AA] transition-colors active:translate-y-1 active:shadow-none group">
                                            <div className="font-black text-sm mb-1">{opt.label[currentLang]}</div>
                                            <div className="text-xs font-bold text-gray-500 mb-2">{opt.minutes} MIN</div>
                                            <div className="flex w-full justify-between items-center text-[10px] font-black border-t-[3px] border-black border-dashed pt-2">
                                                <span className="text-[#D2691E] flex items-center gap-1"><div className="w-3 h-3"><FarmIcons.Hunger /></div> -{opt.hungerCost}</span>
                                                <span className="flex items-center gap-0.5 text-yellow-600"><CarrotCoinIcon className="w-3 h-3" /> +{opt.reward}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </footer>

            {/* ========================================== */}
            {/* 💌 多功能结算弹窗 (含配件/家具/事件/平淡) */}
            {/* ========================================== */}
            {claimedPostcard && (
                <div className="fixed inset-0 z-[11000] flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm">
                    <div className="bg-white p-4 pb-8 rounded-lg shadow-[15px_15px_0_rgba(0,0,0,0.8)] w-full max-w-[340px] transform -rotate-1 animate-bounce-in flex flex-col items-center">
                        <div className="absolute -top-4 w-24 h-8 bg-white/50 backdrop-blur-md border border-gray-200 rotate-3 shadow-sm z-10" />

                        {/* 根据不同类型渲染上方图像区 */}
                        {claimedPostcard.type === 'event' ? (
                            <div className="w-full aspect-square bg-[#1a1a2e] border-4 border-black mb-4 overflow-hidden relative shadow-inner">
                                <img src={claimedPostcard.event.img} alt="Event" className="w-full h-full object-cover opacity-90 mix-blend-screen" />
                            </div>
                        ) : (
                            <div className="w-full h-40 bg-[#EAFFD0] border-4 border-black border-dashed mb-4 flex items-center justify-center rounded-xl">
                                {claimedPostcard.type === 'peaceful' && <div className="text-5xl animate-float">🛸</div>}
                                {(claimedPostcard.type === 'char_part' || claimedPostcard.type === 'planet_part') && <div className="text-5xl animate-bounce">🎁</div>}
                                {claimedPostcard.type === 'furniture' && <div className="w-16 h-16">{claimedPostcard.item.svg}</div>}
                            </div>
                        )}

                        <h3 className="font-black text-xl uppercase tracking-tighter mb-2 text-center text-gray-800">
                            {claimedPostcard.type === 'event' ? claimedPostcard.event.title[currentLang] : (claimedPostcard.type === 'peaceful' ? claimedPostcard.title[currentLang] : (currentLang === 'cn' ? '发现新战利品！' : 'New Loot Found!'))}
                        </h3>
                        <p className="font-hand text-sm text-gray-600 text-center leading-tight mb-4 px-2">
                            {claimedPostcard.type === 'event' ? claimedPostcard.event.desc[currentLang] : (claimedPostcard.type === 'peaceful' ? claimedPostcard.desc[currentLang] : claimedPostcard.item.name[currentLang])}
                        </p>

                        <div className="flex items-center gap-2 bg-[#FFD700] px-6 py-2 border-[3px] border-black rounded-full shadow-[3px_3px_0_black] mb-6">
                            <CarrotCoinIcon className="w-6 h-6" />
                            <span className="font-black text-xl">+{claimedPostcard.reward}</span>
                        </div>

                        {/* 底部按钮逻辑：事件有录入按钮，其他只有关闭按钮 */}
                        <div className="flex gap-3 w-full">
                            {claimedPostcard.type === 'event' && (
                                <button onClick={handleRecordEventToStory} className="flex-1 bg-[#82E0AA] text-black border-2 border-black py-3 rounded-xl font-black uppercase tracking-wider shadow-[3px_3px_0_black] active:translate-y-1 active:shadow-none transition-all">
                                    {currentLang === 'cn' ? '录入手帐 (+10)' : 'RECORD (+10)'}
                                </button>
                            )}
                            <button onClick={() => { playSound?.('click'); setClaimedPostcard(null); }} className="flex-1 bg-black text-white border-2 border-black py-3 rounded-xl font-black uppercase tracking-wider active:scale-95 transition-transform">
                                {currentLang === 'cn' ? '知道了' : 'GOT IT'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatBar = ({ icon, value, color }: any) => (
    <div className="flex items-center gap-2 w-full min-w-[150px]">
        <div className="bg-white border-[3px] border-black p-1 rounded-lg shadow-[2px_2px_0_black] flex-shrink-0 z-10">{icon}</div>
        <div className="relative flex-1 h-5 bg-white border-[3px] border-black rounded-full overflow-hidden ml-[-10px]">
            <div className={`h-full ${color} transition-all duration-500 ease-out border-r-[2px] border-black`} style={{ width: `${value}%` }} />
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-black drop-shadow-[1px_1px_0_white]">{Math.floor(value)} / 100</span>
        </div>
    </div>
);

const TabButton = ({ active, onClick, icon, color }: any) => (
    <button onClick={onClick} className={`w-16 h-16 rounded-[24px] border-[4px] border-black flex items-center justify-center transition-all ${active ? `${color} shadow-none translate-y-2` : `bg-white shadow-[0_8px_0_black] hover:translate-y-1 hover:shadow-[0_4px_0_black]`}`}>
        <div className={`transform transition-transform ${active ? 'scale-125' : 'scale-100'}`}>{icon}</div>
    </button>
);

const ShopItem = ({ name, price, icon, onBuy }: any) => (
    <div onClick={onBuy} className="bg-white border-[4px] border-black p-3 rounded-[20px] flex flex-col items-center gap-2 shadow-[4px_4px_0_black] cursor-pointer hover:bg-[#F9FAFB] active:translate-y-1 active:shadow-none transition-all">
        <div className="w-12 h-12 bg-[#F3F4F6] border-[3px] border-black rounded-full flex items-center justify-center"><div className="w-8 h-8">{icon}</div></div>
        <span className="font-black text-xs text-center leading-tight">{name}</span>
        <div className="flex items-center gap-1 bg-[#FFD700] px-2 py-0.5 rounded-lg border-2 border-black mt-auto">
            <CarrotCoinIcon className="w-3 h-3" /><span className="text-[10px] font-black">{price}</span>
        </div>
    </div>
);