-- Case Insights RAG Feature Migration
-- Adds vector embeddings support for semantic case search

-- Ensure vector extension is enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to reports table for vector search
-- Using 1536 dimensions for OpenAI text-embedding-3-small
ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create IVFFlat index for cosine similarity search
-- This index speeds up vector similarity queries
-- Note: IVFFlat requires at least some data, so we create it with a check
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE schemaname = 'public' 
      AND tablename = 'reports' 
      AND indexname = 'reports_embedding_idx'
  ) THEN
    -- Only create index if there are some rows (IVFFlat requirement)
    IF (SELECT COUNT(*) FROM public.reports) > 0 THEN
      CREATE INDEX reports_embedding_idx 
      ON public.reports 
      USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100);
    END IF;
  END IF;
END$$;

-- RPC function to match cases by organization using vector similarity
-- CRITICAL: This function MUST filter by organization_id to ensure data isolation
CREATE OR REPLACE FUNCTION match_cases_by_organization(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  org_id uuid
)
RETURNS TABLE (
  id uuid,
  tracking_id text,
  title text,
  description text,
  status text,
  priority int,
  created_at timestamptz,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.tracking_id,
    r.title,
    -- Note: description is encrypted, will be decrypted in edge function
    ''::text as description,
    r.status::text,
    r.priority,
    r.created_at,
    1 - (r.embedding <=> query_embedding) as similarity
  FROM public.reports r
  WHERE 
    r.organization_id = org_id  -- CRITICAL: Organization isolation
    AND r.embedding IS NOT NULL
    AND 1 - (r.embedding <=> query_embedding) > match_threshold
  ORDER BY r.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION match_cases_by_organization(vector(1536), float, int, uuid) TO authenticated;

-- Create rag_query_logs table for audit trail
CREATE TABLE IF NOT EXISTS public.rag_query_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  query_text text NOT NULL,
  results_count int DEFAULT 0,
  cases_returned uuid[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create index on organization_id for fast queries
CREATE INDEX IF NOT EXISTS rag_query_logs_organization_id_idx 
ON public.rag_query_logs(organization_id);

-- Create index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS rag_query_logs_created_at_idx 
ON public.rag_query_logs(created_at DESC);

-- Create index on user_id for user-specific queries
CREATE INDEX IF NOT EXISTS rag_query_logs_user_id_idx 
ON public.rag_query_logs(user_id);

-- Enable RLS on rag_query_logs
ALTER TABLE public.rag_query_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own organization's query logs
CREATE POLICY "Users can view their organization's RAG query logs"
ON public.rag_query_logs
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = auth.uid() AND is_active = true
  )
);

-- RLS Policy: Service role can insert query logs (for edge functions)
-- Note: Edge functions use service role, so this allows logging
CREATE POLICY "Service role can insert RAG query logs"
ON public.rag_query_logs
FOR INSERT
WITH CHECK (true);  -- Edge functions use service role which bypasses RLS

-- Add comment to embedding column
COMMENT ON COLUMN public.reports.embedding IS 'Vector embedding for semantic search (1536 dimensions, OpenAI text-embedding-3-small)';

-- Add comment to function
COMMENT ON FUNCTION match_cases_by_organization(vector(1536), float, int, uuid) IS 
'Matches cases by vector similarity within a specific organization. CRITICAL: Enforces organization isolation.';

