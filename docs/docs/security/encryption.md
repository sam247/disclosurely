---
title: Encryption & Privacy - Disclosurely Security
description: AES-256 encryption, zero-knowledge architecture, end-to-end encryption, key management, data protection, and privacy by design for secure whistleblowing.
head:
  - - meta
    - property: og:title
      content: Encryption & Privacy - Disclosurely
  - - meta
    - property: og:description
      content: AES-256 encryption, zero-knowledge architecture, end-to-end encryption, key management, data protection, and privacy by design for secure whistleblowing.
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
      content: Encryption & Privacy - Disclosurely
  - - meta
    - name: twitter:description
      content: AES-256 encryption, zero-knowledge architecture, end-to-end encryption, key management, data protection, and privacy by design for secure whistleblowing.
  - - meta
    - name: twitter:image
      content: https://disclosurely.com/docs/ogimage.png
---

# Encryption & Privacy

Military-grade encryption, zero-knowledge architecture, and privacy by design to protect whistleblowers and sensitive data.

## Overview

Encryption is the foundation of Disclosurely's security architecture, ensuring that sensitive whistleblowing data remains confidential and protected from unauthorized access. We implement military-grade AES-256 encryption combined with zero-knowledge architecture, meaning even Disclosurely cannot decrypt your organization's reports without proper authorization. This approach provides maximum protection for whistleblowers while ensuring compliance with data protection regulations like GDPR, the EU Whistleblowing Directive, and industry-specific privacy requirements.

Every piece of sensitive data in Disclosurely is encrypted at multiple stages: during transmission over networks, at rest in our databases, and end-to-end for anonymous reports. This defense-in-depth approach ensures that even in the unlikely event of a security breach, encrypted data remains unreadable and unusable to attackers.

## Encryption Standards

### AES-256 Encryption

Disclosurely uses Advanced Encryption Standard (AES) with 256-bit keys, the same encryption standard used by governments and military organizations worldwide for classified information.

**Why AES-256:**
- **Industry standard**: Approved by NIST and NSA for top secret information
- **Mathematically secure**: Would take billions of years to crack with current technology
- **High performance**: Fast encryption and decryption without performance impact
- **Widely tested**: Extensively analyzed by cryptography experts globally
- **Regulatory compliance**: Meets requirements for GDPR, HIPAA, SOX, and other regulations

**Technical Implementation:**
- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key length**: 256-bit encryption keys
- **Block cipher**: 128-bit block size with authenticated encryption
- **Libraries**: Industry-standard OpenSSL and libsodium
- **Mode**: Authenticated encryption with associated data (AEAD)
- **Integrity**: Built-in tamper detection prevents unauthorized modifications

### Encryption Layers

**Data in Transit:**
- **Protocol**: TLS 1.3 (Transport Layer Security)
- **Certificate**: Extended Validation (EV) SSL certificate
- **Cipher suites**: Only strong, modern ciphers enabled
- **Perfect forward secrecy**: Session keys not derivable from long-term keys
- **HSTS enabled**: Forces HTTPS connections, prevents downgrade attacks
- **Certificate pinning**: Prevents man-in-the-middle attacks

**Data at Rest:**
- **Database encryption**: Full database encryption at rest
- **File encryption**: Individual file-level encryption for evidence
- **Backup encryption**: Encrypted backups with separate keys
- **Log encryption**: Sensitive audit logs encrypted
- **Key storage**: Encryption keys stored in Hardware Security Modules (HSMs)
- **Disk encryption**: Full disk encryption on all servers

**End-to-End Encryption:**
- **Anonymous reports**: Encrypted in browser before transmission
- **Evidence files**: Encrypted client-side before upload
- **Secure messaging**: Messages encrypted end-to-end
- **Reporter identity**: Separately encrypted for confidential reports
- **Zero-knowledge**: Disclosurely cannot decrypt without authorization

Learn more about report-specific encryption in the [Report Encryption](/reporting/encryption) documentation.

## Zero-Knowledge Architecture

### What Is Zero-Knowledge?

Zero-knowledge architecture means Disclosurely's servers never have access to the decryption keys for your most sensitive data. Reports are encrypted in the user's browser before being transmitted to our servers, and only authorized users in your organization can decrypt them.

**Key Principle**: Even if Disclosurely wanted to read your reports, or was compelled by court order, we mathematically cannot access the encrypted content without your organization's decryption keys.

### How It Works

**For Anonymous Reports:**

1. **Submission**: Reporter creates report in browser
2. **Key generation**: Unique encryption key derived from tracking ID
3. **Client-side encryption**: Report encrypted in browser using AES-256
4. **Upload**: Only encrypted data transmitted to Disclosurely servers
5. **Server storage**: Encrypted report stored, server has no decryption key
6. **Access**: Tracking ID generates same key to decrypt report
7. **Organization access**: Organization has separate key to decrypt for investigation

**For Confidential Reports:**

1. **Dual encryption**: Reporter identity and report content separately encrypted
2. **Identity protection**: Identity encrypted with different key than content
3. **Role-based decryption**: Investigators can read report without seeing identity
4. **Identity access**: Only authorized users can decrypt reporter identity
5. **Audit trail**: All identity access attempts logged and monitored
6. **Compliance**: Meets requirements for confidential whistleblowing channels

**For Evidence Files:**

