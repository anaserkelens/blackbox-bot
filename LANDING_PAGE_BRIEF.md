# Bean Public Landing Page and Subscription Brief

This document is the product, content, pricing, and routing brief for building Bean's public-facing website.

It is intended to be handed directly to Claude or another front-end developer. The public landing page must remain visually related to the existing Bean Dashboard without replacing or breaking the dashboard application.

## 1. Product summary

**Product name:** Bean  
**Category:** Discord community management bot  
**Positioning:** A warm, thoughtful control room for growing Discord communities  
**Primary differentiator:** Community Growth measures meaningful participation instead of ordinary message-count XP  
**Secondary differentiators:** A polished dashboard, hybrid AutoMod protection, creator notifications, and strong community operations

Bean combines:

- Moderation and case management
- Hybrid Discord AutoMod and Bean Protection
- Community Growth social profiles
- YouTube and Twitch creator notifications
- Welcome messages
- Reaction roles
- Temporary voice rooms
- Tickets
- Scheduled announcements through Mailbox
- Detailed Discord audit logging
- Member profiles
- Community analytics
- Dashboard health and activity monitoring

## 2. Audience

The landing page should speak to:

- Discord server owners
- Community managers
- Moderation teams
- Twitch and YouTube creators
- Gaming, creator, social, and interest-based communities
- Growing servers that want one coherent bot instead of several disconnected bots

The page should not assume that visitors are highly technical.

## 3. Core value proposition

Recommended primary statement:

> Run a community people want to return to.

Recommended supporting copy:

> Bean brings moderation, meaningful member growth, creator notifications, and everyday community tools into one calm, beautifully organized dashboard.

Alternative headline directions:

- More than levels. More than moderation.
- A better way to grow a Discord community.
- Your community, under control.
- Everything your Discord needs, without the clutter.

Recommended hero actions:

1. **Add Bean to Discord** — primary button
2. **Open Dashboard** — secondary button linking to `/login`

The global header should also contain a **Dashboard** button at the top right linking to `/login`.

When an authenticated user opens `/login`, the existing dashboard application automatically routes them to `/dashboard`.

## 4. Brand and visual direction

The landing page should feel like the public entrance to the existing Bean Dashboard.

Desired qualities:

- Dark and warm rather than cold or corporate
- Calm, premium, cozy, and slightly playful
- Spacious layouts
- Soft borders and subtle lighting
- Clear typography
- Small references to beans, growth, rooms, warmth, and community
- Professional enough for serious moderation teams

Use the existing Bean icon:

`/assets/bean-icon.png`

The existing dashboard uses Geist and Font Awesome. Reusing them will help maintain visual continuity:

- Geist variable font
- Font Awesome icons
- Existing muted navy, slate, warm cream, and soft green accents

Avoid:

- Loud gaming-dashboard neon
- Excessive gradients
- Oversized animated backgrounds
- Generic SaaS illustrations
- Fake activity numbers
- Fake testimonials
- Claims of guaranteed uptime
- Describing unfinished features as available

Animation should be subtle and respect `prefers-reduced-motion`.

## 5. Landing-page structure

### Header

Include:

- Bean icon and wordmark
- Features anchor
- Community Growth anchor
- Protection anchor
- Pricing anchor
- FAQ anchor
- Dashboard button linking to `/login`
- Add Bean button

On mobile, use an accessible menu with proper focus handling.

### Hero

Recommended content:

**Eyebrow:** The Discord community control room

**Headline:** Run a community people want to return to.

**Description:** Bean combines thoughtful moderation, meaningful member growth, creator notifications, and everyday community tools in one beautifully organized dashboard.

**Primary CTA:** Add Bean to Discord

**Secondary CTA:** Open Dashboard

The visual should show either:

- A carefully composed screenshot/mockup of the Bean Dashboard, or
- A layered representation of Growth, Protection, and Creator Notifications

Do not invent fake dashboard functionality.

### Social proof placeholder

Until real public usage exists, use an honest statement rather than fake statistics:

> Built inside a real community, shaped around the tools moderators and members actually use.

Real server counts, member counts, reviews, and uptime may be added later.

### Feature overview

Use four primary pillars:

#### Community Growth

> Meaningful participation, not message grinding.

