import React, { useEffect, useState } from 'react';
import { AchievementDef, Language } from '../types';

interface ModalProps {
    isOpen: boolean;
    achievement: AchievementDef | null;
    lang: Language;
    onClose: () => void;
}

// 简单的多语言翻译字典
const TRANSLATIONS = {
    unlocked: {
        cn: '🎊 获得新荣誉贴纸！',
        en: '🎊 New Medal Unlocked!',
        se: '🎊 Ny Medalj Upplåst!'
    },
    btn: {
        cn: '太棒了！',
        en: 'Awesome!',
        se: 'Grymt!'
    }
};

export const AchievementUnlockModal: React.FC<ModalProps> = ({ isOpen, achievement, lang, onClose }) => {
    const [showContent, setShowContent] = useState(false);

    // 用一个微小的延迟来制造弹出的冲击感
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => setShowContent(true), 50);
        } else {
            setShowContent(false);
        }
    }, [isOpen]);

    if (!isOpen || !achievement) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto">
            {/* 暗化背景层 */}
            <div
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${showContent ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* 盲盒爆开的内容区 */}
            <div className={`relative z-10 flex flex-col items-center transition-all duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) ${showContent ? 'scale-100 opacity-100 translate-y-0' : 'scale-50 opacity-0 translate-y-10'}`}>

                {/* 顶部提示语 */}
                <h2 className="text-2xl md:text-3xl font-black text-white mb-6 drop-shadow-[2px_2px_0_rgba(0,0,0,1)] tracking-wide">
                    {TRANSLATIONS.unlocked[lang]}
                </h2>

                {/* 发光的徽章展示区 */}
                <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center mb-8">
                    {/* 背后的旋转光晕 */}
                    <div className="absolute inset-0 bg-livia-yellow rounded-full blur-2xl opacity-40 animate-pulse" />
                    <div className="absolute inset-0 bg-white rounded-full blur-3xl opacity-20" />

                    {/* 徽章本身 */}
                    <div className="relative z-10 w-full h-full animate-bounce-short">
                        {achievement.imageUrl ? (
                            <img
                                src={achievement.imageUrl}
                                alt={achievement.title.en}
                                className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                                draggable={false}
                            />
                        ) : (
                            <div className={`w-full h-full rounded-full border-[6px] border-black flex items-center justify-center shadow-[8px_8px_0_rgba(0,0,0,1)] text-6xl ${achievement.color}`}>
                                {achievement.icon}
                            </div>
                        )}
                    </div>
                </div>

                {/* 标题和描述 */}
                <div className="bg-white border-[4px] border-black rounded-2xl p-6 text-center shadow-[6px_6px_0_rgba(0,0,0,1)] w-80 md:w-96 transform -rotate-2">
                    <h3 className="text-2xl font-black mb-2 text-black">{achievement.title[lang]}</h3>
                    <p className="text-gray-600 font-bold text-sm">{achievement.desc[lang]}</p>
                </div>

                {/* 关闭按钮 */}
                <button
                    onClick={onClose}
                    className="mt-8 px-8 py-3 bg-livia-blue text-white text-xl font-black border-[3px] border-black rounded-full shadow-[4px_4px_0_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none transition-all"
                >
                    {TRANSLATIONS.btn[lang]}
                </button>

            </div>
        </div>
    );
};