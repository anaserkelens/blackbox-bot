const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { once } = require('node:events');
const { after, before, test } = require('node:test');

process.env.DISCORD_TOKEN = process.env.DISCORD_TOKEN || 'test-token';

const {
  getActivityFeed,
  recordActivity,
} = require('../utils/activityFeed');
const { config } = require('../utils/config');
const {
  getDashboardAnalytics,
  getDashboardNotifications,
  getMemberProfile,
  searchMemberProfiles,
} = require('../utils/dashboardInsights');
const { startDashboard } = require('../utils/dashboardServer');
const {
  loadDashboardSettings,
  saveDashboardSettings,
} = require('../utils/dashboardSettings');
const {
  createScheduledMailboxPost,
  deleteScheduledMailboxPost,
  listScheduledMailboxPosts,
  runMailboxSchedulerTick,
} = require('../utils/mailboxScheduler');
const { recordModerationCase } = require('../utils/moderationCases');
const { recordBotError } = require('../utils/telemetry');
const { createTempVoiceRoomName } = require('../utils/tempVoiceRooms');

let temporaryDirectory;

before(async () => {
  temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'bean-dashboard-test-'));
});

after(async () => {
  await fs.rm(temporaryDirectory, { force: true, recursive: true });
});

function createFeatureConfig(name) {
  return {
    guildId: '1520000000000000100',
    intents: { presences: true },
    channels: {
      mailbox: '1520519675543293972',
      operationLog: '1520916058272170185',
      tempVoiceTrigger: '1520514900978307226',
    },
    dashboard: {
      activityPath: path.join(temporaryDirectory, `${name}-activity.json`),
      mailboxSchedulePath: path.join(temporaryDirectory, `${name}-schedule.json`),
      moderationCasesPath: path.join(temporaryDirectory, `${name}-cases.json`),
      tempVoicePath: path.join(temporaryDirectory, `${name}-voice.json`),
      maxUploadBytes: 8 * 1024 * 1024,
      railwayVolumeMountPath: undefined,
      savedMessagesPath: undefined,
    },
  };
}

function createClient() {
  const sent = [];
  const fetchedChannelIds = [];
  const announcementChannelId = '1520519675543293972';
  const guild = {
    id: '1520000000000000100',
    name: 'The Corner',
    memberCount: 0,
    members: {
      cache: new Map(),
      fetch: async () => null,
      search: async () => new Map(),
    },
    voiceStates: { cache: new Map() },
  };
  const channel = {
    id: announcementChannelId,
    name: 'announcements',
    parentId: '1520000000000000200',
    parent: { id: '1520000000000000200', name: 'COMMUNITY' },
    rawPosition: 1,
    type: 0,
    isSendable: () => true,
    send: async (payload) => {
      const message = {
        id: String(1520000000000000000n + BigInt(sent.length + 1)),
        url: `https://discord.com/channels/test/${sent.length + 1}`,
        payload,
      };

      sent.push(message);
      return message;
    },
  };
  const generalChannel = {
    ...channel,
    id: '1520519675543293973',
    name: 'general',
    rawPosition: 0,
  };
  const channelCache = new Map([
    [announcementChannelId, channel],
    [generalChannel.id, generalChannel],
  ]);

  guild.channels = {
    cache: channelCache,
    fetch: async () => channelCache,
  };
  guild.roles = {
    cache: new Map([[
      '1520451840058064998',
      {
        id: '1520451840058064998',
        name: 'Quarantine',
        position: 1,
        editable: true,
        managed: false,
      },
    ]]),
    fetch: async () => guild.roles.cache,
  };

  return {
    sent,
    fetchedChannelIds,
    client: {
      isReady: () => true,
      ws: { ping: 42 },
      user: { id: '1520000000000000000', tag: 'Bean#0001' },
      guilds: {
        cache: {
          size: 1,
          first: () => guild,
          get: () => null,
          values: function* values() {
            yield guild;
          },
        },
      },
      channels: {
        fetch: async (channelId) => {
          fetchedChannelIds.push(channelId);
          return channelCache.get(channelId) || channel;
        },
      },
    },
  };
}

