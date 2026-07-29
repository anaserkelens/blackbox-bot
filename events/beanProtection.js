const { Events } = require('discord.js');

const {
  evaluateProtectionJoin,
  evaluateProtectionMessage,
  processEmergencyExpiration,
  queueNativeAutoModerationExecution,
} = require('../utils/beanProtection');
const { config } = require('../utils/config');

module.exports = {
  setup(client) {
    client.on(Events.MessageCreate, (message) => {
      evaluateProtectionMessage(message, client, config)
        .catch((error) => console.error('Bean message protection failed:', error));
    });
    client.on(Events.GuildMemberAdd, (member) => {
      evaluateProtectionJoin(member, client, config)
        .catch((error) => console.error('Bean join protection failed:', error));
    });
    client.on(Events.AutoModerationActionExecution, (execution) => {
      queueNativeAutoModerationExecution(execution, client, config);
    });

    const checkEmergencyExpiration = () => {
      processEmergencyExpiration(client, config)
        .catch((error) => console.error('Emergency safety profile restoration failed:', error));
    };
    const expirationTimer = setInterval(checkEmergencyExpiration, 30000);

    expirationTimer.unref?.();
    client.once(Events.ClientReady, checkEmergencyExpiration);
  },
};
