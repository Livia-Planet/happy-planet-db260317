
import { CharacterStats, PartCategory, Language, PassportData } from '../types';
import { PARTS_DB } from '../data/parts';

export const BASE_STATS: CharacterStats = { mod: 1, bus: 1, klurighet: 1 };

export const calculateStats = (selectedParts: Record<PartCategory, string>, overrideStats?: CharacterStats): CharacterStats => {
  if (overrideStats) return overrideStats;
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
    se: "Först.Namn (ex Bobu.B)",
    en: "First.Last (e.g. Bobu.B)",
    cn: "名.姓 (如 Bobu.B)"
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
    close: { se: "Stäng", en: "Close", cn: "关闭" },
    viewStarMap: { se: "Visa relationskarta", en: "View Star Relations", cn: "查看星际关系图" },
    starMapTitle: { se: "Relationer", en: "Relations", cn: "星际关系图" },
    starMapEmpty: { se: "Inga stjärnkopplingar än...", en: "No star connections yet...", cn: "暂无星际连线..." },
    confirmDelete: {
      se: "Är du säker på att du vill ta bort denna invånare från stjärnarkivet? Detta kan inte ångras.",
      en: "Are you sure you want to remove this resident from the interstellar archives? This action cannot be undone.",
      cn: "确定要把这个居民从星际档案中移除吗？此操作不可撤销。"
    },
    tabs: {
      profile: { se: "PROFIL", en: "PROFILE", cn: "档案" },
      personality: { se: "PERSONLIGHET", en: "PERSONALITY", cn: "性格" },
      relations: { se: "RELATIONER", en: "RELATIONS", cn: "关系" },
      story: { se: "BERÄTTELSE", en: "STORY", cn: "故事" }
    },
    labels: {
      age: { se: "ÅLDER", en: "AGE", cn: "年龄" },
      gender: { se: "KÖN", en: "GENDER", cn: "性别" },
      location: { se: "PLATS", en: "LOCATION", cn: "发现地" },
      date: { se: "DATUM", en: "DATE", cn: "日期" },
      mystery: { se: "Mystisk förlorad invånare", en: "Mysterious Missing Inhabitant", cn: "神秘的失联居民" },
      genderLabel: { se: "KÖN", en: "GENDER", cn: "性别" },
      speciesLabel: { se: "RAS", en: "RACE", cn: "种族" },
      occupationLabel: { se: "YRKESTITLAR", en: "OCCUPATIONS", cn: "职业标签" }
    },
    genders: {
      male: { se: "Man", en: "Man", cn: "男" },
      female: { se: "Kvinna", en: "Woman", cn: "女" },
      nonbinary: { se: "Icke-binär", en: "Non-binary", cn: "中性" },
      unknown: { se: "Okänd", en: "Unknown", cn: "未知" }
    },
    occupations: {
      student: { se: "Student", en: "Student", cn: "学生" },
      teacher: { se: "Lärare", en: "Teacher", cn: "老师" },
      sushi_master: { se: "Sushimästare", en: "Sushi Master", cn: "寿司大师" },
      streamer: { se: "Streamer", en: "Streamer", cn: "主播" },
      barber: { se: "Barberare", en: "Barber", cn: "理发师" },
      engineer: { se: "Ingenjör", en: "Engineer", cn: "工程师" },
      inventor: { se: "Uppfinnare", en: "Inventor", cn: "发明家" },
      explorer: { se: "Upptäckare", en: "Explorer", cn: "探险家" },
      skateboard_master: { se: "Skateboardmästare", en: "Skateboard Master", cn: "滑板大师" },
      painter: { se: "Målare", en: "Painter", cn: "画家" },
      artist: { se: "Konstnär", en: "Artist", cn: "艺术家" },
      scientist: { se: "Forskare", en: "Scientist", cn: "科学家" }
    },
    species: {
      rabbit: { se: "Kanin", en: "Rabbit", cn: "小兔子" },
      pluttis: { se: "Pluttis", en: "Pluttis", cn: "普鲁提" },
      yeti: { se: "Snömonster", en: "Yeti", cn: "雪怪" },
      elf: { se: "Alv", en: "Elf", cn: "精灵" },
      building: { se: "Byggnad", en: "Building", cn: "建筑" },
      plant: { se: "Växt", en: "Plant", cn: "植物" },
      drink: { se: "Dryck", en: "Drink", cn: "饮料" },
      genshin: { se: "Teyvat-invånare", en: "Teyvatian", cn: "提瓦特居民" }
    },
    relationTypes: {
      bestFriend: { se: "Bästis", en: "Besties", cn: "死党" },
      friend: { se: "Vän", en: "Friend", cn: "朋友" },
      foodie: { se: "Matkompis", en: "Foodie Pals", cn: "饭搭子" },
      rival: { se: "Rival", en: "Arch-rival", cn: "宿敌" },
      teacher: { se: "Lärare/Elev", en: "Teacher/Student", cn: "师生" },
      couple: { se: "Par", en: "Couple", cn: "情侣" },
      partner: { se: "Partner", en: "Partner", cn: "恋人" },
      family: { se: "Släkting", en: "Family", cn: "亲属" },
      good_friend: { se: "God Vän", en: "Good Friend", cn: "好朋友" },
      none: { se: "Ingen", en: "None", cn: "无关系" }
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
    'hair_black': { en: 'Black Hair', se: 'Svart hår', cn: '黑发' },

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

// === PERSONALITY TRAITS SYSTEM 3.0 ===
export const SuperTraitsPool = {
  mod: {
    normal: {
      low: [
        { cn: '胆小', en: 'Timid', se: 'Blyg' },
        { cn: '谨慎', en: 'Cautious', se: 'Försiktig' },
        { cn: '害羞', en: 'Shy', se: 'Blyg' }
      ],
      mid: [
        { cn: '沉稳', en: 'Steady', se: 'Stabil' },
        { cn: '温和', en: 'Gentle', se: 'Mild' },
        { cn: '靠谱', en: 'Reliable', se: 'Pålitlig' }
      ],
      high: [
        { cn: '勇敢', en: 'Brave', se: 'Modig' },
        { cn: '热血', en: 'Passionate', se: 'Hängiven' },
        { cn: '坚强', en: 'Strong', se: 'Stark' },
        { cn: '刚毅', en: 'Resolute', se: 'Beslutsam' }
      ]
    },
    scifi: {
      low: [
        { cn: '避雷针倾向', en: 'Lightning-Rod', se: 'Åskledare' },
        { cn: '能量节省者', en: 'Energy-Saver', se: 'Energisparare' }
      ],
      mid: [
        { cn: '亚光速惯性', en: 'Sub-light Inertia', se: 'Sub-ljus tröghet' },
        { cn: '耀斑心脏', en: 'Flare-Heart', se: 'Flare-hjärta' }
      ],
      high: [
        { cn: '超新星意志', en: 'Supernova-Will', se: 'Supernova-vilja' },
        { cn: '维度锚点', en: 'Dimension-Anchor', se: 'Dimensionsankare' }
      ]
    }
  },
  klurighet: {
    normal: {
      low: [
        { cn: '憨厚', en: 'Simple', se: 'Enkel' },
        { cn: '单纯', en: 'Innocent', se: 'Oskyldig' },
        { cn: '迷糊', en: 'Clumsy', se: 'Vimsig' }
      ],
      mid: [
        { cn: '乐于助人', en: 'Helpful', se: 'Hjälpsam' },
        { cn: '务实', en: 'Pragmatic', se: 'Pragmatisk' },
        { cn: '勤奋', en: 'Diligent', se: 'Flitig' }
      ],
      high: [
        { cn: '睿智', en: 'Wise', se: 'Vis' },
        { cn: '天才', en: 'Genius', se: 'Geni' },
        { cn: '敏锐', en: 'Sharp', se: 'Skarp' },
        { cn: '智多星', en: 'Mastermind', se: 'Tänkar-stjärna' }
      ]
    },
    scifi: {
      low: [
        { cn: '原始信号', en: 'Original-Signal', se: 'Originalsignal' },
        { cn: '星尘脑', en: 'Stardust-Brain', se: 'Stjärnstoftshjärna' }
      ],
      mid: [
        { cn: '逻辑脉冲', en: 'Logic-Pulse', se: 'Logisk puls' },
        { cn: '轨道计算者', en: 'Orbit-Calc', se: 'Banberäknare' }
      ],
      high: [
        { cn: '量子态思维', en: 'Quantum-Mind', se: 'Kvanttanke' },
        { cn: '算法直觉', en: 'Algo-Intuition', se: 'Algoritmisk intuition' }
      ]
    }
  },
  bus: {
    normal: {
      low: [
        { cn: '严谨', en: 'Rigorous', se: 'Rigorös' },
        { cn: '严肃', en: 'Serious', se: 'Allvarlig' },
        { cn: '固执', en: 'Stubborn', se: 'Envis' }
      ],
      mid: [
        { cn: '幽默', en: 'Humorous', se: 'Humoristisk' },
        { cn: '梦想家', en: 'Dreamer', se: 'Drömmare' },
        { cn: '开朗', en: 'Cheerful', se: 'Glad' }
      ],
      high: [
        { cn: '顽皮', en: 'Playful', se: 'Lekfull' },
        { cn: '叛逆', en: 'Rebellious', se: 'Rebellisk' },
        { cn: '狂野', en: 'Wild', se: 'Vild' },
        { cn: '捣蛋鬼', en: 'Troublemaker', se: 'Busfrö' }
      ]
    },
    scifi: {
      low: [
        { cn: '绝对零度', en: 'Absolute-Zero', se: 'Absoluta nollpunkten' },
        { cn: '黑洞引力', en: 'Blackhole-Grav', se: 'Svart håls grav' }
      ],
      mid: [
        { cn: '星云漫想', en: 'Nebula-Reverie', se: 'Nebulosadrömmar' },
        { cn: '自由漂浮', en: 'Free-Float', se: 'Fritt flytande' }
      ],
      high: [
        { cn: '信号干扰', en: 'Signal-Jammer', se: 'Signalstörning' },
        { cn: '混沌驱动', en: 'Chaos-Drive', se: 'Kaosdrift' }
      ]
    }
  }
};

export const getMixedTraits = (id: string, stats: CharacterStats): { id: string; type: 'mod' | 'bus' | 'klurighet'; isScifi: boolean; name: Record<Language, string> }[] => {
  // Hardcoded for Permanent Residents
  if (id.includes('HP-00002-DUDDU-A')) {
    return [
      { id: 't1', type: 'mod', isScifi: false, name: { cn: '勇敢', en: 'Brave', se: 'Modig' } },
      { id: 't2', type: 'klurighet', isScifi: false, name: { cn: '乐于助人', en: 'Helpful', se: 'Hjälpsam' } },
      { id: 't3', type: 'mod', isScifi: true, name: { cn: '耀斑心脏', en: 'Flare-Heart', se: 'Flare-hjärta' } }
    ];
  }
  if (id.includes('HP-00001-BOBU-B')) {
    return [
      { id: 't1', type: 'klurighet', isScifi: false, name: { cn: '好奇宝宝', en: 'Curious', se: 'Nyfiken' } },
      { id: 't2', type: 'bus', isScifi: false, name: { cn: '梦想家', en: 'Dreamer', se: 'Drömmare' } },
      { id: 't3', type: 'bus', isScifi: true, name: { cn: '信号干扰专家', en: 'Signal-Jammer', se: 'Signalstörning' } }
    ];
  }

  // Generic Logic
  const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const dimensions: ('mod' | 'bus' | 'klurighet')[] = ['mod', 'bus', 'klurighet'];

  // 1. Pick dimension for Sci-fi
  const scifiDimIndex = seed % 3;
  const scifiDim = dimensions[scifiDimIndex];

  const getTier = (val: number): 'low' | 'mid' | 'high' => {
    if (val <= 3) return 'low';
    if (val <= 6) return 'mid';
    return 'high';
  };

  const traits: any[] = [];

  dimensions.forEach((dim, idx) => {
    const isScifi = idx === scifiDimIndex;
    const tier = getTier(stats[dim]);
    const pool = isScifi ? (SuperTraitsPool as any)[dim].scifi[tier] : (SuperTraitsPool as any)[dim].normal[tier];

    // Pick one from pool based on seed and dimension
    const traitIndex = (seed + idx) % pool.length;
    const traitData = pool[traitIndex];

    traits.push({
      id: `${dim}_${isScifi ? 'scifi' : 'normal'}_${idx}`,
      type: dim,
      isScifi: isScifi,
      name: { cn: traitData.cn, en: traitData.en, se: traitData.se }
    });
  });

  return traits;
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
      se: "En riktig busunge with glitter in blicken!",
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
  duddu: {
    se: "Duddu.A är en modig kanin som älskar skateboard! Han är känd för sina häftiga tricks och är en riktig äventyrare som alltid hjälper sina vänner.",
    en: "Duddu.A is a brave rabbit who loves skateboarding! Known for his cool tricks, he's a true adventurer who's always ready to be a hero for his friends.",
    cn: "Duddu.A 是一只勇敢的小兔子。他超级热爱滑板，能做出各种惊人的特技，是朋友们眼中无所畏惧的冒险家和英雄！"
  },
  polly: {
    se: "Polly är en superkreativ liten kanin, och hennes målningar är som magi från en annan planet! Hennes konst är alltid full av värme, drömmar och oändlig fantasi.",
    en: "Polly is an incredibly creative little bunny, and her paintings are like magic from another planet! Her art is always filled with warmth, dreams, and endless imagination.",
    cn: "Polly 是一只超级有创意的小兔子，她的画作仿佛来自外星的魔法！她的艺术总是充满了温暖、梦想和无尽的想象力。"
  },
  pluttenplott: {
    se: "Pluttenplott är en liten vetenskapsman och ingenjör som älskar att utforska universums mysterier. Med sin logik och sina fantastiska uppfinningar drömmer han om att en dag bygga en bro till stjärnorna.",
    cn: "Pluttenplott 是一位热爱探索宇宙奥秘的小科学家和工程师。凭借着缜密的逻辑和神奇的发明，他梦想着有一天能修筑一座通往星辰的桥梁。",
    en: "Pluttenplott is a little scientist and engineer who loves exploring the mysteries of the universe. With his logic and amazing inventions, he dreams of one day building a bridge to the stars."
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

export const getStarDate = (): string => {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `SD-${yyyy}.${mm}.${dd}`;
};

// *** 宇宙名字生成器 (Hard‑Code Protocol Section 1) ***
// 生成形如 FirstName.Surname 的名字，姓氏为单字母或单数字
export const generateStarName = (): string => {
  const fNames = ['Zorp', 'Pix', 'Mochi', 'Nova', 'Nico', 'Bibi'];
  const lNames = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
  return `${fNames[Math.floor(Math.random() * fNames.length)]}.${lNames[Math.floor(Math.random() * lNames.length)]}`;
};

export const BOBU_PRESET: PassportData = {
  id: 'HP-00001-BOBU-B',
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
  age: '3',
  gender: 'female',
  species: 'rabbit',
  occupations: ['student', 'explorer'],
  location: 'Kaninplaneten',
  relationships: [
    { targetId: 'HP-00002-DUDDU-A', relationType: 'bestFriend' },
    { targetId: 'HP-00003-POLLYPLUTTEN-A-B', relationType: 'friend' },
    { targetId: 'HP-00004-PLUTTENPLOTT-E-F', relationType: 'friend' }
  ],
  stats: {
    mod: 9,
    bus: 9,
    klurighet: 3
  }
};

export const DUDDU_PRESET: PassportData = {
  id: 'HP-00002-DUDDU-A',
  name: 'Duddu.A',
  selectedParts: {
    body: 'body_camel',
    ears: 'ears_camel',
    face: 'eyes_dot',
    hair: 'hair_none',
    access: 'access_helmet'
  },
  selectedPlanetParts: {
    base: 'planet_base_green',
    surface: 'planet_surf_none',
    atmosphere: 'planet_atmo_rings',
    companion: 'planet_comp_ufo'
  },
  lastModified: 1700000000000,
  savedAt: 1700000000000,
  bio: DEFAULT_BIOS.duddu.se,
  age: '3',
  gender: 'male',
  species: 'rabbit',
  occupations: ['student', 'skateboard_master'],
  location: 'Kaninplaneten',
  relationships: [
    { targetId: 'HP-00001-BOBU-B', relationType: 'bestFriend' },
    { targetId: 'HP-00003-POLLYPLUTTEN-A-B', relationType: 'friend' },
    { targetId: 'HP-00004-PLUTTENPLOTT-E-F', relationType: 'friend' }
  ],
  stats: {
    mod: 8,
    bus: 7,
    klurighet: 6
  }
};

export const POLLY_PRESET: PassportData = {
  id: 'HP-00003-POLLYPLUTTEN-A-B',
  name: 'Polly.A.B',
  selectedParts: {
    body: 'body_white',
    ears: 'ears_white',
    face: 'mouth_smile',
    hair: 'hair_none',
    access: 'access_beret'
  },
  selectedPlanetParts: {
    base: 'planet_base_blue',
    surface: 'planet_surf_craters',
    atmosphere: 'planet_atmo_none',
    companion: 'planet_comp_moon'
  },
  lastModified: 1700000000000,
  savedAt: 1700000000000,
  bio: DEFAULT_BIOS.polly.se,
  age: '3',
  gender: 'male',
  species: 'rabbit',
  occupations: ['student', 'painter', 'artist'],
  location: 'Kaninplaneten',
  relationships: [
    { targetId: 'HP-00001-BOBU-B', relationType: 'friend' },
    { targetId: 'HP-00002-DUDDU-A', relationType: 'friend' },
    { targetId: 'HP-00004-PLUTTENPLOTT-E-F', relationType: 'family' }
  ],
  stats: {
    mod: 4,
    bus: 7,
    klurighet: 7
  }
};

export const PLUTTENPLOTT_PRESET: PassportData = {
  id: 'HP-00004-PLUTTENPLOTT-E-F',
  name: 'Plott.E.F',
  selectedParts: {
    body: 'body_amber',
    ears: 'ears_amber',
    face: 'eyes_glasses',
    hair: 'hair_black',
    access: 'access_none'
  },
  selectedPlanetParts: {
    base: 'planet_base_yellow',
    surface: 'planet_surf_none',
    atmosphere: 'planet_atmo_none',
    companion: 'planet_comp_none'
  },
  lastModified: 1700000000000,
  savedAt: 1700000000000,
  bio: DEFAULT_BIOS.pluttenplott.se,
  age: '6',
  gender: 'male',
  species: 'rabbit',
  occupations: ['engineer', 'scientist', 'inventor'],
  location: 'Kaninplaneten',
  relationships: [
    { targetId: 'HP-00001-BOBU-B', relationType: 'friend' },
    { targetId: 'HP-00002-DUDDU-A', relationType: 'friend' },
    { targetId: 'HP-00003-POLLYPLUTTEN-A-B', relationType: 'family' }
  ],
  stats: {
    mod: 4,
    bus: 5,
    klurighet: 9
  }
};

export const ALL_PRESETS = [BOBU_PRESET, DUDDU_PRESET, POLLY_PRESET, PLUTTENPLOTT_PRESET];
