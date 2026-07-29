const {
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} = require('discord.js');

const {
  getProtectionOverview,
  syncNativeAutoModerationRules,
} = require('../utils/beanProtection');
const { config } = require('../utils/config');
const { canUseModerationCommand } = require('../utils/moderationActions');

const data = new SlashCommandBuilder()
  .setName('protection')
  .setDescription('Inspect and manage Bean Protection.')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('status')
      .setDescription('Show Bean Protection, raid mode, and Discord AutoMod status.'),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('incidents')
      .setDescription('Show the latest protection incidents.')
      .addIntegerOption((option) =>
        option
          .setName('limit')
          .setDescription('How many incidents to show.')
          .setMinValue(1)
          .setMaxValue(10),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('sync')
      .setDescription('Create or update Bean-managed Discord AutoMod rules.'),
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

  if (subcommand === 'sync') {
    await handleSync(interaction);
    return;
  }

  const overview = await getProtectionOverview(interaction.client, config);

  if (subcommand === 'incidents') {
    const limit = interaction.options.getInteger('limit') || 5;
    const incidents = overview.incidents.slice(0, limit);
    const description = incidents.length
      ? incidents.map((incident) => {
        const member = incident.userId ? `<@${incident.userId}>` : 'Server-wide';
        const reference = incident.caseReference ? ` · \`${incident.caseReference}\`` : '';
        const timestamp = Math.floor(new Date(incident.createdAt).getTime() / 1000);

        return `**${humanize(incident.type)}** — ${member}${reference}\n${incident.summary}\n-# <t:${timestamp}:R> · ${humanize(incident.source)}`;
      }).join('\n\n')
      : 'No protection incidents have been recorded.';

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x5865f2)
          .setTitle('Recent Bean Protection incidents')
          .setDescription(description),
      ],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const enabled = Boolean(config.dashboard.features?.beanProtection);
  const settings = overview.settings;
  const nativeSummary = overview.native.available
    ? `${overview.native.beanRules.length} Bean-managed / ${overview.native.totalRules} total`
    : 'Unavailable';

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(overview.raid.active ? 0xed4245 : enabled ? 0x57f287 : 0x747f8d)
        .setTitle('Bean Protection status')
        .addFields(
          { name: 'Protection', value: enabled ? 'Enabled' : 'Disabled', inline: true },
          { name: 'Raid Mode', value: overview.raid.active ? 'Active' : 'Inactive', inline: true },
          { name: 'Discord AutoMod', value: nativeSummary, inline: true },
          { name: 'Last 24 Hours', value: `${overview.metrics.incidents24h} incidents`, inline: true },
          { name: 'Quarantine Queue', value: `${overview.metrics.pendingQuarantines || 0} pending`, inline: true },
          {
            name: 'Behavioral Detection',
            value: `Flood: ${settings.floodMessageLimit} messages / ${settings.floodWindowSeconds}s\nDuplicates: ${settings.duplicateMessageLimit} / ${settings.duplicateWindowSeconds}s`,
            inline: true,
          },
          {
            name: 'Join Detection',
            value: `${settings.joinLimit} joins / ${settings.joinWindowSeconds}s\nAuto raid mode: ${settings.autoRaidMode ? 'On' : 'Off'}`,
            inline: true,
          },
        ),
    ],
    flags: MessageFlags.Ephemeral,
  });
}

async function handleSync(interaction) {
  const canManageGuild = interaction.user.id === config.ownerUserId
    || interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)
    || interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)
    || interaction.member?.roles?.cache?.has(config.roles.founder)
    || interaction.member?.roles?.cache?.has(config.roles.staff);

  if (!canManageGuild) {
    await interaction.reply({
      content: 'You need Manage Server, Administrator, Founder, or Staff access to sync Discord AutoMod rules.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    const result = await syncNativeAutoModerationRules(interaction.guild, config, interaction.user);

    await interaction.editReply(
      `Discord AutoMod synced: ${result.created.length} created and ${result.updated.length} updated.`,
    );
  } catch (error) {
    await interaction.editReply(`Discord AutoMod sync failed: ${error.message}`);
  }
}

function humanize(value) {
  return String(value || '')
    .replaceAll('-', ' ')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

module.exports = { data, execute };
