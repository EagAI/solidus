import { persistDatabase, queryAll, queryOne, runSqlNoSave, withTransaction } from '../db/database.js';

/** @typedef {{
 *   id: string,
 *   messageId: string,
 *   channelId: string,
 *   hostId: string,
 *   title: string,
 *   description: string,
 *   imageUrl: string | null,
 *   winnerCount: number,
 *   endsAt: number,
 *   entries: string[],
 *   ended: boolean,
 *   winners: string[],
 * }} GiveawayRecord */

/**
 * @param {Record<string, unknown>} row
 * @returns {GiveawayRecord}
 */
function rowToGiveaway(row) {
  let entries = [];
  let winners = [];
  try {
    entries = JSON.parse(String(row.entries ?? '[]'));
  } catch {
    entries = [];
  }
  try {
    winners = JSON.parse(String(row.winners ?? '[]'));
  } catch {
    winners = [];
  }

  return {
    id: String(row.id),
    messageId: row.message_id ? String(row.message_id) : '',
    channelId: String(row.channel_id),
    hostId: String(row.host_id),
    title: String(row.title),
    description: String(row.description ?? ''),
    imageUrl: row.image_url ? String(row.image_url) : null,
    winnerCount: Number(row.winner_count ?? 1),
    endsAt: Number(row.ends_at),
    entries: Array.isArray(entries) ? entries : [],
    ended: Boolean(row.ended),
    winners: Array.isArray(winners) ? winners : [],
  };
}

/**
 * @param {GiveawayRecord} record
 */
function upsertGiveaway(record) {
  runSqlNoSave(
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
      record.messageId || null,
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

export function loadGiveawayData() {
  const giveaways = {};
  for (const row of queryAll('SELECT * FROM giveaways')) {
    const record = rowToGiveaway(row);
    giveaways[record.id] = record;
  }
  return { version: 1, giveaways };
}

/** @deprecated Tik suderinamumui */
export function saveGiveawayData(data) {
  withTransaction(() => {
    for (const record of Object.values(data.giveaways ?? {})) {
      upsertGiveaway(record);
    }
  });
}

/**
 * @param {string} id
 * @returns {GiveawayRecord | null}
 */
export function getGiveaway(id) {
  const row = queryOne('SELECT * FROM giveaways WHERE id = ?', [id]);
  return row ? rowToGiveaway(row) : null;
}

/**
 * @param {string} messageId
 * @returns {GiveawayRecord | null}
 */
export function getGiveawayByMessageId(messageId) {
  const row = queryOne('SELECT * FROM giveaways WHERE message_id = ?', [messageId]);
  return row ? rowToGiveaway(row) : null;
}

/**
 * @returns {GiveawayRecord[]}
 */
export function getActiveGiveaways() {
  const now = Date.now();
  return queryAll('SELECT * FROM giveaways WHERE ended = 0 AND ends_at > ?', [now]).map(
    rowToGiveaway,
  );
}

/**
 * @param {GiveawayRecord} record
 */
export function saveGiveaway(record) {
  upsertGiveaway(record);
  persistDatabase();
}

/**
 * @param {string} id
 * @param {(record: GiveawayRecord) => void} mutator
 */
export function mutateGiveaway(id, mutator) {
  const record = getGiveaway(id);
  if (!record) return null;
  mutator(record);
  upsertGiveaway(record);
  persistDatabase();
  return record;
}
