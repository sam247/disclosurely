# Next.js Migration Plan for Disclosurely

**Status**: Planning Phase  
**Created**: 2025-01-XX  
**Goal**: Migrate from React SPA (Vite) to Next.js for improved SEO, better performance, and consolidated architecture.

---

## 🎯 Objectives

1. **SEO Improvement**: Server-side rendering for all public pages (currently position 83.6 for "whistleblower software")
2. **Performance**: Better Core Web Vitals, faster initial page loads
3. **Consolidation**: Unified stack (main app + docs on same framework)
4. **Maintainability**: Modern framework with better developer experience

---

## 📊 Current State Analysis

### Frontend Stack
- **Framework**: React 18.3.1 + Vite 5.4.1
- **Routing**: React Router DOM v6 (114 usages across 65 files)
- **State**: React Context + TanStack Query
- **Styling**: Tailwind CSS + shadcn/ui
- **i18n**: i18next (12 languages)
- **Build**: Client-side rendering (SPA)

### Backend Stack (No Changes Needed)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Functions**: Supabase Edge Functions (Deno) - 42+ functions
- **Storage**: Supabase Storage
- **Hosting**: Vercel

### Docs Site
- **Framework**: VitePress (Vue-based)
- **Status**: ✅ **Just migrated to `/docs` path on main domain**
- **Content**: 80+ markdown files
- **Next Step**: Convert to Next.js MDX

---

## 🗺️ Migration Strategy

### Phase 1: Public Marketing Pages (Week 1) - **Quick SEO Win**

**Goal**: Get immediate SEO benefits with low-risk migration

**Pages to Migrate**:
- `/` - Landing page
- `/pricing` - Pricing page
- `/features` - Features page
- `/about` - About page
- `/contact` - Contact page
- `/careers` - Careers page
- `/vs-speakup` - Comparison pages
- `/vs-whistleblower-software`
- `/vs-navex`
- `/vs-resolver`
- `/compliance-software`
- `/whistleblowing-directive`
- `/industries` - Industry pages
- `/security` - Security page
- `/faq` - FAQ page
- `/terms` - Terms of Service
- `/privacy` - Privacy Policy
- `/blog` - Blog listing (Contentful-powered)
- `/blog/:slug` - Blog posts

**Approach**:
- Use **Static Site Generation (SSG)** for all pages
- Keep existing components (shadcn/ui works with Next.js)
- Migrate React Router → Next.js App Router
- Use `next/image` for optimized images
- Implement ISR for blog posts

**Expected Impact**:
- ✅ Immediate SEO improvement (full HTML on first request)
- ✅ Better Core Web Vitals scores
- ✅ Faster page loads

---

### Phase 2: Anonymous Reporting Routes (Week 2)

**Pages to Migrate**:
- `/report` - Main submission form
- `/submit` - Alias (redirects to /report)
- `/whistleblow` - Alias (redirects to /report)
- `/status` - Report status lookup
- `/status/:trackingId` - Two-way messaging
- `/success` - Success page
- `/resume-draft` - Draft resume page

**Approach**:
- Use **Server Components** where possible
- Keep client-side encryption logic (must run in browser)
- Use **Server Actions** for form submissions
- Maintain existing Supabase integration

**Challenges**:
- Client-side encryption requires client components
- Progressive form state management
- Real-time messaging updates

---

### Phase 3: Authenticated Dashboard (Week 3-4)

**Pages to Migrate**:
- `/dashboard` - Main dashboard
- `/dashboard/reports/:reportId` - Report details
- `/dashboard/ai-helper` - AI helper view
- `/dashboard/case-insights` - Case insights
- `/dashboard/ai-assistant` - AI assistant
- `/dashboard/settings` - Organization settings
- `/dashboard/team` - Team management
- `/dashboard/branding` - Branding configuration
- `/dashboard/secure-link` - Link generator
- `/dashboard/integrations` - Integrations
- `/dashboard/analytics` - Analytics
- `/dashboard/audit` - Audit logs
- `/dashboard/workflows` - Workflows
- `/dashboard/admin` - Admin panel

**Approach**:
- Use **Server Components** for data fetching
- Keep client components for interactive features
- Migrate React Router → Next.js App Router
- Use Next.js middleware for authentication
- Maintain existing protected route logic

**Key Considerations**:
- Complex state management (Context + TanStack Query)
- Real-time updates (Supabase subscriptions)
- File uploads and downloads
- Rich text editors (TipTap)

---

### Phase 4: Docs Site Migration (Week 5)

