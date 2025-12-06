---
title: PII Detection & Redaction - Privacy Protection | Disclosurely
description: Automatic detection and redaction of personally identifiable information (PII) before AI analysis. Protect privacy while leveraging AI insights.
---

# PII Detection & Redaction

Automatically detect and redact personally identifiable information to protect privacy during AI analysis and case review.

## Overview

Disclosurely's PII detection system automatically identifies and redacts sensitive personal information before AI analysis, ensuring compliance with privacy regulations like [GDPR](/compliance/gdpr) while still enabling powerful AI insights.

**How It Works:**
1. Reporter submits case
2. System scans content for PII
3. Detected PII automatically redacted
4. AI analysis performed on redacted version
5. Original unredacted version securely stored
6. Case handlers see redacted or full version (configurable)

## What PII Is Detected

### Personal Identifiers

**Names:**
- Full names (first + last)
- Partial names in context
- Nicknames when identifiable
- Maiden names

**Contact Information:**
- Email addresses
- Phone numbers (all formats)
- Physical addresses
- IP addresses

**Identification Numbers:**
- Social Security Numbers (SSN)
- National ID numbers
- Passport numbers
- Driver's license numbers
- Employee ID numbers

### Financial Information

**Payment Data:**
- Credit card numbers
- Bank account numbers
- IBAN codes
- Sort codes
- Routing numbers

**Other Financial:**
- Tax identification numbers
- Payroll information
- Salary details

### Additional Sensitive Data

- Dates of birth
- Medical information
- Biometric data references
- Geographic coordinates
- Vehicle registration numbers

## Redaction Methods

### Placeholder Replacement

PII replaced with consistent placeholders:

**Examples:**
- "John Smith" → `[PERSON_1]`
- "jane.doe@company.com" → `[EMAIL_1]`
- "555-123-4567" → `[PHONE_1]`
- "123 Main St" → `[ADDRESS_1]`

**Consistency:**
Same person referenced multiple times uses same placeholder throughout case.

### Preview Before AI Analysis

**PII Preview Modal:**

Before submitting to AI, reporters/handlers see:
- Original text
- Redacted version (side-by-side)
- List of detected PII types
- Option to proceed or cancel

**Learn More:** [AI Case Helper](/ai/case-helper)

## Privacy & Compliance

**GDPR Compliance:**
- Data minimization
- Purpose limitation
- Privacy by design

**Security:**
- Original data encrypted
- Redacted versions for AI
- Audit trail of PII access

**Learn More:** [GDPR Compliance](/compliance/gdpr) | [Security Overview](/security/overview)

## Support

Email: support@disclosurely.com  
[Contact Support](/support/contact)
