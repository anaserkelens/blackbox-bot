const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');

const { PermissionFlagsBits } = require('discord.js');

const reactionRolesFileName = 'reaction-roles.json';
const maxMappings = 100;
let mutationQueue = Promise.resolve();

async function loadReactionRoleMappings(config) {
  const filePath = getReactionRoleStorageInfo(config).filePath;

  try {
    const contents = await fs.readFile(filePath, 'utf8');
    return normalizeMappings(JSON.parse(contents));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }

    const legacyMapping = createLegacyMapping(config);

    if (!legacyMapping) {
      return [];
    }

    await writeMappings(filePath, [legacyMapping]);
    return [legacyMapping];
  }
}

async function listReactionRoleMappings(client, config) {
  const mappings = await loadReactionRoleMappings(config);
  const guild = getGuild(client, config.guildId);

  return Promise.all(mappings.map(async (mapping) => {
    const channel = guild
      ? await guild.channels?.fetch?.(mapping.channelId).catch(() => null)
      : null;
    const role = guild
      ? await guild.roles?.fetch?.(mapping.roleId).catch(() => null)
      : null;

    return {
      ...mapping,
      channelName: channel?.name || null,
      roleName: role?.name || null,
      roleColor: role?.hexColor && role.hexColor !== '#000000' ? role.hexColor : null,
      messageUrl: createDiscordMessageUrl(mapping),
      healthy: Boolean(channel && role),
    };
  }));
}

async function createReactionRoleMapping(client, config, input, actor = null) {
  return queueMutation(async () => {
    if (!client?.isReady?.()) {
      throw createPublicError('Bot is not ready yet.', 'BOT_NOT_READY');
    }

    const target = parseDiscordMessageLink(input?.messageUrl || input?.messageLink || input?.url);

    if (config.guildId && target.guildId !== config.guildId) {
      throw createPublicError('That message belongs to a different Discord server.', 'WRONG_GUILD');
    }

    const guild = getGuild(client, target.guildId);

    if (!guild) {
      throw createPublicError('The configured Discord server was not found.', 'GUILD_NOT_FOUND');
    }

    const channel = await guild.channels?.fetch?.(target.channelId).catch(() => null);

    if (!channel?.isTextBased?.() || !channel.messages?.fetch) {
      throw createPublicError('That message channel is not readable by Bean.', 'CHANNEL_NOT_FOUND');
    }

    const message = await channel.messages.fetch(target.messageId).catch(() => null);

    if (!message) {
      throw createPublicError('That Discord message was not found.', 'MESSAGE_NOT_FOUND');
    }

    const roleId = normalizeSnowflake(input?.roleId);

    if (!roleId || roleId === guild.id) {
      throw createPublicError('Choose a valid Discord role.', 'INVALID_ROLE');
    }

    const role = await guild.roles?.fetch?.(roleId).catch(() => null);

    if (!role || role.managed) {
      throw createPublicError('That role was not found or is managed by another integration.', 'ROLE_NOT_FOUND');
    }

    if (role.editable === false) {
      throw createPublicError('Bean cannot manage that role. Move Bean above it in the Discord role list.', 'ROLE_NOT_EDITABLE');
    }

    if (guild.members?.me?.permissions?.has?.(PermissionFlagsBits.ManageRoles) === false) {
      throw createPublicError('Bean needs the Manage Roles permission before it can use that role.', 'MISSING_MANAGE_ROLES');
    }

    const emoji = await resolveEmoji(guild, input?.emoji);
    const currentMappings = await readMappingsWithoutMigration(config);
    const duplicate = currentMappings.some((mapping) =>
      mapping.guildId === target.guildId
      && mapping.messageId === target.messageId
      && mapping.emojiKey === emoji.key
      && mapping.roleId === roleId,
    );

    if (duplicate) {
      throw createPublicError('That message, emoji, and role mapping already exists.', 'DUPLICATE_MAPPING');
    }

    if (currentMappings.length >= maxMappings) {
      throw createPublicError(`Use ${maxMappings} reaction-role mappings or fewer.`, 'MAPPING_LIMIT');
    }

    try {
      await message.react(emoji.reaction);
    } catch {
      throw createPublicError(
        'Bean could not add that reaction. Check the emoji and the Add Reactions permission.',
        'REACTION_FAILED',
      );
    }

    const now = new Date().toISOString();
    const mapping = {
      id: crypto.randomUUID(),
      guildId: target.guildId,
      channelId: target.channelId,
      messageId: target.messageId,
      emojiKey: emoji.key,
      emojiDisplay: emoji.display,
      emojiId: emoji.id,
      emojiName: emoji.name,
      roleId,
      removeOnUnreact: input?.removeOnUnreact !== false,
      createdAt: now,
      updatedAt: now,
      createdBy: normalizeActor(actor),
    };

    await writeMappings(getReactionRoleStorageInfo(config).filePath, [...currentMappings, mapping]);
    return mapping;
  });
}

