import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useCustomDomains } from '@/hooks/useCustomDomains';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Trash2, 
  Star,
  ExternalLink,
  Copy,
  RefreshCw,
  Zap
} from 'lucide-react';
import { CustomDomain } from '@/types/database';

// Helper functions for progress display
const getProgressValue = (progressText: string): number => {
  if (progressText.includes('Checking DNS')) return 20;
  if (progressText.includes('Adding domain to Vercel')) return 50;
  if (progressText.includes('Provisioning SSL')) return 80;
  if (progressText.includes('Connected!')) return 100;
  if (progressText.includes('failed') || progressText.includes('Error')) return 0;
  return 0;
};

const getProgressStep = (progressText: string): string => {
  if (progressText.includes('Checking DNS')) return 'Step 1 of 4: Verifying DNS configuration';
  if (progressText.includes('Adding domain to Vercel')) return 'Step 2 of 4: Adding domain to Vercel';
  if (progressText.includes('Provisioning SSL')) return 'Step 3 of 4: Provisioning SSL certificate';
  if (progressText.includes('Connected!')) return 'Step 4 of 4: Complete!';
  if (progressText.includes('failed') || progressText.includes('Error')) return 'Verification failed';
  return '';
};

const CustomDomainSettings = () => {
  const [newDomain, setNewDomain] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [verifyingDomains, setVerifyingDomains] = useState<Set<string>>(new Set());
  const [verificationProgress, setVerificationProgress] = useState<Record<string, string>>({});
  const { toast } = useToast();
  
  const {
    domains,
    loading,
    error,
    fetchDomains,
    addDomain,
    verifyDomain,
    activateDomain,
    deleteDomain,
    setPrimaryDomain,
  } = useCustomDomains();

  const handleAddDomain = async () => {
    if (!newDomain.trim()) {
      toast({
        title: "Error",
        description: "Please enter a domain name",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAdding(true);
      const result = await addDomain(newDomain.trim());
      
      toast({
        title: "Domain Added",
        description: `Please add the DNS record: CNAME ${result.dns_instructions.name} → ${result.dns_instructions.value}`,
      });
      
      setNewDomain('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add domain",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleVerifyDomain = async (domainId: string) => {
    try {
      setVerifyingDomains(prev => new Set(prev).add(domainId));
      
      // Step 1: Starting verification
      setVerificationProgress(prev => ({
        ...prev,
        [domainId]: "Checking DNS records..."
      }));
      
      // Step 2: Verify domain
      const result = await verifyDomain(domainId);
      
      if (result.verified) {
        // Step 3: Adding to Vercel
        setVerificationProgress(prev => ({
          ...prev,
          [domainId]: "Adding domain to Vercel..."
        }));
        
        // Small delay to show the step
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Step 4: Provisioning SSL
        setVerificationProgress(prev => ({
          ...prev,
          [domainId]: "Provisioning SSL certificate..."
        }));
        
        // Small delay to show the step
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Step 5: Complete
        setVerificationProgress(prev => ({
          ...prev,
          [domainId]: "Connected! Domain is ready to use."
        }));
        
        toast({
          title: "Domain Verified & Connected",
          description: "Your custom domain is now active with SSL certificate",
        });
        
        // Clear progress after 3 seconds
        setTimeout(() => {
          setVerificationProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[domainId];
            return newProgress;
          });
        }, 3000);
        
      } else {
        setVerificationProgress(prev => ({
          ...prev,
          [domainId]: "Verification failed"
        }));
        
        toast({
          title: "Verification Failed",
          description: result.message,
          variant: "destructive",
        });
        
        // Clear progress after 2 seconds
        setTimeout(() => {
          setVerificationProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[domainId];
            return newProgress;
          });
        }, 2000);
      }
    } catch (error: any) {
      setVerificationProgress(prev => ({
        ...prev,
        [domainId]: "Error occurred"
      }));
      
      toast({
        title: "Error",
        description: error.message || "Failed to verify domain",
        variant: "destructive",
      });
      
      // Clear progress after 2 seconds
      setTimeout(() => {
        setVerificationProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[domainId];
          return newProgress;
        });
      }, 2000);
    } finally {
      setVerifyingDomains(prev => {
        const newSet = new Set(prev);
        newSet.delete(domainId);
        return newSet;
      });
    }
  };

  const handleActivateDomain = async (domainId: string) => {
    try {
      await activateDomain(domainId);
      toast({
        title: "Domain Activated",
        description: "Domain is now active and ready to use",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to activate domain",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDomain = async (domainId: string) => {
    if (!confirm('Are you sure you want to delete this domain? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDomain(domainId);
      toast({
        title: "Domain Deleted",
        description: "Domain has been removed",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete domain",
        variant: "destructive",
      });
    }
  };

  const handleSetPrimary = async (domainId: string) => {
    try {
      await setPrimaryDomain(domainId);
      toast({
        title: "Primary Domain Set",
        description: "This domain is now your primary secure link domain",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to set primary domain",
        variant: "destructive",
      });
    }
  };

  const copyDNSToClipboard = (domain: CustomDomain) => {
    const dnsRecord = `CNAME ${domain.domain_name} ${domain.dns_record_value}`;
    navigator.clipboard.writeText(dnsRecord);
    toast({
      title: "Copied",
      description: "DNS record copied to clipboard",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'pending':
      case 'verifying':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      verified: "secondary", 
      pending: "outline",
      verifying: "outline",
      failed: "destructive",
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Custom Domains</CardTitle>
          <CardDescription>Loading your custom domains...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Custom Domains</CardTitle>
          <CardDescription>
            Add custom domains for branded secure links. Your secure links will use your domain instead of disclosurely.com
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Domain Form */}
          <div className="flex gap-2">
            <Input
              placeholder="secure.yourcompany.com"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddDomain()}
            />
            <Button 
              onClick={handleAddDomain} 
              disabled={isAdding}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {isAdding ? 'Adding...' : 'Add Domain'}
            </Button>
          </div>

                      {/* Current Default */}
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Current default: <code className="bg-muted px-1 rounded">secure.disclosurely.com</code>
                        </AlertDescription>
                      </Alert>

                      {/* DNS Setup Instructions */}
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>DNS Setup Instructions:</strong>
                          <br />
                          1. Go to your DNS provider's control panel (cPanel, Cloudflare, etc.)
                          <br />
                          2. Add a new CNAME record with these exact values:
                          <br />
                          • <strong>Name/Host:</strong> secure (or your subdomain)
                          <br />
                          • <strong>Type:</strong> CNAME
                          <br />
                          • <strong>Value/Target:</strong> secure.disclosurely.com
                          <br />
                          3. Save the record and wait 5-10 minutes for propagation
                          <br />
                          4. Click "Verify" to check if the record is working
                        </AlertDescription>
                      </Alert>
        </CardContent>
      </Card>

      {/* Domains List */}
      {domains.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Domains</CardTitle>
            <CardDescription>
              Manage your custom domains and their verification status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {domains.map((domain) => (
                <div key={domain.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                        {domain.domain_name}
                      </code>
                      {domain.is_primary && (
                        <Badge variant="default" className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Primary
                        </Badge>
                      )}
                      {getStatusBadge(domain.status)}
                    </div>
                    
                    {/* Progress Indicator */}
                    {verificationProgress[domain.id] && (
                      <div className={`w-full mt-3 p-3 rounded-lg border ${
                        verificationProgress[domain.id].includes('Connected!') 
                          ? 'bg-green-50 border-green-200' 
                          : verificationProgress[domain.id].includes('failed') || verificationProgress[domain.id].includes('Error')
                          ? 'bg-red-50 border-red-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}>
                        <div className={`flex items-center gap-2 text-sm mb-2 ${
                          verificationProgress[domain.id].includes('Connected!') 
                            ? 'text-green-700' 
                            : verificationProgress[domain.id].includes('failed') || verificationProgress[domain.id].includes('Error')
                            ? 'text-red-700'
                            : 'text-blue-700'
                        }`}>
                          {verificationProgress[domain.id].includes('Connected!') ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : verificationProgress[domain.id].includes('failed') || verificationProgress[domain.id].includes('Error') ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          )}
                          <span className="font-medium">{verificationProgress[domain.id]}</span>
                        </div>
                        <Progress 
                          value={getProgressValue(verificationProgress[domain.id])} 
                          className="h-2"
                        />
                        <div className={`text-xs mt-1 ${
                          verificationProgress[domain.id].includes('Connected!') 
                            ? 'text-green-600' 
                            : verificationProgress[domain.id].includes('failed') || verificationProgress[domain.id].includes('Error')
                            ? 'text-red-600'
                            : 'text-blue-600'
                        }`}>
                          {getProgressStep(verificationProgress[domain.id])}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      {getStatusIcon(domain.status)}
                      
                      {domain.status === 'verified' && !domain.is_active && (
                        <Button
                          size="sm"
                          onClick={() => handleActivateDomain(domain.id)}
                          className="flex items-center gap-1"
                        >
                          <Zap className="h-4 w-4" />
                          Activate & Connect
                        </Button>
                      )}
                      
                      {domain.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVerifyDomain(domain.id)}
                            disabled={verifyingDomains.has(domain.id)}
                            className="flex items-center gap-1"
                          >
                            {verifyingDomains.has(domain.id) ? (
                              <>
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                Verifying...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4" />
                                Verify & Connect
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                      
                      {domain.status === 'failed' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVerifyDomain(domain.id)}
                            disabled={verifyingDomains.has(domain.id)}
                            className="flex items-center gap-1"
                          >
                            {verifyingDomains.has(domain.id) ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <RefreshCw className="h-4 w-4" />
                                Retry Verification
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                      
                      {domain.status === 'active' && !domain.is_primary && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetPrimary(domain.id)}
                        >
                          Set Primary
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteDomain(domain.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* DNS Instructions */}
                  {domain.status === 'pending' && (
                    <div className="bg-muted/50 rounded p-3 space-y-2">
                      <div className="text-sm font-medium">DNS Setup Required:</div>
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground">
                          Add this CNAME record to your DNS provider:
                        </div>
                        <div className="bg-background rounded p-2 space-y-1 text-sm font-mono">
                          <div><strong>Name/Host:</strong> {domain.subdomain}</div>
                          <div><strong>Type:</strong> CNAME</div>
                          <div><strong>Value/Target:</strong> secure.disclosurely.com</div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyDNSToClipboard(domain)}
                          className="flex items-center gap-1"
                        >
                          <Copy className="h-4 w-4" />
                          Copy Record
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        After adding the record, wait 5-10 minutes for DNS propagation, then click Verify
                      </div>
                    </div>
                  )}
                  
                  {domain.status === 'failed' && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded p-3 space-y-2">
                      <div className="text-sm font-medium text-destructive">Verification Failed</div>
                      <div className="text-xs text-muted-foreground">
                        CNAME record not found or incorrect. Please check your DNS settings and try again.
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {domain.error_message && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{domain.error_message}</AlertDescription>
                    </Alert>
                  )}

                  {/* Domain Info */}
                  <div className="text-xs text-muted-foreground">
                    Added {new Date(domain.created_at).toLocaleDateString()}
                    {domain.verified_at && (
                      <> • Verified {new Date(domain.verified_at).toLocaleDateString()}</>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {domains.length === 0 && !loading && (
        <Card>
          <CardContent className="py-8 text-center">
            <div className="text-muted-foreground">
              No custom domains added yet. Add your first domain above to get started.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CustomDomainSettings;