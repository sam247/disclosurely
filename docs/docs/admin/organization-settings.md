# Organization Settings

Manage your organization's core settings, branding, and configuration in one centralized location.

## Accessing Organization Settings

1. Navigate to **Dashboard > Settings**
2. Click **Organization** in the left sidebar
3. Make desired changes
4. Click **Save Changes**

## Organization Profile

### Basic Information

**Organization Name**
- Your company's official name
- Appears on reporting portal and emails
- Can be changed anytime
- Best practice: Use full legal name

**Organization Domain**
- Your company's website domain
- Used for email verification
- Helps prevent unauthorized access
- Format: yourcompany.com (no http://)

**Industry/Sector**
- Select your primary industry
- Helps with compliance guidance
- Used for benchmarking
- Can update as organization changes

**Organization Size**
- Employee count range
- Updates automatically with team growth
- Used for analytics and pricing
- Options: 1-50, 51-200, 201-1000, 1000+

### Contact Information

**Primary Contact**
- Main administrator's name
- Receives important system notifications
- Account-related communications
- Can be updated anytime

**Contact Email**
- Primary email for organization
- System notifications sent here
- Should be monitored regularly
- Can set multiple notification emails

**Support Phone** (Optional)
- Displayed on reporting portal
- For reporter questions
- Not required but recommended
- Helps build trust with reporters

## Reporting Configuration

### Secure Reporting Link

Your unique, secure reporting URL:
```
https://disclosurely.com/secure/tool/submit/[your-token]
```

**Managing Your Link**:
- Cannot be changed (security reasons)
- Can be disabled temporarily
- Copy to share with employees
- QR code available for printing

### Report Form Settings

**Required Fields**:
- Report description (always required)
- Incident date
- Category selection

**Optional Fields** (toggle on/off):
- ☑ Location/Department
- ☑ Witness information  
- ☑ File uploads
- ☑ Reporter contact (confidential reports)
- ☑ Incident time
- ☑ Additional context

**Custom Fields**:
- Add organization-specific fields
- Text, dropdown, or checkbox
- Mark as required or optional
- Up to 5 custom fields (Pro plan)

### Category Management

Customize report categories:

**Default Categories**:
- Harassment & Discrimination
- Financial Misconduct
- Health & Safety
- Data Privacy
- Conflicts of Interest
- Other

**Add Custom Category**:
1. Click **Add Category**
2. Enter category name
3. Add description
4. Set routing rules (optional)
5. Choose category color
6. Save

**Sub-Categories**:
- Add sub-categories under main categories
- Helps with detailed classification
- Up to 3 levels deep
- Improves analytics and routing

## Data & Privacy Settings

### Data Retention

**Report Retention**:
- How long to keep completed reports
- Options: 1 year, 3 years, 5 years, 7 years, indefinitely
- Consider regulatory requirements
- Archived reports follow same retention

**Audit Log Retention**:
- How long to keep audit logs
- Minimum: 1 year (recommended: 7 years)
- Critical for compliance
- Cannot be deleted before retention period

### GDPR Settings

**Data Processing Region**:
- Choose where data is stored
- Options: EU, US, UK
- Affects data sovereignty
- Set based on your jurisdiction

**Automatic Data Requests**:
- Enable automatic GDPR processing
- Safety period before deletion (24 hours)
- Email notifications at each stage
- Requires Pro or Enterprise plan

See [GDPR Compliance](/compliance/gdpr) for details.

## Notification Preferences

### Email Notifications

**New Report Notifications**:
- Who receives alerts: All Admins | All Handlers | Specific Users
- Frequency: Immediate | Daily Digest | Weekly Digest
- Email template customization
- Test notification feature

**Status Update Notifications**:
- Notify reporters of status changes
- Automatic via tracking ID
- Customizable templates
- Can include custom messages

**Assignment Notifications**:
- Alert team members when assigned
- Include case summary
- Immediate delivery
- Cannot be disabled

**Compliance Reminders**:
- Upcoming deadline alerts
- Configurable reminder timing
- Multiple reminder schedule
- Sent to responsible parties

### In-App Notifications

**Real-Time Alerts**:
- New reports
- New messages
- Assignments
- Status changes
- GDPR requests

**Notification Settings**:
- Enable/disable per type
- Sound alerts
- Desktop notifications (browser permission required)
- Badge counters

## Subscription & Billing

Subscription details are managed separately.

See [Subscription & Billing](/admin/subscription-billing) for:
- Current plan details
- Billing information
- Upgrade/downgrade options
- Invoice history
- Usage statistics

## Advanced Settings

### Security Settings

**Session Timeout**:
- Automatic logout after inactivity
- Options: 15 min, 30 min, 1 hour, 4 hours, 8 hours
- Recommended: 30 minutes for security
- Applies to all users

**Password Requirements**:
- Minimum length (8-16 characters)
- Require special characters
- Require numbers
- Require uppercase/lowercase
- Password expiration (optional)

**Multi-Factor Authentication**:
- Require MFA for all users
- Require MFA for admins only
- Optional MFA
- MFA methods: Email OTP, Authenticator app

### API Access (Enterprise)

**API Keys**:
- Generate API keys for integrations
- Set expiration dates
- Revoke keys
- Monitor API usage

**Webhooks** (Coming Soon):
- Configure webhook endpoints
- Choose events to trigger webhooks
- Test webhook delivery
- View webhook logs

## Compliance Settings

### Audit Configuration

**Audit Detail Level**:
- Basic: Login/logout, major actions
- Standard: All user actions
- Detailed: Every action and data change

**Audit Export**:
- Export format: CSV, JSON
- Date range selection
- Filtered by user or action type

### Policy Acknowledgment

**Require Acknowledgment**:
- Policies requiring employee acknowledgment
- Acknowledgment tracking
- Reminder schedule for unacknowledged
- Reporting on compliance

## Organization Deletion

**Permanently Delete Organization**:

⚠️ **Warning**: This action is irreversible!

Deleting your organization:
- Removes all reports and data
- Deletes all team member access
- Cancels subscription
- Cannot be undone

**24-hour safety period before deletion**

To delete:
1. Scroll to bottom of settings
2. Click **Delete Organization**
3. Type organization name to confirm
4. Enter password
5. Click **Confirm Deletion**

## Best Practices

1. **Review Regularly**: Check settings quarterly
2. **Test Features**: Use test reports to verify configuration
3. **Document Changes**: Keep log of setting changes
4. **Train Team**: Ensure team understands notification system
5. **Monitor Usage**: Review analytics to optimize settings

## Getting Help

**Questions about settings?**
- [Contact Support](/support/contact)
- [FAQs](/support/faqs)
- Email: support@disclosurely.com

---

**Next Steps:**
- [Team Management](/admin/team-management)
- [Custom Branding](/admin/custom-branding)
- [Subscription & Billing](/admin/subscription-billing)
