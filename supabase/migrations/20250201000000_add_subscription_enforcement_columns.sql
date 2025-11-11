-- Add subscription enforcement columns to subscribers table
ALTER TABLE public.subscribers
ADD COLUMN IF NOT EXISTS subscription_status TEXT CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'trialing', 'expired')) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS grace_period_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_payment_failed_at TIMESTAMPTZ;

-- Create index for subscription status queries
CREATE INDEX IF NOT EXISTS idx_subscribers_subscription_status ON public.subscribers(subscription_status);
CREATE INDEX IF NOT EXISTS idx_subscribers_grace_period ON public.subscribers(grace_period_ends_at) WHERE grace_period_ends_at IS NOT NULL;

-- Function to check if subscription is active (including grace period)
CREATE OR REPLACE FUNCTION is_subscription_active(subscriber_record public.subscribers)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if subscription is explicitly active
  IF subscriber_record.subscription_status = 'active' OR subscriber_record.subscription_status = 'trialing' THEN
    -- Check if subscription_end is in the future
    IF subscriber_record.subscription_end IS NULL OR subscriber_record.subscription_end > NOW() THEN
      RETURN TRUE;
    END IF;
    
    -- Check if we're in grace period
    IF subscriber_record.grace_period_ends_at IS NOT NULL AND subscriber_record.grace_period_ends_at > NOW() THEN
      RETURN TRUE;
    END IF;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

