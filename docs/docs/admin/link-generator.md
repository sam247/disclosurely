---
title: Link Generator & Management - Disclosurely Admin Guide
description: Create and manage secure reporting portal links with custom settings, language options, usage limits, expiration dates, and department-specific configurations.
head:
  - - meta
    - property: og:title
      content: Link Generator & Management - Disclosurely
  - - meta
    - property: og:description
      content: Create and manage secure reporting portal links with custom settings, language options, usage limits, expiration dates, and department-specific configurations.
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
      content: Link Generator - Disclosurely
  - - meta
    - property: og:description
      content: Create and manage secure reporting portal links with custom settings, language options, usage limits, expiration dates, and department-specific configurations.
  - - meta
    - name: twitter:image
      content: https://disclosurely.com/docs/ogimage.png
---

# Link Generator & Management

Create customized, secure reporting portal links tailored to specific departments, languages, and use cases within your organization.

## Overview

The Link Generator allows you to create multiple reporting portal URLs, each with its own configuration. This enables department-specific portals, multi-language submissions, limited-use links for specific campaigns, and temporary access for contractors or third parties.

**Access:** Dashboard > Settings > Link Generator

## Default Reporting URL

Every organization receives a default reporting URL automatically:

```
https://[your-org-name].disclosurely.com/report
```

**Characteristics:**
- Automatically generated from your organization name
- Cannot be changed or deleted
- Always active
- Supports all languages
- No usage limits
- Default landing page for all reporting

**Custom Branding:**
Upgrade to a custom branded domain for professional appearance:
```
https://reports.yourcompany.com
```

Learn more: [Custom Domains](/docs/admin/custom-domains)

## Creating Custom Links

### Why Create Custom Links?

**Department-Specific Portals:**
- Pre-fill department information
- Route automatically to specific investigators
- Track submissions by department
- Example: `https://yourorg.disclosurely.com/report?dept=finance`

**Language-Specific Links:**
- Restrict to specific languages
- Set default language for region
- Example: Spanish portal for Latin American operations

**Limited-Use Links:**
- One-time access for specific events
- Temporary contractor access
- Campaign-specific reporting
- Controlled capacity management

**Testing and Training:**
- Create test links for demos
- Training environment links
- QA and staging portals

### How to Create a Link

**Step-by-Step:**

1. Navigate to **Dashboard > Settings > Link Generator**
2. Click **Create New Link**
3. Configure link settings (see below)
4. Click **Generate Link**
5. Copy and distribute link

### Link Configuration Options

#### Basic Settings

**Link Name** (Required)
- Internal identifier for your reference
- Not visible to reporters
- Examples: "HR Department", "Spanish Portal", "Q1 Campaign"

**Description** (Optional)
- Internal notes about link purpose
- Usage instructions for your team
- Track campaigns or initiatives

**Department/Location** (Optional)
- Pre-fill department field in submission form
- Auto-route to specific investigators
- Helpful for tracking and analytics

#### Language Settings

**Available Languages:**
Choose which languages reporters can use with this link.

**Default Language:**
Set the language displayed when link is first opened.

**Supported Languages:**
- English
- Spanish (Espa�ol)
- French (Fran�ais)
- German (Deutsch)
- Polish (Polski)
- Swedish (Svenska)
- Norwegian (Norsk)
- Portuguese (Portugu�s)
- Italian (Italiano)
- Dutch (Nederlands)
- Danish (Dansk)
- Greek (��������)

**Language Restriction:**
-  Allow all languages
-  Restrict to specific languages only

**Example Use Cases:**
- European office: Enable English, French, German only
- Latin America office: Spanish and Portuguese only
- Global hotline: All languages enabled

#### Usage Limits

**Maximum Submissions:**
Limit how many reports can be submitted through this link.

**Options:**
- Unlimited (default)
- 1 submission (one-time use)
- 10 submissions (limited campaign)
- 50 submissions (department quota)
- 100 submissions (large initiative)
- Custom number

**Use Cases:**
- One-time whistleblower access
- Specific investigation follow-ups
- Budget-controlled campaigns
- Test link with limited capacity

#### Expiration Settings

**Link Expiration Date:**
Automatically disable link after specific date.

**Options:**
- No expiration (default)
- 7 days
- 30 days
- 90 days
- Custom date

**Use Cases:**
- Temporary contractor access
- Time-limited campaigns
- Seasonal reporting periods
- Event-specific reporting

**Expiration Behavior:**
- Link displays "Expired" message when accessed
- Past submissions remain accessible
- Can be manually reactivated if needed
- Email notification to admins 7 days before expiration

#### Advanced Settings

