import { useEffect } from 'react';

interface SubdomainRedirectProps {
  targetPath: string;
  children?: React.ReactNode;
}

const SubdomainRedirect = ({ targetPath, children }: SubdomainRedirectProps) => {
  useEffect(() => {
    const currentHost = window.location.hostname;
    
    // Only redirect if we're on disclosurely.com (not app.disclosurely.com or localhost)
    if (currentHost === 'disclosurely.com') {
      const newUrl = `https://app.disclosurely.com${targetPath}`;
      window.location.href = newUrl;
      return;
    }
  }, [targetPath]);

  // Render children if we're already on the correct subdomain or localhost
  return <>{children}</>;
};

export default SubdomainRedirect;