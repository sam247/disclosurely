# Case Assignment

Efficiently assign and distribute cases to the right team members for investigation.

## Overview

When a new report is submitted, it needs to be assigned to an investigator or team for review. Proper case assignment ensures:

- Cases reach the right subject matter experts
- Workload is distributed evenly across your team
- Response times are minimized
- Accountability is clear from the start

## Automatic Assignment

### Rules-Based Assignment

Configure automatic assignment rules to route cases based on:

**Category-Based Routing:**
- Financial misconduct → Finance team
- HR issues → Human Resources
- Safety concerns → Health & Safety team
- Data breaches → IT Security team

**Priority-Based Routing:**
- Critical cases → Senior investigators
- Standard cases → General investigation pool
- Low priority → Junior team members

**Department-Based Routing:**
- Route cases to specific departments mentioned in report
- Cross-department issues assigned to compliance team
- Location-specific routing for multi-site organizations

### Setting Up Auto-Assignment

1. **Navigate to Settings**
   - Go to Dashboard > Organization Settings
   - Click "Case Assignment Rules"

2. **Create Assignment Rule**
   - Click "Add New Rule"
   - Select trigger criteria:
     - Report category
     - Priority level
     - Keywords in report
     - Department mentioned
     - Reporter location (if available)

3. **Define Assignment Target**
   - Assign to specific user
   - Assign to team/group
   - Round-robin within team
   - Load balancing based on current workload

4. **Set Rule Priority**
   - Multiple rules can match one case
   - Higher priority rules execute first
   - Set fallback assignment if no rules match

5. **Save and Activate**
   - Test rule with sample cases
   - Monitor effectiveness
   - Adjust as needed

### Round-Robin Assignment

Distribute cases evenly across team members:

**How It Works:**
1. Define pool of eligible investigators
2. System tracks who received last case
3. Next case goes to next person in rotation
4. Skips users on leave or at capacity
5. Ensures fair distribution

**Configuration:**
- Go to Team Management
- Create "Investigation Team" group
- Enable round-robin for group
- Set maximum concurrent cases per person
- Add/remove members as needed

## Manual Assignment

### Assigning from Case Dashboard

**Quick Assignment:**
1. Open Cases dashboard
2. Find unassigned case
3. Click "Assign" button
4. Select team member from dropdown
5. Add optional note about why assigned
6. Click "Assign Case"

**Bulk Assignment:**
1. Select multiple cases using checkboxes
2. Click "Bulk Actions" > "Assign"
3. Choose assignee
4. Cases assigned with notification sent

### Assigning from Case Detail Page

For more detailed assignment:

1. **Open Case**
   - Click case to view full details
   - Review report content, category, priority

2. **Choose Assignee**
   - Click "Assign Case" in top right
   - See list of eligible team members
   - View each member's:
     - Current case load
     - Availability status
     - Relevant expertise
     - Average resolution time

3. **Add Assignment Details**
   - Optional: Add note explaining assignment
   - Set expected response timeframe
   - Mark as urgent if needed
   - Add case to specific investigation project

4. **Notify Assignee**
   - Email notification sent automatically
   - In-app notification appears
   - SMS alert for urgent cases (Enterprise)
   - Slack/Teams integration (if configured)

## Re-Assignment

Cases can be re-assigned when needed:

### When to Re-Assign

**Workload Balancing:**
- Team member overloaded with cases
- Someone has specialized knowledge needed
- Original assignee on leave or unavailable

**Expertise Required:**
- Case more complex than initially assessed
- Technical expertise needed
- Legal review required
- External specialist consultation

**Conflict of Interest:**
- Assignee has relationship with subject
- Assignee is mentioned in report
- Department conflict identified
- Impartiality concerns

### How to Re-Assign

1. **Open Case**
   - Navigate to case detail page
   - Current assignee shown at top

2. **Click Re-Assign**
   - Button in top right
   - Requires Admin or Org Admin role
   - Add reason for re-assignment (recommended)

3. **Select New Assignee**
   - Choose from dropdown
   - View availability and workload
   - Add handover notes

4. **Notify Both Parties**
   - Original assignee notified of removal
   - New assignee notified of assignment
   - Case history updated with re-assignment

5. **Handover Notes**
   - Original assignee can add notes
   - Share investigation progress
   - Highlight key evidence
   - Note any reporter communications

## Team-Based Assignment

Assign cases to teams rather than individuals:

### Benefits

- Entire team has visibility
- Any team member can work on case
- Built-in backup if someone unavailable
- Collaborative investigation possible
- Knowledge sharing within team

### Creating Investigation Teams

1. **Go to Team Management**
   - Dashboard > Team > Manage Teams

2. **Create New Team**
   - Click "Create Investigation Team"
   - Name: e.g., "Financial Investigations"
   - Add team members
   - Assign team lead

