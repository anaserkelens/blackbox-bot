const fs = require('node:fs/promises');
const path = require('node:path');

const defaultWelcomeEmbedPath = path.join(__dirname, '..', 'data', 'welcome-embed.json');

function createDefaultWelcomeEmbedSettings(config) {
  return {
    channelId: config.channels.welcome || '1520407983354544171',
    color: '#2DD4BF',
    image: null,
    blocks: [
      {
        type: 'text',
        content: '# Welcome to {serverName}!\n\nHey {member}, we’re glad you’re here. You are member **#{memberCount}**.',
        accessory: null,
      },
    ],
    buttons: [],
    allowMentions: true,
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

  return normalizeWelcomeEmbedSettings(JSON.parse(raw), defaults);
}

async function saveWelcomeEmbedSettings(config, input) {
  const settings = normalizeWelcomeEmbedSettings(input, createDefaultWelcomeEmbedSettings(config));
  const { filePath } = getWelcomeEmbedStorageInfo(config);
  const temporaryPath = `${filePath}.${process.pid}.tmp`;

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(temporaryPath, JSON.stringify(settings, null, 2));
  await fs.rename(temporaryPath, filePath);

  return settings;
}

function normalizeWelcomeEmbedSettings(input, defaults) {
  const source = migrateLegacyWelcomeSettings(input);
  const fallback = defaults || createDefaultWelcomeEmbedSettings({ channels: {} });
  const blocks = normalizeBlocks(source.blocks ?? fallback.blocks);
  const buttons = normalizeButtons(source.buttons ?? fallback.buttons);

  if (blocks.length > 24) {
    throw new Error('Use 24 welcome content blocks or fewer.');
  }

  if (buttons.length > 5) {
    throw new Error('Use 5 welcome buttons or fewer.');
  }

  return {
    channelId: normalizeChannelId(source.channelId ?? fallback.channelId),
    color: normalizeColor(source.color ?? fallback.color),
    image: normalizeImage(source.image ?? fallback.image),
    blocks,
    buttons,
    allowMentions:
      source.allowMentions === undefined ? Boolean(fallback.allowMentions) : Boolean(source.allowMentions),
  };
}

function migrateLegacyWelcomeSettings(input) {
  if (!input || typeof input !== 'object' || !input.embed || Array.isArray(input.blocks)) {
    return input && typeof input === 'object' ? input : {};
  }

  const embed = input.embed || {};
  const blocks = [];

  if (input.content) {
    blocks.push({ type: 'text', content: input.content, accessory: null });
  }

  if (embed.authorName) {
    blocks.push({ type: 'text', content: `**${embed.authorName}**`, accessory: null });
  }

  if (embed.title) {
    const title = embed.titleUrl ? `# [${embed.title}](${embed.titleUrl})` : `# ${embed.title}`;
    blocks.push({ type: 'text', content: title, accessory: null });
  }

  if (embed.description) {
    blocks.push({ type: 'text', content: embed.description, accessory: null });
  }

  for (const field of Array.isArray(embed.fields) ? embed.fields : []) {
    if (field.type === 'divider' || field.type === 'spacer') {
      blocks.push({ type: field.type, spacing: field.spacing });
      continue;
    }

    const name = String(field.name || '').trim();
    const value = String(field.value || '').trim();

    if (name || value) {
      blocks.push({
        type: 'text',
        content: `${name ? `**${name}**\n` : ''}${value}`,
        accessory: null,
      });
    }
  }

  if (embed.footerText) {
    blocks.push({ type: 'text', content: `-# ${embed.footerText}`, accessory: null });
  }

  return {
    channelId: input.channelId,
    color: embed.color,
    image: null,
    blocks,
    buttons: input.buttons,
    allowMentions: true,
  };
}

function normalizeBlocks(blocks) {
  if (!Array.isArray(blocks)) {
    return [];
  }

  return blocks
    .map((block) => {
      const type = String(block?.type || '').toLowerCase();

      if (type === 'text') {
        return {
          type,
          content: sanitizeText(block.content, 4000),
          accessory: normalizeButton(block.accessory),
        };
      }

      if (type === 'divider' || type === 'spacer') {
        return {
          type,
          spacing: normalizeSpacing(block.spacing),
        };
      }

      return null;
    })
    .filter((block) => block && (block.type !== 'text' || block.content || block.accessory));
}

function normalizeButtons(buttons) {
  if (!Array.isArray(buttons)) {
    return [];
  }

  return buttons
    .map(normalizeButton)
    .filter(Boolean);
}

function normalizeButton(button) {
  if (!button || typeof button !== 'object') {
    return null;
  }

  const normalized = {
    label: sanitizeText(button.label, 80),
    url: sanitizeText(button.url, 512),
    emoji: sanitizeText(button.emoji, 100),
  };

  return normalized.label || normalized.url || normalized.emoji ? normalized : null;
}

function normalizeImage(image) {
  if (!image || typeof image !== 'object' || typeof image.dataUrl !== 'string') {
    return null;
  }

  return {
    name: sanitizeText(image.name || 'welcome-image', 120),
    dataUrl: image.dataUrl,
  };
}

function normalizeChannelId(value) {
  const channelId = sanitizeText(value, 20);

  if (!/^\d{17,20}$/.test(channelId)) {
    throw new Error('Welcome channel ID must be a valid Discord channel ID.');
  }

  return channelId;
}

function normalizeColor(value) {
  if (value === null || value === undefined || String(value).trim() === '') {
    return null;
  }

  const normalized = String(value).trim().replace(/^#/, '');

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    throw new Error('Welcome color must be a 6-digit hex color, such as #2DD4BF.');
  }

  return `#${normalized.toUpperCase()}`;
}

function normalizeSpacing(value) {
  return String(value || '').toLowerCase() === 'large' ? 'large' : 'small';
}

function sanitizeText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
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
  normalizeWelcomeEmbedSettings,
  saveWelcomeEmbedSettings,
};
