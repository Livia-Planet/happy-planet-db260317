import React, { useState, useMemo, useEffect } from 'react';
import { Language, PassportData, ViewMode, StoryEntry } from '../types';
import { Avatar } from './Avatar';
import { getDominantStat, calculateStats, MOCK_BOTTLES, generateMockNeighbors, getStarDate } from '../utils/gameLogic';
import { CarrotCoinIcon } from './Icons';
import { SpaceBackground } from './SpaceBackground';

const SocialIcons = {
    StarSand: ({ className = "w-6 h-6" }) => (
        <svg viewBox="0 0 24 24" fill="#60EFFF" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6-6.2-4.5-6.2 4.5 2.4-7.6L2 9.6h7.6z" /><circle cx="12" cy="12" r="3" fill="white" /></svg>
    ),
    Bottle: ({ className = "w-8 h-8" }) => (
        <svg viewBox="0 0 24 24" fill="#E0F2FE" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M8 3h8v3l3 4v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V10l3-4V3z" /><path d="M8 3V2h8v1" /><path d="M5 10h14" opacity="0.4" /><path d="M12 12l1.5 3h3l-2.5 2 1 3-2.5-2-2.5 2 1-3-2.5-2h3z" fill="#FFD700" stroke="none" /></svg>
    ),
    CarePackage: ({ className = "w-6 h-6" }) => (
        <svg viewBox="0 0 24 24" fill="#FF90E8" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="8" width="18" height="13" rx="2" /><path d="M12 8v13" /><path d="M19 12H5" /><path d="M12 8c-2-3-5-2-5 0s5 2 5 2 5-1 5-2-3-3-5 0z" fill="#FFD700" /></svg>
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
    // 🌟 新增：访客手帐确认弹窗
    const [stampPrompt, setStampPrompt] = useState<PassportData | null>(null);

    const [readBottles, setReadBottles] = useState<string[]>(() => {
        const saved = localStorage.getItem('happyPlanet_readBottles');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => { localStorage.setItem('happyPlanet_readBottles', JSON.stringify(readBottles)); }, [readBottles]);

    const visibleBottles = useMemo(() => MOCK_BOTTLES.filter(b => !readBottles.includes(b.id)), [readBottles]);

    const neighbors = useMemo(() => {
        const archivePets = passports.filter(p => !p.isAssignedToFarm);
        const mocks = generateMockNeighbors();
        return [...archivePets, ...mocks].slice(0, 5);
    }, [passports]);

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
            // 🌟 触发访客印章询问
            setStampPrompt(selectedNeighbor);
        }
        setSelectedNeighbor(null);
    };

    // 🌟 将事件写入邻居的手帐
    const handleWriteStamp = () => {
        if (!stampPrompt) return;
        playSound('stamp');

        const capacities = [5, 7, 6, 8, 5, 5, 8, 7, 10];
        let targetGalaxy = 0, targetStar = 0, found = false;
        const existingStories = stampPrompt.stories || [];

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
                title: { cn: '特别访客来啦！', en: 'Special Visitor!', se: 'Speciell Besökare!' },
                content: {
                    cn: `${visitorName} 驾驶飞船穿过星云来看我了！还给我带了胡萝卜关怀包裹，今天真的超级开心！`,
                    en: `${visitorName} flew through the nebula to visit! Brought carrots too!`,
                    se: `${visitorName} flög genom nebulosan på besök! Hade med morötter också!`
                },
                galaxyIndex: targetGalaxy,
                starIndex: targetStar,
                hasReceivedReward: true // 避免刷币
            };
            onUpdatePassport(stampPrompt.id, 'stories', [...existingStories, newStory]);
        }
        setStampPrompt(null);
    };

    const handleLikeBottle = () => {
        playSound('stamp');
        onUpdateStarSand(1);
        setReadBottles(prev => [...prev, selectedBottle.id]);
        setSelectedBottle(null);
    };

    return (
        <div className="fixed inset-0 z-40 bg-[#0a0a12] overflow-hidden font-rounded select-none">
            {/* 🌟 更炫酷深邃的雷达背景 */}
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

            <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-50 pointer-events-none">
                <div className="flex flex-col gap-2 pointer-events-auto">
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 border-[3px] border-[#60EFFF] rounded-2xl flex items-center gap-2 shadow-[4px_4px_0_black]">
                        <SocialIcons.StarSand className="w-5 h-5" />
                        <span className="font-black text-xl text-white tracking-widest">{starSand}</span>
                        <span className="text-[10px] text-[#60EFFF] uppercase ml-1 block mt-1">{currentLang === 'cn' ? '友谊星砂' : 'STAR SAND'}</span>
                    </div>
                </div>
                <button onClick={() => { playSound('click'); onNavigate('start'); }} className="w-12 h-12 bg-white border-[3px] border-black rounded-xl shadow-[3px_3px_0_black] flex items-center justify-center active:translate-y-[3px] active:shadow-none transition-all pointer-events-auto">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                </button>
            </div>

            <div className="absolute inset-0 z-30">
                {/* 1. 邻居星球 */}
                {neighbors.map((neighbor, idx) => {
                    const pos = getCoordinates(idx, neighbors.length, 30);
                    return (
                        <div key={neighbor.id} onClick={() => { playSound('click'); setSelectedNeighbor(neighbor); }} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group hover:scale-110 transition-transform duration-300" style={{ left: `${pos.x}%`, top: `${pos.y}%`, animation: `planet-float ${4 + idx}s ease-in-out infinite` }}>
                            <div className="w-16 h-16 bg-[#2c3e50] border-[3px] border-[#60EFFF] rounded-full overflow-hidden flex items-center justify-center relative shadow-[0_0_20px_rgba(96,239,255,0.4)] group-hover:shadow-[0_0_30px_rgba(96,239,255,0.9)]">
                                <div className="scale-[0.5] origin-center translate-y-3"><Avatar selectedParts={neighbor.selectedParts} dominantStat={getDominantStat(calculateStats(neighbor.selectedParts, neighbor.stats))} transparent /></div>
                                {(neighbor.hunger ?? 80) < 50 && (<div className="absolute -top-2 -right-2 bg-white rounded-full p-1 border-2 border-black animate-bounce"><SocialIcons.CarePackage className="w-4 h-4" /></div>)}
                            </div>
                            <span className="mt-2 bg-black/60 text-[#60EFFF] text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-[#60EFFF]/30 tracking-widest uppercase">{neighbor.name}</span>
                        </div>
                    );
                })}

                {/* 2. 🌟 纯 CSS 终极失重漂流瓶 */}
                {visibleBottles.map((bottle, idx) => {
                    return (
                        <div
                            key={bottle.id}
                            onClick={() => { playSound('click'); setSelectedBottle(bottle); }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                            style={{
                                left: '50%', top: '50%',
                                animation: `zero-g-drift-${idx % 3} ${20 + idx * 5}s linear infinite alternate`
                            }}
                        >
                            <div className="relative transform group-hover:scale-125 transition-transform" style={{ animation: `zero-g-spin ${10 + idx * 2}s linear infinite` }}>
                                <SocialIcons.Bottle className="w-10 h-10 drop-shadow-[0_0_15px_rgba(96,239,255,0.8)]" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full border-2 border-black animate-ping" />
                            </div>
                        </div>
                    );
                })}

                {visibleBottles.length === 0 && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-20 animate-fade-in flex flex-col items-center pointer-events-auto">
                        <button onClick={() => { playSound('camera'); setReadBottles([]); }} className="bg-transparent border-[3px] border-[#60EFFF] text-[#60EFFF] px-6 py-2 rounded-full font-black uppercase tracking-widest shadow-[0_0_15px_rgba(96,239,255,0.4)] hover:bg-[#60EFFF] hover:text-black transition-all">
                            {currentLang === 'cn' ? '重置星域缓存' : 'RESET SECTOR'}
                        </button>
                    </div>
                )}
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

            {/* 🌟 弹窗 A+：访客手帐询问 */}
            {stampPrompt && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
                    <div className="bg-[#FFFBEB] border-[5px] border-black rounded-[2rem] p-6 w-full max-w-xs shadow-[10px_10px_0_black] flex flex-col items-center animate-bounce-in relative">
                        <div className="w-16 h-16 bg-[#FFD700] rounded-full border-[3px] border-black flex items-center justify-center -mt-12 mb-4 shadow-[4px_4px_0_black]">
                            <span className="text-3xl">💌</span>
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
                .radar-sweep { background: conic-gradient(from 0deg, transparent 70%, rgba(96, 239, 255, 0.1) 80%, rgba(96, 239, 255, 0.5) 100%); animation: radar-spin 6s linear infinite; }
                @keyframes planet-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
                
                /* 失重漂浮系统：利用 translate 走大对角线交错，营造真正的无重力乱漂感 */
                @keyframes zero-g-drift-0 { 0% { transform: translate(-40vw, -40vh); } 100% { transform: translate(40vw, 30vh); } }
                @keyframes zero-g-drift-1 { 0% { transform: translate(35vw, -25vh); } 100% { transform: translate(-30vw, 40vh); } }
                @keyframes zero-g-drift-2 { 0% { transform: translate(-20vw, 35vh); } 100% { transform: translate(30vw, -40vh); } }
                
                /* 自转系统 */
                @keyframes zero-g-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};