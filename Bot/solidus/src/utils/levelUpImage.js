import { createCanvas, loadImage } from '@napi-rs/canvas';
import {
  drawOrangeBackground,
  drawOrangeBorder,
  fillRoundRect,
  roundedRectPath,
  ORANGE,
  truncateText,
} from './canvasTheme.js';
import { LEVEL_MILESTONE } from '../constants.js';

import {
  resolveMemberDisplayName,
  hasServerNickname,
  resolveMemberHandle,
} from './memberName.js';

/** @typedef {'banner' | 'center' | 'split' | 'compact'} LevelUpLayout */

/**
 * @param {number} level
 */
export function isLevelMilestoneLevel(level) {
  return level >= LEVEL_MILESTONE && level % LEVEL_MILESTONE === 0;
}

export const LEVEL_UP_COMPACT_SIZE = { width: 360, height: 128 };
export const LEVEL_UP_CENTER_SIZE = { width: 440, height: 420 };

/**
 * @param {{ nickname?: string | null, user?: { username?: string, displayAvatarURL?: (opts?: object) => string }, username?: string }} member
 * @param {{ avatarUrl?: string }} opts
 */
function resolveMember(member, opts = {}) {
  return {
    displayName: resolveMemberDisplayName(member),
    showHandle: hasServerNickname(member),
    handle: resolveMemberHandle(member),
    avatarUrl:
      opts.avatarUrl ??
      (member.user?.displayAvatarURL
        ? member.user.displayAvatarURL({ extension: 'png', size: 256 })
        : 'https://cdn.discordapp.com/embed/avatars/3.png'),
  };
}

/**
 * @param {import('@napi-rs/canvas').SKRSContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} size
 * @param {string} avatarUrl
 * @param {number} [borderWidth]
 */
async function drawAvatar(ctx, x, y, size, avatarUrl, borderWidth = 3) {
  try {
    const avatar = await loadImage(avatarUrl);
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, x, y, size, size);
    ctx.restore();

    ctx.strokeStyle = ORANGE.accent;
    ctx.lineWidth = borderWidth;
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.stroke();
  } catch {
    /* */
  }
}

/**
 * @param {import('@napi-rs/canvas').SKRSContext2D} ctx
 * @param {number} cx
 * @param {number} cy
 * @param {number} r
 * @param {number} level
 */