**Auto-Assignment Rules:**
- Automatically assign reports from this link to specific investigators
- Bypass default assignment rules
- Department-specific routing

**Category Restrictions:**
- Limit available categories for this link
- Pre-select default category
- Simplify form for specific use cases

**Custom Welcome Message:**
- Override default welcome text
- Department-specific instructions
- Language-specific guidance

**Analytics Tracking:**
- Track link performance
- Measure campaign effectiveness
- Source attribution

## Managing Existing Links

### Link Dashboard

**View All Links:**
Access all created links in one centralized location.

**Information Displayed:**
- Link name and description
- Current status (Active, Paused, Expired)
- Usage count (submissions received)
- Usage limit (if set)
- Expiration date (if set)
- Creation date
- Last used date

### Link Actions

**Copy Link:**
- Click clipboard icon to copy URL
- Share via email, intranet, posters, QR codes

**Edit Link:**
- Modify settings after creation
- Update expiration dates
- Change usage limits
- Adjust language options

**Pause Link:**
- Temporarily disable without deleting
- Preserve analytics and history
- Re-enable anytime

**Delete Link:**
- Permanently remove link
- Past submissions remain in system
- Cannot be undone
- Confirmation required

**View Analytics:**
- Submissions received through this link
- Usage trends over time
- Geographic/department breakdown
- Conversion rates

### Link Status Indicators

**=� Active:**
- Link is live and accepting submissions
- Within usage limits
- Not expired

**=� Paused:**
- Temporarily disabled by admin
- Can be reactivated
- Displays "Temporarily Unavailable" message

**=4 Expired:**
- Past expiration date
- Can be manually reactivated
- Past submissions accessible

**� Limit Reached:**
- Maximum submissions received
- Auto-disabled
- Can increase limit to reactivate

## Testing Links

### Link Tester Tool

**Built-In Testing:**
Before sharing links widely, test functionality.

**How to Test:**

1. Navigate to **Link Generator**
2. Find your link in the list
3. Click **Test Link** button
4. Opens in new tab/window
5. Verify:
   - Correct language displays
   - Department pre-filled (if configured)
   - Welcome message appears correctly
   - Form loads properly
   - Branding is correct

**Test Submission:**
- Can make test submissions
- Flagged as "Test" in system
- Easy to identify and delete
- Don't count toward usage limits

## Distribution Methods

### Digital Distribution

**Email:**
```
Subject: New Anonymous Reporting Portal

We've launched a secure, anonymous whistleblowing portal.
Report concerns at: https://yourorg.disclosurely.com/report

All reports are confidential and investigated promptly.
```

**Intranet:**
- Add link to company intranet homepage
- Create dedicated ethics page
- Link from HR resources

**Employee Portal:**
- Integrate into HRIS or employee self-service
- Add to digital onboarding materials

**Instant Messaging:**
- Slack workspace announcement
- Microsoft Teams message
- Internal chat platforms

### Physical Distribution

**QR Codes:**
1. Click **Generate QR Code** next to link
2. Download high-resolution PNG
3. Print on:
   - Posters (breakrooms, hallways)
   - Employee badges
   - Desk placards
   - Bathroom stalls

**Printed Materials:**
- Employee handbooks
- Code of conduct booklets
- Policy manuals
- Orientation packets
- Payroll inserts

**Signage:**
- Office posters
- Factory floor signs
- Warehouse bulletin boards
- Reception areas

### Multi-Channel Strategy

**Best Practice:**
Distribute link through multiple channels for maximum awareness.

**Recommended Channels:**
1. Email announcement (primary)
2. Intranet/portal integration (permanent access)
3. QR code posters (physical locations)
4. Manager communication (team meetings)
5. Training sessions (onboarding, annual ethics training)

## Use Case Examples

### Example 1: Department-Specific Portal

**Scenario:** Finance department wants dedicated reporting channel.

**Configuration:**
- **Name:** "Finance Department Hotline"
- **Department:** Pre-filled as "Finance"
- **Auto-Assignment:** CFO or Audit Committee
- **Categories:** Limit to Financial Misconduct, Conflicts of Interest
- **Languages:** English, Spanish (for diverse workforce)

**URL:**
```
https://yourorg.disclosurely.com/report?dept=finance
```

**Benefits:**
- Auto-routes to appropriate investigators
- Tracks finance-specific trends
- Simplified category selection
- Department ownership of ethics

### Example 2: Time-Limited Campaign

**Scenario:** Annual ethics awareness week.

**Configuration:**
- **Name:** "Ethics Week 2024"
- **Expiration:** 7 days (duration of campaign)
- **Custom Message:** "During Ethics Week, we encourage all employees to speak up..."
- **Tracking:** Campaign analytics enabled

