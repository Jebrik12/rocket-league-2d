import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Flame,
  RotateCcw,
  Zap
} from "lucide-react";

export interface TouchInputState {
  steerLeft: boolean;
  steerRight: boolean;
  throttleForward: boolean;
  throttleReverse: boolean;
  pitchUp: boolean;
  pitchDown: boolean;
  airRollLeft: boolean;
  airRollRight: boolean;
  jump: boolean;
  boost: boolean;
  handbrake: boolean;
}

interface MobileControlsOverlayProps {
  onChange?: (inputs: TouchInputState) => void;
  onInputChange?: (inputs: TouchInputState) => void;
  playerBoost?: number;
  activeBoost?: number;
  hasFlipReset?: boolean;
  isAirRollInverted?: boolean;
  isGrounded?: boolean;
  isSpectator?: boolean;
  visible?: boolean;
}

export const MobileControlsOverlay: React.FC<MobileControlsOverlayProps> = ({
  onChange,
  onInputChange,
  playerBoost,
  activeBoost,
  hasFlipReset = false,
  isAirRollInverted = false,
  isGrounded = true,
  isSpectator = false,
  visible = true
}) => {
  if (!visible || isSpectator) return null;

  const effectiveBoost = activeBoost !== undefined ? activeBoost : (playerBoost !== undefined ? playerBoost : 100);
  const notifyChange = onInputChange || onChange;
  // Active states for visual feedback
  const [activeInputs, setActiveInputs] = useState<TouchInputState>({
    steerLeft: false,
    steerRight: false,
    throttleForward: false,
    throttleReverse: false,
    pitchUp: false,
    pitchDown: false,
    airRollLeft: false,
    airRollRight: false,
    jump: false,
    boost: false,
    handbrake: false
  });

  // Track pointers to prevent cross-interference between fingers
  const pointersRef = useRef<Map<number, string>>(new Map());
  const stateRef = useRef<TouchInputState>({
    steerLeft: false,
    steerRight: false,
    throttleForward: false,
    throttleReverse: false,
    pitchUp: false,
    pitchDown: false,
    airRollLeft: false,
    airRollRight: false,
    jump: false,
    boost: false,
    handbrake: false
  });

  const commitState = useCallback(() => {
    setActiveInputs({ ...stateRef.current });
    if (notifyChange) notifyChange({ ...stateRef.current });
  }, [notifyChange]);

  // Safe Pointer Capture (failsafe against browser-specific InvalidPointerId)
  const safePointerCapture = (target: any, pointerId: number) => {
    try {
      if (target && typeof target.setPointerCapture === "function") {
        target.setPointerCapture(pointerId);
      }
    } catch (e) {}
  };

  // Vibrate helper
  const triggerHaptic = (ms: number = 10) => {
    try {
      if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(ms);
      }
    } catch (e) {}
  };

  // Generic Button Handlers
  const handleActionDown = (key: keyof TouchInputState, pointerId: number, hapticMs: number = 12) => {
    pointersRef.current.set(pointerId, key as string);
    stateRef.current[key] = true as never;
    if (key === "throttleForward") stateRef.current.pitchUp = true;
    if (key === "throttleReverse") stateRef.current.pitchDown = true;
    triggerHaptic(hapticMs);
    commitState();
  };

  const handleActionUp = (pointerId: number) => {
    const key = pointersRef.current.get(pointerId) as keyof TouchInputState | undefined;
    if (key) {
      pointersRef.current.delete(pointerId);
      stateRef.current[key] = false as never;
      if (key === "throttleForward") stateRef.current.pitchUp = false;
      if (key === "throttleReverse") stateRef.current.pitchDown = false;
      commitState();
    }
  };

  // Air roll pulse trigger (Q/E toggle)
  const handleAirRollTap = () => {
    triggerHaptic(18);
    stateRef.current.airRollRight = true;
    commitState();
    setTimeout(() => {
      stateRef.current.airRollRight = false;
      commitState();
    }, 100);
  };

  // Global listener for pointer cancel/up outside target
  useEffect(() => {
    const onWindowPointerUp = (e: PointerEvent) => {
      if (pointersRef.current.has(e.pointerId)) {
        handleActionUp(e.pointerId);
      }
    };

    window.addEventListener("pointerup", onWindowPointerUp);
    window.addEventListener("pointercancel", onWindowPointerUp);
    return () => {
      window.removeEventListener("pointerup", onWindowPointerUp);
      window.removeEventListener("pointercancel", onWindowPointerUp);
    };
  }, []);

  return (
    <div
      className="absolute inset-0 pointer-events-none z-30 flex justify-between items-end select-none overflow-hidden"
      style={{
        paddingBottom: "max(12px, env(safe-area-inset-bottom, 12px))",
        paddingLeft: "max(14px, env(safe-area-inset-left, 14px))",
        paddingRight: "max(14px, env(safe-area-inset-right, 14px))"
      }}
    >
      {/* ========================================================= */}
      {/* LEFT CLUSTER: Precision Directional D-Pad                */}
      {/* ========================================================= */}
      <div className="pointer-events-auto flex flex-col items-center select-none touch-none mb-1 sm:mb-2">
        {/* Throttle Forward / Pitch Up */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            safePointerCapture(e.target, e.pointerId);
            handleActionDown("throttleForward", e.pointerId);
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            handleActionUp(e.pointerId);
          }}
          className={`w-14 h-12 rounded-t-2xl border flex items-center justify-center transition active:scale-95 shadow-lg cursor-pointer ${
            activeInputs.throttleForward
              ? "bg-sky-500 border-sky-300 text-white shadow-[0_0_20px_rgba(56,189,248,0.7)]"
              : "bg-slate-900/80 border-slate-700/80 text-slate-300 backdrop-blur-md"
          }`}
          aria-label="Throttle Forward / Pitch Up"
        >
          <ArrowUp className="w-5 h-5" />
        </button>

        {/* Horizontal Row: Steer Left, Center Handbrake, Steer Right */}
        <div className="flex items-center gap-1.5 my-1">
          {/* Steer Left */}
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              safePointerCapture(e.target, e.pointerId);
              handleActionDown("steerLeft", e.pointerId);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              handleActionUp(e.pointerId);
            }}
            className={`w-14 h-14 rounded-l-2xl border flex flex-col items-center justify-center transition active:scale-95 shadow-lg cursor-pointer ${
              activeInputs.steerLeft
                ? "bg-sky-500 border-sky-300 text-white shadow-[0_0_20px_rgba(56,189,248,0.7)]"
                : "bg-slate-900/80 border-slate-700/80 text-slate-300 backdrop-blur-md"
            }`}
            aria-label="Steer Left"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-[9px] font-gaming font-bold uppercase mt-0.5">Tilt</span>
          </button>

          {/* Center Handbrake / Drift Button */}
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              safePointerCapture(e.target, e.pointerId);
              handleActionDown("handbrake", e.pointerId, 15);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              handleActionUp(e.pointerId);
            }}
            className={`w-12 h-12 rounded-xl border flex flex-col items-center justify-center transition active:scale-95 shadow-md cursor-pointer ${
              activeInputs.handbrake
                ? "bg-amber-500 border-amber-300 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.8)] font-black"
                : "bg-slate-950/70 border-slate-800 text-slate-400 backdrop-blur-md"
            }`}
            aria-label="Drift / Handbrake"
            title="Drift / Powerslide"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[8px] font-gaming font-bold uppercase">Drift</span>
          </button>

          {/* Steer Right */}
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              safePointerCapture(e.target, e.pointerId);
              handleActionDown("steerRight", e.pointerId);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              handleActionUp(e.pointerId);
            }}
            className={`w-14 h-14 rounded-r-2xl border flex flex-col items-center justify-center transition active:scale-95 shadow-lg cursor-pointer ${
              activeInputs.steerRight
                ? "bg-sky-500 border-sky-300 text-white shadow-[0_0_20px_rgba(56,189,248,0.7)]"
                : "bg-slate-900/80 border-slate-700/80 text-slate-300 backdrop-blur-md"
            }`}
            aria-label="Steer Right"
          >
            <ArrowRight className="w-5 h-5" />
            <span className="text-[9px] font-gaming font-bold uppercase mt-0.5">Tilt</span>
          </button>
        </div>

        {/* Reverse / Brake */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            safePointerCapture(e.target, e.pointerId);
            handleActionDown("throttleReverse", e.pointerId);
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            handleActionUp(e.pointerId);
          }}
          className={`w-14 h-12 rounded-b-2xl border flex items-center justify-center transition active:scale-95 shadow-lg cursor-pointer ${
            activeInputs.throttleReverse
              ? "bg-rose-600 border-rose-400 text-white shadow-[0_0_20px_rgba(244,63,94,0.7)]"
              : "bg-slate-900/80 border-slate-700/80 text-slate-300 backdrop-blur-md"
          }`}
          aria-label="Brake / Reverse"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
      </div>

      {/* ========================================================= */}
      {/* RIGHT CLUSTER: Jump, Boost, Air Roll Action Mechanics     */}
      {/* ========================================================= */}
      <div className="pointer-events-auto flex items-end gap-3 select-none touch-none mb-1 sm:mb-2">
        {/* Air Roll 1-Tap Toggle (Q/E flip upside down) */}
        <button
          type="button"
          onClick={handleAirRollTap}
          className={`w-13 h-13 rounded-2xl border flex flex-col items-center justify-center transition active:scale-90 shadow-lg cursor-pointer backdrop-blur-md mb-2 ${
            isAirRollInverted
              ? "bg-purple-600 border-purple-300 text-white shadow-[0_0_20px_rgba(168,85,247,0.7)]"
              : "bg-slate-900/85 border-slate-700/80 text-purple-300 hover:text-white"
          }`}
          aria-label="Air Roll Flip"
          title="Air Roll: Flip car upside-down for ceiling shots & resets"
        >
          <RotateCcw className="w-5 h-5" />
          <span className="text-[9px] font-gaming font-bold uppercase mt-0.5">Air Roll</span>
        </button>

        {/* Boost & Jump Dual Primary Arc */}
        <div className="flex flex-col items-center gap-2.5">
          {/* BOOST BUTTON (Supercharged Turbo Flame) */}
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              safePointerCapture(e.target, e.pointerId);
              handleActionDown("boost", e.pointerId, 20);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              handleActionUp(e.pointerId);
            }}
            className={`relative w-18 h-18 sm:w-20 sm:h-20 rounded-full border-2 flex flex-col items-center justify-center transition active:scale-95 shadow-2xl cursor-pointer overflow-hidden ${
              activeInputs.boost
                ? "bg-gradient-to-tr from-amber-600 to-orange-500 border-amber-300 text-white shadow-[0_0_30px_rgba(245,158,11,0.9)] ring-4 ring-amber-400/40"
                : "bg-gradient-to-tr from-slate-900/90 to-amber-950/60 border-amber-500/60 text-amber-300 backdrop-blur-md"
            }`}
            aria-label="Boost Turbo"
          >
            {/* Real-time Boost Liquid Gauge Fill */}
            <div
              className="absolute bottom-0 left-0 right-0 bg-amber-500/25 pointer-events-none transition-all duration-100"
              style={{ height: `${Math.max(0, Math.min(100, effectiveBoost))}%` }}
            />

            <Flame className={`w-7 h-7 ${activeInputs.boost ? "animate-pulse fill-white text-white" : "text-amber-400 fill-amber-400/30"}`} />
            <span className="text-[10px] font-gaming font-black uppercase tracking-wider mt-0.5">
              BOOST {Math.round(effectiveBoost)}
            </span>
          </button>

          {/* JUMP BUTTON (Dodge Flip / Aerial Jump) */}
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              safePointerCapture(e.target, e.pointerId);
              handleActionDown("jump", e.pointerId, 15);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              handleActionUp(e.pointerId);
            }}
            className={`relative w-18 h-18 sm:w-20 sm:h-20 rounded-full border-2 flex flex-col items-center justify-center transition active:scale-95 shadow-2xl cursor-pointer ${
              hasFlipReset
                ? "bg-gradient-to-tr from-amber-500 to-yellow-400 border-white text-slate-950 shadow-[0_0_30px_rgba(251,191,36,0.9)] animate-pulse ring-4 ring-yellow-400/50"
                : activeInputs.jump
                ? "bg-sky-500 border-sky-200 text-white shadow-[0_0_25px_rgba(56,189,248,0.9)] ring-4 ring-sky-400/40"
                : "bg-gradient-to-tr from-slate-900/90 to-sky-950/70 border-sky-500/60 text-sky-300 backdrop-blur-md"
            }`}
            aria-label="Jump / Dodge Flip"
          >
            {hasFlipReset && (
              <span className="absolute -top-2.5 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow-md animate-bounce">
                RESET!
              </span>
            )}
            <span className="text-sm sm:text-base font-gaming font-black uppercase tracking-wider">
              JUMP
            </span>
            <span className="text-[9px] font-gaming opacity-75">DODGE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
