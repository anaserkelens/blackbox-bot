const { AuditLogEvent, Events } = require('discord.js');

const { config } = require('../utils/config');
const {
  colors,
  escapeMarkdown,
  fetchAuditEntry,
  formatActor,
  formatChannel,
  formatTimestamp,
  formatUser,
  sendStructuredLog,
} = require('../utils/structuredLog');

module.exports = {
  setup(client) {
    client.on(Events.GuildScheduledEventCreate, (event) => logEventCreate(event, client));
    client.on(Events.GuildScheduledEventDelete, (event) => logEventDelete(event, client));
    client.on(Events.GuildScheduledEventUpdate, (oldEvent, newEvent) =>
      logEventUpdate(oldEvent, newEvent, client),
    );
    client.on(Events.GuildScheduledEventUserAdd, (event, user) =>
      logEventUser(event, user, client, true),
    );
    client.on(Events.GuildScheduledEventUserRemove, (event, user) =>
      logEventUser(event, user, client, false),
    );
  },
};

async function logEventCreate(event, client) {
  const entry = await fetchAuditEntry(
    event.guild,
    AuditLogEvent.GuildScheduledEventCreate,
    event.id,
  );

  await sendStructuredLog(client, config.channels.operationLog, {
    title: 'Scheduled Event Created',
    emoji: '📅',
    color: colors.success,
    summary: `**${escapeMarkdown(event.name)}** was scheduled.`,
    thumbnailUrl: event.coverImageURL({ size: 512 }) || undefined,
    referenceId: `EVENT-CREATE-${event.id}`,
    fields: [
      ...eventFields(event),
      { name: 'Created By', value: formatActor(entry) },
      { name: 'Audit Reason', value: entry?.reason || 'No reason provided.' },
    ],
    links: event.url ? [{ label: 'Open Event', url: event.url }] : [],
  });
}

async function logEventDelete(event, client) {
  const entry = await fetchAuditEntry(
    event.guild,
    AuditLogEvent.GuildScheduledEventDelete,
    event.id,
  );

  await sendStructuredLog(client, config.channels.operationLog, {
    title: 'Scheduled Event Deleted',
    emoji: '🗑️',
    color: colors.danger,
    summary: `**${escapeMarkdown(event.name)}** was deleted.`,
    thumbnailUrl: event.coverImageURL({ size: 512 }) || undefined,
    referenceId: `EVENT-DELETE-${event.id}`,
    fields: [
      ...eventFields(event),
      { name: 'Deleted By', value: formatActor(entry) },
      { name: 'Audit Reason', value: entry?.reason || 'No reason provided.' },
    ],
  });
}

async function logEventUpdate(oldEvent, newEvent, client) {
  const changes = collectEventChanges(oldEvent, newEvent);

  if (changes.length === 0) return;

  const entry = await fetchAuditEntry(
    newEvent.guild,
    AuditLogEvent.GuildScheduledEventUpdate,
    newEvent.id,
  );

  await sendStructuredLog(client, config.channels.operationLog, {
    title: 'Scheduled Event Updated',
    emoji: '🗓️',
    color: colors.warning,
    summary: `**${escapeMarkdown(newEvent.name)}** had **${changes.length}** change${changes.length === 1 ? '' : 's'}.`,
    thumbnailUrl: newEvent.coverImageURL({ size: 512 }) || undefined,
    referenceId: `EVENT-UPDATE-${newEvent.id}-${Date.now()}`,
    fields: [
      { name: 'Event ID', value: `\`${newEvent.id}\`` },
      { name: 'Modified By', value: formatActor(entry) },
      { name: 'Audit Reason', value: entry?.reason || 'No reason provided.' },
      ...changes,
    ],
    links: newEvent.url ? [{ label: 'Open Event', url: newEvent.url }] : [],
  });
}

async function logEventUser(event, user, client, subscribed) {
  await sendStructuredLog(client, config.channels.operationLog, {
    title: subscribed ? 'Event Subscription Added' : 'Event Subscription Removed',
    emoji: subscribed ? '🙋' : '👋',
    color: subscribed ? colors.success : colors.neutral,
    summary: `${user} ${subscribed ? 'subscribed to' : 'unsubscribed from'} **${escapeMarkdown(event.name)}**.`,
    thumbnailUrl: user.displayAvatarURL({ size: 256 }),
    referenceId: `EVENT-RSVP-${event.id}-${user.id}-${Date.now()}`,
    fields: [
      { name: 'User', value: formatUser(user) },
      { name: 'Event', value: `**${escapeMarkdown(event.name)}**\n-# ID: \`${event.id}\`` },
      { name: 'Scheduled Start', value: event.scheduledStartTimestamp ? formatTimestamp(event.scheduledStartTimestamp) : 'Unknown' },
      { name: 'Current Subscriber Count', value: String(event.userCount ?? 'Unknown') },
    ],
    links: event.url ? [{ label: 'Open Event', url: event.url }] : [],
  });
}

function eventFields(event) {
  return [
    { name: 'Event', value: `**${escapeMarkdown(event.name)}**\n-# ID: \`${event.id}\`` },
    { name: 'Description', value: event.description || 'No description' },
    { name: 'Status', value: String(event.status) },
    { name: 'Entity Type', value: String(event.entityType) },
    { name: 'Channel', value: event.channel ? formatChannel(event.channel) : 'External / no channel' },
    { name: 'Location', value: event.entityMetadata?.location || 'Not specified' },
    { name: 'Starts', value: event.scheduledStartTimestamp ? `${formatTimestamp(event.scheduledStartTimestamp)}\n-# ${formatTimestamp(event.scheduledStartTimestamp, 'R')}` : 'Unknown' },
    { name: 'Ends', value: event.scheduledEndTimestamp ? formatTimestamp(event.scheduledEndTimestamp) : 'Not specified' },
    { name: 'Subscribers', value: String(event.userCount ?? 'Unknown') },
  ];
}

function collectEventChanges(oldEvent, newEvent) {
  const pairs = [
    ['Name', oldEvent.name, newEvent.name],
    ['Description', oldEvent.description || 'None', newEvent.description || 'None'],
    ['Status', oldEvent.status, newEvent.status],
    ['Channel', oldEvent.channel?.toString() || 'None', newEvent.channel?.toString() || 'None'],
    ['Location', oldEvent.entityMetadata?.location || 'None', newEvent.entityMetadata?.location || 'None'],
    ['Start Time', oldEvent.scheduledStartTimestamp ? formatTimestamp(oldEvent.scheduledStartTimestamp) : 'Unknown', newEvent.scheduledStartTimestamp ? formatTimestamp(newEvent.scheduledStartTimestamp) : 'Unknown'],
    ['End Time', oldEvent.scheduledEndTimestamp ? formatTimestamp(oldEvent.scheduledEndTimestamp) : 'None', newEvent.scheduledEndTimestamp ? formatTimestamp(newEvent.scheduledEndTimestamp) : 'None'],
  ];

  return pairs
    .filter(([, before, after]) => String(before) !== String(after))
    .map(([name, before, after]) => ({
      name,
      value: `**Before**\n${before}\n\n**After**\n${after}`,
    }));
}
