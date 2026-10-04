import { config } from '../config.js';
import { logConsole, logError } from '../utils/logger.js';
import { registerVerify, ensureVerifyMessage } from './verify.js';
import { registerMemberJoin } from './memberJoin.js';
import { registerMemberLeave } from './memberLeave.js';
import { registerMessageModeration } from './messageModeration.js';
import { registerMessageEditLog } from './messageEditLog.js';
import { registerMessageDeleteLog } from './messageDeleteLog.js';
import { registerAdminButtons } from './adminButtons.js';
import { registerVoice, registerVoiceButtons } from './voice.js';
import { registerMemberPresence, updateMemberPresence } from '../utils/presence.js';
import { startYoutubeRssPoll } from '../services/youtubeRss.js';
import { ensureVoiceHub } from '../services/voiceHub.js';
import { registerGiveaway } from './giveaway.js';
import { registerParukom } from './parukom.js';
import { registerTickets } from './tickets.js';
import { registerCommandInteractions, registerSlashCommands } from '../commands/register.js';
import { restoreActiveGiveawayTimers } from '../services/giveaway.js';
import { restoreActiveParukomTimers } from '../services/parukom.js';
import { registerMessageContentCache } from '../utils/messageContentCache.js';

/**
 * @param {import('discord.js').Client} client
 */
export function registerHandlers(client) {
  // New server invited from the panel → slash commands appear right away.
  client.on('guildCreate', (guild) => {
    registerSlashCommands(client, guild.id).catch((e) => logError('commands', guild.id, e));
  });

  registerVerify(client);
  registerMemberJoin(client);
  registerMemberLeave(client);
  registerMessageContentCache(client);
  registerMessageModeration(client);
  registerMessageEditLog(client);
  registerMessageDeleteLog(client);
  registerAdminButtons(client);
  registerVoice(client);
  registerVoiceButtons(client);
  registerMemberPresence(client);
  registerGiveaway(client);
  registerParukom(client);
  registerTickets(client);
  registerCommandInteractions(client);
}

/**
 * @param {import('discord.js').Client} client
 */
export async function runAfterReady(client) {
  await safe('commands', () => registerSlashCommands(client));

  // Legacy single-server features need GUILD_ID + their channel IDs in .env.
  if (!config.guildId) {
    logConsole('startup', 'GUILD_ID nenustatytas – vieno serverio funkcijos (verify, voice hub, YouTube) išjungtos.');
    return;
  }
  if (config.verifyChannelId) await safe('verify', () => ensureVerifyMessage(client));
  await safe('voice', () => ensureVoiceHub(client));
  if (config.youtubeChannelId && config.youtubeAnnounceChannelId) {
    await safe('youtube', () => startYoutubeRssPoll(client));
  }
  await safe('giveaway', () => restoreActiveGiveawayTimers(client));
  await safe('parukom', () => restoreActiveParukomTimers(client));
  await safe('presence', () => updateMemberPresence(client));
}

/** One failing feature must not stop the rest of startup. */
async function safe(name, fn) {
  try {
    await fn();
  } catch (e) {
    logError(name, 'Paleidimo klaida', e);
  }
}
