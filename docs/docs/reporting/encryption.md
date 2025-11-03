# Report Encryption

Understanding how Disclosurely protects your reports with military-grade encryption and zero-knowledge architecture.

## Zero-Knowledge Architecture

Disclosurely uses **zero-knowledge encryption**, meaning:

- Report content encrypted in your browser
- Encryption happens before data leaves your device
- We never have access to encryption keys
- We cannot read your reports
- True end-to-end encryption

**What this means for you**: Your report is completely private. Even if someone hacked our servers, they couldn't read your report.

## How Encryption Works

### Step 1: Report Submission

When you submit a report:

1. You write your report in the web form
2. JavaScript in your browser generates encryption key
3. Report content encrypted using AES-256
4. Only encrypted data sent to our servers
5. Encryption key hashed and stored separately
6. Plaintext never leaves your browser

### Step 2: Data Storage

On our servers:
- Encrypted report content stored
- Encryption key hash stored separately
- Keys and content never stored together
- Multiple layers of security
- Encrypted database
- Encrypted backups

### Step 3: Report Access

When authorized case handler views report:

1. Handler requests report
2. System verifies authorization
3. Encrypted content sent to handler's browser
4. Decryption happens in browser
5. Plaintext displayed only in memory
6. Never stored unencrypted on servers

## Encryption Specifications

### Algorithm
**AES-256 (Advanced Encryption Standard)**
- 256-bit key length
- Industry standard encryption
- Used by governments and militaries
- Virtually unbreakable

### Key Derivation
**PBKDF2 (Password-Based Key Derivation Function 2)**
- 100,000 iterations
- SHA-256 hashing
- Random salt generation
- Protection against brute force

### Transport Security
**TLS 1.3 (Transport Layer Security)**
- All data encrypted in transit
- Perfect forward secrecy
- Modern cipher suites
- Protection against man-in-the-middle attacks

## What Gets Encrypted

### Always Encrypted
- Report description and content
- Messages between you and investigators
- Reporter identity (confidential reports)
- File attachments
- Sensitive metadata

### Not Encrypted (Metadata)
- Report submission timestamp
- Status changes
- Category selection
- Tracking ID (not sensitive)
- Organization ID

**Why some metadata isn't encrypted**: Needed for routing, notifications, and analytics. Contains no sensitive information.

## File Encryption

Files uploaded with reports are:
- Encrypted before upload
- Stored with same encryption as report
- Decrypted only when authorized user accesses
- Virus scanned before encryption

Supported files:
- Documents (PDF, DOC, DOCX)
- Images (JPG, PNG, GIF)
- Spreadsheets (XLS, XLSX)
- Archives (ZIP)

## Access Keys

### What Are Access Keys?

Access keys are cryptographic keys that allow decryption. Generated automatically when you submit a report.

### Who Has Access Keys?

**You** (Reporter):
- Your tracking ID provides access
- Can view your own report
- Can send/receive messages

**Authorized Case Handlers**:
- Assigned investigators
- Organization administrators
- Access logged in audit trail

**Who Doesn't**:
- Disclosurely support staff
- Unauthorized employees
- Other organizations
- Anyone without proper authorization

## Security Audits

Disclosurely's encryption has been:
- Independently audited
- Penetration tested
- Security reviewed
- Compliance certified

**Certifications**:
- ISO 27001 (Information Security)
- SOC 2 Type II
- GDPR Compliant
- Industry best practices

## Encryption Limitations

**What Encryption Doesn't Protect**:
- Your tracking ID (protect it like a password)
- Metadata (submission time, category)
- Communication patterns (when you check status)
- Your identity if you reveal it in messages

**Your Responsibility**:
- Keep tracking ID secure
- Don't share it with anyone
- Access from secure devices
- Use strong passwords
- Enable MFA on your account (if registered)

## Technical Details

For security professionals:

**Encryption**:
- Algorithm: AES-256-GCM
- Key Size: 256 bits
- Block Mode: Galois/Counter Mode
- IV: Random, 96 bits

**Key Derivation**:
- Function: PBKDF2
- Iterations: 100,000
- Hash: SHA-256
- Salt: Random, 128 bits

**Transport**:
- Protocol: TLS 1.3
- Cipher Suites: Modern, secure only
- Perfect Forward Secrecy: Yes
- HSTS: Enabled

## Compliance

### [GDPR](/compliance/gdpr)
- Right to access: Encrypted data exportable
- Right to erasure: Encryption keys destroyed
- Data minimization: Only necessary data collected
- Purpose limitation: Encryption ensures limited access

### ISO 27001
- Information security management
- Risk assessment
- Access controls
- Incident management

### [SOX](/compliance/sox)
- [Audit trails maintained](/compliance/audit-trail)
- Access logging
- Data integrity
- Non-repudiation

---

**Questions about encryption?**
- [Security Overview](/security/overview)
- [Contact Support](/support/contact)
- Email: security@disclosurely.com
