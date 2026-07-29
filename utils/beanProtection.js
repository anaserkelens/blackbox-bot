const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');

const {
  AutoModerationActionType,
  AutoModerationRuleEventType,
  AutoModerationRuleTriggerType,
  ChannelType,
  GuildVerificationLevel,
  PermissionFlagsBits,
} = require('discord.js');

const {
  formatCaseReference,
  recordModerationCase,
  reserveModerationCaseNumber,
} = require('./moderationCases');
const {
  clearBotModerationAction,
  createAuditReason,
  prepareDirectMessage,
  registerBotModerationAction,
  sendModerationDirectMessage,
} = require('./moderationActions');
const {
  colors,
  formatDuration,
  formatUser,
  sendStructuredLog,
  truncate,
} = require('./structuredLog');

const protectionFileName = 'bean-protection.json';
const maximumIncidents = 250;
const maximumQuarantineReviews = 500;
const maximumEmergencyHistory = 50;
const emergencyPermissionFields = [
  ['sendMessages', PermissionFlagsBits.SendMessages, 'SendMessages'],
  ['addReactions', PermissionFlagsBits.AddReactions, 'AddReactions'],
  ['createPublicThreads', PermissionFlagsBits.CreatePublicThreads, 'CreatePublicThreads'],
  ['createPrivateThreads', PermissionFlagsBits.CreatePrivateThreads, 'CreatePrivateThreads'],
  ['sendMessagesInThreads', PermissionFlagsBits.SendMessagesInThreads, 'SendMessagesInThreads'],
];
const emergencyProfiles = Object.freeze({
  watch: Object.freeze({
    id: 'watch',
    name: 'Watch',
    description: 'Tighten behavioral thresholds and raise verification without quarantining or locking channels.',
    verificationLevel: GuildVerificationLevel.Medium,
    raidMode: false,
    lockdown: false,
    overrides: Object.freeze({
      floodMessageLimit: 5,
      floodWindowSeconds: 8,
      duplicateMessageLimit: 3,
      duplicateWindowSeconds: 15,
      joinLimit: 5,
      joinWindowSeconds: 180,
      nativeMentionLimit: 5,
    }),
  }),
  raid: Object.freeze({
    id: 'raid',
    name: 'Raid',
    description: 'Enable quarantine, raise verification, and use strict behavioral thresholds.',
    verificationLevel: GuildVerificationLevel.High,
    raidMode: true,
    lockdown: false,
    overrides: Object.freeze({
      floodMessageLimit: 4,
      floodWindowSeconds: 6,
      duplicateMessageLimit: 2,
      duplicateWindowSeconds: 12,
      joinLimit: 4,
      joinWindowSeconds: 120,
      nativeMentionLimit: 4,
    }),
  }),
  lockdown: Object.freeze({
    id: 'lockdown',
    name: 'Lockdown',
    description: 'Enable quarantine, require the highest verification, and pause public conversation.',
    verificationLevel: GuildVerificationLevel.VeryHigh,
    raidMode: true,
    lockdown: true,
    overrides: Object.freeze({
      floodMessageLimit: 3,
      floodWindowSeconds: 5,
      duplicateMessageLimit: 2,
      duplicateWindowSeconds: 10,
      joinLimit: 3,
      joinWindowSeconds: 60,
      nativeMentionLimit: 3,
    }),
  }),
});
const messageWindows = new Map();
const joinWindows = new Map();
const enforcementCooldowns = new Map();
const raidAlertCooldowns = new Map();
const pendingNativeExecutions = new Map();
const processedNativeExecutions = new Map();
const storeCache = new Map();
let mutationQueue = Promise.resolve();
let lastTrackerPruneAt = 0;
let emergencySweepRunning = false;

function getProtectionStorageInfo(config) {
  if (config.dashboard?.protectionPath) {
    return {
      filePath: path.resolve(config.dashboard.protectionPath),
      persistent: true,
      source: 'BEAN_PROTECTION_PATH',
    };
  }

  if (config.dashboard?.railwayVolumeMountPath) {
    return {
      filePath: path.join(config.dashboard.railwayVolumeMountPath, protectionFileName),
      persistent: true,
      source: 'RAILWAY_VOLUME_MOUNT_PATH',
    };
  }

  if (config.dashboard?.savedMessagesPath) {
    return {
      filePath: path.join(path.dirname(config.dashboard.savedMessagesPath), protectionFileName),
      persistent: true,
      source: 'DASHBOARD_SAVED_MESSAGES_PATH directory',
    };
  }

  return {
    filePath: path.join(__dirname, '..', 'data', protectionFileName),
    persistent: false,
    source: 'local data directory',
  };
}

async function loadProtectionStore(config) {
  await mutationQueue.catch(() => null);
  return readStore(config);
}

async function saveProtectionSettings(config, input, actor = null) {
  return mutateStore(config, (store) => {
    store.settings = normalizeSettings(input, config);
    store.settings.updatedAt = new Date().toISOString();
    store.settings.updatedBy = normalizeActor(actor);
    return store.settings;
  });
}

function getEmergencyProfiles() {
  return Object.values(emergencyProfiles).map((profile) => clone(profile));
}

function getEffectiveProtectionSettings(store) {
  const settings = store?.settings || {};
  const profile = store?.emergency?.active
    ? emergencyProfiles[store.emergency.profile]
    : null;

  if (!profile) {
    return settings;
  }

  const effective = { ...settings };
  const lowerIsStricter = [
    'floodMessageLimit',
    'duplicateMessageLimit',
    'joinLimit',
    'nativeMentionLimit',
  ];
  const higherIsStricter = [
    'floodWindowSeconds',
    'duplicateWindowSeconds',
    'joinWindowSeconds',
  ];

  for (const key of lowerIsStricter) {
    effective[key] = Math.min(settings[key], profile.overrides[key]);
  }

  for (const key of higherIsStricter) {
    effective[key] = Math.max(settings[key], profile.overrides[key]);
  }

  return effective;
}

async function activateEmergencySafetyProfile(client, config, options = {}) {
  const profile = emergencyProfiles[String(options.profile || '').trim().toLowerCase()];
  const actor = normalizeActor(options.actor);
  const reason = normalizeText(options.reason, 1000);
  const durationMinutes = clampInteger(options.durationMinutes, 5, 1440, 60);
  const guild = getConfiguredGuild(client, config);

  if (!profile) {
    throw new Error('Choose the Watch, Raid, or Lockdown emergency profile.');
  }

  if (!actor?.id) {
    throw new Error('A valid staff member is required.');
  }

  if (!reason) {
    throw new Error('An emergency activation reason is required.');
  }

  if (profile.lockdown && options.confirmed !== true) {
    throw new Error('Lockdown requires explicit staff confirmation.');
  }

  if (!guild) {
    throw new Error('The configured Discord server is unavailable.');
  }

  const currentStore = await loadProtectionStore(config);

  if (currentStore.emergency.active) {
    throw new Error(`${currentStore.emergency.profileName || 'An emergency profile'} is already active.`);
  }

  if (profile.raidMode) {
    const roleId = currentStore.settings.quarantineRoleId;
    const role = roleId ? guild.roles?.cache?.get?.(roleId) : null;

    if (!roleId) {
      throw new Error('Configure a quarantine role before activating this profile.');
    }

    if (!role || !role.editable) {
      throw new Error('Bean cannot manage the configured quarantine role.');
    }
  }

  const startedAt = new Date().toISOString();
  const emergencyId = `EMERGENCY-${crypto.randomUUID()}`;
  const targetVerificationLevel = Math.max(
    Number(guild.verificationLevel) || GuildVerificationLevel.None,
    profile.verificationLevel,
  );
  const channelSnapshots = profile.lockdown
    ? collectLockdownChannelSnapshots(guild, config, currentStore.settings)
    : [];
  const snapshot = {
    verificationLevel: Number(guild.verificationLevel) || GuildVerificationLevel.None,
    raid: currentStore.raid,
    channels: channelSnapshots,
  };
  const applied = {
    verificationLevel: targetVerificationLevel,
    raidActive: profile.raidMode ? true : currentStore.raid.active,
    lockedChannelIds: channelSnapshots.map((channel) => channel.channelId),
  };

  await mutateStore(config, (store) => {
    store.emergency = {
      ...store.emergency,
      id: emergencyId,
      active: true,
      status: 'applying',
      profile: profile.id,
      profileName: profile.name,
      reason,
      actor,
      startedAt,
      expiresAt: new Date(Date.now() + durationMinutes * 60 * 1000).toISOString(),
      durationMinutes,
      snapshot,
      applied,
      lastRestore: null,
    };
    return store.emergency;
  });

  const warnings = [];

  try {
    if (Number(guild.verificationLevel) !== targetVerificationLevel) {
      await guild.setVerificationLevel(
        targetVerificationLevel,
        createAuditReason(reason, options.actor, emergencyId),
      );
    }

    if (profile.raidMode && !currentStore.raid.active) {
      await setRaidMode(client, config, {
        active: true,
        guildId: guild.id,
        actor: options.actor,
        reason: `${profile.name} profile: ${reason}`,
        source: 'emergency-profile',
      });
    }

    for (const channelSnapshot of channelSnapshots) {
      const channel = guild.channels?.cache?.get?.(channelSnapshot.channelId);

      if (!channel?.permissionOverwrites?.edit) {
        throw new Error(`Bean cannot lock #${channelSnapshot.channelName || channelSnapshot.channelId}.`);
      }

      await channel.permissionOverwrites.edit(
        guild.roles.everyone,
        Object.fromEntries(emergencyPermissionFields.map(([, , apiField]) => [apiField, false])),
        { reason: createAuditReason(reason, options.actor, emergencyId) },
      );
    }

    if (guild.autoModerationRules) {
      await syncNativeAutoModerationRules(guild, config, options.actor)
        .catch((error) => warnings.push(`Discord AutoMod sync: ${error.message}`));
    }
  } catch (error) {
    await restoreEmergencySafetyProfile(client, config, {
      actor: options.actor,
      reason: `Automatic rollback after activation failed: ${error.message}`,
      force: true,
    }).catch((rollbackError) => {
      console.error('Emergency profile rollback failed:', rollbackError);
    });
    throw new Error(`${profile.name} activation failed: ${error.message}`);
  }

  const activated = await mutateStore(config, (store) => {
    store.emergency.status = 'active';
    store.emergency.warnings = warnings;
    store.incidents.unshift(normalizeIncident({
      type: 'emergency_profile_activated',
      source: 'bean',
      guildId: guild.id,
      actorId: actor.id,
      actorName: actor.displayName,
      summary: `${profile.name}: ${reason}`,
      metadata: {
        emergencyId,
        profile: profile.id,
        durationMinutes,
        lockedChannels: channelSnapshots.length,
      },
      createdAt: startedAt,
    }));
    store.incidents = store.incidents.filter(Boolean).slice(0, maximumIncidents);
    return store.emergency;
  });

  await sendEmergencyProfileLog(client, config, activated, {
    action: 'emergency-activated',
    title: `${profile.name} Safety Profile Activated`,
    color: profile.lockdown ? colors.danger : colors.warning,
    summary: reason,
    guildId: guild.id,
    fields: [
      { name: 'Activated By', value: actor.displayName },
      { name: 'Duration', value: formatDuration(durationMinutes * 60 * 1000) },
      { name: 'Verification', value: verificationLevelName(targetVerificationLevel) },
      { name: 'Raid Mode', value: applied.raidActive ? 'Active' : 'Unchanged' },
      { name: 'Locked Channels', value: String(channelSnapshots.length) },
      ...(warnings.length ? [{ name: 'Warnings', value: warnings.join('\n') }] : []),
    ],
  });

  return activated;
}

