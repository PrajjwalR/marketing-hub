-- Add recycling/recurring fields to calendar_events
ALTER TABLE public.calendar_events 
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS repeat_interval TEXT CHECK (repeat_interval IN ('daily', 'weekly', 'monthly', 'custom')),
ADD COLUMN IF NOT EXISTS repeat_frequency INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS repeat_end_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS repeat_count INTEGER,
ADD COLUMN IF NOT EXISTS recycled_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS source_post_id UUID REFERENCES public.calendar_events(id) ON DELETE SET NULL;