function mailboxPayload() {
  return {
    mailboxTitle: 'Scheduled test',
    color: '#8FA1BE',
    blocks: [{ type: 'text', content: '## A scheduled update\nEverything is working.' }],
    buttons: [],
    allowMentions: false,
  };
}

test('temporary voice rooms use the uppercase display-name format', () => {
  assert.equal(createTempVoiceRoomName('Cozy Bean'), "— COZY BEAN'S ROOM");
  assert.equal(createTempVoiceRoomName('  sleepy   bean  '), "— SLEEPY BEAN'S ROOM");
  assert.equal(createTempVoiceRoomName(''), "— GUEST'S ROOM");
  assert.ok(Array.from(createTempVoiceRoomName('a'.repeat(150))).length <= 100);
});

test('activity feed persists and filters dashboard events', async () => {
  const featureConfig = createFeatureConfig('feed');

  await recordActivity(featureConfig, {
    type: 'join',
    title: 'Member Joined',
    summary: 'A member arrived.',
  });
  await recordActivity(featureConfig, {
    type: 'voice',
    title: 'Temporary Voice Room Created',
    summary: "A member's Room was created.",
  });
  const hiddenInteraction = await recordActivity(featureConfig, {
    type: 'interaction',
    title: '/room',
    summary: 'A member used a Bean command.',
    memberId: '1520000000000000001',
    visibleInFeed: false,
  });
  const rejectedBotActivity = await recordActivity(featureConfig, {
    type: 'bot',
    title: 'Bot Online',
  });

  const allItems = await getActivityFeed(featureConfig);
  const voiceItems = await getActivityFeed(featureConfig, { type: 'voice' });
  const botItems = await getActivityFeed(featureConfig, { type: 'bot' });
  const allStoredItems = await getActivityFeed(featureConfig, { includeHidden: true });

  assert.equal(allItems.length, 2);
  assert.equal(allStoredItems.length, 3);
  assert.equal(voiceItems.length, 1);
  assert.equal(botItems.length, 0);
  assert.equal(voiceItems[0].title, 'Temporary Voice Room Created');
  assert.equal(hiddenInteraction.visibleInFeed, false);
  assert.equal(rejectedBotActivity, null);
});

