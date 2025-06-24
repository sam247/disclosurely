
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, FileText, Lock, Unlock } from 'lucide-react';
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
  const [showContent, setShowContent] = useState(false);
  const [decryptedContent, setDecryptedContent] = useState<any>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const handleDecryptContent = async () => {
    if (!user || decryptedContent) {
      setShowContent(!showContent);
      return;
    }

    setIsDecrypting(true);
    try {
      // Get user's organization ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (profile?.organization_id) {
        const decrypted = decryptReport(encryptedContent, profile.organization_id);
        setDecryptedContent(decrypted);
        setShowContent(true);
      }
    } catch (error) {
      console.error('Error decrypting content:', error);
    } finally {
      setIsDecrypting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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
      case 1: return 'bg-red-100 text-red-800';
      case 2: return 'bg-orange-100 text-orange-800';
      case 3: return 'bg-yellow-100 text-yellow-800';
      case 4: return 'bg-green-100 text-green-800';
      case 5: return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>{title}</span>
            </CardTitle>
            <CardDescription>
              Report ID: {trackingId} • Submitted: {new Date(createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Badge className={getStatusColor(status)}>
              {status.replace('_', ' ').toUpperCase()}
            </Badge>
            <Badge className={getPriorityColor(priority)}>
              Priority {priority}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <Label className="text-gray-600">Report Type</Label>
            <p className="capitalize">{reportType}</p>
          </div>
          <div>
            <Label className="text-gray-600">Status</Label>
            <p className="capitalize">{status.replace('_', ' ')}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold flex items-center space-x-2">
              <span>Report Content:</span>
              {decryptedContent ? (
                <Unlock className="h-4 w-4 text-green-600" />
              ) : (
                <Lock className="h-4 w-4 text-blue-600" />
              )}
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDecryptContent}
              disabled={isDecrypting}
            >
              {isDecrypting ? (
                'Decrypting...'
              ) : showContent ? (
                <>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Hide Content
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  View Content
                </>
              )}
            </Button>
          </div>
          
          {showContent && (
            <div className="bg-gray-50 p-4 rounded-lg">
              {decryptedContent ? (
                <div className="space-y-3">
                  {Object.entries(decryptedContent).map(([key, value]) => (
                    <div key={key}>
                      <Label className="capitalize text-gray-600 font-medium">
                        {key.replace(/([A-Z])/g, ' $1').trim().replace(/_/g, ' ')}:
                      </Label>
                      <p className="mt-1 whitespace-pre-wrap text-sm">
                        {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Unable to decrypt content</p>
                  <p className="text-sm text-gray-500">Please ensure you have proper access permissions</p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportContentDisplay;
