const { Events } = require('discord.js');

const { config } = require('../utils/config');
const {
  findReactionRoleMappings,
  getReactionEmojiKey,
} = require('../utils/reactionRoles');

module.exports = {
  name: 'reaction role handler',
  setup(client) {
    client.on(Events.MessageReactionAdd, (reaction, user) => {
      handleReactionRoleChange(reaction, user, true).catch((error) => {
        console.error('Error applying reaction role:', error);
      });
    });
    client.on(Events.MessageReactionRemove, (reaction, user) => {
      handleReactionRoleChange(reaction, user, false).catch((error) => {
        console.error('Error removing reaction role:', error);
      });
    });
  },
};

async function handleReactionRoleChange(reaction, user, isAdded) {
  if (user?.bot || config.dashboard.features?.reactionRoles === false) {
    return;
  }

  if (reaction.partial) {
    const fetched = await reaction.fetch().catch(() => null);

    if (!fetched) {
      return;
    }

    reaction = fetched;
  }

  const guild = reaction.message?.guild;
  const guildId = reaction.message?.guildId || guild?.id;
  const messageId = reaction.message?.id;
  const emojiKey = getReactionEmojiKey(reaction);

  if (!guild || !guildId || !messageId || !emojiKey) {
    return;
  }

  const mappings = await findReactionRoleMappings(config, guildId, messageId, emojiKey);

  if (!mappings.length) {
    return;
  }

  const member = await guild.members.fetch(user.id).catch(() => null);

  if (!member) {
    return;
  }

  for (const mapping of mappings) {
    if (!isAdded && !mapping.removeOnUnreact) {
      continue;
    }

    const hasRole = member.roles.cache.has(mapping.roleId);

    if ((isAdded && hasRole) || (!isAdded && !hasRole)) {
      continue;
    }

    const operation = isAdded ? member.roles.add(mapping.roleId) : member.roles.remove(mapping.roleId);

    await operation.catch((error) => {
      console.error(
        `Error ${isAdded ? 'adding' : 'removing'} reaction role ${mapping.roleId} for ${user.tag || user.id}:`,
        error,
      );
    });
  }
}

module.exports.handleReactionRoleChange = handleReactionRoleChange;
