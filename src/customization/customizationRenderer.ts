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
  spinAngle: number = 0
) {
  const style = wheelItem?.visualData?.wheelStyle || "oem";
  const glowHex = wheelItem?.visualData?.glowHex;

  ctx.save();
  ctx.translate(wx, wy);

  // Outer tire tread
  ctx.fillStyle = "#090d16";
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  // Outer tire edge ring
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Glow if exotic / black market
  if (glowHex) {
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
