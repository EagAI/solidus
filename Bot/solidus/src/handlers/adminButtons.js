import { MessageFlags } from 'discord.js';
import { config } from '../config.js';
import { isModerator } from '../utils/modCheck.js';
import { grantLinkException } from '../utils/state.js';
import { handleScamLogButton } from '../services/scamLogButtons.js';
import { EXCEPTION_PREFIX } from './antiInvite.js';
import { logInfo } from '../utils/logger.js';

/**
 * @param {import('discord.js').Client} client
 */
export function registerAdminButtons(client) {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton() || !interaction.guild) return;

    const id = interaction.customId;

    if (id.startsWith('scam:ban:') || id.startsWith('scam:untimeout:')) {
      await handleScamLogButton(interaction);
      return;
    }

    if (!id.startsWith(EXCEPTION_PREFIX)) return;

    let actingMember;
    try {
      actingMember = await interaction.guild.members.fetch(interaction.user.id);
    } catch {
      await interaction.reply({
        content: 'Nepavyko patikrinti tavo rolių.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (!isModerator(actingMember)) {
      await interaction.reply({
        content: 'Tik serverio moderatoriai gali naudoti šiuos mygtukus.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const rest = id.slice(EXCEPTION_PREFIX.length);
    const colonIdx = rest.indexOf(':');
    if (colonIdx === -1) return;

    const guildId = rest.slice(0, colonIdx);
    const targetUserId = rest.slice(colonIdx + 1);

    if (guildId !== interaction.guildId || !targetUserId) {
      await interaction.reply({
        content: 'Neteisingas mygtuko formatas.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    grantLinkException(targetUserId, config.inviteTimeoutMs);
    const hours = Math.round(config.inviteTimeoutMs / 3_600_000);
    logInfo(
      'admin',
      `**${interaction.user.tag}** suteikė pakvietimo leidimą\n<@${targetUserId}>\n\n• Trukmė: **${hours} val.**`,
    );
    await interaction.editReply({
      content: `<@${targetUserId}> gali skelbti Discord pakvietimo nuorodas ${hours} val.`,
    });
  });
}
