const loginView = document.querySelector('#login-view');
const dashboardView = document.querySelector('#dashboard-view');
const loginError = document.querySelector('#login-error');
const discordLoginWrap = document.querySelector('#discord-login-wrap');
const discordLoginButton = document.querySelector('#discord-login-button');
const discordLoginStatus = document.querySelector('#discord-login-status');
const apiStatus = document.querySelector('#api-status');
const logoutButton = document.querySelector('#logout');
const botStatus = document.querySelector('#bot-status');
const dashboardClock = document.querySelector('#dashboard-clock');
const densityToggle = document.querySelector('#density-toggle');
const sessionAvatar = document.querySelector('#session-avatar');
const sessionName = document.querySelector('#session-name');
const sessionRole = document.querySelector('#session-role');
const notificationTrigger = document.querySelector('#notification-trigger');
const notificationBadge = document.querySelector('#notification-badge');
const notificationCenter = document.querySelector('#notification-center');
const notificationCenterList = document.querySelector('#notification-center-list');
const notificationCenterSummary = document.querySelector('#notification-center-summary');
const notificationCloseButtons = [...document.querySelectorAll('[data-notification-close]')];
const markNotificationsReadButton = document.querySelector('#mark-notifications-read');
const overviewBotStatus = document.querySelector('#overview-bot-status');
const overviewOpenCases = document.querySelector('#overview-open-cases');
const healthStatus = document.querySelector('#health-status');
const refreshHealthButton = document.querySelector('#refresh-health');
const healthUptime = document.querySelector('#health-uptime');
const healthLatency = document.querySelector('#health-latency');
const healthApi = document.querySelector('#health-api');
const healthErrorCount = document.querySelector('#health-error-count');
const healthStorageSummary = document.querySelector('#health-storage-summary');
const healthStorageList = document.querySelector('#health-storage-list');
const healthErrorList = document.querySelector('#health-error-list');
const activityStorageStatus = document.querySelector('#activity-storage-status');
const refreshActivityButton = document.querySelector('#refresh-activity');
const activityFilterButtons = [...document.querySelectorAll('.activity-filter')];
const activityFeed = document.querySelector('#activity-feed');
const journalDate = document.querySelector('#journal-date');
const commandTrigger = document.querySelector('#command-trigger');
const commandPalette = document.querySelector('#command-palette');
const commandSearch = document.querySelector('#command-search');
const commandResults = document.querySelector('#command-results');
const commandCloseButtons = [...document.querySelectorAll('[data-command-close]')];
const memberSearchForm = document.querySelector('#member-search-form');
const memberSearchInput = document.querySelector('#member-search');
const memberSearchButton = document.querySelector('#member-search-button');
const memberResultCount = document.querySelector('#member-result-count');
const memberSearchResults = document.querySelector('#member-search-results');
const memberProfileEmpty = document.querySelector('#member-profile-empty');
const memberProfileContent = document.querySelector('#member-profile-content');
const memberProfilePanel = memberProfileContent?.closest('.member-profile-panel');
const memberProfileAvatar = document.querySelector('#member-profile-avatar');
const memberProfileAvatarFallback = document.querySelector('#member-profile-avatar-fallback');
const memberProfileStatus = document.querySelector('#member-profile-status');
const memberProfileName = document.querySelector('#member-profile-name');
const memberProfileUsername = document.querySelector('#member-profile-username');
const memberProfilePresence = document.querySelector('#member-profile-presence');
const memberProfileMetrics = document.querySelector('#member-profile-metrics');
const memberProfileFacts = document.querySelector('#member-profile-facts');
const memberJoinHistory = document.querySelector('#member-join-history');
const memberModerationHistory = document.querySelector('#member-moderation-history');
const memberRoomHistory = document.querySelector('#member-room-history');
const memberInteractionHistory = document.querySelector('#member-interaction-history');
const analyticsRangeInput = document.querySelector('#analytics-range');
const refreshAnalyticsButton = document.querySelector('#refresh-analytics');
const analyticsActiveMembers = document.querySelector('#analytics-active-members');
const analyticsActiveCaption = document.querySelector('#analytics-active-caption');
const analyticsNetGrowth = document.querySelector('#analytics-net-growth');
const analyticsGrowthCaption = document.querySelector('#analytics-growth-caption');
const analyticsVoicePeak = document.querySelector('#analytics-voice-peak');
const analyticsVoiceCaption = document.querySelector('#analytics-voice-caption');
const analyticsMailboxReactions = document.querySelector('#analytics-mailbox-reactions');
const analyticsMailboxCaption = document.querySelector('#analytics-mailbox-caption');
const analyticsGrowthTotal = document.querySelector('#analytics-growth-total');
const analyticsGrowthChart = document.querySelector('#analytics-growth-chart');
const analyticsVoiceChart = document.querySelector('#analytics-voice-chart');
const analyticsModerationTotal = document.querySelector('#analytics-moderation-total');
const analyticsModerationPatterns = document.querySelector('#analytics-moderation-patterns');
const analyticsPresenceStatus = document.querySelector('#analytics-presence-status');
const analyticsMemberBreakdown = document.querySelector('#analytics-member-breakdown');
const analyticsMailboxStatus = document.querySelector('#analytics-mailbox-status');
const analyticsMailboxBreakdown = document.querySelector('#analytics-mailbox-breakdown');
const guildNameElements = [...document.querySelectorAll('[data-guild-name]')];
const savedMessagesContainer = document.querySelector('#saved-messages');
const savedMessageCount = document.querySelector('#saved-message-count');
const caseStorageStatus = document.querySelector('#case-storage-status');
const refreshCasesButton = document.querySelector('#refresh-cases');
const caseTotalCount = document.querySelector('#case-total-count');
const caseRecentCount = document.querySelector('#case-recent-count');
const caseRepeatCount = document.querySelector('#case-repeat-count');
const caseCommonAction = document.querySelector('#case-common-action');
const caseSearchInput = document.querySelector('#case-search');
const caseActionFilter = document.querySelector('#case-action-filter');
const caseStatusFilter = document.querySelector('#case-status-filter');
const caseDateFilter = document.querySelector('#case-date-filter');
const caseResultCount = document.querySelector('#case-result-count');
const caseList = document.querySelector('#case-list');
const caseDetailEmpty = document.querySelector('#case-detail-empty');
const caseDetailContent = document.querySelector('#case-detail-content');
const caseDetailPanel = caseDetailContent?.closest('.case-detail-panel');
const caseDetailReference = document.querySelector('#case-detail-reference');
const caseDetailTitle = document.querySelector('#case-detail-title');
const caseDetailStatus = document.querySelector('#case-detail-status');
const caseDetailFields = document.querySelector('#case-detail-fields');
const caseMemberIndicator = document.querySelector('#case-member-indicator');
const caseMemberTimeline = document.querySelector('#case-member-timeline');
const caseReasonForm = document.querySelector('#case-reason-form');
const caseReasonInput = document.querySelector('#case-reason-input');
const saveCaseReasonButton = document.querySelector('#save-case-reason');
const caseRevokeForm = document.querySelector('#case-revoke-form');
const caseRevokeReason = document.querySelector('#case-revoke-reason');
const revokeCaseButton = document.querySelector('#revoke-case');
const voiceRoomStatus = document.querySelector('#voice-room-status');
const voiceRoomStorageStatus = document.querySelector('#voice-room-storage-status');
const refreshVoiceRoomsButton = document.querySelector('#refresh-voice-rooms');
const voiceRoomCount = document.querySelector('#voice-room-count');
const voiceMemberCount = document.querySelector('#voice-member-count');
const voiceRoomSettingsForm = document.querySelector('#voice-room-settings-form');
const voiceRoomEnabledInput = document.querySelector('#voice-room-enabled');
const voiceRoomTriggerIdInput = document.querySelector('#voice-room-trigger-id');
const saveVoiceRoomSettingsButton = document.querySelector('#save-voice-room-settings');
const ticketChannelSettingsForm = document.querySelector('#ticket-channel-settings-form');
const reactionRoleChannelSettingsForm = document.querySelector('#reaction-role-channel-settings-form');
const featureChannelSettingsForms = [
  ticketChannelSettingsForm,
  reactionRoleChannelSettingsForm,
].filter(Boolean);
const voiceRoomListCount = document.querySelector('#voice-room-list-count');
const voiceRoomList = document.querySelector('#voice-room-list');
const tabButtons = [...document.querySelectorAll('.tab-button')];
const tabPanels = [...document.querySelectorAll('.tab-panel')];
const createNavList = document.querySelector('#create-nav-list');
const featureNavList = document.querySelector('#feature-nav-list');
const refreshBotButton = document.querySelector('#refresh-bot');
const botProfileTag = document.querySelector('#bot-profile-tag');
const botProfileName = document.querySelector('#bot-profile-name');
const botProfileId = document.querySelector('#bot-profile-id');
const botAvatarPreview = document.querySelector('#bot-avatar-preview');
const botBannerPreview = document.querySelector('#bot-banner-preview');
const botBannerPlaceholder = document.querySelector('#bot-banner-placeholder');
const botAvatarInput = document.querySelector('#bot-avatar-file');
const botBannerInput = document.querySelector('#bot-banner-file');
const saveBotAvatarButton = document.querySelector('#save-bot-avatar');
const saveBotBannerButton = document.querySelector('#save-bot-banner');
const botBioForm = document.querySelector('#bot-bio-form');
const botBioInput = document.querySelector('#bot-bio');
const botBioCount = document.querySelector('#bot-bio-count');
const saveBotBioButton = document.querySelector('#save-bot-bio');
const botPresenceForm = document.querySelector('#bot-presence-form');
const presenceStatusInput = document.querySelector('#presence-status');
const presenceActivityTypeInput = document.querySelector('#presence-activity-type');
const presenceRotationSecondsInput = document.querySelector('#presence-rotation-seconds');
const presenceUrlField = document.querySelector('#presence-url-field');
const presenceActivityUrlInput = document.querySelector('#presence-activity-url');
const presenceActivityList = document.querySelector('#presence-activity-list');
const addPresenceActivityButton = document.querySelector('#add-presence-activity');
const saveBotPresenceButton = document.querySelector('#save-bot-presence');
const presenceStorageStatus = document.querySelector('#presence-storage-status');
const dashboardConfigForm = document.querySelector('#dashboard-config-form');
const configSectionButtons = [...document.querySelectorAll('[data-config-section]')];
const configSections = [...document.querySelectorAll('[data-config-panel]')];
const configRoleGrid = document.querySelector('#config-role-grid');
const configDiagnosticList = document.querySelector('#config-diagnostic-list');
const configAttentionList = document.querySelector('#config-attention-list');
const configAuditList = document.querySelector('#config-audit-list');
const configAttentionCount = document.querySelector('#config-attention-count');
const configReadinessRing = document.querySelector('#config-readiness-ring');
const configReadinessTitle = document.querySelector('#config-readiness-title');
const configReadinessCopy = document.querySelector('#config-readiness-copy');
const configOauthStatus = document.querySelector('#config-oauth-status');
const configOauthCopy = document.querySelector('#config-oauth-copy');
const configStorageStatus = document.querySelector('#config-storage-status');
const configStorageCopy = document.querySelector('#config-storage-copy');
const configCheckStatus = document.querySelector('#config-check-status');
const configCheckCopy = document.querySelector('#config-check-copy');
const configSaveState = document.querySelector('#config-save-state');
const configSaveTime = document.querySelector('#config-save-time');
const configDirtyDot = document.querySelector('#config-dirty-dot');
const saveDashboardConfigButton = document.querySelector('#save-dashboard-config');
const resetDashboardConfigButton = document.querySelector('#reset-dashboard-config');
const refreshConfigDiagnosticsButton = document.querySelector('#refresh-config-diagnostics');
const featureToggleInputs = [...document.querySelectorAll('[data-feature-toggle]')];
const auditLogSettingsForm = document.querySelector('#audit-log-settings-form');
const auditLogChannelGrid = document.querySelector('#audit-log-channel-grid');
const auditLogSaveStatus = document.querySelector('#audit-log-save-status');
const saveAuditLogSettingsButton = document.querySelector('#save-audit-log-settings');
const composer = document.querySelector('#composer');
const messageNameInput = document.querySelector('#message-name');
const channelInput = document.querySelector('#channel-id');
const imageInput = document.querySelector('#image-file');
const messageColorPicker = document.querySelector('#message-color-picker');
const messageColorInput = document.querySelector('#message-color');
const allowMentionsInput = document.querySelector('#allow-mentions');
const sectionsContainer = document.querySelector('#sections');
const buttonsContainer = document.querySelector('#buttons');
const addSectionButton = document.querySelector('#add-section');
const addDividerButton = document.querySelector('#add-divider');
const addSpacerButton = document.querySelector('#add-spacer');
const addButtonButton = document.querySelector('#add-button');
const newMessageButton = document.querySelector('#new-message');
const refreshMessagesButton = document.querySelector('#refresh-messages');
const importMessageButton = document.querySelector('#import-message');
const deleteMessageButton = document.querySelector('#delete-message');
const saveMessageButton = document.querySelector('#save-message');
const sendButton = document.querySelector('#send');
const toastRegion = document.querySelector('#toast-region');
const discordPreview = document.querySelector('#discord-preview');
const previewImage = document.querySelector('#preview-image');
const previewSections = document.querySelector('#preview-sections');
const previewButtons = document.querySelector('#preview-buttons');
const sectionCount = document.querySelector('#section-count');
const mailboxForm = document.querySelector('#mailbox-form');
const mailboxChannelInput = document.querySelector('#mailbox-channel-id');
const mailboxDestination = document.querySelector('#mailbox-destination');
const mailboxTypeInput = document.querySelector('#mailbox-type');
const mailboxTitleInput = document.querySelector('#mailbox-title');
const mailboxBodyInput = document.querySelector('#mailbox-body');
const mailboxNoteInput = document.querySelector('#mailbox-note');
const mailboxColorPicker = document.querySelector('#mailbox-color-picker');
const mailboxColorInput = document.querySelector('#mailbox-color');
const mailboxImageInput = document.querySelector('#mailbox-image-file');
const mailboxAllowMentionsInput = document.querySelector('#mailbox-allow-mentions');
const mailboxButtonsContainer = document.querySelector('#mailbox-buttons');
const addMailboxButton = document.querySelector('#add-mailbox-button');
const resetMailboxButton = document.querySelector('#reset-mailbox');
const sendMailboxButton = document.querySelector('#send-mailbox');
const mailboxScheduleAtInput = document.querySelector('#mailbox-schedule-at');
const scheduleMailboxButton = document.querySelector('#schedule-mailbox');
const mailboxScheduleStorage = document.querySelector('#mailbox-schedule-storage');
const refreshMailboxScheduleButton = document.querySelector('#refresh-mailbox-schedule');
const scheduledMailboxList = document.querySelector('#scheduled-mailbox-list');
const selectAllMailboxPosts = document.querySelector('#select-all-mailbox-posts');
const mailboxSelectionCount = document.querySelector('#mailbox-selection-count');
const removeSelectedMailboxPosts = document.querySelector('#remove-selected-mailbox-posts');
const mailboxDiscordPreview = document.querySelector('#mailbox-discord-preview');
const mailboxPreviewImage = document.querySelector('#mailbox-preview-image');
const mailboxPreviewSections = document.querySelector('#mailbox-preview-sections');
const mailboxPreviewButtons = document.querySelector('#mailbox-preview-buttons');
const mailboxPreviewType = document.querySelector('#mailbox-preview-type');
const welcomeMessageForm = document.querySelector('#welcome-message-form');
const welcomeMessageStorageStatus = document.querySelector('#welcome-message-storage-status');
const refreshWelcomeMessageButton = document.querySelector('#refresh-welcome-message');
const saveWelcomeMessageButton = document.querySelector('#save-welcome-message');
const welcomeChannelIdInput = document.querySelector('#welcome-channel-id');
const welcomeImageInput = document.querySelector('#welcome-image-file');
const welcomeColorPicker = document.querySelector('#welcome-color-picker');
const welcomeColorInput = document.querySelector('#welcome-color');
const welcomeAllowMentionsInput = document.querySelector('#welcome-allow-mentions');
const welcomeSectionsContainer = document.querySelector('#welcome-sections');
const welcomeButtonsContainer = document.querySelector('#welcome-buttons');
const addWelcomeSectionButton = document.querySelector('#add-welcome-section');
const addWelcomeDividerButton = document.querySelector('#add-welcome-divider');
const addWelcomeSpacerButton = document.querySelector('#add-welcome-spacer');
const addWelcomeButtonButton = document.querySelector('#add-welcome-button');
const welcomeDiscordPreview = document.querySelector('#welcome-discord-preview');
const welcomePreviewImage = document.querySelector('#welcome-preview-image');
const welcomePreviewSections = document.querySelector('#welcome-preview-sections');
const welcomePreviewButtons = document.querySelector('#welcome-preview-buttons');
const welcomeSectionCount = document.querySelector('#welcome-section-count');
const liveEmbedForm = document.querySelector('#live-embed-form');
const refreshLiveEmbedButton = document.querySelector('#refresh-live-embed');
const saveLiveEmbedButton = document.querySelector('#save-live-embed');
const liveEmbedStorageStatus = document.querySelector('#live-embed-storage-status');
const liveChannelIdInput = document.querySelector('#live-channel-id');
const liveContentInput = document.querySelector('#live-content');
const liveTitleInput = document.querySelector('#live-title');
const liveTitleUrlInput = document.querySelector('#live-title-url');
const liveDescriptionInput = document.querySelector('#live-description');
const liveColorPicker = document.querySelector('#live-color-picker');
const liveColorInput = document.querySelector('#live-color');
const liveAuthorNameInput = document.querySelector('#live-author-name');
const liveAuthorUrlInput = document.querySelector('#live-author-url');
const liveAuthorIconUrlInput = document.querySelector('#live-author-icon-url');
const liveThumbnailUrlInput = document.querySelector('#live-thumbnail-url');
const liveImageUrlInput = document.querySelector('#live-image-url');
const liveFooterTextInput = document.querySelector('#live-footer-text');
const liveFooterIconUrlInput = document.querySelector('#live-footer-icon-url');
const liveTimestampInput = document.querySelector('#live-timestamp');
const liveFieldsContainer = document.querySelector('#live-fields');
const liveFieldCount = document.querySelector('#live-field-count');
const addLiveFieldButton = document.querySelector('#add-live-field');
const addLiveDividerButton = document.querySelector('#add-live-divider');
const addLiveSpacerButton = document.querySelector('#add-live-spacer');
const liveButtonsContainer = document.querySelector('#live-buttons');
const liveButtonCount = document.querySelector('#live-button-count');
const addLiveButton = document.querySelector('#add-live-button');
const livePreviewContent = document.querySelector('#live-preview-content');
const livePreviewCard = document.querySelector('#live-preview-card');
const livePreviewAuthor = document.querySelector('#live-preview-author');
const livePreviewAuthorIcon = document.querySelector('#live-preview-author-icon');
const livePreviewAuthorName = document.querySelector('#live-preview-author-name');
const livePreviewTitle = document.querySelector('#live-preview-title');
const livePreviewDescription = document.querySelector('#live-preview-description');
const livePreviewFields = document.querySelector('#live-preview-fields');
const livePreviewThumbnail = document.querySelector('#live-preview-thumbnail');
const livePreviewImage = document.querySelector('#live-preview-image');
const livePreviewFooter = document.querySelector('#live-preview-footer');
const livePreviewFooterIcon = document.querySelector('#live-preview-footer-icon');
const livePreviewFooterText = document.querySelector('#live-preview-footer-text');
const livePreviewTimestamp = document.querySelector('#live-preview-timestamp');
const livePreviewButtons = document.querySelector('#live-preview-buttons');
const discordChannelSelects = [...document.querySelectorAll('.discord-channel-select')];
const embedBuilderTitle = document.querySelector('#embed-builder-title');
const embedBuilderSubtitle = document.querySelector('#embed-builder-subtitle');
const embedPlaceholderList = document.querySelector('#embed-placeholder-list');
const embedTimestampLabel = document.querySelector('#embed-timestamp-label');
const embedSaveHint = document.querySelector('#embed-save-hint');
const embedPreviewSubtitle = document.querySelector('#embed-preview-subtitle');
const embedBuilderButtons = [...document.querySelectorAll('[data-embed-builder]')];
const sessionStorageKey = 'bean_dashboard_session';
const savedMessagesStorageKey = 'bean_dashboard_saved_messages';
const presenceStorageKey = 'bean_dashboard_presence';
const liveEmbedStorageKey = 'bean_dashboard_live_embed';
const youtubeEmbedStorageKey = 'bean_dashboard_youtube_embed';
const welcomeEmbedStorageKey = 'bean_dashboard_welcome_embed';
const notificationStorageKey = 'bean_dashboard_notification_center';
const notificationReadStorageKey = 'bean_dashboard_notification_read';
const interfacePreferenceStorageKey = 'bean_dashboard_interface_preferences';
const welcomeMessageId = 'welcome-message';
const workspaceMeta = {
  overview: { title: 'Room overview', hint: 'The full community signal', key: '01' },
  community: { title: 'Community room', hint: 'People and community signals', key: '02' },
  members: { title: 'Member directory', hint: 'Find people and context', key: '02A' },
  analytics: { title: 'Community signals', hint: 'Patterns, momentum, rhythm', key: '02B' },
  cases: { title: 'Moderation desk', hint: 'History, context, and actions', key: '03' },
  messages: { title: 'Message builder', hint: 'Compose reusable Discord posts', key: '04A' },
  mailbox: { title: 'Mailbox builder', hint: 'Publish updates and notices', key: '04B' },
  'live-embed': { title: 'Creator notifications', hint: 'Shape Twitch and YouTube alerts', key: '04C' },
  'welcome-embed': { title: 'Welcome builder', hint: 'Design the first hello', key: '04D' },
  'invite-moderation': { title: 'Invite moderation', hint: 'Filter unauthorized Discord invites', key: '05A' },
  tickets: { title: 'Ticket system', hint: 'Private member support threads', key: '05B' },
  'reaction-roles': { title: 'Reaction roles', hint: 'Verification and member access', key: '05C' },
  'voice-rooms': { title: 'Voice spaces', hint: 'Manage temporary rooms', key: '05' },
  'audit-logging': { title: 'Detailed audit logs', hint: 'Message, member, voice, and server records', key: '05D' },
  config: { title: 'Server configuration', hint: 'Channels, roles, features, and access', key: '06' },
  bot: { title: 'Bean profile', hint: 'Profile, identity, and presence', key: '06A' },
};
const workspaceGroupByTab = {
  members: 'community',
  analytics: 'community',
  bot: 'config',
};
const contextWorkspaceDefinitions = {
  community: {
    label: 'Community',
    panels: ['members', 'analytics'],
    items: [
      { tab: 'members', label: 'Members', icon: 'fa-solid fa-address-card' },
      { tab: 'analytics', label: 'Signals', icon: 'fa-solid fa-chart-line' },
    ],
  },
  config: {
    label: 'Settings',
    panels: ['config', 'bot'],
    items: [
      { tab: 'config', label: 'Configuration', icon: 'fa-solid fa-sliders' },
      { tab: 'bot', label: 'Bean profile', icon: 'fa-solid fa-robot' },
    ],
  },
};
let commandMatches = [];
let commandSelectionIndex = 0;

const embedBuilderDefinitions = {
  live: {
    endpoint: '/api/stream-embed',
    storageKey: liveEmbedStorageKey,
    label: 'Live embed',
    title: 'Live Announcement Builder',
    subtitle: 'Used when the featured Twitch account goes live.',
    timestampLabel: 'Show the time the stream was detected',
    saveHint: 'Changes apply to the next featured stream announcement.',
    previewSubtitle: 'Sample stream data',
    placeholders: [
      'member',
      'displayName',
      'streamTitle',
      'streamUrl',
      'gameName',
      'twitchUsername',
      'previewUrl',
      'avatarUrl',
    ],
  },
  youtube: {
    endpoint: '/api/youtube-embed',
    storageKey: youtubeEmbedStorageKey,
    label: 'YouTube upload embed',
    title: 'YouTube Upload Notification Builder',
    subtitle: 'Used when a new video is uploaded to @5nooof.',
    timestampLabel: 'Show the time the video was published',
    saveHint: 'Changes apply to the next YouTube upload announcement.',
    previewSubtitle: 'Latest @5nooof video data',
    placeholders: [
      'member',
      'displayName',
      'videoTitle',
      'videoUrl',
      'videoId',
      'thumbnailUrl',
      'channelHandle',
      'channelUrl',
      'publishedAt',
      'avatarUrl',
    ],
  },
};

const state = {
  guildName: 'UNDR CTRL',
  currentMessageId: null,
  image: null,
  mailboxImage: null,
  scheduledMailboxPosts: [],
  mailboxScheduleStorage: null,
  selectedMailboxPosts: new Set(),
  mailboxScheduleRefreshTimer: null,
  discordChannels: [],
  discordChannelDefaults: {},
  discordChannelsLoaded: false,
  discordChannelsLoading: false,
  discordChannelsError: '',
  health: null,
  activityItems: [],
  activityStorage: null,
  activityType: '',
  overviewRefreshTimer: null,
  memberSearchResults: [],
  selectedMemberId: null,
  memberProfile: null,
  analytics: null,
  notificationTimer: null,
  notificationCursor: null,
  seenNotifications: new Set(),
  notifications: [],
  readNotifications: new Set(),
  notificationInitialLoad: true,
  session: null,
  configuration: null,
  savedConfiguration: null,
  configurationDiagnostics: null,
  configurationStorage: null,
  configurationOauth: null,
  discordRoles: [],
  configurationChannels: [],
  configurationDirty: false,
  builderManagers: new Map(),
  botAvatarImage: null,
  botBannerImage: null,
  savedMessages: [],
  moderationCases: [],
  moderationCaseStorage: null,
  selectedCaseNumber: null,
  voiceRooms: {
    settings: null,
    channels: [],
    totals: null,
    storage: null,
  },
  composerInitialized: false,
  welcomeImage: null,
  welcomeSettings: null,
  welcomeStorage: null,
  welcomeRestoreAttempted: false,
  activeEmbedBuilder: 'live',
  embedBuilderSettings: { live: null, youtube: null },
  embedBuilderStorage: { live: null, youtube: null },
  embedBuilderRestoreAttempted: { live: false, youtube: false },
  presenceRestoreAttempted: false,
  savedMessagesRefreshTimer: null,
  savedMessagesRequest: null,
  voiceRoomsRefreshTimer: null,
  interfaceClockTimer: null,
};

const welcomeStarter = `# WELCOME TO UNDR CTRL
> A community for UNDR CTRL members to connect, create, and build together.
> Get involved, meet the community, and help shape what comes next.`;

const seededWelcomeMessage = {
  id: welcomeMessageId,
  name: 'Welcome Message',
  channelId: '',
  color: null,
  image: null,
  blocks: [{ type: 'text', content: welcomeStarter, accessory: null }],
  buttons: [],
  allowMentions: false,
  updatedAt: '2026-06-05T00:00:00.000Z',
};

init();

async function init() {
  initializeJournal();
  initializeWorkspaceNavigation();
  initializeInterfacePreferences();
  bindEvents();
  resetMailboxBuilder();
  renderSavedMessages();
  initializeBuilderWorkflows();

  checkApiStatus();

  const session = await api('/api/session').catch(() => null);

  if (session?.ok) {
    showDashboard(session);
  } else {
    clearSessionToken();
    showLogin();
  }
}

