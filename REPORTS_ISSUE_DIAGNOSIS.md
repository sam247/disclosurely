# Reports Not Showing - Diagnosis Guide

## Issue Summary

Reports were visible previously but are now missing when logging into the Next.js app. This is likely due to a Row Level Security (RLS) policy change that requires specific user roles.

## Root Cause

A migration from **September 7, 2025** (`20250907174929`) changed the RLS policy on the `reports` table to require users to have one of these roles:
- `'admin'`
- `'case_handler'`
- `'org_admin'`

**Previous policy**: Any authenticated user with an `organization_id` could view reports  
**Current policy**: Only users with the above roles can view reports

## Quick Diagnosis

Run the diagnostic script to check your user's status:

```bash
# Set your Supabase service role key first
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Run diagnosis
npm run diagnose-reports your-email@example.com
```

Or use the script directly:
```bash
npx tsx scripts/diagnose-reports-issue.ts your-email@example.com
```

## What to Check

### 1. User Profile Status

The diagnostic script will check:
- ✅ User has `organization_id` set
- ✅ User profile is `is_active = true`
- ✅ User has a valid role: `'admin'`, `'case_handler'`, or `'org_admin'`

### 2. Common Issues

**Issue**: User role is not in allowed list
- **Solution**: Update user's role in the database:
  ```sql
  UPDATE profiles 
  SET role = 'org_admin' 
  WHERE id = '<user-id>';
  ```

**Issue**: User profile is inactive
- **Solution**: Activate the profile:
  ```sql
  UPDATE profiles 
  SET is_active = true 
  WHERE id = '<user-id>';
  ```

**Issue**: User has no `organization_id`
- **Solution**: Assign user to an organization:
  ```sql
  UPDATE profiles 
  SET organization_id = '<org-id>' 
  WHERE id = '<user-id>';
  ```

### 3. Next.js App Configuration

If the user profile is correct, check the Next.js app:

#### A. Supabase Client Setup

Ensure you're using `@supabase/ssr` for Next.js:

```typescript
// lib/supabase/client.ts (client-side)
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

```typescript
// lib/supabase/server.ts (server-side)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
```

#### B. Middleware for Auth

Ensure you have middleware that refreshes the session:

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

#### C. Fetching Reports

When fetching reports, ensure you're using the authenticated client:

```typescript
// app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id, role, is_active')
    .eq('id', user.id)
    .single()

  if (!profile?.organization_id) {
    return <div>No organization assigned</div>
  }

  // Fetch reports - RLS will automatically filter by organization
  const { data: reports, error } = await supabase
    .from('reports')
    .select('*')
    .eq('organization_id', profile.organization_id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching reports:', error)
    // Check if it's an RLS policy error
    if (error.message.includes('policy') || error.code === '42501') {
      console.error('RLS policy violation - check user role')
    }
  }

  return <ReportsList reports={reports || []} />
}
```

### 4. Browser Console Checks

Check the browser console for errors:
- RLS policy violations (error code `42501`)
- Authentication errors
- Network request failures

### 5. Network Tab

In browser DevTools → Network tab:
- Check if the reports query is being made
- Check the response status code
- Check if the auth token is being sent in headers

## Current RLS Policy

The current SELECT policy on `reports` table:

```sql
CREATE POLICY "Authorized case handlers can view org reports" 
ON reports 
FOR SELECT 
USING (
  organization_id IN (
    SELECT p.organization_id 
    FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.role IN ('admin', 'case_handler', 'org_admin')
    AND p.is_active = true
  )
);
```

This means:
1. User must be authenticated (`auth.uid()` must exist)
2. User's profile must have `organization_id` matching the report's `organization_id`
3. User's profile must have `role` IN (`'admin'`, `'case_handler'`, `'org_admin'`)
4. User's profile must have `is_active = true`

## Fixing the Issue

### Option 1: Update User Role (Recommended)

If the user should have access, update their role:

```sql
UPDATE profiles 
SET role = 'org_admin'  -- or 'case_handler' or 'admin'
WHERE id = '<user-id>';
```

### Option 2: Temporarily Relax RLS Policy (Not Recommended)

If you need to allow all organization members temporarily:

```sql
-- Drop the restrictive policy
DROP POLICY IF EXISTS "Authorized case handlers can view org reports" ON reports;

-- Create a more permissive policy
CREATE POLICY "Organization members can view reports" 
ON reports 
FOR SELECT 
USING (
  organization_id IN (
    SELECT p.organization_id 
    FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.is_active = true
  )
);
```

**⚠️ Warning**: This reduces security. Only use for testing.

### Option 3: Check Next.js App Auth Flow

Ensure the Next.js app is:
1. Properly authenticating users
2. Passing the auth session to Supabase client
3. Using server-side client for data fetching

## Verification

After fixing, verify:

1. User can see their profile with correct role:
   ```sql
   SELECT id, email, role, organization_id, is_active 
   FROM profiles 
   WHERE email = 'your-email@example.com';
   ```

2. User can query reports (test in Supabase SQL editor):
   ```sql
   -- This should return reports if RLS allows
   SELECT * FROM reports 
   WHERE organization_id = '<your-org-id>' 
   LIMIT 5;
   ```

3. Reports appear in Next.js app dashboard

## Related Files

- Migration that changed the policy: `supabase/migrations/20250907174929_83c139e2-dac9-4982-baa9-5669283160f4.sql`
- Diagnostic script: `scripts/diagnose-reports-issue.ts`
- RLS policy definition: See migration files in `supabase/migrations/`

## Support

If the issue persists after checking all of the above:
1. Run the diagnostic script and share the output
2. Check Supabase logs for RLS policy violations
3. Verify the Next.js app is using the correct Supabase client setup
