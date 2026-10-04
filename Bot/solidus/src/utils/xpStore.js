import { persistDatabase, queryAll, queryOne, runSqlNoSave, withTransaction } from '../db/database.js';

/** @typedef {{ xp: number, level: number, lastXpTime: number, totalMessages: number }} XpRecord */

const DISCORD_USER_ID = /^\d{17,20}$/;

/**
 * @param {Record<string, unknown>} row
 * @returns {XpRecord}
 */
function rowToRecord(row) {
  return {
    xp: Number(row.xp ?? 0),
    level: Number(row.level ?? 0),
    lastXpTime: Number(row.last_xp_time ?? 0),
    totalMessages: Number(row.total_messages ?? 0),
  };
}

/**
 * @param {string} userId
 * @returns {XpRecord}
 */
function defaultRecord() {
  return { xp: 0, level: 0, lastXpTime: 0, totalMessages: 0 };
}

/**
 * @param {string} userId
 * @param {XpRecord} record
 */
function upsertUserRecord(userId, record) {
  runSqlNoSave(
    `INSERT INTO xp_users (user_id, xp, level, last_xp_time, total_messages)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       xp = excluded.xp,
       level = excluded.level,
       last_xp_time = excluded.last_xp_time,
       total_messages = excluded.total_messages`,
    [userId, record.xp, record.level, record.lastXpTime, record.totalMessages],
  );
}

/** @deprecated Tik suderinamumui — naudok getUserRecord */
export function loadXpData() {
  const users = {};
  for (const row of queryAll('SELECT * FROM xp_users')) {
    users[String(row.user_id)] = rowToRecord(row);
  }
  return { version: 1, users };
}

/** @deprecated Tik suderinamumui */
export function saveXpData(data) {
  withTransaction(() => {
    for (const [userId, record] of Object.entries(data.users ?? {})) {
      if (!DISCORD_USER_ID.test(userId)) continue;
      upsertUserRecord(userId, record);
    }
  });
}

/**
 * @param {string} userId
 * @returns {XpRecord}
 */
export function getUserRecord(userId) {
  const row = queryOne('SELECT * FROM xp_users WHERE user_id = ?', [userId]);
  if (!row) {
    const record = defaultRecord();
    upsertUserRecord(userId, record);
    persistDatabase();
    return record;
  }
  return rowToRecord(row);
}

/**
 * @param {string} userId
 * @param {(record: XpRecord) => void} mutator
 */
export function mutateUserRecord(userId, mutator) {
  const record = getUserRecord(userId);
  mutator(record);
  upsertUserRecord(userId, record);
  persistDatabase();
}

/**
 * @param {number} [limit]
 * @returns {{ userId: string, xp: number, level: number, totalMessages: number }[]}
 */
export function getTopUsers(limit = 15) {
  const rows = queryAll(
    `SELECT user_id, xp, level, total_messages
     FROM xp_users
     WHERE xp > 0
     ORDER BY xp DESC, level DESC
     LIMIT ?`,
    [limit],
  );

  return rows
    .filter((row) => DISCORD_USER_ID.test(String(row.user_id)))
    .map((row) => ({
      userId: String(row.user_id),
      xp: Number(row.xp),
      level: Number(row.level),
      totalMessages: Number(row.total_messages),
    }));
}
