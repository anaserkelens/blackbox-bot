const { AuditLogEvent, Events } = require('discord.js');

const { config } = require('../utils/config');
const {
  colors,
  fetchAuditEntry,
  formatActor,
  formatChannel,
  formatCodeBlock,
  formatTimestamp,
  sendStructuredLog,
  truncate,
} = require('../utils/structuredLog');

module.exports = {
  name: Events.MessageBulkDelete,
  async execute(messages, channel, client) {
    if (!channel.guild) {
      return;
    }

    const entry = await fetchAuditEntry(
      channel.guild,
      AuditLogEvent.MessageBulkDelete,
      channel.id,
      15000,
    );
    const authors = new Map();
    const transcript = [...messages.values()]
      .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
      .slice(0, 50)
      .map((message) => {
        if (message.author) {
          authors.set(message.author.id, message.author.tag || message.author.username);
        }

        const content = truncate(message.content || '[No cached text content]', 300)
          .replaceAll('\n', ' ');
        return `[${new Date(message.createdTimestamp).toISOString()}] ${message.author?.tag || 'Unknown'}: ${content}`;
      })
      .join('\n');
    const authorSummary = [...authors.entries()]
      .map(([id, tag]) => `${tag} (\`${id}\`)`)
      .join('\n');

    await sendStructuredLog(client, config.channels.signalLog, {
      title: 'Messages Bulk Deleted',
      emoji: '🧹',
      color: colors.danger,
      summary: `**${messages.size.toLocaleString()}** messages were removed from ${channel}.`,
      referenceId: `PURGE-${channel.id}-${Date.now()}`,
      fields: [
        { name: 'Channel', value: formatChannel(channel) },
        { name: 'Deleted By', value: formatActor(entry) },
        { name: 'Audit Reason', value: entry?.reason || 'No reason provided.' },
        { name: 'Message Count', value: messages.size.toLocaleString() },
        { name: 'Unique Cached Authors', value: authorSummary || 'No cached author data' },
        { name: 'Oldest Cached Message', value: messages.first()?.createdTimestamp ? formatTimestamp(messages.first().createdTimestamp) : 'Unknown' },
        { name: 'Transcript (up to 50)', value: formatCodeBlock(transcript || 'No cached message content', 'text') },
      ],
    });
  },
};
