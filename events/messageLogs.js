const { AuditLogEvent, Events } = require('discord.js');

const { config } = require('../utils/config');
const {
  colors,
  fetchAuditEntry,
  formatActor,
  formatChannel,
  formatCodeBlock,
  formatTimestamp,
  formatUser,
  sendStructuredLog,
  truncate,
} = require('../utils/structuredLog');

module.exports = {
  name: Events.MessageDelete,
  async execute(message, client) {
    if (!message.guild || message.author?.bot) {
      return;
    }

    const entry = await fetchAuditEntry(
      message.guild,
      AuditLogEvent.MessageDelete,
      message.author?.id,
      10000,
    );
    const attachments = message.attachments?.map((attachment) =>
      `[${attachment.name || 'attachment'}](${attachment.url})`
    ).join('\n');
    const stickers = message.stickers?.map((sticker) => `${sticker.name} (\`${sticker.id}\`)`).join(', ');

    await sendStructuredLog(client, config.channels.signalLog, {
      title: 'Message Deleted',
      emoji: '🗑️',
      color: colors.danger,
      summary: `A message was deleted in ${message.channel}.`,
      thumbnailUrl: message.author?.displayAvatarURL({ size: 256 }),
      referenceId: `DELETE-${message.id}`,
      fields: [
        { name: 'Author', value: message.author ? formatUser(message.author) : 'Unknown / uncached' },
        { name: 'Channel', value: formatChannel(message.channel) },
        { name: 'Deleted By', value: entry ? formatActor(entry) : 'Likely the author, a bot, or an uncached moderator action.' },
        { name: 'Audit Reason', value: entry?.reason || 'No audit-log reason provided.' },
        { name: 'Message Content', value: formatCodeBlock(message.content || 'No cached text content') },
        { name: 'Attachments', value: attachments || 'None' },
        { name: 'Stickers', value: stickers || 'None' },
        { name: 'Embed Count', value: String(message.embeds?.length || 0) },
        { name: 'Message Created', value: message.createdTimestamp ? formatTimestamp(message.createdTimestamp) : 'Unknown' },
        { name: 'Message ID', value: `\`${message.id}\`` },
        { name: 'Webhook ID', value: message.webhookId ? `\`${message.webhookId}\`` : 'Not a webhook message' },
        { name: 'System Message', value: message.system ? 'Yes' : 'No' },
      ],
    });
  },
};
