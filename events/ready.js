const { Events } = require('discord.js');

const { config } = require('../utils/config');
const { getModerationCasesStorageInfo } = require('../utils/moderationCases');
const { startPresenceRotation } = require('../utils/presenceManager');
const { getPresenceSettingsStorageInfo, loadPresenceSettings } = require('../utils/presenceSettings');
const { getProgressionStorageInfo } = require('../utils/progression');
const { colors, sendStructuredLog } = require('../utils/structuredLog');
const { syncCommandsForClient } = require('../utils/syncCommands');

const name = Events.ClientReady;
const once = true;

async function execute(client) {
  console.log(`Logged in as ${client.user.tag}`);

  const presenceStorage = getPresenceSettingsStorageInfo(config);
  const moderationCasesStorage = getModerationCasesStorageInfo(config);
  const progressionStorage = getProgressionStorageInfo(config);
  let presence;

  console.log(
    `Moderation case storage: ${moderationCasesStorage.filePath} (${moderationCasesStorage.persistent ? 'persistent' : 'ephemeral'}, ${moderationCasesStorage.source}).`,
  );

  if (!moderationCasesStorage.persistent) {
    console.warn('Moderation cases will reset after Railway redeploys unless a persistent volume is attached.');
  }

  console.log(
    `Progression storage: ${progressionStorage.filePath} (${progressionStorage.persistent ? 'persistent' : 'ephemeral'}, ${progressionStorage.source}).`,
  );

  if (!progressionStorage.persistent) {
    console.warn('Progression profiles and missions will reset after Railway redeploys unless a persistent volume is attached.');
  }

  try {
    presence = await loadPresenceSettings(config);
    console.log(
      `Presence settings storage: ${presenceStorage.filePath} (${presenceStorage.persistent ? 'persistent' : 'ephemeral'}, ${presenceStorage.source}).`,
    );

    if (!presenceStorage.persistent) {
      console.warn('Presence settings will reset after Railway redeploys unless a persistent volume is attached.');
    }
  } catch (error) {
    console.error(`Failed to load presence settings from ${presenceStorage.filePath}:`, error);
  }

  startPresenceRotation(client, presence);

  await sendStructuredLog(client, config.channels.operationLog, {
    title: 'Bot Online',
    emoji: '🟢',
    color: colors.success,
    summary: `**${client.user.tag}** connected and is ready.`,
    thumbnailUrl: client.user.displayAvatarURL({ size: 256 }),
    referenceId: `STARTUP-${Date.now()}`,
    fields: [
      { name: 'Bot User', value: `${client.user}\n-# ID: \`${client.user.id}\`` },
      { name: 'Guilds', value: client.guilds.cache.size.toLocaleString() },
      { name: 'Loaded Commands', value: client.commands.size.toLocaleString() },
      { name: 'Node.js', value: process.version },
      { name: 'Automatic Command Sync', value: config.autoRegisterCommands ? 'Enabled' : 'Disabled' },
      { name: 'Presence Storage', value: `${presenceStorage.persistent ? 'Persistent' : 'Ephemeral'} via ${presenceStorage.source}` },
      { name: 'Moderation Case Storage', value: `${moderationCasesStorage.persistent ? 'Persistent' : 'Ephemeral'} via ${moderationCasesStorage.source}` },
      { name: 'Progression Storage', value: `${progressionStorage.persistent ? 'Persistent' : 'Ephemeral'} via ${progressionStorage.source}` },
    ],
  }).catch((error) => console.error('Failed to send startup operation log:', error));

  if (!config.autoRegisterCommands) {
    console.log('Automatic slash command registration is disabled.');
    return;
  }

  try {
    const result = await syncCommandsForClient(client);
    console.log(
      `Synced ${result.count} ${result.scope} slash commands${result.guildId ? ` for ${result.guildId}` : ''}.`,
    );
  } catch (error) {
    console.error('Failed to sync slash commands on startup:', error);
  }
}

module.exports = { name, once, execute };
