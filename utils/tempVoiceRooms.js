const fs = require('node:fs/promises');
const path = require('node:path');

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');

const defaultTempVoicePath = path.join(__dirname, '..', 'data', 'temporary-voice.json');
const roomTimers = new Map();
const promptCooldowns = new Map();
const creationLocks = new Set();
let cachedState = null;
let stateQueue = Promise.resolve();

function createDefaultState(config) {
  return {
    version: 1,
    settings: {
      enabled: true,
      triggerChannelId: config.channels.tempVoiceTrigger,
      emptyDelaySeconds: 60,
    },
    channels: [],
  };
}

function getTempVoiceStorageInfo(config) {
  if (config.dashboard.tempVoicePath) {
    return {
      filePath: config.dashboard.tempVoicePath,
      persistent: true,
      source: 'TEMP_VOICE_PATH',
    };
  }

  if (config.dashboard.railwayVolumeMountPath) {
    return {
      filePath: path.join(config.dashboard.railwayVolumeMountPath, 'temporary-voice.json'),
      persistent: true,
      source: 'RAILWAY_VOLUME_MOUNT_PATH',
    };
  }

  if (config.dashboard.savedMessagesPath) {
    return {
      filePath: path.join(path.dirname(config.dashboard.savedMessagesPath), 'temporary-voice.json'),
      persistent: true,
      source: 'DASHBOARD_SAVED_MESSAGES_PATH directory',
    };
  }

  return {
    filePath: defaultTempVoicePath,
    persistent: false,
    source: 'app filesystem',
  };
}

async function initializeTempVoiceRooms(client, config) {
  const state = await loadState(config);
  let changed = false;

  for (const room of [...state.channels]) {
    const channel = await client.channels.fetch(room.channelId).catch(() => null);

    if (!channel || channel.type !== ChannelType.GuildVoice) {
      state.channels = state.channels.filter((item) => item.channelId !== room.channelId);
      changed = true;
      continue;
    }

    if (channel.members.size === 0) {
      scheduleRoomDeletion(client, config, room.channelId);
    }
  }

  if (changed) {
    await saveState(config, state);
  }

  return state;
}

async function handleTempVoiceStateUpdate(oldState, newState, client, config) {
  const state = await loadState(config);
  const member = newState.member || oldState.member;

  if (!member || member.user.bot || oldState.channelId === newState.channelId) {
    return;
  }

  if (
    state.settings.enabled &&
    newState.channelId === state.settings.triggerChannelId
  ) {
    await sendCreationPrompt(member, state.settings.triggerChannelId);
  }

  if (newState.channelId && isTrackedRoom(state, newState.channelId)) {
    cancelRoomDeletion(newState.channelId);
  }

  if (oldState.channelId && isTrackedRoom(state, oldState.channelId)) {
    const oldChannel = oldState.channel;

    if (!oldChannel || oldChannel.members.size === 0) {
      scheduleRoomDeletion(client, config, oldState.channelId);
    }
  }
}

async function handleTempVoiceInteraction(interaction, client, config) {
  if (interaction.isButton() && interaction.customId.startsWith('bean_voice_create:')) {
    await handleCreateButton(interaction, client, config);
    return true;
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith('bean_voice_modal:')) {
    await handleRoomModal(interaction, client, config);
    return true;
  }

  return false;
}

async function handleTrackedChannelDelete(channel, config) {
  const state = await loadState(config);

  if (!isTrackedRoom(state, channel.id)) {
    return false;
  }

  cancelRoomDeletion(channel.id);
  state.channels = state.channels.filter((room) => room.channelId !== channel.id);
  await saveState(config, state);
  return true;
}

