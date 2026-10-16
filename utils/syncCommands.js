const { REST, Routes } = require('discord.js');

const { config } = require('./config');

function createCommandPayload(commands) {
  return [...commands].map((command) => (typeof command.data.toJSON === 'function' ? command.data.toJSON() : command.data));
}

async function syncCommandsForClient(client) {
  const body = createCommandPayload(client.commands.values());

  const guildIds = [...(client.guilds?.cache?.keys() || [])];
  if (guildIds.length) {
    const errors = [];
    for (const guildId of guildIds) {
      try { await client.application.commands.set(body, guildId); }
      catch (error) { errors.push(new Error('Command sync failed for ' + guildId, { cause: error })); }
    }
    if (errors.length) throw new AggregateError(errors, 'Some server commands could not be synced.');
    return { count: body.length, scope: String(guildIds.length) + ' server(s)' };
  }

  await client.application.commands.set(body);
  return { count: body.length, guildId: undefined, scope: 'global' };
}

async function registerCommandsWithRest(commands) {
  const body = createCommandPayload(commands);
  const rest = new REST({ version: '10' }).setToken(config.discordToken);

  if (config.guildId) {
    await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body });
    return { count: body.length, guildId: config.guildId, scope: 'guild' };
  }

  await rest.put(Routes.applicationCommands(config.clientId), { body });
  return { count: body.length, guildId: undefined, scope: 'global' };
}

module.exports = {
  createCommandPayload,
  registerCommandsWithRest,
  syncCommandsForClient,
};