async function restoreEmergencySafetyProfile(client, config, options = {}) {
  const actor = normalizeActor(options.actor);
  const reason = normalizeText(options.reason, 1000);
  const currentStore = await loadProtectionStore(config);
  const emergency = currentStore.emergency;
  const guild = getConfiguredGuild(client, config);

  if (!emergency.active) {
    throw new Error('No emergency safety profile is active.');
  }

  if (!actor?.id) {
    throw new Error('A valid staff member is required.');
  }

  if (!reason) {
    throw new Error('A restoration reason is required.');
  }

  if (!guild) {
    throw new Error('The configured Discord server is unavailable.');
  }

  if (emergency.status === 'restoring' && options.force !== true) {
    throw new Error('The emergency profile is already being restored.');
  }

  await mutateStore(config, (store) => {
    store.emergency.status = 'restoring';
    return store.emergency;
  });

  const restoredChannels = [];
  const skippedDrift = [];
  const missingChannels = [];
  const failures = [];

  for (const channelSnapshot of emergency.snapshot?.channels || []) {
    const channel = guild.channels?.cache?.get?.(channelSnapshot.channelId);

    if (!channel?.permissionOverwrites?.edit) {
      missingChannels.push(channelSnapshot.channelId);
      continue;
    }

    const patch = {};

    for (const [field, permission, apiField] of emergencyPermissionFields) {
      const currentValue = getChannelOverwriteValue(channel, guild.roles.everyone.id, permission);

      if (currentValue === false) {
        patch[apiField] = channelSnapshot.permissions[field];
      } else {
        skippedDrift.push(`${channelSnapshot.channelId}:${field}`);
      }
    }

    if (!Object.keys(patch).length) {
      continue;
    }

    try {
      await channel.permissionOverwrites.edit(
        guild.roles.everyone,
        patch,
        { reason: createAuditReason(reason, options.actor, emergency.id) },
      );
      restoredChannels.push(channelSnapshot.channelId);
    } catch (error) {
      failures.push(`#${channelSnapshot.channelName || channelSnapshot.channelId}: ${error.message}`);
    }
  }

  const currentVerificationLevel = Number(guild.verificationLevel);
  let verificationRestored = false;

  if (
    currentVerificationLevel === emergency.applied?.verificationLevel
    && currentVerificationLevel !== emergency.snapshot?.verificationLevel
  ) {
    try {
      await guild.setVerificationLevel(
        emergency.snapshot.verificationLevel,
        createAuditReason(reason, options.actor, emergency.id),
      );
      verificationRestored = true;
    } catch (error) {
      failures.push(`Verification level: ${error.message}`);
    }
  } else if (currentVerificationLevel !== emergency.applied?.verificationLevel) {
    skippedDrift.push('guild:verificationLevel');
  }

  const latestStore = await loadProtectionStore(config);
  let raidRestored = false;

  if (
    latestStore.raid.active === emergency.applied?.raidActive
    && latestStore.raid.active !== emergency.snapshot?.raid?.active
  ) {
    try {
      await setRaidMode(client, config, {
        active: emergency.snapshot.raid.active,
        guildId: guild.id,
        actor: options.actor,
        reason: `Restored after ${emergency.profileName}: ${reason}`,
        source: 'emergency-restore',
      });
      raidRestored = true;
    } catch (error) {
      failures.push(`Raid mode: ${error.message}`);
    }
  } else if (latestStore.raid.active !== emergency.applied?.raidActive) {
    skippedDrift.push('bean:raidMode');
  }

  const restoredAt = new Date().toISOString();
  const result = {
    restoredAt,
    restoredChannels,
    skippedDrift,
    missingChannels,
    failures,
    verificationRestored,
    raidRestored,
  };

  if (failures.length) {
    await mutateStore(config, (store) => {
      store.emergency.status = 'failed';
      store.emergency.lastRestore = result;
      return store.emergency;
    });
    throw new Error(`Emergency restoration needs attention: ${failures.join('; ')}`);
  }

  const restoredEmergency = await mutateStore(config, (store) => {
    const historyEntry = {
      id: emergency.id,
      profile: emergency.profile,
      profileName: emergency.profileName,
      reason: emergency.reason,
      actor: emergency.actor,
      startedAt: emergency.startedAt,
      expiresAt: emergency.expiresAt,
      restoredAt,
      restoredBy: actor,
      restoreReason: reason,
      result,
    };

    store.emergency = {
      ...createInactiveEmergencyState(),
      history: [historyEntry, ...(store.emergency.history || [])].slice(0, maximumEmergencyHistory),
      lastRestore: result,
    };
    store.incidents.unshift(normalizeIncident({
      type: 'emergency_profile_restored',
      source: 'bean',
      guildId: guild.id,
      actorId: actor.id,
      actorName: actor.displayName,
      summary: `${emergency.profileName}: ${reason}`,
      metadata: {
        emergencyId: emergency.id,
        profile: emergency.profile,
        restoredChannels: restoredChannels.length,
        driftSkipped: skippedDrift.length,
      },
      createdAt: restoredAt,
    }));
    store.incidents = store.incidents.filter(Boolean).slice(0, maximumIncidents);
    return store.emergency;
  });

  if (guild.autoModerationRules) {
    await syncNativeAutoModerationRules(guild, config, options.actor)
      .catch((error) => {
        result.failures.push(`Discord AutoMod sync: ${error.message}`);
      });
  }

  await sendEmergencyProfileLog(client, config, emergency, {
    action: 'emergency-restored',
    title: `${emergency.profileName} Safety Profile Restored`,
    color: colors.success,
    summary: reason,
    guildId: guild.id,
    fields: [
      { name: 'Restored By', value: actor.displayName },
      { name: 'Channels Restored', value: String(restoredChannels.length) },
      { name: 'Drift Preserved', value: String(skippedDrift.length) },
      { name: 'Missing Channels', value: String(missingChannels.length) },
      { name: 'Verification Restored', value: verificationRestored ? 'Yes' : 'Unchanged' },
      { name: 'Raid Mode Restored', value: raidRestored ? 'Yes' : 'Unchanged' },
    ],
  });

  return { emergency: restoredEmergency, result };
}

async function processEmergencyExpiration(client, config) {
  if (emergencySweepRunning) {
    return null;
  }

  emergencySweepRunning = true;

  try {
    const store = await loadProtectionStore(config);
    const expiresAt = new Date(store.emergency.expiresAt || '').getTime();
    const startedAt = new Date(store.emergency.startedAt || '').getTime();
    const interruptedActivation = store.emergency.status === 'applying'
      && Number.isFinite(startedAt)
      && Date.now() - startedAt >= 2 * 60 * 1000;
    const interruptedRestore = store.emergency.status === 'restoring';

    if (
      !store.emergency.active
      || !Number.isFinite(expiresAt)
      || (
        !interruptedActivation
        && !interruptedRestore
        && expiresAt > Date.now()
      )
    ) {
      return null;
    }

    return restoreEmergencySafetyProfile(client, config, {
      actor: client.user,
      reason: interruptedActivation
        ? `${store.emergency.profileName} activation was interrupted and rolled back automatically.`
        : interruptedRestore
          ? `${store.emergency.profileName} restoration was interrupted and resumed automatically.`
          : `${store.emergency.profileName} profile expired automatically.`,
      force: true,
    });
  } finally {
    emergencySweepRunning = false;
  }
}