function bindEvents() {
  logoutButton.addEventListener('click', handleLogout);
  tabButtons.forEach((button) => button.addEventListener('click', () => handlePrimaryTabClick(button)));
  dashboardView.addEventListener('click', handleDashboardNavigationClick);
  commandTrigger.addEventListener('click', openCommandPalette);
  commandCloseButtons.forEach((button) => button.addEventListener('click', closeCommandPalette));
  commandSearch.addEventListener('input', renderCommandResults);
  commandResults.addEventListener('click', handleCommandResultClick);
  notificationTrigger?.addEventListener('click', openNotificationCenter);
  densityToggle?.addEventListener('click', toggleInterfaceDensity);
  notificationCloseButtons.forEach((button) => button.addEventListener('click', closeNotificationCenter));
  markNotificationsReadButton?.addEventListener('click', markAllNotificationsRead);
  notificationCenterList?.addEventListener('click', handleNotificationCenterClick);
  document.addEventListener('keydown', handleCommandKeydown);
  dashboardView.addEventListener('pointermove', updateDashboardGlow);
  refreshHealthButton.addEventListener('click', () => {
    loadDashboardHealth(true).catch((error) => setSendStatus(error.message, 'error'));
  });
  refreshActivityButton.addEventListener('click', () => {
    loadActivityFeed(true).catch((error) => setSendStatus(error.message, 'error'));
  });
  activityFilterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.activityType = button.dataset.activityType;
      writeInterfacePreferences({ activityType: state.activityType });
      activityFilterButtons.forEach((item) => item.classList.toggle('active', item === button));
      loadActivityFeed(false).catch((error) => setSendStatus(error.message, 'error'));
    });
  });
  memberSearchForm.addEventListener('submit', handleMemberSearch);
  memberSearchResults.addEventListener('click', handleMemberResultClick);
  analyticsRangeInput.addEventListener('change', () => {
    writeInterfacePreferences({ analyticsRange: analyticsRangeInput.value });
    loadDashboardAnalytics(false).catch((error) => setSendStatus(error.message, 'error'));
  });
  refreshAnalyticsButton.addEventListener('click', () => {
    loadDashboardAnalytics(true).catch((error) => setSendStatus(error.message, 'error'));
  });
  refreshBotButton.addEventListener('click', () => {
    refreshBotSettings(true).catch((error) => setSendStatus(error.message, 'error'));
  });
  botAvatarInput.addEventListener('change', () => handleBotImageChange('avatar'));
  botBannerInput.addEventListener('change', () => handleBotImageChange('banner'));
  saveBotAvatarButton.addEventListener('click', () => handleUpdateBotImage('avatar'));
  saveBotBannerButton.addEventListener('click', () => handleUpdateBotImage('banner'));
  botBioForm.addEventListener('submit', handleUpdateBotBio);
  botBioInput.addEventListener('input', updateBotBioCount);
  botPresenceForm.addEventListener('submit', handleUpdateBotPresence);
  presenceActivityTypeInput.addEventListener('change', updatePresenceUrlVisibility);
  addPresenceActivityButton.addEventListener('click', () => addPresenceActivity(''));
  presenceActivityList.addEventListener('click', handlePresenceActivityListClick);
  dashboardConfigForm?.addEventListener('submit', handleDashboardConfigSave);
  dashboardConfigForm?.addEventListener('input', markDashboardConfigDirty);
  dashboardConfigForm?.addEventListener('change', markDashboardConfigDirty);
  configSectionButtons.forEach((button) => {
    button.addEventListener('click', () => setConfigSection(button.dataset.configSection));
  });
  resetDashboardConfigButton?.addEventListener('click', resetDashboardConfiguration);
  refreshConfigDiagnosticsButton?.addEventListener('click', () => {
    loadDashboardConfiguration(true).catch((error) => setSendStatus(error.message, 'error'));
  });
  featureToggleInputs.forEach((input) => {
    input.addEventListener('change', () => {
      handleFeatureToggleChange(input).catch((error) => setSendStatus(error.message, 'error'));
    });
  });
  auditLogSettingsForm?.addEventListener('submit', handleAuditLogSettingsSave);
  featureChannelSettingsForms.forEach((form) => {
    form.addEventListener('submit', handleFeatureChannelSettingsSave);
  });
  composer.addEventListener('submit', handleSend);
  messageColorPicker.addEventListener('input', handleMessageColorPickerInput);
  messageColorInput.addEventListener('input', handleMessageColorInput);
  savedMessagesContainer.addEventListener('click', handleSavedMessageClick);
  refreshCasesButton.addEventListener('click', () => {
    loadModerationCases(true).catch((error) => setSendStatus(error.message, 'error'));
  });
  caseSearchInput.addEventListener('input', handleRememberedCaseFilters);
  caseActionFilter.addEventListener('change', handleRememberedCaseFilters);
  caseStatusFilter.addEventListener('change', handleRememberedCaseFilters);
  caseDateFilter.addEventListener('change', handleRememberedCaseFilters);
  caseList.addEventListener('click', handleCaseListClick);
  caseReasonForm.addEventListener('submit', handleCaseReasonSave);
  caseRevokeForm.addEventListener('submit', handleCaseRevocation);
  refreshVoiceRoomsButton.addEventListener('click', () => {
    loadVoiceRooms(true).catch((error) => setSendStatus(error.message, 'error'));
  });
  voiceRoomSettingsForm.addEventListener('submit', handleVoiceRoomSettingsSave);
  voiceRoomList.addEventListener('click', handleVoiceRoomListClick);
  imageInput.addEventListener('change', handleImageChange);
  addSectionButton.addEventListener('click', () => addSection(''));
  addDividerButton.addEventListener('click', () => addDivider('small'));
  addSpacerButton.addEventListener('click', () => addSpacerBlock('small'));
  addButtonButton.addEventListener('click', () => addButton('', ''));
  newMessageButton.addEventListener('click', () => {
    resetComposer();
    setActiveTab('messages');
  });
  refreshMessagesButton.addEventListener('click', () => {
    loadSavedMessages({ showNotification: true }).catch((error) => setSendStatus(error.message, 'error'));
  });
  importMessageButton.addEventListener('click', handleImportMessage);
  deleteMessageButton.addEventListener('click', handleDeleteMessage);
  saveMessageButton.addEventListener('click', handleSaveMessage);
  sectionsContainer.addEventListener('input', updatePreview);
  sectionsContainer.addEventListener('change', updatePreview);
  buttonsContainer.addEventListener('input', updatePreview);
  mailboxForm.addEventListener('submit', handleMailboxSend);
  mailboxForm.addEventListener('input', updateMailboxPreview);
  mailboxForm.addEventListener('change', updateMailboxPreview);
  mailboxImageInput.addEventListener('change', handleMailboxImageChange);
  mailboxColorPicker.addEventListener('input', handleMailboxColorPickerInput);
  mailboxColorInput.addEventListener('input', handleMailboxColorInput);
  addMailboxButton.addEventListener('click', () => addMailboxLinkButton({}, true));
  resetMailboxButton.addEventListener('click', resetMailboxBuilder);
  scheduleMailboxButton.addEventListener('click', handleMailboxSchedule);
  refreshMailboxScheduleButton.addEventListener('click', () => {
    loadScheduledMailboxPosts(true).catch((error) => setSendStatus(error.message, 'error'));
  });
  scheduledMailboxList.addEventListener('click', handleScheduledMailboxClick);
  scheduledMailboxList.addEventListener('change', handleScheduledMailboxSelection);
  selectAllMailboxPosts?.addEventListener('change', handleSelectAllMailboxPosts);
  removeSelectedMailboxPosts?.addEventListener('click', handleRemoveSelectedMailboxPosts);
  mailboxButtonsContainer.addEventListener('input', updateMailboxPreview);
  discordChannelSelects.forEach((select) => {
    select.addEventListener('change', () => updateChannelSelectAppearance(select));
  });
  welcomeMessageForm.addEventListener('submit', handleSaveWelcomeMessage);
  welcomeMessageForm.addEventListener('input', updateWelcomePreview);
  welcomeMessageForm.addEventListener('change', updateWelcomePreview);
  refreshWelcomeMessageButton.addEventListener('click', () => {
    loadWelcomeMessageSettings(true).catch((error) => setSendStatus(error.message, 'error'));
  });
  welcomeImageInput.addEventListener('change', handleWelcomeImageChange);
  welcomeColorPicker.addEventListener('input', handleWelcomeColorPickerInput);
  welcomeColorInput.addEventListener('input', handleWelcomeColorInput);
  addWelcomeSectionButton.addEventListener('click', () => addWelcomeSection('', null, true));
  addWelcomeDividerButton.addEventListener('click', () => addWelcomeLayoutBlock('divider', 'small'));
  addWelcomeSpacerButton.addEventListener('click', () => addWelcomeLayoutBlock('spacer', 'small'));
  addWelcomeButtonButton.addEventListener('click', () => addWelcomeMessageButton({}, true));
  welcomeSectionsContainer.addEventListener('click', handleWelcomeSectionsClick);
  welcomeButtonsContainer.addEventListener('click', handleWelcomeButtonsClick);
  liveEmbedForm.addEventListener('submit', handleSaveLiveEmbed);
  liveEmbedForm.addEventListener('input', updateLiveEmbedPreview);
  liveEmbedForm.addEventListener('change', updateLiveEmbedPreview);
  refreshLiveEmbedButton.addEventListener('click', () => {
    loadLiveEmbedSettings(true).catch((error) => setSendStatus(error.message, 'error'));
  });
  liveColorPicker.addEventListener('input', handleLiveColorPickerInput);
  liveColorInput.addEventListener('input', handleLiveColorInput);
  addLiveFieldButton.addEventListener('click', () => addLiveEmbedField({}, true));
  addLiveDividerButton.addEventListener('click', () => addLiveEmbedLayoutBlock('divider'));
  addLiveSpacerButton.addEventListener('click', () => addLiveEmbedLayoutBlock('spacer'));
  liveFieldsContainer.addEventListener('click', handleLiveFieldsClick);
  addLiveButton.addEventListener('click', () => addLiveEmbedButton({}, true));
  liveButtonsContainer.addEventListener('click', handleLiveButtonsClick);
  embedBuilderButtons.forEach((button) => {
    button.addEventListener('click', () => activateEmbedBuilder(button.dataset.embedBuilder));
  });
  window.addEventListener('beforeunload', (event) => {
    const hasUnsavedChanges = state.configurationDirty
      || [...state.builderManagers.values()].some((manager) => manager.bar?.classList.contains('is-dirty'));

    if (hasUnsavedChanges) {
      event.preventDefault();
      event.returnValue = '';
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && getActiveTab() === 'messages' && !dashboardView.hidden) {
      loadSavedMessages({ silent: true }).catch(() => null);
    }
  });
}

async function checkApiStatus() {
  setApiStatus(`Checking API on ${window.location.origin}...`, '');

  try {
    const health = await api('/health');
    const ping = await api('/api/ping');
    const botText = ping.botReady || health.botReady ? `Bot online${ping.tag ? `: ${ping.tag}` : ''}` : 'Bot not ready';

    setGuildName(ping.guildName);
    renderDiscordLoginAvailability(ping);
    setApiStatus(`API connected. ${botText}.`, 'success');
  } catch (error) {
    setApiStatus(`API check failed on ${window.location.origin}: ${error.message}`, 'error');
  }
}

function renderDiscordLoginAvailability(ping) {
  const enabled = Boolean(ping.discordOauthEnabled);
  const missing = Array.isArray(ping.discordOauthStatus?.missing)
    ? ping.discordOauthStatus.missing
    : [];

  discordLoginWrap.hidden = false;
  discordLoginWrap.classList.toggle('is-unavailable', !enabled);
  discordLoginButton.hidden = !enabled;
  discordLoginStatus.textContent = enabled
    ? 'Your server role decides what you can view and change.'
    : missing.length
      ? `Discord sign-in is not active in this deployment. Missing: ${missing.join(', ')}.`
      : 'Discord sign-in is not active in this deployment. Restart Bean after checking its OAuth variables.';
}

async function handleLogout() {
  await api('/api/logout', { method: 'POST', body: {} }).catch(() => null);
  clearSessionToken();
  stopSavedMessagesSync();
  stopVoiceRoomSync();
  stopOverviewSync();
  stopMailboxScheduleSync();
  stopDashboardNotifications();
  showLogin();
}

async function handleSend(event) {
  event.preventDefault();
  setSendStatus('', '');
  sendButton.disabled = true;

  try {
    const payload = collectPayload();
    const result = await api('/api/send-message', {
      method: 'POST',
      body: payload,
    });

    const link = result.url ? ` Message: ${result.url}` : '';
    markBuilderSaved('message', 'Published to Discord');
    setSendStatus(`Sent to ${payload.channelId}.${link}`, 'success');
  } catch (error) {
    setSendStatus(error.message, 'error');
  } finally {
    sendButton.disabled = false;
  }
}

async function handleMailboxSend(event) {
  event.preventDefault();
  const payload = collectMailboxPayload();

  if (!validateMailboxPost()) {
    return;
  }

  sendMailboxButton.disabled = true;

  try {
    const result = await api('/api/mailbox/send', {
      method: 'POST',
      body: payload,
    });
    const link = result.url ? ` Message: ${result.url}` : '';

    markBuilderSaved('mailbox', 'Published to Discord');
    setSendStatus(`Sent to ${getDiscordChannelLabel(result.channelId)}.${link}`, 'success');
  } catch (error) {
    setSendStatus(error.message, 'error');
  } finally {
    sendMailboxButton.disabled = false;
  }
}

async function handleMailboxSchedule() {
  if (!validateMailboxPost()) {
    return;
  }

  if (!mailboxScheduleAtInput.value) {
    setSendStatus('Choose when Bean should publish this Mailbox post.', 'error');
    mailboxScheduleAtInput.focus();
    return;
  }

  const scheduledAt = new Date(mailboxScheduleAtInput.value);

  if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() < Date.now() + 5000) {
    setSendStatus('Choose a publish time at least five seconds from now.', 'error');
    mailboxScheduleAtInput.focus();
    return;
  }

  scheduleMailboxButton.disabled = true;

  try {
    const result = await api('/api/mailbox/scheduled', {
      method: 'POST',
      body: {
        title: mailboxTitleInput.value.trim(),
        scheduledAt: scheduledAt.toISOString(),
        channelId: mailboxChannelInput.value,
        payload: collectMailboxPayload(),
      },
    });

    await loadScheduledMailboxPosts(false);
    markBuilderSaved('mailbox', 'Scheduled with Bean');
    setSendStatus(
      `Scheduled "${result.job.title}" for ${formatDashboardCaseDateTime(result.job.scheduledAt)}.`,
      'success',
    );
  } catch (error) {
    setSendStatus(error.message, 'error');
  } finally {
    scheduleMailboxButton.disabled = false;
  }
}

function validateMailboxPost() {
  if (!mailboxChannelInput.value) {
    setSendStatus('Choose a destination channel before publishing.', 'error');
    mailboxChannelInput.focus();
    return false;
  }

  if (!mailboxTitleInput.value.trim()) {
    setSendStatus('Add a mailbox headline before publishing.', 'error');
    mailboxTitleInput.focus();
    return false;
  }

  if (!mailboxBodyInput.value.trim()) {
    setSendStatus('Add a mailbox message before publishing.', 'error');
    mailboxBodyInput.focus();
    return false;
  }

  return true;
}

function resetMailboxBuilder() {
  mailboxForm.reset();
  setChannelSelectValue(mailboxChannelInput, state.discordChannelDefaults.mailbox || '');
  mailboxTypeInput.value = 'Update';
  mailboxColorPicker.value = '#8FA1BE';
  mailboxColorInput.value = '#8FA1BE';
  mailboxImageInput.value = '';
  mailboxButtonsContainer.replaceChildren();
  state.mailboxImage = null;
  setDefaultMailboxScheduleTime();
  updateMailboxButtonLimit();
  updateMailboxPreview();
}

function setDefaultMailboxScheduleTime() {
  const minimum = new Date(Date.now() + 10000);
  const suggested = new Date(Date.now() + 60 * 60 * 1000);

  mailboxScheduleAtInput.min = toLocalDateTimeValue(minimum);
  mailboxScheduleAtInput.value = toLocalDateTimeValue(suggested);
}

function toLocalDateTimeValue(date) {
  const localTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localTime.toISOString().slice(0, 16);
}

async function loadScheduledMailboxPosts(showNotification = false) {
  const result = await api('/api/mailbox/scheduled');

  state.scheduledMailboxPosts = Array.isArray(result.jobs) ? result.jobs : [];
  state.mailboxScheduleStorage = result.storage || null;
  renderScheduledMailboxPosts();

  if (showNotification) {
    setSendStatus('Scheduled Mailbox queue refreshed.', 'success');
  }
}

function renderScheduledMailboxPosts() {
  const jobs = state.scheduledMailboxPosts;
  const storage = state.mailboxScheduleStorage;
  const visibleIds = new Set(jobs.map((job) => job.id));

  state.selectedMailboxPosts = new Set(
    [...state.selectedMailboxPosts].filter((id) => visibleIds.has(id)),
  );

  mailboxScheduleStorage.classList.remove('ready', 'offline');
  mailboxScheduleStorage.textContent = storage?.persistent ? 'Queue saved persistently' : 'Queue storage is temporary';
  mailboxScheduleStorage.classList.add(storage?.persistent ? 'ready' : 'offline');
  scheduledMailboxList.replaceChildren();

  if (jobs.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'schedule-empty';
    empty.innerHTML = '<i class="fa-regular fa-calendar-check" aria-hidden="true"></i><span>No scheduled posts yet.</span>';
    scheduledMailboxList.append(empty);
    renderMailboxBulkActions();
    return;
  }

  for (const job of jobs) {
    const item = document.createElement('article');
    const selection = document.createElement('label');
    const checkbox = document.createElement('input');
    const icon = document.createElement('span');
    const copy = document.createElement('div');
    const heading = document.createElement('div');
    const title = document.createElement('strong');
    const badge = document.createElement('span');
    const meta = document.createElement('p');
    const actions = document.createElement('div');
    const remove = document.createElement('button');

    item.className = 'scheduled-mailbox-item';
    selection.className = 'scheduled-mailbox-select';
    selection.setAttribute('aria-label', `Select ${job.title}`);
    checkbox.type = 'checkbox';
    checkbox.dataset.selectMailboxPost = job.id;
    checkbox.checked = state.selectedMailboxPosts.has(job.id);
    selection.append(checkbox);
    icon.className = 'scheduled-mailbox-icon';
    icon.innerHTML = `<i class="fa-solid ${getScheduleIcon(job.status)}" aria-hidden="true"></i>`;
    copy.className = 'scheduled-mailbox-copy';
    heading.className = 'scheduled-mailbox-heading';
    title.textContent = job.title;
    badge.className = `schedule-status ${job.status}`;
    badge.textContent = capitalizeDashboardText(job.status);
    meta.textContent = getScheduledMailboxMeta(job);
    actions.className = 'scheduled-mailbox-actions';
    remove.type = 'button';
    remove.className = job.status === 'scheduled' || job.status === 'failed' ? 'danger' : 'secondary';
    remove.dataset.scheduledMailboxId = job.id;
    remove.dataset.scheduledMailboxTitle = job.title;
    remove.disabled = job.status === 'publishing';
    remove.textContent = job.status === 'scheduled' ? 'Cancel' : 'Remove';

    if (job.url) {
      const open = document.createElement('a');
      open.className = 'button-link secondary';
      open.href = job.url;
      open.target = '_blank';
      open.rel = 'noopener noreferrer';
      open.textContent = 'Open';
      actions.append(open);
    }

    actions.append(remove);
    heading.append(title, badge);
    copy.append(heading, meta);

    if (job.lastError) {
      const error = document.createElement('p');
      error.textContent = job.lastError;
      error.title = job.lastError;
      copy.append(error);
    }

    item.append(selection, icon, copy, actions);
    scheduledMailboxList.append(item);
  }

  renderMailboxBulkActions();
}

function getScheduleIcon(status) {
  return {
    scheduled: 'fa-clock',
    publishing: 'fa-paper-plane',
    sent: 'fa-circle-check',
    failed: 'fa-triangle-exclamation',
  }[status] || 'fa-envelope';
}

function getScheduledMailboxMeta(job) {
  const destination = job.channelId ? ` · ${getDiscordChannelLabel(job.channelId)}` : '';

  if (job.status === 'sent') {
    return `Published ${formatDashboardCaseDateTime(job.sentAt || job.updatedAt)}${destination}`;
  }

  if (job.status === 'failed') {
    const retry = job.nextAttemptAt
      ? ` · retrying ${formatDashboardCaseDateTime(job.nextAttemptAt)}`
      : ' · retry limit reached';
    return `Publish failed (${job.attempts}/3)${retry}${destination}`;
  }

  if (job.status === 'publishing') {
    return `Bean is publishing this post now${destination}.`;
  }

  return `Publishes ${formatDashboardCaseDateTime(job.scheduledAt)}${destination}`;
}

async function handleScheduledMailboxClick(event) {
  const button = event.target.closest('[data-scheduled-mailbox-id]');

  if (!button) {
    return;
  }

  const title = button.dataset.scheduledMailboxTitle || 'this post';

  if (!window.confirm(`Remove "${title}" from the Mailbox queue?`)) {
    return;
  }

  button.disabled = true;

  try {
    await api(`/api/mailbox/scheduled/${encodeURIComponent(button.dataset.scheduledMailboxId)}`, {
      method: 'DELETE',
    });
    await loadScheduledMailboxPosts(false);
    setSendStatus(`Removed "${title}" from the Mailbox queue.`, 'success');
  } catch (error) {
    button.disabled = false;
    setSendStatus(error.message, 'error');
  }
}

function handleScheduledMailboxSelection(event) {
  const checkbox = event.target.closest('[data-select-mailbox-post]');

  if (!checkbox) {
    return;
  }

  if (checkbox.checked) {
    state.selectedMailboxPosts.add(checkbox.dataset.selectMailboxPost);
  } else {
    state.selectedMailboxPosts.delete(checkbox.dataset.selectMailboxPost);
  }

  renderMailboxBulkActions();
}

function handleSelectAllMailboxPosts() {
  if (selectAllMailboxPosts.checked) {
    state.scheduledMailboxPosts.forEach((job) => state.selectedMailboxPosts.add(job.id));
  } else {
    state.selectedMailboxPosts.clear();
  }

  scheduledMailboxList.querySelectorAll('[data-select-mailbox-post]').forEach((checkbox) => {
    checkbox.checked = state.selectedMailboxPosts.has(checkbox.dataset.selectMailboxPost);
  });
  renderMailboxBulkActions();
}

async function handleRemoveSelectedMailboxPosts() {
  const selected = [...state.selectedMailboxPosts];

  if (selected.length === 0 || !window.confirm(`Remove ${selected.length} selected post${selected.length === 1 ? '' : 's'} from the Mailbox queue?`)) {
    return;
  }

  removeSelectedMailboxPosts.disabled = true;
  removeSelectedMailboxPosts.textContent = 'Removing…';
  const results = await Promise.allSettled(
    selected.map((id) => api(`/api/mailbox/scheduled/${encodeURIComponent(id)}`, { method: 'DELETE' })),
  );
  const removed = results.filter((result) => result.status === 'fulfilled').length;

  state.selectedMailboxPosts.clear();
  await loadScheduledMailboxPosts(false);
  removeSelectedMailboxPosts.textContent = 'Remove selected';
  setSendStatus(
    removed === selected.length
      ? `Removed ${removed} scheduled post${removed === 1 ? '' : 's'}.`
      : `Removed ${removed} of ${selected.length} selected posts.`,
    removed === selected.length ? 'success' : 'error',
  );
}

function renderMailboxBulkActions() {
  const selected = state.selectedMailboxPosts.size;
  const total = state.scheduledMailboxPosts.length;

  mailboxSelectionCount.textContent = selected
    ? `${selected} post${selected === 1 ? '' : 's'} selected`
    : 'No posts selected';
  removeSelectedMailboxPosts.disabled = selected === 0;
  selectAllMailboxPosts.disabled = total === 0;
  selectAllMailboxPosts.checked = total > 0 && selected === total;
  selectAllMailboxPosts.indeterminate = selected > 0 && selected < total;
}

function startMailboxScheduleSync() {
  if (state.mailboxScheduleRefreshTimer) {
    return;
  }

  state.mailboxScheduleRefreshTimer = window.setInterval(() => {
    if (document.hidden || dashboardView.hidden || getActiveTab() !== 'mailbox') {
      return;
    }

    loadScheduledMailboxPosts(false).catch(() => null);
  }, 10000);
}

function stopMailboxScheduleSync() {
  if (!state.mailboxScheduleRefreshTimer) {
    return;
  }

  window.clearInterval(state.mailboxScheduleRefreshTimer);
  state.mailboxScheduleRefreshTimer = null;
}

async function handleMailboxImageChange() {
  const file = mailboxImageInput.files[0];

  if (!file) {
    state.mailboxImage = null;
    updateMailboxPreview();
    return;
  }

  if (!file.type.startsWith('image/')) {
    setSendStatus('Select a PNG, JPG, GIF, or WebP image.', 'error');
    mailboxImageInput.value = '';
    state.mailboxImage = null;
    updateMailboxPreview();
    return;
  }

  state.mailboxImage = {
    name: file.name,
    dataUrl: await readFileAsDataUrl(file),
  };
  updateMailboxPreview();
}

function handleMailboxColorPickerInput() {
  mailboxColorInput.value = mailboxColorPicker.value.toUpperCase();
  updateMailboxPreview();
}

function handleMailboxColorInput() {
  const color = normalizeMessageColor(mailboxColorInput.value);

  if (color) {
    mailboxColorPicker.value = color;
  }

  updateMailboxPreview();
}

function addMailboxLinkButton(values = {}, focus = false) {
  if (mailboxButtonsContainer.children.length >= 5) {
    setSendStatus('Mailbox posts support up to five link buttons.', 'error');
    return;
  }

  const block = document.createElement('section');

  block.className = 'button-block mailbox-link-button';
  block.innerHTML = `
    <div class="block-header">
      <h2>Link Button</h2>
      <button class="secondary remove-mailbox-button" type="button">Remove</button>
    </div>
    <div class="button-fields button-fields-with-emoji">
      <label class="field">
        Label
        <input class="mailbox-button-label" maxlength="80" placeholder="Read more" />
      </label>
      <label class="field">
        Emoji
        <input class="mailbox-button-emoji" maxlength="100" placeholder="Optional" />
      </label>
      <label class="field">
        URL
        <input class="mailbox-button-url" type="url" placeholder="https://..." />
      </label>
    </div>
  `;

  block.querySelector('.mailbox-button-label').value = values.label || '';
  block.querySelector('.mailbox-button-emoji').value = values.emoji || '';
  block.querySelector('.mailbox-button-url').value = values.url || '';
  block.querySelector('.remove-mailbox-button').addEventListener('click', () => {
    block.remove();
    updateMailboxButtonLimit();
    updateMailboxPreview();
  });

  mailboxButtonsContainer.append(block);
  updateMailboxButtonLimit();
  updateMailboxPreview();

  if (focus) {
    block.querySelector('.mailbox-button-label').focus();
  }
}

function updateMailboxButtonLimit() {
  const count = mailboxButtonsContainer.children.length;

  addMailboxButton.disabled = count >= 5;
  addMailboxButton.textContent = count >= 5 ? 'Button Limit Reached' : 'Add Button';
}

function collectMailboxPayload(options = {}) {
  const preview = Boolean(options.preview);
  const postType = mailboxTypeInput.value.trim();
  const title = mailboxTitleInput.value.trim() || (preview ? 'Your headline will appear here' : '');
  const body = mailboxBodyInput.value.trim() || (preview ? 'Write an update, a piece of news, or anything else for the mailbox.' : '');
  const note = mailboxNoteInput.value.trim();
  const heading = `# ${postType ? `${postType}: ` : ''}${title}`.trim();
  const blocks = [
    {
      type: 'text',
      content: [heading, body].filter(Boolean).join('\n\n'),
    },
  ];

  if (note) {
    blocks.push(
      { type: 'divider', spacing: 'small' },
      { type: 'text', content: note },
    );
  }

  return {
    mailboxTitle: title,
    channelId: mailboxChannelInput.value,
    color: mailboxColorInput.value.trim(),
    image: state.mailboxImage,
    blocks,
    buttons: [...mailboxButtonsContainer.querySelectorAll('.mailbox-link-button')].map((block) => ({
      label: block.querySelector('.mailbox-button-label').value,
      emoji: block.querySelector('.mailbox-button-emoji').value,
      url: block.querySelector('.mailbox-button-url').value,
    })),
    allowMentions: mailboxAllowMentionsInput.checked,
  };
}

function updateMailboxPreview() {
  const payload = collectMailboxPayload({ preview: true });
  const color = normalizeMessageColor(payload.color) || '#8FA1BE';
  const previewButtons = payload.buttons.filter((button) => button.label.trim() && button.url.trim());

  mailboxPreviewType.textContent = mailboxTypeInput.value.trim() || 'Mailbox';
  updateMailboxDestination();
  mailboxDiscordPreview.style.setProperty('--preview-accent', color);
  mailboxPreviewImage.hidden = !state.mailboxImage;

  if (state.mailboxImage) {
    mailboxPreviewImage.src = state.mailboxImage.dataUrl;
  } else {
    mailboxPreviewImage.removeAttribute('src');
  }

  mailboxPreviewSections.replaceChildren();

  for (const block of payload.blocks) {
    if (block.type === 'text') {
      mailboxPreviewSections.append(createTextPreviewBlock(block));
      continue;
    }

    const layout = document.createElement('div');

    layout.className = `preview-layout preview-layout-${block.type} preview-layout-${block.spacing}`;
    layout.setAttribute('aria-hidden', 'true');
    mailboxPreviewSections.append(layout);
  }

  mailboxPreviewButtons.replaceChildren();

  for (const button of previewButtons) {
    const anchor = document.createElement('a');

    anchor.className = 'preview-button';
    anchor.href = button.url;
    anchor.target = '_blank';
    anchor.rel = 'noreferrer';
    appendPreviewButtonContent(anchor, button);
    mailboxPreviewButtons.append(anchor);
  }
}

async function refreshBotSettings(showNotification = false) {
  let bot = await api('/api/bot');

  bot = await restorePresenceBackupIfNeeded(bot);
  renderBotSettings(bot);

  if (bot.presenceStorage?.hasSavedSettings) {
    writePresenceBackup(bot.presence);
  }

  if (showNotification) {
    setSendStatus('Bot profile refreshed.', 'success');
  }
}

function renderBotSettings(bot) {
  if (!bot?.ok) {
    return;
  }

  setGuildName(bot.guildName);
  setBotStatus(Boolean(bot.botReady), bot.tag);
  botProfileTag.textContent = bot.tag || 'Bot not ready';
  botProfileName.textContent = bot.username || bot.tag || 'Bean';
  botProfileId.textContent = bot.id ? `ID ${bot.id}` : 'Waiting for Discord';

  if (bot.avatarUrl) {
    botAvatarPreview.src = bot.avatarUrl;
    botAvatarPreview.hidden = false;
  } else {
    botAvatarPreview.hidden = true;
    botAvatarPreview.removeAttribute('src');
  }

  if (bot.bannerUrl) {
    botBannerPreview.src = bot.bannerUrl;
    botBannerPreview.hidden = false;
    botBannerPlaceholder.hidden = true;
  } else {
    botBannerPreview.hidden = true;
    botBannerPreview.removeAttribute('src');
    botBannerPlaceholder.hidden = false;
  }

  botBioInput.value = bot.bio || '';
  updateBotBioCount();

  const presence = bot.presence || {};
  presenceStatusInput.value = normalizePresenceStatus(presence.status);
  presenceActivityTypeInput.value = normalizeActivityType(presence.activityType);
  presenceRotationSecondsInput.value = normalizePresenceInterval(presence.intervalSeconds);
  presenceActivityUrlInput.value = presence.activityUrl || '';
  renderPresenceActivities(presence.activityNames);
  updatePresenceUrlVisibility();
  renderPresenceStorageStatus(bot.presenceStorage);
}

async function handleBotImageChange(kind) {
  const input = kind === 'avatar' ? botAvatarInput : botBannerInput;
  const file = input.files[0];

  if (!file) {
    if (kind === 'avatar') {
      state.botAvatarImage = null;
    } else {
      state.botBannerImage = null;
    }

    return;
  }

  if (!file.type.startsWith('image/')) {
    setSendStatus('Select an image file.', 'error');
    input.value = '';
    return;
  }

  const image = {
    name: file.name,
    dataUrl: await readFileAsDataUrl(file),
  };

  if (kind === 'avatar') {
    state.botAvatarImage = image;
    botAvatarPreview.src = image.dataUrl;
    botAvatarPreview.hidden = false;
  } else {
    state.botBannerImage = image;
    botBannerPreview.src = image.dataUrl;
    botBannerPreview.hidden = false;
    botBannerPlaceholder.hidden = true;
  }
}

