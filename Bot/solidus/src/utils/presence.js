import { ActivityType } from 'discord.js';
import { config } from '../config.js';
import { logError } from '../utils/logger.js';
/**
 * @param {import('discord.js').Client} client
 */
export async function updateMemberPresence(client) {
  const guild =
    client.guilds.cache.get(config.guildId) ??
    (await client.guilds.fetch(config.guildId).catch(() => null));
  if (!guild) return;

  await client.user.setPresence({
    activities: [{ name: `Nariai: ${guild.memberCount}`, type: ActivityType.Watching }],
    status: 'online',
  });
}

/**
 * @param {import('discord.js').Client} client
 */
export function registerMemberPresence(client) {
  client.on('guildMemberAdd', (member) => {
    if (member.guild.id !== config.guildId) return;
    updateMemberPresence(client).catch((e) => logError('presence', 'Nepavyko atnaujinti statuso', e));
  });

  client.on('guildMemberRemove', (member) => {
    if (member.guild.id !== config.guildId) return;
    updateMemberPresence(client).catch((e) => logError('presence', 'Nepavyko atnaujinti statuso', e));  });
}
