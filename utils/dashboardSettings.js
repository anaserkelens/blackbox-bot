const fs = require('node:fs');
const path = require('node:path');

const settingsFileName = 'dashboard-settings.json';
const channelKeys = [
  'tickets',
  'ticketLogs',
  'caseFiles',
  'entryLog',
  'signalLog',
  'lineLog',
  'operationLog',
  'systemLog',
  'mailbox',
];
const legacyFeatureChannelKeys = [
  'welcome',
  'streamAnnouncements',
  'youtubeAnnouncements',
  'tempVoiceTrigger',
];
const roleKeys = [
  'founder',
  'staff',
  'moderator',
  'live',
  'newUpload',
];
const featureKeys = [
  'welcomeMessages',
  'inviteModeration',
  'streamMonitor',
  'youtubeMonitor',
  'temporaryVoice',
  'tickets',
  'reactionRoles',
  'detailedLogging',
];

function initializeDashboardSettings(config) {
  const storage = getDashboardSettingsStorageInfo(config);
  let saved = null;

  try {
    if (fs.existsSync(storage.filePath)) {
      saved = JSON.parse(fs.readFileSync(storage.filePath, 'utf8'));
    }
  } catch (error) {
    console.error(`Failed to load dashboard configuration from ${storage.filePath}:`, error);
  }

  applyLegacyFeatureChannelFallbacks(config, saved);
  const settings = normalizeDashboardSettings(saved, config);
  applyDashboardSettings(config, settings);
  return settings;
}

async function loadDashboardSettings(config) {
  const storage = getDashboardSettingsStorageInfo(config);

  try {
    const contents = await fs.promises.readFile(storage.filePath, 'utf8');
    const settings = normalizeDashboardSettings(JSON.parse(contents), config);
    applyDashboardSettings(config, settings);
    return settings;
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }

    return normalizeDashboardSettings(null, config);
  }
}

async function saveDashboardSettings(config, input, actor = null) {
  const storage = getDashboardSettingsStorageInfo(config);
  const previous = await loadDashboardSettings(config);
  const settings = normalizeDashboardSettings(input, config);
  const auditEntry = createAuditEntry(previous, settings, actor);

  settings.updatedAt = new Date().toISOString();
  settings.updatedBy = normalizeActor(actor);
  settings.audit = [
    ...(auditEntry ? [auditEntry] : []),
    ...(Array.isArray(previous.audit) ? previous.audit : []),
  ].slice(0, 100);

  await fs.promises.mkdir(path.dirname(storage.filePath), { recursive: true });
  const temporaryPath = `${storage.filePath}.${process.pid}.${Date.now()}.tmp`;
  await fs.promises.writeFile(temporaryPath, `${JSON.stringify(settings, null, 2)}\n`, 'utf8');
  await fs.promises.rename(temporaryPath, storage.filePath);
  applyDashboardSettings(config, settings);
  return settings;
}

function normalizeDashboardSettings(input, config) {
  const source = input && typeof input === 'object' ? input : {};
  const channels = {};
  const roles = {};
  const features = {};

  for (const key of channelKeys) {
    channels[key] = normalizeSnowflake(source.channels?.[key], config.channels?.[key]);
  }

  for (const key of roleKeys) {
    roles[key] = normalizeSnowflake(source.roles?.[key], config.roles?.[key]);
  }

  const defaults = getFeatureDefaults(config);

  for (const key of featureKeys) {
    features[key] = typeof source.features?.[key] === 'boolean'
      ? source.features[key]
      : defaults[key];
  }

  return {
    version: 1,
    channels,
    roles,
    features,
    updatedAt: normalizeDate(source.updatedAt),
    updatedBy: normalizeActor(source.updatedBy),
    audit: normalizeAudit(source.audit),
  };
}

function applyDashboardSettings(config, settings) {
  Object.assign(config.channels, settings.channels);
  Object.assign(config.roles, settings.roles);
  config.invites.enabled = settings.features.inviteModeration;
  config.streamMonitor.enabled = settings.features.streamMonitor;
  config.youtubeMonitor.enabled = settings.features.youtubeMonitor;
  config.dashboard.features = { ...settings.features };
}

