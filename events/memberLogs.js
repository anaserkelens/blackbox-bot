const { Events } = require('discord.js');

const { config } = require('../utils/config');
const {
  colors,
  formatDuration,
  formatTimestamp,
  formatUser,
  sendStructuredLog,
} = require('../utils/structuredLog');
const { createWelcomeAnnouncementPayload } = require('../utils/welcomeAnnouncement');
const { loadWelcomeEmbedSettings } = require('../utils/welcomeEmbedSettings');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member, client) {
    if (!member.user.bot && config.dashboard.features?.welcomeMessages !== false) {
      try {
        await sendWelcomeMessage(member, client);
      } catch (error) {
        console.error(`Failed to welcome member ${member.id}:`, error);
      }
    }

    if (!config.channels.entryLog || config.dashboard.features?.detailedLogging === false) {
      return;
    }

    const roles = member.roles.cache
      .filter((role) => role.id !== member.guild.id)
      .map((role) => role.toString())
      .join(', ');

    await sendStructuredLog(client, config.channels.entryLog, {
      title: 'Member Joined',
      emoji: '📥',
      color: colors.success,
      summary: `${member} joined **${member.guild.name}**.`,
      thumbnailUrl: member.user.displayAvatarURL({ size: 256 }),
      referenceId: `JOIN-${member.id}-${Date.now()}`,
      activity: {
        type: 'join',
        memberId: member.id,
        memberName: member.displayName,
        guildId: member.guild.id,
        action: 'joined',
      },
      fields: [
        { name: 'Member', value: formatUser(member.user) },
        {
          name: 'Account Created',
          value: `${formatTimestamp(member.user.createdTimestamp)}\n-# ${formatTimestamp(member.user.createdTimestamp, 'R')}`,
        },
        { name: 'Account Age', value: formatDuration(Date.now() - member.user.createdTimestamp) },
        { name: 'Server Member Count', value: member.guild.memberCount.toLocaleString() },
        { name: 'Initial Roles', value: roles || 'No assigned roles.' },
        { name: 'Membership Screening', value: member.pending ? 'Pending' : 'Completed / not enabled' },
      ],
    });
  },
};

async function sendWelcomeMessage(member, client) {
  const settings = await loadWelcomeEmbedSettings(config);
  const channelId = settings.channelId || config.channels.welcome;
  const channel = await client.channels.fetch(channelId);

  if (!channel?.isSendable()) {
    throw new Error(`Welcome channel ${channelId} was not found or is not sendable.`);
  }

  await channel.send(createWelcomeAnnouncementPayload(settings, member));
}
