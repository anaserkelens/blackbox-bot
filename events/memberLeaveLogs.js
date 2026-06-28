const { AuditLogEvent, Events } = require('discord.js');

const { config } = require('../utils/config');
const { hasRecentBotModerationAction } = require('../utils/moderationActions');
const {
  colors,
  fetchAuditEntry,
  formatActor,
  formatDuration,
  formatTimestamp,
  formatUser,
  sendStructuredLog,
} = require('../utils/structuredLog');

module.exports = {
  name: Events.GuildMemberRemove,
  async execute(member, client) {
    if (
      hasRecentBotModerationAction('kick', member.guild.id, member.id) ||
      hasRecentBotModerationAction('ban', member.guild.id, member.id)
    ) {
      return;
    }

    const banEntry = await fetchAuditEntry(member.guild, AuditLogEvent.MemberBanAdd, member.id, 10000);

    if (banEntry) {
      return;
    }

    const kickEntry = await fetchAuditEntry(member.guild, AuditLogEvent.MemberKick, member.id, 10000);
    const wasKicked = Boolean(kickEntry);
    const roles = member.roles.cache
      .filter((role) => role.id !== member.guild.id)
      .map((role) => role.toString())
      .join(', ');

    await sendStructuredLog(
      client,
      wasKicked ? config.channels.caseFiles : config.channels.entryLog,
      {
        title: wasKicked ? 'Member Kicked' : 'Member Left',
        emoji: wasKicked ? '🥾' : '📤',
        color: wasKicked ? colors.danger : colors.neutral,
        summary: wasKicked
          ? `${member.user} was removed from **${member.guild.name}**.`
          : `${member.user} left **${member.guild.name}**.`,
        thumbnailUrl: member.user.displayAvatarURL({ size: 256 }),
        referenceId: `${wasKicked ? 'KICK' : 'LEAVE'}-${member.id}-${Date.now()}`,
        fields: [
          { name: 'Member', value: formatUser(member.user) },
          ...(wasKicked
            ? [
                { name: 'Moderator', value: formatActor(kickEntry) },
                { name: 'Reason', value: kickEntry.reason || 'No reason provided.' },
              ]
            : []),
          {
            name: 'Joined Server',
            value: member.joinedTimestamp
              ? `${formatTimestamp(member.joinedTimestamp)}\n-# ${formatTimestamp(member.joinedTimestamp, 'R')}`
              : 'Unknown',
          },
          {
            name: 'Time in Server',
            value: member.joinedTimestamp ? formatDuration(Date.now() - member.joinedTimestamp) : 'Unknown',
          },
          { name: 'Roles at Departure', value: roles || 'No assigned roles.' },
          { name: 'Boosting Since', value: member.premiumSinceTimestamp ? formatTimestamp(member.premiumSinceTimestamp) : 'Not boosting' },
          { name: 'Remaining Member Count', value: member.guild.memberCount.toLocaleString() },
        ],
      },
    );
  },
};
