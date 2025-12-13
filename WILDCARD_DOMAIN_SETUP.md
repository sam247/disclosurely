# Wildcard Domain Setup Guide

## Overview

To support wildcard domains (`*.disclosurely.com`), you need:

1. **Vercel Configuration**: Add `*.disclosurely.com` as a wildcard domain
2. **Next.js Middleware**: Extract subdomain and route to correct organization
3. **Database Lookup**: Match subdomain to organization

## Current State

- ✅ Individual custom domains work (e.g., `reports.company.com`)
- ✅ Each domain is added to Vercel via API
- ✅ Domains stored in `custom_domains` table
- ❌ **Wildcard routing not implemented** - needs Next.js middleware

## How It Should Work

### 1. Vercel Setup

Add `*.disclosurely.com` to your Vercel project:
- Go to Vercel project settings → Domains
- Add `*.disclosurely.com`
- Vercel will automatically route all subdomains to your project

### 2. Next.js Middleware (Needs Implementation)

Create `middleware.ts` in your Next.js app root:

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  
  // Extract subdomain (e.g., "acme" from "acme.disclosurely.com")
  const subdomain = host.split('.')[0]
  
  // Skip if it's a known domain (app, www, docs, etc.)
  const knownDomains = ['app', 'www', 'docs', 'disclosurely']
  if (knownDomains.includes(subdomain) || !host.includes('disclosurely.com')) {
    return NextResponse.next()
  }
  
  // Look up organization by subdomain
  const supabase = createClient()
  const { data: organization } = await supabase
    .from('organizations')
    .select('id, name, slug')
    .eq('subdomain', subdomain) // You'll need a 'subdomain' column
    .single()
  
  if (!organization) {
    return NextResponse.redirect('https://disclosurely.com/404')
  }
  
  // Add organization context to request
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-organization-id', organization.id)
  requestHeaders.set('x-organization-slug', organization.slug)
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

### 3. Database Schema

You'll need to add a `subdomain` column to organizations:

```sql
ALTER TABLE organizations 
ADD COLUMN subdomain TEXT UNIQUE;

CREATE INDEX idx_organizations_subdomain ON organizations(subdomain);
```

### 4. API Routes

Your Edge Functions already check `custom_domains` table for CORS, which is good. The Next.js app needs to:
- Extract subdomain from Host header
- Look up organization
- Pass organization context to API calls

## Alternative: Use Custom Domains Table

Instead of adding a `subdomain` column, you could:
- Store subdomain mappings in `custom_domains` table
- Look up by matching the full domain or subdomain pattern

## Current API Support

✅ **Edge Functions** already support custom domains via CORS checks
✅ **Vercel API** can add wildcard domains
❌ **Next.js routing** needs middleware to extract subdomain and route

## Recommendation

1. **For now**: Keep using individual domain setup (current system works)
2. **For wildcard**: Implement Next.js middleware in `disclosurely-site` repo
3. **Database**: Add subdomain column or use custom_domains table for lookups

The API side (this repo) is ready - the routing logic needs to be in your Next.js frontend.
