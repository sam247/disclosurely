---
title: Key Concepts - Disclosurely Whistleblowing Platform
description: Master essential whistleblowing concepts including anonymous reporting, case workflows, encryption, compliance, and audit trails. Complete guide for effective compliance.
head:
  - - meta
    - property: og:title
      content: Key Concepts - Disclosurely Whistleblowing Platform
  - - meta
    - property: og:description
      content: Master essential whistleblowing concepts including anonymous reporting, case workflows, encryption, compliance, and audit trails. Complete guide for effective compliance.
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
      content: Key Concepts - Disclosurely Platform
  - - meta
    - name: twitter:description
      content: Master essential whistleblowing concepts including anonymous reporting, case workflows, encryption, compliance, and audit trails. Complete guide for effective compliance.
  - - meta
    - name: twitter:image
      content: https://disclosurely.com/docs/ogimage.png
---

# Key Concepts

Understanding these key concepts will help you get the most out of Disclosurely and implement an effective whistleblowing and compliance program.

## Reports & Cases

### What is a Report?

A **report** is a submission made through your organization's secure reporting channel. Reports can contain:

- Description of the incident or concern
- Date and time information
- Location or department details
- Witness information (optional)
- Supporting evidence and documents
- Category classification

### Report Types

Disclosurely supports [two types of reports](/reporting/report-types):

**Anonymous Reports**
- No personal information collected
- Fully encrypted end-to-end
- [Tracking ID provided](/reporting/tracking-report) for status checks
- [Two-way messaging](/reporting/secure-messaging) available while maintaining anonymity
- Cannot be traced back to the reporter

**Confidential Reports**
- Reporter identity known to organization
- Higher level of trust
- Easier follow-up communication
- Still [encrypted and secure](/reporting/encryption)
- Identity protected from unauthorized access

### Report Lifecycle

Reports move through a [standard investigation lifecycle](/cases/workflow):

1. **New** - Just submitted, awaiting review
2. **In Review** - Initial assessment underway
3. **Investigating** - Active investigation in progress
4. **Resolved** - Investigation complete, resolution implemented
5. **Closed** - Case closed with outcome documented
6. **Archived** - Historical record, no longer active

Learn more about [case status management](/cases/status).

### Tracking IDs

Every report receives a unique tracking ID in the format **DIS-XXXXXXXX**. This tracking ID allows anonymous reporters to:

- Check the status of their report
- Receive updates and messages
- Provide additional information
- See resolution outcomes

**Important**: Tracking IDs should be kept secure by the reporter. Anyone with the tracking ID can access that report's status and messages.

## Users & Roles

### User Roles

Disclosurely uses role-based access control with four primary roles:

#### Admin
Full system access including:
- All reports and cases
- Team management (add/remove users)
- Organization settings
- Billing and subscription
- Custom domain configuration
- All compliance modules
- System configuration

#### Org Admin
Organization-level administration:
- View and manage all reports
- Team management (invite/remove team members)
- Organization settings
- Custom branding
- Compliance management
- Analytics and reporting
- Cannot modify billing

#### Case Handler
Day-to-day case management:
- View assigned reports
- Update report status
- Add case notes
- Send messages to whistleblowers
- Assign reports to team members
- Access analytics
- Cannot modify organization settings

#### Reviewer
Read-only access:
- View assigned reports
- Read messages and notes
- Access analytics
- Cannot modify cases or settings
- Useful for oversight roles or auditors

### Team Invitations

[Adding team members](/admin/team-management) requires sending an invitation:

1. Admin or Org Admin sends invitation by email
2. Invitation includes unique token and expires in 7 days
3. Recipient creates account using invitation link
4. Role is automatically assigned upon account creation

## Encryption & Security

### Zero-Knowledge Architecture

Disclosurely is built on [zero-knowledge security principles](/security/overview):