async function recordProtectionIncident(config, input) {
  return mutateStore(config, (store) => {
    const incident = normalizeIncident(input);

    if (!incident) {
      throw new Error('Protection incident data is invalid.');
    }

    store.incidents.unshift(incident);
    store.incidents = store.incidents.slice(0, maximumIncidents);
    return incident;
  });
}

async function recordQuarantineReview(config, input) {
  return mutateStore(config, (store) => {
    const review = normalizeQuarantineReview(input);

    if (!review) {
      throw new Error('Quarantine review data is invalid.');
    }

    const existing = store.quarantineReviews.find(
      (item) =>
        item.guildId === review.guildId
        && item.userId === review.userId
        && ['pending', 'processing'].includes(item.status),
    );

    if (existing) {
      return existing;
    }

    store.quarantineReviews.unshift(review);
    store.quarantineReviews = store.quarantineReviews.slice(0, maximumQuarantineReviews);
    return review;
  });
}

async function addQuarantineReviewNote(config, reviewId, note, actor) {
  return mutateStore(config, (store) => {
    const review = findQuarantineReview(store, reviewId);
    const content = normalizeText(note, 1000);

    if (!review) {
      throw new Error('That quarantine review was not found.');
    }

    if (!content) {
      throw new Error('A moderator note is required.');
    }

    review.notes.push({
      id: `NOTE-${crypto.randomUUID()}`,
      content,
      actor: normalizeActor(actor),
      createdAt: new Date().toISOString(),
    });
    review.notes = review.notes.slice(-50);
    review.updatedAt = new Date().toISOString();
    return review;
  });
}

async function resolveQuarantineReview(client, config, options = {}) {
  const reviewId = normalizeText(options.reviewId, 100);
  const action = normalizeQuarantineAction(options.action);
  const actor = normalizeActor(options.actor);
  const reason = normalizeText(options.reason, 1000);
  const durationMs = action === 'timeout'
    ? clampInteger(options.durationMs, 60000, 2419200000, 10 * 60 * 1000)
    : null;

  if (!reviewId || !action) {
    throw new Error('Choose a valid quarantine review and action.');
  }

  if (!actor?.id) {
    throw new Error('A valid moderator is required.');
  }

  if (!reason) {
    throw new Error('A staff reason is required.');
  }

  const review = await mutateStore(config, (store) => {
    const target = findQuarantineReview(store, reviewId);

    if (!target) {
      throw new Error('That quarantine review was not found.');
    }

    if (target.status !== 'pending') {
      throw new Error('That quarantine review has already been resolved.');
    }

    target.status = 'processing';
    target.updatedAt = new Date().toISOString();
    target.processing = { actor, startedAt: target.updatedAt };
    return target;
  });
  const guild = getConfiguredGuild(client, config);

  if (!guild || guild.id !== review.guildId) {
    await resetQuarantineReviewClaim(config, reviewId);
    throw new Error('The quarantine review server is unavailable.');
  }

  const member = guild.members?.cache?.get?.(review.userId)
    || await guild.members?.fetch?.(review.userId).catch(() => null);
  const user = member?.user
    || await client.users?.fetch?.(review.userId)?.catch(() => null)
    || {
      id: review.userId,
      username: review.userTag || 'Unknown member',
      tag: review.userTag || 'Unknown member',
      toString: () => `<@${review.userId}>`,
    };
  let caseNumber = null;
  let caseReference = null;
  let dmDelivered = null;
  let logDelivered = null;

  try {
    if (['timeout', 'kick', 'ban'].includes(action)) {
      caseNumber = await reserveModerationCaseNumber(config);
      caseReference = formatCaseReference(caseNumber);
    }

    if (action === 'release') {
      const role = guild.roles?.cache?.get?.(review.roleId);

      if (member && role && member.roles?.cache?.has?.(role.id)) {
        await member.roles.remove(role, createAuditReason(reason, options.actor, review.id));
      }
    } else if (action === 'timeout') {
      if (!member?.moderatable) {
        throw new Error('Bean cannot timeout this member because of Discord role hierarchy or permissions.');
      }

      registerBotModerationAction('timeout', guild.id, review.userId, { caseId: caseReference });
      await member.timeout(durationMs, createAuditReason(reason, options.actor, caseReference));
      await removeQuarantineRole(member, guild, review, reason, options.actor)
        .catch((error) => console.error('Failed to remove quarantine role after timeout:', error));
    } else if (action === 'kick') {
      if (!member?.kickable) {
        throw new Error('Bean cannot kick this member because of Discord role hierarchy or permissions.');
      }

      registerBotModerationAction('kick', guild.id, review.userId, { caseId: caseReference });
      await member.kick(createAuditReason(reason, options.actor, caseReference));
    } else if (action === 'ban') {
      if (member && !member.bannable) {
        throw new Error('Bean cannot ban this member because of Discord role hierarchy or permissions.');
      }

      registerBotModerationAction('ban', guild.id, review.userId, { caseId: caseReference });
      await guild.members.ban(review.userId, {
        deleteMessageSeconds: clampInteger(options.deleteMessageSeconds, 0, 604800, 0),
        reason: createAuditReason(reason, options.actor, caseReference),
      });
    }
  } catch (error) {
    if (['timeout', 'kick', 'ban'].includes(action)) {
      clearBotModerationAction(action, guild.id, review.userId);
    }

    await resetQuarantineReviewClaim(config, reviewId);
    throw error;
  }

  if (['timeout', 'kick', 'ban'].includes(action)) {
    const dmChannel = user.createDM ? await prepareDirectMessage(user) : null;
    const actionCopy = {
      timeout: {
        title: `Timed out in ${guild.name}`,
        emoji: '⏳',
        color: colors.warning,
        summary: `You were timed out after staff reviewed your quarantine in **${guild.name}**.`,
      },
      kick: {
        title: `Removed from ${guild.name}`,
        emoji: '🥾',
        color: colors.danger,
        summary: `You were kicked after staff reviewed your quarantine in **${guild.name}**.`,
      },
      ban: {
        title: `Banned from ${guild.name}`,
        emoji: '🔨',
        color: colors.danger,
        summary: `You were banned after staff reviewed your quarantine in **${guild.name}**.`,
      },
    }[action];

    dmDelivered = await sendModerationDirectMessage(dmChannel, {
      ...actionCopy,
      caseId: caseReference,
      reason,
      durationMs,
      moderator: options.actor,
    });
  }

  const settings = (await loadProtectionStore(config)).settings;
  logDelivered = await sendStructuredLog(client, settings.alertChannelId || config.channels.caseFiles, {
    title: `Quarantine Review: ${humanizeQuarantineAction(action)}`,
    emoji: action === 'release' ? '✅' : action === 'timeout' ? '⏳' : '🛡️',
    color: action === 'release' ? colors.success : action === 'timeout' ? colors.warning : colors.danger,
    summary: `${user} was ${humanizeQuarantineAction(action).toLowerCase()} by staff.`,
    thumbnailUrl: user.displayAvatarURL?.({ size: 256 }),
    referenceId: caseReference || review.id,
    activity: {
      type: 'moderation',
      guildId: guild.id,
      memberId: review.userId,
      memberName: review.userTag,
      action: `quarantine-${action}`,
    },
    fields: [
      { name: 'Member', value: formatUser(user) },
      { name: 'Reviewed By', value: actor.displayName },
      { name: 'Reason', value: reason },
      ...(durationMs ? [{ name: 'Timeout', value: formatDuration(durationMs) }] : []),
    ],
  }, config).catch((error) => {
    console.error('Failed to log quarantine resolution:', error);
    return false;
  });

  if (caseNumber) {
    await recordModerationCase(config, {
      number: caseNumber,
      guildId: guild.id,
      action,
      userId: review.userId,
      userTag: review.userTag || user.tag || user.username,
      moderatorId: actor.id,
      moderatorTag: actor.displayName,
      reason,
      durationMs,
      dmDelivered,
      logDelivered,
      metadata: {
        source: 'bean-quarantine-review',
        quarantineReviewId: review.id,
        deleteMessageSeconds: action === 'ban'
          ? clampInteger(options.deleteMessageSeconds, 0, 604800, 0)
          : 0,
      },
    }).catch((error) => console.error(`Failed to save ${caseReference}:`, error));
  }

  const resolvedAt = new Date().toISOString();
  const resolved = await mutateStore(config, (store) => {
    const target = findQuarantineReview(store, reviewId);

    target.status = quarantineStatusForAction(action);
    target.updatedAt = resolvedAt;
    target.processing = null;
    target.resolution = {
      action,
      reason,
      actor,
      durationMs,
      caseReference,
      memberPresent: Boolean(member),
      resolvedAt,
    };
    store.incidents.unshift(normalizeIncident({
      type: `quarantine_${target.status}`,
      source: 'bean',
      guildId: target.guildId,
      userId: target.userId,
      userTag: target.userTag,
      actorId: actor.id,
      actorName: actor.displayName,
      caseReference,
      action: action === 'release' ? 'none' : action,
      durationMs,
      summary: reason,
      metadata: { quarantineReviewId: target.id },
      createdAt: resolvedAt,
    }));
    store.incidents = store.incidents.filter(Boolean).slice(0, maximumIncidents);
    return target;
  });

  return resolved;
}

