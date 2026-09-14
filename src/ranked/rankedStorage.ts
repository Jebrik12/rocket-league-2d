import { RankTier, RankTierInfo, PlayerRankProfile, RankedMatchResult } from "./rankedTypes";

export const RANK_TIERS: Record<RankTier, RankTierInfo> = {
  scrap: {
    tier: "scrap",
    tierName: "Scrap Iron",
    minMmr: 100,
    maxMmr: 399,
    colorHex: "#a16207",
    badgeClass: "text-amber-600 border-amber-700/60 bg-amber-950/40",
    glowClass: "shadow-[0_0_12px_rgba(161,98,7,0.4)]",
    divisions: 4,
    iconName: "ShieldAlert"
  },
  ironclad: {
    tier: "ironclad",
    tierName: "Ironclad",
    minMmr: 400,
    maxMmr: 699,
    colorHex: "#94a3b8",
    badgeClass: "text-slate-300 border-slate-400/60 bg-slate-900/60",
    glowClass: "shadow-[0_0_12px_rgba(148,163,184,0.4)]",
    divisions: 4,
    iconName: "Shield"
  },
  apex: {
    tier: "apex",
    tierName: "Apex Striker",
    minMmr: 700,
    maxMmr: 999,
    colorHex: "#eab308",
    badgeClass: "text-amber-400 border-amber-400/70 bg-amber-950/60",
    glowClass: "shadow-[0_0_16px_rgba(234,179,8,0.5)]",
    divisions: 4,
    iconName: "Zap"
  },
  velocity: {
    tier: "velocity",
    tierName: "Velocity Elite",
    minMmr: 1000,
    maxMmr: 1299,
    colorHex: "#06b6d4",
    badgeClass: "text-cyan-400 border-cyan-400/70 bg-cyan-950/60",
    glowClass: "shadow-[0_0_16px_rgba(6,182,212,0.6)]",
    divisions: 4,
    iconName: "Flame"
  },
  cosmic: {
    tier: "cosmic",
    tierName: "Cosmic Ace",
    minMmr: 1300,
    maxMmr: 1599,
    colorHex: "#3b82f6",
    badgeClass: "text-blue-400 border-blue-400/70 bg-blue-950/60",
    glowClass: "shadow-[0_0_18px_rgba(59,130,246,0.6)]",
    divisions: 4,
    iconName: "Sparkles"
  },
  sovereign: {
    tier: "sovereign",
    tierName: "Aero Sovereign",
    minMmr: 1600,
    maxMmr: 1899,
    colorHex: "#a855f7",
    badgeClass: "text-purple-400 border-purple-400/80 bg-purple-950/70",
    glowClass: "shadow-[0_0_20px_rgba(168,85,247,0.7)]",
    divisions: 4,
    iconName: "Target"
  },
  vanguard: {
    tier: "vanguard",
    tierName: "Grand Vanguard",
    minMmr: 1900,
    maxMmr: 2199,
    colorHex: "#f43f5e",
    badgeClass: "text-rose-400 border-rose-400/90 bg-rose-950/80 font-black",
    glowClass: "shadow-[0_0_22px_rgba(244,63,94,0.8)]",
    divisions: 4,
    iconName: "Trophy"
  },
  overlord: {
    tier: "overlord",
    tierName: "Supersonic Overlord",
    minMmr: 2200,
    maxMmr: 9999,
    colorHex: "#f59e0b",
    badgeClass:
      "text-white border-amber-300 bg-gradient-to-r from-amber-500/80 via-rose-500/80 to-purple-600/80 font-black",
    glowClass: "shadow-[0_0_28px_rgba(245,158,11,0.9)] animate-pulse",
    divisions: 1,
    iconName: "Crown"
  }
};

const STORAGE_KEY = "rl_ranked_profile_v1";
const BOT_STORAGE_KEY = "rl_bot_ranked_profile_v1";

const DEFAULT_PROFILE: PlayerRankProfile = {
  mmr: 600, // Starts at Ironclad III
  peakMmr: 600,
  tier: "ironclad",
  subTier: 3,
  division: 1,
  wins: 0,
  losses: 0,
  streak: 0,
  matchesPlayed: 0,
  seasonName: "Season 1: Aero Origins"
};

const DEFAULT_BOT_PROFILE: PlayerRankProfile = {
  mmr: 500, // Starts at Ironclad I for Bot League
  peakMmr: 500,
  tier: "ironclad",
  subTier: 1,
  division: 1,
  wins: 0,
  losses: 0,
  streak: 0,
  matchesPlayed: 0,
  seasonName: "Bot League Season 1: Cyber Arena"
};

