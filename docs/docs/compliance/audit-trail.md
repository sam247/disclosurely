---
title: Audit Trail - Disclosurely Tamper-Evident Logging
description: Tamper-evident audit trails with hash chain integrity for complete compliance. Track all user actions, system events, and investigations with immutable logging.
head:
  - - meta
    - property: og:title
      content: Audit Trail & Tamper-Evident Logging - Disclosurely
  - - meta
    - property: og:description
      content: Tamper-evident audit trails with hash chain integrity for complete compliance. Track all user actions, system events, and investigations with immutable logging.
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
      content: Tamper-evident audit trails with hash chain integrity for complete compliance. Track all user actions, system events, and investigations with immutable logging.
  - - meta
    - name: twitter:image
      content: https://disclosurely.com/docs/ogimage.png
---

# Audit Trail

Complete, tamper-evident logging of all system activities for compliance and accountability.

## Overview

Disclosurely's audit trail provides:

- **Complete transparency**: Every action logged
- **Tamper-evidence**: Hash chain prevents alteration
- **Compliance**: Meets regulatory requirements
- **Accountability**: Who did what, when
- **Investigation**: Forensic analysis capability
- **Trust**: Demonstrable integrity

## What Gets Logged

### User Actions

**Account Activities**:
- Login attempts (successful and failed)
- Logout events
- Password changes
- MFA setup and changes
- Email address updates
- Account creation
- Account deactivation
- Permission changes

**Case Activities**:
- Case viewed
- Case assigned/reassigned
- Status changed
- Notes added or edited
- Evidence uploaded
- Evidence downloaded
- Evidence deleted
- Messages sent
- Tags added/removed
- Priority changed

**Administrative Actions**:
- Team member invited
- User role changed
- Organization settings modified
- Branding updated
- Domain configured
- Subscription changed
- Integrations configured
- Retention policies set
- Legal holds applied/released

### System Events

**Automatic Activities**:
- Report submitted
- Auto-assignment triggered
- Notification sent
- Scheduled tasks run
- Data archiving
- Data deletion
- Backup completion
- System health checks

**Security Events**:
- Failed authentication attempts
- Account lockouts
- Suspicious activity detected
- IP address changes
- Session timeouts
- API access
- Integration connections
- Certificate renewals

## Audit Log Structure

### Log Entry Fields

Each audit entry contains:

**Timestamp**:
- Exact date and time (UTC)
- Millisecond precision
- Timezone indicator

**Actor**:
- User who performed action
- User ID (immutable)
- User role at time
- IP address
- Geographic location (approximate)
- Device/browser fingerprint

**Action**:
- What was done
- Standardized action codes
- Human-readable description
- Severity level

**Object**:
- What was acted upon
- Case ID, user ID, setting name, etc.
- Before state (if modified)
- After state (if modified)

**Context**:
- How action was performed (UI, API, automation)
- Related objects
- Parent actions
- Session identifier

**Integrity**:
- Hash of this entry
- Hash of previous entry
- Chain position
- Signature

### Hash Chain Integrity

**How It Works**:

1. **First Entry**
   - Initial hash calculated from entry data
   - Becomes baseline for chain

2. **Subsequent Entries**
   - Entry data + previous entry's hash = new hash
   - Creates cryptographic link
   - Any tampering breaks chain

3. **Verification**
   - Recalculate all hashes
   - Compare to stored hashes
   - Any mismatch = tampering detected
   - Shows exactly where tampering occurred

**Benefits**:
- **Tamper-evident**: Cannot alter without detection
- **Non-repudiation**: Proves action occurred
- **Integrity**: Verifiable by third parties
- **Compliance**: Meets SOX, ISO 27001, regulations

## Viewing Audit Logs

### Accessing Logs

**Permission Required**:
- Organization Administrator
- Compliance Officer (if role exists)
- Auditor (read-only)

**Navigation**:
1. Dashboard > Compliance > Audit Trail
2. Select date range
3. Apply filters
4. View log entries

### Filtering Logs

**By Time**:
- Last 24 hours
- Last 7 days
- Last 30 days
- Custom date range
- Specific time period

**By User**:
- Specific user
- All users
- Role type
- External users (API)
- System actions

**By Action Type**:
- Case actions
- User management
- Settings changes
- Security events
- System events
- All actions

**By Object**:
- Specific case
- Specific user
- Settings category
- All objects

**By Severity**:
- Critical (security events, deletions)
- High (major changes)
- Medium (standard actions)
- Low (view actions)
- Info (system events)

### Search Functionality

**Keyword Search**:
- Search all log entries
- Action descriptions
- User names
- Object IDs
- Context information

