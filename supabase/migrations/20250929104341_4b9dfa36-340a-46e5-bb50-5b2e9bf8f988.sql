-- Fix function search_path security issues
-- 1. Fix set_first_read_at function with explicit search_path
CREATE OR REPLACE FUNCTION public.set_first_read_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
BEGIN
  -- If status is changing from 'new' to something else, set first_read_at
  IF OLD.status = 'new' AND NEW.status != 'new' AND NEW.first_read_at IS NULL THEN
    NEW.first_read_at = NOW();
  END IF;
  
  -- Set appropriate timestamps based on status changes
  IF NEW.status = 'closed' AND OLD.status != 'closed' THEN
    NEW.closed_at = NOW();
  END IF;
  
  IF NEW.status = 'archived' AND OLD.status != 'archived' THEN
    NEW.archived_at = NOW();
  END IF;
  
  IF NEW.status = 'deleted' AND OLD.status != 'deleted' THEN
    NEW.deleted_at = NOW();
    NEW.deleted_by = auth.uid();
  END IF;
  
  -- Clear timestamps when status changes away
  IF NEW.status != 'closed' AND OLD.status = 'closed' THEN
    NEW.closed_at = NULL;
  END IF;
  
  IF NEW.status != 'archived' AND OLD.status = 'archived' THEN
    NEW.archived_at = NULL;
  END IF;
  
  IF NEW.status != 'deleted' AND OLD.status = 'deleted' THEN
    NEW.deleted_at = NULL;
    NEW.deleted_by = NULL;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 2. Fix generate_tracking_id function with explicit search_path
CREATE OR REPLACE FUNCTION public.generate_tracking_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
    new_id text;
BEGIN
    -- Generate a unique tracking ID with DIS- prefix
    SELECT 'DIS-' || UPPER(substr(md5(random()::text), 1, 8)) INTO new_id;
    
    -- Ensure uniqueness by checking against existing reports
    WHILE EXISTS (SELECT 1 FROM public.reports WHERE tracking_id = new_id) LOOP
        SELECT 'DIS-' || UPPER(substr(md5(random()::text), 1, 8)) INTO new_id;
    END LOOP;
    
    RETURN new_id;
END;
$function$;

-- 3. Move pg_net extension from public to extensions schema
-- First create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Drop and recreate pg_net in extensions schema
DROP EXTENSION IF EXISTS pg_net CASCADE;
CREATE EXTENSION pg_net SCHEMA extensions;