async function bulkReleaseQuarantineReviews(client, config, options = {}) {
  const store = await loadProtectionStore(config);
  const guildId = normalizeSnowflake(options.guildId);
  const reason = normalizeText(options.reason, 1000);

  if (!reason) {
    throw new Error('A bulk-release reason is required.');
  }

  const pending = store.quarantineReviews.filter(
    (review) => review.status === 'pending' && (!guildId || review.guildId === guildId),
  );
  const released = [];
  const failed = [];

  for (const review of pending) {
    try {
      released.push(await resolveQuarantineReview(client, config, {
        reviewId: review.id,
        action: 'release',
        actor: options.actor,
        reason,
      }));
    } catch (error) {
      failed.push({ reviewId: review.id, userId: review.userId, error: error.message });
    }
  }

  return { released, failed };
}

async function setRaidMode(client, config, options = {}) {
  const active = Boolean(options.active);
  const currentStore = await loadProtectionStore(config);

  if (active && !currentStore.settings.quarantineRoleId) {
    throw new Error('Configure a quarantine role before enabling raid mode.');
  }

  const guild = getConfiguredGuild(client, config);
  const quarantineRole = active && guild
    ? guild.roles?.cache?.get?.(currentStore.settings.quarantineRoleId)
    : null;

  if (active && guild && !quarantineRole) {
    throw new Error('The configured quarantine role no longer exists.');
  }

  if (active && quarantineRole && !quarantineRole.editable) {
    throw new Error('Move Bean above the quarantine role before enabling raid mode.');
  }

  const actor = normalizeActor(options.actor) || {
    id: client?.user?.id || '',
    displayName: client?.user?.username || 'Bean',
    role: 'system',
  };
  const reason = normalizeText(options.reason, 500)
    || (active ? 'Raid mode enabled by staff.' : 'Raid mode disabled by staff.');
  const result = await mutateStore(config, (store) => {
    const changedAt = new Date().toISOString();

    store.raid = {
      active,
      changedAt,
      changedBy: actor,
      reason,
      source: normalizeText(options.source, 40) || 'manual',
    };
    store.incidents.unshift(normalizeIncident({
      type: active ? 'raid_mode_enabled' : 'raid_mode_disabled',
      source: store.raid.source,
      guildId: options.guildId,
      summary: reason,
      actorId: actor.id,
      actorName: actor.displayName,
      createdAt: changedAt,
      metadata: { active },
    }));
    store.incidents = store.incidents.filter(Boolean).slice(0, maximumIncidents);
    return store.raid;
  });

  if (client && options.guildId) {
    const settings = (await loadProtectionStore(config)).settings;

    await sendStructuredLog(client, settings.alertChannelId || config.channels.caseFiles, {
      title: active ? 'Bean Raid Mode Enabled' : 'Bean Raid Mode Disabled',
      emoji: active ? '🚨' : '🛡️',
      color: active ? colors.danger : colors.success,
      summary: active
        ? 'New members will be quarantined while staff review the server.'
        : 'Automatic quarantine of new arrivals has stopped.',
      referenceId: `RAID-${Date.now()}`,
      activity: {
        type: 'moderation',
        guildId: options.guildId,
        action: active ? 'raid-mode-enabled' : 'raid-mode-disabled',
      },
      fields: [
        { name: 'Changed By', value: actor.displayName },
        { name: 'Reason', value: reason },
        { name: 'Source', value: result.source },
      ],
    }, config).catch((error) => console.error('Failed to log raid-mode change:', error));
  }

  return result;
}

async function getProtectionOverview(client, config) {
  const store = await loadProtectionStore(config);
  const guild = getConfiguredGuild(client, config);
  const nativeRules = guild?.autoModerationRules
    ? await guild.autoModerationRules.fetch().catch(() => null)
    : null;
  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;
  const recent = store.incidents.filter((incident) => new Date(incident.createdAt).getTime() >= dayAgo);

  return {
    settings: store.settings,
    effectiveSettings: getEffectiveProtectionSettings(store),
    raid: store.raid,
    emergency: store.emergency,
    emergencyProfiles: getEmergencyProfiles(),
    incidents: store.incidents.slice(0, 100),
    quarantineReviews: store.quarantineReviews.slice(0, 250),
    metrics: {
      incidents24h: recent.length,
      native24h: recent.filter((incident) => incident.source === 'discord-automod').length,
      custom24h: recent.filter((incident) => incident.source === 'bean').length,
      quarantined24h: recent.filter((incident) => incident.type === 'member_quarantined').length,
      pendingQuarantines: store.quarantineReviews.filter((review) => review.status === 'pending').length,
      lockedChannels: store.emergency.active
        ? store.emergency.applied?.lockedChannelIds?.length || 0
        : 0,
    },
    native: {
      available: Boolean(guild?.autoModerationRules),
      totalRules: nativeRules?.size || 0,
      beanRules: nativeRules
        ? [...nativeRules.values()]
          .filter((rule) => rule.name.startsWith('Bean Protection ·'))
          .map((rule) => ({
            id: rule.id,
            name: rule.name,
            enabled: rule.enabled,
            triggerType: rule.triggerType,
          }))
        : [],
    },
    storage: getProtectionStorageInfo(config),
  };
}

async function syncNativeAutoModerationRules(guild, config, actor = null) {
  if (!guild?.autoModerationRules) {
    throw new Error('Discord AutoMod is unavailable for this server.');
  }

  const store = await loadProtectionStore(config);
  const settings = getEffectiveProtectionSettings(store);
  const existing = await guild.autoModerationRules.fetch();
  const alertAction = settings.alertChannelId
    ? [{
      type: AutoModerationActionType.SendAlertMessage,
      metadata: { channel: settings.alertChannelId },
    }]
    : [];
  const exemptRoles = [
    config.roles?.founder,
    config.roles?.staff,
    config.roles?.moderator,
  ].filter((value, index, values) => value && values.indexOf(value) === index);
  const definitions = [
    {
      name: 'Bean Protection · Discord Spam',
      eventType: AutoModerationRuleEventType.MessageSend,
      triggerType: AutoModerationRuleTriggerType.Spam,
      actions: [
        {
          type: AutoModerationActionType.BlockMessage,
          metadata: { customMessage: 'Bean blocked this message because Discord detected spam.' },
        },
        ...alertAction,
      ],
    },
    {
      name: 'Bean Protection · Mention Raids',
      eventType: AutoModerationRuleEventType.MessageSend,
      triggerType: AutoModerationRuleTriggerType.MentionSpam,
      triggerMetadata: {
        mentionTotalLimit: settings.nativeMentionLimit,
        mentionRaidProtectionEnabled: true,
      },
      actions: [
        {
          type: AutoModerationActionType.BlockMessage,
          metadata: { customMessage: 'Bean blocked this message because it contains too many mentions.' },
        },
        ...alertAction,
        {
          type: AutoModerationActionType.Timeout,
          metadata: { durationSeconds: settings.secondIncidentTimeoutMinutes * 60 },
        },
      ],
    },
  ];
  const result = { created: [], updated: [] };
  const reason = `Bean Protection sync by ${actor?.displayName || actor?.username || 'staff'}`.slice(0, 512);

  for (const definition of definitions) {
    const current = [...existing.values()].find((rule) => rule.name === definition.name);
    const payload = {
      ...definition,
      enabled: true,
      exemptRoles,
      reason,
    };

    if (current) {
      const updated = await guild.autoModerationRules.edit(current, payload);

      result.updated.push({ id: updated.id, name: updated.name });
    } else {
      const created = await guild.autoModerationRules.create(payload);

      result.created.push({ id: created.id, name: created.name });
    }
  }

  return result;
}

async function evaluateProtectionMessage(message, client, config) {
  if (
    !message?.guild
    || !message.author
    || message.author.bot
    || !config.dashboard?.features?.beanProtection
    || isExemptMember(message.member, config)
  ) {
    return null;
  }

  const store = await loadProtectionStore(config);
  const settings = getEffectiveProtectionSettings(store);
  const now = Date.now();
  pruneBehaviorTrackers(now);
  const key = `${message.guild.id}:${message.author.id}`;
  const window = messageWindows.get(key) || [];
  const maximumWindowMs = Math.max(settings.floodWindowSeconds, settings.duplicateWindowSeconds) * 1000;
  const content = normalizeMessageContent(message.content);
  const nextWindow = window
    .filter((entry) => now - entry.createdAt <= maximumWindowMs)
    .concat({ createdAt: now, content, messageId: message.id });

  messageWindows.set(key, nextWindow);

  const floodCount = nextWindow.filter(
    (entry) => now - entry.createdAt <= settings.floodWindowSeconds * 1000,
  ).length;
  const duplicateCount = content
    ? nextWindow.filter(
      (entry) =>
        entry.content === content
        && now - entry.createdAt <= settings.duplicateWindowSeconds * 1000,
    ).length
    : 0;
  const detection = settings.floodEnabled && floodCount >= settings.floodMessageLimit
    ? {
      type: 'message_flood',
      reason: `Message flood detected: ${floodCount} messages in ${settings.floodWindowSeconds} seconds.`,
      evidence: `${floodCount} messages / ${settings.floodWindowSeconds}s`,
    }
    : settings.duplicateEnabled && duplicateCount >= settings.duplicateMessageLimit
      ? {
        type: 'duplicate_messages',
        reason: `Repeated-message spam detected: ${duplicateCount} matching messages in ${settings.duplicateWindowSeconds} seconds.`,
        evidence: `${duplicateCount} duplicates / ${settings.duplicateWindowSeconds}s`,
      }
      : null;

  if (!detection || now - (enforcementCooldowns.get(key) || 0) < 30000) {
    return null;
  }

  enforcementCooldowns.set(key, now);
  messageWindows.set(key, []);
  await message.delete().catch(() => null);

  return applyProtectionAction(client, config, {
    guild: message.guild,
    member: message.member,
    user: message.author,
    channelId: message.channelId,
    messageId: message.id,
    source: 'bean',
    type: detection.type,
    reason: detection.reason,
    evidence: detection.evidence,
    matchedContent: content,
  });
}

