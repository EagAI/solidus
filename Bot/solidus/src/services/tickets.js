import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  PermissionFlagsBits,
  StringSelectMenuBuilder,
} from 'discord.js';
import { queryOne, runSql } from '../db/database.js';
import { loadModules } from '../modules/settings.js';
import { config } from '../config.js';
import { isAdminOrModerator } from '../utils/modCheck.js';

function staffRoleIds() {
  const fromPanel = loadModules()
    .tickets.staffRoleIds.split(',')
    .map((id) => id.trim())
    .filter(Boolean);
  return fromPanel.length ? fromPanel : config.modRoleIds;
}

export function ticketPanelPayload() {
  const tickets = loadModules().tickets;
  const embed = new EmbedBuilder()
    .setTitle(tickets.title || 'Pagalba')
    .setDescription(tickets.description || 'Pasirinkite kategoriją.')
    .setColor(0x6b4eff);

  const options = (tickets.subcategories || []).slice(0, 25).map((item) => ({
    label: item.name.slice(0, 100),
    value: item.id.slice(0, 100),
  }));

  if (!options.length) {
    return { embeds: [embed], components: [] };
  }

  const row = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('ticket_category')
      .setPlaceholder('Pasirinkite kategoriją')
      .addOptions(options),
  );

  return { embeds: [embed], components: [row] };
}

export async function openTicket(interaction, categoryId) {
  const tickets = loadModules().tickets;
  if (!tickets.enabled) {
    await interaction.reply({ content: 'Tiketai išjungti panelėje.', ephemeral: true });
    return;
  }

  const category = tickets.subcategories.find((item) => item.id === categoryId);
  const existing = queryOne(
    `SELECT channel_id FROM support_tickets WHERE opener_id = ? AND status = 'open'`,
    [interaction.user.id],
  );
  if (existing?.channel_id) {
    await interaction.reply({
      content: `Jau turite atvirą tiketą: <#${existing.channel_id}>`,
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  const overwrites = [
    { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
    {
      id: interaction.user.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.AttachFiles,
      ],
    },
  ];
  for (const roleId of staffRoleIds()) {
    overwrites.push({
      id: roleId,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.ManageMessages,
      ],
    });
  }

  const channel = await interaction.guild.channels.create({
    name: `ticket-${interaction.user.username}`.slice(0, 90).toLowerCase(),
    type: ChannelType.GuildText,
    parent: tickets.categoryId || null,
    permissionOverwrites: overwrites,
  });

  const now = Date.now();
  runSql(
    `INSERT INTO support_tickets (guild_id, channel_id, opener_id, opener_name, category, status, opened_at)
     VALUES (?, ?, ?, ?, ?, 'open', ?)`,
    [
      interaction.guild.id,
      channel.id,
      interaction.user.id,
      interaction.user.username,
      category?.name || 'Bendra',
      now,
    ],
  );
  const created = queryOne('SELECT last_insert_rowid() AS id');
  const ticketId = Number(created?.id);

  const embed = new EmbedBuilder()
    .setTitle('Naujas tiketas')
    .setDescription(`**Narys:** ${interaction.user}\n**Kategorija:** ${category?.name || 'Bendra'}`)
    .setColor(0x57f287);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ticket_close').setLabel('Uždaryti').setStyle(ButtonStyle.Danger),
  );

  const sent = await channel.send({
    content: `${interaction.user}`,
    embeds: [embed],
    components: [row],
  });

  logTicketMessage(ticketId, {
    id: interaction.client.user.id,
    username: interaction.client.user.username,
    bot: true,
  }, `Tiketas atidarytas. Kategorija: ${category?.name || 'Bendra'}`, sent.createdTimestamp);

  await interaction.editReply({ content: `Tiketas sukurtas: ${channel}` });
}

export function logTicketMessage(ticketId, author, content, createdAt = Date.now()) {
  if (!ticketId || !content?.trim()) return;
  runSql(
    `INSERT INTO support_ticket_messages (ticket_id, author_id, author_name, author_bot, content, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [ticketId, author.id, author.username, author.bot ? 1 : 0, content.slice(0, 2000), createdAt],
  );
}

export async function closeTicket(interaction) {
  const member = interaction.member;
  if (!member || typeof member === 'string' || !isAdminOrModerator(member)) {
    await interaction.reply({ content: 'Tik staff gali uždaryti tiketą.', ephemeral: true });
    return;
  }

  const ticket = queryOne(
    `SELECT * FROM support_tickets WHERE channel_id = ? AND status = 'open'`,
    [interaction.channel.id],
  );
  if (!ticket) {
    await interaction.reply({ content: 'Šis kanalas nėra aktyvus tiketas.', ephemeral: true });
    return;
  }

  const now = Date.now();
  runSql(`UPDATE support_tickets SET status = 'closed', closed_at = ? WHERE id = ?`, [now, ticket.id]);
  logTicketMessage(
    Number(ticket.id),
    { id: interaction.user.id, username: interaction.user.username, bot: false },
    'Tiketas uždarytas.',
    now,
  );

  await interaction.reply({ content: 'Tiketas uždarytas. Istorija lieka panelėje.' });
  await interaction.channel.delete('Tiketas uždarytas').catch(() => {});
}

export function findOpenTicketByChannel(channelId) {
  return queryOne(
    `SELECT id FROM support_tickets WHERE channel_id = ? AND status = 'open'`,
    [channelId],
  );
}
