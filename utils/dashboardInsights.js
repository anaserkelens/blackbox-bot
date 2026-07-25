const { getActivityFeed } = require('./activityFeed');
const { listScheduledMailboxPosts } = require('./mailboxScheduler');
const { listModerationCases } = require('./moderationCases');
const { getTelemetrySnapshot } = require('./telemetry');
const { getTempVoiceOverview } = require('./tempVoiceRooms');

async function searchMemberProfiles(client, config, query) {
  const guild = getDashboardGuild(client, config);

  if (!guild) {
    throw new Error('Bean is not connected to the configured Discord server.');
  }

  const normalizedQuery = String(query || '').trim();
  const members = new Map();

  if (/^\d{17,20}$/.test(normalizedQuery)) {
    const exact = guild.members.cache.get(normalizedQuery)
      || await guild.members.fetch(normalizedQuery).catch(() => null);

    if (exact) {
      members.set(exact.id, exact);
    }
  } else {
    for (const member of collectionValues(guild.members.cache)) {
      if (memberMatchesQuery(member, normalizedQuery)) {
        members.set(member.id, member);
      }
    }

    if (normalizedQuery.length >= 2 && typeof guild.members.search === 'function') {
      const searched = await guild.members.search({ query: normalizedQuery, limit: 20 }).catch(() => null);

      for (const member of collectionValues(searched)) {
        members.set(member.id, member);
      }
    }
  }

  const [cases, activities, rooms] = await Promise.all([
    listModerationCases(config, guild.id),
    getActivityFeed(config, { includeHidden: true, limit: 2000 }),
    getTempVoiceOverview(client, config).catch(() => ({ channels: [] })),
  ]);
  const caseCounts = countBy(cases, (item) => item.userId);
  const warningCounts = countBy(cases.filter((item) => item.action === 'warn'), (item) => item.userId);
  const latestActivity = new Map();

  for (const activity of activities) {
    if (activity.memberId && !latestActivity.has(activity.memberId)) {
      latestActivity.set(activity.memberId, activity.createdAt);
    }
  }

  const results = [...members.values()]
    .filter((member) => !member.user?.bot)
    .map((member) => ({
      id: member.id,
      displayName: getMemberDisplayName(member),
      username: member.user?.username || 'Unknown user',
      globalName: member.user?.globalName || null,
      avatarUrl: getMemberAvatarUrl(member),
      joinedAt: member.joinedAt?.toISOString?.() || normalizeDate(member.joinedTimestamp),
      caseCount: caseCounts.get(member.id) || 0,
      warningCount: warningCounts.get(member.id) || 0,
      currentRoom: rooms.channels.find((room) => room.ownerId === member.id)?.name || null,
      lastActivityAt: latestActivity.get(member.id) || null,
    }));

  if (normalizedQuery) {
    const storedMembers = new Map();

    for (const activity of activities) {
      if (activity.memberId && !storedMembers.has(activity.memberId)) {
        storedMembers.set(activity.memberId, {
          id: activity.memberId,
          displayName: activity.memberName || `Member ${activity.memberId}`,
          username: activity.memberName || 'Stored history',
          joinedAt: activity.type === 'join' ? activity.createdAt : null,
        });
      } else if (
        activity.memberId
        && activity.type === 'join'
        && !storedMembers.get(activity.memberId)?.joinedAt
      ) {
        storedMembers.get(activity.memberId).joinedAt = activity.createdAt;
      }
    }

    for (const moderationCase of cases) {
      if (!storedMembers.has(moderationCase.userId)) {
        storedMembers.set(moderationCase.userId, {
          id: moderationCase.userId,
          displayName: extractUsername(moderationCase.userTag) || `Member ${moderationCase.userId}`,
          username: extractUsername(moderationCase.userTag) || 'Stored history',
          joinedAt: null,
        });
      }
    }

    for (const stored of storedMembers.values()) {
      if (
        members.has(stored.id)
        || !storedMemberMatchesQuery(stored, normalizedQuery)
        || results.length >= 20
      ) {
        continue;
      }

      results.push({
        ...stored,
        globalName: null,
        avatarUrl: null,
        caseCount: caseCounts.get(stored.id) || 0,
        warningCount: warningCounts.get(stored.id) || 0,
        currentRoom: rooms.channels.find((room) => room.ownerId === stored.id)?.name || null,
        lastActivityAt: latestActivity.get(stored.id) || null,
      });
    }
  }

  return results
    .slice(0, 20)
    .sort((left, right) => left.displayName.localeCompare(right.displayName));
}

