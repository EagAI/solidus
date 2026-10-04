import { config } from '../config.js';
import { logError, logInfo } from '../utils/logger.js';

const WARN_DELETE_MS = 5000;

/**
 * @param {import('discord.js').Attachment} attachment
 */
function isImageAttachment(attachment) {
  if (attachment.contentType?.startsWith('image/')) return true;
  const name = attachment.name?.toLowerCase() ?? '';
  return /\.(png|jpe?g|gif|webp|bmp|avif)$/i.test(name);
}

/**
 * @param {import('discord.js').Message} message
 */
export function isValidMediaOnlyMessage(message) {
  if (message.stickers?.size > 0) return false;
  if (message.content?.trim()) return false;
  if (message.attachments.size === 0) return false;
  if (message.embeds.length > 0) return false;

  return [...message.attachments.values()].every(isImageAttachment);
}

/**
 * @param {import('discord.js').Message} message
 * @returns {boolean}
 */
export function isMediaOnlyChannel(message) {
  if (!config.mediaChannelIds?.length) return false;
  return config.mediaChannelIds.includes(message.channelId);
}

/**
 * @param {import('discord.js').Message} message
 * @returns {Promise<boolean>}
 */
export async function handleMediaOnlyViolation(message) {
  await message.delete().catch((e) => logError('mediaOnly', 'Nepavyko ištrinti žinutės', e));

  try {
    const warning = await message.channel.send({
      content: `<@${message.author.id}> čia tik media. nerašinėk.`,
      allowedMentions: { users: [message.author.id] },
    });

    setTimeout(() => {
      warning.delete().catch(() => {});
    }, WARN_DELETE_MS);
  } catch (e) {
    logError('mediaOnly', 'Nepavyko išsiųsti perspėjimo', e);
  }

  logInfo(
    'mediaOnly',
    `**${message.author.tag}**\n<@${message.author.id}>\n\nNe media žinutė → <#${message.channelId}>`,
  );

  return true;
}

/**
 * @param {import('discord.js').Message} message
 * @param {boolean} isMod
 * @returns {Promise<'valid' | 'violation' | 'skip'>}
 */
export async function enforceMediaOnlyChannel(message, isMod) {
  if (!isMediaOnlyChannel(message)) return 'skip';
  if (isMod) return 'skip';

  if (isValidMediaOnlyMessage(message)) return 'valid';

  await handleMediaOnlyViolation(message);
  return 'violation';
}
