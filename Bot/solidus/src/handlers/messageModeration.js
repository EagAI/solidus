import { config } from '../config.js';
import { isModerator } from '../utils/modCheck.js';
import { hasActiveLinkException } from '../utils/state.js';
import { findDiscordInviteLinks } from '../utils/inviteDetect.js';
import { handleAntiScam } from '../services/antiScam.js';
import { handleAntiInvite } from './antiInvite.js';
import { enforceMediaOnlyChannel } from './mediaOnly.js';
import { handleMessageXp } from '../services/xp.js';
import { announceLevelUp } from '../services/levelUp.js';

/**
 * @param {import('discord.js').Client} client
 */
export function registerMessageModeration(client) {
  client.on('messageCreate', async (message) => {
    await onMessageModeration(client, message);
  });

  client.on('messageUpdate', async (_oldMessage, newMessage) => {
    if (newMessage.partial) {
      try {
        await newMessage.fetch();
      } catch {
        return;
      }
    }
    await onMessageModeration(client, newMessage);
  });
}

/**
 * @param {import('discord.js').Client} client
 * @param {import('discord.js').Message} message
 */
async function onMessageModeration(client, message) {
  if (!message.guild || message.guild.id !== config.guildId) return;
  if (message.author.bot || message.system) return;

  let isMod = false;
  try {
    const member = await message.guild.members.fetch(message.author.id);
    isMod = isModerator(member);
  } catch {
    /* skenuoti toliau */
  }

  const mediaResult = await enforceMediaOnlyChannel(message, isMod);
  if (mediaResult === 'violation') return;

  if (!isMod && message.attachments.size > 0) {
    const handled = await handleAntiScam(message);
    if (handled) return;
  }

  if (
    findDiscordInviteLinks(message.content).length &&
    !hasActiveLinkException(message.author.id)
  ) {
    await handleAntiInvite(client, message);
    return;
  }

  const xpResult = await handleMessageXp(message);
  if (xpResult?.announceLevel) {
    const member = await message.guild.members
      .fetch(message.author.id)
      .catch(() => message.member ?? null);
    if (member) {
      await announceLevelUp(client, member, xpResult.announceLevel, {
        milestone: xpResult.milestoneLevelUp,
      });
    }
  }
}
