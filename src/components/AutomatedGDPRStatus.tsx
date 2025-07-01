
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { RefreshCw, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const AutomatedGDPRStatus = () => {
  const [processing, setProcessing] = useState(false);
  const [lastProcessed, setLastProcessed] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const triggerGDPRProcessing = async () => {
    if (!user) return;
    
    setProcessing(true);
    try {
      console.log('Triggering GDPR request processing...');
      
      const { data, error } = await supabase.functions.invoke('process-gdpr-requests', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      setLastProcessed(new Date().toISOString());
      toast({
        title: "GDPR Processing Triggered",
        description: "All pending GDPR requests are being processed automatically.",
      });
    } catch (error: any) {
      console.error('Error triggering GDPR processing:', error);
      toast({
        title: "Processing Error",
        description: error.message || "Failed to trigger GDPR processing.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const triggerAutoApproval = async () => {
    if (!user) return;
    
    try {
      console.log('Triggering erasure auto-approval...');
      
      const { data, error } = await supabase.functions.invoke('auto-approve-erasure', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Auto-Approval Triggered",
        description: "Eligible erasure requests are being auto-approved.",
      });
    } catch (error: any) {
      console.error('Error triggering auto-approval:', error);
      toast({
        title: "Auto-Approval Error",
        description: error.message || "Failed to trigger auto-approval.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-blue-600" />
          Automated GDPR Processing
        </CardTitle>
        <CardDescription>
          GDPR requests are processed automatically by the system. Manual triggers are available for immediate processing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-medium text-green-800">Data Export</h4>
            <p className="text-sm text-green-600">Automated processing</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-medium text-blue-800">Data Erasure</h4>
            <p className="text-sm text-blue-600">24hr auto-approval</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <AlertCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-medium text-purple-800">Account Deletion</h4>
            <p className="text-sm text-purple-600">Immediate processing</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={triggerGDPRProcessing}
            disabled={processing}
            className="flex-1"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${processing ? 'animate-spin' : ''}`} />
            Process All Requests
          </Button>
          <Button 
            onClick={triggerAutoApproval}
            variant="outline"
            className="flex-1"
          >
            <Clock className="w-4 h-4 mr-2" />
            Auto-Approve Eligible
          </Button>
        </div>

        {lastProcessed && (
          <div className="text-sm text-gray-600 text-center">
            Last processed: {new Date(lastProcessed).toLocaleString()}
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Export requests are processed immediately and generate downloadable files</p>
          <p>• Erasure requests are auto-approved after 24 hours for safety</p>
          <p>• Account deletion requests trigger full data erasure</p>
          <p>• All processes run automatically on a schedule</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AutomatedGDPRStatus;
