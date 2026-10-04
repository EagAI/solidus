import { MessageFlags } from 'discord.js';
import { config } from '../config.js';
import {
  GIVEAWAY_MODAL_ID,
  GIVEAWAY_ENTER_PREFIX,
  createGiveaway,
  parseGiveawayEndTime,
  parseImageUrl,
  parseWinnerCount,
  refreshGiveawayMessage,
} from '../services/giveaway.js';
import { getGiveaway, mutateGiveaway } from '../utils/giveawayStore.js';
import { isModerator } from '../utils/modCheck.js';
import { logError } from '../utils/logger.js';

/**
 * @param {import('discord.js').Client} client
 */
export function registerGiveaway(client) {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.guild || interaction.guild.id !== config.guildId) return;

    const isModal = interaction.isModalSubmit() && interaction.customId === GIVEAWAY_MODAL_ID;
    const isEnter =
      interaction.isButton() && interaction.customId.startsWith(GIVEAWAY_ENTER_PREFIX);
    if (!isModal && !isEnter) return;

    try {
      if (isModal) await handleGiveawayModal(interaction);
      else await handleGiveawayEnter(interaction);
    } catch (e) {
      logError('giveaway', 'Giveaway interakcijos klaida', e);
      if (!interaction.isRepliable()) return;
      if (interaction.deferred && !interaction.replied) {
        await interaction.editReply({ content: 'Įvyko klaida.' }).catch(() => {});
      } else if (!interaction.replied && !interaction.deferred) {
        await interaction
          .reply({ content: 'Įvyko klaida.', flags: MessageFlags.Ephemeral })
          .catch(() => {});
      }
    }
  });
}

/**
 * @param {import('discord.js').ModalSubmitInteraction} interaction
 */
async function handleGiveawayModal(interaction) {
  const member = interaction.member;
  if (!member || !isModerator(member)) {
    await interaction.reply({
      content: 'Neturi teisių kurti giveaway.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const title = interaction.fields.getTextInputValue('title').trim();
  const description = interaction.fields.getTextInputValue('description')?.trim() ?? '';
  const imageRaw = interaction.fields.getTextInputValue('image')?.trim() ?? '';
  const winnersRaw = interaction.fields.getTextInputValue('winners');
  const durationRaw = interaction.fields.getTextInputValue('duration');

  const winnerCount = parseWinnerCount(winnersRaw);
  if (!winnerCount) {
    await interaction.editReply({
      content: 'Laimėtojų skaičius turi būti nuo 1 iki 20.',
    });
    return;
  }

  const endResult = parseGiveawayEndTime(durationRaw);
  if ('error' in endResult) {
    await interaction.editReply({ content: endResult.error });
    return;
  }

  let imageUrl = null;
  if (imageRaw) {
    imageUrl = parseImageUrl(imageRaw);
    if (!imageUrl) {
      await interaction.editReply({
        content: 'Nuotraukos nuoroda turi prasidėti http:// arba https://',
      });
      return;
    }
  }

  if (!title) {
    await interaction.editReply({ content: 'Pavadinimas negali būti tuščias.' });
    return;
  }

  try {
    const record = await createGiveaway(interaction.client, interaction.user, {
      title,
      description,
      imageUrl,
      winnerCount,
      endsAt: endResult.endsAt,
    });

    await interaction.editReply({
      content: `Giveaway sukurtas kanale <#${record.channelId}>: https://discord.com/channels/${interaction.guild.id}/${record.channelId}/${record.messageId}`,
    });
  } catch (e) {
    logError('giveaway', 'Nepavyko sukurti giveaway', e);
    await interaction.editReply({ content: 'Nepavyko sukurti giveaway.' });
  }
}

/**
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function handleGiveawayEnter(interaction) {
  const giveawayId = interaction.customId.slice(GIVEAWAY_ENTER_PREFIX.length);
  const giveaway = getGiveaway(giveawayId);

  if (!giveaway || giveaway.ended) {
    await interaction.reply({
      content: 'Šis giveaway nebegalioja.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (Date.now() >= giveaway.endsAt) {
    await interaction.reply({
      content: 'Giveaway jau baigėsi.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (giveaway.entries.includes(interaction.user.id)) {
    await interaction.reply({
      content: 'Jau dalyvauji šiame giveaway.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  mutateGiveaway(giveawayId, (g) => {
    g.entries.push(interaction.user.id);
  });

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    await refreshGiveawayMessage(interaction.client, giveawayId);
    await interaction.editReply({
      content: '🎉 Esi giveaway dalyvių sąraše. Sėkmės!',
    });
  } catch (e) {
    logError('giveaway', 'Nepavyko atnaujinti giveaway po dalyvavimo', e);
    await interaction.editReply({ content: 'Dalyvavimas įrašytas, bet nepavyko atnaujinti skelbimo.' });
  }
}
