---
title: Draft Management - Save & Resume Reports | Disclosurely
description: Save partially completed whistleblowing reports as drafts, resume from any device using draft codes, automatic 30-day expiration, and secure cross-device access.
head:
  - - meta
    - property: og:title
      content: Draft Management - Save & Resume Reports | Disclosurely
  - - meta
    - property: og:description
      content: Save partially completed whistleblowing reports as drafts, resume from any device using draft codes, automatic 30-day expiration, and secure cross-device access.
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
      content: Draft Management - Disclosurely
  - - meta
    - name: twitter:description
      content: Save partially completed whistleblowing reports as drafts, resume from any device using draft codes, automatic 30-day expiration, and secure cross-device access.
  - - meta
    - name: twitter:image
      content: https://disclosurely.com/docs/ogimage.png
---

# Draft Management

Save partially completed reports as drafts and resume from any device using secure draft codes—ensuring reporters never lose their progress.

## Overview

Draft Management allows whistleblowers to save incomplete reports and return to finish them later, even from different devices. This is especially valuable for complex reports requiring evidence gathering, witness consultation, or simply more time to compose thoughtful allegations.

**Access:** Available during [report submission](/docs/reporting/how-to-submit) process

## How Draft Saving Works

### Saving a Draft

**During Report Submission:**

At any point while filling out a report, reporters can save their progress:

1. Click **"Save Draft"** button (visible on all form steps)
2. System immediately saves all entered information
3. Unique draft code is generated (format: DFT-XXXXXXXX)
4. Reporter can copy code or receive it via optional email
5. Draft stored securely for 30 days

**What Gets Saved:**
- Report title and description
- Selected category and priority
- Incident date, time, and location
- Uploaded evidence files
- Witness information
- All custom field entries
- Current form step/progress

**What Doesn't Get Saved:**
- Reporter contact information (for anonymous reports)
- Temporary session data
- Browser-specific settings

### Automatic Draftsaving

**Auto-Save Feature:**

For reporter convenience, drafts are automatically saved every 2 minutes while composing:

**Behavior:**
- Silent background saving (no interruption)
- Visual indicator: "Draft auto-saved at [time]"
- Uses same draft code if already generated
- Creates new draft code if first auto-save
- Continues until reporter submits or abandons form

**Benefits:**
- Protection against browser crashes
- Prevents data loss from network issues
- Reduces reporter frustration
- Encourages thorough reporting

**Disable Auto-Save:**
Reporters can disable auto-save in form settings if preferred (not recommended).

### Draft Codes

**Format:** DFT-XXXXXXXX (e.g., DFT-K7M9P2N5)

**Characteristics:**
- Unique 8-character alphanumeric code
- Case-insensitive (DFT-ABC123 = dft-abc123)
- Cryptographically random (cannot be guessed)
- Single-use after submission
- No personal information encoded

**Security:**
- Treat like a password—anyone with code can access draft
- Not stored in browser history
- Encrypted in transit and at rest
- Cannot be recovered if lost

## Resuming a Draft

### How to Resume

**From Any Device:**

1. Navigate to reporting portal
2. Click **"Resume Draft"** link
3. Enter draft code (DFT-XXXXXXXX)
4. Click **"Load Draft"**
5. Form restores to exact state when saved
6. Continue editing and submit when ready

**Direct Link:**
```
https://yourorg.disclosurely.com/resume-draft
```

**Alternative Access Points:**
- From reporting form: "Have a draft code? Resume here"
- From email notification (if email provided)
- From SMS (if phone number provided, Pro plan)

### Draft Validation

**When Resuming:**

System performs several validation checks:

**Code Validation:**
- Verifies code format is correct
- Confirms code exists in system
- Checks draft hasn't expired
- Ensures draft not already submitted

**Security Checks:**
- Rate limiting (3 attempts per 15 minutes)
- CAPTCHA after 2 failed attempts
- IP-based abuse detection
- Temporary lockout after 5 failed attempts

**Expiration Check:**
- Drafts valid for 30 days from creation
- Expired drafts cannot be resumed
- Warning shown 7 days before expiration (if email provided)

