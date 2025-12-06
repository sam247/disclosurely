---
title: SLA Management - Service Level Agreement Tracking
description: Track response times, monitor compliance, and automatically escalate overdue cases with configurable SLA policies for whistleblowing reports.
head:
  - - meta
    - property: og:title
      content: SLA Management - Disclosurely Workflow Features
  - - meta
    - property: og:description
      content: Track response times, monitor compliance, and automatically escalate overdue cases with configurable SLA policies for whistleblowing reports.
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
      content: SLA Management - Disclosurely
  - - meta
    - name: twitter:description
      content: Track response times, monitor compliance, and automatically escalate overdue cases with configurable SLA policies for whistleblowing reports.
  - - meta
    - name: twitter:image
      content: https://disclosurely.com/docs/ogimage.png
---

# SLA Management

Meet response time commitments and regulatory requirements with powerful SLA (Service Level Agreement) policies. Track compliance, prevent breaches, and automatically escalate overdue cases.

## What is SLA Management?

SLA Management in Disclosurely allows you to set response time targets for different priority levels and automatically monitor compliance. When cases risk breaching SLA targets, the system can escalate to senior handlers or send alerts.

**Key Benefits**:
- **Regulatory Compliance**: Meet EU Whistleblowing Directive timing requirements
- **Accountability**: Track team response times
- **Automatic Escalation**: Overdue cases auto-escalate to leadership
- **Risk Reduction**: Prevent cases from falling through cracks
- **Performance Metrics**: Measure team performance against targets
- **Whistleblower Confidence**: Demonstrate commitment to timely handling

## Understanding SLAs

### What is an SLA?

A Service Level Agreement (SLA) defines expected response times for different priority levels. For whistleblowing:

**Common SLA Targets**:
- **Critical**: 24 hours (1 day)
- **High**: 48 hours (2 days)
- **Medium**: 120 hours (5 days)
- **Low**: 240 hours (10 days)

### Regulatory Requirements

**EU Whistleblowing Directive**:
- Acknowledgment: Within 7 days
- Follow-up: Within 3 months
- Feedback: Regular status updates

**SOX Requirements**:
- Prompt investigation
- Documented timelines
- Audit trail of response times

**Disclosurely SLA Policies help meet these requirements automatically.**

## SLA Policy Components

Each SLA policy includes:

### 1. Policy Name

**Purpose**: Identify and describe the policy
**Examples**:
- "Standard SLA Policy"
- "EU Directive Compliance"
- "High-Risk Cases"
- "Enterprise Standard"

### 2. Response Time Targets (Hours)

Set maximum response times for each priority level:

**Critical Response Time**:
- Time allowed for initial response to critical cases
- Default: 24 hours
- Range: 1-168 hours (1 hour to 7 days)
- Recommendation: 24-48 hours

**High Response Time**:
- Time allowed for initial response to high-priority cases
- Default: 48 hours
- Range: 1-336 hours (1 hour to 14 days)
- Recommendation: 48-72 hours

**Medium Response Time**:
- Time allowed for initial response to medium-priority cases
- Default: 120 hours (5 days)
- Range: 1-720 hours (1 hour to 30 days)
- Recommendation: 5-7 days

**Low Response Time**:
- Time allowed for initial response to low-priority cases
- Default: 240 hours (10 days)
- Range: 1-720 hours (1 hour to 30 days)
- Recommendation: 10-14 days

### 3. Escalation Settings

**Escalate After Breach**:
- Toggle: On or Off
- When enabled: Cases auto-escalate when SLA is breached
- When disabled: Track SLA but no automatic action

**Escalate To User**:
- Select senior team member to receive escalations
- Examples: Director of Compliance, General Counsel, HR Director
- Receives notification when case breaches SLA
- Gains visibility into overdue cases

### 4. Default Policy Flag

**Set as Default**:
- Toggle: On or Off
- Only ONE policy can be default per organization
- Default policy applies to all new cases automatically
- Non-default policies can be manually assigned to specific cases

## Creating SLA Policies

### Accessing SLA Policies

1. Navigate to **Dashboard > Workflows**
2. Click the **SLA Policies** tab
3. Click **Create Policy** button

### Configuration Steps

