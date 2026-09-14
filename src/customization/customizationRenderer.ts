import { CustomizationItem } from "./customizationTypes";
import { ITEM_CATALOG } from "./customizationData";

/**
 * Draw custom livery decal overlay on a car body
 */
export function drawCarDecal(
  ctx: CanvasRenderingContext2D,
  car: any,
  halfW: number,
  halfH: number,
  decalItem?: CustomizationItem
) {
  if (!decalItem || decalItem.id === "decal_none") return;
  const pattern = decalItem.visualData.decalPattern;
  const secColor = decalItem.visualData.decalSecondary || "#ffffff";

  ctx.save();
  // Clip to car body envelope
  ctx.beginPath();
  ctx.roundRect(-halfW + 4, -halfH + 2, halfW * 2 - 8, halfH * 2 - 6, 4);
  ctx.clip();

  if (pattern === "stripe") {
    // Twin racing stripes down the length of the hood and roof
    ctx.fillStyle = secColor;
    ctx.fillRect(-halfW + 8, -4, halfW * 2 - 16, 2.5);
    ctx.fillRect(-halfW + 8, 2, halfW * 2 - 16, 2.5);
  } else if (pattern === "flame") {
    // Aggressive flames bursting backwards from the front
    ctx.fillStyle = secColor;
    ctx.beginPath();
    ctx.moveTo(halfW - 6, 0);
    ctx.quadraticCurveTo(halfW / 2, -halfH + 4, 0, -2);
    ctx.quadraticCurveTo(-halfW / 4, -halfH + 2, -halfW / 2, 0);
    ctx.quadraticCurveTo(-halfW / 4, halfH - 4, 0, 2);
    ctx.quadraticCurveTo(halfW / 2, halfH - 2, halfW - 6, 0);
    ctx.closePath();
    ctx.fill();

    // Inner bright flame core
    ctx.fillStyle = "#fef08a";
    ctx.beginPath();
    ctx.moveTo(halfW - 10, 0);
    ctx.quadraticCurveTo(halfW / 2, -2, 4, -1);
    ctx.quadraticCurveTo(halfW / 2, 2, halfW - 10, 0);
    ctx.closePath();
    ctx.fill();
  } else if (pattern === "carbon") {
    // Carbon fiber hatch and hood
    ctx.fillStyle = secColor;
    ctx.fillRect(0, -halfH + 2, halfW - 6, halfH * 2 - 6);
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    for (let x = 0; x < halfW - 6; x += 4) {
      ctx.fillRect(x, -halfH + 2, 2, halfH * 2 - 6);
    }
  } else if (pattern === "galaxy") {
    // Cosmic glowing nebula bands
    const grad = ctx.createLinearGradient(-halfW, -halfH, halfW, halfH);
    grad.addColorStop(0, "rgba(168, 85, 247, 0.6)");
    grad.addColorStop(0.5, "rgba(236, 72, 153, 0.7)");
    grad.addColorStop(1, "rgba(56, 189, 248, 0.6)");
    ctx.fillStyle = grad;
    ctx.fillRect(-halfW, -halfH, halfW * 2, halfH * 2);

    // Starlight dots
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-halfW / 2, -4, 1.2, 0, Math.PI * 2);
    ctx.arc(0, 2, 1.5, 0, Math.PI * 2);
    ctx.arc(halfW / 3, -2, 1.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (pattern === "dragon") {
    // Coiled red dragon swoosh
    ctx.strokeStyle = secColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(halfW - 8, 2);
    ctx.bezierCurveTo(halfW / 3, -halfH + 2, -halfW / 4, halfH - 2, -halfW + 8, -2);
    ctx.stroke();

    // Dragon glowing eye
    ctx.fillStyle = "#fef08a";
    ctx.beginPath();
    ctx.arc(halfW - 12, -1, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (pattern === "cyber") {
    // Neon digital circuit traces
    ctx.strokeStyle = secColor;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(halfW - 6, -3);
    ctx.lineTo(halfW / 3, -3);
    ctx.lineTo(0, -halfH + 4);
    ctx.lineTo(-halfW + 10, -halfH + 4);
    ctx.moveTo(halfW / 2, 3);
    ctx.lineTo(0, 3);
    ctx.lineTo(-halfW / 3, halfH - 4);
    ctx.lineTo(-halfW + 8, halfH - 4);
    ctx.stroke();

    // Circuit nodes
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-halfW + 8, -halfH + 3, 2, 2);
    ctx.fillRect(-halfW + 6, halfH - 5, 2, 2);
  } else if (pattern === "gold") {
    // Opulent liquid gold sheen & gilded accents
    const goldGrad = ctx.createLinearGradient(-halfW, -halfH, halfW, halfH);
    goldGrad.addColorStop(0, "rgba(251, 191, 36, 0.8)");
    goldGrad.addColorStop(0.5, "rgba(254, 240, 138, 0.95)");
    goldGrad.addColorStop(1, "rgba(217, 119, 6, 0.8)");
    ctx.strokeStyle = goldGrad;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-halfW + 6, -halfH + 4, halfW * 2 - 12, halfH * 2 - 8);

    ctx.fillStyle = "rgba(254, 240, 138, 0.35)";
    ctx.fillRect(-halfW + 6, -halfH + 4, halfW * 2 - 12, halfH * 2 - 8);
  }

  ctx.restore();
}

/**
 * Draw custom wheels / rims
 */
export function drawCustomWheel(
  ctx: CanvasRenderingContext2D,
  wx: number,
  wy: number,
  radius: number,
  wheelItem?: CustomizationItem,
  spinAngle: number = 0,
  isFarSide: boolean = false
) {
  const style = wheelItem?.visualData?.wheelStyle || "oem";
  const glowHex = wheelItem?.visualData?.glowHex;

  ctx.save();
  ctx.translate(wx, wy);

  if (isFarSide) {
    ctx.globalAlpha = 0.55;
  }

  // Outer tire tread
  ctx.fillStyle = isFarSide ? "#05070c" : "#090d16";
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  // Outer tire edge ring
  ctx.strokeStyle = isFarSide ? "#0f172a" : "#1e293b";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Glow if exotic / black market (near side only)
  if (glowHex && !isFarSide) {
    ctx.shadowColor = glowHex;
    ctx.shadowBlur = 8;
  }

  ctx.rotate(spinAngle);

  if (style === "cristiano") {
    // Ultra sleek 5-spoke blackout rims
    ctx.fillStyle = "#020617";
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.72, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1.8;
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * radius * 0.68, Math.sin(a) * radius * 0.68);
      ctx.stroke();
    }
  } else if (style === "apex") {
    // Turbine radiant cyan glow
    ctx.fillStyle = "#082f49";
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.75, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#22d3ee";
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI * 2) / 6;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * radius * 0.2, Math.sin(a) * radius * 0.2);
      ctx.lineTo(Math.cos(a + 0.3) * radius * 0.72, Math.sin(a + 0.3) * radius * 0.72);
      ctx.stroke();
    }
  } else if (style === "draco") {
    // Molten magma fire wheel
    ctx.fillStyle = "#7c2d12";
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.75, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#f97316";
    ctx.lineWidth = 2.2;
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI * 2) / 4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(
        Math.cos(a + 0.4) * radius * 0.5,
        Math.sin(a + 0.4) * radius * 0.5,
        Math.cos(a) * radius * 0.72,
        Math.sin(a) * radius * 0.72
      );
      ctx.stroke();
    }
  } else if (style === "hologram") {
    // Holographic floating matrix ring
    ctx.strokeStyle = "#e879f9";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.65, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#f43f5e";
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI * 2) / 8;
      ctx.fillRect(Math.cos(a) * radius * 0.45 - 1, Math.sin(a) * radius * 0.45 - 1, 2, 2);
    }
  } else {
    // Default OEM alloy
    ctx.fillStyle = "#64748b";
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI * 2) / 4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * radius * 0.65, Math.sin(a) * radius * 0.65);
      ctx.stroke();
    }
  }

  // Center axle lug nut
  ctx.fillStyle = "#f8fafc";
  ctx.beginPath();
  ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draw roof topper (Halo, Crown, Shades, Horns)
 */
