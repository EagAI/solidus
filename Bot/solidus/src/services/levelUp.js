import { AttachmentBuilder } from 'discord.js';
import { config } from '../config.js';
import { LEVEL_MILESTONE } from '../constants.js';
import { buildLevelUpImage, isLevelMilestoneLevel } from '../utils/levelUpImage.js';
import { grantLevelRole } from './levelRoles.js';
import { logConsole, logError } from '../utils/logger.js';

/**
 * @param {number} level
 * @param {boolean} [milestone]
 */
function resolveLevelUpLayout(level, milestone = isLevelMilestoneLevel(level)) {
  return milestone ? 'center' : 'compact';
}

/**
 * @param {import('discord.js').Client} client
 * @param {import('discord.js').GuildMember} member
 * @param {number} level
 * @param {{ milestone?: boolean }} [opts]
 */
export async function announceLevelUp(client, member, level, opts = {}) {
  if (level < 1) return;

  const milestone = opts.milestone ?? isLevelMilestoneLevel(level);

  if (milestone) {
    await grantLevelRole(member, level);
  }

  try {
    const channel = await client.channels.fetch(config.levelUpChannelId);
    if (!channel?.isTextBased()) {
      logError('xp', 'Level-up kanalas nerastas arba ne tekstinis.');
      return;
    }

    const layout = resolveLevelUpLayout(level, milestone);
    const buffer = await buildLevelUpImage(member, level, { layout });
    const attachment = new AttachmentBuilder(buffer, { name: 'lygis-pasiektas.png' });

    await channel.send({ files: [attachment] });
    logConsole('xp', `Level-up ${level} (${layout}): ${member.user.tag} → <#${channel.id}>`);
  } catch (e) {
    logError('xp', 'Nepavyko išsiųsti level-up pranešimo', e);
  }
}

export { LEVEL_MILESTONE };
