# Pull Request: UX Improvements, Navigation Fixes, and Language Settings

## 📋 Summary

This PR improves the user experience for the progressive whistleblowing form by fixing navigation issues, adding clear status lookup access, ensuring consistent branding across all pages, and introducing default language settings for administrators.

## 🎯 Key Changes

### 1. Status Lookup UX Improvements

**Problem**: Users needed a clear way to check the status of existing reports from the welcome page, but this functionality wasn't easily discoverable.

**Solution**:
- ✅ Added "Check Existing Report" button to Step1Welcome (welcome page)
- ✅ Button navigates to `/status` for DIS tracking ID lookup
- ✅ Separated "Check Existing Report" from "Resume a saved draft" for clearer user intent
- ✅ Side-by-side layout on desktop, stacked on mobile

**Files Changed**:
- `src/components/forms/progressive-steps/Step1Welcome.tsx`

**Before**:
```tsx
<Button variant="link" onClick={() => window.location.href = '/resume-draft'}>
  Resume a saved draft
</Button>
```

**After**:
```tsx
<div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
  <Button variant="link" onClick={() => window.location.href = '/status'}>
    Check Existing Report
  </Button>
  <span className="hidden sm:inline text-gray-400">|</span>
  <Button variant="link" onClick={() => window.location.href = '/resume-draft'}>
    Resume a saved draft
  </Button>
</div>
```

---

### 2. Logo Navigation Fixes

**Problem**: Logo clicks in the branded header were using legacy URLs (`/secure/tool/submit/${token}`, `/secure/tool/status`) instead of the new clean URLs.

**Solution**:
- ✅ Simplified `getMainSecurePageUrl()` to always return `/report`
- ✅ Consistent navigation: Logo clicks always go to the main form welcome page
- ✅ Works across all form pages (submission, status lookup, draft resume)

**Files Changed**:
- `src/components/BrandedFormLayout.tsx`

**Before**:
```tsx
const getMainSecurePageUrl = () => {
  if (token) {
    return `/secure/tool/submit/${token}`;
  }
  const pathMatch = window.location.pathname.match(/\/secure\/tool\/(submit|status)\/([^\/]+)/);
  if (pathMatch && pathMatch[2]) {
    return `/secure/tool/submit/${pathMatch[2]}`;
  }
  return '/secure/tool/status';
};
```

**After**:
```tsx
const getMainSecurePageUrl = () => {
  // Always return the clean /report URL for the main form
  // This provides a consistent UX regardless of how the user accessed the form
  return '/report';
};
```

---

### 3. Resume Draft Page Branding Consistency

**Problem**: `/resume-draft` page showed a fallback plain Card when organization branding hadn't loaded yet, breaking the consistent branded experience.

**Solution**:
- ✅ Always use `BrandedFormLayout` with default or loaded branding
- ✅ Removed fallback Card component
- ✅ Consistent header across all form-related pages

**Files Changed**:
- `src/pages/ResumeDraft.tsx`

**Before**: Two rendering paths (BrandedFormLayout OR plain Card)

**After**: Single rendering path (always BrandedFormLayout)

```tsx
return (
  <BrandedFormLayout
    title="Resume Draft"
    organizationName={organizationBranding?.name || 'Disclosurely'}
    logoUrl={logoUrl}
    brandColor={brandColor}
    description="Enter your draft code to continue your report"
  >
    {content}
  </BrandedFormLayout>
);
```

---

### 4. Default Language Settings (New Feature) 🆕

**Problem**: Administrators had no way to set a default language for their submission form. All users defaulted to English regardless of the organization's primary language.

**Solution**:
- ✅ Added `default_language` column to `organization_links` table
- ✅ Added language selector UI in Secure Link dashboard
- ✅ Supports all 12 available languages
- ✅ Users can still override language selection within the form
- ✅ Persists setting per organization link

**Files Changed**:
- `src/components/LinkGenerator.tsx` - Added language selector UI + mutation
- `supabase/migrations/20251108200000_add_default_language_to_organization_links.sql` - Database migration

