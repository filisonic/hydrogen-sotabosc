-- Paid membership activation (Shopify webhook + deferred signup)

create table if not exists public.pending_memberships (
  email text primary key,
  shopify_order_id text,
  activated_at timestamptz not null default now()
);

alter table public.pending_memberships enable row level security;

grant usage on schema public to service_role;
grant all on public.pending_memberships to service_role;
grant all on public.profiles to service_role;

drop policy if exists "service_role_pending_memberships" on public.pending_memberships;
create policy "service_role_pending_memberships"
  on public.pending_memberships
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "service_role_profiles" on public.profiles;
create policy "service_role_profiles"
  on public.profiles
  for all
  to service_role
  using (true)
  with check (true);

create or replace function public.upgrade_membership_by_email(
  p_email text,
  p_order_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid;
  normalized_email text := lower(trim(p_email));
begin
  if normalized_email is null or normalized_email = '' then
    raise exception 'email required';
  end if;

  insert into public.pending_memberships (email, shopify_order_id, activated_at)
  values (normalized_email, p_order_id, now())
  on conflict (email) do update
    set shopify_order_id = excluded.shopify_order_id,
        activated_at = now();

  select u.id
    into uid
  from auth.users u
  where lower(u.email) = normalized_email
  limit 1;

  if uid is not null then
    update public.profiles
      set tier = 'paid'::membership_tier,
          updated_at = now()
    where id = uid;
  end if;
end;
$$;

revoke all on function public.upgrade_membership_by_email(text, text) from public;
grant execute on function public.upgrade_membership_by_email(text, text) to service_role;

-- Apply pending paid tier when a user account is created after checkout
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text := lower(trim(new.email));
  pending_order text;
begin
  select pm.shopify_order_id
    into pending_order
  from public.pending_memberships pm
  where pm.email = normalized_email
  limit 1;

  insert into public.profiles (id, email, domain, tier)
  values (
    new.id,
    new.email,
    coalesce((new.raw_user_meta_data->>'domain')::organism_domain, 'fungi'::organism_domain),
    case when pending_order is not null then 'paid'::membership_tier else 'free'::membership_tier end
  );

  return new;
end;
$$;
