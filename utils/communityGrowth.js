const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');

const defaultCommunityGrowthPath = path.join(__dirname, '..', 'data', 'community-growth.json');
const TRAITS = Object.freeze(['presence', 'spark', 'support', 'community', 'trust']);
const TRAIT_DETAILS = Object.freeze({
  presence: {
    name: 'Presence',
    description: 'Showing up consistently without rewarding message spam.',
  },
  spark: {
    name: 'Spark',
    description: 'Starting conversations that other members genuinely engage with.',
  },
  support: {
    name: 'Support',
    description: 'Being recognized for helping and encouraging other members.',
  },
  community: {
    name: 'Community',
    description: 'Joining shared activities and contributing beyond ordinary chat.',
  },
  trust: {
    name: 'Trust',
    description: 'Building a positive, consistent history over time.',
  },
});
const BADGE_DEFINITIONS = Object.freeze({
  first_steps: {
    name: 'First Steps',
    description: 'Earned the first 10 Community Growth points.',
    icon: 'seedling',
    automatic: true,
  },
  regular: {
    name: 'Regular',
    description: 'Built 50 Presence.',
    icon: 'calendar-check',
    automatic: true,
  },
  conversation_starter: {
    name: 'Conversation Starter',
    description: 'Built 25 Spark through genuine member engagement.',
    icon: 'comments',
    automatic: true,
  },
  helping_hand: {
    name: 'Helping Hand',
    description: 'Built 25 Support through community kudos.',
    icon: 'hand-holding-heart',
    automatic: true,
  },
  community_builder: {
    name: 'Community Builder',
    description: 'Built 40 Community through shared participation.',
    icon: 'people-group',
    automatic: true,
  },
  trusted_bean: {
    name: 'Trusted Bean',
    description: 'Built 30 Trust through positive active days.',
    icon: 'shield-heart',
    automatic: true,
  },
  well_rounded: {
    name: 'Well-Rounded Bean',
    description: 'Built at least 10 points in every growth trait.',
    icon: 'compass',
    automatic: true,
  },
  event_host: {
    name: 'Event Host',
    description: 'Recognized by staff for bringing members together.',
    icon: 'calendar-star',
    automatic: false,
  },
  creative_contributor: {
    name: 'Creative Contributor',
    description: 'Recognized by staff for a meaningful creative contribution.',
    icon: 'palette',
    automatic: false,
  },
  welcome_wagon: {
    name: 'Welcome Wagon',
    description: 'Recognized by staff for helping newcomers feel at home.',
    icon: 'door-open',
    automatic: false,
  },
});
const DEFAULT_SETTINGS = Object.freeze({
  enabled: true,
  messageGrowthEnabled: true,
  reactionGrowthEnabled: true,
  voiceGrowthEnabled: true,
  kudosEnabled: true,
  publicLeaderboards: true,
  minimumMessageLength: 24,
  minimumUniqueWords: 4,
  messageCooldownSeconds: 120,
  messageDailyLimit: 12,
  messageChannelDailyLimit: 5,
  reactionDailyLimit: 10,
  reactionPerMessageLimit: 5,
  voiceMinimumMinutes: 10,
  voiceDailyLimit: 3,
  kudosPairCooldownDays: 7,
  kudosDailySendLimit: 3,
  kudosDailyReceiveLimit: 5,
  seasonLengthDays: 90,
  excludedChannelIds: [],
  excludedRoleIds: [],
});
const STAGES = Object.freeze([
  { id: 'seed', name: 'Seed', minimum: 0 },
  { id: 'sprout', name: 'Sprout', minimum: 20 },
  { id: 'bloom', name: 'Bloom', minimum: 60 },
  { id: 'canopy', name: 'Canopy', minimum: 140 },
  { id: 'evergreen', name: 'Evergreen', minimum: 300 },
]);
const MAX_PROFILE_ACTIVITY = 60;
const MAX_GLOBAL_ACTIVITY = 3000;
const MAX_KUDOS = 2000;
const MAX_REACTION_CLAIMS = 5000;
let mutationQueue = Promise.resolve();

async function loadCommunityGrowthStore(config) {
  await mutationQueue.catch(() => null);
  return readStore(getCommunityGrowthStorageInfo(config).filePath);
}

async function getCommunityGrowthOverview(config, guildId) {
  const store = await loadCommunityGrowthStore(config);
  const normalizedGuildId = normalizeSnowflake(guildId || config.guildId);
  const profiles = Object.values(store.profiles)
    .filter((profile) => !normalizedGuildId || profile.guildId === normalizedGuildId)
    .map((profile) => createProfileView(profile, store));
  const seasonStartedAt = new Date(store.season.startsAt).getTime();
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const guildKudos = store.kudos.filter((entry) => entry.guildId === normalizedGuildId);
  const guildActivity = store.activity.filter((entry) => entry.guildId === normalizedGuildId);

  return {
    settings: clone(store.settings),
    season: clone(store.season),
    traits: clone(TRAIT_DETAILS),
    badgeDefinitions: clone(BADGE_DEFINITIONS),
    stages: clone(STAGES),
    metrics: {
      profiles: profiles.length,
      activeProfiles: profiles.filter((profile) => profile.total > 0).length,
      visibleProfiles: profiles.filter((profile) => profile.visible).length,
      seasonGrowth: profiles.reduce((total, profile) => total + profile.seasonTotal, 0),
      seasonKudos: guildKudos.filter((entry) => new Date(entry.createdAt).getTime() >= seasonStartedAt).length,
      activity7d: guildActivity.filter((entry) => new Date(entry.createdAt).getTime() >= sevenDaysAgo).length,
    },
    leaderboard: rankProfiles(profiles, 'total', 'season', 10, store.settings.publicLeaderboards),
    recentActivity: guildActivity.slice(0, 30).map(clone),
    storage: getCommunityGrowthStorageInfo(config),
  };
}

async function ensureCommunityGrowthProfile(config, input) {
  return mutateStore(config, (store) => {
    const profile = ensureProfile(store, input);

    return createProfileView(profile, store);
  });
}

async function getCommunityGrowthProfile(config, guildId, userId, identity = null) {
  const normalizedGuildId = normalizeSnowflake(guildId || config.guildId);
  const normalizedUserId = normalizeSnowflake(userId);

  if (!normalizedGuildId || !normalizedUserId) {
    return null;
  }

  const store = await loadCommunityGrowthStore(config);
  const existing = store.profiles[profileKey(normalizedGuildId, normalizedUserId)];

  if (existing) {
    return createProfileView(existing, store);
  }

  if (!identity) {
    return createProfileView(createProfile({
      guildId: normalizedGuildId,
      userId: normalizedUserId,
      displayName: 'Community member',
      username: 'unknown',
    }, store.season), store);
  }

  return ensureCommunityGrowthProfile(config, {
    guildId: normalizedGuildId,
    userId: normalizedUserId,
    ...identity,
  });
}

