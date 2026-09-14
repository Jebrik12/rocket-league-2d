import { RankedBotProfile } from "./rankedTypes";
import { calculateRankDetails } from "./rankedStorage";

const COMPETITIVE_NAMES = [
  "Pulse_Viper",
  "Zenith_RL",
  "AeroGod_2k",
  "CosmicStriker",
  "Nox_Flicker",
  "KuxirPinch_God",
  "SquishyTwin",
  "Phantom99",
  "VelocityX",
  "Titanium_Striker",
  "Vortex_RL",
  "ApexPredator",
  "Ceiling_Demon",
  "Zen_Mentality",
  "MustyApprentice",
  "AeroSovereign",
  "Shadow_Dribbler"
];

const CAR_POOL = ["octane", "fennec", "dominus", "skyline", "breakout", "merc"];
const AVATAR_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899"
];

export function generateRankedOpponent(playerMmr: number): RankedBotProfile {
  // Opponent MMR matches player within a ±35 range
  const variance = Math.floor((Math.random() * 70) - 35);
  const oppMmr = Math.max(120, playerMmr + variance);

  const rank = calculateRankDetails(oppMmr);
  const name = COMPETITIVE_NAMES[Math.floor(Math.random() * COMPETITIVE_NAMES.length)];
  const carModel = CAR_POOL[Math.floor(Math.random() * CAR_POOL.length)];
  const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

  // Scale bot difficulty based on competitive rank
  let difficulty: "rookie" | "pro" | "allstar" | "ssl" | "unfair" = "pro";
  if (oppMmr < 450) {
    difficulty = "rookie";
  } else if (oppMmr < 900) {
    difficulty = "pro";
  } else if (oppMmr < 1400) {
    difficulty = "allstar";
  } else if (oppMmr < 1900) {
    difficulty = "ssl";
  } else {
    difficulty = "unfair";
  }

  return {
    name,
    mmr: oppMmr,
    tier: rank.tier,
    subTier: rank.subTier,
    division: rank.division,
    carModel,
    difficulty,
    avatarColor
  };
}
