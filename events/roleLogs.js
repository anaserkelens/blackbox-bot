const { AuditLogEvent, Events } = require('discord.js');

const { config } = require('../utils/config');
const {
  colors,
  escapeMarkdown,
  fetchAuditEntry,
  formatActor,
  formatRole,
  sendStructuredLog,
  truncate,
} = require('../utils/structuredLog');

module.exports = {
  setup(client) {
    client.on(Events.GuildRoleCreate, (role) => logRoleCreate(role, client));
    client.on(Events.GuildRoleDelete, (role) => logRoleDelete(role, client));
    client.on(Events.GuildRoleUpdate, (oldRole, newRole) =>
      logRoleUpdate(oldRole, newRole, client),
    );
  },
};

async function logRoleCreate(role, client) {
  const entry = await fetchAuditEntry(role.guild, AuditLogEvent.RoleCreate, role.id);

  await sendStructuredLog(client, config.channels.systemLog, {
    title: 'Role Created',
    emoji: '🏷️',
    color: role.color || colors.success,
    summary: `${role} was created.`,
    referenceId: `ROLE-CREATE-${role.id}`,
    fields: [
      { name: 'Role', value: formatRole(role) },
      { name: 'Created By', value: formatActor(entry) },
      { name: 'Audit Reason', value: entry?.reason || 'No reason provided.' },
      { name: 'Position', value: String(role.position) },
      { name: 'Color', value: role.hexColor },
      { name: 'Display Settings', value: formatRoleSettings(role) },
      { name: 'Permissions', value: formatPermissions(role.permissions.toArray()) },
    ],
  });
}

async function logRoleDelete(role, client) {
  const entry = await fetchAuditEntry(role.guild, AuditLogEvent.RoleDelete, role.id);

  await sendStructuredLog(client, config.channels.systemLog, {
    title: 'Role Deleted',
    emoji: '🗑️',
    color: colors.danger,
    summary: `The role **${escapeMarkdown(role.name)}** was deleted.`,
    referenceId: `ROLE-DELETE-${role.id}`,
    fields: [
      { name: 'Deleted Role', value: `**${escapeMarkdown(role.name)}**\n-# ID: \`${role.id}\`` },
      { name: 'Deleted By', value: formatActor(entry) },
      { name: 'Audit Reason', value: entry?.reason || 'No reason provided.' },
      { name: 'Former Position', value: String(role.position) },
      { name: 'Color', value: role.hexColor },
      { name: 'Display Settings', value: formatRoleSettings(role) },
      { name: 'Permissions', value: formatPermissions(role.permissions.toArray()) },
    ],
  });
}

async function logRoleUpdate(oldRole, newRole, client) {
  const changes = collectRoleChanges(oldRole, newRole);

  if (changes.length === 0) return;

  const entry = await fetchAuditEntry(
    newRole.guild,
    AuditLogEvent.RoleUpdate,
    newRole.id,
  );

  await sendStructuredLog(client, config.channels.systemLog, {
    title: 'Role Updated',
    emoji: '🛡️',
    color: newRole.color || colors.warning,
    summary: `${newRole} had **${changes.length}** change${changes.length === 1 ? '' : 's'}.`,
    referenceId: `ROLE-UPDATE-${newRole.id}-${Date.now()}`,
    fields: [
      { name: 'Role', value: formatRole(newRole) },
      { name: 'Modified By', value: formatActor(entry) },
      { name: 'Audit Reason', value: entry?.reason || 'No reason provided.' },
      ...changes,
    ],
  });
}

function collectRoleChanges(oldRole, newRole) {
  const changes = [];
  const simpleChanges = [
    ['Name', oldRole.name, newRole.name],
    ['Color', oldRole.hexColor, newRole.hexColor],
    ['Position', oldRole.position, newRole.position],
    ['Hoisted', oldRole.hoist, newRole.hoist],
    ['Mentionable', oldRole.mentionable, newRole.mentionable],
    ['Icon', oldRole.icon || oldRole.unicodeEmoji || 'None', newRole.icon || newRole.unicodeEmoji || 'None'],
  ];

  for (const [name, before, after] of simpleChanges) {
    if (String(before) !== String(after)) {
      changes.push({
        name,
        value: `**Before:** ${escapeMarkdown(String(before))}\n**After:** ${escapeMarkdown(String(after))}`,
      });
    }
  }

  const added = oldRole.permissions.missing(newRole.permissions);
  const removed = newRole.permissions.missing(oldRole.permissions);

  if (added.length > 0) {
    changes.push({ name: 'Permissions Added', value: formatPermissions(added) });
  }

  if (removed.length > 0) {
    changes.push({ name: 'Permissions Removed', value: formatPermissions(removed) });
  }

  return changes;
}

function formatPermissions(permissions) {
  if (!permissions.length) {
    return 'None';
  }

  return truncate(
    permissions
      .map((permission) => `• ${permission.replace(/([A-Z])/g, ' $1').trim()}`)
      .join('\n'),
    3800,
  );
}

function formatRoleSettings(role) {
  return [
    `Hoisted: **${role.hoist ? 'Yes' : 'No'}**`,
    `Mentionable: **${role.mentionable ? 'Yes' : 'No'}**`,
    `Managed by integration: **${role.managed ? 'Yes' : 'No'}**`,
  ].join('\n');
}
