---
title: Integrations - Disclosurely Third-Party Connections
description: Connect Disclosurely with webhooks, Zapier, email services, custom domains, and referral programs to streamline your whistleblowing workflow and extend platform capabilities.
head:
  - - meta
    - property: og:title
      content: Integrations & Extensions - Disclosurely
  - - meta
    - property: og:description
      content: Connect Disclosurely with webhooks, Zapier, email services, custom domains, and referral programs to streamline your whistleblowing workflow and extend platform capabilities.
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
      content: Integrations - Disclosurely
  - - meta
    - name: twitter:description
      content: Connect Disclosurely with webhooks, Zapier, email services, custom domains, and referral programs to streamline your whistleblowing workflow and extend platform capabilities.
  - - meta
    - name: twitter:image
      content: https://disclosurely.com/docs/ogimage.png
---

# Integrations & Extensions

Connect Disclosurely with your existing tools, workflows, and systems to create a seamless whistleblowing and compliance ecosystem.

## Available Integrations

### Custom Domains (Available Now)

**Connect your own domain** to create a branded reporting portal that reflects your organization's identity.

**How it Works:**
- Use your company's domain (e.g., reports.yourcompany.com)
- DNS configuration with CNAME records
- Automatic SSL certificate provisioning
- Professional, trustworthy appearance for reporters

**Benefits:**
- Increased reporter trust and confidence
- Brand consistency across all touchpoints
- Professional appearance
- Custom email address support
- SEO benefits for compliance documentation

**Setup Guide:** [Custom Domains Configuration](/admin/custom-domains)

**Typical Setup Time:** 15-30 minutes (plus DNS propagation)

**Requirements:**
- Pro plan or higher
- Access to DNS management
- Valid domain ownership

---

### Email Integrations (Available Now)

**Automated email notifications** keep your team informed and reporters updated throughout the investigation lifecycle.

**Email Capabilities:**

**For Administrators:**
- New case notifications
- Assignment alerts
- SLA breach warnings
- Weekly case summaries
- Compliance deadline reminders
- System status updates
- Team activity digests

**For Reporters:**
- Submission confirmation
- Status change notifications
- Message received alerts
- Investigation updates
- Resolution notifications

**For Case Handlers:**
- Case assignment notifications
- New message alerts
- Deadline reminders
- Escalation notifications

**Customization:**
- Custom email templates
- Organization branding
- Notification preferences per user
- Frequency controls
- Priority filtering

**Email Delivery:**
- High deliverability rates
- SPF/DKIM/DMARC authentication
- Bounce handling
- Spam score optimization
- Delivery tracking

**Learn More:** [Notification System](/features/notifications)

---

### Referral Program Integration (Available Now)

**Grow your network** and earn rewards by referring other organizations to Disclosurely.

**How it Works:**
1. Generate your unique referral link
2. Share with colleagues and other organizations
3. Earn rewards when they subscribe
4. Track referrals in your dashboard

**Rewards:**
- Account credits
- Free subscription months
- Extended storage
- Premium feature access
- Custom implementation support

**Referral Dashboard:**
- Track clicks and conversions
- Monitor reward status
- Generate promotional materials
- Share via email, social media, or direct links

**Learn More:** [Referral Program Guide](/features/referral-program)

---

### Multi-Language Support (Available Now)

**Serve global workforces** with comprehensive international language support.

**Supported Languages:**
- English
- Spanish (Español)
- French (Français)
- German (Deutsch)
- Polish (Polski)
- Swedish (Svenska)
- Norwegian (Norsk)
- Portuguese (Português)
- Italian (Italiano)
- Dutch (Nederlands)
- Danish (Dansk)
- Greek (Ελληνικά)

**Language Features:**
- Auto-detection based on browser/location
- Reporter language selection
- Link-specific language restrictions
- Default language per organization
- Translated interface, forms, and emails
- Real-time translation for messaging

**Learn More:** [Internationalization & Multi-Language](/features/internationalization)

---

### Link Generator & Distribution (Available Now)

**Create unlimited custom reporting links** with specific configurations for different audiences, departments, or campaigns.

