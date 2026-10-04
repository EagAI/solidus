import crypto from 'node:crypto';

const DISCORD_API = 'https://discord.com/api/v10';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const STATE_TTL_MS = 10 * 60 * 1000;
/** Discord rate-limits /users/@me/guilds hard; don't refetch more often. */
const GUILDS_REFRESH_MS = 30 * 1000;

const ADMINISTRATOR = 0x8n;
const MANAGE_GUILD = 0x20n;

/** @type {Map<string, any>} */
const sessions = new Map();
/** @type {Map<string, number>} OAuth `state` → expiry, guards the callback against CSRF. */
const pendingStates = new Map();

export function panelUrl() {
  return (process.env.PANEL_URL || 'http://localhost:5173').replace(/\/$/, '');
}

function redirectUri() {
  return `${panelUrl()}/api/auth/callback`;
}

function clientId(botUserId) {
  return process.env.DISCORD_CLIENT_ID || botUserId || '';
}

function isHttps() {
  return panelUrl().startsWith('https://');
}

function prune(map, now = Date.now()) {
  for (const [key, value] of map) {
    const expires = typeof value === 'number' ? value : value.expiresAt;
    if (expires < now) map.delete(key);
  }
}

export function loginRedirect(botUserId) {
  const id = clientId(botUserId);
  if (!id) return null;
  prune(pendingStates);
  const state = crypto.randomBytes(16).toString('hex');
  pendingStates.set(state, Date.now() + STATE_TTL_MS);
  const params = new URLSearchParams({
    client_id: id,
    redirect_uri: redirectUri(),
    response_type: 'code',
    scope: 'identify guilds',
    state,
    prompt: 'none',
  });
  return `https://discord.com/oauth2/authorize?${params}`;
}

export function consumeState(state) {
  const expires = state ? pendingStates.get(state) : undefined;
  if (expires === undefined) return false;
  pendingStates.delete(state);
  return expires > Date.now();
}

function sessionIdFrom(req) {
  const raw = req.headers.cookie || '';
  const match = raw.match(/(?:^|;\s*)solidus_session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function readSession(req) {
  const id = sessionIdFrom(req);
  if (!id) return null;
  const session = sessions.get(id);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    sessions.delete(id);
    return null;
  }
  return session;
}

export function destroySession(req) {
  const id = sessionIdFrom(req);
  if (id) sessions.delete(id);
}

export function sessionCookie(id) {
  const secure = isHttps() ? '; Secure' : '';
  return `solidus_session=${encodeURIComponent(id)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_MS / 1000}${secure}`;
}

export function clearSessionCookie() {
  const secure = isHttps() ? '; Secure' : '';
  return `solidus_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

async function discordGet(path, accessToken) {
  const res = await fetch(`${DISCORD_API}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const err = new Error(`Discord ${path}: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function finishLogin(code, botUserId) {
  const secret = process.env.DISCORD_CLIENT_SECRET;
  const id = clientId(botUserId);
  if (!secret || !id) {
    throw new Error('Trūksta DISCORD_CLIENT_ID arba DISCORD_CLIENT_SECRET .env faile.');
  }

  const tokenRes = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: id,
      client_secret: secret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri(),
    }),
  });
  if (!tokenRes.ok) throw new Error('Discord nepriėmė prisijungimo.');
  const token = await tokenRes.json();

  const [user, guilds] = await Promise.all([
    discordGet('/users/@me', token.access_token),
    discordGet('/users/@me/guilds', token.access_token),
  ]);

  prune(sessions);
  const sessionId = crypto.randomBytes(24).toString('hex');
  sessions.set(sessionId, {
    accessToken: token.access_token,
    expiresAt: Date.now() + Math.min(SESSION_TTL_MS, (token.expires_in || 604800) * 1000),
    user: {
      id: user.id,
      username: user.username,
      globalName: user.global_name || user.username,
      avatar: user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
        : null,
    },
    guilds,
    guildsFetchedAt: Date.now(),
  });
  return sessionId;
}

/**
 * Re-read the user's servers (e.g. they just created one or got promoted).
 * Throttled; on a Discord error the last known list is kept.
 */
export async function refreshGuilds(session, force = false) {
  if (!session) return;
  const age = Date.now() - (session.guildsFetchedAt || 0);
  if (!force && age < GUILDS_REFRESH_MS) return;
  if (force && age < 5000) return;
  try {
    session.guilds = await discordGet('/users/@me/guilds', session.accessToken);
    session.guildsFetchedAt = Date.now();
  } catch {
    session.guildsFetchedAt = Date.now();
  }
}

function canManage(guild) {
  const bits = BigInt(guild.permissions || 0);
  return (
    Boolean(guild.owner) ||
    (bits & ADMINISTRATOR) === ADMINISTRATOR ||
    (bits & MANAGE_GUILD) === MANAGE_GUILD
  );
}

/**
 * Every server the user is in, tagged with whether they can manage it
 * (= may invite bots / use the panel) and whether Solidus is already there.
 */
export function guildsForSession(session, botGuildIds) {
  const botSet = new Set(botGuildIds);
  const rank = (g) => (g.canManage && g.botIn ? 0 : g.canManage ? 1 : 2);
  return (session?.guilds || [])
    .map((guild) => ({
      id: guild.id,
      name: guild.name,
      icon: guild.icon
        ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${String(guild.icon).startsWith('a_') ? 'gif' : 'png'}?size=128`
        : null,
      owner: Boolean(guild.owner),
      canManage: canManage(guild),
      botIn: botSet.has(guild.id),
    }))
    .sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
}

/** True when this session may edit `guildId` through the panel. */
export function canManageGuild(session, guildId, botGuildIds) {
  if (!session || !guildId) return false;
  const guild = (session.guilds || []).find((g) => g.id === guildId);
  return Boolean(guild && canManage(guild) && botGuildIds.includes(guildId));
}
