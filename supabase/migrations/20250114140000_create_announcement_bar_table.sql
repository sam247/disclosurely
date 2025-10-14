-- Create announcement_bar table for managing site-wide announcements
CREATE TABLE public.announcement_bar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- Rich text content with links
  is_active BOOLEAN NOT NULL DEFAULT false,
  show_on_frontend BOOLEAN NOT NULL DEFAULT true,
  show_on_backend BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 1, -- Higher numbers show first
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.announcement_bar ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view active announcements"
ON public.announcement_bar FOR SELECT
TO authenticated, anon
USING (is_active = true AND organization_id IS NOT NULL);

CREATE POLICY "Organization admins can manage announcements"
ON public.announcement_bar FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.organization_id = announcement_bar.organization_id
    AND profiles.role IN ('admin', 'org_admin')
  )
);

-- Index for performance
CREATE INDEX idx_announcement_bar_org_active ON public.announcement_bar(organization_id, is_active);
CREATE INDEX idx_announcement_bar_dates ON public.announcement_bar(start_date, end_date);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_announcement_bar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_announcement_bar_updated_at
  BEFORE UPDATE ON public.announcement_bar
  FOR EACH ROW
  EXECUTE FUNCTION update_announcement_bar_updated_at();
