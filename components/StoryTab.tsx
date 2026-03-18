import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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
    onUpdateStories: (stories: StoryEntry[], savedText?: string) => void;
    selectedId?: string | null;
    onReward?: (amount: number, sourceId: string, currency?: 'carrot' | 'starSand') => void;
    onThrowBottle?: (title: Record<Language, string>, content: Record<Language, string>) => void;
}

// 🌟 本地 Heart 图标
const HeartIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="#FF90E8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

/* ─────────────────────────────────────────────────────
   9 大星系 — 差异化坐标
   ───────────────────────────────────────────────────── */
interface Point { x: number; y: number; }

const PAGE_CONFIGS: { stars: Point[]; glowColor: string; glowRgb: string }[] = [
    { glowColor: '#FFD700', glowRgb: '255,215,0', stars: [{ x: 15, y: 50 }, { x: 30, y: 35 }, { x: 50, y: 50 }, { x: 70, y: 65 }, { x: 85, y: 50 }] },
    { glowColor: '#74C0FC', glowRgb: '116,192,252', stars: [{ x: 20, y: 70 }, { x: 35, y: 55 }, { x: 50, y: 45 }, { x: 65, y: 55 }, { x: 80, y: 70 }, { x: 70, y: 35 }, { x: 30, y: 35 }] },
    { glowColor: '#DA77F2', glowRgb: '218,119,242', stars: [{ x: 10, y: 20 }, { x: 30, y: 80 }, { x: 50, y: 25 }, { x: 70, y: 75 }, { x: 85, y: 30 }, { x: 90, y: 60 }] },
    { glowColor: '#69DB7C', glowRgb: '105,219,124', stars: [{ x: 50, y: 50 }, { x: 65, y: 45 }, { x: 75, y: 55 }, { x: 70, y: 70 }, { x: 55, y: 75 }, { x: 40, y: 65 }, { x: 35, y: 48 }, { x: 48, y: 38 }] },
    { glowColor: '#FF8787', glowRgb: '255,135,135', stars: [{ x: 50, y: 15 }, { x: 80, y: 50 }, { x: 50, y: 85 }, { x: 20, y: 50 }, { x: 50, y: 15 }] },
    { glowColor: '#FFD43B', glowRgb: '255,212,59', stars: [{ x: 50, y: 10 }, { x: 50, y: 90 }, { x: 50, y: 50 }, { x: 15, y: 50 }, { x: 85, y: 50 }] },
    { glowColor: '#9775FA', glowRgb: '151,117,250', stars: [{ x: 25, y: 30 }, { x: 40, y: 25 }, { x: 55, y: 35 }, { x: 70, y: 28 }, { x: 75, y: 50 }, { x: 60, y: 65 }, { x: 35, y: 60 }, { x: 20, y: 50 }] },
    { glowColor: '#4DABF7', glowRgb: '77,171,247', stars: [{ x: 15, y: 45 }, { x: 30, y: 30 }, { x: 50, y: 25 }, { x: 70, y: 30 }, { x: 85, y: 45 }, { x: 70, y: 70 }, { x: 30, y: 70 }] },
    { glowColor: '#FFA94D', glowRgb: '255,169,77', stars: [{ x: 50, y: 8 }, { x: 35, y: 28 }, { x: 20, y: 35 }, { x: 30, y: 55 }, { x: 25, y: 78 }, { x: 50, y: 68 }, { x: 75, y: 78 }, { x: 70, y: 55 }, { x: 80, y: 35 }, { x: 65, y: 28 }] },
];

const GALAXY_TITLES: Record<Language, string>[] = [
    { se: 'URSPRUNGSGALAXEN', en: 'ORIGIN GALAXY', cn: '起源星系' }, { se: 'MINNESBÄLTET', en: 'MEMORY BELT', cn: '记忆带' }, { se: 'FRAMTIDSNEBULOSAN', en: 'FUTURE NEBULA', cn: '未来星云' }, { se: 'SPIRALNEBULOSAN', en: 'SPIRAL NEBULA', cn: '螺旋星云' }, { se: 'DIAMANTBELTET', en: 'DIAMOND BELT', cn: '钻石带' }, { se: 'KORSNEBULOSAN', en: 'CROSS NEBULA', cn: '十字星云' }, { se: 'STJÄRNKLUSTER', en: 'STAR CLUSTER', cn: '星团' }, { se: 'DUBBELBÅGEN', en: 'DOUBLE ARC', cn: '双弧' }, { se: 'KRONUNGEN', en: 'THE CROWN', cn: '皇冠' },
];

