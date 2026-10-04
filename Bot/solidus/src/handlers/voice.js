import {
  ChannelType,
  MessageFlags,
} from 'discord.js';
import { config } from '../config.js';
import { VC_LOCK, VC_UNLOCK } from '../constants.js';
import { getHubChannelId } from '../services/voiceHub.js';
import { buildVoicePanel } from '../services/voicePanel.js';
import {
  addVoiceChannel,
  findVoiceChannelByOwner,
  getVoiceChannelRecord,
  loadState,
  removeVoiceChannel,
  setVoiceHubChannelId,
} from '../utils/state.js';
import { logConsole, logError } from '../utils/logger.js';
import {
  lockVoiceChannel,
  unlockVoiceChannel,
  getCategoryPermissionOverwrites,
  applySessionDefaultPermissions,
  OWNER_ALLOW,
} from '../utils/voicePermissions.js';

/** @type {Map<string, Promise<void>>} */
const hubJoinInFlight = new Map();

/**
 * @param {import('discord.js').GuildMember} member
 */
function tempChannelName(member) {
  const suffix = ' VC';
  const maxNick = 100 - suffix.length;
  return `${member.displayName.slice(0, maxNick)}${suffix}`;
}

/**
 * @param {import('discord.js').Guild} guild
 * @param {string} ownerId
 * @param {string} keepChannelId
 */
async function cleanupStaleOwnerChannels(guild, ownerId, keepChannelId) {
  const channels = loadState().voiceChannels ?? {};
  for (const [channelId, meta] of Object.entries(channels)) {
    if (meta.ownerId !== ownerId || channelId === keepChannelId) continue;

    const ch =
      guild.channels.cache.get(channelId) ||
      (await guild.channels.fetch(channelId).catch(() => null));
    if (ch?.isVoiceBased() && ch.members.size === 0) {
      await ch.delete('Pasikartojantis balso kanalas').catch(() => {});
    }
    removeVoiceChannel(channelId);
  }
}

/**
 * @param {import('discord.js').GuildMember} member
 * @param {import('discord.js').VoiceBasedChannel} channel
 */
async function moveMemberToChannel(member, channel) {
  if (member.voice.channelId === channel.id) return;

  try {
    await member.voice.setChannel(channel);
  } catch (e) {
    logError(
      'voice',
      `Nepavyko perkelti ${member.user.tag} → <#${channel.id}> (patikrinkite botų „Perkelti narius“ teisę)`,
      e,
    );
    throw e;
  }
}

/**
 * @param {import('discord.js').Guild} guild
 * @param {import('discord.js').GuildMember} member
 */
async function createTempVoiceChannel(guild, member) {
  const categoryId = config.voiceCategoryId || null;
  const permissionOverwrites = [...(await getCategoryPermissionOverwrites(guild, categoryId) ?? [])];

  const ownerIdx = permissionOverwrites.findIndex((ow) => ow.id === member.id);
  if (ownerIdx >= 0) {
    permissionOverwrites[ownerIdx].allow = [
      ...new Set([...permissionOverwrites[ownerIdx].allow, ...OWNER_ALLOW]),
    ];
  } else {
    permissionOverwrites.push({ id: member.id, allow: OWNER_ALLOW, deny: [] });
  }

  return guild.channels.create({
    name: tempChannelName(member),
    type: ChannelType.GuildVoice,
    parent: categoryId,
    permissionOverwrites: permissionOverwrites.length ? permissionOverwrites : undefined,
    reason: `Balso kanalas — ${member.user.tag}`,
  });
}

/**
 * @param {import('discord.js').VoiceBasedChannel} channel
 */
async function postVoicePanel(channel) {
  if (!('send' in channel) || typeof channel.send !== 'function') {
    logConsole('voice', 'Kanalas nepalaiko teksto — panelė neišsiųsta.');
    return;
  }

  try {
    await channel.send(buildVoicePanel(false));
  } catch (e) {
    logError('voice', `Nepavyko siųsti panelės <#${channel.id}>`, e);
    throw e;
  }
}

