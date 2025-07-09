import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { LogOut, ExternalLink, FileText, Eye, Archive, Trash2, Settings, RotateCcw, MoreVertical, Bot } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ReportMessaging from '@/components/ReportMessaging';
import ReportContentDisplay from '@/components/ReportContentDisplay';
import ReportAttachments from '@/components/ReportAttachments';
import OrganizationSettings from '@/components/OrganizationSettings';
import ReportsManagement from '@/components/ReportsManagement';
import SettingsPanel from '@/components/SettingsPanel';
import AICaseHelper from '@/components/AICaseHelper';
import { useCustomDomain } from '@/hooks/useCustomDomain';

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
  submitted_by_email?: string;
}

interface SubmissionLink {
  id: string;
  name: string;
  link_token: string;
  usage_count: number;
}

interface DomainVerification {
  id: string;
  domain: string;
  verification_type: string;
  verified_at: string | null;
}

const Dashboard = () => {
  const { user, signOut, subscriptionData } = useAuth();
  const { customDomain, organizationId, isCustomDomain, refreshDomainInfo } = useCustomDomain();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [archivedReports, setArchivedReports] = useState<Report[]>([]);
  const [links, setLinks] = useState<SubmissionLink[]>([]);
  const [subdomains, setSubdomains] = useState<DomainVerification[]>([]);
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

  useEffect(() => {
    if (user && !loading) {
      fetchData();
    }
  }, [customDomain, isCustomDomain]);

  // Listen for domain updates
  useEffect(() => {
    const handleDomainUpdate = () => {
      if (refreshDomainInfo) {
        refreshDomainInfo();
      }
      fetchData();
    };

    window.addEventListener('domain-updated', handleDomainUpdate);
    return () => window.removeEventListener('domain-updated', handleDomainUpdate);
  }, [refreshDomainInfo]);

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

      // Fetch active reports - now including submitted_by_email
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

      // Fetch archived reports - now including submitted_by_email
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

      // Fetch subdomains for this organization
      const { data: subdomainsData } = await supabase
        .from('domain_verifications')
        .select('id, domain, verification_type, verified_at')
        .eq('organization_id', profile.organization_id)
        .eq('verification_type', 'SUBDOMAIN')
        .not('verified_at', 'is', null);

      setReports(reportsData || []);
      setArchivedReports(archivedData || []);
      setLinks(linksData || []);
      setSubdomains(subdomainsData || []);
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

  const copyLink = (token: string) => {
    const link = `${window.location.origin}/secure/tool/submit/${token}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied!",
      description: "The submission link has been copied to your clipboard.",
    });
  };

  const copySubdomainLink = (domain: string) => {
    const link = `https://${domain}/secure/tool/submit`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Subdomain link copied!",
      description: "The branded submission link has been copied to your clipboard.",
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
          <div key={report.id} className="border rounded-lg hover:bg-gray-50 transition-colors">
            {/* Mobile Layout */}
            <div className="block md:hidden p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{report.title}</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    {report.tracking_id}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(report.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ml-2 ${
                  report.status === 'new' ? 'bg-blue-100 text-blue-800' :
                  report.status === 'in_review' ? 'bg-yellow-100 text-yellow-800' :
                  report.status === 'investigating' ? 'bg-orange-100 text-orange-800' :
                  report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  report.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {report.status.replace('_', ' ')}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleViewReport(report)}
                  className="flex-1 min-w-0"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" className="px-2">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isArchived ? (
                      <DropdownMenuItem onClick={() => handleUnarchiveReport(report.id)}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Unarchive
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => handleArchiveReport(report.id)}>
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
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
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex items-center justify-between p-4">
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
          </div>
        ))}
      </div>
    )
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <img 
                src="/lovable-uploads/c46ace0e-df58-4119-b5e3-8dcfa075ea2f.png" 
                alt="Disclosurely" 
                className="h-4 sm:h-8 w-auto flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Dashboard</h1>
                <div className="hidden sm:flex sm:flex-row sm:items-center sm:gap-4">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Welcome back, {user?.email}</p>
                  {subscriptionData.subscribed && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      PRO
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)} className="hidden sm:flex">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)} className="sm:hidden">
                <Settings className="h-4 w-4" />
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm" className="hidden sm:flex">
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm" className="sm:hidden">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Tabs defaultValue="cases" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="cases" className="text-xs sm:text-sm">Cases</TabsTrigger>
              <TabsTrigger value="reports" className="text-xs sm:text-sm">Reports</TabsTrigger>
              <TabsTrigger value="ai-help" className="text-xs sm:text-sm flex items-center gap-1">
                <Bot className="h-3 w-3" />
                AI Case Helper
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cases" className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center">
                      <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
                      <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-600">Active Reports</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900">{reports.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center">
                      <Archive className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600 flex-shrink-0" />
                      <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-600">Archived Reports</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900">{archivedReports.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center">
                      <ExternalLink className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
                      <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-600">Quick Report</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900">
                          {subdomains.length > 0 ? 'Branded' : (links.length > 0 ? 'Active' : 'None')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Submission Alert */}
              {!subscriptionData.subscribed && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h3 className="font-medium text-orange-800">Subscription Required</h3>
                        <p className="text-sm text-orange-700">
                          A subscription is required to create submission links and manage reports.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Report Link Section */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl">Quick Report Link</CardTitle>
                  <CardDescription>
                    {subdomains.length > 0 
                      ? 'Your branded submission portal' 
                      : 'Direct link for report submissions'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {subdomains.length > 0 ? (
                    subdomains.map((subdomain) => (
                      <div key={subdomain.id} className="border rounded-lg p-4 bg-green-50 border-green-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-sm sm:text-base text-green-800">Branded Submission Portal</h3>
                            <p className="text-xs sm:text-sm text-green-600">Available at your custom subdomain</p>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <code className="text-xs bg-white px-2 py-1 rounded break-all border">
                              https://{subdomain.domain}/secure/tool/submit
                              {links.length > 0 && `/${links[0].link_token}`}
                            </code>
                            <Button 
                              size="sm" 
                              onClick={() => {
                                const fullUrl = `https://${subdomain.domain}/secure/tool/submit${links.length > 0 ? `/${links[0].link_token}` : ''}`;
                                navigator.clipboard.writeText(fullUrl);
                                toast({
                                  title: "Branded link copied!",
                                  description: "The branded submission link has been copied to your clipboard.",
                                });
                              }} 
                              className="self-start sm:self-auto bg-green-600 hover:bg-green-700"
                            >
                              Copy Link
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : links.length > 0 ? (
                    links.map((link) => (
                      <div key={link.id} className="border rounded-lg p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-sm sm:text-base">{link.name}</h3>
                            <p className="text-xs sm:text-sm text-gray-600">Used {link.usage_count} times</p>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded break-all">
                              /secure/tool/submit/{link.link_token}
                            </code>
                            <Button size="sm" onClick={() => copyLink(link.link_token)} className="self-start sm:self-auto">
                              Copy Link
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <ExternalLink className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No submission link available</p>
                      <p className="text-sm text-gray-500">Contact your administrator to set up a submission link</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Reports List with Toggle */}
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg sm:text-xl">{showArchived ? 'Archived Reports' : 'Active Reports'}</CardTitle>
                      <CardDescription>
                        {showArchived ? 'Previously archived report submissions' : 'Current active report submissions'}
                      </CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowArchived(!showArchived)}
                      size="sm"
                      className="self-start sm:self-auto"
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

            <TabsContent value="ai-help">
              <AICaseHelper />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Report Details Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Report Details: {selectedReport?.tracking_id}</DialogTitle>
            <DialogDescription>
              View submitted report information, attachments, and secure messages
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
                <ReportAttachments reportId={selectedReport.id} />
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

      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;
