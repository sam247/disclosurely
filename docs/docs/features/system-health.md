---
title: System Health & Status Monitoring | Disclosurely
description: Real-time platform uptime monitoring, performance metrics, incident reporting, and service status updates. Track system health, scheduled maintenance, and historical performance.
head:
  - - meta
    - property: og:title
      content: System Health & Status Monitoring - Disclosurely
  - - meta
    - property: og:description
      content: Real-time platform uptime monitoring, performance metrics, incident reporting, and service status updates. Track system health, scheduled maintenance, and historical performance.
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
      content: System Health & Status - Disclosurely
  - - meta
    - name: twitter:description
      content: Real-time platform uptime monitoring, performance metrics, incident reporting, and service status updates. Track system health, scheduled maintenance, and historical performance.
  - - meta
    - name: twitter:image
      content: https://disclosurely.com/docs/ogimage.png
---

# System Health & Status Monitoring

Monitor Disclosurely's platform health with real-time uptime tracking, performance metrics, incident reporting, and service status updates—ensuring your whistleblowing channel is always available when needed.

## Overview

System reliability is critical for whistleblowing platforms. Reporters must have confidence that they can submit reports at any time, and organizations need assurance that their compliance infrastructure is operational 24/7. Disclosurely provides comprehensive system health monitoring with transparent status reporting.

**Key Features:**
- Real-time uptime monitoring
- Performance metrics dashboard
- Incident notifications
- Scheduled maintenance windows
- Historical uptime reports
- Service level agreement (SLA) tracking
- Regional status monitoring

**Access:** status.disclosurely.com (public) or Dashboard > System Health (authenticated)

**Uptime Target:** 99.9% uptime (SLA for Pro and Enterprise plans)

## Status Page

### Public Status Page

**Real-Time System Status:**

**Access:** https://status.disclosurely.com

**Always Available:**
- No login required
- Accessible even during incidents
- Mobile-responsive
- Multiple CDN nodes for reliability

**Status Overview:**

**Service Components:**

**1. Reporting Portal**
- ✅ Operational
- ⚠️ Degraded Performance
- ⏸️ Partial Outage
- 🔴 Major Outage

**2. Dashboard (Admin Interface)**
- Status indicator
- Response time (ms)
- Last updated timestamp

**3. Secure Messaging**
- Messaging service status
- Notification delivery
- Real-time sync status

**4. File Uploads**
- Upload service status
- Storage availability
- Processing queue status

**5. Email Notifications**
- Email delivery status
- Queue length
- Delivery rate

**6. API Services** (Enterprise)
- API endpoint status
- Rate limit status
- Response times

**7. Database**
- Primary database status
- Replica status
- Backup system status

**8. Search & Analytics**
- Search service status
- Analytics processing
- Report generation

**Overall Status:**

**System-Wide Indicator:**
- 🟢 **All Systems Operational** - Everything running normally
- 🟡 **Degraded Performance** - System slower than usual but functional
- 🟠 **Partial Outage** - Some services unavailable
- 🔴 **Major Outage** - Critical services down

### Current Incidents

**Active Incidents:**

When issues occur, incidents are posted in real-time:

**Incident Information:**
- **Title:** Brief description (e.g., "Slow dashboard loading")
- **Status:** Investigating, Identified, Monitoring, Resolved
- **Severity:** Minor, Major, Critical
- **Affected Services:** Which components impacted
- **Started:** Time incident began
- **Updates:** Chronological updates as situation evolves

**Example Incident:**
```
🟠 Slow File Upload Processing
Status: Monitoring
Severity: Major
Affected: File Uploads
Started: 2025-01-15 14:30 UTC

Updates:
[15:45 UTC] Resolved - Upload processing returned to normal.
            Monitoring continues for 1 hour.
[15:20 UTC] Identified - High load on processing servers.
            Scaling up capacity.
[14:45 UTC] Investigating - Reports of slow upload processing.
            Team investigating cause.
```

**Incident Transparency:**

All incidents are publicly disclosed:
- Root cause analysis published (post-resolution)
- Impact duration clearly stated
- Affected user count (anonymized)
- Remediation steps taken
- Preventive measures implemented

### Scheduled Maintenance

**Planned Downtime:**

Maintenance windows scheduled and communicated in advance:

**Maintenance Notice:**
- **Date & Time:** Exact start time (UTC and local time zones)
- **Duration:** Expected maintenance window
- **Affected Services:** What will be unavailable
- **Impact:** How users will be affected
- **Alternative Access:** Workarounds if any

