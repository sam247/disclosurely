---
title: Access Control - Disclosurely Security
description: Role-based access control, user permissions, access levels, least privilege principle, access auditing, and security access management for whistleblowing.
head:
  - - meta
    - property: og:title
      content: Access Control - Disclosurely Security
  - - meta
    - property: og:description
      content: Role-based access control, user permissions, access levels, least privilege principle, access auditing, and security access management for whistleblowing.
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
      content: Access Control - Disclosurely
  - - meta
    - name: twitter:description
      content: Role-based access control, user permissions, access levels, least privilege principle, access auditing, and security access management for whistleblowing.
  - - meta
    - name: twitter:image
      content: https://docs.disclosurely.com/ogimage.png
---

# Access Control

Comprehensive access control and role-based permission management for secure whistleblowing platform administration.

## Overview

Access control is fundamental to protecting sensitive whistleblowing data and ensuring only authorized personnel can view, manage, and investigate reports. Disclosurely implements role-based access control (RBAC) with the principle of least privilege, ensuring users have only the permissions necessary to perform their duties while maintaining the confidentiality and integrity of anonymous and confidential reports.

Proper access control protects whistleblowers from unauthorized disclosure, prevents data breaches, and ensures compliance with regulations like the EU Whistleblowing Directive, GDPR, and SOX requirements. Every access event is logged in an immutable audit trail for accountability and compliance monitoring.

## Role-Based Access Control (RBAC)

### Understanding RBAC

Role-based access control assigns permissions based on job functions rather than individual users. When you add a user to your organization, you assign them a role that determines what data they can access and what actions they can perform within the whistleblowing platform.

**Key Benefits:**
- **Simplified management**: Assign roles instead of individual permissions
- **Consistency**: All users in a role have identical access levels
- **Scalability**: Easy to onboard new users with appropriate access
- **Compliance**: Demonstrates proper access governance
- **Security**: Reduces risk of excessive permissions

### Standard User Roles

**Organization Administrator:**
- Full system access and configuration control
- User and team management capabilities
- Organization settings and compliance configuration
- Billing and subscription management
- Access to all cases (with audit logging)
- Cannot access encrypted anonymous reports without tracking ID

**Case Handler (Admin):**
- View and manage all reported cases
- Assign cases to investigators and teams
- Update case status and priority levels
- Access case notes, evidence, and communications
- Generate compliance and analytical reports
- Cannot access reporter identity in confidential cases

**Investigator:**
- View cases assigned to them
- Update case status and add investigation notes
- Upload evidence and documentation
- Communicate securely with reporters via encrypted messaging
- Cannot access unassigned cases
- Cannot see reporter identity (confidential reports)

**Reviewer (Read-Only):**
- View cases assigned for oversight
- Read case notes and view evidence
- Download documents for review purposes
- Cannot modify cases or send messages
- Limited access for compliance oversight roles

Learn more about configuring these roles in the [Team Management](/admin/team-management) documentation.

## Principle of Least Privilege

### What Is Least Privilege?

The principle of least privilege means granting users the minimum level of access required to perform their job functions. This security best practice limits the potential damage from accidental errors, malicious insiders, or compromised accounts.

**Implementation in Disclosurely:**
- Users assigned to specific roles with defined permissions
- Investigators see only their assigned cases
- Reviewers have read-only access
- Identity protection enforced for confidential reports
- Automatic access revocation when roles change

**Best Practices for Administrators:**
- Assign the most restrictive role possible
- Use temporary access for short-term needs
- Review user access quarterly
- Remove access immediately when employees leave
- Use separate accounts for administrative functions
- Document reasons for elevated access

### Access Segregation

**Identity Protection:**
- Reporter identity encrypted separately from report content
- Only users with "Identity Access" permission can view names
- Investigators can read reports without knowing who submitted them
- Identity access logged and monitored
- Required for confidential reporting compliance

**Evidence Isolation:**
- Evidence files encrypted individually
- Access controlled per file
- Download events logged with user, timestamp, and IP address
- Prevents bulk data exfiltration
- Supports need-to-know principle

## Access Auditing and Monitoring

### Comprehensive Audit Logging

Every access event in Disclosurely is recorded in an immutable [audit trail](/compliance/audit-trail) that captures:

- **User identification**: Who accessed the data
- **Resource accessed**: Which case, report, or file
- **Action performed**: View, edit, download, delete
- **Timestamp**: Exact date and time of access
- **IP address and location**: Network origin of access
- **Device information**: Browser and operating system
- **Duration**: How long data was accessed

**Compliance Benefits:**
- Demonstrates due diligence to regulators
- Detects unauthorized access attempts
- Supports forensic investigations
- Provides evidence of proper controls
- Required for ISO 27001 and SOC 2 certification

### Security Monitoring

Disclosurely actively monitors for suspicious access patterns:

**Anomaly Detection:**
- Unusual access times or locations
- Excessive case viewing or downloads
- Access to unassigned cases (alerts administrator)
- Multiple failed authentication attempts
- Concurrent sessions from different locations

**Automated Alerts:**
- Real-time notification of suspicious activity
- Daily access summaries for administrators
- Quarterly access review reminders
- Permission changes notification
- Compliance threshold violations

Learn more about security monitoring in the [Security Monitoring](/security/monitoring) documentation.

## Regular Access Reviews

### Why Access Reviews Matter

User roles and responsibilities change over time. Regular access reviews ensure permissions remain appropriate and comply with the principle of least privilege. Organizations should conduct access reviews quarterly or when significant role changes occur.

**Review Process:**
1. Generate access reports from the dashboard
2. Review each user's role and case assignments
3. Verify access aligns with current job responsibilities
4. Remove unnecessary permissions or deactivate accounts
5. Document review findings for compliance
6. Update access policies as needed

**Red Flags to Investigate:**
- Users with access but no recent activity
- Employees who changed roles but retained old permissions
- Contractors or vendors with ongoing access
- Excessive administrative accounts
- Shared or generic accounts

### Access Revocation

**Immediate Revocation Required When:**
- Employee terminates employment
- Role change reduces access needs
- Security incident or policy violation
- Contract or engagement ends
- User account suspected of compromise

**Automated Access Management:**
- Session timeout after inactivity
- Forced re-authentication for sensitive actions
- Automatic logout from all devices on password change
- Account lockout after failed login attempts
- Scheduled access expiration for temporary users

## Access Control Best Practices

### For Administrators

- Enable [multi-factor authentication](/security/mfa) for all users
- Assign the minimum role necessary for job function
- Document reasons for privileged access
- Conduct quarterly access reviews
- Monitor audit logs regularly
- Respond immediately to access alerts
- Remove access within 24 hours of employee departure
- Use groups for consistent permission management

### For All Users

- Never share your login credentials
- Log out when finished using the system
- Report suspicious access requests
- Use strong, unique passwords
- Enable multi-factor authentication
- Access only cases assigned to you
- Don't attempt to access restricted data
- Report security concerns immediately

---

## Related Pages

- [Security Overview](/security/overview) - Complete security architecture
- [Authentication](/security/authentication) - Login and identity verification
- [Multi-Factor Authentication](/security/mfa) - Enhanced account security
- [Team Management](/admin/team-management) - Managing users and roles
