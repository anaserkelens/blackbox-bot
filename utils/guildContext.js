const { AsyncLocalStorage } = require('node:async_hooks');
const path = require('node:path');

const context = new AsyncLocalStorage();
const guildConfigs = new Map();
let baseConfig;

// Each asynchronous event/request keeps its own configuration across awaits.
// Never change the process-wide selected guild: two servers can act concurrently.
function createScopedConfig(base) {
  baseConfig = base;
  return new Proxy(base, {
    get: (target, key) => (context.getStore() || target)[key],
    set(target, key, value) {
      (context.getStore() || target)[key] = value;
      return true;
    },
  });
}

function getGuildConfig(guildId, name) {
  if (!/^\d{17,20}$/.test(String(guildId || ''))) throw new Error('Invalid server ID.');
  if (guildId === baseConfig.guildId) return baseConfig;
  if (guildConfigs.has(guildId)) return guildConfigs.get(guildId);

  const scoped = structuredClone(baseConfig);
  scoped.guildId = guildId;
  scoped.isAdditionalGuild = true;
  scoped.communityName = name || 'Your community';
  scoped.communityDescription = 'Welcome to your community.';
  scoped.channels = Object.fromEntries(Object.keys(baseConfig.channels).map((key) => [key, undefined]));
  scoped.roles = Object.fromEntries(Object.keys(baseConfig.roles).map((key) => [key, undefined]));
  scoped.legacyReactionRole = {};
  scoped.invites = { ...scoped.invites, enabled: false, allowedPatterns: [] };
  scoped.streamMonitor.enabled = false;
  scoped.youtubeMonitor = { ...scoped.youtubeMonitor, enabled: false, channelId: '', channelHandle: '', channelDisplayName: '' };
  scoped.protection = { ...scoped.protection, enabled: false, alertChannelId: undefined, quarantineRoleId: undefined };
  delete scoped.dashboard.features;
  // Presence is an application-wide Discord property, even when edited from another server.
  const presenceStorage = require('./presenceSettings').getPresenceSettingsStorageInfo(baseConfig);
  scoped.dashboard.presencePath = presenceStorage.filePath;

  const files = {
    savedMessagesPath: 'saved-messages.json', settingsPath: 'dashboard-settings.json',
    streamEmbedPath: 'stream-embed.json', youtubeEmbedPath: 'youtube-embed.json',
    youtubeUploadStatePath: 'youtube-upload-state.json', welcomeEmbedPath: 'welcome-embed.json',
    moderationCasesPath: 'moderation-cases.json', tempVoicePath: 'temp-voice.json',
    protectionPath: 'bean-protection.json', communityGrowthPath: 'community-growth.json',
    reactionRolesPath: 'reaction-roles.json', mailboxSchedulePath: 'scheduled-mailbox.json',
    activityPath: 'activity-feed.json',
  };
  scoped.dashboard.guildStoragePersistence = { presencePath: presenceStorage.persistent };
  for (const [key, filename] of Object.entries(files)) {
    const root = baseConfig.dashboard[key]
      ? path.dirname(baseConfig.dashboard[key])
      : baseConfig.dashboard.railwayVolumeMountPath
        || (baseConfig.dashboard.savedMessagesPath ? path.dirname(baseConfig.dashboard.savedMessagesPath) : path.join(__dirname, '..', 'data'));
    scoped.dashboard.guildStoragePersistence[key] = Boolean(baseConfig.dashboard[key]
      || baseConfig.dashboard.railwayVolumeMountPath || baseConfig.dashboard.savedMessagesPath);
    scoped.dashboard[key] = path.join(root, 'guilds', guildId, filename);
  }
  require('./dashboardSettings').initializeDashboardSettings(scoped);
  guildConfigs.set(guildId, scoped);
  return scoped;
}

function runWithGuild(guildId, callback, name) {
  return context.run(getGuildConfig(guildId, name), callback);
}

async function forEachGuild(client, callback) {
  const errors = [];
  for (const guild of client.guilds.cache.values()) {
    try { await runWithGuild(guild.id, () => callback(guild), guild.name); }
    catch (error) { errors.push(error); }
  }
  if (errors.length) throw new AggregateError(errors, 'Server background jobs failed.');
}

function installGuildEventContext(client) {
  const emit = client.emit;
  client.emit = function (event, ...args) {
    const guild = args.map((arg) => arg?.guild || arg?.message?.guild || arg?.first?.()?.guild)
      .find(Boolean) || (event === 'guildCreate' || event === 'guildDelete' ? args[0] : null);
    const guildId = guild?.id || args.map((arg) => arg?.guildId || arg?.message?.guildId).find(Boolean);
    if (guildId) return runWithGuild(guildId, () => emit.call(this, event, ...args), guild?.name);
    if (event === 'userUpdate') {
      for (const server of client.guilds.cache.values()) {
        if (server.members.cache.has(args[1]?.id)) {
          runWithGuild(server.id, () => emit.call(this, event, ...args), server.name);
        }
      }
      return true;
    }
    return emit.call(this, event, ...args);
  };
}

module.exports = { createScopedConfig, getGuildConfig, runWithGuild, forEachGuild, installGuildEventContext };
