
-- Let's see what policies currently exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'reports' 
ORDER BY policyname;

-- Drop ALL policies on reports table to start completely fresh
DO $$
DECLARE
    rec record;
BEGIN
    FOR rec IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'reports' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.reports', rec.policyname);
    END LOOP;
END $$;

-- Temporarily disable RLS to clear any cached policies
ALTER TABLE public.reports DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Create the most permissive INSERT policy possible
CREATE POLICY "allow_all_inserts" 
ON public.reports 
FOR INSERT 
TO public
WITH CHECK (true);

-- Also ensure anonymous users can insert (just in case)
CREATE POLICY "allow_anonymous_inserts" 
ON public.reports 
FOR INSERT 
TO anon
WITH CHECK (true);
