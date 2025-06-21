
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Shield, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const ReportSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  
  const { trackingId, isAnonymous, hasPassword } = location.state || {};

  const copyTrackingId = async () => {
    if (trackingId) {
      await navigator.clipboard.writeText(trackingId);
      setCopied(true);
      toast.success('Tracking ID copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!trackingId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Invalid Access</h3>
            <p className="text-gray-600 mb-4">This page can only be accessed after submitting a report.</p>
            <Button onClick={() => navigate('/')}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">Report Submitted Successfully</CardTitle>
          <CardDescription className="text-gray-600">
            Your report has been securely encrypted and submitted. Thank you for your courage in speaking up.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Tracking ID */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-900">Your Tracking ID</h3>
                <p className="text-sm text-blue-700 mt-1">Save this ID to check your report status</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyTrackingId}
                className="ml-4"
              >
                {copied ? 'Copied!' : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="mt-3 p-3 bg-white rounded border font-mono text-lg text-center">
              {trackingId}
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-green-900">Your Information is Protected</h3>
                <p className="text-sm text-green-700 mt-1">
                  {isAnonymous 
                    ? "Your report is completely anonymous and cannot be traced back to you."
                    : "Your identity is kept confidential and will only be known to authorized personnel."
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">What happens next?</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">1</div>
                <p>Your report will be reviewed by the appropriate team within 2-3 business days.</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">2</div>
                <p>You can check the status of your report anytime using your tracking ID.</p>
              </div>
              {!isAnonymous && hasPassword && (
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">3</div>
                  <p>You may receive secure communications regarding your report through our messaging system.</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={() => navigate(`/secure/status/${trackingId}`)}
              className="flex-1"
            >
              Check Report Status
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="flex-1"
            >
              Return Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportSuccess;
