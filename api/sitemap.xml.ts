import { createClient } from 'contentful';

type VercelRequest = {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  setHeader: (name: string, value: string) => void;
  send: (body: string) => void;
  json: (body: any) => void;
};

// Contentful configuration
const CONTENTFUL_SPACE_ID = process.env.VITE_CONTENTFUL_SPACE_ID || 'rm7hib748uv7';
const CONTENTFUL_DELIVERY_TOKEN = process.env.VITE_CONTENTFUL_DELIVERY_TOKEN || 'e3JfeWQKBvfCQoqi22f6F_XzWgbZPXR9JWTyuSTGcFw';

const client = createClient({
  space: CONTENTFUL_SPACE_ID,
  accessToken: CONTENTFUL_DELIVERY_TOKEN,
});

// Supported languages
const LANGUAGES = ['en', 'es', 'fr', 'de', 'pl', 'sv', 'no', 'pt', 'it', 'nl', 'da', 'el'];

// Static routes (exclude authenticated and dynamic routes)
const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/pricing', priority: '0.8', changefreq: 'monthly' },
  { path: '/about', priority: '0.7', changefreq: 'monthly' },
  { path: '/features', priority: '0.7', changefreq: 'monthly' },
  { path: '/careers', priority: '0.6', changefreq: 'monthly' },
  { path: '/contact', priority: '0.6', changefreq: 'monthly' },
  { path: '/blog', priority: '0.7', changefreq: 'weekly' },
  { path: '/terms', priority: '0.3', changefreq: 'yearly' },
  { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
  { path: '/vs-speakup', priority: '0.5', changefreq: 'monthly' },
  { path: '/vs-whistleblower-software', priority: '0.5', changefreq: 'monthly' },
  { path: '/compliance-software', priority: '0.5', changefreq: 'monthly' },
  { path: '/whistleblowing-directive', priority: '0.5', changefreq: 'monthly' },
];

const BASE_URL = 'https://disclosurely.com';
const DOCS_URL = 'https://docs.disclosurely.com';

interface UrlEntry {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
  alternates?: { hreflang: string; href: string }[];
}

function generateSitemapEntries(): UrlEntry[] {
  const entries: UrlEntry[] = [];
  const now = new Date().toISOString().split('T')[0];

  // Generate entries for static routes with language variants
  STATIC_ROUTES.forEach(route => {
    // Add default (English) version
    entries.push({
      loc: `${BASE_URL}${route.path}`,
      lastmod: now,
      changefreq: route.changefreq,
      priority: route.priority,
      alternates: [
        { hreflang: 'x-default', href: `${BASE_URL}${route.path}` },
        { hreflang: 'en', href: `${BASE_URL}${route.path}` },
        ...LANGUAGES.map(lang => ({
          hreflang: lang,
          href: `${BASE_URL}/${lang}${route.path}`,
        })),
      ],
    });

    // Add language-specific versions
    LANGUAGES.forEach(lang => {
      entries.push({
        loc: `${BASE_URL}/${lang}${route.path}`,
        lastmod: now,
        changefreq: route.changefreq,
        priority: (parseFloat(route.priority) * 0.9).toFixed(1), // Slightly lower priority for translations
        alternates: [
          { hreflang: 'x-default', href: `${BASE_URL}${route.path}` },
          { hreflang: 'en', href: `${BASE_URL}${route.path}` },
          ...LANGUAGES.map(l => ({
            hreflang: l,
            href: `${BASE_URL}/${l}${route.path}`,
          })),
        ],
      });
    });
  });

  return entries;
}

async function fetchBlogPosts(): Promise<UrlEntry[]> {
  try {
    const entries: UrlEntry[] = [];
    const now = new Date().toISOString().split('T')[0];

    const response = await client.getEntries({
      content_type: '9oYANGj5uBRT6UHsl5LxO', // Blog Post content type ID
      'fields.status': 'published',
      order: '-fields.publishDate',
      limit: 1000, // Get all blog posts
    });

    response.items.forEach((item: any) => {
      const slug = item.fields.slug;
      const publishDate = item.fields.publishDate 
        ? new Date(item.fields.publishDate).toISOString().split('T')[0]
        : now;
      const updatedDate = item.sys.updatedAt 
        ? new Date(item.sys.updatedAt).toISOString().split('T')[0]
        : publishDate;

      if (slug) {
        entries.push({
          loc: `${BASE_URL}/blog/${slug}`,
          lastmod: updatedDate,
          changefreq: 'monthly',
          priority: '0.6',
        });
      }
    });

    return entries;
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error);
    return [];
  }
}

function generateSitemapXML(entries: UrlEntry[]): string {
  const urlset = entries.map(entry => {
    const alternates = entry.alternates
      ? entry.alternates.map(alt => 
          `    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${alt.href}" />`
        ).join('\n')
      : '';

    return `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>${alternates ? '\n' + alternates : ''}
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlset}
</urlset>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Generate static route entries
    const staticEntries = generateSitemapEntries();
    
    // Fetch blog posts from Contentful
    const blogEntries = await fetchBlogPosts();
    
    // Combine all entries
    const allEntries = [...staticEntries, ...blogEntries];
    
    // Generate XML
    const sitemap = generateSitemapXML(allEntries);
    
    // Set proper headers
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    
    return res.status(200).send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return res.status(500).json({ error: 'Failed to generate sitemap' });
  }
}

