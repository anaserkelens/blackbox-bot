const { ActivityType, Events } = require('discord.js');

const { config } = require('../utils/config');
const { loadProgressionState, recordProgressBatch } = require('../utils/progression');
const { createMissionCompletionPayload } = require('../utils/progressionDisplay');

const recentJoins = new Map();
const welcomeCredits = new Map();
const messageCooldowns = new Map();
let settingsCache = null;
let settingsCacheExpiresAt = 0;

module.exports = {
  name: 'progressionTracker',
  setup(client) {
    client.on(Events.GuildMemberAdd, (member) => {
      if (!member.user.bot) {
        rememberRecentJoin(member);
      }
    });
    client.on(Events.MessageCreate, (message) => {
      handleProgressionMessage(message, client).catch((error) => {
        console.error('Progression message tracking failed:', error);
      });
    });
    client.once(Events.ClientReady, () => {
      const timer = setInterval(() => {
        runProgressionTick(client).catch((error) => {
          console.error('Progression activity tracking failed:', error);
        });
      }, 60000);

      timer.unref?.();
    });
  },
};

async function handleProgressionMessage(message, client) {
  if (!message.guild || !message.author || message.author.bot) {
    return [];
  }

  const settings = await getTrackerSettings();

  if (!settings.enabled) {
    return [];
  }

  const entries = [];
  const memberTag = message.member?.displayName || message.author.tag || message.author.username;
  const content = String(message.content || '').trim();
  const cooldownKey = `${message.guild.id}:${message.author.id}`;
  const lastMessageCredit = messageCooldowns.get(cooldownKey) || 0;
  const cooldownMs = settings.messageCooldownSeconds * 1000;

  if (
    content.length >= settings.minimumMessageLength &&
    Date.now() - lastMessageCredit >= cooldownMs
  ) {
    messageCooldowns.set(cooldownKey, Date.now());
    entries.push(createProgressEntry(message.guild.id, message.author.id, memberTag, 'message_count'));
  }

  const joinedMembers = recentJoins.get(message.guild.id);
  const creditedWelcomes = welcomeCredits.get(message.guild.id) || new Set();
  let welcomedCount = 0;

  if (joinedMembers && message.mentions?.users) {
    for (const mentionedUser of message.mentions.users.values()) {
      const joinedAt = joinedMembers.get(mentionedUser.id);
      const creditKey = `${message.author.id}:${mentionedUser.id}`;

      if (
        mentionedUser.id !== message.author.id &&
        joinedAt &&
        Date.now() - joinedAt <= settings.welcomeWindowHours * 60 * 60 * 1000 &&
        !creditedWelcomes.has(creditKey)
      ) {
        creditedWelcomes.add(creditKey);
        welcomedCount += 1;
      }
    }
  }

  if (welcomedCount > 0) {
    welcomeCredits.set(message.guild.id, creditedWelcomes);
    entries.push(
      createProgressEntry(
        message.guild.id,
        message.author.id,
        memberTag,
        'welcome_count',
        welcomedCount,
      ),
    );
  }

  pruneTrackerCaches(settings);
  const completions = await recordProgressBatch(config, entries);

  await notifyProgressionCompletions(client, completions);
  return completions;
}

