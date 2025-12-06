---
title: Audit Trail - Immutable Activity Logging | Disclosurely
description: Comprehensive audit trail with cryptographic chain verification, tamper-evident logging, compliance reporting, and complete activity history for whistleblowing cases.
head:
  - - meta
    - property: og:title
      content: Audit Trail & Activity Logging - Disclosurely
  - - meta
    - property: og:description
      content: Comprehensive audit trail with cryptographic chain verification, tamper-evident logging, compliance reporting, and complete activity history for whistleblowing cases.
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
      content: Audit Trail - Disclosurely
  - - meta
    - name: twitter:description
      content: Comprehensive audit trail with cryptographic chain verification, tamper-evident logging, compliance reporting, and complete activity history for whistleblowing cases.
  - - meta
    - name: twitter:image
      content: https://disclosurely.com/docs/ogimage.png
---

# Audit Trail

Maintain a complete, tamper-evident record of all system activities with cryptographically secured audit logging for compliance, security, and accountability.

## Overview

Disclosurely's audit trail provides an immutable, chronological record of every action taken within the platform. Using cryptographic hashing and chain verification, the audit trail ensures data integrity, supports compliance requirements, and provides complete transparency for investigations and audits.

**Key Features:**
- Immutable logging (cannot be altered or deleted)
- Cryptographic chain verification
- Complete activity history for all cases
- User action tracking
- System event logging
- Compliance reporting
- Export capabilities for external audits
- Real-time monitoring and alerts

**Access:** Dashboard > Compliance > Audit Trail

## What Gets Logged

### Case Activity

**Case Creation & Submission:**
- Report submitted (timestamp, reporter type, submission channel)
- Draft saved or resumed (draft code, device information)
- Report ID generated (DIS-XXXXXXXX)
- Initial assignment (automatic or manual)
- Category and priority set

**Case Updates:**
- Status changes (from → to, who changed, when)
- Priority modifications (escalations, de-escalations)
- Category reassignments
- Custom field updates
- Tags added or removed

**Case Assignment:**
- Case assigned to user (who assigned, to whom, when)
- Case reassigned (from user A to user B)
- Bulk assignment operations
- Assignment rule triggers (which rule, match criteria)
- Manual override of automatic assignments

**Case Resolution:**
- Investigation completed (findings, outcome)
- Case closed (reason, who closed)
- Case reopened (reason, who reopened)
- Case archived (retention policy applied)
- Case permanently deleted (after retention period)

### User Activity

**Authentication Events:**
- User login (successful/failed, IP address, device, location)
- User logout (manual or automatic timeout)
- Password changes (successful/failed attempts)
- Password reset requests (email sent, link clicked, completed)
- MFA setup/changes (enabled, disabled, method changed)
- Account lockouts (reason, duration, resolution)

**Session Management:**
- Session created (login)
- Session extended (activity detected)
- Session timeout (inactivity period exceeded)
- Multiple session detection (concurrent logins)
- Session terminated (logout or forced)

**User Management:**
- User invited (role, inviter, email sent)
- User accepted invitation (signup completed)
- User role changed (from → to, who changed)
- User permissions modified (specific permission changes)
- User deactivated/reactivated
- User removed from organization

### Data Access

**Case Viewing:**
- Case opened (who, when, duration)
- Case details viewed (sections accessed)
- Attachments downloaded (which files, by whom)
- PII preview accessed (before AI analysis)
- Analytics data accessed (which reports)

**Data Export:**
- Reports exported (format: CSV, PDF, Excel)
- Analytics exported (date range, filters applied)
- Compliance reports generated (type, requestor)
- Audit log exported (date range, user)

**Search & Filter:**
- Search queries executed (terms, filters, results count)
- Saved views created/modified/deleted
- Filters applied (type, values)

### Communication

**Messaging:**
- Message sent (sender, recipient, case ID)
- Message read (recipient, timestamp)
- Message deleted (who, when, reason)
- Attachment uploaded to message
- Translation requested (from → to language)

