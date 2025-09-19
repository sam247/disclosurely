-- Add missing status column required by edge function and triggers
ALTER TABLE public.email_notifications
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';

-- Optional: ensure created_at exists with default (harmless if already present)
ALTER TABLE public.email_notifications
ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();