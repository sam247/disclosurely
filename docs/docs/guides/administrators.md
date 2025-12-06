---
title: Administrator Guide - Disclosurely User Guides
description: Comprehensive guide for organization administrators on setup, user management, configuration, compliance monitoring, and administrative best practices.
head:
  - - meta
    - property: og:title
      content: Guide for Administrators - Disclosurely
  - - meta
    - property: og:description
      content: Comprehensive guide for organization administrators on setup, user management, configuration, compliance monitoring, and administrative best practices.
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
      content: Administrator Guide - Disclosurely
  - - meta
    - name: twitter:description
      content: Comprehensive guide for organization administrators on setup, user management, configuration, compliance monitoring, and administrative best practices.
  - - meta
    - name: twitter:image
      content: https://disclosurely.com/docs/ogimage.png
---

# Guide for Administrators

Comprehensive guide for organization administrators on setup, configuration, user management, and compliance monitoring.

## Administrator Role Overview

As an Organization Administrator, you're responsible for configuring, managing, and overseeing your organization's whistleblowing platform. This critical role ensures your organization maintains an effective, compliant, and secure channel for employees to report concerns about misconduct, fraud, harassment, and regulatory violations. Your work protects whistleblowers, enables thorough investigations, and helps your organization maintain ethical standards and compliance.

The Administrator role carries significant responsibility: you control who has access to sensitive case data, configure security settings that protect reporter identities, ensure compliance with whistleblowing regulations, and maintain the trust employees place in the reporting system. This guide covers essential tasks, best practices, and recommendations for successfully managing your organization's whistleblowing program.

## Getting Started

### Initial Platform Setup

Complete these critical steps when first setting up your organization:

**1. Organization Configuration**
- Complete the [initial setup](/admin/initial-setup) wizard
- Configure organization name, logo, and branding
- Set primary language and timezone
- Define your organization's structure (departments, locations)
- Configure reporting categories relevant to your organization
- Set up external notification email addresses

**2. Security Configuration**
- Enable [multi-factor authentication](/security/mfa) requirement for all users
- Configure session timeout policies (recommend 2 hours idle timeout)
- Set strong password requirements (minimum 12 characters)
- Review and enable all recommended security settings
- Configure IP allowlisting if required by your security policy
- Enable security event notifications

**3. Compliance Configuration**
- Select applicable regulatory frameworks (EU Directive, SOX, etc.)
- Configure compliance deadline tracking
- Set up automated compliance reminders
- Define data retention policies
- Configure audit trail retention (recommend 7+ years)
- Enable compliance reporting features

**4. Reporting Portal Customization**
- Customize the secure reporting form
- Add organization-specific instructions for reporters
- Configure anonymous and confidential reporting options
- Set up category-specific routing rules
- Add multilingual support if needed
- Generate and distribute secure reporting links

Learn more in the [Organization Settings](/admin/organization-settings) documentation.

### User Management

**Adding Your Investigation Team:**

1. **Navigate to Team Management**
   - Dashboard > Settings > Team Management
   - Click "Add User" to create accounts

2. **Assign Appropriate Roles**
   - **Organization Administrator**: Full platform access (yourself and backup)
   - **Case Handler**: View all cases, assign to investigators
   - **Investigator**: View assigned cases, conduct investigations
   - **Reviewer**: Read-only access for oversight purposes

3. **Configure User Details**
   - Enter user's work email address
   - Assign appropriate role based on responsibilities
   - Set department or team assignment
   - Configure case category access if needed
   - Enable MFA requirement (mandatory for administrators)

4. **Send Invitation**
   - User receives email with secure setup link
   - Must complete profile and enable MFA
   - Access granted after email verification

**Best Practices:**
- Follow principle of least privilege (minimum necessary access)
- Use specific roles rather than making everyone Administrator
- Require MFA for all users without exception
- Document justification for administrative access
- Review user access quarterly
- Remove access immediately when employees depart

See detailed user management in [Team Management](/admin/team-management).

## Key Administrative Responsibilities

### Dashboard Oversight

Monitor your whistleblowing program health through the administrator dashboard:

**Daily Tasks:**
- Review new reports submitted in last 24 hours
- Check for overdue case acknowledgments (7-day EU requirement)
- Monitor security alerts and respond to critical issues
- Review case assignments to ensure proper distribution
- Check for pending investigator questions to reporters

**Weekly Tasks:**
- Review open case status and investigate stuck cases
- Monitor investigation timelines for approaching deadlines
- Check for inactive investigators needing follow-up
- Review access logs for unusual patterns
- Generate and review weekly activity reports

