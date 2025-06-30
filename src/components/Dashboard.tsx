import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreVertical, Edit, Trash, FileText, User, AlertCircle, Calendar } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';
import { Dialog, DialogHeader, DialogTitle, DialogTrigger, DialogContent, DialogFooter } from "@/components/ui/dialog"
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ReportContentDisplay from '@/components/ReportContentDisplay';
import { DecryptedReport } from '@/types/database';

interface Report {
  id: string;
  title: string;
  status: string;
  tracking_id: string;
  report_type: string;
  encrypted_content: string;
  created_at: string;
  priority: number;
  assigned_to: string | null;
  submitted_by_email: string | null;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchOrganizationId(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (organizationId) {
      fetchReports();
    }
  }, [organizationId]);

  const fetchOrganizationId = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching organization ID:', error);
        toast({
          title: "Error",
          description: "Failed to fetch organization ID",
          variant: "destructive",
        });
        return;
      }

      setOrganizationId(data?.organization_id || null);
    } catch (error) {
      console.error('Error fetching organization ID:', error);
      toast({
        title: "Error",
        description: "Failed to fetch organization ID",
        variant: "destructive",
      });
    }
  };

  const fetchReports = async () => {
    if (!user || !organizationId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          id,
          title,
          status,
          tracking_id,
          report_type,
          encrypted_content,
          created_at,
          priority,
          assigned_to,
          submitted_by_email
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error",
        description: "Failed to fetch reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReportClick = (report: Report) => {
    setSelectedReport(report);
    setIsReportOpen(true);
  };

  const handleCloseReport = () => {
    setIsReportOpen(false);
    setSelectedReport(null);
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!organizationId) {
      toast({
        title: "Error",
        description: "Organization ID not found.",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm("Are you sure you want to delete this report?")) {
      try {
        const { error } = await supabase
          .from('reports')
          .delete()
          .eq('id', reportId)
          .eq('organization_id', organizationId);

        if (error) {
          throw error;
        }

        setReports(reports.filter(report => report.id !== reportId));
        toast({
          title: "Success",
          description: "Report deleted successfully.",
        });
      } catch (error) {
        console.error('Error deleting report:', error);
        toast({
          title: "Error",
          description: "Failed to delete report.",
          variant: "destructive",
        });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in_review': return 'bg-yellow-100 text-yellow-800';
      case 'investigating': return 'bg-orange-100 text-orange-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'text-red-600 font-bold';
      case 2: return 'text-orange-600 font-semibold';
      case 3: return 'text-yellow-600';
      case 4: return 'text-green-600';
      case 5: return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px] w-full">
            <div className="divide-y divide-gray-200">
              {reports.map((report) => (
                <div key={report.id} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => handleReportClick(report)}>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{report.title}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Report ID: {report.tracking_id}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(report.status)}>
                        {formatStatus(report.status)}
                      </Badge>
                      <Badge className={getPriorityColor(report.priority)}>
                        Priority {report.priority}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => console.log('Edit report', report.id)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteReport(report.id)}>
                            <Trash className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
          </DialogHeader>
          {selectedReport && (
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
          )}
          <DialogFooter>
            <Button onClick={handleCloseReport}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
