const {
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} = require('discord.js');

const {
  canUseModerationCommand,
  clearBotModerationAction,
  colors,
  createAuditReason,
  createCaseId,
  getTargetBlockReason,
  logBotModerationAction,
  prepareDirectMessage,
  registerBotModerationAction,
  sendModerationDirectMessage,
} = require('../utils/moderationActions');

const durationChoices = [
  { name: '5 minutes', value: '300000' },
  { name: '10 minutes', value: '600000' },
  { name: '30 minutes', value: '1800000' },
  { name: '1 hour', value: '3600000' },
  { name: '6 hours', value: '21600000' },
  { name: '12 hours', value: '43200000' },
  { name: '1 day', value: '86400000' },
  { name: '3 days', value: '259200000' },
  { name: '1 week', value: '604800000' },
  { name: '28 days', value: '2419200000' },
];

const data = new SlashCommandBuilder()
  .setName('timeout')
  .setDescription('Timeout a member and notify them by DM.')
  .addUserOption((option) =>
    option.setName('member').setDescription('The member to timeout.').setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName('duration')
      .setDescription('How long the timeout should last.')
      .addChoices(...durationChoices)
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName('reason')
      .setDescription('The reason for the timeout.')
      .setMaxLength(1000)
      .setRequired(true),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .setDMPermission(false);

async function execute(interaction) {
  if (!interaction.inGuild() || !canUseModerationCommand(interaction, PermissionFlagsBits.ModerateMembers)) {
    await interaction.reply({
      content: 'You need Moderate Members, Administrator, or the configured moderator role to use this command.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const member = interaction.options.getMember('member');
  const user = interaction.options.getUser('member', true);
  const durationMs = Number.parseInt(interaction.options.getString('duration', true), 10);
  const reason = interaction.options.getString('reason', true).trim();
  const blockReason = getTargetBlockReason(interaction, member, 'moderatable');

  if (blockReason) {
    await interaction.reply({ content: blockReason, flags: MessageFlags.Ephemeral });
    return;
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const caseId = createCaseId('timeout', user.id);
  const dmChannel = await prepareDirectMessage(user);
  registerBotModerationAction('timeout', interaction.guild.id, user.id, { caseId });

  try {
    await member.timeout(durationMs, createAuditReason(reason, interaction.user, caseId));
  } catch (error) {
    clearBotModerationAction('timeout', interaction.guild.id, user.id);
    await interaction.editReply(`Timeout failed: ${error.message}`);
    return;
  }

  const dmDelivered = await sendModerationDirectMessage(dmChannel, {
    title: `Timed out in ${interaction.guild.name}`,
    emoji: '⏳',
    color: colors.warning,
    summary: `You were timed out in **${interaction.guild.name}**.`,
    caseId,
    reason,
    durationMs,
    moderator: interaction.user,
  });
  const logged = await logBotModerationAction(interaction.client, {
    command: 'timeout',
    logTitle: 'Member Timed Out',
    logSummary: `${user} was timed out through the bot.`,
    emoji: '⏳',
    color: colors.warning,
    caseId,
    user,
    moderator: interaction.user,
    reason,
    durationMs,
    dmDelivered,
  });

  await interaction.editReply(
    `${user.tag || user.username} was timed out.${dmDelivered ? '' : ' Their DM could not be delivered.'}${logged ? '' : ' The case log channel was unavailable.'}`,
  );
}

module.exports = { data, execute };