async function evaluateProtectionJoin(member, client, config) {
  if (!member?.guild || member.user?.bot || !config.dashboard?.features?.beanProtection) {
    return null;
  }

  const store = await loadProtectionStore(config);
  const settings = getEffectiveProtectionSettings(store);
  const now = Date.now();
  pruneBehaviorTrackers(now);
  const entries = (joinWindows.get(member.guild.id) || [])
    .filter((timestamp) => now - timestamp <= settings.joinWindowSeconds * 1000)
    .concat(now);

  joinWindows.set(member.guild.id, entries);

  let raid = store.raid;

  if (settings.joinDetectionEnabled && entries.length >= settings.joinLimit && !raid.active) {
    const alertKey = member.guild.id;

    if (now - (raidAlertCooldowns.get(alertKey) || 0) >= settings.joinWindowSeconds * 1000) {
      raidAlertCooldowns.set(alertKey, now);

      if (settings.autoRaidMode) {
        raid = await setRaidMode(client, config, {
          active: true,
          guildId: member.guild.id,
          actor: client.user,
          source: 'join-detection',
          reason: `${entries.length} members joined within ${settings.joinWindowSeconds} seconds.`,
        });
      } else {
        await recordProtectionIncident(config, {
          type: 'join_spike',
          source: 'bean',
          guildId: member.guild.id,
          userId: member.id,
          userTag: member.user.tag || member.user.username,
          summary: `${entries.length} members joined within ${settings.joinWindowSeconds} seconds.`,
          metadata: { joinCount: entries.length, windowSeconds: settings.joinWindowSeconds },
        });
        await sendStructuredLog(client, settings.alertChannelId || config.channels.caseFiles, {
          title: 'Join Spike Detected',
          emoji: '⚠️',
          color: colors.warning,
          summary: `${entries.length} members joined **${member.guild.name}** within ${settings.joinWindowSeconds} seconds.`,
          referenceId: `JOIN-SPIKE-${Date.now()}`,
          activity: {
            type: 'moderation',
            guildId: member.guild.id,
            memberId: member.id,
            memberName: member.displayName,
            action: 'join-spike',
          },
          fields: [
            { name: 'Automatic Raid Mode', value: 'Disabled — staff review required' },
            { name: 'Suggested Action', value: 'Use `/raid enable` or the Protection dashboard if this is a raid.' },
          ],
        }, config).catch((error) => console.error('Failed to log join spike:', error));
      }
    }
  }

  if (!raid.active) {
    return null;
  }

  return quarantineMember(member, client, config, settings, raid);
}

async function quarantineMember(member, client, config, settings, raid) {
  const roleId = settings.quarantineRoleId;
  const role = roleId ? member.guild.roles.cache.get(roleId) : null;

  if (!role || !role.editable) {
    await recordProtectionIncident(config, {
      type: 'quarantine_failed',
      source: 'bean',
      guildId: member.guild.id,
      userId: member.id,
      userTag: member.user.tag || member.user.username,
      summary: roleId
        ? 'The configured quarantine role is missing or above Bean.'
        : 'Raid mode is active, but no quarantine role is configured.',
      metadata: { roleId: roleId || '' },
    });
    return { status: 'unavailable' };
  }

  try {
    await member.roles.add(role, `Bean raid mode: ${raid.reason}`.slice(0, 512));
  } catch (error) {
    await recordProtectionIncident(config, {
      type: 'quarantine_failed',
      source: 'bean',
      guildId: member.guild.id,
      userId: member.id,
      userTag: member.user.tag || member.user.username,
      summary: error.message,
      metadata: { roleId },
    });
    return { status: 'failed', error: error.message };
  }

  const incident = await recordProtectionIncident(config, {
    type: 'member_quarantined',
    source: 'bean',
    guildId: member.guild.id,
    userId: member.id,
    userTag: member.user.tag || member.user.username,
    summary: 'Member received the quarantine role while raid mode was active.',
    metadata: {
      roleId,
      accountAgeHours: Math.floor((Date.now() - member.user.createdTimestamp) / 3600000),
    },
  });
  const review = await recordQuarantineReview(config, {
    guildId: member.guild.id,
    userId: member.id,
    userTag: member.user.tag || member.user.username,
    displayName: member.displayName,
    roleId,
    raidReason: raid.reason,
    raidSource: raid.source,
    sourceIncidentId: incident.id,
    accountCreatedAt: Number.isFinite(member.user.createdTimestamp)
      ? new Date(member.user.createdTimestamp).toISOString()
      : null,
    joinedAt: member.joinedAt?.toISOString?.() || new Date().toISOString(),
  });

  await sendStructuredLog(client, settings.alertChannelId || config.channels.caseFiles, {
    title: 'New Member Quarantined',
    emoji: '🛡️',
    color: colors.warning,
    summary: `${member} received ${role} because Bean raid mode is active.`,
    thumbnailUrl: member.user.displayAvatarURL({ size: 256 }),
    referenceId: incident.id,
    activity: {
      type: 'moderation',
      guildId: member.guild.id,
      memberId: member.id,
      memberName: member.displayName,
      action: 'quarantined',
    },
    fields: [
      { name: 'Member', value: formatUser(member.user) },
      { name: 'Raid Reason', value: raid.reason },
      { name: 'Account Age', value: formatDuration(Date.now() - member.user.createdTimestamp) },
    ],
    buttons: [
      {
        customId: `bean-quarantine:release:${review.id}`,
        label: 'Release',
        emoji: '✅',
        style: 'success',
      },
      {
        customId: `bean-quarantine:timeout:${review.id}`,
        label: 'Timeout 10m',
        emoji: '⏳',
        style: 'secondary',
      },
    ],
    links: config.dashboard?.publicUrl
      ? [{ label: 'Open Dashboard', url: `${config.dashboard.publicUrl.replace(/\/+$/, '')}/#bean-protection` }]
      : [],
  }, config).catch((error) => console.error('Failed to log quarantine:', error));

  return { status: 'quarantined', incident, review };
}

function queueNativeAutoModerationExecution(execution, client, config) {
  if (!config.dashboard?.features?.beanProtection || !execution?.guild) {
    return;
  }

  const key = nativeExecutionKey(execution);
  const processedAt = processedNativeExecutions.get(key);

  if (processedAt && Date.now() - processedAt < 60000) {
    return;
  }

  const current = pendingNativeExecutions.get(key);
  const next = !current || nativeActionSeverity(execution.action?.type) > nativeActionSeverity(current.execution.action?.type)
    ? execution
    : current.execution;

  if (current?.timer) {
    clearTimeout(current.timer);
  }

  const timer = setTimeout(() => {
    pendingNativeExecutions.delete(key);
    processedNativeExecutions.set(key, Date.now());
    processNativeAutoModerationExecution(next, client, config)
      .catch((error) => console.error('Failed to process Discord AutoMod action:', error));
    pruneNativeExecutionCache();
  }, 250);

  timer.unref?.();
  pendingNativeExecutions.set(key, { execution: next, timer });
}

async function processNativeAutoModerationExecution(execution, client, config) {
  if (
    !execution?.guild
    || execution.action?.type === AutoModerationActionType.SendAlertMessage
    || !config.dashboard?.features?.beanProtection
  ) {
    return null;
  }

  const store = await loadProtectionStore(config);

  if (!getEffectiveProtectionSettings(store).nativeLoggingEnabled) {
    return null;
  }

  const member = execution.member
    || execution.guild.members.cache.get(execution.userId)
    || await execution.guild.members.fetch(execution.userId).catch(() => null);
  const user = execution.user || member?.user;

  if (!user || isExemptMember(member, config)) {
    return null;
  }

  const ruleName = execution.autoModerationRule?.name || `Discord rule ${execution.ruleId}`;
  const actionType = execution.action?.type;
  const durationMs = actionType === AutoModerationActionType.Timeout
    ? (execution.action?.metadata?.durationSeconds || 0) * 1000
    : null;

  return applyProtectionAction(client, config, {
    guild: execution.guild,
    member,
    user,
    channelId: execution.channelId,
    messageId: execution.messageId,
    source: 'discord-automod',
    type: 'native_automod',
    reason: `Discord AutoMod rule “${ruleName}” was triggered.`,
    evidence: execution.matchedKeyword || execution.matchedContent || 'Discord detected a rule match.',
    matchedContent: execution.matchedContent,
    forcedAction: durationMs ? 'timeout' : 'warn',
    durationMs,
    alreadyEnforced: true,
    metadata: {
      ruleId: execution.ruleId,
      ruleName,
      triggerType: execution.ruleTriggerType,
      actionType,
    },
  });
}

