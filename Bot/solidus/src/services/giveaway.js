import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  formatEmoji,
} from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  THEME_ACCENT_COLOR,
  VERIFY_BULLET_EMOJI_ANIMATED,
  VERIFY_BULLET_EMOJI_ID,
  VERIFY_BULLET_EMOJI_NAME,
} from '../constants.js';
import { config } from '../config.js';
import {
  getGiveaway,
  loadGiveawayData,
  mutateGiveaway,
  saveGiveaway,
} from '../utils/giveawayStore.js';
import { logConsole, logError, logInfo } from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_GIVEAWAY_IMAGE_NAME = 'giveaway.png';
const DEFAULT_GIVEAWAY_IMAGE_PATH = path.join(__dirname, '..', 'img', DEFAULT_GIVEAWAY_IMAGE_NAME);

export const GIVEAWAY_MODAL_ID = 'giveaway:create';
export const GIVEAWAY_ENTER_PREFIX = 'giveaway:enter:';

const GIVEAWAY_HEADER = '🎁 **Naujas giveaway!**';

/** @param {boolean} [ended] */
export function buildGiveawayContent(ended = false) {
  const header = ended ? '🎁 ~~**Naujas giveaway!**~~' : GIVEAWAY_HEADER;
  return `@everyone ${header}`;
}

export const giveawayAllowedMentions = { parse: ['everyone'] };

const BULLET = formatEmoji({
  id: VERIFY_BULLET_EMOJI_ID,
  name: VERIFY_BULLET_EMOJI_NAME,
  animated: VERIFY_BULLET_EMOJI_ANIMATED,
});

/** @param {string} text */
function bulletLine(text) {
  return `${BULLET} ${text}`;
}

/** @param {string | null | undefined} imageUrl */
function resolveEmbedImageUrl(imageUrl) {
  if (imageUrl) return imageUrl;
  return `attachment://${DEFAULT_GIVEAWAY_IMAGE_NAME}`;
}

/** @param {string | null | undefined} imageUrl */
function buildGiveawayFiles(imageUrl) {
  if (imageUrl) return [];
  if (!fs.existsSync(DEFAULT_GIVEAWAY_IMAGE_PATH)) return [];
  return [new AttachmentBuilder(DEFAULT_GIVEAWAY_IMAGE_PATH, { name: DEFAULT_GIVEAWAY_IMAGE_NAME })];
}

/** @param {import('../utils/giveawayStore.js').GiveawayRecord} giveaway */
function buildGiveawayMessageParts(giveaway) {
  return {
    embeds: [buildGiveawayEmbed(giveaway)],
    files: buildGiveawayFiles(giveaway.imageUrl),
  };
}

/** @type {Map<string, ReturnType<typeof setTimeout>>} */
const endTimers = new Map();

/** Node/browser setTimeout max (~24.8 d.) — didesnė trukmė kitaip suveikia iškart */
const MAX_SETTIMEOUT_MS = 2_147_483_647;

/**
 * @param {import('../utils/giveawayStore.js').GiveawayRecord} giveaway
 */
export function buildGiveawayEmbed(giveaway) {
  const embed = new EmbedBuilder()
    .setColor(giveaway.ended ? 0x95a5a6 : THEME_ACCENT_COLOR)
    .setTitle(giveaway.title)
    .setTimestamp(giveaway.endsAt)
    .setImage(resolveEmbedImageUrl(giveaway.imageUrl));

  const lines = [
    bulletLine(`**Organizatorius:** <@${giveaway.hostId}>`),
    bulletLine(`**Laimėtojai:** ${giveaway.winnerCount}`),
    bulletLine(`**Dalyviai:** ${giveaway.entries.length}`),
  ];

  if (giveaway.ended) {
    lines.push(
      bulletLine(
        `**Rezultatas:** ${
          giveaway.winners.length
            ? giveaway.winners.map((id) => `<@${id}>`).join(', ')
            : 'Nėra dalyvių'
        }`,
      ),
    );
  } else {
    const ts = Math.floor(giveaway.endsAt / 1000);
    lines.push(bulletLine(`**Baigiasi:** <t:${ts}:R> (<t:${ts}:f>)`));
  }

  const parts = [];
  if (giveaway.description) parts.push(giveaway.description);
  parts.push(lines.join('\n'));

  embed.setDescription(parts.join('\n\n').slice(0, 4096));
  return embed;
}

