
import { ReactNode } from 'react';

interface OrganizationRouteProps {
  children: ReactNode;
}

const OrganizationRoute = ({ children }: OrganizationRouteProps) => {
  // Simplified: just render children without organization checks
  return <>{children}</>;
};

export default OrganizationRoute;
