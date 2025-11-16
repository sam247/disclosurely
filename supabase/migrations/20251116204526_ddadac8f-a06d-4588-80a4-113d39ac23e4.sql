-- Add server-side cache timestamp for Stripe data
-- This reduces Stripe API calls by caching subscription data for 10 minutes

ALTER TABLE subscribers
ADD COLUMN IF NOT EXISTS stripe_data_cached_at TIMESTAMPTZ;

-- Index for cache lookup performance
CREATE INDEX IF NOT EXISTS idx_subscribers_stripe_cache
ON subscribers(stripe_data_cached_at)
WHERE stripe_data_cached_at IS NOT NULL;

-- Comment for documentation
COMMENT ON COLUMN subscribers.stripe_data_cached_at IS 
'Timestamp of last Stripe API data fetch. Used for 10-minute cache TTL to reduce API calls. Updated after every successful Stripe API call.';