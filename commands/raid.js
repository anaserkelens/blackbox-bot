const {
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} = require('discord.js');

const {
  getProtectionOverview,
  setRaidMode,
} = require('../utils/beanProtection');
const { config } = require('../utils/config');
const { canUseModerationCommand } = require('../utils/moderationActions');

const data = new SlashCommandBuilder()
  .setName('raid')
  .setDescription('Control Bean raid mode and new-member quarantine.')
  .addSubcommand((subcommand) =>
    subcommand.setName('status').setDescription('Show the current raid-mode state.'),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('enable')
      .setDescription('Enable raid mode and quarantine new arrivals.')
      .addStringOption((option) =>
        option
          .setName('reason')
          .setDescription('Why raid mode is being enabled.')
          .setMaxLength(500)
          .setRequired(true),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('disable')
      .setDescription('Disable raid mode. Existing quarantine roles are preserved.')
      .addStringOption((option) =>
        option
          .setName('reason')
          .setDescription('Why raid mode is being disabled.')
          .setMaxLength(500)
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
      content: 'You need Moderate Members, Administrator, or the configured moderator role to use this command.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const subcommand = interaction.options.getSubcommand();

  if (subcommand === 'status') {
    const overview = await getProtectionOverview(interaction.client, config);
    const changedAt = overview.raid.changedAt
      ? `<t:${Math.floor(new Date(overview.raid.changedAt).getTime() / 1000)}:R>`
      : 'Never changed';

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(overview.raid.active ? 0xed4245 : 0x57f287)
          .setTitle(overview.raid.active ? 'Raid mode is active' : 'Raid mode is inactive')
          .setDescription(
            overview.raid.active
              ? 'New members receive the configured quarantine role until staff disable raid mode.'
              : 'New members are not being quarantined by raid mode.',
          )
          .addFields(
            { name: 'Changed', value: changedAt, inline: true },
            { name: 'Source', value: overview.raid.source || 'Manual', inline: true },
            { name: 'Reason', value: overview.raid.reason || 'No reason recorded.' },
          ),
      ],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (!config.dashboard.features?.beanProtection) {
    await interaction.reply({
      content: 'Enable Bean Protection in the dashboard before changing raid mode.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const active = subcommand === 'enable';
  const reason = interaction.options.getString('reason', true).trim();
  const overview = await getProtectionOverview(interaction.client, config);

  if (overview.raid.active === active) {
    await interaction.reply({
      content: `Raid mode is already ${active ? 'enabled' : 'disabled'}.`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  await setRaidMode(interaction.client, config, {
    active,
    guildId: interaction.guildId,
    actor: interaction.user,
    reason,
    source: 'slash-command',
  });

  await interaction.editReply(
    active
      ? 'Raid mode enabled. New members will receive the configured quarantine role.'
      : 'Raid mode disabled. Existing quarantine roles were preserved for staff review.',
  );
}

module.exports = { data, execute };
