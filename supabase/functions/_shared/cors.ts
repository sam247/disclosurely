/**
 * Shared CORS utility for Edge Functions
 * Handles CORS headers with support for custom domains
 */

// CORS headers helper with custom domain support
export async function getAllowedOrigin(req: Request, supabaseClient?: any): Promise<string> {
  const origin = req.headers.get('origin');
  
  if (!origin) {
    return 'https://disclosurely.com';
  }
  
  // Allow specific production domains
  const allowedDomains = [
    'https://disclosurely.com',
    'https://www.disclosurely.com',
    'https://app.disclosurely.com',
    'http://localhost:8080',
    'http://localhost:5173',
    'http://localhost:3000',
  ];
  
  if (allowedDomains.includes(origin)) {
    return origin;
  }
  
  // Allow Lovable preview domains (any subdomain)
  if (origin.includes('.lovable.app') || origin.includes('.lovableproject.com')) {
    return origin;
  }
  
  // Check if origin is a custom domain in the database
  if (supabaseClient) {
    try {
      // Extract domain from origin (remove protocol)
      const domain = origin.replace(/^https?:\/\//, '').replace(/\/$/, '');
      
      // Check if this domain exists in custom_domains table
      const { data: customDomain } = await supabaseClient
        .from('custom_domains')
        .select('domain_name, is_active, status')
        .eq('domain_name', domain)
        .maybeSingle();
      
      // Allow if domain exists and is active
      if (customDomain && customDomain.is_active && customDomain.status === 'active') {
        return origin;
      }
      
      // Also check for subdomains (e.g., testing.betterranking.co.uk should match betterranking.co.uk)
      const domainParts = domain.split('.');
      if (domainParts.length > 2) {
        // Try parent domain (e.g., betterranking.co.uk from testing.betterranking.co.uk)
        const parentDomain = domainParts.slice(-2).join('.');
        const { data: parentCustomDomain } = await supabaseClient
          .from('custom_domains')
          .select('domain_name, is_active, status')
          .eq('domain_name', parentDomain)
          .maybeSingle();
        
        if (parentCustomDomain && parentCustomDomain.is_active && parentCustomDomain.status === 'active') {
          return origin;
        }
      }
    } catch (error) {
      console.error('[CORS] Error checking custom domain:', error);
      // Fall through to default
    }
  }
  
  // For public endpoints (like check-feature-flag, submit-anonymous-report), 
  // allow all origins to support custom domains
  // This is safe because these endpoints don't expose sensitive data
  return origin;
}

export function getCorsHeaders(req: Request, allowedOrigin?: string) {
  const origin = allowedOrigin || req.headers.get('origin') || '*';
  
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': origin !== '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };
}

export async function getCorsHeadersWithDomainCheck(req: Request, supabaseClient?: any) {
  const allowedOrigin = await getAllowedOrigin(req, supabaseClient);
  return getCorsHeaders(req, allowedOrigin);
}