**Example:**
```
🔧 Scheduled Maintenance: Database Upgrades
Date: Sunday, January 28, 2025
Time: 02:00 - 04:00 UTC (10:00 PM - 12:00 AM EST)
Duration: ~2 hours
Affected: All services briefly (5-minute window)
Impact: Brief interruption during final cutover
Status: Scheduled
```

**Advance Notice:**
- **Minor Maintenance:** 7 days advance notice
- **Major Maintenance:** 14 days advance notice
- **Emergency Maintenance:** As much notice as possible (minimum 2 hours)

**Maintenance Schedule:**

Maintenance typically scheduled during:
- Weekend hours (Saturday/Sunday)
- Late night (02:00-05:00 UTC)
- Low-traffic periods
- Regional off-peak hours

## Performance Metrics

### Response Time Monitoring

**Real-Time Performance:**

**Access:** Status page > Performance Metrics

**Metrics Displayed:**

**1. Page Load Times**
- Reporting portal homepage: Target <2 seconds
- Dashboard load: Target <3 seconds
- Report submission: Target <1 second per page

**2. API Response Times** (Enterprise)
- Average response time: Target <200ms
- 95th percentile: Target <500ms
- 99th percentile: Target <1000ms

**3. Database Query Performance**
- Average query time: Target <50ms
- Slow query count: Target <0.1% of queries

**4. File Upload Speed**
- Average upload speed: Varies by connection
- Processing time: Target <30 seconds
- Thumbnail generation: Target <10 seconds

**Performance Visualization:**

**Graphs Available:**
- Last 24 hours (real-time updates)
- Last 7 days (daily averages)
- Last 30 days (weekly trends)
- Last 90 days (monthly trends)

**Color Coding:**
- 🟢 **Green:** Normal performance
- 🟡 **Yellow:** Slower than average but acceptable
- 🟠 **Orange:** Degraded performance
- 🔴 **Red:** Unacceptable performance

### Uptime Percentage

**Uptime Tracking:**

**Current Month:**
- Percentage uptime (99.X%)
- Downtime minutes
- Number of incidents
- Mean time to resolution (MTTR)

**Last 90 Days:**
- Uptime by month
- Trend analysis
- Incident frequency
- Performance comparison

**Historical Uptime:**

**Access:** Status page > Uptime History

**Uptime by Service:**
- Reporting Portal: 99.97%
- Dashboard: 99.95%
- Secure Messaging: 99.98%
- File Uploads: 99.93%
- API Services: 99.99%

**Industry Benchmark:**

Disclosurely targets:
- **Free Plan:** 99.5% uptime (best effort)
- **Starter Plan:** 99.5% uptime (guaranteed)
- **Pro Plan:** 99.9% uptime (guaranteed with SLA)
- **Enterprise Plan:** 99.95% uptime (guaranteed with SLA and credits)

**Learn More:** [Subscription Tiers](/features/subscription-tiers)

## Incident Management

### Incident Classification

**Severity Levels:**

**Critical (P0):**
- Complete service outage
- Data security breach
- Data loss risk
- All users affected

**Response:**
- Immediate all-hands response
- Updates every 30 minutes
- Executive notification
- Postmortem required

**Major (P1):**
- Significant functionality unavailable
- Many users affected
- Core features degraded
- Workaround available but difficult

**Response:**
- Rapid response team engaged
- Updates every hour
- Senior engineering involved
- Postmortem recommended

**Minor (P2):**
- Limited functionality impact
- Small user subset affected
- Non-critical features affected
- Easy workaround available

**Response:**
- Standard response procedures
- Updates as needed
- Resolution during business hours
- Internal review

**Maintenance (P3):**
- Scheduled or planned work
- Minimal user impact
- Communicated in advance
- Brief interruptions only

**Response:**
- Standard change management
- Advance communication
- Rollback plan ready

### Communication During Incidents

**Notification Channels:**

**1. Status Page Updates**
- Real-time incident updates
- Chronological timeline
- Resolution status

**2. Email Notifications** (Subscribed Users)
- Incident detected
- Major updates
- Resolution confirmation
- Postmortem publication

**3. In-App Banners**
- Active incident notification
- Link to status page
- Expected resolution time

**4. Social Media** (Major Incidents)
- Twitter: @DisclosurelyStatus
- LinkedIn: Company page updates

