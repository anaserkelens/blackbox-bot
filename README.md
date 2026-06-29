# UNDR CTRL Blackbox Bot

A Discord.js bot for the UNDR CTRL community, ready to run locally and deploy to Railway.

## What It Does

- Registers slash commands with Discord.
- Runs a long-lived Discord bot process for Railway.
- Keeps secrets in environment variables instead of files.
- Uses the same folder shape as the reference bot: `commands`, `events`, `images`, and `utils`.
- Includes a protected browser dashboard for sending Components v2 messages instantly.
- Includes `/ping`, `/about`, `/server`, `/help`, `/clear`, `/warn`, `/kick`, `/ban`, `/timeout`, `/ticketsetup`, `/setupreactionrole`, `/teststream`, and `/testwelcome`.
- Includes optional event systems for tickets, member logs, message logs, channel logs, scheduled event logs, moderation logs, user logs, invite moderation, reaction roles, and stream monitoring.

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in:

   ```bash
   DISCORD_TOKEN=...
   DISCORD_CLIENT_ID=...
   DISCORD_GUILD_ID=...
   WELCOME_CHANNEL_ID=...
   AUTO_REGISTER_COMMANDS=true
   DASHBOARD_PASSWORD=...
   ```

3. Start the bot:

   ```bash
   npm start
   ```

The bot automatically registers slash commands on startup when `AUTO_REGISTER_COMMANDS` is not set to `false`.

You can also register commands manually:

   ```bash
   npm run deploy:commands
   ```

## Discord Developer Portal Values

- `DISCORD_TOKEN`: Bot page -> Token.
- `DISCORD_CLIENT_ID`: General Information -> Application ID.
- `DISCORD_GUILD_ID`: Right-click your Discord server -> Copy Server ID. Developer Mode must be enabled in Discord settings.

Enable these privileged gateway intents in the Bot page only if you also enable their matching Railway variables:

- Presence Intent -> `ENABLE_PRESENCE_INTENT=true`
- Server Members Intent -> `ENABLE_SERVER_MEMBERS_INTENT=true`
- Message Content Intent -> `ENABLE_MESSAGE_CONTENT_INTENT=true`

Automatic welcome messages require the Server Members Intent in the Discord Developer Portal and `ENABLE_SERVER_MEMBERS_INTENT=true`.
Detailed message edit/delete logs require the Message Content Intent and `ENABLE_MESSAGE_CONTENT_INTENT=true`.

Invite the bot with both `bot` and `applications.commands` scopes. Detailed logging also needs View Audit Log, View Channels, Read Message History, and Send Messages in every log channel.

```text
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=412317273088&scope=bot%20applications.commands
```

## Railway Deployment

1. Push this repo to GitHub.
2. In Railway, create a new project and choose the GitHub repo.
3. Add these Railway variables:

   ```text
   DISCORD_TOKEN
   DISCORD_CLIENT_ID
   DISCORD_GUILD_ID
   WELCOME_CHANNEL_ID
   CASE_FILES_CHANNEL_ID
   ENTRY_LOG_CHANNEL_ID
   SIGNAL_LOG_CHANNEL_ID
   LINE_LOG_CHANNEL_ID
   OPERATION_LOG_CHANNEL_ID
   SYSTEM_LOG_CHANNEL_ID
   AUTO_REGISTER_COMMANDS
   PRESENCE_TEXTS
   PRESENCE_TEXT
   PRESENCE_ROTATION_SECONDS
   DASHBOARD_PASSWORD
   DASHBOARD_MAX_BODY_MB
   DASHBOARD_MAX_UPLOAD_MB
   DASHBOARD_SAVED_MESSAGES_PATH
   DASHBOARD_PRESENCE_PATH
   DASHBOARD_STREAM_EMBED_PATH
   DASHBOARD_WELCOME_EMBED_PATH
   ENABLE_SERVER_MEMBERS_INTENT
   ENABLE_MESSAGE_CONTENT_INTENT
   ENABLE_PRESENCE_INTENT
   COMMUNITY_NAME
   COMMUNITY_DESCRIPTION
   ```

4. Deploy. Railway will run `npm start` from `railway.toml`.

Slash commands are synced on startup. If `DISCORD_GUILD_ID` is set, commands update instantly in that server. Without it, commands are global and can take a while to appear.

`/testwelcome` posts the currently saved Welcome Message template in the current channel. Like `/teststream`, it is restricted to `BOT_OWNER_USER_ID`, who must also have `FOUNDER_ROLE_ID`.

## Logging

All audit messages use Discord Components V2 containers with timestamps, reference IDs, actors, targets, reasons, before/after values, IDs, and relevant context:

| Category | Default channel | Coverage |
| --- | --- | --- |
| Case files | `1520858981227172000` | Kicks, bans, unbans, timeouts, and `/warn` cases |
| Entry log | `1520858940617785565` | Joins, leaves, and optional blocked invite-link moderation |
| Signal log | `1520859015905546380` | Message edits, deletes, bulk deletes, attachments, and transcript excerpts |
| Line log | `1520915998092558527` | Voice joins, moves, leaves, session duration, mute/deafen, camera, and streaming changes |
| Operation log | `1520916058272170185` | Bot startup, scheduled events, RSVPs, and ticket creation/closure |
| System log | `1520859053012811876` | Channel creation/deletion/configuration, permission overwrites, role changes, member role assignments, nicknames, and user profiles |

