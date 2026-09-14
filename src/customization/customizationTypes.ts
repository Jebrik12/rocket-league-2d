export type ItemRarity = "common" | "rare" | "very_rare" | "import" | "exotic" | "black_market";

export type ItemSlot = "body" | "decal" | "wheels" | "boost" | "goal_explosion" | "topper" | "title";

export interface CustomizationItem {
  id: string;
  name: string;
  slot: ItemSlot;
  rarity: ItemRarity;
  description: string;
  badge?: string;
  accentColor?: string;
  visualData: {
    // For body: model id
    modelId?: string;
    // For decal: pattern style, accent colors
    decalPattern?: "stripe" | "flame" | "galaxy" | "carbon" | "dragon" | "cyber" | "gold";
    decalPrimary?: string;
    decalSecondary?: string;
    // For wheels: rim style, color, glow
    wheelStyle?: "oem" | "cristiano" | "apex" | "draco" | "astro" | "hologram";
    rimColor?: string;
    glowHex?: string;
    // For boost: particle color, flame type
    boostColor?: string;
    boostStyle?: "standard" | "flamethrower" | "plasma" | "rainbow" | "electro" | "sakura";
    // For goal explosion: effect style
    explosionStyle?: "standard" | "hellfire" | "supernova" | "electro" | "singularity" | "pixel";
    explosionColor?: string;
    // For topper: style, icon/label
    topperStyle?: "halo" | "crown" | "shades" | "wizard" | "horns";
    topperColor?: string;
    // For title: display string
    titleText?: string;
  };
}

export interface CrateDefinition {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  costCredits: number;
  iconName: string;
  accentColor: string;
  bgGradient: string;
  itemIds: string[];
}

export interface PlayerLoadout {
  body: string;           // item id
  decal: string;          // item id
  wheels: string;         // item id
  boost: string;          // item id
  goal_explosion: string; // item id
  topper: string;         // item id or "none"
  title: string;          // item id or "none"
}

export interface CarMastery {
  carId: string;
  level: number;       // 1 to 50
  xp: number;          // current XP
  prestige: number;    // prestige tier 0+
  goals: number;
  saves: number;
  shots: number;
  wins: number;
  mvps: number;
}

export interface PlayerInventory {
  ownedItemIds: string[];
  loadout: PlayerLoadout;
  credits: number;
  keys: number;
  unopenedCrates: Record<string, number>; // crateId -> count
  carMastery: Record<string, CarMastery>; // carModelId -> CarMastery
}
