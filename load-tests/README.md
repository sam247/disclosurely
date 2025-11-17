# Load Testing with k6

This directory contains k6 load testing scripts for Disclosurely. These tests help ensure the application can handle production-level traffic and identify performance bottlenecks.

## Prerequisites

1. Install k6:
   ```bash
   # macOS
   brew install k6

   # Linux
   sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
   echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
   sudo apt-get update
   sudo apt-get install k6

   # Windows
   choco install k6
   ```

2. Set environment variables:
   ```bash
   export API_URL="https://your-supabase-url.supabase.co"
   export ANON_KEY="your-anon-key-here"
   ```

## Available Tests

### 1. API Health Check Load Test
**File:** `api-health.js`  
**Purpose:** Tests basic API health endpoint under load

```bash
k6 run load-tests/api-health.js
```

**Load Profile:**
- Ramp: 10 → 50 → 100 users over 6 minutes
- Duration: ~6 minutes total
- Thresholds: p95 < 500ms, p99 < 1000ms, error rate < 1%

### 2. Report Submission Load Test
**File:** `report-submission.js`  
**Purpose:** Tests anonymous report creation under realistic load

```bash
k6 run load-tests/report-submission.js
```

**Load Profile:**
- Ramp: 20 → 50 users over 8 minutes
- Duration: ~8 minutes total
- Thresholds: p95 < 2000ms, p99 < 5000ms, error rate < 5%

**Note:** Creates test reports. Clean up afterward:
```sql
DELETE FROM cases WHERE metadata->>'test' = 'true';
```

### 3. Comprehensive Stress Test
**File:** `stress-test.js`  
**Purpose:** Push system to limits with multiple endpoints

```bash
k6 run load-tests/stress-test.js
```

**Load Profile:**
- Ramp: 50 → 100 → 200 → 300 users over 23 minutes
- Duration: ~23 minutes total
- Thresholds: p95 < 1000ms, p99 < 3000ms, error rate < 10%

## Running Tests

### Quick Start
```bash
# 1. Set environment
export API_URL="http://localhost:54321"
export ANON_KEY="your-anon-key"

# 2. Run health check
k6 run load-tests/api-health.js

# 3. Run full test suite
k6 run load-tests/report-submission.js
k6 run load-tests/stress-test.js
```

## Best Practices

1. **Start Small**: Begin with `api-health.js`
2. **Monitor**: Watch CPU, memory, database connections
3. **Clean Up**: Remove test data after tests
4. **Off-Peak**: Run stress tests during low-traffic periods

## Support

For issues: https://k6.io/docs/