**Notifications:**
- Email sent (recipient, subject, type)
- Email delivered/bounced (status)
- In-app notification created
- Notification read/dismissed
- Notification preferences changed

### System Events

**Configuration Changes:**
- Organization settings modified (field, old → new value)
- [Assignment rules](/features/assignment-rules) created/modified/deleted
- [SLA policies](/features/sla-management) updated
- Category added/removed/renamed
- Custom fields created/modified
- Branding changes (logo, colors)
- [Custom domain](/admin/custom-domains) configuration

**Integration Activity:**
- Webhook triggered (event type, endpoint, response)
- API call made (endpoint, method, user/key, response)
- Email integration activity (sent, delivered, bounced)
- Third-party service connections (Zapier, etc.)

**Security Events:**
- Suspicious activity detected (type, details)
- Rate limit exceeded (user, endpoint)
- Failed authentication attempts (count, IP)
- Unauthorized access attempts (resource, user)
- Data encryption/decryption events
- Certificate renewals/expiration

**Compliance Events:**
- [GDPR request](/features/gdpr-requests) received (type, requestor)
- Data subject access request fulfilled
- Data erasure request completed
- Retention policy executed (records deleted)
- Legal hold applied/released
- Compliance report generated

## Audit Log Structure

### Log Entry Format

Each audit log entry contains:

**Standard Fields:**
- **ID:** Unique identifier for log entry
- **Timestamp:** ISO 8601 format (UTC)
- **Event Type:** Category of action (case_update, user_login, etc.)
- **Action:** Specific action taken (status_changed, login_successful)
- **Actor:** User who performed action (user ID, email, role)
- **Target:** Resource affected (case ID, user ID, setting name)
- **Result:** Success, failure, or partial
- **IP Address:** Source IP of request
- **User Agent:** Browser/device information
- **Session ID:** Associated session

**Metadata Fields:**
- **Old Value:** Previous state (for updates)
- **New Value:** New state (for updates)
- **Reason:** User-provided reason (if applicable)
- **Additional Context:** Extra details specific to event type
- **Related Events:** Links to connected log entries

**Security Fields:**
- **Hash:** SHA-256 hash of log entry
- **Previous Hash:** Hash of previous entry (blockchain-style)
- **Chain Position:** Position in audit chain
- **Verification Status:** Integrity check result

### Example Log Entry

```json
{
  "id": "log_abc123xyz789",
  "timestamp": "2024-01-15T14:30:45.123Z",
  "event_type": "case_update",
  "action": "status_changed",
  "actor": {
    "user_id": "user_789",
    "email": "investigator@company.com",
    "role": "case_handler"
  },
  "target": {
    "type": "case",
    "id": "DIS-A7B9C2D1"
  },
  "result": "success",
  "metadata": {
    "old_value": "in_progress",
    "new_value": "resolved",
    "reason": "Investigation completed - findings documented"
  },
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "session_id": "sess_xyz456",
  "hash": "5d41402abc4b2a76b9719d911017c592",
  "previous_hash": "098f6bcd4621d373cade4e832627b4f6",
  "chain_position": 12847,
  "verification_status": "verified"
}
```

## Cryptographic Verification

### Hash Chain Technology

**Tamper-Evident Logging:**

Disclosurely uses blockchain-inspired hash chaining to ensure audit log integrity:

**How It Works:**
1. Each log entry is hashed using SHA-256
2. Hash includes all entry data plus hash of previous entry
3. Creates unbreakable chain of entries
4. Any modification breaks the chain
5. Verification detects tampering instantly

**Chain Structure:**
```
Entry 1: Hash(Entry 1 Data)
Entry 2: Hash(Entry 2 Data + Hash(Entry 1))
Entry 3: Hash(Entry 3 Data + Hash(Entry 2))
Entry N: Hash(Entry N Data + Hash(Entry N-1))
```

**Benefits:**
- Cannot alter past entries without detection
- Cannot delete entries without breaking chain
- Cannot insert fake entries
- Mathematically provable integrity
- Meets compliance requirements for immutability

