
-- Add RLS policy to allow users to delete reports from their organization
CREATE POLICY "Users can delete organization reports" 
  ON public.reports 
  FOR DELETE 
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );
