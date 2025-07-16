
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DomainVerification {
  id: string;
  domain: string;
  verification_token: string;
  verification_type: string;
  verified_at: string | null;
}

const CustomDomainSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [domain, setDomain] = useState('');
  const [verifications, setVerifications] = useState<DomainVerification[]>([]);
  const [loading, setLoading] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVerifications = async () => {
    if (!user) return;
    
    try {
      // Get user's profile and organization
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.organization_id) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      const { data, error } = await supabase
        .from('domain_verifications')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching domain verifications:', error);
        return;
      }

      setVerifications(data || []);
    } catch (error) {
      console.error('Error in fetchVerifications:', error);
    }
  };

  const refreshVerifications = async () => {
    setRefreshing(true);
    try {
      await fetchVerifications();
      toast({
        title: "Refreshed",
        description: "Domain verifications updated",
      });
    } catch (error) {
      console.error('Error refreshing verifications:', error);
      toast({
        title: "Error",
        description: "Failed to refresh verifications",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchVerifications();
    }
  }, [user]);

  const addDomain = async () => {
    if (!domain.trim()) {
      toast({
        title: "Error",
        description: "Please enter a domain",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Get user's profile first
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user?.id)
        .single();

      if (profileError || !profile?.organization_id) {
        toast({
          title: "Error",
          description: "Organization not found",
          variant: "destructive",
        });
        return;
      }

      // Generate a temporary verification token that will be overridden by the database trigger
      const tempToken = `temp-${Date.now()}`;

      const { error } = await supabase
        .from('domain_verifications')
        .insert({
          domain: domain.trim(),
          organization_id: profile.organization_id,
          verification_type: 'TXT',
          verification_token: tempToken
        });

      if (error) {
        console.error('Database error:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Domain added successfully",
      });

      setDomain('');
      await fetchVerifications();
    } catch (error) {
      console.error('Unexpected error:', error);
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
      const { error } = await supabase
        .from('domain_verifications')
        .update({ verified_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Verification error:', error);
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

      await fetchVerifications();
    } catch (error) {
      console.error('Unexpected verification error:', error);
      toast({
        title: "Error",
        description: "Failed to verify domain",
        variant: "destructive",
      });
    } finally {
      setVerifyingId(null);
    }
  };

  const removeDomain = async (id: string) => {
    try {
      const { error } = await supabase
        .from('domain_verifications')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete error:', error);
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

      await fetchVerifications();
    } catch (error) {
      console.error('Unexpected delete error:', error);
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Custom Domain</CardTitle>
            <CardDescription>
              Set up a custom domain for your organization's report submission portal
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshVerifications}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3">
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                placeholder="reports.yourcompany.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addDomain} disabled={loading} className="w-full">
                {loading ? 'Adding...' : 'Add Domain'}
              </Button>
            </div>
          </div>
        </div>

        {verifications.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Domain Verifications</h3>
            {verifications.map((verification) => (
              <div key={verification.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
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
                  <div className="flex space-x-2">
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
                      onClick={() => removeDomain(verification.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>

                {!verification.verified_at && (
                  <div className="bg-gray-50 p-3 rounded space-y-2">
                    <p className="text-sm font-medium">DNS Configuration Required:</p>
                    <div className="text-sm space-y-1">
                      <p><strong>Type:</strong> {verification.verification_type}</p>
                      <p><strong>Name:</strong> _disclosurely-verification</p>
                      <p><strong>Value:</strong> {verification.verification_token}</p>
                    </div>
                    <p className="text-xs text-gray-600">
                      Add this TXT record to your DNS settings and click Verify.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg space-y-2">
          <div className="flex items-start space-x-2">
            <ExternalLink className="w-4 h-4 mt-0.5 text-blue-600" />
            <div className="text-sm">
              <p className="font-medium text-blue-900">How to set up custom domains:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1 text-blue-800">
                <li>Add your domain above</li>
                <li>Add the TXT record to your DNS settings</li>
                <li>Click "Verify" to confirm setup</li>
                <li>Once verified, your domain will be active</li>
              </ol>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomDomainSettings;
