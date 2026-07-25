const { Events } = require('discord.js');

const { config } = require('../utils/config');
const {
  getMailboxScheduleStorageInfo,
  startMailboxScheduler,
} = require('../utils/mailboxScheduler');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    try {
      const storage = getMailboxScheduleStorageInfo(config);

      console.log(
        `Scheduled Mailbox storage: ${storage.filePath} ` +
        `(${storage.persistent ? 'persistent' : 'ephemeral'}, ${storage.source}).`,
      );

      if (!storage.persistent) {
        console.warn('Scheduled Mailbox posts may reset after redeploys unless a Railway volume is attached.');
      }

      await startMailboxScheduler(client, config);
    } catch (error) {
      console.error('Failed to start the Scheduled Mailbox publisher:', error);
    }
  },
};
