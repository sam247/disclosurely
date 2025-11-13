import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FeatureFlagManager } from './FeatureFlagManager';
import ChatAdminView from '@/components/dashboard/ChatAdminView';
import SystemHealthDashboard from '@/components/dashboard/SystemHealthDashboard';
import { InstantlyAdminView } from './InstantlyAdminView';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useAuth } from '@/hooks/useAuth';

type AdminSection = 'features' | 'chat' | 'health' | 'instantly';

export const AdminPanel = () => {
  const { user } = useAuth();
  const { section } = useParams<{ section?: string }>();
  const navigate = useNavigate();
  const { loading: rolesLoading } = useUserRoles();
  
  // STRICT OWNER CHECK - Only sampettiford@googlemail.com
  // This is the final security layer - checks are also done in:
  // 1. DashboardSidebar (to hide menu item)
  // 2. OwnerOnlyRoute (to block direct URL access)
  // 3. Here (as final check in component)
  const isOwner = user?.email === 'sampettiford@googlemail.com';

  // Redirect to default section if no section specified
  useEffect(() => {
    if (!section) {
      navigate('/dashboard/admin/features', { replace: true });
    }
  }, [section, navigate]);

  if (rolesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // STRICT CHECK: Block access if not owner
  if (!isOwner) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2 text-destructive">Access Denied</h3>
          <p className="text-muted-foreground">
            This area is restricted to the owner only.
          </p>
        </div>
      </div>
    );
  }

  // Validate section and render content
  const validSection = (section && ['features', 'chat', 'health', 'instantly'].includes(section)) 
    ? section as AdminSection 
    : 'features';

  const renderContent = () => {
    switch (validSection) {
      case 'features':
        return <FeatureFlagManager />;
      case 'chat':
        return <ChatAdminView />;
      case 'health':
        return <SystemHealthDashboard />;
      case 'instantly':
        return <InstantlyAdminView />;
      default:
        return <FeatureFlagManager />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {renderContent()}
    </div>
  );
};
