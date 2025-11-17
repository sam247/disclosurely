import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const requestDuration = new Trend('custom_request_duration');
const totalRequests = new Counter('total_requests');

// Test configuration - Stress test with high load
export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Warm up
    { duration: '5m', target: 100 },  // Sustained load
    { duration: '2m', target: 200 },  // Stress level
    { duration: '5m', target: 200 },  // Stay at stress level
    { duration: '2m', target: 300 },  // Breaking point
    { duration: '5m', target: 300 },  // Stay at breaking point
    { duration: '2m', target: 0 },    // Recovery
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000', 'p(99)<3000'],
    http_req_failed: ['rate<0.1'],     // 10% error rate max under stress
    errors: ['rate<0.1'],
  },
};

// Get environment variables
const API_URL = __ENV.API_URL || 'http://localhost:54321';
const ANON_KEY = __ENV.ANON_KEY || '';

// Endpoint groups to test
const endpoints = {
  health: `${API_URL}/functions/v1/health-check`,
  cases: `${API_URL}/rest/v1/cases`,
  organizations: `${API_URL}/rest/v1/organizations`,
  profiles: `${API_URL}/rest/v1/profiles`,
};

export default function () {
  const headers = {
    'Content-Type': 'application/json',
    'apikey': ANON_KEY,
    'Authorization': `Bearer ${ANON_KEY}`,
  };

  // Test health check endpoint
  group('health_check', function () {
    const startTime = new Date();
    const response = http.get(endpoints.health, {
      headers: { 'Content-Type': 'application/json' },
      tags: { endpoint: 'health' },
    });

    const duration = new Date() - startTime;
    requestDuration.add(duration);
    totalRequests.add(1);

    const success = check(response, {
      'health: status 200': (r) => r.status === 200,
      'health: response < 1s': (r) => r.timings.duration < 1000,
    });

    errorRate.add(!success);
  });

  sleep(1);

  // Test database read operations
  group('database_reads', function () {
    const startTime = new Date();
    const response = http.get(
      `${endpoints.cases}?select=id,title,status&limit=10`,
      {
        headers,
        tags: { endpoint: 'cases-list' },
      }
    );

    const duration = new Date() - startTime;
    requestDuration.add(duration);
    totalRequests.add(1);

    const success = check(response, {
      'cases: status 200': (r) => r.status === 200,
      'cases: response < 2s': (r) => r.timings.duration < 2000,
      'cases: valid json': (r) => {
        try {
          JSON.parse(r.body);
          return true;
        } catch (e) {
          return false;
        }
      },
    });

    errorRate.add(!success);
  });

  sleep(1);

  // Test organization queries
  group('organization_queries', function () {
    const startTime = new Date();
    const response = http.get(
      `${endpoints.organizations}?select=id,name&limit=5`,
      {
        headers,
        tags: { endpoint: 'organizations-list' },
      }
    );

    const duration = new Date() - startTime;
    requestDuration.add(duration);
    totalRequests.add(1);

    const success = check(response, {
      'orgs: status 200': (r) => r.status === 200,
      'orgs: response < 1s': (r) => r.timings.duration < 1000,
    });

    errorRate.add(!success);
  });

  // Random sleep between requests
  sleep(Math.random() * 2 + 1);
}

export function setup() {
  console.log('='.repeat(60));
  console.log('Starting STRESS TEST');
  console.log('This test will push the system to its limits');
  console.log(`Target API: ${API_URL}`);
  console.log('='.repeat(60));

  if (!ANON_KEY) {
    console.warn('⚠️  Warning: ANON_KEY not set. Tests may fail.');
  }

  // Verify endpoints are accessible
  const healthCheck = http.get(endpoints.health);
  if (healthCheck.status !== 200) {
    console.error('❌ Health check failed. Aborting test.');
    throw new Error('Health check failed');
  }

  console.log('✅ Health check passed. Starting load test...\n');
}

export function teardown(data) {
  console.log('\n' + '='.repeat(60));
  console.log('STRESS TEST COMPLETED');
  console.log('='.repeat(60));
  console.log('Check the results above for performance metrics');
  console.log('Review error rates and response times under stress');
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'summary.json': JSON.stringify(data),
  };
}

function textSummary(data, options = {}) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;

  let summary = '\n' + indent + '=== Test Summary ===\n';

  if (data.metrics.http_req_duration) {
    summary += indent + `HTTP Request Duration:\n`;
    summary += indent + `  avg: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
    summary += indent + `  p(95): ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
    summary += indent + `  p(99): ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms\n`;
  }

  if (data.metrics.http_req_failed) {
    const failRate = (data.metrics.http_req_failed.values.rate * 100).toFixed(2);
    summary += indent + `Request Failure Rate: ${failRate}%\n`;
  }

  if (data.metrics.total_requests) {
    summary += indent + `Total Requests: ${data.metrics.total_requests.values.count}\n`;
  }

  return summary;
}
