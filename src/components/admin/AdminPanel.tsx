import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Settings, FileText, Edit, Globe, Users } from 'lucide-react';
import { AdminContentEditor } from './AdminContentEditor';
import { BlogEditor } from './BlogEditor';
import { useOrganization } from '@/hooks/useOrganization';

export const AdminPanel = () => {
  const { profile, loading } = useOrganization();

  // Debug logging
  console.log('AdminPanel - Profile:', profile);
  console.log('AdminPanel - Loading:', loading);

  // Check if user has admin permissions
  const isAdmin = profile?.role === 'admin' || profile?.role === 'org_admin';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Settings className="h-6 w-6 text-destructive" />
                <div>
                  <CardTitle className="text-destructive">Access Denied</CardTitle>
                  <CardDescription>
                    You don't have permission to access the admin panel. 
                    Please contact your organization administrator.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-gray-600">Manage your organization's content and settings</p>
              </div>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {profile?.role === 'admin' ? 'Super Admin' : 'Organization Admin'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8">
        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Page Content
            </TabsTrigger>
            <TabsTrigger value="blog" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Blog
            </TabsTrigger>
            <TabsTrigger value="pages" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Pages
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <div className="space-y-6">
              <AdminContentEditor
                pageIdentifier="landing_hero"
                title="Landing Page - Hero Section"
                description="Edit the main hero section content on your landing page"
              />
              
              <AdminContentEditor
                pageIdentifier="landing_features"
                title="Landing Page - Features Section"
                description="Edit the features section content"
              />
              
              <AdminContentEditor
                pageIdentifier="landing_compliance"
                title="Landing Page - Compliance Section"
                description="Edit compliance and certification content"
              />

              <AdminContentEditor
                pageIdentifier="about"
                title="About Page Content"
                description="Edit content for the about page"
              />

              <AdminContentEditor
                pageIdentifier="contact"
                title="Contact Page Content"
                description="Edit contact information and messaging"
              />
            </div>
          </TabsContent>

          <TabsContent value="blog" className="space-y-6">
            <BlogEditor />
          </TabsContent>

          <TabsContent value="pages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Page Management</CardTitle>
                <CardDescription>
                  Manage individual pages and their content structure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Page management features coming soon. This will allow you to create, 
                  edit, and manage individual pages beyond the main content areas.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Settings</CardTitle>
                <CardDescription>
                  Configure content management settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Advanced content settings will be available here, including:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
                  <li>Default content templates</li>
                  <li>Content approval workflows</li>
                  <li>SEO settings and meta defaults</li>
                  <li>Content versioning preferences</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};