3. **Set Team Permissions**
   - What case types team handles
   - Access levels for team members
   - Notification preferences
   - Collaboration settings

4. **Assign Cases to Team**
   - Cases assigned to team, not individual
   - Team members can claim cases
   - Team lead can distribute within team
   - Workload visible to all team members

### Claiming Cases

When case assigned to team:

1. **Team members see available cases**
   - "Available to Claim" section in dashboard
   - Filtered by their team assignments

2. **Claim Case**
   - Click "Claim This Case"
   - Becomes your responsibility
   - Removed from team pool
   - Other team members notified

3. **Unclaim if Needed**
   - Return to team pool
   - Add note about why unclaiming
   - Team lead notified

## Notifications

### For Assignees

When assigned a case, you receive:

**Immediate Notification:**
- Email with case summary
- In-app notification badge
- Push notification (mobile app)
- SMS for urgent cases (Enterprise)

**Notification Includes:**
- Case tracking ID
- Report category
- Priority level
- Submission date
- Direct link to case
- Assignment note (if provided)

### For Reporters

Reporters are notified when case assigned:

**What They See:**
- "Your case has been assigned to an investigator"
- Expected response timeframe
- Next steps in process
- How to send additional information

**What They Don't See:**
- Investigator name (for anonymity)
- Investigator email or contact
- Internal assignment notes
- Team structure

## Assignment Metrics

### Track Assignment Performance

**Dashboard Metrics:**
- Average time to assignment
- Cases currently unassigned
- Assignment distribution across team
- Re-assignment rate
- Cases per investigator

**Reports Available:**
- Assignment efficiency report
- Investigator workload report
- Time-to-assignment by category
- Re-assignment analysis
- Team performance comparison

### Optimizing Assignment

Use metrics to improve:

**Identify Bottlenecks:**
- Which categories take longest to assign?
- Are certain investigators overloaded?
- Do auto-assignment rules work well?
- Are cases re-assigned frequently?

**Make Improvements:**
- Adjust auto-assignment rules
- Rebalance team workloads
- Add more investigators to busy categories
- Provide training on specific case types
- Streamline assignment process

## Assignment Permissions

### Who Can Assign Cases

**Organization Administrator:**
- Assign any case to anyone
- Re-assign cases
- Create assignment rules
- Manage teams

**Case Handler (Admin role):**
- Assign unassigned cases
- Re-assign own cases
- Cannot override other assignments (without Org Admin)

**Reviewer:**
- Cannot assign cases
- Can only view assigned cases
- Can request re-assignment

### Preventing Conflicts

**System Protections:**
- Can't assign to users without proper role
- Can't assign to inactive accounts
- Can't assign if user at capacity (if limit set)
- Can't assign to user on leave status

**Conflict of Interest Checks:**
- System flags if assignee in same department as subject
- Warning if assignee previously involved with reporter
- Alert if assignee mentioned in case notes

## Best Practices

### Assign Promptly

**Why It Matters:**
- Shows reporter their concern is taken seriously
- Meets compliance timeframes
- Prevents cases from being overlooked
- Reduces reporter anxiety

**Target Timeframes:**
- Critical cases: Within 1 hour
- High priority: Within 4 hours
- Standard: Within 24 hours
- Low priority: Within 48 hours

### Match Expertise to Case

**Consider:**
- Subject matter expertise needed
- Language skills (for international reports)
- Cultural sensitivity required
- Technical knowledge (IT, financial, legal)
- Investigation experience level

### Balance Workload

**Monitor:**
- Current case load per investigator
- Average resolution time per investigator
- Complexity of assigned cases
- Upcoming leave or time off
- Other responsibilities outside Disclosurely

### Document Assignment Decisions

**Add Notes When:**
- Assigning complex cases
- Re-assigning cases
- Choosing specific investigator for reason
- Deviating from standard assignment rules

**Helps With:**
- Knowledge sharing
- Audit trail
- Training new administrators
- Defending assignment decisions if questioned

## Troubleshooting

### Case Not Being Auto-Assigned

**Check:**
- Are assignment rules active?
- Does case match any rule criteria?
- Is fallback assignment configured?
- Are all potential assignees at capacity?
- Check rule priority order

### Assignee Not Receiving Notifications

**Verify:**
- Assignee email address correct
- Notifications enabled in their settings
- Email not in spam folder
- User account is active
- Integration settings (Slack/Teams) correct

### Cannot Re-Assign Case

**Common Causes:**
- Insufficient permissions (need Admin role)
- Case already closed
- New assignee lacks required role
- New assignee account inactive
- System conflict of interest flag

---

**Related:**
- [Investigation Workflow](/cases/workflow)
- [Team Management](/admin/team-management)
- [Status Management](/cases/status)
