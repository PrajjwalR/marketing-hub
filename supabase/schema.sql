DROP TABLE IF EXISTS public.users;

CREATE TABLE public.users (
  id uuid DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  email text,
  name text,
  created_at timestamp with time zone DEFAULT now(),
  credits bigint DEFAULT 0,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_user_id_key UNIQUE (user_id),
  CONSTRAINT users_email_key UNIQUE (email)
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;





-- Create social_integrations table for custom OAuth apps
CREATE TABLE IF NOT EXISTS public.social_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  name TEXT NOT NULL,
  client_id TEXT NOT NULL,
  client_secret TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform, client_id)
);
ALTER TABLE public.social_integrations ENABLE ROW LEVEL SECURITY;

-- Create social_connections table
CREATE TABLE IF NOT EXISTS public.social_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  integration_id UUID REFERENCES public.social_integrations(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  profile_name TEXT,
  platform_user_id TEXT,
  internal_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  profile_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform, platform_user_id)
);

-- Enable RLS for social_connections
ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;

-- Create series table
CREATE TABLE IF NOT EXISTS public.series (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  niche TEXT,
  is_custom_niche BOOLEAN DEFAULT FALSE,
  language TEXT,
  voice TEXT,
  model_name TEXT,
  model_lang_code TEXT,
  background_music TEXT,
  video_style TEXT,
  caption_style TEXT,
  series_name TEXT,
  duration TEXT,
  platforms JSONB,
  publish_time TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for series
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;

-- Create videos table
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  series_id UUID NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  title TEXT,
  script JSONB,
  voiceover_url TEXT,
  captions JSONB,
  images JSONB,
  video_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for videos
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Storage Bucket: voiceovers
INSERT INTO storage.buckets (id, name, public) 
VALUES ('voiceovers', 'voiceovers', true)
ON CONFLICT (id) DO NOTHING;

-- Create calendar_events table
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  video_id UUID REFERENCES public.videos(id) ON DELETE SET NULL,
  series_id UUID REFERENCES public.series(id) ON DELETE SET NULL,
  account_id UUID REFERENCES public.social_connections(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  media_url TEXT,
  type TEXT DEFAULT 'event',
  platform TEXT,
  color TEXT DEFAULT 'indigo',
  scheduled_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for calendar_events
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Create folders table for media library
CREATE TABLE IF NOT EXISTS public.folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for folders
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

-- Create media_assets table
CREATE TABLE IF NOT EXISTS public.media_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL,
  size BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for media_assets
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- Storage Bucket: media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Alter existing tables to add multi-tenancy fields
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS org_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS project_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS source_login TEXT;

ALTER TABLE public.social_integrations ADD COLUMN IF NOT EXISTS org_id TEXT;
ALTER TABLE public.social_integrations ADD COLUMN IF NOT EXISTS project_id TEXT;

ALTER TABLE public.social_connections ADD COLUMN IF NOT EXISTS org_id TEXT;
ALTER TABLE public.social_connections ADD COLUMN IF NOT EXISTS project_id TEXT;

ALTER TABLE public.series ADD COLUMN IF NOT EXISTS org_id TEXT;
ALTER TABLE public.series ADD COLUMN IF NOT EXISTS project_id TEXT;

ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS org_id TEXT;
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS project_id TEXT;

ALTER TABLE public.calendar_events ADD COLUMN IF NOT EXISTS org_id TEXT;
ALTER TABLE public.calendar_events ADD COLUMN IF NOT EXISTS project_id TEXT;

ALTER TABLE public.folders ADD COLUMN IF NOT EXISTS org_id TEXT;
ALTER TABLE public.folders ADD COLUMN IF NOT EXISTS project_id TEXT;

ALTER TABLE public.media_assets ADD COLUMN IF NOT EXISTS org_id TEXT;
ALTER TABLE public.media_assets ADD COLUMN IF NOT EXISTS project_id TEXT;

-- Strategy Planner
CREATE TABLE IF NOT EXISTS public.strategies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  business_type TEXT,
  brand_name TEXT,
  target_audience TEXT,
  goal TEXT,
  platforms TEXT[],
  theme TEXT,
  duration_days INTEGER NOT NULL DEFAULT 30,
  start_date DATE,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.strategy_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  strategy_id UUID NOT NULL REFERENCES public.strategies(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  platform TEXT NOT NULL,
  content_type TEXT NOT NULL,
  theme TEXT,
  idea TEXT,
  caption TEXT,
  description TEXT,
  goal TEXT,
  status TEXT DEFAULT 'planned',
  include_in_calendar BOOLEAN DEFAULT TRUE,
  media_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.strategy_posts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_strategies_user_id ON public.strategies(user_id);
CREATE INDEX IF NOT EXISTS idx_strategy_posts_strategy_id ON public.strategy_posts(strategy_id);

-- Unified inbox (platform-normalized messages; see migrations/20260325_inbox_messages.sql)
CREATE TABLE IF NOT EXISTS public.inbox_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'comment',
  received_at TIMESTAMPTZ NOT NULL,
  actioned_at TIMESTAMPTZ,
  action_type TEXT,
  tags TEXT[] DEFAULT '{}'::text[],
  sender_handle TEXT,
  body_preview TEXT,
  priority_score INT NOT NULL DEFAULT 0,
  sentiment TEXT,
  source_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT inbox_messages_message_type_check CHECK (
    message_type IN ('dm', 'comment', 'mention', 'review', 'email', 'other')
  ),
  CONSTRAINT inbox_messages_action_type_check CHECK (
    action_type IS NULL OR action_type IN ('replied', 'liked', 'hidden', 'archived', 'resolved', 'escalated', 'other')
  )
);
ALTER TABLE public.inbox_messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_inbox_messages_user_received ON public.inbox_messages(user_id, received_at);
CREATE INDEX IF NOT EXISTS idx_inbox_messages_user_platform ON public.inbox_messages(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_inbox_messages_user_actioned ON public.inbox_messages(user_id, actioned_at);
CREATE INDEX IF NOT EXISTS idx_inbox_messages_priority ON public.inbox_messages(user_id, priority_score DESC);

-- Paid ads (see migrations/20260326_ad_campaign_insights.sql)
CREATE TABLE IF NOT EXISTS public.ad_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  external_account_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT ad_accounts_platform_check CHECK (
    platform IN ('meta', 'google', 'linkedin', 'tiktok', 'other')
  ),
  CONSTRAINT ad_accounts_status_check CHECK (status IN ('active', 'disconnected', 'error')),
  CONSTRAINT ad_accounts_user_platform_ext_unique UNIQUE (user_id, platform, external_account_id)
);
CREATE TABLE IF NOT EXISTS public.ad_campaign_daily_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  ad_account_id UUID NOT NULL REFERENCES public.ad_accounts(id) ON DELETE CASCADE,
  campaign_external_id TEXT NOT NULL,
  campaign_name TEXT NOT NULL,
  stat_date DATE NOT NULL,
  impressions BIGINT NOT NULL DEFAULT 0,
  clicks BIGINT NOT NULL DEFAULT 0,
  spend_cents BIGINT NOT NULL DEFAULT 0,
  conversions NUMERIC(14, 4) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT ad_campaign_daily_metrics_unique UNIQUE (ad_account_id, campaign_external_id, stat_date)
);
ALTER TABLE public.ad_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_campaign_daily_metrics ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_ad_accounts_user ON public.ad_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_metrics_user_date ON public.ad_campaign_daily_metrics(user_id, stat_date);
CREATE INDEX IF NOT EXISTS idx_ad_metrics_account_date ON public.ad_campaign_daily_metrics(ad_account_id, stat_date);
