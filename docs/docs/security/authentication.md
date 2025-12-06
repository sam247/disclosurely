---
title: Authentication - Disclosurely Security
description: Login authentication, password requirements, session management, Single Sign-On SSO, identity providers, and secure account authentication methods.
head:
  - - meta
    - property: og:title
      content: Authentication - Disclosurely Security
  - - meta
    - property: og:description
      content: Login authentication, password requirements, session management, Single Sign-On SSO, identity providers, and secure account authentication methods.
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
      content: Authentication - Disclosurely
  - - meta
    - name: twitter:description
      content: Login authentication, password requirements, session management, Single Sign-On SSO, identity providers, and secure account authentication methods.
  - - meta
    - name: twitter:image
      content: https://disclosurely.com/docs/ogimage.png
---

# Authentication

Secure authentication and identity management for your whistleblowing platform users and administrators.

## Overview

Authentication is the process of verifying user identity before granting access to your whistleblowing platform. Disclosurely implements industry-leading authentication security including strong password requirements, multi-factor authentication, secure session management, and Single Sign-On (SSO) integration for Enterprise customers. Proper authentication ensures that only authorized personnel can access sensitive case data while maintaining detailed audit trails for compliance and security monitoring.

Strong authentication protects against unauthorized access, account takeover attempts, credential theft, and insider threats. For whistleblowing platforms handling confidential reports and reporter identities, robust authentication is essential to maintain trust, comply with regulations like the EU Whistleblowing Directive and GDPR, and prevent data breaches that could expose vulnerable whistleblowers to retaliation.

## Password Requirements and Security

### Strong Password Standards

Disclosurely enforces strict password requirements to prevent unauthorized access and credential-based attacks:

**Minimum Requirements:**
- **Length**: At least 12 characters (longer is stronger)
- **Complexity**: Mix of uppercase, lowercase, numbers, and special characters
- **Dictionary check**: Common passwords and leaked credentials blocked
- **Personal information**: Passwords cannot contain name, email, or organization name
- **Password history**: Cannot reuse last 10 passwords
- **Expiration**: Optional password expiration (90-180 days) configurable by administrators

**Password Strength Indicators:**
- Real-time password strength meter during creation
- Specific feedback on password weaknesses
- Suggestions for stronger passwords
- Estimated time to crack displayed
- Comparison to known breached passwords

**Weak Passwords Blocked:**
- Common passwords like "Password123!"
- Sequential characters like "abcd1234"
- Keyboard patterns like "qwerty123"
- Passwords from known data breaches
- Dictionary words and simple substitutions

### Password Storage Security

Disclosurely never stores passwords in plain text or reversible encryption:

**Storage Methods:**
- **Algorithm**: Bcrypt with adaptive work factor
- **Salt**: Unique random salt per password
- **Work factor**: High computational cost (12+ rounds)
- **Irreversible**: Passwords cannot be decrypted or retrieved
- **Secure comparison**: Constant-time comparison prevents timing attacks

**Password Reset Only:**
- If password forgotten, reset is required
- Cannot view or retrieve existing password
- Reset links expire after 1 hour
- One-time use reset tokens
- All resets logged in audit trail

### Password Best Practices

