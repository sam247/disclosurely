
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Users, FileText, Bell, Settings, MessageSquare, Eye, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data
  const stats = {
    totalReports: 24,
    pendingReports: 7,
    inProgress: 11,
    resolved: 6,
    thisMonth: 8,
    lastMonth: 16
  };

  const recentReports = [
    { id: "RPT-001", title: "Financial irregularities in Q3", status: "pending", priority: "high", date: "2024-06-17" },
    { id: "RPT-002", title: "Safety violation in warehouse", status: "in_progress", priority: "medium", date: "2024-06-16" },
    { id: "RPT-003", title: "Harassment complaint", status: "pending", priority: "high", date: "2024-06-15" },
    { id: "RPT-004", title: "Data privacy concern", status: "resolved", priority: "low", date: "2024-06-14" },
    { id: "RPT-005", title: "Procurement fraud allegation", status: "in_progress", priority: "high", date: "2024-06-13" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "resolved": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-orange-100 text-orange-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">SecureWhistle</span>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <h1 className="text-xl font-semibold text-gray-900">Organization Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/">Back to Site</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4 space-y-2">
            <Button
              variant={activeTab === "overview" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("overview")}
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Overview
            </Button>
            <Button
              variant={activeTab === "reports" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("reports")}
            >
              <FileText className="h-4 w-4 mr-2" />
              All Reports
            </Button>
            <Button
              variant={activeTab === "analytics" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("analytics")}
            >
              <Eye className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <Button
              variant={activeTab === "users" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("users")}
            >
              <Users className="h-4 w-4 mr-2" />
              Team Management
            </Button>
            <Button
              variant={activeTab === "messages" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("messages")}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{stats.totalReports}</div>
                    <p className="text-xs text-gray-500 mt-1">All time</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Pending Review</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">{stats.pendingReports}</div>
                    <p className="text-xs text-gray-500 mt-1">Requires attention</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                    <p className="text-xs text-gray-500 mt-1">Being investigated</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{stats.thisMonth}</div>
                    <p className="text-xs text-gray-500 mt-1">New reports</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Reports */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Reports</CardTitle>
                  <CardDescription>Latest submissions requiring attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentReports.map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="font-medium text-gray-900">{report.id}</span>
                            <Badge variant="outline" className={getPriorityColor(report.priority)}>
                              {report.priority}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mt-1">{report.title}</p>
                          <p className="text-sm text-gray-500 mt-1">{report.date}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={getStatusColor(report.status)}>
                            {report.status.replace('_', ' ')}
                          </Badge>
                          <Button size="sm" variant="outline">View</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">All Reports</h2>
                <div className="flex space-x-2">
                  <Button variant="outline">Filter</Button>
                  <Button variant="outline">Export</Button>
                </div>
              </div>
              <Card>
                <CardContent className="p-6">
                  <p className="text-gray-500 text-center py-8">Reports management interface would be implemented here</p>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Analytics & Insights</h2>
              <Card>
                <CardContent className="p-6">
                  <p className="text-gray-500 text-center py-8">Analytics dashboard would be implemented here</p>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
              <Card>
                <CardContent className="p-6">
                  <p className="text-gray-500 text-center py-8">User management interface would be implemented here</p>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "messages" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Secure Messages</h2>
              <Card>
                <CardContent className="p-6">
                  <p className="text-gray-500 text-center py-8">Encrypted messaging interface would be implemented here</p>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
