const { createAnnouncementPayload } = require('./streamAnnouncement');

function createWelcomeAnnouncementPayload(settings, member, timestamp = new Date()) {
  const joinedTimestamp = Math.floor(timestamp.getTime() / 1000);
  const createdTimestamp = Math.floor(member.user.createdTimestamp / 1000);
  const values = {
    member: String(member),
    displayName: member.displayName || member.user.displayName || member.user.username || '',
    username: member.user.username || '',
    userId: member.id,
    serverName: member.guild.name || '',
    memberCount: member.guild.memberCount ? member.guild.memberCount.toLocaleString('en-US') : '',
    avatarUrl:
      (typeof member.displayAvatarURL === 'function' && member.displayAvatarURL({ size: 256 })) || '',
    createdAt: `<t:${createdTimestamp}:F>`,
    joinedAt: `<t:${joinedTimestamp}:F>`,
  };

  return createAnnouncementPayload(settings, values, timestamp);
}

module.exports = {
  createWelcomeAnnouncementPayload,
};