**Current**: VitePress (Vue-based) at `/docs`  
**Target**: Next.js MDX

**Approach**:
1. Install `@next/mdx` and `next-mdx-remote`
2. Convert VitePress markdown → MDX
3. Migrate VitePress components → React components
4. Recreate sidebar navigation
5. Implement search (replace VitePress search)
6. Maintain existing URLs (already at `/docs/*`)

**Benefits**:
- Unified stack (React everywhere)
- Better integration with main app
- Can share components between app and docs
- Better SEO control

---

## 🔧 Technical Implementation Details

### 1. Next.js Setup

```bash
npx create-next-app@latest disclosurely-nextjs --typescript --tailwind --app
```

**Key Dependencies**:
- `next@latest` - Next.js framework
- `@supabase/supabase-js` - Keep existing
- `@tanstack/react-query` - Keep existing
- `i18next` - Keep existing (or migrate to next-intl)
- `tailwindcss` - Keep existing
- `shadcn/ui` - Works with Next.js

### 2. Routing Migration

**React Router → Next.js App Router**

| React Router | Next.js App Router |
|-------------|-------------------|
| `<Route path="/" element={<Index />} />` | `app/page.tsx` |
| `<Route path="/pricing" element={<Pricing />} />` | `app/pricing/page.tsx` |
| `<Route path="/dashboard" element={<Dashboard />} />` | `app/dashboard/page.tsx` |
| `useNavigate()` | `useRouter()` from `next/navigation` |
| `useParams()` | `params` prop in Server Components |
| `useSearchParams()` | `searchParams` prop in Server Components |

**Example Migration**:
```typescript
// Before (React Router)
import { useNavigate, useParams } from 'react-router-dom';
const navigate = useNavigate();
const { id } = useParams();

// After (Next.js)
import { useRouter } from 'next/navigation';
const router = useRouter();
// In Server Component:
export default function Page({ params }: { params: { id: string } }) {
  // ...
}
```

### 3. Authentication & Protected Routes

**Current**: `ProtectedRoute` component wrapper  
**Next.js**: Middleware-based protection

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protect dashboard routes
  if (req.nextUrl.pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/app/:path*'],
};
```

### 4. Data Fetching

**Current**: TanStack Query with client-side fetching  
**Next.js**: Server Components + TanStack Query for client components

```typescript
// Server Component (app/dashboard/page.tsx)
import { createClient } from '@/integrations/supabase/server';

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: cases } = await supabase
    .from('cases')
    .select('*');
  
  return <DashboardClient cases={cases} />;
}

// Client Component (for interactivity)
'use client';
import { useQuery } from '@tanstack/react-query';

export function DashboardClient({ cases: initialCases }) {
  // Use TanStack Query for client-side updates
  const { data } = useQuery({
    queryKey: ['cases'],
    queryFn: fetchCases,
    initialData: initialCases,
  });
  // ...
}
```

### 5. Internationalization

**Option A**: Keep i18next (works with Next.js)  
**Option B**: Migrate to `next-intl` (better Next.js integration)

**Recommendation**: Start with i18next, migrate to next-intl later if needed.

### 6. Static Generation for Public Pages

```typescript
// app/pricing/page.tsx
export default function PricingPage() {
  return <Pricing />;
}

