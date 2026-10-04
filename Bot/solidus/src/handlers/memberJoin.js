import { AttachmentBuilder } from 'discord.js';
import { config } from '../config.js';
import { restoreMemberRoles } from '../services/roleMemory.js';
import { buildWelcomeBanner } from '../utils/welcomeBanner.js';
import { buildWelcomeCard } from '../utils/welcomeCard.js';
import { loadModules } from '../modules/settings.js';
import { logConsole, logError, logWarn } from '../utils/logger.js';

/**
 * @param {import('discord.js').GuildMember} member
 */
async function ensureNarysRole(member) {
  const role = await member.guild.roles.fetch(config.narysRoleId);
  if (!role) {
    logWarn('memberJoin', 'Narys rolė nerasta.');
    return false;
  }
  if (member.roles.cache.has(config.narysRoleId)) return false;
  await member.roles.add(role, 'Automatiškai prisijungus prie serverio');
  return true;
}

/**
 * @param {import('discord.js').Client} client
 * @param {import('discord.js').GuildMember} member
 */
async function sendWelcomeBanner(client, member) {
  const modules = loadModules(member.guild.id);
  if (!modules.entrance.enabled) return;

  const channelId = modules.entrance.channelId || config.welcomeChannelId;
  const channel = await client.channels.fetch(channelId);
  if (!channel?.isTextBased()) {
    logWarn('memberJoin', 'Sveikinimo kanalas nerastas.');
    return;
  }

  const banner =
    modules.entrance.style === 'card'
      ? await buildWelcomeCard(member)
      : await buildWelcomeBanner(member);
  const attachment = new AttachmentBuilder(banner, { name: 'sveikinimas.png' });

  await channel.send({ files: [attachment] });
  logConsole(
    'memberJoin',
    `**${member.user.tag}**\n<@${member.id}>\n\nSveikinimo banneris → <#${channel.id}>`,
  );
}

/**
 * @param {import('discord.js').Client} client
 */
export function registerMemberJoin(client) {
  client.on('guildMemberAdd', async (member) => {
    if (member.guild.id !== config.guildId) return;
    if (member.user.bot) return;

    try {
      const restoreResult = await restoreMemberRoles(member);

      if (restoreResult?.hadSave) {
        const addedNarys = await ensureNarysRole(member);
        const restoredCount = restoreResult.restored.length;
        const note =
          restoreResult.skipped.length > 0
            ? `\n• Nepavyko atkurti: ${restoreResult.skipped.length} (rolė neegzistuoja arba per aukšta botui)`
            : '';

        logConsole(
          'memberJoin',
          `**${member.user.tag}** grįžo\n<@${member.id}>\n\n• Atkurtos rolės: **${restoredCount}**${addedNarys ? '\n• Suteikta **Narys**' : ''}${note}`,
        );
        return;
      }

      const addedNarys = await ensureNarysRole(member);
      if (addedNarys) {
        logConsole(
          'memberJoin',
          `**${member.user.tag}**\n<@${member.id}>\n\nSuteikta rolė **Narys**.`,
        );
      }
    } catch (e) {
      logError('memberJoin', 'Nepavyko apdoroti prisijungimo (rolės)', e);
    }

    try {
      await sendWelcomeBanner(client, member);
    } catch (e) {
      logError('memberJoin', 'Nepavyko išsiųsti sveikinimo', e);
    }
  });
}
