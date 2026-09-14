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
  Layers,
  Cpu,
  Bot,
  CheckCircle2,
  Crosshair,
  Gauge
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
  drawCarTopper,
  drawCarModelBody
} from "../customization/customizationRenderer";
import { ItemVisualIcon } from "./ItemVisualIcon";
import {
  getBotUpgrades,
  upgradeBotAttribute,
  setBotArchetype,
  setBotName,
  getBotOverallLevel
} from "../bot/botUpgradeStorage";
import {
  BotUpgradeAttribute,
  BotArchetype,
  ARCHETYPE_CONFIG,
  UPGRADE_COSTS
} from "../bot/botUpgradeTypes";

interface GarageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCrates: () => void;
  onLoadoutChange?: () => void;
  initialTab?: ItemSlot | "upgrade" | "bot_upgrade";
}

export const GarageModal: React.FC<GarageModalProps> = ({
  isOpen,
  onClose,
  onOpenCrates,
  onLoadoutChange,
  initialTab = "body"
}) => {
  const [inventory, setInventory] = useState<PlayerInventory>(getPlayerInventory);
  const [activeSlot, setActiveSlot] = useState<ItemSlot | "upgrade" | "bot_upgrade">(initialTab);
  const [previewItem, setPreviewItem] = useState<CustomizationItem | null>(null);
  const [upgradeMsg, setUpgradeMsg] = useState<string | null>(null);
  const [botUpgrades, setBotUpgrades] = useState(getBotUpgrades);
  const [editingBotName, setEditingBotName] = useState(botUpgrades.botName);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    if (isOpen) {
      setInventory(getPlayerInventory());
      setUpgradeMsg(null);
      const bUp = getBotUpgrades();
      setBotUpgrades(bUp);
      setEditingBotName(bUp.botName);
      if (initialTab) {
        setActiveSlot(initialTab);
      }
    }
  }, [isOpen, initialTab]);

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
      const cy = canvas.height / 2 + 14;

      // Stage glow
      ctx.save();
      ctx.translate(cx, cy + 20);

      const glowGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 110);
      glowGrad.addColorStop(0, "rgba(56, 189, 248, 0.25)");
      glowGrad.addColorStop(0.7, "rgba(56, 189, 248, 0.05)");
      glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, 110, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      // Stage disk
      ctx.fillStyle = "#0f172a";
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 95, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Render authentic car model on stage
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1.7, 1.7);

      const r = 34;
      const s = 13;
      const wheelRadius = 7.5;
      const nearWheelY = s - wheelRadius + 0.5; // 6
      const farWheelY = nearWheelY - 2.5; // 3.5
      const rearWheelX = -17;
      const frontWheelX = 18;

      const targetBody =
        previewItem && previewItem.slot === "body" ? previewItem : equippedBody;
      const targetBoost =
        previewItem && previewItem.slot === "boost" ? previewItem : equippedBoost;
      const targetWheels =
        previewItem && previewItem.slot === "wheels" ? previewItem : equippedWheels;
      const targetDecal =
        previewItem && previewItem.slot === "decal" ? previewItem : equippedDecal;
      const targetTopper =
        previewItem && previewItem.slot === "topper" ? previewItem : equippedTopper;

      // Determine authentic palette based on chassis edition
      let primaryBright = "#38bdf8";
      let primaryMid = "#0284c7";
      let primaryDark = "#024673";
      let accentColor = targetBody.accentColor || "#7dd3fc";
      let chassisDark = "#080c14";
      const metalSilver = "#cbd5e1";
      const metalDark = "#334155";

      if (targetBody.id === "body_tw_octane") {
        primaryBright = "#ffffff";
        primaryMid = "#e2e8f0";
        primaryDark = "#94a3b8";
        accentColor = "#ffffff";
        chassisDark = "#cbd5e1"; // Platinum white chassis trim
      } else if (targetBody.id === "body_gold_dominus") {
        primaryBright = "#fef08a";
        primaryMid = "#fbbf24";
        primaryDark = "#b45309";
        accentColor = "#fef08a";
      } else if (targetBody.id === "body_cyber_fennec") {
        primaryBright = "#06b6d4";
        primaryMid = "#0891b2";
        primaryDark = "#164e63";
        accentColor = "#f43f5e";
      } else if (targetBody.visualData?.primaryColor) {
        primaryMid = targetBody.visualData.primaryColor;
      }

      // 1. Far-side wheels (darker, recessed perspective)
      wheelRotation += 0.035;
      drawCustomWheel(ctx, rearWheelX - 2, farWheelY, wheelRadius * 0.92, targetWheels, wheelRotation, true);
      drawCustomWheel(ctx, frontWheelX - 2, farWheelY, wheelRadius * 0.92, targetWheels, wheelRotation, true);

      // 2. Rocket thruster nozzle & idle boost glow
      ctx.fillStyle = "#1e293b";
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-r + 6, -2);
      ctx.lineTo(-r - 4, -4);
      ctx.lineTo(-r - 6, -5);
      ctx.lineTo(-r - 6, 5);
      ctx.lineTo(-r - 4, 4);
      ctx.lineTo(-r + 6, 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(-r - 4, 0, 2.8, 0, Math.PI * 2);
      ctx.fill();

      // Soft idle exhaust glow
      const idleGlow = Math.sin(Date.now() * 0.005) * 3 + 12;
      const boostGrad = ctx.createLinearGradient(-r - 6, 0, -r - 6 - idleGlow, 0);
      boostGrad.addColorStop(0, targetBoost.accentColor || "#38bdf8");
      boostGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = boostGrad;
      ctx.beginPath();
      ctx.moveTo(-r - 6, -3);
      ctx.lineTo(-r - 6 - idleGlow, 0);
      ctx.lineTo(-r - 6, 3);
      ctx.closePath();
      ctx.fill();

      // 3. Lower chassis plate
      ctx.fillStyle = chassisDark;
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-r + 4, nearWheelY);
      ctx.lineTo(r - 4, nearWheelY);
      ctx.lineTo(r - 2, nearWheelY - 2);
      ctx.lineTo(-r + 2, nearWheelY - 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 4. Authentic Car Model Body Silhouette
      const modelId = targetBody.visualData?.modelId || "octane";
      drawCarModelBody(
        ctx,
        modelId,
        r,
        s,
        nearWheelY,
        rearWheelX,
        frontWheelX,
        wheelRadius,
        primaryBright,
        primaryMid,
        primaryDark,
        accentColor,
        chassisDark,
        metalSilver,
        metalDark
      );

      // 5. Equipped Livery Decal
      drawCarDecal(ctx, null, r, s, targetDecal);

      // 6. Forward Headlight Beam casting onto turntable
      const beamGrad = ctx.createLinearGradient(r + 2, -1, r + 75, -1);
      beamGrad.addColorStop(0, "rgba(254, 240, 138, 0.4)");
      beamGrad.addColorStop(1, "rgba(254, 240, 138, 0)");
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(r + 2, -1);
      ctx.lineTo(r + 75, -12);
      ctx.lineTo(r + 75, 14);
      ctx.closePath();
      ctx.fill();

      // 7. Foreground wheels
      drawCustomWheel(ctx, rearWheelX, nearWheelY, wheelRadius, targetWheels, wheelRotation, false);
      drawCustomWheel(ctx, frontWheelX, nearWheelY, wheelRadius, targetWheels, wheelRotation, false);

      // 8. Equipped Roof Topper
      drawCarTopper(ctx, null, r, s, targetTopper);

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, equippedBody, equippedDecal, equippedWheels, equippedBoost, equippedTopper, previewItem]);

  if (!isOpen) return null;

  const totalCratesCount: number = Object.values(inventory.unopenedCrates).reduce<number>(
    (a, b) => a + (Number(b) || 0),
    0
  );

  const slotTabs: { id: ItemSlot | "upgrade" | "bot_upgrade"; label: string; icon: React.ReactNode }[] = [
    { id: "body", label: "Chassis", icon: <Car className="w-3.5 h-3.5" /> },
    { id: "decal", label: "Decals", icon: <Palette className="w-3.5 h-3.5" /> },
    { id: "wheels", label: "Wheels", icon: <Disc className="w-3.5 h-3.5" /> },
    { id: "boost", label: "Boost", icon: <Flame className="w-3.5 h-3.5" /> },
    { id: "goal_explosion", label: "Boom", icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: "topper", label: "Toppers", icon: <Crown className="w-3.5 h-3.5" /> },
    { id: "title", label: "Titles", icon: <Trophy className="w-3.5 h-3.5" /> },
    { id: "upgrade", label: "Mastery", icon: <ArrowUpCircle className="w-3.5 h-3.5" /> },
    { id: "bot_upgrade", label: "🤖 Bot AI", icon: <Cpu className="w-3.5 h-3.5 text-purple-400" /> }
  ];

  const currentSlotItems =
    activeSlot === "upgrade" || activeSlot === "bot_upgrade"
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

  const handleBotAttributeUpgrade = (attr: BotUpgradeAttribute) => {
    const res = upgradeBotAttribute(attr);
    if (res.success) {
      setBotUpgrades(getBotUpgrades());
      setInventory(getPlayerInventory());
      setUpgradeMsg(`Upgraded ${attr} to Level ${res.newLevel}!`);
    } else {
      setUpgradeMsg(res.error || "Upgrade failed");
    }
  };

  const handleArchetypeSelect = (arch: BotArchetype) => {
    setBotArchetype(arch);
    setBotUpgrades(getBotUpgrades());
    setUpgradeMsg(`Tactical archetype set to ${ARCHETYPE_CONFIG[arch].name}`);
  };

  const handleSaveBotName = () => {
    setBotName(editingBotName);
    setBotUpgrades(getBotUpgrades());
    setUpgradeMsg(`Bot designated as "${editingBotName.trim()}"`);
  };

  const upgradeCost = getCarUpgradeCost(carMastery.level);
  const botLevel = getBotOverallLevel(botUpgrades);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-1.5 sm:p-4 animate-fade-in font-sans select-none">
      <div className="bg-slate-950/95 border border-slate-700/80 rounded-2xl sm:rounded-3xl w-full max-w-5xl h-[94dvh] sm:h-[90vh] max-h-[820px] shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header Bar */}
        <div className="px-3 sm:px-5 py-2 sm:py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shrink-0 gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="p-1.5 sm:p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 shrink-0">
              <Car className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-base font-gaming font-black tracking-wide text-white truncate">
                GARAGE & WORKSHOP
              </h2>
              <p className="text-[10px] text-slate-400 hidden sm:flex items-center gap-1.5 truncate">
                <span>Title:</span>
                <span className="text-amber-400 font-bold truncate">{equippedTitle.name}</span>
              </p>
            </div>
          </div>

          {/* Economy & Crates Bar */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Coins Balance */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] sm:text-xs font-mono font-bold text-amber-300">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{inventory.coins.toLocaleString()} 🪙</span>
            </div>

            {/* Daily Bonus Button */}
            <button
              onClick={handleClaimBonus}
              className="flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] sm:text-[11px] font-gaming font-bold transition cursor-pointer active:scale-95"
              title="Claim daily bonus +500 Coins"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>+500</span>
            </button>

            {/* Crates Button */}
            <button
              onClick={onOpenCrates}
              className="flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-gaming font-bold text-[11px] sm:text-xs shadow-sm transition cursor-pointer active:scale-95"
            >
              <Package className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Crates</span>
              {totalCratesCount > 0 && (
                <span className="px-1 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black text-[9px]">
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

        {/* Notification Toast */}
        {upgradeMsg && (
          <div className="px-4 py-1.5 bg-sky-950/80 border-b border-sky-500/30 text-sky-200 text-xs font-gaming flex items-center justify-between shrink-0">
            <span>{upgradeMsg}</span>
            <button onClick={() => setUpgradeMsg(null)} className="text-slate-400 hover:text-white text-xs">
              ✕
            </button>
          </div>
        )}

        {/* Content Body: Left Stage + Right Catalog */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left: 2D Live Stage & Current Car Specs */}
          <div className="md:w-5/12 border-b md:border-b-0 md:border-r border-slate-800/80 p-2 sm:p-3 md:p-4 flex flex-col justify-between bg-gradient-to-b from-slate-950 via-slate-900/40 to-slate-950 shrink-0">
            <div className="flex flex-col items-center">
              {/* Compact Responsive Canvas Stage */}
              <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[16/9] sm:aspect-[4/3] rounded-2xl bg-radial from-slate-900/90 to-slate-950 border border-slate-800/80 flex items-center justify-center shadow-inner overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={300}
                  height={200}
                  className="w-full h-full block"
                />

                {/* Equipped Badge Tag */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-950/80 border border-slate-700/60 backdrop-blur-md text-[10px] font-gaming">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-white">{equippedBody.name}</span>
                </div>
              </div>

              {/* Quick Spec Pills (Hidden on mobile phones to save vertical space) */}
              <div className="hidden md:grid grid-cols-2 gap-2 w-full mt-3">
                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center gap-2">
                  <ItemVisualIcon item={equippedDecal} size="xs" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Decal</span>
                    <span className="font-semibold text-slate-200 truncate">{equippedDecal.name}</span>
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center gap-2">
                  <ItemVisualIcon item={equippedWheels} size="xs" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Wheels</span>
                    <span className="font-semibold text-slate-200 truncate">{equippedWheels.name}</span>
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center gap-2">
                  <ItemVisualIcon item={equippedBoost} size="xs" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Boost</span>
                    <span className="font-semibold text-slate-200 truncate">{equippedBoost.name}</span>
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center gap-2">
                  <ItemVisualIcon item={equippedTopper} size="xs" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Topper</span>
                    <span className="font-semibold text-slate-200 truncate">{equippedTopper.name}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Car Mastery Level Widget */}
            <div className="mt-2 p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-900/90 to-purple-500/10 border border-amber-500/30">
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-gaming font-bold text-amber-300 text-[11px]">
                    Mastery Lvl {carMastery.level}
                  </span>
                  {carMastery.prestige > 0 && (
                    <span className="px-1 py-0.2 rounded bg-purple-900 border border-purple-400 text-[9px] font-black text-purple-200">
                      ★ P{carMastery.prestige}
                    </span>
                  )}
                </div>
                <span className="text-slate-400 font-mono text-[10px]">
                  {carMastery.wins}W • {carMastery.goals}G
                </span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                  style={{ width: `${Math.min(100, (carMastery.xp % 600) / 6)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right: Category Tabs & Items Grid / Sub-views */}
          <div className="md:w-7/12 flex flex-col flex-1 overflow-hidden bg-slate-950/60">
            {/* Slot Tabs */}
            <div className="flex items-center gap-1 p-2 sm:p-2.5 border-b border-slate-800/80 overflow-x-auto no-scrollbar shrink-0 bg-slate-900/40">
              {slotTabs.map(tab => {
                const isActive = activeSlot === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveSlot(tab.id);
                      setPreviewItem(null);
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-gaming font-bold text-xs transition shrink-0 cursor-pointer ${
                      isActive
                        ? tab.id === "bot_upgrade"
                          ? "bg-purple-500 text-slate-950 shadow-md shadow-purple-500/20 font-black"
                          : "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20 font-black"
                        : "bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Sub-view 1: BOT AI LAB */}
            {activeSlot === "bot_upgrade" && (
              <div className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-3.5">
                {/* Bot Identity Card */}
                <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-purple-950/50 via-slate-900/90 to-slate-950 border border-purple-500/40 space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-400/40">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-gaming font-black text-sm sm:text-base text-purple-200">
                          PERSONAL BOT AI LAB
                        </h3>
                        <p className="text-[10px] text-slate-400">
                          Upgrade neural stats & combat protocol with Gold Coins
                        </p>
                      </div>
                    </div>
                    <div className="px-2.5 py-1 rounded-xl bg-purple-500/20 border border-purple-400/50 text-purple-200 font-mono font-black text-xs">
                      COMBAT LVL {botLevel} / 20
                    </div>
                  </div>

                  {/* Name Editor */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      maxLength={16}
                      value={editingBotName}
                      onChange={e => setEditingBotName(e.target.value)}
                      placeholder="Bot Designation Name"
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-gaming text-xs focus:outline-none focus:border-purple-400"
                    />
                    <button
                      onClick={handleSaveBotName}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-gaming font-bold text-xs cursor-pointer transition active:scale-95"
                    >
                      Rename
                    </button>
                  </div>
                </div>

                {/* Tactical Archetypes */}
                <div>
                  <label className="text-[11px] font-gaming font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                    <Shield className="w-3.5 h-3.5 text-purple-400" />
                    <span>Tactical Archetype (Combat Protocol)</span>
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(Object.keys(ARCHETYPE_CONFIG) as BotArchetype[]).map(arch => {
                      const cfg = ARCHETYPE_CONFIG[arch];
                      const isSelected = botUpgrades.tacticalArchetype === arch;
                      return (
                        <button
                          key={arch}
                          onClick={() => handleArchetypeSelect(arch)}
                          className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? "bg-purple-950/60 border-purple-400 ring-1 ring-purple-400/50 text-white shadow-md"
                              : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300"
                          }`}
                        >
                          <div>
                            <div className={`font-gaming font-black text-xs ${cfg.color}`}>
                              {cfg.name}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 leading-tight line-clamp-2">
                              {cfg.desc}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-[9px] uppercase font-bold text-slate-500">{cfg.badge}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-purple-400" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4 Upgrade Attributes */}
                <div>
                  <label className="text-[11px] font-gaming font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Neural Attributes & Upgrades</span>
                  </label>

                  <div className="space-y-2">
                    {[
                      {
                        id: "reactionSpeed" as BotUpgradeAttribute,
                        title: "Reflexes & Reads",
                        desc: "Cuts decision delay down to 10ms, improves wall reads & kickoff jump timing.",
                        icon: <Gauge className="w-4 h-4 text-sky-400" />
                      },
                      {
                        id: "boostThrift" as BotUpgradeAttribute,
                        title: "Boost Efficiency",
                        desc: "Conserves boost once supersonic, feathers in flight, smart pad pathing.",
                        icon: <Flame className="w-4 h-4 text-amber-400" />
                      },
                      {
                        id: "aerialFlight" as BotUpgradeAttribute,
                        title: "Aerial & Fast Double-Jump",
                        desc: "Fast aerial double-jumps, air-roll recovery, higher aerial commit height.",
                        icon: <Sparkles className="w-4 h-4 text-cyan-400" />
                      },
                      {
                        id: "strikerPower" as BotUpgradeAttribute,
                        title: "Shot Accuracy & Power",
                        desc: "Top-corner target calculation, high-impulse dodge powershots, corner pinches.",
                        icon: <Crosshair className="w-4 h-4 text-rose-400" />
                      }
                    ].map(attr => {
                      const lvl = botUpgrades[attr.id];
                      const isMax = lvl >= 5;
                      const nextCost = !isMax ? UPGRADE_COSTS[lvl + 1] : 0;
                      const canAfford = inventory.coins >= nextCost;

                      return (
                        <div
                          key={attr.id}
                          className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-2 rounded-xl bg-slate-800 text-slate-300 shrink-0">
                              {attr.icon}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-gaming font-black text-xs sm:text-sm text-white truncate">
                                  {attr.title}
                                </span>
                                <span className="text-[10px] font-mono font-bold text-amber-400">
                                  LVL {lvl}/5
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5 max-w-sm">
                                {attr.desc}
                              </p>
                              {/* 5-pip progress meter */}
                              <div className="flex gap-1 mt-1.5">
                                {[1, 2, 3, 4, 5].map(step => (
                                  <div
                                    key={step}
                                    className={`h-1.5 w-6 rounded-full ${
                                      step <= lvl ? "bg-purple-400 shadow-sm" : "bg-slate-800"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleBotAttributeUpgrade(attr.id)}
                            disabled={isMax || !canAfford}
                            className={`px-3 py-2 rounded-xl font-gaming font-black text-xs uppercase tracking-wider transition shrink-0 cursor-pointer ${
                              isMax
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 cursor-default"
                                : canAfford
                                ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95"
                                : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                            }`}
                          >
                            {isMax ? (
                              <span className="flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> MAX
                              </span>
                            ) : (
                              <span>Upgrade: {nextCost.toLocaleString()} 🪙</span>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Sub-view 2: Mastery Upgrades */}
            {activeSlot === "upgrade" && (
              <div className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-3.5">
                <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900/80 to-slate-950 border border-amber-500/40">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm sm:text-base font-gaming font-black text-amber-300 flex items-center gap-2">
                        <Crown className="w-4 h-4 text-amber-400" />
                        {equippedBody.name} Mastery Workshop
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Level up car mastery to unlock cosmetic prestige glowing auras and title honors.
                      </p>
                    </div>
                    <div className="px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 font-black font-mono text-xs sm:text-sm">
                      LVL {carMastery.level} / 50
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                      <div className="text-[9px] uppercase font-bold text-slate-400">Goals Scored</div>
                      <div className="text-base sm:text-lg font-mono font-black text-sky-400 mt-0.5">
                        {carMastery.goals}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                      <div className="text-[9px] uppercase font-bold text-slate-400">Epic Saves</div>
                      <div className="text-base sm:text-lg font-mono font-black text-emerald-400 mt-0.5">
                        {carMastery.saves}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                      <div className="text-[9px] uppercase font-bold text-slate-400">Total Shots</div>
                      <div className="text-base sm:text-lg font-mono font-black text-amber-400 mt-0.5">
                        {carMastery.shots}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                      <div className="text-[9px] uppercase font-bold text-slate-400">Matches Won</div>
                      <div className="text-base sm:text-lg font-mono font-black text-purple-400 mt-0.5">
                        {carMastery.wins}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span className="text-xs text-slate-400">
                      Upgrade Cost: <strong className="text-amber-300 font-mono">{upgradeCost.toLocaleString()} 🪙</strong>
                    </span>
                    <button
                      onClick={handleUpgradeClick}
                      disabled={inventory.coins < upgradeCost}
                      className={`px-4 py-2 rounded-xl font-gaming font-black text-xs uppercase tracking-wide transition cursor-pointer ${
                        inventory.coins >= upgradeCost
                          ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 shadow-md active:scale-95"
                          : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                      }`}
                    >
                      Upgrade Level
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-view 3: Item Catalog Grid */}
            {activeSlot !== "upgrade" && activeSlot !== "bot_upgrade" && (
              <div className="flex-1 p-2 sm:p-4 overflow-y-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {currentSlotItems.map(item => {
                    const isEquipped = inventory.loadout[item.slot] === item.id;
                    const isOwned = inventory.ownedItemIds.includes(item.id);
                    const rarity = RARITY_CONFIG[item.rarity] || RARITY_CONFIG.common;

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (isOwned) {
                            handleEquip(item);
                          } else {
                            setPreviewItem(item);
                          }
                        }}
                        className={`p-2 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between relative group ${
                          isEquipped
                            ? "bg-sky-950/60 border-sky-400 shadow-md ring-1 ring-sky-400/50"
                            : isOwned
                            ? "bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-200"
                            : "bg-slate-950/40 border-slate-900/80 opacity-50 hover:opacity-75"
                        } ${rarity.borderColor}`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[8px] font-gaming font-black px-1.5 py-0.2 rounded uppercase ${rarity.badgeBg}`}
                          >
                            {rarity.name}
                          </span>
                          {isEquipped ? (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          ) : !isOwned ? (
                            <Lock className="w-3 h-3 text-slate-500" />
                          ) : null}
                        </div>

                        <div className="my-2 flex flex-col items-center justify-center">
                          <div
                            className="w-12 h-10 rounded-xl flex items-center justify-center shadow-md p-1 border border-white/5"
                            style={{
                              backgroundColor: item.accentColor
                                ? `${item.accentColor}20`
                                : "rgba(56, 189, 248, 0.12)"
                            }}
                          >
                            <ItemVisualIcon item={item} size={32} />
                          </div>
                        </div>

                        <div>
                          <div className="font-gaming font-bold text-xs text-white truncate">
                            {item.name}
                          </div>
                          <div className="text-[9px] text-slate-400 truncate mt-0.5">
                            {isEquipped ? "Equipped" : isOwned ? "Owned" : "In Crates"}
                          </div>
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