async function searchCommunityGrowthProfiles(config, guildId, query = '', options = {}) {
  const store = await loadCommunityGrowthStore(config);
  const normalizedGuildId = normalizeSnowflake(guildId || config.guildId);
  const normalizedQuery = String(query || '').trim().toLowerCase();
  const limit = clampInteger(options.limit, 1, 100, 25);
  const includePrivate = options.includePrivate === true;

  return Object.values(store.profiles)
    .filter((profile) => profile.guildId === normalizedGuildId)
    .filter((profile) => includePrivate || profile.visible)
    .filter((profile) => {
      if (!normalizedQuery) return true;

      return [
        profile.userId,
        profile.displayName,
        profile.username,
      ].some((value) => String(value || '').toLowerCase().includes(normalizedQuery));
    })
    .map((profile) => createProfileView(profile, store))
    .sort((left, right) => right.seasonTotal - left.seasonTotal || left.displayName.localeCompare(right.displayName))
    .slice(0, limit);
}

async function listCommunityGrowthLeaderboard(config, guildId, options = {}) {
  const store = await loadCommunityGrowthStore(config);
  const normalizedGuildId = normalizeSnowflake(guildId || config.guildId);
  const trait = TRAITS.includes(options.trait) ? options.trait : 'total';
  const period = options.period === 'lifetime' ? 'lifetime' : 'season';
  const limit = clampInteger(options.limit, 1, 25, 10);
  const profiles = Object.values(store.profiles)
    .filter((profile) => profile.guildId === normalizedGuildId)
    .map((profile) => createProfileView(profile, store));

  return {
    trait,
    period,
    season: clone(store.season),
    public: store.settings.publicLeaderboards,
    profiles: rankProfiles(profiles, trait, period, limit, store.settings.publicLeaderboards),
  };
}

async function saveCommunityGrowthSettings(config, input, actor = null) {
  return mutateStore(config, (store) => {
    const previous = store.settings;

    store.settings = normalizeSettings({ ...previous, ...(input || {}) });
    appendGlobalActivity(store, {
      guildId: normalizeSnowflake(config.guildId),
      userId: normalizeSnowflake(actor?.id),
      displayName: normalizeText(actor?.displayName || actor?.username || 'Dashboard operator', 100),
      type: 'settings',
      trait: null,
      points: 0,
      summary: 'Community Growth settings were updated.',
      source: 'dashboard',
    });
    return clone(store.settings);
  });
}

async function setCommunityGrowthPrivacy(config, input) {
  return mutateStore(config, (store) => {
    const profile = ensureProfile(store, input);

    profile.visible = input.visible !== false;
    profile.updatedAt = new Date().toISOString();
    return createProfileView(profile, store);
  });
}

async function updateCommunityGrowthProfile(config, input) {
  return mutateStore(config, (store) => {
    const profile = ensureProfile(store, input);

    if (Object.hasOwn(input, 'bio')) {
      profile.bio = normalizeText(input.bio, 160);
    }
    if (Object.hasOwn(input, 'accentColor')) {
      profile.accentColor = normalizeColor(input.accentColor);
    }
    if (Object.hasOwn(input, 'visible')) {
      profile.visible = input.visible !== false;
    }

    profile.updatedAt = new Date().toISOString();
    return createProfileView(profile, store);
  });
}

async function recordMeaningfulMessage(config, input) {
  const guildId = normalizeSnowflake(input.guildId);
  const userId = normalizeSnowflake(input.userId);
  const channelId = normalizeSnowflake(input.channelId);
  const content = normalizeMessageContent(input.content);

  if (!guildId || !userId || !channelId) {
    return { awarded: false, reason: 'invalid' };
  }

  return mutateStore(config, (store) => {
    const settings = store.settings;

    if (!settings.enabled || !settings.messageGrowthEnabled) {
      return { awarded: false, reason: 'disabled' };
    }
    if (settings.excludedChannelIds.includes(channelId)) {
      return { awarded: false, reason: 'excluded-channel' };
    }
    if (hasExcludedRole(input.roleIds, settings.excludedRoleIds)) {
      return { awarded: false, reason: 'excluded-role' };
    }
    if (!isMeaningfulContent(content, settings)) {
      return { awarded: false, reason: 'not-meaningful' };
    }

    const now = normalizeDate(input.createdAt) || new Date().toISOString();
    const nowMs = new Date(now).getTime();
    const day = dayKey(now);
    const profile = ensureProfile(store, input);
    const state = profile.messageState;

    resetDailyMessageState(state, day);

    if (state.dailyAwards >= settings.messageDailyLimit) {
      return { awarded: false, reason: 'daily-limit' };
    }
    if ((state.channelAwards[channelId] || 0) >= settings.messageChannelDailyLimit) {
      return { awarded: false, reason: 'channel-limit' };
    }
    if (
      state.lastAwardAt
      && nowMs - new Date(state.lastAwardAt).getTime() < settings.messageCooldownSeconds * 1000
    ) {
      return { awarded: false, reason: 'cooldown' };
    }

    const hash = hashMessage(content);
    const duplicateCutoff = nowMs - 24 * 60 * 60 * 1000;
    const isDuplicate = state.recentHashes.some(
      (entry) => entry.hash === hash && new Date(entry.createdAt).getTime() >= duplicateCutoff,
    );

    if (isDuplicate) {
      return { awarded: false, reason: 'duplicate' };
    }

    state.dailyAwards += 1;
    state.channelAwards[channelId] = (state.channelAwards[channelId] || 0) + 1;
    state.lastAwardAt = now;
    state.recentHashes = [
      { hash, createdAt: now },
      ...state.recentHashes.filter((entry) => new Date(entry.createdAt).getTime() >= duplicateCutoff),
    ].slice(0, 20);

    awardTrait(store, profile, 'presence', 1, {
      type: 'message',
      summary: 'Meaningful participation',
      source: channelId,
      createdAt: now,
    });
    maybeAwardTrust(store, profile, input.goodStanding !== false, now);
    return {
      awarded: true,
      trait: 'presence',
      points: 1,
      profile: createProfileView(profile, store),
    };
  });
}

