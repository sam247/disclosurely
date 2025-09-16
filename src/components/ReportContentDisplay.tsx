import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Lock, FileText, Calendar, User, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DecryptedReport } from '@/types/database';
import { decryptReport } from '@/utils/encryption';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CompactReportAttachments from './CompactReportAttachments';

interface ReportContentDisplayProps {
  encryptedContent: string;
  title: string;
  status: string;
  trackingId: string;
  reportType: string;
  createdAt: string;
  priority: number;
  submittedByEmail?: string;
  reportId?: string;
}

const ReportContentDisplay = ({
  encryptedContent,
  title,
  status,
  trackingId,
  reportType,
  createdAt,
  priority,
  submittedByEmail,
  reportId
}: ReportContentDisplayProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [decryptedContent, setDecryptedContent] = useState<any | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptionError, setDecryptionError] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const attemptDecryption = async () => {
    if (!encryptedContent || !user) {
      console.log('Missing encrypted content or user for decryption');
      return;
    }
    
    setIsDecrypting(true);
    setDecryptionError(null);
    
    try {
      console.log('=== STARTING DECRYPTION PROCESS ===');
      console.log('User:', user.email);
      console.log('Encrypted content available:', !!encryptedContent);
      console.log('Encrypted content length:', encryptedContent?.length);
      
      // Get user's organization ID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        throw new Error('Failed to fetch user profile: ' + profileError.message);
      }

      if (!profile?.organization_id) {
        console.error('No organization found for user');
        throw new Error('User is not associated with any organization');
      }

      console.log('User organization ID:', profile.organization_id);
      setOrganizationId(profile.organization_id);

      // Attempt to decrypt the report
      const decrypted = decryptReport(encryptedContent, profile.organization_id);
      
      console.log('Successfully decrypted report content');
      console.log('Decrypted data:', decrypted);
      setDecryptedContent(decrypted);
      setRetryCount(0);
      
      toast({
        title: "Content Loaded",
        description: "Report content has been successfully decrypted and loaded.",
      });
      
    } catch (error) {
      console.error('Decryption process failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown decryption error';
      setDecryptionError(errorMessage);
      
      toast({
        title: "Decryption Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    attemptDecryption();
  };

  useEffect(() => {
    attemptDecryption();
  }, [encryptedContent, user]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in_review': return 'bg-yellow-100 text-yellow-800';
      case 'investigating': return 'bg-orange-100 text-orange-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'text-red-600 font-bold';
      case 2: return 'text-orange-600 font-semibold';
      case 3: return 'text-yellow-600';
      case 4: return 'text-green-600';
      case 5: return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="space-y-4">
      {/* Header with basic info */}
      <div className="flex items-center space-x-3">
        <FileText className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>

      {/* Meta information */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">Report ID: {trackingId}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">
            Submitted: {new Date(createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-gray-400" />
          <Badge className={getStatusColor(status)}>
            {formatStatus(status)}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">Type: Anonymous</span>
        </div>
      </div>

      {/* Report Content with Scroll Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Lock className="h-4 w-4 text-green-600" />
              <span>Report Content</span>
            </div>
            {decryptionError && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                disabled={isDecrypting}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isDecrypting ? 'animate-spin' : ''}`} />
                Retry ({retryCount})
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isDecrypting ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Decrypting content...</span>
            </div>
          ) : decryptionError ? (
            <div className="text-center py-8">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-red-600 mb-2">Content Unavailable</h4>
              <p className="text-red-600 mb-4">{decryptionError}</p>
              <div className="text-sm text-gray-500 space-y-2">
                <p><strong>Debug Information:</strong></p>
                <div className="bg-gray-100 p-3 rounded text-left font-mono text-xs">
                  <p>• User ID: {user?.id?.substring(0, 8)}...</p>
                  <p>• Organization ID: {organizationId?.substring(0, 8) || 'Not found'}...</p>
                  <p>• Encrypted Data: {encryptedContent ? 'Present' : 'Missing'}</p>
                  <p>• Data Length: {encryptedContent?.length || 0} characters</p>
                  <p>• Retry Count: {retryCount}</p>
                </div>
                <p className="mt-4 text-gray-600">
                  If this error persists after retrying, please contact your administrator.
                  The report data may have been encrypted with a different key or may be corrupted.
                </p>
              </div>
            </div>
          ) : decryptedContent ? (
            <ScrollArea className="h-80 w-full pr-4">
              <div className="space-y-4">
                {/* Display the actual decrypted title */}
                {decryptedContent.title && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Report Title:</h4>
                    <p className="text-gray-700">{decryptedContent.title}</p>
                  </div>
                )}
                
                {/* Map 'description' field to content display */}
                {decryptedContent.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description:</h4>
                    <div className="text-gray-700 whitespace-pre-wrap">
                      {decryptedContent.description}
                    </div>
                  </div>
                )}

                {/* Handle content field as fallback */}
                {decryptedContent.content && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Content:</h4>
                    <div className="text-gray-700 whitespace-pre-wrap">
                      {decryptedContent.content}
                    </div>
                  </div>
                )}

                {decryptedContent.category && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Category:</h4>
                    <p className="text-gray-700">{decryptedContent.category}</p>
                  </div>
                )}

                {decryptedContent.incident_date && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Incident Date:</h4>
                    <p className="text-gray-700">{decryptedContent.incident_date}</p>
                  </div>
                )}

                {decryptedContent.location && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Location:</h4>
                    <p className="text-gray-700">{decryptedContent.location}</p>
                  </div>
                )}

                {decryptedContent.people_involved && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">People Involved:</h4>
                    <p className="text-gray-700">{decryptedContent.people_involved}</p>
                  </div>
                )}

                {decryptedContent.evidence_description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Evidence Description:</h4>
                    <p className="text-gray-700">{decryptedContent.evidence_description}</p>
                  </div>
                )}

                {/* Display submission method from decrypted data */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Submission Method:</h4>
                  <p className="text-gray-700">
                    {decryptedContent.submission_method || 'Web Form'}
                  </p>
                </div>
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No content available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportContentDisplay;
