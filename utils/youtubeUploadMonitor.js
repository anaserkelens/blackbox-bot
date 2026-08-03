const fs = require('node:fs/promises');
const path = require('node:path');

const { createYouTubeAnnouncementPayload } = require('./streamAnnouncement');
const { loadYouTubeEmbedSettings } = require('./youtubeEmbedSettings');
const { getYouTubeSourceUrl } = require('./youtubeChannels');

const defaultStatePath = path.join(__dirname, '..', 'data', 'youtube-upload-state.json');
const maximumSeenVideos = 50;
const defaultFeedRetryDelaysMs = [750, 2000];

async function runYouTubeUploadCheck(client, config, options = {}) {
  const settings = await loadYouTubeEmbedSettings(config);
  const sources = settings.sources || [];
  const state = await loadYouTubeUploadState(config);
  const nextState = {
    version: 2,
    channels: { ...state.channels },
  };
  const announced = [];
  const videos = [];
  const initializedSources = [];
  const checkedSources = [];
  const errors = [];

  for (const source of sources) {
    let sourceVideos;

    try {
      sourceVideos = await fetchYouTubeVideos(
        source.channelId,
        options.fetchImpl || globalThis.fetch,
        { retryDelaysMs: options.feedRetryDelaysMs },
      );
    } catch (error) {
      errors.push({
        channelId: source.channelId,
        displayName: source.displayName,
        message: error.message,
      });
      continue;
    }

    const enrichedVideos = sourceVideos.map((video) => ({ ...video, source }));
    videos.push(...enrichedVideos);
    checkedSources.push(source);

    if (sourceVideos.length === 0) {
      continue;
    }

    const currentIds = sourceVideos.map((video) => video.id);
    const sourceState = nextState.channels[source.channelId];
    const checkedAt = new Date().toISOString();

    if (!sourceState) {
      nextState.channels[source.channelId] = {
        seenVideoIds: currentIds.slice(0, maximumSeenVideos),
        initializedAt: checkedAt,
        checkedAt,
      };
      initializedSources.push(source);
      continue;
    }

    const seenVideoIds = new Set(sourceState.seenVideoIds || []);
    const newVideos = sourceVideos
      .filter((video) => !seenVideoIds.has(video.id))
      .sort((left, right) => new Date(left.publishedAt) - new Date(right.publishedAt));

    for (const video of newVideos) {
      try {
        await announceYouTubeVideo(client, config, video, source, settings);
      } catch (error) {
        errors.push({
          channelId: source.channelId,
          displayName: source.displayName,
          videoId: video.id,
          message: error.message,
        });
        continue;
      }

      seenVideoIds.add(video.id);
      announced.push({ ...video, source });
      nextState.channels[source.channelId] = {
        ...sourceState,
        seenVideoIds: uniqueVideoIds([video.id, ...seenVideoIds]),
        checkedAt,
      };
      await saveYouTubeUploadState(config, nextState);
    }

    nextState.channels[source.channelId] = {
      ...sourceState,
      seenVideoIds: uniqueVideoIds([...seenVideoIds]),
      checkedAt,
    };
  }

  await saveYouTubeUploadState(config, nextState);

  return {
    initialized: initializedSources.length > 0,
    initializedSources,
    announced,
    checkedSources,
    videos,
    errors,
  };
}

async function announceYouTubeVideo(client, config, video, source, existingSettings = null) {
  const settings = existingSettings || await loadYouTubeEmbedSettings(config);
  const resolvedSource = source || settings.sources?.[0];
  const channelId = settings.channelId
    || config.channels.youtubeAnnouncements
    || config.channels.streamAnnouncements;
  const channel = await client.channels.fetch(channelId);

  if (!channel?.isSendable()) {
    throw new Error('YouTube upload announcement channel is not sendable.');
  }

  const member = await resolveFeaturedMember(client, config, resolvedSource);
  const payload = createYouTubeAnnouncementPayload(settings, {
    member,
    video,
    channelHandle: resolvedSource?.handle || '',
    channelUrl: resolvedSource ? getYouTubeSourceUrl(resolvedSource) : '',
    timestamp: new Date(video.publishedAt),
  });

  await channel.send(payload);
}

async function resolveFeaturedMember(client, config, source) {
  const featuredUserId = source?.discordUserId;

  if (!featuredUserId) {
    const displayName = source?.displayName || source?.handle || 'YouTube creator';

    return {
      displayName,
      toString: () => displayName,
    };
  }

  const guilds = config.guildId
    ? [client.guilds.cache.get(config.guildId)].filter(Boolean)
    : [...client.guilds.cache.values()];

  for (const guild of guilds) {
    const cached = guild.members.cache.get(featuredUserId);

    if (cached) {
      return cached;
    }

    const fetched = await guild.members.fetch(featuredUserId).catch(() => null);

    if (fetched) {
      return fetched;
    }
  }

  return {
    displayName: source?.displayName || source?.handle || 'YouTube creator',
    toString: () => `<@${featuredUserId}>`,
  };
}

function uniqueVideoIds(values) {
  return [...new Set(values)].slice(0, maximumSeenVideos);
}

async function fetchYouTubeVideos(channelId, fetchImpl = globalThis.fetch, options = {}) {
  if (!/^UC[\w-]{22}$/.test(String(channelId || ''))) {
    throw new Error('YouTube channel ID is missing or invalid.');
  }

  if (typeof fetchImpl !== 'function') {
    throw new Error('This Node.js runtime does not provide fetch().');
  }

  const retryDelaysMs = options.retryDelaysMs || defaultFeedRetryDelaysMs;
  let response;

  for (let attempt = 0; attempt <= retryDelaysMs.length; attempt += 1) {
    try {
      response = await fetchImpl(
        `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`,
        {
          headers: {
            'User-Agent': 'UNDR-CTRL-Bean-Bot/1.0 (+https://www.youtube.com/@5nooof)',
          },
          signal: AbortSignal.timeout(20_000),
        },
      );
    } catch (error) {
      if (attempt === retryDelaysMs.length) {
        throw error;
      }

      await wait(retryDelaysMs[attempt]);
      continue;
    }

    if (response.ok || !isRetryableFeedStatus(response.status) || attempt === retryDelaysMs.length) {
      break;
    }

    await wait(retryDelaysMs[attempt]);
  }

  if (!response.ok) {
    throw new Error(`YouTube feed request failed with HTTP ${response.status}.`);
  }

  return parseYouTubeFeed(await response.text());
}

function isRetryableFeedStatus(status) {
  return status === 404 || status === 408 || status === 429 || status >= 500;
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
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
    if (state.channels && typeof state.channels === 'object') {
      return {
        version: 2,
        channels: Object.fromEntries(
          Object.entries(state.channels)
            .filter(([channelId]) => /^UC[\w-]{22}$/.test(channelId))
            .map(([channelId, value]) => [channelId, normalizeChannelState(value)]),
        ),
      };
    }

    const legacyChannelId = String(state.channelId || '');
    return {
      version: 2,
      channels: legacyChannelId
        ? { [legacyChannelId]: normalizeChannelState(state) }
        : {},
    };
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {
        version: 2,
        channels: {},
      };
    }

    throw error;
  }
}

function normalizeChannelState(value) {
  return {
    seenVideoIds: Array.isArray(value?.seenVideoIds)
      ? value.seenVideoIds.map(String).filter(Boolean).slice(0, maximumSeenVideos)
      : [],
    initializedAt: value?.initializedAt || null,
    checkedAt: value?.checkedAt || null,
  };
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
