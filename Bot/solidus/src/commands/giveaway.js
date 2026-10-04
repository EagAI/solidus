import {
  ActionRowBuilder,
  MessageFlags,
  ModalBuilder,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { GIVEAWAY_MODAL_ID, endGiveaway, rerollGiveaway } from '../services/giveaway.js';
import { getGiveawayByMessageId } from '../utils/giveawayStore.js';
import { isModerator } from '../utils/modCheck.js';
import { logError } from '../utils/logger.js';

export const giveawayCommand = new SlashCommandBuilder()
  .setName('giveaway')
  .setDescription('Giveaway valdymas')
  .addSubcommand((sub) =>
    sub.setName('create').setDescription('Sukurti giveaway (forma)'),
  )
  .addSubcommand((sub) =>
    sub
      .setName('end')
      .setDescription('Baigti giveaway anksčiau')
      .addStringOption((opt) =>
        opt
          .setName('zinute')
          .setDescription('Giveaway žinutės ID (dešiniuoju ant žinutės → Copy ID)')
          .setRequired(true),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName('reroll')
      .setDescription('Išrinkti naujus laimėtojus (baigtam giveaway)')
      .addStringOption((opt) =>
        opt
          .setName('zinute')
          .setDescription('Giveaway žinutės ID (dešiniuoju ant žinutės → Copy ID)')
          .setRequired(true),
      ),
  );

export function buildGiveawayCreateModal() {
  return new ModalBuilder()
    .setCustomId(GIVEAWAY_MODAL_ID)
    .setTitle('Naujas giveaway')
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('title')
          .setLabel('Pavadinimas')
          .setStyle(TextInputStyle.Short)
          .setMaxLength(256)
          .setRequired(true),
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('description')
          .setLabel('Aprašymas')
          .setStyle(TextInputStyle.Paragraph)
          .setMaxLength(2000)
          .setRequired(false),
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('image')
          .setLabel('Nuotraukos nuoroda (URL)')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('https://...')
          .setRequired(false),
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('winners')
          .setLabel('Laimėtojų skaičius (1–20)')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('1')
          .setRequired(true),
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('duration')
          .setLabel('Trukmė')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('1h, 2d, 1w, 2026-07-15 20:00')
          .setRequired(true),
      ),
    );
}

/** @type {import('discord.js').ChatInputCommandInteraction} */
export async function executeGiveaway(interaction) {
  const sub = interaction.options.getSubcommand();

  if (sub === 'create') {
    if (!interaction.member || !isModerator(interaction.member)) {
      await interaction.reply({
        content: 'Neturi teisių kurti giveaway.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.showModal(buildGiveawayCreateModal());
    return;
  }

  if (sub === 'end') {
    if (!interaction.member || !isModerator(interaction.member)) {
      await interaction.reply({
        content: 'Neturi teisių baigti giveaway.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const messageId = interaction.options.getString('zinute', true);
    const giveaway = getGiveawayByMessageId(messageId);

    if (!giveaway) {
      await interaction.reply({
        content: 'Giveaway pagal šį žinutės ID nerastas.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (giveaway.ended) {
      await interaction.reply({
        content: 'Šis giveaway jau baigtas.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      await endGiveaway(interaction.client, giveaway.id);
      await interaction.editReply({ content: 'Giveaway baigtas ir laimėtojai išrinkti.' });
    } catch (e) {
      logError('giveaway', 'Nepavyko baigti giveaway', e);
      await interaction.editReply({ content: 'Nepavyko baigti giveaway.' });
    }
    return;
  }

  if (sub === 'reroll') {
    if (!interaction.member || !isModerator(interaction.member)) {
      await interaction.reply({
        content: 'Neturi teisių reroll giveaway.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const messageId = interaction.options.getString('zinute', true);
    const giveaway = getGiveawayByMessageId(messageId);

    if (!giveaway) {
      await interaction.reply({
        content: 'Giveaway pagal šį žinutės ID nerastas.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const result = await rerollGiveaway(interaction.client, giveaway.id);
    if ('error' in result) {
      await interaction.editReply({ content: result.error });
      return;
    }

    const winText =
      result.winners.length > 0
        ? result.winners.map((id) => `<@${id}>`).join(', ')
        : 'laimėtojų nėra';

    await interaction.editReply({
      content: `Reroll atliktas — nauji laimėtojai: ${winText}`,
    });
  }
}
