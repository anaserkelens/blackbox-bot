const { Events } = require('discord.js');

const { config } = require('../utils/config');
const {
  colors,
  formatChannel,
  formatCodeBlock,
  formatTimestamp,
  formatUser,
  sendStructuredLog,
} = require('../utils/structuredLog');

module.exports = {
  name: Events.MessageUpdate,
  async execute(oldMessage, newMessage, client) {
    if (!newMessage.guild || newMessage.author?.bot || oldMessage.content === newMessage.content) {
      return;
    }

    const oldAttachments = oldMessage.attachments?.map((attachment) => attachment.url).join('\n');
    const newAttachments = newMessage.attachments?.map((attachment) => attachment.url).join('\n');

    await sendStructuredLog(client, config.channels.signalLog, {
      title: 'Message Edited',
      emoji: '✏️',
      color: colors.warning,
      summary: `${newMessage.author} edited a message in ${newMessage.channel}.`,
      thumbnailUrl: newMessage.author?.displayAvatarURL({ size: 256 }),
      referenceId: `EDIT-${newMessage.id}`,
      fields: [
        { name: 'Author', value: newMessage.author ? formatUser(newMessage.author) : 'Unknown / uncached' },
        { name: 'Channel', value: formatChannel(newMessage.channel) },
        { name: 'Before', value: formatCodeBlock(oldMessage.content || 'No cached text content') },
        { name: 'After', value: formatCodeBlock(newMessage.content || 'No text content') },
        {
          name: 'Attachments Changed',
          value: oldAttachments === newAttachments
            ? 'No'
            : `**Before**\n${oldAttachments || 'None'}\n\n**After**\n${newAttachments || 'None'}`,
        },
        { name: 'Originally Sent', value: formatTimestamp(newMessage.createdTimestamp) },
        { name: 'Edited At', value: formatTimestamp(newMessage.editedTimestamp || Date.now()) },
        { name: 'Message ID', value: `\`${newMessage.id}\`` },
      ],
      links: newMessage.url ? [{ label: 'Open Message', url: newMessage.url }] : [],
    });
  },
};
