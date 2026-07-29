const { EmbedBuilder } = require('discord.js');

const {
  TRAITS,
  TRAIT_DETAILS,
  createCommunityProfileEmbedData,
} = require('./communityGrowth');

const traitEmoji = {
  presence: '🌱',
  spark: '✨',
  support: '💙',
  community: '🤝',
  trust: '🛡️',
};

function createCommunityProfileEmbed(profile) {
  const data = createCommunityProfileEmbedData(profile);
  const badges = data.badges.length
    ? data.badges.slice(0, 8).map((badge) => `**${badge.name}**`).join(' · ')
    : 'No badges yet—growth is just getting started.';
  const traitLines = data.scores.map((score) => {
    const bar = createGrowthBar(score.lifetime, getTraitScale(profile, score.id));

    return `${traitEmoji[score.id]} **${score.name}**  ${bar}  **${score.lifetime}** · ${score.season} this season`;
  });
  const embed = new EmbedBuilder()
    .setColor(parseColor(data.color))
    .setTitle(data.title)
    .setDescription(data.description)
    .addFields(
      {
        name: `${data.stage.name} · ${data.total} lifetime growth`,
        value: data.stage.next
          ? `${createGrowthBar(data.total - data.stage.minimum, data.stage.next.minimum - data.stage.minimum)} ${data.stage.next.minimum - data.total} until ${data.stage.next.name}`
          : 'The garden is fully grown—for now.',
      },
      {
        name: 'Growth traits',
        value: traitLines.join('\n'),
      },
      {
        name: 'Recognition',
        value: `${badges}\n${data.kudosReceived} kudos received`,
      },
    )
    .setFooter({
      text: `${data.season.name} · ${data.seasonTotal} seasonal growth · Quality over quantity`,
    })
    .setTimestamp(new Date(profile.updatedAt));

  if (profile.avatarUrl) {
    embed.setThumbnail(profile.avatarUrl);
  }

  return embed;
}

function createAchievementsEmbed(profile) {
  const earned = profile.badges.length
    ? profile.badges.map((badge) =>
      `**${badge.name}**\n${badge.description} · <t:${Math.floor(new Date(badge.earnedAt).getTime() / 1000)}:d>`
    ).join('\n\n')
    : 'No achievements yet. Meaningful participation, unique reactions, voice time, kudos, and positive active days all help the garden grow.';

  return new EmbedBuilder()
    .setColor(parseColor(profile.accentColor))
    .setTitle(`${profile.displayName} · Achievements`)
    .setDescription(earned)
    .setFooter({ text: `${profile.badges.length} earned · ${profile.title}` });
}

function createLeaderboardEmbed(result) {
  const traitName = result.trait === 'total' ? 'Overall Growth' : TRAIT_DETAILS[result.trait].name;
  const periodName = result.period === 'lifetime' ? 'Lifetime' : result.season.name;
  const lines = result.profiles.length
    ? result.profiles.map((profile) => {
      const medal = ['🥇', '🥈', '🥉'][profile.rank - 1] || `**${profile.rank}.**`;

      return `${medal} **${profile.displayName}** · ${profile.score} ${traitName.toLowerCase()} · ${profile.title}`;
    }).join('\n')
    : result.public
      ? 'No one has earned growth in this category yet.'
      : 'Public leaderboards are disabled for this community.';

  return new EmbedBuilder()
    .setColor(0x8fa1be)
    .setTitle(`${traitName} · ${periodName}`)
    .setDescription(lines)
    .setFooter({ text: 'Growth rewards meaningful participation, not message volume.' });
}

function createSeasonEmbed(overview) {
  const season = overview.season;
  const endTimestamp = Math.floor(new Date(season.endsAt).getTime() / 1000);

  return new EmbedBuilder()
    .setColor(0x8fa1be)
    .setTitle(season.name)
    .setDescription('A shared chapter of Community Growth. Lifetime achievements remain when a new season begins.')
    .addFields(
      { name: 'Ends', value: `<t:${endTimestamp}:F>\n<t:${endTimestamp}:R>`, inline: true },
      { name: 'Active profiles', value: String(overview.metrics.activeProfiles), inline: true },
      { name: 'Growth this season', value: String(overview.metrics.seasonGrowth), inline: true },
      { name: 'Kudos this season', value: String(overview.metrics.seasonKudos), inline: true },
    )
    .setFooter({ text: 'Presence · Spark · Support · Community · Trust' });
}

function createGrowthBar(value, maximum, width = 8) {
  const safeMaximum = Math.max(1, Number(maximum) || 1);
  const filled = Math.min(width, Math.max(0, Math.round((Number(value) || 0) / safeMaximum * width)));

  return `${'▰'.repeat(filled)}${'▱'.repeat(width - filled)}`;
}

function getTraitScale(profile, trait) {
  const highest = Math.max(...TRAITS.map((key) => profile.traits[key]), 10);

  return Math.max(highest, profile.traits[trait]);
}

function parseColor(value) {
  const parsed = Number.parseInt(String(value || '#8FA1BE').replace('#', ''), 16);

  return Number.isFinite(parsed) ? parsed : 0x8fa1be;
}

module.exports = {
  createAchievementsEmbed,
  createCommunityProfileEmbed,
  createLeaderboardEmbed,
  createSeasonEmbed,
};
