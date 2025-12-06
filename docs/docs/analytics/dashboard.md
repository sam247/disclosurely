---
title: Analytics Dashboard - Disclosurely Real-Time Insights
description: Comprehensive guide to the Disclosurely analytics dashboard with real-time metrics, interactive charts, filtering capabilities, and data export features.
head:
  - - meta
    - property: og:title
      content: Analytics Dashboard Guide - Disclosurely
  - - meta
    - property: og:description
      content: Comprehensive guide to the Disclosurely analytics dashboard with real-time metrics, interactive charts, filtering capabilities, and data export features.
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
      content: Analytics Dashboard - Disclosurely
  - - meta
    - name: twitter:description
      content: Comprehensive guide to the Disclosurely analytics dashboard with real-time metrics, interactive charts, filtering capabilities, and data export features.
  - - meta
    - name: twitter:image
      content: https://disclosurely.com/docs/ogimage.png
---

# Analytics Dashboard

Your central command center for monitoring and analyzing your whistleblowing program's performance in real-time.

## Overview

The Analytics Dashboard provides a comprehensive, visual overview of your organization's whistleblowing program. Monitor case volumes, track resolution times, analyze trends, and identify patterns—all from a single, intuitive interface that updates in real-time as your team works.

**Access:** Dashboard > Analytics

## Dashboard Layout

### Header Section

**Key Performance Indicators (KPIs)**

Four primary metrics displayed at the top of the dashboard:

1. **Total Reports**
   - All-time count of submitted reports
   - Quick filter: Click to view all reports
   - Updated in real-time as new reports arrive

2. **Active Cases**
   - Currently under investigation
   - Excludes closed, resolved, and archived
   - Color-coded:
     - 🟢 Green: Normal workload
     - 🟡 Yellow: High volume
     - 🔴 Red: Overwhelming volume (may need more resources)

3. **Average Response Time**
   - Time from submission to first acknowledgment
   - Measured in hours and days
   - SLA indicator:
     - ✅ Within target
     - ⚠️ Approaching limit
     - ❌ Breached SLA

4. **Resolution Rate**
   - Percentage of cases successfully closed
   - Target benchmark displayed
   - Trend indicator (↑ improving, ↓ declining, → stable)

### Main Chart Area

**Case Volume Trends**

Interactive line chart showing report submissions over time.

**Time Period Options:**
- Daily (last 30 days)
- Weekly (last 12 weeks)
- Monthly (last 12 months)
- Yearly (all years)

**Features:**
- Hover to see exact counts for each period
- Click data points to drill down into specific dates
- Identify spikes or unusual patterns
- Compare multiple time periods

**Use Cases:**
- Detect seasonal trends
- Identify reporting spikes that may indicate systemic issues
- Monitor program adoption and usage
- Plan resource allocation

### Category Distribution

**Pie/Doughnut Chart**

Visual breakdown of cases by category.

**Default Categories:**
- Harassment & Discrimination
- Financial Misconduct
- Health & Safety
- Data Privacy
- Conflicts of Interest
- Retaliation
- Other

**Features:**
- Percentage and count for each category
- Click slice to filter dashboard to that category
- Hover for detailed breakdown
- Color-coded for easy identification

**Insights:**
- Identify most common issue types
- Detect emerging risk areas
- Guide training and policy development
- Allocate investigation resources

### Priority Breakdown

**Bar Chart**

Distribution of cases across priority levels.

**Priority Levels:**
- 🔴 Critical - Immediate action required
- 🟠 High - Urgent attention needed
- 🟡 Medium - Normal processing
- 🟢 Low - Routine handling

**Features:**
- Count and percentage for each level
- Click bar to filter by priority
- Compare against historical averages
- Identify workload balance

### Status Overview

**Stacked Bar or Area Chart**

Case flow through different investigation stages.

**Statuses Tracked:**
- New/Unassigned
- Assigned
- In Progress
- Pending Information
- Under Review
- Resolved
- Closed
- Archived

**Insights:**
- Identify bottlenecks in investigation process
- Monitor case progression
- Detect cases stuck in specific statuses
- Improve workflow efficiency

## Advanced Filtering

