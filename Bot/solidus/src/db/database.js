import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = path.join(__dirname, '..', '..', 'data');
export const DB_PATH = path.join(DATA_DIR, 'bot.db');

/** @type {import('sql.js').Database | null} */
let db = null;

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS bot_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS xp_users (
  user_id TEXT PRIMARY KEY,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 0,
  last_xp_time INTEGER NOT NULL DEFAULT 0,
  total_messages INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS link_exceptions (
  user_id TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS voice_channels (
  channel_id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS giveaways (
  id TEXT PRIMARY KEY,
  message_id TEXT,
  channel_id TEXT NOT NULL,
  host_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  winner_count INTEGER NOT NULL DEFAULT 1,
  ends_at INTEGER NOT NULL,
  entries TEXT NOT NULL DEFAULT '[]',
  ended INTEGER NOT NULL DEFAULT 0,
  winners TEXT NOT NULL DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_giveaways_message_id ON giveaways(message_id);

CREATE TABLE IF NOT EXISTS role_memory (
  user_id TEXT PRIMARY KEY,
  role_ids TEXT NOT NULL,
  saved_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS youtube_announced_videos (
  yt_channel_id TEXT NOT NULL,
  video_id TEXT NOT NULL,
  announced_at INTEGER NOT NULL,
  PRIMARY KEY (yt_channel_id, video_id)
);

CREATE TABLE IF NOT EXISTS youtube_state (
  yt_channel_id TEXT PRIMARY KEY,
  last_video_id TEXT
);

CREATE TABLE IF NOT EXISTS lygis_backgrounds (
  user_id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  set_by TEXT NOT NULL,
  set_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS parukom_sessions (
  id TEXT PRIMARY KEY,
  message_id TEXT,
  channel_id TEXT NOT NULL,
  host_id TEXT NOT NULL,
  ends_at INTEGER NOT NULL,
  ended INTEGER NOT NULL DEFAULT 0,
  entries TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS support_tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT NOT NULL DEFAULT '',
  channel_id TEXT NOT NULL DEFAULT '',
  opener_id TEXT NOT NULL DEFAULT '',
  opener_name TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open',
  opened_at INTEGER NOT NULL,
  closed_at INTEGER
);

CREATE TABLE IF NOT EXISTS support_ticket_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL,
  author_id TEXT NOT NULL DEFAULT '',
  author_name TEXT NOT NULL DEFAULT '',
  author_bot INTEGER NOT NULL DEFAULT 0,
  content TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL
);
`;

/**
 * @returns {import('sql.js').Database}
 */
export function getDb() {
  if (!db) {
    throw new Error('Duomenų bazė neinicializuota — kviesk await initDatabase() paleidimo pradžioje.');
  }
  return db;
}

function saveDatabaseToDisk() {
  if (!db) return;
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmp = `${DB_PATH}.tmp`;
  fs.writeFileSync(tmp, Buffer.from(db.export()));
  fs.renameSync(tmp, DB_PATH);
}

/**
 * @param {string} sql
 * @param {import('sql.js').BindParams} [params]
 */
export function runSqlNoSave(sql, params = []) {
  getDb().run(sql, params);
}

/**
 * @param {string} sql
 * @param {import('sql.js').BindParams} [params]
 */
export function runSql(sql, params = []) {
  runSqlNoSave(sql, params);
  saveDatabaseToDisk();
}

export function persistDatabase() {
  saveDatabaseToDisk();
}

/**
 * @param {string} sql
 * @param {import('sql.js').BindParams} [params]
 * @returns {Record<string, unknown> | null}
 */
export function queryOne(sql, params = []) {
  const database = getDb();
  const stmt = database.prepare(sql);
  stmt.bind(params);
  let row = null;
  if (stmt.step()) {
    row = stmt.getAsObject();
  }
  stmt.free();
  return row;
}

/**
 * @param {string} sql
 * @param {import('sql.js').BindParams} [params]
 * @returns {Record<string, unknown>[]}
 */
export function queryAll(sql, params = []) {
  const database = getDb();
  const stmt = database.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

/**
 * @param {() => void} fn
 */
export function withTransaction(fn) {
  const database = getDb();
  database.run('BEGIN');
  try {
    fn();
    database.run('COMMIT');
    saveDatabaseToDisk();
  } catch (e) {
    database.run('ROLLBACK');
    throw e;
  }
}

/**
 * @param {string} key
 * @returns {unknown | null}
 */
export function getSetting(key) {
  const row = queryOne('SELECT value FROM bot_settings WHERE key = ?', [key]);
  if (!row?.value) return null;
  try {
    return JSON.parse(String(row.value));
  } catch {
    return null;
  }
}

/**
 * @param {string} key
 * @param {unknown} value
 */
export function setSetting(key, value) {
  runSqlNoSave(
    `INSERT INTO bot_settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [key, JSON.stringify(value)],
  );
  saveDatabaseToDisk();
}

/**
 * @returns {Promise<import('sql.js').Database>}
 */
export async function initDatabase() {
  if (db) return db;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const wasmPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
    '..',
    'node_modules',
    'sql.js',
    'dist',
    'sql-wasm.wasm',
  );
  const SQL = await initSqlJs({ locateFile: () => wasmPath });

  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA foreign_keys = ON');
  db.exec(SCHEMA_SQL);

  const { migrateFromJsonIfNeeded } = await import('./migrateFromJson.js');
  migrateFromJsonIfNeeded(db);

  return db;
}

/**
 * @param {import('sql.js').Database} database
 * @param {string} sql
 * @param {import('sql.js').BindParams} [params]
 */
export function runOnDb(database, sql, params = []) {
  database.run(sql, params);
}

/**
 * @param {import('sql.js').Database} database
 * @param {string} key
 * @returns {unknown | null}
 */
export function getSettingOnDb(database, key) {
  const stmt = database.prepare('SELECT value FROM bot_settings WHERE key = ?');
  stmt.bind([key]);
  let value = null;
  if (stmt.step()) {
    const row = stmt.getAsObject();
    try {
      value = JSON.parse(String(row.value));
    } catch {
      value = null;
    }
  }
  stmt.free();
  return value;
}

/**
 * @param {import('sql.js').Database} database
 * @param {string} key
 * @param {unknown} value
 */
export function setSettingOnDb(database, key, value) {
  database.run(
    `INSERT INTO bot_settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [key, JSON.stringify(value)],
  );
}

export { saveDatabaseToDisk };