async function recordMeaningfulReaction(config, input) {
  const guildId = normalizeSnowflake(input.guildId);
  const recipientId = normalizeSnowflake(input.recipientId);
  const reactorId = normalizeSnowflake(input.reactorId);
  const channelId = normalizeSnowflake(input.channelId);
  const messageId = normalizeSnowflake(input.messageId);

  if (!guildId || !recipientId || !reactorId || !channelId || !messageId || recipientId === reactorId) {
    return { awarded: false, reason: 'invalid' };
  }

  return mutateStore(config, (store) => {
    const settings = store.settings;

    if (!settings.enabled || !settings.reactionGrowthEnabled) {
      return { awarded: false, reason: 'disabled' };
    }
    if (settings.excludedChannelIds.includes(channelId)) {
      return { awarded: false, reason: 'excluded-channel' };
    }
    if (hasExcludedRole(input.recipientRoleIds, settings.excludedRoleIds)) {
      return { awarded: false, reason: 'excluded-role' };
    }

    const now = normalizeDate(input.createdAt) || new Date().toISOString();
    const nowMs = new Date(now).getTime();
    const messageCreatedAt = normalizeDate(input.messageCreatedAt);

    if (!messageCreatedAt || nowMs - new Date(messageCreatedAt).getTime() > 7 * 24 * 60 * 60 * 1000) {
      return { awarded: false, reason: 'message-too-old' };
    }

    const claimKey = `${guildId}:${messageId}:${reactorId}`;

    pruneReactionClaims(store, nowMs);
    if (store.reactionClaims.some((claim) => claim.key === claimKey)) {
      return { awarded: false, reason: 'already-counted' };
    }

    const messageClaims = store.reactionClaims.filter(
      (claim) => claim.guildId === guildId && claim.messageId === messageId,
    );

    if (messageClaims.length >= settings.reactionPerMessageLimit) {
      return { awarded: false, reason: 'message-limit' };
    }

    const profile = ensureProfile(store, {
      guildId,
      userId: recipientId,
      displayName: input.recipientDisplayName,
      username: input.recipientUsername,
      avatarUrl: input.recipientAvatarUrl,
    });
    const day = dayKey(now);

    resetDailyCounter(profile.reactionState, day);
    if (profile.reactionState.dailyAwards >= settings.reactionDailyLimit) {
      return { awarded: false, reason: 'daily-limit' };
    }

    profile.reactionState.dailyAwards += 1;
    store.reactionClaims.unshift({
      key: claimKey,
      guildId,
      messageId,
      reactorId,
      recipientId,
      createdAt: now,
    });
    store.reactionClaims = store.reactionClaims.slice(0, MAX_REACTION_CLAIMS);

    awardTrait(store, profile, 'spark', 1, {
      type: 'reaction',
      summary: 'A unique member engaged with their message',
      source: messageId,
      createdAt: now,
    });
    return {
      awarded: true,
      trait: 'spark',
      points: 1,
      profile: createProfileView(profile, store),
    };
  });
}

async function recordVoiceParticipation(config, input) {
  const guildId = normalizeSnowflake(input.guildId);
  const userId = normalizeSnowflake(input.userId);
  const channelId = normalizeSnowflake(input.channelId);
  const durationMinutes = Math.max(0, Number(input.durationMinutes) || 0);

  if (!guildId || !userId || !channelId) {
    return { awarded: false, reason: 'invalid' };
  }

  return mutateStore(config, (store) => {
    const settings = store.settings;

    if (!settings.enabled || !settings.voiceGrowthEnabled) {
      return { awarded: false, reason: 'disabled' };
    }
    if (settings.excludedChannelIds.includes(channelId)) {
      return { awarded: false, reason: 'excluded-channel' };
    }
    if (hasExcludedRole(input.roleIds, settings.excludedRoleIds)) {
      return { awarded: false, reason: 'excluded-role' };
    }
    if (durationMinutes < settings.voiceMinimumMinutes) {
      return { awarded: false, reason: 'too-short' };
    }

    const now = normalizeDate(input.endedAt) || new Date().toISOString();
    const day = dayKey(now);
    const profile = ensureProfile(store, input);

    resetDailyCounter(profile.voiceState, day);
    if (profile.voiceState.dailyAwards >= settings.voiceDailyLimit) {
      return { awarded: false, reason: 'daily-limit' };
    }

    profile.voiceState.dailyAwards += 1;
    awardTrait(store, profile, 'presence', 2, {
      type: 'voice',
      summary: `${Math.round(durationMinutes)} minutes of shared voice participation`,
      source: channelId,
      createdAt: now,
      silent: true,
    });
    awardTrait(store, profile, 'community', 2, {
      type: 'voice',
      summary: `${Math.round(durationMinutes)} minutes of shared voice participation`,
      source: channelId,
      createdAt: now,
    });
    maybeAwardTrust(store, profile, input.goodStanding !== false, now);
    return {
      awarded: true,
      traits: { presence: 2, community: 2 },
      profile: createProfileView(profile, store),
    };
  });
}

async function giveCommunityKudos(config, input) {
  const guildId = normalizeSnowflake(input.guildId);
  const giverId = normalizeSnowflake(input.giverId);
  const recipientId = normalizeSnowflake(input.recipientId);
  const reason = normalizeText(input.reason, 180);

  if (!guildId || !giverId || !recipientId || giverId === recipientId) {
    throw new Error('Kudos must be given to another community member.');
  }
  if (!reason || reason.length < 8) {
    throw new Error('Tell the community why this person deserves kudos.');
  }

  return mutateStore(config, (store) => {
    const settings = store.settings;

    if (!settings.enabled || !settings.kudosEnabled) {
      throw new Error('Community kudos are currently disabled.');
    }

    const now = normalizeDate(input.createdAt) || new Date().toISOString();
    const nowMs = new Date(now).getTime();
    const day = dayKey(now);
    const giver = ensureProfile(store, {
      guildId,
      userId: giverId,
      displayName: input.giverDisplayName,
      username: input.giverUsername,
      avatarUrl: input.giverAvatarUrl,
    });
    const recipient = ensureProfile(store, {
      guildId,
      userId: recipientId,
      displayName: input.recipientDisplayName,
      username: input.recipientUsername,
      avatarUrl: input.recipientAvatarUrl,
    });

    resetDailyKudosState(giver, day, 'send');
    resetDailyKudosState(recipient, day, 'receive');
    if (giver.kudosState.sentToday >= settings.kudosDailySendLimit) {
      throw new Error(`You can give ${settings.kudosDailySendLimit} kudos per day.`);
    }
    if (recipient.kudosState.receivedToday >= settings.kudosDailyReceiveLimit) {
      throw new Error('That member has reached today’s kudos limit.');
    }

    const cooldownMs = settings.kudosPairCooldownDays * 24 * 60 * 60 * 1000;
    const previous = store.kudos.find(
      (entry) => entry.guildId === guildId
        && entry.giverId === giverId
        && entry.recipientId === recipientId,
    );

    if (previous && nowMs - new Date(previous.createdAt).getTime() < cooldownMs) {
      const availableAt = new Date(new Date(previous.createdAt).getTime() + cooldownMs);

      throw new Error(`You can give this member kudos again ${formatRelativeDate(availableAt)}.`);
    }

    giver.kudosState.sentToday += 1;
    recipient.kudosState.receivedToday += 1;

    const kudos = {
      id: `KUDOS-${crypto.randomUUID()}`,
      guildId,
      giverId,
      giverName: giver.displayName,
      recipientId,
      recipientName: recipient.displayName,
      reason,
      createdAt: now,
    };

    store.kudos.unshift(kudos);
    store.kudos = store.kudos.slice(0, MAX_KUDOS);
    awardTrait(store, recipient, 'support', 5, {
      type: 'kudos',
      summary: reason,
      source: kudos.id,
      actorId: giverId,
      actorName: giver.displayName,
      createdAt: now,
      silent: true,
    });
    awardTrait(store, recipient, 'community', 1, {
      type: 'kudos',
      summary: reason,
      source: kudos.id,
      actorId: giverId,
      actorName: giver.displayName,
      createdAt: now,
    });
    maybeAwardTrust(store, giver, input.giverGoodStanding !== false, now);

    return {
      kudos: clone(kudos),
      giver: createProfileView(giver, store),
      recipient: createProfileView(recipient, store),
    };
  });
}

