
import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrganization } from '@/hooks/useOrganization';
import { Skeleton } from '@/components/ui/skeleton';

interface OrganizationRouteProps {
  children: ReactNode;
}

const OrganizationRoute = ({ children }: OrganizationRouteProps) => {
  const { hasOrganization, loading, needsOnboarding } = useOrganization();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && needsOnboarding) {
      navigate('/onboarding');
    }
  }, [loading, needsOnboarding, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    );
  }

  if (needsOnboarding || !hasOrganization()) {
    return null; // Will redirect to onboarding
  }

  return <>{children}</>;
};

export default OrganizationRoute;
