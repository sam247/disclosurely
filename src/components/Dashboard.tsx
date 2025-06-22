
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Users, FileText, AlertTriangle, CheckCircle, Link as LinkIcon, Shield } from 'lucide-react';
import LinkGenerator from './LinkGenerator';
import LinkTester from './LinkTester';
import ReportsManagement from './ReportsManagement';
import UserManagement from './UserManagement';
import NotificationSystem from './NotificationSystem';
import DashboardStats from './DashboardStats';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate('/auth/login');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Disclosurely Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationSystem />
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="links">Submission Links</TabsTrigger>
              <TabsTrigger value="test">Test Links</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Real Stats from DashboardStats component */}
              <DashboardStats />

              {/* Recent Activity and Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Reports</CardTitle>
                    <CardDescription>Latest submissions requiring attention</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No recent reports found</p>
                      <p className="text-sm">Reports will appear here once submitted</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common tasks and navigation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        onClick={() => {
                          const element = document.querySelector('[value="links"]');
                          if (element) {
                            (element as HTMLElement).click();
                          }
                        }}
                        className="h-20 flex flex-col items-center justify-center"
                      >
                        <LinkIcon className="h-6 w-6 mb-2" />
                        Create Link
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          const element = document.querySelector('[value="reports"]');
                          if (element) {
                            (element as HTMLElement).click();
                          }
                        }}
                        className="h-20 flex flex-col items-center justify-center"
                      >
                        <FileText className="h-6 w-6 mb-2" />
                        View Reports
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          const element = document.querySelector('[value="users"]');
                          if (element) {
                            (element as HTMLElement).click();
                          }
                        }}
                        className="h-20 flex flex-col items-center justify-center"
                      >
                        <Users className="h-6 w-6 mb-2" />
                        Manage Users
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          const element = document.querySelector('[value="reports"]');
                          if (element) {
                            (element as HTMLElement).click();
                          }
                        }}
                        className="h-20 flex flex-col items-center justify-center"
                      >
                        <AlertTriangle className="h-6 w-6 mb-2" />
                        View All Cases
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reports">
              <ReportsManagement />
            </TabsContent>

            <TabsContent value="users">
              <UserManagement />
            </TabsContent>

            <TabsContent value="links">
              <LinkGenerator />
            </TabsContent>

            <TabsContent value="test">
              <LinkTester />
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Organization Settings</CardTitle>
                  <CardDescription>Manage your organization profile and preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Settings interface coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
