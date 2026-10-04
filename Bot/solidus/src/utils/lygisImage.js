import { createCanvas, loadImage } from '@napi-rs/canvas';
import { getProgressInfo } from '../services/xp.js';
import { getUserRecord } from '../utils/xpStore.js';
import {
  resolveMemberDisplayName,
  hasServerNickname,
  resolveMemberHandle,
} from './memberName.js';
import {
  drawOrangeBackground,
  drawOrangeBorder,
  fillRoundRect,
  ORANGE,
  truncateText,
} from './canvasTheme.js';
import { getLygisBackground } from './lygisBackgroundStore.js';
import { loadModules } from '../modules/settings.js';

const WIDTH = 900;
const HEIGHT = 280;
const PAD = 28;

/**
 * @param {import('discord.js').GuildMember} member
 * @param {{ xp?: number, totalMessages?: number }} [override]
 */
export async function buildLygisImage(member, override = {}) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  const guildBg = loadModules().levels.backgroundUrl;
  const customBg = getLygisBackground(member.id) ?? (guildBg ? { url: guildBg } : null);
  let patternImage = null;

  if (customBg?.url) {
    try {
      patternImage = await loadImage(customBg.url);
    } catch {
      /* fallback to default lines */
    }
  }

  drawOrangeBackground(ctx, WIDTH, HEIGHT, 14, 3, patternImage);

  const cardX = PAD;
  const cardY = PAD;
  const cardW = WIDTH - PAD * 2;
  const cardH = HEIGHT - PAD * 2;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  fillRoundRect(ctx, cardX, cardY, cardW, cardH, 16);

  const avatarSize = 120;
  const avatarX = cardX + 24;
  const avatarY = cardY + (cardH - avatarSize) / 2;

  const avatarUrl = member.user?.displayAvatarURL
    ? member.user.displayAvatarURL({ extension: 'png', size: 256 })
    : member.displayAvatarURL?.({ extension: 'png', size: 256 })
      ?? 'https://cdn.discordapp.com/embed/avatars/0.png';

  try {
    const avatar = await loadImage(avatarUrl);
    ctx.save();
    ctx.beginPath();
    ctx.arc(
      avatarX + avatarSize / 2,
      avatarY + avatarSize / 2,
      avatarSize / 2,
      0,
      Math.PI * 2,
    );
    ctx.clip();
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();

    ctx.strokeStyle = ORANGE.accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(
      avatarX + avatarSize / 2,
      avatarY + avatarSize / 2,
      avatarSize / 2,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  } catch {
    /* */
  }

  const contentX = avatarX + avatarSize + 28;
  const contentW = cardX + cardW - contentX - 24;

  const stored = getUserRecord(member.id);
  const xp = override.xp ?? stored.xp;
  const info = getProgressInfo(xp);

  const displayName = resolveMemberDisplayName(member);
  const showHandle = hasServerNickname(member);
  const handle = resolveMemberHandle(member);

  ctx.textAlign = 'left';
  ctx.fillStyle = ORANGE.text;
  ctx.font = 'bold 30px "Segoe UI", Arial, sans-serif';
  ctx.fillText(
    truncateText(displayName, contentW, ctx, 'bold 30px "Segoe UI", Arial, sans-serif'),
    contentX,
    cardY + 52,
  );

  ctx.fillStyle = ORANGE.textMuted;
  ctx.font = '18px "Segoe UI", Arial, sans-serif';
  if (showHandle) ctx.fillText(`@${handle}`, contentX, cardY + 82);

  const statY = cardY + (showHandle ? 118 : 100);
  const colW = contentW / 3;

  function drawStat(x, label, value) {
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '13px "Segoe UI", Arial, sans-serif';
    ctx.fillText(label, x, statY);
    ctx.fillStyle = ORANGE.text;
    ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
    ctx.fillText(value, x, statY + 28);
  }

  drawStat(contentX, 'Lygis', String(info.level));
  drawStat(contentX + colW, 'XP', Number(xp).toLocaleString('lt-LT'));
  drawStat(contentX + colW * 2, 'Kitas lygis', String(info.nextLevel));

  const barY = cardY + cardH - 44;
  const barH = 16;
  const barW = contentW;
  const barR = barH / 2;
  const pct = info.needed > 0 ? info.current / info.needed : 0;

  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  fillRoundRect(ctx, contentX, barY, barW, barH, barR);

  const fillW = Math.max(barR * 2, barW * pct);
  const barGrad = ctx.createLinearGradient(contentX, barY, contentX + fillW, barY);
  barGrad.addColorStop(0, ORANGE.borderStart);
  barGrad.addColorStop(1, ORANGE.borderMid);
  ctx.fillStyle = barGrad;
  fillRoundRect(ctx, contentX, barY, fillW, barH, barR);

  ctx.fillStyle = ORANGE.textMuted;
  ctx.font = '13px "Segoe UI", Arial, sans-serif';
  ctx.fillText('Progresas', contentX, barY - 8);

  ctx.textAlign = 'right';
  ctx.fillStyle = ORANGE.text;
  ctx.fillText(
    `${info.current} / ${info.needed} XP iki ${info.nextLevel} lvl (${info.percent}%)`,
    contentX + barW,
    barY - 8,
  );
  ctx.textAlign = 'left';

  drawOrangeBorder(ctx, WIDTH, HEIGHT, 14, 3);
  return canvas.toBuffer('image/png');
}
