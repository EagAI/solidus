/** Orange welcome-style canvas theme shared by XP images. */

export const ORANGE = {
  borderStart: '#ffb347',
  borderMid: '#f26522',
  borderEnd: '#d9480f',
  accent: '#f26522',
  accentGlow: 'rgba(255, 140, 50, 0.38)',
  bgStart: '#1a1614',
  bgMid: '#221e1a',
  bgEnd: '#2a221c',
  text: '#ffffff',
  textMuted: '#dbdee1',
  textDim: 'rgba(255,255,255,0.52)',
  rowAlt: 'rgba(255, 255, 255, 0.04)',
  top1: '#ffd447',
  top2: '#c8d5e8',
  top3: '#e8a065',
};

export const FONT_BOLD = 'bold 26px "Segoe UI", Arial, sans-serif';
export const FONT_REG = '22px "Segoe UI", Arial, sans-serif';

/**
 * @param {import('@napi-rs/canvas').SKRSContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {number} r
 */
export function roundedRectPath(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/**
 * @param {import('@napi-rs/canvas').SKRSContext2D} ctx
 * @param {number} width
 * @param {number} height
 * @param {number} [cornerRadius]
 * @param {number} [borderWidth]
 * @param {import('@napi-rs/canvas').Image} [patternImage] — vietoj diagonalinių linijų
 */
export function drawOrangeBackground(
  ctx,
  width,
  height,
  cornerRadius = 12,
  borderWidth = 3,
  patternImage = null,
) {
  const inset = borderWidth / 2;
  const w = width - borderWidth;
  const h = height - borderWidth;

  roundedRectPath(ctx, inset, inset, w, h, cornerRadius);
  ctx.save();
  ctx.clip();

  const baseGradient = ctx.createLinearGradient(0, 0, width, height);
  baseGradient.addColorStop(0, ORANGE.bgStart);
  baseGradient.addColorStop(0.45, ORANGE.bgMid);
  baseGradient.addColorStop(1, ORANGE.bgEnd);
  ctx.fillStyle = baseGradient;
  ctx.fillRect(0, 0, width, height);

  const glowRight = ctx.createRadialGradient(
    width - 40,
    height / 2,
    8,
    width - 40,
    height / 2,
    Math.max(width, height) * 0.55,
  );
  glowRight.addColorStop(0, ORANGE.accentGlow);
  glowRight.addColorStop(0.55, 'rgba(255, 120, 40, 0.1)');
  glowRight.addColorStop(1, 'rgba(255, 120, 40, 0)');
  ctx.fillStyle = glowRight;
  ctx.fillRect(0, 0, width, height);

  const glowLeft = ctx.createRadialGradient(60, height / 2, 4, 60, height / 2, 140);
  glowLeft.addColorStop(0, 'rgba(255, 180, 90, 0.22)');
  glowLeft.addColorStop(1, 'rgba(255, 180, 90, 0)');
  ctx.fillStyle = glowLeft;
  ctx.fillRect(0, 0, width, height);

  if (patternImage) {
    ctx.globalAlpha = 0.55;
    const scale = Math.max(width / patternImage.width, height / patternImage.height);
    const drawW = patternImage.width * scale;
    const drawH = patternImage.height * scale;
    const drawX = (width - drawW) / 2;
    const drawY = (height - drawH) / 2;
    ctx.drawImage(patternImage, drawX, drawY, drawW, drawH);
    ctx.globalAlpha = 1;
  } else {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let i = -height; i < width + height; i += 28) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + height, height);
      ctx.stroke();
    }
  }

  ctx.restore();
}

/**
 * @param {import('@napi-rs/canvas').SKRSContext2D} ctx
 * @param {number} width
 * @param {number} height
 * @param {number} [cornerRadius]
 * @param {number} [borderWidth]
 */
export function drawOrangeBorder(ctx, width, height, cornerRadius = 12, borderWidth = 3) {
  const inset = borderWidth / 2;
  const w = width - borderWidth;
  const h = height - borderWidth;

  roundedRectPath(ctx, inset + 2, inset + 2, w - 4, h - 4, cornerRadius - 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 1;
  ctx.stroke();

  const borderGradient = ctx.createLinearGradient(0, 0, width, height);
  borderGradient.addColorStop(0, ORANGE.borderStart);
  borderGradient.addColorStop(0.5, ORANGE.borderMid);
  borderGradient.addColorStop(1, ORANGE.borderEnd);

  roundedRectPath(ctx, inset, inset, w, h, cornerRadius);
  ctx.strokeStyle = borderGradient;
  ctx.lineWidth = borderWidth;
  ctx.stroke();
}

/**
 * @param {string} text
 * @param {number} maxWidth
 * @param {import('@napi-rs/canvas').SKRSContext2D} ctx
 * @param {string} font
 */
export function truncateText(text, maxWidth, ctx, font) {
  ctx.font = font;
  if (ctx.measureText(text).width <= maxWidth) return text;
  let out = text;
  while (out.length > 1 && ctx.measureText(`${out}…`).width > maxWidth) {
    out = out.slice(0, -1);
  }
  return `${out}…`;
}

/**
 * @param {import('@napi-rs/canvas').SKRSContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {number} r
 */
export function fillRoundRect(ctx, x, y, w, h, r) {
  roundedRectPath(ctx, x, y, w, h, r);
  ctx.fill();
}
