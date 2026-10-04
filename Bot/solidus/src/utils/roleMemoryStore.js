import { persistDatabase, queryAll, queryOne, runSqlNoSave, withTransaction } from '../db/database.js';

/** @typedef {{ roleIds: string[], savedAt: number }} RoleMemoryRecord */

const DISCORD_USER_ID = /^\d{17,20}$/;

/**
 * @param {Record<string, unknown>} row
 * @returns {RoleMemoryRecord}
 */
function rowToRecord(row) {
  let roleIds = [];
  try {
    roleIds = JSON.parse(String(row.role_ids ?? '[]'));
  } catch {
    roleIds = [];
  }
  return {
    roleIds: Array.isArray(roleIds) ? roleIds : [],
    savedAt: Number(row.saved_at ?? 0),
  };
}

/** @deprecated Tik suderinamumui */
export function loadRoleMemory() {
  const users = {};
  for (const row of queryAll('SELECT * FROM role_memory')) {
    users[String(row.user_id)] = rowToRecord(row);
  }
  return { version: 1, users };
}

/** @deprecated Tik suderinamumui */
export function saveRoleMemory(data) {
  withTransaction(() => {
    for (const [userId, record] of Object.entries(data.users ?? {})) {
      if (!DISCORD_USER_ID.test(userId)) continue;
      runSqlNoSave(
        `INSERT INTO role_memory (user_id, role_ids, saved_at) VALUES (?, ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET role_ids = excluded.role_ids, saved_at = excluded.saved_at`,
        [userId, JSON.stringify(record.roleIds ?? []), record.savedAt ?? Date.now()],
      );
    }
  });
}

/**
 * @param {string} userId
 * @returns {RoleMemoryRecord | null}
 */
export function getSavedRoles(userId) {
  if (!DISCORD_USER_ID.test(userId)) return null;
  const row = queryOne('SELECT * FROM role_memory WHERE user_id = ?', [userId]);
  return row ? rowToRecord(row) : null;
}

/**
 * @param {string} userId
 * @param {string[]} roleIds
 */
export function saveUserRoles(userId, roleIds) {
  if (!DISCORD_USER_ID.test(userId)) return;
  runSqlNoSave(
    `INSERT INTO role_memory (user_id, role_ids, saved_at) VALUES (?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET role_ids = excluded.role_ids, saved_at = excluded.saved_at`,
    [userId, JSON.stringify([...new Set(roleIds)]), Date.now()],
  );
  persistDatabase();
}
