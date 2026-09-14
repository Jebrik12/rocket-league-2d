export type BotUpgradeAttribute =
  | "reactionSpeed"
  | "boostThrift"
  | "aerialFlight"
  | "strikerPower";

export type BotArchetype = "balanced" | "striker" | "goalkeeper" | "menace";

export interface BotUpgrades {
  reactionSpeed: number; // 1 to 5
  boostThrift: number; // 1 to 5
  aerialFlight: number; // 1 to 5
  strikerPower: number; // 1 to 5
  tacticalArchetype: BotArchetype;
  botName: string;
}

export interface BotUpgradeModifier {
  reactionDelaySec: number;
  boostFeatherEfficiency: boolean;
  aerialCommitHeight: number;
  shotAccuracyOffset: number;
  turnDampeningMult: number;
  archetype: BotArchetype;
}

export const UPGRADE_COSTS: Record<number, number> = {
  2: 400,
  3: 800,
  4: 1500,
  5: 3000
};

export const ARCHETYPE_CONFIG: Record<
  BotArchetype,
  { name: string; desc: string; badge: string; color: string }
> = {
  balanced: {
    name: "Tactical Playmaker",
    desc: "Solid 50/50 rotations, balanced offense and disciplined recovery.",
    badge: "Balanced",
    color: "text-sky-400"
  },
  striker: {
    name: "Hyper Striker",
    desc: "Aggressive forward press. Suffocates clears and challenges relentlessly.",
    badge: "Aggressive",
    color: "text-amber-400"
  },
  goalkeeper: {
    name: "Lockdown Goalie",
    desc: "Deep net sentinel. Saves boost for clutch aerial saves and long-range clears.",
    badge: "Defense",
    color: "text-emerald-400"
  },
  menace: {
    name: "Demolition Menace",
    desc: "Ruthless physical enforcer. Hunts down opponent cars for supersonic demos.",
    badge: "Chaos",
    color: "text-rose-400"
  }
};
