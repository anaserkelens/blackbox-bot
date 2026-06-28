const { Events } = require('discord.js');

const { config } = require('../utils/config');
const {
  colors,
  formatChannel,
  formatDuration,
  formatUser,
  sendStructuredLog,
} = require('../utils/structuredLog');

const voiceSessions = new Map();

module.exports = {
  name: Events.VoiceStateUpdate,
  async execute(oldState, newState, client) {
    const member = newState.member || oldState.member;

    if (!member || member.user.bot) {
      return;
    }

    const sessionKey = `${member.guild.id}:${member.id}`;
    const channelChanged = oldState.channelId !== newState.channelId;
    const stateChanges = collectStateChanges(oldState, newState);

    if (!channelChanged && stateChanges.length === 0) {
      return;
    }

    let title;
    let emoji;
    let color;
    let summary;

    if (!oldState.channelId && newState.channelId) {
      title = 'Voice Channel Joined';
      emoji = '📞';
      color = colors.success;
      summary = `${member.user} joined ${newState.channel}.`;
      voiceSessions.set(sessionKey, Date.now());
    } else if (oldState.channelId && !newState.channelId) {
      title = 'Voice Channel Left';
      emoji = '📴';
      color = colors.neutral;
      summary = `${member.user} left ${oldState.channel}.`;
    } else if (channelChanged) {
      title = 'Voice Channel Moved';
      emoji = '↔️';
      color = colors.info;
      summary = `${member.user} moved from ${oldState.channel} to ${newState.channel}.`;
    } else {
      title = 'Voice State Updated';
      emoji = '🎙️';
      color = colors.warning;
      summary = `${member.user}'s voice state changed in ${newState.channel}.`;
    }

    const startedAt = voiceSessions.get(sessionKey);
    const sessionDuration = startedAt ? formatDuration(Date.now() - startedAt) : 'Unknown (session began before bot startup)';

    await sendStructuredLog(client, config.channels.lineLog, {
      title,
      emoji,
      color,
      summary,
      thumbnailUrl: member.user.displayAvatarURL({ size: 256 }),
      referenceId: `VOICE-${member.id}-${Date.now()}`,
      fields: [
        { name: 'Member', value: formatUser(member.user) },
        { name: 'Previous Channel', value: oldState.channel ? formatChannel(oldState.channel) : 'Not connected' },
        { name: 'Current Channel', value: newState.channel ? formatChannel(newState.channel) : 'Not connected' },
        { name: 'Session Duration', value: sessionDuration },
        {
          name: 'Current Channel Occupancy',
          value: newState.channel ? `${newState.channel.members.size.toLocaleString()} connected member(s)` : 'N/A',
        },
        { name: 'State Changes', value: stateChanges.join('\n') || 'Channel connection changed only.' },
        { name: 'Current Voice State', value: formatVoiceState(newState) },
      ],
    });

    if (oldState.channelId && !newState.channelId) {
      voiceSessions.delete(sessionKey);
    }
  },
};

function collectStateChanges(oldState, newState) {
  const checks = [
    ['Self muted', oldState.selfMute, newState.selfMute],
    ['Self deafened', oldState.selfDeaf, newState.selfDeaf],
    ['Server muted', oldState.serverMute, newState.serverMute],
    ['Server deafened', oldState.serverDeaf, newState.serverDeaf],
    ['Camera', oldState.selfVideo, newState.selfVideo],
    ['Streaming', oldState.streaming, newState.streaming],
    ['Suppressed', oldState.suppress, newState.suppress],
  ];

  return checks
    .filter(([, before, after]) => before !== after)
    .map(([label, before, after]) => `• ${label}: **${before ? 'On' : 'Off'} → ${after ? 'On' : 'Off'}**`);
}

function formatVoiceState(state) {
  return [
    `Self muted: **${state.selfMute ? 'Yes' : 'No'}**`,
    `Self deafened: **${state.selfDeaf ? 'Yes' : 'No'}**`,
    `Server muted: **${state.serverMute ? 'Yes' : 'No'}**`,
    `Server deafened: **${state.serverDeaf ? 'Yes' : 'No'}**`,
    `Camera enabled: **${state.selfVideo ? 'Yes' : 'No'}**`,
    `Streaming: **${state.streaming ? 'Yes' : 'No'}**`,
  ].join('\n');
}