### Date Range Selector

**Predefined Ranges:**
- Today
- Last 7 days
- Last 30 days
- Last 90 days
- Last 12 months
- Year to Date
- All Time

**Custom Range:**
- Click "Custom" to select specific start/end dates
- Compare two different time periods
- Analyze specific incident timeframes

### Smart Filters

**Available Filters:**

**Category**
- Select one or multiple categories
- Exclude specific categories
- View uncategorized reports

**Priority**
- Filter by urgency level
- Combine with other filters
- Track high-priority case resolution

**Status**
- View cases in specific investigation stages
- Track workflow progression
- Identify stalled cases

**Assignment**
- Filter by assigned user
- View unassigned cases
- Monitor team workload distribution

**Department/Location**
- Analyze specific departments
- Geographic patterns
- Organizational unit comparison

**Report Type**
- Anonymous vs. Confidential
- With/without attachments
- Risk level

**AI Metrics**
- Risk score range (1-10)
- Pattern-detected cases
- AI-flagged issues

### Saving Filter Combinations

**Create Custom Views:**

1. Apply your desired filters
2. Click **Save View**
3. Name your view (e.g., "High Priority Financial Cases")
4. Access quickly from **Saved Views** dropdown

**Pre-Built Views:**
- High Risk Cases
- Overdue Responses
- Unassigned Reports
- Recently Closed
- Long-Running Investigations

## Interactive Features

### Drill-Down Analysis

**Click any chart element to:**
- Filter entire dashboard to that subset
- View detailed case list
- Explore underlying data
- Export filtered results

**Example Workflows:**

**Analyze Category Spike:**
1. Notice unusual increase in "Harassment" category
2. Click on harassment slice in pie chart
3. Dashboard filters to show only harassment cases
4. Review timeline to identify when spike occurred
5. Examine individual cases for patterns

**Monitor Team Performance:**
1. Filter by specific team member
2. Review their assigned case count
3. Check average resolution time
4. Compare to team average
5. Identify training needs or recognition opportunities

### Chart Interactions

**Hover for Details:**
- Exact values and percentages
- Trend comparisons
- Additional metadata

**Click to Filter:**
- All charts support click-to-filter
- Multiple selections with Ctrl/Cmd+Click
- Right-click for additional options

**Zoom and Pan:**
- Timeline charts support zooming
- Pan across long time periods
- Reset zoom with double-click

## Export and Reporting

### Export Options

**Dashboard Snapshot (PDF)**
- Captures current view with all charts
- Includes header with date range and filters
- Branded with organization logo
- Perfect for board presentations

**Data Export (CSV)**
- Raw data behind current view
- All fields included
- Compatible with Excel, Google Sheets
- Further analysis and manipulation

**Excel Report (XLSX)**
- Formatted tables and charts
- Multiple sheets for different metrics
- Formulas and pivot tables included
- Advanced analysis ready

### Scheduling Automated Reports

**Set Up Recurring Reports:**

1. Navigate to **Analytics > Reports**
2. Click **Schedule Report**
3. Configure:
   - Report type (Dashboard, Statistics, Compliance)
   - Frequency (Daily, Weekly, Monthly)
   - Recipients (email addresses)
   - Format (PDF, CSV, Excel)
   - Filters to apply
4. Save schedule

**Automated Report Features:**
- Delivered automatically via email
- Always uses latest data
- Can include multiple dashboards
- Maintains consistent formatting

## Key Metrics Explained

### Response Time Calculation

**How it's measured:**
- **Start:** Report submission timestamp
- **End:** First acknowledgment or status change by team member
- **Excludes:** Non-business hours (optional setting)

**Benchmarks:**
- ✅ Excellent: < 24 hours
- ⚠️ Good: 24-48 hours
- ❌ Needs Improvement: > 48 hours

### Resolution Rate Formula

```
Resolution Rate = (Closed Cases / Total Cases) × 100
```

**What counts as "Closed":**
- Investigation completed
- Findings documented
- Reporter notified (if applicable)
- Final status set to "Closed" or "Resolved"

**Industry Benchmarks:**
- 70-80%: Typical for complex organizations
- 80-90%: Well-managed programs
- 90%+: Exceptional performance

