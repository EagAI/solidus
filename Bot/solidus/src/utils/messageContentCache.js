import { config } from '../config.js';

const CACHE_MAX = 5000;

/** @typedef {{
 *   url: string,
 *   proxyURL: string | null,
 *   name: string,
 *   contentType: string | null,
 * }} CachedAttachment */

/** @type {Map<string, {
 *   content: string,
 *   authorId: string,
 *   authorTag: string,
 *   channelId: string,
 *   attachments: CachedAttachment[],
 * }>} */
const cache = new Map();

/**
 * @param {import('discord.js').Message} message
 * @returns {CachedAttachment[]}
 */
function collectAttachments(message) {
  return [...message.attachments.values()].map((attachment) => ({
    url: attachment.url,
    proxyURL: attachment.proxyURL ?? null,
    name: attachment.name ?? 'attachment',
    contentType: attachment.contentType ?? null,
  }));
}

/**
 * @param {import('discord.js').Message} message
 */
export function cacheMessageContent(message) {
  if (!message.guild || message.guild.id !== config.guildId) return;
  if (message.author?.bot || message.system || message.webhookId) return;

  const content = message.content ?? '';
  const attachments = collectAttachments(message);
  if (!content.trim() && attachments.length === 0) return;

  cache.set(message.id, {
    content,
    authorId: message.author.id,
    authorTag: message.author.tag,
    channelId: message.channelId,
    attachments,
  });

  if (cache.size > CACHE_MAX) {
    const oldest = cache.keys().next().value;
    cache.delete(oldest);
  }
}

/**
 * @param {string} messageId
 */
export function getCachedMessage(messageId) {
  return cache.get(messageId) ?? null;
}

/**
 * @param {string} messageId
 */
export function forgetCachedMessage(messageId) {
  cache.delete(messageId);
}

/**
 * @param {import('discord.js').Client} client
 */
export function registerMessageContentCache(client) {
  client.on('messageCreate', (message) => cacheMessageContent(message));
  client.on('messageUpdate', (_oldMessage, newMessage) => cacheMessageContent(newMessage));
}
