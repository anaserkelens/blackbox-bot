const {
  colors,
  createStructuredLogPayload,
  escapeMarkdown,
  formatDuration,
} = require('./structuredLog');

function createProfileCardPayload(user, progression, leaderboardPosition = null) {
  const { profile } = progression;
  const level = profile.level;

  return createStructuredLogPayload({
    title: `${escapeMarkdown(user.globalName || user.username)} · Level ${level.level}`,
    emoji: '🪪',
    color: colors.info,
    summary:
      `${createProgressBar(level.currentXp, level.requiredXp)}\n` +
      `**${level.currentXp.toLocaleString()} / ${level.requiredXp.toLocaleString()} XP** to Level ${level.level + 1}`,
    thumbnailUrl: user.displayAvatarURL({ size: 256 }),
    referenceId: `PROFILE-${user.id}`,
    fields: [
      { name: 'Total XP', value: profile.xp.toLocaleString() },
      { name: 'Missions Completed', value: profile.completedMissions.toLocaleString() },
      ...(leaderboardPosition
        ? [{ name: 'Leaderboard', value: `#${leaderboardPosition}` }]
        : []),
      {
        name: 'Discord Activity',
        value:
          `💬 Meaningful messages: **${formatStat(profile.stats.message_count)}**\n` +
          `👋 Members welcomed: **${formatStat(profile.stats.welcome_count)}**\n` +
          `🎙️ Voice time: **${formatMinutes(profile.stats.voice_minutes)}**`,
      },
      {
        name: 'Game Activity',
        value:
          `🎮 Game time: **${formatMinutes(profile.stats.gaming_minutes)}**\n` +
          `📡 Stream time: **${formatMinutes(profile.stats.streaming_minutes)}**\n` +
          `🛡️ Fireteam time: **${formatMinutes(profile.stats.squad_gaming_minutes)}**`,
      },
    ],
  });
}

function createChallengesPayload(user, progression) {
  const challenges = progression.challenges;
  const completedCount = challenges.filter((challenge) => challenge.completed).length;

  return createStructuredLogPayload({
    title: 'Mission Board',
    emoji: '📋',
    color: colors.info,
    summary:
      `${user}, complete missions to earn XP and increase your account level.\n` +
      `**${completedCount} / ${challenges.length}** active missions complete for their current cycle.`,
    referenceId: `MISSIONS-${user.id}`,
    fields: challenges.slice(0, 20).map((challenge) => ({
      name:
        `${challenge.completed ? '✅' : getChallengeIcon(challenge.category)} ` +
        `${challenge.name} · ${challenge.xp.toLocaleString()} XP`,
      value:
        `${challenge.description}\n` +
        `${createProgressBar(challenge.progress, challenge.target)} ` +
        `**${formatProgress(challenge.progress)} / ${formatProgress(challenge.target)}**\n` +
        `-# ${capitalize(challenge.cadence)} mission${challenge.specificGame ? ` · ${challenge.specificGame}` : ''}`,
    })),
  });
}

function createLeaderboardPayload(profiles) {
  const entries = profiles.slice(0, 10);

  return createStructuredLogPayload({
    title: 'Progression Leaderboard',
    emoji: '🏆',
    color: colors.warning,
    summary: entries.length
      ? 'The unit’s highest-level progression accounts.'
      : 'No members have earned progression XP yet.',
    referenceId: `LEADERBOARD-${Date.now()}`,
    fields: entries.map((profile, index) => ({
      name: `${getLeaderboardMedal(index)} #${index + 1} · ${escapeMarkdown(profile.userTag)}`,
      value:
        `**Level ${profile.level.level}** · ${profile.xp.toLocaleString()} XP\n` +
        `${profile.completedMissions.toLocaleString()} missions completed`,
    })),
  });
}

function createMissionCompletionPayload(completion) {
  return createStructuredLogPayload({
    title: 'Mission Complete',
    emoji: '✅',
    color: completion.leveledUp ? colors.success : colors.info,
    summary:
      `**${completion.challenge.name}** completed.\n${completion.challenge.description}` +
      `${completion.leveledUp ? `\n\n## Level Up\nYou reached **Level ${completion.level}**.` : ''}`,
    referenceId: `MISSION-${completion.challenge.id}-${Date.now()}`,
    fields: [
      { name: 'XP Awarded', value: `+${completion.xpAwarded.toLocaleString()} XP` },
      { name: 'Total XP', value: completion.totalXp.toLocaleString() },
      { name: 'Current Level', value: `Level ${completion.level}` },
    ],
  });
}

function createProgressBar(value, target, width = 10) {
  const safeTarget = Math.max(1, Number(target) || 1);
  const ratio = Math.min(1, Math.max(0, (Number(value) || 0) / safeTarget));
  const filled = Math.round(ratio * width);

  return `\`${'█'.repeat(filled)}${'░'.repeat(width - filled)}\``;
}

function formatMinutes(value) {
  const minutes = Math.max(0, Number(value) || 0);

  return formatDuration(minutes * 60000);
}

function formatStat(value) {
  return Math.max(0, Number(value) || 0).toLocaleString();
}

function formatProgress(value) {
  return Number.isInteger(value) ? value.toLocaleString() : Number(value || 0).toFixed(1);
}

function getChallengeIcon(category) {
  return category === 'game' ? '🎮' : '🛰️';
}

function getLeaderboardMedal(index) {
  return ['🥇', '🥈', '🥉'][index] || '🎖️';
}

function capitalize(value) {
  const text = String(value || '');

  return text ? `${text[0].toUpperCase()}${text.slice(1)}` : '';
}

module.exports = {
  createChallengesPayload,
  createLeaderboardPayload,
  createMissionCompletionPayload,
  createProfileCardPayload,
  createProgressBar,
};
