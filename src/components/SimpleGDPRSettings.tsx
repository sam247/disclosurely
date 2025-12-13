
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, Download, UserX, CheckCircle, Clock, Mail, Trash2, AlertTriangle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const SimpleGDPRSettings = () => {
  const { user, subscriptionData } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [deleteAccountConfirm, setDeleteAccountConfirm] = useState(false);

  const handleDataExport = async () => {
    if (!user?.email) {
      toast({
        title: "Authentication Required",
        description: "Please log in to request a data export.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      // Get session token for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      // Trigger automated data export with authentication
      const { data, error } = await supabase.functions.invoke('process-gdpr-requests', {
        body: { 
          type: 'export',
          email: user.email 
        },
        headers: session?.access_token ? {
          Authorization: `Bearer ${session.access_token}`
        } : undefined
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
    if (!user || !deleteAccountConfirm) return;

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('process-gdpr-requests', {
        body: { 
          type: 'delete_account',
          email: user.email 
        },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        }
      });

      if (error) throw error;

      toast({
        title: "Account Deletion Initiated",
        description: "You will be logged out. Your account and ALL data will be permanently deleted within 24 hours.",
        duration: 15000,
      });

      // Sign out after short delay
      setTimeout(async () => {
        await supabase.auth.signOut();
      }, 2000);
      
    } catch (error: any) {
      const errorMessage = error.message || "Failed to initiate account deletion.";
      const isSubscriptionError = errorMessage.includes('active subscription');
      
      toast({
        title: isSubscriptionError ? "Subscription Active" : "Error",
        description: isSubscriptionError 
          ? "Please cancel your subscription first before deleting your account. You can cancel from the Billing section."
          : errorMessage,
        variant: "destructive",
        duration: isSubscriptionError ? 10000 : 5000,
      });
    } finally {
      setLoading(false);
      setDeleteAccountConfirm(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Data Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Download className="h-5 w-5 text-green-600" />
            Download Your Data
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Get a copy of all your personal data. The export will be generated automatically and sent to your email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleDataExport} 
            loading={loading}
            loadingText="Processing..."
            disabled={!user?.email} 
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Download My Data
          </Button>
          <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
            <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>You'll receive an email with your data export within a few minutes. The download link will be valid for 7 days.</p>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone - Data Deletion */}
      <Card className="border-orange-200 bg-orange-50/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-orange-600 text-lg sm:text-xl">Danger Zone</CardTitle>
          </div>
          <CardDescription className="text-sm sm:text-base">
            Irreversible actions that permanently affect your data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Delete Account Completely */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <UserX className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-base sm:text-lg text-red-600">Delete My Account Permanently</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Permanently delete your account and ALL associated data. This is irreversible.
                </p>
                {subscriptionData && (subscriptionData.subscribed || subscriptionData.subscription_status === 'active' || subscriptionData.subscription_status === 'trialing') && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-medium text-yellow-900">
                      ⚠️ Active Subscription Required
                    </p>
                    <p className="text-xs text-yellow-800 mt-1">
                      You must cancel your subscription first before deleting your account. Please cancel from the Billing section.
                    </p>
                  </div>
                )}
                <ul className="list-disc list-inside mt-2 text-xs sm:text-sm text-muted-foreground space-y-1">
                  <li>Your account will be deleted (cannot log in)</li>
                  <li>All reports, messages, and files will be deleted</li>
                  <li>All personal information will be erased</li>
                  <li>Audit logs will be anonymized for compliance</li>
                  <li>Storage files will be permanently deleted</li>
                  <li>Cannot be recovered after deletion</li>
                </ul>
              </div>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <UserX className="w-4 h-4 mr-2" />
                  Delete My Account Permanently
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="sm:max-w-[500px] mx-4">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-5 h-5" />
                    Delete Account Permanently?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-3 text-sm">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="font-semibold text-red-900">⚠️ CRITICAL WARNING</p>
                      <p className="text-red-800 mt-1">This action CANNOT be undone. All your data will be permanently destroyed.</p>
                    </div>
                    
                    <p className="font-medium">This will permanently delete:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Your account and login credentials</li>
                      <li>All reports and messages you created</li>
                      <li>All file attachments and documents</li>
                      <li>Your profile and personal information</li>
                      <li>All notifications and activity history</li>
                      <li>Everything else associated with your account</li>
                    </ul>
                    
                    <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg mt-4">
                      <Clock className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs">You will be logged out immediately. Deletion completes within 24 hours.</p>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-4">
                      <Checkbox 
                        id="delete-account-confirm" 
                        checked={deleteAccountConfirm}
                        onCheckedChange={(checked) => setDeleteAccountConfirm(checked as boolean)}
                      />
                      <Label htmlFor="delete-account-confirm" className="text-sm cursor-pointer">
                        I understand this will permanently delete everything
                      </Label>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
                  <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                  <Button
                    onClick={handleAccountDeletion}
                    disabled={!deleteAccountConfirm || loading || (subscriptionData && (subscriptionData.subscribed || subscriptionData.subscription_status === 'active' || subscriptionData.subscription_status === 'trialing'))}
                    className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                  >
                    {loading ? 'Processing...' : 'Yes, Delete Everything'}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleGDPRSettings;
