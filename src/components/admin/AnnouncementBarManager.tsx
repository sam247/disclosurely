import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/hooks/useOrganization';
import { supabase } from '@/integrations/supabase/client';
import { 
  Megaphone, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Calendar,
  Save,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Announcement {
  id: string;
  title: string;
  content: string;
  is_active: boolean;
  show_on_frontend: boolean;
  show_on_backend: boolean;
  priority: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export const AnnouncementBarManager: React.FC = () => {
  const { toast } = useToast();
  const { profile } = useOrganization();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_active: false,
    show_on_frontend: true,
    show_on_backend: true,
    priority: 1,
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    fetchAnnouncements();
  }, [profile?.organization_id]);

  const fetchAnnouncements = async () => {
    if (!profile?.organization_id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('announcement_bar')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch announcements.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    console.log('handleSave called');
    console.log('Profile:', profile);
    console.log('Form data:', formData);
    
    if (!profile?.organization_id) {
      console.log('No organization_id found');
      toast({
        title: 'Error',
        description: 'Organization not found. Cannot save announcement.',
        variant: 'destructive',
      });
      return;
    }

    // Validate required fields
    if (!formData.title.trim() || !formData.content.trim()) {
      console.log('Validation failed - missing title or content');
      toast({
        title: 'Error',
        description: 'Please fill in both title and content fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      
      const announcementData = {
        ...formData,
        organization_id: profile.organization_id,
        created_by: profile.id,
        updated_by: profile.id,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
      };

      console.log('Saving announcement:', announcementData);

      if (editingAnnouncement) {
        const { error } = await supabase
          .from('announcement_bar')
          .update(announcementData)
          .eq('id', editingAnnouncement.id);

        if (error) throw error;
        toast({
          title: 'Announcement Updated',
          description: 'The announcement has been updated successfully.',
        });
      } else {
        console.log('Creating new announcement...');
        const { data, error } = await supabase
          .from('announcement_bar')
          .insert(announcementData)
          .select();

        console.log('Insert result:', { data, error });
        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        toast({
          title: 'Announcement Created',
          description: 'The announcement has been created successfully.',
        });
      }

      setShowDialog(false);
      setEditingAnnouncement(null);
      resetForm();
      fetchAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast({
        title: 'Error',
        description: `Failed to save announcement: ${error.message || 'Please try again.'}`,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      is_active: announcement.is_active,
      show_on_frontend: announcement.show_on_frontend,
      show_on_backend: announcement.show_on_backend,
      priority: announcement.priority,
      start_date: announcement.start_date ? announcement.start_date.split('T')[0] : '',
      end_date: announcement.end_date ? announcement.end_date.split('T')[0] : ''
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('announcement_bar')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'Announcement Deleted',
        description: 'The announcement has been deleted successfully.',
      });
      
      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete announcement. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleteId(null);
    }
  };

  const toggleActive = async (announcement: Announcement) => {
    try {
      const { error } = await supabase
        .from('announcement_bar')
        .update({ is_active: !announcement.is_active })
        .eq('id', announcement.id);

      if (error) throw error;
      
      toast({
        title: announcement.is_active ? 'Announcement Deactivated' : 'Announcement Activated',
        description: `The announcement has been ${announcement.is_active ? 'deactivated' : 'activated'}.`,
      });
      
      fetchAnnouncements();
    } catch (error) {
      console.error('Error toggling announcement:', error);
      toast({
        title: 'Error',
        description: 'Failed to update announcement status.',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      is_active: false,
      show_on_frontend: true,
      show_on_backend: true,
      priority: 1,
      start_date: '',
      end_date: ''
    });
  };

  const handleNewAnnouncement = () => {
    setEditingAnnouncement(null);
    resetForm();
    setShowDialog(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isCurrentlyActive = (announcement: Announcement) => {
    if (!announcement.is_active) return false;
    
    const now = new Date();
    const startDate = announcement.start_date ? new Date(announcement.start_date) : null;
    const endDate = announcement.end_date ? new Date(announcement.end_date) : null;
    
    if (startDate && now < startDate) return false;
    if (endDate && now > endDate) return false;
    
    return true;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Announcement Bar</h2>
          <p className="text-gray-600">Manage site-wide announcements and alerts</p>
        </div>
        <Button onClick={handleNewAnnouncement} className="gap-2">
          <Plus className="h-4 w-4" />
          New Announcement
        </Button>
      </div>

      {/* Announcements List */}
      <div className="grid gap-4">
        {announcements.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Megaphone className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No announcements yet</h3>
              <p className="text-gray-600 text-center mb-4">
                Create your first announcement to display important messages to users.
              </p>
              <Button onClick={handleNewAnnouncement} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Announcement
              </Button>
            </CardContent>
          </Card>
        ) : (
          announcements.map((announcement) => (
            <Card key={announcement.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{announcement.title}</CardTitle>
                      <div className="flex gap-1">
                        {isCurrentlyActive(announcement) && (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <Eye className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        )}
                        {announcement.show_on_frontend && (
                          <Badge variant="secondary">Frontend</Badge>
                        )}
                        {announcement.show_on_backend && (
                          <Badge variant="secondary">Backend</Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription className="whitespace-pre-wrap">
                      {announcement.content}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Created {formatDate(announcement.created_at)}
                    </div>
                    <div className="flex items-center gap-1">
                      Priority: {announcement.priority}
                    </div>
                    {announcement.start_date && (
                      <div className="flex items-center gap-1">
                        Starts: {formatDate(announcement.start_date)}
                      </div>
                    )}
                    {announcement.end_date && (
                      <div className="flex items-center gap-1">
                        Ends: {formatDate(announcement.end_date)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(announcement)}
                      className="gap-1"
                    >
                      {announcement.is_active ? (
                        <>
                          <EyeOff className="h-3 w-3" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3" />
                          Activate
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(announcement)}
                      className="gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteId(announcement.id)}
                      className="gap-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
            </DialogTitle>
            <DialogDescription>
              Create or edit an announcement that will be displayed to users.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Announcement title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Announcement content. Use [text](url) format for links."
                rows={4}
              />
              <p className="text-xs text-gray-600">
                Use [text](url) format for links. Example: [Learn more](https://example.com)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                  min="1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date (Optional)</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date (Optional)</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_active">Active</Label>
                  <p className="text-sm text-gray-600">Show this announcement to users</p>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show_on_frontend">Show on Frontend</Label>
                  <p className="text-sm text-gray-600">Display on public pages</p>
                </div>
                <Switch
                  id="show_on_frontend"
                  checked={formData.show_on_frontend}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_on_frontend: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show_on_backend">Show on Backend</Label>
                  <p className="text-sm text-gray-600">Display in dashboard/admin areas</p>
                </div>
                <Switch
                  id="show_on_backend"
                  checked={formData.show_on_backend}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_on_backend: checked }))}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {editingAnnouncement ? 'Update' : 'Create'}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this announcement? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
