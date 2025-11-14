# Privacy & Security Fix Plan
## Based on Privacy Analysis Report Review

**Date:** December 2024  
**Status:** Ready for Implementation

---

## Executive Summary

After reviewing the Privacy Analysis Report and codebase, I've identified **3 CRITICAL issues** that are real and need immediate attention, **4 HIGH priority issues**, and several medium/low priority items. Some issues mentioned in the report are already mitigated (IP logging is already null for anonymous reports).

---

## ✅ FALSE POSITIVES / ALREADY MITIGATED

### 1. IP Address Logging for Anonymous Reports (REPORTED AS CRITICAL)
**Status:** ✅ **ALREADY MITIGATED**

**Evidence:**
- `supabase/functions/submit-anonymous-report/index.ts:572` - Sets `actorIpAddress: null`
- `supabase/functions/anonymous-report-messaging/index.ts:39` - Sets `actor_ip_address: null`
- Edge functions explicitly null IP addresses for anonymous actions

**Action Required:** None - already handled correctly. However, we should:
- Document this behavior clearly
- Ensure frontend `auditLogger.log()` calls also null IPs for anonymous actions
- Add validation to prevent accidental IP logging

---

## 🔴 CRITICAL ISSUES (Fix Immediately)

### C1. Original Filenames Stored in Database (PII Risk)
**Severity:** CRITICAL  
**Location:** `src/utils/fileUpload.ts:46`, `report_attachments.original_filename`

**Issue:**
- Original filenames like "John_Smith_Salary_Details_2024.pdf" are stored in plaintext
- Even with encrypted database, filenames can identify reporters
- Filenames appear in audit logs and UI components

**Fix:**
1. Hash original filename: `SHA-256(original_filename + report_id + salt)`
2. Store hash instead of original filename
3. Allow user to provide sanitized display name (e.g., "Supporting Document 1")
4. Validate sanitized names: no dates, names, or identifying details
5. Update UI components to use sanitized names or generic labels
6. Migrate existing data: hash existing filenames

**Files to Modify:**
- `src/utils/fileUpload.ts` - Hash filename before storing
- `src/components/ReportAttachments.tsx` - Use sanitized names
- `src/components/CompactReportAttachments.tsx` - Use sanitized names
- Migration: Hash existing `original_filename` values

**Timeline:** 1-2 days

---

### C2. Server-Side PII Scanning Missing
**Severity:** CRITICAL  
**Location:** Edge functions (submit-anonymous-report, encrypt-report-data)

**Issue:**
- Client-side PII detection can be bypassed
- No server-side validation before encryption
- PII could leak to AI models or logs

**Fix:**
1. Add server-side PII scanner in `submit-anonymous-report` edge function
2. Scan report content before encryption
3. Log PII detections for compliance
4. Option to auto-redact or flag for review
5. Reuse existing `privacyDetection.ts` patterns server-side

**Files to Create/Modify:**
- Create: `supabase/functions/pii-scanner/index.ts` (shared utility)
- Modify: `supabase/functions/submit-anonymous-report/index.ts` - Add PII scan
- Modify: `supabase/functions/encrypt-report-data/index.ts` - Add PII scan

**Timeline:** 2-3 days

---

### C3. Unstructured Data in Application Logs (PII Risk)
**Severity:** CRITICAL  
**Location:** `src/utils/logger.ts`, `src/utils/auditLogger.ts`

**Issue:**
- `data?: any` field in logs could contain PII
- No sanitization before logging
- PII could appear in log exports and monitoring systems

**Fix:**
1. Create `sanitizeLogData()` function
2. Remove/hash emails, phones, names, IPs before logging
3. Apply to all `logger.log()` and `auditLogger.log()` calls
4. Scan metadata fields for PII patterns
5. Add PII detection to log data sanitizer

**Files to Modify:**
- `src/utils/logger.ts` - Add sanitization middleware
- `src/utils/auditLogger.ts` - Sanitize metadata before insert
- All edge functions using logger - Ensure sanitization

**Timeline:** 1-2 days

---

## 🟠 HIGH PRIORITY ISSUES

### H1. File Type Restrictions Missing
**Severity:** HIGH  
**Location:** `src/utils/fileUpload.ts`

**Issue:**
- No whitelist/blacklist for file types
- Could allow executables, scripts, or malicious archives
- Risk to investigators downloading files

**Fix:**
1. Implement file type whitelist:
   - Documents: PDF, DOCX, XLSX, PPTX
   - Images: JPEG, PNG (no SVG/ICO)
   - Archives: ZIP only (with size limits)
2. Blacklist dangerous types:
   - Executables: EXE, DLL, COM, APP
   - Scripts: JS, VBS, PS1, SH, BAT, CMD
   - Archives: RAR, 7Z, CAB, ISO
3. Validate MIME type (not just extension)
4. Magic bytes verification (file signature)
5. Server-side validation in edge function

**Files to Modify:**
- `src/utils/fileUpload.ts` - Add type validation
- Create: `supabase/functions/validate-file-upload/index.ts` - Server-side validation

**Timeline:** 2 days

---

### H2. File Download Logging Missing
**Severity:** HIGH  
**Location:** File download endpoints/components

