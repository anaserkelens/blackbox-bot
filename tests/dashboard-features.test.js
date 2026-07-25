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
const { startDashboard } = require('../utils/dashboardServer');
const {
  createScheduledMailboxPost,
  deleteScheduledMailboxPost,
  listScheduledMailboxPosts,
  runMailboxSchedulerTick,
} = require('../utils/mailboxScheduler');
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
    channels: {
      mailbox: '1520519675543293972',
      operationLog: '1520916058272170185',
    },
    dashboard: {
      activityPath: path.join(temporaryDirectory, `${name}-activity.json`),
      mailboxSchedulePath: path.join(temporaryDirectory, `${name}-schedule.json`),
      maxUploadBytes: 8 * 1024 * 1024,
      railwayVolumeMountPath: undefined,
      savedMessagesPath: undefined,
    },
  };
}

function createClient() {
  const sent = [];
  const channel = {
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

  return {
    sent,
    client: {
      isReady: () => true,
      ws: { ping: 42 },
      user: { id: '1520000000000000000', tag: 'Bean#0001' },
      guilds: {
        cache: {
          size: 1,
          first: () => ({ name: 'The Corner' }),
          get: () => null,
          values: function* values() {
            yield { name: 'The Corner' };
          },
        },
      },
      channels: {
        fetch: async () => channel,
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

  const allItems = await getActivityFeed(featureConfig);
  const voiceItems = await getActivityFeed(featureConfig, { type: 'voice' });

  assert.equal(allItems.length, 2);
  assert.equal(voiceItems.length, 1);
  assert.equal(voiceItems[0].title, 'Temporary Voice Room Created');
});

test('Scheduled Mailbox stores, publishes, and removes posts', async () => {
  const featureConfig = createFeatureConfig('scheduler');
  const { client, sent } = createClient();
  const scheduledAt = new Date(Date.now() + 10_000);
  const job = await createScheduledMailboxPost(featureConfig, {
    title: 'Friday update',
    scheduledAt: scheduledAt.toISOString(),
    payload: mailboxPayload(),
  });

  assert.equal(job.status, 'scheduled');
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
  await deleteScheduledMailboxPost(featureConfig, job.id);
});

test('authenticated dashboard APIs expose health, activity, and the schedule queue', async (context) => {
  const { client } = createClient();
  const originalDashboard = { ...config.dashboard };
  const originalChannels = { ...config.channels };

  Object.assign(config.dashboard, {
    enabled: true,
    password: 'dashboard-test-password',
    port: 0,
    maxBodyBytes: 1024 * 1024,
    maxUploadBytes: 8 * 1024 * 1024,
    savedMessagesPath: path.join(temporaryDirectory, 'api-saved.json'),
    presencePath: path.join(temporaryDirectory, 'api-presence.json'),
    streamEmbedPath: path.join(temporaryDirectory, 'api-stream.json'),
    welcomeEmbedPath: path.join(temporaryDirectory, 'api-welcome.json'),
    moderationCasesPath: path.join(temporaryDirectory, 'api-cases.json'),
    tempVoicePath: path.join(temporaryDirectory, 'api-voice.json'),
    mailboxSchedulePath: path.join(temporaryDirectory, 'api-schedule.json'),
    activityPath: path.join(temporaryDirectory, 'api-activity.json'),
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
  assert.equal(health.data.storage.length, 8);
  assert.equal(health.data.errors[0].source, 'Dashboard test');

  const scheduledAt = new Date(Date.now() + 60_000).toISOString();
  const created = await fetchJson(`${baseUrl}/api/mailbox/scheduled`, {
    method: 'POST',
    headers,
    body: {
      title: 'API schedule test',
      scheduledAt,
      payload: mailboxPayload(),
    },
  });

  assert.equal(created.response.status, 201);
  assert.equal(created.data.job.status, 'scheduled');

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
