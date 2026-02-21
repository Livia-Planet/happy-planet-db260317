
import { CharacterStats, PartCategory, Language, PassportData } from '../types';
import { PARTS_DB } from '../data/parts';

export const BASE_STATS: CharacterStats = { mod: 1, bus: 1, klurighet: 1 };

export const calculateStats = (selectedParts: Record<PartCategory, string>): CharacterStats => {
  const currentStats = { ...BASE_STATS };
  
  Object.values(selectedParts).forEach(partId => {
    const part = PARTS_DB[partId];
    if (part) {
      currentStats.mod += part.stats.mod;
      currentStats.bus += part.stats.bus;
      currentStats.klurighet += part.stats.klurighet;
    }
  });

  currentStats.mod = Math.min(9, currentStats.mod);
  currentStats.bus = Math.min(9, currentStats.bus);
  currentStats.klurighet = Math.min(9, currentStats.klurighet);

  return currentStats;
};

export const getDominantStat = (stats: CharacterStats): 'mod' | 'bus' | 'klurighet' => {
  const { mod, bus, klurighet } = stats;
  if (mod >= bus && mod >= klurighet) return 'mod';
  if (bus >= mod && bus >= klurighet) return 'bus';
  return 'klurighet';
};

// === TRANSLATIONS ===
export const TRANSLATIONS = {
  appTitle: {
    se: "HAPPY PLANET",
    en: "HAPPY PLANET",
    cn: "快乐星球"
  },
  idTitle: {
    se: "Officiellt Happy Planet-ID",
    en: "Official Happy Planet ID",
    cn: "快乐星球官方居民证"
  },
  namePlaceholder: {
    se: "Skriv namn...",
    en: "Enter name...",
    cn: "输入名字..."
  },
  buttons: {
    showFront: { se: "Visa Framsida", en: "Show Front", cn: "查看正面" },
    showBack: { se: "Visa Baksida", en: "Show Back", cn: "查看背面" }
  },
  stats: {
    mod: { se: "Mod", en: "Bravery", cn: "勇气" },
    bus: { se: "Bus", en: "Mischief", cn: "顽皮" },
    klurighet: { se: "Klurighet", en: "Wisdom", cn: "智慧" }
  },
  statLabels: { 
    mod: { se: "MOD", en: "BRA", cn: "勇气" },
    bus: { se: "BUS", en: "MIS", cn: "顽皮" },
    klurighet: { se: "KLU", en: "WIS", cn: "智慧" }
  },
  energyTypes: {
    mod: { se: "RÖD ENERGI", en: "RED ENERGY", cn: "红色能量" },
    bus: { se: "GUL ENERGI", en: "YELLOW ENERGY", cn: "黄色能量" },
    klurighet: { se: "BLÅ ENERGI", en: "BLUE ENERGY", cn: "蓝色能量" }
  },
  ui: {
    residentName: { se: "NAMN", en: "RESIDENT NAME", cn: "居民姓名" },
    // Front Tabs (UPDATED)
    body: { se: "KROPP", en: "BODY", cn: "身体" },
    ears: { se: "ÖRON", en: "EARS", cn: "耳朵" },
    face: { se: "ANSIKTE", en: "FACE", cn: "脸部" },
    hair: { se: "HÅR", en: "HAIR", cn: "发型" },
    access: { se: "ACCESSOARER", en: "ACCESSORIES", cn: "饰品" },
    
    // Back Tabs
    base: { se: "BAS", en: "BASE", cn: "基底" },
    surface: { se: "YTA", en: "SURFACE", cn: "地貌" },
    atmos: { se: "ATMOS", en: "ATMOS", cn: "大气" },
    comp: { se: "KOMPIS", en: "COMP", cn: "伙伴" },

    // New UI Elements
    delete: { se: "Ta bort", en: "Delete", cn: "删除" },
    confirmDelete: { 
      se: "Är du säker på att du vill ta bort denna invånare från stjärnarkivet? Detta kan inte ångras.", 
      en: "Are you sure you want to remove this resident from the interstellar archives? This action cannot be undone.", 
      cn: "确定要把这个居民从星际档案中移除吗？此操作不可撤销。" 
    },
    tabs: {
      bio: { se: "BIO", en: "BIO", cn: "档案" },
      story: { se: "SAGA", en: "STORY", cn: "故事" },
      stats: { se: "KRAFT", en: "STATS", cn: "能力" }
    },
    labels: {
      age: { se: "ÅLDER", en: "AGE", cn: "年龄" },
      location: { se: "PLATS", en: "LOCATION", cn: "发现地" },
      date: { se: "DATUM", en: "DATE", cn: "日期" }
    }
  },
  parts: {
     // EARS (New)
     'ears_default': { en: 'Round Ears', se: 'Runda Öron', cn: '圆耳朵' },
     'ears_elf': { en: 'Elf Ears', se: 'Alvöron', cn: '精灵耳' },
     'ears_tech': { en: 'Robo Receivers', se: 'Robo-öron', cn: '机器耳' },
     // EARS Colors
     'ears_mimosa': { en: 'Mimosa Yellow', se: 'Mimosa-gul', cn: '含羞草色' },
     'ears_amber': { en: 'Amber', se: 'Bärnsten', cn: '琥珀色' },
     'ears_pastel': { en: 'Pastel Yellow', se: 'Pastellgul', cn: '粉黄色' },
     'ears_camel': { en: 'Camel', se: 'Kamel', cn: '驼色' },
     'ears_white': { en: 'White', se: 'Vit', cn: '白色' },
     'ears_rose': { en: 'Rose Red', se: 'Rosröd', cn: '玫瑰红' },

     // BODY
     'body_classic': { en: 'Classic Cream', se: 'Klassisk Grädde', cn: '经典奶油' },
     'body_tech': { en: 'Cyber Grey', se: 'Cybergrå', cn: '赛博灰' },
     'body_gold': { en: 'Golden Star', se: 'Guldstjärna', cn: '金色星星' },
     'body_mimosa': { en: 'Mimosa Yellow', se: 'Mimosa-gul', cn: '含羞草色' },
     'body_amber': { en: 'Amber', se: 'Bärnsten', cn: '琥珀色' },
     'body_pastel': { en: 'Pastel Yellow', se: 'Pastellgul', cn: '粉黄色' },
     'body_camel': { en: 'Camel', se: 'Kamel', cn: '驼色' },
     'body_white': { en: 'White', se: 'Vit', cn: '白色' },
     'body_rose': { en: 'Rose Red', se: 'Rosröd', cn: '玫瑰红' },

     // FACE (Merged)
     'eyes_dot': { en: 'Dots', se: 'Prickar', cn: '豆豆眼' },
     'eyes_glasses': { en: 'Smart Specs', se: 'Smarta Glasögon', cn: '智能眼镜' },
     'eyes_angry': { en: 'Determination', se: 'Beslutsamhet', cn: '坚毅眼神' },
     'mouth_smile': { en: 'Smile', se: 'Leende', cn: '微笑' },
     'mouth_open': { en: 'Laugh', se: 'Skratt', cn: '大笑' },
     'mouth_line': { en: 'Serious', se: 'Allvarlig', cn: '严肃' },

     // HAIR
     'hair_none': { en: 'None', se: 'Inget', cn: '无' },
     'hair_yellow': { en: 'Yellow Hair', se: 'Gult hår', cn: '黄头发' },

     // ACCESSORIES
     'access_none': { en: 'None', se: 'Inget', cn: '无' },
     'access_braids_yellow': { en: 'Yellow Braids', se: 'Gula flätor', cn: '黄辫子' },
     'access_beret': { en: 'Artist Beret', se: 'Konstnärsbarett', cn: '画家帽' },
     'access_helmet': { en: 'Hero Helmet', se: 'Hjälthjälm', cn: '英雄头盔' },
     'access_crown': { en: 'Paper Crown', se: 'Papperskrona', cn: '纸皇冠' },

     // PLANET
     'planet_base_none': { en: 'None', se: 'Inget', cn: '无' },
     'planet_base_red': { en: 'Magma Red', se: 'Magmaröd', cn: '岩浆红' },
     'planet_base_blue': { en: 'Ice Blue', se: 'Isblå', cn: '冰川蓝' },
     'planet_base_green': { en: 'Forest', se: 'Skog', cn: '森林绿' },
     'planet_base_yellow': { en: 'Lemon', se: 'Citron', cn: '柠檬黄' },
     'planet_surf_none': { en: 'None', se: 'Inget', cn: '无' },
     'planet_surf_craters': { en: 'Craters', se: 'Kratrar', cn: '陨石坑' },
     'planet_surf_swirls': { en: 'Swirls', se: 'Virvlar', cn: '气旋' },
     'planet_atmo_none': { en: 'None', se: 'Inget', cn: '无' },
     'planet_atmo_rings': { en: 'Saturn Rings', se: 'Saturnusringar', cn: '土星环' },
     'planet_atmo_glow': { en: 'Cosmic Glow', se: 'Kosmiskt Sken', cn: '宇宙光晕' },
     'planet_comp_none': { en: 'None', se: 'Inget', cn: '无' },
     'planet_comp_moon': { en: 'Moon', se: 'Måne', cn: '月球' },
     'planet_comp_ufo': { en: 'UFO', se: 'UFO', cn: '飞碟' },
  } as Record<string, Record<Language, string>>
};

