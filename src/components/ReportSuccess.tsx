
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Copy, Shield, Eye } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

const ReportSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { trackingId, accessKey } = location.state || {};

  useEffect(() => {
    if (!trackingId || !accessKey) {
      navigate("/secure/tool");
    }
  }, [trackingId, accessKey, navigate]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  if (!trackingId || !accessKey) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">SecureReport</span>
            <span className="text-sm text-gray-500 ml-4">Report Submitted</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader className="text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-2xl text-green-800">Report Submitted Successfully</CardTitle>
              <CardDescription className="text-green-700">
                Your report has been encrypted and securely submitted to the organization. 
                Save the information below to check your report status and communicate securely.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Tracking Information */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-blue-600" />
                <span>Important: Save These Details</span>
              </CardTitle>
              <CardDescription>
                You will need both pieces of information to access your report status and communicate securely.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Tracking ID</label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 p-3 bg-gray-100 rounded-md font-mono text-lg">
                    {trackingId}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(trackingId, "Tracking ID")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Access Key</label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 p-3 bg-gray-100 rounded-md font-mono text-lg">
                    {accessKey}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(accessKey, "Access Key")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-medium text-amber-800 mb-2">⚠️ Important Security Notice</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Keep both the Tracking ID and Access Key secure and private</li>
                  <li>• These are the only way to access your report and communicate securely</li>
                  <li>• We cannot recover these details if you lose them</li>
                  <li>• Do not share these with anyone except trusted individuals</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>What Happens Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Review & Assignment</h4>
                    <p className="text-sm text-gray-600">
                      Your encrypted report will be reviewed and assigned to an appropriate case handler.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Investigation</h4>
                    <p className="text-sm text-gray-600">
                      The case handler will investigate your report while maintaining your privacy and security.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Secure Communication</h4>
                    <p className="text-sm text-gray-600">
                      You can check your report status and communicate securely using your tracking information.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button 
              onClick={() => navigate("/secure/tool/report-status")}
              className="flex-1"
            >
              Check Report Status
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/")}
              className="flex-1"
            >
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportSuccess;
