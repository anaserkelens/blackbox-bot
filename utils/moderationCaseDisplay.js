const {
  colors,
  createStructuredLogPayload,
  escapeMarkdown,
  formatDuration,
  formatTimestamp,
} = require('./structuredLog');

const actionDetails = {
  warn: { label: 'Warning', emoji: '⚠️', color: colors.warning },
  timeout: { label: 'Timeout', emoji: '⏳', color: colors.warning },
  kick: { label: 'Kick', emoji: '🥾', color: colors.danger },
  ban: { label: 'Ban', emoji: '🔨', color: colors.danger },
};

function createModerationCasePayload(moderationCase, options = {}) {
  const details = getActionDetails(moderationCase.action);
  const reasonEdits = moderationCase.reasonHistory?.length || 0;
  const latestStatusChange = moderationCase.statusHistory?.at(-1);

  return createStructuredLogPayload({
    title: `${details.label} ${moderationCase.reference}`,
    emoji: details.emoji,
    color: details.color,
    summary: options.summary || `Stored moderation case for <@${moderationCase.userId}>.`,
    referenceId: moderationCase.reference,
    timestamp: new Date(moderationCase.updatedAt),
    fields: [
      {
        name: 'Member',
        value: `<@${moderationCase.userId}> **${escapeMarkdown(moderationCase.userTag)}**\n-# ID: \`${moderationCase.userId}\``,
      },
      {
        name: 'Action',
        value: `${details.label}\n-# Status: ${capitalize(moderationCase.status)}`,
      },
      {
        name: 'Moderator',
        value: `<@${moderationCase.moderatorId}> **${escapeMarkdown(moderationCase.moderatorTag)}**\n-# ID: \`${moderationCase.moderatorId}\``,
      },
      { name: 'Reason', value: moderationCase.reason },
      ...(moderationCase.durationMs
        ? [{ name: 'Duration', value: formatDuration(moderationCase.durationMs) }]
        : []),
      ...(moderationCase.channelId
        ? [{ name: 'Issued In', value: `<#${moderationCase.channelId}>\n-# Channel ID: \`${moderationCase.channelId}\`` }]
        : []),
      {
        name: 'Direct Message',
        value: formatDeliveryStatus(moderationCase.dmDelivered),
      },
      {
        name: 'Case Log',
        value: formatDeliveryStatus(moderationCase.logDelivered),
      },
      {
        name: 'Created',
        value: `${formatTimestamp(new Date(moderationCase.createdAt))}\n-# ${formatTimestamp(new Date(moderationCase.createdAt), 'R')}`,
      },
      ...(reasonEdits
        ? [{
            name: 'Reason History',
            value: `${reasonEdits} correction${reasonEdits === 1 ? '' : 's'} recorded. Last updated ${formatTimestamp(new Date(moderationCase.updatedAt), 'R')}.`,
          }]
        : []),
      ...(latestStatusChange
        ? [{
            name: 'Status Change',
            value:
              `**${capitalize(latestStatusChange.newStatus)}:** ${latestStatusChange.reason}\n` +
              `-# By <@${latestStatusChange.editorId}> ${formatTimestamp(new Date(latestStatusChange.changedAt), 'R')}`,
          }]
        : []),
    ],
  });
}

function createModerationHistoryPayload(user, cases) {
  const actionCounts = cases.reduce((counts, moderationCase) => {
    counts[moderationCase.action] = (counts[moderationCase.action] || 0) + 1;
    return counts;
  }, {});
  const summary = cases.length
    ? `Showing the latest **${cases.length}** stored case${cases.length === 1 ? '' : 's'} for ${user}.`
    : `No stored moderation cases were found for ${user}.`;

  return createStructuredLogPayload({
    title: 'Moderation History',
    emoji: '📚',
    color: cases.length ? colors.info : colors.neutral,
    summary,
    thumbnailUrl: user.displayAvatarURL({ size: 256 }),
    referenceId: `HISTORY-${user.id}`,
    fields: [
      {
        name: 'Member',
        value: `${user} **${escapeMarkdown(user.tag || user.username)}**\n-# ID: \`${user.id}\``,
      },
      ...(cases.length
        ? [{
            name: 'Breakdown',
            value: Object.entries(actionCounts)
              .map(([action, count]) => `${getActionDetails(action).emoji} ${getActionDetails(action).label}: **${count}**`)
              .join('\n'),
          }]
        : []),
      ...cases.map((moderationCase) => {
        const details = getActionDetails(moderationCase.action);

        return {
          name: `${moderationCase.reference} · ${details.label}`,
          value:
            `**Reason:** ${moderationCase.reason}\n` +
            `**Moderator:** <@${moderationCase.moderatorId}>\n` +
            `**Created:** ${formatTimestamp(new Date(moderationCase.createdAt), 'R')}`,
        };
      }),
    ],
  });
}

function getActionDetails(action) {
  return actionDetails[action] || { label: 'Moderation Action', emoji: '🛡️', color: colors.info };
}

function formatDeliveryStatus(value) {
  if (value === true) {
    return 'Delivered successfully';
  }

  if (value === false) {
    return 'Could not be delivered';
  }

  return 'Not recorded';
}

function capitalize(value) {
  const text = String(value || '');

  return text ? `${text[0].toUpperCase()}${text.slice(1)}` : 'Unknown';
}

module.exports = {
  createModerationCasePayload,
  createModerationHistoryPayload,
};
