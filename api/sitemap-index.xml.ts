type VercelRequest = {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  setHeader: (name: string, value: string) => void;
  send: (body: string) => void;
  json: (body: unknown) => void;
};

/**
 * Sitemap Index for multiple subdomains
 * 
 * This generates a sitemap index that references:
 * - Main site sitemap (disclosurely.com)
 * - Docs site sitemap (docs.disclosurely.com) - if you configure it separately
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const now = new Date().toISOString().split('T')[0];

  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://disclosurely.com/sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://docs.disclosurely.com/sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  
  return res.status(200).send(sitemapIndex);
}

