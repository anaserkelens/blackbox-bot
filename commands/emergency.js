const {
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} = require('discord.js');

const {
  activateEmergencySafetyProfile,
  getProtectionOverview,
  restoreEmergencySafetyProfile,
} = require('../utils/beanProtection');
const { config } = require('../utils/config');
const { canUseModerationCommand } = require('../utils/moderationActions');

const data = new SlashCommandBuilder()
  .setName('emergency')
  .setDescription('Control Bean emergency safety profiles.')
  .addSubcommand((subcommand) =>
    subcommand.setName('status').setDescription('Show the active emergency safety profile.'),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('activate')
      .setDescription('Temporarily tighten server protection.')
      .addStringOption((option) =>
        option
          .setName('profile')
          .setDescription('The safety profile to activate.')
          .addChoices(
            { name: 'Watch — stricter detection', value: 'watch' },
            { name: 'Raid — quarantine and high verification', value: 'raid' },
            { name: 'Lockdown — pause public conversation', value: 'lockdown' },
          )
          .setRequired(true),
      )
      .addIntegerOption((option) =>
        option
          .setName('duration')
          .setDescription('When Bean should automatically restore the server.')
          .addChoices(
            { name: '15 minutes', value: 15 },
            { name: '30 minutes', value: 30 },
            { name: '1 hour', value: 60 },
            { name: '2 hours', value: 120 },
            { name: '6 hours', value: 360 },
          )
          .setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName('reason')
          .setDescription('Why the emergency profile is required.')
          .setMaxLength(1000)
          .setRequired(true),
      )
      .addBooleanOption((option) =>
        option
          .setName('confirm')
          .setDescription('Confirm that Bean may change server safety settings.')
          .setRequired(true),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('restore')
      .setDescription('Restore the server state captured before activation.')
      .addStringOption((option) =>
        option
          .setName('reason')
          .setDescription('Why the server is being restored now.')
          .setMaxLength(1000)
          .setRequired(true),
      ),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .setDMPermission(false);

async function execute(interaction) {
  if (
    !interaction.inGuild()
    || !canUseModerationCommand(interaction, PermissionFlagsBits.ModerateMembers)
  ) {
    await interaction.reply({
      content: 'You need moderation access to control emergency safety profiles.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const subcommand = interaction.options.getSubcommand();
  const overview = await getProtectionOverview(interaction.client, config);

  if (subcommand === 'status') {
    await showStatus(interaction, overview);
    return;
  }

  if (!config.dashboard.features?.beanProtection) {
    await interaction.reply({
      content: 'Enable Bean Protection before using emergency safety profiles.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    if (subcommand === 'activate') {
      const confirmed = interaction.options.getBoolean('confirm', true);

      if (!confirmed) {
        await interaction.editReply('Activation cancelled because staff confirmation was not provided.');
        return;
      }

      const emergency = await activateEmergencySafetyProfile(interaction.client, config, {
        profile: interaction.options.getString('profile', true),
        durationMinutes: interaction.options.getInteger('duration', true),
        reason: interaction.options.getString('reason', true),
        actor: interaction.user,
        confirmed,
      });

      await interaction.editReply(
        `${emergency.profileName} activated until <t:${Math.floor(new Date(emergency.expiresAt).getTime() / 1000)}:F>. Use \`/emergency restore\` to end it early.`,
      );
      return;
    }

    const restored = await restoreEmergencySafetyProfile(interaction.client, config, {
      actor: interaction.user,
      reason: interaction.options.getString('reason', true),
    });

    await interaction.editReply(
      `Server restored. ${restored.result.restoredChannels.length} channel(s) restored and ${restored.result.skippedDrift.length} staff change(s) preserved.`,
    );
  } catch (error) {
    await interaction.editReply(`Emergency profile update failed: ${error.message}`);
  }
}

async function showStatus(interaction, overview) {
  const emergency = overview.emergency;

  if (!emergency.active) {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x57f287)
          .setTitle('No emergency safety profile is active')
          .setDescription('Bean is using the normal saved protection settings.'),
      ],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const expiresAt = Math.floor(new Date(emergency.expiresAt).getTime() / 1000);

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(emergency.profile === 'lockdown' ? 0xed4245 : 0xfee75c)
        .setTitle(`${emergency.profileName} safety profile is active`)
        .setDescription(emergency.reason)
        .addFields(
          { name: 'Status', value: emergency.status, inline: true },
          { name: 'Activated By', value: emergency.actor?.displayName || 'Bean', inline: true },
          { name: 'Restores', value: `<t:${expiresAt}:R>`, inline: true },
          {
            name: 'Current Thresholds',
            value: `Flood: ${overview.effectiveSettings.floodMessageLimit}/${overview.effectiveSettings.floodWindowSeconds}s\nMentions: ${overview.effectiveSettings.nativeMentionLimit}`,
            inline: true,
          },
          {
            name: 'Server Controls',
            value: `Raid mode: ${overview.raid.active ? 'Active' : 'Inactive'}\nLocked channels: ${overview.metrics.lockedChannels}`,
            inline: true,
          },
        ),
    ],
    flags: MessageFlags.Ephemeral,
  });
}

module.exports = { data, execute };