**Monthly Tasks:**
- Review compliance metrics and deadline adherence
- Conduct case quality spot checks
- Generate monthly executive summary reports
- Review user access and permissions
- Check platform storage and capacity
- Review security settings and update as needed

**Quarterly Tasks:**
- Conduct comprehensive user access review
- Generate compliance reports for audit committee
- Review and update reporting categories
- Analyze trends in report types and departments
- Conduct security awareness training refresher
- Review and update organizational policies

### Compliance Monitoring

Ensure ongoing compliance with whistleblowing regulations:

**EU Whistleblowing Directive Requirements:**
- 7-day acknowledgment deadline monitoring
- 3-month feedback deadline tracking (extendable to 6 months)
- Automated alerts for approaching deadlines
- Compliance report generation for regulatory bodies
- Documentation of all compliance activities

**Compliance Dashboard Features:**
- Real-time compliance status indicators
- Overdue case alerts with escalation
- Regulatory deadline countdown timers
- Audit-ready compliance reports
- Historical compliance performance tracking

**Annual Compliance Activities:**
- Review whistleblowing policy and procedures
- Update employee communications about reporting channel
- Conduct platform security assessment
- Generate annual whistleblowing activity report
- Present compliance status to board or audit committee
- Update policies to reflect regulatory changes

Learn more about [EU Whistleblowing Directive compliance](/compliance/eu-directive).

### Security Management

Maintain platform security to protect sensitive data and reporter identities:

**Security Configuration:**
- Enable and enforce MFA for all platform users
- Configure appropriate session timeout settings
- Set strong password complexity requirements
- Enable security event email notifications
- Configure IP allowlisting for sensitive access
- Review and approve SSO integration (Enterprise plan)

**Ongoing Security Monitoring:**
- Review [security monitoring](/security/monitoring) dashboard daily
- Investigate failed login attempts and access anomalies
- Respond promptly to security alerts
- Review audit logs regularly for suspicious activity
- Monitor user access patterns for policy violations
- Track and respond to security incidents

**Security Incident Response:**
- Establish incident response procedures
- Define escalation contacts and procedures
- Document all security incidents thoroughly
- Conduct post-incident reviews
- Report incidents to security@disclosurely.com
- Implement recommended remediation actions

See complete security guidance in [Security Best Practices](/security/best-practices).

### User Training and Support

Ensure users understand their responsibilities and platform capabilities:

**Onboarding New Users:**
- Provide platform overview and role-specific training
- Explain security requirements (MFA, password, device security)
- Demonstrate key features for their role
- Provide quick reference guides and documentation links
- Verify understanding of confidentiality requirements
- Document training completion

**Ongoing Training:**
- Annual security awareness refresher training
- Updates when new features are released
- Simulated phishing exercises to test awareness
- Case study reviews (sanitized for confidentiality)
- Investigator skills development workshops
- Compliance requirements updates

**User Support:**
- Respond promptly to user questions
- Escalate technical issues to support@disclosurely.com
- Maintain internal documentation for common questions
- Conduct regular user feedback sessions
- Monitor user satisfaction and platform adoption
- Address user concerns about platform usability

## Common Administrative Tasks

### Managing Case Assignments

**Assigning Cases to Investigators:**
1. Review new case details in dashboard
2. Determine appropriate investigator based on:
   - Subject matter expertise
   - Current workload and capacity
   - Conflicts of interest (none)
   - Language requirements
   - Geographic location if relevant
3. Assign case with clear instructions
4. Set priority level appropriately
5. Monitor assignment acceptance and progress

**Load Balancing:**
- Monitor investigator workload regularly
- Distribute cases evenly when possible
- Consider case complexity, not just volume
- Reassign cases if investigator overloaded
- Track average cases per investigator
- Identify training needs based on assignment patterns

### Generating Reports

**Available Reports:**
- **Executive Summary**: High-level overview for leadership
- **Compliance Reports**: Regulatory deadline adherence
- **Case Activity Reports**: New reports, investigations, resolutions
- **User Access Reports**: Who accessed what, when
- **Security Reports**: Authentication, alerts, incidents
- **Trend Analysis**: Patterns in report types, departments, times

**Report Configuration:**
- Select date range and filters
- Choose data fields to include
- Configure grouping and sorting
- Export format (PDF, CSV, Excel)
- Schedule automated delivery
- Configure recipient lists

### Handling Sensitive Situations

