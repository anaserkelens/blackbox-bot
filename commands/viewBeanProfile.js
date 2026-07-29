const {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  MessageFlags,
} = require('discord.js');

const { config } = require('../utils/config');
const { getCommunityGrowthProfile } = require('../utils/communityGrowth');
const { createCommunityProfileEmbed } = require('../utils/communityGrowthDisplay');

const data = new ContextMenuCommandBuilder()
  .setName('View Bean Profile')
  .setType(ApplicationCommandType.User)
  .setDMPermission(false);

async function execute(interaction) {
  const user = interaction.targetUser;
  const member = interaction.targetMember
    || await interaction.guild?.members.fetch(user.id).catch(() => null);
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
    flags: MessageFlags.Ephemeral,
  });
}

module.exports = { data, execute, hiddenFromHelp: true };
