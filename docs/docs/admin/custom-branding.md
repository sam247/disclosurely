---
title: Custom Branding - Disclosurely White-Label Customization
description: White-label your whistleblowing portal with custom logos, colors, and messaging. Create a branded reporting experience matching your organization's identity.
head:
  - - meta
    - property: og:title
      content: Custom Branding & White-Label Portal - Disclosurely
  - - meta
    - property: og:description
      content: White-label your whistleblowing portal with custom logos, colors, and messaging. Create a branded reporting experience matching your organization's identity.
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
      content: Custom Branding - Disclosurely
  - - meta
    - name: twitter:description
      content: White-label your whistleblowing portal with custom logos, colors, and messaging. Create a branded reporting experience matching your organization's identity.
  - - meta
    - name: twitter:image
      content: https://disclosurely.com/docs/ogimage.png
---

# Custom Branding

Customize your Disclosurely reporting portal to match your organization's brand identity. Available on Pro and Enterprise plans.

## What Can You Customize?

- **Organization Logo**: Upload your company logo
- **Brand Color**: Set your primary brand color
- **Welcome Message**: Customize the reporting form welcome text
- **Confirmation Message**: Personalize the submission confirmation
- **Status Page Message**: Customize tracking page messaging
- **Email Templates**: Brand your notification emails

## Uploading Your Logo

### Requirements

- **Supported Formats**: PNG, JPG, SVG
- **Maximum File Size**: 2MB
- **Recommended Dimensions**: 200x80 pixels
- **Best Practice**: Use transparent background (PNG)

### Upload Process

1. Navigate to **Settings > Branding**
2. Click **"Upload Logo"**
3. Select your logo file
4. Preview how it appears
5. Click **"Save"**

Your logo will appear:
- On the reporting form header
- In email notifications  
- On the status tracking page
- In confirmation messages

## Setting Your Brand Color

Your brand color is used throughout the reporting portal:

- Primary buttons
- Links and highlights
- Form accents
- Email headers

### How to Set Brand Color

1. Go to **Settings > Branding**
2. Click the color picker
3. Enter your hex color code (e.g., #1453DB)
4. Preview the changes
5. Click **"Save"**

**Tip**: Use your official brand color for consistency across all touchpoints.

## Custom Messaging

### Welcome Message

Shown at the top of the reporting form. Use it to:
- Reassure reporters about confidentiality
- Explain what can be reported
- Set expectations for the process

**Example**:
```
Your voice matters. Report concerns securely and anonymously.
All reports are treated confidentially and investigated thoroughly.
```

### Confirmation Message

Displayed after successful report submission. Include:
- Thank you message
- Next steps
- Expected timeline  
- How to track status

**Example**:
```
Thank you for speaking up. Your report has been received and will
be reviewed within 24 hours. You can track its status using your
tracking ID: {{TRACKING_ID}}
```

### Status Page Message

Shown on the tracking page. Explain:
- How to use the tracking system
- What statuses mean
- How to send messages

**Example**:
```
Use your tracking ID to check report status anytime. You'll receive
updates as your report is reviewed and investigated. Use the messaging
feature below to communicate securely with our team.
```

## Email Template Customization

Customize email templates while maintaining required information:

**Available Templates**:
- New report acknowledgment
- Status update notification
- New message notification
- Assignment notification

**Customization Options**:
- Email subject line
- Header text
- Body content
- Footer text
- Include/exclude logo

**Merge Tags**:
- `{{ORGANIZATION}}` - Your organization name
- `{{TRACKING_ID}}` - Report tracking ID
- `{{STATUS}}` - Current status
- `{{DATE}}` - Report date
- `{{CATEGORY}}` - Report category

## Preview & Testing

Before going live:

1. **Preview**: Use the preview function to see how branding appears
2. **Test Submission**: Submit a test report to see the full experience
3. **Check Emails**: Verify email templates look correct
4. **Mobile Test**: Check how it appears on mobile devices

## Branding Best Practices

✅ **Use high-quality logo** - Clear, professional image
✅ **Match brand guidelines** - Consistent with company branding
✅ **Keep messages concise** - Clear, reassuring, actionable
✅ **Test across devices** - Ensure good appearance on all screens
✅ **Update regularly** - Refresh when brand changes
✅ **Professional tone** - Maintain credibility and trust

## Removing Branding

To remove custom branding:

1. Go to **Settings > Branding**
2. Click **"Remove Logo"** to revert to default
3. Click **"Reset to Default"** for messages
4. Click **"Save"**

Default Disclosurely branding will be restored.

---

**Next Steps:**
- [Custom Domains](/admin/custom-domains)
- [Organization Settings](/admin/organization-settings)
- [Initial Setup](/admin/initial-setup)
