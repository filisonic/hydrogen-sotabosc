# Venue directory images (Firecrawl + Google Places)

How we populate **real** hero images for city listings, in what order, and what to do **before pushing** when the seed or venues change.

---

## Pre-push checklist

When you **add or change places** in `app/lib/directory/seed.server.ts` (or change how images are resolved), run through this before you push so production and teammates get the same assets as your machine.

1. **Environment** — Project root `.env` includes (as needed):
   - `FIRECRAWL_API_KEY` (or `FIRECRAWL_KEY`) for website OG images  
   - `GOOGLE_MAPS_API_KEY` or `GOOGLE_PLACES_API_KEY` for Google Places photos (optional second pass)

2. **Firecrawl first** (scrapes each venue `website` for Open Graph / Twitter preview image):
   ```bash
   npm run fetch:venue-images
   ```
   - Skips slugs that already have a file under `public/images/venues/{slug}.*` (unless you use `--force`).
   - Writes `app/lib/directory/venueImages.generated.ts` and image files under `public/images/venues/`.

3. **Google second (gaps only)** — only for slugs **without** a file in `public/images/venues/{slug}.*`:
   ```bash
   npm run fetch:venue-google-photos:missing
   ```
   (Same as `npm run fetch:venue-google-photos -- --fill-missing`.)

4. **Review failures** (especially with many listings):
   - `reports/venue-images-last-run.json` — Firecrawl: `needsFollowUpSlugs`, per-`rows[].status` (`no_og_image`, `firecrawl_error`, `download_failed`).
   - `reports/venue-google-photos-last-run.json` — Google: `needsFollowUpSlugs`, `no_photo`, `places_error`, `download_failed`.
   - These files are **gitignored** by default; open them locally after each run.

5. **Commit** the artifacts that the app actually serves:
   - `app/lib/directory/venueImages.generated.ts`
   - `app/lib/directory/venueGoogleImages.generated.ts` and `venueGoogleAttributions.generated.ts` (if you ran Google)
   - New/changed files under `public/images/venues/` (including `public/images/venues/google/` when used)

6. **Build sanity** (optional but recommended):
   ```bash
   npm run build
   ```

**If you skip the fetch steps:** listings still work; heroes fall back to **Unsplash** (and seed `imageUrl` when set) until someone runs the pipeline and commits the outputs.

---

## Why this order?

Runtime resolution in `seed.server.ts` is:

1. **Firecrawl / local** — `venueImages.generated.ts` → `/images/venues/{slug}…`
2. **Google** — `venueGoogleImages.generated.ts` → `/images/venues/google/{slug}…`
3. **Seed `imageUrl`**, then **Unsplash** via `sceneVisuals.ts`

So: **Firecrawl first**, then **Google only where Firecrawl did not produce a file** (`--fill-missing`), saves API cost and matches product intent (official site photo preferred over Maps).

---

## Commands reference

| Command | What it does |
|--------|----------------|
| `npm run fetch:venue-images` | Firecrawl scrape → `public/images/venues/`, regenerate `venueImages.generated.ts` |
| `npm run fetch:venue-google-photos` | Google Places photo for **every** seed place (respects existing files in `venues/google/` unless `--force`) |
| `npm run fetch:venue-google-photos:missing` | Google **only** if no `public/images/venues/{slug}.*` yet |

**Useful flags** (append after `--`):

- `--dry` — log only; no writes (Firecrawl dry without key lists targets; with key resolves OG URLs on Firecrawl / Places as implemented).
- `--force` — re-download for processed slugs (deletes existing file for that slug first, where the script supports it).
- `--slug=my-place-slug` — single venue.
- `--no-report` — skip writing `reports/*.json`.

---

## Prerequisites

### Firecrawl

- API key from [firecrawl.dev](https://firecrawl.dev) in `.env`.
- Each place needs a **`website`** field in the seed for a Firecrawl attempt; places without `website` are listed under `skippedNoWebsite` in the Firecrawl report.

### Google Places API (New)

- Google Cloud: billing, **Places API (New)** enabled, API key in `.env` as `GOOGLE_MAPS_API_KEY` or `GOOGLE_PLACES_API_KEY`.
- **Do not** expose this key in `PUBLIC_*` env vars or client bundles.
- **IP-restricted** keys work for **local / fixed-server** runs; **GitHub Actions** egress IPs are not your home IP, so CI cannot use the same IP-restricted key without a separate CI key or workflow changes.

### Content Security Policy

- Hotlinked Unsplash requires `img-src` allowance in `app/entry.server.jsx` for `https://images.unsplash.com`.
- Downloaded venue files are served from your origin (`/images/venues/...`) and stay within `'self'`.

---

## Google photo attributions

If `venueGoogleAttributions.generated.ts` has entries for a slug, **Google’s policy** requires showing **author attributions** wherever that image is displayed. Wire those on the place detail UI when you rely on Google-sourced heroes.

---

## Scripts (source of truth)

- `scripts/fetch-venue-images.ts`
- `scripts/fetch-venue-google-photos.ts`

---

## Related files

- `app/lib/directory/seed.server.ts` — place definitions; `attachVenueImages` merges generated maps.
- `app/lib/directory/venueImages.generated.ts` — Firecrawl output map (generated).
- `app/lib/directory/venueGoogleImages.generated.ts` — Google output map (generated).
- `app/lib/directory/venueGoogleAttributions.generated.ts` — Google attributions (generated).
- `reports/` — last-run JSON audits (default: not committed; see `.gitignore`).
