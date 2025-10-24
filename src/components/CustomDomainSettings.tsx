import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

const CustomDomainSettings = () => {
  const [newDomain, setNewDomain] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [verifyingDomains, setVerifyingDomains] = useState<Set<string>>(new Set());
  const [automatingDomains, setAutomatingDomains] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  
  const {
    domains,
    loading,
    error,
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
      const result = await verifyDomain(domainId);
      
      if (result.verified) {
        toast({
          title: "Domain Verified",
          description: result.message,
        });
      } else {
        toast({
          title: "Verification Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify domain",
        variant: "destructive",
      });
    } finally {
      setVerifyingDomains(prev => {
        const newSet = new Set(prev);
        newSet.delete(domainId);
        return newSet;
      });
    }
  };

  const handleAutomatedDNS = async (domainId: string) => {
    try {
      setAutomatingDomains(prev => new Set(prev).add(domainId));
      
      const { data, error } = await supabase.functions.invoke('vercel-dns', {
        method: 'POST',
        body: { domainId },
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        toast({
          title: "DNS Automated",
          description: "DNS record created automatically via Vercel",
        });
        
        // Refresh domains list
        await fetchDomains();
      } else {
        toast({
          title: "Automation Failed",
          description: data.message || "Failed to automate DNS setup",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to automate DNS setup",
        variant: "destructive",
      });
    } finally {
      setAutomatingDomains(prev => {
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

          {/* Automated DNS Info */}
          <Alert>
            <Zap className="h-4 w-4" />
            <AlertDescription>
              <strong>Automated Setup:</strong> Use "Auto Setup" to automatically create DNS records via Vercel. 
              Manual setup is also available if you prefer to manage DNS yourself.
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
                    
                    <div className="flex items-center gap-2">
                      {getStatusIcon(domain.status)}
                      
                      {domain.status === 'verified' && !domain.is_active && (
                        <Button
                          size="sm"
                          onClick={() => handleActivateDomain(domain.id)}
                        >
                          Activate
                        </Button>
                      )}
                      
                      {domain.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAutomatedDNS(domain.id)}
                            disabled={automatingDomains.has(domain.id)}
                            className="flex items-center gap-1"
                          >
                            {automatingDomains.has(domain.id) ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Zap className="h-4 w-4" />
                                Auto Setup
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVerifyDomain(domain.id)}
                            disabled={verifyingDomains.has(domain.id)}
                          >
                            {verifyingDomains.has(domain.id) ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              'Verify'
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
                      <div className="flex items-center gap-2">
                        <code className="bg-background px-2 py-1 rounded text-sm">
                          CNAME {domain.domain_name} {domain.dns_record_value}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyDNSToClipboard(domain)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Add this CNAME record to your DNS settings, then click Verify
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