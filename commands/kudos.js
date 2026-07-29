const { EmbedBuilder, MessageFlags, SlashCommandBuilder } = require('discord.js');

const { config } = require('../utils/config');
const { giveCommunityKudos } = require('../utils/communityGrowth');

const data = new SlashCommandBuilder()
  .setName('kudos')
  .setDescription('Recognize a member for something meaningful.')
  .addUserOption((option) =>
    option
      .setName('member')
      .setDescription('The member you want to recognize.')
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName('reason')
      .setDescription('What did they do for the community?')
      .setMinLength(8)
      .setMaxLength(180)
      .setRequired(true),
  )
  .setDMPermission(false);

async function execute(interaction) {
  if (!interaction.inGuild()) {
    await interaction.reply({
      content: 'Community kudos can only be given inside the server.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const recipientUser = interaction.options.getUser('member', true);

  if (recipientUser.bot) {
    await interaction.reply({
      content: 'Kudos are for community members, not bots.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const giverMember = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
  const recipientMember = await interaction.guild.members.fetch(recipientUser.id).catch(() => null);

  if (!recipientMember) {
    await interaction.reply({
      content: 'That person is not currently a member of this server.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  try {
    const result = await giveCommunityKudos(config, {
      guildId: interaction.guildId,
      giverId: interaction.user.id,
      giverDisplayName: giverMember?.displayName || interaction.user.globalName || interaction.user.username,
      giverUsername: interaction.user.username,
      giverAvatarUrl: interaction.user.displayAvatarURL({ size: 256 }),
      recipientId: recipientUser.id,
      recipientDisplayName: recipientMember.displayName,
      recipientUsername: recipientUser.username,
      recipientAvatarUrl: recipientUser.displayAvatarURL({ size: 256 }),
      reason: interaction.options.getString('reason', true),
    });
    const embed = new EmbedBuilder()
      .setColor(0x8fa1be)
      .setTitle('Community Kudos')
      .setDescription(`**${result.recipient.displayName}** received kudos from **${result.giver.displayName}**.`)
      .addFields({
        name: 'Why',
        value: result.kudos.reason,
      })
      .setFooter({ text: '+5 Support · +1 Community · Genuine recognition only' })
      .setThumbnail(result.recipient.avatarUrl)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    await interaction.reply({
      content: error.message,
      flags: MessageFlags.Ephemeral,
    });
  }
}

module.exports = { data, execute };
