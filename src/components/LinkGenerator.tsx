
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Copy, ExternalLink, Plus, Calendar } from 'lucide-react';

interface OrganizationLink {
  id: string;
  name: string;
  description: string;
  link_token: string;
  department: string;
  location: string;
  is_active: boolean;
  expires_at: string | null;
  usage_limit: number | null;
  usage_count: number;
  created_at: string;
}

const LinkGenerator = () => {
  const [links, setLinks] = useState<OrganizationLink[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userOrg, setUserOrg] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    department: '',
    location: '',
    expires_at: '',
    usage_limit: '',
    is_active: true
  });

  useEffect(() => {
    fetchUserOrganization();
    fetchLinks();
  }, [user]);

  const fetchUserOrganization = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, organizations(*)')
      .eq('id', user.id)
      .single();

    if (profile?.organizations) {
      setUserOrg(profile.organizations);
    }
  };

  const fetchLinks = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('organization_links')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error fetching links",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setLinks(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userOrg) return;

    setLoading(true);
    try {
      // Create the link data with empty link_token - the trigger will generate it
      const linkData = {
        organization_id: userOrg.id,
        link_token: '', // Empty string will trigger the database function to generate the token
        name: formData.name,
        description: formData.description,
        department: formData.department,
        location: formData.location,
        is_active: formData.is_active,
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        created_by: user.id
      };

      const { error } = await supabase
        .from('organization_links')
        .insert(linkData);

      if (error) throw error;

      toast({
        title: "Link created successfully!",
        description: "Your new submission link is ready to share.",
      });

      setFormData({
        name: '',
        description: '',
        department: '',
        location: '',
        expires_at: '',
        usage_limit: '',
        is_active: true
      });
      setShowForm(false);
      fetchLinks();
    } catch (error: any) {
      toast({
        title: "Error creating link",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (token: string) => {
    const link = `${window.location.origin}/submit/${userOrg?.domain}/${token}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied!",
      description: "The submission link has been copied to your clipboard.",
    });
  };

  const toggleLinkStatus = async (linkId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('organization_links')
      .update({ is_active: !currentStatus })
      .eq('id', linkId);

    if (error) {
      toast({
        title: "Error updating link",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    fetchLinks();
    toast({
      title: "Link updated",
      description: `Link has been ${!currentStatus ? 'activated' : 'deactivated'}.`,
    });
  };

  if (!userOrg) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Organization Setup Required</CardTitle>
          <CardDescription>
            Please complete your organization setup to generate submission links.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Submission Links</h2>
          <p className="text-gray-600">Generate and manage unique links for report submissions.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Link
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Submission Link</CardTitle>
            <CardDescription>
              Generate a unique link for your workforce to submit reports anonymously.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Link Name *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="HR Department Reports"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Human Resources"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Submit reports related to HR policies and procedures..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="New York Office"
                  />
                </div>
                <div>
                  <Label htmlFor="expires_at">Expiry Date</Label>
                  <Input
                    id="expires_at"
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="usage_limit">Usage Limit</Label>
                  <Input
                    id="usage_limit"
                    type="number"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active (accepting submissions)</Label>
              </div>

              <div className="flex space-x-3">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Link'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {links.map((link) => (
          <Card key={link.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {link.name}
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      link.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {link.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </CardTitle>
                  <CardDescription>{link.description}</CardDescription>
                </div>
                <Switch
                  checked={link.is_active}
                  onCheckedChange={() => toggleLinkStatus(link.id, link.is_active)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <Label className="text-sm font-medium">Submission URL:</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <code className="flex-1 text-sm bg-white p-2 rounded border">
                      {window.location.origin}/submit/{userOrg.domain}/{link.link_token}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyLink(link.link_token)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {link.department && (
                    <div>
                      <Label className="font-medium">Department:</Label>
                      <p className="text-gray-600">{link.department}</p>
                    </div>
                  )}
                  {link.location && (
                    <div>
                      <Label className="font-medium">Location:</Label>
                      <p className="text-gray-600">{link.location}</p>
                    </div>
                  )}
                  <div>
                    <Label className="font-medium">Usage:</Label>
                    <p className="text-gray-600">
                      {link.usage_count}{link.usage_limit ? `/${link.usage_limit}` : ''}
                    </p>
                  </div>
                  {link.expires_at && (
                    <div>
                      <Label className="font-medium">Expires:</Label>
                      <p className="text-gray-600">
                        {new Date(link.expires_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {links.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <ExternalLink className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No submission links yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first submission link to start collecting reports.
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Link
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LinkGenerator;