async function getTempVoiceOverview(client, config) {
  const state = await loadState(config);
  const channels = [];
  let changed = false;

  for (const room of state.channels) {
    const channel = client.channels.cache.get(room.channelId)
      || await client.channels.fetch(room.channelId).catch(() => null);

    if (!channel || channel.type !== ChannelType.GuildVoice) {
      changed = true;
      continue;
    }

    const owner = channel.guild.members.cache.get(room.ownerId)
      || await channel.guild.members.fetch(room.ownerId).catch(() => null);

    channels.push({
      ...room,
      name: channel.name,
      ownerName: owner?.displayName || owner?.user?.globalName || owner?.user?.username || 'Unknown member',
      memberCount: channel.members.size,
      memberNames: [...channel.members.values()]
        .filter((member) => !member.user.bot)
        .map((member) => member.displayName),
      deleting: roomTimers.has(room.channelId),
    });
  }

  if (changed) {
    state.channels = state.channels.filter((room) =>
      channels.some((channel) => channel.channelId === room.channelId));
    await saveState(config, state);
  }

  return {
    settings: { ...state.settings },
    channels,
    storage: getTempVoiceStorageInfo(config),
    totals: {
      rooms: channels.length,
      privateRooms: channels.filter((room) => room.private).length,
      members: channels.reduce((total, room) => total + room.memberCount, 0),
    },
  };
}

async function saveTempVoiceSettings(client, config, input) {
  return mutateState(config, async (state) => {
    const source = input && typeof input === 'object' ? input : {};
    const triggerChannelId = String(
      source.triggerChannelId ?? state.settings.triggerChannelId,
    ).trim();

    if (!/^\d{17,20}$/.test(triggerChannelId)) {
      throw new Error('Trigger channel ID must be a valid Discord channel ID.');
    }

    if (client.isReady()) {
      const channel = await client.channels.fetch(triggerChannelId).catch(() => null);

      if (!channel || channel.type !== ChannelType.GuildVoice) {
        throw new Error('Trigger channel must be an existing voice channel Bean can access.');
      }
    }

    state.settings = {
      enabled: source.enabled === undefined ? state.settings.enabled : Boolean(source.enabled),
      triggerChannelId,
      emptyDelaySeconds: 60,
    };

    return { ...state.settings };
  });
}

async function deleteTempVoiceRoom(client, config, channelId, reason = 'Deleted from the Bean dashboard') {
  const state = await loadState(config);
  const room = state.channels.find((item) => item.channelId === channelId);

  if (!room) {
    return null;
  }

  cancelRoomDeletion(channelId);
  const channel = client.channels.cache.get(channelId)
    || await client.channels.fetch(channelId).catch(() => null);

  if (channel) {
    await channel.delete(reason);
  }

  state.channels = state.channels.filter((item) => item.channelId !== channelId);
  await saveState(config, state);
  return room;
}

async function sendCreationPrompt(member, triggerChannelId) {
  const cooldownKey = `${member.guild.id}:${member.id}`;
  const now = Date.now();

  if (now - (promptCooldowns.get(cooldownKey) || 0) < 15000) {
    return;
  }

  promptCooldowns.set(cooldownKey, now);
  const cooldownTimer = setTimeout(() => promptCooldowns.delete(cooldownKey), 15000);
  cooldownTimer.unref?.();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`bean_voice_create:public:${member.guild.id}`)
      .setLabel('Create public room')
      .setEmoji('☕')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`bean_voice_create:private:${member.guild.id}`)
      .setLabel('Create private room')
      .setEmoji('🔒')
      .setStyle(ButtonStyle.Secondary),
  );

  await member.send({
    content:
      `You joined <#${triggerChannelId}>. Choose the kind of voice room you want, then Bean will ask for its name.\n` +
      'Private rooms remain visible, but only you and members with permission can connect.',
    components: [row],
  }).catch((error) => {
    console.warn(`Could not DM temporary voice controls to ${member.user.tag}:`, error.message);
  });
}

async function handleCreateButton(interaction, client, config) {
  const [, visibility, guildId] = interaction.customId.split(':');
  const context = await getCreationContext(interaction.user.id, guildId, client, config);

  if (!context.ok) {
    await interaction.reply({ content: context.error });
    return;
  }

  const modal = new ModalBuilder()
    .setCustomId(`bean_voice_modal:${visibility}:${guildId}`)
    .setTitle(visibility === 'private' ? 'Create a private room' : 'Create a public room');
  const nameInput = new TextInputBuilder()
    .setCustomId('room_name')
    .setLabel('Voice channel name')
    .setPlaceholder(`${interaction.user.globalName || interaction.user.username}'s room`)
    .setMinLength(1)
    .setMaxLength(100)
    .setRequired(true)
    .setStyle(TextInputStyle.Short);

  modal.addComponents(new ActionRowBuilder().addComponents(nameInput));
  await interaction.showModal(modal);
}

