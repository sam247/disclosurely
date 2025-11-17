# Security Mitigation Plan - Disclosurely

**Date**: November 17, 2025  
**Priority**: CRITICAL  
**Status**: In Progress

---

## Executive Summary

This plan addresses critical security vulnerabilities identified in the repository analysis, with immediate focus on removing hardcoded secrets and implementing fail-fast error handling.

---

## 1. CRITICAL: Remove Hardcoded Secrets (Priority: IMMEDIATE)

### 1.1 Issue
Hardcoded fallback secrets in API edge functions expose sensitive tokens in compiled code and repository history.

### 1.2 Affected Files

#### File 1: `api/sitemap.xml.ts`
- **Variable**: `CONTENTFUL_DELIVERY_TOKEN`
- **Hardcoded Value**: `e3JfeWQKBvfCQoqi22f6F_XzWgbZPXR9JWTyuSTGcFw`
- **Status**: ✅ FIXED - Removed hardcoded fallback, added fail-fast validation

#### File 2: `api/stripe-webhook.ts`
- **Variable**: `GA4_API_SECRET`
- **Hardcoded Value**: `8PERvggaTUublSyLXCDB8A`
- **Status**: ✅ FIXED - Removed hardcoded fallback, added conditional check

### 1.3 Mitigation Steps

#### ✅ Step 1: Remove Hardcoded Fallbacks (COMPLETED)
- Removed hardcoded Contentful token fallback
- Removed hardcoded GA4 secret fallback
- Implemented fail-fast error handling for Contentful token
- Added conditional check for GA4 secret (continues without tracking if missing)

#### ⚠️ Step 2: Rotate Exposed Secrets (REQUIRED - Manual Action)
**Action Items:**
1. **Contentful**: 
   - Log into Contentful dashboard
   - Generate new Delivery API token
   - Update `VITE_CONTENTFUL_DELIVERY_TOKEN` in Vercel environment variables
   - Revoke old token: `e3JfeWQKBvfCQoqi22f6F_XzWgbZPXR9JWTyuSTGcFw`

2. **GA4**:
   - Log into Google Analytics 4
   - Generate new Measurement Protocol API secret
   - Update `GA4_API_SECRET` in Vercel environment variables
   - Revoke old secret: `8PERvggaTUublSyLXCDB8A`

#### ⚠️ Step 3: Verify Environment Variables (REQUIRED - Manual Action)
**Action Items:**
1. Verify all required environment variables are set in:
   - Vercel Production environment
   - Vercel Preview environments
   - Local `.env` file (for development)

2. Environment variable checklist:
   ```
   ✅ VITE_CONTENTFUL_SPACE_ID
   ✅ VITE_CONTENTFUL_DELIVERY_TOKEN (must be set, no fallback)
   ✅ GA4_API_SECRET (optional, but recommended)
   ✅ GA4_MEASUREMENT_ID
   ✅ GA4_MP_ENDPOINT
   ✅ STRIPE_SECRET_KEY
   ✅ STRIPE_WEBHOOK_SECRET
   ```

#### 📋 Step 4: Add Pre-Deployment Validation (RECOMMENDED)
**Action Items:**
1. Create a validation script that checks for hardcoded secrets
2. Add to CI/CD pipeline or pre-commit hook
3. Use tools like `gitleaks` or `truffleHog` to scan for secrets

**Example Script** (`scripts/check-secrets.sh`):
```bash
#!/bin/bash
# scripts/check-secrets.sh

echo "Checking for hardcoded secrets..."

# Check for Contentful token pattern
if grep -r "e3JfeWQKBvfCQoqi22f6F_XzWgbZPXR9JWTyuSTGcFw" --include="*.ts" --include="*.tsx" --include="*.js" .; then
  echo "❌ ERROR: Hardcoded Contentful token found!"
  exit 1
fi

# Check for GA4 secret pattern
if grep -r "8PERvggaTUublSyLXCDB8A" --include="*.ts" --include="*.tsx" --include="*.js" .; then
  echo "❌ ERROR: Hardcoded GA4 secret found!"
  exit 1
fi

echo "✅ No hardcoded secrets found"
exit 0
```

---

## 2. Standardize Error Handling (Priority: HIGH)

### 2.1 Issue
Inconsistent error handling with potential for exposing sensitive information.

### 2.2 Mitigation Steps

#### 📋 Step 1: Create Error Handling Utility (RECOMMENDED)
**File**: `src/utils/errorHandler.ts`

```typescript
/**
 * Sanitizes error messages to prevent exposing sensitive information
 */
export function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    // Remove stack traces in production
    if (process.env.NODE_ENV === 'production') {
      return error.message || 'An error occurred';
    }
    return error.message;
  }
  return 'An unexpected error occurred';
}

/**
 * Logs error to console and Sentry without exposing sensitive data
 */
export function logError(error: unknown, context?: string) {
  const message = sanitizeError(error);
  console.error(context ? `[${context}] ${message}` : message);
  
  // Send to Sentry if configured
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.captureException(error, { tags: { context } });
  }
}
```

#### 📋 Step 2: Update Edge Functions (RECOMMENDED)
**Action Items:**
1. Review all edge functions for error handling
2. Ensure no stack traces are returned to clients
3. Use consistent error response format

