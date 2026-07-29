const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const { ChannelType, PermissionFlagsBits } = require('discord.js');

const { getActivityFeed, getActivityFeedStorageInfo } = require('./activityFeed');
const {
  activateEmergencySafetyProfile,
  addQuarantineReviewNote,
  bulkReleaseQuarantineReviews,
  getProtectionOverview,
  getProtectionStorageInfo,
  resolveQuarantineReview,
  restoreEmergencySafetyProfile,
  saveProtectionSettings,
  setRaidMode,
  syncNativeAutoModerationRules,
} = require('./beanProtection');
const { config } = require('./config');
const {
  getCommunityGrowthOverview,
  getCommunityGrowthProfile,
  getCommunityGrowthStorageInfo,
  grantCommunityGrowthRecognition,
  saveCommunityGrowthSettings,
  searchCommunityGrowthProfiles,
  startCommunityGrowthSeason,
} = require('./communityGrowth');
const {
  featureKeys,
  getDashboardSettingsStorageInfo,
  loadDashboardSettings,
  roleKeys,
  saveDashboardSettings,
} = require('./dashboardSettings');
const { createDashboardMessagePayload } = require('./dashboardMessage');
const {
  createStreamAnnouncementPayload,
  createYouTubeAnnouncementPayload,
} = require('./streamAnnouncement');
const { createWelcomeAnnouncementPayload } = require('./welcomeAnnouncement');
const {
  getDashboardAnalytics,
  getDashboardNotifications,
  getMemberProfile,
  searchMemberProfiles,
} = require('./dashboardInsights');
const {
  getModerationCase,
  getModerationCasesStorageInfo,
  listModerationCases,
  revokeModerationCase,
  updateModerationCaseReason,
} = require('./moderationCases');
const { getPresenceState, updatePresenceRotation } = require('./presenceManager');
const {
  getPresenceSettingsStorageStatus,
  normalizePresenceSettings,
  savePresenceSettings,
} = require('./presenceSettings');
const {
  createScheduledMailboxPost,
  deleteScheduledMailboxPost,
  getMailboxScheduleStorageInfo,
  listScheduledMailboxPosts,
} = require('./mailboxScheduler');
const {
  deleteSavedMessage,
  getSavedMessagesStorageInfo,
  loadSavedMessages,
  saveSavedMessages,
} = require('./savedMessages');
const {
  createReactionRoleMapping,
  deleteReactionRoleMapping,
  getReactionRoleStorageInfo,
  listReactionRoleMappings,
} = require('./reactionRoles');
const {
  getStreamEmbedStorageInfo,
  getStreamEmbedStorageStatus,
  loadStreamEmbedSettings,
  saveStreamEmbedSettings,
} = require('./streamEmbedSettings');
const {
  getYouTubeEmbedStorageInfo,
  getYouTubeEmbedStorageStatus,
  loadYouTubeEmbedSettings,
  saveYouTubeEmbedSettings,
} = require('./youtubeEmbedSettings');
const { getYouTubeUploadStateStorageInfo } = require('./youtubeUploadMonitor');
const {
  deleteTempVoiceRoom,
  getTempVoiceSettings,
  getTempVoiceOverview,
  getTempVoiceStorageInfo,
  saveTempVoiceSettings,
} = require('./tempVoiceRooms');
const {
  getWelcomeEmbedStorageInfo,
  getWelcomeEmbedStorageStatus,
  loadWelcomeEmbedSettings,
  saveWelcomeEmbedSettings,
} = require('./welcomeEmbedSettings');
const { colors, sendStructuredLog } = require('./structuredLog');
const { getTelemetrySnapshot, recordApiRequest } = require('./telemetry');

const dashboardDirectory = path.join(__dirname, '..', 'dashboard');
const sessionCookieName = 'bean_dashboard';
const oauthStateCookieName = 'bean_dashboard_oauth_state';
const oauthSessions = new Map();
const oauthStates = new Map();
let dashboardStartupFeatures = null;
let featureChannelMigrationPromise = Promise.resolve();
let featureChannelMigrationError = null;

function startDashboard(client) {
  if (!config.dashboard.enabled) {
    console.log('Dashboard disabled.');
    return null;
  }

  if (!isDiscordOauthConfigured() && !isPasswordLoginConfigured()) {
    console.log('Dashboard disabled. Configure Discord OAuth.');
    return null;
  }

  dashboardStartupFeatures = {
    youtubeMonitor: Boolean(config.youtubeMonitor.enabled),
  };
  featureChannelMigrationError = null;
  featureChannelMigrationPromise = ensureFeatureChannelSettings()
    .catch((error) => {
      featureChannelMigrationError = error;
      console.error('Failed to migrate feature-owned channel settings:', error);
    });

  logSavedMessagesStorage();
  logStreamEmbedStorage();
  logYouTubeEmbedStorage();
  logWelcomeEmbedStorage();
  logModerationCasesStorage();
  logTempVoiceStorage();
  logReactionRoleStorage();
  logProtectionStorage();
  logCommunityGrowthStorage();

  const server = http.createServer((request, response) => {
    handleRequest(client, request, response).catch((error) => {
      console.error('Dashboard request error:', error);
      sendJson(response, 500, { error: 'Dashboard server error.' });
    });
  });

  server.on('error', (error) => {
    console.error('Dashboard server failed:', error);
  });

  server.listen(config.dashboard.port, () => {
    console.log(`Dashboard listening on port ${config.dashboard.port}.`);
  });

  return server;
}

function logSavedMessagesStorage() {
  const storage = getSavedMessagesStorageInfo(config);

  console.log(
    `Dashboard saved messages storage: ${storage.filePath} (${storage.persistent ? 'persistent' : 'ephemeral'}, ${storage.source}).`,
  );

  if (!storage.persistent) {
    console.warn('Dashboard saved messages will reset after redeploys unless a Railway volume is attached.');
  }
}

function logStreamEmbedStorage() {
  const storage = getStreamEmbedStorageInfo(config);

  console.log(
    `Live embed storage: ${storage.filePath} (${storage.persistent ? 'persistent' : 'ephemeral'}, ${storage.source}).`,
  );

  if (!storage.persistent) {
    console.warn('Live embed settings will reset after redeploys unless a Railway volume is attached.');
  }
}

function logYouTubeEmbedStorage() {
  const storage = getYouTubeEmbedStorageInfo(config);

  console.log(
    `YouTube embed storage: ${storage.filePath} (${storage.persistent ? 'persistent' : 'ephemeral'}, ${storage.source}).`,
  );

  if (!storage.persistent) {
    console.warn('YouTube embed settings will reset after redeploys unless a Railway volume is attached.');
  }
}

function logWelcomeEmbedStorage() {
  const storage = getWelcomeEmbedStorageInfo(config);

  console.log(
    `Welcome embed storage: ${storage.filePath} (${storage.persistent ? 'persistent' : 'ephemeral'}, ${storage.source}).`,
  );

  if (!storage.persistent) {
    console.warn('Welcome embed settings will reset after redeploys unless a Railway volume is attached.');
  }
}

function logModerationCasesStorage() {
  const storage = getModerationCasesStorageInfo(config);

  console.log(
    `Moderation case storage: ${storage.filePath} (${storage.persistent ? 'persistent' : 'ephemeral'}, ${storage.source}).`,
  );

  if (!storage.persistent) {
    console.warn('Moderation cases will reset after redeploys unless a Railway volume is attached.');
  }
}

function logTempVoiceStorage() {
  const storage = getTempVoiceStorageInfo(config);

  console.log(
    `Temporary voice storage: ${storage.filePath} (${storage.persistent ? 'persistent' : 'ephemeral'}, ${storage.source}).`,
  );

  if (!storage.persistent) {
    console.warn('Temporary voice room tracking will reset after redeploys unless a Railway volume is attached.');
  }
}

function logReactionRoleStorage() {
  const storage = getReactionRoleStorageInfo(config);

  console.log(
    `Reaction-role storage: ${storage.filePath} (${storage.persistent ? 'persistent' : 'ephemeral'}, ${storage.source}).`,
  );

  if (!storage.persistent) {
    console.warn('Reaction-role mappings will reset after redeploys unless a Railway volume is attached.');
  }
}

function logProtectionStorage() {
  const storage = getProtectionStorageInfo(config);

  console.log(
    `Bean Protection storage: ${storage.filePath} (${storage.persistent ? 'persistent' : 'ephemeral'}, ${storage.source}).`,
  );

  if (!storage.persistent) {
    console.warn('Bean Protection incidents and raid state will reset after redeploys unless a Railway volume is attached.');
  }
}

function logCommunityGrowthStorage() {
  const storage = getCommunityGrowthStorageInfo(config);

  console.log(
    `Community Growth storage: ${storage.filePath} (${storage.persistent ? 'persistent' : 'ephemeral'}, ${storage.source}).`,
  );

  if (!storage.persistent) {
    console.warn('Community Growth profiles will reset after redeploys unless a Railway volume is attached.');
  }
}