### Verification Process

**Automatic Verification:**

System continuously verifies audit trail integrity:

**Verification Checks:**
- Hash recalculation (every entry)
- Chain continuity (sequential integrity)
- Timestamp ordering (chronological verification)
- Missing entry detection (gaps in chain)
- Duplicate entry detection

**Verification Schedule:**
- Real-time: On each new entry
- Hourly: Complete chain verification
- Daily: Deep integrity audit
- On-demand: Manual verification requests

**Verification Results:**
- ✅ Verified: All checks passed, integrity confirmed
- ⚠️ Warning: Minor issues detected (auto-repair attempted)
- ❌ Failed: Tampering detected, admin alerted, investigation triggered

### Manual Verification

**Administrators Can Verify:**

1. Navigate to **Compliance > Audit Trail**
2. Click **Verify Integrity**
3. Select date range to verify
4. Click **Run Verification**
5. Review results and any anomalies

**Verification Report Includes:**
- Total entries verified
- Integrity status (pass/fail)
- Any discrepancies found
- Timestamp of verification
- Verification certificate (downloadable)

## Accessing Audit Logs

### Audit Trail Dashboard

**Main Interface:**

**Access:** Dashboard > Compliance > Audit Trail

**Features:**
- Chronological list of all events
- Real-time updates (auto-refresh)
- Advanced filtering and search
- Event categorization
- User activity timelines
- Case-specific audit trails
- Export capabilities

**Dashboard Sections:**
1. **Overview:** High-level statistics and recent activity
2. **Event Stream:** Real-time feed of all events
3. **User Activity:** Per-user action history
4. **Case History:** Case-specific audit trail
5. **Security Events:** Authentication, access, and security logs
6. **System Events:** Configuration and system changes
7. **Compliance Events:** GDPR, retention, legal hold activities

### Filtering and Search

**Advanced Filters:**

**Filter by Event Type:**
- Case activity
- User management
- Authentication
- Data access
- Communication
- System configuration
- Security events
- Compliance events

**Filter by User:**
- Specific user(s)
- User role (Admin, Case Handler, Viewer)
- Internal vs. external users
- System-generated events

**Filter by Date/Time:**
- Last 24 hours
- Last 7 days
- Last 30 days
- Last 90 days
- Custom date range
- Specific time of day

**Filter by Resource:**
- Specific case (DIS-XXXXXXXX)
- Specific user
- Organization-wide
- System-level

**Filter by Result:**
- Successful actions only
- Failed actions only
- Warnings
- All events

**Advanced Search:**
- Full-text search across all fields
- Regex pattern matching
- Boolean operators (AND, OR, NOT)
- Wildcard support
- Field-specific search (e.g., action:status_changed)

### Case-Specific Audit Trail

**View Complete Case History:**

**Access Methods:**
1. **From Case Details:** Click "Audit History" tab
2. **From Audit Trail Dashboard:** Filter by case ID
3. **From Analytics:** Click case in reports

**Case Timeline View:**

Visual timeline showing:
- Submission timestamp
- All status changes
- Assignment history
- Communication log
- Evidence uploads
- Resolution details
- Archive/deletion (if applicable)

**Export Case Audit:**
- PDF: Formatted timeline report
- CSV: Detailed event data
- JSON: Machine-readable format

**Learn More:** [Case Workflow](/cases/workflow)

## Retention and Storage

### Audit Log Retention

**Retention Periods:**

**By Plan:**
- Free Plan: 30 days
- Starter Plan: 1 year
- Pro Plan: 7 years (customizable)
- Enterprise: Unlimited (or custom)

**Compliance-Driven Retention:**
- [SOX compliance](/compliance/sox): 7 years minimum
- [GDPR](/compliance/gdpr): As long as data subject data retained
- [EU Whistleblowing Directive](/compliance/eu-directive): 3+ years
- Legal hold: Indefinite until hold released

**Automatic Archival:**
- Old logs moved to long-term storage
- Compressed for efficiency
- Still accessible via dashboard
- Same integrity guarantees