Bean tracks five independent signals:

- **Presence** — consistently showing up
- **Spark** — inspiring reactions and conversation
- **Support** — helping other members
- **Community** — participating across the server
- **Trust** — positive recognition from the community and staff

Members receive profiles, themed growth stages, achievements, badges, and seasonal recognition without being reduced to a generic level number.

#### Bean Protection

> Fast native blocking, thoughtful follow-through.

Discord AutoMod blocks native spam and mention raids immediately. Bean complements it with behavioral detection, moderation cases, member notices, incident history, quarantine review, and reversible Watch, Raid, and Lockdown emergency profiles.

Core safety functionality must remain available on the free plan.

#### Creator Notifications

> Bring every upload and live moment back to your community.

Bean supports:

- Twitch live announcements
- Broadcasting-role behavior
- Selected or server-wide creator announcement modes
- YouTube upload notifications
- Custom notification layouts
- Discord roles and destinations

Free servers may monitor one YouTube channel. Bean Plus servers may monitor up to five.

#### The Dashboard

> Everything has a proper place.

Highlight:

- Overview and bot health
- Member search
- Moderation cases
- Growth profiles and leaderboards
- Protection incidents
- Creator notification builders
- Scheduled Mailbox
- Voice-room controls
- Reaction roles
- Audit logging
- Configuration diagnostics

### Supporting feature grid

Include concise cards for:

- Welcome messages
- Scheduled Mailbox posts
- Reaction roles
- Temporary voice rooms
- Tickets
- Member profiles
- Analytics
- Audit logs

### Dashboard showcase

Show the dashboard as a connected set of workspaces rather than a single long page.

Recommended copy:

> No commands to memorize for every setting. Bean gives your team a focused workspace for the work they are trying to do.

The showcase may feature the new real dashboard URLs:

- `/dashboard`
- `/dashboard/members`
- `/dashboard/growth`
- `/dashboard/analytics`
- `/dashboard/moderation`
- `/dashboard/creator-notifications`
- `/dashboard/protection`
- `/dashboard/settings`

### Pricing

Launch with two plans only.

#### Bean Free

**Price:** €0

Recommended description:

> Everything a new community needs to get organized, protected, and growing.

#### Bean Plus

**Price:** €3.99 per month, per Discord server  
**Annual price:** €39.99 per year, per Discord server

Recommended description:

> Higher limits, deeper insight, and more automation for established communities.

Optional launch offer:

> Early Supporter — €2.99 per month for the first 50–100 paying servers, with that price retained while the subscription remains active.

Do not offer a lifetime plan. Bean has continuing hosting, database, monitoring, and support costs.

### Free and Plus comparison

| Feature | Bean Free | Bean Plus |
|---|---|---|
| Core moderation commands | Included | Included |
| Core Bean Protection | Included | Included |
| Raid and emergency controls | Included | Included |
| YouTube upload sources | 1 | Up to 5 |
| Twitch creator announcements | 1 selected creator plus live-role behavior | Up to 5 selected creators and advanced modes |
| Welcome message | 1 customizable welcome | Advanced/multiple templates when introduced |
| Community Growth | Profiles, traits, achievements, leaderboard | Seasons, archives, advanced recognition, exclusions, and analytics |
| Reaction-role menus | Up to 3 | Up to 25 |
| Reaction-role mappings | Up to 25 | Up to 250 |
| Scheduled Mailbox posts | Immediate sends plus 5 scheduled posts per month | Unlimited reasonable scheduling |
| Temporary voice rooms | Core functionality | Higher limits and advanced owner controls |
| Tickets | 1 panel and normal ticket handling | Multiple panels, transcripts, and analytics when introduced |
| Dashboard analytics | 7 days | 90 days |
| Moderation history | Essential recent history | Extended history and exports |
| Dashboard administrators | Owner plus 2 | Up to 10 |
| Support | Community support | Priority support |

The paid offer must be sold as a bundle of creator scale, advanced Community Growth, more automation, and longer insight. It should not be marketed only as "more YouTube channels."

### What must never be paywalled

The following must remain available to free servers:

- Warn, timeout, kick, ban, and clear
- Core spam and raid protection
- Emergency lockdown and safe restoration
- Basic moderation records
- Permission and security configuration
- Privacy-related export and deletion
- Basic dashboard access
- Reasonable bot uptime and performance

