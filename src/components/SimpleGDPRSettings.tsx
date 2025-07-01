
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useGDPRCompliance } from '@/hooks/useGDPRCompliance';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, Download, UserX, CheckCircle, Clock, Mail } from 'lucide-react';

const SimpleGDPRSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [exportEmail, setExportEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);

  const handleDataExport = async () => {
    if (!exportEmail) return;
    
    setLoading(true);
    try {
      // Trigger automated data export
      const { data, error } = await supabase.functions.invoke('process-gdpr-requests', {
        body: { 
          type: 'export',
          email: exportEmail 
        }
      });

      if (error) throw error;

      toast({
        title: "Data Export Requested",
        description: "Your data export will be processed automatically. You'll receive an email with a download link within a few minutes.",
        duration: 10000,
      });
    } catch (error: any) {
      toast({
        title: "Request Failed",
        description: error.message || "Failed to request data export.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccountDeletion = async () => {
    if (!user) return;

    try {
      // Trigger automated account deletion
      const { data, error } = await supabase.functions.invoke('process-gdpr-requests', {
        body: { 
          type: 'delete_account',
          email: user.email 
        }
      });

      if (error) throw error;

      // Sign out the user
      await supabase.auth.signOut();
      
      toast({
        title: "Account Deletion Initiated",
        description: "Your account will be completely deleted within 24 hours. You will receive a confirmation email.",
        duration: 15000,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to initiate account deletion.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Automated Processing Info */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            Automated Privacy Protection
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Your privacy rights are automatically protected. All requests are processed immediately without manual review.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
              <Download className="h-6 sm:h-8 w-6 sm:w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-green-800 text-sm sm:text-base">Data Export</h4>
              <p className="text-xs sm:text-sm text-green-600">Instant download available</p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-red-50 rounded-lg">
              <UserX className="h-6 sm:h-8 w-6 sm:w-8 text-red-600 mx-auto mb-2" />
              <h4 className="font-medium text-red-800 text-sm sm:text-base">Account Deletion</h4>
              <p className="text-xs sm:text-sm text-red-600">Complete within 24 hours</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Download Your Data</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Get a copy of all your personal data. The export will be generated automatically and sent to your email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="export-email" className="text-sm sm:text-base">Email Address</Label>
            <Input
              id="export-email"
              type="email"
              value={exportEmail}
              onChange={(e) => setExportEmail(e.target.value)}
              placeholder="your-email@example.com"
              className="mt-1"
            />
          </div>
          <Button onClick={handleDataExport} disabled={loading || !exportEmail} className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            {loading ? 'Processing...' : 'Download My Data'}
          </Button>
          <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
            <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>You'll receive an email with your data export within a few minutes. The download link will be valid for 7 days.</p>
          </div>
        </CardContent>
      </Card>

      {/* Account Deletion Section */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600 text-lg sm:text-xl">Delete Account</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Permanently delete your account and all associated data. This action is irreversible and will be completed automatically within 24 hours.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto">
                <UserX className="w-4 h-4 mr-2" />
                Delete My Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-[425px] mx-4">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-lg sm:text-xl">Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-2 text-sm sm:text-base">
                  <p>This will automatically and permanently delete:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-xs sm:text-sm">
                    <li>Your profile and account information</li>
                    <li>All reports and messages you've submitted</li>
                    <li>Any file attachments</li>
                    <li>Your complete account history</li>
                  </ul>
                  <div className="flex items-center gap-2 mt-4 p-3 bg-yellow-50 rounded-lg">
                    <Clock className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                    <p className="text-xs sm:text-sm">Deletion will be completed within 24 hours. You will be signed out immediately.</p>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
                <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleAccountDeletion}
                  className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                >
                  Yes, Delete My Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <div className="mt-4 flex items-start gap-2 text-xs sm:text-sm text-gray-600">
            <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>You'll receive a confirmation email once your account has been completely deleted.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleGDPRSettings;
