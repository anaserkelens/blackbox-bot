# UNDR CTRL Bean Bot

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
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=412605631504&scope=bot%20applications.commands
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
   DASHBOARD_SETTINGS_PATH
   DASHBOARD_DISCORD_OAUTH_ENABLED
   DASHBOARD_PUBLIC_URL
   DISCORD_CLIENT_SECRET
   DASHBOARD_SAVED_MESSAGES_PATH
   DASHBOARD_PRESENCE_PATH
   DASHBOARD_STREAM_EMBED_PATH
   DASHBOARD_WELCOME_EMBED_PATH
   MAILBOX_SCHEDULE_PATH
   DASHBOARD_ACTIVITY_PATH
   MODERATION_CASES_PATH
   TEMP_VOICE_PATH
   TEMP_VOICE_TRIGGER_CHANNEL_ID
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

Bot-issued warnings, timeouts, kicks, and bans are stored in a sequential moderation ledger (`CASE-000001`, `CASE-000002`, and so on). Staff can use `/case number:<number>` to inspect one case, `/history member:<user>` to view a member’s ten most recent cases, and `/reason case:<number> reason:<text>` to correct a stored reason. Corrections retain their reason history and are logged in `#case-files`.

The ledger is stored at `RAILWAY_VOLUME_MOUNT_PATH/moderation-cases.json` when a Railway volume is attached. Set `MODERATION_CASES_PATH` to override its location. Without persistent storage, cases can reset after a redeployment.

The dashboard Cases tab provides staff-facing search and filters for case number, member, moderator, reason, action, status, and date. It includes case totals, 30-day activity, repeat-member indicators, member timelines, full reason-correction history, and audited case revocation. Dashboard corrections and revocations update the same persistent ledger and post a Components V2 audit entry in `#case-files`.

## Temporary Voice Rooms

When a member joins the create lobby (`TEMP_VOICE_TRIGGER_CHANNEL_ID`, default `1520514900978307226`), Bean immediately creates a public voice channel named `— DISPLAY NAME'S ROOM` under the lobby's category, gives its creator room-management permission, and moves them inside. The server-specific display name is preferred, with the global name and username used only as fallbacks. There is no DM, button, or naming form.

Bean needs Manage Channels, Manage Roles, Move Members, View Channels, Connect, and Speak in the lobby's server/category. The invite link above includes those permissions.

Tracked rooms are deleted after they remain completely empty for 10 seconds. Their IDs and owners are stored at `RAILWAY_VOLUME_MOUNT_PATH/temporary-voice.json` when a Railway volume is attached, or at `TEMP_VOICE_PATH` when overridden. The dashboard Voice Rooms tab can enable or pause creation, change the lobby, show active rooms and occupants, and delete a room immediately.

The room creator can use `/room limit members:<0-99>` while connected to their temporary room. A value of `0` removes the limit. Other members cannot change the room's capacity, and no additional room controls are exposed.

Optional systems are controlled by environment variables. For example, tickets need `TICKET_CHANNEL_ID`, ticket logs need `TICKET_LOG_CHANNEL_ID`, and reaction roles need `REACTION_ROLE_MESSAGE_ID`, `REACTION_ROLE_EMOJI_ID`, and `VERIFIED_ROLE_ID`. See [.env.example](.env.example) for the full list.

The stream monitor has two paths. `FEATURED_STREAMER_USER_ID` receives a Twitch announcement in `ANNOUNCEMENT_CHANNEL_ID` without receiving the live role. Other members receive `LIVE_ROLE_ID` while streaming on Twitch, with no announcement posted. Enable `STREAM_MONITOR_ENABLED` and the Discord Developer Portal Presence Intent to use it.

The dashboard Live Embed tab controls both the featured Twitch announcement and the YouTube upload notification templates, including advanced embed fields, link buttons, and embed-safe divider/spacer layout blocks. Twitch settings are stored in `stream-embed.json`; YouTube settings are stored separately in `youtube-embed.json`. Both automatically use `RAILWAY_VOLUME_MOUNT_PATH` when a volume is attached. Use `DASHBOARD_STREAM_EMBED_PATH` and `DASHBOARD_YOUTUBE_EMBED_PATH` to override those locations.

The YouTube upload monitor watches `@5nooof` through YouTube's public channel feed every five minutes by default. It pings the `NEW UPLOAD` role and uses a Components V2 notification with the large video thumbnail plus a `Watch on YouTube` button. Previously seen video IDs are stored in `youtube-upload-state.json`, so restarts do not resend old uploads. Configure the channel, poll interval, role, destination, and storage with the `YOUTUBE_*` variables in `.env.example`.

The Welcome Message tab provides a block-based Components V2 composer for automatic member greetings, matching the normal Messages layout. It supports uploaded header images, accent colors, text/divider/spacer blocks, accessory and action-row buttons, Unicode or custom server emoji on buttons, and member/server placeholders. New members are welcomed in `WELCOME_CHANNEL_ID` (default `1520407983354544171`). Settings are stored in `welcome-embed.json` on the Railway volume, or at `DASHBOARD_WELCOME_EMBED_PATH` when overridden. Enable the Server Members Intent in Discord and set `ENABLE_SERVER_MEMBERS_INTENT=true` so join events reach the bot.

