const { Events, MessageFlags, PermissionFlagsBits } = require('discord.js');

const { recordActivity } = require('../utils/activityFeed');
const { resolveQuarantineReview } = require('../utils/beanProtection');
const { config } = require('../utils/config');
const { canUseModerationCommand } = require('../utils/moderationActions');

const name = Events.InteractionCreate;

async function execute(interaction) {
  if (interaction.isButton() && interaction.customId.startsWith('bean-quarantine:')) {
    await handleQuarantineReviewButton(interaction);
    return;
  }

  if (!interaction.isChatInputCommand()) {
    return;
  }

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    await interaction.reply({
      content: 'That command is not available right now.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (interaction.guildId && interaction.user && !interaction.user.bot) {
    await recordActivity(config, {
      type: 'interaction',
      title: `/${interaction.commandName}`,
      summary: `${interaction.member?.displayName || interaction.user.globalName || interaction.user.username} used a Bean command.`,
      referenceId: `INTERACTION-${interaction.id}`,
      memberId: interaction.user.id,
      memberName: interaction.member?.displayName || interaction.user.globalName || interaction.user.username,
      guildId: interaction.guildId,
      action: 'command',
      visibleInFeed: false,
      metadata: {
        commandName: interaction.commandName,
        channelId: interaction.channelId || '',
      },
    }).catch((error) => console.error('Failed to record member interaction:', error));
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error while running /${interaction.commandName}:`, error);

    const response = {
      content: 'Something went wrong while running that command.',
      flags: MessageFlags.Ephemeral,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(response);
    } else {
      await interaction.reply(response);
    }
  }
}

async function handleQuarantineReviewButton(interaction) {
  if (!canUseModerationCommand(interaction, PermissionFlagsBits.ModerateMembers)) {
    await interaction.reply({
      content: 'You need moderation access to review quarantined members.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const [, action, reviewId] = interaction.customId.split(':');

  if (!['release', 'timeout'].includes(action) || !reviewId) {
    await interaction.reply({
      content: 'That quarantine review action is invalid.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    const durationMs = action === 'timeout' ? 10 * 60 * 1000 : null;
    const review = await resolveQuarantineReview(interaction.client, config, {
      reviewId,
      action,
      actor: interaction.user,
      reason: action === 'release'
        ? `Released by ${interaction.user.tag || interaction.user.username} after Discord review.`
        : `Timed out by ${interaction.user.tag || interaction.user.username} after Discord review.`,
      durationMs,
    });
    const reference = review.resolution?.caseReference
      ? ` ${review.resolution.caseReference} was created.`
      : '';

    await interaction.editReply(
      action === 'release'
        ? `Released ${review.userTag || review.userId} from quarantine.`
        : `Timed out ${review.userTag || review.userId} for 10 minutes.${reference}`,
    );
  } catch (error) {
    await interaction.editReply(`Quarantine review failed: ${error.message}`);
  }
}

module.exports = { name, execute };
