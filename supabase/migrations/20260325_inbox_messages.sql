-- Unified inbox schema for platform-normalized inbound messages (v1: internal + future API ingestion).

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
