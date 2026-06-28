const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  Events,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');

const { config } = require('../utils/config');
const {
  colors,
  formatChannel,
  formatCodeBlock,
  formatUser,
  sendStructuredLog,
} = require('../utils/structuredLog');

const activeTickets = new Map();

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isButton() && interaction.customId === 'create_ticket') {
      await handleTicketCreation(interaction);
      return;
    }

    if (interaction.isButton() && interaction.customId === 'close_ticket') {
      await showCloseModal(interaction);
      return;
    }

    if (interaction.isModalSubmit() && interaction.customId === 'close_ticket_modal') {
      await handleTicketClose(interaction);
    }
  },
};

async function handleTicketCreation(interaction) {
  await interaction.deferReply({ ephemeral: true });

  if (!config.channels.tickets) {
    await interaction.editReply('Ticket system is not configured yet.');
    return;
  }

  if (activeTickets.has(interaction.user.id)) {
    const ticketData = activeTickets.get(interaction.user.id);
    await interaction.editReply(`You already have an open ticket: <#${ticketData.threadId}>`);
    return;
  }

  const ticketChannel = await interaction.client.channels.fetch(config.channels.tickets).catch(() => null);

  if (!ticketChannel?.isTextBased()) {
    await interaction.editReply('Ticket channel was not found.');
    return;
  }

  const ticketNumber = Date.now().toString().slice(-6);
  const thread = await ticketChannel.threads.create({
    name: `${interaction.user.username}-${ticketNumber}`,
    type: ChannelType.PrivateThread,
    reason: `Ticket created by ${interaction.user.tag}`,
  });

  await thread.members.add(interaction.user.id);

  const staffRole = await interaction.guild.roles.fetch(config.roles.staff).catch(() => null);

  if (staffRole) {
    for (const [memberId] of staffRole.members) {
      await thread.members.add(memberId).catch(() => null);
    }
  }

  activeTickets.set(interaction.user.id, {
    creatorId: interaction.user.id,
    threadId: thread.id,
  });

  const embed = new EmbedBuilder()
    .setTitle('Support Ticket Created')
    .setDescription(`Welcome ${interaction.user}.\n\nPlease describe your issue or question below. A staff member will be with you shortly.\n\nTicket Number: ${ticketNumber}`)
    .setColor(0x2dd4bf);

  const closeButton = new ButtonBuilder()
    .setCustomId('close_ticket')
    .setLabel('Close Ticket')
    .setStyle(ButtonStyle.Danger);

  await thread.send({
    content: `${interaction.user}`,
    embeds: [embed],
    components: [new ActionRowBuilder().addComponents(closeButton)],
  });

  await sendStructuredLog(interaction.client, config.channels.operationLog, {
    title: 'Support Ticket Created',
    emoji: '🎫',
    color: colors.success,
    summary: `${interaction.user} opened a new support ticket.`,
    thumbnailUrl: interaction.user.displayAvatarURL({ size: 256 }),
    referenceId: `TICKET-${ticketNumber}`,
    fields: [
      { name: 'Created By', value: formatUser(interaction.user) },
      { name: 'Ticket Thread', value: formatChannel(thread) },
      { name: 'Parent Channel', value: formatChannel(ticketChannel) },
      { name: 'Ticket Number', value: `\`${ticketNumber}\`` },
      { name: 'Staff Members Added', value: staffRole ? staffRole.members.size.toLocaleString() : 'Staff role unavailable' },
    ],
  });

  await interaction.editReply(`Ticket created: <#${thread.id}>`);
}

async function showCloseModal(interaction) {
  const modal = new ModalBuilder().setCustomId('close_ticket_modal').setTitle('Close Ticket');
  const reasonInput = new TextInputBuilder()
    .setCustomId('close_reason')
    .setLabel('Reason for closing')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMinLength(5)
    .setMaxLength(1000);

  modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));
  await interaction.showModal(modal);
}

async function handleTicketClose(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const ticketThread = interaction.channel;
  const closeReason = interaction.fields.getTextInputValue('close_reason');
  let ticketCreatorId = null;

  for (const [userId, ticketData] of activeTickets.entries()) {
    if (ticketData.threadId === ticketThread.id) {
      ticketCreatorId = userId;
      activeTickets.delete(userId);
      break;
    }
  }

  const messages = await ticketThread.messages.fetch({ limit: 100 });
  const transcript = messages
    .reverse()
    .map((message) => `[${message.createdAt.toLocaleString()}] ${message.author.tag}: ${message.content}`)
    .join('\n');

  await sendStructuredLog(interaction.client, config.channels.operationLog, {
    title: 'Support Ticket Closed',
    emoji: '🔒',
    color: colors.danger,
    summary: `**${ticketThread.name}** was closed.`,
    referenceId: `TICKET-CLOSE-${ticketThread.id}`,
    fields: [
      { name: 'Ticket Thread', value: formatChannel(ticketThread) },
      { name: 'Closed By', value: formatUser(interaction.user) },
      { name: 'Ticket Creator ID', value: ticketCreatorId ? `\`${ticketCreatorId}\`` : 'Unknown' },
      { name: 'Reason', value: closeReason },
      { name: 'Transcript Messages', value: messages.size.toLocaleString() },
      { name: 'Transcript Preview', value: formatCodeBlock(transcript || 'No messages', 'text') },
    ],
    files: transcript
      ? [{ attachment: Buffer.from(transcript, 'utf8'), name: `${ticketThread.name}-transcript.txt` }]
      : [],
  });

  if (ticketCreatorId) {
    const ticketCreator = await interaction.client.users.fetch(ticketCreatorId).catch(() => null);
    await ticketCreator
      ?.send(`Your ticket ${ticketThread.name} has been closed. Reason: ${closeReason}`)
      .catch(() => null);
  }

  await interaction.editReply('Ticket will be closed in 5 seconds.');

  setTimeout(() => {
    ticketThread.delete().catch((error) => console.error('Error deleting ticket thread:', error));
  }, 5000);
}