async function applyProtectionAction(client, config, options) {
  const store = await loadProtectionStore(config);
  const settings = getEffectiveProtectionSettings(store);
  const recentCutoff = Date.now() - settings.escalationWindowHours * 60 * 60 * 1000;
  const priorIncidents = store.incidents.filter(
    (incident) =>
      incident.userId === options.user.id
      && incident.source === 'bean'
      && new Date(incident.createdAt).getTime() >= recentCutoff,
  ).length;
  let action = options.forcedAction
    || (priorIncidents >= 2 ? 'timeout' : priorIncidents >= 1 ? 'timeout' : 'warn');
  let durationMs = options.durationMs
    || (priorIncidents >= 2
      ? settings.repeatIncidentTimeoutMinutes * 60 * 1000
      : settings.secondIncidentTimeoutMinutes * 60 * 1000);

  if (action === 'timeout' && !options.alreadyEnforced) {
    if (!options.member?.moderatable) {
      action = 'warn';
      durationMs = null;
    } else {
      try {
        await options.member.timeout(
          durationMs,
          `${options.reason} | Automated by Bean Protection`.slice(0, 512),
        );
      } catch {
        action = 'warn';
        durationMs = null;
      }
    }
  }

  let caseNumber;
  let caseReference = null;

  try {
    caseNumber = await reserveModerationCaseNumber(config);
    caseReference = formatCaseReference(caseNumber);
  } catch (error) {
    console.error('Failed to reserve protection case number:', error);
  }

  const dmChannel = settings.dmNotificationsEnabled
    ? await prepareDirectMessage(options.user)
    : null;
  const dmDelivered = settings.dmNotificationsEnabled
    ? await sendModerationDirectMessage(dmChannel, {
      title: action === 'timeout'
        ? `Automatically timed out in ${options.guild.name}`
        : `Automated warning in ${options.guild.name}`,
      emoji: action === 'timeout' ? '⏳' : '⚠️',
      color: action === 'timeout' ? colors.warning : colors.info,
      summary: action === 'timeout'
        ? `Bean temporarily restricted your account in **${options.guild.name}**.`
        : `Bean detected behavior that may violate **${options.guild.name}** rules.`,
      caseId: caseReference || 'BEAN-PROTECTION',
      reason: options.reason,
      durationMs: action === 'timeout' ? durationMs : null,
      moderator: client.user,
      nextSteps: 'Avoid repeating the behavior. Contact server staff if you believe this was incorrect.',
    })
    : null;
  const logDelivered = await sendStructuredLog(
    client,
    settings.alertChannelId || config.channels.caseFiles,
    {
      title: action === 'timeout' ? 'Bean Protection Timeout' : 'Bean Protection Warning',
      emoji: action === 'timeout' ? '⏳' : '⚠️',
      color: action === 'timeout' ? colors.warning : colors.info,
      summary: `${options.user} triggered ${options.source === 'discord-automod' ? 'Discord AutoMod' : 'Bean behavioral protection'}.`,
      thumbnailUrl: options.user.displayAvatarURL?.({ size: 256 }),
      referenceId: caseReference || `PROTECTION-${Date.now()}`,
      activity: {
        type: 'moderation',
        guildId: options.guild.id,
        memberId: options.user.id,
        memberName: options.member?.displayName || options.user.globalName || options.user.username,
        action,
      },
      fields: [
        { name: 'Member', value: formatUser(options.user) },
        { name: 'Detection', value: options.type.replaceAll('_', ' ') },
        { name: 'Reason', value: options.reason },
        { name: 'Evidence', value: truncate(options.evidence || 'Not available', 1000) },
        { name: 'Source', value: options.source === 'discord-automod' ? 'Discord AutoMod' : 'Bean Protection' },
        ...(action === 'timeout' && durationMs
          ? [{ name: 'Timeout', value: formatDuration(durationMs) }]
          : []),
        { name: 'Direct Message', value: settings.dmNotificationsEnabled ? (dmDelivered ? 'Delivered' : 'Unavailable') : 'Disabled' },
      ],
    },
    config,
  ).catch((error) => {
    console.error('Failed to send protection log:', error);
    return false;
  });

  if (caseNumber) {
    await recordModerationCase(config, {
      number: caseNumber,
      guildId: options.guild.id,
      action,
      userId: options.user.id,
      userTag: options.user.tag || options.user.username,
      moderatorId: client.user.id,
      moderatorTag: client.user.tag || client.user.username,
      reason: options.reason,
      durationMs: action === 'timeout' ? durationMs : null,
      channelId: options.channelId,
      dmDelivered,
      logDelivered,
      metadata: {
        source: options.source,
        detection: options.type,
        messageId: options.messageId || '',
        ...options.metadata,
      },
    }).catch((error) => console.error(`Failed to save ${caseReference}:`, error));
  }

  const incident = await recordProtectionIncident(config, {
    type: options.type,
    source: options.source,
    guildId: options.guild.id,
    userId: options.user.id,
    userTag: options.user.tag || options.user.username,
    channelId: options.channelId,
    caseReference,
    action,
    durationMs: action === 'timeout' ? durationMs : null,
    summary: options.reason,
    evidence: options.evidence,
    metadata: {
      messageId: options.messageId || '',
      ...options.metadata,
    },
  });

  return { action, durationMs, caseReference, incident, dmDelivered, logDelivered };
}

function isExemptMember(member, config) {
  if (!member) {
    return false;
  }

  if (
    member.permissions?.has?.(PermissionFlagsBits.Administrator)
    || member.permissions?.has?.(PermissionFlagsBits.ManageMessages)
    || member.permissions?.has?.(PermissionFlagsBits.ModerateMembers)
  ) {
    return true;
  }

  return [config.roles?.founder, config.roles?.staff, config.roles?.moderator]
    .filter(Boolean)
    .some((roleId) => member.roles?.cache?.has?.(roleId));
}

function getConfiguredGuild(client, config) {
  if (!client?.guilds?.cache) {
    return null;
  }

  if (config.guildId) {
    return client.guilds.cache.get(config.guildId) || null;
  }

  return client.guilds.cache.first?.() || [...client.guilds.cache.values()][0] || null;
}

async function mutateStore(config, mutator) {
  const operation = mutationQueue.then(async () => {
    const store = await readStore(config);
    const result = await mutator(store);

    await writeStore(config, store);
    return clone(result);
  });

  mutationQueue = operation.catch(() => null);
  return operation;
}