**Supported Languages**:
- 🇬🇧 English (en)
- 🇪🇸 Español (es)
- 🇫🇷 Français (fr)
- 🇩🇪 Deutsch (de)
- 🇵🇱 Polski (pl)
- 🇸🇪 Svenska (sv)
- 🇳🇴 Norsk (no)
- 🇵🇹 Português (pt)
- 🇮🇹 Italiano (it)
- 🇳🇱 Nederlands (nl)
- 🇩🇰 Dansk (da)
- 🇬🇷 Ελληνικά (el)

**UI Screenshot**:

```
Form Settings
Configure the default language for your submission form

Default Language:  [🇬🇧 English ▼]

This sets the default language when users access your submission form.
Users can still change the language within the form.
```

**Database Migration**:
```sql
ALTER TABLE public.organization_links
ADD COLUMN IF NOT EXISTS default_language TEXT DEFAULT 'en';
```

---

## 🧪 Testing Checklist

### Status Lookup Flow
- [ ] Visit `/report` (or `/newform`)
- [ ] Verify "Check Existing Report" button appears on welcome page
- [ ] Click "Check Existing Report"
- [ ] Verify navigation to `/status`
- [ ] Enter valid DIS tracking ID (e.g., `DIS-8DZ90VQE`)
- [ ] Verify navigation to `/status/DIS-XXXXX` with messaging interface

### Logo Navigation
- [ ] From `/report` - Click logo → Returns to `/report` (refresh)
- [ ] From `/status` - Click logo → Returns to `/report`
- [ ] From `/resume-draft` - Click logo → Returns to `/report`
- [ ] From messaging page `/status/DIS-XXXXX` - Click logo → Returns to `/report`

### Resume Draft Page
- [ ] Visit `/resume-draft` directly
- [ ] Verify branded header appears immediately (even without draft code)
- [ ] Enter valid draft code
- [ ] Verify organization branding loads and updates header
- [ ] Verify "Start a new report instead" button goes to `/newform`

### Language Settings
- [ ] Login as admin
- [ ] Go to Dashboard → Secure Link
- [ ] Scroll to "Form Settings" card
- [ ] Verify "Default Language" dropdown is visible
- [ ] Change language to Spanish (🇪🇸 Español)
- [ ] Verify success toast: "Language Updated"
- [ ] Refresh page
- [ ] Verify language selection persists
- [ ] **Future**: Verify form defaults to selected language when accessed

---

## 🗄️ Database Changes

### Migration Required

**Run this migration in the Supabase SQL editor**:

```sql
-- Run in Supabase SQL Editor
-- Migration: Add default language support to organization links

ALTER TABLE public.organization_links
ADD COLUMN IF NOT EXISTS default_language TEXT DEFAULT 'en';

COMMENT ON COLUMN public.organization_links.default_language IS 'Default language code for the submission form (e.g., en, es, fr, de, etc.)';
```

**Migration File**: `supabase/migrations/20251108200000_add_default_language_to_organization_links.sql`

**To apply**:
```bash
# If using Supabase CLI
supabase db push

# Or run directly in Supabase SQL Editor
# Copy content from migration file and execute
```

---

## 🔄 Related Changes

This PR builds on recent improvements:

1. **Previous PR**: Status lookup route migration (`/secure/tool/messaging/:trackingId` → `/status/:trackingId`)
2. **Previous PR**: Progressive form launch (`ProgressiveReportForm` replaced old form)
3. **Previous PR**: Security fixes for draft system (RLS policies, edge functions)

---

## 📊 Impact Assessment

### User Experience
- ✅ **Positive**: Clearer navigation and easier access to status lookup
- ✅ **Positive**: Consistent branding across all form pages
- ✅ **Positive**: Multilingual organizations can set appropriate default language
- ⚠️ **Note**: Language selection currently only affects UI; needs integration with form initialization

### Performance
- ✅ **Neutral**: No performance impact
- ✅ **Migration**: Adds single TEXT column to organization_links (minimal impact)

### Backward Compatibility
- ✅ **Fully compatible**: All legacy routes still work
- ✅ **Default value**: Existing links default to 'en' (English)
- ✅ **No breaking changes**: Users can still change language in-form