test('member profiles combine Discord, cases, rooms, joins, and Bean interactions', async () => {
  const featureConfig = createFeatureConfig('profiles');
  const guildId = featureConfig.guildId;
  const memberId = '1520000000000000001';
  const member = {
    id: memberId,
    displayName: 'Cozy Bean',
    joinedAt: new Date('2026-07-01T12:00:00.000Z'),
    displayAvatarURL: () => 'https://cdn.discordapp.com/avatar.png',
    user: {
      id: memberId,
      bot: false,
      username: 'cozybean',
      globalName: 'Cozy Bean',
      createdAt: new Date('2025-01-01T12:00:00.000Z'),
    },
    roles: {
      cache: new Map([
        [guildId, { id: guildId, name: '@everyone' }],
        ['1520000000000000002', { id: '1520000000000000002', name: 'Regular' }],
      ]),
    },
    presence: { status: 'online' },
    voice: { channel: null },
  };
  const guild = {
    id: guildId,
    name: 'The Corner',
    memberCount: 10,
    members: {
      cache: new Map([[memberId, member]]),
      fetch: async (id) => id === memberId ? member : null,
      search: async () => new Map([[memberId, member]]),
    },
    voiceStates: { cache: new Map() },
  };
  const client = {
    isReady: () => true,
    ws: { ping: 42 },
    user: { id: '1520000000000000999' },
    guilds: { cache: new Map([[guildId, guild]]) },
    channels: {
      cache: new Map(),
      fetch: async (id) => id === featureConfig.channels.mailbox
        ? {
            messages: {
              fetch: async () => new Map([
                ['message-1', {
                  author: { id: '1520000000000000999' },
                  reactions: { cache: new Map([['heart', { count: 4 }]]) },
                }],
              ]),
            },
          }
        : null,
    },
  };
  const notificationCursor = new Date(Date.now() - 1000).toISOString();

  await recordActivity(featureConfig, {
    type: 'join',
    title: 'Member Joined',
    summary: 'Cozy Bean joined The Corner.',
    memberId,
    memberName: 'Cozy Bean',
    guildId,
    action: 'joined',
    createdAt: new Date().toISOString(),
  });
  await recordActivity(featureConfig, {
    type: 'voice',
    title: 'Temporary Voice Room Created',
    summary: "— COZY BEAN'S ROOM was created.",
    memberId,
    memberName: 'Cozy Bean',
    guildId,
    action: 'room-created',
    createdAt: new Date().toISOString(),
  });
  await recordActivity(featureConfig, {
    type: 'voice',
    title: 'Voice Channel Joined',
    summary: 'Cozy Bean joined voice.',
    memberId,
    memberName: 'Cozy Bean',
    guildId,
    action: 'joined',
    visibleInFeed: false,
    createdAt: new Date().toISOString(),
  });
  await recordActivity(featureConfig, {
    type: 'interaction',
    title: '/room',
    summary: 'Cozy Bean used a Bean command.',
    memberId,
    memberName: 'Cozy Bean',
    guildId,
    action: 'command',
    visibleInFeed: false,
    createdAt: new Date().toISOString(),
  });
  await recordModerationCase(featureConfig, {
    number: 1,
    guildId,
    userId: memberId,
    userTag: 'cozybean',
    moderatorId: '1520000000000000003',
    moderatorTag: 'moderator',
    action: 'warn',
    reason: 'Test warning',
    status: 'active',
    createdAt: new Date().toISOString(),
  });

  const search = await searchMemberProfiles(client, featureConfig, 'cozy');
  const profile = await getMemberProfile(client, featureConfig, memberId);
  const analytics = await getDashboardAnalytics(client, featureConfig, 30);
  const notifications = await getDashboardNotifications(client, featureConfig, notificationCursor);

  assert.equal(search.length, 1);
  assert.equal(search[0].displayName, 'Cozy Bean');
  assert.equal(profile.metrics.warnings, 1);
  assert.equal(profile.metrics.roomsCreated, 1);
  assert.equal(profile.metrics.interactions, 1);
  assert.equal(profile.joins.length, 1);
  assert.equal(analytics.joinLeave.joins, 1);
  assert.equal(analytics.voice.sessions, 1);
  assert.equal(analytics.mailbox.engagement.reactions, 4);
  assert.equal(analytics.moderation.actions.find((item) => item.action === 'warn').count, 1);
  assert.ok(notifications.notifications.some((item) => item.type === 'case'));
});

test('dashboard notifications detect unusual join activity', async () => {
  const featureConfig = createFeatureConfig('join-notifications');
  const { client } = createClient();
  const cursor = new Date(Date.now() - 60000).toISOString();

  for (let index = 0; index < 5; index += 1) {
    await recordActivity(featureConfig, {
      type: 'join',
      title: 'Member Joined',
      summary: `Member ${index + 1} joined The Corner.`,
      memberId: String(1520000000000000101n + BigInt(index)),
      memberName: `Member ${index + 1}`,
      guildId: featureConfig.guildId,
      action: 'joined',
    });
  }

  const result = await getDashboardNotifications(client, featureConfig, cursor);

  assert.ok(result.notifications.some((item) => item.type === 'joins'));
});

test('Scheduled Mailbox stores, publishes, and removes posts', async () => {
  const featureConfig = createFeatureConfig('scheduler');
  const { client, sent } = createClient();
  const scheduledAt = new Date(Date.now() + 10_000);
  const job = await createScheduledMailboxPost(featureConfig, {
    title: 'Friday update',
    channelId: '1520519675543293973',
    scheduledAt: scheduledAt.toISOString(),
    payload: mailboxPayload(),
  });

  assert.equal(job.status, 'scheduled');
  assert.equal(job.channelId, '1520519675543293973');
  assert.equal((await listScheduledMailboxPosts(featureConfig)).length, 1);

  const results = await runMailboxSchedulerTick(
    client,
    featureConfig,
    new Date(scheduledAt.getTime() + 1_000),
  );
  const published = await listScheduledMailboxPosts(featureConfig);

  assert.equal(results[0].status, 'sent');
  assert.equal(published[0].status, 'sent');
  assert.equal(sent.length, 2, 'publishes the post and its operation log');

  const deleted = await deleteScheduledMailboxPost(featureConfig, job.id);

  assert.equal(deleted.status, 'deleted');
  assert.equal((await listScheduledMailboxPosts(featureConfig)).length, 0);
});

