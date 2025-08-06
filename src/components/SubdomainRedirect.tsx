
import { useEffect } from 'react';

interface SubdomainRedirectProps {
  targetPath: string;
  children?: React.ReactNode;
}

const SubdomainRedirect = ({ targetPath, children }: SubdomainRedirectProps) => {
  useEffect(() => {
    const currentHost = window.location.hostname;
    const currentPath = window.location.pathname;
    
    // If we're on app subdomain and NOT on auth/dashboard pages, redirect to main domain
    if (currentHost === 'app.disclosurely.com' && 
        !currentPath.startsWith('/dashboard') && 
        !currentPath.startsWith('/auth/') && 
        currentPath !== '/login' && 
        currentPath !== '/signup') {
      const newUrl = `https://disclosurely.com${currentPath}`;
      window.location.href = newUrl;
      return;
    }
    
    // Only redirect to app subdomain for specific auth and dashboard paths
    if (currentHost === 'disclosurely.com' && 
        (currentPath.startsWith('/dashboard') || 
         currentPath.startsWith('/auth/') || 
         currentPath === '/login' || 
         currentPath === '/signup')) {
      const newUrl = `https://app.disclosurely.com${currentPath}`;
      window.location.href = newUrl;
      return;
    }
  }, [targetPath]);

  // Render children if we're already on the correct subdomain or localhost
  return <>{children}</>;
};

export default SubdomainRedirect;
