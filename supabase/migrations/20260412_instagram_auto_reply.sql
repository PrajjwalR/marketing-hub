-- Instagram Auto Reply Feature — Database Schema
-- Created: 2026-04-12
-- Tables are platform-agnostic (reference social_connections.id) for future LinkedIn/Facebook reuse

-- Auto Reply Settings (per social_connection)
CREATE TABLE IF NOT EXISTS public.auto_reply_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  connection_id UUID NOT NULL REFERENCES public.social_connections(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT FALSE,
  polling_interval_minutes INT DEFAULT 10,         -- 5, 10, 15, 30
  max_replies_per_day INT DEFAULT 30,
  min_delay_seconds INT DEFAULT 2,
  max_delay_seconds INT DEFAULT 12,
  blacklist_keywords TEXT[] DEFAULT '{}'::text[],   -- skip comments containing these
  monitor_all_posts BOOLEAN DEFAULT TRUE,          -- false = only monitored_posts
  ai_provider TEXT DEFAULT 'gemini',               -- gemini, openai, anthropic
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, connection_id)
);
ALTER TABLE public.auto_reply_settings ENABLE ROW LEVEL SECURITY;

-- Reply Templates
CREATE TABLE IF NOT EXISTS public.reply_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  connection_id UUID NOT NULL REFERENCES public.social_connections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}'::text[],            -- trigger keywords
  reply_text TEXT,                                  -- static fallback reply
  ai_enabled BOOLEAN DEFAULT FALSE,
  ai_guidelines TEXT,                               -- extra instructions for AI
  priority INT DEFAULT 0,                           -- higher = checked first
  is_fallback BOOLEAN DEFAULT FALSE,               -- global fallback template
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.reply_templates ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_reply_templates_conn ON public.reply_templates(connection_id, active, priority DESC);

-- Monitored Posts (when monitor_all_posts = false)
CREATE TABLE IF NOT EXISTS public.monitored_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  connection_id UUID NOT NULL REFERENCES public.social_connections(id) ON DELETE CASCADE,
  post_id TEXT NOT NULL,                           -- Instagram media ID
  post_text TEXT,                                  -- Cached caption for AI context
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(connection_id, post_id)
);
ALTER TABLE public.monitored_posts ENABLE ROW LEVEL SECURITY;

-- Processed Comments (deduplication)
CREATE TABLE IF NOT EXISTS public.processed_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  connection_id UUID NOT NULL REFERENCES public.social_connections(id) ON DELETE CASCADE,
  post_id TEXT NOT NULL,
  comment_id TEXT NOT NULL,
  comment_text TEXT,
  commenter_username TEXT,
  replied BOOLEAN DEFAULT FALSE,
  reply_text TEXT,
  reply_id TEXT,
  template_id UUID REFERENCES public.reply_templates(id) ON DELETE SET NULL,
  skipped_reason TEXT,                              -- 'blacklisted', 'no_match', 'rate_limited', 'own_comment'
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(connection_id, comment_id)
);
ALTER TABLE public.processed_comments ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_processed_comments_post ON public.processed_comments(connection_id, post_id);
CREATE INDEX IF NOT EXISTS idx_processed_comments_time ON public.processed_comments(user_id, processed_at DESC);

-- Auto Reply Logs (audit trail)
CREATE TABLE IF NOT EXISTS public.auto_reply_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  connection_id UUID NOT NULL REFERENCES public.social_connections(id) ON DELETE CASCADE,
  action TEXT NOT NULL,                             -- 'reply_sent','comment_skipped','error','rate_limited','polling_run'
  post_id TEXT,
  comment_id TEXT,
  comment_text TEXT,
  reply_text TEXT,
  template_name TEXT,
  ai_used BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.auto_reply_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_auto_reply_logs_user ON public.auto_reply_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auto_reply_logs_conn ON public.auto_reply_logs(connection_id, created_at DESC);

-- Daily Rate Limiting Counter
CREATE TABLE IF NOT EXISTS public.auto_reply_daily_counts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id UUID NOT NULL REFERENCES public.social_connections(id) ON DELETE CASCADE,
  count_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reply_count INT DEFAULT 0,
  UNIQUE(connection_id, count_date)
);
ALTER TABLE public.auto_reply_daily_counts ENABLE ROW LEVEL SECURITY;
