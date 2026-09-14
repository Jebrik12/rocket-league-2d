import React, { useState } from "react";
import {
  X,
  Play,
  User,
  Bot,
  Eye,
  Users,
  Layers,
  Zap,
  ShieldAlert,
  Flame,
  Clock,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { MAP_DEFINITIONS } from "../App";

export type PilotMode = "human" | "place_bot" | "just_bots";

export interface MatchSetupConfig {
  pilotMode: PilotMode;
  teamFormat: "1v1" | "2v2" | "3v3";
  botDifficulty: "rookie" | "pro" | "allstar" | "ssl" | "unfair";
  selectedMap: string;
  matchDuration: number;
}

interface MatchSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: any;
  onStartMatch: (config: MatchSetupConfig) => void;
}

export const MatchSetupModal: React.FC<MatchSetupModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onStartMatch
}) => {
  const [pilotMode, setPilotMode] = useState<PilotMode>("human");
  const [teamFormat, setTeamFormat] = useState<"1v1" | "2v2" | "3v3">("1v1");
  const [botDifficulty, setBotDifficulty] = useState<"rookie" | "pro" | "allstar" | "ssl" | "unfair">(
    currentSettings?.botDifficulty || "ssl"
  );
  const [selectedMap, setSelectedMap] = useState<string>(
    currentSettings?.selectedMap || "standard"
  );
  const [matchDuration, setMatchDuration] = useState<number>(180);

  if (!isOpen) return null;

  const handleLaunch = () => {
    onStartMatch({
      pilotMode,
      teamFormat,
      botDifficulty,
      selectedMap,
      matchDuration
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-fade-in font-sans select-none">
      <div className="bg-slate-950/95 border border-slate-700/80 rounded-2xl sm:rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 max-h-[88dvh]">
        {/* Header */}
        <div className="px-3 sm:px-5 py-2.5 sm:py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/70 shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="p-1.5 sm:p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Play className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-gaming font-black tracking-wide text-white">
                CUSTOM MATCH SETUP
              </h2>
              <p className="text-[10px] text-slate-400">
                Choose pilot mode, format, arena, and bot AI
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 sm:p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-3 sm:space-y-4 flex-1">
          {/* 1. Pilot Mode Selection */}
          <div>
            <label className="text-[11px] font-gaming font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
              <User className="w-3.5 h-3.5 text-sky-400" />
              <span>Pilot Mode (How You Play)</span>
            </label>

            <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
              {/* Option A: Play as Human */}
              <button
                onClick={() => setPilotMode("human")}
                className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  pilotMode === "human"
                    ? "bg-sky-950/50 border-sky-400 text-white shadow-md ring-1 ring-sky-400/50"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <User className="w-4 h-4 text-sky-400" />
                    {pilotMode === "human" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                    )}
                  </div>
                  <div className="font-gaming font-bold text-xs sm:text-sm text-white">Play Human</div>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-tight hidden sm:block">
                    Direct controls with touch or keys.
                  </p>
                </div>
              </button>

              {/* Option B: Place Your Bot */}
              <button
                onClick={() => setPilotMode("place_bot")}
                className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  pilotMode === "place_bot"
                    ? "bg-purple-950/50 border-purple-400 text-white shadow-md ring-1 ring-purple-400/50"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Bot className="w-4 h-4 text-purple-400" />
                    {pilotMode === "place_bot" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                    )}
                  </div>
                  <div className="font-gaming font-bold text-xs sm:text-sm text-white">Place Bot</div>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-tight hidden sm:block">
                    Your upgraded bot plays on your team.
                  </p>
                </div>
              </button>

              {/* Option C: Just Bots */}
              <button
                onClick={() => setPilotMode("just_bots")}
                className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  pilotMode === "just_bots"
                    ? "bg-amber-950/50 border-amber-400 text-white shadow-md ring-1 ring-amber-400/50"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Eye className="w-4 h-4 text-amber-400" />
                    {pilotMode === "just_bots" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </div>
                  <div className="font-gaming font-bold text-xs sm:text-sm text-white">Spectate</div>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-tight hidden sm:block">
                    100% AI bot duel. Sit back and watch.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Team Format */}
          <div>
            <label className="text-[11px] font-gaming font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Team Format</span>
            </label>

            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {[
                { id: "1v1", label: "1v1 Duel" },
                { id: "2v2", label: "2v2 Doubles" },
                { id: "3v3", label: "3v3 Standard" }
              ].map(fmt => {
                const active = teamFormat === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    onClick={() => setTeamFormat(fmt.id as any)}
                    className={`py-2 px-2.5 rounded-xl border text-center font-gaming font-bold text-xs transition cursor-pointer ${
                      active
                        ? "bg-emerald-950/50 border-emerald-400 text-emerald-300 shadow-md"
                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {fmt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Bot Difficulty */}
          <div>
            <label className="text-[11px] font-gaming font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Bot Difficulty</span>
            </label>

            <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
              {[
                { id: "rookie", label: "Rookie", color: "text-emerald-400 border-emerald-500/40" },
                { id: "pro", label: "Pro", color: "text-amber-400 border-amber-500/40" },
                { id: "allstar", label: "All-Star", color: "text-purple-400 border-purple-500/40" },
                { id: "ssl", label: "🔥 SSL", color: "text-rose-400 border-rose-500/50" },
                { id: "unfair", label: "💀 Unfair", color: "text-red-400 border-red-500/60" }
              ].map(diff => {
                const active = botDifficulty === diff.id;
                return (
                  <button
                    key={diff.id}
                    onClick={() => setBotDifficulty(diff.id as any)}
                    className={`py-1.5 px-1 rounded-xl border text-center font-gaming font-bold text-[10px] sm:text-xs transition cursor-pointer truncate ${
                      active
                        ? "bg-slate-900 border-white text-white shadow-sm ring-1 ring-white/50"
                        : `bg-slate-900/40 ${diff.color} opacity-70 hover:opacity-100`
                    }`}
                  >
                    {diff.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Arena & Map Selection */}
          <div>
            <label className="text-[11px] font-gaming font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span>Arena Map</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
              {Object.values(MAP_DEFINITIONS).map(map => {
                const active = selectedMap === map.id;
                return (
                  <button
                    key={map.id}
                    onClick={() => setSelectedMap(map.id)}
                    className={`p-2 rounded-xl border text-left font-gaming transition cursor-pointer ${
                      active
                        ? "bg-sky-950/40 border-sky-400 text-white shadow-sm"
                        : "bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="font-bold text-xs text-white truncate">{map.shortName}</div>
                    <div className="text-[9px] text-slate-500 font-mono mt-0.5 truncate">{map.sizeCategory}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer: Start Match Button */}
        <div className="px-3 sm:px-5 py-2.5 sm:py-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-gaming font-bold text-xs uppercase transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleLaunch}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 text-white font-gaming font-black text-xs uppercase tracking-wider shadow-md shadow-sky-500/25 transition cursor-pointer active:scale-95 flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Launch Match</span>
          </button>
        </div>
      </div>
    </div>
  );
};
