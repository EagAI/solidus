import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
} from 'discord.js';
import { randomUUID } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  CUSTOM_ID,
  PARUKOM_DURATION_MS,
  THEME_ACCENT_COLOR,
} from '../constants.js';
import { config } from '../config.js';
import { loadModules } from '../modules/settings.js';
import { addXp } from './xp.js';
import { announceLevelUp } from './levelUp.js';
import { resolveMemberDisplayName } from '../utils/memberName.js';
import {
  createParukomSession,
  getActiveParukomSessions,
  getParukomSession,
  mutateParukomSession,
} from '../utils/parukomStore.js';
import { logConsole, logError } from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PARUKOM_IMAGE_PATH = path.join(__dirname, '..', '..', 'assets', 'parukom.webp');
const IMAGE_NAME = 'parukom.webp';

/** @type {Map<string, ReturnType<typeof setTimeout>>} */
const endTimers = new Map();

/**
 * @param {string} sessionId
 */
export function parukomButtonId(sessionId) {
  return `${CUSTOM_ID.PARUKOM_PREFIX}${sessionId}`;
}

/**
 * @param {string} customId
 * @returns {string | null}
 */
export function parseParukomSessionId(customId) {
  if (!customId.startsWith(CUSTOM_ID.PARUKOM_PREFIX)) return null;
  return customId.slice(CUSTOM_ID.PARUKOM_PREFIX.length) || null;
}

/**
 * @param {import('../utils/parukomStore.js').ParukomEntry[]} entries
 * @returns {[string, string]}
 */
function splitColumns(entries) {
  if (entries.length === 0) return ['', ''];
  const mid = Math.ceil(entries.length / 2);
  const left = entries.slice(0, mid).map((e) => e.name).join('\n');
  const right = entries.slice(mid).map((e) => e.name).join('\n');
  return [left || '\u200b', right || '\u200b'];
}

/**
 * @param {import('../utils/parukomStore.js').ParukomSession} session
 * @param {{ ended?: boolean }} [opts]
 */
export function buildParukomMessage(session, opts = {}) {
  const ended = opts.ended ?? session.ended ?? Date.now() >= session.endsAt;
  const embed = new EmbedBuilder()
    .setColor(THEME_ACCENT_COLOR)
    .setTitle('PARUKOM?')
    .setImage(`attachment://${IMAGE_NAME}`)
    .setFooter({ text: 'Nori rukaliai roles? Susisiek!' });

  if (session.entries.length > 0) {
    const [left, right] = splitColumns(session.entries);
    embed.setDescription('**Rukantys:**');
    embed.addFields(
      { name: '\u200b', value: left.slice(0, 1024), inline: true },
      { name: '\u200b', value: right.slice(0, 1024), inline: true },
    );
  }

  const button = new ButtonBuilder()
    .setCustomId(parukomButtonId(session.id))
    .setLabel('Parukom')
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(ended);

  const row = new ActionRowBuilder().addComponents(button);
  const file = new AttachmentBuilder(PARUKOM_IMAGE_PATH, { name: IMAGE_NAME });

  const roleId = loadModules().parukom.roleId || config.rukaliaiRoleId;

  return {
    content: `<@&${roleId}>`,
    embeds: [embed],
    components: [row],
    files: [file],
    allowedMentions: { roles: [roleId] },
  };
}

/**
 * @param {import('discord.js').Client} client
 * @param {string} sessionId
 */
async function refreshParukomMessage(client, sessionId) {
  const session = getParukomSession(sessionId);
  if (!session?.messageId) return;

  const channel = await client.channels.fetch(session.channelId).catch(() => null);
  if (!channel?.isTextBased() || !('messages' in channel)) return;

  const msg = await channel.messages.fetch(session.messageId).catch(() => null);
  if (!msg) return;

  const payload = buildParukomMessage(session);
  await msg.edit({
    content: payload.content,
    embeds: payload.embeds,
    components: payload.components,
    files: payload.files,
    allowedMentions: payload.allowedMentions,
  });
}

/**
 * @param {import('discord.js').Client} client
 * @param {string} sessionId
 */
