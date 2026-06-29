const {
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} = require('discord.js');

const { config } = require('../utils/config');
const {
  formatCaseReference,
  recordModerationCase,
  reserveModerationCaseNumber,
} = require('../utils/moderationCases');
const {
  colors,
  createStructuredLogPayload,
  formatUser,
  sendStructuredLog,
} = require('../utils/structuredLog');

const data = new SlashCommandBuilder()
  .setName('warn')
  .setDescription('Issue and log a formal warning.')
  .addUserOption((option) =>
    option
      .setName('member')
      .setDescription('The member receiving the warning.')
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName('reason')
      .setDescription('The reason for the warning.')
      .setMaxLength(1000)
      .setRequired(true),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .setDMPermission(false);

async function execute(interaction) {
  const hasModeratorRole = config.roles.moderator
    ? interaction.member?.roles?.cache?.has(config.roles.moderator)
    : false;
  const canWarn =
    interaction.memberPermissions?.has(PermissionFlagsBits.ModerateMembers) ||
    interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) ||
    hasModeratorRole;

  if (!interaction.inGuild() || !canWarn) {
    await interaction.reply({
      content: 'You need Moderate Members, Administrator, or the configured moderator role to issue warnings.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const user = interaction.options.getUser('member', true);
  const member = interaction.options.getMember('member');
  const reason = interaction.options.getString('reason', true).trim();

  if (user.bot || user.id === interaction.user.id) {
    await interaction.reply({
      content: 'You cannot warn that account.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  let caseNumber;

  try {
    caseNumber = await reserveModerationCaseNumber(config);
  } catch (error) {
    await interaction.editReply(`The warning was not issued because case storage is unavailable: ${error.message}`);
    return;
  }

  const caseId = formatCaseReference(caseNumber);
  let dmDelivered = true;

  try {
    await user.send(
      createStructuredLogPayload({
        title: `Warning from ${interaction.guild.name}`,
        emoji: '⚠️',
        color: colors.warning,
        summary: 'A moderator has issued you a formal warning.',
        referenceId: caseId,
        fields: [
          { name: 'Reason', value: reason },
          { name: 'Moderator', value: formatUser(interaction.user) },
        ],
      }),
    );
  } catch {
    dmDelivered = false;
  }

  const logged = await sendStructuredLog(interaction.client, config.channels.caseFiles, {
    title: 'Formal Warning Issued',
    emoji: '⚠️',
    color: colors.warning,
    summary: `${user} received a formal warning.`,
    thumbnailUrl: user.displayAvatarURL({ size: 256 }),
    referenceId: caseId,
    fields: [
      { name: 'Member', value: formatUser(user) },
      { name: 'Moderator', value: formatUser(interaction.user) },
      { name: 'Reason', value: reason },
      { name: 'Issued In', value: `${interaction.channel}\n-# Channel ID: \`${interaction.channelId}\`` },
      { name: 'Direct Message', value: dmDelivered ? 'Delivered successfully' : 'Could not be delivered' },
      { name: 'Member Present', value: member ? 'Yes' : 'No / unresolved' },
    ],
  });
  let caseSaved = true;

  try {
    await recordModerationCase(config, {
      number: caseNumber,
      guildId: interaction.guildId,
      action: 'warn',
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
    `${caseId} issued to ${user}.${dmDelivered ? '' : ' Their DMs are closed.'}${logged ? '' : ' The case log channel was unavailable.'}${caseSaved ? '' : ' The action succeeded, but the case ledger could not be updated.'}`,
  );
}

module.exports = { data, execute };
