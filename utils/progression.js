const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');

const defaultProgressionPath = path.join(__dirname, '..', 'data', 'progression.json');
const metricDefinitions = {
  message_count: { label: 'Meaningful messages', unit: 'messages', category: 'discord' },
  welcome_count: { label: 'Members welcomed', unit: 'members', category: 'discord' },
  voice_minutes: { label: 'Active voice time', unit: 'minutes', category: 'discord' },
  gaming_minutes: { label: 'Game activity', unit: 'minutes', category: 'game' },
  streaming_minutes: { label: 'Streaming activity', unit: 'minutes', category: 'game' },
  squad_gaming_minutes: { label: 'Same-game fireteam time', unit: 'minutes', category: 'game' },
};
const cadenceDefinitions = ['once', 'daily', 'weekly', 'monthly'];
const defaultChallenges = [
  {
    id: 'first-contact',
    name: 'First Contact',
    description: 'Welcome a newly joined member.',
    category: 'discord',
    metric: 'welcome_count',
    target: 1,
    xp: 100,
    cadence: 'daily',
    enabled: true,
    specificGame: '',
  },
  {
    id: 'comms-check',
    name: 'Comms Check',
    description: 'Send 5 meaningful messages.',
    category: 'discord',
    metric: 'message_count',
    target: 5,
    xp: 100,
    cadence: 'daily',
    enabled: true,
    specificGame: '',
  },
  {
    id: 'radio-operator',
    name: 'Radio Operator',
    description: 'Spend 30 active minutes in voice with the unit.',
    category: 'discord',
    metric: 'voice_minutes',
    target: 30,
    xp: 150,
    cadence: 'daily',
    enabled: true,
    specificGame: '',
  },
  {
    id: 'first-deployment',
    name: 'First Deployment',
    description: 'Play any game for 30 minutes.',
    category: 'game',
    metric: 'gaming_minutes',
    target: 30,
    xp: 100,
    cadence: 'daily',
    enabled: true,
    specificGame: '',
  },
  {
    id: 'extended-patrol',
    name: 'Extended Patrol',
    description: 'Accumulate 2 hours of game activity.',
    category: 'game',
    metric: 'gaming_minutes',
    target: 120,
    xp: 250,
    cadence: 'weekly',
    enabled: true,
    specificGame: '',
  },
  {
    id: 'live-recon',
    name: 'Live Recon',
    description: 'Stream gameplay for 60 minutes.',
    category: 'game',
    metric: 'streaming_minutes',
    target: 60,
    xp: 350,
    cadence: 'weekly',
    enabled: true,
    specificGame: '',
  },
  {
    id: 'fireteam-deployment',
    name: 'Fireteam Deployment',
    description: 'Play the same game as another voice member for 30 minutes.',
    category: 'game',
    metric: 'squad_gaming_minutes',
    target: 30,
    xp: 400,
    cadence: 'weekly',
    enabled: true,
    specificGame: '',
  },
  {
    id: 'tour-of-duty',
    name: 'Tour of Duty',
    description: 'Accumulate 10 hours of game activity in one month.',
    category: 'game',
    metric: 'gaming_minutes',
    target: 600,
    xp: 1000,
    cadence: 'monthly',
    enabled: true,
    specificGame: '',
  },
];

let mutationQueue = Promise.resolve();

async function loadProgressionState(config) {
  await mutationQueue.catch(() => null);
  return readProgressionFile(getProgressionStorageInfo(config).filePath);
}

async function getProgressionOverview(config, guildId) {
  const state = await loadProgressionState(config);
  const profiles = state.profiles
    .filter((profile) => !guildId || profile.guildId === guildId)
    .map((profile) => createProfileSnapshot(profile, state.challenges))
    .sort((left, right) => right.xp - left.xp);

  return {
    settings: state.settings,
    challenges: state.challenges,
    profiles,
    metrics: Object.entries(metricDefinitions).map(([value, definition]) => ({
      value,
      ...definition,
    })),
    cadences: cadenceDefinitions,
  };
}

