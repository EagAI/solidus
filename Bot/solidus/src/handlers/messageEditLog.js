import { config } from '../config.js';
import { getCachedMessage } from '../utils/messageContentCache.js';
import {
  buildMessageUrl,
  formatChannelRef,
  formatMessageContentCode,
} from '../utils/messageLogFormat.js';
import { logEmbed, logError } from '../utils/logger.js';

/**
 * @param {import('discord.js').Client} client
 */
export function registerMessageEditLog(client) {
  client.on('messageUpdate', async (oldMessage, newMessage) => {
    if (!newMessage.guild || newMessage.guild.id !== config.guildId) return;
    if (newMessage.author?.bot || newMessage.system || newMessage.webhookId) return;

    const cached = getCachedMessage(newMessage.id);
    const oldContent = oldMessage.content ?? cached?.content ?? null;
    const newContent = newMessage.content ?? null;

    if (oldContent === newContent) return;

    try {
      const author = newMessage.author;
      if (!author) return;

      const url = buildMessageUrl({
        guildId: newMessage.guildId,
        channelId: newMessage.channelId,
        id: newMessage.id,
      });
      const jump = url ? `[Eiti į žinutę](${url})` : '—';

      await logEmbed({
        title: 'Žinutė redaguota',
        description: jump,
        color: 0x7289da,
        fields: [
          {
            name: 'Narys',
            value: `<@${author.id}> (\`${author.tag}\`)`,
            inline: true,
          },
          { name: 'Kanalas', value: formatChannelRef(newMessage), inline: true },
          {
            name: 'Sena',
            value: formatMessageContentCode(oldContent ?? '*(nežinoma)*'),
            inline: false,
          },
          {
            name: 'Nauja',
            value: formatMessageContentCode(newContent),
            inline: false,
          },
        ],
      });
    } catch (e) {
      logError('messageEdit', 'Nepavyko užloginti redaguotos žinutės', e);
    }
  });
}
