import {
  BotUpgrades,
  BotUpgradeAttribute,
  BotArchetype,
  BotUpgradeModifier,
  UPGRADE_COSTS
} from "./botUpgradeTypes";
import { getPlayerCoins, spendCoins } from "../customization/customizationStorage";

const STORAGE_KEY = "rl_bot_upgrades_v1";

const DEFAULT_BOT_UPGRADES: BotUpgrades = {
  reactionSpeed: 1,
  boostThrift: 1,
  aerialFlight: 1,
  strikerPower: 1,
  tacticalArchetype: "balanced",
  botName: "Alpha-1 AI"
};

export function getBotUpgrades(): BotUpgrades {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveBotUpgrades(DEFAULT_BOT_UPGRADES);
      return { ...DEFAULT_BOT_UPGRADES };
    }
    const parsed = JSON.parse(raw);
    return {
      reactionSpeed: Math.max(1, Math.min(5, Number(parsed.reactionSpeed) || 1)),
      boostThrift: Math.max(1, Math.min(5, Number(parsed.boostThrift) || 1)),
      aerialFlight: Math.max(1, Math.min(5, Number(parsed.aerialFlight) || 1)),
      strikerPower: Math.max(1, Math.min(5, Number(parsed.strikerPower) || 1)),
      tacticalArchetype: parsed.tacticalArchetype || "balanced",
      botName: (parsed.botName || "Alpha-1 AI").slice(0, 16)
    };
  } catch (e) {
    return { ...DEFAULT_BOT_UPGRADES };
  }
}

export function saveBotUpgrades(upgrades: BotUpgrades): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(upgrades));
  } catch (e) {
    console.error("Failed to save bot upgrades", e);
  }
}

export function getBotOverallLevel(upgrades?: BotUpgrades): number {
  const u = upgrades || getBotUpgrades();
  return u.reactionSpeed + u.boostThrift + u.aerialFlight + u.strikerPower;
}

export function upgradeBotAttribute(
  attribute: BotUpgradeAttribute
): { success: boolean; newLevel: number; error?: string } {
  const upgrades = getBotUpgrades();
  const currentLevel = upgrades[attribute];

  if (currentLevel >= 5) {
    return { success: false, newLevel: currentLevel, error: "Attribute already at maximum level (5)" };
  }

  const nextLevel = currentLevel + 1;
  const cost = UPGRADE_COSTS[nextLevel] || 1000;

  const coins = getPlayerCoins();
  if (coins < cost) {
    return {
      success: false,
      newLevel: currentLevel,
      error: `Not enough Coins. Need ${cost.toLocaleString()} 🪙 (You have ${coins.toLocaleString()} 🪙)`
    };
  }

  if (!spendCoins(cost)) {
    return { success: false, newLevel: currentLevel, error: "Coin deduction failed" };
  }

  upgrades[attribute] = nextLevel;
  saveBotUpgrades(upgrades);
  return { success: true, newLevel: nextLevel };
}

export function setBotArchetype(archetype: BotArchetype): void {
  const upgrades = getBotUpgrades();
  upgrades.tacticalArchetype = archetype;
  saveBotUpgrades(upgrades);
}

export function setBotName(name: string): void {
  const clean = name.trim().slice(0, 16) || "Alpha-1 AI";
  const upgrades = getBotUpgrades();
  upgrades.botName = clean;
  saveBotUpgrades(upgrades);
}

export function getBotUpgradesModifiers(upgrades?: BotUpgrades): BotUpgradeModifier {
  const u = upgrades || getBotUpgrades();

  // 1. Reaction speed: decreases artificial delay from 0.16s down to 0.01s
  // and tightens turn dampening
  const reactionDelaySec = Math.max(0.01, 0.16 - (u.reactionSpeed - 1) * 0.035);
  const turnDampeningMult = 1.0 + (u.reactionSpeed - 1) * 0.15;

  // 2. Boost thrift: level >= 2 enables supersonic boost cut; level >= 4 enables feathering
  const boostFeatherEfficiency = u.boostThrift >= 2;

  // 3. Aerial flight: enables committing to balls higher in the air and faster double-jump
  const aerialCommitHeight = 120 + (u.aerialFlight - 1) * 45; // 120px to 300px above floor

  // 4. Striker power: higher offset aim towards corner crossbars
  const shotAccuracyOffset = (u.strikerPower - 1) * 8; // 0 to 32px precision offset

  return {
    reactionDelaySec,
    boostFeatherEfficiency,
    aerialCommitHeight,
    shotAccuracyOffset,
    turnDampeningMult,
    archetype: u.tacticalArchetype
  };
}
