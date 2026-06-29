const { SlashCommandBuilder } = require('discord.js');

const { config } = require('../utils/config');
const { createLeaderboardPayload } = require('../utils/progressionDisplay');
const { getProgressionOverview } = require('../utils/progression');

const data = new SlashCommandBuilder()
  .setName('leaderboard')
  .setDescription('View the server progression leaderboard.')
  .setDMPermission(false);

async function execute(interaction) {
  const overview = await getProgressionOverview(config, interaction.guildId);

  await interaction.reply(createLeaderboardPayload(overview.profiles));
}

module.exports = { data, execute };
