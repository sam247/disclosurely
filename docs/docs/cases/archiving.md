---
title: Case Archiving - Disclosurely Data Retention Guide
description: Manage case archiving, data retention, and secure deletion. Learn retention policies, legal holds, GDPR compliance, and best practices for long-term case management.
head:
  - - meta
    - property: og:title
      content: Case Archiving & Data Retention - Disclosurely
  - - meta
    - property: og:description
      content: Manage case archiving, data retention, and secure deletion. Learn retention policies, legal holds, GDPR compliance, and best practices for long-term case management.
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:image
      content: https://disclosurely.com/docs/ogimage.png
  - - meta
    - name: twitter:card
      content: summary_large_image
  - - meta
    - name: twitter:title
      content: Case Archiving - Disclosurely
  - - meta
    - name: twitter:description
      content: Manage case archiving, data retention, and secure deletion. Learn retention policies, legal holds, GDPR compliance, and best practices for long-term case management.
  - - meta
    - name: twitter:image
      content: https://disclosurely.com/docs/ogimage.png
---

# Case Archiving

Long-term case management, data retention, and secure disposal practices.

## Overview

Proper archiving ensures:

- **Compliance**: Meet regulatory retention requirements
- **Defensibility**: Preserve evidence for potential litigation
- **Efficiency**: Keep active cases list manageable
- **Security**: Protect sensitive historical data
- **Learning**: Enable analysis of patterns over time

## Archive vs. Closed vs. Deleted

### Closed Cases

**Status**: Resolved/Closed
- Investigation complete
- Outcome communicated
- Actions implemented
- Still in active system
- Fully searchable
- Included in reports
- Can be reopened easily

**When**: Immediately after resolution

### Archived Cases

**Status**: Archived
- Removed from active case list
- Moved to archive storage
- Still accessible but requires extra step
- Preserved according to retention policy
- Not in standard reports
- Harder to reopen

**When**: After retention period begins (typically 6-12 months after resolution)

### Deleted Cases

**Status**: Permanently deleted
- Removed from system entirely
- Cannot be recovered
- Evidence destroyed
- Only after retention period expires
- Requires approval
- Audit log remains

**When**: After retention period expires (typically 7+ years)

## Retention Requirements

### Legal & Regulatory Minimums

**Employment Law**:
- UK: 6 years after case closure
- EU: Varies by country (typically 5-7 years)
- US: Varies by state and federal law (typically 3-7 years)

**Financial Services**:
- FCA (UK): 7 years minimum
- SEC (US): 7 years minimum
- MiFID II (EU): 7 years minimum

**Healthcare**:
- Medical records related: 7+ years
- HIPAA requirements: 6 years minimum

**Education**:
- Student-related: 6 years typical
- Employee-related: 6 years typical

**General Business**:
- Contract disputes: 6-7 years
- Negligence claims: 6-7 years
- Fraud cases: Indefinite (may never delete)

### Industry Best Practices

**Recommended Retention**:
- **Minor policy violations**: 5-7 years
- **Serious misconduct**: 10-15 years
- **Termination cases**: 10-15 years
- **Legal settlements**: Indefinite
- **Criminal matters**: Indefinite
- **Unsubstantiated allegations**: Varies (3-7 years common)
- **Withdrawn reports**: Shorter period (1-3 years common)

### Setting Retention Policies

**In Disclosurely**:

1. **Navigate to Settings**
   - Dashboard > [Organization Settings](/docs/admin/organization-settings)
   - "Data Retention & Archiving"

2. **Set Default Retention**
   - All cases: Default period (e.g., 7 years)
   - Calculated from resolution date

3. **Category-Specific Retention**
   - Financial misconduct: 10 years
   - Harassment: 15 years
   - Safety: 10 years
   - Minor violations: 5 years
   - Custom categories: Set individually

4. **Outcome-Specific Retention**
   - Substantiated: Longer retention
   - Unsubstantiated: Shorter retention
   - Withdrawn: Shortest retention

5. **Legal Holds**
   - Override retention for litigation
   - Preserve indefinitely
   - Remove hold when case settles

**Automatic Calculation**:
- Resolution date + retention period = deletion eligibility date
- System calculates automatically
- Alerts before deletion
- Requires approval to delete

## Archiving Process

### Automatic Archiving

**Configure Automatic Archive**:

1. **Set Archive Trigger**
   - X months after resolution
   - Typical: 12 months
   - Reduces active case clutter