### Storage and Backup

**Redundant Storage:**
- Primary: Real-time database
- Secondary: Encrypted cloud storage
- Tertiary: Cold storage archive
- Geographic redundancy (multiple regions)

**Backup Schedule:**
- Real-time: Continuous replication
- Hourly: Incremental backups
- Daily: Full backup snapshots
- Weekly: Long-term archive
- Monthly: Compliance archive

**Disaster Recovery:**
- Recovery Point Objective (RPO): < 1 hour
- Recovery Time Objective (RTO): < 4 hours
- Regular disaster recovery testing
- Multi-region failover capability

**Learn More:** [Data Retention](/compliance/retention)

## Compliance Reporting

### Regulatory Compliance

**Audit Trail Supports:**

**SOX (Sarbanes-Oxley):**
- Complete audit trail of financial misconduct reports
- Immutable logging meets SOX requirements
- Exportable for auditor review
- Access control verification

**GDPR (General Data Protection Regulation):**
- Data processing activities logged
- Access to personal data tracked
- Data subject request handling documented
- Data breach response audited

**EU Whistleblowing Directive 2019/1937:**
- Complete case handling timeline
- Response time tracking
- Communication with reporters logged
- Protection measures documented

**ISO 27001:**
- Information security event logging
- Access control auditing
- Incident response tracking
- Change management documentation

**HIPAA (Healthcare):**
- PHI access logging (if applicable)
- Breach notification compliance
- Security incident tracking

### Compliance Report Generation

**Pre-Built Reports:**

1. **SOX Audit Report**
   - Financial misconduct cases
   - Audit committee reporting
   - Internal control effectiveness

2. **GDPR Compliance Report**
   - Data subject requests handled
   - Personal data access log
   - Breach notification timeline
   - Consent management

3. **Whistleblowing Directive Report**
   - Cases received and processed
   - Response time compliance
   - Reporter protection measures
   - Outcome statistics

4. **Security Audit Report**
   - Authentication events
   - Access control violations
   - Security incidents
   - Vulnerability responses

**Custom Reports:**
- Select specific event types
- Choose date ranges
- Filter by users, cases, or resources
- Export in multiple formats

**Scheduled Compliance Reporting:**
- Quarterly: Automatic generation and email delivery
- Annual: Comprehensive year-end reports
- On-demand: Generate anytime for audits

**Learn More:** [Compliance Analytics](/analytics/compliance-analytics)

## Exporting Audit Logs

### Export Formats

**CSV (Comma-Separated Values):**
- Best for: Spreadsheet analysis, data manipulation
- Includes: All log fields, timestamps, user details
- Use cases: Excel analysis, custom reporting, database import

**JSON (JavaScript Object Notation):**
- Best for: Programmatic processing, SIEM integration
- Includes: Complete structured data, nested objects
- Use cases: Log aggregation, security monitoring, API consumption

**PDF (Portable Document Format):**
- Best for: Human-readable reports, stakeholder presentations
- Includes: Formatted timeline, charts, summaries
- Use cases: Audit submissions, executive reports, compliance filings

**Syslog:**
- Best for: SIEM integration, centralized logging
- Includes: Standardized log format (RFC 5424)
- Use cases: Splunk, QRadar, LogRhythm integration

### Export Options

**Full Export:**
- All audit logs within date range
- Complete field set
- All event types included
- May be large file

**Filtered Export:**
- Apply filters before export
- Only relevant events
- Smaller, focused dataset
- Faster processing

**Anonymized Export:**
- PII automatically redacted
- Safe for external sharing
- Maintains event context
- Compliance-friendly

### Export Process

**How to Export:**

1. Navigate to **Compliance > Audit Trail**
2. Apply desired filters (date range, event type, user, etc.)
3. Click **Export** button
4. Select format (CSV, JSON, PDF, Syslog)
5. Choose anonymization level (none, partial, full)
6. Click **Generate Export**
7. Download file (or receive via email for large exports)

