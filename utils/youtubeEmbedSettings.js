const fs = require('node:fs/promises');
const path = require('node:path');

const { normalizeStreamEmbedSettings } = require('./streamEmbedSettings');

const defaultYouTubeEmbedPath = path.join(__dirname, '..', 'data', 'youtube-embed.json');

function createDefaultYouTubeEmbedSettings(config) {
  return {
    channelId: config.channels.youtubeAnnouncements || config.channels.streamAnnouncements || '',
    content: config.roles.newUpload ? `<@&${config.roles.newUpload}>` : '',
    buttons: [
      {
        label: 'Watch on YouTube',
        url: '{videoUrl}',
        emoji: '<:corneryoutube:1531771043675504780>',
      },
    ],
    embed: {
      title: '',
      titleUrl: '',
      description: '# **{member} just uploaded "{videoTitle}".**',
      color: '#FF0000',
      authorName: '',
      authorUrl: '',
      authorIconUrl: '',
      thumbnailUrl: '',
      imageUrl: '{thumbnailUrl}',
      footerText: '',
      footerIconUrl: '',
      timestamp: false,
      fields: [],
    },
  };
}

function normalizeYouTubeEmbedSettings(input, defaults) {
  return normalizeStreamEmbedSettings(input, defaults);
}

async function loadYouTubeEmbedSettings(config) {
  const defaults = createDefaultYouTubeEmbedSettings(config);
  const { filePath } = getYouTubeEmbedStorageInfo(config);
  let raw;

  try {
    raw = await fs.readFile(filePath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      return defaults;
    }

    throw error;
  }

  return normalizeYouTubeEmbedSettings(JSON.parse(raw), defaults);
}

async function saveYouTubeEmbedSettings(config, input) {
  const settings = normalizeYouTubeEmbedSettings(
    input,
    createDefaultYouTubeEmbedSettings(config),
  );
  const { filePath } = getYouTubeEmbedStorageInfo(config);
  const temporaryPath = `${filePath}.${process.pid}.tmp`;

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(temporaryPath, JSON.stringify(settings, null, 2));
  await fs.rename(temporaryPath, filePath);

  return settings;
}

async function getYouTubeEmbedStorageStatus(config) {
  const storage = getYouTubeEmbedStorageInfo(config);
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

function getYouTubeEmbedStorageInfo(config) {
  if (config.dashboard.youtubeEmbedPath) {
    return {
      filePath: config.dashboard.youtubeEmbedPath,
      persistent: true,
      source: 'DASHBOARD_YOUTUBE_EMBED_PATH',
    };
  }

  if (config.dashboard.railwayVolumeMountPath) {
    return {
      filePath: path.join(config.dashboard.railwayVolumeMountPath, 'youtube-embed.json'),
      persistent: true,
      source: 'RAILWAY_VOLUME_MOUNT_PATH',
    };
  }

  if (config.dashboard.savedMessagesPath) {
    return {
      filePath: path.join(path.dirname(config.dashboard.savedMessagesPath), 'youtube-embed.json'),
      persistent: true,
      source: 'DASHBOARD_SAVED_MESSAGES_PATH directory',
    };
  }

  return {
    filePath: defaultYouTubeEmbedPath,
    persistent: false,
    source: 'app filesystem',
  };
}

module.exports = {
  createDefaultYouTubeEmbedSettings,
  getYouTubeEmbedStorageInfo,
  getYouTubeEmbedStorageStatus,
  loadYouTubeEmbedSettings,
  normalizeYouTubeEmbedSettings,
  saveYouTubeEmbedSettings,
};
