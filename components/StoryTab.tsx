import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { StoryEntry, Language } from '../types';
import { getStarDate } from '../utils/gameLogic';

/* ─────────────────────────────────────────────────────
   Props
   ───────────────────────────────────────────────────── */
interface StoryTabProps {
    stories: StoryEntry[];
    lang: Language;
    isFlipped: boolean;
    onUpdateStories: (stories: StoryEntry[]) => void;
}

/* ─────────────────────────────────────────────────────
   Per-Page Constellation Configs
   ───────────────────────────────────────────────────── */
interface Point { x: number; y: number; }

const PAGE_CONFIGS: { stars: Point[]; glowColor: string; glowRgb: string }[] = [
    {
        glowColor: '#FFD700',
        glowRgb: '255,215,0',
        stars: [
            { x: 10, y: 20 },
            { x: 30, y: 15 },
            { x: 50, y: 45 },
            { x: 70, y: 25 },
            { x: 90, y: 40 },
        ],
    },
    {
        glowColor: '#74C0FC',
        glowRgb: '116,192,252',
        stars: [
            { x: 20, y: 10 },
            { x: 15, y: 40 },
            { x: 40, y: 30 },
            { x: 45, y: 60 },
            { x: 70, y: 75 },
            { x: 85, y: 50 },
            { x: 75, y: 20 },
        ],
    },
    {
        glowColor: '#DA77F2',
        glowRgb: '218,119,242',
        stars: [
            { x: 10, y: 80 },
            { x: 30, y: 70 },
            { x: 50, y: 85 },
            { x: 70, y: 60 },
            { x: 60, y: 30 },
            { x: 85, y: 15 },
        ],
    },
];

/** 星系名称：按 lang 动态显示 (绿框区域) */
const GALAXY_TITLES: Record<Language, string>[] = [
    { se: 'URSPRUNGSGALAXEN', en: 'ORIGIN GALAXY', cn: '起源星系' },
    { se: 'MINNESBÄLTET', en: 'MEMORY BELT', cn: '记忆带' },
    { se: 'FRAMTIDSNEBULOSAN', en: 'FUTURE NEBULA', cn: '未来星云' },
];

/** 引导语：按 lang 显示，不抢主标题风头 */
const GUIDANCE: Record<Language, string> = {
    cn: '点亮星星，记录下属于你的故事！',
    en: 'Light up the stars and record your own story!',
    se: 'Tänd stjärnorna och skriv din egen berättelse!',
};

/* ─────────────────────────────────────────────────────
   Cumulative star count helpers
   ───────────────────────────────────────────────────── */
const pageStartIndex = (page: number): number => {
    let sum = 0;
    for (let i = 0; i < page; i++) sum += PAGE_CONFIGS[i].stars.length;
    return sum;
};

/* ═════════════════════════════════════════════════════
   MAIN COMPONENT
   ═════════════════════════════════════════════════════ */
