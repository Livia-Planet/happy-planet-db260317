import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { StoryEntry, Language } from '../types';
import { getStarDate } from '../utils/gameLogic';

/* ─────────────────────────────────────────────────────
   Props
   ───────────────────────────────────────────────────── */
const GALAXY_LOCK_KEY = 'happyPlanet_galaxyLocks';

interface StoryTabProps {
    stories: StoryEntry[];
    lang: Language;
    isFlipped: boolean;
    // 添加 savedText 参数
    onUpdateStories: (stories: StoryEntry[], savedText?: string) => void;
    /** 用于持久化星系锁状态 */
    selectedId?: string | null;
}

/* ─────────────────────────────────────────────────────
   9 大星系 — 差异化坐标 (波浪/大弧/折线/螺旋/菱形/十字/星团/双弧/皇冠)
   ───────────────────────────────────────────────────── */
interface Point { x: number; y: number; }

const PAGE_CONFIGS: { stars: Point[]; glowColor: string; glowRgb: string }[] = [
    { glowColor: '#FFD700', glowRgb: '255,215,0', stars: [{ x: 15, y: 50 }, { x: 30, y: 35 }, { x: 50, y: 50 }, { x: 70, y: 65 }, { x: 85, y: 50 }] }, // 0 波浪 5
    { glowColor: '#74C0FC', glowRgb: '116,192,252', stars: [{ x: 20, y: 70 }, { x: 35, y: 55 }, { x: 50, y: 45 }, { x: 65, y: 55 }, { x: 80, y: 70 }, { x: 70, y: 35 }, { x: 30, y: 35 }] }, // 1 大弧 7
    { glowColor: '#DA77F2', glowRgb: '218,119,242', stars: [{ x: 10, y: 20 }, { x: 30, y: 80 }, { x: 50, y: 25 }, { x: 70, y: 75 }, { x: 85, y: 30 }, { x: 90, y: 60 }] }, // 2 折线 6
    { glowColor: '#69DB7C', glowRgb: '105,219,124', stars: [{ x: 50, y: 50 }, { x: 65, y: 45 }, { x: 75, y: 55 }, { x: 70, y: 70 }, { x: 55, y: 75 }, { x: 40, y: 65 }, { x: 35, y: 48 }, { x: 48, y: 38 }] }, // 3 螺旋 8
    { glowColor: '#FF8787', glowRgb: '255,135,135', stars: [{ x: 50, y: 15 }, { x: 80, y: 50 }, { x: 50, y: 85 }, { x: 20, y: 50 }, { x: 50, y: 15 }] }, // 4 菱形 5
    { glowColor: '#FFD43B', glowRgb: '255,212,59', stars: [{ x: 50, y: 10 }, { x: 50, y: 90 }, { x: 50, y: 50 }, { x: 15, y: 50 }, { x: 85, y: 50 }] }, // 5 十字 5
    { glowColor: '#9775FA', glowRgb: '151,117,250', stars: [{ x: 25, y: 30 }, { x: 40, y: 25 }, { x: 55, y: 35 }, { x: 70, y: 28 }, { x: 75, y: 50 }, { x: 60, y: 65 }, { x: 35, y: 60 }, { x: 20, y: 50 }] }, // 6 星团 8
    { glowColor: '#4DABF7', glowRgb: '77,171,247', stars: [{ x: 15, y: 45 }, { x: 30, y: 30 }, { x: 50, y: 25 }, { x: 70, y: 30 }, { x: 85, y: 45 }, { x: 70, y: 70 }, { x: 30, y: 70 }] }, // 7 双弧 7
    { glowColor: '#FFA94D', glowRgb: '255,169,77', stars: [{ x: 50, y: 8 }, { x: 35, y: 28 }, { x: 20, y: 35 }, { x: 30, y: 55 }, { x: 25, y: 78 }, { x: 50, y: 68 }, { x: 75, y: 78 }, { x: 70, y: 55 }, { x: 80, y: 35 }, { x: 65, y: 28 }] }, // 8 皇冠 10
];

