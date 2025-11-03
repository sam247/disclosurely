# Security Overview

Comprehensive overview of Disclosurely's security architecture and practices.

## Our Security Commitment

Disclosurely is built security-first to protect whistleblowers, organizations, and sensitive investigation data. We understand that trust is earned through demonstrable security, not just promises.

**Our Principles**:
- **Privacy by design**: Security built into every feature
- **Zero-knowledge architecture**: We cannot access your encrypted data
- **Defense in depth**: Multiple layers of security
- **Transparency**: Open about our security practices
- **Continuous improvement**: Regular testing and updates
- **Compliance-ready**: Meet regulatory requirements

## Security Architecture

### Multi-Layer Security

**Application Layer**:
- Secure coding practices
- Input validation and sanitization
- Output encoding
- CSRF protection
- XSS prevention
- SQL injection prevention
- Regular security audits

**Data Layer**:
- [AES-256 encryption at rest](/reporting/encryption)
- [End-to-end encryption for reports](/reporting/encryption)
- Zero-knowledge encryption for anonymous reports
- Encrypted database
- Encrypted backups
- Secure key management

**Network Layer**:
- TLS 1.3 for data in transit
- HTTPS only (HSTS enabled)
- DDoS protection
- Web Application Firewall (WAF)
- Rate limiting
- Intrusion detection

**Infrastructure Layer**:
- Secure cloud hosting
- Network segmentation
- Firewall protection
- Isolated environments
- Regular security updates
- Infrastructure as code

**Physical Layer** (via cloud provider):
- SOC 2 certified data centers
- 24/7 physical security
- Biometric access controls
- Surveillance monitoring
- Redundant power and cooling
- Geographic redundancy

### Zero-Knowledge Architecture

**What Is Zero-Knowledge?**

Zero-knowledge architecture means Disclosurely cannot access the content of encrypted data, even if we wanted to. This provides maximum protection for whistleblowers.

**How It Works**:

1. **Anonymous Reports**:
   - Report encrypted in browser before upload
   - Encryption key never sent to server
   - Key derived from tracking ID (only reporter has)
   - Disclosurely servers cannot decrypt
   - Only authorized organization users can decrypt

2. **Confidential Reports**:
   - Reporter identity separately encrypted
   - Multiple encryption layers
   - Role-based decryption keys
   - Investigator can read report, not identity
   - Only authorized users can access identity

3. **Evidence Files**:
   - Files encrypted before upload
   - Unique encryption key per file
   - Keys encrypted with user keys
   - Cannot be decrypted by Disclosurely
   - Organization controls decryption

**Benefits**:
- Maximum reporter protection
- Cannot be compelled to reveal content
- Breach impact minimized
- Compliance with privacy regulations
- Trust through technology

## Encryption

### Encryption Standards

**Data at Rest**:
- **Algorithm**: AES-256-GCM
- **Key length**: 256-bit
- **Implementation**: Industry-standard libraries
- **Key rotation**: Automatic periodic rotation
- **Key storage**: Hardware Security Modules (HSMs)

**Data in Transit**:
- **Protocol**: TLS 1.3
- **Cipher suites**: Strong ciphers only
- **Certificate**: Extended Validation (EV) SSL
- **HSTS**: Enabled (forces HTTPS)
- **Perfect forward secrecy**: Enabled

**[End-to-End Encryption](/reporting/encryption)**:
- **Reports**: Encrypted client-side
- **Messages**: Encrypted before transmission
- **Evidence**: Encrypted before upload
- **Keys**: Never transmitted in plain text

### Encryption Key Management

**Key Hierarchy**:

1. **Master Encryption Key (MEK)**
   - Stored in HSM
   - Never exported
   - Used to encrypt Data Encryption Keys
   - Rotated annually

2. **Data Encryption Keys (DEKs)**
   - Per-organization keys
   - Encrypt organization data
   - Encrypted by MEK
   - Rotated quarterly

3. **File Encryption Keys (FEKs)**
   - Per-file unique keys
   - Encrypt individual evidence files
   - Encrypted by DEK
   - Single use

4. **User Keys**
   - Per-user encryption keys
   - Control access to data
   - Derived from authentication
   - Session-specific

**Key Rotation**:
- Automatic rotation schedule
- No service interruption
- Old keys retained for decryption
- New data uses new keys
- Audit trail maintained

**Key Recovery**:
- Administrative key recovery process
- Multi-person authorization required
- All recovery logged
- Emergency procedures documented
- Regular testing

## Access Controls

### Role-Based Access Control (RBAC)

**Principle of Least Privilege**: Users have only permissions necessary for their role.

**Standard Roles**:

**Organization Administrator**:
- Full system access
- User management
- Settings configuration
- Billing management
- Cannot access report content without reason

**Case Handler (Admin)**:
- View all cases
- Assign cases
- Change status
- Add notes
- View evidence
- Cannot access reporter identity (confidential reports)

**Investigator**:
- View assigned cases
- Add notes and evidence
- Update status
- Communicate with reporter
- Cannot see reporter identity
- Cannot access unassigned cases

