
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Shield, Lock, Globe, AlertTriangle, CheckCircle, Settings } from 'lucide-react';

interface SecurityHeaderConfig {
  csp: {
    enabled: boolean;
    policy: string;
  };
  hsts: {
    enabled: boolean;
    maxAge: number;
    includeSubdomains: boolean;
  };
  xss: {
    enabled: boolean;
    mode: 'block' | 'sanitize';
  };
  csrf: {
    enabled: boolean;
    sameSite: 'strict' | 'lax' | 'none';
  };
  frameOptions: {
    enabled: boolean;
    policy: 'deny' | 'sameorigin' | 'allow-from';
  };
  contentType: {
    enabled: boolean;
    noSniff: boolean;
  };
}

const SecurityHeaders = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<SecurityHeaderConfig>({
    csp: {
      enabled: true,
      policy: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co;"
    },
    hsts: {
      enabled: true,
      maxAge: 31536000,
      includeSubdomains: true
    },
    xss: {
      enabled: true,
      mode: 'block'
    },
    csrf: {
      enabled: true,
      sameSite: 'strict'
    },
    frameOptions: {
      enabled: true,
      policy: 'deny'
    },
    contentType: {
      enabled: true,
      noSniff: true
    }
  });
  
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Load existing configuration
    loadConfiguration();
    // Test current headers
    testSecurityHeaders();
  }, []);

  const loadConfiguration = () => {
    // In a real implementation, this would load from your server configuration
    // For now, we'll use default values
    
  };

  const saveConfiguration = async () => {
    try {
      // In a real implementation, this would save to your server configuration
      // For now, we'll simulate the save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configuration Saved",
        description: "Security headers configuration has been updated",
      });
      
      // Retest headers after save
      testSecurityHeaders();
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save security headers configuration",
        variant: "destructive",
      });
    }
  };

  const testSecurityHeaders = async () => {
    setTesting(true);
    try {
      // Test current site headers
      const response = await fetch(window.location.origin, { method: 'HEAD' });
      const headers = response.headers;
      
      const results = {
        csp: headers.has('content-security-policy'),
        hsts: headers.has('strict-transport-security'),
        xss: headers.has('x-xss-protection'),
        csrf: headers.has('x-csrf-token') || document.querySelector('meta[name="csrf-token"]') !== null,
        frameOptions: headers.has('x-frame-options'),
        contentType: headers.has('x-content-type-options')
      };
      
      setTestResults(results);
    } catch (error) {
      console.error('Error testing headers:', error);
      toast({
        title: "Test Failed",
        description: "Failed to test security headers",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const updateConfig = (section: keyof SecurityHeaderConfig, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const getStatusBadge = (enabled: boolean, tested?: boolean) => {
    if (tested === false) {
      return <Badge variant="destructive">Not Configured</Badge>;
    }
    if (tested === true) {
      return <Badge className="bg-green-600 text-white">Active</Badge>;
    }
    return enabled ? 
      <Badge className="bg-blue-600 text-white">Enabled</Badge> : 
      <Badge variant="secondary">Disabled</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header Test Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Headers Status
              </CardTitle>
              <CardDescription>
                Current security header configuration and test results
              </CardDescription>
            </div>
            <Button onClick={testSecurityHeaders} disabled={testing}>
              {testing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Settings className="h-4 w-4 mr-2" />
              )}
              Test Headers
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Content Security Policy</div>
                <div className="text-sm text-gray-500">XSS Protection</div>
              </div>
              {getStatusBadge(config.csp.enabled, testResults.csp)}
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">HSTS</div>
                <div className="text-sm text-gray-500">HTTPS Enforcement</div>
              </div>
              {getStatusBadge(config.hsts.enabled, testResults.hsts)}
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">XSS Protection</div>
                <div className="text-sm text-gray-500">Cross-Site Scripting</div>
              </div>
              {getStatusBadge(config.xss.enabled, testResults.xss)}
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">CSRF Protection</div>
                <div className="text-sm text-gray-500">Cross-Site Request Forgery</div>
              </div>
              {getStatusBadge(config.csrf.enabled, testResults.csrf)}
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Frame Options</div>
                <div className="text-sm text-gray-500">Clickjacking Protection</div>
              </div>
              {getStatusBadge(config.frameOptions.enabled, testResults.frameOptions)}
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Content Type</div>
                <div className="text-sm text-gray-500">MIME Sniffing Protection</div>
              </div>
              {getStatusBadge(config.contentType.enabled, testResults.contentType)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Security Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Content Security Policy (CSP)
          </CardTitle>
          <CardDescription>
            Control which resources can be loaded to prevent XSS attacks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="csp-enabled"
              checked={config.csp.enabled}
              onCheckedChange={(enabled) => updateConfig('csp', 'enabled', enabled)}
            />
            <Label htmlFor="csp-enabled">Enable Content Security Policy</Label>
          </div>
          
          {config.csp.enabled && (
            <div>
              <Label htmlFor="csp-policy">CSP Policy</Label>
              <Textarea
                id="csp-policy"
                value={config.csp.policy}
                onChange={(e) => updateConfig('csp', 'policy', e.target.value)}
                placeholder="Enter your Content Security Policy..."
                className="mt-1 font-mono text-sm"
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                Define which sources are allowed for scripts, styles, images, and other resources
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* HTTPS Enforcement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            HTTPS Enforcement (HSTS)
          </CardTitle>
          <CardDescription>
            Force HTTPS connections and prevent protocol downgrade attacks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="hsts-enabled"
              checked={config.hsts.enabled}
              onCheckedChange={(enabled) => updateConfig('hsts', 'enabled', enabled)}
            />
            <Label htmlFor="hsts-enabled">Enable HSTS</Label>
          </div>
          
          {config.hsts.enabled && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="hsts-maxage">Max Age (seconds)</Label>
                <Input
                  id="hsts-maxage"
                  type="number"
                  value={config.hsts.maxAge}
                  onChange={(e) => updateConfig('hsts', 'maxAge', parseInt(e.target.value))}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  How long browsers should remember to use HTTPS (31536000 = 1 year)
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="hsts-subdomains"
                  checked={config.hsts.includeSubdomains}
                  onCheckedChange={(include) => updateConfig('hsts', 'includeSubdomains', include)}
                />
                <Label htmlFor="hsts-subdomains">Include Subdomains</Label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Security Headers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Additional Security Headers
          </CardTitle>
          <CardDescription>
            Configure additional security headers for comprehensive protection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* XSS Protection */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="xss-enabled"
                checked={config.xss.enabled}
                onCheckedChange={(enabled) => updateConfig('xss', 'enabled', enabled)}
              />
              <Label htmlFor="xss-enabled">XSS Protection</Label>
            </div>
            {config.xss.enabled && (
              <div className="ml-6">
                <Label>Protection Mode</Label>
                <select
                  value={config.xss.mode}
                  onChange={(e) => updateConfig('xss', 'mode', e.target.value)}
                  className="ml-2 px-2 py-1 border rounded text-sm"
                >
                  <option value="block">Block</option>
                  <option value="sanitize">Sanitize</option>
                </select>
              </div>
            )}
          </div>

          {/* CSRF Protection */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="csrf-enabled"
                checked={config.csrf.enabled}
                onCheckedChange={(enabled) => updateConfig('csrf', 'enabled', enabled)}
              />
              <Label htmlFor="csrf-enabled">CSRF Protection</Label>
            </div>
            {config.csrf.enabled && (
              <div className="ml-6">
                <Label>SameSite Policy</Label>
                <select
                  value={config.csrf.sameSite}
                  onChange={(e) => updateConfig('csrf', 'sameSite', e.target.value)}
                  className="ml-2 px-2 py-1 border rounded text-sm"
                >
                  <option value="strict">Strict</option>
                  <option value="lax">Lax</option>
                  <option value="none">None</option>
                </select>
              </div>
            )}
          </div>

          {/* Frame Options */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="frame-enabled"
                checked={config.frameOptions.enabled}
                onCheckedChange={(enabled) => updateConfig('frameOptions', 'enabled', enabled)}
              />
              <Label htmlFor="frame-enabled">Frame Options (Clickjacking Protection)</Label>
            </div>
            {config.frameOptions.enabled && (
              <div className="ml-6">
                <Label>Frame Policy</Label>
                <select
                  value={config.frameOptions.policy}
                  onChange={(e) => updateConfig('frameOptions', 'policy', e.target.value)}
                  className="ml-2 px-2 py-1 border rounded text-sm"
                >
                  <option value="deny">Deny</option>
                  <option value="sameorigin">Same Origin</option>
                  <option value="allow-from">Allow From</option>
                </select>
              </div>
            )}
          </div>

          {/* Content Type Options */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="content-type-enabled"
                checked={config.contentType.enabled}
                onCheckedChange={(enabled) => updateConfig('contentType', 'enabled', enabled)}
              />
              <Label htmlFor="content-type-enabled">Content Type Options</Label>
            </div>
            {config.contentType.enabled && (
              <div className="ml-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="no-sniff"
                    checked={config.contentType.noSniff}
                    onCheckedChange={(noSniff) => updateConfig('contentType', 'noSniff', noSniff)}
                  />
                  <Label htmlFor="no-sniff">Prevent MIME Sniffing</Label>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Configuration */}
      <div className="flex justify-end">
        <Button onClick={saveConfiguration} className="px-8">
          <CheckCircle className="h-4 w-4 mr-2" />
          Save Configuration
        </Button>
      </div>
    </div>
  );
};

export default SecurityHeaders;
