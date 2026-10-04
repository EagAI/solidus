import { ChannelType, PermissionFlagsBits } from 'discord.js';

/** @see import('discord-api-types/v10').OverwriteType */
const OverwriteTypeMember = 1;
const OverwriteTypeRole = 0;

export const OWNER_ALLOW = [
  PermissionFlagsBits.Connect,
  PermissionFlagsBits.Speak,
  PermissionFlagsBits.ViewChannel,
  PermissionFlagsBits.ManageChannels,
  PermissionFlagsBits.MoveMembers,
];

const OWNER_OVERWRITE = {
  Connect: true,
  Speak: true,
  ViewChannel: true,
  ManageChannels: true,
  MoveMembers: true,
};

const BOT_OVERWRITE = {
  ViewChannel: true,
  SendMessages: true,
  EmbedLinks: true,
  Connect: true,
  ManageChannels: true,
  MoveMembers: true,
};

const LOCKED_EVERYONE_OVERWRITE = {
  Connect: false,
  ViewChannel: true,
};

/**
 * @param {import('discord.js').CategoryChannel | null | undefined} parent
 */
async function ensureParentOverwrites(parent) {
  if (!parent) return;
  if (parent.permissionOverwrites.cache.size === 0) {
    await parent.permissionOverwrites.fetch();
  }
}

/**
 * @param {import('discord.js').VoiceChannel} channel
 * @param {string} userId
 * @param {import('discord.js').PermissionOverwriteOptions} options
 */
async function upsertMemberOverwrite(channel, userId, options) {
  await channel.permissionOverwrites.edit(userId, options, { type: OverwriteTypeMember });
}

/**
 * @param {import('discord.js').Guild} guild
 * @param {string | null | undefined} categoryId
 */
export async function getCategoryPermissionOverwrites(guild, categoryId) {
  if (!categoryId) return undefined;

  const parent = await guild.channels.fetch(categoryId).catch(() => null);
  if (!parent || parent.type !== ChannelType.GuildCategory) return undefined;

  await ensureParentOverwrites(parent);

  return parent.permissionOverwrites.cache.map((ow) => ({
    id: ow.id,
    allow: ow.allow.toArray(),
    deny: ow.deny.toArray(),
  }));
}

/**
 * @param {import('discord.js').VoiceChannel} channel
 */
export async function syncWithCategory(channel) {
  const parent = channel.parent;
  if (!parent) return;
  await ensureParentOverwrites(parent);
  await channel.lockPermissions();
}

/**
 * @param {import('discord.js').VoiceChannel} channel
 * @param {string} ownerId
 */
async function ensureOwnerPermissions(channel, ownerId) {
  await upsertMemberOverwrite(channel, ownerId, OWNER_OVERWRITE);
}

async function ensureBotPermissions(channel) {
  const me = channel.guild.members.me;
  if (!me) return;
  await upsertMemberOverwrite(channel, me.id, BOT_OVERWRITE);
}

/**
 * Kategorijos default teisės + savininko valdymas (atviras kanalas).
 * @param {import('discord.js').VoiceChannel} channel
 * @param {string} ownerId
 */
export async function applySessionDefaultPermissions(channel, ownerId) {
  await syncWithCategory(channel);
  await ensureOwnerPermissions(channel, ownerId);
  await ensureBotPermissions(channel);
}

/**
 * @everyone negali prisijungti, bet gali matyti kanalą. Kitų rolių teisės lieka.
 * @param {import('discord.js').VoiceChannel} channel
 * @param {string} ownerId
 */
export async function lockVoiceChannel(channel, ownerId) {
  await channel.permissionOverwrites.edit(
    channel.guild.roles.everyone,
    LOCKED_EVERYONE_OVERWRITE,
    { type: OverwriteTypeRole },
  );

  await ensureOwnerPermissions(channel, ownerId);
}

/**
 * @param {import('discord.js').VoiceChannel} channel
 * @param {string} ownerId
 */
export async function unlockVoiceChannel(channel, ownerId) {
  const parent = channel.parent;

  if (!parent) {
    await channel.permissionOverwrites.set([
      {
        id: channel.guild.id,
        allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.ViewChannel],
      },
      { id: ownerId, allow: OWNER_ALLOW, deny: [] },
    ]);
    return;
  }

  await syncWithCategory(channel);
  await ensureOwnerPermissions(channel, ownerId);
  await ensureBotPermissions(channel);
}
