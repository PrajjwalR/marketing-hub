-- CRM calendar sync: tie contacts to app users and mark auto-generated posting rows

ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS owner_user_id TEXT REFERENCES public.users(user_id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_contacts_owner_user_id ON public.contacts(owner_user_id);

COMMENT ON COLUMN public.contacts.owner_user_id IS 'Firebase user_id of the workspace owner; used for CRM → posting calendar sync.';

ALTER TABLE public.calendar_events
  ADD COLUMN IF NOT EXISTS crm_contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL;

ALTER TABLE public.calendar_events
  ADD COLUMN IF NOT EXISTS crm_campaign_key TEXT;

CREATE INDEX IF NOT EXISTS idx_calendar_events_crm_contact ON public.calendar_events(crm_contact_id)
  WHERE crm_contact_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_calendar_events_crm_campaign_dedup
  ON public.calendar_events(user_id, crm_campaign_key)
  WHERE crm_campaign_key IS NOT NULL;
