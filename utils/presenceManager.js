const { ActivityType } = require('discord.js');

const { config } = require('./config');

const activityTypes = {
  Playing: ActivityType.Playing,
  Streaming: ActivityType.Streaming,
  Listening: ActivityType.Listening,
  Watching: ActivityType.Watching,
  Competing: ActivityType.Competing,
};

let activeClient = null;
let rotationTimer = null;
let currentActivityIndex = 0;
let activePresence = {
  status: 'online',
  activityType: 'Watching',
  activityNames: [...config.presenceTexts],
  activityUrl: '',
  intervalSeconds: config.presenceRotationSeconds,
};

function startPresenceRotation(client) {
  activeClient = client;
  restartPresenceRotation();
}

function updatePresenceRotation(client, presence) {
  activeClient = client;
  activePresence = {
    status: presence.status,
    activityType: presence.activityType,
    activityNames: [...presence.activityNames],
    activityUrl: presence.activityUrl,
    intervalSeconds: presence.intervalSeconds,
  };
  restartPresenceRotation();
}

function restartPresenceRotation() {
  stopPresenceRotation();
  currentActivityIndex = 0;
  applyCurrentPresence();

  if (activePresence.activityNames.length > 1) {
    rotationTimer = setInterval(() => {
      currentActivityIndex = (currentActivityIndex + 1) % activePresence.activityNames.length;
      applyCurrentPresence();
    }, activePresence.intervalSeconds * 1000);
  }
}

function stopPresenceRotation() {
  if (rotationTimer) {
    clearInterval(rotationTimer);
    rotationTimer = null;
  }
}

function applyCurrentPresence() {
  if (!activeClient?.isReady() || !activeClient.user) {
    return;
  }

  const activityName = activePresence.activityNames[currentActivityIndex] || '';
  const activity = createDiscordActivity(activityName);

  activeClient.user.setPresence({
    activities: activity ? [activity] : [],
    status: activePresence.status,
  });
}

function createDiscordActivity(name) {
  if (!name) {
    return null;
  }

  const activity = {
    name,
    type: activityTypes[activePresence.activityType],
  };

  if (activePresence.activityType === 'Streaming') {
    activity.url = activePresence.activityUrl;
  }

  return activity;
}

function getPresenceState() {
  return {
    ...activePresence,
    activityNames: [...activePresence.activityNames],
    currentActivityName: activePresence.activityNames[currentActivityIndex] || '',
  };
}

module.exports = {
  getPresenceState,
  startPresenceRotation,
  updatePresenceRotation,
};
