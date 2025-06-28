
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';

interface OrganizationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const OrganizationSettings = ({ isOpen, onClose }: OrganizationSettingsProps) => {
  const { organization, refetch } = useOrganization();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: organization?.name || '',
    description: organization?.description || '',
    brand_color: organization?.brand_color || '#2563eb',
    custom_logo_url: organization?.custom_logo_url || '',
  });

  const handleSave = async () => {
    if (!organization) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: formData.name,
          description: formData.description,
          brand_color: formData.brand_color,
          custom_logo_url: formData.custom_logo_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', organization.id);

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Organization settings have been updated successfully.",
      });

      refetch();
      onClose();
    } catch (error: any) {
      console.error('Error saving organization settings:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Organization Settings</DialogTitle>
          <DialogDescription>
            Manage your organization details and branding
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Organization Details */}
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>Basic information about your organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="org-name">Organization Name</Label>
                <Input
                  id="org-name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter organization name"
                />
              </div>
              <div>
                <Label htmlFor="org-description">Description</Label>
                <Textarea
                  id="org-description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of your organization"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Branding */}
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>Customize the appearance of your submission forms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="brand-color">Brand Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="brand-color"
                    type="color"
                    value={formData.brand_color}
                    onChange={(e) => handleInputChange('brand_color', e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    value={formData.brand_color}
                    onChange={(e) => handleInputChange('brand_color', e.target.value)}
                    placeholder="#2563eb"
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="logo-url">Custom Logo URL</Label>
                <Input
                  id="logo-url"
                  value={formData.custom_logo_url}
                  onChange={(e) => handleInputChange('custom_logo_url', e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
                {formData.custom_logo_url && (
                  <div className="mt-2">
                    <img 
                      src={formData.custom_logo_url} 
                      alt="Logo preview" 
                      className="max-w-32 max-h-16 object-contain border rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrganizationSettings;
