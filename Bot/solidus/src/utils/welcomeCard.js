import { createCanvas, loadImage } from '@napi-rs/canvas';

/**
 * Centered entrance card (solidus2 stilius) — avataras viduryje, vardas po juo.
 * @param {import('discord.js').GuildMember} member
 */
export async function buildWelcomeCard(member) {
  const W = 800;
  const H = 420;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#1a0a0a');
  bg.addColorStop(1, '#3a1010');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const avatarSize = 180;
  const cx = W / 2;
  const cy = H / 2 - 24;
  const radius = avatarSize / 2;

  const avatarUrl = member.user.displayAvatarURL({ extension: 'png', size: 256 });
  const avatar = await loadImage(avatarUrl);

  ctx.beginPath();
  ctx.arc(cx, cy, radius + 8, 0, Math.PI * 2);
  ctx.fillStyle = '#e03030';
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, cx - radius, cy - radius, avatarSize, avatarSize);
  ctx.restore();

  const name = member.user.globalName || member.user.username;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#e03030';
  ctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
  ctx.fillText(name, cx, cy + radius + 48);
  ctx.fillStyle = '#ffffff';
  ctx.font = '24px "Segoe UI", Arial, sans-serif';
  ctx.fillText('Sveiki atvykę!', cx, cy + radius + 86);

  return canvas.toBuffer('image/png');
}
