-- Replace internal pg_cron no-op with a real HTTP API request via pg_net.
-- Supabase free tier pauses on lack of API requests, not lack of DB activity.
-- Calling the edge function counts as real API activity and prevents pausing.

create extension if not exists pg_net;

-- Remove old internal keep-alive job
do $$
begin
  perform cron.unschedule('keep-alive');
exception when others then
  null;
end;
$$;

-- Schedule a daily ping to the keep-alive edge function (no auth required)
select cron.schedule(
  'keep-alive',
  '0 12 * * *',
  $$
    select net.http_get(
      url := 'https://ervbjxiwvjzeslrzonxx.supabase.co/functions/v1/keep-alive'
    )
  $$
);
