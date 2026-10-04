import { EmbedBuilder } from 'discord.js';
import { config } from '../config.js';
import { EMBED_COLOR } from '../constants.js';

/** @type {import('discord.js').Client | null} */
let logClient = null;

/** @type {Record<string, number>} */
const TAG_COLORS = {
  trikampainis: 0x57f287,
  memberJoin: 0x5865f2,
  memberLeave: 0x95a5a6,
  verify: 0x5865f2,
  youtube: 0xff0000,
  admin: 0x9b59b6,
  antiscam: 0xe67e22,
  antiInvite: 0xe74c3c,
  voice: 0x3498db,
  presence: 0x95a5a6,
  xp: 0xf26522,
  giveaway: 0xf26522,
  parukom: 0xf26522,
  messageEdit: 0x7289da,
  messageDelete: 0xed4245,
};

/** @type {Record<string, string>} */
const TAG_LABELS = {
  trikampainis: 'Botas',
  memberJoin: 'Prisijungimas',
  memberLeave: 'Išėjimas',
  verify: 'Patvirtinimas',
  youtube: 'YouTube',
  admin: 'Moderacija',
  antiscam: 'Antiscam',
  antiInvite: 'Anti-invite',
  voice: 'Balsas',
  presence: 'Statusas',
  xp: 'Lygiai',
  giveaway: 'Giveaway',
  parukom: 'Parukom',
  messageEdit: 'Redagavimas',
  messageDelete: 'Ištrynimas',
};

/**
 * @param {import('discord.js').Client} client
 */
export function initLogClient(client) {
  logClient = client;
}

/**
 * @param {string} tag
 * @param {string} message
 */
function formatLine(tag, message) {
  return `[${tag}] ${message}`;
}

/**
 * @param {string} tag
 * @param {string} message
 * @param {number} [color]
 */
function buildEmbed(tag, message, color) {
  return new EmbedBuilder()
    .setColor(color ?? TAG_COLORS[tag] ?? EMBED_COLOR)
    .setTitle(TAG_LABELS[tag] ?? tag)
    .setDescription(message.slice(0, 4096))
    .setTimestamp();
}

/**
 * @param {import('discord.js').MessageCreateOptions} payload
 */
async function postLog(payload) {
  if (!logClient || !config.logsChannelId) return;
  try {
    const ch = await logClient.channels.fetch(config.logsChannelId);
    if (!ch?.isTextBased()) return;
    await ch.send(payload);
  } catch (e) {
    console.error('[logger] Nepavyko siųsti į log kanalą:', e?.message || e);
  }
}

/**
 * @param {string} tag
 * @param {string} message
 * @param {{ discord?: boolean }} [opts]
 */
export function logInfo(tag, message, opts = {}) {
  const { discord = true } = opts;
  const line = formatLine(tag, message);
  console.log(line);
  if (!discord) return;
  postLog({ embeds: [buildEmbed(tag, message)] }).catch(() => {});
}

/**
 * Tik konsolė — ne siunčiama į Discord log kanalą.
 * @param {string} tag
 * @param {string} message
 */
export function logConsole(tag, message) {
  logInfo(tag, message, { discord: false });
}

/**
 * @param {string} tag
 * @param {string} message
 */
export function logWarn(tag, message) {
  const line = formatLine(tag, message);
  console.warn(line);
  postLog({ embeds: [buildEmbed(tag, message, 0xfaa61a)] }).catch(() => {});
}

/**
 * @param {string} tag
 * @param {string} message
 * @param {unknown} [err]
 */
export function logError(tag, message, err) {
  const extra = err?.stack || err?.message || (err ? String(err) : '');
  const line = extra ? `${formatLine(tag, message)} ${extra}` : formatLine(tag, message);
  console.error(line);

  const desc = [
    message,
    extra ? `\`\`\`${String(extra).slice(0, 3500)}\`\`\`` : '',
  ]
    .filter(Boolean)
    .join('\n')
    .slice(0, 4096);

  postLog({ embeds: [buildEmbed(tag, desc || message, 0xed4245)] }).catch(() => {});
}

/**
 * @param {object} opts
 * @param {string} opts.title
 * @param {string} [opts.description]
 * @param {import('discord.js').APIEmbedField[]} [opts.fields]
 * @param {number} [opts.color]
 * @param {string} [opts.image]
 */
export async function logEmbed({ title, description, fields = [], color = EMBED_COLOR, image }) {
  const line = description ? `${title} — ${description}` : title;
  console.log(`[log] ${line}`);

  if (!logClient) return;

  const embed = new EmbedBuilder().setColor(color).setTitle(title).setTimestamp();
  if (description) embed.setDescription(description.slice(0, 4096));
  if (fields.length) embed.addFields(fields);
  if (image) embed.setImage(image);
  await postLog({ embeds: [embed] });
}
