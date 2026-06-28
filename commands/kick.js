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

  const caseId = createCaseId('kick', user.id);
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

  await interaction.editReply(
    `${user.tag || user.username} was kicked.${dmDelivered ? '' : ' Their DM could not be delivered.'}${logged ? '' : ' The case log channel was unavailable.'}`,
  );
}

module.exports = { data, execute };