async function endParukomSession(client, sessionId) {
  const timer = endTimers.get(sessionId);
  if (timer) {
    clearTimeout(timer);
    endTimers.delete(sessionId);
  }

  const session = mutateParukomSession(sessionId, (s) => {
    s.ended = true;
  });
  if (!session) return;

  try {
    await refreshParukomMessage(client, sessionId);
  } catch (e) {
    logError('parukom', 'Nepavyko uždaryti sesijos žinutės', e);
  }
  logConsole('parukom', `Sesija ${sessionId.slice(0, 8)} baigta (${session.entries.length} rūkalių)`);
}

/**
 * @param {import('discord.js').Client} client
 * @param {string} sessionId
 * @param {number} ms
 */
function scheduleParukomEnd(client, sessionId, ms) {
  const prev = endTimers.get(sessionId);
  if (prev) clearTimeout(prev);

  const timer = setTimeout(() => {
    endTimers.delete(sessionId);
    endParukomSession(client, sessionId).catch((e) => {
      logError('parukom', 'Timer end klaida', e);
    });
  }, Math.max(0, ms));

  endTimers.set(sessionId, timer);
}

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
export async function createParukomPost(interaction) {
  const sessionId = randomUUID();
  const endsAt = Date.now() + PARUKOM_DURATION_MS;

  const session = createParukomSession({
    id: sessionId,
    messageId: '',
    channelId: interaction.channelId,
    hostId: interaction.user.id,
    endsAt,
  });

  const payload = buildParukomMessage(session);
  const msg = await interaction.channel.send(payload);

  mutateParukomSession(sessionId, (s) => {
    s.messageId = msg.id;
  });

  scheduleParukomEnd(interaction.client, sessionId, PARUKOM_DURATION_MS);
  logConsole(
    'parukom',
    `**${interaction.user.tag}** paleido /parukom → <#${interaction.channelId}>`,
  );

  return sessionId;
}

/**
 * @param {import('discord.js').ButtonInteraction} interaction
 * @param {string} sessionId
 */
export async function handleParukomPress(interaction, sessionId) {
  // Discord laukia ack per 3s. Embedo atnaujinimas su nuotrauka trunka ilgiau —
  // jei reply daromas po to, tokenas jau negalioja (10062 Unknown interaction).
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const session = getParukomSession(sessionId);
  if (!session) {
    await interaction.editReply({ content: 'Sesija neberasta.' });
    return;
  }

  if (session.ended || Date.now() >= session.endsAt) {
    if (!session.ended) {
      await endParukomSession(interaction.client, sessionId);
    }
    await interaction.editReply({ content: 'Parukom jau pasibaigė.' });
    return;
  }

  if (session.entries.some((e) => e.userId === interaction.user.id)) {
    await interaction.editReply({ content: 'Jau parūkei.' });
    return;
  }

  const member =
    interaction.member && typeof interaction.member !== 'string'
      ? interaction.member
      : await interaction.guild.members.fetch(interaction.user.id);

  const name = resolveMemberDisplayName(member);

  let added = false;
  mutateParukomSession(sessionId, (s) => {
    if (s.ended || s.entries.some((e) => e.userId === interaction.user.id)) return;
    s.entries.push({ userId: interaction.user.id, name });
    added = true;
  });

  if (!added) {
    await interaction.editReply({ content: 'Jau parūkei.' });
    return;
  }

  const moduleXp = loadModules().parukom.xp;
  const xpResult = addXp(member, Number.isFinite(moduleXp) ? moduleXp : config.rukaliaiGivenXp);
  if (xpResult.announceLevel) {
    announceLevelUp(interaction.client, member, xpResult.announceLevel, {
      milestone: xpResult.milestoneLevelUp,
    }).catch((e) => logError('parukom', 'Level-up announce klaida', e));
  }

  await refreshParukomMessage(interaction.client, sessionId);
  await interaction.editReply({ content: 'Prisijungei parūkyti su visais.' });
}

/**
 * @param {import('discord.js').Client} client
 */
export function restoreActiveParukomTimers(client) {
  const sessions = getActiveParukomSessions();
  for (const session of sessions) {
    const remaining = session.endsAt - Date.now();
    if (remaining <= 0) {
      endParukomSession(client, session.id).catch(() => {});
      continue;
    }
    scheduleParukomEnd(client, session.id, remaining);
    logConsole(
      'parukom',
      `Atkurta sesija ${session.id.slice(0, 8)} (${Math.ceil(remaining / 1000)}s)`,
    );
  }
}