**Reviewer (Read-Only)**:
- View assigned cases
- Read case notes
- Download evidence
- Cannot modify cases
- Cannot see reporter identity

**Audit Committee**:
- View financial misconduct cases
- Read-only access
- Cannot modify investigations
- Aggregated reporting
- No identity access

**Reporter**:
- Submit reports
- Track own report
- Send/receive messages
- Upload additional evidence
- No access to other reports

### Access Audit Trail

**All Access Logged**:
- Who accessed what
- When accessed
- What actions taken
- IP address and location
- Device and browser
- Duration of access

**Tamper-Evident**:
- Hash chain prevents alteration
- Cannot delete audit logs
- Verifiable integrity
- Retained permanently
- [Available for compliance](/compliance/audit-trail)

**Monitoring**:
- Unusual access patterns detected
- Alerts for suspicious activity
- Regular access reviews
- Compliance reporting
- Anomaly detection

## Authentication

### Multi-Factor Authentication (MFA)

**Supported Methods**:
- **Authenticator apps**: Google Authenticator, Authy, etc.
- **SMS codes**: Text message verification
- **Email codes**: Email verification
- **Biometric**: Fingerprint, Face ID (on supported devices)
- **Hardware tokens**: YubiKey, etc. (Enterprise)

**MFA Requirements**:
- Required for Organization Administrators
- Recommended for all users
- Configurable per-organization
- Cannot be disabled by user
- Enforced at login

**Setup Process**:
1. User logs in with password
2. Prompted to enable MFA
3. Choose MFA method
4. Scan QR code or setup
5. Enter verification code
6. Backup codes generated
7. MFA active for all future logins

### Single Sign-On (SSO)

**Enterprise Plan Feature**

**Supported Protocols**:
- SAML 2.0
- OAuth 2.0
- OpenID Connect

**Identity Providers**:
- Microsoft Azure AD
- Okta
- Google Workspace
- OneLogin
- Auth0
- Any SAML 2.0 compliant IdP

**Benefits**:
- Centralized user management
- Leverage existing authentication
- Enforce organization MFA policies
- Automatic user provisioning
- Simplified user experience

**Setup**:
1. Configure IdP connection
2. Map user attributes
3. Test with test users
4. Enable for organization
5. Users login via SSO

### Password Security

**Password Requirements**:
- Minimum 12 characters
- Mix of upper, lower, numbers, symbols
- No common passwords (dictionary check)
- No user information in password
- Cannot reuse last 10 passwords

**Password Storage**:
- Never stored in plain text
- Bcrypt hashing with salt
- High work factor (cost 12+)
- Cannot be retrieved
- Password reset only

**Session Management**:
- Secure session tokens
- HTTP-only cookies
- SameSite attribute
- Session timeout (configurable)
- Automatic logout on inactivity
- Device/location tracking

## Infrastructure Security

### Cloud Hosting

**Provider**: Industry-leading cloud infrastructure (AWS/Azure/GCP)

**Certifications**:
- SOC 2 Type II
- ISO 27001
- ISO 27017 (cloud security)
- ISO 27018 (cloud privacy)
- PCI DSS (if applicable)

**Geographic Redundancy**:
- Multi-region deployment
- Automatic failover
- Data replicated across regions
- 99.9% uptime SLA
- Disaster recovery tested quarterly

### Network Security

**Perimeter Protection**:
- Web Application Firewall (WAF)
- DDoS mitigation (multi-Tbps capacity)
- Rate limiting
- IP allowlisting (optional)
- Geo-blocking (optional)

**Network Segmentation**:
- Application tier isolated
- Database tier isolated
- Management tier isolated
- No direct internet access to data
- Bastion hosts for admin access

**Intrusion Detection**:
- Network intrusion detection (NIDS)
- Host intrusion detection (HIDS)
- Security Information and Event Management (SIEM)
- 24/7 monitoring
- Automated alerting

### Vulnerability Management

**Regular Scanning**:
- Automated vulnerability scans (weekly)
- Dependency scanning (continuous)
- Code analysis (static and dynamic)
- Container security scanning
- Infrastructure scanning

**Penetration Testing**:
- Annual third-party penetration test
- Scope: entire platform
- Report provided to customers on request
- All findings remediated
- Re-test to verify fixes

**Bug Bounty Program**:
- Responsible disclosure program
- Security researchers invited
- Rewards for valid findings
- Coordinated disclosure
- Continuous security improvement

**Patch Management**:
- Security patches applied within 48 hours
- Critical patches applied within 24 hours
- Staged rollout to production
- Rollback plan ready
- Communicated to customers

## Compliance and Certifications

### Industry Certifications

**ISO 27001**: Information Security Management
- Certified annually
- Comprehensive security controls
- Regular audits
- Continuous improvement

**SOC 2 Type II**: Service Organization Controls
- Annual audit
- Security, availability, confidentiality
- Report available to customers
- Independent attestation