Bean should charge for scale, customization, advanced control, longer history, and higher limits—not basic safety.

### Pricing CTA

Free CTA:

> Add Bean — Free

Plus CTA before billing exists:

> Join the Bean Plus waitlist

Plus CTA after billing exists:

> Upgrade a Server

Do not create a non-functional checkout button. If subscriptions are not ready, use a clearly labelled waitlist or "Coming soon" state.

### FAQ

Recommended questions:

#### Is Bean free?

Yes. Bean Free includes the core moderation, protection, Community Growth, dashboard, and community tools needed to operate a server. Bean Plus increases limits and adds deeper automation and history.

#### Is Bean Plus purchased per user?

No. A Bean Plus subscription applies to one Discord server and benefits the whole server.

#### Can I move Bean Plus to another server?

Decide this policy before launch. The recommended policy is to allow a transfer with a cooldown to prevent abuse.

#### What happens if I cancel?

The server returns to Free limits after a seven-day grace period. Paid settings are preserved but excess sources and automations are paused rather than deleted.

#### Does Bean replace Discord AutoMod?

No. Bean complements Discord AutoMod. Discord handles immediate native blocking while Bean adds behavioral protection, case tracking, incident history, quarantine review, and emergency workflows.

#### How is Community Growth different from XP?

Community Growth measures five types of meaningful participation instead of rewarding raw message volume. It is designed to recognize how someone contributes, not how often they type.

#### Can my moderators use the Dashboard?

Yes. Dashboard access and permissions can be granted through configured Discord roles.

#### How many YouTube channels can Bean monitor?

Bean Free supports one. Bean Plus supports up to five.

### Final CTA

Recommended headline:

> Give your community room to grow.

Recommended text:

> Start with Bean Free. Upgrade only when your community needs more.

Actions:

- Add Bean to Discord
- Open Dashboard

### Footer

Include placeholders or real links for:

- Dashboard
- Add Bean
- Documentation
- Support server
- Status
- Privacy Policy
- Terms of Service
- Contact

Privacy Policy and Terms of Service must exist before a broad public launch.

## 6. Dashboard route contract

The dashboard is a client-side application, but each workspace now has a real browser URL.

| Dashboard workspace | Public route |
|---|---|
| Login | `/login` |
| Overview | `/dashboard` |
| Members | `/dashboard/members` |
| Community Growth | `/dashboard/growth` |
| Analytics | `/dashboard/analytics` |
| Moderation cases | `/dashboard/moderation` |
| Message builder | `/dashboard/messages` |
| Mailbox | `/dashboard/mailbox` |
| Creator Notifications | `/dashboard/creator-notifications` |
| Welcome message | `/dashboard/welcome` |
| Bean Protection | `/dashboard/protection` |
| Invite filter | `/dashboard/invite-filter` |
| Tickets | `/dashboard/tickets` |
| Reaction roles | `/dashboard/reaction-roles` |
| Temporary voice rooms | `/dashboard/voice-rooms` |
| Audit logs | `/dashboard/audit-logs` |
| Settings | `/dashboard/settings` |
| Bean profile settings | `/dashboard/settings/bot` |

Navigation updates browser history. Back and Forward restore the correct workspace. Directly refreshing one of these routes must continue to load the dashboard application.

Authentication behavior:

1. A signed-out visitor selects **Dashboard**.
2. The landing page sends them to `/login`.
3. Discord OAuth authenticates them.
4. They arrive at `/dashboard`.
5. A direct protected URL, such as `/dashboard/members`, is preserved through login and restored afterward.
6. A signed-in visitor opening `/login` is sent into the dashboard.

## 7. File and implementation contract for Claude

Create the landing page as:

- `dashboard/landing.html`
- `dashboard/landing.css`
- `dashboard/landing.js` only if JavaScript is genuinely needed

Do not replace:

- `dashboard/index.html`
- `dashboard/app.js`
- `dashboard/bean.css`

Those files belong to the authenticated dashboard.

The server automatically behaves as follows:

- `/` serves `dashboard/landing.html` once that file exists.
- `/login` serves the dashboard login application.
- `/dashboard` and its nested workspace routes serve the dashboard application.
- Existing assets remain rooted at `/assets/...`.