async function handleRoomModal(interaction, client, config) {
  const [, visibility, guildId] = interaction.customId.split(':');
  const context = await getCreationContext(interaction.user.id, guildId, client, config);

  if (!context.ok) {
    await interaction.reply({ content: context.error });
    return;
  }

  const name = normalizeRoomName(interaction.fields.getTextInputValue('room_name'));

  if (!name) {
    await interaction.reply({ content: 'Please use a channel name with at least one visible character.' });
    return;
  }

  const lockKey = `${guildId}:${interaction.user.id}`;

  if (creationLocks.has(lockKey)) {
    await interaction.reply({ content: 'Bean is already preparing a voice room for you.' });
    return;
  }

  creationLocks.add(lockKey);

  try {
    await interaction.deferReply();
    const room = await createRoom(client, config, {
      guild: context.guild,
      member: context.member,
      trigger: context.trigger,
      name,
      private: visibility === 'private',
    });

    await interaction.editReply(
      `${room.private ? '🔒 Private' : '☕ Public'} room created: <#${room.channelId}>. ` +
      'Bean will remove it after it has been empty for one minute.',
    );
  } catch (error) {
    console.error('Temporary voice room creation failed:', error);
    const message = `I couldn't create that room: ${error.message}`;

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(message);
    } else {
      await interaction.reply({ content: message });
    }
  } finally {
    creationLocks.delete(lockKey);
  }
}

async function getCreationContext(userId, guildId, client, config) {
  const state = await loadState(config);

  if (!state.settings.enabled) {
    return { ok: false, error: 'Temporary voice rooms are disabled right now.' };
  }

  const resolvedGuild = client.guilds.cache.get(guildId)
    || await client.guilds.fetch(guildId).catch(() => null);

  if (!resolvedGuild) {
    return { ok: false, error: 'Bean can no longer find that server.' };
  }

  const member = resolvedGuild.members.cache.get(userId)
    || await resolvedGuild.members.fetch(userId).catch(() => null);
  const trigger = resolvedGuild.channels.cache.get(state.settings.triggerChannelId)
    || await resolvedGuild.channels.fetch(state.settings.triggerChannelId).catch(() => null);

  if (!member || member.voice.channelId !== state.settings.triggerChannelId) {
    return { ok: false, error: `Join <#${state.settings.triggerChannelId}> again before creating a room.` };
  }

  if (!trigger || trigger.type !== ChannelType.GuildVoice) {
    return { ok: false, error: 'The temporary voice lobby is not available right now.' };
  }

  return { ok: true, guild: resolvedGuild, member, trigger };
}

async function createRoom(client, config, options) {
  const { guild, member, trigger, name, private: isPrivate } = options;
  let channel;

  try {
    channel = await guild.channels.create({
      name,
      type: ChannelType.GuildVoice,
      parent: trigger.parentId || undefined,
      reason: `Temporary voice room created for ${member.user.tag} (${member.id})`,
    });

    if (isPrivate) {
      await channel.permissionOverwrites.edit(guild.roles.everyone, {
        ViewChannel: true,
        Connect: false,
      });
    }

    await channel.permissionOverwrites.edit(member, {
      ViewChannel: true,
      Connect: true,
      Speak: true,
      ManageChannels: true,
      ManageRoles: true,
    });

    const room = {
      channelId: channel.id,
      guildId: guild.id,
      ownerId: member.id,
      private: isPrivate,
      createdAt: new Date().toISOString(),
    };

    await mutateState(config, (state) => {
      state.channels.push(room);
      return room;
    });

    await member.voice.setChannel(channel, 'Moved into newly created temporary voice room');
    return room;
  } catch (error) {
    if (channel) {
      await channel.delete('Cleaning up a failed temporary voice room').catch(() => null);
      await mutateState(config, (state) => {
        state.channels = state.channels.filter((room) => room.channelId !== channel.id);
      }).catch(() => null);
    }

    if (error.code === 50013) {
      throw new Error('Bean needs Manage Channels, Manage Roles, Move Members, Connect, and Speak permissions.');
    }

    throw error;
  }
}

