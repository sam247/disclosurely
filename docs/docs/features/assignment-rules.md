---
title: Assignment Rules - Automated Case Routing
description: Automatically route incoming whistleblowing reports to the right team members based on category, urgency, keywords, and custom conditions.
head:
  - - meta
    - property: og:title
      content: Assignment Rules - Disclosurely Workflow Automation
  - - meta
    - property: og:description
      content: Automatically route incoming whistleblowing reports to the right team members based on category, urgency, keywords, and custom conditions.
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
      content: Assignment Rules - Disclosurely
  - - meta
    - name: twitter:description
      content: Automatically route incoming whistleblowing reports to the right team members based on category, urgency, keywords, and custom conditions.
  - - meta
    - name: twitter:image
      content: https://disclosurely.com/docs/ogimage.png
---

# Assignment Rules

Automatically route incoming reports to the right team members with intelligent assignment rules. Save time, ensure proper expertise, and never miss a critical case.

## What are Assignment Rules?

Assignment Rules are automated workflows that route incoming whistleblowing reports to specific users or teams based on configurable conditions. When a new report arrives, Disclosurely evaluates all active rules and automatically assigns the case to the appropriate handler.

**Benefits**:
- **Faster Response Times**: Cases reach the right expert immediately
- **Consistent Routing**: No manual sorting or decision-making needed
- **Better Expertise Matching**: Financial reports go to finance team, HR issues to HR
- **Reduced Admin Work**: Eliminate manual assignment tasks
- **Improved Accountability**: Clear ownership from the start
- **24/7 Automation**: Works even when admins are offline

## How Assignment Rules Work

### Rule Evaluation Process

When a new report is submitted:

1. **Report Created**: Whistleblower submits a report
2. **Rules Evaluated**: System checks all active assignment rules
3. **Priority Order**: Rules are evaluated from highest to lowest priority
4. **First Match Wins**: The first rule that matches the conditions assigns the case
5. **Assignment Made**: Case is assigned to specified user or team
6. **Notification Sent**: Assigned handler receives notification
7. **Audit Log Updated**: Assignment action is recorded

**Priority Example**:
```
Priority 100: Critical Financial → Senior Finance Manager
Priority 50:  All Financial → Finance Team
Priority 10:  All Reports → General Queue
```

If a critical financial report arrives, it matches the Priority 100 rule first and goes directly to the Senior Finance Manager, bypassing lower-priority rules.

## Creating Assignment Rules

### Accessing Assignment Rules

1. Navigate to **Dashboard > Workflows**
2. Click the **Assignment Rules** tab
3. Click **Create Rule** button

### Rule Configuration

Each rule requires:

**1. Rule Name** (Required):
- Descriptive name for the rule
- Example: "Financial Misconduct → Finance Team"
- Helps identify the rule's purpose at a glance

**2. Priority** (Optional, Default: 0):
- Higher numbers = evaluated first
- Range: Any integer (-999 to 999)
- Example priorities:
  - 100 = Critical/urgent cases
  - 50 = Department-specific routing
  - 10 = General catch-all rules
  - 0 = Default priority

**3. Enabled/Disabled** (Required):
- Toggle to activate or deactivate the rule
- Disabled rules are kept but not evaluated
- Useful for temporarily pausing rules

**4. Conditions** (Optional):
- **Category**: Match specific report categories
  - Options: Financial, HR, Safety, Security, Other, Any
  - Select "Any" to match all categories
- **Urgency**: Match urgency levels
  - Options: Critical, High, Medium, Low, Any
  - Select "Any" to match all urgency levels
- **Keywords**: Match text in report content
  - Comma-separated list
  - Case-insensitive matching
  - Matches if ANY keyword is found
  - Example: "fraud, embezzlement, theft"

**5. Assignment Target** (At least one required):
- **Assign to User**: Assign to specific team member
  - Select from dropdown of active team members
  - Case goes directly to that person
- **Assign to Team**: Assign to team name
  - Enter team name (e.g., "finance", "hr", "legal")
  - Multiple team members can handle
  - Not a built-in team feature, used for organization

**Note**: You must specify either a user OR a team (or both) for the assignment to work.

## Example Assignment Rules

### Example 1: Critical Issues to Leadership

