const { Events } = require('discord.js');

const {
  ensureCommunityGrowthProfile,
  recordMeaningfulMessage,
  recordMeaningfulReaction,
  recordVoiceParticipation,
} = require('../utils/communityGrowth');
const { config } = require('../utils/config');
const { listMemberModerationCases } = require('../utils/moderationCases');

const voiceSessions = new Map();
const goodStandingCache = new Map();

module.exports = {
  name: 'community growth',
  setup(client) {
    client.on(Events.MessageCreate, (message) => {
      handleGrowthMessage(message).catch((error) => {
        console.error('Community Growth message tracking failed:', error);
      });
    });
    client.on(Events.MessageReactionAdd, (reaction, user) => {
      handleGrowthReaction(reaction, user).catch((error) => {
        console.error('Community Growth reaction tracking failed:', error);
      });
    });
    client.on(Events.VoiceStateUpdate, (oldState, newState) => {
      handleGrowthVoiceState(oldState, newState).catch((error) => {
        console.error('Community Growth voice tracking failed:', error);
      });
    });
    client.once(Events.ClientReady, () => seedVoiceSessions(client));
  },
};

async function handleGrowthMessage(message) {
  if (!message.guild || !message.author || message.author.bot || message.webhookId) {
    return;
  }

  const goodStanding = await memberHasGoodStanding(message.guild.id, message.author.id);

  await recordMeaningfulMessage(config, {
    guildId: message.guild.id,
    userId: message.author.id,
    displayName: message.member?.displayName || message.author.globalName || message.author.username,
    username: message.author.username,
    avatarUrl: message.author.displayAvatarURL?.({ size: 256 }),
    channelId: message.channelId,
    roleIds: getMemberRoleIds(message.member),
    content: message.content,
    createdAt: message.createdAt || new Date(message.createdTimestamp || Date.now()),
    goodStanding,
  });
}

async function handleGrowthReaction(reaction, user) {
  if (!user || user.bot) {
    return;
  }

  if (reaction.partial) {
    reaction = await reaction.fetch().catch(() => null);
  }
  if (reaction?.message?.partial) {
    await reaction.message.fetch().catch(() => null);
  }

  const message = reaction?.message;
  const author = message?.author;

  if (!message?.guild || !author || author.bot || author.id === user.id) {
    return;
  }

  const recipientMember = message.member
    || await message.guild.members.fetch(author.id).catch(() => null);

  await recordMeaningfulReaction(config, {
    guildId: message.guild.id,
    messageId: message.id,
    messageCreatedAt: message.createdAt || new Date(message.createdTimestamp || 0),
    channelId: message.channelId,
    reactorId: user.id,
    recipientId: author.id,
    recipientDisplayName: recipientMember?.displayName || author.globalName || author.username,
    recipientUsername: author.username,
    recipientAvatarUrl: author.displayAvatarURL?.({ size: 256 }),
    recipientRoleIds: getMemberRoleIds(recipientMember),
    createdAt: new Date(),
  });
}

async function handleGrowthVoiceState(oldState, newState) {
  const member = newState.member || oldState.member;

  if (!member || member.user?.bot) {
    return;
  }

  const oldChannelId = oldState.channelId;
  const newChannelId = newState.channelId;

  if (oldChannelId === newChannelId) {
    return;
  }

  const key = `${member.guild.id}:${member.id}`;

  if (oldChannelId) {
    const session = voiceSessions.get(key);

    if (session && session.channelId === oldChannelId) {
      voiceSessions.delete(key);
      const endedAt = new Date();
      const durationMinutes = (endedAt.getTime() - session.startedAt) / 60000;
      const goodStanding = await memberHasGoodStanding(member.guild.id, member.id);

      await recordVoiceParticipation(config, {
        guildId: member.guild.id,
        userId: member.id,
        displayName: member.displayName || member.user.globalName || member.user.username,
        username: member.user.username,
        avatarUrl: member.user.displayAvatarURL?.({ size: 256 }),
        channelId: oldChannelId,
        roleIds: getMemberRoleIds(member),
        durationMinutes,
        endedAt,
        goodStanding,
      });
    }
  }

  if (newChannelId) {
    voiceSessions.set(key, {
      guildId: member.guild.id,
      userId: member.id,
      channelId: newChannelId,
      startedAt: Date.now(),
    });
    await ensureCommunityGrowthProfile(config, {
      guildId: member.guild.id,
      userId: member.id,
      displayName: member.displayName || member.user.globalName || member.user.username,
      username: member.user.username,
      avatarUrl: member.user.displayAvatarURL?.({ size: 256 }),
    });
  }
}

function seedVoiceSessions(client) {
  for (const guild of client.guilds.cache.values()) {
    for (const voiceState of guild.voiceStates.cache.values()) {
      if (!voiceState.channelId || voiceState.member?.user?.bot) continue;

      voiceSessions.set(`${guild.id}:${voiceState.id}`, {
        guildId: guild.id,
        userId: voiceState.id,
        channelId: voiceState.channelId,
        startedAt: Date.now(),
      });
    }
  }
}

async function memberHasGoodStanding(guildId, userId) {
  const day = new Date().toISOString().slice(0, 10);
  const key = `${guildId}:${userId}:${day}`;

  if (goodStandingCache.has(key)) {
    return goodStandingCache.get(key);
  }

  const cases = await listMemberModerationCases(config, guildId, userId, 10).catch(() => []);
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const goodStanding = !cases.some(
    (moderationCase) => moderationCase.status === 'active'
      && new Date(moderationCase.createdAt).getTime() >= cutoff,
  );

  goodStandingCache.set(key, goodStanding);
  if (goodStandingCache.size > 5000) {
    goodStandingCache.clear();
    goodStandingCache.set(key, goodStanding);
  }
  return goodStanding;
}

function getMemberRoleIds(member) {
  if (!member?.roles?.cache) {
    return [];
  }

  return [...member.roles.cache.keys()];
}

module.exports.handleGrowthMessage = handleGrowthMessage;
module.exports.handleGrowthReaction = handleGrowthReaction;
module.exports.handleGrowthVoiceState = handleGrowthVoiceState;