export const getPartName = (partId: string, lang: Language): string => {
  return TRANSLATIONS.parts[partId]?.[lang] || PARTS_DB[partId]?.name || partId;
};

const FLAVOR_TEXT_DB = {
  mod: {
    low: { 
      se: "Lite försiktig men nyfiken.",
      cn: "有一点小害羞，但对世界很好奇。",
      en: "A bit cautious but curious."
    },
    mid: { 
      se: "Hoppar gärna först in i äventyret!",
      cn: "总是拍拍胸脯，第一个冲向冒险！",
      en: "Always jumps into the adventure first!"
    },
    high: { 
      se: "En orädd hjälte som räddar dagen!",
      cn: "无所畏惧的超级英雄，大家的好榜样！",
      en: "A fearless hero who saves the day!"
    }
  },
  bus: {
    low: {
      se: "Väldigt snäll och hjälpsam.",
      cn: "是个安安静静、喜欢帮忙的小乖乖。",
      en: "Very kind and helpful."
    },
    mid: {
      se: "Älskar att busa och skratta!",
      cn: "最喜欢讲笑话，满脑子都是鬼点子！",
      en: "Loves mischief and laughter!"
    },
    high: {
      se: "En riktig busunge med glitter i blicken!",
      cn: "超级调皮大王，眼睛里闪烁着小星星！",
      en: "A true rascal with a twinkle in the eye!"
    }
  },
  klurighet: {
    low: {
      se: "Ställer många frågor om stjärnorna.",
      cn: "满脑子问号，最喜欢盯着星星发呆。",
      en: "Asks many questions about the stars."
    },
    mid: {
      se: "Hittar alltid på smarta lösningar.",
      cn: "很会想办法，总能解决各种小难题。",
      en: "Always finds smart solutions."
    },
    high: {
      se: "Ett geni som kan bygga vad som helst!",
      cn: "了不起的小天才，能发明出神奇的机器！",
      en: "A genius who can build anything!"
    }
  }
};