**Issue:**
- File uploads are logged, but downloads are not
- No accountability for file access
- Cannot track who accessed sensitive evidence

**Fix:**
1. Log every file download:
   - Who downloaded (user ID, email)
   - What file (file hash, sanitized name)
   - When (timestamp)
   - From where (IP - only for authenticated users)
2. Store in audit logs
3. Make visible in case audit history
4. Alert on bulk downloads (>10 files in 5 minutes)

**Files to Modify:**
- `src/components/ReportAttachments.tsx` - Add download logging
- `src/components/CompactReportAttachments.tsx` - Add download logging
- Edge function for file downloads - Add audit logging

**Timeline:** 1-2 days

---

### H3. Audit Log Access Control for Anonymous Cases
**Severity:** HIGH  
**Location:** RLS policies, `src/components/AuditLogView.tsx`

**Issue:**
- All staff with case access can see full audit logs
- Anonymous case logs may reveal IP, user agent, session data
- Should restrict sensitive fields for anonymous cases

**Fix:**
1. Update RLS policies to hide sensitive fields for anonymous cases:
   - Hide `actor_ip_address` for anonymous actions
   - Hide `actor_user_agent` for anonymous actions
   - Hide `actor_session_id` for anonymous actions
   - Hide `geo_*` fields for anonymous actions
2. Create view/function that filters sensitive data
3. Update `AuditLogView.tsx` to respect anonymity status
4. Admin-only view for full audit trail

**Files to Modify:**
- `supabase/migrations/` - Create RLS policy updates
- `src/components/AuditLogView.tsx` - Filter sensitive fields
- Create: View function for filtered audit logs

**Timeline:** 2 days

---

### H4. File Size Limits Not Documented/Enforced
**Severity:** HIGH  
**Location:** `src/utils/fileUpload.ts`, edge functions

**Issue:**
- No documented file size limits
- Risk of storage DoS attacks
- No rate limiting on uploads

**Fix:**
1. Document limits:
   - Max file size: 50MB per file
   - Max total per report: 500MB
   - Max files per report: 20
2. Enforce on client and server
3. Show limits in UI before upload
4. Rate limiting: Max 10 files per report per hour
5. Clear error messages when limits exceeded

**Files to Modify:**
- `src/utils/fileUpload.ts` - Add size validation
- Edge function - Server-side size validation
- UI components - Show limits and progress

**Timeline:** 1 day

---

## 🟡 MEDIUM PRIORITY ISSUES

### M1. Rate Limiting on Access Code Verification
**Severity:** MEDIUM  
**Location:** Access code verification endpoints

**Fix:**
- Add CAPTCHA or exponential backoff after 3 failed attempts
- Prevent brute force on 8-character codes

**Timeline:** 1 day

---

### M2. Expand PII Detection Patterns
**Severity:** MEDIUM  
**Location:** `src/utils/privacyDetection.ts`

**Fix:**
- Add medical record numbers
- Add bank account numbers (IBAN/SWIFT)
- Add passport numbers (multiple countries)
- Add driver's license numbers

**Timeline:** 2-3 days

---

### M3. Metadata Anonymization Option
**Severity:** MEDIUM  
**Location:** Organization settings, report submission

**Fix:**
- Offer "high anonymity" mode
- Generalize timestamps to hours/dates
- Shuffle report sequence
- Remove location data entirely

**Timeline:** 3-4 days

---

### M4. Handler Guidance for Anonymity Preservation
**Severity:** MEDIUM  
**Location:** Case handler UI, note-taking components

**Fix:**
- System prompts when writing notes on anonymous cases
- Auto-scan handler notes for PII
- Flag notes containing likely identification
- Training module on anonymity preservation

**Timeline:** 2-3 days

---

## 📋 IMPLEMENTATION PRIORITY

### Week 1 (Critical)
1. ✅ C1: Hash original filenames
2. ✅ C2: Server-side PII scanning
3. ✅ C3: Sanitize log data

### Week 2 (High Priority)
4. ✅ H1: File type restrictions
5. ✅ H2: File download logging
6. ✅ H3: Audit log access control
7. ✅ H4: File size limits

### Week 3-4 (Medium Priority)
8. M1: Rate limiting on access codes
9. M2: Expand PII detection
10. M3: Metadata anonymization
11. M4: Handler guidance

---

## 🔍 VERIFICATION CHECKLIST

After fixes are implemented:

- [ ] Original filenames are hashed, not stored in plaintext
- [ ] Server-side PII scanning catches bypassed client-side detection
- [ ] All log data is sanitized before storage
- [ ] File uploads validate type and size on client and server
- [ ] File downloads are logged with full audit trail
- [ ] Anonymous case audit logs hide IP, user agent, session data
- [ ] File size limits are enforced and documented
- [ ] Rate limiting prevents brute force on access codes
- [ ] PII detection covers industry-specific data types
- [ ] High anonymity mode available for organizations
- [ ] Handler notes are scanned for PII

---

## 📝 NOTES

- IP logging is already correctly nulled for anonymous reports - no action needed
- Some recommendations in the privacy report are already implemented
- Focus on the 3 critical issues first, then high priority items
- Test all fixes with both anonymous and confidential reports
- Update privacy policy/documentation after fixes are deployed

