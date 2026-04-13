-- AI Video Sessions: one row per video generation session (user runs "Generate Video" once)
-- Mirrors ai_photoshoot_sessions structure but stores video-specific data.
CREATE TABLE IF NOT EXISTS public.ai_video_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  run_session_id TEXT NOT NULL,
  model_id TEXT,
  model_name TEXT,
  model_style TEXT,
  jewelry_type TEXT NOT NULL,
  video_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_video_sessions_user_created
  ON public.ai_video_sessions (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_video_sessions_run_session
  ON public.ai_video_sessions (user_id, run_session_id);

ALTER TABLE public.ai_video_sessions ENABLE ROW LEVEL SECURITY;
-- API routes use Supabase service role (bypasses RLS). Add policies if you expose this table to the browser client.
