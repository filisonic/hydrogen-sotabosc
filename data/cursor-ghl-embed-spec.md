# GHL booking embed — Cursor / Sotabosc

## Demo listing (live widget)

- **URL:** https://directory.sotabosc.world/places/roast-club-cafe
- **Slug:** `roast-club-cafe`
- **Calendar ID:** `GksbzZMRs3u8x2r8wpCM`

## All other listings

- **`BookingPreviewTeaser`** — mock calendar UI + CTAs (claim, membership, link to demo)
- No shared `PUBLIC_GHL_BOOKING_CALENDAR_ID` (removed to avoid wrong-calendar confusion)

## Implementation

| File | Role |
|------|------|
| `app/components/directory/BookingWidget.jsx` | Real GHL iframe (activated calendars only) |
| `app/components/directory/BookingPreviewTeaser.jsx` | Preview block on all other place pages |
| `app/lib/directory/booking.js` | `CALENDAR_ID_BY_SLUG` — add slug when business onboards |
| `app/routes/city.places.$slug.jsx` | Widget if slug has calendar, else preview |
| `app/entry.server.jsx` | CSP `frameSrc` for `api.leadconnectorhq.com` |

## Onboard a business (Option C)

Add to `CALENDAR_ID_BY_SLUG` in `booking.js` (later: Supabase + OAuth):

```js
'their-slug': 'GHL_CALENDAR_ID',
```

That listing switches from preview to live `BookingWidget` automatically.

## Supabase catalog (OpenClaw)

All listing **names + slugs** sync to Supabase for GHL onboarding agents:

| Table / view | Purpose |
|--------------|---------|
| `directory_places` | Every venue: `slug`, `name`, `address`, `website`, `directory_url`, `source` |
| `directory_places_with_booking` | Same + optional `calendar_id` / `has_active_booking` |
| `place_booking_calendars` | Live GHL calendars (slug → `calendar_id`) |
| `booking_activation_requests` | Pending activation queue |

```bash
# After migration is applied on your Supabase project:
npm run directory:sync-supabase
```

Requires `.env`: `PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (service role — server/OpenClaw only).

## OAuth (booking activation — later)

GHL **rejects redirect URLs** that contain brand terms such as `ghl`, `highlevel`, `gohighlevel`, or `leadconnector` in the path or host. Use neutral paths only.

### Redirect URLs to register in Marketplace → Auth

| Environment | Redirect URL |
|-------------|--------------|
| **Production** | `https://sotabosc.world/api/booking/oauth/callback` |
| **Local dev** | `http://localhost:3030/api/booking/oauth/callback` |

Do **not** use paths like `/api/ghl/oauth/callback` — GHL will refuse to save them.

Hydrogen route (when built): `app/routes/api.booking.oauth.callback.jsx`

### Environment variables (`.env` + Oxygen)

| Variable | Purpose |
|----------|---------|
| `GHL_CLIENT_ID` | OAuth app client ID |
| `GHL_CLIENT_SECRET` | OAuth app secret (server only — never commit) |
| `BOOKING_OAUTH_REDIRECT_URI` | Must match Marketplace exactly, e.g. `https://sotabosc.world/api/booking/oauth/callback` |
| `GHL_AGENCY_LOCATION_ID` | Optional default agency location |

`BOOKING_OAUTH_REDIRECT_URI` must be **identical** to the URL saved in GHL (including `http` vs `https`, no trailing slash).

## Product tiers

1. **Directory (default)** — preview teaser on every place page
2. **Activated** — per-slug calendar in `CALENDAR_ID_BY_SLUG` → live widget
3. **Pro (€250/mo)** — Merchant Stripe in GHL (outside Hydrogen)