**Link Capabilities:**
- Department-specific pre-filling
- Language restrictions
- Usage limits and quotas
- Expiration dates
- Auto-assignment rules
- Category restrictions
- Custom welcome messages
- QR code generation

**Distribution Methods:**
- Email campaigns
- Intranet integration
- QR code posters
- Employee portals
- Direct link sharing
- Embedded widgets (coming soon)

**Learn More:** [Link Generator & Management](/admin/link-generator)

---

## Coming Soon Integrations

### Webhooks (Planned Q2 2025)

**Real-time event notifications** to external systems when actions occur in Disclosurely.

**Webhook Events:**
- `report.submitted` - New report received
- `report.assigned` - Case assigned to investigator
- `report.status_changed` - Status updated
- `report.message_received` - New message from reporter
- `report.resolved` - Investigation completed
- `report.escalated` - Case escalated
- `sla.approaching` - SLA deadline nearing
- `sla.breached` - SLA deadline passed
- `pattern.detected` - AI identified pattern
- `risk.high` - High-risk case flagged

**Configuration:**
- Define webhook endpoints (HTTPS URLs)
- Select which events to receive
- Configure retry logic
- Set authentication (API keys, HMAC signatures)
- Test webhook delivery

**Payload Format:**
```json
{
  "event": "report.submitted",
  "timestamp": "2024-01-15T10:30:00Z",
  "report_id": "DIS-A7B9C2D1",
  "organization_id": "org_abc123",
  "data": {
    "category": "Financial Misconduct",
    "priority": "high",
    "status": "new",
    "anonymous": true
  }
}
```

**Use Cases:**
- Trigger Slack/Teams notifications
- Create tickets in Jira/ServiceNow
- Update CRM systems
- Log events in SIEM
- Start approval workflows
- Generate compliance reports
- Sync with data warehouses

**Security:**
- HTTPS required for all webhooks
- Signature verification (HMAC-SHA256)
- IP whitelisting
- Retry with exponential backoff
- Payload encryption options

**Early Access:**
Email integrations@disclosurely.com to join beta program.

---

### Zapier Integration (Planned Q2 2025)

**Connect to 5,000+ applications** without code using Zapier's no-code automation platform.

**Popular Zaps:**

**Notifications:**
- New report → Slack channel message
- High-priority case → SMS to on-call team
- Status change → Email to stakeholder
- SLA breach → PagerDuty alert

**Data Management:**
- New report → Google Sheets row
- Case closed → Append to CSV
- Weekly → Export analytics to Airtable
- Monthly → Generate PDF report to Dropbox

**Ticketing:**
- New report → Jira ticket
- Assign case → ServiceNow assignment
- Resolved case → Close Zendesk ticket
- Escalation → Priority flag in Asana

**CRM Integration:**
- Case resolved → Update Salesforce record
- Reporter feedback → HubSpot note
- Investigation finding → Dynamics 365 entry

**Compliance:**
- Case archived → Copy to Compliance folder
- Quarterly → Generate report → Email audit committee
- Pattern detected → Create compliance task

**Pre-Built Templates:**
Disclosurely will provide ready-to-use Zap templates for common workflows.

**Enterprise Support:**
Dedicated Zapier integration support for Enterprise customers.

**Interest List:**
Join waitlist at integrations@disclosurely.com

---

### API Access (Planned Q3 2025)

**Full RESTful API** for custom integrations and programmatic access.

**API Capabilities:**

**Case Management:**
- `GET /api/v1/reports` - List all reports
- `GET /api/v1/reports/:id` - Get specific report
- `POST /api/v1/reports` - Submit new report
- `PATCH /api/v1/reports/:id` - Update report status
- `DELETE /api/v1/reports/:id` - Archive report

**Analytics:**
- `GET /api/v1/analytics/dashboard` - Dashboard metrics
- `GET /api/v1/analytics/trends` - Historical trends
- `GET /api/v1/analytics/categories` - Category breakdown
- `POST /api/v1/analytics/export` - Export data

**User Management:**
- `GET /api/v1/users` - List team members
- `POST /api/v1/users/invite` - Invite new user
- `PATCH /api/v1/users/:id` - Update user role
- `DELETE /api/v1/users/:id` - Remove user

