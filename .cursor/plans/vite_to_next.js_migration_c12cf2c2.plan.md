---
name: Vite to Next.js Migration
overview: Migrate public marketing pages, blog, docs, and anonymous reporting from Vite to Next.js for SEO improvement. Keep authenticated dashboard as Vite SPA in hybrid architecture.
todos:
  - id: setup-nextjs
    content: Initialize Next.js 15 project with App Router and Tailwind
    status: pending
  - id: copy-components
    content: Copy shadcn/ui components and shared utilities to Next.js
    status: pending
  - id: migrate-marketing
    content: Migrate 25 marketing pages to Next.js with SSG
    status: pending
  - id: migrate-blog
    content: Migrate Contentful blog with ISR implementation
    status: pending
  - id: migrate-reporting
    content: Migrate anonymous reporting forms as client components
    status: pending
  - id: migrate-auth
    content: Migrate login/signup pages with Supabase SSR
    status: pending
  - id: migrate-docs
    content: Convert VitePress docs to Next.js MDX
    status: pending
  - id: configure-hybrid
    content: Setup Vercel rewrites for hybrid Next.js + Vite deployment
    status: pending
  - id: test-integration
    content: Test navigation and auth between Next.js and Vite apps
    status: pending
  - id: deploy-production
    content: Deploy to production with monitoring and rollback plan
    status: pending
---

# Vite to Next.js Migration - Hybrid Architecture

## Overview

Migrate SEO-critical public pages to Next.js while keeping the authenticated dashboard as a Vite SPA. This hybrid approach maximizes SEO benefits while minimizing migration complexity and risk.

## Architecture Strategy

### What Migrates to Next.js (disclosurely.com)
- Marketing pages (25 pages: home, pricing, features, vs-pages, etc.)
- Blog (Contentful-powered, ISR)
- Docs (80+ pages, VitePress → Next.js MDX)
- Anonymous reporting forms (/report, /status)
- Authentication pages (login, signup)

### What Stays as Vite SPA (separate build)
- `/dashboard/*` - Main dashboard and all sub-routes
- `/app/*` - Authenticated app routes
- `/onboarding` - Organization onboarding

### Why Hybrid?
- Dashboard is behind authentication - no SEO value
- Dashboard has complex state management (Context + TanStack Query)
- 90% of SEO benefit comes from public pages
- Lower risk, faster implementation

## Deployment Architecture

### Option A: Two Separate Vercel Deployments (Recommended)