Keep the landing page static and framework-free unless there is a concrete reason to introduce a build system.

Recommended URL behavior:

- Header Dashboard button: `/login`
- Hero Open Dashboard button: `/login`
- Footer Dashboard link: `/login`
- Add Bean links: use the final Discord installation URL when available
- Page-section navigation: anchors such as `/#features`, `/#growth`, and `/#pricing`

## 8. Content accuracy: current versus planned

Currently built:

- Core moderation commands and cases
- Bean Protection and Discord AutoMod synchronization
- Raid mode, quarantine review, and emergency profiles
- Community Growth profiles, traits, achievements, leaderboards, recognition, exclusions, and seasons
- Twitch live behaviors
- Up to three YouTube notification sources in the current implementation
- Welcome-message builder
- Reaction roles
- Temporary voice rooms
- Tickets
- Scheduled Mailbox
- Member profiles
- Dashboard analytics, health, activity, and notification inbox
- Discord audit logging and configuration diagnostics

Requires implementation before it can be advertised as available:

- Subscription checkout and entitlement management
- Free versus Plus enforcement
- Increasing the current YouTube hard limit from three to five
- Up to five independently selected Twitch creators
- Multiple welcome templates
- Multiple ticket panels, transcripts, and ticket analytics
- Longer subscription-based data retention and exports
- Public multi-server onboarding and per-server configuration

Use "Coming soon" or omit unfinished functionality. Do not mix roadmap items into a list labelled "Available now."

## 9. Subscription behavior

Subscriptions should apply per Discord server.

The backend—not only the dashboard UI—must enforce limits.

Recommended entitlement fields:

- Plan (`free` or `plus`)
- Subscription status
- Discord guild ID
- Billing customer/subscription IDs
- Current period end
- Grace-period end
- Entitlement limits
- Early-supporter price eligibility

Downgrade behavior:

1. Begin a seven-day grace period.
2. Keep existing settings.
3. Pause anything over the Free limit.
4. Do not delete creator sources, schedules, templates, or history immediately.
5. Clearly show which items are paused.
6. Restore them automatically after resubscription.
7. Never pause core moderation or safety systems.

## 10. Public-launch dependencies

Before presenting Bean as generally available to any Discord server:

- Replace single-server assumptions with guild-scoped settings.
- Move operational data from local JSON files to PostgreSQL.
- Make authentication select and authorize a specific guild.
- Add subscription entitlements and backend limit enforcement.
- Add a privacy policy and terms of service.
- Add external uptime monitoring.
- Add database backups and a restore procedure.
- Add a support and incident-response path.
- Prepare Discord app verification and privileged-intent applications before the applicable server thresholds.

The landing page can be built before those items are complete, but the main CTA should be a waitlist or limited beta until public onboarding is ready.

## 11. Accessibility, performance, and SEO

Requirements:

- Semantic headings in a logical order
- Keyboard-accessible navigation
- Visible focus styles
- Proper button versus link semantics
- Useful alternative text
- Sufficient contrast
- Reduced-motion support
- Responsive layouts from mobile through desktop
- No horizontal overflow
- Optimize dashboard screenshots and imagery
- Avoid unnecessary JavaScript
- Metadata for title, description, social previews, and theme color

Suggested page title:

> Bean — Discord Community Growth, Protection, and Management

Suggested meta description:

> Bean is a Discord community bot for meaningful member growth, thoughtful moderation, creator notifications, and everyday server management from one polished dashboard.

## 12. Acceptance checklist

- `/` displays the public landing page.
- `/login` displays Discord login.
- The header Dashboard button links to `/login`.
- Authenticated users enter at `/dashboard`.
- Every dashboard workspace has a stable URL.
- Browser Back and Forward work between workspaces.
- Refreshing `/dashboard/members`, `/dashboard/growth`, `/dashboard/settings`, or another dashboard route works.
- Mobile navigation is keyboard and screen-reader accessible.
- Pricing clearly says "per Discord server."
- Free safety features are not presented as paid.
- Unfinished functionality is labelled accurately.
- No fake statistics or testimonials are included.
- Existing dashboard files and behavior remain intact.
