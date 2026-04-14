-- Email was globally UNIQUE, which breaks multi-tenant CRM and re-imports when the same
-- address exists on another owner or on legacy rows with NULL owner_user_id.
-- Scope uniqueness to (owner_user_id, normalized email).

ALTER TABLE public.contacts DROP CONSTRAINT IF EXISTS contacts_email_key;

UPDATE public.contacts
SET email = lower(trim(email))
WHERE email IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS contacts_owner_email_uidx
  ON public.contacts (owner_user_id, email)
  WHERE owner_user_id IS NOT NULL;
