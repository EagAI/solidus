import { PermissionFlagsBits } from 'discord.js';
import { config } from '../config.js';

/**
 * @param {import('discord.js').GuildMember} member
 * @returns {boolean}
 */
export function isModerator(member) {
  if (member.guild.ownerId === member.id) return true;
  if (!config.modRoleIds.length) return false;
  return config.modRoleIds.some((roleId) => member.roles.cache.has(roleId));
}

/**
 * Administratorius arba mod rolė.
 * @param {import('discord.js').GuildMember} member
 * @returns {boolean}
 */
export function isAdminOrModerator(member) {
  if (isModerator(member)) return true;
  return member.permissions?.has?.(PermissionFlagsBits.Administrator) === true;
}
