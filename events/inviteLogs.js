const { Events } = require('discord.js');

const { config } = require('../utils/config');
const {
  colors,
  formatChannel,
  formatTimestamp,
  formatUser,
  sendStructuredLog,
} = require('../utils/structuredLog');

const inviteCache = new Map();

module.exports = {
  setup(client) {
    client.once(Events.ClientReady, () => primeInviteCache(client));
    client.on(Events.InviteCreate, (invite) => handleInviteCreate(invite, client));
    client.on(Events.InviteDelete, (invite) => handleInviteDelete(invite, client));
    client.on(Events.GuildMemberAdd, (member) => attributeMemberInvite(member, client));
  },
};

async function primeInviteCache(client) {
  for (const guild of client.guilds.cache.values()) {
    const invites = await guild.invites.fetch().catch(() => null);

    if (invites) {
      inviteCache.set(guild.id, snapshotInvites(invites));
    }
  }
}

async function handleInviteCreate(invite, client) {
  if (!invite.guild) return;

  const guildInvites = inviteCache.get(invite.guild.id) || new Map();
  guildInvites.set(invite.code, snapshotInvite(invite));
  inviteCache.set(invite.guild.id, guildInvites);

  await sendStructuredLog(client, config.channels.entryLog, {
    title: 'Invite Created',
    emoji: '🔗',
    color: colors.success,
    summary: `A new invite was created for ${invite.channel}.`,
    referenceId: `INVITE-CREATE-${invite.code}`,
    fields: [
      { name: 'Invite Code', value: `\`${invite.code}\`` },
      { name: 'Created By', value: invite.inviter ? formatUser(invite.inviter) : 'Unknown' },
      { name: 'Channel', value: formatChannel(invite.channel) },
      { name: 'Created At', value: invite.createdTimestamp ? formatTimestamp(invite.createdTimestamp) : 'Unknown' },
      { name: 'Expires', value: invite.expiresTimestamp ? `${formatTimestamp(invite.expiresTimestamp)}\n-# ${formatTimestamp(invite.expiresTimestamp, 'R')}` : 'Never' },
      { name: 'Maximum Uses', value: invite.maxUses ? invite.maxUses.toLocaleString() : 'Unlimited' },
      { name: 'Temporary Membership', value: invite.temporary ? 'Yes' : 'No' },
    ],
  });
}

async function handleInviteDelete(invite, client) {
  if (!invite.guild) return;

  const previous = inviteCache.get(invite.guild.id)?.get(invite.code);
  inviteCache.get(invite.guild.id)?.delete(invite.code);

  await sendStructuredLog(client, config.channels.entryLog, {
    title: 'Invite Deleted',
    emoji: '✂️',
    color: colors.danger,
    summary: `Invite code \`${invite.code}\` is no longer available.`,
    referenceId: `INVITE-DELETE-${invite.code}`,
    fields: [
      { name: 'Invite Code', value: `\`${invite.code}\`` },
      { name: 'Created By', value: invite.inviter ? formatUser(invite.inviter) : (previous?.inviter ? formatUser(previous.inviter) : 'Unknown') },
      { name: 'Channel', value: invite.channel ? formatChannel(invite.channel) : (previous?.channel ? formatChannel(previous.channel) : 'Unknown') },
      { name: 'Uses Before Deletion', value: String(invite.uses ?? previous?.uses ?? 'Unknown') },
      { name: 'Maximum Uses', value: invite.maxUses || previous?.maxUses ? String(invite.maxUses || previous.maxUses) : 'Unlimited / unknown' },
    ],
  });
}

async function attributeMemberInvite(member, client) {
  const previousInvites = inviteCache.get(member.guild.id) || new Map();
  const currentInvites = await member.guild.invites.fetch().catch(() => null);

  if (!currentInvites) {
    return;
  }

  const usedInvite = currentInvites.find((invite) => {
    const previousUses = previousInvites.get(invite.code)?.uses || 0;
    return (invite.uses || 0) > previousUses;
  });

  inviteCache.set(member.guild.id, snapshotInvites(currentInvites));

  await sendStructuredLog(client, config.channels.entryLog, {
    title: usedInvite ? 'Invite Used' : 'Join Source Unresolved',
    emoji: usedInvite ? '🎟️' : '❓',
    color: usedInvite ? colors.info : colors.warning,
    summary: usedInvite
      ? `${member.user} joined using invite \`${usedInvite.code}\`.`
      : `No standard invite usage increase was detected for ${member.user}.`,
    thumbnailUrl: member.user.displayAvatarURL({ size: 256 }),
    referenceId: `JOIN-SOURCE-${member.id}-${Date.now()}`,
    fields: [
      { name: 'New Member', value: formatUser(member.user) },
      { name: 'Invite Code', value: usedInvite ? `\`${usedInvite.code}\`` : 'Unknown (vanity URL, bot invite, or missing permissions)' },
      { name: 'Invited By', value: usedInvite?.inviter ? formatUser(usedInvite.inviter) : 'Unknown' },
      { name: 'Invite Channel', value: usedInvite?.channel ? formatChannel(usedInvite.channel) : 'Unknown' },
      { name: 'Current Uses', value: usedInvite?.uses?.toLocaleString() || 'Unknown' },
      { name: 'Maximum Uses', value: usedInvite ? (usedInvite.maxUses ? usedInvite.maxUses.toLocaleString() : 'Unlimited') : 'Unknown' },
      { name: 'Expires', value: usedInvite?.expiresTimestamp ? formatTimestamp(usedInvite.expiresTimestamp) : 'Never / unknown' },
    ],
  });
}

function snapshotInvites(invites) {
  return new Map(invites.map((invite) => [invite.code, snapshotInvite(invite)]));
}

function snapshotInvite(invite) {
  return {
    code: invite.code,
    uses: invite.uses || 0,
    maxUses: invite.maxUses || 0,
    expiresTimestamp: invite.expiresTimestamp || null,
    inviter: invite.inviter || null,
    channel: invite.channel || null,
  };
}