/** 星系名称：9 个，按 lang 动态显示 */
const GALAXY_TITLES: Record<Language, string>[] = [
    { se: 'URSPRUNGSGALAXEN', en: 'ORIGIN GALAXY', cn: '起源星系' },
    { se: 'MINNESBÄLTET', en: 'MEMORY BELT', cn: '记忆带' },
    { se: 'FRAMTIDSNEBULOSAN', en: 'FUTURE NEBULA', cn: '未来星云' },
    { se: 'SPIRALNEBULOSAN', en: 'SPIRAL NEBULA', cn: '螺旋星云' },
    { se: 'DIAMANTBELTET', en: 'DIAMOND BELT', cn: '钻石带' },
    { se: 'KORSNEBULOSAN', en: 'CROSS NEBULA', cn: '十字星云' },
    { se: 'STJÄRNKLUSTER', en: 'STAR CLUSTER', cn: '星团' },
    { se: 'DUBBELBÅGEN', en: 'DOUBLE ARC', cn: '双弧' },
    { se: 'KRONUNGEN', en: 'THE CROWN', cn: '皇冠' },
];

/** 引导语：按 lang 显示，不抢主标题风头 */
const GUIDANCE: Record<Language, string> = {
    cn: '点亮星星，记录下属于你的故事！',
    en: 'Light up the stars and record your own story!',
    se: 'Tänd stjärnorna och skriv din egen berättelse!',
};

/** 线条画风格锁头图标 */
const LockLineIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

/** 宇宙密码输入透明小框 */
const PASSWORD_PROMPT_LABEL: Record<Language, string> = {
    cn: '请输入宇宙密码',
    en: 'Enter universe password',
    se: 'Ange universums lösenord',
};

