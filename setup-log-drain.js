#!/usr/bin/env node

/**
 * Setup Sentry Log Drain for Vercel
 * 
 * This script creates a log drain from Vercel to Sentry using the Vercel API.
 * 
 * Usage:
 *   SENTRY_DSN=https://...@o...ingest.sentry.io/... VERCEL_TOKEN=... node setup-log-drain.js
 * 
 * Or run interactively:
 *   node setup-log-drain.js
 */

import https from 'https';

const PROJECT_ID = 'prj_LZHtJq9wmU52su4lSazU6CjAvyyJ';
const TEAM_ID = 'team_bZtHM5U2PDPQpdq5Mrv4QUIQ';

// Get environment variables
const SENTRY_DSN = process.env.SENTRY_DSN || process.argv[2];
const VERCEL_TOKEN = process.env.VERCEL_TOKEN || process.env.VERCEL_AUTH_TOKEN;

if (!SENTRY_DSN) {
  console.error('❌ Error: SENTRY_DSN is required');
  console.log('\nUsage:');
  console.log('  SENTRY_DSN=https://...@o...ingest.sentry.io/... VERCEL_TOKEN=... node setup-log-drain.js');
  console.log('\nOr provide as argument:');
  console.log('  node setup-log-drain.js <SENTRY_DSN>');
  console.log('\nTo get your Sentry DSN:');
  console.log('  1. Go to https://disclosurely.sentry.io');
  console.log('  2. Settings → Projects → disclosurely-production → Client Keys (DSN)');
  console.log('  3. Copy the DSN');
  process.exit(1);
}

if (!VERCEL_TOKEN) {
  console.error('❌ Error: VERCEL_TOKEN is required');
  console.log('\nTo get your Vercel token:');
  console.log('  1. Go to https://vercel.com/account/tokens');
  console.log('  2. Create a new token with log drain permissions');
  console.log('  3. Set it as VERCEL_TOKEN environment variable');
  process.exit(1);
}

// Convert DSN to envelope endpoint format
// DSN format: https://<key>@o<org-id>.ingest.de.sentry.io/<project-id> (or .sentry.io)
// Envelope format: https://o<org-id>.ingest.de.sentry.io/api/<project-id>/envelope/

function convertDSNToEnvelopeEndpoint(dsn) {
  // Match both .sentry.io and .de.sentry.io (or other regions)
  const match = dsn.match(/https:\/\/([^@]+)@o([0-9]+)\.ingest\.(?:de\.)?sentry\.io\/([0-9]+)/);
  if (!match) {
    throw new Error('Invalid Sentry DSN format. Expected: https://<key>@o<org-id>.ingest.sentry.io/<project-id>');
  }
  
  const [, , orgId, projectId] = match;
  const region = dsn.includes('.de.sentry.io') ? 'de.' : '';
  return `https://o${orgId}.ingest.${region}sentry.io/api/${projectId}/envelope/`;
}

const envelopeUrl = convertDSNToEnvelopeEndpoint(SENTRY_DSN);

// Calculate safe sampling rate (to stay under 5GB/month)
// Assumptions:
// - Average log entry: ~2KB
// - 5GB = 5,000MB = 5,000,000KB
// - 5,000,000KB / 2KB = 2,500,000 log entries/month max
// - For safety, target 4GB (80% of limit) = 2,000,000 entries/month
// - Conservative estimate: 30% sampling rate should be safe for most apps
// - Can be adjusted based on actual usage

const SAMPLING_RATE = 0.3; // 30% - conservative to stay well under 5GB/month

console.log('🚀 Setting up Sentry Log Drain for Vercel...\n');
console.log('Configuration:');
console.log(`  - Project ID: ${PROJECT_ID}`);
console.log(`  - Team ID: ${TEAM_ID}`);
console.log(`  - Sentry Endpoint: ${envelopeUrl}`);
console.log(`  - Sources: lambda, edge, static, build, external`);
console.log(`  - Environments: production`);
console.log(`  - Sampling Rate: ${(SAMPLING_RATE * 100).toFixed(0)}% (to stay under 5GB/month limit)\n`);
console.log('📊 Sampling Rate Calculation:');
console.log('  - Sentry Free Tier: 5GB logs/month');
console.log('  - Average log size: ~2KB');
console.log('  - Max entries: ~2,500,000/month');
console.log('  - Target: 4GB (80% of limit) = ~2,000,000 entries/month');
console.log('  - Sampling: 30% should be safe for most production apps');
console.log('  - Can be adjusted based on actual usage\n');

// Create log drain via Vercel API
// Note: For Sentry, we might need to set up through the dashboard instead
// as Sentry's endpoint doesn't support Vercel's x-vercel-verify header validation
const postData = JSON.stringify({
  name: 'Sentry Log Drain - disclosurely',
  url: envelopeUrl,
  deliveryFormat: 'ndjson',
  sources: ['lambda', 'edge', 'static', 'build', 'external'],
  environments: ['production'],
  projectIds: [PROJECT_ID],
  samplingRate: SAMPLING_RATE,
  // Try adding a secret to bypass verification (if supported)
  secret: 'sentry-log-drain-secret'
});

// Try using the standard log-drains endpoint (not integrations)
// This might not require the x-vercel-verify header validation
const options = {
  hostname: 'api.vercel.com',
  port: 443,
  path: `/v1/log-drains?teamId=${TEAM_ID}`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${VERCEL_TOKEN}`,
    'Content-Type': 'application/json',
    'Content-Length': postData.length
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      const response = JSON.parse(data);
      console.log('✅ Log drain created successfully!\n');
      console.log('Details:');
      console.log(`  - Drain ID: ${response.id}`);
      console.log(`  - Name: ${response.name}`);
      console.log(`  - URL: ${response.url}`);
      console.log(`  - Format: ${response.deliveryFormat}`);
      console.log(`  - Sources: ${response.sources.join(', ')}`);
      console.log(`  - Environments: ${response.environments?.join(', ') || 'all'}`);
      console.log(`  - Sampling Rate: ${(response.samplingRate * 100).toFixed(0)}%\n`);
      console.log('📊 Logs will start appearing in Sentry within a few minutes.');
      console.log('   Monitor your Sentry project to ensure logs are being received.\n');
      console.log('⚠️  Monitoring Tips:');
      console.log('   - Check Sentry dashboard for log volume');
      console.log('   - If approaching 5GB limit, reduce sampling rate');
      console.log('   - If well under limit, can increase sampling rate for better coverage');
      console.log('   - Current rate: 30% (conservative estimate)\n');
    } else {
      console.error('❌ Error creating log drain:');
      try {
        const error = JSON.parse(data);
        console.error(`  Status: ${res.statusCode}`);
        console.error(`  Message: ${error.error?.message || error.message || 'Unknown error'}`);
        if (error.error?.details) {
          console.error(`  Details:`, error.error.details);
        }
      } catch (e) {
        console.error(`  Status: ${res.statusCode}`);
        console.error(`  Response: ${data}`);
      }
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
  process.exit(1);
});

req.write(postData);
req.end();