**Compliance:**
- `GET /api/v1/compliance/audit-log` - Audit trail
- `GET /api/v1/compliance/gdpr-requests` - GDPR requests
- `POST /api/v1/compliance/export` - Compliance export

**Authentication:**
- OAuth 2.0 for user-based access
- API keys for server-to-server
- JWT tokens for single sign-on
- Scoped permissions (read, write, admin)

**Rate Limits:**
- Free plan: 100 requests/hour
- Starter plan: 1,000 requests/hour
- Pro plan: 10,000 requests/hour
- Enterprise: Custom limits

**Developer Resources:**
- Comprehensive API documentation
- Code examples (Python, JavaScript, PHP, Ruby)
- Postman collection
- Sandbox environment for testing
- Developer community forum

**Beta Program:**
Early access for Enterprise customers. Contact enterprise@disclosurely.com

---

### Microsoft Teams Integration (Planned Q3 2025)

**Native Teams app** for streamlined workflow within Microsoft's collaboration platform.

**Features:**

**Submit Reports:**
- Submit reports directly from Teams
- Use conversational bot interface
- Attach files and screenshots
- Anonymous submission support

**Notifications:**
- Real-time case updates in channels
- Direct messages for assigned cases
- @mentions for urgent cases
- Customizable notification preferences

**Case Management:**
- View case details in Teams
- Update status without leaving Teams
- Send messages to reporters
- Assign cases to team members

**Bot Commands:**
- `/disclosurely new` - Start new report
- `/disclosurely cases` - View assigned cases
- `/disclosurely status [ID]` - Check report status
- `/disclosurely analytics` - View dashboard

**Channel Integration:**
- Post new high-priority cases to channel
- Team collaboration on investigations
- Approval workflows via adaptive cards
- Case resolution notifications

**SSO Integration:**
- Single sign-on with Microsoft Entra ID (Azure AD)
- Automatic team sync
- Role-based access control
- Compliance with Microsoft security standards

**Interest List:**
Join waitlist for Teams integration at integrations@disclosurely.com

---

### Slack Integration (Planned Q3 2025)

**Slack app** for seamless whistleblowing workflow in your Slack workspace.

**Features:**

**Slash Commands:**
- `/disclosurely report` - Submit new report
- `/disclosurely mycases` - View your assigned cases
- `/disclosurely analytics` - Quick analytics snapshot
- `/disclosurely help` - Command reference

**Interactive Messages:**
- Case assignment prompts with approve/decline buttons
- Status update confirmations
- Quick actions (escalate, reassign, close)
- Thread-based conversations

**Notifications:**
- New report alerts in dedicated channel
- DM notifications for assignments
- SLA breach warnings
- Pattern detection alerts

**Workflow Builder:**
- Pre-built workflows for common actions
- Custom approval processes
- Automated case routing
- Scheduled compliance reports

**App Home:**
- Dashboard overview in Slack
- Recent cases and activity
- Quick access to common actions
- Personalized metrics

**Security:**
- OAuth 2.0 authentication
- Encrypted data transmission
- Audit logging of Slack actions
- Compliance with Slack's security standards

**Waitlist:**
Email integrations@disclosurely.com to request Slack integration.

---

### SIEM Integration (Planned Q4 2025)

**Security Information and Event Management** integration for enterprise security operations.

**Supported Platforms:**
- Splunk
- IBM QRadar
- LogRhythm
- Elastic SIEM
- Microsoft Sentinel
- Sumo Logic
- AlienVault

**Data Export:**
- Audit log streaming
- Security event forwarding
- Case activity logs
- Access attempt logs
- Anomaly detection events
- Compliance violation alerts

**Use Cases:**
- Security operations monitoring
- Insider threat detection
- Compliance auditing
- Incident response correlation
- Regulatory reporting
- Threat hunting

**Format Support:**
- Syslog (RFC 5424)
- CEF (Common Event Format)
- JSON
- Custom formats

**Enterprise Feature:**
Available for Enterprise customers. Contact enterprise@disclosurely.com

---

## Integration Roadmap