### Multi-Device Support

**Cross-Device Access:**

Drafts can be resumed from any device:

**Supported Platforms:**
- Desktop (Windows, Mac, Linux)
- Mobile (iOS, Android)
- Tablets (iPad, Android tablets)
- Any modern web browser

**Automatic Syncing:**
- Changes saved in real-time
- No manual sync required
- Always access latest version
- Concurrent editing not supported (last save wins)

**Use Cases:**
- Start on work computer, finish on personal device
- Begin on mobile, complete on desktop
- Share draft code with witness for collaborative reporting
- Resume after network interruption

## Draft Expiration

### 30-Day Retention Period

**Automatic Expiration:**

Drafts are automatically deleted 30 days after creation:

**Why 30 Days:**
- Balances convenience with security
- Prevents indefinite storage of incomplete reports
- Encourages timely reporting
- Reduces data storage and privacy risks

**Expiration Process:**
1. Draft created on Day 0
2. Daily expiration checks run at midnight UTC
3. Email warning sent on Day 23 (if email provided)
4. Final reminder on Day 28
5. Draft deleted on Day 30
6. Draft code becomes invalid

**After Expiration:**
- Draft code no longer works
- All saved data permanently deleted
- Cannot be recovered
- Reporter must start new report

### Extending Draft Expiration

**Not Currently Supported:**

Draft expiration cannot be extended beyond 30 days.

**Workaround:**
- Save important details externally (notes app, document)
- Submit draft before expiration
- Start new draft if needed

**Future Enhancement:**
Considering adding draft extension feature for complex investigations.

## Draft Security & Privacy

### Encryption

**End-to-End Encryption:**

Drafts receive same security as submitted reports:

**Encryption Details:**
- AES-256 encryption at rest
- TLS 1.3 for data in transit
- Encrypted before leaving reporter's device
- Zero-knowledge architecture—server cannot decrypt without code

**Learn More:** [Report Encryption](/docs/reporting/encryption)

### Access Control

**Who Can Access Drafts:**

**✅ Reporter (with draft code):**
- Can view and edit draft
- Can submit draft
- Can abandon draft

**❌ Organization Administrators:**
- Cannot see drafts
- Cannot access draft content
- Cannot retrieve draft codes

**❌ Disclosurely Staff:**
- No access to draft data
- Cannot recover lost draft codes
- Cannot extend expiration

**❌ Third Parties:**
- No access under any circumstances
- Not shared with law enforcement
- Not subject to subpoena (not submitted yet)

### Lost Draft Codes

**Cannot Be Recovered:**

If a reporter loses their draft code, it cannot be retrieved:

**Why:**
- No personal information links reporter to draft
- Zero-knowledge architecture prevents recovery
- Security by design—protects reporter anonymity

**Prevention:**
- Copy draft code immediately when generated
- Save in password manager
- Email to personal account (if comfortable)
- Screenshot or write down code
- Multiple save locations recommended

**If Lost:**
- Reporter must start new report
- Previous draft will auto-expire in 30 days
- No security breach—draft remains encrypted

## Managing Multiple Drafts

### Creating Multiple Drafts

**Reporters Can Have:**
- Unlimited drafts simultaneously
- Each with unique draft code
- Different stages of completion
- Separate 30-day expiration timers

**Use Cases:**
- Multiple unrelated incidents to report
- Different categories requiring separate reports
- Collaborative reporting (share code with co-reporter)
- Testing submission process before final report

### Distinguishing Drafts

**No Built-In Draft Management:**

System doesn't track drafts per reporter (by design for anonymity).

**Reporter Best Practices:**
- Label draft codes in notes app (e.g., "Harassment Draft - DFT-ABC123")
- Maintain personal spreadsheet of draft codes
- Email drafts to self with descriptive subjects
- Use password manager with tags

### Consolidating Drafts

**Not Supported:**

Cannot merge multiple drafts into single report.

**Workaround:**
- Copy/paste between drafts manually
- Complete one draft fully
- Reference other draft codes in "Additional Information" section

