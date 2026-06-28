const { AuditLogEvent, ChannelType, Events, OverwriteType } = require('discord.js');

const { config } = require('../utils/config');
const {
  colors,
  escapeMarkdown,
  fetchAuditEntry,
  formatActor,
  formatChannel,
  formatCodeBlock,
  sendStructuredLog,
  truncate,
} = require('../utils/structuredLog');

module.exports = {
  setup(client) {
    client.on(Events.ChannelCreate, (channel) => logChannelCreate(channel, client));
    client.on(Events.ChannelDelete, (channel) => logChannelDelete(channel, client));
    client.on(Events.ChannelUpdate, (oldChannel, newChannel) =>
      logChannelUpdate(oldChannel, newChannel, client),
    );
    client.on(Events.ChannelPinsUpdate, (channel, time) =>
      logChannelPinsUpdate(channel, time, client),
    );
  },
};

async function logChannelCreate(channel, client) {
  if (!channel.guild) return;
  const entry = await fetchAuditEntry(channel.guild, AuditLogEvent.ChannelCreate, channel.id);

  await sendStructuredLog(client, config.channels.systemLog, {
    title: 'Channel Created',
    emoji: '➕',
    color: colors.success,
    summary: `${channel} was added to the server.`,
    referenceId: `CHANNEL-CREATE-${channel.id}`,
    fields: [
      { name: 'Channel', value: formatChannel(channel) },
      { name: 'Created By', value: formatActor(entry) },
      { name: 'Audit Reason', value: entry?.reason || 'No reason provided.' },
      { name: 'Type', value: getChannelTypeName(channel.type) },
      { name: 'Category', value: channel.parent ? formatChannel(channel.parent) : 'No category' },
      { name: 'Position', value: String(channel.rawPosition ?? channel.position ?? 'Unknown') },
      { name: 'Topic', value: channel.topic || 'No topic' },
      { name: 'Settings', value: formatChannelSettings(channel) },
      { name: 'Permission Overwrites', value: formatPermissionOverwrites(channel) },
    ],
  });
}

async function logChannelDelete(channel, client) {
  if (!channel.guild) return;
  const entry = await fetchAuditEntry(channel.guild, AuditLogEvent.ChannelDelete, channel.id);

  await sendStructuredLog(client, config.channels.systemLog, {
    title: 'Channel Deleted',
    emoji: '🗑️',
    color: colors.danger,
    summary: `**#${escapeMarkdown(channel.name || 'unknown')}** was deleted.`,
    referenceId: `CHANNEL-DELETE-${channel.id}`,
    fields: [
      { name: 'Deleted Channel', value: `**#${escapeMarkdown(channel.name || 'unknown')}**\n-# ID: \`${channel.id}\`` },
      { name: 'Deleted By', value: formatActor(entry) },
      { name: 'Audit Reason', value: entry?.reason || 'No reason provided.' },
      { name: 'Type', value: getChannelTypeName(channel.type) },
      { name: 'Former Category', value: channel.parent?.name || 'No category' },
      { name: 'Former Position', value: String(channel.rawPosition ?? channel.position ?? 'Unknown') },
      { name: 'Topic', value: channel.topic || 'No topic' },
      { name: 'Settings', value: formatChannelSettings(channel) },
      { name: 'Permission Overwrites', value: formatPermissionOverwrites(channel) },
    ],
  });
}

async function logChannelUpdate(oldChannel, newChannel, client) {
  if (!newChannel.guild) return;
  const changes = collectChannelChanges(oldChannel, newChannel);

  if (changes.length === 0) return;

  const permissionsChanged = changes.some((change) => change.name === 'Permission Overwrites');
  const entry = permissionsChanged
    ? await fetchPermissionAuditEntry(newChannel.guild, newChannel.id)
    : await fetchAuditEntry(newChannel.guild, AuditLogEvent.ChannelUpdate, newChannel.id);

  await sendStructuredLog(client, config.channels.systemLog, {
    title: 'Channel Updated',
    emoji: '🛠️',
    color: colors.warning,
    summary: `${newChannel} had **${changes.length}** configuration change${changes.length === 1 ? '' : 's'}.`,
    referenceId: `CHANNEL-UPDATE-${newChannel.id}-${Date.now()}`,
    fields: [
      { name: 'Channel', value: formatChannel(newChannel) },
      { name: 'Modified By', value: formatActor(entry) },
      { name: 'Audit Reason', value: entry?.reason || 'No reason provided.' },
      ...changes.map((change) => ({
        name: change.name,
        value: `**Before**\n${change.before}\n\n**After**\n${change.after}`,
      })),
    ],
  });
}

async function fetchPermissionAuditEntry(guild, channelId) {
  for (const type of [
    AuditLogEvent.ChannelOverwriteCreate,
    AuditLogEvent.ChannelOverwriteUpdate,
    AuditLogEvent.ChannelOverwriteDelete,
    AuditLogEvent.ChannelUpdate,
  ]) {
    const entry = await fetchAuditEntry(guild, type, channelId);

    if (entry) {
      return entry;
    }
  }

  return null;
}

