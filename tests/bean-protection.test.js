const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');

process.env.DISCORD_TOKEN = process.env.DISCORD_TOKEN || 'test-token';

const {
  addQuarantineReviewNote,
  bulkReleaseQuarantineReviews,
  evaluateProtectionJoin,
  evaluateProtectionMessage,
  getProtectionOverview,
  resolveQuarantineReview,
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
  const released = [];
  const kicked = [];
  const banned = [];
  const activeRoleIds = new Set();
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
      ban: async (targetId) => {
        banned.push(targetId);
      },
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
    kickable: true,
    bannable: true,
    permissions: { has: () => false },
    roles: {
      cache: { has: (roleId) => activeRoleIds.has(roleId) },
      add: async (role) => {
        quarantined.push(role.id);
        activeRoleIds.add(role.id);
      },
      remove: async (role) => {
        released.push(role.id);
        activeRoleIds.delete(role.id);
      },
    },
    timeout: async (durationMs) => {
      timeouts.push(durationMs);
    },
    kick: async () => {
      kicked.push(userId);
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
  assert.equal(overview.metrics.pendingQuarantines, 1);
  assert.equal(overview.quarantineReviews[0].status, 'pending');
  assert.ok(overview.incidents.some((incident) => incident.type === 'member_quarantined'));

  const notedReview = await addQuarantineReviewNote(
    featureConfig,
    joinResult.review.id,
    'Account checked by test staff.',
    { id: botId, displayName: 'Test Staff', role: 'staff' },
  );

  assert.equal(notedReview.notes.length, 1);

  const resolvedReview = await resolveQuarantineReview(client, featureConfig, {
    reviewId: joinResult.review.id,
    action: 'timeout',
    actor: { id: botId, username: 'Test Staff', tag: 'Test Staff#0001' },
    reason: 'Suspicious raid behavior confirmed.',
    durationMs: 30 * 60 * 1000,
  });
  const casesAfterReview = await listModerationCases(featureConfig, guildId);

  assert.equal(resolvedReview.status, 'timed_out');
  assert.match(resolvedReview.resolution.caseReference, /^CASE-\d{6}$/);
  assert.equal(timeouts.at(-1), 30 * 60 * 1000);
  assert.deepEqual(released, [quarantineRoleId]);
  assert.equal(casesAfterReview.length, 2);
  assert.equal(casesAfterReview[0].metadata.source, 'bean-quarantine-review');

  const secondJoin = await evaluateProtectionJoin(member, client, featureConfig);
  const bulkResult = await bulkReleaseQuarantineReviews(client, featureConfig, {
    guildId,
    actor: { id: botId, displayName: 'Test Staff', role: 'staff' },
    reason: 'False-positive raid cleared.',
  });
  const finalOverview = await getProtectionOverview(client, featureConfig);

  assert.equal(secondJoin.status, 'quarantined');
  assert.equal(bulkResult.released.length, 1);
  assert.equal(bulkResult.failed.length, 0);
  assert.equal(finalOverview.metrics.pendingQuarantines, 0);
  assert.equal(finalOverview.quarantineReviews[0].status, 'released');

  const kickJoin = await evaluateProtectionJoin(member, client, featureConfig);
  const kickedReview = await resolveQuarantineReview(client, featureConfig, {
    reviewId: kickJoin.review.id,
    action: 'kick',
    actor: { id: botId, username: 'Test Staff', tag: 'Test Staff#0001' },
    reason: 'Kick branch verification.',
  });
  const banJoin = await evaluateProtectionJoin(member, client, featureConfig);
  const bannedReview = await resolveQuarantineReview(client, featureConfig, {
    reviewId: banJoin.review.id,
    action: 'ban',
    actor: { id: botId, username: 'Test Staff', tag: 'Test Staff#0001' },
    reason: 'Ban branch verification.',
    deleteMessageSeconds: 3600,
  });
  const finalCases = await listModerationCases(featureConfig, guildId);

  assert.equal(kickedReview.status, 'kicked');
  assert.equal(bannedReview.status, 'banned');
  assert.deepEqual(kicked, [userId]);
  assert.deepEqual(banned, [userId]);
  assert.equal(finalCases.length, 4);
  assert.equal(finalCases[0].metadata.deleteMessageSeconds, 3600);
});
