-- Auto-generate embeddings for cases when created or updated
-- This trigger automatically calls the generate-case-embeddings edge function

-- Ensure pg_net extension is enabled for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Function to trigger embedding generation
CREATE OR REPLACE FUNCTION public.trigger_generate_case_embedding()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only generate embedding if it doesn't exist yet
  -- This prevents unnecessary regeneration on every update
  IF NEW.embedding IS NULL THEN
    -- Call the generate-case-embeddings edge function asynchronously
    -- The function doesn't require JWT (verify_jwt = false), so no auth header needed
    PERFORM net.http_post(
      url := 'https://cxmuzperkittvibslnff.supabase.co/functions/v1/generate-case-embeddings',
      headers := jsonb_build_object(
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object('caseId', NEW.id)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on INSERT - generate embedding for new cases
DROP TRIGGER IF EXISTS auto_generate_embedding_on_insert ON public.reports;
CREATE TRIGGER auto_generate_embedding_on_insert
  AFTER INSERT ON public.reports
  FOR EACH ROW
  WHEN (NEW.embedding IS NULL)
  EXECUTE FUNCTION trigger_generate_case_embedding();

-- Create trigger on UPDATE - regenerate embedding if case content changed
-- Only regenerate if embedding is NULL (wasn't generated before)
DROP TRIGGER IF EXISTS auto_generate_embedding_on_update ON public.reports;
CREATE TRIGGER auto_generate_embedding_on_update
  AFTER UPDATE ON public.reports
  FOR EACH ROW
  WHEN (
    NEW.embedding IS NULL 
    AND (
      OLD.title IS DISTINCT FROM NEW.title 
      OR OLD.encrypted_content IS DISTINCT FROM NEW.encrypted_content
      OR OLD.tags IS DISTINCT FROM NEW.tags
    )
  )
  EXECUTE FUNCTION trigger_generate_case_embedding();

-- Add comment
COMMENT ON FUNCTION trigger_generate_case_embedding() IS 
'Automatically triggers embedding generation for new or updated cases via edge function.';