async function handleUpdateBotImage(kind) {
  const isAvatar = kind === 'avatar';
  const image = isAvatar ? state.botAvatarImage : state.botBannerImage;
  const button = isAvatar ? saveBotAvatarButton : saveBotBannerButton;
  const input = isAvatar ? botAvatarInput : botBannerInput;

  if (!image) {
    setSendStatus(`Choose a bot ${kind} image first.`, 'error');
    return;
  }

  button.disabled = true;

  try {
    const bot = await api(`/api/bot/${kind}`, {
      method: 'POST',
      body: { image },
    });

    if (isAvatar) {
      state.botAvatarImage = null;
    } else {
      state.botBannerImage = null;
    }

    input.value = '';
    renderBotSettings(bot);
    setSendStatus(`Bot ${kind} updated.`, 'success');
  } catch (error) {
    setSendStatus(error.message, 'error');
  } finally {
    button.disabled = false;
  }
}

async function handleUpdateBotBio(event) {
  event.preventDefault();
  saveBotBioButton.disabled = true;

  try {
    const bot = await api('/api/bot/bio', {
      method: 'POST',
      body: { bio: botBioInput.value },
    });

    renderBotSettings(bot);
    setSendStatus(bot.bio ? 'Bot bio updated.' : 'Bot bio cleared.', 'success');
  } catch (error) {
    setSendStatus(error.message, 'error');
  } finally {
    saveBotBioButton.disabled = false;
  }
}

function updateBotBioCount() {
  botBioCount.textContent = `${botBioInput.value.length} / 400`;
}

async function handleUpdateBotPresence(event) {
  event.preventDefault();
  saveBotPresenceButton.disabled = true;

  try {
    const bot = await api('/api/bot/presence', {
      method: 'POST',
      body: {
        status: presenceStatusInput.value,
        activityType: presenceActivityTypeInput.value,
        activityNames: getPresenceActivityNames(),
        activityUrl: presenceActivityUrlInput.value,
        intervalSeconds: presenceRotationSecondsInput.value,
      },
    });

    writePresenceBackup(bot.presence);
    renderBotSettings(bot);
    setSendStatus('Bot presence updated.', 'success');
  } catch (error) {
    setSendStatus(error.message, 'error');
  } finally {
    saveBotPresenceButton.disabled = false;
  }
}

async function restorePresenceBackupIfNeeded(bot) {
  if (
    state.presenceRestoreAttempted ||
    !bot?.botReady ||
    bot.presenceStorage?.hasSavedSettings
  ) {
    return bot;
  }

  const backup = readPresenceBackup();

  if (!backup) {
    return bot;
  }

  state.presenceRestoreAttempted = true;

  try {
    const restoredBot = await api('/api/bot/presence', {
      method: 'POST',
      body: backup,
    });

    setSendStatus('Presence rotation restored from this browser.', 'success');
    return restoredBot;
  } catch (error) {
    state.presenceRestoreAttempted = false;
    setSendStatus(`Could not restore the browser presence backup: ${error.message}`, 'error');
    return bot;
  }
}

function writePresenceBackup(presence) {
  if (!presence || !Array.isArray(presence.activityNames)) {
    return;
  }

  const backup = {
    status: presence.status,
    activityType: presence.activityType,
    activityNames: [...presence.activityNames],
    activityUrl: presence.activityUrl || '',
    intervalSeconds: presence.intervalSeconds,
  };

  try {
    window.localStorage.setItem(presenceStorageKey, JSON.stringify(backup));
  } catch {
    // Server-side storage remains authoritative when browser storage is unavailable.
  }
}

function readPresenceBackup() {
  try {
    const backup = JSON.parse(window.localStorage.getItem(presenceStorageKey) || 'null');

    if (!backup || !Array.isArray(backup.activityNames)) {
      return null;
    }

    return backup;
  } catch {
    return null;
  }
}

function renderPresenceStorageStatus(storage) {
  if (!storage) {
    presenceStorageStatus.textContent = 'Storage unavailable';
    presenceStorageStatus.classList.remove('ready');
    presenceStorageStatus.classList.add('offline');
    return;
  }

  if (!storage.hasSavedSettings) {
    presenceStorageStatus.textContent = 'Using deployment defaults';
    presenceStorageStatus.classList.remove('ready');
    presenceStorageStatus.classList.add('offline');
    presenceStorageStatus.title = 'Save the rotation to create a presence settings file.';
    return;
  }

  presenceStorageStatus.classList.remove('offline');
  presenceStorageStatus.classList.add('ready');

  if (storage.persistent) {
    presenceStorageStatus.textContent = 'Saved persistently';
    presenceStorageStatus.title = storage.filePath || '';
  } else {
    presenceStorageStatus.textContent = 'Saved locally';
    presenceStorageStatus.title = 'This survives process restarts, but a Railway redeploy can replace it.';
  }
}

function renderPresenceActivities(activityNames) {
  const names = Array.isArray(activityNames) ? activityNames : [];
  presenceActivityList.replaceChildren();

  if (names.length === 0) {
    const emptyState = document.createElement('p');
    emptyState.className = 'presence-activity-empty';
    emptyState.textContent = 'No activity text. The bot will only show its status.';
    presenceActivityList.append(emptyState);
    return;
  }

  names.forEach((name) => addPresenceActivity(name));
}

function addPresenceActivity(value) {
  if (presenceActivityList.querySelectorAll('.presence-activity-row').length >= 25) {
    setSendStatus('You can rotate up to 25 activity texts.', 'error');
    return;
  }

  const row = document.createElement('div');
  row.className = 'presence-activity-row';

  const input = document.createElement('input');
  input.className = 'presence-activity-name';
  input.maxLength = 128;
  input.placeholder = 'Keeping every layer in place.';
  input.value = String(value || '');
  input.setAttribute('aria-label', 'Activity text');

  const removeButton = document.createElement('button');
  removeButton.className = 'remove';
  removeButton.type = 'button';
  removeButton.dataset.action = 'remove-presence-activity';
  removeButton.textContent = 'Remove';

  row.append(input, removeButton);

  const emptyState = presenceActivityList.querySelector('.presence-activity-empty');
  emptyState?.remove();
  presenceActivityList.append(row);

  if (!value) {
    input.focus();
  }
}

function handlePresenceActivityListClick(event) {
  const button = event.target.closest('[data-action="remove-presence-activity"]');

  if (!button) {
    return;
  }

  button.closest('.presence-activity-row')?.remove();

  if (!presenceActivityList.querySelector('.presence-activity-row')) {
    renderPresenceActivities([]);
  }
}

function getPresenceActivityNames() {
  return [...presenceActivityList.querySelectorAll('.presence-activity-name')]
    .map((input) => input.value.trim())
    .filter(Boolean);
}

const dashboardConfigurationDefinitions = {
  roles: {
    founder: ['Founder role', 'Full bot and dashboard ownership.'],
    staff: ['Staff role', 'Full dashboard access below Founder ownership.'],
    moderator: ['Moderator role', 'Cases, members, tickets, and voice operations.'],
    verified: ['Verified role', 'Role granted by the verification system.'],
    live: ['Going Live role', 'Granted to members streaming on Twitch.'],
    newUpload: ['New Upload role', 'Mentioned for YouTube upload alerts.'],
  },
  features: {
    welcomeMessages: ['Welcome messages', 'Greet new members with the saved Welcome template.', 'fa-hand-sparkles'],
    inviteModeration: ['Invite moderation', 'Remove unauthorized Discord invites and timeout the sender.', 'fa-link-slash'],
    streamMonitor: ['Twitch monitor', 'Detect featured streams and manage the Going Live role.', 'fa-brands fa-twitch'],
    youtubeMonitor: ['YouTube monitor', 'Check the channel feed and publish new upload alerts.', 'fa-brands fa-youtube'],
    temporaryVoice: ['Temporary voice rooms', 'Create member-owned rooms from the configured lobby.', 'fa-headphones'],
    tickets: ['Ticket system', 'Let members create private support tickets.', 'fa-ticket'],
    reactionRoles: ['Reaction roles', 'Grant the configured verification role from Discord reactions.', 'fa-user-check'],
    detailedLogging: ['Detailed audit logging', 'Record message, member, voice, role, and channel changes.', 'fa-clipboard-list'],
  },
};
const auditLoggingChannelDefinitions = {
  caseFiles: ['Case files', 'Warnings, timeouts, kicks, bans, case edits, and revocations.'],
  entryLog: ['Entry log', 'Member joins, leaves, and invite-moderation actions.'],
  signalLog: ['Message log', 'Message edits, deletes, bulk deletes, and attachments.'],
  lineLog: ['Voice log', 'Voice joins, moves, sessions, and state changes.'],
  operationLog: ['Operation log', 'Bot startup, dashboard changes, publishing, tickets, and voice-room actions.'],
  systemLog: ['System log', 'Channel, role, permission, scheduled-event, and user changes.'],
  ticketLogs: ['Ticket log', 'Ticket creation, ownership, and closure records.'],
};

async function loadDashboardConfiguration(showNotification = false) {
  if (!dashboardConfigForm) {
    return;
  }

  dashboardConfigForm.classList.add('is-loading');

  try {
    const [result, rolesResult, optionsResult] = await Promise.all([
      api('/api/configuration'),
      api('/api/roles').catch(() => ({ roles: [] })),
      api('/api/configuration-options').catch(() => ({ channels: state.discordChannels })),
    ]);

    state.configuration = cloneData(result.settings);
    state.savedConfiguration = cloneData(result.settings);
    state.configurationDiagnostics = result.diagnostics;
    state.configurationStorage = result.storage;
    state.configurationOauth = result.oauth;
    state.discordRoles = Array.isArray(rolesResult.roles) ? rolesResult.roles : [];
    state.configurationChannels = Array.isArray(optionsResult.channels)
      ? optionsResult.channels
      : state.discordChannels;
    state.configurationDirty = false;
    renderDashboardConfiguration();

    if (showNotification) {
      setSendStatus('Configuration and Discord checks refreshed.', 'success');
    }
  } finally {
    dashboardConfigForm.classList.remove('is-loading');
  }
}

function renderDashboardConfiguration() {
  if (!state.configuration) {
    return;
  }

  renderConfigurationRoles();
  renderConfigurationDiagnostics();
  renderConfigurationAudit();
  renderConfigurationSummary();
  renderFeatureControls();
  setDashboardConfigDirty(false);
  applySessionPermissions(state.session?.permissions || {});
}

function renderConfigurationChannelSelect(select, key, selectedValue) {
  const channels = state.configurationChannels.filter((channel) =>
    key === 'tempVoiceTrigger' ? channel.voice : channel.sendable !== false);
  const placeholder = document.createElement('option');
  const groups = new Map();

  placeholder.value = '';
  placeholder.textContent = key === 'tempVoiceTrigger'
    ? 'No voice lobby selected'
    : 'No channel selected';
  select.replaceChildren(placeholder);

  for (const channel of channels) {
    const groupName = channel.parentName || 'Server channels';

    if (!groups.has(groupName)) {
      groups.set(groupName, []);
    }
    groups.get(groupName).push(channel);
  }

  for (const [groupName, groupedChannels] of groups) {
    const group = document.createElement('optgroup');

    group.label = groupName;

    for (const channel of groupedChannels) {
      const option = document.createElement('option');

      option.value = channel.id;
      option.textContent = `${channel.voice ? '🔊' : '#'} ${channel.name}`;
      group.append(option);
    }
    select.append(group);
  }

  setSelectValueWithUnavailableOption(select, selectedValue, 'Unavailable channel');
  updateChannelSelectAppearance(select);
}

function renderConfigurationRoles() {
  configRoleGrid.replaceChildren();

  for (const [key, [label, description]] of Object.entries(dashboardConfigurationDefinitions.roles)) {
    const card = document.createElement('label');
    const heading = document.createElement('span');
    const title = document.createElement('strong');
    const copy = document.createElement('small');
    const shell = document.createElement('span');
    const icon = document.createElement('span');
    const select = document.createElement('select');
    const placeholder = document.createElement('option');
    const chevron = document.createElement('i');

    card.className = 'config-field-card';
    heading.className = 'config-field-heading';
    title.textContent = label;
    copy.textContent = description;
    heading.append(title, copy);
    shell.className = 'cozy-role-select';
    icon.className = 'cozy-role-select-icon';
    icon.innerHTML = '<i class="fa-solid fa-at" aria-hidden="true"></i>';
    select.id = `config-role-${key}`;
    select.dataset.configRole = key;
    placeholder.value = '';
    placeholder.textContent = 'No role selected';
    select.append(placeholder);

    for (const role of state.discordRoles) {
      const option = document.createElement('option');

      option.value = role.id;
      option.textContent = `@ ${role.name}`;
      select.append(option);
    }

    setSelectValueWithUnavailableOption(
      select,
      state.configuration.roles[key],
      'Unavailable role',
    );
    chevron.className = 'fa-solid fa-chevron-down cozy-role-select-chevron';
    chevron.setAttribute('aria-hidden', 'true');
    shell.append(icon, select, chevron);
    card.append(heading, shell);
    configRoleGrid.append(card);
  }
}

function renderConfigurationDiagnostics() {
  const checks = state.configurationDiagnostics?.checks || [];
  const attention = checks.filter((check) => check.status !== 'ready' && isVisibleConfigurationCheck(check));

  renderDiagnosticItems(configDiagnosticList, checks.filter(isVisibleConfigurationCheck));
  renderDiagnosticItems(configAttentionList, attention.slice(0, 8), {
    emptyMessage: 'Everything required by your enabled features is connected.',
  });
  configAttentionCount.textContent = attention.length ? `${attention.length} to review` : 'All clear';
  configAttentionCount.classList.toggle('ready', attention.length === 0);
  configAttentionCount.classList.toggle('offline', attention.length > 0);
}

function renderDiagnosticItems(container, checks, options = {}) {
  container.replaceChildren();

  if (checks.length === 0) {
    const empty = document.createElement('div');

    empty.className = 'config-diagnostic-empty';
    empty.innerHTML = `<i class="fa-solid fa-circle-check" aria-hidden="true"></i><span>${escapeHtml(options.emptyMessage || 'No checks are available yet.')}</span>`;
    container.append(empty);
    return;
  }

  for (const check of checks) {
    const item = document.createElement('article');
    const icon = getDiagnosticIcon(check.status);

    item.className = `config-diagnostic-item ${check.status}`;
    item.innerHTML = `
      <span><i class="fa-solid ${icon}" aria-hidden="true"></i></span>
      <div><strong>${escapeHtml(check.label)}</strong><p>${escapeHtml(check.message)}</p></div>
      <small>${escapeHtml(check.group)}</small>
    `;

    if (['channels', 'roles'].includes(check.group)) {
      const action = document.createElement('button');

      action.type = 'button';
      action.className = 'secondary';
      action.textContent = 'Fix';
      action.addEventListener('click', () => {
        if (check.group === 'channels') {
          setActiveTab(getChannelOwnerTab(check.key));
          return;
        }

        setConfigSection('roles');
      });
      item.append(action);
    }

    container.append(item);
  }
}

function getChannelOwnerTab(key) {
  if (['caseFiles', 'entryLog', 'signalLog', 'lineLog', 'operationLog', 'systemLog', 'ticketLogs'].includes(key)) {
    return 'audit-logging';
  }

  return {
    welcome: 'welcome-embed',
    rules: 'reaction-roles',
    tickets: 'tickets',
    streamAnnouncements: 'live-embed',
    youtubeAnnouncements: 'live-embed',
    mailbox: 'mailbox',
    tempVoiceTrigger: 'voice-rooms',
  }[key] || 'config';
}

function renderConfigurationAudit() {
  const entries = state.configuration.audit || [];
  configAuditList.replaceChildren();

  if (entries.length === 0) {
    configAuditList.innerHTML = '<p class="config-audit-empty">Configuration changes will appear here after the first save.</p>';
    return;
  }

  for (const entry of entries.slice(0, 20)) {
    const item = document.createElement('article');
    const count = entry.changes?.length || 0;

    item.className = 'config-audit-item';
    item.innerHTML = `
      <span class="config-audit-avatar">${entry.actor?.avatarUrl ? `<img src="${escapeHtml(entry.actor.avatarUrl)}" alt="">` : '<i class="fa-solid fa-user" aria-hidden="true"></i>'}</span>
      <div>
        <strong>${escapeHtml(entry.actor?.displayName || 'Dashboard user')}</strong>
        <p>Changed ${count} setting${count === 1 ? '' : 's'} · ${escapeHtml(formatConfigurationChanges(entry.changes))}</p>
        <small>${escapeHtml(formatDateTime(entry.createdAt))}</small>
      </div>
    `;
    configAuditList.append(item);
  }
}

function renderConfigurationSummary() {
  const summary = state.configurationDiagnostics?.summary || {};
  const total = Number(summary.total) || 0;
  const ready = Number(summary.ready) || 0;
  const percent = total ? Math.round((ready / total) * 100) : 100;
  const warnings = Number(summary.warnings) || 0;
  const storage = state.configurationStorage || {};
  const oauth = state.configurationOauth || {};

  configReadinessRing.textContent = `${percent}%`;
  configReadinessRing.style.setProperty('--readiness', `${percent * 3.6}deg`);
  configReadinessTitle.textContent = warnings ? 'Setup needs attention' : 'Bean is configured';
  configReadinessCopy.textContent = `${ready} of ${total} required checks are ready.`;
  configOauthStatus.textContent = oauth.enabled ? 'Discord login active' : oauth.configured ? 'Ready to enable' : 'Password access';
  configOauthCopy.textContent = oauth.enabled
    ? 'Staff permissions follow their Discord roles.'
    : 'Add the OAuth environment values to enable role-based staff access.';
  configStorageStatus.textContent = storage.persistent ? 'Saved persistently' : 'Local storage only';
  configStorageCopy.textContent = storage.persistent
    ? `Configuration uses ${storage.source}.`
    : 'Attach a Railway volume so settings survive redeploys.';
  configCheckStatus.textContent = warnings ? `${warnings} issue${warnings === 1 ? '' : 's'}` : 'All required checks pass';
  configCheckCopy.textContent = summary.restartRequired
    ? 'At least one change requires a Discord intent update and restart.'
    : 'Channel, role, and intent checks are current.';
}

function setConfigSection(sectionName) {
  const next = configSections.some((section) => section.dataset.configPanel === sectionName)
    ? sectionName
    : 'overview';

  configSectionButtons.forEach((button) => {
    const selected = button.dataset.configSection === next;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-selected', String(selected));
  });
  configSections.forEach((section) => {
    section.hidden = section.dataset.configPanel !== next;
    section.classList.toggle('active', section.dataset.configPanel === next);
  });
}

function markDashboardConfigDirty() {
  if (state.configuration) {
    setDashboardConfigDirty(true);
  }
}

function setDashboardConfigDirty(dirty) {
  state.configurationDirty = Boolean(dirty);
  dashboardConfigForm.classList.toggle('is-dirty', state.configurationDirty);
  configDirtyDot.classList.toggle('active', state.configurationDirty);
  configSaveState.textContent = state.configurationDirty ? 'Unsaved changes' : 'All changes saved';
  configSaveTime.textContent = state.configurationDirty
    ? 'Review and save when you are ready.'
    : state.configuration?.updatedAt
      ? `Last updated ${formatDateTime(state.configuration.updatedAt)}.`
      : 'Configuration is synced with Bean.';
  resetDashboardConfigButton.disabled = !state.configurationDirty || state.session?.permissions?.configure === false;
}

async function handleDashboardConfigSave(event) {
  event.preventDefault();

  if (!state.session?.permissions?.configure && state.session?.permissions) {
    setSendStatus('Your dashboard role cannot change configuration.', 'error');
    return;
  }

  saveDashboardConfigButton.disabled = true;
  saveDashboardConfigButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Saving…';

  try {
    const settings = collectDashboardConfiguration();
    const result = await api('/api/configuration', {
      method: 'PUT',
      body: { settings },
    });

    state.configuration = cloneData(result.settings);
    state.savedConfiguration = cloneData(result.settings);
    state.configurationDiagnostics = result.diagnostics;
    state.configurationStorage = result.storage;
    renderDashboardConfiguration();
    setSendStatus('Dashboard configuration saved and applied.', 'success');
  } catch (error) {
    setDashboardConfigDirty(true);
    setSendStatus(error.message, 'error');
  } finally {
    saveDashboardConfigButton.disabled = false;
    saveDashboardConfigButton.innerHTML = '<i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Save configuration';
  }
}

function collectDashboardConfiguration() {
  const settings = cloneData(state.configuration);

  dashboardConfigForm.querySelectorAll('[data-config-role]').forEach((select) => {
    settings.roles[select.dataset.configRole] = select.value || null;
  });
  return settings;
}

async function loadFeatureConfiguration(showNotification = false) {
  const [result, optionsResult] = await Promise.all([
    api('/api/configuration'),
    api('/api/configuration-options').catch(() => ({ channels: state.discordChannels })),
  ]);

  state.configuration = cloneData(result.settings);
  state.savedConfiguration = cloneData(result.settings);
  state.configurationDiagnostics = result.diagnostics;
  state.configurationStorage = result.storage;
  state.configurationOauth = result.oauth;
  state.configurationChannels = Array.isArray(optionsResult.channels)
    ? optionsResult.channels
    : state.discordChannels;
  renderFeatureControls();
  applySessionPermissions(state.session?.permissions || {});

  if (showNotification) {
    setSendStatus('Feature status refreshed.', 'success');
  }

  return result;
}

function renderFeatureControls() {
  const features = state.configuration?.features;

  if (!features) {
    return;
  }

  featureToggleInputs.forEach((input) => {
    const key = input.dataset.featureToggle;
    const enabled = Boolean(features[key]);

    input.checked = enabled;
    input.closest('.feature-page-toggle, .feature-status-strip')?.classList.toggle('is-enabled', enabled);
  });

  document.querySelectorAll('[data-feature-status-copy]').forEach((element) => {
    const key = element.dataset.featureStatusCopy;
    const enabled = Boolean(features[key]);

    element.textContent = enabled
      ? 'Enabled · Bean is actively running this feature.'
      : 'Disabled · Your setup is saved and locked until you enable it again.';
  });

  document.querySelectorAll('[data-feature-state-pill]').forEach((element) => {
    const enabled = Boolean(features[element.dataset.featureStatePill]);

    element.textContent = enabled ? 'Running' : 'Disabled';
    element.classList.toggle('ready', enabled);
    element.classList.toggle('offline', !enabled);
  });

  document.querySelectorAll('[data-feature-nav]').forEach((element) => {
    const enabled = Boolean(features[element.dataset.featureNav]);

    element.classList.toggle('is-feature-disabled', !enabled);
    element.setAttribute('aria-description', enabled ? 'Feature enabled' : 'Feature disabled');
  });

  document.querySelectorAll('[data-feature-nav-any]').forEach((element) => {
    const keys = element.dataset.featureNavAny.split(/\s+/).filter(Boolean);
    const enabled = keys.some((key) => Boolean(features[key]));

    element.classList.toggle('is-feature-disabled', !enabled);
    element.setAttribute('aria-description', enabled ? 'At least one feature enabled' : 'Features disabled');
  });

  document.querySelectorAll('[data-feature-page]').forEach((element) => {
    element.classList.toggle('is-feature-disabled', !features[element.dataset.featurePage]);
  });

  document.querySelectorAll('[data-feature-page-any]').forEach((element) => {
    const keys = element.dataset.featurePageAny.split(/\s+/).filter(Boolean);

    element.classList.toggle('is-feature-disabled', !keys.some((key) => Boolean(features[key])));
  });

  document.querySelectorAll('[data-feature-binding]').forEach((element) => {
    const [group, key] = element.dataset.featureBinding.split('.');
    const value = state.configuration?.[group]?.[key];

    element.textContent = value ? 'Connected' : 'Not configured';
    element.classList.toggle('is-missing', !value);
  });

  renderFeatureChannelSettings();
  renderAuditLoggingChannels();
  renderFeaturePageAvailability();
}

function renderFeaturePageAvailability() {
  const features = state.configuration?.features;

  if (!features) {
    return;
  }

  document.querySelectorAll('[data-feature-page], [data-feature-page-any]').forEach((page) => {
    const enabled = isFeaturePageEditorEnabled(page, features);
    const exemptSelector = '.feature-status-strip, .feature-page-hero, .feature-status-grid, .embed-kind-switch';

    page.classList.toggle('is-active-feature-disabled', !enabled);

    [...page.children].forEach((surface) => {
      const exempt = surface.matches(exemptSelector);

      surface.classList.toggle('feature-lock-surface', !exempt);
      surface.classList.toggle('is-feature-locked', !exempt && !enabled);

      if (!exempt) {
        surface.setAttribute('aria-disabled', String(!enabled));
      }
    });

    page.querySelectorAll('input, select, textarea, button').forEach((control) => {
      if (control.closest(exemptSelector)) {
        return;
      }

      if (!enabled) {
        if (!control.disabled) {
          control.dataset.featureDisabled = 'true';
        }
        control.disabled = true;
        return;
      }

      if (control.dataset.featureDisabled === 'true') {
        control.disabled = control.dataset.permissionDisabled === 'true';
        delete control.dataset.featureDisabled;
      }
    });
  });
}

function isFeaturePageEditorEnabled(page, features) {
  if (page.dataset.featurePage) {
    return Boolean(features[page.dataset.featurePage]);
  }

  if (page.dataset.panel === 'live-embed') {
    const activeFeature = state.activeEmbedBuilder === 'youtube'
      ? 'youtubeMonitor'
      : 'streamMonitor';

    return Boolean(features[activeFeature]);
  }

  const keys = String(page.dataset.featurePageAny || '').split(/\s+/).filter(Boolean);
  return keys.some((key) => Boolean(features[key]));
}

function renderFeatureChannelSettings() {
  if (!state.configuration) {
    return;
  }

  document.querySelectorAll('[data-feature-channel-setting]').forEach((select) => {
    const key = select.dataset.featureChannelSetting;

    renderConfigurationChannelSelect(
      select,
      key,
      state.configuration.channels[key] || '',
    );
  });

  if (voiceRoomTriggerIdInput) {
    renderConfigurationChannelSelect(
      voiceRoomTriggerIdInput,
      'tempVoiceTrigger',
      state.voiceRooms.settings?.triggerChannelId
        || state.configuration.channels.tempVoiceTrigger
        || '',
    );
  }
}

async function handleFeatureChannelSettingsSave(event) {
  event.preventDefault();

  if (state.session?.permissions?.configure === false) {
    setSendStatus('Your dashboard role cannot change feature destinations.', 'error');
    return;
  }

  if (!state.configuration) {
    await loadFeatureConfiguration(false);
  }

  const form = event.currentTarget;
  const settings = cloneData(state.configuration);
  const changedKeys = [];

  form.querySelectorAll('[data-feature-channel-setting]').forEach((select) => {
    const key = select.dataset.featureChannelSetting;

    settings.channels[key] = select.value || null;
    changedKeys.push(key);
  });

  const submitButton = event.submitter || form.querySelector('[type="submit"]');
  const originalLabel = submitButton?.innerHTML;

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Saving&hellip;';
  }

  try {
    const result = await api('/api/configuration', {
      method: 'PUT',
      body: { settings },
    });

    state.configuration = cloneData(result.settings);
    state.savedConfiguration = cloneData(result.settings);
    state.configurationDiagnostics = result.diagnostics;
    state.configurationStorage = result.storage;
    renderFeatureControls();
    applySessionPermissions(state.session?.permissions || {});

    const messages = {
      tickets: 'Ticket destination saved.',
      rules: 'Reaction-role channel saved.',
    };

    setSendStatus(messages[changedKeys[0]] || 'Feature destinations saved.', 'success');
  } catch (error) {
    setSendStatus(error.message, 'error');
  } finally {
    if (submitButton) {
      submitButton.disabled = state.session?.permissions?.configure === false;
      submitButton.innerHTML = originalLabel;
    }
  }
}

function renderAuditLoggingChannels() {
  if (!auditLogChannelGrid || !state.configuration) {
    return;
  }

  auditLogChannelGrid.replaceChildren();

  for (const [key, [label, description]] of Object.entries(auditLoggingChannelDefinitions)) {
    const card = document.createElement('label');
    const heading = document.createElement('span');
    const title = document.createElement('strong');
    const copy = document.createElement('small');
    const shell = document.createElement('span');
    const icon = document.createElement('span');
    const select = document.createElement('select');
    const chevron = document.createElement('i');

    card.className = 'config-field-card audit-log-channel-card';
    heading.className = 'config-field-heading';
    title.textContent = label;
    copy.textContent = description;
    heading.append(title, copy);
    shell.className = 'cozy-channel-select';
    icon.className = 'cozy-channel-select-icon';
    icon.innerHTML = '<i class="fa-solid fa-file-shield" aria-hidden="true"></i>';
    select.id = `audit-log-channel-${key}`;
    select.dataset.auditLogChannel = key;
    select.className = 'discord-channel-select';
    select.addEventListener('change', () => {
      updateChannelSelectAppearance(select);
      auditLogSaveStatus.textContent = 'Unsaved changes';
      auditLogSaveStatus.classList.remove('ready', 'offline');
    });
    chevron.className = 'fa-solid fa-chevron-down cozy-channel-select-chevron';
    chevron.setAttribute('aria-hidden', 'true');
    shell.append(icon, select, chevron);
    card.append(heading, shell);
    auditLogChannelGrid.append(card);
    renderConfigurationChannelSelect(select, key, state.configuration.channels[key] || '');
  }

  auditLogSaveStatus.textContent = 'Synced with Bean';
  auditLogSaveStatus.classList.remove('offline');
  auditLogSaveStatus.classList.add('ready');
}

