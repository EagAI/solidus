import { XMLParser } from 'fast-xml-parser';
import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { config } from '../config.js';
import {
  TIKTOK_LIVE_URL,
  YOUTUBE_ANNOUNCE_MESSAGES,
  YOUTUBE_RSS_START_DELAY_MS,
} from '../constants.js';
import { parseYoutubeChannelInput, resolveYoutubeChannelId } from '../utils/youtubeChannel.js';
import {
  isYoutubeVideoAnnounced,
  markYoutubeVideoAnnounced,
  migrateLegacyYoutubeState,
  setYoutubeLastVideoId,
} from '../utils/youtubeAnnouncedStore.js';
import { logError, logInfo, logConsole } from '../utils/logger.js';

const RSS_URL = (channelId) =>
  `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

const parser = new XMLParser({ ignoreAttributes: false });

/** @type {Set<string>} */
const announcingKeys = new Set();

/** @type {ReturnType<typeof setTimeout> | null} */
let startTimer = null;

/** @type {ReturnType<typeof setInterval> | null} */
let pollTimer = null;

/** @type {string | null} */
let resolvedChannelId = null;

/**
 * @param {string} message
 */
function logRssIssue(message) {
  logConsole('youtube', message);
}

/**
 * @param {string} xml
 */
function parseNewestVideoFromRss(xml) {
  const parsed = parser.parse(xml);
  const rawEntries = parsed?.feed?.entry;
  if (!rawEntries) return null;

  const entry = Array.isArray(rawEntries) ? rawEntries[0] : rawEntries;
  const videoId = entry['yt:videoId'] || entry.videoId;
  if (!videoId) return null;

  const titleRaw = entry.title;
  const title =
    typeof titleRaw === 'string'
      ? titleRaw
      : titleRaw && typeof titleRaw === 'object' && titleRaw['#text']
        ? String(titleRaw['#text'])
        : 'Naujas vaizdo įrašas';

  return {
    videoId,
    title,
    url: `https://www.youtube.com/watch?v=${videoId}`,
  };
}

/**
 * @param {string} ytChannelId
 */
export async function fetchNewestVideoFromRss(ytChannelId) {
  const res = await fetch(RSS_URL(ytChannelId), {
    signal: AbortSignal.timeout(20_000),
  });

  const xml = await res.text();
  if (!res.ok || xml.includes('Error 404')) {
    throw new Error(`RSS HTTP ${res.status}`);
  }

  const video = parseNewestVideoFromRss(xml);
  if (!video?.videoId) {
    throw new Error('RSS feed tuščias');
  }

  return video;
}

/**
 * @param {{ videoId: string, title: string, url: string }} video
 */
function buildYoutubeEmbed(video) {
  return new EmbedBuilder()
    .setTitle(video.title)
    .setURL(video.url)
    .setColor(0xff0000)
    .setImage(`https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`);
}

/**
 * @param {string} videoUrl
 */
export function buildWatchButtons(videoUrl) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('Žiūrėti per YouTube')
      .setStyle(ButtonStyle.Link)
      .setURL(videoUrl)
      .setEmoji('🔴'),
    new ButtonBuilder()
      .setLabel('Žiūrėti per TikTok')
      .setStyle(ButtonStyle.Link)
      .setURL(TIKTOK_LIVE_URL)
      .setEmoji('🟣'),
  );
}

function pickAnnounceMessage() {
  return YOUTUBE_ANNOUNCE_MESSAGES[
    Math.floor(Math.random() * YOUTUBE_ANNOUNCE_MESSAGES.length)
  ];
}

export const youtubeAllowedMentions = { parse: ['everyone'] };

/**
 * @param {{ videoId: string, title: string, url: string }} video
 * @param {{ test?: boolean }} [options]
 */
function buildAnnouncementPayload(video, options = {}) {
  const content = options.test
    ? '🧪 Testinis YouTube skelbimas (nežymima kaip paskelbtas).'
    : `@everyone ${pickAnnounceMessage()}`;

  return {
    content,
    embeds: [buildYoutubeEmbed(video)],
    components: [buildWatchButtons(video.url)],
    allowedMentions: options.test ? { parse: [] } : youtubeAllowedMentions,
  };
}

/**
 * @param {import('discord.js').Client} client
 * @param {{ videoId: string, title: string, url: string }} video
 * @param {{ test?: boolean }} [options]
 */
async function announceVideo(client, video, options = {}) {
  const channel = await client.channels.fetch(config.youtubeAnnounceChannelId);
  if (!channel?.isTextBased()) {
    logWarn('youtube', 'Skelbimo kanalas nerastas arba ne tekstinis.');
    return false;
  }

  await channel.send(buildAnnouncementPayload(video, options));
  return true;
}

