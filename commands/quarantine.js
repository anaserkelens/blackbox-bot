const {
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} = require('discord.js');

const {
  addQuarantineReviewNote,
  getProtectionOverview,
  resolveQuarantineReview,
} = require('../utils/beanProtection');
const { config } = require('../utils/config');
const { canUseModerationCommand } = require('../utils/moderationActions');

const timeoutChoices = [
  { name: '10 minutes', value: 10 },
  { name: '30 minutes', value: 30 },
  { name: '1 hour', value: 60 },
  { name: '6 hours', value: 360 },
  { name: '1 day', value: 1440 },
  { name: '7 days', value: 10080 },
  { name: '28 days', value: 40320 },
];

const data = new SlashCommandBuilder()
  .setName('quarantine')
  .setDescription('Review members quarantined by Bean Protection.')
  .addSubcommand((subcommand) =>
    subcommand.setName('list').setDescription('List pending quarantine reviews.'),
  )
  .addSubcommand((subcommand) =>
    addReviewAndReasonOptions(
      subcommand.setName('release').setDescription('Release a member from quarantine.'),
    ),
  )
  .addSubcommand((subcommand) =>
    addReviewAndReasonOptions(
      subcommand
        .setName('timeout')
        .setDescription('Timeout a quarantined member and release their quarantine role.')
        .addIntegerOption((option) =>
          option
            .setName('duration')
            .setDescription('How long the timeout should last.')
            .addChoices(...timeoutChoices)
            .setRequired(true),
        ),
    ),
  )
  .addSubcommand((subcommand) =>
    addReviewAndReasonOptions(
      subcommand.setName('kick').setDescription('Kick a quarantined member.'),
    ),
  )
  .addSubcommand((subcommand) =>
    addReviewAndReasonOptions(
      subcommand.setName('ban').setDescription('Ban a quarantined member.'),
    ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('note')
      .setDescription('Add a moderator note to a quarantine review.')
      .addStringOption(addReviewIdOption)
      .addStringOption((option) =>
        option
          .setName('note')
          .setDescription('The note to save.')
          .setMaxLength(1000)
          .setRequired(true),
      ),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .setDMPermission(false);

function addReviewAndReasonOptions(subcommand) {
  return subcommand
    .addStringOption(addReviewIdOption)
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Why this decision was made.')
        .setMaxLength(1000)
        .setRequired(true),
    );
}

function addReviewIdOption(option) {
  return option
    .setName('review')
    .setDescription('The quarantine review ID shown by /quarantine list.')
    .setMaxLength(100)
    .setRequired(true);
}

async function execute(interaction) {
  if (
    !interaction.inGuild()
    || !canUseModerationCommand(interaction, PermissionFlagsBits.ModerateMembers)
  ) {
    await interaction.reply({
      content: 'You need Moderate Members, Administrator, or the configured moderator role to use this command.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const subcommand = interaction.options.getSubcommand();

  if (subcommand === 'list') {
    const overview = await getProtectionOverview(interaction.client, config);
    const allPending = overview.quarantineReviews
      .filter((review) => review.status === 'pending');
    const pending = allPending.slice(0, 10);
    const description = pending.length
      ? pending.map((review) => [
        `**${review.userTag || review.displayName || review.userId}**`,
        `\`${review.id}\``,
        `${review.raidReason || 'Raid-mode quarantine'} · <t:${Math.floor(new Date(review.createdAt).getTime() / 1000)}:R>`,
      ].join('\n')).join('\n\n')
      : 'There are no pending quarantine reviews.';

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(pending.length ? 0xfee75c : 0x57f287)
          .setTitle(`Quarantine Review Queue · ${allPending.length} pending`)
          .setDescription(description),
      ],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  const reviewId = interaction.options.getString('review', true);

  try {
    if (subcommand === 'note') {
      const review = await addQuarantineReviewNote(
        config,
        reviewId,
        interaction.options.getString('note', true),
        interaction.user,
      );

      await interaction.editReply(`Note added to ${review.id}.`);
      return;
    }

    const durationMinutes = subcommand === 'timeout'
      ? interaction.options.getInteger('duration', true)
      : null;
    const review = await resolveQuarantineReview(interaction.client, config, {
      reviewId,
      action: subcommand,
      actor: interaction.user,
      reason: interaction.options.getString('reason', true),
      durationMs: durationMinutes ? durationMinutes * 60 * 1000 : null,
    });
    const reference = review.resolution?.caseReference
      ? ` ${review.resolution.caseReference} was created.`
      : '';

    await interaction.editReply(
      `${review.userTag || review.userId} was ${review.status.replaceAll('_', ' ')}.${reference}`,
    );
  } catch (error) {
    await interaction.editReply(`Quarantine review failed: ${error.message}`);
  }
}

module.exports = { data, execute };
