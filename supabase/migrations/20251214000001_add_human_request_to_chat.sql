-- Add human_requested field to chat_conversations
ALTER TABLE public.chat_conversations
ADD COLUMN IF NOT EXISTS human_requested BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS human_requested_at TIMESTAMPTZ;

-- Add index for filtering
CREATE INDEX IF NOT EXISTS idx_chat_conversations_human_requested 
ON public.chat_conversations(human_requested, human_requested_at DESC) 
WHERE human_requested = true;

