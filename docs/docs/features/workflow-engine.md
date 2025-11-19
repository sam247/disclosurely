---
title: Workflow Engine - Automated Case Routing & Processing | Disclosurely
description: Intelligent workflow automation combining assignment rules, SLA policies, escalation, and case routing for efficient whistleblowing case management.
head:
  - - meta
    - property: og:title
      content: Workflow Engine & Automation - Disclosurely
  - - meta
    - property: og:description
      content: Intelligent workflow automation combining assignment rules, SLA policies, escalation, and case routing for efficient whistleblowing case management.
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
      content: Workflow Engine - Disclosurely
  - - meta
    - name: twitter:description
      content: Intelligent workflow automation combining assignment rules, SLA policies, escalation, and case routing for efficient whistleblowing case management.
  - - meta
    - name: twitter:image
      content: https://docs.disclosurely.com/ogimage.png
---

# Workflow Engine

Automate case routing, assignment, escalation, and lifecycle management with Disclosurely's intelligent workflow engine.

## Overview

The Workflow Engine is the orchestration layer that automates case handling from submission through resolution. By combining [assignment rules](/features/assignment-rules), [SLA policies](/features/sla-management), escalation triggers, and status workflows, the engine ensures consistent, timely, and efficient case processing.

**Key Capabilities:**
- Automatic case assignment based on rules
- SLA monitoring and enforcement
- Priority-based escalation
- Status workflow automation
- Deadline tracking and alerts
- Load balancing across team members
- Integration with [analytics](/analytics/dashboard) and [audit trail](/features/audit-trail)
- Configurable business logic

**Access:** Dashboard > Workflows

## How the Workflow Engine Works

### Submission to Resolution Lifecycle

**1. Case Submission**
- Reporter submits case via reporting portal
- Case created with unique ID (DIS-XXXXXXXX)
- Initial status: "New/Unassigned"
- Workflow engine triggered

**2. Automatic Assignment**
- Engine evaluates [assignment rules](/features/assignment-rules)
- Matches case attributes (category, urgency, keywords, department)
- Identifies best-fit investigator or team
- Assigns case automatically
- Sends notification to assignee

**3. SLA Clock Starts**
- [SLA policy](/features/sla-management) determines timeline based on priority
- Response deadline calculated
- Investigation deadline set
- Countdown begins
- Notifications scheduled

**4. Investigation Workflow**
- Case progresses through statuses
- Status transitions trigger actions
- Investigators update case
- Evidence collected
- Communication with reporter

**5. Escalation (if needed)**
- SLA approaching or breached
- High-risk case flagged
- Complex case requires senior attention
- Escalation rules trigger
- Re-assignment or alerts sent

**6. Resolution & Closure**
- Investigation completed
- Findings documented
- Reporter notified (if applicable)
- Case closed
- Retention policy applied

**Learn More:** [Case Workflow](/cases/workflow)

### Workflow Components

**Assignment Rules:**
- Condition-based case routing
- Category, urgency, keyword matching
- Department-specific rules
- Round-robin or skill-based assignment
- Manual override capability

**SLA Policies:**
- Priority-based timelines
- Response and resolution deadlines
- Escalation triggers
- Business hours configuration
- Holiday/weekend handling

**Escalation Logic:**
- Automatic escalation conditions
- Escalation paths (who to escalate to)
- Notification cascades
- De-escalation rules

**Status Workflows:**
- Allowed status transitions
- Required actions per status
- Approval workflows
- Auto-close conditions

## Configuring Workflow Rules

### Assignment Rules

**Creating Assignment Rules:**

1. Navigate to **Workflows > Assignment Rules**
2. Click **Create Rule**
3. Configure rule conditions:
   - **Name:** Descriptive rule name
   - **Priority:** Rule execution order (higher first)
   - **Conditions:** What cases match this rule
     - Category (e.g., Financial Misconduct)
     - Urgency (Low, Medium, High, Critical)
     - Keywords (e.g., "fraud", "embezzlement")
     - Department/Location
     - Reporter type (Anonymous vs. Confidential)
   - **Assignment Target:** Who gets assigned
     - Specific user
     - Team/department
     - Round-robin across team
     - Skill-based (least busy qualified investigator)