**Rule Configuration**:
```
Name: Critical Cases → Director of Compliance
Priority: 100
Enabled: Yes
Conditions:
  - Category: Any
  - Urgency: Critical
  - Keywords: (empty)
Assignment:
  - Assign to User: director@company.com
  - Assign to Team: (empty)
```

**How it Works**:
- ANY report marked "Critical" urgency
- Automatically assigned to Director of Compliance
- Ensures leadership visibility on critical issues
- Highest priority (100) means evaluated first

### Example 2: Financial Misconduct to Finance Team

**Rule Configuration**:
```
Name: Financial Reports → Finance Team
Priority: 50
Enabled: Yes
Conditions:
  - Category: Financial
  - Urgency: Any
  - Keywords: (empty)
Assignment:
  - Assign to User: (empty)
  - Assign to Team: finance
```

**How it Works**:
- Any report in "Financial" category
- Assigned to "finance" team
- All finance team members can see and handle
- Priority 50 (evaluated after critical cases)

### Example 3: Harassment Keywords to HR

**Rule Configuration**:
```
Name: Harassment & Discrimination → HR Team
Priority: 60
Enabled: Yes
Conditions:
  - Category: Any
  - Urgency: Any
  - Keywords: harassment, discrimination, bullying, hostile environment
Assignment:
  - Assign to User: (empty)
  - Assign to Team: hr
```

**How it Works**:
- Matches if report contains any harassment-related keyword
- Works even if reporter selects wrong category
- Ensures HR expertise for sensitive issues
- Keywords catch issues that might be mis-categorized

### Example 4: Safety Issues to Safety Officer

**Rule Configuration**:
```
Name: Workplace Safety → Safety Officer
Priority: 70
Enabled: Yes
Conditions:
  - Category: Safety
  - Urgency: Any
  - Keywords: injury, accident, hazard, unsafe, OSHA
Assignment:
  - Assign to User: safety-officer@company.com
  - Assign to Team: safety
```

**How it Works**:
- Matches safety category OR safety-related keywords
- Assigned to both specific officer AND team
- Double coverage for critical safety issues
- High priority (70) for quick response

### Example 5: Catch-All Default Rule

**Rule Configuration**:
```
Name: Default Routing → General Queue
Priority: 0
Enabled: Yes
Conditions:
  - Category: Any
  - Urgency: Any
  - Keywords: (empty)
Assignment:
  - Assign to User: (empty)
  - Assign to Team: general
```

**How it Works**:
- Catches any report that didn't match higher-priority rules
- Ensures no report goes unassigned
- Priority 0 (lowest) means evaluated last
- Acts as a safety net

## Rule Priority Strategy

### Recommended Priority Structure

**Priority Levels**:

**100-199: Executive Escalations**
- Critical urgency
- High-risk issues
- Legal matters requiring immediate attention
- Direct to senior leadership

**50-99: Department Specialization**
- Category-specific routing
- Specialized teams
- Subject matter experts
- Department-level assignment

**10-49: General Classification**
- Broad categorization
- Initial triage
- Team-level assignment
- General routing rules

**0-9: Catch-All Defaults**
- Fallback rules
- Unmatched cases
- General queue
- Safety net assignments

### Priority Planning Example

```
Priority 100: [Critical] All → Director of Compliance
Priority 90:  [Financial + Critical/High] → CFO
Priority 80:  [HR + Keywords: sexual, assault] → HR Director + Legal
Priority 70:  [Safety] → Safety Officer + Safety Team
Priority 60:  [Keywords: harassment, discrimination] → HR Team
Priority 50:  [Financial] → Finance Team
Priority 40:  [HR] → HR Team
Priority 30:  [Security] → Security Team
Priority 10:  [All] → General Queue
```

This structure ensures:
- Critical issues reach leadership first
- Serious issues (assault, safety) get specialist attention
- Department routing happens at mid-level priority
- Nothing falls through the cracks with catch-all rule

## Managing Assignment Rules

### Viewing Rules

**Desktop View** (Table):
- Name, Priority, Conditions, Assign To, Status, Actions
- Sortable columns
- Quick overview of all rules

**Mobile View** (Cards):
- Condensed card format
- Swipe-friendly
- All information visible
- Optimized for small screens

### Editing Rules

