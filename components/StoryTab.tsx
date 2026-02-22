import React, { useState, useMemo } from 'react';
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

const PAGE_CONFIGS: { stars: Point[]; title: string; glowColor: string; glowRgb: string }[] = [
    {
        title: 'URSPRUNGSGALAXEN',
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
        title: 'MINNESBÄLTET',
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
        title: 'FRAMTIDSNEBULOSAN',
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

            {/* ── 1. HEADER (≈ 15%) ─────────────────────── */}
            <div className="h-[15%] flex flex-col items-center justify-center text-center px-4 shrink-0">
                <h3
                    className={`
                        font-rounded font-black text-xl tracking-[0.18em] uppercase transition-colors duration-500
                        ${isFlipped
                            ? 'text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.5)]'
                            : 'text-gray-900'}
                    `}
                >
                    {cfg.title}
                </h3>

                <p
                    className={`
                        mt-1.5 font-hand text-[10px] leading-snug opacity-50 transition-colors duration-500
                        ${isFlipped ? 'text-gray-400' : 'text-gray-500'}
                    `}
                >
                    {GUIDANCE[lang]}
                </p>
            </div>

            {/* ── 2. STARMAP (≈ 70%) ────────────────────── */}
            <div className="h-[70%] w-full relative shrink-0">

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

            {/* ── 3. PAGINATION DOTS (≈ 15%) ────────────── */}
            <div className="h-[15%] flex items-center justify-center gap-5 shrink-0 pb-2">
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

            {/* ── 4. FULLSCREEN EDIT MODAL ───────────────── */}
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
   MODAL — Matching Screenshot 3 Design
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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/85 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Card */}
            <div className="w-full max-w-2xl max-h-[90vh] bg-[#fdfcf9] rounded-[28px] shadow-[0_25px_60px_rgba(0,0,0,0.5)] relative flex flex-col overflow-hidden animate-scale-in z-10">

                {/* ── Top Bar ───────────────────────────── */}
                <div className="flex items-center justify-between px-6 py-4 shrink-0">
                    {/* Star Date Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-900 text-white font-mono text-xs font-bold tracking-wider">
                        <span className="text-livia-yellow">★</span>
                        {starDate}
                    </div>

                    {/* Action Buttons (Circular) */}
                    <div className="flex items-center gap-2">
                        {/* Save */}
                        <button
                            onClick={() => onSave(title, content)}
                            className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 hover:scale-110 transition-all shadow-md"
                            title={lang === 'cn' ? '保存' : 'Save'}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                            </svg>
                        </button>

                        {/* Delete (only for existing) */}
                        {!isNew && (
                            <button
                                onClick={onDelete}
                                className="w-10 h-10 rounded-full bg-gray-700 text-gray-300 flex items-center justify-center hover:bg-red-500 hover:text-white hover:scale-110 transition-all shadow-md"
                                title={lang === 'cn' ? '删除' : 'Delete'}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 1 .7.797l-.5 6a.75.75 0 0 1-1.497-.124l.5-6a.75.75 0 0 1 .797-.672ZM12.2 7.72a.75.75 0 0 1 .797.672l.5 6a.75.75 0 1 1-1.497.124l-.5-6a.75.75 0 0 1 .7-.797ZM10 8a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0v-6A.75.75 0 0 1 10 8Z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}

                        {/* Close */}
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-gray-700 text-gray-300 flex items-center justify-center hover:bg-gray-600 hover:text-white hover:scale-110 transition-all shadow-md"
                            title={lang === 'cn' ? '关闭' : 'Close'}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* ── Main Content ──────────────────────── */}
                <div className="flex-1 overflow-y-auto px-8 md:px-12 pb-6">
                    {/* Paper texture zone */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 min-h-[400px] flex flex-col shadow-sm">
                        {/* Title Input */}
                        <input
                            value={title[lang]}
                            onChange={(e) => setTitle({ ...title, [lang]: e.target.value })}
                            placeholder={lang === 'cn' ? '给这段回忆起个标题…' : lang === 'se' ? 'Ge detta minne en titel…' : 'Give this memory a title…'}
                            className="w-full bg-transparent border-none font-black text-3xl md:text-4xl uppercase tracking-tight focus:outline-none placeholder:text-gray-300 text-gray-900"
                        />

                        {/* Dashed separator */}
                        <div className="border-t-2 border-dashed border-gray-300 my-4" />

                        {/* Body Textarea */}
                        <textarea
                            value={content[lang]}
                            onChange={(e) => setContent({ ...content, [lang]: e.target.value })}
                            placeholder={lang === 'cn' ? '在这里记录你的旅程…' : lang === 'se' ? 'Beskriv din resa här…' : 'Record your journey here…'}
                            className="w-full flex-1 min-h-[250px] bg-transparent border-none font-hand text-xl md:text-2xl resize-none focus:outline-none placeholder:text-gray-300 leading-relaxed text-gray-800"
                        />
                    </div>
                </div>

                {/* ── Footer ───────────────────────────── */}
                <div className="flex items-center justify-between px-8 md:px-12 py-4 border-t border-gray-100 shrink-0">
                    <span className="font-mono text-[10px] text-gray-400 uppercase tracking-[0.15em]">
                        Stellar Record No. {recordNo}
                    </span>
                    <span className="font-mono text-[10px] text-gray-400 uppercase tracking-[0.15em]">
                        Happy Planet Exploration Corps
                    </span>
                </div>
            </div>
        </div>
    );
};
