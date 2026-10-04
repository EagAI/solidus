import {
  getSetting,
  queryAll,
  runSqlNoSave,
  withTransaction,
} from '../db/database.js';

const defaultState = () => ({
  version: 1,
  verify: null,
  youtube: { lastVideoId: null, initialized: false },
  linkExceptions: {},
  voiceHub: null,
  voiceChannels: {},
});

/**
 * @returns {ReturnType<typeof defaultState>}
 */
function readStateFromDb() {
  const state = defaultState();
  state.verify = getSetting('verify');
  state.youtube = getSetting('youtube') ?? state.youtube;
  state.voiceHub = getSetting('voiceHub');

  for (const row of queryAll('SELECT user_id, expires_at FROM link_exceptions')) {
    state.linkExceptions[String(row.user_id)] = Number(row.expires_at);
  }

  for (const row of queryAll('SELECT channel_id, owner_id FROM voice_channels')) {
    state.voiceChannels[String(row.channel_id)] = { ownerId: String(row.owner_id) };
  }

  return state;
}

/**
 * @param {ReturnType<typeof defaultState>} next
 */
function writeStateToDb(next) {
  withTransaction(() => {
    if (next.verify != null) {
      runSqlNoSave(
        `INSERT INTO bot_settings (key, value) VALUES (?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
        ['verify', JSON.stringify(next.verify)],
      );
    } else {
      runSqlNoSave("DELETE FROM bot_settings WHERE key = 'verify'");
    }

    runSqlNoSave(
      `INSERT INTO bot_settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      ['youtube', JSON.stringify(next.youtube ?? { lastVideoId: null, initialized: false })],
    );

    if (next.voiceHub != null) {
      runSqlNoSave(
        `INSERT INTO bot_settings (key, value) VALUES (?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
        ['voiceHub', JSON.stringify(next.voiceHub)],
      );
    } else {
      runSqlNoSave("DELETE FROM bot_settings WHERE key = 'voiceHub'");
    }

    runSqlNoSave('DELETE FROM link_exceptions');
    for (const [userId, expiresAt] of Object.entries(next.linkExceptions ?? {})) {
      runSqlNoSave(
        'INSERT INTO link_exceptions (user_id, expires_at) VALUES (?, ?)',
        [userId, expiresAt],
      );
    }

    runSqlNoSave('DELETE FROM voice_channels');
    for (const [channelId, meta] of Object.entries(next.voiceChannels ?? {})) {
      if (!meta?.ownerId) continue;
      runSqlNoSave(
        'INSERT INTO voice_channels (channel_id, owner_id) VALUES (?, ?)',
        [channelId, meta.ownerId],
      );
    }
  });
}

let cache = null;

export function loadState() {
  if (cache) return cache;
  cache = readStateFromDb();
  return cache;
}

export function saveState(next) {
  writeStateToDb(next);
  cache = next;
}

export function mutateState(mutator) {
  const s = loadState();
  const next = mutator(structuredClone(s));
  saveState(next);
  return next;
}

/**
 * @param {import('discord.js').Client} client
 * @param {string} channelId
 * @param {string} messageId
 */
export async function verifyPersistedMessage(client, channelId, messageId) {
  if (!messageId) return false;
  try {
    const ch = await client.channels.fetch(channelId);
    if (!ch?.isTextBased()) return false;
    const msg = await ch.messages.fetch(messageId);
    if (msg.author.id !== client.user.id) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {string} userId
 * @returns {boolean}
 */
export function hasActiveLinkException(userId) {
  const state = loadState();
  const expiresAt = state.linkExceptions?.[userId];
  if (!expiresAt) return false;
  if (Date.now() >= expiresAt) return false;
  return true;
}

/**
 * @param {string} userId
 * @param {number} durationMs
 */
export function grantLinkException(userId, durationMs) {
  mutateState((s) => {
    s.linkExceptions[userId] = Date.now() + durationMs;
    return s;
  });
}

/**
 * @param {string} ownerId
 * @returns {string | null} channelId
 */
export function findVoiceChannelByOwner(ownerId) {
  const channels = loadState().voiceChannels ?? {};
  for (const [channelId, meta] of Object.entries(channels)) {
    if (meta.ownerId === ownerId) return channelId;
  }
  return null;
}

/**
 * @param {string} channelId
 */
export function getVoiceChannelRecord(channelId) {
  return loadState().voiceChannels?.[channelId] ?? null;
}

/**
 * @param {string} channelId
 * @param {string} ownerId
 */
export function addVoiceChannel(channelId, ownerId) {
  mutateState((s) => {
    for (const [id, meta] of Object.entries(s.voiceChannels)) {
      if (meta.ownerId === ownerId && id !== channelId) {
        delete s.voiceChannels[id];
      }
    }
    s.voiceChannels[channelId] = { ownerId };
    return s;
  });
}

/**
 * @param {string} channelId
 */
export function removeVoiceChannel(channelId) {
  mutateState((s) => {
    delete s.voiceChannels[channelId];
    return s;
  });
}

/**
 * @param {string | null} channelId
 */
export function setVoiceHubChannelId(channelId) {
  mutateState((s) => {
    s.voiceHub = channelId ? { channelId } : null;
    return s;
  });
}

/**
 * @returns {string | null}
 */
export function getVoiceHubChannelId() {
  return loadState().voiceHub?.channelId ?? null;
}
