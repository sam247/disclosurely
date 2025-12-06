---
title: Status Management - Disclosurely Case Tracking Guide
description: Track investigation progress with status updates from New to Resolved. Automate notifications, monitor compliance timeframes, and communicate effectively.
head:
  - - meta
    - property: og:title
      content: Case Status Management & Tracking - Disclosurely
  - - meta
    - property: og:description
      content: Track investigation progress with status updates from New to Resolved. Automate notifications, monitor compliance timeframes, and communicate effectively.
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
      content: Status Management - Disclosurely
  - - meta
    - name: twitter:description
      content: Track investigation progress with status updates from New to Resolved. Automate notifications, monitor compliance timeframes, and communicate effectively.
  - - meta
    - name: twitter:image
      content: https://disclosurely.com/docs/ogimage.png
---

# Status Management

Track and communicate investigation progress through clear, meaningful status updates.

## Overview

Case status is the single most important indicator of where a case is in the investigation lifecycle. Proper status management helps:

- **Reporters** understand what's happening with their case
- **Investigators** track workload and priorities
- **Administrators** monitor compliance with timeframes
- **Executives** get high-level visibility into investigations

## Available Statuses

### New

**Meaning**: Report just submitted, not yet reviewed by investigator

**Automatic**: Set automatically when report submitted

**Duration**: Should be brief (minutes to hours, not days)

**Actions**:
- System sends acknowledgment to reporter
- Case appears in "Unassigned" queue
- Assignment rules trigger (if configured)
- Compliance clock starts

**Reporter Sees**: "Your report has been received and will be reviewed shortly."

### Under Review

**Meaning**: Initial assessment in progress

**Typical Duration**: 1-3 days

**Investigator Actions**:
- Read report thoroughly
- Assess severity and credibility
- Determine [investigation scope](/cases/workflow)
- Request additional information if needed
- Categorize and prioritize

**Reporter Sees**: "Your report is being reviewed by our team. We'll begin investigating shortly."

**Best Practice**: Move to this status within 24 hours of receipt to show reporter their concern is being taken seriously.

### Investigating

**Meaning**: Active evidence gathering and investigation underway

**Typical Duration**: 2-8 weeks (depending on complexity)

**Investigator Actions**:
- Interviewing witnesses
- Collecting documentary evidence
- Reviewing records and communications
- Analyzing findings
- [Documenting progress in case notes](/cases/evidence)

**Reporter Sees**: "We are actively investigating your report. We'll keep you updated on progress."

**Updates**: Provide periodic updates to reporter every 1-2 weeks even if just to say "investigation ongoing."

### Pending Information

**Meaning**: Investigation paused awaiting additional information

**Typical Duration**: Days to weeks (set deadline for response)

**When to Use**:
- Waiting for reporter to provide details
- Awaiting witness availability
- Requesting records from external party
- Waiting for legal/HR review
- Third party investigation ongoing

**Investigator Actions**:
- Send clear request for information via [secure messaging](/reporting/secure-messaging)
- Specify what's needed and why
- Set reasonable deadline
- Set reminder to follow up
- Continue other investigation activities if possible

**Reporter Sees**: "We need some additional information from you to continue. Please check your messages."

**Best Practice**:
- Be specific about what you need
- Explain why it's important
- Give reasonable timeframe (7-14 days typical)
- Send reminder 2 days before deadline

### Under Analysis

**Meaning**: Evidence gathered, now analyzing findings and forming conclusions

**Typical Duration**: 1-2 weeks

**Investigator Actions**:
- Reviewing all evidence collected
- Determining if allegations substantiated
- Considering mitigating factors
- Using AI Case Helper for pattern analysis
- Drafting preliminary findings
- Preparing for subject interview

**Reporter Sees**: "We have gathered evidence and are now analyzing our findings."

**Note**: This status signals you're approaching resolution, which helps manage reporter expectations.

### Subject Response

**Meaning**: Subject has been presented with allegations and given opportunity to respond

**Typical Duration**: 1-2 weeks

**Investigator Actions**:
- Prepare subject interview
- Present allegations to subject
- Allow response and rebuttal
- Collect any additional evidence from subject
- Re-evaluate findings in light of response
- Ensure procedural fairness

**Reporter Sees**: "Our investigation is in its final stages. We'll have a resolution soon."

**Privacy Note**: Never reveal to reporter that you're in "subject response" phase by name - use general language like "final stages."

### Resolved

