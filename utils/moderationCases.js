const fs = require('node:fs/promises');
const path = require('node:path');

const defaultModerationCasesPath = path.join(__dirname, '..', 'data', 'moderation-cases.json');
let mutationQueue = Promise.resolve();

async function reserveModerationCaseNumber(config) {
  return mutateCaseStore(config, (store) => {
    const number = store.nextCaseNumber;

    store.nextCaseNumber += 1;
    return number;
  });
}

async function recordModerationCase(config, input) {
  return mutateCaseStore(config, (store) => {
    const moderationCase = normalizeModerationCase(input);

    if (!moderationCase) {
      throw new Error('Moderation case data is invalid.');
    }

    if (store.cases.some((item) => item.number === moderationCase.number)) {
      throw new Error(`${formatCaseReference(moderationCase.number)} already exists.`);
    }

    store.cases.push(moderationCase);
    store.cases.sort((left, right) => left.number - right.number);
    store.nextCaseNumber = Math.max(store.nextCaseNumber, moderationCase.number + 1);
    return moderationCase;
  });
}

async function updateModerationCaseReason(config, number, reason, editor) {
  return mutateCaseStore(config, (store) => {
    const moderationCase = store.cases.find((item) => item.number === normalizeCaseNumber(number));

    if (!moderationCase) {
      return null;
    }

    const nextReason = normalizeText(reason, 1000);

    if (!nextReason) {
      throw new Error('A new case reason is required.');
    }

    if (nextReason === moderationCase.reason) {
      throw new Error('That is already the current case reason.');
    }

    const editedAt = new Date().toISOString();
    const historyEntry = {
      previousReason: moderationCase.reason,
      newReason: nextReason,
      editorId: normalizeSnowflake(editor?.id),
      editorTag: normalizeText(editor?.tag || editor?.username || 'Unknown moderator', 100),
      editedAt,
    };

    moderationCase.reasonHistory = [...moderationCase.reasonHistory, historyEntry].slice(-25);
    moderationCase.reason = nextReason;
    moderationCase.updatedAt = editedAt;
    return moderationCase;
  });
}

async function revokeModerationCase(config, number, reason, editor) {
  return mutateCaseStore(config, (store) => {
    const moderationCase = store.cases.find((item) => item.number === normalizeCaseNumber(number));

    if (!moderationCase) {
      return null;
    }

    if (moderationCase.status === 'revoked') {
      throw new Error(`${moderationCase.reference} is already revoked.`);
    }

    const revocationReason = normalizeText(reason, 1000);

    if (!revocationReason) {
      throw new Error('A revocation reason is required.');
    }

    const changedAt = new Date().toISOString();
    const historyEntry = {
      previousStatus: moderationCase.status,
      newStatus: 'revoked',
      reason: revocationReason,
      editorId: normalizeSnowflake(editor?.id),
      editorTag: normalizeText(editor?.tag || editor?.username || 'Dashboard operator', 100),
      changedAt,
    };

    moderationCase.statusHistory = [...moderationCase.statusHistory, historyEntry].slice(-25);
    moderationCase.status = 'revoked';
    moderationCase.updatedAt = changedAt;
    return moderationCase;
  });
}

async function getModerationCase(config, number, guildId) {
  const store = await loadModerationCaseStore(config);
  const normalizedNumber = normalizeCaseNumber(number);
  const normalizedGuildId = normalizeSnowflake(guildId);

  return store.cases.find(
    (item) => item.number === normalizedNumber && (!normalizedGuildId || item.guildId === normalizedGuildId),
  ) || null;
}

async function listModerationCases(config, guildId) {
  const store = await loadModerationCaseStore(config);
  const normalizedGuildId = normalizeSnowflake(guildId);

  return store.cases
    .filter((item) => !normalizedGuildId || item.guildId === normalizedGuildId)
    .sort((left, right) => right.number - left.number);
}

