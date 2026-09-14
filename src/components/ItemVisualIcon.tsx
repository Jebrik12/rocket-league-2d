import React from "react";
import { CustomizationItem } from "../customization/customizationTypes";
import { ITEM_CATALOG } from "../customization/customizationData";

interface ItemVisualIconProps {
  item: CustomizationItem | string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  className?: string;
  showGlow?: boolean;
}

const SIZE_MAP = {
  xs: 20,
  sm: 28,
  md: 36,
  lg: 56,
  xl: 84
};

export const ItemVisualIcon: React.FC<ItemVisualIconProps> = ({
  item,
  size = "md",
  className = "",
  showGlow = false
}) => {
  const itemObj: CustomizationItem =
    typeof item === "string" ? ITEM_CATALOG[item] || ITEM_CATALOG.body_octane : item;

  const pixelSize = typeof size === "number" ? size : SIZE_MAP[size] || 36;
  const itemId = itemObj?.id || "";
  const slot = itemObj?.slot || "body";
  const accent = itemObj?.accentColor || "#38bdf8";

  // Render SVG graphic for the specific item
  const renderGraphic = () => {
    // --- 1. BODIES / CAR CHASSIS ---
    if (slot === "body") {
      const isTW = itemId === "body_tw_octane";
      const isGold = itemId === "body_gold_dominus";
      const isCyber = itemId === "body_cyber_fennec";
      const isFennec = itemId.includes("fennec");
      const isDominus = itemId.includes("dominus");
      const isBreakout = itemId.includes("breakout");
      const isSkyline = itemId.includes("skyline");
      const isMerc = itemId.includes("merc");

      if (isFennec) {
        // Fennec Boxy Rally Hot-Hatch
        return (
          <svg viewBox="0 0 64 40" className="w-full h-full drop-shadow-md">
            <defs>
              <linearGradient id={`fennec_grad_${itemId}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={isCyber ? "#22d3ee" : "#38bdf8"} />
                <stop offset="60%" stopColor={isCyber ? "#0891b2" : "#0284c7"} />
                <stop offset="100%" stopColor={isCyber ? "#164e63" : "#0369a1"} />
              </linearGradient>
            </defs>
            {/* Rear wheel */}
            <circle cx="17" cy="29" r="6.5" fill="#090d16" stroke="#334155" strokeWidth="1.5" />
            <circle cx="17" cy="29" r="3" fill="#64748b" />
            {/* Front wheel */}
            <circle cx="47" cy="29" r="6.5" fill="#090d16" stroke="#334155" strokeWidth="1.5" />
            <circle cx="47" cy="29" r="3" fill="#64748b" />
            {/* Body */}
            <path
              d="M 10 27 L 11 20 L 16 12 L 40 12 L 44 19 L 55 20 L 56 27 L 52 27 A 6.5 6.5 0 0 0 42 27 L 22 27 A 6.5 6.5 0 0 0 12 27 Z"
              fill={`url(#fennec_grad_${itemId})`}
              stroke="#0f172a"
              strokeWidth="1.8"
            />
            {/* Cabin Windows */}
            <path d="M 24 14 L 38 14 L 41 19 L 22 19 Z" fill="#070c14" />
            <line x1="30" y1="14" x2="30" y2="19" stroke="#0f172a" strokeWidth="1.5" />
            {/* Grille & Headlight */}
            <rect x="52" y="21" width="3" height="4" fill="#0f172a" rx="0.5" />
            <rect x="53" y="21" width="2" height="2" fill="#fef08a" />
            {/* Integrated roof spoiler */}
            <path d="M 14 11 L 18 11 L 17 13 L 13 13 Z" fill="#0f172a" />
            {/* Cyber neon traces if cyber */}
            {isCyber && (
              <path d="M 22 23 L 42 23 L 46 20" fill="none" stroke="#f43f5e" strokeWidth="1.2" />
            )}
          </svg>
        );
      }

      if (isDominus) {
        // Dominus Muscle Car
        return (
          <svg viewBox="0 0 64 40" className="w-full h-full drop-shadow-md">
            <defs>
              <linearGradient id={`dom_grad_${itemId}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={isGold ? "#fef08a" : "#f87171"} />
                <stop offset="50%" stopColor={isGold ? "#fbbf24" : "#ef4444"} />
                <stop offset="100%" stopColor={isGold ? "#b45309" : "#991b1b"} />
              </linearGradient>
            </defs>
            {/* Wheels */}
            <circle cx="17" cy="29" r="6" fill="#090d16" stroke="#334155" strokeWidth="1.5" />
            <circle cx="17" cy="29" r="2.5" fill={isGold ? "#fbbf24" : "#94a3b8"} />
            <circle cx="47" cy="29" r="6" fill="#090d16" stroke="#334155" strokeWidth="1.5" />
            <circle cx="47" cy="29" r="2.5" fill={isGold ? "#fbbf24" : "#94a3b8"} />
            {/* Long low muscle body */}
            <path
              d="M 9 27 L 10 21 L 18 15 L 34 15 L 42 20 L 57 21 L 58 27 L 53 27 A 6 6 0 0 0 41 27 L 23 27 A 6 6 0 0 0 11 27 Z"
              fill={`url(#dom_grad_${itemId})`}
              stroke="#0f172a"
              strokeWidth="1.8"
            />
            {/* Cabin glass */}
            <path d="M 22 17 L 33 17 L 39 20 L 18 20 Z" fill="#070c14" />
            {/* Supercharger Blower Scoop */}
            <rect x="44" y="17" width="7" height="3.5" rx="1" fill="#1e293b" stroke="#cbd5e1" strokeWidth="0.8" />
            <circle cx="49.5" cy="18.8" r="1" fill="#ef4444" />
            {/* Ducktail spoiler */}
            <line x1="9" y1="21" x2="13" y2="18" stroke="#0f172a" strokeWidth="2" />
            {/* Quad Headlight glow */}
            <circle cx="56" cy="23" r="1.5" fill="#fef08a" />
          </svg>
        );
      }

      if (isBreakout) {
        // Breakout Wedge Supercar
        return (
          <svg viewBox="0 0 64 40" className="w-full h-full drop-shadow-md">
            <defs>
              <linearGradient id="breakout_grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e879f9" />
                <stop offset="60%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#7e22ce" />
              </linearGradient>
            </defs>
            <circle cx="17" cy="29" r="6" fill="#090d16" stroke="#334155" strokeWidth="1.5" />
            <circle cx="47" cy="29" r="6" fill="#090d16" stroke="#334155" strokeWidth="1.5" />
            {/* Wedge body */}
            <path
              d="M 9 27 L 11 21 L 24 15 L 36 15 L 59 26 L 59 28 L 53 28 A 6 6 0 0 0 41 28 L 23 28 A 6 6 0 0 0 11 28 Z"
              fill="url(#breakout_grad)"
              stroke="#0f172a"
              strokeWidth="1.8"
            />
            {/* Cockpit Canopy */}
            <path d="M 27 16 L 35 16 L 47 23 L 24 23 Z" fill="#070c14" />
            {/* GT Racing Wing on struts */}
            <line x1="12" y1="21" x2="8" y2="12" stroke="#0f172a" strokeWidth="2" />
            <line x1="16" y1="20" x2="12" y2="12" stroke="#0f172a" strokeWidth="2" />
            <line x1="6" y1="12" x2="16" y2="12" stroke="#e879f9" strokeWidth="2.5" strokeLinecap="round" />
            {/* Front pop-up headlight */}
            <polygon points="54,24 57,25 54,26" fill="#fef08a" />
          </svg>
        );
      }

      if (isSkyline) {
        // Skyline GT-R R34 Coupe
        return (
          <svg viewBox="0 0 64 40" className="w-full h-full drop-shadow-md">
            <defs>
              <linearGradient id="skyline_grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#93c5fd" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
            </defs>
            <circle cx="17" cy="29" r="6" fill="#090d16" stroke="#334155" strokeWidth="1.5" />
            <circle cx="47" cy="29" r="6" fill="#090d16" stroke="#334155" strokeWidth="1.5" />
            {/* R34 Coupe Body */}
            <path
              d="M 9 27 L 10 20 L 19 14 L 35 14 L 43 20 L 56 21 L 57 27 L 53 27 A 6 6 0 0 0 41 27 L 23 27 A 6 6 0 0 0 11 27 Z"
              fill="url(#skyline_grad)"
              stroke="#0f172a"
              strokeWidth="1.8"
            />
            {/* Greenhouse windows */}
            <path d="M 22 16 L 34 16 L 40 20 L 18 20 Z" fill="#070c14" />
            {/* GT-R Wing */}
            <line x1="12" y1="20" x2="9" y2="13" stroke="#cbd5e1" strokeWidth="1.8" />
            <line x1="7" y1="13" x2="13" y2="13" stroke="#1d4ed8" strokeWidth="2.5" strokeLinecap="round" />
            {/* Signature twin red round taillights */}
            <circle cx="10.5" cy="22" r="1.2" fill="#ef4444" />
            <circle cx="10.5" cy="24.5" r="1.2" fill="#ef4444" />
            {/* Front Xenon headlight */}
            <rect x="52" y="21" width="3.5" height="2" fill="#38bdf8" rx="0.5" />
          </svg>
        );
      }

      if (isMerc) {
        // Merc Heavy Custom Van
        return (
          <svg viewBox="0 0 64 40" className="w-full h-full drop-shadow-md">
            <defs>
              <linearGradient id="merc_grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6ee7b7" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>
            </defs>
            <circle cx="17" cy="29" r="6" fill="#090d16" stroke="#334155" strokeWidth="1.5" />
            <circle cx="47" cy="29" r="6" fill="#090d16" stroke="#334155" strokeWidth="1.5" />
            {/* Tall Van Body */}
            <path
              d="M 9 27 L 9 14 L 44 14 L 49 19 L 56 20 L 56 27 L 53 27 A 6 6 0 0 0 41 27 L 23 27 A 6 6 0 0 0 11 27 Z"
              fill="url(#merc_grad)"
              stroke="#0f172a"
              strokeWidth="1.8"
            />
            {/* Front Cab Window */}
            <path d="M 38 16 L 43 16 L 47 19 L 38 19 Z" fill="#070c14" />
            {/* Roof Rack */}
            <line x1="13" y1="12" x2="42" y2="12" stroke="#cbd5e1" strokeWidth="1.5" />
            <line x1="16" y1="12" x2="16" y2="14" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="38" y1="12" x2="38" y2="14" stroke="#cbd5e1" strokeWidth="1" />
            {/* Front Bull Bar */}
            <line x1="55" y1="21" x2="57" y2="21" stroke="#cbd5e1" strokeWidth="2.5" />
            <line x1="57" y1="20" x2="57" y2="26" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
            <circle cx="53" cy="23" r="1.5" fill="#fef08a" />
          </svg>
        );
      }

      // Default: Octane (and Titanium White Octane)
      return (
        <svg viewBox="0 0 64 40" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id={`octane_grad_${itemId}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isTW ? "#ffffff" : "#38bdf8"} />
              <stop offset="50%" stopColor={isTW ? "#e2e8f0" : "#0284c7"} />
              <stop offset="100%" stopColor={isTW ? "#94a3b8" : "#0369a1"} />
            </linearGradient>
          </defs>
          {/* Wheels */}
          <circle cx="17" cy="29" r="6.5" fill="#090d16" stroke="#334155" strokeWidth="1.5" />
          <circle cx="17" cy="29" r="2.8" fill={isTW ? "#ffffff" : "#64748b"} />
          <circle cx="47" cy="29" r="6.5" fill="#090d16" stroke="#334155" strokeWidth="1.5" />
          <circle cx="47" cy="29" r="2.8" fill={isTW ? "#ffffff" : "#64748b"} />

          {/* Rear exposed engine bay & pipes */}
          <rect x="10" y="21" width="6" height="6" fill="#1e293b" stroke="#334155" strokeWidth="1" />
          <line x1="12" y1="21" x2="12" y2="18" stroke={isTW ? "#ffffff" : "#cbd5e1"} strokeWidth="1.5" />
          <line x1="14" y1="21" x2="14" y2="18" stroke={isTW ? "#ffffff" : "#cbd5e1"} strokeWidth="1.5" />

          {/* Iconic Octane Sculpted Body */}
          <path
            d="M 12 27 L 13 22 L 18 16 L 31 16 L 38 21 L 55 24 L 56 27 L 53 27 A 6.5 6.5 0 0 0 41 27 L 23 27 A 6.5 6.5 0 0 0 11 27 Z"
            fill={`url(#octane_grad_${itemId})`}
            stroke={isTW ? "#cbd5e1" : "#0f172a"}
            strokeWidth="1.8"
          />

          {/* Cabin & Tinted Cockpit */}
          <path d="M 21 18 L 30 18 L 34 21 L 18 21 Z" fill="#070c14" />
          {/* Roll cage tube */}
          <line x1="30" y1="18" x2="20" y2="21" stroke={isTW ? "#ffffff" : "#cbd5e1"} strokeWidth="1.2" />
          {/* Roof Scoop */}
          <polygon points="27,14 31,14 30,16 26,16" fill="#1e293b" />

          {/* Famous High-Mounted Octane Spoiler */}
          <line x1="14" y1="21" x2="10" y2="11" stroke={isTW ? "#cbd5e1" : "#0f172a"} strokeWidth="2.2" />
          <line x1="17" y1="20" x2="13" y2="11" stroke={isTW ? "#cbd5e1" : "#0f172a"} strokeWidth="2.2" />
          <line
            x1="7"
            y1="11"
            x2="17"
            y2="11"
            stroke={isTW ? "#ffffff" : "#0284c7"}
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Hood White Stripe */}
          <line x1="38" y1="22" x2="52" y2="24" stroke={isTW ? "#38bdf8" : "#ffffff"} strokeWidth="1.2" />
          {/* Headlight Glow */}
          <circle cx="54.5" cy="25.5" r="1.6" fill="#fef08a" />
        </svg>
      );
    }

    // --- 2. WHEELS ---
    if (slot === "wheels") {
      const isCristiano = itemId === "wheel_cristiano";
      const isAstro = itemId === "wheel_astro";
      const isApex = itemId === "wheel_apex";
      const isDraco = itemId === "wheel_draco";
      const isHologram = itemId === "wheel_hologram";

      return (
        <svg viewBox="0 0 48 48" className="w-full h-full drop-shadow-md">
          {/* Outer rubber tire */}
          <circle cx="24" cy="24" r="22" fill="#090d16" stroke="#1e293b" strokeWidth="2" />
          {/* Rim bed */}
          <circle cx="24" cy="24" r="17" fill="#0f172a" stroke="#334155" strokeWidth="1" />

          {isCristiano ? (
            /* Cristiano: 5-spoke blackout competition rim */
            <g>
              <circle cx="24" cy="24" r="16" fill="#020617" />
              {[0, 72, 144, 216, 288].map(deg => {
                const rad = (deg * Math.PI) / 180;
                const x2 = 24 + Math.cos(rad) * 15;
                const y2 = 24 + Math.sin(rad) * 15;
                return <line key={deg} x1="24" y1="24" x2={x2} y2={y2} stroke="#334155" strokeWidth="3" strokeLinecap="round" />;
              })}
              <circle cx="24" cy="24" r="3.5" fill="#1e293b" />
            </g>
          ) : isAstro ? (
            /* Astro-Star: Cyan starburst */
            <g>
              <circle cx="24" cy="24" r="16" fill="#082f49" />
              {[0, 60, 120, 180, 240, 300].map(deg => {
                const rad = (deg * Math.PI) / 180;
                const x2 = 24 + Math.cos(rad) * 15;
                const y2 = 24 + Math.sin(rad) * 15;
                return <line key={deg} x1="24" y1="24" x2={x2} y2={y2} stroke="#38bdf8" strokeWidth="2.5" />;
              })}
              <circle cx="24" cy="24" r="4" fill="#38bdf8" />
              <circle cx="24" cy="24" r="2" fill="#ffffff" />
            </g>
          ) : isApex ? (
            /* Apex: Turbine radiant cyan blades */
            <g>
              <circle cx="24" cy="24" r="16" fill="#082f49" stroke="#22d3ee" strokeWidth="1.5" />
              {[0, 60, 120, 180, 240, 300].map(deg => {
                const rad = (deg * Math.PI) / 180;
                const x1 = 24 + Math.cos(rad) * 4;
                const y1 = 24 + Math.sin(rad) * 4;
                const x2 = 24 + Math.cos(rad + 0.4) * 15;
                const y2 = 24 + Math.sin(rad + 0.4) * 15;
                return <path key={deg} d={`M ${x1} ${y1} Q 24 24 ${x2} ${y2}`} stroke="#22d3ee" strokeWidth="2.4" fill="none" />;
              })}
              <circle cx="24" cy="24" r="3" fill="#ffffff" />
            </g>
          ) : isDraco ? (
            /* Draco: Molten magma dragon flames */
            <g>
              <circle cx="24" cy="24" r="16" fill="#7c2d12" stroke="#ea580c" strokeWidth="1.5" />
              {[0, 90, 180, 270].map(deg => {
                const rad = (deg * Math.PI) / 180;
                const x2 = 24 + Math.cos(rad) * 15;
                const y2 = 24 + Math.sin(rad) * 15;
                return (
                  <path
                    key={deg}
                    d={`M 24 24 Q ${24 + Math.cos(rad + 0.5) * 10} ${24 + Math.sin(rad + 0.5) * 10} ${x2} ${y2}`}
                    stroke="#f97316"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    fill="none"
                  />
                );
              })}
              <circle cx="24" cy="24" r="4.5" fill="#fef08a" />
            </g>
          ) : isHologram ? (
            /* Hologram: Floating matrix ring */
            <g>
              <circle cx="24" cy="24" r="16" fill="#3b0764" />
              <circle cx="24" cy="24" r="14" fill="none" stroke="#e879f9" strokeWidth="2" strokeDasharray="4 2" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => {
                const rad = (deg * Math.PI) / 180;
                const bx = 24 + Math.cos(rad) * 9 - 1.5;
                const by = 24 + Math.sin(rad) * 9 - 1.5;
                return <rect key={deg} x={bx} y={by} width="3" height="3" fill="#f43f5e" />;
              })}
              <circle cx="24" cy="24" r="3" fill="#e879f9" />
            </g>
          ) : (
            /* OEM Standard */
            <g>
              <circle cx="24" cy="24" r="16" fill="#334155" />
              {[0, 90, 180, 270].map(deg => {
                const rad = (deg * Math.PI) / 180;
                const x2 = 24 + Math.cos(rad) * 15;
                const y2 = 24 + Math.sin(rad) * 15;
                return <line key={deg} x1="24" y1="24" x2={x2} y2={y2} stroke="#94a3b8" strokeWidth="2.8" />;
              })}
              <circle cx="24" cy="24" r="3" fill="#ffffff" />
            </g>
          )}
        </svg>
      );
    }

    // --- 3. DECALS ---
    if (slot === "decal") {
      const pattern = itemObj?.visualData?.decalPattern || "stripe";

      return (
        <svg viewBox="0 0 48 48" className="w-full h-full drop-shadow-md">
          {/* Car Hood Shield Swatch */}
          <path
            d="M 12 8 L 36 8 L 42 30 L 24 42 L 6 30 Z"
            fill="#0f172a"
            stroke="#38bdf8"
            strokeWidth="1.8"
          />

          {pattern === "flame" ? (
            /* Hellfire Flames */
            <g>
              <path
                d="M 12 36 Q 24 16 24 12 Q 24 20 30 22 Q 36 18 36 34 Z"
                fill="#f97316"
              />
              <path
                d="M 18 36 Q 24 22 24 18 Q 24 24 28 26 Q 30 24 30 36 Z"
                fill="#fef08a"
              />
            </g>
          ) : pattern === "carbon" ? (
            /* Carbon weave */
            <g>
              <rect x="10" y="10" width="28" height="28" fill="#1e293b" opacity="0.8" />
              {[12, 16, 20, 24, 28, 32].map(x => (
                <line key={x} x1={x} y1="10" x2={x} y2="38" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 3" />
              ))}
            </g>
          ) : pattern === "galaxy" ? (
            /* Galaxy Nebula */
            <g>
              <defs>
                <linearGradient id="gal_grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="50%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>
              <path d="M 12 8 L 36 8 L 42 30 L 24 42 L 6 30 Z" fill="url(#gal_grad)" opacity="0.8" />
              <circle cx="20" cy="20" r="1.5" fill="#ffffff" />
              <circle cx="28" cy="28" r="1.2" fill="#ffffff" />
              <circle cx="32" cy="18" r="1" fill="#ffffff" />
            </g>
          ) : pattern === "dragon" ? (
            /* Dragon Swoosh */
            <g>
              <path
                d="M 38 14 Q 20 18 24 26 Q 28 34 10 36"
                fill="none"
                stroke="#ef4444"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <circle cx="36" cy="15" r="2" fill="#fef08a" />
            </g>
          ) : pattern === "cyber" ? (
            /* Circuit Overload */
            <g>
              <path d="M 12 16 L 24 16 L 28 26 L 36 26" fill="none" stroke="#06b6d4" strokeWidth="2" />
              <circle cx="12" cy="16" r="2" fill="#ffffff" />
              <circle cx="36" cy="26" r="2" fill="#ffffff" />
              <path d="M 16 32 L 22 32 L 26 38" fill="none" stroke="#06b6d4" strokeWidth="1.5" />
            </g>
          ) : pattern === "gold" ? (
            /* 24K Gold Leaf */
            <g>
              <path d="M 12 8 L 36 8 L 42 30 L 24 42 L 6 30 Z" fill="#b45309" opacity="0.5" />
              <path d="M 16 12 L 32 12 L 36 28 L 24 36 L 12 28 Z" fill="none" stroke="#fbbf24" strokeWidth="2" />
              <polygon points="24,16 28,24 24,30 20,24" fill="#fef08a" />
            </g>
          ) : (
            /* Racing Stripes */
            <g>
              <line x1="21" y1="8" x2="21" y2="42" stroke="#ffffff" strokeWidth="3" />
              <line x1="27" y1="8" x2="27" y2="42" stroke="#ffffff" strokeWidth="3" />
            </g>
          )}
        </svg>
      );
    }

    // --- 4. BOOST TRAILS ---
    if (slot === "boost") {
      const style = itemObj?.visualData?.boostStyle || "standard";

      return (
        <svg viewBox="0 0 48 48" className="w-full h-full drop-shadow-md">
          {/* Thruster nozzle */}
          <polygon points="6,18 14,20 14,28 6,30" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
          <line x1="14" y1="21" x2="14" y2="27" stroke="#f59e0b" strokeWidth="2" />

          {style === "flamethrower" ? (
            /* Napalm red/orange flames */
            <g>
              <path d="M 14 24 Q 28 14 44 24 Q 28 34 14 24 Z" fill="#ef4444" />
              <path d="M 14 24 Q 24 18 36 24 Q 24 30 14 24 Z" fill="#f97316" />
              <path d="M 14 24 Q 20 21 28 24 Q 20 27 14 24 Z" fill="#fef08a" />
            </g>
          ) : style === "plasma" ? (
            /* Ion Plasma Teal Energy */
            <g>
              <path d="M 14 24 Q 28 16 44 24 Q 28 32 14 24 Z" fill="#0d9488" />
              <path d="M 14 24 L 40 24" stroke="#2dd4bf" strokeWidth="4" strokeLinecap="round" />
              <path d="M 20 18 L 26 24 L 32 18" fill="none" stroke="#99f6e4" strokeWidth="1.5" />
              <circle cx="34" cy="24" r="3" fill="#ffffff" />
            </g>
          ) : style === "rainbow" ? (
            /* Rainbow spectrum ribbon */
            <g>
              <path d="M 14 20 Q 28 12 44 18" fill="none" stroke="#ef4444" strokeWidth="2.5" />
              <path d="M 14 22 Q 28 15 44 21" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
              <path d="M 14 24 Q 28 18 44 24" fill="none" stroke="#10b981" strokeWidth="2.5" />
              <path d="M 14 26 Q 28 21 44 27" fill="none" stroke="#06b6d4" strokeWidth="2.5" />
              <path d="M 14 28 Q 28 24 44 30" fill="none" stroke="#a855f7" strokeWidth="2.5" />
            </g>
          ) : style === "electro" ? (
            /* Electro purple lightning */
            <g>
              <path
                d="M 14 24 L 22 17 L 26 25 L 34 16 L 44 24 L 32 29 L 26 23 L 20 31 Z"
                fill="#a855f7"
                stroke="#c084fc"
                strokeWidth="1.2"
              />
              <circle cx="28" cy="22" r="3" fill="#ffffff" />
            </g>
          ) : style === "sakura" ? (
            /* Sakura petals */
            <g>
              <path d="M 14 24 Q 26 18 42 24" fill="none" stroke="#f472b6" strokeWidth="3" strokeDasharray="5 3" />
              <circle cx="24" cy="18" r="2.5" fill="#f472b6" />
              <circle cx="32" cy="26" r="2.5" fill="#f472b6" />
              <circle cx="38" cy="19" r="2" fill="#fb7185" />
              <circle cx="28" cy="29" r="1.5" fill="#fbcfe8" />
            </g>
          ) : (
            /* Standard thruster */
            <g>
              <path d="M 14 24 Q 28 16 44 24 Q 28 32 14 24 Z" fill="#0284c7" />
              <path d="M 14 24 Q 24 19 36 24 Q 24 29 14 24 Z" fill="#38bdf8" />
              <path d="M 14 24 Q 20 21 26 24 Q 20 27 14 24 Z" fill="#fef08a" />
            </g>
          )}
        </svg>
      );
    }

    // --- 5. GOAL EXPLOSIONS ---
    if (slot === "goal_explosion") {
      const style = itemObj?.visualData?.explosionStyle || "standard";

      return (
        <svg viewBox="0 0 48 48" className="w-full h-full drop-shadow-md">
          {style === "hellfire" ? (
            /* Flaming Demon Skull */
            <g>
              {/* Flame aura */}
              <circle cx="24" cy="24" r="19" fill="#7f1d1d" opacity="0.6" />
              {/* Skull shape */}
              <path
                d="M 16 26 C 16 16 32 16 32 26 C 32 30 28 34 26 36 L 22 36 C 20 34 16 30 16 26 Z"
                fill="#ef4444"
                stroke="#f97316"
                strokeWidth="1.5"
              />
              {/* Horns */}
              <path d="M 17 18 Q 11 10 9 14 Q 13 19 16 21 Z" fill="#f97316" />
              <path d="M 31 18 Q 37 10 39 14 Q 35 19 32 21 Z" fill="#f97316" />
              {/* Glowing eyes */}
              <circle cx="20" cy="24" r="2.5" fill="#fef08a" />
              <circle cx="28" cy="24" r="2.5" fill="#fef08a" />
            </g>
          ) : style === "singularity" ? (
            /* Black Hole Vortex */
            <g>
              <circle cx="24" cy="24" r="20" fill="none" stroke="#d946ef" strokeWidth="2.5" strokeDasharray="8 4" />
              <ellipse cx="24" cy="24" rx="16" ry="6" fill="none" stroke="#a855f7" strokeWidth="3" transform="rotate(-25 24 24)" />
              {/* Void core */}
              <circle cx="24" cy="24" r="9" fill="#020617" stroke="#e879f9" strokeWidth="1.5" />
            </g>
          ) : style === "supernova" ? (
            /* Supernova Golden Burst */
            <g>
              <circle cx="24" cy="24" r="18" fill="#78350f" opacity="0.5" />
              {[0, 45, 90, 135].map(deg => (
                <line
                  key={deg}
                  x1="6"
                  y1="24"
                  x2="42"
                  y2="24"
                  stroke="#fbbf24"
                  strokeWidth="2.2"
                  transform={`rotate(${deg} 24 24)`}
                />
              ))}
              <ellipse cx="24" cy="24" rx="18" ry="7" fill="none" stroke="#fef08a" strokeWidth="2" transform="rotate(30 24 24)" />
              <circle cx="24" cy="24" r="7" fill="#ffffff" />
            </g>
          ) : style === "electro" ? (
            /* Electroshock */
            <g>
              <circle cx="24" cy="24" r="18" fill="#082f49" opacity="0.6" />
              <path d="M 24 6 L 27 18 L 38 14 L 30 24 L 42 27 L 27 31 L 29 42 L 20 30 L 8 32 L 17 23 L 6 18 L 19 16 Z" fill="#38bdf8" />
              <circle cx="24" cy="24" r="4.5" fill="#ffffff" />
            </g>
          ) : style === "pixel" ? (
            /* 8-bit Pixel explosion */
            <g>
              <rect x="20" y="20" width="8" height="8" fill="#10b981" />
              <rect x="14" y="14" width="5" height="5" fill="#34d399" />
              <rect x="29" y="14" width="5" height="5" fill="#34d399" />
              <rect x="14" y="29" width="5" height="5" fill="#34d399" />
              <rect x="29" y="29" width="5" height="5" fill="#34d399" />
              <rect x="8" y="22" width="4" height="4" fill="#a7f3d0" />
              <rect x="36" y="22" width="4" height="4" fill="#a7f3d0" />
            </g>
          ) : (
            /* Standard shockwave */
            <g>
              <circle cx="24" cy="24" r="18" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="6 3" />
              <circle cx="24" cy="24" r="11" fill="#f59e0b" opacity="0.8" />
              <circle cx="24" cy="24" r="5" fill="#fef08a" />
            </g>
          )}
        </svg>
      );
    }

    // --- 6. TOPPERS ---
    if (slot === "topper") {
      const style = itemObj?.visualData?.topperStyle;

      if (style === "halo") {
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full drop-shadow-md">
            <ellipse cx="24" cy="24" rx="16" ry="6" fill="none" stroke="#fbbf24" strokeWidth="3.5" />
            <ellipse cx="24" cy="24" rx="16" ry="6" fill="none" stroke="#fef08a" strokeWidth="1.5" />
            <circle cx="24" cy="18" r="1" fill="#ffffff" />
          </svg>
        );
      }
      if (style === "crown") {
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full drop-shadow-md">
            <path
              d="M 10 32 L 8 16 L 16 22 L 24 12 L 32 22 L 40 16 L 38 32 Z"
              fill="#fbbf24"
              stroke="#b45309"
              strokeWidth="1.5"
            />
            {/* Ruby center gem */}
            <circle cx="24" cy="26" r="3" fill="#ef4444" stroke="#ffffff" strokeWidth="0.8" />
          </svg>
        );
      }
      if (style === "shades") {
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full drop-shadow-md">
            <rect x="8" y="20" width="32" height="10" fill="#020617" rx="1.5" />
            <rect x="11" y="22" width="5" height="3" fill="#ffffff" />
            <rect x="27" y="22" width="5" height="3" fill="#ffffff" />
          </svg>
        );
      }
      if (style === "horns") {
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full drop-shadow-md">
            <path d="M 14 34 Q 8 20 10 14 Q 16 22 20 34 Z" fill="#f43f5e" />
            <path d="M 34 34 Q 40 20 38 14 Q 32 22 28 34 Z" fill="#f43f5e" />
          </svg>
        );
      }
      // No topper
      return (
        <svg viewBox="0 0 48 48" className="w-full h-full opacity-30">
          <circle cx="24" cy="24" r="16" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
          <line x1="16" y1="16" x2="32" y2="32" stroke="#94a3b8" strokeWidth="2" />
        </svg>
      );
    }

    // --- 7. TITLES ---
    return (
      <svg viewBox="0 0 48 48" className="w-full h-full drop-shadow-md">
        <polygon points="24,6 40,12 36,36 24,44 12,36 8,12" fill="#1e293b" stroke={accent} strokeWidth="2" />
        <path d="M 24 14 L 27 21 L 34 22 L 29 27 L 30 34 L 24 30 L 18 34 L 19 27 L 14 22 L 21 21 Z" fill={accent} />
      </svg>
    );
  };

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 ${className}`}
      style={{
        width: `${pixelSize}px`,
        height: `${pixelSize}px`
      }}
    >
      {showGlow && (
        <div
          className="absolute inset-0 rounded-full blur-md opacity-40 pointer-events-none"
          style={{ backgroundColor: accent }}
        />
      )}
      {renderGraphic()}
    </div>
  );
};
