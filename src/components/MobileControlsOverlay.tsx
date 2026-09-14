import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Flame,
  RotateCcw,
  Zap,
  Rocket,
  Gamepad2
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

const JOYSTICK_MAX_RADIUS = 48;
const JOYSTICK_DEADZONE = 0.16;

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

  // Control style: "joystick" (default) or "dpad"
  const [controlStyle, setControlStyle] = useState<"joystick" | "dpad">(() => {
    try {
      const saved = localStorage.getItem("rl2d_mobile_control_style");
      return saved === "dpad" ? "dpad" : "joystick";
    } catch {
      return "joystick";
    }
  });

  const handleToggleControlStyle = () => {
    setControlStyle(prev => {
      const next = prev === "joystick" ? "dpad" : "joystick";
      try {
        localStorage.setItem("rl2d_mobile_control_style", next);
      } catch {}
      return next;
    });
  };

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

  // Joystick visual state
  const [joystickKnob, setJoystickKnob] = useState<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false
  });

  // Track pointers to prevent cross-interference between fingers
  const pointersRef = useRef<Map<number, string>>(new Map());
  const joystickPointerIdRef = useRef<number | null>(null);
  const joystickCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const joystickBaseElementRef = useRef<HTMLDivElement | null>(null);

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

  // Safe Pointer Capture
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

  // --------------------------------------------------------------------------
  // JOYSTICK HANDLERS
  // --------------------------------------------------------------------------
  const handleJoystickPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (joystickPointerIdRef.current !== null) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    joystickPointerIdRef.current = e.pointerId;
    joystickCenterRef.current = { x: centerX, y: centerY };
    safePointerCapture(e.currentTarget, e.pointerId);

    updateJoystickFromTouch(e.clientX, e.clientY);
    triggerHaptic(12);
  };

  const updateJoystickFromTouch = (clientX: number, clientY: number) => {
    const { x: cx, y: cy } = joystickCenterRef.current;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const dist = Math.hypot(dx, dy);

    let clampedDist = dist;
    let knobX = dx;
    let knobY = dy;

    if (dist > JOYSTICK_MAX_RADIUS) {
      clampedDist = JOYSTICK_MAX_RADIUS;
      knobX = (dx / dist) * JOYSTICK_MAX_RADIUS;
      knobY = (dy / dist) * JOYSTICK_MAX_RADIUS;
    }

    setJoystickKnob({ x: knobX, y: knobY, active: true });

    const normX = clampedDist > 0 ? (knobX / JOYSTICK_MAX_RADIUS) : 0;
    const normY = clampedDist > 0 ? (knobY / JOYSTICK_MAX_RADIUS) : 0;
    const magnitude = clampedDist / JOYSTICK_MAX_RADIUS;

    if (magnitude < JOYSTICK_DEADZONE) {
      stateRef.current.steerLeft = false;
      stateRef.current.steerRight = false;
      stateRef.current.throttleForward = false;
      stateRef.current.throttleReverse = false;
      stateRef.current.pitchUp = false;
      stateRef.current.pitchDown = false;
    } else {
      stateRef.current.steerLeft = normX < -0.26;
      stateRef.current.steerRight = normX > 0.26;

      const forward = normY < -0.26;
      const reverse = normY > 0.26;
      stateRef.current.throttleForward = forward;
      stateRef.current.throttleReverse = reverse;
      stateRef.current.pitchUp = forward;
      stateRef.current.pitchDown = reverse;
    }

    commitState();
  };

  const handleJoystickPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (joystickPointerIdRef.current !== e.pointerId) return;
    e.preventDefault();
    updateJoystickFromTouch(e.clientX, e.clientY);
  };

  const resetJoystick = () => {
    joystickPointerIdRef.current = null;
    setJoystickKnob({ x: 0, y: 0, active: false });
    stateRef.current.steerLeft = false;
    stateRef.current.steerRight = false;
    stateRef.current.throttleForward = false;
    stateRef.current.throttleReverse = false;
    stateRef.current.pitchUp = false;
    stateRef.current.pitchDown = false;
    commitState();
  };

  const handleJoystickPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (joystickPointerIdRef.current === e.pointerId) {
      e.preventDefault();
      resetJoystick();
    }
  };

  // --------------------------------------------------------------------------
  // BUTTON ACTION HANDLERS
  // --------------------------------------------------------------------------
  const handleActionDown = (key: keyof TouchInputState, pointerId: number, hapticMs: number = 12) => {
    pointersRef.current.set(pointerId, key as string);
    stateRef.current[key] = true as never;
    if (key === "throttleForward") stateRef.current.pitchUp = true;
    if (key === "throttleReverse") stateRef.current.pitchDown = true;
    triggerHaptic(hapticMs);
    commitState();
  };

  const handleActionUp = (pointerId: number) => {
    const key = pointersRef.current.get(pointerId) as keyof TouchInputState | "fastAerial" | undefined;
    if (key) {
      pointersRef.current.delete(pointerId);
      if (key === "fastAerial") {
        stateRef.current.jump = false;
        stateRef.current.boost = false;
      } else {
        stateRef.current[key] = false as never;
        if (key === "throttleForward") stateRef.current.pitchUp = false;
        if (key === "throttleReverse") stateRef.current.pitchDown = false;
      }
      commitState();
    }
  };

  // Fast Aerial combo button: hits Jump + Boost simultaneously
  const handleFastAerialDown = (pointerId: number) => {
    pointersRef.current.set(pointerId, "fastAerial");
    stateRef.current.jump = true;
    stateRef.current.boost = true;
    triggerHaptic(20);
    commitState();
  };

  // Air roll pulse trigger (Q/E toggle)
  const handleAirRollTap = () => {
    triggerHaptic(18);
    stateRef.current.airRollRight = true;
    commitState();
    setTimeout(() => {
      stateRef.current.airRollRight = false;
      commitState();
    }, 120);
  };

  // Global listener for pointer cancel/up outside target
  useEffect(() => {
    const onWindowPointerUp = (e: PointerEvent) => {
      if (joystickPointerIdRef.current === e.pointerId) {
        resetJoystick();
      }
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
        paddingBottom: "max(10px, env(safe-area-inset-bottom, 10px))",
        paddingLeft: "max(12px, env(safe-area-inset-left, 12px))",
        paddingRight: "max(12px, env(safe-area-inset-right, 12px))"
      }}
    >
      {/* ========================================================= */}
      {/* LEFT CLUSTER: Analog Joystick / D-Pad + Drift Controls     */}
      {/* ========================================================= */}
      <div className="pointer-events-auto flex flex-col items-center select-none touch-none mb-1">
        {/* Top Control Bar: Style Switcher + Drift Quick-Action */}
        <div className="flex items-center gap-2 mb-2">
          {/* Switcher Pill: [🕹️ Stick | 🎮 D-Pad] */}
          <button
            type="button"
            onClick={handleToggleControlStyle}
            className="px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700/80 hover:border-sky-400/60 backdrop-blur-md text-[10px] font-gaming font-bold flex items-center gap-1.5 text-slate-300 active:scale-95 transition shadow-lg cursor-pointer"
            title="Switch between Analog Joystick and Directional D-Pad"
          >
            {controlStyle === "joystick" ? (
              <>
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse shadow-[0_0_8px_#38bdf8]" />
                <span className="text-sky-300">STICK</span>
                <span className="text-slate-500 font-normal">| D-PAD</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
                <span className="text-slate-500 font-normal">STICK |</span>
                <span className="text-amber-300">D-PAD</span>
              </>
            )}
          </button>

          {/* Quick Drift Button (in Joystick mode) */}
          {controlStyle === "joystick" && (
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
              className={`px-2.5 py-1 rounded-full border text-[10px] font-gaming font-black uppercase flex items-center gap-1 transition active:scale-95 shadow-md cursor-pointer ${
                activeInputs.handbrake
                  ? "bg-amber-500 border-amber-300 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.9)]"
                  : "bg-slate-900/80 border-slate-700/80 text-amber-400 backdrop-blur-md"
              }`}
              title="Drift / Powerslide"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>DRIFT</span>
            </button>
          )}
        </div>

        {/* --- OPTION A: Analog Virtual Joystick --- */}
        {controlStyle === "joystick" ? (
          <div
            ref={joystickBaseElementRef}
            onPointerDown={handleJoystickPointerDown}
            onPointerMove={handleJoystickPointerMove}
            onPointerUp={handleJoystickPointerUp}
            onPointerCancel={resetJoystick}
            className={`relative w-32 h-32 sm:w-36 sm:h-36 rounded-full border-2 flex items-center justify-center touch-none select-none transition-colors duration-200 cursor-grab active:cursor-grabbing ${
              joystickKnob.active
                ? "border-sky-400/80 bg-slate-950/75 shadow-[0_0_30px_rgba(56,189,248,0.35)]"
                : "border-sky-500/30 bg-slate-950/60 shadow-xl backdrop-blur-md"
            }`}
            style={{ touchAction: "none" }}
            aria-label="Steering and Pitch Analog Joystick"
          >
            {/* Concentric Guide Ring */}
            <div className="absolute inset-3 rounded-full border border-sky-400/15 pointer-events-none" />
            <div className="absolute inset-7 rounded-full border border-dashed border-sky-400/10 pointer-events-none" />

            {/* Directional Chevrons on perimeter */}
            <div
              className={`absolute top-2 transition-all duration-150 pointer-events-none ${
                activeInputs.throttleForward
                  ? "text-sky-300 scale-110 drop-shadow-[0_0_10px_#38bdf8] opacity-100"
                  : "text-slate-500 opacity-40"
              }`}
            >
              <ArrowUp className="w-4 h-4" />
            </div>
            <div
              className={`absolute bottom-2 transition-all duration-150 pointer-events-none ${
                activeInputs.throttleReverse
                  ? "text-rose-400 scale-110 drop-shadow-[0_0_10px_#fb7185] opacity-100"
                  : "text-slate-500 opacity-40"
              }`}
            >
              <ArrowDown className="w-4 h-4" />
            </div>
            <div
              className={`absolute left-2 transition-all duration-150 pointer-events-none ${
                activeInputs.steerLeft
                  ? "text-sky-300 scale-110 drop-shadow-[0_0_10px_#38bdf8] opacity-100"
                  : "text-slate-500 opacity-40"
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
            </div>
            <div
              className={`absolute right-2 transition-all duration-150 pointer-events-none ${
                activeInputs.steerRight
                  ? "text-sky-300 scale-110 drop-shadow-[0_0_10px_#38bdf8] opacity-100"
                  : "text-slate-500 opacity-40"
              }`}
            >
              <ArrowRight className="w-4 h-4" />
            </div>

            {/* Moveable Thumb Knob */}
            <div
              className={`w-13 h-13 sm:w-15 sm:h-15 rounded-full border-2 flex items-center justify-center pointer-events-none transition-transform duration-75 ease-out shadow-2xl ${
                joystickKnob.active
                  ? "bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 border-white text-white shadow-[0_0_25px_rgba(56,189,248,0.9)] scale-105"
                  : "bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600/80 text-slate-400 shadow-md"
              }`}
              style={{
                transform: `translate3d(${joystickKnob.x}px, ${joystickKnob.y}px, 0)`
              }}
            >
              <div className="w-4 h-4 rounded-full border border-white/50 bg-white/25 flex items-center justify-center shadow-inner">
                <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
              </div>
            </div>
          </div>
        ) : (
          /* --- OPTION B: Discrete 4-Way D-Pad --- */
          <div className="flex flex-col items-center">
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
              className={`w-12 h-10 sm:w-14 sm:h-12 rounded-t-xl border flex items-center justify-center transition active:scale-95 shadow-lg cursor-pointer ${
                activeInputs.throttleForward
                  ? "bg-sky-500 border-sky-300 text-white shadow-[0_0_20px_rgba(56,189,248,0.7)]"
                  : "bg-slate-900/80 border-slate-700/80 text-slate-300 backdrop-blur-md"
              }`}
              aria-label="Throttle Forward / Pitch Up"
            >
              <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Horizontal Row: Steer Left, Center Handbrake, Steer Right */}
            <div className="flex items-center gap-1 my-0.5">
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
                className={`w-11 h-11 sm:w-13 sm:h-13 rounded-l-xl border flex flex-col items-center justify-center transition active:scale-95 shadow-lg cursor-pointer ${
                  activeInputs.steerLeft
                    ? "bg-sky-500 border-sky-300 text-white shadow-[0_0_20px_rgba(56,189,248,0.7)]"
                    : "bg-slate-900/80 border-slate-700/80 text-slate-300 backdrop-blur-md"
                }`}
                aria-label="Steer Left"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-[8px] font-gaming font-bold uppercase">Tilt</span>
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
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg border flex flex-col items-center justify-center transition active:scale-95 shadow-md cursor-pointer ${
                  activeInputs.handbrake
                    ? "bg-amber-500 border-amber-300 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.8)] font-black"
                    : "bg-slate-950/70 border-slate-800 text-slate-400 backdrop-blur-md"
                }`}
                aria-label="Drift / Handbrake"
                title="Drift / Powerslide"
              >
                <Zap className="w-3 h-3 text-amber-400" />
                <span className="text-[7px] font-gaming font-bold uppercase">Drift</span>
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
                className={`w-11 h-11 sm:w-13 sm:h-13 rounded-r-xl border flex flex-col items-center justify-center transition active:scale-95 shadow-lg cursor-pointer ${
                  activeInputs.steerRight
                    ? "bg-sky-500 border-sky-300 text-white shadow-[0_0_20px_rgba(56,189,248,0.7)]"
                    : "bg-slate-900/80 border-slate-700/80 text-slate-300 backdrop-blur-md"
                }`}
                aria-label="Steer Right"
              >
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-[8px] font-gaming font-bold uppercase">Tilt</span>
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
              className={`w-12 h-10 sm:w-14 sm:h-12 rounded-b-xl border flex items-center justify-center transition active:scale-95 shadow-lg cursor-pointer ${
                activeInputs.throttleReverse
                  ? "bg-rose-600 border-rose-400 text-white shadow-[0_0_20px_rgba(244,63,94,0.7)]"
                  : "bg-slate-900/80 border-slate-700/80 text-slate-300 backdrop-blur-md"
              }`}
              aria-label="Brake / Reverse"
            >
              <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* RIGHT CLUSTER: Jump, Boost, Aerial & Roll Actions         */}
      {/* ========================================================= */}
      <div className="pointer-events-auto flex flex-col items-end gap-1.5 select-none touch-none mb-1">
        {/* Upper Row: Roll 180° + Fast Aerial Combo Button */}
        <div className="flex items-center gap-2">
          {/* Air Roll 1-Tap Toggle (Q/E flip upside down) */}
          <button
            type="button"
            onClick={handleAirRollTap}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl border flex flex-col items-center justify-center transition active:scale-90 shadow-lg cursor-pointer backdrop-blur-md ${
              isAirRollInverted
                ? "bg-purple-600 border-purple-300 text-white shadow-[0_0_15px_rgba(168,85,247,0.7)]"
                : "bg-slate-900/85 border-slate-700/80 text-purple-300 hover:text-white"
            }`}
            aria-label="Air Roll Flip"
            title="Air Roll: Flip car upside-down for ceiling shots & resets"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-[7.5px] font-gaming font-bold uppercase mt-0.5">Roll</span>
          </button>

          {/* FAST AERIAL COMBO BUTTON (Simultaneous Jump + Boost) */}
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              safePointerCapture(e.target, e.pointerId);
              handleFastAerialDown(e.pointerId);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              handleActionUp(e.pointerId);
            }}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl border flex flex-col items-center justify-center transition active:scale-90 shadow-lg cursor-pointer backdrop-blur-md ${
              activeInputs.jump && activeInputs.boost
                ? "bg-gradient-to-tr from-fuchsia-600 to-amber-500 border-amber-300 text-white shadow-[0_0_20px_rgba(217,70,239,0.8)]"
                : "bg-slate-900/85 border-fuchsia-500/60 text-fuchsia-300 hover:text-white"
            }`}
            aria-label="Fast Aerial Combo"
            title="Fast Aerial: Jump + Boost simultaneously"
          >
            <Rocket className="w-4 h-4 text-fuchsia-300" />
            <span className="text-[7.5px] font-gaming font-black uppercase mt-0.5">Aerial</span>
          </button>
        </div>

        {/* Lower Primary Actions: BOOST & JUMP */}
        <div className="flex items-end gap-2.5 sm:gap-3">
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
            className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 flex flex-col items-center justify-center transition active:scale-95 shadow-xl cursor-pointer overflow-hidden ${
              activeInputs.boost
                ? "bg-gradient-to-tr from-amber-600 to-orange-500 border-amber-300 text-white shadow-[0_0_25px_rgba(245,158,11,0.9)] ring-4 ring-amber-400/40"
                : "bg-gradient-to-tr from-slate-900/90 to-amber-950/60 border-amber-500/60 text-amber-300 backdrop-blur-md"
            }`}
            aria-label="Boost Turbo"
          >
            {/* Real-time Boost Liquid Gauge Fill */}
            <div
              className="absolute bottom-0 left-0 right-0 bg-amber-500/25 pointer-events-none transition-all duration-100"
              style={{ height: `${Math.max(0, Math.min(100, effectiveBoost))}%` }}
            />

            <Flame className={`w-5 h-5 sm:w-6 sm:h-6 ${activeInputs.boost ? "animate-pulse fill-white text-white" : "text-amber-400 fill-amber-400/30"}`} />
            <span className="text-[9px] font-gaming font-black uppercase tracking-wider">
              {Math.round(effectiveBoost)}
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
            className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-full border-2 flex flex-col items-center justify-center transition active:scale-95 shadow-xl cursor-pointer ${
              hasFlipReset
                ? "bg-gradient-to-tr from-amber-500 to-yellow-400 border-white text-slate-950 shadow-[0_0_30px_rgba(251,191,36,0.9)] animate-pulse ring-4 ring-yellow-400/50"
                : activeInputs.jump
                ? "bg-sky-500 border-sky-200 text-white shadow-[0_0_25px_rgba(56,189,248,0.9)] ring-4 ring-sky-400/40"
                : "bg-gradient-to-tr from-slate-900/90 to-sky-950/70 border-sky-500/60 text-sky-300 backdrop-blur-md"
            }`}
            aria-label="Jump / Dodge Flip"
          >
            {hasFlipReset && (
              <span className="absolute -top-2 px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black text-[8px] uppercase tracking-wider shadow-md animate-bounce">
                RESET!
              </span>
            )}
            <span className="text-sm sm:text-base font-gaming font-black uppercase tracking-wider">
              JUMP
            </span>
            <span className="text-[8px] font-gaming opacity-75">DODGE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