async function getMemberProgression(config, guildId, userId, userTag = 'Unknown member') {
  const state = await loadProgressionState(config);
  const profile = state.profiles.find(
    (item) => item.guildId === guildId && item.userId === userId,
  ) || createEmptyProfile(guildId, userId, userTag);

  return {
    profile: createProfileSnapshot(profile, state.challenges),
    challenges: createChallengeSnapshots(profile, state.challenges),
    settings: state.settings,
  };
}

async function recordProgressBatch(config, entries, now = new Date()) {
  const validEntries = Array.isArray(entries)
    ? entries.map(normalizeProgressEntry).filter(Boolean)
    : [];

  if (validEntries.length === 0) {
    return [];
  }

  return mutateProgressionState(config, (state) => {
    if (!state.settings.enabled) {
      return [];
    }

    const completions = [];

    for (const entry of validEntries) {
      let profile = state.profiles.find(
        (item) => item.guildId === entry.guildId && item.userId === entry.userId,
      );

      if (!profile) {
        profile = createEmptyProfile(entry.guildId, entry.userId, entry.userTag);
        state.profiles.push(profile);
      }

      profile.userTag = entry.userTag || profile.userTag;
      profile.stats[entry.metric] = (profile.stats[entry.metric] || 0) + entry.amount;
      profile.updatedAt = now.toISOString();

      for (const challenge of state.challenges) {
        if (!challenge.enabled || challenge.metric !== entry.metric) {
          continue;
        }

        if (
          challenge.specificGame &&
          normalizeGameName(entry.context.gameName) !== normalizeGameName(challenge.specificGame)
        ) {
          continue;
        }

        const cycleKey = getChallengeCycleKey(challenge.cadence, now);
        let progress = profile.challengeProgress[challenge.id];

        if (!progress || progress.cycleKey !== cycleKey) {
          progress = {
            cycleKey,
            progress: 0,
            completedAt: null,
            completions: progress?.completions || 0,
          };
          profile.challengeProgress[challenge.id] = progress;
        }

        if (progress.completedAt) {
          continue;
        }

        const previousLevel = getLevelDetails(profile.xp).level;
        progress.progress = Math.min(challenge.target, progress.progress + entry.amount);

        if (progress.progress < challenge.target) {
          continue;
        }

        progress.completedAt = now.toISOString();
        progress.completions += 1;
        profile.xp += challenge.xp;
        profile.completedMissions += 1;
        const nextLevel = getLevelDetails(profile.xp).level;

        completions.push({
          guildId: profile.guildId,
          userId: profile.userId,
          userTag: profile.userTag,
          challenge: clone(challenge),
          xpAwarded: challenge.xp,
          totalXp: profile.xp,
          previousLevel,
          level: nextLevel,
          leveledUp: nextLevel > previousLevel,
        });
      }
    }

    return completions;
  });
}

async function saveProgressionSettings(config, input) {
  return mutateProgressionState(config, (state) => {
    state.settings = normalizeSettings(input, state.settings);
    return state.settings;
  });
}

async function createProgressionChallenge(config, input) {
  return mutateProgressionState(config, (state) => {
    if (state.challenges.length >= 100) {
      throw new Error('Use 100 missions or fewer.');
    }

    const challenge = normalizeChallenge({
      ...input,
      id: input?.id || createChallengeId(input?.name),
    });

    if (!challenge) {
      throw new Error('Mission configuration is invalid.');
    }

    if (state.challenges.some((item) => item.id === challenge.id)) {
      challenge.id = `${challenge.id}-${crypto.randomBytes(3).toString('hex')}`;
    }

    state.challenges.push(challenge);
    return challenge;
  });
}