**For Users:**
- Use a unique password for Disclosurely (don't reuse)
- Use password manager to generate and store strong passwords
- Enable [multi-factor authentication](/security/mfa) immediately
- Never share password with anyone, including support staff
- Change password if suspected compromise
- Don't write passwords down
- Use passphrase method: combine random words (e.g., "correct-horse-battery-staple")

**For Administrators:**
- Enforce MFA for all users handling sensitive data
- Set appropriate password expiration policies
- Monitor failed login attempts
- Review password security settings quarterly
- Include password security in user training
- Disable accounts immediately upon employee departure
- Audit password reset requests for suspicious patterns

Learn more about multi-factor authentication in the [MFA documentation](/security/mfa).

## Session Management

### Secure Session Handling

Disclosurely implements secure session management to protect user sessions from hijacking and unauthorized access:

**Session Security Features:**
- **Secure cookies**: HTTP-only, Secure, SameSite attributes
- **Session tokens**: Cryptographically random, high entropy
- **Token rotation**: New token issued on privilege elevation
- **Session binding**: Tied to IP address and user agent
- **Fingerprinting**: Device fingerprint validation
- **TLS only**: Sessions never transmitted over unencrypted connections

**Session Lifecycle:**
1. **Creation**: Secure session token generated at login
2. **Validation**: Token validated on every request
3. **Renewal**: Session extended on activity (up to maximum duration)
4. **Expiration**: Automatic timeout after inactivity
5. **Termination**: Explicit logout or security-triggered termination

### Session Timeout Settings

**Configurable Timeouts:**
- **Idle timeout**: 30 minutes to 8 hours (default: 2 hours)
- **Maximum session**: 8 hours to 30 days (default: 24 hours)
- **Remember me**: Optional extended session (up to 30 days)
- **Per-role settings**: Different timeouts for different user roles

**Administrator Recommendations:**
- Shorter timeouts for high-privilege accounts (administrators)
- Longer timeouts for investigators working on complex cases
- No extended sessions for users accessing from public networks
- Consider organizational security policies and compliance requirements

### Active Session Management

**Users Can:**
- View all active sessions with device and location information
- See last activity timestamp for each session
- Remotely terminate suspicious sessions
- Receive alerts for new device logins
- Review session history in security settings

**Automatic Termination:**
- All sessions terminated on password change
- Sessions invalidated on MFA reset
- Concurrent session limits enforced
- Suspicious sessions automatically terminated
- Sessions terminated when account disabled

## Single Sign-On (SSO)

### Enterprise SSO Integration

Enterprise customers can integrate Disclosurely with their existing identity provider for centralized authentication management.

**Supported Protocols:**
- **SAML 2.0**: Industry-standard SSO protocol
- **OAuth 2.0**: Modern authorization framework
- **OpenID Connect**: Identity layer on OAuth 2.0

**Supported Identity Providers:**
- **Microsoft Azure AD**: Azure Active Directory integration
- **Okta**: Leading identity management platform
- **Google Workspace**: G Suite authentication
- **OneLogin**: Cloud-based identity provider
- **Auth0**: Universal authentication platform
- **Custom**: Any SAML 2.0 compliant IdP

**Benefits of SSO:**
- Centralized user provisioning and de-provisioning
- Leverage existing MFA and security policies
- Single password for users to remember
- Simplified onboarding and offboarding
- Automatic synchronization of user attributes
- Enhanced security through identity provider controls
- Reduced password fatigue and support tickets

### SSO Setup Process

**For Administrators:**

1. **Initial Configuration**
   - Navigate to Settings > Authentication > Single Sign-On
   - Choose your identity provider
   - Download service provider metadata
   - Configure identity provider with Disclosurely details

2. **Attribute Mapping**
   - Map user attributes (email, name, role)
   - Configure group-to-role mapping
   - Set default user permissions
   - Define provisioning rules

3. **Testing**
   - Test with pilot users before organization-wide rollout
   - Verify attribute mapping works correctly
   - Test group-based role assignment
   - Confirm MFA passes through properly

4. **Rollout**
   - Communicate SSO availability to users
   - Provide SSO login instructions
   - Offer support during transition
   - Monitor login success rates

**User Experience:**
- Click "Sign in with [Your Organization]" button
- Redirect to your organization's login page
- Authenticate with existing credentials
- Automatically logged into Disclosurely
- Seamless single sign-on experience

### Just-in-Time (JIT) Provisioning

**Automatic User Creation:**
- Users automatically created on first SSO login
- No manual account creation required
- User attributes synchronized from identity provider
- Role assignment based on group membership
- Reduces administrative overhead

**Synchronization:**
- User attributes updated on each login
- Role changes synchronized automatically
- Account disabled if IdP access revoked
- Group membership changes reflected immediately

## Authentication Best Practices

### For Administrators

**Security Configuration:**
- Enforce [multi-factor authentication](/security/mfa) organization-wide
- Set appropriate session timeout policies
- Enable SSO if available for your plan
- Monitor failed authentication attempts
- Review authentication logs regularly
- Implement account lockout after failed attempts
- Require password changes after suspected compromise
- Document authentication policies

**Access Management:**
- Implement least privilege access controls
- Review user access quarterly
- Disable accounts immediately upon termination
- Use time-limited access for temporary users
- Monitor for shared accounts (prohibited)
- Audit authentication bypasses
- Test authentication controls regularly

**Compliance:**
- Document authentication requirements
- Include authentication in security training
- Maintain audit trails of authentication events
- Review authentication security annually
- Update policies to reflect evolving threats

Learn more about access controls in the [Access Control documentation](/security/access-control).

### For All Users

**Account Security:**
- Enable MFA immediately after account creation
- Use strong, unique passwords
- Never share your credentials
- Don't save passwords in browsers on shared devices
- Log out when finished, especially on shared computers
- Report suspicious login notifications immediately
- Review active sessions regularly
- Use secure, trusted networks when possible

**Recognizing Threats:**
- Be wary of phishing emails requesting credentials
- Verify login page URL before entering password
- Don't click login links in emails
- Report suspicious password reset requests
- Contact support if you see unfamiliar active sessions
- Be cautious of social engineering attempts

### For Whistleblowers (Anonymous Reporters)

**Anonymous reporting doesn't require authentication:**
- No account creation needed
- No login required
- Access reports using tracking ID only
- Tracking ID acts as authentication credential
- Keep tracking ID secure and private
- Don't share tracking ID with anyone
- Use secure device and network
- Consider using VPN for additional privacy

Learn more about anonymous reporting in the [How to Submit a Report](/reporting/how-to-submit) guide.

## Troubleshooting Authentication Issues

### Can't Log In

**Common Solutions:**
- Verify email address is entered correctly
- Check Caps Lock is not enabled
- Try password reset if forgotten
- Clear browser cache and cookies
- Try different browser or incognito mode
- Disable browser extensions temporarily
- Check MFA codes are current and correct
- Verify account hasn't been disabled

### Password Reset Not Working

**If reset email doesn't arrive:**
- Check spam/junk folder
- Verify email address on file is correct
- Wait 5-10 minutes for delivery
- Request new reset link
- Contact your organization administrator
- Contact support if administrator unavailable

**If reset link doesn't work:**
- Links expire after 1 hour - request new one
- Links are single-use only
- Don't click link multiple times
- Copy and paste full URL if clicking doesn't work
- Ensure using same browser/device
- Clear cache and try again

### SSO Issues

**If SSO login fails:**
- Verify you have access in identity provider
- Check correct email address being used
- Confirm attribute mapping is configured
- Test with non-SSO login if available
- Contact your IT department
- Contact Disclosurely support with error details

### Account Locked

**If account is locked after failed logins:**
- Wait 15-30 minutes for automatic unlock
- Request administrator unlock immediately
- Verify you're using correct password
- Consider password reset if uncertain
- Review security settings after unlock
- Enable MFA if not already enabled

---

## Related Pages

- [Multi-Factor Authentication](/security/mfa) - Enhanced account security
- [Security Overview](/security/overview) - Comprehensive security architecture
- [Access Control](/security/access-control) - User permissions and roles
- [Best Practices](/security/best-practices) - Security recommendations
