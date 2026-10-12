# Supabase: the persistent city directory

The city (places, events, creators) lives in Supabase project `ervbjxiwvjzeslrzonxx` so that
the Hydrogen site, Living Wall screens, OpenClaw/GHL workflows and other agents read one shared copy.
The repo seed (`app/lib/directory/seed.server.ts` + `auto-import.*.json`) is still the source the
sync writes from.

**This repo owns the migration history.** Always run `supabase db push` from here.
`sotabosc/living-wall/supabase/migrations` holds reference copies only; pushing from there would
clash with this history.

Short agent/dev entry: [`AGENTS.md`](../AGENTS.md). Wall behaviour: `sotabosc/living-wall/docs/compliance.md`.

## Tables

| Table | Key | Rows (2026-09-30) | Public (anon) access |
|---|---|---|---|
| `directory_places` | `slug` | 479 | read |
| `directory_events` | `id` (`slug` unique, `place_slug` → `directory_places.slug`) | 24 | read |
| `directory_creators` | `id` (`slug` unique) | 14 | read |
| `place_booking_calendars` | `place_slug` | 1 | **none** — GoHighLevel ids, `service_role` only |
| `directory_places_with_booking` (view, `security_invoker`) | — | — | **none** — `service_role` only |
| `booking_activation_requests`, memberships | — | — | per their own migrations |

Writes go through `service_role` (OpenClaw, sync with key) or the linked CLI. Never put the
service-role key on a screen or in the browser; Living Wall nodes use the anon key.

### Consent columns

| Column | Meaning |
|---|---|
| `wall_opt_in` (places, events, creators; default `false`) | May appear on *other* venues' Living Wall screens |
| `wall_opt_in_at` (places, creators, events) | When the signed agreement was filed |
| `directory_creators.works[].rightsGranted` / `licence` | Artwork may be shown on screens |

The sync never writes these columns, so re-syncing cannot grant or revoke consent. A venue always
appears on its own wall; `wall_opt_in` only controls appearing elsewhere.

## Migrations (all applied)

| File | What |
|---|---|
| `20260602190000_place_booking_calendars.sql`, `20260602210000_booking_service_role_policies.sql` | Booking calendars for OpenClaw/GHL |
| `20260603120000_directory_places.sql` | Places + booking view |
| `20260930000000_wall_consent_and_rls.sql` | Locks booking data to `service_role`; adds place consent columns |
| `20260930010000_directory_events_creators.sql` | Events and creators tables, public read, consent columns |

## How to

### Check the state

```bash
npx supabase migration list          # local vs remote; both columns should match
npx supabase inspect db table-stats --linked
```

### Change the schema

```bash
# new file: supabase/migrations/<yyyymmddhhmmss>_<name>.sql
npx supabase db push --dry-run      # lists what would run, runs nothing
npx supabase db push
```

Guard statements that touch tables which may not exist everywhere (`to_regclass(...)` in a
`do $$ ... $$` block), and never grant anon access to anything holding CRM/booking ids or
personal data.

### Sync the seed

```bash
npm run directory:sync-supabase -- --dry-run   # counts + samples, no writes
npm run directory:sync-supabase -- --sql-only  # writes reports/directory-{places,events,creators}-supabase-seed.sql
npm run directory:sync-supabase                # upserts all three (service key if set, else linked CLI)
```

Run a single table by hand: `npx supabase db query --linked -f reports/directory-events-supabase-seed.sql`.

Confirm the site can read what you synced: `npm run directory:check-live` (anon key, no writes).
Mapper tests (no network): `npm run test:directory`.

City pages call `getCityDirectory(context)` from `app/lib/directory/source.server.ts`. That needs
`PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` in `.env` (and Oxygen env for production).
If they are missing or Supabase errors, pages fall back to the seed so the city never 500s.

Event times in the seed are Barcelona wall-clock (`2026-10-03T20:30`); the sync adds the
Europe/Madrid offset before storing them as `timestamptz`. Screens and `/city/events` only show
events whose end (or start) is still ahead, so keep the seed's events current or the events beat
and listings go empty. Edit `app/lib/directory/seed.server.ts`, then
`npm run directory:sync-supabase` and `npm run directory:check-live`.

People step into a gathering from the map or `/city/events/:slug` (`Enter gathering`) — a
crowd in the virtual city, optional silhouette, emoji reactions, no chat. Tickets stay on
the venue website. Do not treat email RSVP as the join path; booking (ex-GHL) is a later phase.

The homepage map pins every upcoming event (on the founding building when we have a plot; otherwise
in that kingdom). Import from venue sites with `npm run pipeline:auto-events` and
`reports/event-urls-queue.txt`.

### Record consent (after the agreement is filed)

```sql
update public.directory_places
   set wall_opt_in = true, wall_opt_in_at = now()
 where slug = 'orval-cafe';

update public.directory_creators
   set wall_opt_in = true, wall_opt_in_at = now(),
       works = '[{"id":"w1","title":"Mediterranean Flora I","imageUrl":"https://…","rightsGranted":true,"licence":"screen-display, non-exclusive, 12 months"}]'::jsonb
 where slug = 'laia-carbonell';
```

Withdraw with `set wall_opt_in = false`; screens drop them at their next directory sync.

### Verify public access

With the anon key, `directory_*` tables return rows; `place_booking_calendars` and
`directory_places_with_booking` return 401. If either booking object ever returns rows to anon,
treat it as an incident.

## Who reads what

| Reader | Key | Reads |
|---|---|---|
| Living Wall node (`DIRECTORY_PROVIDER=supabase`) | anon | `directory_places`, `directory_events`, `directory_creators` |
| OpenClaw / GHL workflows | service_role | everything, incl. booking view |
| Hydrogen site | anon (`PUBLIC_SUPABASE_*`) | `directory_places`, `directory_events`, `directory_creators` via `getCityDirectory()`; seed fallback if unset or down |

## Gotchas

- Supabase CLI here is the repo dev dependency (`npx supabase`, 2.98.x); there is no global install.
- `supabase db push` asks for confirmation; in scripts pipe `y` only after a `--dry-run`.
- Living Wall compliance rules (who may appear, labels, retention) are documented in
  `sotabosc/living-wall/docs/compliance.md`.
