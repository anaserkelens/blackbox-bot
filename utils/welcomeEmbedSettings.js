const fs = require('node:fs/promises');
const path = require('node:path');

const { normalizeStreamEmbedSettings } = require('./streamEmbedSettings');

const defaultWelcomeEmbedPath = path.join(__dirname, '..', 'data', 'welcome-embed.json');

function createDefaultWelcomeEmbedSettings(config) {
  return {
    channelId: config.channels.welcome || '1520407983354544171',
    content: '{member}',
    buttons: [],
    embed: {
      title: 'Welcome to {serverName}!',
      titleUrl: '',
      description: 'We’re glad you’re here. You are member **#{memberCount}**.',
      color: '#2DD4BF',
      authorName: '',
      authorUrl: '',
      authorIconUrl: '',
      thumbnailUrl: '{avatarUrl}',
      imageUrl: '',
      footerText: '',
      footerIconUrl: '',
      timestamp: true,
      fields: [],
    },
  };
}

async function loadWelcomeEmbedSettings(config) {
  const defaults = createDefaultWelcomeEmbedSettings(config);
  const { filePath } = getWelcomeEmbedStorageInfo(config);
  let raw;

  try {
    raw = await fs.readFile(filePath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      return defaults;
    }

    throw error;
  }

  return normalizeStreamEmbedSettings(JSON.parse(raw), defaults);
}

async function saveWelcomeEmbedSettings(config, input) {
  const settings = normalizeStreamEmbedSettings(input, createDefaultWelcomeEmbedSettings(config));
  const { filePath } = getWelcomeEmbedStorageInfo(config);
  const temporaryPath = `${filePath}.${process.pid}.tmp`;

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(temporaryPath, JSON.stringify(settings, null, 2));
  await fs.rename(temporaryPath, filePath);

  return settings;
}

async function getWelcomeEmbedStorageStatus(config) {
  const storage = getWelcomeEmbedStorageInfo(config);
  let hasSavedSettings = true;

  try {
    await fs.access(storage.filePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      hasSavedSettings = false;
    } else {
      throw error;
    }
  }

  return {
    ...storage,
    hasSavedSettings,
  };
}

function getWelcomeEmbedStorageInfo(config) {
  if (config.dashboard.welcomeEmbedPath) {
    return {
      filePath: config.dashboard.welcomeEmbedPath,
      persistent: true,
      source: 'DASHBOARD_WELCOME_EMBED_PATH',
    };
  }

  if (config.dashboard.railwayVolumeMountPath) {
    return {
      filePath: path.join(config.dashboard.railwayVolumeMountPath, 'welcome-embed.json'),
      persistent: true,
      source: 'RAILWAY_VOLUME_MOUNT_PATH',
    };
  }

  if (config.dashboard.savedMessagesPath) {
    return {
      filePath: path.join(path.dirname(config.dashboard.savedMessagesPath), 'welcome-embed.json'),
      persistent: true,
      source: 'DASHBOARD_SAVED_MESSAGES_PATH directory',
    };
  }

  return {
    filePath: defaultWelcomeEmbedPath,
    persistent: false,
    source: 'app filesystem',
  };
}

module.exports = {
  createDefaultWelcomeEmbedSettings,
  getWelcomeEmbedStorageInfo,
  getWelcomeEmbedStorageStatus,
  loadWelcomeEmbedSettings,
  saveWelcomeEmbedSettings,
};
