-- Paid / ad performance: linked accounts + normalized daily campaign metrics (v1: manual ingest + demo seed; platform APIs later).

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
