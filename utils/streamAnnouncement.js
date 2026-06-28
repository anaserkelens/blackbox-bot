const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  EmbedBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
  SectionBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  TextDisplayBuilder,
  ThumbnailBuilder,
} = require('discord.js');

function createStreamAnnouncementPayload(settings, context) {
  const values = createPlaceholderValues(context);
  const content = replacePlaceholders(settings.content, values);
  const embedSettings = settings.embed;
  const embed = new EmbedBuilder();
  let hasEmbed = false;

  const title = replacePlaceholders(embedSettings.title, values);
  const description = replacePlaceholders(embedSettings.description, values);
  const titleUrl = title ? resolveOptionalUrl(embedSettings.titleUrl, values, 'Embed title URL') : '';
  const authorName = replacePlaceholders(embedSettings.authorName, values);
  const authorUrl = authorName ? resolveOptionalUrl(embedSettings.authorUrl, values, 'Author URL') : '';
  const authorIconUrl = authorName
    ? resolveOptionalUrl(embedSettings.authorIconUrl, values, 'Author icon URL')
    : '';
  const thumbnailUrl = resolveOptionalUrl(embedSettings.thumbnailUrl, values, 'Thumbnail URL');
  const imageUrl = resolveOptionalUrl(embedSettings.imageUrl, values, 'Image URL');
  const footerText = replacePlaceholders(embedSettings.footerText, values);
  const footerIconUrl = footerText
    ? resolveOptionalUrl(embedSettings.footerIconUrl, values, 'Footer icon URL')
    : '';
  const fields = embedSettings.fields
    .map((field) => resolveEmbedBlock(field, values))
    .filter(Boolean);
  const buttons = settings.buttons.map((button) => ({
    label: replacePlaceholders(button.label, values),
    url: resolveOptionalUrl(button.url, values, `Button "${button.label}" URL`),
  }))
    .filter((button) => button.label && button.url);
  if (title) {
    embed.setTitle(title);
    hasEmbed = true;
  }

  if (titleUrl) {
    embed.setURL(titleUrl);
  }

  if (description) {
    embed.setDescription(description);
    hasEmbed = true;
  }

  if (embedSettings.color) {
    embed.setColor(Number.parseInt(embedSettings.color.slice(1), 16));
  }

  if (authorName) {
    embed.setAuthor({
      name: authorName,
      ...(authorUrl ? { url: authorUrl } : {}),
      ...(authorIconUrl ? { iconURL: authorIconUrl } : {}),
    });
    hasEmbed = true;
  }

  if (thumbnailUrl) {
    embed.setThumbnail(thumbnailUrl);
    hasEmbed = true;
  }

  if (imageUrl) {
    embed.setImage(imageUrl);
    hasEmbed = true;
  }

  if (footerText) {
    embed.setFooter({
      text: footerText,
      ...(footerIconUrl ? { iconURL: footerIconUrl } : {}),
    });
    hasEmbed = true;
  }

  if (embedSettings.timestamp) {
    embed.setTimestamp(context.timestamp || new Date());
    hasEmbed = true;
  }

  if (fields.length > 0) {
    embed.addFields(fields);
    hasEmbed = true;
  }

  const embedCharacterCount =
    title.length +
    description.length +
    authorName.length +
    footerText.length +
    fields.reduce((total, field) => total + field.name.length + field.value.length, 0);

  if (embedCharacterCount > 6000) {
    throw new Error('The resolved live embed exceeds Discord’s 6000-character total limit.');
  }

  if (!content && !hasEmbed && buttons.length === 0) {
    throw new Error('The live announcement template is empty.');
  }

  if (buttons.length > 0) {
    return createComponentsV2AnnouncementPayload({
      settings,
      values,
      content,
      title,
      titleUrl,
      description,
      authorName,
      authorUrl,
      thumbnailUrl,
      imageUrl,
      footerText,
      buttons,
      context,
    });
  }

  const payload = {
    ...(content ? { content } : {}),
    ...(hasEmbed ? { embeds: [embed] } : {}),
    allowedMentions: settings.mentionStreamer ? { users: [context.member.id] } : { parse: [] },
  };

  return payload;
}

