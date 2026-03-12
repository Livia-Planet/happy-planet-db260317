import React, { useState, useEffect, useMemo } from 'react';
import { Avatar } from './Avatar';
import { SpaceBackground } from './SpaceBackground';
import { CarrotCoinIcon } from './Icons';
import { Language, PassportData, ViewMode } from '../types';
import { getDominantStat, calculateStats } from '../utils/gameLogic';

const FarmIcons = {
    Hunger: () => (
        <svg viewBox="0 0 24 24" fill="#D2691E" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10c0-1.33-.26-2.61-.73-3.77-.47-1.16-2.18-1.07-2.6.09-.44 1.23-1.8 1.94-3.08 1.57-1.28-.36-1.99-1.81-1.55-3.09.43-1.27-.47-2.73-1.8-2.73H12V2z" />
            <circle cx="8" cy="8" r="1.2" fill="black" />
            <circle cx="15" cy="10" r="1.2" fill="black" />
            <circle cx="12" cy="15" r="1.2" fill="black" />
            <circle cx="7" cy="16" r="1.2" fill="black" />
        </svg>
    ),
    Intimacy: () => (
        <svg viewBox="0 0 24 24" fill="#FF90E8" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
    ),
    Focus: () => (
        <svg viewBox="0 0 24 24" fill="#85C1E9" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
            <circle cx="12" cy="13" r="8" fill="white" />
            <path d="M12 9v4l2 2" /><path d="M5 3L2 6" /><path d="M19 3l3 3" />
        </svg>
    ),
    Shop: () => (
        <svg viewBox="0 0 24 24" fill="#F8C471" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="white" />
            <path d="M3 9h18" /><path d="M9 22V12h6v10" fill="#F8C471" />
        </svg>
    ),
    Archives: () => (
        <svg viewBox="0 0 24 24" fill="#E5E7EB" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            <line x1="9" y1="14" x2="15" y2="14" />
        </svg>
    ),
    Explore: () => (
        <svg viewBox="0 0 24 24" fill="#82E0AA" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
    ),
    MilkFood: () => (
        <svg viewBox="0 0 24 24" fill="#FF90E8" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <path d="M6 8h12v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8z" fill="white" />
            <path d="M8 8V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4" />
        </svg>
    ),
    Star: () => (
        <svg viewBox="0 0 24 24" fill="#FFD700" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
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
}

const EXPEDITION_OPTIONS = [
    { minutes: 30, reward: 25, hungerCost: 10, label: { cn: '近地巡航', en: 'Low Orbit', se: 'Låg Omloppsbana' } },
    { minutes: 90, reward: 50, hungerCost: 30, label: { cn: '星系边缘', en: 'Outer Rim', se: 'Yttre Randen' } },
    { minutes: 240, reward: 100, hungerCost: 60, label: { cn: '深空潜航', en: 'Deep Space', se: 'Djuprymd' } },
    { minutes: 480, reward: 150, hungerCost: 90, label: { cn: '未知虫洞', en: 'Wormhole', se: 'Maskhål' } }
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
    onStartGlobalFocus
}) => {
    const [activeTab, setActiveTab] = useState<'focus' | 'shop' | 'archives' | 'explore'>('focus');
    const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

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
            setGlobalAlert(currentLang === 'cn' ? '它正在宇宙深处探险呢，\n等回来再喂它吧！' : 'It is exploring!\nFeed it when it returns!');
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
        const currentIntimacy = selectedPet.intimacy ?? 30;
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
        onUpdatePassport(selectedPet.id, 'expeditionReward', opt.reward); // ✅ 已修复
    };

    const handleClaimExpedition = () => {
        if (!selectedPet) return;
        playSound?.('success');
        const reward = selectedPet.expeditionReward || 50;
        onUpdateCoins(reward);
        onUpdatePassport(selectedPet.id, 'isOnExpedition', false);
        setGlobalAlert(currentLang === 'cn' ? `探险圆满结束！\n带回了 ${reward} 个胡萝卜币！` : `Expedition complete!\nBrought back ${reward} coins!`);
    };

    const handleLocalToggleFarm = (p: PassportData) => {
        if (!p.isAssignedToFarm && activePets.length >= maxFarmSlots) {
            playSound?.('error');
            setGlobalAlert(currentLang === 'cn' ? '农场床位不足，\n请先解锁更多位置！' : 'Farm is full!\nUnlock more slots!');
            return;
        }
        onToggleFarm(p.id);
    };

    const t = {
        emptyArchive: currentLang === 'cn' ? '实验室还没有生命诞生记录...' : 'No Bobu in archives...',
    };

    return (
        <div className="fixed inset-0 z-40 flex flex-col items-center bg-[#EAFFD0] overflow-hidden font-rounded text-black select-none">
            <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                <SpaceBackground bpm={50} themeColor="#95E1D3" />
            </div>

            {/* --- 顶部状态栏：✅ 恢复右侧按钮，左侧详情重构 --- */}
            <header className="relative z-20 left-20 w-full p-6 flex justify-between items-start pointer-events-none">

                {/* 🌟 详情面板 (左上角) */}
                <div className="flex flex-col gap-2">
                    {selectedPet ? (
                        <div className="bg-white/80 backdrop-blur-md border-[4px] border-black p-3 pt-2 rounded-[24px] shadow-[4px_4px_0_black] flex flex-col gap-2 pointer-events-auto transition-all animate-bounce-in min-w-[140px]">
                            {/* 名字栏 */}
                            <div className="flex items-center gap-1.5 w-max">
                                <FarmIcons.Star />
                                <span className="font-black text-sm uppercase tracking-wider translate-y-0.5">{selectedPet.starName}</span>
                            </div>

                            {/* 属性条 */}
                            <div className="flex flex-col gap-2 mt-1">
                                <StatBar icon={<div className="w-4 h-4"><FarmIcons.Hunger /></div>} value={selectedPet.hunger ?? 80} color="bg-[#D2691E]" />
                                <StatBar icon={<div className="w-4 h-4"><FarmIcons.Intimacy /></div>} value={selectedPet.intimacy ?? 30} color="bg-[#FF90E8]" />
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
            {/* ✅ 修复 4：添加 -translate-y-12 整体往上推，防止被底栏挡住 */}
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
                                    <Avatar
                                        selectedParts={pet.selectedParts}
                                        dominantStat={getDominantStat(calculateStats(pet.selectedParts, pet.stats))}
                                        className="w-40 h-40"
                                    />
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
                                        <div className="bg-[#FF90E8] h-full transition-all duration-500" style={{ width: `${pet.intimacy ?? 30}%` }} />
                                    </div>
                                </div>

                                <div className="absolute -bottom-2 w-28 h-5 bg-black/10 blur-xl rounded-full" />
                            </div>
                        );
                    })
                ) : (
                    <div
                        onClick={() => { playSound?.('click'); setActiveTab('archives'); }}
                        className="w-56 h-56 border-[6px] border-dashed border-black/20 rounded-[50px] flex flex-col items-center justify-center cursor-pointer hover:bg-black/5 hover:border-black/40 transition-all group"
                    >
                        <div className="w-20 h-20 opacity-30 group-hover:scale-110 transition-transform mb-2">
                            <FarmIcons.Archives />
                        </div>
                        <p className="font-black text-black/40 text-center leading-tight whitespace-pre-line">
                            {currentLang === 'cn' ? '点击去档案室\n领养你的生命' : 'Click to Adopt\nfrom Archives'}
                        </p>
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
                            <p className="font-black text-gray-500 text-center text-sm">
                                {currentLang === 'cn' ? '开启全能专注模式！\n你可以一边计时，一边去实验室制造新伙伴。' : 'Global Focus Mode!\nYou can build new rabbits while focusing.'}
                            </p>
                            <button
                                onClick={() => {
                                    if (!selectedPet) {
                                        playSound?.('error');
                                        setGlobalAlert(currentLang === 'cn' ? '请先选中一只兔子来陪伴你！' : 'Select a rabbit to focus with!');
                                        return;
                                    }
                                    if (selectedPet.isOnExpedition) {
                                        playSound?.('error');
                                        setGlobalAlert(currentLang === 'cn' ? '它去探险了，换一只吧！' : 'It is exploring, choose another!');
                                        return;
                                    }
                                    playSound?.('click');
                                    onStartGlobalFocus(selectedPet.id);
                                }}
                                className="w-full max-w-sm py-4 border-[5px] border-black rounded-2xl font-black text-xl bg-[#82E0AA] text-black shadow-[6px_6px_0_black] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center gap-2"
                            >
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
                                    <button
                                        onClick={() => { playSound?.('click'); onUnlockSlot(); }}
                                        className="flex items-center gap-2 bg-[#F8C471] px-4 py-2 rounded-xl border-[3px] border-black shadow-[3px_3px_0_black] active:shadow-none active:translate-y-1 transition-all"
                                    >
                                        <span className="font-black text-xs uppercase">{currentLang === 'cn' ? '解锁床位' : 'UNLOCK'}</span>
                                        <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded-md border-2 border-black">
                                            <CarrotCoinIcon className="w-3 h-3" />
                                            <span className="font-black text-[10px]">{SLOT_UPGRADE_COSTS[maxFarmSlots]}</span>
                                        </div>
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {savedPassports && savedPassports.length > 0 ? savedPassports.map((p) => (
                                    <div
                                        key={p.id}
                                        onClick={() => handleLocalToggleFarm(p)}
                                        className={`p-3 rounded-2xl flex items-center gap-3 cursor-pointer border-[4px] border-black shadow-[4px_4px_0_black] active:shadow-none active:translate-y-1 transition-all ${p.isAssignedToFarm ? 'bg-[#A8E6CF]' : 'bg-[#F9FAFB] hover:bg-yellow-50'}`}
                                    >
                                        {/* ✅ 修复 2：彻底修复细长头像问题 */}
                                        <div className="w-14 h-14 bg-white border-[3px] border-black rounded-full overflow-hidden flex-shrink-0 relative flex justify-center items-center">
                                            <div className="absolute bottom-4 right-7 w-full h-full transform scale-[0.5] origin-top translate y-4.5">
                                                <Avatar selectedParts={p.selectedParts} dominantStat={getDominantStat(calculateStats(p.selectedParts, p.stats))} transparent={true} />
                                            </div>
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="font-black text-sm truncate">{p.starName}</span>
                                            <span className={`text-[10px] font-bold uppercase ${p.isAssignedToFarm ? 'text-green-800' : 'text-gray-400'}`}>
                                                {p.isAssignedToFarm ? (currentLang === 'cn' ? '★ 已入驻' : '★ ACTIVE') : (currentLang === 'cn' ? '待命' : 'ARCHIVE')}
                                            </span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-2 flex flex-col items-center justify-center py-8 opacity-40">
                                        <div className="w-12 h-12 mb-2"><FarmIcons.Archives /></div>
                                        <p className="font-black text-sm">{t.emptyArchive}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'shop' && (
                        <div className="grid grid-cols-2 gap-4">
                            <ShopItem name={currentLang === 'cn' ? "元气曲奇" : "Cookie"} price={5} icon={<FarmIcons.Hunger />} onBuy={() => handleBuyItem(5, 20, 5)} />
                            <ShopItem name={currentLang === 'cn' ? "星间奶昔" : "Milkshake"} price={15} icon={<FarmIcons.MilkFood />} onBuy={() => handleBuyItem(15, 10, 20)} />
                        </div>
                    )}

                    {activeTab === 'explore' && (
                        <div className="h-full pt-1">
                            {!selectedPet ? (
                                <div className="flex flex-col items-center opacity-50 mt-10">
                                    <div className="w-16 h-16 mb-4"><FarmIcons.Explore /></div>
                                    <p className="font-black">{currentLang === 'cn' ? '请先在农场选中一只生命' : 'Select a life first'}</p>
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
                                                <button
                                                    onClick={handleClaimExpedition}
                                                    className="mt-2 bg-[#FFD700] border-[4px] border-black px-6 py-2 rounded-2xl font-black text-black shadow-[4px_4px_0_black] active:translate-y-1 active:shadow-none flex items-center gap-2"
                                                >
                                                    <CarrotCoinIcon className="w-5 h-5" />
                                                    {currentLang === 'cn' ? '领取奖励' : 'CLAIM REWARD'}
                                                </button>
                                            </div>
                                        );
                                    } else {
                                        const leftMs = duration - timePassed;
                                        const h = Math.floor(leftMs / 3600000);
                                        const m = Math.floor((leftMs % 3600000) / 60000);
                                        return (
                                            <div className="flex flex-col items-center justify-center h-full gap-2">
                                                <div className="flex flex-col items-center gap-2 bg-gray-100 border-[3px] border-dashed border-black p-4 rounded-3xl w-full max-w-[280px]">
                                                    <div className="w-12 h-12 bg-[#85C1E9] border-[3px] border-black rounded-full flex items-center justify-center animate-pulse">
                                                        <div className="w-8 h-8"><FarmIcons.Explore /></div>
                                                    </div>
                                                    <p className="font-black text-sm uppercase">{currentLang === 'cn' ? '正在深空航行...' : 'EXPLORING DEEP SPACE...'}</p>
                                                    <div className="bg-black text-white px-4 py-1.5 rounded-xl font-mono font-bold tracking-widest">
                                                        {h}H {m}M
                                                    </div>
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
                                                {/* ✅ 修复 3：去掉 Emoji */}
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
        </div>
    );
};

const StatBar = ({ icon, value, color }: any) => (
    <div className="flex items-center gap-2 w-full max-w-[140px]">
        <div className="bg-white border-[3px] border-black p-1 rounded-lg shadow-[2px_2px_0_black] flex-shrink-0">
            {icon}
        </div>
        <div className="w-full h-4 bg-white border-[3px] border-black rounded-full overflow-hidden">
            <div className={`h-full ${color} transition-all duration-500 ease-out border-r-[2px] border-black`} style={{ width: `${value}%` }} />
        </div>
    </div>
);

const TabButton = ({ active, onClick, icon, color }: any) => (
    <button
        onClick={onClick}
        className={`w-16 h-16 rounded-[24px] border-[4px] border-black flex items-center justify-center transition-all ${active ? `${color} shadow-none translate-y-2` : `bg-white shadow-[0_8px_0_black] hover:translate-y-1 hover:shadow-[0_4px_0_black]`}`}
    >
        <div className={`transform transition-transform ${active ? 'scale-125' : 'scale-100'}`}>{icon}</div>
    </button>
);

const ShopItem = ({ name, price, icon, onBuy }: any) => (
    <div onClick={onBuy} className="bg-white border-[4px] border-black p-3 rounded-[20px] flex flex-col items-center gap-2 shadow-[4px_4px_0_black] cursor-pointer hover:bg-[#F9FAFB] active:translate-y-1 active:shadow-none transition-all">
        <div className="w-12 h-12 bg-[#F3F4F6] border-[3px] border-black rounded-full flex items-center justify-center">
            <div className="w-8 h-8">{icon}</div>
        </div>
        <span className="font-black text-xs">{name}</span>
        <div className="flex items-center gap-1 bg-[#FFD700] px-2 py-0.5 rounded-lg border-2 border-black">
            <CarrotCoinIcon className="w-3 h-3" />
            <span className="text-[10px] font-black">{price}</span>
        </div>
    </div>
);