async function handleRequest(client, request, response) {
  recordApiRequest();
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);

  if (shouldLogDashboardRequest(request.method, url.pathname)) {
    console.log(`Dashboard request: ${request.method} ${url.pathname}`);
  }

  if (request.method === 'GET' && url.pathname === '/health') {
    sendJson(response, 200, {
      botReady: client.isReady(),
      dashboardEnabled: true,
    });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/ping') {
    const discordOauthStatus = getDiscordOauthStatus();

    sendJson(response, 200, {
      ok: true,
      botReady: client.isReady(),
      tag: client.user?.tag || null,
      guildName: getDashboardGuildName(client),
      discordOauthEnabled: discordOauthStatus.enabled,
      discordOauthStatus,
    });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/auth/discord') {
    handleDiscordOauthStart(request, response);
    return;
  }

  if (request.method === 'GET' && url.pathname === '/auth/discord/callback') {
    await handleDiscordOauthCallback(request, response, url);
    return;
  }

  if (request.method === 'POST' && url.pathname === '/login') {
    if (!isPasswordLoginConfigured()) {
      redirect(response, '/?loginError=oauth-disabled');
      return;
    }

    await handleClassicLogin(client, request, response);
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/login') {
    if (!isPasswordLoginConfigured()) {
      sendJson(response, 404, { error: 'Password login is disabled.' });
      return;
    }

    await handleLogin(client, request, response);
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/logout') {
    oauthSessions.delete(parseCookies(request)[sessionCookieName]);
    setCookie(response, sessionCookieName, '', { maxAge: 0, secure: isSecureRequest(request) });
    sendJson(response, 200, { ok: true });
    return;
  }

  if (url.pathname.startsWith('/api/')) {
    const session = getAuthenticatedSession(request);

    if (!session) {
      sendJson(response, 401, { error: 'Not authenticated.' });
      return;
    }

    if (!sessionCanAccess(session, request.method, url.pathname)) {
      sendJson(response, 403, { error: 'Your dashboard role cannot perform that action.' });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/session') {
      sendJson(response, 200, {
        ok: true,
        botReady: client.isReady(),
        tag: client.user?.tag || null,
        guildName: getDashboardGuildName(client),
        user: session.user,
        permissions: getSessionPermissions(session),
        discordOauthEnabled: isDiscordOauthConfigured(),
      });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/channels') {
      await handleGetDiscordChannels(client, response);
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/roles') {
      await handleGetDiscordRoles(client, response);
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/configuration') {
      await handleGetDashboardConfiguration(client, response);
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/configuration-options') {
      await handleGetConfigurationOptions(client, response);
      return;
    }

    if (request.method === 'PUT' && url.pathname === '/api/configuration') {
      await handleSaveDashboardConfiguration(client, request, response, session.user);
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/reaction-roles') {
      await handleGetReactionRoles(client, response);
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/reaction-roles') {
      await handleCreateReactionRole(client, request, response, session.user);
      return;
    }

    if (request.method === 'DELETE' && url.pathname.startsWith('/api/reaction-roles/')) {
      await handleDeleteReactionRole(client, url.pathname, response, session.user);
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/saved-messages') {
      await handleGetSavedMessages(response);
      return;
    }

    if (request.method === 'PUT' && url.pathname === '/api/saved-messages') {
      await handleSaveSavedMessages(request, response);
      return;
    }

    if (request.method === 'DELETE' && url.pathname.startsWith('/api/saved-messages/')) {
      await handleDeleteSavedMessage(url.pathname, response);
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/import-message') {
      await handleImportMessage(client, request, response);
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/stream-embed') {
      await handleGetStreamEmbed(response);
      return;
    }

    if (request.method === 'PUT' && url.pathname === '/api/stream-embed') {
      await handleSaveStreamEmbed(request, response);
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/youtube-embed') {
      await handleGetYouTubeEmbed(response);
      return;
    }

    if (request.method === 'PUT' && url.pathname === '/api/youtube-embed') {
      await handleSaveYouTubeEmbed(request, response);
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/welcome-embed') {
      await handleGetWelcomeEmbed(response);
      return;
    }

    if (request.method === 'PUT' && url.pathname === '/api/welcome-embed') {
      await handleSaveWelcomeEmbed(request, response);
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/moderation-cases') {
      await handleGetModerationCases(response);
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/dashboard-health') {
      await handleGetDashboardHealth(client, response);
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/activity-feed') {
      await handleGetActivityFeed(url, response);
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/member-profiles') {
      await handleSearchMemberProfiles(client, url, response);
      return;
    }

    if (request.method === 'GET' && /^\/api\/member-profiles\/\d{17,20}$/.test(url.pathname)) {
      await handleGetMemberProfile(client, url.pathname, response);
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/analytics') {
      await handleGetAnalytics(client, url, response);
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/community-growth') {
      await handleGetCommunityGrowth(client, response);
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/community-growth/profiles') {
      await handleSearchCommunityGrowthProfiles(client, url, response);
      return;
    }

    if (request.method === 'GET' && /^\/api\/community-growth\/profiles\/\d{17,20}$/.test(url.pathname)) {
      await handleGetCommunityGrowthProfile(client, url.pathname, response);
      return;
    }

    if (request.method === 'PUT' && url.pathname === '/api/community-growth/settings') {
      await handleSaveCommunityGrowthSettings(client, request, response, session.user);
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/community-growth/season') {
      await handleStartCommunityGrowthSeason(client, request, response, session.user);
      return;
    }

    if (
      request.method === 'POST'
      && /^\/api\/community-growth\/profiles\/\d{17,20}\/recognition$/.test(url.pathname)
    ) {
      await handleCommunityGrowthRecognition(client, request, url.pathname, response, session.user);
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/dashboard-notifications') {
      await handleGetDashboardNotifications(client, url, response);
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/protection') {
      await handleGetProtection(client, response);
      return;
    }

    if (request.method === 'PUT' && url.pathname === '/api/protection/settings') {
      await handleSaveProtectionSettings(client, request, response, session.user);
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/protection/raid') {
      await handleSetProtectionRaidMode(client, request, response, session.user);
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/protection/sync') {
      await handleSyncProtectionRules(client, response, session.user);
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/protection/emergency') {
      await handleProtectionEmergencyProfile(client, request, response, session.user);
      return;
    }

    if (
      request.method === 'POST'
      && /^\/api\/protection\/quarantine\/[^/]+\/action$/.test(url.pathname)
    ) {
      await handleResolveQuarantineReview(client, request, url.pathname, response, session.user);
      return;
    }

    if (
      request.method === 'POST'
      && /^\/api\/protection\/quarantine\/[^/]+\/notes$/.test(url.pathname)
    ) {
      await handleAddQuarantineReviewNote(client, request, url.pathname, response, session.user);
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/protection/quarantine/bulk-release') {
      await handleBulkReleaseQuarantineReviews(client, request, response, session.user);
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/mailbox/scheduled') {
      await handleGetScheduledMailbox(response);
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/mailbox/scheduled') {
      await handleCreateScheduledMailbox(client, request, response);
      return;
    }

    if (request.method === 'DELETE' && url.pathname.startsWith('/api/mailbox/scheduled/')) {
      await handleDeleteScheduledMailbox(client, url.pathname, response);
      return;
    }

    if (request.method === 'PATCH' && /^\/api\/moderation-cases\/\d+\/reason$/.test(url.pathname)) {
      await handleUpdateModerationCaseReason(client, request, url.pathname, response);
      return;
    }

    if (request.method === 'PATCH' && /^\/api\/moderation-cases\/\d+\/status$/.test(url.pathname)) {
      await handleUpdateModerationCaseStatus(client, request, url.pathname, response);
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/temp-voice') {
      await handleGetTempVoice(client, response);
      return;
    }

    if (request.method === 'PUT' && url.pathname === '/api/temp-voice/settings') {
      await handleSaveTempVoiceSettings(client, request, response);
      return;
    }

    if (request.method === 'DELETE' && url.pathname.startsWith('/api/temp-voice/channels/')) {
      await handleDeleteTempVoiceRoom(client, url.pathname, response);
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/bot') {
      await handleGetBot(client, response);
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/bot/presence') {
      await handleUpdatePresence(client, request, response);
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/bot/bio') {
      await handleUpdateBotBio(client, request, response);
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/bot/avatar') {
      await handleUpdateBotImage(client, request, response, 'avatar');
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/bot/banner') {
      await handleUpdateBotImage(client, request, response, 'banner');
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/send-message') {
      await handleSendMessage(client, request, response);
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/mailbox/send') {
      await handleSendMessage(client, request, response, {
        source: 'mailbox',
      });
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/test-announcement') {
      await handleTestAnnouncement(client, request, response);
      return;
    }

    sendJson(response, 404, { error: 'Unknown API route.' });
    return;
  }

  serveStatic(url.pathname, response);
}

async function handleLogin(client, request, response) {
  console.log('Dashboard login API request received.');
  const body = await readJsonBody(request, 64 * 1024);

  if (!isDashboardPassword(String(body.password || ''))) {
    console.warn('Dashboard login failed.');
    sendJson(response, 401, { error: 'Invalid password.' });
    return;
  }

  console.log('Dashboard login succeeded.');
  const sessionToken = createSessionValue();

  setCookie(response, sessionCookieName, sessionToken, {
    maxAge: 7 * 24 * 60 * 60,
    secure: isSecureRequest(request),
  });
  sendJson(response, 200, {
    ok: true,
    botReady: client.isReady(),
    tag: client.user?.tag || null,
    guildName: getDashboardGuildName(client),
    sessionToken,
    user: createPasswordSession().user,
    permissions: getSessionPermissions(createPasswordSession()),
  });
}

function handleDiscordOauthStart(request, response) {
  if (!isDiscordOauthConfigured()) {
    redirect(response, '/?loginError=oauth-disabled');
    return;
  }

  pruneOauthState();
  const state = crypto.randomBytes(24).toString('hex');
  const redirectUri = getDiscordOauthRedirectUri();
  oauthStates.set(state, Date.now() + 10 * 60 * 1000);
  setCookie(response, oauthStateCookieName, state, {
    maxAge: 10 * 60,
    secure: isSecureRequest(request),
  });
  const query = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'identify guilds.members.read',
    state,
  });
  redirect(response, `https://discord.com/oauth2/authorize?${query}`);
}

async function handleDiscordOauthCallback(request, response, url) {
  const state = String(url.searchParams.get('state') || '');
  const code = String(url.searchParams.get('code') || '');
  const cookieState = parseCookies(request)[oauthStateCookieName];
  const expiresAt = oauthStates.get(state);

  oauthStates.delete(state);
  setCookie(response, oauthStateCookieName, '', {
    maxAge: 0,
    secure: isSecureRequest(request),
  });

  if (
    !isDiscordOauthConfigured()
    || !state
    || state !== cookieState
    || !expiresAt
    || expiresAt < Date.now()
    || !code
  ) {
    redirect(response, '/?loginError=oauth');
    return;
  }

  try {
    const redirectUri = getDiscordOauthRedirectUri();
    const tokenResponse = await fetch('https://discord.com/api/v10/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.dashboard.discordOauth.clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Discord token exchange returned ${tokenResponse.status}.`);
    }

    const token = await tokenResponse.json();
    const headers = { Authorization: `Bearer ${token.access_token}` };
    const [userResponse, memberResponse] = await Promise.all([
      fetch('https://discord.com/api/v10/users/@me', { headers }),
      fetch(`https://discord.com/api/v10/users/@me/guilds/${config.guildId}/member`, { headers }),
    ]);

    if (!userResponse.ok || !memberResponse.ok) {
      throw new Error('The Discord account is not a member of the configured server.');
    }

    const user = await userResponse.json();
    const member = await memberResponse.json();
    const dashboardRole = resolveDashboardRole(user.id, member.roles);

    if (!dashboardRole) {
      redirect(response, '/?loginError=access');
      return;
    }

    const sessionToken = crypto.randomBytes(32).toString('hex');
    const session = {
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      user: {
        id: user.id,
        username: user.username,
        displayName: member.nick || user.global_name || user.username,
        avatarUrl: user.avatar
          ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
          : null,
        role: dashboardRole,
        authMode: 'discord',
      },
    };

    oauthSessions.set(sessionToken, session);
    setCookie(response, sessionCookieName, sessionToken, {
      maxAge: 7 * 24 * 60 * 60,
      secure: isSecureRequest(request),
    });
    redirect(response, '/');
  } catch (error) {
    console.error('Discord dashboard login failed:', error);
    redirect(response, '/?loginError=oauth');
  }
}

async function handleGetDiscordChannels(client, response) {
  if (!client.isReady()) {
    sendJson(response, 503, { error: 'Bot is not ready yet.' });
    return;
  }

  const guild = getDashboardGuild(client);

  if (!guild) {
    sendJson(response, 404, { error: 'The dashboard Discord server was not found.' });
    return;
  }

  const fetchedChannels = await guild.channels.fetch().catch((error) => {
    console.error('Failed to refresh dashboard channel list:', error);
    return null;
  });
  const channelCollection = fetchedChannels || guild.channels.cache;
  const channels = [...channelCollection.values()]
    .filter((channel) => {
      if (!channel || channel.isThread?.()) {
        return false;
      }

      if (typeof channel.isSendable !== 'function' || !channel.isSendable()) {
        return false;
      }

      const permissions = channel.permissionsFor?.(client.user);

      return !permissions || permissions.has([
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
      ]);
    })
    .map((channel) => ({
      id: channel.id,
      name: channel.name || `channel-${channel.id}`,
      parentId: channel.parentId || '',
      parentName: channel.parent?.name || '',
      parentPosition: Number.isFinite(channel.parent?.rawPosition)
        ? channel.parent.rawPosition
        : -1,
      position: Number.isFinite(channel.rawPosition) ? channel.rawPosition : 0,
      type: channel.type,
    }))
    .sort((left, right) =>
      left.parentPosition - right.parentPosition
      || left.parentName.localeCompare(right.parentName)
      || left.position - right.position
      || left.name.localeCompare(right.name),
    );

  sendJson(response, 200, {
    ok: true,
    guildId: guild.id,
    guildName: guild.name,
    channels,
    defaults: {
      mailbox: config.channels.mailbox || '',
      welcome: config.channels.welcome || '',
      stream: config.channels.streamAnnouncements || '',
      youtube: config.channels.youtubeAnnouncements || config.channels.streamAnnouncements || '',
    },
  });
}

