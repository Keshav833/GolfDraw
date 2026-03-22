-- Note: pg_cron requires the extension to be enabled by a superuser.
-- In Supabase managed infrastructure, you typically enable pg_cron in the dashboard Extensions section.

CREATE EXTENSION IF NOT EXISTS pg_cron SCHEMA extensions;

-- Schedule example: Re-calculate or trigger draw API dynamically on the 1st of every month at midnight
-- We wrap this in a DO block to prevent errors if pg_cron is not properly installed locally

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'trigger-monthly-draw',
      '0 0 1 * *',
      'SELECT 1;' -- this is a placeholder. Webhook to an edge function typically goes here.
    );
  END IF;
END $$;