export function calculateRankDetails(mmr: number): {
  tier: RankTier;
  subTier: number;
  division: number;
  label: string;
  progressPercent: number;
} {
  const clamped = Math.max(100, mmr);

  if (clamped >= 2200) {
    return {
      tier: "overlord",
      subTier: 1,
      division: 1,
      label: "Supersonic Overlord",
      progressPercent: Math.min(100, Math.round(((clamped - 2200) / 300) * 100))
    };
  }

  const tiersOrder: RankTier[] = [
    "scrap",
    "ironclad",
    "apex",
    "velocity",
    "cosmic",
    "sovereign",
    "vanguard"
  ];

  for (const tierKey of tiersOrder) {
    const info = RANK_TIERS[tierKey];
    if (clamped >= info.minMmr && clamped <= info.maxMmr) {
      const range = info.maxMmr - info.minMmr + 1; // 300 MMR per tier
      const offset = clamped - info.minMmr;
      const subTierRange = range / 3; // 100 MMR per subTier (I, II, III)

      const subTier = Math.min(3, Math.floor(offset / subTierRange) + 1);
      const subTierOffset = offset % subTierRange;
      const divRange = subTierRange / 4; // 25 MMR per Division (I, II, III, IV)
      const division = Math.min(4, Math.floor(subTierOffset / divRange) + 1);

      const romanSub = subTier === 1 ? "I" : subTier === 2 ? "II" : "III";
      const romanDiv = division === 1 ? "I" : division === 2 ? "II" : division === 3 ? "III" : "IV";

      const progressPercent = Math.round((subTierOffset / subTierRange) * 100);

      return {
        tier: tierKey,
        subTier,
        division,
        label: `${info.tierName} ${romanSub} (Div ${romanDiv})`,
        progressPercent
      };
    }
  }

  return {
    tier: "scrap",
    subTier: 1,
    division: 1,
    label: "Scrap Iron I (Div I)",
    progressPercent: 0
  };
}

export function getRankedProfile(): PlayerRankProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const details = calculateRankDetails(DEFAULT_PROFILE.mmr);
      const prof: PlayerRankProfile = {
        ...DEFAULT_PROFILE,
        tier: details.tier,
        subTier: details.subTier,
        division: details.division
      };
      saveRankedProfile(prof);
      return prof;
    }
    const parsed = JSON.parse(raw);
    const details = calculateRankDetails(parsed.mmr || 600);
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      tier: details.tier,
      subTier: details.subTier,
      division: details.division
    };
  } catch (e) {
    return { ...DEFAULT_PROFILE };
  }
}

export function saveRankedProfile(profile: PlayerRankProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save ranked profile", e);
  }
}

export function processRankedMatchEnd(
  isWin: boolean,
  opponentMmr?: number
): RankedMatchResult {
  const profile = getRankedProfile();
  const oldMmr = profile.mmr;
  const oldRank = calculateRankDetails(oldMmr);

  // Base MMR delta (Elo-like scale)
  const oppMmr = opponentMmr || oldMmr;
  const mmrDiff = oppMmr - oldMmr; // Higher opponent gives more points on win
  const expectedProb = 1 / (1 + Math.pow(10, -mmrDiff / 400));

  let delta = 0;
  if (isWin) {
    profile.wins += 1;
    profile.streak = profile.streak > 0 ? profile.streak + 1 : 1;
    // Streak multiplier (up to 1.4x for 3+ win streak)
    const streakBonus = Math.min(1.4, 1.0 + (profile.streak > 2 ? (profile.streak - 2) * 0.1 : 0));
    delta = Math.round(Math.max(14, Math.min(36, 24 * (1 - expectedProb) * 2 * streakBonus)));
  } else {
    profile.losses += 1;
    profile.streak = profile.streak < 0 ? profile.streak - 1 : -1;
    delta = -Math.round(Math.max(12, Math.min(30, 22 * expectedProb * 2)));
  }

  const newMmr = Math.max(100, oldMmr + delta);
  profile.mmr = newMmr;
  profile.peakMmr = Math.max(profile.peakMmr, newMmr);
  profile.matchesPlayed += 1;

  const newRank = calculateRankDetails(newMmr);
  profile.tier = newRank.tier;
  profile.subTier = newRank.subTier;
  profile.division = newRank.division;

  saveRankedProfile(profile);

  const isPromotion =
    newRank.tier !== oldRank.tier
      ? Object.keys(RANK_TIERS).indexOf(newRank.tier) > Object.keys(RANK_TIERS).indexOf(oldRank.tier)
      : newRank.subTier > oldRank.subTier || newRank.division > oldRank.division;

  const isDemotion =
    newRank.tier !== oldRank.tier
      ? Object.keys(RANK_TIERS).indexOf(newRank.tier) < Object.keys(RANK_TIERS).indexOf(oldRank.tier)
      : newRank.subTier < oldRank.subTier || newRank.division < oldRank.division;

  return {
    track: "player",
    isWin,
    oldMmr,
    newMmr,
    deltaMmr: delta,
    oldTier: oldRank.tier,
    oldSubTier: oldRank.subTier,
    oldDiv: oldRank.division,
    newTier: newRank.tier,
    newSubTier: newRank.subTier,
    newDiv: newRank.division,
    isPromotion,
    isDemotion,
    streak: profile.streak
  };
}

