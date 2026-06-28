const { AuditLogEvent, Events } = require('discord.js');

const { config } = require('../utils/config');
const {
  colors,
  escapeMarkdown,
  fetchAuditEntry,
  formatActor,
  formatRole,
  formatUser,
  sendStructuredLog,
} = require('../utils/structuredLog');

module.exports = {
  setup(client) {
    client.on(Events.GuildMemberUpdate, (oldMember, newMember) =>
      logGuildMemberUpdate(oldMember, newMember, client),
    );
    client.on(Events.UserUpdate, (oldUser, newUser) => logUserUpdate(oldUser, newUser, client));
  },
};

async function logGuildMemberUpdate(oldMember, newMember, client) {
  if (oldMember.nickname !== newMember.nickname) {
    const entry = await fetchAuditEntry(
      newMember.guild,
      AuditLogEvent.MemberUpdate,
      newMember.id,
    );

    await sendStructuredLog(client, config.channels.systemLog, {
      title: 'Member Nickname Updated',
      emoji: '🪪',
      color: colors.warning,
      summary: `${newMember.user}'s server nickname changed.`,
      thumbnailUrl: newMember.user.displayAvatarURL({ size: 256 }),
      referenceId: `NICKNAME-${newMember.id}-${Date.now()}`,
      fields: [
        { name: 'Member', value: formatUser(newMember.user) },
        { name: 'Changed By', value: formatActor(entry) },
        { name: 'Before', value: escapeMarkdown(oldMember.nickname || oldMember.user.username) },
        { name: 'After', value: escapeMarkdown(newMember.nickname || newMember.user.username) },
        { name: 'Audit Reason', value: entry?.reason || 'No reason provided.' },
      ],
    });
  }

  const addedRoles = newMember.roles.cache.filter((role) => !oldMember.roles.cache.has(role.id));
  const removedRoles = oldMember.roles.cache.filter((role) => !newMember.roles.cache.has(role.id));

  if (addedRoles.size === 0 && removedRoles.size === 0) {
    return;
  }

  const entry = await fetchAuditEntry(
    newMember.guild,
    AuditLogEvent.MemberRoleUpdate,
    newMember.id,
  );

  await sendStructuredLog(client, config.channels.systemLog, {
    title: 'Member Roles Updated',
    emoji: '🎭',
    color: addedRoles.size > 0 && removedRoles.size === 0 ? colors.success : colors.warning,
    summary: `${newMember.user}'s role assignment changed.`,
    thumbnailUrl: newMember.user.displayAvatarURL({ size: 256 }),
    referenceId: `MEMBER-ROLES-${newMember.id}-${Date.now()}`,
    fields: [
      { name: 'Member', value: formatUser(newMember.user) },
      { name: 'Changed By', value: formatActor(entry) },
      { name: 'Audit Reason', value: entry?.reason || 'No reason provided.' },
      {
        name: 'Roles Added',
        value: addedRoles.size > 0
          ? addedRoles.map((role) => formatRole(role)).join('\n\n')
          : 'None',
      },
      {
        name: 'Roles Removed',
        value: removedRoles.size > 0
          ? removedRoles.map((role) => formatRole(role)).join('\n\n')
          : 'None',
      },
      {
        name: 'Current Role Count',
        value: String(newMember.roles.cache.filter((role) => role.id !== newMember.guild.id).size),
      },
    ],
  });
}

async function logUserUpdate(oldUser, newUser, client) {
  const changes = [];

  if (oldUser.username !== newUser.username) {
    changes.push({
      name: 'Username',
      value: `**Before:** ${escapeMarkdown(oldUser.username)}\n**After:** ${escapeMarkdown(newUser.username)}`,
    });
  }

  if (oldUser.globalName !== newUser.globalName) {
    changes.push({
      name: 'Global Display Name',
      value: `**Before:** ${escapeMarkdown(oldUser.globalName || 'None')}\n**After:** ${escapeMarkdown(newUser.globalName || 'None')}`,
    });
  }

  if (oldUser.avatar !== newUser.avatar) {
    changes.push({ name: 'Avatar', value: 'The user changed their avatar.' });
  }

  if (changes.length === 0) return;

  await sendStructuredLog(client, config.channels.systemLog, {
    title: 'User Profile Updated',
    emoji: '👤',
    color: colors.info,
    summary: `${newUser} changed their Discord profile.`,
    thumbnailUrl: newUser.displayAvatarURL({ size: 256 }),
    referenceId: `USER-UPDATE-${newUser.id}-${Date.now()}`,
    fields: [
      { name: 'User', value: formatUser(newUser) },
      ...changes,
    ],
  });
}
