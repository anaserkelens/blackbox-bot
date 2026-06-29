const { SlashCommandBuilder } = require('discord.js');

const { config } = require('../utils/config');
const { createProfileCardPayload } = require('../utils/progressionDisplay');
const { getMemberProgression, getProgressionOverview } = require('../utils/progression');

const data = new SlashCommandBuilder()
  .setName('profile')
  .setDescription('View a progression profile card.')
  .addUserOption((option) =>
    option
      .setName('member')
      .setDescription('The member whose profile you want to view.'),
  )
  .setDMPermission(false);

async function execute(interaction) {
  const user = interaction.options.getUser('member') || interaction.user;
  const member = interaction.options.getMember('member') || (
    user.id === interaction.user.id ? interaction.member : null
  );
  const userTag = member?.displayName || user.globalName || user.tag || user.username;
  const [progression, overview] = await Promise.all([
    getMemberProgression(config, interaction.guildId, user.id, userTag),
    getProgressionOverview(config, interaction.guildId),
  ]);
  const leaderboardPosition = overview.profiles.findIndex((profile) => profile.userId === user.id) + 1;

  await interaction.reply(
    createProfileCardPayload(user, progression, leaderboardPosition || null),
  );
}

module.exports = { data, execute };
