/**
 * @param {{ displayName?: string | null, nickname?: string | null, user?: { username?: string, globalName?: string | null }, username?: string }} member
 */
export function resolveMemberDisplayName(member) {
  if (member.displayName) return member.displayName;
  if (member.nickname) return member.nickname;
  return member.user?.globalName ?? member.user?.username ?? member.username ?? 'Narys';
}

/**
 * @param {{ displayName?: string | null, nickname?: string | null, user?: { username?: string, globalName?: string | null }, username?: string }} member
 */
export function hasServerNickname(member) {
  if (member.nickname) return true;

  const username = member.user?.username ?? member.username;
  const displayName = member.displayName ?? member.nickname;
  if (!username || !displayName) return false;

  return displayName !== username;
}

/**
 * @param {{ user?: { username?: string }, username?: string }} member
 */
export function resolveMemberHandle(member) {
  return member.user?.username ?? member.username ?? 'narys';
}
