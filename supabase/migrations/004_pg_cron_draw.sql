CREATE EXTENSION IF NOT EXISTS pg_cron SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.trigger_monthly_draw()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  base_url text := current_setting('app.settings.golfdraw_base_url', true);
  cron_secret text := current_setting('app.settings.draw_cron_secret', true);
BEGIN
  IF base_url IS NULL OR base_url = '' THEN
    RAISE NOTICE 'Skipping monthly draw cron: app.settings.golfdraw_base_url is not set';
    RETURN;
  END IF;

  IF cron_secret IS NULL OR cron_secret = '' THEN
    RAISE NOTICE 'Skipping monthly draw cron: app.settings.draw_cron_secret is not set';
    RETURN;
  END IF;

  PERFORM net.http_post(
    url := format('%s/api/draws/scheduled', trim(trailing '/' from base_url)),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', format('Bearer %s', cron_secret)
    ),
    body := jsonb_build_object('mode', 'random')
  );
END;
$$;

DO $$
DECLARE
  existing_job_id bigint;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    SELECT jobid
      INTO existing_job_id
      FROM cron.job
     WHERE jobname = 'golfdraw-monthly-draw'
     LIMIT 1;

    IF existing_job_id IS NOT NULL THEN
      PERFORM cron.unschedule(existing_job_id);
    END IF;

    PERFORM cron.schedule(
      'golfdraw-monthly-draw',
      '5 0 1 * *',
      $$SELECT public.trigger_monthly_draw();$$
    );
  END IF;
END $$;
