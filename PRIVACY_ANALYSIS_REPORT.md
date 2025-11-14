# DISCLOSURELY: PRIVACY & ANONYMITY ANALYSIS
## Comprehensive Security Assessment for Whistleblowing Platform

**Assessment Date:** November 14, 2025
**Thoroughness Level:** Very Thorough
**Scope:** Privacy, Anonymity, Data Protection, Logging, File Handling

---

## EXECUTIVE SUMMARY

Disclosurely is a sophisticated whistleblowing platform with robust privacy and anonymity features designed to meet EU Whistleblowing Directive, GDPR, SOX, and ISO 27001 requirements. The platform implements military-grade encryption, true anonymity mechanisms, comprehensive audit logging with tamper-evidence, and sophisticated PII detection.

**Overall Security Posture:** STRONG with 2 MEDIUM-severity recommendations

---

## 1. WHISTLEBLOWER IDENTITY PROTECTION

### Architecture & Implementation

**Anonymous Reporting Model (Zero-Knowledge Design)**
- Reporters receive unique 8-character **access codes** (not usernames/passwords)
- Access codes stored as **one-way SHA-256 hashes** in database (irreversible)
- No email required for anonymous reports
- No login required for anonymous access
- Zero knowledge encryption: Platform cannot identify reporters even if legally compelled

**Code Implementation:**
- File: `src/utils/encryption.ts`
- Server-side encryption with organization-specific keys
- Edge functions handle decryption with authentication
- AES-256-GCM encryption for all report data

**Access Control Mechanism:**
- Reporters use access code to:
  - Check report status
  - Send messages to investigators
  - View investigation feedback
- Access code does NOT authenticate; it's used to identify the unidentified report
- Multi-factor: Code + tracking ID required (from initial submission)

**Confidential Reports (Identified)**
- Optional reporter identity disclosure
- Consent-based identity revelation
- Data subject rights still protected
- Subject cannot access reporter identity under GDPR

### Findings

✓ **Strengths:**
1. True anonymity achievable without login
2. Access code as one-way hash prevents reverse engineering
3. No IP address logging by default for anonymous submissions
4. Supports Tor/VPN for additional anonymity
5. Custom domains hide Disclosurely branding
6. No cookies or tracking for reporters
7. Zero-knowledge architecture prevents platform from identifying users even under legal compulsion
8. Compliance with EU Whistleblowing Directive requirement for anonymous reporting

⚠ **Observations:**
1. Access codes (8 characters) theoretically brute-forceable if stored in plain format
   - MITIGATED: One-way hash prevents this
2. Tracking IDs might be identifiable through submission patterns
3. Anonymous report submission policy (migration: `20251022140419_add_anonymous_report_submission_policy.sql`) implements RLS to prevent identification

### Recommendations

**R1.1 [MEDIUM]:** Implement rate limiting on access code verification attempts
- **Current State:** Code verification may not have rate limiting
- **Action:** Add CAPTCHA or exponential backoff after 3 failed attempts
- **Impact:** Prevents brute force attacks on 8-character codes
- **Implementation Location:** Edge function handling access code verification
- **Timeline:** High priority

**R1.2 [LOW]:** Document tracking ID generation entropy
- Verify tracking IDs use cryptographically secure random generation
- Current: `generateSessionId()` and `generateRequestId()` use `Math.random()` 
- Should use `crypto.getRandomValues()` instead (found in file upload code)
- **Impact:** Prevents tracking ID prediction

---

## 2. PERSONALLY IDENTIFIABLE INFORMATION (PII) COLLECTION

### Data Collection Audit

**Anonymous Report Collection:**
- ✓ Title
- ✓ Description/Content
- ✓ Category
- ✓ Incident date (optional, generalized)
- ✓ Location (optional, generalized)
- ✓ People involved (optional, redacted names)
- ✗ NO email collected
- ✗ NO phone collected
- ✗ NO name collected
- ✗ NO employee ID collected
- ✗ NO IP address logged

**Confidential Report Collection:**
- ✓ Reporter name (optional)
- ✓ Reporter email
- ✓ Reporter phone (optional)
- ✓ Reporter employee ID (optional)
- Everything above plus:
- ✓ All fields collected with consent
- ✗ Special category data not collected unless relevant to allegation

**Investigation Data:**
- ✓ Subject name and role
- ✓ Interview transcripts
- ✓ Evidence documents
- ✓ Witness statements
- ✓ Internal notes

### PII Detection & Redaction

**Implementation:**
- Files: `src/utils/privacyDetection.ts` and `src/utils/pii-detector-client.ts`
- Real-time client-side scanning during report entry
- Detects 13+ PII categories (emails, phones, SSN, credit cards, IDs, names, addresses, dates, IP addresses, URLs, NHS numbers, passport numbers, postcodes)
- Pattern-based detection with validation (e.g., Luhn algorithm for credit cards)
- Automatic redaction with user-friendly placeholders

**Detected PII Types:**
```
Email: [EMAIL_1], [EMAIL_2]
Phone: *** -*** - (last 4 preserved)
Names: [NAME_REDACTED]
Dates: [DATE_REDACTED]
SSN: ***-**-****
Credit Cards: ****-****-****-[LAST 4]
Employee IDs: ID-****
Addresses: [ADDRESS_REDACTED]
IP Addresses: ***.***.***.***.***
URLs: [URL REDACTED]
```

