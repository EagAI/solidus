import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.join(__dirname, '../../data/panel-modules.json');

export const DEFAULT_MODULES = {
  entrance: {
    enabled: true,
    style: 'banner',
    channelId: '',
  },
  goodbye: {
    enabled: false,
    channelId: '',
    message: 'Viso gero, {user}.',
  },
  autorole: {
    enabled: true,
    roleId: '',
  },
  levels: {
    enabled: true,
    backgroundUrl: '',
  },
  leaderboard: {
    enabled: true,
    accent: '#f26522',
  },
  parukom: {
    enabled: true,
    xp: 35,
    roleId: '',
  },
  slap: {
    enabled: false,
    gifUrl: 'https://klipy.com/gifs/slap-13622',
    timeoutMin: 5,
    xpPenalty: 1000,
  },
  tickets: {
    enabled: true,
    categoryId: '',
    staffRoleIds: '',
    title: 'Pagalba',
    description:
      'Jeigu turite klausimų ar norite kažką pranešti, paspauskite „Atidaryti ticket".',
    subcategories: [
      { id: 'help', name: 'Pagalba' },
      { id: 'report', name: 'Pranešimas' },
      { id: 'question', name: 'Klausimas' },
    ],
    history: [],
  },
  extras: {
    hitcar: false,
    jail: false,
    economy: false,
  },
};

function isHex(value) {
  return /^#([0-9a-fA-F]{6})$/.test(value);
}

export function mergeModules(partial) {
  const base = structuredClone(DEFAULT_MODULES);
  if (!partial || typeof partial !== 'object' || partial.guilds) return base;
  for (const key of Object.keys(base)) {
    if (partial[key] && typeof partial[key] === 'object' && !Array.isArray(partial[key])) {
      Object.assign(base[key], partial[key]);
    } else if (partial[key] !== undefined) {
      base[key] = partial[key];
    }
  }
  if (!isHex(base.leaderboard.accent)) base.leaderboard.accent = DEFAULT_MODULES.leaderboard.accent;
  if (base.entrance.style !== 'card') base.entrance.style = 'banner';
  return base;
}

function readStore() {
  try {
    const raw = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    if (raw?.guilds && typeof raw.guilds === 'object') return raw;
    if (raw?.entrance) return { guilds: { default: raw } };
  } catch {
    /* naujas failas */
  }
  return { guilds: {} };
}

function writeStore(store) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(store, null, 2));
}

export function loadModules(guildId = 'default') {
  const store = readStore();
  return mergeModules(store.guilds[guildId] || store.guilds.default);
}

export function saveModules(partial, guildId = 'default') {
  const store = readStore();
  const next = mergeModules({ ...(store.guilds[guildId] || {}), ...partial });
  store.guilds[guildId] = next;
  writeStore(store);
  return next;
}
