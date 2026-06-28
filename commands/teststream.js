const { MessageFlags, SlashCommandBuilder } = require('discord.js');

const { config } = require('../utils/config');
const { createStreamAnnouncementPayload } = require('../utils/streamAnnouncement');
const { loadStreamEmbedSettings } = require('../utils/streamEmbedSettings');

const data = new SlashCommandBuilder()
  .setName('teststream')
  .setDescription('Test the saved live stream announcement embed.')
  .setDMPermission(false);

async function execute(interaction) {
  const isOwner = interaction.user.id === config.ownerUserId;
  const hasFounderRole = interaction.member?.roles?.cache?.has(config.roles.founder);

  if (!interaction.inGuild() || !isOwner || !hasFounderRole) {
    await interaction.reply({
      content: 'Only the bot owner with the Founder role can use this command.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  if (!interaction.channel?.isSendable()) {
    await interaction.editReply('This channel is not available for the live embed test.');
    return;
  }

  const settings = await loadStreamEmbedSettings(config);
  const payload = createStreamAnnouncementPayload(settings, {
    member: interaction.member,
    streamingActivity: {
      details: 'Building something under control',
      state: 'Just Chatting',
      url: 'https://twitch.tv/5noof',
    },
    twitchUsername: '5noof',
    previewUrl: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_5noof-1920x1080.jpg',
    timestamp: new Date(),
  });

  await interaction.channel.send(payload);
  await interaction.editReply(`Live embed test sent in ${interaction.channel}.`);
}

module.exports = { data, execute, ownerOnly: true };
