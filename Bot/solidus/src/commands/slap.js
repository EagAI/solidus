import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { loadModules } from '../modules/settings.js';
import { isAdminOrModerator } from '../utils/modCheck.js';

export const slapCommand = new SlashCommandBuilder()
  .setName('slap')
  .setDescription('Atsakyti į žinutę slap GIF ir duoti timeout')
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addStringOption((opt) =>
    opt.setName('messageid').setDescription('Žinutės ID').setRequired(true),
  );

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
export async function executeSlap(interaction) {
  const slap = loadModules().slap;
  if (!slap.enabled) {
    await interaction.reply({
      content: 'Slap modulis išjungtas panelėje.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const member = interaction.member;
  if (!member || typeof member === 'string' || !isAdminOrModerator(member)) {
    await interaction.reply({ content: 'Nepakanka teisių.', flags: MessageFlags.Ephemeral });
    return;
  }

  const messageId = interaction.options.getString('messageid', true).trim();
  const targetMessage = await interaction.channel?.messages.fetch(messageId).catch(() => null);
  if (!targetMessage || targetMessage.author.bot) {
    await interaction.reply({
      content: 'Žinutė nerasta šiame kanale.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  await targetMessage.reply({ content: slap.gifUrl || 'https://klipy.com/gifs/slap-13622' });

  const target = await interaction.guild?.members.fetch(targetMessage.author.id).catch(() => null);
  const ms = Math.max(1, Number(slap.timeoutMin) || 5) * 60 * 1000;
  if (target?.moderatable) {
    await target.timeout(ms, `Slap — ${interaction.user.tag}`);
  }

  await interaction.editReply({
    content: `${targetMessage.author} gavo slap (${slap.timeoutMin} min, −${slap.xpPenalty} XP).`,
  });
}
