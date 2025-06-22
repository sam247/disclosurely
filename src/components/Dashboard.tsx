
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Plus, ExternalLink, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Report {
  id: string;
  title: string;
  tracking_id: string;
  status: string;
  created_at: string;
}

interface SubmissionLink {
  id: string;
  name: string;
  link_token: string;
  usage_count: number;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [links, setLinks] = useState<SubmissionLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      console.log('Fetching dashboard data for user:', user.email);
      
      // Get user's profile and organization
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        console.log('No organization found for user');
        setLoading(false);
        return;
      }

      // Fetch reports
      const { data: reportsData } = await supabase
        .from('reports')
        .select('id, title, tracking_id, status, created_at')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch links
      const { data: linksData } = await supabase
        .from('organization_links')
        .select('id, name, link_token, usage_count')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .limit(5);

      console.log('Fetched reports:', reportsData?.length || 0);
      console.log('Fetched links:', linksData?.length || 0);

      setReports(reportsData || []);
      setLinks(linksData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createQuickLink = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        toast({
          title: "Setup required",
          description: "Please complete your profile setup first",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('organization_links')
        .insert({
          organization_id: profile.organization_id,
          name: 'Quick Report Link',
          description: 'Submit reports securely',
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Link created!",
        description: "Your submission link is ready to use.",
      });

      fetchData(); // Refresh the data
    } catch (error: any) {
      console.error('Error creating link:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create link",
        variant: "destructive",
      });
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

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.email}</p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 space-y-6">
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Reports</p>
                    <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <ExternalLink className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Links</p>
                    <p className="text-2xl font-bold text-gray-900">{links.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Plus className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <Button onClick={createQuickLink} className="w-full">
                      Create New Link
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submission Links */}
          <Card>
            <CardHeader>
              <CardTitle>Submission Links</CardTitle>
              <CardDescription>Active links for report submissions</CardDescription>
            </CardHeader>
            <CardContent>
              {links.length === 0 ? (
                <div className="text-center py-8">
                  <ExternalLink className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No submission links yet</p>
                  <Button onClick={createQuickLink} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Link
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {links.map((link) => (
                    <div key={link.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{link.name}</h3>
                        <p className="text-sm text-gray-600">Used {link.usage_count} times</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          /secure/tool/submit/{link.link_token}
                        </code>
                        <Button size="sm" onClick={() => copyLink(link.link_token)}>
                          Copy Link
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>Latest report submissions</CardDescription>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No reports submitted yet</p>
                  <p className="text-sm text-gray-500">Reports will appear here once submitted through your links</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{report.title}</h3>
                        <p className="text-sm text-gray-600">
                          {report.tracking_id} • {new Date(report.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        report.status === 'new' ? 'bg-blue-100 text-blue-800' :
                        report.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
