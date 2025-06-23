
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Shield, MessageSquare, Copy, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ReportSuccess = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const trackingId = searchParams.get('trackingId');
  const accessKey = searchParams.get('accessKey');

  // Show fallback if no parameters are provided
  if (!trackingId || !accessKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <header className="border-b bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Disclosurely</span>
              </div>
              <Link to="/">
                <Button variant="outline" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Return Home
                </Button>
              </Link>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <Card>
              <CardContent className="p-8">
                <p className="text-gray-600">Report information not found. Please try submitting your report again.</p>
                <Link to="/secure/tool" className="mt-4 inline-block">
                  <Button>Submit New Report</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Disclosurely</span>
            </div>
            <Link to="/">
              <Button variant="outline" size="sm">
                <Home className="h-4 w-4 mr-2" />
                Return Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Report Submitted Successfully
              </h1>
              <p className="text-gray-600 mb-6">
                Your report has been securely encrypted and submitted. Thank you for your courage in speaking up.
              </p>
            </CardContent>
          </Card>

          {/* Important Information */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span>Your Information is Protected</span>
              </CardTitle>
              <CardDescription>
                Your report is completely anonymous and cannot be traced back to you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Your Tracking ID</label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(trackingId, 'Tracking ID')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="font-mono text-lg font-bold text-blue-600">{trackingId}</p>
                  <p className="text-xs text-gray-600 mt-1">Save this ID to check your report status</p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Access Key</label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(accessKey, 'Access Key')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="font-mono text-lg font-bold text-purple-600">{accessKey}</p>
                  <p className="text-xs text-gray-600 mt-1">Keep this key secure for accessing messages</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What Happens Next */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What happens next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <p className="font-medium">Your report will be reviewed</p>
                    <p className="text-sm text-gray-600">The appropriate team will review your report within 2-3 business days.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <p className="font-medium">You can check status anytime</p>
                    <p className="text-sm text-gray-600">Use your tracking ID to check the status of your report.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <p className="font-medium">Secure communication</p>
                    <p className="text-sm text-gray-600">The organization may reach out with questions through secure messaging.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/secure/tool/messages" className="flex-1">
              <Button size="lg" className="w-full">
                <MessageSquare className="mr-2 h-5 w-5" />
                Check Messages & Status
              </Button>
            </Link>
            <Link to="/" className="flex-1">
              <Button size="lg" variant="outline" className="w-full">
                <Home className="mr-2 h-5 w-5" />
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