async function deleteReactionRoleMapping(client, config, mappingId) {
  return queueMutation(async () => {
    const id = String(mappingId || '').trim();
    const mappings = await loadReactionRoleMappings(config);
    const mapping = mappings.find((entry) => entry.id === id);

    if (!mapping) {
      throw createPublicError('Reaction-role mapping was not found.', 'MAPPING_NOT_FOUND');
    }

    const remainingMappings = mappings.filter((entry) => entry.id !== id);
    const emojiStillInUse = remainingMappings.some((entry) =>
      entry.guildId === mapping.guildId
      && entry.channelId === mapping.channelId
      && entry.messageId === mapping.messageId
      && entry.emojiKey === mapping.emojiKey,
    );

    await writeMappings(getReactionRoleStorageInfo(config).filePath, remainingMappings);

    if (!emojiStillInUse) {
      await removeBotReaction(client, mapping).catch(() => null);
    }

    return mapping;
  });
}

async function syncReactionRoleMappings(client, config, guildId = null) {
  const mappings = (await loadReactionRoleMappings(config))
    .filter((mapping) => !guildId || mapping.guildId === guildId);
  const results = [];

  for (const mapping of mappings) {
    try {
      const guild = getGuild(client, mapping.guildId);
      const channel = await guild?.channels?.fetch?.(mapping.channelId).catch(() => null);
      const message = await channel?.messages?.fetch?.(mapping.messageId).catch(() => null);

      if (!message) {
        throw new Error('Message unavailable');
      }

      await message.react(mapping.emojiId || mapping.emojiName);
      results.push({ id: mapping.id, ok: true });
    } catch (error) {
      results.push({ id: mapping.id, ok: false, error: error.message });
    }
  }

  return results;
}

async function findReactionRoleMappings(config, guildId, messageId, emojiKey) {
  const mappings = await loadReactionRoleMappings(config);

  return mappings.filter((mapping) =>
    mapping.guildId === guildId
    && mapping.messageId === messageId
    && mapping.emojiKey === emojiKey,
  );
}

function getReactionEmojiKey(reaction) {
  return String(reaction?.emoji?.id || reaction?.emoji?.name || '').trim();
}

function getReactionRoleStorageInfo(config) {
  if (config.dashboard?.reactionRolesPath) {
    return {
      filePath: path.resolve(config.dashboard.reactionRolesPath),
      persistent: true,
      source: 'DASHBOARD_REACTION_ROLES_PATH',
    };
  }

  if (config.dashboard?.railwayVolumeMountPath) {
    return {
      filePath: path.join(config.dashboard.railwayVolumeMountPath, reactionRolesFileName),
      persistent: true,
      source: 'RAILWAY_VOLUME_MOUNT_PATH',
    };
  }

  return {
    filePath: path.join(__dirname, '..', 'data', reactionRolesFileName),
    persistent: false,
    source: 'local data directory',
  };
}

function parseDiscordMessageLink(value) {
  const match = String(value || '').trim().match(
    /^https?:\/\/(?:canary\.|ptb\.)?discord(?:app)?\.com\/channels\/(\d{17,20})\/(\d{17,20})\/(\d{17,20})(?:\?.*)?$/i,
  );

  if (!match) {
    throw createPublicError('Paste a valid Discord message link.', 'INVALID_MESSAGE_LINK');
  }

  return {
    guildId: match[1],
    channelId: match[2],
    messageId: match[3],
  };
}

async function resolveEmoji(guild, value) {
  const input = String(value || '').trim();

  if (!input || input.length > 100 || /\s/.test(input)) {
    throw createPublicError('Enter one Unicode emoji or a Discord custom emoji.', 'INVALID_EMOJI');
  }

  const customEmojiMatch = input.match(/^<a?:([A-Za-z0-9_~]+):(\d{17,20})>$/);
  const customEmojiId = customEmojiMatch?.[2] || (/^\d{17,20}$/.test(input) ? input : null);

  if (customEmojiId) {
    const emoji = await guild.emojis?.fetch?.(customEmojiId).catch(() => null);

    if (!emoji) {
      throw createPublicError('That custom emoji is not available to Bean.', 'EMOJI_NOT_FOUND');
    }

    return {
      key: emoji.id,
      id: emoji.id,
      name: emoji.name,
      display: emoji.toString?.() || `<:${emoji.name}:${emoji.id}>`,
      reaction: emoji.id,
    };
  }

  if (/^:[^:]+:$/.test(input)) {
    throw createPublicError('Use the actual emoji, not a colon alias such as :bell:.', 'INVALID_EMOJI');
  }

  return {
    key: input,
    id: null,
    name: input,
    display: input,
    reaction: input,
  };
}

