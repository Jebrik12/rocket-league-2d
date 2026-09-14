import React, { useState, useEffect } from "react";
import {
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Coins,
  Package,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Bot,
  User,
  X
} from "lucide-react";
import { RankedMatchResult } from "../ranked/rankedTypes";
import { RANK_TIERS, calculateRankDetails } from "../ranked/rankedStorage";

interface RankProgressionOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  result: RankedMatchResult | null;
  rewards: {
    xpEarned: number;
    coinsEarned?: number;
    creditsEarned: number;
    crateDropped?: string;
  } | null;
  onOpenCrate?: (crateId: string) => void;
  onOpenGarage?: () => void;
}

export const RankProgressionOverlay: React.FC<RankProgressionOverlayProps> = ({
  isOpen,
  onClose,
  result,
  rewards,
  onOpenCrate,
  onOpenGarage
}) => {
  const [animProgress, setAnimProgress] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setAnimProgress(0);
      const timer = setTimeout(() => {
        setAnimProgress(1);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen || !result) return null;

  const currentDetails = calculateRankDetails(result.newMmr);
  const tierInfo = RANK_TIERS[currentDetails.tier] || RANK_TIERS.ironclad;
  const isBotTrack = result.track === "bot";

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 animate-fade-in font-sans select-none">
      <div
        className={`bg-slate-950 border-2 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 max-w-sm w-full shadow-2xl flex flex-col items-center text-center relative overflow-hidden text-slate-100 max-h-[92dvh] overflow-y-auto ${tierInfo.badgeClass}`}
      >
        {/* Track & Win/Loss Header Tag */}
        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap justify-center">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-gaming font-black uppercase tracking-wider border flex items-center gap-1 ${
              isBotTrack
                ? "bg-purple-500/20 text-purple-300 border-purple-400/40"
                : "bg-sky-500/20 text-sky-300 border-sky-400/40"
            }`}
          >
            {isBotTrack ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
            <span>{isBotTrack ? "BOT LEAGUE" : "PLAYER RANKED"}</span>
          </span>

          {result.isWin ? (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 text-[10px] font-gaming font-black uppercase tracking-wider">
              VICTORY
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-400/40 text-[10px] font-gaming font-black uppercase tracking-wider">
              DEFEAT
            </span>
          )}
        </div>

        {/* Promotion banner if promoted */}
        {result.isPromotion && (
          <div className="my-1 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white font-gaming font-black text-[11px] uppercase shadow-lg animate-bounce flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DIVISION PROMOTION!</span>
          </div>
        )}

        {/* Rank Emblem */}
        <div
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center my-2 shadow-xl border border-white/20 shrink-0 ${tierInfo.glowClass}`}
          style={{ backgroundColor: `${tierInfo.colorHex}30` }}
        >
          <Trophy className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-md" style={{ color: tierInfo.colorHex }} />
        </div>

        {/* Rank Title & Division */}
        <div className="text-base sm:text-lg font-gaming font-black text-white">
          {currentDetails.label}
        </div>

        {/* MMR Delta Counter */}
        <div className="flex items-center justify-center gap-2 my-1.5">
          <span className="text-base font-mono font-black text-white">{result.newMmr} MMR</span>
          <span
            className={`flex items-center text-xs font-mono font-black px-1.5 py-0.2 rounded-lg border ${
              result.deltaMmr >= 0
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                : "bg-rose-500/20 text-rose-400 border-rose-500/40"
            }`}
          >
            {result.deltaMmr >= 0 ? (
              <>
                <ArrowUpRight className="w-3.5 h-3.5" />+{result.deltaMmr}
              </>
            ) : (
              <>
                <ArrowDownRight className="w-3.5 h-3.5" />
                {result.deltaMmr}
              </>
            )}
          </span>
        </div>

        {/* Animated Division Progress Bar */}
        <div className="w-full my-2">
          <div className="flex justify-between text-[9px] font-gaming text-slate-300 font-bold mb-1">
            <span>Division Progress</span>
            <span className="font-mono">{currentDetails.progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 sm:h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${animProgress ? currentDetails.progressPercent : 0}%`,
                backgroundColor: tierInfo.colorHex
              }}
            />
          </div>
        </div>

        {/* Match Rewards Card */}
        {rewards && (
          <div className="w-full p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 my-1.5 space-y-1 text-xs text-left">
            <div className="text-[9px] uppercase font-gaming font-bold text-slate-400 mb-0.5">
              Match Rewards
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>Gold Coins</span>
              </span>
              <span className="font-mono font-bold text-amber-300">
                +{(rewards.coinsEarned ?? rewards.creditsEarned).toLocaleString()} 🪙
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-300 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                <span>Mastery XP</span>
              </span>
              <span className="font-mono font-bold text-sky-400">+{rewards.xpEarned} XP</span>
            </div>

            {rewards.crateDropped && (
              <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-amber-300 font-gaming font-bold text-[11px]">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Package className="w-3.5 h-3.5 animate-bounce" />
                  <span>Crate Dropped!</span>
                </span>
                {onOpenCrate && (
                  <button
                    onClick={() => {
                      onOpenCrate(rewards.crateDropped!);
                      onClose();
                    }}
                    className="px-2 py-0.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 text-[9px] uppercase cursor-pointer"
                  >
                    Open
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Close / Action Button */}
        <div className="flex items-center gap-2 w-full mt-2">
          {onOpenGarage && (
            <button
              onClick={() => {
                onOpenGarage();
                onClose();
              }}
              className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-gaming font-bold text-xs uppercase transition cursor-pointer"
            >
              Garage
            </button>
          )}

          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 text-white font-gaming font-black text-xs uppercase tracking-wide shadow-md shadow-sky-500/25 transition cursor-pointer active:scale-95"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};
