# GHL booking embed — Cursor / Sotabosc

## Demo listing

- **URL:** https://directory.sotabosc.world/places/roast-club-cafe
- **Slug:** `roast-club-cafe`
- **Route file:** `app/routes/city.places.$slug.jsx`

## Stack

| Layer | Technology |
|-------|------------|
| Storefront | Shopify Hydrogen `^2025.10` |
| UI | React 18.3 (`.jsx` routes) |
| Routing | React Router 7 (file-based) |
| CSS | Tailwind CSS v4 + design tokens |
| Hosting | Shopify Oxygen (`server.js` subdomain rewrites) |

## Widget (Roast Club demo)

- **Calendar ID:** `GksbzZMRs3u8x2r8wpCM`
- **Embed URL:** `https://api.leadconnectorhq.com/widget/booking/GksbzZMRs3u8x2r8wpCM`

## Implementation

| File | Role |
|------|------|
| `app/components/directory/BookingWidget.jsx` | Reusable iframe embed |
| `app/lib/directory/booking.js` | Slug → calendar ID + URL builder |
| `app/routes/city.places.$slug.jsx` | Renders widget when URL resolves |
| `app/entry.server.jsx` | CSP `frameSrc` for `api.leadconnectorhq.com` |

### Roll out to all listings

Set Oxygen env:

```bash
PUBLIC_GHL_BOOKING_CALENDAR_ID=<shared-calendar-id>
```

Per-venue calendars: add entries to `CALENDAR_ID_BY_SLUG` in `app/lib/directory/booking.js` (or extend loader to read from Supabase later).

## OAuth (Pro tier — later)

Used when Alex auto-provisions a business calendar via GHL OAuth (not required for iframe embed).

| Variable | Purpose |
|----------|---------|
| `GHL_CLIENT_ID` | OAuth app client ID |
| `GHL_CLIENT_SECRET` | OAuth app secret (server only) |
| `GHL_REDIRECT_URI` | Registered redirect URL |
| `GHL_LOCATION_ID` | Default GHL location (agency) |

Redirect and token exchange should run server-side (new API route), never expose `GHL_CLIENT_SECRET` to the client.

## Product tiers

1. **Free** — `BookingWidget` on listing; GHL sends lead notifications.
2. **Upgrade** — OAuth calendar per business; update `CALENDAR_ID_BY_SLUG` or DB mapping.
3. **Pro (€250/mo)** — Merchant connects own Stripe in GHL (outside Hydrogen).
