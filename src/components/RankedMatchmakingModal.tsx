import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Trophy,
  Shield,
  Zap,
  Flame,
  Sparkles,
  Target,
  Crown,
  Search,
  Users,
  RotateCw,
  CheckCircle2,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import { PlayerRankProfile, RankedBotProfile, RankTier } from "../ranked/rankedTypes";
import {
  getRankedProfile,
  RANK_TIERS,
  calculateRankDetails
} from "../ranked/rankedStorage";
import { generateRankedOpponent } from "../ranked/rankedEngine";

interface RankedMatchmakingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartRankedMatch: (
    playlist: "1v1" | "2v2" | "3v3",
    opponent: RankedBotProfile
  ) => void;
}

export const RankedMatchmakingModal: React.FC<RankedMatchmakingModalProps> = ({
  isOpen,
  onClose,
  onStartRankedMatch
}) => {
  const [profile, setProfile] = useState<PlayerRankProfile>(getRankedProfile);
  const [selectedPlaylist, setSelectedPlaylist] = useState<"1v1" | "2v2" | "3v3">("1v1");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchSeconds, setSearchSeconds] = useState<number>(0);
  const [matchedOpponent, setMatchedOpponent] = useState<RankedBotProfile | null>(null);
  const [matchCountdown, setMatchCountdown] = useState<number>(3);

  const searchTimerRef = useRef<any>(null);
  const matchTimerRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      setProfile(getRankedProfile());
      setIsSearching(false);
      setSearchSeconds(0);
      setMatchedOpponent(null);
      setMatchCountdown(3);
    } else {
      clearInterval(searchTimerRef.current);
      clearInterval(matchTimerRef.current);
    }
  }, [isOpen]);

  const rankDetails = calculateRankDetails(profile.mmr);
  const tierInfo = RANK_TIERS[rankDetails.tier] || RANK_TIERS.ironclad;

  const handleStartSearch = () => {
    setIsSearching(true);
    setSearchSeconds(0);
    setMatchedOpponent(null);

    // Queue timer
    searchTimerRef.current = setInterval(() => {
      setSearchSeconds(prev => prev + 1);
    }, 1000);

    // Matchmaking delay simulation (1.5 to 3.5 seconds)
    const matchDelay = 1800 + Math.random() * 1600;
    setTimeout(() => {
      clearInterval(searchTimerRef.current);
      const opp = generateRankedOpponent(profile.mmr);
      setMatchedOpponent(opp);

      // Countdown into match
      let count = 3;
      setMatchCountdown(3);
      matchTimerRef.current = setInterval(() => {
        count -= 1;
        setMatchCountdown(count);
        if (count <= 0) {
          clearInterval(matchTimerRef.current);
          onStartRankedMatch(selectedPlaylist, opp);
          onClose();
        }
      }, 1000);
    }, matchDelay);
  };

  const handleCancelSearch = () => {
    clearInterval(searchTimerRef.current);
    clearInterval(matchTimerRef.current);
    setIsSearching(false);
    setMatchedOpponent(null);
    setSearchSeconds(0);
  };

  if (!isOpen) return null;

  const totalMatches = profile.matchesPlayed || 1;
  const winRate = Math.round((profile.wins / totalMatches) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 animate-fade-in font-sans select-none">
      <div className="bg-slate-950/95 border border-slate-700/80 rounded-3xl w-full max-w-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:px-6 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-gaming font-black tracking-wide text-white">
                COMPETITIVE RANKED PLAY
              </h2>
              <p className="text-xs text-slate-400">
                {profile.seasonName} • Skill Rating & Division Progression
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              handleCancelSearch();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Top Rank Emblem Card */}
          <div
            className={`p-5 rounded-3xl border-2 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 ${tierInfo.badgeClass}`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl border border-white/20 shrink-0 ${tierInfo.glowClass}`}
                style={{ backgroundColor: `${tierInfo.colorHex}25` }}
              >
                <Trophy
                  className="w-10 h-10 drop-shadow-md"
                  style={{ color: tierInfo.colorHex }}
                />
              </div>

              <div>
                <div className="text-[10px] font-gaming font-bold uppercase tracking-widest text-slate-400">
                  Current Competitive Rank
                </div>
                <div className="text-xl sm:text-2xl font-gaming font-black text-white">
                  {rankDetails.label}
                </div>
                <div className="text-xs font-mono font-bold text-amber-400 mt-0.5">
                  {profile.mmr} MMR{" "}
                  <span className="text-slate-400 text-[10px]">
                    (Peak: {profile.peakMmr} MMR)
                  </span>
                </div>
              </div>
            </div>

            {/* Division Progress Bar */}
            <div className="w-full sm:w-48 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[10px] font-gaming text-slate-300 font-bold">
                <span>Division Progress</span>
                <span className="font-mono">{rankDetails.progressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${rankDetails.progressPercent}%`,
                    backgroundColor: tierInfo.colorHex
                  }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>Div I</span>
                <span>Div II</span>
                <span>Div III</span>
                <span>Div IV</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-4 gap-2">
            <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Wins</div>
              <div className="text-lg font-mono font-black text-emerald-400 mt-0.5">
                {profile.wins}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Losses</div>
              <div className="text-lg font-mono font-black text-rose-400 mt-0.5">
                {profile.losses}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Win Rate</div>
              <div className="text-lg font-mono font-black text-sky-400 mt-0.5">
                {profile.matchesPlayed > 0 ? `${winRate}%` : "—"}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Streak</div>
              <div
                className={`text-lg font-mono font-black mt-0.5 ${
                  profile.streak > 0
                    ? "text-amber-400"
                    : profile.streak < 0
                    ? "text-rose-400"
                    : "text-slate-400"
                }`}
              >
                {profile.streak > 0 ? `+${profile.streak} W` : profile.streak < 0 ? `${profile.streak} L` : "0"}
              </div>
            </div>
          </div>

          {/* Playlist Selection */}
          {!isSearching && !matchedOpponent && (
            <div>
              <label className="text-xs font-gaming font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2.5">
                <Target className="w-4 h-4 text-sky-400" />
                <span>Select Competitive Playlist</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: "1v1", title: "Ranked 1v1 Duel", desc: "Solo skills, ball control & 50/50s." },
                  { id: "2v2", title: "Ranked 2v2 Doubles", desc: "Fast rotations & lethal passing plays." },
                  { id: "3v3", title: "Ranked 3v3 Standard", desc: "The ultimate tournament experience." }
                ].map(pl => {
                  const isSelected = selectedPlaylist === pl.id;
                  return (
                    <button
                      key={pl.id}
                      onClick={() => setSelectedPlaylist(pl.id as any)}
                      className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-amber-950/40 border-amber-400 text-white shadow-lg ring-1 ring-amber-400/50"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300"
                      }`}
                    >
                      <div>
                        <div className="font-gaming font-bold text-sm text-white">{pl.title}</div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          {pl.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Match Searching Radar Overlay */}
          {isSearching && !matchedOpponent && (
            <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
              {/* Radar scanner visual */}
              <div className="relative w-20 h-20 rounded-full border-2 border-amber-500/40 flex items-center justify-center shadow-lg">
                <div className="absolute inset-0 rounded-full border border-amber-400/60 animate-ping" />
                <RotateCw className="w-8 h-8 text-amber-400 animate-spin" />
              </div>

              <div>
                <h3 className="font-gaming font-black text-lg text-white">
                  SEARCHING FOR COMPETITOR...
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Finding opponent near {profile.mmr} MMR ({selectedPlaylist.toUpperCase()}) • Elapsed: {searchSeconds}s
                </p>
              </div>

              <button
                onClick={handleCancelSearch}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-gaming font-bold text-xs uppercase transition cursor-pointer"
              >
                Cancel Search
              </button>
            </div>
          )}

          {/* Opponent Found Reveal */}
          {matchedOpponent && (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/60 via-slate-900/90 to-slate-950 border-2 border-emerald-500/60 flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-gaming font-black uppercase">
                <CheckCircle2 className="w-4 h-4" />
                <span>MATCH FOUND!</span>
              </div>

              <div className="flex items-center gap-6 my-2">
                {/* You */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-sky-500/20 border border-sky-400/50 flex items-center justify-center font-gaming font-black text-sky-300 text-xl">
                    YOU
                  </div>
                  <span className="text-xs font-bold text-white mt-1">Player</span>
                  <span className="text-[10px] font-mono text-sky-400">{profile.mmr} MMR</span>
                </div>

                <div className="font-gaming font-black text-xl text-slate-500">VS</div>

                {/* Opponent */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center font-gaming font-black text-white text-xl shadow-lg"
                    style={{ backgroundColor: matchedOpponent.avatarColor }}
                  >
                    {matchedOpponent.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-white mt-1">{matchedOpponent.name}</span>
                  <span className="text-[10px] font-mono text-amber-400">{matchedOpponent.mmr} MMR</span>
                </div>
              </div>

              <div className="text-sm font-gaming font-black text-emerald-400">
                Match starting in {matchCountdown}...
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isSearching && !matchedOpponent && (
          <div className="p-4 sm:px-6 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-gaming font-bold text-xs uppercase transition cursor-pointer"
            >
              Back
            </button>

            <button
              onClick={handleStartSearch}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-gaming font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition cursor-pointer active:scale-95 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Find Match</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
