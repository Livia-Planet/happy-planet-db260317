import { PartDefinition, PartCategory, PlanetCategory } from '../types';

// Helper to create simple stat objects
const stats = (m: number, b: number, k: number) => ({ mod: m, bus: b, klurighet: k });

// NOTE: Ensure you have a folder named 'parts' in your public directory with these PNG files.
export const PARTS_DB: Record<string, PartDefinition> = {
  // === EARS (Layer 2) ===
  'ears_default': {
    id: 'ears_default',
    category: 'ears',
    name: 'Round Ears',
    stats: stats(1, 1, 1),
    images: { main: '/parts/ears_default.png' }
  },
  'ears_elf': {
    id: 'ears_elf',
    category: 'ears',
    name: 'Elf Ears',
    stats: stats(0, 1, 2),
    images: { main: '/parts/ears_elf.png' }
  },
  'ears_tech': {
    id: 'ears_tech',
    category: 'ears',
    name: 'Robo Receivers',
    stats: stats(0, 0, 3),
    images: { main: '/parts/ears_tech.png' }
  },
  // --- Ear Colors (Matching Body) ---
  'ears_mimosa': { id: 'ears_mimosa', category: 'ears', name: 'Mimosa Yellow', stats: stats(1, 3, 1), images: { main: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/Character%20Generator-Kaniner-07-ears.png' } },
  'ears_amber': { id: 'ears_amber', category: 'ears', name: 'Amber', stats: stats(1, 1, 3), images: { main: '/https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Character%20Generator-Plott400x400-ears.png' } },
  'ears_pastel': { id: 'ears_pastel', category: 'ears', name: 'Pastel Yellow', stats: stats(0, 3, 2), images: { main: '/parts/ears_pastel.png' } },
  'ears_camel': { id: 'ears_camel', category: 'ears', name: 'Camel', stats: stats(2, 0, 3), images: { main: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Character%20Generator-Duddu400x400-ears.png' } },
  'ears_white': { id: 'ears_white', category: 'ears', name: 'White', stats: stats(1, 1, 1), images: { main: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Character%20Generator-Polly400x400-ears.png' } },
  'ears_rose': { id: 'ears_rose', category: 'ears', name: 'Rose Red', stats: stats(3, 1, 1), images: { main: '/parts/ears_rose.png' } },

  // === BODY (Layer 3) ===
  'body_classic': {
    id: 'body_classic',
    category: 'body',
    name: 'Classic Cream',
    stats: stats(1, 1, 1),
    images: { main: '/parts/body_classic.png' }
  },
  'body_tech': {
    id: 'body_tech',
    category: 'body',
    name: 'Cyber Grey',
    stats: stats(0, 0, 2),
    images: { main: '/parts/body_tech.png' }
  },
  'body_gold': {
    id: 'body_gold',
    category: 'body',
    name: 'Golden Star',
    stats: stats(1, 1, 0),
    images: { main: '/parts/body_gold.png' }
  },
  // --- Colors ---
  'body_mimosa': { id: 'body_mimosa', category: 'body', name: 'Mimosa Yellow', stats: stats(1, 3, 1), images: { main: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/Character%20Generator-Kaniner-05-body.png' } },
  'body_amber': { id: 'body_amber', category: 'body', name: 'Amber', stats: stats(1, 1, 3), images: { main: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Character%20Generator-Plott400x400-body.png' } },
  'body_pastel': { id: 'body_pastel', category: 'body', name: 'Pastel Yellow', stats: stats(0, 3, 2), images: { main: '/parts/body_pastel.png' } },
  'body_camel': { id: 'body_camel', category: 'body', name: 'Camel', stats: stats(2, 0, 3), images: { main: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Character%20Generator-Duddu400x400-body.png' } },
  'body_white': { id: 'body_white', category: 'body', name: 'White', stats: stats(1, 1, 1), images: { main: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Character%20Generator-Polly400x400-body.png' } },
  'body_rose': { id: 'body_rose', category: 'body', name: 'Rose Red', stats: stats(3, 1, 1), images: { main: '/parts/body_rose.png' } },

  // === FACE (Layer 4) ===
  'eyes_dot': {
    id: 'eyes_dot',
    category: 'face',
    name: 'Dots',
    stats: stats(0, 0, 0),
    images: { main: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Character%20Generator-Duddu400x400-face.png' }
  },
  'eyes_glasses': {
    id: 'eyes_glasses',
    category: 'face',
    name: 'Smart Specs',
    stats: stats(0, 0, 1),
    images: { main: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Character%20Generator-Plott400x400-face.png' }
  },
  'eyes_angry': {
    id: 'eyes_angry',
    category: 'face',
    name: 'Determination',
    stats: stats(1, 0, 0),
    images: { main: '/parts/eyes_angry.png' }
  },
  'mouth_smile': {
    id: 'mouth_smile',
    category: 'face',
    name: 'Smile',
    stats: stats(0, 0, 0),
    images: { main: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Character%20Generator-Polly400x400-face.png' }
  },
  'mouth_open': {
    id: 'mouth_open',
    category: 'face',
    name: 'Laugh',
    stats: stats(0, 1, 0),
    images: { main: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/Character%20Generator-Kaniner-04-facial%20features.png' }
  },
  'mouth_line': {
    id: 'mouth_line',
    category: 'face',
    name: 'Serious',
    stats: stats(0, 0, 0),
    images: { main: '/parts/mouth_line.png' }
  },

  // === HAIR (Layer 1 Back, Layer 5 Front) ===
  'hair_none': {
    id: 'hair_none',
    category: 'hair',
    name: 'None',
    stats: stats(0, 0, 0),
    images: {}
  },
  'hair_yellow': {
    id: 'hair_yellow',
    category: 'hair',
    name: 'Yellow Hair',
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
    images: {
      front: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/Character%20Generator-Kaniner-03-hair1.png'
    }
  },

  // === ACCESSORIES (Layer 0 Back, Layer 6 Front) ===
  'access_none': {
    id: 'access_none',
    category: 'access',
    name: 'None',
    stats: stats(0, 0, 0),
    images: {}
  },
  'access_braids_yellow': {
    id: 'access_braids_yellow',
    category: 'access', // Changed from 'hair' to 'access'
    name: 'Yellow Braids',
    stats: stats(1, 4, 2),
    images: {
      back: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/Character%20Generator-Kaniner-06-hair2.png'
    }
  },
  'access_beret': {
    id: 'access_beret',
    category: 'access',
    name: 'Artist Beret',
    stats: stats(1, 4, 4),
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
    offsetY: 0,
    images: {
      front: 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/star-passport/Character%20Generator-Duddu400x400-gear.png',
      back: '/parts/head_helmet_back.png'
    }
  },
  'access_crown': {
    id: 'access_crown',
    category: 'access',
    name: 'Paper Crown',
    stats: stats(2, 3, 1),
    offsetY: -10,
    images: {
      front: '/parts/head_crown_front.png'
    }
  }
};

// === PLANET PARTS ===
export const PLANET_PARTS_DB: Record<string, PartDefinition> = {
  // BASE
  'planet_base_none': { id: 'planet_base_none', category: 'base', name: 'None', stats: stats(0, 0, 0), images: {} },
  'planet_base_red': { id: 'planet_base_red', category: 'base', name: 'Magma Red', stats: stats(0, 0, 0), images: { main: '/parts/planet_base_red.png' } },
  'planet_base_blue': { id: 'planet_base_blue', category: 'base', name: 'Ice Blue', stats: stats(0, 0, 0), images: { main: '/parts/planet_base_blue.png' } },
  'planet_base_green': { id: 'planet_base_green', category: 'base', name: 'Forest', stats: stats(0, 0, 0), images: { main: '/parts/planet_base_green.png' } },
  'planet_base_yellow': { id: 'planet_base_yellow', category: 'base', name: 'Lemon', stats: stats(0, 0, 0), images: { main: '/parts/planet_base_yellow.png' } },

  // SURFACE
  'planet_surf_none': { id: 'planet_surf_none', category: 'surface', name: 'None', stats: stats(0, 0, 0), images: {} },
  'planet_surf_craters': { id: 'planet_surf_craters', category: 'surface', name: 'Craters', stats: stats(0, 0, 0), images: { main: '/parts/planet_surf_craters.png' } },
  'planet_surf_swirls': { id: 'planet_surf_swirls', category: 'surface', name: 'Swirls', stats: stats(0, 0, 0), images: { main: '/parts/planet_surf_swirls.png' } },

  // ATMOSPHERE
  'planet_atmo_none': { id: 'planet_atmo_none', category: 'atmosphere', name: 'None', stats: stats(0, 0, 0), images: {} },
  'planet_atmo_rings': { id: 'planet_atmo_rings', category: 'atmosphere', name: 'Saturn Rings', stats: stats(0, 0, 0), images: { main: '/parts/planet_atmo_rings.png' } },
  'planet_atmo_glow': { id: 'planet_atmo_glow', category: 'atmosphere', name: 'Cosmic Glow', stats: stats(0, 0, 0), images: { main: '/parts/planet_atmo_glow.png' } },

  // COMPANION
  'planet_comp_none': { id: 'planet_comp_none', category: 'companion', name: 'None', stats: stats(0, 0, 0), images: {} },
  'planet_comp_moon': { id: 'planet_comp_moon', category: 'companion', name: 'Moon', stats: stats(0, 0, 0), images: { main: '/parts/planet_comp_moon.png' } },
  'planet_comp_ufo': { id: 'planet_comp_ufo', category: 'companion', name: 'UFO', stats: stats(0, 0, 0), images: { main: '/parts/planet_comp_ufo.png' } },
};

export const getPartList = (category: PartCategory | PlanetCategory) => {
  if (['body', 'ears', 'face', 'hair', 'access'].includes(category)) {
    return Object.values(PARTS_DB).filter(p => p.category === category);
  }
  return Object.values(PLANET_PARTS_DB).filter(p => p.category === category);
};