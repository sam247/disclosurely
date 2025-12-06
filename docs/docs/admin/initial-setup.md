---
title: Initial Setup - Disclosurely Configuration Guide
description: Set up your whistleblowing platform in minutes. Configure organization settings, customize branding, invite team members, and launch your secure reporting portal.
head:
  - - meta
    - property: og:title
      content: Initial Setup & Configuration - Disclosurely
  - - meta
    - property: og:description
      content: Set up your whistleblowing platform in minutes. Configure organization settings, customize branding, invite team members, and launch your secure reporting portal.
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
      content: Initial Setup - Disclosurely
  - - meta
    - name: twitter:description
      content: Set up your whistleblowing platform in minutes. Configure organization settings, customize branding, invite team members, and launch your secure reporting portal.
  - - meta
    - name: twitter:image
      content: https://disclosurely.com/docs/ogimage.png
---

# Initial Setup

This guide will walk you through setting up your Disclosurely organization from scratch. Follow these steps to get your whistleblowing and compliance platform up and running quickly.

## Step 1: Create Your Account

### Sign Up

1. Visit [disclosurely.com](https://disclosurely.com)
2. Click **"Sign Up"** or **"Get Started"**
3. Enter your email address
4. Create a secure password (minimum 8 characters)
5. Accept the Terms of Service and Privacy Policy
6. Click **"Create Account"**

### Email Verification

After creating your account:

1. Check your email inbox for a verification email
2. Click the verification link in the email
3. Your email is now verified and you can log in

**Tip**: Check your spam folder if you don't receive the verification email within 5 minutes.

## Step 2: Organization Setup

Upon first login, you'll be prompted to set up your organization.

### Organization Details

**Organization Name**
- Enter your company or organization's official name
- This will appear on your reporting portal and emails
- Can be changed later in settings

**Organization Domain**
- Your organization's primary website (e.g., yourcompany.com)
- Used for email domain verification
- Helps prevent spoofing and unauthorized access

**Industry/Sector**
- Select your organization's primary industry
- Helps us provide relevant compliance guidance
- Options include: Financial Services, Healthcare, Technology, Manufacturing, Government, Non-Profit, etc.

**Organization Size**
- Select your employee count range
- Helps with compliance benchmarking
- Options: 1-50, 51-200, 201-1000, 1000+

### Contact Information

**Primary Contact Name**
- Your name as the primary administrator
- Used for account-related communications

**Primary Contact Email**
- Your email for system notifications
- Should be monitored regularly
- You can add additional contacts later

**Phone Number** (Optional)
- Support contact number
- Displayed on reporting portal for questions

## Step 3: Configure Your Reporting Portal

### Secure Link Generation

Every organization gets a unique secure reporting link:

**Format**: `https://disclosurely.com/secure/tool/submit/[your-unique-token]`

This link is your organization's anonymous reporting portal where whistleblowers can [submit anonymous reports](/docs/reporting/how-to-submit):
- Submit anonymous reports
- Track report status
- Communicate securely with your team

**How to Find Your Link**:
1. Navigate to **Dashboard > Secure Link**
2. Copy your unique secure submission link
3. Share this link with employees via:
   - Internal website/intranet
   - Email signatures
   - Employee handbooks
   - Posters in workplace
   - Training materials

### Reporting Form Configuration

Customize what information is collected in reports:

**Required Fields**:
- Report description (always required)
- Incident date
- Category selection

**Optional Fields** (can be enabled/disabled):
- Location/Department
- Witnesses
- File uploads
- Reporter contact (for confidential reports)

**To Configure**:
1. Go to **Settings > Reporting Form**
2. Toggle optional fields on/off
3. Customize field labels if needed
4. Set category options
5. Click **Save Changes**

### Report Categories

Set up categories to organize reports:

**Default Categories**:
- Harassment & Discrimination
- Financial Misconduct
- Health & Safety
- Data Privacy
- Conflicts of Interest
- Other

**To Customize Categories**:
1. Navigate to **Settings > Categories**
2. Click **"Add Category"**
3. Enter category name and description
4. Add sub-categories if needed
5. Set category color for visual organization
6. Click **Save**

**Best Practice**: Keep categories broad enough to capture all report types, but specific enough to be useful for routing and analysis.

## Step 4: Invite Your Team

### Understanding Roles

Before inviting team members, understand the four user roles:

| Role | Access Level | Best For |
|------|--------------|----------|
| **Admin** | Full system access | IT admins, compliance officers |
| **Org Admin** | Organization management | HR directors, legal team |
| **Case Handler** | Case management | Investigators, compliance team |
| **Reviewer** | View-only | Auditors, oversight roles |

See [Team Management](/docs/admin/team-management) for detailed role descriptions.

### Sending Invitations

To invite team members:

1. Navigate to **Dashboard > Team**
2. Click **"Invite Team Member"**
3. Enter invitee's email address
4. Select their role
5. Add optional welcome message
6. Click **"Send Invitation"**

The invitee will receive an email with:
- Invitation to join your organization
- Link to create their account
- Role assignment information
- Expiration notice (7 days)

**Important**:
- Invitations expire after 7 days
- You can resend expired invitations
- Invitees must use the email address the invitation was sent to

### Initial Team Recommendations

For most organizations, we recommend starting with:

- **1-2 Admins**: Overall system responsibility
- **2-3 Case Handlers**: Primary investigation team
- **1 Reviewer**: Oversight or audit role (if needed)

You can always add more team members as your program grows.

## Step 5: Customize Branding (Pro/Enterprise)

If you're on a Pro or Enterprise plan, [customize your reporting portal](/docs/admin/custom-branding) to match your brand.

### Upload Your Logo

1. Navigate to **Settings > Branding**
2. Click **"Upload Logo"**
3. Select your logo file (PNG, JPG, or SVG)
4. Ensure file is under 2MB
5. Preview how it looks
6. Click **"Save"**

**Logo Guidelines**:
- Recommended size: 200x80 pixels
- Transparent background (PNG) works best
- Horizontal orientation preferred
- Should be clearly visible on light and dark backgrounds

### Set Brand Color

1. In **Settings > Branding**
2. Click the color picker
3. Enter your brand's hex color code
4. Preview how it appears on the portal
5. Click **"Save"**

Your brand color will be used for:
- Primary buttons and links
- Header accents
- Form highlights
- Email templates

### Custom Messaging

Personalize messages shown to reporters:

**Welcome Message**:
- Shown at the top of the reporting form
- Use to reassure reporters about confidentiality
- Example: "Your voice matters. Report concerns securely and anonymously."

**Confirmation Message**:
- Shown after successful report submission
- Include next steps and expected timeline
- Example: "Thank you for speaking up. Your report has been received and will be reviewed within 24 hours."

**Status Page Message**:
- Shown on the tracking page
- Explain how to use the tracking system
- Example: "Use your tracking ID to check the status of your report anytime."

## Step 6: Configure Notifications

Set up email notifications to keep your team informed.

### Notification Settings

Navigate to **Settings > Notifications** and configure:

**New Report Notifications**:
- ✅ Enable email alerts for new reports
- Choose who receives notifications:
  - All Admins
  - All Case Handlers
  - Specific users
- Set notification frequency:
  - Immediate (recommended)
  - Daily digest
  - Weekly digest

**Status Change Notifications**:
- ✅ Notify reporters when report status changes
- Automated emails sent to reporter via tracking ID
- Customize email template if desired

**Assignment Notifications**:
- ✅ Notify team members when [assigned to a case](/docs/cases/assignment)
- Immediate email notification
- Include case summary in email

**Compliance Reminders**:
- ✅ Enable reminders for upcoming deadlines
- Set reminder timing (7 days, 3 days, 1 day before)
- Choose recipients

### Email Templates

Customize email templates for:
- New report acknowledgments
- Status update notifications
- Assignment notifications
- Compliance reminders

**To Customize**:
1. Go to **Settings > Email Templates**
2. Select template to edit
3. Modify subject line and body
4. Use merge tags for dynamic content:
   - `{{TRACKING_ID}}` - Report tracking ID
   - `{{STATUS}}` - Current status
   - `{{ORGANIZATION}}` - Your organization name
   - `{{DATE}}` - Report date
5. Preview template
6. Save changes

## Step 7: Set Up Compliance Modules (Optional)

If you plan to use Disclosurely for broader compliance management, set up these modules:

### Policy Management

1. Navigate to **Compliance > Policies**
2. Click **"Add Policy"**
3. Enter policy details:
   - Title
   - Policy type
   - Description
   - Effective date
4. Upload policy document (PDF)
5. Assign policy owner
6. Set next review date
7. Click **"Save"**

See [Policy Management](/docs/compliance/policies) for details.

### Risk Register

1. Go to **Compliance > Risks**
2. Click **"Add Risk"**
3. Enter risk details:
   - Risk description
   - Likelihood (1-5)
   - Impact (1-5)
   - Risk category
4. Add mitigation plan
5. Assign risk owner
6. Set review date
7. Click **"Save"**

See [Risk Management](/docs/compliance/risks) for details.

### Compliance Calendar

1. Navigate to **Compliance > Calendar**
2. Click **"Add Event"**
3. Enter event details:
   - Event name
   - Event type (deadline, review, audit, etc.)
   - Due date
   - Description
4. Assign responsible party
5. Set reminder preferences
6. Click **"Save"**

See [Compliance Calendar](/docs/compliance/calendar) for details.

## Step 8: Test Your Setup

Before going live, test your configuration:

### Test Report Submission

1. Open your secure reporting link
2. Submit a test report
3. Verify you receive notification
4. Check report appears in dashboard
5. Test status tracking with tracking ID
6. Test secure messaging feature

### Test Team Access

1. Verify invited team members can log in
2. Confirm role permissions work correctly
3. Test assignment workflow
4. Verify notifications are received

### Test Branding

1. Review reporting portal appearance
2. Check logo displays correctly
3. Verify brand colors are applied
4. Test custom messages appear

## Step 9: Launch Communications

Once you've tested everything, announce the new reporting channel to your organization.

### Internal Communications

**Announce via**:
- Company-wide email
- Intranet/internal website
- Team meetings and town halls
- New employee onboarding
- Manager training sessions
- Digital signage
- Employee handbook

**Key Messages to Include**:
- Purpose of the reporting channel
- Types of issues to report
- How anonymity is protected
- How to submit a report (link and instructions)
- What happens after submission
- Expected response times
- Who can see reports (reassure about confidentiality)

### Sample Announcement Email

```
Subject: New Secure Reporting Channel Now Available

Dear Team,

We are committed to maintaining a safe, ethical workplace where everyone feels empowered to speak up. Today, we're launching a new secure reporting channel powered by Disclosurely.

This platform allows you to report concerns about:
- Harassment or discrimination
- Financial irregularities
- Safety issues
- Policy violations
- Ethical concerns
- Any other workplace issues

KEY FEATURES:
✓ Submit reports anonymously
✓ Track status with your tracking ID
✓ Communicate securely with our team
✓ End-to-end encryption protects your privacy

HOW TO REPORT:
Visit [your secure reporting link] or find the link on our intranet.

Your voice matters. Together, we can maintain the highest standards of ethics and compliance.

Best regards,
[Your Name/Team]
```

### Ongoing Communications

Regularly remind employees about the reporting channel:
- Quarterly reminders via email
- Include in compliance training
- Reference in employee onboarding
- Promote during Ethics & Compliance Week
- Display posters in common areas

## Step 10: Ongoing Administration

After launch, maintain your system:

### Weekly Tasks

- Review new reports
- Check pending assignments
- Monitor compliance calendar
- Review analytics dashboard

### Monthly Tasks

- Review team access and roles
- Check notification settings
- Review and update categories if needed
- Assess reporting trends

### Quarterly Tasks

- Review policies and update as needed
- Audit risk register
- Review team training needs
- Assess program effectiveness

### Annual Tasks

- Conduct comprehensive program review
- Update compliance documentation
- Review and renew subscription
- Assess need for additional features or training

## Getting Help

Need assistance during setup?

- **Email Support**: support@disclosurely.com
- **In-App Chat**: Click chat icon in bottom right
- **Documentation**: Browse our comprehensive guides
- **Video Tutorials**: [Coming soon]
- **Setup Call**: Enterprise customers can schedule onboarding call

## Next Steps

Now that you've completed initial setup:

1. **[Customize Your Branding](/docs/admin/custom-branding)** - Make it yours
2. **[Add Custom Domain](/docs/admin/custom-domains)** - Use your own domain (Pro/Enterprise)
3. **[Configure GDPR Settings](/docs/compliance/gdpr)** - Ensure data compliance
4. **[Explore AI Features](/docs/ai/case-helper)** - Leverage AI for case analysis
5. **[Set Up Compliance Modules](/docs/compliance/overview)** - Expand beyond whistleblowing

Welcome to Disclosurely! You're all set to run an effective, compliant whistleblowing and ethics program.
