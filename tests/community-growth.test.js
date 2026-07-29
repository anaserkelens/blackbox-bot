const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');

process.env.DISCORD_TOKEN = process.env.DISCORD_TOKEN || 'test-token';

const {
  getCommunityGrowthOverview,
  getCommunityGrowthProfile,
  giveCommunityKudos,
  grantCommunityGrowthRecognition,
  listCommunityGrowthLeaderboard,
  recordMeaningfulMessage,
  recordMeaningfulReaction,
  recordVoiceParticipation,
  saveCommunityGrowthSettings,
  setCommunityGrowthPrivacy,
  startCommunityGrowthSeason,
} = require('../utils/communityGrowth');

const guildId = '1520000000000000100';
const memberId = '1520000000000000101';
const helperId = '1520000000000000102';
const channelOne = '1520000000000000201';
const channelTwo = '1520000000000000202';
const channelThree = '1520000000000000203';

test('Community Growth rewards varied participation while blocking common farming patterns', async (context) => {
  const temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'bean-growth-test-'));
  const featureConfig = {
    guildId,
    dashboard: {
      communityGrowthPath: path.join(temporaryDirectory, 'growth.json'),
      railwayVolumeMountPath: undefined,
      savedMessagesPath: undefined,
    },
  };

  context.after(() => fs.rm(temporaryDirectory, { force: true, recursive: true }));

  await saveCommunityGrowthSettings(featureConfig, {
    messageCooldownSeconds: 30,
    messageDailyLimit: 2,
    messageChannelDailyLimit: 1,
    reactionDailyLimit: 3,
    reactionPerMessageLimit: 2,
    voiceMinimumMinutes: 10,
    voiceDailyLimit: 1,
    kudosPairCooldownDays: 7,
    kudosDailySendLimit: 2,
    kudosDailyReceiveLimit: 2,
  });

  const base = Date.now();
  const identity = {
    guildId,
    userId: memberId,
    displayName: 'Cozy Bean',
    username: 'cozybean',
    avatarUrl: 'https://cdn.discordapp.com/avatar.png',
    roleIds: [],
    goodStanding: true,
  };
  const first = await recordMeaningfulMessage(featureConfig, {
    ...identity,
    channelId: channelOne,
    content: 'I really enjoyed the community event and would love another one soon.',
    createdAt: new Date(base),
  });
  const cooldown = await recordMeaningfulMessage(featureConfig, {
    ...identity,
    channelId: channelTwo,
    content: 'Here is a completely different thoughtful message for everybody.',
    createdAt: new Date(base + 10_000),
  });
  const duplicate = await recordMeaningfulMessage(featureConfig, {
    ...identity,
    channelId: channelTwo,
    content: 'I really enjoyed the community event and would love another one soon.',
    createdAt: new Date(base + 31_000),
  });
  const sameChannel = await recordMeaningfulMessage(featureConfig, {
    ...identity,
    channelId: channelOne,
    content: 'The art shared today had a lot of thoughtful details worth discussing.',
    createdAt: new Date(base + 62_000),
  });
  const second = await recordMeaningfulMessage(featureConfig, {
    ...identity,
    channelId: channelTwo,
    content: 'Helping new members find the right channels makes the server friendlier.',
    createdAt: new Date(base + 93_000),
  });
  const dailyLimit = await recordMeaningfulMessage(featureConfig, {
    ...identity,
    channelId: channelThree,
    content: 'This message is thoughtful but the daily Presence limit has been reached.',
    createdAt: new Date(base + 124_000),
  });

  assert.equal(first.awarded, true);
  assert.equal(cooldown.reason, 'cooldown');
  assert.equal(duplicate.reason, 'duplicate');
  assert.equal(sameChannel.reason, 'channel-limit');
  assert.equal(second.awarded, true);
  assert.equal(dailyLimit.reason, 'daily-limit');

  const messageId = '1520000000000000301';
  const reactionOne = await recordMeaningfulReaction(featureConfig, {
    guildId,
    recipientId: memberId,
    recipientDisplayName: 'Cozy Bean',
    recipientUsername: 'cozybean',
    recipientRoleIds: [],
    reactorId: helperId,
    channelId: channelOne,
    messageId,
    messageCreatedAt: new Date(base),
    createdAt: new Date(base + 130_000),
  });
  const repeatedReaction = await recordMeaningfulReaction(featureConfig, {
    guildId,
    recipientId: memberId,
    recipientDisplayName: 'Cozy Bean',
    recipientUsername: 'cozybean',
    recipientRoleIds: [],
    reactorId: helperId,
    channelId: channelOne,
    messageId,
    messageCreatedAt: new Date(base),
    createdAt: new Date(base + 131_000),
  });
  const reactionTwo = await recordMeaningfulReaction(featureConfig, {
    guildId,
    recipientId: memberId,
    recipientDisplayName: 'Cozy Bean',
    recipientUsername: 'cozybean',
    recipientRoleIds: [],
    reactorId: '1520000000000000103',
    channelId: channelOne,
    messageId,
    messageCreatedAt: new Date(base),
    createdAt: new Date(base + 132_000),
  });
  const reactionMessageLimit = await recordMeaningfulReaction(featureConfig, {
    guildId,
    recipientId: memberId,
    recipientDisplayName: 'Cozy Bean',
    recipientUsername: 'cozybean',
    recipientRoleIds: [],
    reactorId: '1520000000000000104',
    channelId: channelOne,
    messageId,
    messageCreatedAt: new Date(base),
    createdAt: new Date(base + 133_000),
  });

  assert.equal(reactionOne.awarded, true);
  assert.equal(repeatedReaction.reason, 'already-counted');
  assert.equal(reactionTwo.awarded, true);
  assert.equal(reactionMessageLimit.reason, 'message-limit');

  const shortVoice = await recordVoiceParticipation(featureConfig, {
    ...identity,
    channelId: channelOne,
    durationMinutes: 5,
    endedAt: new Date(base + 140_000),
  });
  const voice = await recordVoiceParticipation(featureConfig, {
    ...identity,
    channelId: channelOne,
    durationMinutes: 18,
    endedAt: new Date(base + 150_000),
  });
  const voiceLimit = await recordVoiceParticipation(featureConfig, {
    ...identity,
    channelId: channelTwo,
    durationMinutes: 30,
    endedAt: new Date(base + 160_000),
  });

  assert.equal(shortVoice.reason, 'too-short');
  assert.equal(voice.awarded, true);
  assert.equal(voiceLimit.reason, 'daily-limit');

  const kudos = await giveCommunityKudos(featureConfig, {
    guildId,
    giverId: helperId,
    giverDisplayName: 'Helpful Bean',
    giverUsername: 'helpfulbean',
    recipientId: memberId,
    recipientDisplayName: 'Cozy Bean',
    recipientUsername: 'cozybean',
    reason: 'They welcomed a newcomer and patiently explained where everything was.',
    createdAt: new Date(base + 170_000),
  });

  assert.equal(kudos.recipient.traits.support, 5);
  await assert.rejects(
    giveCommunityKudos(featureConfig, {
      guildId,
      giverId: helperId,
      giverDisplayName: 'Helpful Bean',
      giverUsername: 'helpfulbean',
      recipientId: memberId,
      recipientDisplayName: 'Cozy Bean',
      recipientUsername: 'cozybean',
      reason: 'Another attempt before the pair cooldown should not be accepted.',
      createdAt: new Date(base + 180_000),
    }),
    /again/i,
  );

  const recognized = await grantCommunityGrowthRecognition(featureConfig, {
    guildId,
    userId: memberId,
    displayName: 'Cozy Bean',
    username: 'cozybean',
    trait: 'community',
    points: 8,
    badgeId: 'event_host',
    reason: 'Hosted a welcoming community game night for the server.',
    actor: {
      id: '1520000000000000999',
      displayName: 'Staff Bean',
    },
  });

  assert.ok(recognized.badges.some((badge) => badge.id === 'event_host'));
  assert.equal(recognized.traits.community, 11);

  const profileBeforeSeason = await getCommunityGrowthProfile(featureConfig, guildId, memberId);
  const lifetimeBeforeSeason = profileBeforeSeason.total;
  const seasonResult = await startCommunityGrowthSeason(featureConfig, {
    guildId,
    name: 'Fresh Garden',
    endsAt: new Date(base + 120 * 24 * 60 * 60 * 1000),
    actor: {
      id: '1520000000000000999',
      displayName: 'Staff Bean',
    },
  });
  const profileAfterSeason = await getCommunityGrowthProfile(featureConfig, guildId, memberId);

  assert.equal(seasonResult.season.name, 'Fresh Garden');
  assert.equal(profileAfterSeason.total, lifetimeBeforeSeason);
  assert.equal(profileAfterSeason.seasonTotal, 0);
  assert.ok(profileAfterSeason.badges.some((badge) => badge.id === 'event_host'));

  await setCommunityGrowthPrivacy(featureConfig, {
    guildId,
    userId: memberId,
    displayName: 'Cozy Bean',
    username: 'cozybean',
    visible: false,
  });
  const leaderboard = await listCommunityGrowthLeaderboard(featureConfig, guildId, {
    period: 'lifetime',
  });
  const overview = await getCommunityGrowthOverview(featureConfig, guildId);

  assert.equal(leaderboard.profiles.some((profile) => profile.userId === memberId), false);
  assert.equal(overview.metrics.activeProfiles >= 1, true);
  assert.ok(overview.recentActivity.some((entry) => entry.type === 'season'));
});
