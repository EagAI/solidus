import { createCanvas, loadImage } from '@napi-rs/canvas';

const WIDTH = 700;
const HEIGHT = 150;
const AVATAR_SIZE = 88;
const PADDING = 28;
const CORNER_RADIUS = 12;
const BORDER_WIDTH = 3;

/**
 * @param {import('@napi-rs/canvas').SKRSContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {number} r
 */
function roundedRectPath(ctx, x, y, w, h, r) {
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
 */
function drawBackground(ctx) {
  const inset = BORDER_WIDTH / 2;
  const w = WIDTH - BORDER_WIDTH;
  const h = HEIGHT - BORDER_WIDTH;

  roundedRectPath(ctx, inset, inset, w, h, CORNER_RADIUS);
  ctx.save();
  ctx.clip();

  const baseGradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  baseGradient.addColorStop(0, '#1a1614');
  baseGradient.addColorStop(0.45, '#221e1a');
  baseGradient.addColorStop(1, '#2a221c');
  ctx.fillStyle = baseGradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const glowRight = ctx.createRadialGradient(WIDTH - 40, HEIGHT / 2, 8, WIDTH - 40, HEIGHT / 2, 220);
  glowRight.addColorStop(0, 'rgba(255, 140, 50, 0.38)');
  glowRight.addColorStop(0.55, 'rgba(255, 120, 40, 0.1)');
  glowRight.addColorStop(1, 'rgba(255, 120, 40, 0)');
  ctx.fillStyle = glowRight;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const glowLeft = ctx.createRadialGradient(60, HEIGHT / 2, 4, 60, HEIGHT / 2, 140);
  glowLeft.addColorStop(0, 'rgba(255, 180, 90, 0.22)');
  glowLeft.addColorStop(1, 'rgba(255, 180, 90, 0)');
  ctx.fillStyle = glowLeft;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  for (let i = -HEIGHT; i < WIDTH + HEIGHT; i += 28) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + HEIGHT, HEIGHT);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * @param {import('@napi-rs/canvas').SKRSContext2D} ctx
 */
function drawBorder(ctx) {
  const inset = BORDER_WIDTH / 2;
  const w = WIDTH - BORDER_WIDTH;
  const h = HEIGHT - BORDER_WIDTH;

  roundedRectPath(ctx, inset + 2, inset + 2, w - 4, h - 4, CORNER_RADIUS - 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 1;
  ctx.stroke();

  const borderGradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  borderGradient.addColorStop(0, '#ffb347');
  borderGradient.addColorStop(0.5, '#f26522');
  borderGradient.addColorStop(1, '#d9480f');

  roundedRectPath(ctx, inset, inset, w, h, CORNER_RADIUS);
  ctx.strokeStyle = borderGradient;
  ctx.lineWidth = BORDER_WIDTH;
  ctx.stroke();
}

/**
 * @param {string} text
 * @param {number} maxWidth
 * @param {import('@napi-rs/canvas').SKRSContext2D} ctx
 * @param {string} font
 */
function truncateText(text, maxWidth, ctx, font) {
  ctx.font = font;
  if (ctx.measureText(text).width <= maxWidth) return text;
  let out = text;
  while (out.length > 1 && ctx.measureText(`${out}…`).width > maxWidth) {
    out = out.slice(0, -1);
  }
  return `${out}…`;
}

/**
 * @param {import('discord.js').GuildMember} member
 * @returns {Promise<Buffer>}
 */
export async function buildWelcomeBanner(member) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  drawBackground(ctx);

  const avatarUrl = member.user.displayAvatarURL({ extension: 'png', size: 256 });
  let avatar;
  try {
    avatar = await loadImage(avatarUrl);
  } catch {
    avatar = null;
  }

  const avatarX = PADDING;
  const avatarY = (HEIGHT - AVATAR_SIZE) / 2;

  if (avatar) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(
      avatarX + AVATAR_SIZE / 2,
      avatarY + AVATAR_SIZE / 2,
      AVATAR_SIZE / 2,
      0,
      Math.PI * 2,
    );
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, avatarX, avatarY, AVATAR_SIZE, AVATAR_SIZE);
    ctx.restore();

    ctx.strokeStyle = '#f26522';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(
      avatarX + AVATAR_SIZE / 2,
      avatarY + AVATAR_SIZE / 2,
      AVATAR_SIZE / 2,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }

  const nameFont = 'bold 26px "Segoe UI", Arial, sans-serif';
  const greetFont = '22px "Segoe UI", Arial, sans-serif';
  const serverFont = 'bold 24px "Segoe UI", Arial, sans-serif';

  const serverNameRaw = member.guild.name;
  const serverName = truncateText(serverNameRaw, WIDTH * 0.45, ctx, serverFont);

  ctx.font = greetFont;
  const greetWidth = ctx.measureText('Sveiki atvykę į').width;
  ctx.font = serverFont;
  const serverWidth = ctx.measureText(serverName).width;
  const rightBlockWidth = Math.max(greetWidth, serverWidth);

  const rightX = WIDTH - PADDING;
  const nameX = avatarX + AVATAR_SIZE + 16;
  const nameMaxWidth = rightX - nameX - rightBlockWidth - 24;
  const displayName = truncateText(
    member.displayName || member.user.username,
    Math.max(nameMaxWidth, 80),
    ctx,
    nameFont,
  );

  ctx.fillStyle = '#ffffff';
  ctx.font = nameFont;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(displayName, nameX, HEIGHT / 2);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#dbdee1';
  ctx.font = greetFont;
  ctx.textBaseline = 'top';
  ctx.fillText('Sveiki atvykę į', rightX, 46);

  ctx.fillStyle = '#ffffff';
  ctx.font = serverFont;
  ctx.fillText(serverName, rightX, 78);

  ctx.textAlign = 'left';

  drawBorder(ctx);

  return canvas.toBuffer('image/png');
}
