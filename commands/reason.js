const {
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} = require('discord.js');

const { config } = require('../utils/config');
const { canUseModerationCommand } = require('../utils/moderationActions');
const { createModerationCasePayload } = require('../utils/moderationCaseDisplay');
const {
  getModerationCase,
  updateModerationCaseReason,
} = require('../utils/moderationCases');
const {
  colors,
  formatUser,
  sendStructuredLog,
} = require('../utils/structuredLog');

const data = new SlashCommandBuilder()
  .setName('reason')
  .setDescription('Correct the reason attached to a moderation case.')
  .addIntegerOption((option) =>
    option
      .setName('case')
      .setDescription('The numeric case number, such as 12.')
      .setMinValue(1)
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName('reason')
      .setDescription('The corrected reason.')
      .setMaxLength(1000)
      .setRequired(true),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .setDMPermission(false);

async function execute(interaction) {
  if (!interaction.inGuild() || !canUseModerationCommand(interaction, PermissionFlagsBits.ModerateMembers)) {
    await interaction.reply({
      content: 'You need Moderate Members, Administrator, or the configured moderator role to edit cases.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const number = interaction.options.getInteger('case', true);
  const nextReason = interaction.options.getString('reason', true).trim();
  const currentCase = await getModerationCase(config, number, interaction.guildId);

  if (!currentCase) {
    await interaction.reply({
      content: `Case #${number} was not found in this server.`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  let updatedCase;

  try {
    updatedCase = await updateModerationCaseReason(config, number, nextReason, interaction.user);
  } catch (error) {
    await interaction.reply({ content: error.message, flags: MessageFlags.Ephemeral });
    return;
  }

  const correctionLogged = await sendStructuredLog(interaction.client, config.channels.caseFiles, {
    title: 'Case Reason Corrected',
    emoji: '✏️',
    color: colors.info,
    summary: `${updatedCase.reference} was updated by ${interaction.user}.`,
    referenceId: updatedCase.reference,
    fields: [
      { name: 'Case Member', value: `<@${updatedCase.userId}>\n-# ID: \`${updatedCase.userId}\`` },
      { name: 'Edited By', value: formatUser(interaction.user) },
      { name: 'Previous Reason', value: currentCase.reason },
      { name: 'Corrected Reason', value: updatedCase.reason },
    ],
  }).catch((error) => {
    console.error(`Failed to log the correction for ${updatedCase.reference}:`, error);
    return false;
  });

  await interaction.reply({
    ...createModerationCasePayload(updatedCase, {
      summary:
        `${updatedCase.reference} was corrected successfully.` +
        `${correctionLogged ? '' : ' The correction log channel was unavailable.'}`,
    }),
    flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
  });
}

module.exports = { data, execute };
