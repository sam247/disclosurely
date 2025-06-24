
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Copy, Shield, Clock, MessageSquare, Home } from 'lucide-react';
import { toast } from 'sonner';

const ReportSuccess = () => {
  const [searchParams] = useSearchParams();
  const [trackingId, setTrackingId] = useState<string>('');

  useEffect(() => {
    const id = searchParams.get('trackingId');
    if (id) {
      setTrackingId(id);
    }
  }, [searchParams]);

  const copyTrackingId = () => {
    navigator.clipboard.writeText(trackingId);
    toast.success('Tracking ID copied to clipboard!');
  };

  if (!trackingId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">No tracking information found.</p>
            <Link to="/">
              <Button className="mt-4">
                <Home className="h-4 w-4 mr-2" />
                Return Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Disclosurely</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-800">Report Submitted Successfully</CardTitle>
              <CardDescription className="text-green-700">
                Your report has been securely encrypted and submitted. Thank you for your courage in speaking up.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Security Information */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span>Your Information is Protected</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Your report is completely anonymous and cannot be traced back to you.
              </p>

              {/* Tracking ID */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800 mb-1">Your Tracking ID</p>
                    <p className="text-2xl font-mono font-bold text-blue-900">{trackingId}</p>
                    <p className="text-sm text-blue-600 mt-1">Save this ID to check your report status</p>
                  </div>
                  <Button onClick={copyTrackingId} variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What Happens Next */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What happens next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Your report will be reviewed</h4>
                  <p className="text-sm text-gray-600">The appropriate team will review your report within 2-3 business days.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">You can check status anytime</h4>
                  <p className="text-sm text-gray-600">Use your tracking ID to check the status of your report.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Secure communication</h4>
                  <p className="text-sm text-gray-600">The organization may reach out with questions through secure messaging.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/secure/tool/messages" className="flex-1">
              <Button className="w-full" size="lg">
                <MessageSquare className="h-5 w-5 mr-2" />
                Check Messages & Status
              </Button>
            </Link>
            <Link to="/" className="flex-1">
              <Button variant="outline" className="w-full" size="lg">
                <Home className="h-5 w-5 mr-2" />
                Return Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportSuccess;
