const { ActivityType, Events } = require('discord.js');

const { config } = require('../utils/config');
const { createStreamAnnouncementPayload } = require('../utils/streamAnnouncement');
const { getStreamEmbedRuntimeSettings } = require('../utils/streamEmbedSettings');
const { resolveStreamActions } = require('../utils/streamMonitorDelivery');

const announcedStreams = new Set();

module.exports = {
  name: Events.PresenceUpdate,
  async execute(oldPresence, newPresence, client) {
    const member = newPresence?.member;

    if (!config.streamMonitor.enabled || !member || member.user?.bot) {
      return;
    }

    const streamingActivity = findTwitchStream(newPresence);
    let settings;

    try {
      settings = await getStreamEmbedRuntimeSettings(config);
    } catch (error) {
      console.error('Failed to load Twitch live behavior:', error);
      return;
    }

    const delivery = settings.delivery || {
      mode: 'featured_with_role',
      featuredUserId: config.streamMonitor.featuredUserId,
    };
    const isFeaturedStreamer = member.id === delivery.featuredUserId;
    const actions = resolveStreamActions(
      delivery.mode,
      isFeaturedStreamer,
      Boolean(streamingActivity),
    );

    await Promise.all([
      actions.announce
        ? handleStreamAnnouncement(oldPresence, member, streamingActivity, client, settings)
        : clearFinishedAnnouncement(oldPresence, member, streamingActivity),
      updateBroadcastingRole(member, actions.assignRole),
    ]);
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

async function handleStreamAnnouncement(oldPresence, member, streamingActivity, client, settings) {
  if (!streamingActivity) {
    clearFinishedAnnouncement(oldPresence, member, streamingActivity);
    return;
  }

  const streamUrl = streamingActivity.url;
  const announcementKey = createAnnouncementKey(member.id, streamUrl);

  if (announcedStreams.has(announcementKey)) {
    return;
  }

  announcedStreams.add(announcementKey);

  try {
    const channelId = settings.channelId || config.channels.streamAnnouncements;
    const channel = await client.channels.fetch(channelId);

    if (!channel?.isSendable()) {
      throw new Error('Stream announcement channel is not sendable.');
    }

    const twitchUsername = new URL(streamUrl).pathname.split('/').filter(Boolean).pop();
    const streamPreviewUrl = `https://static-cdn.jtvnw.net/previews-ttv/live_user_${twitchUsername}-1920x1080.jpg`;
    const payload = createStreamAnnouncementPayload(settings, {
      member,
      streamingActivity,
      twitchUsername,
      previewUrl: streamPreviewUrl,
      timestamp: new Date(),
    });

    await channel.send(payload);
  } catch (error) {
    console.error(`Error announcing Twitch stream for ${member.id}:`, error);
    announcedStreams.delete(announcementKey);
  }
}

function clearFinishedAnnouncement(oldPresence, member, streamingActivity) {
  if (streamingActivity) {
    return;
  }

  const oldStreamingActivity = findTwitchStream(oldPresence || { activities: [] });

  if (oldStreamingActivity?.url) {
    announcedStreams.delete(createAnnouncementKey(member.id, oldStreamingActivity.url));
  }
}

function createAnnouncementKey(memberId, streamUrl) {
  return `${memberId}:${streamUrl}`;
}

async function updateBroadcastingRole(member, shouldHaveRole) {
  const roleId = config.roles.live;

  if (!roleId || member.roles.cache.has(roleId) === shouldHaveRole) {
    return;
  }

  try {
    if (shouldHaveRole) {
      await member.roles.add(roleId);
    } else {
      await member.roles.remove(roleId);
    }
  } catch (error) {
    console.error(`Failed to ${shouldHaveRole ? 'add' : 'remove'} Broadcasting role for ${member.id}:`, error);
  }
}
