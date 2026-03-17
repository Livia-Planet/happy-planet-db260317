import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Language, PassportData, ViewMode, StoryEntry } from '../types';
import { Avatar } from './Avatar';
import { getDominantStat, calculateStats, getStarDate } from '../utils/gameLogic';
import { CarrotCoinIcon } from './Icons';
import { SpaceBackground } from './SpaceBackground';
import { useAnimateTokens } from '../hooks/useAnimateTokens';
import { PLANET_PARTS_DB } from '../data/parts';

// 🌟 全新 SVG 图标库 (包含奶茶和充能状态)
const SocialIcons = {
    StarSand: ({ className = "w-6 h-6" }) => (<svg viewBox="0 0 24 24" fill="#60EFFF" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6-6.2-4.5-6.2 4.5 2.4-7.6L2 9.6h7.6z" /><circle cx="12" cy="12" r="3" fill="white" /></svg>),
    Bottle: ({ className = "w-8 h-8" }) => (<svg viewBox="0 0 24 24" fill="#E0F2FE" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M8 3h8v3l3 4v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V10l3-4V3z" /><path d="M8 3V2h8v1" /><path d="M5 10h14" opacity="0.4" /><path d="M12 12l1.5 3h3l-2.5 2 1 3-2.5-2-2.5 2 1-3-2.5-2h3z" fill="#FFD700" stroke="none" /></svg>),
    Crosshair: ({ className = "w-6 h-6" }) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><circle cx="12" cy="12" r="3" fill="#60EFFF" /></svg>),
    Battery: ({ level, phase }: { level: number, phase: 'red' | 'yellow' | null }) => {
        const color1 = phase === 'red' ? '#EF4444' : phase === 'yellow' ? '#FBBF24' : '#82E0AA';
        const color2 = phase === 'red' ? 'none' : phase === 'yellow' ? '#FBBF24' : '#82E0AA';
        const color3 = phase === 'red' ? 'none' : phase === 'yellow' ? 'none' : '#82E0AA';
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 transition-colors duration-500">
                <rect x="2" y="7" width="18" height="10" rx="2" fill="white" />
                <line x1="22" y1="10" x2="22" y2="14" />
                {(level >= 1 || phase) && <rect x="4" y="9" width="4" height="6" fill={color1} stroke="none" className="transition-colors duration-500" />}
                {(level >= 2 || phase) && <rect x="9" y="9" width="4" height="6" fill={color2} stroke="none" className="transition-colors duration-500" />}
                {(level >= 3 || phase) && <rect x="14" y="9" width="4" height="6" fill={color3} stroke="none" className="transition-colors duration-500" />}
            </svg>
        )
    },
    BobaShip: ({ className = "w-10 h-10", color = "#FF90E8" }) => (
        <svg viewBox="0 0 24 24" fill={color} stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <ellipse cx="12" cy="14" rx="10" ry="6" />
            <path d="M6 14v-4a6 6 0 0 1 12 0v4" fill="#E0F2FE" />
            <line x1="12" y1="10" x2="15" y2="2" stroke="#FFD700" strokeWidth="3" />
            <circle cx="10" cy="15" r="1.5" fill="black" stroke="none" />
            <circle cx="14" cy="15" r="1.5" fill="black" stroke="none" />
        </svg>
    ),
    MysteryGift: ({ className = "w-10 h-10" }) => (<svg viewBox="0 0 24 24" fill="#A8E6CF" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>),
    CarePackage: ({ className = "w-6 h-6" }) => (<svg viewBox="0 0 24 24" fill="#FF90E8" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="8" width="18" height="13" rx="2" /><path d="M12 8v13" /><path d="M19 12H5" /><path d="M12 8c-2-3-5-2-5 0s5 2 5 2 5-1 5-2-3-3-5 0z" fill="#FFD700" /></svg>),
    Envelope: ({ className = "w-6 h-6" }) => (<svg viewBox="0 0 24 24" fill="#FFFBEB" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 8l9 6 9-6" /><rect x="3" y="6" width="18" height="12" rx="2" /></svg>)
};

// 🌟 史诗级神谕漂流瓶扩充 (10+ 传说故事)
const LORE_BOTTLES = [
    { id: 'lore_1', author: 'Mummis', date: 'Era I', title: { cn: '创世之风', en: 'Birth of Wind', se: 'Vindens Födelse' }, content: { cn: '当我们在沙漠中抚摸沙子，沙砾学会了在风中舞蹈，寂静中诞生了世界的第一首旋律。', en: 'When we stroke the desert sand, the dust learns to dance in the wind, and the world\'s first melody is born.', se: 'När vi smeker öknens sand, lär sig stoftet dansa i vinden, och ur tystnaden föds världens första melodi.' } },
    { id: 'lore_2', author: 'Puppis', date: 'Era II', title: { cn: '海的梦境', en: 'Ocean Dreams', se: 'Havets Drömmar' }, content: { cn: '我睡在地表深处，我的梦境化作了河流与湖泊。当水面闪烁时，我就醒来了。', en: 'I sleep beneath the surface, and my dreams form rivers and lakes. When the water gleams, I have awakened.', se: 'Jag sover under planetens yta, och mina drömmar formar floder och sjöar. När vattnet glimmar, har jag just vaknat.' } },
    { id: 'lore_3', author: 'Luma.I', date: 'Era I', title: { cn: '光之记忆', en: 'Memory of Light', se: 'Ljuset som minns' }, content: { cn: '当黑夜合上眼，我将光明折叠。每一束光，都是宇宙未曾遗忘的叹息。', en: 'When the night closes its eyes, I fold the light. Every beam is a sigh the universe never forgot.', se: 'När mörkret sjunker, minns jag allt. Min blick är stjärnornas språk.' } },
    { id: 'lore_4', author: 'Noctu.R', date: 'Era I', title: { cn: '黑夜的守护', en: 'Guard of the Night', se: 'Nattens Väktare' }, content: { cn: '我将黑暗如布匹般铺展，藏起繁星，只为让疲惫的心能在梦中安息。', en: 'I unfold the darkness like a cloth, hiding the stars so tired hearts can rest.', se: 'Han viker mörkret som tyg, och gömmer stjärnorna tills de behövs.' } },
    { id: 'lore_5', author: 'Aeri.T', date: 'Era I', title: { cn: '风中的笑声', en: 'Laughter in the Wind', se: 'Skratt i Vinden' }, content: { cn: '你在风暴中听到的不是呼啸，那是我和沙尘追逐时留下的笑声！', en: 'What you hear in the storm is not howling, it is my laughter chasing the dust!', se: 'I varje virvel gömmer sig ett skratt. Vindens dans slutar aldrig.' } },
    { id: 'lore_6', author: 'Skyni.E', date: 'Era I', title: { cn: '云的静默', en: 'Silence of Clouds', se: 'Molnens Tystnad' }, content: { cn: '当风暴沉睡，我将低语收集成雨。降落在火星上的，是天空的眼泪。', en: 'When the storm sleeps, I gather whispers into rain. It is the sky crying over Mars.', se: 'När stormen sover, vakar hon. Hon samlar viskningarna till regn.' } },
    { id: 'lore_7', author: 'Vilde.A', date: 'Era II', title: { cn: '山脉的童年', en: 'Childhood of Mountains', se: 'Bergens Barndom' }, content: { cn: '石头裂开时，我在微笑。我让种子做梦，让山脉记起它们还是沙粒的童年。', en: 'I smile when the stone cracks. I let seeds dream and make mountains remember their sandy childhood.', se: 'Hon låter frön drömma, och berget minns sin barndom.' } },
    { id: 'lore_8', author: 'Indi.A', date: 'Era II', title: { cn: '水晶的心跳', en: 'Crystal Heartbeat', se: 'Kristallens Puls' }, content: { cn: '在洞穴最深处，水晶随我的心跳歌唱。光与暗，原来饮着同一眼泉水。', en: 'Deep in the cave, crystals sing to my heartbeat. Light and dark drink from the same spring.', se: 'När hjärtat slår i grottans mörker, börjar kristallerna sjunga.' } },
    { id: 'lore_9', author: 'Doddi.D', date: 'Era III', title: { cn: '当神明变小', en: 'When Gods Grew Small', se: 'När Gudarna Blev Små' }, content: { cn: '伟大的声音沉寂了，但回声变成了心。真正的力量，来自我们彼此的拥抱。', en: 'Great voices fell silent, but echoes became hearts. True power comes from holding each other.', se: 'De stora rösterna tystnade, men ekot blev till hjärta.' } },
    { id: 'lore_10', author: 'Talrris.A', date: 'Era V', title: { cn: '不需镜子的歌', en: 'Song Without Mirror', se: 'Sång Utan Spegel' }, content: { cn: '世界一起跳舞时，没有谁的形状是错的。我的大嘴巴，是通往快乐的门！', en: 'When the world dances together, no shape is wrong. My big mouth is a door to joy!', se: 'Ingen är fel form när världen dansar tillsammans.' } }
];

// 🌟 十二杯星际奶茶库 (12 Boba Teas)
const BOBA_DB = [
    { id: 'boba_mars', name: { cn: '火星杯 (Marskopp)', en: 'Mars Cup', se: 'Marskopp' }, color: '#EF4444', desc: { cn: '红色的液体像岩浆般涌动，喝下它能获得无尽的勇气。', en: 'Red liquid surging like magma, granting endless bravery.', se: 'Röd vätska som magma, ger oändligt mod.' } },
    { id: 'boba_jupiter', name: { cn: '木星杯 (Jupiterkopp)', en: 'Jupiter Cup', se: 'Jupiterkopp' }, color: '#F59E0B', desc: { cn: '巨大的杯子里充满智慧的风暴，一口喝下聪明绝顶！', en: 'A huge cup filled with storms of wisdom!', se: 'En stor kopp fylld med visdomens stormar!' } },
    { id: 'boba_saturn', name: { cn: '土星杯 (Saturnuskopp)', en: 'Saturn Cup', se: 'Saturnuskopp' }, color: '#FDE047', desc: { cn: '带着一圈冰晶星环，喝了会忍不住在空中翻跟头！', en: 'Comes with an ice ring. Makes you do backflips!', se: 'Med en isring. Får dig att göra bakåtkullerbyttor!' } },
    { id: 'boba_mercury', name: { cn: '水星杯 (Merkuriuskopp)', en: 'Mercury Cup', se: 'Merkuriuskopp' }, color: '#94A3B8', desc: { cn: '速度的化身！喝完感觉连光都追不上你。', en: 'The embodiment of speed! Even light cannot catch you.', se: 'Hastighetens inkarnation! Snabbare än ljuset.' } },
    { id: 'boba_uranus', name: { cn: '天王星杯 (Uranuskopp)', en: 'Uranus Cup', se: 'Uranuskopp' }, color: '#38BDF8', desc: { cn: '冰冷的蓝色液体，据说能让人看透命运的轨迹。', en: 'Cold blue liquid, said to let you see the tracks of fate.', se: 'Kall blå vätska, låter dig se ödets spår.' } },
    { id: 'boba_neptune', name: { cn: '海王星杯 (Neptunuskopp)', en: 'Neptune Cup', se: 'Neptunuskopp' }, color: '#1D4ED8', desc: { cn: '深邃如海，喝下它，所有的错误都会被宇宙原谅。', en: 'Deep as the ocean. All mistakes are forgiven by the cosmos.', se: 'Djup som havet. Alla misstag förlåts av kosmos.' } },
    { id: 'boba_sun', name: { cn: '太阳杯 (Solkopp)', en: 'Sun Cup', se: 'Solkopp' }, color: '#FACC15', desc: { cn: '极其烫嘴！燃烧的能量让人全属性爆发！', en: 'Extremely hot! Burning energy boosts all stats!', se: 'Extremt het! Brännande energi ökar allt!' } },
    { id: 'boba_moon', name: { cn: '月亮杯 (Månkopp)', en: 'Moon Cup', se: 'Månkopp' }, color: '#E2E8F0', desc: { cn: '安静的银色茶汤，让人能在黑暗中看到未来。', en: 'Quiet silver tea, lets you see the future in the dark.', se: 'Tyst silverte, låter dig se framtiden i mörkret.' } },
    { id: 'boba_venus', name: { cn: '金星杯 (Venuskopp)', en: 'Venus Cup', se: 'Venuskopp' }, color: '#F472B6', desc: { cn: '粉色的浪漫泡泡，喝完周围的人都会莫名其妙变得开心。', en: 'Pink romantic bubbles. Everyone around becomes happy.', se: 'Rosa romantiska bubblor. Alla runt omkring blir glada.' } },
    { id: 'boba_earth', name: { cn: '地球杯 (Jordkopp)', en: 'Earth Cup', se: 'Jordkopp' }, color: '#4ADE80', desc: { cn: '充满生机的绿色，拥有起死回生、重头再来的魔力！', en: 'Vibrant green. Holds the magic to start over and revive!', se: 'Levande grön. Har magin att börja om och återuppliva!' } },
    { id: 'wormhole_cup', name: { cn: '虫洞杯 (Maskhålskopp)', en: 'Wormhole Cup', se: 'Maskhålskopp' }, color: '#C084FC', desc: { cn: '传说中的宇宙捷径！直接带回农场，秒杀探险时间！', en: 'Legendary shortcut! Instantly finishes farm expeditions!', se: 'Legendarisk genväg! Avslutar expeditioner direkt!' } },
    { id: 'blackhole_cup', name: { cn: '黑洞杯 (Svarthålskopp)', en: 'Blackhole Cup', se: 'Svarthålskopp' }, color: '#1E293B', desc: { cn: '极度危险！会吸走胡萝卜币，但也会吐出意想不到的宝物！', en: 'Extremely dangerous! Sucks coins but spits out treasures!', se: 'Extremt farlig! Suger mynt men spottar ut skatter!' } }
];

// 🌟 全宇宙原住民图鉴 (每次随机抽3句台词，绝对不重样)
const NATIVES_DB = [
    { id: 'n_mummis', name: 'Mummis', imgUrl: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Mummis.png', parts: { body: 'body_classic', ears: 'ears_classic', face: 'eyes_dot', hair: 'hair_none', hair_b: 'hair_b_none', access: 'access_none' }, pParts: { base: 'planet_base_yellow', surface: 'planet_surf_none', atmosphere: 'planet_atmo_none', companion: 'planet_comp_none' }, stats: { mod: 5, bus: 5, klurighet: 9 }, dialogs: { cn: ['嘘...你听，沙子在唱歌。', '第一首火星的旋律，是由风写下的。', '不要害怕寂静，寂静是音乐的开始。'], en: ['Shh... listen to the sand singing.', 'The first Martian melody was written by the wind.', 'Do not fear silence; it is the start of music.'], se: ['Sch... lyssna på sanden som sjunger.', 'Mars första melodi skrevs av vinden.', 'Räds inte tystnaden, den är början på musik.'] } },
    { id: 'n_puppis', name: 'Puppis', imgUrl: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Puppis.png', parts: { body: 'body_blue', ears: 'ears_white', face: 'mouth_smile', hair: 'hair_none', hair_b: 'hair_b_none', access: 'access_none' }, pParts: { base: 'planet_base_blue', surface: 'planet_surf_swirls', atmosphere: 'planet_atmo_none', companion: 'planet_comp_none' }, stats: { mod: 4, bus: 6, klurighet: 8 }, dialogs: { cn: ['我做了一个梦，梦变成了一条蓝色的河。', '水面闪烁的时候，就是我醒来的时候。', '眼泪也是一种很美的河流哦。'], en: ['I had a dream, and it became a blue river.', 'When the water gleams, I am awake.', 'Tears are a beautiful kind of river too.'], se: ['Jag drömde en dröm som blev till en blå flod.', 'När vattnet glimmar har jag vaknat.', 'Tårar är också en vacker flod.'] } },
    { id: 'n_ufoni', name: 'UFONi.A', imgUrl: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/UFOni.png', parts: { body: 'body_white', ears: 'ears_none', face: 'face_innocent', hair: 'hair_none', hair_b: 'hair_b_none', access: 'access_robot' }, pParts: { base: 'planet_base_purple', surface: 'planet_surf_rings', atmosphere: 'planet_atmo_glow', companion: 'planet_comp_ufo' }, stats: { mod: 2, bus: 5, klurighet: 8 }, dialogs: { cn: ['光是由各种颜色组成的，你看到了吗？', '我收集星星的声音，把它翻译成笑声。', '飞得再远，也不如在杯子里看见自己。'], en: ['Light is made of all colors, see?', 'I translate star sounds into laughter.', 'Traveling far is nothing compared to finding yourself in a cup.'], se: ['Ljus består av alla färger, ser du?', 'Jag översätter stjärnljud till skratt.', 'Att resa långt är inget mot att finna sig själv i en kopp.'] } },
    { id: 'n_kitty', name: 'Kitty.A', imgUrl: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Kitty.png', parts: { body: 'body_mimosa', ears: 'ears_mimosa', face: 'eyes_glasses', hair: 'hair_fashion', hair_b: 'hair_b_none', access: 'access_beret' }, pParts: { base: 'planet_base_green', surface: 'planet_surf_crystal', atmosphere: 'planet_atmo_aurora', companion: 'planet_comp_moon' }, stats: { mod: 7, bus: 4, klurighet: 6 }, dialogs: { cn: ['我刚才在种花，不小心吹起了一阵香气风暴！', '把光种进土里，花儿就会对你笑。', '用友情浇灌的土地，长出的胡萝卜特别甜！'], en: ['I was planting flowers and started a scent storm!', 'Plant light in soil, and flowers smile at you.', 'Carrots grown with friendship are the sweetest!'], se: ['Jag planterade blommor och startade en doftstorm!', 'Plantera ljus i jorden så ler blommorna mot dig.', 'Morötter odlade med vänskap är sötast!'] } },
    { id: 'n_talrris', name: 'Talrris.A', imgUrl: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Talrris.png', parts: { body: 'body_amber', ears: 'ears_camel', face: 'mouth_open', hair: 'hair_none', hair_b: 'hair_b_none', access: 'access_none' }, pParts: { base: 'planet_base_white', surface: 'planet_surf_none', atmosphere: 'planet_atmo_aurora', companion: 'planet_comp_comet' }, stats: { mod: 8, bus: 8, klurighet: 4 }, dialogs: { cn: ['啊啊啊啊啊——我在唱歌，你听懂了吗？', '他们说我嘴巴大，但这能装下更多的快乐！', '没有镜子我也知道自己很可爱！'], en: ['Ahhhhh! I am singing, do you understand?', 'They say my mouth is big, but it holds more joy!', 'I know I am cute even without a mirror!'], se: ['Ahhhhh! Jag sjunger, förstår du?', 'De säger att min mun är stor, men den rymmer mer glädje!', 'Jag vet att jag är söt även utan spegel!'] } },
    { id: 'n_algglaffen', name: 'Älgglaffen.A', imgUrl: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Älgglaffen.png', parts: { body: 'body_dark', ears: 'ears_dark', face: 'eyes_dot', hair: 'hair_none', hair_b: 'hair_b_none', access: 'access_tophat' }, pParts: { base: 'planet_base_black', surface: 'planet_surf_stars', atmosphere: 'planet_atmo_nebula', companion: 'planet_comp_station' }, stats: { mod: 7, bus: 7, klurighet: 7 }, dialogs: { cn: ['原来宇宙里还有这么多奇形怪状的生命！', '我的角像叉子？那是用来捕捉流星的！', '当世界一起跳舞，就没有谁是错的形状。'], en: ['So many weird lives in the universe!', 'My horns look like forks? They catch shooting stars!', 'When the world dances, no shape is wrong.'], se: ['Så många konstiga liv i universum!', 'Ser mina horn ut som gafflar? De fångar stjärnskott!', 'När världen dansar är ingen form fel.'] } },
    { id: 'n_mimi', name: 'Mimi.V', imgUrl: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Mimi.png', parts: { body: 'body_white', ears: 'ears_white', face: 'eyes_dot', hair: 'hair_none', hair_b: 'hair_b_none', access: 'access_none' }, pParts: { base: 'planet_base_green', surface: 'planet_surf_river', atmosphere: 'planet_atmo_glow', companion: 'planet_comp_none' }, stats: { mod: 9, bus: 5, klurighet: 5 }, dialogs: { cn: ['喵～只要有一条河，我就能找到你。', '我的呼噜声，和火星的心跳是一个频率哦。', '在木头上睡觉，漂流到哪里就在哪里安家。'], en: ['Meow~ As long as there is a river, I will find you.', 'My purr matches the heartbeat of Mars.', 'Sleeping on a log, home is wherever I float.'], se: ['Mjau~ Så länge det finns en flod hittar jag dig.', 'Mitt spinnande matchar Mars hjärtslag.', 'Sover på en stock, hem är där jag flyter.'] } },
    { id: 'n_kodo', name: 'Kodo.J', imgUrl: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Kodo.png', parts: { body: 'body_amber', ears: 'ears_dark', face: 'mouth_smile', hair: 'hair_fashion', hair_b: 'hair_b_none', access: 'access_none' }, pParts: { base: 'planet_base_yellow', surface: 'planet_surf_none', atmosphere: 'planet_atmo_none', companion: 'planet_comp_none' }, stats: { mod: 5, bus: 6, klurighet: 8 }, dialogs: { cn: ['走错路了？没关系，正好在这里办个野餐！', '迷宫里找不到出口，那就把迷宫吃掉！', '只要有蛋糕，哪里都是家。'], en: ['Lost? No problem, let us have a picnic right here!', 'Can not find the exit? Let us eat the maze!', 'Anywhere with cake is home.'], se: ['Vilse? Inga problem, vi har picknick precis här!', 'Hittar du inte ut? Vi äter upp labyrinten!', 'Överallt med tårta är hemma.'] } }
];


interface SocialScreenProps {
    currentLang: Language; carrotCoins: number; starSand: number;
    onUpdateCoins: (amount: number) => void; onUpdateStarSand: (amount: number) => void;
    passports: PassportData[]; onNavigate: (view: ViewMode) => void; playSound: (type: any) => void;
    onUpdatePassport: (id: string, field: keyof PassportData, value: any) => void;
    unlockedParts?: string[]; onUnlockPart?: (partId: string) => void;
    unlockedShopItems?: string[]; onUnlockShopItem?: (itemId: string) => void;
    inventory: Record<string, number>;
    onUpdateInventory: (id: string, amount: number) => void;
}

export const SocialScreen: React.FC<SocialScreenProps> = ({
    currentLang, carrotCoins, starSand, onUpdateCoins, onUpdateStarSand, passports, onNavigate, playSound, onUpdatePassport, unlockedParts = [], onUnlockPart, unlockedShopItems = [], onUnlockShopItem, inventory, onUpdateInventory
}) => {
    const { animateToken } = useAnimateTokens();

    const [globalAlert, setGlobalAlert] = useState<string | null>(null);
    const [selectedNeighbor, setSelectedNeighbor] = useState<PassportData | null>(null);
    const [activeEntity, setActiveEntity] = useState<any | null>(null);
    const [stampPrompt, setStampPrompt] = useState<PassportData | null>(null);
    const [speechBubble, setSpeechBubble] = useState<{ text: string, id: string } | null>(null);

    const [isScanning, setIsScanning] = useState(false);
    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
    const [isDragging, setIsDragging] = useState(false);
    const [isWarping, setIsWarping] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });

    const BATTERY_MAX = 3;
    const RECHARGE_TIME_MS = 4 * 60 * 60 * 1000;
    const [battery, setBattery] = useState<number>(() => parseInt(localStorage.getItem('hp_radar_bat') || '3'));
    const [lastScanTime, setLastScanTime] = useState<number>(() => parseInt(localStorage.getItem('hp_radar_time') || Date.now().toString()));
    const [chargePhase, setChargePhase] = useState<'red' | 'yellow' | null>(null); // 充能动画阶段

    const [entities, setEntities] = useState<any[]>(() => {
        const saved = localStorage.getItem('hp_radar_entities');
        return saved ? JSON.parse(saved) : [];
    });

    const [readBottles, setReadBottles] = useState<string[]>(() => {
        const saved = localStorage.getItem('hp_radar_readBottles');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => { localStorage.setItem('hp_radar_entities', JSON.stringify(entities)); }, [entities]);
    useEffect(() => { localStorage.setItem('hp_radar_bat', battery.toString()); }, [battery]);
    useEffect(() => { localStorage.setItem('hp_radar_time', lastScanTime.toString()); }, [lastScanTime]);
    useEffect(() => { localStorage.setItem('hp_radar_readBottles', JSON.stringify(readBottles)); }, [readBottles]);

    useEffect(() => {
        if (battery < BATTERY_MAX) {
            const now = Date.now();
            const recovered = Math.floor((now - lastScanTime) / RECHARGE_TIME_MS);
            if (recovered > 0) {
                setBattery(Math.min(BATTERY_MAX, battery + recovered));
                setLastScanTime(now);
            }
        }
    }, [battery, lastScanTime]);

    const permanentNeighbors = useMemo(() => passports.filter(p => !p.isAssignedToFarm), [passports]);

    const getCoordinates = (index: number, baseRadius: number = 20) => {
        const radius = baseRadius + index * 8;
        const angle = index * (Math.PI * 2 * 0.618);
        return { x: 50 + radius * Math.cos(angle), y: 50 + radius * Math.sin(angle) };
    };

    // 🌟 核心：生成不重样的盲盒实体
    const generateUniverse = () => {
        const count = Math.floor(Math.random() * 3) + 3; // 3 to 5
        const newEntities = [];

        const playerBottles = passports.flatMap(p => (p.stories || []).filter(s => s.isBottled).map(s => ({ id: s.id, author: p.starName || p.name, date: s.date, title: s.title, content: s.content })));
        const allBottles = [...LORE_BOTTLES, ...playerBottles].filter(b => !readBottles.includes(b.id));

        const lockedParts = Object.values(PLANET_PARTS_DB).filter(p => p.isUnlockable && !unlockedParts.includes(p.id));

        const usedNatives = new Set<string>(); // 记录已经抽出的原住民，防止重样！

        for (let i = 0; i < count; i++) {
            const pos = getCoordinates(i, 40);

            // 🌟 核心：绝对权重引擎 (100点总数)
            const random100 = Math.random() * 100;
            let chosenType = '';

            // 漂流瓶 (50%) 
            if (random100 < 50) {
                chosenType = 'bottle';
            }
            // 原住民 (40%，即 50~90 的区间)
            else if (random100 < 90) {
                chosenType = 'native';
            }
            // 星球配件 (5%，即 90~95 的区间)
            else if (random100 < 95) {
                chosenType = 'part';
            }
            // 星际奶茶船 (5%，即 95~100 的区间)
            else {
                chosenType = 'boba';
            }

            // --- 兜底逻辑：如果抽到的东西没库存了，怎么办？ ---

            if (chosenType === 'bottle' && allBottles.length > 0) {
                const bottle = allBottles[Math.floor(Math.random() * allBottles.length)];
                newEntities.push({ uid: `ent_${Date.now()}_${i}`, type: 'bottle', pos, data: bottle });
            }
            else if (chosenType === 'native') {
                const availableNatives = NATIVES_DB.filter(n => !usedNatives.has(n.id));
                if (availableNatives.length > 0) {
                    const native = availableNatives[Math.floor(Math.random() * availableNatives.length)];
                    usedNatives.add(native.id);
                    const selectedDialog = {
                        cn: native.dialogs.cn[Math.floor(Math.random() * native.dialogs.cn.length)],
                        en: native.dialogs.en[Math.floor(Math.random() * native.dialogs.en.length)],
                        se: native.dialogs.se[Math.floor(Math.random() * native.dialogs.se.length)]
                    };
                    const rewardCoins = Math.floor(Math.random() * 5) + 1;
                    newEntities.push({ uid: `ent_${Date.now()}_${i}`, type: 'native', pos, data: { ...native, dialog: selectedDialog, rewardCoins } });
                } else {
                    // 原住民抽光了，给个漂流瓶补偿
                    const backupBottle = allBottles[Math.floor(Math.random() * allBottles.length)] || LORE_BOTTLES[0];
                    newEntities.push({ uid: `ent_${Date.now()}_${i}`, type: 'bottle', pos, data: backupBottle });
                }
            }
            else if (chosenType === 'part' && lockedParts.length > 0) {
                const part = lockedParts[Math.floor(Math.random() * lockedParts.length)];
                newEntities.push({ uid: `ent_${Date.now()}_${i}`, type: 'part', pos, data: part });
            }
            else {
                // 抽到奶茶 (或者配件没库存了，用奶茶补偿)
                const boba = BOBA_DB[Math.floor(Math.random() * BOBA_DB.length)];
                newEntities.push({ uid: `ent_${Date.now()}_${i}`, type: 'boba', pos, data: boba });
            }
        }
        setEntities(newEntities);
    };

    const showBubble = (type: 'greet' | 'feed', targetId: string) => {
        const texts = type === 'greet'
            ? { cn: ['哇！是遥远星系的信号！', '你好呀！', '接收到脑电波！'], en: ['Signal received!', 'Hello there!', 'Friendly brainwaves!'], se: ['Signal mottagen!', 'Hej där!', 'Vänliga hjärnvågor!'] }
            : { cn: ['谢谢你的关怀包裹！', '火星沙子都跳舞了！'], en: ['Thanks for the care package!', 'The sand is dancing!'], se: ['Tack för omsorgspaketet!', 'Sanden dansar!'] };

        const arr = texts[currentLang];
        setSpeechBubble({ text: arr[Math.floor(Math.random() * arr.length)], id: targetId });
        setTimeout(() => setSpeechBubble(null), 4000);
    };

    const triggerWarp = () => {
        playSound('whoosh');
        setIsWarping(true);
        setTimeout(() => setIsWarping(false), 300);
    };

    const zoomIn = () => { triggerWarp(); setTransform(prev => ({ ...prev, scale: Math.min(prev.scale * 1.2, 2.5) })); };
    const zoomOut = () => { triggerWarp(); setTransform(prev => ({ ...prev, scale: Math.max(prev.scale * 0.8, 0.4) })); };

    const handlePointerDown = (e: React.PointerEvent) => { setIsDragging(true); dragStart.current = { x: e.clientX - transform.x, y: e.clientY - transform.y }; };
    const handlePointerMove = (e: React.PointerEvent) => { if (!isDragging) return; setTransform(prev => ({ ...prev, x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y })); };
    const handlePointerUp = () => setIsDragging(false);

    const handleFeedNeighbor = () => {
        if (!selectedNeighbor) return;
        if (carrotCoins < 5) { playSound('error'); setGlobalAlert(currentLang === 'cn' ? '胡萝卜币不够啦！' : 'Not enough carrots!'); return; }

        playSound('success'); showBubble('feed', selectedNeighbor.id);
        animateToken('social-wallet-carrot', `perm-${selectedNeighbor.id}`, '🥕', false);
        onUpdateCoins(-5);

        setTimeout(() => { playSound('achievement'); animateToken(`perm-${selectedNeighbor.id}`, 'social-wallet-starsand', '✨', true); onUpdateStarSand(10); }, 500);

        const curHunger = selectedNeighbor.hunger ?? 80;
        onUpdatePassport(selectedNeighbor.id, 'hunger', Math.min(100, curHunger + 30));
        setStampPrompt(selectedNeighbor); setSelectedNeighbor(null);
    };

    const handleWriteStamp = () => {
        //... 写入手帐逻辑 (保持不变) ...
        if (!stampPrompt) return;
        playSound('stamp');
        const storageKey = `happyPlanet_stories_${stampPrompt.id}`;
        const localRaw = localStorage.getItem(storageKey);
        const existingStories: StoryEntry[] = localRaw ? JSON.parse(localRaw) : (stampPrompt.stories || []);

        const capacities = [5, 7, 6, 8, 5, 5, 8, 7, 10];
        let targetGalaxy = 0, targetStar = 0, found = false;

        for (let g = 0; g < capacities.length; g++) {
            for (let s = 0; s < capacities[g]; s++) {
                if (!existingStories.some(st => st.galaxyIndex === g && st.starIndex === s)) {
                    targetGalaxy = g; targetStar = s; found = true; break;
                }
            }
            if (found) break;
        }

        if (found) {
            const activeFarmPet = passports.find(p => p.isAssignedToFarm);
            const visitorName = activeFarmPet ? activeFarmPet.name : (currentLang === 'cn' ? '神秘旅人' : 'A Traveler');
            const newStory: StoryEntry = { id: `${targetGalaxy}-${targetStar}`, date: getStarDate(), title: { cn: '星际馈赠', en: 'Stellar Gift', se: 'Stjärngåva' }, content: { cn: `今天，来自远方的 ${visitorName} 穿过了星云来看我！\n感谢三众神的恩赐。`, en: `Today, ${visitorName} visited! Thanks to the Three Gods.`, se: `Idag besökte ${visitorName} mig! Tack vare De Tre Gudarna.` }, galaxyIndex: targetGalaxy, starIndex: targetStar, hasReceivedReward: true };
            const updatedStories = [...existingStories, newStory];
            localStorage.setItem(storageKey, JSON.stringify(updatedStories));
            onUpdatePassport(stampPrompt.id, 'stories', updatedStories);
        } else { setGlobalAlert(currentLang === 'cn' ? '手帐贴满啦！' : 'Storybook full!'); }
        setStampPrompt(null);
    };

    const handleRescan = () => {
        if (battery <= 0) { playSound('error'); setGlobalAlert(currentLang === 'cn' ? '雷达能量耗尽啦！\n每 4 小时恢复一格，或者花 20 🥕 强制充能！' : 'Radar out of energy!'); return; }
        playSound('searching'); setBattery(prev => prev - 1); setLastScanTime(Date.now());
        setIsScanning(true); setEntities([]);
        setTimeout(() => { generateUniverse(); setIsScanning(false); triggerWarp(); }, 2000);
    };

    // 🌟 沉浸式充能动画 (红 -> 黄 -> 绿充满)
    const handleRecharge = () => {
        if (battery >= BATTERY_MAX) return;
        if (carrotCoins >= 20) {
            onUpdateCoins(-20);
            playSound('whirring'); // 播放类似引擎启动的轰鸣声
            setChargePhase('red');
            setTimeout(() => setChargePhase('yellow'), 1000);
            setTimeout(() => {
                setChargePhase(null);
                setBattery(BATTERY_MAX);
                setLastScanTime(Date.now());
                playSound('click'); // 充满时叮一声
            }, 2500); // 大约 2.5 秒充满
        } else {
            playSound('error'); setGlobalAlert(currentLang === 'cn' ? '需要 20 胡萝卜币才能强制充能！' : 'Need 20 carrots!');
        }
    };

    // 认领盲盒实体 (阅后即焚)
    const handleClaimEntity = (action: 'like_bottle' | 'listen_native' | 'unlock_part' | 'buy_boba') => {
        if (!activeEntity) return;

        if (action === 'buy_boba') {
            if (starSand < 30) { playSound('error'); setGlobalAlert(currentLang === 'cn' ? '星砂不够！' : 'Not enough Star Sand!'); return; }
            onUpdateStarSand(-30);
            if (onUnlockShopItem && !unlockedShopItems?.includes(activeEntity.data.id)) onUnlockShopItem(activeEntity.data.id);
            // 🌟 核心：存进库存账本！
            onUpdateInventory(activeEntity.data.id, 1);
            playSound('success'); setGlobalAlert(currentLang === 'cn' ? `🥤 成功购买 [${activeEntity.data.name.cn}]！\n已存入农场背包！` : `Bought ${activeEntity.data.name.en}!`);
        }
        else if (action === 'unlock_part') {
            if (carrotCoins < 20) { playSound('error'); setGlobalAlert(currentLang === 'cn' ? '胡萝卜币不够破译遗迹！' : 'Not enough carrots!'); return; }
            onUpdateCoins(-20);
            animateToken('social-wallet-carrot', `ent_${activeEntity.uid}`, '🥕', false);
            setTimeout(() => {
                playSound('achievement');
                if (onUnlockPart) onUnlockPart(activeEntity.data.id);
                setGlobalAlert(currentLang === 'cn' ? `🎁 遗迹破译成功！\n[${activeEntity.data.name[currentLang]}] 已加入创造器！` : 'New Planet Part Unlocked!');

                playSound('whoosh');
                setEntities(prev => prev.filter(e => e.uid !== activeEntity.uid));
                setActiveEntity(null);
            }, 500);
            return; // 提前退出，等待动画
        }
        else if (action === 'listen_native') {
            playSound('coins');
            animateToken('avatar-center', 'social-wallet-carrot', '🥕', true);
            onUpdateCoins(activeEntity.data.rewardCoins); // 随机 1-5 个金币！
            setGlobalAlert(currentLang === 'cn' ? `${activeEntity.data.name} 笑着送给你 ${activeEntity.data.rewardCoins} 个 🥕！` : `Received ${activeEntity.data.rewardCoins} Carrots!`);
        }
        else if (action === 'like_bottle') {
            playSound('stamp'); animateToken('avatar-center', 'social-wallet-starsand', '✨', true); onUpdateStarSand(1);
            setReadBottles(prev => [...prev, activeEntity.data.id]);
        }

        playSound('whoosh');
        setEntities(prev => prev.filter(e => e.uid !== activeEntity.uid));
        setActiveEntity(null);
    };

    return (
        <div className={`fixed inset-0 z-40 bg-[#0a0a12] overflow-hidden font-rounded select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
            <div className="absolute inset-0 z-0 opacity-70 pointer-events-none">
                <SpaceBackground bpm={30} themeColor="#60EFFF" meteorDensity={3} />
            </div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-80 z-10">
                <div className="absolute w-[30vw] h-[30vw] rounded-full border-2 border-[#60EFFF] opacity-40 shadow-[0_0_30px_rgba(96,239,255,0.3)]" />
                <div className="absolute w-[60vw] h-[60vw] rounded-full border border-[#60EFFF] opacity-20 border-dashed" />
                <div className="absolute w-[120vw] h-[120vw] rounded-full radar-sweep pointer-events-none" />
            </div>

            <div className="absolute top-6 left-6 z-50 pointer-events-auto flex flex-col gap-3">
                <div className="flex gap-3">
                    <div id="social-wallet-starsand" className="bg-white/10 backdrop-blur-md px-4 py-2 border-[3px] border-[#60EFFF] rounded-2xl flex items-center gap-2 shadow-[4px_4px_0_black]">
                        <SocialIcons.StarSand className="w-5 h-5" />
                        <span className="font-black text-xl text-white tracking-widest">{starSand}</span>
                    </div>
                    <div id="social-wallet-carrot" className="bg-white/10 backdrop-blur-md px-4 py-2 border-[3px] border-[#FFD700] rounded-2xl flex items-center gap-2 shadow-[4px_4px_0_black]">
                        <CarrotCoinIcon className="w-5 h-5" />
                        <span className="font-black text-xl text-white tracking-widest">{carrotCoins}</span>
                    </div>
                </div>
                <button onClick={handleRecharge} disabled={chargePhase !== null} className={`bg-white/10 backdrop-blur-md px-4 py-2 border-[3px] border-[#82E0AA] rounded-2xl flex items-center gap-2 shadow-[4px_4px_0_black] w-max transition-colors ${chargePhase !== null ? 'opacity-80' : 'hover:bg-white/20'}`}>
                    <SocialIcons.Battery level={battery} phase={chargePhase} />
                    <span className="font-black text-sm text-[#82E0AA] uppercase ml-1">
                        {chargePhase ? (currentLang === 'cn' ? '充能中...' : 'CHARGING...') : battery < BATTERY_MAX ? (currentLang === 'cn' ? '等待充能' : 'CHARGING') : 'MAX'}
                    </span>
                    {battery < BATTERY_MAX && !chargePhase && <div className="ml-2 flex items-center gap-1 text-[10px] text-yellow-300 border-l border-white/20 pl-2"><CarrotCoinIcon className="w-3 h-3" /> 20</div>}
                </button>
            </div>

            <div className="absolute bottom-28 right-6 z-50 flex flex-col gap-2 pointer-events-auto">
                <button onClick={zoomIn} className="w-10 h-10 bg-white/10 backdrop-blur-md border-2 border-[#60EFFF] text-[#60EFFF] rounded-xl flex items-center justify-center text-xl font-black hover:bg-[#60EFFF] hover:text-black transition-colors">+</button>
                <button onClick={zoomOut} className="w-10 h-10 bg-white/10 backdrop-blur-md border-2 border-[#60EFFF] text-[#60EFFF] rounded-xl flex items-center justify-center text-xl font-black hover:bg-[#60EFFF] hover:text-black transition-colors">-</button>
            </div>

            {entities.length === 0 && !isScanning && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
                    <button onClick={handleRescan} className="bg-black/60 backdrop-blur-sm border-[4px] border-[#60EFFF] text-[#60EFFF] px-8 py-4 rounded-full font-black uppercase tracking-widest shadow-[0_0_30px_rgba(96,239,255,0.8)] hover:bg-[#60EFFF] hover:text-black hover:scale-110 transition-all flex items-center gap-3">
                        <SocialIcons.Crosshair className="w-6 h-6 animate-pulse" />
                        {currentLang === 'cn' ? '启动星域扫描' : 'SCAN SECTOR'}
                    </button>
                </div>
            )}

            {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                    <div className="text-[#60EFFF] animate-frantic">
                        <SocialIcons.Crosshair className="w-24 h-24 drop-shadow-[0_0_25px_#60EFFF]" />
                    </div>
                </div>
            )}

            <div className={`absolute inset-0 z-30 transition-all duration-300 ease-out ${isWarping ? 'animate-warp-speed' : ''}`} style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}>
                <div id="avatar-center" className="absolute top-1/2 left-1/2 w-1 h-1 pointer-events-none" />

                {/* 常驻兔子 */}
                {permanentNeighbors.map((neighbor, idx) => {
                    const pos = getCoordinates(idx, 15);
                    return (
                        <div key={neighbor.id} id={`perm-${neighbor.id}`} onClick={(e) => { e.stopPropagation(); playSound('click'); setSelectedNeighbor(neighbor); showBubble('greet', neighbor.id); }} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group hover:scale-110 transition-transform duration-300 pointer-events-auto" style={{ left: `${pos.x}%`, top: `${pos.y}%`, animation: `planet-float ${4 + idx}s ease-in-out infinite` }}>
                            {speechBubble?.id === neighbor.id && (
                                <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-[100] animate-bubble-pop pointer-events-none w-max max-w-[160px]">
                                    <div className="bg-white border-[3px] border-black px-3 py-1.5 rounded-2xl shadow-[4px_4px_0_black] relative"><span className="font-black text-xs leading-tight block text-center text-black">{speechBubble.text}</span><div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-[3px] border-r-[3px] border-black transform rotate-45" /></div>
                                </div>
                            )}
                            <div className="w-16 h-16 bg-[#2c3e50] border-[3px] border-[#60EFFF] rounded-full overflow-hidden flex items-center justify-center relative shadow-[0_0_20px_rgba(96,239,255,0.4)] group-hover:shadow-[0_0_30px_rgba(96,239,255,0.9)]">
                                <div className="scale-[0.5] origin-center translate-y-0"><Avatar selectedParts={neighbor.selectedParts} dominantStat={getDominantStat(calculateStats(neighbor.selectedParts, neighbor.stats))} transparent /></div>
                                {(neighbor.hunger ?? 80) < 50 && (<div className="absolute top-0 right-2 bg-white rounded-full p-1 border-2 border-black animate-bounce"><SocialIcons.CarePackage className="w-4 h-4" /></div>)}
                            </div>
                            <span className="mt-2 bg-black/80 text-[#60EFFF] text-[8px] font-mono font-bold px-2 py-0.5 rounded border border-[#60EFFF]/30 tracking-widest uppercase">{neighbor.name}</span>
                        </div>
                    );
                })}

                {/* 盲盒实体 */}
                {entities.map((entity, idx) => {
                    return (
                        <div key={entity.uid} id={`ent_${entity.uid}`} onClick={(e) => { e.stopPropagation(); playSound('click'); setActiveEntity(entity); }} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group hover:scale-110 transition-transform duration-300 pointer-events-auto" style={{ left: `${entity.pos.x}%`, top: `${entity.pos.y}%`, animation: `planet-float ${5 + idx}s ease-in-out infinite alternate` }}>
                            {entity.type === 'native' && (
                                <>
                                    <div className="w-16 h-16 bg-[#2c3e50] border-[3px] border-[#FF90E8] rounded-full overflow-hidden flex items-center justify-center relative shadow-[0_0_20px_rgba(255,144,232,0.4)] group-hover:shadow-[0_0_30px_rgba(255,144,232,0.9)]">
                                        {entity.data.imgUrl ? <img src={entity.data.imgUrl} alt={entity.data.name} className="w-full h-full object-contain scale-125" /> : <div className="scale-[0.5] origin-center translate-y-0"><Avatar selectedParts={entity.data.parts} dominantStat={getDominantStat(calculateStats(entity.data.parts, entity.data.stats))} transparent /></div>}
                                    </div>
                                    <span className="mt-2 bg-black/80 text-[#FF90E8] text-[8px] font-mono font-bold px-2 py-0.5 rounded border border-[#FF90E8]/30 tracking-widest uppercase">{entity.data.name}</span>
                                </>
                            )}
                            {entity.type === 'bottle' && (<div className="relative transform animate-spin-slow"><SocialIcons.Bottle className="w-10 h-10 drop-shadow-[0_0_15px_rgba(96,239,255,0.8)]" /></div>)}
                            {entity.type === 'part' && (<div className="relative"><SocialIcons.MysteryGift className="w-12 h-12 drop-shadow-[0_0_15px_rgba(168,230,207,0.8)] animate-pulse" /></div>)}
                            {entity.type === 'boba' && (<div className="relative transform animate-float"><SocialIcons.BobaShip color={entity.data.color} className="w-14 h-14 drop-shadow-[0_0_20px_rgba(255,144,232,0.8)]" /><span className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-[#FF90E8] text-[8px] font-mono font-bold px-2 py-0.5 rounded uppercase whitespace-nowrap">BOBA</span></div>)}
                        </div>
                    );
                })}
            </div>

            {/* Portal 弹窗 */}
            {typeof document !== 'undefined' && createPortal(
                <>
                    {selectedNeighbor && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in pointer-events-auto">
                            <div className="bg-[#fdfdf9] border-[5px] border-black rounded-[3rem] p-8 w-full max-w-sm shadow-[15px_15px_0_black] flex flex-col items-center animate-scale-in relative">
                                <button onClick={() => setSelectedNeighbor(null)} className="absolute top-4 right-6 text-4xl font-black text-gray-400 hover:text-black transition-colors">&times;</button>
                                <div className="w-24 h-24 bg-gray-100 border-[4px] border-black rounded-full overflow-hidden flex items-center justify-center shadow-inner mb-4"><div className="scale-[0.7] origin-center translate-y-0"><Avatar selectedParts={selectedNeighbor.selectedParts} dominantStat={getDominantStat(calculateStats(selectedNeighbor.selectedParts, selectedNeighbor.stats))} transparent /></div></div>
                                <h3 className="font-black text-2xl uppercase tracking-widest">{selectedNeighbor.name}</h3>
                                <p className="font-bold text-gray-500 text-xs mb-6 uppercase text-center px-2">{selectedNeighbor.bio || 'Resident of Happy Planet'}</p>
                                <button onClick={handleFeedNeighbor} className="w-full bg-[#82E0AA] border-[4px] border-black py-4 rounded-2xl font-black text-lg shadow-[4px_4px_0_black] active:translate-y-1 active:shadow-none transition-all flex flex-col items-center gap-1 hover:bg-[#6EE7B7]"><span className="uppercase tracking-widest">{currentLang === 'cn' ? '投喂关怀包裹' : 'SEND CARE PACKAGE'}</span><div className="flex items-center gap-4 text-[10px]"><span className="flex items-center text-red-600"><CarrotCoinIcon className="w-3 h-3 mr-1" /> -5</span><span className="flex items-center text-blue-800"><SocialIcons.StarSand className="w-3 h-3 mr-1" /> +10</span></div></button>
                            </div>
                        </div>
                    )}

                    {stampPrompt && (
                        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in pointer-events-auto">
                            <div className="bg-[#FFFBEB] border-[5px] border-black rounded-[2rem] p-6 w-full max-w-xs shadow-[10px_10px_0_black] flex flex-col items-center animate-bounce-in relative">
                                <div className="w-16 h-16 bg-[#FFD700] rounded-full border-[3px] border-black flex items-center justify-center -mt-12 mb-4 shadow-[4px_4px_0_black]"><SocialIcons.Envelope className="w-8 h-8" /></div>
                                <h3 className="font-black text-xl mb-2">{currentLang === 'cn' ? '包裹送达啦！' : 'Package Delivered!'}</h3>
                                <p className="text-gray-600 text-center text-sm font-bold mb-6">{currentLang === 'cn' ? `你想把这次拜访，记录到 ${stampPrompt.name} 的手帐里吗？` : `Write a visitor diary in ${stampPrompt.name}'s notebook?`}</p>
                                <div className="flex gap-3 w-full">
                                    <button onClick={() => setStampPrompt(null)} className="flex-1 border-2 border-black py-3 rounded-xl font-black text-xs hover:bg-gray-100">{currentLang === 'cn' ? '不用了' : 'NO THANKS'}</button>
                                    <button onClick={handleWriteStamp} className="flex-1 bg-black text-white border-2 border-black py-3 rounded-xl font-black text-xs hover:bg-gray-800 shadow-[3px_3px_0_rgba(0,0,0,0.3)]">{currentLang === 'cn' ? '盖上访客章' : 'STAMP DIARY'}</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeEntity && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in pointer-events-auto">
                            <div className="bg-white border-[5px] border-black rounded-[3rem] p-8 w-full max-w-sm shadow-[15px_15px_0_black] flex flex-col items-center animate-scale-in relative" style={{ backgroundImage: 'radial-gradient(#e0e0dc 1.2px, transparent 1.2px)', backgroundSize: '18px 18px' }}>
                                <button onClick={() => setActiveEntity(null)} className="absolute top-4 right-6 text-4xl font-black text-gray-400 hover:text-black transition-colors">&times;</button>

                                {/* 3.1 原住民 */}
                                {activeEntity.type === 'native' && (
                                    <>
                                        <div className="w-24 h-24 bg-gray-100 border-[4px] border-black rounded-full overflow-hidden flex items-center justify-center shadow-inner mb-4 relative">
                                            {activeEntity.data.imgUrl ? <img src={activeEntity.data.imgUrl} className="w-full h-full object-contain scale-125" /> : <div className="scale-[0.7]"><Avatar selectedParts={activeEntity.data.parts} dominantStat={getDominantStat(calculateStats(activeEntity.data.parts, activeEntity.data.stats))} transparent /></div>}
                                        </div>
                                        <h3 className="font-black text-2xl uppercase tracking-widest mb-4">{activeEntity.data.name}</h3>
                                        <div className="bg-[#E0F2FE] border-[3px] border-black p-4 rounded-2xl mb-6 relative w-full">
                                            <p className="font-bold text-gray-800 text-sm text-center">"{activeEntity.data.dialog[currentLang]}"</p>
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#E0F2FE] border-t-[3px] border-l-[3px] border-black transform rotate-45" />
                                        </div>
                                        <button onClick={() => handleClaimEntity('listen_native')} className="w-full bg-[#FFD700] border-[4px] border-black py-4 rounded-2xl font-black text-lg shadow-[4px_4px_0_black] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2">
                                            {currentLang === 'cn' ? '聆听并告别' : 'LISTEN & BYE'} <CarrotCoinIcon className="w-5 h-5" />+{activeEntity.data.rewardCoins}
                                        </button>
                                    </>
                                )}

                                {/* 3.2 漂流瓶 */}
                                {activeEntity.type === 'bottle' && (
                                    <>
                                        <div className="bg-blue-100 text-blue-800 font-mono text-[10px] font-bold px-4 py-1 rounded-full border-2 border-black mb-6 uppercase tracking-[0.2em] shadow-sm">{activeEntity.data.date}</div>
                                        <h3 className="font-black font-hand text-3xl uppercase tracking-tighter text-center mb-4">{activeEntity.data.title[currentLang]}</h3>
                                        <p className="font-hand text-xl text-gray-700 text-center leading-relaxed mb-8 px-2 whitespace-pre-line">"{activeEntity.data.content[currentLang]}"</p>
                                        <div className="font-mono text-xs text-gray-400 uppercase tracking-widest mb-6">FROM: {activeEntity.data.author}</div>
                                        <button onClick={() => handleClaimEntity('like_bottle')} className="w-full bg-[#FFD700] border-[4px] border-black py-4 rounded-2xl font-black text-lg shadow-[4px_4px_0_black] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 hover:bg-[#FACC15]">
                                            {currentLang === 'cn' ? '贴上鼓励星标' : 'STAMP WITH LOVE'} <SocialIcons.StarSand className="w-5 h-5" />+1
                                        </button>
                                    </>
                                )}

                                {/* 3.3 未知配件 */}
                                {activeEntity.type === 'part' && (
                                    <>
                                        <SocialIcons.MysteryGift className="w-20 h-20 mb-4 animate-bounce" />
                                        <h3 className="font-black text-2xl uppercase tracking-widest text-center mb-2">{currentLang === 'cn' ? '发现神秘遗迹' : 'ANCIENT RELIC'}</h3>
                                        <p className="font-bold text-gray-500 text-sm mb-6 text-center">{currentLang === 'cn' ? `扫描到一个未知的星球配件：\n[ ${activeEntity.data.name[currentLang]} ]\n要花 20 胡萝卜币破译并加入创造器吗？` : `Found [ ${activeEntity.data.name[currentLang]} ]!\nDecode and add to Creator for 20 Carrots?`}</p>
                                        <div className="flex gap-3 w-full">
                                            <button onClick={() => { playSound('whoosh'); setEntities(prev => prev.filter(e => e.uid !== activeEntity.uid)); setActiveEntity(null); }} className="flex-1 bg-white border-[4px] border-black py-4 rounded-2xl font-black text-sm active:translate-y-1 transition-all hover:bg-gray-100">
                                                {currentLang === 'cn' ? '放弃' : 'SKIP'}
                                            </button>
                                            <button onClick={() => handleClaimEntity('unlock_part')} className="flex-[2] bg-[#82E0AA] border-[4px] border-black py-4 rounded-2xl font-black text-lg shadow-[4px_4px_0_black] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 hover:bg-[#6EE7B7]">
                                                {currentLang === 'cn' ? '破译' : 'DECODE'} <CarrotCoinIcon className="w-5 h-5" /> -20
                                            </button>
                                        </div>
                                    </>
                                )}

                                {/* 3.4 十二款星际奶茶 */}
                                {activeEntity.type === 'boba' && (
                                    <>
                                        <SocialIcons.BobaShip color={activeEntity.data.color} className="w-24 h-24 mb-4" />
                                        <h3 className="font-black text-2xl uppercase tracking-widest mb-2" style={{ color: activeEntity.data.color }}>{activeEntity.data.name[currentLang]}</h3>
                                        <p className="font-bold text-gray-500 text-sm mb-6 text-center">{activeEntity.data.desc[currentLang]}</p>
                                        <div className="flex gap-3 w-full">
                                            <button onClick={() => { playSound('whoosh'); setEntities(prev => prev.filter(e => e.uid !== activeEntity.uid)); setActiveEntity(null); }} className="flex-1 bg-white border-[4px] border-black py-4 rounded-2xl font-black text-sm active:translate-y-1 transition-all hover:bg-gray-100">
                                                {currentLang === 'cn' ? '不用了' : 'NO THANKS'}
                                            </button>
                                            <button onClick={() => handleClaimEntity('buy_boba')} className="flex-[2] bg-[#FF90E8] border-[4px] border-black py-4 rounded-2xl font-black text-lg shadow-[4px_4px_0_black] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 hover:bg-[#FF7CE0]">
                                                {currentLang === 'cn' ? '购买' : 'BUY'} <SocialIcons.StarSand className="w-4 h-4" /> -30
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {globalAlert && (
                        <div className="fixed inset-0 z-[11000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm pointer-events-auto">
                            <div className="bg-white border-[6px] border-black p-8 rounded-[40px] shadow-[15px_15px_0_black] w-full max-w-[320px] flex flex-col items-center animate-bounce-in">
                                <div className="w-20 h-20 bg-[#FFB7B2] border-[4px] border-black rounded-full flex items-center justify-center mb-6 shadow-[inset_-3px_-3px_0_rgba(0,0,0,0.1)]">
                                    <span className="font-black text-4xl text-black">!</span>
                                </div>
                                <h3 className="font-black text-2xl mb-2 text-center uppercase tracking-tighter">{currentLang === 'cn' ? '等一下！' : 'OOPS!'}</h3>
                                <p className="text-black/60 font-bold mb-8 text-center text-sm whitespace-pre-line leading-relaxed">{globalAlert}</p>
                                <button onClick={() => { playSound('click'); setGlobalAlert(null); }} className="w-full py-4 bg-[#FFD700] border-[4px] border-black rounded-2xl font-black text-xl shadow-[4px_4px_0_black] active:translate-y-1 active:shadow-none transition-all">
                                    {currentLang === 'cn' ? '知道了' : 'GOT IT'}
                                </button>
                            </div>
                        </div>
                    )}
                </>,
                document.body
            )}

            <style>{`
                @keyframes planet-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
                @keyframes radar-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .radar-sweep { background: conic-gradient(from 0deg, transparent 70%, rgba(96, 239, 255, 0.1) 80%, rgba(96, 239, 255, 0.5) 100%); animation: radar-spin 6s linear infinite; }
                
                @keyframes warp-speed {
                    0% { filter: blur(0px); transform: scale(1); }
                    50% { filter: blur(8px) brightness(1.5); }
                    100% { filter: blur(0px); transform: scale(1); }
                }
                .animate-warp-speed { animation: warp-speed 0.3s ease-out; }
                
                @keyframes frantic-search {
                    0% { transform: translate(0, 0) scale(1.5); }
                    20% { transform: translate(-50px, -30px) scale(2) rotate(-15deg); }
                    40% { transform: translate(40px, 40px) scale(1.2) rotate(20deg); }
                    60% { transform: translate(-30px, 50px) scale(1.8) rotate(-10deg); }
                    80% { transform: translate(40px, -50px) scale(1.4) rotate(15deg); }
                    100% { transform: translate(0, 0) scale(1.5); }
                }
                .animate-frantic { animation: frantic-search 0.4s ease-in-out infinite; }
                
                @keyframes bubble-pop {
                    0% { opacity: 0; transform: translateX(-50%) scale(0.5) translateY(10px); }
                    50% { transform: translateX(-50%) scale(1.1) translateY(0); }
                    100% { opacity: 1; transform: translateX(-50%) scale(1) translateY(0); }
                }
                .animate-bubble-pop { animation: bubble-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
            `}</style>
        </div>
    );
};