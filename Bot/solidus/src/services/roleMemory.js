import { getSavedRoles, saveUserRoles } from '../utils/roleMemoryStore.js';
import { logError, logWarn } from '../utils/logger.js';

/**
 * @param {import('discord.js').GuildMember} member
 * @returns {string[]}
 */
export function collectSaveableRoleIds(member) {
  const everyoneId = member.guild.id;
  return member.roles.cache
    .filter((role) => role.id !== everyoneId && !role.managed)
    .map((role) => role.id);
}

/**
 * @param {import('discord.js').GuildMember} member
 */
export function saveMemberRoles(member) {
  const roleIds = collectSaveableRoleIds(member);
  saveUserRoles(member.id, roleIds);
  return roleIds;
}

/**
 * @param {import('discord.js').GuildMember} member
 * @returns {Promise<{ hadSave: boolean, restored: string[], skipped: string[] } | null>}
 */
export async function restoreMemberRoles(member) {
  const saved = getSavedRoles(member.id);
  if (!saved?.roleIds?.length) return null;

  const guild = member.guild;
  const me = guild.members.me ?? (await guild.members.fetchMe().catch(() => null));
  if (!me) {
    logWarn('roleMemory', 'Bot narys nerastas — negalima atkurti rolių.');
    return { hadSave: true, restored: [], skipped: saved.roleIds };
  }

  const botHighest = me.roles.highest.position;
  const toAdd = [];
  const skipped = [];

  for (const roleId of saved.roleIds) {
    if (member.roles.cache.has(roleId)) continue;

    const role =
      guild.roles.cache.get(roleId) ?? (await guild.roles.fetch(roleId).catch(() => null));
    if (!role) {
      skipped.push(roleId);
      continue;
    }
    if (role.managed) {
      skipped.push(roleId);
      continue;
    }
    if (role.position >= botHighest) {
      skipped.push(roleId);
      continue;
    }
    toAdd.push(role);
  }

  if (toAdd.length) {
    try {
      await member.roles.add(toAdd, 'Grįžo į serverį — atkurtos rolės');
    } catch (e) {
      logError('roleMemory', 'Nepavyko atkurti rolių', e);
      return { hadSave: true, restored: [], skipped: saved.roleIds };
    }
  }

  return {
    hadSave: true,
    restored: toAdd.map((role) => role.id),
    skipped,
  };
}