**Export Limits:**
- Free Plan: 1,000 events per export
- Starter Plan: 10,000 events per export
- Pro Plan: 100,000 events per export
- Enterprise: Unlimited

**Scheduled Exports:**
- Set up recurring exports (daily, weekly, monthly)
- Automatic delivery to SFTP, S3, or email
- Consistent format and filters
- Compliance automation

## Security and Access Control

### Who Can Access Audit Logs

**Role-Based Access:**

**Organization Owner:**
- ✅ Full access to all audit logs
- ✅ Can export all data
- ✅ Can configure retention policies
- ✅ Can verify integrity

**Administrator:**
- ✅ Access to organization-wide logs
- ✅ Can export filtered data
- ✅ Can generate compliance reports
- ❌ Cannot modify retention policies

**Case Handler:**
- ✅ Access to logs for assigned cases
- ✅ Can view own activity
- ❌ Cannot access organization-wide logs
- ❌ Cannot export

**Viewer:**
- ✅ Read-only access to assigned case logs
- ❌ Cannot export
- ❌ Cannot access system logs

**External Auditor (temporary access):**
- ✅ Read-only access to specified logs
- ✅ Can export for audit purposes
- ⏱️ Time-limited access
- 🔒 Restricted to specific date ranges

**Learn More:** [Access Control](/security/access-control)

### Audit Trail Security

**Protection Measures:**

**Encryption:**
- At rest: AES-256 encryption
- In transit: TLS 1.3
- Encrypted backups
- Encrypted exports (optional password protection)

**Access Logging:**
- All audit log access is itself audited (meta-logging)
- Who viewed what, when
- Export activity tracked
- Alerts on unusual access patterns

**Immutability:**
- Logs cannot be edited or deleted
- Cryptographic verification prevents tampering
- Append-only data structure
- Blockchain-inspired integrity

**Monitoring:**
- Real-time anomaly detection
- Unusual access pattern alerts
- Mass export warnings
- Integrity violation notifications

## Use Cases

### Internal Investigations

**Scenario:** Investigating potential data breach

**Audit Trail Helps:**
1. Identify all users who accessed sensitive case
2. Track when and how data was accessed
3. Determine if data was exported
4. Verify proper authorization
5. Document investigation timeline

**Steps:**
1. Filter by case ID and date range
2. Review all access events
3. Check for unauthorized access
4. Verify export activity
5. Generate investigation report

### Compliance Audits

**Scenario:** Annual SOX audit by external auditors

**Audit Trail Provides:**
1. Complete history of financial misconduct reports
2. Proof of timely response (SLA compliance)
3. Audit committee notification evidence
4. Access control verification
5. Change management documentation

**Auditor Workflow:**
1. Grant temporary read-only access
2. Auditor filters by event types (case_creation, audit_committee_notification)
3. Export relevant logs for review
4. Verify cryptographic integrity
5. Generate audit opinion

### Security Incident Response

**Scenario:** Detecting and responding to unauthorized access

**Real-Time Alerts:**
- Failed login attempts (threshold exceeded)
- Access from new location/device
- Unusual access patterns
- Mass data export attempts
- Permission changes

**Response Process:**
1. Alert triggered automatically
2. Security team reviews audit logs
3. Identify affected resources
4. Verify legitimacy or confirm breach
5. Take remediation actions (lockout, password reset)
6. Document incident response

### Performance Optimization

**Scenario:** System running slowly, need to identify cause

**Audit Trail Analysis:**
1. Review system event logs
2. Identify resource-intensive operations
3. Check for excessive API calls
4. Analyze user activity patterns
5. Optimize configuration based on findings

**Optimization Insights:**
- Peak usage times
- Most active users/features
- Slow queries or operations
- Integration bottlenecks

## Best Practices

### Regular Audit Reviews

✅ **Weekly:**
- Review security events (failed logins, access violations)
- Check for unusual patterns
- Verify critical case activity
- Monitor system health

