
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Users, FileText, AlertTriangle, CheckCircle, Link as LinkIcon, Shield } from 'lucide-react';
import LinkGenerator from './LinkGenerator';

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
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="links">Submission Links</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">New Reports</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">+2 from yesterday</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
                    <FileText className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">28</div>
                    <p className="text-xs text-muted-foreground">+5 from last week</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Submission Links</CardTitle>
                    <LinkIcon className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">6</div>
                    <p className="text-xs text-muted-foreground">3 active links</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                    <Users className="h-4 w-4 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">8</div>
                    <p className="text-xs text-muted-foreground">Active users</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity and Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Reports</CardTitle>
                    <CardDescription>Latest submissions requiring attention</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">WB-A1B2C3D4</p>
                          <p className="text-sm text-gray-600">Financial misconduct reported</p>
                          <p className="text-xs text-gray-500">2 hours ago</p>
                        </div>
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          New
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">WB-E5F6G7H8</p>
                          <p className="text-sm text-gray-600">Safety violation incident</p>
                          <p className="text-xs text-gray-500">5 hours ago</p>
                        </div>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          In Progress
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">WB-I9J0K1L2</p>
                          <p className="text-sm text-gray-600">HR policy violation</p>
                          <p className="text-xs text-gray-500">1 day ago</p>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Under Review
                        </span>
                      </div>
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
                      <Button className="h-20 flex flex-col items-center justify-center">
                        <LinkIcon className="h-6 w-6 mb-2" />
                        Create Link
                      </Button>
                      <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                        <FileText className="h-6 w-6 mb-2" />
                        View Reports
                      </Button>
                      <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                        <Users className="h-6 w-6 mb-2" />
                        Manage Users
                      </Button>
                      <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                        <AlertTriangle className="h-6 w-6 mb-2" />
                        Urgent Cases
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="links">
              <LinkGenerator />
            </TabsContent>

            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>Reports Management</CardTitle>
                  <CardDescription>View and manage all submitted reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Reports management interface coming soon...</p>
                </CardContent>
              </Card>
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