export const generateFlavorText = (stats: CharacterStats, lang: Language): string => {
  const dominant = getDominantStat(stats);
  const value = stats[dominant];
  
  let tier: 'low' | 'mid' | 'high' = 'low';
  if (value >= 4 && value <= 6) tier = 'mid';
  if (value >= 7) tier = 'high';

  return FLAVOR_TEXT_DB[dominant][tier][lang];
};

// PRESET BIOS
export const DEFAULT_BIOS = {
  bobu: {
    se: "Bobu.B är en liten kanin från Kaninplaneten som älskar två saker mest av allt: bus och mat! Hennes aptit är oändlig!",
    en: "Bobu.B is a small rabbit from the Rabbit Planet who loves two things above all: mischief and food! Her appetite is endless!",
    cn: "Bobu.B 是一只来自兔子星球的小兔子，她最爱两件事：恶作剧和好吃的！她的胃口可是无底洞哦！"
  },
  general: {
    se: "En ny upptäcktsresande redo för att utforska galaxen.",
    en: "A new explorer ready to chart the galaxy.",
    cn: "一位准备探索银河系的全新冒险家。"
  }
};

export const generateUniqueId = (timestamp: number): string => {
  const date = new Date(timestamp);
  
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  
  return `HP - ${yyyy}${mm}${dd} - ${hh}${min}${ss}`;
};

export const BOBU_PRESET: PassportData = {
  id: 'HP-00000000-BOBU',
  name: 'Bobu.B',
  selectedParts: {
    body: 'body_mimosa',
    ears: 'ears_mimosa',
    face: 'mouth_open',
    hair: 'hair_yellow',
    access: 'access_braids_yellow'
  },
  selectedPlanetParts: {
    base: 'planet_base_red',
    surface: 'planet_surf_none',
    atmosphere: 'planet_atmo_glow',
    companion: 'planet_comp_ufo'
  },
  lastModified: 1700000000000,
  savedAt: 1700000000000,
  bio: DEFAULT_BIOS.bobu.se,
  age: '5',
  location: 'Kaninplaneten'
};
