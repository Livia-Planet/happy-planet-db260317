
export type PartCategory = 'body' | 'ears' | 'face' | 'hair' | 'hair_b' | 'access';
export type PlanetCategory = 'base' | 'surface' | 'atmosphere' | 'companion';
export type Language = 'se' | 'en' | 'cn';
// --- 成就系统类型 ---
export type MedalSize = 'sm' | 'md' | 'lg' | 'xl'; // 对应 铜、银、金、白金

export interface AchievementDef {
  id: string;
  icon: string; // Emoji 或简短文字
  imageUrl?: string;
  title: Record<Language, string>;
  desc: Record<Language, string>;
  size: MedalSize;
  color: string; // 奖牌的主题色 (Tailwind class, e.g., 'bg-yellow-400')
}

// 记录在 LocalStorage 里的贴纸数据
export interface UnlockedMedal {
  id: string;
  x: number;
  y: number;
  unlockedAt: number;
}

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

// 1. 定义稀有度类型
export type Rarity = 'C' | 'U' | 'R' | 'E' | 'L'; // Common, Uncommon,Rare, Epic, Legendary

export interface PartDefinition {
  id: string;
  name: string;
  category: PartCategory | PlanetCategory;
  stats: CharacterStats;
  rarity?: Rarity; // 2. 强制要求每个部件都有稀有度的话，就删掉问好。
  offsetY?: number;
  images: PartImages;
  isUnlockable?: boolean; // 👈 新增：标记是否为探险专属隐藏配件
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
  // 标记是否已经领取过本篇日记的写作奖励（防止重复刷币）
  hasReceivedStoryReward?: boolean;
  rarity?: Rarity; // 2. 强制要求每个部件都有稀有度的话，就删掉问好。
  isFavorite?: boolean;
  isAssignedToFarm?: boolean; // <--- 新增这行：用于标记是否被收藏/锁定
  hunger?: number;   // 👈 新增：每只兔子专属的饥饿值
  intimacy?: number; // 👈 新增：每只兔子专属的亲密度
  lastSyncTime?: number;        // 上次同步状态的时间戳 (用于计算离线流逝)
  isOnExpedition?: boolean;     // 是否正在外星探险
  expeditionStartTime?: number; // 探险出发的时间戳
  expeditionDuration?: number;  // 探险总时长 (毫秒)
  expeditionReward?: number;    // 探险完成后可领取的胡萝卜币
}

export interface StoryEntry {
  /** 唯一键，建议格式 `${galaxyIndex}-${starIndex}`，用于定位与去重 */
  id: string;
  date: string;
  title: Record<Language, string>;
  content: Record<Language, string>;
  /** 所属星系 (0-8) */
  galaxyIndex: number;
  /** 该星系内的星位索引 */
  starIndex: number;
  /** 单篇独立锁：是否上锁 */
  isLocked?: boolean;
  /** 单篇密码（用户设置后存储，用于验证） */
  password?: string;
  imageUrl?: string; // 👈 新增：用来存放奇遇事件的插画！
  hasReceivedReward?: boolean;   // 👈 新增这行：给防重复领奖功能上个“合法户口”！
}

// --- 视图路由系统 ---
// loading: 加载页 | start: 门户首页 | editor: 换装实验室 
// focus: 丰饶农场(专注) | social: 星际雷达(社交) | passport: 航行日志
export type ViewMode = 'loading' | 'start' | 'editor' | 'focus' | 'social' | 'passport';

// --- 养成系统扩展 ---
export interface PetStatus {
  hunger: number;       // 饱食度 0-100
  mood: number;         // 心情值 0-100
  lastCheckIn: number;  // 上次同步时间戳
}