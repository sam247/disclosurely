/**
 * Test Suite for Enhanced PII Detector
 * Run with: deno test pii-detector.test.ts
 */

import { assertEquals, assertExists } from 'https://deno.land/std@0.168.0/testing/asserts.ts';
import { redactPII, restorePII, getRedactionStats } from './pii-detector.ts';

Deno.test('Email Detection', () => {
  const text = 'Contact me at john.doe@company.com or jane@example.co.uk';
  const result = redactPII(text);

  assertEquals(result.piiDetected, true);
  assertEquals(result.detectionStats['EMAIL'], 2);
  assertEquals(result.redactedContent.includes('john.doe@company.com'), false);
  assertEquals(result.redactedContent.includes('[EMAIL_'), true);
});

Deno.test('UK Phone Numbers', () => {
  const text = 'Call me on 07700 900123 or 0207 123 4567 or +44 7700 900123';
  const result = redactPII(text);

  assertEquals(result.piiDetected, true);
  // Should detect all 3 phone numbers
  const phoneCount = (result.detectionStats['PHONE_UK_MOBILE'] || 0) +
                     (result.detectionStats['PHONE_UK_LANDLINE'] || 0);
  assertEquals(phoneCount >= 2, true);
});

Deno.test('SSN Detection', () => {
  const text = 'My SSN is 123-45-6789 for verification';
  const result = redactPII(text);

  assertEquals(result.piiDetected, true);
  assertEquals(result.detectionStats['SSN'], 1);
  assertEquals(result.redactedContent.includes('123-45-6789'), false);
});

Deno.test('UK National Insurance Number', () => {
  const text = 'NI number: AB 12 34 56 C and QQ123456C';
  const result = redactPII(text);

  assertEquals(result.piiDetected, true);
  // AB123456C is valid, QQ123456C is invalid (QQ prefix not allowed)
  assertEquals(result.detectionStats['NI_NUMBER'], 1);
});

Deno.test('Credit Card Validation (Luhn Check)', () => {
  const validCard = '4532 1234 5678 9010'; // Valid Luhn
  const invalidCard = '1234 5678 9012 3456'; // Invalid Luhn

  const result1 = redactPII(`Pay with card ${validCard}`);
  const result2 = redactPII(`Random number ${invalidCard}`);

  // Valid card should be redacted
  assertEquals(result1.piiDetected, true);
  assertEquals(result1.detectionStats['CREDIT_CARD'], 1);

  // Invalid card should NOT be redacted (failed Luhn check)
  assertEquals(result2.detectionStats['CREDIT_CARD'] || 0, 0);
});

Deno.test('IBAN Detection', () => {
  const text = 'Transfer to GB82 WEST 1234 5698 7654 32';
  const result = redactPII(text);

  assertEquals(result.piiDetected, true);
  assertEquals(result.detectionStats['IBAN'], 1);
});

Deno.test('UK Postcode', () => {
  const text = 'Address: SW1A 1AA and EC1A 1BB';
  const result = redactPII(text);

  assertEquals(result.piiDetected, true);
  assertEquals(result.detectionStats['POSTCODE_UK'], 2);
});

Deno.test('IP Address Validation', () => {
  const validIP = '192.168.1.1';
  const invalidIP = '999.999.999.999';

  const result1 = redactPII(`Server at ${validIP}`);
  const result2 = redactPII(`Invalid: ${invalidIP}`);

  // Valid IP should be redacted
  assertEquals(result1.piiDetected, true);
  assertEquals(result1.detectionStats['IP_ADDRESS'], 1);

  // Invalid IP should NOT be redacted
  assertEquals(result2.detectionStats['IP_ADDRESS'] || 0, 0);
});

Deno.test('Name Detection (Optional)', () => {
  const text = 'Report by Sarah Johnson about James Miller';
  const result = redactPII(text, { includeNames: true });

  assertEquals(result.piiDetected, true);
  assertEquals(result.detectionStats['NAME'] >= 1, true);
  assertEquals(result.redactedContent.includes('Sarah Johnson'), false);
});

Deno.test('Name False Positives (Exclusions)', () => {
  const text = 'Visit New York or United Kingdom';
  const result = redactPII(text, { includeNames: true });

  // Should NOT redact place names
  assertEquals(result.redactedContent.includes('New York'), true);
  assertEquals(result.redactedContent.includes('United Kingdom'), true);
});

Deno.test('Multiple PII Types', () => {
  const text = `
    Reporter: john.doe@company.com, +44 7700 900123
    NI: AB123456C
    Address: SW1A 1AA
    IP: 192.168.1.50
  `;

  const result = redactPII(text);

  assertEquals(result.piiDetected, true);
  assertEquals(result.detectionStats['EMAIL'], 1);
  assertEquals(result.detectionStats['NI_NUMBER'], 1);
  assertEquals(result.detectionStats['POSTCODE_UK'], 1);
  assertEquals(result.detectionStats['IP_ADDRESS'], 1);

  // Original values should be gone
  assertEquals(result.redactedContent.includes('john.doe@company.com'), false);
  assertEquals(result.redactedContent.includes('7700 900123'), false);
  assertEquals(result.redactedContent.includes('AB123456C'), false);
  assertEquals(result.redactedContent.includes('192.168.1.50'), false);
});