async function updateProgressionChallenge(config, challengeId, input) {
  return mutateProgressionState(config, (state) => {
    const index = state.challenges.findIndex((item) => item.id === challengeId);

    if (index === -1) {
      return null;
    }

    const challenge = normalizeChallenge({
      ...state.challenges[index],
      ...input,
      id: state.challenges[index].id,
    });

    if (!challenge) {
      throw new Error('Mission configuration is invalid.');
    }

    state.challenges[index] = challenge;
    return challenge;
  });
}

async function deleteProgressionChallenge(config, challengeId) {
  return mutateProgressionState(config, (state) => {
    const index = state.challenges.findIndex((item) => item.id === challengeId);

    if (index === -1) {
      return null;
    }

    const [removed] = state.challenges.splice(index, 1);

    for (const profile of state.profiles) {
      delete profile.challengeProgress[challengeId];
    }

    return removed;
  });
}

async function mutateProgressionState(config, mutator) {
  const operation = mutationQueue.then(async () => {
    const filePath = getProgressionStorageInfo(config).filePath;
    const state = await readProgressionFile(filePath);
    const result = await mutator(state);

    await writeProgressionFile(filePath, state);
    return clone(result);
  });

  mutationQueue = operation.catch(() => null);
  return operation;
}

async function readProgressionFile(filePath) {
  let raw;

  try {
    raw = await fs.readFile(filePath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      return createDefaultState();
    }

    throw error;
  }

  const parsed = JSON.parse(raw);

  return {
    settings: normalizeSettings(parsed.settings, createDefaultSettings()),
    challenges: Array.isArray(parsed.challenges)
      ? parsed.challenges.map(normalizeChallenge).filter(Boolean)
      : clone(defaultChallenges),
    profiles: Array.isArray(parsed.profiles)
      ? parsed.profiles.map(normalizeProfile).filter(Boolean)
      : [],
  };
}

async function writeProgressionFile(filePath, state) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  const temporaryPath = `${filePath}.${process.pid}.tmp`;

  await fs.writeFile(temporaryPath, JSON.stringify(state, null, 2));
  await fs.rename(temporaryPath, filePath);
}

function createDefaultState() {
  return {
    settings: createDefaultSettings(),
    challenges: clone(defaultChallenges),
    profiles: [],
  };
}

function createDefaultSettings() {
  return {
    enabled: true,
    minimumVoiceParticipants: 2,
    excludeAfkChannel: true,
    excludeDeafened: true,
    messageCooldownSeconds: 60,
    minimumMessageLength: 5,
    welcomeWindowHours: 24,
  };
}

function normalizeSettings(input, fallback = createDefaultSettings()) {
  const source = input && typeof input === 'object' ? input : {};

  return {
    enabled: source.enabled === undefined ? Boolean(fallback.enabled) : Boolean(source.enabled),
    minimumVoiceParticipants: clampInteger(
      source.minimumVoiceParticipants,
      1,
      25,
      fallback.minimumVoiceParticipants,
    ),
    excludeAfkChannel:
      source.excludeAfkChannel === undefined
        ? Boolean(fallback.excludeAfkChannel)
        : Boolean(source.excludeAfkChannel),
    excludeDeafened:
      source.excludeDeafened === undefined
        ? Boolean(fallback.excludeDeafened)
        : Boolean(source.excludeDeafened),
    messageCooldownSeconds: clampInteger(
      source.messageCooldownSeconds,
      0,
      3600,
      fallback.messageCooldownSeconds,
    ),
    minimumMessageLength: clampInteger(
      source.minimumMessageLength,
      1,
      500,
      fallback.minimumMessageLength,
    ),
    welcomeWindowHours: clampInteger(
      source.welcomeWindowHours,
      1,
      168,
      fallback.welcomeWindowHours,
    ),
  };
}

