import React, { useState, useRef } from 'react';
import { CharacterStats, Rarity } from '../types';
import { PARTS_DB, PLANET_PARTS_DB } from '../data/parts';
import { BASE_STATS } from '../utils/gameLogic';

// --- 纯 SVG 图标库 ---
const IconWand = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="m15 4 5 2" /><path d="m17.7 2.3-2.4 2.4" /><path d="m21.7 6.3-2.4 2.4" /><path d="m18 13-1.3-1.3" /><path d="M11.7 6.7 13 8" /><path d="m3 21 7-7" /><path d="M12.2 11.8 17.6 6.4" />
    </svg>
);
const IconClose = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
);
const IconCopy = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
);
const IconCheck = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const theme = {
    border: "border-[3px] border-black",
    shadow: "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
    active: "active:shadow-none active:translate-x-[2px] active:translate-y-[2px]",
    input: "bg-white border-[2px] border-black rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
};

// 统配 10 个槽位
const ALL_SLOTS = ['body', 'ears', 'face', 'hair', 'hair_b', 'access', 'base', 'surface', 'atmosphere', 'companion'] as const;

// 游戏逻辑设定
const RARITY_MAP: Rarity[] = ['C', 'U', 'R', 'E', 'L'];
const W_VALS = [0, 1, 3, 5, 7]; // 与 RARITY_MAP 对应
const TARGET_THRESHOLDS = { C: 0, U: 18, R: 35, E: 55, L: 75 };

