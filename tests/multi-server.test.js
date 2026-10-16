const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { EventEmitter, once } = require('node:events');
const { test } = require('node:test');
process.env.DISCORD_TOKEN = 'test-token';
process.env.DISCORD_GUILD_ID = '111111111111111111';
const { config } = require('../utils/config');
const { getGuildConfig, runWithGuild, forEachGuild, installGuildEventContext } = require('../utils/guildContext');
const { saveDashboardSettings } = require('../utils/dashboardSettings');
const { getTempVoiceSettings, saveTempVoiceSettings } = require('../utils/tempVoiceRooms');
const { createDefaultWelcomeEmbedSettings } = require('../utils/welcomeEmbedSettings');
const { startDashboard } = require('../utils/dashboardServer');
const { syncCommandsForClient } = require('../utils/syncCommands');
const { runMailboxSchedulerTick, createScheduledMailboxPost } = require('../utils/mailboxScheduler');

const first = '111111111111111111';
const second = '222222222222222222';
const owner = '999999999999999999';
const staff = '888888888888888888';
const staffRole = '777777777777777777';

test('multiple servers isolate settings, events, background jobs, dashboard access and storage', async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'bean-multi-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  for (const key of Object.keys(config.dashboard)) {
    if (key.endsWith('Path')) config.dashboard[key] = path.join(root, key + '.json');
  }
  config.dashboard.railwayVolumeMountPath = root;
  config.ownerUserId = owner;
  config.clientId = '555555555555555555';
  config.channels = Object.fromEntries(Object.keys(config.channels).map((key) => [key, undefined]));
  config.channels.mailbox = '111111111111111112';
  config.channels.welcome = config.channels.mailbox;
  config.roles = { staff: staffRole };
  Object.assign(config.dashboard, { enabled: true, passwordLoginEnabled: true, password: 'test', port: 0,
    publicUrl: 'http://localhost', discordOauth: { enabled: true, clientSecret: 'test-secret' } });
  const sent = [];
  const guilds = new Map();
  const channels = new Map();
  let staffAllowed = true;
  for (const [id, name] of [[first, 'Original'], [second, 'Second']]) {
    const channel = { id: String(BigInt(id) + 1n), guildId: id, name: 'general', type: 0,
      isSendable: () => true, send: async () => { sent.push(id); return { id: '123', url: 'https://example.com' }; } };
    const voice = { ...channel, id: String(BigInt(id) + 2n), type: 2 };
    channels.set(channel.id, channel); channels.set(voice.id, voice);
    const cache = new Map([[channel.id, channel], [voice.id, voice]]);
    const guild = { id, name, ownerId: owner, memberCount: 2,
      channels: { cache, fetch: async (key) => key ? cache.get(key) : cache },
      roles: { cache: new Map([[staffRole, { id: staffRole, name: 'Staff' }]]) },
      members: { cache: new Map(), fetch: async ({ user }) => user === staff && id === first && staffAllowed
        ? { permissions: { has: () => false }, roles: { cache: new Map([[staffRole, {}]]) } } : null },
    };
    guilds.set(id, guild);
  }
  const client = { guilds: { cache: guilds }, channels: { cache: channels, fetch: async (id) => channels.get(id) },
    isReady: () => true, user: { id: config.clientId, tag: 'Bean#1234' }, ws: { ping: 1 } };
  const other = getGuildConfig(second, 'Second');
  assert.equal(other.channels.mailbox, null);
  assert.equal(other.roles.staff, null);
  assert.equal(other.dashboard.features.youtubeMonitor, false);
  assert.equal(createDefaultWelcomeEmbedSettings(other).channelId, '');
  assert.equal(other.dashboard.presencePath, config.dashboard.presencePath);
  assert.notEqual(other.dashboard.settingsPath, config.dashboard.settingsPath);
  assert.ok(other.dashboard.settingsPath.includes(path.join('guilds', second)));

  await Promise.all([first, second].map((id) => runWithGuild(id, async () => {
    await new Promise((resolve) => setTimeout(resolve, id === first ? 12 : 1));
    assert.equal(config.guildId, id);
    await saveDashboardSettings(config, { channels: { mailbox: String(BigInt(id) + 1n) } });
    assert.equal(config.channels.mailbox, String(BigInt(id) + 1n));
  })));
  assert.equal(config.guildId, first);
  assert.equal(config.channels.mailbox, '111111111111111112');
  const savedSecond = JSON.parse(await fs.readFile(other.dashboard.settingsPath));
  assert.equal(savedSecond.channels.mailbox, '222222222222222223');
  await forEachGuild(client, async (guild) => {
    await saveTempVoiceSettings(client, config, { enabled: true, triggerChannelId: String(BigInt(guild.id) + 2n) });
    assert.equal((await getTempVoiceSettings(config)).triggerChannelId, String(BigInt(guild.id) + 2n));
    await createScheduledMailboxPost(config, { scheduledAt: new Date(Date.now() + 10000).toISOString(),
      channelId: config.channels.mailbox, payload: { blocks: [{ type: 'text', content: 'Hello' }] } });
  });
  await forEachGuild(client, () => runMailboxSchedulerTick(client, config, new Date(Date.now() + 20000)));
  assert.deepEqual(sent, [first, second]);
  const visited = [];
  await assert.rejects(forEachGuild(client, (guild) => { visited.push(guild.id); if (guild.id === first) throw new Error('first unavailable'); }));
  assert.deepEqual(visited, [first, second]);
  const emitter = new EventEmitter(); emitter.guilds = client.guilds;
  installGuildEventContext(emitter);
  const events = [];
  emitter.on('messageCreate', async () => { await Promise.resolve(); events.push(config.guildId); });
  emitter.on('messageDeleteBulk', () => events.push(config.guildId));
  emitter.emit('messageCreate', { guild: guilds.get(first) });
  emitter.emit('messageCreate', { guild: guilds.get(second) });
  emitter.emit('messageDeleteBulk', { first: () => ({ guild: guilds.get(second) }) });
  await new Promise(setImmediate);
  assert.deepEqual(events, [second, first, second]);
  const registered = [];
  await syncCommandsForClient({ ...client, commands: new Map([['ping', { data: { name: 'ping' } }]]),
    application: { commands: { set: async (body, id) => registered.push(id) } } });
  assert.deepEqual(registered, [first, second]);
  config.autoRegisterCommands = true;
  await require('../events/guildCreate').execute(guilds.get(second), {
    commands: new Map([['ping', { data: { name: 'ping' } }]]),
    application: { commands: { set: async (body, id) => registered.push(id) } },
  });
  assert.deepEqual(registered, [first, second, second]);
  const server = startDashboard(client);
  await once(server, 'listening');
  t.after(async () => { server.closeAllConnections(); await new Promise((resolve) => server.close(resolve)); });
  const base = 'http://127.0.0.1:' + server.address().port;
  async function request(route, options = {}) {
    const response = await fetch(base + route, options);
    return { status: response.status, data: await response.json() };
  }
  const login = await request('/api/login', { method: 'POST', body: JSON.stringify({ password: 'test' }) });
  const headers = { Authorization: 'Bearer ' + login.data.sessionToken, 'X-Bean-Guild-Id': second };
  const session = await request('/api/session', { headers });
  assert.equal(session.status, 200); assert.equal(session.data.guildId, second);
  assert.deepEqual(session.data.guilds.map((g) => g.id), [first, second]);
  const configuration = await request('/api/configuration', { headers });
  assert.equal(configuration.status, 200);
  assert.equal(configuration.data.settings.channels.mailbox, '222222222222222223');
  const welcome = await request('/api/welcome-embed', { headers });
  assert.equal(welcome.data.settings.channelId, '');
  const joinRoleId = '222222222222222229';
  const secondGuild = guilds.get(second);
  const joinRole = { id: joinRoleId, name: 'Member', guild: secondGuild, managed: false, editable: true };
  secondGuild.roles.cache.set(joinRoleId, joinRole);
  secondGuild.roles.fetch = async (id) => id ? secondGuild.roles.cache.get(id) : secondGuild.roles.cache;
  secondGuild.members.me = { permissions: { has: () => true } };
  const joinSaved = await request('/api/join-role', { method: 'PUT', headers, body: JSON.stringify({ roleId: joinRoleId }) });
  assert.equal(joinSaved.status, 200); assert.equal(joinSaved.data.roleId, joinRoleId);
  assert.equal((await request('/api/join-role', { headers })).data.roleId, joinRoleId);
  assert.equal((await request('/api/join-role', { headers: { ...headers, 'X-Bean-Guild-Id': first } })).data.roleId, null);
  const joinInvalid = await request('/api/join-role', { method: 'PUT', headers, body: JSON.stringify({ roleId: '111111111111111119' }) });
  assert.equal(joinInvalid.status, 400);
  assert.equal((await request('/api/join-role', { headers })).data.roleId, joinRoleId);
  const joinDisabled = await request('/api/join-role', { method: 'PUT', headers, body: JSON.stringify({ roleId: null }) });
  assert.equal(joinDisabled.status, 200); assert.equal(joinDisabled.data.roleId, null);
  const unknown = await request('/api/session', { headers: { ...headers, 'X-Bean-Guild-Id': '333333333333333333' } });
  assert.equal(unknown.status, 403);
  const originalMessages = await request('/api/saved-messages', { headers: { ...headers, 'X-Bean-Guild-Id': first } });
  const saved = await request('/api/saved-messages', { method: 'PUT', headers,
    body: JSON.stringify({ messages: [{ id: 'second-only', name: 'Second private message', blocks: [{ type: 'text', content: 'Second' }] }] }) });
  assert.equal(saved.status, 200);
  const after = await request('/api/saved-messages', { headers: { ...headers, 'X-Bean-Guild-Id': first } });
  assert.deepEqual(after.data, originalMessages.data);
  const crossServer = await request('/api/send-message', { method: 'POST', headers,
    body: JSON.stringify({ channelId: '111111111111111112', blocks: [{ type: 'text', content: 'Wrong server' }] }) });
  assert.equal(crossServer.status, 400); assert.equal(sent.length, 2);
  const crossSettings = await request('/api/welcome-embed', { method: 'PUT', headers,
    body: JSON.stringify({ settings: { channelId: '111111111111111112' } }) });
  assert.equal(crossSettings.status, 400);
  const invite = await fetch(base + '/invite', { redirect: 'manual' });
  const inviteUrl = new URL(invite.headers.get('location'));
  assert.equal(inviteUrl.searchParams.get('scope'), 'bot applications.commands');
  assert.equal(inviteUrl.searchParams.get('integration_type'), '0');

  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    if (String(url).endsWith('/oauth2/token')) return new Response(JSON.stringify({ access_token: 'fake' }));
    if (String(url) === 'https://discord.com/api/v10/users/@me') return new Response(JSON.stringify({ id: staff, username: 'Staff' }));
    return realFetch(url, options);
  };
  t.after(() => { globalThis.fetch = realFetch; });
  const start = await fetch(base + '/auth/discord', { redirect: 'manual' });
  const state = new URL(start.headers.get('location')).searchParams.get('state');
  const callback = await fetch(base + '/auth/discord/callback?state=' + state + '&code=fake',
    { redirect: 'manual', headers: { Cookie: 'bean_dashboard_oauth_state=' + state } });
  const cookie = callback.headers.getSetCookie().find((value) => value.startsWith('bean_dashboard='));
  assert.ok(cookie, 'staff can sign in to an authorized server');
  const staffHeaders = { Cookie: cookie.split(';')[0], 'X-Bean-Guild-Id': first };
  assert.equal((await request('/api/session', { headers: staffHeaders })).status, 200);
  assert.equal((await request('/api/session', { headers: { ...staffHeaders, 'X-Bean-Guild-Id': second } })).status, 403);
  assert.equal((await request('/api/bot/presence', { method: 'POST', headers: staffHeaders, body: '{}' })).status, 403);
  staffAllowed = false;
  assert.equal((await request('/api/session', { headers: staffHeaders })).status, 403);
});
