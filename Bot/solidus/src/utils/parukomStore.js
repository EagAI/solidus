import { persistDatabase, queryAll, queryOne, runSqlNoSave, withTransaction } from '../db/database.js';

/**
 * @typedef {{ userId: string, name: string }} ParukomEntry
 * @typedef {{
 *   id: string,
 *   messageId: string,
 *   channelId: string,
 *   hostId: string,
 *   endsAt: number,
 *   ended: boolean,
 *   entries: ParukomEntry[],
 * }} ParukomSession
 */

/**
 * @param {Record<string, unknown>} row
 * @returns {ParukomSession}
 */
function rowToSession(row) {
  let entries = [];
  try {
    entries = JSON.parse(String(row.entries ?? '[]'));
  } catch {
    entries = [];
  }
  if (!Array.isArray(entries)) entries = [];

  return {
    id: String(row.id),
    messageId: row.message_id ? String(row.message_id) : '',
    channelId: String(row.channel_id),
    hostId: String(row.host_id),
    endsAt: Number(row.ends_at),
    ended: Boolean(row.ended),
    entries: entries
      .filter((e) => e && typeof e === 'object' && e.userId && e.name)
      .map((e) => ({ userId: String(e.userId), name: String(e.name) })),
  };
}

/**
 * @param {ParukomSession} session
 */
function upsertSession(session) {
  runSqlNoSave(
    `INSERT INTO parukom_sessions (id, message_id, channel_id, host_id, ends_at, ended, entries)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       message_id = excluded.message_id,
       channel_id = excluded.channel_id,
       host_id = excluded.host_id,
       ends_at = excluded.ends_at,
       ended = excluded.ended,
       entries = excluded.entries`,
    [
      session.id,
      session.messageId || null,
      session.channelId,
      session.hostId,
      session.endsAt,
      session.ended ? 1 : 0,
      JSON.stringify(session.entries),
    ],
  );
}

/**
 * @param {string} id
 * @returns {ParukomSession | null}
 */
export function getParukomSession(id) {
  const row = queryOne('SELECT * FROM parukom_sessions WHERE id = ?', [id]);
  return row ? rowToSession(row) : null;
}

/**
 * @returns {ParukomSession[]}
 */
export function getActiveParukomSessions() {
  return queryAll('SELECT * FROM parukom_sessions WHERE ended = 0').map(rowToSession);
}

/**
 * @param {Omit<ParukomSession, 'ended' | 'entries'> & { entries?: ParukomEntry[] }} data
 * @returns {ParukomSession}
 */
export function createParukomSession(data) {
  const session = {
    id: data.id,
    messageId: data.messageId,
    channelId: data.channelId,
    hostId: data.hostId,
    endsAt: data.endsAt,
    ended: false,
    entries: data.entries ?? [],
  };
  withTransaction(() => {
    upsertSession(session);
  });
  persistDatabase();
  return session;
}

/**
 * @param {string} id
 * @param {(session: ParukomSession) => void} mutator
 * @returns {ParukomSession | null}
 */
export function mutateParukomSession(id, mutator) {
  const session = getParukomSession(id);
  if (!session) return null;
  mutator(session);
  withTransaction(() => {
    upsertSession(session);
  });
  persistDatabase();
  return session;
}
