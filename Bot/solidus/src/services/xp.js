import { XP_BASE, XP_MULTIPLIER, LEVEL_MILESTONE } from '../constants.js';
import { config } from '../config.js';
import { getUserRecord, mutateUserRecord, getTopUsers } from '../utils/xpStore.js';

/**
 * @param {number} level
 */
export function xpRequiredForLevel(level) {
  if (level <= 0) return 0;
  let total = 0;
  for (let i = 1; i <= level; i++) {
    total += Math.floor(XP_BASE * Math.pow(XP_MULTIPLIER, i - 1));
  }
  return total;
}

/**
 * @param {number} level
 */
export function xpForLevelStep(level) {
  return Math.floor(XP_BASE * Math.pow(XP_MULTIPLIER, level - 1));
}

/**
 * @param {number} xp
 */
export function getLevelFromXp(xp) {
  let level = 0;
  while (xpRequiredForLevel(level + 1) <= xp) {
    level++;
  }
  return level;
}

/**
 * @param {number} xp
 */
export function getProgressInfo(xp) {
  const level = getLevelFromXp(xp);
  const nextLevel = level + 1;
  const floor = level > 0 ? xpRequiredForLevel(level) : 0;
  const ceiling = xpRequiredForLevel(nextLevel);
  const current = xp - floor;
  const needed = ceiling - floor;
  const percent = needed > 0 ? Math.floor((current / needed) * 100) : 0;

  return {
    level,
    nextLevel,
    xp,
    current,
    needed,
    percent,
    floor,
    ceiling,
  };
}

/**
 * @param {import('discord.js').GuildMember | { id: string }} member
 * @param {number} amount
 */
export function addXp(member, amount) {
  const userId = member.id;
  const record = getUserRecord(userId);
  const oldXp = record.xp;
  const oldLevel = getLevelFromXp(oldXp);
  const newXp = oldXp + amount;
  const newLevel = getLevelFromXp(newXp);

  mutateUserRecord(userId, (r) => {
    r.xp = newXp;
    r.level = newLevel;
  });

  const leveledUp = newLevel > oldLevel;
  const milestoneLevelUp =
    leveledUp &&
    newLevel >= LEVEL_MILESTONE &&
    newLevel % LEVEL_MILESTONE === 0;

  return {
    leveledUp,
    milestoneLevelUp,
    announceLevel: leveledUp ? newLevel : null,
    newLevel,
    oldLevel,
    newXp,
  };
}

/**
 * @param {import('discord.js').Message} message
 */
export async function handleMessageXp(message) {
  if (!message.guild || message.guild.id !== config.guildId) return null;
  if (message.author.bot || message.system) return null;
  if (!message.content || message.content.trim().length < 3) return null;

  const userId = message.author.id;
  const record = getUserRecord(userId);
  const now = Date.now();

  if (now - record.lastXpTime < config.xpCooldownMs) return null;

  mutateUserRecord(userId, (r) => {
    r.lastXpTime = now;
    r.totalMessages += 1;
  });

  const member = message.member ?? { id: userId };
  return addXp(member, config.xpPerMessage);
}

export { getUserRecord, getTopUsers };