**Step 1: Name Your Policy**
```
Example: "Standard Enterprise SLA"
```

**Step 2: Set Response Times**
```
Critical:  24 hours (urgent issues)
High:      48 hours (serious issues)
Medium:   120 hours (routine issues)
Low:      240 hours (minor issues)
```

**Step 3: Configure Escalation**
```
☑ Escalate after SLA breach
Escalate to: director@company.com
```

**Step 4: Set as Default (Optional)**
```
☑ Set as default policy
```

**Step 5: Save**
Click "Create Policy" to activate.

## Example SLA Policies

### Example 1: EU Directive Compliance

**Policy Configuration**:
```
Name: EU Whistleblowing Directive
Critical Response: 24 hours
High Response: 48 hours
Medium Response: 168 hours (7 days)
Low Response: 168 hours (7 days)
Escalate: Yes
Escalate To: compliance-director@company.com
Default: Yes
```

**Purpose**:
- Meets 7-day acknowledgment requirement
- All cases acknowledged within 7 days maximum
- Critical/high cases get faster response
- Escalates to compliance director if breach occurs

### Example 2: High-Risk Cases

**Policy Configuration**:
```
Name: High-Risk Rapid Response
Critical Response: 8 hours
High Response: 24 hours
Medium Response: 48 hours
Low Response: 120 hours
Escalate: Yes
Escalate To: general-counsel@company.com
Default: No
```

**Purpose**:
- Aggressive timelines for high-risk cases
- Manually assign to legal matters, fraud, serious misconduct
- Escalates to General Counsel if breach
- Not default (used selectively)

### Example 3: Standard Business Hours

**Policy Configuration**:
```
Name: Standard Business SLA
Critical Response: 48 hours
High Response: 120 hours (5 business days)
Medium Response: 240 hours (10 business days)
Low Response: 480 hours (20 business days)
Escalate: Yes
Escalate To: hr-director@company.com
Default: Yes
```

**Purpose**:
- More relaxed timelines for smaller organizations
- Accounts for business hours (not 24/7 team)
- Suitable for lower-risk environments
- Escalates to HR Director

### Example 4: Tracking Only (No Escalation)

**Policy Configuration**:
```
Name: Performance Tracking
Critical Response: 24 hours
High Response: 48 hours
Medium Response: 120 hours
Low Response: 240 hours
Escalate: No
Escalate To: (none)
Default: Yes
```

**Purpose**:
- Track response times without automatic escalation
- Measure team performance
- Review SLA compliance in reports
- Manual escalation decisions

## Managing SLA Policies

### Viewing Policies

**Desktop View** (Table):
- Name, Critical, High, Medium, Low, Default, Actions
- All response times visible at a glance
- Quick identification of default policy
- Sort by any column

**Mobile View** (Cards):
- Condensed card format
- All key information visible
- Touch-friendly interface
- Optimized for small screens

### Editing Policies

1. Click **Edit** button (pencil icon)
2. Modify any field
3. Click **Update Policy**
4. Changes apply to future cases (existing cases keep original SLA)

**Common Edits**:
- Adjusting response times based on performance data
- Changing escalation recipient
- Enabling/disabling escalation
- Setting a different policy as default

### Deleting Policies

1. Click **Delete** button (trash icon)
2. Confirm deletion
3. Policy is permanently removed

**Warnings**:
- Cannot delete policy if assigned to active cases
- Cannot delete the default policy (change default first)
- Deleted policies cannot be recovered

### Changing Default Policy

To change which policy is default:

1. Edit the policy you want to make default
2. Toggle "Set as default policy" to ON
3. Save
4. Previous default policy automatically becomes non-default

**Only ONE policy can be default at a time.**

## How SLA Tracking Works

### Timeline Calculation

**Start Time**:
- SLA clock starts when report is submitted
- Recorded in UTC
- Does not account for business hours (runs 24/7)

**Response Time**:
- Time to first meaningful response
- Can be:
  - First message to reporter
  - Status change to "Investigating"
  - Assignment to handler
  - First case note

**Breach Time**:
- When response time exceeds SLA target
- Example: Critical case with 24h SLA breaches after 24 hours, 0 minutes

### SLA Status Indicators

**On Track (Green)**:
- Response provided within SLA target
- Status: "SLA Met"
- No action required

