import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, FileText, Calendar, User, AlertCircle } from 'lucide-react';
import { DecryptedReport } from '@/types/database';
import { decryptReport } from '@/utils/encryption';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ReportContentDisplayProps {
  encryptedContent: string;
  title: string;
  status: string;
  trackingId: string;
  reportType: string;
  createdAt: string;
  priority: number;
}

const ReportContentDisplay = ({
  encryptedContent,
  title,
  status,
  trackingId,
  reportType,
  createdAt,
  priority
}: ReportContentDisplayProps) => {
  const { user } = useAuth();
  const [decryptedContent, setDecryptedContent] = useState<DecryptedReport | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptionError, setDecryptionError] = useState<string | null>(null);

  useEffect(() => {
    const attemptDecryption = async () => {
      if (!encryptedContent || !user) {
        console.log('Missing encrypted content or user for decryption');
        return;
      }
      
      setIsDecrypting(true);
      setDecryptionError(null);
      
      try {
        console.log('Starting decryption process for user:', user.email);
        
        // Get user's organization ID
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          throw new Error('Failed to fetch user profile');
        }

        if (!profile?.organization_id) {
          console.error('No organization found for user');
          throw new Error('No organization found');
        }

        console.log('Decrypting for organization:', profile.organization_id);
        const decrypted = decryptReport(encryptedContent, profile.organization_id);
        
        if (!decrypted) {
          throw new Error('Decryption returned null - check encryption key or data format');
        }

        console.log('Successfully decrypted report content');
        setDecryptedContent(decrypted);
      } catch (error) {
        console.error('Decryption failed:', error);
        setDecryptionError(error instanceof Error ? error.message : 'Unable to decrypt report content');
      } finally {
        setIsDecrypting(false);
      }
    };

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

  // Debug information in development
  if (process.env.NODE_ENV === 'development') {
    console.log('ReportContentDisplay Debug:', {
      hasEncryptedContent: !!encryptedContent,
      encryptedContentLength: encryptedContent?.length,
      hasUser: !!user,
      isDecrypting,
      hasDecryptedContent: !!decryptedContent,
      decryptionError
    });
  }

  return (
    <div className="space-y-4">
      {/* Header with basic info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-blue-100 text-blue-800">
            {formatStatus(reportType)}
          </Badge>
          <Badge className={getPriorityColor(priority)}>
            Priority {priority}
          </Badge>
        </div>
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
          <span className="text-gray-600">Type: {formatStatus(reportType)}</span>
        </div>
      </div>

      {/* Report Content - Always Visible */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lock className="h-4 w-4 text-green-600" />
            <span>Report Content</span>
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
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-600 mb-2">{decryptionError}</p>
              <p className="text-sm text-gray-500">
                Contact your administrator if this problem persists.
              </p>
            </div>
          ) : decryptedContent ? (
            <div className="space-y-4">
              {decryptedContent.title && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Title:</h4>
                  <p className="text-gray-700">{decryptedContent.title}</p>
                </div>
              )}
              
              {decryptedContent.content && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description:</h4>
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

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Submission Method:</h4>
                <p className="text-gray-700">Web Form</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No content available or failed to load</p>
              <p className="text-xs text-gray-400 mt-1">
                Check browser console for detailed error information
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportContentDisplay;
