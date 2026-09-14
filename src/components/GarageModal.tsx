import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Car,
  Palette,
  Disc,
  Flame,
  Sparkles,
  Crown,
  Trophy,
  ArrowUpCircle,
  Package,
  Check,
  Lock,
  Coins,
  Key,
  ChevronRight,
  Zap,
  Shield,
  Layers
} from "lucide-react";
import {
  CustomizationItem,
  ItemSlot,
  PlayerInventory,
  CarMastery
} from "../customization/customizationTypes";
import {
  ITEM_CATALOG,
  RARITY_CONFIG,
  CRATE_DEFINITIONS
} from "../customization/customizationData";
import {
  getPlayerInventory,
  equipItem,
  getCarMastery,
  getCarUpgradeCost,
  upgradeCarMastery,
  claimDailyBonus
} from "../customization/customizationStorage";
import {
  drawCarDecal,
  drawCustomWheel,
  drawCarTopper
} from "../customization/customizationRenderer";

interface GarageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCrates: () => void;
  onLoadoutChange?: () => void;
}

export const GarageModal: React.FC<GarageModalProps> = ({
  isOpen,
  onClose,
  onOpenCrates,
  onLoadoutChange
}) => {
  const [inventory, setInventory] = useState<PlayerInventory>(getPlayerInventory);
  const [activeSlot, setActiveSlot] = useState<ItemSlot | "upgrade">("body");
  const [previewItem, setPreviewItem] = useState<CustomizationItem | null>(null);
  const [upgradeMsg, setUpgradeMsg] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    if (isOpen) {
      setInventory(getPlayerInventory());
      setUpgradeMsg(null);
    }
  }, [isOpen]);

  // Current active equipped items
  const equippedBody = ITEM_CATALOG[inventory.loadout.body] || ITEM_CATALOG.body_octane;
  const equippedDecal = ITEM_CATALOG[inventory.loadout.decal] || ITEM_CATALOG.decal_none;
  const equippedWheels = ITEM_CATALOG[inventory.loadout.wheels] || ITEM_CATALOG.wheel_oem;
  const equippedBoost = ITEM_CATALOG[inventory.loadout.boost] || ITEM_CATALOG.boost_standard;
  const equippedTopper = ITEM_CATALOG[inventory.loadout.topper] || ITEM_CATALOG.topper_none;
  const equippedTitle = ITEM_CATALOG[inventory.loadout.title] || ITEM_CATALOG.title_rookie;

  const currentCarModel = equippedBody.visualData.modelId || "octane";
  const carMastery: CarMastery = getCarMastery(currentCarModel);

  // Live 2D interactive canvas stage preview
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let wheelRotation = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2 + 18;

      // Draw futuristic metallic stage podium
      ctx.save();
      ctx.translate(cx, cy + 24);

      // Stage glow
      const glowGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 130);
      glowGrad.addColorStop(0, "rgba(56, 189, 248, 0.25)");
      glowGrad.addColorStop(0.7, "rgba(56, 189, 248, 0.05)");
      glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, 130, 26, 0, 0, Math.PI * 2);
      ctx.fill();

      // Stage disk
      ctx.fillStyle = "#0f172a";
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, 110, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Internal rings
      ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 75, 12, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Render car
      ctx.save();
      ctx.translate(cx, cy);

      const carW = 72;
      const carH = 28;
      const halfW = carW / 2;
      const halfH = carH / 2;
      const rearX = -20;
      const frontX = 20;
      const wheelY = 8;
      const wheelRadius = 8.5;

      // Boost exhaust idle flame
      ctx.save();
      ctx.translate(-halfW - 4, -1);
      const boostFlameLen = 14 + Math.sin(Date.now() / 100) * 4;
      const flameGrad = ctx.createLinearGradient(0, 0, -boostFlameLen, 0);
      flameGrad.addColorStop(0, equippedBoost.visualData.boostColor || "#38bdf8");
      flameGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.moveTo(0, -3);
      ctx.lineTo(-boostFlameLen, 0);
      ctx.lineTo(0, 3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Car body silhouette
      ctx.fillStyle = equippedBody.accentColor || "#3b82f6";
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-halfW, -halfH, carW, carH - 4, 6);
      ctx.fill();
      ctx.stroke();

      // Car cabin / windshield
      ctx.fillStyle = "#020617";
      ctx.beginPath();
      ctx.moveTo(-4, -halfH + 1);
      ctx.lineTo(16, -halfH + 1);
      ctx.lineTo(12, -1);
      ctx.lineTo(-8, -1);
      ctx.closePath();
      ctx.fill();

      // Decal overlay
      const targetDecal =
        previewItem && previewItem.slot === "decal" ? previewItem : equippedDecal;
      drawCarDecal(ctx, {}, halfW, halfH, targetDecal);

      // Topper
      const targetTopper =
        previewItem && previewItem.slot === "topper" ? previewItem : equippedTopper;
      drawCarTopper(ctx, {}, halfW, halfH, targetTopper);

      // Foreground wheels
      wheelRotation += 0.04;
      const targetWheels =
        previewItem && previewItem.slot === "wheels" ? previewItem : equippedWheels;
      drawCustomWheel(ctx, rearX, wheelY, wheelRadius, targetWheels, wheelRotation);
      drawCustomWheel(ctx, frontX, wheelY, wheelRadius, targetWheels, wheelRotation);

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, equippedBody, equippedDecal, equippedWheels, equippedBoost, equippedTopper, previewItem]);

  if (!isOpen) return null;

  const totalCratesCount = Object.values(inventory.unopenedCrates).reduce((a, b) => a + b, 0);

  const slotTabs: { id: ItemSlot | "upgrade"; label: string; icon: React.ReactNode }[] = [
    { id: "body", label: "Chassis", icon: <Car className="w-4 h-4" /> },
    { id: "decal", label: "Decals", icon: <Palette className="w-4 h-4" /> },
    { id: "wheels", label: "Wheels", icon: <Disc className="w-4 h-4" /> },
    { id: "boost", label: "Boost", icon: <Flame className="w-4 h-4" /> },
    { id: "goal_explosion", label: "Goal Boom", icon: <Sparkles className="w-4 h-4" /> },
    { id: "topper", label: "Toppers", icon: <Crown className="w-4 h-4" /> },
    { id: "title", label: "Titles", icon: <Trophy className="w-4 h-4" /> },
    { id: "upgrade", label: "Mastery", icon: <ArrowUpCircle className="w-4 h-4" /> }
  ];

  // Filter items by active slot
  const currentSlotItems =
    activeSlot === "upgrade"
      ? []
      : Object.values(ITEM_CATALOG).filter(item => item.slot === activeSlot);

  const handleEquip = (item: CustomizationItem) => {
    const updated = equipItem(item.slot, item.id);
    setInventory({ ...inventory, loadout: updated });
    setPreviewItem(null);
    if (onLoadoutChange) onLoadoutChange();
  };

  const handleUpgradeClick = () => {
    const result = upgradeCarMastery(currentCarModel);
    if (result.success) {
      setUpgradeMsg(result.message || `Upgraded to Level ${result.newLevel}!`);
      setInventory(getPlayerInventory());
      if (onLoadoutChange) onLoadoutChange();
    } else {
      setUpgradeMsg(result.message || "Failed to upgrade");
    }
  };

  const handleClaimBonus = () => {
    const res = claimDailyBonus();
    setInventory(getPlayerInventory());
    setUpgradeMsg(res.message);
  };

  const upgradeCost = getCarUpgradeCost(carMastery.level);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-1.5 sm:p-4 animate-fade-in font-sans select-none">
      <div className="bg-slate-950/95 border border-slate-700/80 rounded-2xl sm:rounded-3xl w-full max-w-5xl h-[94dvh] sm:h-[92vh] max-h-[840px] shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header Bar */}
        <div className="p-3 sm:px-6 py-2.5 sm:py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shrink-0 gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="p-1.5 sm:p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 shrink-0">
              <Car className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-xl font-gaming font-black tracking-wide text-white truncate">
                GARAGE & WORKSHOP
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-1.5 truncate">
                <span>Title:</span>
                <span className="text-amber-400 font-bold truncate">{equippedTitle.name}</span>
              </p>
            </div>
          </div>

          {/* Economy & Crates Bar */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Coins Balance */}
            <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono font-bold text-amber-300">
              <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              <span>{inventory.coins.toLocaleString()} <span className="hidden sm:inline">Coins</span></span>
            </div>

            {/* Daily Bonus Button */}
            <button
              onClick={handleClaimBonus}
              className="flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-gaming font-bold transition cursor-pointer active:scale-95"
              title="Claim daily bonus +500 Coins"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>+500 🪙</span>
            </button>

            {/* Crates Button */}
            <button
              onClick={onOpenCrates}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-gaming font-bold text-xs shadow-md transition cursor-pointer active:scale-95"
            >
              <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
              <span className="hidden md:inline">Crates</span>
              {totalCratesCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
                  {totalCratesCount}
                </span>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1 sm:p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Left Stage + Right Catalog */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left: 2D Live Stage & Current Car Specs */}
          <div className="md:w-5/12 border-b md:border-b-0 md:border-r border-slate-800/80 p-4 flex flex-col justify-between bg-gradient-to-b from-slate-950 via-slate-900/40 to-slate-950 shrink-0">
            <div className="flex flex-col items-center">
              <div className="relative w-full max-w-[320px] aspect-[4/3] rounded-2xl bg-radial from-slate-900/90 to-slate-950 border border-slate-800/80 flex items-center justify-center shadow-inner overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={320}
                  height={240}
                  className="w-full h-full block"
                />

                {/* Equipped Badge Tag */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-700/60 backdrop-blur-md text-[11px] font-gaming">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-white">{equippedBody.name}</span>
                </div>
              </div>

              {/* Quick Spec Pills */}
              <div className="grid grid-cols-2 gap-2 w-full mt-3">
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Decal</span>
                  <span className="font-semibold text-slate-200 truncate">{equippedDecal.name}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Wheels</span>
                  <span className="font-semibold text-slate-200 truncate">{equippedWheels.name}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Boost</span>
                  <span className="font-semibold text-slate-200 truncate">{equippedBoost.name}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Topper</span>
                  <span className="font-semibold text-slate-200 truncate">{equippedTopper.name}</span>
                </div>
              </div>
            </div>

            {/* Quick Car Mastery Level Widget */}
            <div className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900/90 to-purple-500/10 border border-amber-500/30">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span className="font-gaming font-bold text-amber-300">
                    Mastery Level {carMastery.level}
                  </span>
                  {carMastery.prestige > 0 && (
                    <span className="px-1.5 py-0.2 rounded bg-purple-900 border border-purple-400 text-[10px] font-black text-purple-200">
                      ★ P{carMastery.prestige}
                    </span>
                  )}
                </div>
                <span className="text-slate-400 font-mono text-[11px]">
                  {carMastery.wins} Wins • {carMastery.goals} Goals
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                  style={{ width: `${Math.min(100, (carMastery.xp % 600) / 6)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right: Category Tabs & Items Grid / Upgrade View */}
          <div className="md:w-7/12 flex flex-col flex-1 overflow-hidden bg-slate-950/60">
            {/* Slot Tabs */}
            <div className="flex items-center gap-1.5 p-3 border-b border-slate-800/80 overflow-x-auto no-scrollbar shrink-0 bg-slate-900/40">
              {slotTabs.map(tab => {
                const isActive = activeSlot === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveSlot(tab.id);
                      setPreviewItem(null);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-gaming font-bold text-xs transition shrink-0 cursor-pointer ${
                      isActive
                        ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20"
                        : "bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Sub-view: Mastery Upgrades */}
            {activeSlot === "upgrade" ? (
              <div className="flex-1 p-5 overflow-y-auto space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900/80 to-slate-950 border border-amber-500/40">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-gaming font-black text-amber-300 flex items-center gap-2">
                        <Crown className="w-5 h-5 text-amber-400" />
                        {equippedBody.name} Mastery Workshop
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Level up car mastery to unlock cosmetic prestige glowing auras, title honors, and certified stat badges.
                      </p>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 font-black font-mono text-sm">
                      LVL {carMastery.level} / 50
                    </div>
                  </div>

                  {/* Certified Stats Counters */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-4">
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Goals Scored</div>
                      <div className="text-xl font-mono font-black text-sky-400 mt-0.5">{carMastery.goals}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Epic Saves</div>
                      <div className="text-xl font-mono font-black text-emerald-400 mt-0.5">{carMastery.saves}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Total Shots</div>
                      <div className="text-xl font-mono font-black text-amber-400 mt-0.5">{carMastery.shots}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Matches Won</div>
                      <div className="text-xl font-mono font-black text-purple-400 mt-0.5">{carMastery.wins}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                      <div className="text-[10px] uppercase font-bold text-slate-400">MVP Honors</div>
                      <div className="text-xl font-mono font-black text-rose-400 mt-0.5">{carMastery.mvps}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Prestige Tier</div>
                      <div className="text-xl font-mono font-black text-fuchsia-400 mt-0.5">P{carMastery.prestige}</div>
                    </div>
                  </div>

                  {/* Upgrade Button */}
                  <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <div className="text-xs text-slate-300">
                        Next Level: <span className="font-bold text-amber-400">Level {carMastery.level + 1}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Cost: <span className="text-amber-400 font-bold">{upgradeCost.toLocaleString()} Coins</span> (You have {inventory.coins.toLocaleString()})
                      </div>
                    </div>

                    <button
                      onClick={handleUpgradeClick}
                      disabled={inventory.coins < upgradeCost && carMastery.level < 50}
                      className={`px-5 py-2.5 rounded-xl font-gaming font-bold text-xs uppercase transition shadow-lg flex items-center gap-2 cursor-pointer ${
                        inventory.coins >= upgradeCost || carMastery.level >= 50
                          ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 shadow-amber-500/25 active:scale-95"
                          : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                      }`}
                    >
                      <ArrowUpCircle className="w-4 h-4" />
                      <span>{carMastery.level >= 50 ? "Prestige Reset (Free)" : `Upgrade (${upgradeCost.toLocaleString()} 🪙)`}</span>
                    </button>
                  </div>

                  {upgradeMsg && (
                    <div className="mt-3 p-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-center font-bold text-amber-300 animate-fade-in">
                      {upgradeMsg}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Items Catalog Grid */
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {currentSlotItems.map(item => {
                    const isOwned =
                      inventory.ownedItemIds.includes(item.id) ||
                      item.id === "decal_none" ||
                      item.id === "topper_none";
                    const isEquipped = inventory.loadout[activeSlot as ItemSlot] === item.id;
                    const rarityInfo = RARITY_CONFIG[item.rarity] || RARITY_CONFIG.common;

                    return (
                      <div
                        key={item.id}
                        onMouseEnter={() => setPreviewItem(item)}
                        onMouseLeave={() => setPreviewItem(null)}
                        className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between relative overflow-hidden ${
                          isEquipped
                            ? "bg-sky-950/40 border-sky-400 ring-1 ring-sky-400/50 shadow-lg"
                            : isOwned
                            ? "bg-slate-900/70 border-slate-800 hover:border-slate-700"
                            : "bg-slate-950/40 border-slate-900/90 opacity-60"
                        }`}
                      >
                        <div>
                          {/* Card Header: Name & Rarity badge */}
                          <div className="flex items-start justify-between gap-1.5 mb-1.5">
                            <div>
                              <div className="font-gaming font-bold text-sm text-white flex items-center gap-1.5">
                                <span>{item.name}</span>
                                {isEquipped && <Check className="w-4 h-4 text-sky-400 shrink-0" />}
                              </div>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded border font-gaming uppercase ${rarityInfo.badgeBg}`}
                              >
                                {rarityInfo.name}
                              </span>
                            </div>

                            {!isOwned && (
                              <div className="p-1 rounded bg-slate-900/90 border border-slate-800 text-slate-500">
                                <Lock className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>

                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        {/* Card Footer: Action */}
                        <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                          {isEquipped ? (
                            <span className="text-[11px] font-gaming font-bold text-sky-400">
                              EQUIPPED
                            </span>
                          ) : isOwned ? (
                            <button
                              onClick={() => handleEquip(item)}
                              className="px-3 py-1 rounded-lg bg-sky-600/30 hover:bg-sky-600/50 text-sky-300 border border-sky-500/40 font-gaming font-bold text-[11px] transition cursor-pointer active:scale-95"
                            >
                              EQUIP
                            </button>
                          ) : (
                            <button
                              onClick={onOpenCrates}
                              className="text-[10px] font-gaming font-bold text-amber-400 hover:underline cursor-pointer flex items-center gap-1"
                            >
                              <span>Get in Crates</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
