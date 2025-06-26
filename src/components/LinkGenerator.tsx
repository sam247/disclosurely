
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Copy, ExternalLink, Plus, AlertTriangle } from 'lucide-react';

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
  const [fetchingLinks, setFetchingLinks] = useState(true);
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
    if (user) {
      fetchLinks();
    }
  }, [user]);

  const fetchLinks = async () => {
    if (!user) return;

    try {
      setFetchingLinks(true);
      console.log('Fetching links for user:', user.email);

      // Get user's profile to find organization
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.organization_id) {
        console.error('Profile error:', profileError);
        setFetchingLinks(false);
        return;
      }

      const { data, error } = await supabase
        .from('organization_links')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching links:', error);
        toast({
          title: "Error fetching links",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      console.log('Fetched links:', data);
      
      // Remove duplicates based on link_token
      const uniqueLinks = data?.reduce((acc: OrganizationLink[], current) => {
        const existingLink = acc.find(link => link.link_token === current.link_token);
        if (!existingLink) {
          acc.push(current);
        }
        return acc;
      }, []) || [];

      console.log('After deduplication:', uniqueLinks.length, 'unique links');
      setLinks(uniqueLinks);
    } catch (error) {
      console.error('Error in fetchLinks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch links",
        variant: "destructive",
      });
    } finally {
      setFetchingLinks(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create links",
        variant: "destructive",
      });
      return;
    }

    // Prevent creating multiple links - enforce single link per organization
    if (links.length > 0) {
      toast({
        title: "Link limit reached",
        description: "Your organization can only have one active submission link",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Creating link for user:', user.email);

      // Get user's profile to find organization
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.organization_id) {
        console.error('Profile error:', profileError);
        toast({
          title: "Profile setup required",
          description: "Please complete your profile setup first",
          variant: "destructive",
        });
        return;
      }

      // Double-check for existing links to prevent duplicates
      const { data: existingLinks } = await supabase
        .from('organization_links')
        .select('id')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true);

      if (existingLinks && existingLinks.length > 0) {
        toast({
          title: "Link already exists",
          description: "Your organization already has an active submission link",
          variant: "destructive",
        });
        setLoading(false);
        fetchLinks(); // Refresh to show existing link
        return;
      }

      // Fix: Create link without organization_id in initial insert, then update separately
      const { data, error } = await supabase
        .from('organization_links')
        .insert({
          name: formData.name,
          description: formData.description,
          department: formData.department,
          location: formData.location,
          is_active: formData.is_active,
          expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
          usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
          created_by: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      // Update with organization_id
      const { error: updateError } = await supabase
        .from('organization_links')
        .update({ organization_id: profile.organization_id })
        .eq('id', data.id);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

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
      console.error('Error creating link:', error);
      toast({
        title: "Error creating link",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (token: string) => {
    const link = `${window.location.origin}/secure/tool/submit/${token}`;
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

  const deleteDuplicateLinks = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) return;

      // Get all links for this organization
      const { data: allLinks } = await supabase
        .from('organization_links')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: true });

      if (!allLinks || allLinks.length <= 1) return;

      // Keep the first link, delete the rest
      const linksToDelete = allLinks.slice(1);
      
      for (const link of linksToDelete) {
        await supabase
          .from('organization_links')
          .delete()
          .eq('id', link.id);
      }

      toast({
        title: "Duplicates removed",
        description: `Removed ${linksToDelete.length} duplicate links`,
      });

      fetchLinks();
    } catch (error) {
      console.error('Error removing duplicates:', error);
    }
  };

  if (fetchingLinks) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Submission Links</h2>
            <p className="text-gray-600">Generate and manage unique links for report submissions.</p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading links...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Submission Links</h2>
          <p className="text-gray-600">Generate and manage unique links for report submissions.</p>
        </div>
        <div className="flex gap-2">
          {links.length > 1 && (
            <Button onClick={deleteDuplicateLinks} variant="outline" className="text-red-600">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Remove Duplicates
            </Button>
          )}
          <Button 
            onClick={() => setShowForm(!showForm)}
            disabled={links.length > 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            {links.length > 0 ? 'One Link Limit' : 'Create New Link'}
          </Button>
        </div>
      </div>

      {/* Show warning if duplicates exist */}
      {links.length > 1 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <p className="text-orange-800">
                Multiple links detected. Organizations should only have one submission link. 
                Click "Remove Duplicates" to clean up.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

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
                      {window.location.origin}/secure/tool/submit/{link.link_token}
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