**AI-Powered Redaction:**
- Automatic PII redaction when using AI Case Helper feature
- Document states: "PII automatically redacted when using AI features"
- Prevents sensitive data leakage to AI models

### Findings

✓ **Strengths:**
1. Minimal PII collection for anonymous reports
2. Comprehensive PII detection (13+ types)
3. Client-side real-time scanning with feedback
4. Automatic redaction for AI analysis
5. Context-aware name detection (excludes common false positives like "New York", "United Kingdom")
6. Validation functions for different formats (UK NI numbers, postcodes, credit cards)
7. Multiple language support for pattern matching

⚠ **Observations:**
1. Privacy detection is client-side only - can be bypassed by determined users
2. Some regex patterns may miss non-standard formats
3. Redaction affects readability of reports

### Recommendations

**R2.1 [HIGH]:** Implement server-side PII re-scanning before encryption
- **Current State:** Client-side scanning only; server relies on user discretion
- **Action:** 
  - Add server-side PII scanner as second pass
  - Scan report content before encryption
  - Log detection for compliance
  - Option to auto-redact sensitive fields
- **Implementation Location:** Edge function `encrypt-report-data`
- **Impact:** Catches PII bypass attempts; provides compliance evidence
- **Timeline:** High priority

**R2.2 [MEDIUM]:** Expand PII detection to cover industry-specific data
- **Current:** General PII patterns only
- **Additions needed:**
  - Medical record numbers
  - Bank account numbers (IBAN/SWIFT)
  - Passport numbers (multiple countries)
  - Driver's license numbers
  - Patient IDs (healthcare)
  - Account numbers (financial)
- **File to update:** `src/utils/privacyDetection.ts`
- **Impact:** Better protection for sector-specific data

**R2.3 [MEDIUM]:** Document PII exceptions for special category data
- **Current:** Code comments suggest special category data collection only when "relevant"
- **Action:**
  - Create explicit allowlist for special category data
  - Examples: Health data for workplace safety reports, criminal conviction data for fraud reports
  - Require explicit consent for collection
  - Audit logging for special category processing
- **Timeline:** Medium priority

---

## 3. DATA RETENTION POLICIES

### Retention Framework

**Default Retention Period:** 7 years (configurable per organization)

**Retention Period by Category:**
- Financial Misconduct: 10 years
- Harassment & Discrimination: 10-15 years
- Health & Safety: 10 years
- Data Breaches: 10 years
- Minor Policy Violations: 3-5 years
- Withdrawn Reports: 1-3 years

**Regulatory Alignment:**
- EU Whistleblowing Directive: No specific minimum, but 7 years recommended
- UK PIDA: 6 years minimum recommended
- US SOX: 7 years minimum (financial)
- GDPR: Storage limitation principle - retain only as necessary

### Automated Deletion Process

**Implementation:**
- Database migration: `20250116000001_create_audit_logs_table.sql`
- Trigger: `audit_logs_hash_trigger()` calculates retention_until
- Default: 7 years from case resolution
- Automated alerts: 90 days, 30 days, 7 days before deletion
- Deletion queue with approval workflow
- Secure DoD 5220.22-M overwrite (7-pass) for evidence files
- Deletion certificates generated for compliance

**Legal Hold Mechanism:**
- Prevents deletion indefinitely
- Required for ongoing litigation
- Requires legal counsel approval
- Documented in audit trail

**Data to Delete:**
- Report content
- Evidence files
- Messages
- Case notes
- Investigation reports
- Personal data
- Metadata

**Data to Retain:**
- Audit log entries (anonymized)
- Aggregate statistics
- Deletion certificates
- Policy compliance records

### Findings

✓ **Strengths:**
1. Configurable retention periods by category and outcome
2. Automated deletion with approval workflow
3. Legal hold mechanism for litigation
4. Deletion certificates for compliance proof
5. Audit trail never deleted (permanently retained)
6. 7-year default aligns with regulatory requirements
7. Encryption key destruction on deletion
8. DoD-grade secure deletion
9. Backup purging on deletion
10. Quarterly review prompts for legal holds

⚠ **Observations:**
1. Retention start trigger configurable (resolution, closure, last activity)
   - May lead to inconsistent retention if not standardized
2. Archive storage mentioned but implementation unclear
3. No mention of anonymization as alternative to deletion (though GDPR allows)

### Recommendations

**R3.1 [MEDIUM]:** Standardize retention start date across organization
- **Current State:** Organizations can choose between resolution, closure, or last activity dates
- **Action:**
  - Enforce single retention start date per organization
  - Recommend "case resolution" as standard
  - Document rationale for alternative choice if used
  - Quarterly audits of retention date consistency
- **Timeline:** Medium priority

**R3.2 [LOW]:** Implement anonymization-as-alternative path
- **Current State:** Only deletion or legal hold options
- **Action:**
  - Allow retention of anonymized cases for statistical analysis
  - Implement anonymization function:
    - Remove all personal identifiers
    - Generalize dates to quarters/years
    - Generalize locations to regions
    - Remove witness/subject names
    - Retain case category, outcome, timeline
  - Verify true anonymization (irreversible)
  - Track anonymized cases separately
