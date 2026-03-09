import React, { useState, useEffect, useRef } from 'react';

export const MagicCursor: React.FC = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isPressing, setIsPressing] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [isTouch, setIsTouch] = useState(false);
    const [charge, setCharge] = useState(0);
    const chargeTimer = useRef<any>();

    useEffect(() => {
        // 使用 PointerEvent 统一处理：同时兼容 鼠标、手指、手写笔
        const handleMove = (e: PointerEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
            const isTouchDevice = e.pointerType === 'touch';
            setIsTouch(isTouchDevice);

            // 只有非触摸设备（鼠标）才显示悬停感知
            if (!isTouchDevice) {
                const target = e.target as HTMLElement;
                const isClickable = target.closest('button, a, input, select, [role="button"]');
                setIsHovering(!!isClickable);
            }
        };

        const handleDown = (e: PointerEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
            setIsPressing(true);
            setIsHovering(true);

            chargeTimer.current = setInterval(() => {
                setCharge(prev => Math.min(prev + 5, 100));
            }, 20);
        };

        const handleUp = () => {
            setIsPressing(false);
            if (!isTouch) setIsHovering(false);
            setCharge(0);
            clearInterval(chargeTimer.current);
        };

        window.addEventListener('pointermove', handleMove);
        window.addEventListener('pointerdown', handleDown);
        window.addEventListener('pointerup', handleUp);
        window.addEventListener('pointercancel', handleUp);

        return () => {
            window.removeEventListener('pointermove', handleMove);
            window.removeEventListener('pointerdown', handleDown);
            window.removeEventListener('pointerup', handleUp);
            window.removeEventListener('pointercancel', handleUp);
            clearInterval(chargeTimer.current);
        };
    }, [isTouch]);

    // 【特效 1：蓄力抖动逻辑】
    // 当蓄力超过 20 时，树枝会发生随机震颤，模拟能量不稳定的感觉
    const shakeX = isPressing && charge > 20 ? (Math.random() - 0.5) * (charge / 8) : 0;
    const shakeY = isPressing && charge > 20 ? (Math.random() - 0.5) * (charge / 8) : 0;

    // 【手机适配：偏移逻辑】
    // 手指操作时向上挪 60px 避开遮挡；鼠标操作时保持原位
    const offsetX = isTouch ? -10 : -5;
    const offsetY = isTouch ? -60 : -5;

    return (
        <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden">
            <div
                className="absolute transition-transform duration-75 ease-out"
                style={{
                    left: position.x,
                    top: position.y,
                    // 组合：基础偏移 + 手指浮空 + 蓄力抖动
                    transform: `translate(${offsetX + shakeX}px, ${offsetY + shakeY}px)`,
                }}
            >
                {/* 1. 杖尖发光层 (彩虹色 + 呼吸灯) */}
                <div
                    className={`absolute -top-2 -left-2 w-8 h-8 rounded-full blur-xl transition-all duration-300
                        ${isPressing ? 'scale-[2.5] opacity-100' : 'scale-100 opacity-60'}
                        ${charge > 80 ? 'animate-pulse' : ''}
                    `}
                    style={{
                        // 蓄力时变为彩虹色旋转流光
                        background: isPressing
                            ? `conic-gradient(from ${charge * 3.6}deg, #ff0000, #ff00ff, #00ffff, #00ff00, #ffff00, #ff0000)`
                            : isHovering ? '#FFD93D' : 'white'
                    }}
                />

                {/* 2. 魔法残影星星 (蓄力超过一半时出现) */}
                {charge > 50 && (
                    <div className="absolute top-0 left-0 animate-ping">
                        <div className="w-4 h-4 bg-white opacity-50 rotate-45" />
                    </div>
                )}

                {/* 3. 魔法树枝本体 (Magic Twig) */}
                <svg
                    width="32" height="32" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`transition-all duration-200 transform
                        ${isHovering ? 'scale-110 -rotate-12' : 'scale-100 rotate-0'}
                        ${isPressing ? 'scale-95' : ''}
                    `}
                    style={{
                        transform: `scaleX(-1) rotate(-15deg)`,
                        // 蓄力越强，发光阴影越重
                        filter: `drop-shadow(0 0 ${charge / 8}px rgba(255,255,255,0.9))`
                    }}
                >
                    <path d="M5 19C7 17 9 14 10 11M10 11C11 8 13 6 16 4" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M10 11C8 10 5 10 4 12C3.5 14 5 15 8 14C9 13.5 10 12 10 11Z" fill={isPressing ? '#ADFF2F' : '#85E085'} stroke="black" strokeWidth="1.5" />
                    <circle cx="16" cy="4" r="2.5" fill={isPressing ? 'white' : '#FFD93D'} stroke="black" strokeWidth="1.5" />

                    {/* 蓄力时的额外电光效果 */}
                    {charge > 40 && (
                        <g stroke="black" strokeWidth="1.5" strokeLinecap="round" className="animate-pulse">
                            <line x1="16" y1="0" x2="16" y2="1" />
                            <line x1="19" y1="1" x2="20" y2="2" />
                        </g>
                    )}
                </svg>

                {/* 4. 悬停扩散波纹 */}
                {isHovering && !isPressing && (
                    <div className="absolute top-2 left-2 w-4 h-4 border-2 border-livia-yellow rounded-full animate-ping opacity-50" />
                )}
            </div>

            {/* 5. 蓄力进度条 */}
            {charge > 0 && (
                <div
                    className="absolute h-1 bg-black border border-white rounded-full transition-all"
                    style={{
                        left: position.x - 20,
                        top: position.y + (isTouch ? -15 : 45), // 手机端也要相应调整进度条位置
                        width: charge * 0.4,
                        opacity: charge / 100
                    }}
                />
            )}

            {/* 全局样式注入 */}
            <style>{`
                *, button, a { 
                    cursor: none !important; 
                    -webkit-tap-highlight-color: transparent;
                }
                body {
                    touch-action: none; /* 防止移动端长按弹出系统菜单或滚动 */
                }
            `}</style>
        </div>
    );
};