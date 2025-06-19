import { useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { CheckCircle, Copy, Shield, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ReportSuccess = () => {
  const location = useLocation();
  const { toast } = useToast();
  const { trackingId, isAnonymous, hasPassword } = location.state || {};

  const copyTrackingId = () => {
    if (trackingId) {
      navigator.clipboard.writeText(trackingId);
      toast({
        title: "Tracking ID copied",
        description: "Your tracking ID has been copied to clipboard.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Report Submitted Successfully
            </CardTitle>
            <CardDescription>
              Your report has been securely encrypted and submitted.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {trackingId && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-sm font-medium text-gray-700">Your Tracking ID:</Label>
                <div className="flex items-center justify-between mt-2">
                  <code className="text-lg font-mono bg-white px-3 py-2 rounded border flex-1 mr-2">
                    {trackingId}
                  </code>
                  <Button size="sm" variant="outline" onClick={copyTrackingId}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Save this ID to check your report status or communicate securely.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-gray-900">Your Report is Secure</p>
                  <p className="text-gray-600">
                    {isAnonymous 
                      ? 'Your anonymous report has been encrypted and cannot be traced back to you.'
                      : 'Your confidential report has been encrypted and your identity will be protected.'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-gray-900">What Happens Next</p>
                  <p className="text-gray-600">
                    The appropriate team will review your report and take action as needed. 
                    {!isAnonymous && hasPassword && ' You can check for updates using your tracking ID and password.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              {!isAnonymous && hasPassword ? (
                <Link to="/secure/tool/report-status">
                  <Button className="w-full">
                    Check Report Status
                  </Button>
                </Link>
              ) : (
                <p className="text-center text-sm text-gray-500">
                  Keep your tracking ID safe for future reference.
                </p>
              )}
              
              <div className="mt-3 text-center">
                <Link to="/" className="text-sm text-blue-600 hover:text-blue-500 inline-flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Return to Homepage
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportSuccess;
