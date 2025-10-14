import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, FileText, Globe, Users, ChevronRight } from 'lucide-react';
import { BlogEditor } from './BlogEditor';
import { SEOSettings } from './SEOSettings';
import { useOrganization } from '@/hooks/useOrganization';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

type AdminSection = 'blog' | 'seo';

interface AdminMenuItem {
  id: AdminSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const adminMenuItems: AdminMenuItem[] = [
  {
    id: 'blog',
    label: 'Blog Management',
    icon: FileText,
    description: 'Create and manage blog posts'
  },
  {
    id: 'seo',
    label: 'SEO Settings',
    icon: Globe,
    description: 'Configure SEO and meta settings'
  }
];

export const AdminPanel = () => {
  const { profile, loading } = useOrganization();
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<AdminSection>('blog');

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
                  <CardTitle className="text-destructive">{t('admin.accessDenied')}</CardTitle>
                  <CardDescription>
                    {t('admin.accessDeniedDescription')}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'blog':
        return <BlogEditor />;
      case 'seo':
        return <SEOSettings />;
      default:
        return <BlogEditor />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('admin.title')}</h1>
                <p className="text-gray-600">{t('admin.description')}</p>
              </div>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {profile?.role === 'admin' ? t('admin.superAdmin') : t('admin.orgAdmin')}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-80 flex-shrink-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Admin Sections</CardTitle>
                <CardDescription>
                  Choose a section to manage
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {adminMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50",
                          isActive && "bg-blue-50 border-r-2 border-blue-600"
                        )}
                      >
                        <Icon className={cn(
                          "h-5 w-5",
                          isActive ? "text-blue-600" : "text-gray-500"
                        )} />
                        <div className="flex-1">
                          <div className={cn(
                            "font-medium",
                            isActive ? "text-blue-900" : "text-gray-900"
                          )}>
                            {item.label}
                          </div>
                          <div className="text-sm text-gray-600">
                            {item.description}
                          </div>
                        </div>
                        <ChevronRight className={cn(
                          "h-4 w-4",
                          isActive ? "text-blue-600" : "text-gray-400"
                        )} />
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  {(() => {
                    const activeItem = adminMenuItems.find(item => item.id === activeSection);
                    const Icon = activeItem?.icon || FileText;
                    return <Icon className="h-6 w-6 text-primary" />;
                  })()}
                  <div>
                    <CardTitle className="text-xl">
                      {adminMenuItems.find(item => item.id === activeSection)?.label}
                    </CardTitle>
                    <CardDescription>
                      {adminMenuItems.find(item => item.id === activeSection)?.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {renderContent()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};