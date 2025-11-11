---
title: Session Management - Multi-Session Detection
description: Advanced session security with automatic detection of multiple logins, device tracking, location monitoring, and session control for enhanced account protection.
head:
  - - meta
    - property: og:title
      content: Session Management - Disclosurely Security
  - - meta
    - property: og:description
      content: Advanced session security with automatic detection of multiple logins, device tracking, location monitoring, and session control for enhanced account protection.
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
      content: Session Management - Disclosurely
  - - meta
    - name: twitter:description
      content: Advanced session security with automatic detection of multiple logins, device tracking, location monitoring, and session control for enhanced account protection.
  - - meta
    - name: twitter:image
      content: https://docs.disclosurely.com/ogimage.png
---

# Session Management

Protect sensitive whistleblowing data with intelligent session management that detects and prevents unauthorized access through multi-session awareness and device tracking.

## What is Session Management?

Session Management in Disclosurely is a security feature that monitors and controls user login sessions. The system enforces a **one active session per user** policy, automatically detecting when you log in from multiple devices and prompting you to choose which session to continue.

**Key Features**:
- **Multi-Session Detection**: Automatically detects simultaneous logins
- **Device Tracking**: Identifies device type, browser, and operating system
- **Location Monitoring**: Shows approximate location of login attempts
- **Session Control**: Choose which device to continue on
- **Security Alerts**: Visual warnings when suspicious activity detected
- **Automatic Cleanup**: Removes inactive sessions automatically

## Why One Session Per User?

**Security Benefits**:
- **Prevents Account Sharing**: One person per account
- **Detects Unauthorized Access**: Alerts you if someone else logs in
- **Reduces Breach Risk**: Limits exposure if credentials are compromised
- **Compliance**: Meets audit requirements for access control
- **Accountability**: Clear attribution of actions to individuals
- **Data Protection**: Minimizes risk of sensitive case data exposure

**Use Cases**:
- Detect if your account is compromised
- Prevent password sharing among team members
- Identify suspicious login locations
- Enforce single-user policy
- Maintain audit trail integrity

## How It Works

### Login Process

**Step 1: You Log In**
- Enter your credentials on any device
- System authenticates your identity
- New session created

**Step 2: Session Tracking**
- System records your device information
- Browser and OS detected automatically
- Approximate location determined (IP-based)
- Session ID generated and stored

**Step 3: Multi-Session Detection**
- System checks for other active sessions
- If another session exists, alert triggered
- Modal dialog appears with session details

**Step 4: Choose Action**
- **Continue on this device**: Terminates other session
- **Continue on other device**: Logs out current device
- **Log out everywhere**: Terminates all sessions

### Device & Location Tracking

**Information Collected**:

**Device Information**:
- Device type: Desktop, Tablet, or Mobile
- Device name: Brand/model when available
- Browser: Chrome, Firefox, Safari, Edge, etc.
- Operating System: Windows, macOS, Linux, iOS, Android

**Location Information** (IP-based):
- City (approximate)
- Country
- Latitude/Longitude (approximate)
- Map visualization

**Privacy Note**: Location is approximate based on IP address, not precise GPS. Typical accuracy: City-level (±10-50 miles).

### Session Activity

**Activity Monitoring**:
- Last activity timestamp tracked
- Updates every 5 minutes while active
- Sessions expire after 30 minutes of inactivity
- Automatic cleanup of expired sessions

**What Counts as Activity**:
- Page navigation
- Form submissions
- API requests
- Any user interaction

**What Doesn't Count**:
- Leaving browser tab open but idle
- Background processes
- Closed browser window

## Multi-Session Detection Modal

When you log in and another session is detected, you'll see:

### Modal Components

**Alert Header**:
- Security shield icon (amber/yellow)
- "Multiple Login Session Detected" title
- Informational, not alarmist tone

**Other Session Details**:
- Device icon (smartphone, tablet, or desktop)
- Device name and browser
- Operating system
- Location (city, country)
- Last activity time (e.g., "5 minutes ago")
- Interactive map showing approximate location

**Action Buttons**:
1. **"This wasn't me. Continue on this device"**
   - Dismisses the alert
   - Keeps both sessions active temporarily
   - Use if you recognize the other session

2. **"Continue on another device"**
   - Logs out the current device
   - Preserves the other session
   - Use if you want to use the other device

3. **"Log out everywhere"**
   - Terminates all sessions (current + other)
   - Forces fresh login on all devices
   - Use if you suspect unauthorized access

### Example Scenarios

**Scenario 1: You Forgot Your Laptop Was Logged In**
```
You log in on your phone at home.
Alert shows: MacBook Pro (Chrome) in Office, 3 hours ago

Action: Click "Continue on this device"
Result: Laptop session ended, phone session continues
```