✅ **Monthly:**
- Generate compliance summary reports
- Review user activity trends
- Audit access control changes
- Verify integrity of audit chain

✅ **Quarterly:**
- Comprehensive compliance reporting
- External audit preparation
- Retention policy review
- Long-term trend analysis

✅ **Annually:**
- Full audit trail verification
- Compliance certification renewal
- Security assessment
- Disaster recovery testing

### Maintaining Audit Integrity

✅ **Do:**
- Enable automatic integrity verification
- Review verification reports promptly
- Investigate any failed verifications immediately
- Maintain redundant backups
- Test disaster recovery procedures
- Document audit trail policies

❌ **Don't:**
- Attempt to modify or delete audit logs
- Ignore verification failures
- Grant unnecessary audit log access
- Disable logging for any reason
- Export to insecure locations
- Share audit logs publicly

### Compliance Best Practices

✅ **Document Everything:**
- Who has access to audit logs
- Export procedures and approvals
- Retention policy rationale
- Integrity verification schedule
- Incident response procedures

✅ **Regular Training:**
- Train administrators on audit log importance
- Educate users on what gets logged
- Practice audit log analysis
- Review compliance requirements

✅ **Automate When Possible:**
- Scheduled compliance reports
- Automatic exports to SIEM
- Integrity verification
- Retention policy execution
- Alert notifications

## Troubleshooting

### Verification Failures

**Symptom:** Integrity verification fails

**Possible Causes:**
1. **Database corruption:** Hardware failure or software bug
2. **Backup restore issue:** Restored from non-current backup
3. **Time synchronization:** Server clock drift
4. **Attack/tampering:** Malicious modification attempt

**Resolution:**
1. Isolate affected log entries
2. Review recent system events
3. Check server health and logs
4. Restore from verified backup if needed
5. Document incident thoroughly
6. Contact support for severe cases

### Missing Log Entries

**Symptom:** Expected event not in audit log

**Possible Causes:**
1. **Filtering:** Event hidden by current filters
2. **Timing:** Event hasn't occurred yet or delayed
3. **Permissions:** Don't have access to see event
4. **Logging disabled:** Feature not enabled (should never happen)

**Resolution:**
1. Clear all filters
2. Verify expected action actually occurred
3. Check with administrator about permissions
4. Review system configuration
5. Contact support if entries truly missing

### Export Failures

**Symptom:** Cannot export audit logs

**Possible Causes:**
1. **Too many events:** Export exceeds plan limit
2. **Storage quota:** Organization storage full
3. **Browser timeout:** Large export taking too long
4. **Permissions:** Insufficient access rights

**Resolution:**
1. Apply more restrictive filters to reduce event count
2. Upgrade plan for larger exports
3. Request export via email for large datasets
4. Check with administrator about permissions
5. Try different export format (CSV vs. JSON vs. PDF)

### Performance Issues

**Symptom:** Audit trail dashboard slow to load

**Possible Causes:**
1. **Large date range:** Querying millions of events
2. **Complex filters:** Multiple filter conditions
3. **High system load:** Many concurrent users
4. **Network issues:** Slow connection

**Resolution:**
1. Reduce date range to smaller window
2. Simplify filter criteria
3. Use search instead of loading all events
4. Try during off-peak hours
5. Clear browser cache
6. Upgrade to faster plan (more resources)

## Related Pages

- [Compliance Overview](/compliance/overview) - Regulatory compliance framework
- [Data Retention](/compliance/retention) - Retention policies and archival
- [GDPR Compliance](/compliance/gdpr) - GDPR data handling
- [SOX Compliance](/compliance/sox) - Sarbanes-Oxley requirements
- [Security Overview](/security/overview) - Platform security architecture
- [Access Control](/security/access-control) - Role-based permissions
- [Analytics Dashboard](/analytics/dashboard) - Analytics and reporting

## Support

Need help with audit trails?
- Email: support@disclosurely.com
- [Contact Support](/support/contact)
- [Compliance Documentation](/compliance/overview)
- [Security Best Practices](/security/best-practices)
