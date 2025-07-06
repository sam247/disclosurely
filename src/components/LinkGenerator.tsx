import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Copy, ExternalLink, Plus, Trash2, Eye, EyeOff, Edit3, Check, X } from 'lucide-react';

interface OrganizationLink {
  id: string;
  name: string;
  description: string | null;
  link_token: string;
  is_active: boolean;
  usage_count: number | null;
  usage_limit: number | null;
  expires_at: string | null;
  department: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
}

interface DomainVerification {
  domain: string;
  verified_at: string | null;
}

const LinkGenerator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingLink, setEditingLink] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    department: '',
    location: '',
    usage_limit: '',
    expires_at: '',
    is_active: true
  });

  // Fetch verified custom domains
  const { data: customDomains } = useQuery({
    queryKey: ['custom-domains'],
    queryFn: async () => {
      if (!user) return [];

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) return [];

      const { data: domains } = await supabase
        .from('domain_verifications')
        .select('domain, verified_at')
        .eq('organization_id', profile.organization_id)
        .not('verified_at', 'is', null);

      return domains || [];
    },
    enabled: !!user,
  });

  // Get the primary custom domain (first verified one)
  const primaryCustomDomain = customDomains?.[0]?.domain || null;

  // Fetch links
  const { data: links, isLoading, error } = useQuery({
    queryKey: ['links'],
    queryFn: async () => {
      if (!user) return [];

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) return [];

      const { data: links } = await supabase
        .from('organization_links')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      return links || [];
    },
    enabled: !!user,
  });

  // Create link mutation
  const createLinkMutation = useMutation({
    mutationFn: async (newLink: Omit<OrganizationLink, 'id' | 'link_token' | 'created_at' | 'updated_at' | 'usage_count'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) throw new Error('No organization');

      const { error } = await supabase
        .from('organization_links')
        .insert({
          ...newLink,
          organization_id: profile.organization_id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      toast({
        title: "Success",
        description: "Link created successfully",
      });
      setShowCreateForm(false);
      setFormData({
        name: '',
        description: '',
        department: '',
        location: '',
        usage_limit: '',
        expires_at: '',
        is_active: true
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update link mutation
  const updateLinkMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<OrganizationLink> }) => {
      const { error } = await supabase
        .from('organization_links')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      toast({
        title: "Success",
        description: "Link updated successfully",
      });
      setEditingLink(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete link mutation
  const deleteLinkMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('organization_links')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      toast({
        title: "Success",
        description: "Link deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateLinkUrl = (linkToken: string) => {
    if (primaryCustomDomain) {
      return `https://${primaryCustomDomain}/secure/tool/submit/${linkToken}`;
    }
    return `${window.location.origin}/secure/tool/submit/${linkToken}`;
  };

  const generateStatusUrl = (linkToken: string) => {
    if (primaryCustomDomain) {
      return `https://${primaryCustomDomain}/secure/tool/submit/${linkToken}/status`;
    }
    return `${window.location.origin}/secure/tool/submit/${linkToken}/status`;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${label} copied!`,
      description: "The value has been copied to your clipboard.",
    });
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }

    const newLink = {
      name: formData.name,
      description: formData.description,
      department: formData.department,
      location: formData.location,
      usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
      expires_at: formData.expires_at || null,
      is_active: formData.is_active
    };

    createLinkMutation.mutate(newLink);
  };

  const startEdit = (link: OrganizationLink) => {
    setEditingLink(link.id);
    setFormData({
      name: link.name,
      description: link.description || '',
      department: link.department || '',
      location: link.location || '',
      usage_limit: link.usage_limit ? link.usage_limit.toString() : '',
      expires_at: link.expires_at || '',
      is_active: link.is_active
    });
  };

  const handleSaveEdit = async (id: string) => {
    // Validate form data
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }

    const updates = {
      name: formData.name,
      description: formData.description,
      department: formData.department,
      location: formData.location,
      usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
      expires_at: formData.expires_at || null,
      is_active: formData.is_active
    };

    updateLinkMutation.mutate({ id, updates });
  };

  const handleDeleteLink = (id: string) => {
    deleteLinkMutation.mutate(id);
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return <div className="p-6">Error: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Submission Links</h2>
          <p className="text-muted-foreground">
            Create and manage secure submission links for your organization
            {primaryCustomDomain && (
              <span className="block text-sm text-green-600 mt-1">
                ✓ Using custom domain: {primaryCustomDomain}
              </span>
            )}
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Link
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Submission Link</CardTitle>
            <CardDescription>
              Customize the settings for your new submission link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateLink} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Link Name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the link"
                />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Department (optional)"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Location (optional)"
                />
              </div>
              <div>
                <Label htmlFor="usage_limit">Usage Limit</Label>
                <Input
                  type="number"
                  id="usage_limit"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                  placeholder="Maximum uses (optional)"
                />
              </div>
              <div>
                <Label htmlFor="expires_at">Expiration Date</Label>
                <Input
                  type="date"
                  id="expires_at"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="is_active">Active</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
              <Button type="submit" disabled={createLinkMutation.isPending}>
                {createLinkMutation.isPending ? 'Creating...' : 'Create Link'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {links && links.length > 0 && (
        <div className="grid gap-4">
          {links.map((link) => (
            <Card key={link.id} className={!link.is_active ? 'opacity-60' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {editingLink === link.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="text-lg font-semibold"
                          />
                          <Button size="sm" onClick={() => handleSaveEdit(link.id)}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingLink(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <CardTitle className="text-lg">{link.name}</CardTitle>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEdit(link)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                    
                    {link.description && (
                      <CardDescription className="text-sm">
                        {editingLink === link.id ? (
                          <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={2}
                          />
                        ) : (
                          link.description
                        )}
                      </CardDescription>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={link.is_active ? "default" : "secondary"}>
                      {link.is_active ? "Active" : "Inactive"}
                    </Badge>
                    {primaryCustomDomain && (
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        Custom Domain
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Link URLs */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Submission Link</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={generateLinkUrl(link.link_token)}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(generateLinkUrl(link.link_token), 'Submission link')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(generateLinkUrl(link.link_token), '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status Check Link</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={generateStatusUrl(link.link_token)}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(generateStatusUrl(link.link_token), 'Status check link')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <Label className="text-xs">Usage Count</Label>
                    <p>{link.usage_count || 0}</p>
                  </div>
                  <div>
                    <Label className="text-xs">Usage Limit</Label>
                    <p>{link.usage_limit || 'Unlimited'}</p>
                  </div>
                  <div>
                    <Label className="text-xs">Department</Label>
                    <p>{link.department || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs">Location</Label>
                    <p>{link.location || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs">Created At</Label>
                    <p>{new Date(link.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-xs">Expires At</Label>
                    <p>{link.expires_at ? new Date(link.expires_at).toLocaleDateString() : 'Never'}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteLink(link.id)}
                    disabled={deleteLinkMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => updateLinkMutation.mutate({ id: link.id, updates: { is_active: !link.is_active } })}
                    disabled={updateLinkMutation.isPending}
                  >
                    {link.is_active ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Activate
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LinkGenerator;
