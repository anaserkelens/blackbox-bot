const { Events } = require('discord.js');

const { config } = require('../utils/config');
const {
  getTempVoiceStorageInfo,
  handleTempVoiceInteraction,
  handleTempVoiceStateUpdate,
  handleTrackedChannelDelete,
  initializeTempVoiceRooms,
} = require('../utils/tempVoiceRooms');

module.exports = {
  name: 'tempVoiceRooms',
  setup(client) {
    client.on(Events.VoiceStateUpdate, (oldState, newState) => {
      handleTempVoiceStateUpdate(oldState, newState, client, config).catch((error) => {
        console.error('Temporary voice state handling failed:', error);
      });
    });

    client.on(Events.InteractionCreate, (interaction) => {
      handleTempVoiceInteraction(interaction, client, config).catch((error) => {
        console.error('Temporary voice interaction failed:', error);

        const response = { content: 'Something went wrong while opening that voice room.' };

        if (interaction.replied || interaction.deferred) {
          interaction.followUp(response).catch(() => null);
        } else if (interaction.isRepliable()) {
          interaction.reply(response).catch(() => null);
        }
      });
    });

    client.on(Events.ChannelDelete, (channel) => {
      handleTrackedChannelDelete(channel, config).catch((error) => {
        console.error('Temporary voice channel cleanup failed:', error);
      });
    });

    client.once(Events.ClientReady, () => {
      const storage = getTempVoiceStorageInfo(config);

      console.log(
        `Temporary voice storage: ${storage.filePath} ` +
        `(${storage.persistent ? 'persistent' : 'ephemeral'}, ${storage.source}).`,
      );

      if (!storage.persistent) {
        console.warn('Temporary voice room tracking will reset after redeploys unless a Railway volume is attached.');
      }

      initializeTempVoiceRooms(client, config).catch((error) => {
        console.error('Temporary voice room initialization failed:', error);
      });
    });
  },
};
