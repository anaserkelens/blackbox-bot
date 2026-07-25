const { Events, MessageFlags } = require('discord.js');

const { recordActivity } = require('../utils/activityFeed');
const { config } = require('../utils/config');

const name = Events.InteractionCreate;

async function execute(interaction) {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    await interaction.reply({
      content: 'That command is not available right now.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (interaction.guildId && interaction.user && !interaction.user.bot) {
    await recordActivity(config, {
      type: 'interaction',
      title: `/${interaction.commandName}`,
      summary: `${interaction.member?.displayName || interaction.user.globalName || interaction.user.username} used a Bean command.`,
      referenceId: `INTERACTION-${interaction.id}`,
      memberId: interaction.user.id,
      memberName: interaction.member?.displayName || interaction.user.globalName || interaction.user.username,
      guildId: interaction.guildId,
      action: 'command',
      visibleInFeed: false,
      metadata: {
        commandName: interaction.commandName,
        channelId: interaction.channelId || '',
      },
    }).catch((error) => console.error('Failed to record member interaction:', error));
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error while running /${interaction.commandName}:`, error);

    const response = {
      content: 'Something went wrong while running that command.',
      flags: MessageFlags.Ephemeral,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(response);
    } else {
      await interaction.reply(response);
    }
  }
}

module.exports = { name, execute };
