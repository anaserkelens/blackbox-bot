const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');

const defaultActivityFeedPath = path.join(__dirname, '..', 'data', 'activity-feed.json');
const allowedTypes = new Set(['join', 'moderation', 'mailbox', 'voice', 'bot']);
let mutationQueue = Promise.resolve();

function getActivityFeedStorageInfo(config) {
  if (config.dashboard.activityPath) {
    return {
      filePath: config.dashboard.activityPath,
      persistent: true,
      source: 'DASHBOARD_ACTIVITY_PATH',
    };
  }

  if (config.dashboard.railwayVolumeMountPath) {
    return {
      filePath: path.join(config.dashboard.railwayVolumeMountPath, 'activity-feed.json'),
      persistent: true,
      source: 'RAILWAY_VOLUME_MOUNT_PATH',
    };
  }

  if (config.dashboard.savedMessagesPath) {
    return {
      filePath: path.join(path.dirname(config.dashboard.savedMessagesPath), 'activity-feed.json'),
      persistent: true,
      source: 'DASHBOARD_SAVED_MESSAGES_PATH directory',
    };
  }

  return {
    filePath: defaultActivityFeedPath,
    persistent: false,
    source: 'app filesystem',
  };
}

async function recordActivity(config, input) {
  return mutateActivityFeed(config, (store) => {
    const item = normalizeActivity(input);

    if (!item) {
      return null;
    }

    store.items.unshift(item);
    store.items = store.items.slice(0, 250);
    return item;
  });
}

async function getActivityFeed(config, options = {}) {
  const store = await readActivityFeed(config);
  const type = allowedTypes.has(options.type) ? options.type : null;
  const limit = clampInteger(options.limit, 1, 250, 100);
  const items = type
    ? store.items.filter((item) => item.type === type)
    : store.items;

  return items.slice(0, limit);
}

async function mutateActivityFeed(config, mutator) {
  const task = mutationQueue.then(async () => {
    const store = await readActivityFeed(config);
    const result = await mutator(store);

    await writeActivityFeed(config, store);
    return result;
  });

  mutationQueue = task.catch(() => null);
  return task;
}

async function readActivityFeed(config) {
  const { filePath } = getActivityFeedStorageInfo(config);
  let parsed;

  try {
    parsed = JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  return {
    version: 1,
    items: Array.isArray(parsed?.items)
      ? parsed.items.map(normalizeStoredActivity).filter(Boolean).slice(0, 250)
      : [],
  };
}

async function writeActivityFeed(config, store) {
  const { filePath } = getActivityFeedStorageInfo(config);
  const temporaryPath = `${filePath}.${process.pid}.tmp`;

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(temporaryPath, JSON.stringify(store, null, 2));
  await fs.rename(temporaryPath, filePath);
}

function normalizeActivity(input) {
  const source = input && typeof input === 'object' ? input : {};
  const title = normalizeText(source.title, 160);

  if (!title) {
    return null;
  }

  return {
    id: crypto.randomUUID(),
    type: allowedTypes.has(source.type) ? source.type : 'bot',
    title,
    summary: normalizeText(source.summary, 500),
    referenceId: normalizeText(source.referenceId, 160),
    createdAt: normalizeDate(source.createdAt) || new Date().toISOString(),
    details: Array.isArray(source.details)
      ? source.details
        .slice(0, 4)
        .map((detail) => normalizeText(detail, 200))
        .filter(Boolean)
      : [],
  };
}

function normalizeStoredActivity(input) {
  const normalized = normalizeActivity(input);

  if (!normalized) {
    return null;
  }

  normalized.id = normalizeText(input.id, 100) || normalized.id;
  return normalized;
}

function inferActivityType(options = {}) {
  const reference = String(options.referenceId || '').toUpperCase();
  const title = String(options.title || '').toLowerCase();

  if (reference.startsWith('JOIN-') || title.includes('member joined')) {
    return 'join';
  }

  if (
    reference.startsWith('CASE-')
    || title.includes('moderation')
    || /\b(warn|warning|timeout|kick|ban|case|revocation|reason corrected)\b/.test(title)
  ) {
    return 'moderation';
  }

  if (reference.includes('MAILBOX') || title.includes('mailbox')) {
    return 'mailbox';
  }

  if (reference.includes('TEMP-VOICE') || title.includes('temporary voice')) {
    return 'voice';
  }

  return 'bot';
}

function activityFromStructuredLog(options = {}) {
  return {
    type: inferActivityType(options),
    title: options.title,
    summary: stripDiscordFormatting(options.summary),
    referenceId: options.referenceId,
    createdAt: options.timestamp instanceof Date ? options.timestamp.toISOString() : undefined,
    details: (options.fields || []).slice(0, 3).map((field) =>
      `${field.name}: ${stripDiscordFormatting(field.value)}`),
  };
}

function stripDiscordFormatting(value) {
  return String(value || '')
    .replace(/<@!?(\d+)>/g, 'Member $1')
    .replace(/<#(\d+)>/g, 'Channel $1')
    .replace(/<@&(\d+)>/g, 'Role $1')
    .replace(/[*_`~>|#-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeText(value, maximumLength) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.slice(0, maximumLength);
}

function normalizeDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function clampInteger(value, minimum, maximum, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed)
    ? Math.min(maximum, Math.max(minimum, parsed))
    : fallback;
}

module.exports = {
  activityFromStructuredLog,
  getActivityFeed,
  getActivityFeedStorageInfo,
  inferActivityType,
  recordActivity,
};
