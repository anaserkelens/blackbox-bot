const {
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} = require('discord.js');

const { config } = require('../utils/config');
const { canUseModerationCommand } = require('../utils/moderationActions');
const { createModerationCasePayload } = require('../utils/moderationCaseDisplay');
const { getModerationCase } = require('../utils/moderationCases');

const data = new SlashCommandBuilder()
  .setName('case')
  .setDescription('View a stored moderation case.')
  .addIntegerOption((option) =>
    option
      .setName('number')
      .setDescription('The numeric case number, such as 12.')
      .setMinValue(1)
      .setRequired(true),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .setDMPermission(false);

async function execute(interaction) {
  if (!interaction.inGuild() || !canUseModerationCommand(interaction, PermissionFlagsBits.ModerateMembers)) {
    await interaction.reply({
      content: 'You need Moderate Members, Administrator, or the configured moderator role to view cases.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const number = interaction.options.getInteger('number', true);
  const moderationCase = await getModerationCase(config, number, interaction.guildId);

  if (!moderationCase) {
    await interaction.reply({
      content: `Case #${number} was not found in this server.`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.reply({
    ...createModerationCasePayload(moderationCase),
    flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
  });
}

module.exports = { data, execute };
