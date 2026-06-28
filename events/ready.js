const { Events } = require('discord.js');

const { config } = require('../utils/config');
const { startPresenceRotation } = require('../utils/presenceManager');
const { syncCommandsForClient } = require('../utils/syncCommands');

const name = Events.ClientReady;
const once = true;

async function execute(client) {
  console.log(`Logged in as ${client.user.tag}`);

  startPresenceRotation(client);

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
