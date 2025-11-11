# Monitoring Setup Using Sentry & Supabase MCPs

This document describes how monitoring is set up using the Sentry and Supabase MCP (Model Context Protocol) servers.

## Overview

The monitoring system uses:
- **Sentry MCP**: For error tracking, issue detection, and performance monitoring
- **Supabase MCP**: For infrastructure metrics, edge function logs, and database performance

## Current Status

### Sentry Monitoring ✅
- **Organization**: `disclosurely`
- **Project**: `disclosurely-production`
- **Region**: `https://de.sentry.io`
- **Status**: Configured and active
- **Current Metrics**:
  - Errors (24h): 0
  - Errors (7d): 0
  - Unresolved Issues: 0

### Supabase Monitoring ✅
- **Project**: `cxmuzperkittvibslnff`
- **Status**: Logs accessible via MCP
- **Current Issues Detected**:
  - `process-notifications-to-emails` edge function returning 500 errors
  - `process-pending-email-notifications` edge function returning 401 errors
  - `/functions/v1/logs` endpoint returning 404 (expected - endpoint doesn't exist)

## Monitoring Dashboard

### Location
- **Component**: `src/components/dashboard/SystemHealthDashboard.tsx`
- **Route**: `/admin` → System Health tab → Monitoring sub-tab
- **Access**: Disclosurely team members only (@disclosurely.com emails)

### Features
1. **System Health Tab**:
   - Database health and response time
   - Edge function status
   - Subscription metrics
   - Report metrics
   - Organization metrics

2. **Monitoring Tab**:
   - Sentry error metrics (24h, 7d, unresolved)
   - Supabase edge function errors
   - API error counts
   - System status and alerts

## MCP Integration

### Sentry MCP Functions Used

```typescript
// Find organization
mcp_sentry_find_organizations()

// Find projects
mcp_sentry_find_projects(organizationSlug, regionUrl)

// Search for issues
mcp_sentry_search_issues(
  organizationSlug,
  naturalLanguageQuery,
  regionUrl
)

// Search for events (counts/aggregations)
mcp_sentry_search_events(
  organizationSlug,
  naturalLanguageQuery,
  regionUrl
)

// Get issue details
mcp_sentry_get_issue_details(issueUrl)

// Analyze issues with Seer AI
mcp_sentry_analyze_issue_with_seer(issueUrl)
```

### Supabase MCP Functions Used

```typescript
// Get edge function logs
mcp_supabase_get_logs(service: 'edge-function')

// Get API logs
mcp_supabase_get_logs(service: 'api')

// Get security advisors
mcp_supabase_get_advisors(type: 'security')

// Get performance advisors
mcp_supabase_get_advisors(type: 'performance')
```

## Automated Monitoring Queries

### Sentry Queries

1. **Error Count (24 hours)**:
   ```typescript
   mcp_sentry_search_events(
     organizationSlug: 'disclosurely',
     naturalLanguageQuery: 'count of errors in the last 24 hours',
     regionUrl: 'https://de.sentry.io'
   )
   ```

2. **Unresolved Issues**:
   ```typescript
   mcp_sentry_search_issues(
     organizationSlug: 'disclosurely',
     naturalLanguageQuery: 'unresolved errors from the last 7 days',
     regionUrl: 'https://de.sentry.io'
   )
   ```

3. **Error Trends**:
   ```typescript
   mcp_sentry_search_events(
     organizationSlug: 'disclosurely',
     naturalLanguageQuery: 'errors by day for the last 7 days',
     regionUrl: 'https://de.sentry.io'
   )
   ```

### Supabase Queries

1. **Edge Function Errors**:
   ```typescript
   mcp_supabase_get_logs(service: 'edge-function')
   // Filter for status_code >= 400
   ```

2. **API Errors**:
   ```typescript
   mcp_supabase_get_logs(service: 'api')
   // Filter for status_code >= 400
   ```

3. **Performance Issues**:
   ```typescript
   mcp_supabase_get_advisors(type: 'performance')
   ```

## Alert Configuration

### Recommended Sentry Alerts

1. **Critical Error Spike**:
   - Condition: Error count > 10 in 5 minutes
   - Action: Email/Slack notification
   - Priority: P0

2. **New Production Issue**:
   - Condition: New issue detected
   - Action: Email notification
   - Priority: P1

3. **High Error Rate**:
   - Condition: Error rate > 5% of requests
   - Action: Email/Slack notification
   - Priority: P1

### Recommended Supabase Alerts

1. **Edge Function Failures**:
   - Condition: Function error rate > 5%
   - Action: Email notification
   - Priority: P1

2. **API Error Spike**:
   - Condition: API errors > 20 in 5 minutes
   - Action: Email notification
   - Priority: P1

3. **Database Performance**:
   - Condition: Query time > 1 second
   - Action: Email notification
   - Priority: P2

## Current Issues Detected

### Edge Function Errors

1. **`process-notifications-to-emails`**:
   - Status: 500 errors
   - Frequency: Multiple occurrences
   - Execution Time: 1-10 seconds
   - **Action Required**: Investigate and fix

2. **`process-pending-email-notifications`**:
   - Status: 401 errors (authentication)
   - Frequency: Multiple occurrences
   - Execution Time: 0.8-3.9 seconds
   - **Action Required**: Check authentication configuration

3. **`/functions/v1/logs`**:
   - Status: 404 errors
   - **Note**: This endpoint doesn't exist - expected behavior
   - **Action**: Remove calls to this endpoint or create the endpoint

## Monitoring Dashboard Implementation

The monitoring dashboard is implemented in two parts:

1. **Frontend Component** (`MonitoringDashboard.tsx`):
   - Displays real-time metrics
   - Auto-refreshes every 2 minutes
   - Shows Sentry and Supabase metrics

2. **Backend Edge Function** (`monitoring-dashboard/index.ts`):
   - Fetches metrics from Sentry and Supabase
   - Aggregates data
   - Returns JSON response

## Next Steps

1. **Fix Edge Function Errors**:
   - Investigate `process-notifications-to-emails` 500 errors
   - Fix authentication for `process-pending-email-notifications`
   - Remove or create `/functions/v1/logs` endpoint

2. **Set Up Automated Alerts**:
   - Configure Sentry alerts via dashboard
   - Set up Supabase alerts (if available)
   - Configure notification channels (Email/Slack)

3. **Enhance Monitoring**:
   - Add more detailed metrics
   - Create performance dashboards
   - Set up automated reports

4. **Implement Alert Actions**:
   - Create runbooks for common issues
   - Set up automated remediation (where possible)
   - Configure escalation policies

## Access

- **Monitoring Dashboard**: `/admin` → System Health → Monitoring tab
- **Sentry Dashboard**: https://disclosurely.sentry.io
- **Supabase Dashboard**: https://supabase.com/dashboard/project/cxmuzperkittvibslnff

## Maintenance

### Daily
- Review Sentry errors
- Check Supabase edge function logs
- Review system health dashboard

### Weekly
- Analyze error trends
- Review performance metrics
- Check for new issues

### Monthly
- Review alert effectiveness
- Optimize monitoring queries
- Update runbooks

