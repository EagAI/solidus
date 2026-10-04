# YouTube RSS announcements — quick guide (LitasCore / euras)

How this bot posts new YouTube uploads using the **public RSS feed** (no YouTube API key).

---

## What it does

Every **2 minutes** (configurable) the bot:

1. Fetches `https://www.youtube.com/feeds/videos.xml?channel_id=UC…`
2. Reads the **newest** video entry
3. If that `videoId` was **never announced before** → posts to your announce channel with:
   - `@everyone` message
   - Red embed (title, thumbnail, link)
   - Link buttons: YouTube, TikTok, Kick, Twitch (if URLs set in `.env`)

**No live HTML probing, no oEmbed, no YouTube Data API** — RSS only.

---

## Setup (`.env`)

```env
# YouTube channel ID (must start with UC…)
YOUTUBE_CHANNEL_ID=UCxxxxxxxxxxxxxxxxxxxxxx

# Discord channel where announcements go
YOUTUBE_ANNOUNCE_CHANNEL_ID=1234567890123456789

# How often to poll RSS (ms). Default: 120000 = 2 minutes
YOUTUBE_RSS_POLL_INTERVAL_MS=120000

# Optional — watch buttons on the post
TIKTOK_URL=
TWITCH_URL=
KICK_URL=
# or TWITCH_CHANNEL_LOGIN / KICK_CHANNEL_SLUG
```

### Find your `YOUTUBE_CHANNEL_ID`

1. Open the YouTube channel → **About**
2. **Share channel** → copy ID, or use a site that resolves `@handle` → `UC…`
3. Must be the **channel ID** (`UC…`), not the `@username`

Test RSS in browser:

```
https://www.youtube.com/feeds/videos.xml?channel_id=YOUR_UC_ID
```

You should see Atom XML with `<entry>` items.

---

## When a post is sent

| Condition | Result |
|-----------|--------|
| New `videoId` not in DB | ✅ Announce with `@everyone` |
| Same `videoId` already in `youtube_announced_videos` | ⏭ Skip (no duplicate) |
| RSS fetch fails / 404 | ❌ Log warning, no post |
| `YOUTUBE_CHANNEL_ID` missing | Poller disabled |

Dedup is **by video ID only** (not title).

---

## Announce message format

**Text:** `Opa @everyone, LITAS ką tik nauvo kontento pakūrė❗ Pažiūrim😱`

**Embed:** title, link, thumbnail (`i.ytimg.com/vi/{id}/hqdefault.jpg`)

**Buttons:** YouTube + optional TikTok / Kick / Twitch

Staff debug copy also goes to `LOG_CHANNEL_ID` when a real announce is posted.

---

## Admin commands

| Command | What it does |
|---------|----------------|
| `/admin live check` | Poll RSS now; post **only if** newest video not announced yet (with `@everyone`) |
| `/admin test live` | Force-post **latest RSS video** as a test (**no** `@everyone`, different text) — does **not** mark as announced |

Use **test live** to preview layout. Use **live check** to manually trigger the real dedup logic.

Results are logged to `LOG_CHANNEL_ID` (ephemeral reply to staff).

---

## Deploy / restart

```bash
git pull
# bot restart — no npm run deploy unless slash commands changed
```

Poller starts on `clientReady` → first check after **10 seconds**, then every `YOUTUBE_RSS_POLL_INTERVAL_MS`.

---

## Bot permissions

Announce channel:

- Send Messages
- Embed Links
- Mention @everyone (if you use `@everyone` in content)

---

## Database

| Table | Purpose |
|-------|---------|
| `youtube_announced_videos` | `(yt_channel_id, video_id)` — dedup |
| `youtube_state` | Last seen video ID (legacy/aux) |

If you need to re-announce a video (e.g. testing), remove its row from `youtube_announced_videos` or use `/admin test live`.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| RSS 404 in logs | Wrong `YOUTUBE_CHANNEL_ID` |
| Never posts | Channel ID empty; announce channel wrong; bot can't send there |
| Posts same video twice | Shouldn't happen if DB works — check `youtube_announced_videos` |
| Delay up to ~2 min | Normal — that's the poll interval |
| Old video posted on first run | Only if that video ID isn't in DB yet (first deploy announces current newest once) |

---

## Code reference

| File | Role |
|------|------|
| `src/services/liveStreams.js` | RSS fetch, poll, announce, admin check |
| `src/config.js` | `youtubeChannelId`, `youtubeRssPollIntervalMs`, announce channel |
| `src/events/ready.js` | `startLiveStreamPoller(client)` |

RSS URL built as:

```
https://www.youtube.com/feeds/videos.xml?channel_id={YOUTUBE_CHANNEL_ID}
```

For a longer technical guide (other bots, Atom parsing, trade-offs), see `youtuberss.md` in repo root.