`/warn member:<user> reason:<text>` sends the member a formal warning by DM and records the complete case in `#case-files`. If DMs are closed, the failed delivery is recorded in the case.

`/kick`, `/ban`, and `/timeout` provide bot-managed versions of Discord’s moderation actions. They enforce moderator permissions and role hierarchy, write identifiable audit-log reasons, DM the affected member through a Components V2 notice, and record DM delivery status in a single non-duplicated case log.

Optional systems are controlled by environment variables. For example, tickets need `TICKET_CHANNEL_ID`, ticket logs need `TICKET_LOG_CHANNEL_ID`, and reaction roles need `REACTION_ROLE_MESSAGE_ID`, `REACTION_ROLE_EMOJI_ID`, and `VERIFIED_ROLE_ID`. See [.env.example](.env.example) for the full list.

The stream monitor has two paths. `FEATURED_STREAMER_USER_ID` receives a Twitch announcement in `ANNOUNCEMENT_CHANNEL_ID` without receiving the live role. Other members receive `LIVE_ROLE_ID` while streaming on Twitch, with no announcement posted. Enable `STREAM_MONITOR_ENABLED` and the Discord Developer Portal Presence Intent to use it.

The dashboard Live Embed tab controls the featured Twitch announcement template, including advanced embed fields, link buttons, and embed-safe divider/spacer layout blocks. Its settings are stored in `stream-embed.json`, automatically on `RAILWAY_VOLUME_MOUNT_PATH` when a volume is attached. Use `DASHBOARD_STREAM_EMBED_PATH` to override that location.

The Welcome Message tab provides a block-based Components V2 composer for automatic member greetings, matching the normal Messages layout. It supports uploaded header images, accent colors, text/divider/spacer blocks, accessory and action-row buttons, Unicode or custom server emoji on buttons, and member/server placeholders. New members are welcomed in `WELCOME_CHANNEL_ID` (default `1520407983354544171`). Settings are stored in `welcome-embed.json` on the Railway volume, or at `DASHBOARD_WELCOME_EMBED_PATH` when overridden. Enable the Server Members Intent in Discord and set `ENABLE_SERVER_MEMBERS_INTENT=true` so join events reach the bot.

Announcements with link buttons use a Discord Components V2 container so the buttons render inside the same bordered announcement block. Each button can optionally show a Unicode emoji or a custom Discord emoji such as `<:name:id>`. Buttonless announcements continue to use standard Discord embeds.

Member and role mentions in live announcement message content are enabled for both real announcements and `/teststream`.

To keep live and welcome embed settings across Railway restarts and redeploys, attach a volume to the bot service (for example at `/data`). Railway provides `RAILWAY_VOLUME_MOUNT_PATH` automatically and the bot stores both settings files there. The dashboard shows whether storage is persistent and keeps separate browser backups that can restore missing server-side files when the dashboard is reopened.

`/teststream` posts the currently saved live embed in the channel where the command is used. It is restricted at runtime to `BOT_OWNER_USER_ID`, who must also have `FOUNDER_ROLE_ID`; both IDs have UNDR CTRL defaults in `.env.example`.

## Dashboard

Set `DASHBOARD_PASSWORD` in Railway to enable the browser dashboard. Railway will expose it at your service URL:

```text
https://your-service.up.railway.app/
```

The dashboard sends messages through the running bot, so no restart or slash command is needed. The bot must already be online, and it must have permission to send messages and attach files in the target channel.

The dashboard Bot tab can update the bot's avatar, banner, bio, and presence. The Presence panel can add or remove activity texts and set the rotation interval. Saving restarts the rotation immediately and stores the complete presence configuration in `data/presence.json` locally. On Railway, it automatically uses `RAILWAY_VOLUME_MOUNT_PATH/presence.json` when a volume is attached; you can override the file with `DASHBOARD_PRESENCE_PATH`. The `PRESENCE_TEXTS`, `PRESENCE_ROTATION_SECONDS`, and legacy `PRESENCE_TEXT` variables provide defaults until dashboard settings have been saved.

The browser also keeps a presence backup after every successful save. If a Railway redeploy starts without a server-side `presence.json`, opening the dashboard from that browser automatically restores and reapplies the last rotation. An attached Railway volume is still required for unattended persistence before anyone opens the dashboard.

Saved dashboard messages are shared server-side while the bot is running. On Railway, attach a persistent volume if you want them to survive redeploys. When a Railway volume is attached, the bot automatically stores saved messages at `RAILWAY_VOLUME_MOUNT_PATH/saved-messages.json`; you can override that with `DASHBOARD_SAVED_MESSAGES_PATH`.

The dashboard also keeps a browser backup after each successful save. If Railway starts with an empty store, opening a browser that still has that backup can repopulate the shared store.

## Adding Commands

Create a new file in `commands` that exports:

```js
const { SlashCommandBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
  .setName('example')
  .setDescription('Describe the command.');

async function execute(interaction) {
  await interaction.reply('Hello from UNDR CTRL.');
}

module.exports = { data, execute };
```

Then run:

```bash
npm run deploy:commands
```