async function getMemberProfile(client, config, memberId) {
  if (!/^\d{17,20}$/.test(String(memberId || ''))) {
    throw new Error('Member ID is invalid.');
  }

  const guild = getDashboardGuild(client, config);

  if (!guild) {
    throw new Error('Bean is not connected to the configured Discord server.');
  }

  const [member, cases, activities, rooms] = await Promise.all([
    guild.members.cache.get(memberId) || guild.members.fetch(memberId).catch(() => null),
    listModerationCases(config, guild.id),
    getActivityFeed(config, {
      includeHidden: true,
      memberId,
      limit: 500,
    }),
    getTempVoiceOverview(client, config).catch(() => ({ channels: [] })),
  ]);
  const moderation = cases
    .filter((item) => item.userId === memberId)
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
  const joins = activities.filter((item) => item.type === 'join' || item.type === 'leave');
  const roomHistory = activities.filter((item) =>
    item.type === 'voice' && item.action.startsWith('room-'));
  const interactions = activities.filter((item) => item.type === 'interaction');
  const fallbackName = activities.find((item) => item.memberName)?.memberName
    || moderation[0]?.userTag
    || `Member ${memberId}`;

  if (!member && moderation.length === 0 && activities.length === 0) {
    return null;
  }

  return {
    id: memberId,
    displayName: member ? getMemberDisplayName(member) : fallbackName,
    username: member?.user?.username || extractUsername(moderation[0]?.userTag) || 'No longer in server',
    globalName: member?.user?.globalName || null,
    avatarUrl: member ? getMemberAvatarUrl(member) : null,
    inServer: Boolean(member),
    joinedAt: member?.joinedAt?.toISOString?.() || normalizeDate(member?.joinedTimestamp),
    accountCreatedAt: member?.user?.createdAt?.toISOString?.() || normalizeDate(member?.user?.createdTimestamp),
    roles: member
      ? collectionValues(member.roles?.cache)
        .filter((role) => role.id !== guild.id)
        .map((role) => role.name)
        .sort()
      : [],
    presence: member?.presence?.status || null,
    voiceChannel: member?.voice?.channel?.name || null,
    currentRooms: rooms.channels.filter((room) => room.ownerId === memberId),
    metrics: {
      cases: moderation.length,
      activeCases: moderation.filter((item) => item.status === 'active').length,
      warnings: moderation.filter((item) => item.action === 'warn').length,
      roomsCreated: roomHistory.filter((item) => item.action === 'room-created').length,
      interactions: interactions.length,
      joins: joins.filter((item) => item.type === 'join').length,
    },
    joins: joins.slice(0, 20),
    moderation: moderation.slice(0, 50),
    roomHistory: roomHistory.slice(0, 30),
    interactions: interactions.slice(0, 30),
    recentActivity: activities
      .filter((item) => item.type !== 'interaction' && !item.action.startsWith('room-'))
      .slice(0, 30),
  };
}

