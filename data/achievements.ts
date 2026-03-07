import { AchievementDef } from '../types';

export const ACHIEVEMENTS_DB: Record<string, AchievementDef> = {
    // --- 已有的 6 个 ---
    first_blood: {
        id: 'first_blood',
        icon: '🌱',
        imageUrl: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Achievements-01a-Uranuskopp.png',
        title: { cn: '你好，宇宙', en: 'Hello Universe', se: 'Hej Universum' },
        desc: { cn: '保存了第一个星际档案', en: 'Saved your first passport', se: 'Sparade ditt första pass' },
        size: 'lg', color: 'bg-green-300',
    },
    rich_rabbit: {
        id: 'rich_rabbit',
        icon: '🥕',
        imageUrl: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Achievements-03-Morotmynt.png',
        title: { cn: '胡萝卜富翁', en: 'Carrot Tycoon', se: 'Morotsmagnat' },
        desc: { cn: '累计获得 50 个胡萝卜', en: 'Earned 50 carrots', se: 'Tjänade 50 morötter' },
        size: 'xl', color: 'bg-orange-400',
    },
    big_bang_fan: {
        id: 'big_bang_fan',
        icon: '🎲',
        imageUrl: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Achievements-05-Goldmynt.png',
        title: { cn: '狂热赌徒', en: 'Big Bang Fan', se: 'Big Bang Fan' },
        desc: { cn: '使用 Big Bang 超过 10 次', en: 'Used Big Bang 10 times', se: 'Använde Big Bang 10 gånger' },
        size: 'md', color: 'bg-purple-400',
    },
    legendary_luck: {
        id: 'legendary_luck',
        icon: '👑',
        imageUrl: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Achievements-16-Merkuriuskopp.png',
        title: { cn: '天选之人', en: 'The Chosen One', se: 'Den Utvalde' },
        desc: { cn: '抽中了 Legendary 等级部件', en: 'Rolled a Legendary part', se: 'Fick en Legendary del' },
        size: 'lg', color: 'bg-yellow-400',
    },
    social_butterfly: {
        id: 'social_butterfly',
        icon: '💌',
        imageUrl: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Achievements-07-Marskopp.png',
        title: { cn: '星际交际花', en: 'Social Butterfly', se: 'Social Fjäril' },
        desc: { cn: '建立第一条角色关系', en: 'Made first connection', se: 'Skapade första relationen' },
        size: 'lg', color: 'bg-pink-300',
    },
    collector_10: {
        id: 'collector_10',
        icon: '📚',
        imageUrl: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Achievements-02-solkopp.png',
        title: { cn: '十全十美', en: 'Perfect Ten', se: 'Perfekt Tio' },
        desc: { cn: '档案库收集达 10 人', en: 'Collected 10 passports', se: 'Samlade 10 pass' },
        size: 'xl', color: 'bg-blue-400',
    },

    // --- 新增的 10 个 ---
    rename_expert: {
        id: 'rename_expert', icon: '📝', imageUrl: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Achievements-08-moonkopp.png',
        title: { cn: '改名部部长', en: 'Rename Expert', se: 'Namngivningsexpert' },
        desc: { cn: '赋予了居民一个新的名字', en: 'Gave a resident a new name', se: 'Gav en invånare ett nytt namn' },
        size: 'lg', color: 'bg-yellow-200'
    },
    fashionista: {
        id: 'fashionista', icon: '👕', imageUrl: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Achievements-09-Neptunuskopp.png',
        title: { cn: '时尚达人', en: 'Fashionista', se: 'Modeikon' },
        desc: { cn: '切换分类标签页超过 5 次', en: 'Spent time in the dressing room', se: 'Spenderade tid i provrummet' },
        size: 'lg', color: 'bg-pink-200'
    },
    planet_hopper: {
        id: 'planet_hopper', icon: '🪐', imageUrl: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Achievements-10-Maskhålskopp.png',
        title: { cn: '搬家公司', en: 'Planet Hopper', se: 'Planethoppare' },
        desc: { cn: '探索了不同的星球底座', en: 'Explored different planet bases', se: 'Utforskade olika planetbaser' },
        size: 'lg', color: 'bg-blue-200'
    },
    first_harvest: {
        id: 'first_harvest', icon: '💰', imageUrl: '',
        title: { cn: '第一桶金', en: 'First Harvest', se: 'Första Skörden' },
        desc: { cn: '通过写故事赚到了第一笔钱', en: 'Earned your first coins via stories', se: 'Tjänade dina första mynt via berättelser' },
        size: 'lg', color: 'bg-orange-200'
    },
    the_gambler: {
        id: 'the_gambler', icon: '🎰', imageUrl: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Achievements-11-Venuskopp.png',
        title: { cn: '赌神', en: 'The Gambler', se: 'Gamblaren' },
        desc: { cn: '在 1 分钟内点击 10 次 Big Bang', en: '10 Big Bangs in a minute', se: '10 Big Bangs på en minut' },
        size: 'md', color: 'bg-red-400'
    },
    zero_luck: {
        id: 'zero_luck', icon: '💀', imageUrl: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Achievements-06-Brassmynt.png',
        title: { cn: '非酋的愤怒', en: 'Zero Luck', se: 'Noll Tur' },
        desc: { cn: '连续 10 次 Big Bang 没出 Rare', en: '10 Big Bangs without any Rare items', se: '10 Big Bangs utan sällsynta föremål' },
        size: 'md', color: 'bg-gray-400'
    },
    space_reporter: {
        id: 'space_reporter', icon: '🎤', imageUrl: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Achievements-12-Saturnuskopp.png',
        title: { cn: '星际记者', en: 'Space Reporter', se: 'Rymdreporter' },
        desc: { cn: '累计撰写了 5 篇星际日记', en: 'Wrote 5 interstellar diaries', se: 'Skrev 5 rymddagböcker' },
        size: 'lg', color: 'bg-green-200'
    },
    all_rounder: {
        id: 'all_rounder', icon: '⚖️', imageUrl: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Achievements-13-Jupiterkopp.png',
        title: { cn: '全能选手', en: 'All-Rounder', se: 'Allround-spelare' },
        desc: { cn: '各项属性达到了完美的平衡', en: 'All stats are perfectly balanced', se: 'Alla stats är perfekt balanserade' },
        size: 'xl', color: 'bg-teal-200'
    },
    midnight_radio: {
        id: 'midnight_radio', icon: '📻', imageUrl: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Achievements-14-Svarthålskopp.png',
        title: { cn: '午夜电波', en: 'Midnight Radio', se: 'Midnattsradio' },
        desc: { cn: '深夜是灵感迸发的时刻', en: 'Inspiration strikes at midnight', se: 'Inspirationen slår till vid midnatt' },
        size: 'xl', color: 'bg-indigo-900'
    },
    polyglot: {
        id: 'polyglot', icon: '🌍', imageUrl: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Achievements-15-jordkopp.png',
        title: { cn: '多语种大师', en: 'Polyglot', se: 'Polyglott' },
        desc: { cn: '尝试过所有三种语言', en: 'Tried all three cosmic languages', se: 'Provat alla tre rymdspråk' },
        size: 'lg', color: 'bg-white'
    }
};