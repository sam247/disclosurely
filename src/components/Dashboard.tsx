
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, FileText, CreditCard, Plus, Copy, ExternalLink } from "lucide-react";
import { useOrganization } from "@/hooks/useOrganization";
import DashboardStats from "./DashboardStats";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface OrganizationLink {
  id: string;
  name: string;
  link_token: string;
  usage_count: number;
}

const Dashboard = () => {
  const { organization } = useOrganization();
  const { user } = useAuth();
  const { toast } = useToast();
  const [links, setLinks] = useState<OrganizationLink[]>([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('Inactive');

  useEffect(() => {
    if (user) {
      fetchLinks();
      checkSubscription();
    }
  }, [user]);

  const fetchLinks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('organization_links')
        .select('id, name, link_token, usage_count')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching links:', error);
        return;
      }

      setLinks(data || []);
    } catch (error) {
      console.error('Error in fetchLinks:', error);
    }
  };

  const checkSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;
      setSubscriptionStatus(data?.subscribed ? 'Active' : 'Inactive');
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const copyLink = (token: string) => {
    const link = `${window.location.origin}/secure/tool/submit/${token}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied!",
      description: "The submission link has been copied to your clipboard.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.email}</p>
              </div>
            </div>
            <Button variant="outline">Sign out</Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Subscription
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-6">
            {/* Stats Cards */}
            <DashboardStats />

            {/* Subscription Required Notice */}
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-orange-800">Subscription Required</h3>
                    <p className="text-orange-700">A subscription is required to create submission links and manage reports.</p>
                  </div>
                  <Button className="bg-orange-600 hover:bg-orange-700">View Plans</Button>
                </div>
              </CardContent>
            </Card>

            {/* Link Creation Area */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center">
                    <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Link Created</h3>
                    <p className="text-gray-600 mb-4">Subscription required</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submission Link Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Submission Link</h2>
              <p className="text-gray-600 mb-6">Your organization's secure report submission link</p>
              
              {links.length > 0 ? (
                links.map((link) => (
                  <Card key={link.id} className="mb-4">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{link.name}</h3>
                          <p className="text-sm text-gray-600">Used {link.usage_count} times</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <code className="px-3 py-1 bg-gray-100 rounded text-sm">
                            /secure/tool/submit/{link.link_token}
                          </code>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => copyLink(link.link_token)}
                          >
                            Copy Link
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <ExternalLink className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No submission links created yet</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Reports Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Reports</h2>
              <p className="text-gray-600 mb-6">All report submissions</p>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No reports submitted yet</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Subscription Status
                </CardTitle>
                <CardDescription>
                  Manage your subscription and billing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Current Plan</h3>
                      <p className="text-sm text-gray-600">Status: {subscriptionStatus}</p>
                    </div>
                    <Button>Manage Subscription</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