Announcements with link buttons use a Discord Components V2 container so the buttons render inside the same bordered announcement block. Each button can optionally show a Unicode emoji or a custom Discord emoji such as `<:name:id>`. Buttonless announcements continue to use standard Discord embeds.

Member and role mentions in notification message content are enabled for real announcements, `/teststream`, and `/testyoutube`.

To keep live, YouTube, and welcome embed settings across Railway restarts and redeploys, attach a volume to the bot service (for example at `/data`). Railway provides `RAILWAY_VOLUME_MOUNT_PATH` automatically and the bot stores the settings and YouTube upload state files there. The dashboard shows whether storage is persistent and keeps separate browser backups that can restore missing server-side settings when the dashboard is reopened.

`/teststream` posts the currently saved live embed in the channel where the command is used. It is restricted at runtime to `BOT_OWNER_USER_ID`, who must also have `FOUNDER_ROLE_ID`; both IDs have UNDR CTRL defaults in `.env.example`.

`/testyoutube` posts the currently saved YouTube notification using the channel's latest video when available. It has the same owner-plus-Founder restriction as `/teststream` and does not alter the upload monitor's seen-video state.

## Dashboard

Set `DASHBOARD_PASSWORD` in Railway to enable the browser dashboard. Railway will expose it at your service URL:

```text
https://your-service.up.railway.app/
```

The Settings workspace includes a persistent Configuration Center for channels, roles, storage, Discord permissions, privileged intents, dashboard access, and audited change history. Every bot system now owns its enable switch on its dedicated feature page; disabled systems remain accessible but appear muted in the sidebar. Settings write to `dashboard-settings.json` on the Railway volume, or to `DASHBOARD_SETTINGS_PATH` when explicitly configured. Saved channel and role choices are available to active systems immediately. Gateway intent changes and enabling a monitor that was disabled during startup still require updating the Discord Developer Portal/Railway variables when applicable and restarting Bean.

Discord sign-in can replace or complement the shared password. Set `DASHBOARD_DISCORD_OAUTH_ENABLED=true`, `DASHBOARD_PUBLIC_URL`, and `DISCORD_CLIENT_SECRET`, then add `DASHBOARD_PUBLIC_URL/auth/discord/callback` to the application's OAuth2 redirects in the Discord Developer Portal. Access follows the bot owner, Founder, Staff, Moderator, Dashboard Administrator, Dashboard Editor, and Dashboard Viewer roles. Read and write permissions are enforced by the API, not only hidden in the interface.

The dashboard header includes a persistent notification inbox for cases, failed scheduled posts, bot errors, and join spikes. Message, Mailbox, Welcome, Twitch, and YouTube builders keep browser version history with autosave, undo, redo, and duplication. Welcome and creator-notification drafts can be test-sent from the dashboard without resolving real member or role pings. Staff filters, the current workspace, and compact-density preference are remembered per browser.

The dashboard sends messages through the running bot, so no restart or slash command is needed. The bot must already be online, and it must have permission to send messages and attach files in the target channel.

The Mailbox tab builds Components v2 posts for updates, news, announcements, and community notices. Posts can be sent immediately or scheduled for a future date and time; Bean checks the queue every five seconds and retries failed publications up to three times. Choose any writable server channel from the dashboard selector. Scheduled posts retain the selected channel, while `MAILBOX_CHANNEL_ID` supplies the default selection.

The Messages, Mailbox, Creator Notifications, and Welcome builders load their destination selectors from Discord. Only server channels the bot can view and send messages in are listed, grouped by Discord category. A previously saved channel that is deleted or no longer accessible remains visible as unavailable until another destination is selected.

The Scheduled Mailbox queue is stored at `RAILWAY_VOLUME_MOUNT_PATH/scheduled-mailbox.json` when a Railway volume is attached. Set `MAILBOX_SCHEDULE_PATH` to override its location. The queue and its controls exist only in the dashboard; no scheduling slash command is registered.

The Overview tab includes a Bot Health panel for deployment uptime, Discord gateway latency, API availability, persistent-storage state, and errors captured during the current deployment. Beside it, the Activity Feed combines recent joins and departures, moderation activity, Mailbox publications, and temporary-room changes. Its newest 2,000 entries use `RAILWAY_VOLUME_MOUNT_PATH/activity-feed.json` when a Railway volume is attached, or `DASHBOARD_ACTIVITY_PATH` when overridden. These views are authenticated dashboard features and do not add public Discord commands.

The Members tab searches the connected Discord server by display name, username, or member ID. A profile combines current Discord details with join and departure history, moderation cases and warnings, temporary-room history, and recent slash-command interactions with Bean. General bot startup and system actions are deliberately excluded from the public Activity Feed. Member-aware history begins accumulating after this version is deployed; existing moderation cases are available immediately.

The Analytics tab provides 7, 30, and 90-day views of joins and leaves, voice-channel join hours, moderation actions, active-member counts, and Mailbox publishing. Mailbox engagement counts reactions on Bean's 50 most recent messages in the configured Mailbox channel and requires View Channel and Read Message History permissions. Online-member analytics also require `ENABLE_PRESENCE_INTENT=true` and the matching Discord Developer Portal intent.

While the authenticated dashboard is open, it checks every ten seconds for new moderation cases, failed Scheduled Mailbox posts, captured bot errors, and unusual join activity. Five or more joins within five minutes trigger a join-spike notification. These cozy notification cards appear without refreshing and link directly to the relevant Dashboard workspace.

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
