import React from 'react';
import { CharacterStats, Language } from '../types';
import { TRANSLATIONS } from '../utils/gameLogic';

interface RadarChartProps {
    stats: CharacterStats;
    lang: Language;
    isDark?: boolean;
}

export const RadarChart: React.FC<RadarChartProps> = ({ stats, lang, isDark }) => {
    const size = 180;
    const center = size / 2;
    const radius = (size / 2) * 0.7; // Radius for max value (9)

    // Normalized stats (0 to 1) assuming max 9
    const max = 9;
    const modVal = (stats.mod || 0) / max;
    const busVal = (stats.bus || 0) / max;
    const kluVal = (stats.klurighet || 0) / max;

    // Axis angles (Up, Bottom Right, Bottom Left)
    // angle in radians: -PI/2 (0 deg), PI/6 (120 deg), 5PI/6 (240 deg) relative to UP
    const getPoint = (val: number, angleDeg: number) => {
        // Subtract 90 to start 0 deg at top
        const angleRad = (angleDeg - 90) * (Math.PI / 180);
        return {
            x: center + radius * val * Math.cos(angleRad),
            y: center + radius * val * Math.sin(angleRad),
        };
    };

    const p1 = getPoint(modVal, 0);      // Mod (Top)
    const p2 = getPoint(busVal, 120);    // Bus (Bottom Right)
    const p3 = getPoint(kluVal, 240);    // Klu (Bottom Left)

    // Grid Triangles
    const gridTriangles = [0.2, 0.4, 0.6, 0.8, 1.0].map(v => {
        const pt1 = getPoint(v, 0);
        const pt2 = getPoint(v, 120);
        const pt3 = getPoint(v, 240);
        return `M ${pt1.x} ${pt1.y} L ${pt2.x} ${pt2.y} L ${pt3.x} ${pt3.y} Z`;
    });

    const axisLines = [0, 120, 240].map(angle => {
        const p = getPoint(1, angle);
        return `M ${center} ${center} L ${p.x} ${p.y}`;
    });

    return (
        <div className="flex flex-col items-center justify-center p-2">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible drop-shadow-sm">
                {/* Grid Circles (Triangles) */}
                {gridTriangles.map((d, i) => (
                    <path
                        key={i}
                        d={d}
                        fill="none"
                        stroke={isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)"}
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                    />
                ))}

                {/* Axes */}
                {axisLines.map((d, i) => (
                    <path
                        key={i}
                        d={d}
                        stroke={isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)"}
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                        strokeLinecap="round"
                    />
                ))}

                {/* Main Data Shape */}
                <path
                    d={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} Z`}
                    fill={isDark ? "rgba(96, 239, 255, 0.4)" : "rgba(126, 87, 255, 0.35)"}
                    stroke={isDark ? "#60EFFF" : "#7E57FF"}
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                    className="transition-all duration-700 ease-in-out animate-holo-pulse"
                />

                {/* Scanning Line Effect */}
                <g className="pointer-events-none">
                    <rect
                        x="0"
                        y="0"
                        width={size}
                        height="2"
                        fill={isDark ? "rgba(96, 239, 255, 0.6)" : "rgba(126, 87, 255, 0.5)"}
                        className="animate-scanline"
                        style={{ filter: `blur(1px) drop-shadow(0 0 3px ${isDark ? '#60EFFF' : '#7E57FF'})` }}
                    />
                </g>

                {/* Vertex Points */}
                {[p1, p2, p3].map((p, i) => (
                    <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r="4.5"
                        fill={isDark ? "#60EFFF" : "#7E57FF"}
                        stroke={isDark ? "#000" : "#fff"}
                        strokeWidth="3"
                        className={`transition-all duration-700 ease-in-out animate-node-blink`}
                        style={{ animationDelay: `${i * 0.6}s` }}
                    />
                ))}

                {/* Label Backgrounds/Icons if needed, or just text */}
                <text
                    x={center}
                    y={getPoint(1, 0).y - 12}
                    textAnchor="middle"
                    className={`text-[12px] font-black font-rounded tracking-tighter ${isDark ? 'fill-red-400' : 'fill-livia-red'}`}
                >
                    {TRANSLATIONS.stats.mod[lang]}
                </text>
                <text
                    x={getPoint(1, 120).x + 10}
                    y={getPoint(1, 120).y + 15}
                    textAnchor="start"
                    className={`text-[12px] font-black font-rounded tracking-tighter ${isDark ? 'fill-yellow-400' : 'fill-yellow-600'}`}
                >
                    {TRANSLATIONS.stats.bus[lang]}
                </text>
                <text
                    x={getPoint(1, 240).x - 10}
                    y={getPoint(1, 240).y + 15}
                    textAnchor="end"
                    className={`text-[12px] font-black font-rounded tracking-tighter ${isDark ? 'fill-blue-400' : 'fill-livia-blue'}`}
                >
                    {TRANSLATIONS.stats.klurighet[lang]}
                </text>
            </svg>
        </div>
    );
};
