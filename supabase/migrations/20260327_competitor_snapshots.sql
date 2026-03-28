CREATE TABLE IF NOT EXISTS public.competitor_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE UNIQUE,
  competitors_payload JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_competitor_snapshots_user_id
  ON public.competitor_snapshots(user_id);

CREATE OR REPLACE FUNCTION public.set_competitor_snapshots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_competitor_snapshots_updated_at ON public.competitor_snapshots;

CREATE TRIGGER trg_competitor_snapshots_updated_at
BEFORE UPDATE ON public.competitor_snapshots
FOR EACH ROW
EXECUTE FUNCTION public.set_competitor_snapshots_updated_at();