## Draft Analytics (Admin View)

### Organizational Insights

**Administrators Can See:**

Aggregated draft statistics (no individual draft access):

**Metrics Available:**
- Total drafts created
- Active drafts (not expired, not submitted)
- Draft submission rate (drafts → reports)
- Average time from draft creation to submission
- Draft abandonment rate
- Average draft completion percentage

**Use Cases:**
- Understand reporter behavior
- Identify friction in reporting process
- Optimize form complexity
- Measure campaign effectiveness

**Access:** Dashboard > Analytics > Drafts

**Privacy:**
- No access to draft content
- No reporter identification possible
- Aggregate data only
- Complies with [GDPR](/docs/compliance/gdpr) and privacy regulations

### Improving Form Design

**Using Draft Data:**

Analyze where reporters abandon drafts:

**Common Patterns:**
- High abandonment on Step 6 → simplify that step
- Low submission rate → form too complex
- Long draft-to-submission time → consider multi-part form

**Actions:**
- Reduce required fields
- Clarify confusing questions
- Break long steps into smaller parts
- Add more helpful tooltips
- Improve mobile experience

## Best Practices for Reporters

### When to Save a Draft

✅ **Good Reasons to Save:**
- Need to gather additional evidence (documents, photos)
- Want to consult with colleague or witness
- Require time to recall specific dates/details
- Prefer to compose thoughtfully over multiple sessions
- Concerned about browser crashes or network issues
- Need to submit from different device for privacy

❌ **When Not to Save:**
- Report is essentially complete (just submit it!)
- Only minor details missing (better to submit and add via messaging)
- Concerns about draft expiration (30 days is firm)

### Protecting Your Draft Code

✅ **Do:**
- Copy code immediately when generated
- Save in multiple secure locations
- Use password manager for storage
- Email to personal account (if safe to do so)
- Write down code and store securely

❌ **Don't:**
- Share code publicly or with untrusted parties
- Save in work email (if reporting work-related issues)
- Post to social media or public forums
- Store in unsecured cloud storage
- Rely on browser autofill alone

### Completing Drafts

✅ **Tips for Completion:**
- Set personal deadline before 30-day expiration
- Block time to finish comprehensively
- Review all fields before submitting
- Attach all relevant evidence
- Proofread descriptions for clarity
- Use [secure messaging](/docs/reporting/secure-messaging) for follow-ups after submission

## Troubleshooting

### Draft Code Not Working

**Possible Causes:**

1. **Incorrect Code Format**
   - Verify format: DFT-XXXXXXXX
   - Check for typos or extra spaces
   - Confirm case (code is case-insensitive)

2. **Expired Draft**
   - Drafts expire after 30 days
   - Check creation date if known
   - No recovery possible—start new report

3. **Already Submitted**
   - Draft codes deactivate after submission
   - Check [report tracking](/docs/reporting/tracking-report) with report ID instead

4. **Rate Limiting**
   - Too many failed attempts trigger lockout
   - Wait 15 minutes and try again
   - Contact support if persistent issues

### Draft Not Saving

**Troubleshooting Steps:**

1. **Check Internet Connection**
   - Verify stable connection
   - Try refreshing page
   - Reconnect to WiFi if needed

2. **Browser Issues**
   - Clear browser cache
   - Disable ad blockers temporarily
   - Try incognito/private mode
   - Update browser to latest version

3. **Storage Quota**
   - Organization may have draft limits (rare)
   - Contact support if draft save fails repeatedly

### Lost Draft Code

**Unfortunately Cannot Be Recovered:**

As stated earlier, lost draft codes cannot be retrieved due to zero-knowledge architecture.

**Next Steps:**
1. Start new report with fresh draft code
2. Reference details from memory or external notes
3. Implement better code management going forward
4. Consider using password manager

### Draft Shows Outdated Information

**Caching Issue:**

Browser may show cached version:

**Solutions:**
1. Hard refresh page (Ctrl+F5 or Cmd+Shift+R)
2. Clear browser cache
3. Use incognito/private browsing mode
4. Try different browser