/**
 * @param {string} giveawayId
 * @param {boolean} [ended]
 */
export function buildEnterButton(giveawayId, ended = false) {
  const button = new ButtonBuilder()
    .setCustomId(`${GIVEAWAY_ENTER_PREFIX}${giveawayId}`)
    .setDisabled(ended);

  if (ended) {
    button.setLabel('Baigėsi').setStyle(ButtonStyle.Secondary);
  } else {
    button.setLabel('Dalyvauti').setEmoji('🎉').setStyle(ButtonStyle.Success);
  }

  return new ActionRowBuilder().addComponents(button);
}

/**
 * @param {string[]} entries
 * @param {number} count
 * @param {string[]} [exclude]
 */
export function pickWinners(entries, count, exclude = []) {
  const excludeSet = new Set(exclude);
  let pool = [...new Set(entries)].filter((id) => !excludeSet.has(id));
  if (!pool.length) pool = [...new Set(entries)];

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
}

/**
 * @param {import('discord.js').Client} client
 * @param {string} giveawayId
 */
export async function endGiveaway(client, giveawayId) {
  const giveaway = getGiveaway(giveawayId);
  if (!giveaway || giveaway.ended) return null;

  const winners = pickWinners(giveaway.entries, giveaway.winnerCount);

  mutateGiveaway(giveawayId, (g) => {
    g.ended = true;
    g.winners = winners;
  });

  const updated = getGiveaway(giveawayId);
  if (!updated) return null;

  try {
    const channel = await client.channels.fetch(updated.channelId);
    if (channel?.isTextBased()) {
      const message = await channel.messages.fetch(updated.messageId);
      const parts = buildGiveawayMessageParts(updated);
      await message.edit({
        content: buildGiveawayContent(true),
        embeds: parts.embeds,
        files: parts.files,
        components: [buildEnterButton(giveawayId, true)],
        allowedMentions: giveawayAllowedMentions,
      });

      const winText =
        winners.length > 0
          ? `🎉 Sveikiname ${winners.map((id) => `<@${id}>`).join(', ')}!`
          : 'Giveaway baigtas — dalyvių nebuvo.';

      await channel.send({
        content: `**${updated.title}** baigtas.\n${winText}`,
        allowedMentions: { users: winners },
      });
    }
  } catch (e) {
    logError('giveaway', `Nepavyko atnaujinti giveaway ${giveawayId}`, e);
  }

  clearGiveawayTimer(giveawayId);
  logInfo('giveaway', `Baigtas giveaway **${updated.title}** — ${winners.length} laimėtojai`);
  return updated;
}

/**
 * @param {import('discord.js').Client} client
 * @param {string} giveawayId
 * @returns {Promise<{ giveaway: import('../utils/giveawayStore.js').GiveawayRecord, winners: string[] } | { error: string }>}
 */
export async function rerollGiveaway(client, giveawayId) {
  const giveaway = getGiveaway(giveawayId);
  if (!giveaway) return { error: 'Giveaway nerastas.' };
  if (!giveaway.ended) return { error: 'Giveaway dar nebaigtas — naudok `/giveaway end`.' };
  if (!giveaway.entries.length) return { error: 'Nėra dalyvių — reroll neįmanomas.' };

  const winners = pickWinners(giveaway.entries, giveaway.winnerCount, giveaway.winners);

  mutateGiveaway(giveawayId, (g) => {
    g.winners = winners;
  });

  const updated = getGiveaway(giveawayId);
  if (!updated) return { error: 'Nepavyko išsaugoti reroll rezultato.' };

  try {
    await refreshGiveawayMessage(client, giveawayId);

    const channel = await client.channels.fetch(updated.channelId);
    if (channel?.isTextBased()) {
      const winText =
        winners.length > 0
          ? `🔄 Nauji laimėtojai: ${winners.map((id) => `<@${id}>`).join(', ')}`
          : 'Reroll atliktas — laimėtojų nėra.';

      await channel.send({
        content: `**${updated.title}** — reroll.\n${winText}`,
        allowedMentions: { users: winners },
      });
    }
  } catch (e) {
    logError('giveaway', `Nepavyko reroll giveaway ${giveawayId}`, e);
    return { error: 'Nepavyko atnaujinti giveaway žinutės.' };
  }

  logInfo(
    'giveaway',
    `Reroll **${updated.title}** — ${winners.length} laimėtojai: ${winners.map((id) => `<@${id}>`).join(', ') || '—'}`,
  );

  return { giveaway: updated, winners };
}

