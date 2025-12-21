import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import ReportContentDisplay from '@/components/ReportContentDisplay';
import ReportAttachments from '@/components/ReportAttachments';
import ReportMessaging from '@/components/ReportMessaging';
import { decryptReport } from '@/utils/encryption';
import { useOrganization } from '@/hooks/useOrganization';

interface Report {
  id: string;
  title: string;
  tracking_id: string;
  status: string;
  created_at: string;
  report_type: string;
  encrypted_content: string;
  encryption_key_hash: string;
  priority: number;
  submitted_by_email?: string;
  assigned_to?: string;
  incident_date?: string | null;
  location?: string | null;
  witnesses?: string | null;
  previous_reports?: boolean | null;
  additional_notes?: string | null;
}

const ReportDetails = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { organization } = useOrganization();
  const { toast } = useToast();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Navigation lock to prevent gesture racing
  const isNavigatingRef = useRef(false);

  useEffect(() => {
    if (reportId) {
      fetchReport();
    }
  }, [reportId]);

  const fetchReport = async () => {
    if (!reportId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (error) throw error;

      if (data) {
        setReport(data as Report);
        
        // Automatically change status from 'new' to 'new' when first viewed (mobile page)
        if (data.status === 'new') {
          try {
            const { error: updateError } = await supabase
              .from('reports')
              .update({ 
                status: 'new',
                first_read_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('id', reportId);
            
            if (updateError) {
              // Error updating report status
            }
          } catch (updateError) {
            // Error updating report status
          }
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load report details',
        variant: 'destructive',
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-gray-500 mb-4">Report not found</p>
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            // Prevent rapid navigation (gesture racing protection)
            if (isNavigatingRef.current) {
              return;
            }
            isNavigatingRef.current = true;
            navigate('/dashboard');
            // Release lock after navigation completes
            setTimeout(() => {
              isNavigatingRef.current = false;
            }, 500);
          }}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold truncate">{report.title}</h1>
          <p className="text-xs text-muted-foreground font-mono">{report.tracking_id}</p>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <ReportContentDisplay 
          encryptedContent={report.encrypted_content}
          title={report.title}
          status={report.status}
          trackingId={report.tracking_id}
          reportType={report.report_type}
          createdAt={report.created_at}
          priority={report.priority}
          submittedByEmail={report.submitted_by_email}
          reportId={report.id}
          incidentDate={report.incident_date}
          location={report.location}
          witnesses={report.witnesses}
          previousReports={report.previous_reports}
          additionalNotes={report.additional_notes}
        />
        <ReportAttachments reportId={report.id} />
        <ReportMessaging 
          report={{
            ...report,
            organizations: { name: organization?.name || '' }
          }} 
          onClose={() => navigate('/dashboard')}
        />
      </div>
    </div>
  );
};

export default ReportDetails;

