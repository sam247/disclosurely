
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExternalLink, TestTube } from 'lucide-react';

const LinkTester = () => {
  const [orgDomain, setOrgDomain] = useState('');
  const [linkToken, setLinkToken] = useState('');

  const testLink = () => {
    if (orgDomain && linkToken) {
      const url = `/submit/${orgDomain}/${linkToken}`;
      window.open(url, '_blank');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Link Tester
        </CardTitle>
        <CardDescription>
          Test your submission links to see how they appear to users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="org-domain">Organization Domain</Label>
              <Input
                id="org-domain"
                value={orgDomain}
                onChange={(e) => setOrgDomain(e.target.value)}
                placeholder="example-org"
              />
            </div>
            <div>
              <Label htmlFor="link-token">Link Token</Label>
              <Input
                id="link-token"
                value={linkToken}
                onChange={(e) => setLinkToken(e.target.value)}
                placeholder="abc123def456"
              />
            </div>
          </div>
          
          <Button 
            onClick={testLink} 
            disabled={!orgDomain || !linkToken}
            className="w-full"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Test Submission Form
          </Button>
          
          {orgDomain && linkToken && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <Label className="text-sm font-medium">Test URL:</Label>
              <code className="block text-sm bg-white p-2 rounded border mt-1">
                {window.location.origin}/submit/{orgDomain}/{linkToken}
              </code>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LinkTester;
