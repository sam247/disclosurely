---
title: GDPR Data Subject Requests - Privacy Rights Management | Disclosurely
description: Handle GDPR data subject access requests, data erasure requests, data portability, and rectification through automated workflows with compliance tracking.
head:
  - - meta
    - property: og:title
      content: GDPR Data Subject Requests - Disclosurely
  - - meta
    - property: og:description
      content: Handle GDPR data subject access requests, data erasure requests, data portability, and rectification through automated workflows with compliance tracking.
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:image
      content: https://docs.disclosurely.com/ogimage.png
  - - meta
    - name: twitter:card
      content: summary_large_image
  - - meta
    - name: twitter:title
      content: GDPR Data Subject Requests - Disclosurely
  - - meta
    - name: twitter:description
      content: Handle GDPR data subject access requests, data erasure requests, data portability, and rectification through automated workflows with compliance tracking.
  - - meta
    - name: twitter:image
      content: https://docs.disclosurely.com/ogimage.png
---

# GDPR Data Subject Requests

Manage GDPR data subject rights efficiently with automated request workflows, compliance tracking, and comprehensive audit trails.

## Overview

Under the General Data Protection Regulation (GDPR), individuals have specific rights regarding their personal data. Disclosurely provides comprehensive tools to handle these requests while maintaining compliance and protecting whistleblower anonymity.

**Data Subject Rights:**
- **Right to Access** (Article 15) - Obtain copy of personal data
- **Right to Erasure** (Article 17) - "Right to be Forgotten"
- **Right to Rectification** (Article 16) - Correct inaccurate data
- **Right to Data Portability** (Article 20) - Receive data in machine-readable format
- **Right to Restriction** (Article 18) - Limit processing
- **Right to Object** (Article 21) - Object to processing

**Access:** Dashboard > Compliance > GDPR Requests

**Learn More:** [GDPR Compliance](/compliance/gdpr)

## Types of GDPR Requests

### Data Access Requests (SAR)

**Subject Access Request (SAR):**

Individuals can request a copy of all personal data the organization holds about them.

**What Must Be Provided:**
- All personal data processed
- Purposes of processing
- Categories of data
- Recipients of data
- Retention periods
- Source of data (if not from data subject)
- Existence of automated decision-making

**Timeline:** 1 month (extendable to 3 months for complex requests)

**How Disclosurely Handles SARs:**

1. **Request Submission:**
   - Data subject submits request via portal or email
   - Identity verification required (prevent fraudulent requests)
   - Request logged with timestamp

2. **Automated Data Collection:**
   - System searches all databases for personal data
   - Compiles user account information
   - Gathers submitted reports (if applicable)
   - Collects communication history
   - Retrieves access logs

