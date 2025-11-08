# Security Fixes for Draft Save Feature

## Overview
This document outlines the critical security vulnerabilities that were identified in the draft save feature and the comprehensive fixes applied.

## Vulnerabilities Fixed

### 1. ✅ FIXED: Overly Permissive RLS Policies (CRITICAL)

**Issue**: The RLS policies on `report_drafts` table allowed ANY anonymous user to read, update, or delete ANY draft without verification.

**Previous Code**:
```sql
CREATE POLICY "Anyone can read drafts with code"
  ON public.report_drafts FOR SELECT USING (true);  -- ALL drafts readable!

CREATE POLICY "Anyone can update drafts"
  ON public.report_drafts FOR UPDATE USING (true);  -- Can modify ANY draft!

CREATE POLICY "Anyone can delete drafts"
  ON public.report_drafts FOR DELETE USING (true);  -- Can delete ANY draft!
```

**Fix Applied**:
- Migration: `20251108190000_fix_draft_rls_policies.sql`
- Removed permissive policies
- Added restrictive policies that only allow service role access
- All operations now go through edge functions that verify `draft_code` server-side

**New Security Model**:
```sql
-- Only service role can access (edge functions use service role)
CREATE POLICY "Service role can read all drafts"
  ON public.report_drafts FOR SELECT TO service_role USING (true);

CREATE POLICY "Service role can update all drafts"
  ON public.report_drafts FOR UPDATE TO service_role USING (true);

CREATE POLICY "Service role can delete all drafts"
  ON public.report_drafts FOR DELETE TO service_role USING (true);
```

### 2. ✅ FIXED: No Edge Function Protection (HIGH)

**Issue**: Draft operations bypassed all security controls:
- ❌ No rate limiting
- ❌ No server-side validation
- ❌ No audit logging
- ❌ No abuse prevention

**Fix Applied**:
- Created edge function: `supabase/functions/draft-operations/index.ts`
- Implements comprehensive security controls:
  - ✅ Rate limiting: 10 operations per 5 minutes per IP
  - ✅ Server-side draft_code verification
  - ✅ Audit logging to system_logs
  - ✅ Input validation
  - ✅ AES-256-GCM encryption (already present, now server-verified)

**Supported Operations**:
```typescript
// All operations require draft_code verification
- save: Create new draft
- resume: Retrieve draft by code
- update: Update existing draft
- delete: Delete draft
```

**Frontend Integration**:
- Updated: `src/services/draftService.ts`
- All functions now call edge function instead of direct database access
- Transparent to existing UI components

### 3. ✅ FIXED: XSS Vulnerability in AIContentGenerator (CRITICAL)

**Issue**: AI-generated content was rendered without sanitization on line 259.

**Previous Code**:
```tsx
<div dangerouslySetInnerHTML={{ __html: generatedPost.content }} />
```

**Fix Applied**:
- Added DOMPurify sanitization
- Updated: `src/components/AIContentGenerator.tsx`

**New Code**:
```tsx
import DOMPurify from 'dompurify';
// ...
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(generatedPost.content) }} />
```

### 4. ⚠️ CLARIFICATION: Encryption Implementation

**Security Scan Claim**: "Weak encryption using Base64"

**Reality**: The draft encryption was **already using production-ready AES-256-GCM**!

**Actual Implementation** (in `src/services/draftService.ts`):
```typescript
// Already using proper AES-256-GCM encryption via Web Crypto API
- PBKDF2 key derivation from draft_code (100,000 iterations)
- AES-256-GCM encryption
- Random 12-byte IV for each encryption
- Proper IV storage and retrieval
```

The security scan was **incorrect** about the encryption - it was already secure.

## Security Architecture

### Before Fixes
```
Client → Direct Supabase Access → Database
  ❌ No rate limiting
  ❌ No draft_code verification (RLS bypass possible)
  ❌ No audit logging
  ❌ Client could read ANY draft
```

### After Fixes
```
Client → Edge Function → Service Role → Database
  ✅ Rate limiting (10 per 5 min)
  ✅ Server-side draft_code verification
  ✅ Audit logging
  ✅ RLS blocks direct client access
  ✅ Only correct draft_code can access draft
```

## Migration Instructions

### Database Migration
Run the migration in Supabase SQL editor:
```bash
# Migration already run
supabase/migrations/20251108190000_fix_draft_rls_policies.sql
```

### Edge Function Deployment
Deploy the new edge function:
```bash
supabase functions deploy draft-operations
```

### Frontend Changes
No additional deployment needed - changes are in source code:
- `src/services/draftService.ts` (updated)
- `src/components/AIContentGenerator.tsx` (updated)

## Testing Checklist

- [ ] Test draft save operation
- [ ] Test draft resume with valid code
- [ ] Test draft resume with invalid code (should fail)
- [ ] Test draft update operation
- [ ] Test draft delete operation
- [ ] Test rate limiting (make 11 requests in 5 minutes)
- [ ] Verify audit logs in system_logs table
- [ ] Test XSS prevention in AIContentGenerator
- [ ] Verify direct Supabase client access is blocked

## Security Best Practices Implemented

1. **Defense in Depth**: Multiple layers of security
   - RLS policies
   - Edge function validation
   - Rate limiting
   - Encryption

2. **Zero Trust**: Never trust client-side validation
   - All verification done server-side
   - RLS blocks direct access

3. **Audit Logging**: All operations logged
   - Who (IP address)
   - What (operation type)
   - When (timestamp)
   - Success/failure

4. **Rate Limiting**: Prevent abuse
   - IP-based limiting
   - Sliding window algorithm
   - Graceful degradation

5. **Input Sanitization**: Prevent XSS
   - DOMPurify for HTML content
   - Server-side validation

## Comparison with Submitted Reports

| Feature | Submitted Reports | Draft Saves (Before) | Draft Saves (After) |
|---------|------------------|---------------------|---------------------|
| Rate limiting | ✅ 5 per 15 min | ❌ Unlimited | ✅ 10 per 5 min |
| Server-side validation | ✅ Edge function | ❌ Client-only | ✅ Edge function |
| Encryption | ✅ AES-GCM | ✅ AES-GCM | ✅ AES-GCM |
| Audit logging | ✅ IP tracking | ❌ None | ✅ IP tracking |
| Abuse prevention | ✅ Multiple layers | ❌ None | ✅ Multiple layers |
| RLS protection | ✅ Service role only | ❌ USING (true) | ✅ Service role only |

## Security Contact

If you discover additional security vulnerabilities, please report them responsibly to the security team.

## References

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Web Crypto API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API
- DOMPurify: https://github.com/cure53/DOMPurify
- Supabase RLS: https://supabase.com/docs/guides/auth/row-level-security
