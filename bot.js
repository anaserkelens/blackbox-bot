const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');

const { config } = require('./utils/config');
const { loadCommands } = require('./utils/loadCommands');
const { loadEvents } = require('./utils/loadEvents');
const { startDashboard } = require('./utils/dashboardServer');

function buildIntents() {
  const intents = [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.GuildVoiceStates,
  ];

  if (config.intents.members) {
    intents.push(GatewayIntentBits.GuildMembers);
  }

  if (config.intents.messageContent) {
    intents.push(GatewayIntentBits.MessageContent);
  }

  if (config.intents.presences) {
    intents.push(GatewayIntentBits.GuildPresences);
  }

  return intents;
}

const client = new Client({
  intents: buildIntents(),
  partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User, Partials.GuildMember],
});

client.commands = new Collection();

for (const command of loadCommands()) {
  client.commands.set(command.data.name, command);
  console.log(`Loaded command: ${command.data.name}`);
}

for (const eventName of loadEvents(client)) {
  console.log(`Loaded event: ${eventName}`);
}

client.on('error', (error) => {
  console.error('Discord client error:', error);
});

client.on('warn', (warning) => {
  console.warn('Discord client warning:', warning);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

console.log(`Starting ${config.communityName} Blackbox bot...`);

if (!config.intents.members) {
  console.warn(
    'Automatic welcome messages are disabled. Enable the Server Members Intent in Discord and set ENABLE_SERVER_MEMBERS_INTENT=true.',
  );
}

if (!config.intents.messageContent) {
  console.warn(
    'Detailed message logs are limited. Enable the Message Content Intent in Discord and set ENABLE_MESSAGE_CONTENT_INTENT=true.',
  );
}

startDashboard(client);
client.login(config.discordToken);