**Scenario 2: Suspicious Login Detected**
```
You log in from New York.
Alert shows: Unknown device (Firefox) in London, 2 minutes ago

Action: Click "Log out everywhere"
Result: All sessions terminated, change password immediately
```

**Scenario 3: Switching Between Work and Home**
```
You log in at home after leaving work computer on.
Alert shows: Desktop (Edge) in Chicago, 1 hour ago

Action: Click "Continue on this device"
Result: Work session ended, home session continues
```

**Scenario 4: Using Multiple Tabs**
```
You accidentally open a second tab and try to log in again.
Alert shows: Chrome on Windows in Chicago, Just now

Action: Click "This wasn't me. Continue on this device"
Result: Both tabs work normally (same device, same browser)
```

## Managing Your Sessions

### View Active Sessions

Currently, active sessions are tracked but not displayed in a management interface. **Coming Soon**: Session management page where you can:

- View all active sessions
- See device and location details
- Manually terminate specific sessions
- Review session history

### Ending Sessions

**From Multi-Session Modal**:
- Choose action when logging in

**Automatic Termination**:
- Sessions expire after 30 minutes of inactivity
- Old sessions cleaned up automatically

**Manual Logout**:
- Click your profile icon
- Select "Logout"
- Current session ends immediately

**Security Logout**:
- Change your password
- All sessions terminated automatically
- Must log in again everywhere

### Session Security

**Session Storage**:
- Session ID stored in browser session storage
- Cleared on logout
- Cleared when browser closes
- Not accessible to other websites

**Session Data**:
- Encrypted in transit (HTTPS)
- Stored securely in database
- Includes device and location info
- Logged for security audit

**Session Duration**:
- Active: As long as you're using the app
- Idle timeout: 30 minutes of inactivity
- Maximum duration: 24 hours (auto-refresh)
- Remember me: Not available (security policy)

## Security Recommendations

### Best Practices

✅ **Always Review Session Details**: Check device, location, and time
✅ **Act on Suspicious Activity**: Log out everywhere if unrecognized
✅ **Use Strong Passwords**: Prevent unauthorized access
✅ **Enable MFA**: Add extra security layer (coming soon)
✅ **Log Out When Done**: Don't leave sessions open
✅ **Use Private/Incognito**: On shared computers
✅ **Monitor Regularly**: Check for unusual login patterns

### Warning Signs

🚨 **Suspicious Activity Indicators**:
- Login from unfamiliar location
- Unknown device or browser
- Login while you're offline
- Rapid succession of logins
- Login from impossible location (e.g., two continents minutes apart)

**If You See These**:
1. **Log out everywhere immediately**
2. **Change your password**
3. **Contact support** at [support@disclosurely.com](mailto:support@disclosurely.com)
4. **Review recent activity** in audit logs
5. **Enable MFA** (when available)

### What to Do If Account Compromised

**Immediate Steps**:
1. Click "Log out everywhere" in the modal
2. Change your password immediately
3. Review your email for password reset attempts
4. Check audit trail for unauthorized actions
5. Contact support to report the incident

**Organization Admin Should**:
1. Suspend the account temporarily
2. Reset password via admin panel
3. Review case access logs
4. Check for unauthorized data exports
5. Investigate scope of potential breach

**Disclosurely Support Will**:
1. Investigate the security incident
2. Review server logs for breach attempts
3. Provide detailed activity report
4. Recommend additional security measures
5. Monitor account for further suspicious activity

## Privacy & Data Protection

### What We Track

**Session Information**:
- Session ID (unique identifier)
- User ID (your account)
- Device type, browser, OS
- IP address
- Approximate location (city, country)
- Login timestamp
- Last activity timestamp

**Not Tracked**:
- Precise GPS location
- Browsing history outside Disclosurely
- Personal files or data
- Other applications you use
- Camera or microphone access

### How Long We Keep It

**Session Data Retention**:
- Active sessions: Stored while session is active
- Ended sessions: Deleted immediately
- Session logs: Retained for 90 days (security audit)
- Aggregated analytics: Anonymized, indefinite

**Your Rights**:
- Request deletion of session history
- Export session log data
- Opt-out of location tracking (coming soon)
- GDPR compliant data handling

### Data Sharing

**We Never Share**:
- Your session data with third parties
- Device or location info for marketing
- Session logs with anyone except you

**We May Share**:
- With law enforcement (valid legal request only)
- With you (upon request)
- With security auditors (anonymized)

## Technical Details

### Session Tracking Technology

