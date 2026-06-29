const { config } = require('./config');
const { createDashboardMessagePayload } = require('./dashboardMessage');
const { replacePlaceholders } = require('./streamAnnouncement');

function createWelcomeAnnouncementPayload(settings, member, timestamp = new Date()) {
  const joinedTimestamp = Math.floor(timestamp.getTime() / 1000);
  const createdTimestamp = Math.floor(member.user.createdTimestamp / 1000);
  const values = {
    member: String(member),
    displayName: member.displayName || member.user.displayName || member.user.username || '',
    username: member.user.username || '',
    userId: member.id,
    serverName: member.guild.name || '',
    memberCount: member.guild.memberCount ? member.guild.memberCount.toLocaleString('en-US') : '',
    avatarUrl:
      (typeof member.displayAvatarURL === 'function' && member.displayAvatarURL({ size: 256 })) || '',
    createdAt: `<t:${createdTimestamp}:F>`,
    joinedAt: `<t:${joinedTimestamp}:F>`,
  };
  const resolvedSettings = {
    ...settings,
    blocks: (settings.blocks || []).map((block) => resolveBlock(block, values)),
    buttons: (settings.buttons || []).map((button) => resolveButton(button, values)),
  };
  const payload = createDashboardMessagePayload(resolvedSettings, config);

  payload.allowedMentions = settings.allowMentions
    ? { parse: ['users', 'roles'], repliedUser: false }
    : { parse: [], repliedUser: false };

  return payload;
}

function resolveBlock(block, values) {
  if (block.type !== 'text') {
    return block;
  }

  return {
    ...block,
    content: replacePlaceholders(block.content, values),
    accessory: block.accessory ? resolveButton(block.accessory, values) : null,
  };
}

function resolveButton(button, values) {
  return {
    ...button,
    label: replacePlaceholders(button.label, values),
    url: replacePlaceholders(button.url, values),
  };
}

module.exports = {
  createWelcomeAnnouncementPayload,
};
