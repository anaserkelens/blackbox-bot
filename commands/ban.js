const {
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} = require('discord.js');

const { config } = require('../utils/config');
const {
  canUseModerationCommand,
  clearBotModerationAction,
  colors,
  createAuditReason,
  getTargetBlockReason,
  logBotModerationAction,
  prepareDirectMessage,
  registerBotModerationAction,
  sendModerationDirectMessage,
} = require('../utils/moderationActions');
const {
  formatCaseReference,
  recordModerationCase,
  reserveModerationCaseNumber,
} = require('../utils/moderationCases');

const data = new SlashCommandBuilder()
  .setName('ban')
  .setDescription('Ban a member and notify them by DM.')
  .addUserOption((option) =>
    option.setName('member').setDescription('The member to ban.').setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName('reason')
      .setDescription('The reason for the ban.')
      .setMaxLength(1000)
      .setRequired(true),
  )
  .addIntegerOption((option) =>
    option
      .setName('delete_messages')
      .setDescription('How much recent message history to delete.')
      .addChoices(
        { name: 'Do not delete messages', value: 0 },
        { name: 'Previous hour', value: 3600 },
        { name: 'Previous 6 hours', value: 21600 },
        { name: 'Previous 12 hours', value: 43200 },
        { name: 'Previous day', value: 86400 },
        { name: 'Previous 3 days', value: 259200 },
        { name: 'Previous 7 days', value: 604800 },
      ),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .setDMPermission(false);

async function execute(interaction) {
  if (!interaction.inGuild() || !canUseModerationCommand(interaction, PermissionFlagsBits.BanMembers)) {
    await interaction.reply({
      content: 'You need Ban Members, Administrator, or the configured moderator role to use this command.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const user = interaction.options.getUser('member', true);
  const member =
    interaction.options.getMember('member') ||
    await interaction.guild.members.fetch(user.id).catch(() => null);
  const reason = interaction.options.getString('reason', true).trim();
  const deleteMessageSeconds = interaction.options.getInteger('delete_messages') || 0;
  const blockReason = getTargetBlockReason(interaction, member, 'bannable');

  if (blockReason) {
    await interaction.reply({ content: blockReason, flags: MessageFlags.Ephemeral });
    return;
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  let caseNumber;

  try {
    caseNumber = await reserveModerationCaseNumber(config);
  } catch (error) {
    await interaction.editReply(`The ban was not applied because case storage is unavailable: ${error.message}`);
    return;
  }

  const caseId = formatCaseReference(caseNumber);
  const dmChannel = await prepareDirectMessage(user);
  registerBotModerationAction('ban', interaction.guild.id, user.id, { caseId });

  try {
    await interaction.guild.members.ban(user, {
      deleteMessageSeconds,
      reason: createAuditReason(reason, interaction.user, caseId),
    });
  } catch (error) {
    clearBotModerationAction('ban', interaction.guild.id, user.id);
    await interaction.editReply(`Ban failed: ${error.message}`);
    return;
  }

  const dmDelivered = await sendModerationDirectMessage(dmChannel, {
    title: `Banned from ${interaction.guild.name}`,
    emoji: '🔨',
    color: colors.danger,
    summary: `You were banned from **${interaction.guild.name}**.`,
    caseId,
    reason,
    moderator: interaction.user,
  });
  const historyLabel = deleteMessageSeconds
    ? `${deleteMessageSeconds / 3600} hour(s)`
    : 'No message history deleted';
  const logged = await logBotModerationAction(interaction.client, {
    command: 'ban',
    logTitle: 'Member Banned',
    logSummary: `${user} was banned through the bot.`,
    emoji: '🔨',
    color: colors.danger,
    caseId,
    user,
    moderator: interaction.user,
    reason,
    dmDelivered,
    extraFields: [{ name: 'Deleted Message History', value: historyLabel }],
  });
  let caseSaved = true;

  try {
    await recordModerationCase(config, {
      number: caseNumber,
      guildId: interaction.guildId,
      action: 'ban',
      userId: user.id,
      userTag: user.tag || user.username,
      moderatorId: interaction.user.id,
      moderatorTag: interaction.user.tag || interaction.user.username,
      reason,
      channelId: interaction.channelId,
      dmDelivered,
      logDelivered: logged,
      metadata: { deleteMessageSeconds },
    });
  } catch (error) {
    caseSaved = false;
    console.error(`Failed to store ${caseId}:`, error);
  }

  await interaction.editReply(
    `${caseId}: ${user.tag || user.username} was banned.${dmDelivered ? '' : ' Their DM could not be delivered.'}${logged ? '' : ' The case log channel was unavailable.'}${caseSaved ? '' : ' The action succeeded, but the case ledger could not be updated.'}`,
  );
}

module.exports = { data, execute };
