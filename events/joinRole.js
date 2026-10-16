const { Events } = require('discord.js');
const { config } = require('../utils/config');
const { assignJoinRole } = require('../utils/joinRole');

module.exports = {
  setup(client) {
    const assign = (member) => assignJoinRole(member, config)
      .catch((error) => console.error('Could not assign join role in ' + member.guild.id + ':', error));
    client.on(Events.GuildMemberAdd, assign);
    client.on(Events.GuildMemberUpdate, (before, after) => {
      if (before.pending === true && after.pending === false) return assign(after);
    });
  },
};