async function removeBotReaction(client, mapping) {
  if (!client?.isReady?.() || !client.user?.id) {
    return;
  }

  const guild = getGuild(client, mapping.guildId);
  const channel = await guild?.channels?.fetch?.(mapping.channelId).catch(() => null);
  const message = await channel?.messages?.fetch?.(mapping.messageId).catch(() => null);

  if (!message?.reactions?.resolve) {
    return;
  }

  const reaction = message.reactions.resolve(mapping.emojiId || mapping.emojiName);
  await reaction?.users?.remove?.(client.user.id);
}

async function readMappingsWithoutMigration(config) {
  const filePath = getReactionRoleStorageInfo(config).filePath;

  try {
    return normalizeMappings(JSON.parse(await fs.readFile(filePath, 'utf8')));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }

    const legacyMapping = createLegacyMapping(config);
    return legacyMapping ? [legacyMapping] : [];
  }
}

function normalizeMappings(input) {
  const source = Array.isArray(input) ? input : input?.mappings;

  if (!Array.isArray(source)) {
    throw new Error('Reaction roles file must contain a mappings array.');
  }

  return source.map(sanitizeMapping).filter(Boolean).slice(0, maxMappings);
}

function sanitizeMapping(mapping) {
  if (!mapping || typeof mapping !== 'object') {
    return null;
  }

  const guildId = normalizeSnowflake(mapping.guildId);
  const channelId = normalizeSnowflake(mapping.channelId);
  const messageId = normalizeSnowflake(mapping.messageId);
  const roleId = normalizeSnowflake(mapping.roleId);
  const emojiId = normalizeSnowflake(mapping.emojiId);
  const emojiName = String(mapping.emojiName || '').trim().slice(0, 100);
  const emojiKey = String(mapping.emojiKey || emojiId || emojiName).trim().slice(0, 100);

  if (!guildId || !channelId || !messageId || !roleId || !emojiKey) {
    return null;
  }

  return {
    id: String(mapping.id || crypto.randomUUID()).slice(0, 120),
    guildId,
    channelId,
    messageId,
    emojiKey,
    emojiDisplay: String(mapping.emojiDisplay || emojiName || emojiId || emojiKey).slice(0, 120),
    emojiId,
    emojiName: emojiName || (emojiId ? null : emojiKey),
    roleId,
    removeOnUnreact: mapping.removeOnUnreact !== false,
    createdAt: normalizeDate(mapping.createdAt),
    updatedAt: normalizeDate(mapping.updatedAt),
    createdBy: normalizeActor(mapping.createdBy),
  };
}

function createLegacyMapping(config) {
  const legacy = config.legacyReactionRole || config.reactionRole;
  const guildId = normalizeSnowflake(config.guildId);
  const channelId = normalizeSnowflake(legacy?.channelId);
  const messageId = normalizeSnowflake(legacy?.messageId);
  const roleId = normalizeSnowflake(legacy?.roleId || config.roles?.verified);
  const emoji = String(legacy?.emojiId || '').trim();

  if (!guildId || !channelId || !messageId || !roleId || !emoji) {
    return null;
  }

  const emojiId = normalizeSnowflake(emoji);
  const now = new Date().toISOString();

  return sanitizeMapping({
    id: 'legacy-reaction-role',
    guildId,
    channelId,
    messageId,
    roleId,
    emojiKey: emojiId || emoji,
    emojiDisplay: emoji,
    emojiId,
    emojiName: emojiId ? null : emoji,
    removeOnUnreact: true,
    createdAt: now,
    updatedAt: now,
  });
}

async function writeMappings(filePath, mappings) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(temporaryPath, `${JSON.stringify({ version: 1, mappings }, null, 2)}\n`, 'utf8');
  await fs.rename(temporaryPath, filePath);
}

function queueMutation(operation) {
  const result = mutationQueue.then(operation, operation);
  mutationQueue = result.catch(() => null);
  return result;
}

function getGuild(client, guildId) {
  return client?.guilds?.cache?.get?.(guildId) || null;
}

function createDiscordMessageUrl(mapping) {
  return `https://discord.com/channels/${mapping.guildId}/${mapping.channelId}/${mapping.messageId}`;
}

function normalizeSnowflake(value) {
  const text = String(value || '').trim();
  return /^\d{17,20}$/.test(text) ? text : null;
}

function normalizeDate(value) {
  const date = new Date(value || Date.now());
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function normalizeActor(actor) {
  if (!actor || typeof actor !== 'object') {
    return null;
  }

  return {
    id: normalizeSnowflake(actor.id),
    displayName: String(actor.displayName || actor.username || '').slice(0, 100) || null,
  };
}

function createPublicError(message, code) {
  const error = new Error(message);
  error.code = code;
  return error;
}

module.exports = {
  createReactionRoleMapping,
  deleteReactionRoleMapping,
  findReactionRoleMappings,
  getReactionEmojiKey,
  getReactionRoleStorageInfo,
  listReactionRoleMappings,
  loadReactionRoleMappings,
  parseDiscordMessageLink,
  resolveEmoji,
  syncReactionRoleMappings,
};
