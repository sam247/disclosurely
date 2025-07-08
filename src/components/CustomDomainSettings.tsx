import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Globe, CheckCircle, AlertCircle, Copy, Info, AlertTriangle, Zap } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DomainVerification {
  id: string;
  domain: string;
  verification_token: string;
  verification_type: string;
  verified_at: string | null;
  created_at: string;
}

interface CustomDomainSettingsProps {
  hasActiveTier2Subscription: boolean;
}

const CustomDomainSettings = ({ hasActiveTier2Subscription }: CustomDomainSettingsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [domainVerifications, setDomainVerifications] = useState<DomainVerification[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [newSubdomain, setNewSubdomain] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState('subdomain');

  useEffect(() => {
    if (user && hasActiveTier2Subscription) {
      fetchDomainVerifications();
    }
  }, [user, hasActiveTier2Subscription]);

  const fetchDomainVerifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('domain_verifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDomainVerifications(data || []);
    } catch (error: any) {
      console.error('Error fetching domain verifications:', error);
      toast({
        title: "Error fetching domains",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addSubdomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newSubdomain.trim()) return;

    // Basic subdomain validation
    const subdomainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
    if (!subdomainRegex.test(newSubdomain)) {
      toast({
        title: "Invalid subdomain",
        description: "Please enter a valid subdomain (letters, numbers, and hyphens only)",
        variant: "destructive",
      });
      return;
    }

    const fullDomain = `${newSubdomain.toLowerCase()}.disclosurely.com`;

    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        throw new Error('Organization not found');
      }

      const { error } = await supabase
        .from('domain_verifications')
        .insert({
          organization_id: profile.organization_id,
          domain: fullDomain,
          verification_type: 'SUBDOMAIN',
          verification_token: 'auto-verified',
          verified_at: new Date().toISOString() // Auto-verify subdomains
        });

      if (error) throw error;

      toast({
        title: "Subdomain added successfully",
        description: `Your branded subdomain ${fullDomain} is ready to use immediately!`,
      });

      setNewSubdomain('');
      setShowAddForm(false);
      fetchDomainVerifications();
      
      // Trigger dashboard refresh via custom event
      window.dispatchEvent(new CustomEvent('domain-updated'));
    } catch (error: any) {
      console.error('Error adding subdomain:', error);
      toast({
        title: "Error adding subdomain",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addCustomDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newDomain.trim()) return;

    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*/;
    if (!domainRegex.test(newDomain)) {
      toast({
        title: "Invalid domain",
        description: "Please enter a valid domain name (e.g., reports.yourcompany.com)",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        throw new Error('Organization not found');
      }

      const { error } = await supabase
        .from('domain_verifications')
        .insert({
          organization_id: profile.organization_id,
          domain: newDomain.toLowerCase(),
          verification_type: 'CNAME',
          verification_token: ''
        });

      if (error) throw error;

      toast({
        title: "Domain added successfully",
        description: "Please configure the DNS settings to verify your domain.",
      });

      setNewDomain('');
      setShowAddForm(false);
      fetchDomainVerifications();
    } catch (error: any) {
      console.error('Error adding domain:', error);
      toast({
        title: "Error adding domain",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${label} copied!`,
      description: "The value has been copied to your clipboard.",
    });
  };

  const verifyDomain = async (domainId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('domain_verifications')
        .update({ verified_at: new Date().toISOString() })
        .eq('id', domainId);

      if (error) throw error;

      toast({
        title: "Domain verified!",
        description: "Your custom domain verification is complete. Contact support to enable routing.",
      });

      fetchDomainVerifications();
    } catch (error: any) {
      console.error('Error verifying domain:', error);
      toast({
        title: "Verification failed",
        description: "Please check your DNS settings and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!hasActiveTier2Subscription) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Custom Domain Branding
          </CardTitle>
          <CardDescription>
            Use your own domain for submission links (Tier 2 feature)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Upgrade to Tier 2 to use your own custom domain for your submission links, 
            giving your reports a more professional and branded appearance.
          </p>
          <Badge variant="secondary">Tier 2 Required</Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Custom Domain Branding
              </CardTitle>
              <CardDescription>
                Choose between instant subdomain branding or full custom domain setup
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              Add Domain
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardContent className="pt-4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="subdomain" className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Instant Subdomain
                    </TabsTrigger>
                    <TabsTrigger value="custom" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Custom Domain
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="subdomain" className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-start gap-3">
                        <Zap className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <h4 className="font-medium text-green-900 mb-2">Instant Subdomain Branding (Recommended)</h4>
                          <div className="text-green-800 space-y-2">
                            <p>Get branded links instantly with no DNS configuration required!</p>
                            <ul className="list-disc ml-4 space-y-1">
                              <li>Works immediately after creation</li>
                              <li>Automatic SSL certificates</li>
                              <li>Format: yourname.disclosurely.com</li>
                              <li>No technical setup required</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <form onSubmit={addSubdomain} className="space-y-4">
                      <div>
                        <Label htmlFor="subdomain">Choose Your Subdomain</Label>
                        <div className="flex items-center mt-1">
                          <Input
                            id="subdomain"
                            value={newSubdomain}
                            onChange={(e) => setNewSubdomain(e.target.value)}
                            placeholder="yourcompany"
                            required
                            className="rounded-r-none"
                          />
                          <span className="px-3 py-2 bg-gray-100 border border-l-0 rounded-r-md text-sm text-gray-600">
                            .disclosurely.com
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Choose a subdomain name (letters, numbers, hyphens only)
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button type="submit" disabled={loading}>
                          {loading ? 'Creating...' : 'Create Subdomain'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="custom" className="space-y-4">
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <h4 className="font-medium text-orange-900 mb-2">Custom Domain Setup Required</h4>
                          <div className="text-orange-800 space-y-2">
                            <p>Custom domains require DNS configuration and manual server setup.</p>
                            <ul className="list-disc ml-4 space-y-1">
                              <li>Requires DNS CNAME record configuration</li>
                              <li>Manual server setup by support team</li>
                              <li>Takes 24-48 hours to activate</li>
                              <li>Use your own domain (e.g., reports.company.com)</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <form onSubmit={addCustomDomain} className="space-y-4">
                      <div>
                        <Label htmlFor="domain">Custom Domain</Label>
                        <Input
                          id="domain"
                          value={newDomain}
                          onChange={(e) => setNewDomain(e.target.value)}
                          placeholder="reports.yourcompany.com"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter the full domain you want to use
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button type="submit" disabled={loading}>
                          {loading ? 'Adding...' : 'Add Custom Domain'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {domainVerifications.length === 0 ? (
            <div className="text-center py-8">
              <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No domains configured yet</h3>
              <p className="text-gray-600">
                Add a subdomain for instant branding or configure a custom domain.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {domainVerifications.map((domain) => (
                <Card key={domain.id} className={`border-l-4 ${domain.verification_type === 'SUBDOMAIN' ? 'border-l-green-500' : 'border-l-blue-500'}`}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-medium text-lg flex items-center gap-2">
                          {domain.domain}
                          {domain.verification_type === 'SUBDOMAIN' && (
                            <Badge className="bg-green-100 text-green-800">
                              <Zap className="h-3 w-3 mr-1" />
                              Instant
                            </Badge>
                          )}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          {domain.verified_at ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {domain.verification_type === 'SUBDOMAIN' ? 'Active' : 'DNS Verified'}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {domain.verification_type === 'SUBDOMAIN' ? 'Setting Up...' : 'DNS Configuration Required'}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {!domain.verified_at && domain.verification_type === 'CNAME' && (
                        <Button onClick={() => verifyDomain(domain.id)} disabled={loading}>
                          Check Verification
                        </Button>
                      )}
                    </div>

                    {domain.verification_type === 'SUBDOMAIN' && domain.verified_at && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-green-800 font-medium">Subdomain Active & Ready!</span>
                        </div>
                        <p className="text-sm text-green-700 mb-2">
                          Your branded subdomain is working and ready to use immediately.
                        </p>
                        <p className="text-xs text-green-600">
                          Your submission links will use: https://{domain.domain}/secure/tool/submit/[link-id]
                        </p>
                      </div>
                    )}

                    {domain.verification_type === 'CNAME' && !domain.verified_at && (
                      <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
                        <h5 className="font-medium text-blue-900">DNS Configuration Required</h5>
                        <p className="text-sm text-blue-800">
                          Add these CNAME records to your DNS settings:
                        </p>
                        
                        <div className="space-y-3">
                          <div className="bg-white p-3 rounded border">
                            <Label className="text-xs font-medium text-gray-500">CNAME RECORD #1 - Main Domain</Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                              <div>
                                <Label className="text-xs text-gray-500">NAME/HOST:</Label>
                                <div className="flex items-center justify-between">
                                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">{domain.domain.split('.')[0]}</code>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(domain.domain.split('.')[0], 'CNAME name')}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs text-gray-500">VALUE/TARGET:</Label>
                                <div className="flex items-center justify-between">
                                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">cname.disclosurely.com</code>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard('cname.disclosurely.com', 'CNAME target')}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs text-gray-500">TTL:</Label>
                                <code className="text-sm bg-gray-100 px-2 py-1 rounded">300</code>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white p-3 rounded border">
                            <Label className="text-xs font-medium text-gray-500">CNAME RECORD #2 - Verification</Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                              <div>
                                <Label className="text-xs text-gray-500">NAME/HOST:</Label>
                                <div className="flex items-center justify-between">
                                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">_verify.{domain.domain.split('.')[0]}</code>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(`_verify.${domain.domain.split('.')[0]}`, 'Verification name')}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs text-gray-500">VALUE/TARGET:</Label>
                                <div className="flex items-center justify-between">
                                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">{domain.verification_token}.verify.disclosurely.com</code>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(`${domain.verification_token}.verify.disclosurely.com`, 'Verification target')}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs text-gray-500">TTL:</Label>
                                <code className="text-sm bg-gray-100 px-2 py-1 rounded">300</code>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="text-xs text-blue-700 space-y-1">
                          <p><strong>Step-by-step:</strong></p>
                          <p>1. Log in to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)</p>
                          <p>2. Find DNS management or DNS settings</p>
                          <p>3. Add both CNAME records exactly as shown above</p>
                          <p>4. Wait 5-10 minutes, then click "Check Verification"</p>
                          <p><strong>Note:</strong> DNS changes can take up to 24 hours to fully propagate</p>
                        </div>
                      </div>
                    )}

                    {domain.verification_type === 'CNAME' && domain.verified_at && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-green-800 font-medium">DNS Verified - Server Setup Required</span>
                        </div>
                        <p className="text-sm text-green-700 mb-3">
                          Your DNS is configured correctly! To complete the setup:
                        </p>
                        <div className="bg-white p-3 rounded border border-green-200 space-y-2">
                          <p className="text-sm font-medium text-green-800">Next Steps:</p>
                          <ol className="text-sm text-green-700 list-decimal ml-4 space-y-1">
                            <li>Contact our support team at <strong>support@disclosurely.com</strong></li>
                            <li>Include your verified domain: <strong>{domain.domain}</strong></li>
                            <li>We'll configure server-side routing within 24-48 hours</li>
                            <li>Your submission links will then work with your custom domain</li>
                          </ol>
                        </div>
                        <p className="text-xs text-green-600 mt-2">
                          Expected URL format: https://{domain.domain}/secure/tool/submit/[link-id]
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomDomainSettings;
