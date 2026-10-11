# Agent notes — Hydrogen SOTABOSC

Shopify Hydrogen storefront for sotabosc.world. Routing is **React Router v7**, not Remix: import `useLoaderData`, `Link`, `Form` from `react-router`, never `@remix-run/*` or `react-router-dom`.

## Persistent city (Supabase)

Project `ervbjxiwvjzeslrzonxx`. **This repo owns the migration history** — never `db push` from `D:\sotabosc\living-wall`.

How-to, table map, consent SQL, access checks: [`docs/supabase-city-directory.md`](docs/supabase-city-directory.md).

| Command | What |
|---|---|
| `npx supabase migration list` | Local vs remote |
| `npx supabase db push --dry-run` then `npx supabase db push` | Apply a new `supabase/migrations/*.sql` |
| `npm run directory:sync-supabase -- --dry-run` | Preview seed → live |
| `npm run directory:sync-supabase` | Upsert places, events, creators (never writes `wall_opt_in*` / `works`) |
| `npm run pipeline:auto-events` | Pull Event JSON-LD from `reports/event-urls-queue.txt` into the seed |
| `npx tsx --test app/lib/directory/source.server.test.ts` | Mapper / timezone tests |

City routes load through `getCityDirectory(context)` in `app/lib/directory/source.server.ts` (anon key, 5-minute cache, seed fallback). Screens (`D:\sotabosc\living-wall`) read the same tables; they only show *other* businesses when `wall_opt_in = true`. Wall rules: `living-wall/docs/compliance.md`.

## Do not

- Print or commit service-role keys; do not put them on a wall node or in the browser
- Grant anon access to `place_booking_calendars` or `directory_places_with_booking`
- Submit the Hydrogen claim form in automated tests (it creates real MailerLite contacts)
- Invent Remix imports

## Living Wall repo

Physical screens. Schema copies there are **reference only**. Program / consent / QR / labels: `docs/compliance.md`. Hermes skill: `hermes/skills/living-wall/SKILL.md`.
