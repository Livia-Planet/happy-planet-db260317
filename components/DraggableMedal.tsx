import React, { useState, useEffect, useRef } from 'react';
import { AchievementDef, UnlockedMedal, Language } from '../types';

interface Props {
    medal: UnlockedMedal;
    def: AchievementDef;
    onPositionChange: (id: string, x: number, y: number) => void;
    currentLang: Language;
}

const SIZE_MAP = {
    sm: 60,
    md: 80,
    lg: 100,
    xl: 130,
};

export const DraggableMedal: React.FC<Props> = ({ medal, def, onPositionChange, currentLang }) => {
    const domRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    // 物理引擎状态
    const physics = useRef({
        x: medal.x,
        y: medal.y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        rot: Math.random() * 360,
        rotV: (Math.random() - 0.5) * 1.5,
        radius: SIZE_MAP[def.size || 'md'] / 2,
    });

    const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });
    const rafId = useRef<number>();

    useEffect(() => {
        const loop = () => {
            if (!isDragging && domRef.current) {
                const p = physics.current;
                p.x += p.vx;
                p.y += p.vy;
                p.rot += p.rotV;

                const maxX = window.innerWidth - p.radius * 2;
                const maxY = window.innerHeight - p.radius * 2;

                if (p.x <= 0) { p.x = 0; p.vx *= -1; }
                if (p.x >= maxX) { p.x = maxX; p.vx *= -1; }
                if (p.y <= 0) { p.y = 0; p.vy *= -1; }
                if (p.y >= maxY) { p.y = maxY; p.vy *= -1; }

                domRef.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) rotate(${p.rot}deg)`;
            }
            rafId.current = requestAnimationFrame(loop);
        };

        rafId.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rafId.current!);
    }, [isDragging]);

    const handlePointerDown = (e: React.PointerEvent) => {
        e.stopPropagation();
        e.target.setPointerCapture(e.pointerId);
        setIsDragging(true);
        dragRef.current = { startX: e.clientX, startY: e.clientY, initialX: physics.current.x, initialY: physics.current.y };
        physics.current.vx = 0;
        physics.current.vy = 0;
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging || !domRef.current) return;
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        physics.current.x = dragRef.current.initialX + dx;
        physics.current.y = dragRef.current.initialY + dy;
        domRef.current.style.transform = `translate3d(${physics.current.x}px, ${physics.current.y}px, 0) rotate(${physics.current.rot}deg)`;
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (!isDragging) return;
        e.target.releasePointerCapture(e.pointerId);
        setIsDragging(false);
        physics.current.vx = (Math.random() - 0.5) * 2;
        physics.current.vy = (Math.random() - 0.5) * 2;
        onPositionChange(medal.id, physics.current.x, physics.current.y);
    };

    return (
        <div
            ref={domRef}
            className={`absolute select-none touch-none transition-transform duration-100 flex items-center justify-center ${isDragging ? 'scale-110 cursor-grabbing z-[100]' : 'cursor-grab'}`}
            style={{
                width: physics.current.radius * 2,
                height: physics.current.radius * 2,
                transform: `translate3d(${physics.current.x}px, ${physics.current.y}px, 0) rotate(${physics.current.rot}deg)`
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
        >
            {/* 1. 拖拽时的透明信息浮层 (已接入三语) */}
            <div
                className={`absolute top-[-70px] left-1/2 -translate-x-1/2 w-max max-w-[200px] bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-2xl border border-white/20 text-center pointer-events-none transition-all duration-300 ${isDragging ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transform: `translateX(-50%) rotate(${-physics.current.rot}deg)` }}
            >
                <p className="font-black text-sm">{def.title[currentLang]}</p>
                <p className="text-gray-300 text-xs mt-0.5">{def.desc[currentLang]}</p>
            </div>

            {/* 2. 渲染手绘图片 或 默认圆圈 */}
            {def.imageUrl ? (
                <img
                    src={def.imageUrl}
                    alt={def.title.en}
                    className="w-full h-full object-contain drop-shadow-[4px_4px_0_rgba(0,0,0,0.8)]"
                    draggable={false}
                />
            ) : (
                <div className={`w-full h-full rounded-full border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0_rgba(0,0,0,1)] text-2xl ${def.color}`}>
                    {def.icon}
                </div>
            )}
        </div>
    );
};