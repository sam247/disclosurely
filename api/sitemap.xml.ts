import { createClient } from 'contentful';
import { readdir } from 'fs/promises';
import { join } from 'path';

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
const CONTENTFUL_DELIVERY_TOKEN = process.env.VITE_CONTENTFUL_DELIVERY_TOKEN;
if (!CONTENTFUL_DELIVERY_TOKEN) {
  throw new Error('VITE_CONTENTFUL_DELIVERY_TOKEN environment variable is required');
}

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

// Helper function to recursively scan directory for markdown files
async function scanDocsDirectory(dir: string, baseDir: string = dir): Promise<string[]> {
  const paths: string[] = [];

  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip hidden directories and build output
        if (!entry.name.startsWith('.') && !entry.name.startsWith('_')) {
          const subPaths = await scanDocsDirectory(fullPath, baseDir);
          paths.push(...subPaths);
        }
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        // Convert file path to URL path
        const relativePath = fullPath.substring(baseDir.length);
        // Remove .md extension and convert to URL path
        let urlPath = relativePath.replace(/\.md$/, '');
        // Convert index.md to directory path
        if (urlPath.endsWith('/index')) {
          urlPath = urlPath.replace(/\/index$/, '');
        }
        // Handle root index
        if (urlPath === '/index' || urlPath === 'index') {
          continue; // Skip root index, we add it separately
        }
        paths.push(urlPath);
      }
    }
  } catch (error) {
    console.error('Error scanning docs directory:', error);
  }

  return paths;
}

interface UrlEntry {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
  alternates?: { hreflang: string; href: string }[];
}

// Helper function to normalize path (remove trailing slash except for root)
function normalizePath(path: string): string {
  if (path === '/' || path === '') {
    return '';
  }
  return path.endsWith('/') ? path.slice(0, -1) : path;
}

function generateSitemapEntries(): UrlEntry[] {
  const entries: UrlEntry[] = [];
  const now = new Date().toISOString().split('T')[0];

  // Generate entries for static routes with language variants
  STATIC_ROUTES.forEach(route => {
    // Normalize path (remove trailing slash)
    const normalizedPath = normalizePath(route.path);
    const basePath = normalizedPath === '' ? '' : normalizedPath;
    
    // Add default (English) version
    entries.push({
      loc: `${BASE_URL}${basePath}`,
      lastmod: now,
      changefreq: route.changefreq,
      priority: route.priority,
      alternates: [
        { hreflang: 'x-default', href: `${BASE_URL}${basePath}` },
        { hreflang: 'en', href: `${BASE_URL}${basePath}` },
        // Only include non-English languages to avoid duplicate 'en' hreflang
        ...LANGUAGES.filter(lang => lang !== 'en').map(lang => ({
          hreflang: lang,
          href: `${BASE_URL}/${lang}${basePath}`,
        })),
      ],
    });

    // Add language-specific versions (exclude 'en' - English is at root path)
    LANGUAGES.filter(lang => lang !== 'en').forEach(lang => {
      entries.push({
        loc: `${BASE_URL}/${lang}${basePath}`,
        lastmod: now,
        changefreq: route.changefreq,
        priority: (parseFloat(route.priority) * 0.9).toFixed(1), // Slightly lower priority for translations
        alternates: [
          { hreflang: 'x-default', href: `${BASE_URL}${basePath}` },
          { hreflang: 'en', href: `${BASE_URL}${basePath}` },
          // Only include non-English languages to avoid duplicate 'en' hreflang
          ...LANGUAGES.filter(l => l !== 'en').map(l => ({
            hreflang: l,
            href: `${BASE_URL}/${l}${basePath}`,
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

async function generateDocsEntries(): Promise<UrlEntry[]> {
  const entries: UrlEntry[] = [];
  const now = new Date().toISOString().split('T')[0];

  // Include homepage
  entries.push({
    loc: DOCS_URL,
    lastmod: now,
    changefreq: 'weekly',
    priority: '0.9',
  });

  try {
    // Dynamically scan the docs directory for all markdown files
    const docsDir = join(process.cwd(), 'docs', 'docs');
    const docsPaths = await scanDocsDirectory(docsDir);

    console.log(`Found ${docsPaths.length} docs pages`);

    // Include all discovered docs pages
    docsPaths.forEach(path => {
      entries.push({
        loc: `${DOCS_URL}${path}`,
        lastmod: now,
        changefreq: 'monthly',
        priority: '0.7', // High priority for docs - valuable SEO content
      });
    });
  } catch (error) {
    console.error('Error generating docs entries:', error);
    // If scanning fails, continue without docs entries
  }

  return entries;
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

    // Generate docs entries (dynamically scanned - unified in main sitemap for better SEO)
    const docsEntries = await generateDocsEntries();

    // Combine all entries - UNIFIED sitemap for consolidated SEO authority
    const allEntries = [...staticEntries, ...blogEntries, ...docsEntries];

    console.log(`Total sitemap entries: ${allEntries.length} (static: ${staticEntries.length}, blog: ${blogEntries.length}, docs: ${docsEntries.length})`);

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

