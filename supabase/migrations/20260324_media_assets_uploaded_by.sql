ALTER TABLE public.media_assets
ADD COLUMN IF NOT EXISTS uploaded_by TEXT;

UPDATE public.media_assets
SET uploaded_by = COALESCE(uploaded_by, user_id)
WHERE uploaded_by IS NULL;

CREATE INDEX IF NOT EXISTS idx_media_assets_uploaded_by
  ON public.media_assets(uploaded_by);