export const StoryTab: React.FC<StoryTabProps> = ({
    stories,
    lang,
    isFlipped,
    onUpdateStories,
}) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [editingIdx, setEditingIdx] = useState<number | null>(null);

    const cfg = PAGE_CONFIGS[currentPage];

    /* Sort once: newest first */
    const sorted = useMemo(
        () => [...stories].sort((a, b) => b.date.localeCompare(a.date)),
        [stories],
    );

    /* ─── Star helpers ────────────────────────── */
    const storyForStar = (starIdx: number): StoryEntry | undefined => {
        const globalIdx = pageStartIndex(currentPage) + starIdx;
        return sorted[globalIdx];
    };

    const globalIndex = (starIdx: number) =>
        pageStartIndex(currentPage) + starIdx;

    /* ─── Modal handlers ──────────────────────── */
    const openStar = (starIdx: number) => {
        setEditingIdx(starIdx);
    };

    const handleSave = (
        title: Record<Language, string>,
        content: Record<Language, string>,
    ) => {
        if (editingIdx === null) return;
        const gIdx = globalIndex(editingIdx);
        const existing = sorted[gIdx];

        let next: StoryEntry[];
        if (existing) {
            next = stories.map((s) =>
                s.id === existing.id ? { ...s, title, content } : s,
            );
        } else {
            const entry: StoryEntry = {
                id: Date.now(),
                date: getStarDate(),
                title,
                content,
            };
            next = [entry, ...stories];
        }
        onUpdateStories(next);
        setEditingIdx(null);
    };

    const handleDelete = () => {
        if (editingIdx === null) return;
        const gIdx = globalIndex(editingIdx);
        const existing = sorted[gIdx];
        if (!existing) return;
        onUpdateStories(stories.filter((s) => s.id !== existing.id));
        setEditingIdx(null);
    };

    /* ─── Build SVG constellation path ────────── */
    const pathD = cfg.stars
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
        .join(' ');

    /* Star record number for modal footer */
    const editingGlobalIdx = editingIdx !== null ? globalIndex(editingIdx) : -1;

    /* ═══════════════════ RENDER ══════════════════ */
    return (
        <div className="h-full w-full relative flex flex-col overflow-hidden select-none animate-fade-in">
            {/* ── 1. HEADER：星系名 + 三语引导语，居中 ───── */}
            <div className="flex flex-col items-center justify-center text-center px-4 shrink-0 py-2">
                <h3
                    className={`
                        font-rounded font-black text-lg md:text-xl tracking-[0.18em] uppercase transition-colors duration-500
                        ${isFlipped
                            ? 'text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.5)]'
                            : 'text-gray-900'}
                    `}
                >
                    {GALAXY_TITLES[currentPage][lang]}
                </h3>
                <p
                    className={`
                        mt-1.5 text-[10px] font-hand text-center opacity-60 transition-colors duration-500
                        ${isFlipped ? 'text-gray-400' : 'text-gray-500'}
                    `}
                >
                    {GUIDANCE[lang]}
                </p>
            </div>

            {/* ── 2. STARMAP 星图区 ───────────────────── */}
            <div className="flex-1 min-h-0 w-full relative shrink-0">

                {/* SVG Constellation Lines */}
                <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="absolute inset-0 w-full h-full pointer-events-none"
                >
                    <path
                        d={pathD}
                        fill="none"
                        className={`transition-all duration-700 ${isFlipped ? 'stroke-white/10' : 'stroke-gray-300/50'}`}
                        strokeWidth="0.3"
                        strokeDasharray="1.5 2"
                        strokeLinecap="round"
                    />
                </svg>

                {/* Interactive Stars */}
                {cfg.stars.map((pt, idx) => {
                    const story = storyForStar(idx);
                    const isFilled = !!story;

                    return (
                        <button
                            key={`${currentPage}-${idx}`}
                            onClick={() => openStar(idx)}
                            className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group cursor-pointer"
                            style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                        >
                            {/* Glow ring (only when filled) */}
                            {isFilled && (
                                <span
                                    className="absolute inset-[-8px] rounded-full pointer-events-none"
                                    style={{
                                        background: `radial-gradient(circle, ${cfg.glowColor}40 0%, transparent 70%)`,
                                        animation: 'glow-breathe 3s ease-in-out infinite',
                                    }}
                                />
                            )}

                            {/* Star character */}
                            <span
                                className={`
                                    text-4xl leading-none block
                                    transition-all duration-500
                                    group-hover:scale-125
                                    ${isFilled
                                        ? ''
                                        : isFlipped
                                            ? 'text-gray-600 opacity-60'
                                            : 'text-gray-300 opacity-70'}
                                `}
                                style={isFilled ? {
                                    color: cfg.glowColor,
                                    filter: `drop-shadow(0 0 8px ${cfg.glowColor}99)`,
                                } : undefined}
                            >
                                {isFilled ? '★' : '☆'}
                            </span>

                            {/* Always-visible label for filled stars */}
                            {isFilled && (
                                <div
                                    className={`
                                        absolute top-full mt-1 left-1/2 -translate-x-1/2
                                        whitespace-nowrap px-2 py-0.5 rounded-lg
                                        font-hand text-[8px] z-40 pointer-events-none
                                        transition-all duration-300 opacity-80 group-hover:opacity-100
                                        ${isFlipped
                                            ? 'bg-gray-800/80 text-gray-300'
                                            : 'bg-white/80 text-gray-600'}
                                    `}
                                >
                                    <div className="font-mono text-[7px] opacity-50">{story!.date}</div>
                                    <div className="font-bold truncate max-w-[80px] leading-tight">
                                        {story!.title[lang] || '—'}
                                    </div>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ── 3. PAGINATION DOTS ───────────────────── */}
            <div className="w-full flex items-center justify-center gap-5 shrink-0 py-3 pb-2">
                {PAGE_CONFIGS.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`
                            transition-all duration-400 rounded-full
                            ${currentPage === i
                                ? `w-10 h-3 ${isFlipped
                                    ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.7)]'
                                    : 'bg-livia-yellow border-2 border-black shadow-[2px_2px_0_black]'}`
                                : `w-2.5 h-2.5 ${isFlipped
                                    ? 'bg-white/15 hover:bg-white/30'
                                    : 'bg-gray-200 hover:bg-gray-300'}`}
                        `}
                    />
                ))}
            </div>

            {/* ── 4. 全屏编辑弹窗（StoryModal 内部用 Portal 挂载到 body）── */}
            {editingIdx !== null && (
                <StoryModal
                    story={storyForStar(editingIdx) ?? null}
                    lang={lang}
                    isNew={!storyForStar(editingIdx)}
                    recordNo={editingGlobalIdx + 1}
                    onClose={() => setEditingIdx(null)}
                    onSave={handleSave}
                    onDelete={handleDelete}
                />
            )}

            {/* Glow breathe animation */}
            <style>{`
                @keyframes glow-breathe {
                    0%, 100% { opacity: 0.5; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.15); }
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
    onSave: (t: Record<Language, string>, c: Record<Language, string>) => void;
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
                    <input
                        value={title[lang]}
                        onChange={(e) => setTitle({ ...title, [lang]: e.target.value })}
                        placeholder={TITLE_PH[lang]}
                        className="w-full bg-transparent border-none font-hand font-black text-3xl md:text-4xl uppercase tracking-tight focus:outline-none placeholder:text-gray-200 text-gray-900 mt-4 mb-2"
                    />
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
                        onClick={() => onSave(title, content)}
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