async function handleAuditLogSettingsSave(event) {
  event.preventDefault();

  if (state.session?.permissions?.configure === false) {
    setSendStatus('Your dashboard role cannot change logging channels.', 'error');
    return;
  }

  if (!state.configuration) {
    await loadFeatureConfiguration(false);
  }

  const settings = cloneData(state.configuration);

  auditLogSettingsForm.querySelectorAll('[data-audit-log-channel]').forEach((select) => {
    settings.channels[select.dataset.auditLogChannel] = select.value || null;
  });

  saveAuditLogSettingsButton.disabled = true;
  saveAuditLogSettingsButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Saving…';
  auditLogSaveStatus.textContent = 'Saving';
  auditLogSaveStatus.classList.remove('ready', 'offline');

  try {
    const result = await api('/api/configuration', {
      method: 'PUT',
      body: { settings },
    });

    state.configuration = cloneData(result.settings);
    state.savedConfiguration = cloneData(result.settings);
    state.configurationDiagnostics = result.diagnostics;
    state.configurationStorage = result.storage;
    renderFeatureControls();
    applySessionPermissions(state.session?.permissions || {});
    setSendStatus('Logging channels saved and applied.', 'success');
  } catch (error) {
    auditLogSaveStatus.textContent = 'Save failed';
    auditLogSaveStatus.classList.add('offline');
    setSendStatus(error.message, 'error');
  } finally {
    saveAuditLogSettingsButton.disabled = state.session?.permissions?.configure === false;
    saveAuditLogSettingsButton.innerHTML = '<i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Save logging channels';
  }
}

async function handleFeatureToggleChange(input) {
  if (state.session?.permissions?.configure === false) {
    renderFeatureControls();
    throw new Error('Your dashboard role cannot change feature settings.');
  }

  if (!state.configuration) {
    await loadFeatureConfiguration(false);
  }

  const key = input.dataset.featureToggle;
  const definition = dashboardConfigurationDefinitions.features[key];
  const settings = cloneData(state.configuration);
  const enabled = input.checked;
  const previousEnabled = Boolean(state.configuration.features[key]);

  settings.features[key] = enabled;
  state.configuration.features[key] = enabled;
  renderFeatureControls();
  applySessionPermissions(state.session?.permissions || {});
  input.disabled = true;

  try {
    const result = await api('/api/configuration', {
      method: 'PUT',
      body: { settings },
    });

    state.configuration = cloneData(result.settings);
    state.savedConfiguration = cloneData(result.settings);
    state.configurationDiagnostics = result.diagnostics;
    state.configurationStorage = result.storage;
    renderFeatureControls();

    const restartNote = key === 'youtubeMonitor' && enabled
      ? ' Restart Bean if the YouTube monitor was disabled when it started.'
      : '';
    setSendStatus(`${definition?.[0] || 'Feature'} ${enabled ? 'enabled' : 'disabled'}.${restartNote}`, 'success');
  } catch (error) {
    state.configuration.features[key] = previousEnabled;
    renderFeatureControls();
    applySessionPermissions(state.session?.permissions || {});
    throw error;
  } finally {
    input.disabled = state.session?.permissions?.configure === false;
  }
}

function resetDashboardConfiguration() {
  if (!state.savedConfiguration) {
    return;
  }

  state.configuration = cloneData(state.savedConfiguration);
  renderDashboardConfiguration();
  setSendStatus('Unsaved configuration changes discarded.', 'success');
}

function isVisibleConfigurationCheck(check) {
  if (check.group === 'channels') {
    const featureMap = {
      welcome: 'welcomeMessages',
      tickets: 'tickets',
      ticketLogs: 'tickets',
      streamAnnouncements: 'streamMonitor',
      youtubeAnnouncements: 'youtubeMonitor',
      tempVoiceTrigger: 'temporaryVoice',
    };
    const feature = featureMap[check.key];
    return !feature || state.configuration?.features?.[feature];
  }

  return true;
}

function getDiagnosticIcon(status) {
  return {
    ready: 'fa-circle-check',
    warning: 'fa-triangle-exclamation',
    missing: 'fa-circle-minus',
    invalid: 'fa-link-slash',
    restart: 'fa-power-off',
  }[status] || 'fa-circle-info';
}

function setSelectValueWithUnavailableOption(select, value, label) {
  const normalized = String(value || '');

  if (normalized && ![...select.options].some((option) => option.value === normalized)) {
    const unavailable = document.createElement('option');

    unavailable.value = normalized;
    unavailable.textContent = `${label} · ${normalized}`;
    select.append(unavailable);
  }

  select.value = normalized;
}

function formatConfigurationChanges(changes = []) {
  return changes
    .slice(0, 3)
    .map((change) => `${change.group}.${change.key}`)
    .join(', ')
    + (changes.length > 3 ? ` +${changes.length - 3} more` : '');
}

function formatDateTime(value) {
  const date = new Date(value || '');
  return Number.isNaN(date.getTime())
    ? 'just now'
    : new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
}

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function renderLoadingSkeleton(container, rows = 3) {
  if (!container) {
    return;
  }

  container.replaceChildren();

  for (let index = 0; index < rows; index += 1) {
    const skeleton = document.createElement('div');

    skeleton.className = 'loading-skeleton-row';
    skeleton.innerHTML = '<span></span><div><i></i><i></i></div>';
    container.append(skeleton);
  }
}

function renderLoadingFailure(container, message) {
  if (!container) {
    return;
  }

  container.innerHTML = `
    <div class="loading-failure">
      <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
      <span>${escapeHtml(message || 'This information could not be loaded.')}</span>
    </div>
  `;
}

function initializeBuilderWorkflows() {
  const definitions = [
    {
      key: 'message',
      label: 'Message draft',
      form: composer,
      capture: () => collectPayload(),
      apply: (snapshot) => applyMessage(snapshot),
      duplicate: (snapshot) => {
        state.currentMessageId = null;
        snapshot.name = `${snapshot.name || 'Untitled message'} copy`;
        applyMessage(snapshot);
      },
    },
    {
      key: 'mailbox',
      label: 'Mailbox draft',
      form: mailboxForm,
      capture: collectMailboxDraft,
      apply: applyMailboxDraft,
    },
    {
      key: 'welcome',
      label: 'Welcome draft',
      form: welcomeMessageForm,
      capture: collectWelcomeMessageSettings,
      apply: applyWelcomeMessageSettings,
      test: (snapshot) => sendAnnouncementTest('welcome', snapshot),
    },
    {
      key: 'creator',
      label: 'Creator notification',
      form: liveEmbedForm,
      capture: () => ({
        kind: state.activeEmbedBuilder,
        settings: collectLiveEmbedSettings(),
      }),
      apply: (snapshot) => {
        activateEmbedBuilder(snapshot.kind || 'live');
        applyLiveEmbedSettings(snapshot.settings || snapshot);
      },
      test: (snapshot) => sendAnnouncementTest(
        snapshot.kind === 'youtube' ? 'youtube' : 'live',
        snapshot.settings || snapshot,
      ),
    },
  ];

  for (const definition of definitions) {
    if (!definition.form || state.builderManagers.has(definition.key)) {
      continue;
    }

    const manager = {
      ...definition,
      history: readBuilderHistory(definition.key),
      undo: [],
      redo: [],
      timer: null,
      applying: false,
      lastSerialized: '',
    };
    const bar = createBuilderWorkflowBar(manager);

    definition.form.prepend(bar);
    manager.bar = bar;
    state.builderManagers.set(definition.key, manager);
    definition.form.addEventListener('input', (event) => scheduleBuilderAutosave(manager, event));
    definition.form.addEventListener('change', (event) => scheduleBuilderAutosave(manager, event));
    renderBuilderWorkflowBar(manager);
  }
}

function createBuilderWorkflowBar(manager) {
  const bar = document.createElement('section');

  bar.className = 'builder-workflow-bar';
  bar.dataset.builderWorkflow = manager.key;
  bar.innerHTML = `
    <div class="builder-workflow-state">
      <span><i class="fa-solid fa-cloud" aria-hidden="true"></i></span>
      <p><strong>${escapeHtml(manager.label)}</strong><small data-builder-status>Ready · browser autosave on</small></p>
    </div>
    <div class="builder-workflow-actions">
      <button class="secondary icon-button" type="button" data-builder-action="undo" aria-label="Undo draft change" title="Undo"><i class="fa-solid fa-rotate-left" aria-hidden="true"></i></button>
      <button class="secondary icon-button" type="button" data-builder-action="redo" aria-label="Redo draft change" title="Redo"><i class="fa-solid fa-rotate-right" aria-hidden="true"></i></button>
      <button class="secondary" type="button" data-builder-action="duplicate"><i class="fa-regular fa-copy" aria-hidden="true"></i> Duplicate</button>
      ${manager.test ? '<button class="secondary" type="button" data-builder-action="test"><i class="fa-solid fa-flask" aria-hidden="true"></i> Send test</button>' : ''}
      <details class="builder-history-menu">
        <summary><i class="fa-solid fa-clock-rotate-left" aria-hidden="true"></i> <span data-builder-history-count>History</span></summary>
        <div data-builder-history-list></div>
      </details>
    </div>
  `;
  bar.addEventListener('click', (event) => handleBuilderWorkflowAction(manager, event));
  return bar;
}

function scheduleBuilderAutosave(manager, event) {
  if (manager.applying || event.target.closest('.builder-workflow-bar')) {
    return;
  }

  window.clearTimeout(manager.timer);
  manager.timer = window.setTimeout(() => captureBuilderVersion(manager), 650);
  const status = manager.bar.querySelector('[data-builder-status]');

  status.textContent = 'Unsaved change · autosaving…';
  manager.bar.classList.add('is-dirty');
}

function captureBuilderVersion(manager, options = {}) {
  if (manager.applying) {
    return;
  }

  const snapshot = cloneData(manager.capture());
  const serialized = JSON.stringify(snapshot);

  if (!options.force && serialized === manager.lastSerialized) {
    manager.bar.classList.remove('is-dirty');
    return;
  }

  if (manager.lastSerialized) {
    const previous = manager.history[0]?.snapshot;

    if (previous) {
      manager.undo.push(cloneData(previous));
      manager.undo = manager.undo.slice(-25);
    }
  }

  const version = {
    id: `${manager.key}-${Date.now()}`,
    createdAt: new Date().toISOString(),
    label: options.label || 'Autosaved draft',
    snapshot,
  };

  manager.lastSerialized = serialized;
  manager.history = [
    version,
    ...manager.history.filter((item) => JSON.stringify(item.snapshot) !== serialized),
  ].slice(0, 15);
  manager.redo = [];
  writeBuilderHistory(manager.key, manager.history);
  manager.bar.classList.remove('is-dirty');
  renderBuilderWorkflowBar(manager);
}

function handleBuilderWorkflowAction(manager, event) {
  const action = event.target.closest('[data-builder-action]');
  const version = event.target.closest('[data-builder-version]');

  if (version) {
    const selected = manager.history.find((item) => item.id === version.dataset.builderVersion);

    if (selected) {
      applyBuilderSnapshot(manager, selected.snapshot, `Restored ${formatDateTime(selected.createdAt)}`);
      version.closest('details')?.removeAttribute('open');
    }
    return;
  }

  if (!action) {
    return;
  }

  if (action.dataset.builderAction === 'undo') {
    const snapshot = manager.undo.pop();

    if (snapshot) {
      manager.redo.push(cloneData(manager.capture()));
      applyBuilderSnapshot(manager, snapshot, 'Undid the last draft change');
    }
    return;
  }

  if (action.dataset.builderAction === 'redo') {
    const snapshot = manager.redo.pop();

    if (snapshot) {
      manager.undo.push(cloneData(manager.capture()));
      applyBuilderSnapshot(manager, snapshot, 'Redid the draft change');
    }
    return;
  }

  if (action.dataset.builderAction === 'duplicate') {
    const snapshot = cloneData(manager.capture());

    manager.undo.push(cloneData(snapshot));

    if (manager.duplicate) {
      manager.duplicate(snapshot);
    } else {
      manager.apply(snapshot);
    }

    captureBuilderVersion(manager, { force: true, label: 'Duplicated draft' });
    setSendStatus(`${manager.label} duplicated as a new browser draft.`, 'success');
    return;
  }

  if (action.dataset.builderAction === 'test' && manager.test) {
    action.disabled = true;
    manager.test(cloneData(manager.capture()))
      .catch((error) => setSendStatus(error.message, 'error'))
      .finally(() => {
        action.disabled = false;
      });
  }
}

function applyBuilderSnapshot(manager, snapshot, message) {
  manager.applying = true;

  try {
    manager.apply(cloneData(snapshot));
    manager.lastSerialized = JSON.stringify(manager.capture());
    manager.bar.querySelector('[data-builder-status]').textContent = message;
    manager.bar.classList.remove('is-dirty');
    renderBuilderWorkflowBar(manager);
  } finally {
    manager.applying = false;
  }
}

function renderBuilderWorkflowBar(manager) {
  const count = manager.bar.querySelector('[data-builder-history-count]');
  const list = manager.bar.querySelector('[data-builder-history-list]');
  const undo = manager.bar.querySelector('[data-builder-action="undo"]');
  const redo = manager.bar.querySelector('[data-builder-action="redo"]');

  count.textContent = `History ${manager.history.length ? `(${manager.history.length})` : ''}`;
  undo.disabled = manager.undo.length === 0;
  redo.disabled = manager.redo.length === 0;
  list.replaceChildren();

  if (manager.history.length === 0) {
    list.innerHTML = '<p>No browser versions yet. They appear as you edit.</p>';
    return;
  }

  for (const version of manager.history) {
    const button = document.createElement('button');

    button.type = 'button';
    button.dataset.builderVersion = version.id;
    button.innerHTML = `<strong>${escapeHtml(version.label)}</strong><small>${escapeHtml(formatDateTime(version.createdAt))}</small>`;
    list.append(button);
  }
}

function markBuilderSaved(key, label = 'Saved to Bean') {
  const manager = state.builderManagers.get(key);

  if (!manager) {
    return;
  }

  captureBuilderVersion(manager, { force: true, label });
  manager.bar.querySelector('[data-builder-status]').textContent = `${label} · browser version kept`;
}

function readBuilderHistory(key) {
  try {
    const items = JSON.parse(window.localStorage.getItem(`bean_dashboard_versions_${key}`) || '[]');
    return Array.isArray(items) ? items.slice(0, 15) : [];
  } catch {
    return [];
  }
}

function writeBuilderHistory(key, history) {
  try {
    window.localStorage.setItem(`bean_dashboard_versions_${key}`, JSON.stringify(history.slice(0, 15)));
  } catch {
    // Server saves remain available when browser storage is full or blocked.
  }
}

function collectMailboxDraft() {
  return {
    channelId: mailboxChannelInput.value,
    postType: mailboxTypeInput.value,
    title: mailboxTitleInput.value,
    body: mailboxBodyInput.value,
    note: mailboxNoteInput.value,
    color: mailboxColorInput.value,
    image: state.mailboxImage,
    allowMentions: mailboxAllowMentionsInput.checked,
    scheduledAt: mailboxScheduleAtInput.value,
    buttons: [...mailboxButtonsContainer.querySelectorAll('.mailbox-link-button')].map((block) => ({
      label: block.querySelector('.mailbox-button-label').value,
      emoji: block.querySelector('.mailbox-button-emoji').value,
      url: block.querySelector('.mailbox-button-url').value,
    })),
  };
}

function applyMailboxDraft(draft) {
  mailboxForm.reset();
  setChannelSelectValue(mailboxChannelInput, draft.channelId || '');
  mailboxTypeInput.value = draft.postType || 'Update';
  mailboxTitleInput.value = draft.title || '';
  mailboxBodyInput.value = draft.body || '';
  mailboxNoteInput.value = draft.note || '';
  mailboxColorInput.value = normalizeMessageColor(draft.color) || '#8FA1BE';
  mailboxColorPicker.value = mailboxColorInput.value;
  mailboxAllowMentionsInput.checked = Boolean(draft.allowMentions);
  mailboxScheduleAtInput.value = draft.scheduledAt || toLocalDateTimeValue(new Date(Date.now() + 60 * 60 * 1000));
  state.mailboxImage = draft.image || null;
  mailboxButtonsContainer.replaceChildren();
  (draft.buttons || []).forEach((button) => addMailboxLinkButton(button));
  updateMailboxButtonLimit();
  updateMailboxPreview();
}

async function sendAnnouncementTest(type, settings) {
  const channelId = String(settings.channelId || '').trim();

  if (!channelId) {
    throw new Error('Choose a destination channel before sending a test.');
  }

  const result = await api('/api/test-announcement', {
    method: 'POST',
    body: { type, channelId, settings },
  });
  const link = result.url ? ` ${result.url}` : '';

  setSendStatus(`${capitalizeDashboardText(type)} test sent without pinging members or roles.${link}`, 'success');
}

function initializeWorkspaceNavigation() {
  Object.entries(contextWorkspaceDefinitions).forEach(([group, definition]) => {
    const switcher = `
      <nav class="context-switcher" data-workspace-switcher="${group}" aria-label="${definition.label} tools">
        <button class="context-switcher-home" type="button" data-tab-link="${group}">
          <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
          <span><small>Back to</small><strong>${definition.label}</strong></span>
        </button>
        <div class="context-switcher-options">
          ${definition.items.map((item) => `
            <button type="button" data-tab-link="${item.tab}">
              <i class="${item.icon}" aria-hidden="true"></i>
              <span>${item.label}</span>
            </button>
          `).join('')}
        </div>
      </nav>
    `;

    definition.panels.forEach((panelName) => {
      document.querySelector(`[data-panel="${panelName}"]`)?.insertAdjacentHTML('afterbegin', switcher);
    });
  });
}

function handleDashboardNavigationClick(event) {
  const detailClose = event.target.closest('[data-detail-drawer-close]');

  if (detailClose) {
    closeDetailDrawer(detailClose.dataset.detailDrawerClose);
    return;
  }

  const createLauncher = event.target.closest('[data-create-launcher]');

  if (createLauncher && dashboardView.contains(createLauncher)) {
    setActiveTab('messages');
    return;
  }

  const link = event.target.closest('[data-tab-link]');

  if (!link || !dashboardView.contains(link)) {
    return;
  }

  setActiveTab(link.dataset.tabLink);

  if (link.dataset.embedBuilderLink) {
    activateEmbedBuilder(link.dataset.embedBuilderLink);
  }
}

function handlePrimaryTabClick(button) {
  setActiveTab(button.dataset.tab);
}

function initializeJournal() {
  journalDate.textContent = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());
}

function initializeInterfacePreferences() {
  const preferences = readInterfacePreferences();

  state.activityType = String(preferences.activityType || '');
  activityFilterButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.activityType === state.activityType);
  });

  if (preferences.analyticsRange && [...analyticsRangeInput.options].some((option) => option.value === preferences.analyticsRange)) {
    analyticsRangeInput.value = preferences.analyticsRange;
  }

  caseSearchInput.value = String(preferences.caseSearch || '');
  setRememberedSelectValue(caseActionFilter, preferences.caseAction);
  setRememberedSelectValue(caseStatusFilter, preferences.caseStatus);
  setRememberedSelectValue(caseDateFilter, preferences.caseDate);
  document.body.classList.toggle('compact-density', Boolean(preferences.compactDensity));
  densityToggle?.setAttribute('aria-pressed', String(Boolean(preferences.compactDensity)));
}

function toggleInterfaceDensity() {
  const compact = !document.body.classList.contains('compact-density');

  document.body.classList.toggle('compact-density', compact);
  densityToggle.setAttribute('aria-pressed', String(compact));
  writeInterfacePreferences({ compactDensity: compact });
  setSendStatus(compact ? 'Compact dashboard density enabled.' : 'Cozy dashboard density restored.', 'success');
}

function handleRememberedCaseFilters() {
  writeInterfacePreferences({
    caseSearch: caseSearchInput.value,
    caseAction: caseActionFilter.value,
    caseStatus: caseStatusFilter.value,
    caseDate: caseDateFilter.value,
  });
  renderModerationCases();
}

function setRememberedSelectValue(select, value) {
  if (value && [...select.options].some((option) => option.value === value)) {
    select.value = value;
  }
}

function readInterfacePreferences() {
  try {
    const preferences = JSON.parse(window.localStorage.getItem(interfacePreferenceStorageKey) || '{}');
    return preferences && typeof preferences === 'object' ? preferences : {};
  } catch {
    return {};
  }
}

function writeInterfacePreferences(patch) {
  try {
    const next = { ...readInterfacePreferences(), ...patch };
    window.localStorage.setItem(interfacePreferenceStorageKey, JSON.stringify(next));
  } catch {
    // Preferences are optional when browser storage is unavailable.
  }
}

function showLogin() {
  dashboardView.hidden = true;
  loginView.hidden = false;
  document.body.classList.add('login-active');
  document.body.classList.remove('dashboard-active');
  stopInterfaceClock();

  const loginErrorCode = new URLSearchParams(window.location.search).get('loginError');
  const loginMessages = {
    oauth: 'Discord login could not be completed. Please try again.',
    'oauth-disabled': 'Discord login has not been configured for this dashboard.',
    access: 'Your Discord roles do not grant dashboard access.',
  };

  if (loginMessages[loginErrorCode]) {
    loginError.textContent = loginMessages[loginErrorCode];
    window.history.replaceState({}, '', '/');
  }
}

function showDashboard(session) {
  loginView.hidden = true;
  dashboardView.hidden = false;
  document.body.classList.remove('login-active');
  document.body.classList.add('dashboard-active');
  startInterfaceClock();
  setGuildName(session?.guildName);
  state.session = session;
  renderSessionIdentity(session);
  applySessionPermissions(session?.permissions);
  setBotStatus(Boolean(session?.botReady), session?.tag);
  setActiveTab(getActiveTab());
  renderSavedMessages();
  loadDiscordChannels().catch((error) => setSendStatus(error.message, 'error'));
  loadSavedMessages().catch((error) => setSendStatus(error.message, 'error'));
  refreshBotSettings().catch((error) => setSendStatus(error.message, 'error'));
  loadModerationCases(false).catch(() => {
    overviewOpenCases.textContent = 'Unavailable';
  });
  loadDashboardHealth(false).catch(() => null);
  loadActivityFeed(false).catch(() => null);
  startDashboardNotifications();
  loadFeatureConfiguration(false).catch((error) => setSendStatus(error.message, 'error'));

  if (!state.composerInitialized) {
    resetComposer();
    state.composerInitialized = true;
  }
}

function setBotStatus(isReady, tag) {
  const overviewText = isReady ? `Online${tag ? `: ${tag}` : ''}` : 'Bot not ready';

  botStatus.textContent = isReady ? 'Bean online' : 'Bean offline';
  overviewBotStatus.textContent = overviewText;
  botStatus.classList.toggle('ready', isReady);
  botStatus.classList.toggle('offline', !isReady);
}

function renderSessionIdentity(session) {
  const user = session?.user || {};
  const role = session?.permissions?.role || user.role || 'founder';

  sessionName.textContent = user.displayName || user.username || 'Dashboard Founder';
  sessionRole.textContent = `${capitalizeDashboardText(role)} access`;
  sessionAvatar.replaceChildren();

  if (user.avatarUrl) {
    const image = document.createElement('img');

    image.src = user.avatarUrl;
    image.alt = '';
    sessionAvatar.append(image);
  } else {
    const icon = document.createElement('i');

    icon.className = 'fa-solid fa-user';
    icon.setAttribute('aria-hidden', 'true');
    sessionAvatar.append(icon);
  }
}

function applySessionPermissions(permissions = {}) {
  document.body.dataset.dashboardRole = permissions.role || 'founder';
  document.querySelectorAll('[data-requires-permission]').forEach((element) => {
    const required = element.dataset.requiresPermission;
    const allowed = Boolean(permissions[required]);

    element.toggleAttribute('disabled', !allowed);
    element.setAttribute('aria-disabled', String(!allowed));
  });

  if (dashboardConfigForm) {
    const canConfigure = permissions.configure !== false;

    setControlsPermission(
      dashboardConfigForm.querySelectorAll('input, select, textarea, button'),
      canConfigure,
    );
    dashboardConfigForm.classList.toggle('is-read-only', !canConfigure);
  }

  setFormPermission(composer, permissions.create !== false);
  setFormPermission(mailboxForm, permissions.create !== false);
  setFormPermission(welcomeMessageForm, permissions.create !== false);
  setFormPermission(liveEmbedForm, permissions.create !== false);
  setFormPermission(caseReasonForm, permissions.moderate !== false);
  setFormPermission(caseRevokeForm, permissions.moderate !== false);
  setFormPermission(voiceRoomSettingsForm, permissions.moderate !== false);
  setFormPermission(auditLogSettingsForm, permissions.configure !== false);
  featureChannelSettingsForms.forEach((form) => {
    setFormPermission(form, permissions.configure !== false);
  });
  setFormPermission(botBioForm, permissions.configure !== false);
  setFormPermission(botPresenceForm, permissions.configure !== false);
  saveBotAvatarButton.disabled = permissions.configure === false;
  saveBotBannerButton.disabled = permissions.configure === false;
  renderFeaturePageAvailability();
}

function setFormPermission(form, allowed) {
  if (!form) {
    return;
  }

  form.classList.toggle('is-read-only', !allowed);
  setControlsPermission(form.querySelectorAll('input, select, textarea, button'), allowed);
}

function setControlsPermission(controls, allowed) {
  controls.forEach((control) => {
    if (!allowed) {
      control.dataset.permissionDisabled = 'true';
      control.disabled = true;
      return;
    }

    if (control.dataset.permissionDisabled === 'true') {
      control.disabled = control.dataset.featureDisabled === 'true';
      delete control.dataset.permissionDisabled;
    }
  });
}

function startInterfaceClock() {
  updateInterfaceClock();

  if (!state.interfaceClockTimer) {
    state.interfaceClockTimer = window.setInterval(updateInterfaceClock, 30_000);
  }
}

function stopInterfaceClock() {
  if (!state.interfaceClockTimer) {
    return;
  }

  window.clearInterval(state.interfaceClockTimer);
  state.interfaceClockTimer = null;
}

function updateInterfaceClock() {
  const now = new Date();

  dashboardClock.textContent = new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(now);
}

async function loadDashboardHealth(showNotification = false) {
  const result = await api('/api/dashboard-health');

  state.health = result;
  renderDashboardHealth();

  if (showNotification) {
    setSendStatus('Bot health refreshed.', 'success');
  }
}

function renderDashboardHealth() {
  const health = state.health;

  if (!health) {
    return;
  }

  const healthy = health.discord?.ready && health.api?.healthy;
  healthStatus.classList.remove('ready', 'offline');
  healthStatus.classList.add(healthy ? 'ready' : 'offline');
  healthStatus.textContent = healthy ? 'All systems cozy' : 'Needs attention';
  healthUptime.textContent = formatHealthUptime(health.runtime?.uptimeSeconds || 0);
  healthLatency.textContent = Number.isFinite(health.discord?.latencyMs)
    ? `${health.discord.latencyMs} ms`
    : 'Unavailable';
  healthApi.textContent = health.api?.healthy ? 'Healthy' : 'Unavailable';
  healthErrorCount.textContent = Number(health.summary?.recentErrors || 0).toLocaleString();
  renderHealthStorage(health.storage || []);
  renderHealthErrors(health.errors || []);
}

function renderHealthStorage(stores) {
  const persistent = stores.filter((store) => store.persistent).length;
  const available = stores.filter((store) => store.available).length;

  healthStorageSummary.textContent = `${persistent}/${stores.length} persistent · ${available} available`;
  healthStorageList.replaceChildren();

  for (const store of stores) {
    const item = document.createElement('div');
    const name = document.createElement('span');
    const stateBadge = document.createElement('span');

    item.className = 'health-storage-item';
    name.textContent = store.name;
    stateBadge.className = `storage-state ${store.persistent ? 'persistent' : 'ephemeral'}`;
    stateBadge.textContent = store.available
      ? (store.persistent ? 'Persistent' : 'Temporary')
      : 'Unavailable';
    stateBadge.title = `${store.source || 'Unknown source'}${store.filePath ? ` · ${store.filePath}` : ''}`;
    item.append(name, stateBadge);
    healthStorageList.append(item);
  }
}

function renderHealthErrors(errors) {
  healthErrorList.replaceChildren();

  if (errors.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'health-empty';
    empty.innerHTML = '<i class="fa-solid fa-mug-hot" aria-hidden="true"></i><span>No recent errors. Bean is doing just fine.</span>';
    healthErrorList.append(empty);
    return;
  }

  for (const error of errors.slice(0, 10)) {
    const item = document.createElement('article');
    const title = document.createElement('strong');
    const message = document.createElement('p');
    const time = document.createElement('p');

    item.className = 'health-error-item';
    title.textContent = error.source;
    message.textContent = error.message;
    time.textContent = formatDashboardCaseDateTime(error.createdAt);
    item.append(title, message, time);
    healthErrorList.append(item);
  }
}

function formatHealthUptime(seconds) {
  const total = Math.max(0, Number(seconds) || 0);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);

  if (days) return `${days}d ${hours}h`;
  if (hours) return `${hours}h ${minutes}m`;
  if (minutes) return `${minutes}m`;
  return `${Math.floor(total)}s`;
}

async function loadActivityFeed(showNotification = false) {
  const query = state.activityType ? `?type=${encodeURIComponent(state.activityType)}&limit=100` : '?limit=100';
  const result = await api(`/api/activity-feed${query}`);

  state.activityItems = Array.isArray(result.items) ? result.items : [];
  state.activityStorage = result.storage || null;
  renderActivityFeed();

  if (showNotification) {
    setSendStatus('Activity feed refreshed.', 'success');
  }
}

function renderActivityFeed() {
  const storage = state.activityStorage;

  activityStorageStatus.classList.remove('ready', 'offline');
  activityStorageStatus.textContent = storage?.persistent ? 'Activity saved' : 'Activity is temporary';
  activityStorageStatus.classList.add(storage?.persistent ? 'ready' : 'offline');
  activityFeed.replaceChildren();

  if (state.activityItems.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'activity-empty';
    empty.innerHTML = '<i class="fa-solid fa-seedling" aria-hidden="true"></i><span>No activity in this category yet.</span>';
    activityFeed.append(empty);
    return;
  }

  for (const activity of state.activityItems) {
    const item = document.createElement('article');
    const icon = document.createElement('span');
    const copy = document.createElement('div');
    const title = document.createElement('strong');
    const summary = document.createElement('p');
    const time = document.createElement('time');

    item.className = 'activity-item';
    icon.className = `activity-icon ${activity.type}`;
    icon.innerHTML = `<i class="fa-solid ${getActivityIcon(activity.type)}" aria-hidden="true"></i>`;
    copy.className = 'activity-copy';
    title.textContent = activity.title;
    summary.textContent = activity.summary || activity.details?.[0] || 'Bean recorded this action.';
    time.dateTime = activity.createdAt;
    time.textContent = formatDashboardCaseDateTime(activity.createdAt);
    copy.append(title, summary, time);
    item.append(icon, copy);
    activityFeed.append(item);
  }
}