**Reporter Retaliation Claims:**
- Take all retaliation claims extremely seriously
- Initiate immediate investigation
- Document all reported retaliation thoroughly
- Consider interim protective measures
- Escalate to legal counsel
- Monitor for additional retaliation

**High-Profile Cases:**
- Cases involving senior executives or board members
- Potential legal exposure or regulatory violations
- Cases likely to generate media attention
- Coordinate with legal, HR, and communications teams
- Ensure enhanced security and confidentiality
- Document all decisions and rationale

**Data Breaches or Security Incidents:**
- Contain and mitigate incident immediately
- Notify security@disclosurely.com immediately
- Document incident timeline and impact
- Notify affected parties as required
- Coordinate with legal counsel
- Implement remediation and preventive measures

## Best Practices for Administrators

### Organizational Effectiveness

**Promote the Reporting Channel:**
- Regular communications about whistleblowing program
- Include reporting link in employee handbook
- Post reporting information in common areas
- Mention during new employee orientation
- Include in ethics and compliance training
- Emphasize non-retaliation policy
- Share success stories (anonymized)

**Build Trust in the System:**
- Respond promptly to all reports
- Maintain strict confidentiality
- Take all reports seriously, investigate thoroughly
- Keep reporters informed of progress
- Take appropriate action on substantiated claims
- Communicate outcomes when possible
- Demonstrate commitment from leadership

**Continuous Improvement:**
- Regularly review and update reporting categories
- Analyze trends to identify systemic issues
- Seek feedback from users and reporters
- Update procedures based on lessons learned
- Stay informed about regulatory changes
- Benchmark against industry best practices
- Invest in investigator training and development

### Administrative Efficiency

**Streamline Processes:**
- Develop standard operating procedures for common scenarios
- Create templates for investigator communications
- Automate routine tasks where possible
- Use dashboard filters and views effectively
- Schedule regular compliance report generation
- Maintain internal knowledge base

**Documentation:**
- Document all administrative decisions
- Maintain records of policy updates
- Keep training completion records
- Preserve security incident documentation
- Document compliance activities
- Maintain change log for significant updates

**Team Collaboration:**
- Hold regular case review meetings
- Share best practices among investigators
- Facilitate peer support and mentoring
- Celebrate successful case resolutions
- Address challenges collaboratively
- Foster culture of continuous learning

## Troubleshooting Common Issues

### Users Can't Access Platform

**Common Causes:**
- Incorrect email address
- Account not yet activated
- MFA not set up properly
- Account disabled or expired
- Browser compatibility issues
- Network or firewall blocking access

**Solutions:**
- Verify email address in user management
- Resend invitation email
- Reset MFA from admin panel
- Check account status and reactivate if needed
- Test with different browser
- Check with IT about firewall rules

### Reports Not Being Acknowledged

**Investigate:**
- Check if investigators are logging in regularly
- Verify email notifications are working
- Ensure assignments are clear and accepted
- Check for investigator availability (vacation, leave)
- Review workload distribution
- Verify no technical issues preventing access

**Actions:**
- Send reminders to assigned investigators
- Reassign cases if necessary
- Escalate overdue cases according to policy
- Review and adjust notification settings
- Consider additional investigator training
- Evaluate need for additional investigator resources

### Compliance Deadline Alerts

**Proactive Management:**
- Monitor compliance dashboard daily
- Set up automated escalation for approaching deadlines
- Require investigators to update case status regularly
- Review investigation timelines during case assignments
- Identify and address systematic delays
- Escalate to senior management if needed

## Getting Help

**Technical Support:**
- Email: support@disclosurely.com
- Live chat: Available in dashboard (Enterprise plan)
- Knowledge base: Searchable documentation
- Video tutorials: Step-by-step guides

**Security Concerns:**
- Email: security@disclosurely.com
- Immediate response for critical issues
- Incident reporting and tracking

**Compliance Questions:**
- Review [compliance documentation](/compliance/eu-directive)
- Consult legal counsel for jurisdiction-specific guidance
- Contact support for platform-specific questions

**Feature Requests:**
- Submit via dashboard: Settings > Feedback
- Include detailed description and use case
- Participate in customer advisory board
- Preview beta features (Enterprise plan)

---

## Related Pages

- [Initial Setup](/admin/initial-setup) - Complete setup wizard
- [Organization Settings](/admin/organization-settings) - Configure your organization
- [Team Management](/admin/team-management) - Manage users and roles
- [Security Best Practices](/security/best-practices) - Administrative security guidance