async function grantCommunityGrowthRecognition(config, input) {
  const trait = normalizeTrait(input.trait);
  const points = clampInteger(input.points, 1, 25, 1);
  const reason = normalizeText(input.reason, 220);
  const badgeId = normalizeManualBadge(input.badgeId);

  if (!trait) {
    throw new Error('Choose a valid growth trait.');
  }
  if (!reason || reason.length < 8) {
    throw new Error('A meaningful recognition reason is required.');
  }

  return mutateStore(config, (store) => {
    const profile = ensureProfile(store, input);
    const now = new Date().toISOString();

    awardTrait(store, profile, trait, points, {
      type: 'staff-recognition',
      summary: reason,
      source: 'dashboard',
      actorId: normalizeSnowflake(input.actor?.id),
      actorName: normalizeText(input.actor?.displayName || input.actor?.username || 'Staff', 100),
      createdAt: now,
    });

    if (badgeId && !profile.badges.some((badge) => badge.id === badgeId)) {
      profile.badges.push({
        id: badgeId,
        earnedAt: now,
        source: 'staff-recognition',
        reason,
      });
    }

    profile.updatedAt = now;
    return createProfileView(profile, store);
  });
}

async function startCommunityGrowthSeason(config, input) {
  const name = normalizeText(input.name, 60);
  const startsAt = normalizeDate(input.startsAt) || new Date().toISOString();
  const requestedEndsAt = normalizeDate(input.endsAt);
  const settings = await getCommunityGrowthSettings(config);
  const endsAt = requestedEndsAt || new Date(
    new Date(startsAt).getTime() + settings.seasonLengthDays * 24 * 60 * 60 * 1000,
  ).toISOString();

  if (!name || name.length < 3) {
    throw new Error('Season name must contain at least three characters.');
  }
  if (new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
    throw new Error('Season end must be after its start.');
  }

  return mutateStore(config, (store) => {
    const previous = clone(store.season);
    const archive = summarizeSeason(store, previous);

    store.seasonHistory.unshift(archive);
    store.seasonHistory = store.seasonHistory.slice(0, 12);
    store.season = {
      id: `SEASON-${crypto.randomUUID()}`,
      name,
      startsAt,
      endsAt,
      createdBy: normalizeActor(input.actor),
    };

    for (const profile of Object.values(store.profiles)) {
      profile.seasonId = store.season.id;
      profile.seasonTraits = emptyTraits();
      profile.updatedAt = new Date().toISOString();
    }

    appendGlobalActivity(store, {
      guildId: normalizeSnowflake(input.guildId || config.guildId),
      userId: normalizeSnowflake(input.actor?.id),
      displayName: normalizeText(input.actor?.displayName || input.actor?.username || 'Staff', 100),
      type: 'season',
      trait: null,
      points: 0,
      summary: `${name} began.`,
      source: store.season.id,
    });
    return {
      season: clone(store.season),
      previous: archive,
    };
  });
}

async function getCommunityGrowthSettings(config) {
  const store = await loadCommunityGrowthStore(config);

  return clone(store.settings);
}

function createCommunityProfileEmbedData(profile) {
  const scores = TRAITS.map((trait) => ({
    id: trait,
    name: TRAIT_DETAILS[trait].name,
    lifetime: profile.traits[trait],
    season: profile.seasonTraits[trait],
  }));

  return {
    title: `${profile.displayName} · ${profile.title}`,
    description: profile.bio || `${profile.stage.name} in ${profile.season.name}`,
    color: profile.accentColor,
    scores,
    badges: profile.badges,
    total: profile.total,
    seasonTotal: profile.seasonTotal,
    stage: profile.stage,
    season: profile.season,
    kudosReceived: profile.kudosReceived,
  };
}

function getCommunityGrowthStorageInfo(config) {
  if (config.dashboard?.communityGrowthPath) {
    return {
      filePath: path.resolve(config.dashboard.communityGrowthPath),
      persistent: true,
      source: 'COMMUNITY_GROWTH_PATH',
    };
  }
  if (config.dashboard?.railwayVolumeMountPath) {
    return {
      filePath: path.join(config.dashboard.railwayVolumeMountPath, 'community-growth.json'),
      persistent: true,
      source: 'RAILWAY_VOLUME_MOUNT_PATH',
    };
  }
  if (config.dashboard?.savedMessagesPath) {
    return {
      filePath: path.join(path.dirname(config.dashboard.savedMessagesPath), 'community-growth.json'),
      persistent: true,
      source: 'DASHBOARD_SAVED_MESSAGES_PATH directory',
    };
  }

  return {
    filePath: defaultCommunityGrowthPath,
    persistent: false,
    source: 'app filesystem',
  };
}

async function mutateStore(config, mutator) {
  const operation = mutationQueue.then(async () => {
    const filePath = getCommunityGrowthStorageInfo(config).filePath;
    const store = await readStore(filePath);
    const result = await mutator(store);

    await writeStore(filePath, store);
    return clone(result);
  });

  mutationQueue = operation.catch(() => null);
  return operation;
}

