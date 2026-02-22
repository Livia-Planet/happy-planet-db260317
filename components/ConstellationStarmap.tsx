import React, { useState, useMemo } from 'react';
import { StoryEntry, Language } from '../types';
import { TRANSLATIONS } from '../utils/gameLogic';

interface ConstellationStarmapProps {
    stories: StoryEntry[];
    lang: Language;
    onOpenStory: (story: StoryEntry) => void;
    onAddStory: () => void;
    isFlipped?: boolean;
}

interface Point {
    x: number;
    y: number;
}

const STAR_COORDS: Point[] = [
    { x: 10, y: 20 },
    { x: 40, y: 15 },
    { x: 25, y: 55 },
    { x: 70, y: 40 },
    { x: 55, y: 80 },
    { x: 85, y: 70 },
];

const GALAXY_COLORS = ['#fbbf24', '#c084fc', '#60a5fa']; // Amber (Gold), Purple, Blue

export const ConstellationStarmap: React.FC<ConstellationStarmapProps> = ({
    stories,
    lang,
    onOpenStory,
    onAddStory,
    isFlipped
}) => {
    const [currentPage, setCurrentPage] = useState(0);

    const sortedStories = useMemo(() => {
        return [...stories].sort((a, b) => b.date.localeCompare(a.date));
    }, [stories]);

    const starsPerPage = 6;
    const galaxyColor = GALAXY_COLORS[currentPage % GALAXY_COLORS.length];

    // Get translations from utility
    const galaxyName = (TRANSLATIONS.ui as any).starmapGalaxyNames[currentPage][lang];
    const guidance = (TRANSLATIONS.ui as any).starmapGuidance[lang];

    return (
        <div className="h-full w-full relative flex flex-col bg-transparent overflow-hidden select-none animate-fade-in py-2">

            {/* 1. Header Area (Top 15%) */}
            <div className="h-[15%] flex flex-col items-center justify-center text-center px-4 z-20">
                <h3 className={`font-rounded font-black text-xl tracking-[0.2em] uppercase mb-1 transition-colors duration-500 ${isFlipped ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-gray-900'}`}>
                    {galaxyName}
                </h3>
                <p className={`font-hand text-[10px] opacity-60 leading-tight transition-colors duration-500 ${isFlipped ? 'text-gray-300' : 'text-gray-500'}`}>
                    {guidance}
                </p>
            </div>

            {/* 2. Middle: Wide Starmap (Middle 70%) */}
            <div className="h-[70%] w-full relative overflow-visible px-4">
                {/* Constellation Path (SVG) */}
                <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
                >
                    <path
                        d={`M ${STAR_COORDS.map(p => `${p.x} ${p.y}`).join(' L ')}`}
                        fill="none"
                        className={`transition-all duration-1000 ${isFlipped ? 'stroke-white/20' : 'stroke-gray-300'}`}
                        strokeWidth="0.5"
                        strokeDasharray="2 2"
                    />
                </svg>

                {/* Stars and Interactive Elements */}
                {STAR_COORDS.map((point, idx) => {
                    const globalIdx = currentPage * starsPerPage + idx;
                    const story = sortedStories[globalIdx];
                    const isFilled = !!story;
                    const isNextToFill = globalIdx === sortedStories.length;

                    return (
                        <div
                            key={`${currentPage}-${idx}`}
                            className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
                            style={{ left: `${point.x}%`, top: `${point.y}%` }}
                        >
                            {/* Star Hitbox & Interaction */}
                            <div className="relative group">
                                <button
                                    onClick={() => isFilled ? onOpenStory(story) : (isNextToFill ? onAddStory() : null)}
                                    className={`
                                        w-12 h-12 flex items-center justify-center transition-all duration-500 rounded-full
                                        ${isFilled
                                            ? 'scale-110'
                                            : isNextToFill
                                                ? 'hover:scale-125 opacity-100'
                                                : 'opacity-10 cursor-default'}
                                    `}
                                    style={{
                                        color: isFilled ? galaxyColor : '#9ca3af',
                                        filter: isFilled ? `drop-shadow(0 0 12px ${galaxyColor}CC)` : 'none'
                                    }}
                                >
                                    <span className="text-4xl leading-none">
                                        {isFilled ? '★' : '☆'}
                                    </span>

                                    {/* Plus hint for next star */}
                                    {isNextToFill && !isFilled && (
                                        <span className={`absolute text-[10px] font-black mt-1 ${isFlipped ? 'text-white' : 'text-gray-400'}`}>+</span>
                                    )}
                                </button>

                                {/* Dynamic Label (Date & Title) */}
                                {isFilled && (
                                    <div className={`
                                        absolute top-full mt-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none
                                        whitespace-nowrap px-3 py-1.5 rounded-lg border-2 font-hand text-[10px] z-40 transform translate-y-2 group-hover:translate-y-0
                                        ${isFlipped ? 'bg-gray-800/95 border-gray-600 text-white' : 'bg-white/95 border-black text-black shadow-[4px_4px_0_rgba(0,0,0,0.1)]'}
                                    `}>
                                        <div className="font-mono text-[8px] opacity-60">[{story.date}]</div>
                                        <div className="font-bold uppercase truncate max-w-[120px] leading-tight mt-0.5">{story.title[lang]}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 3. Bottom: Pagination Section (Bottom 15%) */}
            <div className="h-[15%] flex items-center justify-center gap-4 z-20 pb-2">
                {[0, 1, 2].map((i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`
                            transition-all duration-500 rounded-full
                            ${currentPage === i
                                ? `w-10 h-2.5 ${isFlipped ? 'bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]' : 'bg-black'}`
                                : `w-2.5 h-2.5 ${isFlipped ? 'bg-white/20' : 'bg-gray-200'}`}
                        `}
                        aria-label={`Go to galaxy ${i + 1}`}
                    />
                ))}
            </div>

            {/* Empty State Aesthetics */}
            {stories.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-5 px-10 text-center">
                    <p className={`font-hand text-3xl rotate-[-3deg] ${isFlipped ? 'text-gray-300' : 'text-gray-600'}`}>
                        Tracing the stellar paths...
                    </p>
                </div>
            )}
        </div>
    );
};