1. **Per-file encryption**: Each uploaded file has unique encryption key
2. **Client-side encryption**: Files encrypted before upload
3. **Key wrapping**: File encryption keys wrapped with user keys
4. **Secure storage**: Encrypted files stored separately from keys
5. **Access control**: Only authorized case team members can decrypt files
6. **Download logging**: Every file access logged with user and timestamp

### Benefits of Zero-Knowledge

**Maximum Reporter Protection:**
- Mathematically impossible for Disclosurely to identify anonymous reporters
- Protection persists even if Disclosurely servers compromised
- Cannot be compelled to reveal what we cannot access
- Whistleblower anonymity guaranteed by technology, not policy

**Compliance Advantages:**
- Meets highest standards for data protection
- Reduces data breach risk and impact
- Simplifies compliance with privacy regulations
- Demonstrates commitment to privacy by design
- Provides legal protection for your organization

**Trust and Confidence:**
- Reporters trust technology over promises
- Transparent security architecture
- Independent security audit verification
- No single point of failure
- No need to trust Disclosurely with sensitive data

## Encryption Key Management

### Key Hierarchy

Disclosurely implements a hierarchical key management system for security and operational efficiency:

**1. Master Encryption Key (MEK)**
- Stored in Hardware Security Module (HSM)
- Never exported or accessible outside HSM
- Used to encrypt Data Encryption Keys
- Rotated annually with zero downtime
- Backed up in geographically separated HSMs

**2. Data Encryption Keys (DEKs)**
- Per-organization encryption keys
- Encrypt organization-specific data
- Encrypted at rest using MEK
- Rotated quarterly automatically
- Separate keys for different data types

**3. File Encryption Keys (FEKs)**
- Unique key for each uploaded evidence file
- Single-use, never reused
- Encrypted using DEK before storage
- Rotated with each new file upload
- Securely deleted after data deletion

**4. User Keys**
- Per-user session keys for access control
- Derived during authentication
- Short-lived, expire after session
- Used to wrap/unwrap data encryption keys
- Regenerated at each login

### Key Rotation

**Automatic Rotation Schedule:**
- Master keys: Annually
- Organization keys: Quarterly
- User session keys: Per session
- File keys: Per file (single use)
- Certificate keys: Every 13 months

**Rotation Process:**
- Zero downtime key rotation
- Old keys retained for decryption of existing data
- New data encrypted with new keys
- Gradual re-encryption of existing data (background process)
- Complete audit trail of all key operations
- Automated alerts for rotation failures

### Key Recovery and Backup

**Secure Key Backup:**
- Keys backed up to geographically separated HSMs
- Encrypted backup with different encryption key
- Regular backup testing and verification
- Disaster recovery procedures documented and tested
- Recovery time objective (RTO): 4 hours maximum

**Emergency Key Recovery:**
- Multi-person authorization required (minimum 3 persons)
- All recovery operations logged immutably
- Automated notification to executive management
- Security team investigation of recovery triggers
- Post-recovery security audit required

## Privacy by Design

### Seven Foundational Principles

Disclosurely implements privacy by design throughout the platform:

**1. Proactive Not Reactive:**
- Privacy built into design, not added later
- Anticipate privacy risks before they materialize
- Prevention rather than remediation
- Continuous privacy impact assessments

**2. Privacy as Default:**
- Maximum privacy settings by default
- Users don't need to take action to protect privacy
- Anonymous reporting available without registration
- Automatic data minimization

**3. Privacy Embedded:**
- Privacy integral to system design
- Not an add-on feature
- Security and privacy in every component
- Cannot be disabled or bypassed

**4. Full Functionality:**
- Privacy doesn't reduce functionality
- Positive-sum, not zero-sum
- Both privacy and usability achieved
- No unnecessary trade-offs

**5. End-to-End Security:**
- Lifecycle protection from collection to deletion
- Secure retention and deletion
- Encryption throughout data journey
- Automated retention policy enforcement

**6. Visibility and Transparency:**
- Privacy policies clear and accessible
- Users understand how data is processed
- Regular transparency reports published
- Open about security architecture and practices

**7. Respect for User Privacy:**
- User-centric design approach
- Strong default privacy settings
- Informed consent for data processing
- Easy exercise of privacy rights

Learn more about GDPR compliance in the [GDPR Compliance](/compliance/gdpr) documentation.

## Data Protection Best Practices

### For Administrators

- Enable organization-wide encryption policies
- Review encryption settings during initial setup
- Monitor encryption key rotation logs
- Conduct annual encryption audits
- Document encryption policies for compliance
- Train users on handling encrypted data
- Implement strict key access controls
- Test backup and recovery procedures regularly

### For Users

- Never share decryption keys or tracking IDs
- Use secure devices and networks to access data
- Log out after viewing sensitive information
- Report any encryption errors immediately
- Don't attempt to bypass encryption controls
- Follow data handling procedures for encrypted evidence
- Verify HTTPS connection before entering sensitive data
- Use strong passwords to protect access to encrypted data

### For Reporters

- Save your tracking ID securely (cannot be recovered)
- Use anonymous reporting for maximum protection
- Access reporting portal via HTTPS only
- Verify SSL certificate before submitting
- Use incognito/private browsing if desired
- Don't share tracking ID with anyone
- Clear browser cache after submission if using shared device
- Consider using VPN for additional privacy

---

## Related Pages

- [Security Overview](/security/overview) - Comprehensive security architecture
- [Report Encryption](/reporting/encryption) - How report encryption works
- [GDPR Compliance](/compliance/gdpr) - Privacy regulation compliance
- [Authentication](/security/authentication) - Secure access controls
