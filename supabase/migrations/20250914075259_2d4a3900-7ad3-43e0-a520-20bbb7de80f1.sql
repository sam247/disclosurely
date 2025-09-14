-- Update the generate_tracking_id function to use DIS- prefix instead of WB-
CREATE OR REPLACE FUNCTION public.generate_tracking_id()
RETURNS text
LANGUAGE plpgsql
AS $$
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
$$;