function applyLegacyFeatureChannelFallbacks(config, saved) {
  for (const key of legacyFeatureChannelKeys) {
    const value = normalizeSnowflake(saved?.channels?.[key], null);

    if (value) {
      config.channels[key] = value;
    }
  }
}

function getFeatureDefaults(config) {
  return {
    welcomeMessages: Boolean(config.intents?.members && config.channels?.welcome),
    inviteModeration: Boolean(config.invites?.enabled),
    streamMonitor: Boolean(config.streamMonitor?.enabled),
    youtubeMonitor: Boolean(config.youtubeMonitor?.enabled),
    temporaryVoice: Boolean(config.channels?.tempVoiceTrigger),
    tickets: Boolean(config.channels?.tickets),
    reactionRoles: Boolean(
      config.legacyReactionRole?.messageId
      && config.legacyReactionRole?.channelId
      && config.legacyReactionRole?.emojiId
      && config.legacyReactionRole?.roleId
    ),
    detailedLogging: true,
  };
}

function getDashboardSettingsStorageInfo(config) {
  if (config.dashboard?.settingsPath) {
    return {
      filePath: path.resolve(config.dashboard.settingsPath),
      persistent: true,
      source: 'DASHBOARD_SETTINGS_PATH',
    };
  }

  if (config.dashboard?.railwayVolumeMountPath) {
    return {
      filePath: path.join(config.dashboard.railwayVolumeMountPath, settingsFileName),
      persistent: true,
      source: 'RAILWAY_VOLUME_MOUNT_PATH',
    };
  }

  return {
    filePath: path.join(__dirname, '..', 'data', settingsFileName),
    persistent: false,
    source: 'local data directory',
  };
}

function createAuditEntry(previous, next, actor) {
  const changes = [];

  for (const group of ['channels', 'roles', 'features']) {
    for (const key of Object.keys(next[group])) {
      if (previous[group]?.[key] !== next[group][key]) {
        changes.push({
          group,
          key,
          before: previous[group]?.[key] ?? null,
          after: next[group][key] ?? null,
        });
      }
    }
  }

  if (changes.length === 0) {
    return null;
  }

  return {
    id: `CONFIG-${Date.now()}`,
    createdAt: new Date().toISOString(),
    actor: normalizeActor(actor),
    changes,
  };
}

function normalizeAudit(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((entry) => entry && typeof entry === 'object' && Array.isArray(entry.changes))
    .slice(0, 100)
    .map((entry) => ({
      id: String(entry.id || `CONFIG-${Date.now()}`),
      createdAt: normalizeDate(entry.createdAt) || new Date().toISOString(),
      actor: normalizeActor(entry.actor),
      changes: entry.changes.slice(0, 50).map((change) => ({
        group: String(change.group || ''),
        key: String(change.key || ''),
        before: change.before ?? null,
        after: change.after ?? null,
      })),
    }));
}

function normalizeActor(actor) {
  if (!actor || typeof actor !== 'object') {
    return null;
  }

  return {
    id: String(actor.id || ''),
    displayName: String(actor.displayName || actor.username || 'Dashboard user').slice(0, 100),
    role: String(actor.role || 'founder').slice(0, 30),
    avatarUrl: actor.avatarUrl ? String(actor.avatarUrl) : null,
  };
}

function normalizeSnowflake(value, fallback) {
  const candidate = value === null || value === '' ? null : String(value || fallback || '').trim();
  return candidate && /^\d{17,20}$/.test(candidate) ? candidate : null;
}

function normalizeDate(value) {
  const date = new Date(value || '');
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

module.exports = {
  applyDashboardSettings,
  channelKeys,
  featureKeys,
  getDashboardSettingsStorageInfo,
  initializeDashboardSettings,
  loadDashboardSettings,
  normalizeDashboardSettings,
  roleKeys,
  saveDashboardSettings,
};
