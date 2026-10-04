import { getSetting, queryOne, runSql } from '../db/database.js';

/**
 * @param {string} ytChannelId
 * @param {string} videoId
 */
export function isYoutubeVideoAnnounced(ytChannelId, videoId) {
  const row = queryOne(
    'SELECT 1 AS ok FROM youtube_announced_videos WHERE yt_channel_id = ? AND video_id = ?',
    [ytChannelId, videoId],
  );
  return row != null;
}

/**
 * @param {string} ytChannelId
 * @param {string} videoId
 */
export function markYoutubeVideoAnnounced(ytChannelId, videoId) {
  runSql(
    `INSERT OR IGNORE INTO youtube_announced_videos (yt_channel_id, video_id, announced_at)
     VALUES (?, ?, ?)`,
    [ytChannelId, videoId, Date.now()],
  );
}

/**
 * @param {string} ytChannelId
 * @param {string | null | undefined} videoId
 */
export function setYoutubeLastVideoId(ytChannelId, videoId) {
  if (!videoId) return;
  runSql(
    `INSERT INTO youtube_state (yt_channel_id, last_video_id)
     VALUES (?, ?)
     ON CONFLICT(yt_channel_id) DO UPDATE SET last_video_id = excluded.last_video_id`,
    [ytChannelId, videoId],
  );
}

/**
 * Senas bot_settings.youtube → youtube_announced_videos (vienkartinė migracija).
 * @param {string} ytChannelId
 */
export function migrateLegacyYoutubeState(ytChannelId) {
  const legacy = getSetting('youtube');
  if (!legacy?.initialized || !legacy?.lastVideoId) return;
  markYoutubeVideoAnnounced(ytChannelId, legacy.lastVideoId);
}
