import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 users
    { duration: '1m', target: 10 },   // Stay at 10 users for 1 minute
    { duration: '30s', target: 50 },  // Ramp up to 50 users
    { duration: '2m', target: 50 },   // Stay at 50 users for 2 minutes
    { duration: '30s', target: 100 }, // Ramp up to 100 users
    { duration: '1m', target: 100 },  // Stay at 100 users for 1 minute
    { duration: '30s', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% of requests should be below 500ms, 99% below 1s
    http_req_failed: ['rate<0.01'],                  // Error rate should be less than 1%
    errors: ['rate<0.01'],
  },
};

// Get environment variables
const API_URL = __ENV.API_URL || 'http://localhost:54321';
const HEALTH_ENDPOINT = `${API_URL}/functions/v1/health-check`;

export default function () {
  // Make request to health check endpoint
  const response = http.get(HEALTH_ENDPOINT, {
    headers: {
      'Content-Type': 'application/json',
    },
    tags: { endpoint: 'health-check' },
  });

  // Validate response
  const checkResult = check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'response has status field': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.hasOwnProperty('status');
      } catch (e) {
        return false;
      }
    },
    'status is healthy': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.status === 'healthy';
      } catch (e) {
        return false;
      }
    },
  });

  // Track errors
  errorRate.add(!checkResult);

  // Log failed requests
  if (response.status !== 200) {
    console.error(`Request failed: ${response.status} - ${response.body}`);
  }

  // Random sleep between 1-3 seconds
  sleep(Math.random() * 2 + 1);
}

// Setup function runs once at the beginning
export function setup() {
  console.log(`Starting load test against: ${HEALTH_ENDPOINT}`);
}

// Teardown function runs once at the end
export function teardown(data) {
  console.log('Load test completed');
}
