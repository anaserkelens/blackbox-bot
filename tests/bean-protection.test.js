const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');

process.env.DISCORD_TOKEN = process.env.DISCORD_TOKEN || 'test-token';

const {
  evaluateProtectionJoin,
  evaluateProtectionMessage,
  getProtectionOverview,
  saveProtectionSettings,
  setRaidMode,
  syncNativeAutoModerationRules,
} = require('../utils/beanProtection');
const { listModerationCases } = require('../utils/moderationCases');

const guildId = '1520000000000000100';
const userId = '1520000000000000101';
const botId = '1520000000000000102';
const alertChannelId = '1520000000000000103';
const quarantineRoleId = '1520000000000000104';

test('Bean Protection persists settings, escalates message floods, and quarantines during raid mode', async (context) => {
  const temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'bean-protection-test-'));

  context.after(() => fs.rm(temporaryDirectory, { force: true, recursive: true }));

  const sentLogs = [];
  const sentDms = [];
  const deleted = [];
  const timeouts = [];
  const quarantined = [];
  const quarantineRole = {
    id: quarantineRoleId,
    name: 'Quarantine',
    editable: true,
    toString: () => `<@&${quarantineRoleId}>`,
  };
  const nativeRules = new Map();
  const guild = {
    id: guildId,
    name: 'Protection Test',
    roles: { cache: new Map([[quarantineRoleId, quarantineRole]]) },
    members: {
      cache: new Map(),
      fetch: async () => null,
    },
    autoModerationRules: {
      fetch: async () => nativeRules,
      create: async (definition) => {
        const rule = {
          ...definition,
          id: String(1520000000000000200n + BigInt(nativeRules.size)),
        };

        nativeRules.set(rule.id, rule);
        return rule;
      },
      edit: async (current, definition) => {
        const rule = { ...current, ...definition };

        nativeRules.set(rule.id, rule);
        return rule;
      },
    },
  };
  const client = {
    user: {
      id: botId,
      username: 'Bean',
      tag: 'Bean#0001',
      bot: true,
      toString: () => `<@${botId}>`,
    },
    guilds: { cache: new Map([[guildId, guild]]) },
    channels: {
      fetch: async (channelId) => channelId === alertChannelId
        ? {
          isSendable: () => true,
          send: async (payload) => {
            sentLogs.push(payload);
          },
        }
        : null,
    },
  };
  const featureConfig = {
    guildId,
    roles: {},
    channels: { caseFiles: alertChannelId },
    protection: {
      enabled: true,
      alertChannelId,
      quarantineRoleId,
      floodMessageLimit: 3,
      floodWindowSeconds: 10,
      duplicateMessageLimit: 3,
      duplicateWindowSeconds: 20,
      joinLimit: 5,
      joinWindowSeconds: 300,
      autoRaidMode: false,
    },
    dashboard: {
      features: { beanProtection: true },
      protectionPath: path.join(temporaryDirectory, 'protection.json'),
      moderationCasesPath: path.join(temporaryDirectory, 'cases.json'),
      activityPath: path.join(temporaryDirectory, 'activity.json'),
      railwayVolumeMountPath: undefined,
      savedMessagesPath: undefined,
    },
  };

  await saveProtectionSettings(featureConfig, {
    floodMessageLimit: 3,
    floodWindowSeconds: 10,
    duplicateMessageLimit: 3,
    duplicateWindowSeconds: 20,
    joinLimit: 5,
    joinWindowSeconds: 300,
    nativeMentionLimit: 6,
    alertChannelId,
    quarantineRoleId,
  });

  const user = {
    id: userId,
    username: 'member',
    tag: 'member#0001',
    bot: false,
    displayAvatarURL: () => 'https://example.com/avatar.png',
    createDM: async () => ({
      send: async (payload) => {
        sentDms.push(payload);
      },
    }),
    toString: () => `<@${userId}>`,
  };
  const member = {
    id: userId,
    user,
    displayName: 'Member',
    moderatable: true,
    permissions: { has: () => false },
    roles: {
      cache: { has: () => false },
      add: async (role) => {
        quarantined.push(role.id);
      },
    },
    timeout: async (durationMs) => {
      timeouts.push(durationMs);
    },
    guild,
    toString: () => `<@${userId}>`,
  };

  guild.members.cache.set(userId, member);

  for (let index = 1; index <= 3; index += 1) {
    const message = {
      id: String(1520000000000000300n + BigInt(index)),
      guild,
      author: user,
      member,
      channelId: alertChannelId,
      content: `message ${index}`,
      delete: async () => {
        deleted.push(index);
      },
    };
    const result = await evaluateProtectionMessage(message, client, featureConfig);

    if (index < 3) {
      assert.equal(result, null);
    } else {
      assert.equal(result.action, 'warn');
      assert.match(result.caseReference, /^CASE-\d{6}$/);
    }
  }

  const cases = await listModerationCases(featureConfig, guildId);

  assert.equal(cases.length, 1);
  assert.equal(cases[0].metadata.source, 'bean');
  assert.deepEqual(deleted, [3]);
  assert.equal(timeouts.length, 0);
  assert.equal(sentDms.length, 1);
  assert.ok(sentLogs.length >= 1);

  const syncResult = await syncNativeAutoModerationRules(guild, featureConfig, {
    displayName: 'Test Staff',
  });

  assert.equal(syncResult.created.length, 2);
  assert.equal(nativeRules.size, 2);

  await setRaidMode(client, featureConfig, {
    active: true,
    guildId,
    actor: client.user,
    reason: 'Automated test raid.',
  });
  const joinResult = await evaluateProtectionJoin(member, client, featureConfig);
  const overview = await getProtectionOverview(client, featureConfig);

  assert.equal(joinResult.status, 'quarantined');
  assert.deepEqual(quarantined, [quarantineRoleId]);
  assert.equal(overview.raid.active, true);
  assert.equal(overview.native.beanRules.length, 2);
  assert.ok(overview.incidents.some((incident) => incident.type === 'member_quarantined'));
});
