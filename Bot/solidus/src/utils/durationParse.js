const MIN_DURATION_MS = 60_000;
const MAX_TIMEOUT_MS = 28 * 24 * 60 * 60 * 1000;

/**
 * @param {number} ms
 * @returns {{ ms: number } | { error: string }}
 */
function validateDurationMs(ms) {
  if (Number.isNaN(ms) || ms < MIN_DURATION_MS) {
    return { error: 'Trukmė turi būti bent 1 minutė.' };
  }
  if (ms > MAX_TIMEOUT_MS) {
    return { error: 'Trukmė negali viršyti 28 dienų.' };
  }
  return { ms };
}

/**
 * @param {string} raw
 * @returns {{ ms: number } | { error: string }}
 */
export function parseDurationMs(raw) {
  const input = raw?.trim();
  if (!input) return { error: 'Trukmė negali būti tuščia.' };

  let match = input.match(/^(\d+)\s*(?:min|mins|minutė|minutės|minutėms|m)$/i);
  if (match) {
    return validateDurationMs(+match[1] * 60_000);
  }

  match = input.match(/^(\d+)\s*h(?:val|ours)?$/i);
  if (match) {
    return validateDurationMs(+match[1] * 3_600_000);
  }

  match = input.match(/^(\d+)\s*d(?:ien[oa]s?)?$/i);
  if (match) {
    return validateDurationMs(+match[1] * 86_400_000);
  }

  match = input.match(/^(\d+)\s*w(?:eek|s|sav)?$/i);
  if (match) {
    return validateDurationMs(+match[1] * 7 * 86_400_000);
  }

  if (/^\d+$/.test(input)) {
    return validateDurationMs(parseInt(input, 10) * 60_000);
  }

  return {
    error: 'Nepavyko suprasti trukmės. Pvz.: `30min`, `2h`, `1d`, `60` (minutės).',
  };
}

/**
 * @param {number} ms
 * @returns {string}
 */
export function formatDurationLt(ms) {
  if (ms >= 86_400_000 && ms % 86_400_000 === 0) {
    return `${ms / 86_400_000} d.`;
  }
  if (ms >= 3_600_000 && ms % 3_600_000 === 0) {
    return `${ms / 3_600_000} val.`;
  }
  return `${Math.round(ms / 60_000)} min.`;
}
