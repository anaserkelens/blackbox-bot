const { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

const { config } = require('../utils/config');

const data = new SlashCommandBuilder()
  .setName('setupreactionrole')
  .setDescription('Add the configured verification reaction to the configured message.')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setDMPermission(false);

async function execute(interaction) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  if (
    !config.reactionRole.channelId
    || !config.reactionRole.messageId
    || !config.reactionRole.emojiId
    || !config.roles.verified
  ) {
    await interaction.editReply(
      'Choose the channel and Verified role in the dashboard, then configure the reaction-role message and emoji.',
    );
    return;
  }

  const channel = await interaction.guild.channels.fetch(config.reactionRole.channelId).catch(() => null);

  if (!channel?.isTextBased()) {
    await interaction.editReply(`Reaction role channel ${config.reactionRole.channelId} was not found.`);
    return;
  }

  const message = await channel.messages.fetch(config.reactionRole.messageId).catch(() => null);

  if (!message) {
    await interaction.editReply(`Reaction role message ${config.reactionRole.messageId} was not found.`);
    return;
  }

  await message.react(config.reactionRole.emojiId);
  await interaction.editReply('Reaction role has been set up.');
}

module.exports = { data, execute };
