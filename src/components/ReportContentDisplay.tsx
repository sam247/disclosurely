
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, FileText } from 'lucide-react';

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

  // For organization dashboard users, display the stored content
  // The content is stored as encrypted but we show what's available
  const displayContent = () => {
    // The encryptedContent from the database might be a JSON string or plain text
    // Let's try to parse it and display the actual report data
    try {
      const parsed = JSON.parse(encryptedContent);
      console.log('Parsed report content:', parsed);
      return parsed;
    } catch (error) {
      console.log('Content is not JSON, treating as plain text:', encryptedContent);
      // If it's not JSON, treat as plain text
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
            <h4 className="font-semibold">Report Details:</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowContent(!showContent)}
            >
              {showContent ? (
                <>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Hide Content
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Show Content
                </>
              )}
            </Button>
          </div>
          
          {showContent && (
            <div className="bg-gray-50 p-4 rounded-lg">
              {(() => {
                const content = displayContent();
                console.log('Displaying content:', content);
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
