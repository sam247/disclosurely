import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

interface OwnerOnlyRouteProps {
  children: ReactNode;
}

/**
 * STRICT OWNER-ONLY ROUTE PROTECTION
 * Only allows access to sampettiford@googlemail.com
 * This check is done in multiple layers for absolute security:
 * 1. In the sidebar (to hide the menu item)
 * 2. In this route wrapper (to block direct URL access)
 * 3. In the component itself (as a final check)
 */
const OwnerOnlyRoute = ({ children }: OwnerOnlyRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // STRICT CHECK: Only sampettiford@googlemail.com
  const isOwner = user?.email === 'sampettiford@googlemail.com';

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-background p-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-destructive" />
              <div>
                <CardTitle className="text-destructive">Access Denied</CardTitle>
                <CardDescription>
                  This area is restricted to the owner only.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You do not have permission to access this area.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default OwnerOnlyRoute;

