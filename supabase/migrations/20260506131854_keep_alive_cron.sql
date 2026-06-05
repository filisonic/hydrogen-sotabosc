-- Enable pg_cron extension to schedule recurring jobs
create extension if not exists pg_cron;

-- Grant usage to postgres role (required for pg_cron)
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

-- Schedule a keep-alive job that runs every day at noon UTC
-- This prevents the Supabase free-tier project from being paused due to inactivity
select cron.schedule(
  'keep-alive',       -- unique job name
  '0 12 * * *',       -- daily at 12:00 UTC
  $$select 1$$        -- lightweight no-op query
);
