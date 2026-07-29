const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');

process.env.DISCORD_TOKEN = process.env.DISCORD_TOKEN || 'test-token';

const { config } = require('../utils/config');
const { handleReactionRoleChange } = require('../events/reactionRoleHandler');
const {
  createReactionRoleMapping,
  deleteReactionRoleMapping,
  listReactionRoleMappings,
  loadReactionRoleMappings,
  parseDiscordMessageLink,
  syncReactionRoleMappings,
} = require('../utils/reactionRoles');

const guildId = '1520000000000000100';
const channelId = '1520000000000000200';
const messageId = '1520000000000000300';
const roleId = '1520000000000000400';
const userId = '1520000000000000500';

function createReactionRoleFixture(storagePath) {
  const reactions = [];
  const removedBotReactions = [];
  const roleChanges = [];
  const memberRoleIds = new Set();
  const message = {
    id: messageId,
    channelId,
    guildId,
    react: async (emoji) => {
      reactions.push(emoji);
      return { emoji };
    },
    reactions: {
      resolve: () => ({
        users: {
          remove: async (id) => removedBotReactions.push(id),
        },
      }),
    },
  };
  const channel = {
    id: channelId,
    name: 'pick-your-roles',
    isTextBased: () => true,
    messages: {
      fetch: async (id) => (id === messageId ? message : null),
    },
  };
  const role = {
    id: roleId,
    name: 'Upload pings',
    managed: false,
    editable: true,
    hexColor: '#55AAFF',
  };
  const member = {
    roles: {
      cache: {
        has: (id) => memberRoleIds.has(id),
      },
      add: async (id) => {
        memberRoleIds.add(id);
        roleChanges.push({ action: 'add', id });
      },
      remove: async (id) => {
        memberRoleIds.delete(id);
        roleChanges.push({ action: 'remove', id });
      },
    },
  };
  const guild = {
    id: guildId,
    channels: {
      fetch: async (id) => (id === channelId ? channel : null),
    },
    roles: {
      fetch: async (id) => (id === roleId ? role : null),
    },
    emojis: {
      fetch: async () => null,
    },
    members: {
      fetch: async (id) => (id === userId ? member : null),
    },
  };
  const client = {
    user: { id: '1520000000000000600' },
    isReady: () => true,
    guilds: {
      cache: new Map([[guildId, guild]]),
    },
  };
  const featureConfig = {
    guildId,
    dashboard: {
      reactionRolesPath: storagePath,
      railwayVolumeMountPath: undefined,
    },
    legacyReactionRole: {},
    roles: {},
  };

  return {
    channel,
    client,
    featureConfig,
    guild,
    memberRoleIds,
    message,
    reactions,
    removedBotReactions,
    roleChanges,
  };
}

test('reaction-role mappings support any message, emoji, and manageable role', async () => {
  const temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'bean-reaction-role-'));
  const storagePath = path.join(temporaryDirectory, 'reaction-roles.json');
  const fixture = createReactionRoleFixture(storagePath);

  try {
    const created = await createReactionRoleMapping(fixture.client, fixture.featureConfig, {
      messageUrl: `https://discord.com/channels/${guildId}/${channelId}/${messageId}`,
      emoji: '🔔',
      roleId,
      removeOnUnreact: true,
    }, {
      id: userId,
      displayName: 'snuf',
    });
    const loaded = await loadReactionRoleMappings(fixture.featureConfig);
    const listed = await listReactionRoleMappings(fixture.client, fixture.featureConfig);

    assert.equal(created.emojiKey, '🔔');
    assert.equal(created.roleId, roleId);
    assert.equal(created.createdBy.displayName, 'snuf');
    assert.equal(fixture.reactions[0], '🔔');
    assert.equal(loaded.length, 1);
    assert.equal(listed[0].channelName, 'pick-your-roles');
    assert.equal(listed[0].roleName, 'Upload pings');
    assert.equal(listed[0].healthy, true);
    assert.equal(
      listed[0].messageUrl,
      `https://discord.com/channels/${guildId}/${channelId}/${messageId}`,
    );

    await assert.rejects(
      createReactionRoleMapping(fixture.client, fixture.featureConfig, {
        messageUrl: listed[0].messageUrl,
        emoji: '🔔',
        roleId,
      }),
      /already exists/i,
    );

    const syncResults = await syncReactionRoleMappings(fixture.client, fixture.featureConfig, guildId);

    assert.deepEqual(syncResults.map((result) => result.ok), [true]);
    assert.equal(fixture.reactions.length, 2);

    await deleteReactionRoleMapping(fixture.client, fixture.featureConfig, created.id);
    assert.deepEqual(await loadReactionRoleMappings(fixture.featureConfig), []);
    assert.deepEqual(fixture.removedBotReactions, [fixture.client.user.id]);
  } finally {
    await fs.rm(temporaryDirectory, { force: true, recursive: true });
  }
});

test('reaction add and remove events grant and revoke every matching mapped role', async () => {
  const temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'bean-reaction-event-'));
  const storagePath = path.join(temporaryDirectory, 'reaction-roles.json');
  const fixture = createReactionRoleFixture(storagePath);
  const originalGuildId = config.guildId;
  const originalPath = config.dashboard.reactionRolesPath;
  const originalFeatures = config.dashboard.features;
  const originalLegacyReactionRole = config.legacyReactionRole;

  try {
    config.guildId = guildId;
    config.dashboard.reactionRolesPath = storagePath;
    config.dashboard.features = { ...(originalFeatures || {}), reactionRoles: true };
    config.legacyReactionRole = {};

    await createReactionRoleMapping(fixture.client, config, {
      messageUrl: `https://discord.com/channels/${guildId}/${channelId}/${messageId}`,
      emoji: '🎨',
      roleId,
      removeOnUnreact: true,
    });

    const reaction = {
      partial: false,
      emoji: { id: null, name: '🎨' },
      message: {
        id: messageId,
        guildId,
        guild: fixture.guild,
      },
    };
    const user = { id: userId, tag: 'member', bot: false };

    await handleReactionRoleChange(reaction, user, true);
    assert.equal(fixture.memberRoleIds.has(roleId), true);
    assert.deepEqual(fixture.roleChanges[0], { action: 'add', id: roleId });

    await handleReactionRoleChange(reaction, user, false);
    assert.equal(fixture.memberRoleIds.has(roleId), false);
    assert.deepEqual(fixture.roleChanges[1], { action: 'remove', id: roleId });
  } finally {
    config.guildId = originalGuildId;
    config.dashboard.reactionRolesPath = originalPath;
    config.dashboard.features = originalFeatures;
    config.legacyReactionRole = originalLegacyReactionRole;
    await fs.rm(temporaryDirectory, { force: true, recursive: true });
  }
});

test('Discord message links reject non-message URLs', () => {
  assert.deepEqual(
    parseDiscordMessageLink(`https://discord.com/channels/${guildId}/${channelId}/${messageId}`),
    { guildId, channelId, messageId },
  );
  assert.throws(() => parseDiscordMessageLink('https://discord.com/channels/@me'), /valid Discord message link/i);
});
