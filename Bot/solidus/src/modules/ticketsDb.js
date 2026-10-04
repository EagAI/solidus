import { queryAll } from '../db/database.js';

/**
 * @param {'all' | 'open' | 'closed'} status
 */
export function listSupportTickets(status = 'all') {
  const sql =
    status === 'open' || status === 'closed'
      ? `SELECT * FROM support_tickets WHERE status = ? ORDER BY opened_at DESC`
      : `SELECT * FROM support_tickets ORDER BY opened_at DESC`;
  const params = status === 'open' || status === 'closed' ? [status] : [];
  return queryAll(sql, params).map(mapTicket);
}

/**
 * @param {number} id
 */
export function listSupportTicketMessages(id) {
  return queryAll(
    `SELECT * FROM support_ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC`,
    [id],
  ).map((row) => ({
    id: Number(row.id),
    authorId: String(row.author_id ?? ''),
    authorName: String(row.author_name ?? 'Narys'),
    bot: Number(row.author_bot) === 1,
    content: String(row.content ?? ''),
    createdAt: Number(row.created_at),
  }));
}

/**
 * @param {Record<string, unknown>} row
 */
function mapTicket(row) {
  const channelId = String(row.channel_id ?? '');
  const guildId = String(row.guild_id ?? '');
  return {
    id: Number(row.id),
    guildId,
    openerName: String(row.opener_name ?? ''),
    category: String(row.category ?? ''),
    status: String(row.status ?? 'open'),
    openedAt: Number(row.opened_at),
    closedAt: row.closed_at == null ? null : Number(row.closed_at),
    url:
      guildId && channelId
        ? `https://discord.com/channels/${guildId}/${channelId}`
        : '',
  };
}
