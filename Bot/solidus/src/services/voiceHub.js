import { ChannelType } from 'discord.js';
import { config } from '../config.js';
import { HUB_CHANNEL_NAME } from '../constants.js';
import {
  getVoiceHubChannelId,
  setVoiceHubChannelId,
} from '../utils/state.js';
import { getCategoryPermissionOverwrites } from '../utils/voicePermissions.js';
import { logConsole } from '../utils/logger.js';

const HUB_USER_LIMIT = 1;

/**
 * @param {import('discord.js').VoiceChannel} hub
 */
async function ensureHubUserLimit(hub) {
  if (hub.userLimit !== HUB_USER_LIMIT) {
    await hub.edit({ userLimit: HUB_USER_LIMIT, reason: 'Sukurti kanalą — tik 1 žmogus' }).catch(() => {});
  }
}

/**
 * @param {import('discord.js').Client} client
 */
export async function ensureVoiceHub(client) {
  if (!config.voiceEnabled) return;

  const guild = await client.guilds.fetch(config.guildId);
  const storedId = getVoiceHubChannelId();

  if (storedId) {
    const existing =
      guild.channels.cache.get(storedId) ||
      (await guild.channels.fetch(storedId).catch(() => null));
    if (existing?.type === ChannelType.GuildVoice) {
      await ensureHubUserLimit(existing);
      return;
    }
  }

  await guild.channels.fetch();
  const discovered = guild.channels.cache.find(
    (c) =>
      c.type === ChannelType.GuildVoice &&
      c.name === HUB_CHANNEL_NAME &&
      (config.voiceCategoryId ? c.parentId === config.voiceCategoryId : true),
  );
  if (discovered) {
    setVoiceHubChannelId(discovered.id);
    await ensureHubUserLimit(discovered);
    logConsole('voice', `Rastas esamas centras <#${discovered.id}>.`);
    return;
  }

  const permissionOverwrites = await getCategoryPermissionOverwrites(
    guild,
    config.voiceCategoryId,
  );

  const hub = await guild.channels.create({
    name: HUB_CHANNEL_NAME,
    type: ChannelType.GuildVoice,
    parent: config.voiceCategoryId || null,
    userLimit: HUB_USER_LIMIT,
    permissionOverwrites,
    reason: 'Balso kanalų prisijungimo centras',
  });

  setVoiceHubChannelId(hub.id);
  logConsole('voice', `Prisijungimo centras sukurtas <#${hub.id}>.`);
}

/**
 * @returns {string | null}
 */
export function getHubChannelId() {
  return getVoiceHubChannelId();
}
