
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useGDPRCompliance } from '@/hooks/useGDPRCompliance';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, Download, Trash2, Clock, CheckCircle, XCircle, AlertCircle, UserX } from 'lucide-react';
import AutomatedGDPRStatus from './AutomatedGDPRStatus';

const GDPRSettings = () => {
  const {
    exportRequests,
    erasureRequests,
    loading,
    createExportRequest,
    createErasureRequest,
    reviewErasureRequest,
  } = useGDPRCompliance();

  const { user } = useAuth();
  const { toast } = useToast();

  const [exportEmail, setExportEmail] = useState('');
  const [exportType, setExportType] = useState<'full_export' | 'report_data' | 'personal_data'>('personal_data');
  const [erasureEmail, setErasureEmail] = useState('');
  const [erasureType, setErasureType] = useState<'full_erasure' | 'anonymize_reports' | 'delete_personal_data'>('delete_personal_data');
  const [erasureReason, setErasureReason] = useState('');

  const handleExportRequest = async () => {
    if (!exportEmail) return;
    await createExportRequest(exportEmail, exportType);
    setExportEmail('');
    toast({
      title: "Export request created successfully",
      description: "Your data export will be processed automatically and you'll receive a notification when ready.",
    });
  };

  const handleErasureRequest = async () => {
    if (!erasureEmail) return;
    await createErasureRequest(erasureEmail, erasureType, erasureReason);
    setErasureEmail('');
    setErasureReason('');
    toast({
      title: "Erasure request created successfully", 
      description: "Your data erasure request will be automatically processed after a 24-hour safety period.",
    });
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      // Create an erasure request for full data deletion
      await createErasureRequest(user.email || '', 'full_erasure', 'Account deletion requested by user');
      
      // Sign out the user
      await supabase.auth.signOut();
      
      toast({
        title: "Account deletion initiated",
        description: "Your account deletion request has been submitted and will be processed automatically within 24 hours.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to initiate account deletion.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      processing: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle },
      reviewing: { color: 'bg-purple-100 text-purple-800', icon: AlertCircle },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Shield className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Privacy & Data Management</h2>
      </div>

      {/* Automated GDPR Status */}
      <AutomatedGDPRStatus />

      {/* Data Export Section */}
      <Card>
        <CardHeader>
          <CardTitle>Request Data Export</CardTitle>
          <CardDescription>
            Request to export your personal data. Exports are processed automatically and you'll receive a download link.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="export-email">Email Address</Label>
              <Input
                id="export-email"
                type="email"
                value={exportEmail}
                onChange={(e) => setExportEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div>
              <Label htmlFor="export-type">Export Type</Label>
              <Select value={exportType} onValueChange={(value: any) => setExportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal_data">Personal Data Only</SelectItem>
                  <SelectItem value="report_data">Reports & Messages</SelectItem>
                  <SelectItem value="full_export">Complete Data Export</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button 
            onClick={handleExportRequest} 
            loading={loading}
            loadingText="Creating..."
            disabled={!exportEmail}
          >
            <Download className="w-4 h-4 mr-2" />
            Create Export Request
          </Button>
        </CardContent>
      </Card>

      {/* Export Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Export Requests</CardTitle>
          <CardDescription>Recent data export requests and their automated processing status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {exportRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No export requests found.</p>
            ) : (
              exportRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{request.email_address}</span>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-sm text-gray-500">
                      {request.request_type.replace('_', ' ')} • {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {request.export_file_url && request.status === 'completed' && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={request.export_file_url} download>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </a>
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Erasure Section */}
      <Card>
        <CardHeader>
          <CardTitle>Request Data Erasure</CardTitle>
          <CardDescription>
            Request deletion of your personal data. Requests are automatically approved after 24 hours for safety.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="erasure-email">Email Address</Label>
              <Input
                id="erasure-email"
                type="email"
                value={erasureEmail}
                onChange={(e) => setErasureEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div>
              <Label htmlFor="erasure-type">Erasure Type</Label>
              <Select value={erasureType} onValueChange={(value: any) => setErasureType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delete_personal_data">Delete Personal Data</SelectItem>
                  <SelectItem value="anonymize_reports">Anonymize Reports</SelectItem>
                  <SelectItem value="full_erasure">Complete Data Erasure</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="erasure-reason">Reason (Optional)</Label>
            <Textarea
              id="erasure-reason"
              value={erasureReason}
              onChange={(e) => setErasureReason(e.target.value)}
              placeholder="Please provide a reason for this erasure request..."
            />
          </div>
          <Button 
            onClick={handleErasureRequest} 
            loading={loading}
            loadingText="Creating..."
            disabled={!erasureEmail}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Create Erasure Request
          </Button>
        </CardContent>
      </Card>

      {/* Erasure Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Erasure Requests</CardTitle>
          <CardDescription>Data erasure requests with automated 24-hour approval process.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {erasureRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No erasure requests found.</p>
            ) : (
              erasureRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{request.email_address}</span>
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-sm text-gray-500">
                        {request.erasure_type.replace('_', ' ')} • {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {request.reason && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium">Reason:</p>
                        <p className="text-sm text-gray-600">{request.reason}</p>
                      </div>
                    </>
                  )}
                  {request.review_notes && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium">Review Notes:</p>
                        <p className="text-sm text-gray-600">{request.review_notes}</p>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Section */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Delete Account</CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data. This process is automated and irreversible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <UserX className="w-4 h-4 mr-2" />
                Delete My Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will automatically delete your account and all associated data within 24 hours including:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Your profile information</li>
                    <li>All reports and messages</li>
                    <li>File attachments</li>
                    <li>Account history</li>
                  </ul>
                  This process is fully automated and cannot be undone. You will be signed out immediately.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Yes, Delete My Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default GDPRSettings;
