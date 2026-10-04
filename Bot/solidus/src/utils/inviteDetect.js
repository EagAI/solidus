const INVITE_PATTERN =
  /(?:https?:\/\/)?(?:www\.)?(?:discord\.gg|discord(?:app)?\.com\/invite)\/[^\s<>]+/gi;

/**
 * @param {string} text
 * @returns {string[]}
 */
export function findDiscordInviteLinks(text) {
  if (!text) return [];
  const matches = text.match(INVITE_PATTERN);
  if (!matches) return [];
  return [...new Set(matches.map((m) => m.trim()))];
}

/**
 * @param {string} text
 * @returns {boolean}
 */
export function containsDiscordInvite(text) {
  return findDiscordInviteLinks(text).length > 0;
}