**Warning (Yellow)**:
- Approaching SLA breach (e.g., 75% of time elapsed)
- Status: "SLA Warning"
- Prompt handler to respond soon

**Breached (Red)**:
- Response time exceeded SLA target
- Status: "SLA Breached"
- Escalation triggered (if enabled)
- Requires immediate attention

### Automatic Escalation

When escalation is enabled and SLA is breached:

1. **Case Auto-Escalates**: Assigned to escalation recipient
2. **Notification Sent**: Email alert to escalation recipient
3. **Dashboard Alert**: Escalation visible on dashboard
4. **Workflow Log Created**: Escalation action logged
5. **Reporter Notified**: Optional notification to whistleblower
6. **Original Handler**: Remains assigned (dual assignment)

**Escalation Example**:
```
Original Assignment: case-handler@company.com
SLA Policy: 24-hour critical response
Time Elapsed: 26 hours
Action: Auto-escalate to compliance-director@company.com
Result: Both handler and director now assigned
```

## SLA Monitoring & Reporting

### Dashboard Indicators

**Cases Dashboard**:
- SLA status badges on each case
- Color-coded indicators (green/yellow/red)
- Time remaining until breach
- Overdue case count

**Analytics View**:
- SLA compliance rate (percentage)
- Average response time by priority
- Breach count by team/handler
- Trend over time (improving/declining)

### SLA Reports

**Available Metrics**:
- **SLA Compliance Rate**: % of cases meeting SLA
- **Average Response Time**: By priority level
- **Breach Count**: Total SLA violations
- **Team Performance**: Compliance by team member
- **Priority Distribution**: Case priority breakdown

**Export Options**:
- CSV download
- PDF report
- Excel format
- Scheduled reports (Enterprise)

### Workflow History

View all SLA-related events:

1. Navigate to **Workflows > History** tab
2. Filter by action type: "SLA Escalation"
3. View breach details and escalation actions

**Log Information**:
- Report ID
- SLA policy applied
- Target response time
- Actual response time
- Escalation details
- Timestamp

## Best Practices

### Setting Response Times

**Be Realistic**:
- Consider team size and capacity
- Account for weekends/holidays
- Match organizational capabilities
- Start conservative, tighten later

**Align with Regulations**:
- EU Directive: 7-day acknowledgment minimum
- SOX: Prompt investigation requirement
- Industry standards: Research benchmarks
- Legal obligations: Consult counsel

**Differentiate by Priority**:
- Critical: Very urgent (hours)
- High: Urgent (days)
- Medium: Normal (week)
- Low: Routine (weeks)

**Example Progression**:
```
Conservative: 48h, 120h, 240h, 480h
Standard:     24h, 48h, 120h, 240h
Aggressive:   8h, 24h, 48h, 120h
```

### Escalation Strategy

**Choose the Right Person**:
- Senior enough to intervene
- Available and responsive
- Appropriate for case types
- Empowered to act

**Common Escalation Recipients**:
- Director of Compliance
- General Counsel
- Chief Ethics Officer
- HR Director
- Head of Internal Audit

**Escalation Tiers**:
For multiple policies:
```
Standard cases → Manager
High-risk cases → Director
Critical cases → C-suite
```

### Policy Design

**Start with One Default Policy**:
- Keep it simple initially
- Add specialized policies later
- Measure compliance first
- Adjust based on data

**Create Specialized Policies for**:
- High-risk case types
- Different departments
- Regulatory requirements
- Customer commitments

**Avoid Over-Engineering**:
- Don't create too many policies
- 2-3 policies usually sufficient
- More policies = more complexity
- Focus on compliance, not perfection

## Troubleshooting

### SLA Not Applying

**Check**:
1. Is there a default policy?
2. Is the policy enabled?
3. Does case have manual SLA override?
4. Check workflow logs for errors

**Solution**:
- Set a policy as default
- Verify policy configuration
- Check case details for manual assignment

### Wrong SLA Applied

**Cause**:
- Manual assignment to non-default policy
- Default changed after case created
- Case priority changed after creation

**Solution**:
- Cases keep original SLA when created
- Manually update case SLA if needed
- Future cases use current default

### Escalation Not Happening