4. Set rule status (Active/Inactive)
5. Save rule

**Rule Execution:**
- Rules evaluated in priority order
- First matching rule wins
- If no rules match, default assignment (manual or queue)
- Rules can be temporarily disabled without deletion

**Example Rules:**

**Rule 1: Critical Financial Cases**
- **Conditions:** Category = Financial Misconduct AND Urgency = Critical
- **Assign To:** CFO or Financial Compliance Officer
- **Priority:** 1 (highest)

**Rule 2: HR Department Cases**
- **Conditions:** Department = Human Resources
- **Assign To:** HR Investigations Team (round-robin)
- **Priority:** 5

**Rule 3: After-hours Cases**
- **Conditions:** Submitted between 6pm-8am
- **Assign To:** On-call investigator (rotation)
- **Priority:** 3

**Learn More:** [Assignment Rules Guide](/features/assignment-rules)

### SLA Policies

**Defining SLA Policies:**

1. Navigate to **Workflows > SLA Policies**
2. Click **Create Policy**
3. Configure policy:
   - **Name:** Policy name (e.g., "Critical Case SLA")
   - **Priority Level:** Which priority this applies to
   - **Response Deadline:** Time to first response
     - Hours or days
     - Business hours only or calendar hours
   - **Resolution Deadline:** Time to case closure
   - **Escalation Trigger:** When to escalate
     - % of deadline (e.g., 80% elapsed)
     - Absolute time (e.g., 2 hours before breach)
   - **Escalation Action:** What happens
     - Notify manager
     - Reassign to senior investigator
     - Alert audit committee
     - Change priority
4. Save policy

**SLA Configuration Example:**

| Priority | Response Deadline | Resolution Deadline | Escalation |
|----------|-------------------|---------------------|------------|
| Critical | 4 hours | 3 days | At 80% or 2.4 days |
| High | 24 hours | 7 days | At 90% or 6.3 days |
| Medium | 48 hours | 14 days | At 100% (breach) |
| Low | 72 hours | 30 days | No auto-escalation |

**Business Hours:**
- Define organization business hours (e.g., 9am-5pm)
- Exclude weekends (optional)
- Add holiday calendar
- SLA clock pauses outside business hours

**Learn More:** [SLA Management Guide](/features/sla-management)

### Escalation Rules

**Automatic Escalation:**

**Escalation Triggers:**
1. **SLA-Based:**
   - Approaching deadline (configurable %)
   - Deadline breached
   - Extended deadline breached

2. **Risk-Based:**
   - High-risk case detected ([AI risk assessment](/ai/risk-assessment))
   - Retaliation allegation
   - Executive involvement
   - Media attention risk

3. **Status-Based:**
   - Case stuck in status >X days
   - Repeated status changes
   - Multiple reassignments

4. **Activity-Based:**
   - No activity in X days
   - No communication with reporter
   - Evidence not reviewed

**Escalation Actions:**

**Notification:**
- Email to escalation contact
- SMS for critical cases
- In-app alert
- Multiple recipients

**Reassignment:**
- Escalate to manager
- Transfer to senior investigator
- Add second investigator (collaborative)

**Status Change:**
- Automatically change priority (Medium → High)
- Flag for review
- Require manager approval

**Workflow Modification:**
- Shorten remaining SLA
- Add to high-priority queue
- Trigger audit committee notification

### Status Workflows

**Define Status Progression:**

**Standard Status Flow:**
```
New → Assigned → In Progress → Under Review → Resolved → Closed
```

**Alternate Flows:**
```
New → Pending Information → In Progress → Resolved → Closed

In Progress → Escalated → Resolved → Closed

Any Status → Archived (retention policy)
```

