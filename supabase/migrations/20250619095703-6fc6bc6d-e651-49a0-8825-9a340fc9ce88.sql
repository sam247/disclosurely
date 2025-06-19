
-- Create organization_links table for storing generated unique links
CREATE TABLE public.organization_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  link_token TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  department TEXT,
  location TEXT,
  custom_fields JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create link_analytics table for tracking link usage
CREATE TABLE public.link_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID REFERENCES public.organization_links(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL, -- 'view', 'submit', 'bounce'
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.organization_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for organization_links
CREATE POLICY "Users can view their organization's links" 
  ON public.organization_links 
  FOR SELECT 
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create links for their organization" 
  ON public.organization_links 
  FOR INSERT 
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their organization's links" 
  ON public.organization_links 
  FOR UPDATE 
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- RLS policies for link_analytics
CREATE POLICY "Users can view their organization's link analytics" 
  ON public.link_analytics 
  FOR SELECT 
  USING (
    link_id IN (
      SELECT id FROM public.organization_links 
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

-- Function to generate unique link tokens
CREATE OR REPLACE FUNCTION public.generate_link_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  token TEXT;
BEGIN
  -- Generate a random token
  token := LOWER(SUBSTRING(MD5(RANDOM()::TEXT || EXTRACT(EPOCH FROM NOW())::TEXT) FROM 1 FOR 12));
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.organization_links WHERE link_token = token) LOOP
    token := LOWER(SUBSTRING(MD5(RANDOM()::TEXT || EXTRACT(EPOCH FROM NOW())::TEXT) FROM 1 FOR 12));
  END LOOP;
  
  RETURN token;
END;
$$;

-- Trigger to set link_token if not provided
CREATE OR REPLACE FUNCTION public.set_link_token()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.link_token IS NULL OR NEW.link_token = '' THEN
    NEW.link_token := generate_link_token();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_link_token_trigger
  BEFORE INSERT ON public.organization_links
  FOR EACH ROW
  EXECUTE FUNCTION public.set_link_token();

-- Update the reports table to include link attribution
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS submitted_via_link_id UUID REFERENCES public.organization_links(id);