function scheduleRoomDeletion(client, config, channelId) {
  if (roomTimers.has(channelId)) {
    return;
  }

  const timer = setTimeout(async () => {
    roomTimers.delete(channelId);
    const state = await loadState(config);
    const room = state.channels.find((item) => item.channelId === channelId);

    if (!room) {
      return;
    }

    const channel = client.channels.cache.get(channelId)
      || await client.channels.fetch(channelId).catch(() => null);

    if (!channel) {
      state.channels = state.channels.filter((item) => item.channelId !== channelId);
      await saveState(config, state);
      return;
    }

    if (channel.members.size > 0) {
      return;
    }

    await channel.delete('Temporary voice room remained empty for one minute').catch((error) => {
      console.error(`Failed to delete empty temporary voice room ${channelId}:`, error);
    });

    state.channels = state.channels.filter((item) => item.channelId !== channelId);
    await saveState(config, state);
  }, 60000);

  timer.unref?.();
  roomTimers.set(channelId, timer);
}

function cancelRoomDeletion(channelId) {
  const timer = roomTimers.get(channelId);

  if (timer) {
    clearTimeout(timer);
    roomTimers.delete(channelId);
  }
}

function normalizeRoomName(value) {
  return String(value || '')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);
}

function isTrackedRoom(state, channelId) {
  return state.channels.some((room) => room.channelId === channelId);
}

async function loadState(config) {
  if (cachedState) {
    return cachedState;
  }

  const defaults = createDefaultState(config);
  const { filePath } = getTempVoiceStorageInfo(config);
  let parsed;

  try {
    parsed = JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  cachedState = normalizeState(parsed, defaults);
  return cachedState;
}

async function mutateState(config, mutator) {
  const task = stateQueue.then(async () => {
    const state = await loadState(config);
    const result = await mutator(state);
    await writeState(config, state);
    return result;
  });

  stateQueue = task.catch(() => null);
  return task;
}

async function saveState(config, state) {
  cachedState = normalizeState(state, createDefaultState(config));
  await writeState(config, cachedState);
  return cachedState;
}

async function writeState(config, state) {
  const { filePath } = getTempVoiceStorageInfo(config);
  const temporaryPath = `${filePath}.${process.pid}.tmp`;

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(temporaryPath, JSON.stringify(state, null, 2));
  await fs.rename(temporaryPath, filePath);
}

function normalizeState(input, defaults) {
  const source = input && typeof input === 'object' ? input : {};
  const settings = source.settings && typeof source.settings === 'object' ? source.settings : {};

  return {
    version: 1,
    settings: {
      enabled: settings.enabled === undefined ? defaults.settings.enabled : Boolean(settings.enabled),
      triggerChannelId: /^\d{17,20}$/.test(String(settings.triggerChannelId || ''))
        ? String(settings.triggerChannelId)
        : defaults.settings.triggerChannelId,
      emptyDelaySeconds: 60,
    },
    channels: Array.isArray(source.channels)
      ? source.channels
        .filter((room) =>
          room
          && /^\d{17,20}$/.test(String(room.channelId || ''))
          && /^\d{17,20}$/.test(String(room.guildId || ''))
          && /^\d{17,20}$/.test(String(room.ownerId || '')))
        .map((room) => ({
          channelId: String(room.channelId),
          guildId: String(room.guildId),
          ownerId: String(room.ownerId),
          private: Boolean(room.private),
          createdAt: room.createdAt || new Date().toISOString(),
        }))
      : [],
  };
}

module.exports = {
  deleteTempVoiceRoom,
  getTempVoiceOverview,
  getTempVoiceStorageInfo,
  handleTempVoiceInteraction,
  handleTempVoiceStateUpdate,
  handleTrackedChannelDelete,
  initializeTempVoiceRooms,
  normalizeRoomName,
  saveTempVoiceSettings,
};
