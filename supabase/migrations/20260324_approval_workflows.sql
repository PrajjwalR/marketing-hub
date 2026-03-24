ALTER TABLE public.calendar_events
ADD COLUMN IF NOT EXISTS approval_required BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.calendar_events
ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'none';

ALTER TABLE public.calendar_events
ADD COLUMN IF NOT EXISTS approved_by TEXT REFERENCES public.users(user_id) ON DELETE SET NULL;

ALTER TABLE public.calendar_events
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

ALTER TABLE public.calendar_events
ADD COLUMN IF NOT EXISTS submitted_for_approval_at TIMESTAMPTZ;

ALTER TABLE public.calendar_events
DROP CONSTRAINT IF EXISTS calendar_events_approval_status_check;

ALTER TABLE public.calendar_events
ADD CONSTRAINT calendar_events_approval_status_check
CHECK (approval_status IN ('none', 'pending', 'approved', 'rejected', 'changes_requested'));

CREATE TABLE IF NOT EXISTS public.post_approvals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.calendar_events(id) ON DELETE CASCADE,
  requested_by TEXT NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending',
  resolved_by TEXT REFERENCES public.users(user_id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  decision_note TEXT
);

ALTER TABLE public.post_approvals ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.post_approval_reviewers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  approval_id UUID NOT NULL REFERENCES public.post_approvals(id) ON DELETE CASCADE,
  reviewer_user_id TEXT NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'required',
  decision TEXT NOT NULL DEFAULT 'pending',
  decision_at TIMESTAMPTZ,
  comment TEXT,
  UNIQUE(approval_id, reviewer_user_id)
);

ALTER TABLE public.post_approval_reviewers ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.post_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.calendar_events(id) ON DELETE CASCADE,
  actor_user_id TEXT NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.post_activity_log ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_post_approvals_user_post ON public.post_approvals(user_id, post_id);
CREATE INDEX IF NOT EXISTS idx_post_approvals_requested_by ON public.post_approvals(requested_by, requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_approval_reviewers_reviewer ON public.post_approval_reviewers(reviewer_user_id, decision);
CREATE INDEX IF NOT EXISTS idx_post_activity_log_post ON public.post_activity_log(post_id, created_at DESC);
