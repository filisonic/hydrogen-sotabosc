-- OpenClaw / service_role: full access to booking tables (RLS + grants)

grant usage on schema public to service_role;
grant all on public.place_booking_calendars to service_role;
grant all on public.booking_activation_requests to service_role;

drop policy if exists "service_role_full_access" on public.place_booking_calendars;
create policy "service_role_full_access"
  on public.place_booking_calendars
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "service_role_full_access" on public.booking_activation_requests;
create policy "service_role_full_access"
  on public.booking_activation_requests
  for all
  to service_role
  using (true)
  with check (true);