const PasswordPromptModal: React.FC<{
    lang: Language;
    isGalaxy: boolean;
    value: string;
    onChange: (v: string) => void;
    error: boolean;
    onSubmit: () => void;
    onClose: () => void;
}> = ({ lang, value, onChange, error, onSubmit, onClose }) => (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur border-2 border-gray-200 shadow-xl p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
            <p className="text-center font-hand text-lg text-gray-800 mb-4">{PASSWORD_PROMPT_LABEL[lang]}</p>
            <input
                type="password"
                value={value}
                onChange={e => onChange(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onSubmit()}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-livia-yellow focus:outline-none font-mono"
                placeholder="••••••"
                autoFocus
            />
            {error && <p className="mt-2 text-sm text-red-500 text-center">Wrong password</p>}
            <div className="mt-4 flex gap-3 justify-center">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border-2 border-gray-300 hover:bg-gray-100">Cancel</button>
                <button type="button" onClick={onSubmit} className="px-4 py-2 rounded-xl bg-livia-yellow border-2 border-black font-bold">OK</button>
            </div>
        </div>
    </div>
);

/** 由星系与星位生成唯一 id */
const storyId = (galaxyIndex: number, starIndex: number): string =>
    `${galaxyIndex}-${starIndex}`;

/** 生成跃迁用随机星系编码：GALAXY-字母+三位数字 */
const generateGalaxyCode = (): string => {
    const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const num = Math.floor(100 + Math.random() * 900);
    return `GALAXY-${letter}${num}`;
};

/** 音效占位钩子：后续接入 Audio API */
const playTransitionSound = (phase: 'start' | 'peak' | 'settle'): void => {
    const labels = { start: '超空间启动音"嗖——"', peak: '跃迁顶点音"嗡——"', settle: '定位成功音"咔哒"' };
    console.log(`[Galaxy Transition] ${phase}: ${labels[phase]}`);
};

/* ═════════════════════════════════════════════════════
   MAIN COMPONENT
   ═════════════════════════════════════════════════════ */
const TOTAL_PAGES = 9;
const LOCKED_STAR_COLOR = '#5B21B6'; // 暗紫色

export const StoryTab: React.FC<StoryTabProps> = ({
    stories,
    lang,
    isFlipped,
    onUpdateStories,
    selectedId,
}) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [editingIdx, setEditingIdx] = useState<number | null>(null);
    const [discoveryAnimating, setDiscoveryAnimating] = useState(false);
    const [discoveryFromPage, setDiscoveryFromPage] = useState<number | null>(null);
    /** 跃迁时显示的动态星系编码，如 GALAXY-X728 */
    const [transitionGalaxyCode, setTransitionGalaxyCode] = useState<string | null>(null);
    const [passwordPrompt, setPasswordPrompt] = useState<{ starIdx: number; isGalaxy: boolean } | null>(null);
    const [passwordInput, setPasswordInput] = useState('');
    const [passwordError, setPasswordError] = useState(false);

    /** 每页已点亮的星数：按 galaxyIndex 统计 */
    const filledCountByPage = useMemo(() => {
        const count: number[] = new Array(TOTAL_PAGES).fill(0);
        stories.forEach((s) => {
            if (s.galaxyIndex >= 0 && s.galaxyIndex < TOTAL_PAGES) count[s.galaxyIndex]++;
        });
        return count;
    }, [stories]);

    /* 已解锁到的最大页 (0~8)；全部点亮当前页后解锁下一页并触发发现动效 */
    const [maxUnlockedPage, setMaxUnlockedPage] = useState(0);
    const prevFilledRef = React.useRef<number[]>([]);
    const isFirstRunRef = React.useRef(true);
    const discoveryFromPageRef = React.useRef<number | null>(null);
    useEffect(() => {
        const prev = prevFilledRef.current;
        let nextMax = maxUnlockedPage;
        let triggerDiscovery = false;
        let fromPage: number | null = null;
        for (let p = 0; p < TOTAL_PAGES; p++) {
            const need = PAGE_CONFIGS[p].stars.length;
            const filled = filledCountByPage[p] ?? 0;
            const wasFilled = (prev[p] ?? 0) >= need;
            if (filled >= need) {
                if (p + 1 > nextMax && p + 1 <= TOTAL_PAGES) nextMax = p + 1;
                if (!wasFilled && !isFirstRunRef.current) {
                    triggerDiscovery = true;
                    fromPage = p;
                }
            } else break;
        }
        isFirstRunRef.current = false;
        prevFilledRef.current = [...filledCountByPage];
        if (nextMax > maxUnlockedPage) setMaxUnlockedPage(nextMax);
        if (triggerDiscovery && fromPage !== null) {
            discoveryFromPageRef.current = fromPage;
            setTransitionGalaxyCode(generateGalaxyCode());
            setDiscoveryAnimating(true);
            setDiscoveryFromPage(fromPage);
        }
    }, [filledCountByPage, maxUnlockedPage]);

    /* 跃迁时间线：约 0.8s，start → peak → settle，并注入音效钩子 */
    const TRANSITION_DURATION_MS = 800;
    const PEAK_MS = 260;
    const SETTLE_MS = 400;

    useEffect(() => {
        if (!discoveryAnimating) return;
        const fromPage = discoveryFromPageRef.current;

        playTransitionSound('start'); // 占位：超空间启动音"嗖——"

        const tPeak = setTimeout(() => {
            playTransitionSound('peak'); // 占位：跃迁顶点音"嗡——"
        }, PEAK_MS);

        const tSettle = setTimeout(() => {
            playTransitionSound('settle'); // 占位：定位成功音"咔哒"
            if (fromPage !== null && fromPage + 1 < TOTAL_PAGES) {
                setCurrentPage(fromPage + 1);
            }
        }, SETTLE_MS);

        const tEnd = setTimeout(() => {
            setDiscoveryAnimating(false);
            setDiscoveryFromPage(null);
            setTransitionGalaxyCode(null);
            discoveryFromPageRef.current = null;
        }, TRANSITION_DURATION_MS);

        return () => {
            clearTimeout(tPeak);
            clearTimeout(tSettle);
            clearTimeout(tEnd);
        };
    }, [discoveryAnimating]);

    /* 星系锁：每页独立 locked + password，持久化 */
    const galaxyLockKey = selectedId ? `${GALAXY_LOCK_KEY}_${selectedId}` : null;
    const [galaxyLocks, setGalaxyLocks] = useState<Record<number, { locked: boolean; password: string }>>({});
    useEffect(() => {
        if (!galaxyLockKey) return;
        try {
            const raw = localStorage.getItem(galaxyLockKey);
            const data = raw ? JSON.parse(raw) : {};
            setGalaxyLocks(data);
        } catch {
            setGalaxyLocks({});
        }
    }, [galaxyLockKey]);
    const persistGalaxyLocks = useCallback(
        (next: Record<number, { locked: boolean; password: string }>) => {
            setGalaxyLocks(next);
            if (galaxyLockKey) localStorage.setItem(galaxyLockKey, JSON.stringify(next));
        },
        [galaxyLockKey],
    );

    const cfg = PAGE_CONFIGS[currentPage];
    const activePage = currentPage;

    /** 按当前页 + 星位查找，严禁用数组下标 */
    const storyForStar = (starIdx: number): StoryEntry | undefined =>
        stories.find((s) => s.galaxyIndex === activePage && s.starIndex === starIdx);

    const isStarLocked = (starIdx: number): boolean => {
        const story = storyForStar(starIdx);
        const galaxy = galaxyLocks[currentPage];
        if (galaxy?.locked) return true;
        return !!(story?.isLocked && story?.password);
    };

    const openStar = (starIdx: number) => {
        const story = storyForStar(starIdx);
        const galaxy = galaxyLocks[currentPage];
        if (galaxy?.locked) {
            setPasswordPrompt({ starIdx, isGalaxy: true });
            setPasswordInput('');
            setPasswordError(false);
            return;
        }
        if (story?.isLocked && story?.password) {
            setPasswordPrompt({ starIdx, isGalaxy: false });
            setPasswordInput('');
            setPasswordError(false);
            return;
        }
        setEditingIdx(starIdx);
    };

    const submitPassword = () => {
        const galaxy = galaxyLocks[currentPage];
        if (passwordPrompt?.isGalaxy) {
            if (passwordInput === galaxy?.password) {
                persistGalaxyLocks({ ...galaxyLocks, [currentPage]: { locked: false, password: galaxy?.password || '' } });
                setPasswordPrompt(null);
                setEditingIdx(passwordPrompt.starIdx);
            } else {
                setPasswordError(true);
            }
            return;
        }
        const story = storyForStar(passwordPrompt!.starIdx);
        if (story && story.password === passwordInput) {
            setPasswordPrompt(null);
            setEditingIdx(passwordPrompt.starIdx);
        } else {
            setPasswordError(true);
        }
    };

    /** 保存/加锁：通过 galaxyIndex + starIndex 双重定位，确保改的是当前页当前星 */
    const handleSave = (
        title: Record<Language, string>,
        content: Record<Language, string>,
        lockPayload?: { isLocked: boolean; password: string },
    ) => {
        if (editingIdx === null) return;
        const targetStarIndex = editingIdx;
        const existing = stories.find((s) => s.galaxyIndex === activePage && s.starIndex === targetStarIndex);

        let next: StoryEntry[];
        if (existing) {
            next = stories.map((s) =>
                s.galaxyIndex === activePage && s.starIndex === targetStarIndex
                    ? { ...s, title, content, isLocked: lockPayload?.isLocked ?? s.isLocked, password: lockPayload?.password ?? s.password }
                    : s,
            );
        } else {
            const entry: StoryEntry = {
                id: storyId(activePage, targetStarIndex),
                date: getStarDate(),
                title,
                content,
                galaxyIndex: activePage,
                starIndex: targetStarIndex,
                isLocked: lockPayload?.isLocked,
                password: lockPayload?.password,
            };
            next = [...stories, entry];
        }
        // 把玩家写的故事传出去用于算法判定
        onUpdateStories(next, content[lang]); 
        setEditingIdx(null);
    };

    /** 删除：按 activePage + starIndex 查找并过滤，严禁用数组下标 */
    const handleDelete = () => {
        if (editingIdx === null) return;
        const targetStarIndex = editingIdx;
        const newStories = stories.filter(
            (s) => !(s.galaxyIndex === activePage && s.starIndex === targetStarIndex),
        );
        onUpdateStories(newStories);
        setEditingIdx(null);
    };

    const pathD = cfg.stars
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
        .join(' ');

    /** 当前编辑星在本页的展示序号 (1-based)，用于 Stellar Record No. */
    const recordNo = editingIdx !== null ? editingIdx + 1 : 0;

    const galaxyLock = galaxyLocks[currentPage];
    const isGalaxyLocked = !!galaxyLock?.locked;

    /* ═══════════════════ RENDER ══════════════════ */
    return (
        <div className="h-full w-full relative flex flex-col overflow-hidden select-none animate-fade-in">
            {/* ── 星系跃迁：动态编码 + 背景感应特效 (0.8s) ───── */}
            {discoveryAnimating && (
                <>
                    {/* 动态星系编码：右下角闪过，等宽+呼吸灯 */}
                    {transitionGalaxyCode && (
                        <div
                            className="absolute bottom-2 right-2 z-40 font-mono text-[8px] text-gray-500 animate-pulse pointer-events-none select-none"
                            style={{ animationDuration: '1.2s' }}
                        >
                            [ 正在定位: {transitionGalaxyCode} LOADING... ]
                        </div>
                    )}
                    {/* 深色模式：白洞爆发 — 中心白圆扩散 + blur 冲散旧星 */}
                    {isFlipped && (
                        <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center overflow-hidden">
                            <div
                                className="rounded-full bg-white blur-2xl"
                                style={{
                                    width: '100vmax',
                                    height: '100vmax',
                                    marginLeft: '-50vmax',
                                    marginTop: '-50vmax',
                                    animation: 'galaxy-burst-white-circle 0.8s ease-out forwards',
                                }}
                            />
                        </div>
                    )}
                    {/* 浅色模式：墨染收缩 — 深色核心扩散后淡出，新星系弹出 */}
                    {!isFlipped && (
                        <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center overflow-hidden">
                            <div
                                className="rounded-full bg-gray-900"
                                style={{
                                    width: '100vmax',
                                    height: '100vmax',
                                    marginLeft: '-50vmax',
                                    marginTop: '-50vmax',
                                    animation: 'galaxy-burst-dark-circle 0.8s ease-out forwards',
                                }}
                            />
                        </div>
                    )}
                </>
            )}

            {/* ── 1. HEADER ───── */}
            <div className="flex flex-col items-center justify-center text-center px-4 shrink-0 py-2">
                <h3
                    className={`
                        font-rounded font-black text-lg md:text-xl tracking-[0.18em] uppercase transition-colors duration-500
                        ${isFlipped ? 'text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.5)]' : 'text-gray-900'}
                    `}
                >
                    {GALAXY_TITLES[currentPage][lang]}
                </h3>
                <p className={`mt-1.5 text-[10px] font-hand text-center opacity-60 transition-colors duration-500 ${isFlipped ? 'text-gray-400' : 'text-gray-500'}`}>
                    {GUIDANCE[lang]}
                </p>
            </div>

            {/* ── 2. STARMAP（跃迁期间完全隐藏，避免重叠）───── */}
            <div
                className={`flex-1 min-h-0 w-full relative shrink-0 transition-opacity duration-150 ${discoveryAnimating ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                style={{ transitionDuration: discoveryAnimating ? '80ms' : '200ms' }}
            >
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
                    <path d={pathD} fill="none" className={`transition-all duration-700 ${isFlipped ? 'stroke-white/10' : 'stroke-gray-300/50'}`} strokeWidth="0.3" strokeDasharray="1.5 2" strokeLinecap="round" />
                </svg>
                {cfg.stars.map((pt, idx) => {
                    const story = storyForStar(idx);
                    const isFilled = !!story;
                    const locked = isStarLocked(idx);
                    const starColor = locked ? LOCKED_STAR_COLOR : (isFilled ? cfg.glowColor : undefined);
                    return (
                        <button
                            key={`${currentPage}-${idx}`}
                            onClick={() => openStar(idx)}
                            className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group cursor-pointer"
                            style={{ left: `${pt.x}%`, top: `${pt.y}%`, animation: discoveryAnimating ? undefined : (isFilled && !locked ? 'star-pop 0.4s ease-out' : undefined) }}
                        >
                            {isFilled && !locked && (
                                <span className="absolute inset-[-8px] rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${cfg.glowColor}40 0%, transparent 70%)`, animation: 'glow-breathe 3s ease-in-out infinite' }} />
                            )}
                            <span
                                className="text-4xl leading-none block transition-all duration-500 group-hover:scale-125 relative"
                                style={starColor ? { color: starColor, filter: locked ? 'none' : `drop-shadow(0 0 8px ${cfg.glowColor}99)` } : undefined}
                            >
                                {isFilled ? '★' : '☆'}
                                {locked && (
                                    <span className="absolute inset-0 flex items-center justify-center text-black opacity-90" style={{ width: '0.4em', height: '0.4em', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} aria-hidden>
                                        <LockLineIcon className="w-full h-full" />
                                    </span>
                                )}
                            </span>
                            {isFilled && story && (
                                <div className={`absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-lg font-hand text-[8px] z-40 pointer-events-none transition-all duration-300 opacity-80 group-hover:opacity-100 ${isFlipped ? 'bg-gray-800/80 text-gray-300' : 'bg-white/80 text-gray-600'}`}>
                                    <div className="font-mono text-[7px] opacity-50">{story.date}</div>
                                    <div className="font-bold truncate max-w-[80px] leading-tight">{story.title[lang] || '—'}</div>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ── 3. 分页 + 星系锁 ───── */}
            <div className="w-full flex items-center justify-center gap-3 shrink-0 py-3 pb-2 flex-wrap">
                <div className="flex items-center gap-2">
                    {PAGE_CONFIGS.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => i <= maxUnlockedPage && setCurrentPage(i)}
                            disabled={i > maxUnlockedPage}
                            className={`
                                transition-all duration-400 rounded-full
                                ${i > maxUnlockedPage ? 'opacity-40 cursor-not-allowed' : ''}
                                ${currentPage === i
                                    ? `w-10 h-3 ${isFlipped ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.7)]' : 'bg-livia-yellow border-2 border-black shadow-[2px_2px_0_black]'}`
                                    : `w-2.5 h-2.5 ${isFlipped ? 'bg-white/15 hover:bg-white/30' : 'bg-gray-200 hover:bg-gray-300'}`}
                            `}
                        />
                    ))}
                </div>
                <button
                    type="button"
                    onClick={() => {
                        if (isGalaxyLocked) {
                            persistGalaxyLocks({ ...galaxyLocks, [currentPage]: { locked: false, password: galaxyLock?.password || '' } });
                        } else {
                            const pwd = prompt(lang === 'cn' ? '设置宇宙大门密码' : lang === 'se' ? 'Ange universums portlösen' : 'Set universe gate password');
                            if (pwd != null) persistGalaxyLocks({ ...galaxyLocks, [currentPage]: { locked: true, password: pwd } });
                        }
                    }}
                    className={`p-2 rounded-lg border-2 transition-colors ${isGalaxyLocked ? 'border-violet-500 bg-violet-500/20 text-violet-700' : 'border-gray-300 text-gray-500 hover:border-gray-400'}`}
                    title={lang === 'cn' ? '星系锁' : 'Galaxy Lock'}
                >
                    <LockLineIcon className="w-4 h-4" />
                </button>
            </div>

            {/* 宇宙密码输入小框 */}
            {passwordPrompt !== null && (
                <PasswordPromptModal
                    lang={lang}
                    isGalaxy={passwordPrompt.isGalaxy}
                    value={passwordInput}
                    onChange={setPasswordInput}
                    error={passwordError}
                    onSubmit={submitPassword}
                    onClose={() => { setPasswordPrompt(null); setPasswordError(false); }}
                />
            )}

            {editingIdx !== null && (
                <StoryModal
                    story={storyForStar(editingIdx) ?? null}
                    lang={lang}
                    isNew={!storyForStar(editingIdx)}
                    recordNo={recordNo}
                    onClose={() => setEditingIdx(null)}
                    onSave={handleSave}
                    onDelete={handleDelete}
                />
            )}

            <style>{`
                @keyframes glow-breathe { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.15); } }
                @keyframes star-pop { 0% { opacity: 0; transform: scale(0.3); } 70% { transform: scale(1.15); } 100% { opacity: 1; transform: scale(1); } }
                /* 深色：白洞爆发 — 中心白圆 scale 扩散 + blur */
                @keyframes galaxy-burst-white-circle {
                    0% { opacity: 0; transform: scale(0); filter: blur(0); }
                    35% { opacity: 0.95; transform: scale(1.2); filter: blur(20px); }
                    100% { opacity: 0.98; transform: scale(1.5); filter: blur(32px); }
                }
                /* 浅色：墨染 — 深色核心扩散后淡出 */
                @keyframes galaxy-burst-dark-circle {
                    0% { opacity: 0; transform: scale(0); }
                    40% { opacity: 0.9; transform: scale(1.1); }
                    70% { opacity: 0.85; transform: scale(1.2); }
                    100% { opacity: 0; transform: scale(1.3); }
                }
            `}</style>
        </div>
    );
};

/* ═════════════════════════════════════════════════════
   MODAL — "航海日志" Floating Paper Design
   ═════════════════════════════════════════════════════ */
interface StoryModalProps {
    story: StoryEntry | null;
    lang: Language;
    isNew: boolean;
    recordNo: number;
    onClose: () => void;
    onSave: (t: Record<Language, string>, c: Record<Language, string>, lockPayload?: { isLocked: boolean; password: string }) => void;
    onDelete: () => void;
}

const StoryModal: React.FC<StoryModalProps> = ({
    story,
    lang,
    isNew,
    recordNo,
    onClose,
    onSave,
    onDelete,
}) => {
    const [title, setTitle] = useState<Record<Language, string>>(
        story?.title ?? { se: '', en: '', cn: '' },
    );
    const [content, setContent] = useState<Record<Language, string>>(
        story?.content ?? { se: '', en: '', cn: '' },
    );
    const [isLocked, setIsLocked] = useState(!!story?.isLocked);
    const [lockPassword, setLockPassword] = useState(story?.password ?? '');

    const starDate = story?.date ?? getStarDate();

    const TITLE_PH: Record<Language, string> = {
        cn: '给这段回忆起个标题…',
        en: 'Give this memory a title…',
        se: 'Ge detta minne en titel…',
    };
    const BODY_PH: Record<Language, string> = {
        cn: '在这里记录你的旅程…',
        en: 'Record your journey here…',
        se: 'Beskriv din resa här…',
    };
    const SAVE_LABEL: Record<Language, string> = {
        cn: '✦ 保存回忆',
        en: '✦ Save Story',
        se: '✦ Spara Minne',
    };
    const DEL_LABEL: Record<Language, string> = {
        cn: '移除',
        en: 'Delete',
        se: 'Ta bort',
    };
    const LOCK_LABEL: Record<Language, string> = {
        cn: '单篇加锁',
        en: 'Lock story',
        se: 'Lås berättelse',
    };

    const modalContent = (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in"
            aria-modal
            role="dialog"
        >
            {/* 全屏遮罩：点击关闭 */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-md"
                onClick={onClose}
            />

            {/* 图三复刻：居中编辑卡片 */}
            <div
                className="relative z-10 w-full max-w-[780px] max-h-[90vh] flex flex-col animate-scale-in overflow-hidden rounded-[50px] bg-[#FDFCF9] shadow-[25px_25px_0px_rgba(0,0,0,0.15)]"
                style={{
                    backgroundImage: 'radial-gradient(#e0e0dc 1.2px, transparent 1.2px)',
                    backgroundSize: '18px 18px',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Top Bar */}
                <div className="flex items-center justify-between px-10 pt-8 pb-2 shrink-0">
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gray-900 text-white font-mono text-xs font-bold tracking-widest select-none">
                        <span className="text-livia-yellow text-base">★</span>
                        {starDate}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-black text-5xl font-black leading-none transition-colors duration-200 hover:scale-110 -mt-2"
                    >
                        ×
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto px-10 md:px-14 pb-24 custom-scrollbar">
                    <div className="flex items-center gap-2 mt-4 mb-2">
                        <input
                            value={title[lang]}
                            onChange={(e) => setTitle({ ...title, [lang]: e.target.value })}
                            placeholder={TITLE_PH[lang]}
                            className="flex-1 bg-transparent border-none font-hand font-black text-3xl md:text-4xl uppercase tracking-tight focus:outline-none placeholder:text-gray-200 text-gray-900"
                        />
                        <button
                            type="button"
                            onClick={() => setIsLocked(!isLocked)}
                            className={`shrink-0 p-1.5 rounded-lg border-2 transition-colors ${isLocked ? 'border-violet-500 bg-violet-100 text-violet-700' : 'border-gray-300 text-gray-400 hover:border-gray-400'}`}
                            title={LOCK_LABEL[lang]}
                        >
                            <LockLineIcon className="w-5 h-5" />
                        </button>
                    </div>
                    {isLocked && (
                        <div className="flex items-center gap-2 mb-2">
                            <input
                                type="password"
                                value={lockPassword}
                                onChange={(e) => setLockPassword(e.target.value)}
                                placeholder={lang === 'cn' ? '密码' : lang === 'se' ? 'Lösenord' : 'Password'}
                                className="flex-1 max-w-[200px] px-3 py-2 rounded-lg border-2 border-gray-300 font-mono text-sm focus:outline-none focus:border-livia-yellow"
                            />
                        </div>
                    )}
                    <div className="border-t-[3px] border-dashed border-gray-300 my-4 mx-0" />
                    <textarea
                        value={content[lang]}
                        onChange={(e) => setContent({ ...content, [lang]: e.target.value })}
                        placeholder={BODY_PH[lang]}
                        className="w-full min-h-[260px] bg-transparent border-none font-hand text-xl md:text-2xl resize-none focus:outline-none placeholder:text-gray-200 text-gray-800"
                        style={{ lineHeight: '2.4' }}
                    />
                </div>

                {/* Footer 小字 */}
                <div className="flex items-center justify-between px-10 md:px-14 pb-4 pt-2 shrink-0">
                    <span className="font-mono text-[10px] text-gray-300 uppercase tracking-[0.2em] select-none">
                        Stellar Record No. {recordNo}
                    </span>
                    <span className="font-mono text-[10px] text-gray-300 uppercase tracking-[0.2em] select-none">
                        Happy Planet Exploration Corps
                    </span>
                </div>

                {/* 右下角亮黄色大贴纸 [Save] */}
                <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 flex items-center gap-3">
                    {!isNew && (
                        <button
                            onClick={onDelete}
                            className="px-5 py-2.5 rounded-xl border-2 border-gray-300 bg-white text-red-400 font-bold text-sm uppercase tracking-wider hover:bg-red-50 transition-all"
                        >
                            {DEL_LABEL[lang]}
                        </button>
                    )}
                    <button
                        id="btn-save-story" // <--- 必须加上这行 ID ！！！
                        onClick={() => onSave(title, content, { isLocked, password: isLocked ? lockPassword : '' })}
                        className="bg-[#FACC15] border-2 border-black font-black py-4 px-10 rounded-2xl text-lg md:text-xl uppercase tracking-widest shadow-[4px_4px_0_black] hover:scale-105 active:scale-100 transition-transform min-h-[52px]"
                    >
                        {SAVE_LABEL[lang]}
                    </button>
                </div>

                {/* 水印印章 */}
                <div
                    className="absolute bottom-12 right-12 pointer-events-none select-none opacity-[0.05]"
                    style={{ transform: 'rotate(12deg)' }}
                >
                    <div className="w-36 h-36 border-[6px] border-black rounded-full flex items-center justify-center font-black text-xs uppercase text-center leading-tight p-3">
                        Happy<br />Planet<br />Starlog
                    </div>
                </div>
            </div>
        </div>
    );

    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
