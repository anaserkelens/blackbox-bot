const { PermissionFlagsBits } = require('discord.js');

async function validateJoinRole(guild, roleId) {
  if (!roleId) return null;
  if (!/^\d{17,20}$/.test(String(roleId))) throw new Error('Choose a valid role.');
  const role = await guild.roles.fetch(roleId);
  if (!role || role.id === guild.id || role.managed || role.guild?.id !== guild.id) {
    throw new Error('Choose a regular role from this server.');
  }
  const bot = guild.members.me || await guild.members.fetchMe();
  if (!bot.permissions.has(PermissionFlagsBits.ManageRoles)) throw new Error('Bean needs Manage Roles permission.');
  if (!role.editable) throw new Error('Move Bean’s highest role above the role you want to assign.');
  return role;
}

async function assignJoinRole(member, config) {
  const roleId = config.roles.autoJoin;
  if (!roleId || member.user.bot || member.pending || member.roles.cache.has(roleId)) return false;
  if (config.guildId && member.guild.id !== config.guildId) return false;
  const role = await validateJoinRole(member.guild, roleId);
  await member.roles.add(role.id, 'Automatic role on joining the server');
  return true;
}

module.exports = { validateJoinRole, assignJoinRole };