### Escalation Tracking

**Escalation Indicators:**
- Priority increased (e.g., Medium → High)
- Reassigned to senior investigator
- Flagged for management review
- Extended beyond standard timeline

**Escalation Rate:**
```
(Escalated Cases / Total Cases) × 100
```

**What it means:**
- < 10%: Normal operations
- 10-20%: Some systemic issues present
- > 20%: May indicate training needs or policy gaps

## Best Practices

### Daily Dashboard Review (5-10 minutes)

**Morning Routine:**

✅ **Check New Reports**
- Review cases submitted in last 24 hours
- Identify any critical/high-priority cases
- Ensure proper assignment

✅ **Monitor SLA Compliance**
- Check response time indicator
- Identify cases approaching deadlines
- Send reminders to team if needed

✅ **Review Active Case Count**
- Ensure balanced workload
- Reassign if necessary
- Flag resource constraints

### Weekly Trend Analysis (15-30 minutes)

✅ **Compare Week-over-Week:**
- Case volumes
- Resolution rates
- Response times
- Category distribution

✅ **Identify Patterns:**
- Recurring issues
- Department-specific trends
- Seasonal variations

✅ **Adjust Resources:**
- Reallocate investigators based on workload
- Plan training for frequently reported issues
- Update policies if needed

### Monthly Reporting (30-60 minutes)

✅ **Generate Executive Summary:**
- Total cases received
- Top categories
- Resolution rate
- Key wins and challenges

✅ **Benchmark Progress:**
- Compare to previous months
- Track towards annual goals
- Identify improvement areas

✅ **Stakeholder Communication:**
- Share dashboard snapshot with audit committee
- Present trends to management
- Report compliance metrics to regulators

## Customization Options

### Dashboard Widgets

**Rearrange Layout:**
1. Click **Customize Dashboard**
2. Drag and drop widgets to preferred positions
3. Resize widgets by dragging corners
4. Hide widgets you don't need
5. Save layout

**Available Widgets:**
- KPI Summary Cards
- Case Volume Timeline
- Category Distribution
- Priority Breakdown
- Status Flow Chart
- Recent Activity Feed
- Upcoming Deadlines
- Team Performance
- AI Insights

### Color Schemes

**Accessibility Options:**
- Standard (color-coded)
- High contrast
- Colorblind-friendly palettes
- Grayscale for printing

### Data Refresh Rate

**Configure Update Frequency:**
- Real-time (instant updates)
- Every 5 minutes
- Every 15 minutes
- Every hour
- Manual refresh only

**Note:** Real-time updates may impact browser performance with large datasets.

## Troubleshooting

**Dashboard not loading?**
- Check internet connection
- Clear browser cache
- Try different browser
- Contact support if issue persists

**Charts showing "No Data"?**
- Verify date range isn't too narrow
- Check applied filters (may be too restrictive)
- Ensure you have cases in the system
- Confirm you have permission to view data

**Export failing?**
- Check available storage quota
- Try smaller date range
- Use different format
- Disable browser extensions temporarily

**Slow performance?**
- Reduce date range
- Apply more specific filters
- Close unused browser tabs
- Clear browser cache

## Privacy & Security

**Access Controls:**
- Viewers: See only assigned cases
- Case Handlers: See all cases in scope
- Admins: Full analytics access
- Audit trail logs all analytics access

**Data Anonymization:**
- PII automatically redacted in charts
- Export options include anonymization
- Aggregate data safe for sharing

**Learn More:** [Security Overview](/security/overview)

## Related Pages

- [Analytics Overview](/analytics/overview) - Introduction to analytics
- [Statistics & Metrics](/analytics/statistics) - Detailed metrics guide
- [Compliance Analytics](/analytics/compliance-analytics) - Regulatory reporting
- [Pattern Detection](/ai/pattern-detection) - AI-powered insights
- [Assignment Rules](/features/assignment-rules) - Automated case routing

## Support

Need help with the dashboard?
- Email: support@disclosurely.com
- [Contact Support](/support/contact)
- [Video Tutorials](https://disclosurely.com/tutorials)
