import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getSettingOnDb, runOnDb, saveDatabaseToDisk, setSettingOnDb } from './database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', '..', 'data');

const JSON_FILES = {
  xp: path.join(DATA_DIR, 'xp.json'),
  state: path.join(DATA_DIR, 'bot-state.json'),
  giveaways: path.join(DATA_DIR, 'giveaways.json'),
  roleMemory: path.join(DATA_DIR, 'role-memory.json'),
};

const DISCORD_USER_ID = /^\d{17,20}$/;

/**
 * @param {string} filePath
 * @returns {unknown | null}
 */
function readJsonFile(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * @param {string} filePath
 */
function backupJsonFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const backupPath = `${filePath}.bak`;
  if (!fs.existsSync(backupPath)) {
    fs.renameSync(filePath, backupPath);
  }
}

/**
 * @param {import('sql.js').Database} database
 * @param {string} sql
 * @param {import('sql.js').BindParams} params
 */
function queryExists(database, sql, params = []) {
  const stmt = database.prepare(sql);
  stmt.bind(params);
  const exists = stmt.step();
  stmt.free();
  return exists;
}

/**
 * @param {import('sql.js').Database} database
 */
export function migrateFromJsonIfNeeded(database) {
  if (getSettingOnDb(database, 'json_migrated') === true) return;

  const hasExistingData =
    queryExists(database, 'SELECT 1 FROM xp_users LIMIT 1') ||
    queryExists(database, 'SELECT 1 FROM giveaways LIMIT 1') ||
    queryExists(database, 'SELECT 1 FROM role_memory LIMIT 1') ||
    queryExists(database, "SELECT 1 FROM bot_settings WHERE key != 'json_migrated' LIMIT 1") ||
    queryExists(database, 'SELECT 1 FROM link_exceptions LIMIT 1') ||
    queryExists(database, 'SELECT 1 FROM voice_channels LIMIT 1');

  if (hasExistingData) {
    setSettingOnDb(database, 'json_migrated', true);
    saveDatabaseToDisk();
    return;
  }

  database.run('BEGIN');
  try {
    migrateXp(database);
    migrateState(database);
    migrateGiveaways(database);
    migrateRoleMemory(database);
    setSettingOnDb(database, 'json_migrated', true);
    database.run('COMMIT');
  } catch (e) {
    database.run('ROLLBACK');
    throw e;
  }

  saveDatabaseToDisk();

  backupJsonFile(JSON_FILES.xp);
  backupJsonFile(JSON_FILES.state);
  backupJsonFile(JSON_FILES.giveaways);
  backupJsonFile(JSON_FILES.roleMemory);
}

/**
 * @param {import('sql.js').Database} database
 */
function migrateXp(database) {
  const raw = readJsonFile(JSON_FILES.xp);
  if (!raw?.users) return;

  for (const [userId, record] of Object.entries(raw.users)) {
    if (!DISCORD_USER_ID.test(userId)) continue;
    runOnDb(
      database,
      `INSERT INTO xp_users (user_id, xp, level, last_xp_time, total_messages)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         xp = excluded.xp,
         level = excluded.level,
         last_xp_time = excluded.last_xp_time,
         total_messages = excluded.total_messages`,
      [
        userId,
        record.xp ?? 0,
        record.level ?? 0,
        record.lastXpTime ?? 0,
        record.totalMessages ?? 0,
      ],
    );
  }
}

/**
 * @param {import('sql.js').Database} database
 */
function migrateState(database) {
  const raw = readJsonFile(JSON_FILES.state);
  if (!raw) return;

  if (raw.verify != null) setSettingOnDb(database, 'verify', raw.verify);
  if (raw.youtube != null) setSettingOnDb(database, 'youtube', raw.youtube);
  if (raw.voiceHub != null) setSettingOnDb(database, 'voiceHub', raw.voiceHub);

  for (const [userId, expiresAt] of Object.entries(raw.linkExceptions ?? {})) {
    if (!DISCORD_USER_ID.test(userId)) continue;
    runOnDb(
      database,
      `INSERT INTO link_exceptions (user_id, expires_at) VALUES (?, ?)
       ON CONFLICT(user_id) DO UPDATE SET expires_at = excluded.expires_at`,
      [userId, expiresAt],
    );
  }

  for (const [channelId, meta] of Object.entries(raw.voiceChannels ?? {})) {
    if (!meta?.ownerId) continue;
    runOnDb(
      database,
      `INSERT INTO voice_channels (channel_id, owner_id) VALUES (?, ?)
       ON CONFLICT(channel_id) DO UPDATE SET owner_id = excluded.owner_id`,
      [channelId, meta.ownerId],
    );
  }
}

/**
 * @param {import('sql.js').Database} database
 */
function migrateGiveaways(database) {
  const raw = readJsonFile(JSON_FILES.giveaways);
  if (!raw?.giveaways) return;

  for (const record of Object.values(raw.giveaways)) {
    runOnDb(
      database,
      `INSERT INTO giveaways (
        id, message_id, channel_id, host_id, title, description, image_url,
        winner_count, ends_at, entries, ended, winners
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        message_id = excluded.message_id,
        channel_id = excluded.channel_id,
        host_id = excluded.host_id,
        title = excluded.title,
        description = excluded.description,
        image_url = excluded.image_url,
        winner_count = excluded.winner_count,
        ends_at = excluded.ends_at,
        entries = excluded.entries,
        ended = excluded.ended,
        winners = excluded.winners`,
      [
        record.id,
        record.messageId ?? null,
        record.channelId,
        record.hostId,
        record.title,
        record.description ?? '',
        record.imageUrl ?? null,
        record.winnerCount ?? 1,
        record.endsAt,
        JSON.stringify(record.entries ?? []),
        record.ended ? 1 : 0,
        JSON.stringify(record.winners ?? []),
      ],
    );
  }
}

/**
 * @param {import('sql.js').Database} database
 */
function migrateRoleMemory(database) {
  const raw = readJsonFile(JSON_FILES.roleMemory);
  if (!raw?.users) return;

  for (const [userId, record] of Object.entries(raw.users)) {
    if (!DISCORD_USER_ID.test(userId)) continue;
    runOnDb(
      database,
      `INSERT INTO role_memory (user_id, role_ids, saved_at) VALUES (?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         role_ids = excluded.role_ids,
         saved_at = excluded.saved_at`,
      [userId, JSON.stringify(record.roleIds ?? []), record.savedAt ?? Date.now()],
    );
  }
}
