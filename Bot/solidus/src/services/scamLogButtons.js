import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import { isModerator } from '../utils/modCheck.js';
import { logInfo } from '../utils/logger.js';

const PREFIX = 'scam:';

/**
 * @param {string} customId
 */
export function parseScamLogId(customId) {
  const parts = customId.split(':');
  if (parts.length < 4 || parts[0] !== 'scam') return null;
  const action = parts[1];
  const guildId = parts[2];
  const userId = parts[3];
  if (action !== 'ban' && action !== 'untimeout') return null;
  return { action, guildId, userId };
}

/**
 * @param {string} guildId
 * @param {string} userId
 */
export function buildScamLogRow(guildId, userId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`${PREFIX}ban:${guildId}:${userId}`)
      .setLabel('Užbaninti')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('🔨'),
    new ButtonBuilder()
      .setCustomId(`${PREFIX}untimeout:${guildId}:${userId}`)
      .setLabel('Nuimti laiko limitą')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('🔓'),
  );
}

/**
 * @param {import('discord.js').ButtonInteraction} interaction
 */
export async function handleScamLogButton(interaction) {
  if (!isModerator(interaction.member)) {
    await interaction.reply({
      content: 'Tik serverio moderatoriai gali naudoti šiuos mygtukus.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const parsed = parseScamLogId(interaction.customId);
  if (!parsed) {
    await interaction.reply({
      content: 'Neteisingi duomenys.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const { action, userId, guildId } = parsed;
  if (guildId !== interaction.guildId) {
    await interaction.reply({
      content: 'Netinkama serverio kontekstas.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (action === 'ban') {
    try {
      const member = await interaction.guild.members.fetch(userId).catch(() => null);
      if (member) {
        await member.ban({ reason: `Admin: ${interaction.user.tag} užblokavo` });
      } else {
        await interaction.guild.bans.create(userId, { reason: `Admin: ${interaction.user.tag} užblokavo` });
      }
      logInfo(
        'admin',
        `**${interaction.user.tag}** užblokavo narį\n<@${userId}>`,
      );
    } catch (e) {
      await interaction.reply({
        content: `Nepavyko užbaninti: ${e?.message || e}`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
  }

  if (action === 'untimeout') {
    const member = await interaction.guild.members.fetch(userId).catch(() => null);
    if (!member) {
      await interaction.reply({
        content: 'Narys nerastas (gal paliko serverį).',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    try {
      await member.timeout(null, `Laiko limitas nuimtas: ${interaction.user.tag}`);
      logInfo(
        'admin',
        `**${interaction.user.tag}** nuėmė laiko limitą\n<@${userId}>`,
      );
    } catch (e) {
      await interaction.reply({
        content: `Nepavyko nuimti laiko limito: ${e?.message || e}`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
  }

  const statusLabel = action === 'ban' ? 'Užbaninta' : 'Laiko limitas nuimtas';
  const doneRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('scam:done:0')
      .setLabel(`${statusLabel} — ${interaction.user.tag}`.slice(0, 80))
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
  );

  try {
    await interaction.update({ components: [doneRow] });
  } catch {
    await interaction.message.edit({ components: [doneRow] }).catch(() => {});
  }
}