async function listMemberModerationCases(config, guildId, userId, limit = 10) {
  const store = await loadModerationCaseStore(config);
  const normalizedGuildId = normalizeSnowflake(guildId);
  const normalizedUserId = normalizeSnowflake(userId);
  const normalizedLimit = Math.min(25, Math.max(1, Number.parseInt(limit, 10) || 10));

  return store.cases
    .filter((item) => item.guildId === normalizedGuildId && item.userId === normalizedUserId)
    .sort((left, right) => right.number - left.number)
    .slice(0, normalizedLimit);
}

async function loadModerationCaseStore(config) {
  await mutationQueue.catch(() => null);
  return readCaseStore(getModerationCasesStorageInfo(config).filePath);
}

async function mutateCaseStore(config, mutator) {
  const operation = mutationQueue.then(async () => {
    const filePath = getModerationCasesStorageInfo(config).filePath;
    const store = await readCaseStore(filePath);
    const result = await mutator(store);

    await writeCaseStore(filePath, store);
    return clone(result);
  });

  mutationQueue = operation.catch(() => null);
  return operation;
}

async function readCaseStore(filePath) {
  let raw;

  try {
    raw = await fs.readFile(filePath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      return createEmptyStore();
    }

    throw error;
  }

  const parsed = JSON.parse(raw);
  const cases = Array.isArray(parsed) ? parsed : parsed.cases;
  const normalizedCases = Array.isArray(cases)
    ? cases.map(normalizeModerationCase).filter(Boolean)
    : [];
  const highestCaseNumber = normalizedCases.reduce(
    (highest, moderationCase) => Math.max(highest, moderationCase.number),
    0,
  );
  const requestedNextNumber = normalizeCaseNumber(parsed.nextCaseNumber);

  return {
    nextCaseNumber: Math.max(highestCaseNumber + 1, requestedNextNumber || 1),
    cases: normalizedCases.sort((left, right) => left.number - right.number),
  };
}

async function writeCaseStore(filePath, store) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  const body = JSON.stringify(store, null, 2);

  await fs.writeFile(temporaryPath, body);
  await fs.rename(temporaryPath, filePath);
}

function normalizeModerationCase(input) {
  if (!input || typeof input !== 'object') {
    return null;
  }

  const number = normalizeCaseNumber(input.number);
  const guildId = normalizeSnowflake(input.guildId);
  const userId = normalizeSnowflake(input.userId);
  const moderatorId = normalizeSnowflake(input.moderatorId);
  const action = normalizeAction(input.action);
  const reason = normalizeText(input.reason, 1000);

  if (!number || !guildId || !userId || !moderatorId || !action || !reason) {
    return null;
  }

  const createdAt = normalizeTimestamp(input.createdAt) || new Date().toISOString();
  const updatedAt = normalizeTimestamp(input.updatedAt) || createdAt;

  return {
    number,
    reference: formatCaseReference(number),
    guildId,
    action,
    userId,
    userTag: normalizeText(input.userTag || 'Unknown user', 100),
    moderatorId,
    moderatorTag: normalizeText(input.moderatorTag || 'Unknown moderator', 100),
    reason,
    status: normalizeStatus(input.status),
    durationMs: normalizePositiveInteger(input.durationMs),
    channelId: normalizeSnowflake(input.channelId),
    dmDelivered: normalizeNullableBoolean(input.dmDelivered),
    logDelivered: normalizeNullableBoolean(input.logDelivered),
    metadata: normalizeMetadata(input.metadata),
    reasonHistory: normalizeReasonHistory(input.reasonHistory),
    statusHistory: normalizeStatusHistory(input.statusHistory),
    createdAt,
    updatedAt,
  };
}

function normalizeStatusHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .map((entry) => ({
      previousStatus: normalizeStatus(entry?.previousStatus),
      newStatus: normalizeStatus(entry?.newStatus),
      reason: normalizeText(entry?.reason, 1000),
      editorId: normalizeSnowflake(entry?.editorId),
      editorTag: normalizeText(entry?.editorTag || 'Unknown moderator', 100),
      changedAt: normalizeTimestamp(entry?.changedAt) || new Date().toISOString(),
    }))
    .filter((entry) => entry.reason && entry.editorId)
    .slice(-25);
}

function normalizeReasonHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .map((entry) => ({
      previousReason: normalizeText(entry?.previousReason, 1000),
      newReason: normalizeText(entry?.newReason, 1000),
      editorId: normalizeSnowflake(entry?.editorId),
      editorTag: normalizeText(entry?.editorTag || 'Unknown moderator', 100),
      editedAt: normalizeTimestamp(entry?.editedAt) || new Date().toISOString(),
    }))
    .filter((entry) => entry.previousReason && entry.newReason && entry.editorId)
    .slice(-25);
}

function normalizeMetadata(metadata) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(metadata)
      .slice(0, 20)
      .map(([key, value]) => [
        normalizeText(key, 80),
        ['string', 'number', 'boolean'].includes(typeof value)
          ? (typeof value === 'string' ? normalizeText(value, 500) : value)
          : String(value ?? '').slice(0, 500),
      ])
      .filter(([key]) => key),
  );
}

function normalizeAction(value) {
  const action = String(value || '').trim().toLowerCase();

  return ['warn', 'timeout', 'kick', 'ban'].includes(action) ? action : '';
}

function normalizeStatus(value) {
  const status = String(value || '').trim().toLowerCase();

  return ['active', 'expired', 'revoked'].includes(status) ? status : 'active';
}

function normalizeCaseNumber(value) {
  const number = Number.parseInt(value, 10);

  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

function normalizePositiveInteger(value) {
  const number = Number.parseInt(value, 10);

  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

function normalizeSnowflake(value) {
  const snowflake = String(value || '').trim();

  return /^\d{17,20}$/.test(snowflake) ? snowflake : null;
}

function normalizeTimestamp(value) {
  const timestamp = new Date(value);

  return Number.isFinite(timestamp.getTime()) ? timestamp.toISOString() : null;
}

function normalizeNullableBoolean(value) {
  return value === true ? true : (value === false ? false : null);
}

function normalizeText(value, maximumLength) {
  return String(value || '').trim().slice(0, maximumLength);
}

function createEmptyStore() {
  return {
    nextCaseNumber: 1,
    cases: [],
  };
}

function formatCaseReference(number) {
  const normalizedNumber = normalizeCaseNumber(number);

  return normalizedNumber ? `CASE-${String(normalizedNumber).padStart(6, '0')}` : 'CASE-UNKNOWN';
}

function getModerationCasesStorageInfo(config) {
  if (config.dashboard.moderationCasesPath) {
    return {
      filePath: config.dashboard.moderationCasesPath,
      persistent: true,
      source: 'MODERATION_CASES_PATH',
    };
  }

  if (config.dashboard.railwayVolumeMountPath) {
    return {
      filePath: path.join(config.dashboard.railwayVolumeMountPath, 'moderation-cases.json'),
      persistent: true,
      source: 'RAILWAY_VOLUME_MOUNT_PATH',
    };
  }

  if (config.dashboard.savedMessagesPath) {
    return {
      filePath: path.join(path.dirname(config.dashboard.savedMessagesPath), 'moderation-cases.json'),
      persistent: true,
      source: 'DASHBOARD_SAVED_MESSAGES_PATH directory',
    };
  }

  return {
    filePath: defaultModerationCasesPath,
    persistent: false,
    source: 'app filesystem',
  };
}

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

module.exports = {
  formatCaseReference,
  getModerationCase,
  getModerationCasesStorageInfo,
  listModerationCases,
  listMemberModerationCases,
  loadModerationCaseStore,
  recordModerationCase,
  reserveModerationCaseNumber,
  revokeModerationCase,
  updateModerationCaseReason,
};