**5. Direct Contact** (Enterprise Only)
- Dedicated account manager notification
- Phone call for critical incidents
- Slack/Teams integration

**Subscribe to Notifications:**

**How to Subscribe:**
1. Visit status.disclosurely.com
2. Click **"Subscribe to Updates"**
3. Enter email address
4. Select notification preferences:
   - All incidents
   - Major and critical only
   - Scheduled maintenance only
   - Specific service subscriptions
5. Confirm subscription

### Incident Postmortems

**Transparency Reports:**

After major incidents, detailed postmortems published:

**Postmortem Contents:**

**1. Incident Summary**
- What happened
- When it occurred
- Duration of impact
- Number of users affected

**2. Timeline**
- Detection time
- Response milestones
- Resolution time
- Communication timeline

**3. Root Cause Analysis**
- Technical cause identified
- Contributing factors
- Why it wasn't prevented

**4. Impact Assessment**
- Services affected
- User experience impact
- Data integrity confirmation
- Financial impact (if SLA credits owed)

**5. Remediation**
- Immediate fixes applied
- Long-term improvements planned
- Process changes implemented
- Additional monitoring added

**6. Lessons Learned**
- What went well
- What could be improved
- Action items with owners
- Timeline for implementation

**Example:**

View past postmortems: status.disclosurely.com/postmortems

## Regional Status

### Multi-Region Infrastructure

**Geographic Distribution:**

Disclosurely operates in multiple regions:

**Primary Regions:**
- 🇺🇸 **US East** (Virginia) - Primary
- 🇺🇸 **US West** (Oregon) - Secondary
- 🇪🇺 **EU West** (Ireland) - EU customers
- 🇬🇧 **UK** (London) - UK customers

**Status by Region:**

Each region displays independent status:
- Regional uptime
- Regional response times
- Regional incident history
- Failover status

**Data Residency:**

Customers can choose data region:
- EU customers: Data stored in EU
- UK customers: Data stored in UK
- US customers: Data stored in US
- Other regions: Closest data center

**Learn More:** [Security Overview](/security/overview)

### Failover & Redundancy

**High Availability:**

**Automatic Failover:**
- Primary region failure triggers automatic failover
- Traffic routed to healthy region
- User sessions preserved
- Seamless experience (typically <30 seconds)

**Database Replication:**
- Real-time replication across regions
- Multi-region backups
- Point-in-time recovery
- Zero data loss (RPO: 0 seconds)

**Load Balancing:**
- Intelligent traffic routing
- Health checks every 10 seconds
- Automatic removal of unhealthy servers
- Geographic load distribution

**Status Indicators:**

**Access:** Status page > Infrastructure

**Components:**
- Load balancers: Status and traffic distribution
- Application servers: Count of healthy servers
- Database clusters: Primary and replica status
- Cache servers: Hit rate and availability
- File storage: Availability and capacity

## Service Level Agreements (SLA)

### Uptime Guarantees

**Plan-Based SLAs:**

**Pro Plan SLA:**
- **Guarantee:** 99.9% monthly uptime
- **Downtime Allowance:** ~43 minutes/month
- **Measurement:** Reporting portal availability
- **Credits:** 5% monthly fee credit per 0.1% below guarantee

**Enterprise Plan SLA:**
- **Guarantee:** 99.95% monthly uptime
- **Downtime Allowance:** ~22 minutes/month
- **Measurement:** All critical services
- **Credits:** 10% monthly fee credit per 0.1% below guarantee
- **Additional:** Priority support during incidents

**SLA Exclusions:**

