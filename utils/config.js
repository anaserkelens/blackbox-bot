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

const config = {
  discordToken: requireEnv('DISCORD_TOKEN'),
  clientId: readEnv('DISCORD_CLIENT_ID') || readEnv('CLIENT_ID'),
  guildId: readEnv('DISCORD_GUILD_ID'),
  autoRegisterCommands: readBoolean('AUTO_REGISTER_COMMANDS', true),
  presenceText: readEnv('PRESENCE_TEXT') || 'Keeping UNDR CTRL connected.',
  communityName: readEnv('COMMUNITY_NAME') || 'UNDR CTRL',
  communityDescription:
    readEnv('COMMUNITY_DESCRIPTION') ||
    'A community for UNDR CTRL members to connect, create, and build together.',
  channels: {
    welcome: readEnv('WELCOME_CHANNEL_ID'),
    guidelines: readEnv('GUIDELINES_CHANNEL_ID'),
    introductions: readEnv('INTRODUCTIONS_CHANNEL_ID'),
    rules: readEnv('RULES_CHANNEL_ID') || readEnv('GUIDELINES_CHANNEL_ID'),
    socials: readEnv('SOCIALS_CHANNEL_ID'),
    tickets: readEnv('TICKET_CHANNEL_ID'),
    ticketLogs: readEnv('TICKET_LOG_CHANNEL_ID'),
    memberLogs: readEnv('MEMBER_LOG_CHANNEL_ID'),
    messageLogs: readEnv('MESSAGE_LOG_CHANNEL_ID'),
    channelLogs: readEnv('CHANNEL_LOG_CHANNEL_ID'),
    eventLogs: readEnv('EVENT_LOG_CHANNEL_ID'),
    inviteLogs: readEnv('INVITE_LOG_CHANNEL_ID'),
    modLogs: readEnv('MOD_LOG_CHANNEL_ID'),
    userLogs: readEnv('USER_LOG_CHANNEL_ID'),
    streamAnnouncements: readEnv('ANNOUNCEMENT_CHANNEL_ID'),
  },
  roles: {
    staff: readEnv('STAFF_ROLE_ID'),
    moderator: readEnv('MODERATOR_ROLE_ID'),
    verified: readEnv('VERIFIED_ROLE_ID'),
    streamWhitelist: readEnv('STREAM_WHITELIST_ROLE_ID'),
    live: readEnv('LIVE_ROLE_ID'),
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
    titleKeyword: readEnv('STREAM_TITLE_KEYWORD') || 'UNDR CTRL',
    gameNameIncludes: readEnv('STREAM_GAME_NAME_INCLUDES'),
  },
  dashboard: {
    enabled: readBoolean('DASHBOARD_ENABLED', true),
    password: readEnv('DASHBOARD_PASSWORD'),
    port: readInteger('DASHBOARD_PORT', Number.parseInt(process.env.PORT, 10) || 3000),
    maxBodyBytes: readInteger('DASHBOARD_MAX_BODY_MB', 12) * 1024 * 1024,
    maxUploadBytes: readInteger('DASHBOARD_MAX_UPLOAD_MB', 8) * 1024 * 1024,
    savedMessagesPath: readEnv('DASHBOARD_SAVED_MESSAGES_PATH'),
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