/**
 * @returns {Promise<string>}
 */
async function ensureYoutubeChannelId() {
  if (resolvedChannelId) return resolvedChannelId;

  const raw = config.youtubeChannelId.trim();
  const parsed = parseYoutubeChannelInput(raw);

  if (parsed?.type === 'id') {
    resolvedChannelId = parsed.value;
  } else if (parsed) {
    resolvedChannelId = await resolveYoutubeChannelId(raw);
    logConsole(
      'youtube',
      `Iš \`${raw}\` gautas kanalas \`${resolvedChannelId}\`. Rekomenduojama .env naudoti UC… id.`,
    );
  } else {
    throw new Error(
      'YOUTUBE_CHANNEL_ID neteisingas — naudok UC… id (About → Share channel).',
    );
  }

  migrateLegacyYoutubeState(resolvedChannelId);
  return resolvedChannelId;
}

/**
 * @param {import('discord.js').Client} client
 * @param {{ test?: boolean }} [options]
 */
export async function runYoutubeRssCheck(client, options = {}) {
  const ytChannelId = await ensureYoutubeChannelId();
  const video = await fetchNewestVideoFromRss(ytChannelId);

  if (options.test) {
    const posted = await announceVideo(client, video, { test: true });
    return {
      ok: posted,
      video,
      announced: false,
      skipped: false,
      test: true,
    };
  }

  if (isYoutubeVideoAnnounced(ytChannelId, video.videoId)) {
    return {
      ok: true,
      video,
      announced: false,
      skipped: true,
      test: false,
    };
  }

  const key = `${ytChannelId}:${video.videoId}`;
  if (announcingKeys.has(key)) {
    return {
      ok: true,
      video,
      announced: false,
      skipped: true,
      test: false,
    };
  }

  announcingKeys.add(key);
  try {
    const posted = await announceVideo(client, video);
    if (!posted) {
      return {
        ok: false,
        video,
        announced: false,
        skipped: false,
        test: false,
        error: 'Nepavyko išsiųsti į skelbimo kanalą.',
      };
    }

    markYoutubeVideoAnnounced(ytChannelId, video.videoId);
    setYoutubeLastVideoId(ytChannelId, video.videoId);
    lastRssErrorKey = null;

    logInfo(
      'youtube',
      `Naujas vaizdo įrašas paskelbtas\n\n**[${video.title}](${video.url})**`,
    );

    return {
      ok: true,
      video,
      announced: true,
      skipped: false,
      test: false,
    };
  } finally {
    announcingKeys.delete(key);
  }
}

/**
 * @param {import('discord.js').Client} client
 */
async function pollYoutubeRss(client) {
  try {
    await runYoutubeRssCheck(client);
  } catch (e) {
    const ytId = resolvedChannelId ?? config.youtubeChannelId;
    logRssIssue(`RSS klaida kanalui \`${ytId}\`: ${e?.message || e}`);
  }
}

/**
 * @param {import('discord.js').Client} client
 */
export async function startYoutubeRssPoll(client) {
  if (pollTimer || startTimer) return;

  try {
    const ytId = await ensureYoutubeChannelId();
    logConsole('youtube', `RSS kanalas: \`${ytId}\``);
  } catch (e) {
    logRssIssue(`YouTube RSS neaktyvus: ${e?.message || e}`);
    return;
  }

  startTimer = setTimeout(() => {
    startTimer = null;
    pollYoutubeRss(client).catch((e) => logError('youtube', 'RSS poll klaida', e));
    pollTimer = setInterval(() => {
      pollYoutubeRss(client).catch((e) => logError('youtube', 'RSS poll klaida', e));
    }, config.youtubePollMs);
    logConsole(
      'youtube',
      `RSS tikrinimas kas ${config.youtubePollMs} ms (pirmas po ${YOUTUBE_RSS_START_DELAY_MS} ms)`,
    );
  }, YOUTUBE_RSS_START_DELAY_MS);
}

export function stopYoutubeRssPoll() {
  if (startTimer) {
    clearTimeout(startTimer);
    startTimer = null;
  }
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

/**
 * @param {import('discord.js').Client} client
 */
export async function handleAdminLiveCheck(client) {
  return runYoutubeRssCheck(client);
}

/**
 * @param {import('discord.js').Client} client
 */
export async function handleAdminTestLive(client) {
  return runYoutubeRssCheck(client, { test: true });
}
