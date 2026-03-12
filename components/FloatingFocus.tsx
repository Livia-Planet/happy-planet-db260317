import React, { useState, useEffect, useRef } from 'react';
import { PassportData } from '../types';
import { Avatar } from './Avatar';
import { getDominantStat, calculateStats } from '../utils/gameLogic';

interface FloatingFocusProps {
    pet: PassportData;
    onComplete: () => void;
    onCancel: () => void;
}

export const FloatingFocus: React.FC<FloatingFocusProps> = ({ pet, onComplete, onCancel }) => {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [position, setPosition] = useState({ x: 20, y: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef({ startX: 0, startY: 0, startPos: { x: 0, y: 0 } });

    // 独立倒计时
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
            return () => clearInterval(timer);
        } else {
            onComplete();
        }
    }, [timeLeft, onComplete]);

    // 拖拽逻辑
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
                x: Math.min(Math.max(10, dragRef.current.startPos.x + dx), window.innerWidth - 150),
                y: Math.min(Math.max(10, dragRef.current.startPos.y + dy), window.innerHeight - 150)
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

    const formatTime = (secs: number) => `${Math.floor(secs / 60).toString().padStart(2, '0')}:${(secs % 60).toString().padStart(2, '0')}`;

    return (
        <div
            className="fixed z-[9990] flex flex-col items-center cursor-move transition-transform"
            style={{ left: position.x, top: position.y, transform: isDragging ? 'scale(0.95)' : 'scale(1)' }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
        >
            {/* 迷你 Bongo Cat */}
            <div className="relative flex flex-col items-center">
                <div className="relative z-10 scale-[0.6] origin-bottom translate-y-4">
                    <Avatar selectedParts={pet.selectedParts} dominantStat={getDominantStat(calculateStats(pet.selectedParts))} />
                </div>
                {/* 敲键盘桌子 */}
                <div className="relative z-20 w-28 h-10 bg-[#FFD700] border-[3px] border-black rounded-xl shadow-[0_4px_0_rgba(0,0,0,0.2)] flex justify-center items-start pt-1 overflow-hidden">
                    <div className="w-16 h-3 bg-white border-2 border-black rounded opacity-80" />
                    <div className="absolute top-1 left-2 w-4 h-4 bg-white border-2 border-black rounded-full animate-bounce" style={{ animationDuration: '0.3s' }} />
                    <div className="absolute top-1 right-2 w-4 h-4 bg-white border-2 border-black rounded-full animate-bounce" style={{ animationDuration: '0.3s', animationDelay: '0.15s' }} />
                </div>
                {/* 时间气泡与取消按钮 */}
                <div className="relative bg-white border-[3px] border-black px-4 py-1.5 rounded-full shadow-[2px_2px_0_black] font-black text-lg mb-2 flex items-center gap-3">
                    <span className="text-blue-500 animate-pulse">●</span>
                    <span>{formatTime(timeLeft)}</span>
                    <button onClick={(e) => { e.stopPropagation(); onCancel(); }} className="text-red-400 hover:text-red-600 text-sm ml-1">✕</button>
                </div>
            </div>
        </div>
    );
};