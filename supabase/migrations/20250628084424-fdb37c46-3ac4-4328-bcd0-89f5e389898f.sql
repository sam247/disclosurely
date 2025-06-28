
-- Create storage bucket for organization logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('organization-logos', 'organization-logos', true);

-- Create RLS policies for the organization-logos bucket
CREATE POLICY "Allow authenticated users to upload organization logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'organization-logos');

CREATE POLICY "Allow public access to organization logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'organization-logos');

CREATE POLICY "Allow authenticated users to update their organization logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'organization-logos');

CREATE POLICY "Allow authenticated users to delete their organization logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'organization-logos');
