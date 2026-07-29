const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');

const {
  AutoModerationActionType,
  AutoModerationRuleEventType,
  AutoModerationRuleTriggerType,
  PermissionFlagsBits,
} = require('discord.js');

const {
  formatCaseReference,
  recordModerationCase,
  reserveModerationCaseNumber,
} = require('./moderationCases');
const {
  prepareDirectMessage,
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
const messageWindows = new Map();
const joinWindows = new Map();
const enforcementCooldowns = new Map();
const raidAlertCooldowns = new Map();
const pendingNativeExecutions = new Map();
const processedNativeExecutions = new Map();
const storeCache = new Map();
let mutationQueue = Promise.resolve();
let lastTrackerPruneAt = 0;

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
    raid: store.raid,
    incidents: store.incidents.slice(0, 100),
    metrics: {
      incidents24h: recent.length,
      native24h: recent.filter((incident) => incident.source === 'discord-automod').length,
      custom24h: recent.filter((incident) => incident.source === 'bean').length,
      quarantined24h: recent.filter((incident) => incident.type === 'member_quarantined').length,
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
  const settings = store.settings;
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
  const settings = store.settings;
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
  const settings = store.settings;
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
  }, config).catch((error) => console.error('Failed to log quarantine:', error));

  return { status: 'quarantined', incident };
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

  if (!store.settings.nativeLoggingEnabled) {
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
  const settings = store.settings;
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
    version: 1,
    settings: normalizeSettings(source.settings, config),
    raid: normalizeRaid(source.raid),
    incidents: Array.isArray(source.incidents)
      ? source.incidents.map(normalizeIncident).filter(Boolean).slice(0, maximumIncidents)
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
  evaluateProtectionJoin,
  evaluateProtectionMessage,
  getProtectionOverview,
  getProtectionStorageInfo,
  loadProtectionStore,
  processNativeAutoModerationExecution,
  queueNativeAutoModerationExecution,
  recordProtectionIncident,
  saveProtectionSettings,
  setRaidMode,
  syncNativeAutoModerationRules,
};
