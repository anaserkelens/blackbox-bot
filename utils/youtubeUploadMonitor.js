const fs = require('node:fs/promises');
const path = require('node:path');

const { createYouTubeAnnouncementPayload } = require('./streamAnnouncement');
const { loadYouTubeEmbedSettings } = require('./youtubeEmbedSettings');

const defaultStatePath = path.join(__dirname, '..', 'data', 'youtube-upload-state.json');
const maximumSeenVideos = 50;

async function runYouTubeUploadCheck(client, config, options = {}) {
  const videos = await fetchYouTubeVideos(
    config.youtubeMonitor.channelId,
    options.fetchImpl || globalThis.fetch,
  );

  if (videos.length === 0) {
    return { initialized: false, announced: [], videos: [] };
  }

  const state = await loadYouTubeUploadState(config);
  const currentIds = videos.map((video) => video.id);

  if (!state.channelId || state.channelId !== config.youtubeMonitor.channelId) {
    await saveYouTubeUploadState(config, {
      channelId: config.youtubeMonitor.channelId,
      seenVideoIds: currentIds,
      initializedAt: new Date().toISOString(),
      checkedAt: new Date().toISOString(),
    });

    return { initialized: true, announced: [], videos };
  }

  const seenVideoIds = new Set(state.seenVideoIds || []);
  const newVideos = videos
    .filter((video) => !seenVideoIds.has(video.id))
    .sort((left, right) => new Date(left.publishedAt) - new Date(right.publishedAt));
  const announced = [];

  for (const video of newVideos) {
    await announceYouTubeVideo(client, config, video);
    seenVideoIds.add(video.id);
    announced.push(video);

    await saveYouTubeUploadState(config, {
      ...state,
      channelId: config.youtubeMonitor.channelId,
      seenVideoIds: [
        video.id,
        ...seenVideoIds,
      ].filter((videoId, index, values) => values.indexOf(videoId) === index)
        .slice(0, maximumSeenVideos),
      checkedAt: new Date().toISOString(),
    });
  }

  const nextSeenVideoIds = [
    ...currentIds,
    ...seenVideoIds,
  ].filter((videoId, index, values) => values.indexOf(videoId) === index)
    .slice(0, maximumSeenVideos);

  await saveYouTubeUploadState(config, {
    ...state,
    channelId: config.youtubeMonitor.channelId,
    seenVideoIds: nextSeenVideoIds,
    checkedAt: new Date().toISOString(),
  });

  return { initialized: false, announced, videos };
}

async function announceYouTubeVideo(client, config, video) {
  const settings = await loadYouTubeEmbedSettings(config);
  const channelId = settings.channelId
    || config.channels.youtubeAnnouncements
    || config.channels.streamAnnouncements;
  const channel = await client.channels.fetch(channelId);

  if (!channel?.isSendable()) {
    throw new Error('YouTube upload announcement channel is not sendable.');
  }

  const member = await resolveFeaturedMember(client, config);
  const payload = createYouTubeAnnouncementPayload(settings, {
    member,
    video,
    channelHandle: config.youtubeMonitor.channelHandle,
    timestamp: new Date(video.publishedAt),
  });

  await channel.send(payload);
}

async function resolveFeaturedMember(client, config) {
  const guilds = config.guildId
    ? [client.guilds.cache.get(config.guildId)].filter(Boolean)
    : [...client.guilds.cache.values()];

  for (const guild of guilds) {
    const cached = guild.members.cache.get(config.youtubeMonitor.featuredUserId);

    if (cached) {
      return cached;
    }

    const fetched = await guild.members.fetch(config.youtubeMonitor.featuredUserId).catch(() => null);

    if (fetched) {
      return fetched;
    }
  }

  const userId = config.youtubeMonitor.featuredUserId;

  return {
    displayName: config.youtubeMonitor.channelDisplayName || 'snuf',
    toString: () => `<@${userId}>`,
  };
}

