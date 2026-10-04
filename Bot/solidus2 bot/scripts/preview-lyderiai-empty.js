/**
 * Tuščia pakvietimų lentelė — ką mato paprastas narys (/lyderiai tipas:pakvietimai).
 * Paleisti: node scripts/preview-lyderiai-empty.js
 */
const path = require('path');
const fs = require('fs');
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');

const labels = {
  emptyTitle: 'Lyderiai kol kas nerodomi',
};

(() => {
  const root = process.env.SystemRoot || 'C:/Windows';
  for (const [file, name] of [
    [path.join(root, 'Fonts/segoeuib.ttf'), 'SegoeB'],
    [path.join(root, 'Fonts/segoeui.ttf'), 'Segoe'],
  ]) {
    try {
      if (fs.existsSync(file)) GlobalFonts.registerFromPath(file, name);
    } catch (_) {
      /* */
    }
  }
})();

function font(weight, px) {
  const b = fs.existsSync(path.join(process.env.SystemRoot || 'C:/Windows', 'Fonts/segoeuib.ttf'));
  const r = fs.existsSync(path.join(process.env.SystemRoot || 'C:/Windows', 'Fonts/segoeui.ttf'));
  if (weight === 'b' && b) return `bold ${px}px SegoeB`;
  if (weight === 'r' && r) return `${px}px Segoe`;
  return weight === 'b' ? `bold ${px}px system-ui, sans-serif` : `${px}px system-ui, sans-serif`;
}

function drawRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

const W = 940;
const pad = 40;
const H = 320;

const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

ctx.fillStyle = '#060608';
ctx.fillRect(0, 0, W, H);

const vign = ctx.createRadialGradient(W * 0.45, 0, 0, W * 0.55, H * 0.35, W);
vign.addColorStop(0, 'rgba(224,48,48,0.14)');
vign.addColorStop(1, 'rgba(0,0,0,0)');
ctx.fillStyle = vign;
ctx.fillRect(0, 0, W, H);

ctx.strokeStyle = 'rgba(255,255,255,0.07)';
ctx.lineWidth = 1;
drawRoundRect(ctx, pad * 0.45, pad * 0.45, W - pad * 0.9, H - pad * 0.9, 26);
ctx.stroke();

ctx.textAlign = 'center';
ctx.fillStyle = '#ffffff';
ctx.font = font('b', 34);
ctx.fillText(labels.emptyTitle, W / 2, H / 2 + 6);

const out = path.join(__dirname, '../src/assets/lyderiai-pakvietimai-empty-user.png');
fs.writeFileSync(out, canvas.toBuffer('image/png'));
console.log('Saved:', out);
