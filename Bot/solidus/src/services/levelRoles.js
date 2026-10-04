import { LEVEL_ROLE_TIERS } from '../constants.js';
import { config } from '../config.js';
import { logConsole, logError, logWarn } from '../utils/logger.js';
const ALL_ROLE_IDS = LEVEL_ROLE_TIERS.map((t) => t.roleId).filter(Boolean);

/**
 * @param {import('discord.js').GuildMember} member
 * @param {number} level
 */
export async function grantLevelRole(member, level) {
  const tier = LEVEL_ROLE_TIERS.find((t) => t.level === level);
  if (!tier?.roleId) return;

  const toAdd =
    member.guild.roles.cache.get(tier.roleId) ??
    (await member.guild.roles.fetch(tier.roleId).catch(() => null));
  if (!toAdd) {
    logWarn('xp', `Level rolė Lv.${level} „${tier.name}“ (${tier.roleId}) nerasta.`);
    return;
  }

  const toRemove = config.levelRolesStack
    ? []
    : ALL_ROLE_IDS.filter((id) => id !== tier.roleId && member.roles.cache.has(id));
  try {
    if (toRemove.length) {
      await member.roles.remove(toRemove, `Naujas lygis ${level}`);
    }
    if (!member.roles.cache.has(toAdd.id)) {
      await member.roles.add(toAdd, `Pasiektas ${level} lygis`);
      logConsole('xp', `${member.user.tag} → **${tier.name}** (Lv.${level})`);
    }
  } catch (e) {
    if (e?.code === 50013) {
      logWarn('xp', `Nėra teisių suteikti rolės „${tier.name}“ — bot rolė turi būti aukščiau.`);
    } else {
      logError('xp', `Nepavyko suteikti level rolės (Lv.${level})`, e);
    }
  }
}