3. **Review & Redaction:**
   - Admins review compiled data
   - Redact third-party personal data (protect others' privacy)
   - Remove legally privileged information
   - Ensure no investigative compromise (for active cases)

4. **Response Delivery:**
   - Data packaged in machine-readable format (JSON, CSV)
   - PDF summary for human readability
   - Secure encrypted delivery
   - Confirmation of delivery logged

**Cost:** Free for first request; reasonable fee for excessive/repetitive requests

### Data Erasure Requests

**Right to Be Forgotten:**

Individuals can request deletion of their personal data when:
- No longer necessary for original purpose
- Consent withdrawn (where consent was basis)
- Processing unlawful
- Legal obligation to erase
- Data subject objects and no overriding legitimate grounds

**Exceptions (Cannot Erase):**
- Legal obligation requires retention
- Public interest (archiving, research)
- Legal claims (defense or establishment)
- Freedom of expression
- Active investigation ongoing

**Whistleblowing Context:**

⚠️ **Special Considerations:**
- **Active Cases:** Cannot erase during investigation (legal obligation)
- **Retention Periods:** Must retain per [SOX](/compliance/sox), [EU Directive](/compliance/eu-directive)
- **Anonymous Reports:** Cannot erase what cannot be linked to individual
- **Legal Holds:** Cannot erase data under legal hold

**How Disclosurely Handles Erasure:**

1. **Request Review:**
   - Assess if exception applies
   - Check active investigations
   - Verify retention requirements
   - Evaluate legal obligations

2. **Approval Workflow:**
   - Admin reviews request
   - Legal review if needed
   - Approve or reject with reason
   - Document decision

3. **Erasure Execution:**
   - If approved: Permanent deletion
   - Backup purging scheduled
   - [Audit trail](/features/audit-trail) entry (irrevocable)
   - Confirmation sent to data subject

4. **Partial Erasure:**
   - Some data retained (legal requirements)
   - Explain to data subject what remains and why
   - Document justification

**Timeline:** 1 month from verification

### Data Rectification Requests

**Right to Correction:**

Individuals can request correction of inaccurate or incomplete personal data.

**Scenarios:**
- Name misspelled in account
- Incorrect email address
- Outdated contact information
- Inaccurate user profile details

**Process:**
1. Data subject identifies inaccuracy
2. Provides correct information
3. Admin verifies and updates
4. Confirmation sent
5. Change logged in [audit trail](/features/audit-trail)

**Timeline:** 1 month

**Not Applicable To:**
- Report content (whistleblower allegations are their statement)
- Investigation findings (factual record)
- Historical audit logs (immutable)

### Data Portability Requests

**Right to Receive Data:**

Data subjects can request their data in structured, commonly used, machine-readable format.

**What's Included:**
- User account data
- Submitted reports metadata
- Communication logs
- User preferences

**Formats Provided:**
- JSON (complete structured data)
- CSV (tabular data)
- XML (structured hierarchical data)

**Transmission:**
- Direct download (encrypted ZIP)
- Secure email delivery
- Transfer to another controller (if requested)

**Timeline:** 1 month

### Restriction of Processing

**Right to Limit Processing:**

Data subjects can request restriction while:
- Accuracy is being verified
- Processing is unlawful (but they don't want erasure)
- Organization no longer needs data (but subject needs it for legal claims)
- Objection is being verified

**How Restriction Works:**
- Data marked as "Restricted" in system
- Cannot be processed except:
  - Storage
  - Legal claims
  - Protection of others' rights
  - Public interest
- Restriction lifted when grounds no longer apply

**Timeline:** 1 month

## Request Management Workflow

### Submitting GDPR Requests

**For Data Subjects:**

**How to Submit:**
1. Navigate to organization's GDPR request portal
   ```
   https://yourorg.disclosurely.com/gdpr
   ```
2. Select request type (Access, Erasure, Rectification, etc.)
3. Provide identity verification:
   - Email address associated with account
   - Additional verification (upload ID if necessary)
   - Answer security questions (if configured)
4. Describe request clearly
5. Submit request
6. Receive confirmation email with request ID

**Request Tracking:**
- Use request ID to check status
- Receive email updates on progress
- Timeline displayed (30-day countdown)

### Administrator Request Handling

**GDPR Request Dashboard:**

**Access:** Dashboard > Compliance > GDPR Requests

**Dashboard Features:**
- List of all requests
- Status of each request (Pending, In Progress, Approved, Rejected, Completed)
- Days remaining (compliance countdown)
- Request type and date
- Assignee
- Actions available

**Request Processing:**

**1. Request Received:**
- Automatic notification to admin
- Request appears in dashboard
- Timer starts (30 days)

**2. Identity Verification:**
- Review verification documents
- Confirm data subject identity
- Approve or request additional verification
- Prevent fraudulent requests

**3. Data Collection (Access Requests):**
- System auto-generates data package
- Review for completeness
- Redact third-party PII
- Review legally privileged information

**4. Legal Review (Erasure Requests):**
- Check active investigations
- Verify retention requirements
- Assess exception applicability
- Document legal basis for retention or erasure

**5. Approval Decision:**
- Approve, reject, or partially approve
- Provide clear reasoning if rejected
- Document decision in [audit trail](/features/audit-trail)

**6. Execution:**
- Fulfill access request (send data package)
- Execute erasure (permanent deletion)
- Make corrections (rectification)
- Apply restrictions
- Send confirmation to data subject

**7. Completion:**
- Mark request as completed
- Archive request records (7 years for compliance)
- Update compliance reporting

## Compliance & Timelines

### Response Deadlines

**Standard Timeline:**
- **1 month** from receipt of request
- Can extend to **3 months** if complex or numerous requests
- Must inform data subject of extension within 1 month

**Complexity Factors:**
- Large volume of data
- Multiple systems involved
- Legal review required
- Third-party data redaction needed
- Cross-border data transfer

**Countdown Tracking:**
- Automated deadline calculation
- Email alerts at 7 days, 3 days, 1 day remaining
- SLA breach alerts if deadline missed
- Executive escalation for overdue requests

### Compliance Requirements

**GDPR Obligations:**

✅ **Respond Within Timeframe:**
- 30 days standard (or 90 if extended)
- Inform data subject of extension

✅ **Provide Information:**
- Clear, concise language
- Free of charge (first request)
- Electronic format preferred

✅ **Verify Identity:**
- Prevent fraudulent requests
- Reasonable verification measures
- Additional information if doubts

✅ **Reject Appropriately:**
- Explain reason for rejection
- Inform of complaint rights
- Document decision thoroughly

✅ **Maintain Records:**
- [Audit trail](/features/audit-trail) of all requests
- Decisions and justifications
- Communications with data subject
- Compliance reporting

### Penalties for Non-Compliance

**GDPR Fines:**
- Up to €20 million or 4% of global annual turnover (whichever is higher)
- For violations of data subject rights

**Mitigation:**
- Automated tracking ensures deadline compliance
- Clear workflows prevent oversights
- [Audit trail](/features/audit-trail) demonstrates due diligence
- Regular compliance reporting

**Learn More:** [GDPR Compliance](/compliance/gdpr)

## Automation & Features

### Automated Data Collection

**For Access Requests:**

System automatically gathers:
- User account details (name, email, role)
- Submitted reports (as reporter, if applicable)
- Case assignments (as investigator)
- Communication logs (messages sent/received)
- Login history and session data
- Notification preferences
- Audit trail of user's actions
- Analytics data (anonymized)

**Export Format:**
- JSON file (complete data structure)
- CSV files (tabular data by category)
- PDF summary (human-readable)
- Metadata file (data dictionary)

### Auto-Approval for Erasure

**Configurable Auto-Approval:**

For low-risk erasure requests, enable auto-approval:

**Conditions for Auto-Approval:**
- User has no active cases (as reporter or investigator)
- No retention obligations apply
- No legal holds on account
- Account inactive >90 days
- No pending investigations involving user

**Benefits:**
- Faster processing (instant vs. 30 days)
- Reduced admin workload
- Improved data subject satisfaction
- Compliance automation

**Safety Measures:**
- Cannot auto-approve if any exception applies
- Manual review queue for edge cases
- [Audit trail](/features/audit-trail) logs all auto-approvals
- Can disable auto-approval organization-wide

### Third-Party Data Protection

**Automatic Redaction:**

When providing data subject access:
- Other individuals' names redacted
- Third-party email addresses removed
- Witness identities protected
- Reporter anonymity preserved (if mentioned)

**Redaction Preview:**
- Admin reviews before sending
- Can manually adjust redactions
- Ensures no privacy violations

### Integration with Retention Policies

**Coordinated Deletion:**

GDPR erasure requests integrate with [data retention policies](/compliance/retention):

**Retention-First Approach:**
- Check retention schedule before erasure
- Retain if legally required
- Explain retention to data subject
- Schedule erasure when retention period ends

**Retention Override:**
- GDPR erasure can override standard retention
- Requires legal justification
- Document override reasoning
- [Audit trail](/features/audit-trail) records override

## Reporting & Analytics

### GDPR Request Dashboard

**Metrics Tracked:**
- Total requests received (by type)
- Average response time
- Requests pending (by deadline proximity)
- Approval/rejection rate
- Compliance percentage (met 30-day deadline)
- Requests by data subject (detect excessive requests)

**Visualizations:**
- Request volume over time (trend)
- Request type distribution (pie chart)
- Response time distribution (histogram)
- Compliance rate (percentage)

**Access:** Dashboard > Analytics > GDPR

**Learn More:** [Compliance Analytics](/analytics/compliance-analytics)

### Compliance Reports

**Pre-Built Reports:**

**1. GDPR Request Summary**
- All requests within period
- Response times
- Outcomes (approved, rejected, partially approved)
- Outstanding requests

**2. Data Subject Access Log**
- Who accessed what data
- When and why
- Export activity
- Compliance with access requests

**3. Erasure Compliance Report**
- Erasure requests handled
- Retention justifications
- Pending erasures
- Verification of deletions

**4. DPO Report**
- For Data Protection Officer
- Comprehensive GDPR activity
- Risk indicators
- Recommendations

**Export Formats:**
- PDF (executive summary)
- CSV (detailed data)
- Excel (analysis-ready)

**Scheduled Delivery:**
- Monthly to DPO
- Quarterly to audit committee
- Annually for regulator (if requested)

## Best Practices

### Handling Requests Efficiently

✅ **Verify Identity Thoroughly:**
- Prevents fraudulent requests
- Protects legitimate data subjects
- Document verification method

✅ **Respond Promptly:**
- Don't wait until deadline
- Acknowledge receipt immediately
- Set internal deadline (25 days for 30-day buffer)

✅ **Communicate Clearly:**
- Use plain language
- Explain decisions
- Provide timeline expectations
- Offer assistance if needed

✅ **Document Everything:**
- Every decision logged
- Reasons for rejection recorded
- Extensions justified
- [Audit trail](/features/audit-trail) complete

### Balancing Privacy and Investigation

✅ **Active Investigations:**
- Cannot erase data needed for investigation
- Explain legal obligation to data subject
- Offer partial erasure (non-essential data)
- Schedule full erasure post-investigation

✅ **Whistleblower Protection:**
- Never reveal whistleblower identity
- Redact from access requests
- Protect during erasure (can't erase reporter's case)

✅ **Third-Party Rights:**
- Redact others' personal data
- Balance multiple privacy rights
- Seek legal advice if conflict

### Regular Compliance Audits

✅ **Monthly Reviews:**
- Check all requests processed timely
- Review rejection reasons
- Update workflows if needed

✅ **Quarterly Audits:**
- Comprehensive GDPR compliance check
- Test automated processes
- Review redaction effectiveness

✅ **Annual Certification:**
- Full GDPR compliance audit
- External auditor review
- Update privacy policies
- Train staff on procedures

## Related Pages

- [GDPR Compliance](/compliance/gdpr) - Comprehensive GDPR guide
- [Data Retention](/compliance/retention) - Retention policies
- [Audit Trail](/features/audit-trail) - Request logging
- [Security Overview](/security/overview) - Data protection
- [Access Control](/security/access-control) - Who can access data
- [Compliance Analytics](/analytics/compliance-analytics) - Reporting

## Support

Questions about GDPR requests?
- Email: support@disclosurely.com
- [Contact Support](/support/contact)
- [GDPR Guide](/compliance/gdpr)
- DPO Contact: dpo@disclosurely.com
