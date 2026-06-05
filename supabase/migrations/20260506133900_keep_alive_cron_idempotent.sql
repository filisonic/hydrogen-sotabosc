-- Idempotent keep-alive cron job
-- Safe to run multiple times: removes existing job if present, then recreates

do $$
begin
  perform cron.unschedule('keep-alive');
exception when others then
  null;
end;
$$;

select cron.schedule(
  'keep-alive',
  '0 12 * * *',
  $$select 1$$
);