async function handleGetDiscordRoles(client, response) {
  if (!client.isReady()) {
    sendJson(response, 503, { error: 'Bot is not ready yet.' });
    return;
  }

  const guild = getDashboardGuild(client);

  if (!guild) {
    sendJson(response, 404, { error: 'The dashboard Discord server was not found.' });
    return;
  }

  const fetchedRoles = await guild.roles?.fetch?.().catch(() => null);
  const roleCollection = fetchedRoles || guild.roles?.cache;
  const roles = roleCollection
    ? [...roleCollection.values()]
      .filter((role) => role && role.id !== guild.id && !role.managed)
      .map((role) => ({
        id: role.id,
        name: role.name || `role-${role.id}`,
        color: role.hexColor && role.hexColor !== '#000000' ? role.hexColor : null,
        position: Number.isFinite(role.position) ? role.position : 0,
      }))
      .sort((left, right) => right.position - left.position || left.name.localeCompare(right.name))
    : [];

  sendJson(response, 200, {
    ok: true,
    guildId: guild.id,
    roles,
    defaults: { ...config.roles },
  });
}

async function handleGetReactionRoles(client, response) {
  try {
    const mappings = await listReactionRoleMappings(client, config);

    sendJson(response, 200, {
      ok: true,
      mappings,
      storage: getReactionRoleStorageInfo(config),
    });
  } catch (error) {
    sendJson(response, 500, { error: 'Reaction-role mappings could not be loaded.' });
  }
}

async function handleCreateReactionRole(client, request, response, actor) {
  const body = await readJsonBody(request, 64 * 1024);

  try {
    const mapping = await createReactionRoleMapping(client, config, body, actor);
    const mappings = await listReactionRoleMappings(client, config);

    await sendStructuredLog(client, config.channels.operationLog, {
      title: 'Reaction Role Created',
      emoji: '🎭',
      color: colors.success,
      summary: `A reaction-role mapping was created for <@&${mapping.roleId}>.`,
      referenceId: `REACTION-ROLE-${mapping.id}`,
      links: [{ label: 'Open Message', url: `https://discord.com/channels/${mapping.guildId}/${mapping.channelId}/${mapping.messageId}` }],
      fields: [
        { name: 'Emoji', value: mapping.emojiDisplay },
        { name: 'Role', value: `<@&${mapping.roleId}>` },
        { name: 'Remove on unreact', value: mapping.removeOnUnreact ? 'Yes' : 'No' },
      ],
    }).catch((error) => console.error('Failed to log reaction-role creation:', error));

    sendJson(response, 201, { ok: true, mapping, mappings });
  } catch (error) {
    const status = ['GUILD_NOT_FOUND', 'CHANNEL_NOT_FOUND', 'MESSAGE_NOT_FOUND', 'ROLE_NOT_FOUND', 'EMOJI_NOT_FOUND']
      .includes(error.code)
      ? 404
      : (error.code === 'BOT_NOT_READY' ? 503 : 400);

    sendJson(response, status, { error: error.message });
  }
}

async function handleDeleteReactionRole(client, pathname, response, actor) {
  const mappingId = decodeURIComponent(pathname.slice('/api/reaction-roles/'.length));

  if (!mappingId || mappingId.includes('/')) {
    sendJson(response, 400, { error: 'Reaction-role mapping ID is required.' });
    return;
  }

  try {
    const removed = await deleteReactionRoleMapping(client, config, mappingId);
    const mappings = await listReactionRoleMappings(client, config);

    await sendStructuredLog(client, config.channels.operationLog, {
      title: 'Reaction Role Removed',
      emoji: '🧹',
      color: colors.warning,
      summary: `A reaction-role mapping for <@&${removed.roleId}> was removed.`,
      referenceId: `REACTION-ROLE-${removed.id}`,
      fields: [
        { name: 'Emoji', value: removed.emojiDisplay },
        { name: 'Changed by', value: actor?.id ? `<@${actor.id}>` : (actor?.displayName || 'Dashboard') },
      ],
    }).catch((error) => console.error('Failed to log reaction-role removal:', error));

    sendJson(response, 200, { ok: true, removed, mappings });
  } catch (error) {
    sendJson(response, error.code === 'MAPPING_NOT_FOUND' ? 404 : 400, { error: error.message });
  }
}

async function handleGetConfigurationOptions(client, response) {
  if (!client.isReady()) {
    sendJson(response, 503, { error: 'Bot is not ready yet.' });
    return;
  }

  const guild = getDashboardGuild(client);

  if (!guild) {
    sendJson(response, 404, { error: 'The dashboard Discord server was not found.' });
    return;
  }

  const fetchedChannels = await guild.channels.fetch().catch(() => null);
  const collection = fetchedChannels || guild.channels.cache;
  const channels = [...collection.values()]
    .filter((channel) => {
      if (!channel || channel.isThread?.() || channel.type === ChannelType.GuildCategory) {
        return false;
      }

      const permissions = channel.permissionsFor?.(client.user);
      return !permissions || permissions.has(PermissionFlagsBits.ViewChannel);
    })
    .map((channel) => ({
      id: channel.id,
      name: channel.name || `channel-${channel.id}`,
      parentId: channel.parentId || '',
      parentName: channel.parent?.name || '',
      parentPosition: Number.isFinite(channel.parent?.rawPosition) ? channel.parent.rawPosition : -1,
      position: Number.isFinite(channel.rawPosition) ? channel.rawPosition : 0,
      type: channel.type,
      sendable: Boolean(channel.isSendable?.()),
      voice: channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildStageVoice,
    }))
    .sort((left, right) =>
      left.parentPosition - right.parentPosition
      || left.parentName.localeCompare(right.parentName)
      || left.position - right.position
      || left.name.localeCompare(right.name));

  sendJson(response, 200, { ok: true, channels });
}

async function handleGetDashboardConfiguration(client, response) {
  const settings = await loadEffectiveDashboardSettings();
  const diagnostics = await getConfigurationDiagnostics(client, settings);

  sendJson(response, 200, {
    ok: true,
    settings,
    diagnostics,
    storage: getDashboardSettingsStorageInfo(config),
    oauth: {
      enabled: isDiscordOauthConfigured(),
      configured: Boolean(
        config.clientId
        && config.guildId
        && config.dashboard.discordOauth?.clientSecret
        && config.dashboard.publicUrl
      ),
    },
    schema: {
      channels: Object.keys(settings.channels),
      roles: roleKeys,
      features: featureKeys,
    },
  });
}

async function handleSaveDashboardConfiguration(client, request, response, actor) {
  const body = await readJsonBody(request, config.dashboard.maxBodyBytes);
  let settings;

  try {
    await featureChannelMigrationPromise;

    if (featureChannelMigrationError) {
      throw new Error('Feature channel storage is unavailable. No configuration changes were saved.');
    }

    settings = await saveDashboardSettings(config, body.settings, actor);
    settings = await applyFeatureOwnedChannels(settings);
  } catch (error) {
    sendJson(response, 400, { error: error.message });
    return;
  }

  const diagnostics = await getConfigurationDiagnostics(client, settings);

  await sendStructuredLog(client, config.channels.operationLog, {
    title: 'Dashboard Configuration Updated',
    emoji: '⚙️',
    color: colors.info,
    summary: `**${actor?.displayName || 'A dashboard user'}** updated Bean's server configuration.`,
    referenceId: `CONFIG-${Date.now()}`,
    fields: [
      { name: 'Dashboard Role', value: actor?.role || 'Founder' },
      { name: 'Readiness', value: `${diagnostics.summary.ready}/${diagnostics.summary.total} checks ready` },
      { name: 'Restart Required', value: diagnostics.summary.restartRequired ? 'Yes' : 'No' },
    ],
  }).catch((error) => console.error('Failed to log dashboard configuration update:', error));

  sendJson(response, 200, {
    ok: true,
    settings,
    diagnostics,
    storage: getDashboardSettingsStorageInfo(config),
  });
}

async function getConfigurationDiagnostics(client, settings) {
  const guild = getDashboardGuild(client);
  const channelCollection = guild?.channels?.cache;
  const roleCollection = guild?.roles?.cache;
  const botMember = guild?.members?.me
    || guild?.members?.cache?.get?.(client.user?.id);
  const checks = [];

  for (const key of Object.keys(settings.channels)) {
    const id = settings.channels[key];
    const channel = id
      ? channelCollection?.get?.(id) || await client.channels?.fetch?.(id)?.catch(() => null)
      : null;
    const requiredPermissions = getRequiredChannelPermissions(key);
    const permissions = channel?.permissionsFor?.(client.user || botMember);
    const missingPermissions = permissions
      ? requiredPermissions.filter((permission) => !permissions.has(permission.bit))
      : [];

    checks.push({
      id: `channel-${key}`,
      group: 'channels',
      key,
      label: humanizeSettingKey(key),
      status: !id ? 'missing' : !channel ? 'invalid' : missingPermissions.length ? 'warning' : 'ready',
      message: !id
        ? 'No channel selected.'
        : !channel
          ? 'The selected channel no longer exists or is inaccessible.'
          : missingPermissions.length
            ? `Missing ${missingPermissions.map((item) => item.label).join(', ')}.`
            : `Connected to #${channel.name || id}.`,
      missingPermissions: missingPermissions.map((item) => item.label),
    });
  }

  for (const key of roleKeys) {
    const id = settings.roles[key];
    const role = id ? roleCollection?.get?.(id) : null;
    const botTopPosition = botMember?.roles?.highest?.position;
    const manageable = !role
      || !Number.isFinite(botTopPosition)
      || !Number.isFinite(role.position)
      || botTopPosition > role.position;

    checks.push({
      id: `role-${key}`,
      group: 'roles',
      key,
      label: humanizeSettingKey(key),
      status: !id ? 'missing' : !role ? 'invalid' : !manageable ? 'warning' : 'ready',
      message: !id
        ? 'No role selected.'
        : !role
          ? 'The selected role no longer exists.'
          : !manageable
            ? 'Move Bean above this role in Discord.'
            : `Connected to @${role.name || id}.`,
    });
  }

  const intentChecks = [
    {
      key: 'members',
      label: 'Server Members intent',
      enabled: Boolean(config.intents.members),
      required: settings.features.welcomeMessages || settings.features.beanProtection,
      reason: 'automatic welcomes and join-raid detection',
    },
    {
      key: 'messageContent',
      label: 'Message Content intent',
      enabled: Boolean(config.intents.messageContent),
      required: settings.features.inviteModeration || settings.features.detailedLogging || settings.features.beanProtection,
      reason: 'invite moderation, Bean Protection, and detailed message logs',
    },
    {
      key: 'presences',
      label: 'Presence intent',
      enabled: Boolean(config.intents.presences),
      required: settings.features.streamMonitor,
      reason: 'Twitch live detection and online analytics',
    },
  ];

  for (const intent of intentChecks) {
    checks.push({
      id: `intent-${intent.key}`,
      group: 'intents',
      key: intent.key,
      label: intent.label,
      status: !intent.required || intent.enabled ? 'ready' : 'restart',
      message: intent.enabled
        ? `Enabled for ${intent.reason}.`
        : intent.required
          ? `Enable this in Discord and Railway for ${intent.reason}, then restart Bean.`
          : 'Not required by the currently enabled features.',
      restartRequired: intent.required && !intent.enabled,
    });
  }

  if (settings.features.beanProtection) {
    const protectionPermissions = [
      { bit: PermissionFlagsBits.ManageGuild, label: 'Manage Server' },
      { bit: PermissionFlagsBits.ManageRoles, label: 'Manage Roles' },
      { bit: PermissionFlagsBits.ModerateMembers, label: 'Moderate Members' },
    ];
    const missingProtectionPermissions = botMember?.permissions
      ? protectionPermissions.filter((permission) => !botMember.permissions.has(permission.bit))
      : [];

    checks.push({
      id: 'feature-beanProtectionPermissions',
      group: 'features',
      key: 'beanProtectionPermissions',
      label: 'Protection and emergency permissions',
      status: missingProtectionPermissions.length ? 'warning' : 'ready',
      message: missingProtectionPermissions.length
        ? `Bean is missing ${missingProtectionPermissions.map((item) => item.label).join(', ')}.`
        : 'Bean can coordinate AutoMod, verification, quarantine, and channel restoration.',
      missingPermissions: missingProtectionPermissions.map((item) => item.label),
    });
  }

  if (settings.features.youtubeMonitor && dashboardStartupFeatures?.youtubeMonitor === false) {
    checks.push({
      id: 'feature-youtubeMonitor',
      group: 'features',
      key: 'youtubeMonitor',
      label: 'YouTube monitor startup',
      status: 'restart',
      message: 'The monitor was disabled when Bean started. Restart Bean to begin polling.',
      restartRequired: true,
    });
  }

  const relevantChecks = checks.filter((check) => {
    if (check.group === 'channels') {
      return isConfigurationCheckRelevant(check.key, settings.features);
    }

    if (check.group === 'roles') {
      return isRoleCheckRelevant(check.key, settings.features);
    }

    return true;
  });
  const ready = relevantChecks.filter((check) => check.status === 'ready').length;

  return {
    generatedAt: new Date().toISOString(),
    checks,
    summary: {
      ready,
      total: relevantChecks.length,
      warnings: relevantChecks.filter((check) => ['warning', 'invalid', 'missing'].includes(check.status)).length,
      restartRequired: relevantChecks.some((check) => check.restartRequired),
    },
  };
}

