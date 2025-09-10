-- Enable realtime for report_messages table
ALTER TABLE public.report_messages REPLICA IDENTITY FULL;

-- Create publication for realtime if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
    END IF;
    
    -- Ensure report_messages is in the publication
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'report_messages') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE report_messages;
    END IF;
END
$$;