function normalizeChallenge(input) {
  if (!input || typeof input !== 'object') {
    return null;
  }

  const id = sanitizeId(input.id);
  const name = sanitizeText(input.name, 80);
  const description = sanitizeText(input.description, 300);
  const metric = String(input.metric || '').trim();
  const cadence = String(input.cadence || '').trim().toLowerCase();
  const target = clampInteger(input.target, 1, 1000000, null);
  const xp = clampInteger(input.xp, 1, 1000000, null);

  if (!id || !name || !description || !metricDefinitions[metric] || !cadenceDefinitions.includes(cadence) || !target || !xp) {
    return null;
  }

  return {
    id,
    name,
    description,
    category: metricDefinitions[metric].category,
    metric,
    target,
    xp,
    cadence,
    enabled: input.enabled !== false,
    specificGame:
      ['gaming_minutes', 'streaming_minutes', 'squad_gaming_minutes'].includes(metric)
        ? sanitizeText(input.specificGame, 100)
        : '',
  };
}

function normalizeProfile(input) {
  if (!input || typeof input !== 'object') {
    return null;
  }

  const guildId = normalizeSnowflake(input.guildId);
  const userId = normalizeSnowflake(input.userId);

  if (!guildId || !userId) {
    return null;
  }

  return {
    guildId,
    userId,
    userTag: sanitizeText(input.userTag || 'Unknown member', 100),
    xp: clampInteger(input.xp, 0, Number.MAX_SAFE_INTEGER, 0),
    completedMissions: clampInteger(input.completedMissions, 0, Number.MAX_SAFE_INTEGER, 0),
    stats: normalizeStats(input.stats),
    challengeProgress: normalizeChallengeProgress(input.challengeProgress),
    createdAt: normalizeTimestamp(input.createdAt) || new Date().toISOString(),
    updatedAt: normalizeTimestamp(input.updatedAt) || new Date().toISOString(),
  };
}

