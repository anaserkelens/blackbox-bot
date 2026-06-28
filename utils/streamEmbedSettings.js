const fs = require('node:fs/promises');
const path = require('node:path');

const defaultStreamEmbedPath = path.join(__dirname, '..', 'data', 'stream-embed.json');

function createDefaultStreamEmbedSettings(config) {
  return {
    channelId: config.channels.streamAnnouncements || '',
    content: '',
    buttons: [],
    embed: {
      title: '',
      titleUrl: '',
      description: '# **{member} is now live!**\n\n-# {streamTitle}\n\n-# [Watch Stream]({streamUrl})',
      color: '#2DD4BF',
      authorName: '',
      authorUrl: '',
      authorIconUrl: '',
      thumbnailUrl: '',
      imageUrl: '{previewUrl}',
      footerText: '',
      footerIconUrl: '',
      timestamp: false,
      fields: [],
    },
  };
}

function normalizeStreamEmbedSettings(input, defaults) {
  const source = input && typeof input === 'object' ? input : {};
  const fallback = defaults && typeof defaults === 'object' ? defaults : {};
  const sourceEmbed = source.embed && typeof source.embed === 'object' ? source.embed : {};
  const fallbackEmbed = fallback.embed && typeof fallback.embed === 'object' ? fallback.embed : {};
  const channelId = normalizeText(source.channelId ?? fallback.channelId, 24);
  const content = normalizeText(source.content ?? fallback.content, 2000);
  const fields = normalizeEmbedBlocks(sourceEmbed.fields ?? fallbackEmbed.fields);
  const buttons = normalizeButtons(source.buttons ?? fallback.buttons);
  const embed = {
    title: normalizeText(sourceEmbed.title ?? fallbackEmbed.title, 256),
    titleUrl: normalizeText(sourceEmbed.titleUrl ?? fallbackEmbed.titleUrl, 2048),
    description: normalizeText(sourceEmbed.description ?? fallbackEmbed.description, 4096),
    color: normalizeColor(sourceEmbed.color ?? fallbackEmbed.color),
    authorName: normalizeText(sourceEmbed.authorName ?? fallbackEmbed.authorName, 256),
    authorUrl: normalizeText(sourceEmbed.authorUrl ?? fallbackEmbed.authorUrl, 2048),
    authorIconUrl: normalizeText(sourceEmbed.authorIconUrl ?? fallbackEmbed.authorIconUrl, 2048),
    thumbnailUrl: normalizeText(sourceEmbed.thumbnailUrl ?? fallbackEmbed.thumbnailUrl, 2048),
    imageUrl: normalizeText(sourceEmbed.imageUrl ?? fallbackEmbed.imageUrl, 2048),
    footerText: normalizeText(sourceEmbed.footerText ?? fallbackEmbed.footerText, 2048),
    footerIconUrl: normalizeText(sourceEmbed.footerIconUrl ?? fallbackEmbed.footerIconUrl, 2048),
    timestamp: Boolean(sourceEmbed.timestamp ?? fallbackEmbed.timestamp),
    fields,
  };

  if (channelId && !/^\d{17,20}$/.test(channelId)) {
    throw new Error('Announcement channel ID must be a Discord snowflake.');
  }

  if (!content && !hasEmbedContent(embed) && buttons.length === 0) {
    throw new Error('Add message content, an embed element, or a button.');
  }

  return {
    channelId,
    content,
    buttons,
    embed,
  };
}

function normalizeEmbedBlocks(blocks) {
  if (!Array.isArray(blocks)) {
    return [];
  }

  if (blocks.length > 25) {
    throw new Error('Live embeds can contain up to 25 fields and layout blocks.');
  }

  return blocks.map((block, index) => {
    const type = String(block?.type || 'field').trim().toLowerCase();

    if (type === 'divider' || type === 'spacer') {
      return {
        type,
        spacing: String(block.spacing || '').toLowerCase() === 'large' ? 'large' : 'small',
      };
    }

    const name = normalizeText(block?.name, 256);
    const value = normalizeText(block?.value, 1024);

    if (!name || !value) {
      throw new Error(`Live embed field ${index + 1} needs both a name and value.`);
    }

    return {
      type: 'field',
      name,
      value,
      inline: Boolean(block?.inline),
    };
  });
}

function normalizeButtons(buttons) {
  if (!Array.isArray(buttons)) {
    return [];
  }

  if (buttons.length > 5) {
    throw new Error('Live announcements can contain up to 5 link buttons.');
  }

  return buttons.map((button, index) => {
    const label = normalizeText(button?.label, 80);
    const url = normalizeText(button?.url, 512);
    const emoji = normalizeText(button?.emoji, 100);

    if (!label || !url) {
      throw new Error(`Live announcement button ${index + 1} needs both a label and URL.`);
    }

    return { label, url, emoji };
  });
}

function normalizeColor(value) {
  if (value === null || value === undefined || String(value).trim() === '') {
    return null;
  }

  const normalized = String(value).trim().replace(/^#/, '');

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    throw new Error('Live embed color must be a 6-digit hex color.');
  }

  return `#${normalized.toUpperCase()}`;
}

function normalizeText(value, maxLength) {
  const text = String(value || '').trim();

  if (text.length > maxLength) {
    throw new Error(`Live embed text exceeds the ${maxLength}-character limit.`);
  }

  return text;
}

function hasEmbedContent(embed) {
  return Boolean(
    embed.title ||
      embed.description ||
      embed.authorName ||
      embed.thumbnailUrl ||
      embed.imageUrl ||
      embed.footerText ||
      embed.fields.length,
  );
}

async function loadStreamEmbedSettings(config) {
  const defaults = createDefaultStreamEmbedSettings(config);
  const { filePath } = getStreamEmbedStorageInfo(config);
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

async function saveStreamEmbedSettings(config, input) {
  const settings = normalizeStreamEmbedSettings(input, createDefaultStreamEmbedSettings(config));
  const { filePath } = getStreamEmbedStorageInfo(config);
  const temporaryPath = `${filePath}.${process.pid}.tmp`;

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(temporaryPath, JSON.stringify(settings, null, 2));
  await fs.rename(temporaryPath, filePath);

  return settings;
}

async function getStreamEmbedStorageStatus(config) {
  const storage = getStreamEmbedStorageInfo(config);
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

function getStreamEmbedStorageInfo(config) {
  if (config.dashboard.streamEmbedPath) {
    return {
      filePath: config.dashboard.streamEmbedPath,
      persistent: true,
      source: 'DASHBOARD_STREAM_EMBED_PATH',
    };
  }

  if (config.dashboard.railwayVolumeMountPath) {
    return {
      filePath: path.join(config.dashboard.railwayVolumeMountPath, 'stream-embed.json'),
      persistent: true,
      source: 'RAILWAY_VOLUME_MOUNT_PATH',
    };
  }

  if (config.dashboard.savedMessagesPath) {
    return {
      filePath: path.join(path.dirname(config.dashboard.savedMessagesPath), 'stream-embed.json'),
      persistent: true,
      source: 'DASHBOARD_SAVED_MESSAGES_PATH directory',
    };
  }

  return {
    filePath: defaultStreamEmbedPath,
    persistent: false,
    source: 'app filesystem',
  };
}

module.exports = {
  createDefaultStreamEmbedSettings,
  getStreamEmbedStorageInfo,
  getStreamEmbedStorageStatus,
  loadStreamEmbedSettings,
  normalizeStreamEmbedSettings,
  saveStreamEmbedSettings,
};