async function loadEffectiveDashboardSettings() {
  await featureChannelMigrationPromise;
  const settings = await loadDashboardSettings(config);
  return applyFeatureOwnedChannels(settings);
}

async function ensureFeatureChannelSettings() {
  const definitions = [
    {
      getStatus: () => getWelcomeEmbedStorageStatus(config),
      load: () => loadWelcomeEmbedSettings(config),
      save: (settings) => saveWelcomeEmbedSettings(config, settings),
    },
    {
      getStatus: () => getStreamEmbedStorageStatus(config),
      load: () => loadStreamEmbedSettings(config),
      save: (settings) => saveStreamEmbedSettings(config, settings),
    },
    {
      getStatus: () => getYouTubeEmbedStorageStatus(config),
      load: () => loadYouTubeEmbedSettings(config),
      save: (settings) => saveYouTubeEmbedSettings(config, settings),
    },
  ];

  await Promise.all(definitions.map(async (definition) => {
    const status = await definition.getStatus();

    if (!status.hasSavedSettings) {
      await definition.save(await definition.load());
    }
  }));
}

async function applyFeatureOwnedChannels(settings) {
  const [welcome, stream, youtube, temporaryVoice] = await Promise.all([
    loadWelcomeEmbedSettings(config),
    loadStreamEmbedSettings(config),
    loadYouTubeEmbedSettings(config),
    getTempVoiceSettings(config),
  ]);
  const channels = {
    welcome: welcome.channelId || null,
    streamAnnouncements: stream.channelId || null,
    youtubeAnnouncements: youtube.channelId || null,
    tempVoiceTrigger: temporaryVoice.triggerChannelId || null,
  };

  Object.assign(settings.channels, channels);
  Object.assign(config.channels, channels);
  return settings;
}

function getRequiredChannelPermissions(key) {
  if (key === 'tempVoiceTrigger') {
    return [
      { bit: PermissionFlagsBits.ViewChannel, label: 'View Channel' },
      { bit: PermissionFlagsBits.Connect, label: 'Connect' },
      { bit: PermissionFlagsBits.ManageChannels, label: 'Manage Channels' },
      { bit: PermissionFlagsBits.MoveMembers, label: 'Move Members' },
    ];
  }

  const permissions = [
    { bit: PermissionFlagsBits.ViewChannel, label: 'View Channel' },
    { bit: PermissionFlagsBits.SendMessages, label: 'Send Messages' },
  ];

  permissions.push(
    { bit: PermissionFlagsBits.EmbedLinks, label: 'Embed Links' },
    { bit: PermissionFlagsBits.AttachFiles, label: 'Attach Files' },
  );

  return permissions;
}

function isConfigurationCheckRelevant(key, features) {
  if (key === 'welcome') return features.welcomeMessages;
  if (key === 'tickets' || key === 'ticketLogs') return features.tickets;
  if (key === 'streamAnnouncements') return features.streamMonitor;
  if (key === 'youtubeAnnouncements') return features.youtubeMonitor;
  if (key === 'tempVoiceTrigger') return features.temporaryVoice;
  if (['caseFiles', 'entryLog', 'signalLog', 'lineLog', 'operationLog', 'systemLog'].includes(key)) {
    return features.detailedLogging;
  }
  return Boolean(config.channels[key]);
}

function isRoleCheckRelevant(key, features) {
  if (key === 'live') return features.streamMonitor;
  if (key === 'newUpload') return features.youtubeMonitor;
  return Boolean(config.roles[key]);
}

function humanizeSettingKey(value) {
  return String(value)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (letter) => letter.toUpperCase());
}

async function handleClassicLogin(client, request, response) {
  console.log('Dashboard basic login request received.');
  const body = await readFormBody(request, 64 * 1024);

  if (!isDashboardPassword(String(body.password || ''))) {
    console.warn('Dashboard basic login failed.');
    redirect(response, '/?loginError=invalid');
    return;
  }

  console.log('Dashboard basic login succeeded.');
  setCookie(response, sessionCookieName, createSessionValue(), {
    maxAge: 7 * 24 * 60 * 60,
    secure: isSecureRequest(request),
  });
  redirect(response, '/');
}

async function handleSendMessage(client, request, response, options = {}) {
  if (!client.isReady()) {
    sendJson(response, 503, { error: 'Bot is not ready yet.' });
    return;
  }

  const body = await readJsonBody(request, config.dashboard.maxBodyBytes);
  const channelId = String(options.channelId || body.channelId || '').trim();

  if (!/^\d{17,20}$/.test(channelId)) {
    sendJson(response, 400, { error: 'Channel ID must be a Discord snowflake.' });
    return;
  }

  const channel = await client.channels.fetch(channelId).catch(() => null);

  if (!channel || typeof channel.isSendable !== 'function' || !channel.isSendable()) {
    sendJson(response, 404, { error: 'Channel was not found or is not sendable by the bot.' });
    return;
  }

  let payload;

  try {
    payload = createDashboardMessagePayload(body, config);
  } catch (error) {
    sendJson(response, 400, { error: error.message });
    return;
  }

  const message = await channel.send(payload);

  if (options.source === 'mailbox') {
    await sendStructuredLog(client, config.channels.operationLog, {
      title: 'Mailbox Post Published',
      emoji: '📬',
      color: colors.success,
      summary: `**${String(body.mailboxTitle || 'Mailbox post').slice(0, 240)}** was published through the dashboard.`,
      referenceId: `MAILBOX-MANUAL-${message.id}`,
      links: message.url ? [{ label: 'Open Message', url: message.url }] : [],
      fields: [
        { name: 'Destination', value: `<#${channelId}>` },
        { name: 'Message ID', value: message.id },
      ],
    }).catch((error) => console.error('Failed to log Mailbox publication:', error));
  }

  sendJson(response, 200, {
    ok: true,
    channelId,
    messageId: message.id,
    url: message.url,
  });
}

async function handleTestAnnouncement(client, request, response) {
  if (!client.isReady()) {
    sendJson(response, 503, { error: 'Bot is not ready yet.' });
    return;
  }

  const body = await readJsonBody(request, config.dashboard.maxBodyBytes);
  const type = String(body.type || '').trim().toLowerCase();
  const settings = body.settings && typeof body.settings === 'object' ? body.settings : {};
  const channelId = String(body.channelId || settings.channelId || '').trim();

  if (!['welcome', 'live', 'youtube'].includes(type)) {
    sendJson(response, 400, { error: 'Choose welcome, live, or youtube for the test.' });
    return;
  }

  if (!/^\d{17,20}$/.test(channelId)) {
    sendJson(response, 400, { error: 'Choose a destination channel for the test.' });
    return;
  }

  const channel = await client.channels.fetch(channelId).catch(() => null);

  if (!channel?.isSendable?.()) {
    sendJson(response, 404, { error: 'The selected test channel is unavailable or not sendable.' });
    return;
  }

  const member = await getDashboardTestMember(client);
  let payload;

  try {
    if (type === 'welcome') {
      payload = createWelcomeAnnouncementPayload(settings, member);
    } else if (type === 'youtube') {
      payload = createYouTubeAnnouncementPayload(settings, {
        member,
        video: {
          id: '67rGoXhQcvA',
          title: 'A fresh upload from the cozy corner',
          url: 'https://www.youtube.com/watch?v=67rGoXhQcvA',
          thumbnailUrl: 'https://i.ytimg.com/vi/67rGoXhQcvA/hqdefault.jpg',
          publishedAt: new Date().toISOString(),
        },
        channelHandle: config.youtubeMonitor.channelHandle,
        timestamp: new Date(),
      });
    } else {
      payload = createStreamAnnouncementPayload(settings, {
        member,
        streamingActivity: {
          details: 'Building something under control',
          state: 'Just Chatting',
          url: 'https://twitch.tv/5noof',
        },
        twitchUsername: '5noof',
        previewUrl: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_5noof-1920x1080.jpg',
        timestamp: new Date(),
      });
    }
  } catch (error) {
    sendJson(response, 400, { error: error.message });
    return;
  }

  payload.allowedMentions = { parse: [], users: [], roles: [], repliedUser: false };
  const message = await channel.send(payload);

  sendJson(response, 200, {
    ok: true,
    type,
    channelId,
    messageId: message.id,
    url: message.url,
  });
}

async function getDashboardTestMember(client) {
  const guild = getDashboardGuild(client);
  const userId = config.ownerUserId;
  const member = guild?.members?.cache?.get?.(userId)
    || await guild?.members?.fetch?.(userId)?.catch(() => null);

  if (member) {
    return member;
  }

  const createdTimestamp = Date.now() - 365 * 24 * 60 * 60 * 1000;

  return {
    id: userId,
    displayName: 'snuf',
    guild: {
      name: guild?.name || config.communityName,
      memberCount: guild?.memberCount || 1,
    },
    user: {
      id: userId,
      username: '5nooof',
      displayName: 'snuf',
      createdTimestamp,
    },
    displayAvatarURL: () => '',
    toString: () => `<@${userId}>`,
  };
}