test('Scheduled Mailbox retries an unavailable channel three times', async () => {
  const featureConfig = createFeatureConfig('scheduler-retry');
  const scheduledAt = new Date(Date.now() + 10_000);
  const client = {
    isReady: () => true,
    channels: {
      fetch: async () => null,
    },
  };
  const job = await createScheduledMailboxPost(featureConfig, {
    title: 'Retry test',
    scheduledAt: scheduledAt.toISOString(),
    payload: mailboxPayload(),
  });
  const notificationCursor = new Date(Date.now() - 1000).toISOString();

  let tickAt = new Date(scheduledAt.getTime() + 1_000);

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    await runMailboxSchedulerTick(client, featureConfig, tickAt);
    const [failed] = await listScheduledMailboxPosts(featureConfig);

    assert.equal(failed.status, 'failed');
    assert.equal(failed.attempts, attempt);
    tickAt = new Date(new Date(failed.nextAttemptAt || tickAt).getTime() + 1_000);
  }

  const [exhausted] = await listScheduledMailboxPosts(featureConfig);

  assert.equal(exhausted.nextAttemptAt, null);
  assert.match(exhausted.lastError, /unavailable or not sendable/i);
  const notifications = await getDashboardNotifications(client, featureConfig, notificationCursor);
  assert.ok(notifications.notifications.some((item) => item.type === 'mailbox'));
  await deleteScheduledMailboxPost(featureConfig, job.id);
});

test('dashboard configuration persists channels, roles, features, and audit history', async () => {
  const featureConfig = createFeatureConfig('configuration');

  featureConfig.roles = {
    founder: '1520451840058064999',
    newUpload: '1520828024533159936',
  };
  featureConfig.invites = { enabled: false };
  featureConfig.streamMonitor = { enabled: false };
  featureConfig.youtubeMonitor = { enabled: true };
  featureConfig.intents = { members: true, messageContent: false, presences: false };
  featureConfig.dashboard.settingsPath = path.join(temporaryDirectory, 'configuration.json');
  const saved = await saveDashboardSettings(featureConfig, {
    channels: {
      welcome: '1520407983354544171',
      mailbox: '1520519675543293973',
    },
    roles: {
      founder: '1520451840058064999',
      newUpload: '1520828024533159936',
    },
    features: {
      welcomeMessages: true,
      inviteModeration: false,
      streamMonitor: false,
      youtubeMonitor: true,
      temporaryVoice: true,
      tickets: false,
      reactionRoles: false,
      detailedLogging: true,
    },
  }, {
    id: '185282790969835520',
    displayName: 'snuf',
    role: 'founder',
  });
  const loaded = await loadDashboardSettings(featureConfig);

  assert.equal(loaded.channels.mailbox, '1520519675543293973');
  assert.equal(loaded.features.youtubeMonitor, true);
  assert.equal(featureConfig.channels.mailbox, '1520519675543293973');
  assert.equal(saved.audit[0].actor.displayName, 'snuf');
  assert.ok(saved.audit[0].changes.some((change) => change.key === 'mailbox'));
});

