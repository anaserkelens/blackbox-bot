const loginView = document.querySelector('#login-view');
const dashboardView = document.querySelector('#dashboard-view');
const loginForm = document.querySelector('#login-form');
const loginError = document.querySelector('#login-error');
const loginButton = document.querySelector('#login-button');
const basicLoginButton = document.querySelector('#basic-login-button');
const apiStatus = document.querySelector('#api-status');
const passwordInput = document.querySelector('#password');
const logoutButton = document.querySelector('#logout');
const botStatus = document.querySelector('#bot-status');
const overviewBotStatus = document.querySelector('#overview-bot-status');
const dashboardApiStatus = document.querySelector('#dashboard-api-status');
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
const tabButtons = [...document.querySelectorAll('.tab-button')];
const tabLinks = [...document.querySelectorAll('[data-tab-link]')];
const tabPanels = [...document.querySelectorAll('.tab-panel')];
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
const sessionStorageKey = 'blackbox_dashboard_session';
const savedMessagesStorageKey = 'blackbox_dashboard_saved_messages';
const presenceStorageKey = 'blackbox_dashboard_presence';
const liveEmbedStorageKey = 'blackbox_dashboard_live_embed';
const welcomeEmbedStorageKey = 'blackbox_dashboard_welcome_embed';
const welcomeMessageId = 'welcome-message';

const embedBuilderDefinitions = {
  live: {
    endpoint: '/api/stream-embed',
    storageKey: liveEmbedStorageKey,
  },
};

const state = {
  currentMessageId: null,
  image: null,
  botAvatarImage: null,
  botBannerImage: null,
  savedMessages: [],
  moderationCases: [],
  moderationCaseStorage: null,
  selectedCaseNumber: null,
  composerInitialized: false,
  welcomeImage: null,
  welcomeSettings: null,
  welcomeStorage: null,
  welcomeRestoreAttempted: false,
  activeEmbedBuilder: 'live',
  embedBuilderSettings: { live: null },
  embedBuilderStorage: { live: null },
  embedBuilderRestoreAttempted: { live: false },
  presenceRestoreAttempted: false,
  savedMessagesRefreshTimer: null,
  savedMessagesRequest: null,
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
  bindEvents();
  renderSavedMessages();

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
  loginForm.addEventListener('submit', handleLogin);
  logoutButton.addEventListener('click', handleLogout);
  tabButtons.forEach((button) => button.addEventListener('click', () => setActiveTab(button.dataset.tab)));
  tabLinks.forEach((button) => button.addEventListener('click', () => setActiveTab(button.dataset.tabLink)));
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
  composer.addEventListener('submit', handleSend);
  messageColorPicker.addEventListener('input', handleMessageColorPickerInput);
  messageColorInput.addEventListener('input', handleMessageColorInput);
  savedMessagesContainer.addEventListener('click', handleSavedMessageClick);
  refreshCasesButton.addEventListener('click', () => {
    loadModerationCases(true).catch((error) => setSendStatus(error.message, 'error'));
  });
  caseSearchInput.addEventListener('input', renderModerationCases);
  caseActionFilter.addEventListener('change', renderModerationCases);
  caseStatusFilter.addEventListener('change', renderModerationCases);
  caseDateFilter.addEventListener('change', renderModerationCases);
  caseList.addEventListener('click', handleCaseListClick);
  caseReasonForm.addEventListener('submit', handleCaseReasonSave);
  caseRevokeForm.addEventListener('submit', handleCaseRevocation);
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
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && getActiveTab() === 'messages' && !dashboardView.hidden) {
      loadSavedMessages({ silent: true }).catch(() => null);
    }
  });
}

async function handleLogin(event) {
  if (event.submitter === basicLoginButton) {
    passwordInput.value = passwordInput.value.trim();
    return;
  }

  event.preventDefault();
  loginError.textContent = '';
  loginButton.disabled = true;
  basicLoginButton.disabled = true;
  loginButton.textContent = 'Checking API...';

  try {
    await api('/api/ping');
    loginButton.textContent = 'Logging in...';

    const loginResult = await api('/api/login', {
      method: 'POST',
      body: { password: passwordInput.value.trim() },
    });

    if (loginResult.sessionToken) {
      setSessionToken(loginResult.sessionToken);
    }

    const session = await api('/api/session').catch(() => loginResult);

    if (!session?.ok) {
      throw new Error('Password accepted, but the dashboard session could not be verified. Refresh and try again.');
    }

    showDashboard(session);
  } catch (error) {
    loginError.textContent = error.message;
  } finally {
    loginButton.disabled = false;
    basicLoginButton.disabled = false;
    loginButton.textContent = 'Log in';
  }
}

