import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import {
  handleAdminBan,
  handleAdminKick,
  handleAdminTimeout,
  handleAdminBomb,
} from '../services/adminModeration.js';
import { handleAdminLiveCheck, handleAdminTestLive } from '../services/youtubeRss.js';
import { isModerator } from '../utils/modCheck.js';
import {
  clearLygisBackground,
  getLygisBackground,
  setLygisBackground,
  validateLygisBackgroundUrl,
  verifyLygisBackgroundImage,
} from '../utils/lygisBackgroundStore.js';
import { logError, logInfo, logConsole } from '../utils/logger.js';

const MAX_BULK_DELETE = 100;
const DEFAULT_PURGE_AMOUNT = MAX_BULK_DELETE;

export const adminCommand = new SlashCommandBuilder()
  .setName('admin')
  .setDescription('Admin komandos')
  .addSubcommand((sub) =>
    sub
      .setName('ban')
      .setDescription('Užbanina narį')
      .addUserOption((opt) =>
        opt.setName('user').setDescription('Narys').setRequired(true),
      )
      .addStringOption((opt) =>
        opt.setName('priezastis').setDescription('Priežastis (nebūtina)').setRequired(false),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName('kick')
      .setDescription('Išmeta narį iš serverio')
      .addUserOption((opt) =>
        opt.setName('user').setDescription('Narys').setRequired(true),
      )
      .addStringOption((opt) =>
        opt.setName('priezastis').setDescription('Priežastis (nebūtina)').setRequired(false),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName('timeout')
      .setDescription('Taiko laiko limitą nariui')
      .addUserOption((opt) =>
        opt.setName('user').setDescription('Narys').setRequired(true),
      )
      .addStringOption((opt) =>
        opt
          .setName('trukme')
          .setDescription('Trukmė: 30min, 2h, 1d, 60 (minutės)')
          .setRequired(true),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName('bomb')
      .setDescription('Nubombina narį (10s timeout + pranešimas kanale)')
      .addUserOption((opt) =>
        opt.setName('user').setDescription('Narys').setRequired(true),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName('lygisbg')
      .setDescription('Nustatyti / nuimti custom /lygis kortelės foną')
      .addUserOption((opt) =>
        opt.setName('user').setDescription('Narys').setRequired(true),
      )
      .addStringOption((opt) =>
        opt
          .setName('url')
          .setDescription('Nuotraukos URL (https://...) — palik tuščią su nuimti')
          .setRequired(false),
      )
      .addBooleanOption((opt) =>
        opt.setName('nuimti').setDescription('Nuimti custom foną').setRequired(false),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName('purge')
      .setDescription('Ištrina žinutes šiame kanale')
      .addIntegerOption((opt) =>
        opt
          .setName('amount')
          .setDescription(`Kiek žinučių trinti (numatyta ${DEFAULT_PURGE_AMOUNT} — max vienu kartu)`)
          .setMinValue(1)
          .setMaxValue(1000)
          .setRequired(false),
      ),
  )
  .addSubcommandGroup((group) =>
    group
      .setName('live')
      .setDescription('YouTube RSS')
      .addSubcommand((sub) =>
        sub
          .setName('check')
          .setDescription('Tikrina RSS dabar; skelbia jei naujausias vaizdo įrašas dar nebuvo paskelbtas'),
      ),
  )
  .addSubcommandGroup((group) =>
    group
      .setName('test')
      .setDescription('Testai')
      .addSubcommand((sub) =>
        sub
          .setName('live')
          .setDescription('Testinis paskutinio RSS vaizdo įrašo skelbimas (be @everyone)'),
      ),
  );

/** @type {import('discord.js').ChatInputCommandInteraction} */
export async function executeAdmin(interaction) {
  const member = interaction.member;
  if (!member || !isModerator(member)) {
    await interaction.reply({
      content: 'Neturi teisių naudoti šios komandos.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const sub = interaction.options.getSubcommand();
  const group = interaction.options.getSubcommandGroup(false);

  if (group === 'live' && sub === 'check') {
    await handleLiveCheck(interaction);
    return;
  }

  if (group === 'test' && sub === 'live') {
    await handleTestLive(interaction);
    return;
  }

  if (sub === 'ban') {
    await handleAdminBan(interaction);
    return;
  }

  if (sub === 'kick') {
    await handleAdminKick(interaction);
    return;
  }

  if (sub === 'timeout') {
    await handleAdminTimeout(interaction);
    return;
  }

  if (sub === 'bomb') {
    await handleAdminBomb(interaction);
    return;
  }

  if (sub === 'lygisbg') {
    await handleLygisBg(interaction);
    return;
  }

  if (sub === 'purge') {
    await handlePurge(interaction);
  }
}

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
async function handleLygisBg(interaction) {
  const targetUser = interaction.options.getUser('user', true);
  const remove = interaction.options.getBoolean('nuimti') ?? false;
  const urlRaw = interaction.options.getString('url');

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  if (remove) {
    const removed = clearLygisBackground(targetUser.id);
    if (!removed) {
      await interaction.editReply({
        content: `**${targetUser.tag}** neturėjo custom fono.`,
      });
      return;
    }

    logInfo('admin', `**${interaction.user.tag}** nuėmė /lygis foną → **${targetUser.tag}**`);
    await interaction.editReply({
      content: `Custom /lygis fonas nuimtas nuo **${targetUser.tag}**.`,
    });
    return;
  }

  if (!urlRaw?.trim()) {
    const current = getLygisBackground(targetUser.id);
    if (!current) {
      await interaction.editReply({
        content: `**${targetUser.tag}** neturi custom /lygis fono.\nNaudok \`url:\` su nuotraukos nuoroda.`,
      });
      return;
    }
    await interaction.editReply({
      content: `**${targetUser.tag}** dabartinis fonas:\n${current.url}`,
    });
    return;
  }

  const validated = validateLygisBackgroundUrl(urlRaw);
  if (!validated.ok) {
    await interaction.editReply({ content: validated.error });
    return;
  }

  const preview = await verifyLygisBackgroundImage(validated.url);
  if (!preview.ok) {
    logConsole('admin', `lygisbg URL preview: ${preview.error} (${validated.url})`);
    await interaction.editReply({ content: preview.error });
    return;
  }

  setLygisBackground(targetUser.id, validated.url, interaction.user.id);
  logInfo(
    'admin',
    `**${interaction.user.tag}** nustatė /lygis foną → **${targetUser.tag}**\n${validated.url}`,
  );

  await interaction.editReply({
    content: `Custom /lygis fonas nustatytas **${targetUser.tag}**.`,
  });
}

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
async function handleLiveCheck(interaction) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    const result = await handleAdminLiveCheck(interaction.client);
    if (!result.ok) {
      await interaction.editReply({
        content: result.error || 'RSS patikra nepavyko.',
      });
      return;
    }

    if (result.skipped) {
      await interaction.editReply({
        content: `Naujausias vaizdo įrašas jau paskelbtas: **${result.video.title}**`,
      });
      return;
    }

    if (result.announced) {
      logInfo('admin', `**${interaction.user.tag}** /admin live check → ${result.video.url}`);
      await interaction.editReply({
        content: `Paskelbta: **${result.video.title}**`,
      });
      return;
    }

    await interaction.editReply({ content: 'Patikra baigta.' });
  } catch (e) {
    logError('admin', '/admin live check nepavyko', e);
    await interaction.editReply({
      content: `RSS klaida: ${e?.message || e}`,
    });
  }
}

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
async function handleTestLive(interaction) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    const result = await handleAdminTestLive(interaction.client);
    if (!result.ok) {
      await interaction.editReply({
        content: result.error || 'Testinis skelbimas nepavyko.',
      });
      return;
    }

    logInfo('admin', `**${interaction.user.tag}** /admin test live → ${result.video.url}`);
    await interaction.editReply({
      content: `Testinis skelbimas išsiųstas: **${result.video.title}** (nežymėta kaip paskelbta).`,
    });
  } catch (e) {
    logError('admin', '/admin test live nepavyko', e);
    await interaction.editReply({
      content: `RSS klaida: ${e?.message || e}`,
    });
  }
}

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
async function handlePurge(interaction) {
  const channel = interaction.channel;
  if (!channel?.isTextBased() || channel.isDMBased()) {
    await interaction.reply({
      content: 'Purge galima tik tekstiniame serverio kanale.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const amount = interaction.options.getInteger('amount') ?? DEFAULT_PURGE_AMOUNT;

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    let remaining = amount;
    let totalDeleted = 0;

    while (remaining > 0) {
      const batchSize = Math.min(remaining, MAX_BULK_DELETE);
      const deleted = await channel.bulkDelete(batchSize, true);
      totalDeleted += deleted.size;
      if (deleted.size === 0) break;
      remaining -= deleted.size;
    }

    logInfo(
      'admin',
      `**${interaction.user.tag}** purge ${totalDeleted}/${amount} → <#${channel.id}>`,
    );

    const note =
      totalDeleted < amount
        ? ' (senesnių nei 14 d. žinučių Discord neištrina masiniu būdu)'
        : '';

    await interaction.editReply({
      content: `Ištrinta **${totalDeleted}** žinučių kanale <#${channel.id}>.${note}`,
    });
  } catch (e) {
    logError('admin', 'Purge nepavyko', e);
    await interaction.editReply({
      content: 'Nepavyko ištrinti žinučių — patikrink ar botas turi **Manage Messages** teisę.',
    });
  }
}
