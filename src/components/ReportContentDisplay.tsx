
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, FileText, Lock, AlertTriangle } from 'lucide-react';

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
  const [showContent, setShowContent] = useState(false);

  // Check if content is encrypted (this is the expected state for secure reports)
  const isEncrypted = (content: string): boolean => {
    // Check for CryptoJS encrypted format markers
    return content.includes('U2FsdGVk') || 
           (content.length > 50 && /^[A-Za-z0-9+/]+=*$/.test(content));
  };

  const displayContent = () => {
    console.log('Raw content from database:', encryptedContent);
    
    if (isEncrypted(encryptedContent)) {
      console.log('Content is encrypted (as expected for secure reports)');
      return {
        isEncrypted: true,
        message: "Report content is end-to-end encrypted",
        details: "This report was submitted with client-side encryption. Only authorized personnel with the proper decryption key can view the full content.",
        technicalNote: "To decrypt this content, use the decryption key provided to authorized reviewers.",
        encryptedSize: `${Math.round(encryptedContent.length * 0.75)} bytes (estimated original size)`
      };
    }
    
    // If somehow we have unencrypted content, try to parse it
    try {
      const parsed = JSON.parse(encryptedContent);
      console.log('Content appears to be unencrypted JSON:', parsed);
      return parsed;
    } catch (error) {
      console.log('Content is neither encrypted nor valid JSON, treating as plain text');
      return { content: encryptedContent };
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
              <Lock className="h-4 w-4 text-green-600" />
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowContent(!showContent)}
            >
              {showContent ? (
                <>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Hide Details
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Show Details
                </>
              )}
            </Button>
          </div>
          
          {showContent && (
            <div className="bg-gray-50 p-4 rounded-lg">
              {(() => {
                const content = displayContent();
                console.log('Displaying content:', content);
                
                // Handle encrypted content (expected case)
                if (content && typeof content === 'object' && content.isEncrypted) {
                  return (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <Lock className="h-5 w-5 text-green-600 mt-0.5" />
                          <div className="flex-1">
                            <h5 className="font-medium text-green-800 mb-2">{content.message}</h5>
                            <p className="text-green-700 text-sm mb-3">{content.details}</p>
                            
                            <div className="bg-green-100 rounded p-3 text-sm">
                              <div className="flex items-center space-x-2 mb-2">
                                <AlertTriangle className="h-4 w-4 text-green-600" />
                                <span className="font-medium text-green-800">For Authorized Personnel:</span>
                              </div>
                              <p className="text-green-700">{content.technicalNote}</p>
                              <p className="text-green-600 text-xs mt-2">Content size: {content.encryptedSize}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 italic">
                        Note: This security measure protects the confidentiality of sensitive reports. 
                        Contact your system administrator for decryption procedures.
                      </div>
                    </div>
                  );
                }
                
                // Handle unencrypted content (should be rare)
                return (
                  <div className="space-y-2 text-sm">
                    {typeof content === 'object' && content !== null ? (
                      Object.entries(content).map(([key, value]) => (
                        <div key={key}>
                          <Label className="capitalize text-gray-600">
                            {key.replace(/([A-Z])/g, ' $1').trim().replace(/_/g, ' ')}:
                          </Label>
                          <p className="mt-1 whitespace-pre-wrap">
                            {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div>
                        <Label className="text-gray-600">Content:</Label>
                        <p className="mt-1 whitespace-pre-wrap">{String(content)}</p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportContentDisplay;