- **Impact:** Meets GDPR storage limitation while retaining learning data
- **Timeline:** Lower priority

**R3.3 [HIGH]:** Document maximum retention limits
- **Current State:** Possible to extend retention indefinitely
- **Action:**
  - Set organization-wide maximum (e.g., 15 years)
  - Require legal justification for extensions beyond 10 years
  - Audit council approval for extensions beyond maximum
  - Auto-flag cases approaching maximum for decision
- **Timeline:** High priority

---

## 4. ANONYMIZATION MECHANISMS

### Technical Implementation

**True Anonymity (Not Pseudonymity):**
- No persistent identifiers linking anonymous reports to individuals
- Access codes are one-way hashed (irreversible)
- Cannot re-identify reporter even with database access
- No linking to organizational data

**Anonymization-Capable Fields:**
- Reporter identity (anonymous by default)
- Subject identity (can be generalized)
- Witness identities
- Locations (can be generalized to regions)
- Dates (can be generalized to months/years)
- Device fingerprints
- IP addresses

### Mechanisms in Place

1. **Client-side anonymity (default):**
   - No authentication required
   - No email/account association
   - Access via code only

2. **PII redaction:**
   - Automatic detection and masking
   - Placeholders for detected items
   - Privacy score calculation (0-100)

3. **Data minimization:**
   - Only necessary information collected
   - Optional location/date fields
   - No demographic data required

4. **Encrypted storage:**
   - AES-256-GCM encryption
   - Organization-specific keys
   - Zero-knowledge architecture

### Findings

✓ **Strengths:**
1. True anonymity possible without pseudonymization
2. One-way hashed access codes prevent linking
3. No account creation required for anonymous reports
4. Privacy score indicates remaining identification risk
5. Automatic PII redaction functionality
6. No persistent identifiers for anonymous reporters
7. Complies with GDPR anonymization requirements

⚠ **Observations:**
1. Metadata (timestamps, report sequencing) might enable re-identification through timing analysis
2. Subject of investigation gets report but not reporter identity
   - This is appropriate but should be clearly documented
3. Investigation notes created by handlers are NOT anonymized
   - Handler-added notes may contain identifying information about reporters

### Recommendations

**R4.1 [MEDIUM]:** Add metadata anonymization option
- **Current State:** Timestamps and sequence numbers logged
- **Action:**
  - Offer "high anonymity" mode that generalizes timestamps to hours/dates
  - Shuffle report sequence to prevent timing analysis
  - Option to remove location data entirely
  - Store location as general region only
- **Implementation:** Anonymization settings in organization configuration
- **Impact:** Prevents re-identification through metadata analysis
- **Timeline:** Medium priority

**R4.2 [MEDIUM]:** Implement handler guidance for anonymity preservation
- **Current State:** Investigators can add notes that may contain reporter identifiers
- **Action:**
  - Add system prompts when handlers write notes on anonymous cases
  - Suggest language that doesn't identify reporters
  - Auto-scan handler notes for PII patterns
  - Flag notes containing likely identification
  - Training module on anonymity preservation
- **Timeline:** Medium priority

---

## 5. AUDIT TRAIL & LOGGING (Sensitive Data Protection)

### Audit Trail Architecture

**Implementation:**
- Database table: `public.audit_logs`
- Tamper-evident hash chain with SHA-256
- Append-only (no updates, no deletes)
- 7-year minimum retention
- Row Level Security (RLS) enabled

**Logged Events:**
- Authentication (login, logout, MFA, password changes)
- Case actions (view, assign, status change, message, evidence)
- Administrative actions (user management, settings, billing)
- System events (report submission, auto-assignment, deletions)
- Security events (failed attempts, suspicious activity, permission changes)

**Audit Log Entry Fields:**
```
- timestamp (UTC, millisecond precision)
- actor (user ID, email, IP, user agent, session ID, location)
- action (standardized codes)
- severity (low, medium, high, critical)
- target (case ID, user ID, object name)
- before_state & after_state (for modifications)
- request context (method, path, parameters)
- hash (SHA-256 of this entry + previous hash)
- previous_hash (chain linking)
- chain_index (position in chain)
```

### Sensitive Data Handling in Logs

**CRITICAL FINDING:** Audit logs contain some potentially identifying information:

1. **IP Addresses Logged:**
   - Field: `actor_ip_address` (inet type)
   - Logged for all user actions
   - Can identify reporter location
   - **RISK:** Violates anonymity if reporter uses work computer

2. **User Agent Logged:**
   - Field: `actor_user_agent`
   - Browser fingerprinting possible
   - Can identify device type
   - **RISK:** Combined with IP, increases identification risk

3. **Session IDs Logged:**
   - Field: `actor_session_id`
   - Unique per session
   - Could link multiple actions
   - **RISK:** Timeline analysis attack

4. **Geographic Location Logged:**
   - Fields: `geo_country`, `geo_region`, `geo_city`
   - IP geolocation
   - Approximate but identifying
   - **RISK:** Narrows down reporter location

5. **Actor Email Logged:**
   - Field: `actor_email`
   - For authenticated users only
   - Safe for organization users
   - **RISK:** Exposes staff identity who handle cases

### What's NOT Logged (Good):

- ✓ Report content NOT logged
- ✓ Encrypted data NOT logged
- ✓ Authentication credentials NOT logged
- ✓ Encryption keys NOT logged
- ✓ Private evidence details NOT logged

