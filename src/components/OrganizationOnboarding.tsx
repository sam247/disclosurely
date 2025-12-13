
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Building2, Palette, FileText } from 'lucide-react';

const OrganizationOnboarding = () => {
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    description: '',
    brandColor: '#2563eb'
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      console.error('No user found');
      return;
    }

    
    

    setLoading(true);
    try {
      // Create organization first
      
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: formData.name,
          domain: formData.domain.toLowerCase().replace(/\s+/g, '-'),
          description: formData.description,
          brand_color: formData.brandColor
        })
        .select()
        .single();

      if (orgError) {
        console.error('Organization creation error:', orgError);
        throw orgError;
      }

      

      // Update user profile with organization
      
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email || '',
          organization_id: orgData.id,
          role: 'org_admin',
          is_active: true
        });

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }

      

      toast({
        title: "Organization created successfully!",
        description: "Welcome to Disclosurely. You can now start managing reports.",
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Full error object:', error);
      console.error('Error code:', error.code);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      console.error('Error message:', error.message);
      
      toast({
        title: "Error creating organization",
        description: `${error.message} (Code: ${error.code || 'Unknown'})`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="text-center mb-8">
          <Building2 className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Set up your organization
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Complete your organization profile to start using Disclosurely
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Organization Information</CardTitle>
            <CardDescription>
              This information will be used to brand your reporting portal and manage submissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Organization Name *</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Acme Corporation"
                />
              </div>

              <div>
                <Label htmlFor="domain">Domain Identifier *</Label>
                <Input
                  id="domain"
                  type="text"
                  required
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  placeholder="acme-corp"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Used for your unique reporting links: disclosurely.com/submit/acme-corp/...
                </p>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of your organization..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="brandColor">Brand Color</Label>
                <div className="flex items-center space-x-3 mt-1">
                  <input
                    id="brandColor"
                    type="color"
                    value={formData.brandColor}
                    onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={formData.brandColor}
                    onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  This color will be used in your organization's reporting portal
                </p>
              </div>

              <Button 
                type="submit" 
                loading={loading}
                loadingText="Creating Organization..."
                className="w-full"
              >
                Create Organization
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrganizationOnboarding;
