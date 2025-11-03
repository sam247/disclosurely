# Dynamic Sitemap Generation

## Overview

The sitemap for disclosurely.com is now **dynamically generated** using a Vercel serverless function. This ensures:

- ✅ **Auto-updates** when new blog posts are published in Contentful
- ✅ **All routes included** from the React Router configuration
- ✅ **Multilingual support** with hreflang tags for all 12 languages
- ✅ **Separate docs subdomain** support via sitemap index

## Files

### `/api/sitemap.xml.ts`
- Main sitemap generator
- Fetches blog posts from Contentful automatically
- Includes all static routes with language variants
- Updates automatically when Contentful content changes

### `/api/sitemap-index.xml.ts`
- Sitemap index for multiple subdomains
- References both `disclosurely.com` and `docs.disclosurely.com` sitemaps
- Useful for multi-site SEO

## Configuration

### Vercel Rewrites
The `vercel.json` includes rewrites to route `/sitemap.xml` to the API function:
```json
{
  "rewrites": [
    { "source": "/sitemap.xml", "destination": "/api/sitemap.xml" },
    { "source": "/sitemap-index.xml", "destination": "/api/sitemap-index.xml" }
  ]
}
```

### robots.txt
Currently points to:
```
Sitemap: https://disclosurely.com/sitemap.xml
```

To use the sitemap index instead (includes docs), update to:
```
Sitemap: https://disclosurely.com/sitemap-index.xml
```

## How It Works

1. **Static Routes**: All routes from `App.tsx` are automatically included
2. **Blog Posts**: Fetched from Contentful (content type: `9oYANGj5uBRT6UHsl5LxO`)
3. **Language Variants**: Generated for all 12 supported languages with proper hreflang tags
4. **Caching**: Sitemap is cached for 1 hour, stale-while-revalidate for 24 hours

## Benefits vs Static Sitemap

| Feature | Static (`public/sitemap.xml`) | Dynamic (API Route) |
|---------|-------------------------------|---------------------|
| Auto-updates | ❌ Manual | ✅ Automatic |
| Blog posts | ❌ Must add manually | ✅ Auto-fetched |
| Contentful sync | ❌ No | ✅ Yes |
| Maintenance | ❌ High | ✅ Low |
| Build time | ⚠️ Generated at build | ✅ Generated on-demand |

## Testing

Visit: https://disclosurely.com/sitemap.xml

The sitemap should:
- Include all static routes
- Include all language variants
- Include all published blog posts from Contentful
- Have proper XML structure
- Include hreflang tags for multilingual SEO

## Future Enhancements

- [ ] Add support for dynamic routes (if any)
- [ ] Add priority/change frequency based on Contentful metadata
- [ ] Generate separate sitemaps for different content types (blog, pages, docs)
- [ ] Add sitemap compression (sitemap.xml.gz)

