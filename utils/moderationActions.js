const { PermissionFlagsBits } = require('discord.js');

const { config } = require('./config');
const {
  colors,
  createStructuredLogPayload,
  formatDuration,
  formatUser,
  sendStructuredLog,
} = require('./structuredLog');

const activeBotActions = new Map();

function canUseModerationCommand(interaction, permission) {
  const hasModeratorRole = config.roles.moderator
    ? interaction.member?.roles?.cache?.has(config.roles.moderator)
    : false;

  return Boolean(
    interaction.memberPermissions?.has(permission) ||
    interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) ||
    hasModeratorRole,
  );
}

function getTargetBlockReason(interaction, targetMember, capability) {
  if (!targetMember) {
    return 'That member could not be resolved in this server.';
  }

  if (targetMember.id === interaction.user.id) {
    return 'You cannot moderate yourself.';
  }

  if (targetMember.id === interaction.guild.ownerId) {
    return 'The server owner cannot be moderated.';
  }

  const invokerIsOwner = interaction.user.id === interaction.guild.ownerId;

  if (
    !invokerIsOwner &&
    targetMember.roles.highest.comparePositionTo(interaction.member.roles.highest) >= 0
  ) {
    return 'You cannot moderate a member whose highest role is equal to or above yours.';
  }

  if (!targetMember[capability]) {
    return `I cannot perform that action because of Discord role hierarchy or permissions.`;
  }

  return null;
}

function registerBotModerationAction(action, guildId, userId, data = {}) {
  const key = actionKey(action, guildId, userId);
  const record = {
    ...data,
    action,
    guildId,
    userId,
    createdAt: Date.now(),
  };
  const expiration = setTimeout(() => activeBotActions.delete(key), 30000);

  expiration.unref?.();
  activeBotActions.set(key, record);
  return record;
}

function clearBotModerationAction(action, guildId, userId) {
  activeBotActions.delete(actionKey(action, guildId, userId));
}

function hasRecentBotModerationAction(action, guildId, userId) {
  const record = activeBotActions.get(actionKey(action, guildId, userId));

  if (!record || Date.now() - record.createdAt > 30000) {
    return false;
  }

  return true;
}

async function prepareDirectMessage(user) {
  return user.createDM().catch(() => null);
}

async function sendModerationDirectMessage(dmChannel, options) {
  if (!dmChannel) {
    return false;
  }

  try {
    await dmChannel.send(
      createStructuredLogPayload({
        title: options.title,
        emoji: options.emoji,
        color: options.color,
        summary: options.summary,
        referenceId: options.caseId,
        fields: [
          { name: 'Reason', value: options.reason },
          ...(options.durationMs
            ? [{ name: 'Duration', value: formatDuration(options.durationMs) }]
            : []),
          { name: 'Moderator', value: formatUser(options.moderator) },
          {
            name: 'What Happens Next',
            value: options.nextSteps || 'Contact the server staff team if you believe this action was made in error.',
          },
        ],
      }),
    );
    return true;
  } catch {
    return false;
  }
}

async function logBotModerationAction(client, options) {
  return sendStructuredLog(client, config.channels.caseFiles, {
    title: options.logTitle,
    emoji: options.emoji,
    color: options.color,
    summary: options.logSummary,
    thumbnailUrl: options.user.displayAvatarURL({ size: 256 }),
    referenceId: options.caseId,
    fields: [
      { name: 'Member', value: formatUser(options.user) },
      { name: 'Moderator', value: formatUser(options.moderator) },
      { name: 'Reason', value: options.reason },
      { name: 'Command', value: `\`/${options.command}\`` },
      ...(options.durationMs
        ? [{ name: 'Duration', value: formatDuration(options.durationMs) }]
        : []),
      ...(options.extraFields || []),
      {
        name: 'Direct Message',
        value: options.dmDelivered ? 'Delivered successfully' : 'Could not be delivered',
      },
    ],
  });
}

function createAuditReason(reason, moderator, caseId) {
  return `${reason} | Moderator: ${moderator.tag || moderator.username} (${moderator.id}) | ${caseId}`.slice(0, 512);
}

function actionKey(action, guildId, userId) {
  return `${action}:${guildId}:${userId}`;
}

module.exports = {
  canUseModerationCommand,
  clearBotModerationAction,
  colors,
  createAuditReason,
  getTargetBlockReason,
  hasRecentBotModerationAction,
  logBotModerationAction,
  prepareDirectMessage,
  registerBotModerationAction,
  sendModerationDirectMessage,
};
