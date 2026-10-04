import { EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { ocrImage } from '../antiscam/ocrImage.js';
import { scoreText } from '../antiscam/scoreText.js';
import { config } from '../config.js';
import { isModerator } from '../utils/modCheck.js';
import { buildScamLogRow } from './scamLogButtons.js';
import { logError, logInfo, logWarn } from '../utils/logger.js';

const MAX_LOG_FILES = 10;

/** @type {Map<string, number>} */
const recentScamAlerts = new Map();

function scamAlertKey(guildId, userId) {
  return `${guildId}:${userId}`;
}

function claimScamAlert(guildId, userId) {
  const key = scamAlertKey(guildId, userId);
  const now = Date.now();
  const last = recentScamAlerts.get(key);
  if (last != null && now - last < config.scamAlertCooldownMs) {
    return false;
  }
  recentScamAlerts.set(key, now);
  if (recentScamAlerts.size > 2000) {
    for (const [k, ts] of recentScamAlerts) {
      if (now - ts >= config.scamAlertCooldownMs) recentScamAlerts.delete(k);
    }
  }
  return true;
}

/**
 * @param {import('discord.js').GuildMember} member
 */
async function applyScamTimeout(member) {
  try {
    await member.timeout(
      config.scamTimeoutMs,
      'Automatinis antiscam (OCR) — įtartinas paveikslas',
    );
  } catch (e) {
    if (e?.code === 50013) {
      logWarn(
        'antiscam',
        'Nėra teisių „Tildyti narius“ arba narys aukštesnis už botą.',
      );
    } else {
      logError('antiscam', 'Laiko limito taikymas nepavyko', e);
    }
  }
}

/**
 * @param {import('discord.js').Message} message
 */
async function deleteScamMessage(message) {
  try {
    await message.delete();
  } catch (e) {
    if (e?.code === 50013) {
      logWarn('antiscam', 'Nepavyko ištrinti žinutės — reikia „Valdyti žinutes“.');
    } else {
      logError('antiscam', 'Nepavyko ištrinti žinutės', e);
    }
  }
}

/**
 * @param {import('discord.js').Message} message
 * @returns {Promise<boolean>} true jei apdorota (hit)
 */
export async function handleAntiScam(message) {
  if (!config.scamScanEnabled) return false;
  if (!message.guild || message.guild.id !== config.guildId) return false;
  if (message.author.bot || message.system) return false;
  if (message.webhookId) return false;

  if (config.scamScanChannelIds && !config.scamScanChannelIds.includes(message.channelId)) {
    return false;
  }

  try {
    const member = await message.guild.members.fetch(message.author.id);
    if (isModerator(member)) return false;
  } catch {
    /* skenuoti toliau */
  }

  const imageAttachments = message.attachments.filter((att) => {
    const mime = (att.contentType ?? '').split(';')[0].trim().toLowerCase();
    return mime.startsWith('image/') && mime !== 'image/gif' && att.size > 0;
  });

  if (imageAttachments.size === 0) return false;

  let anyTriggered = false;
  let bestScore = 0;
  const allReasons = new Set();

  for (const [, att] of imageAttachments) {
    let text;
    try {
      text = await ocrImage(att.url, att.contentType, att.size);
    } catch (err) {
      logError('antiscam', 'OCR klaida', err);
      continue;
    }
    if (!text) continue;
    const { score, reasons, triggered } = scoreText(text);
    if (triggered) anyTriggered = true;
    if (score > bestScore) bestScore = score;
    for (const r of reasons) allReasons.add(r);
  }

  if (!anyTriggered) return false;

  const member = message.member;
  if (!member) return false;

  const postAlert = claimScamAlert(message.guildId, message.author.id);

  await applyScamTimeout(member);

  if (!postAlert) {
    await deleteScamMessage(message);
    logInfo(
      'antiscam',
      `**${message.author.tag}**\n<@${message.author.id}>\n\nSukčiavimo hit (admin embed neišsiųstas).`,
    );
    return true;
  }

  const reasonList = allReasons.size
    ? [...allReasons].map((r) => `• ${r}`).join('\n')
    : '• Įtartina';

  const logCh = await message.client.channels.fetch(config.adminActionsChannelId);
  if (!logCh?.isTextBased()) {
    logError('antiscam', 'Admin kanalas nerastas.');
  }

  const files = [];
  let idx = 0;
  for (const [, att] of imageAttachments) {
    if (idx >= MAX_LOG_FILES) break;
    try {
      const res = await fetch(att.url);
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      const ext = att.name?.includes('.') ? att.name.split('.').pop() : 'png';
      files.push(new AttachmentBuilder(buf, { name: `scam-${message.id}-${idx + 1}.${ext}` }));
      idx++;
    } catch (err) {
      logError('antiscam', 'Nepavyko atsisiųsti priedo', err);
    }
  }

  const jump =
    message.url ||
    `https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}`;

  const embed = new EmbedBuilder()
    .setColor(0xff6600)
    .setTitle('Sukčiavimo įtartino paveikslo nuskaitymas')
    .setDescription(
      'Narys gavo **laiko limitą** (galima koreguoti / nuimti žemiau). ' +
        'Nuotraukos žemiau = nukopijuoti priedai; **kanalo žinutė ištrinta**.',
    )
    .addFields(
      { name: 'Narys', value: `${message.author} (\`${message.author.id}\`)`, inline: true },
      { name: 'Kanalas', value: `${message.channel}`, inline: true },
      {
        name: 'Originali žinutė',
        value: `ID: \`${message.id}\`\n[Prieš trinant](${jump}) — dabar nebegalioja, nes ištrinta.`,
        inline: false,
      },
      { name: 'Signalai', value: reasonList.slice(0, 1024) || '—', inline: false },
      {
        name: 'Balas',
        value: `**${bestScore}** / slenkstis **${config.scamScoreThreshold}**`,
        inline: true,
      },
    )
    .setFooter({ text: 'Automatinis skenavimas — gali klysti. Naudokite mygtukus atsargiai.' })
    .setTimestamp();

  if (imageAttachments.size > MAX_LOG_FILES) {
    embed.addFields({
      name: 'Pastaba',
      value: `Rodyta tik pirmi ${MAX_LOG_FILES} priedai iš ${imageAttachments.size}.`,
      inline: false,
    });
  }

  const row = buildScamLogRow(message.guildId, message.author.id);

  if (logCh?.isTextBased()) {
    try {
      await logCh.send({ embeds: [embed], files, components: [row] });
      logInfo(
        'antiscam',
        `**${message.author.tag}**\n<@${message.author.id}>\n\n• Kanalas: <#${message.channelId}>\n• Balas: **${bestScore}**`,
      );
    } catch (e) {
      if (e?.code === 50013) {
        logWarn('antiscam', 'Admin kanale nėra teisių siųsti žinutes / priedus.');
      } else {
        logError('antiscam', 'Siuntimas į admin kanalą nepavyko', e);
      }
    }
  }

  await deleteScamMessage(message);
  return true;
}