2. **Archive Actions**
   - Move to archive storage
   - Remove from default views
   - Maintain full searchability
   - Preserve all evidence
   - Keep audit trail

3. **Notification**
   - Alert case owner before archiving
   - Allow opt-out if still active
   - Log archiving event

**Benefits**:
- Automatic management
- Consistent approach
- Reduced manual work
- Maintains compliance

### Manual Archiving

**Archive Individual Case**:

1. **Open Case**
   - Navigate to resolved case
   - Verify all actions complete
   - Check no pending follow-up

2. **Click Archive**
   - Button on case detail page
   - Add reason for archiving
   - Confirm action

3. **Case Archived**
   - Removed from active list
   - Moved to archive section
   - Notification sent to team
   - Logged in audit trail

**Bulk Archiving**:

1. **Filter Cases**
   - Resolved cases
   - Older than X months
   - Specific category
   - Specific outcome

2. **Select Cases**
   - Checkboxes for bulk selection
   - Up to 100 at once

3. **Bulk Action**
   - "Archive Selected Cases"
   - Add bulk archive note
   - Confirm action
   - Processing notification

**Use Cases**:
- Year-end cleanup
- Department reorganization
- System migration
- Audit preparation

## Accessing Archived Cases

### Finding Archived Cases

**Via Archive Section**:

1. **Navigate to Archives**
   - Dashboard > Cases > Archived Cases
   - Separate from active cases

2. **Search & Filter**
   - Same filters as active cases
   - Date range
   - Category
   - Outcome
   - Investigator
   - Keywords

3. **View Case**
   - Click to open
   - Full case details available
   - All evidence accessible
   - Read-only by default

**Via Search**:
- Global search includes archived cases
- Check "Include Archived" box
- Results show archive status
- Can filter results to archived only

### Reopening Archived Cases

**When to Reopen**:
- New information emerges
- Related new complaint
- Appeals or legal proceedings
- Follow-up investigation needed
- Errors discovered

**How to Reopen**:

1. **Open Archived Case**
   - Find case in archives
   - Click to view details

2. **Request Reopen**
   - "Reopen Case" button
   - Add reason for reopening
   - Specify expected duration

3. **Approval**
   - Admin or Org Admin approves
   - Case moved back to active
   - Status changed to "Under Review"
   - Notifications sent

4. **Investigation Continues**
   - All history preserved
   - New notes added
   - Additional evidence uploaded
   - Original timeline visible

## Data Deletion

### Approaching Deletion Date

**System Alerts**:
- 90 days before: Warning email
- 30 days before: Second warning
- 7 days before: Final warning
- Deletion date: Requires approval

**Review Before Deletion**:
- Is retention period correct?
- Any litigation risk?
- Historical significance?
- Related pending cases?
- Regulatory inquiries?

**Extend Retention**:
- Click "Extend Retention"
- Select new period
- Add reason
- Approve extension
- New deletion date calculated

### Deletion Process

**Approval Required**:
- Organization Administrator
- Compliance Officer
- Data Protection Officer
- Cannot be delegated

**Deletion Steps**:

1. **Review Deletion Queue**
   - Dashboard > Data Management > Pending Deletions
   - List of cases eligible for deletion
   - Review each carefully

2. **Bulk or Individual**
   - Approve deletions individually
   - Or approve batch
   - Cannot be undone

3. **Confirm Deletion**
   - Final confirmation prompt
   - Acknowledges permanent deletion
   - Documents compliance with retention policy

4. **Deletion Executed**
   - All case data deleted
   - All evidence deleted
   - Encryption keys destroyed
   - Audit log entry created (preserved)
   - Certificate of deletion generated

**What Gets Deleted**:
- Report content
- All messages
- All evidence files
- Case notes
- Investigation reports
- Personal data
- All associated records

**What's Preserved**:
- Audit log (anonymized)
- Aggregate statistics
- Policy compliance metrics
- Retention certificate

### Secure Deletion

**Deletion Method**:
- Military-grade data destruction
- Multiple overwrite passes
- Encryption key destruction
- Database record removal
- Backup purging
- Compliance with GDPR "right to erasure"

**Verification**:
- Deletion completion check
- Backup verification
- Certificate generation
- Audit log entry
- Annual deletion report

## Legal Holds

### What Is a Legal Hold?

**Purpose**:
- Preserve evidence for litigation
- Prevent destruction during proceedings
- Comply with discovery obligations
- Avoid spoliation sanctions

