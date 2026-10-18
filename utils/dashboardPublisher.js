const { PermissionFlagsBits } = require('discord.js');

const pendingWebhooks = new Map();

async function sendDashboardMessage(client, channel, payload, sender, user) {
  if (!sender || sender === 'bean') return channel.send(payload);
  if (sender !== 'webhook') throw new Error('Choose Bean or My name & avatar as the sender.');
  if (!user || user.authMode === 'password' || !/^\d{17,20}$/.test(user.id)) {
    throw new Error('Sign in with Discord to send with your name and avatar.');
  }
  const target = channel.isThread?.() ? channel.parent : channel;
  if (!target?.fetchWebhooks || !target?.createWebhook) {
    throw new Error('This channel does not support webhook messages.');
  }
  if (!target.permissionsFor(client.user)?.has(PermissionFlagsBits.ManageWebhooks)) {
    throw new Error('Bean needs Manage Webhooks in this channel to send with your name and avatar.');
  }
  const key = `${target.guildId}:${target.id}`;
  if (!pendingWebhooks.has(key)) {
    const pending = (async () => {
      const hooks = await target.fetchWebhooks();
      return hooks.find((hook) => hook.owner?.id === client.user.id && hook.name === 'Bean Dashboard' && hook.token)
        || target.createWebhook({ name: 'Bean Dashboard', reason: 'Dashboard message publishing' });
    })();
    pendingWebhooks.set(key, pending);
  }
  let webhook;
  try {
    webhook = await pendingWebhooks.get(key);
  } finally {
    pendingWebhooks.delete(key);
  }
  return webhook.send({
    ...payload,
    username: String(user.displayName || user.username).slice(0, 80),
    avatarURL: user.avatarUrl || undefined,
    withComponents: true,
    ...(channel.isThread?.() ? { threadId: channel.id } : {}),
  });
}

module.exports = { sendDashboardMessage };
