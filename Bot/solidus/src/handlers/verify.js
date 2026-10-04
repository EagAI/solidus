import { MessageFlags } from 'discord.js';
import { CUSTOM_ID } from '../constants.js';
import { config } from '../config.js';
import { buildVerifyMessage } from '../embeds/verify.js';
import { loadState, saveState, verifyPersistedMessage } from '../utils/state.js';
import { logConsole, logError, logWarn } from '../utils/logger.js';

/**
 * @param {import('discord.js').Client} client
 * @param {string} channelId
 * @returns {Promise<string | null>}
 */
async function findExistingVerifyMessage(client, channelId) {
  try {
    const ch = await client.channels.fetch(channelId);
    if (!ch?.isTextBased() || !('messages' in ch)) return null;
    const recent = await ch.messages.fetch({ limit: 100 });
    for (const msg of recent.values()) {
      if (msg.author.id !== client.user?.id) continue;
      const hasVerifyButton = (msg.components ?? []).some((row) =>
        row.components.some(
          (c) => 'customId' in c && c.customId === CUSTOM_ID.VERIFY_NARYS,
        ),
      );
      if (hasVerifyButton) return msg.id;
    }
  } catch (e) {
    logWarn('verify', 'Nepavyko ieškoti esamos patvirtinimo žinutės');
    logError('verify', 'findExistingVerifyMessage', e);
  }
  return null;
}

/**
 * @param {import('discord.js').Client} client
 * @param {string} channelId
 * @param {string} messageId
 */
async function refreshVerifyMessage(client, channelId, messageId) {
  const ch = await client.channels.fetch(channelId);
  if (!ch?.isTextBased() || !('messages' in ch)) return;
  const msg = await ch.messages.fetch(messageId);
  await msg.edit(buildVerifyMessage());
}

/**
 * @param {import('discord.js').Client} client
 */
export async function ensureVerifyMessage(client) {
  const state = loadState();
  const channelId = config.verifyChannelId;
  if (state.verify?.messageId && state.verify?.channelId === channelId) {
    const ok = await verifyPersistedMessage(client, channelId, state.verify.messageId);
    if (ok) {
      try {
        await refreshVerifyMessage(client, channelId, state.verify.messageId);
        logConsole('verify', 'Patvirtinimo žinutė atnaujinta.');
      } catch (e) {
        logError('verify', 'Nepavyko atnaujinti patvirtinimo žinutės', e);
      }
      return;
    }
  }

  const discoveredId = await findExistingVerifyMessage(client, channelId);
  if (discoveredId) {
    saveState({ ...loadState(), verify: { channelId, messageId: discoveredId } });
    try {
      await refreshVerifyMessage(client, channelId, discoveredId);
      logConsole('verify', 'Rasta esama patvirtinimo žinutė — atnaujinta.');
    } catch (e) {
      logError('verify', 'Nepavyko atnaujinti patvirtinimo žinutės', e);
    }
    return;
  }

  const base = loadState();
  saveState({ ...base, verify: null });
  const channel = await client.channels.fetch(channelId);
  if (!channel?.isTextBased()) return;
  const msg = await channel.send(buildVerifyMessage());
  saveState({ ...loadState(), verify: { channelId, messageId: msg.id } });
  logConsole('verify', `Patvirtinimo žinutė sukurta <#${channelId}>`);
}

/**
 * @param {import('discord.js').Client} client
 */
export function registerVerify(client) {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton() || interaction.customId !== CUSTOM_ID.VERIFY_NARYS) return;
    if (!interaction.guildId || !interaction.member) return;

    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const member = await interaction.guild.members.fetch(interaction.user.id);
      const role = await interaction.guild.roles.fetch(config.patvirtintasRoleId);
      if (!role) {
        await interaction.editReply({ content: 'Klaida: Patvirtintas rolė nerasta.' });
        return;
      }
      if (member.roles.cache.has(config.patvirtintasRoleId)) {
        await interaction.editReply({ content: 'Jau sutikai su taisyklėmis.' });
        return;
      }
      await member.roles.add(role, 'Sutiko su serverio taisyklėmis');
      logConsole(
        'verify',
        `**${member.user.tag}**\n<@${member.id}>\n\nSutiko su taisyklėmis — suteikta **Patvirtintas**.`,
      );
      await interaction.editReply({
        content: 'Sutikai su taisyklėmis! Dabar matai visus kanalus. Sveiki atvykę!',
      });
    } catch (e) {
      logError('verify', 'Nepavyko suteikti Patvirtintas rolės', e);
      try {
        await interaction.editReply({
          content: 'Nepavyko suteikti rolės. Patikrinkite botų teises ir hierarchiją.',
        });
      } catch {
        /* */
      }
    }
  });
}