async function runProgressionTick(client, now = new Date()) {
  const settings = await getTrackerSettings();

  if (!settings.enabled) {
    return [];
  }

  const entries = [];

  for (const guild of client.guilds.cache.values()) {
    for (const channel of guild.channels.cache.values()) {
      if (typeof channel.isVoiceBased !== 'function' || !channel.isVoiceBased() || !channel.members) {
        continue;
      }

      if (settings.excludeAfkChannel && guild.afkChannelId === channel.id) {
        continue;
      }

      const humanMembers = [...channel.members.values()].filter((member) => !member.user.bot);

      if (humanMembers.length < settings.minimumVoiceParticipants) {
        continue;
      }

      const gameGroups = new Map();

      for (const member of humanMembers) {
        const voice = member.voice;

        if (
          settings.excludeDeafened &&
          (voice?.selfDeaf || voice?.serverDeaf)
        ) {
          continue;
        }

        entries.push(createProgressEntry(guild.id, member.id, getMemberTag(member), 'voice_minutes'));

        const gameActivity = findPlayingActivity(member.presence);

        if (gameActivity) {
          const gameKey = gameActivity.name.trim().toLowerCase();
          const group = gameGroups.get(gameKey) || [];

          group.push({ member, gameName: gameActivity.name });
          gameGroups.set(gameKey, group);
        }
      }

      for (const group of gameGroups.values()) {
        if (group.length < 2) {
          continue;
        }

        for (const { member, gameName } of group) {
          entries.push(
            createProgressEntry(
              guild.id,
              member.id,
              getMemberTag(member),
              'squad_gaming_minutes',
              1,
              { gameName },
            ),
          );
        }
      }
    }

    for (const member of guild.members.cache.values()) {
      if (member.user.bot) {
        continue;
      }

      const gameActivity = findPlayingActivity(member.presence);
      const streamingActivity = findStreamingActivity(member.presence);

      if (gameActivity) {
        entries.push(
          createProgressEntry(
            guild.id,
            member.id,
            getMemberTag(member),
            'gaming_minutes',
            1,
            { gameName: gameActivity.name },
          ),
        );
      }

      if (streamingActivity || member.voice?.streaming) {
        entries.push(
          createProgressEntry(
            guild.id,
            member.id,
            getMemberTag(member),
            'streaming_minutes',
            1,
            { gameName: gameActivity?.name || streamingActivity?.name || '' },
          ),
        );
      }
    }
  }

  const completions = await recordProgressBatch(config, entries, now);

  await notifyProgressionCompletions(client, completions);
  return completions;
}

function rememberRecentJoin(member, joinedAt = Date.now()) {
  const guildJoins = recentJoins.get(member.guild.id) || new Map();

  guildJoins.set(member.id, joinedAt);
  recentJoins.set(member.guild.id, guildJoins);
}

async function notifyProgressionCompletions(client, completions) {
  for (const completion of completions) {
    const user = await client.users.fetch(completion.userId).catch(() => null);

    if (!user) {
      continue;
    }

    await user.send(createMissionCompletionPayload(completion)).catch(() => null);
  }
}

async function getTrackerSettings() {
  if (settingsCache && Date.now() < settingsCacheExpiresAt) {
    return settingsCache;
  }

  const state = await loadProgressionState(config);

  settingsCache = state.settings;
  settingsCacheExpiresAt = Date.now() + 30000;
  return settingsCache;
}

function pruneTrackerCaches(settings) {
  const joinCutoff = Date.now() - settings.welcomeWindowHours * 60 * 60 * 1000;
  const cooldownCutoff = Date.now() - Math.max(3600000, settings.messageCooldownSeconds * 2000);

  for (const [guildId, joins] of recentJoins) {
    for (const [userId, joinedAt] of joins) {
      if (joinedAt < joinCutoff) {
        joins.delete(userId);
      }
    }

    if (joins.size === 0) {
      recentJoins.delete(guildId);
      welcomeCredits.delete(guildId);
    }
  }

  for (const [key, creditedAt] of messageCooldowns) {
    if (creditedAt < cooldownCutoff) {
      messageCooldowns.delete(key);
    }
  }
}

function createProgressEntry(guildId, userId, userTag, metric, amount = 1, context = {}) {
  return {
    guildId,
    userId,
    userTag,
    metric,
    amount,
    context,
  };
}

function findPlayingActivity(presence) {
  return presence?.activities?.find(
    (activity) => activity.type === ActivityType.Playing && activity.name,
  ) || null;
}

function findStreamingActivity(presence) {
  return presence?.activities?.find(
    (activity) => activity.type === ActivityType.Streaming,
  ) || null;
}

function getMemberTag(member) {
  return member.displayName || member.user.globalName || member.user.tag || member.user.username;
}

module.exports.handleProgressionMessage = handleProgressionMessage;
module.exports.rememberRecentJoin = rememberRecentJoin;
module.exports.runProgressionTick = runProgressionTick;
