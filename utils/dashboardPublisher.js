function parseWebhookUrl(value) {
  const match = String(value || '').trim().match(/^https:\/\/discord\.com\/api\/(?:v\d+\/)?webhooks\/(\d{17,20})\/([A-Za-z0-9_-]+)\/?$/);
  if (!match) throw new Error('Paste a valid Discord webhook URL (https://discord.com/api/webhooks/…).');
  return { id: match[1], token: match[2] };
}

async function sendDashboardMessage(client, channel, payload, sender, webhookUrl) {
  if (!sender || sender === 'bean') return channel.send(payload);
  if (sender !== 'webhook') throw new Error('Choose Bean or Discord webhook as the sender.');
  const { id, token } = parseWebhookUrl(webhookUrl);
  let webhook;
  try {
    webhook = await client.fetchWebhook(id, token);
  } catch {
    throw new Error('Could not access that webhook. Check the URL and make sure it has not been deleted.');
  }
  const target = channel.isThread?.() ? channel.parent : channel;
  if (webhook.guildId !== channel.guildId || webhook.channelId !== target?.id) {
    throw new Error('This webhook must belong to the selected server and destination channel.');
  }
  try {
    return await webhook.send({ ...payload, withComponents: true,
      ...(channel.isThread?.() ? { threadId: channel.id } : {}) });
  } catch (error) {
    if (error.code === 40005 || error.status === 413) throw new Error('Discord rejected the upload size. Try a smaller file for this server.');
    throw new Error('Discord could not publish through this webhook. Check that it is active and that the message fits Discord’s file and component limits.');
  }
}

module.exports = { sendDashboardMessage, parseWebhookUrl };
