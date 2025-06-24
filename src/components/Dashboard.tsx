import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Plus, ExternalLink, FileText, Eye, Archive, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DecryptedReport } from '@/types/database';
import ReportMessaging from '@/components/ReportMessaging';
import ReportContentDisplay from '@/components/ReportContentDisplay';

interface Report {
  id: string;
  title: string;
  tracking_id: string;
  status: string;
  created_at: string;
  encrypted_content: string;
  encryption_key_hash: string;
  priority: number;
  report_type: string;
  organizations?: {
    name: string;
  };
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
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

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

      // Fetch reports with encrypted content, exclude archived reports
      const { data: reportsData } = await supabase
        .from('reports')
        .select('id, title, tracking_id, status, created_at, encrypted_content, encryption_key_hash, priority, report_type')
        .eq('organization_id', profile.organization_id)
        .neq('status', 'closed') // Only exclude archived (closed) reports
        .order('created_at', { ascending: false })
        .limit(20);

      // Fetch the single organization link (simplified to one link per org)
      const { data: linksData } = await supabase
        .from('organization_links')
        .select('id, name, link_token, usage_count')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .limit(1);

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
  };

  const handleArchiveReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: 'closed' })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Report archived",
        description: "The report has been moved to closed status",
      });

      fetchData(); // Refresh the data
    } catch (error) {
      console.error('Error archiving report:', error);
      toast({
        title: "Error",
        description: "Failed to archive report",
        variant: "destructive",
      });
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      console.log('Attempting to delete report:', reportId);
      
      // First delete any related messages
      const { error: messagesError } = await supabase
        .from('report_messages')
        .delete()
        .eq('report_id', reportId);

      if (messagesError) {
        console.error('Error deleting messages:', messagesError);
      }

      // Then delete the report
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);

      if (error) {
        console.error('Error deleting report:', error);
        throw error;
      }

      toast({
        title: "Report deleted",
        description: "The report has been permanently deleted",
      });

      // Close dialog if this report was being viewed
      if (selectedReport?.id === reportId) {
        setIsReportDialogOpen(false);
        setSelectedReport(null);
      }

      fetchData(); // Refresh the data
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: "Error",
        description: "Failed to delete report",
        variant: "destructive",
      });
    }
  };

  const createOrGetSubmissionLink = async () => {
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

      // Check if a link already exists
      if (links.length > 0) {
        toast({
          title: "Link already exists",
          description: "Your organization already has a submission link",
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
          name: 'Report Submission Link',
          description: 'Submit reports securely to our organization',
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
                    <p className="text-sm font-medium text-gray-600">Submission Link</p>
                    <p className="text-2xl font-bold text-gray-900">{links.length > 0 ? 'Active' : 'None'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Plus className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <Button onClick={createOrGetSubmissionLink} className="w-full" disabled={links.length > 0}>
                      {links.length > 0 ? 'Link Created' : 'Create Submission Link'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submission Link */}
          {links.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Submission Link</CardTitle>
                <CardDescription>Your organization's secure report submission link</CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          )}

          {/* Recent Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>All report submissions</CardDescription>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No reports submitted yet</p>
                  <p className="text-sm text-gray-500">Reports will appear here once submitted through your link</p>
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
                          report.status === 'in_review' ? 'bg-yellow-100 text-yellow-800' :
                          report.status === 'investigating' ? 'bg-orange-100 text-orange-800' :
                          report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {report.status.replace('_', ' ')}
                        </span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewReport(report)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {report.status !== 'closed' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleArchiveReport(report.id)}
                          >
                            <Archive className="h-4 w-4 mr-1" />
                            Archive
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action will permanently delete the report. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteReport(report.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Details: {selectedReport?.tracking_id}</DialogTitle>
            <DialogDescription>
              View submitted report information and secure messages
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Report Information */}
              <div className="space-y-6">
                <ReportContentDisplay
                  encryptedContent={selectedReport.encrypted_content}
                  title={selectedReport.title}
                  status={selectedReport.status}
                  trackingId={selectedReport.tracking_id}
                  reportType={selectedReport.report_type}
                  createdAt={selectedReport.created_at}
                  priority={selectedReport.priority}
                />
              </div>

              {/* Secure Messaging */}
              <div>
                <ReportMessaging 
                  report={{
                    id: selectedReport.id,
                    title: selectedReport.title,
                    tracking_id: selectedReport.tracking_id,
                    status: selectedReport.status,
                    created_at: selectedReport.created_at,
                    report_type: selectedReport.report_type,
                    encrypted_content: selectedReport.encrypted_content,
                    organizations: selectedReport.organizations || { name: 'Organization' }
                  }}
                  onClose={() => setIsReportDialogOpen(false)}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
