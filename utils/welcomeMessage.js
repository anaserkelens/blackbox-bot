const path = require('node:path');

const { ContainerBuilder, SeparatorSpacingSize } = require('./components');
const { config } = require('./config');

const welcomeHeaderImageName = 'UNDR_CTRL_Welcome_Header.png';
const welcomeHeaderImagePath = path.join(__dirname, '..', 'images', welcomeHeaderImageName);

function createWelcomeMessagePayload(imagePath) {
  const helpContact = config.roles.staff ? `<@&${config.roles.staff}>` : 'a member of the staff team';
  const container = new ContainerBuilder()
    .addMediaGalleryComponents((gallery) =>
      gallery.addItems((mediaGalleryItem) =>
        mediaGalleryItem.setURL(`attachment://${welcomeHeaderImageName}`),
      ),
    )
    .addSeparatorComponents((separator) =>
      separator.setDivider(false).setSpacing(SeparatorSpacingSize.Small),
    )
    .addSeparatorComponents((separator) =>
      separator.setDivider(false).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents((textDisplay) =>
      textDisplay.setContent(`# WELCOME TO ${config.communityName.toUpperCase()}
> ${config.communityDescription}
> Get involved, meet the community, and help shape what comes next.

# GOT QUESTIONS?
> Reach out to ${helpContact} if you need help. Someone from the team will get back to you as soon as possible.
`),
    )
    .addSeparatorComponents((separator) =>
      separator.setDivider(false).setSpacing(SeparatorSpacingSize.Small),
    )
    .addSeparatorComponents((separator) =>
      separator.setDivider(false).setSpacing(SeparatorSpacingSize.Small),
    );

  if (config.guildId && (config.channels.guidelines || config.channels.introductions)) {
    container
      .addTextDisplayComponents((textDisplay) => textDisplay.setContent('# GET STARTED'))
      .addActionRowComponents((actionRow) => {
        if (config.channels.guidelines) {
          actionRow.addComponents((button) =>
            button
              .setLabel('Guidelines')
              .setURL(`https://discord.com/channels/${config.guildId}/${config.channels.guidelines}`),
          );
        }

        if (config.channels.introductions) {
          actionRow.addComponents((button) =>
            button
              .setLabel('Introduce yourself')
              .setURL(`https://discord.com/channels/${config.guildId}/${config.channels.introductions}`),
          );
        }
      });
  }

  return container.toDiscordPayload([{ attachment: imagePath, name: welcomeHeaderImageName }]);
}

module.exports = {
  createWelcomeMessagePayload,
  welcomeHeaderImageName,
  welcomeHeaderImagePath,
};
