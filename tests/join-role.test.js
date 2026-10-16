const assert = require('node:assert/strict');
const { test } = require('node:test');
const { EventEmitter } = require('node:events');
process.env.DISCORD_TOKEN = 'test-token';
const { assignJoinRole, validateJoinRole } = require('../utils/joinRole');
const { config } = require('../utils/config');
const { saveDashboardSettings, initializeDashboardSettings } = require('../utils/dashboardSettings');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
function fixture() {
  const guild = { id: '111111111111111111', members: { me: { permissions: { has: () => true } } } };
  const role = { id: '222222222222222222', guild, managed: false, editable: true };
  guild.roles = { fetch: async (id) => id === role.id ? role : null };
  const assigned = [];
  const member = { guild, user: { bot: false }, pending: false, roles: { cache: new Map(), add: async (id) => assigned.push(id) } };
  const settings = { guildId: guild.id, roles: { autoJoin: role.id }, dashboard: { features: { welcomeMessages: false } } };
  return { guild, role, member, settings, assigned };
}
test('join role is independent of welcome messages and skips bots, screening and existing roles', async () => {
  const f = fixture();
  assert.equal(await assignJoinRole(f.member, f.settings), true);
  assert.deepEqual(f.assigned, [f.role.id]);
  for (const change of [{ user: { bot: true } }, { pending: true }, { roles: { cache: new Map([[f.role.id, f.role]]) } }]) {
    assert.equal(await assignJoinRole({ ...f.member, ...change }, f.settings), false);
  }
  assert.equal(await assignJoinRole(f.member, { ...f.settings, roles: { autoJoin: null } }), false);
  assert.equal(await assignJoinRole(f.member, { ...f.settings, guildId: '333333333333333333' }), false);
  assert.equal(f.assigned.length, 1);
});
test('join roles reject foreign, managed, missing and unmanageable roles', async () => {
  const f = fixture();
  await assert.rejects(validateJoinRole(f.guild, 'bad'), /valid role/);
  await assert.rejects(validateJoinRole(f.guild, '333333333333333333'), /regular role/);
  f.role.managed = true; await assert.rejects(validateJoinRole(f.guild, f.role.id), /regular role/);
  f.role.managed = false; f.role.editable = false;
  await assert.rejects(assignJoinRole(f.member, f.settings), /above/);
  f.role.editable = true; f.guild.members.me.permissions.has = () => false;
  await assert.rejects(assignJoinRole(f.member, f.settings), /Manage Roles/);
  f.guild.members.me.permissions.has = () => true; f.role.guild = { id: '333333333333333333' };
  await assert.rejects(assignJoinRole(f.member, f.settings), /regular role/);
  assert.deepEqual(f.assigned, []);
});
test('screening completion assigns the role once without reassigning on ordinary member updates', async (t) => {
  const f = fixture(); const client = new EventEmitter();
  const originalRoles = config.roles, originalGuild = config.guildId;
  config.roles = f.settings.roles; config.guildId = f.guild.id;
  t.after(() => { config.roles = originalRoles; config.guildId = originalGuild; });
  require('../events/joinRole').setup(client);
  client.emit('guildMemberAdd', { ...f.member, pending: true });
  client.emit('guildMemberUpdate', { pending: true }, f.member);
  await new Promise(setImmediate);
  assert.deepEqual(f.assigned, [f.role.id]);
  client.emit('guildMemberUpdate', { pending: false }, f.member);
  await new Promise(setImmediate);
  assert.equal(f.assigned.length, 1);
});
test('join role persists, reloads and can be disabled', async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'bean-join-role-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const f = fixture();
  const settings = { ...f.settings, channels: {}, intents: {}, invites: {}, streamMonitor: {}, youtubeMonitor: {},
    dashboard: { settingsPath: path.join(root, 'settings.json') } };
  await saveDashboardSettings(settings, { roles: { autoJoin: f.role.id } });
  settings.roles.autoJoin = null; initializeDashboardSettings(settings);
  assert.equal(settings.roles.autoJoin, f.role.id);
  await saveDashboardSettings(settings, { roles: { autoJoin: null } });
  initializeDashboardSettings(settings); assert.equal(settings.roles.autoJoin, null);
});
