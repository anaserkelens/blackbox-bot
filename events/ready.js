const { Events } = require('discord.js');

const { config } = require('../utils/config');
const { startPresenceRotation } = require('../utils/presenceManager');
const { getPresenceSettingsStorageInfo, loadPresenceSettings } = require('../utils/presenceSettings');
const { syncCommandsForClient } = require('../utils/syncCommands');

const name = Events.ClientReady;
const once = true;

async function execute(client) {
  console.log(`Logged in as ${client.user.tag}`);

  const presenceStorage = getPresenceSettingsStorageInfo(config);
  let presence;

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
