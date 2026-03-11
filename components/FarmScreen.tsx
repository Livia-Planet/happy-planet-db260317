import React, { useState, useEffect } from 'react';
import { Avatar } from './Avatar';
import { SpaceBackground } from './SpaceBackground';
import { CarrotCoinIcon } from './Icons';
import { Language, PassportData, ViewMode } from '../types';

// ==========================================
// 🎨 纯手绘多巴胺 SVG 图标库
// ==========================================
const FarmIcons = {
    // 饱食度：巧克力曲奇 (被咬了一口) 🍪
    Hunger: () => (
        <svg viewBox="0 0 24 24" fill="#D2691E" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10c0-1.33-.26-2.61-.73-3.77-.47-1.16-2.18-1.07-2.6.09-.44 1.23-1.8 1.94-3.08 1.57-1.28-.36-1.99-1.81-1.55-3.09.43-1.27-.47-2.73-1.8-2.73H12V2z" />
            {/* 巧克力碎 */}
            <circle cx="8" cy="8" r="1.2" fill="black" />
            <circle cx="15" cy="10" r="1.2" fill="black" />
            <circle cx="12" cy="15" r="1.2" fill="black" />
            <circle cx="7" cy="16" r="1.2" fill="black" />
        </svg>
    ),
    // 亲密度 (噗通跳动的爱心)
    Intimacy: () => (
        <svg viewBox="0 0 24 24" fill="#FF90E8" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
    ),
    // 房子图标 (返回首页)
    Home: ({ className }: { className?: string }) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    ),
    Focus: () => (
        <svg viewBox="0 0 24 24" fill="#85C1E9" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
            <circle cx="12" cy="13" r="8" fill="white" />
            <path d="M12 9v4l2 2" />
            <path d="M5 3L2 6" /><path d="M19 3l3 3" />
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
            <path d="M3 6l3.5 3.5M6 3l3.5 3.5" stroke="#82E0AA" strokeWidth="3" />
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
}

