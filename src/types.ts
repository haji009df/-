export type CharacterId = 
  | 'mamad' 
  | 'asghar_banafsheh' 
  | 'amin_shift' 
  | 'dj' 
  | 'mamad_cj' 
  | 'ferdinand' 
  | 'farbod' 
  | 'haj_ali';

export interface CharacterData {
  id: CharacterId;
  nameFa: string;
  nameEn: string;
  avatarColor: string;
  role: string;
  description: string;
  unlockedByDefault: boolean;
  price: number;
  minLevelToUnlock?: number;
  quoteFa?: string;
  perks: {
    speedMultiplier: number;
    coinMultiplier: number;
    handlingMultiplier: number;
    extraLives: number;
    hasDrift: boolean;
    hasRgbLights: boolean;
  };
}

export type DecalStyle = 'none' | 'stripes' | 'gt_side' | 'carbon_hood' | 'police' | 'taxi_checkers' | 'flames';
export type UnderglowColor = 'none' | 'cyan' | 'pink' | 'lime' | 'amber' | 'purple' | 'rgb';
export type SpoilerStyle = 'none' | 'lip' | 'gt_wing' | 'ducktail';
export type RimStyle = 'stock' | 'bbs_gold' | 'blade_chrome' | 'sport_red' | 'deep_dish';

export interface CarCustomization {
  bodyColor: string;
  secondaryColor: string;
  decalStyle: DecalStyle;
  tintLevel: number; // 0, 0.3, 0.6, 0.9
  underglow: UnderglowColor;
  spoiler: SpoilerStyle;
  rimStyle: RimStyle;
}

export interface CarData {
  id: number;
  nameFa: string;
  nameEn: string;
  price: number;
  bodyColor: string;
  secondaryColor: string;
  topSpeed: number; // km/h base
  acceleration: number;
  handling: number;
  armor: number;
  type: 'sedan' | 'hatchback' | 'pickup' | 'police' | 'taxi' | 'sports' | 'suv' | 'muscle' | 'classic' | 'hyper' | 'f1' | 'bike' | 'bicycle' | 'jet';
  unlockedByDefault: boolean;
}

export type BiomeId = 
  | 'forest'
  | 'desert'
  | 'rain'
  | 'snow'
  | 'noir'
  | 'lava'
  | 'mountain'
  | 'ocean'
  | 'cyberpunk'
  | 'paradise';

export interface BiomeConfig {
  id: BiomeId;
  nameFa: string;
  nameEn: string;
  stageRange: [number, number];
  roadColor: string;
  laneColor: string;
  shoulderColor: string;
  curbColor1: string;
  curbColor2: string;
  grassColor: string;
  nightMode: boolean;
  weatherEffect?: 'none' | 'rain' | 'snow' | 'embers' | 'cyberGrid' | 'petals';
  ambientLight: number; // 0 to 1
  npcTypes: NpcCarType[];
}

export interface GameSaveData {
  coins: number;
  highestStage: number;
  selectedCarId: number;
  selectedCharacterId: CharacterId;
  unlockedCars: number[];
  unlockedCharacters: CharacterId[];
  soundEnabled: boolean;
  musicEnabled: boolean;
  highScore: number;
  overtakenCount: number;
  carCustomizations?: Record<number, CarCustomization>;
  unlockedCustomizations?: string[];
  aparatRewardClaimed?: boolean;
}

export interface PooledParticle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'smoke' | 'spark' | 'flame' | 'drift' | 'rain' | 'snow' | 'ember' | 'petal' | 'coinGlow' | 'bulletImpact' | 'skid';
}

export interface PooledBullet {
  active: boolean;
  x: number;
  y: number;
  vy: number;
  width: number;
  height: number;
  damage: number;
}

export type NpcAiBehavior = 'normal' | 'aggressive' | 'swerving' | 'braker' | 'speeder' | 'blocker';

export type NpcCarType = 
  | 'sedan' 
  | 'truck' 
  | 'tractor' 
  | 'ambulance' 
  | 'firetruck' 
  | 'sports' 
  | 'bus' 
  | 'semi' 
  | 'snowplow' 
  | 'cyber' 
  | 'limo' 
  | 'paykan' 
  | 'pride' 
  | 'nissan_blue' 
  | 'tanker'
  | 'police'
  | 'pickup';

export interface PooledTrafficCar {
  active: boolean;
  x: number;
  y: number;
  lane: number;
  targetLane: number;
  laneChangeProgress: number;
  speed: number; // world speed km/h
  width: number;
  height: number;
  color: string;
  secondaryColor: string;
  type: NpcCarType;
  health: number;
  maxHealth: number;
  isHonked: boolean;
  sirenTime: number;
  overtaken: boolean;
  // Advanced AI & Aggressive Weaving
  aiBehavior: NpcAiBehavior;
  swervedTowardsPlayer: boolean;
  turnSignal: 'none' | 'left' | 'right';
  turnSignalTimer: number;
  isBraking: boolean;
  brakeTimer: number;
  reactionDistance: number;
  aggression: number; // 0 to 1
  specialDetail?: string; // e.g. 'watermelon', 'gold_trim', 'cyber_glow'
}

export type RoadItemType = 
  | 'coin' 
  | 'heart' 
  | 'nitro' 
  | 'ammo' 
  | 'barrier' 
  | 'barrel' 
  | 'oilSlick' 
  | 'rock' 
  | 'cone' 
  | 'tree' 
  | 'cactus' 
  | 'palm' 
  | 'neonSign' 
  | 'flower' 
  | 'signpost'
  | 'star'
  | 'sponsorSign';

export interface PooledRoadItem {
  active: boolean;
  x: number;
  y: number;
  width?: number;
  height?: number;
  type: RoadItemType;
  value: number;
  rotation: number;
  collected: boolean;
  scale: number;
  isObstacle?: boolean;
}

export interface StageMilestoneInfo {
  nitroUnlocked: boolean;
  gunUnlocked: boolean;
  maxLives: number;
  nitroMaxCharges: number;
  gunMaxAmmo: number;
}

export interface StoryChapter {
  id: number;
  stageTrigger: number;
  titleFa: string;
  subtitleFa: string;
  speakerFa: string;
  avatarColor: string;
  messageFa: string;
  objectiveFa: string;
}