function getActivityIcon(type) {
  return {
    join: 'fa-user-plus',
    leave: 'fa-user-minus',
    moderation: 'fa-shield-halved',
    mailbox: 'fa-envelope-open-text',
    voice: 'fa-headphones',
  }[type] || 'fa-bolt';
}

function startOverviewSync() {
  if (state.overviewRefreshTimer) {
    return;
  }

  state.overviewRefreshTimer = window.setInterval(() => {
    if (document.hidden || dashboardView.hidden || getActiveTab() !== 'overview') {
      return;
    }

    loadDashboardHealth(false).catch(() => null);
    loadActivityFeed(false).catch(() => null);
  }, 15000);
}

function stopOverviewSync() {
  if (!state.overviewRefreshTimer) {
    return;
  }

  window.clearInterval(state.overviewRefreshTimer);
  state.overviewRefreshTimer = null;
}

async function handleMemberSearch(event) {
  event.preventDefault();
  const query = memberSearchInput.value.trim();

  if (query && query.length < 2 && !/^\d{17,20}$/.test(query)) {
    setSendStatus('Use at least two characters when searching for a member.', 'error');
    return;
  }

  memberSearchButton.disabled = true;
  memberResultCount.textContent = 'Searching';
  renderLoadingSkeleton(memberSearchResults, 4);

  try {
    const result = await api(`/api/member-profiles?query=${encodeURIComponent(query)}`);

    state.memberSearchResults = Array.isArray(result.members) ? result.members : [];
    renderMemberSearchResults();

    if (state.memberSearchResults.length === 1) {
      await loadMemberProfile(state.memberSearchResults[0].id);
    }
  } catch (error) {
    memberResultCount.textContent = 'Unavailable';
    setSendStatus(error.message, 'error');
  } finally {
    memberSearchButton.disabled = false;
  }
}

function renderMemberSearchResults() {
  memberSearchResults.replaceChildren();
  memberResultCount.textContent = `${state.memberSearchResults.length} found`;

  if (state.memberSearchResults.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'member-empty-state';
    empty.innerHTML = '<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i><span>No matching members found.</span>';
    memberSearchResults.append(empty);
    return;
  }

  for (const member of state.memberSearchResults) {
    const button = document.createElement('button');
    const avatar = createMemberAvatar(member.avatarUrl, member.displayName);
    const copy = document.createElement('span');
    const name = document.createElement('strong');
    const username = document.createElement('small');
    const badges = document.createElement('span');

    button.type = 'button';
    button.className = 'member-result';
    button.classList.toggle('active', member.id === state.selectedMemberId);
    button.dataset.memberId = member.id;
    copy.className = 'member-result-copy';
    name.textContent = member.displayName;
    username.textContent = `@${member.username} · ${member.id}`;
    badges.className = 'member-result-badges';
    badges.textContent = `${member.caseCount} cases · ${member.warningCount} warnings`;
    copy.append(name, username, badges);
    button.append(avatar, copy);
    memberSearchResults.append(button);
  }
}

function handleMemberResultClick(event) {
  const button = event.target.closest('[data-member-id]');

  if (!button) {
    return;
  }

  loadMemberProfile(button.dataset.memberId).catch((error) => setSendStatus(error.message, 'error'));
}

async function loadMemberProfile(memberId) {
  state.selectedMemberId = memberId;
  renderMemberSearchResults();
  memberProfileEmpty.hidden = true;
  memberProfileContent.hidden = false;
  memberProfilePanel?.classList.add('is-drawer-open');
  memberProfileName.textContent = 'Gathering member history…';
  memberProfileUsername.textContent = memberId;

  const result = await api(`/api/member-profiles/${encodeURIComponent(memberId)}`);

  state.memberProfile = result.profile;
  renderMemberProfile();
}

function renderMemberProfile() {
  const profile = state.memberProfile;

  if (!profile) {
    return;
  }

  memberProfileName.textContent = profile.displayName;
  memberProfileUsername.textContent = `@${profile.username} · ${profile.id}`;
  memberProfileStatus.textContent = profile.inServer ? 'Current server member' : 'Stored member history';
  memberProfilePresence.textContent = profile.voiceChannel
    ? `In ${profile.voiceChannel}`
    : formatMemberPresence(profile.presence, profile.inServer);
  memberProfilePresence.classList.toggle('ready', ['online', 'idle', 'dnd'].includes(profile.presence));
  memberProfileAvatar.hidden = !profile.avatarUrl;
  memberProfileAvatarFallback.hidden = Boolean(profile.avatarUrl);

  if (profile.avatarUrl) {
    memberProfileAvatar.src = profile.avatarUrl;
    memberProfileAvatar.alt = `${profile.displayName}'s avatar`;
  } else {
    memberProfileAvatar.removeAttribute('src');
  }

  renderMemberProfileMetrics(profile);
  renderMemberProfileFacts(profile);
  renderMemberHistory(
    memberJoinHistory,
    profile.joins,
    (item) => ({
      icon: item.type === 'join' ? 'fa-right-to-bracket' : 'fa-right-from-bracket',
      title: item.type === 'join' ? 'Joined the server' : 'Left the server',
      detail: item.summary,
      time: item.createdAt,
    }),
    'No recorded join history yet.',
  );
  renderMemberHistory(
    memberModerationHistory,
    profile.moderation,
    (item) => ({
      icon: getModerationActionIcon(item.action),
      title: `${item.reference} · ${capitalizeDashboardText(item.action)}`,
      detail: `${item.reason} · ${capitalizeDashboardText(item.status)}`,
      time: item.createdAt,
    }),
    'No moderation cases or warnings.',
  );
  const currentRooms = (profile.currentRooms || []).map((room) => ({
    current: true,
    title: room.name,
    summary: `${room.memberCount} listening now`,
    createdAt: room.createdAt,
  }));
  renderMemberHistory(
    memberRoomHistory,
    [...currentRooms, ...(profile.roomHistory || [])],
    (item) => ({
      icon: item.current ? 'fa-volume-high' : getActivityIcon('voice'),
      title: item.current ? item.title : item.title,
      detail: item.current ? item.summary : item.summary,
      time: item.createdAt,
      badge: item.current ? 'Active' : '',
    }),
    'No temporary rooms recorded.',
  );
  renderMemberHistory(
    memberInteractionHistory,
    profile.interactions,
    (item) => ({
      icon: 'fa-terminal',
      title: item.title,
      detail: item.summary,
      time: item.createdAt,
    }),
    'No recent Bean command interactions.',
  );
}

function renderMemberProfileMetrics(profile) {
  const metrics = [
    ['fa-shield-halved', 'Cases', profile.metrics.cases],
    ['fa-triangle-exclamation', 'Warnings', profile.metrics.warnings],
    ['fa-headphones', 'Rooms', profile.metrics.roomsCreated],
    ['fa-wand-magic-sparkles', 'Interactions', profile.metrics.interactions],
  ];

  memberProfileMetrics.replaceChildren();

  for (const [icon, label, value] of metrics) {
    const card = document.createElement('article');
    card.innerHTML = `<i class="fa-solid ${icon}" aria-hidden="true"></i>`;
    const copy = document.createElement('span');
    const strong = document.createElement('strong');
    const small = document.createElement('small');
    strong.textContent = Number(value || 0).toLocaleString();
    small.textContent = label;
    copy.append(strong, small);
    card.append(copy);
    memberProfileMetrics.append(card);
  }
}

function renderMemberProfileFacts(profile) {
  const facts = [
    ['Joined', profile.joinedAt ? formatDashboardCaseDateTime(profile.joinedAt) : 'Unknown'],
    ['Account created', profile.accountCreatedAt ? formatDashboardCaseDateTime(profile.accountCreatedAt) : 'Unknown'],
    ['Roles', profile.roles?.length ? profile.roles.join(', ') : 'No assigned roles'],
    ['Voice', profile.voiceChannel || 'Not connected'],
  ];

  memberProfileFacts.replaceChildren();

  for (const [label, value] of facts) {
    const item = document.createElement('div');
    const strong = document.createElement('strong');
    const span = document.createElement('span');
    strong.textContent = label;
    span.textContent = value;
    item.append(strong, span);
    memberProfileFacts.append(item);
  }
}

function renderMemberHistory(container, items, transform, emptyMessage) {
  container.replaceChildren();

  if (!items?.length) {
    const empty = document.createElement('p');
    empty.className = 'member-history-empty';
    empty.textContent = emptyMessage;
    container.append(empty);
    return;
  }

  for (const source of items.slice(0, 12)) {
    const data = transform(source);
    const item = document.createElement('article');
    const icon = document.createElement('span');
    const copy = document.createElement('div');
    const heading = document.createElement('div');
    const title = document.createElement('strong');
    const detail = document.createElement('p');
    const time = document.createElement('time');

    item.className = 'member-history-item';
    icon.innerHTML = `<i class="fa-solid ${data.icon}" aria-hidden="true"></i>`;
    title.textContent = data.title;
    detail.textContent = data.detail || 'Bean recorded this activity.';
    time.textContent = data.time ? formatDashboardCaseDateTime(data.time) : '';
    heading.append(title);

    if (data.badge) {
      const badge = document.createElement('small');
      badge.textContent = data.badge;
      heading.append(badge);
    }

    copy.append(heading, detail, time);
    item.append(icon, copy);
    container.append(item);
  }
}

function createMemberAvatar(url, displayName) {
  if (url) {
    const image = document.createElement('img');
    image.className = 'member-result-avatar';
    image.src = url;
    image.alt = '';
    return image;
  }

  const fallback = document.createElement('span');
  fallback.className = 'member-result-avatar member-result-avatar-fallback';
  fallback.textContent = String(displayName || '?').slice(0, 1).toUpperCase();
  return fallback;
}

function formatMemberPresence(presence, inServer) {
  if (!inServer) return 'No longer in server';
  return {
    online: 'Online',
    idle: 'Idle',
    dnd: 'Do not disturb',
    offline: 'Offline',
  }[presence] || 'Presence unavailable';
}

function getModerationActionIcon(action) {
  return {
    warn: 'fa-triangle-exclamation',
    timeout: 'fa-clock',
    kick: 'fa-person-walking-arrow-right',
    ban: 'fa-ban',
  }[action] || 'fa-shield-halved';
}

async function loadDashboardAnalytics(showNotification = false) {
  refreshAnalyticsButton.disabled = true;

  try {
    const query = new URLSearchParams({
      days: analyticsRangeInput.value,
      timezoneOffset: String(new Date().getTimezoneOffset()),
    });
    const result = await api(`/api/analytics?${query}`);
    state.analytics = result.analytics;
    renderDashboardAnalytics();

    if (showNotification) {
      setSendStatus('Community analytics refreshed.', 'success');
    }
  } finally {
    refreshAnalyticsButton.disabled = false;
  }
}

function renderDashboardAnalytics() {
  const analytics = state.analytics;

  if (!analytics) return;

  const netGrowth = analytics.joinLeave.joins - analytics.joinLeave.leaves;
  analyticsActiveMembers.textContent = analytics.members.activeInRange.toLocaleString();
  analyticsActiveCaption.textContent = `of ${analytics.members.total.toLocaleString()} members active in ${analytics.days} days`;
  analyticsNetGrowth.textContent = `${netGrowth >= 0 ? '+' : ''}${netGrowth.toLocaleString()}`;
  analyticsGrowthCaption.textContent = `${analytics.joinLeave.joins} joined · ${analytics.joinLeave.leaves} left`;
  analyticsVoicePeak.textContent = analytics.voice.sessions
    ? formatAnalyticsHour(analytics.voice.busiest.hour)
    : 'No data';
  analyticsVoiceCaption.textContent = `${analytics.voice.sessions.toLocaleString()} voice joins recorded`;
  analyticsMailboxReactions.textContent = analytics.mailbox.engagement.available
    ? analytics.mailbox.engagement.reactions.toLocaleString()
    : 'Unavailable';
  analyticsMailboxCaption.textContent = `${analytics.mailbox.published} published · ${analytics.mailbox.failed} failed`;
  analyticsGrowthTotal.textContent = `${netGrowth >= 0 ? '+' : ''}${netGrowth} net`;
  analyticsModerationTotal.textContent = `${analytics.moderation.total} cases`;
  analyticsPresenceStatus.textContent = analytics.members.presenceAvailable ? 'Presence connected' : 'Presence intent off';
  analyticsPresenceStatus.classList.toggle('ready', analytics.members.presenceAvailable);
  analyticsMailboxStatus.textContent = analytics.mailbox.engagement.available ? 'Reactions connected' : 'History unavailable';
  analyticsMailboxStatus.classList.toggle('ready', analytics.mailbox.engagement.available);

  renderAnalyticsGrowthChart(analytics.joinLeave.daily);
  renderAnalyticsVoiceChart(analytics.voice.hours);
  renderAnalyticsModeration(analytics.moderation);
  renderAnalyticsBreakdown(analyticsMemberBreakdown, [
    ['fa-users', 'Total members', analytics.members.total],
    ['fa-circle', 'Online now', analytics.members.presenceAvailable ? analytics.members.online : 'Intent off'],
    ['fa-headphones', 'In voice now', analytics.members.inVoice],
    ['fa-bolt', `Active in ${analytics.days} days`, analytics.members.activeInRange],
  ]);
  renderAnalyticsBreakdown(analyticsMailboxBreakdown, [
    ['fa-paper-plane', 'Published', analytics.mailbox.published],
    ['fa-calendar-check', 'Scheduled', analytics.mailbox.scheduled],
    ['fa-triangle-exclamation', 'Failed', analytics.mailbox.failed],
    ['fa-heart', 'Reacted posts', analytics.mailbox.engagement.available
      ? analytics.mailbox.engagement.reactedMessages
      : 'Unavailable'],
  ]);
}

function renderAnalyticsGrowthChart(daily) {
  analyticsGrowthChart.replaceChildren();
  const maximum = Math.max(1, ...daily.flatMap((item) => [item.joins, item.leaves]));
  const labelInterval = Math.max(1, Math.ceil(daily.length / 8));

  daily.forEach((day, index) => {
    const group = document.createElement('div');
    const bars = document.createElement('div');
    const join = document.createElement('span');
    const leave = document.createElement('span');
    const label = document.createElement('small');

    group.className = 'analytics-day-group';
    bars.className = 'analytics-day-bars';
    join.className = 'join-bar';
    leave.className = 'leave-bar';
    join.style.height = `${day.joins ? Math.max(7, day.joins / maximum * 100) : 2}%`;
    leave.style.height = `${day.leaves ? Math.max(7, day.leaves / maximum * 100) : 2}%`;
    join.title = `${day.date}: ${day.joins} joins`;
    leave.title = `${day.date}: ${day.leaves} leaves`;
    label.textContent = index % labelInterval === 0 || index === daily.length - 1
      ? new Date(`${day.date}T12:00:00`).toLocaleDateString([], { month: 'short', day: 'numeric' })
      : '';
    bars.append(join, leave);
    group.append(bars, label);
    analyticsGrowthChart.append(group);
  });
}

function renderAnalyticsVoiceChart(hours) {
  analyticsVoiceChart.replaceChildren();
  const maximum = Math.max(1, ...hours.map((item) => item.count));

  for (const hour of hours) {
    const group = document.createElement('div');
    const bar = document.createElement('span');
    const label = document.createElement('small');

    group.className = 'analytics-hour-group';
    bar.style.height = `${hour.count ? Math.max(6, hour.count / maximum * 100) : 2}%`;
    bar.title = `${formatAnalyticsHour(hour.hour)}: ${hour.count} joins`;
    label.textContent = hour.hour % 3 === 0 ? String(hour.hour).padStart(2, '0') : '';
    group.append(bar, label);
    analyticsVoiceChart.append(group);
  }
}

function renderAnalyticsModeration(moderation) {
  analyticsModerationPatterns.replaceChildren();
  const maximum = Math.max(1, ...moderation.actions.map((item) => item.count));

  for (const item of moderation.actions) {
    const row = document.createElement('div');
    const heading = document.createElement('div');
    const label = document.createElement('span');
    const count = document.createElement('strong');
    const track = document.createElement('span');
    const bar = document.createElement('span');

    row.className = 'analytics-pattern-row';
    label.textContent = capitalizeDashboardText(item.action);
    count.textContent = item.count.toLocaleString();
    track.className = 'analytics-pattern-track';
    bar.style.width = `${item.count / maximum * 100}%`;
    heading.append(label, count);
    track.append(bar);
    row.append(heading, track);
    analyticsModerationPatterns.append(row);
  }

  const note = document.createElement('p');
  note.className = 'analytics-pattern-note';
  note.textContent = `${moderation.repeatMembers} repeat members · ${moderation.activeCases} active cases overall`;
  analyticsModerationPatterns.append(note);
}

function renderAnalyticsBreakdown(container, values) {
  container.replaceChildren();

  for (const [iconName, label, value] of values) {
    const card = document.createElement('article');
    card.innerHTML = `<i class="fa-solid ${iconName}" aria-hidden="true"></i>`;
    const copy = document.createElement('span');
    const small = document.createElement('small');
    const strong = document.createElement('strong');
    small.textContent = label;
    strong.textContent = typeof value === 'number' ? value.toLocaleString() : value;
    copy.append(small, strong);
    card.append(copy);
    container.append(card);
  }
}

function formatAnalyticsHour(hour) {
  return new Date(2026, 0, 1, Number(hour) || 0).toLocaleTimeString([], {
    hour: 'numeric',
  });
}

function startDashboardNotifications() {
  if (state.notificationTimer) {
    return;
  }

  restoreNotificationCenter();
  state.notificationInitialLoad = true;
  state.notificationCursor = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  state.seenNotifications = new Set(state.notifications.map((item) => item.id));
  renderNotificationCenter();
  window.setTimeout(() => pollDashboardNotifications().catch(() => null), 1500);
  state.notificationTimer = window.setInterval(() => {
    if (!document.hidden && !dashboardView.hidden) {
      pollDashboardNotifications().catch(() => null);
    }
  }, 10000);
}

function stopDashboardNotifications() {
  if (state.notificationTimer) {
    window.clearInterval(state.notificationTimer);
  }

  state.notificationTimer = null;
  state.notificationCursor = null;
}

async function pollDashboardNotifications() {
  if (!state.notificationCursor) {
    return;
  }

  const result = await api(
    `/api/dashboard-notifications?after=${encodeURIComponent(state.notificationCursor)}`,
  );
  state.notificationCursor = result.generatedAt || new Date().toISOString();

  const incoming = result.notifications || [];

  for (const notification of incoming) {
    if (state.seenNotifications.has(notification.id)) {
      continue;
    }

    state.seenNotifications.add(notification.id);
    state.notifications.unshift(notification);

    if (!state.notificationInitialLoad) {
      showDashboardNotification(notification);
    }
  }

  state.notificationInitialLoad = false;
  state.notifications = state.notifications
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    .slice(0, 100);
  persistNotificationCenter();
  renderNotificationCenter();
}

function showDashboardNotification(notification) {
  const toast = document.createElement('section');
  const icon = document.createElement('span');
  const copy = document.createElement('div');
  const title = document.createElement('strong');
  const message = document.createElement('p');
  const actions = document.createElement('div');
  const open = document.createElement('button');
  const close = document.createElement('button');

  toast.className = `toast live-notification ${notification.type || 'info'}`;
  toast.setAttribute('role', 'status');
  icon.className = 'live-notification-icon';
  icon.innerHTML = `<i class="fa-solid ${getNotificationIcon(notification.type)}" aria-hidden="true"></i>`;
  title.textContent = notification.title;
  message.textContent = notification.message;
  copy.append(title, message);
  actions.className = 'live-notification-actions';
  open.type = 'button';
  open.className = 'secondary';
  open.textContent = 'Take a look';
  open.addEventListener('click', () => {
    setActiveTab(notification.tab || 'overview');
    dismissToast(toast);
  });
  close.type = 'button';
  close.className = 'toast-close';
  close.setAttribute('aria-label', 'Dismiss notification');
  close.textContent = 'Close';
  close.addEventListener('click', () => dismissToast(toast));
  actions.append(open);
  toast.append(icon, copy, actions, close);
  toastRegion.append(toast);
  window.setTimeout(() => dismissToast(toast), notification.type === 'error' ? 12000 : 9000);
}

function getNotificationIcon(type) {
  return {
    case: 'fa-shield-halved',
    mailbox: 'fa-envelope-open-text',
    error: 'fa-triangle-exclamation',
    joins: 'fa-user-group',
  }[type] || 'fa-bell';
}

function openNotificationCenter() {
  notificationCenter.hidden = false;
  notificationTrigger.setAttribute('aria-expanded', 'true');
  document.body.classList.add('notification-center-open');
  renderNotificationCenter();
}

function closeNotificationCenter() {
  if (notificationCenter.hidden) {
    return;
  }

  notificationCenter.hidden = true;
  notificationTrigger.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('notification-center-open');
  notificationTrigger.focus();
}

function handleNotificationCenterClick(event) {
  const action = event.target.closest('[data-notification-id]');

  if (!action) {
    return;
  }

  const notification = state.notifications.find((item) => item.id === action.dataset.notificationId);

  if (!notification) {
    return;
  }

  state.readNotifications.add(notification.id);
  persistNotificationCenter();
  renderNotificationCenter();
  setActiveTab(notification.tab || 'overview');
  closeNotificationCenter();
}

function markAllNotificationsRead() {
  state.notifications.forEach((notification) => state.readNotifications.add(notification.id));
  persistNotificationCenter();
  renderNotificationCenter();
}

function renderNotificationCenter() {
  if (!notificationCenterList) {
    return;
  }

  const unread = state.notifications.filter((item) => !state.readNotifications.has(item.id));
  notificationBadge.hidden = unread.length === 0;
  notificationBadge.textContent = unread.length > 99 ? '99+' : String(unread.length);
  notificationCenterSummary.textContent = unread.length
    ? `${unread.length} unread notification${unread.length === 1 ? '' : 's'}`
    : 'You are all caught up';
  markNotificationsReadButton.disabled = unread.length === 0;
  notificationCenterList.replaceChildren();

  if (state.notifications.length === 0) {
    notificationCenterList.innerHTML = `
      <div class="notification-center-empty">
        <span><i class="fa-solid fa-mug-hot" aria-hidden="true"></i></span>
        <strong>The room is quiet</strong>
        <p>Cases, publishing failures, bot errors, and unusual activity will collect here.</p>
      </div>
    `;
    return;
  }

  for (const notification of state.notifications) {
    const button = document.createElement('button');
    const unreadClass = state.readNotifications.has(notification.id) ? '' : ' unread';

    button.type = 'button';
    button.className = `notification-center-item ${notification.type || 'info'}${unreadClass}`;
    button.dataset.notificationId = notification.id;
    button.innerHTML = `
      <span class="notification-center-icon"><i class="fa-solid ${getNotificationIcon(notification.type)}" aria-hidden="true"></i></span>
      <span class="notification-center-copy">
        <strong>${escapeHtml(notification.title)}</strong>
        <span>${escapeHtml(notification.message)}</span>
        <small>${escapeHtml(formatDateTime(notification.createdAt))}</small>
      </span>
      <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
    `;
    notificationCenterList.append(button);
  }
}

function restoreNotificationCenter() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(notificationStorageKey) || '[]');
    const read = JSON.parse(window.localStorage.getItem(notificationReadStorageKey) || '[]');

    state.notifications = Array.isArray(saved) ? saved.slice(0, 100) : [];
    state.readNotifications = new Set(Array.isArray(read) ? read : []);
  } catch {
    state.notifications = [];
    state.readNotifications = new Set();
  }
}

function persistNotificationCenter() {
  try {
    window.localStorage.setItem(notificationStorageKey, JSON.stringify(state.notifications.slice(0, 100)));
    window.localStorage.setItem(notificationReadStorageKey, JSON.stringify([...state.readNotifications].slice(-500)));
  } catch {
    // The live in-memory notification center remains available when storage is blocked.
  }
}

async function loadDiscordChannels(force = false) {
  if (state.discordChannelsLoading || (state.discordChannelsLoaded && !force)) {
    return;
  }

  state.discordChannelsLoading = true;

  try {
    const result = await api('/api/channels');

    state.discordChannels = Array.isArray(result.channels) ? result.channels : [];
    state.discordChannelDefaults = result.defaults || {};
    state.discordChannelsLoaded = true;
    state.discordChannelsError = '';
    renderDiscordChannelSelects();
  } catch (error) {
    state.discordChannels = [];
    state.discordChannelsError = error.message;
    renderDiscordChannelSelects();
    throw error;
  } finally {
    state.discordChannelsLoading = false;
  }
}

function renderDiscordChannelSelects() {
  const definitions = [
    [channelInput, ''],
    [mailboxChannelInput, state.discordChannelDefaults.mailbox || ''],
    [welcomeChannelIdInput, state.discordChannelDefaults.welcome || ''],
    [
      liveChannelIdInput,
      state.activeEmbedBuilder === 'youtube'
        ? state.discordChannelDefaults.youtube || ''
        : state.discordChannelDefaults.stream || '',
    ],
  ];

  for (const [select, defaultValue] of definitions) {
    renderDiscordChannelSelect(select, select.value || defaultValue);
  }

  updateMailboxDestination();
}

function renderDiscordChannelSelect(select, selectedValue = '') {
  if (!select) {
    return;
  }

  const placeholder = document.createElement('option');

  placeholder.value = '';
  placeholder.textContent = state.discordChannels.length
    ? 'Select a Discord channel…'
    : state.discordChannelsError
      ? 'Could not load Discord channels'
      : 'No writable Discord channels found';
  select.replaceChildren(placeholder);

  const groups = new Map();

  for (const channel of state.discordChannels) {
    const groupName = channel.parentName || 'Server channels';

    if (!groups.has(groupName)) {
      groups.set(groupName, []);
    }

    groups.get(groupName).push(channel);
  }

  for (const [groupName, channels] of groups) {
    const group = document.createElement('optgroup');

    group.label = groupName;

    for (const channel of channels) {
      const option = document.createElement('option');

      option.value = channel.id;
      option.textContent = `# ${channel.name}`;
      group.append(option);
    }

    select.append(group);
  }

  select.disabled = state.discordChannels.length === 0;
  setChannelSelectValue(select, selectedValue);
  updateChannelSelectAppearance(select);
}

function setChannelSelectValue(select, channelId) {
  if (!select) {
    return;
  }

  const value = String(channelId || '').trim();

  if (!value) {
    select.value = '';
    updateChannelSelectAppearance(select);
    return;
  }

  if (![...select.options].some((option) => option.value === value)) {
    const unavailable = document.createElement('option');

    unavailable.value = value;
    unavailable.textContent = `Unavailable channel · ${value}`;
    unavailable.dataset.unavailable = 'true';
    select.append(unavailable);
  }

  select.value = value;
  select.disabled = false;
  updateChannelSelectAppearance(select);
}

function updateChannelSelectAppearance(select) {
  const shell = select?.closest('.cozy-channel-select');

  if (!shell) {
    return;
  }

  const selectedOption = select.selectedOptions?.[0];

  shell.classList.toggle('has-value', Boolean(select.value));
  shell.classList.toggle('has-unavailable-value', selectedOption?.dataset.unavailable === 'true');
  shell.classList.toggle('is-disabled', select.disabled);
}

function getDiscordChannelLabel(channelId) {
  const channel = state.discordChannels.find((item) => item.id === String(channelId || ''));
  return channel ? `#${channel.name}` : channelId ? `channel ${channelId}` : 'no channel selected';
}

function updateMailboxDestination() {
  if (!mailboxDestination) {
    return;
  }

  mailboxDestination.textContent = mailboxChannelInput?.value
    ? getDiscordChannelLabel(mailboxChannelInput.value)
    : 'Choose a channel';
}

function setGuildName(guildName) {
  const name = String(guildName || '').trim();

  if (!name) {
    return;
  }

  state.guildName = name;
  guildNameElements.forEach((element) => {
    element.textContent = name;
  });
}

function getActiveTab() {
  return dashboardView.dataset.activeTab
    || readInterfacePreferences().activeTab
    || tabButtons.find((button) => button.getAttribute('aria-selected') === 'true')?.dataset.tab
    || 'overview';
}

