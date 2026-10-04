import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import { createParukomPost } from '../services/parukom.js';
import { isAdminOrModerator } from '../utils/modCheck.js';
import { logError } from '../utils/logger.js';
import { loadModules } from '../modules/settings.js';

export const parukomCommand = new SlashCommandBuilder()
  .setName('parukom')
  .setDescription('PARUMOK? — paleisti rūkalio kvietimą šiame kanale');

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
export async function executeParukom(interaction) {
  if (!loadModules().parukom.enabled) {
    await interaction.reply({
      content: 'Parukom modulis išjungtas panelėje.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (!interaction.guild || !interaction.channel?.isTextBased()) {
    await interaction.reply({
      content: 'Šią komandą galima naudoti tik teksto kanale.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const member = interaction.member;
  if (!member || typeof member === 'string' || !isAdminOrModerator(member)) {
    await interaction.reply({
      content: 'Tik administratoriai arba moderatoriai gali naudoti `/parukom`.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    await createParukomPost(interaction);
    await interaction.editReply({ content: 'Parukom paleistas šiame kanale.' });
  } catch (e) {
    logError('parukom', 'Nepavyko paleisti /parukom', e);
    await interaction.editReply({ content: 'Nepavyko paleisti. Patikrink boto teises šiame kanale.' });
  }
}