**Next.js App** (disclosurely.com):
- Handles all public routes
- Handles /report, /status, /login, /signup
- Rewrites /dashboard/* and /app/* to Vite deployment

**Vite SPA** (app-internal.vercel.app):
- Deployed separately, not on custom domain
- Only handles /dashboard/* and /app/*
- Only accessible via rewrite from Next.js

**vercel.json for Next.js**:
```json
{
  "rewrites": [
    {
      "source": "/dashboard/:path*",
      "destination": "https://disclosurely-dashboard.vercel.app/dashboard/:path*"
    },
    {
      "source": "/app/:path*",
      "destination": "https://disclosurely-dashboard.vercel.app/app/:path*"
    }
  ]
}
```

### Option B: Monorepo with Separate Builds

- Keep both in same repo
- Deploy both to Vercel
- Use rewrites to route between them

## Migration Phases

### Phase 1: Setup Next.js Project (Week 1, Days 1-2)

**Files to Create:**
- Create new `/nextjs-app` directory alongside current project
- Initialize Next.js 15 with App Router
- Configure Tailwind CSS (copy existing config)
- Setup shadcn/ui components (can reuse most)
- Configure path aliases (@/ → src/)

**Key Files:**
- `nextjs-app/next.config.js` - Configure basePath, rewrites
- `nextjs-app/tailwind.config.ts` - Copy from current Tailwind config
- `nextjs-app/tsconfig.json` - Match current TS config
- `nextjs-app/.env.local` - Copy relevant env vars (VITE_ → NEXT_PUBLIC_)

**Dependencies to Install:**
```json
{
  "@supabase/ssr": "latest",
  "@tanstack/react-query": "^5.x",
  "contentful": "^10.x",
  "next": "^15.x",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "tailwindcss": "^3.x",
  "i18next": "^23.x",
  "react-i18next": "^15.x"
}
```

### Phase 2: Migrate Core Marketing Pages (Week 1-2, Days 3-7)

**Migration Priority Order** (for maximum SEO impact):

1. **Landing Page** `/` - [`src/pages/Index.tsx`](src/pages/Index.tsx) → `app/page.tsx`
   - Uses [`src/components/Landing.tsx`](src/components/Landing.tsx)
   - Keep all components, just wrap in Server/Client components
   - Migrate [`src/components/StandardHeader.tsx`](src/components/StandardHeader.tsx) for navigation

2. **Pricing** `/pricing` - [`src/pages/Pricing.tsx`](src/pages/Pricing.tsx) → `app/pricing/page.tsx`
   
3. **Features** `/features` - [`src/pages/Features.tsx`](src/pages/Features.tsx) → `app/features/page.tsx`

4. **Comparison Pages** (high SEO value):
   - `/vs-speakup` → `app/vs-speakup/page.tsx`
   - `/vs-whistleblower-software` → `app/vs-whistleblower-software/page.tsx`
   - `/vs-navex` → `app/vs-navex/page.tsx`
   - `/vs-resolver` → `app/vs-resolver/page.tsx`

5. **Industry Pages**:
   - `/industries` → `app/industries/page.tsx`
   - `/industries/healthcare` → `app/industries/healthcare/page.tsx`
   - `/industries/finance` → `app/industries/finance/page.tsx`

6. **Other Marketing**:
   - `/compliance-software` → `app/compliance-software/page.tsx`
   - `/whistleblowing-directive` → `app/whistleblowing-directive/page.tsx`
   - `/anonymous-hotline` → `app/anonymous-hotline/page.tsx`
   - `/security` → `app/security/page.tsx`
   - `/faq` → `app/faq/page.tsx`

7. **Legal Pages**:
   - `/about` → `app/about/page.tsx`
   - `/contact` → `app/contact/page.tsx`
   - `/careers` → `app/careers/page.tsx`
   - `/terms` → `app/terms/page.tsx`
   - `/privacy` → `app/privacy/page.tsx`

**Migration Pattern for Each Page:**

```typescript
// Before: src/pages/Pricing.tsx
export default function Pricing() {
  return <PricingPageContent />;
}

// After: app/pricing/page.tsx
import { PricingPageContent } from '@/components/pages/PricingPageContent';

export const metadata = {
  title: 'Pricing - Disclosurely',
  description: 'Simple, transparent pricing...'
};

export default function PricingPage() {
  return <PricingPageContent />;
}

// Mark as static for SEO
export const dynamic = 'force-static';
```

**Component Reuse Strategy:**
- Copy entire [`src/components/ui`](src/components/ui) directory (shadcn components work with Next.js)
- Copy [`src/components/Landing.tsx`](src/components/Landing.tsx), [`src/components/StandardHeader.tsx`](src/components/StandardHeader.tsx), [`src/components/ui/footer.tsx`](src/components/ui/footer.tsx)
- Replace `react-router-dom` imports with `next/link` and `next/navigation`
- Replace `import.meta.env.VITE_*` with `process.env.NEXT_PUBLIC_*`

### Phase 3: Migrate Blog (Week 2, Days 8-10)

**Current Implementation:**
- [`src/pages/Blog.tsx`](src/pages/Blog.tsx) - Client-side Contentful fetching
- Uses Contentful Delivery API
- Dynamic routing: `/blog/:slug`

**Next.js Implementation:**

```typescript
// app/blog/page.tsx - Blog listing
import { createContentfulClient } from '@/lib/contentful';

export const revalidate = 3600; // ISR: revalidate every hour

export default async function BlogPage() {
  const posts = await fetchBlogPosts();
  return <BlogListing posts={posts} />;
}

async function fetchBlogPosts() {
  const client = createContentfulClient();
  const response = await client.getEntries({
    content_type: '9oYANGj5uBRT6UHsl5LxO',
    'fields.status': 'published',
    order: ['-sys.createdAt']
  });
  return response.items;
}

// app/blog/[slug]/page.tsx - Individual posts
export async function generateStaticParams() {
  const posts = await fetchBlogPosts();
  return posts.map(post => ({ slug: post.fields.slug }));
}

export async function generateMetadata({ params }) {
  const post = await fetchBlogPost(params.slug);
  return {
    title: post.fields.seoTitle || post.fields.title,
    description: post.fields.seoDescription || post.fields.excerpt
  };
}

export default async function BlogPost({ params }) {
  const post = await fetchBlogPost(params.slug);
  return <BlogPostContent post={post} />;
}
```

**Benefits:**
- Static generation at build time
- ISR for fresh content
- Better SEO (full HTML on first load)

### Phase 4: Migrate Anonymous Reporting Forms (Week 2-3, Days 11-14)

**Pages to Migrate:**
- `/report` - [`src/components/forms/CleanSubmissionWrapper.tsx`](src/components/forms/CleanSubmissionWrapper.tsx)
- `/status` - [`src/components/ReportStatusLookup.tsx`](src/components/ReportStatusLookup.tsx)
- `/status/:trackingId` - [`src/pages/WhistleblowerMessaging.tsx`](src/pages/WhistleblowerMessaging.tsx)
- `/success` - [`src/components/ReportSuccess.tsx`](src/components/ReportSuccess.tsx)
- `/resume-draft` - [`src/pages/ResumeDraft.tsx`](src/pages/ResumeDraft.tsx)

**Implementation Approach:**
- Use **'use client'** directive for all form components (client-side encryption required)
- Keep existing form logic and encryption
- Server Components for initial page shell and SEO meta tags
- Client Components for forms and interactivity

```typescript
// app/report/page.tsx
export const metadata = {
  title: 'Submit Anonymous Report',
  description: 'Securely submit an anonymous whistleblower report...'
};

export default function ReportPage() {
  return <CleanSubmissionWrapper />;
}

// components/forms/CleanSubmissionWrapper.tsx
'use client'; // Client component for encryption

import { useState } from 'react';
// ... keep all existing logic
```

**Key Considerations:**
- Client-side encryption MUST stay in browser
- Form state management stays the same
- Supabase Edge Function calls work identically
- File uploads work the same way

### Phase 5: Migrate Authentication Pages (Week 3, Days 15-16)

**Pages:**
- `/login` - [`src/pages/Login.tsx`](src/pages/Login.tsx)
- `/signup` - [`src/pages/Signup.tsx`](src/pages/Signup.tsx)
- `/invite/:token` - [`src/pages/AcceptInvite.tsx`](src/pages/AcceptInvite.tsx)

**Implementation:**
```typescript
// app/login/page.tsx
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Login - Disclosurely',
  description: 'Login to your secure whistleblowing dashboard'
};

export default function LoginPage() {
  return <LoginForm />;
}

// components/auth/LoginForm.tsx
'use client';

// Keep existing Supabase auth logic
// Replace useNavigate() with useRouter() from 'next/navigation'
```

**Supabase Auth in Next.js:**
- Use `@supabase/ssr` package
- Create server/client Supabase helpers
- After successful login, redirect to Vite SPA dashboard

### Phase 6: Migrate Docs to Next.js MDX (Week 3-4, Days 17-21)

**Current State:**
- VitePress site with 76 markdown files
- Located in [`docs/docs/`](docs/docs/) directory
- Just deployed to `/docs/*` path

**Next.js MDX Implementation:**

**Install Dependencies:**
```bash
npm install @next/mdx @mdx-js/loader @mdx-js/react gray-matter
```

**Structure:**
```
app/docs/
├── layout.tsx              # Docs layout with sidebar
├── page.tsx                # /docs (landing)
├── [...slug]/
│   └── page.tsx           # Dynamic route for all docs
components/docs/
├── DocsSidebar.tsx         # Navigation sidebar
├── DocsSearch.tsx          # Search functionality
└── MDXComponents.tsx       # Custom MDX components
```

**Implementation:**

```typescript
// app/docs/[...slug]/page.tsx
import { notFound } from 'next/navigation';
import { getMDXComponent } from 'next-contentlayer/hooks';
import { allDocs } from 'contentlayer/generated';

export async function generateStaticParams() {
  return allDocs.map(doc => ({
    slug: doc.slug.split('/')
  }));
}

export async function generateMetadata({ params }) {
  const doc = allDocs.find(d => d.slug === params.slug.join('/'));
  if (!doc) return {};
  
  return {
    title: `${doc.title} - Disclosurely Docs`,
    description: doc.description
  };
}

export default function DocPage({ params }) {
  const doc = allDocs.find(d => d.slug === params.slug.join('/'));
  if (!doc) notFound();
  
  const MDXContent = getMDXComponent(doc.body.code);
  
  return (
    <div className="docs-content">
      <h1>{doc.title}</h1>
      <MDXContent />
    </div>
  );
}
```

**Or use simpler approach with fs reading:**
```typescript
import fs from 'fs';
import path from 'path';
import { compileMDX } from 'next-mdx-remote/rsc';

export default async function DocPage({ params }) {
  const filePath = path.join(process.cwd(), 'content/docs', ...params.slug) + '.md';
  const source = fs.readFileSync(filePath, 'utf8');
  
  const { content, frontmatter } = await compileMDX({
    source,
    options: { parseFrontmatter: true }
  });
  
  return (
    <div>
      <h1>{frontmatter.title}</h1>
      {content}
    </div>
  );
}
```

**Migration Steps:**
1. Copy markdown files from `docs/docs/` to `nextjs-app/content/docs/`
2. Create docs layout with sidebar navigation
3. Implement search (use Algolia DocSearch or custom)
4. Generate static params for all doc pages
5. Test all 76 doc pages render correctly
6. Remove VitePress and `docs/` directory

### Phase 7: Configure Hybrid Deployment (Week 4, Days 22-24)

**Step 1: Create Two Vercel Projects**

1. **Next.js Project** (`nextjs-app/vercel.json`):
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "rewrites": [
    {
      "source": "/dashboard/:path*",
      "destination": "https://disclosurely-dashboard-internal.vercel.app/dashboard/:path*"
    },
    {
      "source": "/app/:path*",
      "destination": "https://disclosurely-dashboard-internal.vercel.app/app/:path*"
    },
    {
      "source": "/onboarding",
      "destination": "https://disclosurely-dashboard-internal.vercel.app/onboarding"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```

2. **Vite Dashboard Project** (keep current `vercel.json` but simplify):
```json
{
  "framework": "vite",
  "buildCommand": "npm run build:app",
  "outputDirectory": "dist",
  "routes": [
    { "handle": "filesystem" },
    {
      "src": "/(dashboard|app|onboarding).*",
      "dest": "/index.html"
    }
  ]
}
```

**Step 2: Update Vite App**

Modify [`src/App.tsx`](src/App.tsx) to only include authenticated routes:
- Remove all public marketing routes
- Remove blog routes  
- Remove multilingual public routes  
- Keep only: /dashboard/*, /app/*, /onboarding

**Step 3: Domain Configuration**

1. Point `disclosurely.com` to Next.js deployment
2. Deploy Vite SPA to internal Vercel URL (no custom domain)
3. Test rewrites work correctly
4. Verify authentication flows across both apps

### Phase 8: Handle Shared State & Navigation (Week 4, Day 25)

**Challenge**: Navigation between Next.js pages and Vite SPA

**Solution**:
- Use standard `<a>` tags for cross-app navigation
- Supabase auth session is shared via cookies (same domain)
- No special handling needed - just full page navigation

**Example:**
```typescript
// In Next.js (public pages)
<Link href="/dashboard">Go to Dashboard</Link>
// Becomes full page navigation to Vite SPA via rewrite

// In Vite SPA (dashboard)
<a href="/">Back to Home</a>
// Becomes full page navigation to Next.js
```

## Migration Checklist by Route Type

### Public Marketing Pages (25 pages) ✓ SSG

| Current Route | Vite File | Next.js Path | Notes |
|--------------|-----------|--------------|-------|
| `/` | `src/pages/Index.tsx` | `app/page.tsx` | Uses `Landing.tsx` component |
| `/pricing` | `src/pages/Pricing.tsx` | `app/pricing/page.tsx` | Static |
| `/features` | `src/pages/Features.tsx` | `app/features/page.tsx` | Static |
| `/about` | `src/pages/About.tsx` | `app/about/page.tsx` | Static |
| `/contact` | `src/pages/Contact.tsx` | `app/contact/page.tsx` | Form submission |
| `/careers` | `src/pages/Careers.tsx` | `app/careers/page.tsx` | Static |
| `/security` | `src/pages/Security.tsx` | `app/security/page.tsx` | Static |
| `/faq` | `src/pages/FAQ.tsx` | `app/faq/page.tsx` | Static |
| `/terms` | `src/pages/Terms.tsx` | `app/terms/page.tsx` | Static |
| `/privacy` | `src/pages/Privacy.tsx` | `app/privacy/page.tsx` | Static |
| `/vs-speakup` | `src/pages/VsSpeakUp.tsx` | `app/vs-speakup/page.tsx` | Static |
| `/vs-whistleblower-software` | `src/pages/VsWhistleblowerSoftware.tsx` | `app/vs-whistleblower-software/page.tsx` | Static |
| `/vs-navex` | `src/pages/VsNavex.tsx` | `app/vs-navex/page.tsx` | Static |
| `/vs-resolver` | `src/pages/VsResolver.tsx` | `app/vs-resolver/page.tsx` | Static |
| `/compliance-software` | `src/pages/ComplianceSoftware.tsx` | `app/compliance-software/page.tsx` | Static |
| `/whistleblowing-directive` | `src/pages/WhistleblowingDirective.tsx` | `app/whistleblowing-directive/page.tsx` | Static |
| `/anonymous-hotline` | `src/pages/AnonymousHotline.tsx` | `app/anonymous-hotline/page.tsx` | Static |
| `/industries` | `src/pages/Industries.tsx` | `app/industries/page.tsx` | Static |
| `/industries/healthcare` | `src/pages/IndustriesHealthcare.tsx` | `app/industries/healthcare/page.tsx` | Static |
| `/industries/finance` | `src/pages/IndustriesFinance.tsx` | `app/industries/finance/page.tsx` | Static |

### Blog Pages ✓ ISR

| Current Route | Vite File | Next.js Path | Rendering |
|--------------|-----------|--------------|-----------|
| `/blog` | `src/pages/Blog.tsx` | `app/blog/page.tsx` | ISR (1 hour) |
| `/blog/:slug` | `src/pages/Blog.tsx` | `app/blog/[slug]/page.tsx` | ISR (1 hour) |

### Anonymous Reporting ✓ Client Components

| Current Route | Vite File | Next.js Path | Component Type |
|--------------|-----------|--------------|----------------|
| `/report` | `src/components/forms/CleanSubmissionWrapper.tsx` | `app/report/page.tsx` | Client (encryption) |
| `/submit` | Redirects to /report | Redirect in next.config.js | - |
| `/whistleblow` | Redirects to /report | Redirect in next.config.js | - |
| `/status` | `src/components/ReportStatusLookup.tsx` | `app/status/page.tsx` | Client |
| `/status/:trackingId` | `src/pages/WhistleblowerMessaging.tsx` | `app/status/[trackingId]/page.tsx` | Client |
| `/success` | `src/components/ReportSuccess.tsx` | `app/success/page.tsx` | Client |
| `/resume-draft` | `src/pages/ResumeDraft.tsx` | `app/resume-draft/page.tsx` | Client |

### Authentication Pages ✓ Client Components

| Current Route | Vite File | Next.js Path | Notes |
|--------------|-----------|--------------|-------|
| `/login` | `src/pages/Login.tsx` | `app/login/page.tsx` | Client component |
| `/signup` | `src/pages/Signup.tsx` | `app/signup/page.tsx` | Client component |
| `/invite/:token` | `src/pages/AcceptInvite.tsx` | `app/invite/[token]/page.tsx` | Client component |

### Docs Pages ✓ SSG

| Current Route | Source | Next.js Path | Rendering |
|--------------|--------|--------------|-----------|
| `/docs` | VitePress | `app/docs/page.tsx` | SSG |
| `/docs/**` | 76 markdown files | `app/docs/[...slug]/page.tsx` | SSG |

### Dashboard Routes ✗ STAY IN VITE

| Current Route | Vite File | Strategy |
|--------------|-----------|----------|
| `/dashboard/*` | Multiple components | **KEEP AS VITE SPA** - rewrite from Next.js |
| `/app/*` | `src/components/AuthenticatedApp.tsx` | **KEEP AS VITE SPA** - rewrite from Next.js |
| `/onboarding` | `src/components/OrganizationOnboarding.tsx` | **KEEP AS VITE SPA** - rewrite from Next.js |

## Code Transformation Patterns

### Pattern 1: React Router → Next.js Navigation

**Before (React Router):**
```typescript
import { useNavigate, Link, useParams } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  return (
    <div>
      <Link to="/pricing">Pricing</Link>
      <button onClick={() => navigate('/contact')}>Contact</button>
    </div>
  );
}
```

**After (Next.js):**
```typescript
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

function MyComponent() {
  const router = useRouter();
  const params = useParams();
  
  return (
    <div>
      <Link href="/pricing">Pricing</Link>
      <button onClick={() => router.push('/contact')}>Contact</button>
    </div>
  );
}
```

### Pattern 2: Environment Variables

**Before:**
```typescript
const apiUrl = import.meta.env.VITE_SUPABASE_URL;
const publicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
```

**After:**
```typescript
const apiUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;
```

### Pattern 3: Image Optimization

**Before:**
```typescript
<img src="/assets/logo.png" alt="Logo" />
```

**After:**
```typescript
import Image from 'next/image';

<Image src="/assets/logo.png" alt="Logo" width={200} height={50} />
```

### Pattern 4: Head/Meta Tags

**Before:**
```typescript
import { Helmet } from 'react-helmet-async';

<Helmet>
  <title>Pricing - Disclosurely</title>
  <meta name="description" content="..." />
</Helmet>
```

**After:**
```typescript
// app/pricing/page.tsx
export const metadata = {
  title: 'Pricing - Disclosurely',
  description: '...'
};
```

### Pattern 5: Supabase Client

**Before (Vite):**
```typescript
import { supabase } from '@/integrations/supabase/client';

// Client-side only
const { data } = await supabase.from('cases').select('*');
```

**After (Next.js):**
```typescript
// Server Component
import { createClient } from '@/lib/supabase/server';

const supabase = createClient();
const { data } = await supabase.from('cases').select('*');

// Client Component
'use client';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();
```

## Internationalization Strategy

**Current**: i18next with [`src/i18n/config.ts`](src/i18n/config.ts) - 12 languages

**Options**:

**Option A: Keep i18next (Easier)**
- Works with Next.js
- Use 'use client' for components that need translations
- Less migration work

**Option B: Migrate to next-intl (Better)**
- Better Next.js integration
- Server-side rendering of translations
- More work to migrate

**Recommendation**: Start with Option A (keep i18next), consider Option B later

**Implementation**:
```typescript
// app/[lang]/layout.tsx
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/config';

export async function generateStaticParams() {
  return [
    { lang: 'en' },
    { lang: 'de' },
    { lang: 'fr' },
    // ... all 12 languages
  ];
}

export default function LangLayout({ children, params }) {
  useEffect(() => {
    i18n.changeLanguage(params.lang);
  }, [params.lang]);
  
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
```

## Sitemap Strategy

**Current**: 
- API routes generate sitemaps: [`api/sitemap.xml.ts`](api/sitemap.xml.ts), [`api/sitemap-index.xml.ts`](api/sitemap-index.xml.ts)

**Next.js**:
- Use Next.js built-in sitemap generation
- Automatically includes all static routes

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    '/',
    '/pricing',
    '/features',
    '/about',
    // ... all static pages
  ];
  
  const blogPosts = await fetchBlogPostSlugs();
  const docPages = await fetchDocSlugs();
  
  return [
    ...staticPages.map(route => ({
      url: `https://disclosurely.com${route}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8
    })),
    ...blogPosts.map(slug => ({
      url: `https://disclosurely.com/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6
    })),
    ...docPages.map(slug => ({
      url: `https://disclosurely.com/docs/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7
    }))
  ];
}
```

## Key Files to Create/Modify

### New Files in Next.js App

**Core Configuration:**
- `nextjs-app/next.config.js` - Next.js configuration
- `nextjs-app/middleware.ts` - Route protection and rewrites
- `nextjs-app/app/layout.tsx` - Root layout
- `nextjs-app/lib/supabase/server.ts` - Server Supabase client
- `nextjs-app/lib/supabase/client.ts` - Client Supabase client
- `nextjs-app/lib/contentful.ts` - Contentful client helper

**Component Directories to Copy:**
- `src/components/ui/` → `nextjs-app/components/ui/` (shadcn components)
- `src/components/artwork/` → `nextjs-app/components/artwork/`
- `src/components/forms/` → `nextjs-app/components/forms/` (for reporting)
- `src/components/Landing.tsx` → `nextjs-app/components/Landing.tsx`
- `src/components/StandardHeader.tsx` → `nextjs-app/components/StandardHeader.tsx`
- `src/components/ui/footer.tsx` → `nextjs-app/components/ui/footer.tsx`

**Utilities to Copy:**
- `src/utils/` → `nextjs-app/lib/utils/` (most utilities are framework-agnostic)
- Update imports to use Next.js conventions

### Modified Files in Vite App

**[`src/App.tsx`](src/App.tsx)**:
- Remove all public routes (lines 125-145)
- Remove blog routes (lines 164-165)
- Remove multilingual public routes (lines 198-218)
- Keep only authenticated routes (lines 220-399)

**[`package.json`](package.json)**:
- Update `build:app` to only build dashboard
- Remove `build:docs` (docs now in Next.js)

**[`vercel.json`](vercel.json)**:
- Simplify to only handle dashboard routes
- Remove public page redirects/rewrites

## Testing Strategy

### Phase 1: Local Testing
1. Run Next.js app locally: `npm run dev` (port 3000)
2. Run Vite SPA locally: `npm run dev` (port 8080)
3. Test navigation between apps
4. Verify Supabase auth works across both

### Phase 2: Staging Testing
1. Deploy both to Vercel preview URLs
2. Configure rewrites between them
3. Test all public pages render correctly
4. Test authentication flow
5. Test navigation from Next.js → Vite dashboard

### Phase 3: Production Rollout
1. Deploy Next.js to `disclosurely.com`
2. Deploy Vite dashboard to internal URL
3. Monitor for errors
4. Verify SEO improvements in GSC within 48 hours

## Rollback Plan

If issues arise:
1. **Quick rollback**: Point `disclosurely.com` back to current Vite deployment
2. **Partial rollback**: Keep Next.js for marketing, revert specific problematic pages
3. **Fix forward**: Fix issues in Next.js and re-deploy

**Safety**: Keep current Vite deployment running for 2 weeks after migration as backup

## Expected Outcomes

### SEO Improvements (2-3 months)
- Fully rendered HTML on first request (currently empty shell)
- Better crawlability for all marketing pages
- Improved Core Web Vitals scores
- Expected: Move from position 83.6 → position 20-40 for target keywords

### Performance Improvements
- Faster Time to First Byte (server-rendered)
- Better First Contentful Paint
- Optimized images with next/image
- Improved caching strategy

### Developer Experience
- Better SEO control
- Unified stack for public-facing code
- Easier to maintain and update
- Modern framework with active community

## Risk Assessment

### Low Risk ✅
- Marketing pages (static, no auth)
- Blog pages (already using ISR pattern)
- Docs migration (straightforward MDX conversion)

### Medium Risk ⚠️
- Anonymous reporting forms (client-side encryption must work)
- Internationalization (12 languages to support)
- Hybrid deployment coordination

### High Risk ❌ (Avoided by keeping Vite)
- Dashboard migration (complex state, real-time features)
- Protected routes (subscription logic, session management)
- Complex form workflows

## Timeline

**Week 1**: Setup + Core Marketing Pages (5 days)
**Week 2**: Blog + Anonymous Reporting (5 days)  
**Week 3**: Auth Pages + Docs Migration (5 days)
**Week 4**: Testing + Deployment (5 days)

**Total**: 4 weeks for full hybrid migration

## Post-Migration Tasks

1. Update DNS records if needed
2. Monitor Google Search Console for indexing
3. Check Lighthouse scores
4. Monitor Sentry for errors
5. Update documentation
6. Train team on new structure

## Key Success Factors

1. **Incremental deployment**: Deploy page by page to minimize risk
2. **Monitoring**: Watch metrics closely during rollout
3. **Communication**: Keep team informed of changes
4. **Testing**: Thorough testing at each phase
5. **Backup plan**: Always have rollback option ready

