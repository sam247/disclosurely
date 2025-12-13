
import SecureMessaging from './security/SecureMessaging';

interface Report {
  id: string;
  title: string;
  tracking_id: string;
  status: string;
  created_at: string;
  report_type: string;
  encrypted_content: string;
  organizations: {
    name: string;
  };
}

interface ReportMessagingProps {
  report: Report;
  onClose: () => void;
}

const ReportMessaging = ({ report, onClose }: ReportMessagingProps) => {
  return <SecureMessaging report={report} onClose={onClose} />;
};

export default ReportMessaging;