test('authenticated dashboard APIs expose health, activity, and the schedule queue', async (context) => {
  const { client, sent } = createClient();
  const originalDashboard = { ...config.dashboard };
  const originalChannels = { ...config.channels };
  const originalRoles = { ...config.roles };

  Object.assign(config.dashboard, {
    enabled: true,
    password: 'dashboard-test-password',
    passwordLoginEnabled: true,
    port: 0,
    maxBodyBytes: 1024 * 1024,
    maxUploadBytes: 8 * 1024 * 1024,
    savedMessagesPath: path.join(temporaryDirectory, 'api-saved.json'),
    presencePath: path.join(temporaryDirectory, 'api-presence.json'),
    streamEmbedPath: path.join(temporaryDirectory, 'api-stream.json'),
    youtubeEmbedPath: path.join(temporaryDirectory, 'api-youtube.json'),
    youtubeUploadStatePath: path.join(temporaryDirectory, 'api-youtube-state.json'),
    welcomeEmbedPath: path.join(temporaryDirectory, 'api-welcome.json'),
    moderationCasesPath: path.join(temporaryDirectory, 'api-cases.json'),
    protectionPath: path.join(temporaryDirectory, 'api-protection.json'),
    tempVoicePath: path.join(temporaryDirectory, 'api-voice.json'),
    mailboxSchedulePath: path.join(temporaryDirectory, 'api-schedule.json'),
    activityPath: path.join(temporaryDirectory, 'api-activity.json'),
    settingsPath: path.join(temporaryDirectory, 'api-settings.json'),
    railwayVolumeMountPath: undefined,
  });
  config.channels.mailbox = '1520519675543293972';
  config.channels.operationLog = '1520916058272170185';

  const server = startDashboard(client);
  context.after(async () => {
    server.closeAllConnections?.();
    await new Promise((resolve) => server.close(resolve));
    Object.assign(config.dashboard, originalDashboard);
    Object.assign(config.channels, originalChannels);
    Object.assign(config.roles, originalRoles);
  });
  await once(server, 'listening');

  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const login = await fetchJson(`${baseUrl}/api/login`, {
    method: 'POST',
    body: { password: config.dashboard.password },
  });
  const headers = { Authorization: `Bearer ${login.data.sessionToken}` };

  recordBotError('Dashboard test', new Error('Expected test error'));
  const health = await fetchJson(`${baseUrl}/api/dashboard-health`, { headers });

  assert.equal(health.response.status, 200);
  assert.equal(health.data.discord.latencyMs, 42);
  assert.equal(health.data.api.healthy, true);
  assert.equal(health.data.storage.length, 12);
  assert.equal(health.data.errors[0].source, 'Dashboard test');

  const analytics = await fetchJson(`${baseUrl}/api/analytics?days=30`, { headers });
  const notifications = await fetchJson(
    `${baseUrl}/api/dashboard-notifications?after=${encodeURIComponent(new Date().toISOString())}`,
    { headers },
  );
  const memberSearch = await fetchJson(`${baseUrl}/api/member-profiles?query=nobody`, { headers });
  const discordChannels = await fetchJson(`${baseUrl}/api/channels`, { headers });

  assert.equal(analytics.response.status, 200);
  assert.equal(analytics.data.analytics.days, 30);
  assert.equal(notifications.response.status, 200);
  assert.ok(Array.isArray(notifications.data.notifications));
  assert.equal(memberSearch.response.status, 200);
  assert.deepEqual(memberSearch.data.members, []);
  assert.equal(discordChannels.response.status, 200);
  assert.deepEqual(
    discordChannels.data.channels.map((channel) => channel.name),
    ['general', 'announcements'],
  );
  assert.equal(discordChannels.data.defaults.mailbox, '1520519675543293972');

  const configuration = await fetchJson(`${baseUrl}/api/configuration`, { headers });
  const configurationOptions = await fetchJson(`${baseUrl}/api/configuration-options`, { headers });

  assert.equal(configuration.response.status, 200);
  assert.equal(configurationOptions.response.status, 200);
  assert.equal(configurationOptions.data.channels.length, 2);
  assert.equal(configuration.data.settings.channels.mailbox, '1520519675543293972');
  assert.equal(configuration.data.storage.filePath, config.dashboard.settingsPath);

  const updatedConfiguration = await fetchJson(`${baseUrl}/api/configuration`, {
    method: 'PUT',
    headers,
    body: {
      settings: {
        ...configuration.data.settings,
        channels: {
          ...configuration.data.settings.channels,
          mailbox: '1520519675543293973',
        },
      },
    },
  });

  assert.equal(updatedConfiguration.response.status, 200);
  assert.equal(updatedConfiguration.data.settings.channels.mailbox, '1520519675543293973');
  assert.equal(updatedConfiguration.data.settings.audit[0].actor.role, 'founder');

  const protection = await fetchJson(`${baseUrl}/api/protection`, { headers });
  const updatedProtection = await fetchJson(`${baseUrl}/api/protection/settings`, {
    method: 'PUT',
    headers,
    body: {
      settings: {
        ...protection.data.settings,
        alertChannelId: '1520519675543293973',
        quarantineRoleId: '1520451840058064998',
        floodMessageLimit: 7,
      },
    },
  });

  assert.equal(protection.response.status, 200);
  assert.equal(updatedProtection.response.status, 200);
  assert.equal(updatedProtection.data.settings.alertChannelId, '1520519675543293973');
  assert.equal(updatedProtection.data.settings.quarantineRoleId, '1520451840058064998');
  assert.equal(updatedProtection.data.settings.floodMessageLimit, 7);

  const enabledRaidMode = await fetchJson(`${baseUrl}/api/protection/raid`, {
    method: 'POST',
    headers,
    body: { active: true, reason: 'Dashboard API test.' },
  });
  const disabledRaidMode = await fetchJson(`${baseUrl}/api/protection/raid`, {
    method: 'POST',
    headers,
    body: { active: false, reason: 'Dashboard API test complete.' },
  });

  assert.equal(enabledRaidMode.response.status, 200);
  assert.equal(enabledRaidMode.data.raid.active, true);
  assert.equal(disabledRaidMode.response.status, 200);
  assert.equal(disabledRaidMode.data.raid.active, false);

  const welcomeTest = await fetchJson(`${baseUrl}/api/test-announcement`, {
    method: 'POST',
    headers,
    body: {
      type: 'welcome',
      channelId: '1520519675543293973',
      settings: {
        channelId: '1520519675543293973',
        color: '#8FA1BE',
        blocks: [{ type: 'text', content: 'Welcome {member} to {serverName}.' }],
        buttons: [],
        allowMentions: true,
      },
    },
  });

  assert.equal(welcomeTest.response.status, 200);
  assert.deepEqual(sent.at(-1).payload.allowedMentions.parse, []);

  const youtubeEmbed = await fetchJson(`${baseUrl}/api/youtube-embed`, { headers });

  assert.equal(youtubeEmbed.response.status, 200);
  assert.equal(youtubeEmbed.data.settings.content, '<@&1520828024533159936>');
  assert.equal(youtubeEmbed.data.settings.buttons[0].label, 'Watch on YouTube');

  const savedYouTubeEmbed = await fetchJson(`${baseUrl}/api/youtube-embed`, {
    method: 'PUT',
    headers,
    body: {
      settings: {
        ...youtubeEmbed.data.settings,
        embed: {
          ...youtubeEmbed.data.settings.embed,
          footerText: 'Saved from the dashboard test',
        },
      },
    },
  });
  const reloadedYouTubeEmbed = await fetchJson(`${baseUrl}/api/youtube-embed`, { headers });

  assert.equal(savedYouTubeEmbed.response.status, 200);
  assert.equal(reloadedYouTubeEmbed.data.settings.embed.footerText, 'Saved from the dashboard test');

  const selectedChannelId = '1520519675543293973';
  const sentMailbox = await fetchJson(`${baseUrl}/api/mailbox/send`, {
    method: 'POST',
    headers,
    body: {
      ...mailboxPayload(),
      channelId: selectedChannelId,
    },
  });

  assert.equal(sentMailbox.response.status, 200);
  assert.equal(sentMailbox.data.channelId, selectedChannelId);

  const scheduledAt = new Date(Date.now() + 60_000).toISOString();
  const created = await fetchJson(`${baseUrl}/api/mailbox/scheduled`, {
    method: 'POST',
    headers,
    body: {
      title: 'API schedule test',
      channelId: selectedChannelId,
      scheduledAt,
      payload: mailboxPayload(),
    },
  });

  assert.equal(created.response.status, 201);
  assert.equal(created.data.job.status, 'scheduled');
  assert.equal(created.data.job.channelId, selectedChannelId);

  const queue = await fetchJson(`${baseUrl}/api/mailbox/scheduled`, { headers });
  const activity = await fetchJson(`${baseUrl}/api/activity-feed?type=mailbox`, { headers });

  assert.equal(queue.data.jobs.length, 1);
  assert.equal(activity.data.items[0].type, 'mailbox');

  const removed = await fetchJson(
    `${baseUrl}/api/mailbox/scheduled/${encodeURIComponent(created.data.job.id)}`,
    { method: 'DELETE', headers },
  );

  assert.equal(removed.response.status, 200);
  assert.equal(removed.data.job.id, created.data.job.id);
});

async function fetchJson(url, options = {}) {
  const headers = { ...(options.headers || {}) };

  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await response.json();

  return { response, data };
}
