CREATE TABLE IF NOT EXISTS public.labels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366F1',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.post_labels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.calendar_events(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES public.labels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id, label_id)
);

ALTER TABLE public.post_labels ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.labels ADD COLUMN IF NOT EXISTS org_id TEXT;
ALTER TABLE public.labels ADD COLUMN IF NOT EXISTS project_id TEXT;
ALTER TABLE public.post_labels ADD COLUMN IF NOT EXISTS org_id TEXT;
ALTER TABLE public.post_labels ADD COLUMN IF NOT EXISTS project_id TEXT;

CREATE INDEX IF NOT EXISTS idx_labels_user_id ON public.labels(user_id);
CREATE INDEX IF NOT EXISTS idx_post_labels_post_id ON public.post_labels(post_id);
CREATE INDEX IF NOT EXISTS idx_post_labels_label_id ON public.post_labels(label_id);
