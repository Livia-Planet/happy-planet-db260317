import React, { useState, useEffect, useMemo } from 'react';
import { Avatar } from './Avatar';
import { SpaceBackground } from './SpaceBackground';
import { CarrotCoinIcon } from './Icons';
import { Language, PassportData, ViewMode } from '../types';
// 👇 这行就是之前漏掉的，导致头像不显示的核心函数！
import { getDominantStat, calculateStats } from '../utils/gameLogic';

const FarmIcons = {
    Hunger: () => (
        <svg viewBox="0 0 24 24" fill="#D2691E" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10c0-1.33-.26-2.61-.73-3.77-.47-1.16-2.18-1.07-2.6.09-.44 1.23-1.8 1.94-3.08 1.57-1.28-.36-1.99-1.81-1.55-3.09.43-1.27-.47-2.73-1.8-2.73H12V2z" />
            <circle cx="8" cy="8" r="1.2" fill="black" />
            <circle cx="15" cy="10" r="1.2" fill="black" />
            <circle cx="12" cy="15" r="1.2" fill="black" />
            <circle cx="7" cy="16" r="1.2" fill="black" />
        </svg>
    ),
    Intimacy: () => (
        <svg viewBox="0 0 24 24" fill="#FF90E8" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
    ),
    Home: ({ className }: { className?: string }) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
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
    CarrotFood: () => (
        <svg viewBox="0 0 24 24" fill="#FFA500" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <path d="M22.11 3.84a4.49 4.49 0 0 0-6.36 0l-9.9 9.9a2.12 2.12 0 0 0 0 3l3.35 3.35a2.12 2.12 0 0 0 3 0l9.91-9.91a4.49 4.49 0 0 0 0-6.34z" />
            <path d="M3 6l3.5 3.5M6 3l3.5 3.5M3 3l3.5 3.5" stroke="#82E0AA" strokeWidth="3" />
        </svg>
    ),
    MilkFood: () => (
        <svg viewBox="0 0 24 24" fill="#FF90E8" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <path d="M6 8h12v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8z" fill="white" />
            <path d="M8 8V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4" />
        </svg>
    ),
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
    // 👇 这是你刚刚在 App.tsx 传进来的更新函数！
    onUpdatePassport: (id: string, field: keyof PassportData, value: any) => void;
}

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
    onUpdatePassport
}) => {
    const [activeTab, setActiveTab] = useState<'focus' | 'shop' | 'archives' | 'explore'>('focus');
    const [isFocusing, setIsFocusing] = useState(false);
    const [timeLeft, setTimeLeft] = useState(25 * 60);

    // 🌟 方案A核心：当前选中的兔子 ID
    const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

    // 筛选出在农场的兔子
    const activePets = useMemo(() => savedPassports.filter(p => p.isAssignedToFarm), [savedPassports]);
    const SLOT_UPGRADE_COSTS = [0, 50, 150, 500, 1000];

    // 智能选中：如果农场有兔子且没选中，自动选中第一只；如果农场空了，清空选中。
    useEffect(() => {
        if (activePets.length > 0 && !selectedPetId) {
            setSelectedPetId(activePets[0].id);
        } else if (activePets.length === 0) {
            setSelectedPetId(null);
        }
    }, [activePets, selectedPetId]);

    // 拿到当前选中的兔子的完整数据
    const selectedPet = activePets.find(p => p.id === selectedPetId);

    useEffect(() => {
        let timer: any;
        if (isFocusing && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0 && isFocusing) {
            handleFocusComplete();
        }
        return () => clearInterval(timer);
    }, [isFocusing, timeLeft]);

    const handleFocusComplete = () => {
        playSound?.('success');
        setIsFocusing(false);
        setTimeLeft(25 * 60);
        onUpdateCoins(10);

        // 专注奖励：给当前选中的兔子加 5 点亲密度
        if (selectedPet) {
            const currentIntimacy = selectedPet.intimacy ?? 30;
            onUpdatePassport(selectedPet.id, 'intimacy', Math.min(100, currentIntimacy + 5));
        }
    };

    const toggleFocus = () => {
        if (activePets.length === 0) {
            alert(currentLang === 'cn' ? '先去档案室领养一只 Bobu 吧！' : 'Adopt a Bobu first!');
            return;
        }
        playSound?.('click');
        setIsFocusing(!isFocusing);
    };

    const handleBuyItem = (price: number, addHunger: number, addIntimacy: number) => {
        if (!selectedPet) {
            alert(currentLang === 'cn' ? '请先在农场点击选中一只 Bobu 来喂食！' : 'Click a Bobu to feed!');
            return;
        }
        if (carrotCoins < price) {
            playSound?.('error');
            return;
        }
        playSound?.('coins');
        onUpdateCoins(-price);

        // 🌟 方案A核心：定向喂食，更新独立数据
        const currentHunger = selectedPet.hunger ?? 80; // 默认80
        const currentIntimacy = selectedPet.intimacy ?? 30; // 默认30
        onUpdatePassport(selectedPet.id, 'hunger', Math.min(100, currentHunger + addHunger));
        onUpdatePassport(selectedPet.id, 'intimacy', Math.min(100, currentIntimacy + addIntimacy));
    };

    const t = {
        startFocus: currentLang === 'cn' ? '开始专注' : 'START FOCUS',
        stopFocus: currentLang === 'cn' ? '放弃专注' : 'STOP FOCUS',
        emptyArchive: currentLang === 'cn' ? '实验室还没有生命诞生记录...' : 'No Bobu in archives...',
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center bg-[#EAFFD0] overflow-hidden font-rounded text-black select-none">
            <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                <SpaceBackground bpm={isFocusing ? 120 : 50} themeColor="#95E1D3" />
            </div>

            {/* --- 顶部状态栏 --- */}
            <header className="relative z-20 w-full p-6 flex justify-between items-start">

                {/* 🌟 方案A：左上角 UI 联动选中兔子 */}
                <div className="flex flex-col gap-3 min-h-[100px]">
                    {selectedPet ? (
                        <>
                            <div className="font-black text-sm bg-white px-3 py-1.5 rounded-xl border-[3px] border-black inline-block shadow-[3px_3px_0_black] mb-1">
                                ⭐ {selectedPet.starName}
                            </div>
                            <StatBar icon={<FarmIcons.Hunger />} value={selectedPet.hunger ?? 80} color="bg-[#D2691E]" />
                            <StatBar icon={<FarmIcons.Intimacy />} value={selectedPet.intimacy ?? 30} color="bg-[#FF90E8]" />

                            {/* 智能提示语 */}
                            {(selectedPet.hunger ?? 80) < 50 && (
                                <span className="text-xs font-bold text-red-600 bg-white/90 px-3 py-1 rounded-lg border-[2px] border-red-200 mt-1 animate-pulse">
                                    {currentLang === 'cn' ? '肚子咕咕叫，去商店买点吃的！' : 'Hungry! Buy food in shop!'}
                                </span>
                            )}
                        </>
                    ) : (
                        <div className="font-black text-sm bg-white px-3 py-1.5 rounded-xl border-[3px] border-black opacity-50">
                            {currentLang === 'cn' ? '点击选中农场里的兔子' : 'Click a Bobu to select'}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <div className="h-12 bg-white border-[3px] border-black px-4 rounded-xl shadow-[3px_3px_0_black] flex items-center gap-2">
                        <CarrotCoinIcon className="w-6 h-6" />
                        <span className="font-black text-xl mt-0.5">{carrotCoins}</span>
                    </div>
                    <button
                        onClick={() => { playSound?.('click'); onNavigate('start'); }}
                        className="w-12 h-12 bg-white border-[3px] border-black rounded-xl shadow-[3px_3px_0_black] flex items-center justify-center hover:translate-y-[1px] hover:shadow-[2px_2px_0_black] active:translate-y-[3px] active:shadow-none transition-all"
                    >
                        <FarmIcons.Home className="w-6 h-6" />
                    </button>
                </div>
            </header>

            {/* --- 核心交互区 --- */}
            <main className="relative z-10 flex-1 w-full flex flex-wrap items-center justify-center p-4 gap-8 md:gap-16">
                {activePets.length > 0 ? (
                    activePets.map((pet, idx) => {
                        const isSelected = pet.id === selectedPetId;
                        return (
                            <div
                                key={pet.id}
                                onClick={() => { playSound?.('click'); setSelectedPetId(pet.id); }}
                                className="relative flex flex-col items-center cursor-pointer group"
                            >
                                {/* 选中光环 */}
                                {isSelected && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/40 border-4 border-dashed border-yellow-400 rounded-full animate-spin-slow pointer-events-none" />
                                )}

                                {/* 🌟 核心修复 1：主展示舱正确渲染 Avatar */}
                                <div className={`relative z-10 transform transition-all duration-300 ${isSelected ? 'scale-[1.5]' : 'scale-[1.2] hover:scale-[1.3]'} ${isFocusing ? 'translate-y-4' : 'animate-float'}`} style={{ animationDelay: `${idx * 0.2}s` }}>
                                    <Avatar
                                        selectedParts={pet.selectedParts}
                                        dominantStat={getDominantStat(calculateStats(pet.selectedParts, pet.stats))}
                                        className="w-40 h-40"
                                    />
                                </div>

                                {/* 🌟 方案C：专属迷你属性条 */}
                                {!isFocusing && (
                                    <div className="absolute -bottom-10 z-20 flex flex-col gap-1.5 bg-white/90 p-2 rounded-xl border-[3px] border-black shadow-[2px_2px_0_black] opacity-80 group-hover:opacity-100 transition-opacity">
                                        <div className="w-16 h-2 bg-gray-200 rounded-full border-2 border-black overflow-hidden">
                                            <div className="bg-[#D2691E] h-full" style={{ width: `${pet.hunger ?? 80}%` }} />
                                        </div>
                                        <div className="w-16 h-2 bg-gray-200 rounded-full border-2 border-black overflow-hidden">
                                            <div className="bg-[#FF90E8] h-full" style={{ width: `${pet.intimacy ?? 30}%` }} />
                                        </div>
                                    </div>
                                )}

                                {/* Bongo Cat 工作台 */}
                                {isFocusing && (
                                    <div className="relative z-20 mt-[-20px] w-56 h-20 bg-[#FFD700] border-[5px] border-black rounded-3xl shadow-[0_10px_0_rgba(0,0,0,0.2)] flex justify-center items-start pt-2 overflow-hidden animate-bounce-slow" style={{ animationDelay: `${idx * 0.1}s` }}>
                                        <div className="w-28 h-8 bg-white border-[3px] border-black rounded-lg opacity-80" />
                                        <div className="absolute top-2 left-6 w-7 h-7 bg-white border-[3px] border-black rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                        <div className="absolute top-2 right-6 w-7 h-7 bg-white border-[3px] border-black rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                    </div>
                                )}
                                {!isFocusing && <div className="absolute -bottom-2 w-28 h-5 bg-black/10 blur-xl rounded-full" />}
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
                        <div className="flex flex-col items-center gap-4 py-2">
                            <div className="text-6xl font-black italic tracking-tighter text-black drop-shadow-[4px_4px_0_#85C1E9]">
                                {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
                            </div>
                            <button
                                onClick={toggleFocus}
                                className={`w-full max-w-sm py-4 border-[5px] border-black rounded-2xl font-black text-2xl active:translate-y-2 active:shadow-none transition-all ${isFocusing ? 'bg-[#FF6B6B] text-white shadow-[6px_6px_0_#444]' : 'bg-[#82E0AA] text-black shadow-[6px_6px_0_black]'}`}
                            >
                                {isFocusing ? t.stopFocus : t.startFocus}
                            </button>
                        </div>
                    )}

                    {activeTab === 'archives' && (
                        <div className="flex flex-col gap-4 pb-4">
                            <div className="flex justify-between items-center bg-gray-100 p-4 rounded-2xl border-[3px] border-black border-dashed">
                                <div className="flex flex-col">
                                    <span className="font-black text-sm uppercase">{currentLang === 'cn' ? '农场槽位状态' : 'FARM SLOTS'}</span>
                                    <span className="text-xs font-bold text-gray-500">{activePets.length} / {maxFarmSlots} {currentLang === 'cn' ? '占用中' : 'Occupied'}</span>
                                </div>
                                {maxFarmSlots < SLOT_UPGRADE_COSTS.length - 1 && (
                                    <button
                                        onClick={onUnlockSlot}
                                        className="flex items-center gap-2 bg-[#F8C471] px-4 py-2 rounded-xl border-[3px] border-black shadow-[3px_3px_0_black] active:shadow-none active:translate-y-1 transition-all"
                                    >
                                        <span className="font-black text-xs uppercase">{currentLang === 'cn' ? '解锁槽位' : 'UNLOCK'}</span>
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
                                        onClick={() => onToggleFarm(p.id)}
                                        className={`p-3 rounded-2xl flex items-center gap-3 cursor-pointer border-[4px] border-black shadow-[4px_4px_0_black] active:shadow-none active:translate-y-1 transition-all ${p.isAssignedToFarm ? 'bg-[#A8E6CF]' : 'bg-[#F9FAFB] hover:bg-yellow-50'
                                            }`}
                                    >
                                        <div className="w-14 h-14 bg-white border-[3px] border-black rounded-full overflow-hidden flex-shrink-0 flex justify-center items-center relative">
                                            {/* 🌟 核心修复 2：列表舱正确渲染 Avatar，并调整大小 */}
                                            <div className="absolute top-0 left-0 w-full h-full transform scale-[0.45] origin-top translate-y-1.5">
                                                <Avatar
                                                    selectedParts={p.selectedParts}
                                                    dominantStat={getDominantStat(calculateStats(p.selectedParts, p.stats))}
                                                    className="w-40 h-40"
                                                />
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
                        <div className="flex flex-col items-center justify-center h-full opacity-50">
                            <div className="w-16 h-16 mb-4 animate-bounce"><FarmIcons.Explore /></div>
                            <p className="font-black italic text-lg text-center">探险功能建造中...<br />吃饱了才能飞哦！</p>
                        </div>
                    )}
                </div>
            </footer>
        </div>
    );
};

const StatBar = ({ icon, value, color }: any) => (
    <div className="flex items-center gap-3 w-full">
        <div className="bg-white border-[3px] border-black p-1.5 rounded-xl shadow-[3px_3px_0_black] flex-shrink-0">
            {icon}
        </div>
        <div className="w-full max-w-[120px] h-5 bg-white border-[3px] border-black rounded-full overflow-hidden">
            <div className={`h-full ${color} transition-all duration-700 ease-out border-r-[2px] border-black`} style={{ width: `${value}%` }} />
        </div>
    </div>
);

const TabButton = ({ active, onClick, icon, color }: any) => (
    <button
        onClick={onClick}
        className={`w-[72px] h-[72px] rounded-[28px] border-[5px] border-black flex items-center justify-center transition-all ${active ? `${color} shadow-none translate-y-3` : `bg-white shadow-[0_12px_0_black] hover:translate-y-1 hover:shadow-[0_8px_0_black]`}`}
    >
        <div className={`transform transition-transform ${active ? 'scale-125' : 'scale-100'}`}>{icon}</div>
    </button>
);

const ShopItem = ({ name, price, icon, onBuy }: any) => (
    <div onClick={onBuy} className="bg-white border-[4px] border-black p-4 rounded-[24px] flex flex-col items-center gap-3 shadow-[6px_6px_0_black] cursor-pointer hover:bg-[#F9FAFB] active:translate-y-1 active:shadow-[2px_2px_0_black] transition-all">
        <div className="w-16 h-16 bg-[#F3F4F6] border-[3px] border-black rounded-full flex items-center justify-center">{icon}</div>
        <span className="font-black text-sm">{name}</span>
        <div className="flex items-center gap-1 bg-[#FFD700] px-3 py-1 rounded-lg border-[3px] border-black">
            <CarrotCoinIcon className="w-4 h-4" />
            <span className="text-sm font-black">{price}</span>
        </div>
    </div>
);