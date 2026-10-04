export const MESSAGE_LOG_FIELD_MAX = 1000;

/**
 * @param {string | null | undefined} text
 */
export function formatMessageContent(text) {
  const trimmed = text?.trim();
  if (!trimmed) return '*(tuščia)*';
  if (trimmed.length <= MESSAGE_LOG_FIELD_MAX) return trimmed;
  return `${trimmed.slice(0, MESSAGE_LOG_FIELD_MAX - 1)}…`;
}

/**
 * Embed logams — inline ` arba ``` code block.
 * @param {string | null | undefined} text
 */
export function formatMessageContentCode(text) {
  const trimmed = text?.trim();
  if (!trimmed) return '*(tuščia)*';

  const maxInner = MESSAGE_LOG_FIELD_MAX - 8;
  let content = trimmed;
  if (content.length > maxInner) {
    content = `${content.slice(0, maxInner - 1)}…`;
  }

  if (!content.includes('\n') && !content.includes('`')) {
    return `\`${content}\``;
  }

  const fence = content.includes('```') ? '````' : '```';
  return `${fence}\n${content}\n${fence}`;
}

/**
 * @param {{ guildId?: string | null, channelId?: string | null, id?: string | null }} ref
 */
export function buildMessageUrl(ref) {
  if (!ref.guildId || !ref.channelId || !ref.id) return null;
  return `https://discord.com/channels/${ref.guildId}/${ref.channelId}/${ref.id}`;
}

/**
 * @param {{ channelId?: string | null, channel?: { isDMBased?: () => boolean } | null }} ref
 */
export function formatChannelRef(ref) {
  if (ref.channel?.isDMBased?.()) return 'DM';
  if (ref.channelId) return `<#${ref.channelId}>`;
  return '—';
}

/**
 * @param {number} ms
 */
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @param {{ url: string, name?: string, contentType?: string | null }[]} attachments
 */
export function formatAttachmentsForLog(attachments) {
  if (!attachments?.length) return null;

  return attachments
    .map((attachment, index) => {
      const label = attachment.name?.trim() || `attachment-${index + 1}`;
      const type = attachment.contentType ? ` (${attachment.contentType})` : '';
      return `[${label}](${attachment.url})${type}`;
    })
    .join('\n')
    .slice(0, MESSAGE_LOG_FIELD_MAX);
}

/**
 * @param {string | null | undefined} content
 * @param {{ url: string, name?: string, contentType?: string | null, proxyURL?: string | null }[]} [attachments]
 */
export function formatMessageLogBody(content, attachments = []) {
  const parts = [];
  const trimmed = content?.trim();

  if (trimmed) {
    parts.push(formatMessageContentCode(trimmed));
  }

  const attachmentText = formatAttachmentsForLog(attachments);
  if (attachmentText) {
    parts.push(attachmentText);
  }

  if (!parts.length) return '*(tuščia)*';
  return parts.join('\n\n');
}

/**
 * @param {{ url: string, proxyURL?: string | null, contentType?: string | null, name?: string }[]} attachments
 * @returns {string | null}
 */
export function pickLogPreviewImage(attachments) {
  for (const attachment of attachments) {
    if (attachment.contentType?.startsWith('image/')) {
      return attachment.proxyURL ?? attachment.url;
    }
    const name = attachment.name?.toLowerCase() ?? '';
    if (/\.(png|jpe?g|gif|webp|bmp|avif)$/i.test(name)) {
      return attachment.proxyURL ?? attachment.url;
    }
  }
  return null;
}

/**
 * @param {import('discord.js').Message | import('discord.js').PartialMessage} message
 * @returns {{ url: string, proxyURL: string | null, name: string, contentType: string | null }[]}
 */
export function attachmentsFromMessage(message) {
  if (!message.attachments?.size) return [];

  return [...message.attachments.values()].map((attachment) => ({
    url: attachment.url,
    proxyURL: attachment.proxyURL ?? null,
    name: attachment.name ?? 'attachment',
    contentType: attachment.contentType ?? null,
  }));
}
