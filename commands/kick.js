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
  .setName('kick')
  .setDescription('Kick a member and notify them by DM.')
  .addUserOption((option) =>
    option.setName('member').setDescription('The member to kick.').setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName('reason')
      .setDescription('The reason for the kick.')
      .setMaxLength(1000)
      .setRequired(true),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
  .setDMPermission(false);

async function execute(interaction) {
  if (!interaction.inGuild() || !canUseModerationCommand(interaction, PermissionFlagsBits.KickMembers)) {
    await interaction.reply({
      content: 'You need Kick Members, Administrator, or the configured moderator role to use this command.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const member = interaction.options.getMember('member');
  const user = interaction.options.getUser('member', true);
  const reason = interaction.options.getString('reason', true).trim();
  const blockReason = getTargetBlockReason(interaction, member, 'kickable');

  if (blockReason) {
    await interaction.reply({ content: blockReason, flags: MessageFlags.Ephemeral });
    return;
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  let caseNumber;

  try {
    caseNumber = await reserveModerationCaseNumber(config);
  } catch (error) {
    await interaction.editReply(`The kick was not applied because case storage is unavailable: ${error.message}`);
    return;
  }

  const caseId = formatCaseReference(caseNumber);
  const dmChannel = await prepareDirectMessage(user);
  registerBotModerationAction('kick', interaction.guild.id, user.id, { caseId });

  try {
    await member.kick(createAuditReason(reason, interaction.user, caseId));
  } catch (error) {
    clearBotModerationAction('kick', interaction.guild.id, user.id);
    await interaction.editReply(`Kick failed: ${error.message}`);
    return;
  }

  const dmDelivered = await sendModerationDirectMessage(dmChannel, {
    title: `Removed from ${interaction.guild.name}`,
    emoji: '🥾',
    color: colors.danger,
    summary: `You were kicked from **${interaction.guild.name}**.`,
    caseId,
    reason,
    moderator: interaction.user,
    nextSteps: 'You may rejoin if you still have a valid invite, unless staff instructs otherwise.',
  });
  const logged = await logBotModerationAction(interaction.client, {
    command: 'kick',
    logTitle: 'Member Kicked',
    logSummary: `${user} was kicked through the bot.`,
    emoji: '🥾',
    color: colors.danger,
    caseId,
    user,
    moderator: interaction.user,
    reason,
    dmDelivered,
  });
  let caseSaved = true;

  try {
    await recordModerationCase(config, {
      number: caseNumber,
      guildId: interaction.guildId,
      action: 'kick',
      userId: user.id,
      userTag: user.tag || user.username,
      moderatorId: interaction.user.id,
      moderatorTag: interaction.user.tag || interaction.user.username,
      reason,
      channelId: interaction.channelId,
      dmDelivered,
      logDelivered: logged,
    });
  } catch (error) {
    caseSaved = false;
    console.error(`Failed to store ${caseId}:`, error);
  }

  await interaction.editReply(
    `${caseId}: ${user.tag || user.username} was kicked.${dmDelivered ? '' : ' Their DM could not be delivered.'}${logged ? '' : ' The case log channel was unavailable.'}${caseSaved ? '' : ' The action succeeded, but the case ledger could not be updated.'}`,
  );
}

module.exports = { data, execute };
