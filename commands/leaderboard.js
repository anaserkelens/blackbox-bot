const { MessageFlags, SlashCommandBuilder } = require('discord.js');

const { config } = require('../utils/config');
const { createLeaderboardPayload } = require('../utils/progressionDisplay');
const { getProgressionOverview } = require('../utils/progression');

const data = new SlashCommandBuilder()
  .setName('leaderboard')
  .setDescription('View the server progression leaderboard.')
  .setDMPermission(false);

async function execute(interaction) {
  const overview = await getProgressionOverview(config, interaction.guildId);

  if (!overview.settings.enabled) {
    await interaction.reply({
      content: 'Challenges and progression are currently disabled by an administrator.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.reply(createLeaderboardPayload(overview.profiles));
}

module.exports = { data, execute };