async function fetchYouTubeVideos(channelId, fetchImpl = globalThis.fetch) {
  if (!/^UC[\w-]{22}$/.test(String(channelId || ''))) {
    throw new Error('YouTube channel ID is missing or invalid.');
  }

  if (typeof fetchImpl !== 'function') {
    throw new Error('This Node.js runtime does not provide fetch().');
  }

  const response = await fetchImpl(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`,
    {
      headers: {
        'User-Agent': 'UNDR-CTRL-Bean-Bot/1.0 (+https://www.youtube.com/@5nooof)',
      },
      signal: AbortSignal.timeout(20_000),
    },
  );

  if (!response.ok) {
    throw new Error(`YouTube feed request failed with HTTP ${response.status}.`);
  }

  return parseYouTubeFeed(await response.text());
}

function parseYouTubeFeed(xml) {
  const entries = String(xml || '').match(/<entry>[\s\S]*?<\/entry>/g) || [];

  return entries.map((entry) => {
    const id = readXmlElement(entry, 'yt:videoId');
    const title = readXmlElement(entry, 'title');
    const publishedAt = readXmlElement(entry, 'published');
    const link = entry.match(/<link\b[^>]*\brel=(?:"alternate"|'alternate')[^>]*\bhref=(?:"([^"]+)"|'([^']+)')[^>]*\/?>/i);
    const thumbnail = entry.match(/<media:thumbnail\b[^>]*\burl=(?:"([^"]+)"|'([^']+)')[^>]*\/?>/i);

    return {
      id,
      title,
      url: decodeXml(link?.[1] || link?.[2] || `https://www.youtube.com/watch?v=${id}`),
      thumbnailUrl: decodeXml(
        thumbnail?.[1] || thumbnail?.[2] || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      ),
      publishedAt,
    };
  }).filter((video) =>
    /^[\w-]{11}$/.test(video.id)
    && video.title
    && !Number.isNaN(new Date(video.publishedAt).getTime()),
  );
}

function readXmlElement(xml, name) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = String(xml).match(new RegExp(`<${escapedName}>([\\s\\S]*?)<\\/${escapedName}>`, 'i'));
  return decodeXml(match?.[1] || '').trim();
}

function decodeXml(value) {
  return String(value || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

async function loadYouTubeUploadState(config) {
  const { filePath } = getYouTubeUploadStateStorageInfo(config);

  try {
    const state = JSON.parse(await fs.readFile(filePath, 'utf8'));
    return {
      channelId: String(state.channelId || ''),
      seenVideoIds: Array.isArray(state.seenVideoIds)
        ? state.seenVideoIds.map(String).filter(Boolean).slice(0, maximumSeenVideos)
        : [],
      initializedAt: state.initializedAt || null,
      checkedAt: state.checkedAt || null,
    };
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {
        channelId: '',
        seenVideoIds: [],
        initializedAt: null,
        checkedAt: null,
      };
    }

    throw error;
  }
}

async function saveYouTubeUploadState(config, state) {
  const { filePath } = getYouTubeUploadStateStorageInfo(config);
  const temporaryPath = `${filePath}.${process.pid}.tmp`;

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(temporaryPath, JSON.stringify(state, null, 2));
  await fs.rename(temporaryPath, filePath);
  return state;
}

function getYouTubeUploadStateStorageInfo(config) {
  if (config.dashboard.youtubeUploadStatePath) {
    return {
      filePath: config.dashboard.youtubeUploadStatePath,
      persistent: true,
      source: 'YOUTUBE_UPLOAD_STATE_PATH',
    };
  }

  if (config.dashboard.railwayVolumeMountPath) {
    return {
      filePath: path.join(config.dashboard.railwayVolumeMountPath, 'youtube-upload-state.json'),
      persistent: true,
      source: 'RAILWAY_VOLUME_MOUNT_PATH',
    };
  }

  if (config.dashboard.savedMessagesPath) {
    return {
      filePath: path.join(path.dirname(config.dashboard.savedMessagesPath), 'youtube-upload-state.json'),
      persistent: true,
      source: 'DASHBOARD_SAVED_MESSAGES_PATH directory',
    };
  }

  return {
    filePath: defaultStatePath,
    persistent: false,
    source: 'app filesystem',
  };
}

module.exports = {
  announceYouTubeVideo,
  fetchYouTubeVideos,
  getYouTubeUploadStateStorageInfo,
  loadYouTubeUploadState,
  parseYouTubeFeed,
  runYouTubeUploadCheck,
  saveYouTubeUploadState,
};