**Meaning**: Investigation complete, conclusions reached, actions determined

**Typical Duration**: Permanent (or until reopened)

**Investigator Actions**:
- Finalize investigation report
- Implement recommendations
- Communicate outcome to reporter
- Communicate to subject
- Update stakeholders
- Document lessons learned

**Reporter Sees**:
- Summary of findings
- Whether allegations substantiated
- What action was taken (in general terms)
- Thank you for reporting

**Required**: Must provide feedback to reporter within regulatory timeframes (3-6 months depending on jurisdiction).

### Closed

**Meaning**: Case archived, all actions complete, no further activity expected

**When to Use**:
- All recommendations implemented
- All follow-up complete
- No appeals pending
- Retention period begins

**Investigator Actions**:
- Final audit check
- Archive all evidence
- Generate compliance reports
- Remove from active caseload

**Reporter Sees**: "This case is now closed. Thank you for reporting."

**Note**: Closed cases are read-only but can be reopened if new information emerges.

### On Hold

**Meaning**: Investigation temporarily suspended

**When to Use**:
- Parallel external investigation (police, regulator)
- Legal proceedings underway
- Subject on extended leave
- Organizational restructuring
- Awaiting policy clarification
- Resource constraints (should be rare)

**Investigator Actions**:
- Document reason for hold
- Set review date
- Monitor triggering situation
- Keep reporter informed
- Resume when appropriate

**Reporter Sees**: "Your case investigation is temporarily on hold due to [reason]. We will resume when [condition]."

**Best Practice**: Avoid using this status unless absolutely necessary. Sets concerning message that investigation isn't a priority.

### Withdrawn

**Meaning**: Reporter requested to withdraw report

**When to Use**:
- Reporter explicitly requests withdrawal
- Reporter cannot be contacted (after multiple attempts)
- Report determined to be duplicate

**Process**:
1. Reporter submits withdrawal request
2. Investigator evaluates if investigation should continue anyway
3. If proceeding anyway, change status to "Investigating" and note withdrawal request
4. If honoring withdrawal, change to "Withdrawn" and document

**Important**: Some allegations must be investigated even if reporter withdraws (e.g., safety risks, serious misconduct, legal violations).

**Reporter Sees**: "As requested, we have withdrawn your report. You can submit a new report anytime."

## Changing Status

### Manual Status Changes

1. **Open Case**
   - Navigate to case detail page

2. **Change Status**
   - Click current status dropdown at top
   - Select new status from list
   - Status changes immediately

3. **Add Status Note**
   - Modal appears: "Why are you changing status?"
   - Add brief explanation
   - Note appears in case timeline
   - Helps with audit trail

4. **Automatic Notifications**
   - Reporter notified of status change
   - Assigned investigator notified
   - Stakeholders notified (if configured)

### Bulk Status Changes

Change status for multiple cases:

1. **Select Cases**
   - Go to Cases dashboard
   - Use checkboxes to select multiple cases
   - Can select up to 50 at once

2. **Bulk Action**
   - Click "Bulk Actions" > "Change Status"
   - Select new status
   - Add note (applied to all selected cases)
   - Confirm change

3. **Notifications**
   - All reporters notified
   - Useful for mass updates (e.g., moving cases to "On Hold" during office closure)

**Use Case**:
- Moving group of related cases forward together
- Batch processing of simple cases
- Organization-wide events affecting multiple cases

### Automated Status Changes

Configure automatic status progression:

**Inactivity Rules**:
- "Pending Information" > 30 days → Send reminder
- "Pending Information" > 60 days → Move to "Withdrawn"
- "Investigating" > 90 days → Alert supervisor

**Activity-Based**:
- Reporter sends message → "Pending Information" to "Investigating"
- Investigation report uploaded → "Under Analysis" to "Resolved"
- All evidence reviewed → "Investigating" to "Under Analysis"

**Configure in Settings**:
- Dashboard > Organization Settings
- "Automation Rules"
- Set triggers and actions
- Test before activating

## Status Notifications

### What Reporters See

**Automatic Messages**:

- **New → Under Review**: "Your report is being reviewed"
- **Under Review → Investigating**: "We've begun investigating your report"
- **Investigating → Pending Information**: "We need more information from you"
- **Pending Information → Investigating**: "Thank you, investigation continuing"
- **Any → Resolved**: "Investigation complete" + outcome summary
- **Resolved → Closed**: "Case closed, thank you"

