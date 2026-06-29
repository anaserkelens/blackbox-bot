require('dotenv').config({ quiet: true });

function readEnv(name) {
  const value = process.env[name] ? process.env[name].trim() : undefined;
  return value || undefined;
}

function requireEnv(name) {
  const value = readEnv(name);

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function readBoolean(name, fallback = false) {
  const value = readEnv(name);

  if (value === undefined) {
    return fallback;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

function readInteger(name, fallback) {
  const value = readEnv(name);
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readCsv(name, fallback = []) {
  const value = readEnv(name);

  if (!value) {
    return fallback;
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

const presenceText = readEnv('PRESENCE_TEXT') || 'Keeping UNDR CTRL connected.';
const loggingChannels = {
  caseFiles: readEnv('CASE_FILES_CHANNEL_ID') || '1520858981227172000',
  entryLog: readEnv('ENTRY_LOG_CHANNEL_ID') || '1520858940617785565',
  signalLog: readEnv('SIGNAL_LOG_CHANNEL_ID') || '1520859015905546380',
  lineLog: readEnv('LINE_LOG_CHANNEL_ID') || '1520915998092558527',
  operationLog: readEnv('OPERATION_LOG_CHANNEL_ID') || '1520916058272170185',
  systemLog: readEnv('SYSTEM_LOG_CHANNEL_ID') || '1520859053012811876',
};

const config = {
  discordToken: requireEnv('DISCORD_TOKEN'),
  clientId: readEnv('DISCORD_CLIENT_ID') || readEnv('CLIENT_ID'),
  guildId: readEnv('DISCORD_GUILD_ID'),
  autoRegisterCommands: readBoolean('AUTO_REGISTER_COMMANDS', true),
  presenceText,
  presenceTexts: readCsv('PRESENCE_TEXTS', [presenceText]),
  presenceRotationSeconds: Math.min(86400, Math.max(5, readInteger('PRESENCE_ROTATION_SECONDS', 30))),
  communityName: readEnv('COMMUNITY_NAME') || 'UNDR CTRL',
  communityDescription:
    readEnv('COMMUNITY_DESCRIPTION') ||
    'A community for UNDR CTRL members to connect, create, and build together.',
  ownerUserId: readEnv('BOT_OWNER_USER_ID') || '185282790969835520',
  channels: {
    welcome: readEnv('WELCOME_CHANNEL_ID') || '1520407983354544171',
    guidelines: readEnv('GUIDELINES_CHANNEL_ID'),
    introductions: readEnv('INTRODUCTIONS_CHANNEL_ID'),
    rules: readEnv('RULES_CHANNEL_ID') || readEnv('GUIDELINES_CHANNEL_ID'),
    socials: readEnv('SOCIALS_CHANNEL_ID'),
    tickets: readEnv('TICKET_CHANNEL_ID'),
    ...loggingChannels,
    ticketLogs: loggingChannels.operationLog,
    memberLogs: loggingChannels.entryLog,
    messageLogs: loggingChannels.signalLog,
    channelLogs: loggingChannels.systemLog,
    eventLogs: loggingChannels.operationLog,
    inviteLogs: loggingChannels.entryLog,
    modLogs: loggingChannels.caseFiles,
    userLogs: loggingChannels.systemLog,
    voiceLogs: loggingChannels.lineLog,
    streamAnnouncements: readEnv('ANNOUNCEMENT_CHANNEL_ID') || '1520519675543293972',
  },
  roles: {
    founder: readEnv('FOUNDER_ROLE_ID') || '1520451840058064999',
    staff: readEnv('STAFF_ROLE_ID'),
    moderator: readEnv('MODERATOR_ROLE_ID'),
    verified: readEnv('VERIFIED_ROLE_ID'),
    live: readEnv('LIVE_ROLE_ID') || '1520781346740506874',
  },
  reactionRole: {
    messageId: readEnv('REACTION_ROLE_MESSAGE_ID'),
    channelId: readEnv('REACTION_ROLE_CHANNEL_ID') || readEnv('RULES_CHANNEL_ID'),
    emojiId: readEnv('REACTION_ROLE_EMOJI_ID'),
  },
  invites: {
    enabled: readBoolean('INVITE_MODERATION_ENABLED', false),
    allowedPatterns: readCsv('ALLOWED_INVITE_PATTERNS'),
    timeoutMs: readInteger('INVITE_TIMEOUT_MS', 60000),
  },
  streamMonitor: {
    enabled: readBoolean('STREAM_MONITOR_ENABLED', false),
    featuredUserId: readEnv('FEATURED_STREAMER_USER_ID') || '185282790969835520',
  },
  dashboard: {
    enabled: readBoolean('DASHBOARD_ENABLED', true),
    password: readEnv('DASHBOARD_PASSWORD'),
    port: readInteger('DASHBOARD_PORT', Number.parseInt(process.env.PORT, 10) || 3000),
    maxBodyBytes: readInteger('DASHBOARD_MAX_BODY_MB', 12) * 1024 * 1024,
    maxUploadBytes: readInteger('DASHBOARD_MAX_UPLOAD_MB', 8) * 1024 * 1024,
    savedMessagesPath: readEnv('DASHBOARD_SAVED_MESSAGES_PATH'),
    presencePath: readEnv('DASHBOARD_PRESENCE_PATH'),
    streamEmbedPath: readEnv('DASHBOARD_STREAM_EMBED_PATH'),
    welcomeEmbedPath: readEnv('DASHBOARD_WELCOME_EMBED_PATH'),
    moderationCasesPath: readEnv('MODERATION_CASES_PATH'),
    progressionPath: readEnv('PROGRESSION_PATH'),
    railwayVolumeMountPath: readEnv('RAILWAY_VOLUME_MOUNT_PATH'),
  },
};

config.intents = {
  members: readBoolean('ENABLE_SERVER_MEMBERS_INTENT', false),
  messageContent: readBoolean('ENABLE_MESSAGE_CONTENT_INTENT', config.invites.enabled),
  presences: readBoolean('ENABLE_PRESENCE_INTENT', config.streamMonitor.enabled),
};

module.exports = {
  config,
  readBoolean,
  readCsv,
  readEnv,
};
