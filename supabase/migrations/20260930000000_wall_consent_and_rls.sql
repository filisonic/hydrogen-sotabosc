-- Compliance for Living Wall screens: consent columns, and close anon access to booking/CRM ids.
-- Pushed from this repo (it owns the migration history for ervbjxiwvjzeslrzonxx).
-- A copy lives in sotabosc/living-wall/supabase/migrations for reference.
-- OpenClaw uses service_role, which keeps its own policies/grants and is unaffected.

-- 1. Booking calendars hold GoHighLevel location/calendar ids. Nothing public reads them.
alter table public.place_booking_calendars enable row level security;
drop policy if exists "Public read active calendars" on public.place_booking_calendars;
revoke all on public.place_booking_calendars from anon, authenticated;

-- The view joined those ids for everyone and, as a definer view, bypassed RLS.
alter view public.directory_places_with_booking set (security_invoker = true);
revoke all on public.directory_places_with_booking from anon, authenticated;

-- 2. Explicit consent to appear on other venues' walls. Default: no.
alter table public.directory_places
  add column if not exists wall_opt_in boolean not null default false,
  add column if not exists wall_opt_in_at timestamptz;

-- Events and creators tables may not exist yet in every environment.
do $$
begin
  if to_regclass('public.directory_events') is not null then
    alter table public.directory_events
      add column if not exists wall_opt_in boolean not null default false;
  end if;

  if to_regclass('public.directory_creators') is not null then
    alter table public.directory_creators
      add column if not exists wall_opt_in boolean not null default false,
      add column if not exists wall_opt_in_at timestamptz;
    comment on column public.directory_creators.works is
      'Array of {id,title,imageUrl,medium?,rightsGranted?,licence?}. Walls show only works with rightsGranted = true.';
  end if;
end
$$;
