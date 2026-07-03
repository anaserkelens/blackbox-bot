const {
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} = require('discord.js');

const { config } = require('../utils/config');
const {
  loadProgressionState,
  saveProgressionSettings,
} = require('../utils/progression');

const data = new SlashCommandBuilder()
  .setName('progression')
  .setDescription('Enable, disable, or check the progression system.')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setDMPermission(false)
  .addSubcommand((subcommand) =>
    subcommand
      .setName('enable')
      .setDescription('Enable challenges, XP tracking, and progression commands.'),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('disable')
      .setDescription('Pause challenges, XP tracking, and progression commands.'),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('status')
      .setDescription('Check whether challenges and progression are enabled.'),
  );

async function execute(interaction) {
  const isOwner =
    interaction.user.id === config.ownerUserId ||
    interaction.guild?.ownerId === interaction.user.id;
  const isAdministrator = interaction.memberPermissions?.has(
    PermissionFlagsBits.Administrator,
  );

  if (!interaction.inGuild() || (!isOwner && !isAdministrator)) {
    await interaction.reply({
      content: 'Only a server administrator or the owner can use this command.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const action = interaction.options.getSubcommand();
  const currentState = await loadProgressionState(config);

  if (action === 'status') {
    await interaction.reply({
      content: createStatusMessage(currentState.settings.enabled),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const enabled = action === 'enable';

  if (currentState.settings.enabled === enabled) {
    await interaction.reply({
      content: createStatusMessage(enabled),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await saveProgressionSettings(config, { enabled });
  await interaction.reply({
    content: enabled
      ? 'Challenges and progression are now enabled. XP tracking and member commands have resumed.'
      : 'Challenges and progression are now disabled. Existing XP is preserved and tracking/member commands are paused.',
    flags: MessageFlags.Ephemeral,
  });
}

function createStatusMessage(enabled) {
  return enabled
    ? 'Challenges and progression are currently enabled.'
    : 'Challenges and progression are currently disabled. Existing XP is preserved.';
}

module.exports = { adminOnly: true, data, execute };