/**
 * @param {import('discord.js').GuildMember} member
 * @param {import('discord.js').Guild} guild
 */
async function handleHubJoin(member, guild) {
  const existingId = findVoiceChannelByOwner(member.id);

  if (existingId) {
    const existingCh =
      guild.channels.cache.get(existingId) ||
      (await guild.channels.fetch(existingId).catch(() => null));
    if (existingCh?.isVoiceBased()) {
      await moveMemberToChannel(member, existingCh);
      return;
    }
    removeVoiceChannel(existingId);
  }

  const channel = await createTempVoiceChannel(guild, member);
  addVoiceChannel(channel.id, member.id);
  await moveMemberToChannel(member, channel);
  await cleanupStaleOwnerChannels(guild, member.id, channel.id);
  await applySessionDefaultPermissions(channel, member.id);
  await postVoicePanel(channel);
}

/**
 * @param {import('discord.js').Client} client
 */
export function registerVoice(client) {
  client.on('voiceStateUpdate', async (oldState, newState) => {
    if (!config.voiceEnabled) return;
    if (newState.guild.id !== config.guildId) return;

    const hubChannelId = getHubChannelId();
    if (!hubChannelId) return;

    if (
      newState.channelId === hubChannelId &&
      newState.member &&
      !newState.member.user.bot
    ) {
      const member = newState.member;
      const inFlight = hubJoinInFlight.get(member.id);
      if (inFlight) {
        await inFlight.catch(() => {});
        return;
      }

      const job = handleHubJoin(member, newState.guild).finally(() => {
        hubJoinInFlight.delete(member.id);
      });
      hubJoinInFlight.set(member.id, job);

      try {
        await job;
      } catch (e) {
        logError('voice', 'Nepavyko sukurti / perkelti balso kanalo', e);
      }
      return;
    }

    if (oldState.channelId && oldState.channelId !== hubChannelId) {
      const record = getVoiceChannelRecord(oldState.channelId);
      if (!record) return;

      const ch =
        oldState.guild.channels.cache.get(oldState.channelId) ||
        (await oldState.guild.channels.fetch(oldState.channelId).catch(() => null));
      if (ch?.isVoiceBased() && ch.members.size === 0) {
        await ch.delete('Tuščias balso kanalas').catch(() => {});
        removeVoiceChannel(oldState.channelId);
      }
    }
  });

  client.on('channelDelete', (channel) => {
    if (!('guild' in channel) || !channel.guild || channel.guild.id !== config.guildId) return;
    removeVoiceChannel(channel.id);
    if (getHubChannelId() === channel.id) {
      setVoiceHubChannelId(null);
    }
  });
}

/**
 * @param {import('discord.js').Client} client
 */
export function registerVoiceButtons(client) {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton() || !interaction.guild) return;
    if (interaction.customId !== VC_LOCK && interaction.customId !== VC_UNLOCK) return;

    const channel = interaction.channel;
    if (!channel?.isVoiceBased()) {
      await interaction.reply({
        content: 'Šis mygtukas veikia tik balso kanalo pokalbyje.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const record = getVoiceChannelRecord(channel.id);
    if (!record) {
      await interaction.reply({
        content: 'Šis kanalas nėra valdomas.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (record.ownerId !== interaction.user.id) {
      await interaction.reply({
        content: 'Tik kanalo savininkas gali jį valdyti.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const locking = interaction.customId === VC_LOCK;

    try {
      if (locking) {
        await lockVoiceChannel(channel, record.ownerId);
      } else {
        await unlockVoiceChannel(channel, record.ownerId);
      }
      await interaction.update(buildVoicePanel(locking));
    } catch (e) {
      logError('voice', 'Nepavyko užrakinti / atrakinti kanalo', e);
      await interaction.reply({
        content: 'Nepavyko pakeisti leidimų. Patikrinkite botų teises.',
        flags: MessageFlags.Ephemeral,
      }).catch(() => {});
    }
  });
}
