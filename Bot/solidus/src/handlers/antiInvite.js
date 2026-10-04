import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { config } from '../config.js';
import { findDiscordInviteLinks } from '../utils/inviteDetect.js';
import { buildScamLogRow } from '../services/scamLogButtons.js';
import { logError, logInfo, logWarn } from '../utils/logger.js';

const EXCEPTION_PREFIX = 'antiinv:exception:';

/**
 * @param {import('discord.js').Client} client
 * @param {import('discord.js').Message} message
 * @param {string[]} links
 */
async function postAdminActionLog(client, message, links) {
  const logCh = await client.channels.fetch(config.adminActionsChannelId);
  if (!logCh?.isTextBased()) {
    logWarn('antiInvite', 'Admin kanalas nerastas.');
    return;
  }

  const userId = message.author.id;
  const channelRef = `<#${message.channelId}>`;
  const timeoutHours = Math.round(config.inviteTimeoutMs / 3_600_000);

  const embed = new EmbedBuilder()
    .setColor(0xff3030)
    .setTitle('Discord pakvietimo nuoroda')
    .setTimestamp()
    .addFields(
      { name: 'Narys', value: `<@${userId}> (\`${userId}\`)`, inline: true },
      { name: 'Kanalas', value: channelRef, inline: true },
      { name: 'Laiko limitas', value: `${timeoutHours} val.`, inline: true },
      { name: 'Nuorodos', value: links.join('\n').slice(0, 1024) || '—', inline: false },
    );

  if (message.author.displayAvatarURL) {
    embed.setThumbnail(message.author.displayAvatarURL({ dynamic: true }));
  }

  const modRow = buildScamLogRow(message.guildId, userId);
  const exceptionBtn = new ButtonBuilder()
    .setCustomId(`${EXCEPTION_PREFIX}${message.guildId}:${userId}`)
    .setLabel('Leisti 24 val.')
    .setStyle(ButtonStyle.Success);

  modRow.addComponents(exceptionBtn);

  await logCh.send({ embeds: [embed], components: [modRow] });
}

/**
 * @param {import('discord.js').Client} client
 * @param {import('discord.js').Message} message
 * @returns {Promise<boolean>}
 */
export async function handleAntiInvite(client, message) {
  if (!message.guild || message.guild.id !== config.guildId) return false;
  if (message.author.bot || message.system) return false;

  const links = findDiscordInviteLinks(message.content);
  if (!links.length) return false;

  const userId = message.author.id;

  await message.delete().catch((e) => logError('antiInvite', 'Nepavyko ištrinti žinutės', e));

  try {
    const member = await message.guild.members.fetch(userId);
    await member.timeout(
      config.inviteTimeoutMs,
      `Discord pakvietimo nuoroda kanale ${message.channel.name}`,
    );
  } catch (e) {
    logError('antiInvite', 'Nepavyko taikyti laiko limito', e);
  }

  try {
    await postAdminActionLog(client, message, links);
    logInfo(
      'antiInvite',
      `**${message.author.tag}**\n<@${userId}>\n\n• Kanalas: <#${message.channelId}>\n• Nuorodos: ${links.length}\n• Taikytas laiko limitas`,
    );
  } catch (e) {
    logError('antiInvite', 'Nepavyko siųsti admin pranešimo', e);
  }

  return true;
}

export { EXCEPTION_PREFIX };
