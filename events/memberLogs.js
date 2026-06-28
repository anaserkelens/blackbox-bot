const { EmbedBuilder, Events } = require('discord.js');

const { config } = require('../utils/config');
const { sendLog } = require('../utils/channels');
const { createWelcomeAnnouncementPayload } = require('../utils/welcomeAnnouncement');
const { loadWelcomeEmbedSettings } = require('../utils/welcomeEmbedSettings');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member, client) {
    if (!member.user.bot) {
      try {
        await sendWelcomeMessage(member, client);
      } catch (error) {
        console.error(`Failed to welcome member ${member.id}:`, error);
      }
    }

    if (!config.channels.memberLogs) {
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('User Joined')
      .setDescription(`User: ${member.user}\nID: ${member.user.id}\nCreated: <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>\nMembers: ${member.guild.memberCount}`)
      .setColor(0x2dd4bf)
      .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
      .setTimestamp();

    await sendLog(client, config.channels.memberLogs, { embeds: [embed] });
  },
};

async function sendWelcomeMessage(member, client) {
  const settings = await loadWelcomeEmbedSettings(config);
  const channelId = settings.channelId || config.channels.welcome;
  const channel = await client.channels.fetch(channelId);

  if (!channel?.isSendable()) {
    throw new Error(`Welcome channel ${channelId} was not found or is not sendable.`);
  }

  await channel.send(createWelcomeAnnouncementPayload(settings, member));
}
