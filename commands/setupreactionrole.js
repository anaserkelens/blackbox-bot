const { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

const { config } = require('../utils/config');
const {
  loadReactionRoleMappings,
  syncReactionRoleMappings,
} = require('../utils/reactionRoles');

const data = new SlashCommandBuilder()
  .setName('setupreactionrole')
  .setDescription('Refresh every configured reaction-role emoji.')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setDMPermission(false);

async function execute(interaction) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const mappings = (await loadReactionRoleMappings(config))
    .filter((mapping) => mapping.guildId === interaction.guildId);

  if (!mappings.length) {
    await interaction.editReply('There are no reaction-role mappings yet. Create one in the dashboard first.');
    return;
  }

  const results = await syncReactionRoleMappings(interaction.client, config, interaction.guildId);
  const succeeded = results.filter((result) => result.ok).length;
  const failed = results.length - succeeded;
  const failureCopy = failed ? ` ${failed} could not be refreshed; check the dashboard mappings.` : '';

  await interaction.editReply(`Refreshed ${succeeded} of ${results.length} reaction-role mappings.${failureCopy}`);
}

module.exports = { data, execute };