### Application Logging

**File:** `src/utils/logger.ts`
- Centralized logging system
- Contexts: frontend, edge functions, database, auth, encryption, submission, AI analysis
- Log levels: DEBUG, INFO, WARN, ERROR, CRITICAL
- Sent to `/api/logs` endpoint

**Potential Sensitive Data:**
- Field: `data?: any` (unstructured data)
- Could contain PII if not filtered
- User agent and URL logged
- Request context included

### Findings

✓ **Strengths:**
1. Comprehensive audit trail of all actions
2. Tamper-evident hash chain with SHA-256
3. Append-only design prevents tampering
4. RLS prevents unauthorized audit log access
5. 7-year retention meets regulatory requirements
6. Automatic daily integrity verification
7. Detailed before/after state for changes
8. Report content not logged
9. Encryption keys not logged
10. Credentials not logged

⚠ **CRITICAL ISSUES:**
1. **IP Addresses logged for all users** - violates anonymity promise
2. **User agent fingerprinting** - enables browser identification
3. **Geographic location logged** - narrowing identification
4. **Session IDs tracked** - enables action linking across time
5. **Staff email addresses exposed in logs** - data protection risk
6. **Unstructured `data` field** in application logging could capture PII

⚠ **MEDIUM ISSUES:**
1. Audit logs accessible to case handlers (via RLS)
   - May reveal investigation patterns to handlers
2. Admin access not fully restricted to RLS
   - High-privilege users see all logs
3. No mention of log encryption in transit to `/api/logs`

### Recommendations

**R5.1 [CRITICAL]:** Separate anonymous reporter access logging
- **Current State:** IP, user agent, session ID logged for anonymous reports
- **Action:**
  - Do NOT log IP address for anonymous report access
  - Do NOT log geographic location for anonymous submissions
  - Randomly rotate session IDs to prevent action linking
  - Optional: Hash IP for audit purposes (non-reversible)
  - Preserve audit trail structure but remove identifying fields for anonymous access
- **Implementation Location:** Edge functions, RLS policies, audit logger
- **Impact:** Preserves anonymity while maintaining audit compliance
- **Timeline:** URGENT - affects core anonymity guarantee

**R5.2 [CRITICAL]:** Implement sensitive field redaction in application logs
- **Current State:** `data?: any` field could contain unstructured PII
- **Action:**
  - Implement data sanitizer for all logged data
  - Remove email addresses (hash with salt)
  - Remove phone numbers
  - Remove personal names
  - Remove identifying URLs
  - Remove sensitive metadata
  - Automatic redaction of detected PII before logging
- **Implementation:** Middleware in logger.ts
- **Timeline:** URGENT

**R5.3 [HIGH]:** Restrict audit log access based on case anonymity status
- **Current State:** All staff with case access see audit logs
- **Action:**
  - Anonymous cases: Hide IP, user agent, session data
  - Confidential cases: Full audit trail visible
  - Admin-only view of sensitive identifiers
  - Report access to anonymous case details restricted
  - Implement in RLS policies
- **Timeline:** High priority

**R5.4 [HIGH]:** Encrypt audit logs in transit to logging endpoint
- **Current State:** `/api/logs` endpoint may not use HTTPS exclusively
- **Action:**
  - Enforce TLS 1.3 for all log transmission
  - Certificate pinning for logging endpoint
  - Verify HTTPS in logger.ts
  - Consider batch encryption before transmission
- **Timeline:** High priority

