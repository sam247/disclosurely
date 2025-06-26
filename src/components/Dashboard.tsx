import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { useAuditLog } from '@/hooks/useAuditLog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Users, 
  Clock, 
  CheckCircle, 
  Plus, 
  ExternalLink, 
  Copy,
  Trash2,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import ReportsManagement from './ReportsManagement';
import AuditTrailManagement from './AuditTrailManagement';
import UserManagement from './UserManagement';
import SubscriptionManagement from './SubscriptionManagement';

interface DashboardCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  description?: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { organization, profile } = useOrganization();
  const { createAuditLog } = useAuditLog();
  const { toast } = useToast();

  const [reportCount, setReportCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [newReportCount, setNewReportCount] = useState(0);
  const [overdueReportCount, setOverdueReportCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'reports' | 'audit' | 'users' | 'subscription'>('reports');
  const [submissionLinks, setSubmissionLinks] = useState<any[]>([]);
  const [creatingLink, setCreatingLink] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, [organization]);

  const fetchData = async () => {
    if (!organization) return;

    try {
      // Fetch report counts
      const { data: reports, error: reportsError } = await supabase
        .from('reports')
        .select('*', { count: 'exact' })
        .eq('organization_id', organization.id);

      if (reportsError) throw reportsError;
      setReportCount(reports.length);

      // Fetch user counts
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('organization_id', organization.id);

      if (usersError) throw usersError;
      setUserCount(users.length);

      // Fetch new report counts
      const { data: newReports, error: newReportsError } = await supabase
        .from('reports')
        .select('*', { count: 'exact' })
        .eq('organization_id', organization.id)
        .eq('status', 'new');

      if (newReportsError) throw newReportsError;
      setNewReportCount(newReports.length);

      // Fetch overdue report counts
      const { data: overdueReports, error: overdueReportsError } = await supabase
        .from('reports')
        .select('*', { count: 'exact' })
        .eq('organization_id', organization.id)
        .lt('due_date', new Date().toISOString());

      if (overdueReportsError) throw overdueReportsError;
      setOverdueReportCount(overdueReports.length);

       // Fetch submission links
       const { data: links, error: linksError } = await supabase
       .from('organization_links')
       .select('*')
       .eq('organization_id', organization.id);

     if (linksError) throw linksError;
     setSubmissionLinks(links || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    }
  };

  const createSubmissionLink = async () => {
    if (!organization || !user) return;

    try {
      setCreatingLink(true);

      // Create audit log for link creation
      await createAuditLog('created', undefined, { 
        action: 'submission_link_created',
        created_by: user.id 
      });

      const { data, error } = await supabase
        .from('organization_links')
        .insert({
          name: 'Quick Report Link',
          description: 'General purpose submission link',
          created_by: user.id,
        } as any);

      if (error) throw error;

      await fetchData();
      toast({
        title: "Success",
        description: "Submission link created successfully",
      });
    } catch (error) {
      console.error('Error creating submission link:', error);
      toast({
        title: "Error",
        description: "Failed to create submission link",
        variant: "destructive",
      });
    } finally {
      setCreatingLink(false);
    }
  };

  const copyLink = (linkId: string) => {
    const link = `${window.location.origin}/secure/tool/submit/${linkId}`;
    navigator.clipboard.writeText(link);
    setCopySuccess(true);
    setTimeout(() => {
      setCopySuccess(false);
    }, 2000);
  };

  const deleteLink = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from('organization_links')
        .delete()
        .eq('id', linkId);

      if (error) throw error;

      await fetchData();
      toast({
        title: "Success",
        description: "Submission link deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting submission link:', error);
      toast({
        title: "Error",
        description: "Failed to delete submission link",
        variant: "destructive",
      });
    }
  };

  const dashboardCards: DashboardCardProps[] = [
    {
      title: 'Total Reports',
      value: reportCount,
      icon: <FileText className="h-5 w-5 text-white" />,
      color: 'bg-blue-500',
      description: 'Total number of reports submitted'
    },
    {
      title: 'Total Users',
      value: userCount,
      icon: <Users className="h-5 w-5 text-white" />,
      color: 'bg-green-500',
      description: 'Total number of users in your organization'
    },
    {
      title: 'New Reports',
      value: newReportCount,
      icon: <Clock className="h-5 w-5 text-white" />,
      color: 'bg-yellow-500',
      description: 'Number of new reports awaiting review'
    },
    {
      title: 'Overdue Reports',
      value: overdueReportCount,
      icon: <CheckCircle className="h-5 w-5 text-white" />,
      color: 'bg-red-500',
      description: 'Number of reports past their due date'
    },
  ];

  if (!organization || !profile) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            Welcome to your Dashboard, {user?.email}
          </CardTitle>
          <CardDescription>
            Here's an overview of your organization's whistleblower platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {dashboardCards.map((card, index) => (
              <Card key={index} className="bg-white shadow-md rounded-md overflow-hidden">
                <div className={`p-4 flex items-center ${card.color}`}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4">
                    {card.icon}
                  </div>
                  <div>
                    <div className="text-white text-lg font-bold">{card.value}</div>
                    <div className="text-white text-sm">{card.title}</div>
                  </div>
                </div>
                {card.description && (
                  <div className="p-4 text-gray-600 text-sm">
                    {card.description}
                  </div>
                )}
              </Card>
            ))}
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Submission Links</h2>
              <Button onClick={createSubmissionLink} disabled={creatingLink}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Link
              </Button>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              Share these links to allow users to submit reports anonymously.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {submissionLinks.map(link => (
                <Card key={link.id} className="bg-white shadow-md rounded-md overflow-hidden">
                  <CardContent className="flex flex-col">
                    <div className="font-medium">{link.name}</div>
                    <div className="text-gray-500 text-sm">{link.description}</div>
                    <div className="flex items-center justify-between mt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => copyLink(link.id)}
                        disabled={copySuccess}
                      >
                        {copySuccess ? <CheckCircle className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                        {copySuccess ? 'Copied!' : 'Copy Link'}
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => deleteLink(link.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                    <a 
                      href={`/secure/tool/submit/${link.id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 text-sm mt-2 hover:underline"
                    >
                      <ExternalLink className="h-4 w-4 mr-1 inline-block" />
                      Preview Link
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="border rounded-md bg-gray-50">
            <nav className="flex space-x-2 p-4">
              <Button 
                variant={activeTab === 'reports' ? 'default' : 'outline'}
                onClick={() => setActiveTab('reports')}
              >
                Reports
              </Button>
              <Button 
                variant={activeTab === 'audit' ? 'default' : 'outline'}
                onClick={() => setActiveTab('audit')}
              >
                Audit Trail
              </Button>
              <Button 
                variant={activeTab === 'users' ? 'default' : 'outline'}
                onClick={() => setActiveTab('users')}
              >
                User Management
              </Button>
              {profile?.role === 'org_admin' && (
                <Button 
                  variant={activeTab === 'subscription' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('subscription')}
                >
                  Subscription
                </Button>
              )}
            </nav>

            <div className="p-4">
              {activeTab === 'reports' && <ReportsManagement />}
              {activeTab === 'audit' && <AuditTrailManagement />}
              {activeTab === 'users' && <UserManagement />}
              {activeTab === 'subscription' && <SubscriptionManagement />}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
