import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, FileText, Globe, Users, ChevronRight, Flag, MessageCircle, Activity } from 'lucide-react';
import { BlogEditor } from './BlogEditor';
import { SEOSettings } from './SEOSettings';
import { FeatureFlagManager } from './FeatureFlagManager';
import ChatAdminView from '@/components/dashboard/ChatAdminView';
import SystemHealthDashboard from '@/components/dashboard/SystemHealthDashboard';
import { useOrganization } from '@/hooks/useOrganization';
import { useTranslation } from 'react-i18next';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

type AdminSection = 'blog' | 'seo' | 'features' | 'chat' | 'health';

interface AdminMenuItem {
  id: AdminSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const adminMenuItems: AdminMenuItem[] = [
  {
    id: 'features',
    label: 'Feature Flags',
    icon: Flag,
    description: 'Control feature rollout and instant rollback'
  },
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
  },
  {
    id: 'chat',
    label: 'Chat Support',
    icon: MessageCircle,
    description: 'Manage AI chat conversations and support'
  },
  {
    id: 'health',
    label: 'System Health',
    icon: Activity,
    description: 'Monitor system performance and health metrics'
  }
];

export const AdminPanel = () => {
  const { profile, loading } = useOrganization();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<AdminSection>('features');

  const { isOrgAdmin, isAdmin: isSuperAdmin, loading: rolesLoading } = useUserRoles();
  
  // Check if user is Disclosurely team member (by email domain or super admin)
  const isDisclosurelyTeam = user?.email?.endsWith('@disclosurely.com') || isSuperAdmin;
  
  // Debug logging
  
  

  // Check if user has admin permissions
  const isAdmin = isOrgAdmin || isSuperAdmin;

  if (loading || rolesLoading) {
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
      case 'features':
        return <FeatureFlagManager />;
      case 'blog':
        return <BlogEditor />;
      case 'seo':
        return <SEOSettings />;
      case 'chat':
        // Only show chat admin to Disclosurely team
        if (!isDisclosurelyTeam) {
          return (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
              <p className="text-muted-foreground">
                Chat admin is only available to Disclosurely team members.
              </p>
            </div>
          );
        }
        return <ChatAdminView />;
      case 'health':
        // Only show system health to Disclosurely team
        if (!isDisclosurelyTeam) {
          return (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
              <p className="text-muted-foreground">
                System health dashboard is only available to Disclosurely team members.
              </p>
            </div>
          );
        }
        return <SystemHealthDashboard />;
      default:
        return <FeatureFlagManager />;
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
              {isSuperAdmin ? t('admin.superAdmin') : t('admin.orgAdmin')}
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
                    // Hide chat admin from non-Disclosurely team members
                    if (item.id === 'chat' && !isDisclosurelyTeam) {
                      return null;
                    }
                    
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