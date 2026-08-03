const { Events } = require('discord.js');

const { config } = require('../utils/config');
const {
  getYouTubeUploadStateStorageInfo,
  runYouTubeUploadCheck,
} = require('../utils/youtubeUploadMonitor');

let checkInProgress = false;
const recentFeedErrors = new Map();

function setup(client) {
  if (!config.youtubeMonitor.enabled) {
    return;
  }

  client.once(Events.ClientReady, async () => {
    const storage = getYouTubeUploadStateStorageInfo(config);

    console.log(
      `YouTube upload state: ${storage.filePath} (${storage.persistent ? 'persistent' : 'ephemeral'}, ${storage.source}).`,
    );

    if (!storage.persistent) {
      console.warn('YouTube upload history will reset after redeploys unless a Railway volume is attached.');
    }

    await checkForUploads(client);
    const timer = setInterval(
      () => checkForUploads(client),
      config.youtubeMonitor.pollIntervalSeconds * 1000,
    );
    timer.unref();
  });
}

async function checkForUploads(client) {
  if (checkInProgress || !config.youtubeMonitor.enabled) {
    return;
  }

  checkInProgress = true;

  try {
    const result = await runYouTubeUploadCheck(client, config);

    if (result.initialized) {
      console.log(
        `YouTube upload monitor initialized ${result.initializedSources.length} channel(s) with ${result.videos.length} recent video(s).`,
      );
    }

    for (const video of result.announced) {
      console.log(
        `Announced YouTube upload from ${video.source.displayName}: ${video.title} (${video.id}).`,
      );
    }

    for (const source of result.checkedSources) {
      if (recentFeedErrors.has(source.channelId)) {
        console.log(`YouTube feed recovered for ${source.displayName} (${source.channelId}).`);
        recentFeedErrors.delete(source.channelId);
      }
    }

    for (const error of result.errors) {
      const signature = `${error.channelId}:${error.message}`;
      const previousError = recentFeedErrors.get(error.channelId);

      if (previousError === signature) {
        continue;
      }

      recentFeedErrors.set(error.channelId, signature);
      console.error(
        `YouTube feed check failed for ${error.displayName} (${error.channelId}): ${error.message}`,
      );
    }
  } catch (error) {
    console.error('Error checking YouTube uploads:', error);
  } finally {
    checkInProgress = false;
  }
}

module.exports = { name: 'youtubeUploadMonitor', setup };