function setActiveTab(tab) {
  const nextTab = tabPanels.some((panel) => panel.dataset.panel === tab) ? tab : 'overview';
  const primaryTab = workspaceGroupByTab[nextTab] || nextTab;

  dashboardView.dataset.activeTab = nextTab;
  writeInterfacePreferences({ activeTab: nextTab });

  for (const button of tabButtons) {
    const isSelected = button.dataset.tab === primaryTab;

    button.setAttribute('aria-selected', String(isSelected));
    button.toggleAttribute('aria-current', isSelected);
  }

  for (const panel of tabPanels) {
    panel.hidden = panel.dataset.panel !== nextTab;
  }

  dashboardView.querySelectorAll('[data-workspace-switcher] [data-tab-link]').forEach((button) => {
    const isSelected = button.dataset.tabLink === nextTab;

    button.classList.toggle('is-current', isSelected);
    button.toggleAttribute('aria-current', isSelected);
  });

  createNavList?.querySelectorAll('[data-tab-link]').forEach((button) => {
    const isSelected = button.dataset.tabLink === nextTab;

    button.classList.toggle('is-current', isSelected);
    button.toggleAttribute('aria-current', isSelected);
  });

  featureNavList?.querySelectorAll('[data-tab-link]').forEach((button) => {
    const isSelected = button.dataset.tabLink === nextTab;

    button.classList.toggle('is-current', isSelected);
    button.toggleAttribute('aria-current', isSelected);
  });

  dashboardView.querySelectorAll('.nav-inline-submenu [data-tab-link]').forEach((button) => {
    const isSelected = button.dataset.tabLink === nextTab;

    button.classList.toggle('is-current', isSelected);
    button.toggleAttribute('aria-current', isSelected);
  });

  if (nextTab === 'bot' && !dashboardView.hidden) {
    refreshBotSettings().catch((error) => setSendStatus(error.message, 'error'));
  }

  if (nextTab === 'config' && !dashboardView.hidden) {
    loadDashboardConfiguration(false).catch((error) => setSendStatus(error.message, 'error'));
  }

  if (nextTab === 'live-embed' && !dashboardView.hidden) {
    loadLiveEmbedSettings(false, 'live').catch((error) => setSendStatus(error.message, 'error'));
  }

  if (nextTab === 'welcome-embed' && !dashboardView.hidden) {
    loadWelcomeMessageSettings(false).catch((error) => setSendStatus(error.message, 'error'));
  }

  if (nextTab === 'cases' && !dashboardView.hidden) {
    loadModerationCases(false).catch((error) => setSendStatus(error.message, 'error'));
  }

  if (nextTab === 'overview' && !dashboardView.hidden) {
    startOverviewSync();
    Promise.all([
      loadDashboardHealth(false),
      loadActivityFeed(false),
    ]).catch((error) => setSendStatus(error.message, 'error'));
  } else {
    stopOverviewSync();
  }

  if (nextTab === 'members' && !dashboardView.hidden) {
    window.setTimeout(() => memberSearchInput.focus(), 0);
  }

  if (nextTab === 'analytics' && !dashboardView.hidden) {
    loadDashboardAnalytics(false).catch((error) => setSendStatus(error.message, 'error'));
  }

  if (nextTab === 'mailbox' && !dashboardView.hidden) {
    startMailboxScheduleSync();
    loadScheduledMailboxPosts(false).catch((error) => setSendStatus(error.message, 'error'));
  } else {
    stopMailboxScheduleSync();
  }

  if (nextTab === 'voice-rooms' && !dashboardView.hidden) {
    startVoiceRoomSync();
    loadVoiceRooms(false).catch((error) => setSendStatus(error.message, 'error'));
  } else {
    stopVoiceRoomSync();
  }

  if (nextTab === 'messages' && !dashboardView.hidden) {
    startSavedMessagesSync();
    loadSavedMessages().catch((error) => setSendStatus(error.message, 'error'));
  } else {
    stopSavedMessagesSync();
  }
}

function openCommandPalette() {
  commandPalette.hidden = false;
  commandSearch.value = '';
  const activePrimaryTab = workspaceGroupByTab[getActiveTab()] || getActiveTab();
  commandSelectionIndex = Math.max(0, tabButtons.findIndex((button) => button.dataset.tab === activePrimaryTab));
  renderCommandResults();
  document.body.classList.add('command-open');
  window.setTimeout(() => commandSearch.focus(), 0);
}

function closeCommandPalette() {
  if (commandPalette.hidden) {
    return;
  }

  commandPalette.hidden = true;
  document.body.classList.remove('command-open');
  commandTrigger.focus();
}

function renderCommandResults() {
  const query = commandSearch.value.trim().toLowerCase();

  commandMatches = Object.entries(workspaceMeta)
    .filter(([tab]) => tabPanels.some((panel) => panel.dataset.panel === tab))
    .map(([tab, meta]) => {
      const primaryTab = workspaceGroupByTab[tab] || tab;
      const button = tabButtons.find((item) => item.dataset.tab === primaryTab);
      const featureButton = featureNavList?.querySelector(`[data-tab-link="${tab}"]`);

      return {
        tab,
        title: meta.title || button?.textContent.trim() || tab,
        hint: meta.hint || '',
        key: meta.key || '',
        icon: button?.querySelector('i')?.className
          || featureButton?.querySelector('i')?.className
          || 'fa-solid fa-circle',
      };
    })
    .filter((item) => `${item.title} ${item.hint} ${item.tab}`.toLowerCase().includes(query));

  commandSelectionIndex = Math.min(commandSelectionIndex, Math.max(0, commandMatches.length - 1));
  commandResults.innerHTML = commandMatches.length
    ? commandMatches
      .map((item, index) => `
        <button
          class="command-result${index === commandSelectionIndex ? ' active' : ''}"
          type="button"
          data-command-tab="${escapeHtml(item.tab)}"
          role="option"
          aria-selected="${index === commandSelectionIndex}"
        >
          <span class="command-result-index">${escapeHtml(item.key)}</span>
          <span class="command-result-icon"><i class="${escapeHtml(item.icon)}" aria-hidden="true"></i></span>
          <span class="command-result-copy">
            <strong>${escapeHtml(item.title)}</strong>
            <small>${escapeHtml(item.hint)}</small>
          </span>
          <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
        </button>
      `)
      .join('')
    : '<p class="command-empty">No matching space. Try “messages” or “members”.</p>';

  commandResults.querySelector('.command-result.active')?.scrollIntoView({ block: 'nearest' });
}

function handleCommandResultClick(event) {
  const result = event.target.closest('[data-command-tab]');

  if (!result) {
    return;
  }

  navigateToCommandDestination(result.dataset.commandTab);
  closeCommandPalette();
}

function navigateToCommandDestination(tab) {
  setActiveTab(tab);
}

function handleCommandKeydown(event) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();

    if (commandPalette.hidden) {
      openCommandPalette();
    } else {
      closeCommandPalette();
    }

    return;
  }

  if (commandPalette.hidden) {
    if (event.key === 'Escape' && notificationCenter?.hidden === false) {
      event.preventDefault();
      closeNotificationCenter();
      return;
    }

    return;
  }

  if (event.key === 'Escape') {
    event.preventDefault();
    closeCommandPalette();
    return;
  }

  if (!['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key) || !commandMatches.length) {
    return;
  }

  event.preventDefault();

  if (event.key === 'ArrowDown') {
    commandSelectionIndex = (commandSelectionIndex + 1) % commandMatches.length;
    renderCommandResults();
  } else if (event.key === 'ArrowUp') {
    commandSelectionIndex = (commandSelectionIndex - 1 + commandMatches.length) % commandMatches.length;
    renderCommandResults();
  } else {
    navigateToCommandDestination(commandMatches[commandSelectionIndex].tab);
    closeCommandPalette();
  }
}

function updateDashboardGlow(event) {
  const bounds = dashboardView.getBoundingClientRect();

  dashboardView.style.setProperty('--pointer-x', `${event.clientX - bounds.left}px`);
  dashboardView.style.setProperty('--pointer-y', `${event.clientY - bounds.top}px`);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function startSavedMessagesSync() {
  if (state.savedMessagesRefreshTimer) {
    return;
  }

  state.savedMessagesRefreshTimer = window.setInterval(() => {
    if (document.hidden || dashboardView.hidden || getActiveTab() !== 'messages') {
      return;
    }

    loadSavedMessages({ silent: true }).catch(() => null);
  }, 5000);
}

function stopSavedMessagesSync() {
  if (!state.savedMessagesRefreshTimer) {
    return;
  }

  window.clearInterval(state.savedMessagesRefreshTimer);
  state.savedMessagesRefreshTimer = null;
}

async function loadVoiceRooms(showNotification = false) {
  renderLoadingSkeleton(voiceRoomList, 3);

  try {
    const result = await api('/api/temp-voice');

    state.voiceRooms.settings = result.settings || {};
    state.voiceRooms.channels = Array.isArray(result.channels) ? result.channels : [];
    state.voiceRooms.totals = result.totals || {};
    state.voiceRooms.storage = result.storage || null;

    renderVoiceRooms();

    if (showNotification) {
      setSendStatus('Voice rooms refreshed.', 'success');
    }
  } catch (error) {
    renderLoadingFailure(voiceRoomList, error.message);
    throw error;
  }
}

function startVoiceRoomSync() {
  if (state.voiceRoomsRefreshTimer) {
    return;
  }

  state.voiceRoomsRefreshTimer = window.setInterval(() => {
    if (document.hidden || dashboardView.hidden || getActiveTab() !== 'voice-rooms') {
      return;
    }

    loadVoiceRooms(false).catch(() => null);
  }, 10000);
}

function stopVoiceRoomSync() {
  if (!state.voiceRoomsRefreshTimer) {
    return;
  }

  window.clearInterval(state.voiceRoomsRefreshTimer);
  state.voiceRoomsRefreshTimer = null;
}

function renderVoiceRooms() {
  const settings = state.voiceRooms.settings || {};
  const totals = state.voiceRooms.totals || {};

  const featureEnabled = state.configuration?.features?.temporaryVoice ?? settings.enabled !== false;

  voiceRoomEnabledInput.checked = featureEnabled;
  setSelectValueWithUnavailableOption(
    voiceRoomTriggerIdInput,
    settings.triggerChannelId || '',
    'Unavailable voice channel',
  );
  voiceRoomCount.textContent = Number(totals.rooms || 0).toLocaleString();
  voiceMemberCount.textContent = Number(totals.members || 0).toLocaleString();

  voiceRoomStatus.classList.remove('ready', 'offline');
  voiceRoomStatus.textContent = featureEnabled ? 'Ready for guests' : 'Rooms paused';
  voiceRoomStatus.classList.add(featureEnabled ? 'ready' : 'offline');

  const storage = state.voiceRooms.storage;
  voiceRoomStorageStatus.classList.remove('ready', 'offline');

  if (!storage) {
    voiceRoomStorageStatus.textContent = 'Storage unavailable';
    voiceRoomStorageStatus.classList.add('offline');
  } else {
    voiceRoomStorageStatus.textContent = storage.persistent ? 'Saved persistently' : 'Storage is temporary';
    voiceRoomStorageStatus.classList.add(storage.persistent ? 'ready' : 'offline');
    voiceRoomStorageStatus.title = storage.persistent
      ? 'Voice room tracking survives restarts.'
      : 'Attach a Railway volume so room tracking survives redeploys.';
  }

  renderVoiceRoomList();
}

function renderVoiceRoomList() {
  const rooms = state.voiceRooms.channels;
  voiceRoomList.replaceChildren();
  voiceRoomListCount.textContent = rooms.length + ' room' + (rooms.length === 1 ? '' : 's');

  if (rooms.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'voice-room-empty';
    empty.innerHTML =
      '<span><i class="fa-solid fa-mug-saucer" aria-hidden="true"></i></span>' +
      '<div><strong>It is quiet in here</strong><p>New temporary rooms will appear as soon as someone creates one.</p></div>';
    voiceRoomList.append(empty);
    return;
  }

  for (const room of rooms) {
    const card = document.createElement('article');
    const icon = document.createElement('span');
    const copy = document.createElement('div');
    const heading = document.createElement('div');
    const title = document.createElement('strong');
    const badge = document.createElement('span');
    const meta = document.createElement('p');
    const members = document.createElement('div');
    const remove = document.createElement('button');

    card.className = 'voice-room-card';
    icon.className = 'voice-room-card-icon ' + (room.private ? 'private' : 'public');
    icon.innerHTML = '<i class="fa-solid ' + (room.private ? 'fa-lock' : 'fa-volume-high') + '" aria-hidden="true"></i>';
    copy.className = 'voice-room-card-copy';
    heading.className = 'voice-room-card-heading';
    title.textContent = room.name;
    badge.className = 'voice-room-visibility ' + (room.private ? 'private' : 'public');
    badge.textContent = room.private ? 'Private' : 'Public';
    const occupancy = room.userLimit
      ? room.memberCount + ' / ' + room.userLimit
      : String(room.memberCount);
    meta.textContent =
      'Hosted by ' + room.ownerName + ' · ' + occupancy + ' listening' +
      (room.deleting ? ' · tidying up soon' : '');
    members.className = 'voice-room-members';

    const memberNames = Array.isArray(room.memberNames) ? room.memberNames : [];
    if (memberNames.length) {
      for (const memberName of memberNames.slice(0, 6)) {
        const chip = document.createElement('span');
        chip.textContent = memberName;
        members.append(chip);
      }
    } else {
      const emptyChip = document.createElement('span');
      emptyChip.className = 'empty';
      emptyChip.textContent = 'Empty · 10-second grace period';
      members.append(emptyChip);
    }

    remove.className = 'danger voice-room-delete';
    remove.type = 'button';
    remove.dataset.channelId = room.channelId;
    remove.dataset.channelName = room.name;
    remove.innerHTML = '<i class="fa-solid fa-trash-can" aria-hidden="true"></i><span>Delete</span>';

    heading.append(title, badge);
    copy.append(heading, meta, members);
    card.append(icon, copy, remove);
    voiceRoomList.append(card);
  }
}

async function handleVoiceRoomSettingsSave(event) {
  event.preventDefault();
  saveVoiceRoomSettingsButton.disabled = true;

  try {
    const result = await api('/api/temp-voice/settings', {
      method: 'PUT',
      body: {
        settings: {
          enabled: voiceRoomEnabledInput.checked,
          triggerChannelId: voiceRoomTriggerIdInput.value,
        },
      },
    });

    state.voiceRooms.settings = result.settings;
    renderVoiceRooms();
    setSendStatus('Voice room setup saved.', 'success');
  } catch (error) {
    setSendStatus(error.message, 'error');
  } finally {
    saveVoiceRoomSettingsButton.disabled = false;
  }
}

async function handleVoiceRoomListClick(event) {
  const button = event.target.closest('[data-channel-id]');

  if (!button) {
    return;
  }

  const channelId = button.dataset.channelId;
  const channelName = button.dataset.channelName || 'this room';

  if (!window.confirm('Delete #' + channelName + ' now? Members inside will be disconnected.')) {
    return;
  }

  button.disabled = true;

  try {
    await api('/api/temp-voice/channels/' + encodeURIComponent(channelId), {
      method: 'DELETE',
    });
    await loadVoiceRooms(false);
    setSendStatus('Voice room deleted.', 'success');
  } catch (error) {
    button.disabled = false;
    setSendStatus(error.message, 'error');
  }
}

async function loadModerationCases(showNotification = false) {
  renderLoadingSkeleton(caseList, 5);

  try {
    const result = await api('/api/moderation-cases');

    state.moderationCases = Array.isArray(result.cases)
      ? result.cases.map(sanitizeModerationCase).filter(Boolean)
      : [];
    state.moderationCaseStorage = result.storage || null;
    renderModerationCaseStorage();
    renderModerationCases();

    if (showNotification) {
      setSendStatus('Moderation cases refreshed.', 'success');
    }
  } catch (error) {
    renderLoadingFailure(caseList, error.message);
    throw error;
  }
}

function sanitizeModerationCase(moderationCase) {
  if (!moderationCase || typeof moderationCase !== 'object') {
    return null;
  }

  const number = Number.parseInt(moderationCase.number, 10);

  if (!Number.isInteger(number) || number < 1) {
    return null;
  }

  return {
    ...moderationCase,
    number,
    reference: String(moderationCase.reference || `CASE-${String(number).padStart(6, '0')}`),
    action: String(moderationCase.action || 'warn').toLowerCase(),
    status: String(moderationCase.status || 'active').toLowerCase(),
    userId: String(moderationCase.userId || ''),
    userTag: String(moderationCase.userTag || 'Unknown user'),
    moderatorId: String(moderationCase.moderatorId || ''),
    moderatorTag: String(moderationCase.moderatorTag || 'Unknown moderator'),
    reason: String(moderationCase.reason || 'No reason recorded.'),
    durationMs: Number.isFinite(Number(moderationCase.durationMs))
      ? Number(moderationCase.durationMs)
      : null,
    reasonHistory: Array.isArray(moderationCase.reasonHistory) ? moderationCase.reasonHistory : [],
    statusHistory: Array.isArray(moderationCase.statusHistory) ? moderationCase.statusHistory : [],
  };
}

function renderModerationCases() {
  const filteredCases = getFilteredModerationCases();
  const filteredNumbers = new Set(filteredCases.map((moderationCase) => moderationCase.number));

  if (!filteredNumbers.has(state.selectedCaseNumber)) {
    state.selectedCaseNumber = filteredCases[0]?.number || null;
  }

  renderModerationCaseMetrics();
  caseResultCount.textContent = `${filteredCases.length} case${filteredCases.length === 1 ? '' : 's'}`;
  caseList.replaceChildren();

  if (filteredCases.length === 0) {
    const empty = document.createElement('p');

    empty.className = 'case-empty-list';
    empty.textContent = state.moderationCases.length
      ? 'No cases match these filters.'
      : 'No moderation cases have been recorded yet.';
    caseList.append(empty);
  } else {
    const memberCounts = countCasesByMember(state.moderationCases);

    for (const moderationCase of filteredCases) {
      caseList.append(createModerationCaseListItem(moderationCase, memberCounts));
    }
  }

  renderSelectedModerationCase();
}

function getFilteredModerationCases() {
  const query = caseSearchInput.value.trim().toLowerCase();
  const action = caseActionFilter.value;
  const status = caseStatusFilter.value;
  const dateDays = Number.parseInt(caseDateFilter.value, 10);
  const cutoff = Number.isInteger(dateDays)
    ? Date.now() - dateDays * 24 * 60 * 60 * 1000
    : null;

  return state.moderationCases.filter((moderationCase) => {
    if (action && moderationCase.action !== action) return false;
    if (status && getModerationCaseEffectiveStatus(moderationCase) !== status) return false;
    if (cutoff && Date.parse(moderationCase.createdAt) < cutoff) return false;
    if (!query) return true;

    return [
      moderationCase.reference,
      moderationCase.number,
      moderationCase.action,
      moderationCase.status,
      moderationCase.userId,
      moderationCase.userTag,
      moderationCase.moderatorId,
      moderationCase.moderatorTag,
      moderationCase.reason,
    ].some((value) => String(value || '').toLowerCase().includes(query));
  });
}

function renderModerationCaseMetrics() {
  const cases = state.moderationCases;
  const recentCutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const openCases = cases.filter(
    (moderationCase) => getModerationCaseEffectiveStatus(moderationCase) === 'active',
  );
  const activeCases = cases.filter(
    (moderationCase) => getModerationCaseEffectiveStatus(moderationCase) !== 'revoked',
  );
  const memberCounts = countCasesByMember(activeCases);
  const actionCounts = activeCases.reduce((counts, moderationCase) => {
    counts[moderationCase.action] = (counts[moderationCase.action] || 0) + 1;
    return counts;
  }, {});
  const commonAction = Object.entries(actionCounts).sort((left, right) => right[1] - left[1])[0];

  caseTotalCount.textContent = cases.length.toLocaleString();
  overviewOpenCases.textContent = openCases.length.toLocaleString();
  caseRecentCount.textContent = cases
    .filter((moderationCase) => Date.parse(moderationCase.createdAt) >= recentCutoff)
    .length
    .toLocaleString();
  caseRepeatCount.textContent = [...memberCounts.values()]
    .filter((count) => count > 1)
    .length
    .toLocaleString();
  caseCommonAction.textContent = commonAction
    ? `${getModerationActionLabel(commonAction[0])} (${commonAction[1]})`
    : 'None';
}

function countCasesByMember(cases) {
  return cases.reduce((counts, moderationCase) => {
    counts.set(moderationCase.userId, (counts.get(moderationCase.userId) || 0) + 1);
    return counts;
  }, new Map());
}

function createModerationCaseListItem(moderationCase, memberCounts) {
  const button = document.createElement('button');
  const heading = document.createElement('span');
  const reference = document.createElement('strong');
  const action = document.createElement('span');
  const meta = document.createElement('span');
  const member = document.createElement('span');
  const created = document.createElement('span');
  const reason = document.createElement('span');
  const flags = document.createElement('span');
  const status = document.createElement('span');
  const memberCaseCount = memberCounts.get(moderationCase.userId) || 0;

  button.type = 'button';
  button.className = `case-list-item${state.selectedCaseNumber === moderationCase.number ? ' active' : ''}`;
  button.dataset.caseNumber = String(moderationCase.number);
  heading.className = 'case-list-heading';
  reference.textContent = moderationCase.reference;
  action.className = 'case-action-pill';
  action.textContent = getModerationActionLabel(moderationCase.action);
  heading.append(reference, action);
  meta.className = 'case-list-meta';
  member.textContent = moderationCase.userTag;
  created.textContent = formatDashboardCaseDate(moderationCase.createdAt);
  meta.append(member, created);
  reason.className = 'case-list-reason';
  reason.textContent = moderationCase.reason;
  flags.className = 'case-list-flags';
  status.className = `case-status-badge ${getModerationCaseEffectiveStatus(moderationCase)}`;
  status.textContent = capitalizeDashboardText(getModerationCaseEffectiveStatus(moderationCase));
  flags.append(status);

  if (memberCaseCount > 1) {
    const repeat = document.createElement('span');

    repeat.className = 'case-repeat-pill';
    repeat.textContent = `${memberCaseCount} cases`;
    flags.append(repeat);
  }

  button.append(heading, meta, reason, flags);
  return button;
}

function handleCaseListClick(event) {
  const item = event.target.closest('.case-list-item');

  if (!item) {
    return;
  }

  state.selectedCaseNumber = Number.parseInt(item.dataset.caseNumber, 10);
  caseDetailPanel?.classList.add('is-drawer-open');
  renderModerationCases();
}

function closeDetailDrawer(kind) {
  if (kind === 'member') {
    memberProfilePanel?.classList.remove('is-drawer-open');
    return;
  }

  caseDetailPanel?.classList.remove('is-drawer-open');
}

function renderSelectedModerationCase() {
  const moderationCase = state.moderationCases.find(
    (item) => item.number === state.selectedCaseNumber,
  );

  caseDetailEmpty.hidden = Boolean(moderationCase);
  caseDetailContent.hidden = !moderationCase;

  if (!moderationCase) {
    return;
  }

  const status = getModerationCaseEffectiveStatus(moderationCase);
  const memberCases = state.moderationCases
    .filter((item) => item.userId === moderationCase.userId)
    .sort((left, right) => right.number - left.number);
  const latestStatusChange = moderationCase.statusHistory.at(-1);

  caseDetailReference.textContent = moderationCase.reference;
  caseDetailTitle.textContent = `${getModerationActionLabel(moderationCase.action)} · ${moderationCase.userTag}`;
  caseDetailStatus.className = `case-status-badge ${status}`;
  caseDetailStatus.textContent = capitalizeDashboardText(status);
  caseDetailFields.replaceChildren(
    createCaseDetailField('Member', `${moderationCase.userTag}\n${moderationCase.userId}`),
    createCaseDetailField('Moderator', `${moderationCase.moderatorTag}\n${moderationCase.moderatorId}`),
    createCaseDetailField('Action', getModerationActionLabel(moderationCase.action)),
    createCaseDetailField('Created', formatDashboardCaseDateTime(moderationCase.createdAt)),
    ...(moderationCase.durationMs
      ? [createCaseDetailField('Duration', formatDashboardDuration(moderationCase.durationMs))]
      : []),
    createCaseDetailField('DM Delivery', formatDashboardDelivery(moderationCase.dmDelivered)),
    createCaseDetailField('Case Log', formatDashboardDelivery(moderationCase.logDelivered)),
    createCaseDetailField('Reason', moderationCase.reason, true),
    ...(moderationCase.reasonHistory.length
      ? [createCaseDetailField(
          'Reason Corrections',
          moderationCase.reasonHistory
            .map((entry) => `${formatDashboardCaseDateTime(entry.editedAt)} · ${entry.editorTag}\n${entry.previousReason} → ${entry.newReason}`)
            .join('\n\n'),
          true,
        )]
      : []),
    ...(latestStatusChange
      ? [createCaseDetailField(
          'Revocation Audit',
          `${latestStatusChange.editorTag} · ${formatDashboardCaseDateTime(latestStatusChange.changedAt)}\n${latestStatusChange.reason}`,
          true,
        )]
      : []),
  );

  caseMemberIndicator.textContent = memberCases.length > 1
    ? `Repeat member · ${memberCases.length} cases`
    : 'First recorded case';
  caseMemberTimeline.replaceChildren(
    ...memberCases.slice(0, 20).map((item) => createCaseTimelineItem(item, moderationCase.number)),
  );
  caseReasonInput.value = moderationCase.reason;
  caseRevokeReason.value = '';
  caseRevokeForm.hidden = status === 'revoked';
  saveCaseReasonButton.disabled = false;
  revokeCaseButton.disabled = false;
}

function createCaseDetailField(label, value, wide = false) {
  const field = document.createElement('section');
  const name = document.createElement('span');
  const content = document.createElement('p');

  field.className = `case-detail-field${wide ? ' wide' : ''}`;
  name.textContent = label;
  content.textContent = value;
  field.append(name, content);
  return field;
}

function createCaseTimelineItem(moderationCase, currentNumber) {
  const item = document.createElement('section');
  const heading = document.createElement('strong');
  const meta = document.createElement('span');
  const reason = document.createElement('span');

  item.className = `case-timeline-item${moderationCase.number === currentNumber ? ' current' : ''}`;
  heading.textContent = `${moderationCase.reference} · ${getModerationActionLabel(moderationCase.action)}`;
  meta.textContent = `${capitalizeDashboardText(getModerationCaseEffectiveStatus(moderationCase))} · ${formatDashboardCaseDateTime(moderationCase.createdAt)}`;
  reason.textContent = moderationCase.reason;
  item.append(heading, meta, reason);
  return item;
}

async function handleCaseReasonSave(event) {
  event.preventDefault();
  const moderationCase = state.moderationCases.find(
    (item) => item.number === state.selectedCaseNumber,
  );

  if (!moderationCase) {
    return;
  }

  const reason = caseReasonInput.value.trim();

  if (!reason || reason === moderationCase.reason) {
    setSendStatus(reason ? 'Enter a different reason before saving.' : 'A case reason is required.', 'error');
    return;
  }

  saveCaseReasonButton.disabled = true;

  try {
    const result = await api(`/api/moderation-cases/${moderationCase.number}/reason`, {
      method: 'PATCH',
      body: { reason },
    });

    replaceModerationCase(result.case);
    setSendStatus(
      `${moderationCase.reference} reason corrected.${result.logged ? '' : ' The case-file log was unavailable.'}`,
      'success',
    );
  } catch (error) {
    setSendStatus(error.message, 'error');
  } finally {
    saveCaseReasonButton.disabled = false;
  }
}

async function handleCaseRevocation(event) {
  event.preventDefault();
  const moderationCase = state.moderationCases.find(
    (item) => item.number === state.selectedCaseNumber,
  );
  const reason = caseRevokeReason.value.trim();

  if (!moderationCase || !reason) {
    setSendStatus('A revocation reason is required.', 'error');
    return;
  }

  if (!window.confirm(`Revoke ${moderationCase.reference}? The original case will remain in the audit trail.`)) {
    return;
  }

  revokeCaseButton.disabled = true;

  try {
    const result = await api(`/api/moderation-cases/${moderationCase.number}/status`, {
      method: 'PATCH',
      body: { status: 'revoked', reason },
    });

    replaceModerationCase(result.case);
    setSendStatus(
      `${moderationCase.reference} revoked.${result.logged ? '' : ' The case-file log was unavailable.'}`,
      'success',
    );
  } catch (error) {
    setSendStatus(error.message, 'error');
  } finally {
    revokeCaseButton.disabled = false;
  }
}

function replaceModerationCase(input) {
  const moderationCase = sanitizeModerationCase(input);

  if (!moderationCase) {
    return;
  }

  const index = state.moderationCases.findIndex((item) => item.number === moderationCase.number);

  if (index === -1) {
    state.moderationCases.unshift(moderationCase);
  } else {
    state.moderationCases[index] = moderationCase;
  }

  state.selectedCaseNumber = moderationCase.number;
  renderModerationCases();
}

function renderModerationCaseStorage() {
  const storage = state.moderationCaseStorage;

  caseStorageStatus.classList.remove('ready', 'offline');

  if (!storage) {
    caseStorageStatus.textContent = 'Storage unavailable';
    caseStorageStatus.classList.add('offline');
    return;
  }

  caseStorageStatus.textContent = storage.persistent ? 'Saved persistently' : 'Storage is temporary';
  caseStorageStatus.classList.add(storage.persistent ? 'ready' : 'offline');
  caseStorageStatus.title = storage.persistent
    ? `Storage: ${storage.source}`
    : 'Attach a Railway volume so cases survive redeploys.';
}

function getModerationCaseEffectiveStatus(moderationCase) {
  if (moderationCase.status === 'revoked') {
    return 'revoked';
  }

  if (
    moderationCase.action === 'timeout' &&
    moderationCase.durationMs &&
    Date.parse(moderationCase.createdAt) + moderationCase.durationMs <= Date.now()
  ) {
    return 'expired';
  }

  return moderationCase.status || 'active';
}

function getModerationActionLabel(action) {
  return {
    warn: 'Warning',
    timeout: 'Timeout',
    kick: 'Kick',
    ban: 'Ban',
  }[action] || 'Moderation';
}

function formatDashboardCaseDate(value) {
  const date = new Date(value);

  return Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date)
    : 'Unknown date';
}

function formatDashboardCaseDateTime(value) {
  const date = new Date(value);

  return Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
    : 'Unknown date';
}