function drawLevelBadge(ctx, cx, cy, r, level) {
  ctx.save();
  const glow = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 1.35);
  glow.addColorStop(0, 'rgba(255, 140, 50, 0.45)');
  glow.addColorStop(1, 'rgba(255, 140, 50, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.35, 0, Math.PI * 2);
  ctx.fill();

  const ring = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  ring.addColorStop(0, ORANGE.borderStart);
  ring.addColorStop(0.5, ORANGE.borderMid);
  ring.addColorStop(1, ORANGE.borderEnd);

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.fill();
  ctx.strokeStyle = ring;
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = ORANGE.text;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${Math.max(9, Math.floor(r * 0.2))}px "Segoe UI", Arial, sans-serif`;
  ctx.fillText('LYGIS', cx, cy - r * 0.42);

  ctx.font = `bold ${level >= 10 ? r * 0.75 : r * 0.85}px "Segoe UI", Arial, sans-serif`;
  ctx.fillStyle = ORANGE.borderStart;
  ctx.fillText(String(level), cx, cy + r * 0.12);
  ctx.restore();
}

/**
 * Horizontal: avatar | text | badge
 */
async function buildBannerLayout(member, newLevel, opts) {
  const WIDTH = 800;
  const HEIGHT = 200;
  const PAD = 28;
  const AVATAR_SIZE = 96;

  const { displayName, showHandle, handle, avatarUrl } = resolveMember(member, opts);
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  drawOrangeBackground(ctx, WIDTH, HEIGHT, 14, 3);

  const avatarX = PAD;
  const avatarY = (HEIGHT - AVATAR_SIZE) / 2;
  await drawAvatar(ctx, avatarX, avatarY, AVATAR_SIZE, avatarUrl);

  const badgeCx = WIDTH - PAD - 52;
  const textX = avatarX + AVATAR_SIZE + 22;
  const textMaxW = badgeCx - 52 - textX;

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = ORANGE.borderStart;
  ctx.font = 'bold 13px "Segoe UI", Arial, sans-serif';
  ctx.fillText('⬆  LYGIS PASIEKTAS', textX, 58);

  ctx.fillStyle = ORANGE.text;
  ctx.font = 'bold 28px "Segoe UI", Arial, sans-serif';
  ctx.fillText(
    truncateText(displayName, textMaxW, ctx, 'bold 28px "Segoe UI", Arial, sans-serif'),
    textX,
    98,
  );

  ctx.fillStyle = ORANGE.textMuted;
  ctx.font = '18px "Segoe UI", Arial, sans-serif';
  if (showHandle) ctx.fillText(`@${handle}`, textX, 126);

  ctx.fillStyle = ORANGE.text;
  ctx.font = '20px "Segoe UI", Arial, sans-serif';
  ctx.fillText(`Pasiekei ${newLevel} lygį — sveikiname! 🎉`, textX, showHandle ? 162 : 140, textMaxW + 40);

  drawLevelBadge(ctx, badgeCx, HEIGHT / 2, 52, newLevel);

  drawOrangeBorder(ctx, WIDTH, HEIGHT, 14, 3);
  return canvas.toBuffer('image/png');
}

/**
 * Kompaktinis banneris — kiekvienam lygiui
 */
async function buildCompactLayout(member, newLevel, opts) {
  const WIDTH = LEVEL_UP_COMPACT_SIZE.width;
  const HEIGHT = LEVEL_UP_COMPACT_SIZE.height;
  const PAD = 14;
  const AVATAR_SIZE = 56;
  const BADGE_R = 30;

  const { displayName, showHandle, handle, avatarUrl } = resolveMember(member, opts);
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  drawOrangeBackground(ctx, WIDTH, HEIGHT, 12, 3);

  const avatarX = PAD;
  const avatarY = (HEIGHT - AVATAR_SIZE) / 2;
  await drawAvatar(ctx, avatarX, avatarY, AVATAR_SIZE, avatarUrl, 3);

  const badgeCx = WIDTH - PAD - BADGE_R;
  const textX = avatarX + AVATAR_SIZE + 12;
  const textMaxW = badgeCx - BADGE_R - 8 - textX;

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = ORANGE.borderStart;
  ctx.font = 'bold 10px "Segoe UI", Arial, sans-serif';
  ctx.fillText('⬆  LYGIS PASIEKTAS', textX, 42);

  ctx.fillStyle = ORANGE.text;
  ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
  ctx.fillText(
    truncateText(displayName, textMaxW, ctx, 'bold 20px "Segoe UI", Arial, sans-serif'),
    textX,
    68,
  );

  ctx.fillStyle = ORANGE.textMuted;
  ctx.font = '13px "Segoe UI", Arial, sans-serif';
  if (showHandle) {
    ctx.fillText(`@${handle}`, textX, 86);
  }

  ctx.fillStyle = ORANGE.text;
  ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
  ctx.fillText(`Lygis ${newLevel}`, textX, showHandle ? 108 : 94);

  drawLevelBadge(ctx, badgeCx, HEIGHT / 2, BADGE_R, newLevel);

  drawOrangeBorder(ctx, WIDTH, HEIGHT, 12, 3);
  return canvas.toBuffer('image/png');
}

/**
 * Portrait: avatar → vardas → lygis pasiektas → didelis lygis
 */
async function buildCenterLayout(member, newLevel, opts) {
  const WIDTH = LEVEL_UP_CENTER_SIZE.width;
  const HEIGHT = LEVEL_UP_CENTER_SIZE.height;
  const PAD = 24;

  const { displayName, showHandle, handle, avatarUrl } = resolveMember(member, opts);
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  drawOrangeBackground(ctx, WIDTH, HEIGHT, 18, 3);

  const avatarSize = 88;
  const avatarTop = PAD + 8;
  const avatarX = (WIDTH - avatarSize) / 2;
  await drawAvatar(ctx, avatarX, avatarTop, avatarSize, avatarUrl, 4);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  let textY = avatarTop + avatarSize + 20;

  ctx.fillStyle = ORANGE.text;
  ctx.font = 'bold 26px "Segoe UI", Arial, sans-serif';
  ctx.fillText(
    truncateText(displayName, WIDTH - PAD * 2, ctx, 'bold 26px "Segoe UI", Arial, sans-serif'),
    WIDTH / 2,
    textY,
  );
  textY += 26;

  if (showHandle) {
    ctx.fillStyle = ORANGE.textMuted;
    ctx.font = '16px "Segoe UI", Arial, sans-serif';
    ctx.fillText(`@${handle}`, WIDTH / 2, textY);
    textY += 22;
  }

  ctx.fillStyle = ORANGE.borderStart;
  ctx.font = 'bold 12px "Segoe UI", Arial, sans-serif';
  ctx.fillText('LYGIS PASIEKTAS', WIDTH / 2, textY + 10);
  textY += 34;

  const levelY = textY + (HEIGHT - textY - PAD) / 2;
  ctx.save();
  const bigGlow = ctx.createRadialGradient(WIDTH / 2, levelY, 10, WIDTH / 2, levelY, 120);
  bigGlow.addColorStop(0, 'rgba(255, 140, 50, 0.35)');
  bigGlow.addColorStop(1, 'rgba(255, 140, 50, 0)');
  ctx.fillStyle = bigGlow;
  ctx.fillRect(0, levelY - 120, WIDTH, 240);

  ctx.font = `bold ${newLevel >= 10 ? 108 : 128}px "Segoe UI", Arial, sans-serif`;
  const numGrad = ctx.createLinearGradient(WIDTH / 2 - 60, levelY - 60, WIDTH / 2 + 60, levelY + 60);
  numGrad.addColorStop(0, ORANGE.borderStart);
  numGrad.addColorStop(0.5, ORANGE.borderMid);
  numGrad.addColorStop(1, ORANGE.borderEnd);
  ctx.fillStyle = numGrad;
  ctx.textBaseline = 'middle';
  ctx.fillText(String(newLevel), WIDTH / 2, levelY);
  ctx.restore();

  drawOrangeBorder(ctx, WIDTH, HEIGHT, 18, 3);
  return canvas.toBuffer('image/png');
}

/**
 * Split: kairė — info, dešinė — didelis lygis ant orange panel
 */
async function buildSplitLayout(member, newLevel, opts) {
  const WIDTH = 820;
  const HEIGHT = 240;
  const PAD = 22;
  const SPLIT = 0.58;

  const { displayName, showHandle, handle, avatarUrl } = resolveMember(member, opts);
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  drawOrangeBackground(ctx, WIDTH, HEIGHT, 14, 3);

  const leftW = Math.floor(WIDTH * SPLIT);
  const rightX = leftW;

  ctx.save();
  roundedRectPath(ctx, PAD, PAD, leftW - PAD - 8, HEIGHT - PAD * 2, 12);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
  ctx.fill();
  ctx.restore();

  const AVATAR = 80;
  const avatarX = PAD + 20;
  const avatarY = (HEIGHT - AVATAR) / 2;
  await drawAvatar(ctx, avatarX, avatarY, AVATAR, avatarUrl);

  const textX = avatarX + AVATAR + 18;
  const textMaxW = leftW - textX - PAD;

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = ORANGE.borderStart;
  ctx.font = 'bold 11px "Segoe UI", Arial, sans-serif';
  ctx.fillText('SVEIKINAME', textX, avatarY + 18);

  ctx.fillStyle = ORANGE.text;
  ctx.font = 'bold 30px "Segoe UI", Arial, sans-serif';
  ctx.fillText(
    truncateText(displayName, textMaxW, ctx, 'bold 30px "Segoe UI", Arial, sans-serif'),
    textX,
    avatarY + 52,
  );

  ctx.fillStyle = ORANGE.textMuted;
  ctx.font = '16px "Segoe UI", Arial, sans-serif';
  if (showHandle) ctx.fillText(`@${handle}`, textX, avatarY + 78);

  ctx.fillStyle = 'rgba(255, 180, 120, 0.95)';
  ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
  ctx.fillText(`▲  Lygis ${newLevel}`, textX, avatarY + (showHandle ? AVATAR - 6 : 102));

  ctx.save();
  roundedRectPath(ctx, rightX + 8, PAD, WIDTH - rightX - PAD - 8, HEIGHT - PAD * 2, 12);
  ctx.clip();

  const panelGrad = ctx.createLinearGradient(rightX, 0, WIDTH, HEIGHT);
  panelGrad.addColorStop(0, '#c44a12');
  panelGrad.addColorStop(0.45, ORANGE.borderMid);
  panelGrad.addColorStop(1, ORANGE.borderStart);
  ctx.fillStyle = panelGrad;
  ctx.fillRect(rightX, PAD, WIDTH - rightX, HEIGHT - PAD * 2);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 1;
  for (let i = rightX - 40; i < WIDTH + 80; i += 24) {
    ctx.beginPath();
    ctx.moveTo(i, PAD);
    ctx.lineTo(i + 80, HEIGHT - PAD);
    ctx.stroke();
  }
  ctx.restore();

  const panelCx = rightX + (WIDTH - rightX) / 2 + 4;
  const panelCy = HEIGHT / 2;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
  ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
  ctx.fillText('NAUJAS LYGIS', panelCx, panelCy - 56);

  ctx.font = `bold ${newLevel >= 10 ? 96 : 112}px "Segoe UI", Arial, sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 12;
  ctx.fillText(String(newLevel), panelCx, panelCy + 12);
  ctx.shadowBlur = 0;

  drawOrangeBorder(ctx, WIDTH, HEIGHT, 14, 3);
  return canvas.toBuffer('image/png');
}

/**
 * @param {{ displayName?: string, username?: string, user?: { username?: string, displayAvatarURL?: (opts?: object) => string } }} member
 * @param {number} newLevel
 * @param {{ avatarUrl?: string, layout?: LevelUpLayout }} [opts]
 */
export async function buildLevelUpImage(member, newLevel, opts = {}) {
  const layout = opts.layout ?? (isLevelMilestoneLevel(newLevel) ? 'center' : 'compact');

  switch (layout) {
    case 'center':
      return buildCenterLayout(member, newLevel, opts);
    case 'compact':
      return buildCompactLayout(member, newLevel, opts);
    case 'split':
      return buildSplitLayout(member, newLevel, opts);
    default:
      return buildBannerLayout(member, newLevel, opts);
  }
}

export const LEVEL_UP_LAYOUTS = /** @type {const} */ (['banner', 'center', 'split', 'compact']);

export const LEVEL_UP_LAYOUT_LABELS = {
  banner: 'Horizontalus (banner)',
  center: 'Centruotas (portretas)',
  split: 'Padalintas (split)',
  compact: `Kompaktinis (${LEVEL_UP_COMPACT_SIZE.width}×${LEVEL_UP_COMPACT_SIZE.height})`,
};