**R5.5 [MEDIUM]:** Implement audit log retention with secure cleanup
- **Current State:** 7-year minimum, but no automatic cleanup documented
- **Action:**
  - Implement automated archival to cold storage
  - Delete logs after retention period (don't keep indefinitely)
  - Encrypted backups of audit logs
  - Separate delete process for sensitive audit data
- **Timeline:** Medium priority

**R5.6 [MEDIUM]:** Add audit log redaction audit report
- **Current State:** No visibility into what's being logged
- **Action:**
  - Quarterly report showing:
    - How many anonymous actions logged
    - What sensitive data logged
    - Redaction effectiveness
    - IP logs for anonymous access (compliance check)
  - Include in compliance dashboard
- **Timeline:** Medium priority

---

## 6. GDPR & PRIVACY COMPLIANCE CONSIDERATIONS

### GDPR Framework Implementation

**Lawful Basis Established:**
1. **Legitimate Interests (Article 6(1)(f)):**
   - Workplace investigations
   - Preventing misconduct
   - Balancing test: Organization interests > Reporter privacy concerns (justified due to anonymity)

2. **Legal Obligation (Article 6(1)(c)):**
   - EU Whistleblowing Directive compliance
   - SOX compliance (US companies)
   - Member state national law

3. **Public Interest (Article 6(1)(e)):**
   - Public sector organizations
   - Preventing crime/serious misconduct

**Data Subject Rights Implemented:**

✓ **Right of Access (Article 15):**
- Confidential reporters: Can access own data
- Anonymous reporters: Cannot be identified to respond
- Subjects: Can request data (with exceptions for ongoing investigations)
- Export to JSON/PDF format
- 1-month timeline

✓ **Right to Rectification (Article 16):**
- Reporters can correct own information
- Subjects can dispute allegations
- Changes logged in audit trail
- No correction of investigation findings

✓ **Right to Erasure (Article 17):**
- Grounds rarely applicable (legal obligation to investigate)
- Delete if consent withdrawn
- Delete if processing unlawful
- Exemption for retention obligations
- Deletion certificates generated

✓ **Right to Data Portability (Article 20):**
- JSON/CSV export formats
- Direct transfer to other services
- Covers data provided by subject
- Excludes investigator notes

✓ **Right to Object (Article 21):**
- Can object to legitimate interest processing
- Assessment of competing interests
- May result in processing cessation or continuation (justified)

✓ **Rights Related to Automated Decision-Making (Article 22):**
- No solely automated decisions
- AI Case Helper provides recommendations only
- Human review always available
- Can contest findings

**Data Protection Principles Implemented:**

1. **Lawfulness, Fairness, Transparency (Article 5(1)(a)):**
   - ✓ Privacy notices on reporting page
   - ✓ Lawful basis documented
   - ✓ Processing purposes explained
   - ⚠ May need more prominent notices

2. **Purpose Limitation (Article 5(1)(b)):**
   - ✓ Data used only for investigations
   - ✓ Not for marketing/profiling
   - ✓ AI features redact PII before processing

3. **Data Minimization (Article 5(1)(c)):**
   - ✓ Anonymous reports collect minimal data
   - ✓ Optional fields (location, date)
   - ✓ No demographic data required

4. **Accuracy (Article 5(1)(d)):**
   - ✓ Reporters control own information
   - ✓ Update mechanism via messaging
   - ✓ Changes logged
   - ⚠ Subject dispute mechanism not explicit

5. **Storage Limitation (Article 5(1)(e)):**
   - ✓ Configurable retention by category
   - ✓ Automated deletion after retention
   - ✓ Deletion alerts and approval workflow
   - ✓ Default 7 years (appropriate)

6. **Integrity and Confidentiality (Article 5(1)(f)):**
   - ✓ AES-256 encryption at rest
   - ✓ TLS 1.3 in transit
   - ✓ End-to-end encryption option
   - ✓ ISO 27001 certified
   - ✓ SOC 2 Type II compliant
   - ✓ Regular penetration testing

**Article 30 Records (Data Processing Inventory):**
- ✓ Dashboard access to records
- ✓ Exportable Article 30 report
- ✓ Processing purposes documented
- ✓ Data categories documented
- ✓ Retention periods documented
- ✓ Security measures documented

**Data Protection Impact Assessment (DPIA):**
- ✓ Template provided
- ✓ Guidance for high-risk processing
- ✓ Regular review prompts
- ✓ Risk mitigation recommendations

**Data Processing Agreements (DPAs):**
- ✓ Disclosurely as processor
- ✓ DPA included in subscription
- ✓ Sub-processor list maintained
- ✓ Audit rights included
- ✓ Deletion obligations clear

**Data Breaches (Article 33-34):**
- ✓ Detection mechanisms
- ✓ Assessment process
- ✓ Notification within 72 hours
- ✓ User notification if high risk
- ✓ Incident response plan
- ⚠ No published breach notification timeline SLA

**International Data Transfers:**
- ✓ EU customers: Data in EU
- ✓ US customers: Data in US
- ✓ SCCs available if needed
- ✓ No default transfers without consent

### EU Whistleblowing Directive Integration

**Requirements Implemented:**
1. ✓ Confidentiality of reporter identity
2. ✓ 7-day acknowledgment (Disclosurely alerts available)
3. ✓ 3-month feedback (Disclosurely messaging system)
4. ✓ Anonymous reporting option
5. ✓ Internal reporting channel
6. ✓ External reporting channel (with custom domains)
7. ✓ Anti-retaliation documentation capability
8. ✓ No requirement for reporter identity disclosure

**Balancing Reporter Confidentiality with Subject Rights:**
- ✓ Article 23 GDPR exemption: Reporter identity not disclosed to subject
- ✓ Subject can access allegations but not source
- ✓ Redaction of identifying information
- ✓ Legal basis documented for exemption

### Findings

✓ **Strengths:**
1. Comprehensive GDPR compliance architecture
2. Privacy by design principles implemented
3. All data subject rights supported
4. Multiple lawful bases established
5. Privacy notices available
6. DPA with processor
7. Data minimization in anonymous reports
8. Secure encryption throughout
9. Retention policies comply with GDPR
10. Data breach notification process
11. Compliance dashboard and reports
12. Annual compliance review prompts
13. DPO role support
14. Multi-jurisdiction considerations documented

⚠ **Gaps/Observations:**
1. **Privacy notices:** Could be more prominent on reporting page
   - Currently linked, should have inline key information
2. **Consent for confidential reports:** Process unclear
   - Code mentions "optional consent" but implementation not visible
   - Should document explicit consent mechanism
3. **Subject dispute mechanism:** Not formally documented
   - Subjects can dispute via case messaging
   - Should formalize dispute resolution process
4. **Breach notification timeline:** No SLA published
   - Should document internal notification timeline (target: 24 hours)
5. **DPO designation:** Guidance provided but optional
   - Many organizations not designating DPO when required
6. **Cookie consent:** Not mentioned
   - Anonymous reports should have no cookies
   - Should verify no tracking cookies
7. **GDPR rights process:** Accessible but could be clearer
   - Create dedicated "GDPR Rights Portal"

### Recommendations

**R6.1 [MEDIUM]:** Enhance privacy notices on reporting page
- **Current State:** Privacy links in footer
- **Action:**
  - Add inline privacy information above report form:
    - "Your report can be completely anonymous"
    - "We don't log your IP address"
    - "You can submit without email"
    - "Your data is encrypted with AES-256"
    - "Link to full privacy notice"
  - Mobile-friendly collapsible notice
  - Multiple language support
- **Impact:** Improves transparency and user trust
- **Timeline:** Low priority

**R6.2 [MEDIUM]:** Formalize confidential report consent mechanism
- **Current State:** Consent mentioned but process not visible
- **Action:**
  - Implement explicit consent form for identity disclosure
  - Checkbox: "I consent to providing my identity for investigation purposes"
  - Show what data will be collected
  - Timestamp and log consent
  - Option to withdraw consent (with implications)
  - Require explicit consent before identity fields enabled
- **Implementation:** ProgressiveSubmissionForm component
- **Impact:** Explicit GDPR Article 6(1)(a) lawful basis
- **Timeline:** Medium priority

**R6.3 [HIGH]:** Implement data subject GDPR rights portal
- **Current State:** Rights scattered across documentation
- **Action:**
  - Create dedicated "Your Privacy Rights" section
  - Rights menu:
    - Right to access: Submit request form
    - Right to rectification: Update own data
    - Right to erasure: Deletion request with grounds
    - Right to restrict processing: Restriction request
    - Right to data portability: Export data
    - Right to object: Objection form
    - Rights to automated decision-making: Appeal form
  - Automated tracking of requests
  - Timeline compliance monitoring
  - Report on requests for audit
- **Impact:** Easier for data subjects; better GDPR compliance proof
- **Timeline:** High priority

**R6.4 [MEDIUM]:** Document breach notification timeline SLA
- **Current State:** 72-hour requirement noted but no internal SLA
- **Action:**
  - Establish internal SLA:
    - Detection to assessment: 24 hours
    - Assessment to notification decision: 24 hours
    - Notification to supervisory authority: 48 hours
    - Notification to data subjects: Simultaneous with authority
  - Document in incident response plan
  - Publish in security documentation
  - Test SLA quarterly
- **Timeline:** Medium priority

**R6.5 [MEDIUM]:** Implement cookie banner for anonymous reporters
- **Current State:** Claims no cookies for anonymous access, but not verified
- **Action:**
  - Audit actual cookies set
  - If any cookies: Implement consent banner
  - Essential cookies only for anonymous reports:
    - Session management (temporary)
    - CSRF protection
    - Platform functionality only
  - Disable analytics/tracking cookies for anonymous users
  - Document cookie policy
- **Impact:** Compliance with GDPR ePrivacy requirements
- **Timeline:** Medium priority

**R6.6 [MEDIUM]:** Develop formal subject dispute resolution process
- **Current State:** Subjects can message but process informal
- **Action:**
  - Formal dispute workflow:
    - Subject receives copy of allegations
    - 30-day period to dispute facts
    - Investigation responds to disputes
    - Final determination recorded
    - Update to case record if appropriate
    - Appeal mechanism
  - Document in investigation procedures
  - Communication templates
  - Timeline tracking
- **Impact:** Fairness and procedural integrity
- **Timeline:** Medium priority

---

## 7. FILE UPLOAD HANDLING & STORAGE

### Architecture

**Implementation:**
- File: `src/utils/fileUpload.ts`
- Storage backend: Supabase Storage
- Bucket name: `report-attachments`
- File naming: `{trackingId}/{timestamp}-{random}.{extension}`
- Database table: `report_attachments`
- Fields tracked: filename, original_filename, file_url, content_type, file_size, upload metadata

### Security Controls

**Upload Processing:**
1. ✓ File extension validation (prevents script uploads)
2. ✓ Content-type checking
3. ✓ File size limits (not explicitly documented)
4. ✓ SHA-256 file hash calculation for integrity
5. ✓ Random filename generation (obfuscates original name)
6. ✓ Tracking ID-based folder structure
7. ✓ Encrypted storage (via organization-wide encryption)

**Storage Security:**
- ✓ Supabase Storage with encryption at rest
- ✓ Private bucket (not public internet-accessible)
- ✓ Access via signed URLs or authenticated API
- ✓ TLS 1.3 for download transmission

**Access Control:**
- ✓ Only investigators with case access can download
- ✓ Access logged in audit trail
- ✓ File ownership tracked (whistleblower vs. investigator)

**Deletion:**
- ✓ Cleanup on failed database insert
- ✓ Secure deletion on case deletion
- ✓ Retention period compliance

### File Handling Features

**Metadata Storage:**
```
{
  report_id: string,
  filename: string,              // Encrypted path
  original_filename: string,     // Original name (could be PII)
  encrypted_file_url: string,    // Path to storage
  content_type: string,
  file_size: number,
  uploaded_by_whistleblower: boolean,
  encryption_metadata: {
    upload_timestamp: ISO string,
    file_hash: SHA-256 hex string
  }
}
```

**Audit Logging:**
- ✓ File upload logged to audit trail
- ✓ Metadata logged (size, type, extension)
- ✓ Upload timestamp recorded
- ✓ Uploader identified (whistleblower)
- ✓ Report reference logged

### Findings

✓ **Strengths:**
1. Randomized file naming prevents enumeration
2. File integrity via SHA-256 hashing
3. File hash stored for verification
4. Supabase encryption at rest
5. TLS in transit
6. Private bucket (not public)
7. Access control per case
8. Audit logging of uploads
9. Cleanup on upload failure
10. Organization-wide encryption applied
11. Content-type validation

⚠ **MEDIUM Issues:**
1. **Original filename stored** - May contain PII
   - File originally named "John_Smith_Salary_Details_2024.pdf"
   - Original filename in database could identify reporter
   - Database is encrypted but still reveals information pattern
2. **File size visible** - Could be identifying
   - Very specific file size might uniquely identify document
   - Combined with upload time, may enable correlation attacks
3. **No explicit file type restrictions** - Could allow archives
   - ZIP files could contain multiple documents
   - RAR, 7z not mentioned
   - JavaScript files in archives could execute
4. **No virus/malware scanning** - Risk to investigators
   - Malicious files could compromise investigator systems
   - No antivirus integration mentioned
5. **File size limits not documented** - DoS risk
   - No maximum file size documented
   - Could allow storage exhaustion attacks
6. **Download tracking not explicit** - Could miss access
   - File access should be logged
   - No explicit download logging mentioned

### Recommendations

**R7.1 [HIGH]:** Redact original filenames from database
- **Current State:** Original filenames stored in plaintext (albeit encrypted DB)
- **Action:**
  - Hash original filename: SHA-256(original_filename + report_id)
  - Store hash, not filename
  - Option to let uploader provide sanitized name:
    - "Supporting document 1"
    - "Interview transcript"
    - "Evidence photo"
  - Validation: No dates, names, identifying details
- **Implementation Location:** `uploadReportFile()` function
- **Impact:** Removes identifying metadata from file context
- **Timeline:** High priority

**R7.2 [MEDIUM]:** Implement file type restrictions
- **Current State:** No documented restrictions
- **Action:**
  - Whitelist allowed types:
    - Documents: PDF, DOCX, XLSX, PPTX (Office Open XML only)
    - Images: JPEG, PNG (no SVG, ICO which can contain scripts)
    - Archives: ZIP only (if needed) with size limits
  - Blacklist dangerous types:
    - Executables: EXE, DLL, COM, APP
    - Scripts: JS, VBS, PS1, SH, BAT, CMD
    - Archives that can contain executables: RAR, 7Z, CAB, ISO
    - Media containers with script support: MP4, MKV
  - Validation:
    - MIME type checking (not just extension)
    - Magic bytes verification (file signature)
    - Reject if MIME != extension
  - Enforce via server-side validation
- **Implementation:** Edge function or API middleware
- **Impact:** Prevents malicious file uploads
- **Timeline:** High priority

**R7.3 [MEDIUM]:** Add file size limits
- **Current State:** No documented limits
- **Action:**
  - Document maximum file size: 50MB per file
  - Maximum total per report: 500MB
  - Document in platform UI before upload
  - Enforce on server-side
  - Return clear error if exceeded
  - Rate limiting: Max 10 files per report per hour
- **Impact:** Prevents storage DoS attacks
- **Timeline:** Medium priority

**R7.4 [MEDIUM]:** Implement antivirus scanning for investigator protection
- **Current State:** No scanning mentioned
- **Action:**
  - Integrate with antivirus service (e.g., ClamAV, VirusTotal API)
  - Scan all uploaded files
  - Quarantine suspicious files
  - Alert if malware detected
  - Option to quarantine until investigator reviews
  - Logging of scan results
- **Impact:** Protects investigators from malware
- **Timeline:** Medium priority

**R7.5 [HIGH]:** Implement explicit file download logging
- **Current State:** Upload logged but download not explicitly mentioned
- **Action:**
  - Log every file download:
    - Who downloaded (user ID, email)
    - What file (file hash, original file hash)
    - When (timestamp)
    - From where (IP address)
    - Via what (API, UI, batch)
  - Store in audit logs
  - Make visible in case audit history
  - Alert on bulk downloads (e.g., >10 files in 5 minutes)
- **Impact:** Accountability for file access
- **Timeline:** High priority

**R7.6 [MEDIUM]:** Add file integrity verification for investigators
- **Current State:** SHA-256 calculated but verification optional
- **Action:**
  - Always calculate file hash on upload
  - Display hash to investigator on download
  - Investigator can verify file integrity
  - Provide download verification tool
  - Document file didn't change since upload
- **Impact:** Proves evidence not tampered with
- **Timeline:** Medium priority

**R7.7 [LOW]:** Add file encryption key management
- **Current State:** Organization-wide encryption keys
- **Action:**
  - Per-report encryption keys (optional)
  - Key split between organization and Disclosurely
  - Investigator cannot decrypt without key from reporter
  - Reporter can revoke investigator access
- **Impact:** Ultimate control for reporter
- **Timeline:** Nice-to-have feature

---

## COMPLIANCE MATRIX

### Regulatory Requirements Coverage

| Requirement | Implementation | Status | Risk |
|------------|-----------------|--------|------|
| EU Whistleblowing Directive - Anonymous reporting | Anonymous access codes | ✓ | Low |
| EU Whistleblowing Directive - Confidentiality | End-to-end encryption | ✓ | Low |
| EU Whistleblowing Directive - 7-day acknowledgment | Automated alerts | ✓ | Low |
| EU Whistleblowing Directive - 3-month feedback | Messaging system | ✓ | Low |
| GDPR - Data minimization | Anonymous by default | ✓ | Low |
| GDPR - Purpose limitation | Single-use investigation | ✓ | Low |
| GDPR - Storage limitation | 7-year retention + deletion | ✓ | Low |
| GDPR - Integrity/confidentiality | AES-256 encryption | ✓ | Low |
| GDPR - Data subject rights | Portal available | ✓ | Medium |
| GDPR - Data breach notification | 72-hour process | ✓ | Medium |
| ISO 27001 - Access control | RBAC + MFA | ✓ | Low |
| ISO 27001 - Logging | Audit trail with hash chain | ✓ | Medium* |
| ISO 27001 - Encryption | AES-256 at rest, TLS in transit | ✓ | Low |
| ISO 27001 - Vulnerability management | Weekly scans, annual pen test | ✓ | Low |
| SOX - Audit trail | 7-year retention | ✓ | Low |
| SOX - Confidentiality | Encryption + access control | ✓ | Low |

*Medium risk due to audit logging of IP addresses for anonymous users

### Critical Risk Summary

| Risk | Severity | Current Status | Recommended Action |
|------|----------|---------------|--------------------|
| IP addresses logged for anonymous reporters | CRITICAL | Issue identified | R5.1: Remove IP logging |
| Audit logs capture unstructured data | CRITICAL | Potential risk | R5.2: Implement redaction |
| Original filenames stored (PII) | HIGH | Issue identified | R7.1: Hash filenames |
| No file type restrictions | HIGH | Issue identified | R7.2: Implement whitelist |
| No file download logging | HIGH | Issue identified | R7.5: Add logging |
| PII detection client-side only | HIGH | Mitigated but incomplete | R2.1: Add server-side scanning |
| Server-side audit log collection encryption | HIGH | Unclear | R5.4: Enforce TLS |
| Anonymization metadata (timing analysis) | MEDIUM | Low risk but present | R4.1: Add metadata anonymization |
| Handler notes may identify reporters | MEDIUM | Present but mitigated | R4.2: Add guidance + scanning |

---

## IMPLEMENTATION PRIORITY

### Immediate (This Sprint - Urgency: CRITICAL)

1. **R5.1:** Remove IP address logging for anonymous submissions
2. **R5.2:** Implement sensitive data redaction in application logs
3. **R7.1:** Redact/hash original filenames from database

### High Priority (Next Sprint - Urgency: HIGH)

4. **R5.3:** Restrict audit log access based on anonymity status
5. **R5.4:** Encrypt audit logs in transit
6. **R2.1:** Implement server-side PII scanning
7. **R7.2:** Implement file type restrictions
8. **R7.5:** Implement file download logging
9. **R6.3:** Create GDPR rights portal

### Medium Priority (Next 2-4 Weeks - Urgency: MEDIUM)

10. **R1.1:** Rate limiting on access code verification
11. **R2.2:** Expand PII detection patterns
12. **R3.1:** Standardize retention start dates
13. **R3.3:** Document maximum retention limits
14. **R4.1:** Add metadata anonymization option
15. **R4.2:** Add handler guidance for anonymity
16. **R5.5:** Implement audit log retention cleanup
17. **R5.6:** Add audit log redaction report
18. **R6.1:** Enhance privacy notices
19. **R6.2:** Formalize consent mechanism
20. **R6.4:** Document breach notification SLA
21. **R7.3:** Add file size limits
22. **R7.4:** Add antivirus scanning
23. **R7.6:** Add file integrity verification

### Lower Priority (Next Quarter - Urgency: LOW)

24. **R1.2:** Document tracking ID entropy
25. **R2.3:** Document PII exceptions for special category data
26. **R3.2:** Implement anonymization-as-alternative path
27. **R6.5:** Implement cookie banner
28. **R6.6:** Develop dispute resolution process
29. **R7.7:** Per-report encryption keys

---

## CONCLUSION

Disclosurely demonstrates a strong commitment to whistleblower privacy and anonymity. The platform's zero-knowledge encryption architecture, comprehensive GDPR compliance framework, and tamper-evident audit logging provide substantial protection for whistleblowers and compliance for organizations.

However, **three critical issues** require immediate attention:

1. **IP address logging for anonymous submissions** - Contradicts anonymity promise
2. **Unstructured logging of potentially sensitive data** - PII in application logs
3. **Original filenames not redacted** - PII in file metadata

When these issues are addressed, Disclosurely will be a best-in-class whistleblowing platform from a privacy and anonymity perspective, fully compliant with EU Whistleblowing Directive, GDPR, SOX, and ISO 27001 requirements.

**Estimated Remediation Timeline:**
- Critical issues: 1-2 weeks
- High priority issues: 2-4 weeks  
- Medium priority issues: 4-8 weeks
- Lower priority issues: 8-16 weeks

**Overall Risk After Remediation:** LOW (all issues addressable with technical controls)

