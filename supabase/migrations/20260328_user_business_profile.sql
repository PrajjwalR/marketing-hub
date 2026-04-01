-- Strategy / personalization: business vertical and marketing context per user
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS business_vertical TEXT
  CHECK (business_vertical IS NULL OR business_vertical IN ('jewellery', 'gym', 'ecommerce'));

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS business_display_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS target_audience TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS primary_marketing_goal TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS content_tone TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS regions_or_markets TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS product_focus TEXT;

COMMENT ON COLUMN public.users.business_vertical IS 'jewellery | gym | ecommerce — drives AI strategy prompts';
COMMENT ON COLUMN public.users.primary_marketing_goal IS 'e.g. sales, awareness, engagement, launch, retention';
COMMENT ON COLUMN public.users.content_tone IS 'Voice/tone hint for generated content';
