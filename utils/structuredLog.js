const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  FileBuilder,
  MessageFlags,
  SectionBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  TextDisplayBuilder,
  ThumbnailBuilder,
} = require('discord.js');

const { fetchSendableChannel } = require('./channels');

const colors = {
  danger: 0xed4245,
  info: 0x5865f2,
  neutral: 0x747f8d,
  success: 0x57f287,
  warning: 0xfee75c,
};

function createStructuredLogPayload(options) {
  const timestamp = options.timestamp || new Date();
  const container = new ContainerBuilder().setAccentColor(options.color ?? colors.info);
  const heading = [`## ${options.emoji ? `${options.emoji} ` : ''}${options.title}`];

  if (options.summary) {
    heading.push(truncate(options.summary, 3500));
  }

  const headingChunks = splitText(heading.join('\n'), 4000);

  if (options.thumbnailUrl) {
    const sectionChunks = headingChunks.slice(0, 3);
    const section = new SectionBuilder()
      .setThumbnailAccessory(new ThumbnailBuilder().setURL(options.thumbnailUrl))
      .addTextDisplayComponents(
        sectionChunks.map((content) => new TextDisplayBuilder().setContent(content)),
      );

    container.addSectionComponents(section);

    if (headingChunks.length > sectionChunks.length) {
      container.addTextDisplayComponents(
        headingChunks
          .slice(sectionChunks.length)
          .map((content) => new TextDisplayBuilder().setContent(content)),
      );
    }
  } else {
    container.addTextDisplayComponents(
      headingChunks.map((content) => new TextDisplayBuilder().setContent(content)),
    );
  }

  const fields = (options.fields || [])
    .filter((field) => field && field.value !== null && field.value !== undefined && field.value !== '')
    .slice(0, 24);

  if (fields.length > 0) {
    container.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small),
    );
  }

  for (const field of fields) {
    const value = truncate(String(field.value), 3800);
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**${field.name}**\n${value}`),
    );
  }

  const links = (options.links || []).filter((link) => link?.label && link?.url).slice(0, 5);
  const files = (options.files || []).filter((file) => file?.name && file?.attachment).slice(0, 5);

  if (links.length > 0) {
    container.addSeparatorComponents(
      new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small),
    );
    container.addActionRowComponents(
      new ActionRowBuilder().addComponents(
        links.map((link) =>
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel(link.label)
            .setURL(link.url),
        ),
      ),
    );
  }

  for (const file of files) {
    container.addFileComponents(
      new FileBuilder().setURL(`attachment://${file.name}`),
    );
  }

  const footerParts = [];

  if (options.referenceId) {
    footerParts.push(`Reference: ${options.referenceId}`);
  }

  footerParts.push(`<t:${Math.floor(timestamp.getTime() / 1000)}:F>`);
  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small),
  );
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`-# ${footerParts.join(' \u2022 ')}`),
  );

  return {
    components: [container],
    flags: MessageFlags.IsComponentsV2,
    allowedMentions: { parse: [] },
    ...(files.length > 0 ? { files } : {}),
  };
}

async function sendStructuredLog(client, channelId, options) {
  const channel = await fetchSendableChannel(client, channelId);

  if (!channel) {
    return false;
  }

  await channel.send(createStructuredLogPayload(options));
  return true;
}

async function fetchAuditEntry(guild, type, targetId, maximumAgeMs = 15000) {
  const logs = await guild.fetchAuditLogs({ type, limit: 6 }).catch(() => null);
  const now = Date.now();

  return logs?.entries.find((entry) => {
    const targetMatches = !targetId || entry.target?.id === targetId;
    return targetMatches && now - entry.createdTimestamp <= maximumAgeMs;
  }) || null;
}

function formatUser(user) {
  if (!user) {
    return 'Unknown user';
  }

  const tag = user.tag || user.username || 'Unknown';
  return `${user} **${escapeMarkdown(tag)}**\n-# ID: \`${user.id}\`${user.bot ? ' • Bot account' : ''}`;
}

function formatActor(entry) {
  if (!entry?.executor) {
    return 'Unknown — audit log entry was unavailable.';
  }

  return formatUser(entry.executor);
}

function formatChannel(channel) {
  if (!channel) {
    return 'Unknown channel';
  }

  return `${channel} **#${escapeMarkdown(channel.name || 'unknown')}**\n-# ID: \`${channel.id}\``;
}

function formatRole(role) {
  if (!role) {
    return 'Unknown role';
  }

  return `${role} **${escapeMarkdown(role.name || 'unknown')}**\n-# ID: \`${role.id}\``;
}

function formatCodeBlock(value, language = '') {
  const safe = String(value || 'No text content')
    .replaceAll('```', '``\u200B`');
  return `\`\`\`${language}\n${truncate(safe, 3600)}\n\`\`\``;
}

function formatTimestamp(value, style = 'F') {
  const milliseconds = value instanceof Date ? value.getTime() : Number(value);

  if (!Number.isFinite(milliseconds)) {
    return 'Unknown';
  }

  return `<t:${Math.floor(milliseconds / 1000)}:${style}>`;
}

function formatDuration(milliseconds) {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) {
    return 'Unknown';
  }

  const totalSeconds = Math.floor(milliseconds / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts = [];

  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (seconds || parts.length === 0) parts.push(`${seconds}s`);
  return parts.join(' ');
}

function escapeMarkdown(value) {
  return String(value || '').replace(/[\\`*_~|>]/g, '\\$&');
}

function truncate(value, maximumLength) {
  const text = String(value || '');
  return text.length <= maximumLength ? text : `${text.slice(0, maximumLength - 1)}…`;
}

function splitText(value, maximumLength) {
  const chunks = [];
  let remaining = String(value || '');

  while (remaining.length > maximumLength) {
    let splitAt = remaining.lastIndexOf('\n', maximumLength);

    if (splitAt < 1) {
      splitAt = maximumLength;
    }

    chunks.push(remaining.slice(0, splitAt));
    remaining = remaining.slice(splitAt).replace(/^\n/, '');
  }

  if (remaining) {
    chunks.push(remaining);
  }

  return chunks.length > 0 ? chunks : ['\u200B'];
}

module.exports = {
  colors,
  createStructuredLogPayload,
  escapeMarkdown,
  fetchAuditEntry,
  formatActor,
  formatChannel,
  formatCodeBlock,
  formatDuration,
  formatRole,
  formatTimestamp,
  formatUser,
  sendStructuredLog,
  truncate,
};
