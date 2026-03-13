import React, { useState, useMemo, useEffect } from 'react';
import { Language, PassportData, ViewMode } from '../types';
import { Avatar } from './Avatar';
import { getDominantStat, calculateStats, MOCK_BOTTLES, generateMockNeighbors } from '../utils/gameLogic';

// --- 纯 SVG 图标库 (多巴胺粗线风格) ---
const SocialIcons = {
    Radar: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
            <path d="M12 2v20M2 12h20" opacity="0.3" />
            <circle cx="12" cy="12" r="10" />
            <path d="M12 12l8.5-8.5" stroke="#60EFFF" className="animate-spin origin-bottom-left" style={{ animationDuration: '4s' }} />
        </svg>
    ),
    StarSand: ({ className = "w-6 h-6" }) => (
        <svg viewBox="0 0 24 24" fill="#60EFFF" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6-6.2-4.5-6.2 4.5 2.4-7.6L2 9.6h7.6z" />
            <circle cx="12" cy="12" r="3" fill="white" />
        </svg>
    ),
    Bottle: ({ className = "w-8 h-8" }) => (
        <svg viewBox="0 0 24 24" fill="#E0F2FE" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M8 3h8v3l3 4v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V10l3-4V3z" />
            <path d="M8 3V2h8v1" />
            <path d="M5 10h14" opacity="0.4" />
            {/* 瓶子里的星星 */}
            <path d="M12 12l1.5 3h3l-2.5 2 1 3-2.5-2-2.5 2 1-3-2.5-2h3z" fill="#FFD700" stroke="none" />
        </svg>
    ),
    CarePackage: ({ className = "w-6 h-6" }) => (
        <svg viewBox="0 0 24 24" fill="#FF90E8" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect x="3" y="8" width="18" height="13" rx="2" />
            <path d="M12 8v13" />
            <path d="M19 12H5" />
            {/* 蝴蝶结 */}
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
    currentLang, carrotCoins, starSand, onUpdateCoins, onUpdateStarSand, passports, onNavigate, playSound, onUpdatePassport
}) => {
    const [selectedNeighbor, setSelectedNeighbor] = useState<PassportData | null>(null);
    const [selectedBottle, setSelectedBottle] = useState<any | null>(null);

    // 1. 组装邻居数据：优先使用玩家档案室里未出战的角色，不足则用 MOCK 数据补齐
    const neighbors = useMemo(() => {
        const archivePets = passports.filter(p => !p.isAssignedToFarm);
        const mocks = generateMockNeighbors();
        return [...archivePets, ...mocks].slice(0, 5); // 最多显示5个星球
    }, [passports]);

    // 给每个邻居和瓶子分配固定的伪随机坐标 (基于圆极坐标)
    const getCoordinates = (index: number, total: number, radius: number) => {
        const angle = (index * (360 / total)) * (Math.PI / 180);
        return {
            x: 50 + radius * Math.cos(angle),
            y: 50 + radius * Math.sin(angle)
        };
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
        onUpdateStarSand(10); // 投喂获得 10 星砂

        // 如果是真实玩家自己的档案角色，更新饥饿度
        if (!selectedNeighbor.id.startsWith('MOCK')) {
            const curHunger = selectedNeighbor.hunger ?? 80;
            onUpdatePassport(selectedNeighbor.id, 'hunger', Math.min(100, curHunger + 30));
        }
        setSelectedNeighbor(null);
    };

    const handleLikeBottle = () => {
        playSound('stamp');
        onUpdateStarSand(1); // 点赞获得 1 星砂
        setSelectedBottle(null);
    };

    return (
        <div className="fixed inset-0 z-40 bg-[#0a0a12] overflow-hidden font-rounded select-none">

            {/* --- 🌟 纯 CSS 雷达背景 --- */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-60">
                {/* 静态同心圆 */}
                <div className="absolute w-[30vw] h-[30vw] rounded-full border-2 border-[#60EFFF] opacity-20" />
                <div className="absolute w-[60vw] h-[60vw] rounded-full border-2 border-[#60EFFF] opacity-20" />
                <div className="absolute w-[90vw] h-[90vw] rounded-full border-2 border-[#60EFFF] opacity-20" />
                {/* 旋转扫描扇形 */}
                <div className="absolute w-[100vw] h-[100vw] rounded-full radar-sweep pointer-events-none" />
                {/* 坐标轴十字线 */}
                <div className="absolute w-full h-[2px] bg-[#60EFFF] opacity-20" />
                <div className="absolute h-full w-[2px] bg-[#60EFFF] opacity-20" />
            </div>

            {/* --- 顶部资产栏 --- */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-50 pointer-events-none">
                <div className="flex flex-col gap-2 pointer-events-auto">
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 border-[3px] border-[#60EFFF] rounded-2xl flex items-center gap-2 shadow-[4px_4px_0_black]">
                        <SocialIcons.StarSand className="w-5 h-5" />
                        <span className="font-black text-xl text-white tracking-widest">{starSand}</span>
                        <span className="text-[10px] text-[#60EFFF] uppercase ml-1 block mt-1">{currentLang === 'cn' ? '友谊星砂' : 'STAR SAND'}</span>
                    </div>
                    {/* 预留：未来兑换商店入口 */}
                    <button className="bg-[#60EFFF]/20 border-2 border-[#60EFFF] text-[#60EFFF] text-[10px] font-black py-1.5 rounded-xl uppercase tracking-widest hover:bg-[#60EFFF]/40 transition-colors">
                        {currentLang === 'cn' ? '神秘商店 (建造中)' : 'SECRET SHOP (WIP)'}
                    </button>
                </div>

                <button
                    onClick={() => { playSound('click'); onNavigate('start'); }}
                    className="w-12 h-12 bg-white border-[3px] border-black rounded-xl shadow-[3px_3px_0_black] flex items-center justify-center active:translate-y-[3px] active:shadow-none transition-all pointer-events-auto"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                </button>
            </div>

            {/* --- 交互图层：散布星球与漂流瓶 --- */}
            <div className="absolute inset-0 z-30">
                {/* 1. 邻居星球节点 */}
                {neighbors.map((neighbor, idx) => {
                    const pos = getCoordinates(idx, neighbors.length, 30); // 散布在内圈
                    return (
                        <div
                            key={neighbor.id}
                            onClick={() => { playSound('click'); setSelectedNeighbor(neighbor); }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group hover:scale-110 transition-transform duration-300"
                            style={{ left: `${pos.x}%`, top: `${pos.y}%`, animation: `float ${3 + idx}s ease-in-out infinite` }}
                        >
                            <div className="w-16 h-16 bg-[#2c3e50] border-[3px] border-[#60EFFF] rounded-full overflow-hidden flex items-center justify-center relative shadow-[0_0_15px_rgba(96,239,255,0.4)] group-hover:shadow-[0_0_25px_rgba(96,239,255,0.8)]">
                                <div className="scale-[0.5] origin-center translate-y-3">
                                    <Avatar selectedParts={neighbor.selectedParts} dominantStat={getDominantStat(calculateStats(neighbor.selectedParts, neighbor.stats))} transparent />
                                </div>
                                {/* 饥饿气泡提示 */}
                                {(neighbor.hunger ?? 80) < 50 && (
                                    <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 border-2 border-black animate-bounce">
                                        <SocialIcons.CarePackage className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                            <span className="mt-2 bg-black/60 text-[#60EFFF] text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-[#60EFFF]/30 tracking-widest uppercase">
                                {neighbor.name}
                            </span>
                        </div>
                    );
                })}

                {/* 2. 漂流瓶节点 */}
                {MOCK_BOTTLES.map((bottle, idx) => {
                    const pos = getCoordinates(idx, MOCK_BOTTLES.length, 42); // 散布在外圈
                    // 故意加一点偏移让它看起来更随机
                    pos.x += (idx % 2 === 0 ? 5 : -5);
                    return (
                        <div
                            key={bottle.id}
                            onClick={() => { playSound('click'); setSelectedBottle(bottle); }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group animate-float-slow"
                            style={{ left: `${pos.x}%`, top: `${pos.y}%`, animationDelay: `${idx}s` }}
                        >
                            <div className="relative">
                                <SocialIcons.Bottle className="w-10 h-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] group-hover:scale-110 transition-transform" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-black animate-ping" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* --- 弹窗 A：虫洞投喂 (Neighbor Modal) --- */}
            {selectedNeighbor && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
                    <div className="bg-[#fdfdf9] border-[5px] border-black rounded-[3rem] p-8 w-full max-w-sm shadow-[15px_15px_0_black] flex flex-col items-center animate-scale-in relative">
                        <button onClick={() => setSelectedNeighbor(null)} className="absolute top-4 right-6 text-4xl font-black text-gray-400 hover:text-black transition-colors">&times;</button>

                        <div className="w-24 h-24 bg-gray-100 border-[4px] border-black rounded-full overflow-hidden flex items-center justify-center shadow-inner mb-4">
                            <div className="scale-[0.7] origin-center translate-y-4">
                                <Avatar selectedParts={selectedNeighbor.selectedParts} dominantStat={getDominantStat(calculateStats(selectedNeighbor.selectedParts, selectedNeighbor.stats))} transparent />
                            </div>
                        </div>

                        <h3 className="font-black text-2xl uppercase tracking-widest">{selectedNeighbor.name}</h3>
                        <p className="font-bold text-gray-500 text-xs mb-6 uppercase">{currentLang === 'cn' ? '来自另一个档案室的居民' : 'Resident from another Archive'}</p>

                        <div className="w-full bg-gray-100 border-[3px] border-black border-dashed rounded-2xl p-4 mb-6">
                            <p className="font-black text-sm mb-2">{currentLang === 'cn' ? '肚子好饿哦...' : 'Feeling hungry...'}</p>
                            <div className="w-full h-4 bg-gray-300 rounded-full border-2 border-black overflow-hidden relative">
                                <div className="bg-[#D2691E] h-full transition-all duration-1000" style={{ width: `${selectedNeighbor.hunger ?? 40}%` }} />
                            </div>
                        </div>

                        <button
                            onClick={handleFeedNeighbor}
                            className="w-full bg-[#82E0AA] border-[4px] border-black py-4 rounded-2xl font-black text-lg shadow-[4px_4px_0_black] active:translate-y-1 active:shadow-none transition-all flex flex-col items-center gap-1 hover:bg-[#6EE7B7]"
                        >
                            <span className="uppercase tracking-widest">{currentLang === 'cn' ? '投喂关怀包裹' : 'SEND CARE PACKAGE'}</span>
                            <div className="flex items-center gap-4 text-[10px]">
                                <span className="flex items-center text-red-600"><CarrotCoinIcon className="w-3 h-3 mr-1" /> -5</span>
                                <span className="flex items-center text-blue-800"><SocialIcons.StarSand className="w-3 h-3 mr-1" /> +10</span>
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* --- 弹窗 B：星际漂流瓶 (Bottle Modal) --- */}
            {selectedBottle && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
                    <div className="bg-white border-[5px] border-black rounded-[3rem] p-8 w-full max-w-sm shadow-[15px_15px_0_black] flex flex-col items-center animate-scale-in relative"
                        style={{ backgroundImage: 'radial-gradient(#e0e0dc 1.2px, transparent 1.2px)', backgroundSize: '18px 18px' }}
                    >
                        <button onClick={() => setSelectedBottle(null)} className="absolute top-4 right-6 text-4xl font-black text-gray-400 hover:text-black transition-colors">&times;</button>

                        <div className="bg-blue-100 text-blue-800 font-mono text-[10px] font-bold px-4 py-1 rounded-full border-2 border-black mb-6 uppercase tracking-[0.2em] shadow-sm">
                            {selectedBottle.date}
                        </div>

                        <h3 className="font-black font-hand text-3xl uppercase tracking-tighter text-center mb-4">{selectedBottle.title[currentLang]}</h3>
                        <p className="font-hand text-xl text-gray-700 text-center leading-relaxed mb-8 px-2">"{selectedBottle.content[currentLang]}"</p>

                        <div className="font-mono text-xs text-gray-400 uppercase tracking-widest mb-6">
                            FROM: {selectedBottle.author}
                        </div>

                        <button
                            onClick={handleLikeBottle}
                            className="w-full bg-[#FFD700] border-[4px] border-black py-4 rounded-2xl font-black text-lg shadow-[4px_4px_0_black] active:translate-y-1 active:shadow-none transition-all flex flex-col items-center gap-1 hover:bg-[#FACC15]"
                        >
                            <span className="uppercase tracking-widest">{currentLang === 'cn' ? '贴上鼓励星标' : 'STAMP WITH LOVE'}</span>
                            <div className="flex items-center gap-2 text-[10px] text-blue-800">
                                <SocialIcons.StarSand className="w-3 h-3" /> +1
                            </div>
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes radar-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .radar-sweep { background: conic-gradient(from 0deg, transparent 70%, rgba(96, 239, 255, 0.1) 80%, rgba(96, 239, 255, 0.8) 100%); animation: radar-spin 4s linear infinite; }
                @keyframes float-slow { 0%, 100% { transform: translateY(0) rotate(-5deg); } 50% { transform: translateY(-10px) rotate(5deg); } }
                .animate-float-slow { animation: float-slow 4s ease-in-out infinite; }
            `}</style>
        </div>
    );
};