async function readStore(config) {
  const { filePath } = getProtectionStorageInfo(config);
  const cached = storeCache.get(filePath);

  if (cached) {
    return clone(cached);
  }

  let parsed;

  try {
    parsed = JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  const store = normalizeStore(parsed, config);

  storeCache.set(filePath, clone(store));
  return store;
}

async function writeStore(config, store) {
  const { filePath } = getProtectionStorageInfo(config);
  const temporaryPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(temporaryPath, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
  await fs.rename(temporaryPath, filePath);
  storeCache.set(filePath, clone(store));
}

function normalizeStore(input, config) {
  const source = input && typeof input === 'object' ? input : {};

  return {
    version: 3,
    settings: normalizeSettings(source.settings, config),
    raid: normalizeRaid(source.raid),
    emergency: normalizeEmergency(source.emergency),
    incidents: Array.isArray(source.incidents)
      ? source.incidents.map(normalizeIncident).filter(Boolean).slice(0, maximumIncidents)
      : [],
    quarantineReviews: Array.isArray(source.quarantineReviews)
      ? source.quarantineReviews
        .map(normalizeQuarantineReview)
        .filter(Boolean)
        .slice(0, maximumQuarantineReviews)
      : [],
  };
}

function normalizeSettings(input, config) {
  const source = input && typeof input === 'object' ? input : {};
  const defaults = config.protection || {};

  return {
    nativeLoggingEnabled: normalizeBoolean(source.nativeLoggingEnabled, true),
    dmNotificationsEnabled: normalizeBoolean(source.dmNotificationsEnabled, true),
    floodEnabled: normalizeBoolean(source.floodEnabled, true),
    floodMessageLimit: clampInteger(source.floodMessageLimit, 3, 20, defaults.floodMessageLimit || 6),
    floodWindowSeconds: clampInteger(source.floodWindowSeconds, 3, 60, defaults.floodWindowSeconds || 8),
    duplicateEnabled: normalizeBoolean(source.duplicateEnabled, true),
    duplicateMessageLimit: clampInteger(source.duplicateMessageLimit, 2, 10, defaults.duplicateMessageLimit || 3),
    duplicateWindowSeconds: clampInteger(source.duplicateWindowSeconds, 5, 120, defaults.duplicateWindowSeconds || 20),
    joinDetectionEnabled: normalizeBoolean(source.joinDetectionEnabled, true),
    joinLimit: clampInteger(source.joinLimit, 3, 50, defaults.joinLimit || 5),
    joinWindowSeconds: clampInteger(source.joinWindowSeconds, 30, 900, defaults.joinWindowSeconds || 300),
    autoRaidMode: normalizeBoolean(source.autoRaidMode, Boolean(defaults.autoRaidMode)),
    nativeMentionLimit: clampInteger(source.nativeMentionLimit, 2, 50, 6),
    escalationWindowHours: clampInteger(source.escalationWindowHours, 1, 168, 24),
    secondIncidentTimeoutMinutes: clampInteger(source.secondIncidentTimeoutMinutes, 1, 1440, 10),
    repeatIncidentTimeoutMinutes: clampInteger(source.repeatIncidentTimeoutMinutes, 5, 40320, 60),
    alertChannelId: normalizeSnowflake(source.alertChannelId) || normalizeSnowflake(defaults.alertChannelId),
    quarantineRoleId: normalizeSnowflake(source.quarantineRoleId) || normalizeSnowflake(defaults.quarantineRoleId),
    updatedAt: normalizeDate(source.updatedAt),
    updatedBy: normalizeActor(source.updatedBy),
  };
}

function normalizeRaid(input) {
  const source = input && typeof input === 'object' ? input : {};

  return {
    active: Boolean(source.active),
    changedAt: normalizeDate(source.changedAt),
    changedBy: normalizeActor(source.changedBy),
    reason: normalizeText(source.reason, 500),
    source: normalizeText(source.source, 40) || 'manual',
  };
}

function createInactiveEmergencyState() {
  return {
    id: null,
    active: false,
    status: 'inactive',
    profile: null,
    profileName: '',
    reason: '',
    actor: null,
    startedAt: null,
    expiresAt: null,
    durationMinutes: null,
    snapshot: null,
    applied: null,
    warnings: [],
    history: [],
    lastRestore: null,
  };
}

function normalizeEmergency(input) {
  const source = input && typeof input === 'object' ? input : {};
  const inactive = createInactiveEmergencyState();
  const profile = emergencyProfiles[source.profile];
  const active = Boolean(source.active && profile && source.id);
  const status = ['applying', 'active', 'restoring', 'failed'].includes(source.status)
    ? source.status
    : active ? 'active' : 'inactive';

  return {
    ...inactive,
    id: active ? normalizeText(source.id, 100) : null,
    active,
    status: active ? status : 'inactive',
    profile: active ? profile.id : null,
    profileName: active ? profile.name : '',
    reason: active ? normalizeText(source.reason, 1000) : '',
    actor: active ? normalizeActor(source.actor) : null,
    startedAt: active ? normalizeDate(source.startedAt) : null,
    expiresAt: active ? normalizeDate(source.expiresAt) : null,
    durationMinutes: active
      ? clampInteger(source.durationMinutes, 5, 1440, 60)
      : null,
    snapshot: active ? normalizeEmergencySnapshot(source.snapshot) : null,
    applied: active ? normalizeEmergencyApplied(source.applied) : null,
    warnings: normalizeStringArray(source.warnings, 20, 500),
    history: normalizeEmergencyHistory(source.history),
    lastRestore: normalizeEmergencyRestoreResult(source.lastRestore),
  };
}

function normalizeEmergencySnapshot(input) {
  const source = input && typeof input === 'object' ? input : {};

  return {
    verificationLevel: clampInteger(
      source.verificationLevel,
      GuildVerificationLevel.None,
      GuildVerificationLevel.VeryHigh,
      GuildVerificationLevel.None,
    ),
    raid: normalizeRaid(source.raid),
    channels: Array.isArray(source.channels)
      ? source.channels.map(normalizeEmergencyChannelSnapshot).filter(Boolean).slice(0, 500)
      : [],
  };
}

function normalizeEmergencyChannelSnapshot(input) {
  const channelId = normalizeSnowflake(input?.channelId);

  if (!channelId) {
    return null;
  }

  const permissions = {};

  for (const [field] of emergencyPermissionFields) {
    permissions[field] = input.permissions?.[field] === true
      ? true
      : input.permissions?.[field] === false ? false : null;
  }

  return {
    channelId,
    channelName: normalizeText(input.channelName, 100),
    permissions,
  };
}

function normalizeEmergencyApplied(input) {
  const source = input && typeof input === 'object' ? input : {};

  return {
    verificationLevel: clampInteger(
      source.verificationLevel,
      GuildVerificationLevel.None,
      GuildVerificationLevel.VeryHigh,
      GuildVerificationLevel.None,
    ),
    raidActive: Boolean(source.raidActive),
    lockedChannelIds: Array.isArray(source.lockedChannelIds)
      ? source.lockedChannelIds.map(normalizeSnowflake).filter(Boolean).slice(0, 500)
      : [],
  };
}

function normalizeEmergencyHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .map((entry) => ({
      id: normalizeText(entry?.id, 100),
      profile: emergencyProfiles[entry?.profile]?.id || null,
      profileName: normalizeText(entry?.profileName, 40),
      reason: normalizeText(entry?.reason, 1000),
      actor: normalizeActor(entry?.actor),
      startedAt: normalizeDate(entry?.startedAt),
      expiresAt: normalizeDate(entry?.expiresAt),
      restoredAt: normalizeDate(entry?.restoredAt),
      restoredBy: normalizeActor(entry?.restoredBy),
      restoreReason: normalizeText(entry?.restoreReason, 1000),
      result: normalizeEmergencyRestoreResult(entry?.result),
    }))
    .filter((entry) => entry.id && entry.profile && entry.startedAt)
    .slice(0, maximumEmergencyHistory);
}

function normalizeEmergencyRestoreResult(input) {
  if (!input || typeof input !== 'object') {
    return null;
  }

  return {
    restoredAt: normalizeDate(input.restoredAt),
    restoredChannels: normalizeSnowflakeArray(input.restoredChannels, 500),
    skippedDrift: normalizeStringArray(input.skippedDrift, 1000, 120),
    missingChannels: normalizeSnowflakeArray(input.missingChannels, 500),
    failures: normalizeStringArray(input.failures, 100, 500),
    verificationRestored: Boolean(input.verificationRestored),
    raidRestored: Boolean(input.raidRestored),
  };
}

function collectLockdownChannelSnapshots(guild, config, settings) {
  const everyone = guild.roles?.everyone;

  if (!everyone) {
    throw new Error('The server everyone role is unavailable.');
  }

  const excludedIds = new Set([
    settings.alertChannelId,
    config.channels?.caseFiles,
    config.channels?.entryLog,
    config.channels?.signalLog,
    config.channels?.lineLog,
    config.channels?.operationLog,
    config.channels?.systemLog,
    config.channels?.ticketLogs,
  ].filter(Boolean));
  const lockableTypes = new Set([
    ChannelType.GuildText,
    ChannelType.GuildAnnouncement,
    ChannelType.GuildForum,
    ChannelType.GuildMedia,
    ChannelType.GuildVoice,
    ChannelType.GuildStageVoice,
  ]);
  const channels = guild.channels?.cache?.values
    ? [...guild.channels.cache.values()]
    : [];

  return channels
    .filter((channel) => {
      if (
        excludedIds.has(channel.id)
        || !lockableTypes.has(channel.type)
        || !channel.permissionOverwrites?.edit
        || channel.lockdownEligible === false
      ) {
        return false;
      }

      const permissions = channel.permissionsFor?.(everyone);
      return !permissions?.has || permissions.has(PermissionFlagsBits.SendMessages);
    })
    .map((channel) => ({
      channelId: channel.id,
      channelName: channel.name || channel.id,
      permissions: Object.fromEntries(
        emergencyPermissionFields.map(([field, permission]) => [
          field,
          getChannelOverwriteValue(channel, everyone.id, permission),
        ]),
      ),
    }));
}

function getChannelOverwriteValue(channel, roleId, permission) {
  const overwrite = channel.permissionOverwrites?.cache?.get?.(roleId);

  if (!overwrite) {
    return null;
  }

  if (permissionCollectionHas(overwrite.allow, permission)) {
    return true;
  }

  if (permissionCollectionHas(overwrite.deny, permission)) {
    return false;
  }

  return null;
}

function permissionCollectionHas(collection, permission) {
  if (collection?.has) {
    return collection.has(permission);
  }

  try {
    const bitfield = BigInt(collection?.bitfield ?? collection ?? 0);
    return (bitfield & permission) === permission;
  } catch {
    return false;
  }
}

async function sendEmergencyProfileLog(client, config, emergency, options) {
  const store = await loadProtectionStore(config);

  return sendStructuredLog(client, store.settings.alertChannelId || config.channels.caseFiles, {
    title: options.title,
    emoji: emergency.profile === 'lockdown' ? '🔒' : '🚨',
    color: options.color,
    summary: options.summary,
    referenceId: emergency.id,
    activity: {
      type: 'moderation',
      guildId: options.guildId,
      action: options.action,
    },
    fields: options.fields,
  }, config).catch((error) => {
    console.error('Failed to log emergency safety profile:', error);
    return false;
  });
}

function verificationLevelName(level) {
  return {
    [GuildVerificationLevel.None]: 'None',
    [GuildVerificationLevel.Low]: 'Low',
    [GuildVerificationLevel.Medium]: 'Medium',
    [GuildVerificationLevel.High]: 'High',
    [GuildVerificationLevel.VeryHigh]: 'Highest',
  }[level] || 'Unknown';
}

function normalizeSnowflakeArray(values, limit) {
  return Array.isArray(values)
    ? values.map(normalizeSnowflake).filter(Boolean).slice(0, limit)
    : [];
}

function normalizeStringArray(values, limit, maximumLength) {
  return Array.isArray(values)
    ? values.map((value) => normalizeText(value, maximumLength)).filter(Boolean).slice(0, limit)
    : [];
}

function normalizeIncident(input) {
  if (!input || typeof input !== 'object') {
    return null;
  }

  const type = normalizeText(input.type, 80).toLowerCase();
  const source = normalizeText(input.source, 40).toLowerCase();
  const summary = normalizeText(input.summary, 500);

  if (!type || !source || !summary) {
    return null;
  }

  return {
    id: normalizeText(input.id, 100) || `PROTECTION-${crypto.randomUUID()}`,
    type,
    source,
    guildId: normalizeSnowflake(input.guildId),
    userId: normalizeSnowflake(input.userId),
    userTag: normalizeText(input.userTag, 100),
    actorId: normalizeSnowflake(input.actorId),
    actorName: normalizeText(input.actorName, 100),
    channelId: normalizeSnowflake(input.channelId),
    caseReference: /^CASE-\d{6}$/.test(String(input.caseReference || ''))
      ? String(input.caseReference)
      : null,
    action: ['warn', 'timeout', 'quarantine', 'none'].includes(input.action)
      ? input.action
      : null,
    durationMs: clampInteger(input.durationMs, 1, 2419200000, null),
    summary,
    evidence: normalizeText(input.evidence, 1000),
    metadata: normalizeMetadata(input.metadata),
    createdAt: normalizeDate(input.createdAt) || new Date().toISOString(),
  };
}

function normalizeQuarantineReview(input) {
  if (!input || typeof input !== 'object') {
    return null;
  }

  const guildId = normalizeSnowflake(input.guildId);
  const userId = normalizeSnowflake(input.userId);
  const roleId = normalizeSnowflake(input.roleId);

  if (!guildId || !userId || !roleId) {
    return null;
  }

  const createdAt = normalizeDate(input.createdAt) || new Date().toISOString();
  let status = ['pending', 'processing', 'released', 'timed_out', 'kicked', 'banned']
    .includes(input.status)
    ? input.status
    : 'pending';
  let processing = status === 'processing' ? normalizeProcessing(input.processing) : null;

  if (
    status === 'processing'
    && (
      !processing
      || Date.now() - new Date(processing.startedAt).getTime() > 5 * 60 * 1000
    )
  ) {
    status = 'pending';
    processing = null;
  }

  return {
    id: normalizeText(input.id, 100) || `QUARANTINE-${crypto.randomUUID()}`,
    guildId,
    userId,
    userTag: normalizeText(input.userTag, 100),
    displayName: normalizeText(input.displayName, 100),
    roleId,
    raidReason: normalizeText(input.raidReason, 500),
    raidSource: normalizeText(input.raidSource, 40) || 'manual',
    sourceIncidentId: normalizeText(input.sourceIncidentId, 100),
    accountCreatedAt: normalizeDate(input.accountCreatedAt),
    joinedAt: normalizeDate(input.joinedAt),
    status,
    notes: normalizeQuarantineNotes(input.notes),
    processing,
    resolution: ['released', 'timed_out', 'kicked', 'banned'].includes(status)
      ? normalizeQuarantineResolution(input.resolution)
      : null,
    createdAt,
    updatedAt: normalizeDate(input.updatedAt) || createdAt,
  };
}

function normalizeQuarantineNotes(notes) {
  if (!Array.isArray(notes)) {
    return [];
  }

  return notes
    .map((note) => ({
      id: normalizeText(note?.id, 100) || `NOTE-${crypto.randomUUID()}`,
      content: normalizeText(note?.content, 1000),
      actor: normalizeActor(note?.actor),
      createdAt: normalizeDate(note?.createdAt) || new Date().toISOString(),
    }))
    .filter((note) => note.content && note.actor)
    .slice(-50);
}

function normalizeProcessing(input) {
  const actor = normalizeActor(input?.actor);

  return actor
    ? { actor, startedAt: normalizeDate(input.startedAt) || new Date().toISOString() }
    : null;
}

function normalizeQuarantineResolution(input) {
  const action = normalizeQuarantineAction(input?.action);
  const actor = normalizeActor(input?.actor);
  const reason = normalizeText(input?.reason, 1000);

  if (!action || !actor || !reason) {
    return null;
  }

  return {
    action,
    reason,
    actor,
    durationMs: action === 'timeout'
      ? clampInteger(input.durationMs, 60000, 2419200000, 10 * 60 * 1000)
      : null,
    caseReference: /^CASE-\d{6}$/.test(String(input.caseReference || ''))
      ? String(input.caseReference)
      : null,
    memberPresent: Boolean(input.memberPresent),
    resolvedAt: normalizeDate(input.resolvedAt) || new Date().toISOString(),
  };
}

function normalizeQuarantineAction(value) {
  const action = String(value || '').trim().toLowerCase();
  return ['release', 'timeout', 'kick', 'ban'].includes(action) ? action : '';
}

function quarantineStatusForAction(action) {
  if (action === 'timeout') return 'timed_out';
  if (action === 'kick') return 'kicked';
  if (action === 'ban') return 'banned';
  return 'released';
}

function humanizeQuarantineAction(action) {
  return {
    release: 'Released',
    timeout: 'Timed Out',
    kick: 'Kicked',
    ban: 'Banned',
  }[action] || 'Resolved';
}

function findQuarantineReview(store, reviewId) {
  return store.quarantineReviews.find((review) => review.id === reviewId) || null;
}

async function resetQuarantineReviewClaim(config, reviewId) {
  return mutateStore(config, (store) => {
    const review = findQuarantineReview(store, reviewId);

    if (review?.status === 'processing') {
      review.status = 'pending';
      review.processing = null;
      review.updatedAt = new Date().toISOString();
    }

    return review;
  });
}

async function removeQuarantineRole(member, guild, review, reason, actor) {
  const role = guild.roles?.cache?.get?.(review.roleId);

  if (role && member.roles?.cache?.has?.(role.id)) {
    await member.roles.remove(role, createAuditReason(reason, actor, review.id));
  }
}

function normalizeActor(actor) {
  if (!actor || typeof actor !== 'object') {
    return null;
  }

  return {
    id: normalizeSnowflake(actor.id) || '',
    displayName: normalizeText(actor.displayName || actor.globalName || actor.username || actor.tag, 100) || 'Bean',
    role: normalizeText(actor.role, 30) || (actor.bot ? 'system' : 'staff'),
  };
}

function normalizeMetadata(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value)
      .slice(0, 20)
      .map(([key, item]) => [
        normalizeText(key, 80),
        ['string', 'number', 'boolean'].includes(typeof item)
          ? (typeof item === 'string' ? normalizeText(item, 500) : item)
          : normalizeText(String(item ?? ''), 500),
      ])
      .filter(([key]) => key),
  );
}