**Check**:
1. Is "Escalate after breach" enabled?
2. Is escalation recipient valid?
3. Has SLA actually been breached?
4. Check notification settings

**Solution**:
- Enable escalation in policy
- Verify escalation user is active
- Confirm breach occurred
- Check workflow logs

### False Breach Alerts

**Cause**:
- Case was responded to but not marked properly
- Status not updated
- Message sent but not logged
- System timing issue

**Solution**:
- Update case status after response
- Log all actions in case notes
- Train team on proper workflow
- Review SLA criteria

## Compliance & Audit

### Audit Trail

All SLA events are logged:

**Tracked Events**:
- SLA policy assignment
- SLA start time
- Response actions
- Status changes
- Breach occurrences
- Escalation actions
- Policy changes

**Audit Uses**:
- Regulatory compliance reporting
- Performance reviews
- Process improvement
- Dispute resolution
- Legal defense

### Reporting Requirements

**EU Whistleblowing Directive**:
- Prove 7-day acknowledgment
- Document follow-up timeline
- Show continuous engagement

**SOX Compliance**:
- Demonstrate prompt investigation
- Document response times
- Show escalation procedures

**Disclosurely Provides**:
- Automated tracking
- Tamper-evident logs
- Exportable reports
- Timestamped evidence

## Advanced Features

### Multiple SLA Policies

**Use Cases**:
- Different departments have different capabilities
- Specialized policies for high-risk cases
- Varying customer commitments
- Regulatory vs. internal standards

**Example Structure**:
```
Policy 1: "Standard" (Default)
  - 24h, 48h, 120h, 240h
  - Escalate to: Manager

Policy 2: "High-Risk"
  - 8h, 24h, 48h, 120h
  - Escalate to: Director

Policy 3: "EU Compliance"
  - All levels: 168h (7 days)
  - Escalate to: Compliance Officer
```

**Assignment**:
- Default applies automatically
- Manually assign high-risk policy to specific cases
- EU policy for Europe-based reports

### Conditional SLA Assignment

Combine with Assignment Rules:

**Strategy**:
```
Assignment Rule:
  Category: Financial
  Urgency: Critical
  → Assign to: CFO
  → SLA Policy: High-Risk (manual step)
```

Future enhancement: Automatic SLA assignment based on conditions.

### SLA Pausing

**Coming Soon**: Ability to pause SLA clock:
- Awaiting external information
- Whistleblower unresponsive
- Legal hold
- Scheduled maintenance

Currently: SLA runs continuously from submission.

## Pricing & Availability

**SLA Management is available on**:
- Pro Plan: ✅ Up to 3 policies
- Enterprise Plan: ✅ Unlimited policies
- Basic Plan: ❌ Not available

**Features by Plan**:
- Pro: Basic SLA tracking, escalation, 3 policies
- Enterprise: Advanced reporting, unlimited policies, scheduled reports

## Getting Started

Ready to implement SLA policies?

1. **Determine Your Requirements**:
   - Regulatory obligations
   - Team capacity
   - Risk tolerance
   - Current performance

2. **Create Your First Policy**:
   - Use EU Directive template
   - Set realistic timelines
   - Enable escalation
   - Mark as default

3. **Monitor Compliance**:
   - Check dashboard daily
   - Review weekly reports
   - Adjust as needed
   - Train team on importance

4. **Refine Over Time**:
   - Measure compliance rates
   - Gather team feedback
   - Tighten timelines gradually
   - Add specialized policies

**Example First Policy**:
```
Name: EU Whistleblowing Directive
Critical: 24 hours
High: 48 hours
Medium: 120 hours (5 days)
Low: 168 hours (7 days)
Escalate: Yes → compliance@company.com
Default: Yes
```

## Support

**Need help with SLA Management?**
- [Assignment Rules](/docs/features/assignment-rules) - Automate case routing
- [Workflow Guide](/docs/cases/workflow) - Full workflow documentation
- [Compliance Overview](/docs/compliance/overview)
- [EU Directive](/docs/compliance/eu-directive)
- [Contact Support](/docs/support/contact)

---

**SLA Management ensures you never miss a commitment, meet regulatory requirements, and maintain accountability—automatically tracking every case from submission to resolution.**
