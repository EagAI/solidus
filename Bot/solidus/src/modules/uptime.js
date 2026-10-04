import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Real uptime for the status page. Once a minute we note whether the bot is
 * connected to Discord. If the process was down (crash, deploy, server off),
 * the gap since the last heartbeat is counted as downtime and logged as an
 * outage — so restarts don't silently disappear from the history.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.join(__dirname, '../../data/uptime.json');

const BEAT_MS = 60_000;
/** A gap longer than this between heartbeats = the bot was down. */
const GAP_MS = 3 * 60_000;
const KEEP_DAYS = 90;
const KEEP_OUTAGES = 30;

/** @type {{ since: number, lastBeat: number, days: Record<string, { up: number, total: number }>, outages: { start: number, end: number }[] }} */
let store = load();
let startedAt = Date.now();
let lastOnline = false;

function load() {
  try {
    const raw = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    if (raw && typeof raw.since === 'number' && raw.days) return raw;
  } catch {
    /* first run */
  }
  return { since: Date.now(), lastBeat: 0, days: {}, outages: [] };
}

function save() {
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(store));
  } catch (err) {
    console.error('[uptime] save', err);
  }
}

function dayKey(ts) {
  return new Date(ts).toISOString().slice(0, 10);
}

function bump(ts, up) {
  const key = dayKey(ts);
  const day = (store.days[key] ??= { up: 0, total: 0 });
  day.total += 1;
  if (up) day.up += 1;
}

function prune() {
  const keys = Object.keys(store.days).sort();
  for (const key of keys.slice(0, Math.max(0, keys.length - KEEP_DAYS))) delete store.days[key];
  store.outages = store.outages.slice(-KEEP_OUTAGES);
}

/** @param {import('discord.js').Client} client */
function beat(client) {
  const now = Date.now();
  if (store.lastBeat && now - store.lastBeat > GAP_MS) {
    // Process was not running: every missed minute counts as down.
    for (let t = store.lastBeat + BEAT_MS; t < now; t += BEAT_MS) bump(t, false);
    store.outages.push({ start: store.lastBeat, end: now });
  }
  lastOnline = Boolean(client.isReady());
  bump(now, lastOnline);
  store.lastBeat = now;
  prune();
  save();
}

/** @param {import('discord.js').Client} client */
export function startUptimeTracking(client) {
  startedAt = Date.now();
  beat(client);
  setInterval(() => beat(client), BEAT_MS).unref();
}

/** @param {import('discord.js').Client | null} client */
export function uptimePayload(client) {
  const online = Boolean(client?.isReady());
  const days = Object.entries(store.days)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, d]) => ({
      date,
      uptime: d.total ? Math.round((d.up / d.total) * 10000) / 100 : null,
    }));
  return {
    online,
    pingMs: online && client.ws.ping >= 0 ? Math.round(client.ws.ping) : null,
    guilds: online ? client.guilds.cache.size : null,
    startedAt,
    trackedSince: store.since,
    days,
    outages: [...store.outages].reverse().map((o) => ({
      start: o.start,
      end: o.end,
      minutes: Math.round((o.end - o.start) / 60_000),
    })),
  };
}
