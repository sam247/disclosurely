import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

/**
 * Middleware component that handles 301 redirects between subdomain and custom domain URLs
 * based on the organization's active_url_type setting.
 * 
 * Rules:
 * - If org.active_url_type === 'custom_domain' and user visits subdomain → redirect to custom domain
 * - If org.active_url_type === 'subdomain' and user visits custom domain → redirect to subdomain
 * - Only redirects on /report, /submit, /whistleblow routes
 */
const UrlRedirectMiddleware = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    const checkAndRedirect = async () => {
      // Only check redirects for report submission routes
      const reportRoutes = ['/report', '/submit', '/whistleblow'];
      if (!reportRoutes.includes(location.pathname)) {
        return;
      }

      const currentHost = window.location.hostname;
      const currentPath = location.pathname;
      const currentProtocol = window.location.protocol;

      // Skip redirect checks on localhost or development domains
      if (
        currentHost === 'localhost' ||
        currentHost.includes('lovable.app') ||
        currentHost.includes('127.0.0.1')
      ) {
        return;
      }

      try {
        // Check if we're on a subdomain (e.g., {subdomain}.disclosurely.com)
        const subdomainMatch = currentHost.match(/^([^.]+)\.disclosurely\.com$/);
        let organizationId: string | null = null;
        let activeUrlType: string | null = null;
        let customDomain: string | null = null;
        let orgDomain: string | null = null;
        let customDomainVerified = false;

        if (subdomainMatch) {
          const slug = subdomainMatch[1];
          
          // Skip if it's the main app domain
          if (slug === 'app' || slug === 'www' || slug === 'secure') {
            return;
          }

          // Look up organization by domain slug
          const { data: org, error } = await supabase
            .from('organizations')
            .select('id, domain, active_url_type, custom_domain, custom_domain_verified')
            .eq('domain', slug)
            .eq('is_active', true)
            .single();

          if (!error && org) {
            organizationId = org.id;
            activeUrlType = org.active_url_type || 'subdomain';
            customDomain = org.custom_domain;
            orgDomain = org.domain;
            customDomainVerified = org.custom_domain_verified || false;
          }
        } else {
          // Check if we're on a custom domain
          // Use custom_domains table (more reliable than organizations.custom_domain)
          const { data: customDomainData, error: customDomainError } = await supabase
            .from('custom_domains')
            .select('organization_id, domain_name, is_active, status')
            .eq('domain_name', currentHost)
            .eq('is_active', true)
            .eq('status', 'active')
            .maybeSingle();

          if (!customDomainError && customDomainData) {
            // Now fetch the organization using the organization_id
            const { data: org, error: orgError } = await supabase
              .from('organizations')
              .select('id, domain, active_url_type, custom_domain, custom_domain_verified')
              .eq('id', customDomainData.organization_id)
              .eq('is_active', true)
              .maybeSingle();

            if (!orgError && org) {
            organizationId = org.id;
            activeUrlType = org.active_url_type || 'subdomain';
              customDomain = customDomainData.domain_name; // Use domain from custom_domains table
            orgDomain = org.domain;
              customDomainVerified = customDomainData.status === 'active';
            }
          }
        }

        if (!organizationId || !activeUrlType) {
          return; // No organization found or no active_url_type set
        }

        // Determine if we need to redirect
        const isOnSubdomain = subdomainMatch !== null;
        const isOnCustomDomain = !isOnSubdomain && customDomain === currentHost;

        if (activeUrlType === 'custom_domain') {
          // Should be on custom domain
          if (isOnSubdomain && customDomain && customDomainVerified) {
            // Redirect from subdomain to custom domain
            const newUrl = `${currentProtocol}//${customDomain}${currentPath}${window.location.search}`;
            setRedirectUrl(newUrl);
            setShouldRedirect(true);
            // Perform 301 redirect
            window.location.replace(newUrl);
            return;
          }
        } else if (activeUrlType === 'subdomain') {
          // Should be on subdomain
          if (isOnCustomDomain && orgDomain) {
            // Redirect from custom domain to subdomain
            const newUrl = `${currentProtocol}//${orgDomain}.disclosurely.com${currentPath}${window.location.search}`;
            setRedirectUrl(newUrl);
            setShouldRedirect(true);
            // Perform 301 redirect
            window.location.replace(newUrl);
            return;
          }
        }
      } catch (error) {
        console.error('Error checking URL redirect:', error);
        // Don't block rendering on error
      }
    };

    checkAndRedirect();
  }, [location.pathname, location.search]);

  // Show loading state while redirecting
  if (shouldRedirect && redirectUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default UrlRedirectMiddleware;

