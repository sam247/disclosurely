-- SECURITY FIX: Remove hardcoded encryption salt fallback
-- The function encrypt_report_server_side has a hardcoded fallback salt which is a security risk

-- Drop the insecure function entirely (it's not used - edge functions handle encryption)
DROP FUNCTION IF EXISTS public.encrypt_report_server_side(jsonb, uuid);

-- If this function is needed in the future, it should be recreated WITHOUT a hardcoded fallback
-- and should fail fast if ENCRYPTION_SALT is not configured