function formatDashboardDuration(milliseconds) {
  const totalMinutes = Math.max(1, Math.round(Number(milliseconds) / 60000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  return [
    days ? `${days}d` : '',
    hours ? `${hours}h` : '',
    minutes ? `${minutes}m` : '',
  ].filter(Boolean).join(' ');
}

function formatDashboardDelivery(value) {
  return value === true ? 'Delivered' : (value === false ? 'Failed' : 'Not recorded');
}

function capitalizeDashboardText(value) {
  const text = String(value || '');

  return text ? `${text[0].toUpperCase()}${text.slice(1)}` : 'Unknown';
}

function handleSavedMessageClick(event) {
  const button = event.target.closest('.saved-message-chip');

  if (!button) {
    return;
  }

  loadSavedMessage(button.dataset.messageId);
}

async function handleSaveMessage() {
  const payload = collectPayload();
  const savedMessage = {
    id: state.currentMessageId || createId(),
    name: payload.name || createUntitledMessageName(),
    channelId: payload.channelId,
    color: payload.color,
    image: payload.image,
    blocks: payload.blocks,
    buttons: payload.buttons,
    allowMentions: payload.allowMentions,
    updatedAt: new Date().toISOString(),
  };
  const existingIndex = state.savedMessages.findIndex((message) => message.id === savedMessage.id);

  if (existingIndex >= 0) {
    state.savedMessages[existingIndex] = savedMessage;
  } else {
    state.savedMessages = [savedMessage, ...state.savedMessages];
  }

  if (!(await persistSavedMessages())) {
    return;
  }

  state.currentMessageId = savedMessage.id;
  messageNameInput.value = savedMessage.name;
  renderSavedMessages();
  markBuilderSaved('message', 'Saved to Bean');
  setSendStatus(`Saved "${savedMessage.name}".`, 'success');
}

async function handleDeleteMessage() {
  const message = state.savedMessages.find((savedMessage) => savedMessage.id === state.currentMessageId);

  if (!message || message.id === welcomeMessageId) {
    return;
  }

  if (!window.confirm(`Delete "${message.name}"? This cannot be undone.`)) {
    return;
  }

  deleteMessageButton.disabled = true;

  try {
    const result = await api(`/api/saved-messages/${encodeURIComponent(message.id)}`, {
      method: 'DELETE',
    });

    state.savedMessages = Array.isArray(result.messages)
      ? result.messages.map(sanitizeSavedMessage).filter(Boolean)
      : state.savedMessages.filter((savedMessage) => savedMessage.id !== message.id);
    writeLocalSavedMessages(state.savedMessages);
    resetComposer();
    setSendStatus(`Deleted "${message.name}".`, 'success');
  } catch (error) {
    setSendStatus(error.message, 'error');
  } finally {
    updateDeleteMessageButton();
  }
}

async function handleImportMessage() {
  const messageUrl = window.prompt('Paste the Discord message link to import.');

  if (!messageUrl) {
    return;
  }

  const name = window.prompt('Saved message name', 'Guidelines.') || '';

  importMessageButton.disabled = true;

  try {
    const result = await api('/api/import-message', {
      method: 'POST',
      body: {
        url: messageUrl.trim(),
        name: name.trim(),
      },
    });

    state.savedMessages = Array.isArray(result.messages)
      ? result.messages.map(sanitizeSavedMessage).filter(Boolean)
      : state.savedMessages;
    writeLocalSavedMessages(state.savedMessages);

    if (result.message) {
      state.currentMessageId = result.message.id;
      applyMessage(result.message);
    }

    renderSavedMessages();
    setSendStatus(`Imported "${result.message?.name || 'message'}".`, 'success');
  } catch (error) {
    setSendStatus(error.message, 'error');
  } finally {
    importMessageButton.disabled = false;
  }
}

function loadSavedMessage(id) {
  const message = state.savedMessages.find((savedMessage) => savedMessage.id === id);

  if (!message) {
    return;
  }

  state.currentMessageId = message.id;
  applyMessage(message);
  renderSavedMessages();
  setActiveTab('messages');
  setSendStatus(`Loaded "${message.name}".`, 'success');
}

function resetComposer() {
  state.currentMessageId = null;
  applyMessage({
    name: '',
    channelId: '',
    color: null,
    image: null,
    blocks: [],
    buttons: [],
    allowMentions: false,
  });
  renderSavedMessages();
  setSendStatus('', '');
}

function applyMessage(message) {
  messageNameInput.value = message.name || '';
  setChannelSelectValue(channelInput, message.channelId || '');
  messageColorInput.value = normalizeMessageColor(message.color);
  messageColorPicker.value = messageColorInput.value || '#f6c75f';
  allowMentionsInput.checked = Boolean(message.allowMentions);
  state.image = message.image || null;
  imageInput.value = '';
  sectionsContainer.innerHTML = '';
  buttonsContainer.innerHTML = '';

  for (const block of message.blocks || []) {
    if (block.type === 'text') {
      addSection(block.content, block.accessory);
      continue;
    }

    if (block.type === 'divider') {
      addDivider(block.spacing);
      continue;
    }

    if (block.type === 'spacer') {
      addSpacerBlock(block.spacing);
    }
  }

  for (const button of message.buttons || []) {
    addButton(button.label, button.url, button.emoji);
  }

  updatePreview();
}

async function loadSavedMessages(options = {}) {
  if (state.savedMessagesRequest) {
    return state.savedMessagesRequest;
  }

  state.savedMessagesRequest = loadSavedMessagesFromServer(options).finally(() => {
    state.savedMessagesRequest = null;
  });

  return state.savedMessagesRequest;
}

async function loadSavedMessagesFromServer(options = {}) {
  const localMessages = options.migrateLocal === false ? [] : readLocalSavedMessages();
  const shouldShowLoadingState = !options.silent;

  if (shouldShowLoadingState) {
    refreshMessagesButton.disabled = true;
  }

  try {
    const result = await api('/api/saved-messages');
    const serverMessages = Array.isArray(result.messages)
      ? result.messages.map(sanitizeSavedMessage).filter(Boolean)
      : [];

    state.savedMessages = ensureWelcomeMessage(mergeSavedMessages(serverMessages, localMessages));
    renderSavedMessages();
    writeLocalSavedMessages(state.savedMessages);

    if (localMessages.length > 0) {
      await persistSavedMessages(false);
    }

    if (options.showNotification) {
      setSendStatus('Saved messages refreshed.', 'success');
    }
  } catch (error) {
    if (localMessages.length > 0) {
      state.savedMessages = ensureWelcomeMessage(localMessages);
      renderSavedMessages();
    }

    if (!options.silent) {
      throw error;
    }
  } finally {
    if (shouldShowLoadingState) {
      refreshMessagesButton.disabled = false;
    }
  }
}

async function persistSavedMessages(showError = true) {
  try {
    const result = await api('/api/saved-messages', {
      method: 'PUT',
      body: { messages: state.savedMessages },
    });

    state.savedMessages = Array.isArray(result.messages)
      ? result.messages.map(sanitizeSavedMessage).filter(Boolean)
      : state.savedMessages;
    writeLocalSavedMessages(state.savedMessages);

    return true;
  } catch (error) {
    if (showError) {
      setSendStatus(error.message, 'error');
    }

    return false;
  }
}

function readLocalSavedMessages() {
  let messages = [];

  try {
    messages = JSON.parse(window.localStorage.getItem(savedMessagesStorageKey) || '[]');
  } catch {
    messages = [];
  }

  return Array.isArray(messages) ? messages.map(sanitizeSavedMessage).filter(Boolean) : [];
}

function writeLocalSavedMessages(messages) {
  try {
    window.localStorage.setItem(savedMessagesStorageKey, JSON.stringify(messages));
  } catch {
    // Server storage is still the source of truth if browser storage is unavailable.
  }
}

function mergeSavedMessages(serverMessages, localMessages) {
  const merged = [...serverMessages];

  for (const localMessage of localMessages) {
    const existingIndex = merged.findIndex((message) => message.id === localMessage.id);

    if (existingIndex === -1) {
      merged.unshift(localMessage);
      continue;
    }

    if (isNewerSavedMessage(localMessage, merged[existingIndex])) {
      merged[existingIndex] = localMessage;
    }
  }

  return merged;
}

function ensureWelcomeMessage(messages) {
  if (messages.some((message) => message.id === welcomeMessageId)) {
    return messages;
  }

  return [seededWelcomeMessage, ...messages];
}

function isNewerSavedMessage(candidate, current) {
  return Date.parse(candidate.updatedAt || '') > Date.parse(current.updatedAt || '');
}

function sanitizeSavedMessage(message) {
  if (!message || typeof message !== 'object') {
    return null;
  }

  return {
    id: String(message.id || createId()),
    name: String(message.name || 'Untitled message'),
    channelId: String(message.channelId || ''),
    color: normalizeMessageColor(message.color) || null,
    image: message.image && typeof message.image === 'object' ? message.image : null,
    blocks: sanitizeBlocks(message),
    buttons: Array.isArray(message.buttons)
      ? message.buttons.map((button) => ({
          label: String(button?.label || ''),
          url: String(button?.url || ''),
          emoji: String(button?.emoji || ''),
        }))
      : [],
    allowMentions: Boolean(message.allowMentions),
    updatedAt: String(message.updatedAt || new Date().toISOString()),
  };
}

function sanitizeBlocks(message) {
  const sourceBlocks = Array.isArray(message.blocks)
    ? message.blocks
    : (Array.isArray(message.sections) ? message.sections.map((section) => ({ type: 'text', content: section })) : []);

  return sourceBlocks
    .map((block) => {
      const type = String(block?.type || '').toLowerCase();

      if (type === 'text') {
        return {
          type,
          content: String(block.content || ''),
          accessory: sanitizeAccessory(block.accessory),
        };
      }

      if (type === 'divider' || type === 'spacer') {
        return {
          type,
          spacing: normalizeBlockSpacing(block.spacing),
        };
      }

      return null;
    })
    .filter(Boolean);
}

function renderSavedMessages() {
  savedMessagesContainer.innerHTML = '';
  savedMessageCount.textContent = `${state.savedMessages.length} saved`;

  for (const message of state.savedMessages) {
    const button = document.createElement('button');
    const title = document.createElement('strong');
    const meta = document.createElement('span');

    button.className = 'saved-message-chip';
    button.classList.toggle('active', message.id === state.currentMessageId);
    button.type = 'button';
    button.dataset.messageId = message.id;
    title.textContent = message.name;
    meta.textContent = createSavedMessageMeta(message);
    button.append(title, meta);
    savedMessagesContainer.append(button);
  }

  updateDeleteMessageButton();
}

function updateDeleteMessageButton() {
  const hasDeletableMessage =
    Boolean(state.currentMessageId) &&
    state.currentMessageId !== welcomeMessageId &&
    state.savedMessages.some((message) => message.id === state.currentMessageId);

  deleteMessageButton.disabled = !hasDeletableMessage;
  deleteMessageButton.title =
    state.currentMessageId === welcomeMessageId ? 'The built-in Welcome Message cannot be deleted.' : '';
}

function createSavedMessageMeta(message) {
  const textCount = message.blocks.filter((block) => block.type === 'text' && block.content.trim()).length;
  const dividerCount = message.blocks.filter((block) => block.type === 'divider').length;
  const spacerCount = message.blocks.filter((block) => block.type === 'spacer').length;
  const accessoryCount = message.blocks.filter((block) => block.type === 'text' && block.accessory?.label && block.accessory?.url).length;
  const buttonCount = message.buttons.filter((button) => button.label.trim() && button.url.trim()).length;
  const totalButtonCount = accessoryCount + buttonCount;

  return `${textCount} text, ${dividerCount + spacerCount} layout, ${totalButtonCount} ${totalButtonCount === 1 ? 'button' : 'buttons'}`;
}

function createUntitledMessageName() {
  return `Untitled Message ${state.savedMessages.length + 1}`;
}

function createId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `message-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function addSection(value, accessory = null) {
  const index = sectionsContainer.querySelectorAll('.text-block').length + 1;
  const block = document.createElement('section');
  block.className = 'text-block content-block';
  block.dataset.blockType = 'text';
  block.innerHTML = `
    <div class="block-header">
      <h2>Text ${index}</h2>
      <div class="block-actions">
        <button class="secondary move-up" type="button">Up</button>
        <button class="secondary move-down" type="button">Down</button>
        <button class="secondary remove" type="button">Remove</button>
      </div>
    </div>
    <textarea class="section-input" spellcheck="true"></textarea>
    <label class="toggle-row">
      <input class="accessory-enabled" type="checkbox" />
      <span>Accessory button</span>
    </label>
    <div class="button-fields accessory-fields" hidden>
      <label class="field">
        Label
        <input class="accessory-label" maxlength="80" />
      </label>
      <label class="field">
        URL
        <input class="accessory-url" type="url" />
      </label>
    </div>
  `;

  block.querySelector('textarea').value = value;
  block.querySelector('.accessory-enabled').checked = Boolean(accessory);
  block.querySelector('.accessory-label').value = accessory?.label || '';
  block.querySelector('.accessory-url').value = accessory?.url || '';
  updateAccessoryFields(block);
  block.querySelector('.accessory-enabled').addEventListener('change', () => {
    updateAccessoryFields(block);
    updatePreview();
  });
  block.querySelector('.move-up').addEventListener('click', () => moveBlock(block, -1));
  block.querySelector('.move-down').addEventListener('click', () => moveBlock(block, 1));
  block.querySelector('.remove').addEventListener('click', () => {
    block.remove();
    updatePreview();
  });

  sectionsContainer.append(block);
  updatePreview();
}

function addDivider(spacing) {
  addLayoutBlock('divider', spacing);
}

function addSpacerBlock(spacing) {
  addLayoutBlock('spacer', spacing);
}

function addLayoutBlock(type, spacing) {
  const block = document.createElement('section');
  const isDivider = type === 'divider';

  block.className = 'layout-block content-block';
  block.dataset.blockType = type;
  block.innerHTML = `
    <div class="block-header">
      <h2>${isDivider ? 'Divider' : 'Spacer'}</h2>
      <div class="block-actions">
        <button class="secondary move-up" type="button">Up</button>
        <button class="secondary move-down" type="button">Down</button>
        <button class="secondary remove" type="button">Remove</button>
      </div>
    </div>
    <label class="field">
      Spacing
      <select class="block-spacing">
        <option value="small">Small</option>
        <option value="large">Large</option>
      </select>
    </label>
  `;

  block.querySelector('.block-spacing').value = normalizeBlockSpacing(spacing);
  block.querySelector('.move-up').addEventListener('click', () => moveBlock(block, -1));
  block.querySelector('.move-down').addEventListener('click', () => moveBlock(block, 1));
  block.querySelector('.remove').addEventListener('click', () => {
    block.remove();
    updatePreview();
  });

  sectionsContainer.append(block);
  updatePreview();
}

function addButton(label, url, emoji = '') {
  const block = document.createElement('section');
  block.className = 'button-block';
  block.innerHTML = `
    <div class="block-header">
      <h2>Link Button</h2>
      <button class="secondary remove" type="button">Remove</button>
    </div>
    <div class="button-fields button-fields-with-emoji">
      <label class="field">
        Label
        <input class="button-label" maxlength="80" />
      </label>
      <label class="field">
        Emoji
        <input class="button-emoji" maxlength="100" placeholder="🔥 or <:name:id>" />
      </label>
      <label class="field">
        URL
        <input class="button-url" type="url" />
      </label>
    </div>
  `;

  block.querySelector('.button-label').value = label;
  block.querySelector('.button-emoji').value = emoji;
  block.querySelector('.button-url').value = url;
  block.querySelector('.remove').addEventListener('click', () => {
    block.remove();
    updatePreview();
  });

  buttonsContainer.append(block);
  updatePreview();
}

async function handleImageChange() {
  const file = imageInput.files[0];

  if (!file) {
    state.image = null;
    updatePreview();
    return;
  }

  if (!file.type.startsWith('image/')) {
    setSendStatus('Select an image file.', 'error');
    imageInput.value = '';
    return;
  }

  state.image = {
    name: file.name,
    dataUrl: await readFileAsDataUrl(file),
  };
  updatePreview();
}

function collectPayload() {
  return {
    name: messageNameInput.value.trim(),
    channelId: channelInput.value.trim(),
    color: messageColorInput.value.trim(),
    image: state.image,
    blocks: collectBlocks(),
    buttons: [...buttonsContainer.querySelectorAll('.button-block')].map((block) => ({
      label: block.querySelector('.button-label').value,
      url: block.querySelector('.button-url').value,
      emoji: block.querySelector('.button-emoji')?.value || '',
    })),
    allowMentions: allowMentionsInput.checked,
  };
}

function collectBlocks() {
  return [...sectionsContainer.querySelectorAll('.content-block')]
    .map((block) => {
      const type = block.dataset.blockType;

      if (type === 'text') {
        return {
          type,
          content: block.querySelector('.section-input').value,
          accessory: collectAccessory(block),
        };
      }

      if (type === 'divider' || type === 'spacer') {
        return {
          type,
          spacing: normalizeBlockSpacing(block.querySelector('.block-spacing')?.value),
        };
      }

      return null;
    })
    .filter(Boolean);
}

function updatePreview() {
  const payload = collectPayload();
  const color = normalizeMessageColor(payload.color);
  const blocks = payload.blocks.filter((block) => {
    if (block.type !== 'text') {
      return true;
    }

    return block.content.trim();
  });
  const buttons = payload.buttons.filter((button) => button.label.trim() && button.url.trim());

  discordPreview.classList.toggle('has-accent-color', Boolean(color));
  discordPreview.style.setProperty('--preview-accent', color || 'transparent');

  previewImage.hidden = !state.image;

  if (state.image) {
    previewImage.src = state.image.dataUrl;
  }

  previewSections.innerHTML = '';

  for (const block of blocks) {
    if (block.type === 'text') {
      previewSections.append(createTextPreviewBlock(block));
      continue;
    }

    const divider = document.createElement('div');
    divider.className = `preview-layout preview-layout-${block.type} preview-layout-${block.spacing}`;
    divider.setAttribute('aria-hidden', 'true');
    previewSections.append(divider);
  }

  previewButtons.innerHTML = '';

  for (const button of buttons) {
    const anchor = document.createElement('a');
    anchor.className = 'preview-button';
    anchor.href = button.url;
    anchor.target = '_blank';
    anchor.rel = 'noreferrer';
    appendPreviewButtonContent(anchor, button);
    previewButtons.append(anchor);
  }

  sectionCount.textContent = `${blocks.length} block${blocks.length === 1 ? '' : 's'}`;
}

function handleMessageColorPickerInput() {
  messageColorInput.value = messageColorPicker.value.toUpperCase();
  updatePreview();
}

function handleMessageColorInput() {
  const color = normalizeMessageColor(messageColorInput.value);

  if (color) {
    messageColorPicker.value = color;
  }

  updatePreview();
}

function normalizeMessageColor(value) {
  const normalized = String(value || '').trim().replace(/^#/, '');

  return /^[0-9a-fA-F]{6}$/.test(normalized) ? `#${normalized.toUpperCase()}` : '';
}

async function loadWelcomeMessageSettings(showNotification = false) {
  let result = await api('/api/welcome-embed');

  result = await restoreWelcomeMessageBackupIfNeeded(result);
  state.welcomeSettings = result.settings || {};
  state.welcomeStorage = result.storage || null;
  applyWelcomeMessageSettings(state.welcomeSettings);
  renderWelcomeMessageStorageStatus(state.welcomeStorage);

  if (result.storage?.hasSavedSettings) {
    writeWelcomeMessageBackup(state.welcomeSettings);
  }

  if (showNotification) {
    setSendStatus('Welcome message refreshed.', 'success');
  }
}

async function restoreWelcomeMessageBackupIfNeeded(result) {
  if (state.welcomeRestoreAttempted || result.storage?.hasSavedSettings) {
    return result;
  }

  const backup = readWelcomeMessageBackup();

  if (!backup) {
    return result;
  }

  state.welcomeRestoreAttempted = true;

  try {
    const restored = await api('/api/welcome-embed', {
      method: 'PUT',
      body: { settings: backup },
    });

    setSendStatus('Welcome message restored from this browser after the bot restart.', 'success');
    return restored;
  } catch (error) {
    state.welcomeRestoreAttempted = false;
    setSendStatus(`Could not restore the welcome message browser backup: ${error.message}`, 'error');
    return result;
  }
}

function writeWelcomeMessageBackup(settings) {
  if (!Array.isArray(settings?.blocks) || !Array.isArray(settings?.buttons)) {
    return;
  }

  try {
    window.localStorage.setItem(welcomeEmbedStorageKey, JSON.stringify(settings));
  } catch {
    // Server-side storage remains authoritative when browser storage is unavailable.
  }
}

function readWelcomeMessageBackup() {
  try {
    const settings = JSON.parse(window.localStorage.getItem(welcomeEmbedStorageKey) || 'null');

    return Array.isArray(settings?.blocks) && Array.isArray(settings?.buttons) ? settings : null;
  } catch {
    return null;
  }
}

function applyWelcomeMessageSettings(settings) {
  setChannelSelectValue(welcomeChannelIdInput, settings.channelId || '');
  welcomeColorInput.value = normalizeMessageColor(settings.color);
  welcomeColorPicker.value = welcomeColorInput.value || '#2DD4BF';
  welcomeAllowMentionsInput.checked = settings.allowMentions !== false;
  state.welcomeImage = settings.image || null;
  welcomeImageInput.value = '';
  welcomeSectionsContainer.replaceChildren();
  welcomeButtonsContainer.replaceChildren();

  for (const block of settings.blocks || []) {
    if (block.type === 'text') {
      addWelcomeSection(block.content, block.accessory);
    } else if (block.type === 'divider' || block.type === 'spacer') {
      addWelcomeLayoutBlock(block.type, block.spacing);
    }
  }

  for (const button of settings.buttons || []) {
    addWelcomeMessageButton(button);
  }

  updateWelcomePreview();
}

async function handleSaveWelcomeMessage(event) {
  event.preventDefault();
  saveWelcomeMessageButton.disabled = true;

  try {
    const result = await api('/api/welcome-embed', {
      method: 'PUT',
      body: { settings: collectWelcomeMessageSettings() },
    });

    state.welcomeSettings = result.settings || {};
    state.welcomeStorage = result.storage || null;
    applyWelcomeMessageSettings(state.welcomeSettings);
    writeWelcomeMessageBackup(state.welcomeSettings);
    renderWelcomeMessageStorageStatus(state.welcomeStorage);
    markBuilderSaved('welcome', 'Saved to Bean');
    setSendStatus('Welcome message saved.', 'success');
  } catch (error) {
    setSendStatus(error.message, 'error');
  } finally {
    saveWelcomeMessageButton.disabled = false;
  }
}

function collectWelcomeMessageSettings() {
  return {
    channelId: welcomeChannelIdInput.value.trim(),
    color: welcomeColorInput.value.trim(),
    image: state.welcomeImage,
    blocks: [...welcomeSectionsContainer.querySelectorAll('.welcome-content-block')]
      .map((block) => {
        const type = block.dataset.blockType;

        if (type === 'text') {
          const accessoryEnabled = block.querySelector('.welcome-accessory-enabled')?.checked;

          return {
            type,
            content: block.querySelector('.welcome-section-input').value,
            accessory: accessoryEnabled
              ? {
                  label: block.querySelector('.welcome-accessory-label').value,
                  url: block.querySelector('.welcome-accessory-url').value,
                  emoji: block.querySelector('.welcome-accessory-emoji').value,
                }
              : null,
          };
        }

        return {
          type,
          spacing: normalizeBlockSpacing(block.querySelector('.welcome-block-spacing')?.value),
        };
      })
      .filter(Boolean),
    buttons: [...welcomeButtonsContainer.querySelectorAll('.welcome-button-block')].map((block) => ({
      label: block.querySelector('.welcome-button-label').value,
      url: block.querySelector('.welcome-button-url').value,
      emoji: block.querySelector('.welcome-button-emoji').value,
    })),
    allowMentions: welcomeAllowMentionsInput.checked,
  };
}

function addWelcomeSection(value, accessory = null, focus = false) {
  const index = welcomeSectionsContainer.querySelectorAll('.welcome-text-block').length + 1;
  const block = document.createElement('section');

  block.className = 'text-block content-block welcome-content-block welcome-text-block';
  block.dataset.blockType = 'text';
  block.innerHTML = `
    <div class="block-header">
      <h2>Text ${index}</h2>
      <div class="block-actions">
        <button class="secondary welcome-move-up" type="button">Up</button>
        <button class="secondary welcome-move-down" type="button">Down</button>
        <button class="secondary welcome-remove" type="button">Remove</button>
      </div>
    </div>
    <textarea class="welcome-section-input" spellcheck="true"></textarea>
    <label class="toggle-row">
      <input class="welcome-accessory-enabled" type="checkbox" />
      <span>Accessory button</span>
    </label>
    <div class="button-fields button-fields-with-emoji welcome-accessory-fields" hidden>
      <label class="field">
        Label
        <input class="welcome-accessory-label" maxlength="80" />
      </label>
      <label class="field">
        Emoji
        <input class="welcome-accessory-emoji" maxlength="100" placeholder="👋 or <:name:id>" />
      </label>
      <label class="field">
        URL
        <input class="welcome-accessory-url" maxlength="512" placeholder="https://..." />
      </label>
    </div>
  `;

  block.querySelector('.welcome-section-input').value = value || '';
  block.querySelector('.welcome-accessory-enabled').checked = Boolean(accessory);
  block.querySelector('.welcome-accessory-label').value = accessory?.label || '';
  block.querySelector('.welcome-accessory-emoji').value = accessory?.emoji || '';
  block.querySelector('.welcome-accessory-url').value = accessory?.url || '';
  updateWelcomeAccessoryFields(block);
  block.querySelector('.welcome-accessory-enabled').addEventListener('change', () => {
    updateWelcomeAccessoryFields(block);
    updateWelcomePreview();
  });
  welcomeSectionsContainer.append(block);

  if (focus) {
    block.querySelector('.welcome-section-input').focus();
  }

  updateWelcomePreview();
}

function addWelcomeLayoutBlock(type, spacing = 'small') {
  const isDivider = type === 'divider';
  const block = document.createElement('section');

  block.className = 'layout-block content-block welcome-content-block';
  block.dataset.blockType = isDivider ? 'divider' : 'spacer';
  block.innerHTML = `
    <div class="block-header">
      <h2>${isDivider ? 'Divider' : 'Spacer'}</h2>
      <div class="block-actions">
        <button class="secondary welcome-move-up" type="button">Up</button>
        <button class="secondary welcome-move-down" type="button">Down</button>
        <button class="secondary welcome-remove" type="button">Remove</button>
      </div>
    </div>
    <label class="field">
      Spacing
      <select class="welcome-block-spacing">
        <option value="small">Small</option>
        <option value="large">Large</option>
      </select>
    </label>
  `;

  block.querySelector('.welcome-block-spacing').value = normalizeBlockSpacing(spacing);
  welcomeSectionsContainer.append(block);
  updateWelcomePreview();
}

function addWelcomeMessageButton(button = {}, focus = false) {
  if (welcomeButtonsContainer.querySelectorAll('.welcome-button-block').length >= 5) {
    setSendStatus('Welcome messages can contain up to 5 link buttons.', 'error');
    return;
  }

  const block = document.createElement('section');

  block.className = 'button-block welcome-button-block';
  block.innerHTML = `
    <div class="block-header">
      <h2>Link Button</h2>
      <div class="block-actions">
        <button class="secondary welcome-button-up" type="button">Up</button>
        <button class="secondary welcome-button-down" type="button">Down</button>
        <button class="secondary welcome-button-remove" type="button">Remove</button>
      </div>
    </div>
    <div class="button-fields button-fields-with-emoji">
      <label class="field">
        Label
        <input class="welcome-button-label" maxlength="80" />
      </label>
      <label class="field">
        Emoji
        <input class="welcome-button-emoji" maxlength="100" placeholder="👋 or <:name:id>" />
      </label>
      <label class="field">
        URL
        <input class="welcome-button-url" maxlength="512" placeholder="https://..." />
      </label>
    </div>
  `;

  block.querySelector('.welcome-button-label').value = button.label || '';
  block.querySelector('.welcome-button-emoji').value = button.emoji || '';
  block.querySelector('.welcome-button-url').value = button.url || '';
  welcomeButtonsContainer.append(block);
  updateWelcomeButtonLimit();

  if (focus) {
    block.querySelector('.welcome-button-label').focus();
  }

  updateWelcomePreview();
}

function handleWelcomeSectionsClick(event) {
  const block = event.target.closest('.welcome-content-block');

  if (!block) {
    return;
  }

  if (event.target.closest('.welcome-remove')) {
    block.remove();
  } else if (event.target.closest('.welcome-move-up') && block.previousElementSibling) {
    welcomeSectionsContainer.insertBefore(block, block.previousElementSibling);
  } else if (event.target.closest('.welcome-move-down') && block.nextElementSibling) {
    welcomeSectionsContainer.insertBefore(block.nextElementSibling, block);
  } else {
    return;
  }

  updateWelcomePreview();
}

function handleWelcomeButtonsClick(event) {
  const block = event.target.closest('.welcome-button-block');

  if (!block) {
    return;
  }

  if (event.target.closest('.welcome-button-remove')) {
    block.remove();
  } else if (event.target.closest('.welcome-button-up') && block.previousElementSibling) {
    welcomeButtonsContainer.insertBefore(block, block.previousElementSibling);
  } else if (event.target.closest('.welcome-button-down') && block.nextElementSibling) {
    welcomeButtonsContainer.insertBefore(block.nextElementSibling, block);
  } else {
    return;
  }

  updateWelcomeButtonLimit();
  updateWelcomePreview();
}

function updateWelcomeAccessoryFields(block) {
  block.querySelector('.welcome-accessory-fields').hidden =
    !block.querySelector('.welcome-accessory-enabled').checked;
}

function updateWelcomeButtonLimit() {
  addWelcomeButtonButton.disabled =
    welcomeButtonsContainer.querySelectorAll('.welcome-button-block').length >= 5;
}

async function handleWelcomeImageChange() {
  const file = welcomeImageInput.files[0];

  if (!file) {
    state.welcomeImage = null;
    updateWelcomePreview();
    return;
  }

  if (!file.type.startsWith('image/')) {
    setSendStatus('Select an image file.', 'error');
    welcomeImageInput.value = '';
    return;
  }

  state.welcomeImage = {
    name: file.name,
    dataUrl: await readFileAsDataUrl(file),
  };
  updateWelcomePreview();
}

function handleWelcomeColorPickerInput() {
  welcomeColorInput.value = welcomeColorPicker.value.toUpperCase();
  updateWelcomePreview();
}

function handleWelcomeColorInput() {
  const color = normalizeMessageColor(welcomeColorInput.value);

  if (color) {
    welcomeColorPicker.value = color;
  }

  updateWelcomePreview();
}

function updateWelcomePreview() {
  const settings = collectWelcomeMessageSettings();
  const color = normalizeMessageColor(settings.color);
  const blocks = settings.blocks
    .map((block) => {
      if (block.type !== 'text') {
        return block;
      }

      return {
        ...block,
        content: replaceWelcomePreviewPlaceholders(block.content),
        accessory: block.accessory
          ? {
              ...block.accessory,
              label: replaceWelcomePreviewPlaceholders(block.accessory.label),
              url: resolveWelcomePreviewUrl(block.accessory.url),
            }
          : null,
      };
    })
    .filter((block) => block.type !== 'text' || block.content.trim());
  const buttons = settings.buttons
    .map((button) => ({
      ...button,
      label: replaceWelcomePreviewPlaceholders(button.label),
      url: resolveWelcomePreviewUrl(button.url),
    }))
    .filter((button) => button.label && button.url);

  welcomeDiscordPreview.classList.toggle('has-accent-color', Boolean(color));
  welcomeDiscordPreview.style.setProperty('--preview-accent', color || 'transparent');
  welcomePreviewImage.hidden = !state.welcomeImage;

  if (state.welcomeImage) {
    welcomePreviewImage.src = state.welcomeImage.dataUrl;
  } else {
    welcomePreviewImage.removeAttribute('src');
  }

  welcomePreviewSections.replaceChildren();

  for (const block of blocks) {
    if (block.type === 'text') {
      welcomePreviewSections.append(createTextPreviewBlock(block));
      continue;
    }

    const layout = document.createElement('div');
    layout.className = `preview-layout preview-layout-${block.type} preview-layout-${block.spacing}`;
    layout.setAttribute('aria-hidden', 'true');
    welcomePreviewSections.append(layout);
  }

  welcomePreviewButtons.replaceChildren();

  for (const button of buttons) {
    const anchor = document.createElement('a');

    anchor.className = 'preview-button';
    anchor.href = button.url;
    anchor.target = '_blank';
    anchor.rel = 'noreferrer';
    appendPreviewButtonContent(anchor, button);
    welcomePreviewButtons.append(anchor);
  }

  welcomeSectionCount.textContent = `${blocks.length} block${blocks.length === 1 ? '' : 's'}`;
  updateWelcomeButtonLimit();
}

function replaceWelcomePreviewPlaceholders(template) {
  const values = {
    member: '<@185282790969835520>',
    displayName: '5noof',
    username: '5noof',
    userId: '185282790969835520',
    serverName: state.guildName,
    memberCount: '1,337',
    avatarUrl: 'https://cdn.discordapp.com/embed/avatars/0.png',
    createdAt: '14 March 2025',
    joinedAt: 'Today',
  };

  return String(template || '').replace(/\{([a-zA-Z][a-zA-Z0-9]*)\}/g, (placeholder, key) =>
    Object.hasOwn(values, key) ? values[key] : placeholder,
  );
}

function resolveWelcomePreviewUrl(template) {
  const value = replaceWelcomePreviewPlaceholders(template).trim();

  if (!value) {
    return '';
  }

  try {
    const url = new URL(value);

    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : '';
  } catch {
    return '';
  }
}

function renderWelcomeMessageStorageStatus(storage) {
  welcomeMessageStorageStatus.classList.remove('ready', 'offline');

  if (!storage) {
    welcomeMessageStorageStatus.textContent = 'Storage unavailable';
    welcomeMessageStorageStatus.classList.add('offline');
    return;
  }

  if (storage.persistent) {
    welcomeMessageStorageStatus.textContent = storage.hasSavedSettings
      ? 'Saved persistently'
      : 'Persistent storage ready';
    welcomeMessageStorageStatus.classList.add('ready');
    welcomeMessageStorageStatus.title = `Storage: ${storage.source}`;
    return;
  }

  welcomeMessageStorageStatus.textContent = storage.hasSavedSettings
    ? 'Saved for this deployment'
    : 'Storage is temporary';
  welcomeMessageStorageStatus.classList.add('offline');
  welcomeMessageStorageStatus.title = 'Attach a Railway volume so settings survive bot restarts and redeploys.';
}

async function loadLiveEmbedSettings(showNotification = false, kind = state.activeEmbedBuilder) {
  const definition = embedBuilderDefinitions[kind];
  let result = await api(definition.endpoint);

  result = await restoreLiveEmbedBackupIfNeeded(result, kind);
  state.embedBuilderSettings[kind] = result.settings || {};
  state.embedBuilderStorage[kind] = result.storage || null;

  if (state.activeEmbedBuilder === kind) {
    applyLiveEmbedSettings(result.settings || {});
    renderLiveEmbedStorageStatus(result.storage);
    renderFeaturePageAvailability();
  }

  if (result.storage?.hasSavedSettings) {
    writeLiveEmbedBackup(result.settings, kind);
  }

  if (showNotification && state.activeEmbedBuilder === kind) {
    setSendStatus(`${definition.label} settings refreshed.`, 'success');
  }
}

function activateEmbedBuilder(kind) {
  const definition = embedBuilderDefinitions[kind];

  if (!definition) {
    return;
  }

  state.activeEmbedBuilder = kind;
  embedBuilderTitle.textContent = definition.title;
  embedBuilderSubtitle.textContent = definition.subtitle;
  embedTimestampLabel.textContent = definition.timestampLabel;
  embedSaveHint.textContent = definition.saveHint;
  embedPreviewSubtitle.textContent = definition.previewSubtitle;
  embedPlaceholderList.replaceChildren(
    ...definition.placeholders.map((placeholder) => {
      const element = document.createElement('code');
      element.textContent = `{${placeholder}}`;
      return element;
    }),
  );

  for (const button of embedBuilderButtons) {
    const isActive = button.dataset.embedBuilder === kind;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  }

  const settings = state.embedBuilderSettings[kind];

  if (settings) {
    applyLiveEmbedSettings(settings);
    renderLiveEmbedStorageStatus(state.embedBuilderStorage[kind]);
    renderFeaturePageAvailability();
    return;
  }

  renderFeaturePageAvailability();
  loadLiveEmbedSettings(false, kind).catch((error) => setSendStatus(error.message, 'error'));
}

async function restoreLiveEmbedBackupIfNeeded(result, kind) {
  const definition = embedBuilderDefinitions[kind];

  if (state.embedBuilderRestoreAttempted[kind] || result.storage?.hasSavedSettings) {
    return result;
  }

  const backup = readLiveEmbedBackup(kind);

  if (!backup) {
    return result;
  }

  state.embedBuilderRestoreAttempted[kind] = true;

  try {
    const restored = await api(definition.endpoint, {
      method: 'PUT',
      body: { settings: backup },
    });

    setSendStatus(
      `${definition.label} restored from this browser after the bot restart.`,
      'success',
    );
    return restored;
  } catch (error) {
    state.embedBuilderRestoreAttempted[kind] = false;
    setSendStatus(
      `Could not restore the ${definition.label.toLowerCase()} browser backup: ${error.message}`,
      'error',
    );
    return result;
  }
}

function applyLiveEmbedSettings(settings) {
  const embed = settings.embed || {};

  setChannelSelectValue(liveChannelIdInput, settings.channelId || '');
  liveContentInput.value = settings.content || '';
  liveTitleInput.value = embed.title || '';
  liveTitleUrlInput.value = embed.titleUrl || '';
  liveDescriptionInput.value = embed.description || '';
  liveColorInput.value = normalizeMessageColor(embed.color);
  liveColorPicker.value = liveColorInput.value || '#2DD4BF';
  liveAuthorNameInput.value = embed.authorName || '';
  liveAuthorUrlInput.value = embed.authorUrl || '';
  liveAuthorIconUrlInput.value = embed.authorIconUrl || '';
  liveThumbnailUrlInput.value = embed.thumbnailUrl || '';
  liveImageUrlInput.value = embed.imageUrl || '';
  liveFooterTextInput.value = embed.footerText || '';
  liveFooterIconUrlInput.value = embed.footerIconUrl || '';
  liveTimestampInput.checked = Boolean(embed.timestamp);
  liveFieldsContainer.replaceChildren();
  liveButtonsContainer.replaceChildren();

  for (const block of embed.fields || []) {
    if (block.type === 'divider' || block.type === 'spacer') {
      addLiveEmbedLayoutBlock(block.type, block.spacing);
    } else {
      addLiveEmbedField(block);
    }
  }

  for (const button of settings.buttons || []) {
    addLiveEmbedButton(button);
  }

  updateLiveEmbedPreview();
}

async function handleSaveLiveEmbed(event) {
  event.preventDefault();
  saveLiveEmbedButton.disabled = true;
  const kind = state.activeEmbedBuilder;
  const definition = embedBuilderDefinitions[kind];

  try {
    const result = await api(definition.endpoint, {
      method: 'PUT',
      body: { settings: collectLiveEmbedSettings() },
    });

    state.embedBuilderSettings[kind] = result.settings || {};
    state.embedBuilderStorage[kind] = result.storage || null;
    applyLiveEmbedSettings(result.settings || {});
    writeLiveEmbedBackup(result.settings, kind);
    renderLiveEmbedStorageStatus(result.storage);
    markBuilderSaved('creator', 'Saved to Bean');
    setSendStatus(`${definition.label} saved.`, 'success');
  } catch (error) {
    setSendStatus(error.message, 'error');
  } finally {
    saveLiveEmbedButton.disabled = false;
  }
}

function writeLiveEmbedBackup(settings, kind = state.activeEmbedBuilder) {
  if (!settings?.embed || !Array.isArray(settings.buttons) || !Array.isArray(settings.embed.fields)) {
    return;
  }

  try {
    window.localStorage.setItem(embedBuilderDefinitions[kind].storageKey, JSON.stringify(settings));
  } catch {
    // Server-side storage remains authoritative when browser storage is unavailable.
  }
}

function readLiveEmbedBackup(kind = state.activeEmbedBuilder) {
  try {
    const settings = JSON.parse(
      window.localStorage.getItem(embedBuilderDefinitions[kind].storageKey) || 'null',
    );

    if (!settings?.embed || !Array.isArray(settings.buttons) || !Array.isArray(settings.embed.fields)) {
      return null;
    }

    return settings;
  } catch {
    return null;
  }
}

function renderLiveEmbedStorageStatus(storage) {
  liveEmbedStorageStatus.classList.remove('ready', 'offline');

  if (!storage) {
    liveEmbedStorageStatus.textContent = 'Storage unavailable';
    liveEmbedStorageStatus.classList.add('offline');
    return;
  }

  if (storage.persistent) {
    liveEmbedStorageStatus.textContent = storage.hasSavedSettings
      ? 'Saved persistently'
      : 'Persistent storage ready';
    liveEmbedStorageStatus.classList.add('ready');
    liveEmbedStorageStatus.title = `Storage: ${storage.source}`;
    return;
  }

  liveEmbedStorageStatus.textContent = storage.hasSavedSettings
    ? 'Saved for this deployment'
    : 'Storage is temporary';
  liveEmbedStorageStatus.classList.add('offline');
  liveEmbedStorageStatus.title = 'Attach a Railway volume so settings survive bot restarts and redeploys.';
}

function collectLiveEmbedSettings() {
  return {
    channelId: liveChannelIdInput.value.trim(),
    content: liveContentInput.value,
    buttons: [...liveButtonsContainer.querySelectorAll('.live-button-block')].map((button) => ({
      label: button.querySelector('.live-button-label').value,
      url: button.querySelector('.live-button-url').value,
      emoji: button.querySelector('.live-button-emoji').value,
    })),
    embed: {
      title: liveTitleInput.value,
      titleUrl: liveTitleUrlInput.value,
      description: liveDescriptionInput.value,
      color: liveColorInput.value.trim(),
      authorName: liveAuthorNameInput.value,
      authorUrl: liveAuthorUrlInput.value,
      authorIconUrl: liveAuthorIconUrlInput.value,
      thumbnailUrl: liveThumbnailUrlInput.value,
      imageUrl: liveImageUrlInput.value,
      footerText: liveFooterTextInput.value,
      footerIconUrl: liveFooterIconUrlInput.value,
      timestamp: liveTimestampInput.checked,
      fields: [...liveFieldsContainer.querySelectorAll('.live-embed-block')].map((block) => {
        const type = block.dataset.blockType;

        if (type === 'divider' || type === 'spacer') {
          return {
            type,
            spacing: block.querySelector('.live-layout-spacing').value,
          };
        }

        return {
          type: 'field',
          name: block.querySelector('.live-field-name').value,
          value: block.querySelector('.live-field-value').value,
          inline: block.querySelector('.live-field-inline').checked,
        };
      }),
    },
  };
}

function addLiveEmbedField(field = {}, focus = false) {
  if (liveFieldsContainer.querySelectorAll('.live-embed-block').length >= 25) {
    setSendStatus('Live embeds can contain up to 25 fields and layout blocks.', 'error');
    return;
  }

  const block = document.createElement('section');
  block.className = 'live-field-block live-embed-block';
  block.dataset.blockType = 'field';
  block.innerHTML = `
    <div class="block-header">
      <h2>Embed Field</h2>
      <div class="block-actions">
        <button class="secondary move-live-field-up" type="button">Up</button>
        <button class="secondary move-live-field-down" type="button">Down</button>
        <button class="secondary remove-live-field" type="button">Remove</button>
      </div>
    </div>
    <div class="form-grid">
      <label class="field span-2">
        Field name
        <input class="live-field-name" maxlength="256" />
      </label>
      <label class="field span-2">
        Field value
        <textarea class="live-field-value compact-textarea" maxlength="1024"></textarea>
      </label>
      <label class="toggle-row span-2">
        <input class="live-field-inline" type="checkbox" />
        <span>Display inline</span>
      </label>
    </div>
  `;

  block.querySelector('.live-field-name').value = field.name || '';
  block.querySelector('.live-field-value').value = field.value || '';
  block.querySelector('.live-field-inline').checked = Boolean(field.inline);
  liveFieldsContainer.append(block);
  updateLiveFieldCount();

  if (focus) {
    block.querySelector('.live-field-name').focus();
  }

  updateLiveEmbedPreview();
}

function addLiveEmbedLayoutBlock(type, spacing = 'small') {
  if (liveFieldsContainer.querySelectorAll('.live-embed-block').length >= 25) {
    setSendStatus('Live embeds can contain up to 25 fields and layout blocks.', 'error');
    return;
  }

  const isDivider = type === 'divider';
  const block = document.createElement('section');

  block.className = 'live-field-block live-layout-block live-embed-block';
  block.dataset.blockType = isDivider ? 'divider' : 'spacer';
  block.innerHTML = `
    <div class="block-header">
      <h2>${isDivider ? 'Divider' : 'Spacer'}</h2>
      <div class="block-actions">
        <button class="secondary move-live-field-up" type="button">Up</button>
        <button class="secondary move-live-field-down" type="button">Down</button>
        <button class="secondary remove-live-field" type="button">Remove</button>
      </div>
    </div>
    <label class="field">
      Spacing
      <select class="live-layout-spacing">
        <option value="small">Small</option>
        <option value="large">Large</option>
      </select>
    </label>
  `;

  block.querySelector('.live-layout-spacing').value = spacing === 'large' ? 'large' : 'small';
  liveFieldsContainer.append(block);
  updateLiveFieldCount();
  updateLiveEmbedPreview();
}

function handleLiveFieldsClick(event) {
  const block = event.target.closest('.live-embed-block');

  if (!block) {
    return;
  }

  if (event.target.closest('.remove-live-field')) {
    block.remove();
  } else if (event.target.closest('.move-live-field-up') && block.previousElementSibling) {
    liveFieldsContainer.insertBefore(block, block.previousElementSibling);
  } else if (event.target.closest('.move-live-field-down') && block.nextElementSibling) {
    liveFieldsContainer.insertBefore(block.nextElementSibling, block);
  } else {
    return;
  }

  updateLiveFieldCount();
  updateLiveEmbedPreview();
}

function updateLiveFieldCount() {
  const count = liveFieldsContainer.querySelectorAll('.live-embed-block').length;
  liveFieldCount.textContent = `${count} / 25 block${count === 1 ? '' : 's'}`;
  addLiveFieldButton.disabled = count >= 25;
  addLiveDividerButton.disabled = count >= 25;
  addLiveSpacerButton.disabled = count >= 25;
}

function addLiveEmbedButton(button = {}, focus = false) {
  if (liveButtonsContainer.querySelectorAll('.live-button-block').length >= 5) {
    setSendStatus('Live announcements can contain up to 5 link buttons.', 'error');
    return;
  }

  const block = document.createElement('section');

  block.className = 'live-field-block live-button-block';
  block.innerHTML = `
    <div class="block-header">
      <h2>Link Button</h2>
      <div class="block-actions">
        <button class="secondary move-live-button-up" type="button">Up</button>
        <button class="secondary move-live-button-down" type="button">Down</button>
        <button class="secondary remove-live-button" type="button">Remove</button>
      </div>
    </div>
    <div class="form-grid">
      <label class="field">
        Label
        <input class="live-button-label" maxlength="80" />
      </label>
      <label class="field">
        Emoji
        <input class="live-button-emoji" maxlength="100" placeholder="🔥 or <:name:id>" />
      </label>
      <label class="field span-2">
        URL
        <input class="live-button-url" maxlength="512" placeholder="{streamUrl}" />
      </label>
    </div>
  `;

  block.querySelector('.live-button-label').value = button.label || '';
  block.querySelector('.live-button-emoji').value = button.emoji || '';
  block.querySelector('.live-button-url').value = button.url || '';
  liveButtonsContainer.append(block);
  updateLiveButtonCount();

  if (focus) {
    block.querySelector('.live-button-label').focus();
  }

  updateLiveEmbedPreview();
}

function handleLiveButtonsClick(event) {
  const block = event.target.closest('.live-button-block');

  if (!block) {
    return;
  }

  if (event.target.closest('.remove-live-button')) {
    block.remove();
  } else if (event.target.closest('.move-live-button-up') && block.previousElementSibling) {
    liveButtonsContainer.insertBefore(block, block.previousElementSibling);
  } else if (event.target.closest('.move-live-button-down') && block.nextElementSibling) {
    liveButtonsContainer.insertBefore(block.nextElementSibling, block);
  } else {
    return;
  }

  updateLiveButtonCount();
  updateLiveEmbedPreview();
}

function updateLiveButtonCount() {
  const count = liveButtonsContainer.querySelectorAll('.live-button-block').length;
  liveButtonCount.textContent = `${count} / 5 button${count === 1 ? '' : 's'}`;
  addLiveButton.disabled = count >= 5;
}

function handleLiveColorPickerInput() {
  liveColorInput.value = liveColorPicker.value.toUpperCase();
  updateLiveEmbedPreview();
}

function handleLiveColorInput() {
  const color = normalizeMessageColor(liveColorInput.value);

  if (color) {
    liveColorPicker.value = color;
  }

  updateLiveEmbedPreview();
}

function updateLiveEmbedPreview() {
  const settings = collectLiveEmbedSettings();
  const embed = settings.embed;
  const content = replaceLivePreviewPlaceholders(settings.content);
  const authorName = replaceLivePreviewPlaceholders(embed.authorName);
  const title = replaceLivePreviewPlaceholders(embed.title);
  const description = replaceLivePreviewPlaceholders(embed.description);
  const footerText = replaceLivePreviewPlaceholders(embed.footerText);
  const blocks = embed.fields
    .map((block) => {
      if (block.type === 'divider' || block.type === 'spacer') {
        return block;
      }

      return {
        type: 'field',
        name: replaceLivePreviewPlaceholders(block.name),
        value: replaceLivePreviewPlaceholders(block.value),
        inline: block.inline,
      };
    })
    .filter((block) => block.type !== 'field' || block.name || block.value);
  const buttons = settings.buttons
    .map((button) => ({
      label: replaceLivePreviewPlaceholders(button.label),
      url: resolveLivePreviewUrl(button.url),
      emoji: button.emoji || '',
    }))
    .filter((button) => button.label && button.url);

  livePreviewContent.textContent = content;
  livePreviewContent.hidden = !content;
  livePreviewCard.style.setProperty('--live-embed-color', normalizeMessageColor(embed.color) || '#4E5058');

  updateLivePreviewLink(
    livePreviewAuthorName,
    authorName,
    resolveLivePreviewUrl(embed.authorUrl),
  );
  livePreviewAuthor.hidden = !authorName;
  updateLivePreviewImage(livePreviewAuthorIcon, authorName ? resolveLivePreviewUrl(embed.authorIconUrl) : '');

  updateLivePreviewLink(livePreviewTitle, title, resolveLivePreviewUrl(embed.titleUrl));

  livePreviewDescription.textContent = description;
  livePreviewDescription.hidden = !description;

  updateLivePreviewImage(livePreviewThumbnail, resolveLivePreviewUrl(embed.thumbnailUrl));
  updateLivePreviewImage(livePreviewImage, resolveLivePreviewUrl(embed.imageUrl));

  livePreviewFields.replaceChildren();

  for (const block of blocks) {
    if (block.type === 'divider' || block.type === 'spacer') {
      const layoutElement = document.createElement('div');
      layoutElement.className =
        `live-preview-layout live-preview-layout-${block.type} live-preview-layout-${block.spacing}`;
      layoutElement.setAttribute('aria-hidden', 'true');
      livePreviewFields.append(layoutElement);
      continue;
    }

    const fieldElement = document.createElement('section');
    const nameElement = document.createElement('strong');
    const valueElement = document.createElement('p');

    fieldElement.className = `live-preview-field${block.inline ? ' inline' : ''}`;
    nameElement.textContent = block.name || 'Untitled field';
    valueElement.textContent = block.value || 'Empty field';
    fieldElement.append(nameElement, valueElement);
    livePreviewFields.append(fieldElement);
  }

  livePreviewButtons.replaceChildren();

  for (const button of buttons) {
    const anchor = document.createElement('a');

    anchor.className = 'live-preview-button';
    anchor.href = button.url;
    anchor.target = '_blank';
    anchor.rel = 'noreferrer';
    appendLivePreviewButtonContent(anchor, button);
    livePreviewButtons.append(anchor);
  }

  const timestampText = embed.timestamp
    ? new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date())
    : '';
  livePreviewFooterText.textContent = footerText;
  livePreviewTimestamp.textContent = timestampText ? `${footerText ? '• ' : ''}Today at ${timestampText}` : '';
  livePreviewFooter.hidden = !footerText && !timestampText;
  updateLivePreviewImage(livePreviewFooterIcon, footerText ? resolveLivePreviewUrl(embed.footerIconUrl) : '');

  const hasEmbed =
    authorName ||
    title ||
    description ||
    blocks.length > 0 ||
    !livePreviewThumbnail.hidden ||
    !livePreviewImage.hidden ||
    footerText ||
    timestampText;
  livePreviewCard.hidden = !hasEmbed && buttons.length === 0;
  updateLiveFieldCount();
  updateLiveButtonCount();
}

