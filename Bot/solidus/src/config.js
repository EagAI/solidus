import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { YOUTUBE_POLL_MS_DEFAULT, XP_PER_MESSAGE_DEFAULT, XP_COOLDOWN_MS_DEFAULT, RUKALIAI_GIVEN_XP_DEFAULT, RUKALIAI_ROLE_ID_DEFAULT } from './constants.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });
function envBool(name, defaultValue = false) {
  const v = process.env[name];
  if (v === undefined || v === null || v === '') return defaultValue;
  return ['true', '1', 'yes'].includes(String(v).trim().toLowerCase());
}

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Trūksta privalomo env: ${name}`);
  return v.trim();
}

function optionalEnv(name) {
  const v = process.env[name];
  return v?.trim() || null;
}

export const config = {
  token: requireEnv('DISCORD_TOKEN'),
  /**
   * Single "home" server for the legacy one-server features (verify, logs,
   * YouTube, voice hub...). Optional: without it the bot still runs and the
   * panel works for every server, those features just stay off.
   */
  guildId: optionalEnv('GUILD_ID'),
  verifyChannelId: optionalEnv('VERIFY_CHANNEL_ID'),
  narysRoleId: optionalEnv('NARYS_ROLE_ID'),
  patvirtintasRoleId: optionalEnv('PATVIRTINTAS_ROLE_ID'),
  welcomeChannelId: optionalEnv('WELCOME_CHANNEL_ID') || optionalEnv('VERIFY_CHANNEL_ID'),
  youtubeChannelId: optionalEnv('YOUTUBE_CHANNEL_ID'),
  youtubeAnnounceChannelId: optionalEnv('YOUTUBE_ANNOUNCE_CHANNEL_ID'),
  youtubePollMs: (() => {
    const raw = optionalEnv('YOUTUBE_POLL_MS');
    if (!raw) return YOUTUBE_POLL_MS_DEFAULT;
    const n = parseInt(raw, 10);
    if (Number.isNaN(n) || n < 30_000) return YOUTUBE_POLL_MS_DEFAULT;
    return n;
  })(),
  adminActionsChannelId: optionalEnv('ADMIN_ACTIONS_CHANNEL_ID'),
  logsChannelId: optionalEnv('LOGS_CHANNEL_ID'),
  modRoleIds: (() => {
    const raw = process.env.MOD_ROLE_IDS;
    if (!raw) return [];
    return raw.split(',').map((s) => s.trim()).filter(Boolean);
  })(),
  inviteTimeoutMs: Number(process.env.INVITE_TIMEOUT_MS ?? 86_400_000),

  scamScanEnabled: envBool('SCAM_SCAN_ENABLED', true),
  scamScoreThreshold: Number(process.env.SCAM_SCORE_THRESHOLD ?? 4),
  scamTimeoutMs: Number(process.env.SCAM_TIMEOUT_MS ?? 86_400_000),
  scamAlertCooldownMs: Number(process.env.SCAM_ALERT_COOLDOWN_MS ?? 120_000),
  scamScanChannelIds: (() => {
    const raw = optionalEnv('SCAM_SCAN_CHANNEL_IDS');
    if (!raw) return null;
    const ids = raw.split(',').map((s) => s.trim()).filter(Boolean);
    return ids.length ? ids : null;
  })(),

  voiceEnabled: envBool('VOICE_ENABLED', true),
  voiceCategoryId: optionalEnv('VOICE_CATEGORY_ID'),

  xpPerMessage: Number(process.env.XP_PER_MESSAGE ?? XP_PER_MESSAGE_DEFAULT),
  xpCooldownMs: Number(process.env.XP_COOLDOWN_MS ?? XP_COOLDOWN_MS_DEFAULT),
  /** XP už /parukom mygtuką (viešai neminima) */
  rukaliaiGivenXp: (() => {
    const n = Number(process.env.RUKALIAI_GIVEN_XP ?? RUKALIAI_GIVEN_XP_DEFAULT);
    return Number.isFinite(n) && n >= 0 ? n : RUKALIAI_GIVEN_XP_DEFAULT;
  })(),
  /** @rukaliai rolė prieš /parukom embed */
  rukaliaiRoleId: optionalEnv('RUKALIAI_ROLE_ID') || RUKALIAI_ROLE_ID_DEFAULT,
  levelUpChannelId:
    optionalEnv('LEVEL_UP_CHANNEL_ID') ||
    optionalEnv('WELCOME_CHANNEL_ID') ||
    optionalEnv('VERIFY_CHANNEL_ID'),
  giveawayChannelId: optionalEnv('GIVEAWAY_CHANNEL_ID'),
  /** Kanalai, kuriuose leidžiamos tik nuotraukų attachment'ai (be teksto) */
  mediaChannelIds: (() => {
    const raw = optionalEnv('MEDIA_CHANNEL_IDS');
    if (!raw) return [];
    return raw.split(',').map((s) => s.trim()).filter(Boolean);
  })(),
  /** true = laikyti visas lygio roles, false = tik aukščiausia */
  levelRolesStack: envBool('LEVEL_ROLES_STACK', false),
};
