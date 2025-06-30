import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Plus, ExternalLink, FileText, Eye, Archive, Trash2, CreditCard, Settings, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ReportMessaging from '@/components/ReportMessaging';
import ReportContentDisplay from '@/components/ReportContentDisplay';
import SubscriptionManagement from '@/components/SubscriptionManagement';
import OrganizationSettings from '@/components/OrganizationSettings';
import ReportsManagement from '@/components/ReportsManagement';

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
  submitted_by_email?: string | null;
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
  const { user, signOut, subscriptionData } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [archivedReports, setArchivedReports] = useState<Report[]>([]);
  const [links, setLinks] = useState<SubmissionLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      // Get user's profile and organization
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        setLoading(false);
        return;
      }

      // Fetch active reports
      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select('id, title, tracking_id, status, created_at, encrypted_content, encryption_key_hash, priority, report_type, submitted_by_email')
        .eq('organization_id', profile.organization_id)
        .neq('status', 'closed')
        .order('created_at', { ascending: false })
        .limit(20);

      if (reportsError) {
        console.error('Error fetching reports:', reportsError);
      }

      // Fetch archived reports
      const { data: archivedData, error: archivedError } = await supabase
        .from('reports')
        .select('id, title, tracking_id, status, created_at, encrypted_content, encryption_key_hash, priority, report_type, submitted_by_email')
        .eq('organization_id', profile.organization_id)
        .eq('status', 'closed')
        .order('created_at', { ascending: false })
        .limit(20);

      if (archivedError) {
        console.error('Error fetching archived reports:', archivedError);
      }

      // Fetch the single organization link (simplified to one link per org)
      const { data: linksData } = await supabase
        .from('organization_links')
        .select('id, name, link_token, usage_count')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .limit(1);

      setReports(reportsData || []);
      setArchivedReports(archivedData || []);
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

      if (selectedReport?.id === reportId) {
        setIsReportDialogOpen(false);
        setSelectedReport(null);
      }

      setReports(prevReports => prevReports.filter(report => report.id !== reportId));
      
      setTimeout(() => {
        fetchData();
      }, 1000);
    } catch (error) {
      console.error('Error archiving report:', error);
      toast({
        title: "Error",
        description: "Failed to archive report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUnarchiveReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: 'new' })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Report unarchived",
        description: "The report has been moved back to active status",
      });

      if (selectedReport?.id === reportId) {
        setIsReportDialogOpen(false);
        setSelectedReport(null);
      }

      setArchivedReports(prevReports => prevReports.filter(report => report.id !== reportId));
      
      setTimeout(() => {
        fetchData();
      }, 1000);
    } catch (error) {
      console.error('Error unarchiving report:', error);
      toast({
        title: "Error",
        description: "Failed to unarchive report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      setReports(prevReports => prevReports.filter(report => report.id !== reportId));
      setArchivedReports(prevReports => prevReports.filter(report => report.id !== reportId));

      if (selectedReport?.id === reportId) {
        setIsReportDialogOpen(false);
        setSelectedReport(null);
      }

      await supabase.from('report_messages').delete().eq('report_id', reportId);
      await supabase.from('report_notes').delete().eq('report_id', reportId);
      await supabase.from('notifications').delete().eq('report_id', reportId);

      const { error: reportError } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);

      if (reportError) {
        console.error('Error deleting report:', reportError);
        throw reportError;
      }

      toast({
        title: "Report deleted",
        description: "The report has been permanently deleted",
      });

      setTimeout(() => {
        fetchData();
      }, 1000);
      
    } catch (error) {
      console.error('Error deleting report:', error);
      
      toast({
        title: "Error",
        description: "Failed to delete report. Please try again.",
        variant: "destructive",
      });
      
      setTimeout(() => {
        fetchData();
      }, 500);
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

      if (links.length > 0) {
        toast({
          title: "Link already exists",
          description: "Your organization already has a submission link",
        });
        return;
      }

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

      fetchData();
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

  const renderReportsList = (reportsList: Report[], isArchived = false) => (
    reportsList.length === 0 ? (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No {isArchived ? 'archived ' : ''}reports found</p>
        <p className="text-sm text-gray-500">
          {isArchived ? 'Archived reports will appear here' : 'Reports will appear here once submitted through your link'}
        </p>
      </div>
    ) : (
      <div className="space-y-4">
        {reportsList.map((report) => (
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
                report.status === 'closed' ? 'bg-gray-100 text-gray-800' :
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
              {isArchived ? (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleUnarchiveReport(report.id)}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Unarchive
                </Button>
              ) : (
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
                  <Button size="sm" variant="destructive">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the report 
                      and all associated messages.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleDeleteReport(report.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete Report
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>
    )
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-600">Welcome back, {user?.email}</p>
                {subscriptionData.subscribed && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {subscriptionData.subscription_tier}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                    Organization Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Tabs defaultValue="cases" className="space-y-6">
            <TabsList>
              <TabsTrigger value="cases">Cases</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
            </TabsList>

            <TabsContent value="cases" className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Active Reports</p>
                        <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Archive className="h-8 w-8 text-gray-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Archived Reports</p>
                        <p className="text-2xl font-bold text-gray-900">{archivedReports.length}</p>
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
              </div>

              {/* Subscription Alert */}
              {!subscriptionData.subscribed && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-orange-800">Subscription Required</h3>
                        <p className="text-sm text-orange-700">
                          A subscription is required to create submission links and manage reports.
                        </p>
                      </div>
                      <Button onClick={() => navigate('#subscription')} className="bg-orange-600 hover:bg-orange-700">
                        View Plans
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Create/Manage Link Section */}
              {links.length === 0 ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Plus className="h-8 w-8 text-purple-600" />
                      <div className="ml-4">
                        <Button 
                          onClick={createOrGetSubmissionLink} 
                          className="w-full" 
                          disabled={!subscriptionData.subscribed}
                        >
                          Create Submission Link
                        </Button>
                        {!subscriptionData.subscribed && (
                          <p className="text-xs text-gray-500 mt-2">Subscription required</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
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

              {/* Reports List with Toggle */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{showArchived ? 'Archived Reports' : 'Active Reports'}</CardTitle>
                      <CardDescription>
                        {showArchived ? 'Previously archived report submissions' : 'Current active report submissions'}
                      </CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowArchived(!showArchived)}
                    >
                      {showArchived ? 'Show Active' : 'Show Archived'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {renderReportsList(showArchived ? archivedReports : reports, showArchived)}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <ReportsManagement />
            </TabsContent>

            <TabsContent value="subscription">
              <SubscriptionManagement />
            </TabsContent>
          </Tabs>
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
              <div className="space-y-6">
                <ReportContentDisplay
                  encryptedContent={selectedReport.encrypted_content}
                  title={selectedReport.title}
                  status={selectedReport.status}
                  trackingId={selectedReport.tracking_id}
                  reportType={selectedReport.report_type}
                  createdAt={selectedReport.created_at}
                  priority={selectedReport.priority}
                  submittedByEmail={selectedReport.submitted_by_email}
                />
              </div>
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

      <OrganizationSettings 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;
