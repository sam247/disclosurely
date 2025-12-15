import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FeatureFlagManager } from './FeatureFlagManager';
import SystemHealthDashboard from '@/components/dashboard/SystemHealthDashboard';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useAuth } from '@/hooks/useAuth';

type AdminSection = 'features' | 'health';

export const AdminPanel = () => {
  const { user } = useAuth();
  const { section } = useParams<{ section?: string }>();
  const navigate = useNavigate();
  const { isAdmin, isOrgAdmin, loading: rolesLoading } = useUserRoles();
  
  // Final security layer - aligns with sidebar and route guard
  // Allow org admins alongside system admins for admin console access
  const isOwner = isAdmin || isOrgAdmin;

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
            This area is restricted to administrators.
          </p>
        </div>
      </div>
    );
  }

  // Validate section and render content
  const validSection = (section && ['features', 'health'].includes(section)) 
    ? section as AdminSection 
    : 'features';

  const renderContent = () => {
    switch (validSection) {
      case 'features':
        return <FeatureFlagManager />;
      case 'health':
        return <SystemHealthDashboard />;
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