// Generate static page at build time
export const dynamic = 'force-static';
```

### 7. Blog Posts (ISR)

```typescript
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await fetchAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export const revalidate = 3600; // Revalidate every hour

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await fetchBlogPost(params.slug);
  return <BlogPostContent post={post} />;
}
```

---

## 📁 Project Structure

### Current Structure
```
disclosurely/
├── src/
│   ├── pages/          # Page components
│   ├── components/     # React components
│   ├── hooks/          # Custom hooks
│   └── ...
├── docs/               # VitePress docs
└── supabase/           # Edge Functions
```

### Next.js Structure
```
disclosurely/
├── app/                # Next.js App Router
│   ├── (public)/       # Public routes group
│   │   ├── page.tsx    # Landing page
│   │   ├── pricing/
│   │   ├── features/
│   │   └── ...
│   ├── (auth)/         # Auth routes
│   │   ├── login/
│   │   └── signup/
│   ├── dashboard/      # Protected routes
│   │   ├── layout.tsx  # Dashboard layout
│   │   ├── page.tsx
│   │   └── ...
│   ├── docs/           # Docs (MDX)
│   │   ├── layout.tsx
│   │   └── [...slug]/
│   └── layout.tsx      # Root layout
├── components/         # Shared components
├── lib/                # Utilities
├── supabase/           # Edge Functions (unchanged)
└── public/             # Static assets
```

---

## 🚀 Migration Steps

### Step 1: Setup Next.js Project (Day 1)
- [ ] Create Next.js app alongside current app
- [ ] Install dependencies
- [ ] Configure Tailwind CSS
- [ ] Setup shadcn/ui
- [ ] Configure Supabase client (server + client)
- [ ] Setup environment variables

### Step 2: Migrate Public Pages (Days 2-5)
- [ ] Create `app/(public)` route group
- [ ] Migrate landing page (`/`)
- [ ] Migrate pricing page
- [ ] Migrate features page
- [ ] Migrate all comparison pages
- [ ] Migrate blog pages
- [ ] Test all public routes
- [ ] Deploy to preview URL

### Step 3: Setup Authentication (Day 6)
- [ ] Create Next.js middleware
- [ ] Migrate login/signup pages
- [ ] Test authentication flow
- [ ] Setup protected route logic

### Step 4: Migrate Anonymous Reporting (Days 7-9)
- [ ] Migrate `/report` submission form
- [ ] Migrate status lookup
- [ ] Migrate messaging interface
- [ ] Test encryption flow
- [ ] Test form submissions

### Step 5: Migrate Dashboard (Days 10-17)
- [ ] Create dashboard layout
- [ ] Migrate main dashboard view
- [ ] Migrate report details
- [ ] Migrate AI assistant
- [ ] Migrate settings pages
- [ ] Migrate admin panel
- [ ] Test all dashboard functionality

### Step 6: Migrate Docs (Days 18-20)
- [ ] Setup MDX in Next.js
- [ ] Convert VitePress markdown → MDX
- [ ] Recreate sidebar navigation
- [ ] Implement search
- [ ] Test all docs pages
- [ ] Remove VitePress

### Step 7: Final Testing & Deployment (Days 21-22)
- [ ] End-to-end testing
- [ ] Performance testing
- [ ] SEO verification
- [ ] Update DNS/domains
- [ ] Monitor for issues

---

## ⚠️ Risks & Mitigation

### Risk 1: Breaking Changes During Migration
**Mitigation**: 
- Run both apps in parallel
- Use feature flags
- Gradual rollout

### Risk 2: SEO Impact During Transition
**Mitigation**:
- Use 301 redirects from old URLs
- Maintain sitemap
- Monitor GSC for issues

### Risk 3: Authentication Issues
**Mitigation**:
- Test thoroughly in staging
- Keep Supabase Auth unchanged
- Use same session management

### Risk 4: Performance Regression
**Mitigation**:
- Benchmark before/after
- Use Next.js Image optimization
- Monitor Core Web Vitals

---

## 📈 Success Metrics

### SEO Metrics
- **Target**: Move from position 83.6 → position 20-30 for "whistleblower software" within 3 months
- **Target**: Increase organic traffic by 200% within 6 months
- **Target**: Improve Core Web Vitals scores (LCP < 2.5s, FID < 100ms, CLS < 0.1)

### Performance Metrics
- **Target**: 50% reduction in Time to First Byte (TTFB)
- **Target**: 30% reduction in First Contentful Paint (FCP)
- **Target**: 90+ Lighthouse score for all public pages

### Technical Metrics
- **Target**: Zero breaking changes
- **Target**: 100% feature parity
- **Target**: Reduced bundle size (better code splitting)

---

## 🔄 Rollback Plan

If issues arise:
1. Keep old Vite app running on backup domain
2. Switch DNS back to old deployment
3. Fix issues in Next.js app
4. Re-deploy when ready

---

## 📚 Resources

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Migrating from React Router to Next.js](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)
- [Supabase with Next.js](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [shadcn/ui with Next.js](https://ui.shadcn.com/docs/installation/next)

---

## ✅ Pre-Migration Checklist

Before starting migration:
- [x] Docs moved to `/docs` path (completed)
- [ ] Backup current codebase
- [ ] Document all custom configurations
- [ ] List all third-party integrations
- [ ] Review all environment variables
- [ ] Test current app thoroughly
- [ ] Set up staging environment
- [ ] Prepare rollback plan

---

## 🎯 Next Steps

1. **Review this plan** with team
2. **Set up Next.js project** in parallel
3. **Start with Phase 1** (public pages) for quick wins
4. **Iterate and test** each phase thoroughly
5. **Deploy gradually** with monitoring

---

**Last Updated**: 2025-01-XX  
**Next Review**: After Phase 1 completion

