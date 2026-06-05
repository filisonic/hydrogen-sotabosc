-- Booking: live calendar per listing + activation queue for OpenClaw

create table if not exists public.place_booking_calendars (
  place_slug text primary key,
  calendar_id text not null,
  ghl_location_id text,
  status text not null default 'active' check (status in ('active', 'disabled')),
  activated_at timestamptz not null default now()
);

create table if not exists public.booking_activation_requests (
  id uuid primary key default gen_random_uuid(),
  place_slug text not null,
  place_name text not null,
  contact_email text not null,
  contact_name text,
  status text not null default 'pending' check (status in ('pending', 'done', 'failed')),
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists booking_activation_requests_status_created
  on public.booking_activation_requests (status, created_at desc);

alter table public.place_booking_calendars enable row level security;
alter table public.booking_activation_requests enable row level security;

create policy "Public read active calendars"
  on public.place_booking_calendars for select
  using (status = 'active');

create policy "Public insert activation requests"
  on public.booking_activation_requests for insert
  with check (status = 'pending');

-- Seed demo calendar (matches booking.js Roast Club)
insert into public.place_booking_calendars (place_slug, calendar_id, status)
values ('roast-club-cafe', 'GksbzZMRs3u8x2r8wpCM', 'active')
on conflict (place_slug) do update set
  calendar_id = excluded.calendar_id,
  status = excluded.status;
