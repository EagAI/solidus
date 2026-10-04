import { AttachmentBuilder, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { buildLygisImage } from '../utils/lygisImage.js';
import { logError } from '../utils/logger.js';

export const lygisCommand = new SlashCommandBuilder()
  .setName('lygis')
  .setDescription('Parodyti savo arba kito nario lygio kortelę')
  .addUserOption((opt) =>
    opt.setName('narys').setDescription('Narys (tuščia = jūs patys)').setRequired(false),
  );

/** @type {import('discord.js').ChatInputCommandInteraction} */
export async function executeLygis(interaction) {
  const target = interaction.options.getMember('narys') ?? interaction.member;

  if (!target || target.user?.bot) {
    await interaction.reply({
      content: 'Botai neturi lygių.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.deferReply();

  try {
    const buffer = await buildLygisImage(target);
    const attachment = new AttachmentBuilder(buffer, { name: 'lygis.png' });
    await interaction.editReply({ files: [attachment] });
  } catch (e) {
    logError('xp', 'Nepavyko sugeneruoti lygio kortelės', e);
    await interaction.editReply({ content: 'Nepavyko sugeneruoti lygio kortelės.' });
  }
}
