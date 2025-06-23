
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { decryptData } from '@/utils/encryption';
import { Eye, EyeOff, Lock, Unlock, FileText } from 'lucide-react';

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
  const { toast } = useToast();
  const [decryptionKey, setDecryptionKey] = useState('');
  const [decryptedContent, setDecryptedContent] = useState<any>(null);
  const [showContent, setShowContent] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const handleDecrypt = async () => {
    if (!decryptionKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a decryption key",
        variant: "destructive",
      });
      return;
    }

    setIsDecrypting(true);
    try {
      const decrypted = decryptData(encryptedContent, decryptionKey);
      const content = JSON.parse(decrypted);
      setDecryptedContent(content);
      setShowContent(true);
      toast({
        title: "Success",
        description: "Report content decrypted successfully",
      });
    } catch (error) {
      console.error('Decryption error:', error);
      toast({
        title: "Error",
        description: "Invalid decryption key or corrupted data",
        variant: "destructive",
      });
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

        {!showContent ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
              <Lock className="h-4 w-4" />
              <span>Content is encrypted. Enter decryption key to view.</span>
            </div>
            
            <div className="flex space-x-2">
              <Input
                type="password"
                placeholder="Enter decryption key..."
                value={decryptionKey}
                onChange={(e) => setDecryptionKey(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleDecrypt} 
                disabled={isDecrypting || !decryptionKey.trim()}
                size="sm"
              >
                {isDecrypting ? (
                  <>
                    <Lock className="mr-2 h-4 w-4 animate-spin" />
                    Decrypting...
                  </>
                ) : (
                  <>
                    <Unlock className="mr-2 h-4 w-4" />
                    Decrypt
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <Unlock className="h-4 w-4" />
                <span>Content decrypted successfully</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowContent(false)}
              >
                <EyeOff className="mr-2 h-4 w-4" />
                Hide Content
              </Button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Report Details:</h4>
              {decryptedContent && (
                <div className="space-y-2 text-sm">
                  {Object.entries(decryptedContent).map(([key, value]) => (
                    <div key={key}>
                      <Label className="capitalize text-gray-600">{key.replace(/([A-Z])/g, ' $1').trim()}:</Label>
                      <p className="mt-1">{typeof value === 'string' ? value : JSON.stringify(value)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportContentDisplay;