export const FarmScreen: React.FC<FarmScreenProps> = ({
    currentLang,
    carrotCoins,
    onUpdateCoins,
    savedPassports,
    onNavigate,
    playSound
}) => {
    const [activePet, setActivePet] = useState<PassportData | null>(null);
    const [selectedToClaim, setSelectedToClaim] = useState<PassportData | null>(null);
    const [activeTab, setActiveTab] = useState<'focus' | 'shop' | 'archives' | 'explore'>('focus');
    const [stats, setStats] = useState({ hunger: 80, intimacy: 30 });
    const [isFocusing, setIsFocusing] = useState(false);
    const [timeLeft, setTimeLeft] = useState(25 * 60);

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
        setStats(prev => ({ ...prev, intimacy: Math.min(100, prev.intimacy + 5) }));
    };

    const toggleFocus = () => {
        playSound?.('click');
        setIsFocusing(!isFocusing);
    };

    const handleClaim = (passport: PassportData) => {
        playSound?.('stamp');
        setActivePet(passport);
        setSelectedToClaim(null);
    };

    const handleBuyItem = (price: number, addHunger: number, addIntimacy: number) => {
        if (carrotCoins < price) {
            playSound?.('error');
            return;
        }
        playSound?.('coins');
        onUpdateCoins(-price);
        setStats(prev => ({
            hunger: Math.min(100, prev.hunger + addHunger),
            intimacy: Math.min(100, prev.intimacy + addIntimacy)
        }));
    };

    const t = {
        claimText: currentLang === 'cn' ? '档案室里有生命\n在等待被领养' : 'Waiting for you\nin Archives',
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
                <div className="flex flex-col gap-3">
                    <StatBar icon={<FarmIcons.Hunger />} value={stats.hunger} color="bg-[#D2691E]" />
                    <StatBar icon={<FarmIcons.Intimacy />} value={stats.intimacy} color="bg-[#FF90E8]" />
                </div>

                <div className="flex items-center gap-3">
                    {/* 经济显示：对齐 App.tsx 风格 */}
                    <div className="h-12 bg-white border-[3px] border-black px-4 rounded-xl shadow-[3px_3px_0_black] flex items-center gap-2">
                        <CarrotCoinIcon className="w-6 h-6" />
                        <span className="font-black text-xl mt-0.5">{carrotCoins}</span>
                    </div>
                    {/* 返回首页按钮：改为 House 图标，对齐 App.tsx 大小 */}
                    <button
                        onClick={() => { playSound?.('click'); onNavigate('start'); }}
                        className="w-12 h-12 bg-white border-[3px] border-black rounded-xl shadow-[3px_3px_0_black] flex items-center justify-center hover:translate-y-[1px] hover:shadow-[2px_2px_0_black] active:translate-y-[3px] active:shadow-none transition-all"
                    >
                        <FarmIcons.Home className="w-6 h-6" />
                    </button>
                </div>
            </header>

            {/* --- 核心交互区 --- */}
            <main className="relative z-10 flex-1 w-full flex flex-col items-center justify-center p-4">
                {activePet ? (
                    <div className="relative flex flex-col items-center">
                        <div className={`relative z-10 transform transition-all duration-300 ${isFocusing ? 'scale-[1.6] translate-y-4' : 'scale-[1.5] animate-float'}`}>
                            <Avatar data={activePet as any} size="xl" />
                        </div>
                        {isFocusing && (
                            <div className="relative z-20 mt-[-30px] w-64 h-24 bg-[#FFD700] border-[5px] border-black rounded-3xl shadow-[0_10px_0_rgba(0,0,0,0.2)] flex justify-center items-start pt-3 overflow-hidden animate-bounce-slow">
                                <div className="w-32 h-10 bg-white border-[3px] border-black rounded-lg opacity-80" />
                                <div className="absolute top-2 left-10 w-8 h-8 bg-white border-[3px] border-black rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                <div className="absolute top-2 right-10 w-8 h-8 bg-white border-[3px] border-black rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                            </div>
                        )}
                        {!isFocusing && <div className="absolute -bottom-2 w-32 h-6 bg-black/10 blur-xl rounded-full" />}
                    </div>
                ) : (
                    <div
                        onClick={() => { playSound?.('click'); setActiveTab('archives'); }}
                        className="w-56 h-56 border-[6px] border-dashed border-black/20 rounded-[50px] flex flex-col items-center justify-center cursor-pointer hover:bg-black/5 hover:border-black/40 transition-all group"
                    >
                        <div className="w-20 h-20 opacity-30 group-hover:scale-110 transition-transform mb-2">
                            <FarmIcons.Archives />
                        </div>
                        <p className="font-black text-black/40 text-center leading-tight whitespace-pre-line">{t.claimText}</p>
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
                        <div className="grid grid-cols-2 gap-4 pb-4">
                            {savedPassports && savedPassports.length > 0 ? savedPassports.map((p) => (
                                <div
                                    key={p.id}
                                    onClick={() => { playSound?.('click'); setSelectedToClaim(p); }}
                                    className="bg-[#F9FAFB] border-[4px] border-black p-3 rounded-2xl flex items-center gap-3 hover:bg-[#EAFFD0] transition-all cursor-pointer shadow-[4px_4px_0_black] active:shadow-none active:translate-y-1"
                                >
                                    <div className="w-14 h-14 bg-white border-[3px] border-black rounded-full overflow-hidden flex-shrink-0 flex justify-center items-center">
                                        <div className="scale-[0.5] translate-y-3"><Avatar data={p as any} size="sm" /></div>
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="font-black text-sm truncate">{p.starName}</span>
                                        <span className="text-[10px] font-bold opacity-40 uppercase">#{p.rarity || 'C'}</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-2 flex flex-col items-center justify-center py-8 opacity-40">
                                    <div className="w-12 h-12 mb-2"><FarmIcons.Archives /></div>
                                    <p className="font-black text-sm">{t.emptyArchive}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'shop' && (
                        <div className="grid grid-cols-2 gap-4">
                            <ShopItem name="元气曲奇" price={5} icon={<FarmIcons.Hunger />} onBuy={() => handleBuyItem(5, 20, 5)} />
                            <ShopItem name="星间奶昔" price={15} icon={<FarmIcons.MilkFood />} onBuy={() => handleBuyItem(15, 10, 20)} />
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

            {/* --- 弹出层：绝对居中认领界面 --- */}
            {selectedToClaim && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
                    <div className="bg-white border-[6px] border-black p-8 rounded-[40px] shadow-[15px_15px_0_black] w-full max-w-[320px] flex flex-col items-center animate-bounce-in">
                        <h3 className="font-black text-3xl mb-4 tracking-tighter uppercase">Claim Life</h3>
                        <div className="w-32 h-32 bg-[#EAFFD0] border-[5px] border-black rounded-[30px] mb-6 flex items-center justify-center overflow-hidden">
                            <div className="scale-[1.2] translate-y-4"><Avatar data={selectedToClaim as any} size="lg" /></div>
                        </div>
                        <p className="text-black/50 font-bold mb-8 text-center text-sm">
                            认领 <strong>{selectedToClaim.starName}</strong>，<br />它将正式入住你的丰饶农场！
                        </p>
                        <div className="flex gap-4 w-full">
                            <button
                                onClick={() => { playSound?.('click'); setSelectedToClaim(null); }}
                                className="flex-1 py-4 bg-gray-200 border-[4px] border-black rounded-2xl font-black text-xl shadow-[4px_4px_0_black] active:translate-y-1 active:shadow-none transition-all"
                            >
                                算了
                            </button>
                            <button
                                onClick={() => handleClaim(selectedToClaim)}
                                className="flex-1 py-4 bg-[#A8E6CF] border-[4px] border-black rounded-2xl font-black text-xl shadow-[4px_4px_0_black] active:translate-y-1 active:shadow-none transition-all"
                            >
                                认领!
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatBar = ({ icon, value, color }: any) => (
    <div className="flex items-center gap-3">
        <div className="bg-white border-[3px] border-black p-1.5 rounded-xl shadow-[3px_3px_0_black]">
            {icon}
        </div>
        <div className="w-28 h-5 bg-white border-[3px] border-black rounded-full overflow-hidden">
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