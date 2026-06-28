const fs = require('node:fs/promises');
const path = require('node:path');

const defaultPresenceSettingsPath = path.join(__dirname, '..', 'data', 'presence.json');
const allowedPresenceStatuses = new Set(['online', 'idle', 'dnd', 'invisible']);
const allowedActivityTypes = ['Playing', 'Streaming', 'Listening', 'Watching', 'Competing'];

function createDefaultPresenceSettings(config) {
  return {
    status: 'online',
    activityType: 'Watching',
    activityNames: [...config.presenceTexts],
    activityUrl: '',
    intervalSeconds: config.presenceRotationSeconds,
  };
}

function normalizePresenceSettings(input, defaults) {
  const source = input && typeof input === 'object' ? input : {};
  const fallback = defaults && typeof defaults === 'object' ? defaults : {};
  const status = String(source.status ?? fallback.status ?? 'online').trim().toLowerCase();
  const activityType = normalizeActivityType(source.activityType ?? fallback.activityType);
  const rawActivityNames = getRawActivityNames(source, fallback);
  const activityNames = rawActivityNames.map((name) => String(name || '').trim()).filter(Boolean);
  const activityUrl = String(source.activityUrl ?? fallback.activityUrl ?? '').trim();
  const intervalSeconds = Number.parseInt(source.intervalSeconds ?? fallback.intervalSeconds ?? 30, 10);

  if (!allowedPresenceStatuses.has(status)) {
    throw new Error('Status must be online, idle, dnd, or invisible.');
  }

  if (activityNames.length > 25) {
    throw new Error('You can rotate up to 25 activity texts.');
  }

  if (activityNames.some((name) => name.length > 128)) {
    throw new Error('Each activity text must be 128 characters or fewer.');
  }

  if (!Number.isInteger(intervalSeconds) || intervalSeconds < 5 || intervalSeconds > 86400) {
    throw new Error('Rotation interval must be between 5 and 86400 seconds.');
  }

  if (activityType === 'Streaming') {
    if (activityNames.length === 0) {
      throw new Error('Streaming presence needs at least one activity text.');
    }

    assertHttpUrl(activityUrl, 'Streaming URL');
  }

  return {
    status,
    activityType,
    activityNames,
    activityUrl: activityType === 'Streaming' ? activityUrl : '',
    intervalSeconds,
  };
}

function getRawActivityNames(source, fallback) {
  if (Array.isArray(source.activityNames)) {
    return source.activityNames;
  }

  if (source.activityName !== undefined) {
    return [source.activityName];
  }

  return Array.isArray(fallback.activityNames) ? fallback.activityNames : [];
}

function normalizeActivityType(value) {
  const normalized = String(value || 'Watching').trim().toLowerCase();
  const match = allowedActivityTypes.find((type) => type.toLowerCase() === normalized);

  if (!match) {
    throw new Error('Activity type must be Playing, Watching, Listening, Competing, or Streaming.');
  }

  return match;
}

async function loadPresenceSettings(config) {
  const defaults = createDefaultPresenceSettings(config);
  const { filePath } = getPresenceSettingsStorageInfo(config);
  let raw;

  try {
    raw = await fs.readFile(filePath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      return defaults;
    }

    throw error;
  }

  return normalizePresenceSettings(JSON.parse(raw), defaults);
}

async function savePresenceSettings(config, presence) {
  const settings = normalizePresenceSettings(presence, createDefaultPresenceSettings(config));
  const { filePath } = getPresenceSettingsStorageInfo(config);
  const temporaryPath = `${filePath}.${process.pid}.tmp`;

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(temporaryPath, JSON.stringify(settings, null, 2));
  await fs.rename(temporaryPath, filePath);

  return settings;
}

function getPresenceSettingsStorageInfo(config) {
  if (config.dashboard.presencePath) {
    return {
      filePath: config.dashboard.presencePath,
      persistent: true,
      source: 'DASHBOARD_PRESENCE_PATH',
    };
  }

  if (config.dashboard.railwayVolumeMountPath) {
    return {
      filePath: path.join(config.dashboard.railwayVolumeMountPath, 'presence.json'),
      persistent: true,
      source: 'RAILWAY_VOLUME_MOUNT_PATH',
    };
  }

  if (config.dashboard.savedMessagesPath) {
    return {
      filePath: path.join(path.dirname(config.dashboard.savedMessagesPath), 'presence.json'),
      persistent: true,
      source: 'DASHBOARD_SAVED_MESSAGES_PATH directory',
    };
  }

  return {
    filePath: defaultPresenceSettingsPath,
    persistent: false,
    source: 'app filesystem',
  };
}

function assertHttpUrl(value, label) {
  let url;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} must be a valid URL.`);
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`${label} must start with http or https.`);
  }
}

module.exports = {
  createDefaultPresenceSettings,
  getPresenceSettingsStorageInfo,
  loadPresenceSettings,
  normalizePresenceSettings,
  savePresenceSettings,
};
