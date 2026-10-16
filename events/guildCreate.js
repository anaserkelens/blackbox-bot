const { Events } = require('discord.js');
const { config } = require('../utils/config');
const { createCommandPayload } = require('../utils/syncCommands');
module.exports = {
  name: Events.GuildCreate,
  async execute(guild, client) {
    if (!config.autoRegisterCommands) return;
    try {
      await client.application.commands.set(createCommandPayload(client.commands.values()), guild.id);
    } catch (error) {
      console.error('Failed to sync commands for ' + guild.id, error);
    }
  },
};
