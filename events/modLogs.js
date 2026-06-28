const { AuditLogEvent, Events } = require('discord.js');

const { config } = require('../utils/config');
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
  setup(client) {
    client.on(Events.GuildBanAdd, (ban) => logBanAdd(ban, client));
    client.on(Events.GuildBanRemove, (ban) => logBanRemove(ban, client));
    client.on(Events.GuildMemberUpdate, (oldMember, newMember) =>
      logTimeoutUpdate(oldMember, newMember, client),
    );
  },
};

async function logBanAdd(ban, client) {
  const entry = await fetchAuditEntry(ban.guild, AuditLogEvent.MemberBanAdd, ban.user.id);

  await sendStructuredLog(client, config.channels.caseFiles, {
    title: 'Member Banned',
    emoji: '🔨',
    color: colors.danger,
    summary: `${ban.user} was banned from **${ban.guild.name}**.`,
    thumbnailUrl: ban.user.displayAvatarURL({ size: 256 }),
    referenceId: `BAN-${ban.user.id}-${Date.now()}`,
    fields: [
      { name: 'Member', value: formatUser(ban.user) },
      { name: 'Moderator', value: formatActor(entry) },
      { name: 'Reason', value: entry?.reason || ban.reason || 'No reason provided.' },
      { name: 'Account Created', value: `${formatTimestamp(ban.user.createdTimestamp)}\n-# ${formatTimestamp(ban.user.createdTimestamp, 'R')}` },
    ],
  });
}

async function logBanRemove(ban, client) {
  const entry = await fetchAuditEntry(ban.guild, AuditLogEvent.MemberBanRemove, ban.user.id);

  await sendStructuredLog(client, config.channels.caseFiles, {
    title: 'Member Unbanned',
    emoji: '🔓',
    color: colors.success,
    summary: `${ban.user} may join **${ban.guild.name}** again.`,
    thumbnailUrl: ban.user.displayAvatarURL({ size: 256 }),
    referenceId: `UNBAN-${ban.user.id}-${Date.now()}`,
    fields: [
      { name: 'Member', value: formatUser(ban.user) },
      { name: 'Moderator', value: formatActor(entry) },
      { name: 'Audit Reason', value: entry?.reason || 'No reason provided.' },
    ],
  });
}

async function logTimeoutUpdate(oldMember, newMember, client) {
  const oldUntil = oldMember.communicationDisabledUntilTimestamp || null;
  const newUntil = newMember.communicationDisabledUntilTimestamp || null;

  if (oldUntil === newUntil) {
    return;
  }

  const entry = await fetchAuditEntry(
    newMember.guild,
    AuditLogEvent.MemberUpdate,
    newMember.id,
  );
  const isRemoved = !newUntil || newUntil <= Date.now();
  const isUpdated = oldUntil && newUntil && oldUntil !== newUntil;
  const title = isRemoved ? 'Timeout Removed' : (isUpdated ? 'Timeout Updated' : 'Member Timed Out');

  await sendStructuredLog(client, config.channels.caseFiles, {
    title,
    emoji: isRemoved ? '🔊' : '⏳',
    color: isRemoved ? colors.success : colors.warning,
    summary: isRemoved
      ? `${newMember.user} can communicate again.`
      : `${newMember.user} has been restricted from communicating.`,
    thumbnailUrl: newMember.user.displayAvatarURL({ size: 256 }),
    referenceId: `TIMEOUT-${newMember.id}-${Date.now()}`,
    fields: [
      { name: 'Member', value: formatUser(newMember.user) },
      { name: 'Moderator', value: formatActor(entry) },
      { name: 'Reason', value: entry?.reason || 'No reason provided.' },
      { name: 'Previous Expiry', value: oldUntil ? formatTimestamp(oldUntil) : 'Not previously timed out' },
      { name: 'New Expiry', value: isRemoved ? 'Removed' : `${formatTimestamp(newUntil)}\n-# ${formatTimestamp(newUntil, 'R')}` },
      { name: 'Duration Remaining', value: isRemoved ? 'None' : formatDuration(newUntil - Date.now()) },
    ],
  });
}