**Standard Error Response Format:**
```typescript
{
  error: true,
  message: "User-friendly error message",
  code: "ERROR_CODE" // Optional, for client-side handling
}
```

---

## 3. Complete MFA Integration (Priority: MEDIUM)

### 3.1 Current State
MFA is available via Supabase Auth but not fully integrated into the UI.

### 3.2 Mitigation Steps

#### 📋 Step 1: Add MFA UI Components (PLANNED)
**Action Items:**
1. Create MFA setup component (`src/components/auth/MFASetup.tsx`)
2. Add MFA management to user settings
3. Implement QR code display for TOTP setup
4. Add backup codes generation and display

#### 📋 Step 2: Enforce MFA for Admin Users (PLANNED)
**Action Items:**
1. Require MFA for users with `admin` or `org_admin` roles
2. Show MFA setup prompt on first login for admin users
3. Block access to sensitive features until MFA is enabled

#### 📋 Step 3: Add MFA to Feature Flags (PLANNED)
**Action Items:**
1. Create feature flag: `mfa_enforcement`
2. Gradually roll out MFA requirements
3. Monitor adoption and user feedback

---

## 4. Refactor Contentful Integration (Priority: MEDIUM)

### 4.1 Current State
`DynamicHelmet.tsx` has Contentful calls disabled due to infinite loop issues.

### 4.2 Mitigation Steps

#### 📋 Step 1: Fix Infinite Loop (PLANNED)
**Action Items:**
1. Review `src/components/DynamicHelmet.tsx`
2. Identify cause of infinite loop (likely useEffect dependencies)
3. Implement proper memoization and dependency management
4. Add request caching to prevent excessive API calls

#### 📋 Step 2: Re-enable Dynamic SEO (PLANNED)
**Action Items:**
1. Test Contentful integration in staging
2. Monitor for performance issues
3. Gradually re-enable in production

---

## 5. Implement Automated Testing (Priority: MEDIUM)

### 5.1 Current State
No formal automated testing strategy.

### 5.2 Mitigation Steps

#### 📋 Step 1: Set Up Testing Framework (PLANNED)
**Action Items:**
1. Install Vitest (recommended for Vite projects)
2. Install React Testing Library
3. Install Playwright for E2E tests

#### 📋 Step 2: Write Critical Tests (PLANNED)
**Priority Test Cases:**
1. Authentication flow
2. Anonymous report submission
3. Encryption/decryption
4. RLS policy enforcement
5. Edge function error handling

#### 📋 Step 3: Add to CI/CD (PLANNED)
**Action Items:**
1. Run tests on every PR
2. Require tests to pass before merge
3. Add test coverage reporting

---

## 6. Dependency Security Auditing (Priority: ONGOING)

### 6.1 Action Items
1. Set up Dependabot or Renovate for automated dependency updates
2. Run `npm audit` weekly
3. Review and update dependencies monthly
4. Monitor security advisories for critical packages

---

## Implementation Timeline

### ✅ Week 1 (COMPLETED)
- [x] Remove hardcoded secrets from code
- [ ] Rotate exposed Contentful and GA4 secrets (MANUAL ACTION REQUIRED)
- [ ] Verify all environment variables are set (MANUAL ACTION REQUIRED)
- [ ] Deploy fixes to production

### 📋 Week 2 (HIGH PRIORITY)
- [ ] Create error handling utility
- [ ] Update edge functions with standardized error handling
- [ ] Add pre-deployment secret scanning
- [ ] Document error handling patterns

### 📋 Week 3-4 (MEDIUM PRIORITY)
- [ ] Begin MFA integration
- [ ] Fix Contentful infinite loop
- [ ] Set up testing framework
- [ ] Write critical test cases

### 🔄 Ongoing
- [ ] Dependency security auditing
- [ ] Code review for security best practices
- [ ] Regular security assessments

---

## Success Criteria

1. ✅ No hardcoded secrets in codebase
2. ⚠️ All exposed secrets rotated (MANUAL ACTION REQUIRED)
3. 📋 Fail-fast error handling implemented
4. 📋 No sensitive data exposed in error messages
5. 📋 Automated secret scanning in CI/CD
6. 📋 MFA available and enforced for admins
7. 📋 Contentful integration working without loops
8. 📋 Automated tests for critical paths

---

## Notes

- **Secret Rotation**: Coordinate with team before rotating secrets to avoid service disruption
- **Testing**: Start with critical paths, expand gradually
- **MFA**: Consider gradual rollout to avoid user friction
- **Documentation**: Update LLMREADME.md and README.md as changes are implemented

---

## Manual Actions Required

### IMMEDIATE (Before Next Deployment)
1. **Rotate Contentful Token**:
   - Generate new token in Contentful dashboard
   - Update `VITE_CONTENTFUL_DELIVERY_TOKEN` in Vercel
   - Revoke old token

2. **Rotate GA4 Secret**:
   - Generate new secret in GA4
   - Update `GA4_API_SECRET` in Vercel
   - Revoke old secret

3. **Verify Environment Variables**:
   - Check all required vars are set in Vercel production
   - Test sitemap generation
   - Test Stripe webhook with GA4 tracking

---

**Last Updated**: November 17, 2025  
**Next Review**: After secret rotation