async function handleGetScheduledMailbox(response) {
  const jobs = await listScheduledMailboxPosts(config);

  sendJson(response, 200, {
    ok: true,
    jobs,
    storage: getMailboxScheduleStorageInfo(config),
  });
}

async function handleCreateScheduledMailbox(client, request, response) {
  const body = await readJsonBody(request, config.dashboard.maxBodyBytes);
  let job;

  try {
    job = await createScheduledMailboxPost(config, body);
  } catch (error) {
    sendJson(response, 400, { error: error.message });
    return;
  }

  await sendStructuredLog(client, config.channels.operationLog, {
    title: 'Mailbox Post Scheduled',
    emoji: '🗓️',
    color: colors.info,
    summary: `**${job.title}** was added to Bean's automatic publishing queue.`,
    referenceId: `MAILBOX-SCHEDULE-${job.id}`,
    fields: [
      { name: 'Publish At', value: `<t:${Math.floor(new Date(job.scheduledAt).getTime() / 1000)}:F>` },
      { name: 'Destination', value: `<#${job.channelId}>` },
    ],
  }).catch((error) => console.error('Failed to log scheduled Mailbox post:', error));

  sendJson(response, 201, { ok: true, job });
}

async function handleDeleteScheduledMailbox(client, pathname, response) {
  const encodedId = pathname.slice('/api/mailbox/scheduled/'.length);
  let jobId;

  try {
    jobId = decodeURIComponent(encodedId).trim();
  } catch {
    sendJson(response, 400, { error: 'Scheduled post ID is invalid.' });
    return;
  }

  const result = await deleteScheduledMailboxPost(config, jobId);

  if (result.status === 'not_found') {
    sendJson(response, 404, { error: 'Scheduled Mailbox post was not found.' });
    return;
  }

  if (result.status === 'publishing') {
    sendJson(response, 409, { error: 'That post is being published right now.' });
    return;
  }

  await sendStructuredLog(client, config.channels.operationLog, {
    title: result.job.status === 'sent' ? 'Mailbox Schedule History Removed' : 'Mailbox Post Canceled',
    emoji: '🗑️',
    color: colors.warning,
    summary: `**${result.job.title}** was removed from the dashboard queue.`,
    referenceId: `MAILBOX-SCHEDULE-DELETE-${result.job.id}`,
  }).catch((error) => console.error('Failed to log Mailbox schedule deletion:', error));

  sendJson(response, 200, { ok: true, job: result.job });
}

async function handleGetDashboardHealth(client, response) {
  const telemetry = getTelemetrySnapshot(client);
  const storage = await getDashboardStorageHealth();

  sendJson(response, 200, {
    ok: true,
    ...telemetry,
    storage,
    summary: {
      persistentStores: storage.filter((item) => item.persistent).length,
      totalStores: storage.length,
      availableStores: storage.filter((item) => item.available).length,
      recentErrors: telemetry.errors.length,
    },
  });
}

async function handleGetActivityFeed(url, response) {
  const type = String(url.searchParams.get('type') || '').trim();
  const limit = Number.parseInt(url.searchParams.get('limit'), 10) || 100;
  const items = await getActivityFeed(config, { type, limit });

  sendJson(response, 200, {
    ok: true,
    items,
    storage: getActivityFeedStorageInfo(config),
  });
}

async function handleSearchMemberProfiles(client, url, response) {
  const query = String(url.searchParams.get('query') || '').trim();

  if (query.length > 100) {
    sendJson(response, 400, { error: 'Member searches must be 100 characters or fewer.' });
    return;
  }

  const members = await searchMemberProfiles(client, config, query);
  sendJson(response, 200, { ok: true, members, query });
}

async function handleGetMemberProfile(client, pathname, response) {
  const memberId = pathname.slice('/api/member-profiles/'.length);
  const profile = await getMemberProfile(client, config, memberId);

  if (!profile) {
    sendJson(response, 404, { error: 'No member profile or stored history was found.' });
    return;
  }

  sendJson(response, 200, { ok: true, profile });
}

async function handleGetAnalytics(client, url, response) {
  const days = Number.parseInt(url.searchParams.get('days'), 10);
  const timezoneOffset = Number.parseInt(url.searchParams.get('timezoneOffset'), 10);
  const analytics = await getDashboardAnalytics(client, config, days, timezoneOffset);

  sendJson(response, 200, { ok: true, analytics });
}

async function handleGetDashboardNotifications(client, url, response) {
  const after = String(url.searchParams.get('after') || '');
  const result = await getDashboardNotifications(client, config, after);

  sendJson(response, 200, { ok: true, ...result });
}

async function handleGetCommunityGrowth(client, response) {
  const guild = getDashboardGuild(client);

  if (!guild) {
    sendJson(response, 404, { error: 'The dashboard Discord server was not found.' });
    return;
  }

  const overview = await getCommunityGrowthOverview(config, guild.id);
  sendJson(response, 200, { ok: true, ...overview });
}

async function handleSearchCommunityGrowthProfiles(client, url, response) {
  const guild = getDashboardGuild(client);

  if (!guild) {
    sendJson(response, 404, { error: 'The dashboard Discord server was not found.' });
    return;
  }

  const query = String(url.searchParams.get('query') || '').trim();

  if (query.length > 100) {
    sendJson(response, 400, { error: 'Profile searches must be 100 characters or fewer.' });
    return;
  }

  const profiles = await searchCommunityGrowthProfiles(config, guild.id, query, {
    includePrivate: true,
    limit: Number.parseInt(url.searchParams.get('limit'), 10) || 50,
  });
  sendJson(response, 200, { ok: true, profiles, query });
}

async function handleGetCommunityGrowthProfile(client, pathname, response) {
  const guild = getDashboardGuild(client);

  if (!guild) {
    sendJson(response, 404, { error: 'The dashboard Discord server was not found.' });
    return;
  }

  const userId = pathname.slice('/api/community-growth/profiles/'.length);
  const member = await guild.members.fetch(userId).catch(() => null);
  const profile = await getCommunityGrowthProfile(config, guild.id, userId, member ? {
    displayName: member.displayName,
    username: member.user.username,
    avatarUrl: member.user.displayAvatarURL?.({ size: 256 }),
  } : null);

  if (!profile) {
    sendJson(response, 404, { error: 'No Community Growth profile was found.' });
    return;
  }

  sendJson(response, 200, { ok: true, profile });
}

async function handleSaveCommunityGrowthSettings(client, request, response, actor) {
  const body = await readJsonBody(request, config.dashboard.maxBodyBytes);

  try {
    await saveCommunityGrowthSettings(config, body.settings, actor);
    const guild = getDashboardGuild(client);
    const overview = await getCommunityGrowthOverview(config, guild?.id || config.guildId);

    sendJson(response, 200, { ok: true, ...overview });
  } catch (error) {
    sendJson(response, 400, { error: error.message });
  }
}

async function handleStartCommunityGrowthSeason(client, request, response, actor) {
  const guild = getDashboardGuild(client);

  if (!guild) {
    sendJson(response, 404, { error: 'The dashboard Discord server was not found.' });
    return;
  }

  const body = await readJsonBody(request, config.dashboard.maxBodyBytes);

  try {
    const result = await startCommunityGrowthSeason(config, {
      guildId: guild.id,
      name: body.name,
      startsAt: body.startsAt,
      endsAt: body.endsAt,
      actor,
    });
    const overview = await getCommunityGrowthOverview(config, guild.id);

    sendJson(response, 200, { ok: true, result, ...overview });
  } catch (error) {
    sendJson(response, 400, { error: error.message });
  }
}

async function handleCommunityGrowthRecognition(client, request, pathname, response, actor) {
  const guild = getDashboardGuild(client);

  if (!guild) {
    sendJson(response, 404, { error: 'The dashboard Discord server was not found.' });
    return;
  }

  const userId = pathname
    .slice('/api/community-growth/profiles/'.length)
    .replace('/recognition', '');
  const member = await guild.members.fetch(userId).catch(() => null);

  if (!member) {
    sendJson(response, 404, { error: 'That member is no longer in the configured server.' });
    return;
  }

  const body = await readJsonBody(request, config.dashboard.maxBodyBytes);

  try {
    const profile = await grantCommunityGrowthRecognition(config, {
      guildId: guild.id,
      userId,
      displayName: member.displayName,
      username: member.user.username,
      avatarUrl: member.user.displayAvatarURL?.({ size: 256 }),
      trait: body.trait,
      points: body.points,
      reason: body.reason,
      badgeId: body.badgeId,
      actor,
    });
    const overview = await getCommunityGrowthOverview(config, guild.id);

    sendJson(response, 200, { ok: true, profile, ...overview });
  } catch (error) {
    sendJson(response, 400, { error: error.message });
  }
}

async function handleGetProtection(client, response) {
  const overview = await getProtectionOverview(client, config);

  sendJson(response, 200, { ok: true, ...overview });
}

async function handleSaveProtectionSettings(client, request, response, actor) {
  const body = await readJsonBody(request, config.dashboard.maxBodyBytes);

  try {
    await saveProtectionSettings(config, body.settings, actor);
    const overview = await getProtectionOverview(client, config);

    await sendStructuredLog(client, overview.settings.alertChannelId || config.channels.operationLog, {
      title: 'Bean Protection Settings Updated',
      emoji: '🛡️',
      color: colors.info,
      summary: `**${actor?.displayName || 'A dashboard user'}** updated Bean Protection.`,
      referenceId: `PROTECTION-CONFIG-${Date.now()}`,
      fields: [
        { name: 'Dashboard Role', value: actor?.role || 'Staff' },
        { name: 'Flood Threshold', value: `${overview.settings.floodMessageLimit} messages / ${overview.settings.floodWindowSeconds}s` },
        { name: 'Join Threshold', value: `${overview.settings.joinLimit} joins / ${overview.settings.joinWindowSeconds}s` },
      ],
      activity: false,
    }, config).catch((error) => console.error('Failed to log protection configuration:', error));

    sendJson(response, 200, { ok: true, ...overview });
  } catch (error) {
    sendJson(response, 400, { error: error.message });
  }
}

async function handleSetProtectionRaidMode(client, request, response, actor) {
  const body = await readJsonBody(request, config.dashboard.maxBodyBytes);

  if (typeof body.active !== 'boolean') {
    sendJson(response, 400, { error: 'Raid mode requires an active boolean.' });
    return;
  }

  const guild = getDashboardGuild(client);

  if (!guild) {
    sendJson(response, 404, { error: 'The dashboard Discord server was not found.' });
    return;
  }

  try {
    await setRaidMode(client, config, {
      active: body.active,
      guildId: guild.id,
      actor,
      reason: String(body.reason || '').trim() || `Raid mode ${body.active ? 'enabled' : 'disabled'} from the dashboard.`,
      source: 'dashboard',
    });
    const overview = await getProtectionOverview(client, config);

    sendJson(response, 200, { ok: true, ...overview });
  } catch (error) {
    sendJson(response, 400, { error: error.message });
  }
}

async function handleSyncProtectionRules(client, response, actor) {
  const guild = getDashboardGuild(client);

  if (!guild) {
    sendJson(response, 404, { error: 'The dashboard Discord server was not found.' });
    return;
  }

  try {
    const result = await syncNativeAutoModerationRules(guild, config, actor);
    const overview = await getProtectionOverview(client, config);

    sendJson(response, 200, { ok: true, result, ...overview });
  } catch (error) {
    sendJson(response, 400, { error: error.message });
  }
}

