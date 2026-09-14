import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Package,
  Sparkles,
  Coins,
  Check,
  RotateCw,
  Trophy,
  Flame,
  Gift,
  ChevronRight,
  Zap,
  ArrowRight
} from "lucide-react";
import {
  CustomizationItem,
  CrateDefinition,
  PlayerInventory
} from "../customization/customizationTypes";
import {
  CRATE_DEFINITIONS,
  ITEM_CATALOG,
  RARITY_CONFIG
} from "../customization/customizationData";
import {
  getPlayerInventory,
  openCrate,
  equipItem
} from "../customization/customizationStorage";

interface CrateOpeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGarage: () => void;
  onItemEquipped?: () => void;
}

// Card width and margin in the spinner
const CARD_WIDTH = 130;
const CARD_GAP = 12;
const TOTAL_SPINNER_ITEMS = 80;
const WINNING_INDEX = 65; // Index where the spinner lands

export const CrateOpeningModal: React.FC<CrateOpeningModalProps> = ({
  isOpen,
  onClose,
  onOpenGarage,
  onItemEquipped
}) => {
  const [inventory, setInventory] = useState<PlayerInventory>(getPlayerInventory);
  const [selectedCrateId, setSelectedCrateId] = useState<string>("champion_crate");
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinnerItems, setSpinnerItems] = useState<CustomizationItem[]>([]);
  const [spinTranslateX, setSpinTranslateX] = useState<number>(0);
  const [unlockedResult, setUnlockedResult] = useState<{
    item: CustomizationItem;
    isDuplicate?: boolean;
    creditBonus?: number;
  } | null>(null);
  const [hasEquippedWonItem, setHasEquippedWonItem] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const spinnerContainerRef = useRef<HTMLDivElement | null>(null);
  const lastTickIndexRef = useRef<number>(-1);
  const animStartTimeRef = useRef<number>(0);
  const targetOffsetRef = useRef<number>(0);

  // Initialize Web Audio synthesizer for ticks & fanfare
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current?.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  const playTickSound = (freq = 880) => {
    if (!audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch (e) {}
  };

  const playFanfareSound = (isHighRarity: boolean) => {
    if (!audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const notes = isHighRarity ? [523.25, 659.25, 783.99, 1046.5] : [440, 554.37, 659.25];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = isHighRarity ? "triangle" : "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);

        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.09);
        osc.stop(ctx.currentTime + idx * 0.09 + 0.45);
      });
    } catch (e) {}
  };

  useEffect(() => {
    if (isOpen) {
      setInventory(getPlayerInventory());
      setUnlockedResult(null);
      setHasEquippedWonItem(false);
      setIsSpinning(false);
      setSpinTranslateX(0);
    }
  }, [isOpen]);

  const selectedCrate = CRATE_DEFINITIONS[selectedCrateId] || CRATE_DEFINITIONS.champion_crate;
  const ownedCrateCount = inventory.unopenedCrates[selectedCrateId] || 0;
  const crateCost = selectedCrate.costCoins ?? selectedCrate.costCredits;
  const canAffordWithCoins = inventory.coins >= crateCost;
  const canOpen = ownedCrateCount > 0 || canAffordWithCoins;

  // Build randomized roulette array for the spinner
  const generateSpinnerStrip = (wonItem: CustomizationItem): CustomizationItem[] => {
    const pool = selectedCrate.itemIds
      .map(id => ITEM_CATALOG[id])
      .filter((it): it is CustomizationItem => !!it);

    const strip: CustomizationItem[] = [];
    for (let i = 0; i < TOTAL_SPINNER_ITEMS; i++) {
      if (i === WINNING_INDEX) {
        strip.push(wonItem);
      } else {
        const rand = pool[Math.floor(Math.random() * pool.length)] || ITEM_CATALOG.body_octane;
        strip.push(rand);
      }
    }
    return strip;
  };

  const handleStartOpen = () => {
    if (isSpinning || !canOpen) return;
    initAudio();

    // Call storage openCrate to deduce currency & get outcome
    const result = openCrate(selectedCrateId);
    if (!result.success || !result.item) {
      alert(result.message || "Cannot open crate");
      return;
    }

    setInventory(getPlayerInventory());
    setUnlockedResult(null);
    setHasEquippedWonItem(false);
    setIsSpinning(true);

    const wonItem = result.item;
    const strip = generateSpinnerStrip(wonItem);
    setSpinnerItems(strip);

    // Calculate final translateX so the needle aligns with WINNING_INDEX
    // Container center offset
    const containerWidth = spinnerContainerRef.current?.offsetWidth || 600;
    const itemCenter = CARD_WIDTH / 2;
    // Slight random offset within the winning card (-30px to +30px) for organic feel
    const randomJitter = (Math.random() * 60) - 30;
    const finalOffset =
      WINNING_INDEX * (CARD_WIDTH + CARD_GAP) + itemCenter - containerWidth / 2 + randomJitter;

    targetOffsetRef.current = finalOffset;
    animStartTimeRef.current = performance.now();
    lastTickIndexRef.current = -1;

    const DURATION = 4800; // 4.8 seconds deceleration

    const animateSpin = (now: number) => {
      const elapsed = now - animStartTimeRef.current;
      const progress = Math.min(1, elapsed / DURATION);

      // Custom exponential cubic ease-out (Rocket League / CS:GO feel)
      const easeOut = 1 - Math.pow(1 - progress, 4.2);
      const currentPos = finalOffset * easeOut;
      setSpinTranslateX(currentPos);

      // Calculate which item is passing the needle and trigger audio tick
      const needlePos = currentPos + containerWidth / 2;
      const currentCardIdx = Math.floor(needlePos / (CARD_WIDTH + CARD_GAP));
      if (currentCardIdx !== lastTickIndexRef.current && currentCardIdx >= 0) {
        lastTickIndexRef.current = currentCardIdx;
        const pitch = 700 + (currentCardIdx % 5) * 30;
        playTickSound(pitch);
      }

      if (progress < 1) {
        requestAnimationFrame(animateSpin);
      } else {
        // Spin finished! Reveal result
        setIsSpinning(false);
        const isHighRarity =
          wonItem.rarity === "import" ||
          wonItem.rarity === "exotic" ||
          wonItem.rarity === "black_market";
        playFanfareSound(isHighRarity);
        setUnlockedResult({
          item: wonItem,
          isDuplicate: result.isDuplicate,
          creditBonus: result.coinsBonus ?? result.creditBonus
        });
      }
    };

    requestAnimationFrame(animateSpin);
  };

  const handleEquipWonItem = () => {
    if (!unlockedResult) return;
    equipItem(unlockedResult.item.slot, unlockedResult.item.id);
    setHasEquippedWonItem(true);
    setInventory(getPlayerInventory());
    if (onItemEquipped) onItemEquipped();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg p-1.5 sm:p-4 animate-fade-in font-sans select-none">
      <div className="bg-slate-950/95 border border-slate-700/80 rounded-2xl sm:rounded-3xl w-full max-w-4xl h-[94dvh] sm:max-h-[92vh] shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Top Header */}
        <div className="p-3 sm:px-6 py-2.5 sm:py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/70 shrink-0 gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="p-1.5 sm:p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 shrink-0">
              <Package className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-xl font-gaming font-black tracking-wide text-white flex items-center gap-2 truncate">
                CRATE UNBOXING
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                Spin cases for chassis, black market decals & rare drops.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono font-bold text-amber-300">
              <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              <span>{inventory.coins.toLocaleString()} Coins</span>
            </div>
            <button
              onClick={onClose}
              disabled={isSpinning}
              className={`p-1.5 rounded-xl bg-slate-900 text-slate-400 border border-slate-800 transition ${
                isSpinning
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:bg-slate-800 hover:text-white cursor-pointer"
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Crate Selection Bar */}
        <div className="p-3 border-b border-slate-800/80 bg-slate-900/40 flex items-center gap-2.5 overflow-x-auto no-scrollbar shrink-0">
          {Object.values(CRATE_DEFINITIONS).map(crate => {
            const isSelected = selectedCrateId === crate.id;
            const count = inventory.unopenedCrates[crate.id] || 0;

            return (
              <button
                key={crate.id}
                disabled={isSpinning}
                onClick={() => {
                  setSelectedCrateId(crate.id);
                  setUnlockedResult(null);
                  setSpinTranslateX(0);
                  setSpinnerItems([]);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-left transition shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-purple-950/50 border-purple-400 ring-1 ring-purple-400/50 shadow-lg"
                    : "bg-slate-900/80 border-slate-800 hover:border-slate-700 opacity-80"
                } ${isSpinning ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                <div
                  className="p-1.5 rounded-xl text-white font-black"
                  style={{ backgroundColor: `${crate.accentColor}30`, color: crate.accentColor }}
                >
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-gaming font-bold text-xs text-white">{crate.name}</div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5 font-mono">
                    {count > 0 ? (
                      <span className="text-amber-400 font-bold">{count} Owned</span>
                    ) : (
                      <span>{(crate.costCoins ?? crate.costCredits).toLocaleString()} 🪙</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Crate Opening Stage */}
        <div className="flex-1 p-4 sm:p-6 flex flex-col items-center justify-center relative overflow-hidden bg-radial from-purple-950/20 via-slate-950 to-slate-950">
          {/* Unboxing Spinner Strip Container */}
          <div
            ref={spinnerContainerRef}
            className="w-full max-w-3xl h-44 rounded-3xl bg-slate-900/90 border-2 border-slate-800 relative overflow-hidden shadow-2xl flex items-center"
          >
            {/* Center Pointer Needle */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center justify-between py-1">
              <div className="w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-t-[14px] border-t-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              <div className="w-0.5 h-full bg-amber-400/80 shadow-[0_0_10px_rgba(251,191,36,0.9)]" />
              <div className="w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-b-[14px] border-b-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
            </div>

            {/* Side Vignette Fades */}
            <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-slate-950 to-transparent z-20 pointer-events-none" />
            <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-slate-950 to-transparent z-20 pointer-events-none" />

            {/* Spinner Items Strip */}
            {spinnerItems.length > 0 ? (
              <div
                className="flex items-center gap-3 px-4 will-change-transform"
                style={{
                  transform: `translateX(-${spinTranslateX}px)`
                }}
              >
                {spinnerItems.map((item, idx) => {
                  const rarity = RARITY_CONFIG[item.rarity] || RARITY_CONFIG.common;
                  return (
                    <div
                      key={idx}
                      style={{ width: `${CARD_WIDTH}px` }}
                      className={`h-36 rounded-2xl border-2 p-2.5 flex flex-col justify-between shrink-0 transition bg-slate-950/90 ${rarity.borderColor}`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[8px] font-gaming font-black px-1.5 py-0.2 rounded uppercase ${rarity.badgeBg}`}
                        >
                          {rarity.name}
                        </span>
                        <span className="text-[9px] text-slate-400 capitalize">{item.slot}</span>
                      </div>

                      {/* Icon preview / Color preview */}
                      <div className="my-auto flex flex-col items-center justify-center">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                          style={{
                            backgroundColor: item.accentColor
                              ? `${item.accentColor}30`
                              : "rgba(56, 189, 248, 0.2)",
                            color: item.accentColor || "#38bdf8"
                          }}
                        >
                          <Sparkles className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="font-gaming font-bold text-xs text-white truncate text-center">
                        {item.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Idle Standby Screen in the Crate Window */
              <div className="w-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                <Package className="w-12 h-12 text-purple-400 animate-bounce" />
                <div className="font-gaming font-black text-base text-white">
                  {selectedCrate.name}
                </div>
                <p className="text-xs text-slate-400 max-w-md">
                  {selectedCrate.description}
                </p>
              </div>
            )}
          </div>

          {/* Crate Action / Open Button */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={handleStartOpen}
              disabled={isSpinning || !canOpen}
              className={`px-8 py-3.5 rounded-2xl font-gaming font-black text-sm uppercase tracking-wider transition shadow-2xl flex items-center gap-2.5 cursor-pointer ${
                isSpinning
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                  : canOpen
                  ? "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 shadow-amber-500/30 active:scale-95"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
              }`}
            >
              {isSpinning ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Unboxing...</span>
                </>
              ) : ownedCrateCount > 0 ? (
                <>
                  <Package className="w-4 h-4" />
                  <span>Open Crate (1 of {ownedCrateCount})</span>
                </>
              ) : canAffordWithCoins ? (
                <>
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>Unlock for {crateCost.toLocaleString()} Coins</span>
                </>
              ) : (
                <span>Need {crateCost.toLocaleString()} Coins</span>
              )}
            </button>

            <button
              onClick={onOpenGarage}
              disabled={isSpinning}
              className="px-5 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 font-gaming font-bold text-xs uppercase transition cursor-pointer"
            >
              Back to Garage
            </button>
          </div>
        </div>

        {/* Modal Reveal Screen When An Item is Unlocked */}
        {unlockedResult && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
            <div
              className={`bg-slate-950 border-2 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center relative overflow-hidden ${
                RARITY_CONFIG[unlockedResult.item.rarity]?.borderColor || "border-purple-500"
              }`}
            >
              {/* Top celebration badge */}
              <div
                className={`px-3 py-1 rounded-full text-xs font-gaming font-black uppercase mb-4 ${
                  RARITY_CONFIG[unlockedResult.item.rarity]?.badgeBg || "bg-purple-900"
                }`}
              >
                {RARITY_CONFIG[unlockedResult.item.rarity]?.name} UNLOCKED!
              </div>

              {/* Item Display Artwork */}
              <div
                className="w-24 h-24 rounded-3xl flex items-center justify-center mb-4 shadow-2xl border border-white/20"
                style={{
                  backgroundColor: unlockedResult.item.accentColor
                    ? `${unlockedResult.item.accentColor}35`
                    : "rgba(168, 85, 247, 0.3)",
                  boxShadow: `0 0 30px ${
                    RARITY_CONFIG[unlockedResult.item.rarity]?.glowColor || "rgba(168,85,247,0.5)"
                  }`
                }}
              >
                <Sparkles className="w-12 h-12 text-white drop-shadow-md animate-pulse" />
              </div>

              <h3 className="text-xl sm:text-2xl font-gaming font-black text-white">
                {unlockedResult.item.name}
              </h3>
              <p className="text-xs text-slate-400 capitalize mt-0.5">
                {unlockedResult.item.slot} • {unlockedResult.item.badge || "Edition"}
              </p>

              <p className="text-xs text-slate-300 my-4 leading-relaxed max-w-sm">
                {unlockedResult.item.description}
              </p>

              {unlockedResult.isDuplicate && (
                <div className="mb-4 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold">
                  Duplicate Item! Refunded +{unlockedResult.creditBonus} Gold Coins
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 w-full mt-2">
                <button
                  onClick={handleEquipWonItem}
                  disabled={hasEquippedWonItem}
                  className={`flex-1 py-3 rounded-xl font-gaming font-black text-xs uppercase transition shadow-lg flex items-center justify-center gap-1.5 cursor-pointer ${
                    hasEquippedWonItem
                      ? "bg-emerald-600 text-white cursor-default"
                      : "bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 text-white shadow-sky-500/25 active:scale-95"
                  }`}
                >
                  {hasEquippedWonItem ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Equipped!</span>
                    </>
                  ) : (
                    <span>Equip Now</span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setUnlockedResult(null);
                    setSpinnerItems([]);
                  }}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-gaming font-bold text-xs uppercase transition cursor-pointer"
                >
                  Claim & Return
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
