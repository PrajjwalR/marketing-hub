ALTER TABLE public.social_connections
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'connected';

ALTER TABLE public.social_connections
ADD COLUMN IF NOT EXISTS connected_at TIMESTAMPTZ;

ALTER TABLE public.social_connections
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMPTZ;

ALTER TABLE public.social_connections
ADD COLUMN IF NOT EXISTS token_encrypted BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.social_connections
DROP CONSTRAINT IF EXISTS social_connections_status_check;

ALTER TABLE public.social_connections
ADD CONSTRAINT social_connections_status_check
CHECK (status IN ('connected', 'disconnected', 'error'));

UPDATE public.social_connections
SET
  connected_at = COALESCE(connected_at, created_at, NOW()),
  last_sync_at = COALESCE(last_sync_at, created_at, NOW()),
  status = CASE
    WHEN access_token IS NOT NULL AND access_token <> '' THEN 'connected'
    ELSE 'disconnected'
  END
WHERE connected_at IS NULL
   OR last_sync_at IS NULL
   OR status IS NULL;

CREATE INDEX IF NOT EXISTS idx_social_connections_user_platform_status
  ON public.social_connections(user_id, platform, status);

CREATE INDEX IF NOT EXISTS idx_social_connections_last_sync_at
  ON public.social_connections(last_sync_at DESC);