async function readStore(filePath) {
  let parsed;

  try {
    parsed = JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return createEmptyStore();
    }
    throw error;
  }

  return normalizeStore(parsed);
}

async function writeStore(filePath, store) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;

  await fs.writeFile(temporaryPath, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
  await fs.rename(temporaryPath, filePath);
}

function normalizeStore(input) {
  const source = input && typeof input === 'object' ? input : {};
  const season = normalizeSeason(source.season);
  const profiles = {};

  for (const candidate of Object.values(source.profiles || {})) {
    const profile = normalizeProfile(candidate, season);

    if (profile) {
      profiles[profileKey(profile.guildId, profile.userId)] = profile;
    }
  }

  return {
    version: 1,
    settings: normalizeSettings(source.settings),
    season,
    seasonHistory: Array.isArray(source.seasonHistory)
      ? source.seasonHistory.filter((entry) => entry && typeof entry === 'object').slice(0, 12)
      : [],
    profiles,
    kudos: Array.isArray(source.kudos)
      ? source.kudos.map(normalizeKudos).filter(Boolean).slice(0, MAX_KUDOS)
      : [],
    reactionClaims: Array.isArray(source.reactionClaims)
      ? source.reactionClaims.map(normalizeReactionClaim).filter(Boolean).slice(0, MAX_REACTION_CLAIMS)
      : [],
    activity: Array.isArray(source.activity)
      ? source.activity.map(normalizeActivity).filter(Boolean).slice(0, MAX_GLOBAL_ACTIVITY)
      : [],
  };
}

function createEmptyStore() {
  return normalizeStore({});
}

function normalizeSettings(input) {
  const source = input && typeof input === 'object' ? input : {};

  return {
    enabled: normalizeBoolean(source.enabled, DEFAULT_SETTINGS.enabled),
    messageGrowthEnabled: normalizeBoolean(source.messageGrowthEnabled, DEFAULT_SETTINGS.messageGrowthEnabled),
    reactionGrowthEnabled: normalizeBoolean(source.reactionGrowthEnabled, DEFAULT_SETTINGS.reactionGrowthEnabled),
    voiceGrowthEnabled: normalizeBoolean(source.voiceGrowthEnabled, DEFAULT_SETTINGS.voiceGrowthEnabled),
    kudosEnabled: normalizeBoolean(source.kudosEnabled, DEFAULT_SETTINGS.kudosEnabled),
    publicLeaderboards: normalizeBoolean(source.publicLeaderboards, DEFAULT_SETTINGS.publicLeaderboards),
    minimumMessageLength: clampInteger(source.minimumMessageLength, 12, 200, DEFAULT_SETTINGS.minimumMessageLength),
    minimumUniqueWords: clampInteger(source.minimumUniqueWords, 2, 12, DEFAULT_SETTINGS.minimumUniqueWords),
    messageCooldownSeconds: clampInteger(source.messageCooldownSeconds, 30, 3600, DEFAULT_SETTINGS.messageCooldownSeconds),
    messageDailyLimit: clampInteger(source.messageDailyLimit, 1, 50, DEFAULT_SETTINGS.messageDailyLimit),
    messageChannelDailyLimit: clampInteger(
      source.messageChannelDailyLimit,
      1,
      25,
      DEFAULT_SETTINGS.messageChannelDailyLimit,
    ),
    reactionDailyLimit: clampInteger(source.reactionDailyLimit, 1, 50, DEFAULT_SETTINGS.reactionDailyLimit),
    reactionPerMessageLimit: clampInteger(
      source.reactionPerMessageLimit,
      1,
      20,
      DEFAULT_SETTINGS.reactionPerMessageLimit,
    ),
    voiceMinimumMinutes: clampInteger(source.voiceMinimumMinutes, 5, 120, DEFAULT_SETTINGS.voiceMinimumMinutes),
    voiceDailyLimit: clampInteger(source.voiceDailyLimit, 1, 12, DEFAULT_SETTINGS.voiceDailyLimit),
    kudosPairCooldownDays: clampInteger(
      source.kudosPairCooldownDays,
      1,
      30,
      DEFAULT_SETTINGS.kudosPairCooldownDays,
    ),
    kudosDailySendLimit: clampInteger(
      source.kudosDailySendLimit,
      1,
      20,
      DEFAULT_SETTINGS.kudosDailySendLimit,
    ),
    kudosDailyReceiveLimit: clampInteger(
      source.kudosDailyReceiveLimit,
      1,
      30,
      DEFAULT_SETTINGS.kudosDailyReceiveLimit,
    ),
    seasonLengthDays: clampInteger(source.seasonLengthDays, 14, 365, DEFAULT_SETTINGS.seasonLengthDays),
    excludedChannelIds: normalizeSnowflakeList(source.excludedChannelIds),
    excludedRoleIds: normalizeSnowflakeList(source.excludedRoleIds),
  };
}

function normalizeSeason(input) {
  const startsAt = normalizeDate(input?.startsAt) || new Date().toISOString();
  const endsAt = normalizeDate(input?.endsAt)
    || new Date(new Date(startsAt).getTime() + DEFAULT_SETTINGS.seasonLengthDays * 24 * 60 * 60 * 1000).toISOString();

  return {
    id: normalizeText(input?.id, 100) || `SEASON-${crypto.randomUUID()}`,
    name: normalizeText(input?.name, 60) || 'Founding Season',
    startsAt,
    endsAt,
    createdBy: normalizeActor(input?.createdBy),
  };
}

function ensureProfile(store, input) {
  const guildId = normalizeSnowflake(input.guildId);
  const userId = normalizeSnowflake(input.userId);

  if (!guildId || !userId) {
    throw new Error('A valid guild and member are required.');
  }

  const key = profileKey(guildId, userId);
  const existing = store.profiles[key] || createProfile(input, store.season);

  existing.displayName = normalizeText(input.displayName || existing.displayName || 'Community member', 100);
  existing.username = normalizeText(input.username || existing.username || 'unknown', 100);
  existing.avatarUrl = normalizeUrl(input.avatarUrl) || existing.avatarUrl;
  syncProfileSeason(existing, store.season);
  existing.updatedAt = new Date().toISOString();
  store.profiles[key] = existing;
  return existing;
}

