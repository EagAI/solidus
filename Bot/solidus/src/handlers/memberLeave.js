import { config } from '../config.js';
import { saveMemberRoles } from '../services/roleMemory.js';
import { logError, logInfo } from '../utils/logger.js';

/**
 * @param {import('discord.js').Client} client
 */
export function registerMemberLeave(client) {
  client.on('guildMemberRemove', async (member) => {
    if (member.guild.id !== config.guildId) return;
    if (member.user.bot) return;

    try {
      const roleIds = saveMemberRoles(member);
      logInfo(
        'memberLeave',
        `**${member.user.tag}**\n<@${member.id}>\n\nIšsaugotos **${roleIds.length}** rolės.`,
      );
    } catch (e) {
      logError('memberLeave', 'Nepavyko išsaugoti rolių', e);
    }
  });
}
