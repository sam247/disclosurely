import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { randomString, randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Custom metrics
const errorRate = new Rate('errors');
const reportCreationTime = new Trend('report_creation_time');

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 20 },   // Ramp up to 20 users
    { duration: '3m', target: 20 },   // Stay at 20 users for 3 minutes
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '2m', target: 50 },   // Stay at 50 users for 2 minutes
    { duration: '1m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<5000'], // Report submission can take longer
    http_req_failed: ['rate<0.05'],                   // 5% error rate max
    errors: ['rate<0.05'],
    report_creation_time: ['p(95)<3000'],
  },
};

// Get environment variables
const API_URL = __ENV.API_URL || 'http://localhost:54321';
const ANON_KEY = __ENV.ANON_KEY || '';

// Test data
const categories = [
  'Financial Misconduct',
  'Harassment',
  'Safety Violation',
  'Discrimination',
  'Ethics Violation',
  'Data Privacy',
  'Conflict of Interest'
];

const priorities = ['low', 'medium', 'high', 'critical'];

function generateReport() {
  return {
    title: `Load Test Report - ${randomString(10)}`,
    description: `This is a load test report created at ${new Date().toISOString()}. ${randomString(100)}`,
    category: randomItem(categories),
    priority: randomItem(priorities),
    anonymous: Math.random() > 0.5,
    metadata: {
      test: true,
      timestamp: new Date().toISOString(),
    }
  };
}

export default function () {
  const startTime = new Date();
  const report = generateReport();

  // Create anonymous report
  const response = http.post(
    `${API_URL}/rest/v1/cases`,
    JSON.stringify(report),
    {
      headers: {
        'Content-Type': 'application/json',
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
      },
      tags: { endpoint: 'create-report' },
    }
  );

  const duration = new Date() - startTime;
  reportCreationTime.add(duration);

  // Validate response
  const checkResult = check(response, {
    'status is 201': (r) => r.status === 201,
    'response time < 2000ms': (r) => r.timings.duration < 2000,
    'report created': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.hasOwnProperty('id') || Array.isArray(body);
      } catch (e) {
        return false;
      }
    },
  });

  // Track errors
  errorRate.add(!checkResult);

  // Log failed requests
  if (response.status !== 201) {
    console.error(`Report creation failed: ${response.status} - ${response.body}`);
  }

  // Random sleep between 2-5 seconds (simulating real user behavior)
  sleep(Math.random() * 3 + 2);
}

export function setup() {
  console.log('Starting report submission load test');
  if (!ANON_KEY) {
    console.warn('Warning: ANON_KEY not set. Tests may fail.');
  }
}

export function teardown(data) {
  console.log('Report submission load test completed');
  console.log('Note: You may want to clean up test reports from the database');
}