function appendLivePreviewButtonContent(anchor, button) {
  const customEmoji = button.emoji.match(/^<(a?):[^:>]+:(\d{17,20})>$/);

  if (customEmoji) {
    const image = document.createElement('img');
    const extension = customEmoji[1] ? 'gif' : 'webp';

    image.className = 'live-preview-button-emoji';
    image.src = `https://cdn.discordapp.com/emojis/${customEmoji[2]}.${extension}?size=32&quality=lossless`;
    image.alt = '';
    anchor.append(image, document.createTextNode(button.label));
    return;
  }

  anchor.textContent = button.emoji ? `${button.emoji} ${button.label}` : button.label;
}

function replaceLivePreviewPlaceholders(template) {
  const sharedValues = {
    member: '<@185282790969835520>',
    displayName: '5noof',
    avatarUrl: 'https://cdn.discordapp.com/embed/avatars/0.png',
  };
  const values = state.activeEmbedBuilder === 'youtube'
    ? {
        ...sharedValues,
        videoTitle: 'Go To Sleep While I Run The Best Restaurant in Town',
        videoUrl: 'https://www.youtube.com/watch?v=67rGoXhQcvA',
        videoId: '67rGoXhQcvA',
        thumbnailUrl: 'https://i.ytimg.com/vi/67rGoXhQcvA/hqdefault.jpg',
        channelHandle: '@5nooof',
        channelUrl: 'https://www.youtube.com/@5nooof',
        publishedAt: '26 July 2026',
      }
    : {
        ...sharedValues,
        streamTitle: 'Building something under control',
        streamUrl: 'https://twitch.tv/5noof',
        gameName: 'Just Chatting',
        twitchUsername: '5noof',
        previewUrl: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_5noof-1920x1080.jpg',
      };

  return String(template || '').replace(/\{([a-zA-Z][a-zA-Z0-9]*)\}/g, (placeholder, key) =>
    Object.hasOwn(values, key) ? values[key] : placeholder,
  );
}

function resolveLivePreviewUrl(template) {
  const value = replaceLivePreviewPlaceholders(template).trim();

  if (!value) {
    return '';
  }

  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : '';
  } catch {
    return '';
  }
}

function updateLivePreviewLink(element, text, url) {
  element.textContent = text;
  element.hidden = !text;

  if (url) {
    element.href = url;
    element.target = '_blank';
    element.rel = 'noreferrer';
  } else {
    element.removeAttribute('href');
    element.removeAttribute('target');
    element.removeAttribute('rel');
  }
}

function updateLivePreviewImage(element, url) {
  element.hidden = !url;

  if (url) {
    element.src = url;
  } else {
    element.removeAttribute('src');
  }
}

function setSendStatus(message, type) {
  if (!message) {
    return;
  }

  showToast(message, type);
}

function showToast(message, type = '') {
  const toast = document.createElement('section');
  const close = document.createElement('button');

  toast.className = `toast ${type === 'error' ? 'error' : 'success'}`;
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  close.className = 'toast-close';
  close.type = 'button';
  close.setAttribute('aria-label', 'Dismiss notification');
  close.textContent = 'Close';
  close.addEventListener('click', () => dismissToast(toast));
  toast.append(close);
  toastRegion.append(toast);

  window.setTimeout(() => dismissToast(toast), type === 'error' ? 7000 : 4500);
}

function dismissToast(toast) {
  if (!toast.isConnected || toast.classList.contains('is-hiding')) {
    return;
  }

  toast.classList.add('is-hiding');
  window.setTimeout(() => toast.remove(), 220);
}

function setApiStatus(message, type) {
  apiStatus.textContent = message;
  apiStatus.classList.toggle('success', type === 'success');
  apiStatus.classList.toggle('error', type === 'error');
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result));
    reader.addEventListener('error', () => reject(new Error('Could not read image.')));
    reader.readAsDataURL(file);
  });
}

async function api(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const headers = {};
  const sessionToken = getSessionToken();

  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  if (sessionToken) {
    headers.Authorization = `Bearer ${sessionToken}`;
  }

  let response;

  try {
    response = await fetch(path, {
      method: options.method || 'GET',
      headers: Object.keys(headers).length ? headers : undefined,
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: 'no-store',
      credentials: 'same-origin',
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('The dashboard API did not respond. Check the Railway deployment logs.');
    }

    throw new Error('Could not reach the dashboard API. Refresh the page and check Railway logs.');
  } finally {
    clearTimeout(timeout);
  }

  const text = await response.text();
  let data = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text.slice(0, 200) };
    }
  }

  if (!response.ok) {
    throw new Error(data.error || 'Request failed.');
  }

  return data;
}

function getSessionToken() {
  try {
    return window.localStorage.getItem(sessionStorageKey);
  } catch {
    return null;
  }
}

function setSessionToken(value) {
  try {
    window.localStorage.setItem(sessionStorageKey, value);
  } catch {
    // Cookies can still carry the session if local storage is unavailable.
  }
}

function clearSessionToken() {
  try {
    window.localStorage.removeItem(sessionStorageKey);
  } catch {
    // Ignore storage failures; logout still clears the server cookie.
  }
}

function normalizePresenceStatus(value) {
  const status = String(value || '').toLowerCase();

  return ['online', 'idle', 'dnd', 'invisible'].includes(status) ? status : 'online';
}

function normalizeActivityType(value) {
  const activityType = String(value || '').toLowerCase();
  const match = ['Watching', 'Playing', 'Listening', 'Competing', 'Streaming'].find(
    (type) => type.toLowerCase() === activityType,
  );

  return match || 'Watching';
}

function normalizePresenceInterval(value) {
  const interval = Number.parseInt(value, 10);

  return Number.isInteger(interval) && interval >= 5 && interval <= 86400 ? interval : 30;
}

function updatePresenceUrlVisibility() {
  const isStreaming = presenceActivityTypeInput.value === 'Streaming';

  presenceUrlField.hidden = !isStreaming;
  presenceActivityUrlInput.disabled = !isStreaming;
}

function normalizeBlockSpacing(spacing) {
  return String(spacing || '').toLowerCase() === 'large' ? 'large' : 'small';
}

function sanitizeAccessory(accessory) {
  if (!accessory || typeof accessory !== 'object') {
    return null;
  }

  const label = String(accessory.label || '');
  const url = String(accessory.url || '');

  return label || url ? { label, url } : null;
}

function collectAccessory(block) {
  if (!block.querySelector('.accessory-enabled')?.checked) {
    return null;
  }

  return {
    label: block.querySelector('.accessory-label').value,
    url: block.querySelector('.accessory-url').value,
  };
}

function updateAccessoryFields(block) {
  block.querySelector('.accessory-fields').hidden = !block.querySelector('.accessory-enabled').checked;
}

function moveBlock(block, direction) {
  if (direction < 0 && block.previousElementSibling) {
    sectionsContainer.insertBefore(block, block.previousElementSibling);
  }

  if (direction > 0 && block.nextElementSibling) {
    sectionsContainer.insertBefore(block.nextElementSibling, block);
  }

  updatePreview();
}

function createTextPreviewBlock(block) {
  const accessory = block.accessory?.label?.trim() && block.accessory?.url?.trim() ? block.accessory : null;

  if (!accessory) {
    const pre = document.createElement('pre');
    pre.className = 'preview-section';
    pre.textContent = block.content.trim();
    return pre;
  }

  const wrapper = document.createElement('div');
  const pre = document.createElement('pre');
  const button = document.createElement('a');

  wrapper.className = 'preview-section-with-accessory';
  pre.className = 'preview-section';
  pre.textContent = block.content.trim();
  button.className = 'preview-button preview-accessory-button';
  button.href = accessory.url;
  button.target = '_blank';
  button.rel = 'noreferrer';
  appendPreviewButtonContent(button, accessory);
  wrapper.append(pre, button);

  return wrapper;
}

function appendPreviewButtonContent(anchor, button) {
  const customEmoji = String(button.emoji || '').match(/^<(a?):[^:>]+:(\d{17,20})>$/);

  if (customEmoji) {
    const image = document.createElement('img');
    const extension = customEmoji[1] ? 'gif' : 'webp';

    image.className = 'preview-button-emoji';
    image.src = `https://cdn.discordapp.com/emojis/${customEmoji[2]}.${extension}?size=32&quality=lossless`;
    image.alt = '';
    anchor.append(image, document.createTextNode(button.label));
    return;
  }

  anchor.textContent = button.emoji ? `${button.emoji} ${button.label}` : button.label;
}
