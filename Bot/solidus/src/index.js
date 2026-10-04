import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { config } from './config.js';
import { initDatabase } from './db/database.js';
import { registerHandlers, runAfterReady } from './handlers/index.js';
import { initLogClient, logError, logInfo } from './utils/logger.js';
import { startPanelApi } from './modules/api.js';
import { setBotClient } from './modules/runtime.js';
import { startUptimeTracking } from './modules/uptime.js';

await initDatabase();
startPanelApi();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildModeration,
  ],
  partials: [Partials.Message, Partials.Channel],
});

registerHandlers(client);
setBotClient(client);
// Starts before login so time spent failing to connect counts as downtime.
startUptimeTracking(client);

client.once('clientReady', async () => {
  initLogClient(client);
  logInfo('trikampainis', `Prisijungta kaip **${client.user.tag}**`);
  await runAfterReady(client);
});

client.on('error', (err) => logError('trikampainis', 'Kliento klaida', err));

client.login(config.token);
