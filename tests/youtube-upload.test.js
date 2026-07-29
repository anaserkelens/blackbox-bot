const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { after, before, test } = require('node:test');

process.env.DISCORD_TOKEN = process.env.DISCORD_TOKEN || 'test-token';

const {
  createDefaultYouTubeEmbedSettings,
  saveYouTubeEmbedSettings,
} = require('../utils/youtubeEmbedSettings');
const {
  normalizeYouTubeSources,
  resolveYouTubeSourceReferences,
} = require('../utils/youtubeChannels');
const {
  loadYouTubeUploadState,
  parseYouTubeFeed,
  runYouTubeUploadCheck,
} = require('../utils/youtubeUploadMonitor');

let temporaryDirectory;

before(async () => {
  temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'bean-youtube-test-'));
});

after(async () => {
  await fs.rm(temporaryDirectory, { force: true, recursive: true });
});

function createFeed(videos) {
  return `<?xml version="1.0" encoding="UTF-8"?>
    <feed>
      ${videos.map((video) => `
        <entry>
          <yt:videoId>${video.id}</yt:videoId>
          <title>${video.title}</title>
          <link rel="alternate" href="https://www.youtube.com/watch?v=${video.id}"/>
          <published>${video.publishedAt}</published>
          <media:thumbnail url="https://i.ytimg.com/vi/${video.id}/hqdefault.jpg"/>
        </entry>
      `).join('')}
    </feed>`;
}

function createConfig(name) {
  return {
    guildId: '1520000000000000100',
    channels: {
      streamAnnouncements: '1520519675543293972',
      youtubeAnnouncements: '1520519675543293972',
    },
    roles: {
      newUpload: '1520828024533159936',
    },
    youtubeMonitor: {
      channelId: 'UC7qyud6JzpiNoiFVQgzFAkg',
      channelHandle: '@5nooof',
      channelDisplayName: 'snuf',
      featuredUserId: '185282790969835520',
    },
    dashboard: {
      youtubeEmbedPath: path.join(temporaryDirectory, `${name}-embed.json`),
      youtubeUploadStatePath: path.join(temporaryDirectory, `${name}-state.json`),
      railwayVolumeMountPath: undefined,
      savedMessagesPath: undefined,
    },
  };
}

function createClient() {
  const sent = [];
  const member = {
    id: '185282790969835520',
    displayName: 'snuf',
    toString: () => '<@185282790969835520>',
    roles: { cache: new Map() },
  };
  const guild = {
    members: {
      cache: new Map([[member.id, member]]),
      fetch: async () => member,
    },
  };

  return {
    sent,
    client: {
      guilds: {
        cache: new Map([['1520000000000000100', guild]]),
      },
      channels: {
        fetch: async () => ({
          isSendable: () => true,
          send: async (payload) => {
            sent.push(payload);
          },
        }),
      },
    },
  };
}

test('YouTube feed parsing decodes titles and returns thumbnail data', () => {
  const [video] = parseYouTubeFeed(createFeed([{
    id: '67rGoXhQcvA',
    title: 'Cozy &amp; Quiet &quot;Restaurant&quot;',
    publishedAt: '2026-07-26T00:00:12+00:00',
  }]));

  assert.deepEqual(video, {
    id: '67rGoXhQcvA',
    title: 'Cozy & Quiet "Restaurant"',
    url: 'https://www.youtube.com/watch?v=67rGoXhQcvA',
    thumbnailUrl: 'https://i.ytimg.com/vi/67rGoXhQcvA/hqdefault.jpg',
    publishedAt: '2026-07-26T00:00:12+00:00',
  });
});

test('YouTube defaults contain the requested mention, button, emoji, and large image', () => {
  const settings = createDefaultYouTubeEmbedSettings(createConfig('defaults'));

  assert.equal(settings.content, '<@&1520828024533159936>');
  assert.equal(settings.embed.description, '# **{member} just uploaded "{videoTitle}".**');
  assert.equal(settings.embed.imageUrl, '{thumbnailUrl}');
  assert.deepEqual(settings.sources, [{
    channelId: 'UC7qyud6JzpiNoiFVQgzFAkg',
    handle: '@5nooof',
    displayName: 'snuf',
    discordUserId: '185282790969835520',
  }]);
  assert.deepEqual(settings.buttons, [{
    label: 'Watch on YouTube',
    url: '{videoUrl}',
    emoji: '<:corneryoutube:1531771043675504780>',
  }]);
});

