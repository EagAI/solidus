import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { loadModules } from '../modules/settings.js';
import { ticketPanelPayload } from '../services/tickets.js';
import { isAdminOrModerator } from '../utils/modCheck.js';

export const ticketCommand = new SlashCommandBuilder()
  .setName('ticket')
  .setDescription('Išsiųsti tiketų skydelį į šį kanalą')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export async function executeTicket(interaction) {
  if (!loadModules().tickets.enabled) {
    await interaction.reply({
      content: 'Tiketai išjungti panelėje.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const member = interaction.member;
  if (!member || typeof member === 'string' || !isAdminOrModerator(member)) {
    await interaction.reply({ content: 'Nepakanka teisių.', flags: MessageFlags.Ephemeral });
    return;
  }

  if (!interaction.channel?.isTextBased()) {
    await interaction.reply({ content: 'Tik teksto kanale.', flags: MessageFlags.Ephemeral });
    return;
  }

  await interaction.channel.send(ticketPanelPayload());
  await interaction.reply({ content: 'Tiketų skydelis išsiųstas.', flags: MessageFlags.Ephemeral });
}