/**
 * @param {import('discord.js').Client} client
 * @param {string} giveawayId
 */
export function scheduleGiveawayEnd(client, giveawayId) {
  clearGiveawayTimer(giveawayId);

  const giveaway = getGiveaway(giveawayId);
  if (!giveaway || giveaway.ended) return;

  const delay = giveaway.endsAt - Date.now();
  if (delay <= 0) {
    endGiveaway(client, giveawayId).catch((e) =>
      logError('giveaway', 'Automatinis giveaway pabaiga nepavyko', e),
    );
    return;
  }

  const waitMs = Math.min(delay, MAX_SETTIMEOUT_MS);
  const timer = setTimeout(() => {
    if (waitMs < delay) {
      scheduleGiveawayEnd(client, giveawayId);
      return;
    }
    endGiveaway(client, giveawayId).catch((e) =>
      logError('giveaway', 'Automatinis giveaway pabaiga nepavyko', e),
    );
  }, waitMs);

  endTimers.set(giveawayId, timer);
}

export function clearGiveawayTimer(giveawayId) {
  const timer = endTimers.get(giveawayId);
  if (timer) {
    clearTimeout(timer);
    endTimers.delete(giveawayId);
  }
}

/**
 * @param {import('discord.js').Client} client
 */
export function restoreActiveGiveawayTimers(client) {
  for (const giveaway of Object.values(loadGiveawayData().giveaways)) {
    if (!giveaway.ended) scheduleGiveawayEnd(client, giveaway.id);
  }
  logConsole('giveaway', 'Aktyvūs giveaway timeriai atkurti.');
}

/**
 * @param {import('discord.js').Client} client
 * @param {import('discord.js').User} host
 * @param {{
 *   title: string,
 *   description: string,
 *   imageUrl: string | null,
 *   winnerCount: number,
 *   endsAt: number,
 * }} input
 */
export async function createGiveaway(client, host, input) {
  const channel = await client.channels.fetch(config.giveawayChannelId);
  if (!channel?.isTextBased()) {
    throw new Error('Giveaway kanalas nerastas arba ne tekstinis.');
  }

  const id = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const endsAt = input.endsAt;

  const record = {
    id,
    messageId: '',
    channelId: channel.id,
    hostId: host.id,
    title: input.title,
    description: input.description,
    imageUrl: input.imageUrl,
    winnerCount: input.winnerCount,
    endsAt,
    entries: [],
    ended: false,
    winners: [],
  };

  const parts = buildGiveawayMessageParts(record);

  const msg = await channel.send({
    content: buildGiveawayContent(false),
    embeds: parts.embeds,
    files: parts.files,
    components: [buildEnterButton(id)],
    allowedMentions: giveawayAllowedMentions,
  });

  record.messageId = msg.id;
  saveGiveaway(record);
  scheduleGiveawayEnd(client, id);

  logInfo(
    'giveaway',
    `**${host.tag}** sukūrė giveaway **${input.title}** → <#${channel.id}>`,
  );

  return record;
}

/**
 * @param {string} raw
 */
export function parseImageUrl(raw) {
  const url = raw?.trim();
  if (!url) return null;
  if (!/^https?:\/\/.+/i.test(url)) return null;
  if (url.length > 2048) return null;
  return url;
}

/**
 * @param {string} raw
 */