async function logChannelPinsUpdate(channel, time, client) {
  if (!channel.guild) return;
  const entry = await fetchAuditEntry(channel.guild, AuditLogEvent.MessagePin);

  await sendStructuredLog(client, config.channels.systemLog, {
    title: 'Channel Pins Updated',
    emoji: '📌',
    color: colors.info,
    summary: `The pinned messages in ${channel} changed.`,
    referenceId: `PINS-${channel.id}-${Date.now()}`,
    fields: [
      { name: 'Channel', value: formatChannel(channel) },
      { name: 'Changed By', value: formatActor(entry) },
      { name: 'Last Pin Timestamp', value: time ? `<t:${Math.floor(time.getTime() / 1000)}:F>` : 'No pinned messages remain' },
    ],
  });
}

function collectChannelChanges(oldChannel, newChannel) {
  const pairs = [
    ['Name', oldChannel.name, newChannel.name],
    ['Topic', oldChannel.topic || 'None', newChannel.topic || 'None'],
    ['Category', oldChannel.parent?.name || 'None', newChannel.parent?.name || 'None'],
    ['Position', oldChannel.rawPosition ?? oldChannel.position, newChannel.rawPosition ?? newChannel.position],
    ['NSFW', Boolean(oldChannel.nsfw), Boolean(newChannel.nsfw)],
    ['Slowmode', `${oldChannel.rateLimitPerUser || 0}s`, `${newChannel.rateLimitPerUser || 0}s`],
    ['Bitrate', oldChannel.bitrate ? `${oldChannel.bitrate} bps` : 'N/A', newChannel.bitrate ? `${newChannel.bitrate} bps` : 'N/A'],
    ['User Limit', oldChannel.userLimit ?? 'N/A', newChannel.userLimit ?? 'N/A'],
    ['RTC Region', oldChannel.rtcRegion || 'Automatic', newChannel.rtcRegion || 'Automatic'],
    ['Default Auto Archive', oldChannel.defaultAutoArchiveDuration || 'N/A', newChannel.defaultAutoArchiveDuration || 'N/A'],
  ];
  const changes = pairs
    .filter(([, before, after]) => String(before) !== String(after))
    .map(([name, before, after]) => ({ name, before: String(before), after: String(after) }));
  const oldPermissions = serializePermissionOverwrites(oldChannel);
  const newPermissions = serializePermissionOverwrites(newChannel);

  if (oldPermissions !== newPermissions) {
    changes.push({
      name: 'Permission Overwrites',
      before: formatPermissionOverwrites(oldChannel),
      after: formatPermissionOverwrites(newChannel),
    });
  }

  return changes;
}

function serializePermissionOverwrites(channel) {
  return channel.permissionOverwrites?.cache
    ? [...channel.permissionOverwrites.cache.values()]
      .map((overwrite) => `${overwrite.id}:${overwrite.type}:${overwrite.allow.bitfield}:${overwrite.deny.bitfield}`)
      .sort()
      .join('|')
    : '';
}

function formatPermissionOverwrites(channel) {
  if (!channel.permissionOverwrites?.cache?.size) {
    return 'No custom permission overwrites.';
  }

  const lines = [...channel.permissionOverwrites.cache.values()].map((overwrite) => {
    const target = overwrite.type === OverwriteType.Role
      ? channel.guild.roles.cache.get(overwrite.id)
      : channel.guild.members.cache.get(overwrite.id);
    const label = target ? `${target}` : `\`${overwrite.id}\``;
    const allowed = overwrite.allow.toArray().join(', ') || 'None';
    const denied = overwrite.deny.toArray().join(', ') || 'None';
    return `**${label}**\n+ ${allowed}\n− ${denied}`;
  });

  return truncate(lines.join('\n\n'), 3800);
}

function formatChannelSettings(channel) {
  return [
    `NSFW: **${channel.nsfw ? 'Yes' : 'No'}**`,
    `Slowmode: **${channel.rateLimitPerUser || 0}s**`,
    `Bitrate: **${channel.bitrate ? `${channel.bitrate} bps` : 'N/A'}**`,
    `User limit: **${channel.userLimit ?? 'N/A'}**`,
  ].join('\n');
}

function getChannelTypeName(type) {
  const types = {
    [ChannelType.GuildText]: 'Text Channel',
    [ChannelType.GuildVoice]: 'Voice Channel',
    [ChannelType.GuildCategory]: 'Category',
    [ChannelType.GuildAnnouncement]: 'Announcement Channel',
    [ChannelType.AnnouncementThread]: 'Announcement Thread',
    [ChannelType.PublicThread]: 'Public Thread',
    [ChannelType.PrivateThread]: 'Private Thread',
    [ChannelType.GuildStageVoice]: 'Stage Channel',
    [ChannelType.GuildForum]: 'Forum Channel',
    [ChannelType.GuildMedia]: 'Media Channel',
  };

  return types[type] || `Unknown (${type})`;
}