async function getDashboardAnalytics(client, config, requestedDays = 30, requestedTimezoneOffset = 0) {
  const days = [7, 30, 90].includes(Number(requestedDays)) ? Number(requestedDays) : 30;
  const timezoneOffset = Math.min(840, Math.max(-840, Number(requestedTimezoneOffset) || 0));
  const guild = getDashboardGuild(client, config);
  const now = new Date();
  const cutoff = new Date(now.getTime() - days * 86400000);
  const [activities, cases, jobs, engagement] = await Promise.all([
    getActivityFeed(config, { includeHidden: true, limit: 2000 }),
    listModerationCases(config, guild?.id),
    listScheduledMailboxPosts(config),
    getMailboxEngagement(client, config),
  ]);
  const recentActivities = activities.filter((item) => new Date(item.createdAt) >= cutoff);
  const recentCases = cases.filter((item) => new Date(item.createdAt) >= cutoff);
  const daily = createDailyBuckets(days, now, timezoneOffset);

  for (const activity of recentActivities) {
    const key = getOffsetDateKey(activity.createdAt, timezoneOffset);
    const bucket = daily.find((item) => item.date === key);

    if (!bucket) {
      continue;
    }

    if (activity.type === 'join') bucket.joins += 1;
    if (activity.type === 'leave') bucket.leaves += 1;
  }

  const voiceHours = Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 }));

  for (const activity of recentActivities) {
    if (activity.type === 'voice' && activity.action === 'joined') {
      voiceHours[getOffsetHour(activity.createdAt, timezoneOffset)].count += 1;
    }
  }

  const moderationActions = ['warn', 'timeout', 'kick', 'ban'].map((action) => ({
    action,
    count: recentCases.filter((item) => item.action === action).length,
  }));
  const moderatedMembers = countBy(recentCases, (item) => item.userId);
  const uniqueActiveMemberIds = new Set(
    recentActivities
      .map((item) => item.memberId)
      .filter(Boolean),
  );
  const onlineMembers = guild
    ? collectionValues(guild.members?.cache).filter((member) =>
      !member.user?.bot && member.presence?.status && member.presence.status !== 'offline').length
    : 0;
  const membersInVoice = guild
    ? new Set(
      collectionValues(guild.voiceStates?.cache)
        .filter((state) => state.channelId && !state.member?.user?.bot)
        .map((state) => state.id || state.member?.id),
    ).size
    : 0;
  const publishedEvents = recentActivities.filter((item) =>
    item.type === 'mailbox' && item.title.toLowerCase().includes('published'));
  const failedJobs = jobs.filter((job) =>
    job.status === 'failed' && new Date(job.updatedAt) >= cutoff);

  return {
    generatedAt: now.toISOString(),
    days,
    joinLeave: {
      daily,
      joins: daily.reduce((total, item) => total + item.joins, 0),
      leaves: daily.reduce((total, item) => total + item.leaves, 0),
    },
    voice: {
      hours: voiceHours,
      busiest: [...voiceHours].sort((left, right) => right.count - left.count)[0],
      sessions: voiceHours.reduce((total, item) => total + item.count, 0),
    },
    mailbox: {
      published: publishedEvents.length,
      scheduled: jobs.filter((job) => new Date(job.createdAt) >= cutoff).length,
      failed: failedJobs.length,
      engagement,
    },
    moderation: {
      total: recentCases.length,
      actions: moderationActions,
      repeatMembers: [...moderatedMembers.values()].filter((count) => count > 1).length,
      activeCases: cases.filter((item) => item.status === 'active').length,
    },
    members: {
      total: guild?.memberCount || collectionValues(guild?.members?.cache).length,
      online: onlineMembers,
      inVoice: membersInVoice,
      activeInRange: uniqueActiveMemberIds.size,
      presenceAvailable: Boolean(config.intents?.presences),
    },
  };
}

async function getDashboardNotifications(client, config, after) {
  const generatedAt = new Date();
  const afterDate = normalizeNotificationCursor(after, generatedAt);
  const [cases, jobs, activities] = await Promise.all([
    listModerationCases(config, config.guildId),
    listScheduledMailboxPosts(config),
    getActivityFeed(config, { includeHidden: true, limit: 500 }),
  ]);
  const errors = getTelemetrySnapshot(client).errors;
  const notifications = [];

  for (const moderationCase of cases) {
    if (new Date(moderationCase.createdAt) <= afterDate) continue;

    notifications.push({
      id: `case-${moderationCase.number}`,
      type: 'case',
      title: 'A new case landed',
      message: `${moderationCase.reference} · ${capitalize(moderationCase.action)} · ${moderationCase.userTag}`,
      createdAt: moderationCase.createdAt,
      tab: 'cases',
    });
  }

  for (const job of jobs) {
    if (job.status !== 'failed' || new Date(job.updatedAt) <= afterDate) continue;

    notifications.push({
      id: `mailbox-failed-${job.id}-${job.attempts}`,
      type: 'mailbox',
      title: 'Mailbox needs a little help',
      message: `${job.title} failed to publish${job.attempts >= 3 ? ' after three tries' : ' and will retry'}.`,
      createdAt: job.updatedAt,
      tab: 'mailbox',
    });
  }

  for (const error of errors) {
    if (new Date(error.createdAt) <= afterDate) continue;

    notifications.push({
      id: `error-${error.id}`,
      type: 'error',
      title: 'Bean noticed an error',
      message: `${error.source}: ${firstLine(error.message)}`,
      createdAt: error.createdAt,
      tab: 'overview',
    });
  }

  const fiveMinutesAgo = new Date(generatedAt.getTime() - 5 * 60000);
  const recentJoins = activities.filter((item) =>
    item.type === 'join' && new Date(item.createdAt) >= fiveMinutesAgo);

  if (recentJoins.length >= 5) {
    const latestJoinAt = recentJoins[0].createdAt;

    if (new Date(latestJoinAt) > afterDate) {
      notifications.push({
        id: `join-spike-${Math.floor(new Date(latestJoinAt).getTime() / 300000)}`,
        type: 'joins',
        title: 'The welcome mat is busy',
        message: `${recentJoins.length} members joined in the last five minutes.`,
        createdAt: latestJoinAt,
        tab: 'members',
      });
    }
  }

  return {
    generatedAt: generatedAt.toISOString(),
    notifications: notifications
      .sort((left, right) => new Date(left.createdAt) - new Date(right.createdAt))
      .slice(-20),
  };
}

