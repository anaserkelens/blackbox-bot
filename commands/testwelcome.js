const { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

const { config } = require('../utils/config');
const { createWelcomeAnnouncementPayload } = require('../utils/welcomeAnnouncement');
const { loadWelcomeEmbedSettings } = require('../utils/welcomeEmbedSettings');

const data = new SlashCommandBuilder()
  .setName('testwelcome')
  .setDescription('Test the saved welcome message in the current channel.')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setDMPermission(false);

async function execute(interaction) {
  const isOwner = interaction.user.id === config.ownerUserId;
  const hasFounderRole = interaction.member?.roles?.cache?.has(config.roles.founder);

  if (!interaction.inGuild() || !isOwner || !hasFounderRole) {
    await interaction.reply({
      content: 'Only the bot owner with the Founder role can use this command.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  if (!interaction.channel?.isSendable()) {
    await interaction.editReply('This channel is not available for the welcome message test.');
    return;
  }

  const settings = await loadWelcomeEmbedSettings(config);

  await interaction.channel.send(createWelcomeAnnouncementPayload(settings, interaction.member));
  await interaction.editReply(`Welcome message test sent in ${interaction.channel}.`);
}

module.exports = { data, execute, ownerOnly: true };
