import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Plus, ExternalLink, FileText, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DecryptedReport } from '@/types/database';

interface Report {
  id: string;
  title: string;
  tracking_id: string;
  status: string;
  created_at: string;
  encrypted_content: string;
  encryption_key_hash: string;
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
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [decryptedContent, setDecryptedContent] = useState<DecryptedReport | null>(null);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);

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

      // Fetch reports with encrypted content
      const { data: reportsData } = await supabase
        .from('reports')
        .select('id, title, tracking_id, status, created_at, encrypted_content, encryption_key_hash')
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

  const handleViewReport = async (report: Report) => {
    setSelectedReport(report);
    setIsReportDialogOpen(true);
    setIsDecrypting(true);
    setDecryptedContent(null);

    try {
      // For now, we'll show a placeholder since we don't have the decryption key
      // In a real implementation, you'd need to handle decryption properly
      const mockDecryptedContent: DecryptedReport = {
        id: report.id,
        title: report.title,
        content: "This report content is encrypted. In a production environment, this would show the decrypted content.",
        category: "General",
        incident_date: "",
        location: "",
        people_involved: "",
        evidence_description: ""
      };
      
      setDecryptedContent(mockDecryptedContent);
    } catch (error) {
      console.error('Error viewing report:', error);
      toast({
        title: "Error",
        description: "Failed to decrypt report content",
        variant: "destructive",
      });
    } finally {
      setIsDecrypting(false);
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

      // Generate a unique token
      const generateToken = () => {
        return Math.random().toString(36).substring(2, 14);
      };

      const { data, error } = await supabase
        .from('organization_links')
        .insert({
          organization_id: profile.organization_id,
          name: 'Quick Report Link',
          description: 'Submit reports securely',
          created_by: user.id,
          link_token: generateToken()
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
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <h3 className="font-medium">{report.title}</h3>
                        <p className="text-sm text-gray-600">
                          {report.tracking_id} • {new Date(report.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          report.status === 'new' ? 'bg-blue-100 text-blue-800' :
                          report.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {report.status}
                        </span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewReport(report)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Report Details Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Details: {selectedReport?.tracking_id}</DialogTitle>
            <DialogDescription>
              View submitted report information
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Title</label>
                  <p className="text-sm mt-1">{selectedReport.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <p className="text-sm mt-1 capitalize">{selectedReport.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Tracking ID</label>
                  <p className="text-sm mt-1 font-mono">{selectedReport.tracking_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Submitted</label>
                  <p className="text-sm mt-1">{new Date(selectedReport.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Report Content</label>
                {isDecrypting ? (
                  <div className="mt-2 p-4 border rounded-lg">
                    <div className="animate-pulse">Decrypting report content...</div>
                  </div>
                ) : decryptedContent ? (
                  <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                    <p className="text-sm">{decryptedContent.content}</p>
                  </div>
                ) : (
                  <div className="mt-2 p-4 border rounded-lg">
                    <p className="text-sm text-gray-600">Unable to decrypt content</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
