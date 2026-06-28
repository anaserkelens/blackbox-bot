const { ActivityType, EmbedBuilder, Events } = require('discord.js');

const { config } = require('../utils/config');

const announcedFeaturedStreams = new Set();

module.exports = {
  name: Events.PresenceUpdate,
  async execute(oldPresence, newPresence, client) {
    const member = newPresence?.member;

    if (!config.streamMonitor.enabled || !member || member.user?.bot) {
      return;
    }

    const streamingActivity = findTwitchStream(newPresence);
    const isFeaturedStreamer = member.id === config.streamMonitor.featuredUserId;

    if (isFeaturedStreamer) {
      await handleFeaturedStreamer(oldPresence, member, streamingActivity, client);
      return;
    }

    await updateBroadcastingRole(member, Boolean(streamingActivity));
  },
};

function findTwitchStream(presence) {
  return presence?.activities?.find(
    (activity) =>
      activity.type === ActivityType.Streaming &&
      typeof activity.url === 'string' &&
      activity.url.toLowerCase().includes('twitch.tv/'),
  );
}

async function handleFeaturedStreamer(oldPresence, member, streamingActivity, client) {
  if (!streamingActivity) {
    const oldStreamingActivity = findTwitchStream(oldPresence || { activities: [] });

    if (oldStreamingActivity?.url) {
      announcedFeaturedStreams.delete(oldStreamingActivity.url);
    }

    return;
  }

  const streamUrl = streamingActivity.url;

  if (announcedFeaturedStreams.has(streamUrl) || !config.channels.streamAnnouncements) {
    return;
  }

  announcedFeaturedStreams.add(streamUrl);

  try {
    const channel = await client.channels.fetch(config.channels.streamAnnouncements);

    if (!channel?.isSendable()) {
      throw new Error('Featured stream announcement channel is not sendable.');
    }

    const twitchUsername = new URL(streamUrl).pathname.split('/').filter(Boolean).pop();
    const streamTitle = streamingActivity.details || 'Live on Twitch';
    const streamPreviewUrl = `https://static-cdn.jtvnw.net/previews-ttv/live_user_${twitchUsername}-1920x1080.jpg`;
    const embed = new EmbedBuilder()
      .setDescription(`# **${member} is now live!**\n\n-# ${streamTitle}\n\n-# [Watch Stream](${streamUrl})`)
      .setColor(0x2dd4bf)
      .setImage(streamPreviewUrl);

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Error announcing featured stream:', error);
    announcedFeaturedStreams.delete(streamUrl);
  }
}

async function updateBroadcastingRole(member, isStreaming) {
  const roleId = config.roles.live;

  if (!roleId || member.roles.cache.has(roleId) === isStreaming) {
    return;
  }

  try {
    if (isStreaming) {
      await member.roles.add(roleId);
    } else {
      await member.roles.remove(roleId);
    }
  } catch (error) {
    console.error(`Failed to ${isStreaming ? 'add' : 'remove'} Broadcasting role for ${member.id}:`, error);
  }
}