- **Client-Side Encryption**: All sensitive report content is [encrypted in the user's browser](/reporting/encryption) before transmission
- **Server Cannot Decrypt**: Our servers never have access to encryption keys
- **True Anonymity**: We cannot read report content or identify reporters
- **You Control Keys**: Only users with proper access can decrypt reports

### How Encryption Works

1. **Report Submission**:
   - Reporter writes their report in the web form
   - Content is encrypted in browser using AES-256
   - Encrypted data is sent to our servers
   - Encryption key is hashed and stored separately

2. **Report Access**:
   - Authorized team member requests report
   - System verifies permissions
   - Encrypted content is sent to user's browser
   - Decryption happens client-side
   - Plaintext never stored on servers

3. **Message Exchange**:
   - Each message is individually encrypted
   - Encryption maintains anonymity
   - Message threading preserved
   - Full conversation history secured

### Access Keys

Access keys are cryptographic keys that allow decryption of reports. When you:

- Submit a report: An access key is generated and stored with your tracking ID
- View a report as a case handler: Your permission grants temporary access to the encryption key
- Share a tracking ID: The holder can decrypt and view report contents

## Compliance Management

### Policies

**Compliance Policies** are formal documents governing organizational behavior:

- **Policy Types**: Data Privacy, HR, Financial, Security, Operational, Environmental, Legal, Ethics
- **Version Control**: Track policy changes over time
- **Status Tracking**: Draft, Under Review, Active, Archived
- **Acknowledgment**: Require employees to read and acknowledge
- **Review Cycles**: Set next review dates and reminders
- **Ownership**: Assign policy owners responsible for maintenance

### Risks

**Compliance Risks** are identified threats to organizational compliance:

- **Risk Assessment**: Evaluate likelihood and impact
- **Risk Scoring**: Quantitative risk prioritization
- **Mitigation Plans**: Document risk mitigation strategies
- **Status Tracking**: Monitor mitigation progress
- **Risk Owners**: Assign responsibility for risk management
- **Regular Review**: Periodic reassessment of risks

### Compliance Calendar

The **Compliance Calendar** tracks important deadlines and obligations:

- **Event Types**: Deadlines, Reviews, Audits, Certifications, Training
- **Due Dates**: Track upcoming and overdue obligations
- **Status**: Pending, Completed, Overdue
- **Reminders**: Automated notifications before due dates
- **Ownership**: Assign responsibility for completion
- **Notes**: Document completion details

## GDPR & Data Rights

### Data Subject Rights

Under GDPR, individuals have specific rights regarding their data:

#### Right of Access
- Users can request export of all their personal data
- Includes report content, messages, and profile information
- Provided in machine-readable format (JSON)
- Fulfilled within 30 days

#### Right to Erasure
- Users can request complete data deletion
- 24-hour safety period before deletion executes
- All associated data removed including reports and messages
- Cannot be undone after safety period
- Audit log entry created for compliance

#### Right to Rectification
- Users can update their personal information
- Profile data can be modified anytime
- Changes reflected immediately across platform

### GDPR Request Types

**Data Export Requests**:
- Full Export: All user data
- Report Data: Just whistleblower reports
- Personal Data: Profile and account information

**Data Erasure Requests**:
- Full Erasure: Complete account and data deletion
- Anonymize Reports: Remove personal data but keep reports
- Delete Personal Data: Remove profile, keep anonymous reports

### Automated GDPR Processing

Disclosurely automates GDPR compliance:

- Requests automatically queued for processing
- Safety periods prevent accidental deletion
- Notification emails sent at each stage
- Audit logs maintain compliance record
- Status dashboard for tracking requests

## AI & Automation

### AI Case Helper

The **AI Case Helper** is your intelligent assistant for case analysis:

- **Case Summarization**: Automatic summary generation from case details
- **Insight Generation**: AI identifies key issues and concerns
- **Recommendation Engine**: Suggests next steps and actions
- **Pattern Recognition**: Identifies similarities with other cases
- **Risk Scoring**: AI-powered risk assessment
- **Document Analysis**: Upload company documents for context

### Pattern Detection

**Pattern Detection** automatically identifies:

- Recurring themes across multiple reports
- Common departments or locations mentioned
- Similar types of incidents
- Potential systemic issues
- Trends over time
- Correlation between cases

Patterns help organizations:
- Identify root causes
- Prevent future incidents
- Target training and education
- Measure effectiveness of interventions

### AI Document Upload

Upload company documents to provide context:

- Policies and procedures
- Code of conduct
- Employee handbooks
- Previous investigation reports
- Training materials
- Regulatory guidance

AI uses these documents to:
- Understand organizational context
- Reference relevant policies
- Compare against previous cases
- Provide more accurate recommendations

## Audit Trails & Accountability

### Tamper-Evident Logs

All actions in Disclosurely are logged with:

- **Timestamp**: Exact time of action
- **User**: Who performed the action
- **Action Type**: What was done (create, update, delete, etc.)
- **Resource**: What was affected (report, message, policy, etc.)
- **Details**: Specific changes made
- **IP Address**: Location of action
- **User Agent**: Browser/device information
- **Hash Chain**: Cryptographic proof of integrity

### Hash Chain Integrity

Audit logs use blockchain-like hash chaining:

1. Each log entry is hashed
2. Hash includes previous entry's hash
3. Creates unbreakable chain
4. Any modification breaks the chain
5. Provides proof logs weren't tampered with

This ensures:
- Audit logs are trustworthy
- Compliance evidence is valid
- Investigations are defensible
- Regulatory requirements are met

### Audit Log Uses

Organizations use audit logs for:

- **Compliance Audits**: Demonstrate compliance with regulations
- **Security Investigations**: Track security incidents
- **Performance Review**: Analyze response times and handling
- **Process Improvement**: Identify bottlenecks and inefficiencies
- **Legal Defense**: Provide evidence in legal proceedings

## Custom Branding & Domains

### Custom Branding

Customize your reporting portal to match your brand:

- **Logo**: Upload your organization's logo (max 2MB)
- **Brand Color**: Choose your primary brand color
- **Organization Name**: Display your organization name
- **Custom Messaging**: Personalize welcome and confirmation messages

Branding appears on:
- Public reporting form
- Email notifications
- Status lookup page
- Thank you pages

### Custom Domains

Pro and Enterprise plans can use custom domains:

**Benefits**:
- Professional appearance (reports.yourcompany.com)
- Increased trust from employees
- Brand consistency
- SEO benefits

**Setup Process**:
1. Add domain in dashboard
2. Create CNAME record with your DNS provider
3. Verify domain ownership
4. SSL certificate automatically provisioned
5. Domain goes live

**Requirements**:
- You must own the domain
- Access to DNS settings
- Pro or Enterprise subscription

## Notifications & Alerts

### Email Notifications

Configurable email notifications for:

- **New Reports**: Notify team when reports arrive
- **Status Changes**: Alert reporters of status updates
- **New Messages**: Notify of new messages in cases
- **Assignment**: Alert when assigned to a case
- **Due Dates**: Remind of upcoming compliance deadlines
- **Policy Changes**: Notify of new or updated policies
- **GDPR Requests**: Alert of data requests

### Weekly Roundup

Automated weekly email with:
- New reports this week
- Status changes
- Pending assignments
- Upcoming deadlines
- Key metrics and statistics

Helps teams stay informed without constant monitoring.

### In-App Notifications

Real-time in-app notifications for:
- New reports
- Messages
- Assignments
- Status changes
- System alerts

## Best Practices

### For Administrators

1. **Regular Review**: Check platform weekly at minimum
2. **Prompt Response**: Acknowledge reports within 24 hours
3. **Keep Updated**: Maintain current policies and procedures
4. **Train Team**: Ensure all users understand their roles
5. **Monitor Metrics**: Track key performance indicators
6. **Audit Regularly**: Review audit logs for compliance

### For Case Handlers

1. **Document Everything**: Add detailed case notes
2. **Communicate Clearly**: Keep reporters informed of progress
3. **Follow Process**: Adhere to established workflows
4. **Maintain Confidentiality**: Never share case details inappropriately
5. **Use AI Tools**: Leverage AI helper for insights
6. **Close Properly**: Document resolution and outcomes

### For Reporters

1. **Be Specific**: Provide as much detail as possible
2. **Include Evidence**: Attach relevant documents or files
3. **Save Tracking ID**: Securely store your tracking ID
4. **Check Status**: Monitor progress of your report
5. **Respond Promptly**: Reply to questions from case handlers
6. **Stay Anonymous**: Don't include identifying information if anonymous

---

**Next Steps:**
- [Getting Started Guide](/)
- [Platform Overview](/introduction/platform-overview)
- [Initial Setup](/admin/initial-setup)
