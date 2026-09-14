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
  TrendingUp,
  Bot,
  User,
  Cpu,
  ArrowUpRight
} from "lucide-react";
import { PlayerRankProfile, RankedBotProfile, RankedTrack } from "../ranked/rankedTypes";
import {
  getRankedProfile,
  getBotRankedProfile,
  RANK_TIERS,
  calculateRankDetails
} from "../ranked/rankedStorage";
import { generateRankedOpponent } from "../ranked/rankedEngine";
import { getBotUpgrades, getBotOverallLevel } from "../bot/botUpgradeStorage";
import { ARCHETYPE_CONFIG } from "../bot/botUpgradeTypes";

interface RankedMatchmakingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartRankedMatch: (
    playlist: "1v1" | "2v2" | "3v3",
    opponent: RankedBotProfile,
    track: RankedTrack
  ) => void;
  onOpenBotUpgrades?: () => void;
}

export const RankedMatchmakingModal: React.FC<RankedMatchmakingModalProps> = ({
  isOpen,
  onClose,
  onStartRankedMatch,
  onOpenBotUpgrades
}) => {
  const [selectedTrack, setSelectedTrack] = useState<RankedTrack>("player");
  const [playerProfile, setPlayerProfile] = useState<PlayerRankProfile>(getRankedProfile);
  const [botProfile, setBotProfile] = useState<PlayerRankProfile>(getBotRankedProfile);
  const [selectedPlaylist, setSelectedPlaylist] = useState<"1v1" | "2v2" | "3v3">("1v1");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchSeconds, setSearchSeconds] = useState<number>(0);
  const [matchedOpponent, setMatchedOpponent] = useState<RankedBotProfile | null>(null);
  const [matchCountdown, setMatchCountdown] = useState<number>(3);
  const [botUpgrades, setBotUpgrades] = useState(getBotUpgrades);

  const searchTimerRef = useRef<any>(null);
  const matchTimerRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      setPlayerProfile(getRankedProfile());
      setBotProfile(getBotRankedProfile());
      setBotUpgrades(getBotUpgrades());
      setIsSearching(false);
      setSearchSeconds(0);
      setMatchedOpponent(null);
      setMatchCountdown(3);
    } else {
      clearInterval(searchTimerRef.current);
      clearInterval(matchTimerRef.current);
    }
  }, [isOpen]);

  const activeProfile = selectedTrack === "bot" ? botProfile : playerProfile;
  const rankDetails = calculateRankDetails(activeProfile.mmr);
  const tierInfo = RANK_TIERS[rankDetails.tier] || RANK_TIERS.ironclad;
  const botLevel = getBotOverallLevel(botUpgrades);
  const botArchetype = ARCHETYPE_CONFIG[botUpgrades.tacticalArchetype] || ARCHETYPE_CONFIG.balanced;

  const handleStartSearch = () => {
    setIsSearching(true);
    setSearchSeconds(0);
    setMatchedOpponent(null);

    searchTimerRef.current = setInterval(() => {
      setSearchSeconds(prev => prev + 1);
    }, 1000);

    const matchDelay = 1600 + Math.random() * 1500;
    setTimeout(() => {
      clearInterval(searchTimerRef.current);
      const opp = generateRankedOpponent(activeProfile.mmr, selectedTrack);
      setMatchedOpponent(opp);

      let count = 3;
      setMatchCountdown(3);
      matchTimerRef.current = setInterval(() => {
        count -= 1;
        setMatchCountdown(count);
        if (count <= 0) {
          clearInterval(matchTimerRef.current);
          onStartRankedMatch(selectedPlaylist, opp, selectedTrack);
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

  const totalMatches = activeProfile.matchesPlayed || 1;
  const winRate = Math.round((activeProfile.wins / totalMatches) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 animate-fade-in font-sans select-none">
      <div className="bg-slate-950/95 border border-slate-700/80 rounded-2xl sm:rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 max-h-[90dvh]">
        {/* Header */}
        <div className="px-3 sm:px-5 py-2.5 sm:py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/70 shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="p-1.5 sm:p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-lg font-gaming font-black tracking-wide text-white">
                COMPETITIVE RANKED
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-400">
                {activeProfile.seasonName}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              handleCancelSearch();
              onClose();
            }}
            className="p-1 sm:p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Dual Track Switcher: Player Ranked vs Bot League */}
        <div className="px-3 sm:px-5 pt-2.5 pb-1 bg-slate-900/40 border-b border-slate-800/80 shrink-0">
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800">
            <button
              disabled={isSearching}
              onClick={() => {
                setSelectedTrack("player");
                setMatchedOpponent(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-gaming font-bold transition cursor-pointer ${
                selectedTrack === "player"
                  ? "bg-sky-500 text-slate-950 font-black shadow-md shadow-sky-500/25"
                  : "text-slate-400 hover:text-white"
              } ${isSearching ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <User className="w-3.5 h-3.5" />
              <span>🎮 Pilot (Human)</span>
            </button>

            <button
              disabled={isSearching}
              onClick={() => {
                setSelectedTrack("bot");
                setMatchedOpponent(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-gaming font-bold transition cursor-pointer ${
                selectedTrack === "bot"
                  ? "bg-purple-500 text-slate-950 font-black shadow-md shadow-purple-500/25"
                  : "text-slate-400 hover:text-white"
              } ${isSearching ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>🤖 Bot League</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-3 sm:space-y-4 flex-1">
          {/* Top Rank Emblem Card */}
          <div
            className={`p-3.5 sm:p-4 rounded-2xl border-2 flex flex-col sm:flex-row items-center justify-between gap-3 relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 ${tierInfo.badgeClass}`}
          >
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div
                className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center shadow-lg border border-white/20 shrink-0 ${tierInfo.glowClass}`}
                style={{ backgroundColor: `${tierInfo.colorHex}25` }}
              >
                <Trophy
                  className="w-6 h-6 sm:w-8 sm:h-8 drop-shadow-md"
                  style={{ color: tierInfo.colorHex }}
                />
              </div>

              <div className="min-w-0">
                <div className="text-[9px] font-gaming font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  {selectedTrack === "bot" ? (
                    <span className="text-purple-400">🤖 Personal Bot Rank</span>
                  ) : (
                    <span className="text-sky-400">🎮 Player Rank</span>
                  )}
                </div>
                <div className="text-base sm:text-lg font-gaming font-black text-white truncate">
                  {rankDetails.label}
                </div>
                <div className="text-[11px] font-mono font-bold text-amber-400">
                  {activeProfile.mmr} MMR{" "}
                  <span className="text-slate-400 text-[10px]">
                    (Peak: {activeProfile.peakMmr})
                  </span>
                </div>
              </div>
            </div>

            {/* Division Progress Bar */}
            <div className="w-full sm:w-44 flex flex-col gap-1 shrink-0">
              <div className="flex items-center justify-between text-[10px] font-gaming text-slate-300 font-bold">
                <span>Div Progress</span>
                <span className="font-mono">{rankDetails.progressPercent}%</span>
              </div>
              <div className="w-full h-1.5 sm:h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${rankDetails.progressPercent}%`,
                    backgroundColor: tierInfo.colorHex
                  }}
                />
              </div>
              <div className="flex justify-between text-[8px] font-mono text-slate-500">
                <span>Div I</span>
                <span>Div II</span>
                <span>Div III</span>
                <span>Div IV</span>
              </div>
            </div>
          </div>

          {/* If Bot Track: Bot Stats & Upgrade Shortcut Card */}
          {selectedTrack === "bot" && (
            <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/40 shrink-0">
                  <Cpu className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-gaming font-black text-xs sm:text-sm text-white truncate">
                      {botUpgrades.botName}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-purple-900/60 border border-purple-400/50 text-[10px] font-mono font-bold text-purple-200">
                      LVL {botLevel}/20
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    Archetype: <span className={`font-bold ${botArchetype.color}`}>{botArchetype.name}</span>
                  </div>
                </div>
              </div>

              {onOpenBotUpgrades && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenBotUpgrades();
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 text-white font-gaming font-black text-[11px] uppercase tracking-wide shrink-0 shadow-md shadow-purple-500/20 transition cursor-pointer flex items-center gap-1"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Upgrades</span>
                </button>
              )}
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-center">
              <div className="text-[9px] uppercase font-bold text-slate-400">Wins</div>
              <div className="text-sm sm:text-base font-mono font-black text-emerald-400 mt-0.5">
                {activeProfile.wins}
              </div>
            </div>
            <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-center">
              <div className="text-[9px] uppercase font-bold text-slate-400">Losses</div>
              <div className="text-sm sm:text-base font-mono font-black text-rose-400 mt-0.5">
                {activeProfile.losses}
              </div>
            </div>
            <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-center">
              <div className="text-[9px] uppercase font-bold text-slate-400">Win Rate</div>
              <div className="text-sm sm:text-base font-mono font-black text-sky-400 mt-0.5">
                {activeProfile.matchesPlayed > 0 ? `${winRate}%` : "—"}
              </div>
            </div>
            <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-center">
              <div className="text-[9px] uppercase font-bold text-slate-400">Streak</div>
              <div
                className={`text-sm sm:text-base font-mono font-black mt-0.5 ${
                  activeProfile.streak > 0
                    ? "text-amber-400"
                    : activeProfile.streak < 0
                    ? "text-rose-400"
                    : "text-slate-400"
                }`}
              >
                {activeProfile.streak > 0
                  ? `+${activeProfile.streak} W`
                  : activeProfile.streak < 0
                  ? `${activeProfile.streak} L`
                  : "0"}
              </div>
            </div>
          </div>

          {/* Playlist Selection */}
          {!isSearching && !matchedOpponent && (
            <div>
              <label className="text-[11px] font-gaming font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                <Target className="w-3.5 h-3.5 text-sky-400" />
                <span>Select Format</span>
              </label>

              <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
                {[
                  { id: "1v1", title: "1v1 Duel", desc: "Pure solo mastery & 50/50s." },
                  { id: "2v2", title: "2v2 Doubles", desc: "Team rotations & pass plays." },
                  { id: "3v3", title: "3v3 Standard", desc: "Tournament standard 3v3." }
                ].map(pl => {
                  const isSelected = selectedPlaylist === pl.id;
                  return (
                    <button
                      key={pl.id}
                      onClick={() => setSelectedPlaylist(pl.id as any)}
                      className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? selectedTrack === "bot"
                            ? "bg-purple-950/50 border-purple-400 text-white shadow-md ring-1 ring-purple-400/50"
                            : "bg-amber-950/40 border-amber-400 text-white shadow-md ring-1 ring-amber-400/50"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300"
                      }`}
                    >
                      <div>
                        <div className="font-gaming font-bold text-xs sm:text-sm text-white">{pl.title}</div>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-tight hidden sm:block">
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
            <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3 animate-fade-in">
              <div className="relative w-14 h-14 sm:w-18 sm:h-18 rounded-full border-2 border-amber-500/40 flex items-center justify-center shadow-lg">
                <div className="absolute inset-0 rounded-full border border-amber-400/60 animate-ping" />
                <RotateCw className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400 animate-spin" />
              </div>

              <div>
                <h3 className="font-gaming font-black text-sm sm:text-base text-white">
                  SEARCHING FOR {selectedTrack === "bot" ? "BOT" : "COMPETITOR"}...
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Finding match near {activeProfile.mmr} MMR ({selectedPlaylist.toUpperCase()}) • {searchSeconds}s
                </p>
              </div>

              <button
                onClick={handleCancelSearch}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-gaming font-bold text-[11px] uppercase transition cursor-pointer"
              >
                Cancel Search
              </button>
            </div>
          )}

          {/* Opponent Found Reveal */}
          {matchedOpponent && (
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-950/60 via-slate-900/90 to-slate-950 border-2 border-emerald-500/60 flex flex-col items-center justify-center text-center space-y-3 animate-fade-in">
              <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[11px] font-gaming font-black uppercase">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>MATCH FOUND!</span>
              </div>

              <div className="flex items-center gap-4 sm:gap-6 my-1">
                {/* You / Your Bot */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/50 flex items-center justify-center font-gaming font-black text-sky-300 text-lg">
                    {selectedTrack === "bot" ? "BOT" : "YOU"}
                  </div>
                  <span className="text-xs font-bold text-white mt-1 max-w-[80px] truncate">
                    {selectedTrack === "bot" ? botUpgrades.botName : "Player"}
                  </span>
                  <span className="text-[10px] font-mono text-sky-400">{activeProfile.mmr} MMR</span>
                </div>

                <div className="font-gaming font-black text-lg text-slate-500">VS</div>

                {/* Opponent */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-gaming font-black text-white text-lg shadow-lg"
                    style={{ backgroundColor: matchedOpponent.avatarColor }}
                  >
                    {matchedOpponent.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-white mt-1 max-w-[80px] truncate">
                    {matchedOpponent.name}
                  </span>
                  <span className="text-[10px] font-mono text-amber-400">{matchedOpponent.mmr} MMR</span>
                </div>
              </div>

              <div className="text-xs sm:text-sm font-gaming font-black text-emerald-400">
                Starting in {matchCountdown}...
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isSearching && !matchedOpponent && (
          <div className="px-3 sm:px-5 py-2.5 sm:py-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-gaming font-bold text-xs uppercase transition cursor-pointer"
            >
              Back
            </button>

            <button
              onClick={handleStartSearch}
              className={`px-5 py-2 rounded-xl text-slate-950 font-gaming font-black text-xs uppercase tracking-wider shadow-lg transition cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                selectedTrack === "bot"
                  ? "bg-gradient-to-r from-purple-400 to-indigo-500 hover:brightness-110 shadow-purple-500/25"
                  : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 shadow-amber-500/25"
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>{selectedTrack === "bot" ? "Deploy Bot & Queue" : "Find Match"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