const GUIDANCE: Record<Language, string> = {
    cn: '点亮星星，记录下属于你的故事！', en: 'Light up the stars and record your own story!', se: 'Tänd stjärnorna och skriv din egen berättelse!',
};

const LockLineIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const PASSWORD_PROMPT_LABEL: Record<Language, string> = { cn: '请输入宇宙密码', en: 'Enter universe password', se: 'Ange universums lösenord' };

const PasswordPromptModal: React.FC<{ lang: Language; isGalaxy: boolean; value: string; onChange: (v: string) => void; error: boolean; onSubmit: () => void; onClose: () => void; }> = ({ lang, value, onChange, error, onSubmit, onClose }) => (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur border-2 border-gray-200 shadow-xl p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
            <p className="text-center font-hand text-lg text-gray-800 mb-4">{PASSWORD_PROMPT_LABEL[lang]}</p>
            <input type="password" value={value} onChange={e => onChange(e.target.value)} onKeyDown={e => e.key === 'Enter' && onSubmit()} className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-livia-yellow focus:outline-none font-mono" placeholder="••••••" autoFocus />
            {error && <p className="mt-2 text-sm text-red-500 text-center">Wrong password</p>}
            <div className="mt-4 flex gap-3 justify-center">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border-2 border-gray-300 hover:bg-gray-100">Cancel</button>
                <button type="button" onClick={onSubmit} className="px-4 py-2 rounded-xl bg-livia-yellow border-2 border-black font-bold">OK</button>
            </div>
        </div>
    </div>
);

const storyId = (galaxyIndex: number, starIndex: number): string => `${galaxyIndex}-${starIndex}`;

const generateGalaxyCode = (): string => {
    const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const num = Math.floor(100 + Math.random() * 900);
    return `GALAXY-${letter}${num}`;
};

const playTransitionSound = (phase: 'start' | 'peak' | 'settle'): void => { };

const TOTAL_PAGES = 9;
const LOCKED_STAR_COLOR = '#5B21B6';