function createComponentsV2AnnouncementPayload(options) {
  const {
    settings,
    values,
    content,
    title,
    titleUrl,
    description,
    authorName,
    authorUrl,
    thumbnailUrl,
    imageUrl,
    footerText,
    buttons,
    context,
  } = options;
  const container = new ContainerBuilder();
  const components = [];

  if (content) {
    components.push(new TextDisplayBuilder().setContent(content));
  }

  if (settings.embed.color) {
    container.setAccentColor(Number.parseInt(settings.embed.color.slice(1), 16));
  }

  const headerParts = [];

  if (authorName) {
    headerParts.push(`**${formatLinkedText(authorName, authorUrl)}**`);
  }

  if (title) {
    headerParts.push(`## ${formatLinkedText(title, titleUrl)}`);
  }

  if (description) {
    headerParts.push(description);
  }

  const primaryTextChunks = splitTextDisplayContent(headerParts.join('\n'));

  if (thumbnailUrl) {
    const sectionChunks = primaryTextChunks.length > 0 ? primaryTextChunks.slice(0, 3) : ['\u200B'];
    const section = new SectionBuilder()
      .setThumbnailAccessory(new ThumbnailBuilder().setURL(thumbnailUrl))
      .addTextDisplayComponents(
        sectionChunks.map((chunk) => new TextDisplayBuilder().setContent(chunk)),
      );

    container.addSectionComponents(section);

    if (primaryTextChunks.length > sectionChunks.length) {
      container.addTextDisplayComponents(
        primaryTextChunks
          .slice(sectionChunks.length)
          .map((chunk) => new TextDisplayBuilder().setContent(chunk)),
      );
    }
  } else if (primaryTextChunks.length > 0) {
    container.addTextDisplayComponents(
      primaryTextChunks.map((chunk) => new TextDisplayBuilder().setContent(chunk)),
    );
  }

  for (const block of resolveComponentBlocks(settings.embed.fields, values)) {
    if (block.type === 'divider' || block.type === 'spacer') {
      container.addSeparatorComponents(
        new SeparatorBuilder()
          .setDivider(block.type === 'divider')
          .setSpacing(
            block.spacing === 'large' ? SeparatorSpacingSize.Large : SeparatorSpacingSize.Small,
          ),
      );
      continue;
    }

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**${block.name}**\n${block.value}`),
    );
  }

  if (imageUrl) {
    container.addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(imageUrl)),
    );
  }

  const footerParts = [];

  if (footerText) {
    footerParts.push(footerText);
  }

  if (settings.embed.timestamp) {
    const timestamp = Math.floor((context.timestamp || new Date()).getTime() / 1000);
    footerParts.push(`<t:${timestamp}:f>`);
  }

  if (footerParts.length > 0) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`-# ${footerParts.join(' \u2022 ')}`),
    );
  }

  container.addActionRowComponents(createButtonRow(buttons));
  components.push(container);

  return {
    components,
    flags: MessageFlags.IsComponentsV2,
    allowedMentions: settings.mentionStreamer ? { users: [context.member.id] } : { parse: [] },
  };
}

function createButtonRow(buttons) {
  return new ActionRowBuilder().addComponents(
    buttons.map((button) =>
      new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel(button.label)
        .setURL(button.url),
    ),
  );
}

function resolveComponentBlocks(blocks, values) {
  return blocks
    .map((block) => {
      if (block.type === 'divider' || block.type === 'spacer') {
        return {
          type: block.type,
          spacing: block.spacing,
        };
      }

      const name = replacePlaceholders(block.name, values);
      const value = replacePlaceholders(block.value, values);

      return name && value
        ? {
            type: 'field',
            name,
            value,
          }
        : null;
    })
    .filter(Boolean);
}

function formatLinkedText(text, url) {
  if (!url) {
    return text;
  }

  const escapedText = text.replaceAll('\\', '\\\\').replaceAll(']', '\\]');
  return `[${escapedText}](${url})`;
}

function splitTextDisplayContent(value, maximumLength = 4000) {
  const chunks = [];
  let remaining = value;

  while (remaining.length > maximumLength) {
    let splitAt = remaining.lastIndexOf('\n', maximumLength);

    if (splitAt < 1) {
      splitAt = maximumLength;
    }

    chunks.push(remaining.slice(0, splitAt));
    remaining = remaining.slice(splitAt);

    if (remaining.startsWith('\n')) {
      remaining = remaining.slice(1);
    }
  }

  if (remaining) {
    chunks.push(remaining);
  }

  return chunks;
}

function resolveEmbedBlock(block, values) {
  if (block.type === 'divider') {
    return {
      name: '\u200B',
      value: block.spacing === 'large' ? '━━━━━━━━━━━━━━━━━━━━\n\u200B' : '━━━━━━━━━━━━━━━━━━━━',
      inline: false,
    };
  }

  if (block.type === 'spacer') {
    return {
      name: '\u200B',
      value: block.spacing === 'large' ? '\u200B\n\u200B' : '\u200B',
      inline: false,
    };
  }

  const name = replacePlaceholders(block.name, values);
  const value = replacePlaceholders(block.value, values);

  return name && value
    ? {
        name,
        value,
        inline: block.inline,
      }
    : null;
}

function createPlaceholderValues(context) {
  return {
    member: String(context.member),
    displayName: context.member.displayName || context.member.user?.displayName || context.member.user?.username || '',
    streamTitle: context.streamingActivity.details || 'Live on Twitch',
    streamUrl: context.streamingActivity.url || '',
    gameName: context.streamingActivity.state || '',
    twitchUsername: context.twitchUsername || '',
    previewUrl: context.previewUrl || '',
    avatarUrl:
      (typeof context.member.displayAvatarURL === 'function' && context.member.displayAvatarURL({ size: 256 })) || '',
  };
}

function replacePlaceholders(template, values) {
  return String(template || '').replace(
    /\{(member|displayName|streamTitle|streamUrl|gameName|twitchUsername|previewUrl|avatarUrl)\}/g,
    (_, key) => values[key],
  );
}

function resolveOptionalUrl(template, values, label) {
  const value = replacePlaceholders(template, values).trim();

  if (!value) {
    return '';
  }

  let url;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} must resolve to a valid URL.`);
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`${label} must resolve to an HTTP or HTTPS URL.`);
  }

  return url.toString();
}

module.exports = {
  createStreamAnnouncementPayload,
  replacePlaceholders,
};
