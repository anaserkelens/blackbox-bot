const { Events } = require('discord.js');

const { config } = require('../utils/config');
const {
  colors,
  formatChannel,
  formatCodeBlock,
  formatDuration,
  formatUser,
  sendStructuredLog,
} = require('../utils/structuredLog');

const inviteRegex = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/[a-zA-Z0-9]+/gi;

module.exports = {
  name: Events.MessageCreate,
  async execute(message, client) {
    if (!config.invites.enabled || message.author.bot || !message.guild) {
      return;
    }

    const invites = message.content.match(inviteRegex);

    if (!invites) {
      return;
    }

    const isAllowed = invites.every((invite) =>
      config.invites.allowedPatterns.some((pattern) => invite.toLowerCase().includes(pattern.toLowerCase())),
    );

    if (isAllowed) {
      return;
    }

    await message.delete().catch(() => null);
    await message.member?.timeout(config.invites.timeoutMs, 'Posted unauthorized Discord invite link').catch(() => null);

    await sendStructuredLog(client, config.channels.entryLog, {
      title: 'Unauthorized Invite Blocked',
      emoji: '🚫',
      color: colors.warning,
      summary: `${message.author} posted an unauthorized Discord invite.`,
      thumbnailUrl: message.author.displayAvatarURL({ size: 256 }),
      referenceId: `INVITE-BLOCK-${message.id}`,
      fields: [
        { name: 'Posted By', value: formatUser(message.author) },
        { name: 'Channel', value: formatChannel(message.channel) },
        { name: 'Detected Links', value: invites.map((invite) => `• ${invite}`).join('\n') },
        { name: 'Original Message', value: formatCodeBlock(message.content) },
        {
          name: 'Automated Action',
          value: `Message deleted\nMember timed out for **${formatDuration(config.invites.timeoutMs)}**`,
        },
        { name: 'Message ID', value: `\`${message.id}\`` },
      ],
    });
  },
};