**[GDPR Compliant](/compliance/gdpr)**: General Data Protection Regulation
- Privacy by design
- Data subject rights
- Data protection impact assessments
- Data processing agreements

**[EU Whistleblowing Directive](/compliance/eu-directive)**: Directive 2019/1937
- Built for full compliance
- All requirements met
- Documented controls
- Regular compliance monitoring

### Regulatory Compliance Support

**Financial Services**:
- [SOX compliance features](/compliance/sox)
- SEC requirements
- Financial services regulations
- Audit committee oversight

**Healthcare**:
- HIPAA-ready (Enterprise)
- Healthcare data protection
- Business Associate Agreement available
- Encryption and access controls

**Government**:
- FedRAMP authorization (in progress)
- FISMA compliant
- Government security standards
- Secure government deployment

## Security Monitoring

### 24/7 Security Operations

**Monitoring**:
- Application performance monitoring
- Security event monitoring
- Anomaly detection
- User behavior analytics
- Threat intelligence feeds

**Incident Response**:
- 24/7 on-call security team
- Incident response plan
- Defined escalation procedures
- Quarterly DR drills
- Post-incident reviews

**Alerting**:
- Real-time alerts
- Multiple notification channels
- Escalation procedures
- Alert tuning and refinement
- Regular review of alerts

### Threat Detection

**Automated Detection**:
- Failed login attempts
- Brute force attacks
- SQL injection attempts
- XSS attempts
- Unusual access patterns
- Data exfiltration attempts
- Privilege escalation
- Account takeover attempts

**Response Actions**:
- Automatic account lockout
- IP blocking
- Rate limiting
- WAF rule updates
- Security team notification
- User notification (if appropriate)

## Data Privacy

### Privacy by Design

**Principles**:
- Proactive not reactive
- Privacy as default setting
- Embedded into design
- Full functionality (no zero-sum)
- End-to-end security
- Visibility and transparency
- Respect for user privacy

**Implementation**:
- Data minimization
- Purpose limitation
- Storage limitation
- Integrity and confidentiality
- Accountability
- Transparent processing

### Data Handling

**Personal Data**:
- Collected only when necessary
- Used only for stated purpose
- Retained only as long as needed
- Secured with encryption
- Access strictly controlled
- Deletion when no longer needed

**Special Categories** (sensitive data):
- Extra protection measures
- Limited access
- Enhanced encryption
- Careful retention
- Explicit consent (if required)
- DPIA conducted

## Your Security Responsibilities

### Shared Responsibility Model

**Disclosurely's Responsibility**:
- Platform security
- Infrastructure security
- Application security
- Encryption implementation
- Security monitoring
- Incident response
- Compliance certifications

**Your Responsibility**:
- User account security
- Password management
- MFA enablement
- Access control configuration
- User training
- Security awareness
- Incident reporting
- Data classification

### Security Best Practices

**For Administrators**:
- Enable MFA for all users
- Review access regularly
- Use strong, unique passwords
- Configure session timeouts
- Monitor audit logs
- Train users on security
- Report suspicious activity
- Keep contact information current

**For Users**:
- Use strong, unique passwords
- Enable MFA
- Don't share credentials
- Log out when finished
- Verify URLs before clicking
- Report phishing attempts
- Secure your devices
- Use updated browsers

**For Reporters**:
- Use anonymous reporting if concerned
- Don't include unnecessary personal details
- Use secure networks (avoid public WiFi)
- Remember your tracking ID
- Use strong passphrases
- Don't share tracking ID
- Clear browser history if needed

## Security Incidents

### If You Suspect a Security Issue

**Report Immediately**:
- Email: security@disclosurely.com
- Include details of concern
- Don't investigate yourself
- Don't share publicly
- Await response

**We Will**:
- Acknowledge within 24 hours
- Investigate promptly
- Keep you informed
- Take corrective action
- Notify if breach confirmed
- Document and learn

### Breach Notification

**Our Commitment**:
- Notify within 72 hours (GDPR requirement)
- Transparent communication
- Clear impact assessment
- Remediation steps taken
- Support for affected parties
- Post-incident review

**Customer Notification**:
- Direct notification to administrators
- Description of incident
- Data affected
- Steps taken
- Your recommended actions
- Contact for questions
- Regular updates

## Security Documentation

### Available Resources

**For Customers**:
- Security whitepaper
- SOC 2 Type II report (NDA required)
- Penetration test summary
- Compliance documentation
- Data Processing Agreement
- Privacy Policy
- Terms of Service

**Request Documentation**:
- Contact: security@disclosurely.com
- Or via Dashboard > Support > Security Documentation

### Security Questionnaires

We understand you may need to complete security questionnaires for your procurement or compliance processes.

**We Can Help**:
- Standard questionnaires pre-completed
- Custom questionnaire completion
- Technical security documentation
- Compliance attestations
- Security presentations

**Contact**: enterprise@disclosurely.com

---

**Related:**
- [Encryption & Privacy](/security/encryption)
- [Access Controls](/security/access-controls)
- [Authentication & MFA](/security/authentication)
- [Security Best Practices](/security/best-practices)