**Customization**:
- Edit default messages in Settings
- Add organization-specific language
- Translate for different languages
- Include contact information
- Add expected next steps

### Internal Notifications

**Investigators Notified When**:
- Case assigned to them
- Reporter sends message
- Status changed by another user
- Case approaching deadline
- Supervisor adds comment
- Evidence uploaded by reporter

**Administrators Notified When**:
- Cases exceed timeframe thresholds
- High-priority cases submitted
- Cases require escalation
- Compliance deadlines approaching

**Configure Notifications**:
- Email, in-app, SMS, Slack/Teams
- Set frequency (immediate, daily digest, weekly)
- Choose what triggers notification
- Quiet hours for non-urgent alerts

## Status Reports & Analytics

### Dashboard Metrics

**Overview**:
- Cases by current status (pie chart)
- Status distribution over time (trend)
- Average time in each status
- Cases stuck in status > threshold

**Filtering**:
- By date range
- By category
- By priority
- By assigned investigator
- By department

### Status Flow Analysis

**Understand patterns**:
- Which statuses take longest?
- Where do cases get stuck?
- Are you skipping statuses inappropriately?
- Do cases bounce between statuses?

**Common Issues**:
- Too many "Pending Information" - improve initial intake?
- Long "Under Review" time - assign faster?
- Quick "Investigating" - thorough enough?
- Many "On Hold" - resource issue?

### Compliance Monitoring

**Track Regulatory Timeframes**:
- 7-day acknowledgment (EU Directive)
- 3-month feedback requirement (EU Directive)
- Industry-specific deadlines

**Alerts**:
- Cases approaching deadlines
- Cases past deadlines
- Cases at risk of missing deadlines

**Reports**:
- Compliance rate by month
- Cases meeting/missing deadlines
- Average resolution time
- Breakdown by category

## Best Practices

### Update Status Regularly

**Why**:
- Keeps reporter informed
- Maintains engagement
- Demonstrates progress
- Supports accountability

**How Often**:
- Change status when investigation phase changes
- Add status note every 1-2 weeks minimum
- Provide updates even if "still investigating"

### Use Status Notes

Every status change should include note:

**Good Status Notes**:
- "Moving to Investigating. Have gathered initial evidence and scheduled witness interviews for next week."
- "Now in Under Analysis. All evidence collected, reviewing findings before subject interview."
- "Moved to Pending Information. Requested additional details from reporter about timeline of events."

**Poor Status Notes**:
- "Status change"
- "Updated"
- (no note)

### Be Honest with Timeline

**If investigation taking longer than expected**:
- Update status to reflect reality
- Send message to reporter explaining
- Give new expected timeframe
- Apologize for delay
- Explain reason if appropriate

**Don't**:
- Leave status unchanged hoping to finish soon
- Make up reasons for delay
- Go silent on reporter
- Blame reporter for delays

### Match Status to Reality

**Status should accurately reflect what's happening**:

**Don't**:
- Mark "Investigating" if you haven't started yet
- Use "Pending Information" to hide inactivity
- Jump to "Resolved" before actions complete
- Keep in "Under Review" for weeks

**Do**:
- Update status when investigation phase actually changes
- Use "On Hold" honestly if paused
- Communicate realistic expectations
- Keep stakeholders informed

### Coordinate Status with Team

**If working with multiple investigators**:
- Agree who updates status
- Communicate before changing
- Don't contradict teammate's updates
- Use internal notes for coordination

**For team-assigned cases**:
- Team lead manages status
- Team members add notes
- Coordinate before major status changes

## Troubleshooting

### Reporter Confused by Status

**If reporter messages asking what status means**:
- Explain in plain language
- Tell them what's happening now
- Tell them what happens next
- Give expected timeframe
- Offer to answer questions

**Consider**: Your status messages may be too technical. Review and simplify.

### Status Not Updating

**Check**:
- Do you have permission to change status?
- Is case already closed? (can't change)
- Browser cache issue? (refresh)
- Integration error? (check logs)

### Notifications Not Sending

**Verify**:
- Reporter's tracking ID valid
- Notification settings enabled
- Email address correct (confidential reports)
- No system-wide notification issue
- Check spam folder

### Wrong Status Set

**If status changed by mistake**:
- Change back immediately
- Add status note explaining
- Send message to reporter if they were notified
- Document in case notes

---

**Related:**
- [Investigation Workflow](/cases/workflow)
- [Case Assignment](/cases/assignment)
- [Secure Messaging](/reporting/secure-messaging)
