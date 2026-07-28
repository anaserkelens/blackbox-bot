const { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

const { config } = require('../utils/config');
const { createYouTubeAnnouncementPayload } = require('../utils/streamAnnouncement');
const { loadYouTubeEmbedSettings } = require('../utils/youtubeEmbedSettings');
const { fetchYouTubeVideos } = require('../utils/youtubeUploadMonitor');

const data = new SlashCommandBuilder()
  .setName('testyoutube')
  .setDescription('Test the saved YouTube upload announcement.')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
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
    await interaction.editReply('This channel is not available for the YouTube announcement test.');
    return;
  }

  const settings = await loadYouTubeEmbedSettings(config);
  const [latestVideo] = await fetchYouTubeVideos(config.youtubeMonitor.channelId).catch((error) => {
    console.warn('Could not load the latest YouTube video for /testyoutube:', error);
    return [];
  });
  const video = latestVideo || {
    id: '67rGoXhQcvA',
    title: 'Go To Sleep While I Run The Best Restaurant in Town',
    url: 'https://www.youtube.com/watch?v=67rGoXhQcvA',
    thumbnailUrl: 'https://i.ytimg.com/vi/67rGoXhQcvA/hqdefault.jpg',
    publishedAt: new Date().toISOString(),
  };
  const payload = createYouTubeAnnouncementPayload(settings, {
    member: interaction.member,
    video,
    channelHandle: config.youtubeMonitor.channelHandle,
    timestamp: new Date(),
  });

  await interaction.channel.send(payload);
  await interaction.editReply(`YouTube upload test sent in ${interaction.channel}.`);
}

module.exports = { data, execute, ownerOnly: true };
