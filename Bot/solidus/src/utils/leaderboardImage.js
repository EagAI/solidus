import { createCanvas, loadImage } from '@napi-rs/canvas';
import { getLevelFromXp } from '../services/xp.js';
import { resolveMemberDisplayName } from './memberName.js';
import {
  drawOrangeBackground,
  drawOrangeBorder,
  fillRoundRect,
  ORANGE,
  truncateText,
} from './canvasTheme.js';
import { loadModules } from '../modules/settings.js';

const WIDTH = 940;
const PAD = 40;
const HEADER_H = 96;
const ROW_H = 52;
const FOOT = 36;

/**
 * @param {import('discord.js').Guild} guild
 * @param {import('discord.js').Client} client
 * @param {{ userId: string, xp: number, level?: number, displayName?: string, avatarUrl?: string }[]} rows
 */
async function resolveEntries(guild, client, rows) {
  const out = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    let display = row.displayName ?? 'Nežinomas narys';
    let avatarUrl = row.avatarUrl ?? null;

    if (!row.displayName) {
      try {
        const member = await guild.members.fetch(row.userId).catch(() => null);
        if (member) {
          display = resolveMemberDisplayName(member);
          avatarUrl = member.user.displayAvatarURL({ extension: 'png', size: 128 });
        } else {
          const user = await client.users.fetch(row.userId).catch(() => null);
          if (user) {
            display = user.username;
            avatarUrl = user.displayAvatarURL({ extension: 'png', size: 128 });
          }
        }
      } catch {
        /* */
      }
    }

    out.push({
      rank: i + 1,
      display: display.length > 24 ? `${display.slice(0, 23)}…` : display,
      avatarUrl,
      level: row.level ?? getLevelFromXp(row.xp),
      xp: row.xp,
    });
  }
  return out;
}

/**
 * @param {import('discord.js').Guild} guild
 * @param {import('discord.js').Client} client
 * @param {{ userId: string, xp: number, level?: number, displayName?: string, avatarUrl?: string }[]} [rows]
 */
export async function buildLeaderboardImage(guild, client, rows = []) {
  const accent = loadModules().leaderboard.accent || ORANGE.accent;
  const height =
    rows.length === 0 ? 320 : PAD * 2 + HEADER_H + ROW_H * rows.length + FOOT;

  const canvas = createCanvas(WIDTH, height);
  const ctx = canvas.getContext('2d');

  drawOrangeBackground(ctx, WIDTH, height, 16, 3);

  if (rows.length === 0) {
    ctx.textAlign = 'center';
    ctx.fillStyle = ORANGE.text;
    ctx.font = 'bold 34px "Segoe UI", Arial, sans-serif';
    ctx.fillText('Lyderių dar nėra', WIDTH / 2, height / 2 - 14);
    ctx.font = '17px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = ORANGE.textDim;
    ctx.fillText('Rašyk kanaluose — pradėk rinkti XP', WIDTH / 2, height / 2 + 28);
    drawOrangeBorder(ctx, WIDTH, height, 16, 3);
    return canvas.toBuffer('image/png');
  }

  const entries = await resolveEntries(guild, client, rows);

  ctx.textAlign = 'left';
  ctx.fillStyle = ORANGE.text;
  ctx.font = 'bold 34px "Segoe UI", Arial, sans-serif';
  ctx.fillText('LYDERIŲ LENTELĖ', PAD + 6, PAD + 46);

  ctx.font = '14px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = ORANGE.textDim;
  const sub = guild.name.length > 48 ? `${guild.name.slice(0, 46)}…` : guild.name;
  ctx.fillText(sub.toUpperCase(), PAD + 6, PAD + 76);

  const colRank = PAD + 10;
  const colAvatar = colRank + 46;
  const colName = colAvatar + 48;
  const colLevel = WIDTH - PAD - 200;
  const colXp = WIDTH - PAD - 10;

  ctx.font = '11px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.38)';
  ctx.fillText('#', colRank, PAD + HEADER_H - 6);
  ctx.fillText('NARYS', colName, PAD + HEADER_H - 6);
  ctx.textAlign = 'right';
  ctx.fillText('LYGIS', colLevel, PAD + HEADER_H - 6);
  ctx.fillText('XP', colXp, PAD + HEADER_H - 6);
  ctx.textAlign = 'left';

  ctx.strokeStyle = 'rgba(255,255,255,0.09)';
  ctx.beginPath();
  ctx.moveTo(PAD + 2, PAD + HEADER_H + 4);
  ctx.lineTo(WIDTH - PAD - 2, PAD + HEADER_H + 4);
  ctx.stroke();

  let y = PAD + HEADER_H + 16;
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];

    if (i % 2 === 1) {
      ctx.fillStyle = ORANGE.rowAlt;
      fillRoundRect(ctx, PAD + 2, y - 6, WIDTH - PAD * 2 - 4, ROW_H - 4, 12);
    }

    let rankColor = 'rgba(255,255,255,0.88)';
    if (e.rank === 1) rankColor = ORANGE.top1;
    else if (e.rank === 2) rankColor = ORANGE.top2;
    else if (e.rank === 3) rankColor = ORANGE.top3;

    ctx.fillStyle = rankColor;
    ctx.font = 'bold 17px "Segoe UI", Arial, sans-serif';
    ctx.fillText(String(e.rank), colRank, y + 24);

    const avR = 18;
    const avX = colAvatar;
    const avY = y + 4;
    if (e.avatarUrl) {
      try {
        const av = await loadImage(e.avatarUrl);
        ctx.save();
        ctx.beginPath();
        ctx.arc(avX + avR, avY + avR, avR, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(av, avX, avY, avR * 2, avR * 2);
        ctx.restore();
        ctx.strokeStyle = accent;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(avX + avR, avY + avR, avR, 0, Math.PI * 2);
        ctx.stroke();
      } catch {
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.beginPath();
        ctx.arc(avX + avR, avY + avR, avR, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.fillStyle = '#f0f2f8';
    ctx.font = '16px "Segoe UI", Arial, sans-serif';
    ctx.fillText(e.display, colName, y + 24);

    ctx.textAlign = 'right';
    ctx.fillStyle = accent;
    ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
    ctx.fillText(String(e.level), colLevel, y + 24);
    ctx.fillStyle = ORANGE.text;
    ctx.font = '15px "Segoe UI", Arial, sans-serif';
    ctx.fillText(Number(e.xp).toLocaleString('lt-LT'), colXp, y + 24);
    ctx.textAlign = 'left';

    y += ROW_H;
  }

  ctx.font = '12px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.fillText('Top 15 pagal bendrą XP', PAD + 6, height - PAD + 10);

  drawOrangeBorder(ctx, WIDTH, height, 16, 3);
  return canvas.toBuffer('image/png');
}