function createProfile(input, season) {
  const now = new Date().toISOString();

  return {
    guildId: normalizeSnowflake(input.guildId),
    userId: normalizeSnowflake(input.userId),
    displayName: normalizeText(input.displayName || 'Community member', 100),
    username: normalizeText(input.username || 'unknown', 100),
    avatarUrl: normalizeUrl(input.avatarUrl),
    bio: '',
    accentColor: '#8FA1BE',
    visible: true,
    traits: emptyTraits(),
    seasonTraits: emptyTraits(),
    seasonId: season.id,
    badges: [],
    activeDays: [],
    lastTrustAwardDate: null,
    messageState: {
      dailyKey: null,
      dailyAwards: 0,
      channelAwards: {},
      lastAwardAt: null,
      recentHashes: [],
    },
    reactionState: { dailyKey: null, dailyAwards: 0 },
    voiceState: { dailyKey: null, dailyAwards: 0 },
    kudosState: {
      sendDailyKey: null,
      sentToday: 0,
      receiveDailyKey: null,
      receivedToday: 0,
    },
    activity: [],
    createdAt: now,
    updatedAt: now,
  };
}

function normalizeProfile(input, season) {
  const guildId = normalizeSnowflake(input?.guildId);
  const userId = normalizeSnowflake(input?.userId);

  if (!guildId || !userId) {
    return null;
  }

  const profile = createProfile({
    guildId,
    userId,
    displayName: input.displayName,
    username: input.username,
    avatarUrl: input.avatarUrl,
  }, season);

  profile.bio = normalizeText(input.bio, 160);
  profile.accentColor = normalizeColor(input.accentColor);
  profile.visible = input.visible !== false;
  profile.traits = normalizeTraits(input.traits);
  profile.seasonTraits = normalizeTraits(input.seasonTraits);
  profile.seasonId = normalizeText(input.seasonId, 100) || season.id;
  profile.badges = normalizeBadges(input.badges);
  profile.activeDays = Array.isArray(input.activeDays)
    ? [...new Set(input.activeDays.map((value) => String(value)).filter((value) => /^\d{4}-\d{2}-\d{2}$/.test(value)))]
      .slice(-120)
    : [];
  profile.lastTrustAwardDate = /^\d{4}-\d{2}-\d{2}$/.test(input.lastTrustAwardDate)
    ? input.lastTrustAwardDate
    : null;
  profile.messageState = normalizeMessageState(input.messageState);
  profile.reactionState = normalizeDailyState(input.reactionState);
  profile.voiceState = normalizeDailyState(input.voiceState);
  profile.kudosState = normalizeKudosState(input.kudosState);
  profile.activity = Array.isArray(input.activity)
    ? input.activity.map(normalizeActivity).filter(Boolean).slice(0, MAX_PROFILE_ACTIVITY)
    : [];
  profile.createdAt = normalizeDate(input.createdAt) || profile.createdAt;
  profile.updatedAt = normalizeDate(input.updatedAt) || profile.updatedAt;
  syncProfileSeason(profile, season);
  ensureAutomaticBadges(profile);
  return profile;
}

