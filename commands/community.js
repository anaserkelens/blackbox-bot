const { MessageFlags, SlashCommandBuilder } = require('discord.js');

const { config } = require('../utils/config');
const {
  getCommunityGrowthOverview,
  listCommunityGrowthLeaderboard,
  updateCommunityGrowthProfile,
} = require('../utils/communityGrowth');
const {
  createLeaderboardEmbed,
  createSeasonEmbed,
} = require('../utils/communityGrowthDisplay');

const traitChoices = [
  ['Overall growth', 'total'],
  ['Presence', 'presence'],
  ['Spark', 'spark'],
  ['Support', 'support'],
  ['Community', 'community'],
  ['Trust', 'trust'],
].map(([name, value]) => ({ name, value }));

const data = new SlashCommandBuilder()
  .setName('community')
  .setDescription('Explore and customize Community Growth.')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('leaderboard')
      .setDescription('View members leading through meaningful participation.')
      .addStringOption((option) =>
        option
          .setName('trait')
          .setDescription('The kind of growth to compare.')
          .addChoices(...traitChoices),
      )
      .addStringOption((option) =>
        option
          .setName('period')
          .setDescription('Compare this season or lifetime growth.')
          .addChoices(
            { name: 'Current season', value: 'season' },
            { name: 'Lifetime', value: 'lifetime' },
          ),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('season')
      .setDescription('View the current Community Growth season.'),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('customize')
      .setDescription('Customize your Community Growth profile.')
      .addStringOption((option) =>
        option
          .setName('bio')
          .setDescription('A short line shown on your profile.')
          .setMaxLength(160),
      )
      .addStringOption((option) =>
        option
          .setName('color')
          .setDescription('A six-digit hex color, such as #8FA1BE.')
          .setMinLength(7)
          .setMaxLength(7),
      )
      .addBooleanOption((option) =>
        option
          .setName('visible')
          .setDescription('Allow other members to view your profile and leaderboard placement.'),
      ),
  )
  .setDMPermission(false);

async function execute(interaction) {
  if (!interaction.inGuild()) {
    await interaction.reply({
      content: 'Community Growth is available inside the server.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const subcommand = interaction.options.getSubcommand();

  if (subcommand === 'leaderboard') {
    const result = await listCommunityGrowthLeaderboard(config, interaction.guildId, {
      trait: interaction.options.getString('trait') || 'total',
      period: interaction.options.getString('period') || 'season',
      limit: 10,
    });

    await interaction.reply({ embeds: [createLeaderboardEmbed(result)] });
    return;
  }

  if (subcommand === 'season') {
    const overview = await getCommunityGrowthOverview(config, interaction.guildId);

    await interaction.reply({ embeds: [createSeasonEmbed(overview)] });
    return;
  }

  const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
  const bio = interaction.options.getString('bio');
  const accentColor = interaction.options.getString('color');
  const visible = interaction.options.getBoolean('visible');

  if (accentColor && !/^#[0-9a-f]{6}$/i.test(accentColor)) {
    await interaction.reply({
      content: 'Use a six-digit hex color such as `#8FA1BE`.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  if (bio === null && accentColor === null && visible === null) {
    await interaction.reply({
      content: 'Choose at least one profile setting to update.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const profile = await updateCommunityGrowthProfile(config, {
    guildId: interaction.guildId,
    userId: interaction.user.id,
    displayName: member?.displayName || interaction.user.globalName || interaction.user.username,
    username: interaction.user.username,
    avatarUrl: interaction.user.displayAvatarURL({ size: 256 }),
    ...(bio !== null ? { bio } : {}),
    ...(accentColor !== null ? { accentColor } : {}),
    ...(visible !== null ? { visible } : {}),
  });

  await interaction.reply({
    content: `Your Community Growth profile is updated and ${profile.visible ? 'visible' : 'private'}.`,
    flags: MessageFlags.Ephemeral,
  });
}

module.exports = { data, execute };
