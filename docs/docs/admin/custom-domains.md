---
title: Custom Domains - Disclosurely DNS Configuration Guide
description: Configure custom domains for your whistleblowing portal (reports.yourcompany.com). SSL certificates, DNS setup, and domain verification included automatically.
head:
  - - meta
    - property: og:title
      content: Custom Domain Setup for Whistleblowing - Disclosurely
  - - meta
    - property: og:description
      content: Configure custom domains for your whistleblowing portal (reports.yourcompany.com). SSL certificates, DNS setup, and domain verification included automatically.
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
      content: Custom Domains - Disclosurely
  - - meta
    - name: twitter:description
      content: Configure custom domains for your whistleblowing portal (reports.yourcompany.com). SSL certificates, DNS setup, and domain verification included automatically.
  - - meta
    - name: twitter:image
      content: https://docs.disclosurely.com/ogimage.png
---

# Custom Domains

Use your own domain for your whistleblowing reporting portal. Create a professional, branded experience like reports.yourcompany.com.

**Available on**: Pro and Enterprise plans

## Benefits of Custom Domains

**Professional Appearance**
- Use your own domain (reports.yourcompany.com)
- Builds trust with employees
- Reinforces brand identity
- Shows organizational commitment

**Increased Trust**
- Employees recognize your domain
- Reduces phishing concerns
- Higher submission rates
- Better engagement

**SEO & Analytics**
- Own the web presence
- Track traffic in your analytics
- Control SEO for compliance pages

## Requirements

Before setting up a custom domain:

✅ **Subscription**: Pro or Enterprise plan
✅ **Domain Ownership**: You must own the domain
✅ **DNS Access**: Ability to modify DNS records
✅ **SSL Certificate**: Automatically provided by Disclosurely

## Setup Process

### Step 1: Add Domain in Disclosurely

1. Navigate to **Settings > Custom Domains**
2. Click **"Add Custom Domain"**
3. Enter your desired subdomain:
   - reports.yourcompany.com
   - speakup.yourcompany.com
   - ethics.yourcompany.com
4. Click **"Add Domain"**

### Step 2: Create DNS Records

You'll receive DNS configuration instructions:

**CNAME Record**:
- **Name/Host**: reports (or your chosen subdomain)
- **Value/Points to**: cname.disclosurely.com
- **TTL**: 3600 (or automatic)

**Verification TXT Record** (temporary):
- **Name/Host**: _disclosurely-verify.reports
- **Value**: [unique verification token]
- **TTL**: 3600

### Step 3: Configure DNS Provider

Log into your DNS provider (examples):

**Cloudflare**:
1. Go to DNS settings
2. Add CNAME record
3. Add TXT record for verification
4. Save changes

**GoDaddy**:
1. Navigate to DNS Management
2. Add new CNAME record
3. Add TXT record
4. Save

**Google Domains**:
1. Go to DNS settings
2. Add Custom Resource Records
3. Type: CNAME, TXT
4. Save

### Step 4: Verify Domain

Back in Disclosurely:

1. Click **"Verify Domain"**
2. System checks DNS records
3. Verification usually completes within minutes
4. May take up to 48 hours for DNS propagation

### Step 5: SSL Certificate Provisioning

Once verified:

1. SSL certificate automatically provisioned
2. Takes 5-15 minutes
3. HTTPS automatically enabled
4. Domain goes live

## Domain Status

**Pending Verification**
- DNS records not detected yet
- Check DNS configuration
- Wait for DNS propagation

**Verified**
- DNS records confirmed
- SSL provisioning in progress

**Active**
- SSL certificate issued
- Domain is live
- Reports can be submitted

**Failed**
- Verification failed
- Check DNS records
- Re-verify or contact support

## Managing Domains

### Set Primary Domain

If you have multiple domains:

1. Go to **Settings > Custom Domains**
2. Click **"Set as Primary"** next to desired domain
3. This becomes the default reporting URL

### Remove Domain

To remove a custom domain:

1. Navigate to **Settings > Custom Domains**
2. Click **"Remove"** next to domain
3. Confirm removal
4. Domain stops working immediately
5. Original disclosurely.com link remains active

### Domain Analytics

View domain-specific analytics:

- Visits to custom domain
- Reports submitted via domain
- Geographic distribution
- Referral sources

## Troubleshooting

**Domain not verifying**:
- Check DNS records are correct
- Wait for DNS propagation (up to 48 hours)
- Ensure no conflicting records
- Verify subdomain is correct

**SSL certificate not provisioning**:
- Ensure DNS is fully propagated
- Check for CAA records blocking issuance
- Wait 15-30 minutes
- Contact support if issue persists

**Domain shows error**:
- Check domain status in dashboard
- Verify SSL certificate is active
- Test from different network
- Clear browser cache

## Best Practices

✅ **Use descriptive subdomain**: reports, speakup, ethics, whistleblow
✅ **Communicate the URL**: Share in employee communications
✅ **Update materials**: Change posters, handbooks, emails
✅ **Test thoroughly**: Submit test reports before announcement
✅ **Monitor analytics**: Track usage and engagement

## Multi-Domain Setup (Enterprise)

Enterprise customers can configure multiple domains:

**Use Cases**:
- Different domains per region
- Separate domains per business unit
- Language-specific domains
- Acquisition integration

**Setup**:
1. Add multiple domains via Settings
2. Each gets unique DNS configuration
3. All point to same organization
4. Shared reporting and case management

---

**Next Steps:**
- [Custom Branding](/admin/custom-branding)
- [Organization Settings](/admin/organization-settings)
- [Subscription & Billing](/admin/subscription-billing)
