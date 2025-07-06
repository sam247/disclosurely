
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Users, 
  FileText, 
  AlertTriangle, 
  Settings,
  Copy,
  ExternalLink
} from 'lucide-react';
import ReportsManagement from './ReportsManagement';
import SettingsPanel from './SettingsPanel';
import AICaseHelper from './AICaseHelper';

interface Profile {
  id: string;
  email: string;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('cases');
  const [showSettings, setShowSettings] = useState(false);

  // Fetch profile data
  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user,
  });

  // Fetch verified custom domains and subdomains
  const { data: customDomains } = useQuery({
    queryKey: ['custom-domains'],
    queryFn: async () => {
      if (!user) return [];

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) return [];

      const { data: domains } = await supabase
        .from('domain_verifications')
        .select('domain, verified_at, verification_type')
        .eq('organization_id', profile.organization_id)
        .not('verified_at', 'is', null);

      return domains || [];
    },
    enabled: !!user,
  });

  // Get the primary domain (prefer subdomain for immediate availability)
  const primaryDomain = customDomains?.find(d => d.verification_type === 'SUBDOMAIN')?.domain || null;

  const handleSignOut = async () => {
    await signOut();
  };

  const getSubmissionUrl = () => {
    return `${window.location.origin}/secure/tool`;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${label} copied!`,
      description: "The value has been copied to your clipboard.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              {/* Only show welcome message on larger screens */}
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <span>Welcome back, {profile?.email}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cases">Cases</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="ai-help" className="relative">
              AI Case Help
              <Badge 
                variant="secondary" 
                className="ml-2 text-xs bg-purple-100 text-purple-800 border-purple-200"
              >
                PRO
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cases" className="mt-6">
            {/* Submission Link Section */}
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ExternalLink className="h-5 w-5" />
                    Submission Link
                  </CardTitle>
                  <CardDescription>
                    Your organization's secure report submission link
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="submission-link" className="text-sm font-medium">
                        Default Submission URL
                      </Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          id="submission-link"
                          value={getSubmissionUrl()}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(getSubmissionUrl(), 'Submission link')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(getSubmissionUrl(), '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {primaryDomain && (
                      <div>
                        <Label className="text-sm font-medium">
                          Branded Subdomain URL
                        </Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Input
                            value={`https://${primaryDomain}/secure/tool`}
                            readOnly
                            className="font-mono text-sm"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(`https://${primaryDomain}/secure/tool`, 'Branded submission link')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`https://${primaryDomain}/secure/tool`, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                          ✓ Using your branded subdomain
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
                  <CardDescription className="text-xs text-gray-500">All cases submitted</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4 text-gray-500" />
                    <span className="text-2xl font-bold">42</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <CardDescription className="text-xs text-gray-500">Users with active accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-2xl font-bold">12</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Reports Generated</CardTitle>
                  <CardDescription className="text-xs text-gray-500">Number of reports generated</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-2xl font-bold">15</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Potential Risks</CardTitle>
                  <CardDescription className="text-xs text-gray-500">Identified potential risks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-gray-500" />
                    <span className="text-2xl font-bold">3</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Case List */}
            <ReportsManagement />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <ReportsManagement />
          </TabsContent>

          <TabsContent value="ai-help" className="mt-6">
            <AICaseHelper hasAccess={true} />
          </TabsContent>
        </Tabs>
      </div>

      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
};

export default Dashboard;
