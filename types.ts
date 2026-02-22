
export type PartCategory = 'body' | 'ears' | 'face' | 'hair' | 'access';
export type PlanetCategory = 'base' | 'surface' | 'atmosphere' | 'companion';
export type Language = 'se' | 'en' | 'cn';

export interface CharacterStats {
  mod: number;       // Courage (Red)
  bus: number;       // Mischief (Yellow)
  klurighet: number; // Wisdom/Cleverness (Blue)
}

export interface PartImages {
  main?: string;       // For single layer parts (Body, Ears, Face)
  front?: string;      // For Hair/Access (Layer 5/6)
  back?: string;       // For Hair/Access (Layer 0/1)
}

export interface PartDefinition {
  id: string;
  name: string;
  category: PartCategory | PlanetCategory;
  stats: CharacterStats;
  offsetY?: number;      // Vertical offset for fine-tuning gear rendering
  images: PartImages;    // Path to local PNG files
}

export interface CharacterData {
  name: string;
  selectedParts: Record<PartCategory, string>;
  selectedPlanetParts: Record<PlanetCategory, string>;
  lastModified: number; // Timestamp for ID generation
}

// NEW: Extended interface for saved passports
export interface PassportData extends CharacterData {
  id: string;      // Unique ID string
  bio: string;     // Editable biography/story
  age?: string;    // Age of the character
  gender?: string; // New: Gender field (stores key)
  species?: string; // New: Species field (stores key)
  occupations?: string[]; // New: Selected occupation keys
  location?: string; // Discovery location
  savedAt: number; // Timestamp when passport was issued
  relationships: { targetId: string, relationType: string }[]; // New: Relationship system
  stats?: CharacterStats; // Optional: Override calculated stats
  traits?: string[]; // Personality tags
}

export interface StoryEntry {
  id: number;
  date: string;
  title: Record<Language, string>;
  content: Record<Language, string>;
}
