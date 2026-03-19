import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom'; // 👈 召唤终极居中魔法！
import { Avatar } from './Avatar';
import { SpaceBackground } from './SpaceBackground';
import { CarrotCoinIcon } from './Icons';
import { Language, PassportData, ViewMode, StoryEntry } from '../types';
import { getDominantStat, calculateStats, getStarDate } from '../utils/gameLogic';
import { PARTS_DB, PLANET_PARTS_DB } from '../data/parts';
import { useAnimateTokens } from '../hooks/useAnimateTokens'; // 👈 引入动画引擎

// 🎨 四件新家具的数据库 (自带 emoji 表现形式，用于化身鼠标)
const FURNITURE_DB = [
    { id: 'shower', cursor: '🚿', name: { cn: '淋浴头', en: 'Shower', se: 'Dusch' }, price: 5, int: 5, svg: <svg viewBox="0 0 24 24" fill="none" stroke="#4DABF7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><path d="M12 4v4m-4 4l1.5-1.5m5 0L16 12m-4 4v2m-3-1l-1 1m7-1l1 1" /><path d="M8 8h8v2a4 4 0 01-8 0V8z" fill="#4DABF7" opacity="0.3" /></svg>, imgUrl: '' },
    { id: 'dryer', cursor: '🌬️', name: { cn: '吹风机', en: 'Hairdryer', se: 'Hårfön' }, price: 5, int: 5, svg: <svg viewBox="0 0 24 24" fill="none" stroke="#FF8787" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><path d="M7 10h10a3 3 0 000-6H7a3 3 0 000 6z" fill="#FF8787" opacity="0.3" /><path d="M12 10v6a2 2 0 01-4 0v-1" /><line x1="19" y1="5" x2="22" y2="5" /><line x1="19" y1="7" x2="21" y2="7" /><line x1="19" y1="9" x2="22" y2="9" /></svg>, imgUrl: '' },
    { id: 'comb', cursor: '梳', name: { cn: '梳子', en: 'Comb', se: 'Kam' }, price: 5, int: 5, svg: <svg viewBox="0 0 24 24" fill="none" stroke="#FFD43B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><rect x="4" y="6" width="16" height="6" rx="2" fill="#FFD43B" opacity="0.3" /><path d="M5 12v6m3-6v6m3-6v6m3-6v6m3-6v6" /></svg>, imgUrl: '' },
    { id: 'towel', cursor: '🛁', name: { cn: '浴巾', en: 'Towel', se: 'Handduk' }, price: 5, int: 5, svg: <svg viewBox="0 0 24 24" fill="none" stroke="#69DB7C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><path d="M4 6h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" fill="#69DB7C" opacity="0.3" /><line x1="4" y1="10" x2="20" y2="10" /><line x1="4" y1="14" x2="20" y2="14" /></svg>, imgUrl: '' }
];

const FarmIcons = {
    Hunger: ({ className = "w-full h-full" }) => (
        <svg viewBox="0 0 24 24" fill="#D2691E" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10c0-1.33-.26-2.61-.73-3.77-.47-1.16-2.18-1.07-2.6.09-.44 1.23-1.8 1.94-3.08 1.57-1.28-.36-1.99-1.81-1.55-3.09.43-1.27-.47-2.73-1.8-2.73H12V2z" /><circle cx="8" cy="8" r="1.2" fill="black" /><circle cx="15" cy="10" r="1.2" fill="black" /><circle cx="12" cy="15" r="1.2" fill="black" /><circle cx="7" cy="16" r="1.2" fill="black" /></svg>
    ),
    Intimacy: ({ className = "w-full h-full" }) => (
        <svg viewBox="0 0 24 24" fill="#FF90E8" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
    ),
    Focus: () => (
        <svg viewBox="0 0 24 24" fill="#85C1E9" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><circle cx="12" cy="13" r="8" fill="white" /><path d="M12 9v4l2 2" /><path d="M5 3L2 6" /><path d="M19 3l3 3" /></svg>
    ),
    Shop: () => (
        <svg viewBox="0 0 24 24" fill="#F8C471" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="white" /><path d="M3 9h18" /><path d="M9 22V12h6v10" fill="#F8C471" /></svg>
    ),
    Archives: () => (
        <svg viewBox="0 0 24 24" fill="#E5E7EB" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /><line x1="9" y1="14" x2="15" y2="14" /></svg>
    ),
    Explore: () => (
        <svg viewBox="0 0 24 24" fill="#82E0AA" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></svg>
    ),
    MilkFood: () => (
        <svg viewBox="0 0 24 24" fill="#FF90E8" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><path d="M6 8h12v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8z" fill="white" /><path d="M8 8V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4" /></svg>
    ),
    StarSand: ({ className = "w-6 h-6" }) => (
        <svg viewBox="0 0 24 24" fill="#60EFFF" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6-6.2-4.5-6.2 4.5 2.4-7.6L2 9.6h7.6z" /><circle cx="12" cy="12" r="3" fill="white" />
        </svg>
    ),
    Star: () => (
        <svg viewBox="0 0 24 24" fill="#FFD700" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
    )
};

interface FarmScreenProps {
    currentLang: Language;
    carrotCoins: number;
    onUpdateCoins: (amount: number) => void;
    savedPassports: PassportData[];
    onNavigate: (view: ViewMode) => void;
    playSound?: (type: string) => void;
    maxFarmSlots: number;
    onUnlockSlot: () => void;
    onToggleFarm: (id: string) => void;
    onUpdatePassport: (id: string, field: keyof PassportData, value: any) => void;
    setGlobalAlert: (msg: string) => void;
    onStartGlobalFocus: (id: string) => void;
    unlockedShopItems: string[];
    unlockedParts: string[];
    onUnlockShopItem: (id: string) => void;
    onUnlockPart: (id: string) => void;
    recordedEvents: string[];
    onRecordEvent: (id: string) => void;
    starSand: number;
    onUpdateStarSand?: (amount: number) => void;
    unlockedEffects?: string[];
    onUnlockEffect?: (id: string) => void;
    inventory: Record<string, number>; // 👈 接住库存
    onUpdateInventory: (id: string, amount: number) => void; // 👈 接住修改方法
}

const EXPEDITION_OPTIONS = [
    { minutes: 30, reward: 25, hungerCost: 10, label: { cn: '近地巡航', en: 'Low Orbit', se: 'Låg Omloppsbana' } },
    { minutes: 90, reward: 50, hungerCost: 30, label: { cn: '星系边缘', en: 'Outer Rim', se: 'Yttre Randen' } },
    { minutes: 240, reward: 100, hungerCost: 60, label: { cn: '深空潜航', en: 'Deep Space', se: 'Djuprymd' } },
    { minutes: 480, reward: 150, hungerCost: 90, label: { cn: '未知虫洞', en: 'Wormhole', se: 'Maskhål' } }
];

const EXPEDITION_EVENTS = [
    { id: 'ev_01', img: "https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Character%20Generator-Duddu400x400-face.png", title: { cn: '发光的晶石洞', en: 'Glowing Cave', se: 'Glödande Grotta' }, desc: { cn: '在火星地下迷路了，但发现了一群会发光的蓝色蘑菇，还顺便睡了个午觉！', en: 'Found glowing mushrooms!', se: 'Hittade glödande svampar och tog en tupplur!' } },
    { id: 'ev_02', img: "https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Character%20Generator-Issi400x400-face.png", title: { cn: '偶遇外星邻居', en: 'Alien Neighbor', se: 'Utomjordisk Granne' }, desc: { cn: '在小行星带遇到了一只戴墨镜的奇怪生物，他们一起分享了草莓牛奶。', en: 'Shared milk with an alien.', se: 'Delade jordgubbsmjölk med en utomjording.' } },
    { id: 'ev_03', img: "https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Character%20Generator-Plott400x400-face.png", title: { cn: '流星雨速递', en: 'Meteor Shower', se: 'Meteorregn' }, desc: { cn: '搭乘着彗星的尾巴冲浪，惊险刺激，差点把帽子吹飞了！', en: 'Surfed on a comet tail!', se: 'Surfade på en kometsvans, tappade nästan hatten!' } }
];

export const FarmScreen: React.FC<FarmScreenProps> = ({
    currentLang, carrotCoins, onUpdateCoins, savedPassports, onNavigate, playSound, maxFarmSlots, onUnlockSlot, onToggleFarm, onUpdatePassport, setGlobalAlert, onStartGlobalFocus, unlockedShopItems, unlockedParts, onUnlockShopItem, onUnlockPart, recordedEvents, onRecordEvent, starSand, onUpdateStarSand, unlockedEffects, onUnlockEffect, inventory, onUpdateInventory
}) => {
    // === 三语词典 (完美适配) ===
    const T = {
        noPet: { cn: '未选中生命', en: 'No Life Selected', se: 'Ingen vald' },
        clickToAdopt: { cn: '点击去档案室\n领养你的生命', en: 'Click to Adopt\nfrom Archives', se: 'Klicka för att\nadoptera' },
        farmSlots: { cn: '农场床位状态', en: 'FARM SLOTS', se: 'GÅRDSPLATSER' },
        occupied: { cn: '占用中', en: 'Occupied', se: 'Upptagen' },
        emptyArchive: { cn: '实验室还没有生命诞生记录...', en: 'No Bobu in archives...', se: 'Inga liv i arkivet...' },
        active: { cn: '★ 已入驻', en: '★ ACTIVE', se: '★ AKTIV' },
        standby: { cn: '待命', en: 'STANDBY', se: 'VÄNTAR' },
        unlock: { cn: '解锁床位', en: 'UNLOCK', se: 'LÅS UPP' },
        focusBtn: { cn: '启动专注光球', en: 'START GLOBAL FOCUS', se: 'STARTA FOKUS' },
        focusDesc: { cn: '开启全能专注模式！\n你可以一边让它陪你工作，一边回到实验室创造新生命。', en: 'Global Focus Mode!\nYou can build new rabbits while focusing.', se: 'Globalt Fokusläge!\nBygg nya kaniner medan du fokuserar.' },
        supplies: { cn: '🥕 基础补给', en: 'SUPPLIES', se: 'TILLBEHÖR' },
        secretShop: { cn: '✨ 星砂秘店', en: 'SECRET SHOP', se: 'HEMLIG BUTIK' },
        notEnoughCoins: { cn: '胡萝卜币不够啦！', en: 'Not enough coins!', se: 'Inte tillräckligt med mynt!' },
        exploringAlert: { cn: '它正在宇宙深处探险呢，\n等回来再说吧！', en: 'It is exploring!\nFeed it when it returns!', se: 'Den utforskar!\nMata när den återvänder!' },
        selectFirst: { cn: '请先在农场选中一只生命', en: 'Select a life first', se: 'Välj ett liv först' },
        returned: { cn: '探险归来！', en: 'RETURNED!', se: 'ÅTERVÄND!' },
        checkResult: { cn: '查收结果', en: 'CHECK RESULT', se: 'KONTROLLERA' },
        exploringState: { cn: '正在深空航行...', en: 'EXPLORING DEEP SPACE...', se: 'UTFORSKAR RYMDEN...' }
    };

    const [activeTab, setActiveTab] = useState<'focus' | 'shop' | 'archives' | 'explore'>('focus');
    const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
    const [claimedPostcard, setClaimedPostcard] = useState<any>(null);
    const [shopCategory, setShopCategory] = useState<'supplies' | 'starsand'>('supplies');

    const { animateToken } = useAnimateTokens(); // 引入全局动画引擎

    // 🌟 新增：化身鼠标的交互状态
    const [holdingItem, setHoldingItem] = useState<{ id: string, name: string, price: number, hun: number, int: number, cursor: string, isStarSand: boolean } | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [interactEffectId, setInteractEffectId] = useState<string | null>(null);

    // 👇 1. 注入灵魂互动引擎 👇
    const [speechBubble, setSpeechBubble] = useState<{ text: string, id: number } | null>(null);
    const [badgeAnim, setBadgeAnim] = useState('');

    // 身份牌颜色映射 (随 Tab 变化)
    const badgeColors = {
        focus: 'bg-[#E0F2FE]',    // 浅蓝
        shop: 'bg-[#FEF08A]',     // 浅黄
        archives: 'bg-[#F3E8FF]', // 浅紫
        explore: 'bg-[#DCFCE7]'   // 浅绿
    };

    // 漫画气泡语录库
    const BUBBLES = {
        cookie: { cn: ['吧唧吧唧...真好吃！', '谢谢！我最爱吃曲奇了！', '好脆！感觉充满了能量！'], en: ['Nom nom... so yummy!', 'Thanks! Cookies are my favorite!', 'So crispy! Full of energy!'], se: ['Nom nom... så gott!', 'Tack! Kakor är min favorit!', 'Så krispig! Full av energi!'] },
        milk: { cn: ['咕噜咕噜...草莓味的！', '好甜呀~ 肚子里冒粉色泡泡！', '喝完长高高！'], en: ['Glug glug... strawberry flavor!', 'So sweet~ pink bubbles in my tummy!', 'Drinking this makes me grow!'], se: ['Klunk klunk... jordgubbssmak!', 'Så söt~ rosa bubblor i magen!', 'Att dricka detta får mig att växa!'] },
        groom: { cn: ['哇，好舒服呀~', '谢谢你帮我打理！', '感觉自己焕然一新！', '左边一点...对，就是那里！'], en: ['Wow, that feels so good~', 'Thanks for grooming me!', 'I feel brand new!', 'A bit to the left... yes, there!'], se: ['Wow, det känns så bra~', 'Tack för att du sköter om mig!', 'Jag känner mig som ny!', 'Lite till vänster... ja, där!'] },
        eff_heart: { cn: ['扑通扑通！你听到了吗？', '充满了爱的力量！', '我们永远是好朋友哦！'], en: ['Thump thump! Hear it?', 'Filled with the power of love!', 'Best friends forever!'], se: ['Dunk dunk! Hör du det?', 'Fylld med kärlekens kraft!', 'Bästa vänner för alltid!'] },
        eff_star: { cn: ['我变成小宇宙啦！', '亮闪闪的，太酷了！', '跟着星轨一起转圈圈~'], en: ['I became a little universe!', 'So shiny and cool!', 'Spinning with the star trail~'], se: ['Jag blev ett litet universum!', 'Så blank och cool!', 'Snurrar med stjärnspåret~'] },
        focus: { cn: ['交给我吧！我会安静陪你的！', '嘘...进入认真模式！', '一起加油哦！'], en: ['Leave it to me! I will stay quiet!', 'Shh... focus mode activated!', 'Let\'s do our best together!'], se: ['Lämna det till mig! Jag håller mig tyst!', 'Sch... fokusläge aktiverat!', 'Låt oss göra vårt bästa tillsammans!'] },
        explore: { cn: ['目标星海，出发！', '我会带好东西回来的！', '冒险时间到！等我好消息！'], en: ['To the sea of stars, let\'s go!', 'I will bring back good stuff!', 'Adventure time! Wait for news!'], se: ['Mot stjärnhavet, nu åker vi!', 'Jag ska ta med bra saker tillbaka!', 'Äventyrsdags! Vänta på nyheter!'] }
    };

    const showBubble = (type: keyof typeof BUBBLES) => {
        const phrases = BUBBLES[type][currentLang];
        const text = phrases[Math.floor(Math.random() * phrases.length)];
        setSpeechBubble({ text, id: Date.now() });
        setTimeout(() => setSpeechBubble(null), 3000); // 3秒后自动消失
    };

    // 身份牌动效触发器
    useEffect(() => {
        setBadgeAnim('animate-wobble');
        const t = setTimeout(() => setBadgeAnim(''), 400);
        return () => clearTimeout(t);
    }, [activeTab]);

    useEffect(() => {
        setBadgeAnim('animate-claw-drop');
        const t = setTimeout(() => setBadgeAnim(''), 600);
        return () => clearTimeout(t);
    }, [selectedPetId]);
    // 👆 引擎注入完毕 👆

    const activePets = useMemo(() => savedPassports.filter(p => p.isAssignedToFarm), [savedPassports]);
    const SLOT_UPGRADE_COSTS = [0, 50, 150, 500, 1000];

    useEffect(() => {
        if (activePets.length > 0 && !selectedPetId) setSelectedPetId(activePets[0].id);
        else if (activePets.length === 0) setSelectedPetId(null);
    }, [activePets, selectedPetId]);

    const selectedPet = activePets.find(p => p.id === selectedPetId);

    const [, setTick] = useState(0);
    useEffect(() => {
        if (activeTab === 'explore') {
            const interval = setInterval(() => setTick(t => t + 1), 60000);
            return () => clearInterval(interval);
        }
    }, [activeTab]);

    // 取消拿着的物品
    const handleCancelHold = () => {
        if (holdingItem) setHoldingItem(null);
    };

    // 🎯 核心交互：将物品用在兔子身上
    const applyItemToPet = (petId: string, item: any) => {
        const pet = activePets.find(p => p.id === petId);
        if (!pet) return;

        // --- 星砂特效逻辑 ---
        if (item.type === 'effect') {
            if (unlockedEffects?.includes(item.id)) { setGlobalAlert(currentLang === 'cn' ? '已经拥有该特效啦！' : 'Already owned!'); setHoldingItem(null); return; }
            if ((starSand ?? 0) < item.price) { playSound?.('error'); setGlobalAlert(currentLang === 'cn' ? '友谊星砂不足！去雷达里转转吧。' : 'Not enough Star Sand!'); setHoldingItem(null); return; }
            playSound?.('achievement'); animateToken(`avatar-container-${petId}`, 'farm-wallet-starsand', '✨', false);
            onUpdateStarSand!(-item.price); onUnlockEffect!(item.id);
            setHoldingItem(null);
            return;
        }

        // --- 🥤 星际奶茶魔法逻辑 ---
        if (item.type === 'boba') {
            playSound?.('drinking'); // 喝奶茶音效

            if (item.id === 'wormhole_cup') {
                if (!pet.isOnExpedition) { playSound?.('error'); setGlobalAlert(currentLang === 'cn' ? '它没有在探险哦！\n虫洞杯只能秒杀探险时间。' : 'Not exploring!'); setHoldingItem(null); return; }
                playSound?.('whoosh');
                onUpdatePassport(petId, 'expeditionStartTime', Date.now() - (pet.expeditionDuration || 9999999));
                setGlobalAlert(currentLang === 'cn' ? '🌌 虫洞开启！\n探险瞬间完成！' : 'Wormhole opened!');
            }
            else if (item.id === 'boba_mars') {
                setGlobalAlert(currentLang === 'cn' ? '🔴 喝下火星杯，勇气倍增！\n感觉自己无所畏惧！' : 'Mars Cup drank! Bravery up!');
                // 可以加属性或者加满饥饿
                onUpdatePassport(petId, 'hunger', 100);
            }
            else if (item.id === 'boba_venus') {
                setGlobalAlert(currentLang === 'cn' ? '💖 喝下金星杯，粉色泡泡飘满天！\n亲密度暴涨 50 点！' : 'Venus Cup! Intimacy +50!');
                onUpdatePassport(petId, 'intimacy', Math.min(100, (pet.intimacy || 0) + 50));
            }
            else if (item.id === 'boba_earth') {
                setGlobalAlert(currentLang === 'cn' ? '🌍 喝下地球杯，状态全满！\n复活啦！' : 'Earth Cup! Full revive!');
                onUpdatePassport(petId, 'hunger', 100);
                onUpdatePassport(petId, 'intimacy', 100);
            }
            else if (item.id === 'blackhole_cup') {
                playSound?.('error');
                setGlobalAlert(currentLang === 'cn' ? '🕳️ 黑洞杯大翻车！\n它被吸进黑洞吓坏了，肚子全空了！' : 'Blackhole Cup! Hunger 0!');
                onUpdatePassport(petId, 'hunger', 0);
            }
            else {
                // 其他奶茶的基础效果：超强回血 + 爆多巴胺
                setGlobalAlert(currentLang === 'cn' ? `🥤 喝下 ${item.name.cn}！\n好喝得飞起！` : `Drank ${item.name.en}!`);
                onUpdatePassport(petId, 'hunger', Math.min(100, (pet.hunger || 0) + 30));
            }

            // 🌟 用完就从背包减 1！
            onUpdateInventory(item.id, -1);

            setInteractEffectId(petId);
            setTimeout(() => setInteractEffectId(null), 1000);
            setHoldingItem(null);
            return;
        }

        // --- 普通胡萝卜补给品逻辑 ---
        if (pet.isOnExpedition) { playSound?.('error'); setGlobalAlert(T.exploringAlert[currentLang]); setHoldingItem(null); return; }
        if (item.price > 0 && carrotCoins < item.price) { playSound?.('error'); setGlobalAlert(T.notEnoughCoins[currentLang]); setHoldingItem(null); return; }

        if (item.id === 'cookie') playSound?.('chewing');
        else if (item.id === 'milk') playSound?.('drinking');
        else if (item.id === 'shower') playSound?.('bubble');
        else if (item.id === 'dryer') playSound?.('blowing');
        else if (item.id === 'comb') playSound?.('brushing');
        else if (item.id === 'towel') playSound?.('wiping');
        else playSound?.('success');

        showBubble(item.id === 'cookie' || item.id === 'milk' ? item.id : 'groom');

        if (item.price > 0) {
            animateToken('farm-wallet-carrot', `avatar-container-${petId}`, '🥕', false);
            onUpdateCoins(-item.price);
        }

        onUpdatePassport(petId, 'hunger', Math.min(100, (pet.hunger ?? 80) + item.hun));
        onUpdatePassport(petId, 'intimacy', Math.min(100, (pet.intimacy ?? 0) + item.int));
        onUpdatePassport(petId, 'lastSyncTime', Date.now());

        setInteractEffectId(petId);
        setTimeout(() => setInteractEffectId(null), 1000);
        setHoldingItem(null);
    };


    const startExpedition = (opt: typeof EXPEDITION_OPTIONS[0]) => {
        if (!selectedPet) return;
        if ((selectedPet.hunger ?? 80) < opt.hungerCost) { playSound?.('error'); setGlobalAlert(currentLang === 'cn' ? `肚子太饿了，没力气飞那么远！\n需要 ${opt.hungerCost} 饥饿度。` : `Too hungry!\nNeeds ${opt.hungerCost} hunger.`); return; }

        playSound?.('start');
        showBubble('explore'); // 👈 加上这行，喊出探险口号！
        onUpdatePassport(selectedPet.id, 'hunger', (selectedPet.hunger ?? 80) - opt.hungerCost);
        onUpdatePassport(selectedPet.id, 'isOnExpedition', true);
        onUpdatePassport(selectedPet.id, 'expeditionStartTime', Date.now());
        onUpdatePassport(selectedPet.id, 'expeditionDuration', opt.minutes * 60 * 1000);
        onUpdatePassport(selectedPet.id, 'expeditionReward', opt.reward);
    };

    const handleClaimExpedition = () => {
        if (!selectedPet) return;
        const reward = selectedPet.expeditionReward || 50;

        const lockedPlanetParts = Object.values(PLANET_PARTS_DB).filter(p => p.isUnlockable && !unlockedParts.includes(p.id));
        const lockedCharParts = Object.values(PARTS_DB).filter(p => p.isUnlockable && !unlockedParts.includes(p.id));
        const lockedFurniture = FURNITURE_DB.filter(f => !unlockedShopItems.includes(f.id));
        const availableEvents = EXPEDITION_EVENTS.filter(e => !recordedEvents.includes(e.id));

        const roll = Math.random() * 100;
        let resultData: any = { type: 'peaceful', reward, title: { cn: '平淡的旅途', en: 'Peaceful Journey', se: 'Lugn Resa' }, desc: { cn: '在宇宙中安静地飞行了一圈，虽然没遇到什么特别的事，但心情很放松。', en: 'Flew around quietly. Relaxing!', se: 'Flög runt tyst. Avkopplande!' } };

        if (roll <= 5 && lockedPlanetParts.length > 0) {
            const won = lockedPlanetParts[Math.floor(Math.random() * lockedPlanetParts.length)];
            onUnlockPart(won.id); playSound?.('achievement'); resultData = { type: 'planet_part', item: won, reward };
        } else if (roll <= 10 && lockedCharParts.length > 0) {
            const won = lockedCharParts[Math.floor(Math.random() * lockedCharParts.length)];
            onUnlockPart(won.id); playSound?.('achievement'); resultData = { type: 'char_part', item: won, reward };
        } else if (roll <= 25 && lockedFurniture.length > 0) {
            const won = lockedFurniture[Math.floor(Math.random() * lockedFurniture.length)];
            onUnlockShopItem(won.id); playSound?.('achievement'); resultData = { type: 'furniture', item: won, reward };
        } else if (roll <= 50 && availableEvents.length > 0) {
            const won = availableEvents[Math.floor(Math.random() * availableEvents.length)];
            playSound?.('success'); resultData = { type: 'event', event: won, reward };
        } else {
            playSound?.('success');
        }

        setClaimedPostcard(resultData);
        // 获得金币时播放满屏幕金币动画！
        animateToken('avatar-center', 'farm-wallet-carrot', '🥕', true);
        onUpdateCoins(reward);
        onUpdatePassport(selectedPet.id, 'isOnExpedition', false);
        onUpdatePassport(selectedPet.id, 'lastSyncTime', Date.now());
    };

    const handleRecordEventToStory = () => {
        if (!selectedPet || !claimedPostcard || claimedPostcard.type !== 'event') return;

        const capacities = [5, 7, 6, 8, 5, 5, 8, 7, 10];
        let targetGalaxy = 0, targetStar = 0, found = false;
        const existingStories = selectedPet.stories || [];

        for (let g = 0; g < capacities.length; g++) {
            for (let s = 0; s < capacities[g]; s++) {
                if (!existingStories.some(story => story.galaxyIndex === g && story.starIndex === s)) {
                    targetGalaxy = g; targetStar = s; found = true; break;
                }
            }
            if (found) break;
        }

        if (!found) {
            alert(currentLang === 'cn' ? '星际手帐已经写满了！无法记录。' : 'Storybook is full!');
            return;
        }

        const newStory: StoryEntry = {
            id: `${targetGalaxy}-${targetStar}`,
            date: getStarDate(),
            title: claimedPostcard.event.title,
            content: claimedPostcard.event.desc,
            galaxyIndex: targetGalaxy,
            starIndex: targetStar,
            imageUrl: claimedPostcard.event.img,
            hasReceivedReward: true
        };

        onUpdatePassport(selectedPet.id, 'stories', [...existingStories, newStory]);
        onRecordEvent(claimedPostcard.event.id);
        animateToken('avatar-center', 'farm-wallet-carrot', '🥕', true);
        onUpdateCoins(10);
        playSound?.('coins');
        setGlobalAlert(currentLang === 'cn' ? '奇遇已贴入手帐！\n获得额外奖励 10 🥕' : 'Event recorded!\nBonus 10 🥕');
        setClaimedPostcard(null);
    };

    // 🌟 修复 1：确保 handleLocalToggleFarm 定义在安全位置
    const handleLocalToggleFarm = (p: PassportData) => {
        if (!p.isAssignedToFarm && activePets.length >= maxFarmSlots) {
            playSound?.('error');
            setGlobalAlert(currentLang === 'cn' ? '农场床位不足，\n请先解锁更多位置！' : 'Farm is full!\nUnlock more slots!');
            return;
        }
        onToggleFarm(p.id);
    };

    return (
        <div
            className={`fixed inset-0 z-40 flex flex-col items-center bg-[#EAFFD0] overflow-hidden font-rounded text-black select-none ${holdingItem ? 'cursor-none' : ''}`}
            onClick={handleCancelHold}
            onMouseMove={(e) => { if (holdingItem) setMousePos({ x: e.clientX, y: e.clientY }) }}
            onTouchMove={(e) => { if (holdingItem) setMousePos({ x: e.touches[0].clientX, y: e.touches[0].clientY }) }}
        >
            <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                <SpaceBackground bpm={50} themeColor="#95E1D3" />
            </div>

            {/* 🌟 修复 2：化身鼠标的插画接口 (优先读取 imgUrl) */}
            {holdingItem && (
                <div
                    className="fixed z-[99999] pointer-events-none transform -translate-x-1/2 -translate-y-1/2 animate-bounce drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
                    style={{ left: mousePos.x, top: mousePos.y }}
                >
                    {holdingItem.imgUrl ? (
                        /* 👇 以后你在 FURNITURE_DB 里填了 imgUrl，就会自动显示你的插画！建议尺寸 80x80 */
                        <img src={holdingItem.imgUrl} alt="item" className="w-20 h-20 object-contain drop-shadow-md" />
                    ) : (
                        <span className="text-5xl">{holdingItem.cursor}</span>
                    )}
                </div>
            )}

            {/* 顶部胶囊货币 UI */}
            {/* 1. 把顶部货币与左上角身份牌垂直合并，放在一起 */}
            <div className="absolute top-6 left-4 md:left-6 z-50 flex flex-col gap-3 pointer-events-auto">
                <div className="flex gap-2">
                    <div id="farm-wallet-carrot" className="h-10 bg-white border-[3px] border-black px-3 rounded-full shadow-[3px_3px_0_black] flex items-center gap-2 transition-transform">
                        <CarrotCoinIcon className="w-5 h-5" />
                        <span className="font-black text-lg mt-0.5 text-black">{carrotCoins}</span>
                    </div>
                    {starSand !== undefined && (
                        <div id="farm-wallet-starsand" className="h-10 bg-white border-[3px] border-black px-3 rounded-full shadow-[3px_3px_0_black] flex items-center gap-2 transition-transform">
                            <FarmIcons.StarSand className="w-5 h-5" />
                            <span className="font-black text-lg mt-0.5 text-black">{starSand}</span>
                        </div>
                    )}
                </div>

                {/* 左上角身份牌 (带有颜色变化和完美的夹娃娃机动效) */}
                <header className="absolute top-0 left-6 z-30 flex flex-col items-center pointer-events-auto">
                    {selectedPet ? (
                        <div className={`relative flex flex-col items-center ${badgeAnim}`}>
                            {/* 🌟 视觉魔法：长长的挂绳，延伸到屏幕外面，永远不会露出断掉的头部！ */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-2 h-[500px] bg-gray-400 border-x-[3px] border-black z-0" />

                            {/* 夹子头部 */}
                            <div className="w-10 h-6 bg-gray-300 border-[3px] border-black rounded-b-xl shadow-[inset_0_-3px_0_rgba(0,0,0,0.2)] z-10 relative flex justify-center items-end pb-1">
                                <div className="w-2 h-2 bg-gray-800 rounded-full" />
                            </div>

                            {/* 身份牌本体 */}
                            <div className={`border-[4px] border-black rounded-[24px] p-3 shadow-[6px_6px_0_black] flex flex-col items-center w-[140px] mt-[-6px] transition-colors duration-500 hover:translate-y-1 ${badgeColors[activeTab]}`}>
                                <div className="w-full aspect-square bg-[#E0F2FE] border-[3px] border-black rounded-xl overflow-hidden relative shadow-inner mb-2 flex items-center justify-center">
                                    <div className="absolute w-[160px] h-[160px] flex items-center justify-center transform scale-[0.6] translate-y-3">
                                        <Avatar selectedParts={selectedPet.selectedParts} dominantStat={getDominantStat(calculateStats(selectedPet.selectedParts))} transparent={true} />
                                    </div>
                                </div>
                                <div className="font-black text-[11px] uppercase tracking-widest bg-black text-white px-2 py-1 rounded-full w-full text-center truncate mb-2">
                                    {selectedPet.starName}
                                </div>
                                <div className="w-full flex flex-col gap-1.5 bg-white p-1.5 rounded-xl border-2 border-black">
                                    <StatBar icon={<div className="w-4 h-4"><FarmIcons.Hunger /></div>} value={selectedPet.hunger ?? 80} color="bg-[#D2691E]" />
                                    <StatBar icon={<div className="w-4 h-4"><FarmIcons.Intimacy /></div>} value={selectedPet.intimacy ?? 0} color="bg-[#FF90E8]" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white/80 mt-4 border-[4px] border-black border-dashed p-3 rounded-2xl text-center font-black text-xs opacity-60">{T.noPet[currentLang]}</div>
                    )}
                </header>
            </div>

            {/* --- 核心交互区 --- */}
            {/* 2. 兔子容器：禁止换行 (flex-nowrap)，靠底对齐 (items-end)，增加左侧内边距 (pl-36) 避开身份牌 */}
            <main className="relative z-10 flex-1 w-full flex flex-nowrap items-end justify-start md:justify-center p-4 pl-40 md:pl-48 gap-6 md:gap-16 pt-32 pb-8 overflow-x-auto hide-scrollbar">
                <div id="avatar-center" className="absolute top-1/2 left-1/2 w-1 h-1 pointer-events-none" />

                {activePets.length > 0 ? (
                    activePets.map((pet, idx) => {
                        const hasBond = activePets.some(otherPet =>
                            otherPet.id !== pet.id &&
                            pet.relationships?.some(rel => rel.targetId === otherPet.id && (rel.intimacyScore ?? 0) >= 50)
                        );
                        const isSelected = pet.id === selectedPetId;

                        return (
                            <div
                                key={pet.id}
                                id={`avatar-container-${pet.id}`}
                                onClick={(e) => {
                                    e.stopPropagation(); // 阻止触发取消持有
                                    if (holdingItem) {
                                        applyItemToPet(pet.id, holdingItem);
                                    } else {
                                        playSound?.('click');
                                        setSelectedPetId(pet.id);
                                    }
                                }}
                                className="relative flex flex-col items-center cursor-pointer group shrink-0 pb-10"
                            >
                                {/* 🌟 1. 果汁多巴胺选中光环 (替代旧黄圈) */}
                                {isSelected && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 pointer-events-none z-0">
                                        <svg viewBox="0 0 200 200" className="w-full h-full animate-spin-slow">
                                            <defs>
                                                <radialGradient id="juiceGradient" cx="50%" cy="50%" r="50%">
                                                    <stop offset="60%" stopColor="#FFF9E0" stopOpacity="0" />
                                                    <stop offset="90%" stopColor="#FFFAAE" stopOpacity="0.8" />
                                                    <stop offset="100%" stopColor="#FFF2D6" stopOpacity="0" />
                                                </radialGradient>
                                            </defs>
                                            <circle cx="100" cy="100" r="85" fill="url(#juiceGradient)" stroke="#FFE066" strokeWidth="4" strokeLinecap="round" strokeDasharray="30 20" />
                                            <path d="M100 20l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="#FFE066" stroke="black" strokeWidth="1.5" transform="rotate(30 100 100)" />
                                            <path d="M50 60l1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5 3-1.5z" fill="#FFF2D6" stroke="black" strokeWidth="1.2" transform="rotate(-60 50 60)" />
                                        </svg>
                                    </div>
                                )}

                                {/* 🌟 2. 动态星轨特效 (不再受 isSelected 限制，只要装备了就一直显示！) */}
                                {pet.equippedEffect === 'eff_star' && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 pointer-events-none z-0">
                                        <svg viewBox="0 0 200 200" className="w-full h-full animate-spin-slow" style={{ animationDuration: '10s' }}>
                                            <defs>
                                                <radialGradient id="starJuice" cx="50%" cy="50%" r="50%">
                                                    <stop offset="70%" stopColor="#E0F2FE" stopOpacity="0" />
                                                    <stop offset="95%" stopColor="#7DD3FC" stopOpacity="0.5" />
                                                    <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
                                                </radialGradient>
                                            </defs>
                                            <circle cx="100" cy="100" r="88" fill="url(#starJuice)" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" strokeDasharray="10 30" />
                                            <path d="M100 10l3 6 6 3-6 3-3 6-3-6-6-3 6-3z" fill="#BAE6FD" stroke="black" strokeWidth="1.5" transform="rotate(45 100 10)" />
                                            <path d="M100 10l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="#E0F2FE" stroke="black" strokeWidth="1.5" transform="translate(-80, 80) scale(0.8) rotate(-30 100 10)" />
                                            <path d="M100 10l3 6 6 3-6 3-3 6-3-6-6-3 6-3z" fill="#38BDF8" stroke="black" strokeWidth="1.5" transform="translate(60, 120) scale(0.6) rotate(70 100 10)" />
                                        </svg>
                                    </div>
                                )}

                                {/* 🌟 3. 爱心羁绊特效 (只要装备了就一直显示) */}
                                {pet.equippedEffect === 'eff_heart' && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 pointer-events-none z-0">
                                        <svg viewBox="0 0 200 200" className="w-full h-full animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '8s' }}>
                                            <defs>
                                                <radialGradient id="heartJuice" cx="50%" cy="50%" r="50%">
                                                    <stop offset="60%" stopColor="#FFF0F5" stopOpacity="0" />
                                                    <stop offset="90%" stopColor="#FFB6C1" stopOpacity="0.7" />
                                                    <stop offset="100%" stopColor="#FF69B4" stopOpacity="0" />
                                                </radialGradient>
                                            </defs>
                                            <circle cx="100" cy="100" r="80" fill="url(#heartJuice)" stroke="#FF69B4" strokeWidth="4" strokeLinecap="round" strokeDasharray="15 25" />
                                            <path d="M100 25 C100 25 90 10 75 10 C55 10 50 30 50 40 C50 60 100 80 100 80 C100 80 150 60 150 40 C150 30 145 10 125 10 C110 10 100 25 100 25 Z" fill="#FF69B4" stroke="black" strokeWidth="2" transform="scale(0.2) translate(450, -50)" />
                                            <path d="M100 25 C100 25 90 10 75 10 C55 10 50 30 50 40 C50 60 100 80 100 80 C100 80 150 60 150 40 C150 30 145 10 125 10 C110 10 100 25 100 25 Z" fill="#FFB6C1" stroke="black" strokeWidth="2" transform="scale(0.15) translate(150, 800)" />
                                        </svg>
                                    </div>
                                )}

                                {/* 使用物品后的爆出特效 */}
                                {interactEffectId === pet.id && (
                                    <div className="absolute -top-10 z-[100] text-4xl animate-slide-up drop-shadow-md pointer-events-none">
                                        💖✨
                                    </div>
                                )}

                                {/* 羁绊达到 50 时的头顶跳动爱心 */}
                                {hasBond && (
                                    <div className="absolute -top-4 -right-2 z-50 animate-bounce text-2xl drop-shadow-[2px_2px_0_black] pointer-events-none">
                                        💖
                                    </div>
                                )}

                                {/* 🌟 新增：漫画气泡框！(只给当前说话的兔子显示) */}
                                {speechBubble && isSelected && (
                                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-[100] animate-bubble-pop pointer-events-none w-max max-w-[200px]">
                                        <div className="bg-white border-[3px] border-black px-4 py-2 rounded-2xl shadow-[4px_4px_0_black] relative">
                                            <span className="font-black text-xs leading-tight block text-center">
                                                {speechBubble.text}
                                            </span>
                                            {/* 气泡的尾巴 */}
                                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-[3px] border-r-[3px] border-black transform rotate-45" />
                                        </div>
                                    </div>
                                )}

                                {/* 主角色图层 */}
                                <div className={`relative z-10 transform transition-all duration-300 ${isSelected ? 'scale-[1.25]' : 'scale-100 hover:scale-110'} animate-float ${pet.isOnExpedition ? 'opacity-30 grayscale blur-[1px]' : ''}`} style={{ animationDelay: `${idx * 0.2}s` }}>
                                    <Avatar selectedParts={pet.selectedParts} dominantStat={getDominantStat(calculateStats(pet.selectedParts, pet.stats))} className="w-40 h-40 relative z-10" />
                                    {pet.isOnExpedition && (
                                        <div className="absolute inset-0 z-20 flex items-center justify-center">
                                            <div className="bg-black text-white text-[10px] font-black px-2 py-1 rounded-md">EXPLORING</div>
                                        </div>
                                    )}
                                </div>

                                {/* 状态进度条 */}
                                <div className="absolute -bottom-8 z-20 flex flex-col gap-1.5 w-28 bg-white/90 p-2 rounded-xl border-[3px] border-black shadow-[2px_2px_0_black] opacity-80 group-hover:opacity-100 transition-opacity">
                                    <div className="w-full h-2 bg-gray-200 rounded-full border-2 border-black overflow-hidden">
                                        <div className="bg-[#D2691E] h-full transition-all duration-500" style={{ width: `${pet.hunger ?? 80}%` }} />
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 rounded-full border-2 border-black overflow-hidden">
                                        <div className="bg-[#FF90E8] h-full transition-all duration-500" style={{ width: `${pet.intimacy ?? 0}%` }} />
                                    </div>
                                </div>
                                <div className="absolute -bottom-6 w-28 h-5 bg-black/10 blur-xl rounded-full" />
                            </div>
                        );
                    })
                ) : (
                    <div onClick={(e) => { e.stopPropagation(); playSound?.('click'); setActiveTab('archives'); }} className="w-48 h-48 border-[6px] border-dashed border-black/20 rounded-[40px] flex flex-col items-center justify-center cursor-pointer hover:bg-black/5 transition-all group">
                        <div className="w-16 h-16 opacity-30 group-hover:scale-110 transition-transform mb-2"><FarmIcons.Archives /></div>
                        <p className="font-black text-black/40 text-center leading-tight whitespace-pre-line text-sm">
                            {T.clickToAdopt[currentLang]}
                        </p>
                    </div>
                )}
            </main>

            {/* --- 底部操作面板 --- */}
            <footer className="relative z-30 w-full max-w-xl bg-white border-t-[6px] border-black p-5 rounded-t-[40px] shadow-[0_-12px_0_rgba(0,0,0,0.05)] pointer-events-auto">
                <div className="flex justify-around mb-6 mt-[-55px]">
                    <TabButton active={activeTab === 'focus'} onClick={() => { playSound?.('click'); setActiveTab('focus'); }} icon={<FarmIcons.Focus />} color="bg-[#85C1E9]" />
                    <TabButton active={activeTab === 'shop'} onClick={() => { playSound?.('click'); setActiveTab('shop'); }} icon={<FarmIcons.Shop />} color="bg-[#F8C471]" />
                    <TabButton active={activeTab === 'archives'} onClick={() => { playSound?.('click'); setActiveTab('archives'); }} icon={<FarmIcons.Archives />} color="bg-[#BB8FCE]" />
                    <TabButton active={activeTab === 'explore'} onClick={() => { playSound?.('click'); setActiveTab('explore'); }} icon={<FarmIcons.Explore />} color="bg-[#82E0AA]" />
                </div>

                <div className="h-44 overflow-y-auto px-2 custom-scrollbar">
                    {/* FOCUS TAB */}
                    {activeTab === 'focus' && (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                            <p className="font-black text-gray-500 text-center text-sm leading-relaxed">
                                {T.focusDesc[currentLang]}
                            </p>
                            <button onClick={() => {
                                if (!selectedPet) return setGlobalAlert(currentLang === 'cn' ? '请先选中一只兔子来陪伴你！' : 'Select a rabbit to focus with!');
                                if (selectedPet.isOnExpedition) return setGlobalAlert(currentLang === 'cn' ? '它去探险了，换一只吧！' : 'It is exploring, choose another!');
                                playSound?.('click');
                                showBubble('focus'); // 👈 加上这行，鼓励专注！
                                onStartGlobalFocus(selectedPet.id);
                            }} className="w-full max-w-sm py-4 border-[5px] border-black rounded-2xl font-black text-xl bg-[#82E0AA] text-black shadow-[6px_6px_0_black] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center gap-2">
                                <FarmIcons.Focus /> {T.focusBtn[currentLang]}
                            </button>
                        </div>
                    )}

                    {/* ARCHIVES TAB */}
                    {activeTab === 'archives' && (
                        <div className="flex flex-col gap-4 pb-4">
                            <div className="flex justify-between items-center bg-gray-100 p-4 rounded-2xl border-[3px] border-black border-dashed">
                                <div className="flex flex-col">
                                    <span className="font-black text-sm uppercase">{T.farmSlots[currentLang]}</span>
                                    <span className="text-xs font-bold text-gray-500">{activePets.length} / {maxFarmSlots} {T.occupied[currentLang]}</span>
                                </div>
                                {maxFarmSlots < SLOT_UPGRADE_COSTS.length - 1 && (
                                    <button onClick={() => { playSound?.('click'); onUnlockSlot(); }} className="flex items-center gap-2 bg-[#F8C471] px-4 py-2 rounded-xl border-[3px] border-black shadow-[3px_3px_0_black] active:shadow-none active:translate-y-1 transition-all">
                                        <span className="font-black text-xs uppercase">{T.unlock[currentLang]}</span>
                                        <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded-md border-2 border-black"><CarrotCoinIcon className="w-3 h-3" /><span className="font-black text-[10px]">{SLOT_UPGRADE_COSTS[maxFarmSlots]}</span></div>
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {savedPassports && savedPassports.length > 0 ? savedPassports.map((p) => (
                                    <div key={p.id} onClick={(e) => { e.stopPropagation(); handleLocalToggleFarm(p); }} className={`p-3 rounded-2xl flex items-center gap-3 cursor-pointer border-[4px] border-black shadow-[4px_4px_0_black] active:translate-y-1 transition-all ${p.isAssignedToFarm ? 'bg-[#A8E6CF]' : 'bg-[#F9FAFB] hover:bg-yellow-50'}`}>
                                        <div className="w-12 h-12 bg-white border-[3px] border-black rounded-xl overflow-hidden flex-shrink-0 relative flex items-center justify-center">
                                            <div className="absolute w-[160px] h-[160px] flex items-center justify-center transform scale-[0.4] translate y-2">
                                                <Avatar selectedParts={p.selectedParts} dominantStat={getDominantStat(calculateStats(p.selectedParts, p.stats))} transparent={true} />
                                            </div>
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="font-black text-xs truncate">{p.starName}</span>
                                            <span className={`text-[9px] font-bold uppercase ${p.isAssignedToFarm ? 'text-green-800' : 'text-gray-400'}`}>{p.isAssignedToFarm ? T.active[currentLang] : T.standby[currentLang]}</span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-2 text-center py-4 opacity-40 font-black text-sm">{T.emptyArchive[currentLang]}</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* SHOP TAB */}
                    {activeTab === 'shop' && (() => {
                        // 🌟 星砂秘店：包含特效和奶茶！
                        const EFFECTS_DB = [
                            { id: 'eff_heart', type: 'effect', cursor: '', name: { cn: '爱心光环', en: 'Heart Aura', se: 'Hjärta Aura' }, price: 50, icon: <div className="w-5 h-5"><FarmIcons.Intimacy /></div> },
                            { id: 'eff_star', type: 'effect', cursor: '', name: { cn: '动态星轨', en: 'Star Trail', se: 'Stjärnspår' }, price: 100, icon: <div className="w-5 h-5"><FarmIcons.Star /></div> }
                        ];

                        // 🥤 12杯星际奶茶 (只有在你从雷达买到后，也就是库存 > 0 时才会出现)
                        const ALL_BOBAS = [
                            { id: 'boba_mars', emoji: '🔴', name: { cn: '火星杯', en: 'Mars Cup', se: 'Marskopp' } },
                            { id: 'boba_jupiter', emoji: '🟠', name: { cn: '木星杯', en: 'Jupiter Cup', se: 'Jupiterkopp' } },
                            { id: 'boba_saturn', emoji: '🟡', name: { cn: '土星杯', en: 'Saturn Cup', se: 'Saturnuskopp' } },
                            { id: 'boba_mercury', emoji: '💨', name: { cn: '水星杯', en: 'Mercury Cup', se: 'Merkuriuskopp' } },
                            { id: 'boba_uranus', emoji: '💙', name: { cn: '天王星杯', en: 'Uranus Cup', se: 'Uranuskopp' } },
                            { id: 'boba_neptune', emoji: '🔵', name: { cn: '海王星杯', en: 'Neptune Cup', se: 'Neptunuskopp' } },
                            { id: 'boba_sun', emoji: '☀️', name: { cn: '太阳杯', en: 'Sun Cup', se: 'Solkopp' } },
                            { id: 'boba_moon', emoji: '🌕', name: { cn: '月亮杯', en: 'Moon Cup', se: 'Månkopp' } },
                            { id: 'boba_venus', emoji: '💖', name: { cn: '金星杯', en: 'Venus Cup', se: 'Venuskopp' } },
                            { id: 'boba_earth', emoji: '🌍', name: { cn: '地球杯', en: 'Earth Cup', se: 'Jordkopp' } },
                            { id: 'wormhole_cup', emoji: '🌌', name: { cn: '虫洞杯', en: 'Wormhole Cup', se: 'Maskhålskopp' } },
                            { id: 'blackhole_cup', emoji: '🕳️', name: { cn: '黑洞杯', en: 'Blackhole Cup', se: 'Svarthålskopp' } }
                        ];

                        // 过滤出你有库存的奶茶
                        const myBobas = ALL_BOBAS.filter(b => inventory[b.id] > 0).map(b => ({
                            ...b, type: 'boba', price: 0, count: inventory[b.id], icon: <div className="text-2xl">{b.emoji}</div>, cursor: b.emoji
                        }));

                        const allShopItems = [
                            { id: 'cookie', cursor: '🍪', name: { cn: "元气曲奇", en: "Cookie", se: "Kaka" }, price: 5, int: 5, hun: 20, icon: <div className="w-8 h-8"><FarmIcons.Hunger className="w-full h-full" /></div> },
                            { id: 'milk', cursor: '🍓', name: { cn: "星间奶昔", en: "Milkshake", se: "Mjölkshake" }, price: 15, int: 20, hun: 10, icon: <div className="w-8 h-8"><FarmIcons.MilkFood /></div> },
                            // 家具
                            ...FURNITURE_DB.filter(f => unlockedShopItems.includes(f.id)).map(f => ({ id: f.id, cursor: (f as any).cursor, name: f.name, price: f.price, int: f.int, hun: 0, imgUrl: f.imgUrl, icon: f.imgUrl ? <img src={f.imgUrl} alt="item" className="w-8 h-8" /> : <div className="w-8 h-8">{f.svg}</div> }))
                        ];

                        const currentItems = shopCategory === 'supplies' ? allShopItems : [...EFFECTS_DB, ...myBobas];

                        return (
                            <div className="flex flex-col h-full pb-2">
                                <div className="flex gap-2 mb-3 bg-gray-100 p-1.5 rounded-xl border-2 border-black shrink-0">
                                    <button onClick={() => setShopCategory('supplies')} className={`flex-1 font-black text-xs py-2 rounded-lg transition-colors ${shopCategory === 'supplies' ? 'bg-[#FFD700] border-2 border-black shadow-sm' : 'text-gray-500'}`}>
                                        {T.supplies[currentLang]}
                                    </button>
                                    <button onClick={() => setShopCategory('starsand')} className={`flex-1 font-black text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1 ${shopCategory === 'starsand' ? 'bg-[#60EFFF] border-2 border-black shadow-sm text-black' : 'text-gray-500'}`}>
                                        <FarmIcons.StarSand className="w-4 h-4" /> {T.secretShop[currentLang]}
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
                                    {currentItems.map(item => (
                                        <div key={item.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (shopCategory === 'supplies') {
                                                    if (carrotCoins < item.price) { playSound?.('error'); setGlobalAlert(T.notEnoughCoins[currentLang]); return; }
                                                    setHoldingItem(item as any);
                                                } else {
                                                    if (!selectedPet) {
                                                        playSound?.('error');
                                                        setGlobalAlert(T.selectFirst[currentLang]);
                                                        return;
                                                    }

                                                    const isOwned = unlockedEffects?.includes(item.id);
                                                    const isEquipped = selectedPet.equippedEffect === item.id;

                                                    if (isOwned) {
                                                        // 已拥有：进行装备 / 卸下操作
                                                        playSound?.('click');
                                                        const newEffect = isEquipped ? undefined : item.id; // 如果已经穿着，再点就是脱下
                                                        onUpdatePassport(selectedPet.id, 'equippedEffect', newEffect);
                                                        setGlobalAlert(currentLang === 'cn'
                                                            ? (newEffect ? `✨ 已为 ${selectedPet.starName} 装备该特效！` : `✨ 已卸下特效！`)
                                                            : 'Effect toggled!');
                                                    } else {
                                                        // 未拥有：购买并自动装备
                                                        if ((starSand ?? 0) < item.price) { playSound?.('error'); setGlobalAlert(currentLang === 'cn' ? '友谊星砂不足！去雷达里转转吧。' : 'Not enough Star Sand!'); return; }
                                                        playSound?.('achievement');
                                                        onUpdateStarSand!(-item.price);
                                                        onUnlockEffect!(item.id);
                                                        onUpdatePassport(selectedPet.id, 'equippedEffect', item.id);
                                                        // 👇 穿上时喊出口号
                                                        showBubble(item.id as any);
                                                        setGlobalAlert(currentLang === 'cn' ? `✨ 特效兑换成功！\n已自动为 ${selectedPet.starName} 装备！` : '✨ Effect Unlocked & Equipped!');
                                                    }
                                                }
                                            }}
                                            className="bg-white border-[4px] border-black p-4 rounded-[20px] flex flex-col items-center justify-between min-h-[140px] shadow-[4px_4px_0_black] cursor-pointer hover:bg-[#F9FAFB] active:translate-y-1 active:shadow-none transition-all relative overflow-hidden"
                                        >
                                            {shopCategory === 'starsand' && unlockedEffects?.includes(item.id) && (
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                                                    <span className={`text-white font-black text-[10px] px-2 py-1 rounded-full border-2 border-black -rotate-12 ${selectedPet?.equippedEffect === item.id ? 'bg-[#FF90E8]' : 'bg-green-400'}`}>
                                                        {selectedPet?.equippedEffect === item.id ? 'EQUIPPED' : 'OWNED'}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="w-14 h-14 bg-gray-100 border-[3px] border-black rounded-full flex items-center justify-center mb-2 shadow-inner">
                                                {item.icon}
                                            </div>
                                            <span className="font-black text-sm text-center leading-tight mb-2">{item.name[currentLang]}</span>
                                            <div className={`flex items-center justify-center gap-1 w-full py-1.5 rounded-lg border-2 border-black ${shopCategory === 'supplies' ? 'bg-[#FFD700]' : 'bg-[#E0F2FE]'}`}>
                                                {shopCategory === 'supplies' ? <CarrotCoinIcon className="w-4 h-4" /> : <FarmIcons.StarSand className="w-4 h-4" />}
                                                <span className="text-xs font-black">{item.price}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}

                    {/* EXPLORE TAB */}
                    {activeTab === 'explore' && (
                        <div className="flex flex-col w-full h-full pt-1 pb-4 px-2">
                            {!selectedPet ? (
                                <div className="flex flex-col items-center justify-center w-full h-full opacity-50">
                                    <FarmIcons.Explore />
                                    <p className="font-black mt-2 text-center">{T.selectFirst[currentLang]}</p>
                                </div>
                            ) : selectedPet.isOnExpedition ? (
                                (() => {
                                    const duration = selectedPet.expeditionDuration || (2 * 60 * 60 * 1000);
                                    const timePassed = Date.now() - (selectedPet.expeditionStartTime || 0);
                                    const isDone = timePassed >= duration;

                                    if (isDone) {
                                        return (
                                            /* 【教练笔记】探险归来：必须加上 w-full，否则 items-center 找不到全宽的中心，就会缩在左边 */
                                            <div className="flex flex-col items-center justify-center w-full h-full gap-2 py-2">
                                                <div className="w-16 h-16 bg-green-100 border-[3px] border-black rounded-full flex items-center justify-center animate-bounce">
                                                    <FarmIcons.Explore />
                                                </div>
                                                <p className="font-black text-[#82E0AA] uppercase tracking-wider text-center mt-2">{T.returned[currentLang]}</p>
                                                <button onClick={handleClaimExpedition} className="mt-2 bg-[#FFD700] border-[4px] border-black px-6 py-2 rounded-2xl font-black text-black shadow-[4px_4px_0_black] active:translate-y-1 active:shadow-none flex items-center justify-center gap-2">
                                                    <CarrotCoinIcon className="w-5 h-5" />{T.checkResult[currentLang]}
                                                </button>
                                            </div>
                                        );
                                    } else {
                                        const h = Math.floor((duration - timePassed) / 3600000);
                                        const m = Math.floor(((duration - timePassed) % 3600000) / 60000);
                                        return (
                                            /* 【教练笔记】探险中：加上 w-full，并去掉死板的 justify-center，改用 py-4 留出上下呼吸空间，防止顶部虚线被切断！ */
                                            <div className="flex flex-col items-center w-full h-full py-4">
                                                <div className="flex flex-col items-center gap-2 bg-gray-100 border-[3px] border-dashed border-black p-2 rounded-3xl w-full max-w-[260px] mx-auto">
                                                    <div className="w-12 h-12 bg-[#85C1E9] border-[3px] border-black rounded-full flex items-center justify-center animate-pulse"><FarmIcons.Explore /></div>
                                                    <p className="font-black text-sm uppercase text-center mt-1">{T.exploringState[currentLang]}</p>
                                                    <div className="bg-black text-white px-4 py-1.5 rounded-xl font-mono font-bold tracking-widest">{h}H {m}M</div>
                                                </div>
                                            </div>
                                        );
                                    }
                                })()
                            ) : (
                                /* 探险选项状态：保持原样，利用 grid 正常排列 */
                                <div className="grid grid-cols-2 gap-3 w-full">
                                    {EXPEDITION_OPTIONS.map((opt, i) => (
                                        <div key={i} onClick={() => startExpedition(opt)} className="bg-white border-[4px] border-black rounded-2xl p-3 flex flex-col items-center justify-center cursor-pointer shadow-[4px_4px_0_black] hover:bg-[#82E0AA] transition-colors active:translate-y-1 active:shadow-none">
                                            <div className="font-black text-sm mb-1 text-center">{opt.label[currentLang]}</div>
                                            <div className="text-xs font-bold text-gray-500 mb-2">{opt.minutes} MIN</div>
                                            <div className="flex w-full justify-between items-center text-[10px] font-black border-t-[3px] border-black border-dashed pt-2">
                                                <span className="text-[#D2691E] flex items-center gap-1"><div className="w-3 h-3"><FarmIcons.Hunger /></div> -{opt.hungerCost}</span>
                                                <span className="flex items-center gap-0.5 text-yellow-600"><CarrotCoinIcon className="w-3 h-3" /> +{opt.reward}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </footer>

            {/* 💌 多功能结算弹窗 (使用 Portal 彻底解决任何偏移问题！) */}
            {claimedPostcard && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[11000] flex items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-auto p-4 animate-fade-in">
                    <div className="bg-white p-5 pb-8 rounded-[2rem] shadow-[15px_15px_0_rgba(0,0,0,0.8)] w-full max-w-[320px] animate-bounce-in flex flex-col items-center relative">
                        <div className="absolute -top-4 w-24 h-8 bg-white/50 backdrop-blur-md border border-gray-200 rotate-3 shadow-sm z-10" />

                        {claimedPostcard.type === 'event' ? (
                            <div className="w-full aspect-square bg-[#1a1a2e] border-4 border-black mb-4 overflow-hidden relative shadow-inner rounded-xl">
                                <img src={claimedPostcard.event.img} alt="Event" className="w-full h-full object-cover opacity-90 mix-blend-screen" />
                            </div>
                        ) : (
                            <div className="w-full h-40 bg-[#EAFFD0] border-4 border-black border-dashed mb-4 flex items-center justify-center rounded-xl">
                                {claimedPostcard.type === 'peaceful' && <div className="text-5xl animate-float">🛸</div>}
                                {(claimedPostcard.type === 'char_part' || claimedPostcard.type === 'planet_part') && <div className="text-5xl animate-bounce">🎁</div>}
                                {claimedPostcard.type === 'furniture' && <div className="w-16 h-16">{claimedPostcard.item.svg}</div>}
                            </div>
                        )}

                        <h3 className="font-black text-xl uppercase tracking-tighter mb-2 text-center text-gray-800">
                            {claimedPostcard.type === 'event' ? claimedPostcard.event.title[currentLang] : (claimedPostcard.type === 'peaceful' ? claimedPostcard.title[currentLang] : (currentLang === 'cn' ? '发现新战利品！' : 'New Loot Found!'))}
                        </h3>
                        <p className="font-hand text-sm text-gray-600 text-center leading-tight mb-4 px-2">
                            {claimedPostcard.type === 'event' ? claimedPostcard.event.desc[currentLang] : (claimedPostcard.type === 'peaceful' ? claimedPostcard.desc[currentLang] : claimedPostcard.item.name[currentLang])}
                        </p>

                        <div className="flex items-center gap-2 bg-[#FFD700] px-6 py-2 border-[3px] border-black rounded-full shadow-[3px_3px_0_black] mb-6">
                            <CarrotCoinIcon className="w-6 h-6" />
                            <span className="font-black text-xl">+{claimedPostcard.reward}</span>
                        </div>

                        <div className="flex gap-3 w-full">
                            {claimedPostcard.type === 'event' && (
                                <button onClick={handleRecordEventToStory} className="flex-1 bg-[#82E0AA] text-black border-[3px] border-black py-3 rounded-xl font-black uppercase tracking-wider shadow-[3px_3px_0_black] active:translate-y-1 active:shadow-none transition-all text-xs">
                                    {currentLang === 'cn' ? '录入手帐 (+10)' : 'RECORD (+10)'}
                                </button>
                            )}
                            <button onClick={() => { playSound?.('click'); setClaimedPostcard(null); }} className="flex-1 bg-black text-white border-[3px] border-black py-3 rounded-xl font-black uppercase tracking-wider active:scale-95 transition-transform text-xs">
                                {currentLang === 'cn' ? '知道了' : 'GOT IT'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* 👇 加上这段控制所有互动的 CSS 动画 👇 */}
            <style>{`
                @keyframes wobble { 
                    0%, 100% { transform: rotate(0deg); } 
                    25% { transform: rotate(-5deg); } 
                    75% { transform: rotate(5deg); } 
                }
                .animate-wobble { animation: wobble 0.4s ease-in-out; }
                
                /* 🌟 带有真实重力感和回弹的娃娃机下坠动画 */
                @keyframes claw-drop { 
                    0% { transform: translateY(-400px); } 
                    60% { transform: translateY(20px); } 
                    80% { transform: translateY(-10px); } 
                    100% { transform: translateY(0); } 
                }
                .animate-claw-drop { animation: claw-drop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
                
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

const StatBar = ({ icon, value, color }: any) => (
    <div className="flex items-center gap-2 w-full">
        <div className="bg-white border-[3px] border-black p-1 rounded-md shadow-[2px_2px_0_black] flex-shrink-0 z-10">{icon}</div>
        <div className="relative flex-1 h-3.5 bg-white border-[3px] border-black rounded-full overflow-hidden ml-[-8px]">
            <div className={`h-full ${color} transition-all duration-500 ease-out border-r-[2px] border-black`} style={{ width: `${value}%` }} />
            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-black drop-shadow-[1px_1px_0_white]">{Math.floor(value)}/100</span>
        </div>
    </div>
);

const TabButton = ({ active, onClick, icon, color }: any) => (
    <button onClick={onClick} className={`w-16 h-16 rounded-[24px] border-[4px] border-black flex items-center justify-center transition-all ${active ? `${color} shadow-none translate-y-2` : `bg-white shadow-[0_8px_0_black] hover:translate-y-1 hover:shadow-[0_4px_0_black]`}`}>
        <div className={`transform transition-transform ${active ? 'scale-125' : 'scale-100'}`}>{icon}</div>
    </button>
);