async function getMailboxEngagement(client, config) {
  const channel = await client.channels.fetch(config.channels.mailbox).catch(() => null);

  if (!channel?.messages || typeof channel.messages.fetch !== 'function') {
    return { available: false, messages: 0, reactions: 0, reactedMessages: 0 };
  }

  const messages = await channel.messages.fetch({ limit: 50 }).catch(() => null);

  if (!messages) {
    return { available: false, messages: 0, reactions: 0, reactedMessages: 0 };
  }

  const beanMessages = collectionValues(messages).filter((message) =>
    !client.user?.id || message.author?.id === client.user.id);
  const reactionCounts = beanMessages.map((message) =>
    collectionValues(message.reactions?.cache)
      .reduce((total, reaction) => total + (Number(reaction.count) || 0), 0));

  return {
    available: true,
    messages: beanMessages.length,
    reactions: reactionCounts.reduce((total, count) => total + count, 0),
    reactedMessages: reactionCounts.filter((count) => count > 0).length,
  };
}

function getDashboardGuild(client, config) {
  const cache = client.guilds?.cache;

  if (!cache) return null;
  if (config.guildId && typeof cache.get === 'function') {
    const configured = cache.get(config.guildId);
    if (configured) return configured;
  }

  return typeof cache.first === 'function'
    ? cache.first()
    : collectionValues(cache)[0] || null;
}

function memberMatchesQuery(member, query) {
  if (!query) return true;
  const haystack = [
    member.id,
    member.displayName,
    member.user?.username,
    member.user?.globalName,
  ].filter(Boolean).join(' ').toLowerCase();

  return haystack.includes(query.toLowerCase());
}

function storedMemberMatchesQuery(member, query) {
  return [member.id, member.displayName, member.username]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .includes(query.toLowerCase());
}

function getMemberDisplayName(member) {
  return member.displayName || member.user?.globalName || member.user?.username || `Member ${member.id}`;
}

function getMemberAvatarUrl(member) {
  if (typeof member.displayAvatarURL === 'function') {
    return member.displayAvatarURL({ size: 256 });
  }

  return typeof member.user?.displayAvatarURL === 'function'
    ? member.user.displayAvatarURL({ size: 256 })
    : null;
}

function collectionValues(collection) {
  if (!collection) return [];
  if (Array.isArray(collection)) return collection;
  if (typeof collection.values === 'function') return [...collection.values()];
  return [];
}

function countBy(items, selector) {
  const counts = new Map();

  for (const item of items) {
    const key = selector(item);
    if (key) counts.set(key, (counts.get(key) || 0) + 1);
  }

  return counts;
}

function createDailyBuckets(days, now, timezoneOffset) {
  const shiftedNow = new Date(now.getTime() - timezoneOffset * 60000);

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(shiftedNow);
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() - (days - index - 1));
    return { date: date.toISOString().slice(0, 10), joins: 0, leaves: 0 };
  });
}

function getOffsetDateKey(value, timezoneOffset) {
  const date = new Date(value);
  return new Date(date.getTime() - timezoneOffset * 60000).toISOString().slice(0, 10);
}

function getOffsetHour(value, timezoneOffset) {
  const date = new Date(value);
  return new Date(date.getTime() - timezoneOffset * 60000).getUTCHours();
}

function normalizeDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normalizeNotificationCursor(value, now) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return new Date(now.getTime() - 30000);
  }

  return date > now ? now : date;
}

function extractUsername(tag) {
  return tag ? String(tag).split('#')[0] : null;
}

function capitalize(value) {
  const text = String(value || '');
  return text ? text[0].toUpperCase() + text.slice(1) : '';
}

function firstLine(value) {
  return String(value || '').split(/\r?\n/, 1)[0].slice(0, 240);
}

module.exports = {
  getDashboardAnalytics,
  getDashboardNotifications,
  getMemberProfile,
  searchMemberProfiles,
};