1. Click the **Edit** button (pencil icon) next to any rule
2. Modify any field
3. Click **Update Rule**
4. Changes take effect immediately

**Common Edits**:
- Adjusting priority when adding new rules
- Adding/removing keywords based on patterns
- Updating assigned user when team changes
- Temporarily disabling seasonal rules

### Deleting Rules

1. Click the **Delete** button (trash icon)
2. Confirm deletion
3. Rule is permanently removed

**Warning**: Deleted rules cannot be recovered. Consider disabling instead if you might need the rule later.

### Disabling Rules Temporarily

1. Click **Edit** on the rule
2. Toggle **Enabled** to off
3. Click **Update Rule**

**When to Disable**:
- Team member on vacation
- Testing new routing strategy
- Seasonal/temporary rules
- Troubleshooting conflicts

## Keywords Best Practices

### Effective Keyword Selection

**Good Keywords**:
- Specific and relevant
- Common terminology
- Variations and synonyms
- Industry-specific terms

**Financial Example**:
```
fraud, embezzlement, theft, stealing, kickback, bribery,
money laundering, corruption, falsified records, accounting fraud
```

**HR Example**:
```
harassment, discrimination, bullying, retaliation, hostile environment,
sexual harassment, age discrimination, gender bias, unequal treatment
```

**Safety Example**:
```
injury, accident, unsafe, hazard, OSHA violation, near miss,
dangerous conditions, equipment failure, safety concern
```

### Keyword Matching

**How It Works**:
- Case-insensitive (matches "Fraud" and "fraud")
- Partial word matching (matches "harassing" from keyword "harassment")
- Any keyword match triggers the rule
- Keywords searched in report title and description

**Examples**:
```
Keywords: "fraud, embezzlement"
Matches:
  ✅ "I witnessed fraud in accounting"
  ✅ "Potential embezzlement by manager"
  ✅ "FRAUD ALERT"
  ✅ "fraudulent expense reports"
  ❌ "Employee misconduct" (no keyword match)
```

### Keyword Strategy

**Combine Keywords with Categories**:
```
Rule 1: Category=HR + Keywords=harassment → HR Team
Rule 2: Category=Any + Keywords=harassment → HR Team (backup)
```

This catches:
- Reports correctly categorized as HR with harassment keywords
- Reports in other categories that mention harassment

**Use Overlapping Keywords**:
Multiple rules can have overlapping keywords with different priorities.

```
Priority 90: Keywords=[assault, violence, threat] → Security + Legal
Priority 60: Keywords=[harassment, discrimination] → HR Team
```

A report mentioning "violent harassment" matches BOTH rules, but the higher priority (90) wins.

## Advanced Configurations

### Multi-Condition Rules

Combine multiple conditions for precise routing:

```
Name: Critical Financial Fraud → CFO + Legal
Priority: 95
Conditions:
  - Category: Financial
  - Urgency: Critical
  - Keywords: fraud, embezzlement, SEC violation
Assignment:
  - Assign to User: cfo@company.com
  - Assign to Team: legal
```

**Logic**: ALL conditions must match (AND logic):
- Category must be Financial
- Urgency must be Critical
- AND must contain at least one keyword

### Dual Assignment

Assign to both a user AND a team:

```
Assignment:
  - Assign to User: lead-investigator@company.com
  - Assign to Team: investigations
```

**Benefits**:
- Primary investigator gets direct assignment
- Team visibility for backup/support
- Knowledge sharing
- Coverage during absences

### Escalation Rules

Create layered rules for escalation:

```
Priority 100: [Financial + Critical] → CFO
Priority 80:  [Financial + High] → Finance Director
Priority 50:  [Financial + Medium/Low] → Finance Team
```

Higher-risk cases automatically escalate to senior leadership.

## Troubleshooting

### Rule Not Working

**Check List**:

1. **Is the rule enabled?**
   - Check the status column
   - Edit and toggle "Enabled" if needed

2. **Is the priority correct?**
   - Higher priority rules may be matching first
   - Check if another rule is catching the reports

3. **Do conditions match?**
   - Test with actual report data
   - Verify category, urgency, and keywords
   - Remember: ALL conditions must match

4. **Is assignment valid?**
   - User must be active team member
   - User email must be correct
   - Team name can be anything (not validated)