**Advanced Search**:
- Combine multiple filters
- Date range + user + action
- Boolean operators
- Regular expressions
- Save search queries

## Compliance Uses

### Regulatory Compliance

**[EU Whistleblowing Directive](/compliance/eu-directive)**:
- Demonstrates report handling timeline
- Shows acknowledgment within 7 days
- Proves feedback within 3 months
- Documents confidentiality measures
- Audit trail required for compliance

**[GDPR](/compliance/gdpr)**:
- Track data access
- Document data exports
- Verify deletions occurred
- Demonstrate consent handling
- Support data subject requests

**[SOX (Sarbanes-Oxley)](/compliance/sox)**:
- Audit trail of financial report investigations
- Document controls and processes
- Demonstrate segregation of duties
- Prove [data retention compliance](/compliance/retention)

**ISO 27001**:
- Information security event logging
- Access control verification
- Incident response documentation
- Change management tracking

### Internal Audits

**Quarterly Reviews**:
- Case handling efficiency
- User activity patterns
- Compliance with procedures
- Security event analysis
- Process improvements

**Annual Audits**:
- Comprehensive log review
- Retention compliance verification
- Security assessment
- User access review
- Hash chain integrity check

**External Audits**:
- Provide filtered audit logs
- Export for auditor review
- Demonstrate compliance
- Verify integrity
- Support findings

## Audit Reports

### Pre-Built Reports

**User Activity Report**:
- Actions by user over period
- Login patterns
- Case access history
- Administrative changes
- Anomaly detection

**Case Activity Report**:
- All actions on specific case
- Timeline view
- User involvement
- Evidence handling
- Status changes

**Security Event Report**:
- Failed login attempts
- Account lockouts
- Suspicious activities
- Permission changes
- Integration access

**Compliance Report**:
- Report handling timeline
- Acknowledgment timeliness
- Feedback timeliness
- Data retention compliance
- Policy adherence

**Change Management Report**:
- Settings changes
- User role modifications
- Policy updates
- Configuration changes
- Administrative actions

### Custom Reports

**Build Your Own**:
1. Select fields to include
2. Choose filters
3. Set date range
4. Select output format
5. Save or export

**Output Formats**:
- PDF (formatted report)
- CSV (spreadsheet analysis)
- JSON (programmatic access)
- Excel (data analysis)

**Scheduling**:
- One-time report
- Daily digest
- Weekly summary
- Monthly compliance report
- Custom schedule

## Export and Integration

### Exporting Audit Logs

**Export Options**:
- Filtered subset
- Complete logs
- Date range
- Specific cases
- User activities

**Formats**:
- CSV (spreadsheet)
- JSON (structured data)
- XML (enterprise systems)
- CEF (SIEM integration)
- Syslog format

**Integrity Verification**:
- Export includes hash chain
- Verification tool provided
- Can validate externally
- Proves authenticity

### SIEM Integration

**Security Information and Event Management**:

**Supported Platforms**:
- Splunk
- IBM QRadar
- LogRhythm
- ArcSight
- Elasticsearch/ELK Stack
- Microsoft Sentinel

**Integration Method**:
- Real-time log streaming
- Webhook delivery
- API polling
- Syslog forwarding
- File-based transfer

**Use Cases**:
- Centralized security monitoring
- Correlation with other systems
- Advanced threat detection
- Compliance reporting
- Incident response

## Retention and Storage

### Audit Log Retention

**Retention Period**:
- **Minimum**: 7 years (regulatory requirement)
- **Recommended**: 10 years
- **Permanent**: Critical security events

**Never Deleted**:
- Security incidents
- Data breaches
- Legal hold events
- Compliance violations
- Administrative sanctions

**Storage**:
- [Encrypted at rest](/security/overview)
- Geographically redundant
- Separate from case data
- Highly available
- Backed up independently

### Audit Log Size

**Typical Size**:
- 100 cases/month ≈ 1GB logs/year
- 1,000 cases/month ≈ 10GB logs/year
- Scales with activity level

**Storage Costs**:
- Included in subscription
- No additional charge
- Unlimited retention
- All plans

## Integrity Verification

### Verifying Hash Chain

**Automated Verification**:
- Runs automatically daily
- Alerts if tampering detected
- System administrators notified
- Incident logged

**Manual Verification**:

1. **Export Audit Logs**
   - With hash chain data
   - Select period to verify
   - Download verification tool

2. **Run Verification**
   - Command-line tool
   - Or web-based verifier
   - Recalculates hashes
   - Compares to originals

