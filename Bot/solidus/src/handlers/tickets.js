import { closeTicket, findOpenTicketByChannel, logTicketMessage, openTicket } from '../services/tickets.js';

export function registerTickets(client) {
  client.on('interactionCreate', async (interaction) => {
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_category') {
      await openTicket(interaction, interaction.values[0]);
      return;
    }
    if (interaction.isButton() && interaction.customId === 'ticket_close') {
      await closeTicket(interaction);
    }
  });

  client.on('messageCreate', (message) => {
    if (!message.guild || !message.channel?.id) return;
    if (!message.content && message.attachments.size === 0) return;
    const ticket = findOpenTicketByChannel(message.channel.id);
    if (!ticket?.id) return;
    const content = message.content || (message.attachments.size ? '[priedas]' : '');
    logTicketMessage(
      Number(ticket.id),
      message.author,
      content,
      message.createdTimestamp,
    );
  });
}