async function checkApiStatus() {
  setApiStatus(`Checking API on ${window.location.origin}...`, '');

  try {
    const health = await api('/health');
    const ping = await api('/api/ping');
    const botText = ping.botReady || health.botReady ? `Bot online${ping.tag ? `: ${ping.tag}` : ''}` : 'Bot not ready';

    setApiStatus(`API connected. ${botText}.`, 'success');
    dashboardApiStatus.textContent = 'Connected';
  } catch (error) {
    setApiStatus(`API check failed on ${window.location.origin}: ${error.message}`, 'error');
    dashboardApiStatus.textContent = 'Check failed';
  }
}

async function handleLogout() {
  await api('/api/logout', { method: 'POST', body: {} }).catch(() => null);
  clearSessionToken();
  stopSavedMessagesSync();
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
    setSendStatus(`Sent to ${payload.channelId}.${link}`, 'success');
  } catch (error) {
    setSendStatus(error.message, 'error');
  } finally {
    sendButton.disabled = false;
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

  setBotStatus(Boolean(bot.botReady), bot.tag);
  botProfileTag.textContent = bot.tag || 'Bot not ready';
  botProfileName.textContent = bot.username || bot.tag || 'Blackbox';
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

function showLogin() {
  dashboardView.hidden = true;
  loginView.hidden = false;
  document.body.classList.add('login-active');
  document.body.classList.remove('dashboard-active');

  if (new URLSearchParams(window.location.search).get('loginError') === 'invalid') {
    loginError.textContent = 'Invalid dashboard password.';
    window.history.replaceState({}, '', '/');
  }

  passwordInput.focus();
}

function showDashboard(session) {
  loginView.hidden = true;
  dashboardView.hidden = false;
  document.body.classList.remove('login-active');
  document.body.classList.add('dashboard-active');
  setBotStatus(Boolean(session?.botReady), session?.tag);
  setActiveTab(getActiveTab());
  renderSavedMessages();
  loadSavedMessages().catch((error) => setSendStatus(error.message, 'error'));
  refreshBotSettings().catch((error) => setSendStatus(error.message, 'error'));

  if (!state.composerInitialized) {
    resetComposer();
    state.composerInitialized = true;
  }
}

function setBotStatus(isReady, tag) {
  const text = isReady ? `Online${tag ? `: ${tag}` : ''}` : 'Bot not ready';

  botStatus.textContent = text;
  overviewBotStatus.textContent = text;
  botStatus.classList.toggle('ready', isReady);
  botStatus.classList.toggle('offline', !isReady);
}

function getActiveTab() {
  return tabButtons.find((button) => button.getAttribute('aria-selected') === 'true')?.dataset.tab || 'overview';
}

function setActiveTab(tab) {
  const nextTab = tabButtons.some((button) => button.dataset.tab === tab) ? tab : 'overview';

  for (const button of tabButtons) {
    button.setAttribute('aria-selected', String(button.dataset.tab === nextTab));
  }

  for (const panel of tabPanels) {
    panel.hidden = panel.dataset.panel !== nextTab;
  }

  if (nextTab === 'bot' && !dashboardView.hidden) {
    refreshBotSettings().catch((error) => setSendStatus(error.message, 'error'));
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

  if (nextTab === 'messages' && !dashboardView.hidden) {
    startSavedMessagesSync();
    loadSavedMessages().catch((error) => setSendStatus(error.message, 'error'));
  } else {
    stopSavedMessagesSync();
  }
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

async function loadModerationCases(showNotification = false) {
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
  renderModerationCases();
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
  channelInput.value = message.channelId || '';
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
  welcomeChannelIdInput.value = settings.channelId || '';
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
    serverName: 'UNDR CTRL',
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
  }

  if (result.storage?.hasSavedSettings) {
    writeLiveEmbedBackup(result.settings, kind);
  }

  if (showNotification && state.activeEmbedBuilder === kind) {
    setSendStatus(`${kind === 'welcome' ? 'Welcome message' : 'Live embed'} settings refreshed.`, 'success');
  }
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
      `${kind === 'welcome' ? 'Welcome message' : 'Live embed'} restored from this browser after the bot restart.`,
      'success',
    );
    return restored;
  } catch (error) {
    state.embedBuilderRestoreAttempted[kind] = false;
    setSendStatus(
      `Could not restore the ${kind === 'welcome' ? 'welcome message' : 'live embed'} browser backup: ${error.message}`,
      'error',
    );
    return result;
  }
}

function applyLiveEmbedSettings(settings) {
  const embed = settings.embed || {};

  liveChannelIdInput.value = settings.channelId || '';
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
    setSendStatus(`${kind === 'welcome' ? 'Welcome message' : 'Live embed'} saved.`, 'success');
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
  const values = state.activeEmbedBuilder === 'welcome'
    ? {
        ...sharedValues,
        username: '5noof',
        userId: '185282790969835520',
        serverName: 'UNDR CTRL',
        memberCount: '1,337',
        createdAt: '14 March 2025',
        joinedAt: 'Today',
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
