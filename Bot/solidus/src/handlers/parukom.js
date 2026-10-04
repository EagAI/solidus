import { MessageFlags } from 'discord.js';
import { config } from '../config.js';
import { handleParukomPress, parseParukomSessionId } from '../services/parukom.js';
import { logError } from '../utils/logger.js';

/**
 * @param {import('discord.js').Client} client
 */
export function registerParukom(client) {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton() || !interaction.guild) return;
    if (interaction.guild.id !== config.guildId) return;

    const sessionId = parseParukomSessionId(interaction.customId);
    if (!sessionId) return;

    try {
      await handleParukomPress(interaction, sessionId);
    } catch (e) {
      if (e?.code === 10062) return;
      logError('parukom', 'Mygtuko klaida', e);
      if (!interaction.isRepliable()) return;
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ content: 'Įvyko klaida.' }).catch(() => {});
      } else {
        await interaction
          .reply({ content: 'Įvyko klaida.', flags: MessageFlags.Ephemeral })
          .catch(() => {});
      }
    }
  });
}