test('YouTube monitor initializes silently, announces only new videos, and persists duplicates', async () => {
  const featureConfig = createConfig('monitor');
  const { client, sent } = createClient();
  const oldVideo = {
    id: '67rGoXhQcvA',
    title: 'Existing video',
    publishedAt: '2026-07-26T00:00:12+00:00',
  };
  const newVideo = {
    id: 'abcdefghijk',
    title: 'Brand new upload',
    publishedAt: '2026-07-28T20:00:00+00:00',
  };
  const fetchOld = async () => ({
    ok: true,
    text: async () => createFeed([oldVideo]),
  });
  const fetchNew = async () => ({
    ok: true,
    text: async () => createFeed([newVideo, oldVideo]),
  });

  const initialized = await runYouTubeUploadCheck(client, featureConfig, { fetchImpl: fetchOld });
  const announced = await runYouTubeUploadCheck(client, featureConfig, { fetchImpl: fetchNew });
  await runYouTubeUploadCheck(client, featureConfig, { fetchImpl: fetchNew });

  assert.equal(initialized.initialized, true);
  assert.equal(initialized.announced.length, 0);
  assert.deepEqual(announced.announced.map((video) => video.id), [newVideo.id]);
  assert.equal(sent.length, 1);

  const payload = JSON.parse(JSON.stringify(sent[0]));
  const serialized = JSON.stringify(payload);

  assert.match(serialized, /1520828024533159936/);
  assert.match(serialized, /Brand new upload/);
  assert.match(serialized, /Watch on YouTube/);
  assert.match(serialized, /1531771043675504780/);
  assert.match(serialized, /hqdefault\.jpg/);
});

test('YouTube sources enforce the three-channel limit and resolve handle URLs', async () => {
  assert.throws(
    () => normalizeYouTubeSources([
      { channelId: 'UCaaaaaaaaaaaaaaaaaaaaaa' },
      { channelId: 'UCbbbbbbbbbbbbbbbbbbbbbb' },
      { channelId: 'UCcccccccccccccccccccccc' },
      { channelId: 'UCdddddddddddddddddddddd' },
    ]),
    /up to 3 channels/i,
  );

  const [resolved] = await resolveYouTubeSourceReferences([
    {
      channelId: 'https://www.youtube.com/@cozycreator',
      displayName: '',
      handle: '',
      discordUserId: '',
    },
  ], async () => ({
    ok: true,
    text: async () => `
      <meta itemprop="channelId" content="UCaaaaaaaaaaaaaaaaaaaaaa">
      <meta property="og:title" content="Cozy Creator">
    `,
  }));

  assert.deepEqual(resolved, {
    channelId: 'UCaaaaaaaaaaaaaaaaaaaaaa',
    handle: '@cozycreator',
    displayName: 'Cozy Creator',
    discordUserId: '',
  });
});

test('YouTube monitor tracks up to three channel feeds independently', async () => {
  const featureConfig = createConfig('multi-monitor');
  const { client, sent } = createClient();
  const sources = [
    {
      channelId: 'UCaaaaaaaaaaaaaaaaaaaaaa',
      handle: '@alpha',
      displayName: 'Alpha',
      discordUserId: '',
    },
    {
      channelId: 'UCbbbbbbbbbbbbbbbbbbbbbb',
      handle: '@bravo',
      displayName: 'Bravo',
      discordUserId: '',
    },
    {
      channelId: 'UCcccccccccccccccccccccc',
      handle: '@charlie',
      displayName: 'Charlie',
      discordUserId: '',
    },
  ];
  const existingByChannel = {
    [sources[0].channelId]: {
      id: 'alphaold001',
      title: 'Alpha existing',
      publishedAt: '2026-07-20T00:00:00+00:00',
    },
    [sources[1].channelId]: {
      id: 'bravoold001',
      title: 'Bravo existing',
      publishedAt: '2026-07-21T00:00:00+00:00',
    },
    [sources[2].channelId]: {
      id: 'charlie0001',
      title: 'Charlie existing',
      publishedAt: '2026-07-22T00:00:00+00:00',
    },
  };
  const bravoNew = {
    id: 'bravonew001',
    title: 'Bravo new upload',
    publishedAt: '2026-07-29T10:00:00+00:00',
  };
  let includeNewUpload = false;
  const fetchFeeds = async (url) => {
    const channelId = new URL(url).searchParams.get('channel_id');
    const videos = [existingByChannel[channelId]];

    if (channelId === sources[1].channelId && includeNewUpload) {
      videos.unshift(bravoNew);
    }

    return {
      ok: true,
      text: async () => createFeed(videos),
    };
  };

  await saveYouTubeEmbedSettings(featureConfig, {
    ...createDefaultYouTubeEmbedSettings(featureConfig),
    sources,
  });
  const initialized = await runYouTubeUploadCheck(client, featureConfig, { fetchImpl: fetchFeeds });
  includeNewUpload = true;
  const checked = await runYouTubeUploadCheck(client, featureConfig, { fetchImpl: fetchFeeds });
  await runYouTubeUploadCheck(client, featureConfig, { fetchImpl: fetchFeeds });
  const state = await loadYouTubeUploadState(featureConfig);

  assert.equal(initialized.initializedSources.length, 3);
  assert.deepEqual(checked.announced.map((video) => video.id), [bravoNew.id]);
  assert.equal(checked.announced[0].source.displayName, 'Bravo');
  assert.equal(sent.length, 1);
  assert.deepEqual(Object.keys(state.channels).sort(), sources.map((source) => source.channelId).sort());
  assert.ok(state.channels[sources[1].channelId].seenVideoIds.includes(bravoNew.id));
});
