import React, { useState, useMemo, useEffect } from 'react';
import { Language, PassportData, ViewMode } from '../types';
import { Avatar } from './Avatar';
import { getDominantStat, calculateStats, MOCK_BOTTLES, generateMockNeighbors } from '../utils/gameLogic';

const SocialIcons = {
    // 👇 新增这个 CarrotCoin 局部图标
    CarrotCoin: ({ className = "w-6 h-6" }) => (
        <svg viewBox="0 0 24 24" fill="#FFA500" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M22.11 3.84a4.49 4.49 0 0 0-6.36 0l-9.9 9.9a2.12 2.12 0 0 0 0 3l3.35 3.35a2.12 2.12 0 0 0 3 0l9.91-9.91a4.49 4.49 0 0 0 0-6.34z" />
            <path d="M3 6l3.5 3.5M6 3l3.5 3.5M3 3l3.5 3.5" stroke="#82E0AA" strokeWidth="3" />
        </svg>
    ),
    StarSand: ({ className = "w-6 h-6" }) => (
        <svg viewBox="0 0 24 24" fill="#60EFFF" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6-6.2-4.5-6.2 4.5 2.4-7.6L2 9.6h7.6z" /><circle cx="12" cy="12" r="3" fill="white" />
        </svg>
    ),
    Bottle: ({ className = "w-8 h-8" }) => (
        <svg viewBox="0 0 24 24" fill="#E0F2FE" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M8 3h8v3l3 4v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V10l3-4V3z" /><path d="M8 3V2h8v1" /><path d="M5 10h14" opacity="0.4" />
            <path d="M12 12l1.5 3h3l-2.5 2 1 3-2.5-2-2.5 2 1-3-2.5-2h3z" fill="#FFD700" stroke="none" />
        </svg>
    ),
    CarePackage: ({ className = "w-6 h-6" }) => (
        <svg viewBox="0 0 24 24" fill="#FF90E8" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect x="3" y="8" width="18" height="13" rx="2" /><path d="M12 8v13" /><path d="M19 12H5" />
            <path d="M12 8c-2-3-5-2-5 0s5 2 5 2 5-1 5-2-3-3-5 0z" fill="#FFD700" />
        </svg>
    )
};

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
    currentLang, carrotCoins, starSand, onUpdateCoins, onUpdateStarSand, passports, playSound, onUpdatePassport
}) => {
    const [selectedNeighbor, setSelectedNeighbor] = useState<PassportData | null>(null);
    const [selectedBottle, setSelectedBottle] = useState<any | null>(null);

    const neighbors = useMemo(() => {
        const archivePets = passports.filter(p => !p.isAssignedToFarm);
        return [...archivePets, ...generateMockNeighbors()].slice(0, 5);
    }, [passports]);

    // 🌟 核心：漂流瓶物理引擎 (全自动边缘反弹)
    const [bottles, setBottles] = useState(() => MOCK_BOTTLES.map((b, i) => ({
        ...b,
        x: 20 + i * 30, // 初始X
        y: 30 + i * 20, // 初始Y
        vx: (Math.random() < 0.5 ? 1 : -1) * (0.04 + Math.random() * 0.05), // X轴速度
        vy: (Math.random() < 0.5 ? 1 : -1) * (0.04 + Math.random() * 0.05)  // Y轴速度
    })));

    useEffect(() => {
        let reqId: number;
        const updatePhysics = () => {
            setBottles(prev => prev.map(b => {
                let { x, y, vx, vy } = b;
                x += vx; y += vy;
                // 碰到边缘(5% 或 90%) 就反弹！
                if (x <= 5 || x >= 90) vx *= -1;
                if (y <= 5 || y >= 90) vy *= -1;
                return { ...b, x, y, vx, vy };
            }));
            reqId = requestAnimationFrame(updatePhysics);
        };
        reqId = requestAnimationFrame(updatePhysics);
        return () => cancelAnimationFrame(reqId);
    }, []);

    const getCoordinates = (index: number, total: number, radius: number) => {
        const angle = (index * (360 / total)) * (Math.PI / 180);
        return { x: 50 + radius * Math.cos(angle), y: 50 + radius * Math.sin(angle) };
    };

    const handleFeedNeighbor = () => {
        if (!selectedNeighbor) return;
        if (carrotCoins < 5) {
            playSound('error');
            alert(currentLang === 'cn' ? '胡萝卜币不够啦！' : 'Not enough carrots!');
            return;
        }
        playSound('success');
        onUpdateCoins(-5);
        onUpdateStarSand(10);

        if (!selectedNeighbor.id.startsWith('MOCK')) {
            const curHunger = selectedNeighbor.hunger ?? 80;
            onUpdatePassport(selectedNeighbor.id, 'hunger', Math.min(100, curHunger + 30));
        }
        setSelectedNeighbor(null);
    };

    const handleLikeBottle = () => {
        playSound('stamp');
        onUpdateStarSand(1);
        setSelectedBottle(null);
    };

    return (
        <div className="fixed inset-0 z-40 bg-[#0a0a12] overflow-hidden font-rounded select-none">
            {/* 雷达背景 */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-60">
                <div className="absolute w-[30vw] h-[30vw] rounded-full border-2 border-[#60EFFF] opacity-20" />
                <div className="absolute w-[60vw] h-[60vw] rounded-full border-2 border-[#60EFFF] opacity-20" />
                <div className="absolute w-[90vw] h-[90vw] rounded-full border-2 border-[#60EFFF] opacity-20" />
                <div className="absolute w-[100vw] h-[100vw] rounded-full radar-sweep pointer-events-none" />
                <div className="absolute w-full h-[2px] bg-[#60EFFF] opacity-20" />
                <div className="absolute h-full w-[2px] bg-[#60EFFF] opacity-20" />
            </div>

            {/* 顶部资产栏 (✅ 已移除重复的 Home 按钮) */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-50 pointer-events-none">
                <div className="flex flex-col gap-2 pointer-events-auto">
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 border-[3px] border-[#60EFFF] rounded-2xl flex items-center gap-2 shadow-[4px_4px_0_black]">
                        <SocialIcons.StarSand className="w-5 h-5" />
                        <span className="font-black text-xl text-white tracking-widest">{starSand}</span>
                        <span className="text-[10px] text-[#60EFFF] uppercase ml-1 block mt-1">{currentLang === 'cn' ? '友谊星砂' : 'STAR SAND'}</span>
                    </div>
                </div>
            </div>

            <div className="absolute inset-0 z-30">
                {/* 1. 静态邻居星球节点 */}
                {neighbors.map((neighbor, idx) => {
                    const pos = getCoordinates(idx, neighbors.length, 30);
                    return (
                        <div key={neighbor.id} onClick={() => { playSound('click'); setSelectedNeighbor(neighbor); }} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group hover:scale-110 transition-transform duration-300" style={{ left: `${pos.x}%`, top: `${pos.y}%`, animation: `float ${3 + idx}s ease-in-out infinite` }}>
                            <div className="w-16 h-16 bg-[#2c3e50] border-[3px] border-[#60EFFF] rounded-full overflow-hidden flex items-center justify-center relative shadow-[0_0_15px_rgba(96,239,255,0.4)] group-hover:shadow-[0_0_25px_rgba(96,239,255,0.8)]">
                                <div className="scale-[0.5] origin-center translate-y-3"><Avatar selectedParts={neighbor.selectedParts} dominantStat={getDominantStat(calculateStats(neighbor.selectedParts, neighbor.stats))} transparent /></div>
                                {(neighbor.hunger ?? 80) < 50 && (<div className="absolute -top-2 -right-2 bg-white rounded-full p-1 border-2 border-black animate-bounce"><SocialIcons.CarePackage className="w-4 h-4" /></div>)}
                            </div>
                            <span className="mt-2 bg-black/60 text-[#60EFFF] text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-[#60EFFF]/30 tracking-widest uppercase">{neighbor.name}</span>
                        </div>
                    );
                })}

                {/* 2. 🌟 动态弹跳的漂流瓶节点 */}
                {bottles.map((bottle) => (
                    <div
                        key={bottle.id}
                        onClick={() => { playSound('click'); setSelectedBottle(bottle); }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                        // 摒弃 CSS 动画，使用实时计算的坐标，营造真正的太空中漂流感
                        style={{ left: `${bottle.x}%`, top: `${bottle.y}%`, transition: 'left 0.1s linear, top 0.1s linear' }}
                    >
                        <div className="relative transform group-hover:scale-110 transition-transform" style={{ transform: `rotate(${bottle.vx * 300}deg)` }}>
                            <SocialIcons.Bottle className="w-10 h-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-black animate-ping" />
                        </div>
                    </div>
                ))}
            </div>

            {/* 弹窗 A：虫洞投喂 */}
            {selectedNeighbor && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
                    <div className="bg-[#fdfdf9] border-[5px] border-black rounded-[3rem] p-8 w-full max-w-sm shadow-[15px_15px_0_black] flex flex-col items-center animate-scale-in relative">
                        <button onClick={() => setSelectedNeighbor(null)} className="absolute top-4 right-6 text-4xl font-black text-gray-400 hover:text-black transition-colors">&times;</button>
                        <div className="w-24 h-24 bg-gray-100 border-[4px] border-black rounded-full overflow-hidden flex items-center justify-center shadow-inner mb-4">
                            <div className="scale-[0.7] origin-center translate-y-4"><Avatar selectedParts={selectedNeighbor.selectedParts} dominantStat={getDominantStat(calculateStats(selectedNeighbor.selectedParts, selectedNeighbor.stats))} transparent /></div>
                        </div>
                        <h3 className="font-black text-2xl uppercase tracking-widest">{selectedNeighbor.name}</h3>
                        <p className="font-bold text-gray-500 text-xs mb-6 uppercase">{currentLang === 'cn' ? '来自另一个档案室的居民' : 'Resident from another Archive'}</p>
                        <div className="w-full bg-gray-100 border-[3px] border-black border-dashed rounded-2xl p-4 mb-6">
                            <p className="font-black text-sm mb-2">{currentLang === 'cn' ? '肚子好饿哦...' : 'Feeling hungry...'}</p>
                            <div className="w-full h-4 bg-gray-300 rounded-full border-2 border-black overflow-hidden relative">
                                <div className="bg-[#D2691E] h-full transition-all duration-1000" style={{ width: `${selectedNeighbor.hunger ?? 40}%` }} />
                            </div>
                        </div>
                        <button onClick={handleFeedNeighbor} className="w-full bg-[#82E0AA] border-[4px] border-black py-4 rounded-2xl font-black text-lg shadow-[4px_4px_0_black] active:translate-y-1 active:shadow-none transition-all flex flex-col items-center gap-1 hover:bg-[#6EE7B7]">
                            <span className="uppercase tracking-widest">{currentLang === 'cn' ? '投喂关怀包裹' : 'SEND CARE PACKAGE'}</span>
                            <div className="flex items-center gap-4 text-[10px]">
                                <span className="flex items-center text-red-600"><SocialIcons.CarrotCoin className="w-3 h-3 mr-1" /> -5</span>
                                <span className="flex items-center text-blue-800"><SocialIcons.StarSand className="w-3 h-3 mr-1" /> +10</span>
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* 弹窗 B：星际漂流瓶 */}
            {selectedBottle && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
                    <div className="bg-white border-[5px] border-black rounded-[3rem] p-8 w-full max-w-sm shadow-[15px_15px_0_black] flex flex-col items-center animate-scale-in relative" style={{ backgroundImage: 'radial-gradient(#e0e0dc 1.2px, transparent 1.2px)', backgroundSize: '18px 18px' }}>
                        <button onClick={() => setSelectedBottle(null)} className="absolute top-4 right-6 text-4xl font-black text-gray-400 hover:text-black transition-colors">&times;</button>
                        <div className="bg-blue-100 text-blue-800 font-mono text-[10px] font-bold px-4 py-1 rounded-full border-2 border-black mb-6 uppercase tracking-[0.2em] shadow-sm">{selectedBottle.date}</div>
                        <h3 className="font-black font-hand text-3xl uppercase tracking-tighter text-center mb-4">{selectedBottle.title[currentLang]}</h3>
                        <p className="font-hand text-xl text-gray-700 text-center leading-relaxed mb-8 px-2">"{selectedBottle.content[currentLang]}"</p>
                        <div className="font-mono text-xs text-gray-400 uppercase tracking-widest mb-6">FROM: {selectedBottle.author}</div>
                        <button onClick={handleLikeBottle} className="w-full bg-[#FFD700] border-[4px] border-black py-4 rounded-2xl font-black text-lg shadow-[4px_4px_0_black] active:translate-y-1 active:shadow-none transition-all flex flex-col items-center gap-1 hover:bg-[#FACC15]">
                            <span className="uppercase tracking-widest">{currentLang === 'cn' ? '贴上鼓励星标' : 'STAMP WITH LOVE'}</span>
                            <div className="flex items-center gap-2 text-[10px] text-blue-800"><SocialIcons.StarSand className="w-3 h-3" /> +1</div>
                        </button>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes radar-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .radar-sweep { background: conic-gradient(from 0deg, transparent 70%, rgba(96, 239, 255, 0.1) 80%, rgba(96, 239, 255, 0.8) 100%); animation: radar-spin 4s linear infinite; }
            `}</style>
        </div>
    );
};