export function getBotRankedProfile(): PlayerRankProfile {
  try {
    const raw = localStorage.getItem(BOT_STORAGE_KEY);
    if (!raw) {
      const details = calculateRankDetails(DEFAULT_BOT_PROFILE.mmr);
      const prof: PlayerRankProfile = {
        ...DEFAULT_BOT_PROFILE,
        tier: details.tier,
        subTier: details.subTier,
        division: details.division
      };
      saveBotRankedProfile(prof);
      return prof;
    }
    const parsed = JSON.parse(raw);
    const details = calculateRankDetails(parsed.mmr || 500);
    return {
      ...DEFAULT_BOT_PROFILE,
      ...parsed,
      tier: details.tier,
      subTier: details.subTier,
      division: details.division
    };
  } catch (e) {
    return { ...DEFAULT_BOT_PROFILE };
  }
}

export function saveBotRankedProfile(profile: PlayerRankProfile): void {
  try {
    localStorage.setItem(BOT_STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save bot ranked profile", e);
  }
}

export function processBotRankedMatchEnd(
  isWin: boolean,
  opponentMmr?: number
): RankedMatchResult {
  const profile = getBotRankedProfile();
  const oldMmr = profile.mmr;
  const oldRank = calculateRankDetails(oldMmr);

  const oppMmr = opponentMmr || oldMmr;
  const mmrDiff = oppMmr - oldMmr;
  const expectedProb = 1 / (1 + Math.pow(10, -mmrDiff / 400));

  let delta = 0;
  if (isWin) {
    profile.wins += 1;
    profile.streak = profile.streak > 0 ? profile.streak + 1 : 1;
    const streakBonus = Math.min(1.4, 1.0 + (profile.streak > 2 ? (profile.streak - 2) * 0.1 : 0));
    delta = Math.round(Math.max(14, Math.min(36, 24 * (1 - expectedProb) * 2 * streakBonus)));
  } else {
    profile.losses += 1;
    profile.streak = profile.streak < 0 ? profile.streak - 1 : -1;
    delta = -Math.round(Math.max(12, Math.min(30, 22 * expectedProb * 2)));
  }

  const newMmr = Math.max(100, oldMmr + delta);
  profile.mmr = newMmr;
  profile.peakMmr = Math.max(profile.peakMmr, newMmr);
  profile.matchesPlayed += 1;

  const newRank = calculateRankDetails(newMmr);
  profile.tier = newRank.tier;
  profile.subTier = newRank.subTier;
  profile.division = newRank.division;

  saveBotRankedProfile(profile);

  const isPromotion =
    newRank.tier !== oldRank.tier
      ? Object.keys(RANK_TIERS).indexOf(newRank.tier) > Object.keys(RANK_TIERS).indexOf(oldRank.tier)
      : newRank.subTier > oldRank.subTier || newRank.division > oldRank.division;

  const isDemotion =
    newRank.tier !== oldRank.tier
      ? Object.keys(RANK_TIERS).indexOf(newRank.tier) < Object.keys(RANK_TIERS).indexOf(oldRank.tier)
      : newRank.subTier < oldRank.subTier || newRank.division < oldRank.division;

  return {
    track: "bot",
    isWin,
    oldMmr,
    newMmr,
    deltaMmr: delta,
    oldTier: oldRank.tier,
    oldSubTier: oldRank.subTier,
    oldDiv: oldRank.division,
    newTier: newRank.tier,
    newSubTier: newRank.subTier,
    newDiv: newRank.division,
    isPromotion,
    isDemotion,
    streak: profile.streak
  };
}