function normalizeMessageContent(value) {
  return String(value || '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .slice(0, 1000);
}

function nativeExecutionKey(execution) {
  return [
    execution.guild?.id,
    execution.ruleId,
    execution.userId,
    execution.messageId || execution.alertSystemMessageId || Math.floor(Date.now() / 1000),
  ].join(':');
}

function nativeActionSeverity(type) {
  if (type === AutoModerationActionType.Timeout) return 3;
  if (type === AutoModerationActionType.BlockMemberInteraction) return 2;
  if (type === AutoModerationActionType.BlockMessage) return 1;
  return 0;
}

function pruneNativeExecutionCache() {
  const cutoff = Date.now() - 60000;

  for (const [key, timestamp] of processedNativeExecutions) {
    if (timestamp < cutoff) {
      processedNativeExecutions.delete(key);
    }
  }
}

function pruneBehaviorTrackers(now) {
  if (now - lastTrackerPruneAt < 60000) {
    return;
  }

  lastTrackerPruneAt = now;
  const staleCutoff = now - 15 * 60 * 1000;

  for (const [key, entries] of messageWindows) {
    if (!entries.length || entries.at(-1).createdAt < staleCutoff) {
      messageWindows.delete(key);
    }
  }

  for (const [key, entries] of joinWindows) {
    if (!entries.length || entries.at(-1) < staleCutoff) {
      joinWindows.delete(key);
    }
  }

  for (const [key, timestamp] of enforcementCooldowns) {
    if (timestamp < staleCutoff) {
      enforcementCooldowns.delete(key);
    }
  }

  for (const [key, timestamp] of raidAlertCooldowns) {
    if (timestamp < staleCutoff) {
      raidAlertCooldowns.delete(key);
    }
  }
}

function normalizeBoolean(value, fallback) {
  return typeof value === 'boolean' ? value : fallback;
}

function clampInteger(value, minimum, maximum, fallback) {
  const number = Number.parseInt(value, 10);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.min(maximum, Math.max(minimum, number));
}

function normalizeSnowflake(value) {
  const candidate = String(value || '').trim();
  return /^\d{17,20}$/.test(candidate) ? candidate : null;
}

function normalizeDate(value) {
  const date = new Date(value || '');
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normalizeText(value, maximumLength) {
  return String(value || '').trim().slice(0, maximumLength);
}

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

module.exports = {
  activateEmergencySafetyProfile,
  addQuarantineReviewNote,
  bulkReleaseQuarantineReviews,
  evaluateProtectionJoin,
  evaluateProtectionMessage,
  getProtectionOverview,
  getProtectionStorageInfo,
  getEmergencyProfiles,
  loadProtectionStore,
  processEmergencyExpiration,
  processNativeAutoModerationExecution,
  queueNativeAutoModerationExecution,
  recordQuarantineReview,
  recordProtectionIncident,
  resolveQuarantineReview,
  restoreEmergencySafetyProfile,
  saveProtectionSettings,
  setRaidMode,
  syncNativeAutoModerationRules,
};
