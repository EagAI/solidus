import { queryOne, runSql } from '../db/database.js';
import { loadImage } from '@napi-rs/canvas';

/**
 * @param {string} userId
 * @returns {{ url: string, setBy: string, setAt: number } | null}
 */
export function getLygisBackground(userId) {
  const row = queryOne('SELECT url, set_by, set_at FROM lygis_backgrounds WHERE user_id = ?', [
    userId,
  ]);
  if (!row?.url) return null;
  return {
    url: String(row.url),
    setBy: String(row.set_by),
    setAt: Number(row.set_at),
  };
}

/**
 * @param {string} userId
 * @param {string} url
 * @param {string} setByUserId
 */
export function setLygisBackground(userId, url, setByUserId) {
  runSql(
    `INSERT INTO lygis_backgrounds (user_id, url, set_by, set_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       url = excluded.url,
       set_by = excluded.set_by,
       set_at = excluded.set_at`,
    [userId, url, setByUserId, Date.now()],
  );
}

/**
 * @param {string} userId
 * @returns {boolean}
 */
export function clearLygisBackground(userId) {
  const existing = getLygisBackground(userId);
  if (!existing) return false;
  runSql('DELETE FROM lygis_backgrounds WHERE user_id = ?', [userId]);
  return true;
}

/**
 * @param {string} raw
 * @returns {{ ok: true, url: string } | { ok: false, error: string }}
 */
export function validateLygisBackgroundUrl(raw) {
  const url = raw?.trim();
  if (!url) {
    return { ok: false, error: 'URL negali būti tuščias.' };
  }
  if (url.length > 2048) {
    return { ok: false, error: 'URL per ilgas (max 2048 simbolių).' };
  }

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, error: 'Neteisingas URL formatas.' };
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return { ok: false, error: 'Leidžiamas tik http:// arba https:// URL.' };
  }

  const path = parsed.pathname.toLowerCase();
  if (path.endsWith('.svg') || path.endsWith('.svgz')) {
    return { ok: false, error: 'SVG nuotraukos nepalaikomos. Naudok jpg, png, webp arba gif.' };
  }

  return { ok: true, url: parsed.toString() };
}

/**
 * @param {string} url
 * @returns {Promise<{ ok: true } | { ok: false, error: string }>}
 */
export async function verifyLygisBackgroundImage(url) {
  try {
    await loadImage(url);
    return { ok: true };
  } catch (e) {
    const msg = e?.message || String(e);
    if (/svg/i.test(msg)) {
      return {
        ok: false,
        error: 'SVG nuotraukos nepalaikomos. Naudok jpg, png, webp arba gif.',
      };
    }
    return {
      ok: false,
      error:
        'Nepavyko užkrauti nuotraukos — patikrink ar nuoroda vieša (jpg/png/webp/gif) ir pasiekiama botui.',
    };
  }
}
