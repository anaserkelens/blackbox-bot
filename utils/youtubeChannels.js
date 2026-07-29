const maximumYouTubeSources = 3;

function createDefaultYouTubeSources(config) {
  return [{
    channelId: config.youtubeMonitor.channelId || '',
    handle: normalizeYouTubeHandle(config.youtubeMonitor.channelHandle),
    displayName: String(config.youtubeMonitor.channelDisplayName || '').trim().slice(0, 100),
    discordUserId: normalizeDiscordUserId(config.youtubeMonitor.featuredUserId),
  }];
}

function normalizeYouTubeSources(input, defaults = []) {
  const values = Array.isArray(input) ? input : defaults;

  if (!Array.isArray(values) || values.length === 0) {
    throw new Error('Add at least one YouTube channel to monitor.');
  }

  if (values.length > maximumYouTubeSources) {
    throw new Error(`YouTube upload notifications support up to ${maximumYouTubeSources} channels.`);
  }

  const sources = values.map((source, index) => normalizeYouTubeSource(source, index));
  const duplicate = sources.find((source, index) =>
    sources.findIndex((candidate) => candidate.channelId === source.channelId) !== index);

  if (duplicate) {
    throw new Error(`YouTube channel ${duplicate.channelId} was added more than once.`);
  }

  return sources;
}

function normalizeYouTubeSource(input, index = 0) {
  const source = input && typeof input === 'object' ? input : {};
  const channelId = parseYouTubeChannelId(source.channelId || source.reference);
  const handle = normalizeYouTubeHandle(source.handle);
  const displayName = String(source.displayName || handle || `YouTube channel ${index + 1}`)
    .trim()
    .slice(0, 100);
  const discordUserId = normalizeDiscordUserId(source.discordUserId);

  if (!channelId) {
    throw new Error(
      `YouTube channel ${index + 1} needs a valid channel ID or youtube.com/channel/ URL.`,
    );
  }

  if (source.handle && !handle) {
    throw new Error(`YouTube channel ${index + 1} has an invalid handle.`);
  }

  return {
    channelId,
    handle,
    displayName,
    discordUserId,
  };
}

async function resolveYouTubeSourceReferences(input, fetchImpl = globalThis.fetch) {
  if (!Array.isArray(input) || input.length === 0) {
    throw new Error('Add at least one YouTube channel to monitor.');
  }

  if (input.length > maximumYouTubeSources) {
    throw new Error(`YouTube upload notifications support up to ${maximumYouTubeSources} channels.`);
  }

  const resolved = [];

  for (let index = 0; index < input.length; index += 1) {
    const source = input[index] || {};
    const reference = String(source.channelId || source.reference || '').trim();
    const directChannelId = parseYouTubeChannelId(reference);

    if (directChannelId) {
      resolved.push({ ...source, channelId: directChannelId });
      continue;
    }

    const handle = normalizeYouTubeHandle(reference) || normalizeYouTubeHandle(source.handle);

    if (!handle) {
      throw new Error(
        `YouTube channel ${index + 1} needs a channel ID, /channel/ URL, handle, or @handle URL.`,
      );
    }

    if (typeof fetchImpl !== 'function') {
      throw new Error('This Node.js runtime cannot resolve YouTube handles.');
    }

    const response = await fetchImpl(`https://www.youtube.com/${handle}`, {
      headers: {
        'User-Agent': 'UNDR-CTRL-Bean-Bot/1.0 (+https://www.youtube.com)',
      },
      signal: AbortSignal.timeout(20_000),
    });

    if (!response.ok) {
      throw new Error(`YouTube could not resolve ${handle} (HTTP ${response.status}).`);
    }

    const html = await response.text();
    const channelId = extractYouTubeChannelId(html);

    if (!channelId) {
      throw new Error(`YouTube did not return a channel ID for ${handle}.`);
    }

    resolved.push({
      ...source,
      channelId,
      handle,
      displayName: source.displayName || extractYouTubeChannelName(html) || handle,
    });
  }

  return normalizeYouTubeSources(resolved);
}

function extractYouTubeChannelId(html) {
  const patterns = [
    /<meta[^>]+itemprop=["']channelId["'][^>]+content=["'](UC[\w-]{22})["']/i,
    /<meta[^>]+content=["'](UC[\w-]{22})["'][^>]+itemprop=["']channelId["']/i,
    /"externalId":"(UC[\w-]{22})"/,
    /"channelId":"(UC[\w-]{22})"/,
  ];

  for (const pattern of patterns) {
    const match = String(html || '').match(pattern);

    if (match) {
      return match[1];
    }
  }

  return '';
}

function extractYouTubeChannelName(html) {
  const match = String(html || '').match(
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
  );
  return decodeHtml(match?.[1] || '').trim().slice(0, 100);
}

function decodeHtml(value) {
  return String(value || '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function parseYouTubeChannelId(value) {
  const reference = String(value || '').trim();

  if (/^UC[\w-]{22}$/.test(reference)) {
    return reference;
  }

  let url;

  try {
    url = new URL(reference);
  } catch {
    return '';
  }

  if (!/(^|\.)youtube\.com$/i.test(url.hostname)) {
    return '';
  }

  const match = url.pathname.match(/\/channel\/(UC[\w-]{22})(?:\/|$)/i);
  return match?.[1] || '';
}

function normalizeYouTubeHandle(value) {
  const raw = String(value || '').trim();

  if (!raw) {
    return '';
  }

  let handle = raw;

  try {
    const url = new URL(raw);
    const match = url.pathname.match(/\/(@[\w.-]+)(?:\/|$)/);
    handle = match?.[1] || '';
  } catch {
    if (!handle.startsWith('@')) {
      handle = `@${handle}`;
    }
  }

  return /^@[\w.-]{1,100}$/.test(handle) ? handle : '';
}

function normalizeDiscordUserId(value) {
  const userId = String(value || '').trim();

  if (!userId) {
    return '';
  }

  if (!/^\d{17,20}$/.test(userId)) {
    throw new Error('Linked Discord creator ID must be a valid Discord user ID.');
  }

  return userId;
}

function getYouTubeSourceUrl(source) {
  if (source.handle) {
    return `https://www.youtube.com/${source.handle}`;
  }

  return `https://www.youtube.com/channel/${source.channelId}`;
}

module.exports = {
  createDefaultYouTubeSources,
  getYouTubeSourceUrl,
  maximumYouTubeSources,
  normalizeYouTubeHandle,
  normalizeYouTubeSource,
  normalizeYouTubeSources,
  parseYouTubeChannelId,
  resolveYouTubeSourceReferences,
};
