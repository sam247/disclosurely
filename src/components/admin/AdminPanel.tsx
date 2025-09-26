import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Settings, FileText, Globe, Users } from 'lucide-react';
import { BlogEditor } from './BlogEditor';
import { SEOSettings } from './SEOSettings';
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
        <Tabs defaultValue="blog" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="blog" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Blog Management
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              SEO Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="blog" className="space-y-6">
            <BlogEditor />
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <SEOSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};