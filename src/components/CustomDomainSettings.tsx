import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Copy, CheckCircle, AlertCircle, RefreshCw, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DNSRecord {
  type: string;
  name: string;
  value: string;
  ttl?: number;
}

interface VerificationResult {
  success: boolean;
  message: string;
  records?: DNSRecord[];
}

const CustomDomainSettings = () => {
  const [domain, setDomain] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [copiedRecord, setCopiedRecord] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerateRecords = async () => {
    if (!domain.trim()) {
      toast({
        title: "Domain Required",
        description: "Please enter a domain name",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setRecords([]);
    setVerificationResult(null);

    try {
      // Call our simple Edge Function to generate verification records
      const { data: { session } } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('simple-domain', {
        body: { 
          action: 'generate',
          domain: domain.trim() 
        }
      });

      if (response.error) {
        throw response.error;
      }

      const result = response.data;

      if (result.success) {
        setRecords(result.records);
        toast({
          title: "Verification Records Generated",
          description: "Add these DNS records to your domain provider",
        });
      } else {
        toast({
          title: "Generation Failed",
          description: result.message || "Failed to generate verification records",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error generating records:', error);
      toast({
        title: "Error",
        description: "Failed to generate verification records",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVerify = async () => {
    if (!domain.trim()) {
      toast({
        title: "Domain Required",
        description: "Please enter a domain name",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const response = await supabase.functions.invoke('simple-domain', {
        body: { 
          action: 'verify',
          domain: domain.trim() 
        }
      });

      if (response.error) {
        throw response.error;
      }

      const result = response.data;
      setVerificationResult(result);

      if (result.success) {
        toast({
          title: "Verification Successful",
          description: "Your domain is ready to use!",
        });
      } else {
        toast({
          title: "Verification Failed",
          description: result.message || "Domain verification failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error verifying domain:', error);
      toast({
        title: "Error",
        description: "Failed to verify domain",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = async (text: string, recordType: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedRecord(recordType);
      setTimeout(() => setCopiedRecord(null), 2000);
      toast({
        title: "Copied",
        description: `${recordType} record copied to clipboard`,
      });
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Custom Domain Setup</h2>
        <p className="text-muted-foreground">
          Add your own domain for branded secure links
        </p>
      </div>

      {/* Step 1: Enter Domain */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
            Enter Your Domain
          </CardTitle>
          <CardDescription>
            Enter the domain you want to use for your secure links
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="secure.yourdomain.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleGenerateRecords}
              disabled={isGenerating || !domain.trim()}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4" />
                  Generate Records
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: DNS Records */}
      {records.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
              Add These DNS Records
            </CardTitle>
            <CardDescription>
              Add these records to your DNS provider (cPanel, Cloudflare, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {records.map((record, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <span className="font-mono text-xs">{record.type}</span>
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(record.value, record.type)}
                    className="flex items-center gap-1"
                  >
                    {copiedRecord === record.type ? (
                      <>
                        <CheckCircle className="h-3 w-3" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-muted-foreground">Name/Host</div>
                    <div className="font-mono bg-muted px-2 py-1 rounded">{record.name}</div>
                  </div>
                  <div>
                    <div className="font-medium text-muted-foreground">Type</div>
                    <div className="font-mono bg-muted px-2 py-1 rounded">{record.type}</div>
                  </div>
                  <div>
                    <div className="font-medium text-muted-foreground">Value/Target</div>
                    <div className="font-mono bg-muted px-2 py-1 rounded break-all">{record.value}</div>
                  </div>
                </div>
              </div>
            ))}

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> After adding these records, wait 5-10 minutes for DNS propagation before verifying.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Verify */}
      {records.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
              Verify Your Domain
            </CardTitle>
            <CardDescription>
              Once you've added the DNS records, verify your domain is working
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleVerify}
              disabled={isVerifying || !domain.trim()}
              className="flex items-center gap-2"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Verify Domain
                </>
              )}
            </Button>

            {verificationResult && (
              <Alert className={verificationResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                {verificationResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={verificationResult.success ? "text-green-800" : "text-red-800"}>
                  {verificationResult.message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CustomDomainSettings;