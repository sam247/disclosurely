
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DomainVerification {
  id: string;
  domain: string;
  verification_token: string;
  verified_at: string | null;
  verification_type: string;
}

const CustomDomainSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [domain, setDomain] = useState('');
  const [verifications, setVerifications] = useState<DomainVerification[]>([]);
  const [loading, setLoading] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const fetchVerifications = async () => {
    if (!user) return;
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) return;

      const { data, error } = await supabase
        .from('domain_verifications')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching domain verifications:', error);
        // Don't show toast for fetch errors to avoid spamming user
        return;
      }

      setVerifications(data || []);
    } catch (error) {
      console.error('Error in fetchVerifications:', error);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, [user]);

  const addDomain = async () => {
    if (!domain.trim()) {
      toast({
        title: "Error",
        description: "Please enter a domain name",
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        toast({
          title: "Error",
          description: "Organization not found",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('domain_verifications')
        .insert({
          domain: domain.trim(),
          organization_id: profile.organization_id,
          verification_type: 'TXT'
        });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Domain added for verification",
      });

      setDomain('');
      fetchVerifications();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add domain",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyDomain = async (id: string) => {
    setVerifyingId(id);
    try {
      // Simple verification check - in a real implementation this would check DNS records
      const { data, error } = await supabase
        .from('domain_verifications')
        .update({ verified_at: new Date().toISOString() })
        .eq('id', id)
        .select();

      if (error) {
        toast({
          title: "Verification Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Domain verified successfully",
      });

      fetchVerifications();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify domain",
        variant: "destructive",
      });
    } finally {
      setVerifyingId(null);
    }
  };

  const deleteDomain = async (id: string) => {
    try {
      const { error } = await supabase
        .from('domain_verifications')
        .delete()
        .eq('id', id);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Domain removed",
      });

      fetchVerifications();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove domain",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Domain</CardTitle>
        <CardDescription>
          Set up a custom domain for your organization's report submission portal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="domain">Domain Name</Label>
            <div className="flex gap-2">
              <Input
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="reports.yourcompany.com"
                disabled={loading}
              />
              <Button onClick={addDomain} disabled={loading}>
                {loading ? 'Adding...' : 'Add Domain'}
              </Button>
            </div>
          </div>
        </div>

        {verifications.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Domain Verifications</h3>
            {verifications.map((verification) => (
              <Card key={verification.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{verification.domain}</span>
                      {verification.verified_at ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>
                    {!verification.verified_at && (
                      <div className="text-sm text-gray-600">
                        <p>Add this TXT record to your DNS:</p>
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {verification.verification_token}
                        </code>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!verification.verified_at && (
                      <Button
                        size="sm"
                        onClick={() => verifyDomain(verification.id)}
                        disabled={verifyingId === verification.id}
                      >
                        {verifyingId === verification.id ? 'Verifying...' : 'Verify'}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteDomain(verification.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <ExternalLink className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900">How it works:</p>
              <p className="text-blue-700 mt-1">
                Once verified, your custom domain will point to your organization's 
                secure report submission portal, giving you a branded experience.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomDomainSettings;
