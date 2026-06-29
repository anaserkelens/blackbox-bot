const {
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} = require('discord.js');

const { config } = require('../utils/config');
const { canUseModerationCommand } = require('../utils/moderationActions');
const { createModerationHistoryPayload } = require('../utils/moderationCaseDisplay');
const { listMemberModerationCases } = require('../utils/moderationCases');

const data = new SlashCommandBuilder()
  .setName('history')
  .setDescription('View a member’s recent moderation history.')
  .addUserOption((option) =>
    option
      .setName('member')
      .setDescription('The member whose moderation history you want to view.')
      .setRequired(true),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .setDMPermission(false);

async function execute(interaction) {
  if (!interaction.inGuild() || !canUseModerationCommand(interaction, PermissionFlagsBits.ModerateMembers)) {
    await interaction.reply({
      content: 'You need Moderate Members, Administrator, or the configured moderator role to view histories.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const user = interaction.options.getUser('member', true);
  const cases = await listMemberModerationCases(config, interaction.guildId, user.id, 10);

  await interaction.reply({
    ...createModerationHistoryPayload(user, cases),
    flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
  });
}

module.exports = { data, execute };
