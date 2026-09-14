import React, * as st from "react";
import * as d from "react/jsx-runtime";
import {
  Camera,
  ArrowDown as dg,
  ArrowLeft as mg,
  ArrowRight as vg,
  ArrowUp as pg,
  Check as Wh,
  CircleArrowUp as bg,
  CircleHelp as Ng,
  Eye as Eg,
  Flame as $s,
  Keyboard as zg,
  MessageSquare as jg,
  MoveUp as Rg,
  Pause as wg,
  Play as Hg,
  RefreshCw as Bg,
  RotateCcw as im,
  Send as Xg,
  Settings as cm,
  ShieldAlert as Qg,
  Shield as fm,
  Sparkles as sm,
  Target as om,
  Trophy as Is,
  Trophy,
  Users as Wg,
  Volume2 as Ig,
  VolumeX as t2,
  X as rm,
  Zap as Ru,
  Zap,
  Video,
  SkipForward,
  Clock,
  Rewind,
  FastForward,
  Maximize,
  Minimize,
  Box,
  Car,
  Layers,
  Crosshair,
  Download,
  Scissors,
  Film,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Globe,
  Wifi,
  LogOut,
  Share2,
  Menu,
  Smartphone,
  RotateCw,
  Coins
} from "lucide-react";
import { exportClipAsVideo, exportClipAsGif, downloadBlob } from "./utils/clipExporter";
import {
  saveMatchToHistory,
  getMatchHistoryList,
  getMatchReplay,
  deleteMatchFromHistory,
  clearAllMatchHistory,
  MatchHistoryMetadata
} from "./utils/matchHistoryStorage";
import { MultiplayerModal } from "./components/MultiplayerModal";
import { peerNetwork } from "./network/peerManager";
import { MatchSnapshot } from "./network/multiplayerTypes";
import { MobileControlsOverlay, TouchInputState } from "./components/MobileControlsOverlay";
import { MobileQuickMenu } from "./components/MobileQuickMenu";
import { GarageModal } from "./components/GarageModal";
import { CrateOpeningModal } from "./components/CrateOpeningModal";
import { MatchSetupModal, MatchSetupConfig, PilotMode } from "./components/MatchSetupModal";
import { RankedMatchmakingModal } from "./components/RankedMatchmakingModal";
import { RankProgressionOverlay } from "./components/RankProgressionOverlay";
import {
  getPlayerInventory,
  recordMatchMastery
} from "./customization/customizationStorage";
import { ItemSlot } from "./customization/customizationTypes";
import { ITEM_CATALOG } from "./customization/customizationData";
import {
  drawCarDecal,
  drawCustomWheel,
  drawCarTopper
} from "./customization/customizationRenderer";
import {
  getRankedProfile,
  getBotRankedProfile,
  processRankedMatchEnd,
  processBotRankedMatchEnd,
  calculateRankDetails,
  RANK_TIERS
} from "./ranked/rankedStorage";
import { RankedBotProfile, RankedTrack } from "./ranked/rankedTypes";
import { getBotUpgrades, getBotUpgradesModifiers } from "./bot/botUpgradeStorage";
import {
  ArenaEnv,
  executeMasterBotBrain,
  startBotJumpSeq,
  updateBotJumpSeq,
  solveBestIntercept,
  botDriveGround,
  botDriveAir
} from "./bot/botBrain";



// --- GAME ENGINE & PHYSICS CONFIGURATIONS ---
export interface GoalDefinition {
  type: "wall" | "floor" | "ceiling" | "elevated";
  x?: number;
  yMin?: number;
  yMax?: number;
  xMin?: number;
  xMax?: number;
  y?: number;
  depth: number;
  underpassY?: number;
}

export interface ArenaMapDefinition {
  id: string;
  name: string;
  shortName: string;
  sizeCategory: "Standard" | "Large" | "Huge";
  goalType: "wall" | "floor" | "ceiling" | "elevated";
  Kt: number;
  hl: number;
  k: number;
  Qt: number;
  At: number;
  Mt: number;
  F: number;
  le: GoalDefinition;
  ae: GoalDefinition;
  badge: string;
  badgeColor: string;
  accentHex: string;
  description: string;
  specialty: string;
}

export const MAP_DEFINITIONS: Record<string, ArenaMapDefinition> = {
  standard: {
    id: "standard",
    name: "DFH Stadium (Standard)",
    shortName: "Standard",
    sizeCategory: "Standard",
    goalType: "wall",
    Kt: 2000,
    hl: 1100,
    k: 950,
    Qt: 120,
    At: 120,
    Mt: 1880,
    F: 160,
    le: { type: "wall", x: 120, yMin: 380, yMax: 680, depth: 130 },
    ae: { type: "wall", x: 1880, yMin: 380, yMax: 680, depth: 130 },
    badge: "Default Pitch",
    badgeColor: "text-sky-400 border-sky-500/40 bg-sky-500/10",
    accentHex: "#38bdf8",
    description: "The classic competitive Rocket League arena. Standard 2000×1100 pitch with official 300px side wall goals.",
    specialty: "Standard 1v1 and 2v2 competitive flow and familiar backboard rotations."
  },
  colossus: {
    id: "colossus",
    name: "Colossus Stadium (Big)",
    shortName: "Colossus",
    sizeCategory: "Large",
    goalType: "wall",
    Kt: 2800,
    hl: 1300,
    k: 1150,
    Qt: 120,
    At: 140,
    Mt: 2660,
    F: 180,
    le: { type: "wall", x: 140, yMin: 485, yMax: 785, depth: 130 },
    ae: { type: "wall", x: 2660, yMin: 485, yMax: 785, depth: 130 },
    badge: "40% Bigger",
    badgeColor: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
    accentHex: "#34d399",
    description: "Expanded arena with 40% more pitch width and higher ceiling. Standard 300px net size preserved.",
    specialty: "High-speed supersonic breaks, extended air dribbles, and 2v2/3v3 passing plays."
  },
  gargantuan: {
    id: "gargantuan",
    name: "Gargantuan Mega-Dome (Huge)",
    shortName: "Gargantuan",
    sizeCategory: "Huge",
    goalType: "wall",
    Kt: 3600,
    hl: 1500,
    k: 1350,
    Qt: 120,
    At: 160,
    Mt: 3440,
    F: 200,
    le: { type: "wall", x: 160, yMin: 585, yMax: 885, depth: 130 },
    ae: { type: "wall", x: 3440, yMin: 585, yMax: 885, depth: 130 },
    badge: "80% Huge",
    badgeColor: "text-purple-400 border-purple-500/40 bg-purple-500/10",
    accentHex: "#c084fc",
    description: "Massive 3600×1500 battlefield! Preserves identical 300px net dimensions while providing epic room for 3v3.",
    specialty: "Full 3v3 team rotations, hypersonic boomer clears, and deep aerial redirects."
  },
  drop_pit: {
    id: "drop_pit",
    name: "Core Pit (Floor Goals)",
    shortName: "Floor Pit",
    sizeCategory: "Standard",
    goalType: "floor",
    Kt: 2400,
    hl: 1200,
    k: 1050,
    Qt: 120,
    At: 140,
    Mt: 2260,
    F: 160,
    le: { type: "floor", xMin: 420, xMax: 720, y: 1050, depth: 130 },
    ae: { type: "floor", xMin: 1680, xMax: 1980, y: 1050, depth: 130 },
    badge: "Net In Floor",
    badgeColor: "text-amber-400 border-amber-500/40 bg-amber-500/10",
    accentHex: "#f59e0b",
    description: "Outer walls are solid! Goals are 300px recessed pits in the turf floor. Dunk or drop the ball downward to score.",
    specialty: "Drop-shot mechanics, ceiling pinches, downward slam dunks, and pit rim defense."
  },
  sky_vault: {
    id: "sky_vault",
    name: "Sky Vault (Ceiling Goals)",
    shortName: "Sky Vault",
    sizeCategory: "Standard",
    goalType: "ceiling",
    Kt: 2400,
    hl: 1200,
    k: 1050,
    Qt: 120,
    At: 140,
    Mt: 2260,
    F: 160,
    le: { type: "ceiling", xMin: 420, xMax: 720, y: 120, depth: 130 },
    ae: { type: "ceiling", xMin: 1680, xMax: 1980, y: 120, depth: 130 },
    badge: "Net In Ceil",
    badgeColor: "text-rose-400 border-rose-500/40 bg-rose-500/10",
    accentHex: "#f43f5e",
    description: "Goals are mounted high in the roof ceiling truss! Must pop the ball into the sky, air dribble, or ceiling shot to score.",
    specialty: "High aerial control, vertical redirects, double taps into ceiling vaults."
  },
  aerial_hoops: {
    id: "aerial_hoops",
    name: "Aerial Skyway (Elevated Flying Goals)",
    shortName: "Flying Hoops",
    sizeCategory: "Standard",
    goalType: "elevated",
    Kt: 2400,
    hl: 1200,
    k: 1050,
    Qt: 120,
    At: 140,
    Mt: 2260,
    F: 160,
    le: { type: "elevated", x: 140, yMin: 220, yMax: 520, depth: 130, underpassY: 520 },
    ae: { type: "elevated", x: 2260, yMin: 220, yMax: 520, depth: 130, underpassY: 520 },
    badge: "Flying / Elevated",
    badgeColor: "text-cyan-400 border-cyan-500/40 bg-cyan-500/10",
    accentHex: "#06b6d4",
    description: "Goals are suspended high off the ground with a drivable underpass underneath where cars can race under the net!",
    specialty: "Drive-under rotations, high wall aerial passes, and hoop-style flying redirects."
  }
};

let activeMapId = "standard";
let activeMapDef: ArenaMapDefinition = MAP_DEFINITIONS.standard;
let Kt = 2e3, hl = 1100, k = 950, Qt = 120, At = 120, Mt = 1880, F = 160, $h = 380, Ih = 680, zn = 14, POST_INSET = 14;
let le: GoalDefinition = { ...MAP_DEFINITIONS.standard.le };
let ae: GoalDefinition = { ...MAP_DEFINITIONS.standard.ae };
const Cu = 30, zv = 68, ks = 28;

export function syncMapGlobals(mapId?: string) {
  const def = (mapId && MAP_DEFINITIONS[mapId]) || MAP_DEFINITIONS.standard;
  activeMapId = def.id;
  activeMapDef = def;
  Kt = def.Kt;
  hl = def.hl;
  k = def.k;
  Qt = def.Qt;
  At = def.At;
  Mt = def.Mt;
  F = def.F;
  $h = def.le.yMin !== undefined ? def.le.yMin : 380;
  Ih = def.le.yMax !== undefined ? def.le.yMax : 680;
  le = { ...def.le };
  ae = { ...def.ae };
}

export interface CarDefinition {
  id: string;
  name: string;
  shortName: string;
  hitboxClass: "Octane" | "Dominus" | "Breakout" | "Hybrid" | "Merc";
  width: number;        // Side profile length in 2D pixels (X axis)
  height: number;       // Side profile height in 2D pixels (Y axis)
  wheelbase: number;    // Distance from car center to front/rear wheels
  wheelRadius: number;  // Radius of wheels in pixels
  rearWheelX?: number;  // Specific offset for rear wheel
  frontWheelX?: number; // Specific offset for front wheel
  rlStats: {
    length: number;     // Official RL length in cm
    width: number;      // Official RL width in cm
    height: number;     // Official RL height in cm
  };
  badge: string;
  badgeColor: string;
  accentHex: string;
  description: string;
  specialty: string;
}

export const CAR_DEFINITIONS: Record<string, CarDefinition> = {
  octane: {
    id: "octane",
    name: "Octane",
    shortName: "Octane",
    hitboxClass: "Octane",
    width: 68,
    height: 28,
    wheelbase: 18,
    rearWheelX: -17,
    frontWheelX: 18,
    wheelRadius: 7.5,
    rlStats: { length: 118.01, width: 84.20, height: 36.16 },
    badge: "Gold Standard",
    badgeColor: "text-amber-400 border-amber-500/40 bg-amber-500/10",
    accentHex: "#f59e0b",
    description: "The universally loved competitive standard. Slanted buggy nose, exposed V8 engine block, and high aerofoil spoiler.",
    specialty: "Balanced 50/50s, rapid aerial turns, and smooth ground dribbling."
  },
  fennec: {
    id: "fennec",
    name: "Fennec",
    shortName: "Fennec",
    hitboxClass: "Octane",
    width: 68,
    height: 28,
    wheelbase: 18,
    rearWheelX: -18,
    frontWheelX: 18,
    wheelRadius: 7.5,
    rlStats: { length: 118.01, width: 84.20, height: 36.16 },
    badge: "Pro Favorite",
    badgeColor: "text-sky-400 border-sky-500/40 bg-sky-500/10",
    accentHex: "#38bdf8",
    description: "Boxy rally hot-hatch with 100% visual hitbox alignment. Upright front grille, twin rally lamps, and flat roofline.",
    specialty: "Maximum visual accuracy for power flicks, pinches, and corner touches."
  },
  dominus: {
    id: "dominus",
    name: "Dominus",
    shortName: "Dominus",
    hitboxClass: "Dominus",
    width: 74,
    height: 24,
    wheelbase: 21,
    rearWheelX: -20,
    frontWheelX: 21,
    wheelRadius: 7.2,
    rlStats: { length: 127.93, width: 83.28, height: 31.30 },
    badge: "Muscle & Power",
    badgeColor: "text-rose-400 border-rose-500/40 bg-rose-500/10",
    accentHex: "#f43f5e",
    description: "Classic American muscle car with a low, long paddle hood, supercharger intake scoop, recessed quad grille, and ducktail spoiler.",
    specialty: "Devastating 45° flicks, air dribble scoops, and massive reach on redirects."
  },
  breakout: {
    id: "breakout",
    name: "Breakout",
    shortName: "Breakout",
    hitboxClass: "Breakout",
    width: 76,
    height: 23.5,
    wheelbase: 22,
    rearWheelX: -22,
    frontWheelX: 22,
    wheelRadius: 7.0,
    rlStats: { length: 131.57, width: 80.52, height: 30.39 },
    badge: "Longest Reach",
    badgeColor: "text-purple-400 border-purple-500/40 bg-purple-500/10",
    accentHex: "#c084fc",
    description: "Ultra-sharp aerodynamic wedge supercar with chisel nose splitter, pop-up style headlights, engine louvers, and elevated GT wing.",
    specialty: "Longest hitbox in Rocket League. Extreme nose leverage for insane pinches and ceiling shots."
  },
  skyline: {
    id: "skyline",
    name: "Nissan Skyline GT-R",
    shortName: "Skyline",
    hitboxClass: "Hybrid",
    width: 73,
    height: 26.5,
    wheelbase: 20,
    rearWheelX: -20,
    frontWheelX: 20,
    wheelRadius: 7.4,
    rlStats: { length: 127.02, width: 82.19, height: 34.16 },
    badge: "JDM Legend",
    badgeColor: "text-blue-400 border-blue-500/40 bg-blue-500/10",
    accentHex: "#60a5fa",
    description: "Iconic R34 GT-R coupe. Muscular flared fenders, twin vinyl stripes, aggressive intercooler bumper, and iconic dual round tail lights.",
    specialty: "The Hybrid sweet spot: Octane roof height for dribbles + Dominus length for power hits."
  },
  merc: {
    id: "merc",
    name: "Merc",
    shortName: "Merc",
    hitboxClass: "Merc",
    width: 70,
    height: 32,
    wheelbase: 18,
    rearWheelX: -18,
    frontWheelX: 18,
    wheelRadius: 8.0,
    rlStats: { length: 120.72, width: 76.71, height: 41.66 },
    badge: "Brick Wall",
    badgeColor: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
    accentHex: "#34d399",
    description: "Heavy custom van with tall vertical front grille, bull bar bumper, roof rack rails, and high dual rocket thrusters.",
    specialty: "Tallest hitbox in Rocket League. Unbeatable 50/50 presence and impenetrable goal-line saves."
  }
};

function getBotCarModel(botName?: string | number): string {
  if (typeof botName === "number") {
    const list = ["fennec", "dominus", "breakout", "skyline", "merc", "octane"];
    return list[Math.abs(botName) % list.length];
  }
  if (!botName) return "octane";
  if (botName.includes("Octane")) return "octane";
  if (botName.includes("Zen") || botName.includes("Squishy") || botName.includes("skibidi")) return "fennec";
  if (botName.includes("Pinch") || botName.includes("Musty") || botName.includes("Sniper")) return "breakout";
  if (botName.includes("AirDribble") || botName.includes("FlipReset") || botName.includes("Dan")) return "dominus";
  if (botName.includes("pudge") || botName.includes("Demo") || botName.includes("Unfair") || botName.includes("☠️")) return "merc";
  if (botName.includes("Skyline") || botName.includes("Supersonic") || botName.includes("Calculated")) return "skyline";
  const carKeys = Object.keys(CAR_DEFINITIONS);
  return carKeys[Math.floor(Math.random() * carKeys.length)];
}

const SPEED_KMH_RATIO = 0.16;
function getBallSpeedKmh(vx: number, vy: number): number {
  return Math.round(Math.hypot(vx, vy) * SPEED_KMH_RATIO);
}

const LEGACY_PHYSICS = {
  pv: 1050, Ph: 850, Dh: .998, wh: .985, Uh: .995,
  xv: 650, Tv: 840, bv: 1250, Hh: 1500, ju: 1000,
  Sv: 1600, Nv: 2600, Mv: 33.3, cc: 520, Gh: 400,
  Ev: .2, Bh: 600, qh: .45, _v: 1.35, Av: 6.2,
  reverseDriveSpeed: 1400, wavedashMinSpeed: 1280
};

const RL_PHYSICS = {
  pv: 720, Ph: 720, Dh: .998, wh: .985, Uh: .995,
  xv: 460, Tv: 725, bv: 750, Hh: 1450, ju: 1000,
  Sv: 1100, Nv: 1350, Mv: 33.3, cc: 400, Gh: 320,
  Ev: .2, Bh: 440, qh: .45, _v: 1.35, Av: 6.0,
  reverseDriveSpeed: 1400, wavedashMinSpeed: 1280
};

let activePhysicsMode = "rocket_league";

export const activeCameraTransform = {
  offsetX: 0,
  offsetY: 0,
  scale: 1
};

export const mouseScreenPos = {
  x: 0,
  y: 0,
  active: false
};

export const mouseWorldPos = {
  x: 1000,
  y: 500,
  active: false
};

// Dynamic physics constants (synced with activePhysicsMode)
let pv=720,Ph=720,Dh=.998,wh=.985,Uh=.995,xv=460,Tv=725,bv=750,Hh=1450,ju=1000,Sv=1100,Nv=1350,Mv=33.3,cc=400,Gh=320,Ev=.2,Bh=440,qh=.45,_v=1.35,Av=6.0;

function syncPhysicsGlobals(mode: string) {
  activePhysicsMode = mode || "rocket_league";
  const c = activePhysicsMode === "legacy" ? LEGACY_PHYSICS : RL_PHYSICS;
  pv = c.pv; Ph = c.Ph; Dh = c.Dh; wh = c.wh; Uh = c.Uh;
  xv = c.xv; Tv = c.Tv; bv = c.bv; Hh = c.Hh; ju = c.ju;
  Sv = c.Sv; Nv = c.Nv; Mv = c.Mv; cc = c.cc; Gh = c.Gh;
  Ev = c.Ev; Bh = c.Bh; qh = c.qh; _v = c._v; Av = c.Av;
}
const BOT_PRO_NAMES = [
  "Zen", "Vatira", "Squishy", "Jstn", "Kronovi",
  "GarrettG", "MonkeyM00n", "Ahmad", "Daniel", "Firstkiller",
  "Joyo", "AppJack", "BeastMode", "Mawkzy", "Atow",
  "Rw9", "Kiileerrz", "Alpha54", "Turbopolsa", "Kaydop",
  "Rizzo", "Sizz", "Lethamyr", "Sunless", "Wayton",
  "Musty", "Kuxir", "Torment", "Gimmick", "Scrub Killa",
  "Fairy Peak", "Paschy90", "Deevo", "Jhzer",
  "Itachi", "ExoTiiK", "Seikoo", "Dralii", "Rise",
  "Oski", "Archie", "Kash", "Joreuz", "AyyJayy"
];

const BOT_MEME_NAMES = [
  "AKAN550 MENTALITY", "AKAN550", "AKAN67", "AKAN THE GOAT", "AKAN550 PRIME", "AKAN67 TURBO", "AKAN WARRIOR", "AKAN MENTALITY",
  "Skibidi Striker", "Rizzler 2026", "Sigma Mentality", "Gigachad", "CaseOh",
  "Jynxzi", "Fanum Tax", "Mewing Champion", "What The Sigma", "Kai Cenat",
  "Baby Gronk", "IShowSpeed", "Grimace Shake", "Aura +1000",
  "Ohio Final Boss", "Broski Nation", "Lock In 2026", "No Cap", "Gyatt Reset",
  "Brainrot Sweeper", "Hawk Tuah", "Glazing Master", "Let Him Cook", "Real Cinema", "Skill Issue",
  "Rule 1 Enforcer", "Whiff Artist", "Boost Vampire", "Speedflip Demon",
  "Turtle Enjoyer", "Crossbar Lover", "Calculated Spammer", "What A Save Andy",
  "Breezi", "Demo Addict", "Zero Boost Hero", "Ceiling Pinch", "Kickoff Scammer",
  "Flip Reset King", "Air Roll Spinner", "Musty Or Bust", "Post Clanger"
];

const BOT_CLAN_TAGS = [
  "[AK]", "[G2]", "[BDS]", "[VIT]", "[KC]", "[NRG]", "[TL]", "[OG]", "[C9]", "[TSM]"
];

const BOT_SUFFIXES = [
  "_99", "_77", "_X", "_v2", "_Pro", "_AI", "_EZ"
];

const usedLobbyNames = new Set<string>();

export function clearLobbyNames() {
  usedLobbyNames.clear();
}

export function getRandomMemeName(prefix = ""): string {
  for (let attempt = 0; attempt < 60; attempt++) {
    const isPro = Math.random() < 0.38;
    const base = isPro
      ? BOT_PRO_NAMES[Math.floor(Math.random() * BOT_PRO_NAMES.length)]
      : BOT_MEME_NAMES[Math.floor(Math.random() * BOT_MEME_NAMES.length)];

    let name = base;
    const p = prefix ? prefix.trim() : "";
    const isPhrase = base.includes(" ") || base.length > 9;

    if (p) {
      // With emoji prefix (e.g. ☠️ or 🔥): clean prefix + name
      name = `${p} ${base}`;
    } else if (!isPhrase) {
      // Single short base names (e.g. Zen, Jstn, Sigma, CaseOh, AKAN550):
      // Optionally add a clan tag OR a suffix (never both)
      const roll = Math.random();
      if (roll < 0.25) {
        const tag = BOT_CLAN_TAGS[Math.floor(Math.random() * BOT_CLAN_TAGS.length)];
        name = `${tag} ${base}`;
      } else if (roll < 0.45) {
        const suf = BOT_SUFFIXES[Math.floor(Math.random() * BOT_SUFFIXES.length)];
        name = `${base}${suf}`;
      } else {
        name = base;
      }
    } else {
      // Already an iconic phrase like "AKAN550 MENTALITY": keep it clean and pristine
      name = base;
    }

    name = name.trim();

    if (!usedLobbyNames.has(name)) {
      usedLobbyNames.add(name);
      return name;
    }
  }
  const fallback = ((prefix ? `${prefix.trim()} ` : "") + `Bot_${Math.floor(10 + Math.random() * 89)}`);
  usedLobbyNames.add(fallback);
  return fallback;
}

function Yh(mapId?: string) {
  const currentMap = (mapId && MAP_DEFINITIONS[mapId]) || activeMapDef || MAP_DEFINITIONS.standard;
  const curKt = currentMap.Kt, curK = currentMap.k, curQt = currentMap.Qt, curAt = currentMap.At, curMt = currentMap.Mt;
  const midX = curKt / 2;
  const midY = (curQt + curK) / 2;

  // Standard DFH Stadium (2000x1100) - 17 pads (6 big, 11 small)
  if (currentMap.id === "standard") {
    return [
      { id: "big_bl", x: 260, y: curK - 40, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "big_br", x: 1740, y: curK - 40, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "big_tl", x: 260, y: curQt + 120, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "big_tr", x: 1740, y: curQt + 120, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "big_mid_bot", x: 1e3, y: curK - 40, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "big_mid_top", x: 1e3, y: curQt + 100, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "small_1", x: 600, y: curK - 20, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "small_2", x: 800, y: curK - 20, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "small_3", x: 1200, y: curK - 20, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "small_4", x: 1400, y: curK - 20, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "small_5", x: 450, y: 700, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "small_6", x: 1550, y: 700, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "small_7", x: 800, y: 550, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "small_8", x: 1200, y: 550, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "small_9", x: 1e3, y: 550, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "small_10", x: 600, y: 400, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "small_11", x: 1400, y: 400, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 }
    ];
  }

  // Colossus Stadium (2800x1300) - 34 pads (8 big, 26 small)
  if (currentMap.id === "colossus") {
    return [
      // 8 Big Pads: 4 corners + 2 midfield + 2 wide flank orbs
      { id: "col_big_bl", x: curAt + 140, y: curK - 40, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "col_big_br", x: curMt - 140, y: curK - 40, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "col_big_tl", x: curAt + 140, y: curQt + 130, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "col_big_tr", x: curMt - 140, y: curQt + 130, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "col_big_mid_bot", x: midX, y: curK - 40, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "col_big_mid_top", x: midX, y: curQt + 110, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "col_big_flank_l", x: curAt + 650, y: midY, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "col_big_flank_r", x: curMt - 650, y: midY, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },

      // 26 Small Pads
      // Floor baseline lane
      { id: "col_sm_floor_1", x: curAt + 410, y: curK - 20, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "col_sm_floor_2", x: curAt + 710, y: curK - 20, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "col_sm_floor_3", x: curAt + 1010, y: curK - 20, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "col_sm_floor_4", x: curMt - 1010, y: curK - 20, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "col_sm_floor_5", x: curMt - 710, y: curK - 20, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "col_sm_floor_6", x: curMt - 410, y: curK - 20, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },

      // Midfield kickoff diamond
      { id: "col_sm_mid_l", x: midX - 220, y: midY, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "col_sm_mid_r", x: midX + 220, y: midY, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "col_sm_mid_top", x: midX, y: midY - 180, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "col_sm_mid_bot", x: midX, y: midY + 180, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "col_sm_center", x: midX, y: midY, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },

      // Defensive goal arcs (3 Blue, 3 Orange)
      { id: "col_sm_def_l1", x: curAt + 280, y: midY - 160, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "col_sm_def_l2", x: curAt + 360, y: midY, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "col_sm_def_l3", x: curAt + 280, y: midY + 160, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "col_sm_def_r1", x: curMt - 280, y: midY - 160, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "col_sm_def_r2", x: curMt - 360, y: midY, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "col_sm_def_r3", x: curMt - 280, y: midY + 160, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },

      // Lower wall and transition lanes
      { id: "col_sm_low_1", x: curAt + 580, y: curK - 260, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "col_sm_low_2", x: midX - 380, y: curK - 260, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "col_sm_low_3", x: midX + 380, y: curK - 260, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "col_sm_low_4", x: curMt - 580, y: curK - 260, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },

      // Upper wall, ceiling and aerial launch lanes
      { id: "col_sm_up_1", x: curAt + 580, y: curQt + 280, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "col_sm_up_2", x: midX - 380, y: curQt + 260, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "col_sm_up_3", x: midX, y: curQt + 260, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "col_sm_up_4", x: midX + 380, y: curQt + 260, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "col_sm_up_5", x: curMt - 580, y: curQt + 280, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 }
    ];
  }

  // Gargantuan Mega-Dome (3600x1500) - 48 pads (10 big, 38 small)
  if (currentMap.id === "gargantuan") {
    return [
      // 10 Big Pads: 4 corners + 2 midfield + 4 quadrant wing orbs
      { id: "gar_big_bl", x: curAt + 160, y: curK - 45, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "gar_big_br", x: curMt - 160, y: curK - 45, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "gar_big_tl", x: curAt + 160, y: curQt + 140, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "gar_big_tr", x: curMt - 160, y: curQt + 140, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "gar_big_mid_bot", x: midX, y: curK - 45, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "gar_big_mid_top", x: midX, y: curQt + 120, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "gar_big_wing_bl", x: curAt + 850, y: curK - 320, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "gar_big_wing_tl", x: curAt + 850, y: curQt + 320, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "gar_big_wing_br", x: curMt - 850, y: curK - 320, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "gar_big_wing_tr", x: curMt - 850, y: curQt + 320, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },

      // 38 Small Pads
      // Floor lanes
      { id: "gar_sm_fl_1", x: curAt + 390, y: curK - 25, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "gar_sm_fl_2", x: curAt + 740, y: curK - 25, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "gar_sm_fl_3", x: curAt + 1090, y: curK - 25, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "gar_sm_fl_4", x: curAt + 1390, y: curK - 25, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "gar_sm_fl_5", x: curMt - 1390, y: curK - 25, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "gar_sm_fl_6", x: curMt - 1090, y: curK - 25, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "gar_sm_fl_7", x: curMt - 740, y: curK - 25, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "gar_sm_fl_8", x: curMt - 390, y: curK - 25, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },

      // Midfield hexagon
      { id: "gar_sm_mid_l", x: midX - 320, y: midY, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "gar_sm_mid_r", x: midX + 320, y: midY, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "gar_sm_mid_tl", x: midX - 160, y: midY - 220, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "gar_sm_mid_tr", x: midX + 160, y: midY - 220, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "gar_sm_mid_bl", x: midX - 160, y: midY + 220, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "gar_sm_mid_br", x: midX + 160, y: midY + 220, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "gar_sm_center", x: midX, y: midY, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },

      // Defensive perimeter arcs (5 Blue, 5 Orange)
      { id: "gar_sm_def_l1", x: curAt + 280, y: midY - 260, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "gar_sm_def_l2", x: curAt + 380, y: midY - 130, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "gar_sm_def_l3", x: curAt + 440, y: midY, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "gar_sm_def_l4", x: curAt + 380, y: midY + 130, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "gar_sm_def_l5", x: curAt + 280, y: midY + 260, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },

      { id: "gar_sm_def_r1", x: curMt - 280, y: midY - 260, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "gar_sm_def_r2", x: curMt - 380, y: midY - 130, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "gar_sm_def_r3", x: curMt - 440, y: midY, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "gar_sm_def_r4", x: curMt - 380, y: midY + 130, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "gar_sm_def_r5", x: curMt - 280, y: midY + 260, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },

      // Transition & rotation connectors
      { id: "gar_sm_trans_l1", x: curAt + 1300, y: midY - 260, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "gar_sm_trans_l2", x: curAt + 1300, y: midY + 260, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "gar_sm_trans_r1", x: curMt - 1300, y: midY - 260, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "gar_sm_trans_r2", x: curMt - 1300, y: midY + 260, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "gar_sm_flank_l", x: curAt + 600, y: midY, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "gar_sm_flank_r", x: curMt - 600, y: midY, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },

      // High aerial & ceiling launch lane
      { id: "gar_sm_air_1", x: curAt + 600, y: curQt + 220, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "gar_sm_air_2", x: curAt + 1200, y: curQt + 220, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "gar_sm_air_3", x: midX - 450, y: curQt + 220, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "gar_sm_air_4", x: midX, y: curQt + 220, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "gar_sm_air_5", x: midX + 450, y: curQt + 220, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "gar_sm_air_6", x: curMt - 1200, y: curQt + 220, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "gar_sm_air_7", x: curMt - 600, y: curQt + 220, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 }
    ];
  }

  // Core Pit (Drop Pit - Floor Goals, 2400x1200) - 30 pads (8 big, 22 small)
  if (currentMap.id === "drop_pit") {
    return [
      // 8 Big Pads: 4 corners + 2 midfield + 2 dunk launchpads above the pit nets
      { id: "pit_big_bl", x: curAt + 140, y: curK - 40, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "pit_big_br", x: curMt - 140, y: curK - 40, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "pit_big_tl", x: curAt + 140, y: curQt + 120, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "pit_big_tr", x: curMt - 140, y: curQt + 120, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "pit_big_mid_bot", x: midX, y: curK - 40, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "pit_big_mid_top", x: midX, y: curQt + 100, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "pit_big_dunk_l", x: 570, y: curQt + 180, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "pit_big_dunk_r", x: 1830, y: curQt + 180, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },

      // 22 Small Pads
      { id: "pit_sm_rim_l1", x: 380, y: curK - 20, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "pit_sm_rim_l2", x: 760, y: curK - 20, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "pit_sm_rim_r1", x: 1640, y: curK - 20, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "pit_sm_rim_r2", x: 2020, y: curK - 20, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },

      { id: "pit_sm_fl_1", x: 950, y: curK - 20, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "pit_sm_fl_2", x: 1070, y: curK - 20, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "pit_sm_fl_3", x: 1330, y: curK - 20, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "pit_sm_fl_4", x: 1450, y: curK - 20, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },

      { id: "pit_sm_mid_t", x: midX, y: curQt + 280, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "pit_sm_mid_b", x: midX, y: curK - 260, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "pit_sm_mid_l", x: midX - 220, y: midY, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "pit_sm_mid_r", x: midX + 220, y: midY, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },

      { id: "pit_sm_launch_l1", x: 380, y: 500, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "pit_sm_launch_l2", x: 760, y: 500, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "pit_sm_launch_r1", x: 1640, y: 500, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "pit_sm_launch_r2", x: 2020, y: 500, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "pit_sm_ceil_l", x: 850, y: curQt + 220, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "pit_sm_ceil_r", x: 1550, y: curQt + 220, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },

      { id: "pit_sm_rec_l1", x: curAt + 100, y: 750, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "pit_sm_rec_l2", x: 950, y: 750, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "pit_sm_rec_r1", x: 1450, y: 750, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "pit_sm_rec_r2", x: curMt - 100, y: 750, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 }
    ];
  }

  // Sky Vault (Ceiling Goals, 2400x1200) - 30 pads (8 big, 22 small)
  if (currentMap.id === "sky_vault") {
    return [
      // 8 Big Pads: 4 corners + 2 midfield + 2 ground vertical booster pads directly below ceiling vaults
      { id: "sky_big_bl", x: curAt + 140, y: curK - 40, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "sky_big_br", x: curMt - 140, y: curK - 40, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "sky_big_tl", x: curAt + 140, y: curQt + 120, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "sky_big_tr", x: curMt - 140, y: curQt + 120, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "sky_big_mid_bot", x: midX, y: curK - 40, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "sky_big_mid_top", x: midX, y: curQt + 100, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "sky_big_launch_l", x: 570, y: curK - 40, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "sky_big_launch_r", x: 1830, y: curK - 40, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },

      // 22 Small Pads
      { id: "sky_sm_fl_1", x: 880, y: curK - 20, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "sky_sm_fl_2", x: 1040, y: curK - 20, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "sky_sm_fl_3", x: 1360, y: curK - 20, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "sky_sm_fl_4", x: 1520, y: curK - 20, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },

      { id: "sky_sm_ceil_l1", x: 380, y: curQt + 30, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "sky_sm_ceil_l2", x: 760, y: curQt + 30, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "sky_sm_ceil_r1", x: 1640, y: curQt + 30, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "sky_sm_ceil_r2", x: 2020, y: curQt + 30, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },

      { id: "sky_sm_mid_t", x: midX, y: curQt + 260, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "sky_sm_mid_b", x: midX, y: curK - 240, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "sky_sm_mid_l", x: midX - 220, y: midY, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "sky_sm_mid_r", x: midX + 220, y: midY, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },

      { id: "sky_sm_climb_l1", x: 570, y: 750, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "sky_sm_climb_l2", x: 570, y: 480, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "sky_sm_climb_r1", x: 1830, y: 750, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "sky_sm_climb_r2", x: 1830, y: 480, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "sky_sm_mid_climb_l", x: 850, y: midY, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "sky_sm_mid_climb_r", x: 1550, y: midY, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },

      { id: "sky_sm_cross_l1", x: 900, y: 360, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "sky_sm_cross_r1", x: 1500, y: 360, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "sky_sm_cross_l2", x: 900, y: 800, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "sky_sm_cross_r2", x: 1500, y: 800, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 }
    ];
  }

  // Aerial Hoops (Elevated Flying Goals with Underpass, 2400x1200) - 30 pads (8 big, 22 small)
  if (currentMap.id === "aerial_hoops") {
    return [
      // 8 Big Pads: 4 corners + 2 midfield + 2 underpass runway boost orbs
      { id: "hoop_big_bl", x: curAt + 140, y: curK - 40, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "hoop_big_br", x: curMt - 140, y: curK - 40, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "hoop_big_tl", x: curAt + 140, y: curQt + 120, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "hoop_big_tr", x: curMt - 140, y: curQt + 120, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "hoop_big_mid_bot", x: midX, y: curK - 40, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "hoop_big_mid_top", x: midX, y: curQt + 100, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "hoop_big_under_l", x: curAt + 60, y: 880, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
      { id: "hoop_big_under_r", x: curMt - 60, y: 880, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },

      // 22 Small Pads
      { id: "hoop_sm_fl_1", x: curAt + 310, y: curK - 20, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "hoop_sm_fl_2", x: curAt + 610, y: curK - 20, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "hoop_sm_fl_3", x: curAt + 910, y: curK - 20, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "hoop_sm_fl_4", x: curMt - 910, y: curK - 20, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "hoop_sm_fl_5", x: curMt - 610, y: curK - 20, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "hoop_sm_fl_6", x: curMt - 310, y: curK - 20, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },

      { id: "hoop_sm_rim_l1", x: curAt + 180, y: 450, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "hoop_sm_rim_l2", x: curAt + 310, y: 350, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "hoop_sm_rim_r1", x: curMt - 180, y: 450, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "hoop_sm_rim_r2", x: curMt - 310, y: 350, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },

      { id: "hoop_sm_mid_t", x: midX, y: curQt + 260, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "hoop_sm_mid_b", x: midX, y: curK - 240, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "hoop_sm_mid_l", x: midX - 220, y: midY, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "hoop_sm_mid_r", x: midX + 220, y: midY, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },

      { id: "hoop_sm_back_l1", x: curAt + 180, y: 220, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "hoop_sm_back_l2", x: curAt + 380, y: 220, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "hoop_sm_back_r1", x: curMt - 180, y: 220, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "hoop_sm_back_r2", x: curMt - 380, y: 220, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },

      { id: "hoop_sm_rot_l1", x: curAt + 610, y: 680, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "hoop_sm_rot_r1", x: curMt - 610, y: 680, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "hoop_sm_rot_l2", x: curAt + 710, y: 480, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
      { id: "hoop_sm_rot_r2", x: curMt - 710, y: 480, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 }
    ];
  }

  // Fallback dynamic generator for any custom arena size
  return [
    { id: "big_bl", x: curAt + 140, y: curK - 40, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
    { id: "big_br", x: curMt - 140, y: curK - 40, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
    { id: "big_tl", x: curAt + 140, y: curQt + 120, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
    { id: "big_tr", x: curMt - 140, y: curQt + 120, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
    { id: "big_mid_bot", x: midX, y: curK - 40, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
    { id: "big_mid_top", x: midX, y: curQt + 100, type: "big", active: true, cooldownTimer: 0, respawnTime: 10 },
    { id: "small_1", x: curAt + (midX - curAt) * 0.35, y: curK - 20, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
    { id: "small_2", x: curAt + (midX - curAt) * 0.70, y: curK - 20, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
    { id: "small_3", x: midX + (curMt - midX) * 0.30, y: curK - 20, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
    { id: "small_4", x: midX + (curMt - midX) * 0.65, y: curK - 20, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
    { id: "small_5", x: curAt + (midX - curAt) * 0.25, y: curK - 250, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
    { id: "small_6", x: curMt - (curMt - midX) * 0.25, y: curK - 250, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
    { id: "small_7", x: midX - 220, y: midY, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
    { id: "small_8", x: midX + 220, y: midY, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
    { id: "small_9", x: midX, y: midY, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
    { id: "small_10", x: curAt + (midX - curAt) * 0.45, y: curQt + 280, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 },
    { id: "small_11", x: curMt - (curMt - midX) * 0.45, y: curQt + 280, type: "small", active: true, cooldownTimer: 0, respawnTime: 4 }
  ];
}

class Ov {
  ctx: AudioContext | null = null;
  masterGain: GainNode | null = null;
  limiter: DynamicsCompressorNode | null = null;
  isMuted: boolean = false;
  volume: number = 0.5;
  engineOsc: any = null;
  engineGain: any = null;
  boostSource: any = null;
  boostGain: any = null;
  lastGoalTime: number = 0;
  lastCrossbarTime: number = 0;
  lastHitTime: number = 0;
  lastDemoTime: number = 0;

  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.limiter = null;
    this.isMuted = false;
    this.volume = 0.5;
    this.engineOsc = null;
    this.engineGain = null;
    this.boostSource = null;
    this.boostGain = null;
    this.lastGoalTime = 0;
    this.lastCrossbarTime = 0;
    this.lastHitTime = 0;
    this.lastDemoTime = 0;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      // Master Dynamics Compressor: clean, transparent peak control with ample headroom
      this.limiter = this.ctx.createDynamicsCompressor();
      this.limiter.threshold.setValueAtTime(-4, this.ctx.currentTime);
      this.limiter.knee.setValueAtTime(8, this.ctx.currentTime);
      this.limiter.ratio.setValueAtTime(8, this.ctx.currentTime);
      this.limiter.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.limiter.release.setValueAtTime(0.12, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);

      this.masterGain.connect(this.limiter);
      this.limiter.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : this.volume, this.ctx.currentTime, 0.05);
    }
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  createNoiseBuffer(duration: number = 0.5): AudioBuffer | null {
    if (!this.ctx) return null;
    const sampleRate = this.ctx.sampleRate;
    const bufferSize = Math.floor(sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut * 0.94) + (white * 0.06);
      data[i] = (lastOut * 3.0) + (white * 0.15);
    }
    return buffer;
  }

  playJump() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(340, t + 0.09);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.005, t + 0.10);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.11);

    const noise = this.createNoiseBuffer(0.07);
    if (noise) {
      const src = this.ctx.createBufferSource();
      src.buffer = noise;
      const bp = this.ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.setValueAtTime(550, t);
      bp.Q.setValueAtTime(1.0, t);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.07, t);
      g.gain.exponentialRampToValueAtTime(0.005, t + 0.07);
      src.connect(bp);
      bp.connect(g);
      g.connect(this.masterGain);
      src.start(t);
      src.stop(t + 0.075);
    }
  }

  playDodgeFlip() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    const noise = this.createNoiseBuffer(0.14);
    if (noise) {
      const src = this.ctx.createBufferSource();
      src.buffer = noise;
      const bp = this.ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.setValueAtTime(700, t);
      bp.frequency.exponentialRampToValueAtTime(240, t + 0.12);
      bp.Q.setValueAtTime(1.5, t);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.16, t);
      g.gain.exponentialRampToValueAtTime(0.005, t + 0.13);
      src.connect(bp);
      bp.connect(g);
      g.connect(this.masterGain);
      src.start(t);
      src.stop(t + 0.14);
    }

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.11);
    gain.gain.setValueAtTime(0.14, t);
    gain.gain.exponentialRampToValueAtTime(0.005, t + 0.12);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.13);
  }

  playBallHit(power: number = 1) {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Debounce rapid frame clicks
    if (this.lastHitTime && (t - this.lastHitTime < 0.038)) return;
    this.lastHitTime = t;

    const p = Math.min(2.0, Math.max(0.4, power));

    // 1. Rubber ball impact pop & body thump
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(130 * Math.min(1.3, p), t);
    osc.frequency.exponentialRampToValueAtTime(42, t + 0.07);
    gain.gain.setValueAtTime(0.18 * p, t);
    gain.gain.exponentialRampToValueAtTime(0.005, t + 0.08);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.09);

    // 2. Leather/Rubber surface tap transient
    const noiseBuffer = this.createNoiseBuffer(0.03);
    if (noiseBuffer) {
      const nSource = this.ctx.createBufferSource();
      nSource.buffer = noiseBuffer;
      const nFilter = this.ctx.createBiquadFilter();
      nFilter.type = "bandpass";
      nFilter.frequency.setValueAtTime(1400, t);
      nFilter.Q.setValueAtTime(1.2, t);
      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.09 * p, t);
      nGain.gain.exponentialRampToValueAtTime(0.005, t + 0.03);
      nSource.connect(nFilter);
      nFilter.connect(nGain);
      nGain.connect(this.masterGain);
      nSource.start(t);
      nSource.stop(t + 0.035);
    }

    // 3. Heavy Boomer Strike (sub thump for supersonic & high-power hits)
    if (p > 1.2) {
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = "triangle";
      subOsc.frequency.setValueAtTime(85, t);
      subOsc.frequency.exponentialRampToValueAtTime(32, t + 0.12);
      subGain.gain.setValueAtTime(0.14 * (p - 1.0), t);
      subGain.gain.exponentialRampToValueAtTime(0.005, t + 0.13);
      subOsc.connect(subGain);
      subGain.connect(this.masterGain);
      subOsc.start(t);
      subOsc.stop(t + 0.14);
    }
  }

  playCrossbar() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Debounce multiple frame contacts
    if (this.lastCrossbarTime && (t - this.lastCrossbarTime < 0.12)) return;
    this.lastCrossbarTime = t;

    // Authentic hollow steel goalpost ping (well-balanced harmonics, gentle total gain)
    const modes = [
      { freq: 780, gain: 0.12, dur: 0.42 },
      { freq: 1380, gain: 0.08, dur: 0.28 },
      { freq: 2150, gain: 0.04, dur: 0.15 }
    ];

    modes.forEach(({ freq, gain, dur }) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(gain, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    });

    // Sharp metallic ping transient
    const ping = this.ctx.createOscillator();
    const pingGain = this.ctx.createGain();
    ping.type = "triangle";
    ping.frequency.setValueAtTime(1600, t);
    ping.frequency.exponentialRampToValueAtTime(260, t + 0.02);
    pingGain.gain.setValueAtTime(0.12, t);
    pingGain.gain.exponentialRampToValueAtTime(0.005, t + 0.025);
    ping.connect(pingGain);
    pingGain.connect(this.masterGain);
    ping.start(t);
    ping.stop(t + 0.03);
  }

  playSupersonicBoom() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Double aerodynamic crack ("ba-BUMP")
    const click = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    click.type = "triangle";
    click.frequency.setValueAtTime(850, t);
    click.frequency.exponentialRampToValueAtTime(120, t + 0.035);
    clickGain.gain.setValueAtTime(0.16, t);
    clickGain.gain.exponentialRampToValueAtTime(0.005, t + 0.04);
    click.connect(clickGain);
    clickGain.connect(this.masterGain);
    click.start(t);
    click.stop(t + 0.045);

    // Deep sub-pressure sonic shockwave
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = "sine";
    sub.frequency.setValueAtTime(80, t + 0.015);
    sub.frequency.exponentialRampToValueAtTime(26, t + 0.28);
    subGain.gain.setValueAtTime(0.24, t + 0.015);
    subGain.gain.exponentialRampToValueAtTime(0.005, t + 0.30);
    sub.connect(subGain);
    subGain.connect(this.masterGain);
    sub.start(t + 0.015);
    sub.stop(t + 0.32);

    // Wind rush whoosh
    const noise = this.createNoiseBuffer(0.18);
    if (noise) {
      const src = this.ctx.createBufferSource();
      src.buffer = noise;
      const bp = this.ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.setValueAtTime(950, t);
      bp.frequency.exponentialRampToValueAtTime(280, t + 0.16);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.12, t);
      g.gain.exponentialRampToValueAtTime(0.005, t + 0.17);
      src.connect(bp);
      bp.connect(g);
      g.connect(this.masterGain);
      src.start(t);
      src.stop(t + 0.18);
    }
  }

  playDemolition() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    if (this.lastDemoTime && (t - this.lastDemoTime < 0.15)) return;
    this.lastDemoTime = t;

    const demoBus = this.ctx.createGain();
    demoBus.gain.setValueAtTime(0.38, t);
    demoBus.connect(this.masterGain);

    // 1. Metal shatter & mechanical crunch transient
    const crunchBuffer = this.createNoiseBuffer(0.15);
    if (crunchBuffer) {
      const src = this.ctx.createBufferSource();
      src.buffer = crunchBuffer;
      const bp = this.ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.setValueAtTime(1600, t);
      bp.frequency.exponentialRampToValueAtTime(320, t + 0.12);
      bp.Q.setValueAtTime(1.5, t);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.24, t);
      g.gain.exponentialRampToValueAtTime(0.005, t + 0.13);
      src.connect(bp);
      bp.connect(g);
      g.connect(demoBus);
      src.start(t);
      src.stop(t + 0.14);
    }

    // 2. Rolling fireball sub-bass explosion
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = "sine";
    sub.frequency.setValueAtTime(105, t);
    sub.frequency.exponentialRampToValueAtTime(28, t + 0.45);
    subGain.gain.setValueAtTime(0.30, t);
    subGain.gain.exponentialRampToValueAtTime(0.005, t + 0.50);
    sub.connect(subGain);
    subGain.connect(demoBus);
    sub.start(t);
    sub.stop(t + 0.52);

    // 3. Expanding fireball rumble
    const noise = this.createNoiseBuffer(0.50);
    if (noise) {
      const src = this.ctx.createBufferSource();
      src.buffer = noise;
      const lp = this.ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(750, t);
      lp.frequency.exponentialRampToValueAtTime(60, t + 0.42);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.22, t);
      g.gain.exponentialRampToValueAtTime(0.005, t + 0.48);
      src.connect(lp);
      lp.connect(g);
      g.connect(demoBus);
      src.start(t);
      src.stop(t + 0.50);
    }
  }

  playGoalExplosion() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Hard debounce: never fire more than once within 2.0s
    if (this.lastGoalTime && (t - this.lastGoalTime < 2.0)) return;
    this.lastGoalTime = t;

    // Dedicated goal sub-mix bus with headroom control (prevents clipping & harsh volume spikes)
    const goalBus = this.ctx.createGain();
    goalBus.gain.setValueAtTime(0.42, t);
    goalBus.connect(this.masterGain);

    // 1. Crisp initial explosive punch transient ("Crack")
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    clickOsc.type = "triangle";
    clickOsc.frequency.setValueAtTime(420, t);
    clickOsc.frequency.exponentialRampToValueAtTime(80, t + 0.025);
    clickGain.gain.setValueAtTime(0.24, t);
    clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    clickOsc.connect(clickGain);
    clickGain.connect(goalBus);
    clickOsc.start(t);
    clickOsc.stop(t + 0.035);

    // 2. Deep cinematic sub-bass punch & rumble (clean, punchy, not muddy)
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(95, t);
    subOsc.frequency.exponentialRampToValueAtTime(32, t + 0.55);
    subGain.gain.setValueAtTime(0.32, t);
    subGain.gain.exponentialRampToValueAtTime(0.005, t + 0.65);
    subOsc.connect(subGain);
    subGain.connect(goalBus);
    subOsc.start(t);
    subOsc.stop(t + 0.70);

    // 3. Smooth low-pass explosive fireball shockwave (warm pink noise, gentle Q)
    const noiseBuffer = this.createNoiseBuffer(0.85);
    if (noiseBuffer) {
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = "lowpass";
      noiseFilter.Q.setValueAtTime(0.8, t); // Clean, non-resonant, no whistling
      noiseFilter.frequency.setValueAtTime(950, t);
      noiseFilter.frequency.exponentialRampToValueAtTime(45, t + 0.70);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.22, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.005, t + 0.75);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(goalBus);
      noiseSource.start(t);
      noiseSource.stop(t + 0.80);
    }

    // 4. Authentic Stadium Goal Siren / Horn (Rich fifth power-chord: F2, C3, F3, C4)
    // Warm harmonic brass tone filtered at 680Hz
    const hornNotes = [87.3, 130.8, 174.6, 261.6];
    const hornFilter = this.ctx.createBiquadFilter();
    hornFilter.type = "lowpass";
    hornFilter.frequency.setValueAtTime(680, t);
    hornFilter.frequency.linearRampToValueAtTime(520, t + 1.2);

    const hornMasterGain = this.ctx.createGain();
    hornMasterGain.gain.setValueAtTime(0.001, t);
    hornMasterGain.gain.linearRampToValueAtTime(0.16, t + 0.06);
    hornMasterGain.gain.setValueAtTime(0.16, t + 0.7);
    hornMasterGain.gain.exponentialRampToValueAtTime(0.005, t + 1.35);

    hornFilter.connect(hornMasterGain);
    hornMasterGain.connect(goalBus);

    hornNotes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = idx === 0 ? "sawtooth" : "triangle";
      osc.frequency.setValueAtTime(freq, t + 0.04);
      osc.detune.setValueAtTime((idx - 1.5) * 4, t + 0.04);
      osc.connect(hornFilter);
      osc.start(t + 0.04);
      osc.stop(t + 1.40);
    });

    // 5. Stadium Crowd Roar & Room Reverb (swells at t + 0.10s)
    const crowdBuffer = this.createNoiseBuffer(2.2);
    if (crowdBuffer) {
      const crowdSource = this.ctx.createBufferSource();
      crowdSource.buffer = crowdBuffer;

      const crowdFilter = this.ctx.createBiquadFilter();
      crowdFilter.type = "bandpass";
      crowdFilter.frequency.setValueAtTime(500, t + 0.1);
      crowdFilter.frequency.linearRampToValueAtTime(950, t + 0.45);
      crowdFilter.frequency.linearRampToValueAtTime(450, t + 2.0);
      crowdFilter.Q.setValueAtTime(0.9, t + 0.1);

      const crowdGain = this.ctx.createGain();
      crowdGain.gain.setValueAtTime(0.001, t);
      crowdGain.gain.linearRampToValueAtTime(0.14, t + 0.35);
      crowdGain.gain.setValueAtTime(0.14, t + 0.85);
      crowdGain.gain.exponentialRampToValueAtTime(0.003, t + 2.1);

      crowdSource.connect(crowdFilter);
      crowdFilter.connect(crowdGain);
      crowdGain.connect(goalBus);
      crowdSource.start(t + 0.1);
      crowdSource.stop(t + 2.2);
    }
  }

  playCountdown(isGo: boolean = false) {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    if (!isGo) {
      // 3, 2, 1: Clean, modern electronic stadium tone (C5 @ 523.25Hz)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, t);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.14, t + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.005, t + 0.17);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.19);
    } else {
      // GO!: Bright, triumphant major chord chime (C6 @ 1046.5Hz + E6 @ 1318.5Hz)
      [1046.5, 1318.5].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.16, t + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.005, t + 0.32);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.35);
      });
    }
  }

  playBoostPadPickup(isBig: boolean = false) {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    if (!isBig) {
      // Small pad (+12): Crisp bright crystal pickup chime
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(659.25, t);
      osc.frequency.exponentialRampToValueAtTime(1046.5, t + 0.08);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.005, t + 0.11);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.12);
    } else {
      // Big pad (+100): Rich golden power chime arpeggio + whoosh
      const notes = [523.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        const startT = t + idx * 0.035;
        osc.frequency.setValueAtTime(freq, startT);
        gain.gain.setValueAtTime(0.001, startT);
        gain.gain.linearRampToValueAtTime(0.15, startT + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.005, startT + 0.22);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(startT);
        osc.stop(startT + 0.24);
      });

      const whoosh = this.createNoiseBuffer(0.18);
      if (whoosh) {
        const src = this.ctx.createBufferSource();
        src.buffer = whoosh;
        const bp = this.ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.setValueAtTime(900, t);
        bp.frequency.exponentialRampToValueAtTime(350, t + 0.16);
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.10, t);
        g.gain.exponentialRampToValueAtTime(0.005, t + 0.17);
        src.connect(bp);
        bp.connect(g);
        g.connect(this.masterGain);
        src.start(t);
        src.stop(t + 0.18);
      }
    }
  }

  playPinch() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    // High pressure transient snap
    const whip = this.ctx.createOscillator();
    const whipGain = this.ctx.createGain();
    whip.type = "triangle";
    whip.frequency.setValueAtTime(1400, t);
    whip.frequency.exponentialRampToValueAtTime(260, t + 0.08);
    whipGain.gain.setValueAtTime(0.18, t);
    whipGain.gain.exponentialRampToValueAtTime(0.005, t + 0.09);
    whip.connect(whipGain);
    whipGain.connect(this.masterGain);
    whip.start(t);
    whip.stop(t + 0.10);

    // Boomer bass thump
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = "sine";
    sub.frequency.setValueAtTime(150, t);
    sub.frequency.exponentialRampToValueAtTime(36, t + 0.22);
    subGain.gain.setValueAtTime(0.24, t);
    subGain.gain.exponentialRampToValueAtTime(0.005, t + 0.24);
    sub.connect(subGain);
    subGain.connect(this.masterGain);
    sub.start(t);
    sub.stop(t + 0.25);
  }

  playFlipReset() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    [1046.5, 1567.98].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      const startT = t + idx * 0.04;
      osc.frequency.setValueAtTime(freq, startT);
      gain.gain.setValueAtTime(0.001, startT);
      gain.gain.linearRampToValueAtTime(0.14, startT + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.005, startT + 0.20);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(startT);
      osc.stop(startT + 0.22);
    });
  }

  playMustyFlick() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(190, t);
    osc.frequency.exponentialRampToValueAtTime(520, t + 0.07);
    gain.gain.setValueAtTime(0.16, t);
    gain.gain.exponentialRampToValueAtTime(0.005, t + 0.09);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.10);
  }

  playDoubleTap() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    [587.33, 880.0, 1174.66].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      const startT = t + idx * 0.045;
      osc.frequency.setValueAtTime(freq, startT);
      gain.gain.setValueAtTime(0.001, startT);
      gain.gain.linearRampToValueAtTime(0.14, startT + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.005, startT + 0.18);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(startT);
      osc.stop(startT + 0.20);
    });
  }

  playPsycho() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(32, t + 0.38);
    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.005, t + 0.42);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.45);
  }

  playAirRoll() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    const noise = this.createNoiseBuffer(0.07);
    if (noise) {
      const src = this.ctx.createBufferSource();
      src.buffer = noise;
      const bp = this.ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.setValueAtTime(450, t);
      bp.Q.setValueAtTime(1.0, t);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.07, t);
      g.gain.exponentialRampToValueAtTime(0.005, t + 0.07);
      src.connect(bp);
      bp.connect(g);
      g.connect(this.masterGain);
      src.start(t);
      src.stop(t + 0.075);
    }
  }

  playWavedash() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.08);
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.005, t + 0.09);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.10);

    const noise = this.createNoiseBuffer(0.07);
    if (noise) {
      const src = this.ctx.createBufferSource();
      src.buffer = noise;
      const bp = this.ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.setValueAtTime(1300, t);
      bp.Q.setValueAtTime(1.8, t);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.12, t);
      g.gain.exponentialRampToValueAtTime(0.005, t + 0.07);
      src.connect(bp);
      bp.connect(g);
      g.connect(this.masterGain);
      src.start(t);
      src.stop(t + 0.075);
    }
  }

  playSave(isEpic: boolean = false) {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    const notes = isEpic ? [392.0, 523.25, 659.25, 784.0] : [349.23, 440.0, 523.25];
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(850, t);

    const masterG = this.ctx.createGain();
    masterG.gain.setValueAtTime(0.001, t);
    masterG.gain.linearRampToValueAtTime(isEpic ? 0.16 : 0.12, t + 0.035);
    masterG.gain.exponentialRampToValueAtTime(0.005, t + (isEpic ? 0.42 : 0.28));

    filter.connect(masterG);
    masterG.connect(this.masterGain);

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = "triangle";
      const startT = t + idx * 0.025;
      osc.frequency.setValueAtTime(freq, startT);
      osc.connect(filter);
      osc.start(startT);
      osc.stop(startT + 0.45);
    });
  }

  playSpeedflip() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.075);
    gain.gain.setValueAtTime(0.16, t);
    gain.gain.exponentialRampToValueAtTime(0.005, t + 0.11);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.12);

    const noise = this.createNoiseBuffer(0.09);
    if (noise) {
      const src = this.ctx.createBufferSource();
      src.buffer = noise;
      const bp = this.ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.setValueAtTime(850, t);
      bp.Q.setValueAtTime(1.4, t);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.11, t);
      g.gain.exponentialRampToValueAtTime(0.005, t + 0.09);
      src.connect(bp);
      bp.connect(g);
      g.connect(this.masterGain);
      src.start(t);
      src.stop(t + 0.10);
    }
  }

  playCeilingShot() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    [659.25, 987.77, 1318.5].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, t + idx * 0.035);
      gain.gain.setValueAtTime(0.001, t + idx * 0.035);
      gain.gain.linearRampToValueAtTime(0.12, t + idx * 0.035 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.005, t + idx * 0.035 + 0.30);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + idx * 0.035);
      osc.stop(t + idx * 0.035 + 0.33);
    });
  }

  playTurtle() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    const noise = this.createNoiseBuffer(0.18);
    if (noise) {
      const src = this.ctx.createBufferSource();
      src.buffer = noise;
      const lp = this.ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(240, t);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.10, t);
      g.gain.exponentialRampToValueAtTime(0.005, t + 0.17);
      src.connect(lp);
      lp.connect(g);
      g.connect(this.masterGain);
      src.start(t);
      src.stop(t + 0.18);
    }
  }

  playDunk() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(38, t + 0.15);
    gain.gain.setValueAtTime(0.24, t);
    gain.gain.exponentialRampToValueAtTime(0.005, t + 0.17);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.18);

    const noise = this.createNoiseBuffer(0.08);
    if (noise) {
      const src = this.ctx.createBufferSource();
      src.buffer = noise;
      const bp = this.ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.setValueAtTime(750, t);
      bp.Q.setValueAtTime(1.4, t);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.14, t);
      g.gain.exponentialRampToValueAtTime(0.005, t + 0.08);
      src.connect(bp);
      bp.connect(g);
      g.connect(this.masterGain);
      src.start(t);
      src.stop(t + 0.085);
    }
  }
}
const Me = new Ov();
let On = 0;

function emitMechanicEvent(s: any, car: any, event: { type: string, text: string, color: string, speedKmh?: number }) {
  const now = Date.now();
  const pNow = performance.now();
  car.mechanicCooldowns = car.mechanicCooldowns || {};
  const lastTime = car.mechanicCooldowns[event.type] || 0;
  if (now - lastTime < 900) {
    return false;
  }
  car.mechanicCooldowns[event.type] = now;
  
  const ev = {
    id: ++On,
    type: event.type,
    text: event.text,
    player: car.name,
    team: car.team,
    color: event.color,
    speedKmh: event.speedKmh
  };
  if (s) {
    s.mechanicEvents = s.mechanicEvents || [];
    s.mechanicEvents.push(ev);
  }
  
  if (event.type !== "save" && event.type !== "epic_save") {
    car.score = (car.score || 0) + 25;
  }
  car.activeMechanicAlerts = car.activeMechanicAlerts || [];
  
  for (const prevAlert of car.activeMechanicAlerts) {
    const prevStart = prevAlert.gameTime ?? prevAlert.startTime ?? pNow;
    const elapsed = pNow - prevStart;
    const remaining = (prevAlert.duration || 1800) - elapsed;
    if (remaining > 600) {
      prevAlert.duration = elapsed + 600;
    }
  }

  const baseDuration = car.activeMechanicAlerts.length >= 2 ? 1500 : 2000;
  const alertItem = {
    id: ev.id,
    text: event.text,
    color: event.color,
    startTime: now,
    gameTime: pNow,
    duration: baseDuration
  };

  car.activeMechanicAlerts.unshift(alertItem);
  if (car.activeMechanicAlerts.length > 4) {
    car.activeMechanicAlerts.length = 4;
  }
  car.activeMechanicAlert = alertItem;
  return true;
}
// ==========================================
// --- EXACT LEGACY PHYSICS IMPLEMENTATION ---
// ==========================================
function fc_legacy(u: any, f: any, r: any) {
  fc(u, f, r);
}

function Rv_legacy(u: any) {
  Rv(u);
}

function Cv_legacy(u: any, f: number, r: any) {
  const qh = LEGACY_PHYSICS.qh,
        ju = LEGACY_PHYSICS.ju,
        wh = LEGACY_PHYSICS.wh,
        cc = LEGACY_PHYSICS.cc,
        pv = LEGACY_PHYSICS.pv,
        Dh = LEGACY_PHYSICS.Dh,
        Av = LEGACY_PHYSICS.Av,
        Ev = LEGACY_PHYSICS.Ev,
        Gh = LEGACY_PHYSICS.Gh,
        _v = LEGACY_PHYSICS._v,
        Bh = LEGACY_PHYSICS.Bh,
        Mv = LEGACY_PHYSICS.Mv,
        Nv = LEGACY_PHYSICS.Nv,
        Sv = LEGACY_PHYSICS.Sv,
        bv = LEGACY_PHYSICS.bv,
        xv = LEGACY_PHYSICS.xv,
        Tv = LEGACY_PHYSICS.Tv;

  if (u.isFlipping && (u.flipTimer += f, u.angle += (u.flipDirection.x >= 0 ? 1 : -1) * (Math.PI * 2 / qh) * f, u.flipTimer >= qh && (u.isFlipping = !1, u.flipTimer = 0)), u.jumpCount === 1 && !u.isGrounded && !u.hasFlipReset && (u.flipWindowTimer += f), Rv(u), u.isGrounded) {
    if (u.isFlipping && u.flipTimer < .3) {
      u.isFlipping = !1, u.flipTimer = 0, u.angle = 0;
      const _dashDir = u.flipDirection.x >= 0 ? 1 : -1;
      u.vx = _dashDir * Math.max(Math.abs(u.vx), 1280), u.isSupersonic = !0, u.supersonicTimer = 1.2, Me.playWavedash(), emitMechanicEvent(r, u, { type: "wavedash", text: "⚡ WAVEDASH", color: "#38bdf8" });
      for (let _k = 0; _k < 8; _k++)r.newParticles.push({ id: ++On, x: u.x + (Math.random() - .5) * u.width, y: u.y + u.height / 2, vx: -_dashDir * 200 + (Math.random() - .5) * 80, vy: -50 - Math.random() * 80, life: .25, maxLife: .25, color: "#fbbf24", size: 3, type: "spark" });
    }
    u.jumpCount = 0, u.flipWindowTimer = 0, u.isFlipping = !1, u.hasFlipReset = !1;
    const g = u.surfaceNormal, p = { x: -g.y, y: g.x }, A = { x: g.y, y: -g.x }, C = p.x > .01 || Math.abs(p.x) <= .01 && p.y < 0 ? p : A, z = { x: -C.x, y: -C.y }, N = { x: Math.cos(u.angle), y: Math.sin(u.angle) };
    let X = N.x * C.x + N.y * C.y >= 0, tt = null, I = 0;
    if (u.input.steerRight && !u.input.steerLeft ? (X = !0, tt = C, I = ju) : u.input.steerLeft && !u.input.steerRight ? (X = !1, tt = z, I = ju) : (u.surfaceType === "left_wall" || u.surfaceType === "right_wall") && (u.input.throttleForward || u.input.pitchUp ? (tt = C, X = !0, I = ju) : (u.input.throttleReverse || u.input.pitchDown) && (tt = z, X = !1, I = ju)), !tt) {
      const U = X ? C : z;
      u.input.throttleForward ? (tt = U, I = ju) : u.input.throttleReverse && (tt = U, I = -1400);
    }
    if (tt && I !== 0) {
      u.vx += tt.x * I * f, u.vy += tt.y * I * f;
      const U = Math.atan2(tt.y, tt.x);
      u.angle = Lh(u.angle, U, 22 * f);
    } else {
      const U = X ? C : z, Tt = Math.atan2(U.y, U.x);
      u.angle = Lh(u.angle, Tt, 16 * f), u.vx *= Math.pow(wh, f * 60), u.vy *= Math.pow(wh, f * 60);
    }
    u.facing = Math.cos(u.angle) >= 0 ? 1 : -1;
    u.airRollInverted = false;
    u.input.jump && u.canJump && (u.canJump = !1, u.isGrounded = !1, u.jumpCount = 1, u.jumpHoldTimer = 0, u.surfaceType = "air", u.vx += u.surfaceNormal.x * cc, u.vy += u.surfaceNormal.y * cc, u.facing = Math.cos(u.angle) >= 0 ? 1 : -1, u.airRollInverted = false, Me.playJump());
  } else {
    u.vy += pv * f, u.vx *= Math.pow(Dh, f * 60), u.vy *= Math.pow(Dh, f * 60);
    let g = 0;
    if (u.input.steerLeft || u.input.pitchUp) g -= 1;
    if (u.input.steerRight || u.input.pitchDown) g += 1;
    if (u.input.mouseAim && typeof u.input.mouseTargetAngle === "number" && !u.isFlipping) {
      u.angle = Lh(u.angle, u.input.mouseTargetAngle, Av * 3.5 * f);
      u.facing = Math.cos(u.angle) >= 0 ? 1 : -1;
    } else {
      u.isFlipping || (u.angle += g * Av * f);
      u.facing = Math.cos(u.angle) >= 0 ? 1 : -1;
    }
    if ((u.input.airRollLeft && !u._prevAirRollLeft) || (u.input.airRollRight && !u._prevAirRollRight)) {
      u.airRollInverted = !u.airRollInverted;
      Me.playAirRoll && Me.playAirRoll();
    }
    u._prevAirRollLeft = !!u.input.airRollLeft;
    u._prevAirRollRight = !!u.input.airRollRight;
    if (u.input.jump && u.jumpCount === 1 && u.jumpHoldTimer < Ev) {
      u.jumpHoldTimer += f;
      u.vy += -Gh * f;
    }
    if (u.input.jump && u.canJump && (u.jumpCount === 1 || u.jumpCount === 0) && (u.flipWindowTimer < _v || u.jumpCount === 0)) {
      u.canJump = !1, u.jumpCount = 2;
      let A = 0, C = 0;
      if (u.input.steerRight || u.input.throttleForward) A += 1;
      if (u.input.steerLeft || u.input.throttleReverse) A -= 1;
      if (u.input.pitchUp) C -= 1;
      if (u.input.pitchDown) C += 1;
      if (A === 0 && C === 0 && u.input.mouseAim && typeof u.input.mouseTargetAngle === "number") {
        A = Math.cos(u.input.mouseTargetAngle);
        C = Math.sin(u.input.mouseTargetAngle);
      }
      if (A !== 0 || C !== 0) {
        const z = Math.hypot(A, C) || 1, N = A / z, D = C / z;
        u.vy *= .15, u.vx += N * Bh, u.vy += D * (Bh * .7), u.isFlipping = !0, u.flipTimer = 0, u.flipDirection = { x: N, y: D }, Me.playDodgeFlip();
        for (let X = 0; X < 8; X++)r.newParticles.push({ id: ++On, x: u.x, y: u.y, vx: -N * 300 + (Math.random() - .5) * 150, vy: -D * 300 + (Math.random() - .5) * 150, life: .35, maxLife: .35, color: "#38bdf8", size: 4 + Math.random() * 3, type: "spark" });
      } else u.vy = Math.min(u.vy - cc * 1.05, -cc * 1.15), Me.playJump();
    }
  }
  if (u.input.jump || (u.canJump = !0), u.isBoosting = !1, u.input.boost && u.boost > 0) {
    u.isBoosting = !0, u.boost = Math.max(0, u.boost - Mv * f);
    const g = { x: Math.cos(u.angle), y: Math.sin(u.angle) }, p = !u.isGrounded, A = p ? Nv : Sv;
    u.vx += g.x * A * f, u.vy += g.y * A * f;
    const C = u.x - g.x * (u.width / 2), z = u.y - g.y * (u.width / 2), N = p ? 3 : 2;
    for (let D = 0; D < N; D++)r.newParticles.push({ id: ++On, x: C + (Math.random() - .5) * 6, y: z + (Math.random() - .5) * 6, vx: -g.x * (450 + Math.random() * 350) + (Math.random() - .5) * 90, vy: -g.y * (450 + Math.random() * 350) + (Math.random() - .5) * 90, life: p ? .3 : .25, maxLife: p ? .3 : .25, color: u.team === "blue" ? Math.random() > .4 ? "#38bdf8" : "#60a5fa" : Math.random() > .4 ? "#f97316" : "#fbbf24", size: (p ? 6 : 5) + Math.random() * 4, type: "boost" });
  }
  const s = Math.hypot(u.vx, u.vy), y = u.isBoosting ? bv : xv;
  if (s > y) {
    const g = y / s;
    u.vx *= g, u.vy *= g;
  }
  Math.hypot(u.vx, u.vy) >= Tv ? (u.isSupersonic || Me.playSupersonicBoom(), u.isSupersonic = !0, u.supersonicTimer += f, Math.random() < .6 && r.newParticles.push({ id: ++On, x: u.x - Math.cos(u.angle) * 20, y: u.y - Math.sin(u.angle) * 20, vx: u.vx * .1, vy: u.vy * .1, life: .28, maxLife: .28, color: "#ffffff", size: 3.5, type: "supersonic" })) : (u.isSupersonic = !1, u.supersonicTimer = 0);
  u.x += u.vx * f, u.y += u.vy * f;
}

function wv_legacy(u: any) {
  wv(u);
}

function sc_legacy(u: any, f: any, r: any, s: any) {
  sc(u, f, r, s);
}

function Dv_legacy(u: any, f: any, r: any) {
  const Ph = LEGACY_PHYSICS.Ph, Uh = LEGACY_PHYSICS.Uh, Hh = LEGACY_PHYSICS.Hh;
  
  u.spin += (u.vx / u.radius) * f;
  u.touchEffectTimer > 0 && (u.touchEffectTimer -= f);
  u.trail = u.trail || [];
  u.trail.push({ x: u.x, y: u.y, vx: u.vx, vy: u.vy, time: Date.now() });
  const _maxTr = Math.hypot(u.vx, u.vy) > 1100 ? 30 : 20;
  u.trail.length > _maxTr && u.trail.splice(0, u.trail.length - _maxTr);

  const substeps = 2;
  const subF = f / substeps;
  for (let step = 0; step < substeps; step++) {
    u.vy += Ph * subF;
    u.vx *= Math.pow(Uh, subF * 60);
    u.vy *= Math.pow(Uh, subF * 60);
    u.x += u.vx * subF;
    u.y += u.vy * subF;

    // 1. The 4 Corner Curves (Radius F)
    wv(u, 0.75);

    if (activeMapDef.goalType === "floor") {
      const inBluePitX = u.x > le.xMin! && u.x < le.xMax!;
      const inOrangePitX = u.x > ae.xMin! && u.x < ae.xMax!;
      if (!inBluePitX && !inOrangePitX) {
        if (u.x >= At + F && u.x <= Mt - F && u.y + u.radius >= k) {
          u.y = k - u.radius;
          if (u.vy > 0) {
            u.vy = -u.vy * 0.76;
            if (Math.abs(u.vy) < 25) u.vy = 0;
          }
          u.vx *= 0.94;
        }
      } else {
        const pit = inBluePitX ? le : ae;
        if (u.y + u.radius >= k) {
          if (u.y + u.radius >= k + pit.depth) {
            u.y = k + pit.depth - u.radius;
            if (u.vy > 0) u.vy = -u.vy * 0.35;
          }
          if (u.y > k) {
            if (u.x - u.radius <= pit.xMin!) {
              u.x = pit.xMin! + u.radius;
              if (u.vx < 0) u.vx = -u.vx * 0.35;
            }
            if (u.x + u.radius >= pit.xMax!) {
              u.x = pit.xMax! - u.radius;
              if (u.vx > 0) u.vx = -u.vx * 0.35;
            }
          }
        }
      }
      if (u.x >= At + F && u.x <= Mt - F && u.y - u.radius <= Qt) {
        u.y = Qt + u.radius;
        if (u.vy < 0) u.vy = -u.vy * 0.76;
      }
      if (u.y >= Qt + F && u.y <= k - F && u.x - u.radius <= At) {
        u.x = At + u.radius;
        if (u.vx < 0) u.vx = -u.vx * 0.8;
      }
      if (u.y >= Qt + F && u.y <= k - F && u.x + u.radius >= Mt) {
        u.x = Mt - u.radius;
        if (u.vx > 0) u.vx = -u.vx * 0.8;
      }

    } else if (activeMapDef.goalType === "ceiling") {
      const inBlueVaultX = u.x > le.xMin! && u.x < le.xMax!;
      const inOrangeVaultX = u.x > ae.xMin! && u.x < ae.xMax!;
      if (!inBlueVaultX && !inOrangeVaultX) {
        if (u.x >= At + F && u.x <= Mt - F && u.y - u.radius <= Qt) {
          u.y = Qt + u.radius;
          if (u.vy < 0) u.vy = -u.vy * 0.76;
        }
      } else {
        const vault = inBlueVaultX ? le : ae;
        if (u.y - u.radius <= Qt) {
          if (u.y - u.radius <= Qt - vault.depth) {
            u.y = Qt - vault.depth + u.radius;
            if (u.vy < 0) u.vy = -u.vy * 0.35;
          }
          if (u.y < Qt) {
            if (u.x - u.radius <= vault.xMin!) {
              u.x = vault.xMin! + u.radius;
              if (u.vx < 0) u.vx = -u.vx * 0.35;
            }
            if (u.x + u.radius >= vault.xMax!) {
              u.x = vault.xMax! - u.radius;
              if (u.vx > 0) u.vx = -u.vx * 0.35;
            }
          }
        }
      }
      if (u.x >= At + F && u.x <= Mt - F && u.y + u.radius >= k) {
        u.y = k - u.radius;
        if (u.vy > 0) {
          u.vy = -u.vy * 0.76;
          if (Math.abs(u.vy) < 25) u.vy = 0;
        }
        u.vx *= 0.94;
      }
      if (u.y >= Qt + F && u.y <= k - F && u.x - u.radius <= At) {
        u.x = At + u.radius;
        if (u.vx < 0) u.vx = -u.vx * 0.8;
      }
      if (u.y >= Qt + F && u.y <= k - F && u.x + u.radius >= Mt) {
        u.x = Mt - u.radius;
        if (u.vx > 0) u.vx = -u.vx * 0.8;
      }

    } else {
      // 2. Flat Floor (between At + F and Mt - F)
      if (u.x >= At + F && u.x <= Mt - F && u.y + u.radius >= k) {
        u.y = k - u.radius;
        if (u.vy > 0) {
          u.vy = -u.vy * 0.76;
          if (Math.abs(u.vy) < 25) u.vy = 0;
        }
        u.vx *= 0.94;
      }

      // 3. Flat Ceiling (between At + F and Mt - F)
      if (u.x >= At + F && u.x <= Mt - F && u.y - u.radius <= Qt) {
        u.y = Qt + u.radius;
        if (u.vy < 0) u.vy = -u.vy * 0.76;
      }

      // 4. Arena Vertical Walls & Goals
      const inBM = u.y > le.yMin! && u.y < le.yMax!;
      const inOM = u.y > ae.yMin! && u.y < ae.yMax!;

      // Left Wall (vertical section between Qt + F and k - F)
      if (!inBM && u.y >= Qt + F && u.y <= k - F) {
        if (u.x - u.radius <= At) {
          u.x = At + u.radius;
          if (u.vx < 0) {
            u.vx = -u.vx * 0.8;
            if (u.y < le.yMin!) {
              u.backboardRebound = { time: Date.now(), targetTeam: "blue", player: u.lastTouchPlayer };
              if (u.lastTouchTeam === "blue") {
                u.psychoCandidate = { time: Date.now(), player: u.lastTouchPlayer, team: "blue", wall: "blue", sourceWall: "blue" };
              }
            }
          }
        }
      }

      // Right Wall (vertical section between Qt + F and k - F)
      if (!inOM && u.y >= Qt + F && u.y <= k - F) {
        if (u.x + u.radius >= Mt) {
          u.x = Mt - u.radius;
          if (u.vx > 0) {
            u.vx = -u.vx * 0.8;
            if (u.y < ae.yMin!) {
              u.backboardRebound = { time: Date.now(), targetTeam: "orange", player: u.lastTouchPlayer };
              if (u.lastTouchTeam === "orange") {
                u.psychoCandidate = { time: Date.now(), player: u.lastTouchPlayer, team: "orange", wall: "orange", sourceWall: "orange" };
              }
            }
          }
        }
      }

      // Inside Blue Goal Net (only inside goal mouth yMin to yMax)
      if (u.x < At && inBM) {
        if (u.x - u.radius <= At - le.depth) { u.x = At - le.depth + u.radius; u.vx = -u.vx * 0.35; }
        if (u.y - u.radius <= le.yMin!) { u.y = le.yMin! + u.radius; u.vy = Math.abs(u.vy) * 0.35; }
        if (u.y + u.radius >= le.yMax!) { u.y = le.yMax! - u.radius; u.vy = -Math.abs(u.vy) * 0.35; }
        if (u.x + u.radius >= At) { u.x = At - u.radius; u.vx = -Math.abs(u.vx) * 0.5; }
      }

      // Inside Orange Goal Net (only inside goal mouth yMin to yMax)
      if (u.x > Mt && inOM) {
        if (u.x + u.radius >= Mt + ae.depth) { u.x = Mt + ae.depth - u.radius; u.vx = -u.vx * 0.35; }
        if (u.y - u.radius <= ae.yMin!) { u.y = ae.yMin! + u.radius; u.vy = Math.abs(u.vy) * 0.35; }
        if (u.y + u.radius >= ae.yMax!) { u.y = ae.yMax! - u.radius; u.vy = -Math.abs(u.vy) * 0.35; }
        if (u.x - u.radius <= Mt) { u.x = Mt + u.radius; u.vx = Math.abs(u.vx) * 0.5; }
      }

      // Goal posts
      const bluePostX = At - POST_INSET;
      const orangePostX = Mt + POST_INSET;
      sc(u, bluePostX, le.yMin!, r);
      sc(u, bluePostX, le.yMax!, r);
      sc(u, orangePostX, ae.yMin!, r);
      sc(u, orangePostX, ae.yMax!, r);
    }

    const spd = Math.hypot(u.vx, u.vy);
    if (spd > Hh) { const g = Hh / spd; u.vx *= g; u.vy *= g; }
  }
}

function checkAndEmitSave(u: any, f: any, prevVx: number, prevVy: number, s: any, prevTouchTeam?: string | null) {
  const _now = Date.now();
  if (_now - (u._lastSaveTime || 0) < 1200) return;

  const currentMap = activeMapDef || MAP_DEFINITIONS.standard;
  const isBlue = u.team === "blue";
  const ownGoal = isBlue ? currentMap.le : currentMap.ae;
  const ownNetX = ownGoal.x ?? (isBlue ? currentMap.At : currentMap.Mt);
  const goalYMin = ownGoal.yMin ?? 380;
  const goalYMax = ownGoal.yMax ?? 680;

  const isHeadingToOwnNet = isBlue ? prevVx < -15 : prevVx > 15;
  const distToGoalX = Math.abs(f.x - ownNetX);
  const inDefensiveZone = distToGoalX < 440;
  const inGoalVerticalSpan = f.y >= goalYMin - 75 && f.y <= goalYMax + 75;

  const isClearedAway = isBlue ? f.vx > 5 : f.vx < -5;
  const isStoppedAtLine = distToGoalX < 240 && (isBlue ? f.vx >= -8 : f.vx <= 8);

  const isThreat = isHeadingToOwnNet && inDefensiveZone && inGoalVerticalSpan;

  if (isThreat && (isClearedAway || isStoppedAtLine)) {
    u._lastSaveTime = _now;
    const isEpic = distToGoalX < 155;
    const saveType = isEpic ? "epic_save" : "save";
    const saveText = isEpic ? "🏆 EPIC SAVE!" : "🛡️ SAVE!";
    const saveColor = isEpic ? "#facc15" : "#38bdf8";

    u.saves = (u.saves || 0) + 1;
    u.score = (u.score || 0) + (isEpic ? 75 : 50);

    Me.playSave(isEpic);
    emitMechanicEvent(s, u, {
      type: saveType,
      text: saveText,
      color: saveColor,
      speedKmh: Math.round(Math.hypot(f.vx, f.vy) * SPEED_KMH_RATIO)
    });
  }
}

function Uv_legacy(u: any, f: any, r: number, s: any) {
  const _now = Date.now(), prevVx = f.vx, prevVy = f.vy;
  const y = Math.cos(u.angle), m = Math.sin(u.angle), g = f.x - u.x, p = f.y - u.y, A = g * y + p * m;
  const isMirrored = u.isGrounded && (u.facing === -1 || (u.surfaceType === "floor" && Math.cos(u.angle) < -0.5));
  const lateralSign = (isMirrored ? -1 : 1) * (u.airRollInverted ? -1 : 1);
  const C = (-g * m + p * y) * lateralSign, z = u.width / 2, N = u.height / 2, D = Math.max(-z, Math.min(z, A)), X = Math.max(-N, Math.min(N, C)), tt = A - D, I = C - X, U = Math.hypot(tt, I);
  if (U < f.radius) {
    const Tt = f.radius - (U || .001);
    let at = tt / (U || 1), Ht = I / (U || 1);
    U === 0 && (at = 0, Ht = -1);
    const ot = at * y - Ht * m * lateralSign, Lt = at * m + Ht * y * lateralSign;
    f.x += ot * Tt, f.y += Lt * Tt;
    const Ft = A > z * .5, dt = Ht < -.45 && Math.abs(A) < z * 1.25;
    const isFront = at > .45 || (A > z * .5);
    const isRear = at < -.45 || (A < -z * .5);
    const wbLimit = (u.wheelbase || 18) + 2.5;
    const isWheelsStrict = Ht >= 0.82 && Math.abs(A) <= wbLimit && C >= N - 2.5 && !isFront && !dt && !isRear;
    let Gt = 1.25;
    if (Ft) {
      Gt = 1.6;
    } else if (isWheelsStrict) {
      Gt = .85;
      u.jumpCount = 0;
      u.flipWindowTimer = 0;
      u.canJump = !0;
      if (!u.isGrounded && !u.hasFlipReset) {
        u.hasFlipReset = !0;
        Me.playFlipReset && Me.playFlipReset();
        emitMechanicEvent(s, u, { type: "flip_reset", text: "⭐ FLIP RESET", color: "#f59e0b" });
      }
    } else if (dt) {
      Gt = 1.05;
    }

    if (u.isCeilingDrop && (isFront || dt || Math.abs(A) > 10)) {
      Me.playCeilingShot && Me.playCeilingShot();
      emitMechanicEvent(s, u, { type: "ceiling_shot", text: "🌌 CEILING SHOT", color: "#a855f7" });
      u.isCeilingDrop = false;
    }

    const rollMult = u.airRollInverted ? -1 : 1;
    const downY = Math.cos(u.angle) * rollMult;
    const isTurtleShot = downY < -0.7 && u.y >= k - (u.height || 28) - 15;
    if (isTurtleShot && !u.isGrounded) {
      Me.playTurtle && Me.playTurtle();
      emitMechanicEvent(s, u, { type: "turtle", text: "🐢 TURTLE SHOT", color: "#10b981" });
    }

    if (f.lastTouchPlayer && f.lastTouchTeam !== u.team && _now - (f.lastTouchTime || 0) < 180 && isFront) {
      Me.playDunk && Me.playDunk();
      emitMechanicEvent(s, u, { type: "dunk", text: "💥 50/50 DUNK!", color: "#f59e0b" });
    }

    const isDoomsee = !u.isGrounded && u.vy > 0 && f.vy > 40 && (u.team === "blue" ? (f.x > Mt - 90 && u.x > Mt - 130) : (f.x < At + 90 && u.x < At + 130)) && f.y < (u.team === "blue" ? ae.yMin : le.yMin) + 40;
    if (isDoomsee) {
      emitMechanicEvent(s, u, { type: "doomsee", text: "🍽️ DOOMSEE DISH", color: "#06b6d4" });
    }

    const ht = f.vx - u.vx, ne = f.vy - u.vy, Yt = ht * ot + ne * Lt;
    if (Yt < 0) {
      const Te = -(1 + Gt) * Yt;
      f.vx += ot * Te, f.vy += Lt * Te;
      const re = u.vx * y + u.vy * m;
      if (re > 150 && Ft && (f.vx += y * (re * .45), f.vy += m * (re * .45)), Ft && f.y > k - 110) {
        const bt = Math.max(0, re), ut = Math.min(680, Math.max(280, bt * .52 + Math.abs(Yt) * .38));
        f.vy = Math.min(f.vy, -ut);
      }
      const Xt = Math.abs(f.x - Kt / 2) < 220, B = f.y > k - 90;
      Xt && B && (Math.abs(f.vx) > 700 && (f.vx = Math.sign(f.vx) * 700), f.vy > -180 && (f.vy = -Math.min(480, Math.abs(Yt) * .7 + 220)));
      const _isMusty = (Math.cos(u.angle) < -.15 && Math.abs(Math.sin(u.angle)) > .25 || Math.abs(u.angle) > 1.75) && u.isFlipping && !u.isGrounded && f.y < u.y + 15;
      if (_isMusty) {
        const _flDir = u.team === "blue" ? 1 : -1;
        f.vx = _flDir * Math.max(Math.abs(f.vx) + 550, 950), f.vy = -Math.max(Math.abs(f.vy) + 380, 550), f.spin += _flDir * 25;
        const isBreezi = !!u.airRollInverted;
        Me.playMustyFlick();
        emitMechanicEvent(s, u, { type: isBreezi ? "breezi" : "musty", text: isBreezi ? "🌪️ BREEZI FLICK" : "⚡ MUSTY FLICK", color: isBreezi ? "#d946ef" : "#a855f7" });
        for (let _i = 0; _i < 14; _i++) s.newParticles.push({ id: ++On, x: f.x, y: f.y, vx: _flDir * 300 + (Math.random() - .5) * 200, vy: -280 + (Math.random() - .5) * 200, life: .38, maxLife: .38, color: isBreezi ? "#e879f9" : "#c084fc", size: 5, type: "spark" });
      }
      const _dLeft = f.x - At - f.radius, _dRight = Mt - f.x - f.radius, _dFloor = k - f.y - f.radius, _dCeil = f.y - Qt - f.radius;
      const isLeftSolidWall = (f.y < le.yMin - 10 || f.y > le.yMax + 10);
      const isRightSolidWall = (f.y < ae.yMin - 10 || f.y > ae.yMax + 10);
      const _carSpd = Math.hypot(u.vx, u.vy), _isPinchImpact = _carSpd > 220 || Math.abs(Yt) > 180;
      let _pType: string | null = null, _pVx = 0, _pVy = 0, _isKuxir = false;
      if (_dLeft < 44 && isLeftSolidWall && u.vx < -120 && _isPinchImpact) {
        _pType = "wall";
        _isKuxir = u.team === "blue";
        const pinchSpd = Math.min(1480, Math.max(1150, (_carSpd + Math.abs(Yt)) * 1.35 + 460));
        _pVx = pinchSpd * 0.94;
        const targetNetY = (ae.yMin + ae.yMax) / 2;
        _pVy = Math.max(-420, Math.min(420, (targetNetY - f.y) * 0.42 + u.vy * 0.25));
      } else if (_dRight < 44 && isRightSolidWall && u.vx > 120 && _isPinchImpact) {
        _pType = "wall";
        _isKuxir = u.team === "orange";
        const pinchSpd = Math.min(1480, Math.max(1150, (_carSpd + Math.abs(Yt)) * 1.35 + 460));
        _pVx = -pinchSpd * 0.94;
        const targetNetY = (le.yMin + le.yMax) / 2;
        _pVy = Math.max(-420, Math.min(420, (targetNetY - f.y) * 0.42 + u.vy * 0.25));
      } else if (_dFloor < 45 && u.vy > 150 && _isPinchImpact) {
        _pType = "ground";
        const pinchSpd = Math.min(1420, Math.max(1100, (_carSpd + Math.abs(Yt)) * 1.3 + 420));
        _pVx = (u.vx >= 0 ? 1 : -1) * pinchSpd * 0.93;
        _pVy = -pinchSpd * 0.34;
      } else if (_dCeil < 45 && u.vy < -140 && _isPinchImpact) {
        _pType = "ceiling";
        const pinchSpd = Math.min(1420, Math.max(1100, (_carSpd + Math.abs(Yt)) * 1.3 + 420));
        _pVx = (u.vx >= 0 ? 1 : -1) * pinchSpd * 0.92;
        _pVy = pinchSpd * 0.36;
      }
      if (_pType) {
        f.vx = _pVx, f.vy = _pVy, f.touchEffectTimer = .4;
        const spdClamp = Math.hypot(f.vx, f.vy);
        if (spdClamp > Hh) { const g = Hh / spdClamp; f.vx *= g; f.vy *= g; }
        const _kmh = Math.round(Math.hypot(f.vx, f.vy) * SPEED_KMH_RATIO);
        Me.playPinch();
        const pinchText = _pType === "wall" ? (_isKuxir ? "💥 KUXIR PINCH" : "💥 WALL PINCH") : (_pType === "ground" ? "💥 GROUND PINCH" : "💥 CEILING PINCH");
        emitMechanicEvent(s, u, { type: "pinch", text: pinchText + " (" + _kmh + " KM/H)", color: "#f43f5e", speedKmh: _kmh });
        for (let _i = 0; _i < 24; _i++) {
          const _ang = Math.random() * Math.PI * 2, _sp = 200 + Math.random() * 380;
          s.newParticles.push({ id: ++On, x: f.x, y: f.y, vx: Math.cos(_ang) * _sp, vy: Math.sin(_ang) * _sp, life: .42, maxLife: .42, color: _i % 2 === 0 ? "#f43f5e" : "#fb7185", size: 5, type: "spark" });
        }
      }
      if (!u.isGrounded && f.y < k - 120) {
        _now - (u.lastAirTouchTime || 0) < 1600 ? (u.airTouches = (u.airTouches || 0) + 1, (u.airTouches === 3 || u.airTouches === 5) && emitMechanicEvent(s, u, { type: "air_dribble", text: "🌀 AIR DRIBBLE (" + u.airTouches + "x)", color: "#06b6d4" })) : u.airTouches = 1, u.lastAirTouchTime = _now;
        if (f.backboardRebound && _now - f.backboardRebound.time < 2800 && (f.backboardRebound.player === u.name || f.backboardRebound.targetTeam !== u.team)) {
          Me.playDoubleTap(), emitMechanicEvent(s, u, { type: "double_tap", text: "🎯 DOUBLE TAP", color: "#22c55e" }), f.backboardRebound = null;
        }
        if (f.psychoCandidate && _now - f.psychoCandidate.time < 4500 && !u.isGrounded) {
          const isOwnHalf = u.team === "blue" ? u.x < Kt * 0.52 : u.x > Kt * 0.48;
          const isCorrectWall = f.psychoCandidate.sourceWall === u.team;
          if (isOwnHalf && isCorrectWall) {
            const oppGoalX = u.team === "blue" ? Mt : At;
            const oppGoalY = (ae.yMin + ae.yMax) / 2;
            const shootAng = Math.atan2(oppGoalY - f.y, oppGoalX - f.x);
            const pSpd = Math.min(1420, Math.max(1180, Math.hypot(u.vx, u.vy) * 1.25 + 750));
            f.vx = Math.cos(shootAng) * pSpd;
            f.vy = Math.sin(shootAng) * pSpd * 0.85;
            const spdClamp = Math.hypot(f.vx, f.vy);
            if (spdClamp > Hh) { const g = Hh / spdClamp; f.vx *= g; f.vy *= g; }
            const pKmh = Math.round(Math.hypot(f.vx, f.vy) * SPEED_KMH_RATIO);
            Me.playPsycho();
            emitMechanicEvent(s, u, { type: "psycho", text: "🔮 PSYCHO REDIRECT (" + pKmh + " KM/H)", color: "#ec4899", speedKmh: pKmh });
            f.psychoGoal = { team: u.team, player: u.name, time: _now, speedKmh: pKmh };
            f.psychoCandidate = null;
          }
        }
      } else u.isGrounded && (u.airTouches = 0);
      const prevTouchTeam = f.lastTouchTeam;
      u.vx -= ot * Te * .15, u.vy -= Lt * Te * .15, f.lastTouchTeam = u.team, f.lastTouchPlayer = u.name, f.lastTouchTime = Date.now(), f.touchEffectTimer = .2;
      u.score = (u.score || 0) + 2;
      const isHeadingToOppGoal = u.team === "blue" ? f.vx > 100 : f.vx < -100;
      if (isHeadingToOppGoal) {
        u.shots = (u.shots || 0) + 1;
        u.score = (u.score || 0) + 15;
      }
      checkAndEmitSave(u, f, prevVx, prevVy, s, prevTouchTeam);
      const W = Math.hypot(f.vx, f.vy) / 500;
      Me.playBallHit(W);
      const $ = u.team === "blue" ? "#38bdf8" : "#f97316";
      for (let bt = 0; bt < 10; bt++)s.newParticles.push({ id: ++On, x: f.x - ot * f.radius * .8, y: f.y - Lt * f.radius * .8, vx: ot * 200 + (Math.random() - .5) * 160, vy: Lt * 200 + (Math.random() - .5) * 160, life: .3, maxLife: .3, color: $, size: 4 + Math.random() * 4, type: "spark" });
    }
  }
}

function jv(u: any, f: any, r: any, s: any, y = !1, physicsMode = "rocket_league") {
  const m = { goalScored: null, demoEvents: [], newParticles: [], mechanicEvents: [], boostPickups: [] };
  if (y || s <= 0) return m;
  const isLegacy = (physicsMode || activePhysicsMode) === "legacy";
  if (physicsMode && physicsMode !== activePhysicsMode) {
    syncPhysicsGlobals(physicsMode);
  }
  const g = Math.min(s, .033);
  for (const p of r) p.active || (p.cooldownTimer -= g, p.cooldownTimer <= 0 && (p.active = !0, p.cooldownTimer = 0));
  for (const p of u) {
    if (p.isDemoed) {
      p.demoRespawnTimer -= g, p.demoRespawnTimer <= 0 && Gv(p);
      continue;
    }
    if (isLegacy) {
      Cv_legacy(p, g, m);
    } else {
      Cv(p, g, m);
    }
    Bv(p, r, m);
  }
  if (isLegacy) {
    Dv_legacy(f, g, m);
  } else {
    Dv(f, g, m);
  }
  for (const p of u) {
    if (!p.isDemoed) {
      if (isLegacy) {
        Uv_legacy(p, f, g, m);
      } else {
        Uv(p, f, g, m);
      }
    }
  }
  for (let p = 0; p < u.length; p++) {
    for (let A = p + 1; A < u.length; A++) {
      const C = u[p], z = u[A];
      !C.isDemoed && !z.isDemoed && Hv(C, z, m);
    }
  }
  return qv(f, m), m;
}
function Cv(u: any, f: number, r: any) {
  if (u.isFlipping && (u.flipTimer += f, u.angle += (u.flipDirection.x >= 0 ? 1 : -1) * (Math.PI * 2 / qh) * f, u.flipTimer >= qh && (u.isFlipping = !1, u.flipTimer = 0)), u.jumpCount === 1 && !u.isGrounded && !u.hasFlipReset && (u.flipWindowTimer += f), Rv(u), u.isGrounded) {
    if (u.isFlipping && u.flipTimer < .3) {
      u.isFlipping = !1, u.flipTimer = 0, u.angle = 0;
      const _dashDir = u.flipDirection.x >= 0 ? 1 : -1;
      const _minSpeed = activePhysicsMode === 'legacy' ? 1280 : (RL_PHYSICS.wavedashMinSpeed || 1280);
      u.vx = _dashDir * Math.max(Math.abs(u.vx), _minSpeed), u.isSupersonic = !0, u.supersonicTimer = 1.2, Me.playWavedash(), emitMechanicEvent(r, u, { type: 'wavedash', text: '⚡ WAVEDASH', color: '#38bdf8' });
      for (let _k = 0; _k < 8; _k++)r.newParticles.push({ id: ++On, x: u.x + (Math.random() - .5) * u.width, y: u.y + u.height / 2, vx: -_dashDir * 200 + (Math.random() - .5) * 80, vy: -50 - Math.random() * 80, life: .25, maxLife: .25, color: '#fbbf24', size: 3, type: 'spark' });
    }
    u.jumpCount = 0, u.flipWindowTimer = 0, u.isFlipping = !1, u.hasFlipReset = !1;
    const g = u.surfaceNormal, p = { x: -g.y, y: g.x }, A = { x: g.y, y: -g.x }, C = p.x > .01 || Math.abs(p.x) <= .01 && p.y < 0 ? p : A, z = { x: -C.x, y: -C.y }, N = { x: Math.cos(u.angle), y: Math.sin(u.angle) };
    let X = N.x * C.x + N.y * C.y >= 0, tt = null, I = 0;
    if (u.input.steerRight && !u.input.steerLeft ? (X = !0, tt = C, I = ju) : u.input.steerLeft && !u.input.steerRight ? (X = !1, tt = z, I = ju) : (u.surfaceType === 'left_wall' || u.surfaceType === 'right_wall') && (u.input.throttleForward || u.input.pitchUp ? (tt = C, X = !0, I = ju) : (u.input.throttleReverse || u.input.pitchDown) && (tt = z, X = !1, I = ju)), !tt) {
      const U = X ? C : z;
      const revSpeed = activePhysicsMode === 'legacy' ? 1400 : (RL_PHYSICS.reverseDriveSpeed || 1400);
      u.input.throttleForward ? (tt = U, I = ju) : u.input.throttleReverse && (tt = U, I = -revSpeed);
    }
    if (tt && I !== 0) {
      u.vx += tt.x * I * f, u.vy += tt.y * I * f;
      const U = Math.atan2(tt.y, tt.x);
      u.angle = Lh(u.angle, U, 22 * f);
    } else {
      const U = X ? C : z, Tt = Math.atan2(U.y, U.x);
      u.angle = Lh(u.angle, Tt, 16 * f), u.vx *= Math.pow(wh, f * 60), u.vy *= Math.pow(wh, f * 60);
    }
    u.facing = Math.cos(u.angle) >= 0 ? 1 : -1;
    u.airRollInverted = false;
    u.input.jump && u.canJump && (u.canJump = !1, u.isGrounded = !1, u.jumpCount = 1, u.jumpHoldTimer = 0, u.surfaceType = 'air', u.vx += u.surfaceNormal.x * cc, u.vy += u.surfaceNormal.y * cc, u.facing = Math.cos(u.angle) >= 0 ? 1 : -1, u.airRollInverted = false, Me.playJump());
  } else {
    u.vy += pv * f, u.vx *= Math.pow(Dh, f * 60), u.vy *= Math.pow(Dh, f * 60);
    let g = 0;
    if (u.input.steerLeft || u.input.pitchUp) g -= 1;
    if (u.input.steerRight || u.input.pitchDown) g += 1;
    if (u.input.mouseAim && typeof u.input.mouseTargetAngle === "number" && !u.isFlipping) {
      u.angle = Lh(u.angle, u.input.mouseTargetAngle, Av * 3.5 * f);
      u.facing = Math.cos(u.angle) >= 0 ? 1 : -1;
    } else {
      u.isFlipping || (u.angle += g * Av * f);
      u.facing = Math.cos(u.angle) >= 0 ? 1 : -1;
    }
    if ((u.input.airRollLeft && !u._prevAirRollLeft) || (u.input.airRollRight && !u._prevAirRollRight)) {
      u.airRollInverted = !u.airRollInverted;
      Me.playAirRoll && Me.playAirRoll();
    }
    u._prevAirRollLeft = !!u.input.airRollLeft;
    u._prevAirRollRight = !!u.input.airRollRight;
    if (u.input.jump && u.jumpCount === 1 && u.jumpHoldTimer < Ev) {
      u.jumpHoldTimer += f;
      u.vy += -Gh * f;
    }
    if (u.input.jump && u.canJump && (u.jumpCount === 1 || u.jumpCount === 0 || u.hasFlipReset) && (u.flipWindowTimer < _v || u.jumpCount === 0 || u.hasFlipReset)) {
      u.canJump = !1, u.jumpCount = 2, u.hasFlipReset = !1;
      let A = 0, C = 0;
      if (u.input.steerRight || u.input.throttleForward) A += 1;
      if (u.input.steerLeft || u.input.throttleReverse) A -= 1;
      if (u.input.pitchUp) C -= 1;
      if (u.input.pitchDown) C += 1;
      if (A === 0 && C === 0 && u.input.mouseAim && typeof u.input.mouseTargetAngle === "number") {
        A = Math.cos(u.input.mouseTargetAngle);
        C = Math.sin(u.input.mouseTargetAngle);
      }
      if (A !== 0 || C !== 0) {
        const z = Math.hypot(A, C) || 1, N = A / z, D = C / z;
        u.vy *= .15, u.vx += N * Bh, u.vy += D * (Bh * .7), u.isFlipping = !0, u.flipTimer = 0, u.flipDirection = { x: N, y: D }, Me.playDodgeFlip();
        for (let X = 0; X < 8; X++)r.newParticles.push({ id: ++On, x: u.x, y: u.y, vx: -N * 300 + (Math.random() - .5) * 150, vy: -D * 300 + (Math.random() - .5) * 150, life: .35, maxLife: .35, color: '#38bdf8', size: 4 + Math.random() * 3, type: 'spark' });
      } else u.vy = Math.min(u.vy - cc * 1.05, -cc * 1.15), Me.playJump();
    }
  }
  if (u.input.jump || (u.canJump = !0), u.isBoosting = !1, u.input.boost && u.boost > 0) {
    u.isBoosting = !0, u.boost = Math.max(0, u.boost - Mv * f);
    const g = { x: Math.cos(u.angle), y: Math.sin(u.angle) }, p = !u.isGrounded, A = p ? Nv : Sv;
    u.vx += g.x * A * f, u.vy += g.y * A * f;
    const C = u.x - g.x * (u.width / 2), z = u.y - g.y * (u.width / 2), N = p ? 3 : 2;
    for (let D = 0; D < N; D++)r.newParticles.push({ id: ++On, x: C + (Math.random() - .5) * 6, y: z + (Math.random() - .5) * 6, vx: -g.x * (450 + Math.random() * 350) + (Math.random() - .5) * 90, vy: -g.y * (450 + Math.random() * 350) + (Math.random() - .5) * 90, life: p ? .3 : .25, maxLife: p ? .3 : .25, color: u.team === 'blue' ? Math.random() > .4 ? '#38bdf8' : '#60a5fa' : Math.random() > .4 ? '#f97316' : '#fbbf24', size: (p ? 6 : 5) + Math.random() * 4, type: 'boost' });
  }
  const s = Math.hypot(u.vx, u.vy), y = u.isBoosting ? bv : xv;
  if (s > y) {
    const g = y / s;
    u.vx *= g, u.vy *= g;
  }
  Math.hypot(u.vx, u.vy) >= Tv ? (u.isSupersonic || Me.playSupersonicBoom(), u.isSupersonic = !0, u.supersonicTimer += f, Math.random() < .6 && r.newParticles.push({ id: ++On, x: u.x - Math.cos(u.angle) * 20, y: u.y - Math.sin(u.angle) * 20, vx: u.vx * .1, vy: u.vy * .1, life: .28, maxLife: .28, color: '#ffffff', size: 3.5, type: 'supersonic' })) : (u.isSupersonic = !1, u.supersonicTimer = 0);
  u.x += u.vx * f, u.y += u.vy * f;
}

function Rv(u: any) {
  const f = u.height / 2;
  const wheelContact = f + 0.5; // 14.5px
  let s = false, y = { x: 0, y: -1 }, m = "air";

  if (activeMapDef.goalType === "floor") {
    // 1. FLOOR & FLOOR PITS (With escape ramps & smooth border transitions)
    const inBluePitX = u.x >= le.xMin! && u.x <= le.xMax!;
    const inOrangePitX = u.x >= ae.xMin! && u.x <= ae.xMax!;
    if (!inBluePitX && !inOrangePitX) {
      if (u.x >= At + F && u.x <= Mt - F && u.y + wheelContact >= k) {
        u.y = k - wheelContact;
        u.vy > 0 && (u.vy = 0);
        s = true;
        y = { x: 0, y: -1 };
        m = "floor";
      }
    } else {
      const pit = inBluePitX ? le : ae;
      const rampW = 75;
      const slope = pit.depth / rampW;
      const rampLen = Math.hypot(slope, 1);
      const nxLeft = -slope / rampLen, nyLeft = -1 / rampLen;
      const nxRight = slope / rampLen, nyRight = -1 / rampLen;

      let floorSurfaceY = k + pit.depth;
      let normX = 0, normY = -1;
      let isRamp = false;

      if (u.x < pit.xMin! + rampW) {
        const t = Math.max(0, Math.min(1, (u.x - pit.xMin!) / rampW));
        floorSurfaceY = k + pit.depth * t;
        normX = nxLeft; normY = nyLeft;
        isRamp = true;
      } else if (u.x > pit.xMax! - rampW) {
        const t = Math.max(0, Math.min(1, (pit.xMax! - u.x) / rampW));
        floorSurfaceY = k + pit.depth * t;
        normX = nxRight; normY = nyRight;
        isRamp = true;
      }

      if (u.y + wheelContact >= floorSurfaceY) {
        u.y = floorSurfaceY - wheelContact;
        s = true;
        y = { x: normX, y: normY };
        m = "floor";
        if (isRamp) {
          const vDotN = u.vx * normX + u.vy * normY;
          if (vDotN < 0) {
            u.vx -= vDotN * normX;
            u.vy -= vDotN * normY;
          }
        } else {
          u.vy > 0 && (u.vy = 0);
        }
      }
    }

    // 2. CEILING (Solid)
    if (u.x >= At + F && u.x <= Mt - F && u.y - wheelContact <= Qt) {
      u.y = Qt + wheelContact;
      if (u.vy < 0) u.vy = 0;
      const rollMult = u.airRollInverted ? -1 : 1;
      const downY = Math.cos(u.angle) * rollMult;
      const wheelsTouchCeiling = downY < -0.25 || (u.isGrounded && (u.surfaceType === "ceiling" || u.surfaceType === "curve"));
      if (wheelsTouchCeiling) {
        s = true;
        y = { x: 0, y: 1 };
        m = "ceiling";
      }
    }

    // 3. WALLS (Solid from ceiling to floor curves)
    if (u.y >= Qt + F && u.y <= k - F) {
      if (u.x - wheelContact <= At) {
        u.x = At + wheelContact;
        u.vx < 0 && (u.vx = 0);
        s = true;
        y = { x: 1, y: 0 };
        m = "left_wall";
      }
      if (u.x + wheelContact >= Mt) {
        u.x = Mt - wheelContact;
        u.vx > 0 && (u.vx = 0);
        s = true;
        y = { x: -1, y: 0 };
        m = "right_wall";
      }
    }

  } else if (activeMapDef.goalType === "ceiling") {
    // 1. FLOOR (Solid across entire pitch from At + F to Mt - F)
    if (u.x >= At + F && u.x <= Mt - F && u.y + wheelContact >= k) {
      u.y = k - wheelContact;
      u.vy > 0 && (u.vy = 0);
      s = true;
      y = { x: 0, y: -1 };
      m = "floor";
    }

    // 2. CEILING & SKY VAULTS (With smooth escape ramps)
    const inBlueVaultX = u.x >= le.xMin! && u.x <= le.xMax!;
    const inOrangeVaultX = u.x >= ae.xMin! && u.x <= ae.xMax!;
    if (!inBlueVaultX && !inOrangeVaultX) {
      if (u.x >= At + F && u.x <= Mt - F && u.y - wheelContact <= Qt) {
        u.y = Qt + wheelContact;
        if (u.vy < 0) u.vy = 0;
        const rollMult = u.airRollInverted ? -1 : 1;
        const downY = Math.cos(u.angle) * rollMult;
        const wheelsTouchCeiling = downY < -0.25 || (u.isGrounded && (u.surfaceType === "ceiling" || u.surfaceType === "curve"));
        if (wheelsTouchCeiling) {
          s = true;
          y = { x: 0, y: 1 };
          m = "ceiling";
        }
      }
    } else {
      const vault = inBlueVaultX ? le : ae;
      const rampW = 75;
      const slope = vault.depth / rampW;
      const rampLen = Math.hypot(slope, 1);
      const nxLeft = -slope / rampLen, nyLeft = 1 / rampLen;
      const nxRight = slope / rampLen, nyRight = 1 / rampLen;

      let ceilSurfaceY = Qt - vault.depth;
      let normX = 0, normY = 1;
      let isRamp = false;

      if (u.x < vault.xMin! + rampW) {
        const t = Math.max(0, Math.min(1, (u.x - vault.xMin!) / rampW));
        ceilSurfaceY = Qt - vault.depth * t;
        normX = nxLeft; normY = nyLeft;
        isRamp = true;
      } else if (u.x > vault.xMax! - rampW) {
        const t = Math.max(0, Math.min(1, (vault.xMax! - u.x) / rampW));
        ceilSurfaceY = Qt - vault.depth * t;
        normX = nxRight; normY = nyRight;
        isRamp = true;
      }

      if (u.y - wheelContact <= ceilSurfaceY) {
        u.y = ceilSurfaceY + wheelContact;
        s = true;
        y = { x: normX, y: normY };
        m = "ceiling";
        if (isRamp) {
          const vDotN = u.vx * normX + u.vy * normY;
          if (vDotN < 0) {
            u.vx -= vDotN * normX;
            u.vy -= vDotN * normY;
          }
        } else {
          u.vy < 0 && (u.vy = 0);
        }
      }
    }

    // 3. WALLS (Solid from ceiling to floor curves)
    if (u.y >= Qt + F && u.y <= k - F) {
      if (u.x - wheelContact <= At) {
        u.x = At + wheelContact;
        u.vx < 0 && (u.vx = 0);
        s = true;
        y = { x: 1, y: 0 };
        m = "left_wall";
      }
      if (u.x + wheelContact >= Mt) {
        u.x = Mt - wheelContact;
        u.vx > 0 && (u.vx = 0);
        s = true;
        y = { x: -1, y: 0 };
        m = "right_wall";
      }
    }

  } else {
    // Wall and Elevated Goals (Standard, Big, Huge, Aerial Hoops)
    // 1. FLOOR: from (At + F) to (Mt - F)
    if (u.x >= At + F && u.x <= Mt - F && u.y + wheelContact >= k) {
      u.y = k - wheelContact;
      u.vy > 0 && (u.vy = 0);
      s = true;
      y = { x: 0, y: -1 };
      m = "floor";
    }

    // 2. CEILING: from (At + F) to (Mt - F)
    if (u.x >= At + F && u.x <= Mt - F && u.y - wheelContact <= Qt) {
      u.y = Qt + wheelContact;
      if (u.vy < 0) u.vy = 0;

      const rollMult = u.airRollInverted ? -1 : 1;
      const downY = Math.cos(u.angle) * rollMult;
      const wheelsTouchCeiling = downY < -0.25 || (u.isGrounded && (u.surfaceType === "ceiling" || u.surfaceType === "curve"));
      if (wheelsTouchCeiling) {
        s = true;
        y = { x: 0, y: 1 };
        m = "ceiling";
      }
    }

    // 3. MAIN ARENA WALLS & GOALS
    const inBlueGoalMouth = u.y > le.yMin! && u.y < le.yMax!;
    const inOrangeGoalMouth = u.y > ae.yMin! && u.y < ae.yMax!;

    // Left Wall: solid everywhere except inside open goal mouth
    if (!inBlueGoalMouth) {
      if (u.x - wheelContact <= At) {
        u.x = At + wheelContact;
        u.vx < 0 && (u.vx = 0);
        s = true;
        y = { x: 1, y: 0 };
        m = "left_wall";
      }
    } else {
      // Inside Blue Goal Net
      if (u.x < At) {
        if (u.x - wheelContact <= At - le.depth) {
          u.x = At - le.depth + wheelContact;
          u.vx < 0 && (u.vx = 0);
          s = true;
          y = { x: 1, y: 0 };
          m = "left_wall";
        }
        if (u.y - wheelContact <= le.yMin!) {
          u.y = le.yMin! + wheelContact;
          if (u.vy < 0) u.vy = 0;
          s = true;
          y = { x: 0, y: 1 };
          m = "ceiling";
        }
        if (u.y + wheelContact >= le.yMax!) {
          u.y = le.yMax! - wheelContact;
          u.vy > 0 && (u.vy = 0);
          s = true;
          y = { x: 0, y: -1 };
          m = "floor";
        }
      }
    }

    // Right Wall: solid everywhere except inside open goal mouth
    if (!inOrangeGoalMouth) {
      if (u.x + wheelContact >= Mt) {
        u.x = Mt - wheelContact;
        u.vx > 0 && (u.vx = 0);
        s = true;
        y = { x: -1, y: 0 };
        m = "right_wall";
      }
    } else {
      // Inside Orange Goal Net
      if (u.x > Mt) {
        if (u.x + wheelContact >= Mt + ae.depth) {
          u.x = Mt + ae.depth - wheelContact;
          u.vx > 0 && (u.vx = 0);
          s = true;
          y = { x: -1, y: 0 };
          m = "right_wall";
        }
        if (u.y - wheelContact <= ae.yMin!) {
          u.y = ae.yMin! + wheelContact;
          if (u.vy < 0) u.vy = 0;
          s = true;
          y = { x: 0, y: 1 };
          m = "ceiling";
        }
        if (u.y + wheelContact >= ae.yMax!) {
          u.y = ae.yMax! - wheelContact;
          u.vy > 0 && (u.vy = 0);
          s = true;
          y = { x: 0, y: -1 };
          m = "floor";
        }
      }
    }

    const bluePostX = At - POST_INSET;
    const orangePostX = Mt + POST_INSET;
    fc(u, bluePostX, le.yMin!);
    fc(u, bluePostX, le.yMax!);
    fc(u, orangePostX, ae.yMin!);
    fc(u, orangePostX, ae.yMax!);
  }

  // Corner curves (Radius F)
  const contactR = F - wheelContact;
  const curveAdhere = (u.surfaceType === "curve" && u.isGrounded) ? 8 : 0;

  // Bottom-Left Curve: center (At + F, k - F)
  const blA = At + F, blC = k - F;
  if (u.x < blA && u.y > blC) {
    const U = u.x - blA, Tt = u.y - blC, at = Math.hypot(U, Tt);
    if (at >= contactR - curveAdhere && at > 0) {
      const Ht = -U / at, ot = -Tt / at;
      u.x = blA + (U / at) * contactR;
      u.y = blC + (Tt / at) * contactR;
      s = true;
      y = { x: Ht, y: ot };
      m = "curve";
      const vDotN = u.vx * Ht + u.vy * ot;
      if (vDotN < 0) {
        u.vx -= vDotN * Ht;
        u.vy -= vDotN * ot;
      }
    }
  }

  // Bottom-Right Curve: center (Mt - F, k - F)
  const brA = Mt - F, brC = k - F;
  if (u.x > brA && u.y > brC) {
    const U = u.x - brA, Tt = u.y - brC, at = Math.hypot(U, Tt);
    if (at >= contactR - curveAdhere && at > 0) {
      const Ht = -U / at, ot = -Tt / at;
      u.x = brA + (U / at) * contactR;
      u.y = brC + (Tt / at) * contactR;
      s = true;
      y = { x: Ht, y: ot };
      m = "curve";
      const vDotN = u.vx * Ht + u.vy * ot;
      if (vDotN < 0) {
        u.vx -= vDotN * Ht;
        u.vy -= vDotN * ot;
      }
    }
  }

  // Top-Left Curve: center (At + F, Qt + F)
  const tlA = At + F, tlC = Qt + F;
  if (u.x < tlA && u.y < tlC) {
    const U = u.x - tlA, Tt = u.y - tlC, at = Math.hypot(U, Tt);
    if (at >= contactR - curveAdhere && at > 0) {
      const Ht = -U / at, ot = -Tt / at;
      u.x = tlA + (U / at) * contactR;
      u.y = tlC + (Tt / at) * contactR;
      const rollMult = u.airRollInverted ? -1 : 1;
      const downX = -Math.sin(u.angle) * rollMult;
      const downY = Math.cos(u.angle) * rollMult;
      const wheelsTouch = u.isGrounded || (downX * (-Ht) + downY * (-ot) > 0.15);
      if (wheelsTouch) {
        s = true;
        y = { x: Ht, y: ot };
        m = "curve";
      }
      const vDotN = u.vx * Ht + u.vy * ot;
      if (vDotN < 0) {
        u.vx -= vDotN * Ht;
        u.vy -= vDotN * ot;
      }
    }
  }

  // Top-Right Curve: center (Mt - F, Qt + F)
  const trA = Mt - F, trC = Qt + F;
  if (u.x > trA && u.y < trC) {
    const U = u.x - trA, Tt = u.y - trC, at = Math.hypot(U, Tt);
    if (at >= contactR - curveAdhere && at > 0) {
      const Ht = -U / at, ot = -Tt / at;
      u.x = trA + (U / at) * contactR;
      u.y = trC + (Tt / at) * contactR;
      const rollMult = u.airRollInverted ? -1 : 1;
      const downX = -Math.sin(u.angle) * rollMult;
      const downY = Math.cos(u.angle) * rollMult;
      const wheelsTouch = u.isGrounded || (downX * (-Ht) + downY * (-ot) > 0.15);
      if (wheelsTouch) {
        s = true;
        y = { x: Ht, y: ot };
        m = "curve";
      }
      const vDotN = u.vx * Ht + u.vy * ot;
      if (vDotN < 0) {
        u.vx -= vDotN * Ht;
        u.vy -= vDotN * ot;
      }
    }
  }

  const wasCeiling = u.isGrounded && u.surfaceType === "ceiling";
  u.isGrounded = s;
  u.surfaceNormal = y;
  u.surfaceType = m;
  if (wasCeiling && !s && !u.isFlipping) {
    u.isCeilingDrop = true;
    u.canJump = true;
    u.jumpCount = 0;
    u.flipWindowTimer = 0;
  }
}

function fc(u:any,f:any,r:any){
  if(u.surfaceType==="left_wall"||u.surfaceType==="right_wall"||u.surfaceType==="curve")return;
  const s=u.x-f,y=u.y-r,m=Math.hypot(s,y),g=zn+u.height/2;
  if(m<g&&m>0){
    const p=s/m,A=y/m;
    u.x=f+p*g,u.y=r+A*g;
    const C=u.vx*p+u.vy*A;
    C<0&&(u.vx-=1.3*C*p,u.vy-=1.3*C*A,Me.playCrossbar())
  }
}
function Dv(u: any, f: any, r: any) {
  u.spin += (u.vx / u.radius) * f;
  u.touchEffectTimer > 0 && (u.touchEffectTimer -= f);
  u.trail = u.trail || [];
  u.trail.push({ x: u.x, y: u.y, vx: u.vx, vy: u.vy, time: Date.now() });
  const _maxTr = Math.hypot(u.vx, u.vy) > 800 ? 30 : 20;
  u.trail.length > _maxTr && u.trail.splice(0, u.trail.length - _maxTr);

  const substeps = 2;
  const subF = f / substeps;
  for (let step = 0; step < substeps; step++) {
    u.vy += Ph * subF;
    u.vx *= Math.pow(Uh, subF * 60);
    u.vy *= Math.pow(Uh, subF * 60);
    u.x += u.vx * subF;
    u.y += u.vy * subF;

    // 1. The 4 Corner Curves (Radius F)
    wv(u, 0.65);

    if (activeMapDef.goalType === "floor") {
      const inBluePitX = u.x >= le.xMin! && u.x <= le.xMax!;
      const inOrangePitX = u.x >= ae.xMin! && u.x <= ae.xMax!;
      if (!inBluePitX && !inOrangePitX) {
        if (u.x >= At + F && u.x <= Mt - F && u.y + u.radius >= k) {
          u.y = k - u.radius;
          if (u.vy > 0) {
            u.vy = -u.vy * 0.60;
            if (Math.abs(u.vy) < 25) u.vy = 0;
          }
          u.vx *= 0.96;
        }
      } else {
        const pit = inBluePitX ? le : ae;
        const rampW = 75;
        const slope = pit.depth / rampW;
        const rampLen = Math.hypot(slope, 1);
        const nxLeft = -slope / rampLen, nyLeft = -1 / rampLen;
        const nxRight = slope / rampLen, nyRight = -1 / rampLen;

        let floorSurfaceY = k + pit.depth;
        let normX = 0, normY = -1;
        let isRamp = false;

        if (u.x < pit.xMin! + rampW) {
          const t = Math.max(0, Math.min(1, (u.x - pit.xMin!) / rampW));
          floorSurfaceY = k + pit.depth * t;
          normX = nxLeft; normY = nyLeft;
          isRamp = true;
        } else if (u.x > pit.xMax! - rampW) {
          const t = Math.max(0, Math.min(1, (pit.xMax! - u.x) / rampW));
          floorSurfaceY = k + pit.depth * t;
          normX = nxRight; normY = nyRight;
          isRamp = true;
        }

        if (u.y + u.radius >= floorSurfaceY) {
          u.y = floorSurfaceY - u.radius;
          if (isRamp) {
            const vDotN = u.vx * normX + u.vy * normY;
            if (vDotN < 0) {
              u.vx -= (1 + 0.45) * vDotN * normX;
              u.vy -= (1 + 0.45) * vDotN * normY;
            }
          } else {
            if (u.vy > 0) u.vy = -u.vy * 0.35;
          }
        }
      }
      if (u.x >= At + F && u.x <= Mt - F && u.y - u.radius <= Qt) {
        u.y = Qt + u.radius;
        if (u.vy < 0) u.vy = -u.vy * 0.65;
      }
      if (u.y >= Qt + F && u.y <= k - F && u.x - u.radius <= At) {
        u.x = At + u.radius;
        if (u.vx < 0) u.vx = -u.vx * 0.65;
      }
      if (u.y >= Qt + F && u.y <= k - F && u.x + u.radius >= Mt) {
        u.x = Mt - u.radius;
        if (u.vx > 0) u.vx = -u.vx * 0.65;
      }

    } else if (activeMapDef.goalType === "ceiling") {
      const inBlueVaultX = u.x >= le.xMin! && u.x <= le.xMax!;
      const inOrangeVaultX = u.x >= ae.xMin! && u.x <= ae.xMax!;
      if (!inBlueVaultX && !inOrangeVaultX) {
        if (u.x >= At + F && u.x <= Mt - F && u.y - u.radius <= Qt) {
          u.y = Qt + u.radius;
          if (u.vy < 0) u.vy = -u.vy * 0.65;
        }
      } else {
        const vault = inBlueVaultX ? le : ae;
        const rampW = 75;
        const slope = vault.depth / rampW;
        const rampLen = Math.hypot(slope, 1);
        const nxLeft = -slope / rampLen, nyLeft = 1 / rampLen;
        const nxRight = slope / rampLen, nyRight = 1 / rampLen;

        let ceilSurfaceY = Qt - vault.depth;
        let normX = 0, normY = 1;
        let isRamp = false;

        if (u.x < vault.xMin! + rampW) {
          const t = Math.max(0, Math.min(1, (u.x - vault.xMin!) / rampW));
          ceilSurfaceY = Qt - vault.depth * t;
          normX = nxLeft; normY = nyLeft;
          isRamp = true;
        } else if (u.x > vault.xMax! - rampW) {
          const t = Math.max(0, Math.min(1, (vault.xMax! - u.x) / rampW));
          ceilSurfaceY = Qt - vault.depth * t;
          normX = nxRight; normY = nyRight;
          isRamp = true;
        }

        if (u.y - u.radius <= ceilSurfaceY) {
          u.y = ceilSurfaceY + u.radius;
          if (isRamp) {
            const vDotN = u.vx * normX + u.vy * normY;
            if (vDotN < 0) {
              u.vx -= (1 + 0.45) * vDotN * normX;
              u.vy -= (1 + 0.45) * vDotN * normY;
            }
          } else {
            if (u.vy < 0) u.vy = -u.vy * 0.35;
          }
        }
      }
      if (u.x >= At + F && u.x <= Mt - F && u.y + u.radius >= k) {
        u.y = k - u.radius;
        if (u.vy > 0) {
          u.vy = -u.vy * 0.60;
          if (Math.abs(u.vy) < 25) u.vy = 0;
        }
        u.vx *= 0.96;
      }
      if (u.y >= Qt + F && u.y <= k - F && u.x - u.radius <= At) {
        u.x = At + u.radius;
        if (u.vx < 0) u.vx = -u.vx * 0.65;
      }
      if (u.y >= Qt + F && u.y <= k - F && u.x + u.radius >= Mt) {
        u.x = Mt - u.radius;
        if (u.vx > 0) u.vx = -u.vx * 0.65;
      }

    } else {
      // 2. Flat Floor (between At + F and Mt - F)
      if (u.x >= At + F && u.x <= Mt - F && u.y + u.radius >= k) {
        u.y = k - u.radius;
        if (u.vy > 0) {
          u.vy = -u.vy * 0.60;
          if (Math.abs(u.vy) < 25) u.vy = 0;
        }
        u.vx *= 0.96;
      }

      // 3. Flat Ceiling (between At + F and Mt - F)
      if (u.x >= At + F && u.x <= Mt - F && u.y - u.radius <= Qt) {
        u.y = Qt + u.radius;
        if (u.vy < 0) u.vy = -u.vy * 0.65;
      }

      // 4. Arena Vertical Walls & Goals
      const inBM = u.y > le.yMin! && u.y < le.yMax!;
      const inOM = u.y > ae.yMin! && u.y < ae.yMax!;

      // Left Wall
      if (!inBM && u.y >= Qt + F && u.y <= k - F) {
        if (u.x - u.radius <= At) {
          u.x = At + u.radius;
          if (u.vx < 0) {
            u.vx = -u.vx * 0.65;
            if (u.y < le.yMin!) {
              u.backboardRebound = { time: Date.now(), targetTeam: "blue", player: u.lastTouchPlayer };
              if (u.lastTouchTeam === "blue") {
                u.psychoCandidate = { time: Date.now(), player: u.lastTouchPlayer, team: "blue", wall: "blue", sourceWall: "blue" };
              }
            }
          }
        }
      }

      // Right Wall
      if (!inOM && u.y >= Qt + F && u.y <= k - F) {
        if (u.x + u.radius >= Mt) {
          u.x = Mt - u.radius;
          if (u.vx > 0) {
            u.vx = -u.vx * 0.65;
            if (u.y < ae.yMin!) {
              u.backboardRebound = { time: Date.now(), targetTeam: "orange", player: u.lastTouchPlayer };
              if (u.lastTouchTeam === "orange") {
                u.psychoCandidate = { time: Date.now(), player: u.lastTouchPlayer, team: "orange", wall: "orange", sourceWall: "orange" };
              }
            }
          }
        }
      }

      // Inside Blue Goal Net
      if (u.x < At && inBM) {
        if (u.x - u.radius <= At - le.depth) { u.x = At - le.depth + u.radius; u.vx = -u.vx * 0.35; }
        if (u.y - u.radius <= le.yMin!) { u.y = le.yMin! + u.radius; u.vy = Math.abs(u.vy) * 0.35; }
        if (u.y + u.radius >= le.yMax!) { u.y = le.yMax! - u.radius; u.vy = -Math.abs(u.vy) * 0.35; }
        if (u.isGoalScored && u.x + u.radius >= At) { u.x = At - u.radius; u.vx = -Math.abs(u.vx) * 0.5; }
      }

      // Inside Orange Goal Net
      if (u.x > Mt && inOM) {
        if (u.x + u.radius >= Mt + ae.depth) { u.x = Mt + ae.depth - u.radius; u.vx = -u.vx * 0.35; }
        if (u.y - u.radius <= ae.yMin!) { u.y = ae.yMin! + u.radius; u.vy = Math.abs(u.vy) * 0.35; }
        if (u.y + u.radius >= ae.yMax!) { u.y = ae.yMax! - u.radius; u.vy = -Math.abs(u.vy) * 0.35; }
        if (u.isGoalScored && u.x - u.radius <= Mt) { u.x = Mt + u.radius; u.vx = Math.abs(u.vx) * 0.5; }
      }

      // Goal posts
      const bluePostX = At - POST_INSET;
      const orangePostX = Mt + POST_INSET;
      sc(u, bluePostX, le.yMin!, r);
      sc(u, bluePostX, le.yMax!, r);
      sc(u, orangePostX, ae.yMin!, r);
      sc(u, orangePostX, ae.yMax!, r);
    }

    const spd = Math.hypot(u.vx, u.vy);
    if (spd > Hh) { const g = Hh / spd; u.vx *= g; u.vy *= g; }
  }
}
function sc(u:any,f:any,r:any,s:any){
  const y=u.x-f,m=u.y-r,g=Math.hypot(y,m),p=zn+u.radius;
  if(g<p&&g>0){
    const A=y/g,C=m/g;
    u.x=f+A*p,u.y=r+C*p;
    const z=u.vx*A+u.vy*C;
    if(z<0){
      u.vx-=1.5*z*A,u.vy-=1.5*z*C,Me.playCrossbar();
      for(let N=0;N<6;N++)s.newParticles.push({id:++On,x:f+A*zn,y:r+C*zn,vx:A*150+(Math.random()-.5)*100,vy:C*150+(Math.random()-.5)*100,life:.25,maxLife:.25,color:"#facc15",size:3,type:"spark"})
    }
  }
}
function wv(u: any, bounce: number = 0.65) {
  const R_contact = F - u.radius; // F = 160, u.radius = 30 -> 130

  // 1. Top-Left Corner: center (At + F, Qt + F) = (280, 280)
  const tlX = At + F, tlY = Qt + F;
  if (u.x <= tlX && u.y <= tlY) {
    const dx = u.x - tlX, dy = u.y - tlY;
    const dist = Math.hypot(dx, dy);
    if (dist > R_contact && dist > 0) {
      const nx = -dx / dist, ny = -dy / dist;
      u.x = tlX - nx * R_contact;
      u.y = tlY - ny * R_contact;
      const vDotN = u.vx * nx + u.vy * ny;
      if (vDotN < 0) {
        u.vx -= (1 + bounce) * vDotN * nx;
        u.vy -= (1 + bounce) * vDotN * ny;
      }
    }
  }

  // 2. Top-Right Corner: center (Mt - F, Qt + F) = (1720, 280)
  const trX = Mt - F, trY = Qt + F;
  if (u.x >= trX && u.y <= trY) {
    const dx = u.x - trX, dy = u.y - trY;
    const dist = Math.hypot(dx, dy);
    if (dist > R_contact && dist > 0) {
      const nx = -dx / dist, ny = -dy / dist;
      u.x = trX - nx * R_contact;
      u.y = trY - ny * R_contact;
      const vDotN = u.vx * nx + u.vy * ny;
      if (vDotN < 0) {
        u.vx -= (1 + bounce) * vDotN * nx;
        u.vy -= (1 + bounce) * vDotN * ny;
      }
    }
  }

  // 3. Bottom-Left Corner: center (At + F, k - F) = (280, 790)
  const blX = At + F, blY = k - F;
  if (u.x <= blX && u.y >= blY) {
    const dx = u.x - blX, dy = u.y - blY;
    const dist = Math.hypot(dx, dy);
    if (dist > R_contact && dist > 0) {
      const nx = -dx / dist, ny = -dy / dist;
      u.x = blX - nx * R_contact;
      u.y = blY - ny * R_contact;
      const vDotN = u.vx * nx + u.vy * ny;
      if (vDotN < 0) {
        u.vx -= (1 + bounce) * vDotN * nx;
        u.vy -= (1 + bounce) * vDotN * ny;
      }
    }
  }

  // 4. Bottom-Right Corner: center (Mt - F, k - F) = (1720, 790)
  const brX = Mt - F, brY = k - F;
  if (u.x >= brX && u.y >= brY) {
    const dx = u.x - brX, dy = u.y - brY;
    const dist = Math.hypot(dx, dy);
    if (dist > R_contact && dist > 0) {
      const nx = -dx / dist, ny = -dy / dist;
      u.x = brX - nx * R_contact;
      u.y = brY - ny * R_contact;
      const vDotN = u.vx * nx + u.vy * ny;
      if (vDotN < 0) {
        u.vx -= (1 + bounce) * vDotN * nx;
        u.vy -= (1 + bounce) * vDotN * ny;
      }
    }
  }
}
function Uv(u:any,f:any,r:number,s:any){
  const _now=Date.now(),prevVx=f.vx,prevVy=f.vy;
  const y=Math.cos(u.angle),m=Math.sin(u.angle);
  const g=f.x-u.x,p=f.y-u.y;
  const A=g*y+p*m;
  const isMirrored = u.isGrounded && (u.facing === -1 || (u.surfaceType === "floor" && Math.cos(u.angle) < -0.5));
  const lateralSign = (isMirrored ? -1 : 1) * (u.airRollInverted ? -1 : 1);
  const C=(-g*m+p*y)*lateralSign;
  const z=u.width/2,N=u.height/2;
  const D=Math.max(-z,Math.min(z,A));
  const X=Math.max(-N,Math.min(N,C));
  const tt=A-D,I=C-X;
  const U=Math.hypot(tt,I);

  if(U<f.radius){
    const Tt=f.radius-(U||.001);
    let at=tt/(U||1),Ht=I/(U||1);
    U===0&&(at=0,Ht=-1);
    const ot=at*y-Ht*m*lateralSign;
    const Lt=at*m+Ht*y*lateralSign;

    f.x+=ot*Tt;
    f.y+=Lt*Tt;

    const isRoof=Ht<-.45&&Math.abs(A)<z*1.25;
    const isFront=at>.45||(A>z*.5);
    const isRear=at<-.45||(A<-z*.5);
    // Strict wheel-only check: contact normal must be aligned with undercarriage (Ht >= 0.82),
    // longitudinal contact point A must be within wheelbase,
    // contact C must be on bottom (C >= N - 2.5),
    // and CANNOT be hitting front bumper, roof, or rear spoiler!
    const wbLimit = (u.wheelbase || 18) + 2.5;
    const isWheelsStrict = Ht >= 0.82 && Math.abs(A) <= wbLimit && C >= N - 2.5 && !isFront && !isRoof && !isRear;

    if(isWheelsStrict){
      u.jumpCount=0;
      u.flipWindowTimer=0;
      u.canJump=!0;
      if(!u.isGrounded&&!u.hasFlipReset){
        u.hasFlipReset=!0;
        Me.playFlipReset();
        emitMechanicEvent(s, u, {type:"flip_reset",text:"✨ FLIP RESET",color:"#f59e0b"});
        for(let _i=0;_i<12;_i++)s.newParticles.push({id:++On,x:u.x+(Math.random()-.5)*u.width,y:u.y+(Math.random()-.5)*u.height,vx:(Math.random()-.5)*180,vy:(Math.random()-.5)*180,life:.35,maxLife:.35,color:"#fbbf24",size:4,type:"spark"});
      }
    }

    if (u.isCeilingDrop && u.isFlipping) {
      Me.playCeilingShot && Me.playCeilingShot();
      emitMechanicEvent(s, u, { type: "ceiling_shot", text: "🌌 CEILING SHOT", color: "#a855f7" });
      u.isCeilingDrop = false;
    }

    const rollMult = u.airRollInverted ? -1 : 1;
    const downY = Math.cos(u.angle) * rollMult;
    const isTurtleShot = downY < -0.7 && u.y >= k - (u.height || 28) - 15;
    if (isTurtleShot && !u.isGrounded) {
      Me.playTurtle && Me.playTurtle();
      emitMechanicEvent(s, u, { type: "turtle", text: "🐢 TURTLE SHOT", color: "#10b981" });
    }

    if (f.lastTouchPlayer && f.lastTouchTeam !== u.team && _now - (f.lastTouchTime || 0) < 180 && isFront) {
      Me.playDunk && Me.playDunk();
      emitMechanicEvent(s, u, { type: "dunk", text: "💥 50/50 DUNK!", color: "#f59e0b" });
    }

    const isDoomsee = !u.isGrounded && u.vy > 0 && f.vy > 40 && (u.team === "blue" ? (f.x > Mt - 90 && u.x > Mt - 130) : (f.x < At + 90 && u.x < At + 130)) && f.y < (u.team === "blue" ? ae.yMin : le.yMin) + 40;
    if (isDoomsee) {
      emitMechanicEvent(s, u, { type: "doomsee", text: "🍽️ DOOMSEE DISH", color: "#06b6d4" });
    }

    const relVx=f.vx-u.vx;
    const relVy=f.vy-u.vy;
    const vn=relVx*ot+relVy*Lt;
    const isNearFloor=f.y>=k-Cu-18&&u.isGrounded&&u.surfaceType==="floor";

    if(isRoof){
      if(u.isFlipping&&u.flipTimer<.3){
        const flipDirX=u.flipDirection.x||(Math.cos(u.angle)>=0?1:-1);
        const flickVx=u.vx+flipDirX*420;
        const flickVy=Math.min(-260,u.vy+(u.flipDirection.y||-.4)*320-180);
        f.vx=flickVx;
        f.vy=flickVy;
        f.spin+=flipDirX*25;
        Me.playMustyFlick();
        emitMechanicEvent(s, u, {type:"flick",text:"⚡ FLICK SHOT",color:"#a855f7"});
        for(let _i=0;_i<12;_i++)s.newParticles.push({id:++On,x:f.x,y:f.y,vx:flipDirX*240+(Math.random()-.5)*120,vy:-200+(Math.random()-.5)*120,life:.35,maxLife:.35,color:"#c084fc",size:5,type:"spark"});
      }else{
        if(vn<0){
          const roofRestitution=Math.abs(vn)>160?.2:.05;
          const Te=-(1+roofRestitution)*vn;
          f.vx+=ot*Te;
          f.vy+=Lt*Te;
        }
        const grip=u.isGrounded?18:10;
        f.vx+=(u.vx-f.vx)*Math.min(1,grip*r);
        const rollTilt=(A/z)*110*r;
        f.vx+=rollTilt;
        if(u.vy<0&&f.vy>u.vy){
          f.vy=u.vy;
        }
      }
    }else if(isNearFloor&&isFront&&!u.isFlipping){
      const carForwardDir=Math.cos(u.angle)>=0?1:-1;
      const approachSpd=Math.abs(vn);
      if(approachSpd<160&&!u.isSupersonic){
        f.y=k-Cu;
        f.vy=0;
        f.vx=u.vx+carForwardDir*Math.max(15,Math.abs(u.vx)*.06);
      }else{
        const hitEnergy=Math.min(700,Math.max(180,approachSpd*1.3+(u.isSupersonic?180:0)));
        f.vx=u.vx*.4+ot*hitEnergy;
        const chipUp=Math.min(480,Math.max(120,hitEnergy*.55));
        f.vy=Math.min(f.vy,-chipUp);
      }
    }else{
      if(vn<0){
        const isAirborne = !u.isGrounded;
        const isGentleAirTouch = isAirborne && isFront && Math.abs(vn) < 280 && !u.isSupersonic;
        let e = isGentleAirTouch ? 0.12 : (isFront ? (isAirborne ? 0.40 : 0.70) : (isWheelsStrict ? 0.15 : (isRear ? 0.45 : 0.55)));
        let Te=-(1+e)*vn;
        f.vx+=ot*Te;
        f.vy+=Lt*Te;
        if(u.isFlipping){
          f.vx+=u.flipDirection.x*280;
          f.vy+=u.flipDirection.y*220;
        }
        if(u.isSupersonic&&isFront){
          f.vx+=y*220;
          f.vy+=m*220;
        }
        if(isAirborne && (isFront || isRoof) && !u.isFlipping){
          f.vx += (u.vx - f.vx) * Math.min(1, 14 * r);
          if(u.vy < 0){
            if(f.vy > u.vy){
              f.vy += (u.vy - f.vy) * Math.min(1, 16 * r);
            }
            if(u.isBoosting){
              f.vy += u.vy * 0.18 * Math.min(1, 12 * r);
            }
          }
        }
        u.vx-=ot*Te*.06;
        u.vy-=Lt*Te*.06;
      }
    }

    const _isMusty=(Math.cos(u.angle)<-.15&&Math.abs(Math.sin(u.angle))>.25||Math.abs(u.angle)>1.75)&&u.isFlipping&&!u.isGrounded&&f.y<u.y+15;
    if(_isMusty){
      const _flDir=u.team==="blue"?1:-1;
      f.vx=_flDir*Math.max(Math.abs(f.vx)+520,920);
      f.vy=-Math.max(Math.abs(f.vy)+340,520);
      f.spin+=_flDir*25;
      const isBreezi = !!u.airRollInverted;
      Me.playMustyFlick();
      emitMechanicEvent(s, u, {type:isBreezi?"breezi":"musty",text:isBreezi?"🌪️ BREEZI FLICK":"⚡ MUSTY FLICK",color:isBreezi?"#d946ef":"#a855f7"});
      for(let _i=0;_i<14;_i++)s.newParticles.push({id:++On,x:f.x,y:f.y,vx:_flDir*250+(Math.random()-.5)*160,vy:-220+(Math.random()-.5)*160,life:.38,maxLife:.38,color:isBreezi?"#e879f9":"#c084fc",size:5,type:"spark"});
    }

    const _dLeft=f.x-At-f.radius,_dRight=Mt-f.x-f.radius,_dFloor=k-f.y-f.radius,_dCeil=f.y-Qt-f.radius;
    const isLeftSolidWall = (f.y < le.yMin - 10 || f.y > le.yMax + 10);
    const isRightSolidWall = (f.y < ae.yMin - 10 || f.y > ae.yMax + 10);
    const _carSpd=Math.hypot(u.vx,u.vy);
    const _isPinchImpact=_carSpd>200||Math.abs(vn)>160;
    let _pType=null,_pVx=0,_pVy=0,_isKuxir=false;
    if(_dLeft<44&&isLeftSolidWall&&u.vx<-100&&_isPinchImpact){
      _pType="wall";
      _isKuxir = u.team === "blue";
      const pinchSpd = Math.min(1420, Math.max(1120, (_carSpd + Math.abs(vn)) * 1.35 + 460));
      _pVx = pinchSpd * 0.94;
      const targetNetY = (ae.yMin + ae.yMax) / 2;
      _pVy = Math.max(-420, Math.min(420, (targetNetY - f.y) * 0.42 + u.vy * 0.25));
    }else if(_dRight<44&&isRightSolidWall&&u.vx>100&&_isPinchImpact){
      _pType="wall";
      _isKuxir = u.team === "orange";
      const pinchSpd = Math.min(1420, Math.max(1120, (_carSpd + Math.abs(vn)) * 1.35 + 460));
      _pVx = -pinchSpd * 0.94;
      const targetNetY = (le.yMin + le.yMax) / 2;
      _pVy = Math.max(-420, Math.min(420, (targetNetY - f.y) * 0.42 + u.vy * 0.25));
    }else if(_dFloor<45&&u.vy>140&&_isPinchImpact){
      _pType="ground";
      const pinchSpd = Math.min(1380, Math.max(1050, (_carSpd + Math.abs(vn)) * 1.3 + 420));
      _pVx=(u.vx>=0?1:-1)*pinchSpd*0.93;
      _pVy=-pinchSpd*0.34;
    }else if(_dCeil<45&&u.vy<-130&&_isPinchImpact){
      _pType="ceiling";
      const pinchSpd = Math.min(1380, Math.max(1050, (_carSpd + Math.abs(vn)) * 1.3 + 420));
      _pVx=(u.vx>=0?1:-1)*pinchSpd*0.92;
      _pVy=pinchSpd*0.36;
    }
    if(_pType){
      f.vx=_pVx;f.vy=_pVy;f.touchEffectTimer=.4;
      const spdClamp = Math.hypot(f.vx, f.vy);
      if (spdClamp > Hh) { const g = Hh / spdClamp; f.vx *= g; f.vy *= g; }
      const _kmh = Math.round(Math.hypot(f.vx, f.vy) * SPEED_KMH_RATIO);
      Me.playPinch();
      const pinchText = _pType === "wall" ? (_isKuxir ? "💥 KUXIR PINCH" : "💥 WALL PINCH") : (_pType === "ground" ? "💥 GROUND PINCH" : "💥 CEILING PINCH");
      emitMechanicEvent(s, u, {type:"pinch",text:pinchText+" ("+_kmh+" KM/H)",color:"#f43f5e",speedKmh:_kmh});
      for(let _i=0;_i<20;_i++){
        const _ang=Math.random()*Math.PI*2,_sp=150+Math.random()*300;
        s.newParticles.push({id:++On,x:f.x,y:f.y,vx:Math.cos(_ang)*_sp,vy:Math.sin(_ang)*_sp,life:.42,maxLife:.42,color:_i%2===0?"#f43f5e":"#fb7185",size:5,type:"spark"});
      }
    }

    if(!u.isGrounded&&f.y<k-120){
      _now-(u.lastAirTouchTime||0)<1600?(u.airTouches=(u.airTouches||0)+1,(u.airTouches===3||u.airTouches===5)&&emitMechanicEvent(s, u, {type:"air_dribble",text:"🌀 AIR DRIBBLE ("+u.airTouches+"x)",color:"#06b6d4"})):u.airTouches=1,u.lastAirTouchTime=_now;
      if(f.backboardRebound&&_now-f.backboardRebound.time<2800&&(f.backboardRebound.player===u.name||f.backboardRebound.targetTeam!==u.team)){
        Me.playDoubleTap();
        emitMechanicEvent(s, u, {type:"double_tap",text:"🎯 DOUBLE TAP",color:"#22c55e"});
        f.backboardRebound=null;
      }
      if(f.psychoCandidate&&_now-f.psychoCandidate.time<4500&&!u.isGrounded){
        const isOwnHalf = u.team === "blue" ? u.x < Kt * 0.52 : u.x > Kt * 0.48;
        const isCorrectWall = f.psychoCandidate.sourceWall === u.team;
        if (isOwnHalf && isCorrectWall) {
          const oppGoalX = u.team === "blue" ? Mt : At;
          const oppGoalY = (ae.yMin + ae.yMax) / 2;
          const shootAng = Math.atan2(oppGoalY - f.y, oppGoalX - f.x);
          const pSpd = Math.min(1380, Math.max(1160, Math.hypot(u.vx, u.vy) * 1.25 + 750));
          f.vx = Math.cos(shootAng) * pSpd;
          f.vy = Math.sin(shootAng) * pSpd * 0.85;
          const spdClamp = Math.hypot(f.vx, f.vy);
          if (spdClamp > Hh) { const g = Hh / spdClamp; f.vx *= g; f.vy *= g; }
          const pKmh = Math.round(Math.hypot(f.vx, f.vy) * SPEED_KMH_RATIO);
          Me.playPsycho();
          emitMechanicEvent(s, u, {type:"psycho",text:"🔮 PSYCHO REDIRECT ("+pKmh+" KM/H)",color:"#ec4899",speedKmh:pKmh});
          f.psychoGoal = { team: u.team, player: u.name, time: _now, speedKmh: pKmh };
          f.psychoCandidate = null;
        }
      }
    }else if(u.isGrounded){
      u.airTouches=0;
    }

    const prevTouchTeam = f.lastTouchTeam;
    f.lastTouchTeam=u.team;
    f.lastTouchPlayer=u.name;
    f.lastTouchTime=Date.now();
    f.touchEffectTimer=.2;
    u.score = (u.score || 0) + 2;
    const isHeadingToOppGoal = u.team === "blue" ? f.vx > 100 : f.vx < -100;
    if (isHeadingToOppGoal) {
      u.shots = (u.shots || 0) + 1;
      u.score = (u.score || 0) + 15;
    }
    checkAndEmitSave(u, f, prevVx, prevVy, s, prevTouchTeam);
    const W=Math.hypot(f.vx,f.vy)/400;
    Me.playBallHit(W);
    const $=u.team==="blue"?"#38bdf8":"#f97316";
    for(let bt=0;bt<8;bt++){
      s.newParticles.push({id:++On,x:f.x-ot*f.radius*.8,y:f.y-Lt*f.radius*.8,vx:ot*160+(Math.random()-.5)*120,vy:Lt*160+(Math.random()-.5)*120,life:.3,maxLife:.3,color:$,size:4+Math.random()*3,type:"spark"});
    }
  }
}function Hv(u:any,f:any,r:any){const s=f.x-u.x,y=f.y-u.y,m=Math.hypot(s,y),g=(u.width+f.width)/2.2;if(m<g&&m>0){const p=s/m,A=y/m,C={x:Math.cos(u.angle),y:Math.sin(u.angle)},z=C.x*p+C.y*A,N={x:Math.cos(f.angle),y:Math.sin(f.angle)},D=N.x*-p+N.y*-A;const closingSpeedU=(u.vx-f.vx)*p+(u.vy-f.vy)*A;const closingSpeedF=(f.vx-u.vx)*(-p)+(f.vy-u.vy)*(-A);const canDemoU=u.isSupersonic&&(u.supersonicTimer||0)>=0.08&&u.team!==f.team&&z>.70&&closingSpeedU>180;const canDemoF=f.isSupersonic&&(f.supersonicTimer||0)>=0.08&&f.team!==u.team&&D>.70&&closingSpeedF>180;if(canDemoU){Xh(f,u,r);return}else if(canDemoF){Xh(u,f,r);return}const X=g-m;u.x-=p*X*.5,u.y-=A*X*.5,f.x+=p*X*.5,f.y+=A*X*.5;const tt=u.vx-f.vx,I=u.vy-f.vy,U=(tt*p+I*A)*1.2;U>0&&(u.vx-=p*U*.5,u.vy-=A*U*.5,f.vx+=p*U*.5,f.vy+=A*U*.5);u._carContactTicks=(u._carContactTicks||0)+1;f._carContactTicks=(f._carContactTicks||0)+1;u._contactCar=f;f._contactCar=u;const bounceSep=40;u.vx-=p*bounceSep*.5;f.vx+=p*bounceSep*.5;if(u.isGrounded&&f.isGrounded){u.vy-=15;f.vy-=15;}}}function Xh(u,f,r){u.isDemoed=!0,u.demoRespawnTimer=3,u.boost=33,f.demos++,f.score+=50,Me.playDemolition(),r.demoEvents.push({killer:f,victim:u,pos:{x:u.x,y:u.y}});for(let s=0;s<35;s++){const y=Math.random()*Math.PI*2,m=150+Math.random()*450;r.newParticles.push({id:++On,x:u.x,y:u.y,vx:Math.cos(y)*m,vy:Math.sin(y)*m,life:.6+Math.random()*.4,maxLife:1,color:Math.random()>.5?"#ef4444":"#f97316",size:8+Math.random()*8,type:"demo_explosion"})}}function Gv(u){u.isDemoed=!1,u.demoRespawnTimer=0,u.vx=0,u.vy=0,u.isSupersonic=!1,u.isFlipping=!1,u.jumpCount=0,u.boost=33,u.airRollInverted=!1,u.team==="blue"?(u.x=At+220,u.y=k-u.height/2,u.angle=0,u.facing=1):(u.x=Mt-220,u.y=k-u.height/2,u.angle=Math.PI,u.facing=-1)}function Bv(u: any, f: any, r?: any) {
  if (!(u.boost >= 100)) {
    for (const pad of f) {
      if (!pad.active) continue;
      const s = u.x - pad.x, y = u.y - pad.y, m = pad.type === "big" ? 55 : 35;
      if (Math.hypot(s, y) < m) {
        pad.active = false;
        pad.cooldownTimer = pad.respawnTime;
        const isBig = pad.type === "big";
        const oldB = u.boost;
        if (isBig) {
          u.boost = 100;
        } else {
          u.boost = Math.min(100, u.boost + 12);
        }
        const gained = Math.round(u.boost - oldB);
        Me.playBoostPadPickup(isBig);
        if (r) {
          if (r.newParticles) {
            r.newParticles.push({
              id: ++On,
              x: pad.x,
              y: pad.y - 12,
              vx: (Math.random() - 0.5) * 30,
              vy: -95,
              life: 0.9,
              maxLife: 0.9,
              color: isBig ? "#fbbf24" : "#f59e0b",
              size: isBig ? 15 : 12,
              text: isBig ? "+100" : `+${gained || 12}`,
              type: "text"
            });
            for (let i = 0; i < (isBig ? 12 : 6); i++) {
              const ang = Math.random() * Math.PI * 2;
              const spd = 60 + Math.random() * (isBig ? 180 : 100);
              r.newParticles.push({
                id: ++On,
                x: pad.x,
                y: pad.y,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd - 20,
                life: 0.45 + Math.random() * 0.35,
                maxLife: 0.8,
                color: isBig ? "#fef08a" : "#fde047",
                size: isBig ? 4 : 2.5,
                type: "spark"
              });
            }
          }
          if (r.boostPickups) {
            r.boostPickups.push({
              id: "boost_" + (++On),
              time: performance.now(),
              type: "boost_pickup",
              padId: pad.id,
              padType: pad.type,
              x: pad.x,
              y: pad.y,
              player: u.name,
              team: u.team
            });
          }
        }
      }
    }
  }
}function qv(u: any, f: any) {
  if (u.isGoalScored) return;
  const r = Math.round(Math.hypot(u.vx, u.vy) * SPEED_KMH_RATIO);
  const isPsycho = !!(u.psychoGoal && (Date.now() - u.psychoGoal.time < 6000));

  if (activeMapDef.goalType === "floor") {
    if (u.y - u.radius > (le.y || k) - 12 && u.x > le.xMin! && u.x < le.xMax!) {
      u.isGoalScored = true;
      Me.playGoalExplosion();
      f.goalScored = {
        scoringTeam: "orange",
        scorerName: u.lastTouchPlayer || "Orange Team",
        speedKmh: Math.max(35, r),
        ballPos: { x: u.x, y: u.y },
        isPsycho
      };
      u.psychoGoal = null;
    }
    if (u.y - u.radius > (ae.y || k) - 12 && u.x > ae.xMin! && u.x < ae.xMax!) {
      u.isGoalScored = true;
      Me.playGoalExplosion();
      f.goalScored = {
        scoringTeam: "blue",
        scorerName: u.lastTouchPlayer || "Blue Team",
        speedKmh: Math.max(35, r),
        ballPos: { x: u.x, y: u.y },
        isPsycho
      };
      u.psychoGoal = null;
    }
    return;
  }

  if (activeMapDef.goalType === "ceiling") {
    if (u.y + u.radius < (le.y || Qt) + 12 && u.x > le.xMin! && u.x < le.xMax!) {
      u.isGoalScored = true;
      Me.playGoalExplosion();
      f.goalScored = {
        scoringTeam: "orange",
        scorerName: u.lastTouchPlayer || "Orange Team",
        speedKmh: Math.max(35, r),
        ballPos: { x: u.x, y: u.y },
        isPsycho
      };
      u.psychoGoal = null;
    }
    if (u.y + u.radius < (ae.y || Qt) + 12 && u.x > ae.xMin! && u.x < ae.xMax!) {
      u.isGoalScored = true;
      Me.playGoalExplosion();
      f.goalScored = {
        scoringTeam: "blue",
        scorerName: u.lastTouchPlayer || "Blue Team",
        speedKmh: Math.max(35, r),
        ballPos: { x: u.x, y: u.y },
        isPsycho
      };
      u.psychoGoal = null;
    }
    return;
  }

  if (u.x + u.radius < (le.x !== undefined ? le.x : At) && u.y > le.yMin! && u.y < le.yMax!) {
    u.isGoalScored = true;
    Me.playGoalExplosion();
    f.goalScored = {
      scoringTeam: "orange",
      scorerName: u.lastTouchPlayer || "Orange Team",
      speedKmh: Math.max(35, r),
      ballPos: { x: u.x, y: u.y },
      isPsycho
    };
    u.psychoGoal = null;
  }
  if (u.x - u.radius > (ae.x !== undefined ? ae.x : Mt) && u.y > ae.yMin! && u.y < ae.yMax!) {
    u.isGoalScored = true;
    Me.playGoalExplosion();
    f.goalScored = {
      scoringTeam: "blue",
      scorerName: u.lastTouchPlayer || "Blue Team",
      speedKmh: Math.max(35, r),
      ballPos: { x: u.x, y: u.y },
      isPsycho
    };
    u.psychoGoal = null;
  }
}function Lh(u,f,r){const s=Math.atan2(Math.sin(f-u),Math.cos(f-u));return u+s*Math.min(1,Math.max(0,r))}function Yv(u:any,f:any,r:any,s:any,y:any,m:any,g:any){
  const p:any={};
  if(u.isDemoed)return Vh(u),p;
  u.botState||(u.botState={action:"idle",dribbleTime:0,airDribbleTouches:0,targetPos:{x:f.x,y:f.y},interceptTime:0,mustyStage:"idle",mustyTimer:0,jumpSeq:{stage:"idle",timer:0,type:"aerial",dodgeX:0,dodgeY:0}});
  Vh(u);
  Xv(u,m);

  // If jump sequencer is actively driving the car, preserve its exclusive input authority!
  if (u.botState.jumpSeq && u.botState.jumpSeq.stage !== "idle") {
    return p;
  }

  // Expose other active cars on field to bot for obstacle avoidance
  u._otherCars = [...(r || []), ...(s || [])];

  // 1. Wall Goal Net Escape:
  const isInsideBlueNet = u.x < At + 25;
  const isInsideOrangeNet = u.x > Mt - 25;

  if (isInsideBlueNet) {
    const isFacingRight = Math.cos(u.angle) > 0.1;
    if (isFacingRight) {
      u.input.throttleForward = true;
      u.input.throttleReverse = false;
      u.input.steerRight = true;
      u.input.steerLeft = false;
    } else {
      u.input.throttleReverse = true;
      u.input.throttleForward = false;
      u.input.steerRight = true;
      u.input.steerLeft = false;
    }
    if ((u._stuckTicks || 0) > 20 || !u.isGrounded) {
      u.input.jump = true;
      if (u.boost > 0) u.input.boost = true;
    }
    return p;
  }

  if (isInsideOrangeNet) {
    const isFacingLeft = Math.cos(u.angle) < -0.1;
    if (isFacingLeft) {
      u.input.throttleForward = true;
      u.input.throttleReverse = false;
      u.input.steerLeft = true;
      u.input.steerRight = false;
    } else {
      u.input.throttleReverse = true;
      u.input.throttleForward = false;
      u.input.steerLeft = true;
      u.input.steerRight = false;
    }
    if ((u._stuckTicks || 0) > 20 || !u.isGrounded) {
      u.input.jump = true;
      if (u.boost > 0) u.input.boost = true;
    }
    return p;
  }

  // 2. Floor Pit Net Escape (Core Pit map):
  if (activeMapDef.goalType === "floor") {
    const isInsideBluePit = u.y > k - 10 && u.x >= le.xMin! - 15 && u.x <= le.xMax! + 15;
    const isInsideOrangePit = u.y > k - 10 && u.x >= ae.xMin! - 15 && u.x <= ae.xMax! + 15;
    if (isInsideBluePit || isInsideOrangePit) {
      const exitDir = u.x < Kt / 2 ? 1 : -1;
      u.input.throttleForward = true;
      u.input.throttleReverse = false;
      u.input.steerRight = exitDir > 0;
      u.input.steerLeft = exitDir < 0;
      if (u.isGrounded || u.y > k + 10) {
        u.input.jump = true;
        if (u.boost > 0) u.input.boost = true;
      }
      return p;
    }
  }

  // 3. Ceiling Vault Net Escape (Sky Vault map):
  if (activeMapDef.goalType === "ceiling") {
    const isInsideBlueVault = u.y < Qt + 10 && u.x >= le.xMin! - 15 && u.x <= le.xMax! + 15;
    const isInsideOrangeVault = u.y < Qt + 10 && u.x >= ae.xMin! - 15 && u.x <= ae.xMax! + 15;
    if (isInsideBlueVault || isInsideOrangeVault) {
      const exitDir = u.x < Kt / 2 ? 1 : -1;
      u.input.throttleForward = true;
      u.input.throttleReverse = false;
      u.input.steerRight = exitDir > 0;
      u.input.steerLeft = exitDir < 0;
      if (u.isGrounded) {
        u.input.jump = true;
      }
      return p;
    }
  }

  // 4. Stuck Watchdog: only if genuinely blocked against a solid wall or opponent car for > 65 ticks (> 1 sec)
  const curSpd = Math.hypot(u.vx, u.vy);
  const isPressingObstacle = (u._carContactTicks || 0) > 10 || (u.x <= At + 20 || u.x >= Mt - 20);
  if (curSpd < 20 && isPressingObstacle) {
    u._stuckTicks = (u._stuckTicks || 0) + 1;
  } else if (curSpd > 45) {
    u._stuckTicks = Math.max(0, (u._stuckTicks || 0) - 2);
  }

  if ((u._stuckTicks || 0) > 65) {
    u.input.throttleForward = false;
    u.input.throttleReverse = true;
    u.input.handbrake = true;
    u.input.steerLeft = u.team === "blue";
    u.input.steerRight = u.team === "orange";
    if (u._stuckTicks > 90) {
      u._stuckTicks = 0;
    }
    return p;
  }

  const ownGoal = u.team === "orange" ? ae : le;
  const oppGoal = u.team === "orange" ? le : ae;
  const teamDir = u.team === "orange" ? -1 : 1;
  const oppCar = r.find((D: any) => !D.isDemoed) || r[0];
  const tmCar = s && s.length > 0 ? (s.find((D: any) => !D.isDemoed) || s[0]) : null;

  switch (y) {
    case "rookie": Lv(u, f, r); break;
    case "pro": Vv(u, f, ownGoal.x, oppGoal.x, teamDir, m); break;
    case "allstar":
    case "ssl":
    case "unfair":
    default:
      Zv(u, f, oppCar, ownGoal, oppGoal, teamDir, m, p, y === "unfair", g, tmCar, s);
      break;
  }

  // Apply personal bot upgrades and tactical combat protocol
  if (u.isPlayerBot) {
    const mods = getBotUpgradesModifiers(u.botUpgrades || getBotUpgrades());

    // 1. Boost Thrift: Stop wasting boost if already supersonic
    if (mods.boostFeatherEfficiency && u.isSupersonic) {
      u.input.boost = false;
    }

    // 2. Reflexes: Instant steering tracking when ball changes direction
    if (mods.reactionDelaySec < 0.08) {
      const dxToBall = f.x - u.x;
      if (Math.abs(dxToBall) > 20) {
        if (dxToBall > 0 && !u.input.steerLeft) u.input.steerRight = true;
        if (dxToBall < 0 && !u.input.steerRight) u.input.steerLeft = true;
      }
    }

    // 3. Aerial Flight: Fast aerial double-jump commit when ball is high
    if (u.isGrounded && f.y < k - mods.aerialCommitHeight && Math.abs(f.x - u.x) < 140) {
      if (u.canJump && (!u.botState.jumpSeq || u.botState.jumpSeq.stage === "idle")) {
        Oe(u, "aerial");
      }
    }

    // 4. Tactical Archetypes
    if (mods.archetype === "striker") {
      if (u.team === "blue" && u.x < Kt / 2 && f.x > u.x) {
        u.input.throttleForward = true;
        u.input.throttleReverse = false;
      } else if (u.team === "orange" && u.x > Kt / 2 && f.x < u.x) {
        u.input.throttleForward = true;
        u.input.throttleReverse = false;
      }
    } else if (mods.archetype === "goalkeeper") {
      const isDefending = u.team === "blue" ? f.x > Kt / 2 : f.x < Kt / 2;
      const netX = u.team === "blue" ? At + 120 : Mt - 120;
      if (isDefending && Math.abs(u.x - netX) > 80) {
        if (u.x > netX) {
          u.input.steerLeft = true;
          u.input.steerRight = false;
        } else {
          u.input.steerRight = true;
          u.input.steerLeft = false;
        }
      }
    } else if (mods.archetype === "menace") {
      if (u.isSupersonic && oppCar && !oppCar.isDemoed) {
        const dToOpp = Math.hypot(oppCar.x - u.x, oppCar.y - u.y);
        if (dToOpp < 220) {
          const dx = oppCar.x - u.x;
          u.input.steerRight = dx > 0;
          u.input.steerLeft = dx < 0;
          u.input.throttleForward = true;
        }
      }
    }
  }

  return p;
}

function Vh(u:any){
  u.input={steerLeft:!1,steerRight:!1,throttleForward:!1,throttleReverse:!1,pitchUp:!1,pitchDown:!1,airRollLeft:!1,airRollRight:!1,jump:!1,boost:!1,handbrake:!1,mouseAim:!1,mouseTargetAngle:undefined};
}

function Oe(u: any, f: string, r: number = 0, s: number = 0) {
  const typeMap: any = {
    aerial: "fast_aerial",
    fast_aerial: "fast_aerial",
    jump_strike: "jump_strike",
    speedflip_kickoff: "speedflip_kickoff",
    dodge: "dodge",
    wavedash: "wavedash",
    musty_jump: "musty_jump"
  };
  startBotJumpSeq(u, typeMap[f] || "dodge", r, s);
}

function Xv(u: any, f: number) {
  const botEnv: ArenaEnv = {
    Kt,
    hl,
    k,
    Qt,
    At,
    Mt,
    F,
    zn,
    POST_INSET,
    le,
    ae,
    goalType: activeMapDef.goalType || "wall",
    isLegacy: activePhysicsMode === "legacy",
    pv,
    Ph,
    Uh,
    Hh,
    Av,
    Bh,
    cc,
    Gh,
    Ev,
    qh,
    wavedashMinSpeed: activePhysicsMode === "legacy" ? 1280 : (RL_PHYSICS.wavedashMinSpeed || 1280)
  };
  updateBotJumpSeq(u, f, botEnv);
}

function tm(u:any){
  return Math.abs(u.x-Kt/2)<25&&Math.abs(u.vx)<5&&Math.abs(u.vy)<5&&u.y>k-90;
}

function stepBallPhysicsSubstep(
  b: { x: number; y: number; vx: number; vy: number; radius: number; isGoalScored?: boolean },
  subF: number,
  Ph: number,
  Uh: number,
  Hh: number,
  isLegacy: boolean = false
) {
  b.vy += Ph * subF;
  const drag = Math.pow(Uh, subF * 60);
  b.vx *= drag;
  b.vy *= drag;
  b.x += b.vx * subF;
  b.y += b.vy * subF;

  const radius = b.radius;
  const rContact = F - radius; // F = 160, radius = 30 -> 130
  const bounce = isLegacy ? 0.75 : 0.65;
  const groundBounce = isLegacy ? 0.76 : 0.60;
  const wallBounce = isLegacy ? 0.80 : 0.65;
  const ceilBounce = isLegacy ? 0.76 : 0.65;
  const groundFricFactor = isLegacy ? 0.94 : 0.96;
  const groundFriction = Math.pow(groundFricFactor, subF * 120);

  // 1. Four Corner Curves (Radius F = 160)
  // Top-Left (At + F, Qt + F) = (280, 280)
  const tlX = At + F, tlY = Qt + F;
  if (b.x <= tlX && b.y <= tlY) {
    const dx = b.x - tlX, dy = b.y - tlY;
    const dist = Math.hypot(dx, dy);
    if (dist > rContact && dist > 0) {
      const nx = -dx / dist, ny = -dy / dist;
      b.x = tlX - nx * rContact;
      b.y = tlY - ny * rContact;
      const vDotN = b.vx * nx + b.vy * ny;
      if (vDotN < 0) {
        b.vx -= (1 + bounce) * vDotN * nx;
        b.vy -= (1 + bounce) * vDotN * ny;
      }
    }
  }

  // Top-Right (Mt - F, Qt + F) = (1720, 280)
  const trX = Mt - F, trY = Qt + F;
  if (b.x >= trX && b.y <= trY) {
    const dx = b.x - trX, dy = b.y - trY;
    const dist = Math.hypot(dx, dy);
    if (dist > rContact && dist > 0) {
      const nx = -dx / dist, ny = -dy / dist;
      b.x = trX - nx * rContact;
      b.y = trY - ny * rContact;
      const vDotN = b.vx * nx + b.vy * ny;
      if (vDotN < 0) {
        b.vx -= (1 + bounce) * vDotN * nx;
        b.vy -= (1 + bounce) * vDotN * ny;
      }
    }
  }

  // Bottom-Left (At + F, k - F) = (280, 790)
  const blX = At + F, blY = k - F;
  if (b.x <= blX && b.y >= blY) {
    const dx = b.x - blX, dy = b.y - blY;
    const dist = Math.hypot(dx, dy);
    if (dist > rContact && dist > 0) {
      const nx = -dx / dist, ny = -dy / dist;
      b.x = blX - nx * rContact;
      b.y = blY - ny * rContact;
      const vDotN = b.vx * nx + b.vy * ny;
      if (vDotN < 0) {
        b.vx -= (1 + bounce) * vDotN * nx;
        b.vy -= (1 + bounce) * vDotN * ny;
      }
    }
  }

  // Bottom-Right (Mt - F, k - F) = (1720, 790)
  const brX = Mt - F, brY = k - F;
  if (b.x >= brX && b.y >= brY) {
    const dx = b.x - brX, dy = b.y - brY;
    const dist = Math.hypot(dx, dy);
    if (dist > rContact && dist > 0) {
      const nx = -dx / dist, ny = -dy / dist;
      b.x = brX - nx * rContact;
      b.y = brY - ny * rContact;
      const vDotN = b.vx * nx + b.vy * ny;
      if (vDotN < 0) {
        b.vx -= (1 + bounce) * vDotN * nx;
        b.vy -= (1 + bounce) * vDotN * ny;
      }
    }
  }

  if (activeMapDef.goalType === "floor") {
    const inBluePitX = b.x >= le.xMin! && b.x <= le.xMax!;
    const inOrangePitX = b.x >= ae.xMin! && b.x <= ae.xMax!;
    if (!inBluePitX && !inOrangePitX) {
      if (b.x >= At + F && b.x <= Mt - F && b.y + radius >= k) {
        b.y = k - radius;
        if (b.vy > 0) {
          b.vy = -b.vy * groundBounce;
          if (Math.abs(b.vy) < 25) b.vy = 0;
        }
        b.vx *= groundFriction;
      }
    } else {
      const pit = inBluePitX ? le : ae;
      const rampW = 75;
      const slope = pit.depth / rampW;
      const rampLen = Math.hypot(slope, 1);
      const nxLeft = -slope / rampLen, nyLeft = -1 / rampLen;
      const nxRight = slope / rampLen, nyRight = -1 / rampLen;

      let floorSurfaceY = k + pit.depth;
      let normX = 0, normY = -1;
      let isRamp = false;

      if (b.x < pit.xMin! + rampW) {
        const t = Math.max(0, Math.min(1, (b.x - pit.xMin!) / rampW));
        floorSurfaceY = k + pit.depth * t;
        normX = nxLeft; normY = nyLeft;
        isRamp = true;
      } else if (b.x > pit.xMax! - rampW) {
        const t = Math.max(0, Math.min(1, (pit.xMax! - b.x) / rampW));
        floorSurfaceY = k + pit.depth * t;
        normX = nxRight; normY = nyRight;
        isRamp = true;
      }

      if (b.y + radius >= floorSurfaceY) {
        b.y = floorSurfaceY - radius;
        if (isRamp) {
          const vDotN = b.vx * normX + b.vy * normY;
          if (vDotN < 0) {
            b.vx -= (1 + 0.45) * vDotN * normX;
            b.vy -= (1 + 0.45) * vDotN * normY;
          }
        } else {
          if (b.vy > 0) b.vy = -b.vy * 0.35;
        }
      }
    }
    if (b.x >= At + F && b.x <= Mt - F && b.y - radius <= Qt) {
      b.y = Qt + radius;
      if (b.vy < 0) b.vy = -b.vy * ceilBounce;
    }
    if (b.y >= Qt + F && b.y <= k - F && b.x - radius <= At) {
      b.x = At + radius;
      if (b.vx < 0) b.vx = -b.vx * wallBounce;
    }
    if (b.y >= Qt + F && b.y <= k - F && b.x + radius >= Mt) {
      b.x = Mt - radius;
      if (b.vx > 0) b.vx = -b.vx * wallBounce;
    }

  } else if (activeMapDef.goalType === "ceiling") {
    const inBlueVaultX = b.x >= le.xMin! && b.x <= le.xMax!;
    const inOrangeVaultX = b.x >= ae.xMin! && b.x <= ae.xMax!;
    if (!inBlueVaultX && !inOrangeVaultX) {
      if (b.x >= At + F && b.x <= Mt - F && b.y - radius <= Qt) {
        b.y = Qt + radius;
        if (b.vy < 0) b.vy = -b.vy * ceilBounce;
      }
    } else {
      const vault = inBlueVaultX ? le : ae;
      const rampW = 75;
      const slope = vault.depth / rampW;
      const rampLen = Math.hypot(slope, 1);
      const nxLeft = -slope / rampLen, nyLeft = 1 / rampLen;
      const nxRight = slope / rampLen, nyRight = 1 / rampLen;

      let ceilSurfaceY = Qt - vault.depth;
      let normX = 0, normY = 1;
      let isRamp = false;

      if (b.x < vault.xMin! + rampW) {
        const t = Math.max(0, Math.min(1, (b.x - vault.xMin!) / rampW));
        ceilSurfaceY = Qt - vault.depth * t;
        normX = nxLeft; normY = nyLeft;
        isRamp = true;
      } else if (b.x > vault.xMax! - rampW) {
        const t = Math.max(0, Math.min(1, (vault.xMax! - b.x) / rampW));
        ceilSurfaceY = Qt - vault.depth * t;
        normX = nxRight; normY = nyRight;
        isRamp = true;
      }

      if (b.y - radius <= ceilSurfaceY) {
        b.y = ceilSurfaceY + radius;
        if (isRamp) {
          const vDotN = b.vx * normX + b.vy * normY;
          if (vDotN < 0) {
            b.vx -= (1 + 0.45) * vDotN * normX;
            b.vy -= (1 + 0.45) * vDotN * normY;
          }
        } else {
          if (b.vy < 0) b.vy = -b.vy * 0.35;
        }
      }
    }
    if (b.x >= At + F && b.x <= Mt - F && b.y + radius >= k) {
      b.y = k - radius;
      if (b.vy > 0) {
        b.vy = -b.vy * groundBounce;
        if (Math.abs(b.vy) < 25) b.vy = 0;
      }
      b.vx *= groundFriction;
    }
    if (b.y >= Qt + F && b.y <= k - F && b.x - radius <= At) {
      b.x = At + radius;
      if (b.vx < 0) b.vx = -b.vx * wallBounce;
    }
    if (b.y >= Qt + F && b.y <= k - F && b.x + radius >= Mt) {
      b.x = Mt - radius;
      if (b.vx > 0) b.vx = -b.vx * wallBounce;
    }

  } else {
    // 2. Flat Floor (between At + F and Mt - F)
    if (b.x >= At + F && b.x <= Mt - F && b.y + radius >= k) {
      b.y = k - radius;
      if (b.vy > 0) {
        b.vy = -b.vy * groundBounce;
        if (Math.abs(b.vy) < 25) b.vy = 0;
      }
      b.vx *= groundFriction;
    }

    // 3. Flat Ceiling (between At + F and Mt - F)
    if (b.x >= At + F && b.x <= Mt - F && b.y - radius <= Qt) {
      b.y = Qt + radius;
      if (b.vy < 0) b.vy = -b.vy * ceilBounce;
    }

    // 4. Vertical Walls
    const inBM = b.y > le.yMin! && b.y < le.yMax!;
    const inOM = b.y > ae.yMin! && b.y < ae.yMax!;

    if (!inBM && b.y >= Qt + F && b.y <= k - F && b.x - radius <= At) {
      b.x = At + radius;
      if (b.vx < 0) b.vx = -b.vx * wallBounce;
    }
    if (!inOM && b.y >= Qt + F && b.y <= k - F && b.x + radius >= Mt) {
      b.x = Mt - radius;
      if (b.vx > 0) b.vx = -b.vx * wallBounce;
    }

    // 5. Goal scored check (matches qv)
    if (!b.isGoalScored) {
      if (b.x + radius < (le.x !== undefined ? le.x : At) && inBM) {
        b.isGoalScored = true;
      } else if (b.x - radius > (ae.x !== undefined ? ae.x : Mt) && inOM) {
        b.isGoalScored = true;
      }
    }

    // 6. Inside Goal Nets
    if (b.x < At && inBM) {
      if (b.x - radius <= At - le.depth) { b.x = At - le.depth + radius; b.vx = -b.vx * 0.35; }
      if (b.y - radius <= le.yMin!) { b.y = le.yMin! + radius; b.vy = Math.abs(b.vy) * 0.35; }
      if (b.y + radius >= le.yMax!) { b.y = le.yMax! - radius; b.vy = -Math.abs(b.vy) * 0.35; }
      if (b.isGoalScored && b.x + radius >= At) { b.x = At - radius; b.vx = -Math.abs(b.vx) * 0.5; }
    }
    if (b.x > Mt && inOM) {
      if (b.x + radius >= Mt + ae.depth) { b.x = Mt + ae.depth - radius; b.vx = -b.vx * 0.35; }
      if (b.y - radius <= ae.yMin!) { b.y = ae.yMin! + radius; b.vy = Math.abs(b.vy) * 0.35; }
      if (b.y + radius >= ae.yMax!) { b.y = ae.yMax! - radius; b.vy = -Math.abs(b.vy) * 0.35; }
      if (b.isGoalScored && b.x - radius <= Mt) { b.x = Mt + radius; b.vx = Math.abs(b.vx) * 0.5; }
    }

    // 7. Goal Posts
    const bluePostX = At - POST_INSET;
    const orangePostX = Mt + POST_INSET;
    const checkPost = (postX: number, postY: number) => {
      const pdx = b.x - postX, pdy = b.y - postY;
      const pdist = Math.hypot(pdx, pdy);
      const postRad = zn + radius;
      if (pdist < postRad && pdist > 0) {
        const pnx = pdx / pdist, pny = pdy / pdist;
        b.x = postX + pnx * postRad;
        b.y = postY + pny * postRad;
        const pDotN = b.vx * pnx + b.vy * pny;
        if (pDotN < 0) {
          b.vx -= 1.5 * pDotN * pnx;
          b.vy -= 1.5 * pDotN * pny;
        }
      }
    };
    checkPost(bluePostX, le.yMin!);
    checkPost(bluePostX, le.yMax!);
    checkPost(orangePostX, ae.yMin!);
    checkPost(orangePostX, ae.yMax!);
  }

  // Goal check for floor & ceiling maps
  if (!b.isGoalScored) {
    if (activeMapDef.goalType === "floor") {
      if ((b.y - radius > (le.y || k) - 12 && b.x > le.xMin! && b.x < le.xMax!) ||
          (b.y - radius > (ae.y || k) - 12 && b.x > ae.xMin! && b.x < ae.xMax!)) {
        b.isGoalScored = true;
      }
    } else if (activeMapDef.goalType === "ceiling") {
      if ((b.y + radius < (le.y || Qt) + 12 && b.x > le.xMin! && b.x < le.xMax!) ||
          (b.y + radius < (ae.y || Qt) + 12 && b.x > ae.xMin! && b.x < ae.xMax!)) {
        b.isGoalScored = true;
      }
    }
  }

  const spd = Math.hypot(b.vx, b.vy);
  if (spd > Hh) {
    const scl = Hh / spd;
    b.vx *= scl;
    b.vy *= scl;
  }
}

function simulateBallTrajectory(
  ball: { x: number; y: number; vx: number; vy: number; radius?: number },
  totalTime: number,
  isLegacy: boolean = false
) {
  const legacy = isLegacy || activePhysicsMode === "legacy";
  const c = legacy ? LEGACY_PHYSICS : RL_PHYSICS;
  const b = {
    x: ball.x,
    y: ball.y,
    vx: ball.vx,
    vy: ball.vy,
    radius: ball.radius || 30
  };

  const substeps = 2;
  const dt = 0.016;
  const steps = Math.max(1, Math.round(totalTime / dt));
  const subF = totalTime / (steps * substeps);

  for (let i = 0; i < steps; i++) {
    for (let step = 0; step < substeps; step++) {
      stepBallPhysicsSubstep(b, subF, c.Ph, c.Uh, c.Hh, legacy);
    }
  }

  return { x: b.x, y: b.y, vx: b.vx, vy: b.vy, radius: b.radius };
}

// --- HIGH-PRECISION SINGLE-PASS TRAJECTORY SOLVER ---

interface TrajectoryPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  t: number;
}

interface TrajectoryBounce {
  x: number;
  y: number;
  normalX: number;
  normalY: number;
  type: "wall" | "ground" | "ceiling" | "corner" | "post";
  t: number;
}

const MAX_TRAJ_POINTS = 240;
const MAX_TRAJ_BOUNCES = 24;

const cachedTrajPoints: TrajectoryPoint[] = Array.from({ length: MAX_TRAJ_POINTS }, () => ({
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  t: 0
}));

const cachedTrajBounces: TrajectoryBounce[] = Array.from({ length: MAX_TRAJ_BOUNCES }, () => ({
  x: 0,
  y: 0,
  normalX: 0,
  normalY: 0,
  type: "ground",
  t: 0
}));

const cachedTrajResult = {
  points: cachedTrajPoints,
  pointCount: 0,
  bounces: cachedTrajBounces,
  bounceCount: 0,
  groundLanding: null as { x: number; y: number; t: number } | null,
  isGoal: false,
  scoringTeam: null as "blue" | "orange" | null,
  goalPoint: null as { x: number; y: number; t: number } | null,
  initialSpeed: 0
};

function calculateBallTrajectory(
  ball: { x: number; y: number; vx: number; vy: number; radius?: number; isGoalScored?: boolean },
  isLegacy: boolean = false
) {
  const legacy = isLegacy || activePhysicsMode === "legacy";
  const c = legacy ? LEGACY_PHYSICS : RL_PHYSICS;
  const radius = ball.radius || 30;

  const b = {
    x: ball.x,
    y: ball.y,
    vx: ball.vx,
    vy: ball.vy,
    radius,
    isGoalScored: !!ball.isGoalScored
  };

  const initialSpeed = Math.hypot(b.vx, b.vy);
  cachedTrajResult.initialSpeed = initialSpeed;
  cachedTrajResult.pointCount = 0;
  cachedTrajResult.bounceCount = 0;
  cachedTrajResult.groundLanding = null;
  cachedTrajResult.isGoal = false;
  cachedTrajResult.scoringTeam = null;
  cachedTrajResult.goalPoint = null;

  // If stationary on ground or almost no speed, suppress trajectory
  const isGroundedOrResting = b.y + radius >= k - 5 && Math.abs(b.vy) < 8;
  if (initialSpeed < 14 && isGroundedOrResting) {
    return cachedTrajResult;
  }

  // Record initial origin point
  cachedTrajPoints[0].x = b.x;
  cachedTrajPoints[0].y = b.y;
  cachedTrajPoints[0].vx = b.vx;
  cachedTrajPoints[0].vy = b.vy;
  cachedTrajPoints[0].t = 0;
  cachedTrajResult.pointCount = 1;

  const totalHorizon = 2.8; // 2.8s horizon
  const subF = 1 / 120;     // 120Hz substep matching Dv engine exactly
  const maxSubsteps = Math.round(totalHorizon / subF); // 336 substeps
  const sampleInterval = 2; // sample point every ~0.0167s (60Hz resolution)

  let postGoalSteps = 0;

  for (let s = 1; s <= maxSubsteps; s++) {
    const t = s * subF;
    const prevVx = b.vx, prevVy = b.vy;
    const prevY = b.y;

    stepBallPhysicsSubstep(b, subF, c.Ph, c.Uh, c.Hh, legacy);

    // Goal detection (first time entering goal)
    if (!cachedTrajResult.isGoal && b.isGoalScored) {
      cachedTrajResult.isGoal = true;
      if (activeMapDef.goalType === "floor") {
        cachedTrajResult.scoringTeam = b.x < Kt / 2 ? "orange" : "blue";
      } else if (activeMapDef.goalType === "ceiling") {
        cachedTrajResult.scoringTeam = b.x < Kt / 2 ? "orange" : "blue";
      } else {
        cachedTrajResult.scoringTeam = b.x < Kt / 2 ? "orange" : "blue";
      }
      cachedTrajResult.goalPoint = { x: b.x, y: b.y, t };
    }

    // Ground Landing detection (first touchdown on turf from airborne)
    if (!cachedTrajResult.groundLanding && prevY < k - radius - 2 && b.y >= k - radius - 1 && b.x >= At && b.x <= Mt) {
      cachedTrajResult.groundLanding = { x: b.x, y: k, t };
    }

    // Bounce detection (significant velocity deflection not due to gravity)
    const deltaVx = b.vx - prevVx;
    const deltaVy = b.vy - (prevVy + c.Ph * subF);
    const bounceMagnitude = Math.hypot(deltaVx, deltaVy);
    let isBounce = false;

    if (bounceMagnitude > 45) {
      isBounce = true;
      if (cachedTrajResult.bounceCount < MAX_TRAJ_BOUNCES) {
        let type: "ground" | "wall" | "ceiling" | "corner" | "post" = "wall";
        let normX = 0, normY = 0;
        if (Math.abs(deltaVy) > Math.abs(deltaVx) * 1.5) {
          type = deltaVy < 0 ? "ceiling" : "ground";
          normY = deltaVy < 0 ? 1 : -1;
        } else if (Math.abs(deltaVx) > Math.abs(deltaVy) * 1.5) {
          type = "wall";
          normX = deltaVx < 0 ? 1 : -1;
        } else {
          type = "corner";
          const dLen = Math.hypot(deltaVx, deltaVy) || 1;
          normX = deltaVx / dLen;
          normY = deltaVy / dLen;
        }
        const bObj = cachedTrajBounces[cachedTrajResult.bounceCount++];
        bObj.x = b.x;
        bObj.y = b.y;
        bObj.normalX = normX;
        bObj.normalY = normY;
        bObj.type = type;
        bObj.t = t;
      }
    }

    // Sample point at intervals or at exact bounce contact
    const shouldRecord = isBounce || (s % sampleInterval === 0);
    if (shouldRecord && cachedTrajResult.pointCount < MAX_TRAJ_POINTS) {
      const pt = cachedTrajPoints[cachedTrajResult.pointCount++];
      pt.x = b.x;
      pt.y = b.y;
      pt.vx = b.vx;
      pt.vy = b.vy;
      pt.t = t;
    }

    // Allow brief settle inside net after scoring then terminate
    if (cachedTrajResult.isGoal) {
      postGoalSteps++;
      if (postGoalSteps > 20) break;
    }

    // Stop if completely settled on floor
    if (b.y >= k - radius - 1 && Math.hypot(b.vx, b.vy) < 12) {
      break;
    }
  }

  return cachedTrajResult;
}

function em(u: any, f: number, isLegacy = false) {
  return simulateBallTrajectory(u, f, isLegacy);
}

function findBestBallIntercept(
  car: any,
  ball: any,
  teamDir: number,
  maxT: number = 1.8,
  isUnfair: boolean = false
) {
  const dt = 0.025; // 40 Hz resolution for high precision
  const maxSteps = Math.min(72, Math.ceil(maxT / dt));

  const legacy = activePhysicsMode === "legacy";
  const c = legacy ? LEGACY_PHYSICS : RL_PHYSICS;
  const b = {
    x: ball.x,
    y: ball.y,
    vx: ball.vx,
    vy: ball.vy,
    radius: ball.radius || 30
  };

  let bestIntercept = {
    t: 0.04,
    x: ball.x,
    y: ball.y,
    vx: ball.vx,
    vy: ball.vy,
    isAerial: ball.y < k - 95,
    dist: Math.hypot(ball.x - car.x, ball.y - car.y),
    isRebound: false,
    strikeTargetX: ball.x,
    strikeTargetY: ball.y,
    isSafe: false
  };
  let found = false;

  for (let step = 1; step <= maxSteps; step++) {
    const t = step * dt;
    const subF = dt / 2;
    stepBallPhysicsSubstep(b, subF, c.Ph, c.Uh, c.Hh);
    stepBallPhysicsSubstep(b, subF, c.Ph, c.Uh, c.Hh);

    const px = b.x, py = b.y;

    // Goal aiming strike offset: hit the ball on the side opposite the opponent goal!
    const oppGoalDef = teamDir > 0 ? ae : le;
    let oppGoalX = teamDir > 0 ? Mt : At;
    let oppGoalY = 530;
    if (activeMapDef.goalType === "floor") {
      oppGoalX = (oppGoalDef.xMin! + oppGoalDef.xMax!) / 2;
      oppGoalY = k + 60;
    } else if (activeMapDef.goalType === "ceiling") {
      oppGoalX = (oppGoalDef.xMin! + oppGoalDef.xMax!) / 2;
      oppGoalY = Qt - 40;
    } else {
      oppGoalY = (oppGoalDef.yMin! + oppGoalDef.yMax!) / 2;
    }
    const strikeAngle = Math.atan2(oppGoalY - py, oppGoalX - px);
    const strikeTargetX = px - Math.cos(strikeAngle) * 35;
    const strikeTargetY = py - Math.sin(strikeAngle) * 35;

    // STRICT ANTI-OWN-GOAL INVARIANT:
    // The car must be positioned to strike AWAY from its own net!
    // If the strike target requires driving towards own goal into the ball, skip it!
    const strikeRelativeDir = (strikeTargetX - car.x) * teamDir;
    const ballRelativeDir = (px - car.x) * teamDir;
    if (strikeRelativeDir < -15 || ballRelativeDir < -20) {
      continue;
    }

    const dx = strikeTargetX - car.x;
    const dy = strikeTargetY - car.y;
    const horizDist = Math.abs(dx);
    const heightClimb = Math.max(0, car.y - strikeTargetY);

    // Horizontal time:
    const isReversing = (car.vx > 100 && dx < -50) || (car.vx < -100 && dx > 50);
    const turnDelay = isReversing ? 0.12 : 0;
    const maxDriveSpeed = car.boost > 10 ? 980 : 480;
    const currentSpeed = Math.abs(car.vx);
    const effSpeed = Math.max(340, (currentSpeed + maxDriveSpeed) * 0.5);
    const reqTx = turnDelay + horizDist / effSpeed;

    // Vertical time:
    const isAerial = py < k - 95;
    let reqTy = 0;
    if (isAerial) {
      const minBoostNeeded = heightClimb / 32;
      if (car.boost < minBoostNeeded && car.isGrounded) {
        continue;
      }
      reqTy = car.isGrounded
        ? 0.12 + heightClimb / 560
        : Math.max(0.04, (heightClimb + Math.max(0, car.vy * 0.25)) / 650);
    }

    const totalReqT = Math.max(reqTx, reqTy);
    const isRebound = (teamDir > 0 && px < Mt - 100 && b.vx < -90) || (teamDir < 0 && px > At + 100 && b.vx > 90);

    if (totalReqT <= t * 1.10) {
      return {
        t,
        x: px,
        y: py,
        vx: b.vx,
        vy: b.vy,
        isAerial,
        dist: Math.hypot(dx, dy),
        isRebound,
        strikeTargetX,
        strikeTargetY,
        isSafe: true
      };
    }

    if (!found || Math.hypot(dx, dy) < bestIntercept.dist) {
      bestIntercept = {
        t,
        x: px,
        y: py,
        vx: b.vx,
        vy: b.vy,
        isAerial,
        dist: Math.hypot(dx, dy),
        isRebound,
        strikeTargetX,
        strikeTargetY,
        isSafe: true
      };
      found = true;
    }
  }

  return bestIntercept;
}

function lm(u: any, f: any, r: number) {
  // u = ball, f = ownGoal, r = teamDir
  // Blue (r = 1): goal at At = 120, Orange (r = -1): goal at Mt = 1880
  const legacy = activePhysicsMode === "legacy";
  const c = legacy ? LEGACY_PHYSICS : RL_PHYSICS;
  const b = {
    x: u.x,
    y: u.y,
    vx: u.vx,
    vy: u.vy,
    radius: u.radius || 30
  };

  const dt = 0.025;
  const maxSteps = 100; // 2.5 seconds ahead
  const subF = dt / 2;

  for (let step = 1; step <= maxSteps; step++) {
    const t = step * dt;
    stepBallPhysicsSubstep(b, subF, c.Ph, c.Uh, c.Hh);
    stepBallPhysicsSubstep(b, subF, c.Ph, c.Uh, c.Hh);

    if (activeMapDef.goalType === "floor") {
      const isOverOwnPit = r > 0
        ? (b.x >= le.xMin! - 20 && b.x <= le.xMax! + 20)
        : (b.x >= ae.xMin! - 20 && b.x <= ae.xMax! + 20);
      if (isOverOwnPit && b.y >= k - 50 && b.vy > -20) {
        return { isThreat: 1, interceptTime: t, interceptY: b.y };
      }
    } else if (activeMapDef.goalType === "ceiling") {
      const isUnderOwnVault = r > 0
        ? (b.x >= le.xMin! - 20 && b.x <= le.xMax! + 20)
        : (b.x >= ae.xMin! - 20 && b.x <= ae.xMax! + 20);
      if (isUnderOwnVault && b.y <= Qt + 60 && b.vy < 20) {
        return { isThreat: 1, interceptTime: t, interceptY: b.y };
      }
    } else {
      const isCrossingGoalX = r > 0 ? (b.x - b.radius <= At + 15) : (b.x + b.radius >= Mt - 15);
      if (isCrossingGoalX) {
        if (b.y >= f.yMin - 25 && b.y <= f.yMax + 25) {
          return { isThreat: 1, interceptTime: t, interceptY: b.y };
        }
        if (b.y < f.yMin - 25 && b.y > Qt + 20) {
          return { isThreat: 2, interceptTime: t, interceptY: b.y };
        }
        break;
      }
    }
  }

  return { isThreat: 0, interceptTime: 0, interceptY: 0 };
}

function Fs(u:any,f:any,r:any,s:any,y:any,m:any){
  if(!f||f.length===0)return null;
  const g=f.filter((p:any)=>p.active||p.cooldownTimer<.6);
  if(g.length===0)return null;
  if(m==="starve_corner"){
    const p=g.filter((A:any)=>A.type==="big"&&Math.abs(A.x-r)<400);
    if(p.length>0)return p.sort((A:any,C:any)=>Math.hypot(A.x-u.x,A.y-u.y)-Math.hypot(C.x-u.x,C.y-u.y)),p[0];
  }
  if(m==="defensive_route"){
    const p=g.filter((A:any)=>y>0?A.x<u.x:A.x>u.x);
    if(p.length>0)return p.sort((A:any,C:any)=>A.type==="big"&&C.type!=="big"?-1:C.type==="big"&&A.type!=="big"?1:Math.hypot(A.x-u.x,A.y-u.y)-Math.hypot(C.x-u.x,C.y-u.y)),p[0];
  }
  return g.sort((p:any,A:any)=>{
    const C=Math.hypot(p.x-u.x,p.y-u.y)-(p.type==="big"?220:0),z=Math.hypot(A.x-u.x,A.y-u.y)-(A.type==="big"?220:0);
    return C-z;
  }),g[0];
}

function isBallBehindCar(u: any, f: any, teamDir: number): boolean {
  // True only when the car has truly overshot the ball towards opponent net
  const ballBehindX = (u.x - f.x) * teamDir;
  return ballBehindX > 35;
}

function handleWrongSideRecovery(u: any, f: any, ownGoal: any, teamDir: number) {
  const retreatX = (ownGoal.x !== undefined ? ownGoal.x : (teamDir > 0 ? At : Mt)) + teamDir * 170;
  u.input.jump = false;
  u.input.pitchUp = false;
  u.input.pitchDown = false;
  u.input.boost = false;
  je(u, retreatX, false, false);
}

function Lv(u: any, f: any, r: any) {
  const ownGoal = u.team === "orange" ? ae : le;
  const teamDir = u.team === "orange" ? -1 : 1;
  const dist = Math.hypot(f.x - u.x, f.y - u.y);
  if (isBallBehindCar(u, f, teamDir) && dist > 55) {
    handleWrongSideRecovery(u, f, ownGoal, teamDir);
    return;
  }
  const s = f.x - u.x;
  s > 15 ? (u.input.throttleForward = true, u.input.steerRight = true) : s < -15 && (u.input.throttleForward = true, u.input.steerLeft = true);
}

function Vv(u: any, f: any, ownGoalX: number, oppGoalX: number, teamDir: number, dt: number) {
  const ownGoal = { x: ownGoalX, yMin: 380, yMax: 680 };
  const oppGoal = { x: oppGoalX, yMin: 380, yMax: 680 };
  if (tm(f)) { nm(u, f, teamDir, false, ownGoal, oppGoal); return; }
  if (u.botState) { u.botState.kickoffStrat = null; u.botState.kickoffFlipDone = false; }
  const dist = Math.hypot(f.x - u.x, f.y - u.y);
  if (isBallBehindCar(u, f, teamDir) && dist > 55) {
    handleWrongSideRecovery(u, f, ownGoal, teamDir);
    return;
  }
  je(u, f.x, true, false);
  if (f.y < u.y - 45 && Math.abs(f.x - u.x) < 75 && u.isGrounded && u.boost > 8) {
    Oe(u, "aerial");
  }
}

function Qv(u: any, f: any, oppCar: any, ownGoal: any, oppGoal: any, teamDir: number, dt: number, boostPads: any, tmCar: any) {
  if (tm(f)) { nm(u, f, teamDir, false, ownGoal, oppGoal); return; }
  if (u.botState) { u.botState.kickoffStrat = null; u.botState.kickoffFlipDone = false; }
  if (f.x < At + 30 || f.x > Mt - 30) {
    const waitX = f.x < At + 30 ? At + 140 : Mt - 140;
    je(u, waitX, false, false);
    return;
  }

  const distToBall = Math.hypot(f.x - u.x, f.y - u.y);
  if (isBallBehindCar(u, f, teamDir) && distToBall > 55) {
    handleWrongSideRecovery(u, f, ownGoal, teamDir);
    return;
  }

  // Defend own net if ball is incoming
  const threat = lm(f, ownGoal, teamDir);
  if (threat.isThreat === 1) { am(u, f, ownGoal, teamDir, threat.interceptTime, threat.interceptY); return; }

  const botEnv: ArenaEnv = {
    Kt, hl, k, Qt, At, Mt, F, zn, POST_INSET, le, ae,
    goalType: activeMapDef.goalType || "wall",
    isLegacy: activePhysicsMode === "legacy",
    pv, Ph, Uh, Hh, Av, Bh, cc, Gh, Ev, qh,
    wavedashMinSpeed: activePhysicsMode === "legacy" ? 1280 : (RL_PHYSICS.wavedashMinSpeed || 1280)
  };
  const intercept = solveBestIntercept(u, f, teamDir, botEnv, oppCar, tmCar, false, 1.6);
  const targetX = distToBall < 110 ? f.x + teamDir * 15 : (intercept.strikeTargetX || intercept.x);
  const targetY = intercept.strikeTargetY || intercept.y;
  const shootAngle = Math.atan2(intercept.targetCornerY - f.y, oppGoal.x - f.x);
  const cosShoot = Math.cos(shootAngle), sinShoot = Math.sin(shootAngle);

  if (u.isGrounded) {
    je(u, targetX, true, false);
    if (intercept.isAerial && f.y < k - 90) {
      const heightClimb = Math.max(0, u.y - intercept.y);
      const climbTime = 0.10 + heightClimb / 580;
      const horizDist = Math.abs(u.x - targetX);
      const maxLaunchDist = Math.max(90, Math.abs(u.vx) * climbTime + 75);
      if (u.canJump && !u.isFlipping && u.boost > 8 && intercept.t <= climbTime + 0.16 && horizDist <= maxLaunchDist) {
        startBotJumpSeq(u, "fast_aerial");
      }
    } else {
      if (distToBall <= 52 && Math.abs(u.x - f.x) <= 44 && u.canJump && !u.isFlipping) {
        startBotJumpSeq(u, "dodge", cosShoot, Math.min(-0.15, sinShoot * 0.85));
      }
    }
  } else {
    jn(u, targetX, targetY, 0.45, false, intercept.t);
    if (distToBall <= 85 && (u.jumpCount === 1 || u.hasFlipReset)) {
      startBotJumpSeq(u, "dodge", cosShoot, sinShoot * 0.85);
    }
  }
}

function Zv(
  u: any,
  f: any,
  oppCar: any,
  ownGoal: any,
  oppGoal: any,
  teamDir: number,
  dt: number,
  evtObj: any,
  isUnfair: boolean,
  boostPads: any,
  tmCar: any,
  allTeammates?: any[]
) {
  const botEnv: ArenaEnv = {
    Kt,
    hl,
    k,
    Qt,
    At,
    Mt,
    F,
    zn,
    POST_INSET,
    le,
    ae,
    goalType: activeMapDef.goalType || "wall",
    isLegacy: activePhysicsMode === "legacy",
    pv,
    Ph,
    Uh,
    Hh,
    Av,
    Bh,
    cc,
    Gh,
    Ev,
    qh,
    wavedashMinSpeed: activePhysicsMode === "legacy" ? 1280 : (RL_PHYSICS.wavedashMinSpeed || 1280)
  };

  executeMasterBotBrain(
    u,
    f,
    oppCar,
    tmCar,
    allTeammates || [],
    teamDir,
    dt,
    botEnv,
    isUnfair,
    boostPads,
    evtObj
  );
}

function Kv(u: any, f: any, oppGoal: any, targetCornerY: number, teamDir: number, dt: number, p: any) {
  const goalDist = Math.abs(u.x - oppGoal.x), dist = Math.hypot(f.x - u.x, f.y - u.y);
  if (u.isGrounded) {
    je(u, f.x - teamDir * 15, true, false);
    if (Math.abs(u.x - f.x) < 85 && u.boost > 10) Oe(u, "aerial");
    return;
  }

  const sweetX = f.x - teamDir * 10, sweetY = f.y + 16;
  const targetAngle = Math.atan2(targetCornerY - u.y, oppGoal.x - u.x) - 0.18;
  const angleDiff = Math.atan2(Math.sin(targetAngle - u.angle), Math.cos(targetAngle - u.angle));

  if (angleDiff > 0.08) { u.input.steerRight = true; u.input.steerLeft = false; }
  else if (angleDiff < -0.08) { u.input.steerLeft = true; u.input.steerRight = false; }
  else { u.input.steerLeft = false; u.input.steerRight = false; }

  u.input.throttleForward = true;

  const needsLift = u.y > sweetY - 2 || u.vy > f.vy - 15;
  u.input.boost = needsLift && u.boost > 0;

  if (goalDist < 280 && dist < 85 && (u.jumpCount === 1 || u.hasFlipReset)) {
    const shootAngle = Math.atan2(targetCornerY - f.y, oppGoal.x - f.x);
    Oe(u, "dodge", Math.cos(shootAngle), Math.sin(shootAngle) * 0.8);
    if (p && Math.random() < 0.6) p.chatMessage = "Air dribble dunk! 💥";
  }
}

function am(u: any, f: any, ownGoal: any, teamDir: number, interceptTime: number, interceptY: number) {
  // Never abort a save unless the ball is already physically inside the net
  const isBallInsideNet = (f.x - ownGoal.x) * teamDir < -25;
  if (isBallInsideNet) return;

  const targetSaveY = Math.max(ownGoal.yMin + 25, Math.min(ownGoal.yMax - 25, interceptY));
  const dist = Math.hypot(f.x - u.x, f.y - u.y);
  const clearDirX = teamDir; // Always away from own net!
  const clearDirY = -0.45; // High upfield clear!

  const isHighBall = f.y < k - 90 || targetSaveY < k - 80;
  const heightClimb = Math.max(0, u.y - targetSaveY);
  const climbTime = 0.10 + heightClimb / 580;

  // Station grounded goalie slightly outside own goal plane
  const goalGuardX = ownGoal.x + teamDir * 65;
  const isGoalieBehindBall = (f.x - u.x) * teamDir > 0;

  if (u.isGrounded) {
    if (isHighBall) {
      // Position between goal and ball on ground until launch window
      je(u, goalGuardX, true, false);
      if (interceptTime <= climbTime + 0.16 && u.boost > 8 && u.canJump && !u.isFlipping) {
        Oe(u, "aerial");
      }
    } else {
      // Ground ball defense:
      if (isGoalieBehindBall) {
        // Goalie is safely between goal and ball: charge outward into ball and clear!
        je(u, f.x, true, false);
        if (dist <= 75 && u.canJump && !u.isFlipping) {
          Oe(u, "dodge", clearDirX, clearDirY);
        }
      } else {
        // Ball is behind goalie: safely position at goal guard post
        je(u, goalGuardX, false, false);
      }
    }
  } else {
    // Airborne save: meet ball at goal plane or incoming trajectory
    const targetSaveX = ownGoal.x + teamDir * 45;
    jn(u, targetSaveX, targetSaveY, 0.45, false, interceptTime);
    if (dist <= 85 && (u.jumpCount === 1 || u.hasFlipReset)) {
      Oe(u, "dodge", clearDirX, clearDirY);
    }
  }
}

function Jv(u: any, f: any, ownGoal: any, teamDir: number) {
  const backboardX = ownGoal.x + teamDir * 60;
  const dist = Math.hypot(f.x - u.x, f.y - u.y);
  if (u.isGrounded) {
    je(u, backboardX, true, false);
    if (Math.abs(u.x - backboardX) < 180 && f.y < k - 100) Oe(u, "aerial");
  } else {
    if ((f.x - u.x) * teamDir < 0 && dist < 120) {
      return;
    }
    jn(u, f.x, f.y, 0.45);
    if (dist < 110 && (u.jumpCount === 1 || u.hasFlipReset)) {
      Oe(u, "dodge", teamDir, -0.4);
    }
  }
}

function nm(u: any, f: any, teamDir: number, isSecondary: boolean = false, ownGoal: any = null, oppGoal: any = null, oppCar: any = null) {
  if (isSecondary && ownGoal) {
    const safeHoldX = ownGoal.x + teamDir * 160;
    je(u, safeHoldX, false, false);
    return;
  }

  const s = f.x - u.x;
  const dist = Math.hypot(s, f.y - u.y);
  const ballAhead = s * teamDir;

  // STRICT ANTI-OWN-GOAL SAFEGUARD ON KICKOFF:
  // If the car has overshot or is on the wrong side of the ball, NEVER hit the ball towards own net!
  if (ballAhead < -10) {
    u.input.boost = false;
    u.input.throttleForward = false;
    u.input.throttleReverse = false;
    if (u.isGrounded) {
      u.input.jump = true;
      u.input.pitchUp = true;
    }
    if (teamDir > 0) {
      u.input.steerLeft = true;
      u.input.steerRight = false;
    } else {
      u.input.steerRight = true;
      u.input.steerLeft = false;
    }
    return;
  }

  // Initialize competitive kickoff strategy
  const z = u.botState;
  if (!z.kickoffStrat) {
    const diff = u.botDifficulty || "ssl";
    if (diff === "ssl" || diff === "unfair") {
      const rand = Math.random();
      if (rand < 0.60) z.kickoffStrat = "power_blast";
      else if (rand < 0.85) z.kickoffStrat = "chip_strike";
      else z.kickoffStrat = "delayed_50";
    } else if (diff === "allstar") {
      const rand = Math.random();
      if (rand < 0.50) z.kickoffStrat = "power_blast";
      else z.kickoffStrat = "chip_strike";
    } else {
      z.kickoffStrat = "power_blast";
    }
    z.kickoffFlipDone = false;
  }

  // Pure grounded sprint: 100% throttle + continuous boost
  u.input.throttleForward = true;
  if (s > 1.5) {
    u.input.steerRight = true;
    u.input.steerLeft = false;
  } else if (s < -1.5) {
    u.input.steerLeft = true;
    u.input.steerRight = false;
  } else {
    u.input.steerLeft = false;
    u.input.steerRight = false;
  }

  // Continuous rocket boost straight through the ball
  if (u.boost > 0) {
    u.input.boost = true;
  }

  // If car is rotated away from the ball while on the ground, handbrake turn immediately toward the ball!
  const isFacingBall = (s > 0 && Math.cos(u.angle) > 0.1) || (s < 0 && Math.cos(u.angle) < -0.1);
  if (!isFacingBall && u.isGrounded) {
    u.input.handbrake = true;
  }

  // LETHAL CONTACT POWER-DODGE:
  // The car stays firmly grounded on approach to guarantee 100% collision contact!
  // At the exact moment of physical contact (dist <= 48), fire the power dodge through the ball!
  // This delivers a 120+ km/h supersonic blast directly into the opponent's net!
  if (dist <= 48 && u.canJump && !u.isFlipping) {
    const pitch = z.kickoffStrat === "chip_strike" ? -0.22 : -0.10;
    Oe(u, "dodge", teamDir, pitch);
  }
}

function je(u: any, targetX: number, allowBoost: boolean = true, allowFlip: boolean = false) {
  const s = targetX - u.x, distX = Math.abs(s);
  const driveDir = s > 0 ? 1 : -1;

  if (s > 3) {
    u.input.steerRight = true;
    u.input.steerLeft = false;
    u.input.throttleForward = true;
  } else if (s < -3) {
    u.input.steerLeft = true;
    u.input.steerRight = false;
    u.input.throttleForward = true;
  } else {
    u.input.throttleForward = true;
    u.input.steerLeft = false;
    u.input.steerRight = false;
  }

  const isFacingRight = Math.cos(u.angle) > 0.2, isFacingLeft = Math.cos(u.angle) < -0.2;
  const isAligned = (s > 0 && isFacingRight) || (s < 0 && isFacingLeft);

  // Proactive Car-in-Front Obstacle Detection & Avoidance
  let carInFront: any = null;
  let minDistInFront = 999;
  if (u._otherCars && u._otherCars.length > 0) {
    for (const other of u._otherCars) {
      if (other.isDemoed) continue;
      const dx = other.x - u.x;
      const dy = other.y - u.y;
      const isAhead = dx * driveDir > 0;
      const dX = Math.abs(dx);
      const dY = Math.abs(dy);
      if (isAhead && dX < 135 && dY < 45) {
        if (dX < minDistInFront) {
          minDistInFront = dX;
          carInFront = other;
        }
      }
    }
  }

  if (carInFront) {
    const isTeammate = carInFront.team === u.team;
    const canAttemptDemo = !isTeammate && u.isSupersonic && (u.supersonicTimer || 0) >= 0.05;

    // 1. NEVER boost into a car directly in front unless actively executing a supersonic demolition
    if (!canAttemptDemo) {
      allowBoost = false;
      u.input.boost = false;
    }

    // 2. If actively pushing / contacting another car, break deadlock immediately
    if ((u._carContactTicks || 0) > 3 || minDistInFront < 58) {
      if (u.isGrounded && u.canJump && !u.isFlipping) {
        Oe(u, "dodge", driveDir, -0.45);
        return;
      } else {
        u.input.throttleForward = false;
        u.input.throttleReverse = true;
        u.input.handbrake = true;
        return;
      }
    }

    // 3. Approaching car in front: dodge over if moving fast
    if (minDistInFront < 90 && u.isGrounded && u.canJump && !u.isFlipping && Math.abs(u.vx) > 160) {
      Oe(u, "dodge", driveDir, -0.4);
      return;
    }
  }

  if (allowBoost && isAligned && u.boost > 0) {
    u.input.boost = true;
  }

  const isOpposingVelocity = (s > 60 && u.vx < -120) || (s < -60 && u.vx > 120);
  if (isOpposingVelocity && u.isGrounded) {
    u.input.handbrake = true;
    u.input.throttleForward = true;
  }

  // Only forward flip if explicitly allowed AND far away from any delicate play
  if (allowFlip && !carInFront && u.boost < 15 && u.isGrounded && u.canJump && !u.isFlipping && distX > 380 && isAligned && Math.abs(u.vx) > 130) {
    Oe(u, "dodge", s > 0 ? 1 : -1, -0.2);
  }
}

function jn(u: any, targetX: number, targetY: number, maxBoostAngle: number = 0.65, desiredInverted?: boolean, explicitT?: number) {
  const dx = targetX - u.x, dy = targetY - u.y;
  const dist = Math.hypot(dx, dy);

  // Flight time estimate to target (use explicit trajectory time if provided)
  const spd = Math.hypot(u.vx, u.vy);
  const estT = (explicitT && explicitT > 0.04)
    ? Math.min(1.8, explicitT)
    : Math.max(0.10, Math.min(1.2, dist / Math.max(480, spd)));

  // Exact Newtonian required acceleration to reach target at estT under gravity pv
  const needAx = 2 * (dx - u.vx * estT) / (estT * estT);
  const needAy = 2 * (dy - u.vy * estT) / (estT * estT) - pv;

  const desiredAngle = Math.atan2(needAy, needAx);
  const angleDiff = Math.atan2(Math.sin(desiredAngle - u.angle), Math.cos(desiredAngle - u.angle));

  // Steering: deadzone to eliminate vibration/jitter (Av = 6.0 rad/s -> ~0.10 rad/frame)
  const deadzone = 0.08;
  if (angleDiff > deadzone) {
    u.input.steerRight = true;
    u.input.steerLeft = false;
  } else if (angleDiff < -deadzone) {
    u.input.steerLeft = true;
    u.input.steerRight = false;
  } else {
    u.input.steerLeft = false;
    u.input.steerRight = false;
  }

  // Clear pitch inputs so they do not conflict with or override air steering
  u.input.pitchUp = false;
  u.input.pitchDown = false;
  u.input.throttleForward = true;

  // Air roll handling for inverted / flip reset
  if (desiredInverted !== undefined) {
    if (desiredInverted !== !!u.airRollInverted) {
      if (!u._prevAirRollRight) {
        u.input.airRollRight = true;
      } else {
        u.input.airRollRight = false;
      }
    } else {
      u.input.airRollRight = false;
      u.input.airRollLeft = false;
    }
  }

  // Responsive boost gating: fire boost when aligned, ascending to meet high ball, or punching through contact
  const isAscendingNeed = needAy < -150 && Math.sin(u.angle) < -0.25;
  const isCloseStrike = dist < 75 && Math.abs(angleDiff) <= 1.2;
  if ((Math.abs(angleDiff) <= maxBoostAngle || isAscendingNeed || isCloseStrike) && u.boost > 0) {
    u.input.boost = true;
  } else {
    u.input.boost = false;
  }
}
export interface AutoCamState {
  x: number;
  y: number;
  zoom: number;
  initialized: boolean;
}

export const autoCamState: AutoCamState = {
  x: 1000,
  y: 550,
  zoom: 1.0,
  initialized: false
};

export function resetAutoCam(targetX?: number, targetY?: number) {
  autoCamState.x = targetX !== undefined ? targetX : (Kt / 2);
  autoCamState.y = targetY !== undefined ? targetY : (hl / 2);
  autoCamState.zoom = 1.0;
  autoCamState.initialized = false;
}

function kv(u: any, f: any, r: any, s: any, y: any, m: any = {}) {
  const canvas = u.canvas;
  if (!canvas) return;

  const isOffscreen = !canvas.clientWidth && !canvas.parentElement;
  const dpr = isOffscreen ? 1 : Math.min(window.devicePixelRatio || 1, 2);
  const displayW = canvas.clientWidth || (canvas.width ? canvas.width / dpr : window.innerWidth);
  const displayH = canvas.clientHeight || (canvas.height ? canvas.height / dpr : window.innerHeight);
  const targetW = Math.round(displayW * dpr);
  const targetH = Math.round(displayH * dpr);

  if (canvas.width !== targetW || canvas.height !== targetH) {
    canvas.width = targetW;
    canvas.height = targetH;
  }

  u.save();
  u.clearRect(0, 0, targetW, targetH);
  u.scale(dpr, dpr);

  const ARENA_W = Kt;
  const ARENA_H = hl;

  const isTouchScreen = typeof window !== "undefined" && (("ontouchstart" in window) || (navigator.maxTouchPoints > 0) || (window.matchMedia && window.matchMedia("(pointer: coarse)").matches));
  const isLandscapeMobile = isTouchScreen && displayH < 560;

  // Base scale: scale arena to cleanly fit screen height/width without artificial shrinking
  const baseScale = Math.min(displayW / ARENA_W, displayH / ARENA_H);

  const isAutoCamEnabled = m.autoCam !== false;

  let targetX = ARENA_W / 2;
  let targetY = ARENA_H / 2;
  let targetZoom = 1.0;

  if (isAutoCamEnabled && r) {
    const ball = r;
    const cars = (f || []).filter((c: any) => !c.isDemoed);
    const humanCar = cars.find((c: any) => !c.isBot);

    let closestCar: any = null;
    let closestDist = Infinity;
    for (const car of cars) {
      const d = Math.hypot(car.x - ball.x, car.y - ball.y);
      if (d < closestDist) {
        closestDist = d;
        closestCar = car;
      }
    }

    const primaryCar = (humanCar && Math.hypot(humanCar.x - ball.x, humanCar.y - ball.y) < 1100)
      ? humanCar
      : closestCar;

    if (primaryCar && closestDist < 1200) {
      targetX = ball.x * 0.62 + primaryCar.x * 0.38;
      targetY = ball.y * 0.62 + primaryCar.y * 0.38;
    } else {
      targetX = ball.x;
      targetY = ball.y;
    }

    // Velocity lookahead in ball motion direction
    const ballVx = ball.vx || 0;
    const ballVy = ball.vy || 0;
    targetX += Math.max(-280, Math.min(280, ballVx * 0.16));
    targetY += Math.max(-140, Math.min(140, ballVy * 0.12));

    // Dynamic zoom calculation: zoom in for close dribbles/flicks, zoom out for supersonic clears
    const ballSpeed = Math.hypot(ballVx, ballVy);
    const separation = primaryCar ? Math.hypot(ball.x - primaryCar.x, ball.y - primaryCar.y) : 500;

    const isMobile = isLandscapeMobile || (displayH < 600);
    const isHugeMap = ARENA_W >= 3400;
    const isLargeMap = ARENA_W >= 2600;
    const maxZoom = isMobile ? 1.62 : (isHugeMap ? 1.68 : isLargeMap ? 1.58 : 1.48);
    const minZoom = isMobile ? 1.22 : (isHugeMap ? 1.08 : isLargeMap ? 1.04 : 1.00);

    const speedRatio = Math.min(1, ballSpeed / 1600);
    const sepRatio = Math.min(1, separation / 900);
    const zoomReduction = (speedRatio * 0.55 + sepRatio * 0.45) * (maxZoom - minZoom);

    targetZoom = maxZoom - zoomReduction;

    if (ball.isGoalScored) {
      targetZoom = Math.min(maxZoom, 1.55);
    }
  }

  // Smooth exponential damping
  if (!autoCamState.initialized) {
    autoCamState.x = targetX;
    autoCamState.y = targetY;
    autoCamState.zoom = targetZoom;
    autoCamState.initialized = true;
  } else {
    const panLerp = 0.08;
    const zoomLerp = 0.045;
    autoCamState.x += (targetX - autoCamState.x) * panLerp;
    autoCamState.y += (targetY - autoCamState.y) * panLerp;
    autoCamState.zoom += (targetZoom - autoCamState.zoom) * zoomLerp;
  }

  const currentScale = baseScale * autoCamState.zoom;
  const viewW = displayW / currentScale;
  const viewH = displayH / currentScale;

  let clampedCamX = autoCamState.x;
  let clampedCamY = autoCamState.y;

  if (viewW >= ARENA_W) {
    clampedCamX = ARENA_W / 2;
  } else {
    const minX = viewW / 2;
    const maxX = ARENA_W - viewW / 2;
    if (minX <= maxX) {
      clampedCamX = Math.max(minX, Math.min(maxX, clampedCamX));
    } else {
      clampedCamX = ARENA_W / 2;
    }
  }

  if (viewH >= ARENA_H) {
    clampedCamY = ARENA_H / 2;
  } else {
    const minY = viewH / 2;
    const maxY = ARENA_H - viewH / 2;
    if (minY <= maxY) {
      clampedCamY = Math.max(minY, Math.min(maxY, clampedCamY));
    } else {
      clampedCamY = ARENA_H / 2;
    }
  }

  const offsetX = Math.round(displayW / 2 - clampedCamX * currentScale);
  const offsetY = Math.round(displayH / 2 - clampedCamY * currentScale);

  activeCameraTransform.offsetX = offsetX;
  activeCameraTransform.offsetY = offsetY;
  activeCameraTransform.scale = currentScale;

  const viewMinX = Math.round(-offsetX / currentScale);
  const viewMaxX = Math.round((displayW - offsetX) / currentScale);
  const viewMinY = Math.round(-offsetY / currentScale);
  const viewMaxY = Math.round((displayH - offsetY) / currentScale);

  u.save();
  u.translate(offsetX, offsetY);
  u.scale(currentScale, currentScale);

  Fv(u, m.arenaTheme || "classic", viewMinX, viewMaxX, viewMinY, viewMaxY);

  for (const g of s) Wv(u, g);
  m.showTrajectory && Pv(u, r, m.physicsMode === "legacy");
  $v(u, r);
  ngBacking(u, viewMinX, viewMaxX);
  for (const g of f) g.isDemoed ? ag(u, g) : (tg(u, g), eg(u, g, m));
  Iv(u, r, m);
  ngForeground(u, viewMinX, viewMaxX);
  ug(u, y);



  u.restore();

  // Screen-space Offscreen Ball Beacon Indicator (when zoomed in)
  if (r && autoCamState.zoom > 1.08) {
    const ballScreenX = offsetX + r.x * currentScale;
    const ballScreenY = offsetY + r.y * currentScale;
    const margin = 38;
    const isOffscreen = ballScreenX < margin || ballScreenX > displayW - margin || ballScreenY < margin || ballScreenY > displayH - margin;

    if (isOffscreen) {
      const centerX = displayW / 2;
      const centerY = displayH / 2;
      const dx = ballScreenX - centerX;
      const dy = ballScreenY - centerY;
      const angle = Math.atan2(dy, dx);

      const halfW = displayW / 2 - margin;
      const halfH = displayH / 2 - margin;
      const tX = dx !== 0 ? Math.abs(halfW / Math.cos(angle)) : Infinity;
      const tY = dy !== 0 ? Math.abs(halfH / Math.sin(angle)) : Infinity;
      const t = Math.min(tX, tY);

      const beaconX = centerX + Math.cos(angle) * t;
      const beaconY = centerY + Math.sin(angle) * t;

      u.save();
      u.translate(beaconX, beaconY);

      u.shadowColor = "rgba(251, 191, 36, 0.85)";
      u.shadowBlur = 14;
      u.fillStyle = "rgba(15, 23, 42, 0.94)";
      u.strokeStyle = "#fbbf24";
      u.lineWidth = 2.5;
      u.beginPath();
      u.arc(0, 0, 18, 0, Math.PI * 2);
      u.fill();
      u.stroke();
      u.shadowBlur = 0;

      u.rotate(angle);
      u.fillStyle = "#fbbf24";
      u.beginPath();
      u.moveTo(23, 0);
      u.lineTo(15, -6);
      u.lineTo(15, 6);
      u.closePath();
      u.fill();
      u.rotate(-angle);

      u.font = "14px system-ui";
      u.textAlign = "center";
      u.textBaseline = "middle";
      u.fillText("⚽", 0, 0);

      u.restore();
    }
  }

  u.restore();
}

function Fv(
  u: any,
  theme: string = "classic",
  viewMinX: number = 0,
  viewMaxX: number = Kt,
  viewMinY: number = 0,
  viewMaxY: number = hl
) {
  u.save();

  const minX = Math.min(0, viewMinX);
  const maxX = Math.max(Kt, viewMaxX);
  const minY = Math.min(0, viewMinY);
  const maxY = Math.max(hl, viewMaxY);
  const totalW = maxX - minX;

  // 1. OUTDOOR SKY GRADIENT (Between pitch walls At to Mt, from Qt=120 to horizon y=380)
  const skyGrad = u.createLinearGradient(0, Qt, 0, 380);
  if (theme === "neon_night") {
    skyGrad.addColorStop(0, "#050814");
    skyGrad.addColorStop(0.6, "#0b112c");
    skyGrad.addColorStop(1, "#02050e");
  } else if (theme === "sunset_champions") {
    skyGrad.addColorStop(0, "#1a0b2e");
    skyGrad.addColorStop(0.5, "#2d124d");
    skyGrad.addColorStop(1, "#f97316");
  } else {
    skyGrad.addColorStop(0, "#5ba5f5");
    skyGrad.addColorStop(0.55, "#7ab9fa");
    skyGrad.addColorStop(1, "#abd8fd");
  }
  u.fillStyle = skyGrad;
  u.fillRect(minX, minY, totalW, 380 - minY);

  // 2. STYLIZED PUFFY CLOUDS (Inside outdoor pitch window)
  const drawCloud = (cx: number, cy: number, scale: number) => {
    u.save();
    u.translate(cx, cy);
    u.scale(scale, scale);
    u.fillStyle = "#ffffff";
    u.beginPath();
    u.arc(0, 0, 38, 0, Math.PI * 2);
    u.arc(-32, 8, 28, 0, Math.PI * 2);
    u.arc(34, 6, 30, 0, Math.PI * 2);
    u.arc(-58, 16, 20, 0, Math.PI * 2);
    u.arc(56, 16, 22, 0, Math.PI * 2);
    u.fill();
    u.fillStyle = "rgba(195, 222, 252, 0.42)";
    u.beginPath();
    u.arc(0, 10, 34, 0, Math.PI);
    u.arc(-32, 16, 25, 0, Math.PI);
    u.arc(34, 14, 26, 0, Math.PI);
    u.fill();
    u.restore();
  };

  drawCloud(340, 160, 0.9);
  drawCloud(680, 145, 1.1);
  drawCloud(1320, 145, 1.1);
  drawCloud(1660, 160, 0.9);

  // 3. DISTANT CITY SKYLINE (Centered behind pitch)
  u.fillStyle = "#7296ac";
  const skyline = [
    { x: -160, w: 60, h: 120 },
    { x: -90, w: 50, h: 150 },
    { x: -30, w: 55, h: 100 },
    { x: 35, w: 50, h: 130 },
    { x: 95, w: 65, h: 90 },
    { x: 190, w: 55, h: 140 },
    { x: 250, w: 45, h: 90 },
    { x: 300, w: 60, h: 160 },
    { x: 365, w: 40, h: 110 },
    { x: 410, w: 50, h: 130 },
    { x: 465, w: 65, h: 85 },
    { x: 535, w: 45, h: 150 },
    { x: 585, w: 55, h: 100 },
    { x: 645, w: 50, h: 175 },
    { x: 700, w: 70, h: 120 },
    { x: 775, w: 55, h: 145 },
    { x: 835, w: 60, h: 95 },
    { x: 900, w: 50, h: 165 },
    { x: 955, w: 90, h: 130 },
    { x: 1050, w: 55, h: 180 },
    { x: 1110, w: 60, h: 110 },
    { x: 1175, w: 45, h: 155 },
    { x: 1225, w: 65, h: 90 },
    { x: 1295, w: 50, h: 170 },
    { x: 1350, w: 60, h: 135 },
    { x: 1415, w: 45, h: 105 },
    { x: 1465, w: 70, h: 150 },
    { x: 1540, w: 50, h: 115 },
    { x: 1595, w: 60, h: 160 },
    { x: 1660, w: 55, h: 95 },
    { x: 1720, w: 65, h: 140 },
    { x: 1790, w: 50, h: 110 },
    { x: 1850, w: 60, h: 145 },
    { x: 1920, w: 55, h: 115 },
    { x: 1985, w: 65, h: 155 },
    { x: 2060, w: 50, h: 90 },
    { x: 2120, w: 70, h: 135 }
  ];
  const horizonBaseY = 360;
  const skylineSpan = 2300;
  const minRep = Math.floor(minX / skylineSpan);
  const maxRep = Math.ceil(maxX / skylineSpan);

  for (let rep = minRep; rep <= maxRep; rep++) {
    const shiftX = rep * skylineSpan;
    for (const b of skyline) {
      const bx = b.x + shiftX;
      if (bx + b.w >= minX && bx <= maxX) {
        u.fillRect(bx, horizonBaseY - b.h, b.w, b.h);
        if (b.h > 150) {
          u.strokeStyle = "#5f8398";
          u.lineWidth = 2.5;
          u.beginPath();
          u.moveTo(bx + b.w / 2, horizonBaseY - b.h);
          u.lineTo(bx + b.w / 2, horizonBaseY - b.h - 24);
          u.stroke();
        }
      }
    }
  }

  // 4. LUSH GREEN TREES / BUSH CANOPY
  const treeY = 360;
  const startTx = Math.floor((minX - 48) / 48) * 48;
  const endTx = Math.ceil((maxX + 48) / 48) * 48;
  for (let tx = startTx; tx <= endTx; tx += 48) {
    u.fillStyle = "#3e8c47";
    u.beginPath();
    u.arc(tx, treeY, 34, 0, Math.PI * 2);
    u.fill();
    u.fillStyle = "#4fa758";
    u.beginPath();
    u.arc(tx + 8, treeY - 8, 25, 0, Math.PI * 2);
    u.fill();
    u.fillStyle = "#63bf6d";
    u.beginPath();
    u.arc(tx + 12, treeY - 14, 15, 0, Math.PI * 2);
    u.fill();
  }

  // 5. STADIUM FLOODLIGHT TOWERS (Symmetrical at 390 and 1610)
  const drawLightTower = (tx: number) => {
    u.save();
    u.strokeStyle = "#475569";
    u.lineWidth = 5;
    u.beginPath();
    u.moveTo(tx - 18, 360);
    u.lineTo(tx - 12, 235);
    u.moveTo(tx + 18, 360);
    u.lineTo(tx + 12, 235);
    u.stroke();

    u.strokeStyle = "#64748b";
    u.lineWidth = 2.5;
    for (let yb = 330; yb > 240; yb -= 28) {
      u.beginPath();
      u.moveTo(tx - 16, yb);
      u.lineTo(tx + 16, yb - 20);
      u.moveTo(tx + 16, yb);
      u.lineTo(tx - 16, yb - 20);
      u.stroke();
    }

    u.fillStyle = "#1e293b";
    u.strokeStyle = "#0f172a";
    u.lineWidth = 2;
    u.beginPath();
    u.roundRect(tx - 52, 190, 104, 46, 4);
    u.fill();
    u.stroke();

    for (let col = 0; col < 4; col++) {
      for (let row = 0; row < 3; row++) {
        const lx = tx - 38 + col * 25;
        const ly = 200 + row * 13;
        const lampGlow = u.createRadialGradient(lx, ly, 1, lx, ly, 8);
        lampGlow.addColorStop(0, "rgba(255, 255, 255, 1)");
        lampGlow.addColorStop(0.5, "rgba(254, 240, 138, 0.9)");
        lampGlow.addColorStop(1, "rgba(254, 240, 138, 0)");
        u.fillStyle = lampGlow;
        u.beginPath();
        u.arc(lx, ly, 8, 0, Math.PI * 2);
        u.fill();

        u.fillStyle = "#ffffff";
        u.beginPath();
        u.arc(lx, ly, 4.5, 0, Math.PI * 2);
        u.fill();
      }
    }
    u.restore();
  };

  drawLightTower(At + (Mt - At) * 0.18);
  drawLightTower(At + (Mt - At) * 0.82);

  // 6. STADIUM GRANDSTAND STANDS & CROWD (Inside arena: At to Mt)
  u.fillStyle = "#263346";
  u.fillRect(At, 355, Mt - At, 185);

  const crowdRows = [
    { y: 380, h: 24 },
    { y: 408, h: 26 },
    { y: 438, h: 28 },
    { y: 470, h: 32 },
    { y: 506, h: 34 }
  ];

  for (const row of crowdRows) {
    u.fillStyle = "#1e293b";
    u.fillRect(At, row.y, Mt - At, row.h);
    u.strokeStyle = "rgba(100, 116, 139, 0.4)";
    u.lineWidth = 1.5;
    u.beginPath();
    u.moveTo(At, row.y);
    u.lineTo(Mt, row.y);
    u.stroke();

    for (let cx = At + 12; cx < Mt - 12; cx += 16) {
      const randVal = Math.sin(cx * 12.3 + row.y * 3.7);
      let dotColor = "#38bdf8";
      if (randVal > 0.45) dotColor = "#fb923c";
      else if (randVal > 0.15) dotColor = "#ffffff";
      else if (randVal > -0.2) dotColor = "#94a3b8";
      else if (randVal > -0.55) dotColor = "#0284c7";
      else dotColor = "#ea580c";

      u.fillStyle = dotColor;
      u.beginPath();
      u.arc(cx + (randVal * 3), row.y + row.h / 2, 4.5, 0, Math.PI * 2);
      u.fill();
    }
  }

  // 7. SLEEK STADIUM BACK WALL (Inside arena: At to Mt, down to dasher boards)
  const dasherH = 55;
  const dasherY = k - dasherH;
  const crowdBottomY = 540;
  const wallH = Math.max(50, dasherY - crowdBottomY);

  const wallGrad = u.createLinearGradient(0, crowdBottomY, 0, dasherY);
  wallGrad.addColorStop(0, "#1e293b");
  wallGrad.addColorStop(0.4, "#182230");
  wallGrad.addColorStop(1, "#0f172a");
  u.fillStyle = wallGrad;
  u.fillRect(At, crowdBottomY, Mt - At, wallH);

  // Architectural panel seams on the stadium wall
  u.strokeStyle = "rgba(255, 255, 255, 0.06)";
  u.lineWidth = 2;
  for (let px = At + 160; px < Mt; px += 160) {
    u.beginPath();
    u.moveTo(px, crowdBottomY);
    u.lineTo(px, dasherY);
    u.stroke();
  }
  u.strokeStyle = "rgba(255, 255, 255, 0.08)";
  u.beginPath();
  const midWallY = crowdBottomY + wallH * 0.5;
  u.moveTo(At, midWallY);
  u.lineTo(Mt, midWallY);
  u.stroke();

  // 8. HANGING TEAM BANNERS (Symmetrical at midfield)
  const drawTeamBanner = (x: number, isBlue: boolean) => {
    u.save();
    const bannerW = 58;
    const bannerH = 150;
    const by = 330;

    u.strokeStyle = "#334155";
    u.lineWidth = 4;
    u.beginPath();
    u.moveTo(x - bannerW / 2 - 8, by);
    u.lineTo(x + bannerW / 2 + 8, by);
    u.stroke();

    u.fillStyle = isBlue ? "#2563eb" : "#ea580c";
    u.beginPath();
    u.moveTo(x - bannerW / 2, by);
    u.lineTo(x + bannerW / 2, by);
    u.lineTo(x + bannerW / 2, by + bannerH);
    u.lineTo(x, by + bannerH + 18);
    u.lineTo(x - bannerW / 2, by + bannerH);
    u.closePath();
    u.fill();

    u.strokeStyle = "rgba(255, 255, 255, 0.85)";
    u.lineWidth = 2.5;
    u.stroke();

    u.strokeStyle = "#ffffff";
    u.lineWidth = 3;
    u.fillStyle = "rgba(255, 255, 255, 0.2)";
    u.beginPath();
    u.moveTo(x - 15, by + 32);
    u.lineTo(x + 15, by + 32);
    u.lineTo(x + 13, by + 60);
    u.lineTo(x, by + 78);
    u.lineTo(x - 13, by + 60);
    u.closePath();
    u.stroke();
    u.fill();

    u.restore();
  };

  drawTeamBanner(Kt / 2 - 210, true);
  drawTeamBanner(Kt / 2 + 210, false);

  // 9. DASHER BOARDS (Inside arena: At to Mt, sitting on turf at dasherY to k)
  const blueWallGrad = u.createLinearGradient(At, dasherY, At, k - 2);
  blueWallGrad.addColorStop(0, "#0284c7");
  blueWallGrad.addColorStop(1, "#0369a1");
  u.fillStyle = blueWallGrad;
  u.fillRect(At, dasherY, Kt / 2 - At, dasherH - 2);

  const orangeWallGrad = u.createLinearGradient(Kt / 2, dasherY, Kt / 2, k - 2);
  orangeWallGrad.addColorStop(0, "#f97316");
  orangeWallGrad.addColorStop(1, "#c2410c");
  u.fillStyle = orangeWallGrad;
  u.fillRect(Kt / 2, dasherY, Mt - Kt / 2, dasherH - 2);

  // White top cap of dasher boards
  u.fillStyle = "#ffffff";
  u.fillRect(At, dasherY - 2, Mt - At, 3.5);

  // 10. SOLID CEILING ROOF STRUCTURE & INDUSTRIAL TRUSS (Spans minX to maxX across full top!)
  u.save();
  const roofGrad = u.createLinearGradient(0, minY, 0, Qt);
  roofGrad.addColorStop(0, "#070b14");
  roofGrad.addColorStop(0.7, "#0f172a");
  roofGrad.addColorStop(1, "#182232");
  u.fillStyle = roofGrad;
  u.fillRect(minX, minY, totalW, Qt - minY);

  // Top structural edge beam
  u.fillStyle = "#334155";
  u.fillRect(minX, minY, totalW, 12);
  u.fillStyle = "#475569";
  u.fillRect(minX, minY + 12, totalW, 2.5);

  // Bottom structural ceiling beam (along Qt = 120)
  u.fillStyle = "#1e293b";
  u.fillRect(minX, Qt - 14, totalW, 14);
  u.fillStyle = "#334155";
  u.fillRect(minX, Qt - 16, totalW, 2);

  // Steel Truss Cross-Braces across FULL WIDTH minX to maxX
  u.strokeStyle = "rgba(148, 163, 184, 0.35)";
  u.lineWidth = 2.5;
  const trussStep = 80;
  const startTrussX = Math.floor(minX / trussStep) * trussStep;
  const endTrussX = Math.ceil(maxX / trussStep) * trussStep;

  for (let bx = startTrussX; bx < endTrussX; bx += trussStep) {
    u.beginPath();
    u.moveTo(bx, minY + 12);
    u.lineTo(bx, Qt - 14);
    u.stroke();

    u.beginPath();
    u.moveTo(bx, minY + 12);
    u.lineTo(bx + trussStep, Qt - 14);
    u.stroke();

    u.beginPath();
    u.moveTo(bx + trussStep, minY + 12);
    u.lineTo(bx, Qt - 14);
    u.stroke();

    // Rivet joints
    u.fillStyle = "#64748b";
    u.beginPath();
    u.arc(bx, minY + 12, 3, 0, Math.PI * 2);
    u.arc(bx, Qt - 14, 3, 0, Math.PI * 2);
    u.fill();
  }

  // Industrial floodlights hung along ceiling across full pitch width
  const lightSpacing = 280;
  const lightCount = Math.max(4, Math.floor((Mt - At - 240) / lightSpacing));
  const lightGap = (Mt - At - 320) / Math.max(1, lightCount - 1);
  const overheadLights: number[] = [];
  for (let i = 0; i < lightCount; i++) {
    overheadLights.push(At + 160 + i * lightGap);
  }
  for (const lx of overheadLights) {
    u.fillStyle = "#0f172a";
    u.strokeStyle = "#475569";
    u.lineWidth = 1.5;
    u.beginPath();
    u.roundRect(lx - 16, Qt - 22, 32, 9, 2);
    u.fill();
    u.stroke();

    const beam = u.createLinearGradient(lx, Qt - 13, lx, Qt + 40);
    beam.addColorStop(0, "rgba(255, 255, 255, 0.25)");
    beam.addColorStop(1, "rgba(255, 255, 255, 0)");
    u.fillStyle = beam;
    u.beginPath();
    u.moveTo(lx - 14, Qt - 13);
    u.lineTo(lx + 14, Qt - 13);
    u.lineTo(lx + 24, Qt + 40);
    u.lineTo(lx - 24, Qt + 40);
    u.closePath();
    u.fill();
  }

  // Ceiling Drive Runway & Neon Edge Runner (cars drive upside down here)
  const ceilingGlow = u.createLinearGradient(At, Qt, Mt, Qt);
  ceilingGlow.addColorStop(0, "rgba(56, 189, 248, 0.85)");
  ceilingGlow.addColorStop(0.5, "rgba(255, 255, 255, 0.95)");
  ceilingGlow.addColorStop(1, "rgba(249, 115, 22, 0.85)");
  u.strokeStyle = ceilingGlow;
  u.lineWidth = 4;
  u.beginPath();
  u.moveTo(At + F, Qt - 2);
  u.lineTo(Mt - F, Qt - 2);
  u.stroke();

  // Ceiling surface texture dashes (tactile feedback when driving upside down)
  u.strokeStyle = "rgba(255, 255, 255, 0.35)";
  u.lineWidth = 2.5;
  const dashSpacing = 45;
  const arenaMidX = Kt / 2;
  const maxOffset = Mt - F - arenaMidX - 30; // Symmetrical offset from arena center
  for (let dx = -Math.floor(maxOffset / dashSpacing) * dashSpacing; dx <= maxOffset; dx += dashSpacing) {
    const cx = arenaMidX + dx;
    u.beginPath();
    u.moveTo(cx, Qt - 7);
    u.lineTo(cx, Qt - 1);
    u.stroke();
  }
  u.restore();

  // Clean architectural stadium wall panels matching RL stadium reference
  const drawWallPanels = (isBlue: boolean) => {
    u.save();
    u.beginPath();
    const goalYTop = isBlue ? (le.yMin ?? 380) : (ae.yMin ?? 380);
    if (isBlue) {
      u.moveTo(minX, minY);
      u.lineTo(At + F, minY);
      u.lineTo(At + F, Qt);
      u.arc(At + F, Qt + F, F, Math.PI * 1.5, Math.PI, true);
      u.lineTo(At, goalYTop);
      u.lineTo(minX, goalYTop);
    } else {
      u.moveTo(maxX, minY);
      u.lineTo(Mt - F, minY);
      u.lineTo(Mt - F, Qt);
      u.arc(Mt - F, Qt + F, F, Math.PI * 1.5, 0, false);
      u.lineTo(Mt, goalYTop);
      u.lineTo(maxX, goalYTop);
    }
    u.closePath();
    u.clip();

    u.strokeStyle = isBlue ? "rgba(56, 189, 248, 0.10)" : "rgba(249, 115, 22, 0.10)";
    u.lineWidth = 1.5;
    for (let py = minY + 40; py < k; py += 55) {
      u.beginPath();
      u.moveTo(isBlue ? minX : Mt, py);
      u.lineTo(isBlue ? At + F : maxX, py);
      u.stroke();
    }
    u.restore();
  };

  const isWallGoal = activeMapDef.goalType === "wall" || activeMapDef.goalType === "elevated";
  const blueGoalYTop = isWallGoal ? (le.yMin ?? 380) : (k - F);
  const blueGoalYBot = isWallGoal ? (le.yMax ?? 680) : (k - F);
  const orangeGoalYTop = isWallGoal ? (ae.yMin ?? 380) : (k - F);
  const orangeGoalYBot = isWallGoal ? (ae.yMax ?? 680) : (k - F);

  // 11. SOLID LEFT ARENA WALL STRUCTURE (BLUE)
  // --- A. Upper Wall Column & Corner (minY to blueGoalYTop) ---
  u.save();
  const leftUpperGrad = u.createLinearGradient(minX, minY, At, blueGoalYTop);
  leftUpperGrad.addColorStop(0, "#08162b");
  leftUpperGrad.addColorStop(0.5, "#0e2444");
  leftUpperGrad.addColorStop(1, "#0a1b32");
  u.fillStyle = leftUpperGrad;
  u.beginPath();
  u.moveTo(minX, minY);
  u.lineTo(At + F, minY);
  u.lineTo(At + F, Qt);
  u.arc(At + F, Qt + F, F, Math.PI * 1.5, Math.PI, true);
  u.lineTo(At, blueGoalYTop);
  if (!isWallGoal) {
    // Solid wall from ceiling down around bottom ramp!
    u.lineTo(At, k - F);
    u.arc(At + F, k - F, F, Math.PI, Math.PI * 0.5, true);
    u.lineTo(minX, k);
  } else {
    u.lineTo(minX, blueGoalYTop);
  }
  u.closePath();
  u.fill();

  // Draw upper architectural panels
  drawWallPanels(true);

  // Inner border & curved neon highlight along upper left wall
  u.strokeStyle = "#0284c7";
  u.lineWidth = 6;
  u.beginPath();
  u.arc(At + F, Qt + F, F - 3, Math.PI * 1.5, Math.PI, true);
  u.lineTo(At, blueGoalYTop);
  if (!isWallGoal) {
    u.lineTo(At, k - F);
  }
  u.stroke();

  u.strokeStyle = "#38bdf8";
  u.lineWidth = 2.5;
  u.beginPath();
  u.arc(At + F, Qt + F, F - 3, Math.PI * 1.5, Math.PI, true);
  u.lineTo(At, blueGoalYTop);
  if (!isWallGoal) {
    u.lineTo(At, k - F);
  }
  u.stroke();
  u.restore();

  // --- B. Lower Ramp Foundation & Corner Slope ---
  u.save();
  if (isWallGoal) {
    const leftSlopeGrad = u.createLinearGradient(minX, blueGoalYBot, At + F, k);
    leftSlopeGrad.addColorStop(0, "#0a1a2e");
    leftSlopeGrad.addColorStop(0.5, "#102a48");
    leftSlopeGrad.addColorStop(1, "#0a1727");
    u.fillStyle = leftSlopeGrad;
    u.beginPath();
    u.moveTo(minX, blueGoalYBot);
    u.lineTo(At, blueGoalYBot);
    u.lineTo(At, k - F);
    u.arc(At + F, k - F, F, Math.PI, Math.PI * 0.5, true);
    u.lineTo(minX, k);
    u.closePath();
    u.fill();

    // Vertical lower wall border
    u.strokeStyle = "#0284c7";
    u.lineWidth = 6;
    u.beginPath();
    u.moveTo(At, blueGoalYBot);
    u.lineTo(At, k - F);
    u.stroke();

    u.strokeStyle = "#38bdf8";
    u.lineWidth = 2.5;
    u.beginPath();
    u.moveTo(At, blueGoalYBot);
    u.lineTo(At, k - F);
    u.stroke();
  }

  // Curved slope ramp highlight
  const leftRampHighlight = u.createLinearGradient(At, k - F, At + F, k);
  leftRampHighlight.addColorStop(0, "rgba(56, 189, 248, 0.6)");
  leftRampHighlight.addColorStop(1, "rgba(14, 165, 233, 0.2)");
  u.strokeStyle = leftRampHighlight;
  u.lineWidth = 14;
  u.beginPath();
  u.arc(At + F, k - F, F - 4, Math.PI, Math.PI * 0.5, true);
  u.stroke();
  u.restore();

  // 12. SOLID RIGHT ARENA WALL STRUCTURE (ORANGE) - EXACT SYMMETRICAL MIRROR!
  // --- A. Upper Wall Column & Corner (minY to orangeGoalYTop) ---
  u.save();
  const rightUpperGrad = u.createLinearGradient(maxX, minY, Mt, orangeGoalYTop);
  rightUpperGrad.addColorStop(0, "#250c05");
  rightUpperGrad.addColorStop(0.5, "#3b1509");
  rightUpperGrad.addColorStop(1, "#230b05");
  u.fillStyle = rightUpperGrad;
  u.beginPath();
  u.moveTo(maxX, minY);
  u.lineTo(Mt - F, minY);
  u.lineTo(Mt - F, Qt);
  u.arc(Mt - F, Qt + F, F, Math.PI * 1.5, 0, false);
  u.lineTo(Mt, orangeGoalYTop);
  if (!isWallGoal) {
    u.lineTo(Mt, k - F);
    u.arc(Mt - F, k - F, F, 0, Math.PI * 0.5, false);
    u.lineTo(maxX, k);
  } else {
    u.lineTo(maxX, orangeGoalYTop);
  }
  u.closePath();
  u.fill();

  // Draw upper architectural panels
  drawWallPanels(false);

  // Inner border & curved neon highlight along upper right wall
  u.strokeStyle = "#ea580c";
  u.lineWidth = 6;
  u.beginPath();
  u.arc(Mt - F, Qt + F, F - 3, Math.PI * 1.5, 0, false);
  u.lineTo(Mt, orangeGoalYTop);
  if (!isWallGoal) {
    u.lineTo(Mt, k - F);
  }
  u.stroke();

  u.strokeStyle = "#fb923c";
  u.lineWidth = 2.5;
  u.beginPath();
  u.arc(Mt - F, Qt + F, F - 3, Math.PI * 1.5, 0, false);
  u.lineTo(Mt, orangeGoalYTop);
  if (!isWallGoal) {
    u.lineTo(Mt, k - F);
  }
  u.stroke();
  u.restore();

  // --- B. Lower Ramp Foundation & Corner Slope ---
  u.save();
  if (isWallGoal) {
    const rightSlopeGrad = u.createLinearGradient(maxX, orangeGoalYBot, Mt - F, k);
    rightSlopeGrad.addColorStop(0, "#250c05");
    rightSlopeGrad.addColorStop(0.5, "#3d170a");
    rightSlopeGrad.addColorStop(1, "#1e0904");
    u.fillStyle = rightSlopeGrad;
    u.beginPath();
    u.moveTo(maxX, orangeGoalYBot);
    u.lineTo(Mt, orangeGoalYBot);
    u.lineTo(Mt, k - F);
    u.arc(Mt - F, k - F, F, 0, Math.PI * 0.5, false);
    u.lineTo(maxX, k);
    u.closePath();
    u.fill();

    // Vertical lower wall border
    u.strokeStyle = "#ea580c";
    u.lineWidth = 6;
    u.beginPath();
    u.moveTo(Mt, orangeGoalYBot);
    u.lineTo(Mt, k - F);
    u.stroke();

    u.strokeStyle = "#fb923c";
    u.lineWidth = 2.5;
    u.beginPath();
    u.moveTo(Mt, orangeGoalYBot);
    u.lineTo(Mt, k - F);
    u.stroke();
  }

  // Curved slope ramp highlight
  const rightRampHighlight = u.createLinearGradient(Mt, k - F, Mt - F, k);
  rightRampHighlight.addColorStop(0, "rgba(249, 115, 22, 0.6)");
  rightRampHighlight.addColorStop(1, "rgba(234, 88, 12, 0.2)");
  u.strokeStyle = rightRampHighlight;
  u.lineWidth = 14;
  u.beginPath();
  u.arc(Mt - F, k - F, F - 4, 0, Math.PI * 0.5, false);
  u.stroke();
  u.restore();

  // 13. TURF GRASS GROUND (Below car level k = 950 across full screen)
  const groundGrad = u.createLinearGradient(0, k, 0, maxY);
  groundGrad.addColorStop(0, "#3e9e49");
  groundGrad.addColorStop(0.5, "#48aa54");
  groundGrad.addColorStop(1, "#287333");
  u.fillStyle = groundGrad;
  u.fillRect(minX, k, totalW, maxY - k);

  // DIAGONAL MOWN LAWN STRIPES ON THE GROUND
  u.save();
  u.beginPath();
  u.rect(minX, k, totalW, maxY - k);
  u.clip();

  const stripeW = 85;
  u.fillStyle = "rgba(255, 255, 255, 0.09)";
  for (let sx = minX - 1200; sx < maxX + 1200; sx += stripeW * 2) {
    u.beginPath();
    u.moveTo(sx, k);
    u.lineTo(sx + stripeW, k);
    u.lineTo(sx + stripeW + 160, maxY);
    u.lineTo(sx + 160, maxY);
    u.closePath();
    u.fill();
  }
  u.restore();

  // 14. PITCH MARKINGS
  // Dashed white center line
  u.strokeStyle = "rgba(255, 255, 255, 0.85)";
  u.lineWidth = 3.5;
  u.setLineDash([12, 10]);
  u.beginPath();
  u.moveTo(Kt / 2, Qt);
  u.lineTo(Kt / 2, k);
  u.stroke();
  u.setLineDash([]);

  // Center Kickoff Floor Circle
  u.strokeStyle = "rgba(255, 255, 255, 0.9)";
  u.lineWidth = 4;
  u.beginPath();
  u.arc(Kt / 2, k, 170, Math.PI, 0);
  u.stroke();

  // Center Kickoff Dot
  u.fillStyle = "#ffffff";
  u.beginPath();
  u.arc(Kt / 2, k - 10, 8, 0, Math.PI * 2);
  u.fill();
  u.beginPath();
  u.arc(Kt / 2, k, 7, 0, Math.PI * 2);
  u.fill();

  // 15. ARENA PERIMETER BOUNDARY LINES (Floor, Walls, Ceiling & 4 Smooth Corner Arcs!)
  u.strokeStyle = "rgba(255, 255, 255, 0.95)";
  u.lineWidth = 4;
  u.beginPath();

  if (activeMapDef.goalType === "floor") {
    // Floor line jumps over blue floor goal and orange floor goal
    u.moveTo(At + F, k);
    u.lineTo(le.xMin!, k);
    u.moveTo(le.xMax!, k);
    u.lineTo(ae.xMin!, k);
    u.moveTo(ae.xMax!, k);
    u.lineTo(Mt - F, k);
    // Bottom-right corner curve into floor
    u.arc(Mt - F, k - F, F, Math.PI * 0.5, 0, true);
    // Right wall (solid)
    u.lineTo(Mt, Qt + F);
    // Top-right corner curve into ceiling
    u.arc(Mt - F, Qt + F, F, 0, Math.PI * 1.5, true);
    // Ceiling line (solid)
    u.lineTo(At + F, Qt);
    // Top-left corner curve into left wall
    u.arc(At + F, Qt + F, F, Math.PI * 1.5, Math.PI, true);
    // Left wall (solid)
    u.lineTo(At, k - F);
    // Bottom-left corner curve into floor
    u.arc(At + F, k - F, F, Math.PI, Math.PI * 0.5, true);
  } else if (activeMapDef.goalType === "ceiling") {
    // Floor line (solid)
    u.moveTo(At + F, k);
    u.lineTo(Mt - F, k);
    // Bottom-right corner curve into floor
    u.arc(Mt - F, k - F, F, Math.PI * 0.5, 0, true);
    // Right wall (solid)
    u.lineTo(Mt, Qt + F);
    // Top-right corner curve into ceiling
    u.arc(Mt - F, Qt + F, F, 0, Math.PI * 1.5, true);
    // Ceiling line jumps over orange ceiling goal and blue ceiling goal
    u.lineTo(ae.xMax!, Qt);
    u.moveTo(ae.xMin!, Qt);
    u.lineTo(le.xMax!, Qt);
    u.moveTo(le.xMin!, Qt);
    u.lineTo(At + F, Qt);
    // Top-left corner curve into left wall
    u.arc(At + F, Qt + F, F, Math.PI * 1.5, Math.PI, true);
    // Left wall (solid)
    u.lineTo(At, k - F);
    // Bottom-left corner curve into floor
    u.arc(At + F, k - F, F, Math.PI, Math.PI * 0.5, true);
  } else {
    // Standard wall / elevated goals
    // Floor line (cars drive on this line!)
    u.moveTo(At + F, k);
    u.lineTo(Mt - F, k);
    // Bottom-right corner curve into floor
    u.arc(Mt - F, k - F, F, Math.PI * 0.5, 0, true);
    // Right lower wall
    u.lineTo(Mt, ae.yMax!);
    // Jump over orange goal mouth
    u.moveTo(Mt, ae.yMin!);
    // Right upper wall
    u.lineTo(Mt, Qt + F);
    // Top-right corner curve into ceiling
    u.arc(Mt - F, Qt + F, F, 0, Math.PI * 1.5, true);
    // Ceiling line (cars drive upside down here!)
    u.lineTo(At + F, Qt);
    // Top-left corner curve into left wall
    u.arc(At + F, Qt + F, F, Math.PI * 1.5, Math.PI, true);
    // Left upper wall
    u.lineTo(At, le.yMin!);
    // Jump over blue goal mouth
    u.moveTo(At, le.yMax!);
    // Left lower wall
    u.lineTo(At, k - F);
    // Bottom-left corner curve into floor
    u.arc(At + F, k - F, F, Math.PI, Math.PI * 0.5, true);
  }

  u.stroke();

  u.restore();
}

function Qh(u: any, f: number, r: number, s: string) {
  u.save();
  const y = u.createRadialGradient(f, r, 5, f, r + 250, 300);
  y.addColorStop(0, s);
  y.addColorStop(0.3, "rgba(255, 255, 255, 0.15)");
  y.addColorStop(1, "rgba(0, 0, 0, 0)");
  u.fillStyle = y;
  u.beginPath();
  u.moveTo(f - 60, r);
  u.lineTo(f + 60, r);
  u.lineTo(f + 220, r + 400);
  u.lineTo(f - 220, r + 400);
  u.closePath();
  u.fill();
  u.restore();
}

function Wv(u: any, f: any) {
  u.save();
  if (f.type === "big") {
    if (f.active) {
      // Golden glowing bloom
      const aura = u.createRadialGradient(f.x, f.y, 10, f.x, f.y, 48);
      aura.addColorStop(0, "rgba(251, 191, 36, 0.9)");
      aura.addColorStop(0.4, "rgba(245, 158, 11, 0.45)");
      aura.addColorStop(1, "rgba(245, 158, 11, 0)");
      u.fillStyle = aura;
      u.beginPath();
      u.arc(f.x, f.y, 48, 0, Math.PI * 2);
      u.fill();

      // Outer golden hexagon border
      u.strokeStyle = "#f59e0b";
      u.lineWidth = 3.5;
      Zh(u, f.x, f.y, 25);

      // Inner golden pill with 100
      const pulse = Math.sin(Date.now() * 0.003) * 3;
      u.fillStyle = "#fef08a";
      u.beginPath();
      u.roundRect(f.x - 14, f.y - 13 + pulse, 28, 26, 8);
      u.fill();

      u.font = "900 13px 'Chakra Petch', system-ui, sans-serif";
      u.fillStyle = "#1e1b4b";
      u.textAlign = "center";
      u.textBaseline = "middle";
      u.fillText("100", f.x, f.y + pulse);
    } else {
      u.strokeStyle = "rgba(255, 255, 255, 0.25)";
      u.lineWidth = 2;
      Zh(u, f.x, f.y, 23);
      const ratio = 1 - f.cooldownTimer / f.respawnTime;
      u.strokeStyle = "#f59e0b";
      u.lineWidth = 3.5;
      u.beginPath();
      u.arc(f.x, f.y, 21, -Math.PI / 2, -Math.PI / 2 + ratio * Math.PI * 2);
      u.stroke();
      u.font = "bold 11px 'Chakra Petch', system-ui, sans-serif";
      u.fillStyle = "rgba(255, 255, 255, 0.85)";
      u.textAlign = "center";
      u.textBaseline = "middle";
      u.fillText(Math.ceil(f.cooldownTimer).toString(), f.x, f.y);
    }
  } else {
    // Small boost pad (glowing diamond)
    if (f.active) {
      const aura = u.createRadialGradient(f.x, f.y, 3, f.x, f.y, 22);
      aura.addColorStop(0, "rgba(250, 204, 21, 0.85)");
      aura.addColorStop(1, "rgba(250, 204, 21, 0)");
      u.fillStyle = aura;
      u.beginPath();
      u.arc(f.x, f.y, 22, 0, Math.PI * 2);
      u.fill();

      u.fillStyle = "#fef08a";
      u.beginPath();
      u.moveTo(f.x, f.y - 10);
      u.lineTo(f.x + 10, f.y);
      u.lineTo(f.x, f.y + 10);
      u.lineTo(f.x - 10, f.y);
      u.closePath();
      u.fill();

      u.strokeStyle = "#f59e0b";
      u.lineWidth = 1.5;
      u.stroke();
    } else {
      u.strokeStyle = "rgba(255, 255, 255, 0.18)";
      u.lineWidth = 1.5;
      u.beginPath();
      u.moveTo(f.x, f.y - 6);
      u.lineTo(f.x + 6, f.y);
      u.lineTo(f.x, f.y + 6);
      u.lineTo(f.x - 6, f.y);
      u.closePath();
      u.stroke();
    }
  }
  u.restore();
}

function Zh(u: any, f: number, r: number, s: number) {
  u.beginPath();
  for (let y = 0; y < 6; y++) {
    const m = (y * Math.PI) / 3;
    const g = f + s * Math.cos(m);
    const p = r + s * Math.sin(m);
    y === 0 ? u.moveTo(g, p) : u.lineTo(g, p);
  }
  u.closePath();
  u.stroke();
}

function $v(u: any, f: any) {
  u.save();
  const r = k - (f.y + f.radius);
  if (r >= 0) {
    const s = Math.max(0.2, 1 - r / 700);
    const y = Math.max(0.08, 0.45 * s);
    u.fillStyle = `rgba(0, 0, 0, ${y})`;
    u.beginPath();
    u.ellipse(f.x, k, f.radius * s * 1.3, 8 * s, 0, 0, Math.PI * 2);
    u.fill();
  }
  u.restore();
}

function renderBallTrail(u: any, f: any) {
  if (!f.trail || f.trail.length < 2) return;
  const r = Math.hypot(f.vx, f.vy);
  if (r < 110 && f.trail.length < 5) return;
  u.save();
  const s = r > 1450;
  const y = r > 1050;
  const m = f.lastTouchTeam === "blue" ? [56, 189, 248] : f.lastTouchTeam === "orange" ? [249, 115, 22] : [203, 213, 225];
  const g = f.trail;
  const p = g.length;
  for (let A = 0; A < p - 1; A++) {
    const C = g[A], z = g[A + 1], N = A / (p - 1), D = Math.min(0.88, N * N * (y ? 0.95 : 0.65)), X = Math.max(2, f.radius * (0.2 + N * 0.75) * (y ? 1.25 : 0.9));
    u.beginPath();
    u.moveTo(C.x, C.y);
    u.lineTo(z.x, z.y);
    s ? (u.strokeStyle = `rgba(244, 63, 94, ${D})`, u.lineWidth = X * 1.5) : y ? (u.strokeStyle = `rgba(${m[0]}, ${m[1]}, ${m[2]}, ${D * 0.75})`, u.lineWidth = X * 1.4) : (u.strokeStyle = `rgba(${m[0]}, ${m[1]}, ${m[2]}, ${D * 0.5})`, u.lineWidth = X);
    u.lineCap = "round";
    u.stroke();

    u.beginPath();
    u.moveTo(C.x, C.y);
    u.lineTo(z.x, z.y);
    u.strokeStyle = `rgba(255, 255, 255, ${D * (y ? 0.9 : 0.7)})`;
    u.lineWidth = X * 0.45;
    u.lineCap = "round";
    u.stroke();
  }
  if (y) {
    for (let A = 0; A < p; A += 4) {
      const C = g[A], z = A / (p - 1);
      u.beginPath();
      u.arc(C.x, C.y, (1 - z) * f.radius * 0.5 + 2, 0, Math.PI * 2);
      u.fillStyle = s ? `rgba(251, 113, 133, ${z * 0.5})` : `rgba(255, 255, 255, ${z * 0.45})`;
      u.fill();
    }
  }
  u.restore();
}

function Iv(u: any, f: any, m: any = {}) {
  renderBallTrail(u, f);
  u.save();
  u.translate(f.x, f.y);
  u.rotate(f.spin);
  if (f.touchEffectTimer > 0) {
    const s = u.createRadialGradient(0, 0, f.radius * 0.8, 0, 0, f.radius * 1.8);
    const y = f.lastTouchTeam === "blue" ? "rgba(56, 189, 248, 0.7)" : "rgba(249, 115, 22, 0.7)";
    s.addColorStop(0, y);
    s.addColorStop(1, "rgba(0,0,0,0)");
    u.fillStyle = s;
    u.beginPath();
    u.arc(0, 0, f.radius * 1.8, 0, Math.PI * 2);
    u.fill();
  }
  const r = u.createRadialGradient(-f.radius * 0.35, -f.radius * 0.35, f.radius * 0.1, 0, 0, f.radius);
  r.addColorStop(0, "#ffffff");
  r.addColorStop(0.7, "#cbd5e1");
  r.addColorStop(1, "#475569");
  u.fillStyle = r;
  u.beginPath();
  u.arc(0, 0, f.radius, 0, Math.PI * 2);
  u.fill();

  u.fillStyle = "#1e293b";
  Kh(u, 0, 0, f.radius * 0.42);
  for (let s = 0; s < 5; s++) {
    const y = (s * Math.PI * 2) / 5;
    const mAngle = Math.cos(y) * (f.radius * 0.76);
    const gAngle = Math.sin(y) * (f.radius * 0.76);
    Kh(u, mAngle, gAngle, f.radius * 0.24);
    u.strokeStyle = "#334155";
    u.lineWidth = 2;
    u.beginPath();
    u.moveTo(0, 0);
    u.lineTo(mAngle, gAngle);
    u.stroke();
  }
  u.strokeStyle = f.lastTouchTeam === "blue" ? "#38bdf8" : f.lastTouchTeam === "orange" ? "#fb923c" : "rgba(255, 255, 255, 0.4)";
  u.lineWidth = 2.5;
  u.beginPath();
  u.arc(0, 0, f.radius - 1, 0, Math.PI * 2);
  u.stroke();

  // Ball Hitbox Visualizer Overlay
  if (m && m.showHitbox) {
    u.save();
    u.rotate(-f.spin);
    u.strokeStyle = "#22c55e";
    u.lineWidth = 1.8;
    u.setLineDash([4, 4]);
    u.shadowColor = "#22c55e";
    u.shadowBlur = 6;
    u.beginPath();
    u.arc(0, 0, f.radius, 0, Math.PI * 2);
    u.stroke();
    u.setLineDash([]);
    u.shadowBlur = 0;

    // Crosshair
    u.strokeStyle = "rgba(34, 197, 94, 0.85)";
    u.lineWidth = 1.2;
    u.beginPath();
    u.moveTo(-5, 0); u.lineTo(5, 0);
    u.moveTo(0, -5); u.lineTo(0, 5);
    u.stroke();

    // Badge
    u.font = "bold 9px 'Chakra Petch', monospace";
    const bLabel = `BALL: R=${Math.round(f.radius)}`;
    const bMetrics = u.measureText(bLabel);
    const bW = bMetrics.width + 8;
    const bH = 13;
    u.fillStyle = "rgba(15, 23, 42, 0.88)";
    u.strokeStyle = "#22c55e";
    u.lineWidth = 1;
    u.beginPath();
    u.roundRect(-bW / 2, -f.radius - bH - 4, bW, bH, 3);
    u.fill();
    u.stroke();
    u.fillStyle = "#22c55e";
    u.textAlign = "center";
    u.textBaseline = "middle";
    u.fillText(bLabel, 0, -f.radius - bH / 2 - 4);
    u.restore();
  }

  u.restore();
}

function Kh(u: any, f: number, r: number, s: number) {
  u.beginPath();
  for (let y = 0; y < 5; y++) {
    const m = (y * Math.PI * 2) / 5 - Math.PI / 2;
    const g = f + s * Math.cos(m);
    const p = r + s * Math.sin(m);
    y === 0 ? u.moveTo(g, p) : u.lineTo(g, p);
  }
  u.closePath();
  u.fill();
}

function Pv(u: any, f: any, isLegacy = false) {
  if (!f) return;

  const traj = calculateBallTrajectory(f, isLegacy);
  const count = traj.pointCount;
  if (count < 2) return;

  u.save();

  const isGoal = traj.isGoal;
  const isBoomer = traj.initialSpeed > 850;

  // Vibrant, high-contrast dynamic color schemes
  let coreColor = "#38bdf8";      // Electric Cyan
  let glowColor = "rgba(56, 189, 248, 0.40)";
  let pulseSpeed = 0.038;

  if (isGoal) {
    coreColor = "#34d399";        // Radiant Emerald for on-target shots
    glowColor = "rgba(52, 211, 153, 0.50)";
    pulseSpeed = 0.055;
  } else if (isBoomer) {
    coreColor = "#fbbf24";        // Golden Amber / Flame for supersonic boomers
    glowColor = "rgba(251, 191, 36, 0.45)";
    pulseSpeed = 0.048;
  }

  const animTime = performance.now();
  const dashOffset = -animTime * pulseSpeed;

  // 1. Dual-Pass Trajectory Beam
  // Luminous outer aura
  u.strokeStyle = glowColor;
  u.lineWidth = 5.2;
  u.lineCap = "round";
  u.lineJoin = "round";
  u.setLineDash([]);
  u.beginPath();
  u.moveTo(traj.points[0].x, traj.points[0].y);
  for (let i = 1; i < count; i++) {
    u.lineTo(traj.points[i].x, traj.points[i].y);
  }
  u.stroke();

  // Core animated marching laser beam
  u.strokeStyle = coreColor;
  u.lineWidth = 2.4;
  u.setLineDash([8, 6]);
  u.lineDashOffset = dashOffset;
  u.beginPath();
  u.moveTo(traj.points[0].x, traj.points[0].y);
  for (let i = 1; i < count; i++) {
    u.lineTo(traj.points[i].x, traj.points[i].y);
  }
  u.stroke();
  u.setLineDash([]);

  // 2. Surface Impact Markers (Bounce rings)
  for (let i = 0; i < traj.bounceCount; i++) {
    const b = traj.bounces[i];
    u.strokeStyle = coreColor;
    u.lineWidth = 1.8;
    u.beginPath();
    u.arc(b.x, b.y, 7.5, 0, Math.PI * 2);
    u.stroke();

    u.fillStyle = "#ffffff";
    u.beginPath();
    u.arc(b.x, b.y, 2.4, 0, Math.PI * 2);
    u.fill();
  }

  // 3. Ground Landing Reticle (Touchdown target on turf)
  if (traj.groundLanding) {
    const gx = traj.groundLanding.x;
    const gy = traj.groundLanding.y;
    const pulse = 1 + Math.sin(animTime * 0.008) * 0.12;

    // Outer turf target ellipse
    u.strokeStyle = coreColor;
    u.lineWidth = 2;
    u.beginPath();
    u.ellipse(gx, gy, 22 * pulse, 6.5 * pulse, 0, 0, Math.PI * 2);
    u.stroke();

    // Inner target ring
    u.strokeStyle = "#ffffff";
    u.lineWidth = 1.4;
    u.beginPath();
    u.ellipse(gx, gy, 10 * pulse, 3.2 * pulse, 0, 0, Math.PI * 2);
    u.stroke();

    // Cardinal tick marks
    u.strokeStyle = coreColor;
    u.lineWidth = 1.5;
    u.beginPath();
    u.moveTo(gx - 27 * pulse, gy);
    u.lineTo(gx - 22 * pulse, gy);
    u.moveTo(gx + 22 * pulse, gy);
    u.lineTo(gx + 27 * pulse, gy);
    u.stroke();

    // Soft turf shadow
    u.fillStyle = glowColor;
    u.beginPath();
    u.ellipse(gx, gy, 18 * pulse, 5 * pulse, 0, 0, Math.PI * 2);
    u.fill();
  }

  // 4. Goal Inbound Beacon & Target Ring
  if (isGoal && traj.goalPoint) {
    const px = traj.goalPoint.x;
    const py = traj.goalPoint.y;
    const gPulse = 1 + Math.sin(animTime * 0.012) * 0.18;

    u.strokeStyle = "rgba(52, 211, 153, 0.85)";
    u.lineWidth = 2.4;
    u.beginPath();
    u.arc(px, py, 15 * gPulse, 0, Math.PI * 2);
    u.stroke();

    u.fillStyle = "#34d399";
    u.beginPath();
    u.arc(px, py, 5, 0, Math.PI * 2);
    u.fill();

    u.save();
    u.font = "bold 11px system-ui, -apple-system, sans-serif";
    u.textAlign = "center";
    u.textBaseline = "middle";
    const textW = u.measureText("GOAL!").width + 12;
    const tagY = py - 22;
    u.fillStyle = "rgba(6, 78, 59, 0.85)";
    u.strokeStyle = "#34d399";
    u.lineWidth = 1.2;
    u.beginPath();
    if (typeof u.roundRect === "function") {
      u.roundRect(px - textW / 2, tagY - 9, textW, 18, 5);
    } else {
      u.rect(px - textW / 2, tagY - 9, textW, 18);
    }
    u.fill();
    u.stroke();

    u.fillStyle = "#a7f3d0";
    u.fillText("GOAL!", px, tagY);
    u.restore();
  }

  u.restore();
}

function tg(u: any, f: any) {
  u.save();
  const r = k - (f.y + f.height / 2);
  if (r >= 0) {
    const s = Math.max(0.2, 1 - r / 600);
    u.fillStyle = `rgba(0, 0, 0, ${0.4 * s})`;
    u.beginPath();
    u.ellipse(f.x, k, (f.width / 2) * s * 1.2, 7 * s, 0, 0, Math.PI * 2);
    u.fill();
  }
  u.restore();
}
// --- DETAILED CAR SILHOUETTE RENDERERS ---

function drawOctaneBody(
  u: CanvasRenderingContext2D,
  f: any,
  r: number,
  s: number,
  nearWheelY: number,
  rearWheelX: number,
  frontWheelX: number,
  wheelRadius: number,
  primaryBright: string,
  primaryMid: string,
  primaryDark: string,
  accentColor: string,
  chassisDark: string,
  metalSilver: string,
  metalDark: string
) {
  // 1. Rear exposed engine bay
  u.fillStyle = "#1e293b";
  u.strokeStyle = metalDark;
  u.lineWidth = 1.2;
  u.fillRect(-r + 9, -5, 12, 9);
  u.strokeRect(-r + 9, -5, 12, 9);

  // Chrome intake pipes
  u.strokeStyle = metalSilver;
  u.lineWidth = 1.8;
  for (let px = -r + 11; px <= -r + 19; px += 4) {
    u.beginPath();
    u.moveTo(px, -5);
    u.lineTo(px, -9);
    u.lineTo(px - 2, -11);
    u.stroke();
  }

  // 2. Main Octane Body
  const bodyGrad = u.createLinearGradient(0, -s - 6, 0, nearWheelY);
  bodyGrad.addColorStop(0, primaryBright);
  bodyGrad.addColorStop(0.4, primaryMid);
  bodyGrad.addColorStop(1, primaryDark);

  u.fillStyle = bodyGrad;
  u.strokeStyle = chassisDark;
  u.lineWidth = 2;
  u.beginPath();
  u.moveTo(-r + 5, nearWheelY);
  u.lineTo(rearWheelX - wheelRadius - 2.5, nearWheelY);
  u.quadraticCurveTo(rearWheelX, nearWheelY - wheelRadius - 3.5, rearWheelX + wheelRadius + 2.5, nearWheelY);
  u.lineTo(frontWheelX - wheelRadius - 2.5, nearWheelY);
  u.quadraticCurveTo(frontWheelX, nearWheelY - wheelRadius - 3.5, frontWheelX + wheelRadius + 2.5, nearWheelY);
  u.lineTo(r - 3, nearWheelY);
  u.lineTo(r + 1, nearWheelY - 3);
  u.lineTo(r + 2, 0);
  u.lineTo(r - 2, -3);
  u.lineTo(6, -6);
  u.lineTo(-4, -s);
  u.lineTo(-15, -s + 1);
  u.lineTo(-20, -5);
  u.lineTo(-r + 6, -3);
  u.lineTo(-r + 5, nearWheelY - 1);
  u.closePath();
  u.fill();
  u.stroke();

  // 3. Cabin & tinted window
  u.fillStyle = "#070c14";
  u.strokeStyle = primaryDark;
  u.lineWidth = 1.4;
  u.beginPath();
  u.moveTo(4, -6);
  u.lineTo(-3, -s + 1.5);
  u.lineTo(-13, -s + 2.5);
  u.lineTo(-17, -5);
  u.closePath();
  u.fill();
  u.stroke();

  u.strokeStyle = "rgba(255, 255, 255, 0.65)";
  u.lineWidth = 1.5;
  u.beginPath();
  u.moveTo(2, -6);
  u.lineTo(-3, -s + 2);
  u.stroke();

  // Tubular roll cage
  u.strokeStyle = metalSilver;
  u.lineWidth = 1.4;
  u.beginPath();
  u.moveTo(3, -6);
  u.lineTo(-3.5, -s + 1.5);
  u.moveTo(-13.5, -s + 2);
  u.lineTo(-17, -5);
  u.stroke();

  // Roof scoop
  u.fillStyle = "#1e293b";
  u.strokeStyle = metalDark;
  u.lineWidth = 1;
  u.beginPath();
  u.moveTo(-2, -s);
  u.lineTo(-10, -s);
  u.lineTo(-8, -s - 2.8);
  u.lineTo(-1, -s - 2.8);
  u.closePath();
  u.fill();
  u.stroke();

  // Hood white stripe
  u.fillStyle = "rgba(255, 255, 255, 0.92)";
  u.beginPath();
  u.moveTo(r - 2, -1.5);
  u.lineTo(6, -5);
  u.lineTo(5, -6.5);
  u.lineTo(r - 3, -3);
  u.closePath();
  u.fill();

  // Side accent swoosh
  u.strokeStyle = accentColor;
  u.lineWidth = 1.5;
  u.beginPath();
  u.moveTo(frontWheelX - 4, nearWheelY - 6);
  u.lineTo(0, nearWheelY - 8);
  u.lineTo(rearWheelX + 6, nearWheelY - 6);
  u.stroke();

  // High-mounted rear spoiler wing
  u.strokeStyle = chassisDark;
  u.lineWidth = 2.5;
  u.beginPath();
  u.moveTo(-20, -5);
  u.lineTo(-24, -s - 4);
  u.moveTo(-17, -4);
  u.lineTo(-21, -s - 4);
  u.stroke();

  u.strokeStyle = metalSilver;
  u.lineWidth = 1;
  u.beginPath();
  u.moveTo(-19.5, -5);
  u.lineTo(-23.5, -s - 4);
  u.stroke();

  const wingGrad = u.createLinearGradient(-28, -s - 7, -17, -s - 5);
  wingGrad.addColorStop(0, "#0f172a");
  wingGrad.addColorStop(0.5, primaryMid);
  wingGrad.addColorStop(1, primaryBright);

  u.fillStyle = wingGrad;
  u.strokeStyle = chassisDark;
  u.lineWidth = 1.4;
  u.beginPath();
  u.moveTo(-28, -s - 4);
  u.lineTo(-17, -s - 3);
  u.lineTo(-16, -s - 7);
  u.lineTo(-28, -s - 7);
  u.closePath();
  u.fill();
  u.stroke();

  u.fillStyle = primaryBright;
  u.fillRect(-29, -s - 8, 3.5, 6);
  u.strokeStyle = chassisDark;
  u.lineWidth = 1;
  u.strokeRect(-29, -s - 8, 3.5, 6);

  // Headlight
  u.fillStyle = "#fef08a";
  u.shadowColor = "#fef08a";
  u.shadowBlur = 8;
  u.beginPath();
  u.arc(r + 1, -1, 2.2, 0, Math.PI * 2);
  u.fill();
  u.shadowBlur = 0;
}

function drawFennecBody(
  u: CanvasRenderingContext2D,
  f: any,
  r: number,
  s: number,
  nearWheelY: number,
  rearWheelX: number,
  frontWheelX: number,
  wheelRadius: number,
  primaryBright: string,
  primaryMid: string,
  primaryDark: string,
  accentColor: string,
  chassisDark: string,
  metalSilver: string,
  metalDark: string
) {
  // Fennec: Boxy Rally Hot-Hatch (Lancia Delta Integrale style)
  const bodyGrad = u.createLinearGradient(0, -s, 0, nearWheelY);
  bodyGrad.addColorStop(0, primaryBright);
  bodyGrad.addColorStop(0.45, primaryMid);
  bodyGrad.addColorStop(1, primaryDark);

  u.fillStyle = bodyGrad;
  u.strokeStyle = chassisDark;
  u.lineWidth = 2;
  u.beginPath();
  u.moveTo(-r + 4, nearWheelY);
  u.lineTo(rearWheelX - wheelRadius - 2.5, nearWheelY);
  // Flared rally arch
  u.lineTo(rearWheelX - wheelRadius - 1.5, nearWheelY - wheelRadius - 2.5);
  u.lineTo(rearWheelX + wheelRadius + 1.5, nearWheelY - wheelRadius - 2.5);
  u.lineTo(rearWheelX + wheelRadius + 2.5, nearWheelY);
  u.lineTo(frontWheelX - wheelRadius - 2.5, nearWheelY);
  u.lineTo(frontWheelX - wheelRadius - 1.5, nearWheelY - wheelRadius - 2.5);
  u.lineTo(frontWheelX + wheelRadius + 1.5, nearWheelY - wheelRadius - 2.5);
  u.lineTo(frontWheelX + wheelRadius + 2.5, nearWheelY);
  // Front chin
  u.lineTo(r - 2, nearWheelY);
  u.lineTo(r + 1, nearWheelY - 2);
  // Upright front bumper
  u.lineTo(r + 1.5, -2);
  u.lineTo(r + 0.5, -5);
  // Short muscular hood
  u.lineTo(6, -7);
  // Steep rally windshield
  u.lineTo(2, -s);
  // Flat roofline
  u.lineTo(-24, -s);
  // Integrated roof spoiler
  u.lineTo(-27, -s - 2);
  u.lineTo(-28, -s + 1);
  // Steep rear hatch
  u.lineTo(-r + 4, -1);
  u.lineTo(-r + 3, nearWheelY - 2);
  u.closePath();
  u.fill();
  u.stroke();

  // Front grille mesh
  u.fillStyle = "#0a0f1d";
  u.strokeStyle = "#1e293b";
  u.lineWidth = 1.2;
  u.beginPath();
  u.roundRect(r - 3, -4, 4.5, 7, 1);
  u.fill();
  u.stroke();

  u.strokeStyle = "#334155";
  u.lineWidth = 0.8;
  for (let gy = -3; gy <= 2; gy += 1.8) {
    u.beginPath();
    u.moveTo(r - 3, gy);
    u.lineTo(r + 1.5, gy);
    u.stroke();
  }

  // Dual rectangular rally headlights
  u.fillStyle = "#fef08a";
  u.shadowColor = "#fef08a";
  u.shadowBlur = 6;
  u.fillRect(r - 2, -4, 2.8, 2.2);
  u.fillRect(r - 2, -1, 2.8, 2.2);
  u.shadowBlur = 0;

  // Hatchback cabin & tinted windows
  u.fillStyle = "#070c14";
  u.strokeStyle = primaryDark;
  u.lineWidth = 1.2;
  u.beginPath();
  u.moveTo(4, -6.5);
  u.lineTo(1, -s + 1.5);
  u.lineTo(-10, -s + 1.5);
  u.lineTo(-10, -4.5);
  u.lineTo(4, -4.5);
  u.closePath();
  u.fill();
  u.stroke();

  u.beginPath();
  u.moveTo(-12, -s + 1.5);
  u.lineTo(-22, -s + 1.5);
  u.lineTo(-25, -2);
  u.lineTo(-12, -2);
  u.closePath();
  u.fill();
  u.stroke();

  // Reflections
  u.strokeStyle = "rgba(255, 255, 255, 0.6)";
  u.lineWidth = 1.2;
  u.beginPath();
  u.moveTo(2, -6.5);
  u.lineTo(0.5, -s + 2);
  u.moveTo(-13, -s + 2);
  u.lineTo(-21, -s + 2);
  u.stroke();

  // B-pillar
  u.fillStyle = "#0f172a";
  u.fillRect(-12, -s + 1, 2, s - 3);

  // Decals
  u.fillStyle = "rgba(255, 255, 255, 0.9)";
  u.fillRect(8, -6.5, r - 10, 1.8);
  u.fillStyle = accentColor;
  u.fillRect(-r + 6, nearWheelY - 5, f.width - 12, 1.6);

  // Twin exhaust
  u.fillStyle = metalSilver;
  u.strokeStyle = metalDark;
  u.lineWidth = 1;
  u.beginPath();
  u.arc(-r + 1, 3, 2, 0, Math.PI * 2);
  u.arc(-r + 1, -1, 2, 0, Math.PI * 2);
  u.fill();
  u.stroke();
}

function drawDominusBody(
  u: CanvasRenderingContext2D,
  f: any,
  r: number,
  s: number,
  nearWheelY: number,
  rearWheelX: number,
  frontWheelX: number,
  wheelRadius: number,
  primaryBright: string,
  primaryMid: string,
  primaryDark: string,
  accentColor: string,
  chassisDark: string,
  metalSilver: string,
  metalDark: string
) {
  // Dominus: Low, Long Classic American Muscle Car
  const bodyGrad = u.createLinearGradient(0, -s, 0, nearWheelY);
  bodyGrad.addColorStop(0, primaryBright);
  bodyGrad.addColorStop(0.4, primaryMid);
  bodyGrad.addColorStop(1, primaryDark);

  u.fillStyle = bodyGrad;
  u.strokeStyle = chassisDark;
  u.lineWidth = 2;
  u.beginPath();
  u.moveTo(-r + 4, nearWheelY);
  u.lineTo(rearWheelX - wheelRadius - 2.5, nearWheelY);
  u.quadraticCurveTo(rearWheelX, nearWheelY - wheelRadius - 3.5, rearWheelX + wheelRadius + 2.5, nearWheelY);
  u.lineTo(frontWheelX - wheelRadius - 2.5, nearWheelY);
  u.quadraticCurveTo(frontWheelX, nearWheelY - wheelRadius - 3.5, frontWheelX + wheelRadius + 2.5, nearWheelY);
  u.lineTo(r - 2, nearWheelY);
  u.lineTo(r + 1, nearWheelY - 2);
  u.lineTo(r + 2, 0);
  u.lineTo(r + 1, -3);
  u.lineTo(6, -4.5);
  u.lineTo(1, -s);
  u.lineTo(-16, -s);
  u.lineTo(-27, -2);
  u.lineTo(-r + 1, -s + 4);
  u.lineTo(-r, -1);
  u.lineTo(-r + 2, nearWheelY - 2);
  u.closePath();
  u.fill();
  u.stroke();

  // Supercharger blower scoop
  u.fillStyle = "#1e293b";
  u.strokeStyle = metalSilver;
  u.lineWidth = 1.3;
  u.beginPath();
  u.roundRect(14, -7.5, 11, 4, 1.5);
  u.fill();
  u.stroke();
  u.fillStyle = "#ef4444";
  u.beginPath();
  u.arc(24, -5.5, 1.6, 0, Math.PI * 2);
  u.fill();
  u.fillStyle = "#0f172a";
  u.fillRect(12.5, -6.5, 2, 3);

  // Muscle grille & quad headlights
  u.fillStyle = "#0a0a0f";
  u.fillRect(r - 3, -3, 4, 5);
  u.strokeStyle = metalSilver;
  u.lineWidth = 1;
  u.strokeRect(r - 3, -3, 4, 5);

  u.fillStyle = "#fef08a";
  u.shadowColor = "#fef08a";
  u.shadowBlur = 6;
  u.beginPath();
  u.arc(r - 0.5, -1.8, 1.6, 0, Math.PI * 2);
  u.arc(r - 0.5, 1.2, 1.6, 0, Math.PI * 2);
  u.fill();
  u.shadowBlur = 0;

  // Muscle fastback cabin
  u.fillStyle = "#070c14";
  u.strokeStyle = primaryDark;
  u.lineWidth = 1.2;
  u.beginPath();
  u.moveTo(4, -4);
  u.lineTo(0.5, -s + 1.5);
  u.lineTo(-14, -s + 1.5);
  u.lineTo(-24, -1.5);
  u.closePath();
  u.fill();
  u.stroke();

  u.strokeStyle = metalSilver;
  u.lineWidth = 1;
  u.beginPath();
  u.moveTo(-6, -s + 1.5);
  u.lineTo(-6, -3);
  u.stroke();

  u.strokeStyle = "rgba(255, 255, 255, 0.6)";
  u.lineWidth = 1.3;
  u.beginPath();
  u.moveTo(2, -4);
  u.lineTo(0, -s + 2);
  u.stroke();

  // Racing stripes
  u.fillStyle = "rgba(255, 255, 255, 0.9)";
  u.beginPath();
  u.moveTo(r - 1, -2);
  u.lineTo(13, -4);
  u.lineTo(13, -5.5);
  u.lineTo(r - 1, -3);
  u.closePath();
  u.fill();

  // Ducktail spoiler chrome
  u.strokeStyle = metalSilver;
  u.lineWidth = 1.4;
  u.beginPath();
  u.moveTo(-27, -2);
  u.lineTo(-r + 1, -s + 4);
  u.stroke();

  // Side-exit chrome exhaust
  u.fillStyle = metalSilver;
  u.strokeStyle = metalDark;
  u.lineWidth = 1;
  u.beginPath();
  u.roundRect(rearWheelX + wheelRadius + 3, nearWheelY - 4, 5, 2.5, 1);
  u.fill();
  u.stroke();
}

function drawBreakoutBody(
  u: CanvasRenderingContext2D,
  f: any,
  r: number,
  s: number,
  nearWheelY: number,
  rearWheelX: number,
  frontWheelX: number,
  wheelRadius: number,
  primaryBright: string,
  primaryMid: string,
  primaryDark: string,
  accentColor: string,
  chassisDark: string,
  metalSilver: string,
  metalDark: string
) {
  // Breakout: Wedge Prototype Supercar
  const bodyGrad = u.createLinearGradient(0, -s, 0, nearWheelY);
  bodyGrad.addColorStop(0, primaryBright);
  bodyGrad.addColorStop(0.4, primaryMid);
  bodyGrad.addColorStop(1, primaryDark);

  u.fillStyle = bodyGrad;
  u.strokeStyle = chassisDark;
  u.lineWidth = 2;
  u.beginPath();
  u.moveTo(-r + 4, nearWheelY);
  u.lineTo(rearWheelX - wheelRadius - 2.5, nearWheelY);
  u.quadraticCurveTo(rearWheelX, nearWheelY - wheelRadius - 3.5, rearWheelX + wheelRadius + 2.5, nearWheelY);
  u.lineTo(frontWheelX - wheelRadius - 2.5, nearWheelY);
  u.quadraticCurveTo(frontWheelX, nearWheelY - wheelRadius - 3.5, frontWheelX + wheelRadius + 2.5, nearWheelY);
  u.lineTo(r - 1, nearWheelY);
  u.lineTo(r + 3, nearWheelY - 2);
  u.lineTo(r + 3.5, 2);
  u.lineTo(r + 1, -1);
  u.lineTo(10, -4);
  u.lineTo(3, -s);
  u.lineTo(-12, -s);
  u.lineTo(-28, -2);
  u.lineTo(-r + 5, -2);
  u.lineTo(-r + 3, nearWheelY - 2);
  u.closePath();
  u.fill();
  u.stroke();

  // Canopy cockpit
  u.fillStyle = "#070c14";
  u.strokeStyle = primaryDark;
  u.lineWidth = 1.2;
  u.beginPath();
  u.moveTo(8, -3.5);
  u.lineTo(2, -s + 1.2);
  u.lineTo(-10, -s + 1.2);
  u.lineTo(-17, -2);
  u.closePath();
  u.fill();
  u.stroke();

  u.strokeStyle = "rgba(56, 189, 248, 0.7)";
  u.lineWidth = 1.3;
  u.beginPath();
  u.moveTo(6, -3.5);
  u.lineTo(1.5, -s + 1.8);
  u.stroke();

  // Deck louvers
  u.strokeStyle = "#0f172a";
  u.lineWidth = 1.4;
  for (let lx = -13; lx >= -23; lx -= 3.2) {
    u.beginPath();
    u.moveTo(lx, -s + 2.5);
    u.lineTo(lx - 2, -1);
    u.stroke();
  }

  // Pop-up headlights
  u.fillStyle = "#fef08a";
  u.shadowColor = "#fef08a";
  u.shadowBlur = 8;
  u.beginPath();
  u.moveTo(r - 1, 0);
  u.lineTo(r - 7, -2.5);
  u.lineTo(r - 6, -3.5);
  u.lineTo(r, -1);
  u.closePath();
  u.fill();
  u.shadowBlur = 0;

  // Elevated GT racing wing
  u.strokeStyle = chassisDark;
  u.lineWidth = 2.2;
  u.beginPath();
  u.moveTo(-24, -2);
  u.lineTo(-27, -s - 5);
  u.moveTo(-18, -2);
  u.lineTo(-21, -s - 5);
  u.stroke();

  const wingGrad = u.createLinearGradient(-34, -s - 6, -16, -s - 4);
  wingGrad.addColorStop(0, "#0f172a");
  wingGrad.addColorStop(0.5, primaryMid);
  wingGrad.addColorStop(1, primaryBright);

  u.fillStyle = wingGrad;
  u.strokeStyle = chassisDark;
  u.lineWidth = 1.3;
  u.beginPath();
  u.moveTo(-33, -s - 4);
  u.lineTo(-16, -s - 3);
  u.lineTo(-15, -s - 6.5);
  u.lineTo(-33, -s - 6.5);
  u.closePath();
  u.fill();
  u.stroke();

  u.fillStyle = primaryBright;
  u.fillRect(-34, -s - 7.5, 3, 5.5);
  u.strokeRect(-34, -s - 7.5, 3, 5.5);

  // Diffuser
  u.fillStyle = "#0f172a";
  for (let dx = -r + 5; dx <= -r + 13; dx += 3.5) {
    u.fillRect(dx, nearWheelY - 3, 1.8, 3.5);
  }

  // Accent pinstripe
  u.strokeStyle = accentColor;
  u.lineWidth = 1.4;
  u.beginPath();
  u.moveTo(r - 6, -2);
  u.lineTo(12, -3.8);
  u.lineTo(-10, nearWheelY - 5);
  u.stroke();
}

function drawSkylineBody(
  u: CanvasRenderingContext2D,
  f: any,
  r: number,
  s: number,
  nearWheelY: number,
  rearWheelX: number,
  frontWheelX: number,
  wheelRadius: number,
  primaryBright: string,
  primaryMid: string,
  primaryDark: string,
  accentColor: string,
  chassisDark: string,
  metalSilver: string,
  metalDark: string
) {
  // Nissan Skyline GT-R R34
  const bodyGrad = u.createLinearGradient(0, -s, 0, nearWheelY);
  bodyGrad.addColorStop(0, primaryBright);
  bodyGrad.addColorStop(0.4, primaryMid);
  bodyGrad.addColorStop(1, primaryDark);

  u.fillStyle = bodyGrad;
  u.strokeStyle = chassisDark;
  u.lineWidth = 2;
  u.beginPath();
  u.moveTo(-r + 4, nearWheelY);
  u.lineTo(rearWheelX - wheelRadius - 2.5, nearWheelY);
  u.quadraticCurveTo(rearWheelX, nearWheelY - wheelRadius - 3.5, rearWheelX + wheelRadius + 2.5, nearWheelY);
  u.lineTo(frontWheelX - wheelRadius - 2.5, nearWheelY);
  u.quadraticCurveTo(frontWheelX, nearWheelY - wheelRadius - 3.5, frontWheelX + wheelRadius + 2.5, nearWheelY);
  u.lineTo(r - 2, nearWheelY);
  u.lineTo(r + 1, nearWheelY - 2);
  u.lineTo(r + 2, 1);
  u.lineTo(r + 1, -3);
  u.lineTo(7, -5.5);
  u.lineTo(1, -s);
  u.lineTo(-15, -s + 0.8);
  u.lineTo(-27, -3);
  u.lineTo(-r + 5, -2.5);
  u.lineTo(-r + 3, nearWheelY - 2);
  u.closePath();
  u.fill();
  u.stroke();

  // Front intercooler mesh
  u.fillStyle = "#0f172a";
  u.fillRect(r - 4, 1, 5.5, 5);
  u.strokeStyle = metalSilver;
  u.lineWidth = 0.9;
  for (let ix = r - 3; ix <= r + 1; ix += 1.8) {
    u.beginPath();
    u.moveTo(ix, 1);
    u.lineTo(ix, 6);
    u.stroke();
  }

  // Angled Xenon headlights
  u.fillStyle = "#38bdf8";
  u.shadowColor = "#38bdf8";
  u.shadowBlur = 6;
  u.beginPath();
  u.roundRect(r - 2, -2.5, 3.5, 2.5, 1);
  u.fill();
  u.fillStyle = "#ffffff";
  u.beginPath();
  u.arc(r - 0.5, -1.2, 1, 0, Math.PI * 2);
  u.fill();
  u.shadowBlur = 0;

  // Coupe greenhouse
  u.fillStyle = "#070c14";
  u.strokeStyle = primaryDark;
  u.lineWidth = 1.2;
  u.beginPath();
  u.moveTo(5, -4.5);
  u.lineTo(0.5, -s + 1.5);
  u.lineTo(-13, -s + 2);
  u.lineTo(-24, -2.5);
  u.closePath();
  u.fill();
  u.stroke();

  u.strokeStyle = metalSilver;
  u.lineWidth = 1.2;
  u.beginPath();
  u.moveTo(-6, -s + 1.8);
  u.lineTo(-6, -3.5);
  u.stroke();

  u.strokeStyle = "rgba(255, 255, 255, 0.65)";
  u.lineWidth = 1.3;
  u.beginPath();
  u.moveTo(3, -4.5);
  u.lineTo(0, -s + 2);
  u.stroke();

  // Twin silver stripes
  u.fillStyle = "rgba(226, 232, 240, 0.9)";
  u.beginPath();
  u.moveTo(r - 1, -2);
  u.lineTo(6, -4.8);
  u.lineTo(5.5, -5.8);
  u.lineTo(r - 1, -3);
  u.closePath();
  u.fill();

  // GT-R wing
  u.strokeStyle = metalSilver;
  u.lineWidth = 2;
  u.beginPath();
  u.moveTo(-24, -3);
  u.lineTo(-26, -s - 4);
  u.moveTo(-19, -3);
  u.lineTo(-21, -s - 4);
  u.stroke();

  const wingGrad = u.createLinearGradient(-30, -s - 5, -18, -s - 3);
  wingGrad.addColorStop(0, "#0f172a");
  wingGrad.addColorStop(0.5, primaryMid);
  wingGrad.addColorStop(1, primaryBright);

  u.fillStyle = wingGrad;
  u.strokeStyle = chassisDark;
  u.lineWidth = 1.2;
  u.beginPath();
  u.moveTo(-29, -s - 3.5);
  u.lineTo(-18, -s - 2.5);
  u.lineTo(-17, -s - 5.5);
  u.lineTo(-29, -s - 5.5);
  u.closePath();
  u.fill();
  u.stroke();

  // Round tail lights (signature Skyline)
  u.fillStyle = "#ef4444";
  u.shadowColor = "#ef4444";
  u.shadowBlur = 6;
  u.beginPath();
  u.arc(-r + 4, -1, 1.8, 0, Math.PI * 2);
  u.arc(-r + 4, 3, 1.8, 0, Math.PI * 2);
  u.fill();
  u.shadowBlur = 0;

  // Titanium exhaust
  u.fillStyle = "#38bdf8";
  u.strokeStyle = metalSilver;
  u.lineWidth = 1;
  u.beginPath();
  u.roundRect(-r + 1, nearWheelY - 4, 4, 2.5, 1);
  u.fill();
  u.stroke();
}

function drawMercBody(
  u: CanvasRenderingContext2D,
  f: any,
  r: number,
  s: number,
  nearWheelY: number,
  rearWheelX: number,
  frontWheelX: number,
  wheelRadius: number,
  primaryBright: string,
  primaryMid: string,
  primaryDark: string,
  accentColor: string,
  chassisDark: string,
  metalSilver: string,
  metalDark: string
) {
  // Merc: Heavy Custom Van
  const bodyGrad = u.createLinearGradient(0, -s, 0, nearWheelY);
  bodyGrad.addColorStop(0, primaryBright);
  bodyGrad.addColorStop(0.4, primaryMid);
  bodyGrad.addColorStop(1, primaryDark);

  u.fillStyle = bodyGrad;
  u.strokeStyle = chassisDark;
  u.lineWidth = 2;
  u.beginPath();
  u.moveTo(-r + 4, nearWheelY);
  u.lineTo(rearWheelX - wheelRadius - 2.5, nearWheelY);
  u.quadraticCurveTo(rearWheelX, nearWheelY - wheelRadius - 4, rearWheelX + wheelRadius + 2.5, nearWheelY);
  u.lineTo(frontWheelX - wheelRadius - 2.5, nearWheelY);
  u.quadraticCurveTo(frontWheelX, nearWheelY - wheelRadius - 4, frontWheelX + wheelRadius + 2.5, nearWheelY);
  u.lineTo(r - 2, nearWheelY);
  u.lineTo(r + 2, nearWheelY - 3);
  u.lineTo(r + 2.5, -4);
  u.lineTo(12, -9);
  u.lineTo(6, -s);
  u.lineTo(-27, -s);
  u.lineTo(-r + 4, nearWheelY - 2);
  u.closePath();
  u.fill();
  u.stroke();

  // Van grille & bull bar
  u.fillStyle = "#0f172a";
  u.fillRect(r - 3, -4, 5, 12);
  u.strokeStyle = metalSilver;
  u.lineWidth = 1.2;
  for (let gy = -2; gy <= 7; gy += 2.5) {
    u.beginPath();
    u.moveTo(r - 3, gy);
    u.lineTo(r + 2, gy);
    u.stroke();
  }
  u.strokeStyle = "#475569";
  u.lineWidth = 2.4;
  u.beginPath();
  u.moveTo(r + 1, nearWheelY - 1);
  u.lineTo(r + 3.5, 2);
  u.lineTo(r + 3.5, -3);
  u.lineTo(r + 1, -5);
  u.stroke();

  u.fillStyle = "#fef08a";
  u.shadowColor = "#fef08a";
  u.shadowBlur = 6;
  u.fillRect(r - 2, -3.5, 3, 2.5);
  u.fillRect(r - 2, 0, 3, 2.5);
  u.shadowBlur = 0;

  // Cab window & sun visor
  u.fillStyle = "#070c14";
  u.strokeStyle = primaryDark;
  u.lineWidth = 1.2;
  u.beginPath();
  u.moveTo(10, -8);
  u.lineTo(5, -s + 2);
  u.lineTo(-7, -s + 2);
  u.lineTo(-7, -6);
  u.closePath();
  u.fill();
  u.stroke();

  u.fillStyle = primaryBright;
  u.strokeStyle = chassisDark;
  u.lineWidth = 1;
  u.beginPath();
  u.moveTo(6, -s);
  u.lineTo(13, -s + 2.5);
  u.lineTo(12, -s + 3.8);
  u.lineTo(5, -s + 1.5);
  u.closePath();
  u.fill();
  u.stroke();

  // Roof rack
  u.strokeStyle = metalSilver;
  u.lineWidth = 1.8;
  u.beginPath();
  u.moveTo(4, -s - 2.5);
  u.lineTo(-25, -s - 2.5);
  u.stroke();
  u.lineWidth = 1.2;
  for (let rx = 3; rx >= -24; rx -= 9) {
    u.beginPath();
    u.moveTo(rx, -s);
    u.lineTo(rx, -s - 2.5);
    u.stroke();
  }

  // Retro flames
  u.fillStyle = accentColor;
  u.beginPath();
  u.moveTo(-r + 10, nearWheelY - 6);
  u.lineTo(-5, nearWheelY - 9);
  u.lineTo(8, nearWheelY - 7);
  u.lineTo(0, nearWheelY - 5);
  u.lineTo(-r + 10, nearWheelY - 5);
  u.closePath();
  u.fill();

  // Rear cargo door split
  u.strokeStyle = chassisDark;
  u.lineWidth = 1.4;
  u.beginPath();
  u.moveTo(-r + 4, -s + 2);
  u.lineTo(-r + 4, nearWheelY - 3);
  u.stroke();
}

function drawHitboxOverlay(
  u: CanvasRenderingContext2D,
  f: any,
  r: number,
  s: number,
  isBlue: boolean
) {
  u.save();
  const w = f.width;
  const h = f.height;
  const x = -r;
  const y = -s;

  const glowColor = isBlue ? "#38bdf8" : "#fb923c";
  const fillColor = isBlue ? "rgba(56, 189, 248, 0.16)" : "rgba(251, 146, 60, 0.16)";

  // 1. Semi-transparent collision box fill
  u.fillStyle = fillColor;
  u.fillRect(x, y, w, h);

  // 2. Glowing wireframe bounding box
  u.strokeStyle = glowColor;
  u.lineWidth = 1.6;
  u.shadowColor = glowColor;
  u.shadowBlur = 6;
  u.strokeRect(x, y, w, h);
  u.shadowBlur = 0;

  // 3. Corner tick brackets
  const tick = Math.min(6, w * 0.1);
  u.strokeStyle = "#ffffff";
  u.lineWidth = 2;
  // Top-left
  u.beginPath(); u.moveTo(x, y + tick); u.lineTo(x, y); u.lineTo(x + tick, y); u.stroke();
  // Top-right
  u.beginPath(); u.moveTo(x + w - tick, y); u.lineTo(x + w, y); u.lineTo(x + w, y + tick); u.stroke();
  // Bottom-right
  u.beginPath(); u.moveTo(x + w, y + h - tick); u.lineTo(x + w, y + h); u.lineTo(x + w - tick, y + h); u.stroke();
  // Bottom-left
  u.beginPath(); u.moveTo(x + tick, y + h); u.lineTo(x, y + h); u.lineTo(x, y + h - tick); u.stroke();

  // 4. Center crosshair (+)
  u.strokeStyle = "rgba(255, 255, 255, 0.75)";
  u.lineWidth = 1;
  u.beginPath();
  u.moveTo(-4, 0); u.lineTo(4, 0);
  u.moveTo(0, -4); u.lineTo(0, 4);
  u.stroke();

  // 5. Front Bumper Power Strike Line (red/amber indicator at nose x = r)
  u.strokeStyle = "#ef4444";
  u.lineWidth = 2.5;
  u.shadowColor = "#ef4444";
  u.shadowBlur = 4;
  u.beginPath();
  u.moveTo(r, -s + 2);
  u.lineTo(r, s - 2);
  u.stroke();
  u.shadowBlur = 0;

  // 6. Undercarriage Wheel Reset Zone (green line along bottom within wheelbase)
  const wb = (f.wheelbase || 18) + 2.5;
  u.strokeStyle = "#22c55e";
  u.lineWidth = 2.5;
  u.beginPath();
  u.moveTo(-wb, s);
  u.lineTo(wb, s);
  u.stroke();

  // 7. Hitbox dimension badge above box
  u.save();
  u.font = "bold 9px 'Chakra Petch', monospace";
  u.fillStyle = "#ffffff";
  u.textAlign = "center";
  u.textBaseline = "middle";
  const label = `${(f.hitboxClass || "BOX").toUpperCase()}: ${Math.round(w)}×${Math.round(h)}`;
  const metrics = u.measureText(label);
  const badgeW = metrics.width + 8;
  const badgeH = 13;
  u.fillStyle = "rgba(15, 23, 42, 0.88)";
  u.strokeStyle = glowColor;
  u.lineWidth = 1;
  u.beginPath();
  u.roundRect(-badgeW / 2, -s - badgeH - 3, badgeW, badgeH, 3);
  u.fill();
  u.stroke();
  u.fillStyle = "#ffffff";
  u.fillText(label, 0, -s - badgeH / 2 - 3);
  u.restore();

  u.restore();
}

function eg(u: any, f: any, m: any = {}) {
  u.save();

  // Compute basis vectors for side-profile car:
  // fwd: local (+1, 0) direction (nose, front bumper, headlights)
  // down: local (0, +1) direction (bottom of car, wheels touching surface/ground)
  let fwdX: number, fwdY: number;
  let downX: number, downY: number;

  // Resolve surface normal with full fallback support for replays and network sync
  const isGrounded = !!f.isGrounded || (f.y >= k - (f.height || 36) - 5 && Math.abs(f.vy || 0) < 60 && Math.abs(Math.sin(f.angle || 0)) < 0.6);
  let surfaceNorm = f.surfaceNormal;
  if (isGrounded && (!surfaceNorm || (surfaceNorm.x === 0 && surfaceNorm.y === 0))) {
    if (f.surfaceType === "ceiling" || (f.y <= Qt + (f.height || 36) + 6)) {
      surfaceNorm = { x: 0, y: 1 };
    } else if (f.surfaceType === "left_wall" || (f.x <= At + (f.width || 80) / 2 + 6)) {
      surfaceNorm = { x: 1, y: 0 };
    } else if (f.surfaceType === "right_wall" || (f.x >= Mt - (f.width || 80) / 2 - 6)) {
      surfaceNorm = { x: -1, y: 0 };
    } else {
      // Default ground floor normal (points up into pitch = (0, -1))
      surfaceNorm = { x: 0, y: -1 };
    }
  }

  if (isGrounded && surfaceNorm && (surfaceNorm.x !== 0 || surfaceNorm.y !== 0)) {
    downX = -surfaceNorm.x;
    downY = -surfaceNorm.y;
    const physCos = Math.cos(f.angle);
    const physSin = Math.sin(f.angle);
    const t1X = -surfaceNorm.y;
    const t1Y = surfaceNorm.x;
    const dot1 = physCos * t1X + physSin * t1Y;
    if (dot1 >= 0) {
      fwdX = t1X;
      fwdY = t1Y;
    } else {
      fwdX = -t1X;
      fwdY = -t1Y;
    }
  } else {
    // In the air: smooth continuous rigid-body 2D rotation for all aerial maneuvers & flips
    fwdX = Math.cos(f.angle);
    fwdY = Math.sin(f.angle);
    const rollMult = f.airRollInverted ? -1 : 1;
    downX = -fwdY * rollMult;
    downY = fwdX * rollMult;
  }

  // Set the 2D coordinate space for the car
  u.transform(fwdX, fwdY, downX, downY, f.x, f.y);

  const r = f.width / 2;
  const s = f.height / 2;
  const isBlue = f.team === "blue";

  const primaryDark = isBlue ? "#024673" : "#7c2207";
  const primaryMid = isBlue ? "#0284c7" : "#ea580c";
  const primaryBright = isBlue ? "#38bdf8" : "#fb923c";
  const accentColor = isBlue ? "#7dd3fc" : "#fdba74";
  const chassisDark = "#080c14";
  const metalSilver = "#cbd5e1";
  const metalDark = "#334155";

  // Supersonic trails (streamlines behind car in side view)
  if (f.isSupersonic) {
    u.save();
    u.strokeStyle = "rgba(255, 255, 255, 0.85)";
    u.lineWidth = 2.5;
    u.shadowColor = primaryBright;
    u.shadowBlur = 12;
    u.beginPath();
    u.moveTo(-r - 4, -s - 4);
    u.lineTo(-r - 55, -s - 4);
    u.moveTo(-r - 6, 0);
    u.lineTo(-r - 70, 0);
    u.moveTo(-r, s - 2);
    u.lineTo(-r - 50, s - 2);
    u.stroke();
    u.restore();
  }

  // Helper: Draw round car wheel in side profile
  const drawWheel = (wx: number, wy: number, radius: number, isFarSide: boolean = false) => {
    u.save();
    u.fillStyle = isFarSide ? "#05070c" : "#0f172a";
    u.strokeStyle = isFarSide ? "#0f172a" : "#1e293b";
    u.lineWidth = 1.5;
    u.beginPath();
    u.arc(wx, wy, radius, 0, Math.PI * 2);
    u.fill();
    u.stroke();

    if (!isFarSide) {
      u.strokeStyle = "#334155";
      u.lineWidth = 1;
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        const x1 = wx + Math.cos(a) * (radius - 1.5);
        const y1 = wy + Math.sin(a) * (radius - 1.5);
        const x2 = wx + Math.cos(a) * (radius - 3.5);
        const y2 = wy + Math.sin(a) * (radius - 3.5);
        u.beginPath();
        u.moveTo(x1, y1);
        u.lineTo(x2, y2);
        u.stroke();
      }
    }

    u.fillStyle = isFarSide ? "#1e293b" : "#334155";
    u.beginPath();
    u.arc(wx, wy, radius * 0.65, 0, Math.PI * 2);
    u.fill();

    u.fillStyle = isFarSide ? "#0b0f19" : chassisDark;
    u.beginPath();
    u.arc(wx, wy, radius * 0.48, 0, Math.PI * 2);
    u.fill();

    u.strokeStyle = isFarSide ? "#334155" : metalSilver;
    u.lineWidth = 1.2;
    for (let a = 0; a < 5; a++) {
      const ang = a * (Math.PI * 2 / 5);
      u.beginPath();
      u.moveTo(wx, wy);
      u.lineTo(wx + Math.cos(ang) * (radius * 0.48), wy + Math.sin(ang) * (radius * 0.48));
      u.stroke();
    }

    u.fillStyle = primaryBright;
    u.beginPath();
    u.arc(wx, wy, radius * 0.22, 0, Math.PI * 2);
    u.fill();

    u.fillStyle = "#ffffff";
    u.beginPath();
    u.arc(wx, wy, 1.2, 0, Math.PI * 2);
    u.fill();

    if (f.hasFlipReset) {
      const pulse = Math.sin(Date.now() * 0.015) * 0.25 + 0.75;
      u.save();
      u.strokeStyle = "rgba(251, 191, 36, " + pulse + ")";
      u.lineWidth = 2.5;
      u.shadowColor = "#fbbf24";
      u.shadowBlur = 8;
      u.beginPath();
      u.arc(wx, wy, radius + 2.5, 0, Math.PI * 2);
      u.stroke();
      u.restore();
    }

    u.restore();
  };

  const rearWheelX = f.rearWheelX ?? (-f.wheelbase || -17);
  const frontWheelX = f.frontWheelX ?? (f.wheelbase || 18);
  const wheelRadius = f.wheelRadius || 7.5;
  const nearWheelY = s - wheelRadius + 0.5;
  const farWheelY = nearWheelY - 2.5;

  // 1. Far-side wheels
  drawWheel(rearWheelX - 2, farWheelY, wheelRadius * 0.92, true);
  drawWheel(frontWheelX - 2, farWheelY, wheelRadius * 0.92, true);

  // 2. Exhaust & rocket thruster nozzle
  u.fillStyle = "#1e293b";
  u.strokeStyle = "#475569";
  u.lineWidth = 1.2;
  u.beginPath();
  u.moveTo(-r + 6, -2);
  u.lineTo(-r - 4, -4);
  u.lineTo(-r - 6, -5);
  u.lineTo(-r - 6, 5);
  u.lineTo(-r - 4, 4);
  u.lineTo(-r + 6, 2);
  u.closePath();
  u.fill();
  u.stroke();

  u.fillStyle = "#f59e0b";
  u.beginPath();
  u.arc(-r - 4, 0, 2.8, 0, Math.PI * 2);
  u.fill();

  // Boost flames
  if (f.isBoosting || f.isSupersonic) {
    u.save();
    const flameLen = f.isSupersonic ? 45 : 28;
    const flameW = f.isSupersonic ? 7 : 5;
    const flameGrad = u.createLinearGradient(-r - 6, 0, -r - 6 - flameLen, 0);
    flameGrad.addColorStop(0, "#ffffff");
    flameGrad.addColorStop(0.15, "#fef08a");
    flameGrad.addColorStop(0.45, isBlue ? "#38bdf8" : "#f97316");
    flameGrad.addColorStop(0.85, isBlue ? "#0284c7" : "#ea580c");
    flameGrad.addColorStop(1, "rgba(234, 88, 12, 0)");

    u.fillStyle = flameGrad;
    u.beginPath();
    u.moveTo(-r - 6, -flameW);
    u.quadraticCurveTo(-r - 6 - flameLen * 0.6, -flameW * 1.3, -r - 6 - flameLen, 0);
    u.quadraticCurveTo(-r - 6 - flameLen * 0.6, flameW * 1.3, -r - 6, flameW);
    u.closePath();
    u.fill();

    const coreGrad = u.createLinearGradient(-r - 6, 0, -r - 6 - flameLen * 0.45, 0);
    coreGrad.addColorStop(0, "#ffffff");
    coreGrad.addColorStop(1, "rgba(254, 240, 138, 0)");
    u.fillStyle = coreGrad;
    u.beginPath();
    u.moveTo(-r - 6, -flameW * 0.5);
    u.lineTo(-r - 6 - flameLen * 0.45, 0);
    u.lineTo(-r - 6, flameW * 0.5);
    u.closePath();
    u.fill();
    u.restore();
  }

  // 3. Lower chassis plate
  u.fillStyle = chassisDark;
  u.strokeStyle = "#1e293b";
  u.lineWidth = 1.5;
  u.beginPath();
  u.moveTo(-r + 4, nearWheelY);
  u.lineTo(r - 4, nearWheelY);
  u.lineTo(r - 2, nearWheelY - 2);
  u.lineTo(-r + 2, nearWheelY - 2);
  u.closePath();
  u.fill();
  u.stroke();

  // 4. Car model silhouette
  const model = f.carModel || "octane";
  if (model === "fennec") {
    drawFennecBody(u, f, r, s, nearWheelY, rearWheelX, frontWheelX, wheelRadius, primaryBright, primaryMid, primaryDark, accentColor, chassisDark, metalSilver, metalDark);
  } else if (model === "dominus") {
    drawDominusBody(u, f, r, s, nearWheelY, rearWheelX, frontWheelX, wheelRadius, primaryBright, primaryMid, primaryDark, accentColor, chassisDark, metalSilver, metalDark);
  } else if (model === "breakout") {
    drawBreakoutBody(u, f, r, s, nearWheelY, rearWheelX, frontWheelX, wheelRadius, primaryBright, primaryMid, primaryDark, accentColor, chassisDark, metalSilver, metalDark);
  } else if (model === "skyline") {
    drawSkylineBody(u, f, r, s, nearWheelY, rearWheelX, frontWheelX, wheelRadius, primaryBright, primaryMid, primaryDark, accentColor, chassisDark, metalSilver, metalDark);
  } else if (model === "merc") {
    drawMercBody(u, f, r, s, nearWheelY, rearWheelX, frontWheelX, wheelRadius, primaryBright, primaryMid, primaryDark, accentColor, chassisDark, metalSilver, metalDark);
  } else {
    drawOctaneBody(u, f, r, s, nearWheelY, rearWheelX, frontWheelX, wheelRadius, primaryBright, primaryMid, primaryDark, accentColor, chassisDark, metalSilver, metalDark);
  }

  // 4.5. Custom Decal / Livery
  if (f.customDecal) {
    drawCarDecal(u, f, r, s, f.customDecal);
  }

  // 5. Headlight beam forward
  const beamGrad = u.createLinearGradient(r + 2, -1, r + 130, -1);
  beamGrad.addColorStop(0, "rgba(254, 240, 138, 0.35)");
  beamGrad.addColorStop(1, "rgba(254, 240, 138, 0)");
  u.fillStyle = beamGrad;
  u.beginPath();
  u.moveTo(r + 2, -1);
  u.lineTo(r + 130, -18);
  u.lineTo(r + 130, 22);
  u.closePath();
  u.fill();

  // 6. Foreground wheels
  if (f.customWheels) {
    drawCustomWheel(u, rearWheelX, nearWheelY, wheelRadius, f.customWheels, f.angle || 0);
    drawCustomWheel(u, frontWheelX, nearWheelY, wheelRadius, f.customWheels, f.angle || 0);
  } else {
    drawWheel(rearWheelX, nearWheelY, wheelRadius, false);
    drawWheel(frontWheelX, nearWheelY, wheelRadius, false);
  }

  // 6.5. Custom Roof Topper
  if (f.customTopper) {
    drawCarTopper(u, f, r, s, f.customTopper);
  }

  // 7. Hitbox Visualizer Overlay (when setting is active)
  if (m.showHitbox || f.showHitbox) {
    drawHitboxOverlay(u, f, r, s, isBlue);
  }

  u.restore();

  // 8. Nametag & boost bar
  lg(u, f, m);
}

function oc(u: any, f: any, r: any, s: any, y: any, m: any, g: any) {
  u.fillStyle = m;
  u.beginPath();
  u.roundRect(f, r, s, y, 3);
  u.fill();
  u.fillStyle = g;
  u.beginPath();
  u.arc(f + s / 2, r + y / 2, 2.5, 0, Math.PI * 2);
  u.fill();
}

function lg(u: any, f: any, m: any = {}) {
  u.save();
  const isBlue = f.team === "blue";
  let name = f.name || (isBlue ? "Player" : "Bot");
  if (name.length > 20) {
    name = name.slice(0, 19) + "…";
  }
  const score = Math.round(f.score || 0);
  const scoreStr = `${score}`;

  u.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, sans-serif";
  const nameMetrics = u.measureText(name);
  u.font = "900 12px monospace, -apple-system, sans-serif";
  const scoreMetrics = u.measureText(scoreStr);

  const pillW = Math.max(76, Math.min(195, Math.round(nameMetrics.width + scoreMetrics.width + 24)));
  const pillH = 24;
  const rx = Math.round(f.x);
  const ry = Math.round(f.y - 44);

  u.shadowColor = "rgba(0, 0, 0, 0.55)";
  u.shadowBlur = 6;
  u.shadowOffsetY = 2;

  u.fillStyle = isBlue ? "rgba(10, 25, 47, 0.94)" : "rgba(36, 16, 10, 0.94)";
  u.strokeStyle = isBlue ? "#38bdf8" : "#f97316";
  u.lineWidth = 2.5;
  u.beginPath();
  u.roundRect(rx - pillW / 2, ry - pillH / 2, pillW, pillH, 7);
  u.fill();
  u.stroke();

  u.shadowColor = "transparent";
  u.shadowBlur = 0;
  u.shadowOffsetY = 0;

  // Player Name
  u.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, sans-serif";
  u.fillStyle = "#ffffff";
  u.textAlign = "left";
  u.textBaseline = "middle";
  u.fillText(name, rx - pillW / 2 + 8, ry);

  // Player Live Score
  u.font = "900 12px monospace, -apple-system, sans-serif";
  u.fillStyle = "#facc15";
  u.textAlign = "right";
  u.fillText(scoreStr, rx + pillW / 2 - 8, ry);

  const barW = pillW - 12;
  const barH = 3.5;
  const barY = ry + pillH / 2 + 3.5;
  u.fillStyle = "rgba(255, 255, 255, 0.25)";
  u.fillRect(rx - barW / 2, barY, barW, barH);
  u.fillStyle = f.boost > 25 ? "#fbbf24" : "#ef4444";
  u.fillRect(rx - barW / 2, barY, (barW * Math.max(0, Math.min(100, f.boost))) / 100, barH);

  // Overhead mechanic alert badges (strictly deduplicated - renders at most ONE badge per trick)
  if (m.showMechanicAlerts !== false) {
    const isReplay = m.isReplay || m.replayTime !== undefined;
    const currentRefTime = isReplay ? (m.replayTime ?? performance.now()) : performance.now();

    let alerts: any[] = [];
    if (isReplay) {
      // In replay, gather from matchEvents for this car, strictly 1 entry per mechanic text
      if (m.matchEvents && Array.isArray(m.matchEvents)) {
        const activeEvs = m.matchEvents.filter((ev: any) =>
          ev.type === "mechanic" &&
          ev.player === f.name &&
          currentRefTime >= ev.time &&
          currentRefTime - ev.time < 1800
        );
        for (const ev of activeEvs) {
          if (!alerts.some((a: any) => a.text === ev.text)) {
            alerts.push({
              id: ev.id,
              text: ev.text,
              color: ev.color,
              gameTime: ev.time,
              startTime: ev.time,
              duration: 1800
            });
          }
        }
      }
      // If no matchEvents matched, fallback to snapshot alerts (strictly deduplicated)
      if (alerts.length === 0 && f.activeMechanicAlerts && Array.isArray(f.activeMechanicAlerts)) {
        for (const a of f.activeMechanicAlerts) {
          if (!alerts.some((u: any) => u.text === a.text)) {
            alerts.push(a);
          }
        }
      }
    } else {
      const rawAlerts = f.activeMechanicAlerts ? [...f.activeMechanicAlerts] : (f.activeMechanicAlert ? [f.activeMechanicAlert] : []);
      for (const a of rawAlerts) {
        if (!alerts.some((u: any) => u.text === a.text)) {
          alerts.push(a);
        }
      }
    }

    const remainingAlerts = [];
    for (let idx = 0; idx < alerts.length; idx++) {
      const alert = alerts[idx];
      let elapsed: number;
      if (isReplay) {
        const aTime = alert.gameTime ?? alert.startTime ?? currentRefTime;
        elapsed = currentRefTime - aTime;
      } else {
        if (alert.gameTime !== undefined) {
          elapsed = performance.now() - alert.gameTime;
        } else if (alert.startTime > 1e11) {
          elapsed = Date.now() - alert.startTime;
        } else {
          elapsed = performance.now() - (alert.startTime || 0);
        }
      }
      const duration = alert.duration || 1800;

      if (elapsed >= 0 && elapsed < duration) {
        remainingAlerts.push(alert);
        const progress = elapsed / duration;
        const opacity = progress < 0.10 ? progress / 0.10 : (progress > 0.70 ? Math.max(0, (1 - progress) / 0.30) : 1);
        const floatY = -progress * 24;
        const stackOffset = -idx * 28;
        const alertY = ry - 26 + stackOffset + floatY;

        u.save();
        u.globalAlpha = opacity;
        u.font = "bold 13px 'Chakra Petch', system-ui, -apple-system, sans-serif";
        const mText = alert.text;
        const mMetrics = u.measureText(mText);
        const mPillW = Math.round(mMetrics.width + 22);
        const mPillH = 24;

        u.shadowColor = alert.color || "#38bdf8";
        u.shadowBlur = 12;
        u.shadowOffsetY = 1;

        u.fillStyle = "rgba(10, 15, 26, 0.95)";
        u.strokeStyle = alert.color || "#38bdf8";
        u.lineWidth = 2;
        u.beginPath();
        u.roundRect(rx - mPillW / 2, alertY - mPillH / 2, mPillW, mPillH, 7);
        u.fill();
        u.stroke();

        // Downward pointer arrow pointing to car roof
        u.fillStyle = alert.color || "#38bdf8";
        u.beginPath();
        u.moveTo(rx - 5, alertY + mPillH / 2);
        u.lineTo(rx + 5, alertY + mPillH / 2);
        u.lineTo(rx, alertY + mPillH / 2 + 5);
        u.closePath();
        u.fill();

        u.shadowBlur = 0;
        u.fillStyle = "#ffffff";
        u.textAlign = "center";
        u.textBaseline = "middle";
        u.fillText(mText, rx, alertY);

        u.restore();
      }
    }
    if (!isReplay) {
      f.activeMechanicAlerts = remainingAlerts;
      f.activeMechanicAlert = remainingAlerts[0] || null;
    }
  }

  u.restore();
}

function ag(u: any, f: any) {
  u.save();
  u.font = "bold 14px 'Chakra Petch', system-ui, sans-serif";
  u.fillStyle = "#ef4444";
  u.textAlign = "center";
  u.fillText(`RESPAWNING: ${f.demoRespawnTimer.toFixed(1)}s`, f.x, f.y - 20);
  u.strokeStyle = "rgba(239, 68, 68, 0.4)";
  u.lineWidth = 2;
  u.beginPath();
  u.arc(f.x, f.y, 25, 0, Math.PI * 2);
  u.stroke();
  u.restore();
}

function ngBacking(u: any, viewMinX: number = -150, viewMaxX: number = 2150) {
  u.save();
  if (activeMapDef.goalType === "floor") {
    drawFloorGoalBacking(u, le, true);
    drawFloorGoalBacking(u, ae, false);
  } else if (activeMapDef.goalType === "ceiling") {
    drawCeilingGoalBacking(u, le, true);
    drawCeilingGoalBacking(u, ae, false);
  } else {
    JhBacking(u, le, true, viewMinX, viewMaxX);  // Blue Goal (Left)
    JhBacking(u, ae, false, viewMinX, viewMaxX); // Orange Goal (Right)
  }
  u.restore();
}

function drawFloorGoalBacking(u: any, f: any, isBlue: boolean) {
  const xMin = f.xMin !== undefined ? f.xMin : 420;
  const xMax = f.xMax !== undefined ? f.xMax : 720;
  const netW = xMax - xMin;
  const yFloor = f.y !== undefined ? f.y : k;
  const netDepth = f.depth;
  const pitBottom = yFloor + netDepth;

  u.save();

  // 1. Pit Net Interior Backing
  const netGrad = u.createLinearGradient(xMin, yFloor, xMax, pitBottom);
  netGrad.addColorStop(0, isBlue ? "#0c1a2e" : "#28110b");
  netGrad.addColorStop(1, isBlue ? "#050b16" : "#170805");
  u.fillStyle = netGrad;
  u.fillRect(xMin, yFloor, netW, netDepth);

  // 2. Pit Interior Atmosphere Glow
  const glowGrad = u.createRadialGradient(
    (xMin + xMax) / 2, pitBottom - 35, 10,
    (xMin + xMax) / 2, pitBottom - 35, 130
  );
  glowGrad.addColorStop(0, isBlue ? "rgba(56, 189, 248, 0.28)" : "rgba(249, 115, 22, 0.28)");
  glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  u.fillStyle = glowGrad;
  u.fillRect(xMin, yFloor, netW, netDepth);

  // 3. Hexagonal Honeycomb Net Pattern
  u.save();
  u.beginPath();
  u.rect(xMin, yFloor, netW, netDepth);
  u.clip();

  const hexRadius = 14;
  const hexWidth = hexRadius * Math.sqrt(3);
  const hexHeight = hexRadius * 1.5;

  u.strokeStyle = isBlue ? "rgba(56, 189, 248, 0.38)" : "rgba(249, 115, 22, 0.38)";
  u.lineWidth = 1.3;

  const numCols = Math.ceil(netW / hexWidth) + 3;
  const numRows = Math.ceil(netDepth / hexHeight) + 3;

  for (let r = -1; r <= numRows; r++) {
    const hy = yFloor + r * hexHeight;
    const rowOffset = (Math.abs(r) % 2 === 0) ? 0 : hexWidth / 2;

    for (let c = -1; c <= numCols; c++) {
      const hx = xMin + c * hexWidth + rowOffset;
      u.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3 - Math.PI / 6;
        const px = hx + hexRadius * Math.cos(ang);
        const py = hy + hexRadius * Math.sin(ang);
        i === 0 ? u.moveTo(px, py) : u.lineTo(px, py);
      }
      u.closePath();
      u.stroke();
    }
  }
  u.restore();

  u.restore();
}

function drawFloorGoalForeground(u: any, f: any, isBlue: boolean) {
  const xMin = f.xMin !== undefined ? f.xMin : 420;
  const xMax = f.xMax !== undefined ? f.xMax : 720;
  const netW = xMax - xMin;
  const yFloor = f.y !== undefined ? f.y : k;
  const netDepth = f.depth;
  const pitBottom = yFloor + netDepth;

  u.save();

  // 1. Semi-transparent Front Netting
  u.save();
  u.beginPath();
  u.rect(xMin, yFloor, netW, netDepth);
  u.clip();

  const hexRadius = 14;
  const hexWidth = hexRadius * Math.sqrt(3);
  const hexHeight = hexRadius * 1.5;

  u.strokeStyle = isBlue ? "rgba(56, 189, 248, 0.18)" : "rgba(249, 115, 22, 0.18)";
  u.lineWidth = 1.0;

  const numCols = Math.ceil(netW / hexWidth) + 3;
  const numRows = Math.ceil(netDepth / hexHeight) + 3;

  for (let r = -1; r <= numRows; r++) {
    const hy = yFloor + r * hexHeight;
    const rowOffset = (Math.abs(r) % 2 === 0) ? 0 : hexWidth / 2;

    for (let c = -1; c <= numCols; c++) {
      const hx = xMin + c * hexWidth + rowOffset;
      u.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3 - Math.PI / 6;
        const px = hx + hexRadius * Math.cos(ang);
        const py = hy + hexRadius * Math.sin(ang);
        i === 0 ? u.moveTo(px, py) : u.lineTo(px, py);
      }
      u.closePath();
      u.stroke();
    }
  }
  u.restore();

  // 2. Goal Posts and Curved Tubular Framing
  const pipeColor = isBlue ? "#0284c7" : "#ea580c";
  const pipeHighlight = isBlue ? "#38bdf8" : "#fb923c";

  const rampW = 75;
  u.strokeStyle = pipeColor;
  u.lineWidth = 7;
  u.beginPath();
  u.moveTo(xMin, yFloor);
  u.lineTo(xMin + rampW, pitBottom);
  u.lineTo(xMax - rampW, pitBottom);
  u.lineTo(xMax, yFloor);
  u.stroke();

  u.strokeStyle = pipeHighlight;
  u.lineWidth = 2.5;
  u.beginPath();
  u.moveTo(xMin, yFloor);
  u.lineTo(xMin + rampW, pitBottom);
  u.lineTo(xMax - rampW, pitBottom);
  u.lineTo(xMax, yFloor);
  u.stroke();

  // 3. Goal Post Bumper Caps
  kh(u, xMin, yFloor);
  kh(u, xMax, yFloor);

  u.restore();
}

function drawCeilingGoalBacking(u: any, f: any, isBlue: boolean) {
  const xMin = f.xMin !== undefined ? f.xMin : 420;
  const xMax = f.xMax !== undefined ? f.xMax : 720;
  const netW = xMax - xMin;
  const yCeil = f.y !== undefined ? f.y : Qt;
  const netDepth = f.depth;
  const vaultTop = yCeil - netDepth;

  u.save();

  // 1. Vault Net Interior Backing
  const netGrad = u.createLinearGradient(xMin, yCeil, xMax, vaultTop);
  netGrad.addColorStop(0, isBlue ? "#0c1a2e" : "#28110b");
  netGrad.addColorStop(1, isBlue ? "#050b16" : "#170805");
  u.fillStyle = netGrad;
  u.fillRect(xMin, vaultTop, netW, netDepth);

  // 2. Atmosphere Glow inside Vault
  const glowGrad = u.createRadialGradient(
    (xMin + xMax) / 2, vaultTop + 35, 10,
    (xMin + xMax) / 2, vaultTop + 35, 130
  );
  glowGrad.addColorStop(0, isBlue ? "rgba(56, 189, 248, 0.28)" : "rgba(249, 115, 22, 0.28)");
  glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  u.fillStyle = glowGrad;
  u.fillRect(xMin, vaultTop, netW, netDepth);

  // 3. Hexagonal Honeycomb Net Pattern
  u.save();
  u.beginPath();
  u.rect(xMin, vaultTop, netW, netDepth);
  u.clip();

  const hexRadius = 14;
  const hexWidth = hexRadius * Math.sqrt(3);
  const hexHeight = hexRadius * 1.5;

  u.strokeStyle = isBlue ? "rgba(56, 189, 248, 0.38)" : "rgba(249, 115, 22, 0.38)";
  u.lineWidth = 1.3;

  const numCols = Math.ceil(netW / hexWidth) + 3;
  const numRows = Math.ceil(netDepth / hexHeight) + 3;

  for (let r = -1; r <= numRows; r++) {
    const hy = vaultTop + r * hexHeight;
    const rowOffset = (Math.abs(r) % 2 === 0) ? 0 : hexWidth / 2;

    for (let c = -1; c <= numCols; c++) {
      const hx = xMin + c * hexWidth + rowOffset;
      u.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3 - Math.PI / 6;
        const px = hx + hexRadius * Math.cos(ang);
        const py = hy + hexRadius * Math.sin(ang);
        i === 0 ? u.moveTo(px, py) : u.lineTo(px, py);
      }
      u.closePath();
      u.stroke();
    }
  }
  u.restore();

  u.restore();
}

function drawCeilingGoalForeground(u: any, f: any, isBlue: boolean) {
  const xMin = f.xMin !== undefined ? f.xMin : 420;
  const xMax = f.xMax !== undefined ? f.xMax : 720;
  const netW = xMax - xMin;
  const yCeil = f.y !== undefined ? f.y : Qt;
  const netDepth = f.depth;
  const vaultTop = yCeil - netDepth;

  u.save();

  // 1. Semi-transparent Front Netting
  u.save();
  u.beginPath();
  u.rect(xMin, vaultTop, netW, netDepth);
  u.clip();

  const hexRadius = 14;
  const hexWidth = hexRadius * Math.sqrt(3);
  const hexHeight = hexRadius * 1.5;

  u.strokeStyle = isBlue ? "rgba(56, 189, 248, 0.18)" : "rgba(249, 115, 22, 0.18)";
  u.lineWidth = 1.0;

  const numCols = Math.ceil(netW / hexWidth) + 3;
  const numRows = Math.ceil(netDepth / hexHeight) + 3;

  for (let r = -1; r <= numRows; r++) {
    const hy = vaultTop + r * hexHeight;
    const rowOffset = (Math.abs(r) % 2 === 0) ? 0 : hexWidth / 2;

    for (let c = -1; c <= numCols; c++) {
      const hx = xMin + c * hexWidth + rowOffset;
      u.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3 - Math.PI / 6;
        const px = hx + hexRadius * Math.cos(ang);
        const py = hy + hexRadius * Math.sin(ang);
        i === 0 ? u.moveTo(px, py) : u.lineTo(px, py);
      }
      u.closePath();
      u.stroke();
    }
  }
  u.restore();

  // 2. Goal Posts and Curved Tubular Framing
  const pipeColor = isBlue ? "#0284c7" : "#ea580c";
  const pipeHighlight = isBlue ? "#38bdf8" : "#fb923c";

  u.strokeStyle = pipeColor;
  u.lineWidth = 7;
  u.beginPath();
  u.moveTo(xMin, yCeil);
  u.lineTo(xMin, vaultTop);
  u.lineTo(xMax, vaultTop);
  u.lineTo(xMax, yCeil);
  u.stroke();

  u.strokeStyle = pipeHighlight;
  u.lineWidth = 2.5;
  u.beginPath();
  u.moveTo(xMin, yCeil);
  u.lineTo(xMin, vaultTop);
  u.lineTo(xMax, vaultTop);
  u.lineTo(xMax, yCeil);
  u.stroke();

  // 3. Goal Post Bumper Caps
  kh(u, xMin, yCeil);
  kh(u, xMax, yCeil);

  u.restore();
}

function JhBacking(u: any, f: any, isBlue: boolean, viewMinX: number = -150, viewMaxX: number = 2150) {
  const goalLineX = f.x; // At = 120 for blue, Mt = 1880 for orange
  const yTop = f.yMin;   // 380
  const yBot = f.yMax;   // 680
  const netH = yBot - yTop; // 300
  const netDepth = f.depth; // 130
  const backWallX = isBlue ? goalLineX - netDepth : goalLineX + netDepth; // -10 for blue, 2010 for orange

  const rectLeft = isBlue ? backWallX : goalLineX;
  const rectWidth = netDepth; // Exactly 130px on both sides!

  u.save();

  // 0. Exterior stadium wall backing if viewport extends behind the goal net
  if (isBlue && viewMinX < backWallX) {
    u.fillStyle = "#08162b";
    u.fillRect(viewMinX, yTop, backWallX - viewMinX, netH);
  } else if (!isBlue && viewMaxX > backWallX) {
    u.fillStyle = "#250c05";
    u.fillRect(backWallX, yTop, viewMaxX - backWallX, netH);
  }

  // 1. Goal Net Interior Backing
  const netGrad = u.createLinearGradient(
    goalLineX, yTop,
    backWallX, yBot
  );
  netGrad.addColorStop(0, isBlue ? "#0c1a2e" : "#28110b");
  netGrad.addColorStop(1, isBlue ? "#050b16" : "#170805");
  u.fillStyle = netGrad;
  u.fillRect(rectLeft, yTop, rectWidth, netH);

  // 2. Goal Net Interior Atmosphere Glow (Illuminates car and ball inside the net!)
  const glowGrad = u.createRadialGradient(
    isBlue ? backWallX + 45 : backWallX - 45,
    (yTop + yBot) / 2,
    15,
    isBlue ? backWallX + 45 : backWallX - 45,
    (yTop + yBot) / 2,
    130
  );
  glowGrad.addColorStop(0, isBlue ? "rgba(56, 189, 248, 0.22)" : "rgba(249, 115, 22, 0.22)");
  glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  u.fillStyle = glowGrad;
  u.fillRect(rectLeft, yTop, rectWidth, netH);

  // 3. Hexagonal Honeycomb Net Pattern (Back wall layer)
  u.save();
  u.beginPath();
  u.rect(rectLeft, yTop, rectWidth, netH);
  u.clip();

  const hexRadius = 14;
  const hexWidth = hexRadius * Math.sqrt(3);
  const hexHeight = hexRadius * 1.5;

  u.strokeStyle = isBlue ? "rgba(56, 189, 248, 0.38)" : "rgba(249, 115, 22, 0.38)";
  u.lineWidth = 1.3;

  const numRows = Math.ceil(netH / hexHeight) + 3;
  const numCols = Math.ceil(rectWidth / hexWidth) + 3;

  for (let r = -1; r <= numRows; r++) {
    const hy = yTop + r * hexHeight;
    const rowOffset = (Math.abs(r) % 2 === 0) ? 0 : hexWidth / 2;

    for (let c = -1; c <= numCols; c++) {
      const hx = isBlue
        ? (goalLineX - c * hexWidth - rowOffset)
        : (goalLineX + c * hexWidth + rowOffset);

      u.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3 - Math.PI / 6;
        const px = hx + hexRadius * Math.cos(ang);
        const py = hy + hexRadius * Math.sin(ang);
        i === 0 ? u.moveTo(px, py) : u.lineTo(px, py);
      }
      u.closePath();
      u.stroke();
    }
  }
  u.restore();

  u.restore();
}

function ngForeground(u: any, viewMinX: number = -150, viewMaxX: number = 2150) {
  u.save();
  if (activeMapDef.goalType === "floor") {
    drawFloorGoalForeground(u, le, true);
    drawFloorGoalForeground(u, ae, false);
  } else if (activeMapDef.goalType === "ceiling") {
    drawCeilingGoalForeground(u, le, true);
    drawCeilingGoalForeground(u, ae, false);
  } else {
    JhForeground(u, le, true, viewMinX, viewMaxX);  // Blue Goal (Left)
    JhForeground(u, ae, false, viewMinX, viewMaxX); // Orange Goal (Right)
  }
  u.restore();
}

function JhForeground(u: any, f: any, isBlue: boolean, viewMinX: number = -150, viewMaxX: number = 2150) {
  const goalLineX = f.x;
  const yTop = f.yMin;
  const yBot = f.yMax;
  const netH = yBot - yTop;
  const netDepth = f.depth;
  const backWallX = isBlue ? goalLineX - netDepth : goalLineX + netDepth;
  const rectLeft = isBlue ? backWallX : goalLineX;
  const rectWidth = netDepth;

  u.save();

  // 1. Semi-transparent Front Netting (Allows car and ball inside to be 100% visible, sharp, and clear!)
  u.save();
  u.beginPath();
  u.rect(rectLeft, yTop, rectWidth, netH);
  u.clip();

  const hexRadius = 14;
  const hexWidth = hexRadius * Math.sqrt(3);
  const hexHeight = hexRadius * 1.5;

  u.strokeStyle = isBlue ? "rgba(56, 189, 248, 0.18)" : "rgba(249, 115, 22, 0.18)";
  u.lineWidth = 1.0;

  const numRows = Math.ceil(netH / hexHeight) + 3;
  const numCols = Math.ceil(rectWidth / hexWidth) + 3;

  for (let r = -1; r <= numRows; r++) {
    const hy = yTop + r * hexHeight;
    const rowOffset = (Math.abs(r) % 2 === 0) ? 0 : hexWidth / 2;

    for (let c = -1; c <= numCols; c++) {
      const hx = isBlue
        ? (goalLineX - c * hexWidth - rowOffset)
        : (goalLineX + c * hexWidth + rowOffset);

      u.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3 - Math.PI / 6;
        const px = hx + hexRadius * Math.cos(ang);
        const py = hy + hexRadius * Math.sin(ang);
        i === 0 ? u.moveTo(px, py) : u.lineTo(px, py);
      }
      u.closePath();
      u.stroke();
    }
  }
  u.restore();

  // 2. Goal Posts and Curved Tubular Framing (Front line at goalLineX, posts lightly touch the edge)
  const postX = isBlue ? goalLineX - POST_INSET : goalLineX + POST_INSET;
  const pipeColor = isBlue ? "#0284c7" : "#ea580c";
  const pipeHighlight = isBlue ? "#38bdf8" : "#fb923c";

  // Base thick pipe outlining goal frame (open goal mouth)
  u.strokeStyle = pipeColor;
  u.lineWidth = 7;
  u.beginPath();
  u.moveTo(goalLineX, yBot);
  u.lineTo(backWallX, yBot);
  u.lineTo(backWallX, yTop);
  u.lineTo(goalLineX, yTop);
  u.stroke();

  // Pipe metallic highlight
  u.strokeStyle = pipeHighlight;
  u.lineWidth = 2.5;
  u.beginPath();
  u.moveTo(goalLineX, yBot);
  u.lineTo(backWallX, yBot);
  u.lineTo(backWallX, yTop);
  u.lineTo(goalLineX, yTop);
  u.stroke();

  // 3. White/Silver Bumper Caps at Goal Posts (Circles lightly touch the edge at goalLineX!)
  kh(u, postX, yTop);
  kh(u, postX, yBot);

  u.restore();
}

function kh(u: any, f: number, r: number) {
  const s = u.createRadialGradient(f - 2, r - 2, 2, f, r, zn);
  s.addColorStop(0, "#ffffff");
  s.addColorStop(0.6, "#cbd5e1");
  s.addColorStop(1, "#475569");
  u.fillStyle = s;
  u.strokeStyle = "#0f172a";
  u.lineWidth = 2;
  u.beginPath();
  u.arc(f, r, zn, 0, Math.PI * 2);
  u.fill();
  u.stroke();
}

function ug(u: any, f: any) {
  u.save();
  for (let r = f.length - 1; r >= 0; r--) {
    const s = f[r];
    const y = Math.max(0, s.life / s.maxLife);
    u.fillStyle = s.color;
    u.globalAlpha = y;
    if (s.type === "boost") {
      u.beginPath();
      u.arc(s.x, s.y, s.size * (0.4 + 0.6 * y), 0, Math.PI * 2);
      u.fill();
    } else if (s.type === "spark") {
      u.fillRect(s.x - s.size / 2, s.y - s.size / 2, s.size, s.size);
    } else if (s.type === "supersonic") {
      u.beginPath();
      u.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      u.fill();
    } else if (s.type === "demo_explosion") {
      u.beginPath();
      u.arc(s.x, s.y, s.size * (1.5 - y * 0.5), 0, Math.PI * 2);
      u.fill();
    } else if (s.type === "text") {
      u.font = `bold ${s.size || 14}px 'Chakra Petch', system-ui, sans-serif`;
      u.fillStyle = s.color || "#fbbf24";
      u.shadowColor = s.color || "#fbbf24";
      u.shadowBlur = 8;
      u.textAlign = "center";
      u.textBaseline = "middle";
      u.fillText(s.text, s.x, s.y);
      u.shadowBlur = 0;
    }
  }
  u.restore();
}
// --- UI COMPONENTS & MAIN APP ---
const a2 = ({
  blueScore: u,
  orangeScore: f,
  timeLeft: r,
  isOvertime: s,
  matchState: y,
  gameMode: m,
  botDifficulty: g,
  physicsMode: pMode = "rocket_league",
  currentMap = "standard",
  isPaused: p,
  onTogglePause: A,
  onOpenSettings: C,
  onResetMatch: z,
  isFullscreen: isFull,
  onToggleFullscreen: toggleFull,
  onOpenControls: openControls,
  onOpenReplayStudio: openStudio,
  autoCam = true,
  onToggleAutoCam,
  steeringControl = "keyboard",
  onToggleSteeringControl,
  onOpenScoreboard,
  onOpenMatchHistory,
  isMultiplayerActive = false,
  multiplayerRoomCode = null,
  multiplayerPing = 0,
  onOpenMultiplayer,
  onLeaveMultiplayer,
  onOpenQuickMenu,
  isMobileDevice = false,
  onOpenGarage,
  onOpenCrates,
  onOpenRanked,
  onOpenMatchSetup,
  unopenedCratesCount = 0,
  coinsCount = 1500,
  currentRankLabel = "Ranked",
  currentMmr = 600
}: any) => {
  const N = Math.floor(Math.max(0, r) / 60);
  const D = Math.floor(Math.max(0, r) % 60);
  const X = `${N}:${D < 10 ? "0" : ""}${D}`;

  const difficultyBadges: Record<string, { text: string; color: string }> = {
    rookie: { text: "Rookie", color: "text-emerald-400 border-emerald-500/50 bg-emerald-950/80" },
    pro: { text: "Pro", color: "text-amber-400 border-amber-500/50 bg-amber-950/80" },
    allstar: { text: "All-Star", color: "text-purple-400 border-purple-500/50 bg-purple-950/80" },
    ssl: { text: "🔥 SSL", color: "text-rose-400 border-rose-500/60 bg-rose-950/90 font-black" },
    unfair: { text: "💀 Unfair", color: "text-red-400 border-red-500/80 bg-red-950/90 font-black" }
  };

  const modeLabels: Record<string, string> = {
    "1v1": "1 vs 1",
    "2v2": "2 vs 2",
    "3v3": "3 vs 3",
    training: "Free Play",
    bot_vs_bot: "1v1 Spectator",
    spectator_2v2: "2v2 Spectator",
    spectator_3v3: "3v3 Spectator"
  };

  const mapDef = MAP_DEFINITIONS[currentMap] || MAP_DEFINITIONS.standard;
  const isReplay = y === "goal_replay" || y === "replay";

  return d.jsx("div", {
    className: "absolute top-2 left-0 right-0 z-20 flex flex-col items-center pointer-events-none px-2 sm:px-4 select-none",
    children: d.jsxs("div", {
      className: "flex items-center justify-between w-full max-w-[98vw] pointer-events-auto gap-1.5 sm:gap-2",
      children: [
        // Left: Game Mode & Arena badges (Hidden during replay to eliminate HUD overlapping)
        !isReplay ? (
          d.jsxs("div", {
            className: "flex items-center gap-1.5 flex-1 min-w-0 justify-start overflow-hidden",
            children: [
            onOpenMatchSetup ? (
              d.jsxs("button", {
                onClick: onOpenMatchSetup,
                className: "flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl shadow-lg text-[11px] sm:text-xs font-gaming font-bold text-slate-200 transition cursor-pointer shrink-0 active:scale-95",
                title: "Match Setup / Select Pilot Mode: Human, Place Bot, or Just Bots",
                children: [
                  d.jsx(Hg, { className: "w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-400" }),
                  d.jsx("span", { children: modeLabels[m] || m })
                ]
              })
            ) : (
              d.jsxs("div", {
                className: "flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-700/80 shadow-lg text-[11px] sm:text-xs font-gaming font-bold text-slate-200 shrink-0",
                children: [
                  d.jsx(Is, { className: "w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" }),
                  d.jsx("span", { children: modeLabels[m] || m })
                ]
              })
            ),
            onOpenRanked && d.jsxs("button", {
              onClick: onOpenRanked,
              className: "flex items-center gap-1 px-2 py-1 sm:py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 border border-amber-500/50 text-amber-300 font-gaming font-bold text-[10px] sm:text-[11px] shadow-lg transition cursor-pointer shrink-0 active:scale-95",
              title: "Competitive Ranked Play, MMR & Divisions",
              children: [
                d.jsx(Is, { className: "w-3 h-3 text-amber-400" }),
                d.jsx("span", { className: "hidden md:inline", children: currentRankLabel }),
                d.jsxs("span", { className: "font-mono font-black text-[9px] px-1 py-0.2 rounded bg-black/40 text-amber-300", children: [currentMmr, " MMR"] })
              ]
            }),
            d.jsxs("button", {
              onClick: C,
              className: `px-2 py-1 sm:py-1.5 rounded-xl border text-[10px] sm:text-[11px] font-gaming font-bold flex items-center gap-1 sm:gap-1.5 backdrop-blur-md shadow-lg transition cursor-pointer hover:brightness-125 shrink-0 ${mapDef.badgeColor}`,
              title: `Current Arena: ${mapDef.name} (${mapDef.Kt}×${mapDef.hl}) - Click to Change Arena`,
              children: [
                d.jsx(Layers, { className: "w-3 h-3 sm:w-3.5 sm:h-3.5" }),
                d.jsx("span", { children: mapDef.shortName })
              ]
            }),
            !isMobileDevice && m !== "training" && difficultyBadges[g] &&
              d.jsx("div", {
                className: `px-2.5 py-1.5 rounded-xl border text-xs font-gaming flex items-center gap-1 backdrop-blur-md shadow-lg shrink-0 ${difficultyBadges[g].color}`,
                children: d.jsx("span", { children: difficultyBadges[g].text })
              }),
            !isMobileDevice && d.jsxs("div", {
              className: `hidden lg:flex px-2 py-1.5 rounded-xl border text-[11px] font-gaming font-bold items-center gap-1.5 backdrop-blur-md shadow-lg shrink-0 ${
                pMode === "legacy" ? "text-amber-400 border-amber-500/50 bg-amber-950/80" : "text-sky-400 border-sky-500/50 bg-sky-950/80"
              }`,
              children: [
                d.jsx(Ru, { className: "w-3 h-3" }),
                d.jsx("span", { children: pMode === "legacy" ? "Arcade" : "RL Pro" })
              ]
            })
          ]
        })
      ) : (
        d.jsx("div", { className: "flex-1 min-w-0 pointer-events-none" })
      ),

        // Center: Tournament Scoreboard Pod (Unobstructed & Always Centered)
        d.jsx("div", {
          className: "flex items-center justify-center shrink-0 mx-1 sm:mx-2",
          children: d.jsxs("div", {
            onClick: onOpenScoreboard,
            title: "Click to View Scoreboard (Tab)",
            className: "flex items-center shadow-2xl rounded-xl sm:rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950/90 backdrop-blur-md cursor-pointer hover:border-sky-400/80 transition active:scale-95",
            children: [
              // Blue Score Pod
              d.jsx("div", {
                className: "flex items-center justify-center px-3.5 sm:px-6 py-1 sm:py-2 bg-gradient-to-r from-sky-600 to-sky-700 text-white min-w-[48px] sm:min-w-[76px] shadow-inner",
                children: d.jsx("span", {
                  className: "text-lg sm:text-3xl md:text-4xl font-gaming font-black tracking-tight drop-shadow-md",
                  children: u
                })
              }),

              // Center Clock Pod
              d.jsx("div", {
                className: "px-3 sm:px-6 py-1 sm:py-2 flex flex-col items-center justify-center min-w-[72px] sm:min-w-[110px] bg-slate-900/95 border-x border-slate-800",
                children: s
                  ? d.jsxs("div", {
                      className: "flex flex-col items-center",
                      children: [
                        d.jsx("span", {
                          className: "text-[9px] sm:text-[10px] font-gaming font-black uppercase tracking-widest text-amber-400 animate-pulse",
                          children: "OVERTIME"
                        }),
                        d.jsxs("span", {
                          className: "text-sm sm:text-lg font-gaming font-black text-amber-300",
                          children: ["+", X]
                        })
                      ]
                    })
                  : m === "training"
                  ? d.jsx("span", {
                      className: "text-[10px] sm:text-xs font-gaming font-black text-slate-300 tracking-widest",
                      children: "FREE PLAY"
                    })
                  : d.jsx("span", {
                      className: "text-base sm:text-2xl font-gaming font-black text-white tracking-widest",
                      children: X
                    })
              }),

              // Orange Score Pod
              d.jsx("div", {
                className: "flex items-center justify-center px-3.5 sm:px-6 py-1 sm:py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white min-w-[48px] sm:min-w-[76px] shadow-inner",
                children: d.jsx("span", {
                  className: "text-lg sm:text-3xl md:text-4xl font-gaming font-black tracking-tight drop-shadow-md",
                  children: f
                })
              })
            ]
          })
        }),

        // Right: Control Icons / Mobile Quick Menu (Hidden during replay)
        !isReplay ? (
          d.jsxs("div", {
            className: "flex items-center gap-1.5 flex-1 min-w-0 justify-end",
            children: [
            !isMobileDevice && d.jsxs("button", {
              onClick: onOpenGarage,
              className: "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs shadow-lg transition cursor-pointer active:scale-95 shrink-0",
              title: "Your Gold Coins balance (Click to open Garage)",
              children: [
                d.jsx(Coins, { className: "w-3.5 h-3.5 text-amber-400" }),
                d.jsx("span", { children: `${(coinsCount ?? 1500).toLocaleString()} 🪙` })
              ]
            }),
            onOpenGarage && d.jsxs("button", {
              onClick: onOpenGarage,
              className: "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600/30 to-blue-600/30 hover:from-sky-600/50 hover:to-blue-600/50 border border-sky-500/50 hover:border-sky-400/80 text-white font-gaming font-bold text-xs shadow-lg transition cursor-pointer active:scale-95 shrink-0",
              title: "Open Garage: Customize Cars, Decals, Wheels, Toppers & Upgrades",
              children: [
                d.jsx(Car, { className: "w-3.5 h-3.5 text-sky-400" }),
                d.jsx("span", { className: "hidden sm:inline", children: "Garage" })
              ]
            }),
            onOpenCrates && d.jsxs("button", {
              onClick: onOpenCrates,
              className: "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/50 hover:to-indigo-600/50 border border-purple-500/50 hover:border-purple-400/80 text-white font-gaming font-bold text-xs shadow-lg transition cursor-pointer active:scale-95 shrink-0 relative",
              title: "Crate Unboxing: Spin Cases for Exotic Cars & Black Market Items",
              children: [
                d.jsx(Box, { className: "w-3.5 h-3.5 text-purple-400" }),
                d.jsx("span", { className: "hidden sm:inline", children: "Crates" }),
                unopenedCratesCount > 0 && d.jsx("span", {
                  className: "px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black text-[9px]",
                  children: unopenedCratesCount
                })
              ]
            }),
            isMultiplayerActive ? (
              d.jsxs("div", {
                className: "flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-900/95 border border-emerald-500/60 shadow-lg text-xs font-gaming shrink-0",
                children: [
                  d.jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-400 animate-pulse" }),
                  d.jsxs("button", {
                    onClick: onOpenMultiplayer,
                    className: "font-mono font-black text-amber-400 hover:underline cursor-pointer flex items-center gap-1",
                    title: "Room Code (Click to open lobby)",
                    children: [
                      d.jsx("span", { children: multiplayerRoomCode || "ROOM" })
                    ]
                  }),
                  multiplayerPing > 0 && (
                    d.jsx("span", { className: "font-mono text-[10px] text-emerald-300", children: `${multiplayerPing}ms` })
                  ),
                  d.jsx("button", {
                    onClick: onLeaveMultiplayer,
                    className: "p-1 rounded hover:bg-rose-950/60 text-rose-400 hover:text-rose-300 transition cursor-pointer ml-1",
                    title: "Disconnect & Leave Room",
                    children: d.jsx(LogOut, { className: "w-3 h-3" })
                  })
                ]
              })
            ) : (
              onOpenMultiplayer && d.jsxs("button", {
                onClick: onOpenMultiplayer,
                className: "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600/30 to-emerald-600/30 hover:from-sky-600/50 hover:to-emerald-600/50 border border-sky-500/50 hover:border-emerald-400/80 text-white font-gaming font-bold text-xs shadow-lg transition cursor-pointer active:scale-95 shrink-0",
                title: "Play Online Multiplayer",
                children: [
                  d.jsx(Globe, { className: "w-3.5 h-3.5 text-sky-400" }),
                  d.jsx("span", { className: "hidden sm:inline", children: "Multiplayer" })
                ]
              })
            ),
            (isMobileDevice && onOpenQuickMenu) ? (
              d.jsxs("div", {
                className: "flex items-center gap-1.5",
                children: [
                  onToggleAutoCam && d.jsxs("button", {
                    onClick: onToggleAutoCam,
                    className: `flex items-center gap-1 px-2 py-1.5 rounded-xl border text-[11px] font-gaming font-bold backdrop-blur-md shadow-lg transition active:scale-95 cursor-pointer shrink-0 ${
                      autoCam
                        ? "text-purple-300 border-purple-400/70 bg-purple-950/80 shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                        : "text-slate-400 border-slate-700/60 bg-slate-900/80 hover:text-slate-200"
                    }`,
                    title: autoCam ? "Auto Dynamic Camera: ON (Tap to switch to Fixed view)" : "Fixed Camera: ON (Tap to switch to Auto Tracking Cam)",
                    children: [
                      d.jsx(Camera, { className: "w-3.5 h-3.5 text-purple-400" }),
                      d.jsx("span", { children: autoCam ? "Cam: Auto" : "Cam: Fixed" })
                    ]
                  }),
                  d.jsxs("button", {
                    onClick: onOpenQuickMenu,
                    className: "flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900/95 border border-sky-500/60 hover:bg-slate-800 text-sky-400 font-gaming font-bold text-xs shadow-lg transition active:scale-95 shrink-0 cursor-pointer",
                    title: "Open Mobile Menu",
                    children: [
                      d.jsx(Menu, { className: "w-4 h-4 text-sky-400" }),
                      d.jsx("span", { className: "text-white text-[11px]", children: "Menu" })
                    ]
                  })
                ]
              })
            ) : (
              onOpenQuickMenu && d.jsxs("button", {
                onClick: onOpenQuickMenu,
                className: "md:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/95 border border-sky-500/50 hover:bg-slate-800 text-sky-400 font-gaming font-bold text-xs shadow-lg transition active:scale-95 shrink-0 cursor-pointer",
                title: "Open Mobile Quick Menu",
                children: [
                  d.jsx(Menu, { className: "w-4 h-4 text-sky-400" }),
                  d.jsx("span", { className: "text-white text-[11px]", children: "Menu" })
                ]
              })
            ),
            !isMobileDevice && onOpenMatchHistory && d.jsx("button", {
              onClick: onOpenMatchHistory,
              className: "hidden md:flex p-2 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-sky-400 hover:text-sky-300 border border-slate-700/70 shadow-lg transition cursor-pointer shrink-0",
              title: "Match History & Replays",
              children: d.jsx(Clock, { className: "w-4 h-4 text-sky-400" })
            }),
            !isMobileDevice && openStudio && d.jsx("button", {
              onClick: openStudio,
              className: "hidden md:flex p-2 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border border-slate-700/70 shadow-lg transition cursor-pointer shrink-0",
              title: "Open Replay & Clip Studio (Key V)",
              children: d.jsx(Film, { className: "w-4 h-4 text-amber-400" })
            }),
            !isMobileDevice && onToggleAutoCam && d.jsxs("button", {
              onClick: onToggleAutoCam,
              className: `hidden lg:flex items-center gap-1 px-2 py-1.5 rounded-xl border text-xs font-gaming font-bold backdrop-blur-md shadow-lg transition cursor-pointer shrink-0 ${
                autoCam
                  ? "text-purple-300 border-purple-400/60 bg-purple-950/80 shadow-purple-500/20 hover:brightness-125"
                  : "text-slate-400 border-slate-700/60 bg-slate-900/80 hover:text-slate-200"
              }`,
              title: autoCam ? "Auto Dynamic Camera: ON (Press C for Fixed Pitch)" : "Auto Dynamic Camera: OFF (Press C for Auto Cam)",
              children: [
                d.jsx(Camera, { className: "w-3.5 h-3.5" }),
                d.jsx("span", { className: "hidden xl:inline", children: autoCam ? "Auto" : "Fixed" }),
                d.jsx("kbd", { className: "px-1 py-0.2 text-[9px] bg-black/40 border border-white/20 rounded font-mono", children: "C" })
              ]
            }),
            !isMobileDevice && onToggleSteeringControl && d.jsxs("button", {
              onClick: onToggleSteeringControl,
              className: `hidden lg:flex items-center gap-1 px-2 py-1.5 rounded-xl border text-xs font-gaming font-bold backdrop-blur-md shadow-lg transition cursor-pointer shrink-0 ${
                steeringControl === "mouse"
                  ? "text-emerald-300 border-emerald-400/60 bg-emerald-950/80 shadow-emerald-500/20 hover:brightness-125"
                  : "text-slate-400 border-slate-700/60 bg-slate-900/80 hover:text-slate-200"
              }`,
              title: steeringControl === "mouse" ? "Car Control: Mouse Aim (Press M for Keyboard)" : "Car Control: Keyboard (Press M for Mouse Aim)",
              children: [
                d.jsx(Crosshair, { className: "w-3.5 h-3.5" }),
                d.jsx("span", { className: "hidden xl:inline", children: steeringControl === "mouse" ? "Mouse" : "Keys" }),
                d.jsx("kbd", { className: "px-1 py-0.2 text-[9px] bg-black/40 border border-white/20 rounded font-mono", children: "M" })
              ]
            }),
            !isMobileDevice && d.jsx("button", {
              onClick: toggleFull,
              className: "hidden sm:flex p-2 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/70 shadow-lg transition cursor-pointer shrink-0",
              title: isFull ? "Exit Fullscreen (F)" : "Fullscreen (F)",
              children: isFull ? d.jsx(Minimize, { className: "w-4 h-4" }) : d.jsx(Maximize, { className: "w-4 h-4" })
            }),
            d.jsx("button", {
              onClick: A,
              className: "p-2 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/70 shadow-lg transition cursor-pointer shrink-0",
              title: p ? "Resume (P)" : "Pause (P)",
              children: p ? d.jsx(Hg, { className: "w-4 h-4" }) : d.jsx(wg, { className: "w-4 h-4" })
            }),
            !isMobileDevice && d.jsx("button", {
              onClick: z,
              className: "hidden md:flex p-2 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/70 shadow-lg transition cursor-pointer shrink-0",
              title: "Restart Match (R)",
              children: d.jsx(im, { className: "w-4 h-4" })
            }),
            !isMobileDevice && d.jsx("button", {
              onClick: C,
              className: "hidden md:flex p-2 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/70 shadow-lg transition cursor-pointer shrink-0",
              title: "Match Settings",
              children: d.jsx(cm, { className: "w-4 h-4" })
            }),
            !isMobileDevice && d.jsxs("button", {
              onClick: openControls,
              className: "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-gaming font-bold text-xs shadow-lg border border-sky-400/40 transition cursor-pointer active:scale-95 shrink-0",
              title: "Controls & Mechanics Guide",
              children: [
                d.jsx(Ng, { className: "w-4 h-4" }),
                d.jsx("span", { className: "hidden md:inline", children: "Controls" })
              ]
            })
          ]
        })
      ) : (
        d.jsx("div", { className: "flex-1 min-w-0 pointer-events-none" })
      )
      ]
    })
  });
};

const n2 = ({ playerCar: u }: any) => {
  if (!u) return null;
  const boostVal = Math.round(Math.max(0, Math.min(100, u.boost)));
  const speedKmh = Math.round((Math.hypot(u.vx, u.vy) / 10) * 1.6);
  const isSupersonic = u.isSupersonic;
  const hasFlip = u.jumpCount < 2 && (u.isGrounded ? true : u.flipWindowTimer < 1.35 || u.jumpCount === 0);

  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const arcLength = circ * 0.75;
  const strokeOffset = arcLength - (boostVal / 100) * arcLength;

  return d.jsxs("div", {
    className: "absolute bottom-6 right-6 z-20 flex flex-col items-end pointer-events-none select-none",
    children: [
      d.jsxs("div", {
        className: "relative w-40 h-40 flex items-center justify-center",
        children: [
          // Circular dial track
          d.jsxs("svg", {
            className: "w-full h-full transform rotate-[135deg]",
            viewBox: "0 0 140 140",
            children: [
              d.jsx("circle", {
                cx: "70",
                cy: "70",
                r: radius,
                fill: "transparent",
                stroke: "rgba(15, 23, 42, 0.8)",
                strokeWidth: "12",
                strokeDasharray: `${arcLength} ${circ}`,
                strokeLinecap: "round"
              }),
              d.jsx("circle", {
                cx: "70",
                cy: "70",
                r: radius,
                fill: "transparent",
                stroke: boostVal > 25 ? "url(#boostGradientRef)" : "#ef4444",
                strokeWidth: "12",
                strokeDasharray: `${arcLength} ${circ}`,
                strokeDashoffset: strokeOffset,
                strokeLinecap: "round",
                className: "transition-all duration-75"
              }),
              d.jsx("defs", {
                children: d.jsxs("linearGradient", {
                  id: "boostGradientRef",
                  x1: "0%",
                  y1: "0%",
                  x2: "100%",
                  y2: "100%",
                  children: [
                    d.jsx("stop", { offset: "0%", stopColor: "#f59e0b" }),
                    d.jsx("stop", { offset: "70%", stopColor: "#f97316" }),
                    d.jsx("stop", { offset: "100%", stopColor: "#ef4444" })
                  ]
                })
              })
            ]
          }),

          // Center Boost Reading (1:1 with reference image: +33 BOOST)
          d.jsxs("div", {
            className: "absolute flex flex-col items-center justify-center text-center",
            children: [
              d.jsxs("div", {
                className: "flex items-center text-amber-400 -mt-1",
                children: [
                  d.jsx(Ru, { className: "w-4 h-4 fill-amber-400 mr-0.5" }),
                  d.jsxs("span", {
                    className: "text-4xl font-gaming font-black tracking-tight text-white drop-shadow-md",
                    children: [boostVal > 0 ? "+" : "", boostVal]
                  })
                ]
              }),
              d.jsx("span", {
                className: "text-[10px] font-gaming font-black uppercase tracking-widest text-slate-300",
                children: "BOOST"
              })
            ]
          })
        ]
      }),

      // Speedometer badge, Car Model & Flight status pill
      d.jsxs("div", {
        className: "mt-1 flex items-center gap-1.5 flex-wrap justify-end",
        children: [
          d.jsxs("div", {
            className: "px-2.5 py-1 bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-700/80 text-[11px] font-gaming font-bold text-sky-300 flex items-center gap-1 shadow",
            title: `Hitbox: ${u.hitboxClass || "Octane"} (${u.width}x${u.height}px)`,
            children: [
              d.jsx(Car, { className: "w-3 h-3 text-sky-400" }),
              d.jsx("span", { children: CAR_DEFINITIONS[u.carModel || "octane"]?.shortName || "Octane" }),
              d.jsx("span", { className: "text-slate-600", children: "•" }),
              d.jsx("span", { className: "text-slate-400 font-mono text-[10px]", children: `${u.width}×${u.height}` })
            ]
          }),
          d.jsxs("div", {
            className: "px-2.5 py-1 bg-amber-950/80 backdrop-blur-md rounded-lg border border-amber-500/50 text-xs font-gaming font-black text-amber-300 flex items-center gap-1.5 shadow",
            title: "Player Match Score",
            children: [
              d.jsx(Trophy, { className: "w-3.5 h-3.5 text-amber-400" }),
              d.jsxs("span", { children: [Math.round(u.score || 0), " PTS"] })
            ]
          }),
          d.jsxs("div", {
            className: "px-2.5 py-1 bg-slate-950/90 backdrop-blur-md rounded-lg border border-slate-700/80 text-xs font-mono font-bold text-slate-200 shadow",
            children: [speedKmh, " KM/H"]
          }),
          d.jsx("div", {
            className: `px-2.5 py-1 rounded-lg text-xs font-gaming font-black tracking-wider border transition ${
              u.hasFlipReset
                ? "bg-amber-500 text-slate-950 border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.6)] animate-pulse"
                : isSupersonic
                ? "bg-gradient-to-r from-orange-600 to-rose-600 text-white border-amber-400 shadow-[0_0_20px_rgba(249,115,22,0.6)] animate-pulse"
                : u.isGrounded
                ? "bg-emerald-600/90 text-white border-emerald-400/50 shadow"
                : hasFlip
                ? "bg-sky-600/90 text-white border-sky-400/50 shadow"
                : "bg-slate-800/80 text-slate-400 border-slate-700"
            }`,
            children: u.hasFlipReset
              ? "✨ RESET READY"
              : isSupersonic
              ? "⚡ SUPERSONIC"
              : u.isGrounded
              ? "GROUNDED"
              : hasFlip
              ? "FLIP READY"
              : "AIRBORNE"
          })
        ]
      })
    ]
  });
};

const u2 = ({ messages: u, onSendMessage: f, isReplay = false }: any) => {
  const [isOpen, setIsOpen] = st.useState(false);
  const [isChatHidden, setIsChatHidden] = st.useState(() => {
    try {
      return localStorage.getItem("rl2d_chat_hidden") === "true";
    } catch {
      return false;
    }
  });

  const toggleHideChat = () => {
    setIsChatHidden((prev: boolean) => {
      const next = !prev;
      try {
        localStorage.setItem("rl2d_chat_hidden", String(next));
      } catch {}
      return next;
    });
  };

  const quickChatOptions = [
    {
      label: "Reactions",
      items: ["What a save!", "Nice shot!", "Calculated.", "Savage!"]
    },
    {
      label: "Team",
      items: ["Defending...", "Take the shot!", "Need boost!", "Great pass!"]
    },
    {
      label: "Compliments",
      items: ["Thanks!", "No problem.", "OMG!", "Close one!"]
    }
  ];

  st.useEffect(() => {
    const handleKey = (p: any) => {
      if ((p.key === "t" || p.key === "T" || p.key === "c" || p.key === "C") && p.target.tagName !== "INPUT") {
        setIsOpen(prev => !prev);
      }
      if (p.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const sendAndClose = (msg: string) => {
    f(msg);
    setIsOpen(false);
  };

  return d.jsxs("div", {
    className: `absolute ${isReplay ? "top-16 sm:top-20 opacity-70" : "top-12 sm:top-16"} left-2.5 sm:left-5 z-30 flex flex-col gap-1 sm:gap-2 pointer-events-none select-none transition-all`,
    children: [
      // Recent killfeed / chat notification items (hidden if isChatHidden)
      !isChatHidden && d.jsx("div", {
        className: "flex flex-col gap-1 max-w-[210px] sm:max-w-sm",
        children: u.slice(-3).map((g: any) => {
          const isBlue = g.team === "blue";
          return d.jsxs("div", {
            className: "flex items-center gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-[10px] sm:text-xs shadow-md animate-fade-in font-gaming leading-tight",
            children: [
              d.jsx("span", { className: "text-slate-400 text-[10px] sm:text-xs", children: "☠️" }),
              d.jsxs("span", {
                className: `font-bold truncate max-w-[70px] sm:max-w-[100px] ${isBlue ? "text-sky-400" : "text-orange-400"}`,
                children: [g.sender, ":"]
              }),
              d.jsx("span", {
                className: "text-slate-100 font-medium truncate max-w-[110px] sm:max-w-[180px]",
                children: g.text
              })
            ]
          }, g.id);
        })
      }),

      // Chat Toggle Button / Popover
      d.jsx("div", {
        className: "pointer-events-auto mt-0.5 sm:mt-1",
        children: isOpen
          ? d.jsxs("div", {
              className: "bg-slate-950/95 backdrop-blur-md border border-slate-700 rounded-2xl p-3 sm:p-4 shadow-2xl w-64 sm:w-72 text-slate-100 animate-fade-in",
              children: [
                d.jsxs("div", {
                  className: "flex items-center justify-between pb-2 border-b border-slate-800 mb-2.5",
                  children: [
                    d.jsxs("div", {
                      className: "flex items-center gap-2",
                      children: [
                        d.jsx("span", {
                          className: "text-xs font-gaming font-black text-slate-200 uppercase tracking-wider",
                          children: "Quick Chat"
                        }),
                        d.jsx("button", {
                          onClick: toggleHideChat,
                          className: `px-1.5 py-0.5 rounded text-[9px] font-bold uppercase transition cursor-pointer border ${
                            isChatHidden
                              ? "bg-rose-950/70 border-rose-600/70 text-rose-300"
                              : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
                          }`,
                          title: isChatHidden ? "Chat messages are hidden. Tap to unhide." : "Hide chat messages from screen",
                          children: isChatHidden ? "Muted" : "Mute"
                        })
                      ]
                    }),
                    d.jsx("button", {
                      onClick: () => setIsOpen(false),
                      className: "text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-slate-800 transition cursor-pointer",
                      children: "✕"
                    })
                  ]
                }),
                d.jsx("div", {
                  className: "space-y-2.5 sm:space-y-3",
                  children: quickChatOptions.map(cat =>
                    d.jsxs("div", {
                      children: [
                        d.jsx("div", {
                          className: "text-[9px] sm:text-[10px] font-gaming font-bold text-slate-400 uppercase tracking-wider mb-1 sm:mb-1.5",
                          children: cat.label
                        }),
                        d.jsx("div", {
                          className: "grid grid-cols-2 gap-1 sm:gap-1.5",
                          children: cat.items.map(msg =>
                            d.jsx("button", {
                              onClick: () => sendAndClose(msg),
                              className: "text-left px-2 sm:px-2.5 py-1 sm:py-1.5 bg-slate-900 hover:bg-sky-600 hover:text-white text-slate-200 text-[10px] sm:text-xs rounded-lg transition truncate border border-slate-800/80 cursor-pointer font-gaming font-semibold",
                              children: msg
                            }, msg)
                          )
                        })
                      ]
                    }, cat.label)
                  )
                })
              ]
            })
          : d.jsxs("div", {
              className: "flex items-center gap-1",
              children: [
                d.jsxs("button", {
                  onClick: () => setIsOpen(true),
                  className: "flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg sm:rounded-xl border border-slate-700/70 text-[11px] sm:text-xs font-gaming font-bold transition shadow-lg cursor-pointer",
                  title: "Quick Chat (Hotkey T)",
                  children: [
                    d.jsx(jg, { className: "w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-400" }),
                    d.jsx("span", { children: "Chat" })
                  ]
                }),
                d.jsx("button", {
                  onClick: toggleHideChat,
                  className: `px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl border text-[10px] sm:text-[11px] font-gaming font-bold transition shadow-lg cursor-pointer flex items-center gap-1 ${
                    isChatHidden
                      ? "bg-rose-950/85 hover:bg-rose-900 border-rose-700/80 text-rose-300"
                      : "bg-slate-950/80 hover:bg-slate-800 border-slate-700/70 text-slate-400 hover:text-slate-200"
                  }`,
                  title: isChatHidden ? "Chat messages are hidden. Tap to show." : "Hide chat messages",
                  children: isChatHidden ? "🔇 Chat Off" : "👁️ Hide"
                })
              ]
            })
      })
    ]
  });
};

const i2 = (_props: any) => null;

// Skill / Mechanic Alert Banners (Removed from top-right per user request)
const v2 = ({ alerts }: { alerts: any[] }) => null;


const c2 = ({
  onResetBall: u,
  onDribbleSetup: s,
  onPassToMe: f,
  onHighAerialSetup: r,
  onMustySetup: musty,
  onFlipResetSetup: reset,
  onPinchSetup: pinch,
  onDoubleTapSetup: dbl,
  onPsychoSetup: psycho,
  onCeilingSetup: ceiling,
  infiniteBoost: y,
  onToggleInfiniteBoost: m,
  showHitbox: hb,
  onToggleHitbox: onHb,
  onOpenReplayStudio: openStudio
}: any) =>
  d.jsxs("div", {
    className: "absolute bottom-6 left-6 z-20 flex flex-wrap items-center gap-2 pointer-events-auto bg-slate-950/90 backdrop-blur-md p-2 rounded-2xl border border-slate-800 shadow-2xl select-none",
    children: [
      d.jsxs("span", {
        className: "text-xs font-gaming font-black text-amber-400 uppercase tracking-wider px-2 flex items-center gap-1",
        children: [d.jsx(om, { className: "w-3.5 h-3.5" }), "Free Play"]
      }),
      openStudio && d.jsxs("button", {
        onClick: openStudio,
        className: "px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 text-amber-300 text-xs font-gaming font-bold rounded-xl border border-amber-500/50 flex items-center gap-1.5 transition cursor-pointer shadow-md",
        title: "Open Replay & Clip Studio (Key V)",
        children: [d.jsx(Film, { className: "w-3.5 h-3.5 text-amber-400" }), d.jsx("span", { children: "Replay Studio [V]" })]
      }),
      d.jsxs("button", {
        onClick: u,
        className: "px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-gaming font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition cursor-pointer",
        title: "Reset ball to center (Key 1)",
        children: [d.jsx(Bg, { className: "w-3.5 h-3.5" }), d.jsx("span", { children: "Reset [1]" })]
      }),
      d.jsxs("button", {
        onClick: s,
        className: "px-2.5 py-1.5 bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-gaming font-bold rounded-xl border border-emerald-400/40 flex items-center gap-1.5 transition cursor-pointer",
        title: "Place ball on roof for dribbling & flicks (Key 2)",
        children: [d.jsx(Qg, { className: "w-3.5 h-3.5" }), d.jsx("span", { children: "Dribble [2]" })]
      }),
      d.jsxs("button", {
        onClick: f,
        className: "px-2.5 py-1.5 bg-sky-600/90 hover:bg-sky-500 text-white text-xs font-gaming font-bold rounded-xl border border-sky-400/40 flex items-center gap-1.5 transition cursor-pointer",
        title: "High pass in front of car (Key 3)",
        children: [d.jsx(Xg, { className: "w-3.5 h-3.5" }), d.jsx("span", { children: "Pass [3]" })]
      }),
      d.jsxs("button", {
        onClick: r,
        className: "px-2.5 py-1.5 bg-purple-600/90 hover:bg-purple-500 text-white text-xs font-gaming font-bold rounded-xl border border-purple-400/40 flex items-center gap-1.5 transition cursor-pointer",
        title: "High aerial bounce off wall (Key 4)",
        children: [d.jsx(Rg, { className: "w-3.5 h-3.5" }), d.jsx("span", { children: "Aerial [4]" })]
      }),
      d.jsxs("button", {
        onClick: musty,
        className: "px-2.5 py-1.5 bg-purple-600/90 hover:bg-purple-500 text-white text-xs font-gaming font-bold rounded-xl border border-purple-400/40 flex items-center gap-1.5 transition cursor-pointer",
        title: "Musty flick air setup (Key 5)",
        children: [d.jsx(sm, { className: "w-3.5 h-3.5" }), d.jsx("span", { children: "Musty [5]" })]
      }),
      d.jsxs("button", {
        onClick: reset,
        className: "px-2.5 py-1.5 bg-amber-600/90 hover:bg-amber-500 text-white text-xs font-gaming font-bold rounded-xl border border-amber-400/40 flex items-center gap-1.5 transition cursor-pointer",
        title: "High lob for flip reset (Key 6)",
        children: [d.jsx(om, { className: "w-3.5 h-3.5" }), d.jsx("span", { children: "Reset [6]" })]
      }),
      d.jsxs("button", {
        onClick: pinch,
        className: "px-2.5 py-1.5 bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-gaming font-bold rounded-xl border border-rose-400/40 flex items-center gap-1.5 transition cursor-pointer",
        title: "Kuxir pinch wall setup (Key 7)",
        children: [d.jsx(sm, { className: "w-3.5 h-3.5" }), d.jsx("span", { children: "Pinch [7]" })]
      }),
      d.jsxs("button", {
        onClick: dbl,
        className: "px-2.5 py-1.5 bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-gaming font-bold rounded-xl border border-emerald-400/40 flex items-center gap-1.5 transition cursor-pointer",
        title: "Backboard double tap setup (Key 8)",
        children: [d.jsx(Qg, { className: "w-3.5 h-3.5" }), d.jsx("span", { children: "Double Tap [8]" })]
      }),
      d.jsxs("button", {
        onClick: psycho,
        className: "px-2.5 py-1.5 bg-red-600/90 hover:bg-red-500 text-white text-xs font-gaming font-bold rounded-xl border border-red-400/40 flex items-center gap-1.5 transition cursor-pointer",
        title: "Psycho redirect setup (Key 9)",
        children: [d.jsx(Xg, { className: "w-3.5 h-3.5" }), d.jsx("span", { children: "Psycho [9]" })]
      }),
      d.jsxs("button", {
        onClick: ceiling,
        className: "px-2.5 py-1.5 bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-gaming font-bold rounded-xl border border-indigo-400/40 flex items-center gap-1.5 transition cursor-pointer",
        title: "Ceiling shot drop setup (Key 0)",
        children: [d.jsx(bg, { className: "w-3.5 h-3.5" }), d.jsx("span", { children: "Ceiling [0]" })]
      }),
      d.jsxs("button", {
        onClick: m,
        className: `px-2.5 py-1.5 text-xs font-gaming font-black rounded-xl border flex items-center gap-1.5 transition cursor-pointer ${
          y ? "bg-amber-500 text-slate-950 border-amber-300" : "bg-slate-900 text-slate-400 border-slate-700"
        }`,
        title: "Infinite Boost Toggle",
        children: [d.jsx(Ru, { className: "w-3.5 h-3.5 fill-current" }), d.jsx("span", { children: y ? "Boost: ∞" : "Boost: 100" })]
      }),
      d.jsxs("button", {
        onClick: onHb,
        className: `px-2.5 py-1.5 text-xs font-gaming font-black rounded-xl border flex items-center gap-1.5 transition cursor-pointer ${
          hb ? "bg-amber-500/20 text-amber-300 border-amber-400/60 shadow" : "bg-slate-900 text-slate-400 border-slate-700"
        }`,
        title: "Toggle Hitbox Overlay (Key H)",
        children: [d.jsx(Box, { className: "w-3.5 h-3.5" }), d.jsx("span", { children: hb ? "Hitbox: ON [H]" : "Hitbox [H]" })]
      })
    ]
  });

const f2 = ({ isOpen: u, settings: f, onUpdateSettings: r, onClose: s, onApplyAndRestart: y }: any) => {
  if (!u) return null;

  const difficulties = [
    {
      id: "rookie",
      name: "Rookie",
      badge: "Easy",
      description: "Slow reaction, stays grounded, avoids aerials, light sparring partner.",
      features: ["Ground driving", "No double jumps", "Relaxed pace"],
      color: "text-emerald-400",
      border: "border-emerald-500/40",
      bg: "bg-emerald-500/10"
    },
    {
      id: "pro",
      name: "Pro",
      badge: "Medium",
      description: "Actively tracks the ball, uses single jumps and boost, rotates back to net.",
      features: ["Basic jumps", "Goal line defense", "Direct boost paths"],
      color: "text-amber-400",
      border: "border-amber-500/40",
      bg: "bg-amber-500/10"
    },
    {
      id: "allstar",
      name: "All-Star",
      badge: "Hard",
      description: "Interprets aerial trajectories, double jumps, controls 100 boost pads, strikes with flips.",
      features: ["Double jumps", "Goal saves", "100 boost control", "Power flips"],
      color: "text-purple-400",
      border: "border-purple-500/40",
      bg: "bg-purple-500/10"
    },
    {
      id: "ssl",
      name: "🔥 SSL Terminator",
      badge: "Insane",
      description: "Aggressive Grand Champion AI: dribbles on roof, fast aerials, wall bounces, and supersonic demos!",
      features: ["Roof ball carry", "45° power flicks", "Fast ceiling aerials", "Aggressive demos"],
      color: "text-rose-400",
      border: "border-rose-500/60",
      bg: "bg-rose-500/15"
    },
    {
      id: "unfair",
      name: "☠️ Unfair Cheat Bot",
      badge: "Impossible",
      description: "Ruthless perfection: 0ms reaction, boost starving, geometric top-corner snipes, iron defense!",
      features: ["Predator boost starve", "Corner snipes", "Supersonic demos", "Toxic quick chat"],
      color: "text-red-400",
      border: "border-red-500/80",
      bg: "bg-red-950/40"
    }
  ];

  const gameModes = [
    {
      id: "1v1",
      name: "1 vs 1 Duel",
      desc: "Classic competitive duel against chosen Bot AI",
      icon: d.jsx(Is, { className: "w-4 h-4 text-sky-400" })
    },
    {
      id: "2v2",
      name: "2 vs 2 Team",
      desc: "You & an AI teammate against two AI opponents",
      icon: d.jsx(Wg, { className: "w-4 h-4 text-emerald-400" })
    },
    {
      id: "3v3",
      name: "3 vs 3 Classic",
      desc: "Full squad match: You + 2 AI teammates against 3 AI opponents",
      icon: d.jsx(Wg, { className: "w-4 h-4 text-cyan-400" })
    },
    {
      id: "training",
      name: "Free Play (Training)",
      desc: "Open practice pitch with instant mechanic setup keys",
      icon: d.jsx(om, { className: "w-4 h-4 text-amber-400" })
    },
    {
      id: "bot_vs_bot",
      name: "1v1 Spectator",
      desc: "Watch 1 AI vs 1 AI match with full DVR rewind and slow-mo",
      icon: d.jsx(Eg, { className: "w-4 h-4 text-purple-400" })
    },
    {
      id: "spectator_2v2",
      name: "2v2 Spectator",
      desc: "Watch 2 AI vs 2 AI team battle with full DVR rewind and slow-mo",
      icon: d.jsx(Eg, { className: "w-4 h-4 text-indigo-400" })
    },
    {
      id: "spectator_3v3",
      name: "3v3 Spectator",
      desc: "Watch 3 AI vs 3 AI full match with full DVR rewind and slow-mo",
      icon: d.jsx(Eg, { className: "w-4 h-4 text-fuchsia-400" })
    }
  ];

  return d.jsx("div", {
    className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md",
    children: d.jsxs("div", {
      className: "bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in text-slate-100 font-sans",
      children: [
        // Modal Header
        d.jsxs("div", {
          className: "flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/70",
          children: [
            d.jsxs("div", {
              className: "flex items-center gap-2.5",
              children: [
                d.jsx(cm, { className: "w-5 h-5 text-sky-400" }),
                d.jsx("h2", {
                  className: "text-base font-gaming font-black tracking-wider text-white uppercase",
                  children: "Match Settings & Bot Difficulty"
                })
              ]
            }),
            d.jsx("button", {
              onClick: s,
              className: "p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer",
              children: d.jsx(rm, { className: "w-5 h-5" })
            })
          ]
        }),

        // Modal Body
        d.jsxs("div", {
          className: "p-6 space-y-6 overflow-y-auto",
          children: [
            // Garage / Select Car & Hitbox
            d.jsxs("div", {
              children: [
                d.jsxs("div", {
                  className: "flex items-center justify-between mb-2.5",
                  children: [
                    d.jsxs("label", {
                      className: "text-xs font-gaming font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5",
                      children: [
                        d.jsx(Car, { className: "w-4 h-4 text-sky-400" }),
                        d.jsx("span", { children: "Garage / Select Car & Hitbox" })
                      ]
                    }),
                    d.jsxs("span", {
                      className: "text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800",
                      children: ["Selected: ", CAR_DEFINITIONS[f.selectedCar || "octane"]?.name || "Octane"]
                    })
                  ]
                }),
                d.jsx("div", {
                  className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5",
                  children: Object.values(CAR_DEFINITIONS).map(car => {
                    const active = (f.selectedCar || "octane") === car.id;
                    return d.jsxs("button", {
                      key: car.id,
                      onClick: () => r({ ...f, selectedCar: car.id }),
                      className: `p-3 rounded-2xl border text-left transition cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                        active
                          ? "bg-sky-950/40 border-sky-400 text-white shadow-lg ring-1 ring-sky-400/50"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300"
                      }`,
                      children: [
                        d.jsxs("div", {
                          className: "flex items-start justify-between gap-2 mb-2",
                          children: [
                            d.jsxs("div", {
                              children: [
                                d.jsxs("div", {
                                  className: "font-gaming font-bold text-sm text-white flex items-center gap-1.5",
                                  children: [
                                    car.name,
                                    active && d.jsx(Wh, { className: "w-4 h-4 text-sky-400" })
                                  ]
                                }),
                                d.jsxs("div", {
                                  className: "flex items-center gap-1 mt-0.5",
                                  children: [
                                    d.jsx("span", {
                                      className: `text-[10px] font-bold px-1.5 py-0.2 rounded border font-gaming ${
                                        car.hitboxClass === "Octane"
                                          ? "text-amber-400 border-amber-500/40 bg-amber-500/10"
                                          : car.hitboxClass === "Dominus"
                                          ? "text-rose-400 border-rose-500/40 bg-rose-500/10"
                                          : car.hitboxClass === "Breakout"
                                          ? "text-purple-400 border-purple-500/40 bg-purple-500/10"
                                          : car.hitboxClass === "Hybrid"
                                          ? "text-blue-400 border-blue-500/40 bg-blue-500/10"
                                          : "text-emerald-400 border-emerald-500/40 bg-emerald-500/10"
                                      }`,
                                      children: `${car.hitboxClass.toUpperCase()} HITBOX`
                                    }),
                                    d.jsx("span", {
                                      className: "text-[10px] text-slate-400 font-mono",
                                      children: `${car.width}×${car.height}px`
                                    })
                                  ]
                                })
                              ]
                            }),
                            d.jsx("span", {
                              className: `text-[9px] font-gaming font-bold px-1.5 py-0.5 rounded border ${car.badgeColor}`,
                              children: car.badge
                            })
                          ]
                        }),
                        d.jsx("div", {
                          className: "text-[11px] text-slate-400 line-clamp-2 mb-2 leading-relaxed",
                          children: car.description
                        }),
                        d.jsxs("div", {
                          className: "pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400",
                          children: [
                            d.jsxs("span", {
                              className: "font-mono text-slate-400",
                              children: ["RL: ", `${car.rlStats.length.toFixed(1)} × ${car.rlStats.height.toFixed(1)} cm`]
                            }),
                            d.jsx("span", {
                              className: active ? "text-sky-400 font-bold" : "text-slate-400",
                              children: active ? "EQUIPPED" : "SELECT"
                            })
                          ]
                        })
                      ]
                    });
                  })
                })
              ]
            }),

            // Arena & Map Selection
            d.jsxs("div", {
              children: [
                d.jsxs("div", {
                  className: "flex items-center justify-between mb-2.5",
                  children: [
                    d.jsxs("label", {
                      className: "text-xs font-gaming font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5",
                      children: [
                        d.jsx(Layers, { className: "w-4 h-4 text-sky-400" }),
                        d.jsx("span", { children: "Arena & Map Selection" })
                      ]
                    }),
                    d.jsxs("span", {
                      className: "text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800",
                      children: ["Selected: ", (MAP_DEFINITIONS[f.selectedMap || "standard"] || MAP_DEFINITIONS.standard).name]
                    })
                  ]
                }),
                d.jsx("div", {
                  className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5",
                  children: Object.values(MAP_DEFINITIONS).map(mDef => {
                    const active = (f.selectedMap || "standard") === mDef.id;
                    return d.jsxs("button", {
                      key: mDef.id,
                      onClick: () => r({ ...f, selectedMap: mDef.id }),
                      className: `p-3 rounded-2xl border text-left transition cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                        active
                          ? "bg-sky-950/40 border-sky-400 text-white shadow-lg ring-1 ring-sky-400/50"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300"
                      }`,
                      children: [
                        d.jsxs("div", {
                          className: "flex items-start justify-between gap-2 mb-2",
                          children: [
                            d.jsxs("div", {
                              children: [
                                d.jsxs("div", {
                                  className: "font-gaming font-bold text-sm text-white flex items-center gap-1.5",
                                  children: [
                                    mDef.name,
                                    active && d.jsx(Wh, { className: "w-4 h-4 text-sky-400" })
                                  ]
                                }),
                                d.jsxs("div", {
                                  className: "flex items-center gap-1 mt-0.5",
                                  children: [
                                    d.jsx("span", {
                                      className: `text-[10px] font-bold px-1.5 py-0.2 rounded border font-gaming ${
                                        mDef.goalType === "floor"
                                          ? "text-amber-400 border-amber-500/40 bg-amber-500/10"
                                          : mDef.goalType === "ceiling"
                                          ? "text-rose-400 border-rose-500/40 bg-rose-500/10"
                                          : mDef.goalType === "elevated"
                                          ? "text-cyan-400 border-cyan-500/40 bg-cyan-500/10"
                                          : "text-sky-400 border-sky-500/40 bg-sky-500/10"
                                      }`,
                                      children: `${mDef.goalType.toUpperCase()} GOALS`
                                    }),
                                    d.jsx("span", {
                                      className: "text-[10px] text-slate-400 font-mono",
                                      children: `${mDef.Kt}×${mDef.hl}px`
                                    })
                                  ]
                                })
                              ]
                            }),
                            d.jsx("span", {
                              className: `text-[9px] font-gaming font-bold px-1.5 py-0.5 rounded border ${mDef.badgeColor}`,
                              children: mDef.badge
                            })
                          ]
                        }),
                        d.jsx("div", {
                          className: "text-[11px] text-slate-400 line-clamp-2 mb-2 leading-relaxed",
                          children: mDef.description
                        }),
                        d.jsxs("div", {
                          className: "pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400",
                          children: [
                            d.jsxs("span", {
                              className: "font-mono text-slate-400",
                              children: ["Net: ", "300×130px (Official)"]
                            }),
                            d.jsx("span", {
                              className: active ? "text-sky-400 font-bold" : "text-slate-400",
                              children: active ? "ACTIVE ARENA" : "SELECT"
                            })
                          ]
                        })
                      ]
                    });
                  })
                })
              ]
            }),

            // Game Mode
            d.jsxs("div", {
              children: [
                d.jsx("label", {
                  className: "text-xs font-gaming font-bold uppercase tracking-wider text-slate-400 mb-2.5 block",
                  children: "Game Mode"
                }),
                d.jsx("div", {
                  className: "grid grid-cols-1 sm:grid-cols-2 gap-2.5",
                  children: gameModes.map(p => {
                    const active = f.mode === p.id;
                    return d.jsxs("button", {
                      onClick: () => r({ ...f, mode: p.id }),
                      className: `p-3 rounded-2xl border text-left flex items-start gap-3 transition cursor-pointer ${
                        active ? "bg-sky-600/20 border-sky-400 text-white shadow-lg" : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300"
                      }`,
                      children: [
                        d.jsx("div", { className: "p-2 rounded-xl bg-slate-800 mt-0.5", children: p.icon }),
                        d.jsxs("div", {
                          children: [
                            d.jsxs("div", {
                              className: "font-gaming font-bold text-sm text-white flex items-center gap-1.5",
                              children: [p.name, active && d.jsx(Wh, { className: "w-4 h-4 text-sky-400" })]
                            }),
                            d.jsx("div", { className: "text-xs text-slate-400 mt-0.5", children: p.desc })
                          ]
                        })
                      ]
                    }, p.id);
                  })
                })
              ]
            }),

            // Physics Engine Mode
            d.jsxs("div", {
              children: [
                d.jsx("label", {
                  className: "text-xs font-gaming font-bold uppercase tracking-wider text-slate-400 mb-2.5 block",
                  children: "Physics Engine Mode"
                }),
                d.jsx("div", {
                  className: "grid grid-cols-1 sm:grid-cols-2 gap-2.5",
                  children: [
                    {
                      id: "rocket_league",
                      name: "Rocket League Pro",
                      badge: "Realistic & Dribbling",
                      color: "text-sky-400",
                      bg: "bg-sky-950/40",
                      border: "border-sky-500/70",
                      desc: "Authentic Rocket League pacing and mechanics: unified 720 gravity, smooth ground push dribbling, sticky roof ball carries, and high-velocity flicks.",
                      features: ["Roof Carry Dribble", "45° & Musty Flicks", "Smooth Ground Roll", "Unified 720 Gravity", "Pro Speed Scaling"]
                    },
                    {
                      id: "legacy",
                      name: "Classic / Arcade",
                      badge: "Original",
                      color: "text-amber-400",
                      bg: "bg-amber-950/40",
                      border: "border-amber-500/70",
                      desc: "Exact original fast-paced arcade physics: high bounce turf (0.76 restitution), front bumper pop kicks, high car speeds (650/1250 px/s), and extreme pinches.",
                      features: ["Original 850/1050 Gravity", "Bumper Pop Launches", "Fast Paced (1250 Boost)", "Original Arena Bounces", "Extreme Pinches"]
                    }
                  ].map(p => {
                    const active = (f.physicsMode || "rocket_league") === p.id;
                    return d.jsxs("button", {
                      key: p.id,
                      onClick: () => r({ ...f, physicsMode: p.id }),
                      className: `p-3.5 rounded-2xl border text-left transition cursor-pointer relative ${
                        active ? `${p.bg} ${p.border} shadow-lg ring-1 ring-white/20` : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                      }`,
                      children: [
                        d.jsxs("div", {
                          className: "flex items-center justify-between mb-1",
                          children: [
                            d.jsxs("div", {
                              className: "flex items-center gap-2",
                              children: [
                                d.jsx("span", { className: `font-gaming font-black text-sm ${p.color}`, children: p.name }),
                                d.jsx("span", {
                                  className: "text-[10px] px-2 py-0.5 rounded-full font-gaming font-bold bg-slate-800 text-slate-300 border border-slate-700",
                                  children: p.badge
                                })
                              ]
                            }),
                            active &&
                              d.jsxs("div", {
                                className: "flex items-center gap-1 text-xs font-gaming font-bold text-sky-400",
                                children: [d.jsx(Wh, { className: "w-4 h-4" }), d.jsx("span", { children: "Active" })]
                              })
                          ]
                        }),
                        d.jsx("p", { className: "text-xs text-slate-300 mb-2 leading-relaxed", children: p.desc }),
                        d.jsx("div", {
                          className: "flex flex-wrap gap-1.5",
                          children: p.features.map(c =>
                            d.jsx("span", {
                              key: c,
                              className: "text-[10px] font-gaming px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/50",
                              children: c
                            })
                          )
                        })
                      ]
                    });
                  })
                })
              ]
            }),

            // Bot Difficulty
            f.mode !== "training" &&
              d.jsxs("div", {
                children: [
                  d.jsx("label", {
                    className: "text-xs font-gaming font-bold uppercase tracking-wider text-slate-400 mb-2.5 block",
                    children: "Bot Difficulty"
                  }),
                  d.jsx("div", {
                    className: "grid grid-cols-1 gap-2.5",
                    children: difficulties.map(p => {
                      const active = f.botDifficulty === p.id;
                      return d.jsxs("button", {
                        onClick: () => r({ ...f, botDifficulty: p.id }),
                        className: `p-3.5 rounded-2xl border text-left transition cursor-pointer relative ${
                          active ? `${p.bg} ${p.border} shadow-lg ring-1 ring-white/20` : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                        }`,
                        children: [
                          d.jsxs("div", {
                            className: "flex items-center justify-between mb-1",
                            children: [
                              d.jsxs("div", {
                                className: "flex items-center gap-2",
                                children: [
                                  d.jsx("span", { className: `font-gaming font-black text-sm ${p.color}`, children: p.name }),
                                  d.jsx("span", {
                                    className: "text-[10px] px-2 py-0.5 rounded-full font-gaming font-bold bg-slate-800 text-slate-300 border border-slate-700",
                                    children: p.badge
                                  })
                                ]
                              }),
                              active &&
                                d.jsxs("div", {
                                  className: "flex items-center gap-1 text-xs font-gaming font-bold text-sky-400",
                                  children: [d.jsx(Wh, { className: "w-4 h-4" }), d.jsx("span", { children: "Active" })]
                                })
                            ]
                          }),
                          d.jsx("p", { className: "text-xs text-slate-300 mb-2 leading-relaxed", children: p.description }),
                          d.jsx("div", {
                            className: "flex flex-wrap gap-1.5",
                            children: p.features.map(c =>
                              d.jsx("span", {
                                className: "text-[10px] font-gaming px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/50",
                                children: c
                              }, c)
                            )
                          })
                        ]
                      }, p.id);
                    })
                  })
                ]
              }),

            // Match Duration
            d.jsxs("div", {
              children: [
                d.jsx("label", {
                  className: "text-xs font-gaming font-bold uppercase tracking-wider text-slate-400 mb-2 block",
                  children: "Match Duration"
                }),
                d.jsx("div", {
                  className: "grid grid-cols-4 gap-2",
                  children: [
                    { val: 60, label: "1 Min" },
                    { val: 180, label: "3 Min" },
                    { val: 300, label: "5 Min" },
                    { val: 9999, label: "Unlimited" }
                  ].map(p =>
                    d.jsx("button", {
                      onClick: () => r({ ...f, matchDuration: p.val }),
                      className: `py-2.5 px-3 rounded-xl border text-xs font-gaming font-bold transition text-center cursor-pointer ${
                        f.matchDuration === p.val ? "bg-sky-600 border-sky-400 text-white shadow" : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                      }`,
                      children: p.label
                    }, p.val)
                  )
                })
              ]
            }),

            // Steering & Car Rotation Control Mode
            d.jsxs("div", {
              children: [
                d.jsx("label", {
                  className: "text-xs font-gaming font-bold uppercase tracking-wider text-slate-400 mb-2 block",
                  children: "Steering & Car Rotation Control"
                }),
                d.jsx("div", {
                  className: "grid grid-cols-2 gap-2",
                  children: [
                    { id: "keyboard", label: "Keyboard Only (A/D)", desc: "Classic A/D steer, Q/E air roll" },
                    { id: "mouse", label: "Mouse Aim (Reticle)", desc: "Car follows mouse cursor & flips to crosshair [M]" }
                  ].map(p =>
                    d.jsxs("button", {
                      key: p.id,
                      onClick: () => r({ ...f, steeringControl: p.id }),
                      className: `py-2.5 px-3 rounded-xl border text-left transition cursor-pointer ${
                        (f.steeringControl || "keyboard") === p.id ? "bg-emerald-600 border-emerald-400 text-white shadow" : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                      }`,
                      children: [
                        d.jsx("div", { className: "text-xs font-gaming font-bold", children: p.label }),
                        d.jsx("div", { className: "text-[10px] text-slate-400 mt-0.5", children: p.desc })
                      ]
                    })
                  )
                })
              ]
            }),

            // Jump Keybind
            d.jsxs("div", {
              children: [
                d.jsx("label", {
                  className: "text-xs font-gaming font-bold uppercase tracking-wider text-slate-400 mb-2 block",
                  children: "Jump Keybind"
                }),
                d.jsx("div", {
                  className: "grid grid-cols-2 gap-2",
                  children: [
                    { id: "space", label: "Spacebar", desc: "Classic keyboard jump" },
                    { id: "rmb", label: "Right Click (RMB)", desc: "Mouse right button" }
                  ].map(p =>
                    d.jsxs("button", {
                      key: p.id,
                      onClick: () => r({ ...f, jumpKey: p.id }),
                      className: `py-2.5 px-3 rounded-xl border text-left transition cursor-pointer ${
                        (f.jumpKey || "space") === p.id ? "bg-sky-600 border-sky-400 text-white shadow" : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                      }`,
                      children: [
                        d.jsx("div", { className: "text-xs font-gaming font-bold", children: p.label }),
                        d.jsx("div", { className: "text-[10px] text-slate-400 mt-0.5", children: p.desc })
                      ]
                    })
                  )
                })
              ]
            }),

            // Audio & Ball Trajectory
            d.jsx("div", {
              className: "pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3",
              children: d.jsxs("div", {
                className: "flex items-center gap-3",
                children: [
                  d.jsxs("button", {
                    onClick: () => r({ ...f, soundEnabled: !f.soundEnabled }),
                    className: `flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-gaming font-bold transition cursor-pointer ${
                      f.soundEnabled ? "bg-emerald-600/20 border-emerald-500/50 text-emerald-300" : "bg-slate-900 border-slate-800 text-slate-400"
                    }`,
                    children: [
                      f.soundEnabled ? d.jsx(Ig, { className: "w-4 h-4" }) : d.jsx(t2, { className: "w-4 h-4" }),
                      d.jsx("span", { children: f.soundEnabled ? "Audio Enabled" : "Muted" })
                    ]
                  }),
                  d.jsxs("button", {
                    onClick: () => r({ ...f, autoCam: f.autoCam === false ? true : false }),
                    className: `flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-gaming font-bold transition cursor-pointer ${
                      f.autoCam !== false ? "bg-purple-600/20 border-purple-500/50 text-purple-300" : "bg-slate-900 border-slate-800 text-slate-400"
                    }`,
                    children: [
                      d.jsx(Camera, { className: "w-4 h-4" }),
                      d.jsx("span", { children: f.autoCam !== false ? "Auto Cam: ON [C]" : "Auto Cam: OFF (Fixed) [C]" })
                    ]
                  }),
                  d.jsxs("button", {
                    onClick: () => r({ ...f, showTrajectory: !f.showTrajectory }),
                    className: `flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-gaming font-bold transition cursor-pointer ${
                      f.showTrajectory ? "bg-sky-600/20 border-sky-500/50 text-sky-300" : "bg-slate-900 border-slate-800 text-slate-400"
                    }`,
                    children: [
                      d.jsx(sm, { className: "w-4 h-4" }),
                      d.jsx("span", { children: f.showTrajectory ? "Ball Trajectory: ON [Y]" : "Ball Trajectory: OFF [Y]" })
                    ]
                  }),
                  d.jsxs("button", {
                    onClick: () => r({ ...f, showMechanicAlerts: f.showMechanicAlerts === false ? true : false }),
                    className: `flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-gaming font-bold transition cursor-pointer ${
                      f.showMechanicAlerts !== false ? "bg-purple-600/20 border-purple-500/50 text-purple-300" : "bg-slate-900 border-slate-800 text-slate-400"
                    }`,
                    children: [
                      d.jsx(Wh, { className: "w-4 h-4" }),
                      d.jsx("span", { children: f.showMechanicAlerts !== false ? "Mechanic Alerts: ON" : "Mechanic Alerts: OFF" })
                    ]
                  }),
                  d.jsxs("button", {
                    onClick: () => r({ ...f, showHitbox: !f.showHitbox }),
                    className: `flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-gaming font-bold transition cursor-pointer ${
                      f.showHitbox ? "bg-amber-600/20 border-amber-500/50 text-amber-300" : "bg-slate-900 border-slate-800 text-slate-400"
                    }`,
                    children: [
                      d.jsx(Box, { className: "w-4 h-4" }),
                      d.jsx("span", { children: f.showHitbox ? "Hitboxes: VISIBLE [H]" : "Hitboxes: HIDDEN [H]" })
                    ]
                  })
                ]
              })
            }),

            // Mobile Controls Setting
            d.jsxs("div", {
              className: "pt-3 border-t border-slate-800 flex flex-col gap-2",
              children: [
                d.jsx("label", {
                  className: "text-xs font-gaming font-bold uppercase tracking-wider text-slate-400 block",
                  children: "Mobile On-Screen Controls"
                }),
                d.jsx("div", {
                  className: "grid grid-cols-3 gap-2",
                  children: [
                    { id: "auto", label: "Auto (Touch Devices)" },
                    { id: "on", label: "Always On" },
                    { id: "off", label: "Disabled" }
                  ].map(opt => {
                    const active = (f.mobileControls || "auto") === opt.id;
                    return d.jsxs("button", {
                      key: opt.id,
                      type: "button",
                      onClick: () => r({ ...f, mobileControls: opt.id }),
                      className: `flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-gaming font-bold transition cursor-pointer ${
                        active
                          ? "bg-sky-600/30 border-sky-500 text-sky-300 ring-1 ring-sky-400/40"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`,
                      children: [
                        d.jsx(Smartphone, { className: "w-3.5 h-3.5" }),
                        d.jsx("span", { children: opt.label })
                      ]
                    });
                  })
                })
              ]
            })
          ]
        }),

        // Modal Footer
        d.jsxs("div", {
          className: "flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/80",
          children: [
            d.jsx("button", {
              onClick: s,
              className: "px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-gaming font-bold transition cursor-pointer",
              children: "Cancel"
            }),
            d.jsxs("button", {
              onClick: y,
              className: "px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white text-xs font-gaming font-black uppercase tracking-wider shadow-lg shadow-sky-500/25 transition active:scale-95 flex items-center gap-2 cursor-pointer",
              children: [d.jsx(Ru, { className: "w-4 h-4" }), d.jsx("span", { children: "Apply & Restart Match" })]
            })
          ]
        })
      ]
    })
  });
};

const s2 = ({ jumpKey = "space", isOpen, onClose }: any) => {
  if (!isOpen) return null;
  const [activeTab, setActiveTab] = st.useState<"keyboard" | "mobile">("keyboard");

  return d.jsx("div", {
    className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none",
    children: d.jsxs("div", {
      className: "bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-lg w-full text-slate-100 animate-fade-in font-sans max-h-[90vh] flex flex-col",
      children: [
        d.jsxs("div", {
          className: "flex items-center justify-between pb-3 border-b border-slate-800 mb-3",
          children: [
            d.jsxs("div", {
              className: "flex items-center gap-2.5",
              children: [
                d.jsx(zg, { className: "w-5 h-5 text-sky-400" }),
                d.jsx("span", {
                  className: "font-gaming font-black text-base text-white uppercase tracking-wider",
                  children: "Controls & Mechanics Guide"
                })
              ]
            }),
            d.jsx("button", {
              onClick: onClose,
              className: "p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer",
              children: d.jsx(rm, { className: "w-5 h-5" })
            })
          ]
        }),

        d.jsxs("div", {
          className: "flex items-center gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800 mb-3 shrink-0",
          children: [
            d.jsxs("button", {
              onClick: () => setActiveTab("keyboard"),
              className: `flex-1 py-1.5 px-3 rounded-lg text-xs font-gaming font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "keyboard" ? "bg-sky-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`,
              children: [
                d.jsx(zg, { className: "w-3.5 h-3.5" }),
                d.jsx("span", { children: "Keyboard & Mouse" })
              ]
            }),
            d.jsxs("button", {
              onClick: () => setActiveTab("mobile"),
              className: `flex-1 py-1.5 px-3 rounded-lg text-xs font-gaming font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "mobile" ? "bg-sky-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`,
              children: [
                d.jsx(Smartphone, { className: "w-3.5 h-3.5 text-amber-300" }),
                d.jsx("span", { children: "📱 Mobile Touch" })
              ]
            })
          ]
        }),

        d.jsx("div", {
          className: "overflow-y-auto flex-1 pr-1",
          children: activeTab === "keyboard" ? (
            d.jsxs("div", {
              className: "space-y-2.5 text-xs font-gaming",
              children: [
                d.jsxs("div", {
                  className: "flex justify-between items-center py-1.5 border-b border-slate-800/80",
                  children: [
                    d.jsx("span", { className: "text-slate-400", children: "Drive / Throttle" }),
                    d.jsx("span", { className: "font-mono font-bold bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-lg text-sky-300", children: "W / ↑" })
                  ]
                }),
                d.jsxs("div", {
                  className: "flex justify-between items-center py-1.5 border-b border-slate-800/80",
                  children: [
                    d.jsx("span", { className: "text-slate-400", children: "Brake / Reverse" }),
                    d.jsx("span", { className: "font-mono font-bold bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-lg text-sky-300", children: "S / ↓" })
                  ]
                }),
                d.jsxs("div", {
                  className: "flex justify-between items-center py-1.5 border-b border-slate-800/80",
                  children: [
                    d.jsx("span", { className: "text-slate-400", children: "Steer (Ground) / Air Steer" }),
                    d.jsx("span", { className: "font-mono font-bold bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-lg text-sky-300", children: "A / D or ← / →" })
                  ]
                }),
                d.jsxs("div", {
                  className: "flex justify-between items-center py-1.5 border-b border-slate-800/80",
                  children: [
                    d.jsx("span", { className: "text-slate-400", children: "Mouse Aim / Cursor Rotation" }),
                    d.jsx("span", { className: "font-mono font-bold bg-emerald-950/80 border border-emerald-500/50 px-2 py-0.5 rounded-lg text-emerald-300", children: "M (Toggle) / Mouse" })
                  ]
                }),
                d.jsxs("div", {
                  className: "flex justify-between items-center py-1.5 border-b border-slate-800/80",
                  children: [
                    d.jsx("span", { className: "text-slate-400", children: "Air Roll (Flip Ceiling / Wheels)" }),
                    d.jsx("span", { className: "font-mono font-bold bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-lg text-amber-300", children: "Q / E" })
                  ]
                }),
                d.jsxs("div", {
                  className: "flex justify-between items-center py-1.5 border-b border-slate-800/80",
                  children: [
                    d.jsx("span", { className: "text-slate-400", children: "Dodge Flip (In Air)" }),
                    d.jsx("span", { className: "font-mono font-bold bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-lg text-sky-300", children: "WASD + Space" })
                  ]
                }),
                d.jsxs("div", {
                  className: "flex justify-between items-center py-1.5 border-b border-slate-800/80",
                  children: [
                    d.jsx("span", { className: "text-slate-400", children: "Jump" }),
                    d.jsx("span", {
                      className: "font-mono font-bold bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-lg text-sky-300",
                      children: jumpKey === "rmb" ? "Right Click / Space" : "Spacebar"
                    })
                  ]
                }),
                d.jsxs("div", {
                  className: "flex justify-between items-center py-1.5 border-b border-slate-800/80",
                  children: [
                    d.jsx("span", { className: "text-slate-400", children: "Rocket Boost" }),
                    d.jsx("span", { className: "font-mono font-bold bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-lg text-amber-300", children: "Shift / LMB / J" })
                  ]
                }),
                d.jsxs("div", {
                  className: "flex justify-between items-center py-1.5 border-b border-slate-800/80",
                  children: [
                    d.jsx("span", { className: "text-slate-400", children: "Double Jump / Dodge Flip" }),
                    d.jsx("span", { className: "font-mono text-slate-200", children: "WASD + Space in air" })
                  ]
                }),
                d.jsxs("div", {
                  className: "flex justify-between items-center py-1.5 border-b border-slate-800/80",
                  children: [
                    d.jsx("span", { className: "text-slate-400", children: "Quick Chat" }),
                    d.jsx("span", { className: "font-mono font-bold bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-lg text-slate-200", children: "T or C" })
                  ]
                }),
                d.jsxs("div", {
                  className: "flex justify-between items-center py-1.5 border-b border-slate-800/80",
                  children: [
                    d.jsx("span", { className: "text-slate-400", children: "Hitbox Wireframe Overlay" }),
                    d.jsx("span", { className: "font-mono font-bold bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-lg text-amber-300", children: "H" })
                  ]
                }),
                d.jsxs("div", {
                  className: "flex justify-between items-center py-1.5",
                  children: [
                    d.jsx("span", { className: "text-slate-400", children: "Pause / Restart" }),
                    d.jsx("span", { className: "font-mono font-bold bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-lg text-slate-200", children: "P / R" })
                  ]
                })
              ]
            })
          ) : (
            d.jsxs("div", {
              className: "space-y-3 text-xs font-sans text-slate-300",
              children: [
                d.jsxs("div", {
                  className: "p-3 rounded-2xl bg-sky-950/40 border border-sky-800/60",
                  children: [
                    d.jsx("h4", { className: "font-gaming font-black text-sky-300 text-sm mb-1.5", children: "🕹️ Left Thumb: Precision D-Pad" }),
                    d.jsxs("ul", {
                      className: "space-y-1 text-slate-300 text-[11px] list-disc list-inside",
                      children: [
                        d.jsxs("li", { children: [d.jsx("strong", { className: "text-white", children: "Steering (Left / Right):" }), " Tap or slide left & right to drive or rotate car."] }),
                        d.jsxs("li", { children: [d.jsx("strong", { className: "text-white", children: "Throttle (Up):" }), " Accelerate forward."] }),
                        d.jsxs("li", { children: [d.jsx("strong", { className: "text-white", children: "Brake / Reverse (Down):" }), " Slow down or reverse."] }),
                        d.jsxs("li", { children: [d.jsx("strong", { className: "text-white", children: "Continuous Slide:" }), " Drag your thumb across directions seamlessly."] })
                      ]
                    })
                  ]
                }),
                d.jsxs("div", {
                  className: "p-3 rounded-2xl bg-amber-950/30 border border-amber-800/50",
                  children: [
                    d.jsx("h4", { className: "font-gaming font-black text-amber-300 text-sm mb-1.5", children: "⚡ Right Thumb: Action Pod" }),
                    d.jsxs("ul", {
                      className: "space-y-1 text-slate-300 text-[11px] list-disc list-inside",
                      children: [
                        d.jsxs("li", { children: [d.jsx("strong", { className: "text-amber-400", children: "🚀 BOOST:" }), " Hold for rocket boost. Includes visual boost gauge ring."] }),
                        d.jsxs("li", { children: [d.jsx("strong", { className: "text-sky-400", children: "⤊ JUMP:" }), " Tap to jump. Tap again in mid-air while pressing a direction to Dodge Flip! Glows gold when you have a Flip Reset."] }),
                        d.jsxs("li", { children: [d.jsx("strong", { className: "text-purple-400", children: "🔄 AIR ROLL:" }), " Instant 180° flip to land cleanly on wheels, ceiling, or walls."] }),
                        d.jsxs("li", { children: [d.jsx("strong", { className: "text-emerald-400", children: "🛑 HANDBRAKE:" }), " Hold to drift and slide turn instantly."] })
                      ]
                    })
                  ]
                }),
                d.jsxs("div", {
                  className: "p-3 rounded-2xl bg-slate-900/80 border border-slate-800",
                  children: [
                    d.jsx("h4", { className: "font-gaming font-black text-slate-200 text-sm mb-1.5", children: "✨ Multi-Touch & Quick Menu" }),
                    d.jsxs("p", {
                      className: "text-[11px] text-slate-300 leading-relaxed",
                      children: "You can hold Boost with your right thumb while steering with your left thumb and tapping Jump at any moment for fast aerial strikes. Tap the top-right 'Menu' button anytime to access settings, camera toggle, and match history."
                    })
                  ]
                })
              ]
            })
          )
        }),

        d.jsxs("div", {
          className: "mt-3 p-3 bg-sky-950/40 border border-sky-800/50 rounded-2xl text-xs text-sky-200 leading-relaxed font-sans shrink-0",
          children: [
            d.jsxs("strong", { className: "text-white font-gaming", children: ["💡 ", "Authentic Rocket League Mechanics:"] }),
            d.jsxs("ul", {
              className: "list-disc list-inside mt-1 space-y-0.5 text-slate-300 text-[11px]",
              children: [
                d.jsxs("li", {
                  children: ["Accelerate past 840 km/h to enter ", d.jsx("strong", { className: "text-amber-300", children: "SUPERSONIC" }), " and demolish (demo) opponents on impact!"]
                }),
                d.jsx("li", { children: "Drive smoothly through the rounded ramps onto walls and the ceiling without losing traction!" }),
                d.jsxs("li", {
                  children: ["Touching all 4 wheels against the ball or ceiling grants an unlimited ", d.jsx("strong", { className: "text-amber-300", children: "FLIP RESET" }), "!"]
                })
              ]
            })
          ]
        })
      ]
    })
  });
};

const ScoreboardModal = ({
  isOpen,
  onClose,
  cars = [],
  blueScore = 0,
  orangeScore = 0,
  gameMode = "1v1",
  arenaName = "DFH Stadium"
}: any) => {
  if (!isOpen) return null;
  const blueCars = cars.filter((c: any) => c.team === "blue");
  const orangeCars = cars.filter((c: any) => c.team === "orange");

  return d.jsx("div", {
    className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-fade-in",
    onClick: onClose,
    children: d.jsxs("div", {
      className: "bg-slate-950 border border-slate-700/80 rounded-3xl p-6 shadow-2xl max-w-4xl w-full text-slate-100 font-sans",
      onClick: (e: any) => e.stopPropagation(),
      children: [
        d.jsxs("div", {
          className: "flex items-center justify-between pb-4 border-b border-slate-800 mb-5",
          children: [
            d.jsxs("div", {
              className: "flex items-center gap-3",
              children: [
                d.jsx(Trophy, { className: "w-6 h-6 text-amber-400" }),
                d.jsxs("div", {
                  children: [
                    d.jsx("h2", { className: "font-gaming font-black text-lg text-white tracking-wider uppercase", children: "MATCH SCOREBOARD" }),
                    d.jsxs("div", { className: "text-xs text-slate-400 font-gaming", children: [String(gameMode).toUpperCase(), " • ", arenaName, " • Press [Tab] to toggle"] })
                  ]
                })
              ]
            }),
            d.jsx("button", {
              onClick: onClose,
              className: "p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer",
              children: d.jsx(rm, { className: "w-5 h-5" })
            })
          ]
        }),
        d.jsxs("div", {
          className: "grid grid-cols-2 gap-4 mb-5",
          children: [
            d.jsxs("div", {
              className: "flex items-center justify-between px-5 py-3 rounded-2xl bg-sky-950/60 border border-sky-500/40",
              children: [
                d.jsxs("div", {
                  className: "flex items-center gap-2",
                  children: [
                    d.jsx("div", { className: "w-3 h-3 rounded-full bg-sky-400 shadow-[0_0_10px_#38bdf8]" }),
                    d.jsx("span", { className: "font-gaming font-black text-sky-400 tracking-wider", children: "BLUE TEAM" })
                  ]
                }),
                d.jsx("span", { className: "font-gaming font-black text-3xl text-white drop-shadow", children: blueScore })
              ]
            }),
            d.jsxs("div", {
              className: "flex items-center justify-between px-5 py-3 rounded-2xl bg-orange-950/60 border border-orange-500/40",
              children: [
                d.jsxs("div", {
                  className: "flex items-center gap-2",
                  children: [
                    d.jsx("div", { className: "w-3 h-3 rounded-full bg-orange-400 shadow-[0_0_10px_#f97316]" }),
                    d.jsx("span", { className: "font-gaming font-black text-orange-400 tracking-wider", children: "ORANGE TEAM" })
                  ]
                }),
                d.jsx("span", { className: "font-gaming font-black text-3xl text-white drop-shadow", children: orangeScore })
              ]
            })
          ]
        }),
        d.jsxs("div", {
          className: "space-y-4",
          children: [
            d.jsx("div", {
              className: "overflow-hidden rounded-2xl border border-sky-900/50 bg-sky-950/20",
              children: d.jsxs("table", {
                className: "w-full text-left text-xs font-gaming",
                children: [
                  d.jsx("thead", {
                    className: "bg-sky-950/80 text-sky-300 uppercase text-[10px] tracking-wider border-b border-sky-900/60",
                    children: d.jsxs("tr", {
                      children: [
                        d.jsx("th", { className: "py-2.5 px-4", children: "Player" }),
                        d.jsx("th", { className: "py-2.5 px-3", children: "Car" }),
                        d.jsx("th", { className: "py-2.5 px-3 text-right", children: "Score" }),
                        d.jsx("th", { className: "py-2.5 px-3 text-right", children: "Goals" }),
                        d.jsx("th", { className: "py-2.5 px-3 text-right", children: "Saves" }),
                        d.jsx("th", { className: "py-2.5 px-3 text-right", children: "Shots" }),
                        d.jsx("th", { className: "py-2.5 px-3 text-right", children: "Demos" }),
                        d.jsx("th", { className: "py-2.5 px-3 text-right", children: "Boost" })
                      ]
                    })
                  }),
                  d.jsx("tbody", {
                    className: "divide-y divide-slate-800/60",
                    children: blueCars.map((c: any) =>
                      d.jsxs("tr", {
                        className: `${!c.isBot ? "bg-sky-500/15 font-bold" : "hover:bg-slate-900/40"} transition`,
                        children: [
                          d.jsxs("td", {
                            className: "py-2.5 px-4 flex items-center gap-2",
                            children: [
                              d.jsx("span", { className: !c.isBot ? "text-sky-300 font-black" : "text-slate-200", children: c.name }),
                              !c.isBot && d.jsx("span", { className: "text-[9px] px-1.5 py-0.2 rounded bg-sky-500/30 text-sky-200 border border-sky-400/40 font-mono", children: "YOU" })
                            ]
                          }),
                          d.jsx("td", { className: "py-2.5 px-3 capitalize text-slate-400", children: c.carModel || "octane" }),
                          d.jsx("td", { className: "py-2.5 px-3 text-right font-black font-mono text-amber-300 text-sm", children: Math.round(c.score || 0) }),
                          d.jsx("td", { className: "py-2.5 px-3 text-right font-mono text-white", children: c.goals || 0 }),
                          d.jsx("td", { className: "py-2.5 px-3 text-right font-mono text-sky-300", children: c.saves || 0 }),
                          d.jsx("td", { className: "py-2.5 px-3 text-right font-mono text-slate-300", children: c.shots || 0 }),
                          d.jsx("td", { className: "py-2.5 px-3 text-right font-mono text-rose-400", children: c.demos || 0 }),
                          d.jsxs("td", { className: "py-2.5 px-3 text-right font-mono text-amber-400", children: [Math.round(Math.max(0, Math.min(100, c.boost || 0))), "%"] })
                        ]
                      }, c.id || c.name)
                    )
                  })
                ]
              })
            }),
            d.jsx("div", {
              className: "overflow-hidden rounded-2xl border border-orange-900/50 bg-orange-950/20",
              children: d.jsxs("table", {
                className: "w-full text-left text-xs font-gaming",
                children: [
                  d.jsx("thead", {
                    className: "bg-orange-950/80 text-orange-300 uppercase text-[10px] tracking-wider border-b border-orange-900/60",
                    children: d.jsxs("tr", {
                      children: [
                        d.jsx("th", { className: "py-2.5 px-4", children: "Player" }),
                        d.jsx("th", { className: "py-2.5 px-3", children: "Car" }),
                        d.jsx("th", { className: "py-2.5 px-3 text-right", children: "Score" }),
                        d.jsx("th", { className: "py-2.5 px-3 text-right", children: "Goals" }),
                        d.jsx("th", { className: "py-2.5 px-3 text-right", children: "Saves" }),
                        d.jsx("th", { className: "py-2.5 px-3 text-right", children: "Shots" }),
                        d.jsx("th", { className: "py-2.5 px-3 text-right", children: "Demos" }),
                        d.jsx("th", { className: "py-2.5 px-3 text-right", children: "Boost" })
                      ]
                    })
                  }),
                  d.jsx("tbody", {
                    className: "divide-y divide-slate-800/60",
                    children: orangeCars.map((c: any) =>
                      d.jsxs("tr", {
                        className: `${!c.isBot ? "bg-orange-500/15 font-bold" : "hover:bg-slate-900/40"} transition`,
                        children: [
                          d.jsxs("td", {
                            className: "py-2.5 px-4 flex items-center gap-2",
                            children: [
                              d.jsx("span", { className: !c.isBot ? "text-orange-300 font-black" : "text-slate-200", children: c.name }),
                              !c.isBot && d.jsx("span", { className: "text-[9px] px-1.5 py-0.2 rounded bg-orange-500/30 text-orange-200 border border-orange-400/40 font-mono", children: "YOU" })
                            ]
                          }),
                          d.jsx("td", { className: "py-2.5 px-3 capitalize text-slate-400", children: c.carModel || "octane" }),
                          d.jsx("td", { className: "py-2.5 px-3 text-right font-black font-mono text-amber-300 text-sm", children: Math.round(c.score || 0) }),
                          d.jsx("td", { className: "py-2.5 px-3 text-right font-mono text-white", children: c.goals || 0 }),
                          d.jsx("td", { className: "py-2.5 px-3 text-right font-mono text-orange-300", children: c.saves || 0 }),
                          d.jsx("td", { className: "py-2.5 px-3 text-right font-mono text-slate-300", children: c.shots || 0 }),
                          d.jsx("td", { className: "py-2.5 px-3 text-right font-mono text-rose-400", children: c.demos || 0 }),
                          d.jsxs("td", { className: "py-2.5 px-3 text-right font-mono text-amber-400", children: [Math.round(Math.max(0, Math.min(100, c.boost || 0))), "%"] })
                        ]
                      }, c.id || c.name)
                    )
                  })
                ]
              })
            })
          ]
        })
      ]
    })
  });
};

const MatchHistoryModal = ({
  isOpen,
  onClose,
  onWatchReplay
}: any) => {
  const [matches, setMatches] = st.useState<MatchHistoryMetadata[]>([]);
  const [loading, setLoading] = st.useState(true);

  const loadMatches = st.useCallback(async () => {
    setLoading(true);
    try {
      const list = await getMatchHistoryList();
      setMatches(list);
    } catch (e) {
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  st.useEffect(() => {
    if (isOpen) {
      loadMatches();
    }
  }, [isOpen, loadMatches]);

  if (!isOpen) return null;

  return d.jsx("div", {
    className: "fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none animate-fade-in",
    onClick: onClose,
    children: d.jsxs("div", {
      className: "bg-slate-950 border border-slate-700/80 rounded-3xl p-6 shadow-2xl max-w-3xl w-full text-slate-100 max-h-[85vh] flex flex-col font-sans",
      onClick: (e: any) => e.stopPropagation(),
      children: [
        d.jsxs("div", {
          className: "flex items-center justify-between pb-4 border-b border-slate-800 mb-4 shrink-0",
          children: [
            d.jsxs("div", {
              className: "flex items-center gap-3",
              children: [
                d.jsx(Clock, { className: "w-6 h-6 text-sky-400" }),
                d.jsxs("div", {
                  children: [
                    d.jsx("h2", { className: "font-gaming font-black text-lg text-white tracking-wider uppercase", children: "MATCH HISTORY & REPLAYS" }),
                    d.jsx("div", { className: "text-xs text-slate-400 font-gaming", children: "Select any finished match to watch its full DVR replay" })
                  ]
                })
              ]
            }),
            d.jsx("button", {
              onClick: onClose,
              className: "p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer",
              children: d.jsx(rm, { className: "w-5 h-5" })
            })
          ]
        }),
        d.jsx("div", {
          className: "overflow-y-auto flex-1 pr-1 space-y-3",
          children: loading
            ? d.jsxs("div", {
                className: "flex flex-col items-center justify-center py-12 text-slate-400",
                children: [
                  d.jsx(Loader2, { className: "w-8 h-8 animate-spin text-sky-400 mb-2" }),
                  d.jsx("span", { className: "text-xs font-gaming", children: "Loading match replays..." })
                ]
              })
            : matches.length === 0
            ? d.jsxs("div", {
                className: "flex flex-col items-center justify-center py-16 text-center text-slate-500",
                children: [
                  d.jsx(Film, { className: "w-12 h-12 mb-3 text-slate-600" }),
                  d.jsx("p", { className: "text-sm font-gaming font-bold text-slate-300", children: "No Recorded Matches Yet" }),
                  d.jsx("p", { className: "text-xs text-slate-500 mt-1 max-w-sm", children: "Complete a match to automatically save it to your history and watch its full replay anytime." })
                ]
              })
            : matches.map((m: any) => {
                const isWin = m.winnerTeam === "blue";
                const isDraw = m.winnerTeam === "draw";
                return d.jsxs("div", {
                  className: "p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-4",
                  children: [
                    d.jsxs("div", {
                      className: "space-y-1.5 flex-1",
                      children: [
                        d.jsxs("div", {
                          className: "flex items-center gap-2 flex-wrap",
                          children: [
                            d.jsx("span", {
                              className: `px-2.5 py-0.5 rounded-lg text-[10px] font-gaming font-black uppercase tracking-wider ${
                                isWin ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : isDraw ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                              }`,
                              children: isWin ? "VICTORY" : isDraw ? "DRAW" : "DEFEAT"
                            }),
                            d.jsx("span", { className: "text-xs text-slate-400 font-mono", children: m.dateStr }),
                            d.jsx("span", { className: "text-slate-600", children: "•" }),
                            d.jsx("span", { className: "text-xs font-gaming text-slate-300 font-bold uppercase", children: m.gameMode }),
                            d.jsx("span", { className: "text-slate-600", children: "•" }),
                            d.jsx("span", { className: "text-xs text-sky-400 font-gaming", children: m.arenaName })
                          ]
                        }),
                        d.jsxs("div", {
                          className: "flex items-center gap-4",
                          children: [
                            d.jsxs("div", {
                              className: "flex items-center gap-2 font-gaming font-black text-xl",
                              children: [
                                d.jsx("span", { className: "text-sky-400", children: m.blueScore }),
                                d.jsx("span", { className: "text-slate-600", children: ":" }),
                                d.jsx("span", { className: "text-orange-400", children: m.orangeScore })
                              ]
                            }),
                            m.mvp && d.jsxs("div", {
                              className: "text-xs text-amber-300 font-gaming flex items-center gap-1",
                              children: [
                                d.jsx(Trophy, { className: "w-3.5 h-3.5 text-amber-400" }),
                                d.jsxs("span", { children: ["MVP: ", m.mvp.name, " (", m.mvp.score, " pts)"] })
                              ]
                            })
                          ]
                        })
                      ]
                    }),
                    d.jsxs("div", {
                      className: "flex items-center gap-2 shrink-0",
                      children: [
                        d.jsxs("button", {
                          onClick: () => onWatchReplay(m.id),
                          className: "px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-gaming font-bold text-xs shadow-lg shadow-sky-500/20 transition flex items-center gap-1.5 cursor-pointer active:scale-95",
                          children: [
                            d.jsx(Film, { className: "w-4 h-4" }),
                            d.jsx("span", { children: "Watch Replay" })
                          ]
                        }),
                        d.jsx("button", {
                          onClick: async () => {
                            await deleteMatchFromHistory(m.id);
                            loadMatches();
                          },
                          className: "p-2 rounded-xl bg-slate-800/80 hover:bg-red-950/80 text-slate-400 hover:text-red-400 border border-slate-700/60 transition cursor-pointer",
                          title: "Delete Match",
                          children: d.jsx(rm, { className: "w-4 h-4" })
                        })
                      ]
                    })
                  ]
                }, m.id);
              })
        }),
        matches.length > 0 && d.jsxs("div", {
          className: "pt-3 border-t border-slate-800 mt-4 flex items-center justify-between text-xs text-slate-500 shrink-0",
          children: [
            d.jsxs("span", { children: [matches.length, " matches stored"] }),
            d.jsx("button", {
              onClick: async () => {
                if (confirm("Are you sure you want to clear all match history and replays?")) {
                  await clearAllMatchHistory();
                  loadMatches();
                }
              },
              className: "text-xs text-slate-400 hover:text-rose-400 transition cursor-pointer",
              children: "Clear All History"
            })
          ]
        })
      ]
    })
  });
};

const o2 = ({ goalInfo: u, kickoffCountdown: f }: any) =>
  d.jsxs("div", {
    className: "absolute inset-0 pointer-events-none z-40 flex items-center justify-center select-none",
    children: [
      u &&
        d.jsx("div", {
          className: "flex flex-col items-center animate-bounce-short",
          children: d.jsxs("div", {
            className: `px-14 py-6 rounded-3xl backdrop-blur-xl border-2 shadow-2xl flex flex-col items-center text-center font-gaming ${
              u.scoringTeam === "blue"
                ? "bg-gradient-to-b from-sky-600/95 to-blue-950/95 border-sky-400 text-white shadow-[0_0_90px_rgba(56,189,248,0.6)]"
                : "bg-gradient-to-b from-orange-600/95 to-rose-950/95 border-orange-400 text-white shadow-[0_0_90px_rgba(249,115,22,0.6)]"
            }`,
            children: [
              d.jsxs("div", {
                className: "flex items-center gap-3",
                children: [
                  u.scoringTeam === "blue"
                    ? d.jsx(fm, { className: "w-12 h-12 fill-sky-200 text-sky-200 animate-pulse" })
                    : d.jsx($s, { className: "w-12 h-12 fill-orange-200 text-orange-200 animate-pulse" }),
                  d.jsx("span", {
                    className: "text-7xl font-black italic tracking-tighter uppercase drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]",
                    children: "GOAL!"
                  })
                ]
              }),
              d.jsxs("div", {
                className: "mt-2 text-xl font-bold text-slate-100 flex items-center gap-2",
                children: [
                  d.jsx("span", { className: "text-slate-300 text-sm", children: "Scored by:" }),
                  d.jsx("span", { className: "underline decoration-wavy decoration-amber-400 font-black", children: u.scorerName })
                ]
              }),
              d.jsxs("div", {
                className: "mt-3 px-5 py-1.5 rounded-full bg-black/50 border border-white/20 text-sm font-mono font-black text-amber-300 flex items-center gap-2 shadow-inner",
                children: [
                  d.jsx(Ru, { className: "w-4 h-4 fill-amber-300" }),
                  d.jsxs("span", { children: ["SHOT SPEED: ", u.speedKmh, " KM/H"] })
                ]
              })
            ]
          })
        }),
      f !== null && !u &&
        d.jsx("div", {
          className: "flex flex-col items-center",
          children: d.jsx("div", {
            className: `text-9xl font-gaming font-black italic tracking-tight uppercase drop-shadow-[0_0_40px_rgba(255,255,255,0.85)] transition-all duration-200 transform scale-110 ${
              f === 0 ? "text-emerald-400 scale-125" : f === 1 ? "text-amber-400" : f === 2 ? "text-sky-400" : "text-rose-400"
            }`,
            children: f === 0 ? "GO!" : f
          })
        })
    ]
  });

function interpolateSnapshots(s1:any,s2:any,t:number){
  if(!s1)return s2;
  if(!s2||t<=0)return s1;
  if(t>=1)return s2;
  const clampedT=Math.max(0,Math.min(1,t));
  return{
    time:s1.time+(s2.time-s1.time)*clampedT,
    ball:{
      ...s2.ball,
      x:s1.ball.x+(s2.ball.x-s1.ball.x)*clampedT,
      y:s1.ball.y+(s2.ball.y-s1.ball.y)*clampedT,
      vx:s1.ball.vx+(s2.ball.vx-s1.ball.vx)*clampedT,
      vy:s1.ball.vy+(s2.ball.vy-s1.ball.vy)*clampedT,
      spin:s1.ball.spin+(s2.ball.spin-s1.ball.spin)*clampedT,
      trail:s2.ball.trail
    },
    cars:s1.cars.map((c1:any)=>{
      const c2=s2.cars.find((c:any)=>c.id===c1.id);
      if(!c2)return c1;
      const diff=Math.atan2(Math.sin(c2.angle-c1.angle),Math.cos(c2.angle-c1.angle));
      const dominantCar = clampedT < 0.5 ? c1 : c2;
      return{
        ...dominantCar,
        ...c2,
        isGrounded: dominantCar.isGrounded,
        surfaceNormal: dominantCar.surfaceNormal || c2.surfaceNormal || c1.surfaceNormal || null,
        surfaceType: dominantCar.surfaceType || c2.surfaceType || c1.surfaceType,
        airRollInverted: dominantCar.airRollInverted,
        facing: dominantCar.facing,
        x:c1.x+(c2.x-c1.x)*clampedT,
        y:c1.y+(c2.y-c1.y)*clampedT,
        vx:c1.vx+(c2.vx-c1.vx)*clampedT,
        vy:c1.vy+(c2.vy-c1.vy)*clampedT,
        angle:c1.angle+diff*clampedT,
        boost:c1.boost+(c2.boost-c1.boost)*clampedT,
        activeMechanicAlerts: c1.activeMechanicAlerts || c2.activeMechanicAlerts || []
      };
    }),
    boostPads: (s1.boostPads || s2.boostPads || []).map((p1: any) => {
      const p2 = s2.boostPads ? s2.boostPads.find((p: any) => p.id === p1.id) : null;
      if (!p2) return p1;
      return {
        ...p1,
        active: clampedT < 0.5 ? p1.active : p2.active,
        cooldownTimer: p1.cooldownTimer + (p2.cooldownTimer - p1.cooldownTimer) * clampedT
      };
    })
  };
}


function getSnapshotAtTime(frames: any[], targetTime: number) {
  if (!frames || frames.length === 0) return null;
  if (frames.length === 1 || targetTime <= frames[0].time) return frames[0];
  if (targetTime >= frames[frames.length - 1].time) return frames[frames.length - 1];
  let low = 0, high = frames.length - 1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    if (frames[mid].time <= targetTime) {
      if (mid === frames.length - 1 || frames[mid + 1].time > targetTime) {
        const f1 = frames[mid], f2 = frames[mid + 1];
        const dt = f2.time - f1.time;
        const fract = dt > 0 ? (targetTime - f1.time) / dt : 0;
        return interpolateSnapshots(f1, f2, fract);
      }
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return frames[0];
}
function playReplayEventSound(ev: any) {
  if (!ev) return;
  if (ev.type === "goal") {
    Me.playGoalExplosion();
  } else if (ev.type === "demo") {
    Me.playDemolition();
  } else if (ev.type === "boost_pickup") {
    Me.playBoostPadPickup(ev.padType === "big");
  } else if (ev.type === "mechanic") {
    const txt = (ev.text || "").toLowerCase();
    const stType = (ev.subType || "").toLowerCase();
    if (stType.includes("musty") || txt.includes("musty")) {
      Me.playMustyFlick();
    } else if (stType.includes("reset") || txt.includes("reset")) {
      Me.playFlipReset();
    } else if (stType.includes("pinch") || txt.includes("pinch")) {
      Me.playPinch();
    } else if (stType.includes("double") || txt.includes("double")) {
      Me.playDoubleTap();
    } else if (stType.includes("psycho") || txt.includes("psycho")) {
      Me.playPsycho();
    } else if (stType.includes("air_roll") || txt.includes("roll")) {
      Me.playAirRoll();
    } else {
      Me.playBallHit(1.6);
    }
  }
}

const ReplayMechanicBadge = ({ badge }: { badge: any }) => {
  if (!badge) return null;
  const isGoal = badge.type === "goal";
  const isDemo = badge.type === "demo";
  const isBlue = badge.team === "blue";

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-slate-950/95 border-2 border-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.5)] backdrop-blur-xl animate-fade-in select-none">
      <div className={`p-2 rounded-xl border ${isGoal ? "bg-amber-500/20 text-amber-400 border-amber-400/40" : isDemo ? "bg-rose-500/20 text-rose-400 border-rose-500/40" : "bg-sky-500/20 text-sky-400 border-sky-400/40"}`}>
        {isGoal ? <Trophy className="w-5 h-5 text-amber-400" /> : isDemo ? <Zap className="w-5 h-5 text-rose-400" /> : <Zap className="w-5 h-5 text-sky-400 animate-pulse" />}
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-sm md:text-base font-black text-white tracking-wider uppercase drop-shadow-[0_2px_8px_rgba(251,191,36,0.6)]">
            {badge.text}
          </span>
          {badge.speedKmh && (
            <span className="text-[11px] px-2 py-0.5 rounded bg-black/60 font-mono font-black text-amber-300 border border-amber-500/30">
              ⚡ {badge.speedKmh} KM/H
            </span>
          )}
        </div>
        <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
          <span className={isBlue ? "text-sky-400 font-bold" : "text-orange-400 font-bold"}>
            {badge.player || (isBlue ? "Blue Team" : "Orange Team")}
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">{isGoal ? "Goal Scored" : isDemo ? "Demolition" : "Mechanic Executed"}</span>
        </div>
      </div>
    </div>
  );
};

const ExportProgressModal = ({
  exportModal,
  onCancel,
}: {
  exportModal: {
    isOpen: boolean;
    format: "mp4" | "gif";
    progress: number;
    statusText: string;
    error: string | null;
  };
  onCancel: () => void;
}) => {
  if (!exportModal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none animate-fade-in">
      <div className="bg-slate-950 border-2 border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4 text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
              {exportModal.format === "mp4" ? <Video className="w-6 h-6" /> : <Film className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-black text-white text-base tracking-wide uppercase">
                {exportModal.format === "mp4" ? "Saving Video (MP4)" : "Saving Animated GIF"}
              </h3>
              <p className="text-xs text-slate-400">Zero-backend client rendering</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <rm className="w-5 h-5" />
          </button>
        </div>

        {exportModal.error ? (
          <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-sm flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{exportModal.error}</span>
          </div>
        ) : (
          <div className="flex flex-col gap-3 py-2">
            <div className="flex justify-between text-xs font-mono text-slate-300">
              <span className="truncate pr-2">{exportModal.statusText || "Processing frames..."}</span>
              <span className="font-bold text-amber-400">{exportModal.progress}%</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-sky-500 via-amber-400 to-emerald-400 transition-all duration-150"
                style={{ width: `${exportModal.progress}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 text-center">
              {exportModal.format === "mp4"
                ? "Recording 60/30 FPS stream into MP4/WebM container..."
                : "Capturing frames, extracting 256-color palette & compressing LZW stream..."}
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
          >
            {exportModal.progress >= 100 || exportModal.error ? "Close" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
};

const GoalReplayOverlay = ({
  replayUI,
  onSkip,
  onSpeedToggle,
  onTogglePause,
  onScrub,
  onStep,
  onRestart,
  onOpenStudio,
  onExportClip,
  isAudioMuted,
  onToggleAudioMute,
  activeBadge,
}: {
  replayUI: any;
  onSkip: () => void;
  onSpeedToggle: (speed: number) => void;
  onTogglePause?: () => void;
  onScrub?: (progress: number) => void;
  onStep?: (deltaSec: number) => void;
  onRestart?: () => void;
  onOpenStudio?: () => void;
  onExportClip?: (format: "mp4" | "gif") => void;
  isAudioMuted?: boolean;
  onToggleAudioMute?: () => void;
  activeBadge?: any;
}) => {
  const [isCleanView, setIsCleanView] = st.useState(false);
  if (!replayUI || !replayUI.active) return null;
  const isBlue = replayUI.info?.scoringTeam === "blue";
  const isSlowMo = (replayUI.speed || 1) < 1;

  if (isCleanView) {
    return (
      <div className="absolute inset-0 pointer-events-none z-40 flex flex-col justify-between select-none animate-fade-in">
        <ReplayMechanicBadge badge={activeBadge} />
        <div />
        <div className="p-4 flex items-center justify-end gap-2.5 pointer-events-auto">
          <button
            onClick={() => setIsCleanView(false)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950/90 hover:bg-slate-900 text-slate-200 border border-slate-700 text-xs font-bold transition cursor-pointer shadow-xl backdrop-blur-md active:scale-95"
            title="Restore replay timeline and controls"
          >
            <Eg className="w-3.5 h-3.5 text-sky-400" />
            <span>Show Controls</span>
          </button>
          <button
            onClick={onSkip}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs md:text-sm rounded-xl shadow-lg shadow-amber-500/40 transition active:scale-95 cursor-pointer border border-amber-300/60"
          >
            <span>Skip</span>
            <kbd className="px-1.5 py-0.5 rounded bg-amber-900/30 font-mono text-[11px] text-amber-950 border border-amber-900/20 font-bold">
              SPACE
            </kbd>
            <SkipForward className="w-4 h-4 text-slate-950 fill-current" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-40 flex flex-col justify-between select-none animate-fade-in">
      <ReplayMechanicBadge badge={activeBadge} />

      <div className="w-full bg-gradient-to-b from-black/95 via-black/85 to-transparent pt-2.5 pb-6 px-3 sm:px-6 flex items-center justify-between pointer-events-auto border-b border-white/10 gap-2 sm:gap-3">
        {/* Left: Replay Status & Scorer Pill */}
        <div className="flex items-center gap-2 shrink-0 flex-nowrap overflow-hidden">
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-red-600/30 border border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.5)] backdrop-blur-md shrink-0">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="text-[11px] sm:text-xs md:text-sm font-black uppercase tracking-wider sm:tracking-widest text-red-100 flex items-center gap-1">
              <Video className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden xs:inline">{isSlowMo ? "⚡ SLOW-MO" : "REPLAY"}</span>
            </span>
            <span className="ml-0.5 px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black text-[10px] sm:text-[11px] font-mono shadow">
              {replayUI.speed || 1}x
            </span>
          </div>

          {replayUI.info && (
            <div
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl border backdrop-blur-md shadow-lg shrink-0 ${
                isBlue
                  ? "bg-sky-950/90 border-sky-400/90 text-sky-200 shadow-sky-500/30"
                  : "bg-orange-950/90 border-orange-400/90 text-orange-200 shadow-orange-500/30"
              }`}
            >
              <span className="text-[10px] sm:text-xs font-semibold text-slate-300 hidden md:inline">Scored by:</span>
              <span className="text-xs sm:text-sm font-black tracking-tight truncate max-w-[90px] sm:max-w-[140px]">{replayUI.info.scorerName}</span>
              <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded-md bg-black/50 font-mono font-black text-amber-300 border border-amber-400/40">
                ⚡ {replayUI.info.speedKmh} <span className="hidden sm:inline">KM/H</span>
              </span>
            </div>
          )}
        </div>

        {/* Center: Clear zone reserved for the match scoreboard pod (0  0:42  3) */}
        <div className="hidden lg:flex flex-1 min-w-[80px] max-w-[260px] pointer-events-none" />

        {/* Right: Replay Action Toolbar (Compact, non-overlapping, sleek) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0 flex-nowrap">
          <button
            onClick={() => setIsCleanView(true)}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-bold transition cursor-pointer active:scale-95 shadow shrink-0"
            title="Hide UI for clean full-screen view"
          >
            <Eg className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden xl:inline">Clean</span>
          </button>

          {onExportClip && (
            <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-900/90 p-0.5 sm:p-1 rounded-xl border border-slate-700/80 backdrop-blur-md shadow-md shrink-0">
              <button
                onClick={() => onExportClip("mp4")}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-sky-600/30 hover:bg-sky-500/40 text-sky-300 border border-sky-500/50 text-[11px] sm:text-xs font-bold transition cursor-pointer active:scale-95 shadow"
                title="Save this goal replay as MP4 video"
              >
                <Download className="w-3 h-3" />
                <span>MP4</span>
              </button>
              <button
                onClick={() => onExportClip("gif")}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 text-[11px] sm:text-xs font-bold transition cursor-pointer active:scale-95 shadow"
                title="Save this goal replay as animated GIF"
              >
                <Film className="w-3 h-3" />
                <span>GIF</span>
              </button>
            </div>
          )}

          {onOpenStudio && (
            <button
              onClick={onOpenStudio}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-400/50 text-xs font-bold transition cursor-pointer active:scale-95 shadow-md shrink-0"
              title="Open full match timeline scrubber and clip editor"
            >
              <Film className="w-3.5 h-3.5 text-purple-300" />
              <span className="hidden xl:inline">Timeline</span>
            </button>
          )}

          {onToggleAudioMute && (
            <button
              onClick={onToggleAudioMute}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition cursor-pointer shrink-0"
              title={isAudioMuted ? "Unmute Replay Audio" : "Mute Replay Audio"}
            >
              {isAudioMuted ? <t2 className="w-3.5 h-3.5 text-rose-400" /> : <Ig className="w-3.5 h-3.5 text-sky-400" />}
            </button>
          )}

          <div className="flex items-center gap-0.5 bg-slate-900/90 p-0.5 sm:p-1 rounded-xl border border-slate-700/80 backdrop-blur-md shadow-md shrink-0">
            {[0.25, 0.5, 0.75, 1.0].map((s) => (
              <button
                key={s}
                onClick={() => onSpeedToggle(s)}
                className={`px-1 sm:px-1.5 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-bold font-mono transition cursor-pointer ${
                  (replayUI.speed || 1) === s
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 font-black"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <button
            onClick={onSkip}
            className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1 sm:py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs md:text-sm rounded-xl shadow-lg shadow-amber-500/40 transition active:scale-95 cursor-pointer border border-amber-300/60 shrink-0"
          >
            <span>Skip</span>
            <kbd className="hidden sm:inline px-1.5 py-0.5 rounded bg-amber-900/30 font-mono text-[10px] sm:text-[11px] text-amber-950 border border-amber-900/20 font-bold">
              SPACE
            </kbd>
            <SkipForward className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950 fill-current" />
          </button>
        </div>
      </div>

      <div className="w-full bg-gradient-to-t from-black/95 via-black/85 to-transparent pb-4 pt-8 px-8 flex flex-col gap-2.5 pointer-events-auto border-t border-white/10">
        <div className="flex items-center justify-between text-xs font-mono text-slate-300 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="font-bold flex items-center gap-1.5 text-amber-400">
              <Clock className="w-3.5 h-3.5" />
              {replayUI.currentSec || "0.0"}s / {replayUI.totalSec || "5.0"}s
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 font-sans border border-slate-700">
              {replayUI.isPaused
                ? "Replay Paused ⏸"
                : isSlowMo
                ? `Slow-Mo ${replayUI.speed}x ▶`
                : "Normal Speed (1.0x) ▶"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onRestart && (
              <button
                onClick={onRestart}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                title="Restart from beginning"
              >
                <im className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Restart</span>
              </button>
            )}
            {onStep && (
              <button
                onClick={() => onStep(-0.5)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                title="-0.5s step"
              >
                <Rewind className="w-3.5 h-3.5" />
                <span>-0.5s</span>
              </button>
            )}
            {onTogglePause && (
              <button
                onClick={onTogglePause}
                className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
              >
                {replayUI.isPaused ? (
                  <>
                    <Hg className="w-3.5 h-3.5" />
                    <span>Play</span>
                  </>
                ) : (
                  <>
                    <wg className="w-3.5 h-3.5" />
                    <span>Pause</span>
                  </>
                )}
              </button>
            )}
            {onStep && (
              <button
                onClick={() => onStep(0.5)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                title="+0.5s step"
              >
                <span>+0.5s</span>
                <FastForward className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="w-full relative py-1">
          <input
            type="range"
            min={0}
            max={1}
            step={0.005}
            value={Math.min(1, Math.max(0, replayUI.progress || 0))}
            onChange={(e) => {
              onScrub && onScrub(parseFloat(e.target.value));
            }}
            className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 hover:accent-amber-300 transition"
          />
        </div>

        <div className="flex justify-between items-center text-[10px] text-slate-400 font-sans">
          <span>0.0s (Setup)</span>
          <span className="text-slate-500 hidden sm:inline">
            [SPACE] Skip • [P] Pause • [← / →] Step Back / Forward • [R] Restart
          </span>
          <span className="text-rose-400 font-bold">GOAL! ⚽</span>
        </div>
      </div>
    </div>
  );
};

const MatchDvrStudio = ({
  isSpectator,
  dvrState,
  onTogglePlay,
  onScrub,
  onStep,
  onJump,
  onGoLive,
  onSpeedChange,
  onClose,
  availableSeconds,
  matchEvents = [],
  onSeekToTime,
  matchStartTime,
  clipRange,
  onSetClipIn,
  onSetClipOut,
  onQuickClip,
  onExportClip,
  isAudioMuted,
  onToggleAudioMute,
  activeBadge,
  isCollapsed: externalIsCollapsed,
  onToggleCollapse: externalOnToggleCollapse,
  autoCam = true,
  onToggleAutoCam,
}: {
  isSpectator: boolean;
  dvrState: {
    active: boolean;
    offsetSec: number;
    isPlaying: boolean;
    speed: number;
  };
  onTogglePlay: () => void;
  onScrub: (offsetSec: number) => void;
  onStep: (deltaSec: number) => void;
  onJump: (secondsAgo: number) => void;
  onGoLive: () => void;
  onSpeedChange: (speed: number) => void;
  onClose?: () => void;
  availableSeconds: number;
  matchEvents?: any[];
  onSeekToTime?: (targetTime: number) => void;
  matchStartTime?: number;
  clipRange?: { inSec: number; outSec: number };
  onSetClipIn?: () => void;
  onSetClipOut?: () => void;
  onQuickClip?: (seconds: number) => void;
  onExportClip?: (format: "mp4" | "gif") => void;
  isAudioMuted?: boolean;
  onToggleAudioMute?: () => void;
  activeBadge?: any;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  autoCam?: boolean;
  onToggleAutoCam?: () => void;
}) => {
  const isLive = !dvrState.active || dvrState.offsetSec <= 0.08;
  const totalSec = Math.max(1, availableSeconds || 1);
  const currentElapsedSec = Math.max(0, totalSec - dvrState.offsetSec);
  const isSlowMo = (dvrState.speed || 1) < 1;
  const [internalCollapsed, setInternalCollapsed] = st.useState(false);
  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalCollapsed;
  const toggleCollapse = externalOnToggleCollapse || (() => setInternalCollapsed((prev) => !prev));
  const [showClipTools, setShowClipTools] = st.useState(false);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 10);
    return `${m}:${s < 10 ? "0" : ""}${s}.${ms}`;
  };

  const selectedClipDuration = clipRange
    ? Math.max(0, Math.abs(clipRange.outSec - clipRange.inSec)).toFixed(1)
    : "0.0";

  // Collapsed compact mini HUD pill
  if (isCollapsed) {
    return (
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-40 select-none pointer-events-auto animate-fade-in">
        <ReplayMechanicBadge badge={activeBadge} />
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/90 backdrop-blur-xl border border-slate-700/80 shadow-[0_8px_32px_rgba(0,0,0,0.85)] text-slate-100">
          {isLive ? (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/25 border border-amber-500/50 text-amber-300 font-bold text-xs font-mono shadow-[0_0_15px_rgba(245,158,11,0.25)]">
              <Rewind className="w-3 h-3 text-amber-400" />
              <span>-{dvrState.offsetSec.toFixed(1)}s</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-amber-400/20 text-amber-200">{dvrState.speed}x</span>
            </div>
          )}

          <button
            onClick={onTogglePlay}
            className="p-1.5 rounded-full bg-sky-600 hover:bg-sky-500 text-white transition active:scale-95 cursor-pointer shadow"
            title={dvrState.isPlaying ? "Pause [Space]" : "Play [Space]"}
          >
            {dvrState.isPlaying ? <wg className="w-3.5 h-3.5" /> : <Hg className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => onStep(0.5)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            title="Step back 0.5s [←]"
          >
            <Rewind className="w-3 h-3" />
          </button>
          <button
            onClick={() => onStep(-0.5)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            title="Step forward 0.5s [→]"
          >
            <FastForward className="w-3 h-3" />
          </button>

          <span className="text-xs font-mono text-slate-300 px-1 font-semibold">
            {formatTime(currentElapsedSec)}
          </span>

          {!isLive && (
            <button
              onClick={onGoLive}
              className="px-2.5 py-1 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-[11px] font-black uppercase tracking-wider transition cursor-pointer active:scale-95 shadow-md shadow-red-600/40"
              title="Return to Live [L]"
            >
              LIVE
            </button>
          )}

          {onToggleAutoCam && (
            <button
              onClick={onToggleAutoCam}
              className={`p-1.5 rounded-full border transition active:scale-95 cursor-pointer ${
                autoCam ? "bg-purple-600/40 border-purple-400 text-purple-200" : "bg-slate-900 border-slate-700 text-slate-400"
              }`}
              title={autoCam ? "Auto Cam: ON [C]" : "Fixed Cam [C]"}
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="w-[1px] h-4 bg-slate-700 mx-0.5" />

          <button
            onClick={toggleCollapse}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-sky-500/20 hover:from-amber-500/30 hover:to-sky-500/30 text-amber-300 border border-amber-500/50 text-xs font-bold transition cursor-pointer active:scale-95 shadow"
            title="Expand Full Timeline & Clip Tools [T]"
          >
            <Eg className="w-3.5 h-3.5 text-amber-400" />
            <span>Show Timeline</span>
            <kbd className="px-1 py-0.2 text-[10px] bg-slate-900 border border-amber-500/40 rounded text-amber-200 font-mono">T</kbd>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer ml-0.5"
              title="Exit Replay"
            >
              <rm className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-40 w-[96%] max-w-5xl select-none pointer-events-auto animate-fade-in">
      <ReplayMechanicBadge badge={activeBadge} />

      <div className="bg-slate-950/95 backdrop-blur-xl border-2 border-slate-700/90 shadow-[0_12px_45px_rgba(0,0,0,0.85)] rounded-2xl p-3.5 flex flex-col gap-3 text-slate-100">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            {isLive ? (
              <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black text-xs tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>🔴 LIVE</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/25 border border-amber-500/60 text-amber-300 font-black text-xs tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse">
                <Rewind className="w-3.5 h-3.5 text-amber-400" />
                <span>⏪ {isSlowMo ? "SLOW-MO: -" : "REPLAY: -"}{dvrState.offsetSec.toFixed(1)}s</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  dvrState.isPlaying ? "bg-amber-500/40 text-amber-200" : "bg-slate-800 text-slate-300"
                }`}>
                  {dvrState.isPlaying ? `${dvrState.speed}x ▶` : "PAUSED ⏸"}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 bg-slate-900/80 px-3 py-1 rounded-xl border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>{formatTime(currentElapsedSec)}</span>
              <span className="text-slate-500">/</span>
              <span className="text-slate-400">{formatTime(totalSec)}</span>
            </div>

            <span className="text-xs font-bold text-slate-400 hidden lg:inline">
              {isSpectator ? "Bot Spectator DVR & Studio" : "Full Match Replay Theater"}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowClipTools((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 border ${
                showClipTools
                  ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30"
                  : "bg-slate-900 hover:bg-slate-800 text-amber-300 border-slate-700/80"
              }`}
              title={showClipTools ? "Hide Clip Exporter Tools" : "Open Clip Exporter Tools"}
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>{showClipTools ? "Hide Clip Tools" : "✂️ Clip Studio"}</span>
            </button>

            {onToggleAutoCam && (
              <button
                onClick={onToggleAutoCam}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 border ${
                  autoCam
                    ? "bg-purple-600/30 text-purple-200 border-purple-400/60 shadow-md shadow-purple-500/20"
                    : "bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-700/80"
                }`}
                title={autoCam ? "Auto Dynamic Cam: ON [C]" : "Fixed Arena Cam [C]"}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{autoCam ? "Auto Cam" : "Fixed Cam"}</span>
                <kbd className="px-1 py-0.2 text-[10px] bg-slate-800 border border-slate-700 rounded text-slate-400 font-mono">C</kbd>
              </button>
            )}

            <button
              onClick={toggleCollapse}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-bold transition cursor-pointer active:scale-95 shadow-sm"
              title="Hide Timeline & Clips to watch full screen [T]"
            >
              <Minimize className="w-3.5 h-3.5 text-sky-400" />
              <span>Hide Timeline</span>
              <kbd className="px-1 py-0.2 text-[10px] bg-slate-800 border border-slate-700 rounded text-slate-400 font-mono">T</kbd>
            </button>

            <div className="hidden sm:flex items-center gap-1">
              {[30, 10, 5].map((sec) => (
                <button
                  key={sec}
                  onClick={() => onJump(sec)}
                  className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-bold font-mono transition cursor-pointer active:scale-95"
                  title={`Rewind ${sec}s`}
                >
                  -{sec}s
                </button>
              ))}
            </div>

            {onToggleAudioMute && (
              <button
                onClick={onToggleAudioMute}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
                title={isAudioMuted ? "Unmute Replay Audio" : "Mute Replay Audio"}
              >
                {isAudioMuted ? <t2 className="w-4 h-4 text-rose-400" /> : <Ig className="w-4 h-4 text-sky-400" />}
              </button>
            )}

            <button
              onClick={onGoLive}
              disabled={isLive}
              className={`flex items-center gap-1.5 px-3.5 py-1 rounded-xl font-bold text-xs transition cursor-pointer ${
                isLive
                  ? "bg-slate-800/40 text-slate-500 border border-slate-800 cursor-default"
                  : "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-600/40 border border-red-400 active:scale-95"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isLive ? "bg-slate-500" : "bg-white animate-ping"}`} />
              <span>GO LIVE</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Exit DVR Studio"
              >
                <rm className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {showClipTools && (
          <div className="bg-slate-900/90 border border-amber-500/40 rounded-xl p-2.5 flex items-center justify-between gap-3 flex-wrap animate-fade-in shadow-inner">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase text-amber-300 flex items-center gap-1">
                <Scissors className="w-3.5 h-3.5" />
                Clip Exporter:
              </span>

              <button
                onClick={() => setShowClipTools(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Hide Clip Tools"
              >
                <rm className="w-3.5 h-3.5" />
              </button>

              {onSetClipIn && (
                <button
                  onClick={onSetClipIn}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-mono font-bold transition cursor-pointer active:scale-95"
                  title="Set clip start position to current playhead"
                >
                  [ Set IN ({clipRange ? formatTime(clipRange.inSec) : "0:00"})
                </button>
              )}

              {onSetClipOut && (
                <button
                  onClick={onSetClipOut}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-mono font-bold transition cursor-pointer active:scale-95"
                  title="Set clip end position to current playhead"
                >
                  Set OUT ] ({clipRange ? formatTime(clipRange.outSec) : "0:00"})
                </button>
              )}

              {onQuickClip && (
                <>
                  <button
                    onClick={() => onQuickClip(5)}
                    className="px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition cursor-pointer active:scale-95"
                  >
                    ⚡ Last 5s
                  </button>
                  <button
                    onClick={() => onQuickClip(10)}
                    className="px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition cursor-pointer active:scale-95"
                  >
                    ⚡ Last 10s
                  </button>
                </>
              )}

              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                Duration: <span className="text-amber-300 font-black">{selectedClipDuration}s</span>
              </span>
            </div>

            {onExportClip && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onExportClip("mp4")}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-black text-xs uppercase transition shadow-lg shadow-sky-600/30 active:scale-95 cursor-pointer border border-sky-400/40"
                  title="Export selected range as MP4 video"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save MP4</span>
                </button>
                <button
                  onClick={() => onExportClip("gif")}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase transition shadow-lg shadow-amber-500/30 active:scale-95 cursor-pointer border border-amber-400/50"
                  title="Export selected range as animated GIF"
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Save GIF</span>
                </button>
              </div>
            )}
          </div>
        )}

        <div className="relative flex flex-col gap-1.5 px-1 py-1">
          <div className="relative w-full h-4">
            {matchEvents &&
              matchEvents.map((ev: any, idx: number) => {
                if (!matchStartTime) return null;
                const evTimeSec = (ev.time - matchStartTime) / 1000;
                const pct = Math.max(0, Math.min(100, (evTimeSec / totalSec) * 100));
                const isGoal = ev.type === "goal";
                const isDemo = ev.type === "demo";

                return (
                  <button
                    key={ev.id || idx}
                    onClick={() => onSeekToTime && onSeekToTime(ev.time - 2500)}
                    title={`${ev.text || "Event"} by ${ev.player || "Player"}${ev.speedKmh ? ` (${ev.speedKmh} KM/H)` : ""}`}
                    style={{ left: `${pct}%` }}
                    className={`absolute -top-1 -translate-x-1/2 z-20 flex items-center justify-center transition cursor-pointer hover:scale-135 ${
                      isGoal
                        ? ev.team === "blue"
                          ? "w-6 h-6 rounded-full bg-sky-500 text-white text-[11px] shadow-[0_0_12px_rgba(56,189,248,0.8)] border border-white/60"
                          : "w-6 h-6 rounded-full bg-orange-500 text-white text-[11px] shadow-[0_0_12px_rgba(251,146,60,0.8)] border border-white/60"
                        : isDemo
                        ? "w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] shadow-[0_0_10px_rgba(244,63,94,0.7)]"
                        : "w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] shadow-[0_0_10px_rgba(251,191,36,0.7)]"
                    }`}
                  >
                    {isGoal ? "⚽" : isDemo ? "💥" : "⚡"}
                  </button>
                );
              })}
          </div>

          <div className="relative w-full h-4 flex items-center">
            {clipRange && showClipTools && (
              <div
                className="absolute top-0 bottom-0 bg-amber-400/30 border-x-2 border-amber-300 rounded pointer-events-none z-10 shadow-[0_0_10px_rgba(251,191,36,0.4)]"
                style={{
                  left: `${Math.min(100, Math.max(0, (Math.min(clipRange.inSec, clipRange.outSec) / totalSec) * 100))}%`,
                  width: `${Math.min(100, Math.max(0.5, (Math.abs(clipRange.outSec - clipRange.inSec) / totalSec) * 100))}%`,
                }}
              />
            )}

            <input
              type="range"
              min={0}
              max={totalSec}
              step={0.05}
              value={currentElapsedSec}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                const offset = Math.max(0, totalSec - val);
                onScrub(offset);
              }}
              className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400 hover:accent-sky-300 transition z-10"
            />
          </div>

          <div className="flex justify-between text-[10px] font-mono font-semibold text-slate-400 select-none">
            <span>0:00 (Start)</span>
            <span>{formatTime(totalSec * 0.25)}</span>
            <span>{formatTime(totalSec * 0.5)}</span>
            <span>{formatTime(totalSec * 0.75)}</span>
            <span className="text-emerald-400 font-bold">LIVE ({formatTime(totalSec)})</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={onTogglePlay}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition shadow-md cursor-pointer active:scale-95"
            >
              {dvrState.isPlaying ? (
                <>
                  <wg className="w-4 h-4" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Hg className="w-4 h-4" />
                  <span>{isLive ? "Review Replay" : "Play Replay"}</span>
                </>
              )}
            </button>

            <button
              onClick={() => onStep(0.5)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/70 text-xs font-bold transition flex items-center gap-1 cursor-pointer active:scale-95"
              title="Step back 0.5s"
            >
              <Rewind className="w-3.5 h-3.5" />
              <span>-0.5s</span>
            </button>

            <button
              onClick={() => onStep(-0.5)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/70 text-xs font-bold transition flex items-center gap-1 cursor-pointer active:scale-95"
              title="Step forward 0.5s"
            >
              <span>+0.5s</span>
              <FastForward className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium">Speed:</span>
            {[0.25, 0.5, 0.75, 1, 1.5].map((sp) => (
              <button
                key={sp}
                onClick={() => onSpeedChange(sp)}
                className={`px-2 py-1 rounded-md text-[11px] font-bold font-mono transition cursor-pointer ${
                  (dvrState.speed || 1) === sp
                    ? "bg-amber-500 text-slate-950 font-black shadow"
                    : "bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {sp}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

function r2(){
  const u=st.useRef(null),containerRef=st.useRef(null),replayHistoryRef=st.useRef([]),goalReplayRef=st.useRef(null),lastGoalInfoRef=st.useRef(null),[goalReplayUI,setGoalReplayUI]=st.useState(null),[dvr,setDvr]=st.useState({active:!1,offsetSec:0,isPlaying:!1,speed:1}),dvrRef=st.useRef(dvr);dvrRef.current=dvr;
  const matchEventsRef = st.useRef<any[]>([]);
  const matchStartTimeRef = st.useRef<number>(performance.now());
  const replayAudioTimeRef = st.useRef<number | null>(null);
  const [activeReplayBadge, setActiveReplayBadge] = st.useState<any>(null);
  const [isReplayAudioMuted, setIsReplayAudioMuted] = st.useState<boolean>(false);
  const [clipRange, setClipRange] = st.useState<{ inSec: number; outSec: number }>({ inSec: 0, outSec: 5 });
  const [isDvrCollapsed, setIsDvrCollapsed] = st.useState<boolean>(true);
  const [exportModal, setExportModal] = st.useState<{
    isOpen: boolean;
    format: "mp4" | "gif";
    progress: number;
    statusText: string;
    error: string | null;
  }>({
    isOpen: false,
    format: "mp4",
    progress: 0,
    statusText: "",
    error: null
  });
  const exportAbortRef = st.useRef<AbortController | null>(null);
  const [isFullscreen,setIsFullscreen]=st.useState(!!document.fullscreenElement);
  const toggleFullscreen=st.useCallback(()=>{if(!document.fullscreenElement){const el=containerRef.current||document.documentElement;el.requestFullscreen?el.requestFullscreen():(el as any).webkitRequestFullscreen&& (el as any).webkitRequestFullscreen();}else{document.exitFullscreen?document.exitFullscreen():(document as any).webkitExitFullscreen&&(document as any).webkitExitFullscreen();}},[]);
  st.useEffect(()=>{const onFullChange=()=>setIsFullscreen(!!document.fullscreenElement);document.addEventListener("fullscreenchange",onFullChange);document.addEventListener("webkitfullscreenchange",onFullChange);return()=>{document.removeEventListener("fullscreenchange",onFullChange);document.removeEventListener("webkitfullscreenchange",onFullChange);};},[]);
  const getInitialSettings = () => {
    let savedMode = "1v1";
    let savedPhysics = "rocket_league";
    let savedCar = "octane";
    let savedShowHitbox = false;
    let savedMap = "standard";
    let savedAutoCam = true;
    let savedTrajectory = false;
    let savedSteeringControl = "keyboard";
    let savedMobileControls = "auto";
    try {
      const gm = localStorage.getItem("rl_game_mode");
      if (gm && ["1v1", "2v2", "3v3", "training", "bot_vs_bot", "spectator_2v2", "spectator_3v3"].includes(gm)) savedMode = gm;
      const urlParams = new URLSearchParams(window.location.search);
      const urlMode = urlParams.get("mode");
      if (urlMode && ["1v1", "2v2", "3v3", "training", "bot_vs_bot", "spectator_2v2", "spectator_3v3"].includes(urlMode)) savedMode = urlMode;
      const p = localStorage.getItem("rl_physics_mode");
      if (p === "legacy" || p === "rocket_league") savedPhysics = p;
      const c = localStorage.getItem("rl_selected_car");
      if (c && CAR_DEFINITIONS[c]) savedCar = c;
      const hb = localStorage.getItem("rl_show_hitbox");
      if (hb === "true") savedShowHitbox = true;
      const sm = localStorage.getItem("rl_selected_map");
      if (sm && MAP_DEFINITIONS[sm]) savedMap = sm;
      const ac = localStorage.getItem("rl_auto_cam_v2");
      if (ac !== null) {
        savedAutoCam = ac === "true";
      } else {
        savedAutoCam = true;
      }
      const tr = localStorage.getItem("rl_show_trajectory");
      if (tr === "true") savedTrajectory = true;
      const sc = localStorage.getItem("rl_steering_control");
      if (sc === "mouse" || sc === "keyboard") savedSteeringControl = sc;
      const mc = localStorage.getItem("rl_mobile_controls");
      if (mc === "auto" || mc === "on" || mc === "off") savedMobileControls = mc;
    } catch (e) {}
    syncMapGlobals(savedMap);
    return {
      mode: savedMode,
      botDifficulty: "unfair",
      matchDuration: 180,
      arenaTheme: "classic",
      soundEnabled: !0,
      soundVolume: .5,
      showTrajectory: savedTrajectory,
      showMechanicAlerts: !0,
      jumpKey: "space",
      physicsMode: savedPhysics,
      selectedCar: savedCar,
      showHitbox: savedShowHitbox,
      selectedMap: savedMap,
      autoCam: savedAutoCam,
      steeringControl: savedSteeringControl,
      mobileControls: savedMobileControls
    };
  };
  const [f, r] = st.useState(getInitialSettings);
  const [pilotName, setPilotName] = st.useState<string>(() => {
    try {
      return (localStorage.getItem("rl_player_name") || "Player").slice(0, 12);
    } catch (e) {
      return "Player";
    }
  });
  const handleUpdatePilotName = st.useCallback((newName: string) => {
    const trimmed = newName.trim().slice(0, 12) || "Player";
    setPilotName(trimmed);
    try {
      localStorage.setItem("rl_player_name", trimmed);
    } catch (e) {}
    const myId = peerNetwork.isConnected ? peerNetwork.myPeerId : null;
    const myCar = (myId ? Gt.current.find((c: any) => c.id === myId) : null) || Gt.current.find((c: any) => !c.isBot);
    if (myCar) {
      myCar.name = trimmed;
    }
    if (peerNetwork.isConnected) {
      peerNetwork.updatePlayerName(trimmed);
    }
  }, []);
  const handleUpdateSettings = st.useCallback((newSettings: any) => {
    try {
      if (newSettings) {
        if (newSettings.physicsMode) {
          localStorage.setItem("rl_physics_mode", newSettings.physicsMode);
        }
        if (newSettings.selectedMap) {
          localStorage.setItem("rl_selected_map", newSettings.selectedMap);
          syncMapGlobals(newSettings.selectedMap);
        }
        if (newSettings.selectedCar) {
          localStorage.setItem("rl_selected_car", newSettings.selectedCar);
          const p1 = Gt.current.find((c: any) => !c.isBot);
          if (p1 && p1.carModel !== newSettings.selectedCar) {
            const def = CAR_DEFINITIONS[newSettings.selectedCar] || CAR_DEFINITIONS.octane;
            p1.carModel = newSettings.selectedCar;
            p1.hitboxClass = def.hitboxClass;
            p1.width = def.width;
            p1.height = def.height;
            p1.wheelbase = def.wheelbase;
            p1.wheelRadius = def.wheelRadius;
            if (p1.isGrounded && p1.surfaceType === "floor") {
              p1.y = k - def.height / 2;
            }
          }
        }
        if (typeof newSettings.showHitbox === "boolean") {
          localStorage.setItem("rl_show_hitbox", String(newSettings.showHitbox));
        }
        if (typeof newSettings.autoCam === "boolean") {
          localStorage.setItem("rl_auto_cam_v2", String(newSettings.autoCam));
        }
        if (typeof newSettings.showTrajectory === "boolean") {
          localStorage.setItem("rl_show_trajectory", String(newSettings.showTrajectory));
        }
        if (newSettings.steeringControl) {
          localStorage.setItem("rl_steering_control", newSettings.steeringControl);
        }
        if (newSettings.mobileControls) {
          localStorage.setItem("rl_mobile_controls", newSettings.mobileControls);
        }
      }
    } catch (e) {}
    r(newSettings);
  }, []);
  const toggleHitbox = st.useCallback(() => {
    r((prev: any) => {
      const nextHb = !prev.showHitbox;
      try {
        localStorage.setItem("rl_show_hitbox", String(nextHb));
      } catch (e) {}
      return { ...prev, showHitbox: nextHb };
    });
  }, []);
  const toggleTrajectory = st.useCallback(() => {
    r((prev: any) => {
      const nextTraj = !prev.showTrajectory;
      try {
        localStorage.setItem("rl_show_trajectory", String(nextTraj));
      } catch (e) {}
      return { ...prev, showTrajectory: nextTraj };
    });
  }, []);
  const toggleAutoCam = st.useCallback(() => {
    r((prev: any) => {
      const nextCam = prev.autoCam === false;
      try {
        localStorage.setItem("rl_auto_cam_v2", String(nextCam));
      } catch (e) {}
      return { ...prev, autoCam: nextCam };
    });
  }, []);
  const toggleSteeringControl = st.useCallback(() => {
    r((prev: any) => {
      const nextMode = (prev.steeringControl || "keyboard") === "mouse" ? "keyboard" : "mouse";
      try {
        localStorage.setItem("rl_steering_control", nextMode);
      } catch (e) {}
      return { ...prev, steeringControl: nextMode };
    });
  }, []);
  st.useEffect(() => {
    syncPhysicsGlobals(f.physicsMode || "rocket_league");
  }, [f.physicsMode]);
  st.useEffect(() => {
    syncMapGlobals(f.selectedMap || "standard");
  }, [f.selectedMap]);
  const [s,y]=st.useState(!1),[m,g]=st.useState(!1),[p,A]=st.useState("kickoff"),[C,z]=st.useState(0),[N,D]=st.useState(0),[X,tt]=st.useState(180),[I,U]=st.useState(!1),[Tt,at]=st.useState(3),[Ht,ot]=st.useState(null),[Lt,Ft]=st.useState(!1),[J,dt]=st.useState([]),Gt=st.useRef([]),ht=st.useRef($()),ne=st.useRef(Yh()),Yt=st.useRef([]),Te=st.useRef(performance.now()),re=st.useRef(3),Xt=st.useRef(0),[B,W]=st.useState(null),[mechAlerts,setMechAlerts]=st.useState([]),mechAlertCountRef=st.useRef(0),[isControlsOpen,setIsControlsOpen]=st.useState(!1),
  [isScoreboardOpen,setIsScoreboardOpen]=st.useState(!1),
  [isMatchHistoryOpen,setIsMatchHistoryOpen]=st.useState(!1),
  [isMultiplayerOpen, setIsMultiplayerOpen] = st.useState(!1),
  [multiplayerPing, setMultiplayerPing] = st.useState(0),
  [roomStateVersion, setRoomStateVersion] = st.useState(0);
  const [isGarageOpen, setIsGarageOpen] = st.useState(false);
  const [isCratesOpen, setIsCratesOpen] = st.useState(false);
  const [isMatchSetupOpen, setIsMatchSetupOpen] = st.useState(false);
  const [isRankedModalOpen, setIsRankedModalOpen] = st.useState(false);
  const [isRankProgressionOpen, setIsRankProgressionOpen] = st.useState(false);
  const [rankedMatchResult, setRankedMatchResult] = st.useState<any>(null);
  const [matchRewards, setMatchRewards] = st.useState<any>(null);
  const [isCurrentMatchRanked, setIsCurrentMatchRanked] = st.useState(false);
  const [currentRankedTrack, setCurrentRankedTrack] = st.useState<RankedTrack>("player");
  const [currentOpponentMmr, setCurrentOpponentMmr] = st.useState<number | undefined>(undefined);
  const [pilotMode, setPilotMode] = st.useState<PilotMode>("human");
  const [garageInitialTab, setGarageInitialTab] = st.useState<ItemSlot | "upgrade" | "bot_upgrade">("body");
  const [loadoutVersion, setLoadoutVersion] = st.useState(0);
  const lastSnapshotBroadcastRef = st.useRef(0);
  const hasSavedMatchRef = st.useRef(false);

  const [isQuickMenuOpen, setIsQuickMenuOpen] = st.useState(false);
  const touchInputRef = st.useRef<TouchInputState>({});
  const handleTouchInputChange = st.useCallback((state: TouchInputState) => {
    touchInputRef.current = state;
  }, []);
  const [isTouchDevice, setIsTouchDevice] = st.useState(() => {
    if (typeof window === "undefined") return false;
    return ("ontouchstart" in window) || (navigator.maxTouchPoints > 0) || (window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
  });
  const [isPortrait, setIsPortrait] = st.useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerHeight > window.innerWidth;
  });
  const [dismissPortrait, setDismissPortrait] = st.useState(false);

  st.useEffect(() => {
    const checkMobileEnv = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
      setIsTouchDevice(("ontouchstart" in window) || (navigator.maxTouchPoints > 0) || (window.matchMedia && window.matchMedia("(pointer: coarse)").matches));
    };
    window.addEventListener("resize", checkMobileEnv);
    window.addEventListener("orientationchange", checkMobileEnv);
    return () => {
      window.removeEventListener("resize", checkMobileEnv);
      window.removeEventListener("orientationchange", checkMobileEnv);
    };
  }, []);

  const showMobileControls = (f.mobileControls === "on") || (f.mobileControls !== "off" && isTouchDevice);

  st.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("room")) {
        setIsMultiplayerOpen(true);
      }
    } catch (e) {}
  }, []);

  const handleWatchPastReplay = st.useCallback(async (matchId: string) => {
    setIsMatchHistoryOpen(false);
    const replayData = await getMatchReplay(matchId);
    if (!replayData || !replayData.frames || replayData.frames.length === 0) {
      alert("Replay data not found or empty.");
      return;
    }
    replayHistoryRef.current = replayData.frames;
    matchEventsRef.current = replayData.matchEvents || [];
    const firstFrameTime = replayData.frames[0].time;
    const lastFrameTime = replayData.frames[replayData.frames.length - 1].time;
    const totalDurationSec = Math.max(1, (lastFrameTime - firstFrameTime) / 1000);

    g(false);
    A("playing");
    setDvr({
      active: true,
      offsetSec: totalDurationSec,
      isPlaying: true,
      speed: 1
    });
  }, []);function $(){return{x:Kt/2,y:k-Cu,vx:0,vy:0,radius:Cu,spin:0,isGoalScored:!1,lastTouchTeam:null,lastTouchPlayer:null,lastTouchTime:0,touchEffectTimer:0}}function bt(H: string, Z: string, playerCarModel: string = "octane", pMode: string = "human"){
  clearLobbyNames();
  const currentPilotName = (() => {
    try {
      return (localStorage.getItem("rl_player_name") || "Player").slice(0, 12);
    } catch (e) {
      return "Player";
    }
  })();
  const inv = getPlayerInventory();
  const activeLoadout = inv.loadout;
  const pDecal = ITEM_CATALOG[activeLoadout.decal];
  const pWheels = ITEM_CATALOG[activeLoadout.wheels];
  const pBoost = ITEM_CATALOG[activeLoadout.boost];
  const pTopper = ITEM_CATALOG[activeLoadout.topper];
  const pLoadout = { decal: pDecal, wheels: pWheels, boost: pBoost, topper: pTopper };

  const bUpgrades = getBotUpgrades();
  const botPilotName = bUpgrades.botName || "My Bot";

  if (peerNetwork.isConnected && peerNetwork.roomState && peerNetwork.roomState.status === "in_game") {
    const room = peerNetwork.roomState;
    const occupiedSlots = room.slots.filter((s: any) => s.isOccupied);
    if (occupiedSlots.length > 0) {
      const w: any[] = [];
      for (const slot of occupiedSlots) {
        const isBot = !!slot.isBot || slot.pilotMode === "bot";
        const carId = slot.peerId || slot.id;
        const isMySlot = slot.peerId === peerNetwork.myPeerId;
        const pName = isMySlot
          ? (slot.pilotMode === "bot" ? `🤖 ${botPilotName}` : (currentPilotName || slot.playerName || "Player"))
          : (slot.pilotMode === "bot" ? `🤖 ${slot.playerName} (Bot)` : (slot.playerName || (isBot ? "Bot" : "Player")));
        const team = slot.team;
        const diff = slot.botDifficulty || room.settings.botDifficulty || "ssl";
        const carModel = slot.carModel || "octane";
        const carLoadout = isMySlot ? pLoadout : undefined;
        const isPlayerBot = isMySlot && slot.pilotMode === "bot";
        w.push(ut(carId, pName, team, isBot, diff, carModel, carLoadout, isPlayerBot, isPlayerBot ? bUpgrades : undefined));
      }
      return w;
    }
  }
  const w = [];
  const pCar = playerCarModel || "octane";
  const isP1Bot = pMode === "place_bot";
  const p1DisplayName = isP1Bot ? `🤖 ${botPilotName}` : currentPilotName;

  if (H === "1v1") {
    w.push(ut("p1", p1DisplayName, "blue", isP1Bot, isP1Bot ? Z : "ssl", pCar, pLoadout, isP1Bot, isP1Bot ? bUpgrades : undefined));
    const q = Z === "unfair" ? getRandomMemeName("☠️") : Z === "ssl" ? getRandomMemeName("🔥") : getRandomMemeName();
    w.push(ut("b1", q, "orange", !0, Z, getBotCarModel(q)));
  } else if (H === "2v2") {
    w.push(ut("p1", p1DisplayName, "blue", isP1Bot, isP1Bot ? Z : "ssl", pCar, pLoadout, isP1Bot, isP1Bot ? bUpgrades : undefined));
    const tm = getRandomMemeName("🤝");
    w.push(ut("tm", tm, "blue", !0, Z, getBotCarModel(tm)));
    const q = Z === "unfair" ? getRandomMemeName("☠️") : Z === "ssl" ? getRandomMemeName("👾") : getRandomMemeName(),
          Wt = Z === "unfair" ? getRandomMemeName("👾") : getRandomMemeName();
    w.push(ut("b1", q, "orange", !0, Z, getBotCarModel(q)));
    w.push(ut("b2", Wt, "orange", !0, Z, getBotCarModel(Wt)));
  } else if (H === "3v3") {
    w.push(ut("p1", p1DisplayName, "blue", isP1Bot, isP1Bot ? Z : "ssl", pCar, pLoadout, isP1Bot, isP1Bot ? bUpgrades : undefined));
    const tm1 = getRandomMemeName("🤝");
    const tm2 = getRandomMemeName("⚡");
    w.push(ut("tm1", tm1, "blue", !0, Z, getBotCarModel(tm1)));
    w.push(ut("tm2", tm2, "blue", !0, Z, getBotCarModel(tm2)));
    const o1 = Z === "unfair" ? getRandomMemeName("☠️") : Z === "ssl" ? getRandomMemeName("🔥") : getRandomMemeName();
    const o2 = Z === "unfair" ? getRandomMemeName("👾") : getRandomMemeName();
    const o3 = Z === "unfair" ? getRandomMemeName("💀") : getRandomMemeName();
    w.push(ut("o1", o1, "orange", !0, Z, getBotCarModel(o1)));
    w.push(ut("o2", o2, "orange", !0, Z, getBotCarModel(o2)));
    w.push(ut("o3", o3, "orange", !0, Z, getBotCarModel(o3)));
  } else if (H === "training") {
    w.push(ut("p1", "Player", "blue", !1, "ssl", pCar, pLoadout));
  } else if (H === "bot_vs_bot") {
    const b1 = getRandomMemeName("🔵"), b2 = getRandomMemeName("🟠");
    w.push(ut("b1", b1, "blue", !0, "ssl", getBotCarModel(b1)));
    w.push(ut("b2", b2, "orange", !0, "ssl", getBotCarModel(b2)));
  } else if (H === "spectator_2v2") {
    const b1 = getRandomMemeName("🔵"), b2 = getRandomMemeName("🔷");
    const o1 = getRandomMemeName("🟠"), o2 = getRandomMemeName("🔶");
    w.push(ut("b1", b1, "blue", !0, "ssl", getBotCarModel(b1)));
    w.push(ut("b2", b2, "blue", !0, "ssl", getBotCarModel(b2)));
    w.push(ut("o1", o1, "orange", !0, "ssl", getBotCarModel(o1)));
    w.push(ut("o2", o2, "orange", !0, "ssl", getBotCarModel(o2)));
  } else if (H === "spectator_3v3") {
    const b1 = getRandomMemeName("🔵"), b2 = getRandomMemeName("🔷"), b3 = getRandomMemeName("⚡");
    const o1 = getRandomMemeName("🟠"), o2 = getRandomMemeName("🔶"), o3 = getRandomMemeName("🔥");
    w.push(ut("b1", b1, "blue", !0, "ssl", getBotCarModel(b1)));
    w.push(ut("b2", b2, "blue", !0, "ssl", getBotCarModel(b2)));
    w.push(ut("b3", b3, "blue", !0, "ssl", getBotCarModel(b3)));
    w.push(ut("o1", o1, "orange", !0, "ssl", getBotCarModel(o1)));
    w.push(ut("o2", o2, "orange", !0, "ssl", getBotCarModel(o2)));
    w.push(ut("o3", o3, "orange", !0, "ssl", getBotCarModel(o3)));
  }
  return w;
}function ut(H: string, Z: string, w: string, q: boolean, Wt: string = "ssl", carModelId: string = "octane", customLoadout?: any, isPlayerBot: boolean = false, botUpgrades?: any){const il=w==="blue",xt=il?At+280:Mt-280;const def=CAR_DEFINITIONS[carModelId]||CAR_DEFINITIONS.octane;const carWidth=def.width,carHeight=def.height;return{id:H,name:Z,team:w,isBot:q,isPlayerBot:!!isPlayerBot,botUpgrades:botUpgrades||(isPlayerBot?getBotUpgrades():undefined),botDifficulty:Wt,carModel:carModelId,hitboxClass:def.hitboxClass,wheelbase:def.wheelbase,wheelRadius:def.wheelRadius,customDecal:customLoadout?.decal,customWheels:customLoadout?.wheels,customBoost:customLoadout?.boost,customTopper:customLoadout?.topper,x:xt,y:k-carHeight/2,vx:0,vy:0,angle:il?0:Math.PI,facing:il?1:-1,airRollInverted:!1,angularVel:0,width:carWidth,height:carHeight,isGrounded:!0,surfaceNormal:{x:0,y:-1},surfaceType:"floor",boost:33,isBoosting:!1,isSupersonic:!1,supersonicTimer:0,canJump:!0,jumpCount:0,jumpHoldTimer:0,flipWindowTimer:0,isFlipping:!1,flipDirection:{x:0,y:0},flipTimer:0,isDemoed:!1,demoRespawnTimer:0,score:0,goals:0,saves:0,shots:0,demos:0,input:{steerLeft:!1,steerRight:!1,throttleForward:!1,throttleReverse:!1,pitchUp:!1,pitchDown:!1,jump:!1,boost:!1,handbrake:!1}}}const be=st.useCallback(()=>{
    ht.current=$(),Yt.current=[],Xt.current=0,ot(null),resetAutoCam(Kt/2,(Qt+k)/2);
    if(ne.current){
      ne.current.forEach((p:any)=>{p.active=!0;p.cooldownTimer=0;});
    }
    const spawnType=Math.random()<0.5?0:1;
    const blueCars = Gt.current.filter((c: any) => c.team === "blue");
    const orangeCars = Gt.current.filter((c: any) => c.team === "orange");

    const assignKickoff = (teamCars: any[], isBlue: boolean) => {
      const count = teamCars.length;
      teamCars.forEach((H: any, idx: number) => {
        H.vx=0,H.vy=0,H.angularVel=0,H.isSupersonic=!1,H.isFlipping=!1,H.jumpCount=0,H.boost=Lt?100:33,H.isDemoed=!1;
        H.isGrounded=!0,H.surfaceType="floor",H.surfaceNormal={x:0,y:-1},H.airRollInverted=!1;
        H.angle=isBlue?0:Math.PI;
        H.facing=isBlue?1:-1;
        H.y=k-(H.height||ks)/2;
        H.input={steerLeft:!1,steerRight:!1,throttleForward:!1,throttleReverse:!1,pitchUp:!1,pitchDown:!1,airRollLeft:!1,airRollRight:!1,jump:!1,boost:!1,handbrake:!1};

        let spawnX=isBlue?At+260:Mt-260;
        if (count === 1) {
          const dist = spawnType === 0 ? 340 : 480;
          spawnX = isBlue ? (Kt / 2 - dist) : (Kt / 2 + dist);
        } else if (count === 2) {
          if (idx === 0) {
            spawnX = isBlue ? (Kt / 2 - 360) : (Kt / 2 + 360);
          } else {
            spawnX = isBlue ? (At + 240) : (Mt - 240);
          }
        } else if (count >= 3) {
          if (idx === 0) {
            spawnX = isBlue ? (Kt / 2 - 320) : (Kt / 2 + 320);
          } else if (idx === 1) {
            spawnX = isBlue ? (Kt / 2 - 560) : (Kt / 2 + 560);
          } else {
            spawnX = isBlue ? (At + 200) : (Mt - 200);
          }
        }
        H.x = spawnX;

        if(H.isBot||H.botState){
          H.botState={
            action:"kickoff",
            dribbleTime:0,
            airDribbleTouches:0,
            targetPos:{x:Kt/2,y:k-90},
            interceptTime:0,
            mustyStage:"idle",
            mustyTimer:0,
            jumpSeq:{stage:"idle",timer:0,type:"aerial",dodgeX:0,dodgeY:0},
            kickoffStrat:null,
            kickoffFlipDone:false
          };
        }
      });
    };

    assignKickoff(blueCars, true);
    assignKickoff(orangeCars, false);

    f.mode!=="training"?(A("kickoff"),re.current=3.2,at(3),Me.playCountdown(!1)):(A("playing"),at(null));
  },[Lt,f.mode]),ie=st.useCallback(()=>{
    const isMulti = peerNetwork.isConnected && peerNetwork.roomState?.status === "in_game";
    const targetMap = isMulti ? (peerNetwork.roomState?.settings.arena || f.selectedMap || "standard") : (f.selectedMap || "standard");
    const targetDuration = isMulti ? (peerNetwork.roomState?.settings.duration || f.matchDuration) : f.matchDuration;
    const targetPhysics = isMulti ? (peerNetwork.roomState?.settings.physicsMode || f.physicsMode || "rocket_league") : (f.physicsMode || "rocket_league");
    syncMapGlobals(targetMap);
    syncPhysicsGlobals(targetPhysics);
    Gt.current = bt(f.mode, f.botDifficulty, f.selectedCar || "octane", pilotMode);
    ne.current = Yh(targetMap);
    z(0);
    D(0);
    tt(targetDuration);
    U(!1);
    replayHistoryRef.current = [];
    matchEventsRef.current = [];
    matchStartTimeRef.current = performance.now();
    replayAudioTimeRef.current = null;
    setActiveReplayBadge(null);
    goalReplayRef.current = null;
    setGoalReplayUI(null);
    setDvr({ active: !1, offsetSec: 0, isPlaying: !1, speed: 1 });
    be();
  },[f.mode,f.botDifficulty,f.matchDuration,f.selectedCar,f.selectedMap,f.physicsMode,pilotMode,loadoutVersion,be]);
const getAvailableDvrSeconds=st.useCallback(()=>{const hist=replayHistoryRef.current;if(hist.length<2)return 0;return Math.max(0,(hist[hist.length-1].time-hist[0].time)/1000);},[]),skipGoalReplay=st.useCallback(()=>{goalReplayRef.current=null,setGoalReplayUI(null),setActiveReplayBadge(null),replayAudioTimeRef.current=null,I?A("ended"):(X<=0&&f.matchDuration<9e3?(C===N?(U(!0),tt(0),be()):A("ended")):be())},[I,X,f.matchDuration,be,C,N]),handleGoalReplayTogglePause=st.useCallback(()=>{if(!goalReplayRef.current)return;goalReplayRef.current.isPaused=!goalReplayRef.current.isPaused,setGoalReplayUI((prev:any)=>prev?{...prev,isPaused:goalReplayRef.current.isPaused}:null)},[]),handleGoalReplayScrub=st.useCallback((prog:number)=>{if(!goalReplayRef.current)return;const targetSec=Math.max(0,Math.min(goalReplayRef.current.durationSec,prog*goalReplayRef.current.durationSec));goalReplayRef.current.currentSec=targetSec;replayAudioTimeRef.current=goalReplayRef.current.startTime+targetSec*1000;setGoalReplayUI((prev:any)=>prev?{...prev,progress:prog,currentSec:targetSec.toFixed(1)}:null)},[]),handleGoalReplayStep=st.useCallback((deltaSec:number)=>{if(!goalReplayRef.current)return;const nextSec=Math.max(0,Math.min(goalReplayRef.current.durationSec,goalReplayRef.current.currentSec+deltaSec));goalReplayRef.current.currentSec=nextSec,goalReplayRef.current.isPaused=!0;replayAudioTimeRef.current=goalReplayRef.current.startTime+nextSec*1000;setGoalReplayUI((prev:any)=>prev?{...prev,isPaused:!0,currentSec:nextSec.toFixed(1),progress:goalReplayRef.current.durationSec>0?nextSec/goalReplayRef.current.durationSec:0}:null)},[]),handleGoalReplayRestart=st.useCallback(()=>{if(!goalReplayRef.current)return;goalReplayRef.current.currentSec=0;replayAudioTimeRef.current=goalReplayRef.current.startTime;setGoalReplayUI((prev:any)=>prev?{...prev,progress:0,currentSec:"0.0"}:null)},[]),handleGoalReplaySpeed=st.useCallback((sp:number)=>{if(!goalReplayRef.current)return;goalReplayRef.current.speed=sp,goalReplayRef.current.isManualSpeed=!0,setGoalReplayUI((prev:any)=>prev?{...prev,speed:sp}:null)},[]),handleDvrScrub=st.useCallback((offsetSec:number)=>{const maxSec=Math.max(1,getAvailableDvrSeconds()),clamped=Math.max(0,Math.min(maxSec,offsetSec));const hist=replayHistoryRef.current;if(hist.length>0){replayAudioTimeRef.current=hist[hist.length-1].time-clamped*1000;}setDvr(prev=>({...prev,active:clamped>0.05,offsetSec:clamped,isPlaying:!1}))},[getAvailableDvrSeconds]),handleDvrJump=st.useCallback((secondsAgo:number)=>{const maxSec=Math.max(1,getAvailableDvrSeconds()),target=Math.min(maxSec,secondsAgo);const hist=replayHistoryRef.current;if(hist.length>0){replayAudioTimeRef.current=hist[hist.length-1].time-target*1000;}setDvr(prev=>({...prev,active:!0,offsetSec:target,isPlaying:!0}))},[getAvailableDvrSeconds]),handleDvrStep=st.useCallback((deltaSec:number)=>{const maxSec=Math.max(1,getAvailableDvrSeconds());setDvr(prev=>{const nextOffset=Math.max(0,Math.min(maxSec,prev.offsetSec+deltaSec));const hist=replayHistoryRef.current;if(hist.length>0){replayAudioTimeRef.current=hist[hist.length-1].time-nextOffset*1000;}return{...prev,active:nextOffset>0.05,offsetSec:nextOffset,isPlaying:!1}})},[getAvailableDvrSeconds]),handleDvrTogglePlay=st.useCallback(()=>{setDvr(prev=>{if(!prev.active||prev.offsetSec<=0.05){const maxSec=Math.max(1,getAvailableDvrSeconds());return{...prev,active:!0,offsetSec:Math.min(10,maxSec),isPlaying:!0}}return{...prev,isPlaying:!prev.isPlaying}})},[getAvailableDvrSeconds]),handleDvrGoLive=st.useCallback(()=>{setDvr({active:!1,offsetSec:0,isPlaying:!1,speed:1}),replayAudioTimeRef.current=null,m&&g(!1)},[m]),handleDvrSpeedChange=st.useCallback((speed:number)=>{setDvr(prev=>({...prev,speed}))},[]),handleSeekToTime=st.useCallback((targetTime:number)=>{const hist=replayHistoryRef.current;if(!hist||hist.length===0)return;const lastTime=hist[hist.length-1].time,maxSec=Math.max(1,(lastTime-hist[0].time)/1000),offset=Math.max(0,Math.min(maxSec,(lastTime-targetTime)/1000));replayAudioTimeRef.current=targetTime;setDvr(prev=>({...prev,active:!0,offsetSec:offset,isPlaying:!0}))},[]),handleSetClipIn=st.useCallback(()=>{const totalSec=Math.max(1,getAvailableDvrSeconds()),currentElapsed=Math.max(0,totalSec-dvrRef.current.offsetSec);setClipRange(prev=>({...prev,inSec:parseFloat(currentElapsed.toFixed(1))}))},[getAvailableDvrSeconds]),handleSetClipOut=st.useCallback(()=>{const totalSec=Math.max(1,getAvailableDvrSeconds()),currentElapsed=Math.max(0,totalSec-dvrRef.current.offsetSec);setClipRange(prev=>({...prev,outSec:parseFloat(currentElapsed.toFixed(1))}))},[getAvailableDvrSeconds]),handleQuickClip=st.useCallback((seconds:number)=>{const totalSec=Math.max(1,getAvailableDvrSeconds()),currentElapsed=Math.max(0,totalSec-dvrRef.current.offsetSec);setClipRange({inSec:Math.max(0,parseFloat((currentElapsed-seconds).toFixed(1))),outSec:parseFloat(currentElapsed.toFixed(1))})},[getAvailableDvrSeconds]),handleExportClip=st.useCallback(async(format:"mp4"|"gif",customInSec?:number,customOutSec?:number)=>{const hist=replayHistoryRef.current;if(!hist||hist.length<3){alert("No replay frames recorded yet.");return;}const totalSec=Math.max(1,(hist[hist.length-1].time-hist[0].time)/1000);let startSec=customInSec!==undefined?customInSec:clipRange.inSec,endSec=customOutSec!==undefined?customOutSec:clipRange.outSec;if(Math.abs(endSec-startSec)<0.4){startSec=Math.max(0,endSec-5);}const minSec=Math.min(startSec,endSec),maxSec=Math.min(totalSec,Math.max(startSec,endSec)),startTime=hist[0].time+minSec*1000,endTime=hist[0].time+maxSec*1000,slice=hist.filter((s:any)=>s.time>=startTime&&s.time<=endTime);if(slice.length<3){alert("Please select a range with at least 1 second of replay.");return;}const abortController=new AbortController();exportAbortRef.current=abortController;setExportModal({isOpen:!0,format,progress:0,statusText:"Preparing frames...",error:null});try{const renderFrame=(ctx:CanvasRenderingContext2D,snap:any)=>{kv(ctx,snap.cars,snap.ball,snap.boostPads||ne.current,snap.particles||[],{showTrajectory:!1,arenaTheme:f.arenaTheme,showMechanicAlerts:f.showMechanicAlerts!==false,showHitbox:f.showHitbox,isReplay:!0,replayTime:snap.time,matchEvents:matchEventsRef.current})};if(format==="mp4"){await exportClipAsVideo({snapshots:slice,renderFrame,width:1280,height:704,fps:30,signal:abortController.signal,onProgress:(pct,statusText)=>{setExportModal(prev=>({...prev,progress:pct,statusText}))}})}else{await exportClipAsGif({snapshots:slice,renderFrame,width:640,height:352,fps:20,signal:abortController.signal,onProgress:(pct,statusText)=>{setExportModal(prev=>({...prev,progress:pct,statusText}))}})}setExportModal(prev=>({...prev,progress:100,statusText:"Export complete! File downloaded."}));setTimeout(()=>{setExportModal(prev=>({...prev,isOpen:!1}))},1500);}catch(err:any){if(abortController.signal.aborted){setExportModal(prev=>({...prev,isOpen:!1}))}else{setExportModal(prev=>({...prev,error:err.message||"Export failed."}))}}},[clipRange,f.arenaTheme,f.showMechanicAlerts,f.showHitbox]),handleExportGoalClip=st.useCallback((format:"mp4"|"gif")=>{if(!goalReplayRef.current||!goalReplayRef.current.frames)return;const frames=goalReplayRef.current.frames,hist=replayHistoryRef.current;if(frames.length<3||hist.length<2)return;const inSec=Math.max(0,(frames[0].time-hist[0].time)/1000),outSec=Math.max(0,(frames[frames.length-1].time-hist[0].time)/1000);handleExportClip(format,inSec,outSec);},[handleExportClip]),handleCancelExport=st.useCallback(()=>{if(exportAbortRef.current){exportAbortRef.current.abort();}setExportModal(prev=>({...prev,isOpen:!1}))},[]),handleOpenStudioFromGoalReplay=st.useCallback(()=>{const gr=goalReplayRef.current,hist=replayHistoryRef.current;if(hist.length>0){const lastTime=hist[hist.length-1].time,targetTime=gr?(gr.startTime+(gr.currentSec||0)*1000):lastTime,offset=Math.max(0,(lastTime-targetTime)/1000);setDvr({active:!0,offsetSec:offset,isPlaying:!1,speed:1});}goalReplayRef.current=null,setGoalReplayUI(null);},[]),handleOpenStudioFromAnywhere=st.useCallback(()=>{const maxSec=Math.max(1,getAvailableDvrSeconds());setIsDvrCollapsed(false);setDvr({active:!0,offsetSec:Math.min(15,maxSec),isPlaying:!0,speed:1});},[getAvailableDvrSeconds]);
st.useEffect(()=>{ie()},[ie]);
st.useEffect(()=>{
  peerNetwork.onRemoteInput = (peerId: string, input: any) => {
    let car = Gt.current.find((c: any) => c.id === peerId);
    if (!car && peerNetwork.roomState) {
      const slot = peerNetwork.roomState.slots.find((s: any) => s.peerId === peerId);
      if (slot) {
        car = Gt.current.find((c: any) => c.id === slot.id || c.name === slot.playerName);
      }
    }
    if (car && !car.isBot) {
      car.input = {
        steerLeft: !!input.steerLeft,
        steerRight: !!input.steerRight,
        throttleForward: !!input.throttleForward,
        throttleReverse: !!input.throttleReverse,
        pitchUp: !!input.pitchUp,
        pitchDown: !!input.pitchDown,
        airRollLeft: !!input.airRollLeft,
        airRollRight: !!input.airRollRight,
        jump: !!input.jump,
        boost: !!input.boost,
        handbrake: !!input.handbrake,
        mouseAim: !!input.mouseAim,
        mouseTargetAngle: input.mouseTargetAngle
      };
    }
  };

  peerNetwork.onSnapshotReceived = (snapshot: any) => {
    if (peerNetwork.role !== "client") return;

    if (snapshot.matchTime !== undefined) tt(snapshot.matchTime);
    if (snapshot.blueScore !== undefined) z(snapshot.blueScore);
    if (snapshot.orangeScore !== undefined) D(snapshot.orangeScore);
    if (snapshot.isOvertime !== undefined) U(snapshot.isOvertime);
    if (snapshot.kickoffCountdown !== undefined) at(snapshot.kickoffCountdown);
    if (snapshot.matchState && snapshot.matchState !== p) {
      A(snapshot.matchState);
    }
    if (snapshot.goalInfo) {
      ot(snapshot.goalInfo);
    }

    const b = ht.current;
    if (b && snapshot.ball) {
      const dist = Math.hypot(snapshot.ball.x - b.x, snapshot.ball.y - b.y);
      if (dist > 180) {
        b.x = snapshot.ball.x;
        b.y = snapshot.ball.y;
      } else {
        b.x += (snapshot.ball.x - b.x) * 0.55;
        b.y += (snapshot.ball.y - b.y) * 0.55;
      }
      b.vx = snapshot.ball.vx;
      b.vy = snapshot.ball.vy;
      b.radius = snapshot.ball.radius || Cu;
      b.spin = snapshot.ball.spin || 0;
      b.touchEffectTimer = snapshot.ball.touchEffectTimer || 0;
      b.lastTouchTeam = snapshot.ball.lastTouchTeam;
      b.lastTouchPlayer = snapshot.ball.lastTouchPlayer;
    }

    if (snapshot.cars && snapshot.cars.length > 0) {
      const myId = peerNetwork.myPeerId;
      for (const snapCar of snapshot.cars) {
        let car = Gt.current.find((c: any) => c.id === snapCar.id);
        if (!car) {
          car = ut(snapCar.id, snapCar.name, snapCar.team, snapCar.isBot, "ssl", snapCar.carModel || "octane");
          Gt.current.push(car);
        }
        car.name = snapCar.name;
        car.team = snapCar.team;
        car.score = snapCar.score;
        car.goals = snapCar.goals;
        car.isDemoed = snapCar.isDemoed;
        car.boost = snapCar.boost;
        car.isBoosting = snapCar.isBoosting;
        car.isSupersonic = snapCar.isSupersonic;
        car.isGrounded = snapCar.isGrounded;
        if (snapCar.surfaceNormal) car.surfaceNormal = snapCar.surfaceNormal;
        if (snapCar.surfaceType) car.surfaceType = snapCar.surfaceType;
        if (snapCar.customDecal !== undefined) car.customDecal = snapCar.customDecal;
        if (snapCar.customWheels !== undefined) car.customWheels = snapCar.customWheels;
        if (snapCar.customBoost !== undefined) car.customBoost = snapCar.customBoost;
        if (snapCar.customTopper !== undefined) car.customTopper = snapCar.customTopper;
        car.isFlipping = snapCar.isFlipping;

        if (car.id === myId) {
          const d = Math.hypot(snapCar.x - car.x, snapCar.y - car.y);
          if (d > 120) {
            car.x = snapCar.x;
            car.y = snapCar.y;
            car.vx = snapCar.vx;
            car.vy = snapCar.vy;
            car.angle = snapCar.angle;
          } else {
            car.x += (snapCar.x - car.x) * 0.45;
            car.y += (snapCar.y - car.y) * 0.45;
            car.vx = snapCar.vx;
            car.vy = snapCar.vy;
            car.angle += (snapCar.angle - car.angle) * 0.45;
          }
        } else {
          const d = Math.hypot(snapCar.x - car.x, snapCar.y - car.y);
          if (d > 180) {
            car.x = snapCar.x;
            car.y = snapCar.y;
          } else {
            car.x += (snapCar.x - car.x) * 0.65;
            car.y += (snapCar.y - car.y) * 0.65;
          }
          car.vx = snapCar.vx;
          car.vy = snapCar.vy;
          car.angle = snapCar.angle;
          car.facing = snapCar.facing;
        }
      }
    }

    if (snapshot.boostPads && ne.current) {
      for (const snapPad of snapshot.boostPads) {
        const pad = ne.current.find((b: any) => b.id === snapPad.id);
        if (pad) {
          pad.active = snapPad.active;
          pad.cooldownTimer = snapPad.cooldownTimer;
        }
      }
    }
  };

  peerNetwork.onGameStart = (roomState: any) => {
    setIsMultiplayerOpen(false);
    const targetMap = roomState.settings?.arena || "standard";
    const targetPhysics = roomState.settings?.physicsMode || "rocket_league";
    syncMapGlobals(targetMap);
    syncPhysicsGlobals(targetPhysics);
    r((prev: any) => ({
      ...prev,
      physicsMode: targetPhysics,
      selectedMap: targetMap,
      mode: roomState.settings?.mode || prev.mode
    }));
    ie();
  };

  peerNetwork.onReturnToLobby = () => {
    setIsMultiplayerOpen(true);
  };

  peerNetwork.onRematch = () => {
    ie();
  };
}, [ie, p, r]);
  st.useEffect(() => {
    if (p === "ended" && !hasSavedMatchRef.current && f.mode !== "training") {
      hasSavedMatchRef.current = true;
      const currentCars = Gt.current || [];
      const allPlayers = currentCars.map((c: any) => ({
        id: c.id,
        name: c.name,
        team: c.team,
        isBot: !!c.isBot,
        carModel: c.carModel || "octane",
        score: Math.round(c.score || 0),
        goals: c.goals || 0,
        saves: c.saves || 0,
        shots: c.shots || 0,
        demos: c.demos || 0
      }));

      let mvp = { name: "Player", team: "blue" as const, score: 0 };
      for (const pl of allPlayers) {
        if (pl.score >= mvp.score) {
          mvp = { name: pl.name, team: pl.team, score: pl.score };
        }
      }

      const mapDef = activeMapDef || MAP_DEFINITIONS[f.selectedMap || "standard"] || MAP_DEFINITIONS.standard;
      const matchMeta: MatchHistoryMetadata = {
        id: "match_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
        timestamp: Date.now(),
        dateStr: new Date().toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }),
        gameMode: f.mode || "1v1",
        arenaId: mapDef.id,
        arenaName: mapDef.name,
        blueScore: C,
        orangeScore: N,
        winnerTeam: C > N ? "blue" : N > C ? "orange" : "draw",
        isOvertime: I,
        durationSec: Math.round(Math.max(1, f.matchDuration - X)),
        mvp,
        players: allPlayers,
        frameCount: replayHistoryRef.current.length
      };

      saveMatchToHistory(matchMeta, replayHistoryRef.current, matchEventsRef.current);

      const p1Car = currentCars.find((c: any) => c.id === "p1" || !c.isBot) || currentCars[0];
      const isPlayerWin = (p1Car?.team === "blue" && C > N) || (p1Car?.team === "orange" && N > C);
      const masteryRewards = recordMatchMastery(p1Car?.carModel || f.selectedCar || "octane", {
        goals: p1Car?.goals || 0,
        saves: p1Car?.saves || 0,
        shots: p1Car?.shots || 0,
        isWin: isPlayerWin,
        isMvp: mvp.name === p1Car?.name
      });
      setMatchRewards(masteryRewards);

      if (isCurrentMatchRanked) {
        const rResult = currentRankedTrack === "bot"
          ? processBotRankedMatchEnd(isPlayerWin, currentOpponentMmr)
          : processRankedMatchEnd(isPlayerWin, currentOpponentMmr);
        setRankedMatchResult(rResult);
        setIsRankProgressionOpen(true);
      }
    } else if (p === "kickoff" || p === "playing") {
      hasSavedMatchRef.current = false;
    }
  }, [p, C, N, I, f.mode, f.selectedMap, f.matchDuration, f.selectedCar, X, isCurrentMatchRanked, currentRankedTrack, currentOpponentMmr]),st.useEffect(()=>{Me.setMuted(!f.soundEnabled),Me.setVolume(f.soundVolume)},[f.soundEnabled,f.soundVolume]);const Se=st.useRef({});st.useEffect(()=>{const H=xt=>{if(xt.target.tagName==="INPUT")return;const et=xt.code.toLowerCase(),Et=xt.key.toLowerCase();if(et==="keyf"||Et==="f"||Et==="а"){if(p!=="goal_replay"&&!m){xt.preventDefault(),toggleFullscreen();return}}if(et==="keym"||Et==="m"||Et==="ь"){xt.preventDefault(),toggleSteeringControl();return}if(et==="tab"||Et==="tab"){xt.preventDefault();setIsScoreboardOpen(prev=>!prev);return;}if(et==="keyh"||Et==="h"||Et==="р"){xt.preventDefault(),toggleHitbox();return}
      if(et==="keyc"||Et==="c"||Et==="с"){xt.preventDefault(),toggleAutoCam();return}
      if(et==="keyy"||Et==="y"||Et==="н"){xt.preventDefault(),toggleTrajectory();return}(["space","arrowup","arrowdown","arrowleft","arrowright"].includes(et)||[" ","arrowup","arrowdown","arrowleft","arrowright"].includes(Et))&&xt.preventDefault(),Se.current[et]=!0,Se.current[Et]=!0;if((p==="goal_replay"||goalReplayRef.current)){if(et==="space"||Et===" "||Et==="escape"){xt.preventDefault(),skipGoalReplay();return}if(xt.key==="ArrowLeft"||xt.key==="["){xt.preventDefault(),handleGoalReplayStep(-0.5);return}if(xt.key==="ArrowRight"||xt.key==="]"){xt.preventDefault(),handleGoalReplayStep(0.5);return}if(et==="keyp"||Et==="p"||Et==="з"){xt.preventDefault(),handleGoalReplayTogglePause();return}if(et==="keyr"||Et==="r"||Et==="к"){xt.preventDefault(),handleGoalReplayRestart();return}}      const isSpectatorMode = f.mode === "bot_vs_bot" || f.mode.startsWith("spectator");
      if(isSpectatorMode||m||dvrRef.current.active){
        if(xt.key==="ArrowLeft"||xt.key==="["){xt.preventDefault(),handleDvrStep(0.5);return}
        if(xt.key==="ArrowRight"||xt.key==="]"){xt.preventDefault(),handleDvrStep(-0.5);return}
        if(et==="keyl"||Et==="l"||Et==="д"){handleDvrGoLive();return}
        if(et==="keyt"||Et==="t"||Et==="е"){xt.preventDefault();setIsDvrCollapsed(prev=>!prev);return;}
        if((et==="space"||Et===" ")&&(isSpectatorMode||dvrRef.current.active)){xt.preventDefault(),handleDvrTogglePlay();return}
      }if(et==="keyv"||Et==="v"||Et==="м"||et==="backquote"||Et==="`"||Et==="~"){xt.preventDefault();handleOpenStudioFromAnywhere();return;}if(et==="keyp"||Et==="p"||Et==="з"){g(rt=>!rt);return;}if(f.mode==="training"){const c=xt.code,k=xt.key;if(c==="KeyR"||k==="r"||k==="R"||k==="к"||k==="К"){xt.preventDefault();R();return;}if(c==="Digit1"||c==="Numpad1"||k==="1"||k==="!"){xt.preventDefault();R();return;}if(c==="Digit2"||c==="Numpad2"||k==="2"||k==="@"){xt.preventDefault();V();return;}if(c==="Digit3"||c==="Numpad3"||k==="3"||k==="#"){xt.preventDefault();Q();return;}if(c==="Digit4"||c==="Numpad4"||k==="4"||k==="$"){xt.preventDefault();vt();return;}if(c==="Digit5"||c==="Numpad5"||k==="5"||k==="%"){xt.preventDefault();onMustySetup();return;}if(c==="Digit6"||c==="Numpad6"||k==="6"||k==="^"){xt.preventDefault();onFlipResetSetup();return;}if(c==="Digit7"||c==="Numpad7"||k==="7"||k==="&"){xt.preventDefault();onPinchSetup();return;}if(c==="Digit8"||c==="Numpad8"||k==="8"||k==="*"){xt.preventDefault();onDoubleTapSetup();return;}if(c==="Digit9"||c==="Numpad9"||k==="9"||k==="("){xt.preventDefault();onPsychoSetup();return;}if(c==="Digit0"||c==="Numpad0"||k==="0"||k===")"){xt.preventDefault();onCeilingSetup();return;}}else if(et==="keyr"||Et==="r"||Et==="к"){ie();return;}},Z=xt=>{const et=xt.code.toLowerCase(),Et=xt.key.toLowerCase();Se.current[et]=!1,Se.current[Et]=!1},w=xt=>{xt.button===0&&(Se.current.mouse0=!0),xt.button===2&&(Se.current.mouse2=!0)},q=xt=>{xt.button===0&&(Se.current.mouse0=!1),xt.button===2&&(Se.current.mouse2=!1)},onCm=xt=>{xt.preventDefault()},Wt=()=>{Se.current={}};const onMouseMove=(ev:MouseEvent)=>{const cvs=u.current;if(!cvs)return;const rect=cvs.getBoundingClientRect();mouseScreenPos.x=ev.clientX-rect.left;mouseScreenPos.y=ev.clientY-rect.top;mouseScreenPos.active=true;};window.addEventListener("mousemove",onMouseMove);window.addEventListener("keydown",H),window.addEventListener("keyup",Z),window.addEventListener("mousedown",w),window.addEventListener("mouseup",q),window.addEventListener("contextmenu",onCm),window.addEventListener("blur",Wt);const il=setInterval(()=>{const myId = peerNetwork.isConnected ? peerNetwork.myPeerId : null;const xt=(myId?Gt.current.find(wn=>wn.id===myId):null)||Gt.current.find(wn=>!wn.isBot);if(!xt)return;const et=Se.current,
  Et=!!(et.keyw||et.w||et.ц||et.arrowup),
  rt=!!(et.keys||et.s||et.ы||et.arrowdown),
  de=!!(et.keya||et.a||et.ф||et.arrowleft),
  nt=!!(et.keyd||et.d||et.в||et.arrowright),
  isQ=!!(et.keyq||et.q||et.й),
  isE=!!(et.keye||et.e||et.у),
  Rt=f.jumpKey==="rmb"?!!(et.mouse2||et.space||et[" "]):!!(et.space||et[" "]),
  We=!!(et.shiftleft||et.shiftright||et.shift||et.keyj||et.j||et.о||et.mouse0),
  Ge=!!(et.keyk||et.k||et.л||rt),
  Dn=Rt;

const tIn = touchInputRef.current;
const touchSteerLeft = !!tIn?.steerLeft;
const touchSteerRight = !!tIn?.steerRight;
const touchThrottleForward = !!tIn?.throttleForward;
const touchThrottleReverse = !!tIn?.throttleReverse;
const touchPitchUp = !!tIn?.pitchUp;
const touchPitchDown = !!tIn?.pitchDown;
const touchAirRollLeft = !!tIn?.airRollLeft;
const touchAirRollRight = !!tIn?.airRollRight;
const touchJump = !!tIn?.jump;
const touchBoost = !!tIn?.boost;
const touchHandbrake = !!tIn?.handbrake;

let Be=de || touchSteerLeft,
  Cn=nt || touchSteerRight,
  Ga=Et || touchThrottleForward,
  Rn=rt || touchThrottleReverse,
  Du=Et || touchPitchUp || touchThrottleForward,
  ml=rt || touchPitchDown || touchThrottleReverse;
const airRollLeftCombined = isQ || touchAirRollLeft;
const airRollRightCombined = isE || touchAirRollRight;
const jumpCombined = Dn || touchJump;
const boostCombined = We || touchBoost;
const handbrakeCombined = Ge || touchHandbrake;

const isMouseMode = (f.steeringControl || "keyboard") === "mouse";
let mouseTargetAngle: number | undefined = undefined;
if (isMouseMode && mouseScreenPos.active) {
  const { offsetX, offsetY, scale } = activeCameraTransform;
  if (scale > 0) {
    mouseWorldPos.x = (mouseScreenPos.x - offsetX) / scale;
    mouseWorldPos.y = (mouseScreenPos.y - offsetY) / scale;
    mouseWorldPos.active = true;
    const dx = mouseWorldPos.x - xt.x;
    const dy = mouseWorldPos.y - xt.y;
    if (Math.hypot(dx, dy) > 10) {
      mouseTargetAngle = Math.atan2(dy, dx);
    }
  }
}
if(p==="goal_scored"||p==="goal_replay"||(p==="kickoff"&&re.current>0)){xt.input={steerLeft:!1,steerRight:!1,throttleForward:!1,throttleReverse:!1,pitchUp:!1,pitchDown:!1,airRollLeft:!1,airRollRight:!1,jump:!1,boost:!1,handbrake:!1,mouseAim:!1,mouseTargetAngle:undefined};}else{xt.input={steerLeft:Be,steerRight:Cn,throttleForward:Ga,throttleReverse:Rn,pitchUp:Du,pitchDown:ml,airRollLeft:airRollLeftCombined,airRollRight:airRollRightCombined,jump:jumpCombined,boost:boostCombined,handbrake:handbrakeCombined,mouseAim:isMouseMode,mouseTargetAngle:mouseTargetAngle},Lt&&(xt.boost=100);if(peerNetwork.isConnected&&peerNetwork.role==="client"){peerNetwork.sendInput(xt.input);}}},1e3/60);return()=>{window.removeEventListener("keydown",H),window.removeEventListener("keyup",Z),window.removeEventListener("mousedown",w),window.removeEventListener("mouseup",q),window.removeEventListener("contextmenu",onCm),window.removeEventListener("mousemove",onMouseMove),window.removeEventListener("blur",Wt),clearInterval(il)}},[f.mode,ie,Lt,toggleFullscreen,toggleHitbox,toggleTrajectory,toggleSteeringControl,p,m,f.jumpKey,f.steeringControl]),st.useEffect(()=>{let H;const Z=w=>{var il;const q=(w-Te.current)/1e3;Te.current=w;const Wt=(il=u.current)==null?void 0:il.getContext("2d");if(dvrRef.current.active&&dvrRef.current.offsetSec>0.05){if(dvrRef.current.isPlaying&&q>0){const nextSec=Math.max(0,dvrRef.current.offsetSec-q*dvrRef.current.speed);dvrRef.current.offsetSec=nextSec,nextSec<=0.05&&(dvrRef.current.isPlaying=!1,dvrRef.current.offsetSec=0,dvrRef.current.active=!1),setDvr({...dvrRef.current})}const hist=replayHistoryRef.current;if(hist.length>0&&Wt){const lastTime=hist[hist.length-1].time,targetTime=lastTime-dvrRef.current.offsetSec*1000,snap=getSnapshotAtTime(hist,targetTime);snap&&kv(Wt,snap.cars,snap.ball,snap.boostPads||ne.current,snap.particles||[],{showTrajectory:!1,arenaTheme:f.arenaTheme,showMechanicAlerts:f.showMechanicAlerts!==false,showHitbox:f.showHitbox,isReplay:!0,replayTime:targetTime,matchEvents:matchEventsRef.current,autoCam:f.autoCam!==false});if(dvrRef.current.isPlaying&&q>0){const prevT=replayAudioTimeRef.current;if(prevT!==null&&targetTime>prevT&&targetTime-prevT<1200){for(const ev of matchEventsRef.current){if(ev.time>prevT&&ev.time<=targetTime){if(!isReplayAudioMuted)playReplayEventSound(ev);if(ev.type==="goal"){setActiveReplayBadge(ev);setTimeout(()=>setActiveReplayBadge((cur:any)=>(cur?.id===ev.id?null:cur)),1800);}}}}replayAudioTimeRef.current=targetTime;}}H=requestAnimationFrame(Z);return}if(p==="goal_replay"&&goalReplayRef.current){const gr=goalReplayRef.current;let dynamicSpeed=gr.speed||1;if(!gr.isManualSpeed){const goalTimeSec=Math.max(0.6,gr.durationSec-1.2),timeToGoal=goalTimeSec-gr.currentSec;if(timeToGoal<=1.6&&timeToGoal>=-0.2){const progress=(1.6-timeToGoal)/1.8,slowDip=Math.sin(progress*Math.PI);dynamicSpeed=Math.max(0.36,1.0-slowDip*0.64)}else{dynamicSpeed=1.0}}if(!gr.isPaused&&q>0){gr.currentSec+=q*dynamicSpeed}if(gr.currentSec>=gr.durationSec){goalReplayRef.current=null,setGoalReplayUI(null),setActiveReplayBadge(null),replayAudioTimeRef.current=null,I?A("ended"):(X<=0&&f.matchDuration<9e3?(C===N?(U(!0),tt(0),be()):A("ended")):be())}else{const targetTime=gr.startTime+gr.currentSec*1000,snap=getSnapshotAtTime(gr.frames,targetTime);snap&&Wt&&kv(Wt,snap.cars,snap.ball,snap.boostPads||ne.current,snap.particles||[],{showTrajectory:!1,arenaTheme:f.arenaTheme,showMechanicAlerts:f.showMechanicAlerts!==false,showHitbox:f.showHitbox,isReplay:!0,replayTime:targetTime,matchEvents:matchEventsRef.current,autoCam:f.autoCam!==false});if(!gr.isPaused&&q>0){const prevT=replayAudioTimeRef.current;if(prevT!==null&&targetTime>prevT&&targetTime-prevT<1200){for(const ev of matchEventsRef.current){if(ev.time>prevT&&ev.time<=targetTime){if(!isReplayAudioMuted)playReplayEventSound(ev);if(ev.type==="goal"){setActiveReplayBadge(ev);setTimeout(()=>setActiveReplayBadge((cur:any)=>(cur?.id===ev.id?null:cur)),1800);}}}}replayAudioTimeRef.current=targetTime;}const nowTs=performance.now();if(!gr._lastUiUpdate||nowTs-gr._lastUiUpdate>35){const displaySpeed=!gr.isManualSpeed?Number(dynamicSpeed.toFixed(2)):(gr.speed||1);gr._lastUiUpdate=nowTs,setGoalReplayUI((prev:any)=>prev?{...prev,isPaused:!!gr.isPaused,speed:displaySpeed,currentSec:gr.currentSec.toFixed(1),progress:gr.durationSec>0?gr.currentSec/gr.durationSec:0}:null)}}H=requestAnimationFrame(Z);return}if(!m&&q>0){if(p==="kickoff"){re.current-=q;const nt=Math.ceil(re.current);nt>0&&nt<=3?Tt!==nt&&(at(nt),Me.playCountdown(!1)):re.current<=0&&(at(0),Me.playCountdown(!0),A("playing"),setTimeout(()=>at(null),800))}const isPlaying=p==="playing"||(p==="kickoff"&&re.current<=0);const xt=Gt.current,et=ht.current;isPlaying&&f.mode!=="training"&&f.matchDuration<9e3&&(I?tt(nt=>nt+q):X>0?tt(nt=>Math.max(0,nt-q)):et.y+et.radius>=k-3&&(C===N?(U(!0),tt(0),be()):A("ended")));for(const nt of xt)if(nt.isBot&&isPlaying){if(!peerNetwork.isConnected||peerNetwork.role==="host"){const Rt=xt.filter(Be=>Be.team!==nt.team),We=xt.filter(Be=>Be.team===nt.team&&Be.id!==nt.id),Ge=Yv(nt,et,Rt,We,nt.botDifficulty||f.botDifficulty,q,ne.current);Ge.chatMessage&&x(Ge.chatMessage,nt.name,nt.team);}}(isPlaying||p==="goal_scored")&&(replayHistoryRef.current.push({time:performance.now(),ball:{x:et.x,y:et.y,vx:et.vx,vy:et.vy,radius:et.radius,spin:et.spin,touchEffectTimer:et.touchEffectTimer,trail:et.trail?[...et.trail]:[],lastTouchTeam:et.lastTouchTeam,lastTouchPlayer:et.lastTouchPlayer},cars:xt.map(c=>({id:c.id,name:c.name,team:c.team,isBot:c.isBot,botDifficulty:c.botDifficulty,carModel:c.carModel||"octane",hitboxClass:c.hitboxClass||"Octane",wheelbase:c.wheelbase||40,wheelRadius:c.wheelRadius||8.5,x:c.x,y:c.y,vx:c.vx,vy:c.vy,angle:c.angle,airRollInverted:!!c.airRollInverted,facing:c.facing||1,width:c.width,height:c.height,isGrounded:!!c.isGrounded,surfaceNormal:c.surfaceNormal?{x:c.surfaceNormal.x,y:c.surfaceNormal.y}:(c.isGrounded?{x:0,y:-1}:null),surfaceType:c.surfaceType||(c.isGrounded?"floor":"air"),customDecal:c.customDecal,customWheels:c.customWheels,customBoost:c.customBoost,customTopper:c.customTopper,boost:c.boost,isBoosting:c.isBoosting,isSupersonic:c.isSupersonic,isFlipping:c.isFlipping,hasFlipReset:c.hasFlipReset,isDemoed:c.isDemoed,demoRespawnTimer:c.demoRespawnTimer,score:c.score,goals:c.goals,activeMechanicAlerts:(c.activeMechanicAlerts||[]).map((a:any)=>({...a}))})),boostPads:(ne.current||[]).map((p:any)=>({id:p.id,x:p.x,y:p.y,type:p.type,active:p.active,cooldownTimer:p.cooldownTimer,respawnTime:p.respawnTime})),particles:(Yt.current||[]).slice(-35).map((pt:any)=>({...pt}))}));while(replayHistoryRef.current.length>40000){replayHistoryRef.current.shift()}if(p==="goal_scored"){Xt.current-=q;if(Xt.current<=0){const hist=replayHistoryRef.current;if(hist.length>=10){const lastTime=hist[hist.length-1].time,targetDurationMs=7000,startTime=lastTime-targetDurationMs;let slice=hist.filter((item:any)=>item.time>=startTime);if(slice.length<5)slice=hist.slice(-300);const actualStart=slice[0].time,actualEnd=slice[slice.length-1].time,durationSec=Math.max(1,(actualEnd-actualStart)/1000);goalReplayRef.current={frames:slice,startTime:actualStart,endTime:actualEnd,durationSec,currentSec:0,speed:1,isPaused:!1,info:lastGoalInfoRef.current,_lastUiUpdate:0},setGoalReplayUI({active:!0,progress:0,speed:1,isPaused:!1,info:lastGoalInfoRef.current,currentSec:"0.0",totalSec:durationSec.toFixed(1)}),ot(null),A("goal_replay")}else{I?A("ended"):(X<=0&&f.matchDuration<9e3?(C===N?(U(!0),tt(0),be()):A("ended")):be())}}}
const isMultiClient = peerNetwork.isConnected && peerNetwork.role === "client";
if(!isMultiClient){
const Et=isPlaying||p==="goal_scored",rt=jv(xt,et,ne.current,q,!Et&&p!=="goal_scored",f.physicsMode);rt.mechanicEvents&&rt.mechanicEvents.length>0&&(()=>{for(const ev of rt.mechanicEvents){matchEventsRef.current.push({id:"mech_"+ev.id+"_"+Date.now(),time:performance.now(),type:"mechanic",subType:ev.type,text:ev.text,player:ev.player,team:ev.team,color:ev.color,speedKmh:ev.speedKmh});const alertId=ev.id;mechAlertCountRef.current++;const hideTimeout=mechAlertCountRef.current>=3?1300:mechAlertCountRef.current===2?1750:2600;setMechAlerts(prev=>[...prev.slice(-3),ev]);setTimeout(()=>{mechAlertCountRef.current=Math.max(0,mechAlertCountRef.current-1);setMechAlerts(prev=>prev.filter(it=>it.id!==alertId))},hideTimeout)}})();rt.boostPickups&&rt.boostPickups.length>0&&matchEventsRef.current.push(...rt.boostPickups);rt.newParticles.length>0&&Yt.current.push(...rt.newParticles);for(let nt=Yt.current.length-1;nt>=0;nt--){const Rt=Yt.current[nt];Rt.x+=Rt.vx*q,Rt.y+=Rt.vy*q,Rt.life-=q,Rt.life<=0&&Yt.current.splice(nt,1)}for(const nt of rt.demoEvents){
  matchEventsRef.current.push({id:"demo_"+Date.now()+"_"+Math.random(),time:performance.now(),type:"demo",text:"DEMOLITION",player:nt.killer?.name||"Player",team:nt.killer?.team||"blue",color:"#f43f5e",victim:nt.victim?.name});
  if(nt.killer&&nt.killer.isBot){
    const Rt=["💥 BOOM!","Calculated.","Demolition!","EZ","Nice car!","Savage!"];
    const We=Rt[Math.floor(Math.random()*Rt.length)];
    x(We,nt.killer.name,nt.killer.team);
  }
}
if(rt.goalScored&&isPlaying){
  const nt=rt.goalScored;
  matchEventsRef.current.push({id:"goal_"+Date.now(),time:performance.now(),type:"goal",text:"GOAL",player:nt.scorerName,team:nt.scoringTeam,color:nt.scoringTeam==="blue"?"#38bdf8":"#fb923c",speedKmh:nt.speedKmh});
  A("goal_scored");
  Xt.current=1.2;
  lastGoalInfoRef.current=nt;
  nt.scoringTeam==="blue"?z(Ge=>Ge+1):D(Ge=>Ge+1);
  ot({scoringTeam:nt.scoringTeam,scorerName:nt.scorerName,speedKmh:nt.speedKmh});
  const scorerCar = xt.find(c => c.name === nt.scorerName);
  if (scorerCar) {
    scorerCar.goals = (scorerCar.goals || 0) + 1;
    scorerCar.score = (scorerCar.score || 0) + 100;
  }
  const goalX=et.x,goalY=et.y;
  for(const car of xt){
    const dx=car.x-goalX,dy=car.y-goalY,dist=Math.hypot(dx,dy)||1;
    const blastSpeed=Math.max(750,1650*Math.max(0,1-dist/(Kt*0.85)));
    const nx=dx/dist,ny=(dy/dist)-0.45;
    car.vx=nx*blastSpeed,car.vy=ny*blastSpeed-240,car.angularVel=(Math.random()-0.5)*16,car.isGrounded=!1,car.surfaceNormal=null;
    car.input={steerLeft:!1,steerRight:!1,throttleForward:!1,throttleReverse:!1,pitchUp:!1,pitchDown:!1,airRollLeft:!1,airRollRight:!1,jump:!1,boost:!1,handbrake:!1};
  }
  for(let pIdx=0;pIdx<45;pIdx++){
    const angle=Math.random()*Math.PI*2,pSpeed=220+Math.random()*550;
    Yt.current.push({id:++On,x:goalX,y:goalY,vx:Math.cos(angle)*pSpeed,vy:Math.sin(angle)*pSpeed,life:0.8+Math.random()*0.6,maxLife:1.4,color:nt.scoringTeam==="blue"?(Math.random()>.5?"#38bdf8":"#0284c7"):(Math.random()>.5?"#fb923c":"#ea580c"),size:10+Math.random()*14,type:"demo_explosion"});
  }
  const lastTouchCar=Gt.current.find(c=>c.name===nt.scorerName);
  if(lastTouchCar&&lastTouchCar.isBot){
    let senderName=nt.scorerName;
    let senderTeam=lastTouchCar.team;
    if(lastTouchCar.team!==nt.scoringTeam){
      const ownGoalChats=["Close one!","OMG!","No problem.","Savage!"];
      x(ownGoalChats[Math.floor(Math.random()*ownGoalChats.length)],senderName,senderTeam);
    }else{
      const Rt=["EZ!","Calculated.","What a save!","Too easy!","Savage!"];
      const We=Rt[Math.floor(Math.random()*Rt.length)];
      x(We,senderName,senderTeam);
    }
  }
}
}
if(peerNetwork.isConnected&&peerNetwork.role==="host"&&peerNetwork.roomState?.status==="in_game"){
  const nowTs=performance.now();
  if(!lastSnapshotBroadcastRef.current||nowTs-lastSnapshotBroadcastRef.current>=15){
    lastSnapshotBroadcastRef.current=nowTs;
    peerNetwork.broadcastSnapshot({
      time:nowTs,
      matchTime:X,
      matchState:p as any,
      kickoffCountdown:Tt,
      isOvertime:I,
      blueScore:C,
      orangeScore:N,
      ball:{
        x:et.x,
        y:et.y,
        vx:et.vx,
        vy:et.vy,
        radius:et.radius,
        spin:et.spin,
        touchEffectTimer:et.touchEffectTimer,
        lastTouchTeam:et.lastTouchTeam,
        lastTouchPlayer:et.lastTouchPlayer
      },
      cars:xt.map((c:any)=>({
        id:c.id,
        name:c.name,
        team:c.team,
        isBot:!!c.isBot,
        carModel:c.carModel||"octane",
        hitboxClass:c.hitboxClass||"Octane",
        x:c.x,
        y:c.y,
        vx:c.vx,
        vy:c.vy,
        angle:c.angle,
        facing:c.facing||1,
        airRollInverted:!!c.airRollInverted,
        boost:c.boost,
        isBoosting:!!c.isBoosting,
        isSupersonic:!!c.isSupersonic,
        isGrounded:!!c.isGrounded,
        surfaceNormal:c.surfaceNormal?{x:c.surfaceNormal.x,y:c.surfaceNormal.y}:(c.isGrounded?{x:0,y:-1}:null),
        surfaceType:c.surfaceType||(c.isGrounded?"floor":"air"),
        customDecal:c.customDecal,
        customWheels:c.customWheels,
        customBoost:c.customBoost,
        customTopper:c.customTopper,
        isFlipping:!!c.isFlipping,
        isDemoed:!!c.isDemoed,
        score:c.score||0,
        goals:c.goals||0,
        saves:c.saves||0,
        shots:c.shots||0,
        demos:c.demos||0
      })),
      boostPads:(ne.current||[]).map((b:any)=>({
        id:b.id,
        active:!!b.active,
        cooldownTimer:b.cooldownTimer||0
      })),
      goalInfo:Ht
    });
  }
}
const myIdCar=peerNetwork.isConnected?peerNetwork.myPeerId:null;
const de=(myIdCar?xt.find(nt=>nt.id===myIdCar):null)||xt.find(nt=>!nt.isBot)||xt[0];
W(de?{...de}:null)}Wt&&kv(Wt,Gt.current,ht.current,ne.current,Yt.current,{showTrajectory:f.showTrajectory,arenaTheme:f.arenaTheme,showMechanicAlerts:f.showMechanicAlerts!==false,showHitbox:f.showHitbox,autoCam:f.autoCam!==false,physicsMode:f.physicsMode||activePhysicsMode,steeringControl:f.steeringControl||"keyboard"}),H=requestAnimationFrame(Z)};return H=requestAnimationFrame(Z),()=>cancelAnimationFrame(H)},[m,p,Tt,I,X,f,C,N,be]);const x=(H:string,Z:string=pilotName,w:string="blue")=>{const foundCar=Gt.current?.find(c=>c.name===Z);const actualTeam=foundCar?foundCar.team:w;const q={id:Math.random().toString(),sender:Z,team:actualTeam,text:H,timestamp:Date.now()};dt(Wt=>[...Wt.slice(-6),q]);if(peerNetwork.isConnected){peerNetwork.sendChat(H,Z,actualTeam);}},R=()=>{ht.current.x=Kt/2,ht.current.y=k-Cu,ht.current.vx=0,ht.current.vy=0},
V=()=>{
  const H=Gt.current.find(Z=>!Z.isBot);
  if(!H)return;
  const isLegacy=(f.physicsMode||activePhysicsMode)==="legacy";
  ht.current.x=H.x;
  ht.current.y=isLegacy?(H.y-H.height/2-Cu-4):(H.y-H.height/2-Cu);
  ht.current.vx=H.vx;
  ht.current.vy=0;
},
Q=()=>{
  const H=Gt.current.find(Z=>!Z.isBot);
  if(!H)return;
  const isLegacy=(f.physicsMode||activePhysicsMode)==="legacy";
  ht.current.x=H.x+(H.team==="blue"?(isLegacy?400:350):-(isLegacy?400:350));
  ht.current.y=k-Cu;
  ht.current.vx=(H.x-ht.current.x)*(isLegacy?1.5:1.1);
  ht.current.vy=isLegacy?-650:-450;
},
vt=()=>{
  const isLegacy=(f.physicsMode||activePhysicsMode)==="legacy";
  ht.current.x=Kt/2;
  ht.current.y=200;
  ht.current.vx=isLegacy?150:100;
  ht.current.vy=isLegacy?-300:-200;
};
const onMustySetup=()=>{
  const H=Gt.current.find(Z=>!Z.isBot);
  if(!H)return;
  const isLegacy=(f.physicsMode||activePhysicsMode)==="legacy";
  const isB=H.team==="blue";
  H.x=Kt/2;
  H.y=650;
  H.vx=isB?(isLegacy?240:200):-(isLegacy?240:200);
  H.vy=isLegacy?-60:-45;
  H.angle=isB?.3:Math.PI-.3;
  H.facing=isB?1:-1;
  H.airRollInverted=!1;
  H.boost=100;
  H.isGrounded=!1;
  ht.current.x=H.x-(isB?18:-18);
  ht.current.y=H.y-42;
  ht.current.vx=H.vx;
  ht.current.vy=H.vy;
},
onFlipResetSetup=()=>{
  const H=Gt.current.find(Z=>!Z.isBot);
  if(!H)return;
  const isLegacy=(f.physicsMode||activePhysicsMode)==="legacy";
  const isB=H.team==="blue";
  ht.current.x=Kt/2;
  ht.current.y=480;
  ht.current.vx=isLegacy?40:30;
  ht.current.vy=isLegacy?-40:-30;
  H.x=Kt/2-(isB?(isLegacy?120:100):-(isLegacy?120:100));
  H.y=740;
  H.vx=(ht.current.x-H.x)*(isLegacy?1.2:1.1);
  H.vy=isLegacy?-260:-220;
  H.facing=isB?1:-1;
  H.airRollInverted=!1;
  H.boost=100;
  H.isGrounded=!1;
},
onPinchSetup=()=>{
  const H=Gt.current.find(Z=>!Z.isBot);
  if(!H)return;
  const isLegacy=(f.physicsMode||activePhysicsMode)==="legacy";
  ht.current.x=Mt-Cu-8;
  ht.current.y=600;
  ht.current.vx=0;
  ht.current.vy=isLegacy?-340:-240;
  H.x=Mt-(isLegacy?300:240);
  H.y=k-H.height/2;
  H.vx=isLegacy?950:680;
  H.vy=0;
  H.angle=0;
  H.facing=1;
  H.airRollInverted=!1;
  H.boost=100;
  H.isGrounded=!0;
},
onDoubleTapSetup=()=>{
  const H=Gt.current.find(Z=>!Z.isBot);
  if(!H)return;
  const isLegacy=(f.physicsMode||activePhysicsMode)==="legacy";
  const isB=H.team==="blue",tgtX=isB?Mt:At;
  ht.current.x=tgtX-(isB?(isLegacy?360:340):-(isLegacy?360:340));
  ht.current.y=520;
  ht.current.vx=isB?(isLegacy?820:620):-(isLegacy?820:620);
  ht.current.vy=isLegacy?-360:-280;
  H.x=tgtX-(isB?(isLegacy?540:480):-(isLegacy?540:480));
  H.y=680;
  H.vx=isB?(isLegacy?520:420):-(isLegacy?520:420);
  H.vy=isLegacy?-280:-220;
  H.facing=isB?1:-1;
  H.airRollInverted=!1;
  H.boost=100;
  H.isGrounded=!1;
},
onPsychoSetup=()=>{
  const H=Gt.current.find(Z=>!Z.isBot);
  if(!H)return;
  const isLegacy=(f.physicsMode||activePhysicsMode)==="legacy";
  const isB=H.team==="blue",ownX=isB?At:Mt;
  ht.current.x=ownX+(isB?(isLegacy?35:45):-(isLegacy?35:45));
  ht.current.y=isLegacy?480:360;
  ht.current.vx=isB?(isLegacy?680:640):-(isLegacy?680:640);
  ht.current.vy=isLegacy?-200:-120;
  (ht.current as any).psychoCandidate={time:Date.now(),player:H.name,team:H.team,wall:isB?"blue":"orange",sourceWall:isB?"blue":"orange"};
  H.x=ownX+(isB?(isLegacy?220:240):-(isLegacy?220:240));
  H.y=620;
  H.vx=isB?(isLegacy?200:280):-(isLegacy?200:280);
  H.vy=isLegacy?-180:-180;
  H.facing=isB?1:-1;
  H.airRollInverted=!1;
  H.boost=100;
  H.isGrounded=!1;
},
onCeilingSetup=()=>{
  const H=Gt.current.find(Z=>!Z.isBot);
  if(!H)return;
  const isLegacy=(f.physicsMode||activePhysicsMode)==="legacy";
  const isB=H.team==="blue";
  H.x=Kt/2-(isB?180:-180);
  H.y=Qt+H.height/2+15;
  H.vx=isB?(isLegacy?340:280):-(isLegacy?340:280);
  H.vy=60;
  H.angle=0;
  H.facing=isB?1:-1;
  H.airRollInverted=!1;
  H.boost=100;
  H.isGrounded=!1;
  H.surfaceType="air";
  (H as any).isCeilingDrop=!0;
  H.canJump=!0;
  H.jumpCount=0;
  H.flipWindowTimer=999;
  ht.current.x=Kt/2+(isB?160:-160);
  ht.current.y=Qt+240;
  ht.current.vx=isB?(isLegacy?360:300):-(isLegacy?360:300);
  ht.current.vy=isLegacy?-60:-40;
  ht.current.spin=0;
};const isSpectator = f.mode === "bot_vs_bot" || f.mode.startsWith("spectator");const isMobileDevice = showMobileControls || isTouchDevice;return d.jsx("main",{ref:containerRef,className:"fixed inset-0 w-full h-full min-h-[100dvh] max-h-[100dvh] bg-slate-950 overflow-hidden flex items-center justify-center font-sans select-none",children:d.jsxs("div",{className:"relative w-full h-full overflow-hidden",children:[d.jsx("canvas",{ref:u,className:"absolute inset-0 w-full h-full block"}),d.jsx(a2,{blueScore:C,orangeScore:N,timeLeft:X,isOvertime:I,matchState:p,gameMode:f.mode,botDifficulty:f.botDifficulty,physicsMode:f.physicsMode,currentMap:f.selectedMap||"standard",isPaused:m,onTogglePause:()=>g(H=>!H),onOpenSettings:()=>y(!0),onResetMatch:ie,isFullscreen:isFullscreen,onToggleFullscreen:toggleFullscreen,onOpenControls:()=>setIsControlsOpen(!0),onOpenReplayStudio:handleOpenStudioFromAnywhere,autoCam:f.autoCam!==false,onToggleAutoCam:toggleAutoCam,steeringControl:f.steeringControl||"keyboard",onToggleSteeringControl:toggleSteeringControl,onOpenScoreboard:()=>setIsScoreboardOpen(prev=>!prev),onOpenMatchHistory:()=>setIsMatchHistoryOpen(true),isMultiplayerActive:peerNetwork.isConnected&&peerNetwork.roomState?.status==="in_game",multiplayerRoomCode:peerNetwork.roomState?.roomCode||null,multiplayerPing:multiplayerPing,onOpenMultiplayer:()=>setIsMultiplayerOpen(true),onLeaveMultiplayer:()=>{peerNetwork.disconnect();setIsMultiplayerOpen(false);ie();},onOpenQuickMenu:()=>setIsQuickMenuOpen(true),isMobileDevice:isMobileDevice,onOpenGarage:()=>setIsGarageOpen(true),onOpenCrates:()=>setIsCratesOpen(true),onOpenRanked:()=>setIsRankedModalOpen(true),onOpenMatchSetup:()=>setIsMatchSetupOpen(true),coinsCount:getPlayerInventory().coins,unopenedCratesCount:Object.values(getPlayerInventory().unopenedCrates||{}).reduce((acc:number,v:any)=>acc+v,0),currentRankLabel:calculateRankDetails(getRankedProfile().mmr).label,currentMmr:getRankedProfile().mmr}),
isPortrait&&isTouchDevice&&!dismissPortrait&&d.jsxs("div",{className:"absolute top-16 left-1/2 -translate-x-1/2 z-45 w-[92%] max-w-sm px-3.5 py-2.5 rounded-2xl bg-slate-900/95 border border-amber-500/60 shadow-2xl backdrop-blur-md flex items-center justify-between gap-2.5 text-amber-200 animate-fade-in pointer-events-auto",children:[d.jsxs("div",{className:"flex items-center gap-2",children:[d.jsx(RotateCw,{className:"w-4 h-4 text-amber-400 shrink-0 animate-spin-slow"}),d.jsxs("span",{className:"text-xs font-sans font-medium text-amber-100",children:["Rotate device to ",d.jsx("strong",{className:"text-amber-300",children:"Landscape"})," for best view!"]})]}),d.jsx("button",{onClick:()=>setDismissPortrait(true),className:"px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[11px] shrink-0 cursor-pointer",children:"Got it"})]}),
showMobileControls&&d.jsx(MobileControlsOverlay,{onInputChange:handleTouchInputChange,activeBoost:B?.boost??100,hasFlipReset:!!B?.hasFlipReset,isAirRollInverted:!!B?.airRollInverted,isGrounded:!!B?.isGrounded,isSpectator:isSpectator,visible:!m&&p!=="ended"&&!goalReplayUI?.active&&!dvr.active}),
d.jsx(MobileQuickMenu,{isOpen:isQuickMenuOpen,onClose:()=>setIsQuickMenuOpen(false),isPaused:m,onTogglePause:()=>g(H=>!H),onResetMatch:ie,isFullscreen:isFullscreen,onToggleFullscreen:toggleFullscreen,isAudioMuted:!f.soundEnabled,onToggleAudioMute:()=>handleUpdateSettings({...f,soundEnabled:!f.soundEnabled}),autoCam:f.autoCam!==false,onToggleAutoCam:toggleAutoCam,steeringControl:f.steeringControl||"keyboard",onToggleSteeringControl:toggleSteeringControl,onOpenMultiplayer:()=>setIsMultiplayerOpen(true),onOpenSettings:()=>y(!0),onOpenControls:()=>setIsControlsOpen(!0),onOpenMatchHistory:()=>setIsMatchHistoryOpen(true),onOpenReplayStudio:handleOpenStudioFromAnywhere,isSpectator:isSpectator,isMultiplayerActive:peerNetwork.isConnected&&peerNetwork.roomState?.status==="in_game",multiplayerRoomCode:peerNetwork.roomState?.roomCode||null,onOpenGarage:()=>setIsGarageOpen(true),onOpenCrates:()=>setIsCratesOpen(true),onOpenRanked:()=>setIsRankedModalOpen(true),onOpenMatchSetup:()=>setIsMatchSetupOpen(true),coinsCount:getPlayerInventory().coins,unopenedCratesCount:Object.values(getPlayerInventory().unopenedCrates||{}).reduce((acc:number,v:any)=>acc+v,0),currentRankLabel:calculateRankDetails(getRankedProfile().mmr).label}),
d.jsx(u2,{messages:J,onSendMessage:H=>x(H,pilotName,"blue"),isReplay:p==="goal_replay"||!!goalReplayUI?.active}),d.jsx(s2,{jumpKey:f.jumpKey,isOpen:isControlsOpen,onClose:()=>setIsControlsOpen(!1)}),
d.jsx(ScoreboardModal,{isOpen:isScoreboardOpen,onClose:()=>setIsScoreboardOpen(false),cars:Gt.current,blueScore:C,orangeScore:N,gameMode:f.mode,arenaName:(activeMapDef||MAP_DEFINITIONS[f.selectedMap||"standard"]||MAP_DEFINITIONS.standard).name}),
d.jsx(MatchHistoryModal,{isOpen:isMatchHistoryOpen,onClose:()=>setIsMatchHistoryOpen(false),onWatchReplay:handleWatchPastReplay}),
d.jsx(MultiplayerModal,{isOpen:isMultiplayerOpen,onClose:()=>setIsMultiplayerOpen(false),onStartMatch:()=>{setIsMultiplayerOpen(false);ie();},playerCarModel:f.selectedCar||"octane",onSelectCarModel:(cm:string)=>handleUpdateSettings({...f,selectedCar:cm}),currentMap:f.selectedMap||"standard",onPlayerNameChange:handleUpdatePilotName}),
d.jsx(GarageModal,{isOpen:isGarageOpen,onClose:()=>setIsGarageOpen(false),initialTab:garageInitialTab,onOpenCrates:()=>{setIsGarageOpen(false);setIsCratesOpen(true);},onLoadoutChange:()=>{setLoadoutVersion(v=>v+1);const inv=getPlayerInventory();const p1=Gt.current.find((c:any)=>c.id==="p1"||!c.isBot);if(p1){p1.customDecal=ITEM_CATALOG[inv.loadout.decal];p1.customWheels=ITEM_CATALOG[inv.loadout.wheels];p1.customBoost=ITEM_CATALOG[inv.loadout.boost];p1.customTopper=ITEM_CATALOG[inv.loadout.topper];const bodyItem=ITEM_CATALOG[inv.loadout.body];if(bodyItem?.visualData?.modelId){p1.carModel=bodyItem.visualData.modelId;}}}}),
d.jsx(CrateOpeningModal,{isOpen:isCratesOpen,onClose:()=>setIsCratesOpen(false),onOpenGarage:()=>{setIsCratesOpen(false);setGarageInitialTab("body");setIsGarageOpen(true);},onItemEquipped:()=>{setLoadoutVersion(v=>v+1);}}),
d.jsx(MatchSetupModal,{isOpen:isMatchSetupOpen,onClose:()=>setIsMatchSetupOpen(false),currentSettings:f,onStartMatch:(cfg:MatchSetupConfig)=>{setPilotMode(cfg.pilotMode);setIsCurrentMatchRanked(false);handleUpdateSettings({...f,mode:cfg.pilotMode==="just_bots"?(cfg.teamFormat==="1v1"?"bot_vs_bot":cfg.teamFormat==="2v2"?"spectator_2v2":"spectator_3v3"):cfg.teamFormat,botDifficulty:cfg.botDifficulty,selectedMap:cfg.selectedMap,matchDuration:cfg.matchDuration});setTimeout(()=>ie(),50);}}),
d.jsx(RankedMatchmakingModal,{isOpen:isRankedModalOpen,onClose:()=>setIsRankedModalOpen(false),onOpenBotUpgrades:()=>{setGarageInitialTab("bot_upgrade");setIsRankedModalOpen(false);setIsGarageOpen(true);},onStartRankedMatch:(playlist,opp,track)=>{setIsCurrentMatchRanked(true);setCurrentRankedTrack(track);setCurrentOpponentMmr(opp.mmr);if(track==="bot"){setPilotMode("place_bot");}else{setPilotMode("human");}handleUpdateSettings({...f,mode:playlist,botDifficulty:opp.difficulty});setTimeout(()=>ie(),50);}}),
d.jsx(RankProgressionOverlay,{isOpen:isRankProgressionOpen,onClose:()=>setIsRankProgressionOpen(false),result:rankedMatchResult,rewards:matchRewards,onOpenCrate:()=>{setIsRankProgressionOpen(false);setIsCratesOpen(true);},onOpenGarage:()=>{setIsRankProgressionOpen(false);setGarageInitialTab("body");setIsGarageOpen(true);}}),
!isSpectator&&!isMobileDevice&&d.jsxs("div",{className:"absolute bottom-3 left-4 z-20 pointer-events-none hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] font-medium text-slate-300 backdrop-blur-sm shadow-md",children:[d.jsxs("div",{className:"flex items-center gap-1",children:[d.jsx("kbd",{className:"px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-sky-300 font-bold text-[10px]",children:"W A S D"}),d.jsx("span",{children:"Drive"})]}),d.jsx("span",{className:"text-slate-600",children:"•"}),d.jsxs("div",{className:"flex items-center gap-1",children:[d.jsx("kbd",{className:"px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-amber-300 font-bold text-[10px]",children:"Q / E"}),d.jsx("span",{children:"Air Roll (180° Flip)"})]}),d.jsx("span",{className:"text-slate-600",children:"•"}),d.jsxs("div",{className:"flex items-center gap-1",children:[d.jsx("kbd",{className:"px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-sky-300 font-bold text-[10px]",children:f.jumpKey==="rmb"?"RMB / Space":"Space"}),d.jsx("span",{children:"Jump"})]}),d.jsx("span",{className:"text-slate-600",children:"•"}),d.jsxs("div",{className:"flex items-center gap-1",children:[d.jsx("kbd",{className:"px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-amber-300 font-bold text-[10px]",children:"Shift / LMB"}),d.jsx("span",{children:"Boost"})]}),d.jsx("span",{className:"text-slate-600",children:"•"}),d.jsxs("div",{className:"flex items-center gap-1",children:[d.jsx("kbd",{className:"px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-amber-300 font-bold text-[10px]",children:"H"}),d.jsx("span",{children:"Hitbox"})]}),d.jsx("span",{className:"text-slate-600",children:"•"}),d.jsxs("div",{className:"flex items-center gap-1",children:[d.jsx("kbd",{className:"px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-purple-300 font-bold text-[10px]",children:"C"}),d.jsx("span",{children:"Auto Cam"})]}),d.jsx("span",{className:"text-slate-600",children:"•"}),d.jsxs("div",{className:"flex items-center gap-1 cursor-pointer",onClick:()=>setIsScoreboardOpen(prev=>!prev),children:[d.jsx("kbd",{className:"px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-amber-300 font-bold text-[10px]",children:"Tab"}),d.jsx("span",{children:"Scoreboard"})]}),
d.jsx("span",{className:"text-slate-600",children:"•"}),
d.jsxs("div",{className:"flex items-center gap-1",children:[
d.jsx("kbd",{className:`px-1.5 py-0.5 rounded border font-mono text-[10px] ${f.steeringControl === "mouse" ? "bg-emerald-950 border-emerald-500 text-emerald-300 font-bold" : "bg-slate-800 border-slate-700 text-slate-300"}`,children:"M"}),
d.jsx("span",{className:f.steeringControl === "mouse" ? "text-emerald-300 font-bold" : "",children:f.steeringControl === "mouse" ? "Mouse Aim [ON]" : "Mouse Aim"})]})]}),!isMobileDevice&&d.jsx(n2,{playerCar:B}),f.mode==="training"&&d.jsx(c2,{onResetBall:R,onDribbleSetup:V,onPassToMe:Q,onHighAerialSetup:vt,onMustySetup:onMustySetup,onFlipResetSetup:onFlipResetSetup,onPinchSetup:onPinchSetup,onDoubleTapSetup:onDoubleTapSetup,onPsychoSetup:onPsychoSetup,onCeilingSetup:onCeilingSetup,infiniteBoost:Lt,onToggleInfiniteBoost:()=>Ft(H=>!H),showHitbox:f.showHitbox,onToggleHitbox:toggleHitbox,onOpenReplayStudio:handleOpenStudioFromAnywhere}),d.jsx(v2,{alerts:mechAlerts}),d.jsx(i2,{playerCar:Gt.current.find(H=>!H.isBot)||null}),d.jsx(o2,{goalInfo:Ht,kickoffCountdown:Tt}),d.jsx(GoalReplayOverlay,{replayUI:goalReplayUI,onSkip:skipGoalReplay,onSpeedToggle:handleGoalReplaySpeed,onTogglePause:handleGoalReplayTogglePause,onScrub:handleGoalReplayScrub,onStep:handleGoalReplayStep,onRestart:handleGoalReplayRestart,onOpenStudio:handleOpenStudioFromGoalReplay,onExportClip:handleExportGoalClip,isAudioMuted:isReplayAudioMuted,onToggleAudioMute:()=>setIsReplayAudioMuted(prev=>!prev),activeBadge:activeReplayBadge}),(isSpectator||dvr.active)&&!goalReplayUI?.active&&d.jsx(MatchDvrStudio,{isSpectator:isSpectator,dvrState:dvr,onTogglePlay:handleDvrTogglePlay,onScrub:handleDvrScrub,onStep:handleDvrStep,onJump:handleDvrJump,onGoLive:handleDvrGoLive,onSpeedChange:handleDvrSpeedChange,onClose:()=>setDvr({active:!1,offsetSec:0,isPlaying:!1,speed:1}),availableSeconds:getAvailableDvrSeconds(),matchEvents:matchEventsRef.current,onSeekToTime:handleSeekToTime,matchStartTime:matchStartTimeRef.current,clipRange:clipRange,onSetClipIn:handleSetClipIn,onSetClipOut:handleSetClipOut,onQuickClip:handleQuickClip,onExportClip:(format:any)=>handleExportClip(format),isAudioMuted:isReplayAudioMuted,onToggleAudioMute:()=>setIsReplayAudioMuted(prev=>!prev),activeBadge:activeReplayBadge,isCollapsed:isDvrCollapsed,onToggleCollapse:()=>setIsDvrCollapsed(prev=>!prev),autoCam:f.autoCam!==false,onToggleAutoCam:toggleAutoCam,steeringControl:f.steeringControl||"keyboard",onToggleSteeringControl:toggleSteeringControl,onOpenScoreboard:()=>setIsScoreboardOpen(prev=>!prev),onOpenMatchHistory:()=>setIsMatchHistoryOpen(true)}),d.jsx(ExportProgressModal,{exportModal:exportModal,onCancel:handleCancelExport}),m&&d.jsx("div",{className:`absolute inset-0 z-35 flex flex-col items-center justify-center ${dvr.active?"bg-black/35 pointer-events-none":"bg-black/70 backdrop-blur-sm"}`,children:d.jsxs("div",{className:`bg-slate-900/95 border border-slate-700 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-3 text-center pointer-events-auto ${dvr.active?"opacity-95 scale-95 transition":null}`,children:[d.jsx("h3",{className:"text-2xl md:text-3xl font-black text-white uppercase tracking-wider",children:"MATCH PAUSED"}),d.jsxs("p",{className:"text-xs md:text-sm text-slate-300",children:["Press ",d.jsx("kbd",{className:"px-2 py-0.5 bg-slate-800 rounded border border-slate-600 font-mono text-white",children:"P"})," to resume match or open full-match replay studio"]}),d.jsxs("div",{className:"flex gap-2.5 mt-2 flex-wrap justify-center",children:[d.jsx("button",{onClick:()=>{g(!1),setDvr({active:!1,offsetSec:0,isPlaying:!1,speed:1})},className:"px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm rounded-xl transition shadow-lg cursor-pointer",children:"Resume Match"}),d.jsxs("button",{onClick:()=>{const maxSec=Math.max(1,getAvailableDvrSeconds());setDvr({active:!0,offsetSec:Math.min(15,maxSec),isPlaying:!0,speed:1})},className:"px-4 py-2.5 bg-gradient-to-r from-amber-500/20 to-sky-500/20 hover:from-amber-500/30 hover:to-sky-500/30 text-amber-300 font-bold text-sm rounded-xl transition border border-amber-500/50 flex items-center gap-2 cursor-pointer shadow-md",children:[d.jsx(Film,{className:"w-4 h-4 text-amber-400"}),d.jsx("span",{children:"🎬 Replay & Clip Studio"})]}),d.jsx("button",{onClick:ie,className:"px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl transition border border-slate-700 cursor-pointer",children:"Restart Match"})]})]})}),p==="ended"&&!dvr.active&&!isMatchHistoryOpen&&d.jsx("div",{className:"absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto",children:d.jsxs("div",{className:"bg-slate-950/95 border border-slate-700 sm:border-2 rounded-2xl sm:rounded-3xl p-3 sm:p-5 md:p-7 max-w-xs sm:max-w-md w-full shadow-2xl flex flex-col items-center text-center animate-fade-in text-slate-100 max-h-[96vh] overflow-y-auto",children:[d.jsx(Is,{className:"w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 text-amber-400 mb-0.5 sm:mb-1.5 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]"}),d.jsx("h2",{className:"text-lg sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-0.5 sm:mb-1",children:C>N?"BLUE WINS!":N>C?"ORANGE WINS!":"OVERTIME DRAW!"}),d.jsxs("div",{className:"my-1.5 sm:my-3 flex items-center justify-center gap-4 sm:gap-6 px-3.5 py-1 sm:px-6 sm:py-2 rounded-xl sm:rounded-2xl bg-slate-900/90 border border-slate-800",children:[d.jsxs("div",{className:"flex flex-col items-center",children:[d.jsx("span",{className:"text-[10px] sm:text-xs font-bold text-sky-400 uppercase tracking-wider",children:"Blue Team"}),d.jsx("span",{className:"text-2xl sm:text-3xl md:text-4xl font-mono font-black text-white",children:C})]}),d.jsx("span",{className:"text-lg sm:text-2xl font-bold text-slate-500",children:":"}),d.jsxs("div",{className:"flex flex-col items-center",children:[d.jsx("span",{className:"text-[10px] sm:text-xs font-bold text-orange-400 uppercase tracking-wider",children:"Orange Team"}),d.jsx("span",{className:"text-2xl sm:text-3xl md:text-4xl font-mono font-black text-white",children:N})]})]}),d.jsxs("div",{className:"flex flex-col gap-1.5 sm:gap-2.5 w-full mt-1",children:[d.jsxs("button",{onClick:()=>{const totalSec=Math.max(1,getAvailableDvrSeconds());setDvr({active:!0,offsetSec:totalSec,isPlaying:!0,speed:1});A("playing");},className:"w-full py-2 sm:py-2.5 md:py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase rounded-lg sm:rounded-xl shadow-md transition flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer",children:[d.jsx(Film,{className:"w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950"}),d.jsx("span",{children:"🎬 Review Full Match & Export Clips"})]}),d.jsxs("button",{onClick:()=>setIsMatchHistoryOpen(true),className:"w-full py-1.5 sm:py-2 md:py-2.5 bg-slate-900 hover:bg-slate-800 text-sky-300 font-bold text-[11px] sm:text-xs uppercase rounded-lg sm:rounded-xl border border-sky-500/40 transition flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer",children:[d.jsx(Clock,{className:"w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400"}),d.jsx("span",{children:"📜 Match History & Past Replays"})]}),(isCurrentMatchRanked||matchRewards)&&d.jsxs("button",{onClick:()=>setIsRankProgressionOpen(true),className:"w-full py-1.5 sm:py-2 md:py-2.5 bg-gradient-to-r from-purple-900/60 to-indigo-900/60 hover:from-purple-800/80 hover:to-indigo-800/80 text-purple-200 font-bold text-[11px] sm:text-xs uppercase rounded-lg sm:rounded-xl border border-purple-500/40 transition flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer",children:[d.jsx(Is,{className:"w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400"}),d.jsx("span",{children:"🏆 View Rank & Rewards"})]}),d.jsxs("div",{className:"flex gap-2 sm:gap-3 w-full",children:[
  peerNetwork.isConnected&&peerNetwork.roomState?.status==="in_game"?(
    peerNetwork.role==="host"?(
      d.jsxs(st.Fragment,{children:[
        d.jsxs("button",{onClick:()=>{peerNetwork.rematch();ie();},className:"flex-1 py-2 sm:py-2.5 md:py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-white font-black text-xs sm:text-sm uppercase rounded-lg sm:rounded-xl shadow-md transition flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer",children:[d.jsx(im,{className:"w-3.5 h-3.5 sm:w-4 sm:h-4"}),d.jsx("span",{children:"Rematch"})]}),
        d.jsxs("button",{onClick:()=>{peerNetwork.returnToLobby();setIsMultiplayerOpen(true);},className:"flex-1 py-2 sm:py-2.5 md:py-3 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 text-white font-black text-xs sm:text-sm uppercase rounded-lg sm:rounded-xl shadow-md transition flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer",children:[d.jsx(Globe,{className:"w-3.5 h-3.5 sm:w-4 sm:h-4"}),d.jsx("span",{children:"Lobby"})]})
      ]})
    ):(
      d.jsxs(st.Fragment,{children:[
        d.jsxs("button",{onClick:()=>setIsMultiplayerOpen(true),className:"flex-1 py-2 sm:py-2.5 md:py-3 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 text-white font-black text-xs sm:text-sm uppercase rounded-lg sm:rounded-xl shadow-md transition flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer",children:[d.jsx(Globe,{className:"w-3.5 h-3.5 sm:w-4 sm:h-4"}),d.jsx("span",{children:"Room Lobby"})]}),
        d.jsxs("button",{onClick:()=>{peerNetwork.disconnect();ie();},className:"flex-1 py-2 sm:py-2.5 md:py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm uppercase rounded-lg sm:rounded-xl transition flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer",children:[d.jsx(LogOut,{className:"w-3.5 h-3.5 sm:w-4 sm:h-4"}),d.jsx("span",{children:"Leave"})]})
      ]})
    )
  ):(
    d.jsxs(st.Fragment,{children:[
      d.jsxs("button",{onClick:ie,className:"flex-1 py-2 sm:py-2.5 md:py-3 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 text-white font-black text-xs sm:text-sm uppercase rounded-lg sm:rounded-xl shadow-md shadow-sky-500/25 transition flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer",children:[d.jsx(im,{className:"w-3.5 h-3.5 sm:w-4 sm:h-4"}),d.jsx("span",{children:"Play Again"})]}),
      d.jsx("button",{onClick:()=>y(!0),className:"px-3 py-2 sm:px-4 sm:py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg sm:rounded-xl border border-slate-700 transition cursor-pointer flex items-center justify-center",title:"Settings",children:d.jsx(cm,{className:"w-4 h-4 sm:w-5 sm:h-5"})})
    ]})
  )
]})]})]})}),d.jsx(f2,{isOpen:s,settings:f,onUpdateSettings:handleUpdateSettings,onClose:()=>y(!1),onApplyAndRestart:()=>{y(!1),ie()}})]})})}

export default function App() {
  return d.jsx(r2, {});
}
