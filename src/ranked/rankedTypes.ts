export type RankTier =
  | "scrap"
  | "ironclad"
  | "apex"
  | "velocity"
  | "cosmic"
  | "sovereign"
  | "vanguard"
  | "overlord";

export interface RankTierInfo {
  tier: RankTier;
  tierName: string;
  minMmr: number;
  maxMmr: number;
  colorHex: string;
  badgeClass: string;
  glowClass: string;
  divisions: number; // 4 divisions per tier (except overlord which is pinnacle)
  iconName: string;
}

export interface PlayerRankProfile {
  mmr: number;
  peakMmr: number;
  tier: RankTier;
  subTier: number; // 1, 2, 3
  division: number; // 1, 2, 3, 4
  wins: number;
  losses: number;
  streak: number; // positive for winstreak, negative for losestreak
  matchesPlayed: number;
  seasonName: string;
}

export type RankedTrack = "player" | "bot";

export interface RankedMatchResult {
  track?: RankedTrack;
  isWin: boolean;
  oldMmr: number;
  newMmr: number;
  deltaMmr: number;
  oldTier: RankTier;
  oldSubTier: number;
  oldDiv: number;
  newTier: RankTier;
  newSubTier: number;
  newDiv: number;
  isPromotion: boolean;
  isDemotion: boolean;
  streak: number;
}

export interface RankedBotProfile {
  name: string;
  mmr: number;
  tier: RankTier;
  subTier: number;
  division: number;
  carModel: string;
  difficulty: "rookie" | "pro" | "allstar" | "ssl" | "unfair";
  avatarColor: string;
}
