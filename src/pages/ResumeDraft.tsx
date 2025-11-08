import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight } from 'lucide-react';
import { resumeDraft } from '@/services/draftService';
import BrandedFormLayout from '@/components/BrandedFormLayout';
import { supabase } from '@/integrations/supabase/client';

interface OrganizationBranding {
  name: string;
  logo_url?: string;
  custom_logo_url?: string;
  brand_color?: string;
}

export const ResumeDraft = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [draftCode, setDraftCode] = useState(searchParams.get('code') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [organizationBranding, setOrganizationBranding] = useState<OrganizationBranding | null>(null);
  const [loadingBranding, setLoadingBranding] = useState(false);

  // Fetch organization branding when draft code is entered
  useEffect(() => {
    if (draftCode && draftCode.length >= 12) {
      fetchOrganizationBranding();
    }
  }, [draftCode]);

  const fetchOrganizationBranding = async () => {
    if (!draftCode) return;
    
    setLoadingBranding(true);
    try {
      // Fetch draft to get organization_id
      const { data: draftData, error: draftError } = await supabase
        .from('report_drafts')
        .select('organization_id')
        .eq('draft_code', draftCode.toUpperCase())
        .maybeSingle();

      if (draftError || !draftData) {
        setLoadingBranding(false);
        return;
      }

      // Fetch organization branding
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('name, logo_url, custom_logo_url, brand_color')
        .eq('id', draftData.organization_id)
        .maybeSingle();

      if (orgError || !orgData) {
        setLoadingBranding(false);
        return;
      }

      setOrganizationBranding({
        name: orgData.name,
        logo_url: orgData.logo_url,
        custom_logo_url: orgData.custom_logo_url,
        brand_color: orgData.brand_color
      });
    } catch (error) {
      console.error('Error fetching organization branding:', error);
    } finally {
      setLoadingBranding(false);
    }
  };

  const handleResume = async () => {
    setError('');
    setIsLoading(true);

    const response = await resumeDraft({ draftCode: draftCode.trim() });
    setIsLoading(false);

    if (response.success) {
      // Navigate to form with draft data
      navigate(`/newform?draft=${draftCode}`);
    } else {
      setError(response.message || 'Failed to load draft');
    }
  };

  const brandColor = organizationBranding?.brand_color || '#2563eb';
  const logoUrl = organizationBranding?.custom_logo_url || organizationBranding?.logo_url;

  const content = (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Resume Draft</h1>
        <p className="text-sm text-muted-foreground">
          Enter your draft code to continue your report
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="draft-code">Draft Code</Label>
          <Input
            id="draft-code"
            placeholder="DR-A7K9-M3P2-X8Q5"
            value={draftCode}
            onChange={(e) => setDraftCode(e.target.value.toUpperCase())}
            className="font-mono"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <Button
          onClick={handleResume}
          disabled={!draftCode || isLoading}
          className="w-full gap-2"
          style={{ backgroundColor: brandColor }}
        >
          {isLoading ? (
            'Loading...'
          ) : (
            <>
              Resume Draft
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>

        <div className="text-center">
          <Button
            variant="link"
            onClick={() => navigate('/newform')}
            className="text-sm"
          >
            Start a new report instead
          </Button>
        </div>
      </div>

      <div className="bg-muted rounded-lg p-3 text-xs text-muted-foreground">
        <p><strong>Note:</strong> Drafts expire after 48 hours for security reasons.</p>
      </div>
    </div>
  );

  // Always use BrandedFormLayout for consistent header
  return (
    <BrandedFormLayout
      title="Resume Draft"
      organizationName={organizationBranding?.name || 'Disclosurely'}
      logoUrl={logoUrl}
      brandColor={brandColor}
      description="Enter your draft code to continue your report"
    >
      {content}
    </BrandedFormLayout>
  );
};

export default ResumeDraft;