**Benefits:**
- Measures campaign effectiveness
- Temporary spike handling
- Auto-expires after event
- Dedicated tracking

### Example 3: Multi-Language Regional Portals

**Scenario:** Global company with regional operations.

**Configuration:**

**EMEA Portal:**
- Languages: English, French, German, Polish
- Default: English
- Department: Pre-filled as "EMEA"

**LATAM Portal:**
- Languages: Spanish, Portuguese
- Default: Spanish
- Department: Pre-filled as "LATAM"

**APAC Portal:**
- Languages: English, simplified translations
- Default: English
- Department: Pre-filled as "APAC"

**Benefits:**
- Region-appropriate languages
- Cultural sensitivity
- Geographic tracking
- Localized compliance

### Example 4: Third-Party Contractor Access

**Scenario:** Temporary contractors need reporting access.

**Configuration:**
- **Name:** "Contractor Portal - Q1 2024"
- **Expiration:** 90 days (contract duration)
- **Usage Limit:** 50 submissions
- **Custom Message:** "For contractors and temporary workers..."
- **Assignment:** Vendor management team

**Benefits:**
- Automatic expiration
- Limited capacity
- Separate from employee portal
- Vendor management oversight

## Analytics and Reporting

### Link Performance Metrics

**Submissions by Link:**
- Track which links receive most submissions
- Measure campaign effectiveness
- Identify popular channels

**Conversion Rates:**
- Link views vs. submissions
- Engagement measurement
- Optimize distribution strategy

**Geographic Distribution:**
- Where submissions originate
- Regional trends
- Location-based patterns

**Time-Based Analysis:**
- Peak submission times by link
- Seasonal patterns
- Campaign timing optimization

### Export Link Analytics

**Available Exports:**
- CSV: Raw data for analysis
- PDF: Formatted report with charts
- Excel: Detailed breakdown with pivot tables

**Metrics Included:**
- Link name and configuration
- Total submissions
- Submissions over time
- Department breakdown
- Category distribution
- Language usage

## Best Practices

### Link Naming Conventions

 **Use descriptive names:**
- L Bad: "Link 1", "New Link", "Test"
-  Good: "HR Department Portal", "Spanish LATAM", "Q4 Ethics Campaign"

 **Include purpose or audience:**
- "Finance - SOX Reporting"
- "Contractors - Vendor Ethics"
- "All Staff - General Hotline"

 **Add date for time-limited links:**
- "Annual Training - 2024"
- "Q1 Campaign - Jan-Mar"
- "Contractor Access - Spring 2024"

### Security Considerations

 **Limit link sharing:**
- Only distribute to intended audience
- Avoid public posting
- Use password protection if needed

 **Regular audits:**
- Review active links quarterly
- Delete unused links
- Update expiration dates
- Monitor for misuse

 **Access controls:**
- Limit who can create links (Admin+ role)
- Log all link creation and modifications
- Alert on suspicious link usage

### Link Hygiene

 **Clean up old links:**
- Delete expired links regularly
- Archive campaign links post-completion
- Keep active list manageable

 **Monitor usage:**
- Set email alerts for unusual activity
- Track zero-submission links (not being used)
- Adjust limits based on actual usage

 **Update configurations:**
- Refresh expiration dates for ongoing links
- Adjust language options as needed
- Update auto-assignment as team changes

## Troubleshooting

**Link not working?**
- Check if link is paused or expired
- Verify usage limit not reached
- Ensure correct URL copied
- Test in incognito/private browsing mode

**Wrong language displaying?**
- Verify language is enabled in link settings
- Check browser language settings (may auto-detect)
- Update default language in configuration

**Reports not auto-assigning?**
- Confirm auto-assignment rule is configured
- Verify assigned user has appropriate role
- Check for conflicting assignment rules
- Review assignment rule logs

**QR code not scanning?**
- Ensure sufficient size (minimum 2x2 inches)
- Check printer quality
- Verify adequate contrast
- Test with multiple QR reader apps

**Analytics not showing submissions?**
- Allow 24 hours for data processing
- Verify date range selection
- Check filter settings
- Ensure you have analytics permissions

## Related Pages

- [Organization Settings](/docs/admin/organization-settings) - General org configuration
- [Custom Domains](/docs/admin/custom-domains) - Branded domain setup
- [Custom Branding](/docs/admin/custom-branding) - Visual customization
- [Team Management](/docs/admin/team-management) - User assignments
- [Assignment Rules](/docs/features/assignment-rules) - Auto-routing configuration

## Support

Questions about link management?
- Email: support@disclosurely.com
- [Contact Support](/docs/support/contact)
- [Video Tutorial](https://disclosurely.com/tutorials/link-generator)