**Status Transition Rules:**
- Define allowed transitions (can't skip steps)
- Require reason for certain transitions
- Mandate fields completion before status change
- Approval required for some transitions (e.g., Resolved → Closed)

**Auto-Status Changes:**
- "Pending Information" → "In Progress" when reporter responds
- "Under Review" → "Resolved" when findings approved
- "Resolved" → "Closed" after X days (auto-close)

## Workflow Monitoring

### Workflow History

**Track All Workflow Actions:**

**Access:** Dashboard > Workflows > History

**Logged Actions:**
- Assignment rule matches
- SLA deadlines calculated
- Escalations triggered
- Status transitions
- Deadline extensions
- Manual overrides

**History Details:**
- Timestamp
- Case ID
- Rule/policy triggered
- Action taken
- Actor (system or user)
- Outcome (success/failure)
- Reason (if manual override)

**Use Cases:**
- Audit workflow effectiveness
- Troubleshoot assignment issues
- Verify SLA compliance
- Analyze escalation patterns
- Optimize rules

**Learn More:** [Audit Trail](/features/audit-trail)

### Workflow Analytics

**Performance Metrics:**

**Assignment Efficiency:**
- % cases auto-assigned vs. manual
- Average assignment time
- Assignment rule match rate
- Reassignment frequency

**SLA Compliance:**
- % cases meeting response SLA
- % cases meeting resolution SLA
- Average SLA buffer (how much time left)
- Escalation rate

**Workload Distribution:**
- Cases per investigator
- Active cases per team member
- Workload balance score
- Capacity utilization

**Bottleneck Identification:**
- Average time in each status
- Cases stuck >X days
- Most common status
- Status regression rate

**Access:** Dashboard > Analytics > Workflows

**Learn More:** [Analytics Dashboard](/analytics/dashboard)

### Real-Time Monitoring

**Workflow Dashboard:**

**Live View:**
- Cases currently in workflow
- Pending assignments
- SLA countdowns
- Upcoming escalations
- Stalled cases

**Alerts:**
- New critical case awaiting assignment
- SLA breach imminent (< 1 hour)
- Escalation triggered
- Workflow error (rule failed)
- Manual intervention needed

**Quick Actions:**
- Manually assign case
- Override assignment rule
- Extend SLA deadline
- Trigger immediate escalation
- Pause workflow (hold)

## Advanced Workflow Features

### Conditional Workflows

**Multi-Step Workflows:**

Create complex workflows with conditional logic:

**Example: Financial Misconduct Workflow**

```
1. Case Submitted
   ↓
2. IF Amount > $100,000
   → Assign to CFO + External Auditor
   ELSE
   → Assign to Financial Compliance Team
   ↓
3. Investigation
   ↓
4. IF Substantiated
   → Escalate to Audit Committee
   → Notify Legal Department
   → Trigger forensic audit
   ELSE
   → Document findings
   → Close case
   ↓
5. Resolution
```

**Conditional Operators:**
- IF/THEN/ELSE logic
- AND/OR conditions
- Comparison operators (>, <, =, ≠)
- Contains, Starts with, Ends with
- Regular expressions

### Parallel Workflows

**Simultaneous Actions:**

Trigger multiple workflows concurrently:

**Example: High-Risk Case**
- **Workflow A:** Assign to senior investigator
- **Workflow B:** Notify audit committee
- **Workflow C:** Alert legal department
- **Workflow D:** Trigger [AI risk assessment](/ai/risk-assessment)
- **Workflow E:** Set 4-hour response SLA

**Synchronization:**
- All workflows must complete before next step
- OR any workflow completion triggers next step
- Timeout if workflows don't complete in X time

### Approval Workflows

**Multi-Level Approvals:**

Require approvals before case progression:

**Example: Case Closure Approval**
```
Investigator marks case "Resolved"
   ↓
Manager reviews findings
   ↓ (Approve)          ↓ (Reject)
Change to "Closed"    Return to "In Progress"
   ↓
Notify reporter
   ↓
Archive after 90 days
```

**Approval Configurations:**
- Single approver
- Multiple approvers (all must approve)
- Hierarchical approvals (manager → director → VP)
- Timeout with default action

### Integration Workflows

**External System Integration:**

Trigger actions in integrated systems:

**Available Integrations:**
- Send notification to Slack/Teams
- Create ticket in ServiceNow/Jira
- Update CRM (Salesforce)
- Log to SIEM
- Archive to cloud storage
- Email external stakeholders

**Webhook Workflows:**
- Trigger webhooks on specific events
- Pass case data to external API
- Receive response and act accordingly
- Retry logic for failed calls

**Learn More:** [Integrations](/integrations/coming-soon)

## Workflow Best Practices

### Rule Design

✅ **Keep Rules Simple:**
- One clear condition per rule
- Avoid overly complex logic
- Document rule purpose
- Test rules before activation

✅ **Prioritize Correctly:**
- Most specific rules first (higher priority)
- General catch-all rules last
- Avoid overlapping conditions
- Review priority order quarterly

✅ **Monitor and Refine:**
- Check rule match rates monthly
- Identify unused rules (disable or delete)
- Update rules based on case volume changes
- Get investigator feedback

### SLA Management

✅ **Set Realistic Deadlines:**
- Consider actual investigation time
- Account for evidence gathering delays
- Include time for approvals
- Build in buffer for complexity

✅ **Use Business Hours:**
- Don't count weekends/holidays unless 24/7 team
- Pause SLA when waiting on reporter
- Extend SLA for legitimate delays
- Document SLA extensions

✅ **Escalate Appropriately:**
- Escalation should be exception, not routine
- High escalation rate indicates unrealistic SLAs
- Escalate to right person (not always highest)
- Have clear escalation procedures

### Performance Optimization

✅ **Balance Workload:**
- Use round-robin for even distribution
- Consider investigator capacity (active case count)
- Don't overload top performers
- Assign based on expertise, not just availability

✅ **Reduce Manual Overrides:**
- If frequently overriding, rules need adjustment
- Track override reasons
- Update rules to handle common cases
- Allow flexibility for truly exceptional cases

✅ **Automate Where Possible:**
- Auto-assignment for straightforward cases
- Auto-escalation for SLA breaches
- Auto-status changes for clear conditions
- Auto-notifications at key milestones

### Continuous Improvement

✅ **Regular Reviews:**
- Quarterly workflow effectiveness analysis
- Annual comprehensive workflow audit
- Benchmark against industry standards
- Incorporate lessons learned from cases

✅ **Team Feedback:**
- Survey investigators on workflow efficiency
- Collect suggestions for improvements
- Test proposed changes in pilot mode
- Communicate workflow changes clearly

✅ **Data-Driven Decisions:**
- Use [analytics](/analytics/dashboard) to identify issues
- Track KPIs (assignment time, SLA compliance, escalation rate)
- Compare before/after workflow changes
- Make incremental improvements

## Troubleshooting Workflows

### Rule Not Triggering

**Symptom:** Expected assignment rule didn't fire

**Possible Causes:**
1. **Rule inactive:** Verify rule is enabled
2. **Condition mismatch:** Case doesn't meet all conditions
3. **Priority:** Higher priority rule matched first
4. **Timing:** Rule created after case submitted

**Resolution:**
1. Check rule status (Active/Inactive)
2. Review case attributes vs. rule conditions
3. Check rule execution order (priority)
4. View workflow history for rule evaluation
5. Test rule with sample cases

### SLA Not Calculating

**Symptom:** SLA deadline missing or incorrect

**Possible Causes:**
1. **No SLA policy:** Priority level not configured
2. **Business hours:** Confusion about business vs. calendar hours
3. **Timezone:** Organization timezone mismatch
4. **Manual override:** SLA manually paused or extended

**Resolution:**
1. Verify SLA policy exists for case priority
2. Check business hours configuration
3. Confirm organization timezone setting
4. Review case history for manual SLA changes
5. Recalculate SLA if needed

### Escalation Not Occurring

**Symptom:** Case should have escalated but didn't

**Possible Causes:**
1. **Escalation disabled:** Rule turned off
2. **Threshold not reached:** Not at escalation %yet
3. **Already escalated:** Can't escalate twice
4. **Notification failed:** Email bounced or blocked

**Resolution:**
1. Check escalation rule configuration
2. Verify SLA progress (is it at threshold?)
3. Review case history for prior escalations
4. Test email notifications
5. Manually escalate if needed

### Workflow Conflicts

**Symptom:** Multiple rules trying to assign same case

**Possible Causes:**
1. **Overlapping conditions:** Rules match same cases
2. **Priority confusion:** Rules at same priority level
3. **Concurrent execution:** Race condition

**Resolution:**
1. Review all active rules for overlaps
2. Adjust rule conditions to be mutually exclusive
3. Set clear priority order
4. Use more specific conditions
5. Test rule combinations

## Use Cases

### Financial Services Firm

**Workflow Setup:**

**Assignment Rules:**
- Fraud >$1M → CFO + External Auditor
- Market manipulation → Compliance Officer
- Insider trading → Legal + Compliance
- General financial misconduct → Financial Risk Team

**SLA Policies:**
- All financial cases: 24-hour response
- Critical (>$1M): 48-hour resolution
- High: 7-day resolution
- Medium: 14-day resolution

**Escalation:**
- Any case >$500K escalates to audit committee
- SLA breach → CFO notification
- Retaliation allegation → CEO + Legal

**Results:**
- 95% auto-assignment rate
- 98% SLA compliance
- 40% reduction in manual routing time

### Healthcare Organization

**Workflow Setup:**

**Assignment Rules:**
- Patient safety → Chief Medical Officer
- HIPAA violation → Privacy Officer
- Workplace safety → Safety Manager
- HR issues → HR Director

**SLA Policies:**
- Patient safety: 2-hour response (critical)
- All other: Standard tiered SLAs
- Pause SLA when awaiting medical records

**Escalation:**
- Patient harm → Immediate escalation to CMO
- Multiple safety violations → Quality Committee
- Data breach → Legal + IT Security

**Results:**
- Patient safety cases resolved 60% faster
- Zero SLA breaches on critical cases
- Improved patient safety outcomes

### Manufacturing Company

**Workflow Setup:**

**Assignment Rules:**
- Safety hazards → EHS (Environmental, Health, Safety) Manager
- Quality issues → Quality Assurance
- Theft/fraud → Security Team
- Department-specific → Department supervisor

**SLA Policies:**
- Safety: 4-hour response, 24-hour resolution
- Quality: 8-hour response, 3-day resolution
- Other: Standard 48-hour/14-day

**Escalation:**
- Imminent danger → Plant Manager + EHS (immediate)
- Repeat violations → Site Director
- Product quality affecting customers → VP Operations

**Results:**
- Safety incident response time reduced 75%
- Clear accountability per department
- Better tracking of systemic issues

## Related Pages

- [Assignment Rules](/features/assignment-rules) - Detailed assignment configuration
- [SLA Management](/features/sla-management) - SLA policy setup
- [Case Workflow](/cases/workflow) - Investigation lifecycle
- [Analytics Dashboard](/analytics/dashboard) - Workflow performance metrics
- [Audit Trail](/features/audit-trail) - Workflow history logging
- [AI Risk Assessment](/ai/risk-assessment) - AI-powered escalation
- [Pattern Detection](/ai/pattern-detection) - Systemic issue identification

## Support

Questions about workflow automation?
- Email: support@disclosurely.com
- [Contact Support](/support/contact)
- [Schedule Demo](https://disclosurely.com/demo)
- [Video Tutorials](https://disclosurely.com/tutorials/workflows)