async function handleProtectionEmergencyProfile(client, request, response, actor) {
  const body = await readJsonBody(request, config.dashboard.maxBodyBytes);
  const action = String(body.action || '').trim().toLowerCase();

  try {
    let result;

    if (action === 'activate') {
      result = {
        emergency: await activateEmergencySafetyProfile(client, config, {
          profile: body.profile,
          durationMinutes: body.durationMinutes,
          reason: body.reason,
          actor,
          confirmed: body.confirmed === true,
        }),
      };
    } else if (action === 'restore') {
      result = await restoreEmergencySafetyProfile(client, config, {
        actor,
        reason: body.reason,
      });
    } else {
      sendJson(response, 400, { error: 'Choose activate or restore.' });
      return;
    }

    const overview = await getProtectionOverview(client, config);

    sendJson(response, 200, { ok: true, result, ...overview });
  } catch (error) {
    sendJson(response, 400, { error: error.message });
  }
}

async function handleResolveQuarantineReview(client, request, pathname, response, actor) {
  const reviewId = decodeURIComponent(
    pathname.match(/^\/api\/protection\/quarantine\/([^/]+)\/action$/)?.[1] || '',
  );
  const body = await readJsonBody(request, config.dashboard.maxBodyBytes);

  try {
    const review = await resolveQuarantineReview(client, config, {
      reviewId,
      action: body.action,
      actor,
      reason: body.reason,
      durationMs: Number.parseInt(body.durationMinutes, 10) * 60 * 1000,
      deleteMessageSeconds: body.deleteMessageSeconds,
    });
    const overview = await getProtectionOverview(client, config);

    sendJson(response, 200, { ok: true, review, ...overview });
  } catch (error) {
    sendJson(response, error.message.includes('not found') ? 404 : 400, { error: error.message });
  }
}

async function handleAddQuarantineReviewNote(client, request, pathname, response, actor) {
  const reviewId = decodeURIComponent(
    pathname.match(/^\/api\/protection\/quarantine\/([^/]+)\/notes$/)?.[1] || '',
  );
  const body = await readJsonBody(request, config.dashboard.maxBodyBytes);

  try {
    const review = await addQuarantineReviewNote(config, reviewId, body.note, actor);
    const overview = await getProtectionOverview(client, config);

    sendJson(response, 200, { ok: true, review, ...overview });
  } catch (error) {
    sendJson(response, error.message.includes('not found') ? 404 : 400, { error: error.message });
  }
}

async function handleBulkReleaseQuarantineReviews(client, request, response, actor) {
  const body = await readJsonBody(request, config.dashboard.maxBodyBytes);
  const guild = getDashboardGuild(client);

  if (!guild) {
    sendJson(response, 404, { error: 'The dashboard Discord server was not found.' });
    return;
  }

  try {
    const result = await bulkReleaseQuarantineReviews(client, config, {
      guildId: guild.id,
      actor,
      reason: body.reason,
    });
    const overview = await getProtectionOverview(client, config);

    sendJson(response, 200, { ok: true, result, ...overview });
  } catch (error) {
    sendJson(response, 400, { error: error.message });
  }
}

async function getDashboardStorageHealth() {
  const presence = await getPresenceSettingsStorageStatus(config).catch(() => null);
  const stores = [
    ['Saved Messages', getSavedMessagesStorageInfo(config)],
    ['Scheduled Mailbox', getMailboxScheduleStorageInfo(config)],
    ['Activity Feed', getActivityFeedStorageInfo(config)],
    ['Moderation Cases', getModerationCasesStorageInfo(config)],
    ['Temporary Voice', getTempVoiceStorageInfo(config)],
    ['Live Embed', getStreamEmbedStorageInfo(config)],
    ['YouTube Embed', getYouTubeEmbedStorageInfo(config)],
    ['YouTube Upload State', getYouTubeUploadStateStorageInfo(config)],
    ['Welcome Message', getWelcomeEmbedStorageInfo(config)],
    ['Presence', presence],
    ['Dashboard Configuration', getDashboardSettingsStorageInfo(config)],
    ['Bean Protection', getProtectionStorageInfo(config)],
    ['Community Growth', getCommunityGrowthStorageInfo(config)],
  ];

  return Promise.all(stores.map(async ([name, storage]) => {
    if (!storage) {
      return {
        name,
        persistent: false,
        available: false,
        source: 'Unavailable',
      };
    }

    let available = true;

    try {
      await fs.promises.access(path.dirname(storage.filePath));
    } catch {
      available = false;
    }

    return {
      name,
      persistent: Boolean(storage.persistent),
      available,
      source: storage.source,
      filePath: storage.filePath,
    };
  }));
}

async function handleGetSavedMessages(response) {
  const messages = await loadSavedMessages(config);

  sendJson(response, 200, {
    ok: true,
    messages,
  });
}

async function handleSaveSavedMessages(request, response) {
  const body = await readJsonBody(request, config.dashboard.maxBodyBytes);
  let messages;

  try {
    messages = await saveSavedMessages(config, body.messages);
  } catch (error) {
    sendJson(response, 400, { error: error.message });
    return;
  }

  sendJson(response, 200, {
    ok: true,
    messages,
  });
}

async function handleDeleteSavedMessage(pathname, response) {
  const encodedId = pathname.slice('/api/saved-messages/'.length);
  let messageId;

  try {
    messageId = decodeURIComponent(encodedId).trim();
  } catch {
    sendJson(response, 400, { error: 'Saved message ID is invalid.' });
    return;
  }

  try {
    const messages = await deleteSavedMessage(config, messageId);
    sendJson(response, 200, { ok: true, messages });
  } catch (error) {
    const status = error.code === 'SAVED_MESSAGE_NOT_FOUND' ? 404 : 400;
    sendJson(response, status, { error: error.message });
  }
}

async function handleGetStreamEmbed(response) {
  const [settings, storage] = await Promise.all([
    loadStreamEmbedSettings(config),
    getStreamEmbedStorageStatus(config),
  ]);

  sendJson(response, 200, {
    ok: true,
    settings,
    storage,
  });
}

async function handleSaveStreamEmbed(request, response) {
  const body = await readJsonBody(request, 256 * 1024);
  let settings;

  try {
    settings = await saveStreamEmbedSettings(config, body.settings);
    config.channels.streamAnnouncements = settings.channelId;
  } catch (error) {
    sendJson(response, 400, { error: error.message });
    return;
  }

  sendJson(response, 200, {
    ok: true,
    settings,
    storage: await getStreamEmbedStorageStatus(config),
  });
}

async function handleGetYouTubeEmbed(response) {
  const [settings, storage] = await Promise.all([
    loadYouTubeEmbedSettings(config),
    getYouTubeEmbedStorageStatus(config),
  ]);

  sendJson(response, 200, {
    ok: true,
    settings,
    storage,
  });
}

async function handleSaveYouTubeEmbed(request, response) {
  const body = await readJsonBody(request, 256 * 1024);
  let settings;

  try {
    settings = await saveYouTubeEmbedSettings(config, body.settings);
    config.channels.youtubeAnnouncements = settings.channelId;
  } catch (error) {
    sendJson(response, 400, { error: error.message });
    return;
  }

  sendJson(response, 200, {
    ok: true,
    settings,
    storage: await getYouTubeEmbedStorageStatus(config),
  });
}

async function handleGetWelcomeEmbed(response) {
  const [settings, storage] = await Promise.all([
    loadWelcomeEmbedSettings(config),
    getWelcomeEmbedStorageStatus(config),
  ]);

  sendJson(response, 200, {
    ok: true,
    settings,
    storage,
  });
}

async function handleSaveWelcomeEmbed(request, response) {
  const body = await readJsonBody(request, config.dashboard.maxBodyBytes);
  let settings;

  try {
    settings = await saveWelcomeEmbedSettings(config, body.settings);
    config.channels.welcome = settings.channelId;
  } catch (error) {
    sendJson(response, 400, { error: error.message });
    return;
  }

  sendJson(response, 200, {
    ok: true,
    settings,
    storage: await getWelcomeEmbedStorageStatus(config),
  });
}

async function handleGetModerationCases(response) {
  const cases = await listModerationCases(config, config.guildId);

  sendJson(response, 200, {
    ok: true,
    cases,
    storage: getModerationCasesStorageInfo(config),
  });
}

async function handleUpdateModerationCaseReason(client, request, pathname, response) {
  const number = parseModerationCaseNumber(pathname);
  const body = await readJsonBody(request, 64 * 1024);
  const currentCase = await getModerationCase(config, number, config.guildId);

  if (!currentCase) {
    sendJson(response, 404, { error: `Case #${number} was not found.` });
    return;
  }

  let moderationCase;

  try {
    moderationCase = await updateModerationCaseReason(
      config,
      number,
      body.reason,
      createDashboardCaseActor(),
    );
  } catch (error) {
    sendJson(response, 400, { error: error.message });
    return;
  }

  const logged = await sendStructuredLog(client, config.channels.caseFiles, {
    title: 'Case Reason Corrected from Dashboard',
    emoji: '✏️',
    color: colors.info,
    summary: `${moderationCase.reference} was updated through the staff dashboard.`,
    referenceId: moderationCase.reference,
    fields: [
      { name: 'Case Member', value: `<@${moderationCase.userId}>\n-# ID: \`${moderationCase.userId}\`` },
      { name: 'Edited By', value: `<@${config.ownerUserId}>\n-# Dashboard operator` },
      { name: 'Previous Reason', value: currentCase.reason },
      { name: 'Corrected Reason', value: moderationCase.reason },
    ],
  }).catch((error) => {
    console.error(`Failed to log dashboard update for ${moderationCase.reference}:`, error);
    return false;
  });

  sendJson(response, 200, { ok: true, case: moderationCase, logged });
}

async function handleUpdateModerationCaseStatus(client, request, pathname, response) {
  const number = parseModerationCaseNumber(pathname);
  const body = await readJsonBody(request, 64 * 1024);
  const currentCase = await getModerationCase(config, number, config.guildId);

  if (!currentCase) {
    sendJson(response, 404, { error: `Case #${number} was not found.` });
    return;
  }

  if (String(body.status || '').toLowerCase() !== 'revoked') {
    sendJson(response, 400, { error: 'The dashboard currently supports revoking cases only.' });
    return;
  }

  let moderationCase;

  try {
    moderationCase = await revokeModerationCase(
      config,
      number,
      body.reason,
      createDashboardCaseActor(),
    );
  } catch (error) {
    sendJson(response, 400, { error: error.message });
    return;
  }

  const latestStatus = moderationCase.statusHistory.at(-1);
  const logged = await sendStructuredLog(client, config.channels.caseFiles, {
    title: 'Moderation Case Revoked',
    emoji: '🗑️',
    color: colors.neutral,
    summary: `${moderationCase.reference} was revoked through the staff dashboard.`,
    referenceId: moderationCase.reference,
    fields: [
      { name: 'Case Member', value: `<@${moderationCase.userId}>\n-# ID: \`${moderationCase.userId}\`` },
      { name: 'Original Action', value: moderationCase.action.toUpperCase() },
      { name: 'Revoked By', value: `<@${config.ownerUserId}>\n-# Dashboard operator` },
      { name: 'Revocation Reason', value: latestStatus.reason },
    ],
  }).catch((error) => {
    console.error(`Failed to log revocation for ${moderationCase.reference}:`, error);
    return false;
  });

  sendJson(response, 200, { ok: true, case: moderationCase, logged });
}

