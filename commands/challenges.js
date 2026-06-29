const { MessageFlags, SlashCommandBuilder } = require('discord.js');

const { config } = require('../utils/config');
const { createChallengesPayload } = require('../utils/progressionDisplay');
const { getMemberProgression } = require('../utils/progression');

const data = new SlashCommandBuilder()
  .setName('challenges')
  .setDescription('View your active missions and progress.')
  .setDMPermission(false);

async function execute(interaction) {
  const userTag =
    interaction.member?.displayName ||
    interaction.user.globalName ||
    interaction.user.tag ||
    interaction.user.username;
  const progression = await getMemberProgression(
    config,
    interaction.guildId,
    interaction.user.id,
    userTag,
  );

  await interaction.reply({
    ...createChallengesPayload(interaction.user, progression),
    flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
  });
}

module.exports = { data, execute };
