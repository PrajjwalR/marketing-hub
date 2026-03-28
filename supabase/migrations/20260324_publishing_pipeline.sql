ALTER TABLE public.calendar_events
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

ALTER TABLE public.calendar_events
ADD COLUMN IF NOT EXISTS platforms JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Normalize existing legacy statuses before adding strict constraint.
UPDATE public.calendar_events
SET status = CASE
  WHEN status IS NULL OR status = '' THEN 'draft'
  WHEN lower(status) IN ('scheduled', 'draft', 'published', 'completed', 'cancelled', 'failed') THEN lower(status)
  WHEN lower(status) IN ('done', 'posted', 'sent') THEN 'published'
  WHEN lower(status) IN ('queue', 'queued', 'pending', 'ready') THEN 'scheduled'
  WHEN lower(status) IN ('error', 'errored') THEN 'failed'
  ELSE 'draft'
END;

ALTER TABLE public.calendar_events
DROP CONSTRAINT IF EXISTS calendar_events_status_check;

ALTER TABLE public.calendar_events
ADD CONSTRAINT calendar_events_status_check
CHECK (status IN ('draft', 'scheduled', 'published', 'completed', 'cancelled', 'failed'));

UPDATE public.calendar_events
SET platforms = CASE
  WHEN platform IS NOT NULL AND platform <> '' THEN jsonb_build_array(platform)
  ELSE '[]'::jsonb
END
WHERE platforms IS NULL OR platforms = '[]'::jsonb;

UPDATE public.calendar_events
SET published_at = COALESCE(published_at, created_at, NOW())
WHERE status IN ('published', 'completed')
  AND published_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_calendar_events_status_scheduled_at
  ON public.calendar_events(status, scheduled_at);
