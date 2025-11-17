# Load Testing with k6

This directory contains load testing scripts for the Disclosurely platform using [k6](https://k6.io/).

## Prerequisites

Install k6:
```bash
# macOS
brew install k6

# Linux
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Windows (with Chocolatey)
choco install k6
```

## Running Tests

```bash
# Run a specific test
k6 run load-tests/api-health.js

# Run with custom VUs (virtual users) and duration
k6 run --vus 50 --duration 30s load-tests/api-health.js

# Run with different stages
k6 run load-tests/stress-test.js

# Generate HTML report
k6 run --out json=test-results.json load-tests/api-health.js
# Then use: https://github.com/benc-uk/k6-reporter
```

## Test Scenarios

### 1. API Health Check (`api-health.js`)
Tests the health check endpoint with gradual load increase.

### 2. Report Submission (`report-submission.js`)
Simulates multiple users submitting anonymous reports.

### 3. Dashboard Load (`dashboard-load.js`)
Tests dashboard endpoints with authenticated users.

### 4. Stress Test (`stress-test.js`)
Comprehensive stress test across all critical endpoints.

## Environment Variables

Set these environment variables before running tests:

```bash
export API_URL=https://your-project.supabase.co
export ANON_KEY=your-supabase-anon-key
export SERVICE_ROLE_KEY=your-service-role-key (for authenticated tests)
```

## CI/CD Integration

Add to GitHub Actions:

```yaml
- name: Install k6
  run: |
    sudo gpg -k
    sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
    echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
    sudo apt-get update
    sudo apt-get install k6

- name: Run load tests
  run: k6 run --quiet load-tests/api-health.js
  env:
    API_URL: ${{ secrets.SUPABASE_URL }}
    ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

## Performance Benchmarks

Target performance metrics:
- **Response Time (p95)**: < 500ms
- **Response Time (p99)**: < 1000ms
- **Error Rate**: < 1%
- **Throughput**: > 100 req/s
