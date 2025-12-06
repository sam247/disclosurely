---
title: Security Best Practices - Disclosurely Security
description: Administrator security guidelines, user security best practices, reporter privacy, password management, device security, and whistleblowing security awareness.
head:
  - - meta
    - property: og:title
      content: Security Best Practices - Disclosurely
  - - meta
    - property: og:description
      content: Administrator security guidelines, user security best practices, reporter privacy, password management, device security, and whistleblowing security awareness.
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
      content: Security Best Practices - Disclosurely
  - - meta
    - name: twitter:description
      content: Administrator security guidelines, user security best practices, reporter privacy, password management, device security, and whistleblowing security awareness.
  - - meta
    - name: twitter:image
      content: https://disclosurely.com/docs/ogimage.png
---

# Security Best Practices

Essential security guidelines for administrators, users, and whistleblowers to protect sensitive data and maintain platform security.

## Overview

Security is a shared responsibility between Disclosurely, your organization, and individual users. While Disclosurely provides enterprise-grade security infrastructure including encryption, access controls, and monitoring, the effectiveness of these protections depends on proper configuration, user behavior, and organizational policies. This guide provides practical, actionable security best practices for everyone involved in your whistleblowing program.

Following these best practices protects whistleblower identities, prevents unauthorized data access, maintains compliance with regulations like GDPR and the EU Whistleblowing Directive, reduces security incident risk, and builds trust in your reporting system. Security incidents can expose vulnerable whistleblowers to retaliation, create legal liability, and damage your organization's reputation—making proactive security essential.

## For Administrators

### Initial Setup and Configuration

**Secure Platform Configuration:**
- Complete [initial setup](/docs/admin/initial-setup) with security as top priority
- Enable [multi-factor authentication](/docs/security/mfa) requirement for all users immediately
- Configure appropriate session timeout settings (2 hours idle recommended)
- Set strong password requirements (minimum 12 characters, complexity required)
- Enable email notifications for security events
- Configure user roles following principle of least privilege
- Review default security settings and tighten as needed
- Document security configuration decisions

**User Access Management:**
- Assign minimum necessary permissions to each user role
- Use specific roles (Investigator, Reviewer) rather than making everyone Administrator
- Create separate accounts for different functions (no shared accounts)
- Implement temporary access with expiration for contractors
- Require MFA for all administrative accounts without exception
- Review and approve all user access requests formally
- Document justification for elevated access

Learn more about user management in the [Team Management](/docs/admin/team-management) documentation.

### Ongoing Security Operations

**Regular Access Reviews:**
- Conduct quarterly access reviews for all users
- Generate access reports from dashboard
- Verify each user's role aligns with current responsibilities
- Remove access immediately when employees change roles or depart
- Check for inactive accounts and disable them
- Audit administrative account usage
- Document review findings for compliance

**Security Monitoring:**
- Review [security monitoring](/docs/security/monitoring) dashboard daily
- Respond promptly to security alerts (same day for high priority)
- Investigate unusual access patterns even if they seem minor
- Monitor failed authentication attempts for brute force indicators
- Review audit logs for suspicious activity
- Track case access patterns for anomalies
- Set up automated alert notifications

**Incident Response:**
- Establish incident response procedures before incidents occur
- Define escalation paths and contact information
- Test incident response procedures annually
- Document all security incidents thoroughly
- Conduct post-incident reviews and implement improvements
- Report security concerns to security@disclosurely.com immediately
- Maintain incident response documentation for compliance

### User Training and Awareness

**Security Training Program:**
- Provide security training during user onboarding
- Cover password security, MFA setup, and phishing awareness
- Explain importance of protecting whistleblower confidentiality
- Train on recognizing social engineering attempts
- Demonstrate proper handling of sensitive case data
- Conduct annual security awareness refresher training
- Test users with simulated phishing exercises
- Document training completion for compliance

**Policy Development:**
- Document security policies and procedures
- Define acceptable use policies for platform access
- Establish data handling procedures for case information
- Create device security requirements
- Define incident reporting procedures
- Communicate policies clearly to all users
- Review and update policies annually
- Make policies easily accessible

