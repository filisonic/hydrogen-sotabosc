-- Full listing fields so the site can render city pages from Supabase instead of the repo seed.
-- Synced by npm run directory:sync-supabase; the view directory_places_with_booking lists its
-- columns explicitly and is unaffected.

alter table public.directory_places
  add column if not exists legacy_id text,
  add column if not exists summary text not null default '',
  add column if not exists secondary_domains text[],
  add column if not exists tags text[] not null default '{}',
  add column if not exists image_url text,
  add column if not exists is_claimed boolean not null default false,
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists opening_hours jsonb;

create unique index if not exists directory_places_legacy_id_idx
  on public.directory_places (legacy_id)
  where legacy_id is not null;

comment on column public.directory_places.legacy_id is
  'Seed id (p01, gp-…); events reference it through directory_events.place_id.';