3. **Review Results**
   - "Integrity verified" if clean
   - "Tampering detected" if compromised
   - Shows exact point of break
   - Generate verification report

**Use Cases**:
- Audit preparation
- Legal proceedings
- Incident investigation
- Compliance demonstration
- Third-party verification

### Third-Party Verification

**Independent Auditors**:
- Provide export with hash chain
- Auditor verifies independently
- Demonstrates integrity
- Cannot be disputed
- Regulatory compliance

## Advanced Features

### Anomaly Detection

**AI-Powered Analysis**:
- Unusual access patterns
- Off-hours activity
- Excessive downloads
- Rapid status changes
- Geographic anomalies

**Alerts Generated**:
- Real-time notifications
- Security team alerted
- Potential security incidents
- Insider threat detection
- Compliance violations

**Examples**:
- User accessing 100+ cases in 1 hour
- Login from unusual location
- Multiple failed login attempts
- Bulk evidence downloads
- After-hours administrative changes

### Correlation Analysis

**Cross-Reference Events**:
- Related actions across time
- Multiple users on same case
- Pattern detection
- Workflow analysis
- Efficiency insights

**Use Cases**:
- Identify bottlenecks
- Optimize processes
- Detect collusion
- Verify segregation of duties
- Improve workflows

## Best Practices

### Regular Review

**Who Should Review**:
- Compliance Officer: Monthly
- Security Team: Weekly
- Administrators: Daily (high-level)
- Auditors: Quarterly

**What to Look For**:
- Unusual activity patterns
- Failed access attempts
- Unexpected administrative changes
- After-hours activity
- Bulk data access

### Document Review

**Create Review Log**:
- Date of review
- Who performed review
- Findings
- Actions taken
- Follow-up required

**Demonstrate Diligence**:
- Regular oversight
- Active monitoring
- Responsive to issues
- Compliance commitment

### Set Up Alerts

**Critical Events**:
- Failed login after 3 attempts
- Account created or deleted
- Legal hold applied/released
- Data deletion
- Settings changes
- Permission elevations

**Notification Method**:
- Email to security team
- SMS for critical events
- Slack/Teams integration
- SIEM alert
- In-app notification

### Segregate Duties

**Who Can See What**:
- Investigators: Case audit logs only
- Administrators: User management logs
- Compliance: All logs (read-only)
- External Auditors: Filtered exports

**Prevent Conflicts**:
- Can't audit own actions comprehensively
- Independent review
- Checks and balances
- Accountability

## Compliance Scenarios

### Data Subject Request (GDPR)

**Request**: User wants to know all their data access

**Response**:
1. Filter audit log by subject's case
2. Export all view/access events
3. Show who accessed when
4. Demonstrate encryption and access controls
5. Provide report to data subject

### Regulatory Investigation

**Request**: Regulator asks about specific case handling

**Response**:
1. Export complete audit trail for case
2. Show timeline from submission to resolution
3. Demonstrate timely acknowledgment
4. Prove feedback provided
5. Verify integrity with hash chain
6. Provide verification certificate

### Internal Investigation

**Scenario**: Suspected leak of confidential case information

**Investigation**:
1. Filter audit log for case
2. View all access events
3. Identify who viewed/downloaded evidence
4. Check for unusual patterns
5. Cross-reference with leak timing
6. Document findings
7. Take appropriate action

### Litigation Discovery

**Scenario**: Employment tribunal requests investigation records

**Response**:
1. Apply legal hold to prevent deletion
2. Export relevant audit logs
3. Demonstrate process followed
4. Show procedural fairness
5. Verify integrity
6. Provide to legal counsel
7. Maintain chain of custody

## Troubleshooting

### Cannot Access Audit Trail

**Check**:
- Do you have required permissions?
- Organization Administrator or Compliance Officer role needed
- Contact admin to request access

### Audit Log Missing Entries

**Verify**:
- Correct date range selected
- Filters not hiding entries
- Time zone settings
- System outage during period (rare)
- Contact support if confirmed gap

### Hash Chain Verification Failed

**Immediate Actions**:
1. Do not delete or modify logs
2. Document verification failure
3. Notify security team
4. Contact Disclosurely support
5. Preserve evidence
6. Investigate potential compromise

**Possible Causes**:
- Software bug (most likely)
- Database corruption
- Attempted tampering (rare)
- Export/import error

### Export Failed

**Solutions**:
- Reduce date range (less data)
- Try different format
- Check internet connection
- Contact support if persists

---

**Related:**
- [GDPR Compliance](/compliance/gdpr)
- [Data Retention](/compliance/retention)
- [Security Overview](/security/overview)
- [Organization Settings](/admin/organization-settings)
