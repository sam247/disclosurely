
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
  Copy,
  ExternalLink,
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
  const [submissionLink, setSubmissionLink] = useState<any>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [organization]);

  const fetchData = async () => {
    if (!organization) return;

    try {
      setLoading(true);
      
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

      // Fetch the single submission link
      const { data: links, error: linksError } = await supabase
        .from('organization_links')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (linksError) {
        console.error('Error fetching links:', linksError);
      } else {
        setSubmissionLink(links && links.length > 0 ? links[0] : null);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createSubmissionLink = async () => {
    if (!organization || !user) return;

    try {
      console.log('Creating submission link for organization:', organization.id);

      // Fix: Use proper type casting and let the database trigger handle link_token generation
      const { data, error } = await supabase
        .from('organization_links')
        .insert({
          name: 'Secure Report Submission',
          description: 'Submit reports securely and anonymously',
          created_by: user.id,
          is_active: true,
          organization_id: organization.id
        } as any) // Type assertion to bypass TypeScript issues with auto-generated fields
        .select()
        .single();

      if (error) {
        console.error('Error creating submission link:', error);
        throw error;
      }

      console.log('Created submission link:', data);
      await createAuditLog('created', undefined, { 
        action: 'submission_link_created',
        link_id: data.id 
      });

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
    }
  };

  const copyLink = () => {
    if (!submissionLink) return;
    
    const link = `${window.location.origin}/secure/tool/submit/${submissionLink.link_token}`;
    navigator.clipboard.writeText(link);
    setCopySuccess(true);
    setTimeout(() => {
      setCopySuccess(false);
    }, 2000);
    
    toast({
      title: "Success",
      description: "Submission link copied to clipboard",
    });
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Submission Link</h2>
            </div>
            <p className="text-gray-500 text-sm mb-4">
              Share this link to allow users to submit reports anonymously.
            </p>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : submissionLink ? (
              <Card className="bg-white shadow-md rounded-md overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-medium">{submissionLink.name}</div>
                    <Badge variant="secondary" className="text-green-800 bg-green-100">
                      Active
                    </Badge>
                  </div>
                  <div className="text-gray-500 text-sm mb-3">{submissionLink.description}</div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg mb-3">
                    <div className="text-sm font-medium text-gray-700 mb-1">Submission URL:</div>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 text-sm bg-white p-2 rounded border text-gray-800">
                        {window.location.origin}/secure/tool/submit/{submissionLink.link_token}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={copyLink}
                        className="flex items-center gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        {copySuccess ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Created: {format(new Date(submissionLink.created_at), 'MMM dd, yyyy')}
                    </div>
                    <a 
                      href={`/secure/tool/submit/${submissionLink.link_token}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 text-sm hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Test Link
                    </a>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white shadow-md rounded-md overflow-hidden">
                <CardContent className="text-center py-8">
                  <ExternalLink className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No submission link yet</h3>
                  <p className="text-gray-600 mb-4">
                    Create a submission link to start collecting reports.
                  </p>
                  <Button onClick={createSubmissionLink}>
                    Create Submission Link
                  </Button>
                </CardContent>
              </Card>
            )}
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