**Session ID Generation**:
- Unique ID: `{user_id}_{timestamp}_{random}`
- Stored in browser sessionStorage
- Expires when browser closes
- Not accessible to other tabs or sites

**Activity Heartbeat**:
- Updates every 5 minutes
- Tracks last_activity_at timestamp
- Extends session lifetime
- Prevents premature expiration

**Geolocation**:
- IP-based lookup (no GPS)
- Third-party service: IP geolocation API
- City-level accuracy
- Cached for performance

### Multi-Device Support

**Supported Platforms**:
- ✅ Desktop (Windows, macOS, Linux)
- ✅ Mobile (iOS, Android)
- ✅ Tablet (iPad, Android tablets)
- ✅ All modern browsers (Chrome, Firefox, Safari, Edge)

**Responsive Detection**:
- Desktop: Full modal with map
- Mobile: Optimized modal, smaller map
- Tablet: Hybrid layout
- All: Touch-friendly buttons

### Edge Cases

**Same Device, Multiple Browsers**:
- Treated as separate sessions
- Each browser gets unique session ID
- Alert shown when switching browsers

**Same Browser, Multiple Tabs**:
- Share the same session
- No conflict or alert
- Session storage shared across tabs

**VPN or Proxy**:
- Location shows VPN server location
- May appear as different location
- Normal behavior, not suspicious

**Corporate Network**:
- May show corporate office location
- Same location for all employees
- Normal for office-based teams

## Compliance & Audit

### Regulatory Compliance

**GDPR**:
- ✅ Right to access session data
- ✅ Right to deletion
- ✅ Transparent data collection
- ✅ Secure data storage

**SOX**:
- ✅ Access control enforcement
- ✅ Audit trail of sessions
- ✅ Non-repudiation (user attribution)
- ✅ Accountability

**EU Whistleblowing Directive**:
- ✅ Secure access to reports
- ✅ Protection against unauthorized access
- ✅ Data security measures

### Audit Trail

**Logged Events**:
- Login (session created)
- Device and location
- Session activity updates
- Logout (session ended)
- Multi-session detection
- Session termination
- "Log out everywhere" actions

**Audit Uses**:
- Security incident investigation
- Compliance reporting
- User activity tracking
- Forensic analysis

**Access**:
- Organization admins can view user session logs
- Users can request their own session history
- Support team (with authorization)

## Troubleshooting

### "Multiple Session" Alert Every Time

**Cause**: Previous session not properly terminated

**Solution**:
1. Click "Log out everywhere"
2. Clear browser cache and cookies
3. Close all browser tabs
4. Log in again

### Location Showing Wrong City

**Cause**: IP-based geolocation is approximate

**Normal**: ±10-50 mile accuracy is expected
**If Using VPN**: Location shows VPN server city
**Corporate Network**: May show office location

**Not a Problem**: As long as country and general region are correct

### Can't Log In (Session Conflict)

**Error**: "Maximum sessions reached"

**Cause**: Bug or expired sessions not cleaned up

**Solution**:
1. Wait 30 minutes (sessions auto-expire)
2. Contact support to manually clear sessions
3. Try password reset (terminates all sessions)

### Session Expires Too Quickly

**Cause**: 30-minute idle timeout

**Solution**:
- Stay active (navigate pages periodically)
- Refresh the page before timeout
- Enterprise: Contact support for extended timeout (security review required)

### Map Not Loading

**Cause**: Browser privacy settings or ad blocker

**Solution**:
- Allow embedded content from OpenStreetMap
- Disable ad blocker on Disclosurely
- Not critical: You can still see text location

## Future Enhancements

**Coming Soon**:
- Session management dashboard
- Trusted device registry
- Geographic restrictions (allow/block regions)
- Suspicious login alerts via email
- Multi-factor authentication (MFA)
- Biometric authentication support
- Session timeout customization

## Pricing & Availability

**Session Management is available on**:
- Free Plan: ✅ Included
- Pro Plan: ✅ Included
- Enterprise Plan: ✅ Included + advanced features

**Enterprise Features**:
- Custom session timeout
- Advanced session analytics
- IP whitelisting/blacklisting
- Detailed session audit reports

## Support

**Need help with Session Management?**
- [Security Overview](/security/overview)
- [Authentication](/security/authentication)
- [Multi-Factor Authentication (MFA)](/security/mfa)
- [Access Control](/security/access-control)
- [Security Best Practices](/security/best-practices)
- [Contact Support](/support/contact)

**Security Concerns?**
Email: [security@disclosurely.com](mailto:security@disclosurely.com)

---

**Session Management provides an extra layer of security, ensuring that only authorized users on recognized devices can access sensitive whistleblowing data—protecting both reporters and your organization.**