### Compliance and Audit Readiness

**Documentation:**
- Maintain current security documentation
- Document security control implementations
- Keep records of security training completion
- Preserve security incident reports
- Document access review findings
- Maintain change logs for security configurations
- Prepare compliance reports quarterly

**Audit Preparation:**
- Understand [compliance requirements](/docs/compliance/eu-directive) for your jurisdiction
- Regularly review [audit trail](/docs/compliance/audit-trail) functionality
- Test ability to generate compliance reports
- Prepare evidence of security controls
- Document security policies and procedures
- Conduct internal audits before external reviews
- Address audit findings promptly

## For All Platform Users

### Account Security

**Password Management:**
- Use strong, unique password (minimum 12 characters)
- Never reuse passwords from other services
- Use password manager to generate and store passwords
- Don't write passwords down or save in unsecured locations
- Enable [multi-factor authentication](/docs/security/mfa) immediately after account creation
- Change password immediately if compromise suspected
- Don't share passwords with anyone, including support staff

**Session Security:**
- Log out when finished using the platform
- Don't leave platform open on unattended devices
- Use session timeout features (don't disable)
- Review active sessions regularly in security settings
- Terminate unfamiliar sessions immediately
- Don't use "Remember Me" on shared or public computers
- Report suspicious login notifications

**MFA Best Practices:**
- Set up MFA during first login, don't delay
- Use authenticator app rather than SMS when possible
- Save backup codes in secure location (password manager)
- Don't share MFA codes with anyone
- Keep backup codes separate from primary device
- Update MFA settings promptly when changing devices
- Report lost MFA device to administrator immediately

### Data Handling

**Accessing Case Information:**
- Access only cases assigned to you
- Don't attempt to access restricted or unassigned cases
- Don't share case information with unauthorized colleagues
- Follow need-to-know principle strictly
- Access sensitive cases from secure, private locations
- Don't discuss cases in public areas
- Log evidence downloads with clear business justification

**Handling Sensitive Data:**
- Download case files only when necessary
- Delete downloaded files after use
- Don't store case data on personal devices
- Don't forward case information via email
- Use secure messaging within platform only
- Encrypt external storage if case data must be stored
- Follow organizational data retention policies

**Reporter Identity Protection:**
- Never attempt to identify anonymous reporters
- Access reporter identity only when authorized and necessary
- All identity access is logged and reviewed
- Don't share reporter names outside authorized channels
- Protect confidential reporter identities strictly
- Report any inadvertent identity disclosure immediately

Learn more about access controls in the [Access Control](/docs/security/access-control) documentation.

### Threat Awareness

**Phishing and Social Engineering:**
- Be skeptical of unsolicited emails requesting credentials
- Verify sender identity before clicking links or opening attachments
- Don't click login links in emails—navigate directly to platform
- Verify URLs before entering credentials (https://disclosurely.com)
- Don't provide account information over phone unless you initiated call
- Report suspicious emails to your IT security team
- Verify unexpected password reset requests

**Physical Security:**
- Lock computer when leaving desk unattended
- Don't let others watch you enter passwords
- Use privacy screens when working with sensitive data in public
- Secure printed case documents appropriately
- Shred printed sensitive documents when no longer needed
- Don't leave case files visible on desk
- Report lost devices with platform access immediately

**Network Security:**
- Use secure, trusted networks to access platform
- Avoid public WiFi when accessing sensitive cases
- Use VPN when accessing from untrusted networks
- Keep devices updated with latest security patches
- Enable device encryption and firewall
- Use up-to-date antivirus software
- Report network security concerns

## For Whistleblowers and Reporters

### Protecting Your Identity

**Anonymous Reporting:**
- Use [anonymous reporting](/docs/reporting/report-types) if you fear retaliation
- Access reporting portal from personal device, not work computer
- Use personal internet connection, not employer's network
- Consider using VPN for additional privacy protection
- Use incognito/private browsing mode
- Clear browser history after submission if using shared device
- Don't include unnecessary identifying information in reports

**Tracking ID Security:**
- Save tracking ID securely immediately after submission
- Don't share tracking ID with anyone (it's like a password)
- Store tracking ID in secure location (password manager ideal)
- Don't save tracking ID on work devices
- Don't include tracking ID in emails or messages
- Write it down only if stored very securely
- Remember: If lost, anonymous report tracking IDs cannot be recovered

**Communication Security:**
- Use [secure messaging](/docs/reporting/secure-messaging) within platform only
- Don't communicate about your report via work email
- Don't discuss report with coworkers, even trusted ones
- Be vague about details that might identify you
- Don't mention your report on social media
- Keep communications about report strictly confidential
- Report any attempts to identify you

Learn more about safe reporting in the [How to Submit a Report](/docs/reporting/how-to-submit) guide.

### Evidence Submission

**Preparing Evidence:**
- Remove identifying metadata from files before upload
- Check documents for hidden personal information
- Sanitize screenshots to remove identifying details
- Consider what filename might reveal about you
- Remove location data from photos
- Don't include unnecessary personal documents
- Focus evidence on the misconduct, not your identity

**Upload Security:**
- All files automatically [encrypted during upload](/docs/security/encryption)
- Upload only relevant evidence
- Keep file sizes reasonable (10MB per file limit)
- Don't upload personal identification documents unnecessarily
- Verify HTTPS connection before uploading
- Use trusted device for evidence upload
- Don't upload files from work computer if anonymity important

### Maintaining Anonymity

**Behavioral Considerations:**
- Don't change behavior after reporting
- Don't hint about reporting to colleagues
- Don't ask leading questions about investigations
- Maintain normal work routines
- Be careful about timing of report (not right after incident witnessed)
- Consider what details in report might identify you
- Don't access your report from work network

**If Questioned:**
- You're not obligated to admit reporting
- Simple denial is acceptable: "I don't know anything about that"
- Don't discuss the report or investigation
- Document any questioning or perceived retaliation
- Report retaliation through the platform immediately
- Consult attorney if threatened or facing retaliation
- Remember: Retaliation is illegal in most jurisdictions

## Incident Reporting

### When to Report Security Concerns

**Report Immediately:**
- Suspected unauthorized access to cases or reporter information
- Suspected account compromise (yours or others)
- Unusual login activity or unfamiliar active sessions
- Lost device with platform access
- Inadvertent disclosure of sensitive information
- Phishing attempts targeting platform users
- Suspected insider threat or policy violation
- Any security weakness or vulnerability discovered

**How to Report:**
- Email: security@disclosurely.com for security issues
- Platform: Dashboard > Support > Security Issue
- Administrator: Contact your organization administrator
- Urgent: Use emergency contact for critical security issues

**What to Include:**
- Clear description of the security concern
- Date and time the issue occurred or was discovered
- Affected accounts, cases, or data (if known)
- Actions already taken
- Potential impact assessment
- Any evidence (screenshots, logs, etc.)

### Response Expectations

**Timeline:**
- Critical issues acknowledged within 1 hour
- High priority acknowledged within 4 hours
- Standard issues acknowledged within 24 hours
- Regular updates provided until resolution
- Post-incident report for significant issues

**Your Role:**
- Provide requested information promptly
- Don't investigate further yourself
- Don't discuss issue publicly
- Cooperate with investigation
- Implement recommended remediation actions
- Document lessons learned

## Security Awareness Resources

### Staying Informed

**Security Updates:**
- Read platform security notifications
- Stay informed about current threats
- Follow security best practices guidance
- Attend security training sessions
- Review security documentation periodically
- Learn from security incidents (sanitized case studies)

**Additional Resources:**
- [Security Overview](/docs/security/overview) - Comprehensive platform security
- [Authentication](/docs/security/authentication) - Login security
- [Encryption](/docs/security/encryption) - Data protection
- [Access Control](/docs/security/access-control) - Permission management

---

## Related Pages

- [Security Overview](/docs/security/overview) - Complete security architecture
- [Multi-Factor Authentication](/docs/security/mfa) - Enhanced account security
- [Authentication](/docs/security/authentication) - Login and identity verification
- [Monitoring](/docs/security/monitoring) - Security operations and alerts