Downtime not counted toward SLA:
- Scheduled maintenance (with advance notice)
- Incidents caused by customer actions
- Force majeure events (natural disasters, etc.)
- Third-party service failures (DNS, CDN, etc.)
- DDoS attacks (we mitigate but don't guarantee)

**Learn More:** [Subscription Tiers](/features/subscription-tiers)

### SLA Credit Requests

**How to Request Credits:**

If SLA not met:

**Process:**
1. Verify downtime exceeded SLA allowance
2. Email: sla@disclosurely.com
3. Provide:
   - Your organization name
   - Incident dates/times
   - Affected services
   - Impact description
4. Review within 5 business days
5. Credits applied to next invoice

**Credit Calculation:**

**Example:**
- Pro plan: $99/month
- SLA: 99.9% uptime
- Actual: 99.7% uptime (0.2% below SLA)
- Credits: 2 × 5% = 10% of monthly fee = $9.90

**Maximum Credits:**
- Pro plan: Maximum 50% of monthly fee
- Enterprise plan: Maximum 100% of monthly fee

**Credits Do Not:**
- Waive termination fees
- Extend service beyond agreement
- Compensate for data loss (separate policy)
- Apply to free or starter plans

## Health Monitoring Dashboard

### Internal Health Dashboard

**For Administrators:**

**Access:** Dashboard > System Health (authenticated users only)

**Organization-Specific Metrics:**

**1. Your Reporting Portal Status**
- Custom domain health
- SSL certificate status
- Link availability
- Form submission success rate

**2. File Upload Performance**
- Average upload speed (your organization)
- Failed uploads count
- Storage usage and limits
- Processing queue for your files

**3. Email Delivery**
- Notification delivery rate
- Bounce rate
- Email queue status
- Failed deliveries

**4. API Usage** (Enterprise)
- API calls per day
- Rate limit status
- Error rate
- Endpoint performance

**5. Integration Health**
- Webhook delivery status
- SSO authentication success rate
- Third-party integration status

**Custom Alerts:**

**Set Up Alerts:**

Configure notifications for your organization:

**Alert Conditions:**
- Report submission failures
- Email delivery failures
- Storage capacity warnings
- API rate limit approaching
- Custom domain SSL expiration
- Unusual activity patterns

**Notification Methods:**
- Email to administrators
- In-app notifications
- Slack/Teams integration (Enterprise)
- SMS alerts (Enterprise, critical only)

**Access:** Dashboard > Settings > Alerts

### Diagnostic Tools

**Self-Service Diagnostics:**

**Access:** Dashboard > System Health > Diagnostics

**Available Tools:**

**1. Connection Test**
- Test connection to Disclosurely servers
- Measure latency
- Check firewall/proxy issues
- DNS resolution check

**2. Email Deliverability Test**
- Send test notification
- Verify email receiving
- Check spam folder
- SPF/DKIM verification

**3. File Upload Test**
- Test file upload functionality
- Measure upload speed
- Verify processing
- Check browser compatibility

**4. API Health Check** (Enterprise)
- Test API authentication
- Verify endpoint access
- Check rate limits
- Sample request/response

**5. Custom Domain Test**
- Verify DNS configuration
- Check SSL certificate
- Test routing
- Validate CNAME records

**Test Results:**

Each test provides:
- ✅ Pass/❌ Fail status
- Detailed error messages if failed
- Recommendations for fixes
- Support contact if assistance needed

## Monitoring Best Practices

### For Organizations

✅ **Subscribe to Status Updates:**
- Monitor platform status proactively
- Receive incident notifications
- Plan around scheduled maintenance

✅ **Monitor Your Metrics:**
- Review internal health dashboard weekly
- Track report submission success rate
- Monitor email delivery rate
- Watch storage usage trends

✅ **Set Up Alerts:**
- Configure critical alerts
- Ensure multiple administrators notified
- Test alert delivery quarterly
- Review alert history

✅ **Review SLA Performance:**
- Track monthly uptime
- Compare to SLA guarantees
- Request credits when appropriate
- Escalate concerns early

✅ **Test Integrations:**
- Verify webhooks delivering
- Test SSO authentication monthly
- Check API access regularly
- Validate email routing

### For Reporters

✅ **Check Status Before Reporting:**
- Visit status page if experiencing issues
- Verify it's not a known incident
- Check scheduled maintenance calendar

✅ **Understand Incident Status:**
- "Investigating" = Team aware, working on it
- "Identified" = Root cause known
- "Monitoring" = Fix applied, watching for stability
- "Resolved" = Issue fully resolved

✅ **Use Alternative Channels:**
- If online reporting unavailable, check for:
  - Phone hotline (if configured)
  - Email reporting (if configured)
  - In-person reporting (if available)

## Historical Performance

### Performance Reports

**Monthly Performance Reports:**

**Access:** status.disclosurely.com/reports

**Report Contents:**

**Uptime Summary:**
- Overall uptime percentage
- Uptime by service
- Downtime breakdown
- Incident count and severity

**Performance Metrics:**
- Average response times
- Performance compared to targets
- Improvement trends
- Regional performance

**Incident Analysis:**
- Number of incidents
- Mean time to detection (MTTD)
- Mean time to resolution (MTTR)
- Repeat incidents

**Maintenance Summary:**
- Scheduled maintenance windows
- Maintenance impact
- Upgrades and improvements
- Upcoming planned work

**Customer Impact:**
- User-reported issues
- Support ticket volume
- Feature requests
- Satisfaction metrics

### Transparency Commitment

**Our Commitment:**

**Always Public:**
- Real-time status information
- Honest incident reporting
- Detailed postmortems
- Historical performance data

**Never Hidden:**
- Minor incidents disclosed
- Performance degradation reported
- Maintenance impact communicated
- SLA breaches acknowledged

**Continuous Improvement:**
- Regular infrastructure upgrades
- Proactive monitoring enhancements
- Incident prevention focus
- Performance optimization

## Third-Party Dependencies

### External Service Status

**Services We Rely On:**

Disclosurely depends on third-party services:

**Infrastructure:**
- **AWS** (Amazon Web Services) - Hosting
- **Cloudflare** - CDN and DDoS protection
- **Auth0** - Authentication (Enterprise SSO)

**Communications:**
- **SendGrid** - Email delivery
- **Twilio** - SMS notifications (if enabled)

**Monitoring:**
- **Datadog** - System monitoring
- **PagerDuty** - Incident management

**Third-Party Status:**

Links to third-party status pages:
- AWS Status: status.aws.amazon.com
- Cloudflare Status: www.cloudflarestatus.com
- SendGrid Status: status.sendgrid.com

**Impact Handling:**

When third-party outages occur:
- Status page updated immediately
- Incident attributed to third-party
- Mitigation steps communicated
- Alternative services activated when possible

## Support During Incidents

### Getting Help

**During Active Incidents:**

**1. Check Status Page First**
- Verify if known incident
- Review posted updates
- Check estimated resolution

**2. If Not Listed:**
- Contact support@disclosurely.com
- Describe issue in detail
- Include error messages
- Note time issue started

**3. Urgent/Critical Issues:**
- Pro/Enterprise: Priority support line
- Enterprise: Dedicated account manager
- Include "URGENT" in email subject
- Follow up with phone call if critical

**Response Times:**

**Status Page Updates:**
- Critical incidents: Every 30 minutes
- Major incidents: Every hour
- Minor incidents: As needed
- Maintenance: Before, during, after

**Support Tickets:**
- Critical issues: <1 hour response
- High priority: <4 hours response
- Normal priority: <24 hours response
- Low priority: <48 hours response

**Enterprise Support:**
- Phone support available 24/7
- Dedicated Slack/Teams channel
- Account manager direct line
- Escalation procedures defined

### Communicating with Reporters

**During Platform Issues:**

**Best Practices:**

✅ **Inform Reporters Proactively:**
- Post notice on reporting portal (if accessible)
- Send email to known reporters with active cases
- Provide status page link
- Offer alternative reporting methods

✅ **Extend Deadlines:**
- If SLA timers affected by outage
- Communicate extension clearly
- Document in [audit trail](/features/audit-trail)

✅ **Preserve Trust:**
- Be transparent about issues
- Apologize for inconvenience
- Reassure about data security
- Confirm no data loss

## Related Features

### Audit Trail

**System Events Logged:**

All system health events recorded in [audit trail](/features/audit-trail):
- Incident start/end times
- Maintenance windows
- Performance degradation
- Failover events
- SLA breaches

**Learn More:** [Audit Trail](/features/audit-trail)

### Notifications

**System Health Notifications:**

Integrated with [notification system](/features/notifications):
- Incident alerts
- Maintenance reminders
- Performance warnings
- SLA breach notifications

**Learn More:** [Notification System](/features/notifications)

### Security Monitoring

**Security Incidents:**

Security-related incidents handled separately:
- Reported on status page
- Detailed disclosure (after mitigation)
- User notification if data affected
- Regulatory reporting as required

**Learn More:** [Security Overview](/security/overview)

## Related Pages

- [Security Overview](/security/overview) - Platform security details
- [Audit Trail](/features/audit-trail) - System event logging
- [Notification System](/features/notifications) - Alert configuration
- [Subscription Tiers](/features/subscription-tiers) - SLA by plan
- [Analytics Dashboard](/analytics/dashboard) - Usage metrics

## Support

Questions about system health?
- Status page: status.disclosurely.com
- Email: support@disclosurely.com
- SLA inquiries: sla@disclosurely.com
- [Contact Support](/support/contact)
- Emergency hotline (Enterprise): Available in account dashboard
