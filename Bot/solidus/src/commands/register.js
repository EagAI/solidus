import { REST, Routes, MessageFlags } from 'discord.js';
import { config } from '../config.js';
import { lyderiaiCommand, executeLyderiai } from './lyderiai.js';
import { lygisCommand, executeLygis } from './lygis.js';
import { adminCommand, executeAdmin } from './admin.js';
import { giveawayCommand, executeGiveaway } from './giveaway.js';
import { parukomCommand, executeParukom } from './parukom.js';
import { slapCommand, executeSlap } from './slap.js';
import { ticketCommand, executeTicket } from './ticket.js';
import { loadModules } from '../modules/settings.js';
import { logConsole, logError } from '../utils/logger.js';

const commands = new Map([
  ['lyderiai', executeLyderiai],
  ['lygis', executeLygis],
  ['admin', executeAdmin],
  ['giveaway', executeGiveaway],
  ['parukom', executeParukom],
  ['slap', executeSlap],
  ['ticket', executeTicket],
]);

/**
 * @param {import('discord.js').Client} client
 */
export async function registerSlashCommands(client, onlyGuildId) {
  if (!client.user) return;

  const guildIds = onlyGuildId
    ? [onlyGuildId]
    : [...client.guilds.cache.keys()];
  if (!guildIds.length && config.guildId) guildIds.push(config.guildId);

  const rest = new REST().setToken(config.token);
  for (const guildId of guildIds) {
    const modules = loadModules(guildId);
    const defs = [lyderiaiCommand, lygisCommand, adminCommand, giveawayCommand];
    if (modules.parukom.enabled) defs.push(parukomCommand);
    if (modules.slap.enabled) defs.push(slapCommand);
    if (modules.tickets.enabled) defs.push(ticketCommand);
    const body = defs.map((c) => c.toJSON());
    try {
      await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), { body });
      logConsole('xp', `Komandos ${guildId}: ${body.map((c) => c.name).join(', ')}`);
    } catch (e) {
      logError('xp', `Nepavyko registruoti komandų ${guildId}`, e);
    }
  }
}

/**
 * @param {import('discord.js').Client} client
 */
export function registerCommandInteractions(client) {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand() || !interaction.guild) return;
    if (interaction.guild.id !== config.guildId) return;

    const handler = commands.get(interaction.commandName);
    if (!handler) return;

    try {
      await handler(interaction);
    } catch (e) {
      logError('xp', `Komanda /${interaction.commandName} nepavyko`, e);
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ content: 'Įvyko klaida vykdant komandą.' }).catch(() => {});
      } else {
        await interaction.reply({ content: 'Įvyko klaida vykdant komandą.', flags: MessageFlags.Ephemeral }).catch(() => {});
      }
    }
  });
}
