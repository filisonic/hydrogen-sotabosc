-- Events and creators for the persistent city (Living Wall screens, OpenClaw, future site reads).
-- Synced from the repo seed: npm run directory:sync-supabase
-- Consent columns (wall_opt_in*, works[].rightsGranted) are set by people, never by the sync.

create table if not exists public.directory_events (
  id text primary key,
  slug text unique not null,
  title text not null,
  summary text not null default '',
  starts_at timestamptz not null,
  ends_at timestamptz,
  place_id text,
  place_slug text references public.directory_places (slug) on delete set null,
  place_name text,
  primary_domain text,
  secondary_domains text[],
  tags text[] not null default '{}',
  image_url text,
  booking_url text,
  directory_url text,
  source text not null default 'curated' check (source in ('curated', 'auto-import', 'submitted')),
  wall_opt_in boolean not null default false,
  wall_opt_in_at timestamptz,
  synced_at timestamptz not null default now()
);

create index if not exists directory_events_starts_at_idx on public.directory_events (starts_at);
create index if not exists directory_events_place_slug_idx on public.directory_events (place_slug);

comment on table public.directory_events is
  'Sotabosc city events; synced from seed. Walls show an event only when wall_opt_in = true.';

create table if not exists public.directory_creators (
  id text primary key,
  slug text unique not null,
  display_name text not null,
  bio text not null default '',
  city text not null default 'Barcelona',
  primary_domain text,
  secondary_domains text[],
  product_collection_handle text,
  website_url text,
  image_url text,
  directory_url text,
  works jsonb not null default '[]'::jsonb,
  source text not null default 'curated' check (source in ('curated', 'submitted')),
  wall_opt_in boolean not null default false,
  wall_opt_in_at timestamptz,
  synced_at timestamptz not null default now()
);

comment on table public.directory_creators is
  'Sotabosc artists and makers; synced from seed. Walls show a creator only when wall_opt_in = true.';
comment on column public.directory_creators.works is
  'Array of {id,title,imageUrl,medium?,rightsGranted?,licence?}. Walls show only works with rightsGranted = true.';

-- Public read, like directory_places; writes only through service_role or the CLI.
alter table public.directory_events enable row level security;
alter table public.directory_creators enable row level security;

drop policy if exists "Public read directory events" on public.directory_events;
create policy "Public read directory events"
  on public.directory_events for select
  using (true);

drop policy if exists "Public read directory creators" on public.directory_creators;
create policy "Public read directory creators"
  on public.directory_creators for select
  using (true);

drop policy if exists "service_role_directory_events" on public.directory_events;
create policy "service_role_directory_events"
  on public.directory_events for all to service_role
  using (true) with check (true);

drop policy if exists "service_role_directory_creators" on public.directory_creators;
create policy "service_role_directory_creators"
  on public.directory_creators for all to service_role
  using (true) with check (true);

grant select on public.directory_events, public.directory_creators to anon, authenticated;
grant all on public.directory_events, public.directory_creators to service_role;
