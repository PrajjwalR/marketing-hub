-- =============================================================
-- Workspaces (sibling brand accounts under one Firebase login)
-- =============================================================

CREATE TABLE IF NOT EXISTS public.workspaces (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT,
  logo_url     TEXT,
  color        TEXT DEFAULT '#6366f1',   -- accent colour shown in switcher
  emoji        TEXT DEFAULT '🏢',
  is_default   BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_workspaces_user_id ON public.workspaces(user_id);

-- Each user gets exactly one default workspace; enforce with a partial unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_workspaces_one_default_per_user
  ON public.workspaces(user_id)
  WHERE is_default = TRUE;

-- ---------------------------------------------------------------
-- Add workspace_id to every tenant-scoped table
-- (social_connections, calendar_events, series, videos, media_assets,
--  strategies, strategy_posts, inbox_messages, ad_accounts, folders)
-- ---------------------------------------------------------------
ALTER TABLE public.social_connections    ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.social_integrations   ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.calendar_events       ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.series                ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.videos                ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.media_assets          ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.folders               ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.strategies            ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.strategy_posts        ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.inbox_messages        ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.ad_accounts           ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
