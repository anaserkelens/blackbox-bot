const { MessageFlags, SlashCommandBuilder } = require('discord.js');

const { config } = require('../utils/config');
const { getCommunityGrowthProfile } = require('../utils/communityGrowth');
const { createCommunityProfileEmbed } = require('../utils/communityGrowthDisplay');

const data = new SlashCommandBuilder()
  .setName('profile')
  .setDescription('View a Community Growth profile.')
  .addUserOption((option) =>
    option
      .setName('member')
      .setDescription('The community member whose profile you want to view.'),
  )
  .addBooleanOption((option) =>
    option
      .setName('private')
      .setDescription('Only show the profile to you.'),
  )
  .setDMPermission(false);

async function execute(interaction) {
  if (!interaction.inGuild()) {
    await interaction.reply({
      content: 'Community Growth profiles are available inside the server.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const user = interaction.options.getUser('member') || interaction.user;
  const member = await interaction.guild.members.fetch(user.id).catch(() => null);
  const profile = await getCommunityGrowthProfile(config, interaction.guildId, user.id, {
    displayName: member?.displayName || user.globalName || user.username,
    username: user.username,
    avatarUrl: user.displayAvatarURL({ size: 256 }),
  });

  if (!profile.visible && user.id !== interaction.user.id) {
    await interaction.reply({
      content: 'That member keeps their Community Growth profile private.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.reply({
    embeds: [createCommunityProfileEmbed(profile)],
    flags: interaction.options.getBoolean('private') ? MessageFlags.Ephemeral : undefined,
  });
}

module.exports = { data, execute };