---

## 🚀 Deployment Steps

1. **Merge this PR** to main/production branch
2. **Run database migration**:
   ```bash
   # Option 1: Supabase CLI
   supabase db push

   # Option 2: Supabase Dashboard
   # Go to SQL Editor → Run migration file content
   ```
3. **Deploy frontend** (automatic via Vercel/deployment pipeline)
4. **Verify deployment**:
   - Check `/report` welcome page has status lookup button
   - Check logo navigation works correctly
   - Check `/resume-draft` has branded header
   - Check language selector appears in Dashboard → Secure Link

---

## 🔮 Future Enhancements

### Short-term (Next Sprint)
1. **Integrate default language with form initialization**
   - Load organization link's `default_language` in form wrappers
   - Pass to ProgressiveReportForm as initial language
   - Currently: Language selector added but not yet integrated with form

2. **Add language setting to custom domains**
   - Allow different default languages per custom domain
   - Example: `en.company.com` defaults to English, `es.company.com` defaults to Spanish

### Medium-term (Future)
3. **Auto-detect user's browser language**
   - Use `navigator.language` as fallback if no org default set
   - Respect org default if explicitly configured

4. **Language analytics**
   - Track which languages are used most by submitters
   - Help admins optimize their default language setting

5. **Localize dashboard UI**
   - Currently only forms are multilingual
   - Extend i18n to admin dashboard

---

## 🐛 Known Issues / Limitations

1. **Default language not yet integrated with form**
   - UI for setting language is complete
   - Database column is ready
   - Need to add logic in `ProgressiveFormWrapper.tsx`, `CleanSubmissionWrapper.tsx`, etc. to fetch and use `default_language`
   - **Workaround**: Users can manually select language in form

2. **No validation for language codes**
   - Database accepts any TEXT value
   - Frontend dropdown restricts to 12 supported languages
   - **Risk**: Minimal (controlled via UI)

3. **Language setting is per-link, not per-organization**
   - Each `organization_link` has its own default language
   - Organizations with multiple links may need to set language multiple times
   - **Future**: Consider org-level default with link-level override

---

## 📝 Additional Notes

### Why separate "Check Existing Report" and "Resume Draft"?

These serve different use cases:
- **Check Existing Report**: User wants to view status/messages for a submitted report (has DIS tracking ID)
- **Resume Draft**: User wants to continue filling out an incomplete report (has draft code)

Combining these into one button/modal would require users to know the difference between DIS IDs and draft codes, leading to confusion.

### Why logo always goes to `/report`?

- **Consistency**: Users expect the logo to go to the "home" page of the app
- **For anonymous forms**: `/report` is the natural starting point (new submission)
- **Discoverable**: Users can always click logo to start over or access other form features from welcome page

### Why add `default_language` column instead of using `custom_fields` JSONB?

- **Queryability**: Easier to query and filter by language
- **Performance**: Indexed TEXT column vs JSONB query
- **Type safety**: Explicit column vs dynamic JSON field
- **Future**: Easier to add constraints (e.g., CHECK constraint for valid language codes)

---

## 🎉 Summary

This PR delivers:
- ✅ Improved discoverability of status lookup functionality
- ✅ Consistent logo navigation across all form pages
- ✅ Uniform branding on all pages (including resume draft)
- ✅ Foundation for multilingual support (language settings in dashboard)

**Ready to merge**: All changes are backward compatible and incrementally improve UX.

**Next steps**: Integrate default language setting with form initialization in follow-up PR.

---

**Branch**: `claude/whistleblowing-feature-roadmap-011CUtVb77xMdFcqQBajYmKw`
**Commits**:
- `fa7189f` - Improve UX for status lookups, form navigation, and add language settings
- `c988cc3` - Update status lookup to use /status route instead of legacy /secure/tool/messaging
- `78665db` - Add comprehensive whistleblowing feature roadmap for 2025

**Related PRs**:
- Progressive Form Launch
- Security Fixes for Draft System
- Whistleblowing Feature Roadmap 2025
