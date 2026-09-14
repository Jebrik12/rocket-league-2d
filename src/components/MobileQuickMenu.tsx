import React from "react";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Settings,
  HelpCircle,
  Clock,
  Film,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  Camera,
  Globe,
  LogOut,
  Smartphone,
  Car,
  Package,
  Trophy,
  Coins,
  Bot
} from "lucide-react";

interface MobileQuickMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onResetMatch: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenSettings: () => void;
  onOpenControls: () => void;
  onOpenMatchHistory: () => void;
  onOpenReplayStudio?: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  autoCam: boolean;
  onToggleAutoCam?: () => void;
  isMultiplayerActive: boolean;
  multiplayerRoomCode: string | null;
  onOpenMultiplayer?: () => void;
  onLeaveMultiplayer?: () => void;
  onOpenGarage?: () => void;
  onOpenCrates?: () => void;
  onOpenRanked?: () => void;
  onOpenMatchSetup?: () => void;
  coinsCount?: number;
  unopenedCratesCount?: number;
  currentRankLabel?: string;
}

export const MobileQuickMenu: React.FC<MobileQuickMenuProps> = ({
  isOpen,
  onClose,
  isPaused,
  onTogglePause,
  onResetMatch,
  isFullscreen,
  onToggleFullscreen,
  onOpenSettings,
  onOpenControls,
  onOpenMatchHistory,
  onOpenReplayStudio,
  soundEnabled,
  onToggleSound,
  autoCam,
  onToggleAutoCam,
  isMultiplayerActive,
  multiplayerRoomCode,
  onOpenMultiplayer,
  onLeaveMultiplayer,
  onOpenGarage,
  onOpenCrates,
  onOpenRanked,
  onOpenMatchSetup,
  coinsCount,
  unopenedCratesCount,
  currentRankLabel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md select-none animate-fade-in">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl max-w-sm w-full text-slate-100 flex flex-col gap-3.5 font-sans max-h-[94dvh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-sky-400" />
            <span className="font-gaming font-black text-sm uppercase tracking-wider text-white">
              Quick Menu
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Meta Progression Quick Cards */}
        <div className="grid grid-cols-2 gap-2">
          {onOpenGarage && (
            <button
              onClick={() => {
                onClose();
                onOpenGarage();
              }}
              className="p-2.5 rounded-xl bg-gradient-to-br from-sky-950/70 to-slate-900 border border-sky-500/40 hover:border-sky-400 text-left flex items-center gap-2 transition active:scale-95 cursor-pointer shadow-sm"
            >
              <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 shrink-0">
                <Car className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-gaming font-black text-white truncate">Garage</div>
                <div className="text-[10px] text-amber-400 font-mono font-bold truncate">
                  {(coinsCount ?? 1500).toLocaleString()} 🪙
                </div>
              </div>
            </button>
          )}

          {onOpenCrates && (
            <button
              onClick={() => {
                onClose();
                onOpenCrates();
              }}
              className="p-2.5 rounded-xl bg-gradient-to-br from-purple-950/70 to-slate-900 border border-purple-500/40 hover:border-purple-400 text-left flex items-center gap-2 transition active:scale-95 cursor-pointer shadow-sm"
            >
              <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 shrink-0">
                <Package className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-gaming font-black text-white truncate">Crates</div>
                <div className="text-[10px] text-purple-300 font-mono font-bold truncate">
                  {unopenedCratesCount ?? 0} Crates
                </div>
              </div>
            </button>
          )}

          {onOpenRanked && (
            <button
              onClick={() => {
                onClose();
                onOpenRanked();
              }}
              className="p-2.5 rounded-xl bg-gradient-to-br from-amber-950/50 to-slate-900 border border-amber-500/40 hover:border-amber-400 text-left flex items-center gap-2 transition active:scale-95 cursor-pointer shadow-sm"
            >
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                <Trophy className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-gaming font-black text-white truncate">Ranked</div>
                <div className="text-[10px] text-amber-300 font-gaming font-bold truncate">
                  {currentRankLabel || "Ranked MMR"}
                </div>
              </div>
            </button>
          )}

          {onOpenMatchSetup && (
            <button
              onClick={() => {
                onClose();
                onOpenMatchSetup();
              }}
              className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-950/50 to-slate-900 border border-emerald-500/40 hover:border-emerald-400 text-left flex items-center gap-2 transition active:scale-95 cursor-pointer shadow-sm"
            >
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-gaming font-black text-white truncate">Host Match</div>
                <div className="text-[10px] text-emerald-300 font-gaming font-bold truncate">
                  Human / Bot
                </div>
              </div>
            </button>
          )}
        </div>

        {/* Multiplayer Status Pill (if connected) */}
        {isMultiplayerActive && (
          <div className="p-3 rounded-2xl bg-slate-900 border border-emerald-500/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-gaming font-bold text-slate-300">Room:</span>
              <span className="font-mono font-black text-amber-400 text-sm">
                {multiplayerRoomCode || "ONLINE"}
              </span>
            </div>
            <div className="flex gap-2">
              {onOpenMultiplayer && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenMultiplayer();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-sky-600/30 border border-sky-400/50 text-sky-300 text-xs font-gaming font-bold cursor-pointer"
                >
                  Lobby
                </button>
              )}
              {onLeaveMultiplayer && (
                <button
                  onClick={() => {
                    onClose();
                    onLeaveMultiplayer();
                  }}
                  className="p-1 rounded-lg bg-rose-950/60 border border-rose-500/50 text-rose-400 hover:text-rose-200 cursor-pointer"
                  title="Leave Room"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Primary Action Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs font-gaming font-bold">
          {/* Pause / Resume */}
          <button
            onClick={() => {
              onTogglePause();
              onClose();
            }}
            className={`p-3 rounded-2xl border flex items-center gap-2.5 transition active:scale-95 cursor-pointer ${
              isPaused
                ? "bg-emerald-600/30 border-emerald-500/60 text-emerald-300"
                : "bg-slate-900/90 border-slate-800 text-slate-200"
            }`}
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
            <span>{isPaused ? "Resume Match" : "Pause Match"}</span>
          </button>

          {/* Restart Match */}
          <button
            onClick={() => {
              onClose();
              onResetMatch();
            }}
            className="p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 text-slate-200 flex items-center gap-2.5 transition active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-sky-400" />
            <span>Restart Match</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={onToggleFullscreen}
            className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-200 flex items-center gap-2.5 transition active:scale-95 cursor-pointer"
          >
            {isFullscreen ? (
              <>
                <Minimize className="w-4 h-4 text-amber-400" />
                <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize className="w-4 h-4 text-sky-400" />
                <span>Fullscreen</span>
              </>
            )}
          </button>

          {/* Audio Mute/Unmute */}
          <button
            onClick={onToggleSound}
            className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-200 flex items-center gap-2.5 transition active:scale-95 cursor-pointer"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>Audio: ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-400" />
                <span>Audio: MUTED</span>
              </>
            )}
          </button>

          {/* Auto Dynamic Camera */}
          {onToggleAutoCam && (
            <button
              onClick={onToggleAutoCam}
              className={`p-3 rounded-2xl border flex items-center gap-2.5 transition active:scale-95 cursor-pointer ${
                autoCam
                  ? "bg-purple-950/60 border-purple-400/60 text-purple-200"
                  : "bg-slate-900/90 border-slate-800 text-slate-300"
              }`}
            >
              <Camera className="w-4 h-4 text-purple-400" />
              <span>Camera: {autoCam ? "Dynamic" : "Fixed"}</span>
            </button>
          )}

          {/* Multiplayer Modal (if not active) */}
          {!isMultiplayerActive && onOpenMultiplayer && (
            <button
              onClick={() => {
                onClose();
                onOpenMultiplayer();
              }}
              className="p-3 rounded-2xl bg-gradient-to-r from-sky-600/30 to-emerald-600/30 border border-sky-500/50 text-white flex items-center gap-2.5 transition active:scale-95 cursor-pointer"
            >
              <Globe className="w-4 h-4 text-sky-400" />
              <span>Multiplayer</span>
            </button>
          )}

          {/* Settings Modal */}
          <button
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-200 flex items-center gap-2.5 transition active:scale-95 cursor-pointer"
          >
            <Settings className="w-4 h-4 text-sky-400" />
            <span>Settings</span>
          </button>

          {/* Controls Guide */}
          <button
            onClick={() => {
              onClose();
              onOpenControls();
            }}
            className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-200 flex items-center gap-2.5 transition active:scale-95 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>Controls Guide</span>
          </button>

          {/* Match History */}
          <button
            onClick={() => {
              onClose();
              onOpenMatchHistory();
            }}
            className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-200 flex items-center gap-2.5 transition active:scale-95 cursor-pointer"
          >
            <Clock className="w-4 h-4 text-sky-400" />
            <span>Match History</span>
          </button>

          {/* Replay Studio */}
          {onOpenReplayStudio && (
            <button
              onClick={() => {
                onClose();
                onOpenReplayStudio();
              }}
              className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-200 flex items-center gap-2.5 transition active:scale-95 cursor-pointer"
            >
              <Film className="w-4 h-4 text-amber-400" />
              <span>Replay Studio</span>
            </button>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
        >
          Back to Game
        </button>
      </div>
    </div>
  );
};