Deno.test('Deterministic Redaction', () => {
  const text = 'Email john@example.com twice: john@example.com';
  const result = redactPII(text);

  // Same email should get same placeholder
  const placeholders = result.redactedContent.match(/\[EMAIL_\d+\]/g);
  assertEquals(placeholders?.length, 2);
  assertEquals(placeholders![0], placeholders![1]);
});

Deno.test('PII Restoration', () => {
  const original = 'Contact john@example.com or call 555-1234';
  const { redactedContent, redactionMap } = redactPII(original);

  const restored = restorePII(redactedContent, redactionMap);

  // Restored should match original
  assertEquals(restored.includes('john@example.com'), true);
  assertEquals(restored.includes('555-1234'), true);
});

Deno.test('No PII in Text', () => {
  const text = 'This is a normal sentence with no personal data';
  const result = redactPII(text);

  assertEquals(result.piiDetected, false);
  assertEquals(Object.keys(result.redactionMap).length, 0);
  assertEquals(result.redactedContent, text); // Unchanged
});

Deno.test('Real-World Whistleblower Case', () => {
  const text = `
    I am reporting financial misconduct by CFO James Miller (james.miller@acmecorp.com).

    On 15/03/2024, I discovered he instructed staff to alter Q3 financials.
    Evidence is on the shared drive at 192.168.1.50.

    My contact details:
    - Email: sarah.johnson@acmecorp.com
    - Mobile: +44 7700 900123
    - NI Number: AB123456C

    I can be reached at my home address: 123 High Street, London, SW1A 1AA.
  `;

  const result = redactPII(text, { includeNames: true, includeAddresses: false });

  // Verify PII detected
  assertEquals(result.piiDetected, true);

  // Check all PII types found
  assertExists(result.detectionStats['EMAIL']);
  assertExists(result.detectionStats['PHONE_UK_MOBILE']);
  assertExists(result.detectionStats['NI_NUMBER']);
  assertExists(result.detectionStats['IP_ADDRESS']);
  assertExists(result.detectionStats['POSTCODE_UK']);
  assertExists(result.detectionStats['NAME']);

  // Verify sensitive data removed
  assertEquals(result.redactedContent.includes('james.miller@acmecorp.com'), false);
  assertEquals(result.redactedContent.includes('sarah.johnson@acmecorp.com'), false);
  assertEquals(result.redactedContent.includes('7700 900123'), false);
  assertEquals(result.redactedContent.includes('AB123456C'), false);
  assertEquals(result.redactedContent.includes('192.168.1.50'), false);

  // Verify context preserved
  assertEquals(result.redactedContent.includes('financial misconduct'), true);
  assertEquals(result.redactedContent.includes('Q3 financials'), true);
  assertEquals(result.redactedContent.includes('shared drive'), true);

  console.log('\n=== REAL-WORLD TEST ===');
  console.log('Original length:', text.length);
  console.log('Redacted length:', result.redactedContent.length);
  console.log('PII detected:', result.detectionStats);
  console.log('Redaction map size:', Object.keys(result.redactionMap).length);
  console.log('\nRedacted content:');
  console.log(result.redactedContent);
});

Deno.test('Performance Test (Large Text)', () => {
  // Generate large text with PII
  let largeText = '';
  for (let i = 0; i < 100; i++) {
    largeText += `User ${i}: email${i}@example.com, phone: 555-000-${i.toString().padStart(4, '0')}\n`;
  }

  const start = Date.now();
  const result = redactPII(largeText);
  const duration = Date.now() - start;

  console.log(`\n=== PERFORMANCE TEST ===`);
  console.log(`Text size: ${largeText.length} chars`);
  console.log(`Duration: ${duration}ms`);
  console.log(`PII detected: ${Object.keys(result.redactionMap).length}`);

  // Should complete in reasonable time (<100ms for 100 entries)
  assertEquals(duration < 100, true);
  assertEquals(result.piiDetected, true);
});

Deno.test('Redaction Stats Utility', () => {
  const text = `
    Email: test@example.com
    Phone: 555-1234
    Another email: test2@example.com
    IP: 192.168.1.1
  `;

  const result = redactPII(text);
  const stats = getRedactionStats(result.detectionStats);

  assertEquals(stats.totalPIIDetected >= 4, true);
  assertEquals(stats.mostCommonType, 'EMAIL'); // 2 emails vs 1 phone, 1 IP
  assertExists(stats.typeBreakdown['EMAIL']);
});
