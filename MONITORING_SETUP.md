# Production Monitoring & Alerting Setup Guide

This document outlines the monitoring and alerting setup for Disclosurely production environment.

## 1. Sentry Error Tracking

### Current Configuration
- **Status**: ✅ Configured
- **Location**: `src/main.tsx`
- **Features Enabled**:
  - Error tracking
  - Session replay (10% sample rate, 100% on errors)
  - Source maps (uploaded on build)
  - Performance monitoring (disabled to stay in free tier)

### Environment Variables Required
```bash
VITE_SENTRY_DSN=<your-sentry-dsn>
VITE_SENTRY_ENVIRONMENT=production
VITE_SENTRY_RELEASE=<git-commit-sha>
SENTRY_AUTH_TOKEN=<sentry-auth-token>  # For source map uploads
SENTRY_ORG=disclosurely
SENTRY_PROJECT=disclosurely-production
```

### Setting Up Alerts in Sentry Dashboard

1. **Critical Error Alerts**:
   - Navigate to: Settings → Alerts → Create Alert
   - Condition: Error count > 10 in 5 minutes
   - Action: Email/Slack notification to team
   - Alert Name: "Critical Error Spike"

2. **New Issue Alerts**:
   - Condition: New issue detected
   - Action: Email notification
   - Alert Name: "New Production Issue"

3. **Performance Degradation**:
   - Condition: P95 response time > 2s
   - Action: Email/Slack notification
   - Alert Name: "Performance Degradation"

4. **Release Alerts**:
   - Condition: New release deployed
   - Action: Email notification
   - Alert Name: "New Release Deployed"

### Recommended Alert Rules
- **High Priority**: Errors affecting > 5% of users
- **Medium Priority**: Errors affecting 1-5% of users
- **Low Priority**: Errors affecting < 1% of users

## 2. Supabase Metrics & Monitoring

### Available Metrics in Supabase Dashboard

1. **Database Performance**:
   - Query performance (slow queries)
   - Connection pool usage
   - Database size and growth
   - Index usage statistics

2. **Edge Functions**:
   - Execution count
   - Error rate
   - Average execution time
   - Invocation logs

3. **API Metrics**:
   - Request count
   - Response times
   - Error rates
   - Rate limiting

4. **Storage**:
   - Storage usage
   - Bandwidth usage
   - File upload/download metrics

### Setting Up Supabase Alerts

1. **Database Alerts**:
   - Navigate to: Project Settings → Database → Alerts
   - Set up alerts for:
     - High connection pool usage (> 80%)
     - Slow queries (> 1 second)
     - Database size approaching limits

2. **Edge Function Alerts**:
   - Navigate to: Edge Functions → Logs
   - Set up alerts for:
     - High error rate (> 5%)
     - Function timeouts
     - Unusual invocation patterns

3. **API Alerts**:
   - Navigate to: API → Logs
   - Set up alerts for:
     - High error rate (> 1%)
     - Rate limit violations
     - Unusual traffic patterns

### Recommended Monitoring Queries

```sql
-- Check for slow queries
SELECT 
  query,
  calls,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 1000
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Check database size
SELECT 
  pg_size_pretty(pg_database_size(current_database())) as database_size;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;
```

## 3. System Health Dashboard

### Location
- **Component**: `src/components/dashboard/SystemHealthDashboard.tsx`
- **Route**: `/admin` → System Health tab
- **Access**: Disclosurely team members only (@disclosurely.com emails)

### Metrics Displayed
- Database health and response time
- Edge function status
- Subscription metrics (active, expired, past due, trialing)
- Report metrics (total, active, archived, today)
- Organization metrics
- System activity

### Auto-Refresh
- Dashboard refreshes every 5 minutes automatically
- Manual refresh button available

## 4. Vercel Monitoring

### Available Metrics
- Deployment status
- Build logs
- Function execution logs
- Edge network performance
- Bandwidth usage

### Setting Up Vercel Alerts
1. Navigate to: Project Settings → Notifications
2. Configure alerts for:
   - Failed deployments
   - Build failures
   - Function errors
   - High bandwidth usage

## 5. Custom Health Checks

### Database Health Check
The system health dashboard includes a database health check that:
- Measures response time
- Detects connection issues
- Reports status (healthy/degraded/down)

### Edge Function Health Check
- Checks function availability
- Monitors execution success rate
- Tracks active vs total functions

## 6. Alert Channels

### Recommended Channels
1. **Email**: For all alerts (team@disclosurely.com)
2. **Slack**: For critical alerts only
3. **PagerDuty**: For critical production issues (optional)

### Alert Priority Levels
- **P0 (Critical)**: System down, data loss, security breach
- **P1 (High)**: Major feature broken, > 10% users affected
- **P2 (Medium)**: Minor feature broken, < 10% users affected
- **P3 (Low)**: Cosmetic issues, edge cases

## 7. Logging Best Practices

### Frontend Logging
- Use centralized logger (`src/utils/logger.ts`)
- Log levels: `info`, `warn`, `error`
- Context: Include relevant context (user ID, organization ID, etc.)
- Never log sensitive data (passwords, tokens, PII)

### Backend Logging
- Edge functions log to Supabase logs
- Use structured logging (JSON format)
- Include request IDs for tracing
- Log all errors with stack traces

## 8. Performance Monitoring

### Key Metrics to Track
- Page load times
- API response times
- Database query performance
- Edge function execution time
- Error rates by endpoint
- User session duration

### Performance Budgets
- Page load: < 3 seconds
- API response: < 500ms (p95)
- Database query: < 100ms (p95)
- Edge function: < 2 seconds (p95)

## 9. Uptime Monitoring

### Recommended Tools
- **UptimeRobot**: Free tier available, 5-minute checks
- **Pingdom**: More features, paid
- **StatusPage**: For public status page

### Endpoints to Monitor
- `https://disclosurely.com` (Main site)
- `https://disclosurely.com/api/health` (Health check endpoint - to be created)
- `https://cxmuzperkittvibslnff.supabase.co` (Supabase API)

## 10. Security Monitoring

### What to Monitor
- Failed login attempts
- Unusual API usage patterns
- Suspicious database queries
- Rate limit violations
- Authentication failures

### Alert Thresholds
- > 10 failed logins from same IP in 5 minutes
- > 100 API requests per minute from single user
- Unusual database query patterns
- Authentication errors > 5% of requests

## 11. Next Steps

1. ✅ Sentry configured and working
2. ✅ System health dashboard created
3. ⏳ Set up Sentry alerts in dashboard
4. ⏳ Configure Supabase alerts
5. ⏳ Set up Vercel notifications
6. ⏳ Create health check endpoint
7. ⏳ Set up uptime monitoring
8. ⏳ Configure alert channels (Slack/PagerDuty)

## 12. Maintenance

### Daily Checks
- Review Sentry errors
- Check system health dashboard
- Review Supabase logs

### Weekly Reviews
- Analyze error trends
- Review performance metrics
- Check subscription health
- Review security alerts

### Monthly Reviews
- Performance optimization opportunities
- Cost analysis (Supabase, Vercel, Sentry)
- Capacity planning
- Security audit