### Near Term (6 months)
- ✅ Custom domains (Available)
- ✅ Email notifications (Available)
- ✅ Referral program (Available)
- ✅ Multi-language (Available)
- 🔄 Webhooks (Q2 2025)
- 🔄 Zapier (Q2 2025)

### Medium Term (6-12 months)
- 📅 API access (Q3 2025)
- 📅 Microsoft Teams (Q3 2025)
- 📅 Slack (Q3 2025)
- 📅 SSO/SAML (Q3 2025)
- 📅 SIEM integration (Q4 2025)

### Long Term (12+ months)
- 📅 ServiceNow integration
- 📅 Salesforce connector
- 📅 Jira integration
- 📅 Google Workspace
- 📅 Embedded widgets
- 📅 Mobile SDKs

## Custom Integration Services

### Enterprise Integration Package

**Dedicated integration support** for large organizations with complex requirements.

**Includes:**
- Dedicated integration engineer
- Custom API development
- Bespoke webhook endpoints
- SSO/SAML configuration
- Data migration assistance
- Testing and validation
- Documentation and training
- Ongoing support and maintenance

**Typical Projects:**
- Legacy system integration
- Custom workflow automation
- Proprietary tool connections
- Data warehouse integration
- Compliance system linkage

**Pricing:**
Custom quote based on requirements. Contact: enterprise@disclosurely.com

---

## Integration Best Practices

### Security

✅ **Always use HTTPS** for webhooks and API endpoints
✅ **Validate webhook signatures** to ensure authenticity
✅ **Use API keys securely** - never hardcode or commit to repos
✅ **Implement rate limiting** on your endpoints
✅ **Log all integration activity** for audit purposes

### Reliability

✅ **Handle retries gracefully** - webhooks will retry failed deliveries
✅ **Implement idempotency** - handle duplicate webhook calls
✅ **Monitor integration health** - set up alerts for failures
✅ **Test in staging first** before production deployment

### Data Privacy

✅ **Minimize data exposure** - only send necessary fields
✅ **Respect PII regulations** - anonymize when possible
✅ **Secure data in transit** - use TLS 1.3
✅ **Delete integration data** when no longer needed
✅ **Document data flows** for compliance audits

### Performance

✅ **Use async processing** for webhook handlers
✅ **Implement caching** where appropriate
✅ **Batch API calls** to reduce requests
✅ **Monitor API rate limits** and adjust accordingly

---

## Early Access Program

### Join the Beta

**Get early access** to new integrations before general release.

**Benefits:**
- Try new features first
- Provide feedback that shapes development
- Exclusive beta support
- Priority bug fixes
- Beta pricing (often discounted)
- Direct line to product team

**Requirements:**
- Active Disclosurely account (Pro plan or higher)
- Willingness to provide feedback
- Tolerance for occasional bugs
- Participation in beta testing surveys

**How to Join:**
1. Email: integrations@disclosurely.com
2. Subject: "Beta Program - [Integration Name]"
3. Include:
   - Your organization name
   - Current plan
   - Desired integration(s)
   - Use case description
   - Technical contact information

**Response Time:** 3-5 business days

---

## Developer Resources

### Documentation

**Coming Soon:**
- API reference documentation
- Webhook event catalog
- Authentication guides
- Code examples and SDKs
- Postman collections
- Integration tutorials
- Best practices guides

### Developer Community

**Connect with other developers** building on Disclosurely:
- Developer forum (coming soon)
- GitHub discussions
- Stack Overflow tag: `disclosurely`
- Monthly developer office hours
- Integration showcase

### Support Channels

**For integration help:**
- Email: integrations@disclosurely.com
- Developer docs: disclosurely.com/docs/api
- Status page: status.disclosurely.com
- Community forum: community.disclosurely.com

---

## Related Pages

- [Custom Domains](/admin/custom-domains) - Branded domain setup
- [Link Generator](/admin/link-generator) - Custom reporting links
- [Notification System](/features/notifications) - Email notifications
- [Referral Program](/features/referral-program) - Referral tracking
- [Internationalization](/features/internationalization) - Multi-language

## Support

Questions about integrations?
- Email: integrations@disclosurely.com
- [Contact Support](/support/contact)
- [Join Beta Program](mailto:integrations@disclosurely.com?subject=Beta%20Program)
