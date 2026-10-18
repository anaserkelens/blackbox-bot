const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { createDashboardMessagePayload } = require('../utils/dashboardMessage');
const { sendDashboardMessage } = require('../utils/dashboardPublisher');
const { saveSavedMessages, loadSavedMessages } = require('../utils/savedMessages');

const config = { dashboard: { maxUploadBytes: 1024 } };
const file = { name: 'release.zip', dataUrl: 'data:application/zip;base64,UEsDBA==' };

test('download cards reference uploaded files and avoid header/duplicate name collisions', () => {
  const payload = createDashboardMessagePayload({
    image: { name: 'cover.png', dataUrl: 'data:image/png;base64,aGVsbG8=' },
    blocks: [{ type: 'text', content: '## Download' }],
    attachments: [file, file],
  }, config);
  assert.equal(payload.flags, 32768);
  assert.deepEqual(payload.files.map((item) => item.name), ['cover.png', 'release.zip', '1-release.zip']);
  assert.deepEqual(payload.components[0].components.slice(-2).map((item) => item.file.url),
    ['attachment://release.zip', 'attachment://1-release.zip']);
  assert.deepEqual(payload.allowedMentions, { parse: [] });
  assert.equal(createDashboardMessagePayload({ attachments: [file] }, config).files.length, 1);
});

test('uploads enforce count, size, encoding and component limits', () => {
  assert.throws(() => createDashboardMessagePayload({ attachments: Array(11).fill(file) }, config), /10/);
  assert.throws(() => createDashboardMessagePayload({ attachments: [{ ...file, dataUrl: 'data:;base64,!!!!' }] }, config), /invalid/);
  assert.throws(() => createDashboardMessagePayload({ attachments: [{ ...file, dataUrl: 'data:;base64,' }] }, config), /Empty/);
  assert.throws(() => createDashboardMessagePayload({ attachments: [file] }, { dashboard: { maxUploadBytes: 1 } }), /smaller/);
  assert.throws(() => createDashboardMessagePayload({ attachments: [file], blocks: Array(24).fill({
    type: 'text', content: 'Hello', accessory: { label: 'Visit', url: 'https://example.com' },
  }) }, config), /too many/);
});

test('webhook uses authenticated identity, reuses Bean hook, and supports threads', async () => {
  const client = { user: { id: 'bot' } };
  let sent;
  const hook = { owner: client.user, name: 'Bean Dashboard', token: 'private', send: async (payload) => { sent = payload; return { id: 'message' }; } };
  const parent = { id: 'channel', guildId: 'guild', permissionsFor: () => ({ has: () => true }),
    fetchWebhooks: async () => [hook], createWebhook: () => { throw Error('Should reuse'); } };
  const channel = { isThread: () => true, parent, id: 'thread' };
  const user = { id: '12345678901234567', displayName: 'snuf', avatarUrl: 'https://cdn.discordapp.com/avatar.png' };
  await sendDashboardMessage(client, channel, { files: [file], flags: 32768 }, 'webhook', user);
  assert.equal(sent.username, 'snuf');
  assert.equal(sent.avatarURL, user.avatarUrl);
  assert.equal(sent.threadId, 'thread');
  assert.equal(sent.withComponents, true);
  assert.equal(sent.files.length, 1);
  await assert.rejects(sendDashboardMessage(client, channel, {}, 'webhook', { ...user, authMode: 'password' }), /Sign in/);
  parent.permissionsFor = () => ({ has: () => false });
  await assert.rejects(sendDashboardMessage(client, channel, {}, 'webhook', user), /Manage Webhooks/);
  const result = await sendDashboardMessage(client, { send: async (payload) => payload }, { flags: 32768 }, 'bean');
  assert.equal(result.flags, 32768);
});

test('webhook creation is shared by concurrent publishes', async () => {
  const client = { user: { id: 'bot' } };
  let creations = 0;
  const channel = { id: 'fresh', guildId: 'guild', permissionsFor: () => ({ has: () => true }),
    fetchWebhooks: async () => [], createWebhook: async () => { creations++; return { send: async () => ({ id: 'sent' }) }; } };
  const user = { id: '12345678901234567', username: 'snuf' };
  await Promise.all([1, 2].map(() => sendDashboardMessage(client, channel, {}, 'webhook', user)));
  assert.equal(creations, 1);
});

test('saved messages retain sender and attachment bytes after reload', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'bean-downloads-'));
  try {
    const settings = { dashboard: { savedMessagesPath: path.join(directory, 'messages.json') } };
    await saveSavedMessages(settings, [{ id: 'download', name: 'Release', sender: 'webhook', attachments: [file] }]);
    const saved = (await loadSavedMessages(settings)).find((message) => message.id === 'download');
    assert.equal(saved.sender, 'webhook');
    assert.deepEqual(saved.attachments, [file]);
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});
