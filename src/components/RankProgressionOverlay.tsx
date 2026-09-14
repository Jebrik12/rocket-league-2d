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
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen || !result) return null;

  const currentDetails = calculateRankDetails(result.newMmr);
  const tierInfo = RANK_TIERS[currentDetails.tier] || RANK_TIERS.ironclad;

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-4 animate-fade-in font-sans select-none">
      <div
        className={`bg-slate-950 border-2 rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-2xl flex flex-col items-center text-center relative overflow-hidden text-slate-100 ${tierInfo.badgeClass}`}
      >
        {/* Top Win/Loss status */}
        <div className="flex items-center gap-2 mb-2">
          {result.isWin ? (
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 text-xs font-gaming font-black uppercase tracking-wider">
              VICTORY REWARDS
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-400/40 text-xs font-gaming font-black uppercase tracking-wider">
              MATCH COMPLETED
            </span>
          )}
        </div>

        {/* Promotion banner if promoted */}
        {result.isPromotion && (
          <div className="my-1 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white font-gaming font-black text-xs uppercase shadow-lg animate-bounce flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>DIVISION PROMOTION!</span>
          </div>
        )}

        {/* Rank Emblem */}
        <div
          className={`w-20 h-20 rounded-2xl flex items-center justify-center my-3 shadow-2xl border border-white/20 ${tierInfo.glowClass}`}
          style={{ backgroundColor: `${tierInfo.colorHex}30` }}
        >
          <Trophy className="w-10 h-10 drop-shadow-md" style={{ color: tierInfo.colorHex }} />
        </div>

        {/* Rank Title & Division */}
        <div className="text-xl sm:text-2xl font-gaming font-black text-white">
          {currentDetails.label}
        </div>

        {/* MMR Delta Counter */}
        <div className="flex items-center justify-center gap-2 my-2">
          <span className="text-lg font-mono font-black text-white">{result.newMmr} MMR</span>
          <span
            className={`flex items-center text-sm font-mono font-black px-2 py-0.5 rounded-lg border ${
              result.deltaMmr >= 0
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                : "bg-rose-500/20 text-rose-400 border-rose-500/40"
            }`}
          >
            {result.deltaMmr >= 0 ? (
              <>
                <ArrowUpRight className="w-4 h-4" />+{result.deltaMmr}
              </>
            ) : (
              <>
                <ArrowDownRight className="w-4 h-4" />
                {result.deltaMmr}
              </>
            )}
          </span>
        </div>

        {/* Animated Division Progress Bar */}
        <div className="w-full my-3">
          <div className="flex justify-between text-[10px] font-gaming text-slate-300 font-bold mb-1">
            <span>Division Progress</span>
            <span className="font-mono">{currentDetails.progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
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
          <div className="w-full p-3 rounded-2xl bg-slate-900/90 border border-slate-800 my-2 space-y-1.5 text-xs text-left">
            <div className="text-[10px] uppercase font-gaming font-bold text-slate-400 mb-1">
              Match Rewards
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>Credits Earned</span>
              </span>
              <span className="font-mono font-bold text-amber-400">
                +{rewards.creditsEarned} CR
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-sky-400" />
                <span>Car Mastery XP</span>
              </span>
              <span className="font-mono font-bold text-sky-400">+{rewards.xpEarned} XP</span>
            </div>

            {rewards.crateDropped && (
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-amber-300 font-gaming font-bold">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Package className="w-4 h-4 animate-bounce" />
                  <span>Crate Dropped!</span>
                </span>
                {onOpenCrate && (
                  <button
                    onClick={() => {
                      onOpenCrate(rewards.crateDropped!);
                      onClose();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 text-[10px] uppercase cursor-pointer"
                  >
                    Open Crate
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Close / Action Button */}
        <div className="flex items-center gap-2.5 w-full mt-3">
          {onOpenGarage && (
            <button
              onClick={() => {
                onOpenGarage();
                onClose();
              }}
              className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-gaming font-bold text-xs uppercase transition cursor-pointer"
            >
              Garage
            </button>
          )}

          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 text-white font-gaming font-black text-xs uppercase tracking-wide shadow-lg shadow-sky-500/25 transition cursor-pointer active:scale-95"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};
