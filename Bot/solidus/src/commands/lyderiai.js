import { AttachmentBuilder, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { getTopUsers } from '../services/xp.js';
import { buildLeaderboardImage } from '../utils/leaderboardImage.js';
import { logError } from '../utils/logger.js';

export const lyderiaiCommand = new SlashCommandBuilder()
  .setName('lyderiai')
  .setDescription('Top 15 narių pagal XP (grafika)');

/** @type {import('discord.js').ChatInputCommandInteraction} */
export async function executeLyderiai(interaction) {
  await interaction.deferReply();

  try {
    const rows = getTopUsers(15);
    const buffer = await buildLeaderboardImage(
      interaction.guild,
      interaction.client,
      rows,
    );
    const attachment = new AttachmentBuilder(buffer, { name: 'lyderiai.png' });
    await interaction.editReply({ files: [attachment] });
  } catch (e) {
    logError('xp', 'Nepavyko sugeneruoti lyderių lentelės', e);
    await interaction.editReply({ content: 'Nepavyko sugeneruoti lyderių lentelės.' });
  }
}
