const { MessageFlags, SlashCommandBuilder } = require('discord.js');

const { config } = require('../utils/config');
const { setTempVoiceRoomLimit } = require('../utils/tempVoiceRooms');

const data = new SlashCommandBuilder()
  .setName('room')
  .setDescription('Control your temporary voice room.')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('limit')
      .setDescription('Set how many members can join your temporary voice room.')
      .addIntegerOption((option) =>
        option
          .setName('members')
          .setDescription('Maximum members, or 0 for unlimited.')
          .setMinValue(0)
          .setMaxValue(99)
          .setRequired(true),
      ),
  )
  .setDMPermission(false);

async function execute(interaction) {
  if (!interaction.inGuild()) {
    await interaction.reply({
      content: 'Room controls can only be used inside the server.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const member = interaction.guild.members.cache.get(interaction.user.id)
    || await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
  const channelId = member?.voice?.channelId;

  if (!channelId) {
    await interaction.reply({
      content: 'Join your temporary voice room before changing its member limit.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const limit = interaction.options.getInteger('members', true);
  const result = await setTempVoiceRoomLimit(
    interaction.client,
    config,
    interaction.guildId,
    interaction.user.id,
    channelId,
    limit,
  );

  if (result.status === 'not_tracked') {
    await interaction.reply({
      content: 'This is not a temporary room created by Bean.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (result.status === 'not_owner') {
    await interaction.reply({
      content: 'Only the member who created this room can change its limit.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (result.status === 'unavailable') {
    await interaction.reply({
      content: 'Bean could not find that voice room anymore.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.reply({
    content: limit === 0
      ? `<#${channelId}> is now unlimited.`
      : `<#${channelId}> is now limited to ${limit} member${limit === 1 ? '' : 's'}.`,
    flags: MessageFlags.Ephemeral,
  });
}

module.exports = { data, execute };