**Effect**:
- Overrides retention policy
- Prevents deletion
- Prevents archiving (optional)
- Flags case prominently
- Requires legal team approval to remove

### Implementing Legal Hold

**When to Use**:
- Litigation filed or anticipated
- Regulatory investigation
- Subpoena or court order
- Internal investigation into legal matter
- Employment tribunal proceedings

**How to Implement**:

1. **Open Case**
   - Navigate to relevant case
   - Click "Legal Hold" button

2. **Complete Hold Form**
   - Matter name/number
   - Reason for hold
   - Authorizing attorney/counsel
   - Related cases to hold
   - Expected duration

3. **Activate Hold**
   - Admin approval required
   - Hold icon appears on case
   - Deletion disabled
   - All users notified
   - Audit log entry

**Bulk Legal Holds**:
- Hold multiple related cases
- Filter by criteria
- Apply hold to all
- Document scope clearly

### Managing Legal Holds

**Monitoring**:
- Dashboard shows all held cases
- Duration of hold
- Responsible attorney
- Hold status

**Notifications**:
- Annual review reminders
- Hold extended notifications
- Hold released notifications

**Releasing Hold**:
- Legal team approval required
- Document reason for release
- Normal retention policy resumes
- Audit log entry created

## Retention Reports

### Compliance Reports

**Generate Reports**:
- Dashboard > Reports > Data Retention
- Date range
- Case categories
- Retention status

**Report Contents**:
- Cases archived during period
- Cases deleted during period
- Cases under legal hold
- Upcoming deletions
- Retention policy compliance
- Exceptions and extensions

**Use For**:
- Audit preparation
- Board reporting
- Compliance documentation
- Policy review
- Capacity planning

### Deletion Certificates

**Auto-Generated**:
- After each deletion
- Lists cases deleted
- Deletion method
- Date and time
- Approver name
- Compliance attestation

**Retention of Certificates**:
- Keep indefinitely
- Proves compliance
- Defensible in litigation
- Required for some audits

## Best Practices

### Regular Review

**Quarterly Reviews**:
- Upcoming deletions
- Legal hold status
- Retention policy appropriateness
- Archive size and costs
- Access patterns

**Annual Reviews**:
- Retention policy update
- Regulatory changes
- Storage optimization
- Deletion certificate review
- Audit preparation

### Document Exceptions

**Every Time You**:
- Extend retention beyond policy
- Delete before retention period
- Apply legal hold
- Release legal hold
- Reopen archived case

**Document**:
- Why exception needed
- Who approved
- Supporting rationale
- Related cases
- Follow-up required

### Maintain Audit Trail

**Audit Log Captures**:
- All archiving actions
- All deletion approvals
- Legal hold implementations
- Retention extensions
- Case reopenings
- Access to archived cases

**Preservation**:
- [Audit logs](/docs/compliance/audit-trail) never deleted
- Even after case deleted
- Anonymized if necessary
- Meet regulatory requirements
- Available for investigations

### Balance Retention and Privacy

**Longer Isn't Always Better**:
- Privacy laws favor deletion
- [GDPR "right to erasure"](/docs/compliance/gdpr)
- Storage costs increase
- Breach exposure grows
- Discovery burdens expand

**Minimum Necessary**:
- Retain only as long as needed
- Delete when legally permissible
- Consider privacy rights
- Balance business needs
- Document decisions

## Troubleshooting

### Cannot Find Archived Case

**Check**:
- Include archived in search
- Correct date range
- May have been deleted
- Check audit log
- Verify access permissions

### Case Auto-Archived Too Soon

**Fix**:
- Reopen case
- Adjust retention settings
- Review archive triggers
- Update auto-archive rules

### Cannot Delete Case Past Retention

**Verify**:
- Legal hold in place?
- Retention calculation correct?
- Administrator permissions?
- Related cases pending?
- System error? Contact support

### Regulator Requests Deleted Case

**If Properly Deleted**:
- Provide deletion certificate
- Demonstrate retention policy
- Show regulatory compliance
- Provide audit log (anonymized)
- Explain data destruction process

**Lessons Learned**:
- Review retention adequacy
- Consider longer retention
- Implement legal hold earlier
- Better regulatory communication

---

**Related:**
- [Case Resolution](/docs/cases/resolution)
- [Compliance & Audit Trail](/docs/compliance/audit-trail)
- [Data Retention](/docs/compliance/retention)
- [GDPR Compliance](/docs/compliance/gdpr)
- [Organization Settings](/docs/admin/organization-settings)
