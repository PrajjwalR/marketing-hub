-- Why a scheduled post failed to publish, shown to the user in the calendar.
ALTER TABLE public.calendar_events
ADD COLUMN IF NOT EXISTS error_message TEXT;
