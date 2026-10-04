import { YT_FETCH_HEADERS } from '../constants.js';

const UC_CHANNEL_ID = /^UC[\w-]{22}$/;

/**
 * @param {string} html
 * @returns {string | null}
 */
function extractChannelIdFromHtml(html) {
  const patterns = [
    /"channelId":"(UC[\w-]{22})"/,
    /"externalId":"(UC[\w-]{22})"/,
    /"browseId":"(UC[\w-]{22})"/,
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * @param {string} raw
 * @returns {{ type: 'id', value: string } | { type: 'handle', value: string } | null}
 */
export function parseYoutubeChannelInput(raw) {
  const input = raw?.trim();
  if (!input) return null;

  if (UC_CHANNEL_ID.test(input)) {
    return { type: 'id', value: input };
  }

  const urlMatch = input.match(
    /youtube\.com\/(?:channel\/(UC[\w-]{22})|@([\w.-]+))\/?(?:\?.*)?$/i,
  );
  if (urlMatch) {
    if (urlMatch[1]) return { type: 'id', value: urlMatch[1] };
    return { type: 'handle', value: urlMatch[2] };
  }

  if (input.startsWith('@')) {
    return { type: 'handle', value: input.slice(1) };
  }

  if (/^[\w.-]+$/.test(input)) {
    return { type: 'handle', value: input };
  }

  return null;
}

/**
 * @param {string} handle
 */
async function resolveHandleToChannelId(handle) {
  const res = await fetch(`https://www.youtube.com/@${handle}`, {
    signal: AbortSignal.timeout(15_000),
    headers: {
      ...YT_FETCH_HEADERS,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });

  if (!res.ok) {
    throw new Error(`Nepavyko atidaryti @${handle} (HTTP ${res.status}).`);
  }

  const channelId = extractChannelIdFromHtml(await res.text());
  if (!channelId) {
    throw new Error(`Nepavyko rasti kanalo ID pagal @${handle}.`);
  }

  return channelId;
}

/**
 * Priima UC… id, @Kampas1, Kampas1 arba https://www.youtube.com/@Kampas1
 * @param {string} raw
 */
export async function resolveYoutubeChannelId(raw) {
  const parsed = parseYoutubeChannelInput(raw);
  if (!parsed) {
    throw new Error(
      'YOUTUBE_CHANNEL_ID neteisingas — naudok UC… id, @Kampas1, Kampas1 arba pilną YouTube URL.',
    );
  }

  if (parsed.type === 'id') return parsed.value;
  return resolveHandleToChannelId(parsed.value);
}
