import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { VC_LOCK, VC_UNLOCK } from '../constants.js';

/**
 * @param {boolean} locked
 */
export function buildVoicePanel(locked) {
  const embed = new EmbedBuilder()
    .setTitle('Balso kanalo valdymas')
    .setDescription(
      locked
        ? '🔒 Kanalas **užrakintas** — @everyone negali prisijungti, bet gali matyti kanalą.'
        : '🔓 Kanalas **atviras** — visi gali prisijungti.',
    )
    .setColor(locked ? 0xe03030 : 0x57f287);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(locked ? VC_UNLOCK : VC_LOCK)
      .setLabel(locked ? 'Atrakinti' : 'Užrakinti')
      .setEmoji(locked ? '🔓' : '🔒')
      .setStyle(locked ? ButtonStyle.Success : ButtonStyle.Danger),
  );

  return { embeds: [embed], components: [row] };
}