export const StoryTab: React.FC<StoryTabProps> = ({ stories, lang, isFlipped, onUpdateStories, selectedId, onReward, onThrowBottle }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [editingIdx, setEditingIdx] = useState<number | null>(null);
    const [discoveryAnimating, setDiscoveryAnimating] = useState(false);
    const [discoveryFromPage, setDiscoveryFromPage] = useState<number | null>(null);
    const [transitionGalaxyCode, setTransitionGalaxyCode] = useState<string | null>(null);
    const [passwordPrompt, setPasswordPrompt] = useState<{ starIdx: number; isGalaxy: boolean } | null>(null);
    const [passwordInput, setPasswordInput] = useState('');
    const [passwordError, setPasswordError] = useState(false);

    const filledCountByPage = useMemo(() => {
        const count: number[] = new Array(TOTAL_PAGES).fill(0);
        stories.forEach((s) => { if (s.galaxyIndex >= 0 && s.galaxyIndex < TOTAL_PAGES) count[s.galaxyIndex]++; });
        return count;
    }, [stories]);

    const [maxUnlockedPage, setMaxUnlockedPage] = useState(0);
    const prevFilledRef = useRef<number[]>([]);
    const isFirstRunRef = useRef(true);
    const discoveryFromPageRef = useRef<number | null>(null);

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
                if (!wasFilled && !isFirstRunRef.current) { triggerDiscovery = true; fromPage = p; }
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

    const TRANSITION_DURATION_MS = 800;
    const PEAK_MS = 260;
    const SETTLE_MS = 400;

    useEffect(() => {
        if (!discoveryAnimating) return;
        const fromPage = discoveryFromPageRef.current;
        playTransitionSound('start');
        const tPeak = setTimeout(() => { playTransitionSound('peak'); }, PEAK_MS);
        const tSettle = setTimeout(() => { playTransitionSound('settle'); if (fromPage !== null && fromPage + 1 < TOTAL_PAGES) { setCurrentPage(fromPage + 1); } }, SETTLE_MS);
        const tEnd = setTimeout(() => { setDiscoveryAnimating(false); setDiscoveryFromPage(null); setTransitionGalaxyCode(null); discoveryFromPageRef.current = null; }, TRANSITION_DURATION_MS);
        return () => { clearTimeout(tPeak); clearTimeout(tSettle); clearTimeout(tEnd); };
    }, [discoveryAnimating]);

    const galaxyLockKey = selectedId ? `${GALAXY_LOCK_KEY}_${selectedId}` : null;
    const [galaxyLocks, setGalaxyLocks] = useState<Record<number, { locked: boolean; password: string }>>({});
    useEffect(() => {
        if (!galaxyLockKey) return;
        try { const raw = localStorage.getItem(galaxyLockKey); const data = raw ? JSON.parse(raw) : {}; setGalaxyLocks(data); } catch { setGalaxyLocks({}); }
    }, [galaxyLockKey]);

    const persistGalaxyLocks = useCallback((next: Record<number, { locked: boolean; password: string }>) => {
        setGalaxyLocks(next);
        if (galaxyLockKey) localStorage.setItem(galaxyLockKey, JSON.stringify(next));
    }, [galaxyLockKey]);

    const cfg = PAGE_CONFIGS[currentPage];
    const activePage = currentPage;

    const storyForStar = (starIdx: number): StoryEntry | undefined => stories.find((s) => s.galaxyIndex === activePage && s.starIndex === starIdx);

    const isStarLocked = (starIdx: number): boolean => {
        const story = storyForStar(starIdx);
        const galaxy = galaxyLocks[currentPage];
        if (galaxy?.locked) return true;
        return !!(story?.isLocked && story?.password);
    };

    const openStar = (starIdx: number) => {
        const story = storyForStar(starIdx);
        const galaxy = galaxyLocks[currentPage];
        if (galaxy?.locked) { setPasswordPrompt({ starIdx, isGalaxy: true }); setPasswordInput(''); setPasswordError(false); return; }
        if (story?.isLocked && story?.password) { setPasswordPrompt({ starIdx, isGalaxy: false }); setPasswordInput(''); setPasswordError(false); return; }
        setEditingIdx(starIdx);
    };

    const submitPassword = () => {
        const galaxy = galaxyLocks[currentPage];
        if (passwordPrompt?.isGalaxy) {
            if (passwordInput === galaxy?.password) {
                persistGalaxyLocks({ ...galaxyLocks, [currentPage]: { locked: false, password: galaxy?.password || '' } });
                setPasswordPrompt(null); setEditingIdx(passwordPrompt.starIdx);
            } else { setPasswordError(true); }
            return;
        }
        const story = storyForStar(passwordPrompt!.starIdx);
        if (story && story.password === passwordInput) {
            setPasswordPrompt(null); setEditingIdx(passwordPrompt.starIdx);
        } else { setPasswordError(true); }
    };

    const handleSave = (title: Record<Language, string>, content: Record<Language, string>, lockPayload?: { isLocked: boolean; password: string }) => {
        if (editingIdx === null) return;
        const targetStarIndex = editingIdx;
        const existing = stories.find((s) => s.galaxyIndex === activePage && s.starIndex === targetStarIndex);

        let next: StoryEntry[];
        if (existing) {
            next = stories.map((s) => s.galaxyIndex === activePage && s.starIndex === targetStarIndex ? { ...s, title, content, isLocked: lockPayload?.isLocked ?? s.isLocked, password: lockPayload?.password ?? s.password } : s);
        } else {
            const entry: StoryEntry = { id: storyId(activePage, targetStarIndex), date: getStarDate(), title, content, galaxyIndex: activePage, starIndex: targetStarIndex, isLocked: lockPayload?.isLocked, password: lockPayload?.password, likes: 0, comments: [] };
            next = [...stories, entry];
        }
        onUpdateStories(next, content[lang]);
        setEditingIdx(null);
    };

    const handleDelete = () => {
        if (editingIdx === null) return;
        const targetStarIndex = editingIdx;
        const newStories = stories.filter((s) => !(s.galaxyIndex === activePage && s.starIndex === targetStarIndex));
        onUpdateStories(newStories);
        setEditingIdx(null);
    };

    const pathD = cfg.stars.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const recordNo = editingIdx !== null ? editingIdx + 1 : 0;
    const galaxyLock = galaxyLocks[currentPage];
    const isGalaxyLocked = !!galaxyLock?.locked;

    return (
        <div className="h-full w-full relative flex flex-col overflow-hidden select-none animate-fade-in">
            {discoveryAnimating && (
                <>
                    {transitionGalaxyCode && (
                        <div className="absolute bottom-2 right-2 z-40 font-mono text-[8px] text-gray-500 animate-pulse pointer-events-none select-none" style={{ animationDuration: '1.2s' }}>
                            [ 正在定位: {transitionGalaxyCode} LOADING... ]
                        </div>
                    )}
                    {isFlipped ? (
                        <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center overflow-hidden">
                            <div className="rounded-full bg-white blur-2xl" style={{ width: '100vmax', height: '100vmax', marginLeft: '-50vmax', marginTop: '-50vmax', animation: 'galaxy-burst-white-circle 0.8s ease-out forwards' }} />
                        </div>
                    ) : (
                        <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center overflow-hidden">
                            <div className="rounded-full bg-gray-900" style={{ width: '100vmax', height: '100vmax', marginLeft: '-50vmax', marginTop: '-50vmax', animation: 'galaxy-burst-dark-circle 0.8s ease-out forwards' }} />
                        </div>
                    )}
                </>
            )}

            <div className="flex flex-col items-center justify-center text-center px-4 shrink-0 py-2">
                <h3 className={`font-rounded font-black text-lg md:text-xl tracking-[0.18em] uppercase transition-colors duration-500 ${isFlipped ? 'text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.5)]' : 'text-gray-900'}`}>
                    {GALAXY_TITLES[currentPage][lang]}
                </h3>
                <p className={`mt-1.5 text-[10px] font-hand text-center opacity-60 transition-colors duration-500 ${isFlipped ? 'text-gray-400' : 'text-gray-500'}`}>
                    {GUIDANCE[lang]}
                </p>
            </div>

            <div className={`flex-1 min-h-0 w-full relative shrink-0 transition-opacity duration-150 ${discoveryAnimating ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} style={{ transitionDuration: discoveryAnimating ? '80ms' : '200ms' }}>
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
                    <path d={pathD} fill="none" className={`transition-all duration-700 ${isFlipped ? 'stroke-white/10' : 'stroke-gray-300/50'}`} strokeWidth="0.3" strokeDasharray="1.5 2" strokeLinecap="round" />
                </svg>
                {cfg.stars.map((pt, idx) => {
                    const story = storyForStar(idx);
                    const isFilled = !!story;
                    const locked = isStarLocked(idx);
                    const starColor = locked ? LOCKED_STAR_COLOR : (isFilled ? cfg.glowColor : undefined);

                    // 🌟 点赞动效等级判定
                    const likes = story?.likes || 0;
                    const hasLikes = likes > 0;
                    const likeLevel = likes >= 100 ? 'intense' : (hasLikes ? 'gentle' : 'none');

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
                            <span className="text-4xl leading-none block transition-all duration-500 group-hover:scale-125 relative" style={starColor ? { color: starColor, filter: locked ? 'none' : `drop-shadow(0 0 8px ${cfg.glowColor}99)` } : undefined}>
                                {isFilled ? '★' : '☆'}
                                {locked && (
                                    <span className="absolute inset-0 flex items-center justify-center text-black opacity-90" style={{ width: '0.4em', height: '0.4em', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} aria-hidden>
                                        <LockLineIcon className="w-full h-full" />
                                    </span>
                                )}
                            </span>

                            {/* 🌟 心跳光晕徽章挂载点 */}
                            {hasLikes && (
                                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 flex items-center justify-center gap-0.5 z-50 pointer-events-none like-badge ${likeLevel}`}>
                                    <HeartIcon className="w-3 h-3 heart-icon drop-shadow-md text-white" />
                                    <span className="font-hand font-black text-[10px] text-[#FF90E8] drop-shadow-md like-count">{likes}</span>
                                </div>
                            )}

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

            <div className="w-full flex items-center justify-center gap-3 shrink-0 py-3 pb-2 flex-wrap">
                <div className="flex items-center gap-2">
                    {PAGE_CONFIGS.map((_, i) => (
                        <button key={i} onClick={() => i <= maxUnlockedPage && setCurrentPage(i)} disabled={i > maxUnlockedPage} className={`transition-all duration-400 rounded-full ${i > maxUnlockedPage ? 'opacity-40 cursor-not-allowed' : ''} ${currentPage === i ? `w-10 h-3 ${isFlipped ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.7)]' : 'bg-livia-yellow border-2 border-black shadow-[2px_2px_0_black]'}` : `w-2.5 h-2.5 ${isFlipped ? 'bg-white/15 hover:bg-white/30' : 'bg-gray-200 hover:bg-gray-300'}`}`} />
                    ))}
                </div>
                <button type="button" onClick={() => { if (isGalaxyLocked) { persistGalaxyLocks({ ...galaxyLocks, [currentPage]: { locked: false, password: galaxyLock?.password || '' } }); } else { const pwd = prompt(lang === 'cn' ? '设置宇宙大门密码' : lang === 'se' ? 'Ange universums portlösen' : 'Set universe gate password'); if (pwd != null) persistGalaxyLocks({ ...galaxyLocks, [currentPage]: { locked: true, password: pwd } }); } }} className={`p-2 rounded-lg border-2 transition-colors ${isGalaxyLocked ? 'border-violet-500 bg-violet-500/20 text-violet-700' : 'border-gray-300 text-gray-500 hover:border-gray-400'}`} title={lang === 'cn' ? '星系锁' : 'Galaxy Lock'}>
                    <LockLineIcon className="w-4 h-4" />
                </button>
            </div>

            {passwordPrompt !== null && (
                <PasswordPromptModal lang={lang} isGalaxy={passwordPrompt.isGalaxy} value={passwordInput} onChange={setPasswordInput} error={passwordError} onSubmit={submitPassword} onClose={() => { setPasswordPrompt(null); setPasswordError(false); }} />
            )}

            {editingIdx !== null && (
                <StoryModal
                    story={storyForStar(editingIdx) ?? null}
                    lang={lang}
                    isNew={!storyForStar(editingIdx)}
                    recordNo={recordNo}
                    onClose={() => setEditingIdx(null)}
                    onSave={(title, content, lockPayload) => {
                        handleSave(title, content, lockPayload);
                        if (lockPayload?.isBottled && onReward) {
                            onReward(5, 'bottle_throw', 'starSand');
                            if (onThrowBottle) onThrowBottle(title, content);
                        }
                    }}
                    onDelete={handleDelete}
                />
            )}

            <style>{`
                @keyframes glow-breathe { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.15); } }
                @keyframes star-pop { 0% { opacity: 0; transform: scale(0.3); } 70% { transform: scale(1.15); } 100% { opacity: 1; transform: scale(1); } }
                @keyframes galaxy-burst-white-circle { 0% { opacity: 0; transform: scale(0); filter: blur(0); } 35% { opacity: 0.95; transform: scale(1.2); filter: blur(20px); } 100% { opacity: 0.98; transform: scale(1.5); filter: blur(32px); } }
                @keyframes galaxy-burst-dark-circle { 0% { opacity: 0; transform: scale(0); } 40% { opacity: 0.9; transform: scale(1.1); } 70% { opacity: 0.85; transform: scale(1.2); } 100% { opacity: 0; transform: scale(1.3); } }
                
                /* 🌟 星星点赞动效 CSS 🌟 */
                .like-badge { filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3)); }
                
                /* gentle (1-99 点赞)：柔和心跳 + 淡淡光晕 */
                .like-badge.gentle .heart-icon { animation: gentle-heartbeat 1.5s ease-in-out infinite alternate; filter: drop-shadow(0 0 4px rgba(255,144,232,0.6)); }
                
                /* intense (100+ 点赞)：强力心跳 + 蹦出光晕 */
                .like-badge.intense .heart-icon { animation: intense-heartbeat 0.6s ease-in-out infinite alternate; filter: drop-shadow(0 0 10px rgba(255,144,232,1)); }
                
                @keyframes gentle-heartbeat { 0% { transform: scale(1); } 100% { transform: scale(1.15); } }
                @keyframes intense-heartbeat { 0% { transform: scale(1); } 20% { transform: scale(1.4); } 100% { transform: scale(1); } }
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
    onSave: (t: Record<Language, string>, c: Record<Language, string>, lockPayload?: { isLocked: boolean; password: string, isBottled: boolean }) => void;
    onDelete: () => void;
}

const StoryModal: React.FC<StoryModalProps> = ({ story, lang, isNew, recordNo, onClose, onSave, onDelete }) => {
    const [isThrowing, setIsThrowing] = useState(false);
    const [title, setTitle] = useState<Record<Language, string>>(story?.title ?? { se: '', en: '', cn: '' });
    const [content, setContent] = useState<Record<Language, string>>(story?.content ?? { se: '', en: '', cn: '' });
    const [isLocked, setIsLocked] = useState(!!story?.isLocked);
    const [lockPassword, setLockPassword] = useState(story?.password ?? '');

    const starDate = story?.date ?? getStarDate();

    const TITLE_PH: Record<Language, string> = { cn: '给这段回忆起个标题…', en: 'Give this memory a title…', se: 'Ge detta minne en titel…' };
    const BODY_PH: Record<Language, string> = { cn: '在这里记录你的旅程…', en: 'Record your journey here…', se: 'Beskriv din resa här…' };
    const SAVE_LABEL: Record<Language, string> = { cn: '✦ 保存回忆', en: '✦ Save Story', se: '✦ Spara Minne' };
    const DEL_LABEL: Record<Language, string> = { cn: '移除', en: 'Delete', se: 'Ta bort' };
    const LOCK_LABEL: Record<Language, string> = { cn: '单篇加锁', en: 'Lock story', se: 'Lås berättelse' };

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in" aria-modal role="dialog">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

            <div className="relative z-10 w-full max-w-[780px] max-h-[90vh] flex flex-col animate-scale-in overflow-hidden rounded-[50px] bg-[#FDFCF9] shadow-[25px_25px_0px_rgba(0,0,0,0.15)]" style={{ backgroundImage: 'radial-gradient(#e0e0dc 1.2px, transparent 1.2px)', backgroundSize: '18px 18px' }} onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-10 pt-8 pb-2 shrink-0">
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gray-900 text-white font-mono text-xs font-bold tracking-widest select-none">
                        <span className="text-livia-yellow text-base">★</span> {starDate}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-black text-5xl font-black leading-none transition-colors duration-200 hover:scale-110 -mt-2">×</button>
                </div>

                <div className="flex-1 overflow-y-auto px-10 md:px-14 pb-24 custom-scrollbar">
                    <div className="flex items-center gap-2 mt-4 mb-2">
                        <input value={title[lang]} onChange={(e) => setTitle({ ...title, [lang]: e.target.value })} placeholder={TITLE_PH[lang]} className="flex-1 bg-transparent border-none font-hand font-black text-3xl md:text-4xl uppercase tracking-tight focus:outline-none placeholder:text-gray-200 text-gray-900" />
                        <button type="button" onClick={() => setIsLocked(!isLocked)} className={`shrink-0 p-1.5 rounded-lg border-2 transition-colors ${isLocked ? 'border-violet-500 bg-violet-100 text-violet-700' : 'border-gray-300 text-gray-400 hover:border-gray-400'}`} title={LOCK_LABEL[lang]}>
                            <LockLineIcon className="w-5 h-5" />
                        </button>
                    </div>
                    {isLocked && (
                        <div className="flex items-center gap-2 mb-2">
                            <input type="password" value={lockPassword} onChange={(e) => setLockPassword(e.target.value)} placeholder={lang === 'cn' ? '密码' : lang === 'se' ? 'Lösenord' : 'Password'} className="flex-1 max-w-[200px] px-3 py-2 rounded-lg border-2 border-gray-300 font-mono text-sm focus:outline-none focus:border-livia-yellow" />
                        </div>
                    )}
                    <div className="border-t-[3px] border-dashed border-gray-300 my-4 mx-0" />
                    {story?.imageUrl && (
                        <div className="w-full aspect-video bg-[#1a1a2e] rounded-2xl border-[3px] border-black overflow-hidden mb-6 relative shadow-inner">
                            <img src={story.imageUrl} alt="Memory" className="w-full h-full object-cover opacity-90 mix-blend-screen" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 to-purple-500/20 pointer-events-none" />
                        </div>
                    )}
                    <textarea value={content[lang]} onChange={(e) => setContent({ ...content, [lang]: e.target.value })} placeholder={BODY_PH[lang]} className="w-full min-h-[260px] bg-transparent border-none font-hand text-xl md:text-2xl resize-none focus:outline-none placeholder:text-gray-200 text-gray-800" style={{ lineHeight: '2.4' }} />
                </div>

                <div className="flex items-center justify-between px-10 md:px-14 pb-4 pt-2 shrink-0">
                    <span className="font-mono text-[10px] text-gray-300 uppercase tracking-[0.2em] select-none">Stellar Record No. {recordNo}</span>
                    <span className="font-mono text-[10px] text-gray-300 uppercase tracking-[0.2em] select-none">Happy Planet Exploration Corps</span>
                </div>

                <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 flex items-center gap-3">
                    {!isNew && (
                        <button onClick={onDelete} className="px-5 py-2.5 rounded-xl border-2 border-gray-300 bg-white text-red-400 font-bold text-sm uppercase tracking-wider hover:bg-red-50 transition-all">
                            {DEL_LABEL[lang]}
                        </button>
                    )}

                    {!isNew && !story?.isBottled && (
                        <button onClick={() => { setIsThrowing(true); setTimeout(() => { onSave(title, content, { isLocked, password: isLocked ? lockPassword : '', isBottled: true }); setIsThrowing(false); }, 1200); }} className="bg-[#60EFFF] border-2 border-black font-black p-3 rounded-2xl shadow-[4px_4px_0_black] hover:scale-105 active:scale-100 transition-transform flex items-center justify-center group relative overflow-hidden" title={lang === 'cn' ? '装进漂流瓶发射到星际雷达' : 'Throw into Space'}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-8 h-8 text-black group-hover:-translate-y-1 transition-transform">
                                <path d="M12 2v20M17 7l-5-5-5 5" /><rect x="3" y="14" width="18" height="8" rx="2" />
                            </svg>
                            {isThrowing && <div className="absolute inset-0 bg-[#60EFFF] flex items-center justify-center z-10 animate-slide-up"><span className="text-xl">🚀</span></div>}
                        </button>
                    )}

                    <button onClick={() => onSave(title, content, { isLocked, password: isLocked ? lockPassword : '', isBottled: !!story?.isBottled })} className="bg-[#FACC15] border-2 border-black font-black py-4 px-10 rounded-2xl text-lg md:text-xl uppercase tracking-widest shadow-[4px_4px_0_black] hover:scale-105 active:scale-100 transition-transform min-h-[52px]">
                        {SAVE_LABEL[lang]}
                    </button>
                </div>

                <div className="absolute bottom-12 right-12 pointer-events-none select-none opacity-[0.05]" style={{ transform: 'rotate(12deg)' }}>
                    <div className="w-36 h-36 border-[6px] border-black rounded-full flex items-center justify-center font-black text-xs uppercase text-center leading-tight p-3">Happy<br />Planet<br />Starlog</div>
                </div>
            </div>
        </div>
    );

    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};