import React, { useState } from 'react';
import { Language, CollectedStory } from '../types';

const Icons = {
    Heart: ({ className = "w-6 h-6" }) => (<svg viewBox="0 0 24 24" fill="#FF90E8" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>),
    Comment: ({ className = "w-6 h-6" }) => (<svg viewBox="0 0 24 24" fill="#60EFFF" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>),
    Tape: () => (<svg viewBox="0 0 100 20" fill="#FACC15" opacity="0.4"><rect width="100" height="20" rx="3" /></svg>)
};

interface CollectionScreenProps {
    collectedStories: CollectedStory[];
    onBack: () => void;
    lang: Language;
}

export const CollectionScreen: React.FC<CollectionScreenProps> = ({ collectedStories, onBack, lang }) => {
    const [selectedStory, setSelectedStory] = useState<CollectedStory | null>(null);

    const T = {
        title: { cn: '故事收藏仓库', en: 'STORY COLLECTION', se: 'BERÄTTELSESAMLING' },
        empty: { cn: '空空如也', en: 'EMPTY ARCHIVE', se: 'TOMT ARKIV' },
        emptyDesc: { cn: '快去星际雷达打捞漂流瓶并收藏吧！', en: 'Go to the Radar to find and save stories!', se: 'Gå till radarn för att hitta och spara berättelser!' }
    };

    return (
        <div className="fixed inset-0 z-[1000] bg-[#FFFBEB] overflow-hidden font-rounded flex flex-col" style={{ backgroundImage: 'radial-gradient(#e0e0dc 1.2px, transparent 1.2px)', backgroundSize: '18px 18px' }}>
            {/* 🌟 修复：保证 X 按钮永远在最右侧不被挤走 */}
            <div className="flex justify-between items-center p-4 md:p-6 shrink-0 z-50 w-full gap-2">
                <h1 className="font-black text-base md:text-3xl uppercase tracking-widest text-black flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full border-[3px] md:border-4 border-black shadow-[3px_3px_0_black] md:shadow-[4px_4px_0_black] flex-1 overflow-hidden">
                    📚 <span className="truncate">{T.title[lang]}</span>
                </h1>
                <button onClick={onBack} className="w-10 h-10 md:w-14 md:h-14 bg-white border-[3px] md:border-4 border-black rounded-full flex items-center justify-center shadow-[3px_3px_0_black] md:shadow-[4px_4px_0_black] active:translate-y-1 active:shadow-none text-2xl md:text-4xl hover:bg-gray-100 shrink-0">
                    ×
                </button>
            </div>

            {/* 🌟 故事仓库网格界面 */}
            <div className="w-full h-full pt-24 pb-10 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 custom-scrollbar">
                {collectedStories.length === 0 && (
                    <div className="col-span-full h-full flex flex-col items-center justify-center gap-6 animate-fade-in text-gray-400">
                        <span className="text-9xl grayscale opacity-30">🌌</span>
                        <p className="font-black text-2xl uppercase tracking-widest text-center">{T.empty[lang]}</p>
                        <p className="text-sm font-bold">{T.emptyDesc[lang]}</p>
                    </div>
                )}

                {collectedStories.map((story, idx) => {
                    const isCloud = story.isCloud;
                    return (
                        <div key={story.id} onClick={() => setSelectedStory(story)} className="bg-white border-[4px] border-black rounded-[2rem] p-6 shadow-[10px_10px_0_black] flex flex-col items-start cursor-pointer hover:-translate-y-2 hover:shadow-[15px_15px_0_black] transition-all relative group" style={{ animation: `collection-float ${6 + (idx % 3)}s ease-in-out infinite alternate` }}>
                            {/* “胶带”装饰 */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 rotate-[15deg] group-hover:rotate-[5deg] transition-transform"><Icons.Tape /></div>

                            {/* 云端图标 */}
                            {isCloud && <div className="absolute top-4 right-6 text-xl text-blue-400" title="Cloud Synced">📡</div>}

                            <div className="flex justify-between w-full items-center mb-4 mt-2">
                                <span className="bg-[#E0F2FE] border-2 border-black text-blue-800 font-mono text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-[0.2em]">{story.date}</span>
                                <div className="flex gap-3 items-center">
                                    <div className="flex items-center gap-1"><Icons.Heart className="w-4 h-4" /> <span className="font-black text-sm text-black">{story.likes ?? 0}</span></div>
                                    <div className="flex items-center gap-1"><Icons.Comment className="w-4 h-4" /> <span className="font-black text-sm text-black">{story.comments?.length ?? 0}</span></div>
                                </div>
                            </div>

                            <h3 className="font-black font-hand text-2xl uppercase tracking-tighter text-black leading-tight mb-2 truncate w-full">{story.title[lang] || story.title.en}</h3>
                            <p className="font-hand text-lg text-gray-600 leading-relaxed mb-6 line-clamp-3 w-full">"{story.content[lang] || story.content.en}"</p>

                            <div className="font-mono text-[10px] text-gray-400 uppercase tracking-widest mt-auto">FROM: <span className="font-bold text-gray-800">{story.author}</span></div>
                        </div>
                    );
                })}
            </div>

            {/* 🌟 故事详细弹窗 */}
            {selectedStory && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in pointer-events-auto">
                    <div className="bg-[#FFFBEB] border-[5px] border-black rounded-[3rem] p-8 w-full max-w-lg max-h-[90vh] shadow-[15px_15px_0_black] flex flex-col items-center animate-scale-in relative overflow-hidden" style={{ backgroundImage: 'radial-gradient(#e0e0dc 1.2px, transparent 1.2px)', backgroundSize: '18px 18px' }}>
                        <button onClick={() => setSelectedStory(null)} className="absolute top-4 right-6 text-4xl font-black text-gray-400 hover:text-black transition-colors z-10">&times;</button>

                        <div className="w-full flex-1 overflow-y-auto custom-scrollbar px-2 pb-6 flex flex-col items-center">
                            <div className="bg-blue-100 text-blue-800 font-mono text-[10px] font-bold px-4 py-1 rounded-full border-2 border-black mb-6 uppercase tracking-[0.2em] shadow-sm mt-4">{selectedStory.date}</div>
                            <h3 className="font-black font-hand text-4xl uppercase tracking-tighter text-center mb-6">{selectedStory.title[lang] || selectedStory.title.en}</h3>
                            <p className="font-hand text-2xl text-gray-800 text-center leading-relaxed mb-8 px-4 whitespace-pre-line">"{selectedStory.content[lang] || selectedStory.content.en}"</p>

                            <div className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-8 bg-white border-[3px] border-black px-6 py-2 rounded-full shadow-[3px_3px_0_black]">WRITTEN BY: <span className="font-black text-black">{selectedStory.author}</span></div>

                            {/* 社交信息统计排 */}
                            <div className="flex gap-8 w-full justify-center bg-white border-[4px] border-black rounded-2xl py-4 mb-6 shadow-[4px_4px_0_black]">
                                <div className="flex flex-col items-center gap-1"><Icons.Heart className="w-8 h-8 animate-pulse" /> <span className="font-black text-xl text-black">{selectedStory.likes ?? 0}</span></div>
                                <div className="w-1 h-12 bg-gray-200 rounded-full" />
                                <div className="flex flex-col items-center gap-1"><Icons.Comment className="w-8 h-8" /> <span className="font-black text-xl text-black">{selectedStory.comments?.length ?? 0}</span></div>
                            </div>

                            {/* 评论列表展示区 */}
                            {selectedStory.comments && selectedStory.comments.length > 0 && (
                                <div className="w-full mt-2 flex flex-col gap-3">
                                    <h4 className="font-black text-sm uppercase text-gray-400 mb-2 border-b-2 border-dashed border-gray-300 pb-2">Comments</h4>
                                    {selectedStory.comments.map((comment, i) => (
                                        <div key={i} className="bg-white border-2 border-black rounded-xl p-3 shadow-sm flex flex-col gap-1">
                                            <div className="flex justify-between items-center">
                                                <span className="font-black text-xs">{comment.author}</span>
                                                <span className="font-mono text-[8px] text-gray-400">{comment.date}</span>
                                            </div>
                                            <p className="font-bold text-sm text-gray-700">{comment.text}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        @keyframes collection-float { 0% { transform: translateY(0); } 100% { transform: translateY(-8px); } }
      `}</style>
        </div>
    );
};