function createEmptyProfile(guildId, userId, userTag) {
  const timestamp = new Date().toISOString();

  return {
    guildId,
    userId,
    userTag: sanitizeText(userTag || 'Unknown member', 100),
    xp: 0,
    completedMissions: 0,
    stats: Object.fromEntries(Object.keys(metricDefinitions).map((metric) => [metric, 0])),
    challengeProgress: {},
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function createProfileSnapshot(profile, challenges) {
  return {
    ...clone(profile),
    level: getLevelDetails(profile.xp),
    activeChallenges: createChallengeSnapshots(profile, challenges),
  };
}

function createChallengeSnapshots(profile, challenges, now = new Date()) {
  return challenges
    .filter((challenge) => challenge.enabled)
    .map((challenge) => {
      const cycleKey = getChallengeCycleKey(challenge.cadence, now);
      const storedProgress = profile.challengeProgress?.[challenge.id];
      const progress = storedProgress?.cycleKey === cycleKey ? storedProgress : null;

      return {
        ...clone(challenge),
        progress: Math.min(challenge.target, progress?.progress || 0),
        completed: Boolean(progress?.completedAt),
        completedAt: progress?.completedAt || null,
        completions: progress?.completions || storedProgress?.completions || 0,
      };
    });
}

function normalizeProgressEntry(entry) {
  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const guildId = normalizeSnowflake(entry.guildId);
  const userId = normalizeSnowflake(entry.userId);
  const metric = String(entry.metric || '').trim();
  const amount = Number(entry.amount);

  if (!guildId || !userId || !metricDefinitions[metric] || !Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return {
    guildId,
    userId,
    userTag: sanitizeText(entry.userTag || 'Unknown member', 100),
    metric,
    amount,
    context: entry.context && typeof entry.context === 'object' ? entry.context : {},
  };
}

function normalizeStats(input) {
  const source = input && typeof input === 'object' ? input : {};

  return Object.fromEntries(
    Object.keys(metricDefinitions).map((metric) => [
      metric,
      Number.isFinite(Number(source[metric])) && Number(source[metric]) >= 0
        ? Number(source[metric])
        : 0,
    ]),
  );
}

function normalizeChallengeProgress(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(input)
      .slice(0, 200)
      .map(([challengeId, progress]) => [
        sanitizeId(challengeId),
        {
          cycleKey: sanitizeText(progress?.cycleKey, 30),
          progress: Math.max(0, Number(progress?.progress) || 0),
          completedAt: normalizeTimestamp(progress?.completedAt),
          completions: clampInteger(progress?.completions, 0, Number.MAX_SAFE_INTEGER, 0),
        },
      ])
      .filter(([challengeId]) => challengeId),
  );
}

function getLevelDetails(xp) {
  const totalXp = Math.max(0, Number(xp) || 0);
  let level = Math.max(1, Math.floor((1 + Math.sqrt(1 + (8 * totalXp) / 100)) / 2));

  while (getTotalXpForLevel(level + 1) <= totalXp) level += 1;
  while (level > 1 && getTotalXpForLevel(level) > totalXp) level -= 1;

  const levelStartXp = getTotalXpForLevel(level);
  const nextLevelXp = getTotalXpForLevel(level + 1);

  return {
    level,
    totalXp,
    currentXp: totalXp - levelStartXp,
    requiredXp: nextLevelXp - levelStartXp,
    nextLevelTotalXp: nextLevelXp,
  };
}

function getTotalXpForLevel(level) {
  const normalizedLevel = Math.max(1, Number.parseInt(level, 10) || 1);

  return (100 * (normalizedLevel - 1) * normalizedLevel) / 2;
}

function getChallengeCycleKey(cadence, date = new Date()) {
  if (cadence === 'once') {
    return 'once';
  }

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');

  if (cadence === 'monthly') {
    return `${year}-${month}`;
  }

  if (cadence === 'weekly') {
    const monday = new Date(Date.UTC(year, date.getUTCMonth(), date.getUTCDate()));
    const day = monday.getUTCDay() || 7;

    monday.setUTCDate(monday.getUTCDate() - day + 1);
    return monday.toISOString().slice(0, 10);
  }

  return `${year}-${month}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

function getProgressionStorageInfo(config) {
  if (config.dashboard.progressionPath) {
    return {
      filePath: config.dashboard.progressionPath,
      persistent: true,
      source: 'PROGRESSION_PATH',
    };
  }

  if (config.dashboard.railwayVolumeMountPath) {
    return {
      filePath: path.join(config.dashboard.railwayVolumeMountPath, 'progression.json'),
      persistent: true,
      source: 'RAILWAY_VOLUME_MOUNT_PATH',
    };
  }

  if (config.dashboard.savedMessagesPath) {
    return {
      filePath: path.join(path.dirname(config.dashboard.savedMessagesPath), 'progression.json'),
      persistent: true,
      source: 'DASHBOARD_SAVED_MESSAGES_PATH directory',
    };
  }

  return {
    filePath: defaultProgressionPath,
    persistent: false,
    source: 'app filesystem',
  };
}

function createChallengeId(name) {
  const base = sanitizeId(name) || 'mission';

  return `${base}-${crypto.randomBytes(3).toString('hex')}`;
}

function sanitizeId(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function normalizeSnowflake(value) {
  const snowflake = String(value || '').trim();

  return /^\d{17,20}$/.test(snowflake) ? snowflake : null;
}

function normalizeTimestamp(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

function normalizeGameName(value) {
  return String(value || '').trim().toLowerCase();
}

function sanitizeText(value, maximumLength) {
  return String(value || '').trim().slice(0, maximumLength);
}

function clampInteger(value, minimum, maximum, fallback) {
  const number = Number.parseInt(value, 10);

  return Number.isSafeInteger(number) && number >= minimum && number <= maximum
    ? number
    : fallback;
}

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

module.exports = {
  createProgressionChallenge,
  deleteProgressionChallenge,
  getChallengeCycleKey,
  getLevelDetails,
  getMemberProgression,
  getProgressionOverview,
  getProgressionStorageInfo,
  loadProgressionState,
  metricDefinitions,
  recordProgressBatch,
  saveProgressionSettings,
  updateProgressionChallenge,
};