export function parseWinnerCount(raw) {
  const n = parseInt(String(raw).trim(), 10);
  if (Number.isNaN(n) || n < 1 || n > 20) return null;
  return n;
}

/**
 * @param {Date} date
 * @param {number} months
 */
function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d.getTime();
}

/**
 * @param {number} endsAt
 * @returns {{ endsAt: number } | { error: string }}
 */
function validateEndsAt(endsAt) {
  if (Number.isNaN(endsAt)) {
    return { error: 'Nepavyko suprasti datos.' };
  }
  const minEnd = Date.now() + 60_000;
  const maxEnd = Date.now() + 365 * 24 * 60 * 60 * 1000;
  if (endsAt < minEnd) {
    return { error: 'Pabaiga turi būti bent po 1 minutės.' };
  }
  if (endsAt > maxEnd) {
    return { error: 'Pabaiga negali būti vėliau nei po 1 metų.' };
  }
  return { endsAt };
}

/**
 * min | 2d | 1m (mėnuo) | 2026-07-15 20:00 | 15.07.2026 20:00 | 60 (minutės)
 * @param {string} raw
 * @returns {{ endsAt: number } | { error: string }}
 */
export function parseGiveawayEndTime(raw) {
  const input = raw?.trim();
  if (!input) return { error: 'Trukmė arba data negali būti tuščia.' };

  let match = input.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (match) {
    const endsAt = new Date(
      +match[1],
      +match[2] - 1,
      +match[3],
      match[4] != null ? +match[4] : 23,
      match[5] != null ? +match[5] : 59,
      match[6] != null ? +match[6] : 0,
    ).getTime();
    return validateEndsAt(endsAt);
  }

  match = input.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:[ T](\d{1,2}):(\d{2}))?$/);
  if (match) {
    const endsAt = new Date(
      +match[3],
      +match[2] - 1,
      +match[1],
      match[4] != null ? +match[4] : 23,
      match[5] != null ? +match[5] : 59,
      0,
    ).getTime();
    return validateEndsAt(endsAt);
  }

  match = input.match(/^(\d+)\s*(?:min|mins|minutė|minutės|minutėms)$/i);
  if (match) {
    return validateEndsAt(Date.now() + +match[1] * 60_000);
  }

  match = input.match(/^(\d+)\s*h(?:val|ours)?$/i);
  if (match) {
    return validateEndsAt(Date.now() + +match[1] * 3_600_000);
  }

  match = input.match(/^(\d+)\s*d(?:ienos|ienų|ieną)?$/i);
  if (match) {
    return validateEndsAt(Date.now() + +match[1] * 86_400_000);
  }

  match = input.match(/^(\d+)\s*w(?:eeks|k)?$/i);
  if (match) {
    return validateEndsAt(Date.now() + +match[1] * 7 * 86_400_000);
  }

  match = input.match(/^(\d+)\s*m(?:ėn|enesio|ėnesių)?$/i);
  if (match) {
    return validateEndsAt(addMonths(new Date(), +match[1]));
  }

  if (/^\d+$/.test(input)) {
    return validateEndsAt(Date.now() + +input * 60_000);
  }

  return {
    error:
      'Formatas: `1min`, `2d`, `1m` (mėnuo), `2026-07-15 20:00` arba `15.07.2026 20:00`.',
  };
}

/**
 * @param {import('discord.js').Client} client
 * @param {string} giveawayId
 */
export async function refreshGiveawayMessage(client, giveawayId) {
  const giveaway = getGiveaway(giveawayId);
  if (!giveaway) return;

  const channel = await client.channels.fetch(giveaway.channelId);
  if (!channel?.isTextBased()) return;

  const message = await channel.messages.fetch(giveaway.messageId);
  const parts = buildGiveawayMessageParts(giveaway);
  await message.edit({
    content: buildGiveawayContent(giveaway.ended),
    embeds: parts.embeds,
    files: parts.files,
    components: [buildEnterButton(giveawayId, giveaway.ended)],
    allowedMentions: giveawayAllowedMentions,
  });
}