function createProfileView(profile, store) {
  const traits = normalizeTraits(profile.traits);
  const seasonTraits = normalizeTraits(profile.seasonTraits);
  const total = traitTotal(traits);
  const seasonTotal = traitTotal(seasonTraits);
  const stage = getStage(total);
  const nextStage = STAGES.find((item) => item.minimum > total) || null;
  const dominantTrait = getDominantTrait(traits);
  const kudos = store.kudos.filter(
    (entry) => entry.guildId === profile.guildId && entry.recipientId === profile.userId,
  );

  return {
    guildId: profile.guildId,
    userId: profile.userId,
    displayName: profile.displayName,
    username: profile.username,
    avatarUrl: profile.avatarUrl,
    bio: profile.bio,
    accentColor: profile.accentColor,
    visible: profile.visible,
    traits,
    seasonTraits,
    total,
    seasonTotal,
    dominantTrait,
    title: getProfileTitle(traits, total),
    stage: {
      ...stage,
      next: nextStage ? { id: nextStage.id, name: nextStage.name, minimum: nextStage.minimum } : null,
      progress: nextStage
        ? Math.round(((total - stage.minimum) / (nextStage.minimum - stage.minimum)) * 100)
        : 100,
    },
    season: clone(store.season),
    badges: profile.badges
      .map((badge) => ({
        ...clone(BADGE_DEFINITIONS[badge.id] || {
          name: badge.id,
          description: badge.reason || 'Community recognition',
          icon: 'award',
          automatic: false,
        }),
        ...clone(badge),
      }))
      .sort((left, right) => new Date(right.earnedAt) - new Date(left.earnedAt)),
    kudosReceived: kudos.length,
    recentKudos: kudos.slice(0, 10).map(clone),
    activity: profile.activity.slice(0, 25).map(clone),
    activeDays: profile.activeDays.length,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

function awardTrait(store, profile, trait, points, context) {
  if (!TRAITS.includes(trait) || !Number.isFinite(points) || points <= 0) {
    return;
  }

  syncProfileSeason(profile, store.season);
  profile.traits[trait] += points;
  profile.seasonTraits[trait] += points;
  profile.updatedAt = context.createdAt || new Date().toISOString();

  const activity = normalizeActivity({
    id: `GROWTH-${crypto.randomUUID()}`,
    guildId: profile.guildId,
    userId: profile.userId,
    displayName: profile.displayName,
    type: context.type,
    trait,
    points,
    summary: context.summary,
    source: context.source,
    actorId: context.actorId,
    actorName: context.actorName,
    createdAt: context.createdAt,
  });

  if (activity && !context.silent) {
    profile.activity.unshift(activity);
    profile.activity = profile.activity.slice(0, MAX_PROFILE_ACTIVITY);
    store.activity.unshift(activity);
    store.activity = store.activity.slice(0, MAX_GLOBAL_ACTIVITY);
  }

  ensureAutomaticBadges(profile);
}

function maybeAwardTrust(store, profile, goodStanding, timestamp) {
  if (!goodStanding) {
    return;
  }

  const day = dayKey(timestamp);

  if (profile.lastTrustAwardDate === day) {
    return;
  }

  profile.lastTrustAwardDate = day;
  profile.activeDays = [...new Set([...profile.activeDays, day])].slice(-120);
  awardTrait(store, profile, 'trust', 1, {
    type: 'good-standing',
    summary: 'A positive active day',
    source: day,
    createdAt: timestamp,
  });
}

function ensureAutomaticBadges(profile) {
  const total = traitTotal(profile.traits);
  const requirements = {
    first_steps: total >= 10,
    regular: profile.traits.presence >= 50,
    conversation_starter: profile.traits.spark >= 25,
    helping_hand: profile.traits.support >= 25,
    community_builder: profile.traits.community >= 40,
    trusted_bean: profile.traits.trust >= 30,
    well_rounded: TRAITS.every((trait) => profile.traits[trait] >= 10),
  };

  for (const [badgeId, earned] of Object.entries(requirements)) {
    if (earned && !profile.badges.some((badge) => badge.id === badgeId)) {
      profile.badges.push({
        id: badgeId,
        earnedAt: new Date().toISOString(),
        source: 'automatic',
        reason: BADGE_DEFINITIONS[badgeId].description,
      });
    }
  }
}

function appendGlobalActivity(store, input) {
  const activity = normalizeActivity({
    id: `GROWTH-${crypto.randomUUID()}`,
    createdAt: new Date().toISOString(),
    ...input,
  });

  if (activity) {
    store.activity.unshift(activity);
    store.activity = store.activity.slice(0, MAX_GLOBAL_ACTIVITY);
  }
}

function rankProfiles(profiles, trait, period, limit, publicLeaderboards) {
  if (!publicLeaderboards) {
    return [];
  }

  const getScore = (profile) => {
    if (trait === 'total') {
      return period === 'lifetime' ? profile.total : profile.seasonTotal;
    }
    return period === 'lifetime' ? profile.traits[trait] : profile.seasonTraits[trait];
  };

  return profiles
    .filter((profile) => profile.visible && getScore(profile) > 0)
    .sort((left, right) => getScore(right) - getScore(left) || right.seasonTotal - left.seasonTotal)
    .slice(0, limit)
    .map((profile, index) => ({
      rank: index + 1,
      score: getScore(profile),
      userId: profile.userId,
      displayName: profile.displayName,
      username: profile.username,
      avatarUrl: profile.avatarUrl,
      title: profile.title,
      stage: profile.stage,
      seasonTotal: profile.seasonTotal,
      total: profile.total,
      traits: profile.traits,
      seasonTraits: profile.seasonTraits,
    }));
}

function getProfileTitle(traits, total) {
  if (TRAITS.every((trait) => traits[trait] >= 10)) {
    return 'Well-Rounded Bean';
  }
  if (total < 10) {
    return 'New Seed';
  }

  const dominant = getDominantTrait(traits);
  const titles = {
    presence: 'Community Regular',
    spark: 'Conversation Starter',
    support: 'Helping Hand',
    community: 'Community Builder',
    trust: 'Trusted Bean',
  };

  return titles[dominant] || 'Growing Bean';
}

function getDominantTrait(traits) {
  return TRAITS.reduce(
    (highest, trait) => traits[trait] > traits[highest] ? trait : highest,
    TRAITS[0],
  );
}

function getStage(total) {
  return [...STAGES].reverse().find((stage) => total >= stage.minimum) || STAGES[0];
}

function summarizeSeason(store, season) {
  const profiles = Object.values(store.profiles)
    .map((profile) => ({
      userId: profile.userId,
      displayName: profile.displayName,
      total: traitTotal(profile.seasonTraits),
      traits: clone(profile.seasonTraits),
    }))
    .sort((left, right) => right.total - left.total);

  return {
    ...season,
    archivedAt: new Date().toISOString(),
    profileCount: profiles.filter((profile) => profile.total > 0).length,
    totalGrowth: profiles.reduce((total, profile) => total + profile.total, 0),
    leaders: profiles.slice(0, 10),
  };
}

function syncProfileSeason(profile, season) {
  if (profile.seasonId !== season.id) {
    profile.seasonId = season.id;
    profile.seasonTraits = emptyTraits();
  }
}

function resetDailyMessageState(state, day) {
  if (state.dailyKey !== day) {
    state.dailyKey = day;
    state.dailyAwards = 0;
    state.channelAwards = {};
  }
}

function resetDailyCounter(state, day) {
  if (state.dailyKey !== day) {
    state.dailyKey = day;
    state.dailyAwards = 0;
  }
}

function resetDailyKudosState(profile, day, direction) {
  if (direction === 'send' && profile.kudosState.sendDailyKey !== day) {
    profile.kudosState.sendDailyKey = day;
    profile.kudosState.sentToday = 0;
  }
  if (direction === 'receive' && profile.kudosState.receiveDailyKey !== day) {
    profile.kudosState.receiveDailyKey = day;
    profile.kudosState.receivedToday = 0;
  }
}

function pruneReactionClaims(store, nowMs) {
  const cutoff = nowMs - 30 * 24 * 60 * 60 * 1000;

  store.reactionClaims = store.reactionClaims.filter(
    (claim) => new Date(claim.createdAt).getTime() >= cutoff,
  );
}

function normalizeMessageContent(value) {
  return String(value || '')
    .replace(/https?:\/\/\S+/gi, ' ')
    .replace(/<a?:\w+:\d+>/g, ' ')
    .replace(/<[@#&!]\d+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isMeaningfulContent(content, settings) {
  if (content.length < settings.minimumMessageLength) {
    return false;
  }

  const words = content.toLocaleLowerCase().match(/[\p{L}\p{N}']+/gu) || [];
  const uniqueWords = new Set(words.filter((word) => word.length > 1));
  const uniqueCharacters = new Set(content.toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu, ''));

  return uniqueWords.size >= settings.minimumUniqueWords && uniqueCharacters.size >= 6;
}

function hashMessage(content) {
  return crypto.createHash('sha256').update(content.toLocaleLowerCase()).digest('hex').slice(0, 24);
}

function hasExcludedRole(roleIds, excludedRoleIds) {
  const roles = Array.isArray(roleIds) ? roleIds.map(String) : [];

  return excludedRoleIds.some((roleId) => roles.includes(roleId));
}

function normalizeTraits(input) {
  return Object.fromEntries(
    TRAITS.map((trait) => [trait, clampInteger(input?.[trait], 0, 1000000, 0)]),
  );
}

function emptyTraits() {
  return Object.fromEntries(TRAITS.map((trait) => [trait, 0]));
}

function traitTotal(traits) {
  return TRAITS.reduce((total, trait) => total + Number(traits[trait] || 0), 0);
}

function normalizeMessageState(input) {
  return {
    dailyKey: /^\d{4}-\d{2}-\d{2}$/.test(input?.dailyKey) ? input.dailyKey : null,
    dailyAwards: clampInteger(input?.dailyAwards, 0, 1000, 0),
    channelAwards: normalizeCounterMap(input?.channelAwards),
    lastAwardAt: normalizeDate(input?.lastAwardAt),
    recentHashes: Array.isArray(input?.recentHashes)
      ? input.recentHashes
        .map((entry) => ({
          hash: normalizeText(entry?.hash, 64),
          createdAt: normalizeDate(entry?.createdAt),
        }))
        .filter((entry) => entry.hash && entry.createdAt)
        .slice(0, 20)
      : [],
  };
}

function normalizeDailyState(input) {
  return {
    dailyKey: /^\d{4}-\d{2}-\d{2}$/.test(input?.dailyKey) ? input.dailyKey : null,
    dailyAwards: clampInteger(input?.dailyAwards, 0, 1000, 0),
  };
}

function normalizeKudosState(input) {
  return {
    sendDailyKey: /^\d{4}-\d{2}-\d{2}$/.test(input?.sendDailyKey) ? input.sendDailyKey : null,
    sentToday: clampInteger(input?.sentToday, 0, 1000, 0),
    receiveDailyKey: /^\d{4}-\d{2}-\d{2}$/.test(input?.receiveDailyKey) ? input.receiveDailyKey : null,
    receivedToday: clampInteger(input?.receivedToday, 0, 1000, 0),
  };
}

function normalizeCounterMap(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(input)
      .filter(([key]) => normalizeSnowflake(key))
      .slice(0, 100)
      .map(([key, value]) => [key, clampInteger(value, 0, 1000, 0)]),
  );
}

function normalizeBadges(input) {
  if (!Array.isArray(input)) {
    return [];
  }

  const badges = [];

  for (const item of input) {
    const id = normalizeText(item?.id, 80).toLowerCase();

    if (!id || badges.some((badge) => badge.id === id)) continue;
    badges.push({
      id,
      earnedAt: normalizeDate(item?.earnedAt) || new Date().toISOString(),
      source: normalizeText(item?.source, 80) || 'imported',
      reason: normalizeText(item?.reason, 220),
    });
  }

  return badges.slice(0, 50);
}

function normalizeKudos(input) {
  const guildId = normalizeSnowflake(input?.guildId);
  const giverId = normalizeSnowflake(input?.giverId);
  const recipientId = normalizeSnowflake(input?.recipientId);
  const reason = normalizeText(input?.reason, 180);
  const createdAt = normalizeDate(input?.createdAt);

  if (!guildId || !giverId || !recipientId || !reason || !createdAt) {
    return null;
  }

  return {
    id: normalizeText(input.id, 100) || `KUDOS-${crypto.randomUUID()}`,
    guildId,
    giverId,
    giverName: normalizeText(input.giverName || 'Community member', 100),
    recipientId,
    recipientName: normalizeText(input.recipientName || 'Community member', 100),
    reason,
    createdAt,
  };
}

function normalizeReactionClaim(input) {
  const guildId = normalizeSnowflake(input?.guildId);
  const messageId = normalizeSnowflake(input?.messageId);
  const reactorId = normalizeSnowflake(input?.reactorId);
  const recipientId = normalizeSnowflake(input?.recipientId);
  const createdAt = normalizeDate(input?.createdAt);

  if (!guildId || !messageId || !reactorId || !recipientId || !createdAt) {
    return null;
  }

  return {
    key: `${guildId}:${messageId}:${reactorId}`,
    guildId,
    messageId,
    reactorId,
    recipientId,
    createdAt,
  };
}

function normalizeActivity(input) {
  const guildId = normalizeSnowflake(input?.guildId);
  const type = normalizeText(input?.type, 60);
  const summary = normalizeText(input?.summary, 240);
  const createdAt = normalizeDate(input?.createdAt) || new Date().toISOString();

  if (!guildId || !type || !summary) {
    return null;
  }

  return {
    id: normalizeText(input?.id, 100) || `GROWTH-${crypto.randomUUID()}`,
    guildId,
    userId: normalizeSnowflake(input?.userId),
    displayName: normalizeText(input?.displayName || 'Community', 100),
    type,
    trait: TRAITS.includes(input?.trait) ? input.trait : null,
    points: clampInteger(input?.points, 0, 1000, 0),
    summary,
    source: normalizeText(input?.source, 100),
    actorId: normalizeSnowflake(input?.actorId),
    actorName: normalizeText(input?.actorName, 100),
    createdAt,
  };
}

function normalizeActor(actor) {
  if (!actor || typeof actor !== 'object') {
    return null;
  }

  return {
    id: normalizeSnowflake(actor.id),
    displayName: normalizeText(actor.displayName || actor.username || 'Staff', 100),
  };
}

function normalizeManualBadge(value) {
  const badgeId = normalizeText(value, 80).toLowerCase();

  return BADGE_DEFINITIONS[badgeId]?.automatic === false ? badgeId : null;
}

function normalizeTrait(value) {
  const trait = String(value || '').trim().toLowerCase();

  return TRAITS.includes(trait) ? trait : null;
}

function normalizeSnowflake(value) {
  const candidate = String(value || '').trim();

  return /^\d{17,20}$/.test(candidate) ? candidate : null;
}

function normalizeSnowflakeList(input) {
  if (!Array.isArray(input)) {
    return [];
  }

  return [...new Set(input.map(normalizeSnowflake).filter(Boolean))].slice(0, 100);
}

function normalizeUrl(value) {
  try {
    const url = new URL(String(value || ''));

    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

function normalizeColor(value) {
  const color = String(value || '').trim().toUpperCase();

  return /^#[0-9A-F]{6}$/.test(color) ? color : '#8FA1BE';
}

function normalizeBoolean(value, fallback) {
  return typeof value === 'boolean' ? value : fallback;
}

function normalizeText(value, maximumLength) {
  return String(value || '').trim().slice(0, maximumLength);
}

function normalizeDate(value) {
  const date = new Date(value || '');

  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

function dayKey(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function clampInteger(value, minimum, maximum, fallback) {
  const number = Number.parseInt(value, 10);

  return Number.isFinite(number) ? Math.min(maximum, Math.max(minimum, number)) : fallback;
}

function profileKey(guildId, userId) {
  return `${guildId}:${userId}`;
}

function formatRelativeDate(date) {
  return `<t:${Math.floor(date.getTime() / 1000)}:R>`;
}

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

module.exports = {
  BADGE_DEFINITIONS,
  DEFAULT_SETTINGS,
  STAGES,
  TRAITS,
  TRAIT_DETAILS,
  createCommunityProfileEmbedData,
  ensureCommunityGrowthProfile,
  getCommunityGrowthOverview,
  getCommunityGrowthProfile,
  getCommunityGrowthSettings,
  getCommunityGrowthStorageInfo,
  giveCommunityKudos,
  grantCommunityGrowthRecognition,
  listCommunityGrowthLeaderboard,
  loadCommunityGrowthStore,
  recordMeaningfulMessage,
  recordMeaningfulReaction,
  recordVoiceParticipation,
  saveCommunityGrowthSettings,
  searchCommunityGrowthProfiles,
  setCommunityGrowthPrivacy,
  startCommunityGrowthSeason,
  updateCommunityGrowthProfile,
};