5. **Check workflow logs**:
   - Go to Workflows > History tab
   - View which rules matched
   - See assignment actions

### Reports Going to Wrong Team

**Diagnosis**:
- Check rule priority order
- Higher priority rule may be matching first
- Review conditions of all active rules

**Solution**:
- Adjust priorities to correct order
- Make conditions more specific
- Disable conflicting rules

### No Assignment Happening

**Possible Causes**:
- No active rules match the report
- All rules are disabled
- Conditions are too specific

**Solution**:
- Create a catch-all rule (priority 0, no conditions)
- Review and enable disabled rules
- Broaden conditions on existing rules

## Workflow History

### Viewing Assignment Logs

1. Navigate to **Workflows > History** tab
2. View all automated assignment actions
3. Filter by action type, date, or report ID

**Log Information**:
- Action type (e.g., "Auto-assigned")
- Report ID
- Rule that triggered
- Assignment details (user/team)
- Timestamp

**Uses**:
- Verify rules are working correctly
- Audit automated assignments
- Troubleshoot routing issues
- Compliance audit trail

## Best Practices

### Do:

✅ **Start Simple**: Create basic rules first, add complexity later
✅ **Use Descriptive Names**: Make rules easy to identify
✅ **Test Rules**: Submit test reports to verify routing
✅ **Document Priorities**: Keep a priority strategy document
✅ **Review Regularly**: Audit rules quarterly
✅ **Use Catch-All**: Always have a default rule
✅ **Monitor Logs**: Check workflow history periodically

### Don't:

❌ **Over-Complicate**: Too many conditions make rules fragile
❌ **Duplicate Priorities**: Use unique priorities when possible
❌ **Forget to Enable**: New rules default to enabled, but check
❌ **Delete Recklessly**: Disable first, delete later if not needed
❌ **Ignore Conflicts**: Multiple matching rules can cause confusion
❌ **Set and Forget**: Review and update as organization changes

### Recommended Setup

**Minimum Rules** (Small Organization):
```
1. Critical Cases → Leadership (Priority 100)
2. Financial → Finance Team (Priority 50)
3. HR → HR Team (Priority 50)
4. Safety → Safety Team (Priority 50)
5. Default → General Queue (Priority 0)
```

**Comprehensive Setup** (Large Organization):
```
1. Critical + Legal Keywords → General Counsel (Priority 100)
2. Critical → Director of Compliance (Priority 99)
3. Financial + Critical/High → CFO (Priority 90)
4. HR + Serious Keywords → HR Director + Legal (Priority 80)
5. Safety → Safety Officer + Team (Priority 70)
6. Keywords: harassment, etc. → HR Team (Priority 60)
7. Keywords: fraud, etc. → Finance + Legal (Priority 60)
8. Financial → Finance Team (Priority 50)
9. HR → HR Team (Priority 50)
10. Security → Security Team (Priority 50)
11. Default → Triage Team (Priority 0)
```

## Pricing & Availability

**Assignment Rules are available on**:
- Pro Plan: ✅ Up to 10 rules
- Enterprise Plan: ✅ Unlimited rules
- Basic Plan: ❌ Not available

**Limits**:
- Pro: 10 active rules maximum
- Enterprise: No practical limit
- All rules execute automatically
- No per-execution fees

## Getting Started

Ready to automate case assignment?

1. **Plan Your Strategy**: Map categories to teams
2. **Create Your First Rule**: Start with a simple category rule
3. **Test It**: Submit a test report to verify
4. **Add More Rules**: Build out your full routing strategy
5. **Monitor & Refine**: Check workflow logs and adjust

**Example First Rule**:
```
Name: Financial Reports → Finance Team
Priority: 50
Category: Financial
Urgency: Any
Keywords: (empty)
Assign to Team: finance
```

## Support

**Need help with Assignment Rules?**
- [SLA Management](/features/sla-management) - Manage response times
- [Workflow Guide](/cases/workflow) - Full workflow documentation
- [Team Management](/admin/team-management) - Manage team members
- [Contact Support](/support/contact)

---

**Assignment Rules transform report handling from manual sorting to intelligent, automated routing—saving time and ensuring every case reaches the right expert immediately.**
