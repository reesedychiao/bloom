-- Phase 3: schedule the reminder dispatch every 15 minutes.
-- Apply via Supabase dashboard SQL editor AFTER:
--   1. the send-reminders function is deployed, and
--   2. the shared secret exists in Vault under the name 'bloom_cron_secret'
--      (a one-off statement run manually — the secret itself must never be
--      committed to this public repo):
--
--        select vault.create_secret('<the-secret>', 'bloom_cron_secret');

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- re-runnable: drop any previous schedule first
do $$
begin
  if exists (select 1 from cron.job where jobname = 'bloom-send-reminders') then
    perform cron.unschedule('bloom-send-reminders');
  end if;
end $$;

select cron.schedule(
  'bloom-send-reminders',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := 'https://jymzfkkwqyramphazutt.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret',
      (select decrypted_secret from vault.decrypted_secrets where name = 'bloom_cron_secret')
    ),
    body := '{}'::jsonb
  );
  $$
);
