import { MessageFlags } from 'discord.js';
import { isModerator } from '../utils/modCheck.js';
import { formatDurationLt, parseDurationMs } from '../utils/durationParse.js';
import { logError, logInfo } from '../utils/logger.js';

/**
 * @param {import('discord.js').User} moderator
 * @param {string | null | undefined} customReason
 * @returns {string}
 */
function buildReason(moderator, customReason) {
  const base = `Admin ${moderator.tag}`;
  const extra = customReason?.trim();
  if (!extra) return base.slice(0, 512);
  return `${base}: ${extra}`.slice(0, 512);
}

/**
 * @param {import('discord.js').GuildMember} actor
 * @param {import('discord.js').GuildMember} target
 * @returns {string | null}
 */
function assertCanModerateMember(actor, target) {
  if (target.id === actor.id) {
    return 'Negali moderuoti savęs.';
  }
  if (target.id === target.guild.ownerId) {
    return 'Negali moderuoti serverio savininko.';
  }
  if (isModerator(target) && actor.id !== target.guild.ownerId) {
    return 'Negali moderuoti kito moderatoriaus.';
  }
  if (!target.manageable) {
    return 'Negali moderuoti šio nario (rolės hierarchija arba trūksta bot teisių).';
  }
  return null;
}

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
export async function handleAdminBan(interaction) {
  const targetUser = interaction.options.getUser('user', true);
  const reasonText = interaction.options.getString('priezastis');
  const reason = buildReason(interaction.user, reasonText);

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    if (targetMember) {
      const blockReason = assertCanModerateMember(interaction.member, targetMember);
      if (blockReason) {
        await interaction.editReply({ content: blockReason });
        return;
      }
      await targetMember.ban({ reason });
    } else {
      await interaction.guild.bans.create(targetUser.id, { reason });
    }

    const reasonNote = reasonText?.trim() ? `\n• Priežastis: ${reasonText.trim()}` : '';
    logInfo(
      'admin',
      `**${interaction.user.tag}** užbanino **${targetUser.tag}**\n<@${targetUser.id}>${reasonNote}`,
    );

    await interaction.editReply({
      content: `**${targetUser.tag}** užbanintas.${reasonText?.trim() ? `\nPriežastis: ${reasonText.trim()}` : ''}`,
    });
  } catch (e) {
    logError('admin', 'Ban nepavyko', e);
    await interaction.editReply({
      content: `Nepavyko užbaninti: ${e?.message || e}`,
    });
  }
}

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
export async function handleAdminKick(interaction) {
  const targetUser = interaction.options.getUser('user', true);
  const reasonText = interaction.options.getString('priezastis');
  const reason = buildReason(interaction.user, reasonText);

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    const targetMember = await interaction.guild.members.fetch(targetUser.id);
    const blockReason = assertCanModerateMember(interaction.member, targetMember);
    if (blockReason) {
      await interaction.editReply({ content: blockReason });
      return;
    }

    await targetMember.kick(reason);

    const reasonNote = reasonText?.trim() ? `\n• Priežastis: ${reasonText.trim()}` : '';
    logInfo(
      'admin',
      `**${interaction.user.tag}** išmetė **${targetUser.tag}**\n<@${targetUser.id}>${reasonNote}`,
    );

    await interaction.editReply({
      content: `**${targetUser.tag}** išmestas iš serverio.${reasonText?.trim() ? `\nPriežastis: ${reasonText.trim()}` : ''}`,
    });
  } catch (e) {
    if (e?.code === 10007 || e?.message?.includes('Unknown Member')) {
      await interaction.editReply({ content: 'Narys nerastas serveryje.' });
      return;
    }
    logError('admin', 'Kick nepavyko', e);
    await interaction.editReply({
      content: `Nepavyko išmesti: ${e?.message || e}`,
    });
  }
}

const BOMB_TIMEOUT_MS = 10_000;

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
export async function handleAdminBomb(interaction) {
  const targetUser = interaction.options.getUser('user', true);
  const reason = buildReason(interaction.user, 'bomb');

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    const targetMember = await interaction.guild.members.fetch(targetUser.id);
    const blockReason = assertCanModerateMember(interaction.member, targetMember);
    if (blockReason) {
      await interaction.editReply({ content: blockReason });
      return;
    }

    await targetMember.timeout(BOMB_TIMEOUT_MS, reason);

    const channel = interaction.channel;
    if (channel?.isTextBased() && !channel.isDMBased()) {
      await channel.send({
        content: `<@${interaction.user.id}> nubombino <@${targetUser.id}>`,
        allowedMentions: { users: [interaction.user.id, targetUser.id] },
      });
    }

    logInfo(
      'admin',
      `**${interaction.user.tag}** bomb → **${targetUser.tag}** (10s)\n<@${targetUser.id}>`,
    );

    await interaction.editReply({
      content: `💣 **${targetUser.tag}** nubombintas (10s).`,
    });
  } catch (e) {
    if (e?.code === 10007 || e?.message?.includes('Unknown Member')) {
      await interaction.editReply({ content: 'Narys nerastas serveryje.' });
      return;
    }
    logError('admin', 'Bomb nepavyko', e);
    await interaction.editReply({
      content: `Nepavyko nubombinti: ${e?.message || e}`,
    });
  }
}

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
export async function handleAdminTimeout(interaction) {
  const targetUser = interaction.options.getUser('user', true);
  const durationRaw = interaction.options.getString('trukme', true);
  const parsed = parseDurationMs(durationRaw);

  if ('error' in parsed) {
    await interaction.reply({ content: parsed.error, flags: MessageFlags.Ephemeral });
    return;
  }

  const reason = buildReason(interaction.user, null);

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    const targetMember = await interaction.guild.members.fetch(targetUser.id);
    const blockReason = assertCanModerateMember(interaction.member, targetMember);
    if (blockReason) {
      await interaction.editReply({ content: blockReason });
      return;
    }

    await targetMember.timeout(parsed.ms, reason);

    const durationLabel = formatDurationLt(parsed.ms);
    logInfo(
      'admin',
      `**${interaction.user.tag}** timeout **${targetUser.tag}** (${durationLabel})\n<@${targetUser.id}>`,
    );

    await interaction.editReply({
      content: `**${targetUser.tag}** gavo laiko limitą **${durationLabel}**.`,
    });
  } catch (e) {
    if (e?.code === 10007 || e?.message?.includes('Unknown Member')) {
      await interaction.editReply({ content: 'Narys nerastas serveryje.' });
      return;
    }
    logError('admin', 'Timeout nepavyko', e);
    await interaction.editReply({
      content: `Nepavyko taikyti laiko limito: ${e?.message || e}`,
    });
  }
}