**If Persists:**
- Data may not have saved previously
- Check "Last saved" timestamp
- Contact support with draft code for investigation

## Related Features

### After Submitting Draft

**Convert to Report:**

When draft is submitted, it becomes a full report:

**What Happens:**
1. Draft code deactivates
2. Report ID generated (DIS-XXXXXXXX format)
3. Draft automatically deleted
4. Confirmation screen displays report ID
5. Email/SMS sent with tracking info (if provided)

**Next Steps:**
- Save report ID for [tracking](/docs/reporting/tracking-report)
- Use [secure messaging](/docs/reporting/secure-messaging) for follow-ups
- Monitor status updates
- Await investigation

**Learn More:** [How to Submit a Report](/docs/reporting/how-to-submit)

### Draft vs. Report Tracking

**Key Differences:**

| Feature | Draft (DFT-XXX) | Report (DIS-XXX) |
|---------|----------------|------------------|
| Status | Incomplete | Submitted |
| Expiration | 30 days | Never (until archived) |
| Editable | Yes | No (use messaging) |
| Organization Access | No | Yes |
| Tracking | No | Yes |
| Messaging | No | Yes |

### Anonymous Draft Management

**Maintaining Anonymity:**

**If Submitting Anonymously:**
- Don't provide email when saving draft
- Don't save draft code in work systems
- Use personal/private device for resuming
- Clear browser history after submission
- Consider VPN for additional privacy

**Learn More:** [Anonymous Reporting](/docs/features/anonymous-reporting)

## Administrator Settings

### Draft Configuration

**Administrators Can Configure:**

**Draft Retention Period:**
- Default: 30 days
- Range: 7-90 days
- Custom per organization

**Auto-Save Settings:**
- Enable/disable auto-save
- Auto-save frequency (1-10 minutes)
- Default on or off for reporters

**Draft Limits:**
- Maximum drafts per IP (abuse prevention)
- Storage quota for drafts
- Rate limiting configuration

**Access:** Dashboard > Settings > Reporting > Draft Settings

### Disabling Drafts

**Organizations Can Disable:**

If draft functionality not desired:

**Settings > Reporting > Draft Management:**
- Toggle "Allow Draft Saving" to OFF
- Hides "Save Draft" button from forms
- Existing drafts remain accessible until expiration
- Can re-enable anytime

**Reasons to Disable:**
- Encourage immediate reporting
- Reduce storage costs
- Simplify reporting process
- Organizational policy requirements

## Privacy & Compliance

### GDPR Compliance

**Draft Data Handling:**

Drafts are personal data subject to GDPR:

**Compliance Measures:**
- Data minimization (only save necessary fields)
- Purpose limitation (drafts for reporting only)
- Storage limitation (30-day automatic deletion)
- Encryption at rest and in transit
- No unnecessary processing

**Data Subject Rights:**
- Cannot exercise rights on drafts (anonymous, no link to identity)
- Rights apply to submitted reports only

**Learn More:** [GDPR Compliance](/docs/compliance/gdpr)

### Data Retention

**Automatic Deletion:**

Drafts deleted automatically after 30 days:

**No Exceptions:**
- Even if reporter requests extension
- Even for high-priority incidents
- Consistent application across all drafts

**Retention Policy:**
- Aligns with [data retention policies](/docs/compliance/retention)
- Minimizes privacy risks
- Reduces storage requirements

## Related Pages

- [How to Submit a Report](/docs/reporting/how-to-submit) - Complete reporting guide
- [Tracking Your Report](/docs/reporting/tracking-report) - Report status lookups
- [Anonymous Reporting](/docs/features/anonymous-reporting) - Anonymous submission
- [Secure Messaging](/docs/reporting/secure-messaging) - Communication after submission
- [Report Encryption](/docs/reporting/encryption) - Security details

## Support

Questions about draft management?
- [Contact Support](/docs/support/contact)
- [FAQs](/docs/support/faqs)
- Email: support@disclosurely.com
