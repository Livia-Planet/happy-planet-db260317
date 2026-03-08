import { PartDefinition, PartCategory, PlanetCategory } from '../types';

// Helper to create simple stat objects
const stats = (m: number, b: number, k: number) => ({ mod: m, bus: b, klurighet: k });

// NOTE: Ensure you have a folder named 'parts' in your public directory with these PNG files.
// 建议的权重分配逻辑：
// C (Common): 普通部件
// U (Uncommon): 稍微有点特别的部件
// R (Rare): 稍微酷一点的
// E (Epic): 华丽的
// L (Legendary): 极其罕见的（比如发光、特殊材质）
export const PARTS_DB: Record<string, PartDefinition> = {
  // === EARS (Layer 2) ===
  'ears_default': {
    id: 'ears_default',
    category: 'ears',
    name: 'Round Ears',
    stats: stats(1, 1, 1),
    rarity: 'C',
    images: { main: '/parts/ears_default.png' }
  },
  'ears_elf': {
    id: 'ears_elf',
    category: 'ears',
    name: 'Elf Ears',
    stats: stats(0, 1, 2),
    rarity: 'C',
    images: { main: '/parts/ears_elf.png' }
  },
  'ears_tech': {
    id: 'ears_tech',
    category: 'ears',
    name: 'Robo Receivers',
    stats: stats(0, 0, 3),
    rarity: 'C',
    images: { main: '/parts/ears_tech.png' }
  },
  // --- Ear Colors (Matching Body) ---
  'ears_mimosa': { id: 'ears_mimosa', category: 'ears', name: 'Mimosa Yellow', stats: stats(1, 3, 1), rarity: 'E', images: { main: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/Character%20Generator-Kaniner-07-ears.png' } },
  'ears_amber': { id: 'ears_amber', category: 'ears', name: 'Amber', stats: stats(1, 1, 3), rarity: 'L', images: { main: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Character%20Generator-Plott400x400-ears.png' } },
  'ears_pastel': { id: 'ears_pastel', category: 'ears', name: 'Pastel Yellow', stats: stats(0, 3, 2), rarity: 'C', images: { main: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Character%20Generator-Issi400x400-ears.png' } },
  'ears_camel': { id: 'ears_camel', category: 'ears', name: 'Camel', stats: stats(2, 0, 3), rarity: 'R', images: { main: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Character%20Generator-Duddu400x400-ears.png' } },
  'ears_white': { id: 'ears_white', category: 'ears', name: 'White', stats: stats(1, 1, 1), rarity: 'R', images: { main: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Character%20Generator-Polly400x400-ears.png' } },
  'ears_rose': { id: 'ears_rose', category: 'ears', name: 'Rose Red', stats: stats(3, 1, 1), rarity: 'C', images: { main: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Character%20Generator-Ri400x400-ears.png' } },

  // === BODY (Layer 3) ===
  'body_none': {
    id: 'body_none',
    category: 'body',
    name: 'None',
    stats: stats(1, 3, 2),
    rarity: 'L',
    images: {}
  },
  'body_classic': {
    id: 'body_classic',
    category: 'body',
    name: 'Classic Cream',
    stats: stats(1, 1, 1),
    rarity: 'C',
    images: { main: '/parts/body_classic.png' }
  },
  'body_tech': {
    id: 'body_tech',
    category: 'body',
    name: 'Cyber Grey',
    stats: stats(0, 0, 2),
    rarity: 'C',
    images: { main: '/parts/body_tech.png' }
  },
  'body_gold': {
    id: 'body_gold',
    category: 'body',
    name: 'Golden Star',
    stats: stats(1, 1, 0),
    rarity: 'C',
    images: { main: '/parts/body_gold.png' }
  },
  // --- Colors ---
  'body_mimosa': { id: 'body_mimosa', category: 'body', name: 'Mimosa Yellow', stats: stats(1, 3, 1), rarity: 'E', images: { main: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/Character%20Generator-Kaniner-05-body.png' } },
  'body_amber': { id: 'body_amber', category: 'body', name: 'Amber', stats: stats(1, 1, 3), rarity: 'L', images: { main: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Character%20Generator-Plott400x400-body.png' } },
  'body_pastel': { id: 'body_pastel', category: 'body', name: 'Pastel Yellow', stats: stats(0, 3, 2), rarity: 'C', images: { main: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Character%20Generator-Issi400x400-body.png' } },
  'body_camel': { id: 'body_camel', category: 'body', name: 'Camel', stats: stats(2, 0, 3), rarity: 'R', images: { main: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Character%20Generator-Duddu400x400-body.png' } },
  'body_white': { id: 'body_white', category: 'body', name: 'White', stats: stats(1, 1, 1), rarity: 'R', images: { main: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Character%20Generator-Polly400x400-body.png' } },
  'body_rose': { id: 'body_rose', category: 'body', name: 'Rose Red', stats: stats(3, 1, 1), rarity: 'C', images: { main: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Character%20Generator-Ri400x400-body.png' } },

  // === FACE (Layer 4) ===
  'eyes_dot': {
    id: 'eyes_dot',
    category: 'face',
    name: 'Dots',
    stats: stats(0, 0, 0),
    rarity: 'U',
    images: { main: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Character%20Generator-Duddu400x400-face.png' }
  },
  'eyes_glasses': {
    id: 'eyes_glasses',
    category: 'face',
    name: 'Smart Specs',
    stats: stats(0, 0, 1),
    rarity: 'L',
    images: { main: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Character%20Generator-Plott400x400-face.png' }
  },
  'eyes_angry': {
    id: 'eyes_angry',
    category: 'face',
    name: 'Determination',
    stats: stats(1, 0, 0),
    rarity: 'R',
    images: { main: '/parts/eyes_angry.png' }
  },
  'mouth_smile': {
    id: 'mouth_smile',
    category: 'face',
    name: 'Smile',
    stats: stats(0, 0, 0),
    rarity: 'U',
    images: { main: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Character%20Generator-Polly400x400-face.png' }
  },
  'mouth_open': {
    id: 'mouth_open',
    category: 'face',
    name: 'Laugh',
    stats: stats(0, 1, 0),
    rarity: 'E',
    images: { main: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/Character%20Generator-Kaniner-04-facial%20features.png' }
  },
  'mouth_line': {
    id: 'mouth_line',
    category: 'face',
    name: 'Serious',
    stats: stats(0, 0, 0),
    rarity: 'C',
    images: { main: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Character%20Generator-Ri400x400-eyes.png' }
  },
  'face_makeup': {
    id: 'face_makeup',
    category: 'face',
    name: 'Confident Makeup',
    stats: stats(1, 1, 1),
    rarity: 'E',
    images: { main: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Character%20Generator-Issi400x400-face.png' }
  },

  // === HAIR (Layer 1 Back, Layer 5 Front) ===
  'hair_none': {
    id: 'hair_none',
    category: 'hair',
    name: 'None',
    stats: stats(0, 0, 0),
    rarity: 'C',
    images: {}
  },
  'hair_yellow': {
    id: 'hair_yellow',
    category: 'hair',
    name: 'Yellow Hair',
    rarity: 'E',
    stats: stats(2, 2, 4),
    images: {
      front: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/Character%20Generator-Kaniner-03-hair1.png'
    }
  },
  'hair_black': {
    id: 'hair_black',
    category: 'hair',
    name: 'Black Hair',
    stats: stats(0, 0, 1),
    rarity: 'L',
    images: {
      front: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Character%20Generator-Plott400x400-hair.png'
    }
  },
  'hair_fashion': {
    id: 'hair_fashion',
    category: 'hair',
    name: 'Fashion Hair',
    stats: stats(1, 1, 2),
    rarity: 'E',
    images: {
      front: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Character%20Generator-Issi400x400-hair.png'
    }
  },
  // === HAIR BACK (后发/长发) ===
  // 👇 增加一个空的后发选项
  'hair_b_none': {
    id: 'hair_b_none',
    category: 'hair_b', // 👈 注意这里是 hair_b
    name: 'No Back Hair',
    stats: stats(0, 0, 0),
    rarity: 'C',
    images: {}
  },
  'hair_braids_yellow': {
    id: 'hair_braids_yellow',
    category: 'hair_b',
    name: 'Yellow Braids',
    stats: stats(1, 4, 2),
    rarity: 'E',
    images: {
      back: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/Character%20Generator-Kaniner-06-hair2.png'
    }
  },
  'hair_longhair_fashion': {
    id: 'hair_longhair_fashion',
    category: 'hair_b',
    name: 'Fashion Long Hair',
    stats: stats(2, 3, 4),
    rarity: 'E',
    images: {
      back: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Character%20Generator-Issi400x400-gearback-fashion%20long%20hair.png'
    }
  },

  // === ACCESSORIES (Layer 0 Back, Layer 6 Front) ===
  'access_none': {
    id: 'access_none',
    category: 'access',
    name: 'None',
    stats: stats(0, 0, 0),
    rarity: 'C',
    images: {}
  },
  'access_beret': {
    id: 'access_beret',
    category: 'access',
    name: 'Artist Beret',
    stats: stats(1, 4, 4),
    rarity: 'R',
    offsetY: 0,
    images: {
      front: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Character%20Generator-Polly400x400-gear.png',
    }
  },
  'access_helmet': {
    id: 'access_helmet',
    category: 'access',
    name: 'Hero Helmet',
    stats: stats(4, 2, 3),
    rarity: 'U',
    offsetY: 0,
    images: {
      front: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Character%20Generator-Duddu400x400-gear.png',
      back: '/parts/head_helmet_back.png'
    }
  },
  'access_Tophat': {
    id: 'access_Tophat',
    category: 'access',
    name: 'Tophat',
    stats: stats(3, 1, 2),
    rarity: 'E',
    offsetY: 0,
    images: {
      front: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Character%20Generator-Issi400x400-gearfont.png',
      back: '/parts/head_tophat_back.png'
    }
  },
  'access_crown': {
    id: 'access_crown',
    category: 'access',
    name: 'Paper Crown',
    stats: stats(2, 3, 1),
    rarity: 'L',
    offsetY: -10,
    images: {
      front: '/parts/head_crown_front.png'
    }
  },
  'access_robot': {
    id: 'access_robot',
    category: 'access',
    name: 'Robot Accessory',
    stats: stats(3, 2, 2),
    rarity: 'L',
    offsetY: 0,
    images: {
      front: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Character%20Generator-Ri400x400-gear.png'
    }
  }
};

// === PLANET PARTS ===
export const PLANET_PARTS_DB: Record<string, PartDefinition> = {
  // BASE
  'planet_base_none': { id: 'planet_base_none', category: 'base', name: 'None', stats: stats(0, 0, 0), rarity: 'C', images: {} },
  'planet_base_red': { id: 'planet_base_red', category: 'base', name: 'Magma Red', stats: stats(0, 0, 0), rarity: 'C', images: { main: '/parts/planet_base_red.png' } },
  'planet_base_blue': { id: 'planet_base_blue', category: 'base', name: 'Ice Blue', stats: stats(0, 0, 0), rarity: 'C', images: { main: '/parts/planet_base_blue.png' } },
  'planet_base_green': { id: 'planet_base_green', category: 'base', name: 'Forest', stats: stats(0, 0, 0), rarity: 'C', images: { main: '/parts/planet_base_green.png' } },
  'planet_base_yellow': { id: 'planet_base_yellow', category: 'base', name: 'Lemon', stats: stats(0, 0, 0), rarity: 'L', images: { main: '/parts/planet_base_yellow.png' } },

  // SURFACE
  'planet_surf_none': { id: 'planet_surf_none', category: 'surface', name: 'None', stats: stats(0, 0, 0), rarity: 'C', images: {} },
  'planet_surf_craters': { id: 'planet_surf_craters', category: 'surface', name: 'Craters', stats: stats(0, 0, 0), rarity: 'C', images: { main: '/parts/planet_surf_craters.png' } },
  'planet_surf_swirls': { id: 'planet_surf_swirls', category: 'surface', name: 'Swirls', stats: stats(0, 0, 0), rarity: 'C', images: { main: '/parts/planet_surf_swirls.png' } },

  // ATMOSPHERE
  'planet_atmo_none': { id: 'planet_atmo_none', category: 'atmosphere', name: 'None', stats: stats(0, 0, 0), rarity: 'C', images: {} },
  'planet_atmo_rings': { id: 'planet_atmo_rings', category: 'atmosphere', name: 'Saturn Rings', stats: stats(0, 0, 0), rarity: 'L', images: { main: '/parts/planet_atmo_rings.png' } },
  'planet_atmo_glow': { id: 'planet_atmo_glow', category: 'atmosphere', name: 'Cosmic Glow', stats: stats(0, 0, 0), rarity: 'C', images: { main: '/parts/planet_atmo_glow.png' } },

  // COMPANION
  'planet_comp_none': { id: 'planet_comp_none', category: 'companion', name: 'None', stats: stats(0, 0, 0), rarity: 'C', images: {} },
  'planet_comp_moon': { id: 'planet_comp_moon', category: 'companion', name: 'Moon', stats: stats(0, 0, 0), rarity: 'C', images: { main: '/parts/planet_comp_moon.png' } },
  'planet_comp_ufo': { id: 'planet_comp_ufo', category: 'companion', name: 'UFO', stats: stats(0, 0, 0), rarity: 'C', images: { main: '/parts/planet_comp_ufo.png' } },
};

export const getPartList = (category: PartCategory | PlanetCategory) => {
  // 核心魔法：当 UI 处于 'hair' 标签时，同时返回前发和后发的数据！
  if (category === 'hair') {
    return Object.values(PARTS_DB).filter(p => p.category === 'hair' || p.category === 'hair_b');
  }
  if (['body', 'ears', 'face', 'hair_b', 'access'].includes(category)) {
    return Object.values(PARTS_DB).filter(p => p.category === category);
  }
  return Object.values(PLANET_PARTS_DB).filter(p => p.category === category);
};