function parseModerationCaseNumber(pathname) {
  return Number.parseInt(pathname.match(/^\/api\/moderation-cases\/(\d+)\//)?.[1], 10);
}

function createDashboardCaseActor() {
  return {
    id: config.ownerUserId,
    tag: 'Dashboard operator',
  };
}

async function handleGetTempVoice(client, response) {
  if (!client.isReady()) {
    sendJson(response, 503, { error: 'Bot is not ready yet.' });
    return;
  }

  const overview = await getTempVoiceOverview(client, config);
  sendJson(response, 200, { ok: true, ...overview });
}

async function handleSaveTempVoiceSettings(client, request, response) {
  if (!client.isReady()) {
    sendJson(response, 503, { error: 'Bot is not ready yet.' });
    return;
  }

  const body = await readJsonBody(request, 64 * 1024);
  let settings;

  try {
    settings = await saveTempVoiceSettings(client, config, body.settings);
  } catch (error) {
    sendJson(response, 400, { error: error.message });
    return;
  }

  await logTempVoiceDashboardAction(client, {
    title: 'Temporary Voice Settings Updated',
    summary: 'Join-to-create voice room settings were changed through the dashboard.',
    referenceId: `TEMP-VOICE-SETTINGS-${Date.now()}`,
    fields: [
      { name: 'System', value: settings.enabled ? 'Enabled' : 'Disabled' },
      { name: 'Create Lobby', value: `<#${settings.triggerChannelId}>\n-# ID: \`${settings.triggerChannelId}\`` },
      { name: 'Empty-room Cleanup', value: '10 seconds' },
    ],
  });
  sendJson(response, 200, { ok: true, settings });
}

async function handleDeleteTempVoiceRoom(client, pathname, response) {
  if (!client.isReady()) {
    sendJson(response, 503, { error: 'Bot is not ready yet.' });
    return;
  }

  const channelId = parseTempVoiceChannelId(pathname);

  if (!/^\d{17,20}$/.test(channelId)) {
    sendJson(response, 400, { error: 'Invalid voice channel ID.' });
    return;
  }

  let room;

  try {
    room = await deleteTempVoiceRoom(client, config, channelId);
  } catch (error) {
    sendJson(response, 400, { error: error.message });
    return;
  }

  if (!room) {
    sendJson(response, 404, { error: 'Temporary voice room was not found.' });
    return;
  }

  await logTempVoiceDashboardAction(client, {
    title: 'Temporary Voice Room Deleted',
    color: colors.danger,
    summary: `Temporary room <#${channelId}> was deleted through the dashboard.`,
    referenceId: `TEMP-VOICE-DELETE-${channelId}-${Date.now()}`,
    fields: [
      { name: 'Owner', value: `<@${room.ownerId}>\n-# ID: \`${room.ownerId}\`` },
      { name: 'Visibility', value: room.private ? 'Private' : 'Public' },
    ],
  });
  sendJson(response, 200, { ok: true, room });
}

async function logTempVoiceDashboardAction(client, options) {
  return sendStructuredLog(client, config.channels.operationLog, {
    emoji: '☕',
    color: options.color ?? colors.info,
    ...options,
  }).catch((error) => {
    console.error(`Failed to log temporary voice dashboard action ${options.referenceId}:`, error);
    return false;
  });
}

function parseTempVoiceChannelId(pathname) {
  const encodedId = pathname.slice('/api/temp-voice/channels/'.length);

  try {
    return decodeURIComponent(encodedId).trim();
  } catch {
    return '';
  }
}

async function handleImportMessage(client, request, response) {
  if (!client.isReady()) {
    sendJson(response, 503, { error: 'Bot is not ready yet.' });
    return;
  }

  const body = await readJsonBody(request, 256 * 1024);
  let target;

  try {
    target = parseDiscordMessageLink(body.url || body.messageUrl || body.messageLink);
  } catch (error) {
    sendJson(response, 400, { error: error.message });
    return;
  }

  const channel = await client.channels.fetch(target.channelId).catch(() => null);

  if (!channel || !channel.messages || typeof channel.messages.fetch !== 'function') {
    sendJson(response, 404, { error: 'Message channel was not found or is not readable by the bot.' });
    return;
  }

  const message = await channel.messages.fetch(target.messageId).catch(() => null);

  if (!message) {
    sendJson(response, 404, { error: 'Discord message was not found.' });
    return;
  }

  let importedMessage;

  try {
    importedMessage = await createSavedMessageFromDiscordMessage(message, body.name);
  } catch (error) {
    sendJson(response, 400, { error: error.message });
    return;
  }

  const currentMessages = await loadSavedMessages(config);
  const existingIndex = currentMessages.findIndex((savedMessage) => savedMessage.id === importedMessage.id);
  const nextMessages = [...currentMessages];

  if (existingIndex >= 0) {
    nextMessages[existingIndex] = importedMessage;
  } else {
    nextMessages.unshift(importedMessage);
  }

  const messages = await saveSavedMessages(config, nextMessages);

  sendJson(response, 200, {
    ok: true,
    message: importedMessage,
    messages,
  });
}

function parseDiscordMessageLink(value) {
  const match = String(value || '').match(
    /^https?:\/\/(?:canary\.|ptb\.)?discord(?:app)?\.com\/channels\/(\d{17,20})\/(\d{17,20})\/(\d{17,20})(?:\?.*)?$/i,
  );

  if (!match) {
    throw new Error('Paste a valid Discord message link.');
  }

  return {
    guildId: match[1],
    channelId: match[2],
    messageId: match[3],
  };
}

async function createSavedMessageFromDiscordMessage(message, requestedName) {
  const blocks = [];
  const buttons = [];
  let image = null;
  const components = normalizeComponentArray(message.components);
  const color = findContainerColor(components);

  for (const component of components) {
    const componentImage = await collectSavedMessageComponents(component, message, blocks, buttons);

    if (!image && componentImage) {
      image = componentImage;
    }
  }

  if (!image && message.attachments?.size) {
    image = await importFirstImageAttachment(message);
  }

  if (!image && blocks.length === 0 && buttons.length === 0) {
    throw new Error('That message does not contain importable Components v2 content.');
  }

  const name = String(requestedName || '').trim() || deriveSavedMessageName(blocks) || 'Imported Message';

  return {
    id: `discord-message-${message.id}`,
    name,
    channelId: message.channelId || '',
    color,
    image,
    blocks,
    buttons,
    allowMentions: false,
    updatedAt: new Date().toISOString(),
  };
}

function findContainerColor(components) {
  for (const component of components) {
    const data = toComponentData(component);

    if (data?.type === 17 && Number.isInteger(data.accent_color)) {
      return `#${data.accent_color.toString(16).padStart(6, '0').toUpperCase()}`;
    }
  }

  return null;
}

async function collectSavedMessageComponents(component, message, blocks, buttons) {
  if (!component || typeof component !== 'object') {
    return null;
  }

  const data = toComponentData(component);

  if (data.type === 17 && Array.isArray(data.components)) {
    let image = null;

    for (const child of data.components) {
      const componentImage = await collectSavedMessageComponents(child, message, blocks, buttons);

      if (!image && componentImage) {
        image = componentImage;
      }
    }

    return image;
  }

  if (data.type === 12) {
    return importMediaGalleryImage(data, message);
  }

  if (data.type === 14) {
    blocks.push({
      type: data.divider ? 'divider' : 'spacer',
      spacing: data.spacing === 2 ? 'large' : 'small',
    });
    return null;
  }

  if (data.type === 10 && data.content) {
    blocks.push({
      type: 'text',
      content: String(data.content),
      accessory: null,
    });
    return null;
  }

  if (data.type === 9) {
    const content = normalizeComponentArray(data.components)
      .filter((child) => child.type === 10 && child.content)
      .map((child) => String(child.content))
      .join('\n');

    if (content) {
      blocks.push({
        type: 'text',
        content,
        accessory: normalizeLinkButton(data.accessory),
      });
    }

    return null;
  }

  if (data.type === 1) {
    for (const child of normalizeComponentArray(data.components)) {
      const button = normalizeLinkButton(child);

      if (button) {
        buttons.push(button);
      }
    }
  }

  return null;
}

function normalizeComponentArray(components) {
  return Array.isArray(components) ? components.map(toComponentData).filter(Boolean) : [];
}

function toComponentData(component) {
  if (!component) {
    return null;
  }

  if (typeof component.toJSON === 'function') {
    return component.toJSON();
  }

  return component;
}

function normalizeLinkButton(component) {
  const button = toComponentData(component);

  if (!button || button.type !== 2 || !button.url) {
    return null;
  }

  return {
    label: String(button.label || 'Open'),
    url: String(button.url),
  };
}

async function importMediaGalleryImage(component, message) {
  const item = Array.isArray(component.items) ? component.items[0] : null;
  const url = item?.media?.url;

  if (!url) {
    return null;
  }

  if (String(url).startsWith('attachment://')) {
    const fileName = String(url).replace('attachment://', '');
    const attachment = message.attachments?.find?.((item) => item.name === fileName);

    return attachment ? importImageUrl(attachment.url, attachment.name) : null;
  }

  return importImageUrl(url, 'imported-image');
}

async function importFirstImageAttachment(message) {
  const attachment = message.attachments?.find?.((item) => String(item.contentType || '').startsWith('image/'));

  return attachment ? importImageUrl(attachment.url, attachment.name) : null;
}

async function importImageUrl(url, name) {
  if (!/^https?:\/\//i.test(String(url || ''))) {
    return null;
  }

  const response = await fetch(url).catch(() => null);

  if (!response?.ok) {
    return null;
  }

  const mimeType = String(response.headers.get('content-type') || '').split(';')[0];

  if (!['image/gif', 'image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
    return null;
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  if (buffer.length > config.dashboard.maxUploadBytes) {
    return null;
  }

  return {
    name: String(name || 'imported-image'),
    dataUrl: `data:${mimeType};base64,${buffer.toString('base64')}`,
  };
}

function deriveSavedMessageName(blocks) {
  const textBlock = blocks.find((block) => block.type === 'text' && block.content.trim());

  if (!textBlock) {
    return '';
  }

  return textBlock.content
    .split('\n')[0]
    .replace(/^#+\s*/, '')
    .replace(/[*_`~|>]/g, '')
    .trim()
    .slice(0, 80);
}

async function handleGetBot(client, response) {
  sendJson(response, 200, await createBotState(client));
}

async function handleUpdatePresence(client, request, response) {
  if (!client.isReady()) {
    sendJson(response, 503, { error: 'Bot is not ready yet.' });
    return;
  }

  const body = await readJsonBody(request, 64 * 1024);
  let presence;

  try {
    presence = normalizePresenceSettings(body, getPresenceState());
  } catch (error) {
    sendJson(response, 400, { error: error.message });
    return;
  }

  try {
    presence = await savePresenceSettings(config, presence);
  } catch (error) {
    console.error('Failed to save presence settings:', error);
    sendJson(response, 500, { error: 'Could not save presence settings. Check the bot storage configuration.' });
    return;
  }

  updatePresenceRotation(client, presence);

  sendJson(response, 200, await createBotState(client));
}

async function handleUpdateBotBio(client, request, response) {
  if (!client.isReady() || !client.application || typeof client.application.edit !== 'function') {
    sendJson(response, 503, { error: 'Bot application is not ready yet.' });
    return;
  }

  const body = await readJsonBody(request, 64 * 1024);
  const bio = String(body.bio || '').trim();

  if (bio.length > 400) {
    sendJson(response, 400, { error: 'Bot bio must be 400 characters or fewer.' });
    return;
  }

  try {
    await client.application.edit({ description: bio });
  } catch (error) {
    sendJson(response, 400, { error: createBotProfileError(error, 'bio') });
    return;
  }

  sendJson(response, 200, await createBotState(client));
}

async function handleUpdateBotImage(client, request, response, kind) {
  if (!client.isReady()) {
    sendJson(response, 503, { error: 'Bot is not ready yet.' });
    return;
  }

  const body = await readJsonBody(request, config.dashboard.maxBodyBytes);
  let image;

  try {
    image = normalizeBotImage(body.image, kind);
  } catch (error) {
    sendJson(response, 400, { error: error.message });
    return;
  }

  try {
    if (kind === 'avatar') {
      await client.user.setAvatar(image.buffer);
    } else {
      await client.user.setBanner(image.buffer);
    }
  } catch (error) {
    sendJson(response, 400, { error: createBotProfileError(error, kind) });
    return;
  }

  sendJson(response, 200, await createBotState(client));
}

async function createBotState(client) {
  const user = client.user || null;
  const application = client.application || null;
  const presenceStorage = await getPresenceSettingsStorageStatus(config);

  if (client.isReady() && user && typeof user.fetch === 'function') {
    await user.fetch(true).catch(() => null);
  }

  if (client.isReady() && application && typeof application.fetch === 'function') {
    await application.fetch().catch(() => null);
  }

  return {
    ok: true,
    botReady: client.isReady(),
    guildName: getDashboardGuildName(client),
    id: user?.id || null,
    tag: user?.tag || null,
    username: user?.username || null,
    avatarUrl: getAvatarUrl(user),
    bannerUrl: getBannerUrl(user),
    bio: application?.description || '',
    presence: getPresenceState(),
    presenceStorage,
  };
}

function getDashboardGuildName(client) {
  const guild = getDashboardGuild(client);
  return guild?.name || config.communityName;
}

function getDashboardGuild(client) {
  const guildCache = client.guilds?.cache;

  if (!guildCache) {
    return null;
  }

  const configuredGuild = config.guildId ? guildCache.get(config.guildId) : null;
  return configuredGuild || guildCache.first?.() || guildCache.values?.().next().value || null;
}

function normalizeBotImage(image, kind) {
  if (!image?.dataUrl) {
    throw new Error(`Choose a ${kind} image first.`);
  }

  const match = String(image.dataUrl).match(/^data:(image\/(?:gif|jpeg|jpg|png|webp));base64,([a-z0-9+/=]+)$/i);

  if (!match) {
    throw new Error('Image upload must be a PNG, JPG, GIF, or WebP data URL.');
  }

  const buffer = Buffer.from(match[2], 'base64');

  if (!buffer.length) {
    throw new Error('Image upload was empty.');
  }

  if (buffer.length > config.dashboard.maxUploadBytes) {
    throw new Error(`Image must be ${Math.floor(config.dashboard.maxUploadBytes / 1024 / 1024)} MB or smaller.`);
  }

  return {
    buffer,
    mimeType: match[1],
  };
}

function getAvatarUrl(user) {
  if (!user || typeof user.displayAvatarURL !== 'function') {
    return null;
  }

  return user.displayAvatarURL({ size: 256 });
}

function getBannerUrl(user) {
  if (!user || typeof user.bannerURL !== 'function') {
    return null;
  }

  return user.bannerURL({ size: 512 });
}

function createBotProfileError(error, kind) {
  const message = error?.rawError?.message || error?.message || `Could not update bot ${kind}.`;

  if (String(message).toLowerCase().includes('rate')) {
    return `Discord is rate limiting bot profile changes right now. Try again later. ${message}`;
  }

  return message;
}

function serveStatic(pathname, response) {
  const route = pathname === '/' ? '/index.html' : pathname;
  const requestedPath = path.normalize(route).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(dashboardDirectory, requestedPath);

  if (!filePath.startsWith(dashboardDirectory)) {
    sendText(response, 403, 'Forbidden');
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    sendText(response, 404, 'Not found');
    return;
  }

  const extension = path.extname(filePath).toLowerCase();
  const contentTypes = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
  };

  response.writeHead(200, {
    'Content-Type': contentTypes[extension] || 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  fs.createReadStream(filePath).pipe(response);
}

function readJsonBody(request, maxBytes) {
  return readTextBody(request, maxBytes).then((body) => {
    if (!body) {
      return {};
    }

    try {
      return JSON.parse(body);
    } catch {
      throw new Error('Request body must be valid JSON.');
    }
  });
}

function readFormBody(request, maxBytes) {
  return readTextBody(request, maxBytes).then((body) => Object.fromEntries(new URLSearchParams(body)));
}

function readTextBody(request, maxBytes) {
  return new Promise((resolve, reject) => {
    let body = '';
    let bytes = 0;

    request.setEncoding('utf8');

    request.on('data', (chunk) => {
      bytes += Buffer.byteLength(chunk);

      if (bytes > maxBytes) {
        reject(new Error('Request body is too large.'));
        request.destroy();
        return;
      }

      body += chunk;
    });

    request.on('end', () => {
      resolve(body);
    });

    request.on('error', reject);
  });
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  response.end(JSON.stringify(payload));
}

function redirect(response, location) {
  response.writeHead(303, {
    Location: location,
    'Cache-Control': 'no-store',
  });
  response.end();
}

function sendText(response, statusCode, text) {
  response.writeHead(statusCode, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  response.end(text);
}

function parseCookies(request) {
  return Object.fromEntries(
    String(request.headers.cookie || '')
      .split(';')
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const separatorIndex = cookie.indexOf('=');
        return [cookie.slice(0, separatorIndex), decodeURIComponent(cookie.slice(separatorIndex + 1))];
      }),
  );
}

function getAuthenticatedSession(request) {
  const cookie = parseCookies(request)[sessionCookieName];
  const bearerToken = readBearerToken(request);

  if (isPasswordLoginConfigured()) {
    const expected = createSessionValue();

    if (matchesSessionValue(cookie, expected) || matchesSessionValue(bearerToken, expected)) {
      return createPasswordSession();
    }
  }

  const token = cookie || bearerToken;
  const session = oauthSessions.get(token);

  if (!session) {
    return null;
  }

  if (session.expiresAt <= Date.now()) {
    oauthSessions.delete(token);
    return null;
  }

  return session;
}

function createSessionValue() {
  return crypto
    .createHmac('sha256', config.dashboard.password || config.dashboard.discordOauth?.clientSecret || 'bean')
    .update('bean-dashboard-session')
    .digest('hex');
}

function matchesSessionValue(value, expected) {
  if (!value || value.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}

function readBearerToken(request) {
  const authorization = String(request.headers.authorization || '');
  const [scheme, token] = authorization.split(/\s+/, 2);

  return scheme.toLowerCase() === 'bearer' ? token : undefined;
}

function setCookie(response, name, value, options = {}) {
  const attributes = [`${name}=${encodeURIComponent(value)}`, 'Path=/', 'HttpOnly', 'SameSite=Lax'];

  if (options.maxAge !== undefined) {
    attributes.push(`Max-Age=${options.maxAge}`);
  }

  if (options.secure) {
    attributes.push('Secure');
  }

  response.setHeader('Set-Cookie', attributes.join('; '));
}

function isSecureRequest(request) {
  return request.headers['x-forwarded-proto'] === 'https' || request.socket.encrypted;
}

function isDashboardPassword(value) {
  return isPasswordLoginConfigured() && value.trim() === config.dashboard.password;
}

function isPasswordLoginConfigured() {
  return config.dashboard.passwordLoginEnabled === true && Boolean(config.dashboard.password);
}

function createPasswordSession() {
  return {
    expiresAt: Number.POSITIVE_INFINITY,
    user: {
      id: config.ownerUserId || 'dashboard-owner',
      username: 'Founder',
      displayName: 'Dashboard Founder',
      avatarUrl: null,
      role: 'founder',
      authMode: 'password',
    },
  };
}

function isDiscordOauthConfigured() {
  return getDiscordOauthStatus().enabled;
}

function getDiscordOauthStatus() {
  const requirements = [
    ['DASHBOARD_DISCORD_OAUTH_ENABLED=true', config.dashboard.discordOauth?.enabled === true],
    ['DASHBOARD_PUBLIC_URL', Boolean(config.dashboard.publicUrl)],
    ['DISCORD_CLIENT_SECRET', Boolean(config.dashboard.discordOauth?.clientSecret)],
    ['DISCORD_CLIENT_ID', Boolean(config.clientId)],
    ['DISCORD_GUILD_ID', Boolean(config.guildId)],
  ];
  const missing = requirements
    .filter(([, ready]) => !ready)
    .map(([name]) => name);

  return {
    enabled: missing.length === 0,
    missing,
    redirectUri: config.dashboard.publicUrl ? getDiscordOauthRedirectUri() : null,
  };
}

function getDiscordOauthRedirectUri() {
  return `${String(config.dashboard.publicUrl || '').replace(/\/+$/, '')}/auth/discord/callback`;
}

function resolveDashboardRole(userId, memberRoles = []) {
  const roles = new Set(Array.isArray(memberRoles) ? memberRoles : []);

  if (userId === config.ownerUserId || roles.has(config.roles.founder)) return 'founder';
  if (roles.has(config.roles.staff)) return 'staff';
  if (roles.has(config.roles.moderator)) return 'moderator';
  return null;
}

function getSessionPermissions(session) {
  const role = session?.user?.role || null;
  const founder = role === 'founder';
  const staff = role === 'staff';
  const moderator = role === 'moderator';

  return {
    role,
    view: founder || staff || moderator,
    create: founder || staff,
    moderate: founder || staff || moderator,
    configure: founder || staff,
    owner: founder,
  };
}

function sessionCanAccess(session, method, pathname) {
  const permissions = getSessionPermissions(session);

  if (method === 'GET') {
    return permissions.view;
  }

  if (pathname === '/api/logout') return true;
  if (pathname === '/api/configuration' || pathname.startsWith('/api/bot/')) return permissions.configure;
  if (pathname.startsWith('/api/moderation-cases/')) return permissions.moderate;
  if (pathname.startsWith('/api/temp-voice/')) return permissions.moderate;
  if (pathname === '/api/protection/raid') return permissions.moderate;
  if (pathname === '/api/protection/emergency') return permissions.moderate;
  if (pathname.startsWith('/api/protection/quarantine')) return permissions.moderate;
  if (pathname.startsWith('/api/protection/')) return permissions.configure;
  if (/^\/api\/community-growth\/profiles\/\d{17,20}\/recognition$/.test(pathname)) {
    return permissions.moderate;
  }
  if (pathname.startsWith('/api/community-growth/')) return permissions.configure;
  if (
    pathname.startsWith('/api/send-message')
    || pathname.startsWith('/api/test-announcement')
    || pathname.startsWith('/api/mailbox/')
    || pathname.startsWith('/api/saved-messages')
    || pathname.endsWith('-embed')
  ) {
    return permissions.create;
  }

  return permissions.configure;
}

function pruneOauthState() {
  const now = Date.now();

  for (const [state, expiresAt] of oauthStates) {
    if (expiresAt <= now) {
      oauthStates.delete(state);
    }
  }

  for (const [token, session] of oauthSessions) {
    if (session.expiresAt <= now) {
      oauthSessions.delete(token);
    }
  }
}

function shouldLogDashboardRequest(method, pathname) {
  return pathname === '/health' || pathname === '/login' || pathname.startsWith('/api/') || method !== 'GET';
}

module.exports = {
  startDashboard,
};