export function drawCarTopper(
  ctx: CanvasRenderingContext2D,
  car: any,
  halfW: number,
  halfH: number,
  topperItem?: CustomizationItem
) {
  if (!topperItem || topperItem.id === "topper_none") return;
  const style = topperItem.visualData?.topperStyle;

  ctx.save();
  // Roof center position
  const roofX = -2;
  const roofY = -halfH - 2;

  if (style === "halo") {
    // Gentle floating golden halo ring
    const bob = Math.sin(Date.now() / 250) * 2.5;
    ctx.translate(roofX, roofY - 10 + bob);

    ctx.shadowColor = "rgba(251, 191, 36, 0.9)";
    ctx.shadowBlur = 10;
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 4.5, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "#fef08a";
    ctx.lineWidth = 1.2;
    ctx.stroke();
  } else if (style === "crown") {
    // Golden crown with jewels
    ctx.translate(roofX, roofY - 7);
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.moveTo(-11, 4);
    ctx.lineTo(-12, -6);
    ctx.lineTo(-6, -2);
    ctx.lineTo(0, -9);
    ctx.lineTo(6, -2);
    ctx.lineTo(12, -6);
    ctx.lineTo(11, 4);
    ctx.closePath();
    ctx.fill();

    // Red ruby jewel in middle
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(0, -1, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (style === "shades") {
    // Pixel sunglasses over windshield
    ctx.translate(halfW * 0.25, -halfH + 3);
    ctx.fillStyle = "#020617";
    ctx.fillRect(-10, -3, 20, 5);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-8, -2, 3, 2);
    ctx.fillRect(2, -2, 3, 2);
  } else if (style === "horns") {
    // Glowing red cyber horns
    ctx.translate(roofX, roofY);
    ctx.shadowColor = "#f43f5e";
    ctx.shadowBlur = 8;
    ctx.fillStyle = "#f43f5e";

    // Left horn
    ctx.beginPath();
    ctx.moveTo(-8, 2);
    ctx.quadraticCurveTo(-14, -6, -12, -12);
    ctx.quadraticCurveTo(-7, -8, -5, 2);
    ctx.closePath();
    ctx.fill();

    // Right horn
    ctx.beginPath();
    ctx.moveTo(5, 2);
    ctx.quadraticCurveTo(7, -8, 12, -12);
    ctx.quadraticCurveTo(14, -6, 8, 2);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Detailed Octane side-profile chassis renderer
 */
export function drawOctaneBody(
  u: CanvasRenderingContext2D,
  f: any,
  r: number,
  s: number,
  nearWheelY: number,
  rearWheelX: number,
  frontWheelX: number,
  wheelRadius: number,
  primaryBright: string,
  primaryMid: string,
  primaryDark: string,
  accentColor: string,
  chassisDark: string,
  metalSilver: string,
  metalDark: string
) {
  // 1. Rear exposed engine bay
  u.fillStyle = "#1e293b";
  u.strokeStyle = metalDark;
  u.lineWidth = 1.2;
  u.fillRect(-r + 9, -5, 12, 9);
  u.strokeRect(-r + 9, -5, 12, 9);

  // Chrome intake pipes
  u.strokeStyle = metalSilver;
  u.lineWidth = 1.8;
  for (let px = -r + 11; px <= -r + 19; px += 4) {
    u.beginPath();
    u.moveTo(px, -5);
    u.lineTo(px, -9);
    u.lineTo(px - 2, -11);
    u.stroke();
  }

  // 2. Main Octane Body
  const bodyGrad = u.createLinearGradient(0, -s - 6, 0, nearWheelY);
  bodyGrad.addColorStop(0, primaryBright);
  bodyGrad.addColorStop(0.4, primaryMid);
  bodyGrad.addColorStop(1, primaryDark);

  u.fillStyle = bodyGrad;
  u.strokeStyle = chassisDark;
  u.lineWidth = 2;
  u.beginPath();
  u.moveTo(-r + 5, nearWheelY);
  u.lineTo(rearWheelX - wheelRadius - 2.5, nearWheelY);
  u.quadraticCurveTo(rearWheelX, nearWheelY - wheelRadius - 3.5, rearWheelX + wheelRadius + 2.5, nearWheelY);
  u.lineTo(frontWheelX - wheelRadius - 2.5, nearWheelY);
  u.quadraticCurveTo(frontWheelX, nearWheelY - wheelRadius - 3.5, frontWheelX + wheelRadius + 2.5, nearWheelY);
  u.lineTo(r - 3, nearWheelY);
  u.lineTo(r + 1, nearWheelY - 3);
  u.lineTo(r + 2, 0);
  u.lineTo(r - 2, -3);
  u.lineTo(6, -6);
  u.lineTo(-4, -s);
  u.lineTo(-15, -s + 1);
  u.lineTo(-20, -5);
  u.lineTo(-r + 6, -3);
  u.lineTo(-r + 5, nearWheelY - 1);
  u.closePath();
  u.fill();
  u.stroke();

  // 3. Cabin & tinted window
  u.fillStyle = "#070c14";
  u.strokeStyle = primaryDark;
  u.lineWidth = 1.4;
  u.beginPath();
  u.moveTo(4, -6);
  u.lineTo(-3, -s + 1.5);
  u.lineTo(-13, -s + 2.5);
  u.lineTo(-17, -5);
  u.closePath();
  u.fill();
  u.stroke();

  u.strokeStyle = "rgba(255, 255, 255, 0.65)";
  u.lineWidth = 1.5;
  u.beginPath();
  u.moveTo(2, -6);
  u.lineTo(-3, -s + 2);
  u.stroke();

  // Tubular roll cage
  u.strokeStyle = metalSilver;
  u.lineWidth = 1.4;
  u.beginPath();
  u.moveTo(3, -6);
  u.lineTo(-3.5, -s + 1.5);
  u.moveTo(-13.5, -s + 2);
  u.lineTo(-17, -5);
  u.stroke();

  // Roof scoop
  u.fillStyle = "#1e293b";
  u.strokeStyle = metalDark;
  u.lineWidth = 1;
  u.beginPath();
  u.moveTo(-2, -s);
  u.lineTo(-10, -s);
  u.lineTo(-8, -s - 2.8);
  u.lineTo(-1, -s - 2.8);
  u.closePath();
  u.fill();
  u.stroke();

  // Hood white stripe
  u.fillStyle = "rgba(255, 255, 255, 0.92)";
  u.beginPath();
  u.moveTo(r - 2, -1.5);
  u.lineTo(6, -5);
  u.lineTo(5, -6.5);
  u.lineTo(r - 3, -3);
  u.closePath();
  u.fill();

  // Side accent swoosh
  u.strokeStyle = accentColor;
  u.lineWidth = 1.5;
  u.beginPath();
  u.moveTo(frontWheelX - 4, nearWheelY - 6);
  u.lineTo(0, nearWheelY - 8);
  u.lineTo(rearWheelX + 6, nearWheelY - 6);
  u.stroke();

  // High-mounted rear spoiler wing
  u.strokeStyle = chassisDark;
  u.lineWidth = 2.5;
  u.beginPath();
  u.moveTo(-20, -5);
  u.lineTo(-24, -s - 4);
  u.moveTo(-17, -4);
  u.lineTo(-21, -s - 4);
  u.stroke();

  u.strokeStyle = metalSilver;
  u.lineWidth = 1;
  u.beginPath();
  u.moveTo(-19.5, -5);
  u.lineTo(-23.5, -s - 4);
  u.stroke();

  const wingGrad = u.createLinearGradient(-28, -s - 7, -17, -s - 5);
  wingGrad.addColorStop(0, "#0f172a");
  wingGrad.addColorStop(0.5, primaryMid);
  wingGrad.addColorStop(1, primaryBright);

  u.fillStyle = wingGrad;
  u.strokeStyle = chassisDark;
  u.lineWidth = 1.4;
  u.beginPath();
  u.moveTo(-28, -s - 4);
  u.lineTo(-17, -s - 3);
  u.lineTo(-16, -s - 7);
  u.lineTo(-28, -s - 7);
  u.closePath();
  u.fill();
  u.stroke();

  u.fillStyle = primaryBright;
  u.fillRect(-29, -s - 8, 3.5, 6);
  u.strokeStyle = chassisDark;
  u.lineWidth = 1;
  u.strokeRect(-29, -s - 8, 3.5, 6);

  // Headlight
  u.fillStyle = "#fef08a";
  u.shadowColor = "#fef08a";
  u.shadowBlur = 8;
  u.beginPath();
  u.arc(r + 1, -1, 2.2, 0, Math.PI * 2);
  u.fill();
  u.shadowBlur = 0;
}

/**
 * Detailed Fennec side-profile chassis renderer
 */
export function drawFennecBody(
  u: CanvasRenderingContext2D,
  f: any,
  r: number,
  s: number,
  nearWheelY: number,
  rearWheelX: number,
  frontWheelX: number,
  wheelRadius: number,
  primaryBright: string,
  primaryMid: string,
  primaryDark: string,
  accentColor: string,
  chassisDark: string,
  metalSilver: string,
  metalDark: string
) {
  // Fennec: Boxy Rally Hot-Hatch (Lancia Delta Integrale style)
  const bodyGrad = u.createLinearGradient(0, -s, 0, nearWheelY);
  bodyGrad.addColorStop(0, primaryBright);
  bodyGrad.addColorStop(0.45, primaryMid);
  bodyGrad.addColorStop(1, primaryDark);

  u.fillStyle = bodyGrad;
  u.strokeStyle = chassisDark;
  u.lineWidth = 2;
  u.beginPath();
  u.moveTo(-r + 4, nearWheelY);
  u.lineTo(rearWheelX - wheelRadius - 2.5, nearWheelY);
  // Flared rally arch
  u.lineTo(rearWheelX - wheelRadius - 1.5, nearWheelY - wheelRadius - 2.5);
  u.lineTo(rearWheelX + wheelRadius + 1.5, nearWheelY - wheelRadius - 2.5);
  u.lineTo(rearWheelX + wheelRadius + 2.5, nearWheelY);
  u.lineTo(frontWheelX - wheelRadius - 2.5, nearWheelY);
  u.lineTo(frontWheelX - wheelRadius - 1.5, nearWheelY - wheelRadius - 2.5);
  u.lineTo(frontWheelX + wheelRadius + 1.5, nearWheelY - wheelRadius - 2.5);
  u.lineTo(frontWheelX + wheelRadius + 2.5, nearWheelY);
  // Front chin
  u.lineTo(r - 2, nearWheelY);
  u.lineTo(r + 1, nearWheelY - 2);
  // Upright front bumper
  u.lineTo(r + 1.5, -2);
  u.lineTo(r + 0.5, -5);
  // Short muscular hood
  u.lineTo(6, -7);
  // Steep rally windshield
  u.lineTo(2, -s);
  // Flat roofline
  u.lineTo(-24, -s);
  // Integrated roof spoiler
  u.lineTo(-27, -s - 2);
  u.lineTo(-28, -s + 1);
  // Steep rear hatch
  u.lineTo(-r + 4, -1);
  u.lineTo(-r + 3, nearWheelY - 2);
  u.closePath();
  u.fill();
  u.stroke();

  // Front grille mesh
  u.fillStyle = "#0a0f1d";
  u.strokeStyle = "#1e293b";
  u.lineWidth = 1.2;
  u.beginPath();
  u.roundRect(r - 3, -4, 4.5, 7, 1);
  u.fill();
  u.stroke();

  u.strokeStyle = "#334155";
  u.lineWidth = 0.8;
  for (let gy = -3; gy <= 2; gy += 1.8) {
    u.beginPath();
    u.moveTo(r - 3, gy);
    u.lineTo(r + 1.5, gy);
    u.stroke();
  }

  // Dual rectangular rally headlights
  u.fillStyle = "#fef08a";
  u.shadowColor = "#fef08a";
  u.shadowBlur = 6;
  u.fillRect(r - 2, -4, 2.8, 2.2);
  u.fillRect(r - 2, -1, 2.8, 2.2);
  u.shadowBlur = 0;

  // Hatchback cabin & tinted windows
  u.fillStyle = "#070c14";
  u.strokeStyle = primaryDark;
  u.lineWidth = 1.2;
  u.beginPath();
  u.moveTo(4, -6.5);
  u.lineTo(1, -s + 1.5);
  u.lineTo(-10, -s + 1.5);
  u.lineTo(-10, -4.5);
  u.lineTo(4, -4.5);
  u.closePath();
  u.fill();
  u.stroke();

  u.beginPath();
  u.moveTo(-12, -s + 1.5);
  u.lineTo(-22, -s + 1.5);
  u.lineTo(-25, -2);
  u.lineTo(-12, -2);
  u.closePath();
  u.fill();
  u.stroke();

  // Reflections
  u.strokeStyle = "rgba(255, 255, 255, 0.6)";
  u.lineWidth = 1.2;
  u.beginPath();
  u.moveTo(2, -6.5);
  u.lineTo(0.5, -s + 2);
  u.moveTo(-13, -s + 2);
  u.lineTo(-21, -s + 2);
  u.stroke();

  // B-pillar
  u.fillStyle = "#0f172a";
  u.fillRect(-12, -s + 1, 2, s - 3);

  // Decals
  u.fillStyle = "rgba(255, 255, 255, 0.9)";
  u.fillRect(8, -6.5, r - 10, 1.8);
  u.fillStyle = accentColor;
  const carW = f?.width || (r * 2);
  u.fillRect(-r + 6, nearWheelY - 5, carW - 12, 1.6);

  // Twin exhaust
  u.fillStyle = metalSilver;
  u.strokeStyle = metalDark;
  u.lineWidth = 1;
  u.beginPath();
  u.arc(-r + 1, 3, 2, 0, Math.PI * 2);
  u.arc(-r + 1, -1, 2, 0, Math.PI * 2);
  u.fill();
  u.stroke();
}

/**
 * Detailed Dominus side-profile chassis renderer
 */
export function drawDominusBody(
  u: CanvasRenderingContext2D,
  f: any,
  r: number,
  s: number,
  nearWheelY: number,
  rearWheelX: number,
  frontWheelX: number,
  wheelRadius: number,
  primaryBright: string,
  primaryMid: string,
  primaryDark: string,
  accentColor: string,
  chassisDark: string,
  metalSilver: string,
  metalDark: string
) {
  // Dominus: Low, Long Classic American Muscle Car
  const bodyGrad = u.createLinearGradient(0, -s, 0, nearWheelY);
  bodyGrad.addColorStop(0, primaryBright);
  bodyGrad.addColorStop(0.4, primaryMid);
  bodyGrad.addColorStop(1, primaryDark);

  u.fillStyle = bodyGrad;
  u.strokeStyle = chassisDark;
  u.lineWidth = 2;
  u.beginPath();
  u.moveTo(-r + 4, nearWheelY);
  u.lineTo(rearWheelX - wheelRadius - 2.5, nearWheelY);
  u.quadraticCurveTo(rearWheelX, nearWheelY - wheelRadius - 3.5, rearWheelX + wheelRadius + 2.5, nearWheelY);
  u.lineTo(frontWheelX - wheelRadius - 2.5, nearWheelY);
  u.quadraticCurveTo(frontWheelX, nearWheelY - wheelRadius - 3.5, frontWheelX + wheelRadius + 2.5, nearWheelY);
  u.lineTo(r - 2, nearWheelY);
  u.lineTo(r + 1, nearWheelY - 2);
  u.lineTo(r + 2, 0);
  u.lineTo(r + 1, -3);
  u.lineTo(6, -4.5);
  u.lineTo(1, -s);
  u.lineTo(-16, -s);
  u.lineTo(-27, -2);
  u.lineTo(-r + 1, -s + 4);
  u.lineTo(-r, -1);
  u.lineTo(-r + 2, nearWheelY - 2);
  u.closePath();
  u.fill();
  u.stroke();

  // Supercharger blower scoop
  u.fillStyle = "#1e293b";
  u.strokeStyle = metalSilver;
  u.lineWidth = 1.3;
  u.beginPath();
  u.roundRect(14, -7.5, 11, 4, 1.5);
  u.fill();
  u.stroke();
  u.fillStyle = "#ef4444";
  u.beginPath();
  u.arc(24, -5.5, 1.6, 0, Math.PI * 2);
  u.fill();
  u.fillStyle = "#0f172a";
  u.fillRect(12.5, -6.5, 2, 3);

  // Muscle grille & quad headlights
  u.fillStyle = "#0a0a0f";
  u.fillRect(r - 3, -3, 4, 5);
  u.strokeStyle = metalSilver;
  u.lineWidth = 1;
  u.strokeRect(r - 3, -3, 4, 5);

  u.fillStyle = "#fef08a";
  u.shadowColor = "#fef08a";
  u.shadowBlur = 6;
  u.beginPath();
  u.arc(r - 0.5, -1.8, 1.6, 0, Math.PI * 2);
  u.arc(r - 0.5, 1.2, 1.6, 0, Math.PI * 2);
  u.fill();
  u.shadowBlur = 0;

  // Muscle fastback cabin
  u.fillStyle = "#070c14";
  u.strokeStyle = primaryDark;
  u.lineWidth = 1.2;
  u.beginPath();
  u.moveTo(4, -4);
  u.lineTo(0.5, -s + 1.5);
  u.lineTo(-14, -s + 1.5);
  u.lineTo(-24, -1.5);
  u.closePath();
  u.fill();
  u.stroke();

  u.strokeStyle = metalSilver;
  u.lineWidth = 1;
  u.beginPath();
  u.moveTo(-6, -s + 1.5);
  u.lineTo(-6, -3);
  u.stroke();

  u.strokeStyle = "rgba(255, 255, 255, 0.6)";
  u.lineWidth = 1.3;
  u.beginPath();
  u.moveTo(2, -4);
  u.lineTo(0, -s + 2);
  u.stroke();

  // Racing stripes
  u.fillStyle = "rgba(255, 255, 255, 0.9)";
  u.beginPath();
  u.moveTo(r - 1, -2);
  u.lineTo(13, -4);
  u.lineTo(13, -5.5);
  u.lineTo(r - 1, -3);
  u.closePath();
  u.fill();

  // Ducktail spoiler chrome
  u.strokeStyle = metalSilver;
  u.lineWidth = 1.4;
  u.beginPath();
  u.moveTo(-27, -2);
  u.lineTo(-r + 1, -s + 4);
  u.stroke();

  // Side-exit chrome exhaust
  u.fillStyle = metalSilver;
  u.strokeStyle = metalDark;
  u.lineWidth = 1;
  u.beginPath();
  u.roundRect(rearWheelX + wheelRadius + 3, nearWheelY - 4, 5, 2.5, 1);
  u.fill();
  u.stroke();
}

/**
 * Detailed Breakout side-profile chassis renderer
 */
export function drawBreakoutBody(
  u: CanvasRenderingContext2D,
  f: any,
  r: number,
  s: number,
  nearWheelY: number,
  rearWheelX: number,
  frontWheelX: number,
  wheelRadius: number,
  primaryBright: string,
  primaryMid: string,
  primaryDark: string,
  accentColor: string,
  chassisDark: string,
  metalSilver: string,
  metalDark: string
) {
  // Breakout: Wedge Prototype Supercar
  const bodyGrad = u.createLinearGradient(0, -s, 0, nearWheelY);
  bodyGrad.addColorStop(0, primaryBright);
  bodyGrad.addColorStop(0.4, primaryMid);
  bodyGrad.addColorStop(1, primaryDark);

  u.fillStyle = bodyGrad;
  u.strokeStyle = chassisDark;
  u.lineWidth = 2;
  u.beginPath();
  u.moveTo(-r + 4, nearWheelY);
  u.lineTo(rearWheelX - wheelRadius - 2.5, nearWheelY);
  u.quadraticCurveTo(rearWheelX, nearWheelY - wheelRadius - 3.5, rearWheelX + wheelRadius + 2.5, nearWheelY);
  u.lineTo(frontWheelX - wheelRadius - 2.5, nearWheelY);
  u.quadraticCurveTo(frontWheelX, nearWheelY - wheelRadius - 3.5, frontWheelX + wheelRadius + 2.5, nearWheelY);
  u.lineTo(r - 1, nearWheelY);
  u.lineTo(r + 3, nearWheelY - 2);
  u.lineTo(r + 3.5, 2);
  u.lineTo(r + 1, -1);
  u.lineTo(10, -4);
  u.lineTo(3, -s);
  u.lineTo(-12, -s);
  u.lineTo(-28, -2);
  u.lineTo(-r + 5, -2);
  u.lineTo(-r + 3, nearWheelY - 2);
  u.closePath();
  u.fill();
  u.stroke();

  // Canopy cockpit
  u.fillStyle = "#070c14";
  u.strokeStyle = primaryDark;
  u.lineWidth = 1.2;
  u.beginPath();
  u.moveTo(8, -3.5);
  u.lineTo(2, -s + 1.2);
  u.lineTo(-10, -s + 1.2);
  u.lineTo(-17, -2);
  u.closePath();
  u.fill();
  u.stroke();

  u.strokeStyle = "rgba(56, 189, 248, 0.7)";
  u.lineWidth = 1.3;
  u.beginPath();
  u.moveTo(6, -3.5);
  u.lineTo(1.5, -s + 1.8);
  u.stroke();

  // Deck louvers
  u.strokeStyle = "#0f172a";
  u.lineWidth = 1.4;
  for (let lx = -13; lx >= -23; lx -= 3.2) {
    u.beginPath();
    u.moveTo(lx, -s + 2.5);
    u.lineTo(lx - 2, -1);
    u.stroke();
  }

  // Pop-up headlights
  u.fillStyle = "#fef08a";
  u.shadowColor = "#fef08a";
  u.shadowBlur = 8;
  u.beginPath();
  u.moveTo(r - 1, 0);
  u.lineTo(r - 7, -2.5);
  u.lineTo(r - 6, -3.5);
  u.lineTo(r, -1);
  u.closePath();
  u.fill();
  u.shadowBlur = 0;

  // Elevated GT racing wing
  u.strokeStyle = chassisDark;
  u.lineWidth = 2.2;
  u.beginPath();
  u.moveTo(-24, -2);
  u.lineTo(-27, -s - 5);
  u.moveTo(-18, -2);
  u.lineTo(-21, -s - 5);
  u.stroke();

  const wingGrad = u.createLinearGradient(-34, -s - 6, -16, -s - 4);
  wingGrad.addColorStop(0, "#0f172a");
  wingGrad.addColorStop(0.5, primaryMid);
  wingGrad.addColorStop(1, primaryBright);

  u.fillStyle = wingGrad;
  u.strokeStyle = chassisDark;
  u.lineWidth = 1.3;
  u.beginPath();
  u.moveTo(-33, -s - 4);
  u.lineTo(-16, -s - 3);
  u.lineTo(-15, -s - 6.5);
  u.lineTo(-33, -s - 6.5);
  u.closePath();
  u.fill();
  u.stroke();

  u.fillStyle = primaryBright;
  u.fillRect(-34, -s - 7.5, 3, 5.5);
  u.strokeRect(-34, -s - 7.5, 3, 5.5);

  // Diffuser
  u.fillStyle = "#0f172a";
  for (let dx = -r + 5; dx <= -r + 13; dx += 3.5) {
    u.fillRect(dx, nearWheelY - 3, 1.8, 3.5);
  }

  // Accent pinstripe
  u.strokeStyle = accentColor;
  u.lineWidth = 1.4;
  u.beginPath();
  u.moveTo(r - 6, -2);
  u.lineTo(12, -3.8);
  u.lineTo(-10, nearWheelY - 5);
  u.stroke();
}

/**
 * Detailed Skyline GT-R side-profile chassis renderer
 */
export function drawSkylineBody(
  u: CanvasRenderingContext2D,
  f: any,
  r: number,
  s: number,
  nearWheelY: number,
  rearWheelX: number,
  frontWheelX: number,
  wheelRadius: number,
  primaryBright: string,
  primaryMid: string,
  primaryDark: string,
  accentColor: string,
  chassisDark: string,
  metalSilver: string,
  metalDark: string
) {
  // Nissan Skyline GT-R R34
  const bodyGrad = u.createLinearGradient(0, -s, 0, nearWheelY);
  bodyGrad.addColorStop(0, primaryBright);
  bodyGrad.addColorStop(0.4, primaryMid);
  bodyGrad.addColorStop(1, primaryDark);

  u.fillStyle = bodyGrad;
  u.strokeStyle = chassisDark;
  u.lineWidth = 2;
  u.beginPath();
  u.moveTo(-r + 4, nearWheelY);
  u.lineTo(rearWheelX - wheelRadius - 2.5, nearWheelY);
  u.quadraticCurveTo(rearWheelX, nearWheelY - wheelRadius - 3.5, rearWheelX + wheelRadius + 2.5, nearWheelY);
  u.lineTo(frontWheelX - wheelRadius - 2.5, nearWheelY);
  u.quadraticCurveTo(frontWheelX, nearWheelY - wheelRadius - 3.5, frontWheelX + wheelRadius + 2.5, nearWheelY);
  u.lineTo(r - 2, nearWheelY);
  u.lineTo(r + 1, nearWheelY - 2);
  u.lineTo(r + 2, 1);
  u.lineTo(r + 1, -3);
  u.lineTo(7, -5.5);
  u.lineTo(1, -s);
  u.lineTo(-15, -s + 0.8);
  u.lineTo(-27, -3);
  u.lineTo(-r + 5, -2.5);
  u.lineTo(-r + 3, nearWheelY - 2);
  u.closePath();
  u.fill();
  u.stroke();

  // Front intercooler mesh
  u.fillStyle = "#0f172a";
  u.fillRect(r - 4, 1, 5.5, 5);
  u.strokeStyle = metalSilver;
  u.lineWidth = 0.9;
  for (let ix = r - 3; ix <= r + 1; ix += 1.8) {
    u.beginPath();
    u.moveTo(ix, 1);
    u.lineTo(ix, 6);
    u.stroke();
  }

  // Angled Xenon headlights
  u.fillStyle = "#38bdf8";
  u.shadowColor = "#38bdf8";
  u.shadowBlur = 6;
  u.beginPath();
  u.roundRect(r - 2, -2.5, 3.5, 2.5, 1);
  u.fill();
  u.fillStyle = "#ffffff";
  u.beginPath();
  u.arc(r - 0.5, -1.2, 1, 0, Math.PI * 2);
  u.fill();
  u.shadowBlur = 0;

  // Coupe greenhouse
  u.fillStyle = "#070c14";
  u.strokeStyle = primaryDark;
  u.lineWidth = 1.2;
  u.beginPath();
  u.moveTo(5, -4.5);
  u.lineTo(0.5, -s + 1.5);
  u.lineTo(-13, -s + 2);
  u.lineTo(-24, -2.5);
  u.closePath();
  u.fill();
  u.stroke();

  u.strokeStyle = metalSilver;
  u.lineWidth = 1.2;
  u.beginPath();
  u.moveTo(-6, -s + 1.8);
  u.lineTo(-6, -3.5);
  u.stroke();

  u.strokeStyle = "rgba(255, 255, 255, 0.65)";
  u.lineWidth = 1.3;
  u.beginPath();
  u.moveTo(3, -4.5);
  u.lineTo(0, -s + 2);
  u.stroke();

  // Twin silver stripes
  u.fillStyle = "rgba(226, 232, 240, 0.9)";
  u.beginPath();
  u.moveTo(r - 1, -2);
  u.lineTo(6, -4.8);
  u.lineTo(5.5, -5.8);
  u.lineTo(r - 1, -3);
  u.closePath();
  u.fill();

  // GT-R wing
  u.strokeStyle = metalSilver;
  u.lineWidth = 2;
  u.beginPath();
  u.moveTo(-24, -3);
  u.lineTo(-26, -s - 4);
  u.moveTo(-19, -3);
  u.lineTo(-21, -s - 4);
  u.stroke();

  const wingGrad = u.createLinearGradient(-30, -s - 5, -18, -s - 3);
  wingGrad.addColorStop(0, "#0f172a");
  wingGrad.addColorStop(0.5, primaryMid);
  wingGrad.addColorStop(1, primaryBright);

  u.fillStyle = wingGrad;
  u.strokeStyle = chassisDark;
  u.lineWidth = 1.2;
  u.beginPath();
  u.moveTo(-29, -s - 3.5);
  u.lineTo(-18, -s - 2.5);
  u.lineTo(-17, -s - 5.5);
  u.lineTo(-29, -s - 5.5);
  u.closePath();
  u.fill();
  u.stroke();

  // Round tail lights (signature Skyline)
  u.fillStyle = "#ef4444";
  u.shadowColor = "#ef4444";
  u.shadowBlur = 6;
  u.beginPath();
  u.arc(-r + 4, -1, 1.8, 0, Math.PI * 2);
  u.arc(-r + 4, 3, 1.8, 0, Math.PI * 2);
  u.fill();
  u.shadowBlur = 0;

  // Titanium exhaust
  u.fillStyle = "#38bdf8";
  u.strokeStyle = metalSilver;
  u.lineWidth = 1;
  u.beginPath();
  u.roundRect(-r + 1, nearWheelY - 4, 4, 2.5, 1);
  u.fill();
  u.stroke();
}

/**
 * Detailed Merc side-profile chassis renderer
 */
export function drawMercBody(
  u: CanvasRenderingContext2D,
  f: any,
  r: number,
  s: number,
  nearWheelY: number,
  rearWheelX: number,
  frontWheelX: number,
  wheelRadius: number,
  primaryBright: string,
  primaryMid: string,
  primaryDark: string,
  accentColor: string,
  chassisDark: string,
  metalSilver: string,
  metalDark: string
) {
  // Merc: Heavy Custom Van
  const bodyGrad = u.createLinearGradient(0, -s, 0, nearWheelY);
  bodyGrad.addColorStop(0, primaryBright);
  bodyGrad.addColorStop(0.4, primaryMid);
  bodyGrad.addColorStop(1, primaryDark);

  u.fillStyle = bodyGrad;
  u.strokeStyle = chassisDark;
  u.lineWidth = 2;
  u.beginPath();
  u.moveTo(-r + 4, nearWheelY);
  u.lineTo(rearWheelX - wheelRadius - 2.5, nearWheelY);
  u.quadraticCurveTo(rearWheelX, nearWheelY - wheelRadius - 4, rearWheelX + wheelRadius + 2.5, nearWheelY);
  u.lineTo(frontWheelX - wheelRadius - 2.5, nearWheelY);
  u.quadraticCurveTo(frontWheelX, nearWheelY - wheelRadius - 4, frontWheelX + wheelRadius + 2.5, nearWheelY);
  u.lineTo(r - 2, nearWheelY);
  u.lineTo(r + 2, nearWheelY - 3);
  u.lineTo(r + 2.5, -4);
  u.lineTo(12, -9);
  u.lineTo(6, -s);
  u.lineTo(-27, -s);
  u.lineTo(-r + 4, nearWheelY - 2);
  u.closePath();
  u.fill();
  u.stroke();

  // Van grille & bull bar
  u.fillStyle = "#0f172a";
  u.fillRect(r - 3, -4, 5, 12);
  u.strokeStyle = metalSilver;
  u.lineWidth = 1.2;
  for (let gy = -2; gy <= 7; gy += 2.5) {
    u.beginPath();
    u.moveTo(r - 3, gy);
    u.lineTo(r + 2, gy);
    u.stroke();
  }
  u.strokeStyle = "#475569";
  u.lineWidth = 2.4;
  u.beginPath();
  u.moveTo(r + 1, nearWheelY - 1);
  u.lineTo(r + 3.5, 2);
  u.lineTo(r + 3.5, -3);
  u.lineTo(r + 1, -5);
  u.stroke();

  u.fillStyle = "#fef08a";
  u.shadowColor = "#fef08a";
  u.shadowBlur = 6;
  u.fillRect(r - 2, -3.5, 3, 2.5);
  u.fillRect(r - 2, 0, 3, 2.5);
  u.shadowBlur = 0;

  // Cab window & sun visor
  u.fillStyle = "#070c14";
  u.strokeStyle = primaryDark;
  u.lineWidth = 1.2;
  u.beginPath();
  u.moveTo(10, -8);
  u.lineTo(5, -s + 2);
  u.lineTo(-7, -s + 2);
  u.lineTo(-7, -6);
  u.closePath();
  u.fill();
  u.stroke();

  u.fillStyle = primaryBright;
  u.strokeStyle = chassisDark;
  u.lineWidth = 1;
  u.beginPath();
  u.moveTo(6, -s);
  u.lineTo(13, -s + 2.5);
  u.lineTo(12, -s + 3.8);
  u.lineTo(5, -s + 1.5);
  u.closePath();
  u.fill();
  u.stroke();

  // Roof rack
  u.strokeStyle = metalSilver;
  u.lineWidth = 1.8;
  u.beginPath();
  u.moveTo(4, -s - 2.5);
  u.lineTo(-25, -s - 2.5);
  u.stroke();
  u.lineWidth = 1.2;
  for (let rx = 3; rx >= -24; rx -= 9) {
    u.beginPath();
    u.moveTo(rx, -s);
    u.lineTo(rx, -s - 2.5);
    u.stroke();
  }

  // Retro flames
  u.fillStyle = accentColor;
  u.beginPath();
  u.moveTo(-r + 10, nearWheelY - 6);
  u.lineTo(-5, nearWheelY - 9);
  u.lineTo(8, nearWheelY - 7);
  u.lineTo(0, nearWheelY - 5);
  u.lineTo(-r + 10, nearWheelY - 5);
  u.closePath();
  u.fill();

  // Rear cargo door split
  u.strokeStyle = chassisDark;
  u.lineWidth = 1.4;
  u.beginPath();
  u.moveTo(-r + 4, -s + 2);
  u.lineTo(-r + 4, nearWheelY - 3);
  u.stroke();
}

/**
 * Universal dispatcher to draw any car model body
 */
export function drawCarModelBody(
  ctx: CanvasRenderingContext2D,
  model: string,
  r: number,
  s: number,
  nearWheelY: number,
  rearWheelX: number,
  frontWheelX: number,
  wheelRadius: number,
  primaryBright: string,
  primaryMid: string,
  primaryDark: string,
  accentColor: string,
  chassisDark: string = "#080c14",
  metalSilver: string = "#cbd5e1",
  metalDark: string = "#334155"
) {
  const cleanModel = (model || "octane").toLowerCase();
  if (cleanModel.includes("fennec")) {
    drawFennecBody(ctx, null, r, s, nearWheelY, rearWheelX, frontWheelX, wheelRadius, primaryBright, primaryMid, primaryDark, accentColor, chassisDark, metalSilver, metalDark);
  } else if (cleanModel.includes("dominus")) {
    drawDominusBody(ctx, null, r, s, nearWheelY, rearWheelX, frontWheelX, wheelRadius, primaryBright, primaryMid, primaryDark, accentColor, chassisDark, metalSilver, metalDark);
  } else if (cleanModel.includes("breakout")) {
    drawBreakoutBody(ctx, null, r, s, nearWheelY, rearWheelX, frontWheelX, wheelRadius, primaryBright, primaryMid, primaryDark, accentColor, chassisDark, metalSilver, metalDark);
  } else if (cleanModel.includes("skyline")) {
    drawSkylineBody(ctx, null, r, s, nearWheelY, rearWheelX, frontWheelX, wheelRadius, primaryBright, primaryMid, primaryDark, accentColor, chassisDark, metalSilver, metalDark);
  } else if (cleanModel.includes("merc")) {
    drawMercBody(ctx, null, r, s, nearWheelY, rearWheelX, frontWheelX, wheelRadius, primaryBright, primaryMid, primaryDark, accentColor, chassisDark, metalSilver, metalDark);
  } else {
    drawOctaneBody(ctx, null, r, s, nearWheelY, rearWheelX, frontWheelX, wheelRadius, primaryBright, primaryMid, primaryDark, accentColor, chassisDark, metalSilver, metalDark);
  }
}

