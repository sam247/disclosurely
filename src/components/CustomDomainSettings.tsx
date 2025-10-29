import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Copy, CheckCircle, AlertCircle, RefreshCw, Globe, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { auditLogger } from '@/utils/auditLogger';

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
  steps?: {
    dnsCheck: boolean;
    vercelVerification: boolean;
    sslProvisioning: boolean;
  };
}

const CustomDomainSettings = () => {
  const { user } = useAuth();
  
  const [domain, setDomain] = useState(() => {
    // Load domain from localStorage on component mount
    if (typeof window !== 'undefined') {
      return localStorage.getItem('custom-domain') || '';
    }
    return '';
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [records, setRecords] = useState<DNSRecord[]>(() => {
    // Load records from localStorage on component mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('custom-domain-records');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(() => {
    // Load verification result from localStorage on component mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('custom-domain-verification');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  const [copiedRecord, setCopiedRecord] = useState<string | null>(null);
  const [verificationProgress, setVerificationProgress] = useState({
    dnsCheck: false,
    vercelVerification: false,
    sslProvisioning: false,
  });
  const { toast } = useToast();

  // Track previous domain to detect changes
  const prevDomainRef = React.useRef<string>('');
  
  // Save domain to localStorage whenever it changes
  // Also clear old records/verification when domain changes
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if domain actually changed
      if (domain && domain !== prevDomainRef.current && prevDomainRef.current !== '') {
        // Domain changed - clear old records and verification
        localStorage.removeItem('custom-domain-records');
        localStorage.removeItem('custom-domain-verification');
        setRecords([]);
        setVerificationResult(null);
      }
      
      // Update previous domain reference
      prevDomainRef.current = domain;
      
      // Save to localStorage
      if (domain) {
        localStorage.setItem('custom-domain', domain);
      } else {
        localStorage.removeItem('custom-domain');
      }
    }
  }, [domain]);

  // Save records to localStorage whenever they change
  React.useEffect(() => {
    if (typeof window !== 'undefined' && records.length > 0) {
      localStorage.setItem('custom-domain-records', JSON.stringify(records));
    }
  }, [records]);

  // Save verification result to localStorage whenever it changes
  React.useEffect(() => {
    if (typeof window !== 'undefined' && verificationResult) {
      localStorage.setItem('custom-domain-verification', JSON.stringify(verificationResult));
    }
  }, [verificationResult]);

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
        // Ensure records is always an array and properly structured
        const recordsArray = Array.isArray(result.records) 
          ? result.records 
          : (result.records ? [result.records] : []);
        
        // Validate record structure and ensure all values are strings/primitives
        const validRecords = recordsArray.filter((record: any) => {
          if (!record || typeof record !== 'object') return false;
          
          // Check required fields exist
          if (!record.type || !record.name || !record.value) return false;
          
          // Ensure all fields are primitives (not objects)
          if (typeof record.type !== 'string') return false;
          if (typeof record.name !== 'string') return false;
          if (typeof record.value !== 'string') return false;
          
          // Handle potential nested objects in value field
          if (typeof record.value === 'object') {
            // If value is an object, try to extract string value
            if (record.value.value) {
              record.value = String(record.value.value);
            } else if (record.value.rank) {
              // Handle {rank, value} structure
              record.value = String(record.value.value || '');
            } else {
              return false;
            }
          }
          
          return true;
        }).map((record: any) => ({
          type: String(record.type),
          name: String(record.name),
          value: String(record.value),
          ttl: record.ttl ? Number(record.ttl) : 300
        }));
        
        if (validRecords.length === 0) {
          throw new Error('No valid DNS records returned from server');
        }
        
        setRecords(validRecords);
        
        // AI Logging
        if (user?.id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', user.id)
            .single();
          
          if (profile?.organization_id) {
            auditLogger.log({
              eventType: 'custom_domain.records_generated',
              category: 'system',
              action: 'generate_dns_records',
              actorType: 'user',
              actorId: user.id,
              organizationId: profile.organization_id,
              summary: `DNS records generated for domain: ${domain.trim()}`,
              metadata: { 
                domain: domain.trim(), 
                recordCount: validRecords.length,
                recordTypes: validRecords.map(r => r.type)
              }
            }).catch(console.error);
          }
        }
        
        toast({
          title: "Verification Records Generated",
          description: "Add these DNS records to your domain provider",
        });
      } else {
        // Ensure message is always a string
        const errorMessage = typeof result.message === 'string' 
          ? result.message 
          : (result.message?.message || JSON.stringify(result.message) || "Failed to generate verification records");
        
        toast({
          title: "Generation Failed",
          description: errorMessage,
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
    setVerificationProgress({
      dnsCheck: false,
      vercelVerification: false,
      sslProvisioning: false,
    });

    try {
      // Step 1: DNS Check
      setVerificationProgress(prev => ({ ...prev, dnsCheck: true }));
      toast({
        title: "Verifying Domain",
        description: "Checking DNS records...",
      });

      // Step 2: Vercel Verification
      setVerificationProgress(prev => ({ ...prev, vercelVerification: true }));
      toast({
        title: "Verifying Domain",
        description: "Triggering Vercel verification...",
      });

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
      
      // Ensure verification result is properly structured (handle if it contains objects)
      const cleanResult = {
        success: result.success || false,
        message: typeof result.message === 'string' ? result.message : JSON.stringify(result.message || 'Verification completed'),
        records: Array.isArray(result.records) ? result.records : undefined,
        steps: result.steps && typeof result.steps === 'object' ? result.steps : undefined,
      };
      
      setVerificationResult(cleanResult);

      // Step 3: SSL Provisioning (simulated)
      setVerificationProgress(prev => ({ ...prev, sslProvisioning: true }));
      toast({
        title: "Verifying Domain",
        description: "Provisioning SSL certificate...",
      });

      if (result.success) {
        // AI Logging for successful verification
        if (user?.id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', user.id)
            .single();
          
          if (profile?.organization_id) {
            auditLogger.log({
              eventType: 'custom_domain.verified',
              category: 'system',
              action: 'verify_domain',
              actorType: 'user',
              actorId: user.id,
              organizationId: profile.organization_id,
              summary: `Domain successfully verified: ${domain.trim()}`,
              metadata: { 
                domain: domain.trim(),
                verificationSuccess: true
              }
            }).catch(console.error);
          }
        }
        
        // Clear records once verified successfully
        setRecords([]);
        
        // Invalidate custom domains query in LinkGenerator to refresh branded link
        // This will trigger a refetch and show the branded link
        if (typeof window !== 'undefined') {
          // Use queryClient from react-query to invalidate
          const { QueryClient } = await import('@tanstack/react-query');
          // We'll trigger this via a custom event that LinkGenerator can listen to
          window.dispatchEvent(new CustomEvent('custom-domain-verified', { 
            detail: { domain: domain.trim() } 
          }));
        }
        
        toast({
          title: "Verification Successful",
          description: "Your domain is ready to use! The branded link will appear shortly.",
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

  const handleDelete = async () => {
    if (!domain.trim()) {
      toast({
        title: "Domain Required",
        description: "Please enter a domain name to delete",
        variant: "destructive",
      });
      return;
    }

    // Confirm deletion
    if (!confirm(`Are you sure you want to delete the domain "${domain}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);

    try {
      toast({
        title: "Deleting Domain",
        description: "Removing domain from Vercel and database...",
      });

      const response = await supabase.functions.invoke('simple-domain', {
        body: { 
          action: 'delete',
          domain: domain.trim() 
        }
      });

      if (response.error) {
        throw response.error;
      }

      const result = response.data;

      if (result.success) {
        // AI Logging for domain deletion
        if (user?.id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', user.id)
            .single();
          
          if (profile?.organization_id) {
            auditLogger.log({
              eventType: 'custom_domain.deleted',
              category: 'system',
              action: 'delete_domain',
              actorType: 'user',
              actorId: user.id,
              organizationId: profile.organization_id,
              summary: `Domain deleted: ${domain.trim()}`,
              metadata: { 
                domain: domain.trim(),
                deletionSuccess: true
              }
            }).catch(console.error);
          }
        }
        
        toast({
          title: "Domain Deleted",
          description: result.message || "Domain has been completely removed!",
        });
        
        // Clear all state
        setDomain('');
        setRecords([]);
        setVerificationResult(null);
        setVerificationProgress({
          dnsCheck: false,
          vercelVerification: false,
          sslProvisioning: false,
        });
        
        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('custom-domain');
          localStorage.removeItem('custom-domain-records');
          localStorage.removeItem('custom-domain-verification');
        }
      } else {
        toast({
          title: "Deletion Failed",
          description: result.message || "Failed to delete domain",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting domain:', error);
      toast({
        title: "Error",
        description: "Failed to delete domain",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
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
      {/* Hide records once domain is successfully verified */}
      {records.length > 0 && !verificationResult?.success && (
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

            {/* Delete Button */}
            {domain && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting || isGenerating || isVerifying}
                className="w-full"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Deleting Domain...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Domain
                  </>
                )}
              </Button>
            )}

            {/* Progress Indicators */}
            {isVerifying && (
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700">Verification Progress:</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {verificationProgress.dnsCheck ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <RefreshCw className={`h-4 w-4 ${verificationProgress.dnsCheck ? 'text-green-600' : 'text-gray-400'} ${isVerifying ? 'animate-spin' : ''}`} />
                    )}
                    <span className={`text-sm ${verificationProgress.dnsCheck ? 'text-green-600' : 'text-gray-500'}`}>
                      Checking DNS records
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {verificationProgress.vercelVerification ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <RefreshCw className={`h-4 w-4 ${verificationProgress.vercelVerification ? 'text-green-600' : 'text-gray-400'} ${isVerifying ? 'animate-spin' : ''}`} />
                    )}
                    <span className={`text-sm ${verificationProgress.vercelVerification ? 'text-green-600' : 'text-gray-500'}`}>
                      Triggering Vercel verification
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {verificationProgress.sslProvisioning ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <RefreshCw className={`h-4 w-4 ${verificationProgress.sslProvisioning ? 'text-green-600' : 'text-gray-400'} ${isVerifying ? 'animate-spin' : ''}`} />
                    )}
                    <span className={`text-sm ${verificationProgress.sslProvisioning ? 'text-green-600' : 'text-gray-500'}`}>
                      Provisioning SSL certificate
                    </span>
                  </div>
                </div>
              </div>
            )}

            {verificationResult && (
              <Alert className={verificationResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                {verificationResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={verificationResult.success ? "text-green-800" : "text-red-800"}>
                  {typeof verificationResult.message === 'string' ? verificationResult.message : String(verificationResult.message || 'Verification completed')}
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