export const DevTools: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ x: 24, y: window.innerHeight - 88 });
    const [isDragging, setIsDragging] = useState(false);
    const [config, setConfig] = useState({
        themeId: 'bobu',
        targetRarity: 'E' as Rarity,
        stats: { mod: 9, bus: 9, klurighet: 3 } as CharacterStats,
    });
    const [locked, setLocked] = useState<Record<string, string>>({});
    const [output, setOutput] = useState('');
    const [copied, setCopied] = useState(false);

    const dragRef = useRef({ startX: 0, startY: 0, startPos: { x: 0, y: 0 } });

    // --- 拖拽逻辑 ---
    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        dragRef.current = { startX: clientX, startY: clientY, startPos: { ...position } };
        setIsDragging(false);

        const onMouseMove = (moveEvent: MouseEvent | TouchEvent) => {
            const curX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
            const curY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
            const dx = curX - dragRef.current.startX;
            const dy = curY - dragRef.current.startY;
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) setIsDragging(true);

            setPosition({
                x: Math.min(Math.max(10, dragRef.current.startPos.x + dx), window.innerWidth - 74),
                y: Math.min(Math.max(10, dragRef.current.startPos.y + dy), window.innerHeight - 74)
            });
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('touchmove', onMouseMove);
            document.removeEventListener('touchend', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('touchmove', onMouseMove);
        document.addEventListener('touchend', onMouseUp);
    };

    // --- 核心：全局蓝图逆向推演算法 ---
    const solve = () => {
        // 1. 明确目标差值 (需减去主角出生自带的 1,1,1)
        const neededM = Math.max(0, config.stats.mod - BASE_STATS.mod);
        const neededB = Math.max(0, config.stats.bus - BASE_STATS.bus);
        const neededK = Math.max(0, config.stats.klurighet - BASE_STATS.klurighet);

        const statSum = config.stats.mod + config.stats.bus + config.stats.klurighet;
        let minScore = TARGET_THRESHOLDS[config.targetRarity];
        let neededW = Math.max(0, minScore - statSum);

        // 处理极品非酋 "Zero L" 特例
        let isZeroL = false;
        if (config.targetRarity === 'L' && statSum <= 3) {
            neededW = 0;
            isZeroL = true;
        }

        // 2. 初始化 10 个槽位的数据模型
        let slotsData = ALL_SLOTS.map(slot => {
            const pId = locked[slot];
            const isLocked = !!pId;
            const p = pId ? { ...PARTS_DB, ...PLANET_PARTS_DB }[pId] : null;

            const m = p ? p.stats.mod : 0;
            const b = p ? p.stats.bus : 0;
            const k = p ? p.stats.klurighet : 0;
            let wIdx = p ? RARITY_MAP.indexOf(p.rarity as Rarity) : 0;
            if (wIdx === -1) wIdx = 0;

            return { slot, pId, isLocked, m, b, k, wIdx, origM: m, origB: b, origK: k, origWIdx: wIdx };
        });

        // 3. 通用配平函数 (平摊或削减属性/稀有度)
        const balance = (prop: 'm' | 'b' | 'k', targetVal: number) => {
            // 增加缺失的属性
            while (slotsData.reduce((s, d) => s + d[prop], 0) < targetVal) {
                let candidates = slotsData.filter(d => !d.isLocked); // 优先给空槽位加属性
                if (candidates.length === 0) candidates = slotsData; // 如果全锁定了，强行改锁定的
                let c = candidates[Math.floor(Math.random() * candidates.length)];
                c[prop]++;
            }
            // 削减溢出的属性
            while (slotsData.reduce((s, d) => s + d[prop], 0) > targetVal) {
                let candidates = slotsData.filter(d => d[prop] > 0);
                if (candidates.length === 0) break;
                let c = candidates[Math.floor(Math.random() * candidates.length)];
                c[prop]--;
            }
        };

        // 执行属性配平
        balance('m', neededM);
        balance('b', neededB);
        balance('k', neededK);

        // 4. 稀有度权重 (W) 配平
        const currentW = () => slotsData.reduce((sum, d) => sum + W_VALS[d.wIdx], 0);

        // 如果权重不够，增加稀有度
        while (currentW() < neededW) {
            let candidates = slotsData.filter(d => d.wIdx < 4 && !d.isLocked);
            if (candidates.length === 0) candidates = slotsData.filter(d => d.wIdx < 4);
            if (candidates.length === 0) break; // 全 L 级了还是不够 (基本不可能)
            let c = candidates[Math.floor(Math.random() * candidates.length)];
            c.wIdx++;
        }

        // 如果权重溢出了 (可能会导致升到下一个等级)，智能削减稀有度
        while (currentW() > neededW) {
            let reduced = false;
            let candidates = slotsData.filter(d => d.wIdx > 0);
            // 随机挑选一个降级，前提是降级后不能低于 neededW
            for (let c of candidates.sort(() => Math.random() - 0.5)) {
                let curVal = W_VALS[c.wIdx];
                let nextVal = W_VALS[c.wIdx - 1];
                if (currentW() - (curVal - nextVal) >= neededW) {
                    c.wIdx--;
                    reduced = true;
                    break;
                }
            }
            if (!reduced) break; // 无法无损降级，保留当前结果
        }

        // 5. 生成精美的“开发小抄”
        let finalCode = `// === [ BLUEPRINT: ${config.themeId.toUpperCase()} ] ===\n`;
        finalCode += `// Target: [${config.targetRarity}] Class (Min Score: ${minScore})\n`;
        finalCode += `// Target Stats: Mod ${config.stats.mod}, Bus ${config.stats.bus}, Klu ${config.stats.klurighet} (Base included)\n`;
        finalCode += `// Required Rarity Weight: ${neededW} | Achieved: ${currentW()}\n`;
        if (isZeroL) finalCode += `// SPECIAL: ZERO LEGENDARY CONDITION MET!\n`;
        finalCode += `\n`;

        let lockedStr = `// --- LOCKED PARTS ANALYSIS ---\n`;
        let emptyStr = `// --- NEW PARTS TO CREATE ---\n`;

        slotsData.forEach(d => {
            const r = RARITY_MAP[d.wIdx];
            const origR = RARITY_MAP[d.origWIdx];
            const isZeroStats = (d.m === 0 && d.b === 0 && d.k === 0 && d.wIdx === 0);

            if (d.isLocked) {
                const changed = (d.m !== d.origM || d.b !== d.origB || d.k !== d.origK || d.wIdx !== d.origWIdx);
                if (changed) {
                    lockedStr += `// [${d.slot}] '${d.pId}' -> MODIFY THIS!\n`;
                    lockedStr += `//      Stats: (${d.origM},${d.origB},${d.origK}) -> Set to (${d.m},${d.b},${d.k})\n`;
                    lockedStr += `//      Rarity: [${origR}] -> Set to [${r}]\n`;
                } else {
                    lockedStr += `// [${d.slot}] '${d.pId}' -> Perfect as is. (${d.m},${d.b},${d.k}) [${r}]\n`;
                }
            } else {
                if (isZeroStats) {
                    // 如果算法判断这个槽位不需要贡献任何属性和稀有度，推荐使用 none
                    emptyStr += `// [${d.slot}] -> Recommendation: Leave Empty ('${d.slot}_none')\n`;
                } else {
                    const id = `${d.slot}_${config.themeId}`;
                    const imgKey = ['base', 'surface', 'atmosphere', 'companion'].includes(d.slot) ? 'main' : (d.slot === 'hair_b' ? 'back' : 'front');
                    emptyStr += `  '${id}': {\n    id: '${id}',\n    category: '${d.slot}',\n    name: '${config.themeId} ${d.slot}',\n    stats: stats(${d.m}, ${d.b}, ${d.k}),\n    rarity: '${r}',\n    images: { ${imgKey}: '/parts/${id}.png' }\n  },\n`;
                }
            }
        });

        setOutput(finalCode + lockedStr + '\n' + emptyStr);
        setCopied(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed z-[9999] select-none" style={{ left: position.x, top: position.y }}>
            <button
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
                onClick={() => !isDragging && setIsOpen(!isOpen)}
                className={`w-16 h-16 cursor-move flex items-center justify-center rounded-2xl bg-[#FFDE59] ${theme.border} ${theme.shadow} ${theme.active} transition-transform ${isDragging ? 'scale-90 rotate-12' : 'hover:scale-105'}`}
            >
                {isOpen ? <IconClose /> : <IconWand />}
            </button>

            {isOpen && (
                <div
                    className="absolute bg-[#F3F4F6] rounded-[32px] p-6 flex flex-col gap-5 animate-in slide-in-from-bottom-4 duration-300"
                    style={{
                        width: '420px',
                        maxHeight: '80vh',
                        overflowY: 'auto',
                        bottom: position.y > window.innerHeight / 2 ? '80px' : 'auto',
                        top: position.y > window.innerHeight / 2 ? 'auto' : '80px',
                        left: position.x > window.innerWidth / 2 ? 'auto' : '0px',
                        right: position.x > window.innerWidth / 2 ? '0px' : 'auto',
                        border: '3px solid black',
                        boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)'
                    }}
                    onMouseDown={e => e.stopPropagation()}
                >
                    <header className="flex justify-between items-center">
                        <h2 className="text-2xl font-black italic tracking-tight text-black">BLUEPRINT</h2>
                        <div className="px-3 py-1 bg-white border-2 border-black rounded-full text-[10px] font-bold uppercase">Solver V2</div>
                    </header>

                    <section className="space-y-3 bg-[#FF90E8] p-4 rounded-[24px] border-[3px] border-black">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-black px-1 uppercase">Theme ID</label>
                                <input className={theme.input} value={config.themeId} onChange={e => setConfig({ ...config, themeId: e.target.value })} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-black px-1 uppercase">Target Rarity</label>
                                <div className="flex bg-black p-1 rounded-xl gap-1">
                                    {(['C', 'U', 'R', 'E', 'L'] as Rarity[]).map(r => (
                                        <button key={r} onClick={() => setConfig({ ...config, targetRarity: r })}
                                            className={`flex-1 py-1 rounded-lg font-black text-sm ${config.targetRarity === r ? 'bg-yellow-400 text-black' : 'text-white hover:bg-white/20'}`}
                                        > {r} </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mt-2">
                            {(['mod', 'bus', 'klurighet'] as const).map(s => (
                                <div key={s} className="flex flex-col gap-1">
                                    <label className="text-[10px] font-black text-center uppercase">{s}</label>
                                    <input type="number" className={theme.input + " text-center"} value={config.stats[s]}
                                        onChange={e => setConfig({ ...config, stats: { ...config.stats, [s]: parseInt(e.target.value) || 0 } })} />
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="space-y-2">
                        <p className="text-xs font-black uppercase opacity-40 px-2">Current Asset Locks</p>
                        <div className="grid grid-cols-2 gap-2 font-bold">
                            {ALL_SLOTS.map(s => (
                                <div key={s} className="relative">
                                    <select className="w-full appearance-none bg-white border-2 border-black rounded-xl p-2 pr-6 text-[10px] outline-none"
                                        onChange={e => setLocked({ ...locked, [s]: e.target.value })}>
                                        <option value="">-- {s.toUpperCase()} --</option>
                                        {Object.values({ ...PARTS_DB, ...PLANET_PARTS_DB }).filter(p => p.category === s).map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-2 h-2 border-r-2 border-b-2 border-black rotate-45" />
                                </div>
                            ))}
                        </div>
                    </section>

                    <button onClick={solve}
                        className={`w-full py-4 bg-[#80CAFF] font-black text-xl border-[3px] border-black ${theme.shadow} ${theme.active} rounded-[20px] hover:bg-[#60A5FA]`}
                    > SOLVE BLUEPRINT! </button>

                    {output && (
                        <div className="relative animate-in zoom-in-95 duration-200 mt-2">
                            <pre className="text-[10px] bg-[#1E293B] text-[#10B981] p-4 rounded-[20px] overflow-x-auto max-h-[300px] font-mono leading-relaxed border-[3px] border-black whitespace-pre-wrap">
                                {output}
                            </pre>
                            <button
                                onClick={handleCopy}
                                className={`absolute top-3 right-3 ${copied ? 'bg-[#10B981]' : 'bg-[#FFDE59]'} p-2 rounded-xl border-2 border-black ${theme.active} flex items-center gap-1 font-black text-[10px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-colors`}
                            >
                                {copied ? <IconCheck /> : <IconCopy />} {copied ? 'COPIED' : 'COPY'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};