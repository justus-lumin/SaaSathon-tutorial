-- Run once after deploying the app. Replace these TWO placeholders first.
-- The secret must equal Vercel's WORKER_SECRET. Do not commit filled-in values.
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
select vault.create_secret('https://YOUR-APP.vercel.app', 'meeting_recorder_url');
select vault.create_secret('YOUR-WORKER-SECRET', 'meeting_recorder_worker_secret');
select cron.schedule('meeting-recorder-worker', '* * * * *', $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name='meeting_recorder_url' limit 1) || '/api/internal/process',
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name='meeting_recorder_worker_secret' limit 1)),
    body := '{}'::jsonb,
    timeout_milliseconds := 290000
  );
$$);
