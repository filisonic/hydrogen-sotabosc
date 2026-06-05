-- Full directory catalog for OpenClaw → GHL booking onboarding.
-- Sync from repo: npm run directory:sync-supabase

create table if not exists public.directory_places (
  slug text primary key,
  name text not null,
  city text not null default 'Barcelona',
  neighborhood text,
  address text,
  website text,
  telephone text,
  categories text[] not null default '{}',
  primary_domain text,
  source text not null check (source in ('curated', 'auto-import')),
  directory_url text not null,
  synced_at timestamptz not null default now()
);

create index if not exists directory_places_name_idx on public.directory_places (name);
create index if not exists directory_places_source_idx on public.directory_places (source);

comment on table public.directory_places is
  'Sotabosc directory listings; synced from seed + auto-import for OpenClaw/GHL workflows.';

alter table public.directory_places enable row level security;

create policy "Public read directory places"
  on public.directory_places for select
  using (true);

grant select on public.directory_places to anon, authenticated;
grant all on public.directory_places to service_role;

drop policy if exists "service_role_directory_places" on public.directory_places;
create policy "service_role_directory_places"
  on public.directory_places
  for all
  to service_role
  using (true)
  with check (true);

-- Convenience view: every listing + optional live GHL calendar
create or replace view public.directory_places_with_booking as
select
  d.slug,
  d.name,
  d.city,
  d.neighborhood,
  d.address,
  d.website,
  d.telephone,
  d.categories,
  d.primary_domain,
  d.source,
  d.directory_url,
  d.synced_at,
  c.calendar_id,
  c.ghl_location_id,
  c.status as booking_calendar_status,
  (c.place_slug is not null and c.status = 'active') as has_active_booking
from public.directory_places d
left join public.place_booking_calendars c on c.place_slug = d.slug;

grant select on public.directory_places_with_booking to anon, authenticated, service_role;
