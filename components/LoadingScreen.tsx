import React, { useState, useEffect } from 'react';
import { PARTS_DB, PLANET_PARTS_DB } from '../data/parts';
import { Language } from '../types';
// 幽默的加载文案库（面向儿童，带点冷幽默）
const TRANSLATED_TEXTS = {
    cn: [
        "正在给 Bobu 穿宇航服...",
        "正在擦拭小行星上的灰尘...",
        "正在拦截试图逃跑的卫星...",
        "正在给飞船加满草莓牛奶...",
        "正在翻译外星人的电波...",
        "正在打包水晶丛林...",
        "马上就好，不要催啦..."
    ],
    en: [
        "Fitting Bobu's spacesuit...",
        "Dusting off the asteroids...",
        "Catching a runaway moon...",
        "Refueling with strawberry milk...",
        "Translating alien signals...",
        "Packing up the crystal jungle...",
        "Almost there, don't rush me!"
    ],
    se: [
        "Klä på Bobu rymddräkten...",
        "Dammar av småplaneter...",
        "Fångar in en förrymd måne...",
        "Tanker med jordgubbsmjölk...",
        "Översätter rymdvarelsers signaler...",
        "Packar ner kristallskogen...",
        "Snart klar, ta en fika så länge!" // 加入了瑞典 Fika 梗
    ]
};

interface LoadingScreenProps {
    onComplete: () => void;
    lang: Language;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete, lang }) => {
    const [progress, setProgress] = useState(0);
    const [textIndex, setTextIndex] = useState(0);
    const [isFadingOut, setIsFadingOut] = useState(false);

    useEffect(() => {
        // 1. 文案轮播定时器 (每 800ms 换一句)
        const textInterval = setInterval(() => {
            const currentTexts = TRANSLATED_TEXTS[lang] || TRANSLATED_TEXTS.en;
            setTextIndex(prev => (prev + 1) % currentTexts.length);
        }, 800);

        // 2. 收集所有需要预加载的图片 URL
        const charUrls = Object.values(PARTS_DB).flatMap(p => Object.values(p.images || {}));
        const planetUrls = Object.values(PLANET_PARTS_DB).flatMap(p => Object.values(p.images || {}));

        // 去重并过滤掉空路径
        const allUrls = Array.from(new Set([...charUrls, ...planetUrls])).filter(url => url && url.length > 0);
        const total = allUrls.length;

        // 3. 核心加载逻辑
        const loadImages = async () => {
            let loadedCount = 0;

            if (total === 0) {
                setProgress(100);
            } else {
                const loadPromises = allUrls.map(url => {
                    return new Promise<void>((resolve) => {
                        const img = new Image();
                        img.src = url;

                        const handleComplete = () => {
                            loadedCount++;
                            // 制造“分段跳跃”的厚重打击感，而不是丝滑过渡
                            const currentProgress = Math.floor((loadedCount / total) * 100);
                            setProgress(currentProgress);
                            resolve();
                        };

                        img.onload = handleComplete;
                        img.onerror = () => {
                            console.warn(`[Preloader] Failed to load: ${url}`);
                            handleComplete(); // 容错：哪怕 404 也不能卡死进度条
                        };
                    });
                });

                await Promise.all(loadPromises);
            }
        };

        // 4. 并行执行：预加载图片 + 强制最低等待时间 (1500ms)
        const minWaitPromise = new Promise(resolve => setTimeout(resolve, 1500));

        Promise.all([loadImages(), minWaitPromise]).then(() => {
            // 加载满格后，停顿 0.4 秒给玩家看一下 100%
            setTimeout(() => {
                setIsFadingOut(true); // 触发退场动画
                setTimeout(onComplete, 400); // 彻底移除组件
            }, 400);
        });

        return () => clearInterval(textInterval);
    }, [onComplete]);

    return (
        <div
            className={`fixed inset-0 z-[10000] bg-[#FFDE59] flex flex-col items-center justify-center transition-opacity duration-400 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}
        >
            {/* 1. 视觉中心：跳动的可爱快递盒 */}
            <div className="relative mb-12">
                <svg viewBox="0 0 100 100" className="w-32 h-32 animate-bounce drop-shadow-[6px_6px_0px_rgba(0,0,0,1)]">
                    {/* 盒子主体 */}
                    <rect x="10" y="20" width="80" height="70" rx="12" fill="#FFFFFF" stroke="black" strokeWidth="6" />
                    {/* 盖子折线 */}
                    <line x1="10" y1="45" x2="90" y2="45" stroke="black" strokeWidth="6" strokeLinecap="round" />
                    {/* 可爱的眼睛 */}
                    <circle cx="35" cy="65" r="5" fill="black" />
                    <circle cx="65" cy="65" r="5" fill="black" />
                    {/* 微笑 */}
                    <path d="M45 75 Q50 80 55 75" stroke="black" strokeWidth="4" strokeLinecap="round" fill="none" />
                </svg>
                {/* 速度线 (强调跳动感) */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-2 bg-black/20 rounded-full animate-pulse" />
            </div>

            {/* 2. 核心进度条：打击感拉满的血条设计 */}
            <div className="w-[80%] max-w-md">
                <div className="h-10 border-[5px] border-black bg-white rounded-2xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative">
                    {/* 粉色填充槽 */}
                    <div
                        className="h-full bg-[#FF90E8] border-r-[5px] border-black transition-all duration-200 ease-out"
                        style={{
                            width: `${progress}%`,
                            // 增加糖果风的斜线阴影纹理
                            backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(0,0,0,0.08) 10px, rgba(0,0,0,0.08) 20px)'
                        }}
                    />
                    {/* 强制覆盖在最上方的百分比文字 */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-black italic text-black text-xl drop-shadow-[2px_2px_0px_white]">
                            {progress}%
                        </span>
                    </div>
                </div>
            </div>

            {/* 3. 动态幽默文案 */}
            <div className="mt-8 h-8 flex items-center justify-center">
                <p className="font-bold text-black text-lg font-rounded animate-pulse">
                    {(TRANSLATED_TEXTS[lang] || TRANSLATED_TEXTS.en)[textIndex]}
                </p>
            </div>
        </div>
    );
};