import http from 'node:http';
import { loadModules, saveModules } from './settings.js';
import { listSupportTicketMessages, listSupportTickets } from './ticketsDb.js';
import { botStatusPayload, getBotClient } from './runtime.js';
import { registerSlashCommands } from '../commands/register.js';
import { uptimePayload } from './uptime.js';
import {
  canManageGuild,
  clearSessionCookie,
  consumeState,
  destroySession,
  finishLogin,
  guildsForSession,
  loginRedirect,
  panelUrl,
  readSession,
  refreshGuilds,
  sessionCookie,
} from './auth.js';

const PORT = Number(process.env.PANEL_API_PORT || 3847);
/** 127.0.0.1 locally; 0.0.0.0 when the site's nginx proxies from another host/container. */
const HOST = process.env.PANEL_API_HOST || '127.0.0.1';

/** Administrator — same as the panel's "Pakviesti" button always used. */
const INVITE_PERMISSIONS = '8';

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

function redirect(res, location, headers = {}) {
  res.writeHead(302, { Location: location, ...headers });
  res.end();
}

function botGuildIds(bot) {
  return bot ? [...bot.guilds.cache.keys()] : [];
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) req.destroy();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(raw || '{}'));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

async function handle(req, res) {
  const url = new URL(req.url || '/', 'http://127.0.0.1');
  const bot = getBotClient();
  const path = url.pathname;

  // ——— Auth ———
  if (path === '/api/auth/login' && req.method === 'GET') {
    const target = loginRedirect(bot?.user?.id);
    if (!target) return send(res, 503, { error: 'Botas dar neprisijungė prie Discord.' });
    return redirect(res, target);
  }

  if (path === '/api/auth/callback' && req.method === 'GET') {
    const code = url.searchParams.get('code');
    if (!code || !consumeState(url.searchParams.get('state'))) {
      return redirect(res, `${panelUrl()}/panel?login=failed`);
    }
    try {
      const sessionId = await finishLogin(code, bot?.user?.id);
      return redirect(res, `${panelUrl()}/panel`, { 'Set-Cookie': sessionCookie(sessionId) });
    } catch (err) {
      console.error('[panel-api] login', err);
      return redirect(res, `${panelUrl()}/panel?login=failed`);
    }
  }

  if (path === '/api/auth/me' && req.method === 'GET') {
    const session = readSession(req);
    if (!session) return send(res, 401, { user: null });
    await refreshGuilds(session, url.searchParams.get('refresh') === '1');
    return send(res, 200, {
      user: session.user,
      guilds: guildsForSession(session, botGuildIds(bot)),
    });
  }

  if (path === '/api/auth/logout' && req.method === 'POST') {
    destroySession(req);
    res.writeHead(204, { 'Set-Cookie': clearSessionCookie() });
    return res.end();
  }

  if (path === '/api/status' && req.method === 'GET') {
    return send(res, 200, botStatusPayload());
  }

  // Public: status page (current state + per-day uptime + outages).
  if (path === '/api/uptime' && req.method === 'GET') {
    return send(res, 200, uptimePayload(bot));
  }

  // Bot invite pre-selected to one server.
  if (path === '/api/invite' && req.method === 'GET') {
    if (!bot?.user) return send(res, 503, { error: 'Botas neprisijungęs.' });
    const params = new URLSearchParams({
      client_id: bot.user.id,
      permissions: INVITE_PERMISSIONS,
      scope: 'bot applications.commands',
    });
    const guildId = url.searchParams.get('guildId');
    if (guildId && /^\d{5,25}$/.test(guildId)) {
      params.set('guild_id', guildId);
      params.set('disable_guild_select', 'true');
    }
    return redirect(res, `https://discord.com/oauth2/authorize?${params}`);
  }

  // ——— Everything below edits/reads one server: must be logged in and manage it ———
  const guildId = String(req.headers['x-guild-id'] || url.searchParams.get('guildId') || '');
  const session = readSession(req);
  if (!session) return send(res, 401, { error: 'Prisijunk su Discord.' });
  if (!canManageGuild(session, guildId, botGuildIds(bot))) {
    return send(res, 403, { error: 'Neturi teisės valdyti šio serverio arba boto jame nėra.' });
  }

  if (path === '/api/tickets' && req.method === 'GET') {
    const status = url.searchParams.get('status') || 'all';
    const tickets = listSupportTickets(status).filter((t) => t.guildId === guildId);
    return send(res, 200, { tickets });
  }

  const ticketMatch = path.match(/^\/api\/tickets\/(\d+)$/);
  if (ticketMatch && req.method === 'GET') {
    const id = Number(ticketMatch[1]);
    const ticket =
      listSupportTickets('all').find((row) => row.id === id && row.guildId === guildId) ?? null;
    return send(res, ticket ? 200 : 404, {
      ticket,
      messages: ticket ? listSupportTicketMessages(id) : [],
    });
  }

  if (path === '/api/modules') {
    if (req.method === 'GET') return send(res, 200, loadModules(guildId));
    if (req.method === 'PUT') {
      let body;
      try {
        body = await readBody(req);
      } catch {
        return send(res, 400, { error: 'invalid json' });
      }
      const saved = saveModules(body, guildId);
      if (bot?.user) registerSlashCommands(bot, guildId).catch(() => {});
      return send(res, 200, saved);
    }
    return send(res, 405, { error: 'method' });
  }

  return send(res, 404, { error: 'not found' });
}

export function startPanelApi() {
  const server = http.createServer((req, res) => {
    handle(req, res).catch((err) => {
      console.error('[panel-api]', err);
      if (!res.headersSent) send(res, 500, { error: 'server' });
    });
  });

  server.listen(PORT, HOST, () => {
    console.log(`[panel-api] http://${HOST}:${PORT}/api`);
  });
}
