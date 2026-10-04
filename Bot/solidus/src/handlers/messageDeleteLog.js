import { AuditLogEvent } from 'discord.js';
import { config } from '../config.js';
import {
  forgetCachedMessage,
  getCachedMessage,
} from '../utils/messageContentCache.js';
import {
  attachmentsFromMessage,
  delay,
  formatChannelRef,
  formatMessageLogBody,
  pickLogPreviewImage,
} from '../utils/messageLogFormat.js';
import { logEmbed, logError } from '../utils/logger.js';

const AUDIT_MATCH_MS = 10_000;
const AUDIT_STRICT_MS = 3500;
const AUDIT_POLL_MS = [400, 800, 1200];

/**
 * @param {import('discord.js').GuildAuditLogsEntry} entry
 */
function getAuditEntryChannelId(entry) {
  const extra = entry.extra;
  if (!extra || typeof extra !== 'object') return null;
  if ('channel' in extra && extra.channel && typeof extra.channel === 'object' && 'id' in extra.channel) {
    return String(extra.channel.id);
  }
  if ('channelId' in extra && extra.channelId) return String(extra.channelId);
  return null;
}

/**
 * @param {import('discord.js').GuildAuditLogs} logs
 * @param {string} channelId
 * @param {string | undefined} authorId
 */
function pickDeleterFromAuditLogs(logs, channelId, authorId) {
  const now = Date.now();
  /** @type {import('discord.js').GuildAuditLogsEntry[]} */
  const inChannel = [];

  for (const [, entry] of logs.entries) {
    if (now - entry.createdTimestamp > AUDIT_MATCH_MS) continue;

    const entryChannelId = getAuditEntryChannelId(entry);
    if (entryChannelId && entryChannelId !== channelId) continue;

    inChannel.push(entry);
  }

  if (authorId) {
    const forAuthor = inChannel.find((e) => e.targetId === authorId && e.executorId);
    if (forAuthor) return { userId: forAuthor.executorId, fromAudit: true };
  }

  const strict = inChannel.filter((e) => now - e.createdTimestamp <= AUDIT_STRICT_MS);
  if (strict.length === 1 && strict[0].executorId) {
    return { userId: strict[0].executorId, fromAudit: true };
  }

  return { userId: null, fromAudit: inChannel.length > 0 };
}

/**
 * @param {import('discord.js').Client} client
 * @param {import('discord.js').Message | import('discord.js').PartialMessage} message
 * @param {import('discord.js').GuildTextBasedChannel | import('discord.js').TextBasedChannel | null} [channelHint]
 */
async function resolveDeleteContext(client, message, channelHint = null) {
  let channel = channelHint ?? message.channel ?? null;
  if (channel?.partial) {
    channel = await channel.fetch().catch(() => channel);
  }

  const channelId = channel?.id ?? message.channelId;
  const guildId = message.guild?.id ?? channel?.guildId ?? message.guildId ?? null;
  if (!guildId || guildId !== config.guildId || !channelId) return null;

  let guild = message.guild ?? channel?.guild ?? client.guilds.cache.get(guildId) ?? null;
  if (!guild) {
    guild = await client.guilds.fetch(guildId).catch(() => null);
  }
  if (!guild) return null;

  return { guild, channelId, channel };
}

/**
 * @param {import('discord.js').Guild} guild
 * @param {string} channelId
 * @param {string | undefined} authorId
 */
async function resolveMessageDeleter(guild, channelId, authorId) {
  let sawAuditInChannel = false;

  for (const waitMs of AUDIT_POLL_MS) {
    await delay(waitMs);

    const logs = await guild
      .fetchAuditLogs({ type: AuditLogEvent.MessageDelete, limit: 25 })
      .catch(() => null);

    if (!logs) continue;

    const picked = pickDeleterFromAuditLogs(logs, channelId, authorId);
    if (picked.fromAudit) sawAuditInChannel = true;
    if (picked.userId) return { userId: picked.userId };
  }

  // Savo žinutę trinant Discord dažnai nekuria audit log — tada autorius = ištrynęs.
  // Jei audit log kanale buvo (mod trynė), imame tik iš audit, ne spėjam.
  if (authorId && !sawAuditInChannel) {
    return { userId: authorId };
  }

  return null;
}

/**
 * @param {{ userId: string }} deleter
 */
function formatDeleter(deleter) {
  return `<@${deleter.userId}>`;
}

/**
 * @param {import('discord.js').Client} client
 * @param {import('discord.js').Message | import('discord.js').PartialMessage} message
 * @param {{ userId: string } | null} [forcedDeleter]
 * @param {import('discord.js').GuildTextBasedChannel | import('discord.js').TextBasedChannel | null} [channelHint]
 */
async function logDeletedMessage(client, message, forcedDeleter = null, channelHint = null) {
  const ctx = await resolveDeleteContext(client, message, channelHint);
  if (!ctx) return;

  if (message.author?.bot || message.system || message.webhookId) return;

  const cached = getCachedMessage(message.id);
  const authorId = message.author?.id ?? cached?.authorId;
  const authorTag = message.author?.tag ?? cached?.authorTag ?? 'Nežinomas';
  const content = message.content ?? cached?.content ?? null;
  const attachments =
    cached?.attachments?.length
      ? cached.attachments
      : attachmentsFromMessage(message);

  forgetCachedMessage(message.id);

  try {
    const deleter =
      forcedDeleter ?? (await resolveMessageDeleter(ctx.guild, ctx.channelId, authorId));

    await logEmbed({
      title: 'Žinutė ištrinta',
      color: 0xed4245,
      image: pickLogPreviewImage(attachments) ?? undefined,
      fields: [
        {
          name: 'Autorius',
          value: authorId ? `<@${authorId}> (\`${authorTag}\`)` : `\`${authorTag}\``,
          inline: true,
        },
        {
          name: 'Kanalas',
          value: formatChannelRef({ channelId: ctx.channelId }),
          inline: true,
        },
        {
          name: 'Ištrynė',
          value: deleter ? formatDeleter(deleter) : '*(nežinoma)*',
          inline: true,
        },
        {
          name: 'Turinys',
          value: formatMessageLogBody(content, attachments),
          inline: false,
        },
      ],
    });
  } catch (e) {
    logError('messageDelete', 'Nepavyko užloginti ištrintos žinutės', e);
  }
}

/**
 * @param {import('discord.js').Client} client
 */
export function registerMessageDeleteLog(client) {
  client.on('messageDelete', async (message) => {
    await logDeletedMessage(client, message);
  });

  client.on('messageDeleteBulk', async (messages, channel) => {
    if (!channel.guildId || channel.guildId !== config.guildId) return;

    await delay(500);

    let bulkDeleter = null;
    const guild = channel.guild ?? (await client.guilds.fetch(channel.guildId).catch(() => null));
    if (guild) {
      const logs = await guild
        .fetchAuditLogs({ type: AuditLogEvent.MessageBulkDelete, limit: 5 })
        .catch(() => null);

      for (const [, entry] of logs?.entries ?? []) {
        if (Date.now() - entry.createdTimestamp > AUDIT_MATCH_MS) continue;
        if (!entry.executorId) continue;
        bulkDeleter = { userId: entry.executorId };
        break;
      }
    }

    for (const [, message] of messages) {
      if (message.author?.bot || message.system || message.webhookId) continue;
      await logDeletedMessage(client, message, bulkDeleter, channel);
    }
  });
}
